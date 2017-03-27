module.exports = function(sails) {
    return {
        configure: function() {

            // Add CSRF route exclusion
            if (sails.config.csrf) {
                if (typeof sails.config.csrf != 'object') {
                    sails.config.csrf = {
                        grantTokenViaAjax: true,
                        routesDisabled: [],
                    };
                }
                var csrf = sails.config.csrf;
                csrf.routesDisabled = csrf.routesDisabled || [];
                if (!Array.isArray(csrf.routesDisabled)) {
                    csrf.routesDisabled = [csrf.routesDisabled];
                }
                
                var feedbackRoute = '/opsportal/feedback';
                if (csrf.routesDisabled.indexOf(feedbackRoute) < 0) {
                    csrf.routesDisabled.push(feedbackRoute);
                }
            }
            
        }
    };
};