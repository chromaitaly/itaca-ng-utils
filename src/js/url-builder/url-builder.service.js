/**
 * Utility per costruire url.
 * 
 */
(function() {
	'use strict';
	
	angular.module("chroma.utils").factory('UrlBuilder', UrlBuilderFactory);
	
	/* @ngInject */
	function UrlBuilderFactory($httpParamSerializer) {
		var service = {};
	
	    service.buildUrl = function(url, params) {
	        var serializedParams = $httpParamSerializer(params);
	
	        if (serializedParams.length > 0) {
	            url += ((url.indexOf('?') === -1) ? '?' : '&') + serializedParams;
	        }
	
	        return url;
	    };
	    
	    service.withParam = function(url, param, value) {
	    	var search = url.split("?")[1];
	    	
	    	var params = search ? JSON.parse('{"' + search.replace(/&/g, '","').replace(/=/g,'":"') + '"}',
	                function(key, value) { return key==="" ? value : decodeURIComponent(value); }) : {};
	                
	        params[param] = value;
	        
	        return service.buildUrl(url, params);
	    };
	
	    return service;
	}
})();