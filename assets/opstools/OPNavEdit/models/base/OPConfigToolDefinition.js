steal(function() {
   System.import("appdev").then(function() {
      steal.import("appdev/model/model").then(function() {
         // Namespacing conventions:
         // AD.Model.Base.extend("[application].[Model]" , { static }, {instance} );  --> Object
         AD.Model.Base.extend(
            "opsportal.navedit.OPConfigToolDefinition",
            {
               findAll: "GET /appdev-opsportal/opconfigtooldefinition",
               findOne: "GET /appdev-opsportal/opconfigtooldefinition/{id}",
               create: "POST /appdev-opsportal/opconfigtooldefinition",
               update: "PUT /appdev-opsportal/opconfigtooldefinition/{id}",
               destroy: "DELETE /appdev-opsportal/opconfigtooldefinition/{id}",
               describe: function() {
                  return {
                     key: "string",
                     permissions: "string",
                     icon: "string",
                     label: "string",
                     controller: "string",
                     isController: "bool",
                     options: "json",
                     version: "string"
                  };
               },
               // associations:['areas', 'permissions'],
               // multilingualFields:[ 'label' ],
               // validations: {
               //     "role_label" : [ 'notEmpty' ],
               //     "role_description" : [ 'notEmpty' ]
               // },
               fieldId: "id",
               fieldLabel: "key"
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
