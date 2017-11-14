/**
 * Servizio per i telefoni
 */
(function() {
	'use strict';
	
	angular.module("itaca.utils").provider('LocaleUtils', LocaleUtilsProvider);
	
	function LocaleUtilsProvider() {
		var $$dataUrl = "/locales.json", $$dataObj;

		this.setData = function(data) {
			if (_.isPlainObject(data)) {
				$$dataObj = data;
			
			} else if (_.isString(data)) {
				$$dataUrl = data;
			}
		};

		this.$get = /* @ngInject */ function($q, $http) {
			return new LocaleUtils($q, $http, $$dataObj || $$dataUrl);
		};
	}

	function LocaleUtils($q, $http, data) {			
		var $$service = this;
		
		// init prefixes
		this.init = function(){
			$$service.all();
		};
		
		this.all = function() {
			var deferred = $q.defer();
			
			if (_.isPlainObject(data)) {
				$$service.locales = data;
				deferred.resolve($$service.locales);
			
			} else if (_.isString(data)) {
				$http.get(data).then(function(response){
					$$service.locales = response.data.content;
					deferred.resolve($$service.locales);
					
				}, function(response) {
					deferred.reject("Error loading phone prefixes");
				});
			}
			
			return deferred.promise;
		};
		
		this.get = function(iso2code){
			return _.find($$service.locales, function(o){
				return o['1'] == iso2code;
			});
		};
		
		// init
		this.init();
	}
})();