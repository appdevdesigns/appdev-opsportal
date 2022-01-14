System.import("appdev").then(function() {
   steal
      .import(
         "appdev/ad",
         "appdev/control/control",
         "appdev/model/model",
         "appdev/sal/web-jquery",
         "appdev/comm/socket"
      )
      .then(function() {
         //
         // SubLinks
         //
         // This controller manages the sublinks that appear in the Masthead.
         //
         // For each Area defined in the OpsPortal, a new set of SubLinks will appear.
         //
         // Each Area of the OpsPortal can contain numerous Tools for the user to
         // work with.  The SubLinks will allow the user to switch between tools
         // in the currently displyed Area.
         //
         // When the main OpsPortal controller receives it's configuration
         // information from the server, the OpsPortal will fire off a
         // 'opsportal.area.new' notification for each Area defined.
         //
         // This SubLinks controller listens for each of those notifications and
         // creates a new set of links for each Area it is told about.
         //
         // Clicking on one of the links will cause this SubLinks controller
         // to emit 'opsportal.tool.show', with the tool definition for that link.
         //
         AD.Control.extend("OpsPortal.SubLinks", {
            init: function(element, options) {
               var self = this;
               this.options = AD.defaults(
                  {
                     // templateDOM: '//OpsPortal/views/Sublinks/Sublinks.ejs',
                     // templateItem: '//OpsPortal/views/MenuList/menuItem.ejs'
                  },
                  options
               );

               this.areaLinks = {}; // the DOM ul for each of our area links

               this.initDOM();

               // listen for new area notifications
               AD.comm.hub.subscribe("opsportal.area.new", function(key, data) {
                  self.createArea(data);
               });

               // listen for new tool notifications.
               AD.comm.hub.subscribe("opsportal.tool.new", function(key, data) {
                  // data = {
                  //     area:'area.key',
                  //     controller:'RBAC',
                  //     isDefault:true,
                  //     label:"Permissions"
                  // }
                  self.createLink(data);
               });

               // listen for area.show notifications.
               AD.comm.hub.subscribe("opsportal.area.show", function(
                  key,
                  data
               ) {
                  self.showArea(data);
               });

               // listen for tool.show notifications.
               AD.comm.hub.subscribe("opsportal.tool.show", function(
                  key,
                  data
               ) {
                  // data = {
                  //     area: 'Profile',
                  //     tool: 'GMAMatrix'
                  // }
                  self.updateToolLink(data);
               });

               AD.comm.hub.subscribe("opsportal.ready", function(key, data) {
                  AD.lang.label.translate(self.element);
               });
            },

            createArea: function(area) {
               // console.log(area);

               this.element.append(
                  can.view("OpsPortal_SubLinks_Area", { area: area })
               );

               this.areaLinks[area.key] = this.element.find(
                  '[area="' + area.key + '"]'
               );
            },

            createLink: function(tool) {
               if (!tool.attr) {
                  var Model = AD.Model.get("opsportal.navigation.OPConfigTool");
                  tool = new Model(tool);
               }

               if (tool.translate) tool.translate();

               var areaKey = tool.areas[0].key;
               var area = this.areaLinks[areaKey];
               if (area) {
                  area.append(
                     can.view("OpsPortal_SubLinks_Item", { tool: tool })
                  );
               }
            },

            removeArea: function(area) {
               // console.log(area);

               this.element.find('[area="' + area.key + '"]').remove();
               delete this.areaLinks[area.key];
            },

            removeLink: function(tool) {
               // console.log(area);

               this.element.find('[op-tool-id="' + tool.id + '"]').remove();
            },

            showArea: function(area) {
               for (var k in this.areaLinks) {
                  if (k == area.area) {
                     this.areaLinks[k].show();
                  } else {
                     this.areaLinks[k].hide();
                  }
               }
            },

            sortLinks: function() {
               this.element.find("ul").each(function(i, ul) {
                  $(ul)
                     .find("li")
                     .sort(function(a, b) {
                        return (
                           parseInt($(a).attr("data-weight")) -
                           parseInt($(b).attr("data-weight"))
                        );
                     })
                     .appendTo(ul);
               });
            },

            /**
             * @function updateToolLink
             *
             * update the currently shown tool's link to show it is the active tool.
             *
             * @param {obj} tool  the message packet from the 'opsportal.tool.show' queue.
             */
            updateToolLink: function(tool) {
               // get area for this tool
               var area = this.areaLinks[tool.area];
               if (area) {
                  // within area, find current active entry and remove it.
                  area.find("." + this.cssActive).removeClass(this.cssActive);

                  // within area, find link for current tool and add active class
                  // area.find('[op-tool="' + tool.tool + '"]').addClass(this.cssActive);
                  area
                     .find('[op-tool-id="' + tool.tool + '"]')
                     .addClass(this.cssActive);
               }
            },

            initDOM: function() {
               // this.element.html(can.view(this.options.templateDOM, {} ));

               // register template as :  'OpsPortal_SubLinks_Item'
               //  NOTE:  DON'T USE '.' as seperators here!!!  -> can.ejs thinks they are file names then... doh!
               var item = this.domToTemplate(this.element.find("ul"));

               // <li class="active"><a href="#" class="" role="button" obj-embed="tool">[[= tool.label ]]</a></li>
               // we now need to pull the 1st class reference out and use that for our active links class:
               this.cssActive =
                  $(item)
                     .first()
                     .attr("class") || "active"; // default currently

               // make sure our template item doesn't have the active class:
               item = item.replace(this.cssActive, "");
               can.view.ejs("OpsPortal_SubLinks_Item", item);

               // remove the template from the DOM
               this.element.find("ul").html(" ");

               // create the area template
               var area = this.domToTemplate(this.element);
               can.view.ejs("OpsPortal_SubLinks_Area", area);

               // empty my contents.
               this.element.html(" ");
            },

            //  When a menu item is clicked
            ".op-masthead-nav-link click": function($el, ev) {
               var tool = $el.data("tool");
               AD.comm.hub.publish("opsportal.tool.show", {
                  area: tool.areas[0].key,
                  tool: tool.id
               });
               ev.preventDefault();
            }
         });
      });
});
