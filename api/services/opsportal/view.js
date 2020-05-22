/**
 * @class  OPSPortal.View
 * @parent OPSPortal
 * 
 * the .View object manages the interface for creating/updating any OPView 
 * definitions, that are available in the system.
 *
 * .createOrUpdate() 
 * creates a new definition, or updates an existing definition.
 *
 * 
 * 
 * ## Usage
 *
 */



var AD = require('ad-utils');
var _ = require('lodash');


module.exports = {

    /*
     * createOrUpdate
     *
     * add or update an OPView entry:
     *
     * @param {string} key  the unique OPView key 
     * @param {array}  arrObjects   an array of object definitions:
     *                              [ 
     *                                  { key:'object.name.key', path:'url/to/clientUI/model.js'},
     *                                  ...
     *                              ]
     * @param {array} arrControllers an array of controller definitions:
     *                              [
     *                                  { key:'controller.name.key', path:'url/to/clientUI/controller.js' },
     *                                  ...
     *                              ]
     * @param {fn} cb   (optional) a callback function for when this operation is complete.
     *                  cb(err, data);
     * @return {Deferred}
     */
    createOrUpdate:function(key, arrObjects, arrControllers, cb) {

        var dfd = AD.sal.Deferred();

        OPView.findOne({key:key})
        .then(function(view){
            if (view) {

                // it exists, so update the current entry
                view.objects = arrObjects;
                view.controller = arrControllers;
                view.save()
                .then(function(entry) {

                    if (cb) cb(null, view);
                    dfd.resolve(view);
                    return null;
                })
                .catch(function(err){

                    ADCore.error.log('OPSPortal.view.createOrUpdate(): unable to .save() entry', {error:err, view:view, objects:arrObjects, controller:arrControllers});
                    if (cb) cb(err);
                    dfd.reject(err);
                    return null;
                })

            } else {

                // it doesn't exist so create the entry
                OPView.create({key:key, objects:arrObjects, controller:arrControllers })
                .then(function(entry){

                    if (cb) cb(null, entry);
                    dfd.resolve(entry);
                    return null;
                })
                .catch(function(err){

                    ADCore.error.log('OPSPortal.view.createOrUpdate(): unable to .create() entry', {error:err, key:key, objects:arrObjects, controller:arrControllers});
                    if (cb) cb(err);
                    dfd.reject(err);
                    return null;
                })
            }
            return null;
        })
        .catch(function(err) {
            ADCore.error.log('OPSPortal.view.createOrUpdate(): error while finding key', {error:err, key:key});
            cb && cb(err);
            dfd.reject(err);
            return null;
        });

        return dfd;
    },


    /*
     * hasPermission
     *
     * check to see if the user has permission to request this OPView:
     * 
     */
    hasPermission:function(req, res, next) {

        var key = req.param('key');
        var user = req.AD.user();

        // each OPView has a unique key:  'hr.profile'
        // and there should be an associated '.view' permission: 'hr.profile.view'
        // that a users needs to have access to
        var actionKey = key + '.view';

        if (user.hasPermission( actionKey )) {
            // all good, so continue
            next();

        } else {

            AD.log.error('<green>... user[</green><yellow>'+user.GUID()+'</yellow><green>] did not have permission [</green><yellow>'+actionKey+'</yellow><green>]</green>')
            // nope!  so return a forbidden:
            res.AD.error(ADCore.error.fromKey('E_NOTPERMITTED'), 403);
        }

    },

    remove: function(key) {
        return OPView.destroy({ key: key });
    }


};
