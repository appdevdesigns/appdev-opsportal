steal("opstools/RBAC/models/base/SiteUser.js", function() {
   System.import("appdev").then(function() {
      steal.import("appdev/model/model").then(function() {
         // Namespacing conventions:
         // AD.Model.extend('[application].[Model]', {static}, {instance} );  --> Object
         AD.Model.extend(
            "opstools.RBAC.SiteUser",
            {
               /*
                            findAll: 'GET /appdev-core/siteuser',
                            findOne: 'GET /appdev-core/siteuser/{id}',
                            create:  'POST /appdev-core/siteuser',
                            update:  'PUT /appdev-core/siteuser/{id}',
                            destroy: 'DELETE /appdev-core/siteuser/{id}',
                            describe: function() {},   // returns an object describing the Model definition
                            fieldId: 'id',             // which field is the ID
                            fieldLabel:'null'      // which field is considered the Label
                    */
            },
            {
               /*
                                // Already Defined:
                                model: function() {},   // returns the Model Class for an instance
                                getID: function() {},   // returns the unique ID of this row
                                getLabel: function() {} // returns the defined label value
                        */
               numAssignments: function() {
                  if (this.permission) {
                     return this.permission.length;
                  } else {
                     return "?";
                  }
               }
            }
         );
      });
   });
});
