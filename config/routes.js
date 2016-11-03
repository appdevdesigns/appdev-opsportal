/**
 * Routes
 *
 * Use this file to add any module specific routes to the main Sails
 * route object.
 */


module.exports = {

    'get /opsportal/requirements.js': 'appdev-opsportal/OpsPortalController.requirements',
    'get /opsportal/config': 'appdev-opsportal/OpsPortalController.config',
    'get /opsportal/socket/register' : 'appdev-opsportal/OpsPortalController.registerSocket',
    'get /opsportal/view/:key' : 'appdev-opsportal/OpsPortalController.view',
    
    'post /opsportal/feedback': 'appdev-opsportal/OpsPortalController.feedback',


    // OPNavEdit routes:
    'post /opnavedit/newtool' : 'appdev-opsportal/OPNavEditController.newTool',


    // OpsPortal Image Uploader
    'get  /opsportal/image/:appKey/:uuid' 	: 'appdev-opsportal/OPImageUploadController.read',
    'post /opsportal/image'  				: 'appdev-opsportal/OPImageUploadController.create',
    'post /opsportal/image/:appKey/:permission/:isWebix'  : 'appdev-opsportal/OPImageUploadController.create',
    
    

};

