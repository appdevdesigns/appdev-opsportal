steal("opstools/RBAC/models/base/PermissionScopeObject.js", function() {
   System.import("appdev").then(function() {
      steal.import("appdev/model/model").then(function() {
         // Namespacing conventions:
         // AD.Model.extend('[application].[Model]', {static}, {instance} );  --> Object
         AD.Model.extend(
            "opstools.RBAC.PermissionScopeObject",
            {
               /*
					findAll: 'GET /appdev-opsportal/permissionscopeobject',
					findOne: 'GET /appdev-opsportal/permissionscopeobject/{id}',
					create:  'POST /appdev-opsportal/permissionscopeobject',
					update:  'PUT /appdev-opsportal/permissionscopeobject/{id}',
					destroy: 'DELETE /appdev-opsportal/permissionscopeobject/{id}',
					describe: function() {},   // returns an object describing the Model definition
					fieldId: 'id',             // which field is the ID
					fieldLabel:'name'      // which field is considered the Label
				*/
            },
            {
               /*
					// Already Defined:
					model: function() {},   // returns the Model Class for an instance
					getID: function() {},   // returns the unique ID of this instance
					getLabel: function() {} // returns the defined label value
				*/
            }
         );
      });
   });
});
