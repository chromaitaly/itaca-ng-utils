/**
 * Utility per le form
 * 
 */
(function() {
	'use strict';
	
	angular.module("chroma.utils").factory('FormUtils', FormUtilsFactory);
	
	/* @ngInject */
	function FormUtilsFactory($document){
		var service = {};
		
		service.focusFirstInvalid = function(formName) {
			var form = angular.isObject(formName) ? formName : document.getElementsByName(formName)[0];
			if (!form || !angular.isElement(form) || !angular.isFunction(form.querySelector)) return;
					
			var firstInvalid = form.querySelector(".ng-invalid:not([disabled]):not([type='hidden'])");

	        // mette il focus al primo element invalido (se c'è)
	        if (firstInvalid) {
	        	if (_.isEqual(firstInvalid.tagName.toLowerCase(), "ng-form")) {
	        		return service.focusFirstInvalid(firstInvalid);
	        		
	        	} else {
		            firstInvalid.focus();
		            // scrolla fino all'element invalido
		            $document.scrollToElementAnimated(firstInvalid);
		            return true;
	        	}
	        }
	        
	        return false;
		};
		
		service.focusFirstInput = function(formName) {
			var form = angular.isObject(formName) ? formName : document.getElementsByName(formName)[0];
			if (!form || !angular.isElement(form) || !angular.isFunction(form.querySelector)) return;
					
			var firstInput = form.querySelector("input:not([disabled]):not([type='hidden'])");

	        // mette il focus al primo input (se c'è)
	        if (firstInput) {
	        	firstInput.focus();
	            // scrolla fino all'element invalido
	            $document.scrollToElementAnimated(firstInput, service.offset);
	            return true;
	        }
	        
	        return false;
		};
		
		service.isInvalid = function(formName) {
			var form = document[formName];
			if (!form || !angular.isFunction(form.querySelector)) return;
			
			var firstInvalid = form.querySelector('.ng-invalid');

	        if (firstInvalid) {
	            return true;
	        }
	        
	        return false;
		};
		
		return service;	
	}
})();