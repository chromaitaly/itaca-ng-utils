(function() {
	'use strict';
	
	angular.module("itaca.utils").provider('LocalStorage', LocalStorageProvider);
	
	function LocalStorageProvider() {
		var $$reservationStorageName = "X-ITACA-RSV"

		this.setReservationStorageName = function(reservationStorageName) {
			if (!_.isEmpty(reservationStorageName)) {
				$$reservationStorageName = reservationStorageName;
			}
		};

		this.$get = /* @ngInject */ function(localStorageService) {
			return new LocalStorage(localStorageService, $$reservationStorageName);
		};
	}
	
	function LocalStorage(localStorageService, reservationStorageName) {
		var $$service = this;
	
		this.$$reservationStorageName = reservationStorageName || "X-ITACA-RSV";			
		
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
			
			var storage = localStorageService.get(service.RESERVATION_STORAGE_NAME);
			var hotelStorage = storage ? storage[hotelId] : null;
			
			if (hotelStorage) {
				hotelStorage[guestId || "anonymous"] = undefined;
				storage[hotelId] = hotelStorage;
				localStorageService.set(service.RESERVATION_STORAGE_NAME, storage);
				return true;
			}
			
			return false;
		};
	}
})();