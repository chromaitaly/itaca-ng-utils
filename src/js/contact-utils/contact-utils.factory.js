/**
 * Restituisce l'href in base il tipo di contatto
 */
(function() {
	'use strict';
	
	angular.module("itaca.utils").factory('ContactUtils', ContactUtilsFactory);
	
	/* @ngInject */
	function ContactUtilsFactory() {		
		var service = {};
		
		service.getUri = function(type, value){
			var uri = '';
			
			switch(type){
				case 'PHONE': uri = 'tel:'; break; 
				case 'MOBILE': uri = 'tel:'; break; 
				case 'FAX': uri = 'tel:'; break; 
				case 'MAIL': uri = 'mailto:'; break; 
				case 'WEBSITE': uri = 'http://'; break; 
				case 'FACEBOOK': uri = 'https://www.facebook.com/'; break; 
				case 'TWITTER': uri = 'https://www.twitter.com/'; break; 
				case 'INSTAGRAM': uri = 'https://www.instagram.com/'; break; 
				default: uri = 'http://';
			}
			
			return uri + value ;
		};
		
		return service;
	}
})();