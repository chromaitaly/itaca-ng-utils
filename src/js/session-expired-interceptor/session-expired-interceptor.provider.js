/**
 * Se la sessione è scaduta, effettua redirect.
 * 
 */
(function() {
	'use strict';
	
	angular.module("itaca.utils").provider('SessionExpiredInterceptor', SessionExpiredInterceptorProvider);
	
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
			
			var status = rejection.data && rejection.data.status ? rejection.data.status : rejection.status ? rejection.status : null;
			
			if(status){
				switch(status){
					case 401: ctrl.$$dialogNotAutorized(); break;
					case 403: location.assign($$service.$$redirectUrl); break;
				}
			}
			
    		return $q.reject(rejection);
		};
		
		this.$$dialogNotAutorized = function(){
			$translate(['error.401', 'error.code.401']).then(function(translate){
				Dialog.showAlert(null, translate['error.401'],  translate['error.code.401']);
			});
		}
	}
})();