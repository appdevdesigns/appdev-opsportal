// 
// steal(
//         // List your Controller's dependencies here:
//         'appdev',
// //        'opstools/RBAC/models/Projects.js',
// //        'appdev/widgets/ad_delete_ios/ad_delete_ios.js',
//         // '//opstools/RBAC/views/UserPermissionList/UserPermissionList.ejs',
// function(){
System.import('appdev').then(function () {
    steal.import(
        'can/construct/construct',
        'appdev/ad',
        'appdev/control/control').then(function () {

            // Namespacing conventions:
            // AD.Control.extend('[application].[controller]', [{ static },] {instance} );
            AD.Control.extend('opstools.RBAC.UserPermissionList', {


                init: function (element, options) {
                    var self = this;
                    options = AD.defaults({
                        // templateDOM: '//opstools/RBAC/views/UserPermissionList/UserPermissionList.ejs'
                        eventAssignmentAdd: 'assignment.add',
                        eventDone: 'im.done'
                    }, options);
                    this.options = options;

                    // Call parent init
                    this._super(element, options);

                    this.data = {};
                    this.data.user = null;  // the user to display
                    this.data.roles = null;
                    this.data.scopes = null;

                    this.hashRoles = null;  // hash:  role.id :  { role model }
                    this.hashScopes = null;  // hash: scope.id : { scope model }

                    this.currentlyEditing = null;  // keep track of the edited perm

                    this.dom = {};
                    this.dom.username = null;
                    this.dom.scopeList = null;
                    this.dom.selectOption = null;
                    this.dom.buttonApply = null;


                    this.initDOM();
                    this.validateApply();
                },



                initDOM: function () {
                    var _this = this;

                    // this.element.html(can.view(this.options.templateDOM, {} ));

                    this.dom.username = this.element.find('.rbac-permissionlist-username');


                    this.dom.scopeList = this.element.find('.rbac-permissionlist-scopes');
                    var templateScopeList = this.domToTemplate(this.dom.scopeList);
                    can.view.ejs('RBAC_PermissionList_ScopeList', templateScopeList);
                    this.dom.scopeList.html(' ');


                    // attach the FilteredBootstrapTable Controller
                    var Filter = AD.Control.get('OpsPortal.FilteredBootstrapTable');
                    this.Filter = new Filter(this.element, {
                        tagFilter: '.autocomplete-filter',
                        tagBootstrapTable: '#permissionlist',
                        scrollToSelect: true,
                        cssSelected: 'orange',

                        tableOptions: {

                            pagination: true,

                            columns: [
                                { title: '', checkbox: true },       // the checkbox column
                                { title: 'Role', field: 'role_name' },  // function(value, row, index){ return row.numAssignments(); }
                                { title: 'Scope', field: 'scope_list' },
                                { title: 'Action', formatter: '.actions' },
                                { title: 'Status', formatter: '.status' }
                            ]
                        },
                        rowChecked: function (row) {
                            _this.validateApply();
                        },
                        rowUnChecked: function (row) {
                            _this.validateApply();
                        },
                        rowDblClicked: function (data) {

                            var editIcon = _this.element.find('.rbac-permissionlist-edit[perm-id="' + data.id + '"]');
                            if (editIcon.length) {
                                editIcon.click();
                            }
                        },
                        dataToTerm: function (data) {
                            if (data) {
                                return data.role_name;
                            } else {
                                return '';
                            }
                        }
                    });


                    // //// Create a Form for our Edit Permission
                    this.dom.modalEditor = this.element.find('.rbac-permission-edit');
                    this.form = new AD.op.Form(this.dom.modalEditor);
                    this.form.addField('scope', 'array', { notEmpty: {} });


                    this.buttonSave = new AD.op.ButtonBusy(this.element.find('.rbac-permission-save'));

                    // find the selection box
                    this.dom.selectOption = this.element.find('.rbac-permission-selectOption');
                    this.dom.buttonApply = new AD.op.ButtonBusy(this.element.find('.rbac-permission-apply'));

                },



                iconBusy: function ($el) {
                    $el.addClass(' fa-spinner fa-pulse');
                },

                iconReady: function ($el) {
                    $el.removeClass(' fa-spinner fa-pulse');
                },


                loadUser: function (user) {

                    this.data.user = user;
                    // this.refresh();

                },



                loadRoles: function (roles) {
                    var _this = this;

                    this.data.roles = roles;


                    this.hashRoles = {};
                    roles.forEach(function (role) {
                        _this.hashRoles[role.id] = role;
                    })


                    // if we are ready to display then refresh()
                    this.refresh();



                    // if a new role is added to the list:
                    this.data.roles.bind('change', function () { 

                        // recalc our hash
                        _this.hashRoles = {};
                        _this.data.roles.forEach(function (role) {
                            _this.hashRoles[role.id] = role;
                        })

                        // refresh the display:
                        _this.refresh();
                    });

                },



                loadScopes: function (scopes) {
                    var _this = this;

                    this.data.scopes = scopes;


                    this.hashScopes = {};
                    scopes.forEach(function (scope) {
                        _this.hashScopes[scope.id] = scope;
                    })


                    // if we are ready to display then refresh()
                    this.refresh();


                    // update permission editor with these scopes
                    this.dom.scopeList.html(can.view('RBAC_PermissionList_ScopeList', { scopes: this.data.scopes }));


                    // attach the form AFTER the scopes have been generated:
                    this.form.attach();

                },



                loadPermissions: function (permissions) {
                    var _this = this;

                    this.data.permissions = permissions;


                    this.hashPermissions = {};
                    permissions.forEach(function (perm) {
                        _this.hashPermissions[perm.id] = perm;
                    })


                    // if we are ready to display then refresh()
                    this.refresh();


                    // if a new permission is added to the list:
                    this.data.permissions.bind('change', function () { 

                        // recalc our hash
                        _this.hashPermissions = {};
                        _this.data.permissions.forEach(function (perm) {
                            _this.hashPermissions[perm.id] = perm;
                        })

                        // refresh the display:
                        _this.refresh();
                    });
                },



                refresh: function () {
                    var _this = this;

                    // if our important data has been set
                    if ((this.data.user)
                        && (this.data.roles)
                        && (this.data.scopes)) {

                        this.dom.username.html(this.data.user.attr('username'));

                        var displayData = [];
                        this.data.user.permission.forEach(function (userPerm) {

                            var perm = _this.hashPermissions[userPerm.id];
                            if (perm) {

                                var data = {};

                                data.id = perm.id;

                                var rid = perm.role.id || perm.role;
                                if (_this.hashRoles[rid]) {
                                    data.role_name = _this.hashRoles[rid].role_label;
                                } else {
                                    data.role_name = ' *** role not found ***';
                                }

                                var scopeList = [];
                                perm.scope.forEach(function (s) {

                                    var sid = s.id || s;

                                    if (_this.hashScopes[sid]) {

                                        scopeList.push(_this.hashScopes[sid].getLabel())

                                    }
                                })

                                data.scope_list = scopeList.join(' | ');

                                data.enabled = perm.enabled;

                                displayData.push(data);
                            }
                        })


                        this.Filter.load(displayData);

                    }


                },



                resize: function () {

                    this.Filter.resetView();
                },



                show: function () {
                    this._super();

                    this.refresh();
                    this.Filter.resetView();
                },



                /**
                 * @function validateApply
                 * decide if the [apply] button should be enabled.
                 */
                validateApply: function () {

                    // if something is selected in the table
                    var selected = this.Filter.values();
                    if (selected.length) {

                        // if an action was selected in the droplist
                        var option = this.dom.selectOption.val();
                        if (option != 'choose') {

                            // then the button shold be enabled:
                            this.dom.buttonApply.enable();
                            return;
                        }

                    }

                    // if we get here, it should be disabled
                    this.dom.buttonApply.disable();
                },



                '.rbac-permissionlist-add click': function ($el, ev) {

                    this.element.trigger(this.options.eventAssignmentAdd, this.data.user);
                    ev.preventDefault();
                },



                '.rbac-permissionlist-edit click': function ($el, ev) {
                    var _this = this;

                    var id = $el.attr('perm-id');

                    var perm = this.entryForID(this.data.permissions, id);

                    this.currentlyEditing = perm;

                    // set which scopes are part of this permission entry?
                    this.form.clear();  // clear the list
                    perm.scope.forEach(function (scope) {
                        _this.dom.scopeList.find('input[value="' + scope.id + '"]').prop('checked', true);
                    })



                    // NOTE: let the default boostrap modal action show the modal:
                    // ev.preventDefault();
                },



                '.rbac-permissionlist-delete click': function ($el, ev) {
                    var _this = this;

                    var id = $el.attr('perm-id');

                    var perm = this.entryForID(this.data.permissions, id);
                    var index = this.data.permissions.indexOf(perm);
                    var uIndex = this.indexForID(this.data.user.permission, id);

                    this.iconBusy($el);

                    AD.op.Dialog.Confirm({
                        fnYes: function () {

                            perm.destroy()
                                .fail(function (err) {
                                    console.error(' *** error deleting permission:', perm, err);
                                })
                                .then(function () {
                                    _this.data.permissions.splice(index, 1);
                                    _this.data.user.permission.splice(uIndex, 1);
                                    _this.iconReady($el);
                                    _this.refresh();
                                })

                        },
                        fnNo: function () {
                            _this.iconReady($el);

                        }
                    });

                    ev.preventDefault();
                },



                // clicking on the Modal's [cancel] button
                '.rbac-permission-cancel click': function ($el, ev) {
                    this.dom.modalEditor.modal('hide');
                    ev.preventDefault();
                },



                // clicking on teh Modal's [save] button
                '.rbac-permission-save click': function ($el, ev) {
                    var _this = this;

                    if (this.currentlyEditing) {


                        if (this.form.isValid()) {

                            var vals = this.form.values();
                            var perm = this.currentlyEditing;

                            // if there is a perm.scope that isn't in vals.scope, remove that entry:
                            var toRemove = [];
                            perm.scope.forEach(function (scope) {

                                if (scope) {
                                    if (vals.scope.indexOf(scope.id) == -1) {
                                        toRemove.push(scope);
                                    }
                                }
                            })
                            toRemove.forEach(function (scope) {
                                var indx = perm.scope.indexOf(scope);
                                perm.scope.splice(indx, 1);
                            })

                            // if there is a vals.scope that isn't in perm.scope, add it!
                            vals.scope.forEach(function (scopeID) {
                                var found = _this.entryForID(perm.scope, scopeID);
                                if (!found) {
                                    perm.scope.push(scopeID);
                                }
                            })

                            this.buttonSave.busy();

                            perm.save()
                                .fail(function (err) {
                                    if (!_this.form.errorHandle(err)) {
                                        //// TODO: handle unknown Error event:
                                        console.error('... unknown error! :', err);
                                    }
                                })
                                .then(function (savedPerm) {

                                    _this.buttonSave.ready();
                                    _this.dom.modalEditor.modal('hide');

                                })

                        }


                    } else {
                        this.dom.modalEditor.modal('hide');
                        console.warn('??? how did we show this modal with no currentlyEditing permission being set?');
                    }

                },



                '.rbac-permission-selectOption change': function ($el, ev) {
                    this.validateApply();
                },



                // when the user clicks the [apply] button
                '.rbac-permission-apply click': function ($el, ev) {
                    var _this = this;

                    // if there are selected entries
                    var selected = this.Filter.values();
                    if (selected.length) {

                        // are we enabling or disabling the entries?
                        var enabled = false;
                        var option = this.dom.selectOption.val();
                        if (option == 'enable') {
                            enabled = true;
                        }

                        // button busy spinner start
                        this.dom.buttonApply.busy();

                        var pendingActions = [];
                        selected.forEach(function (row) {

                            //// NOTE: the values in the table are not the actual Permission Models
                            // so get the model here:
                            var perm = _this.entryForID(_this.data.permissions, row.id);
                            perm.attr('enabled', enabled);
                            pendingActions.push(perm.save());
                            // console.log('... modifying perm:', perm);

                        })

                        // when all the pendingActions are complete:
                        $.when.apply($, pendingActions)
                            .fail(function (err) {
                                console.error('*** error saving permission:', err);
                            })
                            .then(function (data) {

                                _this.dom.buttonApply.ready(); // remove spinner
                                _this.Filter.checkEntries([]); // remove all checks!
                                _this.dom.selectOption.val('choose'); // reset option to choose
                                _this.validateApply();

                            })

                    }
                },



                // when the user clicks the [user] crumb to return to the users list:
                '.rbac-permission-users click': function ($el, ev) {
                    this.element.trigger(this.options.eventDone);
                }


            });
        });

});