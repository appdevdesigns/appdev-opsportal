/**
 * OPImageUploadController
 *
 * @description :: Server-side logic for managing Opconfigareas
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var path = require("path");
var fs = require("fs");
var async = require("async");
var jimp = require("jimp");
var AD = require("ad-utils");

module.exports = {
   /*
    * @function create
    *
    * A system wide service to receive an image, store it locally, and send
    * back a uuid to reference this image.
    *
    * url:  	POST  /opsportal/image
    * header:  X-CSRF-Token : [token]
    * params:
    *			image	: the image you are uploading
    *			appKey	: a unique Application Key that this image belongs to
    *			permission : the PermissionAction.action_key required for a user
    *					  to access this file
    *			isWebix : {bool} should I format the response for a Webix Uploader?
    *			imageParam: {string} which parameter holds the file?
    *
    */
   create: function(req, res) {
      var params = ["appKey", "permission", "isWebix", "imageParam"];
      var requiredParams = ["appKey", "permission"];
      var options = {};

      var tempPath = destinationPath("tmp");
      var destPath = null;
      var fileEntry = null;
      var fileRef = null;
      var fileName = null;
      var uuid = null;

      async.series(
         [
            function(next) {
               sails.log.silly("--- OPImageUploadController.js: checkPath()");
               var basePath = sails.config.appPath;
               var pathToCheck = path.join(
                  sails.config.opsportal.opimageupload.basePath,
                  "tmp"
               );
               var pathParts = pathToCheck.split(path.sep);

               sails.log.silly(
                  "--- OPImageUploadController.js: pathToCheck:" + pathToCheck
               );

               function checkPath(parts, base, cb) {
                  if (parts.length == 0) {
                     cb();
                  } else {
                     var part = parts.shift();
                     base = path.join(base, part);
                     fs.stat(base, function(err, stat) {
                        if (err && err.code === "ENOENT") {
                           // create the directory!
                           sails.log.silly(
                              "--- making opimageupload path:" + base
                           );

                           fs.mkdir(base, function(err) {
                              if (err) cb(err);
                              else checkPath(parts, base, cb);
                           });
                        } else {
                           checkPath(parts, base, cb);
                        }
                     });
                  }
               }
               checkPath(pathParts, basePath, function(err) {
                  next(err);
               });
            },

            // 1) finish downloading the file
            function(next) {
               sails.log.silly(
                  "--- OPImageUploadController.js: finish downloading the File()"
               );
               req.file("image").upload(
                  {
                     // store the files in our TEMP path
                     dirname: tempPath,
                     maxBytes:
                        sails.config.opsportal.opimageupload.maxBytes ||
                        10000000
                  },
                  function(err, list) {
                     sails.log.silly(
                        "--- OPImageUploadController.js:    -> finished."
                     );

                     if (err) {
                        sails.log.error(
                           "--- OPImageUploadController.js:    -> had err:",
                           err
                        );

                        if (err.toString().indexOf("EACCES") != -1) {
                           sails.log.error(
                              "!!!! Apparently we dun have access permissions."
                           );
                        }
                        err.code = 500;
                        next(err);
                     } else {
                        fileEntry = list[0]; // info about file
                        fileRef = fileEntry.fd; // full path to file

                        next();
                     }
                  }
               );
            },

            // ) read in the parameters
            function(next) {
               sails.log.silly(
                  "--- OPImageUploadController.js: read in the parameters()"
               );

               params.forEach(function(p) {
                  options[p] = req.param(p) || "??";
               });
               // console.log('... options:', options);

               var missingParams = [];
               requiredParams.forEach(function(r) {
                  if (options[r] == "??") {
                     missingParams.push(r);
                  }
               });

               if (missingParams.length > 0) {
                  sails.log.error(
                     "OPImageUploadController: Missing Parameter(s):",
                     missingParams
                  );
                  var error = ADCore.error.fromKey("E_MISSINGPARAM");
                  error.missingParams = missingParams;
                  error.code = 422;
                  next(error);
                  return;
               }

               destPath = destinationPath(options.appKey);
               next();

               // get the parameter of our image
               // default : 'image'
               //   	var paramImage = 'image';  // look for the file under 'image'
               // if (options.imageParam != '??') {
               // 	paramImage = options.imageParam
               // }
            },

            // 1) make sure destination directory exists:
            function(next) {
               sails.log.silly(
                  "--- OPImageUploadController.js: make sure destination directory exists"
               );
               fs.stat(destPath, function(err, stat) {
                  if (err && err.code === "ENOENT") {
                     // create the directory!
                     sails.log.silly(
                        "---making opimageupload path:" + destPath
                     );

                     fs.mkdir(destPath, function(err) {
                        if (err) err.code = 500;
                        next(err);
                     });
                  } else {
                     sails.log.silly(
                        "--- OPImageUploadController.js: directory EXISTS!"
                     );

                     next();
                  }
               });
            },

            // 3) get jimp to auto rotate file based upon EXIF info:
            //    and also save it in our destination folder:
            function(next) {
               sails.log.silly("--- OPImageUploadController.js: jimp rotate");

               // fileRef:  the current file location
               // destRef:  where we want it to be:
               fileName = fileRef.split(path.sep).pop();
               var destRef = path.join(destPath, fileName);

               jimp
                  .read(fileRef)
                  .then(function(image) {
                     image.quality(80).write(destRef, function(err) {
                        if (err) {
                           err.code = 500;
                           next(err);
                        } else {
                           next();
                        }
                     });
                  })
                  .catch(function(err) {
                     err.code = 500;
                     next(err);
                  });
            },

            // remove our Temp file
            function(next) {
               fs.unlink(fileRef, function(err) {
                  next(err);
               });
            },

            // 4) Save our OPImageUpload values:
            function(next) {
               sails.log.silly(
                  "--- OPImageUploadController.js: save OPImageUpload values"
               );
               // uuid : the fileName without '.ext'
               uuid = fileName.split(".")[0];

               OPImageUpload.create({
                  uuid: uuid,
                  app_key: options.appKey,
                  permission: options.permission,
                  image: fileName,
                  size: fileEntry.size,
                  type: fileEntry.type
               })
                  .then(function() {
                     next();
                  })
                  .catch(function(err) {
                     err.code = 500;
                     next(err);
                  });
            }
         ],
         function(err, results) {
            if (err) {
               res.AD.error(err, err.code);
            } else {
               sails.log.silly(
                  "--- OPImageUploadController.js: return response"
               );
               // prepare our return data
               // { uuid: 'as;dlkfaslkdfjasdl;kfj' }
               var data = {
                  uuid: uuid
               };

               // if this was a Webix uploader:
               if (
                  options.isWebix != "??" &&
                  options.isWebix != "false" &&
                  options.isWebix != false
               ) {
                  data.status = "server";
               }

               res.AD.success(data);
            }
         }
      );
   },

   /*
    * @function createBase64
    *
    * A system wide service to receive an image, store it locally, and send
    * back a uuid to reference this image.
    *
    * url:  	POST  /opsportal/imageBase64
    * header:  X-CSRF-Token : [token]
    * params:
    *			image	: the image you are uploading
    *			appKey	: a unique Application Key that this image belongs to
    *			permission : the PermissionAction.action_key required for a user
    *					  to access this file
    *			isWebix : {bool} should I format the response for a Webix Uploader?
    *			imageParam: {string} which parameter holds the file?
    *
    */
   createBase64: function(req, res) {
      var params = ["appKey", "permission", "isWebix", "imageParam"];
      var requiredParams = ["appKey", "permission"];
      var options = {};

      var tempPath = destinationPath("tmp");
      var destPath = null;
      var fileEntry = null;
      var fileSize = null;
      var fileRef = null;
      var fileName = null;
      var uuid = null;

      async.series(
         [
            // 1) read in the parameters
            function(next) {
               sails.log.silly(
                  "--- OPImageUploadController.js: read in the parameters()"
               );

               params.forEach(function(p) {
                  options[p] = req.param(p) || "??";
               });
               // console.log('... options:', options);

               var missingParams = [];
               requiredParams.forEach(function(r) {
                  if (options[r] == "??") {
                     missingParams.push(r);
                  }
               });

               if (missingParams.length > 0) {
                  sails.log.error(
                     "OPImageUploadController: Missing Parameter(s):",
                     missingParams
                  );
                  var error = ADCore.error.fromKey("E_MISSINGPARAM");
                  error.missingParams = missingParams;
                  error.code = 422;
                  next(error);
                  return;
               }

               destPath = destinationPath(options.appKey);
               fileName = AD.util.uuid();
               next();
            },

            // 2) make sure destination directory exists:
            function(next) {
               sails.log.silly(
                  "--- OPImageUploadController.createBase64(): make sure destination directory exists"
               );
               fs.stat(destPath, function(err, stat) {
                  if (err && err.code === "ENOENT") {
                     // create the directory!
                     sails.log.silly(
                        "---making opimageupload path:" + destPath
                     );

                     fs.mkdir(destPath, function(err) {
                        if (err) err.code = 500;
                        next(err);
                     });
                  } else {
                     sails.log.silly(
                        "--- OPImageUploadController.createBase64(): directory EXISTS!"
                     );

                     next();
                  }
               });
            },

            // 3) Save File Contents to Disk:
            function(next) {
               // image data sent as base64 encoded text field: .image:
               var imageB64 = req.param("image");
               var binaryData = new Buffer(imageB64, "base64");

               tempPath = path.join(tempPath, fileName);
               fileSize = binaryData.length;

               fs.writeFile(tempPath, binaryData, (err) => {
                  if (err) {
                     ADCore.error.log(
                        "OPImageUploadController.createBase64(): unable to write to file [" +
                           tempPath +
                           "]",
                        { error: err, filePath: tempPath }
                     );
                     err.code = 500;
                     next(err);
                  }
                  fileRef = tempPath;
                  next();
               });
            },

            // 4) get jimp to auto rotate file based upon EXIF info:
            //    and also save it in our destination folder:
            function(next) {
               sails.log.silly(
                  "--- OPImageUploadController.createBase64(): jimp rotate"
               );

               // fileRef:  the current file location
               // destRef:  where we want it to be:
               fileName = fileRef.split(path.sep).pop();
               fileName += ".jpg";
               var destRef = path.join(destPath, fileName);

               jimp
                  .read(fileRef)
                  .then(function(image) {
                     image.quality(80).write(destRef, function(err) {
                        if (err) {
                           ADCore.error.log(
                              "OPImageUploadController.createBase64(): jimp: error writing file [" +
                                 destRef +
                                 "]",
                              { error: err, fileRef: fileRef, destRef: destRef }
                           );
                           err.code = 500;
                           next(err);
                        } else {
                           next();
                        }
                     });
                  })
                  .catch(function(err) {
                     ADCore.error.log(
                        "OPImageUploadController.createBase64(): jimp: error manipulating file [" +
                           fileRef +
                           "]",
                        { error: err, fileRef: fileRef, destRef: destRef }
                     );
                     err.code = 500;
                     next(err);
                  });
            },

            // 5) Save our OPImageUpload values:
            function(next) {
               sails.log.silly(
                  "--- OPImageUploadController.createBase64(): save OPImageUpload values"
               );
               // uuid : the fileName without '.ext'
               uuid = fileName.split(".")[0];

               OPImageUpload.create({
                  uuid: uuid,
                  app_key: options.appKey,
                  permission: options.permission,
                  image: fileName,
                  size: fileSize,
                  type: "image/jpeg" // ?? : What do we put here? -> for now assume a .jpg file
               })
                  .then(function() {
                     next();
                  })
                  .catch(function(err) {
                     ADCore.error.log(
                        "OPImageUploadController.createBase64(): OPImageUpload.create(): error creating image DB entry",
                        { error: err }
                     );
                     err.code = 500;
                     next(err);
                  });
            }
         ],
         function(err, results) {
            if (err) {
               // let's not store the image in the logs:
               delete options.image;

               ADCore.error.log(
                  "OPImageUploadController.createBase64(): Error saving image",
                  {
                     error: err,
                     options: options,
                     tempPath: tempPath,
                     destPath: destPath
                  }
               );
               res.AD.error(err, err.code);
            } else {
               sails.log.silly(
                  "--- OPImageUploadController.js: return response"
               );
               // prepare our return data
               // { uuid: 'as;dlkfaslkdfjasdl;kfj' }
               var data = {
                  uuid: uuid
               };

               // if this was a Webix uploader:
               if (
                  options.isWebix != "??" &&
                  options.isWebix != "false" &&
                  options.isWebix != false
               ) {
                  data.status = "server";
               }

               res.AD.success(data);
            }
         }
      );
   },

   /*
    * @function read
    *
    * A system wide service to return an image
    *
    * url:  	GET  /opsportal/image/:appKey/:uuid
    * header:  X-CSRF-Token : [token]
    * params:
    *			uuid	: the unique reference for the image (was returned to you when you stored it)
    *			appKey	: a unique Application Key that this image belongs to
    *
    */
   read: function(req, res) {
      var params = ["appKey", "uuid"];
      var options = {};
      params.forEach(function(p) {
         options[p] = req.param(p) || "??";
      });

      var missingParams = [];
      params.forEach(function(r) {
         if (options[r] == "??") {
            missingParams.push(r);
         }
      });

      if (missingParams.length > 0) {
         var error = ADCore.error.fromKey("E_MISSINGPARAM");
         error.missingParams = missingParams;
         res.AD.error(error, 422); // 422 for missing parameters ? (http://stackoverflow.com/questions/3050518/what-http-status-response-code-should-i-use-if-the-request-is-missing-a-required)
         return;
      }

      var destDir = null;
      var destFile = null;
      var image = null;

      async.series(
         [
            // 1) lookup OPImageUpload by uuid
            function(next) {
               OPImageUpload.find({
                  uuid: options.uuid
               })
                  .then(function(opImage) {
                     console.log("opImage:", opImage);
                     if (opImage.length == 0) {
                        var err = ADCore.error.fromKey("E_NOTFOUND");
                        err.code = 404;
                        next(err);
                        return;
                     }

                     image = opImage[0];
                     next();
                  })
                  .catch(function(err) {
                     err.code = 500;
                     next(err);
                  });
            },

            // 2) verify user currently has permission to access the image

            // 3) verify file exists
            function(next) {
               destDir = destinationPath(image.app_key);
               destFile = path.join(destDir, image.image);

               fs.access(destFile, fs.constants.R_OK, function(err) {
                  if (err) {
                     var nError = new Error("cannot access image file.");
                     nError.code = 500;
                     nError.err = err;
                     console.error(
                        "... OPImageUploadController.read(): cannot access image file:" +
                           destFile
                     );
                     next(nError);
                  } else {
                     next();
                  }
               });
            }
         ],
         function(err, results) {
            if (err) {
               res.AD.error(err, err.code);
            } else {

                // Define the file type
                if (image && image.type)
                    res.setHeader('Content-Type', image.type);

               // stream file to response on success
               fs.createReadStream(destFile)
                  .on("error", function(err) {
                     return res.AD.error(err, 500);
                  })
                  .pipe(res);
            }
         }
      );
   },

   /*
    * @function readBase64
    *
    * A system wide service to return an image using Base64 encoding.
    *
    * url:  	GET  /opsportal/imageBase64/:appKey/:uuid
    * header:  X-CSRF-Token : [token]
    * params:
    *			uuid	: the unique reference for the image (was returned to you when you stored it)
    *			appKey	: a unique Application Key that this image belongs to
    *
    */
   readBase64: function(req, res) {
      var params = ["appKey", "uuid", "isMobile"];
      var options = {};
      params.forEach(function(p) {
         // check if image is a mobile request
         if (p == "isMobile") {
            options[p] = Boolean(req.param(p) && req.param(p) == "true");
         } else {
            options[p] = req.param(p) || "??";
         }
      });

      var missingParams = [];
      params.forEach(function(r) {
         if (options[r] == "??") {
            missingParams.push(r);
         }
      });

      if (missingParams.length > 0) {
         var error = ADCore.error.fromKey("E_MISSINGPARAM");
         error.missingParams = missingParams;
         res.AD.error(error, 422); // 422 for missing parameters ? (http://stackoverflow.com/questions/3050518/what-http-status-response-code-should-i-use-if-the-request-is-missing-a-required)
         return;
      }

      var destDir = null;
      var destFile = null;
      var image = null;
      var createMobileRender = false;

      async.series(
         [
            // 1) lookup OPImageUpload by uuid
            function(next) {
               OPImageUpload.find({
                  uuid: options.uuid
               })
                  .then(function(opImage) {
                     console.log("opImage:", opImage);
                     if (opImage.length == 0) {
                        var err = ADCore.error.fromKey("E_NOTFOUND");
                        err.code = 404;
                        next(err);
                        return;
                     }

                     image = opImage[0];
                     next();
                  })
                  .catch(function(err) {
                     err.code = 500;
                     next(err);
                  });
            },

            // 2) verify file exists
            function(next) {
               destDir = destinationPath(image.app_key);
               // check if is a mobile fetch and file size is bigger than 2.5 MB
               if (options.isMobile && image.size > 1.75 * 1000 * 1000) {
                  // if so look for a mobile render
                  destFile = path.join(destDir, "mobile_" + image.image);
               } else {
                  destFile = path.join(destDir, image.image);
               }

               fs.access(destFile, fs.constants.R_OK, function(err) {
                  if (err) {
                     if (options.isMobile) {
                        console.log(
                           "Cannot find mobile render, lets create one"
                        );
                        createMobileRender = true;
                        next();
                     } else {
                        var nError = new Error("cannot access image file.");
                        nError.code = 500;
                        nError.err = err;
                        console.error(
                           "... OPImageUploadController.readBase64(): cannot access image file:" +
                              destFile
                        );
                        next(nError);
                     }
                  } else {
                     next();
                  }
               });
            },
            // 3) render a new mobile image if requested
            function(next) {
               // if last process tells us to create a mobile render..then do it
               if (createMobileRender) {
                  // see if original file is available
                  var origFile = path.join(destDir, image.image);
                  jimp
                     .read(origFile)
                     .then((image) => {
                        image
                           .scaleToFit(2000, 2000, jimp.RESIZE_BEZIER)
                           .quality(80)
                           .write(destFile, function(err) {
                              if (err) {
                                 ADCore.error.log(
                                    "OPImageUploadController.createBase64(): jimp: error resize/writing file [" +
                                       destFile +
                                       "]",
                                    { error: err, destFile: destFile }
                                 );
                                 err.code = 500;
                                 next(err);
                              } else {
                                 next();
                              }
                           });
                     })
                     .catch((err) => {
                        ADCore.error.log(
                           "OPImageUploadController.createBase64(): jimp: error reading file [" +
                              destFile +
                              "]",
                           { error: err, destFile: destFile }
                        );
                        err.code = 500;
                        next(err);
                     });
               } else {
                  next();
               }
            }
         ],
         function(err, results) {
            if (err) {
               res.AD.error(err, err.code);
            } else {
               fs.readFile(destFile, function(err, data) {
                  if (err) {
                     return res.AD.error(err, 500);
                  }

                  var base64Data = new Buffer(data, "binary").toString(
                     "base64"
                  );
                  return res.AD.success({ image: base64Data });
               });
            }
         }
      );
   }
};

//
// Helper Fn()
//
function destinationPath(appKey) {
   // in case settings are not set ...
   sails.config.opsportal.opimageupload =
      sails.config.opsportal.opimageupload || {};
   sails.config.opsportal.opimageupload.basePath =
      sails.config.opsportal.opimageupload.basePath ||
      path.join("data", "opimageupload");

   return path.join(
      sails.config.appPath,
      sails.config.opsportal.opimageupload.basePath,
      appKey
   );
}
