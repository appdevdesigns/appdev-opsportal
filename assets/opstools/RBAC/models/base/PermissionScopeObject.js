steal(function() {
   System.import("appdev").then(function() {
      steal.import("appdev/model/model").then(function() {
         // Namespacing conventions:
         // AD.Model.Base.extend("[application].[Model]" , { static }, {instance} );  --> Object
         AD.Model.Base.extend(
            "opstools.RBAC.PermissionScopeObject",
            {
               findAll: "GET /appdev-core/permissionscopeobject",
               findOne: "GET /appdev-core/permissionscopeobject/{id}",
               create: "POST /appdev-core/permissionscopeobject",
               update: "PUT /appdev-core/permissionscopeobject/{id}",
               destroy: "DELETE /appdev-core/permissionscopeobject/{id}",
               describe: function() {
                  return { name: "string", keyModel: "string" };
               },
               // associations:['field1', 'field2', ..., 'fieldN'],
               multilingualFields: ["name"],
               // validations: {
               //     "role_label" : [ 'notEmpty' ],
               //     "role_description" : [ 'notEmpty' ]
               // },
               fieldId: "id",
               fieldLabel: "name"
            },
            {
               // model: function() {
               //     return AD.Model.get('opstools.RBAC.PermissionScopeObject'); //AD.models.opstools.RBAC.PermissionScopeObject;
               // },
               // getID: function() {
               //     return this.attr(this.model().fieldId) || 'unknown id field';
               // },
               // getLabel: function() {
               //     return this.attr(this.model().fieldLabel) || 'unknown label field';
               // }
            }
         );
      });
   });
});
