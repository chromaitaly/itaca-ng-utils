/**
 * Blocca la richiesta se si è offline
 * 
 */
(function() {
	'use strict';
	
	angular.module("itaca.utils").factory('OfflineInterceptor', OfflineInterceptorFactory);
	
	/* @ngInject */
	function OfflineInterceptorFactory($q, $log) {
		var service = {};
		
		service.request = function(config) {
			if (!navigator.onLine) {
				$log.warn("No connection! The request will be aborted: " + config.url);
				
				var canceler = $q.defer();
	
				config.timeout = canceler.promise;
	
				// Canceling request
				canceler.reject();
			}

			return config;
		};
		
		return service;
	}
})();