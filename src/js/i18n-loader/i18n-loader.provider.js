/**
 * Custom Loader per angular-translate
 * 
 */
(function() {
	'use strict';
	
	angular.module("itaca.utils").provider('i18nLoader', i18nLoaderProvider);
	
	function i18nLoaderProvider() {
		var $$i18nResources = "/api/rs/public/i18n";
		
		this.setResources = function(resources) {
			if (!angular.isString(resources) && angular.isArray(resources)) {
				return false;
			}
			
			$$i18nResources = resources;
		};

		this.$get = /* @ngInject */ function($log, $http, $q, $interpolate) {
			return new i18nLoader($log, $http, $q, $interpolate, $$i18nResources);
		};
	}
	
	function i18nLoader($log, $http, $q, $interpolate, i18nResources) {
		return function(options) {
	        var urls = [];
	        
	        if (angular.isString(i18nResources)) {
	        	urls.push(i18nResources);
	        
	        } else if (angular.isArray(i18nResources)){
	        	urls = i18nResources;
	        	
	        } else {
	        	return;
	        }
	        
	        var requestParams = {};
	        requestParams[options.queryParameter || 'lang'] = options.key.toLowerCase().replace(/-/g, '_');
	        var interpolateContext = {lang: options.key};
	        
	        var promises = [];
	        
        	_.forEach(urls, function(url) {
        		var langUrl = $interpolate(url)(interpolateContext);
        		
        		var promise = $http.get(langUrl, angular.extend({params: requestParams}, options.$http))
	        		.then(function(result) {
		        		return result.data;
		        		
		        	}, function () {
		        		$log.error("Error getting translations from url: " + langUrl + " - lang: " + options.key + 
		        				" - error: " + response.message);
		        		return $q.reject(options.key);
		        	});
        		
        		promises.push(promise);
        	});
	        
			var deferred = $q.defer();
			
			// combine all translations
			$q.all(promises)
		        .then(function (data) {
		          var length = data.length,
		              mergedData = {};
		
		          for (var i = 0; i < length; i++) {
		            for (var key in data[i]) {
		              mergedData[key] = data[i][key];
		            }
		          }
		
		          deferred.resolve(mergedData);
		        }, function (data) {
		          deferred.reject(data);
		        });
			
			return deferred.promise;
	    };
	}
})();