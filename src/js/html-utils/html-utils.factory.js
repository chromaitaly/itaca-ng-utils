(function() {
	'use strict';
	
	angular.module("itaca.utils").factory('HtmlUtils', HtmlUtilsFactory);
	
	/* @ngInject */
	function HtmlUtilsFactory($window, $compile){
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
		 * come primo (isFirstChild == true) o ultimo figlio, e ne restituisce il relativo scope.
		 * 
		 */
		$$service.addElement = function(el, scope, parent, isFirstChild) {
			var parentEl = !parent ? document.body : angular.isElement(parent) ? (parent.length ? parent[0] : parent) : document.querySelector(parent);
			
			if (parentEl) {
				parentEl = angular.element(parentEl);
				var newElScope = angular.merge(parentEl.scope().$new(true), scope);
				
				var newElement = $compile(el)(newElScope);
				
				if (isFirstChild) {
					parentEl.prepend(newElement);					
				
				} else {
					parentEl.append(newElement);
				}
				
				return newElScope;
				
			} else {
				return false;
			}
		};
		
		return $$service;
	}

})();