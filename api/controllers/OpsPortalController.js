/**
 * OpsPortalConfigController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

var fs = require("fs");
var path = require("path");
var crypto = require("crypto");

var AD = require("ad-utils");
var GitHubApi = require("github");

module.exports = {
   /**
    * Overrides for the settings in `config/controllers.js`
    * (specific to OpsPortalConfigController)
    */

   _config: {},

   /**
    * get /opsportal/config
    *
    * returns the JSON description of the OPs Portal layout
    * for the current user.
    *
    * the actual JSON is compiled in the policy:
    * api/policies/OpsPortalUserConfig.js and stored in res.appdev.opsportalconfig
    */
   config: function(req, res) {
      ADCore.comm.success(res, res.appdev.opsportalconfig);
   },

   /**
    * get /opsportal/confighash
    *
    * returns the config hash of the OPs Portal layout
    * for the current user.
    *
    * the actual JSON is compiled in the policy:
    * api/policies/OpsPortalUserConfigHash.js and stored in res.appdev.opsportalconfighash
    */
   configHash: function(req, res) {
      ADCore.comm.success(res, res.appdev.opsportalconfighash);
   },

   /**
    * get /opsportal/requirements
    *
    * returns a list of controllers that need to be loaded by the OpsPortal
    *
    * the user's opstools needed is compiled in the policy:
    * api/policies/OpsPortalUserConfig.js and stored in
    * res.appdev.opsportalconfig
    *
    * Here we parse out the controllers that need to load and return
    * them as a series of controller names.
    *
    * @param {array} ignore  an array of controller names that should be skipped
    *                (most likely they are already loaded.)
    */
   requirements: function(req, res) {
      res.setHeader("content-type", "application/javascript");

      var ignoreList = req.param("ignore") || [];

      //// tools will be gathered from config/opsportal.js
      //// and matched against a user's permissions.

      // NOTE: api/policies/OpsPortalUserConfig.js
      // compiles this information into res.appdev.opsportalconfig

      /*
            var tools = [
                         'HrisAdminObjects'
                         ];
      */
      var tools = [];
      var data = res.appdev.opsportalconfig;
      for (var d = 0; d < data.tools.length; d++) {
         var c = data.tools[d];

         if (c.isController) {
            // if this controller hasn't been given before
            if (ignoreList.indexOf(c.controller) == -1) {
               tools.push(c.controller);
            }
         }
      }

      // Special Requirement: OPNavEdit
      // if the user has permission to access opsportal.opnavedit.view
      // also load the OPNavEdit controller.
      if (req.AD.user().hasPermission("opsportal.opnavedit.view")) {
         if (ignoreList.indexOf("OPNavEdit") == -1) {
            tools.push("OPNavEdit");
         }
      }

      res.AD.success({
         environment: sails.config.environment,
         listTools: tools
      });
   },

   /**
    * @function registerSocket
    *
    * simply calling this service using a socket connection will
    * register the current socket connection with this session.
    *
    * NOTE: the actual work happens in the policy: ADCore/api/policy/initSession.js
    */
   registerSocket: function(req, res) {
      var id = ADCore.socket.id(req);
      if (id) {
         AD.log("<green>registered:</green> socket.id:" + id);
      } else {
         AD.log("<yellow>warn:</yellow> socket.id not registered. ");
      }
      res.AD.success({ session: "registered" });
      // ADCore.comm.success(res, { session:'registered'});
   },

   /**
    * POST /opsportal/feedback
    *
    * This is the back end for the Feedback widget, which will submit the
    * feedback as a GitHub issue.
    */
   feedback: function(req, res) {
      // Settings
      var imageBasePath = sails.config.opsportal.feedback.imageBasePath;
      var imageBaseURL = sails.config.opsportal.feedback.imageBaseURL;
      var githubUsername = sails.config.opsportal.feedback.githubUsername;
      var githubPassword = sails.config.opsportal.feedback.githubPassword;
      var githubRepo = sails.config.opsportal.feedback.githubRepo;
      var githubOwner = sails.config.opsportal.feedback.githubOwner;

      // Data submitted by the Feedback widget
      var feedback = req.param("feedback");
      var data;
      if (typeof feedback == "string") {
         // JSON string not yet parsed
         try {
            data = JSON.parse(feedback);
         } catch (err) {
            console.log("Invalid feedback format", err, feedback);
            res.status(400);
            res.send(err);
            return;
         }
      } else if (
         // JSON string was parsed by sails
         typeof feedback == "object" &&
         feedback.browser &&
         feedback.img
      ) {
         data = feedback;
      } else {
         console.log("Invalid feedback format", feedback);
         res.status(400);
         res.send(new Error("Invalid feedback format"));
         return;
      }

      var github = new GitHubApi({
         version: "3.0.0"
      });
      github.authenticate({
         type: "basic",
         username: githubUsername,
         password: githubPassword
      });

      var html = "";

      async.series(
         [
            // Save image to file system
            function(next) {
               var png = data.img.replace(/^data:image\/png;base64,/, "");
               var filename, filepath;

               var generateName = function() {
                  filename =
                     "feedback-" +
                     crypto.randomBytes(32).toString("hex") +
                     ".png";
                  filepath = path.join(imageBasePath, filename);
                  // Keep generating random names until we get a unique one
                  fs.exists(filepath, function(exists) {
                     if (exists) generateName();
                     else {
                        generated();
                     }
                  });
               };

               var generated = function() {
                  data.imageURL = path.join(imageBaseURL, filename);
                  fs.writeFile(filepath, png, "base64", next);
               };

               generateName();
            },

            // Render feedback HTML
            function(next) {
               data.guid = req.user.GUID();
               data.locals = {};
               data.layout = false;

               sails.renderView(
                  "appdev-opsportal/opsportal/feedback",
                  data,
                  function(err, rendered) {
                     if (err) return next(err);
                     html = rendered;
                     next();
                  }
               );
            },

            // Post feedback issue to GitHub
            function(next) {
               var title = "Feedback";
               // Use the first 40 chars of the first sentence.
               var beginning = data.note.trim().match(/^[\w\s]{1,40}/i);
               if (beginning) {
                  title = beginning[0];
               }

               github.issues.create(
                  {
                     repo: githubRepo,
                     user: githubOwner,
                     title: title,
                     body: html
                  },
                  function(err) {
                     if (err) return next(err);
                     next();
                  }
               );
            }
         ],
         function(err) {
            if (err) {
               console.log(err);
               res.status(500);
               res.send(err);
            } else {
               res.send("1");
            }
         }
      );
   },

   /**
    * GET /opsportal/view/:key
    *
    * Return the json view definition for an OPTool view.
    */
   view: function(req, res) {
      var key = req.param("key");

      OPView.findOne({ key: key })
         .then(function(view) {
            if (view) {
               var data = {
                  objects: view.objects,
                  controller: view.controller
               };

               res.AD.success(data);
            } else {
               res.AD.error("View not found.", 404);
            }
            return null;
         })
         .catch(function(err) {
            ADCore.error.log("Error looking up OPView", {
               error: err,
               key: key
            });
            res.AD.error(err);
         });
      /*
    var data = {
      objects:[
          { key:'opstool.Application.MobileDonor', path:'opstool/Application/models/MobileDonor.js'},
          { key:'opstool.Application.projects',    path:'opstool/Application/models/projects.js'}
      ],
      controller:[
          { key:'opstool.Application.TestApp',     path:'opstool/Application/controllers/TestApp.js'}
      ]
    }
*/
      // res.AD.success(data);
   }
};
