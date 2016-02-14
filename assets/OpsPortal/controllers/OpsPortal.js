steal(
// List your Controller's dependencies here:
    'OpsPortal/classes/OpsTool.js',
    'OpsPortal/classes/OpsForm.js',
    'OpsPortal/classes/OpsDialog.js',
    'OpsPortal/classes/OpsWidget.js',
    'OpsPortal/controllers/MenuList.js',
    'OpsPortal/controllers/WorkArea.js',
    'OpsPortal/controllers/SubLinks.js',
    'OpsPortal/views/OpsPortal/OpsPortal.ejs',
    'OpsPortal/views/OpsPortal/taskList.ejs',
    'OpsPortal/portal-scratch.css',
    'OpsPortal/opsportal.css',
    'OpsPortal/opsportal-theme.css',
    function () {
        System.import('appdev').then(function () {
            steal.import(
                'jquery',
                'appdev',
                'appdev/ad',
                'appdev/control/control',
                'appdev/comm/socket',
                'appdev/labels/lang'
            // ).then(
            // 'js/jquery.sidr.min.js',
            // ).then(
                ).then(function () {
                    steal('opsportal/requirements.js'); // this returns the steal() for loading each OpsTool

                    // make sure $ is defined:
                    var $ = typeof window.jQuery == 'undefined' ? AD.ui.jQuery : window.jQuery;
    
                    // create our opstools namespace for our tools.
                    if (typeof AD.controllers.opstools == 'undefined') AD.controllers.opstools = {};

                    //
                    // OpsPortal 
                    // 
                    // The OpsPortal is a Single Page Application (SPA) that contains the tools
                    // a user is allowed to see.
                    //
                    // It is designed to start out on an existing Web Page (Drupal, WordPress, 
                    // etc...) and display a mini summary/ simple header + link.  Once clicked
                    // it expands to fill up the whole browser area and allows you to work on 
                    // the tools contained inside.
                    //
                    // The OpsPortal begins by attaching itself to it's provided DOM element
                    // and show a 'taskList' view.
                    //
                    // It then requests from the server a configuration intended for this user.
                    //
                    // The configuration defines a set of Areas, and a set of Tools for each 
                    // Area.
                    //
                    // The OpsPortal then loads the required Tool resources and then configures
                    // them in the DOM accordingly.
                    //
                    // The OpsPortal has 3 Main Sections:
                    //  - The Masthead:  the controller over the top of the page
                    //  - The Menu:  A slide in Menu allowing you to switch to different Areas
                    //  - The WorkArea: the place that displays the currently active Tool
                    //
                    // 
                    //
                    //
                    AD.Control.extend('OpsPortal.OpsPortal', {


                        init: function (element, options) {
                            var self = this;
                            this.options = AD.defaults({
                                'portal-autoenter': false,
                                templateDOM: '/OpsPortal/views/OpsPortal/OpsPortal.ejs',
                                templateList: '/OpsPortal/views/OpsPortal/taskList.ejs',
                                templateError: '/OpsPortal/views/OpsPortal/error.ejs'
                            }, options);


                            this.hiddenElements = [];           // used to track which elements we have hidden


                            this.elOptions();                   // search the attached element for config options.

                            // this.initDOM();                     // embedded list view
                            this.initPortal();                  // popup portal view

                            // update loading progress for OpsPortal:
                            AD.ui.loading.reset();
                            AD.ui.loading.text(AD.lang.label.getLabel('opp.configuringTools'));
                            AD.ui.loading.resources(2); // kicks off a new refresh of the bar


                            this.requestConfiguration();


                            // make sure we resize our display to the document/window
                            var sizeContent = function () {
                                self.resize();
                            };
                            AD.ui.jQuery(document).ready(sizeContent);
                            AD.ui.jQuery(window).resize(sizeContent);



                            // display progress bar as tools load
                            //this.progress(80, $('#opsportal-loading'))
            


                            // OK, one of the problems with resizing our tools comes when
                            // they are currently not displayed.  Some widgets (GenLists.js)
                            // need to evaluate their layout based upon the size of their
                            // existing headers.  But when that header isn't displayed, the
                            // reported size is 0.
                            // These tools need a chance to resize again once they are displayed
                            // So, those tools being 'opsportal.area.show'n need to resize
                            // now that they are displayed.
                            // This will force a global resize which will do the trick.
                            AD.comm.hub.subscribe('opsportal.area.show', function (key, data) {

                                setTimeout(sizeContent, 4);

                            });

                        },



                        /**
                         * search the base element attributes for configuration options.
                         *     
                         * @return {nil} no return value
                         */
                        elOptions: function () {
                            var _this = this;

                            var params = ['portal-autoenter'];
                            params.forEach(function (key) {

                                var val = _this.element.attr(key);
                                if (typeof val !== 'undefined') {
                                    val = val.toLowerCase();
                                    if (val == 'false') {
                                        val = false;
                                    }
                                    _this.options[key] = val;
                                }
                            })


                        },



                        initDOM: function () {

                            this.element.html(can.view(this.options.templateList, {}));


                            //// TODO: determine size of el
                            //// TODO: if large enough, display .list-content
                            //// TODO: create 'bootstrap' routine to insert resources into web page

                            //// FEATURE: Notifications : create mechanism for opstools to indicate how many tasks/todo's they want to register
                            //// FEATURE: SubMenu's : display additional tools in an area using SubMenu's


                            //            this.element.find('.opsportal-menu-trigger').sidr({name:'opsportal-menu-widget',side:'left'});
                        },



                        initDOMError: function (errMsg) {
                            this.element.html(can.view(this.options.templateError, { errorMessage: errMsg }));
                            AD.lang.label.translate(this.element);
                        },



                        // this is the popup Ops Portal that takes over the page:
                        initPortal: function () {

                            this.portalPopup = AD.ui.jQuery('<div class="op-portal-popup">');
                            this.portalPopup.hide();
                            this.portalPopup.html(can.view(this.options.templateDOM, {}));

                            this.menu = new AD.controllers.OpsPortal.MenuList(this.portalPopup.find('.op-menu-widget'));
                            this.workArea = new AD.controllers.OpsPortal.WorkArea(this.portalPopup.find('.op-stage'));
                            //            this.portalPopup.find('.opsportal-menu-trigger').sidr({name:'op-menu-widget',side:'left'});

                            var SubLinks = AD.Control.get('OpsPortal.SubLinks');
                            //this.subLinks = new SubLinks(this.portalPopup.find('.opsportal-nav-sub-list'));
                            this.subLinks = new SubLinks(this.portalPopup.find('#op-masthead-nav'));
                            this.dom = {};
                            this.dom.resize = {};
                            //this.dom.resize.masthead = this.portalPopup.find(".opsportal-container-masthead");
                            this.dom.resize.masthead = this.portalPopup.find(".op-masthead");
                            AD.ui.jQuery('body').append(this.portalPopup);

                            AD.lang.label.translate(this.portalPopup);  // translate the current OpsPortal Labels
                        },



                        portalDisplay: function () {

                            var self = this;
                            this.hiddenElements = [];

                            // take all the body.children  && hide them.
                            $('body').children().each(function (indx) {
                                var $el = $(this);
                                if ($el != self.portalPopup) {
                                    $el.hide();
                                    self.hiddenElements.push($el);
                                }
                            });

                            // Now show our Portal:
                            this.portalPopup.show();

                        },



                        portalHide: function () {

                            var self = this;
                            this.hiddenElements.forEach(function ($el) {
                                $el.show();
                            });

                            // Now hide our Portal:
                            this.portalPopup.hide();
                        },



                        resize: function () {

                            // The size we report to our Tools is window.height - masthead.height
                            var hWindow = $(window).height();
                            var hMasthead = this.dom.resize.masthead.outerHeight(true);
                            console.log('//// resize: window.height:' + hWindow + ' masthead.outer:' + hMasthead);
                            var newHeight = $(window).height() - hMasthead;  //this.portalPopup.find(".opsportal-container-masthead").outerHeight(true);

                            // notify of a resize action.
                            // -1px to ensure sub tools don't cause page scrolling.
                            AD.comm.hub.publish('opsportal.resize', { height: newHeight - 1 });
                        },



                        requestConfiguration: function () {
                            var self = this;
            
                            // //// For debugging:
                            // AD.comm.hub.subscribe('**', function(key, data){
                            //     console.log('pub:'+key);
                            //     console.log(data);
                            // });

                            AD.ui.loading.completed(1);

                            AD.comm.service.get({ url: '/opsportal/config' }, function (err, data) {

                                AD.ui.loading.completed(1);  // just to show we have loaded the config.
                                if (err) {

                                    // what to do here?
                                    var label = AD.lang.label.getLabel('opp.errorNoPermission') || ' You don\'t have permission.  Ask your administrator to grant you access. ';
                                    self.initDOMError(label)

                                } else {

                                    // prepare our loading progress indicator:
                                    AD.ui.loading.resources(data.areas.length);
                                    AD.ui.loading.resources(data.tools.length);

                                    var defaultArea = {};

                                    // choose 1st area as default just in case none specified:
                                    if (data.areas[0]) {
                                        defaultArea = data.areas[0];
                                    }

                                    // create each area
                                    for (var a = 0; a < data.areas.length; a++) {
                                        AD.comm.hub.publish('opsportal.area.new', data.areas[a]);
                                        if (data.areas[a].isDefault) {
                                            defaultArea = data.areas[a];
                                        }
                                        AD.ui.loading.completed(1);
                                    }


                                    var defaultTool = {};

                                    // assign 1st tool as our default to show
                                    if (data.tools[0]) defaultTool[data.tools[0].area] = data.tools[0];

                                    // create each tool
                                    for (var t = 0; t < data.tools.length; t++) {
                                        AD.comm.hub.publish('opsportal.tool.new', data.tools[t]);
                                        if (data.tools[t].isDefault) defaultTool[data.tools[t].area] = data.tools[t];
                                        AD.ui.loading.completed(1);
                                    }


                                    //// all tools should be created now

                                    // make sure they all have resize()ed
                                    self.resize();

                                    // notify of our default Area:
                                    // there can be only 1 ...
                                    AD.comm.hub.publish('opsportal.area.show', { area: defaultArea.key });

                                    // now notify all our default tools
                                    for (var t in defaultTool) {
                                        AD.comm.hub.publish('opsportal.tool.show', {
                                            area: defaultTool[t].area,
                                            tool: defaultTool[t].controller
                                        });
                                    }


                                    // once everything is created, tell the menu slider to attach itself
                                    self.portalPopup.find('#op-masthead-menu a:first-of-type').sidr({ name: 'op-menu-widget', side: 'left' });


                                    // now show the Link to open the OpsPortal
                                    self.initDOM();

                                    AD.lang.label.translate(self.element);  // translate the OpsPortal task list


                                    // notify everyone the opsportal is finished creating the Tools.
                                    AD.comm.hub.publish('opsportal.ready', {});


                                    // if our auto open setting is set, then 
                                    if (self.options['portal-autoenter']) {

                                        // auto click the Enter link:
                                        self.element.find('.op-masthead a:first-of-type').click();
                                    }

                                }

                            });

                        },



                        //'.opsportal-menu-trigger-text click' : function( $el, ev) {
                        //'.opsportal-masthead a:first-of-type click' : function( $el, ev) {
                        '.op-masthead a:first-of-type click': function ($el, ev) {
                            //'.op-launch click' : function( $el, ev) {
                            // this should show the Portal Popup
                            this.portalDisplay();

                            ev.preventDefault();
                        },



                        '.ad-item-add click': function ($el, ev) {

                            ev.preventDefault();
                        },


                        /*
                                '.apd-portal-menu-trigger click': function($el, ev) {
                        
                                    var width = this.menu.width();  //.toggle();
                                    AD.comm.hub.publish('opsportal.menu.toggle', { width: width });
                                }
                        */
                        'progress': function (percent, $element) {
                            var progressBarWidth = percent * $element.width() / 100;
                            $element.find('div').animate({ width: progressBarWidth }, 500).html(percent + "%&nbsp;");
                        }

                    });
                });
        });
    });
