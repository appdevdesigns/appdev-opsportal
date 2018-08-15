steal(
    // List your Controller's dependencies here:
    'opstools/UserProfile/views/UserProfile/UserProfile.ejs',
    function () {
        AD.ui.loading.resources(12);

        System.import('can').then(function () {
            steal.import(
                'can/construct/construct',
                'can/control/control',
                'appdev/ad',
                'appdev/control/control',
                'OpsPortal/classes/OpsTool',
				'site/labels/opstools-UserProfile'
                ).then(function () {
                    AD.ui.loading.completed(12);
    
                    //
                    // UserProfile 
                    // 
                    // This is the OpsPortal interface for users to change their
                    // own account profile.
                    //



                    // Namespacing conventions:
                    // AD.Control.extend('[application].[controller]', [{ static },] {instance} );
                    AD.Control.OpsTool.extend('UserProfile', { 


                        CONST: {

                        }, 


                        init: function (element, options) {
                            var self = this;
                            options = AD.defaults({
                                    templateDOM: '/opstools/UserProfile/views/UserProfile/UserProfile.ejs'
                            }, options);
                            this.options = options;

                            // Call parent init
                            this._super(element, options);
                            
                            // Text form fields that are being changed
                            this.changedFields = {
                            /*
                                email: true,
                                ...
                            */
                            };

                            this.initDOM();
                            this.loadData();
                            this.translate(); // translate the labels on the tool
                        },



                        initDOM: function () {
                            this.element.html(can.view(this.options.templateDOM, {} ));
                            if (AD.config.getValue('authType') != 'local') {
                                this.element.find('.password-panel').hide();
                            }
                        },



                        loadData: function() {
                            var self = this;
                            var $info = self.element.find('.user-info');
                            var $select = self.element.find('#slang select');
                            var $email = self.element.find("input[name='email']");
                            
                            AD.comm.service.get({
                                url: '/site/user/data'
                            })
                            .fail(function(err) {
                                if (err && err.message) {
                                    webix.message(err.message);
                                }
                                console.error('::: UserProfile.loadData() : error gathering /site/user/data : ', err);
                            })
                            .done(function(data) {
                                /*
                                    data == {
                                        user: {
                                            username: <string>,
                                            languageCode: 'en',
                                            lastLogin: <date>,
                                            email: <string,
                                        },
                                        languageList: [
                                            { code: 'en', label: 'English' },
                                            { code: 'fr', label: 'Français' }
                                        ]
                                    }
                                */
                                
                                $info.find("[name='username']").text(data.user.username);
                                $email.val(data.user.email);
                                
                                // Language selection
                                $select.empty();
                                for (var i=0; i<data.languages.length; i++) {
                                    var lang = data.languages[i];
                                    $select.append('<option value="'+lang.language_code+'">'+lang.language_label+'</option>');
                                }
                                $select.val(data.user.languageCode);
                                
                                self.changedFields = {};

                            });
                            
                        },



                        resize: function(data) {
                            this._super();

                            if ((data) && (data.height)) {

                                // update the containing Div to height
                                // this div is total Height, since it contains the menuBar:
                                this.element.css('height', data.height + 'px');
                            } else {
                                console.warn('UserProfile.resize(): called without a valid data.height provided.');
                            }
                            
                        },


                        
                        // Change password
                        'form.user-password button click': function ($el, ev) {
                            var self = this;
                            var $form = this.element.find('form.user-password');
                            var $alert = $form.find('.alert');
                            
                            ev.preventDefault();
                            $el.prop('disabled', true);
                            AD.comm.service.post({
                                url: '/site/user/changePassword',
                                params: $form.serializeArray()
                            })
                            .fail(function(err) {
                                $alert.html(err.message);
                                $alert.show();
                            })
                            .done(function() {
                                // Clear text boxes
                                $form.find('input').val('');
                                // Hide error message
                                $alert.hide();
                            })
                            .always(function() {
                                $el.prop('disabled', false);
                            });
                        },
                        
                        
                        // Change language
                        '#slang select change': function($el, ev) {
                            var self = this;
                            AD.comm.service.post({
                                url: '/site/user/data',
                                params: {
                                    language: $el.val()
                                }
                            })
                            .fail(function(err) {
                                webix.message(err.message);
                            })
                            .done(function() {
                            
                            });
                        },
                        
                        
                        // Changing email
                        "input[name='email'] change": function($el, ev) {
                            this.changedFields.email = true;
                        },
                        
                        
                        
                        // Save changed email
                        "input[name='email'] blur": function($el, ev) {
                            var self = this;
                            if (this.changedFields.email) {
                                AD.comm.service.post({
                                    url: '/site/user/data',
                                    params: {
                                        email: $el.val()
                                    }
                                })
                                .fail(function(err) {
                                    webix.message(err.message);
                                })
                                .done(function() {
                                    delete self.changedFields.email;
                                });
                            }
                        },


                    });

                });
        });
    });