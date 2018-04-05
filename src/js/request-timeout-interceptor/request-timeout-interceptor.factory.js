/**
 * Intercetta gli errori di timeout e restituisce un errore leggibile
 * 
 */

(function() {
	'use strict';
	
	angular.module("itaca.utils").factory("requestTimeoutInterceptor", RequestTimeoutInterceptor);
	
	/* @ngInject */
	function RequestTimeoutInterceptor($q, $translate) {
		var $$service = {};
		
		$$service.responseError = function (rejection) {
	    	var deferred = $q.defer();
	    	
	    	if (rejection.data && rejection.data.exception === "java.net.SocketTimeoutException") {
	    		$translate(["error.request.generic", "common.try.again.or.contact.us"]).then(function(messages) {
	    			rejection.data.message = messages["error.request.generic"] + ". " + messages["common.try.again.or.contact.us"];
	    			
	    			deferred.reject(rejection);
	    		});
	    		
	    	} else {
	    		deferred.reject(rejection);
	    	}
	    		
	    	return deferred.promise;
		};
		
		return $$service;
	}
})();
