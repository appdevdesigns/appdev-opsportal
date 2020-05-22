steal("opstools/RBAC/models/Permission.js", function() {
   System.import("appdev").then(function() {
      steal.import("appdev/model/model").then(function() {
         var Permission = AD.Model.get("opstools.RBAC.Permission");

         // Namespacing conventions:
         // AD.Model.Base.extend("[application].[Model]" , { static }, {instance} );  --> Object
         AD.Model.Base.extend(
            "opstools.RBAC.SiteUser",
            {
               findAll: "GET /appdev-core/siteuser",
               findOne: "GET /appdev-core/siteuser/{id}",
               create: "POST /appdev-core/siteuser",
               update: "PUT /appdev-core/siteuser/{id}",
               destroy: "DELETE /appdev-core/siteuser/{id}",
               define: {
                  permissions: {
                     Type: Permission
                  }
               },
               describe: function() {
                  return {};
               },
               fieldId: "id",
               fieldLabel: "username"
            },
            {}
         );
      });
   });
});
