/**
 * OpsViewPermission
 *
 * @module      :: Policy
 * @description :: Scans the config/opsportal.js definition, and returns the
 *                 ops tool definitions the user is allowed to see.
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
module.exports = function(req, res, next) {

    OPSPortal.View.hasPermission(req, res, next);
};




