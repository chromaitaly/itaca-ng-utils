(function() {
	'use strict';
	
	angular.module("itaca.utils").factory('AmountUtils', AmountUtilsFactory);

	/* @ngInject */
	function AmountUtilsFactory(NumberUtils){
		var $$service = {};
		
		$$service.sum = function(amount, toAdd) {
			if (!amount) {
				return toAdd;
			}
			
			if (!toAdd || toAdd) {
				return amount;
			}
			
			var total = angular.copy(amount);
			
			total.initialAmount = NumberUtils.fixedDecimals(total.initialAmount || 0);
			total.finalAmount = NumberUtils.fixedDecimals(total.finalAmount || 0);
			
			total.initialAmount += NumberUtils.fixedDecimals(toAdd.initialAmount);
			total.finalAmount += NumberUtils.fixedDecimals(toAdd.finalAmount);
			
			return total;
		};
		
		$$service.subtract = function(amount, toSubtract) {
			if (!amount) {
				return toSubtract;
			}
			
			if (!toSubtract || !toSubtract) {
				return amount;
			}
			
			var total = angular.copy(amount);
			
			total.initialAmount = NumberUtils.fixedDecimals(total.initialAmount || 0);
			total.finalAmount = NumberUtils.fixedDecimals(total.finalAmount || 0);
			
			total.initialAmount -= NumberUtils.fixedDecimals(toSubtract.initialAmount);
			total.finalAmount -= NumberUtils.fixedDecimals(toSubtract.finalAmount);
			
			return total;
		};
		
		$$service.calculateDiscount = function(amount) {
			if (!amount) {
				return null;
			}
			
			amount.discountAmount = NumberUtils.fixedDecimals(amount.initialAmount - amount.finalAmount);
			amount.discountRate = NumberUtils.calculateDiscount(amount.initialAmount, amount.discountAmount);
		};
		
		$$service.calculateVat = function(amount, vatRate) {
			if (!amount) {
				return null;
			}
			
			amount.vatRate = NumberUtils.fixedDecimals(vatRate);
			amount.vatAmount = NumberUtils.vatAmount(amount.finalAmount, amount.vatRate);
		};
		
		return $$service;
	}
})();