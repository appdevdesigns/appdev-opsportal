System.import('appdev').then(function () {
    steal.import(
        'can/construct/construct',
        'appdev/ad',
        'appdev/control/control',
        'appdev/model/model').then(function () {

            // Namespacing conventions:
            // AD.Control.extend('[application].[controller]', [{ static },] {instance} );
            AD.Control.extend('opstools.RBAC.RoleEdit', {


                init: function (element, options) {
                    var self = this;
                    options = AD.defaults({
                        // templateDOM: '//opstools/RBAC/views/RoleEdit/RoleEdit.ejs'
                        eventDone: 'no.done.given',
                        eventCancel: 'no.cancel.given'
                    }, options);
                    this.options = options;

                    // Call parent init
                    this._super(element, options);

                    this.data = {};
                    this.data.role = null;


                    this.initDOM();


                },



                initDOM: function () {
                    var _this = this;
            
                    // this.element.html(can.view(this.options.templateDOM, {} ));

                    // attach the FilteredBootstrapTable Controller
                    var Filter = AD.Control.get('OpsPortal.FilteredBootstrapTable');
                    this.Filter = new Filter(this.element, {
                        tagFilter: '.rbac-role-edit-actionsearch',
                        tagBootstrapTable: '#roleEditPermissionlist',
                        scrollToSelect: true,

                        cssSelected: 'orange',

                        tableOptions: {

                            pagination: true,

                            columns: [
                                { title: '', checkbox: true },
                                { title: 'Key', field: 'action_key' },
                                { title: 'Description', field: 'action_description', 'class': 'rbac-role-edit-action-description' },
                                { title: 'Action', formatter: '.action' }
                            ]
                        },

                        rowDblClicked: function (data) {

                            var editIcon = _this.element.find('.rbac-roles-editrole-action-edit[assignment-id="' + data.id + '"]');
                            if (editIcon.length) {
                                editIcon.click();
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


                    //// Create a Form for our Edit Role
                    this.form = new AD.op.Form(this.element);
                    this.form.bind(AD.Model.get('opstools.RBAC.PermissionRole'));
                    // this.form.addField('actions', 'array', {});
                    this.form.attach();


                    this.buttonSave = new AD.op.ButtonBusy(this.element.find('.rbac-roles-editrole-save'));
                },


                actionForID: function (id) {

                    var foundAction = null;
                    this.data.actions.forEach(function (action) {
                        if (action.id == id) {
                            foundAction = action;
                        }
                    })

                    return foundAction;
                },



                iconBusy: function ($el) {
                    $el.addClass(' fa-spinner fa-pulse');
                },

                iconReady: function ($el) {
                    $el.removeClass(' fa-spinner fa-pulse');
                },



                loadActions: function (list) {
                    this.data.actions = list;
                    this.Filter.load(list);
                },



                loadRole: function (role) {
                    this.data.role = role;
                    this.form.values(role.attr());
                    this.Filter.checkEntries(role.actions);
                },



                /** 
                 * show()
                 *
                 * when this controller is shown, make sure the bootstrap-table gets properly
                 * refreshed().
                 */
                show: function () {
                    this._super();
                    this.Filter.resetView();
                },


                '.rbac-roles-editrole-action-edit click': function ($el, ev) {

                    var $tr = $el.closest('tr');


                    var descriptionEl = $tr.find('.rbac-role-edit-action-description');
                    descriptionEl.attr('contentEditable', true);

                    $tr.find('.toEdit').hide();
                    $tr.find('.toSave').show().removeClass('hidden');

                    ev.preventDefault();

                },





                '.rbac-roles-editrole-action-cancel click': function ($el, ev) {

                    var id = parseInt($el.attr('assignment-id'));
                    var action = this.actionForID(id);


                    var $tr = $el.closest('tr');

                    // this is a cancel so let's return the contents to match the action description:
                    var descriptionEl = $tr.find('.rbac-role-edit-action-description');
                    descriptionEl.attr('contentEditable', false);
                    descriptionEl.html(action.attr('action_description'));


                    // return to display the edit icon:
                    $tr.find('.toSave').hide();
                    $tr.find('.toEdit').show();

                    ev.preventDefault();
                },



                '.rbac-roles-editrole-action-save click': function ($el, ev) {
                    var _this = this;

                    var id = parseInt($el.attr('assignment-id'));
                    var action = this.actionForID(id);

                    this.iconBusy($el);

                    var $tr = $el.closest('tr');


                    var descriptionEl = $tr.find('.rbac-role-edit-action-description');

                    // update our action with the new text
                    action.attr('action_description', descriptionEl.html());
                    action.save()
                        .fail(function (err) {

                            _this.iconReady($el);
                        })
                        .then(function (newAction) {
                            descriptionEl.attr('contentEditable', false);
                            _this.iconReady($el);

                            // return to display the edit icon:
                            $tr.find('.toSave').hide();
                            $tr.find('.toEdit').show();
                        })
                },




                // they click on the [cancel] button
                '.rbac-roles-editrole-cancel click': function ($el, ev) {

                    // emit the Cancel event:
                    this.element.trigger(this.options.eventCancel);
                    ev.preventDefault();
                },



                // they click on the [save] button
                '.rbac-roles-editrole-save click': function ($el, ev) {
                    var _this = this;

                    if (this.form.isValid()) {

                        this.buttonSave.busy();

                        var obj = this.form.values();
                        var actions = this.Filter.values();


                        var role = this.data.role;
                        role.attr(obj);
                        role.attr('actions', actions);


                        // Bug Fix: remove .permissions if present
                        // this prevents us from loosing any Permission Assignments created
                        // since the loading of the page.
                        if (role.permissions) {
                            delete role.permissions;
                        }
                        if (role._data.permissions) {
                            delete role._data.permissions;
                        }


                        role.save()
                            .fail(function (err) {
                                if (!_this.form.errorHandle(err)) {
                                    //// TODO: handle unknown Error event:
                                    // console.error('... unknown error! (Role Add Create) :', err);
                                }
                            })
                            .then(function (newRole) {

                                console.log('... edit role: newRole:', newRole);

                                _this.buttonSave.ready();

                                _this.element.trigger(_this.options.eventDone, newRole);

                            })

                    }

                    ev.preventDefault();
                }


            });

        });
});