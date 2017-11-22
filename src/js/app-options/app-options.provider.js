/**
 * Service per le memorizzare la configurazione dell'applicazione.
 * 
 */
(function() {
	'use strict';
	
	angular.module("itaca.utils").provider('AppOptions', AppOptionsProvider);
	
	function AppOptionsProvider() {
		var $$options = {defaultLang: "en", page: {title: "Home"}};

		this.init = function(options, override) {
			if (!_.isPlainObject(options)) {
				return false;
			}
			
			if (_.isBoolean(override) && override) {
				$$options = options;
				
			} else {
				_.assign($$options, options);
			}
		};

		this.$get = /* @ngInject */ function() {
			return new AppOptions($$options);
		};
	}
	
	function AppOptions(options) {
		var $$service = this;
		
		this.$init = function() {
			if (_.isArray(options)) {
				_.forEach(options, function(value, key) {
					$$service.addOption(key, value);
				});
			}
		};

		/**
		 * Aggiunge la propietà 'key' con il valore passato (value).
		 * Se la proprietà già esiste, la aggiorna.
		 * 
		 */
		this.addOption = function(key, value) {
			if (!angular.isString(key)) {
				return false;
			}
			
			$$service[key] = value;
			
			return true;
		};
		
		/**
		 * Aggiunge la propietà 'key' con il valore passato (value).
		 * Se la proprietà già esiste, non la aggiorna e restituisce false.
		 * 
		 */
		this.addOptionStrict = function(key, value) {
			if (!angular.isString(key)) {
				return false;
			}
			
			if ($$service.hasOwnProperty(key)) {
				return false;
			}
			
			$$service[key] = value;
			
			return true;
		};
		
		/**
		 * Aggiorna la proprietà 'key' con il valore passato (value) e ne restituisce il valore precedente. 
		 * Se la proprietà non esiste, la aggiunge.
		 * 
		 */
		this.updateOption = function(key, value) {
			if (!angular.isString(key)) {
				return false;
			}
			
			if (!$$service.hasOwnProperty(key)) {
				return $$service.addOption(key, value);
			}
			
			var previous = $$service[key];
			
			$$service[key] = value;
			
			return previous;
		};
		
		// init
		this.$init();
	}
})();