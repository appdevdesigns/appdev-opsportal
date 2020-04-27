steal(
   // List your Controller's dependencies here:
   "OpsPortal/controllers/ToolArea.js",
   "OpsPortal/views/WorkArea/area.ejs",
   function() {
      System.import("appdev").then(function() {
         steal
            .import("appdev/ad", "appdev/control/control", "appdev/comm/hub")
            .then(function() {
               //
               // WorkArea
               //
               // This controller manages the area below the OpsPortal Menu
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
               // This WorkArea controller listens for each of those notifications and
               // creates a new ToolArea instance for each Area it is told about.
               //
               AD.Control.extend("OpsPortal.WorkArea", {
                  init: function(element, options) {
                     var self = this;
                     this.options = AD.defaults(
                        {
                           template_area: "/OpsPortal/views/WorkArea/area.ejs"
                        },
                        options
                     );

                     this.dataSource = this.options.dataSource; // AD.models.Projects;

                     this.initDOM();

                     this.listAreas = {}; // a list of all the created ToolAreas as
                     // { 'areaKey' : {ToolAreaController} }

                     // listen for new area notifications.
                     AD.comm.hub.subscribe("opsportal.area.new", function(
                        key,
                        data
                     ) {
                        self.createArea(data);
                     });
                  },

                  areaKey: function(area) {
                     return "opsportal-area-" + area.key;
                  },

                  /**
                   * createArea
                   *
                   * Creates a new ToolArea within our Workspace for each announced 'Area' from
                   * the OpsPortal controller.
                   *
                   * @param {obj} area   the announced area definition.
                   *                      { key:'AreaString' }
                   */
                  createArea: function(area) {
                     // add a new tool area div
                     var areaKey = this.areaKey(area);
                     var data = {
                        key: areaKey
                     };
                     this.element.append(
                        can.view(this.options.template_area, data)
                     );

                     // attach the ToolArea controller to the new div
                     var newArea = new AD.controllers.OpsPortal.ToolArea(
                        this.element.find("." + areaKey),
                        {
                           key: area.key
                        }
                     );

                     // remember this area.
                     this.listAreas[area.key] = newArea;
                  },

                  createTool: function(tool) {
                     var areaKey = tool.areas[0].key;
                     var toolArea = this.listAreas[areaKey];
                     if (toolArea) {
                        toolArea.createTool(tool);
                     }
                  },

                  initDOM: function() {
                     //           this.element.html(can.view(this.options.templateDOM, {} ));
                  },

                  ready: function() {
                     var dfd = AD.sal.Deferred();

                     var allAreasReady = [];
                     for (var k in this.listAreas) {
                        allAreasReady.push(this.listAreas[k].ready());
                     }

                     $.when
                        .apply(null, allAreasReady)
                        .fail(function(err) {
                           dfd.reject(err);
                        })
                        .then(function() {
                           dfd.resolve();
                        });

                     return dfd;
                  },

                  /**
                   * removeArea
                   *
                   * Removes the given ToolArea that matches the provided
                   * area description.
                   *
                   * @param {obj} area   the announced area definition.
                   *                      { key:'AreaString' }
                   */
                  removeArea: function(area) {
                     // remove the tool area div
                     var areaKey = this.areaKey(area);
                     this.element.find('div[area="' + areaKey + '"]').remove();

                     // forget this area.
                     delete this.listAreas[area.key];
                  },

                  removeTool: function(tool) {
                     var areaKey = tool.areas[0].key;
                     var toolArea = this.listAreas[areaKey];
                     if (toolArea) {
                        toolArea.removeTool(tool);
                     }
                  }
               });

               // });
            });
      });
   }
);
