(function() {
	'use strict';

	angular.module("itaca.utils").factory('textTransform$$service', TextTransformFactory);

	/* @ngInject */
	function TextTransformFactory() {
		var $$service = {};

		$$service.transform = function(element, ngModelController, callBack) {
			element.on('input', function() {
				var modifiedViewValue = callBack(ngModelController.$viewValue);

				ngModelController.$setViewValue(modifiedViewValue);
				ngModelController.$render();
			});
		};

		return $$service;
	}
})();