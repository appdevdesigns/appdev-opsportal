/**
 * This file specifies any system Route permission to protect the apps in this
 * module.
 *
 * To specify a route and a set of permissions, fill out the module.exports {}
 * with a 'route' and permission setting.
 *
 * For example:
 *
 *  'get /route/one' : [ 'actionKey1' ],
 *		// access to : GET /route/one  requires 'actionKey1' assigned to the
 *      // requesting user in the Roles and Permissions system.
 *		// NOTE: this does not apply to post, put, or destroy  verbs
 *
 *  '/route/two'     : [ 'actionKey1', 'actionKey2' ]
 *		// any access to /route/two   will require either 'actionKey1' OR
 *      // 'actionKey2' to be assigned to this user.
 *
 *  '/route'         : [ 'actionKey1', ['actionKey2', 'actionKey3' ]
 *		// any access to /route/*  will require either 'actionKey1'  OR
 *		// ( 'actionKey2' AND 'actionKey3' )
 *
 * Also notice that the order is important.  The first match that happens is
 * the one that is palced in effect.  So in this case,
 *		'get /route/two' : will match the 2nd rule above
 *		'put /route/one' : will match the 3rd rule above
 *		'get /route/twomore' : will match the 2nd rule
 *
 */
module.exports = {
   //// NOTE: don't user '/opsportal' since that will also catch /page/opsportal
   //// or ... do we want that too?

   "/opsportal/requirements": ["opsportal.view"],
   "/opsportal/config": ["opsportal.view"],

   //// Blueprints: OpConfigArea, OpConfigTool
   "get /appdev-opsportal/opconfigarea": ["opsportal.view"], // everyone can get opconfigarea
   "/appdev-opsportal/opconfigarea": ["opsportal.opnavedit.view"], // must have opnavedit to do any other action to opconfigarea

   "get /appdev-opsportal/opconfigtool": ["opsportal.view"], // everyone can get opconfigtools
   "/appdev-opsportal/opconfigtool": ["opsportal.opnavedit.view"], // must have opnavedit to do any other action to opconfigarea

   // OPNavEdit: routes:
   "/opnavedit/": ["opsportal.opnavedit.view"]
};
