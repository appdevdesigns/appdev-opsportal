/**
 * @class  OPSPortal.NavBar
 * @parent OPSPortal
 * 
 * the .NavBar object manages the interface for creating/updating any opsportal 
 * navigation components.  
 * 
 * 
 * ## Usage
 *
 */


var fs = require('fs');
var AD = require('ad-utils');
var _ = require('lodash');


var __cacheValues = {}; // hash of {  'user.guid' : opsportal.config }
						// this is a cache of each users computed opsportal 
						// layout.


var __cacheToolDefs = null;  // hash of { 'tooldef.key': {definitionObject} }
						// this is a cache of all the current 
						// OPConfigToolDefinition values that are defined in 
						// the DB.


var NavBar = module.exports = {

    /** 
	 * OPSPortal.NavBar.cache()
	 *
	 * An interface for loading a user's current computed OpsPortal layout.
	 *
	 * @codestart
	 *
	 * // get the user's current opsportal config settings:
	 * var user = req.AD.user();
	 * var currentConfig = OPSPortal.NavBar.cache(user.GUID()); 
	 *		// undefined if no config exists
	 * 		// {obj} describing opsportal config if it does
	 *
	 *
	 * // set the user's current opsportal config settings:
	 * var someConfig = { foo:'bar' };
	 * OPSPortal.NavBar.cache(user.GUID(), someConfig);
	 *
	 * @codeend
	 *
	 * @param {string} guid  the user's GUID, the key to look up.
	 * @param {obj} value    (optional) the config settings to save.
	 *					 if value is not given -> this is a get operation
	 *					 if value is given -> this updates the information. 
	 * @return {mixed} 
	 */
    cache: function(guid, value) {
        if (typeof value == 'undefined') {

            // this is a get operation:
            return __cacheValues[guid];
        } else {

        	// this is a set operation:
            __cacheValues[guid] = value;
        }
    },


    Area: {

        exists:function(key, cb) {
            var dfd = AD.sal.Deferred();

            OPConfigArea.find({key:key})
            .exec(function(err, areas){

                if (err) {
                    if (cb) cb(err);
                    dfd.reject(err);
                } else {
                    var isThere = false;
                    if ((areas) && (areas.length > 0)) {
                        isThere = true;
                    }
                    if (cb) cb(null, isThere);
                    dfd.resolve(isThere);
                }
            })

            return dfd;
        },


        /** 
         * OPSPortal.NavBar.Area.create()
         *
         * create an Area definition if not already defined.
         * update an existing definition if it is.
         * 
         * @param {obj} areaDef  the current Area def values to create.
         *                   must include areaDef.key 
         * @param {fn} cb    (optional) the callback function for when the 
         *                   update is complete.  
         *                   cb(err, createdArea);
         *                   if Area aleady existed, then cb(null, null);
         * @return {deferred} 
         */
        create:function(areaDef, cb) {
            var dfd = AD.sal.Deferred();

            if((_.isFunction(areaDef)) && (_.isUndefined(cb))) {
                cb = areaDef;
                areaDef = undefined;
            }

            if (_.isUndefined(areaDef)) {
                var error = new Error('areaDef parameter is required');
                error.code = "E_MISSINGPARAM";
                if (cb) cb(error);
                dfd.reject(error);
                return dfd;
            }

            OPSPortal.NavBar.Area.exists(areaDef.key, function(err, isThere){

                if (err) {
                    if (cb) cb(err);
                    dfd.reject(err);
                } else {

                    if (isThere) {
                        
                        if (cb) cb(null, null);
                        dfd.resolve(null);

                    } else {
                        
                        OPConfigArea.createMultilingual(areaDef)
                        .fail(function(err){
                            if (cb) cb(err);
                            dfd.reject(err);
                        })
                        .then(function(newArea){
                            if (cb) cb(null, newArea);
                            dfd.resolve(newArea);
                        })

                    }
                }
            })

            return dfd;
        },



        /**
         * OPSPortal.NavBar.Area.link()
         *
         * create a Tool from the given toolDefinition key, and connect it
         * to the current Area defined by the given area key.
         *
         * @param {obj} linkDef  An object with the following parameters:
         *                  .keyArea    {string} the OPConfigArea.key of the
         *                              area we are assigning the tool to.
         *                  .keyTool    {string} the OPConfigToolDefinition.key
         *                              of the Tool we want to create an instance
         *                              of.
         *                  .instance   {obj} any additional specifics for this
         *                              instance of the OPConfigTool.
         *                              .icon {string} override the default icon
         *                              .isDefault {bool} is the default tool?
         *                              .label / .context  which Multilingual 
         *                                  label to use
         *                              .options {obj} parameters to send to this
         *                                  instance.
         * @param {fn} cb   (optional) callback for when the link is created.
         *                  cb(err) : single err param to determine success of
         *                            operation.
         * @return {deferred}
         */
        link: function(linkDef, cb) {
            var dfd = AD.sal.Deferred();

// console.log('... OPSPortal.NavBar.Area.link() :');
            // Verify linkDef is provided.
            if((_.isFunction(linkDef)) && (_.isUndefined(cb))) {
                cb = linkDef;
                linkDef = undefined;
            }

            if ((_.isUndefined(linkDef)) || (_.isNull(linkDef))) {
                var error = new Error('linkDef parameter is required');
                error.code = "E_MISSINGPARAM";
                if (cb) cb(error);
                dfd.reject(error);
                return dfd;
            }


            // Verify linkDef has requried fields:
            var requiredFields = ['keyArea', 'keyTool', 'instance'];
            var fieldsMissing = [];
            requiredFields.forEach(function(key){
                if (_.isUndefined(linkDef[key])) {
                    fieldsMissing.push(key);
                }
            })
            if (fieldsMissing.length > 0) {
                var error = new Error('linkDef is missing required fields ['+ fieldsMissing.join(',')+']');
                error.code = "E_MISSINGPARAM";
                if (cb) cb(error);
                dfd.reject(error);
                return dfd;
            }

            // find the Area
            // find the ToolDef
            // Create Tool Instance if not there.
            // update ToolInstance with given .instance data
            // link Area -> ToolInstance
            // return

            var navArea = null;     // the OPConfigArea to link to.
            var navToolDef = null;  // the OPConfigToolDefinition to link
            var navTool = null;     // live instance of the OPConfigTool
            var wasLinked = false;  // navTool already linked to navArea?

            var prevNavArea = null; // the orignial values of the navArea
            var prevNavTool = null; // the original values of navTool.

            async.series([

                // 1) find the Area:
                function findArea(next){
// console.log('... finding Area['+linkDef.keyArea+'] ');
                    OPConfigArea.find({key:linkDef.keyArea})
                    .populateAll()
                    .exec(function(err, areas){

                        if (err) {
                            next(err);
                        } else {

                            if ((areas) && (areas.length >0)) {
                                navArea = areas[0];
                                prevNavArea = navArea.toJSON();

// console.log('... fully populated area:', navArea);
                                next();
                            } else {
                                var msg = 'No OPConfigArea with matching key:'+linkDef.keyArea;
                                var error = new Error(msg);
                                error.code = 'E_AREANOTFOUND';
                                ADCore.error.log(msg, { error:error, keyArea:linkDef.keyArea });
                                next(error);
                            }
                        }
                    })
                },


                // 2) is the navArea already connected to a Tool with linkDef.keyTool ?
                function checkExistingTools(next) {
                    if (navArea.tools) {
                        _.forEach(navArea.tools, function(tool) {
                            if (tool.key == linkDef.keyTool) {
                                navTool = tool;
                                wasLinked = true;
                                return false
                            }
                        });
                    }
                    
                    // did we find one?
                    if (navTool) {

// console.log('... Area['+linkDef.keyArea+'] was already linked to a tool ['+linkDef.keyTool+'] :', navTool);

                        // let's pull up a fully populated version:
                        OPConfigTool.find({id: navTool.id})
                        .populateAll()
                        .exec(function(err, tools){

                            if (err) {
                                next(err);
                            } else {

                                if ((tools) && (tools.length > 0)) {

                                    navTool = tools[0];
prevNavTool = navTool.toJSON();

// console.log('... fully populated navTool found: ', navTool);
                                    next();

                                } else {

                                    // this didn't work as expected!
                                    var msg = 'OPSPortal.NavBar.Area.link() : unable to load fully populated OPConfigTool with id:'+navTool.id;
                                    var error = new Error(msg);
                                    ADCore.error.log(msg, {error:error, id:navTool.id});
                                    next(error);
                                }

                            }
                        })

                    } else {
// console.log('... no existing tool ['+linkDef.keyTool+'] found.');
                        next();
                    }

                },


                // 2B.1) if not connected to an existing tool -> find the ToolDef
                function findToolDef(next) {
                    if (navTool) {
                        next();
                    } else {

                        OPConfigToolDefinition.find({key:linkDef.keyTool})
                        .exec(function(err, defs) {

                            if (err) {

                                ADCore.error.log('OPSPortal.NavBar.Area.link() : error looking up ToolDefinition:', {error:err, key:linkDef.keyTool, linkDef:linkDef });
                                next(err);

                            } else {

                                if ((defs) && (defs.length>0)) {

                                    navToolDef = defs[0];
// console.log('... found ToolDef:', navToolDef);
                                    next();

                                } else {

                                    // unexpected
                                    var msg = 'OPSPortal.NavBar.Area.link() : Did not find a matching ToolDefinition.key:'+linkDef.keyTool;
                                    var error = new Error(msg);
                                    error.code = 'E_TOOLNOTFOUND';
                                    ADCore.error.log(msg, { error:error, key:linkDef.keyTool, linkDef:linkDef });
                                    next(error);
                                }
                                
                            }
                        });
                    }

                },


                // 2B.2) create an instance from our ToolDefinition
                function createTool(next) {
                    if (navTool) {
                        // skip this
                        next();
                    } else {

                        var fields = ['key', 'icon', 'isDefault', 'label', 'controller', 'isController', 'options'];
                        var data = {};
                        fields.forEach(function(field) {
                            data[field] = navToolDef[field];
                        });
// console.log('... data to create new toolInstance :', data);
                        
                        Multilingual.model.create({
                            model:OPConfigTool,
                            data:data
                        })
                        .fail(function(err){
                            ADCore.error.log('OPSPortal.NavBar.Area.link() : error creating our Tool Instance :', {error:err, data:data });
                            next(err);
                        })
                        .then(function(tool){
                            navTool = tool;
                            
                            // keep connected devices updated:
                            OPConfigTool.publishCreate(tool);
                            next();
                        })
                        
//                         OPConfigTool.create(data)
//                         .exec(function(err, tool){ 
//                             if (err) {
// // console.log('... ERROR: creating toolInstance :', err);
//                                 ADCore.error.log('OPSPortal.NavBar.Area.link() : error creating our Tool Instance :', {error:err, data:data });
//                                 next(err);
//                             } else {
// // console.log('... toolInstance created:', tool);
//                                 navTool = tool;
//                                 next();
//                             }
//                         });                       
                    }

                },


                //// NOTE: at this point we have fully populated navTool.permissions values.
                ////       once we do a .save() we lose the populations on the base object
                ////       so work with those populated values first so we don't have
                ////       to lookup the object again.
                // 3) make sure Permissions match any passed in:
                function verifyToolPermission(next) {


                    if (_.isUndefined(linkDef.instance.permissions)) {

                        // no permissions provided, so skip
                        next();

                    } else {


                        // linkDef.instance.permissions :  'perm.action.1', 'perm.action.2' ..
                        // this is the EXACT settings we should end up with:


                        // arry of desired permission settings:
                        var givenPermissions = linkDef.instance.permissions;
                        if (!_.isArray(givenPermissions)) {

                            // couldhave been a string:
                            givenPermissions = _.map(givenPermissions.split(','), function(p) {
                                return p.trim();
                            });

                        }

                        // arry of all existing permissions
                        var hashCurrPerms = {};
                        _.forEach(navTool.permissions, function(value) {
                            hashCurrPerms[value.action_key] = value;
                        })
                        var existingPermissions = _.map(navTool.permissions, function(p) {
                            return p.action_key;
                        })

// console.log('... givenPermissions:', givenPermissions);
// console.log('... existingPerms:', existingPermissions);

                        var permsToAdd = _.difference(givenPermissions, existingPermissions);
                        var permsToRemove = _.difference(existingPermissions, givenPermissions);

// console.log('... permsToAdd:', permsToAdd);
// console.log('... permsToRemove:', permsToRemove);

                        // remove existing permissions:
                        permsToRemove.forEach(function(perm){
                            navTool.permissions.remove( hashCurrPerms[perm].id );
                        })


                        // now lookup permission actions and then add them:
                        PermissionAction.find({action_key:permsToAdd})
                        .exec(function(err, foundActions){
                            if (err) {
                                var msg = 'OPSPortal.NavBar.Area.link() : unable to load PermissionActions.action_key:'+permsToAdd;
                                // var error = new Error(msg);
                                ADCore.error.log(msg, {error:err, action_key:permsToAdd});
                                next(err);
                            } else {

                                if (foundActions) {
                                    
                                    _.forEach(foundActions, function(action){
                                        navTool.permissions.add(action);
                                    })
                                }

                                navTool.save(function(err){

                                    next();
                                })
                            }
                        });

                    }
                    

                },


                // 4) Make sure current instance matches the provided .instance data
                function verifyToolSettings(next) {

                    var hasUpdate = false;
                    var ignoreKeys = ['key', 'permissions', 'options'];
                    _.forIn(linkDef.instance, function(val, key) {
                        // if not one of our ignored keys:
                        if (ignoreKeys.indexOf(key) == -1) {

                            // if the values don't match, then update it.
                            if (navTool[key] != val) {
// console.log('... updating existing key['+key+'] : '+val);
                                navTool[key] = val;
                                hasUpdate = true;
                            }
                        }
                    });

                    // make sure options are properly updated:
                    if (!_.isUndefined(linkDef.instance.options)) {
// console.log('... updating existing options:', navTool);
                        navTool.options = _.assign(navTool.options, linkDef.instance.options);
                        hasUpdate = true;
                    } 

                    if (hasUpdate) {

                        // save our changes
                        navTool.save(function(err, newTool) {

// console.log('... current navTool:', navTool);
                            next();
                       
                        });

                    } else {

                        // nothing to do, so continue
                        next();
                    }

                },


                // 5) Make sure Tool is linked to Area
                function verifyToolLinked(next) {

                    if (wasLinked) {
// console.log('... navTool is already Linked to navArea.');
                        next();
                    } else {
// console.log('... linking navArea <--> navTool');

                        navArea.tools.add(navTool);
                        navArea.save(function(err){

                            if (err) {
                                ADCore.error.log('Error linking navArea + navTool', {error:err, area:navArea, tool:navTool });
                                next(err);
                            } else {

                                OPConfigArea.find({id:navArea.id})
                                .populate('tools')
                                .exec(function(err, listAreas){
                                    var fullArea = listAreas[0];
                                    console.log('***> new navArea:', fullArea.toJSON() );
                                    OPConfigArea.publishUpdate(navArea.id, fullArea.toJSON(), null, { previous:prevNavArea});
                                })

                                // don't wait for the publishUpdate
                                next();
                            }
                             
                        })

                    }
                }


            ],function(err){

                // 24 NOV 2016: fix #161
                // if a new navTool has been created, publish these updates:
                if (navTool) {
                    ADCore.queue.publish(OPSPortal.Events.NAV_STALE, {tool:navTool, verb:'created'});
                    OPConfigTool.publishUpdate(navTool.id, navTool.toJSON(), null, { previous:prevNavTool });
                }

                if (err) {
                    if (cb) cb(err);
                    dfd.reject(err);
                } else {
                    if (cb) cb();
                    dfd.resolve();
                }
            })

            return dfd;
        },

        remove: function (areaKeys, cb) {
            var dfd = AD.sal.Deferred();

            if (_.isUndefined(areaKeys)) {
                var error = new Error('areaKey parameter is required');
                error.code = "E_MISSINGPARAM";
                if (cb) cb(error);
                dfd.reject(error);
                return dfd;
            }

            OPConfigArea.destroy({ key: areaKeys })
                .fail(function (err) {
                    if (cb) cb(err);
                    dfd.reject(err);
                })
                .done(function () {
                    ADCore.queue.publish(OPSPortal.Events.NAV_STALE, { verb:'removed'});

                    if (cb) cb();
                    dfd.resolve();
                });

            return dfd;
        }
    },


    ToolDefinition: {

    	/** 
    	 * OPSPortal.NavBar.ToolDefinition.create()
    	 *
    	 * create the Tool Definition for the given def object.
    	 * 
    	 * this routine is to be used by external modules to define their
    	 * ToolDefinitions that are available to be loaded in the OpsPortal.
    	 *
    	 * @param {obj} def  the current tool def values to create.
    	 * 					 must include def.key 
    	 * @param {fn} cb    (optional) the callback function for when the 
    	 *					 update is complete.  
    	 *					 cb(err, createdDefinition);
    	 * @return {deferred} 
    	 */
    	create: function(def, cb) {
    		var dfd = AD.sal.Deferred();


            // sort out params.
            if (_.isFunction(def)) {
                cb = def;
                def = undefined;
            }

            // make sure def is defined.
            if ((_.isUndefined(def)) || (_.isNull(def))) {

                // this is a problem!
                var err = new Error('Missing required parameter: def');
                err.code = 'E_MISSINGPARAM';
                if (cb) cb(err);
                dfd.reject(err);
                return dfd;
            }


    		function onError(err) {
    			if (cb) cb(err);
	    		dfd.reject(err);
	    		return null;
    		}

            // verify all ToolDefinition fields are provided:
            var hasMissing = false;
            var ignoreFields = ['id', 'createdAt', 'updatedAt'];
            var fields = _.keys(sails.models.opconfigtooldefinition.attributes);
            fields.some(function(f){
                if (ignoreFields.indexOf(f) == -1) {

                    if (_.isUndefined(def[f])) {

                        // this is a problem!
                        var msg = "Missing required field : "+f;
                        var error = new Error(msg);
                        ADCore.error.log(error, {
                            definition:def, 
                            missingField:f, 
                            TDAttributes:sails.models.opconfigtooldefinition.attributes
                        });

                        onError(error);
                        hasMissing = true;
                    }
                    
                }
                return hasMissing;
            });

            if (!hasMissing) {

        		// make sure our cached list exists
        		loadToolDefs(function(err){

        			if (err) {
        				onError(err);
        			} else {

    					OPSPortal.NavBar.ToolDefinition.exists(def.key, function(err, isThere){
    						if (err) {
    							onError(err);
    						} else {

    							if (!isThere) {

    			    				// now create the new definition:
    					    		OPConfigToolDefinition.create(def)
                                    .exec(function(err, newDef){

                                        if (err) {
                                            return onError(err);
                                        } else {
                                            __cacheToolDefs[newDef.key] = newDef;

                                            if (cb) cb(null, newDef);
                                            dfd.resolve(newDef);

                                            return null;
                                        }
                                    })

    							} else {

    								// return existing definition
    								var newDef = __cacheToolDefs[def.key];
    								if (cb) cb(null, newDef);
    					    		dfd.resolve(newDef);

    							}
    						}
    					})

    		    	}

    	    	});

            }

    		return dfd;
    	},


    	/** 
    	 * OPSPortal.NavBar.ToolDefinition.exists()
    	 *
    	 * Check to see if the current OPConfigToolDefinition.key exists in
    	 * the db yet.
    	 *
     	 * @param {string} key  the OPConfigToolDefinition.key to lookup.
    	 * @param {fn} cb    (optional) the callback function for when the 
    	 *					 update is complete.  
    	 *					 cb(err, isThere);
    	 * @return {deferred} 
    	 */
    	exists: function(key, cb) {
    		var dfd = AD.sal.Deferred();

    		loadToolDefs(function(err){
    			if (err) {
    				if (cb) cb(err);
    				dfd.reject(err);
    			} else {
    				var isThere = !_.isUndefined( __cacheToolDefs[key] );

    				if (cb) cb(null, isThere);
    				dfd.resolve( isThere );
    			}
    		})

    		return dfd;
    	},


    	/** 
    	 * OPSPortal.NavBar.ToolDefinition.setup()
    	 *
    	 * a routine that ensures a module's OPConfigToolDefinition is created.
    	 * 
    	 * it is intended to be run by the [module]/config/bootstrap.js 
    	 * routine.
    	 *
     	 * @param {array} defs  one or more Tool Definitions that need to be 
     	 *					 verified (created/updated).
     	 *					 [ { OPConfigToolDefinition }, {} ..., {} ]
    	 * @param {fn} cb    (optional) the callback function for when the 
    	 *					 update is complete.  
    	 *					 cb(err);
    	 * @return {deferred} 
    	 */
    	setup: function(defs, cb) {
    		var dfd = AD.sal.Deferred();

            // sort out params.
            if (_.isFunction(defs)) {
                cb = defs;
                defs = undefined;
            }

            // make sure defs is defined.
            if (_.isUndefined(defs)) {

                // this is a problem!
                var err = new Error('Missing required parameter: defs');
                err.code = 'E_MISSINGPARAM';
                if (cb) cb(err);
                dfd.reject(err);
                return dfd;
            }


    		// make sure defs is an array:
    		if (! _.isArray(defs)) {
    			defs = [defs];
    		}


			function onError(err) {
    			if (cb) cb(err);
	    		dfd.reject(err);
	    		return null;
    		}

    		function onDone() {
    			numDone++;
				if (numDone >= defs.length){
					if (cb) cb(null);
					dfd.resolve();
				}
    		}


    		var numDone = 0;

    		defs.forEach(function(def){
				OPSPortal.NavBar.ToolDefinition.exists(def.key, function(err, isThere){
					if (err) {
						onError(err);
					} else {

						if (!isThere) {
			    			OPSPortal.NavBar.ToolDefinition.create(def, function(err){
			    				if (err){
			    					onError(err);
			    				} else {
			    					onDone();
			    				}
			    			});

			    		} else {

			    			// is this definition a different version than our current?
			    			var currDef = __cacheToolDefs[def.key];
			    			if (currDef.version != def.version) {

			    				// different version so perform an update:
				    			OPSPortal.NavBar.ToolDefinition.update(def, function(err){
				    				if (err){
				    					onError(err);
				    				} else {
				    					onDone();
				    				}
				    			});

				    		} else {

				    			// same one, so move along... 
				    			onDone();
				    		}

			    		}
			    	}
			    });
    		})

    		// if it was an empty array ... we're done too.
    		if (defs.length == 0) {
    			onDone();
    		}

    		return dfd;
    	},


    	/** 
    	 * OPSPortal.NavBar.ToolDefinition.setupPath()
    	 *
    	 * a routine that ensures a module's OPConfigToolDefinition is created.
    	 * 
    	 * it is intended to be run by the [module]/config/bootstrap.js 
    	 * routine and passed the full path to the tool definition file.
    	 *
    	 * @param {string} pathToDefinition  the full path to the opstool 
    	 *					 definition file.
    	 * @param {fn} cb    (optional) the callback function for when the 
    	 *					 update is complete.  
    	 *					 cb(err);
    	 */
    	setupPath: function(pathToDefinition, cb) {

            // correct missing pathToDef but provided cb
            if (_.isFunction(pathToDefinition)) {
                cb = pathToDefinition;
                pathToDefinition = undefined;
            }

            if (_.isUndefined(pathToDefinition)) {

                // this is a problem!
                var error = new Error('Missing required parameter: pathToDefinition');
                error.code = 'E_MISSINGPARAM';
                if (cb) cb(error);
                return;
            }


    		// check if we can access the file
			fs.access(pathToDefinition, fs.R_OK | fs.F_OK, function(err) {

				if (err) {
					cb(err);
				} else {

					// if so, load the definitions and call .setup()
					var tools = require(pathToDefinition);
					OPSPortal.NavBar.ToolDefinition.setup(tools, cb);

				}
			});

    	},


    	/** 
    	 * OPSPortal.NavBar.ToolDefinition.update()
    	 *
    	 * update the Tool Definition for the given def object.
    	 * 
    	 * the tool definition will be updated based upon the given
    	 * def.key
    	 *
    	 * @param {obj} def  the current tool def values to update.
    	 * 					 must include def.key of tool definition to update
    	 * @param {fn} cb    (optional) the callback function for when the 
    	 *					 update is complete.  
    	 *					 cb(err, updatedDefinition);
    	 * @return {deferred} 
    	 */
    	update:function(def, cb) {

			var dfd = AD.sal.Deferred();


            // correct missing pathToDef but provided cb
            if (_.isFunction(def)) {
                cb = def;
                def = undefined;
            }

            // make sure def is defined
            if (_.isUndefined(def)) {

                // this is a problem!
                var error = new Error('Missing required parameter: def');
                error.code = 'E_MISSINGPARAM';
                if (cb) cb(error);
                dfd.reject(error);
                return dfd;
            }

            // make sure there is a def.key
            if (_.isUndefined(def.key)) {

                // this is a problem!
                var error = new Error('Missing required property: key');
                error.code = 'E_MISSINGKEY';
                if (cb) cb(error);
                dfd.reject(error);
                return dfd;
            }


			// now update the definition:
    		OPConfigToolDefinition.update({key:def.key}, def)
            .exec(function(err, newDef){ 
                if (err) {

                    if (cb) cb(err);
                    dfd.reject(err);

                } else {

                    if (_.isArray(newDef)) {
                        newDef = newDef[0]; // should only match 1!
                    }

                    __cacheToolDefs[def.key] = newDef;

                    if (cb) cb(null, newDef);
                    dfd.resolve(newDef);
                }
            });

			return dfd;

    	},

        remove: function (key, cb) {
            var dfd = AD.sal.Deferred();

            // make sure there is a key
            if (_.isUndefined(key)) {

                // this is a problem!
                var error = new Error('Missing required property: key');
                error.code = 'E_MISSINGKEY';
                if (cb) cb(error);
                dfd.reject(error);
                return dfd;
            }

            OPConfigToolDefinition.destroy({ key: key })
                .exec(function (err) {
                    if (err) {

                        if (cb) cb(err);
                        dfd.reject(err);

                    } else {
                        if (cb) cb(null);
                        dfd.resolve();
                    }
                });

            return dfd;
        }
    }

};



// flush
// remove all the values in our user opsportal config cache.
NavBar.cache.flush = function() {

    __cacheValues = {};
// console.log('... NavBar.Cache flushed!');

}



// loadToolDefs
// make sure we have our tool definitions loaded in our cache.
// @param {fn} cb  nodejs style callback for when all defs are loaded.
var __dfdLoad = null;
function loadToolDefs(cb) {
	if (__cacheToolDefs) {
        __dfdLoad = null;    // reset the dfd marker
		cb();
	} else {

        if (__dfdLoad) {

            __dfdLoad.done(function(err){
                cb();
            })

        } else {

    		__dfdLoad = OPConfigToolDefinition.find()
    		.catch(function(err){
    			cb(err);
    			return null;
    		})
    		.done(function(list){
    			__cacheToolDefs = {};
    			if ((list) && (list.length)) {

    				list.forEach(function(def){
    					__cacheToolDefs[def.key]=def;
    				})
    			}
    			cb();
    			return null;
    		})
        }
	}
}



/**
 * AD.test.events.TEST_BARRELS_POPULATED
 *
 * make sure our cache entries are 'flushed' after barrels have
 * populated the db.  This will make sure our cache values reflect
 * our intended fixture data.
 */
ADCore.queue.subscribe(AD.test.events.TEST_BARRELS_POPULATED, function(){

    console.log('**** OPSPortal.NavBar : flushing Cache After Barrels Populated!');

    // flush the cache once Barrels have Populated the DB:
    __cacheValues = {};
    __cacheToolDefs = null;
});
