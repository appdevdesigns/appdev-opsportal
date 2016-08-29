steal(
    'OpsPortal/views/MenuList/MenuList.ejs',
    'OpsPortal/views/MenuList/menuItem.ejs',
    function () {
        System.import('appdev').then(function() {
            steal.import(
                'can/control/control',
                'appdev/ad',
                'appdev/control/control',
                'appdev/comm/socket'
                ).then(function () {


                    //
                    // MenuList 
                    // 
                    // This controller manages the slide in Menu that appears.
                    //
                    // Each entry in the menu represents an "Area" within the OpsPortal.
                    //
                    // An "Area" is a collection of related tools that can be displayed
                    // to the user.
                    //
                    // When the main OpsPortal controller receives it's configuration 
                    // information from the server, the OpsPortal will fire off a 
                    // 'opsportal.area.new' notification for each Area defined.
                    //
                    // This MenuList controller listens for each of those notifications and
                    // creates a new entry in it's list for each Area it is told about.
                    //
                    // Clicking on one of the Menu Entries will cause this MenuList controller
                    // to emit 'opsportal.area.show', with the area definition for that area.
                    //
                    AD.Control.extend('OpsPortal.MenuList', {

                        init: function (element, options) {
                            var self = this;
                            this.options = AD.defaults({
                                templateDOM: '/OpsPortal/views/MenuList/MenuList.ejs',
                                templateItem: '/OpsPortal/views/MenuList/menuItem.ejs'
                            }, options);


                            this.initDOM();

                            this.data = {};
                            this.data.areas = null;
                            this.data.areaHash = {};


                            // // listen for new area notifications
                            // AD.comm.hub.subscribe('opsportal.area.new', function (key, data) {
                            //     self.createArea(data);
                            // });

                        },



                        createArea: function (areaData) {
                            // console.log(area);

                            if (this.data.areas) {

                                var area = this.data.areaHash[areaData.key];
                            
                                this.element.find('.op-widget-body > ul')
                                //this.element.find('#op-list-menu')
                                    .append(can.view(this.options.templateItem, { area: area }));

                                // translate the new area
                                AD.lang.label.translate(this.element.find('[area="' + area.key+'"]'));
                            } else {
                                console.error('MenuList.createArea() called before our loadAreas()!');
                            }
                        },

                        loadAreas: function(list) {
                            var _this = this;
                            this.data.areas = list;
                            list.forEach(function(area){
                                _this.data.areaHash[area.key] = area;
                            })
                        },


                        initDOM: function () {

                            this.element.html(can.view(this.options.templateDOM, {
                                baseURL: AD.config.getValue('siteBaseURL') || ''
                            }));

                        },


                        sortAreas:function() {

                            // perform the initial sort of the tool elements by weight.
                            this.element.find('#op-list-menu').each(function(i, ul){
                                $(ul).find('li').sort(function(a, b){
                                    return parseInt($(a).attr('data-weight')) > parseInt($(b).attr('data-weight'));
                                }).appendTo(ul);
                            });

                        },



                        //  When a menu item is clicked
                        //'.opsportal-nav-list-item click' : function($el, ev) {
                        '#op-list-menu li click': function ($el, ev) {

                            var area = $el.attr('area');
                            AD.comm.hub.publish('opsportal.area.show', { area: area });
                            AD.ui.jQuery.sidr('close', 'op-menu-widget');
                            ev.preventDefault();
                        }


                    });


                });
        });
    });