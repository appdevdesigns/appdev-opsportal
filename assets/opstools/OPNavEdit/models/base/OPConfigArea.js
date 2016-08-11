steal(function() {
	System.import('appdev').then(function() {
		steal.import('appdev/model/model').then(function() {

			// Namespacing conventions:
			// AD.Model.Base.extend("[application].[Model]" , { static }, {instance} );  --> Object
			AD.Model.Base.extend("opstools.OPNavEdit.OPConfigArea", {
				findAll: 'GET /appdev-opsportal/opconfigarea',
				findOne: 'GET /appdev-opsportal/opconfigarea/{id}',
				create: 'POST /appdev-opsportal/opconfigarea',
				update: 'PUT /appdev-opsportal/opconfigarea/{id}',
				destroy: 'DELETE /appdev-opsportal/opconfigarea/{id}',
				describe: function() { return { 'key':'string', 'icon':'string', 'isDefault':'bool', 'label':'string', 'context':'string' };  },
				associations:['tools'], 
				// multilingualFields:[ 'field', 'field2' ],
				// validations: {
				//     "role_label" : [ 'notEmpty' ],
				//     "role_description" : [ 'notEmpty' ]
				// },
				fieldId: 'id',
				fieldLabel: 'key'
			}, {
				// model: function() {
				//     return AD.Model.get('DelMe.OPConfigArea'); //AD.models.DelMe.OPConfigArea;
				// },
				// getID: function() {
				//     return this.attr(this.model().fieldId) || 'unknown id field';
				// },
				// getLabel: function() {
				//     return this.attr(this.model().fieldLabel) || 'unknown label field';
				// }
			});
		});
	});
});