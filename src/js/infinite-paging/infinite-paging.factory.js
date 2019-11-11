/**
 * Servizio per caricamento elementi per Infinite-Scroll
 * 
 */
(function() {
	'use strict';
	
	angular.module("itaca.utils").factory('InfinitePaging', InfinitePagingFactory);
	
	function InfinitePagingFactory(filterFilter, $log, $timeout, $q, Notification) {
		var $$service = function(/** Service to call for elements OR elements arrays */ source, 
				/** Params Map Object */ params, /** Name of the service's  function */ serviceFnName, postBody) {
	 
			var _self = this;
			
			this.source = source;
			this.$$sourceType = angular.isArray(this.source) ? 1 : (angular.isObject(this.source) ? 2 : -1);
			this.serviceFnName = serviceFnName ? serviceFnName : 'all';
			this.params = params;
			this.defaultSize = 10;
			this.page = 0;
			this.totalPages = 0;
		    this.items = [];
		    this.totalItems = 0;
		    this.lastPage = false;
		    this.busy = false;
		    this.executed = false;
		    this.newItems = false,
		    this.postBody = postBody,
		    
		    this.nextPage = function() {
		    	// reference to this Object
	    		var deferred = $q.defer();
	    		
		    	return $timeout(function() {	    		
		    		
			    	if (_self.source) {
			    		if (_self.busy || _self.lastPage) {
		    				$log.debug(_self.busy ? "Service busy" : "Service reached last page");
			    			deferred.resolve();
	// return deferred.promise;
		    				return;
		    			}
			    		
			    		if (_self.$$sourceType == 1) {
			    			// ARRAY SOURCE
			    			_self.busy = true;
			    			
			    			if (!angular.isObject(_self.params)) {
				    			_self.params = {};
				    		}
			    			
			    			if (angular.isUndefined(_self.params.size) || Number.isNaN(_self.params.size) || _self.params.size <= 0) {
				    			_self.params.size = _self.defaultSize;
				    		}
			    			
			    			if (_self.page < 0) {
				    			_self.page = 0;
				    		}
			    			
			    			// workin array source
			    			var arr = _self.source;
			    			
			    			// apply sort if exists
			    			if (_self.params.sort) {
			    				var sortFields, sortOrders;
			    				
				    			_.forEach(_self.params.sort, function(value) {
				    				var sortArr = value.split(",");
				    				if (!sortFields) {
				    					sortFields = [];
				    				}
				    				sortFields.push(sortArr[0]);
				    				
				    				if (sortArr[1]) {
					    				if (!sortOrders) {
					    					sortOrders = [];
					    				}
					    				sortOrders.push(sortArr[1]);
				    				}
				    			});
				    			
				    			arr = _.orderBy(_self.source, sortFields, sortOrders);
			    			}
			    			
			    			// apply filter if exists
			    			arr = _self.params.filter && !_.isEmpty(_.trim(_self.params.filter))? filterFilter(arr, {$: _self.params.filter}) : arr; 
			    			
			    			_self.totalItems = arr.length;
			    			_self.totalPages = Math.ceil(_self.totalItems / _self.params.size);    			
			    			
			    			var start = _self.params.size * _self.page;
			    			var end = start + _self.params.size - 1;		    			
			    			
			    			if (end > arr.length) {
			    				end = arr.length;
			    				_self.lastPage = true;
			    			}
			    			
			    			var newItems = arr.slice(start, end);
			    			
			    			if (newItems && newItems.length > 0) {	
			    				if (_self.params.filter) {
			        				_self.items = [];
			        			}
			    				
			    				angular.forEach(newItems, function(value, key) {
				        		  this.push(value);
				        		}, _self.items);
				        		
				        		_self.newItems = true;
				        		// page increment
				        		_self.page++;
				        		
			        		} else {
			        			_self.newItems = false;
			        		}
			    			
			    			_self.executed = true;
			    			
			    			$timeout(function() {
			    				_self.busy = false;
			    			});
			    			
			    			deferred.resolve();
			    		
			    		} else if (_self.$$sourceType == 2) {
			    			// SERVICE SOURCE
			    			
				    		if (_self.serviceFnName && !angular.isFunction(_self.source[_self.serviceFnName])) {
				    			$log.error("Service has no '" + _self.serviceFnName + "' function");
				    			deferred.reject("Service has no '" + _self.serviceFnName + "' function");
	// return deferred.promise;
				    			return;
				    		}
				    		
			    			_self.busy = true;
				    		
				    		if (!angular.isObject(_self.params)) {
				    			_self.params = {};
				    		}
				    		
				    		if (angular.isUndefined(_self.params.size) || Number.isNaN(_self.params.size) || _self.params.size <= 0) {
				    			_self.params.size = _self.defaultSize;
				    		}
				    		
				    		if (_self.page < 0) {
				    			_self.page = 0;
				    		}
				    		
				    		_self.params.page = _self.page;
				    		
				    		var fnToCall = _self.serviceFnName ? _self.serviceFnName : 'all';
				    			    			    		
				    		_self.source[fnToCall](_self.params, _self.postBody).then(function(data) {
				    			var newItems = data.content;
				    			_self.totalPages = data.totalPages;
				    			_self.totalItems = data.totalElements;
				    			_self.lastPage = data.last;
				    			
				        		if (newItems && newItems.length > 0) {
				        			if (_self.params.filter) {
				        				_self.items = [];
				        			}
				        			
					        		angular.forEach(newItems, function(value, key) {
					        		  this.push(value);
					        		}, _self.items);
					        		
					        		_self.newItems = true;
					        		// page increment
					        		_self.page++;
					        		
				        		} else {
				        			_self.newItems = false;
				        		}
				        		
				        		deferred.resolve();
				        		
				    		}, function(errorMsg) {
					        	$log.error(errorMsg);
					        	Notification.error(errorMsg);
					        	deferred.reject(errorMsg);
				    		
				    		}).finally(function() {
					        		_self.busy = false;
					        		_self.executed = true;
					        		
				    			}, function() {
				    				_self.busy = false;
				    				_self.executed = true;
			    			});
			    		
			    		} else {
				    		$log.error("Source must be an array or a Service Object");
				    		deferred.reject("Source must be an array or a Service Object");
	// return deferred.promise;
			    		}
				    		
			    	} else {
			    		$log.error("Source is not defined");
			    		deferred.reject("Source is not defined");
	// return deferred.promise;
			    	}
			    	
	// return deferred.promise;
			    	
		    	}, 500).then(function() {
		    		return deferred.promise;
		    	});
		    };
		    
		    this.reload = function() {
	// // workaround per le promise
		    	if(!_self) {
		    		return;
		    	}
		    	
		    	_self.reset();
			    return _self.nextPage();
		    };
		    
		    this.reset = function() {
		    	_self.busy = false;
		    	_self.executed = false;
		    	_self.lastPage = false;
		    	_self.page = 0;
		    	_self.totalPages = 0;
		    	_self.totalItems = 0;
			    _self.items = [];
			    _self.newItems = false;
	// _self.resetParams();
		    };
		    
		    this.resetParams = function(){
		    	_.forEach(_self.params, function(value, key, collection) {
		    		if (key != "size" && key != "page" && key != "sort") {
		    			collection[key] = undefined;
		    		}
		    	});
		    };
		    
		    this.resetAndReload = function(){
		    	_self.resetParams();
		    	_self.reload();
		    };
		    
		    // per md-virtual-repeat 
		    
	        this.getItemAtIndex = function(index) {
	            if (!_self.items[index]) {
	              _self.nextPage();
	              return null;
	            }

	            console.log("Getting item " + index);
	            return _self.items[index];
	        };

	        this.getLength = function() {
	        	console.log("Length " + _self.totalItems);
	        	return _self.totalItems;
	        };
		};
		
		return $$service;
	}
})();