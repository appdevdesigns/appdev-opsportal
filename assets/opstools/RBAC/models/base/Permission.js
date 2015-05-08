steal(
        'appdev',
        'opstools/RBAC/models/PermissionRole.js',
        'opstools/RBAC/models/PermissionScope.js'
).then( function(){

    var Role = AD.Model.get('opstools.RBAC.PermissionRole');
    var Scope = AD.Model.get('opstools.RBAC.PermissionScope');

    // Namespacing conventions:
    // AD.Model.Base.extend("[application].[Model]" , { static }, {instance} );  --> Object
    AD.Model.Base.extend("opstools.RBAC.Permission", {
        findAll: 'GET /appdev-core/permission',
        findOne: 'GET /appdev-core/permission/{id}',
        create:  'POST /appdev-core/permission',
        update:  'PUT /appdev-core/permission/{id}',
        destroy: 'DELETE /permission/{id}',
        define: {
            role:{
                Type:Role
            },
            scope:{
                Type:Scope
            }
        },
        describe: function() {
            return {
                      "user": "string",
                      "role": "string",
                      "scope": "string"
            };
        },
        fieldId:'id',
        fieldLabel:'user'
    },{

    });


});