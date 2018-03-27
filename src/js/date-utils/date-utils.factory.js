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
		
		service.absoluteDate = function(date, keepTime) {
			return service.absoluteMoment(date, keepTime).toDate();
		};
		
		service.absoluteMoment = function(date, keepTime) {
			var m = date ? moment(date) : moment();
			var absMoment = moment(m).utc([m.year(), m.month(), m.date()]);
			return keepTime ? absMoment : absMoment.startOf("day");
		};
		
		service.dateForTimezone = function(date, timeZoneId) {
			return moment.tz(date, timeZoneId);
		};
		
		service.hotelDate = function(date) {
			if (AppOptions.hotel && AppOptions.hotel.addressInfo && AppOptions.hotel.addressInfo.timeZoneId) {
				return service.dateForTimezone(AppOptions.hotel.addressInfo.timeZoneId);
			
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
		    
		    for (var key in input) {
		        if (!input.hasOwnProperty(key)){ continue;}

		        var value = input[key];
		        var match;
		        // Check for string properties which look like dates.
		        if (typeof value === "string" && (match = value.match(REGEXP.dateString))) {
		        	var data = match[0];
		        	
		        	try {
		        		var milliseconds = Date.parse(data);
		                if (!isNaN(milliseconds)) {
		                    input[key] = new Date(milliseconds);
		                }
		        		data = undefined;
		        		milliseconds = undefined;
		        		
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
		
		return service;	
	}
})();