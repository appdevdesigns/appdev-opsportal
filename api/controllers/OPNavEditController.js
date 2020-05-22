/**
 * OPNavEditController
 *
 * @description :: Server-side logic for managing Opnavedits
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var _ = require('lodash');
var async = require('async');

module.exports = {
	
	newTool:function(req, res) {

		var keyArea = req.param('area');
		var keyToolDef = req.param('toolDef');
		var permissions = null;

// console.log('... newTool:');
// console.log('    -> toolDef:'+keyToolDef);
// console.log('    -> area:'+keyArea);

		async.series([

			// lookup the ToolDef permissions
			function(next){
				OPConfigToolDefinition.find({key:keyToolDef})
                .exec(function(err, defs) {
                	if (err) {
                		next(err);
                	} else {
                		if ((defs) && (defs.length>0)) {
                			permissions = defs[0].permissions;
// console.log('OPNavEditController.newTool():  -> permissions:'+permissions, defs);
                			next();
                		} else {
// console.error('*** OPNavEditController.newTool(): no defs returned!', defs);
                		}
                	}
                })
			},

			// create the link:  Area -> Tool  (from ToolDef)
			function(next){

				OPSPortal.NavBar.Area.link({
					keyArea:keyArea,
					keyTool:keyToolDef,
					instance:{
						permissions:permissions
					}
				})
				.fail(next)
				.then(next) // nothing is passed back
			}
		], function(err){
			if (err) {
				res.AD.error(err);
			} else {
				res.AD.success({good:'job'});
			}
		});

	}

};

