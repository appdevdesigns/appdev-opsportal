steal("opstools/RBAC/models/base/PermissionScope.js", function() {
   System.import("appdev").then(function() {
      steal.import("appdev/model/model").then(function() {
         // Namespacing conventions:
         // AD.Model.extend('[application].[Model]', {static}, {instance} );  --> Object
         AD.Model.extend(
            "opstools.RBAC.PermissionScope",
            {
               /*
					findAll: 'GET /appdev-core/permissionscope',
					findOne: 'GET /appdev-core/permissionscope/{id}',
					create:  'POST /appdev-core/permissionscope',
					update:  'PUT /appdev-core/permissionscope/{id}',
					destroy: 'DELETE /appdev-core/permissionscope/{id}',
					describe: function() {},   // returns an object describing the Model definition
					fieldId: 'id',             // which field is the ID
					fieldLabel:'label'      // which field is considered the Label
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
