/**
 * OPView.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  tableName:'op_opview',


  connection:'appdev_default',
migrate:'alter',


  attributes: {

    key : { type: 'string' },

    objects : { type: 'json' },

    controller : { type: 'json' }
  }
};

