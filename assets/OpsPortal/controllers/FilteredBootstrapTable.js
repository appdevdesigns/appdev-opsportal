System.import("appdev").then(function() {
   steal
      .import(
         // List your Controller's dependencies here:
         "jquery",
         "appdev/ad",
         "appdev/control/control",
         "appdev/sal/web-jquery",
         "typeahead"
         //        'opstools/FCFActivities/models/Projects.js',
         //        'appdev/widgets/ad_delete_ios/ad_delete_ios.js',
         // '//opstools/FCFActivities/views/AddChooseMinistry/AddChooseMinistry.ejs',
      )
      .then(function() {
         /*
          *  FilteredBootstrapTable
          *
          *  This controller coordinates the actions of a Typeahead filter with an
          *  instance of bootstrap-table.
          *
          *
          *  to use:
          *  -------
          *  @codestart
          *  var Filter = AD.Control.get('opstools.FCFActivities.FilteredBootstrapTable');
          *  this.Filter = new Filter(this.element, {
          *      tagFilter: '.fcf-team-filter',
          *      tagBootstrapTable: '.fcf-team-list',
          *      scrollToSelect:true,
          *
          *      // filterTable:true,
          *
          *      rowClicked:function(data) {
          *          if (data) {
          *              self.selectedData = data;
          *          }
          *      },
          *      rowDblClicked: function(data) {
          *          if (data) {
          *              self.selectedData = data;
          *              self.continue();
          *          }
          *      },
          *      termSelected:function(data) {
          *          if (data) {
          *              self.selectedData = data;
          *              self.continue();
          *          }
          *      },
          *      dataToTerm: function(data) {
          *          if (data) {
          *              return data.name;
          *          } else {
          *              return '';
          *          }
          *      }
          *  });
          *
          *  this.filter.load( [ {id:1, name:'name 1'}, {id:2, name:'name 2'}, ... {id:N, name:'name N'}])
          *  @codeend
          *
          *  @codestart
          *  <input type="text" class="form-control fcf-team-filter" placeholder="Search for Team">
          *  <table class="fcf-team-list table" data-toggle="table" data-cache="false" data-height="299" >
          *      <thead>
          *          <tr>
          *              <th data-field="name" >Name</th>
          *          </tr>
          *      </thead>
          *      <tbody>
          *      </tbody>
          *  </table>
          *  @codeend
          *
          *  NOTE: on bootstrap-table, you need to have a <th> column defined with a data-field="name"
          *  properties that match the object properties you want to display in the table.
          *
          *
          *
          *  events:
          *  -------
          *  FilteredElements publishes these events on the given element:
          *
          *
          *
          *  Params:
          *  -------
          *  $el         {dom} a DOM element for this controller to attach to
          *  options     {obj} a json object representing the different options for this instance:
          *
          *      tagFilter         {string} a jQuery selector for which textbox to use as the filter
          *      tagBootstrapTable {string} a jQuery selector for the table
          *      scrollToSelect    {bool}   scroll table to match selected filter value?
          *      filterTable       {bool}   only show rows in table that match current filter options?
          *
          *      dataCursorOn        {fn}   a callback fn(data) called every time a possible entry is
          *                                 highlighted in the dropdown
          *      rowClicked          {fn}   a callback fn(data) called when a table row is clicked
          *      rowDblClicked       {fn}   a callback fn(data) called when a table row is double clicked
          *      termSelected        {fn}   a callback fn() called when a typeahead value is
          *                                 selected/autocompleted.
          *      dataToTerm          {fn}   a fn(data) called on each data entry provided.  should return
          *                                 a {string} search term representing that data obj.
          *
          *      rowStyle            {fn}   a fn(row, index) {} that returns what css style should be
          *                                 applied to the row.
          *                                  return {}   for nothing
          *                                  return { classes:'cssStyle' }  to assign a style
          *
          *
          *
          *  Methods:
          *  --------
          *  load( [data] )       : loads the provided array of objects into the table and converts each
          *                         item into a search term for the typeahead filter.
          */

         // Namespacing conventions:
         // AD.Control.extend('[application].[controller]', [{ static },] {instance} );
         AD.Control.extend("OpsPortal.FilteredBootstrapTable", {
            init: function(element, options) {
               var self = this;
               options = AD.defaults(
                  {
                     tagFilter: ".fe-filter", // tag to find the typeahead textbox
                     tagBootstrapTable: ".fe-el", // tag to find the bootstrap-table entry
                     scrollToSelect: true, // scroll to bootstrap-table entry upon selection
                     filterTable: false, // auto filter bootstrap-table data to match typeahead

                     rowStyle: false, // the row style formatter fn
                     // function(row,index) { return {} }

                     cssSelected: "active", // a css style to set a selected row to

                     modelID: "id", // {string} the unique id field for our data objects

                     // callbacks:
                     dataCursorOn: function(el) {}, // fn() called when typeahead cursor is on an option
                     rowClicked: function(el) {}, // fn() called when table row clicked
                     rowDblClicked: function(el) {}, // fn() called when table row double clicked
                     rowChecked: function(row) {}, // fn() called when a row's checkbox was clicked
                     rowUnChecked: function(row) {}, // fn() called when a row's checkbox was unclicked
                     termSelected: function(el) {}, // fn() called when a typeahead term is selected

                     //
                     dataToTerm: function(data) {
                        return data + "";
                     }, // fn() to return a typeahead searchterm

                     tableOptions: {}, // the bootstrap-table options param.

                     data: null // initial data for table
                  },
                  options
               );
               this.options = options;

               //// figure out rowStyle settings
               // tableOptions.rowStyle takes precedence
               // a provided rowStyle comes next
               // our default self.rowStyle is last
               if (typeof this.options.tableOptions.rowStyle == "undefined") {
                  if (this.options.rowStyle) {
                     this.options.tableOptions.rowStyle = this.options.rowStyle;
                  } else {
                     this.options.tableOptions.rowStyle = function(row, indx) {
                        return self.rowStyle(row, indx);
                     };
                  }
               }

               // Call parent init
               // this._super(element, options);

               this.searchTerms = []; // an array of search terms gathered from the found [el]
               this.dataHash = {}; // term :  { data }
               this.posHash = {}; // term :  # position (0 - data.length -1)

               this.hasTableTemplate = false; // is there a tr.template in our table?
               // if so, then we load the table according to
               // the template, else we simply let
               // bootstraptable.load()
               this.templateID = ""; // if hasTableTemplate == true, then this is the
               // templateID to reference the template for this
               // instance.

               this.selectedModel = null; // {obj} keeps track of which model is considered selected
               this.selectionField = null; // {string} which field of .selectedModel is used for comparison

               this.table = null;
               this.listData = this.options.data;

               this.attachDOM(); // Attach Typeahead.js & Bootstraptable.js

               if (this.options.data) {
                  this.load(this.options.data);
               } else {
                  //// TODO: do we load from an existing bootstrap-table data?
                  // console.warn('** TODO: load from existing bootstrap-table instance');
               }
            },

            newFormatterFN: function(templateID) {
               return function(v, r, i) {
                  return $("<div/>")
                     .append(
                        can.view(templateID, { value: v, row: r, index: i })
                     )
                     .html();
               };
            },

            attachDOM: function() {
               var self = this;

               ////
               //// Attach to DOM elements
               ////

               // Typeahead.js filter box
               console.warn(
                  "... typeahead debug: tagFilter:" + this.options.tagFilter
               );
               console.warn(
                  "... typeahead debug:",
                  this.element.find(this.options.tagFilter)
               );
               this.textFilter = this.element.find(this.options.tagFilter);

               // ### stupid hack for .typeahead loading issue!
               var attachIt = function() {
                  console.warn("... attaching typeahead:");

                  self.textFilter.typeahead(
                     {
                        hint: false,
                        highlight: true,
                        minLength: 0
                     },
                     {
                        name: "teams",
                        displayKey: "value",
                        source: function(q, cb) {
                           self.filter(q, cb);
                        }
                     }
                  );

                  self.textFilter.on("typeahead:closed", function() {
                     // console.log('typeahead:closed');
                     // if there is a selected row, then just continue on:
                  });

                  self.textFilter.on("typeahead:cursorchanged", function() {
                     // console.log('typeahead:cursorchanged');

                     var val = self.textFilter.typeahead("val");
                     var data = self.dataHash[val];
                     if (data) {
                        self.options.dataCursorOn(data);
                     }
                  });

                  self.textFilter.on("typeahead:selected", function() {
                     // console.log('typeahead:selected');

                     var val = self.textFilter.typeahead("val");

                     if (self.options.scrollToSelect) {
                        self.table.bootstrapTable(
                           "scrollTo",
                           self.posHash[val]
                        );
                     }

                     var data = self.dataHash[val];
                     if (data) {
                        self.selectRow(data); // set which data row should be selected
                        self.load(self.listData); // ##Hack! to refresh selected item! (is there a better way?)

                        // ## bootstraptable.js has a settimeout() when reloading data
                        // if we continue on too quickly, the table header wont display
                        // correctly in certain situations:
                        //  - header is not visible, so bootstraptable repaints *another* header in table
                        //  - which causes a new row and might then popup the scroll bar
                        //  - when .resetView() is called after that, the scrollbar is originally there
                        //    so the header is adjusted over for that
                        //  - when all data is displayed, scroll bar is not shown
                        //  ---> result: header is not in correct position.
                        AD.sal.setImmediate(function() {
                           self.options.termSelected(data);
                        });
                     }
                  });

                  self.textFilter.on("typeahead:autocompleted", function() {
                     // console.log('typeahead:autocompleted');

                     var val = self.textFilter.typeahead("val");

                     if (self.options.scrollToSelect) {
                        self.table.bootstrapTable(
                           "scrollTo",
                           self.posHash[val]
                        );
                     }

                     var data = self.dataHash[val];
                     if (data) {
                        self.textFilter.typeahead("close");

                        self.selectRow(data); // set which data row should be selected
                        self.load(self.listData); // ##Hack! to refresh selected item! (is there a better way?)

                        // ## bootstraptable.js has a settimeout() when reloading data
                        // if we continue on too quickly, the table header wont display
                        // correctly in certain situations:
                        //  - header is not visible, so bootstraptable repaints *another* header in table
                        //  - which causes a new row and might then popup the scroll bar
                        //  - when .resetView() is called after that, the scrollbar is originally there
                        //    so the header is adjusted over for that
                        //  - when all data is displayed, scroll bar is not shown
                        //  ---> result: header is not in correct position.
                        AD.sal.setImmediate(function() {
                           self.options.termSelected(data);
                        });
                     }
                  });
               }; // end attachIt

               var isReady = function(count) {
                  if (count > 500) {
                     console.error("!!! Waiting too long for typeahead()! ");
                  } else {
                     console.warn("... waiting for typeahead");
                     if (self.textFilter.typeahead) {
                        attachIt();
                     } else {
                        setTimeout(function() {
                           isReady(count + 1);
                        }, 100); // try again in 100ms
                     }
                  }
               };

               isReady(0);

               this.table = this.element.find(this.options.tagBootstrapTable);

               //// check .tableOptions to see if there are any columns:[ { formatter:'string' }]
               //// references.  If they are, then replace them with a template based upon
               //// the contents of $('string') element.

               var shouldClearTemplate = false;

               if (this.options.tableOptions.columns) {
                  this.options.tableOptions.columns.forEach(function(column) {
                     if (column.formatter) {
                        if ($.type(column.formatter) == "string") {
                           // now find the dom reference for the formatter:
                           var elTemplate = self.element.find(column.formatter);

                           if (elTemplate.length == 0) {
                              console.error(
                                 "*** column.formatter provided, but no template found!"
                              );
                              console.warn(
                                 "   column.formatter=[" +
                                    column.formatter +
                                    "]"
                              );
                           } else {
                              // template found, so grab template:
                              var templateID = "FBT" + AD.util.uuid();
                              var template = self.domToTemplate(elTemplate);
                              can.view.ejs(templateID, template);

                              column.formatter = self.newFormatterFN(
                                 templateID
                              );

                              shouldClearTemplate = true;
                           }
                        }
                     }
                  });
               }

               // if we had an embedded template, then remove it before attaching the table.
               if (shouldClearTemplate) {
                  this.table.find("tbody").html(" ");
               }

               this._tableAttach();
            },
            _tableAttach: function() {
               var _this = this;

               this.table.bootstrapTable(this.options.tableOptions);
               this.table
                  .on("click-row.bs.table", function(e, row, $element) {
                     _this.selected($element);
                     _this.options.rowClicked(row);
                  })
                  .on("dbl-click-row.bs.table", function(e, row, $element) {
                     _this.selected($element);
                     _this.options.rowDblClicked(row);
                  })
                  .on("check.bs.table", function(e, row) {
                     _this.options.rowChecked(row);
                  })
                  .on("uncheck.bs.table", function(e, row) {
                     _this.options.rowUnChecked(row);
                  });
            },

            checkEntries: function(list) {
               var _this = this;

               if (list) {
                  this.table.bootstrapTable("uncheckAll");

                  var listIDs = [];
                  list.forEach(function(l) {
                     listIDs.push(l[_this.options.modelID]);
                  });

                  this.table.bootstrapTable("checkBy", {
                     field: this.options.modelID,
                     values: listIDs
                  });
               }
            },

            filter: function(q, cb) {
               var matches, substrRegex;

               // an array that will be populated with substring matches
               matches = [];

               // if there is a q value
               if (q != "") {
                  // regex used to determine if a string contains the substring `q`
                  substrRegex = new RegExp(AD.util.string.quoteRegExp(q), "i");

                  // iterate through the pool of strings and for any string that
                  // contains the substring `q`, add it to the `matches` array
                  $.each(this.searchTerms, function(i, str) {
                     if (substrRegex.test(str)) {
                        // the typeahead jQuery plugin expects suggestions to a
                        // JavaScript object, refer to typeahead docs for more info
                        matches.push({ value: str });
                     }
                  });

                  // if we are filtering the table then update table data:
                  if (this.options.filterTable) {
                     this.filterElements(matches);
                  }
               } else {
                  // q value empty so redisplay all data in table if we are
                  // filtering the Table
                  if (this.options.filterTable) {
                     // redisplay all the data in the table
                     this.table.bootstrapTable("load", this.listData);
                  }
               }

               cb(matches);
            },

            // only show data rows that are part of the matches:
            filterElements: function(matches) {
               var self = this;

               // // only show rows that match what is typed:

               var toShow = [];

               // create a Hash of id's that should be shown:
               matches.forEach(function(match) {
                  var data = self.dataHash[match.value];
                  if (data) {
                     toShow.push(data);
                  }
               });

               this.table.bootstrapTable("load", toShow);
            },

            /**
             * @load
             *
             * reset our terms and BootstrapTable according to the given array of data items.
             */
            load: function(list) {
               var _this = this;

               this.listData = list;

               this._load();

               // if our list is of type can.List
               // (or just offers a .bind() method )
               if (list.bind) {
                  // reload our FilteredBootstrapTable if our given list changes.
                  this.listData.bind("change", function() {
                     _this._load();
                  });
               }
            },
            _load: function() {
               var _this = this;

               this.searchTerms = []; // 'searchable text'
               this.dataHash = {}; // term : $tr of matching row
               this.posHash = {};

               // tell bootstrap-table to load this list of data
               // v1.7 doesn't allow can.List to be the data:
               this.table.bootstrapTable("load", []);
               var list = [];
               this.listData.forEach(function(e) {
                  list.push(e);
               });
               this.table.bootstrapTable("load", list);

               // now figure out each of our hashes:
               var i = 0;
               this.listData.forEach(function(data) {
                  // list.each(function(data, i){

                  // what is the search tearm for this data item?
                  var term = _this.options.dataToTerm(data);
                  _this.searchTerms.push(term);

                  // use term to create hashes:
                  _this.dataHash[term] = data;
                  _this.posHash[term] = i;

                  i++;
               });
            },

            busy: function() {
               this.table.bootstrapTable("showLoading");
            },

            ready: function() {
               this.table.bootstrapTable("hideLoading");
            },

            resetView: function() {
               this.table.bootstrapTable("resetView");
            },

            rowStyle: function(row, index) {
               if (this.selectedModel) {
                  var rVal = row[this.selectionField];
                  var sVal = this.selectedModel[this.selectionField];

                  if (rVal == sVal) {
                     // this is a match!
                     return { classes: this.options.cssSelected };
                  }
               }

               // if we get here, then don't apply a css selection
               return {};
            },

            /*
             * selectRow()
             *
             * called externally with a given model that should be displayed as selected.
             *
             * @param {obj} model  the Model of the data row that should be selected.
             * @param {string} field  the field to compare in our search.
             */
            selectRow: function(model, field) {
               field = field || this.options.modelID; // default to 'id' for typical Models

               // make sure calling model has a field value:
               if (typeof model[field] != "undefined") {
                  this.selectedModel = model;
                  this.selectionField = field;

                  this._load(); // reload the current data so this entry get's shown as selected

                  // var listData = this.table.bootstrapTable('getData');
                  // if (listData) {
                  //     var indx = -1;
                  //     listData.forEach(function(data){
                  //         indx++;
                  //         if (typeof data[field] != 'undefined') {
                  //             if (data[field] == model[field]) {

                  //             }
                  //         }
                  //     })
                  // }
               } else {
                  console.error(
                     "FilteredBootstrapTable.selectRow(): model did not contain the given field [" +
                        field +
                        "]  model:",
                     model
                  );
               }
            },

            /*
             * selected()
             *
             * called when a row is clicked/dblClicked on.  It will set the css style
             * to the provided options.cssSelected if one is provided.
             *
             * @param {$el} the TR row that was selected.
             */
            selected: function($el) {
               if (this.options.cssSelected) {
                  // remove any previous selected markings from any of our row
                  this.table
                     .find("." + this.options.cssSelected)
                     .removeClass(this.options.cssSelected);
                  $el.addClass(this.options.cssSelected);
               }
            },

            /*
             * values()
             *
             * returns an array of selected items.
             *
             * @return {array}
             */
            values: function() {
               return this.table.bootstrapTable("getAllSelections");
            }
         });
      });
});
