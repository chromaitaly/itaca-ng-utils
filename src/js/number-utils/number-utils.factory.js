/**
 * NumberUtils: utility per i numeri.
 * 
 */
(function() {
	'use strict';
	
	angular.module("itaca.utils").factory('NumberUtils', NumberUtilsFactory);

	/* @ngInject */
	function NumberUtilsFactory(){
		var $$service = {};
		
		$$service.fixedDecimals = function(number, count) {
			if (!number || number === 0) {
				return 0;
			}
			
			var n = Number(number).toFixed(count || 2);
			return Number(n).valueOf();
		};
		
		/**
		 * Estrae l'ammontare dell'iva dal prezzo (lordo) passato, in base alla
		 * percentuale specificata.
		 * 
		 */
		$$service.vatAmount = function(price, vatRate) {
			return this.fixedDecimals(price - this.taxableAmount(price, vatRate));
		};
		
		/**
		 * Calcola e restituisce il prezzo imponibile (al netto dell'iva) in base
		 * alla percentuale di IVA passata.
		 * 
		 */
		$$service.taxableAmount = function(price, vatRate) {
			return this.fixedDecimals(vatRate ? price/((100 + vatRate)/100) : price);
		};
		
		/**
		 * Calcola lo sconto specificato (discount, discountType) sulla base del
		 * prezzo passato (price) e restituisce il rispettivo valore in percentuale
		 * o prezzo fisso (in base a quello in input). Es: se in input viene passato
		 * uno sconto di tipo PERCENTAGE, verrà restituito il rispettivo valore in
		 * prezzo fisso (PRICE), e viceversa. Se discountType non è specificato, di
		 * default è PRICE.
		 */
		$$service.calculateDiscount = function(price, discount, discountType) {
			if (!price || !discount) {
				return 0;
			}
			
			price = parseFloat(price);
			discount = parseFloat(discount);
			discountType = discountType || "PRICE";		
			
			return $$service.fixedDecimals(discountType == "PERCENTAGE" ? price / 100 * discount : 100 * discount / price);
		};
		
		/**
		 * Restituisce l'importo finale ottenuto applicando lo sconto specificato (discount, discountType) 
		 * al prezzo passato (price). Se discountType non è specificato, di
		 * default è PRICE.
		 */
		$$service.applyDiscount = function(price, discount, discountType) {
			discountType = discountType || "PRICE";
			
			var discountAmount = discountType == "PRICE" ? parseFloat(discount) : $$service.calculateDiscount(price, discount, discountType);
			
			return $$service.fixedDecimals(price - discountAmount);
		};
		
		$$service.uniqueNumber = function() {
		    var date = Date.now();
	
		    // If created at same millisecond as previous
		    if (date <= $$service.uniqueNumber.previous) {
		        date = ++$$service.uniqueNumber.previous;
		    } else {
		    	$$service.uniqueNumber.previous = date;
		    }
	
		    return date;
		};
		
		$$service.uniqueNumber.previous = 0;
		
		$$service.isEven = function(n) {
			return n % 2 == 0;
		};
	
		$$service.isOdd = function(n) {
		   return Math.abs(n % 2) == 1;
		};
		
		/**
		 * Converte in Number il num passato e lo restituisce. Se non è convertibile
		 * in numero (isNaN), restituisce il defaultNum passato, altimenti 0.
		 * 
		 */
		$$service.defaultNumber = function(num, defaultNum) {
			var ret = Number(num);
			
			return isNaN(ret) ? $$service.defaultNumber(defaultNum, 0) : ret;
		};
		
		/**
		 * Minimo comune multiplo tra i numeri contenuti nell'array passato.
		 */
		$$service.lcmArray = function(numArray) {
			if(!_.isArray(numArray) || _.isEmpty(numArray)) {
				return false;
			}
			
			var lcm = numArray[0];
			
			for (var i=1; i < numArray.length; i++) {
				lcm = $$service.lcm(lcm, numArray[i]);
			}
			
			return lcm;
		};
		
		/**
		 * Minimo comune multiplo tra i 2 numeri passati. Se uno dei due non è specificato, restituisce false.
		 */
		$$service.lcm = function(x, y) {
		   if ((typeof x !== 'number') || (typeof y !== 'number')) {
			   return false;
		   }
		   
		  return (!x || !y) ? 0 : Math.abs((x * y) / $$service.gcd(x, y));
		};

		/**
		 * Massimo comun divisore
		 * 
		 */
		$$service.gcd = function gcd(x, y) {
			x = Math.abs(x);
			y = Math.abs(y);
			
			while(y) {
				var t = y;
				y = x % y;
				x = t;
			}
			
			return x;
		};
		
		/**
		 * Formatta i numeri
		 * es: 1000 = 1k, 1000000 = 1M ecc ecc
		 */
		$$service.formatter = function(num, digits) {
			 var si = [
				{ value: 1, symbol: "" },
				{ value: 1E3, symbol: "k" },  //kilo
				{ value: 1E6, symbol: "M" },  //mega
				{ value: 1E9, symbol: "G" },  //giga
				{ value: 1E12, symbol: "T" }, //tera
				{ value: 1E15, symbol: "P" }, //peta
				{ value: 1E18, symbol: "E" }, //exa
			];
			var rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
			var i;
			for (i = si.length - 1; i > 0; i--) {
			   if (num >= si[i].value) {
			      break;
			   }
			}
			return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
		}
		
		return $$service;
	}
})();