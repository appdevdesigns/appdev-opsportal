/**
 * OPConfigAreaTrans.js
 *
 * @description :: The Translation Entry for our OPConfigArea
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  tableName:'op_config_area_trans',

//   connection:'appdev_default',
migrate:'alter',

    attributes: {

        area:{
            model:'OPConfigArea'
        },
        
        language_code : {
            type : "string",
            size : 10,
            defaultsTo : "-"
        }, 

        label : {
            type : "string",
            size : 100,
            defaultsTo : "-",
            unique: true
        }, 
    }

};

