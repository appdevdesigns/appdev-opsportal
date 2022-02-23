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

   var config = res.appdev.opsportalconfig || {};

   var key = [];

   (config.areas || [])
      .forEach((a) => {
         key.push(a.key);
      })(config.tools || [])
      .forEach((t) => {
         key.push(t.key);
      });

   if (config.feedback) {
      keys.push("true");
   } else {
      keys.push("false");
   }

   if (config.countly) {
      keys.push(JSON.stringify(config.countly));
   } else {
      keys.push("false");
   }

   res.appdev.opsportalconfighash = hashCode(key.join(""));

   next();
};

function hashCode(source) {
   let hash = 0;
   for (var i = 0; i < source.length; i++) {
      var char = source.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
   }
   return hash;
}
