
steal(
	// List your Controller's dependencies here:
	//'opstools/RBAC/models/Projects.js',
	'opstools/RBAC/models/PermissionScopeObject.js',
	function() {
        System.import('appdev').then(function() {
			steal.import('appdev/ad',
				'appdev/control/control').then(function() {		

					// Namespacing conventions:
					// AD.Control.extend('[application].[controller]', [{ static },] {instance} );
					AD.Control.extend('opstools.RBAC.Scopes', {


						init: function(element, options) {
							var _this = this;
							options = AD.defaults({
								uuid: 's',

								// templateDOM: '/opstools/RBAC/views/Scopes/Scopes.ejs'
							}, options);
							this.options = options;

							// Call parent init
							this._super(element, options);



							this.dom = {};
							this.dom.queryBuilder = null;

                            this.data = {}; 
                            this.data.resize = null;

                            // used as a quick lookup for embedded Scope Object Names
                            this.data.hashScopeObjectNames = {}; // id : 'Name'
                            this.data.hashScopeObjectFilters = {};

                            this.loadScopeObjects()
                            .then(function(list){
                            	_this.initDOM();
                            })

							
						},


                        uuid:function(key) {
                            return key+this.options.uuid;
                        },



						initDOM: function() {
							var _this = this;

							// this.dom.formScope = this.element.find('.rbac-scopes-form');
       //                      this.dom.formScope.hide();


                            webix.ready(function(){


                                ////
                                //// Setup the Scope Search Bar:    
                                ////  
                                var lblPlaceholderSearch = AD.lang.label.getLabel('rbac.scopes.search') || 'Search *';           
                                _this.dom.searchScopes = AD.op.WebixSearch({
                                    id:_this.uuid("scopesearch"),
                                    container:_this.uuid("searchScopes"),
                                    view:"search",
                                    placeholder:lblPlaceholderSearch,
                                    width:300
                                });
                                _this.dom.searchScopes.AD.filter(function(value){
                                    value = value.toLowerCase();
                                    _this.dom.scopeGrid.filter(function(obj){ //here it filters data!
                                        return (obj.label && obj.label.toLowerCase().indexOf(value)>=0)
                                        		|| (obj.description && obj.description.toLowerCase().indexOf(value)>=0);
                                    })
                                });



								////
                                //// Setup the Scope List
                                ////             
                                var lblHeaderName = AD.lang.label.getLabel('rbac.roles.name') || 'Name*';
                                var lblHeaderDescription = AD.lang.label.getLabel('rbac.roles.description') || 'Description*';
                                var lblHeaderObject = AD.lang.label.getLabel('rbac.scopes.object') || 'Object*';
                                _this.dom.scopeGrid = webix.ui({
                                    id:_this.uuid("scopestable"),
                                    container:_this.uuid("list-tbl-scope"),
                                    view:"datatable",
                                    // width:483,

                                    columns:[
                                        { id:"label",  header:lblHeaderName, width:180, sort:"string"},
                                        { id:"description",  header:lblHeaderDescription , fillspace:true},
                                        { id:"object",  header:lblHeaderObject, width:180, sort:"string", template:function(obj){
                                        	if (obj.object) {
                                        		var id = obj.object.id || obj.object;
                                        		return _this.data.hashScopeObjectNames[id] || id;
                                        	} 
                                        	return '-';
                                        }},
                                        { id:"copy",  header:"" , width:40, css:{"text-align":"center"}, template:function(obj) { return "<div class='clone fa fa-copy fa-2 offset-9 rbac-scope-list-clone' scope-id='"+obj.id+"'  ></div>"; } } ,
                                        { id:"trash", header:"" , width:40, css:{"text-align":"center"}, template:"<span class='trash'>{common.trashIcon()}</span>"},
                                    ],


                                    select:"row",
                                    yCount:8, 
                                    scrollY:false,
                                    scrollX:false,
                                    navigation:"true",      

                                    pager:{
                                        template:"{common.prev()} {common.pages()} {common.next()}",
                                        container:_this.uuid("pgb-scope"),
                                        size:8,
                                        group:5,
                                        width:300
                                    },  
                                    on:{
                                        onItemClick:function(id){

											_this.scopeSelect(id);
                                            return false;
                                        }
                                    },
                                    onClick:{

                                        clone:function(e,id){
                                            var role = this.getItem(id);
                                            var lblConfirmClone = AD.lang.label.getLabel('rbac.scopes.confirmClone', [this.getItem(id).label]) || '*Clone :'+this.getItem(id).label;
                                            webix.confirm({text:lblConfirmClone, 
                                                          
                                                callback:function(result){

                                                    if (result) {

														_this.scopeClone(id);

                                                        return false;
                                                    }
                                                }
                                            });

                                            return false;
                                        },
                                        trash:function(e, id){

                                            var scope = this.getItem(id);
                                            var lblConfirm =  AD.lang.label.getLabel('rbac.roles.confirmDelete', [this.getItem(id).role_label]) || 'Remove :'+this.getItem(id).role_label;
                                            webix.confirm({text:lblConfirm, 
                                                          
                                                   callback:function(result){

                                                       if (result) {

															_this.data.scopesCollection.AD.destroyModel(id)
															.fail(function(err){
															    AD.error.log('Error destroying scope.', { error:err, model:scope, id:id });
															})
															.then(function(oldData){

																_this.dom.formScope.hide();

															});

                                                            return false;
                                                       }
                                                   }
                                            });

                                            return false;
                                        }
                                    }
                                }); 



                                ////
                                //// Setup the Scope Form
                                ////
                                var scopeList = [];
                                _this.data.scopeObjects.forEach(function(o){
                                	scopeList.push({ value:o.name, id:o.id });
                                });
                                var labelLabel = AD.lang.label.getLabel('rbac.roles.name') || 'Scope Name*';
                                var placeHolderLabel = AD.lang.label.getLabel('rbac.scopes.labelPlaceholder') || 'Enter a Name*';
                                var labelDesc = AD.lang.label.getLabel('rbac.roles.description') || 'Role Description*';
                                var placeHolderDesc = AD.lang.label.getLabel('rbac.scopes.descriptionPlaceholder') || 'Scope Description*';
                                var labelObject = AD.lang.label.getLabel('rbac.scopes.object') || 'Object*';
                                var labelButtonSave = AD.lang.label.getLabel('ab.common.save') || 'Save*';
                                var labelButtonCancel = AD.lang.label.getLabel('ab.common.cancel') || 'Cancel*';

                                _this.dom.formScope = webix.ui({
                                    container:_this.uuid('rbac-scopes-form'),
                                    view:"form",
                                    id:_this.uuid('formScope'),

                                    autoheight: true,

                                    elements:[

                                    	{
                                    		id: _this.uuid('scopeFormInputs'),
                                    		rows:[

		                                        { id:_this.uuid("form_label"), view: "text", name:"label", label:labelLabel, value:'', placeholder: placeHolderLabel, labelPosition:"top" },
		                                        { id:_this.uuid("form_description"), view: "textarea", name:"description", label:labelDesc, labelPosition:"top", value:'', placeholder: placeHolderDesc, height:150 },
		                                        { id:_this.uuid("form_object"), view: "select", name:"object", label:labelObject, labelPosition:"top",  options:scopeList,
		                                        	on:{
		                                        		onChange:function(newv, oldv){
		                                        			console.log('... embedded onChange()');
		                                        		}
		                                        	}
		                                        }
                                    		]
                                    	},
                                        { 	view:'label', label:'Filter' },
                                        { 
                                        	id:_this.uuid('form_queryBuilder'), 
                                        	view:'template', 
                                        	label:'Query:',
                                        	name:'filterUI',
                                        	height:100,
                                        	template:function(obj){
                                        		return "<div id='"+_this.uuid('qb')+"'></div>";
                                        	}
                                        },
                                        {
                                        	id: _this.uuid('scopeFormButtons'),
                                        	rows:[
												{ height: 5 },
												{
													margin: 5, 
													cols: [
														{ fillspace: true },
														{
															view: "button", 
															value: labelButtonCancel, 
															width: 100, 
															click: function () {
																_this.dom.formScope.hide();
															}
														},
														{
															view: "button", 
															label: labelButtonSave, 
															type: "form", 
															width: 100, 
															click: function () {

																var model = _this.data.scopesCollection.AD.currModel();
						                                        if (model) {

						                                        	var formValues = $$(_this.uuid('formScope')).getValues();

						                                        	formValues.filterUI = _this.getQueryBuilderEL().queryBuilder('getRules');
						                                        	console.log('... formValues:', formValues);
// todo: if( model.validate() ) { }
																	// remove current filterUI to ensure we only have what is received
																	// from the QueryBuilder
																	// NOTE: if we removed rules, and .attr('filterUI') with the result,
																	// .attr() interprets it as an update of the existing set, not replacing it.
																	model.removeAttr('filterUI');

																	// update the model and save
					                                                model.attr(formValues);
					                                                model.save()
					                                                .fail(function(err){
					                                                    AD.error.log('Error saving current model.', {error:err, field:field, value:newv, model:model });
					                                                })
					                                                .then(function(){
					                                                   _this.dom.formScope.hide(); 
					                                                })
							                                          
						                                        }


// then when loading, load QB with the filterUI
// cancel should hide() form and clear cursor
															}
														}
													]
												}
                                        	]
                                        }

                                    ]
                                    
                                });

//                                 //// onChange handlers for each field
//                                 var fields = ['label', 'description'];
//                                 fields.forEach(function(field){
//                                     _this.dom.formScope.elements[field].attachEvent("onChange", function(newv, oldv){
//                                         var model = _this.data.scopesCollection.AD.currModel();
//                                         if (model) {
//                                             var modelValue = model.attr(field);

//                                             if (newv != '') {
// 	                                            if (modelValue != newv){
// // todo: if( model.validate() ) { }
// 	                                                model.attr(field, newv);
// 	                                                model.save()
// 	                                                .fail(function(err){
// 	                                                    AD.error.log('Error saving current model.', {error:err, field:field, value:newv, model:model });
// 	                                                })
// 	                                                .then(function(){
// 	                                                    console.log(field+": Value changed from: "+oldv+" to: "+newv);
// 	                                                })
// 	                                            }
// 	                                        }
//                                         }
                                        
//                                     });
//                                 })

								_this.dom.formScope.elements.object.attachEvent("onChange", function(newv, oldv){

                                    var model = _this.data.scopesCollection.AD.currModel();
                                    if (model) {
                                        var modelValue = model.attr('object');

                                        modelValue = modelValue? modelValue.id || modelValue: '';
                                        newv = newv.id || newv;

                                        if (modelValue != newv){

											AD.op.Dialog.Confirm({
						                        message: AD.lang.label.getLabel('rbac.scopes.objectChange') || "* Are you sure you want to change this?",
						                        callback: function (result) {
						                            if (result) {

						                            	// reset the Query Builder for this object
						                            	model.object = newv;
														var el = _this.queryBuilderInit(model);

						                            } else {
						                            	// change it back:
						                            	$$(_this.uuid("form_object")).setValue( oldv );
						                            }
						                        }
						                    });
                                        }
                                        
                                    }
                                });


								_this.dom.formScope.hide();



                            }); // end webix.ready()


						},


						getQueryBuilderEL: function() {

							if (!this.dom.queryBuilder) {
								this.dom.queryBuilder = $($('#'+this.uuid('qb')));
							}

							return this.dom.queryBuilder;
						},



                        /**
                         * @listScopeNames
                         *
                         * return an array of current scope names.
                         * @return {array}
                         */
                        listScopeNames:function() {
                            var list = [];
                            for (var i = this.data.scopes.length - 1; i >= 0; i--) {
                                list.push(this.data.scopes[i].label);
                            };
                            return list;
                        },



                        /** 
                         * @function loadScopes
                         *
                         * load the given list of scopes.
                         * @param {array/can.List} list  the current list of scopes.
                         */
                        loadScopes: function(list) {
                        	var _this = this;

                            this.data.scopes = list;
                            this.data.scopesCollection = AD.op.WebixDataCollection(list);
                            if (this.dom.scopeGrid) {
                                this.dom.scopeGrid.data.sync(this.data.scopesCollection);
								this.dom.formScope.bind(this.data.scopesCollection);
                            }

                            // when we change scopes, make sure the form shows the proper object entry:
                            // the list of scopes here contain .object = { id:x, ... } while the select
                            // list expects just the .id value.  
                            this.data.scopesCollection.attachEvent("onAfterCursorChange", function(id){

								var obj = _this.data.scopesCollection.getItem(id);
								if (obj.object) {
									$$(_this.uuid("form_object")).setValue( obj.object.id );
								} else {
									$$(_this.uuid("form_object")).setValue( '' );
								}

								// update QB with the current set of filterUI rules.
								_this.queryBuilderInit(obj);
                				
							});

                            this.resize(this.data.resize);
                        },



                        loadScopeObjects: function() {
                        	var _this = this;

							var ScopeObjects = AD.Model.get('opstools.RBAC.PermissionScopeObject'); 
                            return ScopeObjects.findAll()
                            .fail(function(err){
                                AD.error.log('RBAC:Scopes.js: error loading ScopeObjects.', {error:err});
                            })
                            .then(function(list) {
                                list.forEach(function(l) {
                                    l.translate();
                                })
                                _this.data.scopeObjects = list;
                                list.forEach(function(obj){
                                	_this.data.hashScopeObjectNames[obj.id] = obj.name;
                                })

                            });
                        },


                        queryBuilderAttributeToFilter: function(id, def, soFilter) {

                        	var filter = {
                        		id:id,
                        		label:id,
                        		type:'string'
                        	}

                        	if (soFilter) {

                        		for (var a in soFilter) {
                        			filter[a] = soFilter[a];
                        		}

                        	} else {

	                        	if (def.type) {

	                        		switch( def.type) {
// Types: string, integer, double, date, time, datetime and boolean.
// 
	                        			case 'datetime':
	                        				filter.type = 'datetime';
	                        				break;

	                        			case 'string':
	                        			case 'text':
	                        				filter.type = 'string';
	                        				// filter.size = 50; // horizontal size of the text box

	                        				break;

	                        			case 'integer':
	                        				filter.type = 'integer';
	                        				break;

	                        		}
	                        	}
                        	}

                        	return filter;
                        },



                        queryBuilderInit: function(scope) {
                        	var _this = this;
                        	
                        	

                    		if (scope.object) {

                    			// lookup ScopeObject
                    			var objID = scope.object.id || scope.object;



                    			function updateQB(currentFilters) {
                    				// update component
									var el = _this.getQueryBuilderEL();
									el.queryBuilder('destroy');
	                				el.queryBuilder({
	                					filters:currentFilters,
	                					rules:scope.filterUI
	                				})
                    			}



                    			// if we have already built our filters, then update the queryBuilder
                    			if (_this.data.hashScopeObjectFilters[objID]) {

                    				updateQB(_this.data.hashScopeObjectFilters[objID]);

                    			} else {
                    				// ELSE build our filters:

	                    			// get Definition
	                    			AD.comm.service.get({
	                    				url:'/site/permission/scopeobject/:id/definition'.replace(':id', objID)
	                    			})
	                    			.fail(function(err){
	                    				AD.error.log('scopeobject/'+objID+'/definition request failed.', { error:err, id:objID})
	                    			})
	                    			.done(function(result){

	                    				// build filters
	                    				var filters = [
												// {
												//     id: 'name2',
												//     label: 'Name2',
												//     type: 'string'
												// }
	                    				];

	                    				if (result.attributes) {
	                    					for(var a in result.attributes) {
	                    						filters.push( _this.queryBuilderAttributeToFilter(a, result.attributes[a], (result.filters && result.filters[a]) || null ) );
	                    					}
	                    				}

	                    				
		                				_this.data.hashScopeObjectFilters[objID] = filters;
		                				updateQB(filters);

	                    			})
	                    		}


                    		} else {

                    			// display message that no Object is selected
                    			var el = _this.getQueryBuilderEL();
                    			el.queryBuilder('destroy');
                    			el.html('No object selected.');
                    		}

                        },



                        /**
                         * @function resize
                         *
                         * this is called when the Scope controller is displayed and the window is
                         * resized.  
                         */
                        resize: function(data) {

                        	if (this.dom.scopeGrid) {
	                            var pager = this.dom.scopeGrid.getPager();
	                            this.dom.scopeGrid.adjust(); 

                            
	                            // now update the related pager/searchbox with the proper $width
	                            pager.define('width', this.dom.scopeGrid.$width);
	                            this.dom.searchScopes.define('width', this.dom.scopeGrid.$width/2);

	                            // resize everything now:
	                            pager.resize();
	                            if (this.dom.searchScopes) this.dom.searchScopes.resize();


	                            // if this came from our RBAC controller, we have height info:
	                            if (data) {

	                            	this.data.resize = data;

		                            // adjust height of query Builder:
		                            var totalHeight = data.height;
		                            

		                            // height already used up until our query builder:
		                            var formInputs = $$(this.uuid('scopeFormInputs')).getNode();
									var heightInputs = $(formInputs).outerHeight(true);


		                            // find the height of the form Buttons row
									var formButtons = $$(this.uuid('scopeFormButtons')).getNode();
									var heightButtons = $(formButtons).outerHeight(true);


		                            // calculate remaining height and assign to our form query builder:
		                            var remainingHeight = totalHeight - heightInputs - heightButtons - 100;

		                            var formQueryBuilder = $$(this.uuid('form_queryBuilder'));
		                            formQueryBuilder.define({height:remainingHeight});
		                            formQueryBuilder.resize();
		                        }

		                        // resize the formScope object (after the height adjustment)
		                        if (this.dom.formScope) this.dom.formScope.adjust();

	                        }
                            
                        },



                        /*
                         * @function scopeAdd
                         *
                         * step through the process of adding a new role.
                         */
                        scopeAdd:function(){
                            var _this = this;

                            var listNames = this.listScopeNames();

                            var attrs = {};

                            // role names need to be unique
                            attrs.label = AD.lang.label.getLabel('rbac.scopes.newScope') || 'New Scope*';
                            attrs.description = AD.lang.label.getLabel('rbac.scopes.newScopeDescription') || '*Describe this scope ...';
                            while (listNames.indexOf(attrs.label) != -1) {
                                attrs.label += '.';
                            }

                            return this.scopeCreate(attrs)
                            .done(function(newModel){

                                // insert at the beginning of our list
                                _this.data.scopes.unshift(newModel);
                            });
                        },



                        /*
                         * @function scopeClone
                         *
                         * step through the process of cloning a new scope.
                         */
                        scopeClone:function(id){
                            var _this = this;

                            var origModel = this.data.scopesCollection.AD.getModel(id);
                            var attrs = AD.Model.clone(origModel);

                            var listNames = this.listScopeNames();

                            // names need to be unique
                            attrs.label += ' (cloned) ';
                            while (listNames.indexOf(attrs.label) != -1) {
                                attrs.label += '.';
                            }

                            return this.scopeCreate(attrs)
                            .done(function(newScope){

                                // insert right under our original 
                                var index = _this.data.scopes.indexOf(origModel);
                                _this.data.scopes.splice(index+1, 0, newScope);
                            });

                        },



                        /**
                         * @function scopeCreate
                         *
                         * create a new role entry.
                         * @param {json} attrs  the attributes of the role to create.
                         * @return {deferred}
                         */
                        scopeCreate:function(attrs) {
                            var _this = this;
                            var dfd = AD.sal.Deferred();

                            var Model = AD.Model.get('opstools.RBAC.PermissionScope');
                            Model.create(attrs)
                            .fail(function(err){
                                AD.error.log('Error creating new scope.', {error:err, attrs:attrs});
                                dfd.reject();
                            })
                            .then(function(data){

                                // AD.Model's should now auto findOne() created data
                                if (data.translate) data.translate();
                                dfd.resolve(data);

                            });

                            return dfd;
                        },



                        /**
                         * @function scopeSelect
                         * 
                         * make sure all components are updated reflecting the current scope
                         * being selected.
                         *
                         * @param {integer} id the unique id of the scope being selected.
                         */
                        scopeSelect: function(id) {

                            // set the cursor to this form:
                            this.dom.formScope.show();
                            this.data.scopesCollection.setCursor(id);
							
// this.dom.actionGrid.refresh();
                            this.resize(this.data.resize);  
                        },



                        /** 
                         * show()
                         *
                         * when this controller is shown, make sure the bootstrap-table gets properly
                         * refreshed().
                         */
                        show:function() {
                            this._super();
                            this.resize(this.data.resize);
                        },



                        /*
                         * The click handler for the [add] button
                         */
                        '.rbac-scope-addScope click': function($el, ev) {
                            var _this = this;

                            this.scopeAdd()
                            .done(function(){
                                var rc = _this.data.scopesCollection;
                                var id = rc.getIdByIndex(0);
                                _this.dom.scopeGrid.select(id);
                                _this.scopeSelect(id);
                            });

                        }


					});

				});
		});

	});