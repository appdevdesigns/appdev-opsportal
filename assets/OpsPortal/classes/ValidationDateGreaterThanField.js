/**
 * ValidationDateGreaterThanField
 *
 * This provides a data validation field that specifies this date field should be greater than another field.
 *
 * @codestart
 * // basic data structure:
 * dateGreaterThan : {
 *   "value":"date_start",
 *   "format":"mm/dd/yyyy"
 * }
 *
 * // when defined in a ModelUI.validations:
 *       validations: {
 *           "activity_name" : [ 'notEmpty' ],
 *           "activity_description" : [ 'notEmpty' ],
 *           "date_start" : [ 'notEmpty', 'date:{"format":"mm/dd/yyyy"}' ],
 *           "date_end" : [ 'date:{"format":"mm/dd/yyyy"}', 'dateGreaterThan:{"value":"date_start", "format":"mm/dd/yyyy"}' ]
 *       },
 * @codeend
 */

System.import("appdev").then(function() {
   steal
      .import("jquery", "appdev/ad", "bootstrap", "bootstrapValidator")
      .then(function() {
         // (function($) {
         /**
          * Enter the display text for this value:
          */
         $.fn.bootstrapValidator.i18n.dateGreaterThan = $.extend(
            $.fn.bootstrapValidator.i18n.dateGreaterThan || {},
            {
               default: "This value must be greater than field (%s)",
               notInclusive: "Please enter a value greater than %s"
            }
         );

         $.fn.bootstrapValidator.validators.dateGreaterThan = {
            // html5Attributes: {
            //     message: 'message',
            //     value: 'value',
            //     inclusive: 'inclusive'
            // },

            // enableByHtml5: function($field) {
            //     var type = $field.attr('type'),
            //         min  = $field.attr('min');
            //     if (min && type !== 'date') {
            //         return {
            //             value: min
            //         };
            //     }

            //     return false;
            // },

            /**
             * Return true if the input value is greater than the specified field
             *
             * @param {BootstrapValidator} validator Validate plugin instance
             * @param {jQuery} $field Field element
             * @param {Object} options Can consist of the following keys:
             * - field: {string} the other field name to compare this one to.
             * - value: {string} the other field name to compare this one to.
             * - canEqual: {bool} can the values be == ?
             * - message: The invalid message
             * @returns {Boolean|Object}
             */
            validate: function(validator, $field, options) {
               var value = $field.val();

               // console.warn('dateGreaterThan: value:'+value);

               // if there is nothing in the field yet, return true
               if (value === "") {
                  return true;
               }

               // value = this._format(value);
               // if (!$.isNumeric(value)) {
               //     return false;
               // }

               var otherField = options.field || options.value;

               if (typeof otherField == "undefined") {
                  console.error(
                     "dateGreaterThan() validation rule: no other field specified:",
                     options
                  );
                  return true;
               }

               var compareTo = validator.getDynamicOption($field, otherField);

               // console.warn('dateGreaterThan: compareTo:'+compareTo);

               value = this._stringToTimestamp(value, options.format);
               compareTo = this._stringToTimestamp(compareTo, options.format);

               // console.warn('dateGreaterThan: value(timestamp):'+value);
               // console.warn('dateGreaterThan: compareTo(timestamp):'+compareTo);

               return {
                  valid: options.canEqual
                     ? value >= compareTo
                     : value > compareTo,
                  message: $.fn.bootstrapValidator.helpers.format(
                     options.message ||
                        $.fn.bootstrapValidator.i18n.greaterThan["default"],
                     options.value
                  )
               };
            },

            _stringToDate: function(_date, _format, _delimiter) {
               if (typeof _delimiter == "undefined") {
                  // assume '/'
                  _delimiter = "/";

                  // unless we find out otherwise:
                  if (_format.indexOf("-") != -1) {
                     _delimiter = "-";
                  }
               }
               var formatLowerCase = _format.toLowerCase();
               var formatItems = formatLowerCase.split(_delimiter);
               var dateItems = _date.split(_delimiter);
               var monthIndex = formatItems.indexOf("mm");
               var dayIndex = formatItems.indexOf("dd");
               var yearIndex = formatItems.indexOf("yyyy");
               var month = parseInt(dateItems[monthIndex]);
               month -= 1;
               var formatedDate = new Date(
                  dateItems[yearIndex],
                  month,
                  dateItems[dayIndex]
               );
               return formatedDate;
            },

            _stringToTimestamp: function(_date, _format, _delimiter) {
               return this._stringToDate(_date, _format, _delimiter).getTime();
            }
         };
         // }(window.jQuery));
      });
});
