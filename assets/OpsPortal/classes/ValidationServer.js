System.import('appdev').then(function () {
    steal.import(
        'jquery',
        'appdev/ad',
        'bootstrap',
        "bootstrapValidator"
        )
        .then(function () {

            // (function($) {
            $.fn.bootstrapValidator.i18n.server = $.extend($.fn.bootstrapValidator.i18n.server || {}, {
                'default': 'The server didn\'t like this.'
            });

            $.fn.bootstrapValidator.validators.server = {


                /**
                 * This validation rule always returns true.
                 *
                 * It is primarily used as a way to let bootstrapValidator create a 
                 * space for a server side error message, and then display that message manually.
                 *
                 * @codestart
                 *   Model.create(obj)
                 *   .fail(function(err){
                 *
                 *       if (err.error == 'E_VALIDATION') {
                 *           for(var field in err.invalidAttributes) {
                 *               var msg = err.invalidAttributes[field][0].message;
                 *               Form.validator.updateMessage(field, 'server', msg );
                 *               Form.validator.updateStatus(field, Form.validator.STATUS_INVALID, 'server');
                 *           }
                 *           
                 *        }
                 *   })
                 *   .then(function(data){
                 *       // process successful response
                 *   })
                 * @codeend
                 *
                 * @param {BootstrapValidator} validator The validator plugin instance
                 * @param {jQuery} $field Field element
                 * @param {Object} options Can consist of the following keys:
                 *
                 * @returns {Boolean|Object}
                 */
                validate: function (validator, $field, options) {

                    return true;

                    // return {
                    //     valid: valid,
                    //     message: message
                    // };
                }

            };
            // }(window.jQuery));

        });
});