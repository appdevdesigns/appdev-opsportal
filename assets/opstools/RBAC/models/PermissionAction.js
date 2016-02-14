steal(
    'opstools/RBAC/models/base/PermissionAction.js',
    function () {
        System.import('appdev').then(function () {
            steal.import('appdev/model/model').then(function () {

                // Namespacing conventions:
                // AD.Model.extend('[application].[Model]', {static}, {instance} );  --> Object
                AD.Model.extend('opstools.RBAC.PermissionAction', {
                    /*
                            findAll: 'GET /permissionaction',
                            findOne: 'GET /permissionaction/{id}',
                            create:  'POST /permissionaction',
                            update:  'PUT /permissionaction/{id}',
                            destroy: 'DELETE /permissionaction/{id}',
                            describe: function() {},   // returns an object describing the Model definition
                            fieldId: 'id',             // which field is the ID
                            fieldLabel:'null'      // which field is considered the Label
                    */
                }, {
                        /*
                                // Already Defined:
                                model: function() {},   // returns the Model Class for an instance
                                getID: function() {},   // returns the unique ID of this row
                                getLabel: function() {} // returns the defined label value
                        */
                    });

            });
        });
    });