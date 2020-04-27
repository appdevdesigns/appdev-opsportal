System.import("appdev").then(function() {
   steal.import("appdev/model/model").then(function() {
      // Namespacing conventions:
      // AD.Model.Base.extend("[application].[Model]" , { static }, {instance} );  --> Object
      AD.Model.Base.extend(
         "opstools.RBAC.PermissionRole",
         {
            findAll: "GET /appdev-core/permissionrole",
            findOne: "GET /appdev-core/permissionrole/{id}",
            create: "POST /appdev-core/permissionrole",
            update: "PUT /appdev-core/permissionrole/{id}",
            destroy: "DELETE /appdev-core/permissionrole/{id}",
            describe: function() {
               return {
                  role_label: "string",
                  role_description: "text"
               };
            },
            associations: ["actions", "permissions"],
            multilingualFields: ["role_label", "role_description"],
            validations: {
               role_label: ["notEmpty"],
               role_description: ["notEmpty"]
            },
            fieldId: "id",
            fieldLabel: "role_label"
         },
         {
            //// instance definitions
         }
      );
   });
});
