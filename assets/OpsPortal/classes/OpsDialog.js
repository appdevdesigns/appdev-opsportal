System.import('can').then(function () {
    steal.import(
        'appdev/ad'
        ).then(function () {

            // The OpsPortal will define a global namespace for our added utilities:
            if (typeof AD.op == 'undefined') AD.op = {};

        
            /**
             * @class AD.op.Dialog
             *
             * This is a reusable Dialog tool for interacting with the User.
             *
             *
             */
            AD.op.Dialog = {
                // Instance properties
            
                Confirm: function (opts) {

                    var title = opts.title || 'Confirm';
                    var message = opts.message || 'Are you sure you want to do this?';

                    var labelYes = opts.labelYes || 'yes';
                    var labelNo = opts.labelNo || 'no';

                    var fnYes = opts.fnYes || function () { };
                    var fnNo = opts.fnNo || function () { };


                    bootbox.dialog({
                        title: title,
                        message: message,
                        buttons: {
                            yes: {
                                label: labelYes,
                                className: 'btn-primary',
                                callback: fnYes
                            },
                            no: {
                                label: labelNo,
                                className: 'btn-default',
                                callback: fnNo
                            }
                        }
                    });


                },


                ConfirmDelete: function(opts) {

//// TODO: once we decide to standardize on webix dialogs,
////       remove bootbox, and make this recall
////       AD.op.Dialog.Confirm() with default delete title

                    webix.confirm({
                        title: opts.title || AD.lang.label.getLabel('opp.dialog.confirm.deleteTitle') || "* Confirm Delete",
                        ok: opts.ok || AD.lang.label.getLabel('opp.common.delete') || "* Delete", 
                        cancel: opts.cancel || AD.lang.label.getLabel('opp.common.cancel') || "* Cancel",
                        text: opts.text || opts.message || AD.lang.label.getLabel('opp.dialog.confirm.deleteMsg', ['this']) || "* Are you sure you want to delete this?",
                        callback: function (result) {
                            if (result) {
                                if (opts.fnYes) opts.fnYes();
                            } else {
                                if (opts.fnNo) opts.fnNo();
                            }

                            if (opts.callback) opts.callback(result);
                        }
                    });

                }

            }

        });
});  // end fn() {}