// List your Controller's dependencies here:
// 'opstools/OPTheme/models/Projects.js',
// '/opstools/OPTheme/views/OPTheme/OPTheme.ejs',
steal(
  function () {
    System.import('appdev').then(function () {
      steal.import('appdev/ad', 'appdev/control/control').then(function () {
        //'appdev/widgets/ad_delete_ios/ad_delete_ios',

        // Namespacing conventions:
        // AD.Control.extend('[application].[controller]', [{ static },] {instance} );
        AD.Control.OpsTool.extend('OPTheme', {

          init: function (element, options) {
            var self = this;
            options = AD.defaults({
              templateDOM: '/opstools/OPTheme/views/OPTheme/OPTheme.ejs'
            }, options);
            this.options = options;

            // Call parent init
            this._super(element, options);

            this.data = {};

            this.loadDOM();

          },


          loadDOM: function () {
            var _this = this;

            // Asynchronously Load the Template
            can.view(this.options.templateDOM, {}, function (frag) {
              _this.element.html(frag);

              // now that the HTML is in the DOM, attach our components:
              _this.initDOM();
            })
          },


          initDOM: function () {
            var _this = this;

            this.dom = {};

            webix.ready(function () {
              _this.dom.layoutGrid = webix.ui({
                type: "space",
                width: "100%",
                container: "container-webix-layout",
                rows: [
                  {
                    type: 'header', template: 'Theme Builder Wizard'
                  },
                  {
                    cols: [
                      {
                        view: "list",
                        id: "my-optheme-list",
                        scroll: true,
                        width: 300,
                        template: "#name# <span class='f-right'><a class='hris-tooltip edit tt' href='#' title='Edit theme'><span class='icon'><i class='fa fa-edit fa-fw'></i></span></a> <a class='hris-tooltip favorite tt' href='#' title='Set as default theme'><span class='icon'><i class='fa fa-heart-o fa-fw'></i></span></a> <a class='hris-tooltip delete tt' href='#' title='Delete theme'><span class='icon'><i class='fa fa-trash-o fa-fw'></i></span></a></span>",
                        onClick:{
                            delete:function(e, id){
                                _this.deleteTheme(this.getItem(id).filename, this);  
                                return false;
                            },
                            edit:function(e, id){
                                _this.editTheme(this.getItem(id).filename, this.getItem(id).name, this);  
                                return false;
                            },
                            favorite:function(e, id){
                                var selectedTheme = this.getItem(id).name;
                                _this.setDefaultTheme(selectedTheme, this);
                                
                                // Lets change the heart icon to show which is the default 
                                $(".fa-heart").removeClass("fa-heart").addClass("fa-heart-o");
                                $(e.srcElement).removeClass("fa-heart-o").addClass("fa-heart");
                            }
                        }
                      },
                      {
                        view: "form",
                        id: "my-optheme-form",
                        width: 870,
                        elements: [
                          {
                            view: "text",
                            label: "Theme Name *",
                            id: "themeName",
                            name: "name",
                            labelWidth: 220,
                            placeholder: 'Enter theme name',
                          },
                          {
                            cols: [
                              {
                                view: "colorpicker",
                                label: "Body BG",
                                id: "bodyBG",
                                labelWidth: 220,
                                name: "vars[bodyBG]",
                                value: "#fff"
                              }
                            ]
                          },
                          {
                            cols: [
                              {
                                view: "colorpicker",
                                label: "Header Color",
                                id: "headerColor",
                                labelWidth: 220,
                                name: "vars[headerColor]",
                                value: "#fff"
                              },
                              {
                                view: "colorpicker",
                                label: "Header BG",
                                id: "headerBG",
                                labelWidth: 220,
                                name: "vars[headerBG]",
                                value: "#444"
                              }
                            ]
                          },
                          {
                            cols: [
                              {
                                view: "colorpicker",
                                label: "Navigation Color",
                                id: "navColor",
                                labelWidth: 220,
                                name: "vars[navColor]",
                                value: "#333"
                              },
                              {
                                view: "colorpicker",
                                label: "Navigation BG",
                                id: "navBG",
                                labelWidth: 220,
                                name: "vars[navBG]",
                                value: "#f0f0f0"
                              }
                            ]
                          },
                          {
                            cols: [
                              {
                                view: "colorpicker",
                                label: "Pagination Button Color",
                                id: "paginationBtnColor",
                                labelWidth: 220,
                                name: "vars[paginationBtnColor]",
                                value: "#fff"
                              },
                              {
                                view: "colorpicker",
                                label: "Pagination Button BG",
                                id: "paginationBtnBG",
                                labelWidth: 220,
                                name: "vars[paginationBtnBG]",
                                value: "#3498db"
                              }
                            ]
                          },
                          {
                            cols: [
                              {
                                view: "colorpicker",
                                label: "Pagination Button Active Color",
                                id: "paginationActiveBtnColor",
                                labelWidth: 220,
                                name: "vars[paginationActiveBtnColor]",
                                value: "#fff"
                              },
                              {
                                view: "colorpicker",
                                label: "Pagination Active Button BG",
                                id: "paginationActiveBtnBG",
                                labelWidth: 220,
                                name: "vars[paginationActiveBtnBG]",
                                value: "#27ae60"
                              }
                            ]
                          },
                          {
                            cols: [
                              {
                                view: "colorpicker",
                                label: "Button Color",
                                id: "btnColor",
                                labelWidth: 220,
                                name: "vars[btnColor]",
                                value: "#fff"
                              },
                              {
                                view: "colorpicker",
                                label: "Button BG",
                                id: "btnBG",
                                labelWidth: 220,
                                name: "vars[btnBG]",
                                value: "#3498db"
                              }
                            ]
                          },
                          {
                            cols: [
                              {
                                view: "colorpicker",
                                label: "Navigation Button Color",
                                id: "navBtnColor",
                                labelWidth: 220,
                                name: "vars[navBtnColor]",
                                value: "#fff"
                              },
                              {
                                view: "colorpicker",
                                label: "Navigation Button BG",
                                id: "navBtnBG",
                                labelWidth: 220,
                                name: "vars[navBtnBG]",
                                value: "#a4b4bf"
                              }
                            ]
                          },
                          {
                            cols: [
                              {
                                view: "colorpicker",
                                label: "Navigation Button Active Color",
                                id: "navActiveBtnColor",
                                labelWidth: 220,
                                name: "vars[navActiveBtnColor]",
                                value: "#fff"
                              },
                              {
                                view: "colorpicker",
                                label: "Navigation Active Button BG",
                                id: "navActiveBtnBG",
                                labelWidth: 220,
                                name: "vars[navActiveBtnBG]",
                                value: "#3498db"
                              }
                            ]
                          },
                          {
                            cols: [
                              {
                                view: "colorpicker",
                                label: "Table Header Color",
                                id: "tableHeaderColor",
                                labelWidth: 220,
                                name: "vars[tableHeaderColor]",
                                value: "#4a4a4a"
                              },
                              {
                                view: "colorpicker",
                                label: "Table Header BG",
                                id: "tableHeaderBG",
                                labelWidth: 220,
                                name: "vars[tableHeaderBG]",
                                value: "#d2e3ef"
                              }
                            ]
                          },
                          {
                            view: "button",
                            name: "optheme-addTheme",
                            label: "Save Theme",
                            inputWidth: 200,
                            icon: "plus-circle", //font-awesome icons class
                            type: "iconButton",
                            align: "right",
                            click: function () {
                              if (this.getParentView().validate()) {
                                var theme = this.getFormView().getValues();
                                if (/[^a-z-0-9\s]/i.test(theme.name)) {
                                    webix.message({
                                      type: "error",
                                      text: "Theme name should only have letters, numbers, spaces and hyphens."
                                    });
                                    return false;
                                }
                                // Disable submit button
                                this.getParentView().elements['optheme-addTheme'].disable();
                                // Save theme
                                _this.addTheme(theme, this);
                              } else {
                                webix.message({
                                  type: "error",
                                  text: "Please provide a theme name"
                                });
                              }

                            }
                          }
                        ],
                        rules: {
                          name: "isNotEmpty"
                        }
                      }
                    ]
                  }
                ]
              })
            });

            // Transform the encoded ejs template into an actual EJS template
            // there is no need of it right now since all template is being made by webix


            // now load our data:
            this.loadData();

          },


          loadData: function () {
            var _this = this;

            // request a list of themes from the server and display them:
            AD.comm.service.get({url: '/optheme'})
              .fail(function (err) {
                AD.error.log('Error loading themes list', {error: err});
              })
              .done(function (list) {

                $$('my-optheme-list').clearAll();
                $$('my-optheme-list').parse(list);

              });


          },


          'addTheme': function (values, form) {

            var _this = this;
            AD.comm.service.post({url: '/optheme', params: values})
              .fail(function (err) {
                webix.message({
                  type: "error",
                  text: "Error creating new theme"
                });
                form.getParentView().elements['optheme-addTheme'].enable();
                AD.error.log("Error creating new theme", {error: err, values: values});
              })
              .then(function () {

                // server transaction complete.
                form.getParentView().elements['optheme-addTheme'].enable();

                // should now update your list of current themes
                _this.loadData();

                webix.message({
                  type: "info",
                  text: "Theme was created"
                });

              })

          },


          'editTheme': function (filename, name, grid) {

            var _this = this;
            AD.comm.service.get({url: '/optheme/get-variables', params: {name: filename}})
              .fail(function (err) {
                webix.message({
                  type: "error",
                  text: "Error editing theme"
                });
                AD.error.log("Error editing theme", {error: err, values: values});
              })
              .then(function (data) {
                data.forEach(function(item){
                    $$(item.key).setValue(item.value);
                    $$("themeName").setValue(name);
                });
                webix.message({
                  type: "info",
                  text: "Theme ready for editing"
                });

              })

          },

          'deleteTheme': function (filename) {

            var _this = this;
            AD.comm.service.delete({url: '/optheme', params: {name: filename}})
              .fail(function (err) {
                webix.message({
                  type: "error",
                  text: "Error deleting theme"
                });
                AD.error.log("Error deleting theme", {error: err, values: values});
              })
              .then(function () {

                // should now update your list of current themes
                _this.loadData();

                webix.message({
                  type: "info",
                  text: "Theme was deleted"
                });

              })

          },

          'setDefaultTheme': function (themeName, defaultButton) {

            AD.comm.service.post({url: '/optheme/set-default', params: {name: themeName}})
              .fail(function (err) {
                defaultButton.enable();
                AD.error.log('Error setting OPTheme.default', {error: err, name: themeName});
              })
              .done(function (status) {

                if (typeof prevThemeName !== 'undefined') {
                    $("style:contains('/* "+prevThemeName+" */')").remove();
                }
                // now try to load the selected theme:
                filename = themeName.replace(/ /g,"_").trim().toLowerCase() + ".css";
                steal('opstools/OPTheme/themes/' + filename);
                defaultButton.enable();
                prevThemeName = themeName;
              })

          },

        });

      });
    });

  }
);
