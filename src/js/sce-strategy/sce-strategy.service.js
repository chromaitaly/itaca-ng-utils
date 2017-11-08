/**
 * Sanitizer provider per angular-translate
 * 
 */
(function() {
	'use strict';
	
	angular.module("chroma.utils").factory('sceStrategy', SceStrategyFactory);
	
	/* @ngInject */
	function SceStrategyFactory($sce) { 
		var sceStrategy = function(value, mode) {
			if (mode === 'text') {
				var result = '';
				result = $sce.trustAsHtml(value);
				
				if (result.$$unwrapTrustedValue) {
					result = result.$$unwrapTrustedValue();
				}
				
				value = result;
			}
			
			return value;
		};
		
		return sceStrategy;
	}
})();