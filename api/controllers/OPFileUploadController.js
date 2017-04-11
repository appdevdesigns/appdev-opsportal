/**
 * OPFileUploadController
 *
 * @description :: Server-side logic for managing Opconfigareas
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var path = require('path');
var fs = require('fs');
var async = require('async');
var jimp = require('jimp');


function createPath (parts, base, cb) {
	if (parts.length == 0) {
		cb();
	} else {
		var part = parts.shift();
		base = path.join(base, part);
		fs.stat(base, function(err,stat) {

			if (err && err.code === 'ENOENT') {

		// create the directory!
console.log('--- making opfileupload path:'+base);

				fs.mkdir(base, function(err){

					if (err) cb(err) 
					else createPath(parts, base, cb);
				})

			} else {

				createPath(parts, base, cb);
			}

		})
	}
}



module.exports = {


	/*
	 * @function create
	 *
	 * A system wide service to receive a file, store it locally, and send 
	 * back a uuid to reference this file.
	 *
	 * url:  	POST  /opsportal/file
	 * header:  X-CSRF-Token : [token]
	 * params:
	 *			file	: the image you are uploading
	 *			appKey	: a unique Application Key that this image belongs to
	 *			permission : the PermissionAction.action_key required for a user
	 *					  to access this file
	 *			isWebix : {bool} should I format the response for a Webix Uploader?
	 */
    create:function(req, res) {


    	var params = [ 'appKey', 'permission', 'isWebix'];
    	var requiredParams = [ 'appKey', 'permission'];
    	var options = {};


    	var tempPath = destinationPath('tmp');
		var destPath = null; 
		var fileEntry = null;
		var fileRef  = null;
		var fileName = null;
		var uuid     = null;

		async.series([

			// 1) verify our base path for downloads exists:
			function(next) {
				var basePath = sails.config.appPath;
				var pathToCheck = path.join(sails.config.opsportal.opfileupload.basePath, 'tmp');
				var pathParts = pathToCheck.split(path.sep);
				
				createPath(pathParts, basePath, function(err) {
					next(err);
				});
			},


			// 2) finish downloading the file
			function(next) {
				req.file('file').upload({

					// store the files in our TEMP path
					dirname : tempPath,
					maxBytes: sails.config.opsportal.opimageupload.maxBytes || 10000000

				}, function(err, list){

					if (err) {
						err.code = 500;
						next(err);
					} else {

						fileEntry = list[0];    // info about file
console.log('... fileEntry:', fileEntry);

						if (fileEntry) {
							fileRef = fileEntry.fd; // full path to file
							next();
						} else {
							var err = new Error('No file uploaded for parameter [file]');
							err.code = 422;
							next(err);
						}

					}
				})
			},


			// 3) read in the parameters
			function(next) {

		    	params.forEach(function(p){
		    		options[p] = req.param(p) || '??';
		    	})
// console.log('... options:', options);

		    	var missingParams = [];
		    	requiredParams.forEach(function(r){
		    		if (options[r] == '??') {
		    			missingParams.push(r);
		    		}
		    	})

		    	if (missingParams.length > 0) {
console.log('... missingParams:', missingParams);
		    		var error = ADCore.error.fromKey('E_MISSINGPARAM');
		    		error.missingParams = missingParams;
		    		error.code = 422;
		    		next(error)
		    		return;
		    	} 

		    	next();
			},


			// 4) make sure destination directory exists:
			function(next) {

				destPath = destinationPath(options.appKey);
				fs.stat(destPath, function(err, stat){
					if (err && err.code === 'ENOENT') {

						// create the directory!
console.log('---making opimageupload path:'+destPath);

						fs.mkdir(destPath, function(err){
							if (err) err.code = 500;
							next(err);
						})

					} else {

						next();
					}
				})
			},


			// 5) move our Temp file to the destination path:
			function(next){

				fileName = fileRef.split(path.sep).pop();
				var newPath = path.join(destPath, fileName);
				fs.rename(fileRef, newPath, function(err){
					next(err);
				});
			},


			// 6) Save our OPFileUpload values:
			function(next) {

				var currUser = req.AD.user();  // the ADCore.User

				// uuid : the fileName without '.ext'
				uuid = fileName.split('.')[0];

				OPFileUpload.create({
					uuid:uuid, 
					appKey:options.appKey, 
					permission:options.permission, 
					file:fileName,
					pathFile:destPath,
					size: fileEntry.size,
					type: fileEntry.type,
					info: fileEntry,
					uploadedBy: currUser.id()
				})
				.then(function(){
					next();
				})
				.catch(function(err){
					err.code = 500;
					next(err);
				})
			}

		], function(err, results){

			if (err) {
				res.AD.error(err, err.code);
			} else {

				// prepare our return data
				// { uuid: 'as;dlkfaslkdfjasdl;kfj' }
				var data = { 
					uuid : uuid
				}

				// if this was a Webix uploader:
				if ((options.isWebix != "??") 
					&& (options.isWebix != 'false')
					&& (options.isWebix != false)) {

					data.status = 'server';					
				}

				res.AD.success(data);

			}
		})

    },


	/*
	 * @function read
	 *
	 * A system wide service to return a file
	 *
	 * url:  	GET  /opsportal/file/:appKey/:uuid
	 * header:  X-CSRF-Token : [token]
	 * params:
	 *			uuid	: the unique reference for the file (was returned to you when you stored it)
	 *			appKey	: a unique Application Key that this image belongs to
	 *
	 */
    read:function(req, res) {

    	var params = [ 'appKey', 'uuid'];
    	var options = {};
    	params.forEach(function(p){
    		options[p] = req.param(p) || '??';
    	})

    	var missingParams = [];
    	params.forEach(function(r){
    		if (options[r] == '??') {
    			missingParams.push(r);
    		}
    	})

    	if (missingParams.length > 0) {

    		var error = ADCore.error.fromKey('E_MISSINGPARAM');
    		error.missingParams = missingParams;
    		res.AD.error(error, 422);  // 422 for missing parameters ? (http://stackoverflow.com/questions/3050518/what-http-status-response-code-should-i-use-if-the-request-is-missing-a-required)
    		return;
    	}

    	var destDir  = null;
    	var destFile = null;
    	var file     = null;

    	async.series([

    		// 1) lookup OPImageUpload by uuid
    		function(next) {

    			OPFileUpload.find({
					uuid:options.uuid
				})
				.then(function(opFile){
console.log('opFile:', opFile);
					if (opFile.length == 0) {

						var err = ADCore.error.fromKey('E_NOTFOUND');
						err.code = 404;
						next(err);
						return;
					}

					file = opFile[0];
					next();
				})
				.catch(function(err){
					err.code = 500;
					next(err);
				})
    		},

    		// 2) verify user currently has permission to access the image

    		// 3) verify file exists
    		function(next) {

    			destDir = destinationPath(file.appKey);
    			destFile = path.join(destDir, file.file);

    			fs.access(destFile, fs.constants.R_OK , function(err) {
					if (err) {
						var nError = new Error('cannot access file.');
						nError.code = 500;
						nError.error = err;
console.error(' cannot access file: '+destFile);
						next(nError);
					} else {
						next();
					}
				});
    		}

    	], function(err, results){

    		if (err) {
    			res.AD.error(err, err.code);
    		} else {

    			// stream file to response on success
				fs.createReadStream(destFile)
			    .on('error', function (err) {
			      return res.AD.error(err, 500);
			    })
			    .pipe(res);
    		}
    		
    	})

    }
	
};


//
// Helper Fn()
// 
function destinationPath(appKey) {

	// in case settings are not set ...
	sails.config.opsportal.opfileupload = sails.config.opsportal.opfileupload || {};
	sails.config.opsportal.opfileupload.basePath = sails.config.opsportal.opfileupload.basePath || path.join('data', 'opfileupload');

	var pathBase = sails.config.opsportal.opfileupload.basePath;
	return path.join(sails.config.appPath, pathBase, appKey);
}

