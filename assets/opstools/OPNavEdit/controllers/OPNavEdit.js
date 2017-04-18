
steal(
	// List your Controller's dependencies here:
	'opstools/OPNavEdit/models/OPConfigToolDefinition.js',
	'opstools/OPNavEdit/views/OPNavEdit/OPNavEditAreas.ejs',
	'opstools/OPNavEdit/views/OPNavEdit/OPNavEditAreaForm.ejs',
	'opstools/OPNavEdit/views/OPNavEdit/OPNavEditTools.ejs',
	'opstools/OPNavEdit/views/OPNavEdit/OPNavEditToolForm.ejs',
	function() {
		System.import('appdev').then(function() {
			steal.import('appdev/ad',
				'appdev/control/control',
				'OpsPortal/classes/OpsTool',
				'OpsPortal/controllers/OpsPortal',
				'site/labels/opstool-OPNavEdit').then(function() {

					// Namespacing conventions:
					// AD.Control.OpsTool.extend('[ToolName]', [{ static },] {instance} );
					AD.Control.OpsTool.extend('OPNavEdit', {

						init: function(element, options) {
							var self = this;
							var _this = this;
							options = AD.defaults({
								templateDOMAreas: '/opstools/OPNavEdit/views/OPNavEdit/OPNavEditAreas.ejs',
								templateDOMAreaForm: '/opstools/OPNavEdit/views/OPNavEdit/OPNavEditAreaForm.ejs',
								templateDOMTools: '/opstools/OPNavEdit/views/OPNavEdit/OPNavEditTools.ejs',
								templateDOMToolForm: '/opstools/OPNavEdit/views/OPNavEdit/OPNavEditToolForm.ejs',
								resize_notification: 'OPNavEdit.resize',
								tool: null   // the parent opsPortal Tool() object
							}, options);
							this.options = options;

							// Call parent init
							this._super(element, options);

							this.data = {};
							this.data.listAreas = null;
							this.data.listTools = null;
							this.data.listToolDefs = null;
							this.data.resize = null;	// our spacing calculations
							this.data.hashTools = {};

							this.data.hasPendingAreaAdd = false;

							this.dom = {};
							this.dom.area = null;
							this.dom.tools = null;
							this.dom.subLinks = null;

							this.events = {};
							this.events.lastArea = null;

							this.selectedArea = null;

							this.initDOM();
							this.initEvents();


							this.resizeID = AD.comm.hub.subscribe('opsportal.resize', function(key, data){
								if (_this.element) {
									_this.resize(data);
								} else {
									AD.comm.hub.unsubscribe(_this.resizeID);
								}
							});


							AD.comm.socket.subscribe('opsportal_navigation_editor_stale', function(message, data) {

		                        // if we are not currently pending on an Area Add:
		                        if (!_this.data.hasPendingAreaAdd) {
			                        // reload our areas
			                        _this.loadAreas();
			                    }
		                    });

							// if we are told about a new Tool being created
		                    AD.comm.socket.subscribe('opconfigtool.created', function(message, data){

		                    	// make sure we have a model instance of that tool in our Hash:
		                    	if (!_this.data.hashTools[data.data.id]) {

			                    	var Tool = AD.Model.get('opsportal.navigation.OPConfigTool');
			                    	var newTool = new Tool(data.data);
			                    	_this.data.hashTools[newTool.id] = newTool;
			                    }

		                    })
						},



						initAreaPopups:function() {
							var _this = this;


							function createAreaPopup( options) {

								// get it's area model
								var $icon = $(options.elIcon);
								var Model = AD.Model.get('opsportal.navigation.OPConfigArea');
								var area = $icon.parent().data('area');
								var isAdd = false;

								// in the case of the [+] Add  button, there is not a current area
								// so create a new empty one:
								if( typeof area == 'undefined') {
									area = new Model({label:'', icon:''});
									isAdd = true;
								}

								// render popup view
								function myTitle () {
									return '&nbsp;<a class="close" href="#">&times;</a>'
								}

								$icon.popover({
						            placement: 'right',
						            title: myTitle(),
						            trigger: 'click',
						            html: true,
						            content: function () {
						                return _this.renderer.popupArea({area:area, isAdd:isAdd});
						            }

						        }).on('shown.bs.popover', function(e) {
						            //console.log('shown triggered');
						            // 'aria-describedby' is the id of the current popover
						            var current_popover = '#' + $(e.target).attr('aria-describedby');
						            var $cur_pop = $(current_popover);


						            // setup the form
						            var form = new AD.op.Form($cur_pop);
						            form.addField('label', 'string', { notEmpty:{} } );
						            form.addField('icon', 'string', { notEmpty:{} } );
						            form.attach();



						          	// process close / cancel clicks
						            $cur_pop.find('.close').click(function(){
						                $icon.click();
						            });

						            $cur_pop.find('.op-nav-button-cancel').click(function(){
						               $icon.click();
						            });

						            var iconData = $cur_pop.find('[name="icon"]');
						            iconData.change(function(ev){
						            	var $example = $cur_pop.find('.icon-example').removeClass().addClass('icon-example fa '+iconData.val())
						            })


									iconData.iconpicker({ hideOnSelect: true });


						            // process [save] click
						            var buttonSave = $cur_pop.find('.op-nav-button-save');
						            var busySave = new AD.op.ButtonBusy(buttonSave);
						            buttonSave.click(function(){
										if (form.isValid()) {

											busySave.busy();

											var values = form.values();

											// if this is an Add operation,
											// make sure key and weight are also set.
											if (isAdd){
												values.key = values.label;
												values.weight = _this.data.listAreas.length;
											}

											_this.data.hasPendingAreaAdd = true;
											area.attr(values);
											area.save()
											.fail(function(err){
												_this.data.hasPendingAreaAdd = false;
												busySave.ready();
												AD.error.log('Error saving Area', {error:err});

											})
											.then(function(updatedArea){

												_this.data.hasPendingAreaAdd = false;
												// if (isAdd) {
												// 	// _this.data.listAreas.push(area);
												// 	area = new Model({label:'', icon:''});
												// 	// pushing to the list automatically updated the DOM
												// 	// but we have to recreate the popups on the new elements:
												// 	_this.initAreaPopups();
												// 	_this.initSortArea();
												// }
												_this.loadAreas();
												busySave.ready();
												$icon.click();
											})

										}
						            });

						            // process [delete] click
						            var buttonDelete = $cur_pop.find('.op-nav-button-del');
						            var busyDelete = new AD.op.ButtonBusy(buttonDelete);
						            buttonDelete.click(function(){
						            	busyDelete.busy();

						            	area.destroy()
						            	.fail(function(err){
						            		busyDelete.ready();
						            		AD.error.log('Error destroying Area', {error:err});
						            	})
						            	.then(function(){

						            		_this.initAreaPopups();
											_this.initSortArea();
						            		busyDelete.ready();
						            	})
						            })
						        });


						        $icon.attr('op-navbar-init', true);

							}


							// for each area icon not already initialized.
							this.dom.area.find('.op-navbar-item-edit:not([op-navbar-init])').each(function(indx, icon) {

								createAreaPopup({
									elIcon:icon
								});

							});

							// make sure the [+] Add button is initialized if it hasn't already been
							this.dom.area.find('.op-navbar-add:not([op-navbar-init])').each(function(indx, el){
								createAreaPopup({
									elIcon:el
								})
							})


						},



						initToolPopups:function() {
							var _this = this;


							function createToolPopup( options) {

								// get it's area model
								var $icon = $(options.elIcon);
								var Model = AD.Model.get('opsportal.navigation.OPConfigTool');
								var tool = $icon.parent().data('tool');
								var isAdd = false;

								// in the case of the [+] Add  button, there is not a current area
								// so create a new empty one:
								if( typeof tool == 'undefined') {
									tool = new Model({label:'', icon:''});
									isAdd = true;
								}

								// render popup view
								function myTitle () {
									return '&nbsp;<a class="close" href="#">&times;</a>'
								}

								$icon.popover({
						            placement: 'bottom',
						            title: myTitle(),
						            trigger: 'click',
						            html: true,
						            content: function () {
						                return _this.renderer.popupTool({tool:tool, isAdd:isAdd});
						            }

						        }).on('shown.bs.popover', function(e) {
						            //console.log('shown triggered');
						            // 'aria-describedby' is the id of the current popover
						            var current_popover = '#' + $(e.target).attr('aria-describedby');
						            var $cur_pop = $(current_popover);


						            // setup the form
						            var form = new AD.op.Form($cur_pop);
						            form.addField('label', 'string', { notEmpty:{} } );
						            form.addField('icon', 'string', { notEmpty:{} } );
						            form.attach();



						          	// process close / cancel clicks
						            $cur_pop.find('.close').click(function(){
						                $icon.click();
						            });

						            $cur_pop.find('.op-nav-button-cancel').click(function(){
						               $icon.click();
						            });

						            var iconData = $cur_pop.find('[name="icon"]');
						            iconData.change(function(ev){
						            	var $example = $cur_pop.find('.icon-example').removeClass().addClass('icon-example fa '+iconData.val())
						            })

									iconData.iconpicker({ hideOnSelect: true });

						            // process [save] click
						            var buttonSave = $cur_pop.find('.op-nav-button-save');
						            var busySave = new AD.op.ButtonBusy(buttonSave);
						            buttonSave.click(function(){
										if (form.isValid()) {

											busySave.busy();

											var values = form.values();

											// if this is an Add operation,
											// make sure weight is also set.
											if (isAdd){
												values.weight = _this.selectedArea.tools.length;
											}

											if (typeof values.isDefault == 'undefined') {
												values.isDefault = false;
											} else {
												values.isDefault = true;
											}

											tool.attr(values);
											tool.save()
											.fail(function(err){
												busySave.ready();
												AD.error.log('Error saving Tool', {error:err});
											})
											.then(function(updatedTool){
												if (isAdd) {
													_this.data.listTools.push(tool);
													var areaTools = _this.selectedArea.attr('tools');
													areaTools.push(updatedTool);
													// area = new Model({label:'', icon:''});
													// pushing to the list automatically updated the DOM
													// but we have to recreate the popups on the new elements:
													_this.initToolPopups();
													_this.initSortTools();
												}
												busySave.ready();
												$icon.click();
											})

										}
						            });

						            // process [delete] click
						            var buttonDelete = $cur_pop.find('.op-nav-button-del');
						            var busyDelete = new AD.op.ButtonBusy(buttonDelete);
						            buttonDelete.click(function(){
						            	busyDelete.busy();

						            	tool.destroy()
						            	.fail(function(err){
						            		busyDelete.ready();
						            		AD.error.log('Error destroying Tool', {error:err});
						            	})
						            	.then(function(){

											var tools = _this.selectedArea.tools;
											tools.replace(tools.filter(function(t) {
											  return t.id !== tool.id;
											}));
											_this.selectedArea.attr('tools', tools);

											_this.initToolPopups();
											_this.initSortTools();

						            	})
						            })
						        });


						        $icon.attr('op-navbar-init', true);

							}


							// for each area icon not already initialized.
							this.dom.tools.find('.op-navbar-item-edit:not([op-navbar-init])').each(function(indx, icon) {

								createToolPopup({
									elIcon:icon
								});

							});

						},



						initDOM: function() {
							var _this = this;


							// prepare our Area Popup html renderer
							this.renderer = {}
							this.renderer.popupArea = can.view.render(this.options.templateDOMAreaForm);
							this.renderer.popupTool = can.view.render(this.options.templateDOMToolForm);

							var menuFooter = $(this.element.find('#op-menu-widget .op-widget-footer'));
							menuFooter.prepend([
'<ul class="op-list hidden-xs">',
'<li class="op-container op-navbar-editbutton">',
AD.lang.label.getLabelSpan('opnavedit.Edit'),
'</li>',
'</ul>'
							].join('\n'));

//
							// Build the Editors:
							var dfdAreas = this.loadAreas()
							.fail(function(err){
								AD.error.log("Error loading OPNavEdit.Areas", err);
							})
							.then(function(Areas){

								// Async view loading:

								// Load the Area Editing section
								can.view(_this.options.templateDOMAreas, {areas:Areas}, function(frag){

									_this.element.find('.op-stage').append(frag);
									_this.dom.area = _this.element.find('.op-navbar-lpanel');
									_this.dom.area.hide(); // make sure it is hidden.


									_this.initSortArea();
									_this.initAreaPopups();
								});

							})

							var dfdTools = this.loadTools()
							.fail(function(err){
								AD.error.log("Error loading OPNavEdit.Tools ", err);
							})

							var dfdToolDefs = this.loadToolDefs()
							.fail(function(err){
								AD.error.log("Error loading OPNavEdit.ToolDefinitions ", err);
							})

							$.when(dfdAreas, dfdTools, dfdToolDefs).done(function(Areas, Tools, ToolDefs){

								Tools.forEach(function(t){
									_this.data.hashTools[t.id] = t;
								})

								var hashToolDefs = {};
								ToolDefs.forEach(function(td){
									hashToolDefs[td.key] = td;
								})

								// Load the Tool Editing Section
								can.view(_this.options.templateDOMTools, {areas:_this.data.listAreas, hashTools:_this.data.hashTools, toolDefs:ToolDefs }, function(frag){

									_this.element.find('#op-masthead-sublinks').after(frag);
									_this.dom.tools = _this.element.find('#op-navbar-edittools');
									_this.dom.tools.hide();
									// _this.dom.tools.append('<')


						            var busyIcon = _this.element.find('.ops-navbar-toolspinner');
									var busyToolAdd = new AD.op.ButtonBusy(busyIcon.parent());

									var select = _this.dom.tools.find('.ops-navbar-tooldeflist');
									var defaultOption = new Option(AD.lang.label.getLabel('opnavedit.AddNewTool') || 'Add New Tool', "add.new.tool");
									select.append(defaultOption);
									ToolDefs.forEach(function(definition){
										if (definition.key) {
											var option = new Option(definition.label, definition.key);
											select.append($(option));
										}
									})
									select.on('change', function(ev){

										busyToolAdd.busy();

										var keyToolDef = select.val();
										var selectedToolDef = hashToolDefs[keyToolDef];
										if (_this.selectedArea) {

											// tell the server to create the new tool and link it!
											AD.comm.service.post({url:'/opnavedit/newtool', params:{ toolDef:keyToolDef, area:_this.selectedArea.key}})
											.fail(function(err){
												busyToolAdd.ready();
												AD.error.log('Error created OPNavEdit.newTool', {error:err});
											})
											.then(function(results){

												// At this point the Sails socket updates
												// will alert us of changes in our Areas,
												// and the UI view will update.

												// however we want to make sure our loaded Tools
												// are 'fully' populated, so we do a manual load
												// again and update our list:


												// get the new Tool Instances:
												_this.loadTools()
												.fail(function(err){
													AD.error.log('Error loading Tools again!', {error:err});
												})
												.then(function(listTools){

													// stop the busy spinner.
													busyToolAdd.ready();


													// search our hashTools and add any new ones
													listTools.forEach(function(t){
														// if (!_this.data.hashTools[t.id]) {
															_this.data.hashTools[t.id] = t;
														// }
													})


													// reset select list to add entry and
													// verify all current entries have a popup.
													select.val('add.new.tool');
													_this.initToolPopups();


												})

											})

										}

									})

									_this.initSortTools();
									_this.initToolPopups();


									// perform the initial sort of the tool elements by weight.
									_this.dom.tools.find('ul').each(function(i, ul){
										$(ul).find('li').sort(function(a, b){
											return $(a).data('weight') > $(b).data('weight');
										}).appendTo(ul);
									});

								})
							})

							this.dom.subLinks = this.element.find('#op-masthead-sublinks');

							this.dom.stage = $(this.element.find('.op-stage')[0]);


						},


						/*
						 * @function initEvents
						 *
						 * prepare the event listeners
						 */
						initEvents: function() {

							var _this = this;

							// listen for area show notifications.
                            AD.comm.hub.subscribe('opsportal.area.show', function (key, data) {

                            	// we just passively keep track of the last area.show event
                            	// so we know which one to return to once we exit our
                            	// tool.
                            	if (data.area != 'opnavedit') {
	                            	_this.events.lastArea = data;

	                            	// make sure our area is hidden:
	                            	if(_this.dom.area) _this.resetDisplay();
	                            }

                            });

						},


						/**
						 * @function initSortArea
						 * setup the sortable menu area
						 * @return {deferred}
						 */
// 						initSortAreaOld:function(){
// 							var _this = this;

// 							this.dom.area.find( ".sortableMenu" ).sortable({
// 								revert: true,
// 								handle: '.sort-handle',
// 								cursor: 'move',
// 								axis: 'y',
// 								start:function(ev, ui) {
// 									// mark current position in list
// 									ui.item.data('start_pos', ui.item.index());
// 								},
// 								update:function(event, ui) {
// 									var start_pos = ui.item.data('start_pos');
// 									var index  = ui.item.index();

// // 									var numItems = _this.dom.area.find('.sortableMenu li').length;
// // 									for(var i=1;i <= numItems; i++){
// // 							            var area = _this.dom.area.find('.sortableMenu li:nth-child(' + i + ')').data('area');
// // 							            if (area) {
// // 							            	area.attr('weight', i);
// // console.log('    ... area:', area);
// // 							            }
// // 							        }

// 									if (start_pos < index) {

// 								        //update the items before the re-ordered item
// 								        for(var i=index; i >= 0; i--){
// 								            var area = _this.dom.area.find('.sortableMenu li:nth-child(' + (i+1) + ')').data('area');
// 								            if (area) {
// 								            	area.attr('weight', i);
// 								            	area.save()
// 								            	.fail(function(err){
// 								            		AD.error.log('Error updating Area Weight.', err);
// 								            	})
// 								            }
// 								        }

// 								    }else {

// 										var numItems = _this.dom.area.find('.sortableMenu li').length;

// 								        //update the items after the re-ordered item
// 								        for(var i=index;i <= numItems; i++){
// 								            var area = _this.dom.area.find('.sortableMenu li:nth-child(' + (i+1) + ')').data('area');
// 								            if (area) {
// 								            	area.attr('weight', i);
// 								            	area.save()
// 								            	.fail(function(err){
// 								            		AD.error.log('Error updating Area Weight.', err);
// 								            	})
// 								            }
// 								        }
// 								    }

// 								}
// 							});
// 						 //    this.dom.area.find( ".sortableMenu" ).disableSelection();
// 						},

						sortList: function( el, axis, objKey, cursor ) {
							var $list = $(el);
							$list.sortable({
								revert: true,
								handle: '.sort-handle',
								cursor: cursor,
								axis: axis,
								forceHelperSize: true,
								cursorAt: { left: 5 },
								start:function(ev, ui) {
									// mark current position in list
									ui.item.data('start_pos', ui.item.index());
									if (objKey == "tool") {
										$(ui.item[0]).css('width', (ui.item[0].clientWidth + 2) + "px");
										$(ui.item[0]).css('height', "32px");
									}
								},
								update:function(event, ui) {
									var start_pos = ui.item.data('start_pos');
									var index  = ui.item.index();

// 									var numItems = _this.dom.area.find('.sortableMenu li').length;
// 									for(var i=1;i <= numItems; i++){
// 							            var area = _this.dom.area.find('.sortableMenu li:nth-child(' + i + ')').data('area');
// 							            if (area) {
// 							            	area.attr('weight', i);
// console.log('    ... area:', area);
// 							            }
// 							        }

									if (start_pos < index) {

								        //update the items before the re-ordered item
								        for(var i=index; i >= 0; i--){
								            var obj = $list.find('li:nth-child(' + (i+1) + ')').data(objKey);
								            if (obj) {
								            	obj.attr('weight', i);
								            	obj.save()
								            	.fail(function(err){
								            		AD.error.log('Error updating ['+objKey+'] Weight.', err);
								            	})
								            }
								        }

								    }else {

										var numItems = $list.find('li').length;

								        //update the items after the re-ordered item
								        for(var i=index;i <= numItems; i++){
								            var obj = $list.find('li:nth-child(' + (i+1) + ')').data(objKey);
								            if (obj) {
								            	obj.attr('weight', i);
								            	obj.save()
								            	.fail(function(err){
								            		AD.error.log('Error updating ['+objKey+'] Weight.', err);
								            	})
								            }
								        }
								    }

								}
							});

						},


						/**
						 * @function initSortTools
						 * setup the sortable menu area
						 * @return {deferred}
						 */
						initSortArea:function(){
							var _this = this;

							this.dom.area.find( ".sortableMenu" ).each(function(indx, el){

								_this.sortList(el, 'y', 'area', 'ns-resize');
							})
						},



						/**
						 * @function initSortTools
						 * setup the sortable menu area
						 * @return {deferred}
						 */
						initSortTools:function(){
							var _this = this;

							this.dom.tools.find( ".sortableMenu" ).each(function(indx, el){

								_this.sortList(el, 'x', 'tool', 'ew-resize');
							})
						},


						/**
						 * @function loadAreas
						 * load the defined areas from the server.
						 * @return {deferred}
						 */
						loadAreas: function() {
							var dfd = AD.sal.Deferred();
							var _this = this;

							var Areas = AD.Model.get('opsportal.navigation.OPConfigArea');
							if (!this.data.listAreas) {

								// first time through
								Areas.findAll({ where:{}, sort:'weight'})
								.fail(function(err){
									dfd.reject(err);
								})
								.then(function(list){
									list.forEach(function(l){
										if (l.translate) l.translate();
									})
									_this.data.listAreas = list;

									dfd.resolve(list);
								});

							} else {

								// Second time through, probably an update to the Area info
								// try to load the ones we haven't already loaded:
								var currIDs = [];
								_this.data.listAreas.forEach(function(area){
									currIDs.push(area.id);
								})

								Areas.findAll({ where:{ id:{ '!': currIDs }}, sort:'weight'})
								.fail(function(err){
									dfd.reject(err);
								})
								.then(function(list){
									list.forEach(function(l){
										if (l.translate) l.translate();
										// and push them to our current listAreas
										_this.data.listAreas.push(l);
									})

									// make sure any new areas have their popups and sorts ready.
									_this.initAreaPopups();
									_this.initSortArea();
									dfd.resolve(list);
								});

							}

							return dfd;
						},


						/**
						 * @function loadTools
						 * load the defined tools from the server.
						 * @return {deferred}
						 */
						loadTools: function() {
							var dfd = AD.sal.Deferred();
							var _this = this;

							var Tools = AD.Model.get('opsportal.navigation.OPConfigTool');
							Tools.findAll({ where:{}, sort:'weight'})
							.fail(function(err){
								dfd.reject(err);
							})
							.then(function(list){
								list.forEach(function(l){
									if (l.translate) l.translate();
								})
								_this.data.listTools = list;
								dfd.resolve(list);
							});

							return dfd;
						},


						/**
						 * @function loadToolDefss
						 * load the tool definitions from the server.
						 * @return {deferred}
						 */
						loadToolDefs: function() {
							var dfd = AD.sal.Deferred();
							var _this = this;

							var ToolDefs = AD.Model.get('opsportal.navedit.OPConfigToolDefinition');
							ToolDefs.findAll({})
							.fail(function(err){
								dfd.reject(err);
							})
							.then(function(list){
								_this.data.listToolDefs = list;
								dfd.resolve(list);
							});

							return dfd;
						},


						resetDisplay:function() {
							if (this.dom.subLinks) this.dom.subLinks.show();
							if (this.dom.tools) this.dom.tools.hide();
						},


						resize:function(data){
							var _this = this;

							if (data) {
								this.lastResize = data;
							}

							function verticalAdjustments (el) {

								// find padding of el
								var $el = $(el);
								var spacing = 0;
								spacing += parseInt($el.css('padding-top'));
								spacing += parseInt($el.css('padding-bottom'));

								// for each child, calculate sum of outer margins
								$el.children().each(function(i, child){
									var $child = $(child);
									spacing += parseInt($child.css('margin-top'));
									spacing += parseInt($child.css('margin-bottom'));
								})

								return spacing
							}

							if (!this.doResize) {

								// queue up a resize operation
								setTimeout(function(){

									if (!_this.data.resize) {

										// should calculate our resize values!
										_this.data.resize = {};
										_this.data.resize.verticalSpacing = verticalAdjustments(_this.element.find('.op-navbar-lpanel'));
										_this.data.resize.heightMenu = _this.element.find('.op-navbar-area-menu').outerHeight();
									}
									// // we need to resize our menu area.
									// var verticalSpacing = verticalAdjustments(_this.element.find('.op-navbar-lpanel'));
									// _this.heightMenu = _this.element.find('.op-navbar-area-menu').outerHeight();
									if (_this.data.resize.heightMenu) {
										var newHeight = (_this.lastResize.height - _this.data.resize.heightMenu)- _this.data.resize.verticalSpacing-2;

// console.log('... verticalSpacing:' + _this.data.resize.verticalSpacing);
// console.log('... newHeight:'+ newHeight);
										_this.element.find('#op-navbar-left').css('height',  newHeight+'px');
										_this.element.find('.op-navbar-lpanel').css('height', _this.lastResize.height);
									} else {
										// heightMenu isn't properly calculated yet, so rest our resize data
										_this.data.resize = null;
									}
									_this.doResize = false;

								}, 250);
								this.doResize = true;
							}


// this._super(data);
// console.log('... OPNavEdit.resize():', data);

						},


						/**
						 * .op-navbar-editbutton click
						 * What happens when the edit button is clicked.
						 */
						'.op-navbar-editbutton click': function($el, ev) {

							// hide all other areas
							AD.comm.hub.publish('opsportal.area.show', { area: 'opnavedit' });

							// show our area
							this.dom.area.show('slide', {direction: 'left'}, 400);
							this.dom.subLinks.hide();
							this.dom.tools.show();
							this.dom.tools.find('[area-tools]').hide();
							this.element.find('.ops-navbar-AddNewTool').hide();


							//// FIX: for Area List CSS squish
							this.dom.stage.addClass('op-css-nooverflow ');
							this.dom.stage.css('overflow-y', 'visible');

							// close the slide in menu:
							AD.ui.jQuery.sidr('close', 'op-menu-widget');

							ev.preventDefault();
						},


						/**
						 * .ops-navbar-menuItem
						 * clicking on the Area name in the Area List
						 */
						'.ops-navbar-menuItem click': function( $el, ev) {

							var area = $el.parent().data('area');
							if (area) {

								// remember the last selected area
								this.selectedArea = area;

								// hide all area-tools sections
								this.element.find('[area-tools]').hide();

								// only show the one related to this area:
								this.element.find('[area-tools="'+area.key+'"]').show();

								// make sure the add list is shown
								this.element.find('.ops-navbar-AddNewTool').show();
							}
							ev.preventDefault();
						},


						/**
						 * .op-navbar-save click
						 * What happens when the save button is clicked.
						 */
						'.op-navbar-save click' : function ($el, ev) {
							var _this = this;

							//// FIX: for Area List CSS squish
							this.dom.stage.removeClass('op-css-nooverflow');
							this.dom.stage.css('overflow-y', '');

							this.dom.area.hide('slide', {direction: 'left'}, 400, function(){

								// repost last recorded area.show (if exists)
								if (_this.events.lastArea) {
									AD.comm.hub.publish('opsportal.area.show', _this.events.lastArea);
								} else {

									// choose the first menu item, and click it:
									_this.element.find('.op-menu-widget li:first').click();
								}

								// show the original Tool List:
								_this.resetDisplay();

								// close the slide in menu:
								AD.ui.jQuery.sidr('close', 'op-menu-widget');
							});

							ev.preventDefault();
						}


					});


					//
					// NOTE:
					//
					// there is a timing issue once these files are compiled and minified.
					// the OPNavEdit.js file is processed before the OpsPortal controller
					// has a chance to .init() and listen for this event.
					//
					// So here we are attempting to wait until we know the 'opsportal.ready'
					// has fired.
					//
					// but if this file loads after that event is emitted, then we
					// have a fallback delay to fire.

					// alert the OPSPortal we are loaded.
					var __OPNavEditHasPublished = false;
					function __OPNavEditAlert() {
						if (!__OPNavEditHasPublished) {
							__OPNavEditHasPublished = true;
							AD.comm.hub.publish('opsportal.admin.opnavedit', {});
						}
					}
					// trigger our alert once the opsportal.ready event fires
					AD.comm.hub.subscribe('opsportal.ready', __OPNavEditAlert);

					// or wait in case we missed the event:
					setTimeout(__OPNavEditAlert, 7500);

				});
		});

	});
