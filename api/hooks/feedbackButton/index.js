module.exports = function(sails) {
    return {
        configure: function() {

            // Add CSRF route exclusion
            if (sails.config.csrf) {
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