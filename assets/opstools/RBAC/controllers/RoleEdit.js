
steal(
        // List your Controller's dependencies here:
        'appdev',
//        'opstools/RBAC/models/Projects.js',
//        'appdev/widgets/ad_delete_ios/ad_delete_ios.js',
        // '//opstools/RBAC/views/RoleEdit/RoleEdit.ejs',
function(){

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

            // this.element.html(can.view(this.options.templateDOM, {} ));

            // attach the FilteredBootstrapTable Controller
            var Filter = AD.Control.get('OpsPortal.FilteredBootstrapTable');
            this.Filter = new Filter(this.element, {
                tagFilter: '.rbac-role-edit-actionsearch',
                tagBootstrapTable: '#roleEditPermissionlist',
                scrollToSelect:true,

                cssSelected:'orange',

                tableOptions:{

                    pagination: true,

                    columns: [
                        { title:'',              checkbox:true               },  
                        { title:'Key',           field:'action_key'          },
                        { title:'Description',   field:'action_description'  },
                        { title:'Action',        formatter:'.action'         }
                    ]
                },

                dataToTerm: function(data) {  
                    if (data) {
                        return data.action_key;
                    } else {
                        return '';
                    }
                }
            });


            //// Create a Form for our Edit Role
            this.form = new AD.op.Form(this.element);
            this.form.bind( AD.Model.get('opstools.RBAC.PermissionRole'));
            // this.form.addField('actions', 'array', {});
            this.form.attach();


            this.buttonSave = new AD.op.ButtonBusy(this.element.find('.rbac-roles-editrole-save'));
        },
        
        
        
        loadActions:function(list) {
            this.data.actions = list;
            this.Filter.load(list);
        },



        loadRole:function(role) {
            this.data.role = role;
            this.form.values( role.attr() );
            this.Filter.checkEntries(role.actions);
        },



        /** 
         * show()
         *
         * when this controller is shown, make sure the bootstrap-table gets properly
         * refreshed().
         */
        show:function() {
            this._super();
            this.Filter.resetView();
        },



        // they click on the [cancel] button
        '.rbac-roles-editrole-cancel click': function ($el, ev) {

            // emit the Cancel event:
            this.element.trigger( this.options.eventCancel );
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
                role.save()
                .fail(function(err){
                    if (!_this.form.errorHandle(err)) {
//// TODO: handle unknown Error event:
// console.error('... unknown error! (Role Add Create) :', err);
                    }
                })
                .then(function(newRole){

console.log('... edit role: newRole:', newRole);

                    _this.buttonSave.ready();

                    _this.element.trigger( _this.options.eventDone, newRole );

                })

            }
            
            ev.preventDefault();
        }


    });


});