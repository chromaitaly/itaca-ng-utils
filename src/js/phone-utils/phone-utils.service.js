/**
 * Servizio per i telefoni
 */

(function() {
	'use strict';
	
	angular.module("itaca.utils").provider('PhoneUtils', PhoneUtilsProvider);
	
	function PhoneUtilsProvider() {
		var $dataUrl = "/phone-prefixes.json", $dataObj;

		this.setData = function(data) {
			if (_.isPlainObject(data)) {
				$dataObj = data;
			
			} else if (_.isString(data)) {
				$dataUrl = data;
			}
		};

		this.$get = /* @ngInject */ function($resource, $q, $http, libphonenumber) {
			return new PhoneUtils($resource, $q, $http, libphonenumber, $dataObj || $dataUrl);
		};
	}

	function PhoneUtils($resource, $q, $http, libphonenumber, data) {			
		var $$service = this;
		
		// init prefixes
		this.init = function(){
			$$service.all();
		};
		
		this.all = function() {
			var deferred = $q.defer();
			
			if (_.isPlainObject(data)) {
				$$service.prefixes = data;
				deferred.resolve($$service.prefixes);
			
			} else if (_.isString(data)) {
				$http.get(data).then(function(response){
					$$service.prefixes = response.data.content;
					deferred.resolve($$service.prefixes);
					
				}, function(response) {
					deferred.reject("Error loading phone prefixes");
				});
			}
			
			return deferred.promise;
		};
		
		/**
		 * recupero l'oggetto in base al tipo se il tipo non è specificato lo
		 * recupero dal code
		 */
		this.get = function(value, type){
			if(_.isNil(value)){
				return null;
			}
			
			if(_.isNil(type)){
				type = 'code';
			}
			
			var deferred = $q.defer();
			
			$$service.all().then(function(data) {
				var phoneObj = _.find(data, function(o){
					return o[type] == value;
				});
				
				deferred.resolve(phoneObj);
				
			}, function(error) {
				deferred.reject(error);
			});
			
			return deferred.promise;
		};
		
		/**
		 * compilo il numero di telefono
		 */
		this.compile = function(prefix, number){
			return (prefix || '') + (number || '');
		};
		
		/**
		 * Decompila il numero di telefono e restituisce una promise che viene risolta con l'oggetto decompilato. 
		 * Se il prefisso non viene trovato, la promise restituisce l'oggetto col prefisso estratto direttamente dal numero (se esiste).
		 * <br/>
		 * Es: {
		 * 		prefix: {
		 * 			"name": "Italy",
		 *			"dial_code": "+39",
		 *			"code": "IT"
		 * 		}, 
		 * 		number: "123456789"
		 *	} 
		 */
		this.decompile = function(phone){
			if(!phone){
				return null;
			}
			
			var deferred = $q.defer();
			
			var phoneObj = $$service.decompileSimple(phone);
			
			if(phoneObj.prefix) {
				$$service.get(phoneObj.prefix, 'dial_code').then(function(data) {
					phoneObj.prefix = data;
					deferred.resolve(phoneObj);
					
				}, function(error) {
					deferred.resolve(phoneObj);
				});
				
			} else {
				deferred.resolve(phoneObj);
			}
			
			return deferred.promise;
		};
		
		/**
		 * Decompila il numero di telefono restituendo il relativo oggetto.
		 * <br/>
		 * Es: {prefix: "+39", number: "123456789"} 
		 */
		this.decompileSimple = function(phone){
			if(!phone){
				return null;
			}
			
			var phoneObj = {};
			
			if (!_.isEmpty($$service.prefixes)) {
				var prefix = _.find($$service.prefixes, function(prefix) {
					return phone.startsWith(prefix.dial_code);
				});
				
				if (prefix && prefix.dial_code) {
					phoneObj.prefix = _.trim(prefix.dial_code);
					phoneObj.number = _.trim(phone.substring(phone.indexOf(prefix.dial_code) + prefix.dial_code.length));
					
				} else {
					phoneObj.number = phone;
				}
			} else {
				phoneObj.number = phone;
			}
			
			return phoneObj;
		};
	}
})();