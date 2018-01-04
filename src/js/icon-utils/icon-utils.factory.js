/**
 * Utility per le icone
 * 
 */
(function() {
	'use strict';
	
	angular.module("itaca.utils").factory("IconUtils", IconUtilsFactory);
	
	/* @ngInject */
	function IconUtilsFactory(){
		var service = {};

		service.languageIcons = function () {
			return {
		        "ITALIAN": {icon:"flag-icon flag-icon-it"},
				"ENGLISH": {icon:"flag-icon flag-icon-gb"},
				"FRENCH": {icon:"flag-icon flag-icon-fr"},
				"SPANISH": {icon:"flag-icon flag-icon-es"},
				"GERMAN": {icon:"flag-icon flag-icon-de"},
				"PORTUGUESE": {icon:"flag-icon flag-icon-pt"},
				"RUSSIAN": {icon:"flag-icon flag-icon-ru"},
				"MANDARIN": {icon:"flag-icon flag-icon-cn"},
				"HINDI": {icon:"flag-icon flag-icon-in"},
				"ARABIC": {icon:"flag-icon flag-icon-sa"},
				"BENGALI": {icon:"flag-icon flag-icon-bd"},
				"JAPANESE": {icon:"flag-icon flag-icon-jp"},
				"PUNJABI": {icon:"flag-icon flag-icon-pk"},
				"JAVANESE": {icon:"flag-icon flag-icon-id"},
				"WU": {icon:"flag-icon flag-icon-cn"},
				"MALAY_INDONESIAN": {icon:"flag-icon flag-icon-in"},
				"TELUGU": {icon:"flag-icon flag-icon-in"},
				"VIETNAMESE": {icon:"flag-icon flag-icon-vn"},
				"MARATHI": {icon:"flag-icon flag-icon-in"},
				"TAMIL": {icon:"flag-icon flag-icon-lk"},
				"URDU": {icon:"flag-icon flag-icon-ae"},
				"TURKISH": {icon:"flag-icon flag-icon-tr"},
				"LANG_SIGN": {icon:"material-icons flaticon-hearing-impaired"},
				"LANG_SIGN_IT": {icon:"material-icons flaticon-hearing-impaired"}
			};
		};
		
		service.contactIcons = function () {
			return {
				"PHONE": {icon:"mdi mdi-phone", type: "contact.phone", prefix: "tel:", suffix: ""},
				"MOBILE": {icon:"mdi mdi-cellphone-android", type: "contact.mobile", prefix: "tel:", suffix: ""},
				"FAX": {icon:"mdi mdi-fax", type: "contact.fax", prefix: "tel:", suffix: ""},
				"EMAIL": {icon:"mdi mdi-email", type: "contact.email", prefix: "mailto:", suffix: ""},
				"WEBSITE": {icon:"mdi mdi-web", type: "contact.website", prefix: "", suffix: ""},
				"FACEBOOK": {icon:"mdi mdi-facebook-box", type: "contact.facebook", prefix: "https://facebook.com/", suffix: ""},
				"TWITTER": {icon:"mdi mdi-twitter-box", type: "contact.twitter", prefix: "https://twitter.com/", suffix: ""},
				"INSTAGRAM": {icon:"mdi mdi-instagram", type: "contact.instagram", prefix: "https://www.instagram.com/", suffix: ""},
				"WHATSAPP": {icon:"mdi mdi-whatsapp", type: "contact.whatsapp", prefix: bowser.ios ? "whatsapp://send?" : "intent://send/", suffix: bowser.ios ? "" : "#Intent;scheme=smsto;package=com.whatsapp;action=android.intent.action.SENDTO;end"},
				"SKYPE": {icon:"mdi mdi-skype", type: "contact.skype", prefix: "skype://", suffix:"?call"},
				"VIBER": {icon:"mdi mdi-phone", type: "contact.viber", prefix: "viber://forward?", suffix: ""},
				"TELEGRAM": {icon:"mdi mdi-telegram", type: "contact.telegram", prefix: "tg://", suffix: ""}
			};
		};
		
		service.paymentIcons = function () {
			return {
				'PAYPAL': 'pf pf-paypal',
				'VISA': 'pf pf-visa',
				'MASTERCARD': 'pf pf-mastercard',
				'AMEX': 'pf pf-american-express',
				'BIT_COIN': 'pf pf-bitcoin',
				'CARTA_SI': 'pf pf-carta-si',
				'DINERS_CLUB': 'pf pf-diners',
				'DISCOVER': 'pf pf-discover',
				'JCB': 'pf pf-jcb',
				'UNION_PAY': 'pf pf-unionpay',
				'VISA_ELECTRON': 'pf pf-visa-electron',
				'V_PAY': 'pf pf-visa',
				'MAESTRO': 'pf pf-maestro',
				'CIRRUS': 'pf pf-cirrus',
				'POSTEPAY': 'pf pf-postepay',
				'APPLE_PAY': 'pf pf-apple-pay',
				'PAGSEGURO': 'pf pf-pagseguro',
				'BANCONTACT': 'pf pf-bancontact-mister-cash',
				'BANCOMAT': 'pf pf-card'
			};
		};
		
		service.serviceIcons = function(){
			return {
				'service.type.technology.console'					: 'mdi mdi-gamepad-variant',
				'service.type.technology.games'						: 'mdi mdi-gamepad-variant',

				'service.type.technology.tv.flat'					: 'mdi mdi-monitor',
				'service.type.technology.tv'						: 'mdi mdi-monitor',
				'service.type.entertainment.children.tv'			: 'mdi mdi-monitor',

				'service.type.popular.pet.small'					: 'mdi mdi-paw',
				'service.type.popular.pet.medium'					: 'mdi mdi-paw',
				'service.type.popular.pet.large'					: 'mdi mdi-paw',
				'service.type.popular.pet.disabled'					: 'mdi mdi-paw',
					
				'service.type.popular.router'						: 'mdi mdi-router-wireless',

				'service.type.miscellaneous.air.conditioning'		: 'mdi mdi-air-conditioner',
				'service.type.room.air.conditioning'				: 'mdi mdi-air-conditioner',
				'service.type.miscellaneous.heating'				: 'mdi mdi-air-conditioner',
				'service.type.room.washing.machine'					: 'mdi mdi-washing-machine',

				'service.type.transport.parking.secured'			: 'mdi mdi-parking',
				'service.type.transport.parking.street'				: 'mdi mdi-parking',
				'service.type.transport.parking.accessible'			: 'mdi mdi-parking',

				'service.type.popular.bouquet'						: 'mdi mdi-flower',
				'service.type.popular.rose'							: 'mdi mdi-flower',

				'service.type.popular.breakfast.continental'		: 'mdi mdi-food-fork-drink',
				'service.type.popular.breakfast'					: 'mdi mdi-food-fork-drink',
				'service.type.popular.breakfast.room'				: 'mdi mdi-food-fork-drink',

				'service.type.miscellaneous.non­smoking.throughout'	: 'mdi mdi-smoking-off',
				'service.type.miscellaneous.non­smoking.rooms'		: 'mdi mdi-smoking-off',

				'service.type.popular.smoking.area'					: 'mdi mdi-smoking',
				'service.type.popular.smoking.room'					: 'mdi mdi-smoking',

				'service.type.popular.wifi.room'					: 'mdi mdi-wifi',
				'service.type.popular.wifi.all'						: 'mdi mdi-wifi',
				'service.type.popular.internet.point'				: 'mdi mdi-wifi',
				
				'service.type.food.champagne'						: 'mdi mdi-glass-flute',
				'service.type.food.prosecco'						: 'mdi mdi-glass-flute',
				'service.type.food.wine.red'						: 'mdi mdi-glass-tulip',
				'service.type.food.wine.white'						: 'mdi mdi-glass-tulip',
				'service.type.food.homemade.cake'					: 'mdi mdi-cake',
				'service.type.food.water'							: 'mdi mdi-cup-water',
				'service.room.type.welcomeCoffee'					: 'mdi mdi-coffee',
				'service.type.food.cookies'							: 'mdi mdi-cookie'
			};
		};
		
		service.transfersIcon = function(){
			return {
				'CAR': 'flaticon-car-black-side-view-pointing-left',
				'LIMOUSINE': 'flaticon-sedan-car-model',
				'PULLMAN': 'flaticon-bus-front',
				'SHUTTLE': 'flaticon-microbus',
				'MINIVAN': 'flaticon-van-black-transport-side-view-pointing-to-left',
				'LUXURY_CAR': 'flaticon-supercar'
			};
		};
		
		service.portalIcons = function(){
			return {
				'PHONE'		: 'channel-icon channel-chroma',
				'EMAIL'		: 'channel-icon channel-chroma',
				'PORTAL'	: 'channel-icon channel-chroma',
				'BOOKING'	: 'channel-icon channel-booking',
				'EXPEDIA'	: 'channel-icon channel-expedia',
				'VENERE'	: 'channel-icon channel-venere',
				'AIRBNB'	: 'channel-icon channel-airbnb',
				'AGODA'		: 'channel-icon channel-agoda',
				'AMADEUS'	: 'channel-icon channel-amadeus',
				'SABRE'		: 'channel-icon channel-sabre',
				'GALILEO'	: 'channel-icon channel-galileo',
				'WORLDSPAN'	: 'channel-icon channel-worldspan',
				'DHISCO'	: 'channel-icon channel-dhisco',
				'EDREAMS'	: 'channel-icon channel-edreams',
				'GOVOYAGES'	: 'channel-icon channel-govoyages',
				'OPODO'		: 'channel-icon channel-opodo',
				'TRAVELLINK': 'channel-icon channel-travellink',
				'LILIGO'	: 'channel-icon channel-liligo',
				'OTHER'		: 'mdi mdi-web material-icons',
			};
		};
		
		return service;
	}
})();