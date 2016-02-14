steal(
// List your Controller's dependencies here:
    'OpsPortal/controllers/Tool.js',
    'OpsPortal/views/ToolArea/tool.ejs',
    function () {
        System.import('appdev').then(function () {
            steal.import(
                'can',
                'appdev/ad',
                'appdev/control/control',
                'appdev/comm/socket')
                .then(function () {


                    //
                    // ToolArea 
                    // 
                    // This controller manages one of the areas within the WorkArea.
                    //
                    // It provides a simple container that houses several Tools that can be
                    // displayed for the user.
                    //
                    // When it is created, it is assigned an Area.key.
                    //
                    // This controller is responsible for 
                    //   1) creating new instances of Tools that are intended for it's Area.key
                    //   2) listening for 'opsportal.area.show' notifications and properly
                    //      show(), or hide() based upon the Area.key that was provided in the
                    //      notification.
                    //
                    //
                    AD.Control.extend('OpsPortal.ToolArea', {

                        init: function (element, options) {
                            var self = this;
                            this.options = AD.defaults({
                                template_tool: '/OpsPortal/views/ToolArea/tool.ejs'
                            }, options);

                            this.dataSource = this.options.dataSource; // AD.models.Projects;

                            //           this.initDOM();

                            // keep track of all the Tools in our area:
                            this.listTools = {};


                            // listen for new tool notifications.
                            AD.comm.hub.subscribe('opsportal.tool.new', function (key, data) {

                                // if this tool is for my area, then create it.
                                if (self.options.key == data.area) {
                                    self.createTool(data);
                                }
                            });


                            // listen for area show notifications.
                            AD.comm.hub.subscribe('opsportal.area.show', function (key, data) {

                                // if this area is for my area, then show it.
                                if (self.options.key == data.area) {
                                    self.element.show();
                                } else {

                                    // else hide
                                    self.element.hide();
                                }

                            });

                        },



                        /**
                         * createTool
                         *
                         * Creates a new Tool within our ToolArea for each announced 'Tool' from
                         * the OpsPortal controller.
                         *
                         * @param {obj} tool   the announced tool definition.
                         *                      { controller:'ToolControllerName' }
                         */
                        createTool: function (tool) {

                            // add a new tool area div
                            var divKey = 'opsportal-area-tool-' + tool.controller;
                            var data = {
                                key: divKey
                            }
                            this.element.append(can.view(this.options.template_tool, data));


                            // attach the Tool controller to the new div
                            var newTool = new AD.controllers.OpsPortal.Tool(this.element.find('.' + divKey), {
                                key: tool.controller,
                                areaKey: this.options.key,
                                data: tool
                            });


                            // remember this tool.
                            this.listTools[tool.controller] = newTool;
                        },



                        initDOM: function () {

                            this.element.html(can.view(this.options.templateDOM, {}));
                        }


                    });


                });
        });
    });