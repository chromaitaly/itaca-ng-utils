/**
 * Utility per le prenotazioni
 * 
 */
(function() {
	'use strict';
	
	angular.module("itaca-utils").factory('ReservationUtils', ReservationUtilsFactory);
	
	/* @ngInject */
	function ReservationUtilsFactory($translate, NumberUtils, AmountUtils, ObjectUtils, DateUtils, LocalStorage, RESERVATION){
		var $$service = {};
		
		$$service.reservationSourceOptions = {
			'PHONE': {defaultColor: "#ea80fc"},		
			'EMAIL': {defaultColor: "#d500f9"},	
			'PORTAL': {defaultColor: "#8e24aa"},	
			'BOOKING': {defaultColor: "#3f51b5"},	
			'EXPEDIA': {defaultColor: "#ffc107"},	
			'AIRBNB': {defaultColor: "#f44336"},
			'AGODA': {defaultColor: "#009688"},	
			'AMADEUS': {defaultColor: "#00bcd4"},
			'SABRE': {defaultColor: "#e91e63"},
			'GALILEO': {defaultColor: "#795548"},
			'WORLDSPAN': {defaultColor: "#18ffff"},
			'DHISCO': {defaultColor: "#ffd180"},
			'EDREAMS': {defaultColor: "#2196f3"},
			'GOVOYAGES': {defaultColor: "#ff1744"},
			'OPODO': {defaultColor: "#8bc34a"},
			'TRAVELLINK': {defaultColor: "#00838f"},
			'LILIGO': {defaultColor: "#cddc39"},
			'OTHER': {defaultColor: "#c5cae9"}
		};
		
		$$service.clearReservation = function(reservation, keepSearchParams) {
			if (keepSearchParams) {
				ObjectUtils.clearObject(reservation, /^(check(?:in$|out$))|^people$|^requestPeople$|^hotelId$|^hotel$/);
			} else {
				ObjectUtils.clearObject(reservation);
			}
		};
		
		$$service.storeLastReservation = function() {
			return LocalStorage.setReservation(RESERVATION);
		};
		
		$$service.loadLastReservation = function(hotelId, guestId) {
			var lastHotelRes = LocalStorage.getReservation(hotelId, guestId);
			
			if (!lastHotelRes) {
				lastHotelRes = _.mapValues(RESERVATION, function(value) {
					if (_.isArray(value)) {
					  return [];
					}
					
					return undefined;
				});
			}
			
			DateUtils.convertDateStringsToDates(lastHotelRes);
			
			if (lastHotelRes && lastHotelRes.checkin && lastHotelRes.checkout && moment(lastHotelRes.checkin).isBefore(moment(), "days")) {
				// se il checkin della prenotazione salvata è precendente ad oggi, la azzero
				$$service.clearReservation(lastHotelRes);
				LocalStorage.removeReservation(hotelId, guestId);
			}
			
			return lastHotelRes;
		};
		
		$$service.removeLastReservation = function(hotelId, guestId) {
			if (!hotelId) {
				hotelId = RESERVATION.hotel && RESERVATION.hotel.id ? RESERVATION.hotel.id : null; 
			}
			
			if (!guestId) {
				guestId = RESERVATION.guest && RESERVATION.guest.id ? RESERVATION.guest.id : null; 
			}
			
			return LocalStorage.removeReservation(hotelId, guestId);
		};
		
		$$service.availableNights = function(checkin, checkout, targetDate) {
			if (!checkin || !checkout) {
				return null;
			}
			
			var checkinMoment = moment(checkin);
			var checkoutMoment = moment(checkout);
			// se targetDate è false vale il checkin, altrimenti la data passata o,
			// se null, la data odierna
			var targetMoment = _.isBoolean(targetDate) && !targetDate ? moment(checkin) : targetDate ? moment(targetDate) : moment();
			
			if (checkoutMoment.isAfter(targetMoment, "days") && checkinMoment.isBefore(targetMoment, "days")) {
				// se la prenotazione è già iniziata e non è trascorsa, conto i
				// giorni da oggi al checkout
				return DateUtils.diff(targetMoment, checkoutMoment);
			
			} else {
				return DateUtils.diff(checkinMoment, checkoutMoment);
			}
		};
		
		$$service.calculateGuestDocuments = function(room){
			room.identityDocuments = (room.identityDocuments && room.identityDocuments.length > 0) ? room.identityDocuments : [];
			
			room.guestsCount = $$service.guestsCount(room.people, room.extraPeople);
			
			var totalGuest = parseInt(room.guestsCount.total);
			
			if(_.size(room.identityDocuments) > totalGuest) {
				room.identityDocuments = _.dropRight(room.identityDocuments, _.size(room.identityDocuments) - totalGuest);

			} else if(_.size(room.identityDocuments) < totalGuest) {

				var newGuests = totalGuest - _.size(room.identityDocuments);
				for(var i=0; i < newGuests; i++){
					room.identityDocuments.push({});
				}
			}
		};
		
		$$service.normalizePeople = function(people) {
			if (!_.isPlainObject(people)) {
				people = {};
			}
			
			people.adults = NumberUtils.defaultNumber(people.adults);
			people.boys = NumberUtils.defaultNumber(people.boys);
			people.children = NumberUtils.defaultNumber(people.children);
			people.kids = NumberUtils.defaultNumber(people.kids);
			
			return people;		
		};
		
		$$service.peopleSummary = function(peopleObj, extraPeopleObj) {
			if (!peopleObj) {
				peopleObj = {};
			}
			
			if(!extraPeopleObj){
				extraPeopleObj = {};
			}
			
			var guestsCount = $$service.guestsCount(peopleObj, extraPeopleObj);
			
			if(!guestsCount && guestsCount.total <= 0) {
				return $translate('people.none').then(function(message){
					return message;
				});
				
			} else {			
				return $translate(['people.adult','people.adults','people.child','people.children','people.boy','people.boys','people.kid','people.kids']).then(function(translations) {
				    var peopleSummary = '';
				    
				    var hasAdults = peopleObj.adults > 0 || extraPeopleObj.adults > 0;
					if (hasAdults){
						var adults = parseInt(peopleObj.adults || 0) + parseInt(extraPeopleObj.adults || 0);
						
						if(adults > 0){
							peopleSummary += adults +' '+ (adults < 2 ? translations['people.adult'] : translations['people.adults']);
						}
					}
					
					var hasBoys = peopleObj.boys > 0 || extraPeopleObj.boys > 0;
					if (hasBoys){
						var boys = parseInt(peopleObj.boys || 0) + parseInt(extraPeopleObj.boys || 0);
	
						if(boys > 0){
							peopleSummary += hasAdults ? ', ' : '';
							peopleSummary += boys +' '+ (boys < 2 ? translations['people.boy'] : translations['people.boys']);
						}
					}
					
					var hasChildren = peopleObj.children > 0 || extraPeopleObj.children > 0;
					if (hasChildren){
						var children = parseInt(peopleObj.children || 0) + parseInt(extraPeopleObj.children || 0);
						
						if(children > 0){
							peopleSummary += (hasAdults || hasBoys) ? ', ' : '';
							peopleSummary += children +' '+ (children < 2 ? translations['people.child'] : translations['people.children']);
						}
					}
					
					if(peopleObj.kids > 0 || extraPeopleObj.kids > 0){
						var kids = parseInt(peopleObj.kids || 0) + parseInt(extraPeopleObj.kids || 0);
						
						if(kids > 0){
							peopleSummary += (hasAdults || hasBoys || hasChildren) ? ', ' : '';
							peopleSummary += kids +' '+ (kids < 2 ? translations['people.kid'] : translations['people.kids']);
						}
					}
					
					return peopleSummary.toLowerCase();
				 });
			}
		};
		
		$$service.peopleByBeds = function(beds) {
			var people = {
				adults: 0,
				boys: 0,
				children: 0,
				kids: 0
			};

			_.forEach(beds, function(bed) {
				if (!bed.people) return;
					
				// persone extra
				var bedPeople = bed.people;
				
				// adulti
				if(bedPeople.adults){
					people.adults = people.adults ? parseInt(people.adults) + parseInt(bedPeople.adults) : parseInt(bedPeople.adults); 
				}
				
				// ragazzi
				if (bedPeople.boys) {
					people.boys = people.boys ? parseInt(people.boys) + parseInt(bedPeople.boys) : parseInt(bedPeople.boys);  
				}
				
				// bambini
				if (bedPeople.children) {
					people.children = people.children ? parseInt(people.children) + parseInt(bedPeople.children) : parseInt(bedPeople.children);  
				}
				
				// neonati
				if (bedPeople.kids) {
					people.kids = people.kids ? parseInt(people.kids) + parseInt(bedPeople.kids) : parseInt(bedPeople.kids);
				}
			});
			
			return people;
		};
		
		// somma di tutti gli ospiti
		$$service.guestsCount = function(people, extraPeople) {
			people = $$service.normalizePeople(people);
			extraPeople = $$service.normalizePeople(extraPeople);
			
			var standard = 0, hasAdults = false, hasChildren = false;
			if(!_.isNil(people.adults) && people.adults > 0){
				hasAdults = true;
				standard += parseInt(people.adults);
			}
			if(!_.isNil(people.boys) && people.boys > 0){
				hasChildren = true;
				standard += parseInt(people.boys);
			}
			if(!_.isNil(people.children) && people.children > 0){
				hasChildren = true;
				standard += parseInt(people.children);
			}
			if(!_.isNil(people.kids) && people.kids > 0){
				hasChildren = true;
				standard += parseInt(people.kids);
			}
			
			var extra = 0, extraHasAdults = false, extraHasChildren = false;
			if(!_.isNil(extraPeople.adults) && extraPeople.adults > 0){
				extraHasAdults = true;
				extra += parseInt(extraPeople.adults);
			}
			if(!_.isNil(extraPeople.boys) && extraPeople.boys > 0){
				extraHasChildren = true;
				extra += parseInt(extraPeople.boys);
			}
			if(!_.isNil(extraPeople.children) && extraPeople.children > 0){
				extraHasChildren = true;
				extra += parseInt(extraPeople.children);
			}
			if(!_.isNil(extraPeople.kids) && extraPeople.kids > 0){
				extraHasChildren = true;
				extra += parseInt(extraPeople.kids);
			}
			
			return {
				standard: standard,
				hasAdults: hasAdults,
				hasChildren: hasChildren,
				extra : extra,
				extraHasAdults: extraHasAdults,
				extraHasChildren: extraHasChildren,
				total : standard + extra
			};
		};
			
		$$service.guestsCountByRooms = function(rooms, checkBeds) {
			if (!rooms || !_.isArray(rooms)) {
				return false;
			}
			
			return $$service.guestsCount($$service.peopleByRooms(rooms, checkBeds), $$service.extraPeopleByRooms(rooms, checkBeds));
		};
		
		$$service.guestsCountByBeds = function(standardBeds, otherBeds, maxOtherBeds){
			var standard = 0;
			var extra = 0;
			var extraHasAdults = false;
			var extraHasChildren = false;
			
			// calcolo persone nei letti principali
			if (standardBeds && angular.isArray(standardBeds)) {
				_.forEach(standardBeds, function(bed){
					standard += bed.maxPerson * bed.count;
				});
			} 
			
			// calcolo persone massime nei letti aggiuntivi
			if(otherBeds && otherBeds.length){
				maxOtherBeds = maxOtherBeds || 0;
				
				var workingArr = angular.copy(otherBeds);
				var remaining = parseInt(maxOtherBeds);
				
				while (remaining) {
					// letto con capienza maggiore
					var maxPaxBed = _.maxBy(workingArr, "maxPerson");
					
					if (!maxPaxBed) break;
					
					// rimuovo letto dalla lista
					_.pull(workingArr, maxPaxBed);
					
					var toAdd = (remaining - maxPaxBed.count) >= 0 ? maxPaxBed.count : remaining;
					
					extra += maxPaxBed.maxPerson * toAdd;
					
					remaining -= toAdd;
					
					// controllo se ha adulti
					if (!extraHasAdults) {
						extraHasAdults = maxPaxBed.people != null && maxPaxBed.people.adults;
					}

					// controllo se ha ragazzi, bambini e/o neonati
					if (!extraHasChildren) {
						extraHasChildren = maxPaxBed.people && (maxPaxBed.people.boys || maxPaxBed.people.children || maxPaxBed.people.kids);
					}
				}
			}
			
			return {
				standard: standard,     
				extra: extra,                      
				extraHasAdults: extraHasAdults,
				extraHasChildren: extraHasChildren,
				partial: standard + extra
			};
		};
		
		$$service.totalPeople = function(people, extraPeople) {
			people = $$service.normalizePeople(people);
			extraPeople = $$service.normalizePeople(extraPeople);
			
			return {
				adults: people.adults + extraPeople.adults,
				boys: people.boys + extraPeople.boys,
				children: people.children + extraPeople.children,
				kids: people.kids + extraPeople.kids
			};
		};
		
		$$service.totalPeopleByRooms = function(rooms, checkBeds) {
			return $$service.totalPeople($$service.peopleByRooms(rooms, checkBeds), $$service.extraPeopleByRooms(rooms, checkBeds));
		};
		
		$$service.peopleByRooms = function(rooms, checkBeds) {
			var people = {
				adults: 0,
				boys: 0,
				children: 0,
				kids: 0
			};
			
			_.forEach(rooms, function(room, index, collection) {
				var roomPeople = angular.copy(room.people || {});
				if (checkBeds && !_.isEmpty(room.beds)) {
					// conteggio persone in base ai letti
					roomPeople.adults = 0;
					roomPeople.boys = 0;
					roomPeople.children = 0;
					roomPeople.kids = 0;
					
					_.forEach(room.beds, function(bed) {
						// adulti
						roomPeople.adults = parseInt(bed.people.adults) ? roomPeople.adults + parseInt(bed.people.adults) : roomPeople.adults;
						// ragazzi
						roomPeople.boys = parseInt(bed.people.boys) ? roomPeople.boys + parseInt(bed.people.boys) : roomPeople.boys;
						// bambini
						roomPeople.children = parseInt(bed.people.children) ? roomPeople.children + parseInt(bed.people.children) : roomPeople.children;
						// neonati
						roomPeople.kids = parseInt(bed.people.kids) ? roomPeople.kids + parseInt(bed.people.kids) : roomPeople.kids;
					});
				}
				
				// adulti
				people.adults = parseInt(roomPeople.adults) ? people.adults + parseInt(roomPeople.adults) : people.adults;
				// ragazzi
				people.boys = parseInt(roomPeople.boys) ? people.boys + parseInt(roomPeople.boys) : people.boys;
				// bambini
				people.children = parseInt(roomPeople.children) ? people.children + parseInt(roomPeople.children) : people.children;
				// neonati
				people.kids = parseInt(roomPeople.kids) ? people.kids + parseInt(roomPeople.kids) : people.kids;
			});
			
			return people;
		};
		
		$$service.extraPeopleByRooms = function(rooms, checkBeds) {
			var people = {
				adults: 0,
				boys: 0,
				children: 0,
				kids: 0
			};
			
			_.forEach(rooms, function(room, index, collection) {
				// persone extra
				var roomExtraPeople = angular.copy(room.extraPeople || {});
				
				// conteggio persone in base ai letti
				if (checkBeds && !_.isEmpty(room.otherBeds)) {
					roomExtraPeople.adults = 0;
					roomExtraPeople.boys = 0;
					roomExtraPeople.children = 0;
					roomExtraPeople.kids = 0;
					
					_.forEach(room.otherBeds, function(bed) {
						// adulti
						roomExtraPeople.adults = parseInt(bed.people.adults) ? roomExtraPeople.adults + parseInt(bed.people.adults) : roomExtraPeople.adults;
						// ragazzi
						roomExtraPeople.boys = parseInt(bed.people.boys) ? roomExtraPeople.boys + parseInt(bed.people.boys) : roomExtraPeople.boys;
						// bambini
						roomExtraPeople.children = parseInt(bed.people.children) ? roomExtraPeople.children + parseInt(bed.people.children) : roomExtraPeople.children;
						// neonati
						roomExtraPeople.kids = parseInt(bed.people.kids) ? roomExtraPeople.kids + parseInt(bed.people.kids) : roomExtraPeople.kids;
					});
				}
				
				if(roomExtraPeople){
					// adulti
					people.adults = parseInt(roomExtraPeople.adults) ? people.adults + parseInt(roomExtraPeople.adults) : people.adults;
					// ragazzi
					people.boys = parseInt(roomExtraPeople.boys) ? people.boys + parseInt(roomExtraPeople.boys) : people.boys;
					// bambini
					people.children = parseInt(roomExtraPeople.children) ? people.children + parseInt(roomExtraPeople.children) : people.children;
					// neonati
					people.kids = parseInt(roomExtraPeople.kids) ? people.kids + parseInt(roomExtraPeople.kids) : people.kids;
				}
			});
			
			return people;
		};
		
		/**
		 * Genera le persone in base a quelle passate (currentPeople) e al numero
		 * massimo specificato per ogni categoria (maxPeople). Se specificato,
		 * maxCount rappresenta il numero massimo di persone totali (sommando tutte
		 * le categorie).
		 * 
		 */
		$$service.peopleByMax = function(currentPeople, maxPeople, maxCount) {
			if (!currentPeople && !maxPeople) {
				return {};
			}
			
			if (!currentPeople) {
				return maxCount > 0 ? $$service.peopleByMax(maxPeople, {adults: maxCount}, maxCount) : angular.copy(maxPeople);
			}
			
			if (!maxPeople) {
				return maxCount > 0 ? $$service.peopleByMax(currentPeople, {adults: maxCount}, maxCount) : angular.copy(currentPeople);
			}
			
			var max = maxCount;
			if (!max) {
				max = -1;
			}
			
			// adults
			var	adults = _.isNil(currentPeople.adults) ? 0 : _.isNil(maxPeople.adults) ? currentPeople.adults : (currentPeople.adults <= maxPeople.adults ? currentPeople.adults : maxPeople.adults);
			if (max >= 0) {
				adults = adults <= max ? adults : max;
				max -= adults;			
			}
			// boys
			var boys = _.isNil(currentPeople.boys) ? 0 : _.isNil(maxPeople.boys) ? currentPeople.boys : (currentPeople.boys <= maxPeople.boys ? currentPeople.boys : maxPeople.boys);
			if (max >= 0) {
				boys = boys <= max ? boys : max;
				max -= boys;			
			}
			// children
			var children = _.isNil(currentPeople.children) ? 0 : _.isNil(maxPeople.children) ? currentPeople.children : (currentPeople.children <= maxPeople.children ? currentPeople.children : maxPeople.children);
			if (max >= 0) {
				children = children <= max ? children : max;
				max -= children;			
			}
			// kids
			var kids = _.isNil(currentPeople.kids) ? 0 : _.isNil(maxPeople.kids) ? currentPeople.kids : (currentPeople.kids <= maxPeople.kids ? currentPeople.kids : maxPeople.kids);
			if (max >= 0) {
				kids = kids <= max ? kids : max;
				max -= kids;			
			}
			
			return {
				adults: adults,
				boys: boys,
				children: children,
				kids: kids
			};
		};
		
		$$service.peopleAvailability = function(maxPeople, currentPeople, maxCount) {
			maxPeople = $$service.normalizePeople(maxPeople);
			if ($$service.guestsCount(maxPeople).standard <= 0) {
				maxPeople = angular.copy(currentPeople);
			}
			
			currentPeople = $$service.normalizePeople(currentPeople);
			
			var currentCount = $$service.guestsCount(currentPeople).standard;
			
			var currentAv = maxCount ? parseInt(maxCount) - currentCount : currentCount;
			
			var peopleAvailability = {adults:0, boys:0, children:0, kids:0};
			
			// adults
			for(var i=1; i <= parseInt(maxPeople.adults || 0); i++) {
				currentPeople.adults = currentPeople.adults || 0;
				var	disabled = (i <= currentPeople.adults) ? false : (currentAv + currentPeople.adults - i < 0);
				if(!disabled){
					peopleAvailability.adults = i;
				}
			}
			
			// boys
			for(var i=1; i <= parseInt(maxPeople.boys || 0); i++) {
				currentPeople.boys = currentPeople.boys || 0;
				var	disabled = (i <= currentPeople.boys) ? false : (currentAv + currentPeople.boys - i < 0);
				if(!disabled){
					peopleAvailability.boys = i;
				}
			}
			
			// children
			for(var i=1; i <= parseInt(maxPeople.children || 0); i++) {
				currentPeople.children = currentPeople.children || 0;
				var	disabled = (i <= currentPeople.children) ? false : (currentAv + currentPeople.children - i < 0);
				if(!disabled){
					peopleAvailability.children = i;
				}
			}
			
			// kids
			for(var i=1; i <= parseInt(maxPeople.kids || 0); i++) {
				currentPeople.kids = currentPeople.kids || 0;
				var	disabled = (i <= currentPeople.kids) ? false : (currentAv + currentPeople.kids - i < 0);
				if(!disabled){
					peopleAvailability.kids = i;
				}
			}
			
			return peopleAvailability;
		};
		
		$$service.bedsAvailability = function(maxBeds, currentBeds, maxCount, checkZero) {
			var bedsAvailability = [];
			
			// inserisco i letti già aggiunti
			_.forEach(currentBeds, function(bedSold) {
				var newBed = angular.copy(bedSold);
				newBed.uid = newBed.uid || NumberUtils.uniqueNumber();
				newBed.$$available = false;
				newBed.$$blocked = false;
				newBed.$$editing = false;
				// inserisco il letto nella lista
				bedsAvailability.push(newBed);
			});
			
			// inserisco tutti gli altri letti mancanti
			if(maxBeds && !_.isEmpty(maxBeds)){
				_.forEach(maxBeds, function(bed){
					var n = 0;
					do {
						// letti di questo tipo già aggiunti
						var added = _.filter(bedsAvailability, function(b) {
							return (b.bed || b).type == bed.type;
						});
						
						n = _.size(added);
	
						// se sono stati già inseriti tutti i letti di questo tipo vado al prossimo
						if ((checkZero && n <= 0) || n >= bed.count) {
							return;
						}
						
						var newBed = angular.copy(bed);
						newBed.uid = NumberUtils.uniqueNumber();
						newBed.$$available = true;
						newBed.$$blocked = _.size(currentBeds) >= maxCount;
						
						// inserisco il letto nella lista
						bedsAvailability.push(newBed);
					} while (n < bed.count);
				});
			}
			
			return bedsAvailability;
		};
		
		$$service.$generateRoomIncludedServices = function(roomType, peopleObj, nights, initialServices) {
			var includedServices = [];
			_.forEach(_.filter(roomType.services, ['bookability', 'INCLUDED']), function(s) {
				includedServices.push($$service.serviceSold(s, peopleObj, nights, 1));
			});
			
			return _.unionBy(initialServices || [], includedServices, "service.id");
		};
		
		$$service.$generateRoomIncludedBeds = function(roomType, peopleObj, nights, vatRate, initialBeds) {
			var beds = initialBeds || [], count = 0;
			var remainingPeople =  $$service.normalizePeople(angular.copy(peopleObj));
			var guestsCount = $$service.guestsCount(remainingPeople);
			
			_.forEach(roomType.beds, function(bed){
				// se sono stati inseriti tutte le persone o tutti i letti, interrompo
//				if (guestsCount.standard <= 0 || roomType.bedCount <= count) {
//					return false;
//				}
				
				var n = 0;

				do {
					// letti di questo tipo già aggiunti
					var added = _.filter(beds, function(b) {
						return b.bed.type == bed.type;
					});
					
					n = _.size(added);

					// se sono stati già inseriti tutti i letti di questo tipo vado al prossimo
					if (n >= bed.count) {
						return;
					}
					
					var newBed = angular.copy(bed);
					newBed.uid = NumberUtils.uniqueNumber();
					
					// genero le persone da inserire nel letto
					var people = $$service.peopleByMax(remainingPeople, newBed.people, newBed.maxPerson);					
					// inserisco il letto nella lista
					beds.push($$service.bedSold(newBed, people, nights, vatRate));
					count++;
					
					// aggiorno persone rimanenti
					remainingPeople.adults = remainingPeople.adults - (people.adults || 0);
					remainingPeople.boys = remainingPeople.boys - (people.boys || 0);
					remainingPeople.children = remainingPeople.children - (people.children || 0);
					remainingPeople.kids = remainingPeople.kids - (people.kids || 0);

					// conteggio persone rimanenti
					guestsCount = $$service.guestsCount(remainingPeople)
					
				} while (guestsCount.standard > 0 && n < bed.count);
			});
			
			return beds;
		};
		
		$$service.roomSold = function(roomType, rateSold, vatRate, peopleObj, extraPeopleObj, beds, otherBeds, services, status){
			if(!rateSold || !roomType || !vatRate){
				return {};
			}
			
			var nights = DateUtils.diff(rateSold.startDate, rateSold.endDate);
			
			var guestsCount = $$service.guestsCount(peopleObj, extraPeopleObj);
			if (!guestsCount.standard) {
				peopleObj = {adults: 1, boys: 0, children: 0, kids: 0};
				guestsCount = $$service.guestsCount(peopleObj, extraPeopleObj);
			}
			
			if (!guestsCount.extra) {
				extraPeopleObj = $$service.peopleByBeds(otherBeds);
				guestsCount = $$service.guestsCount(peopleObj, extraPeopleObj);
			}
			
			var roomSold = {
				type: roomType,
				totalRate: rateSold,
				// deprecato
//				cancellationPolicy: rateSold.cancellationPolicy ? rateSold.cancellationPolicy : null,
				// deprecato
//				noShowPolicy: rateSold.noShowPolicy ? rateSold.noShowPolicy : null,
				status: status || "CONFIRMED",
				people: peopleObj,
				extraPeople: extraPeopleObj,
				guestsCount: guestsCount,
				services: $$service.$generateRoomIncludedServices(roomType, peopleObj, nights, services),
				beds: $$service.$generateRoomIncludedBeds(roomType, peopleObj, nights, vatRate, beds),
				otherBeds: otherBeds || [],
				creationDate: new Date()
			};
			
			/* includo l'iva pagata nell'amount */
			AmountUtils.calculateVat(roomSold.totalRate.amount, vatRate);
			
			return roomSold;
		};
		
		$$service.serviceSold = function(service, peopleObj, nights, count) {
			if (!service) {
				return {};
			}
			
			// se maxcount non esiste lo imposto a 1
			if(!service.maxCount){
				service.maxCount = 1;
			}
			
			// numero di volte che viene prenotato questo servizio
			if(!count){
				count = 1;
			}
			
			// se count è magiore di maxcount e maxCount non può essere prenotato
			// all'infinito
			if(count > service.maxCount && service.maxCount != -1){
				count = service.maxCount;
			}
			
			// se non ci sono le persone
			if(!peopleObj){
				peopleObj = {adults:0, boys: 0, kids: 0, children: 0};
			}
			
			var duration = moment.duration(nights, 'days');
			
			var amount = {
				type: "PRICE",
				currency: "EUR",
				initialAmount: 0,
				finalAmount: 0,
				vatRate: 0,
				vatAmount: 0,
			};
			
			switch(service.paymentType) {
			case "SINGLE":
				var opt = service.paymentOptions[0];
				
				switch(service.frequency) {
				case "LUMP_SUM": 
					amount.finalAmount = opt.amount.finalAmount;
					break;
				case "DAILY":
					amount.finalAmount = opt.amount.finalAmount * nights; 
					break;
				case "MONTHLY":
					amount.finalAmount = opt.amount.finalAmount * Math.ceil(duration.asMonths());
					break;
				case "YEARLY":
					amount.finalAmount = opt.amount.finalAmount * Math.ceil(duration.asYears());
					break;
				}
				
				amount.vatRate = opt.amount.vatRate;
							
				break;
			case "PER_PERSON":
				_.forEach(service.paymentOptions, function(opt) {
					var price = 0;
					
					// prezzo per persona
					switch(opt.size) {
					case "PER_ADULT":
						if (peopleObj.adults) {
							price = opt.amount.finalAmount * peopleObj.adults;
							amount.vatRate = (amount.vatRate && amount.vatRate > opt.amount.vatRate) ? amount.vatRate :  opt.amount.vatRate;
						}
						break;
					case "PER_BOY":
						if (peopleObj.boys) {
							price = opt.amount.finalAmount * peopleObj.boys;
							amount.vatRate = (amount.vatRate && amount.vatRate > opt.amount.vatRate) ? amount.vatRate :  opt.amount.vatRate;
						}
						break;
					case "PER_CHILD":
						if (peopleObj.children) {
							price = opt.amount.finalAmount * peopleObj.children;
							amount.vatRate = (amount.vatRate && amount.vatRate > opt.amount.vatRate) ? amount.vatRate :  opt.amount.vatRate;
						}
						break;
					case "PER_KID":
						if (peopleObj.kids) {
							price = opt.amount.finalAmount * peopleObj.kids;
							amount.vatRate = (amount.vatRate && amount.vatRate > opt.amount.vatRate) ? amount.vatRate :  opt.amount.vatRate;
						}
						break;
					}
					
					// moltiplico per frequenza
					switch(service.frequency) {
					case "DAILY":
					case "NIGHTLY":
						price = price * nights;
						break;
					case "MONTHLY":
						price = price * Math.ceil(duration.asMonths());					
						break;
					case "YEARLY":
						price = price * Math.ceil(duration.asYears());
						break;
					}
					
					amount.finalAmount += price;
				});
				
				break;
			}
			
			// aggiorno il calcolo in base a count
			amount.finalAmount = amount.finalAmount * count;
			amount.initialAmount = amount.finalAmount;
			
			// calcolo iva
			amount.vatAmount = NumberUtils.vatAmount(amount.finalAmount, amount.vatRate);
			
			return {
				service: service,
				amount: amount,
				people: peopleObj,
				included: service.bookability == "INCLUDED",
				status : 'CONFIRMED',
				count: count
			};
		};
		
		$$service.updateServiceSoldPrice = function(serviceSold, peopleObj, nights, count, force) {
			var serviceDays = nights;
			if (serviceSold.startDate && serviceSold.endDate) {
				serviceDays = DateUtils.diff(serviceSold.startDate, serviceSold.endDate);
			}
			var oldService = force ? angular.copy(serviceSold) : null;
			_.assign(serviceSold, $$service.serviceSold(serviceSold.service, peopleObj || serviceSold.people, serviceDays, count || serviceSold.count));
			serviceSold.amount = oldService ? oldService.amount : serviceSold.amount;
			// ricalcolo l'iva
			serviceSold.amount.vatAmount = NumberUtils.vatAmount(serviceSold.amount.finalAmount, serviceSold.amount.vatRate);
		};
		
		$$service.bedSold = function(bed, peopleObj, nights, vatRate){
			if (!bed) {
				return {};
			}
			
			peopleObj = $$service.normalizePeople(peopleObj);
			
			var amount = {
				type: "PRICE",
				currency: "EUR",
				initialAmount: 0,
				finalAmount : 0,
				vatRate :  vatRate,
				vatAmount : 0
			};
			
			if(peopleObj.adults && peopleObj.adults > 0){
				amount.finalAmount += peopleObj.adults * bed.adultsPrice;
			}
			
			if(peopleObj.boys && peopleObj.boys > 0){
				amount.finalAmount += peopleObj.boys * bed.boysPrice;
			}
			
			if(peopleObj.children && peopleObj.children > 0){
				amount.finalAmount += peopleObj.children * bed.childrenPrice;
			}
			
			if(peopleObj.kids && peopleObj.kids > 0){
				amount.finalAmount += peopleObj.kids * bed.kidsPrice;
			}
			
			if(bed.frequency == 'DAILY' || bed.frequency == 'NIGHTLY'){
				amount.finalAmount *= nights;
			}
			
			amount.initialAmount = amount.finalAmount;
			
			// calcolo iva
			amount.vatAmount = NumberUtils.vatAmount(amount.finalAmount, amount.vatRate);
			
			return {
				bed: bed,
				people: peopleObj,
				amount: amount,
				status: "CONFIRMED"
			};
		};
		
		$$service.updateBedSoldPrice = function(bedSold, peopleObj, nights, vatRate, force) {
			var bedNights = nights;
			if (bedSold.startDate && bedSold.endDate) {
				bedNights = DateUtils.diff(bedSold.startDate, bedSold.endDate);
			}		
			var oldBed = force ? angular.copy(bedSold) : null;
			_.assign(bedSold, $$service.bedSold(bedSold.bed, peopleObj || bedSold.people, bedNights, vatRate || bedSold.amount.vatRate));
			bedSold.amount = oldBed ? oldBed.amount : bedSold.amount;
			// ricalcolo l'iva
			bedSold.amount.vatAmount = NumberUtils.vatAmount(bedSold.amount.finalAmount, bedSold.amount.vatRate);
		};
		
		$$service.updatePolicyAmount = function(roomSold, policySold, nights) {
			if (!roomSold || !policySold || !nights) {
				return;
			}
			
			var chargeNights = policySold.cancellation.chargeNights;
			var perc = (policySold.cancellation.percentage || 0);
			perc = perc <= 100 ? perc : 100;
			
			var amount = {finalAmount: 0};
			
			// calcolo importo intero
			
			if (chargeNights < 0 || chargeNights == nights) {
				// intero soggiorno
				amount.finalAmount = NumberUtils.fixedDecimals(roomSold.totalRate.amount.finalAmount);
				
			} else {
				// notti
				for (var i=0; i < chargeNights; i++) {
					var dailyRate = roomSold.totalRate.dailyRates[i];
					if (dailyRate) {
						amount.finalAmount += NumberUtils.fixedDecimals(dailyRate.amount.finalAmount);
					}
				}
			}
			
			// applico percentuale
			amount.finalAmount = amount.finalAmount * (perc/100);
			
			policySold.amount = amount;
		};
		
		$$service.calculateTotalPrice = function(res) {
			if (!res) {
				return;
			}
			
			var _self = this;
			
			var nights = DateUtils.diff(res.checkin, res.checkout);
			
			var initialPrice = 0;
			var finalPrice = 0;
			var initialCancelPrice = 0;
			var finalCancelPrice = 0;
			var totalVat = 0;
			var totalPromoDiscount = 0; // totale sconto promozioni
			var arrayPromo = []; // array di promozioni
			var hotelVat = res.hotel && res.hotel.vatTax && res.hotel.vatTax.finalAmount ? res.hotel.vatTax.finalAmount : 10;
			var arrayVat = {}; // mappa di ive
			
			var totalRoomsPrice = 0;
			var totalServicesPrice = 0;
			var totalOtherBedsPrice = 0;
			var totalSubPrice = 0;
			
			_.forEach(res.rooms, function(room, index, collection) {
				/* includo l'iva pagata nell'amount */
				room.totalRate.amount.vatRate = hotelVat;
				room.totalRate.amount.vatAmount = NumberUtils.vatAmount(room.totalRate.amount.finalAmount, room.totalRate.amount.vatRate);			

				if (room.status  == 'CONFIRMED' || room.status  == 'EARLY_CHECKOUT') {
					// prezzo camera
					initialPrice += room.totalRate.amount.initialAmount;
					finalPrice += room.totalRate.amount.finalAmount;
					totalVat += room.totalRate.amount.vatAmount;
							
					// recuopero il totale delle promo
					_.forEach(room.totalRate.dailyRates, function(daily){
						// se c'è una promo
						if(!_.isNil(daily.promotion)){
							// calcolo lo sconto da applicare per singolo rate
							var price = 0;
							
							if (daily.promotion.discount && daily.promotion.discount.finalAmount) {	
								price = daily.amount.finalAmount;
								
								if(daily.promotion.discount.type == 'PRICE'){
									price = daily.amount.initialAmount - daily.promotion.discount.finalAmount;
									
								} else {
									price = daily.amount.initialAmount - (daily.amount.initialAmount * ((100 - daily.promotion.discount.finalAmount)/100));
								}
							}
							
							// inserisco la promo nell'array delle promozioni
							var aPromo = _.find(arrayPromo, function(pr){return daily.promotion.id && pr.promo.id == daily.promotion.id;});
							
							if (aPromo){
								aPromo.price += price;
								
							} else {
								arrayPromo.push({
									promo: daily.promotion,
									percentage: daily.promotion.discount && daily.promotion.discount.type != 'PRICE' && daily.promotion.discount.finalAmount ? daily.promotion.discount.finalAmount + '%' : null,
									price: price,
								});
							}
							
							totalPromoDiscount += price;
						}
					});
					
					// calcolo il totale costo camere
					totalRoomsPrice += room.totalRate.amount.initialAmount;
					totalSubPrice +=  room.totalRate.amount.initialAmount;
					
					// aggiungo l'iva della camera alla mappa di ive
					if(room.totalRate.amount.vatRate){
						arrayVat[room.totalRate.amount.vatRate] = arrayVat[room.totalRate.amount.vatRate] ? arrayVat[room.totalRate.amount.vatRate] + room.totalRate.amount.vatAmount : room.totalRate.amount.vatAmount;
					
					} else {
						arrayVat[hotelVat] = arrayVat[hotelVat] ? arrayVat[hotelVat] + room.totalRate.amount.vatAmount : room.totalRate.amount.vatAmount;
					}
					
					// prezzo servizi camera
					_.forEach(room.services, function(serviceSold) {
						initialPrice += serviceSold.amount.finalAmount;
						finalPrice += serviceSold.amount.finalAmount;
						totalVat += serviceSold.amount.vatAmount;
						
						// calcolo il totale costo servizi
						serviceSold.amount.initialAmount = serviceSold.amount.initialAmount || angular.copy(serviceSold.amount.finalAmount);
						totalServicesPrice += serviceSold.amount.initialAmount;
						totalSubPrice +=   serviceSold.amount.initialAmount;
						
						// controllo se nella mappa arrayVat esiste un iva con
						// quella percentuale e aggiungo l'iva del servizio
						var addVat = false;
						_.forEach(arrayVat, function(value, key) {
							if(key && key == serviceSold.amount.vatRate){
								arrayVat[key] += serviceSold.amount.vatAmount;
								addVat = true;
							}
						});
						
						if(!addVat){
							if(serviceSold.amount.vatRate){
								arrayVat[serviceSold.amount.vatRate] = arrayVat[serviceSold.amount.vatRate] ? arrayVat[serviceSold.amount.vatRate] + serviceSold.amount.vatAmount : serviceSold.amount.vatAmount;
							}
						}
					});
					
					// prezzo letti aggiuntivi camera
					_.forEach(room.otherBeds, function(otherBed) {
						if (otherBed.amount) {
							initialPrice += otherBed.amount.finalAmount;
							finalPrice += otherBed.amount.finalAmount;
							totalVat += otherBed.amount.vatAmount;
							
							// calcolo il totale costo letti extra
							otherBed.amount.initialAmount = otherBed.amount.initialAmount || angular.copy(otherBed.amount.finalAmount);
							totalOtherBedsPrice += otherBed.amount.initialAmount;
							totalSubPrice += otherBed.amount.initialAmount;
							
							// aggiungo l'iva dell' letto alla mappa di ive
							if(otherBed.amount.vatRate){
								arrayVat[otherBed.amount.vatRate] = arrayVat[otherBed.amount.vatRate] ? arrayVat[otherBed.amount.vatRate] + otherBed.amount.vatAmount : otherBed.amount.vatAmount;
							
							} else {
								arrayVat[hotelVat] = arrayVat[hotelVat] ? arrayVat[hotelVat] + otherBed.amount.vatAmount : otherBed.amount.vatAmount;
							}
						}
					});
					
				} else {
					// nel caso è no-show o cancellata o revocata, non viene
					// calcolata l'iva
					initialCancelPrice += room.cancelAmount.initialAmount;
					finalCancelPrice += room.cancelAmount.finalAmount;
				}
			});
			
			// prezzo di cancellazione
			if (!res.cancelAmount) {
				res.cancelAmount = {currency: "EUR", type: "PRICE"};
			}

			var invalidStates = ["CANCELLED", "NO_SHOW"];
			
			res.cancelAmount.initialAmount = _.includes(invalidStates, res.status) ? res.cancelAmount.initialAmount: NumberUtils.fixedDecimals(initialCancelPrice);
			res.cancelAmount.finalAmount = _.includes(invalidStates, res.status) ? res.cancelAmount.finalAmount: NumberUtils.fixedDecimals(finalCancelPrice);
			
			// prezzo prenotazione (attiva)
			if (!res.totalAmount) {
				res.totalAmount = {currency: "EUR", type: "PRICE"};
			}

			res.totalAmount.initialAmount = _.includes(invalidStates, res.status) ? res.totalAmount.initialAmount : initialPrice;
			res.totalAmount.finalAmount = _.includes(invalidStates, res.status) ? res.totalAmount.finalAmount : finalPrice;
			
			if(!res.discount){
				res.discount =  {finalAmount: 0, type: "PERCENTAGE"};
			}
			
			// applico un ulteriore sconto extra
			var discountPrice = NumberUtils.calculateDiscount(res.totalAmount.finalAmount, res.discount.finalAmount, "PERCENTAGE");
			
			res.totalAmount.discountRate = res.discount.finalAmount;
			res.totalAmount.discountAmount = discountPrice;
			res.totalAmount.finalAmount = res.totalAmount.finalAmount - discountPrice;
			
			/* sommo il totalAmount + il cancelAmount */
			res.grandAmount = {
				initialAmount : res.totalAmount.initialAmount,
				finalAmount : res.totalAmount.finalAmount
			};
			
			res.grandAmount.initialAmount += (res.cancelAmount && res.cancelAmount.initialAmount) ? res.cancelAmount.initialAmount : 0;
			res.grandAmount.finalAmount += (res.cancelAmount && res.cancelAmount.finalAmount) ? res.cancelAmount.finalAmount : 0;
			
			/* costo camere servizi letti separati */
			var totalHotelDiscount = totalSubPrice - totalPromoDiscount - res.totalAmount.finalAmount - discountPrice;
			res.totalPriceDetails = {
				rooms : NumberUtils.fixedDecimals(totalRoomsPrice),
				services: NumberUtils.fixedDecimals(totalServicesPrice),
				otherBeds: NumberUtils.fixedDecimals(totalOtherBedsPrice),
				subTotal: NumberUtils.fixedDecimals(totalSubPrice),
				discountPromo:  NumberUtils.fixedDecimals(totalPromoDiscount),
				discountHotel: NumberUtils.fixedDecimals(totalHotelDiscount),
			};
			
			// stampo le promo prenotate
			res.arrayPromo = arrayPromo;
			
			// array di ive
			res.totalVat = {total: totalVat, vatMap: arrayVat};

			// se presente, applico lo sconto alle ive
			if (res.totalAmount.discountRate) {			
				var discountArrayVat = {};
				totalVat = 0;
				
				_.forEach(arrayVat, function(value, key) {
					discountArrayVat[key] = value - ((parseFloat(value) / 100) * parseFloat(res.totalAmount.discountRate));
					totalVat += discountArrayVat[key];
				});
			
				// array di ive
				res.totalVat = {total: totalVat, vatMap: discountArrayVat};
			}
			
			/**
			 * calcolo un eventuale anticipo
			 */
			if ((res.id && res.depositAmount != null) || !res.id){
				if(res.hotel && res.hotel.deposit && res.hotel.deposit.finalAmount > 0) {
					var discountRate = res.hotel.deposit.finalAmount > 100 ? 100 : res.hotel.deposit.finalAmount;
					
					res.depositAmount = res.depositAmount|| {finalAmount: 0};
					res.depositAmount.finalAmount =  NumberUtils.fixedDecimals((res.totalAmount.finalAmount * (discountRate / 100)), 2);
				}
			}

			/**
			 * calcolo la tassa di soggiorno
			 */
			if ((res.id && res.cityTaxAmount != null) || !res.id){
				if (res.hotel && res.hotel.cityTax && res.hotel.cityTax.finalAmount > 0) {
					if(nights && res.guestsCount  && res.guestsCount.total){
						var daysCount = res.hotel.cityTaxLimit > 0 && nights > res.hotel.cityTaxLimit ? res.hotel.cityTaxLimit : nights;
		
						res.cityTaxAmount = res.cityTaxAmount || {};
						res.cityTaxAmount.finalAmount = res.hotel.cityTax.finalAmount * (res.guestsCount.total *  (daysCount > 0 ? daysCount : 1));
					}
				}
			}

		};
		
		$$service.calculateVatMap = function(res, discountPerc) {
			if (!res) {
				return;
			}
			
			var _self = this;
			
			var totalVat = 0;
			var hotelVat = res.hotel && res.hotel.vatTax && res.hotel.vatTax.finalAmount ? res.hotel.vatTax.finalAmount : 10;
			var arrayVat = {}; // mappa di ive
			
			_.forEach(res.rooms, function(room, index, collection) {
				// se la camera è impostata come checkout anticipato calcolo l'iva
				// anche dei vari servizi e letti
				if(room.status == 'EARLY_CHECKOUT'){
					totalVat += room.cancelAmount.vatAmount;
					
					// aggiungo l'iva della camera alla mappa di ive
					if(room.totalRate.cancelAmount.vatRate){
						arrayVat[room.totalRate.cancelAmount.vatRate] = arrayVat[room.totalRate.cancelAmount.vatRate] ? arrayVat[room.totalRate.cancelAmount.vatRate] + room.cancelAmount.vatAmount : room.cancelAmount.vatAmount;
					} else {
						arrayVat[hotelVat] = arrayVat[hotelVat] ? arrayVat[hotelVat] + room.cancelAmount.vatAmount : room.cancelAmount.vatAmount;
					}
					
					// prezzo servizi camera
					_.forEach(room.services, function(serviceSold) {
						totalVat += serviceSold.cancelAmount.vatAmount;
						
						// controllo se nella mappa arrayVat esiste un iva con
						// quella percentuale e aggiungo l'iva del servizio
						var addVat = false;
						_.forEach(arrayVat, function(value, key) {
							if(key && key == serviceSold.cancelAmount.vatRate){
								arrayVat[key] += serviceSold.cancelAmount.vatAmount;
								addVat = true;
							}
						});
						
						if(!addVat){
							if(serviceSold.cancelAmount.vatRate){
								arrayVat[serviceSold.cancelAmount.vatRate] = arrayVat[serviceSold.cancelAmount.vatRate] ? arrayVat[serviceSold.cancelAmount.vatRate] + serviceSold.cancelAmount.vatAmount : serviceSold.cancelAmount.vatAmount;
							}
						}
					});
					
					// prezzo letti aggiuntivi camera
					_.forEach(room.otherBeds, function(otherBed) {
						if (otherBed.cancelAmount) {
							totalVat += otherBed.cancelAmount.vatAmount;
							
							// aggiungo l'iva dell' letto alla mappa di ive
							if(otherBed.cancelAmount.vatRate){
								arrayVat[otherBed.cancelAmount.vatRate] = arrayVat[otherBed.cancelAmount.vatRate] ? arrayVat[otherBed.cancelAmount.vatRate] + otherBed.cancelAmount.vatAmount : otherBed.cancelAmount.vatAmount;
							}else{
								arrayVat[hotelVat] = arrayVat[hotelVat] ? arrayVat[hotelVat] + otherBed.cancelAmount.vatAmount : otherBed.cancelAmount.vatAmount;
							}
						}
					});
					
					// se la camera è confermata calcolo l'iva anche dei vari
					// servizi e letti
				} else if (room.status  == 'CONFIRMED') {
					totalVat += room.totalRate.amount.vatAmount;
					
					// aggiungo l'iva della camera alla mappa di ive
					if(room.totalRate.amount.vatRate){
						arrayVat[room.totalRate.amount.vatRate] = arrayVat[room.totalRate.amount.vatRate] ? arrayVat[room.totalRate.amount.vatRate] + room.totalRate.amount.vatAmount : room.totalRate.amount.vatAmount;
					
					} else {
						arrayVat[hotelVat] = arrayVat[hotelVat] ? arrayVat[hotelVat] + room.totalRate.amount.vatAmount : room.totalRate.amount.vatAmount;
					}
					
					// prezzo servizi camera
					_.forEach(room.services, function(serviceSold) {
						totalVat += serviceSold.amount.vatAmount;
						
						// controllo se nella mappa arrayVat esiste un iva con
						// quella percentuale e aggiungo l'iva del servizio
						var addVat = false;
						_.forEach(arrayVat, function(value, key) {
							if(key && key == serviceSold.amount.vatRate){
								arrayVat[key] += serviceSold.amount.vatAmount;
								addVat = true;
							}
						});
						
						if(!addVat){
							if(serviceSold.amount.vatRate){
								arrayVat[serviceSold.amount.vatRate] = arrayVat[serviceSold.amount.vatRate] ? arrayVat[serviceSold.amount.vatRate] + serviceSold.amount.vatAmount : serviceSold.amount.vatAmount;
							}
						}
					});
					// prezzo letti aggiuntivi camera
					_.forEach(room.otherBeds, function(otherBed) {
						if (otherBed.amount) {
							totalVat += otherBed.amount.vatAmount;
							
							// aggiungo l'iva dell' letto alla mappa di ive
							if(otherBed.amount.vatRate){
								arrayVat[otherBed.amount.vatRate] = arrayVat[otherBed.amount.vatRate] ? arrayVat[otherBed.amount.vatRate] + otherBed.amount.vatAmount : otherBed.amount.vatAmount;
							}else{
								arrayVat[hotelVat] = arrayVat[hotelVat] ? arrayVat[hotelVat] + otherBed.amount.vatAmount : otherBed.amount.vatAmount;
							}
						}
					});
					
				} else {
					// nel caso è no-show o cancellata o revocata, non viene
					// calcolata l'iva
				}
			});
			
			// se presente, applico lo sconto alle ive
			if (discountPerc >= 0) {			
				var discountArrayVat = {};
				totalVat = 0;
				
				_.forEach(arrayVat, function(value, key) {
					discountArrayVat[key] = value - ((parseFloat(value) / 100) * parseFloat(res.totalAmount.discountRate));
					totalVat += discountArrayVat[key];
				});
			
				// array di ive
				res.totalVat = {total: totalVat, vatMap: discountArrayVat};
			}
		};
		
		$$service.applyDiscount = function(res, discount, discountType) {
			if (!res || !discount) {
				return;
			}
			
			discountType = discountType || "PRICE";
			
			var finalPrice = res.totalAmount.finalAmount, discountPrice, discountRate;
			
			if (discountType == "PERCENTAGE") {
				discountPrice = NumberUtils.calculateDiscount(finalPrice, discount, discountType);
				discountRate = discount;
				
			} else {
				discountPrice = discount;
				discountRate = NumberUtils.calculateDiscount(finalPrice, discount, discountType);
			}	
			
			res.totalAmount.discountRate = discountRate;
			res.totalAmount.discountAmount = discountPrice;
			res.totalAmount.finalAmount = finalPrice - discountPrice;
		};
		
		$$service.calculateTotalTransfers = function(res){
			if(!res){
				return;
			}
			
			if(_.isNil(res.externalServices) || _.isNil(res.externalServices.transfersServices)){
				res.externalServices = {transfersServices : []};
			}
			
			var totalPrice = 0, totalVat = 0;
			_.forEach(res.externalServices.transfersServices, function(transfer, index, collection) {
				if(transfer.status == 'CONFIRMED'){
					totalPrice += transfer.amount.finalAmount;
					totalVat += transfer.amount.vatAmount;
					
					if(transfer.surcharge){
						totalPrice += transfer.transferService.nightCharge.finalAmount;
					}
				}
			});
			
			res.totalTransfers = {
				totalAmount: totalPrice,
				vatAmount: totalVat,
				taxableAmount: (totalPrice - totalVat)
			};
		};
		
		$$service.calculateTotalRooms = function(res){
			if(!res || _.isNil(res.rooms)){
				return;
			}
			
			var activeRooms = 0;
			var cancelRooms = 0;
			var stRooms = 0;
			var flexRooms = 0;
			var nrRooms = 0;
			var physicalRooms = [];
			var extendedRooms = 0;
			var total = res.rooms.length;
			
			_.forEach(res.rooms, function(room, index, collection) {
				if(room.status == 'CONFIRMED' || room.status == 'EARLY_CHECKOUT'){
					
					// se la camera è stata estesa non la inserisco nel conteggio
					// delle attive
					if(room.extendedRoom){
						extendedRooms += 1;
						total -=1;
						
					} else {
						activeRooms += 1;
					}
					
					if (!_.isEmpty(room.dailyDetails) && _.some(room.dailyDetails,"room")) {
						var details = _.uniqBy(room.dailyDetails, "room.name");
						physicalRooms.push(_.size(details) > 1 ? details[0].room.name + "+" : details[0].room.name); 
					}
					
					if (room.totalRate.type == "STANDARD") {
						if (room.totalRate.cancellationPolicy && room.totalRate.cancellationPolicy.flexible) {
							flexRooms++;
						} else {
							stRooms++;
						}
						
					} else if (room.totalRate.type == "NOT_REFUNDABLE") {
						nrRooms++;
					}
					
				} else {
					cancelRooms += 1;
				}
			});
			
			return {
				active : activeRooms, 
				cancelled : cancelRooms, 
				total : total,
				standard: stRooms,
				flexible: flexRooms,
				notRefundable: nrRooms,
				physicalRooms: physicalRooms,
				extendedRooms: extendedRooms
			};
		};
		
		$$service.calculateRoomTotalPrice = function(room) {
			if(!room){
				return;
			}
			
			// prezzo camera
			var totalPrice = {
				initialAmount : room.totalRate.amount.initialAmount,
				finalAmount : room.totalRate.amount.finalAmount,
				servicesAmount : 0,
				bedsAmount : 0
			};
					
			// prezzo servizi camera
			_.forEach(room.services, function(service) {
				totalPrice.initialAmount += _.isNil(service.amount.initialAmount) ? service.amount.finalAmount : service.amount.initialAmount;
				totalPrice.finalAmount += service.amount.finalAmount;
				totalPrice.servicesAmount += service.amount.finalAmount;
			});
			
			// prezzo letti aggiuntivi camera
			_.forEach(room.otherBeds, function(otherBed) {		
				totalPrice.initialAmount += _.isNil(otherBed.amount.initialAmount) ? otherBed.amount.finalAmount : otherBed.amount.initialAmount;
				totalPrice.finalAmount += otherBed.amount.finalAmount;
				totalPrice.bedsAmount += otherBed.amount.finalAmount;
			});
			
			room.totalPrice = totalPrice;
		};
		
		$$service.createCancelledReservation = function(res, defaultVat){
			var _self = this;
			
			defaultVat = defaultVat || (res.hotel.vatTax ? res.hotel.vatTax.finalAmount : 0); 
			
			var cancelledReservation = angular.copy(res);
			
			// azzero amount finale
			if (cancelledReservation.cancelAmount) {
				_.assign(cancelledReservation.cancelAmount, {initialAmount: 0, finalAmount: 0});
			
			} else {
				cancelledReservation.cancelAmount = {initialAmount: 0, finalAmount: 0};
			}
			
			var nowMoment = moment();
			
	// var total = 0, finalTotal = 0;
			var status;
			
			_.forEach(cancelledReservation.rooms, function(room) {
				// se la camera era attiva calcolo l'importo del checkout
				if(room.status == 'CONFIRMED'){
					// se la camera è già terminata, la ignoro
					if (room.endDate && moment(room.endDate).isBefore(nowMoment, "days")) {
						return;
					}
					
					// non è già cancellata in precedenza
					room.cancelled = false;
				
					// cancellazione camera
					_.assign(room, _self.createCancelledRoom(room, cancelledReservation, nowMoment, defaultVat));
				
					// aggiorno prezzo totale prenotazione
					cancelledReservation.cancelAmount.initialAmount += NumberUtils.fixedDecimals(room.cancelAmount.finalAmount);
					cancelledReservation.cancelAmount.finalAmount += NumberUtils.fixedDecimals(room.cancelAmount.finalAmount);

				} else {
					// camera già cancellata in precedenza
					room.cancelled = true;
					
					// XXX tenere traccia anche di penali di camere già
					// cancellate???
				}
			});

			if(cancelledReservation.cancelAmount.finalAmount <= 0){
				status = 'reservation.manager.cancel.free';

			} else {
				status = 'reservation.manager.cancel.penalty';
			}
			
			// applico il testo più conforme al tipo di cancellazione
			cancelledReservation.statusText = status;
			
			// rimuovo dal totale della penale l'eventuale importo già pagato
	// finalTotal = total;
	// if(earlyCheckoutReservation.chargedAmount &&
	// earlyCheckoutReservation.chargedAmount.finalAmount){
	// finalTotal = total - earlyCheckoutReservation.chargedAmount.finalAmount;
	// }

	// cancelledReservation.cancelAmount = {
	// initialAmount: NumberUtils.fixedDecimals(total),
	// finalAmount: NumberUtils.fixedDecimals(total),
	// total: NumberUtils.fixedDecimals(finalTotal)
	// };
			
			cancelledReservation.cancelDate = nowMoment.toDate();
			cancelledReservation.status = 'CANCELLED';
			
			// preseleziono il checkbox dell'invio email al gues
			cancelledReservation.sendEmail = true;
			
			return cancelledReservation;
		};
		
		$$service.createCancelledRoom = function(room, reservation, targetDate, defaultVat) {
			var targetMoment = targetDate ? moment(targetDate) : moment();
			
			// se la camera è già terminata, la restituisco
			if (room.endDate && moment(room.endDate).isBefore(targetMoment, "days")) {
				return room;
			}
			
			var nights = DateUtils.diff(room.startDate || reservation.checkin, targetMoment);
			
			var cancelledRoom = angular.copy(room);
			
			// non è già cancellata in precedenza
			cancelledRoom.cancelled = false;
			
			cancelledRoom.cancelAmount = cancelledRoom.cancelAmount ? cancelledRoom.cancelAmount : {};
			
			// se ha una policy di cancellazione
			if(cancelledRoom.totalRate.cancellationPolicy){
				// imposto il cancelAmount
				cancelledRoom.tempStatus = 'penalty';
				cancelledRoom.cancelAmount.finalAmount = cancelledRoom.totalRate.cancellationPolicy.amount.finalAmount;
				
				// se ha una tolleranza e questa è valida
				if(cancelledRoom.totalRate.cancellationPolicy.limitDate && moment(cancelledRoom.totalRate.cancellationPolicy.limitDate).utcOffset((reservation.hotel.addressInfo.offset || 0)/60).isSameOrAfter(targetMoment)){
					cancelledRoom.cancelAmount.finalAmount = 0;
					cancelledRoom.tempStatus = 'free';
				}
				
			} else {
				// se non ha una policy vuol dire che ha la promozione
				// all'arrivo
				cancelledRoom.cancelAmount.finalAmount = 0;
				cancelledRoom.tempStatus = 'free';
			}
			
			// arrotondo a 2 decimali max
			cancelledRoom.cancelAmount.initialAmount = NumberUtils.fixedDecimals(cancelledRoom.cancelAmount.finalAmount);
			cancelledRoom.cancelAmount.finalAmount = NumberUtils.fixedDecimals(cancelledRoom.cancelAmount.finalAmount);
			
			// se era già cancellata
			cancelledRoom.cancelled = false;
			
			// calcolo iva per le camere cancellate
			cancelledRoom.cancelAmount.vatRate = cancelledRoom.totalRate.amount.vatRate ? cancelledRoom.totalRate.amount.vatRate : defaultVat;
			cancelledRoom.cancelAmount.vatAmount = NumberUtils.vatAmount(cancelledRoom.cancelAmount.finalAmount, cancelledRoom.cancelAmount.vatRate);
			
			cancelledRoom.cancelDate = targetMoment.toDate();
			cancelledRoom.status = 'CANCELLED';
			
			_.forEach(cancelledRoom.services, function(serviceSold) {
				serviceSold.status = 'CANCELLED';
			});
			
			_.forEach(cancelledRoom.otherBeds, function(otherBed) {
				otherBed.status = 'CANCELLED';
			});
			
			return cancelledRoom;
		};
		
		$$service.createNoShowReservation = function(res, defaultVat){
			defaultVat = defaultVat || (res.hotel.vatTax ? res.hotel.vatTax.finalAmount : 0); 
			
			var noShowReservation = angular.copy(res);
			
			var now = new Date();
			var nowMoment = moment(now);
			
			var total = 0, finalTotal = 0;
			var status;
			var noShowPrice = 0;

			_.forEach(noShowReservation.rooms, function(room) {			
				room.cancelAmount  = room.cancelAmount ? room.cancelAmount : {};
				
				// se ha una policy di cancellazione
				if(room.totalRate.noShowPolicy){
					// imposto il cancelAmount
					room.tempStatus = 'penalty';
					room.cancelAmount.finalAmount = room.totalRate.noShowPolicy.amount.finalAmount;
					
				}else{
					// se non ha una policy vuol dire che ha la promozione
					// all'arrivo
					room.cancelAmount.finalAmount = 0;
					room.tempStatus = 'free';
				}
				
				// arrotondo a 2 decimali max
				room.cancelAmount.finalAmount = NumberUtils.fixedDecimals(room.cancelAmount.finalAmount);
				
				// imposto i servizi e i letti e l'iva come no show
				if(room.status == 'CONFIRMED'){
					total += room.cancelAmount.finalAmount;
					room.cancelled = false;
					
					// calcolo iva per le camere noshow
					room.cancelAmount.vatRate = room.totalRate.amount.vatRate ? room.totalRate.amount.vatRate : defaultVat;
					room.cancelAmount.vatAmount = NumberUtils.vatAmount(room.cancelAmount.finalAmount, room.cancelAmount.vatRate);
					
					room.cancelDate = now;
					room.status = 'NO_SHOW';
					
					_.forEach(room.services, function(serviceSold) {
						serviceSold.status = 'NO_SHOW';
					});
					
					_.forEach(room.otherBeds, function(otherBed) {
						otherBed.status = 'NO_SHOW';
					});
					
				} else {
					// se era già cancellata
					room.cancelled = true;
				}
			});
			
			// rimuovo dal totale della penale l'eventuale importo già pagato
	// finalTotal = total;
	// if(earlyCheckoutReservation.chargedAmount &&
	// earlyCheckoutReservation.chargedAmount.finalAmount){
	// finalTotal = total - earlyCheckoutReservation.chargedAmount.finalAmount;
	// }
			
			noShowReservation.cancelAmount = {
				initialAmount: NumberUtils.fixedDecimals(total),
				finalAmount: NumberUtils.fixedDecimals(total),
				total: NumberUtils.fixedDecimals(finalTotal)
			};
			
			noShowReservation.cancelDate = now;
			noShowReservation.status = 'NO_SHOW';
			
			// preseleziono il checkbox dell'invio email al gues
			noShowReservation.sendEmail = true;
			
			return noShowReservation;
		};
		
		$$service.createEarlyCheckoutReservation = function(res, defaultVat){
			var _self = this;
			
			defaultVat = defaultVat || (res.hotel.vatTax ? res.hotel.vatTax.finalAmount : 0); 
			
			var earlyCheckoutReservation = angular.copy(res);
			
			var now = new Date();
			var todayMoment = moment(now);
			
			// salvo amount iniziale
			earlyCheckoutReservation.initialAmount = angular.copy(earlyCheckoutReservation.totalAmount);
			// azzero amount finale
			_.assign(earlyCheckoutReservation.totalAmount, {initialAmount: 0, finalAmount: 0});
			
			var status, title, reason, penalty, freeLabel, penaltyLabel;

			// notti usufruite
			var nights = DateUtils.diff(earlyCheckoutReservation.checkin, todayMoment);
			
			// se le notti usufurite sono maggiori di 0: checkout anticipato
			if(nights > 0){
				_.forEach(earlyCheckoutReservation.rooms, function(room) {
					// se la camera era attiva calcolo l'importo del checkout
					if(room.status == 'CONFIRMED'){
						// se la camera è già terminata, la ignoro
						if (room.endDate && moment(room.endDate).isBefore(todayMoment, "days")) {
							room.status = "EARLY_CHECKOUT";
							return;
						}

						// non è già cancellata in precedenza
						room.cancelled = false;
						
						// early checkout camera
						_.assign(room, _self.createEarlyCheckoutRoom(room, earlyCheckoutReservation, todayMoment, defaultVat));
						
						// data di checkout efettuato
						room.checkoutDone = now;
					
						// aggiorno prezzo totale prenotazione
						earlyCheckoutReservation.totalAmount.initialAmount += room.totalRoomAmount.initialAmount;
						earlyCheckoutReservation.totalAmount.finalAmount += room.totalRoomAmount.finalAmount;
					
					} else {
						// camera già cancellata in precedenza
						room.cancelled = true;
					}
				});
				
				// dati prenotazione
				title  		 = 'reservation.earlycheckout.title';
				reason 		 = 'reservation.earlycheckout.reason.label';
				penalty 	 = 'reservation.earlycheckout.penalty';
				status 		 = 'reservation.manager.earlyCheckout';
				freeLabel	 = 'reservation.earlycheckout.free.label';
				penaltyLabel = 'reservation.earlycheckout.penalty.label';
				
				// data di checkout efettuato
				earlyCheckoutReservation.checkoutDone = now;
				earlyCheckoutReservation.status = 'EARLY_CHECKOUT';
				
				// arrotondamento
				earlyCheckoutReservation.totalAmount.initialAmount = NumberUtils.fixedDecimals(earlyCheckoutReservation.totalAmount.initialAmount);
				earlyCheckoutReservation.totalAmount.finalAmount = NumberUtils.fixedDecimals(earlyCheckoutReservation.totalAmount.finalAmount);
				
				// calcolo iva
				earlyCheckoutReservation.totalAmount.vatRate = earlyCheckoutReservation.totalAmount.vatRate || defaultVat;
				earlyCheckoutReservation.totalAmount.vatAmount = NumberUtils.vatAmount(earlyCheckoutReservation.totalAmount.finalAmount, earlyCheckoutReservation.totalAmount.vatRate);
			
			} else {
				// in caso le notti siano minori di 0: cancellazione prenotazione
				earlyCheckoutReservation = _self.createCancelledReservation(res, defaultVat);
				
				// dati prenotazione
				title  		= 'reservation.deleteCheckin.title';
				reason 		= 'reservation.deleteCheckin.reason.label';
				penalty	 	= 'reservation.deleteCheckin.penalty';
				status 		= earlyCheckoutReservation.cancelAmount.finalAmount > 0 ? 'reservation.manager.deleteCheckin' : 'reservation.manager.deleteCheckin.free';
				freeLabel	= 'reservation.cancellation.free';
				penaltyLabel= 'reservation.bill.penalty';
			}
			
			// rimuovo dal totale della penale l'eventuale importo già pagato
	// var finalTotal = total;
	// if(earlyCheckoutReservation.chargedAmount &&
	// earlyCheckoutReservation.chargedAmount.finalAmount){
	// finalTotal = total - earlyCheckoutReservation.chargedAmount.finalAmount;
	// }
			
			// applico il testo più conforme al tipo di checkout anticipato
			earlyCheckoutReservation.title = title;
			earlyCheckoutReservation.reason = reason;
			earlyCheckoutReservation.penalty = penalty;
			earlyCheckoutReservation.statusText = status;
			earlyCheckoutReservation.freeLabel = freeLabel;
			earlyCheckoutReservation.penaltyLabel = penaltyLabel;
			
			// preseleziono il checkbox dell'invio email al guest
			earlyCheckoutReservation.sendEmail = true;
			
			return earlyCheckoutReservation;
		};
		
		$$service.createEarlyCheckoutRoom = function(room, reservation, targetDate, defaultVat) {
			var earlyCheckoutRoom = $$service.createTerminatedRoom(room, reservation, targetDate, defaultVat, "EARLY_CHECKOUT");
			if(earlyCheckoutRoom){
				earlyCheckoutRoom.checkoutDone = new Date();
			}
			return earlyCheckoutRoom;
		};
		
		$$service.createTerminatedRoom = function(room, reservation, targetDate, defaultVat, statusToApply) {
			if (!room || room.status != "CONFIRMED") {
				return null;
			}
			
			var targetMoment = targetDate ? moment(targetDate) : moment();
			
			// data fine camera
			var end = room.endDate ? moment(room.endDate) : null;
			
			// se la camera terminerebbe nella targetDate, restituisco una copia
			// esatta della camera
			if (end && end.isSame(targetMoment, "days")) {
				return angular.copy(room);
			}
			
			// data inizio e fine camera
			var start = moment(room.startDate || reservation.checkin);
			// se la camera non ha data di fine specifica, diventa il checkout
			end = end || moment(reservation.checkout);
			
			// intervallo originale camera
			var originalRange = moment.range(start, end);
			
			// se la targetDate non è compresa nell'intervallo della camera,
			// restituisco la camera originale
			if (!originalRange.contains(targetMoment, {exclusive: true})) {
				return null;
			}
			
			var _self = this;
			
			var roomCurrency = room.totalRate.amount.currency;
			
			// normalizzo defaultVatRate
			defaultVat = defaultVat || room.totalRate.amount.vatRate || reservation.hotel.vatTax.finalAmount;
					
			// inizializzo la camera terminata
			var terminatedRoom = angular.copy(room);
			terminatedRoom.totalRoomAmount = {initialAmount: 0, finalAmount: 0, currency: roomCurrency};
			
			// non è già cancellata in precedenza
			terminatedRoom.cancelled = false;
			
			// intervallo di terminazione
			var terminationRange = moment.range(start, targetMoment);
			
			/** ricalcolo i servizi */
			terminatedRoom.paymentServices = [];
			
			_.forEach(terminatedRoom.services, function(serviceSold) {
				if (_self.terminateServiceSold(serviceSold, terminationRange, statusToApply, originalRange)) {
					// inserisco servizio a pagamento nella lista
					if (!serviceSold.included && serviceSold.service.bookability != "INCLUDED") {
						terminatedRoom.paymentServices.push(serviceSold);
					}
					
					// aggiorno prezzo totale camera
					terminatedRoom.totalRoomAmount.initialAmount += NumberUtils.fixedDecimals(serviceSold.amount.initialAmount || serviceSold.amount.finalAmount);
					terminatedRoom.totalRoomAmount.finalAmount += NumberUtils.fixedDecimals(serviceSold.amount.finalAmount);
				} 
			});
			
			/** ricalcolo i letti principali */
			_.forEach(terminatedRoom.beds, function(bedSold) {
				if (!bedSold || bedSold.status != "CONFIRMED") {
					return;
				}

				// imposto stato
				bedSold.status = statusToApply ? statusToApply : bedSold.status;
			});
			
			/** ricalcolo i letti aggiuntivi */
			_.forEach(terminatedRoom.otherBeds, function(bedSold) {
				if (_self.terminateBedSold(bedSold, terminationRange, defaultVat, statusToApply, originalRange)) {
					
					// aggiorno prezzo totale camera
					terminatedRoom.totalRoomAmount.initialAmount += NumberUtils.fixedDecimals(bedSold.amount.initialAmount || bedSold.amount.finalAmount);
					terminatedRoom.totalRoomAmount.finalAmount += NumberUtils.fixedDecimals(bedSold.amount.finalAmount);
				}
			});
			
			// copio il prezzo totale della camera
			terminatedRoom.amount = terminatedRoom.totalRoomAmount;
			
			// imposto stato
			terminatedRoom.status = statusToApply ? statusToApply : room.status;
			
			// imposto data di fine
			terminatedRoom.endDate = moment(terminationRange.end).toDate();
			
			// salvo amount iniziale
			terminatedRoom.initialAmount = angular.copy(room.totalRate.amount);
			
			/** ricalcolo il prezzo camera */
			
			// tipo di addebito (inizialmente è sempre soggiorno maturato)
			terminatedRoom.tempStatus = 'earlyCheckout';
			
			// nel checkout anticipato viene addebitata anche la notte relativa
			// al giorno corrente se viene effettutato il giorno stesso
			var ratesRange = terminatedRoom.status == "EARLY_CHECKOUT" && terminationRange.end.isSame(moment(), 'day') ? moment.range(terminationRange.start, moment(terminationRange.end).add(1, "days")) : terminationRange;
			
			// memorizzo rate giornalieri originari
			terminatedRoom.totalRate.initialDailyRates = angular.copy(terminatedRoom.totalRate.dailyRates);
			
			// ricalcolo prezzo camera
			if (terminatedRoom.totalRate.type == 'STANDARD'){
				// se tariffa STANDARD, prendo l'initial amount solo delle notti
				// soggiornate (più la corrente)
				
				// disabilito rate giornalieri non usufruiti
				_.forEach(terminatedRoom.totalRate.initialDailyRates, function(rate) {
					rate.disabled = !ratesRange.contains(rate.date, {exclusive: true}); 
					rate.toRemove = rate.disabled;
				});
				
				// rimuovo i rate giornalieri non usufruiti
				terminatedRoom.totalRate.dailyRates = _.filter(terminatedRoom.totalRate.initialDailyRates, function(rate){
					return !rate.toRemove;
				});
				
				// calcolo il prezzo totale delle notti da addebitare
				var toChargeAmount = {initialAmount: 0, finalAmount: 0, currency: roomCurrency};
				
				_.forEach(terminatedRoom.totalRate.dailyRates, function(rate) {
					toChargeAmount.initialAmount += NumberUtils.fixedDecimals(rate.amount.initialAmount || rate.amount.finalAmount);
					toChargeAmount.finalAmount += NumberUtils.fixedDecimals(rate.amount.finalAmount);
				});
				
				// aggiorno il prezzo della camera
				_.assign(terminatedRoom.totalRate.amount, toChargeAmount);
				
			} else if (terminatedRoom.totalRate.type == 'NOT_REFUNDABLE') {
				// per le tariffe NR, l'importo da addebitare non può essere
				// inferiore a quello della policy
				
				// penale di cancellazione
				var cancellationPolicy = terminatedRoom.totalRate.cancellationPolicy ? terminatedRoom.totalRate.cancellationPolicy.cancellation : null;
	// cancellationPolicy = cancellationPolicy || {chargeNights: -1, percentage:
	// 100};
				
				// recupero notti di addebito dalla penale
				var chargeNights = !cancellationPolicy ? null : cancellationPolicy.chargeNights > 0 ? cancellationPolicy.chargeNights : -1;
				
				// intervallo della policy (se le notti della policy sono minori
				// dell'intervallo originale della camera, l'intervallo è l'inizio
				// della camera più le notti della policy, altrimenti vale
				// l'intervallo originale della camera)
				var policyRange = !chargeNights ? null : chargeNights > 0 && chargeNights < originalRange.diff("days") ? moment.range(originalRange.start, moment(originalRange.start).add(chargeNights, "days")) : originalRange;

				// intervallo da addebitare
				var chargeRange = policyRange && policyRange.diff("days") > ratesRange.diff("days") ? policyRange : ratesRange;
				
				// disabilito i rate giornalieri non addebitabili
				_.forEach(terminatedRoom.totalRate.initialDailyRates, function(rate) {
					var rateDate = moment(rate.date);
		
					// se la notte è da addebitare, ne adeguo l'importo
					if (chargeRange.contains(rateDate, {exclusive: true})) {
						rate.disabled = false;
						rate.toRemove = false;
						
						// se la notte non è stata usufruita ma fa parte delle
						// notti della penale, ne addebito solamente la
						// percentuale definita nella penale
						if (!ratesRange.contains(rateDate, {exclusive: true}) && policyRange && policyRange.contains(rateDate, {exclusive: true})) {
							// tipo di addebito: penale
							terminatedRoom.tempStatus = 'penalty';
							
							// setto la tariffa disabilitata (non usufruita)
							rate.disabled = true;
							// se la percentuale di addebito non è del 100%, la
							// ricalcolo
							if (cancellationPolicy.percentage < 100) {
								// memorizzo l'importo iniziale
								rate.amount.initialAmount = rate.amount.finalAmount;
								// calcolo importo finale
								rate.amount.finalAmount = NumberUtils.calculateDiscount(rate.amount.finalAmount, cancellationPolicy.percentage, "PERCENTAGE");
							}
						}
		
					} else {
						rate.disabled = true;
						rate.toRemove = true;
					}
				});
				
				// rimuovo i rate giornalieri non addebitabili
				terminatedRoom.totalRate.dailyRates = _.filter(terminatedRoom.totalRate.initialDailyRates, function(rate){
					return !rate.toRemove;
				});
				
				// calcolo il prezzo totale delle notti da addebitare
				var toChargeAmount = {initialAmount: 0, finalAmount: 0, currency: roomCurrency};
				
				_.forEach(terminatedRoom.totalRate.dailyRates, function(rate) {
					toChargeAmount.initialAmount += NumberUtils.fixedDecimals(rate.amount.initialAmount || rate.amount.finalAmount);
					toChargeAmount.finalAmount += NumberUtils.fixedDecimals(rate.amount.finalAmount);
				});
				
				// l'importo da addebitare non può essere inferiore a quello della
				// policy
				if (toChargeAmount.finalAmount < (terminatedRoom.totalRate.cancellationPolicy && terminatedRoom.totalRate.cancellationPolicy.amount ? terminatedRoom.totalRate.cancellationPolicy.amount.finalAmount : 0)) {
					toChargeAmount = terminatedRoom.totalRate.cancellationPolicy.amount;
					
					// tipo di addebito: penale
					terminatedRoom.tempStatus = 'penalty';
				}
				
				// aggiorno il prezzo della camera
				_.assign(terminatedRoom.totalRate.amount, toChargeAmount);
			}
			
			// calcolo iva prezzo camera
			terminatedRoom.totalRate.amount.vatRate = terminatedRoom.totalRate.amount.vatRate || defaultVat;
			terminatedRoom.totalRate.amount.vatAmount = NumberUtils.vatAmount(terminatedRoom.totalRate.amount.finalAmount, terminatedRoom.totalRate.amount.vatRate);
			
			// aggiorno prezzo totale camera
			terminatedRoom.totalRoomAmount.initialAmount = NumberUtils.fixedDecimals(terminatedRoom.totalRoomAmount.initialAmount + terminatedRoom.totalRate.amount.initialAmount);
			terminatedRoom.totalRoomAmount.finalAmount = NumberUtils.fixedDecimals(terminatedRoom.totalRoomAmount.finalAmount + terminatedRoom.totalRate.amount.finalAmount);
			
			// calcolo prezzi specifici camera
			_self.calculateRoomTotalPrice(terminatedRoom);
			
			return terminatedRoom;
		};
		
		$$service.terminateServiceSold = function(serviceSold, terminationRange, statusToApply, roomRange) {
			if (!serviceSold || serviceSold.status != "CONFIRMED") {
				return false;
			}
			
			var serviceRange = moment.range(moment(serviceSold.startDate || terminationRange.start), moment(serviceSold.endDate || terminationRange.end));
			
			// se il servizio non è in corso, lo ignoro
			if (!serviceRange.contains(terminationRange.end)) {
				return false;
			}
			
			// aggiorno l'intervallo
			serviceRange = moment.range(serviceRange.start, terminationRange.end);
			
			// calcolo i giorni effettivi del servizio
			var serviceDays = serviceRange.diff('days');
			
			// creo servizio per i nuovi giorni
			var newServ = $$service.serviceSold(serviceSold.service, serviceSold.people, serviceDays, serviceSold.count);

			// imposto stato
			serviceSold.status = statusToApply ? statusToApply : serviceSold.status;
			
			// salvo amount iniziale
			serviceSold.initialAmount = angular.copy(serviceSold.amount);
			
			// imposto nuovo amount
			serviceSold.amount = angular.copy(newServ.amount);
			
			// creazione importi giornalieri (se pagamento giornaliero)
			if (serviceSold.service.frequency == 'DAILY' || serviceSold.service.frequency == 'NIGHTLY') {
				if (roomRange && roomRange.start && roomRange.end) {
					serviceSold.dailyRates = [];
					
					// creo servizio per 1 notte e prendo importo
					var dailyAmount = $$service.serviceSold(serviceSold.service, serviceSold.people, 1, serviceSold.count).amount;
					
					// data inizio e fine servizio
					var serviceStartDate = moment(serviceSold.startDate || roomRange.start);
					var serviceEndDate = moment(serviceSold.endDate || roomRange.end);
					
					for (var date=moment(roomRange.start); date.isBefore(moment(roomRange.end), "days"); date.add(1, "days")) {
						serviceSold.dailyRates.push({"date": date.toDate(), amount: date.isBefore(serviceStartDate, "days") || date.isAfter(serviceEndDate, "days") ? null : dailyAmount, disabled: date.isSameOrAfter(terminationRange.end, "days")});
					}
				}
				
				// imposto data fine
				serviceSold.endDate = moment(terminationRange.end).toDate();
			}
			
			return true;
		};
		
		$$service.terminateBedSold = function(bedSold, terminationRange, defaultVat, statusToApply, roomRange) {
			if (!bedSold || bedSold.status != "CONFIRMED") {
				return false;
			}
			
			var bedRange = moment.range(bedSold.startDate || terminationRange.start, bedSold.endDate || terminationRange.end);
			
			// se il letto non è in corso, lo ignoro
			if (!bedRange.contains(terminationRange.end)) {
				return false;
			}
			
			// aggiorno l'intervallo
			bedRange = moment.range(bedRange.start, terminationRange.end);
			
			// calcolo le notti effettive del letto
			var bedNights = bedRange.diff('days');

			// creo letto per le nuove notti
			var newBed = $$service.bedSold(bedSold.bed, bedSold.people, bedNights, defaultVat);
			
			// imposto stato
			bedSold.status = statusToApply ? statusToApply : bedSold.status;
			// salvo amount iniziale
			bedSold.initialAmount = angular.copy(bedSold.amount);
			// imposto nuovo amount
			bedSold.amount = angular.copy(newBed.amount);
			
			// creazione importi giornalieri (se pagamento giornaliero)
			if (bedSold.bed.frequency == 'DAILY' || bedSold.bed.frequency == 'NIGHTLY') {
				if (roomRange && roomRange.start && roomRange.end) {
					bedSold.dailyRates = [];
					
					// creo letto per 1 notte e prendo importo
					var dailyAmount = $$service.bedSold(bedSold.bed, bedSold.people, 1, defaultVat).amount;
					
					// data inizio e fine letto
					var bedStartDate = moment(bedSold.startDate || roomRange.start);
					var bedEndDate = moment(bedSold.endDate || roomRange.end);
					
					for (var date=moment(roomRange.start); date.isBefore(moment(roomRange.end), "days"); date.add(1, "days")) {
						bedSold.dailyRates.push({"date": date.toDate(), amount: date.isBefore(bedStartDate, "days") || date.isAfter(bedEndDate, "days") ? null : dailyAmount, disabled: date.isSameOrAfter(terminationRange.end, "days")});
					}
				}
				
				// imposto data fine
				bedSold.endDate = moment(terminationRange.end).toDate();
			}
				
			return true;
		};
		
		$$service.bestPromotion = function(promotions){
			var bestPromo;
			var bestRatePromoDiscount = 0;
			
			_.forEach(promotions, function(promo){
				// XXX le promo secret sono visibili solo agli utenti loggati
				// TODO gestire le promo secret
				if(promo.secret){
					return;
				}
				 
				 //se è standard
				if(promo.promotionType == 'STANDARD'){
					// se è la prima promo la seleziono
					if (!bestPromo) {
						bestRatePromoDiscount = promo.discount.finalAmount - promo.discount.initialAmount;
						bestPromo = promo;
						return;
					}
					
					//se lo sconto applicato è maggiore
					if((promo.discount.finalAmount - promo.discount.initialAmount) > bestRatePromoDiscount){
						//se la promo attuale non è all'arrivo ma la miglior promo si
						if(!promo.onArrival && bestPromo.onArrival){
							return;
							
						} else {
							bestRatePromoDiscount = (promo.discount.finalAmount - promo.discount.initialAmount);
							bestPromo = promo;
						}
						
					//se lo sconto applicato è minore ma la promo è all'arrivo e la bestPromo no
					} else if((promo.discount.finalAmount - promo.discount.initialAmount) > bestRatePromoDiscount && promo.onArrival && !bestPromo.onArrival){
						bestRatePromoDiscount = promo.discount.finalAmount - promo.discount.initialAmount;
						bestPromo = promo;
					}
					
				} else {
					bestRatePromoDiscount = promo.discount.finalAmount - promo.discount.initialAmount;
					bestPromo = promo;
				}
			});
			 
			return bestPromo;
		};
		
		$$service.bestPromotionForRates = function(rates){
			var promotions = [];
			
			_.forEach(rates, function(rate){
				promotions = _.union(promotions, rate.promotions);
			});
			
			return $$service.bestPromotion(promotions);
		};
		
		$$service.getRoomPenalty = function(room, hotel, targetDate) {
			var amount = null;
			
			if (room.totalRate.cancellationPolicy) {
				var targetMoment = moment.isMoment(targetDate) ? targetDate : moment(targetDate);
				
				// se è entro il limit date, non è in penale
				if(room.totalRate.cancellationPolicy.limitDate && moment(room.totalRate.cancellationPolicy.limitDate).utcOffset((hotel.addressInfo.offset || 0)/60).isSameOrAfter(targetMoment)){
					amount = {finalAmount: 0, initialAmount: 0};
					
				} else {
					amount = room.totalRate.cancellationPolicy.amount;
				}
			}

			return amount;
		};
		
		$$service.getReservationPenalty = function(reservation){
			if(!reservation){
				return;
			}
			
			var penalty = {
				"STANDARD":{date: null, amount: null},
				"NOT_REFUNDABLE":{date: null, amount: null},
				"TOTAL": [],
				"TOTAL_AMOUNT": angular.copy(reservation.totalAmount)
			};
			
			_.forEach(reservation.rooms,function(room){
				penalty[room.totalRate.type].date = room.totalRate.cancellationPolicy.limitDate ||new Date();
				penalty[room.totalRate.type].amount = AmountUtils.sum(penalty[room.totalRate.type].amount, (room.totalRate.cancellationPolicy ? room.totalRate.cancellationPolicy.amount : 0));
			});
			
			var stDate = penalty["STANDARD"].date, nrDate = penalty["NOT_REFUNDABLE"].date;
			
			if(stDate && !nrDate){
				penalty["TOTAL"].push({startDate: stDate, amount: penalty["STANDARD"].amount });
				
			}else if(!stDate && nrDate){
				penalty["TOTAL"].push({startDate: nrDate, amount: penalty["NOT_REFUNDABLE"].amount });
				
			} else if(stDate && nrDate){
				if (stDate && nrDate && stDate.getTime() > nrDate.getTime()) {
					penalty["TOTAL"].push(
						{startDate: nrDate, endDate: stDate, amount: penalty["NOT_REFUNDABLE"].amount},
						{startDate: stDate, amount: AmountUtils.sum(penalty["STANDARD"].amount, penalty["NOT_REFUNDABLE"].amount)}
					);
					
				} else {
					penalty["TOTAL"].push(
						{startDate: stDate, endDate: nrDate, amount: penalty["STANDARD"].amount},
						{startDate: nrDate, amount: AmountUtils.sum(penalty["STANDARD"].amount, penalty["NOT_REFUNDABLE"].amount) }
					);
					
				}
			}
				
			return penalty;
		};
		
		/**
		 * Genera la lista di tutte le camere fisiche disponibili per questa prenotazione
		 */
		$$service.generatePhysicalRoomsList = function(physicalRoomsList, dailyAv){
			if(!dailyAv || _.isEmpty(dailyAv)){
				return;
			}
			
			physicalRoomsList = !_.isNil(physicalRoomsList) ? physicalRoomsList : {};
			
			/**
			 * Mappa con:
			 * key: camera fisica
			 * value: [{data e camere}...]
			 */
			_.forEach(dailyAv, function(daily){
				_.forEach(daily.roomsAvailabilities, function(roomAv){
					if(roomAv.roomClosed){
						return true; //continuo
					}
					
					physicalRoomsList[roomAv.room.id] = physicalRoomsList[roomAv.room.id] || [];
					
					//inserisco nell'array le date disponibili
					if(!_.some(physicalRoomsList[roomAv.room.id], function(type){return  moment(type.date).isSame(moment(roomAv.date), 'day');})){
						physicalRoomsList[roomAv.room.id].push({date: roomAv.date, roomsSold:[]});	
					}
					
				});
			});
			
			return physicalRoomsList;
		};
		
		$$service.isRoomInPenalty = function(room, hotel, targetDate) {
			var cancelAmount = $$service.getRoomPenalty(room, hotel, targetDate);
			
			return angular.isObject(cancelAmount) && cancelAmount.finalAmount > 0;
		};
		
		$$service.maskCardPan = function(pan) {
			return String(pan).replace(/-/g, "").replace(/.*(\d{4})$/, "**** **** **** $1");
		};
		
		$$service.beautifyCardPan = function(pan) {
			return String(pan).replace(/-/g, "").replace(/(.{4})/g, "$1 ").replace(/-([^-]*)$/, "$1");
		};
		
		return $$service;	
	}
})();