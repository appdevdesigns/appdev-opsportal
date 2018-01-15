/**
 * Bootstrap
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#documentation
 */
var path = require('path');
var AD = require('ad-utils');
var async = require('async');
var fs = require('fs');

module.exports = function (cb) {

    // handle our common bootstrap setup instructions:
        // - verify permissions are created
        // - verify opsportal tool definitions are defined.
    AD.module.bootstrap(__dirname, function(err) {

        if (err) cb(err);
        else {

            // Now make sure our OPImage and OPFile paths are read/writeable
            var pathsToCheck = [
                sails.config.opsportal.opimageupload.basePath,
                sails.config.opsportal.opfileupload.basePath
            ];

            function checkPath(list, done) {

                if (list.length == 0) {
                    done();
                } else {
                    var currPath = list.shift();

                    sails.log.info( '... checking required path:'+currPath);
                    fs.access(path.join(sails.config.appPath, currPath), fs.constants.R_OK | fs.constants.W_OK, function(err){
                        
                        // if no error, then everything is fine and continue on.
                        if(!err) {
                            checkPath(list, done);
                        } else {

                            sails.log.error("!! Unable to access a required path: "+currPath);
                            sails.log.error("... be sure running process has read/write permissions");
                            done(err);
                        }
                    })

                }

            }
            checkPath(pathsToCheck, function(err){
                cb(err);
            })

        }

    });

    // cause our navigation cache to flush on the following events:
    // ADCore.queue.subscribe(OPSPortal.Events.NAV_STALE, function(message, data){
    //     OPSPortal.NavBar.cache.flush();
    // });
    function flushNavBar () {
        OPSPortal.NavBar.cache.flush();

        // FIX: sometimes sails is lifted for testing without socket support  
        if (sails.sockets) {
            sails.sockets.blast(OPSPortal.Events.NAV_STALE, {update:true});
        }
    }

    function updateNavEditor () {
        
        // FIX: sometimes sails is lifted for testing without socket support
        if (sails.sockets) {
            sails.sockets.blast(OPSPortal.Events.NAV_EDIT_STALE, {update:true});
        }
    }

    ADCore.queue.subscribe(OPSPortal.Events.NAV_STALE,      flushNavBar);
    ADCore.queue.subscribe(OPSPortal.Events.PERM_STALE,     flushNavBar);
    ADCore.queue.subscribe(OPSPortal.Events.NAV_EDIT_STALE, updateNavEditor);

};
