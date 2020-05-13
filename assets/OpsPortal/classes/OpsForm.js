steal(
   "OpsPortal/classes/ValidationDateGreaterThanField.js",
   "OpsPortal/classes/ValidationServer.js",
   function() {
      System.import("can").then(function() {
         steal
            .import(
               "jquery",
               "can/control/control",
               "appdev/ad",
               "bootstrap",
               "bootstrapValidator"
            )
            .then(function() {
               // The OpsPortal will define a global namespace for our added utilities:
               if (typeof AD.op == "undefined") AD.op = {};

               /**
                * @class AD.op.Form
                * @parent can.Control
                *
                * This is a Form controller that lets us simply bind Models to Forms
                * and handle validations automatically.
                *
                * To manually setup a form:
                * @codestart
                *   this.form = new AD.op.Form(this.dom.userRoleScopeForm);
                *   this.form.addField('role', 'integer', { notEmpty: {} });
                *   this.form.addField('scope', 'array', { notEmpty: {} });
                *   this.form.attach();  // do this once the data in form is ready
                * @codeend
                *
                * To process a form:
                * @codestart
                *   var _this = this;
                *   if(this.form.isValid()) {
                *       var values = this.form.values();
                *       Model.create(values)
                *       .fail(function(err){
                *          if (!_this.form.errorHandle(err)) {
                *              AD.error.log('Unknown Error for Model.create()', {values:values, error:err})
                *          }
                *       })
                *       .then(function(model){
                *          _this.form.reset();
                *       })
                *   }
                * @codeend
                *
                *
                *  NOTE:
                *      form.reset() : should be done while the form is visible
                */
               AD.op.Form = can.Control.extend(
                  {
                     // Static properties
                  },
                  {
                     // Instance properties

                     init: function($element, options) {
                        this._Model = null;
                        this.datepickers = []; // which fields should be datepickers
                        this.hashElements = {}; // { field : $(el) }
                        this.listFields = [];

                        this.hashTypes = {}; // { field : "text", 'array', ... }
                        this.hashValidations = {}; // { field : { validators:validations } }

                        this.validator = null;
                        this.isValidated = false;
                     },

                     // sometimes formValidator doesn't clear the messages,
                     // this will manually attempt to clear them:
                     _clearMessages: function() {
                        var _this = this;

                        this.listFields.forEach(function(field) {
                           _this.element
                              .find('[data-bv-icon-for="' + field + '"]')
                              .hide();
                           _this.element
                              .find('[data-bv-for="' + field + '"]')
                              .hide();
                        });
                     },

                     /**
                      * @function addField
                      *
                      * setup the field for validation using bootstrapValidator()
                      * @param {string} field  the field name
                      * @param {string} type   the type of data ('string', 'text', 'date', 'check' )
                      * @param {obj} validations an object setting up the validations for this field
                      */
                     addField: function(field, type, validations) {
                        if (this.listFields.indexOf(field) == -1) {
                           this.listFields.push(field);

                           if (type == "date" || type == "datetime") {
                              this.datepickers.push(field);
                           }
                           this.hashTypes[field] = type;
                           this.hashValidations[field] = {
                              validators: validations
                           };
                        }
                     },

                     /**
                      * @function addValidation
                      *
                      * add a validation rule to a field.
                      *
                      * Do this before you .attach() the Form.
                      *
                      * @codestart
                      *
                      * @codeend
                      *
                      * @param {string} field  the field name
                      * @param {obj} validation  the validation object
                      */
                     addValidation: function(field, validation) {
                        var existingValidations = this.hashValidations[field];

                        if (existingValidations) {
                           for (var k in validation) {
                              existingValidations.validators[k] = validation[k];
                           }
                        } else {
                           console.warn(
                              "*** OpsForm.addValidation() field[" +
                                 field +
                                 "] not found."
                           );
                        }
                     },

                     /**
                      * @function attach
                      *
                      * Actually apply the form validation to the Form elements
                      */
                     attach: function() {
                        var _this = this;

                        // for each field, find the Form :input element
                        this.hashElements = {};
                        this.listFields.forEach(function(field) {
                           var el = _this.element.find(
                              "[name='" + field + "']"
                           );
                           if (el.length > 0) {
                              _this.hashElements[field] = el;
                           } else {
                              // maybe there are some check boxes?
                           }
                        });

                        // first make sure our DatePickers are created:
                        this.datepickers.forEach(function(field) {
                           // if we found a corresponding element
                           var el = _this.hashElements[field];
                           if (el) {
                              var opt = {
                                 stepping: 5
                              };

                              if (_this.hashValidations[field]) {
                                 if (
                                    _this.hashValidations[field].validators.date
                                 ) {
                                    var config =
                                       _this.hashValidations[field].validators
                                          .date;
                                    config.format = config.format.toUpperCase();

                                    opt.format = config.format || opt.format;
                                    if (config.min) {
                                       opt.minDate = config.min;
                                    }
                                    if (config.max) {
                                       opt.maxDate = config.max;
                                    }
                                 }
                              }

                              el.datetimepicker(opt).on("dp.change", function(
                                 e
                              ) {
                                 _this.validator.revalidateField(field);
                              });
                           }
                        });

                        // now apply bootstrapValidator()
                        var config = {
                           framework: "bootstrap",
                           message: "This value is not valid",
                           feedbackIcons: {
                              valid: "glyphicon glyphicon-ok",
                              invalid: "glyphicon glyphicon-remove",
                              validating: "glyphicon glyphicon-refresh"
                           }
                        };

                        config.fields = jQuery.extend(
                           true,
                           {},
                           this.hashValidations
                        );

                        this.validator = this.element
                           .bootstrapValidator(config)
                           .data("bootstrapValidator");
                        this.isValidated = false;
                     },

                     /**
                      * @function bind
                      *
                      * Given a Model object, attempt to setup all validation rules
                      * based upon the Model.describe(), Model.validations data.
                      *
                      * NOTE: this will 'reset' the form with the information from
                      * Model.
                      *
                      * @param {obj} Model
                      * @return {undefined}
                      */
                     bind: function(Model) {
                        var _this = this;

                        var instance = null;
                        // if this is an instance of a can.Model, then get the Model definition!
                        if (Model.getID && Model.getLabel) {
                           instance = Model;
                           Model = Model.model();
                        }

                        this._Model = Model;
                        this._instance = instance;

                        this.datepickers = []; // which fields should be datepickers
                        this.hashTypes = {}; // field : type ['string', 'text', ...]
                        this.hashValidations = {};

                        // determine the possible fields in this Model
                        this.listFields = [];
                        var desc = this._Model.describe();
                        for (var field in desc) {
                           var type = desc[field];

                           // create the fieldValidation object:
                           var fieldValidations = {};
                           if (Model.validations) {
                              validations = Model.validations[field]; // [ 'notEmpty' ]
                              if (validations) {
                                 validations.forEach(function(valKey) {
                                    var key = _this.entryToKey(valKey);
                                    var obj = _this.entryToConfig(valKey);

                                    fieldValidations[key] = obj;
                                 });
                              }
                           }

                           // add in the server side validation rule
                           fieldValidations["server"] = {};

                           this.addField(field, type, fieldValidations);
                        }

                        // // compile the bootstrapValidator validation parameters from the Model:
                        // this.hashValidations = {};
                        // this.listFields.forEach(function(field){

                        //     _this.hashValidations[field] = { validators:{} }

                        //     var validations = [];
                        //     if (Model.validations) {
                        //         validations = Model.validations[field]; // [ 'notEmpty' ]
                        //         validations.forEach(function(valKey){

                        //             var key = _this.entryToKey(valKey);
                        //             var obj = _this.entryToConfig(valKey);

                        //             _this.hashValidations[field].validators[key] = obj;

                        //         })
                        //     }

                        // })
                     },

                     /**
                      * @function clear
                      *
                      * reset() the form and clear the data.
                      */
                     clear: function() {
                        this.isValidated = false;
                        this.validator.resetForm(true);

                        this._clearMessages();
                        // this.element.find(':input:not(:checkbox)').val('');
                        // this.element.find(':checkbox').prop('checked', false);
                     },

                     /**
                      * @function elAdd
                      *
                      * dynamically add an element (el) to the form.
                      *
                      * use this fn() to add a form element to a form after the
                      * form has been attached to the DOM.  This is useful for
                      * fields that are dynamically created, and need to be part
                      * of what the form manages.
                      *
                      * @codestart
                      * // add the dynamically created [checkboxes]
                      * self.form.elAdd(self.modalAdd.find('.objectives-section [name="objective"]'));
                      * @codeend
                      *
                      * @param {el|array[el]} el  a DOM element (or an Array of DOM elements) to be added
                      */
                     elAdd: function(el) {
                        var _this = this;

                        //
                        var addEl = function($el) {
                           if (!$el.jQuery) $el = $($el);

                           // if we have some validations for this field, add them with it:
                           var val = {};
                           var field =
                              $el.attr("data-bv-field") || $el.attr("name");
                           if (_this.hashValidations[field]) {
                              val = _this.hashValidations[field];
                           }

                           _this.validator.addField($el, val);
                        };

                        // if this is an array, add each one individually:
                        if ($.isArray(el) || el.length) {
                           el.each(function(i, $el) {
                              addEl($el);
                           });
                        } else {
                           addEl(el);
                        }
                     },

                     /**
                      * @function elRemove
                      *
                      * dynamically remove an element from the form.
                      *
                      * use this fn() to remove a form element from a form after the
                      * form has been attached to the DOM.  This is useful for
                      * fields that are dynamically removed, and the form no longer
                      * needs to manage them.
                      *
                      * @codestart
                      * // remove these [checkboxes]
                      * self.form.elRemove(self.modalAdd.find('.objectives-section [name="objective"]'));
                      * @codeend
                      *
                      * @param {el|array[el]} el  a DOM element (or an Array of DOM elements) to be removed
                      */
                     elRemove: function(el) {
                        var _this = this;

                        if ($.isArray(el) || el.length) {
                           el.each(function(i, $el) {
                              if (!$el.jQuery) $el = $($el);
                              _this.validator.removeField($el);
                           });
                        } else {
                           if (!el.jQuery) el = $(el);
                           this.validator.removeField(el);
                        }
                     },

                     /**
                      * @function errorHandle
                      *
                      * process a given error object and see if it was an error
                      * related to the form submission.
                      *
                      * if so, then attempt to update the form error messages with
                      * the returned data.
                      *
                      * if the error was form related, then we return true, else false.
                      *
                      * @param {obj} err  the error object
                      * @return {bool}
                      */
                     errorHandle: function(err) {
                        var _this = this;

                        // maybe err is an appdev response packet:
                        if (err.status) err = err.data || err;

                        if (err.error) {
                           switch (err.error) {
                              case "E_VALIDATION":
                                 for (var field in err.invalidAttributes) {
                                    // update the 'server' validation message with each response:
                                    var messages = [];
                                    err.invalidAttributes[field].forEach(
                                       function(rule) {
                                          messages.push(rule.message);
                                       }
                                    );
                                    _this.validator.updateMessage(
                                       field,
                                       "server",
                                       messages.join("<br>")
                                    );

                                    // mark this field as INVALID
                                    _this.validator.updateStatus(
                                       field,
                                       _this.validator.STATUS_INVALID,
                                       "server"
                                    );
                                 }

                                 return true;
                                 break;

                              case "E_UNKNOWN":
                                 // there might be an embedded E_Validation error...
                                 if (err.raw) {
                                    if (err.raw[0].err) {
                                       return _this.errorHandle(err.raw[0].err);
                                    }
                                 }
                                 // if we get here ... return false
                                 return false;
                                 break;
                           }
                        }

                        // TODO: decoding a BAD_FIELD error
                        console.log(err);

                        // if we get here, then we are not able to handle this error.
                        return false;
                     },

                     /**
                      * @function errors
                      *
                      * return the registered errors for this form.
                      *
                      * @return {array}
                      */
                     errors: function() {
                        return this.validator.getMessages();
                     },

                     /**
                      * @function isValid
                      *
                      * Return wether or not the current data in the form elements
                      * pass the validation rules.
                      *
                      * @return {bool}
                      */
                     isValid: function() {
                        if (this.validator) {
                           // validate() needs to be run at least 1x before isValid()
                           if (!this.isValidated) {
                              this.validator.validate();
                              this.isValidated = true;
                           }
                           return this.validator.isValid();
                        }
                        console.warn(
                           "... Opsform.isValid() : no validator.  Did you .attach() the form?"
                        );
                        return false;
                     },

                     /**
                      * @function reset
                      *
                      * Reset the form validations. But does not reset the field values.
                      */
                     reset: function() {
                        this.isValidated = false;
                        this.validator.resetForm(false);

                        this._clearMessages();
                     },

                     /**
                      * @function values
                      *
                      * Set or Return the current values of the form elements
                      * @param {obj} values  (optional) obj of key:value pairs
                      * @return {obj} if getting the values, otherwise null
                      */
                     values: function(vals) {
                        if (vals) {
                           return this._valuesSet(vals);
                        } else {
                           return this._valuesGet();
                        }
                     },
                     _valuesGet: function() {
                        var values = this.element
                           .find(":input")
                           .serializeArray();
                        var obj = {};

                        values.forEach(function(val) {
                           if (typeof obj[val.name] == "undefined") {
                              obj[val.name] = val.value;
                           } else {
                              if (!$.isArray(obj[val.name])) {
                                 obj[val.name] = [obj[val.name], val.value];
                              } else {
                                 obj[val.name].push(val.value);
                              }
                           }
                        });

                        // make sure anything designated as an array is returned
                        // as an array:
                        for (var f in this.hashTypes) {
                           if (obj[f]) {
                              if (this.hashTypes[f] == "array") {
                                 if (!$.isArray(obj[f])) {
                                    obj[f] = [obj[f]];
                                 }
                              }
                           }
                        }

                        return obj;
                     },
                     _valuesSet: function(vals) {
                        var _this = this;

                        this.clear();

                        this.listFields.forEach(function(field) {
                           if (vals[field]) {
                              var el = _this.element.find(
                                 "[name='" + field + "']"
                              );
                              if (el.length > 0) {
                                 el.val(vals[field]);
                              }
                           }
                        });

                        return null;
                     },

                     /**
                      * @function translateLabels
                      * @param string lang (Optional)
                      */
                     translateLabels: function(lang) {
                        $.each(this.labels, function() {
                           this.translate(lang);
                        });
                     },

                     /**
                      * @function entryToKey
                      *
                      * return the validation key from the given encoded entry
                      * @param {string} encodedEntry an encoded validation entry:  'notEmpty', or 'stringLength:{min:6,max30}'
                      * @return {string}
                      */
                     entryToKey: function(encodedEntry) {
                        var parts = encodedEntry.split(":");
                        return parts[0];
                     },

                     /**
                      * @function entryToObject
                      *
                      * return the validation config object from the given encoded entry.
                      * @param {string} valKey an encoded validation entry: 'notEmpty', or 'stringLength:{min:6, max:30}'
                      * @return {obj}
                      */
                     entryToConfig: function(encodedEntry) {
                        var configObj = {};

                        var parts = encodedEntry.split(":");
                        if (parts.length > 1) {
                           parts.shift();
                           var rest = parts.join(":");

                           try {
                              configObj = AD.sal.parseJSON(rest);
                           } catch (e) {
                              console.error("AD.ui.form.entryToConfig():");
                              console.error(
                                 "!! invalid config options : " + rest
                              );
                           }
                        }

                        return configObj;
                     },

                     setupValidations: function() {}
                  }
               );
            }); // end fn() {}
      });
   }
);
