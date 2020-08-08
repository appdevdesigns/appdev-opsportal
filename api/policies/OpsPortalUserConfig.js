/**
 * OpsPortalUserCofig
 *
 * @module      :: Policy
 * @description :: Scans the config/opsportal.js definition, and returns the
 *                 ops tool definitions the user is allowed to see.
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
module.exports = function(req, res, next) {
   var areaHash = {};
   var tools = [];

   // our current user
   var user = req.AD.user(); // ADCore.user.current(req);

   var cacheValue = OPSPortal.NavBar.cache(user.GUID());
   if (cacheValue) {
      // store cached value in the response object:
      if (!res.appdev) res.appdev = {};
      res.appdev.opsportalconfig = cacheValue;
      next();
   } else {
      var config = sails.config.opsportal;

      OPConfigArea.find()
         .populateAll()
         .exec(function(err, listAreas) {
            if (err) {
               ADCore.error.log("Error finding OPConfigAreas", { error: err });
               next(err);
            } else {
               processAreasRecursively(
                  areaHash,
                  tools,
                  user,
                  listAreas,
                  function(err) {
                     // now compile the results:
                     // convert areaHash => an array
                     var areas = [];
                     for (var a in areaHash) {
                        areas.push(areaHash[a]);
                     }

                     var data = {
                        areas: areas,
                        tools: tools,
                        feedback:
                           (config.feedback && config.feedback.enabled) ||
                           false,
                        countly: false
                     };

                     if (config.countly && config.countly.enabled) {
                        data.countly = config.countly;
                     }

                     // store this in the response object:
                     // res.appdev.opsportalconfig
                     if (!res.appdev) res.appdev = {};
                     res.appdev.opsportalconfig = data;
                     OPSPortal.NavBar.cache(user.GUID(), data);
                     next();
                  }
               );
            }
         });
   }

   // // start decoding each area defined
   // for (var a=0; a<config.areas.length; a++) {
   //     processArea(areaHash, tools, user, config.areas[a]);
   // }
};

function processPermission(user, permission) {
   // make a single 'permission'  string into an []
   if (!Array.isArray(permission)) {
      permission = [permission];
   }

   // each given permission setting must return true for this to work
   var ok = true;
   for (var p = 0; p < permission.length; p++) {
      if (!user.hasPermission(permission[p])) {
         // if we missed one, then this set of permissions fails
         ok = false;
         break;
      }
   }

   return ok;
}

function processToolsRecursively(areaHash, tools, user, area, listTools, cb) {
   if (listTools.length <= 0) {
      cb();
   } else {
      // we need a fully populated OPConfigTool to check permissions:
      var tool = listTools.shift();

      OPConfigTool.findOne(tool.id)
         .populateAll()
         .exec(function(err, currTool) {
            if (!currTool) {
               var error = new Error(
                  `Policy:OpsPortalUserConfig::ProcessToolsRcrsively():Unknown OPConfigTool[${tool.id}]`
               );
               error.tool = tool;
               sails.log.error(error);
               cb(error);
               return;
            }

            // for this tool, check each possible permission settings
            for (var p = 0; p < currTool.permissions.length; p++) {
               if (
                  processPermission(user, currTool.permissions[p].action_key)
               ) {
                  // once we return true, we don't have to process any more.
                  // add area & tool to our list.

                  //// TODO: change the isDefault to lookup a user's last accessed
                  //// area/tool and make those the default

                  // if area not already added then add it
                  if (!areaHash[area.key]) {
                     var areaInfo = {
                        icon: area.icon,
                        key: area.key,
                        label: area.label,
                        isDefault: area.isDefault || false
                     };
                     areaHash[area.key] = areaInfo;
                  }

                  // add default value for .isController
                  if (typeof tool.isController == "undefined") {
                     tool.isController = true;
                  }

                  // add the tool
                  // var toolInfo = {
                  //         area:area.key,
                  //         controller:tool.controller,
                  //         label:tool.label,
                  //         isDefault:tool.isDefault,
                  //         isController:tool.isController,
                  //         options: tool.options || {}
                  // };
                  // tools.push(toolInfo);
                  tools.push(currTool);
                  break;
               }
            }

            processToolsRecursively(areaHash, tools, user, area, listTools, cb);
         });
   }
}

function processAreasRecursively(areaHash, tools, user, listAreas, cb) {
   if (listAreas.length <= 0) {
      cb();
   } else {
      var area = listAreas.shift();
      processToolsRecursively(areaHash, tools, user, area, area.tools, function(
         err
      ) {
         if (err) {
            cb(err);
         } else {
            processAreasRecursively(areaHash, tools, user, listAreas, cb);
         }
      });
   }
}
