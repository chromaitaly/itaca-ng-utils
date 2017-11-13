/**
 * Se la sessione è scaduta, effettua redirect.
 * 
 */
(function() {
	'use strict';
	
	angular.module("itaca.utils").provider('sessionExpiredInterceptor', SessionExpiredInterceptorProvider);
	
	function SessionExpiredInterceptorProvider() {
		var $$redirectUrl = "/login";

		this.init = function(redirectUrl) {
			if (!_.isString(redirectUrl)) {
				return false;
			}
			
			$$redirectUrl = redirectUrl;
		};

		this.$get = /* @ngInject */ function($q) {
		    return new SessionExpiredInterceptor($q, $$redirectUrl);
		};
	}
	
	function SessionExpiredInterceptor($q, redirectUrl) {
		var $$service = this;
		
		this.$$redirectUrl = redirectUrl || "/login";
		
		this.responseError = function (rejection) {
	    	if (rejection.data && rejection.data.status === 401) {
	    		location.assign($$service.$$redirectUrl);
	    	}
	    		
    		return $q.reject(rejection);
		};
	}
})();