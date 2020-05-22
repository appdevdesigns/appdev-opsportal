steal(function() {
   System.import("appdev").then(function() {
      steal.import("appdev/model/model").then(function() {
         // Namespacing conventions:
         // AD.Model.Base.extend("[application].[Model]" , { static }, {instance} );  --> Object
         AD.Model.Base.extend(
            "opstools.RBAC.PermissionScope",
            {
               findAll: "GET /appdev-core/permissionscope",
               findOne: "GET /appdev-core/permissionscope/{id}",
               create: "POST /appdev-core/permissionscope",
               update: "PUT /appdev-core/permissionscope/{id}",
               destroy: "DELETE /appdev-core/permissionscope/{id}",
               describe: function() {
                  return {
                     label: "string",
                     filter: "json",
                     filterUI: "json",
                     isGlobal: "boolean"
                  };
               },
               associations: {
                  permission: "opstools.RBAC.Permission",
                  object: "opstools.RBAC.PermissionScopeObject",
                  createdBy: "opstools.RBAC.SiteUser"
               },
               multilingualFields: ["label", "description"],
               // validations: {
               //     "label" : [ 'notEmpty' ],
               //     "description" : [ 'notEmpty' ]
               // },
               fieldId: "id",
               fieldLabel: "label"
            },
            {
               // model: function() {
               //     return AD.Model.get('opstools.RBAC.PermissionScope'); //AD.models.opstools.RBAC.PermissionScope;
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
