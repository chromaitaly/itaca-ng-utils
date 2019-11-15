/**
 * Se la sessione è scaduta, effettua redirect.
 * 
 */
(function() {
	'use strict';
	
	angular.module("itaca.utils").provider('SessionExpiredInterceptor', SessionExpiredInterceptorProvider);
	
	function SessionExpiredInterceptorProvider() {
		var $$redirectUrl = "/login";
		var $$expiredUrl = "/login?error=expired";

		this.init = function(redirectUrl, expiredUrl) {
			if (!_.isString(redirectUrl)) {
				return false;
			}
			
			$$redirectUrl = redirectUrl;
			$$expiredUrl = expiredUrl;
		};

		this.$get = /* @ngInject */ function($q) {
		    return new SessionExpiredInterceptor($q, $$redirectUrl, $$expiredUrl);
		};
	}
	
	function SessionExpiredInterceptor($q, redirectUrl, expiredUrl) {
		var $$service = this;
		
		this.$$redirectUrl = redirectUrl || "/login";
		this.$$expiredUrl = expiredUrl || "/login?error=expired";
		
		this.responseError = function (rejection) {
			
			var status = rejection.data && rejection.data.status ? rejection.data.status : rejection.status ? rejection.status : null;
			
			if(status){
				switch(status){
					case 401: location.assign($$service.$$expiredUrl); break;
					case 403: location.assign($$service.$$redirectUrl); break;
				}
			}
			
    		return $q.reject(rejection);
		};
	}
})();