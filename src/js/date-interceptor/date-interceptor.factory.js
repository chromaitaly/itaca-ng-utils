/**
 * Converte le date json della response in javascript Date
 * 
 */
(function() {
	'use strict';
	
	angular.module("itaca.utils").factory('DateInterceptor', DateInterceptorFactory);
	
	/* @ngInject */
	function DateInterceptorFactory(DateUtils) {
		var service = {};
		
		service.response = function (response) {
	    	DateUtils.convertDateStringsToDates(response);
	    	
	    	return response;
	    };
	    
	    service.request = function(config) {
	    	DateUtils.convertDatesToUTC(config.data);
	    	
	        return config;
	    };
		
		return service;
	}
})();