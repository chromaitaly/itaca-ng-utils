/**
 * Converte le date json della response in javascript Date
 * 
 */
(function() {
	'use strict';
	
	angular.module("chroma.utils").factory('jsonDateInterceptor', JsonDateInterceptorFactory);
	
	/* @ngInject */
	function JsonDateInterceptorFactory(DateUtils) {
		var service = {};
		
		service.response = function (response) {
	    	DateUtils.convertDateStringsToDates(response);
	    	
	    	return response;
	    };
		
		return service;
	}
})();