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

module.exports = function (cb) {

    // handle our common bootstrap setup instructions:
        // - verify permissions are created
        // - verify opsportal tool definitions are defined.
    AD.module.bootstrap(__dirname, cb);

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

// Add CSRF route exclusion
if (sails.config.csrf) {
    
    var csrf = sails.config.csrf;
    csrf.routesDisabled = csrf.routesDisabled || '';
    
    if (csrf.routesDisabled == '-') {
        csrf.routesDisabled = '';
    }
    else if (csrf.routesDisabled) {
        csrf.routesDisabled += ',';
    }
    csrf.routesDisabled += '/opsportal/feedback';
    
}