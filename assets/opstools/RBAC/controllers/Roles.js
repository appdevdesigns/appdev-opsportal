
steal(
// List your Controller's dependencies here:
    'opstools/RBAC/models/PermissionRole.js',
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
                                // templateDOM: '//opstools/RBAC/views/Roles/Roles.ejs'
                                eventRoleAdd: 'role.add.clicked',
                                eventRoleEdit: 'role.edit.clicked',
                                eventRoleDeleted: 'role.deleted'
                            }, options);
                            this.options = options;

                            // Call parent init
                            this._super(element, options);

                            this.data = {};
                            this.data.roles = [];


                            this.initDOM();

                        },



                        initDOM: function () {

                            var _this = this;


                            // this.element.html(can.view(this.options.templateDOM, {} ));



                            // attach the FilteredBootstrapTable Controller
                            var Filter = AD.Control.get('OpsPortal.FilteredBootstrapTable');
                            this.Filter = new Filter(this.element, {
                                tagFilter: '.autocomplete-filter',
                                tagBootstrapTable: '#rolelist',
                                scrollToSelect: true,

                                cssSelected: 'orange',

                                tableOptions: {

                                    pagination: true,

                                    columns: [
                                        { title: 'Role Name', field: 'role_label', sortable: true },  // function(value, row, index){ return row.numAssignments(); }
                                        { title: 'Role Description', field: 'role_description' },
                                        { title: 'Action', formatter: '.actions' }
                                    ]
                                },

                                rowClicked: function (data) {

                                    if (data) {
                                        console.log('... clicked role:', data);
                                        // self.selectedActivity = data;
                                        // self.nextEnable();
                                    }

                                },
                                rowDblClicked: function (data) {

                                    var editIcon = _this.element.find('.rbac-role-list-edit[role-id="' + data.id + '"]');
                                    if (editIcon.length) {
                                        editIcon.click();
                                    }
                                },
                                termSelected: function (data) {

                                    // if they select a term in the typeahead filter,
                                    // just continue on as if they clicked [next]
                                    if (data) {
                                        console.log('... search selected role:', data);
                                    }
                                },
                                dataToTerm: function (data) {
                                    if (data) {
                                        return data.role_label;
                                    } else {
                                        return '';
                                    }
                                }
                            });

                        },



                        iconBusy: function ($el) {
                            $el.addClass(' fa-spinner fa-pulse');
                        },

                        iconReady: function ($el) {
                            $el.removeClass(' fa-spinner fa-pulse');
                        },



                        /**
                         * @listRoleNames
                         *
                         * return an array of current role names.
                         * @return {array}
                         */
                        listRoleNames: function () {
                            var list = [];
                            for (var i = this.data.roles.length - 1; i >= 0; i--) {
                                list.push(this.data.roles[i].role_label);
                            };
                            return list;
                        },



                        /** 
                         * @function loadRoles
                         *
                         * load the given list of roles.
                         * @param {array/can.List} list  the current list of roles.
                         */
                        loadRoles: function (list) {
                            this.data.roles = list;
                            this.refresh();
                        },



                        /** 
                         * @function refresh
                         *
                         * Redraw the list of roles
                         */
                        refresh: function () {

                            this.Filter.load(this.data.roles);
                            this.Filter.ready();
                        },



                        /**
                         * @function resize
                         *
                         * this is called when the Role controller is displayed and the window is
                         * resized.  
                         */
                        resize: function () {
                            this.Filter.resetView();
                        },



                        roleForID: function (id) {

                            var foundRole = null;
                            this.data.roles.forEach(function (role) {
                                if (role.id == id) {
                                    foundRole = role;
                                }
                            });

                            return foundRole;
                        },


                        /** 
                         * show()
                         *
                         * when this controller is shown, make sure the bootstrap-table gets properly
                         * refreshed().
                         */
                        show: function () {
                            this._super();
                            this.refresh();
                            this.Filter.resetView();
                        },



                        // when the user clicks the [ADD] button:
                        '.rbac-role-addButton click': function ($el, ev) {

                            // emit the RoleAdd event:
                            this.element.trigger(this.options.eventRoleAdd);

                            ev.preventDefault();

                        },


                        // when the user clicks on the [edit] icon of an entry
                        '.rbac-role-list-edit click': function ($el, ev) {

                            var id = $el.attr('role-id');
                            var role = this.roleForID(id);

                            this.element.trigger(this.options.eventRoleEdit, role);
                            ev.preventDefault();
                        },



                        // when the user clicks on the [clone] icon of an entry
                        '.rbac-role-list-clone click': function ($el, ev) {
                            var _this = this;

                            this.iconBusy($el);

                            var id = $el.attr('role-id');
                            var role = this.roleForID(id);
                            var roleIndex = this.data.roles.indexOf(role);

                            var listNames = this.listRoleNames();

                            // make a useable clone of the current role:
                            var attrs = AD.Model.clone(role);

                            // role names need to be unique
                            attrs.role_label += ' (cloned) ';
                            while (listNames.indexOf(attrs.role_label) != -1) {
                                attrs.role_label += '.';
                            }

                            console.log('... cloned role data: ', attrs);

                            var Roles = AD.Model.get('opstools.RBAC.PermissionRole');
                            Roles.create(attrs)
                                .fail(function (err) {
                                    //// TODO: handle Error properly!
                                    console.error('... error creating cloned entry:', err);
                                    _this.iconReady($el);
                                })
                                .then(function (data) {

                                    // now do a full find for this entry, so we have all the filled out info:
                                    Roles.findOne({ id: data.id })
                                        .fail(function (err) {
                                            console.error('... error looking up full cloned entry:', err);
                                            _this.iconReady($el);
                                        })
                                        .then(function (newRole) {

                                            console.log('... new cloned Role:', newRole);
                                            newRole.translate();

                                            // insert right under our original role
                                            _this.data.roles.splice(roleIndex, 1, role, newRole);

                                            // display as selected
                                            _this.Filter.selectRow(newRole);
                                            _this.iconReady($el);
                                        })



                                });

                        },



                        // when the user clicks on the [delete] icon of an entry
                        '.rbac-role-list-delete click': function ($el, ev) {
                            var _this = this;

                            var id = $el.attr('role-id');
                            var role = this.entryForID(this.data.roles, id); // this.roleForID(id);
                            var roleIndex = this.data.roles.indexOf(role);

                            this.iconBusy($el);

                            AD.op.Dialog.Confirm({
                                fnYes: function () {

                                    role.destroy()
                                        .fail(function (err) {
                                            console.error('*** error deleting role:', err);
                                            _this.iconReady($el);
                                        })
                                        .then(function () {
                                            _this.data.roles.splice(roleIndex, 1);
                                            _this.iconReady($el);

                                            _this.element.trigger(_this.options.eventRoleDeleted, role);
                                        })

                                },
                                fnNo: function () {

                                    _this.iconReady($el);

                                }
                            })


                            ev.preventDefault();
                        },


                        '.ad-item-add click': function ($el, ev) {

                            ev.preventDefault();
                        }


                    });

                });
        });
    });