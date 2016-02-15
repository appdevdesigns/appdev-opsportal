steal(
    'opstools/RBAC/models/base/Permission.js',
    function () {
        System.import('appdev').then(function () {
            steal.import(
                'appdev/model/model').then(function () {

                    // Namespacing conventions:
                    // AD.Model.extend('[application].[Model]', {static}, {instance} );  --> Object
                    AD.Model.extend('opstools.RBAC.Permission', {
                        /*
                                findAll: 'GET /appdev-core/permission',
                                findOne: 'GET /appdev-core/permission/{id}',
                                create:  'POST /appdev-core/permission',
                                update:  'PUT /appdev-core/permission/{id}',
                                destroy: 'DELETE /appdev-core/permission/{id}',
                                describe: function() {},   // returns an object describing the Model definition
                                fieldId: 'id',             // which field is the ID
                                fieldLabel:'user'      // which field is considered the Label
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