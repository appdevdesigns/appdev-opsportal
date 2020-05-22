steal("OpsPortal/models/base/OPConfigArea.js", function() {
   System.import("appdev").then(function() {
      steal.import("appdev/model/model").then(function() {
         // Namespacing conventions:
         // AD.Model.extend('[application].[Model]', {static}, {instance} );  --> Object
         AD.Model.extend(
            "opsportal.navigation.OPConfigArea",
            {
               useSockets: true
               /*
					findAll: 'GET /appdev-opsportal/opconfigarea',
					findOne: 'GET /appdev-opsportal/opconfigarea/{id}',
					create:  'POST /appdev-opsportal/opconfigarea',
					update:  'PUT /appdev-opsportal/opconfigarea/{id}',
					destroy: 'DELETE /appdev-opsportal/opconfigarea/{id}',
					describe: function() {},   // returns an object describing the Model definition
					fieldId: 'id',             // which field is the ID
					fieldLabel:'key'      // which field is considered the Label
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
