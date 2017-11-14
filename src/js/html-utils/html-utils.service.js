(function() {
	'use strict';
	
	angular.module("itaca.utils").factory('HtmlUtils', HtmlUtilsFactory);
	
	/* @ngInject */
	function HtmlUtilsFactory($window){
		var $$service = {};
		
		$$service.isElementInView = function (el, fullyInView) {
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
		
		$$service.getScrollParent = function(el) {
			var element = angular.element(el)[0];
			
			if (element === null) {
				return null;
			}

			if (element.scrollHeight > element.clientHeight) {
				return element;
			
			} else {
				return $$service.getScrollParent(element.parentNode);
			}
		};
		
		/**
		 * Compila (tramite lo scope passato o quello del parent) ed aggiunge l'elemento specificato al parent (o, se non esiste, al body) 
		 * come primo (isFirstChild == true) o ultimo figlio, e ne restituisce l'elemento stesso.
		 * 
		 */
		$$service.addElement = function(el, scope, parent, isFirstChild) {
			var parentEl = !parent ? document.body : angular.isElement(parent) ? (parent.length ? parent[0] : parent) : document.querySelector(parent);
			
			if (parentEl) {
				var newElement = $compile(el)(scope || angular.element(parentEl).scope());
				
				if (isFirstChild) {
					parentEl.insertBefore(newElement, parentEl.firstChild);					
				
				} else {
					parentEl.append(newElement);
				}
				
				return angular.element(newElement);
				
			} else {
				return false;
			}
		};
		
		return $$service;
	}

})();