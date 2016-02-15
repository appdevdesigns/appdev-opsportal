steal(
// List your Controller's dependencies here:
    'OpsPortal/views/Tool/Tool.ejs',
    function () {
        System.import('appdev').then(function () {
            steal.import(
                'can/control/control',
                'appdev/ad',
                'appdev/control/control',
                'appdev/comm/socket')
                .then(function () {



                    //
                    // Tool 
                    // 
                    // This controller manages the actual opstool/Controller application that
                    // is being shown to the user.
                    //
                    // This controller is responsible for:
                    //  1) creating the instance of the Application and inserting it in the DOM
                    //  2) deciding if the Tool should be shown 
                    //  3) deciding if a Tool should be resized()
                    //
                    // Resizing: 
                    // The OpsPortal is intended to work in the maximum area of your browser 
                    // display.  It is possible that the browser window is resized and in some
                    // cases your Tool might want to respond to the new screen size.
                    //
                    // This Tool controller is responsible for figuring out when an Application
                    // should be notified of a new resize action.
                    //
                    // Performing a resize when a tool is not actually shown, can cause the tool
                    // to misalign it's view due to dom elements not actually being show at the 
                    // moment and reporting 0 heights when they do take up space when shown.
                    //
                    //
                    AD.Control.extend('OpsPortal.Tool', {

                        init: function (element, options) {
                            var self = this;
                            this.options = AD.defaults({
                                templateDOM: '/OpsPortal/views/Tool/Tool.ejs'
                            }, options);


                            this.controller = null;     // our Application controller
                            this.sizeData = null;       // the last reported resize() height
                            this.isActive = false;      // is our tool the active one?
                            this.isAreaActive = false;  // is our area the active area?


                            // we were provided the Application's Controller name
                            // if it exists, then create an instance of it on the DOM:
                            var controllerName = this.options.data.controller;

            
                            // if (AD.controllers.opstools[controllerName]) {
                            //     if( AD.controllers.opstools[controllerName].Tool) {
                            //         this.controller = new AD.controllers.opstools[controllerName].Tool( this.element);
                            //     } else {
                            //         console.error('controller ('+controllerName+').Tool()   not found!');
                            //     }
                            // } else {
                            //     console.error('controller ('+controllerName+') not found!');
                            // }

                            //// NOTE: In process of debugging some production build timing problems, I removed the above
                            //// code for creating the controllers and created the following code to delay the instance 
                            //// loading of the controllers.
                            ////
                            //// other changes to the OpsPortal code seems to have resolved the initial error I was 
                            //// having, but I'm leaving this code here for reference if those come back.
                            ////
        
                            //// It seems that the server/browser can occassionally 'stall' the loading of these
                            //// javascript libraries.  these packages are requested in parallel, and we need to 
                            //// verify they are loaded before attempting to access them.
            
                            // temp mock controller to catch .needsUpdate(), .resize() and trigger() requests while delaying. 
                            this.controller = {
                                needsUpdate: function () {
                                    this._needsUpdate = true;
                                },
                                resize: function (data) {
                                    this._resize = data;
                                },
                                trigger: function () {
                                }
                            };
                            var delayedLoad = function (name, count) {
                                if (count < 200) {
                                    if (AD.controllers.opstools[name]) {
                                        if (AD.controllers.opstools[name].Tool) {
                                            var tempController = self.controller;
                                            self.controller = new AD.controllers.opstools[name].Tool(self.element);
                                            if (tempController._needsUpdate) {
                                                self.controller.needsUpdate();
                                            }
                                            if (tempController._resize) {
                                                self.controller.resize(tempController._resize);
                                            }
                                        } else {
                                            console.warn('controller (' + name + ').Tool()   not found!');
                                            console.warn('... waiting to try again');
                                            setTimeout(function () {
                                                delayedLoad(name, count + 1);
                                            }, 100);
                                        }
                                    } else {
                                        console.warn('controller (' + name + ') not found!');
                                        console.warn('... waiting to try again');
                                        setTimeout(function () {
                                            delayedLoad(name, count + 1);
                                        }, 100);
                                    }
                                } else {
                                    console.error('too many attempts to wait for [' + name + '] to load!');
                                }
                            }
                            delayedLoad(controllerName, 0);

                            // listen to resize notifications
                            AD.comm.hub.subscribe('opsportal.resize', function (message, data) {
                                self.sizeData = data;

                                // // if our controller is setup
                                // if (self.controller) {

                                // tell controller it needs to update it's display at some point
                                self.controller.needsUpdate();

                                // and if I'm active
                                if ((self.isAreaActive)
                                    && (self.isActive)) {

                                    // make sure my controller knows to resize();
                                    self.controller.resize(data);
                                }
                                // }
                            });


                            // listen to notifications to show a particular area
                            AD.comm.hub.subscribe('opsportal.area.show', function (message, data) {
                                self.areaShow(data);
                            });


                            // listen to notification to show a particular tool
                            AD.comm.hub.subscribe('opsportal.tool.show', function (message, data) {
                                self.toolShow(data);
                            });


                            // start off hidden until we are told to show ourselves:
                            this.element.hide();
                        },



                        /**
                         * areaShow
                         *
                         * Determines if it is our area and then decide if our tool should be
                         * told to resize itself.
                         *
                         * NOTE: called when a new Area is chosen on the side menu.
                         *
                         * @param {obj} data  the notification packet: { area: 'AreaString' }
                         */
                        areaShow: function (data) {
                            // if it is our area
                            if (this.options.areaKey == data.area) {

                                this.isAreaActive = true;

                                // and I'm active
                                if (this.isActive) {

                                    // make sure my controller knows to resize();
                                    this.controller.resize(this.sizeData);
                                    this.controller.trigger('opsportal.tool.show', {});
                                }

                            } else {

                                this.isAreaActive = false;
                                this.controller.trigger('opsportal.tool.hide', {});
                            }
                        },



                        initDOM: function () {

                            this.element.html(can.view(this.options.templateDOM, {}));

                        },



                        resize: function () {
                            if (this.isActive) {
                                this.controller.resize();
                            }
                        },



                        /**
                         * toolShow
                         *
                         * Determines if it is our Tool and then decide if our tool should be
                         * told to resize itself.
                         *
                         * NOTE: called in response to a switch of which tool on the Menu Bar is
                         * chosen.
                         *
                         * @param {obj} data  the notification packet: 
                         *                    { area: 'AreaString', tool:'ControllerName' }
                         */
                        toolShow: function (data) {

                            if (data.area == this.options.areaKey) {

                                if (data.tool == this.options.key) {

                                    if (!this.isActive) {

                                        //// this is a switch TO our tool

                                        this.isActive = true;

                                        // remember: show() first then resize()
                                        this.element.show();
                                        this.controller.resize(this.sizeData);
                                        // can.event.dispatch.call(this.controller, 'opsportal.tool.show', {});
                                        this.controller.trigger('opsportal.tool.show', {});
                                    }

                                } else {

                                    if (this.isActive) {

                                        //// this is a switch AWAY from our tool
                        
                                        this.isActive = false;
                                        this.element.hide();
                                        // can.event.dispatch.call(this.controller, 'opsportal.tool.hide', {});
                                        this.controller.trigger('opsportal.tool.hide', {});
                                    }

                                }
                            }
                        }


                    });

                });
        });
    });