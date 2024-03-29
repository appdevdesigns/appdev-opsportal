steal(
   // List your Controller's dependencies here:
   "OpsPortal/classes/OpsTool.js",
   "OpsPortal/classes/OpsForm.js",
   "OpsPortal/classes/OpsImage.js",
   "OpsPortal/classes/OpsDialog.js",
   "OpsPortal/classes/OpsWidget.js",
   "OpsPortal/controllers/MenuList.js",
   "OpsPortal/controllers/WorkArea.js",
   "OpsPortal/controllers/SubLinks.js",
   "OpsPortal/models/OPConfigArea.js",
   "OpsPortal/models/OPConfigTool.js",
   "OpsPortal/controllers/OPView.js",
   "OpsPortal/views/OpsPortal/OpsPortal.ejs",
   "OpsPortal/views/OpsPortal/taskList.ejs",
   "OpsPortal/portal-scratch.css",
   "OpsPortal/opsportal.css",
   "OpsPortal/opsportal-theme.css",
   "feedback/tpl.highlighter.ejs",
   "feedback/tpl.overview.ejs",
   "feedback/tpl.submitSuccess.ejs",
   "feedback/tpl.submitError.ejs",
   "countly-sdk-web/lib/countly.min",
   function() {
      System.import("appdev").then(function() {
         steal
            .import(
               "jquery",
               "appdev",
               "appdev/ad",
               "appdev/control/control",
               "appdev/comm/socket",
               "appdev/comm/service",
               "appdev/labels/lang"
               // ).then(
               // 'js/jquery.sidr.min.js',
               // ).then(
            )
            .then(function() {
               var ____op_loaded_controllers = [];
               function loadRequirements() {
                  // steal('opsportal/requirements.js'); // this returns the steal() for loading each OpsTool

                  return AD.comm.service
                     .get({
                        url: "/opsportal/requirements.js",
                        params: { ignore: ____op_loaded_controllers }
                     })
                     .fail(function(err) {
                        AD.error.log("Error loading requirements.", {
                           error: err
                        });
                        if (err.code && err.code == "E_NOTPERMITTED") {
                           AD.op.Dialog.Alert({
                              message:
                                 AD.lang.label.getLabel(
                                    "opp.errorNoPermission"
                                 ) ||
                                 "Contact an administrator to give you access to the site"
                           });
                        }
                     })
                     .then(function(data) {
                        data.listTools.forEach(function(tool) {
                           ____op_loaded_controllers.push(tool);
                           System.import("opstools/" + tool);
                        });
                        return data;
                     });
               }
               loadRequirements();

               System.import("opstools/UserProfile");

               // make sure $ is defined:
               var $ =
                  typeof window.jQuery == "undefined"
                     ? AD.ui.jQuery
                     : window.jQuery;

               // create our opstools namespace for our tools.
               if (typeof AD.controllers.opstools == "undefined")
                  AD.controllers.opstools = {};

               ////
               //// Dropzone patch
               ////
               //// photos taken by smartphones can actually be stored in
               //// landscape mode even if they are portraits.  the .jpg
               //// have extra EXIF data that tells the app to rotate them.
               ////
               //// Dropzone's icons do not normally rotate the image, so
               //// uploading a photo from a smart phone will look crooked.
               ////
               //// There is a patch to fix this:
               //// https://github.com/enyo/dropzone/issues/46
               ////
               //// but instead of manually patching the DZ.js and maintaining
               //// our own copy, I'm just going to fix the DZ library here.
               ////
               //// this way updating DZ in the future is a simple replacement
               //// of our /assets/js/dropzone/* files without having to remember
               //// to reapply the patch each time.
               ////
               if (typeof Dropzone !== "undefined") {
                  Dropzone.prototype.detectVerticalSquash = function(img) {
                     var alpha, canvas, ctx, data, ey, ih, py, ratio, sy;
                     // var iw = img.naturalWidth;
                     ih = img.naturalHeight;
                     canvas = document.createElement("canvas");
                     canvas.width = 1;
                     canvas.height = ih;
                     ctx = canvas.getContext("2d");
                     ctx.drawImage(img, 0, 0);
                     data = ctx.getImageData(0, 0, 1, ih).data;
                     sy = 0;
                     ey = ih;
                     py = ih;
                     while (py > sy) {
                        alpha = data[(py - 1) * 4 + 3];
                        if (alpha === 0) {
                           ey = py;
                        } else {
                           sy = py;
                        }
                        py = (ey + sy) >> 1;
                     }
                     ratio = py / ih;
                     if (ratio === 0) {
                        return 1;
                     } else {
                        return ratio;
                     }
                  };

                  Dropzone.prototype.drawImageIOSFix = function(
                     ctx,
                     img,
                     sx,
                     sy,
                     sw,
                     sh,
                     dx,
                     dy,
                     dw,
                     dh,
                     orientation,
                     flip
                  ) {
                     var vertSquashRatio;
                     vertSquashRatio = this.detectVerticalSquash(img);
                     dh = dh / vertSquashRatio;
                     ctx.translate(dx + dw / 2, dy + dh / 2);
                     if (flip) ctx.scale(-1, 1);
                     ctx.rotate((-orientation * Math.PI) / 180);
                     dx = -dw / 2;
                     dy = -dh / 2;
                     return ctx.drawImage(
                        img,
                        sx,
                        sy,
                        sw,
                        sh,
                        dx,
                        dy,
                        dw,
                        dh / vertSquashRatio
                     );
                  };

                  Dropzone.prototype.createThumbnailFromUrl = function(
                     file,
                     imageUrl,
                     callback,
                     crossOrigin
                  ) {
                     var img;
                     img = document.createElement("img");
                     if (crossOrigin) {
                        img.crossOrigin = crossOrigin;
                     }
                     img.onload = (function(_this) {
                        return function() {
                           var orientation = 0;
                           var flip = false;
                           if (typeof EXIF != "undefined")
                              EXIF.getData(img, function() {
                                 switch (
                                    parseInt(EXIF.getTag(this, "Orientation"))
                                 ) {
                                    case 2:
                                       flip = true;
                                       break;
                                    case 3:
                                       orientation = 180;
                                       break;
                                    case 4:
                                       orientation = 180;
                                       flip = true;
                                       break;
                                    case 5:
                                       orientation = 270;
                                       flip = true;
                                       break;
                                    case 6:
                                       orientation = 270;
                                       break;
                                    case 7:
                                       orientation = 90;
                                       flip = true;
                                       break;
                                    case 8:
                                       orientation = 90;
                                       break;
                                 }
                              });
                           var canvas,
                              ctx,
                              resizeInfo,
                              thumbnail,
                              _ref,
                              _ref1,
                              _ref2,
                              _ref3;
                           file.width = img.width;
                           file.height = img.height;
                           resizeInfo = _this.options.resize.call(_this, file);
                           if (resizeInfo.trgWidth == null) {
                              resizeInfo.trgWidth = resizeInfo.optWidth;
                           }
                           if (resizeInfo.trgHeight == null) {
                              resizeInfo.trgHeight = resizeInfo.optHeight;
                           }
                           canvas = document.createElement("canvas");
                           ctx = canvas.getContext("2d");
                           canvas.width = resizeInfo.trgWidth;
                           canvas.height = resizeInfo.trgHeight;
                           _this.drawImageIOSFix(
                              ctx,
                              img,
                              (_ref = resizeInfo.srcX) != null ? _ref : 0,
                              (_ref1 = resizeInfo.srcY) != null ? _ref1 : 0,
                              resizeInfo.srcWidth,
                              resizeInfo.srcHeight,
                              (_ref2 = resizeInfo.trgX) != null ? _ref2 : 0,
                              (_ref3 = resizeInfo.trgY) != null ? _ref3 : 0,
                              resizeInfo.trgWidth,
                              resizeInfo.trgHeight,
                              orientation,
                              flip
                           );
                           thumbnail = canvas.toDataURL("image/png");
                           _this.emit("thumbnail", file, thumbnail);
                           if (callback != null) {
                              return callback();
                           }
                        };
                     })(this);
                     if (callback != null) {
                        img.onerror = callback;
                     }
                     return (img.src = imageUrl);
                  };
               }

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
               AD.Control.extend("OpsPortal.OpsPortal", {
                  init: function(element, options) {
                     var self = this;
                     this.options = AD.defaults(
                        {
                           "appdev-opsportal": "default", // which configuration to load
                           "portal-autoenter": false, // auto enter the opsportal
                           "portal-theme": "", // no additional theme to load.
                           templateDOM:
                              "/OpsPortal/views/OpsPortal/OpsPortal.ejs",
                           templateList:
                              "/OpsPortal/views/OpsPortal/taskList.ejs",
                           templateError: "/OpsPortal/views/OpsPortal/error.ejs"
                        },
                        options
                     );

                     this.hiddenElements = []; // used to track which elements we have hidden

                     this.data = {};
                     this.data.listAreas = null;
                     this.data.lastConfig = null; // the last opsportal/config received
                     this.data.loadedControllers = []; // the list of controllers already loaded.
                     this.data.updateInProgress = false; // is there a current config update in progress?

                     this.elOptions(); // search the attached element for config options.

                     // this.initDOM();                     // embedded list view
                     this.dfdPortalReady = AD.sal.Deferred();
                     this.initPortal(); // popup portal view

                     // update loading progress for OpsPortal:
                     AD.ui.loading.reset();
                     AD.ui.loading.text(
                        AD.lang.label.getLabel("opp.configuringTools")
                     );
                     AD.ui.loading.resources(2); // kicks off a new refresh of the bar

                     // if we receive a notification that our OPNavEdit tool is loaded, then
                     // make sure it is installed.
                     AD.comm.hub.subscribe(
                        "opsportal.admin.opnavedit",
                        function(/* key, data */) {
                           self.installOPNavEdit();
                        }
                     );

                     this.loadNavData().then(function() {
                        self.requestConfiguration();
                     });

                     // make sure we resize our display to the document/window
                     var sizeContent = function() {
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
                     AD.comm.hub.subscribe(
                        "opsportal.area.show",
                        function(/* key, data */) {
                           setTimeout(sizeContent, 4);
                        }
                     );

                     //
                     // If the OpsPortal Navigation data has changed, we will attempt
                     // to reload our Navigation data and update our display.
                     //
                     // If any of our OPNavEdit data is changed, the server will
                     // socket.blast('opsportal.nav.stale'), so we listen for that
                     // and then request another OpsPortal configuration.
                     //
                     AD.comm.socket.subscribe(
                        "opsportal_navigation_stale",
                        function(/* key, data */) {
                           // io.socket.on('opsportal_navigation_stale', function(data){

                           self.updateConfiguration();
                        }
                     );

                     //
                     // Initialize Webix to send our .csrf token with it's AJAX requests
                     //
                     AD.comm.csrf().then(function(token) {
                        webix.attachEvent("onBeforeAjax", function(
                           mode,
                           url,
                           data,
                           request,
                           headers
                           /* , files, promise */
                        ) {
                           headers["X-CSRF-Token"] = token;
                        });
                     });
                  },

                  createArea: function(newArea, cb) {
                     var _this = this;

                     // the step to actually create the Area
                     function doAdd() {
                        _this.menu.createArea(newArea);
                        _this.subLinks.createArea(newArea);
                        _this.workArea.createArea(newArea);

                        if (cb) cb();
                     }

                     // first make sure the newArea already exists in
                     // the definitions we loaded from the server:
                     var isFound = false;
                     this.data.listAreas.forEach(function(area) {
                        if (area.key == newArea.key) {
                           isFound = true;
                        }
                     });

                     // if it is already there, then just add it.
                     if (isFound) {
                        doAdd();
                     } else {
                        // else, gotta look up the new Area
                        var OPConfigArea = AD.Model.get(
                           "opsportal.navigation.OPConfigArea"
                        );
                        OPConfigArea.findAll({ key: newArea.key })
                           .fail(function(err) {
                              AD.error.log(
                                 "Error finding new OPConfigArea by key.",
                                 { error: err, key: newArea.key }
                              );
                              if (cb) cb(err);
                           })
                           .then(function(list) {
                              list.forEach(function(l) {
                                 if (l.translate) l.translate();
                                 _this.data.listAreas.push(l);
                              });
                              doAdd();
                           });
                     }
                  },

                  /**
                   * Step through each of our sub systems to create a Tool:
                   *
                   * @return {nil} no return value
                   */
                  createTool: function(newTool) {
                     // newTool.uuid = 'tool'+AD.util.uuid();
                     this.subLinks.createLink(newTool);
                     this.workArea.createTool(newTool);
                  },

                  /**
                   * search the base element attributes for configuration options.
                   *
                   * @return {nil} no return value
                   */
                  elOptions: function() {
                     var _this = this;

                     var params = [
                        "appdev-opsportal",
                        "portal-autoenter",
                        "portal-theme"
                     ];
                     params.forEach(function(key) {
                        var val = _this.element.attr(key);
                        if (typeof val !== "undefined") {
                           val = val.toLowerCase();
                           if (val == "false") {
                              val = false;
                           }
                           if (val == "true") {
                              val = true;
                           }

                           // only set the value if it wasn't an empty string.
                           if (val != "") {
                              _this.options[key] = val;
                           }
                        }
                     });
                  },

                  initDOM: function() {
                     this.element.html(can.view(this.options.templateList, {}));

                     //// TODO: determine size of el
                     //// TODO: if large enough, display .list-content
                     //// TODO: create 'bootstrap' routine to insert resources into web page

                     //// FEATURE: Notifications : create mechanism for opstools to indicate how many tasks/todo's they want to register
                     //// FEATURE: SubMenu's : display additional tools in an area using SubMenu's

                     //            this.element.find('.opsportal-menu-trigger').sidr({name:'opsportal-menu-widget',side:'left'});
                  },

                  initDOMError: function(errMsg) {
                     this.element.html(
                        can.view(this.options.templateError, {
                           errorMessage: errMsg
                        })
                     );
                     AD.lang.label.translate(this.element);
                  },

                  // this is the popup Ops Portal that takes over the page:
                  initPortal: function() {
                     this.portalPopup = AD.ui.jQuery(
                        '<div class="op-portal-popup">'
                     );
                     this.portalPopup.hide();
                     this.portalPopup.html(
                        can.view(this.options.templateDOM, {
                           baseURL: AD.config.getValue("siteBaseURL") || ""
                        })
                     );

                     this.menu = new AD.controllers.OpsPortal.MenuList(
                        this.portalPopup.find(".op-menu-widget")
                     );
                     this.workArea = new AD.controllers.OpsPortal.WorkArea(
                        this.portalPopup.find(".op-stage")
                     );
                     //            this.portalPopup.find('.opsportal-menu-trigger').sidr({name:'op-menu-widget',side:'left'});

                     var SubLinks = AD.Control.get("OpsPortal.SubLinks");
                     //this.subLinks = new SubLinks(this.portalPopup.find('.opsportal-nav-sub-list'));
                     this.subLinks = new SubLinks(
                        this.portalPopup.find("#op-masthead-sublinks")
                     );
                     this.dom = {};
                     this.dom.resize = {};
                     //this.dom.resize.masthead = this.portalPopup.find(".opsportal-container-masthead");
                     this.dom.resize.masthead = this.portalPopup.find(
                        ".op-masthead"
                     );
                     AD.ui.jQuery("body").append(this.portalPopup);

                     AD.lang.label.translate(this.portalPopup); // translate the current OpsPortal Labels

                     $("#userprofile-menuitem").on("click", function(ev) {
                        ev.preventDefault();
                        AD.comm.hub.publish("opsportal.area.show", {
                           area: "UserProfile"
                        });
                     });

                     ///
                     /// User Inbox
                     ///
                     $("#user-options-inbox").on("click", function(/* ev */) {
                        $$("inbox").show();
                        $$("inbox_accordion").resizeChildren();
                     });

                     var accordion = {
                        header: "replaceme",
                        id: "replaceme",
                        view: "accordionitem",
                        css: "stayCollapsed",
                        hidden: true,
                        body: {
                           view: "unitlist",
                           id: "replaceme",
                           uniteBy: "#uniteLabel#",
                           autoheight: true,
                           css: "inbox_unitlist",
                           type: {
                              templateHeader: function(value) {
                                 return (
                                    '<i style="opacity: 0.4" class="fa fa-fw fa-code-fork fa-rotate-90"></i> ' +
                                    value.replace(/{(.*?)}/, "")
                                 );
                              },
                              headerHeight: 24
                           },
                           template: function(obj) {
                              return (
                                 obj.name +
                                 " <span class='pull-right webix_badge'>" +
                                 obj.items.length +
                                 "</span>"
                              );
                           },
                           select: true,
                           data: [],
                           click: function(id /* , ev */) {
                              var list = this;
                              var parent = this.getParentView();
                              var selectedItem = this.getItem(id);

                              var cells = [];
                              var count = selectedItem.items.length;
                              // var number = 1;
                              selectedItem.items.forEach(function(task) {
                                 cells.push({
                                    id: "task-holder-" + task.uuid,
                                    unitlist: list,
                                    view: "layout",
                                    padding: 20,
                                    rows: [
                                       {
                                          id: task.uuid,
                                          view: "formiopreview",
                                          formComponents: task.ui,
                                          formData: task.data,
                                          onButton: function(value) {
                                             var url =
                                                "/process/inbox/" + task.uuid;
                                             AD.comm.service
                                                .post({
                                                   url: url,
                                                   data: {
                                                      response: value
                                                   }
                                                })
                                                .fail(function(err) {
                                                   if (err && err.message) {
                                                      webix.message(
                                                         err.message
                                                      );
                                                   }
                                                   console.error(
                                                      "::: error loading /process/inbox ",
                                                      err
                                                   );
                                                })
                                                .done(function(/* data */) {
                                                   // find out how many pages are in this multiview
                                                   var views = $$(
                                                      "taskMultiview"
                                                   ).getChildViews();
                                                   // if there is more than one page we need to find out what the next page should be
                                                   if (views.length > 1) {
                                                      // find out if we are on the last page
                                                      if (
                                                         $$(
                                                            "taskMultiview"
                                                         ).index(
                                                            $$(
                                                               "task-holder-" +
                                                                  task.uuid
                                                            )
                                                         ) +
                                                            1 ==
                                                         views.length
                                                      ) {
                                                         // if we are on the last page we will go back to the previous page
                                                         $$(
                                                            "taskMultiview"
                                                         ).setValue(
                                                            views[
                                                               $$(
                                                                  "taskMultiview"
                                                               ).index(
                                                                  $$(
                                                                     "task-holder-" +
                                                                        task.uuid
                                                                  )
                                                               ) - 1
                                                            ].config.id
                                                         );
                                                      } else {
                                                         // if we are not on the last page we will go to the next page
                                                         $$(
                                                            "taskMultiview"
                                                         ).setValue(
                                                            views[
                                                               $$(
                                                                  "taskMultiview"
                                                               ).index(
                                                                  $$(
                                                                     "task-holder-" +
                                                                        task.uuid
                                                                  )
                                                               ) + 1
                                                            ].config.id
                                                         );
                                                      }
                                                      // once we move off of the page we can remove it
                                                      $$(
                                                         "taskMultiview"
                                                      ).removeView(
                                                         views[
                                                            $$(
                                                               "taskMultiview"
                                                            ).index(
                                                               $$(
                                                                  "task-holder-" +
                                                                     task.uuid
                                                               )
                                                            )
                                                         ]
                                                      );
                                                      // decrease the global inbox count
                                                      inboxBadge(-1);
                                                      // prune the item from the group of similar processes in the unit list
                                                      selectedItem.items = selectedItem.items.filter(
                                                         function(i) {
                                                            return (
                                                               i.uuid !=
                                                               task.uuid
                                                            );
                                                         }
                                                      );
                                                      // refresh the unit list so we can get an update badge count
                                                      list.refresh();

                                                      // now we update the pager
                                                      // block events because we don't want it telling the multiview to change pages after we set the new value
                                                      $$(
                                                         "taskPager"
                                                      ).blockEvent();
                                                      // set the page to the first while we rebuild the pager (or it will throw an error)
                                                      $$("taskPager").select(0);
                                                      // set the current number of pages to the number of views in the multiview
                                                      $$("taskPager").define(
                                                         "count",
                                                         $$(
                                                            "taskMultiview"
                                                         ).getChildViews()
                                                            .length
                                                      );
                                                      $$("taskPager").refresh();
                                                      // set the page to the correct number because it probably changed when we removed a view above
                                                      $$("taskPager").select(
                                                         $$(
                                                            "taskMultiview"
                                                         ).index(
                                                            $$(
                                                               "taskMultiview"
                                                            ).getActiveId()
                                                         )
                                                      );
                                                      $$(
                                                         "taskPager"
                                                      ).unblockEvent();
                                                   } else {
                                                      // no more tasks hide the modal
                                                      $$("taskWindow").hide();
                                                      // remove the item from the unit list
                                                      list.remove(
                                                         list.getSelectedId()
                                                      );
                                                      // if that was the last item in the unit list remove the accordion
                                                      if (list.count() == 0) {
                                                         parent.hide();
                                                      }
                                                      // decrease the global inbox count
                                                      inboxBadge(-1);
                                                   }
                                                });
                                          }
                                       }
                                    ]
                                 });
                              });
                              webix.ui(
                                 {
                                    id: "taskMultiview",
                                    cells: cells
                                 },
                                 $$("taskMultiview")
                              );

                              $$("taskTitle").define(
                                 "label",
                                 selectedItem.name
                              );
                              $$("taskPager").define("count", count);
                              $$("taskPager").refresh();
                              $$("taskWindow").show();
                           }
                        }
                     };

                     webix.ui({
                        id: "inbox",
                        view: "window",
                        head: {
                           view: "toolbar",
                           css: "webix_dark inbox_drawer",
                           cols: [
                              { width: 7 },
                              {
                                 view: "label",
                                 label: "Inbox"
                              },
                              {
                                 view: "button",
                                 autowidth: true,
                                 type: "icon",
                                 icon: "nomargin fa fa-times",
                                 click: function() {
                                    $$("inbox").hide();
                                 }
                              }
                           ]
                        },
                        position: function(state) {
                           state.left = state.maxWidth - 350; // fixed values
                           state.top = 0;
                           state.width = 350; // relative values
                           state.height = state.maxHeight;
                        },
                        body: {
                           cells: [
                              {
                                 id: "inboxItems",
                                 view: "scrollview",
                                 scroll: "y",
                                 body: {
                                    view: "accordion",
                                    id: "inbox_accordion",
                                    css: {
                                       background: "#dadee0 !important"
                                    },
                                    multi: true,
                                    rows: []
                                 }
                              },
                              {
                                 id: "emptyInbox",
                                 view: "layout",
                                 hidden: true,
                                 css: {
                                    background: "#dadee0 !important"
                                 },
                                 rows: [
                                    {},
                                    {
                                       view: "label",
                                       align: "center",
                                       height: 200,
                                       label:
                                          "<div style='display: block; font-size: 180px; background-color: #666; color: transparent; text-shadow: 0px 1px 1px rgba(255,255,255,0.5); -webkit-background-clip: text; -moz-background-clip: text; background-clip: text;' class='fa fa-thumbs-up'></div>"
                                    },
                                    {
                                       view: "label",
                                       align: "center",
                                       label: "No tasks...you're all caught up."
                                    },
                                    {}
                                 ]
                              }
                           ]
                        }
                     });

                     webix.ui({
                        id: "taskWindow",
                        view: "window",
                        position: function(state) {
                           state.left = state.maxWidth / 2 - 400 / 2; // fixed values
                           state.top =
                              state.maxHeight / 2 - (state.maxHeight * 0.7) / 2;
                           state.width = 400; // relative values
                           state.height = state.maxHeight * 0.7;
                        },
                        modal: true,
                        head: {
                           view: "toolbar",
                           css: "webix_dark",
                           cols: [
                              { width: 17 },
                              {
                                 id: "taskTitle",
                                 view: "label",
                                 label: "Your Tasks"
                              },
                              {
                                 view: "button",
                                 autowidth: true,
                                 type: "icon",
                                 icon: "nomargin fa fa-times",
                                 click: function() {
                                    $$("taskWindow").hide();
                                    // we don't want the list to look like it has still selected the item
                                    $$("taskMultiview")
                                       .getChildViews()[0]
                                       .config.unitlist.unselectAll();
                                    // reset the pager so we don't get errors when we open it next
                                    $$("taskPager").select(0);
                                 }
                              }
                           ]
                        },
                        body: {
                           rows: [
                              {
                                 view: "scrollview",
                                 scroll: "y",
                                 body: {
                                    id: "taskMultiview",
                                    cells: [
                                       {
                                          view: "layout",
                                          padding: 20,
                                          rows: [
                                             {
                                                id: "emptyTasks",
                                                template:
                                                   "No more tasks...good job!"
                                             }
                                          ]
                                       }
                                    ]
                                 }
                              },
                              {
                                 view: "toolbar",
                                 css: "inboxpager",
                                 cols: [
                                    {
                                       id: "taskPager",
                                       view: "pager",
                                       size: 1,
                                       group: 3,
                                       height: 45,
                                       master: false,
                                       template:
                                          '<div style="margin-top:9px; text-align: center;">{common.first()} {common.prev()} {common.pages()} {common.next()} {common.last()}</div>',
                                       on: {
                                          onBeforePageChange: function(
                                             new_page /* ,
                                             old_page
                                             */
                                          ) {
                                             var views = $$(
                                                "taskMultiview"
                                             ).getChildViews();
                                             views[parseInt(new_page)].show();
                                          }
                                       }
                                    }
                                 ]
                              }
                           ]
                        }
                     });

                     var getInbox = function() {
                        var processLookupHash = {
                           /* process.id : "Process Label" */
                        };
                        var appLookupHash = {
                           /* app.id : "App Label" */
                        };

                        // make sure all app info is available for inbox
                        ABApplication.applicationInfo();

                        // when app defs are loaded isReady is fired
                        ABApplication.isReady()
                           // .then(()=>{
                           //     return ABApplication.allApplications().then((list)=>{
                           //     var allGets = [];

                           //     var id = list.getFirstId();
                           //     while(id) {
                           //         var entry = list.getItem(id);
                           //         allGets.push(ABApplication.get(entry.id));
                           //         id = list.getNextId(id);
                           //     }

                           //     return Promise.all(allGets);
                           // })
                           .then(function() {
                              return ABApplication.allCurrentApplications()
                                 .then(function(dcList) {
                                    var allApps = [];

                                    var id = dcList.getFirstId();
                                    while (id) {
                                       var entry = dcList.getItem(id);
                                       allApps.push(entry);
                                       id = dcList.getNextId(id);
                                    }

                                    allApps.forEach(function(app) {
                                       var appAccordion = _.cloneDeep(
                                          accordion
                                       );
                                       appAccordion.header = app.label;
                                       appAccordion.id =
                                          "inbox-accordion-app-holder-" +
                                          app.id;
                                       appAccordion.body.id =
                                          "inbox-accordion-app-" + app.id;
                                       $$("inbox_accordion").addView(
                                          appAccordion
                                       );
                                       app.processes().forEach(function(p) {
                                          processLookupHash[p.id] = p.label;
                                          appLookupHash[p.id] = app.id;
                                       });
                                    });
                                 })
                                 .then(function() {
                                    // then call
                                    OP.Comm.Service.get({
                                       url: "/process/inbox"
                                    })
                                       .catch(function(err) {
                                          if (err && err.message) {
                                             webix.message(err.message);
                                          }
                                          console.error(
                                             "::: error loading /process/inbox ",
                                             err
                                          );
                                       })
                                       .then(function(data) {
                                          // ensure proper data format is returned.
                                          data = data || [];

                                          // console.log("/process/inbox: ", data);
                                          var appAccordionLists = {};
                                          data.forEach(function(item) {
                                             item.uniteLabel =
                                                "{" +
                                                item.definition +
                                                "}" +
                                                processLookupHash[
                                                   item.definition
                                                ];
                                             var appId =
                                                appLookupHash[item.definition];
                                             if (!appAccordionLists[appId])
                                                appAccordionLists[appId] = {};
                                             if (
                                                !appAccordionLists[appId][
                                                   item.definition
                                                ]
                                             ) {
                                                appAccordionLists[appId][
                                                   item.definition
                                                ] = {
                                                   id: item.definition,
                                                   name: item.name,
                                                   uniteLabel: item.uniteLabel,
                                                   items: []
                                                };
                                             }

                                             appAccordionLists[appId][
                                                item.definition
                                             ].items.push(item);
                                          });

                                          for (var index in appAccordionLists) {
                                             var processes = [];
                                             for (var process in appAccordionLists[
                                                index
                                             ]) {
                                                processes.push(
                                                   appAccordionLists[index][
                                                      process
                                                   ]
                                                );
                                             }

                                             var accordion = $$(
                                                "inbox-accordion-app-" + index
                                             );
                                             if (accordion) {
                                                accordion.parse(processes);
                                                accordion.show();
                                             } else {
                                                console.error(
                                                   "could not find an inbox-accordion for index[" +
                                                      index +
                                                      "]"
                                                );
                                             }
                                          }

                                          // $$("inbox-list").parse(data);
                                          inboxBadge(data.length);
                                       });
                                 });
                           }); // isReady().then()
                     };

                     function check() {
                        if (!window.ABApplication) {
                           setTimeout(check, 50);
                        } else {
                           getInbox();
                        }
                     }

                     check();

                     function inboxBadge(number) {
                        if (number == -1) {
                           number =
                              parseInt($("#user-options-inbox-badge").html()) -
                              1;
                        }
                        $("#user-options-inbox-badge").html(
                           number > 0 ? number : ""
                        );
                        if (number < 1) {
                           $("#user-options-inbox-badge").hide();
                           $$("emptyInbox").show(false, false);
                        } else {
                           $("#user-options-inbox-badge").show();
                           $$("inboxItems").show(false, false);
                        }
                     }

                     ////
                     //// Switcheroo Features
                     ////
                     $("#switcheroo").on("click", function(ev) {
                        ev.preventDefault();
                        $$("switcheroopopup").show();
                     });

                     function reloadSwitcheroo() {
                        var uri = window.location.href;
                        var parts = uri.split("?");
                        window.location.replace(
                           parts[0] + "?switcheroo=" + AD.util.uuid()
                        );
                     }
                     webix
                        .ui({
                           view: "popup",
                           modal: true,
                           id: "switcheroopopup",
                           position: "center",
                           body: {
                              rows: [
                                 {
                                    id: "switcherooCurrent",
                                    rows: [
                                       {
                                          cols: [
                                             {
                                                id: "switcherooCurrentLabel",
                                                view: "label",
                                                label: ""
                                             },
                                             {
                                                view: "button",
                                                type: "icon",
                                                icon: "fa fa-fw fa-trash",
                                                css: "webix_danger",
                                                width: 30,
                                                click: function() {
                                                   AD.comm.service
                                                      .delete({
                                                         url: "/site/switcheroo"
                                                      })
                                                      .then(function() {
                                                         reloadSwitcheroo();
                                                      });
                                                }
                                             }
                                          ]
                                       }
                                    ]
                                 },
                                 {
                                    view: "label",
                                    label: "Enter an account"
                                 },
                                 {
                                    id: "switcherooAccount",
                                    view: "text",
                                    value: "",
                                    placeholder: "UserID here"
                                 },
                                 {
                                    cols: [
                                       {
                                          view: "button",
                                          value: "Cancel",
                                          click: function() {
                                             $$("switcheroopopup").hide();
                                          }
                                       },
                                       {
                                          view: "button",
                                          value: "Switch",
                                          css: "webix_primary",
                                          click: function() {
                                             var account = $$(
                                                "switcherooAccount"
                                             ).getValue();

                                             AD.comm.service
                                                .post({
                                                   url: "/site/switcheroo",
                                                   params: {
                                                      account: account
                                                   }
                                                })
                                                .then(function() {
                                                   reloadSwitcheroo();
                                                })
                                                .fail(function(/* err */) {
                                                   AD.op.Dialog.Alert({
                                                      text:
                                                         "Error trying to switcheroo. Verify you have permissions to access switcheroo."
                                                   });
                                                });
                                          }
                                       }
                                    ]
                                 }
                              ]
                           }
                        })
                        .hide();

                     // find out if we have a current Switcheroo in place
                     // get /site/switcheroo  will return a { from:'username', to:'username' }
                     AD.comm.service
                        .get({
                           url: "/site/switcheroo"
                        })
                        .fail(function(err) {
                           if (err && err.message) {
                              webix.message(err.message);
                           }
                           console.error(
                              "::: error loading /site/switcheroo ",
                              err
                           );
                        })
                        .done(function(data) {
                           if (data.from) {
                              $$("switcherooCurrent").show();
                              $$("switcherooCurrentLabel").setValue(
                                 "" + data.from + " -> " + data.to
                              );
                           } else {
                              $$("switcherooCurrent").hide();
                           }
                        });

                     this.dfdPortalReady.resolve();
                  },

                  initFeedback: function() {
                     var labels = {
                        t: function(key) {
                           return AD.lang.label.getLabel(key) || key;
                        }
                     };
                     var templates = {
                        highlighter: can.view(
                           "/feedback/tpl.highlighter.ejs",
                           labels
                        ),
                        overview: can.view(
                           "/feedback/tpl.overview.ejs",
                           labels
                        ),
                        submitSuccess: can.view(
                           "/feedback/tpl.submitSuccess.ejs",
                           labels
                        ),
                        submitError: can.view(
                           "/feedback/tpl.submitError.ejs",
                           labels
                        )
                     };
                     for (var key in templates) {
                        // can.view produces a document fragment. We need it to be a
                        // plaintext string.
                        templates[key] = templates[key].firstChild.innerHTML;
                     }

                     var baseURL = AD.config.getValue("siteBaseURL") || "";

                     $.feedback({
                        ajaxURL: baseURL + "/opsportal/feedback",
                        html2canvasURL:
                           baseURL + "/feedback/html2canvas.min.js",
                        postHTML: false,
                        tpl: templates,
                        initButtonText: labels.t("Feedback")
                     });
                  },

                  initCountly: function() {
                     Countly.init({
                        app_key: this.countly.app_key,
                        url: this.countly.url
                     });

                     AD.config.whenReady().then(function() {
                        var user = AD.config.getValue("user");
                        if (user) {
                           Countly.user_details({
                              name: user.username,
                              username: user.username,
                              email: user.email,
                              custom: {
                                 guid: user.guid
                              }
                           });
                        }
                     });

                     Countly.track_sessions();
                     Countly.track_pageview();
                     Countly.track_links();
                     Countly.track_errors();
                  },

                  // Special Case 2: OPNavEdit
                  // the /requirements will return the OPNavEdit tool to
                  // be loaded.
                  // After it is loaded, then it will emit an 'opsportal.admin.opnavedit' event
                  // we will listen for that event and install the OPNavEdit controller ontop of our .element
                  installOPNavEdit: function() {
                     var _this = this;

                     this.dfdPortalReady.then(function() {
                        var OPNavEditController = AD.Control.OpsTool.get(
                           "OPNavEdit"
                        );
                        new OPNavEditController(_this.portalPopup, {});
                     });
                  },

                  loadNavData: function() {
                     var dfd = AD.sal.Deferred();
                     var _this = this;

                     var OPConfigArea = AD.Model.get(
                        "opsportal.navigation.OPConfigArea"
                     );
                     OPConfigArea.findAll()
                        .fail(function(err) {
                           dfd.reject(err);
                        })
                        .then(function(list) {
                           list.forEach(function(l) {
                              if (l.translate) l.translate();
                           });
                           _this.data.listAreas = list;
                           _this.menu.loadAreas(list);

                           dfd.resolve(list);
                        });
                     return dfd;
                  },

                  portalDisplay: function() {
                     var self = this;
                     this.hiddenElements = [];

                     // take all the body.children  && hide them.
                     $("body")
                        .children()
                        .each(function(/* indx */) {
                           var $el = $(this);
                           if ($el != self.portalPopup) {
                              $el.hide();
                              self.hiddenElements.push($el);
                           }
                        });

                     // Now show our Portal:
                     this.portalPopup.show();

                     // Add the Feedback widget
                     if (this.isFeedbackEnabled) {
                        this.initFeedback();
                     }
                     if (this.countly) {
                        this.initCountly();
                     }

                     this.resize();
                  },

                  portalHide: function() {
                     // var self = this;
                     this.hiddenElements.forEach(function($el) {
                        $el.show();
                     });

                     // Now hide our Portal:
                     this.portalPopup.hide();
                  },

                  /**
                   * Step through each of our sub systems to remove an Area
                   *
                   * @return {nil} no return value
                   */
                  removeArea: function(oldArea) {
                     this.menu.removeArea(oldArea);
                     this.subLinks.removeArea(oldArea);
                     this.workArea.removeArea(oldArea);
                  },

                  /**
                   * Step through each of our sub systems to remove a Tool
                   *
                   * @return {nil} no return value
                   */
                  removeTool: function(oldTool) {
                     this.subLinks.removeLink(oldTool);
                     this.workArea.removeTool(oldTool);
                  },

                  resize: function() {
                     // The size we report to our Tools is window.height - masthead.height
                     var hWindow = $(window).height();
                     var hMasthead = this.dom.resize.masthead.outerHeight(true);
                     //console.log(
                     //   "//// resize: window.height:" +
                     //      hWindow +
                     //      " masthead.outer:" +
                     //      hMasthead
                     //);
                     var newHeight = hWindow - hMasthead; //this.portalPopup.find(".opsportal-container-masthead").outerHeight(true);

                     // notify of a resize action.
                     // -1px to ensure sub tools don't cause page scrolling.
                     AD.comm.hub.publish("opsportal.resize", {
                        height: newHeight - 1
                     });
                  },

                  requestConfiguration: function() {
                     // var self = this;
                     var _this = this;

                     // //// For debugging:
                     // AD.comm.hub.subscribe('**', function(key, data){
                     //     console.log('pub:'+key);
                     //     console.log(data);
                     // });

                     AD.ui.loading.completed(1);

                     AD.comm.service.get({ url: "/opsportal/config" }, function(
                        err,
                        data
                     ) {
                        _this.data.lastConfig = data;

                        _this.isFeedbackEnabled = data.feedback || false;
                        _this.countly = data.countly || false;

                        AD.ui.loading.completed(1); // just to show we have loaded the config.
                        if (err) {
                           // what to do here?
                           var label =
                              AD.lang.label.getLabel("opp.errorNoPermission") ||
                              " You don't have permission.  Ask your administrator to grant you access. ";
                           _this.initDOMError(label);
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
                              var newArea = data.areas[a];
                              if (a == 0) {
                                 newArea.isDefault = true;
                              }
                              _this.createArea(newArea);

                              if (newArea.isDefault) {
                                 defaultArea = newArea;
                              }
                              AD.ui.loading.completed(1);
                           }
                           _this.menu.sortAreas();

                           var defaultTool = {};

                           // assign 1st tool as our default to show
                           if (data.tools[0])
                              defaultTool[data.tools[0].areas[0].key] =
                                 data.tools[0];

                           // create each tool
                           for (var t1 = 0; t1 < data.tools.length; t1++) {
                              var newTool = data.tools[t1];

                              _this.data.loadedControllers.push(
                                 newTool.controller
                              );

                              _this.createTool(newTool);

                              // if we don't have a default for this tool's area => choose this tool
                              if (!defaultTool[newTool.areas[0].key]) {
                                 defaultTool[newTool.areas[0].key] = newTool;
                              }

                              // if this tool is defined as the default, then register it.
                              if (newTool.isDefault)
                                 defaultTool[newTool.areas[0].key] = newTool;

                              AD.ui.loading.completed(1);
                           }
                           _this.subLinks.sortLinks();

                           // Create the User Profile tool
                           // (special case which is accessible for all
                           //  users and has no top-left menu item)
                           setTimeout(function() {
                              _this.workArea.createArea({
                                 icon: "fa-cogs",
                                 key: "UserProfile",
                                 label: "User Profile",
                                 isDefault: false
                              });
                              _this.workArea.listAreas.UserProfile.createTool({
                                 id: "UserProfile",
                                 area: "UserProfile",
                                 controller: "UserProfile",
                                 label: "User Profile",
                                 isDefault: true
                              });
                              _this.workArea.listAreas.UserProfile.element.hide();
                              AD.comm.hub.publish("opsportal.tool.show", {
                                 area: "UserProfile",
                                 tool: "UserProfile"
                              });
                           }, 50);

                           //// all tools should be created now

                           // make sure they all have resize()ed
                           _this.resize();

                           // notify of our default Area:
                           // there can be only 1 ...
                           AD.comm.hub.publish("opsportal.area.show", {
                              area: defaultArea.key
                           });

                           // now notify all our default tools
                           for (var t in defaultTool) {
                              AD.comm.hub.publish("opsportal.tool.show", {
                                 area: defaultTool[t].areas[0].key,
                                 tool: defaultTool[t].id // controller
                              });
                           }

                           // once everything is created, tell the menu slider to attach itself
                           var link = _this.portalPopup.find(
                              "#op-masthead-menu a:first-of-type"
                           );
                           link.sidr({
                              name: "op-menu-widget",
                              side: "left"
                           });
                           link.on("click", function() {
                              AD.ui.jQuery.sidr("toggle", "op-menu-widget");
                           });

                           // now show the Link to open the OpsPortal
                           _this.initDOM();

                           AD.lang.label.translate(_this.element); // translate the OpsPortal task list

                           // wait for all tools to finish loading
                           _this.workArea
                              .ready()
                              .fail(function(err) {
                                 AD.error.log(
                                    "... workArea.ready()  failed!",
                                    err
                                 );
                              })
                              .then(function() {
                                 // notify everyone the opsportal is finished creating the Tools.
                                 AD.comm.hub.publish("opsportal.ready", {});

                                 // wait for all tools to be loaded before
                                 // loading any portal-theme, so this one has final
                                 // say!
                                 if (_this.options["portal-theme"] != "") {
                                    var theme =
                                       _this.options["portal-theme"] + ".css";
                                    steal(theme);
                                 }

                                 // if our auto open setting is set, then
                                 if (_this.options["portal-autoenter"]) {
                                    // auto click the Enter link:
                                    _this.element
                                       .find(".op-masthead a:first-of-type")
                                       .click();
                                 }
                              });

                           //// NOTE:  the old way.
                           ////        seems more responsive with the auto login, but technically everything isn't loaded yet ...

                           // // notify everyone the opsportal is finished creating the Tools.
                           // AD.comm.hub.publish('opsportal.ready', {});

                           // if (self.options['portal-theme'] != '') {

                           //     // wait for all tools to be loaded before
                           //     // loading any portal-theme, so this one has final
                           //     // say!

                           //     self.workArea.ready()
                           //     .fail(function(err){
                           //         AD.error.log('... workArea.ready()  failed!', err);
                           //     })
                           //     .then(function(){
                           //         var theme = self.options['portal-theme']+'.css';
                           //         steal(theme);
                           //     })

                           // }

                           // // if our auto open setting is set, then
                           // if (self.options['portal-autoenter']) {

                           //     // auto click the Enter link:
                           //     self.element.find('.op-masthead a:first-of-type').click();
                           // }
                        }
                     });
                  },

                  updateConfiguration: function() {
                     var _this = this;

                     if (!this.data.updateInProgress) {
                        this.data.updateInProgress = true;

                        // NOTE: in the process of editing a Nav Configuration
                        // multiple changes will be fired and multiple
                        // .updateConfigurations() will be called.
                        //
                        // However, an immediate call to /opsportal/config
                        // will rebuild the config before all possible config
                        // updates are in place.
                        //
                        // This timeout is an attempt to give the server some time
                        // to make all the updates before requesting a new config.
                        setTimeout(function() {
                           loadRequirements();

                           AD.comm.service
                              .get({ url: "/opsportal/config" })
                              .fail(function(err) {
                                 AD.error.log(
                                    "Error reloading opsportal/config",
                                    { error: err }
                                 );
                              })
                              .then(function(newConfig) {
                                 // if _this.data.lastConfig is not set, then default entries to empty []
                                 if (!_this.data.lastConfig) {
                                    _this.data.lastConfig = {
                                       areas: [],
                                       tools: []
                                    };
                                 }

                                 function difference(a, b, field) {
                                    // what is in a that is not in b:
                                    var diff = [];
                                    field = field || "id";

                                    a.forEach(function(iA) {
                                       var isThere = false;
                                       b.forEach(function(iB) {
                                          if (iA[field] == iB[field]) {
                                             isThere = true;
                                          }
                                       });
                                       if (!isThere) {
                                          diff.push(iA);
                                       }
                                    });

                                    return diff;
                                 }
                                 var newAreas = difference(
                                    newConfig.areas,
                                    _this.data.lastConfig.areas,
                                    "key"
                                 );
                                 var missingAreas = difference(
                                    _this.data.lastConfig.areas,
                                    newConfig.areas,
                                    "key"
                                 );

                                 var newTools = difference(
                                    newConfig.tools,
                                    _this.data.lastConfig.tools,
                                    "id"
                                 );
                                 var missingTools = difference(
                                    _this.data.lastConfig.tools,
                                    newConfig.tools,
                                    "id"
                                 );

                                 // NOTE: .createArea() is now Async, so make sure it completes
                                 // before calling the rest.
                                 //
                                 // newAreas.forEach(function(area){
                                 //     _this.createArea(area);
                                 // });

                                 var hashNewAreas = {};

                                 // a recursive fn to process each item in a given list:
                                 function recurseAreas(list, cb) {
                                    if (list.length == 0) {
                                       cb();
                                    } else {
                                       var curr = list.shift();
                                       hashNewAreas[curr.key] = "."; // save the place.
                                       _this.createArea(curr, function(err) {
                                          if (err) cb(err);
                                          else {
                                             recurseAreas(list, cb);
                                          }
                                       });
                                    }
                                 }
                                 recurseAreas(newAreas, function(err) {
                                    if (err) {
                                       // ???
                                       // not sure what to do here.
                                       console.log(
                                          "... OpsPortal.Navigation update failed:",
                                          err
                                       );
                                    } else {
                                       // remove tools before you remove their Area:
                                       missingTools.forEach(function(tool) {
                                          _this.removeTool(tool);
                                       });

                                       missingAreas.forEach(function(area) {
                                          _this.removeArea(area);
                                       });

                                       // Make sure you add new Tools after you create the
                                       // new Areas
                                       newTools.forEach(function(tool) {
                                          var area = tool.areas[0];
                                          if (
                                             hashNewAreas[area.key] == "." ||
                                             tool.isDefault
                                          ) {
                                             hashNewAreas[area.key] = tool;
                                          }
                                          _this.createTool(tool);
                                       });

                                       _this.menu.sortAreas();
                                       _this.subLinks.sortLinks();

                                       // for each newArea announce a default tool.
                                       for (var h in hashNewAreas) {
                                          AD.comm.hub.publish(
                                             "opsportal.tool.show",
                                             {
                                                area: h,
                                                tool: hashNewAreas[h].id // controller
                                             }
                                          );
                                       }

                                       _this.data.lastConfig = newConfig;
                                       _this.data.updateInProgress = false;
                                    }
                                 });
                              });
                        }, 1000);
                     }
                  },

                  //'.opsportal-menu-trigger-text click' : function( $el, ev) {
                  //'.opsportal-masthead a:first-of-type click' : function( $el, ev) {
                  ".op-masthead a:first-of-type click": function($el, ev) {
                     //'.op-launch click' : function( $el, ev) {
                     // this should show the Portal Popup
                     this.portalDisplay();

                     ev.preventDefault();
                  },

                  ".ad-item-add click": function($el, ev) {
                     ev.preventDefault();
                  },

                  /*
                                '.apd-portal-menu-trigger click': function($el, ev) {

                                    var width = this.menu.width();  //.toggle();
                                    AD.comm.hub.publish('opsportal.menu.toggle', { width: width });
                                }
                        */
                  progress: function(percent, $element) {
                     var progressBarWidth = (percent * $element.width()) / 100;
                     $element
                        .find("div")
                        .animate({ width: progressBarWidth }, 500)
                        .html(percent + "%&nbsp;");
                  }
               });
            });
      });
   }
);
