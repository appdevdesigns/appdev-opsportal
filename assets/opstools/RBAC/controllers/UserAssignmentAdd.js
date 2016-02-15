
steal(
// List your Controller's dependencies here:
    'opstools/RBAC/models/Permission.js',
    // '//opstools/RBAC/views/UserAssignmentAdd/UserAssignmentAdd.ejs',
    function () {
        System.import('appdev').then(function () {
            steal.import(
                'can/construct/construct',
                'appdev/ad',
                'appdev/control/control').then(function () {


                    //
                    // UserAssignmentAdd 
                    // 
                    // This controller manages the popup Assignment Form.  It allows you to select
                    // 1 Role, and 1+ Scopes to the role.
                    //
                    // On Save, this form will update the User's permissions and then return the user
                    // to the Users Controller.
                    //


                    // Namespacing conventions:
                    // AD.Control.extend('[application].[controller]', [{ static },] {instance} );
                    AD.Control.extend('opstools.RBAC.UserAssignmentAdd', {


                        init: function (element, options) {
                            var self = this;
                            options = AD.defaults({
                                eventDone: 'added'
                                // templateDOM: '//opstools/RBAC/views/UserAssignmentAdd/UserAssignmentAdd.ejs'
                            }, options);
                            this.options = options;

                            // Call parent init
                            this._super(element, options);

                            this.dom = {};  // hold our DOM elements here.


                            this.data = {};
                            this.data.user = null;              // the current user to display
                            this.data.roles = [];               // all possible roles
                            this.data.scopes = [];              // all possible scopes
                            this.data.hashPermissions = {};     // a hash of the current user's permissions
                            //   { role.id : { permission }}
                            this.data.availableRoles = [];      // [array] of roles available to be selected


                            this.initDOM();
                        },



                        initDOM: function () {

                            // this.element.html(can.view(this.options.templateDOM, {} ));
                            this.dom.userID = this.element.find('.rbac-addassignments-userID');

                            this.dom.roleList = this.element.find('.rbac-addassignments-roleList');
                            var templateRoleList = this.domToTemplate(this.dom.roleList);
                            can.view.ejs('RBAC_UserAssignmentAdd_RoleList', templateRoleList);
                            this.dom.roleList.html(' ');


                            this.dom.scopeList = this.element.find('.rbac-addassignments-scopeList');
                            var templateScopeList = this.domToTemplate(this.dom.scopeList);
                            can.view.ejs('RBAC_UserAssignmentAdd_ScopeList', templateScopeList);
                            this.dom.scopeList.html(' ');


                            this.dom.buttonSave = this.element.find('.rbac-addassignments-save');
                            this.buttonSaveDisable();


                            //// Create a Form for our Add Permission
                            this.form = new AD.op.Form(this.element.find('.rbac-addassignments-form'));
                            // this.form.bind( AD.Model.get('opstools.FCFActivities.TeamActivity'));
                            this.form.addField('role', 'integer', { notEmpty: {} });
                            this.form.addField('scope', 'array', { notEmpty: {} });
                            // this.form.attach();


                            this.buttonSave = new AD.op.ButtonBusy(this.element.find('.rbac-addassignments-save'));

                        },



                        buttonSaveEnable: function () {
                            this.dom.buttonSave.removeAttr('disabled');
                            this.dom.buttonSave.removeClass('disabled');
                        },



                        buttonSaveDisable: function () {
                            this.dom.buttonSave.attr('disabled', 'disabled');
                            this.dom.buttonSave.addClass('disabled');
                        },



                        buttonSaveValidate: function () {

                            if (this.data.availableRoles.length > 0) {
                                if (this.form.isValid()) {
                                    this.buttonSaveEnable();
                                } else {
                                    this.buttonSaveDisable();
                                }
                            }
                        },



                        loadUser: function (user) {
                            var _this = this;

                            this.dom.userID.text(user.username);
                            this.data.user = user;
                            this.data.hashPermissions = {};
                            if (this.data.user.permission) {
                                this.data.user.permission.forEach(function (perm) {
                                    _this.data.hashPermissions[perm.role.id || perm.role] = perm;
                                })
                            }

                            this.loadRoles(this.data.roles);  // reload the roles for this user
                            this.scopesClear();               // uncheck any scopes

                            this.form.reset();                // reset any validations
                            this.buttonSaveDisable();         // disable the [save] button
                        },



                        loadRoles: function (roles) {
                            var _this = this;

                            // save the roles and clear the list
                            this.data.roles = roles;
                            this.dom.roleList.html(' ');

                            //// NOTE: we only display roles that have not already been [Added] to this user.
                            // figure out which roles should be displayed
                            var availableRoles = [];
                            roles.forEach(function (role) {
                                if (!_this.data.hashPermissions[role.id]) {
                                    availableRoles.push(role);
                                }
                            })
                            this.data.availableRoles = availableRoles;
                            this.dom.roleList.append(can.view('RBAC_UserAssignmentAdd_RoleList', { roles: availableRoles }));
                        },



                        loadScopes: function (scopes) {
                            this.data.scopes = scopes;
                            this.dom.scopeList.html(' ');
                            this.dom.scopeList.append(can.view('RBAC_UserAssignmentAdd_ScopeList', { scopes: scopes }));
                            this.form.attach();
                        },



                        scopesClear: function () {
                            this.element.find(':checkbox').prop('checked', false);
                        },



                        '[name="role"] click': function ($el, ev) {
                            this.buttonSaveValidate();
                        },



                        '[name="scope"] click': function ($el, ev) {
                            this.buttonSaveValidate();
                        },



                        '.rbac-addassignments-cancel click': function ($el, ev) {

                            this.element.trigger(this.options.eventDone);
                            ev.preventDefault();
                        },



                        '.rbac-addassignments-save click': function ($el, ev) {
                            var _this = this;

                            var obj = this.form.values();   // get form values
                            obj.user = this.data.user.id;   // manually store the current user.id
                            obj.enabled = true;             // assumed since you just created it!

                            this.buttonSave.busy();

                            var Permission = AD.Model.get('opstools.RBAC.Permission');
                            var entry = new Permission(obj);
                            entry.save()
                                .fail(function (err) {
                                    if (!_this.form.errorHandle(err)) {
                                        //// TODO: handle unknown Error event:
                                        console.error('... unknown error! :', err);
                                    }
                                })
                                .then(function (savedEntry) {

                                    // make sure scopes are not strings, but integers!
                                    for (var i = 0; i < savedEntry.scope.length; i++) {
                                        savedEntry.scope[i] = parseInt(savedEntry.scope[i]);
                                    }

                                    // console.log('... savedEntry:', savedEntry);

                                    // update the current user's permission entry with this new entry:
                                    _this.data.user.permission.push(savedEntry);

                                    _this.buttonSave.ready();
                
                                    // return the saved permission entry
                                    _this.element.trigger(_this.options.eventDone, savedEntry);

                                });
                            ev.preventDefault();
                        }


                    });
                });

        });
    });