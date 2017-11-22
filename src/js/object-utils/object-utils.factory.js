/**
 * Utility per gli oggetti
 * 
 */
(function() {
	'use strict';
	
	angular.module("itaca.utils").factory('ObjectUtils', ObjectUtilsFactory);
	
	/* @ngInject */
	function ObjectUtilsFactory(){
		var service = {};
		
		service.clearObject = function(object, exclusionsRegex) {
			if (!object) {
				return;
			}
			
			var clearObj = _.mapValues(object, function(value, key) {
				if (exclusionsRegex && exclusionsRegex.test(key)) {
					return value;
				}
				
				if (_.isArray(value)) {
				  return [];
				}
				
				return undefined;
			});
			
			_.assign(object, clearObj);
		};
		
		return service;
	}
})();