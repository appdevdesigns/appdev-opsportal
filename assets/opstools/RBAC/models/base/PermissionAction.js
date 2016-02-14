System.import('appdev').then(function () {
    steal.import('appdev/model/model').then(function () {


        // Namespacing conventions:
        // AD.Model.Base.extend("[application].[Model]" , { static }, {instance} );  --> Object
        AD.Model.Base.extend("opstools.RBAC.PermissionAction", {
            findAll: 'GET /appdev-core/permissionaction',
            findOne: 'GET /appdev-core/permissionaction/{id}',
            create: 'POST /appdev-core/permissionaction',
            update: 'PUT /appdev-core/permissionaction/{id}',
            destroy: 'DELETE /appdev-core/permissionaction/{id}',
            describe: function () {
                return {
                    action_key: 'string',
                    action_description: 'text'
                };
            },
            multilingualFields: ['action_description'],
            validations: {
                "action_key": ['notEmpty'],
                "action_description": ['notEmpty']
            },
            fieldId: 'id',
            fieldLabel: 'action_key'
        }, {

            });
    });
});