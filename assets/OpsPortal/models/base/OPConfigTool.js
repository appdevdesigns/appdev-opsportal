steal(function() {
   System.import("appdev").then(function() {
      steal.import("appdev/model/model").then(function() {
         // Namespacing conventions:
         // AD.Model.Base.extend("[application].[Model]" , { static }, {instance} );  --> Object
         AD.Model.Base.extend(
            "opsportal.navigation.OPConfigTool",
            {
               findAll: "GET /appdev-opsportal/opconfigtool",
               findOne: "GET /appdev-opsportal/opconfigtool/{id}",
               create: "POST /appdev-opsportal/opconfigtool",
               update: "PUT /appdev-opsportal/opconfigtool/{id}",
               destroy: "DELETE /appdev-opsportal/opconfigtool/{id}",
               describe: function() {
                  return {
                     icon: "string",
                     isDefault: "bool",
                     label: "string",
                     context: "string",
                     isController: "bool",
                     options: "json",
                     weight: "integer"
                  };
               },
               associations: {
                  areas: "opsportal.navigation.OPConfigArea",
                  permissions: "opstools.RBAC.PermissionAction"
               },
               multilingualFields: ["label"],
               // validations: {
               //     "role_label" : [ 'notEmpty' ],
               //     "role_description" : [ 'notEmpty' ]
               // },
               fieldId: "id",
               fieldLabel: "label"
            },
            {
               // model: function() {
               //     return AD.Model.get('DelMe.OPConfigTool'); //AD.models.DelMe.OPConfigTool;
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
