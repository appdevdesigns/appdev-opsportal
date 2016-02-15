System.import('can').then(function () {
    steal.import(
    // List your Controller's dependencies here:
        'can/construct/construct',
        'can/control/control',
        'appdev/ad'
    //        'OpsPortal/models/Projects.js',
    //        'appdev/widgets/ad_delete_ios/ad_delete_ios.js',
    // '//OpsPortal/views/OpsButtonBusy/OpsButtonBusy.ejs',
        ).then(function () {


            // The OpsPortal will define a global namespace for our added utilities:
            if (typeof AD.op == 'undefined') AD.op = {};
    
            /**
             * @class AD.op.ButtonBusy
             * @parent can.Control
             *
             * This is a button controller that lets us show busy spinners on a button
             * while it's operation is in process.
             *
             */
            AD.op.ButtonBusy = can.Control.extend({
                // Static Properties
            }, {

                    // Instance Properties:

                    init: function (element, options) {
                        var _this = this;
                        options = AD.defaults({
                            // templateDOM: '//OpsPortal/views/OpsButtonBusy/OpsButtonBusy.ejs'
                            selectorIcon: '.fa',        // jquery selector for the icon el
                            classBusy: 'fa-spinner',    // the class to add for the spinner
                            shouldDisable: true,        // auto disable on busy() ?
                            onClick: function (ev) { }    // button.click() handler
                        }, options);
                        this.options = options;

                        // Call parent init
                        this._super(element, options);

                        this.dom = {};
                        this.dom.icon = null;       // the icon $element

                        this.busyClass = this.options.classBusy + ' fa-pulse';  // class for spinner


                        this.initDOM();
                    },


                    busy: function (shouldDisable) {

                        this.dom.icon.addClass(this.busyClass);
                        if ((shouldDisable)
                            || (this.options.shouldDisable)) {
                            this.disable();
                        }
                    },


                    disable: function () {
                        this.element.attr('disabled', 'disabled');
                        this.element.addClass('disabled');
                    },


                    enable: function () {
                        this.element.removeAttr('disabled');
                        this.element.removeClass('disabled');
                    },


                    initDOM: function () {
                        var _this = this;


                        // this.element.html(can.view(this.options.templateDOM, {} ));
                        this.dom.icon = this.element.find(this.options.selectorIcon);
                        if (this.dom.icon.length == 0) {
                            console.warn('**** Opsportal.ButtonBusy did not find icon using selector[' + this.options.selectorIcon + ']');
                        } else {
                            this.dom.icon.click(function (ev) {
                                _this.options.onClick(ev);
                            })
                        }

                    },


                    ready: function () {
                        this.dom.icon.removeClass(this.busyClass);
                        this.enable();
                    }



                    // '.ad-item-add click': function ($el, ev) {

                    //     ev.preventDefault();
                    // }


                });
        });
});