/* global AD */

steal(
    // List your Controller's dependencies here:
    'opstools/RBAC/models/SiteUser.js',

    // 'opstools/RBAC/models/Permission.js',
    // 'opstools/RBAC/models/PermissionAction.js',
    'opstools/RBAC/models/PermissionRole.js',
    'opstools/RBAC/models/PermissionScope.js',

    'opstools/RBAC/controllers/Users.js',
    'opstools/RBAC/controllers/Roles.js',
    'opstools/RBAC/controllers/Scopes.js',

    'opstools/RBAC/views/RBAC/RBAC.ejs',
    function () {
        AD.ui.loading.resources(12);

        System.import('can').then(function () {
            steal.import(
                'can/construct/construct',
                'can/control/control',
                'appdev/ad',
                'appdev/control/control',
                'OpsPortal/classes/OpsTool',
				'site/labels/opstools-RBAC'
                ).then(function () {
                    console.log('RBAC STart');
                    
                    AD.ui.loading.completed(12);
    
                    //
                    // RBAC 
                    // 
                    // This is the OpsPortal Roles Based Access Control interface.
                    //
                    // This RBAC Controller is responsible for setting up the Application's
                    // subcontrollers and managing the interactions between them.
                    //



//// LEFT OFF: 
//// + Add loading indicators on Grids
//// + Form Validation:  Validate Role Fields
//// + Grid Heights: scale grids to match available height


                    // Namespacing conventions:
                    // AD.Control.extend('[application].[controller]', [{ static },] {instance} );
                    AD.Control.OpsTool.extend('RBAC', { 


                        CONST: {

                        }, 


                        init: function (element, options) {
                            var self = this;
                            options = AD.defaults({
                                    templateDOM: '/opstools/RBAC/views/RBAC/RBAC.ejs'
                            }, options);
                            this.options = options;

                            // Call parent init
                            // AD.classes.UIController.prototype.init.apply(this, arguments);
                            this._super(element, options);

                            this.portals = {};  // a hash of portals managed by RBAC:

                            this.data = {};     // hold any data we are working with.
                            this.data.uuid = 'RBAC'+AD.util.uuid(); // make our UI reference unique
                            this.data.users = [];
                            this.data.permissions = [];  // all permission fields
                            this.data.roles = [];   // all the roles in the system
                            this.data.scopes = [];  // all the scopes in the db

                            this.data.hasBeenShown  = false;     // has this controller been shown yet?
                            this.data.lastPortalShown = 'Users'; // what was the last portal displayed?


                            this.data.resize = {};
                            this.data.resize.menuBar = null;


                            this.initDOM();


                            this.loadData();

                            // // default to User portal:
                            this.portalShow('users');


                            this.translate(); // translate the labels on the tool
                        },


                        uuid:function(key) {

                            return key+this.data.uuid;
                        },


                        initDOM: function () {
                            var _this = this;

                            this.element.html(can.view(this.options.templateDOM, { uuid: this.data.uuid } ));

                            
                            var controllers = {
                                'opstools.RBAC.Users'               : { el: '.'+_this.uuid('rbac-users'),           opt:{ uuid: this.data.uuid } },
                                'opstools.RBAC.Roles'               : { el: '.'+_this.uuid('rbac-roles'),           opt:{ uuid: this.data.uuid } },
                                'opstools.RBAC.Scopes'              : { el: '.'+_this.uuid('rbac-scopes'),          opt:{ uuid: this.data.uuid } }
                            }

                            var initPortal = function(key, ref, el, options) {
                                var Controller = AD.Control.get(ref);
                                _this.portals[key] = new Controller( el, options );
                            }

                            for(var cKey in controllers) {
                                var parts = cKey.split('.');
                                var portal = parts.pop();
                                
                                initPortal(portal, cKey, controllers[cKey].el, controllers[cKey].opt);
                            }

                        },



                        loadUsers:function() {
                            var _this = this;

                            // console.log('... loading Users');
                            var User = AD.Model.get('opstools.RBAC.SiteUser');
                            User.findAll()
                            .fail(function(err){
                                AD.error.log('RBAC:RBAC: Error loading Users', {error:err});
                            })
                            .then(function(list){
                                _this.data.users = list;
                                _this.portals.Users.loadUsers(list);
                            });

                        },



                        loadData: function() {
                            var _this = this;


                            this.loadUsers();


                            var Roles = AD.Model.get('opstools.RBAC.PermissionRole');
                            Roles.findAll()
                            .fail(function(err){
                                AD.error.log('RBAC:RBAC: Error loading Roles', {error:err});
                            })
                            .then(function(list){
                                // make sure they are all translated.
                                list.forEach(function(l){
                                    l.translate();
                                })
                                _this.portals.Users.loadRoles(list);
                                _this.portals.Roles.loadRoles(list);
                                _this.data.roles = list;    
                            });


                            var Scopes = AD.Model.get('opstools.RBAC.PermissionScope');
                            Scopes.findAll()
                            .fail(function(err){
                                AD.error.log('RBAC:RBAC: Error loading scopes', {error:err});
                            })
                            .then(function(list){
                                // // make sure they are all translated.
                                list.forEach(function(l){
                                    if(l.translate) l.translate();

                                    // convert embedded .object into an object.id
                                    if (l.object) {
                                        l.object = l.object.id || l.object;
                                    }
                                })
                                _this.portals.Users.loadScopes(list);
                                _this.portals.Scopes.loadScopes(list);

                                _this.data.scopes = list;    // all the 
                            });


                        },



                        portalShow: function(portalKey) {

                            if (this.element) {

                                var idTopMenu = this.uuid("topmenu");

                                this.element.find('#'+idTopMenu+' li.selected').removeClass('selected');

                                for (var p in this.portals) {
// TODO: open this up when we implement scopes.
// if (portalKey!='Scopes'){
                                    if (p.toLowerCase() == portalKey.toLowerCase()) {

                                        this.portals[p].show();
                                        this.data.lastPortalShown = p;

                                        // be sure to resize it when it is shown.
                                        if (this.data.resize && this.data.resize.available) {
                                            if (this.portals[p].resize) {
                                                this.portals[p].resize( { height: this.data.resize.available } );
                                            }
                                        }

                                        this.element.find('[rbac-menu="'+p+'"]').addClass('selected');

                                    } else {
                                        this.portals[p].hide();
                                    }
// }
                                }
                            }

                        },



                        resize:function(data) {

                            if (this.element) {

                                this._super();

                                var totalHeight = data.height;


                                // update the containing Div to height
                                // this div is total Height, since it contains the menuBar:
                                this.element.css('height', totalHeight + 'px');



                                // find the height of the menu bar (selected item has a dropdown arrow)
                                // this shouldn't change, so only do it 1x
                                if (!this.data.resize.menuBar) {

                                    var selectedMenuItem = this.element.find('li.selected.rbac-menu');
                                    this.data.resize.menuBar = selectedMenuItem.outerHeight(true);
                                }


                                // Total area for the available space of the tool, will be the
                                // givenheight - (heightOfMenuBar)
                                this.data.resize.available = totalHeight - this.data.resize.menuBar;


                                // send  displayed portal a resize(availableHeight);

                                if (this.element.is(':visible')) {
                                    if (!this.data.hasBeenShown) {

                                        // tell our portal to show() itself:
                                        this.portalShow(this.data.lastPortalShown);
                                        this.data.hasBeenShown = true;
                                    }
                                }


                                // pass a resize() call to the currently shown portal:
                                var portal = this.portals[this.data.lastPortalShown];
                                if (portal.resize) {
                                    portal.resize( { height: this.data.resize.available } );
                                }
                            }
                            
                        },



                        '.rbac-menu click': function ($el, ev) {

                            var portal = $el.attr('rbac-menu');
console.log('... show portal:', portal);
                            this.portalShow(portal);

                            ev.preventDefault();
                        }


                    });

                });
        });
    });