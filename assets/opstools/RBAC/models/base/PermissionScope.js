System.import('appdev').then(function () {
    steal.import('appdev/model/model').then(function () {
        
        // Namespacing conventions:
        // AD.Model.Base.extend("[application].[Model]" , { static }, {instance} );  --> Object
        AD.Model.Base.extend("opstools.RBAC.PermissionScope", {
            findAll: 'GET /appdev-core/permissionscope',
            findOne: 'GET /appdev-core/permissionscope/{id}',
            create: 'POST /appdev-core/permissionscope',
            update: 'PUT /appdev-core/permissionscope/{id}',
            destroy: 'DELETE /permissionscope/{id}',
            describe: function () {
                return {
                    "label": "string"
                };
            },
            fieldId: 'id',
            fieldLabel: 'label'
        }, {

            });

    });
});