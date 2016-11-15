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
    
    // OpsPortal File Uploader
    'get  /opsportal/file/:appKey/:uuid'   : 'appdev-opsportal/OPFileUploadController.read',
    'post /opsportal/file'                 : 'appdev-opsportal/OPFileUploadController.create',
    'post /opsportal/file/:appKey/:permission/:isWebix'  : 'appdev-opsportal/OPFileUploadController.create',
    
    

    // OPTheme Routes
    'get    /optheme' 		        : 'appdev-opsportal/OPThemeController.list',
    'post   /optheme' 		        : 'appdev-opsportal/OPThemeController.create',
    'post   /optheme/set-default'   : 'appdev-opsportal/OPThemeController.setDefault',
    'delete /optheme'               : 'appdev-opsportal/OPThemeController.delete',
    'get    /optheme/get-variables' : 'appdev-opsportal/OPThemeController.getVariables',
    'get    /optheme/theme'	        : 'appdev-opsportal/OPThemeController.theme'

};

