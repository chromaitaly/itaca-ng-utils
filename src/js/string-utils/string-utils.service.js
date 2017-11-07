/**
 * StringUtils: utility per le stringhe.
 * 
 */
(function() {
	'use strict';
	
	angular.module("chroma.utils").factory('StringUtils', StringUtilsFactory);
	
	/* @ngInject */
	function StringUtilsFactory(){
		var service = {};
		
		service.isBlank = function(string) {
			return _.isUndefined(string) || _.isNull(string) || _.isEmpty(string);
		};
		
		service.isNotBlank = function(string) {
			return !service.isBlank(string);
		};
		
		service.isEmpty = function(string) {
			return service.isNotBlank(string) && _.isEmpty(_.trim(string));
		};
		
		service.isNotEmpty = function(string) {
			return !service.isEmpty(string);
		};
		
		service.normalizeForUrl = function(string, useDelimiters) {
			return _.toLower(_.replace(_.deburr(useDelimiters ? _.snakeCase(string) : string), /[^\w]/gi, ''));
		};
		
		return service;
	}
})();