System.import('appdev').then(function () {
    steal.import(
        'jquery',
        'appdev/ad',
        'appdev/model/model'
        ).then(function () {

            AD.Model.Base.extend('OpsPortalConfig', {
                findAll: 'GET /opsportal/config',
                findOne: 'GET /opsportal/config',
                //        create:  'POST /opsportalconfig/create',
                //        update:  'PUT /opsportalconfig/update/{id}',
                //        destroy: 'DELETE /opsportalconfig/destroy/{id}.json',
                describe: function () {
                    return {
                        "areas": "String",
                        "tools": "String"
                    };
                },
                fieldId: 'id',
                fieldLabel: 'areas'
            }, {
                    model: function () {
                        return AD.models.OpsPortalConfig;
                    },
                    getID: function () {
                        return this.attr(AD.models.OpsPortalConfig.fieldId) || 'unknown id field';
                    },
                    getLabel: function () {
                        return this.attr(AD.models.OpsPortalConfig.fieldLabel) || 'unknown label field';
                    }
                });


        });
});