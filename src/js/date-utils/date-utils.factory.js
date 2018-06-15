/**
 * Utility per le date
 * 
 */
(function() {
	'use strict';
	
	angular.module("itaca.utils").factory('DateUtils', DateUtilsFactory);
	
	/* @ngInject */
	function DateUtilsFactory($log, moment, REGEXP, AppOptions){ 
		var service = {};
		
		service.absoluteDate = function(date, resetTime) {
			return service.absoluteMoment(date, resetTime).toDate();
		};
		
		service.absoluteMoment = function(date, resetTime) {
			var m = moment(date || undefined);
			
			if (!m.isValid()) {
				throw new Error("The date is not valid!");
			}
			
			var absMoment = moment(m).utcOffset(0, true);
			return resetTime ? absMoment.startOf("day") : absMoment;
		};
		
		service.dateForTimezone = function(date, timeZoneId) {
			return moment.tz(date, timeZoneId);
		};
		
		service.hotelDate = function(date) {
			if (AppOptions.hotel && AppOptions.hotel.addressInfo && (AppOptions.hotel.addressInfo.timeZoneId || AppOptions.hotel.addressInfo.offset)) {
				return AppOptions.hotel.addressInfo.timeZoneId ? service.dateForTimezone(AppOptions.hotel.addressInfo.timeZoneId) : moment(date).utcOffset(AppOptions.hotel.addressInfo.offset/60);
			
			} else {
				// AppOptions.defaultOffset è in secondi
				return moment(date).utcOffset((AppOptions.defaultOffset || 0)/60);
			}
		};
		
		service.convertDateStringsToDates = function(input, maxDeepLevel, currentLevel) {
		    // Ignore things that aren't objects.
		    if (typeof input !== "object"){ return input;}
		    
		    maxDeepLevel = maxDeepLevel ? maxDeepLevel : 10;
		    currentLevel = currentLevel ? currentLevel : 0; 
		    
		    var $$pattern = REGEXP && REGEXP.dateString ? REGEXP.dateString : /^(\d{4}|\+\d{6})(?:-(\d{2})(?:-(\d{2})(?:T(\d{2}):(\d{2}):(\d{2})\.(\d{1,})(Z|([\-+])((\d{2}):(\d{2})|(\d{4})))?)?)?)?$/;
		    
		    for (var key in input) {
		        if (!input.hasOwnProperty(key)){ continue;}

		        var value = input[key];
		        var match;
		        // Check for string properties which look like dates.
		        if (typeof value === "string" && (match = value.match($$pattern))) {
		        	var data = match[0];
		        	
		        	try {
		        		input[key] = moment(data, moment.HTML5_FMT.DATETIME_LOCAL_MS).toDate();
		        		data = undefined;
		        		
		        	} catch(e) {
		        		$log.warn("Error converting date '" + data + "': " + e);
		        	}
		        } else if (typeof value === "object") {
		            // Recurse into object
		        	if (currentLevel < maxDeepLevel) {
		        		service.convertDateStringsToDates(value, maxDeepLevel, currentLevel+1);
		        	}
		        }
		    }
		};
		
		service.convertDatesToUTC = function(input, maxDeepLevel, currentLevel) {
		    // Ignore things that aren't objects.
		    if (typeof input !== "object"){ return input;}
		    
		    maxDeepLevel = maxDeepLevel ? maxDeepLevel : 10;
		    currentLevel = currentLevel ? currentLevel : 0; 
		    
		    for (var key in input) {
		        if (!input.hasOwnProperty(key)){ continue;}

		        var value = input[key];
		        
		        if (angular.isDate(value) || moment.isMoment(value)) {
		        	try {
		        		input[key] = service.absoluteDate(value);
		        		
		        	} catch(e) {
		        		$log.warn("Error converting date to utc'" + data + "': " + e);
		        	}
		        	
		        } else if (typeof value === "object") {
		            // Recurse into object
		        	if (currentLevel < maxDeepLevel) {
		        		service.convertDatesToUTC(value, maxDeepLevel, currentLevel+1);
		        	}
		        }
		    }
		};
		
		service.weekdays = function() {
			var weekdays = [];
			
			_.forEach(moment.weekdays(true), function(value, index) {
				var currentDay = moment().day(value);
				
				weekdays.push({
					label: value, 
					labelShort: moment.weekdaysShort(true, index),
					day: currentDay.day(), 
					weekday: currentDay.weekday(), 
					isoWeekday: currentDay.isoWeekday()
				});
			});
			
			return weekdays;
		};
		
		/**
		 * Restituisce il valore dell'offset (nel formato per il dateFilter) in base
		 * ai secondi (offsetSeconds) passati.
		 * 
		 */
		service.secondsToOffsetString = function(offsetSeconds) {
			if (_.isNil(offsetSeconds)) return "";
			
			offsetSeconds = Number(offsetSeconds);
			if (_.isNaN(offsetSeconds)) {
				return "";
			}
			
		    var h = String(Math.floor(Math.abs(offsetSeconds) / 3600));
		    h = h.length < 2 ? "0" + h : h;
		    var m = String(Math.floor(Math.abs(offsetSeconds) % 3600 / 60));
		    m = m.length < 2 ? "0" + m : m;
		    
		    return (offsetSeconds > 0 ? "+" : "-") + h + m;
		};
		
		/**
		 * Restituisce un boolean se l'orario è nel range
		 */
		service.timeRangeCheck = function(time, startTime, endTime) {
			var arrivalTime = moment.utc(time).seconds(0).milliseconds(0);
			
			var originalStart = moment.utc(startTime);
			var start = moment(arrivalTime).hours(originalStart.hours()).minutes(originalStart.minutes()).seconds(0).milliseconds(0);
			
			var originalEnd = moment.utc(endTime);
			var end = moment(arrivalTime).hours(originalEnd.hours()).minutes(originalEnd.minutes()).seconds(0).milliseconds(0);
						
			end = (end.hours() >= start.hours() && end.hours() <= 23) ? end : end.add(1, "days");
			arrivalTime = (arrivalTime.hours() >= start.hours() && arrivalTime.hours() <= 23) ? arrivalTime : arrivalTime.add(1, "days");
			
			return moment.range(start, end).contains(arrivalTime);
		};
		
		service.diff = function(start, end, unit, showFloat) {
			return moment(end).startOf("day").diff(moment(start).startOf("day"), unit || "days", _.isBoolean(showFloat) ? showFloat : false);
		};
		
		service.to = function(start, end, noSuffix) {
			return moment(start).startOf("day").to(moment(end).startOf("day"), _.isBoolean(noSuffix) ? noSuffix : false);
		};
		
		return service;	
	}
})();