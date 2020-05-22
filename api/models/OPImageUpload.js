/**
 * OPImageUpload.js
 *
 * @description :: Store a reference to the uploaded images in this table
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  tableName:'op_imageupload',

  connection:'appdev_default',


  attributes: {

    uuid 		: { type: 'string' },
    app_key 	: { type: 'string' },
    permission 	: { type: 'string' },
    image 		: { type: 'string' },
    size 		: { type: 'integer' },
    type 		: { type: 'string' }
  }
};

