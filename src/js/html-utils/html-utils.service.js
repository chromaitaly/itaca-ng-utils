(function() {
	'use strict';
	
	angular.module("itaca.utils").factory('HtmlUtils', HtmlUtilsFactory);
	
	/* @ngInject */
	function HtmlUtilsFactory($window){
		var service = {};
		
		service.isElementInView = function (el, fullyInView) {
			var element = angular.element(el)[0];
			if(!element){
				return false;
			}
			
		    var pageTop = $window.pageYOffset;
		    var pageBottom = pageTop + $window.innerHeight;
		    var elementTop = element.offsetTop;
		    var elementBottom = elementTop +  element.offsetHeight;
		
		    if (fullyInView === true) {
		        return ((pageTop < elementTop) && (pageBottom > elementBottom));
		    } else {
		        return ((elementTop <= pageBottom) && (elementBottom >= pageTop));
		    }
		};
		
		service.getScrollParent = function(el) {
			var element = angular.element(el)[0];
			
			if (element === null) {
				return null;
			}

			if (element.scrollHeight > element.clientHeight) {
				return element;
			
			} else {
				return service.getScrollParent(element.parentNode);
			}
		};
		
		return service;
	}

})();