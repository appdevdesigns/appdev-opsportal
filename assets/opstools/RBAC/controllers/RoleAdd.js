System.import('appdev').then(function () {
    steal.import(
        'can/construct/construct',
        'appdev/ad',
        'appdev/control/control',
        'appdev/model/model').then(function () {
        //
        // RoleAdd 
        // 
        // This is the interface for managing the form for adding a new Role
        //
        //

        // Namespacing conventions:
        // AD.Control.extend('[application].[controller]', [{ static },] {instance} );
        AD.Control.extend('opstools.RBAC.RoleAdd', {


            init: function (element, options) {
                var self = this;
                options = AD.defaults({
                    // templateDOM: '//opstools/RBAC/views/RoleAdd/RoleAdd.ejs'
                    eventCancel: 'cancel',
                    eventRoleAdded: 'role.added'
                }, options);
                this.options = options;

                // Call parent init
                this._super(element, options);

                this.data = {};
                this.data.actions = [];

                this.dataSource = this.options.dataSource; // AD.models.Projects;

                this.initDOM();


            },



            initDOM: function () {

                // this.element.html(can.view(this.options.templateDOM, {} ));
            
                // attach the FilteredBootstrapTable Controller
                var Filter = AD.Control.get('OpsPortal.FilteredBootstrapTable');
                this.Filter = new Filter(this.element, {
                    tagFilter: '.rbac-role-add-actionsearch',
                    tagBootstrapTable: '#permissionlist',
                    scrollToSelect: true,

                    cssSelected: 'orange',

                    tableOptions: {

                        pagination: true,

                        columns: [
                            { title: '', checkbox: true },
                            { title: 'Key', field: 'action_key' },
                            { title: 'Description', field: 'action_description' },
                            { title: 'Action', formatter: '.action' }
                        ]
                    },

                    // filterTable:true,

                    rowClicked: function (data) {

                        if (data) {
                            console.log('... clicked action:', data);
                            // self.selectedActivity = data;
                            // self.nextEnable();
                        }

                    },
                    rowDblClicked: function (data) {
                        // if they dbl-click a row,
                        // just continue on as if they clicked [next]
                        if (data) {
                            console.log('... dbl.clicked action:', data);
                        }
                    },
                    termSelected: function (data) {

                        // if they select a term in the typeahead filter,
                        // just continue on as if they clicked [next]
                        if (data) {
                            console.log('... search selected action:', data);
                        }
                    },
                    dataToTerm: function (data) {
                        if (data) {
                            return data.action_key;
                        } else {
                            return '';
                        }
                    }
                });



                //// Create a Form for our Add Role
                this.form = new AD.op.Form(this.element);
                this.form.bind(AD.Model.get('opstools.RBAC.PermissionRole'));
                this.form.addField('actions', 'array', {});
                this.form.attach();


                this.buttonSave = new AD.op.ButtonBusy(this.element.find('.rbac-roles-addrole-create'));

            },



            loadActions: function (list) {
                this.data.actions = list;
                this.Filter.load(list);
            },



            /** 
             * show()
             *
             * when this controller is shown, make sure the bootstrap-table gets properly
             * refreshed().
             *
             * Also, this is an Add form, so make sure the values are cleared.
             */
            show: function () {
                this._super();
                this.form.clear(true);
                this.Filter.resetView();
                this.buttonSave.ready();
                this.Filter.checkEntries([]);
            },



            // they click on the [cancel] button
            '.rbac-roles-addrole-cancel click': function ($el, ev) {

                // emit the RoleAdd event:
                this.element.trigger(this.options.eventCancel);
                ev.preventDefault();
            },



            // they click on the [create] button
            '.rbac-roles-addrole-create click': function ($el, ev) {
                var _this = this;

                if (this.form.isValid()) {

                    this.buttonSave.busy();

                    var obj = this.form.values();
                    var actions = this.Filter.values();

                    // repackage into server side format:
                    var data = {};

                    data.translations = [
                        {
                            language_code: AD.lang.currentLanguage,
                            role_label: obj.role_label,
                            role_description: obj.role_description
                        }
                    ]

                    data.actions = [];
                    actions.forEach(function (a) {
                        data.actions.push(a.id);
                    })
                    // console.log('... submitting data:', data);

                    var Role = AD.Model.get('opstools.RBAC.PermissionRole');
                    Role.create(data)
                        .fail(function (err) {
                            if (!_this.form.errorHandle(err)) {
                                //// TODO: handle unknown Error event:
                                // console.error('... unknown error! (Role Add Create) :', err);
                            }
                            _this.buttonSave.ready();
                        })
                        .then(function (newRole) {

                            // ok, the newRole doesn't have the embedded translations
                            // and associated role info.  So, perform a .findOne to get
                            // all that data filled out:

                            Role.findOne({ id: newRole.id })
                                .then(function (fullRole) {

                                    fullRole.translate();   // translate it!

                                    // now it should look like all the others

                                    console.log('*** new Role:', fullRole);

                                    _this.buttonSave.ready();

                                    // emit the RoleAdd event:
                                    _this.element.trigger(_this.options.eventRoleAdded, fullRole);

                                })


                        })


                }

                ev.preventDefault();
            }


        });

    });
});