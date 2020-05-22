steal("OpsPortal/models/base/OPConfigTool.js", function() {
   System.import("appdev").then(function() {
      steal.import("appdev/model/model").then(function() {
         // Namespacing conventions:
         // AD.Model.extend('[application].[Model]', {static}, {instance} );  --> Object
         AD.Model.extend(
            "opsportal.navigation.OPConfigTool",
            {
               /*
					findAll: 'GET /appdev-opsportal/opconfigtool',
					findOne: 'GET /appdev-opsportal/opconfigtool/{id}',
					create:  'POST /appdev-opsportal/opconfigtool',
					update:  'PUT /appdev-opsportal/opconfigtool/{id}',
					destroy: 'DELETE /appdev-opsportal/opconfigtool/{id}',
					describe: function() {},   // returns an object describing the Model definition
					fieldId: 'id',             // which field is the ID
					fieldLabel:'icon'      // which field is considered the Label
				*/
            },
            {
               /*
					// Already Defined:
					model: function() {},   // returns the Model Class for an instance
					getID: function() {},   // returns the unique ID of this row
					getLabel: function() {} // returns the defined label value
				*/
            }
         );
      });
   });
});
