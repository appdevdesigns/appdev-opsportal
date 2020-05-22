/**
 * OPSPortal
 *
 * @module      :: Service
 * @description :: A collection of services related to the OpsPortal.
 *
 */


var AD = require('ad-utils');
var _ = require('lodash');


// import local files
var path  = require('path');
var NavBar = require(path.join(__dirname, 'opsportal', 'navbar.js'));
var View  = require(path.join(__dirname, 'opsportal', 'view.js'));


module.exports = {

	Events:{
		PERM_STALE:'opsportal.permission.stale', // event issued when any of the permission settings change
		NAV_STALE: 'opsportal_navigation_stale', // event issued when any of the navigation config entries are changed.
        NAV_EDIT_STALE: 'opsportal_navigation_editor_stale' // when any of the Nav Edit DB items are updated.
	},
    

    /*
     * NavBar
     * 
     * a collection of routines that support interacting with the OpsPortal
     * navigation system.
     */
    NavBar: NavBar,


    /*
     * View
     * 
     * a collection of routines that support dynamic OPView defintions.
     */
    View: View

}



