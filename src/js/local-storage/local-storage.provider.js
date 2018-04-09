(function() {
	'use strict';
	
	angular.module("itaca.services").provider('LocalStorage', LocalStorageProvider);
	
	function LocalStorageProvider() {
		var $$reservationStorageName = "X-ITACA-RSV", $$quoteStorageName = "X-ITACA-QUOTE";

		this.setReservationStorageName = function(reservationStorageName) {
			if (!_.isEmpty(reservationStorageName)) {
				$$reservationStorageName = reservationStorageName;
			}
		};
		
		this.setQuoteStorageName = function(quoteStorageName) {
			if (!_.isEmpty(quoteStorageName)) {
				$$quoteStorageName = quoteStorageName;
			}
		};

		this.$get = /* @ngInject */ function(localStorageService) {
			return new LocalStorage(localStorageService, $$reservationStorageName, $$quoteStorageName);
		};
	}
	
	function LocalStorage(localStorageService, reservationStorageName, quoteStorageName) {
		var $$service = this;
	
		this.$$reservationStorageName = reservationStorageName || "X-ITACA-RSV";
		this.$$quoteStorageName = quoteStorageName || "X-ITACA-QUOTE";
		
		this.setReservation = function(reservation) {
			if (!reservation || reservation.step > 3 || reservation.id || !reservation.hotel || !reservation.hotel.id) {
				return false;
			}
			
			var storage = localStorageService.get($$service.$$reservationStorageName);
			if (!_.isPlainObject(storage)) {
				storage = {};
			}
			
			var hotelId = reservation.hotel.id;
			var guestId = reservation.guest ? reservation.guest.id : null;
			
			var hotelStorage = _.isPlainObject(storage[hotelId]) ? storage[hotelId] : {};
			
			reservation.step = reservation.step > 2 ? 2 : reservation.step;
			
			// rimuovo i dati di pagamento
			_.unset(reservation, "payment");
			_.unset(reservation, "paymentMethod");
			_.unset(reservation, "paymentType");
			_.unset(reservation, "bill");
			_.unset(reservation, "billing");
			// rimuovo i dati dell'utente
			_.unset(reservation, "guest");
			
			hotelStorage[guestId || "anonymous"] = reservation;
			storage[hotelId] = hotelStorage;
			
			localStorageService.set($$service.$$reservationStorageName, storage);
			
			return true;
		};
		
		this.getReservation = function(hotelId, guestId) {
			if (!hotelId) {
				return null;
			}
			
			var storage = localStorageService.get($$service.$$reservationStorageName);
			var hotelStorage = storage ? storage[hotelId] : null;
			
			if (hotelStorage) {
				return hotelStorage[guestId || "anonymous"];
			}
					
			return null;
		};
		
		this.removeReservation = function(hotelId, guestId) {
			if (!hotelId) {
				return false;
			}
			
			var storage = localStorageService.get($$service.$$reservationStorageName);
			var hotelStorage = storage ? storage[hotelId] : null;
			
			if (hotelStorage) {
				hotelStorage[guestId || "anonymous"] = undefined;
				storage[hotelId] = hotelStorage;
				localStorageService.set($$service.$$reservationStorageName, storage);
				return true;
			}
			
			return false;
		};
		
		this.setQuote = function(reservation) {
			
			var storage = localStorageService.get($$service.$$quoteStorageName);
			storage = (storage && angular.isObject(storage)) ? storage : {};
			
			if (AppOptions.user && AppOptions.user.id) {
				var userResObj = storage[AppOptions.user.id];
				userResObj = (userResObj && angular.isObject(userResObj)) ? userResObj : {};
				
				// rimuovo i dati di pagamento
				_.unset(reservation, "payment");
				// rimuovo i dati dell'utente
				_.unset(reservation, "guest");
				
				// salvo la prenotazione
				userResObj[AppOptions.hotelId] = reservation;
				
				// aggiorno lo storage
				storage[AppOptions.user.id] = userResObj;
				
				localStorageService.set($$service.$$quoteStorageName, storage);
				
				return true;
			}
			
			return false;
		};
		
		this.getQuote = function() {
			var storage = localStorageService.get($$service.$$quoteStorageName);
			
			if (storage && storage[AppOptions.user.id]) {
				var reservation = storage[AppOptions.user.id][AppOptions.hotelId];
				// convert dates
				DateUtils.convertDateStringsToDates(reservation);
				
				return reservation;
			}		
			
			return {};
		};
		
		this.removeQuote = function() {
			var storage = localStorageService.get($$service.$$quoteStorageName);
			
			if (storage && storage[AppOptions.user.id]) {
				storage[AppOptions.user.id][AppOptions.hotelId] = undefined;
			}
		};
	}
})();