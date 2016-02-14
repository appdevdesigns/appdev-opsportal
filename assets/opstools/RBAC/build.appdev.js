/*
 * build.appdev.js
 *
 * This file is intended to be used by the appdev build command line tool.
 *
 * This file exports the actual command() to run when trying to build this 
 * application/widget.
 *
 * Create your command() to run from the [root]/assets  directory.
 *
 */


var AD = require('ad-utils');
var path = require('path');
var async = require('async');
var fs = require('fs');
var transform = require("steal-tools").transform;


module.exports = {

    /* 
     * command()
     *
     * This is the actual command to execute.
     * 
     * This method is required.
     *
     * @param {fn} cb   The callback fn to run when command is complete.
     *                  The callback follows the usual node: cb(err) format.
     */
    command: function (builder, cb) {

        var self = this;

        // this is expected to be running the /assets directory

        // build command:  ./cjs steal/buildjs OpsPortal opstools/RBAC


        //// NOTE: the build command will attempt to rebuild OpsPortal/production.[js,css].  We don't
        //// want to do that here, so we'll have to backup the original files and return them when we are done.

        var backUpName = '';
        var backUpCSS = '';

        async.series([


            // step 1:  backup the original OpsPortal/production.* files.
            function (next) {

                AD.log('<green>backing up</green> OpsPortal production files');

                backUpName = builder.backupProduction({ base: 'OpsPortal', file: 'production.js' });
                backUpCSS = builder.backupProduction({ base: 'OpsPortal', file: 'production.css' });

                next();
            },



            // step 2:  build js files
            function (next) {

                // build command:  ./cjs steal/buildjs OpsPortal opstools/RBAC

                AD.log('<green>building</green> opstools/RBAC JS files');

                // Minify js/ejs files
                transform({
                    main: path.join('opstools', 'RBAC', 'RBAC'),
                    config: "stealconfig.js"
                }, {
                        minify: true,
                        noGlobalShim: true,
                        ignore: [
                            /^.*(.css)+/, // Ignore css files
                            /^(?!opstools\/RBAC.*)/, // Ignore all are not plugin scripts
                        ]
                    }).then(function (transform) {

                        // Get the main module and it's dependencies as a string
                        var main = transform();

                        fs.writeFile(path.join('opstools', 'RBAC', 'production.js'), main.code, "utf8", function (err) {
                            if (err) {
                                AD.log.error('<red>could not write minified JS file !</red>', err);
                                next(err);
                            }

                            next();
                        });
                    })
                    .catch(function (err) {
                        AD.log.error('<red>could not complete opstools/RBAC JS build!</red>', err);
                        next(err);
                    });
            },

            // step :  replace our original OpsPortal/production.* files
            function(next) {
                AD.log('<green>replacing</green> OpsPortal production files');

                builder.replaceProduction({ base: 'OpsPortal', file: 'production.js', backup: backUpName });
                builder.replaceProduction({ base: 'OpsPortal', file: 'production.css', backup: backUpCSS });
                next();
            },



            // step 5:  patch our production.js to reference OpsPortal/production.js 
            function (next) {
                AD.log('<green>patching</green> OpsPortal production files');

                var patches = [
                    { file: path.join('opstools', 'RBAC', 'production.js'), tag: 'packages/OpsPortal-RBAC.js', replace: 'OpsPortal/production.js' }
                ];

                builder.patchFile(patches, next);
            },



        ], function (err, results) {

            cb(err);
        });

    }
}
