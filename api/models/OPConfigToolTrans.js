/**
 * OPConfigTool.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  tableName:'op_config_tool_trans',

//   connection:'appdev_default',
migrate:'alter',

  attributes: {

        tool:{
            model:'OPConfigTool'
        },
        
        language_code : {
            type : "string",
            size : 10,
            defaultsTo : "-"
        }, 

        label : {
            type : "string",
            // size : 100,
            // defaultsTo : "-",
            // unique: true
        }, 
  }
};

