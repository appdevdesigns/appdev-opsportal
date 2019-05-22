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
                            var $sendEmailNotifications = self.element.find("input[name='sendEmailNotifications']");
                            var $profileImage = self.element.find("#profile-image-show");
                            var $profileImagePlaceHolder = self.element.find("#profile-image-placeholder");
                            var $previewProfileImage = self.element.find("#preview-profile-image");
                            var $userIcon = $("#op-user-icon");

                            
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
                                $sendEmailNotifications[0].checked = data.user.sendEmailNotifications;
                                if(data.user.image_id) {
                                    $profileImagePlaceHolder.hide();
                                    $profileImage.show();
                                    $profileImage[0].src = '/opsportal/image/UserProfile/'+data.user.image_id;
                                    $previewProfileImage[0].src = '/opsportal/image/UserProfile/'+data.user.image_id;
                                    $userIcon.siblings().hide();
                                    $userIcon.show();
                                    $userIcon[0].src = '/opsportal/image/UserProfile/'+data.user.image_id;
                                }
                                
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

                        // Changing sendEmailNotifications
                        "input[name='sendEmailNotifications'] click": function($el, ev) {
                            var checked = ($el[0].checked) ? 1 : 0;
                            AD.comm.service.post({
                                url: '/site/user/data',
                                params: {
                                    sendEmailNotifications: checked
                                }
                            })
                            .fail(function(err) {
                                webix.message(err.message);
                            });
                        },           
                        
                        '.profile-image-input change': function($el, ev) {
                            var reader = new FileReader();
                            var input = ev.target;
                            reader.onload = function() {
                                var dataUrl = reader.result;
                                var img = document.getElementById('preview-profile-image');
                                img.src = dataUrl;
                            }
                            reader.readAsDataURL(input.files[0]);
                            this.element.find('form.profile-image button').prop('disabled', false);
                        },

                        // upload profile image
                        'form.profile-image button click': function ($el, ev) {
                            var self = this;
                            var $image = this.element.find('#preview-profile-image')[0];
                            var base64String = $image.src.split(",")[1];

                            ev.preventDefault();
                            $el.prop('disabled', true);
                            AD.comm.service.post({
                                url: '/opsportal/imageBase64',
                                params:  { 
                                    'image': base64String,
                                    'appKey': 'UserProfile', 
                                    'permission': '1', 
                                    'isWebix': '', 
                                    'imageParam': ''
                                }
                            })
                            .fail(function(err) {
                                webix.message("error");
                            })
                            .done(function(result) {
                                var $profileImage = self.element.find("#profile-image-show");
                                var $profileImagePlaceHolder = self.element.find("#profile-image-placeholder");
                                var $userIcon = $("#op-user-icon")

                                $profileImagePlaceHolder.hide();
                                $profileImage.show();
                                $profileImage[0].src = '/opsportal/image/UserProfile/'+result.uuid;
                                $userIcon.siblings().hide();
                                $userIcon.show();
                                $userIcon[0].src = '/opsportal/image/UserProfile/'+result.uuid;

                                AD.comm.service.post({
                                    url: '/site/user/updateImage',
                                    params: {
                                        image_id: result.uuid
                                    }
                                })
                                .done(function(result){
                                })
                                .fail(function(err) {
                                    webix.message("error");
                                });
                            })
                            .always(function() {
                                //$el.prop('disabled', false);
                            });
                        },                       

                    });

                });
        });
    });