/*****************************************************************/
/** itaca-ng-utils v1.0.0 14-11-2017	**/
/** itaca-ng-utils, logos and all images are registered     	**/
/** trademarks of Chroma Italy Hotels srl.                     	**/
/** All rights reserved.                                     	**/
/** Registration code: 21-11-2016/011058        	**/
/** 						                                 	**/
/**                               Chroma Italy Hotels srl ® 2017	**/
/*****************************************************************/
(function() {
    "use strict";
    angular.module("itaca.utils", [ "ngMaterial", "itaca.services", "pascalprecht.translate", "tmh.dynamicLocale", "LocalStorageModule" ]);
    angular.module("itaca.utils").config([ "$windowProvider", "$translateProvider", "tmhDynamicLocaleProvider", function($windowProvider, $translateProvider, tmhDynamicLocaleProvider) {
        var defaultLocale = ($windowProvider.$get().navigator.language || $windowProvider.$get().navigator.userLanguage).split("-")[0].toLowerCase();
        $translateProvider.useLoader("i18nLoader");
        $translateProvider.preferredLanguage(defaultLocale);
        $translateProvider.useCookieStorage();
        $translateProvider.useMissingTranslationHandlerLog();
        $translateSanitizationProvider.addStrategy("sce", "sceStrategy");
        $translateProvider.useSanitizeValueStrategy("sce");
        tmhDynamicLocaleProvider.localeLocationPattern("/resources/public/js/i18n/angular-locale_{{locale}}.js");
        tmhDynamicLocaleProvider.useCookieStorage();
        tmhDynamicLocaleProvider.defaultLocale(defaultLocale);
    } ]);
})();

(function() {
    "use strict";
    angular.module("itaca.utils").provider("AppOptions", AppOptionsProvider);
    function AppOptionsProvider() {
        var $$options = {
            defaultLang: "en",
            page: {
                title: "Home"
            }
        };
        this.init = function(options, override) {
            if (!_.isPlainObject(options)) {
                return false;
            }
            if (_.isBoolean(override) && override) {
                $$options = options;
            } else {
                _.assign($$options, options);
            }
        };
        this.$get = function() {
            return new AppOptions($$options);
        };
    }
    function AppOptions(options) {
        var $$service = this;
        this.$init = function() {
            if (_.isArray(options)) {
                _.forEach(options, function(value, key) {
                    $$service.addOption(key, value);
                });
            }
        };
        this.addOption = function(key, value) {
            if (!angular.isString(key)) {
                return false;
            }
            $$service[key] = value;
            return true;
        };
        this.addOptionStrict = function(key, value) {
            if (!angular.isString(key)) {
                return false;
            }
            if ($$service.hasOwnProperty(key)) {
                return false;
            }
            $$service[key] = value;
            return true;
        };
        this.updateOption = function(key, value) {
            if (!angular.isString(key)) {
                return false;
            }
            if (!$$service.hasOwnProperty(key)) {
                return $$service.addOption(key, value);
            }
            var previous = $$service[key];
            $$service[key] = value;
            return previous;
        };
        this.$init();
    }
})();

(function() {
    "use strict";
    BeforeUnloadFactory.$inject = [ "$rootScope", "$window" ];
    angular.module("itaca.utils").factory("_beforeUnload", BeforeUnloadFactory);
    function BeforeUnloadFactory($rootScope, $window) {
        var unloadEvent = function(e) {
            var confirmation = {};
            var event = $rootScope.$broadcast("onBeforeUnload", confirmation);
            if (event.defaultPrevented) {
                return confirmation.message;
            }
        };
        $window.addEventListener("beforeunload", unloadEvent);
        $window.onbeforeunload = unloadEvent;
        $window.onunload = function() {
            $rootScope.$broadcast("onUnload");
        };
        return {};
    }
})();

(function() {
    "use strict";
    angular.module("itaca.utils").factory("ContactUtils", ContactUtilsFactory);
    function ContactUtilsFactory() {
        var service = {};
        service.getUri = function(type, value) {
            var uri = "";
            switch (type) {
              case "PHONE":
                uri = "tel:";
                break;

              case "MOBILE":
                uri = "tel:";
                break;

              case "FAX":
                uri = "tel:";
                break;

              case "MAIL":
                uri = "mailto:";
                break;

              case "WEBSITE":
                uri = "http://";
                break;

              case "FACEBOOK":
                uri = "https://www.facebook.com/";
                break;

              case "TWITTER":
                uri = "https://www.twitter.com/";
                break;

              case "INSTAGRAM":
                uri = "https://www.instagram.com/";
                break;

              default:
                uri = "http://";
            }
            return uri + value;
        };
        return service;
    }
})();

(function() {
    "use strict";
    DateUtilsFactory.$inject = [ "$log", "moment", "REGEXP", "AppOptions" ];
    angular.module("itaca.utils").factory("DateUtils", DateUtilsFactory);
    function DateUtilsFactory($log, moment, REGEXP, AppOptions) {
        var service = {};
        service.absoluteDate = function(date, keepTime) {
            return service.absoluteMoment(date, keepTime).toDate();
        };
        service.absoluteMoment = function(date, keepTime) {
            var m = date ? moment(date) : moment();
            var absMoment = moment(m).utc([ m.year(), m.month(), m.date() ]);
            return keepTime ? absMoment : absMoment.startOf("day");
        };
        service.dateForTimezone = function(date, timeZoneId) {
            return moment.tz(date, timeZoneId);
        };
        service.hotelDate = function(date) {
            if (AppOptions.hotel && AppOptions.hotel.addressInfo && AppOptions.hotel.addressInfo.timeZoneId) {
                return service.dateForTimezone(AppOptions.hotel.addressInfo.timeZoneId);
            } else {
                return moment(date).utcOffset((AppOptions.defaultOffset || 0) / 60);
            }
        };
        service.convertDateStringsToDates = function(input, maxDeepLevel, currentLevel) {
            if (typeof input !== "object") {
                return input;
            }
            maxDeepLevel = maxDeepLevel ? maxDeepLevel : 10;
            currentLevel = currentLevel ? currentLevel : 0;
            for (var key in input) {
                if (!input.hasOwnProperty(key)) {
                    continue;
                }
                var value = input[key];
                var match;
                if (typeof value === "string" && (match = value.match(REGEXP.dateString))) {
                    var data = match[0];
                    try {
                        var milliseconds = Date.parse(data);
                        if (!isNaN(milliseconds)) {
                            input[key] = new Date(milliseconds);
                        }
                        data = undefined;
                        milliseconds = undefined;
                    } catch (e) {
                        $log.warn("Error converting date '" + data + "': " + e);
                    }
                } else if (typeof value === "object") {
                    if (currentLevel < maxDeepLevel) {
                        service.convertDateStringsToDates(value, maxDeepLevel, currentLevel + 1);
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
                    day: currentDay.day(),
                    weekday: currentDay.weekday(),
                    isoWeekday: currentDay.isoWeekday()
                });
            });
            return weekdays;
        };
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
        service.rangeTimeChecker = function(time, startTime, endTime) {
            var arrivalTime = moment.utc(time).seconds(0).milliseconds(0);
            var originalStart = moment.utc(startTime);
            var start = moment(arrivalTime).hours(originalStart.hours()).minutes(originalStart.minutes()).seconds(0).milliseconds(0);
            var originalEnd = moment.utc(endTime);
            var end = moment(arrivalTime).hours(originalEnd.hours()).minutes(originalEnd.minutes()).seconds(0).milliseconds(0);
            end = end.hours() >= start.hours() && end.hours() <= 23 ? end : end.add(1, "days");
            arrivalTime = arrivalTime.hours() >= start.hours() && arrivalTime.hours() <= 23 ? arrivalTime : arrivalTime.add(1, "days");
            return moment.range(start, end).contains(arrivalTime);
        };
        return service;
    }
})();

(function() {
    "use strict";
    FormUtilsFactory.$inject = [ "$document" ];
    angular.module("itaca.utils").factory("FormUtils", FormUtilsFactory);
    function FormUtilsFactory($document) {
        var service = {};
        service.focusFirstInvalid = function(formName) {
            var form = angular.isObject(formName) ? formName : document.getElementsByName(formName)[0];
            if (!form || !angular.isElement(form) || !angular.isFunction(form.querySelector)) return;
            var firstInvalid = form.querySelector(".ng-invalid:not([disabled]):not([type='hidden'])");
            if (firstInvalid) {
                if (_.isEqual(firstInvalid.tagName.toLowerCase(), "ng-form")) {
                    return service.focusFirstInvalid(firstInvalid);
                } else {
                    firstInvalid.focus();
                    $document.scrollToElementAnimated(firstInvalid);
                    return true;
                }
            }
            return false;
        };
        service.focusFirstInput = function(formName) {
            var form = angular.isObject(formName) ? formName : document.getElementsByName(formName)[0];
            if (!form || !angular.isElement(form) || !angular.isFunction(form.querySelector)) return;
            var firstInput = form.querySelector("input:not([disabled]):not([type='hidden'])");
            if (firstInput) {
                firstInput.focus();
                $document.scrollToElementAnimated(firstInput, service.offset);
                return true;
            }
            return false;
        };
        service.isInvalid = function(formName) {
            var form = document[formName];
            if (!form || !angular.isFunction(form.querySelector)) return;
            var firstInvalid = form.querySelector(".ng-invalid");
            if (firstInvalid) {
                return true;
            }
            return false;
        };
        return service;
    }
})();

(function() {
    "use strict";
    HtmlUtilsFactory.$inject = [ "$window" ];
    angular.module("itaca.utils").factory("HtmlUtils", HtmlUtilsFactory);
    function HtmlUtilsFactory($window) {
        var service = {};
        service.isElementInView = function(el, fullyInView) {
            var element = angular.element(el)[0];
            if (!element) {
                return false;
            }
            var pageTop = $window.pageYOffset;
            var pageBottom = pageTop + $window.innerHeight;
            var elementTop = element.offsetTop;
            var elementBottom = elementTop + element.offsetHeight;
            if (fullyInView === true) {
                return pageTop < elementTop && pageBottom > elementBottom;
            } else {
                return elementTop <= pageBottom && elementBottom >= pageTop;
            }
        };
        service.getScrollParent = function(el) {
            var element = angular.element(el)[0];
            if (element === null) {
                return null;
            }
            if (element.scrollHeight > element.clientHeight) {
                return element;
            } else {
                return service.getScrollParent(element.parentNode);
            }
        };
        return service;
    }
})();

(function() {
    "use strict";
    angular.module("itaca.utils").provider("i18nLoader", i18nLoaderProvider);
    function i18nLoaderProvider() {
        var $$i18nResources = "/api/rs/public/i18n";
        this.setResources = function(resources) {
            if (!angular.isString(resources) && angular.isArray(resources)) {
                return false;
            }
            $$i18nResources = resources;
        };
        this.$get = [ "$log", "$http", "$q", "$interpolate", function($log, $http, $q, $interpolate) {
            return new i18nLoader($log, $http, $q, $interpolate, $$i18nResources);
        } ];
    }
    function i18nLoader($log, $http, $q, $interpolate, i18nResources) {
        return function(options) {
            var urls = [];
            if (angular.isString(i18nResources)) {
                urls.push(i18nResources);
            } else if (angular.isArray(i18nResources)) {
                urls = i18nResources;
            } else {
                return;
            }
            var requestParams = {};
            requestParams[options.queryParameter || "lang"] = options.key.toLowerCase().replace(/-/g, "_");
            var interpolateContext = {
                lang: options.key
            };
            var promises = [];
            _.forEach(urls, function(url) {
                var langUrl = $interpolate(url)(interpolateContext);
                var promise = $http.get(langUrl, angular.extend({
                    params: requestParams
                }, options.$http)).then(function(result) {
                    return result.data;
                }, function() {
                    $log.error("Error getting translations from url: " + langUrl + " - lang: " + options.key);
                    return $q.reject(options.key);
                });
                promises.push(promise);
            });
            var deferred = $q.defer();
            $q.all(promises).then(function(data) {
                var length = data.length, mergedData = {};
                for (var i = 0; i < length; i++) {
                    for (var key in data[i]) {
                        mergedData[key] = data[i][key];
                    }
                }
                deferred.resolve(mergedData);
            }, function(data) {
                deferred.reject(data);
            });
            return deferred.promise;
        };
    }
})();

(function() {
    "use strict";
    angular.module("itaca.utils").factory("IconUtils", IconUtilsFactory);
    function IconUtilsFactory() {
        var service = {};
        service.languageIcons = function() {
            return {
                ITALIAN: {
                    icon: "flag-icon flag-icon-it"
                },
                ENGLISH: {
                    icon: "flag-icon flag-icon-gb"
                },
                FRENCH: {
                    icon: "flag-icon flag-icon-fr"
                },
                SPANISH: {
                    icon: "flag-icon flag-icon-es"
                },
                GERMAN: {
                    icon: "flag-icon flag-icon-de"
                },
                PORTUGUESE: {
                    icon: "flag-icon flag-icon-pt"
                },
                RUSSIAN: {
                    icon: "flag-icon flag-icon-ru"
                },
                MANDARIN: {
                    icon: "flag-icon flag-icon-cn"
                },
                HINDI: {
                    icon: "flag-icon flag-icon-in"
                },
                ARABIC: {
                    icon: "flag-icon flag-icon-sa"
                },
                BENGALI: {
                    icon: "flag-icon flag-icon-bd"
                },
                JAPANESE: {
                    icon: "flag-icon flag-icon-jp"
                },
                PUNJABI: {
                    icon: "flag-icon flag-icon-pk"
                },
                JAVANESE: {
                    icon: "flag-icon flag-icon-id"
                },
                WU: {
                    icon: "flag-icon flag-icon-cn"
                },
                MALAY_INDONESIAN: {
                    icon: "flag-icon flag-icon-in"
                },
                TELUGU: {
                    icon: "flag-icon flag-icon-in"
                },
                VIETNAMESE: {
                    icon: "flag-icon flag-icon-vn"
                },
                MARATHI: {
                    icon: "flag-icon flag-icon-in"
                },
                TAMIL: {
                    icon: "flag-icon flag-icon-lk"
                },
                URDU: {
                    icon: "flag-icon flag-icon-ae"
                },
                TURKISH: {
                    icon: "flag-icon flag-icon-tr"
                },
                LANG_SIGN: {
                    icon: "material-icons flaticon-hearing-impaired"
                },
                LANG_SIGN_IT: {
                    icon: "material-icons flaticon-hearing-impaired"
                }
            };
        };
        service.contactIcons = function() {
            return {
                PHONE: {
                    icon: "mdi mdi-phone",
                    type: "contact.phone",
                    prefix: "tel:",
                    suffix: ""
                },
                MOBILE: {
                    icon: "mdi mdi-cellphone-android",
                    type: "contact.mobile",
                    prefix: "tel:",
                    suffix: ""
                },
                FAX: {
                    icon: "mdi mdi-fax",
                    type: "contact.fax",
                    prefix: "tel:",
                    suffix: ""
                },
                EMAIL: {
                    icon: "mdi mdi-email",
                    type: "contact.email",
                    prefix: "mailto:",
                    suffix: ""
                },
                WEBSITE: {
                    icon: "mdi mdi-web",
                    type: "contact.website",
                    prefix: "",
                    suffix: ""
                },
                FACEBOOK: {
                    icon: "mdi mdi-facebook-box",
                    type: "contact.facebook",
                    prefix: "https://facebook.com/",
                    suffix: ""
                },
                TWITTER: {
                    icon: "mdi mdi-twitter-box",
                    type: "contact.twitter",
                    prefix: "https://twitter.com/",
                    suffix: ""
                },
                INSTAGRAM: {
                    icon: "mdi mdi-instagram",
                    type: "contact.instagram",
                    prefix: "https://www.instagram.com/",
                    suffix: ""
                },
                WHATSAPP: {
                    icon: "mdi mdi-whatsapp",
                    type: "contact.whatsapp",
                    prefix: bowser.ios ? "whatsapp://send?" : "intent://send/",
                    suffix: bowser.ios ? "" : "#Intent;scheme=smsto;package=com.whatsapp;action=android.intent.action.SENDTO;end"
                },
                SKYPE: {
                    icon: "mdi mdi-skype",
                    type: "contact.skype",
                    prefix: "skype://",
                    suffix: "?call"
                },
                VIBER: {
                    icon: "mdi mdi-phone",
                    type: "contact.viber",
                    prefix: "viber://forward?",
                    suffix: ""
                },
                TELEGRAM: {
                    icon: "mdi mdi-telegram",
                    type: "contact.telegram",
                    prefix: "tg://",
                    suffix: ""
                }
            };
        };
        service.paymentIcons = function() {
            return {
                PAYPAL: "pf pf-paypal",
                VISA: "pf pf-visa",
                MASTERCARD: "pf pf-mastercard",
                AMEX: "pf pf-american-express",
                BIT_COIN: "pf pf-bitcoin",
                CARTA_SI: "pf pf-carta-si",
                DINERS_CLUB: "pf pf-diners",
                DISCOVER: "pf pf-discover",
                JCB: "pf pf-jcb",
                UNION_PAY: "pf pf-unionpay",
                VISA_ELECTRON: "pf pf-visa-electron",
                V_PAY: "pf pf-visa",
                MAESTRO: "pf pf-maestro",
                CIRRUS: "pf pf-cirrus",
                POSTEPAY: "pf pf-postepay",
                APPLE_PAY: "pf pf-apple-pay",
                PAGSEGURO: "pf pf-pagseguro",
                BANCONTACT: "pf pf-bancontact-mister-cash",
                BANCOMAT: "pf pf-card"
            };
        };
        service.serviceIcon = function() {
            return {
                "service.type.technology.console": "mdi mdi-gamepad-variant",
                "service.type.technology.games": "mdi mdi-gamepad-variant",
                "service.type.technology.tv.flat": "mdi mdi-monitor",
                "service.type.technology.tv": "mdi mdi-monitor",
                "service.type.entertainment.children.tv": "mdi mdi-monitor",
                "service.type.popular.pet.small": "mdi mdi-paw",
                "service.type.popular.pet.medium": "mdi mdi-paw",
                "service.type.popular.pet.large": "mdi mdi-paw",
                "service.type.popular.pet.disabled": "mdi mdi-paw",
                "service.type.popular.router": "mdi mdi-router-wireless",
                "service.type.miscellaneous.air.conditioning": "mdi mdi-air-conditioner",
                "service.type.room.air.conditioning": "mdi mdi-air-conditioner",
                "service.type.miscellaneous.heating": "mdi mdi-air-conditioner",
                "service.type.transport.parking.secured": "mdi mdi-parking",
                "service.type.transport.parking.street": "mdi mdi-parking",
                "service.type.transport.parking.accessible": "mdi mdi-parking",
                "service.type.popular.bouquet": "mdi mdi-flower",
                "service.type.popular.rose": "mdi mdi-flower",
                "service.type.popular.breakfast.continental": "mdi mdi-food-fork-drink",
                "service.type.popular.breakfast": "mdi mdi-food-fork-drink",
                "service.type.popular.breakfast.room": "mdi mdi-food-fork-drink",
                "service.type.miscellaneous.non­smoking.throughout": "mdi mdi-smoking-off",
                "service.type.miscellaneous.non­smoking.rooms": "mdi mdi-smoking-off",
                "service.type.popular.smoking.area": "mdi mdi-smoking",
                "service.type.popular.smoking.room": "mdi mdi-smoking",
                "service.type.popular.wifi.room": "mdi mdi-wifi",
                "service.type.popular.wifi.all": "mdi mdi-wifi",
                "service.type.popular.internet.point": "mdi mdi-wifi"
            };
        };
        service.transfersIcon = function() {
            return {
                CAR: "flaticon-car-black-side-view-pointing-left",
                LIMOUSINE: "flaticon-sedan-car-model",
                PULLMAN: "flaticon-bus-front",
                SHUTTLE: "flaticon-microbus",
                MINIVAN: "flaticon-van-black-transport-side-view-pointing-to-left",
                LUXURY_CAR: "flaticon-supercar"
            };
        };
        service.portalIcons = function() {
            return {
                PHONE: "mdi mdi-phone material-icons",
                EMAIL: "mdi mdi-email material-icons",
                PORTAL: "channel-icon channel-chroma",
                BOOKING: "channel-icon channel-booking",
                EXPEDIA: "channel-icon channel-expedia",
                VENERE: "channel-icon channel-venere",
                AIRBNB: "channel-icon channel-airbnb",
                AGODA: "channel-icon channel-agoda",
                OTHER: "mdi mdi-web material-icons"
            };
        };
        return service;
    }
})();

(function() {
    "use strict";
    JsonDateInterceptorFactory.$inject = [ "DateUtils" ];
    angular.module("itaca.utils").factory("jsonDateInterceptor", JsonDateInterceptorFactory);
    function JsonDateInterceptorFactory(DateUtils) {
        var service = {};
        service.response = function(response) {
            DateUtils.convertDateStringsToDates(response);
            return response;
        };
        return service;
    }
})();

(function() {
    "use strict";
    angular.module("itaca.utils").factory("NumberUtils", NumberUtilsFactory);
    function NumberUtilsFactory() {
        var service = {};
        service.fixedDecimals = function(number, count) {
            if (!number || number === 0) {
                return 0;
            }
            var n = Number(number).toFixed(count || 2);
            return Number(n).valueOf();
        };
        service.vatAmount = function(price, vatRate) {
            return this.fixedDecimals(price - this.taxableAmount(price, vatRate));
        };
        service.taxableAmount = function(price, vatRate) {
            return this.fixedDecimals(vatRate ? price / ((100 + vatRate) / 100) : price);
        };
        service.calculateDiscount = function(price, discount, discountType) {
            if (!price || !discount) {
                return 0;
            }
            price = parseFloat(price);
            discount = parseFloat(discount);
            discountType = discountType || "PRICE";
            return service.fixedDecimals(discountType == "PERCENTAGE" ? price / 100 * discount : 100 * discount / price);
        };
        service.uniqueNumber = function() {
            var date = Date.now();
            if (date <= service.uniqueNumber.previous) {
                date = ++service.uniqueNumber.previous;
            } else {
                service.uniqueNumber.previous = date;
            }
            return date;
        };
        service.uniqueNumber.previous = 0;
        service.isEven = function(n) {
            return n % 2 == 0;
        };
        service.isOdd = function(n) {
            return Math.abs(n % 2) == 1;
        };
        service.defaultNumber = function(num, defaultNum) {
            var ret = Number(num);
            return isNaN(ret) ? service.defaultNumber(defaultNum, 0) : ret;
        };
        service.lcmArray = function(numArray) {
            if (!_.isArray(numArray) || _.isEmpty(numArray)) {
                return false;
            }
            var lcm = numArray[0];
            for (var i = 1; i < numArray.length; i++) {
                lcm = service.lcm(lcm, numArray[i]);
            }
            return lcm;
        };
        service.lcm = function(x, y) {
            if (typeof x !== "number" || typeof y !== "number") {
                return false;
            }
            return !x || !y ? 0 : Math.abs(x * y / service.gcd(x, y));
        };
        service.gcd = function gcd(x, y) {
            x = Math.abs(x);
            y = Math.abs(y);
            while (y) {
                var t = y;
                y = x % y;
                x = t;
            }
            return x;
        };
        return service;
    }
})();

(function() {
    "use strict";
    angular.module("itaca.utils").factory("ObjectUtils", ObjectUtilsFactory);
    function ObjectUtilsFactory() {
        var service = {};
        service.clearObject = function(object, exclusionsRegex) {
            if (!object) {
                return;
            }
            var clearObj = _.mapValues(object, function(value, key) {
                if (exclusionsRegex && exclusionsRegex.test(key)) {
                    return value;
                }
                if (_.isArray(value)) {
                    return [];
                }
                return undefined;
            });
            _.assign(object, clearObj);
        };
        return service;
    }
})();

(function() {
    "use strict";
    OfflineInterceptorFactory.$inject = [ "$q", "$log" ];
    angular.module("itaca.utils").factory("offlineInterceptor", OfflineInterceptorFactory);
    function OfflineInterceptorFactory($q, $log) {
        var service = {};
        service.request = function(config) {
            if (!navigator.onLine) {
                $log.warn("No connection! The request will be aborted: " + config.url);
                var canceler = $q.defer();
                config.timeout = canceler.promise;
                canceler.reject();
            }
            return config;
        };
    }
})();

(function() {
    "use strict";
    angular.module("itaca.utils").provider("PhoneUtils", PhoneUtilsProvider);
    function PhoneUtilsProvider() {
        var $dataUrl = "/phone-prefixes.json", $dataObj;
        this.setData = function(data) {
            if (_.isPlainObject(data)) {
                $dataObj = data;
            } else if (_.isString(data)) {
                $dataUrl = data;
            }
        };
        this.$get = [ "$resource", "$q", "$http", "libphonenumber", function($resource, $q, $http, libphonenumber) {
            return new PhoneUtils($resource, $q, $http, libphonenumber, $dataObj || $dataUrl);
        } ];
    }
    function PhoneUtils($resource, $q, $http, libphonenumber, data) {
        var $$service = this;
        this.init = function() {
            $$service.all();
        };
        this.all = function() {
            var deferred = $q.defer();
            if (_.isPlainObject(data)) {
                $$service.prefixes = data;
                deferred.resolve($$service.prefixes);
            } else if (_.isString(data)) {
                $http.get(data).then(function(response) {
                    $$service.prefixes = response.data.content;
                    deferred.resolve($$service.prefixes);
                }, function(response) {
                    deferred.reject("Error loading phone prefixes");
                });
            }
            return deferred.promise;
        };
        this.get = function(value, type) {
            if (_.isNil(value)) {
                return null;
            }
            if (_.isNil(type)) {
                type = "code";
            }
            var deferred = $q.defer();
            $$service.all().then(function(data) {
                var phoneObj = _.find(data, function(o) {
                    return o[type] == value;
                });
                deferred.resolve(phoneObj);
            }, function(error) {
                deferred.reject(error);
            });
            return deferred.promise;
        };
        this.compile = function(prefix, number) {
            return (prefix || "") + (number || "");
        };
        this.decompile = function(phone) {
            if (!phone) {
                return null;
            }
            var deferred = $q.defer();
            var phoneObj = $$service.decompileSimple(phone);
            if (phoneObj.prefix) {
                $$service.get(phoneObj.prefix, "dial_code").then(function(data) {
                    phoneObj.prefix = data;
                    deferred.resolve(phoneObj);
                }, function(error) {
                    deferred.resolve(phoneObj);
                });
            } else {
                deferred.resolve(phoneObj);
            }
            return deferred.promise;
        };
        this.decompileSimple = function(phone) {
            if (!phone) {
                return null;
            }
            var phoneObj = {};
            if (!_.isEmpty($$service.prefixes)) {
                var prefix = _.find($$service.prefixes, function(prefix) {
                    return phone.startsWith(prefix.dial_code);
                });
                if (prefix && prefix.dial_code) {
                    phoneObj.prefix = _.trim(prefix.dial_code);
                    phoneObj.number = _.trim(phone.substring(phone.indexOf(prefix.dial_code) + prefix.dial_code.length));
                } else {
                    phoneObj.number = phone;
                }
            } else {
                phoneObj.number = phone;
            }
            return phoneObj;
        };
    }
})();

(function() {
    "use strict";
    ProfileUtilsFactory.$inject = [ "$rootScope" ];
    angular.module("itaca.utils").factory("ProfileUtils", ProfileUtilsFactory);
    function ProfileUtilsFactory($rootScope) {
        var service = {};
        service.notifyNewProfileImage = function(data) {
            $rootScope.$broadcast("profile-image-updated", data);
        };
        service.notifyNewCoverImage = function(data) {
            $rootScope.$broadcast("cover-image-updated", data);
        };
        service.notifyLoadProfileImage = function(data) {
            $rootScope.$broadcast("load-image-profile", data);
        };
        return service;
    }
})();

(function() {
    "use strict";
    angular.module("itaca.utils").constant("REGEXP", REGEXP);
    var REGEXP = {
        username: /^[a-z0-9_.-@]{3,32}$/,
        password: /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&_+-]*)(?=\S+$).{8,32}$/,
        strong_password: /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&_+-])(?=\S+$).{8,32}$/,
        email: /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i,
        zip: /^[0-9]{5}$/,
        province: /^[a-zA-Z]{2}$/,
        phone: /^([+]{0,1}[0-9]{2,4}){1}[0-9]{3,11}$/,
        creditCard: /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/,
        price: /^[0-9]+(\.[0-9]{1,2})?$/,
        priceNoStrict: /^[-+]*[0-9]+(\.[0-9]{1,2})?$/,
        vat: /^((AT)?U[0-9]{8}|(BE)?0[0-9]{9}|(BG)?[0-9]{9,10}|(CY)?[0-9]{8}L|(CZ)?[0-9]{8,10}|(DE)?[0-9]{9}|(DK)?[0-9]{8}|(EE)?[0-9]{9}|(EL|GR)?[0-9]{9}|(ES)?[0-9A-Z][0-9]{7}[0-9A-Z]|(FI)?[0-9]{8}|(FR)?[0-9A-Z]{2}[0-9]{9}|(GB)?([0-9]{9}([0-9]{3})?|[A-Z]{2}[0-9]{3})|(HU)?[0-9]{8}|(IE)?[0-9]S[0-9]{5}L|(IT)?[0-9]{11}|(LT)?([0-9]{9}|[0-9]{12})|(LU)?[0-9]{8}|(LV)?[0-9]{11}|(MT)?[0-9]{8}|(NL)?[0-9]{9}B[0-9]{2}|(PL)?[0-9]{10}|(PT)?[0-9]{9}|(RO)?[0-9]{2,10}|(SE)?[0-9]{12}|(SI)?[0-9]{8}|(SK)?[0-9]{10})$/,
        fiscalCode: /^([A-Za-z]{6}[0-9lmnpqrstuvLMNPQRSTUV]{2}[abcdehlmprstABCDEHLMPRST]{1}[0-9lmnpqrstuvLMNPQRSTUV]{2}[A-Za-z]{1}[0-9lmnpqrstuvLMNPQRSTUV]{3}[A-Za-z]{1})|([0-9]{11})$/,
        dateString: /^(\d{4}|\+\d{6})(?:-(\d{2})(?:-(\d{2})(?:T(\d{2}):(\d{2}):(\d{2})\.(\d{1,})(Z|([\-+])((\d{2}):(\d{2})|(\d{4})))?)?)?)?$/
    };
})();

(function() {
    "use strict";
    ReservationUtilsFactory.$inject = [ "$translate", "NumberUtils", "ObjectUtils", "DateUtils", "LocalStorage", "RESERVATION" ];
    angular.module("itaca.utils").value("RESERVATION", {
        rooms: []
    });
    angular.module("itaca.utils").factory("ReservationUtils", ReservationUtilsFactory);
    function ReservationUtilsFactory($translate, NumberUtils, ObjectUtils, DateUtils, LocalStorage, RESERVATION) {
        var $$service = {};
        $$service.clearReservation = function(reservation, keepSearchParams) {
            if (keepSearchParams) {
                ObjectUtils.clearObject(reservation, /^(check(?:in$|out$))|^people$|^requestPeople$|^hotelId$/);
            } else {
                ObjectUtils.clearObject(reservation);
            }
        };
        $$service.storeLastReservation = function() {
            return LocalStorage.setReservation(RESERVATION);
        };
        $$service.loadLastReservation = function() {
            var lastHotelRes = LocalStorage.getReservation();
            if (!lastHotelRes) {
                lastHotelRes = _.mapValues(RESERVATION, function(value) {
                    if (_.isArray(value)) {
                        return [];
                    }
                    return undefined;
                });
                lastHotelRes.people = {
                    adults: 1
                };
            }
            _.assignIn(RESERVATION, lastHotelRes);
            DateUtils.convertDateStringsToDates(RESERVATION);
            if (RESERVATION && RESERVATION.checkin && RESERVATION.checkout && moment(RESERVATION.checkin).isBefore(DateUtils.absoluteMoment(), "days")) {
                RESERVATION = {
                    rooms: []
                };
                $$service.storeLastReservation();
            }
            return lastHotelRes;
        };
        $$service.availableNights = function(checkin, checkout, targetDate) {
            if (!checkin || !checkout) {
                return null;
            }
            var checkinMoment = DateUtils.absoluteMoment(checkin);
            var checkoutMoment = DateUtils.absoluteMoment(checkout);
            var targetMoment = _.isBoolean(targetDate) && !targetDate ? DateUtils.absoluteMoment(checkin) : targetDate ? DateUtils.absoluteMoment(targetDate) : DateUtils.absoluteMoment();
            if (checkoutMoment.isAfter(targetMoment, "days") && checkinMoment.isBefore(targetMoment, "days")) {
                return checkoutMoment.diff(targetMoment, "days");
            } else {
                return checkoutMoment.diff(checkinMoment, "days");
            }
        };
        $$service.calculateGuestDocuments = function(room) {
            room.identityDocuments = room.identityDocuments && room.identityDocuments.length > 0 ? room.identityDocuments : [];
            room.guestsCount = $$service.guestsCount(room.people, room.extraPeople);
            var totalGuest = parseInt(room.guestsCount.total);
            if (_.size(room.identityDocuments) > totalGuest) {
                room.identityDocuments = _.dropRight(room.identityDocuments, _.size(room.identityDocuments) - totalGuest);
            } else if (_.size(room.identityDocuments) < totalGuest) {
                var newGuests = totalGuest - _.size(room.identityDocuments);
                for (var i = 0; i < newGuests; i++) {
                    room.identityDocuments.push({});
                }
            }
        };
        $$service.peopleSummary = function(peopleObj, extraPeopleObj) {
            if (!peopleObj) {
                peopleObj = {};
            }
            if (!extraPeopleObj) {
                extraPeopleObj = {};
            }
            var guestsCount = $$service.guestsCount(peopleObj, extraPeopleObj);
            if (!guestsCount && guestsCount.total <= 0) {
                return $translate("people.none").then(function(message) {
                    return message;
                });
            } else {
                return $translate([ "people.adult", "people.adults", "people.child", "people.children", "people.boy", "people.boys", "people.kid", "people.kids" ]).then(function(translations) {
                    var peopleSummary = "";
                    if (peopleObj.adults || extraPeopleObj.adults) {
                        var adults = parseInt(peopleObj.adults || 0) + parseInt(extraPeopleObj.adults || 0);
                        if (adults > 0) {
                            peopleSummary += adults + " " + (adults < 2) ? translations["people.adult"] : translations["people.adults"];
                        }
                    }
                    if (peopleObj.boys || extraPeopleObj.boys) {
                        var boys = parseInt(peopleObj.boys || 0) + parseInt(extraPeopleObj.boys || 0);
                        if (boys > 0) {
                            peopleSummary += peopleObj.adults || extraPeopleObj.adults ? ", " : "";
                            peopleSummary += boys + " " + (boys < 2) ? translations["people.boy"] : translations["people.boys"];
                        }
                    }
                    if (peopleObj.children || extraPeopleObj.children) {
                        var children = parseInt(peopleObj.children || 0) + parseInt(extraPeopleObj.children || 0);
                        if (children > 0) {
                            peopleSummary += peopleObj.adults || extraPeopleObj.adults || peopleObj.boys || extraPeopleObj.boys ? ", " : "";
                            peopleSummary += children + " " + (children < 2) ? translations["people.child"] : translations["people.children"];
                        }
                    }
                    if (peopleObj.kids || extraPeopleObj.kids) {
                        var kids = parseInt(peopleObj.kids || 0) + parseInt(extraPeopleObj.kids || 0);
                        if (kids > 0) {
                            peopleSummary += peopleObj.adults || extraPeopleObj.adults || peopleObj.boys || extraPeopleObj.boys || peopleObj.children || extraPeopleObj.children ? ", " : "";
                            peopleSummary += kids + " " + (kids < 2) ? translations["people.kid"] : translations["people.kids"];
                        }
                    }
                    return peopleSummary.toLowerCase();
                });
            }
        };
        $$service.extraPeople = function(otherBeds) {
            var people = {
                adults: 0
            };
            _.forEach(otherBeds, function(otherBed) {
                if (!otherBed.people) return;
                var otherBedPeople = otherBed.people;
                if (otherBedPeople.adults) {
                    people.adults = people.adults ? parseInt(people.adults) + parseInt(otherBedPeople.adults) : parseInt(otherBedPeople.adults);
                }
                if (otherBedPeople.boys) {
                    people.boys = people.boys ? parseInt(people.boys) + parseInt(otherBedPeople.boys) : parseInt(otherBedPeople.boys);
                }
                if (otherBedPeople.children) {
                    people.children = people.children ? parseInt(people.children) + parseInt(otherBedPeople.children) : parseInt(otherBedPeople.children);
                }
                if (otherBedPeople.kids) {
                    people.kids = people.kids ? parseInt(people.kids) + parseInt(otherBedPeople.kids) : parseInt(otherBedPeople.kids);
                }
            });
            return people;
        };
        $$service.totalPeople = function(peopleObj, peopleExtra) {
            peopleObj = peopleObj || {
                adults: 0,
                boys: 0,
                children: 0,
                kids: 0
            };
            peopleExtra = peopleExtra || {
                adults: 0,
                boys: 0,
                children: 0,
                kids: 0
            };
            var totalPeople = {
                adults: NumberUtils.defaultNumber(peopleObj.adults) + NumberUtils.defaultNumber(peopleExtra.adults),
                boys: NumberUtils.defaultNumber(peopleObj.boys) + NumberUtils.defaultNumber(peopleExtra.boys),
                children: NumberUtils.defaultNumber(peopleObj.children) + NumberUtils.defaultNumber(peopleExtra.children),
                kids: NumberUtils.defaultNumber(peopleObj.kids) + NumberUtils.defaultNumber(peopleExtra.kids)
            };
            return totalPeople;
        };
        $$service.guestsCount = function(peopleObj, peopleExtra) {
            peopleObj = peopleObj || {
                adults: 0,
                boys: 0,
                children: 0,
                kids: 0
            };
            peopleExtra = peopleExtra || {
                adults: 0,
                boys: 0,
                children: 0,
                kids: 0
            };
            var standard = 0;
            if (!_.isNil(peopleObj.adults) && peopleObj.adults > 0) {
                standard += parseInt(peopleObj.adults);
            }
            if (!_.isNil(peopleObj.boys) && peopleObj.boys > 0) {
                standard += parseInt(peopleObj.boys);
            }
            if (!_.isNil(peopleObj.children) && peopleObj.children > 0) {
                standard += parseInt(peopleObj.children);
            }
            if (!_.isNil(peopleObj.kids) && peopleObj.kids > 0) {
                standard += parseInt(peopleObj.kids);
            }
            var extra = 0, extraHasChildren = false;
            if (!_.isNil(peopleExtra.adults) && peopleExtra.adults > 0) {
                extra += parseInt(peopleExtra.adults);
            }
            if (!_.isNil(peopleExtra.boys) && peopleExtra.boys > 0) {
                extraHasChildren = true;
                extra += parseInt(peopleExtra.boys);
            }
            if (!_.isNil(peopleExtra.children) && peopleExtra.children > 0) {
                extraHasChildren = true;
                extra += parseInt(peopleExtra.children);
            }
            if (!_.isNil(peopleExtra.kids) && peopleExtra.kids > 0) {
                extraHasChildren = true;
                extra += parseInt(peopleExtra.kids);
            }
            return {
                standard: standard,
                extra: extra,
                extraHasChildren: extraHasChildren,
                total: standard + extra
            };
        };
        $$service.guestsCountByBeds = function(standardBeds, otherBeds, maxOtherBeds) {
            var standard = 0;
            var extra = 0;
            var extraHasAdults = false;
            var extraHasChildren = false;
            if (standardBeds && angular.isArray(standardBeds)) {
                _.forEach(standardBeds, function(bed) {
                    standard += bed.maxPerson * bed.count;
                });
            }
            if (otherBeds && otherBeds.length) {
                maxOtherBeds = maxOtherBeds || 0;
                var workingArr = angular.copy(otherBeds);
                var remaining = parseInt(maxOtherBeds);
                while (remaining) {
                    var maxPaxBed = _.maxBy(workingArr, "maxPerson");
                    if (!maxPaxBed) break;
                    _.pull(workingArr, maxPaxBed);
                    var toAdd = remaining - maxPaxBed.count >= 0 ? maxPaxBed.count : remaining;
                    extra += maxPaxBed.maxPerson * toAdd;
                    remaining -= toAdd;
                    if (!extraHasAdults) {
                        extraHasAdults = maxPaxBed.people != null && maxPaxBed.people.adults;
                    }
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
                    roomPeople.adults = 0;
                    roomPeople.boys = 0;
                    roomPeople.children = 0;
                    roomPeople.kids = 0;
                    _.forEach(room.beds, function(bed) {
                        roomPeople.adults = parseInt(bed.people.adults) ? roomPeople.adults + parseInt(bed.people.adults) : roomPeople.adults;
                        roomPeople.boys = parseInt(bed.people.boys) ? roomPeople.boys + parseInt(bed.people.boys) : roomPeople.boys;
                        roomPeople.children = parseInt(bed.people.children) ? roomPeople.children + parseInt(bed.people.children) : roomPeople.children;
                        roomPeople.kids = parseInt(bed.people.kids) ? roomPeople.kids + parseInt(bed.people.kids) : roomPeople.kids;
                    });
                }
                people.adults = parseInt(roomPeople.adults) ? people.adults + parseInt(roomPeople.adults) : people.adults;
                people.boys = parseInt(roomPeople.boys) ? people.boys + parseInt(roomPeople.boys) : people.boys;
                people.children = parseInt(roomPeople.children) ? people.children + parseInt(roomPeople.children) : people.children;
                people.kids = parseInt(roomPeople.kids) ? people.kids + parseInt(roomPeople.kids) : people.kids;
                var roomExtraPeople = angular.copy(room.extraPeople || {});
                if (checkBeds && !_.isEmpty(room.otherBeds)) {
                    roomExtraPeople.adults = 0;
                    roomExtraPeople.boys = 0;
                    roomExtraPeople.children = 0;
                    roomExtraPeople.kids = 0;
                    _.forEach(room.otherBeds, function(bed) {
                        roomExtraPeople.adults = parseInt(bed.people.adults) ? roomExtraPeople.adults + parseInt(bed.people.adults) : roomExtraPeople.adults;
                        roomExtraPeople.boys = parseInt(bed.people.boys) ? roomExtraPeople.boys + parseInt(bed.people.boys) : roomExtraPeople.boys;
                        roomExtraPeople.children = parseInt(bed.people.children) ? roomExtraPeople.children + parseInt(bed.people.children) : roomExtraPeople.children;
                        roomExtraPeople.kids = parseInt(bed.people.kids) ? roomExtraPeople.kids + parseInt(bed.people.kids) : roomExtraPeople.kids;
                    });
                }
                if (roomExtraPeople) {
                    people.adults = parseInt(roomExtraPeople.adults) ? people.adults + parseInt(roomExtraPeople.adults) : people.adults;
                    people.boys = parseInt(roomExtraPeople.boys) ? people.boys + parseInt(roomExtraPeople.boys) : people.boys;
                    people.children = parseInt(roomExtraPeople.children) ? people.children + parseInt(roomExtraPeople.children) : people.children;
                    people.kids = parseInt(roomExtraPeople.kids) ? people.kids + parseInt(roomExtraPeople.kids) : people.kids;
                }
            });
            return people;
        };
        $$service.peopleByMax = function(basePeople, maxPeople, maxCount) {
            if (!basePeople && !maxPeople) {
                return {};
            }
            if (!basePeople) {
                return angular.copy(maxPeople);
            }
            if (!maxPeople) {
                return angular.copy(basePeople);
            }
            var max = maxCount;
            if (!max) {
                max = -1;
            }
            var adults = _.isNil(basePeople.adults) ? 0 : _.isNil(maxPeople.adults) ? basePeople.adults : basePeople.adults <= maxPeople.adults ? basePeople.adults : maxPeople.adults;
            if (max >= 0) {
                adults = adults <= max ? adults : max;
                max -= adults;
            }
            var boys = _.isNil(basePeople.boys) ? 0 : _.isNil(maxPeople.boys) ? basePeople.boys : basePeople.boys <= maxPeople.boys ? basePeople.boys : maxPeople.boys;
            if (max >= 0) {
                boys = boys <= max ? boys : max;
                max -= boys;
            }
            var children = _.isNil(basePeople.children) ? 0 : _.isNil(maxPeople.children) ? basePeople.children : basePeople.children <= maxPeople.children ? basePeople.children : maxPeople.children;
            if (max >= 0) {
                children = children <= max ? children : max;
                max -= children;
            }
            var kids = _.isNil(basePeople.kids) ? 0 : _.isNil(maxPeople.kids) ? basePeople.kids : basePeople.kids <= maxPeople.kids ? basePeople.kids : maxPeople.kids;
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
        $$service.peopleAvailabilityArrays = function(basePeople, currentPeople, maxCount) {
            currentPeople = currentPeople || {
                adults: 0,
                boys: 0,
                children: 0,
                kids: 0
            };
            var currentCount = $$service.guestsCount(currentPeople).standard;
            var currentAv = parseInt(maxCount || 0) - currentCount;
            var peopleAvailability = {
                adults: 0,
                boys: 0,
                children: 0,
                kids: 0
            };
            for (var i = 1; i <= parseInt(basePeople.adults || 0); i++) {
                currentPeople.adults = currentPeople.adults || 0;
                var disabled = i <= currentPeople.adults ? false : currentAv + currentPeople.adults - i < 0;
                if (!disabled) {
                    peopleAvailability.adults = i;
                }
            }
            for (var i = 1; i <= parseInt(basePeople.boys || 0); i++) {
                currentPeople.boys = currentPeople.boys || 0;
                var disabled = i <= currentPeople.boys ? false : currentAv + currentPeople.boys - i < 0;
                if (!disabled) {
                    peopleAvailability.boys = i;
                }
            }
            for (var i = 1; i <= parseInt(basePeople.children || 0); i++) {
                currentPeople.children = currentPeople.children || 0;
                var disabled = i <= currentPeople.children ? false : currentAv + currentPeople.children - i < 0;
                if (!disabled) {
                    peopleAvailability.children = i;
                }
            }
            for (var i = 1; i <= parseInt(basePeople.kids || 0); i++) {
                currentPeople.kids = currentPeople.kids || 0;
                var disabled = i <= currentPeople.kids ? false : currentAv + currentPeople.kids - i < 0;
                if (!disabled) {
                    peopleAvailability.kids = i;
                }
            }
            return peopleAvailability;
        };
        $$service.roomSold = function(rate, roomType, hotelVat, peopleObj, extraPeopleObj, beds, otherBeds, services) {
            if (!rate || !roomType || !hotelVat) {
                return {};
            }
            if (!peopleObj) {
                peopleObj = {
                    adults: 1
                };
            }
            var selectedPeople = peopleObj.adults >= roomType.guestsCount.standard ? roomType.guestsCount.standard : peopleObj.adults;
            if (!extraPeopleObj) {
                extraPeopleObj = {
                    adults: 0
                };
            }
            var selectedExtraPeople = extraPeopleObj.adults >= roomType.guestsCount.extra ? roomType.guestsCount.extra : extraPeopleObj.adults;
            var roomSold = {
                type: roomType,
                totalRate: rate,
                cancellationPolicy: rate.cancellationPolicy ? rate.cancellationPolicy : null,
                noShowPolicy: rate.noShowPolicy ? rate.noShowPolicy : null,
                status: "CONFIRMED",
                services: services || [],
                beds: beds || [],
                otherBeds: otherBeds || [],
                people: peopleObj,
                extraPeople: extraPeopleObj,
                creationDate: new Date()
            };
            roomSold.guestsCount = $$service.guestsCount(selectedPeople, selectedExtraPeople);
            var vat = (100 + hotelVat) / 100;
            var taxable = rate.amount.finalAmount / vat;
            roomSold.totalRate.amount.vatAmount = NumberUtils.fixedDecimals(taxable * hotelVat / 100);
            roomSold.totalRate.amount.vatRate = hotelVat;
            return roomSold;
        };
        $$service.serviceSold = function(service, peopleObj, nights, count) {
            if (!service) {
                return {};
            }
            if (!service.maxCount) {
                service.maxCount = 1;
            }
            if (!count) {
                count = 1;
            }
            if (count > service.maxCount && service.maxCount != -1) {
                count = service.maxCount;
            }
            if (!peopleObj) {
                peopleObj = {
                    adults: 0,
                    boys: 0,
                    kids: 0,
                    children: 0
                };
            }
            var duration = moment.duration(nights, "days");
            var amount = {
                type: "PRICE",
                currency: "EUR",
                initialAmount: 0,
                finalAmount: 0,
                vatRate: 0,
                vatAmount: 0
            };
            switch (service.paymentType) {
              case "SINGLE":
                var opt = service.paymentOptions[0];
                switch (service.frequency) {
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
                    switch (opt.size) {
                      case "PER_ADULT":
                        if (peopleObj.adults) {
                            price = opt.amount.finalAmount * peopleObj.adults;
                            amount.vatRate = amount.vatRate && amount.vatRate > opt.amount.vatRate ? amount.vatRate : opt.amount.vatRate;
                        }
                        break;

                      case "PER_BOY":
                        if (peopleObj.boys) {
                            price = opt.amount.finalAmount * peopleObj.boys;
                            amount.vatRate = amount.vatRate && amount.vatRate > opt.amount.vatRate ? amount.vatRate : opt.amount.vatRate;
                        }
                        break;

                      case "PER_CHILD":
                        if (peopleObj.children) {
                            price = opt.amount.finalAmount * peopleObj.children;
                            amount.vatRate = amount.vatRate && amount.vatRate > opt.amount.vatRate ? amount.vatRate : opt.amount.vatRate;
                        }
                        break;

                      case "PER_KID":
                        if (peopleObj.kids) {
                            price = opt.amount.finalAmount * peopleObj.kids;
                            amount.vatRate = amount.vatRate && amount.vatRate > opt.amount.vatRate ? amount.vatRate : opt.amount.vatRate;
                        }
                        break;
                    }
                    switch (service.frequency) {
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
            amount.finalAmount = amount.finalAmount * count;
            amount.initialAmount = amount.finalAmount;
            amount.vatAmount = NumberUtils.vatAmount(amount.finalAmount, amount.vatRate);
            return {
                service: service,
                amount: amount,
                people: peopleObj,
                included: service.bookability == "INCLUDED",
                status: "CONFIRMED",
                count: count
            };
        };
        $$service.updateServiceSoldPrice = function(serviceSold, peopleObj, nights, count, force) {
            var serviceDays = nights;
            if (oldService.startDate && oldService.endDate) {
                serviceDays = DateUtils.absoluteMoment(oldService.endDate).diff(DateUtils.absoluteMoment(serviceSold.startDate), "days");
            }
            var oldService = force ? angular.copy(serviceSold) : null;
            _.assign(serviceSold, $$service.serviceSold(serviceSold.service, peopleObj, serviceDays, count));
            serviceSold.amount = oldService ? oldService.amount : serviceSold.amount;
            serviceSold.amount.vatAmount = NumberUtils.vatAmount(serviceSold.amount.finalAmount, serviceSold.amount.vatRate);
        };
        $$service.bedSold = function(bed, peopleObj, nights, vatRate) {
            if (!bed) {
                return {};
            }
            var amount = {
                type: "PRICE",
                currency: "EUR",
                initialAmount: 0,
                finalAmount: 0,
                vatRate: vatRate,
                vatAmount: 0
            };
            if (peopleObj.adults && peopleObj.adults > 0) {
                amount.finalAmount += peopleObj.adults * bed.adultsPrice;
            }
            if (peopleObj.boys && peopleObj.boys > 0) {
                amount.finalAmount += peopleObj.boys * bed.boysPrice;
            }
            if (peopleObj.children && peopleObj.children > 0) {
                amount.finalAmount += peopleObj.children * bed.childrenPrice;
            }
            if (peopleObj.kids && peopleObj.kids > 0) {
                amount.finalAmount += peopleObj.kids * bed.kidsPrice;
            }
            if (bed.frequency == "DAILY" || bed.frequency == "NIGHTLY") {
                amount.finalAmount *= nights;
            }
            amount.initialAmount = amount.finalAmount;
            amount.vatAmount = NumberUtils.vatAmount(amount.finalAmount, amount.vatRate);
            return {
                bed: bed,
                people: peopleObj || {},
                amount: amount,
                status: "CONFIRMED"
            };
        };
        $$service.updateBedSoldPrice = function(bedSold, peopleObj, nights, vatRate, force) {
            var bedNights = nights;
            if (bedSold.startDate && bedSold.endDate) {
                bedNights = DateUtils.absoluteMoment(bedSold.endDate).diff(DateUtils.absoluteMoment(bedSold.startDate), "days");
            }
            var oldBed = force ? angular.copy(bedSold) : null;
            _.assign(bedSold, $$service.bedSold(bedSold.bed, peopleObj, bedNights, vatRate));
            bedSold.amount = oldBed ? oldBed.amount : bedSold.amount;
            bedSold.amount.vatAmount = NumberUtils.vatAmount(bedSold.amount.finalAmount, bedSold.amount.vatRate);
        };
        $$service.updatePolicyAmount = function(roomSold, policySold, nights) {
            if (!roomSold || !policySold || !nights) {
                return;
            }
            var chargeNights = policySold.cancellation.chargeNights;
            var perc = policySold.cancellation.percentage || 0;
            perc = perc <= 100 ? perc : 100;
            var amount = {
                finalAmount: 0
            };
            if (chargeNights < 0 || chargeNights == nights) {
                amount.finalAmount = NumberUtils.fixedDecimals(roomSold.totalRate.amount.finalAmount);
            } else {
                for (var i = 0; i < chargeNights; i++) {
                    var dailyRate = roomSold.totalRate.dailyRates[i];
                    if (dailyRate) {
                        amount.finalAmount += NumberUtils.fixedDecimals(dailyRate.amount.finalAmount);
                    }
                }
            }
            amount.finalAmount = amount.finalAmount * (perc / 100);
            policySold.amount = amount;
        };
        $$service.calculateTotalPrice = function(res) {
            if (!res) {
                return;
            }
            var _self = this;
            var nigths = DateUtils.absoluteMoment(res.checkout).diff(DateUtils.absoluteMoment(res.checkin), "days");
            var initialPrice = 0;
            var finalPrice = 0;
            var initialCancelPrice = 0;
            var finalCancelPrice = 0;
            var totalVat = 0;
            var totalPromoDiscount = 0;
            var arrayPromo = [];
            var hotelVat = res.hotel && res.hotel.vatTax && res.hotel.vatTax.finalAmount ? res.hotel.vatTax.finalAmount : 10;
            var arrayVat = {};
            var totalRoomsPrice = 0;
            var totalServicesPrice = 0;
            var totalOtherBedsPrice = 0;
            var totalSubPrice = 0;
            _.forEach(res.rooms, function(room, index, collection) {
                room.totalRate.amount.vatRate = hotelVat;
                room.totalRate.amount.vatAmount = NumberUtils.vatAmount(room.totalRate.amount.finalAmount, room.totalRate.amount.vatRate);
                if (room.status == "CONFIRMED" || room.status == "EARLY_CHECKOUT") {
                    initialPrice += room.totalRate.amount.initialAmount;
                    finalPrice += room.totalRate.amount.finalAmount;
                    totalVat += room.totalRate.amount.vatAmount;
                    _.forEach(room.totalRate.dailyRates, function(daily) {
                        if (!_.isNil(daily.promotion)) {
                            var price = 0;
                            if (daily.promotion.discount.type != "PRICE") {
                                price = daily.amount.initialAmount - daily.amount.initialAmount * ((100 - daily.promotion.discount.finalAmount) / 100);
                            } else {
                                price = daily.amount.initialAmount - daily.promotion.discount.finalAmount;
                            }
                            var aPromo = _.find(arrayPromo, function(pr) {
                                return daily.promotion.id && pr.promo.id == daily.promotion.id;
                            });
                            if (aPromo) {
                                aPromo.price += price;
                            } else {
                                arrayPromo.push({
                                    promo: daily.promotion,
                                    percentage: daily.promotion.discount.type != "PRICE" ? daily.promotion.discount.finalAmount + "%" : null,
                                    price: price
                                });
                            }
                            totalPromoDiscount += price;
                        }
                    });
                    totalRoomsPrice += room.totalRate.amount.initialAmount;
                    totalSubPrice += room.totalRate.amount.initialAmount;
                    if (room.totalRate.amount.vatRate) {
                        arrayVat[room.totalRate.amount.vatRate] = arrayVat[room.totalRate.amount.vatRate] ? arrayVat[room.totalRate.amount.vatRate] + room.totalRate.amount.vatAmount : room.totalRate.amount.vatAmount;
                    } else {
                        arrayVat[hotelVat] = arrayVat[hotelVat] ? arrayVat[hotelVat] + room.totalRate.amount.vatAmount : room.totalRate.amount.vatAmount;
                    }
                    _.forEach(room.services, function(serviceSold) {
                        initialPrice += serviceSold.amount.finalAmount;
                        finalPrice += serviceSold.amount.finalAmount;
                        totalVat += serviceSold.amount.vatAmount;
                        serviceSold.amount.initialAmount = serviceSold.amount.initialAmount || angular.copy(serviceSold.amount.finalAmount);
                        totalServicesPrice += serviceSold.amount.initialAmount;
                        totalSubPrice += serviceSold.amount.initialAmount;
                        var addVat = false;
                        _.forEach(arrayVat, function(value, key) {
                            if (key && key == serviceSold.amount.vatRate) {
                                arrayVat[key] += serviceSold.amount.vatAmount;
                                addVat = true;
                            }
                        });
                        if (!addVat) {
                            if (serviceSold.amount.vatRate) {
                                arrayVat[serviceSold.amount.vatRate] = arrayVat[serviceSold.amount.vatRate] ? arrayVat[serviceSold.amount.vatRate] + serviceSold.amount.vatAmount : serviceSold.amount.vatAmount;
                            }
                        }
                    });
                    _.forEach(room.otherBeds, function(otherBed) {
                        if (otherBed.amount) {
                            initialPrice += otherBed.amount.finalAmount;
                            finalPrice += otherBed.amount.finalAmount;
                            totalVat += otherBed.amount.vatAmount;
                            otherBed.amount.initialAmount = otherBed.amount.initialAmount || angular.copy(otherBed.amount.finalAmount);
                            totalOtherBedsPrice += otherBed.amount.initialAmount;
                            totalSubPrice += otherBed.amount.initialAmount;
                            if (otherBed.amount.vatRate) {
                                arrayVat[otherBed.amount.vatRate] = arrayVat[otherBed.amount.vatRate] ? arrayVat[otherBed.amount.vatRate] + otherBed.amount.vatAmount : otherBed.amount.vatAmount;
                            } else {
                                arrayVat[hotelVat] = arrayVat[hotelVat] ? arrayVat[hotelVat] + otherBed.amount.vatAmount : otherBed.amount.vatAmount;
                            }
                        }
                    });
                } else {
                    initialCancelPrice += room.cancelAmount.initialAmount;
                    finalCancelPrice += room.cancelAmount.finalAmount;
                }
            });
            if (!res.cancelAmount) {
                res.cancelAmount = {
                    currency: "EUR",
                    type: "PRICE"
                };
            }
            var invalidStates = [ "CANCELLED", "NO_SHOW" ];
            res.cancelAmount.initialAmount = _.includes(invalidStates, res.status) ? res.cancelAmount.initialAmount : NumberUtils.fixedDecimals(initialCancelPrice);
            res.cancelAmount.finalAmount = _.includes(invalidStates, res.status) ? res.cancelAmount.finalAmount : NumberUtils.fixedDecimals(finalCancelPrice);
            if (!res.totalAmount) {
                res.totalAmount = {
                    currency: "EUR",
                    type: "PRICE"
                };
            }
            res.totalAmount.initialAmount = _.includes(invalidStates, res.status) ? res.totalAmount.initialAmount : initialPrice;
            res.totalAmount.finalAmount = _.includes(invalidStates, res.status) ? res.totalAmount.finalAmount : finalPrice;
            if (!res.discount) {
                res.discount = {
                    finalAmount: 0,
                    type: "PERCENTAGE"
                };
            }
            var discountPrice = NumberUtils.calculateDiscount(res.totalAmount.finalAmount, res.discount.finalAmount, "PERCENTAGE");
            res.totalAmount.discountRate = res.discount.finalAmount;
            res.totalAmount.discountAmount = discountPrice;
            res.totalAmount.finalAmount = res.totalAmount.finalAmount - discountPrice;
            res.grandAmount = {
                initialAmount: res.totalAmount.initialAmount,
                finalAmount: res.totalAmount.finalAmount
            };
            res.grandAmount.initialAmount += res.cancelAmount && res.cancelAmount.initialAmount ? res.cancelAmount.initialAmount : 0;
            res.grandAmount.finalAmount += res.cancelAmount && res.cancelAmount.finalAmount ? res.cancelAmount.finalAmount : 0;
            var totalHotelDiscount = totalSubPrice - totalPromoDiscount - res.totalAmount.finalAmount - discountPrice;
            res.totalPriceDetails = {
                rooms: NumberUtils.fixedDecimals(totalRoomsPrice),
                services: NumberUtils.fixedDecimals(totalServicesPrice),
                otherBeds: NumberUtils.fixedDecimals(totalOtherBedsPrice),
                subTotal: NumberUtils.fixedDecimals(totalSubPrice),
                discountPromo: NumberUtils.fixedDecimals(totalPromoDiscount),
                discountHotel: NumberUtils.fixedDecimals(totalHotelDiscount)
            };
            res.arrayPromo = arrayPromo;
            res.totalVat = {
                total: totalVat,
                vatMap: arrayVat
            };
            if (res.totalAmount.discountRate) {
                var discountArrayVat = {};
                totalVat = 0;
                _.forEach(arrayVat, function(value, key) {
                    discountArrayVat[key] = value - parseFloat(value) / 100 * parseFloat(res.totalAmount.discountRate);
                    totalVat += discountArrayVat[key];
                });
                res.totalVat = {
                    total: totalVat,
                    vatMap: discountArrayVat
                };
            }
        };
        $$service.calculateVatMap = function(res, discountPerc) {
            if (!res) {
                return;
            }
            var _self = this;
            var totalVat = 0;
            var hotelVat = res.hotel && res.hotel.vatTax && res.hotel.vatTax.finalAmount ? res.hotel.vatTax.finalAmount : 10;
            var arrayVat = {};
            _.forEach(res.rooms, function(room, index, collection) {
                if (room.status == "EARLY_CHECKOUT") {
                    totalVat += room.cancelAmount.vatAmount;
                    if (room.totalRate.cancelAmount.vatRate) {
                        arrayVat[room.totalRate.cancelAmount.vatRate] = arrayVat[room.totalRate.cancelAmount.vatRate] ? arrayVat[room.totalRate.cancelAmount.vatRate] + room.cancelAmount.vatAmount : room.cancelAmount.vatAmount;
                    } else {
                        arrayVat[hotelVat] = arrayVat[hotelVat] ? arrayVat[hotelVat] + room.cancelAmount.vatAmount : room.cancelAmount.vatAmount;
                    }
                    _.forEach(room.services, function(serviceSold) {
                        totalVat += serviceSold.cancelAmount.vatAmount;
                        var addVat = false;
                        _.forEach(arrayVat, function(value, key) {
                            if (key && key == serviceSold.cancelAmount.vatRate) {
                                arrayVat[key] += serviceSold.cancelAmount.vatAmount;
                                addVat = true;
                            }
                        });
                        if (!addVat) {
                            if (serviceSold.cancelAmount.vatRate) {
                                arrayVat[serviceSold.cancelAmount.vatRate] = arrayVat[serviceSold.cancelAmount.vatRate] ? arrayVat[serviceSold.cancelAmount.vatRate] + serviceSold.cancelAmount.vatAmount : serviceSold.cancelAmount.vatAmount;
                            }
                        }
                    });
                    _.forEach(room.otherBeds, function(otherBed) {
                        if (otherBed.cancelAmount) {
                            totalVat += otherBed.cancelAmount.vatAmount;
                            if (otherBed.cancelAmount.vatRate) {
                                arrayVat[otherBed.cancelAmount.vatRate] = arrayVat[otherBed.cancelAmount.vatRate] ? arrayVat[otherBed.cancelAmount.vatRate] + otherBed.cancelAmount.vatAmount : otherBed.cancelAmount.vatAmount;
                            } else {
                                arrayVat[hotelVat] = arrayVat[hotelVat] ? arrayVat[hotelVat] + otherBed.cancelAmount.vatAmount : otherBed.cancelAmount.vatAmount;
                            }
                        }
                    });
                } else if (room.status == "CONFIRMED") {
                    totalVat += room.totalRate.amount.vatAmount;
                    if (room.totalRate.amount.vatRate) {
                        arrayVat[room.totalRate.amount.vatRate] = arrayVat[room.totalRate.amount.vatRate] ? arrayVat[room.totalRate.amount.vatRate] + room.totalRate.amount.vatAmount : room.totalRate.amount.vatAmount;
                    } else {
                        arrayVat[hotelVat] = arrayVat[hotelVat] ? arrayVat[hotelVat] + room.totalRate.amount.vatAmount : room.totalRate.amount.vatAmount;
                    }
                    _.forEach(room.services, function(serviceSold) {
                        totalVat += serviceSold.amount.vatAmount;
                        var addVat = false;
                        _.forEach(arrayVat, function(value, key) {
                            if (key && key == serviceSold.amount.vatRate) {
                                arrayVat[key] += serviceSold.amount.vatAmount;
                                addVat = true;
                            }
                        });
                        if (!addVat) {
                            if (serviceSold.amount.vatRate) {
                                arrayVat[serviceSold.amount.vatRate] = arrayVat[serviceSold.amount.vatRate] ? arrayVat[serviceSold.amount.vatRate] + serviceSold.amount.vatAmount : serviceSold.amount.vatAmount;
                            }
                        }
                    });
                    _.forEach(room.otherBeds, function(otherBed) {
                        if (otherBed.amount) {
                            totalVat += otherBed.amount.vatAmount;
                            if (otherBed.amount.vatRate) {
                                arrayVat[otherBed.amount.vatRate] = arrayVat[otherBed.amount.vatRate] ? arrayVat[otherBed.amount.vatRate] + otherBed.amount.vatAmount : otherBed.amount.vatAmount;
                            } else {
                                arrayVat[hotelVat] = arrayVat[hotelVat] ? arrayVat[hotelVat] + otherBed.amount.vatAmount : otherBed.amount.vatAmount;
                            }
                        }
                    });
                } else {}
            });
            if (discountPerc >= 0) {
                var discountArrayVat = {};
                totalVat = 0;
                _.forEach(arrayVat, function(value, key) {
                    discountArrayVat[key] = value - parseFloat(value) / 100 * parseFloat(res.totalAmount.discountRate);
                    totalVat += discountArrayVat[key];
                });
                res.totalVat = {
                    total: totalVat,
                    vatMap: discountArrayVat
                };
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
        $$service.calculateTotalTransfers = function(res) {
            if (!res) {
                return;
            }
            if (_.isNil(res.externalServices) || _.isNil(res.externalServices.transfersServices)) {
                res.externalServices = {
                    transfersServices: []
                };
            }
            var totalPrice = 0, totalVat = 0;
            _.forEach(res.externalServices.transfersServices, function(transfer, index, collection) {
                if (transfer.status == "CONFIRMED") {
                    totalPrice += transfer.amount.finalAmount;
                    totalVat += transfer.amount.vatAmount;
                    if (transfer.surcharge) {
                        totalPrice += transfer.transferService.nightCharge.finalAmount;
                    }
                }
            });
            res.totalTransfers = {
                totalAmount: totalPrice,
                vatAmount: totalVat,
                taxableAmount: totalPrice - totalVat
            };
        };
        $$service.calculateTotalRooms = function(res) {
            if (!res || _.isNil(res.rooms)) {
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
                if (room.status == "CONFIRMED" || room.status == "EARLY_CHECKOUT") {
                    if (room.extendedRoom) {
                        extendedRooms += 1;
                        total -= 1;
                    } else {
                        activeRooms += 1;
                    }
                    if (!_.isEmpty(room.dailyDetails) && _.some(room.dailyDetails, "room")) {
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
                active: activeRooms,
                cancelled: cancelRooms,
                total: total,
                standard: stRooms,
                flexible: flexRooms,
                notRefundable: nrRooms,
                physicalRooms: physicalRooms,
                extendedRooms: extendedRooms
            };
        };
        $$service.calculateRoomTotalPrice = function(room) {
            if (!room) {
                return;
            }
            var totalPrice = {
                initialAmount: room.totalRate.amount.initialAmount,
                finalAmount: room.totalRate.amount.finalAmount,
                servicesAmount: 0,
                bedsAmount: 0
            };
            _.forEach(room.services, function(service) {
                totalPrice.initialAmount += _.isNil(service.amount.initialAmount) ? service.amount.finalAmount : service.amount.initialAmount;
                totalPrice.finalAmount += service.amount.finalAmount;
                totalPrice.servicesAmount += service.amount.finalAmount;
            });
            _.forEach(room.otherBeds, function(otherBed) {
                totalPrice.initialAmount += _.isNil(otherBed.amount.initialAmount) ? otherBed.amount.finalAmount : otherBed.amount.initialAmount;
                totalPrice.finalAmount += otherBed.amount.finalAmount;
                totalPrice.bedsAmount += otherBed.amount.finalAmount;
            });
            room.totalPrice = totalPrice;
        };
        $$service.createCancelledReservation = function(res, defaultVat) {
            var _self = this;
            defaultVat = defaultVat || (res.hotel.vatTax ? res.hotel.vatTax.finalAmount : 0);
            var cancelledReservation = angular.copy(res);
            if (cancelledReservation.cancelAmount) {
                _.assign(cancelledReservation.cancelAmount, {
                    initialAmount: 0,
                    finalAmount: 0
                });
            } else {
                cancelledReservation.cancelAmount = {
                    initialAmount: 0,
                    finalAmount: 0
                };
            }
            var nowMoment = moment();
            var status;
            _.forEach(cancelledReservation.rooms, function(room) {
                if (room.status == "CONFIRMED") {
                    if (room.endDate && DateUtils.absoluteMoment(room.endDate).isBefore(nowMoment, "days")) {
                        return;
                    }
                    room.cancelled = false;
                    _.assign(room, _self.createCancelledRoom(room, cancelledReservation, nowMoment, defaultVat));
                    cancelledReservation.cancelAmount.initialAmount += NumberUtils.fixedDecimals(room.cancelAmount.finalAmount);
                    cancelledReservation.cancelAmount.finalAmount += NumberUtils.fixedDecimals(room.cancelAmount.finalAmount);
                } else {
                    room.cancelled = true;
                }
            });
            if (cancelledReservation.cancelAmount.finalAmount <= 0) {
                status = "reservation.manager.cancel.free";
            } else {
                status = "reservation.manager.cancel.penalty";
            }
            cancelledReservation.statusText = status;
            cancelledReservation.cancelDate = nowMoment.toDate();
            cancelledReservation.status = "CANCELLED";
            cancelledReservation.sendEmail = true;
            return cancelledReservation;
        };
        $$service.createCancelledRoom = function(room, reservation, targetDate, defaultVat) {
            var targetMoment = targetDate ? DateUtils.absoluteMoment(targetDate) : DateUtils.absoluteMoment();
            if (room.endDate && DateUtils.absoluteMoment(room.endDate).isBefore(targetMoment, "days")) {
                return room;
            }
            var nights = targetMoment.diff(DateUtils.absoluteMoment(room.startDate || reservation.checkin), "days");
            var cancelledRoom = angular.copy(room);
            cancelledRoom.cancelled = false;
            cancelledRoom.cancelAmount = cancelledRoom.cancelAmount ? cancelledRoom.cancelAmount : {};
            if (cancelledRoom.totalRate.cancellationPolicy) {
                cancelledRoom.tempStatus = "penalty";
                cancelledRoom.cancelAmount.finalAmount = cancelledRoom.totalRate.cancellationPolicy.amount.finalAmount;
                if (cancelledRoom.totalRate.cancellationPolicy.limitDate && moment(cancelledRoom.totalRate.cancellationPolicy.limitDate).utcOffset((reservation.hotel.addressInfo.offset || 0) / 60).isSameOrAfter(targetMoment)) {
                    cancelledRoom.cancelAmount.finalAmount = 0;
                    cancelledRoom.tempStatus = "free";
                }
            } else {
                cancelledRoom.cancelAmount.finalAmount = 0;
                cancelledRoom.tempStatus = "free";
            }
            cancelledRoom.cancelAmount.initialAmount = NumberUtils.fixedDecimals(cancelledRoom.cancelAmount.finalAmount);
            cancelledRoom.cancelAmount.finalAmount = NumberUtils.fixedDecimals(cancelledRoom.cancelAmount.finalAmount);
            cancelledRoom.cancelled = false;
            cancelledRoom.cancelAmount.vatRate = cancelledRoom.totalRate.amount.vatRate ? cancelledRoom.totalRate.amount.vatRate : defaultVat;
            cancelledRoom.cancelAmount.vatAmount = NumberUtils.vatAmount(cancelledRoom.cancelAmount.finalAmount, cancelledRoom.cancelAmount.vatRate);
            cancelledRoom.cancelDate = targetMoment.toDate();
            cancelledRoom.status = "CANCELLED";
            _.forEach(cancelledRoom.services, function(serviceSold) {
                serviceSold.status = "CANCELLED";
            });
            _.forEach(cancelledRoom.otherBeds, function(otherBed) {
                otherBed.status = "CANCELLED";
            });
            return cancelledRoom;
        };
        $$service.createNoShowReservation = function(res, defaultVat) {
            defaultVat = defaultVat || (res.hotel.vatTax ? res.hotel.vatTax.finalAmount : 0);
            var noShowReservation = angular.copy(res);
            var now = new Date();
            var nowMoment = moment(now);
            var total = 0, finalTotal = 0;
            var status;
            var noShowPrice = 0;
            _.forEach(noShowReservation.rooms, function(room) {
                room.cancelAmount = room.cancelAmount ? room.cancelAmount : {};
                if (room.totalRate.noShowPolicy) {
                    room.tempStatus = "penalty";
                    room.cancelAmount.finalAmount = room.totalRate.noShowPolicy.amount.finalAmount;
                } else {
                    room.cancelAmount.finalAmount = 0;
                    room.tempStatus = "free";
                }
                room.cancelAmount.finalAmount = NumberUtils.fixedDecimals(room.cancelAmount.finalAmount);
                if (room.status == "CONFIRMED") {
                    total += room.cancelAmount.finalAmount;
                    room.cancelled = false;
                    room.cancelAmount.vatRate = room.totalRate.amount.vatRate ? room.totalRate.amount.vatRate : defaultVat;
                    room.cancelAmount.vatAmount = NumberUtils.vatAmount(room.cancelAmount.finalAmount, room.cancelAmount.vatRate);
                    room.cancelDate = now;
                    room.status = "NO_SHOW";
                    _.forEach(room.services, function(serviceSold) {
                        serviceSold.status = "NO_SHOW";
                    });
                    _.forEach(room.otherBeds, function(otherBed) {
                        otherBed.status = "NO_SHOW";
                    });
                } else {
                    room.cancelled = true;
                }
            });
            noShowReservation.cancelAmount = {
                initialAmount: NumberUtils.fixedDecimals(total),
                finalAmount: NumberUtils.fixedDecimals(total),
                total: NumberUtils.fixedDecimals(finalTotal)
            };
            noShowReservation.cancelDate = now;
            noShowReservation.status = "NO_SHOW";
            noShowReservation.sendEmail = true;
            return noShowReservation;
        };
        $$service.createEarlyCheckoutReservation = function(res, defaultVat) {
            var _self = this;
            defaultVat = defaultVat || (res.hotel.vatTax ? res.hotel.vatTax.finalAmount : 0);
            var earlyCheckoutReservation = angular.copy(res);
            var now = new Date();
            var todayMoment = DateUtils.absoluteMoment(now);
            earlyCheckoutReservation.initialAmount = angular.copy(earlyCheckoutReservation.totalAmount);
            _.assign(earlyCheckoutReservation.totalAmount, {
                initialAmount: 0,
                finalAmount: 0
            });
            var status, title, reason, penalty, freeLabel, penaltyLabel;
            var nights = todayMoment.diff(DateUtils.absoluteMoment(earlyCheckoutReservation.checkin), "days");
            if (nights > 0) {
                _.forEach(earlyCheckoutReservation.rooms, function(room) {
                    if (room.status == "CONFIRMED") {
                        if (room.endDate && DateUtils.absoluteMoment(room.endDate).isBefore(todayMoment, "days")) {
                            room.status = "EARLY_CHECKOUT";
                            return;
                        }
                        room.cancelled = false;
                        _.assign(room, _self.createEarlyCheckoutRoom(room, earlyCheckoutReservation, todayMoment, defaultVat));
                        room.checkoutDone = now;
                        earlyCheckoutReservation.totalAmount.initialAmount += room.totalRoomAmount.initialAmount;
                        earlyCheckoutReservation.totalAmount.finalAmount += room.totalRoomAmount.finalAmount;
                    } else {
                        room.cancelled = true;
                    }
                });
                title = "reservation.earlycheckout.title";
                reason = "reservation.earlycheckout.reason.label";
                penalty = "reservation.earlycheckout.penalty";
                status = "reservation.manager.earlyCheckout";
                freeLabel = "reservation.earlycheckout.free.label";
                penaltyLabel = "reservation.earlycheckout.penalty.label";
                earlyCheckoutReservation.checkoutDone = now;
                earlyCheckoutReservation.status = "EARLY_CHECKOUT";
                earlyCheckoutReservation.totalAmount.initialAmount = NumberUtils.fixedDecimals(earlyCheckoutReservation.totalAmount.initialAmount);
                earlyCheckoutReservation.totalAmount.finalAmount = NumberUtils.fixedDecimals(earlyCheckoutReservation.totalAmount.finalAmount);
                earlyCheckoutReservation.totalAmount.vatRate = earlyCheckoutReservation.totalAmount.vatRate || defaultVat;
                earlyCheckoutReservation.totalAmount.vatAmount = NumberUtils.vatAmount(earlyCheckoutReservation.totalAmount.finalAmount, earlyCheckoutReservation.totalAmount.vatRate);
            } else {
                earlyCheckoutReservation = _self.createCancelledReservation(res, defaultVat);
                title = "reservation.deleteCheckin.title";
                reason = "reservation.deleteCheckin.reason.label";
                penalty = "reservation.deleteCheckin.penalty";
                status = earlyCheckoutReservation.cancelAmount.finalAmount > 0 ? "reservation.manager.deleteCheckin" : "reservation.manager.deleteCheckin.free";
                freeLabel = "reservation.cancellation.free";
                penaltyLabel = "reservation.bill.penalty";
            }
            earlyCheckoutReservation.title = title;
            earlyCheckoutReservation.reason = reason;
            earlyCheckoutReservation.penalty = penalty;
            earlyCheckoutReservation.statusText = status;
            earlyCheckoutReservation.freeLabel = freeLabel;
            earlyCheckoutReservation.penaltyLabel = penaltyLabel;
            earlyCheckoutReservation.sendEmail = true;
            return earlyCheckoutReservation;
        };
        $$service.createEarlyCheckoutRoom = function(room, reservation, targetDate, defaultVat) {
            var earlyCheckoutRoom = $$service.createTerminatedRoom(room, reservation, targetDate, defaultVat, "EARLY_CHECKOUT");
            if (earlyCheckoutRoom) {
                earlyCheckoutRoom.checkoutDone = new Date();
            }
            return earlyCheckoutRoom;
        };
        $$service.createTerminatedRoom = function(room, reservation, targetDate, defaultVat, statusToApply) {
            if (!room || room.status != "CONFIRMED") {
                return null;
            }
            var targetMoment = targetDate ? DateUtils.absoluteMoment(targetDate) : DateUtils.absoluteMoment();
            var end = room.endDate ? DateUtils.absoluteMoment(room.endDate) : null;
            if (end && end.isSame(targetMoment, "days")) {
                return angular.copy(room);
            }
            var start = DateUtils.absoluteMoment(room.startDate || reservation.checkin);
            end = end || DateUtils.absoluteMoment(reservation.checkout);
            var originalRange = moment.range(start, end);
            if (!originalRange.contains(targetMoment, {
                exclusive: true
            })) {
                return null;
            }
            var _self = this;
            var roomCurrency = room.totalRate.amount.currency;
            defaultVat = defaultVat || room.totalRate.amount.vatRate || reservation.hotel.vatTax.finalAmount;
            var terminatedRoom = angular.copy(room);
            terminatedRoom.totalRoomAmount = {
                initialAmount: 0,
                finalAmount: 0,
                currency: roomCurrency
            };
            terminatedRoom.cancelled = false;
            var terminationRange = moment.range(start, targetMoment);
            terminatedRoom.paymentServices = [];
            _.forEach(terminatedRoom.services, function(serviceSold) {
                if (_self.terminateServiceSold(serviceSold, terminationRange, statusToApply, originalRange)) {
                    if (!serviceSold.included && serviceSold.service.bookability != "INCLUDED") {
                        terminatedRoom.paymentServices.push(serviceSold);
                    }
                    terminatedRoom.totalRoomAmount.initialAmount += NumberUtils.fixedDecimals(serviceSold.amount.initialAmount || serviceSold.amount.finalAmount);
                    terminatedRoom.totalRoomAmount.finalAmount += NumberUtils.fixedDecimals(serviceSold.amount.finalAmount);
                }
            });
            _.forEach(terminatedRoom.beds, function(bedSold) {
                if (!bedSold || bedSold.status != "CONFIRMED") {
                    return;
                }
                bedSold.status = statusToApply ? statusToApply : bedSold.status;
            });
            _.forEach(terminatedRoom.otherBeds, function(bedSold) {
                if (_self.terminateBedSold(bedSold, terminationRange, defaultVat, statusToApply, originalRange)) {
                    terminatedRoom.totalRoomAmount.initialAmount += NumberUtils.fixedDecimals(bedSold.amount.initialAmount || bedSold.amount.finalAmount);
                    terminatedRoom.totalRoomAmount.finalAmount += NumberUtils.fixedDecimals(bedSold.amount.finalAmount);
                }
            });
            terminatedRoom.amount = terminatedRoom.totalRoomAmount;
            terminatedRoom.status = statusToApply ? statusToApply : room.status;
            terminatedRoom.endDate = DateUtils.absoluteDate(terminationRange.end);
            terminatedRoom.initialAmount = angular.copy(room.totalRate.amount);
            terminatedRoom.tempStatus = "earlyCheckout";
            var ratesRange = terminatedRoom.status == "EARLY_CHECKOUT" && terminationRange.end.isSame(DateUtils.absoluteMoment(), "day") ? moment.range(terminationRange.start, moment(terminationRange.end).add(1, "days")) : terminationRange;
            terminatedRoom.totalRate.initialDailyRates = angular.copy(terminatedRoom.totalRate.dailyRates);
            if (terminatedRoom.totalRate.type == "STANDARD") {
                _.forEach(terminatedRoom.totalRate.initialDailyRates, function(rate) {
                    rate.disabled = !ratesRange.contains(rate.date, {
                        exclusive: true
                    });
                    rate.toRemove = rate.disabled;
                });
                terminatedRoom.totalRate.dailyRates = _.filter(terminatedRoom.totalRate.initialDailyRates, function(rate) {
                    return !rate.toRemove;
                });
                var toChargeAmount = {
                    initialAmount: 0,
                    finalAmount: 0,
                    currency: roomCurrency
                };
                _.forEach(terminatedRoom.totalRate.dailyRates, function(rate) {
                    toChargeAmount.initialAmount += NumberUtils.fixedDecimals(rate.amount.initialAmount || rate.amount.finalAmount);
                    toChargeAmount.finalAmount += NumberUtils.fixedDecimals(rate.amount.finalAmount);
                });
                _.assign(terminatedRoom.totalRate.amount, toChargeAmount);
            } else if (terminatedRoom.totalRate.type == "NOT_REFUNDABLE") {
                var cancellationPolicy = terminatedRoom.totalRate.cancellationPolicy ? terminatedRoom.totalRate.cancellationPolicy.cancellation : null;
                var chargeNights = !cancellationPolicy ? null : cancellationPolicy.chargeNights > 0 ? cancellationPolicy.chargeNights : -1;
                var policyRange = !chargeNights ? null : chargeNights > 0 && chargeNights < originalRange.diff("days") ? moment.range(originalRange.start, moment(originalRange.start).add(chargeNights, "days")) : originalRange;
                var chargeRange = policyRange && policyRange.diff("days") > ratesRange.diff("days") ? policyRange : ratesRange;
                _.forEach(terminatedRoom.totalRate.initialDailyRates, function(rate) {
                    var rateDate = DateUtils.absoluteMoment(rate.date);
                    if (chargeRange.contains(rateDate, {
                        exclusive: true
                    })) {
                        rate.disabled = false;
                        rate.toRemove = false;
                        if (!ratesRange.contains(rateDate, {
                            exclusive: true
                        }) && policyRange && policyRange.contains(rateDate, {
                            exclusive: true
                        })) {
                            terminatedRoom.tempStatus = "penalty";
                            rate.disabled = true;
                            if (cancellationPolicy.percentage < 100) {
                                rate.amount.initialAmount = rate.amount.finalAmount;
                                rate.amount.finalAmount = NumberUtils.calculateDiscount(rate.amount.finalAmount, cancellationPolicy.percentage, "PERCENTAGE");
                            }
                        }
                    } else {
                        rate.disabled = true;
                        rate.toRemove = true;
                    }
                });
                terminatedRoom.totalRate.dailyRates = _.filter(terminatedRoom.totalRate.initialDailyRates, function(rate) {
                    return !rate.toRemove;
                });
                var toChargeAmount = {
                    initialAmount: 0,
                    finalAmount: 0,
                    currency: roomCurrency
                };
                _.forEach(terminatedRoom.totalRate.dailyRates, function(rate) {
                    toChargeAmount.initialAmount += NumberUtils.fixedDecimals(rate.amount.initialAmount || rate.amount.finalAmount);
                    toChargeAmount.finalAmount += NumberUtils.fixedDecimals(rate.amount.finalAmount);
                });
                if (toChargeAmount.finalAmount < (terminatedRoom.totalRate.cancellationPolicy && terminatedRoom.totalRate.cancellationPolicy.amount ? terminatedRoom.totalRate.cancellationPolicy.amount.finalAmount : 0)) {
                    toChargeAmount = terminatedRoom.totalRate.cancellationPolicy.amount;
                    terminatedRoom.tempStatus = "penalty";
                }
                _.assign(terminatedRoom.totalRate.amount, toChargeAmount);
            }
            terminatedRoom.totalRate.amount.vatRate = terminatedRoom.totalRate.amount.vatRate || defaultVat;
            terminatedRoom.totalRate.amount.vatAmount = NumberUtils.vatAmount(terminatedRoom.totalRate.amount.finalAmount, terminatedRoom.totalRate.amount.vatRate);
            terminatedRoom.totalRoomAmount.initialAmount = NumberUtils.fixedDecimals(terminatedRoom.totalRoomAmount.initialAmount + terminatedRoom.totalRate.amount.initialAmount);
            terminatedRoom.totalRoomAmount.finalAmount = NumberUtils.fixedDecimals(terminatedRoom.totalRoomAmount.finalAmount + terminatedRoom.totalRate.amount.finalAmount);
            _self.calculateRoomTotalPrice(terminatedRoom);
            return terminatedRoom;
        };
        $$service.terminateServiceSold = function(serviceSold, terminationRange, statusToApply, roomRange) {
            if (!serviceSold || serviceSold.status != "CONFIRMED") {
                return false;
            }
            var serviceRange = moment.range(DateUtils.absoluteMoment(serviceSold.startDate || terminationRange.start), DateUtils.absoluteMoment(serviceSold.endDate || terminationRange.end));
            if (!serviceRange.contains(terminationRange.end)) {
                return false;
            }
            serviceRange = moment.range(serviceRange.start, terminationRange.end);
            var serviceDays = serviceRange.diff("days");
            var newServ = $$service.serviceSold(serviceSold.service, serviceSold.people, serviceDays, serviceSold.count);
            serviceSold.status = statusToApply ? statusToApply : serviceSold.status;
            serviceSold.initialAmount = angular.copy(serviceSold.amount);
            serviceSold.amount = angular.copy(newServ.amount);
            if (serviceSold.service.frequency == "DAILY" || serviceSold.service.frequency == "NIGHTLY") {
                if (roomRange && roomRange.start && roomRange.end) {
                    serviceSold.dailyRates = [];
                    var dailyAmount = $$service.serviceSold(serviceSold.service, serviceSold.people, 1, serviceSold.count).amount;
                    var serviceStartDate = DateUtils.absoluteMoment(serviceSold.startDate || roomRange.start);
                    var serviceEndDate = DateUtils.absoluteMoment(serviceSold.endDate || roomRange.end);
                    for (var date = DateUtils.absoluteMoment(roomRange.start); date.isBefore(DateUtils.absoluteMoment(roomRange.end), "days"); date.add(1, "days")) {
                        serviceSold.dailyRates.push({
                            date: date.toDate(),
                            amount: date.isBefore(serviceStartDate, "days") || date.isAfter(serviceEndDate, "days") ? null : dailyAmount,
                            disabled: date.isSameOrAfter(terminationRange.end, "days")
                        });
                    }
                }
                serviceSold.endDate = DateUtils.absoluteDate(terminationRange.end);
            }
            return true;
        };
        $$service.terminateBedSold = function(bedSold, terminationRange, defaultVat, statusToApply, roomRange) {
            if (!bedSold || bedSold.status != "CONFIRMED") {
                return false;
            }
            var bedRange = moment.range(bedSold.startDate || terminationRange.start, bedSold.endDate || terminationRange.end);
            if (!bedRange.contains(terminationRange.end)) {
                return false;
            }
            bedRange = moment.range(bedRange.start, terminationRange.end);
            var bedNights = bedRange.diff("days");
            var newBed = $$service.bedSold(bedSold.bed, bedSold.people, bedNights, defaultVat);
            bedSold.status = statusToApply ? statusToApply : bedSold.status;
            bedSold.initialAmount = angular.copy(bedSold.amount);
            bedSold.amount = angular.copy(newBed.amount);
            if (bedSold.bed.frequency == "DAILY" || bedSold.bed.frequency == "NIGHTLY") {
                if (roomRange && roomRange.start && roomRange.end) {
                    bedSold.dailyRates = [];
                    var dailyAmount = $$service.bedSold(bedSold.bed, bedSold.people, 1, defaultVat).amount;
                    var bedStartDate = DateUtils.absoluteMoment(bedSold.startDate || roomRange.start);
                    var bedEndDate = DateUtils.absoluteMoment(bedSold.endDate || roomRange.end);
                    for (var date = DateUtils.absoluteMoment(roomRange.start); date.isBefore(DateUtils.absoluteMoment(roomRange.end), "days"); date.add(1, "days")) {
                        bedSold.dailyRates.push({
                            date: date.toDate(),
                            amount: date.isBefore(bedStartDate, "days") || date.isAfter(bedEndDate, "days") ? null : dailyAmount,
                            disabled: date.isSameOrAfter(terminationRange.end, "days")
                        });
                    }
                }
                bedSold.endDate = DateUtils.absoluteDate(terminationRange.end);
            }
            return true;
        };
        $$service.bestPromotion = function(promotions) {
            var bestPromo;
            var bestRatePromoDiscount = 0;
            _.forEach(promotions, function(promo) {
                if (promo.secret) {
                    return;
                }
                if (promo.promotionType == "STANDARD") {
                    if (!bestPromo) {
                        bestRatePromoDiscount = promo.discount.finalAmount - promo.discount.initialAmount;
                        bestPromo = promo;
                        return;
                    }
                    if (promo.discount.finalAmount - promo.discount.initialAmount > bestRatePromoDiscount) {
                        if (!promo.onArrival && bestPromo.onArrival) {
                            return;
                        } else {
                            bestRatePromoDiscount = promo.discount.finalAmount - promo.discount.initialAmount;
                            bestPromo = promo;
                        }
                    } else if (promo.discount.finalAmount - promo.discount.initialAmount > bestRatePromoDiscount && promo.onArrival && !bestPromo.onArrival) {
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
        $$service.bestPromotionForRates = function(rates) {
            var promotions = [];
            _.forEach(rates, function(rate) {
                promotions = _.union(promotion, rate.promotions);
            });
            return $$service.bestPromotion(promotions);
        };
        $$service.getRoomPenalty = function(room, hotel, targetDate) {
            var amount = null;
            if (room.totalRate.cancellationPolicy) {
                var targetMoment = moment.isMoment(targetDate) ? targetDate : moment(targetDate);
                if (room.totalRate.cancellationPolicy.limitDate && moment(room.totalRate.cancellationPolicy.limitDate).utcOffset((hotel.addressInfo.offset || 0) / 60).isSameOrAfter(targetMoment)) {
                    amount = {
                        finalAmount: 0,
                        initialAmount: 0
                    };
                } else {
                    amount = room.totalRate.cancellationPolicy.amount;
                }
            }
            return amount;
        };
        $$service.generatePhysicalRoomsList = function(physicalRoomsList, dailyAv) {
            if (!dailyAv || _.isEmpty(dailyAv)) {
                return;
            }
            physicalRoomsList = !_.isNil(physicalRoomsList) ? physicalRoomsList : {};
            _.forEach(dailyAv, function(daily) {
                _.forEach(daily.roomsAvailabilities, function(roomAv) {
                    if (roomAv.roomClosed) {
                        return true;
                    }
                    physicalRoomsList[roomAv.room.id] = physicalRoomsList[roomAv.room.id] || [];
                    if (!_.some(physicalRoomsList[roomAv.room.id], function(type) {
                        return moment(type.date).isSame(moment(roomAv.date), "day");
                    })) {
                        physicalRoomsList[roomAv.room.id].push({
                            date: roomAv.date,
                            roomsSold: []
                        });
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

(function() {
    "use strict";
    angular.module("itaca.utils").factory("ReviewsUtils", ReviewsUtilsFactory);
    function ReviewsUtilsFactory() {
        var service = {};
        service.generateScoreLabel = function(score) {
            if (!score) {
                return;
            }
            var label;
            switch (score) {
              case 4:
                label = "review.score.bad";
                break;

              case 5:
                label = "review.score.poor";
                break;

              case 6:
                label = "review.score.sufficient";
                break;

              case 7:
                label = "review.score.good";
                break;

              case 8:
                label = "review.score.very.good";
                break;

              case 9:
                label = "review.score.excellent";
                break;

              case 10:
                label = "review.score.fabulous";
                break;
            }
            return label;
        };
        return service;
    }
})();

(function() {
    "use strict";
    SceStrategyFactory.$inject = [ "$sce" ];
    angular.module("itaca.utils").factory("sceStrategy", SceStrategyFactory);
    function SceStrategyFactory($sce) {
        var sceStrategy = function(value, mode) {
            if (mode === "text") {
                var result = "";
                result = $sce.trustAsHtml(value);
                if (result.$$unwrapTrustedValue) {
                    result = result.$$unwrapTrustedValue();
                }
                value = result;
            }
            return value;
        };
        return sceStrategy;
    }
})();

(function() {
    "use strict";
    angular.module("itaca.utils").provider("sessionExpiredInterceptor", SessionExpiredInterceptorProvider);
    function SessionExpiredInterceptorProvider() {
        var $$redirectUrl = "/login";
        this.init = function(redirectUrl) {
            if (!_.isString(redirectUrl)) {
                return false;
            }
            $$redirectUrl = redirectUrl;
        };
        this.$get = [ "$q", function($q) {
            return new SessionExpiredInterceptor($q, $$redirectUrl);
        } ];
    }
    function SessionExpiredInterceptor($q, redirectUrl) {
        var $$service = this;
        this.$$redirectUrl = redirectUrl || "/login";
        this.responseError = function(rejection) {
            if (rejection.data && rejection.data.status === 401) {
                location.assign($$service.$$redirectUrl);
            }
            return $q.reject(rejection);
        };
    }
})();

(function() {
    "use strict";
    angular.module("itaca.utils").factory("StringUtils", StringUtilsFactory);
    function StringUtilsFactory() {
        var service = {};
        service.isBlank = function(string) {
            return _.isUndefined(string) || _.isNull(string) || _.isEmpty(string);
        };
        service.isNotBlank = function(string) {
            return !service.isBlank(string);
        };
        service.isEmpty = function(string) {
            return service.isNotBlank(string) && _.isEmpty(_.trim(string));
        };
        service.isNotEmpty = function(string) {
            return !service.isEmpty(string);
        };
        service.normalizeForUrl = function(string, useDelimiters) {
            return _.toLower(_.replace(_.deburr(useDelimiters ? _.snakeCase(string) : string), /[^\w]/gi, ""));
        };
        return service;
    }
})();

(function() {
    "use strict";
    UrlUtilsFactory.$inject = [ "$httpParamSerializer" ];
    angular.module("itaca.utils").factory("UrlUtils", UrlUtilsFactory);
    function UrlUtilsFactory($httpParamSerializer) {
        var service = {};
        service.buildUrl = function(url, params) {
            var serializedParams = $httpParamSerializer(params);
            if (serializedParams.length > 0) {
                url += (url.indexOf("?") === -1 ? "?" : "&") + serializedParams;
            }
            return url;
        };
        service.withParam = function(url, param, value) {
            var search = url.split("?")[1];
            var params = search ? JSON.parse('{"' + search.replace(/&/g, '","').replace(/=/g, '":"') + '"}', function(key, value) {
                return key === "" ? value : decodeURIComponent(value);
            }) : {};
            params[param] = value;
            return service.buildUrl(url, params);
        };
        service.parseUrl = function(url) {
            var parser = document.createElement("a");
            parser.href = url;
            return parser;
        };
        return service;
    }
})();