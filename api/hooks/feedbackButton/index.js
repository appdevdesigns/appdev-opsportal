module.exports = function(sails) {
    return {
        configure: function() {

            // Add CSRF route exclusion
            if (sails.config.csrf) {
                if (typeof sails.config.csrf != 'object') {
                    sails.config.csrf = {
                        grantTokenViaAjax: true,
                        routesDisabled: '',
                    };
                }
                var csrf = sails.config.csrf;
                csrf.routesDisabled = csrf.routesDisabled || '';
                if (Array.isArray(csrf.routesDisabled)) {
                    csrf.routesDisabled = csrf.routesDisabled.join(',');
                }
                
                var feedbackRoute = '/opsportal/feedback';
                if (!csrf.routesDisabled.match(feedbackRoute)) {
                    if (csrf.routesDisabled.length > 0) {
                        csrf.routesDisabled += ',';
                    }
                    csrf.routesDisabled += feedbackRoute;
                }
            }
            
        }
    };
};