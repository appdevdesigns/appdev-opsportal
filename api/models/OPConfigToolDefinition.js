/**
 * OPConfigToolDefinition.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  tableName:'op_config_tooldefinition',

//   connection:'appdev_default',
// migrate:'alter',

  attributes: {

    /*
     * key: a unique string that identifies this tool definition.
     *
     * ex: key: 'opsportal.rbac, hris.profile, appbuilder.designer'
     */
    key : {  type: 'string' },


    /*
     * permissions: a string representing which PermissionAction.action_keys are
     * required for this tool.
     *
     * ex: permission: 'opsportal.view, site.rbac.view'
     */
    permissions : {  type: 'string' },


    /*
     * icon:  the default fa-* icon to use for this tool.
     *
     * ex: fa-lock
     *
     * the OPConfigTool entry can overwrite this for the tool instance.
     */
    icon : { type: 'string' },


    /*
     * label/context:  a default multilingual label to display for this tool
     *
     * the OPConfigTool entry can overwrite this for the tool instance.
     */
    label : { type: 'string' },
    // context : { type: 'string' },


    /*
     * controller:  name of the OPTool controller to create for this tool.
     *
     * ex: OPView
     *
     */
    controller : { type: 'string' },


    /*
     * isController:  is the above controller a module loaded using steal?
     */
    isController : { 
      type: 'boolean',
      defaultsTo : true
    },


    /*
     * options:  a hash of possible option params and descirptions:
     *
     * { 'viewKey' : '{string} which OPView.key to to load.' }
     */
    options : { type: 'json', defaultsTo:{} },


    /*
     * version: {string} the current version of the definition.
     *
     * if a tooldefinition in the settings/opstool/opstools.js doesn't match
     * with this version, then update the setting.
     */
     version : { type: 'string' }
  }
};

