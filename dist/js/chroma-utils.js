/*****************************************************************/
/** chroma-utils v1.0.0 08-11-2017	**/
/** chroma-utils, logos and all images are registered     	**/
/** trademarks of Chroma Italy Hotels srl.                     	**/
/** All rights reserved.                                     	**/
/** Registration code: 21-11-2016/011058        	**/
/** 						                                 	**/
/**                               Chroma Italy Hotels srl ® 2016	**/
/*****************************************************************/
(function() {
    "use strict";
    angular.module("chroma.utils", [ "ngMaterial" ]);
})();

(function() {
    "use strict";
    angular.module("chroma.utils").provider("AppOptions", AppOptionsProvider);
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
    angular.module("chroma.utils").factory("_beforeUnload", BeforeUnloadFactory);
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
    angular.module("chroma.utils").factory("ContactUtils", ContactUtilsFactory);
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
    angular.module("chroma.utils").factory("DateUtils", DateUtilsFactory);
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
    angular.module("chroma.utils").factory("FormUtils", FormUtilsFactory);
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
    angular.module("chroma.utils").factory("HtmlUtils", HtmlUtilsFactory);
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
    angular.module("chroma.utils").factory("IconUtils", IconUtilsFactory);
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
    angular.module("chroma.utils").factory("jsonDateInterceptor", JsonDateInterceptorFactory);
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
    angular.module("chroma.utils").factory("NumberUtils", NumberUtilsFactory);
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
    angular.module("chroma.utils").factory("ObjectUtils", ObjectUtilsFactory);
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
    angular.module("chroma.utils").factory("offlineInterceptor", OfflineInterceptorFactory);
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
    angular.module("chroma.utils").constant("REGEXP", REGEXP);
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
    angular.module("chroma.utils").factory("ReviewsUtils", ReviewsUtilsFactory);
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
    angular.module("chroma.utils").factory("sceStrategy", SceStrategyFactory);
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
    angular.module("chroma.utils").provider("sessionExpiredInterceptor", SessionExpiredInterceptorProvider);
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
    angular.module("chroma.utils").factory("StringUtils", StringUtilsFactory);
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
    UrlBuilderFactory.$inject = [ "$httpParamSerializer" ];
    angular.module("chroma.utils").factory("UrlBuilder", UrlBuilderFactory);
    function UrlBuilderFactory($httpParamSerializer) {
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
        return service;
    }
})();