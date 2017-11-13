/**
 * Meta-Service per il broadcast del cambio pagina.
 * 
 */
(function() {
	'use strict';
	
	angular.module("itaca.utils").factory('_beforeUnload', BeforeUnloadFactory);
	
	/* @ngInject */
	function BeforeUnloadFactory($rootScope, $window) {
		var unloadEvent = function(e) {
			var confirmation = {};
	        var event = $rootScope.$broadcast('onBeforeUnload', confirmation);
	        if (event.defaultPrevented) {
	            return confirmation.message;
	        }
		};
		
		$window.addEventListener("beforeunload", unloadEvent);
	    
	    $window.onbeforeunload = unloadEvent;
	    
	    $window.onunload = function () {
	        $rootScope.$broadcast('onUnload');
	    };
	    
	    return {};
	}
})();