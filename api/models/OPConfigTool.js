/**
 * OPConfigTool.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  tableName:'op_config_tool',

//   connection:'appdev_default',
migrate:'alter',

  attributes: {

    areas : {  collection: 'OPConfigArea', via: 'tools' },
    permissions : {  collection: 'PermissionAction', via: 'tools', dominant:true },

    key : {  type: 'string' },

    icon : { type: 'string' },

    isDefault : { 
      type: 'boolean',
      defaultsTo: false
    },

    controller : { type: 'string' },

    isController : { 
      type: 'boolean',
      defaultsTo : true
    },

    options : { type: 'json', defaultsTo:{} },

    weight  : { type: 'integer', defaultsTo:0 },


    //// MULTILINGUAL Model Fields:
    // this will pull in the translations using .populate('translations')
    translations:{
        collection:'OPConfigToolTrans',
        via:'tool'
    },

    translate:function(code) {
        return ADCore.model.translate({
            model:this,         // this instance of a Model
            code:code,          // the language code of the translation to use.
            ignore:['tool']     // don't include this field when translating
        });
    },

    _Klass: function() {
        return OPConfigTool;
    }
  },

  afterCreate: function(record, cb) {
    ADCore.queue.publish(OPSPortal.Events.NAV_STALE, {tool:record, verb:'created'});
    cb();
  },

  afterUpdate: function(record, cb) {
    ADCore.queue.publish(OPSPortal.Events.NAV_STALE, {tool:record, verb:'updated'});
    cb();
  },

  afterDestroy: function(record, cb) {
    ADCore.queue.publish(OPSPortal.Events.NAV_STALE, {tool:record, verb:'destroyed'});
    cb();
  },

  createMultilingual: function(data) {
    return Multilingual.model.create({ model: OPConfigTool, data: data });
  }
};

