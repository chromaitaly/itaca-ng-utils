(function() {
    'use strict';
    
    angular.module("itaca.utils", ["ngMaterial", "itaca.services", "pascalprecht.translate", "tmh.dynamicLocale", "LocalStorageModule"]);
    
    angular.module("itaca.utils").config(function($windowProvider, $translateProvider, tmhDynamicLocaleProvider) {
    	var defaultLocale = ($windowProvider.$get().navigator.language || $windowProvider.$get().navigator.userLanguage).split("-")[0].toLowerCase();

    	$translateProvider.useLoader('i18nLoader');
    	// $translateProvider.determinePreferredLanguage();
    	$translateProvider.preferredLanguage(defaultLocale);
    	$translateProvider.useCookieStorage();
    	$translateProvider.useMissingTranslationHandlerLog();
    	$translateSanitizationProvider.addStrategy('sce', 'sceStrategy');
    	$translateProvider.useSanitizeValueStrategy('sce');
    	tmhDynamicLocaleProvider
    			.localeLocationPattern('/resources/public/js/i18n/angular-locale_{{locale}}.js');
    	tmhDynamicLocaleProvider.useCookieStorage();
    	tmhDynamicLocaleProvider.defaultLocale(defaultLocale);
    });
})();