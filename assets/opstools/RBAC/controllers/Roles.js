
steal(

// List your Controller's dependencies here:
    'opstools/RBAC/models/PermissionAction.js',
    'opstools/RBAC/models/PermissionRole.js',
    'OpsWebixDataCollection.js',
    'OpsWebixSearch.js',
    //        'opstools/RBAC/models/Projects.js',
    //        'appdev/widgets/ad_delete_ios/ad_delete_ios.js',
    // '//opstools/RBAC/views/Roles/Roles.ejs',
    function () {
        System.import('appdev').then(function () {
            steal.import(
                'can/construct/construct',
                'appdev/ad',
                'appdev/control/control').then(function () {
                    //
                    // Roles 
                    // 
                    // This is the interface for managing the list of Roles and their 
                    // various editing options.
                    //


                    // Namespacing conventions:
                    // AD.Control.extend('[application].[controller]', [{ static },] {instance} );
                    AD.Control.extend('opstools.RBAC.Roles', {  


                        init: function (element, options) {
                            var self = this;
                            options = AD.defaults({

                                    uuid:'a',

                                    // templateDOM: '//opstools/RBAC/views/Roles/Roles.ejs'
                                    eventRoleAdd: 'role.add.clicked',
                                    eventRoleEdit: 'role.edit.clicked',
                                    eventRoleDeleted: 'role.deleted'
                            }, options);
                            this.options = options;

                            // Call parent init
                            this._super(element, options);

                            this.dom = {};

                            this.data = {}; 
                            this.data.roles = [];

                            
                            this.initDOM();

                            this.loadActions();


                        },


                        uuid:function(key) {
                            return key+this.options.uuid;
                        },


                        initDOM: function () {

                            var _this = this;


                            //
                            // roleForm
                            // the area to .show() or .hide() for the Role Form.
                            //
                            this.dom.roleForm = this.element.find('.rbac-roles-form');
                            this.dom.roleForm.hide();


                            webix.ready(function(){


                                ////
                                //// Setup the User Search Bar:    
                                ////  
                                var lblPlaceholderSearch = AD.lang.label.getLabel('rbac.roles.search') || 'Search *';           
                                _this.dom.roleSearch = AD.op.WebixSearch({
                                    id:_this.uuid("searchroles"),
                                    container:_this.uuid("search2"),
                                    view:"search",
                                    placeholder:lblPlaceholderSearch,
                                    width:300
                                });
                                _this.dom.roleSearch.AD.filter(function(value){
                                    value = value.toLowerCase();
                                    _this.dom.roleGrid.filter(function(obj){ //here it filters data!
                                        return obj.role_label.toLowerCase().indexOf(value)>=0;
                                    })
                                });


                                ////
                                //// Setup the Role List
                                ////             
                                var lblHeaderName = AD.lang.label.getLabel('rbac.roles.name') || 'Name*';
                                var lblHeaderDescription = AD.lang.label.getLabel('rbac.roles.description') || 'Description*';
                                _this.dom.roleGrid = webix.ui({
                                    id:_this.uuid("rolestable"),
                                    container:_this.uuid("userlist-tbl-role"),
                                    view:"datatable",
                                    // width:483,

                                    columns:[
                                        { id:"role_label",  header:lblHeaderName, width:180, sort:"string"},
                                        { id:"role_description",  header:lblHeaderDescription , fillspace:true},
                                        { id:"copy",  header:"" , width:40, css:{"text-align":"center"}, template:function(obj) { return "<div class='clone fa fa-copy fa-2 offset-9 rbac-role-list-clone' role-id='"+obj.id+"'  ></div>"; } } ,
                                        { id:"trash", header:"" , width:40, css:{"text-align":"center"}, template:"<span class='trash'>{common.trashIcon()}</span>"},
                                    ],


                                    select:"row",
                                    yCount:8, 
                                    scrollY:false,
                                    scrollX:false,
                                    navigation:"true",      

                                    pager:{
                                        template:"{common.prev()} {common.pages()} {common.next()}",
                                        container:_this.uuid("pgb"),
                                        size:8,
                                        group:5,
                                        width:300
                                    },  
                                    on:{
                                        onItemClick:function(id){

                                            _this.roleSelect(id);
                                            return false;
                                        }
                                    },
                                    onClick:{

                                        clone:function(e,id){
                                            var role = this.getItem(id);
                                            var lblConfirmClone = AD.lang.label.getLabel('rbac.roles.confirmClone', [this.getItem(id).role_label]) || 'Clone :'+this.getItem(id).role_label;
                                            webix.confirm({text:lblConfirmClone, 
                                                          
                                                callback:function(result){

                                                    if (result) {

                                                        _this.roleClone(id);

                                                        // var clonedRole = {};
                                                        // clonedRole.actions = [];
                                                        // role.actions.forEach(function(action){
                                                        //     clonedRole.actions.push(action.id);
                                                        // });


                                                        return false;
                                                    }
                                                }
                                            });

                                            return false;
                                        },
                                        trash:function(e, id){

                                            var role = this.getItem(id);
                                            var lblConfirm =  AD.lang.label.getLabel('rbac.roles.confirmDelete', [this.getItem(id).role_label]) || 'Remove :'+this.getItem(id).role_label;
                                            webix.confirm({text:lblConfirm, 
                                                          
                                                   callback:function(result){

                                                       if (result) {

                                                            _this.data.rolesCollection.AD.destroyModel(id)
                                                            .fail(function(err){
                                                                AD.error.log('Error destroying role.', { error:err, role:role, id:id });
                                                            })
                                                            .then(function(oldData){

                                                                _this.dom.roleForm.hide();

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
                                //// Setup the Role Form
                                ////
                                var labelLabel = AD.lang.label.getLabel('rbac.roles.name') || 'Role Name*';
                                var placeHolderLabel = AD.lang.label.getLabel('rbac.roles.label') || 'Role Name*';
                                var labelDesc = AD.lang.label.getLabel('rbac.roles.description') || 'Role Description*';
                                var placeHolderDesc = AD.lang.label.getLabel('rbac.roles.descriptionPlaceholder') || 'Role Description*';
                                _this.dom.formRole = webix.ui({
                                    container:_this.uuid('rbac-roles-form'),
                                    view:"form",
                                    id:_this.uuid('formRole'),

                                    elements:[

                                        { id:"role_label", view: "text", name:"role_label", label:labelLabel, value:'', placeholder: placeHolderLabel, labelPosition:"top" },
                                        { id:"role_description", view: "textarea", name:"role_description", label:labelDesc, labelPosition:"top", value:'', placeholder: placeHolderDesc, height:150 }
                                        
                                    ],

                                    autoheight: true,

                                    on: {

                                    }
                                });

                                //// onChange handlers for each field
                                var fields = ['role_label', 'role_description'];
                                fields.forEach(function(field){
                                    _this.dom.formRole.elements[field].attachEvent("onChange", function(newv, oldv){
                                        var model = _this.data.rolesCollection.AD.currModel();
                                        if (model) {
                                            var modelValue = model.attr(field);
                                            if (modelValue != newv){

                                                model.attr(field, newv);
                                                model.save()
                                                .fail(function(err){
                                                    AD.error.log('Error saving current model.', {error:err, field:field, value:newv });
                                                })
                                                .then(function(){
                                                    // console.log(field+": Value changed from: "+oldv+" to: "+newv);
                                                })
                                            }
                                        }
                                        
                                    });
                                })



                                //// 
                                //// Setup the Action Search
                                ////
                                var lblPlaceholderSearchActions = AD.lang.label.getLabel('rbac.roles.searchActions') || 'Search Actions*';           
                                _this.dom.roleSearchActions = AD.op.WebixSearch({
                                    id:_this.uuid("rbac-search-actions"),
                                    container:_this.uuid("rbac-search-actions"),
                                    view:"search",
                                    placeholder:lblPlaceholderSearchActions,
                                    width:300
                                });
                                _this.dom.roleSearchActions.AD.filter(function(value){
                                    value = value.toLowerCase();
                                    _this.dom.actionGrid.filter(function(obj){ 
                                        return obj.action_key.toLowerCase().indexOf(value)>=0;
                                    })
                                });



                                //// 
                                //// Setup the Action Grid
                                ////

                                _this.dom.actionGrid = webix.ui({
                                    id:_this.uuid("rbacGridActions"),
                                    container:_this.uuid("rbac-grid-actions"),
                                    view:"datatable",
                                    // width:993,
                                    editable:true,

                                    columns:[

                                        { id:"enabled", header:{text:"", template:"{common.checkbox()}"}, width:40, css:{"text-align":"center"}, 
                                            template:function(obj, common, value){
                                                var inThere = false;
                                                var rc = _this.data.rolesCollection;
                                                var currentRole = rc.getItem(rc.getCursor());
                                                if (currentRole.actions) {
                                                    currentRole.actions.forEach(function(a){
                                                        if (a.id == obj.id) {
                                                            inThere = true;
                                                        }
                                                    })
                                                }
                                                if (inThere)
                                                    return "<input class=\"webix_table_checkbox\" type=\"checkbox\" checked=\"true\">";
                                                else
                                                    return "<input class=\"webix_table_checkbox\" type=\"checkbox\" >";
                                            } 
                                        },
                                        { id:"action_key",  header:"Name", width:100, sort:"string"},
                                        { id:"action_description",  header:"Description" , editor:"text", fillspace:true}
                                                    
                                    ],

                                           
                                    select:"row",
                                    yCount:5, 
                                    scrollY:false, 
                                    scrollX:false,
                                    navigation:"true", 


                                    pager:{
                                        template:"{common.first()} {common.prev()} {common.pages()} {common.next()} {common.last()}",
                                        container:_this.uuid("rbac-pager-actions"),
                                        size:5,
                                        group:5,
                                        width:400
                                    },


                                    on:{

                                        onCheck:function(id, column, state) {

                                            if (state) {
                                                _this.actionChecked(id);
                                            } else {
                                                _this.actionUnChecked(id);
                                            }

                                        },

                                        onAfterEditStop: function(state, editor, ignoreUpdate){
                    // console.log('... onAfterEditStop(): state:', state);
                    // console.log('... onAfterEditStop(): editor:', editor);
                    // console.log('... onAfterEditStop(): ignoreUpdate:', ignoreUpdate);

                                            if(state.value != state.old){
                                                // webix.message("Cell value was changed");
                                                var action = _this.data.actionsCollection.AD.getModel(editor.row);
                                                action.attr(editor.column, state.value);
                                                action.save()
                                                .fail(function(err){
                                                    AD.error.log('RBAC:Roles:onAfterEditStop(): error updating action', { error:err, action:action.attr(), editor:editor });
                                                })
                                                .then(function(){
                                                    // webix.message("Model value was changed");
                                                })

                                            }  
                                        }
                                        

                                    } 

                                });



                            });

                        },



                        /*
                         * @actionChecked
                         *
                         * perform the actions to add an action to the current Role.
                         *
                         * @param {int} id  the unique id of the action to work with
                         */
                        actionChecked: function(id) {

// PROBLEM: if you add the action model directly to the role.actions list, 
// then updates to the list will then be recorded on the model directly.
//
// this is a problem when actionUncheck() removes the item from the list,
// for some reason the can.List thinks that instead of having removed an item,
// each element is updated with the data from the next element in the list.
// 
// which means our original model will update it's data with the model's data
// next to it.  We loose our .id and in future actionChecked() calls, we no
// longer can find that model, Dogs and Cats living together, .... Mass hysteria!
//
// SOLUTION:  instead of storing the model itself, we just store the .attr() values
// for the model.


                            // get current action
                            var actionModel = this.data.actionsCollection.AD.getModel(id);
                            var action = actionModel.attr();
                            var role = this.data.rolesCollection.AD.currModel();

                            if (role.actions) {
                                role.actions.push(action);
                            } else {
                                role.actions = new can.List([ action ]);
                            }

                            return role.save()
                            .fail(function(err){
                                AD.error.log('Roles:actionChecked(): error saving action to role:', {error:err, action:action.attr(), role:role.attr() });
                            });

                        },



                        /*
                         * @actionUnChecked
                         *
                         * perform the actions to remove an action from the current Role.
                         *
                         * @param {int} id  the unique id of the action to work with
                         */
                        actionUnChecked: function(id) {

                            // var action = this.data.actionsCollection.AD.getModel(id);
                            var role = this.data.rolesCollection.AD.currModel();

                            if (role.actions) {

                                role.actions.replace(role.actions.filter(function(action) {
                                  return action.id != id;
                                }))


                            } 

                            return role.save()
                            .fail(function(err){
                                AD.error.log('Roles:actionUnChecked(): error removing action from role:', {error:err, id: id, role:role.attr() });
                            });

                        },



                        /**
                         * @listRoleNames
                         *
                         * return an array of current role names.
                         * @return {array}
                         */
                        listRoleNames:function() {
                            var list = [];
                            for (var i = this.data.roles.length - 1; i >= 0; i--) {
                                list.push(this.data.roles[i].role_label);
                            };
                            return list;
                        },



                        /**
                         * @loadActions
                         *
                         * request the list of Action definitions from the server, and
                         * load them into our actionGrid.
                         */
                        loadActions: function() {
                            var _this = this;

                            var Actions = AD.Model.get('opstools.RBAC.PermissionAction'); 
                            Actions.findAll()
                            .fail(function(err){
                                AD.error.log('RBAC:Roles.js: error loading actions.', {error:err});
                            })
                            .then(function(list) {
                                list.forEach(function(l) {
                                    l.translate();
                                })
                                _this.data.actions = list;
                                _this.data.actionsCollection = AD.op.WebixDataCollection(list);
                                if (_this.dom.actionGrid) {
                                    _this.dom.actionGrid.data.sync(_this.data.actionsCollection);
                                }
                            });

                        },



                        /** 
                         * @function loadRoles
                         *
                         * load the given list of roles.
                         * @param {array/can.List} list  the current list of roles.
                         */
                        loadRoles: function(list) {
                            this.data.roles = list;
                            this.data.rolesCollection = AD.op.WebixDataCollection(list);
                            if (this.dom.roleGrid) {
                                this.dom.roleGrid.data.sync(this.data.rolesCollection);
                                this.dom.formRole.bind(this.data.rolesCollection);
                            }
                            this.resize();
                        },



                        /**
                         * @function resize
                         *
                         * this is called when the Role controller is displayed and the window is
                         * resized.  
                         */
                        resize: function() {
                            var pager = this.dom.roleGrid.getPager();
                            this.dom.roleGrid.adjust(); 
                            
                            // now update the related pager/searchbox with the proper $width
                            pager.define('width', this.dom.roleGrid.$width);
                            this.dom.roleSearch.define('width', this.dom.roleGrid.$width/2);

                            // resize everything now:
                            pager.resize();
                            this.dom.roleSearch.resize();


                            this.dom.formRole.adjust();


                            this.dom.actionGrid.adjust();
                            this.dom.roleSearchActions.define('width', this.dom.actionGrid.$width );
                            this.dom.roleSearchActions.resize();
                            

                        },



                        /*
                         * @function roleAdd
                         *
                         * step through the process of adding a new role.
                         */
                        roleAdd:function(){
                            var _this = this;

                            var listNames = this.listRoleNames();

                            var attrs = {};

                            // role names need to be unique
                            attrs.role_label = AD.lang.label.getLabel('rbac.roles.newRole') || 'New Role';
                            attrs.role_description = AD.lang.label.getLabel('rbac.roles.newRoleDescription') || 'Describe this role ...';
                            attrs.role_label += ' ('+ AD.util.uuid().substring(0,4)+')';

                            return this.roleCreate(attrs)
                            .done(function(newRole){

                                // insert at the beginning of our list
                                _this.data.roles.unshift(newRole);
                            });
                        },



                        /*
                         * @function roleClone
                         *
                         * step through the process of cloning a new role.
                         */
                        roleClone:function(id){
                            var _this = this;

                            var origModel = this.data.rolesCollection.AD.getModel(id);
                            var attrs = AD.Model.clone(origModel);
                            delete attrs.permissions;

                            var actions = [];
                            attrs.actions.forEach(function(action){
                                actions.push(action.id);
                            })
                            attrs.actions = actions;

                            var listNames = this.listRoleNames();

                            // role names need to be unique
                            attrs.role_label += ' (cloned) ';
                            while (listNames.indexOf(attrs.role_label) != -1) {
                                attrs.role_label += '.';
                            }

                            return this.roleCreate(attrs)
                            .done(function(newRole){

                                // insert right under our original role
                                var roleIndex = _this.data.roles.indexOf(origModel);
                                _this.data.roles.splice(roleIndex+1, 0, newRole);
                            });

                        },



                        /**
                         * @function roleCreate
                         *
                         * create a new role entry.
                         * @param {json} attrs  the attributes of the role to create.
                         * @return {deferred}
                         */
                        roleCreate:function(attrs) {
                            var _this = this;
                            var dfd = AD.sal.Deferred();

                            var Roles = AD.Model.get('opstools.RBAC.PermissionRole');
                            Roles.create(attrs)
                            .fail(function(err){
                                AD.error.log('Error creating new role.', {error:err, attrs:attrs});
                                dfd.reject();
                            })
                            .then(function(data){

                                // AD.Model's should now auto findOne() created data
                                data.translate();
                                dfd.resolve(data);

                            });

                            return dfd;
                        },



                        /**
                         * @function roleSelect
                         * 
                         * make sure all components are updated reflecting the current role
                         * being selected.
                         *
                         * @param {integer} id the unique id of the role being selected.
                         */
                        roleSelect: function(id) {

                            // set the cursor to this form:
                            this.data.rolesCollection.setCursor(id);
                            this.dom.roleForm.show();
                            this.dom.actionGrid.refresh();
                            this.resize();  
                        },



                        /** 
                         * show()
                         *
                         * when this controller is shown, make sure the bootstrap-table gets properly
                         * refreshed().
                         */
                        show:function() {
                            this._super();
                            this.resize();
                        },



                        /*
                         * The click handler for the [add] button
                         */
                        '.rbac-role-addRole click': function($el, ev) {
                            var _this = this;

                            this.roleAdd()
                            .done(function(){
                                var rc = _this.data.rolesCollection;
                                var id = rc.getIdByIndex(0);
                                _this.dom.roleGrid.select(id);
                                _this.roleSelect(id);
                            });

                        }

                });
        });
    });
});