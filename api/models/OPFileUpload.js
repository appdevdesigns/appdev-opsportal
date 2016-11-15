/**
 * OPFileUpload.js
 *
 * @description :: Store a reference to the uploaded file in this table
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  tableName:'op_fileupload',

  connection:'appdev_default',


  attributes: {

    uuid 		    : { type: 'string' },
    appKey 	    : { type: 'string' },
    permission 	: { type: 'string' },
    file        : { type: 'string' },
    pathFile    : { type: 'string' }, 
    size 		    : { type: 'integer' },
    type 		    : { type: 'string' },
    info        : { type: 'json'   },
    uploadedBy  : { model:'SiteUser' }
  }
};

