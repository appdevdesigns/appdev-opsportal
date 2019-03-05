
steal(

// List your Controller's dependencies here:
    // 'opstools/RBAC/models/SiteUser.js',
    'opstools/RBAC/models/Permission.js',
    // 'opstools/RBAC/models/PermissionRole.js',
    // 'opstools/RBAC/models/PermissionScope.js',

    'OpsWebixDataCollection.js',
    'OpsWebixSearch.js',

    // '//opstools/RBAC/views/Users/Users.ejs',
    function () {
        System.import('appdev').then(function () {
            steal.import(
                'can/construct/construct',
                'appdev/ad',
                'appdev/control/control').then(function () {
            
                    //
                    // Users 
                    // 
                    // This is the interface for managing the list of Users and their 
                    // assignment QuickView.
                    //
                    //

                    // Namespacing conventions:
                    // AD.Control.extend('[application].[controller]', [{ static },] {instance} );
                    AD.Control.extend('opstools.RBAC.Users', {  


                        init: function (element, options) {
                            var self = this;
                            options = AD.defaults({
                                    // templateDOM: '//opstools/RBAC/views/Users/Users.ejs'
                                    uuid:'a',
                                    eventAssignmentAdd : 'assign.add',
                                    eventPermissionList: 'perm.list'
                            }, options);
                            this.options = options;

                            // Call parent init
                            this._super(element, options);


                            this.dom = {};      // hold all our DOM widgets:
                            this.data = {};     // hold any data we are working with.
                            this.data.permissions = [];  // all permission fields
                            this.data.roles = [];   // all the roles in the system
                            this.data.scopes = [];  // all the scopes in the db


                            this.initDOM();


                        },


                        uuid:function(key) {
                            return key+this.options.uuid;
                        },


                        initDOM: function () {
                            var _this = this;

                            this.dom.userPanel = this.element.find('.rbac-user-display');
                            this.dom.userPanel.hide();


                            this.dom.userRoleScope = this.element.find('.rbac-user-roleScope');
                            this.dom.userRoleScope.hide();

                            this.dom.userRoleScopeForm = this.element.find('.rbac-user-roleScope-form');
                            var templateAddUserPermission = this.domToTemplate(this.dom.userRoleScopeForm);
                            can.view.ejs('RBAC_User_AddUserPermission', templateAddUserPermission);


                            //// Create a Form for our Add Permission
                            this.form = new AD.op.Form(this.dom.userRoleScopeForm);
                            this.form.addField('role', 'integer', { notEmpty: {} });
                            this.form.addField('scope', 'array', { notEmpty: {} });


                            this.dom.userRoleScopeEdit = this.element.find('.rbac-user-roleScopeEdit');
                            this.dom.userRoleScopeEdit.hide();


                            this.dom.userRoleScopeEditForm = this.element.find('.rbac-user-roleScopeEdit-form');
                            var templateEditUserPermission = this.domToTemplate(this.dom.userRoleScopeEditForm);
                            can.view.ejs('RBAC_User_EditUserPermission', templateEditUserPermission);


                            //// Create a Form for our Add Permission
                            this.formEdit = new AD.op.Form(this.dom.userRoleScopeEditForm);
                            // this.formEdit.addField('role', 'integer', { notEmpty: {} });
                            this.formEdit.addField('scope', 'array', { notEmpty: {} });


                            //// Create our Busy buttons:
                            this.button = {};
                            this.button.add = new AD.op.ButtonBusy(this.element.find('.rbac-user-addPerm-add'));
                            this.button.update = new AD.op.ButtonBusy(this.element.find('.rbac-user-editPerm-update'));
                            this.button.cancel = new AD.op.ButtonBusy(this.element.find('.rbac-user-addPerm-cancel'));
                            this.button.cancelEdit = new AD.op.ButtonBusy(this.element.find('.rbac-user-editPerm-cancel'));


                            //// Now initialize the Webix components:
                            webix.ready(function(){


                                ////
                                //// Setup the User Search Bar:    
                                ////   
                                var lblPlaceholderSearchUser = AD.lang.label.getLabel('rbac.user.search') || 'Search *';              
                                _this.dom.userSearch = AD.op.WebixSearch({
                                    id:_this.uuid("searchuser"),
                                    container:_this.uuid("search1"),
                                    view:"search",
                                    placeholder:lblPlaceholderSearchUser,
                                    width:220
                                });
                                _this.dom.userSearch.AD.filter(function(value){
                                    value = value.toLowerCase();
                                    _this.dom.userGrid.filter(function(obj){ //here it filters data!
                                        return obj.username.toLowerCase().indexOf(value)>=0;
                                    })
                                });
                                        
                                                            
                                                            

                                ////
                                //// Setup the User List
                                ////
                                var lblHeaderUserID = AD.lang.label.getLabel('rbac.users.userID') || 'User ID*';
                                var lblHeaderStatus = AD.lang.label.getLabel('rbac.users.status') || 'Status*';
                                var lblHeaderIsActive = AD.lang.label.getLabel('rbac.users.isActive') || 'Is Active*';
                                // Note that there is a SiteUser.id field. But the "User ID" column actually
                                // refers to the SiteUser.username field instead.
                                _this.dom.userGrid = webix.ui({
                                    id:_this.uuid("usertable"),
                                    container:_this.uuid("userlist-tbl"),

//// LEFT OFF HERE:
// keep updating the reference to our Webix containers so we can have multiple 
// copies of RBAC loaded at once.
// next:  footer pager

                                    view:"datatable",
                                    
                                    // Idea: how about combining the '#' column with the 'Status' column?
                                    //       They both refer to the same field. Maybe use a colored background?
                                    
                                    columns:[
                                        { id:"numPermissions",  header:"#",    template:function(obj){ 
                                            return obj.permission.length; 
                                        },   width:50,   css:"rank",    sort:"int" },
                                        { id:"username",  header:lblHeaderUserID,   sort:"string", fillspace:true },
                                        { id:"status",  header:lblHeaderStatus, width:80, 
                                            template:function(obj){ 
                                                if ( obj.permission.length == 0) {
                                                    return "<div class='img-thumbnail stats-red'></div>";
                                                } else {
                                                    return "<div class='img-thumbnail stats-green'></div>";
                                                }
                                            }, 
                                            css:{ "text-align":"center" } 
                                        },
                                        { 
                                            id: "isActive", 
                                            header: lblHeaderIsActive,
                                            template: function(obj) {
                                                if (obj.isActive) {
                                                    return '<span class="glyphicon glyphicon-ok"></span>';
                                                } else {
                                                    return '<span class="glyphicon glyphicon-ban-circle"></span>';
                                                }
                                            },
                                            css: { 'text-align': 'center' }
                                        },
                                        {
                                            id: "editUser", 
                                            header: '', 
                                            width: 40,
                                            template: '<a href="#" class="rbac-user-editUser" user_id="#id#">'
                                                    + '<span class="glyphicon glyphicon-cog"></span>'
                                                    + '</a>',
                                            css: { 'text-align': 'center' }
                                        },
                                    ],


                                    select:"row",
                                    // yCount:8, 
                                    scrollY:false,
                                    scrollX:false,
                                    navigation:"true", 

                                    autoheight: true,     


                                    pager:{
                                        template:"{common.first()} {common.prev()} {common.pages()} {common.next()} {common.last()}",
                                        container:_this.uuid("paging_here"),
                                        // size:8,
                                        group:5
                                    },  

                                    on:{
                                        onItemClick:function(id){

                                            // this datatable is synced with our usersCollection
                                            // and so is our selected form, so we need to make sure
                                            // the userCollection's cursor is set to the selected
                                            // id:
                                            _this.userSelect(id);

                                        }
                                    }
                                });  



                                ////
                                //// setup the Selected User Name Form
                                ////
                                var lblNoUserSelected = AD.lang.label.getLabel('rbac.user.noUserSelected') || 'no user selected';
                                _this.dom.userName = webix.ui({
                                    id:_this.uuid("username"),
                                    container:_this.uuid("userdisplay"),
                                    view:"form",
                //                       hidden: true,
                                    elements:[

                                        { view: "text", name:"username", value:lblNoUserSelected, disabled:true }

                                    ],
                                    borderless: true,
                                    paddingY: 8,
                                    paddingX: 0,
                                    margin: 0,

                                    width:185
                                    
                                }); 



                                //// 
                                //// Setup the Permission List
                                ////
                                var lblHeaderRoles = AD.lang.label.getLabel('rbac.Roles') || 'Roles*';
                                var lblHeaderScopes = AD.lang.label.getLabel('rbac.Scopes') || 'Scopes*';
                                var lblHeaderEnabled = AD.lang.label.getLabel('rbac.users.enabled') || 'Enabled*';
                                _this.dom.userPermissions = webix.ui({
                                    container:_this.uuid("rolesNscopes"),
                                    view:"datatable",
                                    id:_this.uuid("assignments"),
                                    columns:[
                                        { id:"role",   header:lblHeaderRoles,  width:180, template:function(obj){
                                            // var role = _this.roleForID(obj.role.id);
                                            return obj.role.role_label; // role.role_label || role.translations[0].role_label;
                                        }},
                                        { id:"scope",  header:lblHeaderScopes, fillspace:true, template:function(obj){
                                            var scopes = [];
                                            if (obj && (obj.scope)) {
                                                obj.scope.forEach(function(s){
                                                    scopes.push(s.label);
                                                });
                                            }
                                            return scopes.join(', ');
                                        }},
                                        { id:"enabled", header:lblHeaderEnabled , width:80, css:{"text-align":"center"}, template:"{common.checkbox()}"},
                                        { id:"trash", header:"" , width:40, css:{"text-align":"center"}, template:"<span class='trash'>{common.trashIcon()}</span>"},                        
                                    ],
                                    select:"row",

                                    yCount:8, 
                                    scrollY:false, 
                                    scrollX:false,

                                    navigation:"true",

                                    on: {

                                        onItemClick: function(id, e, node){
                                            _this.formEditShow(id);
                                            _this.data.userPermissionCollection.setCursor(id);
                                        },

                                        onCheck: function(row, column, state){
                                    
                                            // get the permission object:
                                            var perm = _this.dom.userPermissions.getItem(row);
                                            if (state) {
                                                _this.permissionEnable(perm);
                                            } else {
                                                _this.permissionDisable(perm);
                                            }

                                        }
                                    },

                                    onClick:{

                                        trash:function(e, id){
                                            
                                            var perm = this.getItem(id);
                                            var text = AD.lang.label.getLabel('rbac.user.confirmRemoveRole', [perm.role.role_label]);

                                            webix.confirm({

                                                text:text, 
                                                          
                                                callback:function(result){

                                                    if (result) {

                                                        if(!id){
                                                            webix.message("No item is selected!");
                                                            return;
                                                        }

                                                        _this.permissionRemove(perm)
                                                        .fail(function(err){
                                                            // .removePermission() already handles error messages ...
                                                            // AD.error.log('Problem removing permission.', { error:err, perm:perm } );
                                                            webix.message("There was a problem trying to remove this permission.");
                                                        })
                                                        .then(function(){
                                                            // remove from list
                                                            _this.dom.userPermissions.remove(id);

                                                            // update user's display
                                                            var currUserID = _this.data.usersCollection.getCursor();
                                                            _this.userSelect(currUserID);
                                                        })
                                                        
                                                        return false;
                                                    }
                                                }
                                            });

                                            return false;
                                           
                                        }

                                    }
                                
                                }); 
                                
                                
                                // Add User window
                                var lblAddUser = AD.lang.label.getLabel('rbac.AddUser') || 'Add User';
                                var lblUsername = AD.lang.label.getLabel('rbac.username') || 'Username';
                                var lblPassword = AD.lang.label.getLabel('rbac.password') || 'Password';
                                var lblEmail = AD.lang.label.getLabel('rbac.email') || 'Email';
                                _this.dom.addUserWindow = webix.ui({
                                    view: 'window',
                                    head: lblAddUser,
                                    position: 'center',
                                    body: {
                                        view: 'form',
                                        elements: [
                                            { view: 'text', label: lblUsername, name: 'username' },
                                            { view: 'text', type: lblPassword, label: 'Password', name: 'password' },
                                            { view: 'text', label: lblEmail, name: 'email' },
                                            { view: 'checkbox', label: lblHeaderIsActive, name: 'isActive' },
                                            { 
                                                view: 'layout',
                                                cols: [
                                                    {
                                                        view: 'button', 
                                                        type: 'iconButtonTop',
                                                        icon: 'fa-save',
                                                        on: {
                                                            onItemClick: function(id, ev) {
                                                                var form = _this.dom.addUserWindow.getBody();
                                                                var values = form.getValues();
                                                                
                                                                var SiteUser = AD.Model.get('opstools.RBAC.SiteUser');
                                                                SiteUser.create(values)
                                                                .fail(function(err) {
                                                                    webix.message(err.message);
                                                                    console.log(err);
                                                                })
                                                                .then(function(user) {
                                                                    form.clear();
                                                                    _this.dom.addUserWindow.hide();
                                                                    // Refresh the user list
                                                                    SiteUser.findAll()
                                                                    .then(function(list) {
                                                                        _this.loadUsers(list);
                                                                    });
                                                                    
                                                                });
                                                            }
                                                        }
                                                    },
                                                    { 
                                                        view: 'button', 
                                                        type: 'iconButtonTop',
                                                        icon: 'fa-close',
                                                        on: {
                                                            onItemClick: function(id, ev) {
                                                                _this.dom.addUserWindow.getBody().clear();
                                                                _this.dom.addUserWindow.hide();
                                                            }
                                                        }
                                                    }
                                                
                                                ]
                                            }
                                        ]
                                    }
                                });
                                
                                
                                // Edit User window
                                var lblEditUser = AD.lang.label.getLabel('rbac.EditUser') || 'Edit User';
                                var lblFailedLogins = AD.lang.label.getLabel('rbac.failedLogins') || 'Failed logins';
                                _this.dom.editUserWindow = webix.ui({
                                    view: 'window',
                                    head: lblEditUser,
                                    position: 'center',
                                    body: {
                                        view: 'form',
                                        elements: [
                                            { view: 'text', label: 'ID', name: 'id', readonly: true },
                                            { view: 'text', label: 'GUID', name: 'guid', readonly: true },
                                            { view: 'text', label: lblUsername, name: 'username' },
                                            { view: 'text', label: lblPassword, name: 'password', type: 'password' },
                                            { view: 'text', label: lblEmail, name: 'email' },
                                            { view: 'checkbox', label: lblHeaderIsActive, name: 'isActive' },
                                            { view: 'counter', label: lblFailedLogins, name: 'failedLogins', min: 0, labelWidth: '100' },
                                            { 
                                                view: 'layout',
                                                cols: [
                                                    {
                                                        view: 'button', 
                                                        type: 'iconButtonTop',
                                                        icon: 'fa-save',
                                                        on: {
                                                            onItemClick: function(id, ev) {
                                                                var form = _this.dom.editUserWindow.getBody();
                                                                var user_id = form.getValues().id;
                                                                var values = form.getDirtyValues();
                                                                var SiteUser = AD.Model.get('opstools.RBAC.SiteUser');
                                                                
                                                                SiteUser.update(user_id, values)
                                                                .fail(function(err) {
                                                                    webix.message(err.message);
                                                                    console.log(err);
                                                                })
                                                                .then(function(user) {
                                                                    form.clear();
                                                                    _this.dom.editUserWindow.hide();
                                                                    // Refresh the user list
                                                                    SiteUser.findAll()
                                                                    .then(function(list) {
                                                                        _this.loadUsers(list);
                                                                    });
                                                                    
                                                                });
                                                            }
                                                        }
                                                    },
                                                    { 
                                                        view: 'button', 
                                                        type: 'iconButtonTop',
                                                        icon: 'fa-close',
                                                        on: {
                                                            onItemClick: function(id, ev) {
                                                                _this.dom.editUserWindow.getBody().clear();
                                                                _this.dom.editUserWindow.hide();
                                                            }
                                                        }
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                });
                                
                            });

                        },



                        /** 
                         * @function loadRoles
                         *
                         * load the given list of roles.
                         * @param {array/can.List} list  the current list of roles.
                         */
                        loadRoles: function(list) {
                            var _this = this;

                            this.data.roles = list;
                            this.data.roles.bind('change', function(){

                                // make sure we refresh the user's permissions when roles change
                                _this.userSelect(_this.data.usersCollection.getCursor());
                            })
                        },



                        /** 
                         * @function loadScopes
                         *
                         * load the given list of scopes.
                         * @param {array/can.List} list  the current list of scopes.
                         */
                        loadScopes: function(list) {
                            this.data.scopes = list;
                        },



                        /** 
                         * @function loadUsers
                         *
                         * load the given list of users.
                         * @param {array/can.List} list  the current list of users.
                         */
                        loadUsers: function(list) {
                            this.data.usersList = list;
                            this.data.usersCollection = AD.op.WebixDataCollection(list);
                            if (this.dom.userGrid) {
                                this.dom.userGrid.data.sync(this.data.usersCollection);
                                this.dom.userName.bind(this.data.usersCollection);
                                // this.dom.userGrid.parse(this.data.usersCollection);
                            }
                // this.refresh();
                        },



                        permissionInstance: function(perm) {

                            var Permission = AD.Model.get('opstools.RBAC.Permission');
                            return Permission.findOne({id:perm.id}).fail(function(err){
                                AD.error.log('Error finding permission:', {error:err, id:perm.id, perm:perm });
                            });
                            
                        },



                        /**
                         * @function permissionDisable
                         *
                         */
                        permissionDisable: function(perm) {
                            return this.permissionUpdate(perm, { 'enabled': false });
                        },



                        /**
                         * @function permissionEnable
                         *
                         */
                        permissionEnable: function(perm) {
                            return this.permissionUpdate(perm, { 'enabled': true });
                        },



                        /**
                         * @function permissionRemove
                         *
                         */
                        permissionRemove: function(perm) {
                            var dfd = AD.sal.Deferred();

                            this.permissionInstance(perm)
                            .fail(function(err){ dfd.reject(err); })
                            .then(function(permission){

                                permission.destroy()
                                .fail(function(err){
                                    AD.error.log('Error removing permission:', {error:err, perm:permission });
                                    dfd.reject(err);
                                })
                                .then(function(){

                                    dfd.resolve();
                                })
                            })

                            return dfd;
                        },



                        permissionUpdate:function(perm, values) {
                            var dfd = AD.sal.Deferred();

                            this.permissionInstance(perm)
                            .fail(function(err){ dfd.reject(err); })
                            .done(function(permission){

                                for(v in values) {
                                    permission.attr(v, values[v]);
                                }
                                
                                permission.save()
                                .fail(function(err){
                                    AD.error.log('Error updating permission:', {error:err, perm:permission, values:values });
                                    dfd.reject(err);
                                })
                                .done(function(){
                                    dfd.resolve();
                                })
                            })

                            return dfd;
                        },



                        /**
                         * @function formUpade
                         * 
                         * make sure the Add Form properly reflects the currently selected
                         * user's permissions.
                         *
                         * eg the form should not give Roles that have already been assigned.
                         */
                        formUpdate:function(){

                            var ids = [];
                            this.dom.userPermissions.data.each(function(perm, indx){
                                ids.push(perm.role.id);
                            })

                            this.dom.userRoleScopeForm.html(can.view("RBAC_User_AddUserPermission", { roles:this.data.roles, excludeIDs:ids, scopes:this.data.scopes }));
                            this.form.attach();
                            this.form.elAdd(this.dom.userRoleScopeForm.find('[name="role"]')); // these fields have been recreated, so re add!
                            this.form.elAdd(this.dom.userRoleScopeForm.find('[name="scope"]'));
                            
                        },



                        formEditShow:function(id) {
                            var _this = this;

                            // get the current permission entry for id
                            var perm = this.dom.userPermissions.getItem(id);
                // console.log('... perm:', perm);

                            // get ids of scopes 
                            var selectedScopes = [];
                            perm.scope.forEach(function(scope){
                                selectedScopes.push(scope.id);
                            })

                            var roles = [ this.data.userPermissionCollection.AD.getModel(id).role ]; // [ perm.role ];

                            // update view
                            this.dom.userRoleScopeEditForm.html(can.view("RBAC_User_EditUserPermission", { roles:roles, scopes:this.data.scopes, selectedScopes:selectedScopes  }));
                            
                            
                            // attach form & reAdd fields
                            this.formEdit.attach();
                            // this.formEdit.elAdd(this.dom.userRoleScopeEditForm.find('[name="role"]')); // these fields have been recreated, so re add!
                            this.formEdit.elAdd(this.dom.userRoleScopeEditForm.find('[name="scope"]'));
                            
                            // show form
                            this.dom.userRoleScope.hide() // but hide this one
                            this.dom.userRoleScopeEdit.show();

                            // form.reset()
                            this.formEdit.reset();
                        },



                        /**
                         * @function resize
                         *
                         * this is called when the Role controller is displayed and the window is
                         * resized.  
                         */
                        resize: function( data ) {

                            // make sure we are still connected to the DOM ...
                            if (this.element) { 

                                var pager = this.dom.userGrid.getPager();

                                if (data) {

                                    // the outer container for the userGrid will be increased
                                    this.element.find('div.rbac-user-div').css('height', data.height+'px');

                                    // adjust the height of the userGrid:
                                    var gridHeight = data.height;
                                    gridHeight -= pager.$height;
                                    gridHeight -= this.dom.userSearch.$height;

//// TODO: try to figure out how many rows would fit into available space
////    then adjust ycount to fit that.
////        gridHeight -= heightOf1Row (to accomodate the header)
////        numrows = gridHeight / heightOf1Row
////        

                                    // this.dom.userGrid.define('height', gridHeight);
                                    // this.dom.userGrid.resize();
                                }

                                this.dom.userGrid.adjust(); 
                                
                                // now update the related pager/searchbox with the proper $width
                                pager.define('width', this.dom.userGrid.$width);
                                
                                // Leave space on the right for the "Add User" button
                                this.dom.userSearch.define('width', this.dom.userGrid.$width - 80);


                                // the userPermissions table:
                                this.dom.userPermissions.adjust();

                                // resize everything now:
                                pager.resize();
                                this.dom.userSearch.resize();

                            }

                        },



                        /**
                         * @function userSelect
                         * 
                         * called when a user is selected in our User Datatable.
                         *
                         * @param {} id  The id of the data element selected
                         */
                        userSelect:function(id) {

                            var _this = this;

                            // if a valid id was given:
                            if (id != null) {

                                
                                // this datatable is synced with our usersCollection
                                // and so is our selected form, so we need to make sure
                                // the userCollection's cursor is set to the selected
                                // id:
                                this.data.usersCollection.setCursor(id);

                                this.dom.userPanel.show();

                                var user = this.data.usersCollection.getItem(id);

                                // show loading message on PermissionGrid
                                this.dom.userPermissions.clearAll();
                                var loadingLabel =  AD.lang.label.getLabel('rbac.user.loadingPermissions', user.username) || '* Loading Permissions for '+user.username;
                                this.dom.userPermissions.showOverlay("<i class=\"fa fa-spinner fa-pulse\"></i> "+loadingLabel);


                                var Permission = AD.Model.get('opstools.RBAC.Permission');
                                Permission.findAll({user:user.id})
                                .fail(function(err){

                                })
                                .then(function(list){

                                    // convert each basic perm.role into the more detailed role info:
                                    list.forEach(function(perm){
                                        _this.data.roles.forEach(function(r){
                                            if (r.id == perm.role.id) {
                                                perm.attr('role', r);
                                            }
                                        })

                                        var scopes = [];
                                        perm.scope.forEach(function(ps){
                                            _this.data.scopes.forEach(function(s){
                                                if (ps.id == s.id){
                                                    scopes.push(s);
                                                }
                                            })
                                        })

                                        perm.removeAttr('scope');
                                        perm.attr('scope', scopes);
                                    })

                                    // convert to DataCollection
                                    var permissionDC = AD.op.WebixDataCollection(list);
                    // console.log('... list:', list);
                    // console.log('... permissionDC:', permissionDC);
                                    // load into PermissionGrid
                                    _this.dom.userPermissions.parse(permissionDC);
                                    _this.data.userPermissionCollection = permissionDC;

                                    // update AddForm's Role list to not include the roles already assigned:
                                    _this.formUpdate();

                                    // remove any permission editing:
                                    _this.dom.userRoleScopeEdit.hide();

                                    // since I just loaded my permissions:
                                    _this.userAssignmentUpdate();

                                    // remove loading overlay
                                    _this.dom.userPermissions.hideOverlay();
                                })

                            }

                        },



                        show:function() {
                            this._super();
                            this.resize();
                        },



                        /**
                         * @function userAssignmentUpdate
                         *
                         * Make sure the user's entry in the DataCollection has the proper permissions.
                         *
                         * [Add] and [Delete] operations update this.
                         */
                        userAssignmentUpdate: function() {

                            var user = this.dom.userGrid.getItem(this.data.usersCollection.getCursor() );
                            var perms = [];
                            this.dom.userPermissions.data.each(function(p){
                                perms.push(p);
                            })
                            user['permission'] = perms;
                             
                            this.dom.userGrid.refresh();
                        },



                        /*
                         * The User list [+] button
                         */
                        '.rbac-user-addUser click': function($el, ev) {
                            this.dom.addUserWindow.show();
                        },
                        
                        
                        /*
                         * The User list edit button
                         */
                        '.rbac-user-editUser click': function($el, ev) {
                            ev.preventDefault();
                            
                            var self = this;
                            var user_id = $el.attr('user_id');
                            var form = this.dom.editUserWindow.getBody();
                            var SiteUser = AD.Model.get('opstools.RBAC.SiteUser');
                            
                            SiteUser.findAll({ id: user_id })
                            .then(function(list) {
                                if (list && list[0]) {
                                    form.setValues(list[0]);
                                    self.dom.editUserWindow.show();
                                }
                            });
                        },
                        
                        
                        
                        /*
                         * Make sure that only 1 Role is selected in our Multi Select field.
                         */
                        '.rbac-only-one click': function($el, ev) {

                            // for the Roles options, only one can be selected, so clear all others:
                            $el.parent().find('option').each(function(indx, curr){

                                var $curr = $(curr);
                                if ($curr.val() != $el.val()) {
                                    $curr.attr('selected',false);
                                }
                            });
                        },



                        /*
                         * [Add] button click handler.
                         *
                         * This Show's the Add Form, and prepares it for initial use.
                         */
                        '.rbac-user-addPermission click': function ($el, ev) {

                            // set form template (only 1 time)
                            if (!this.isFormCreated) {
                                this.formUpdate();
                                this.isFormCreated = true;
                                this.form.attach();
                            }

                            // clear fields
                            this.dom.userRoleScopeForm.find('option').attr('selected',false);
                            

                            // show form
                            this.dom.userRoleScopeEdit.hide();  // but hide this one.
                            this.dom.userRoleScope.show();

                            // NOTE: reset() the form when it is visible! 
                            this.form.reset();

                            ev.preventDefault();
                        },



                        /*
                         * [Add] button click handler.
                         *
                         * Adds a new Permission definition to the currently selected User.
                         */
                        '.rbac-user-addPerm-add click': function ($el, ev) {
                            var _this = this;

                            if (this.form.isValid()) {

                                this.button.add.busy();
                                this.button.cancel.disable();

                                var values = this.form.values();
                                
                                values.user = this.data.usersCollection.AD.currModel().getID();
                                values.enabled = true;

                                var Permission = AD.Model.get('opstools.RBAC.Permission');
                                var entry = new Permission(values);
                                entry.save()
                                .fail(function(err){
                                    if (!_this.form.errorHandle(err)) {
                                        AD.error.log('RBAC: addPermission : unknown error', {error:err, values:values });
                                    }
                                    _this.button.add.ready();
                                    _this.button.cancel.enable();
                                })
                                .then(function(savedEntry){

                                    // update the Selected User's permission list:
                                    _this.userSelect(_this.data.usersCollection.getCursor());

                                    // clear form, but leave it displayed
                                    _this.form.reset();

                                    _this.button.add.ready();
                                    _this.button.cancel.enable();

                                });


                            }

                            ev.preventDefault();
                        },



                        /*
                         * [Cancel] button click handler.
                         *
                         * Closes the Add Permission form.
                         */
                        '.rbac-user-addPerm-cancel click': function ($el, ev) {

                            this.dom.userRoleScope.hide();
                            ev.preventDefault();
                        },



                        /*
                         * [Update] button click handler.
                         *
                         * Updates a Permission definition for the currently selected Permission.
                         */
                        '.rbac-user-editPerm-update click': function ($el, ev) {

                            var _this = this;

                            if (this.formEdit.isValid()) {

                                this.button.update.busy();
                                this.button.cancelEdit.disable();

                                var values = this.formEdit.values();

                                // values.user = this.data.usersCollection.AD.currModel().getID();
                                var permission = this.data.userPermissionCollection.AD.currModel();

                                permission.attr('scope', values.scope);
                                permission.save()
                                .fail(function(er){
                                    if (!_this.formEdit.errorHandle(err)) {
                                        AD.error.log('RBAC: updatePermission : unknown error', {error:err, values:values });
                                    }
                                    _this.button.update.ready();
                                    _this.button.cancelEdit.enable();
                                })
                                .then(function(savedEntry){

                                    _this.dom.userRoleScopeEdit.hide();

                                    // update the Selected User's permission list:
                                    _this.userSelect(_this.data.usersCollection.getCursor());

                                    _this.button.update.ready();
                                    _this.button.cancelEdit.enable();

                                });
                            }

                            ev.preventDefault();
                        },



                        /*
                         * [Cancel] button click handler.
                         *
                         * Closes the Edit Permission form.
                         */
                        '.rbac-user-editPerm-cancel click': function ($el, ev) {

                            this.dom.userRoleScopeEdit.hide();
                            ev.preventDefault();
                        }


                    });

                });
        });
    });