/**
 * Utility per il profilo
 */
(function() {
	'use strict';
	
	angular.module("chroma.utils").factory('ProfileUtils', ProfileUtilsFactory);
	
	/* @ngInject */
	function ProfileUtilsFactory($rootScope) {
		var service = {};
		
		service.notifyNewProfileImage = function(data) {
			$rootScope.$broadcast("profile-image-updated", data);
		};
		
		service.notifyNewCoverImage = function(data) {
			$rootScope.$broadcast("cover-image-updated", data);
		};
		
		service.notifyLoadProfileImage = function(data) {
			$rootScope.$broadcast("load-image-profile", data);
		};
		
		return service;
	}
})();