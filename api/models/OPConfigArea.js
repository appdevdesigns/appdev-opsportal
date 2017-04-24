/**
 * OPConfigArea.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
var _ = require('lodash');

module.exports = {

  tableName:'op_config_area',

//   connection:'appdev_default',
migrate:'alter',

  attributes: {

    tools : {  collection: 'OPConfigTool', via: 'areas' },

    key : { type: 'string', unique: true },

    icon : { type: 'string' },

    isDefault : { type: 'boolean', defaultsTo:false },

    weight  : { type: 'integer', defaultsTo:0 },


    //// MULTILINGUAL Model Fields:
    // this will pull in the translations using .populate('translations')
    translations:{
        collection:'OPConfigAreaTrans',
        via:'area'
    },

    translate:function(code) {
        return ADCore.model.translate({
            model:this,         // this instance of a Model
            code:code,          // the language code of the translation to use.
            ignore:['area']     // don't include this field when translating
        });
    },

    _Klass: function() {
        return OPConfigArea;
    }

  },

  beforeCreate: function(values, cb) {

    // make sure there are no '.' in .key
    // and while we are at it, proper kebabCase()
    values.key = _.kebabCase(values.key);
    cb();
  },

  afterCreate: function(record, cb) {
    ADCore.queue.publish(OPSPortal.Events.NAV_STALE, {area:record, verb:'created'});
    ADCore.queue.publish(OPSPortal.Events.NAV_EDIT_STALE, {area:record, verb:'created'});
    cb();
  },

  afterUpdate: function(record, cb) {
    ADCore.queue.publish(OPSPortal.Events.NAV_STALE, {area:record, verb:'updated'});
    cb();
  },

  afterDestroy: function(record, cb) {
    ADCore.queue.publish(OPSPortal.Events.NAV_STALE, {area:record, verb:'destroyed'});
    if (!_.isArray(record)) {
      record = [record];
    }

    Multilingual.model.removeTranslations({ model:this, records:record })
    .fail(function(err){
      console.log('!!!! error .removeTranslation() ', err);
    });
    cb();
  },

  createMultilingual: function(data) {
    return Multilingual.model.create({ model: OPConfigArea, data: data });
  }
};
