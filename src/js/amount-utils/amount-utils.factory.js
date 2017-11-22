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
			
			if (!toAdd || toAdd.amount) {
				return amount;
			}
			
			var total = angular.copy(amount);
			
			total.amount = total.amount || {};
			total.amount.initialAmount = NumberUtils.fixedDecimals(total.amount.initialAmount || 0);
			total.amount.finalAmount = NumberUtils.fixedDecimals(total.amount.finalAmount || 0);
			
			total.amount.initialAmount += NumberUtils.fixedDecimals(toAdd.amount.initialAmount);
			total.amount.finalAmount += NumberUtils.fixedDecimals(toAdd.amount.finalAmount);
			
			return total;
		};
		
		$$service.subtract = function(amount, toSubtract) {
			if (!amount) {
				return toSubtract;
			}
			
			if (!toSubtract || !toSubtract.amount) {
				return amount;
			}
			
			var total = angular.copy(amount);
			
			total.amount = total.amount || {};
			total.amount.initialAmount = NumberUtils.fixedDecimals(total.amount.initialAmount || 0);
			total.amount.finalAmount = NumberUtils.fixedDecimals(total.amount.finalAmount || 0);
			
			total.amount.initialAmount -= NumberUtils.fixedDecimals(toSubtract.amount.initialAmount);
			total.amount.finalAmount -= NumberUtils.fixedDecimals(toSubtract.amount.finalAmount);
			
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