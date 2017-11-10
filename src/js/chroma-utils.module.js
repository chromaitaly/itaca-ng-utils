(function() {
    'use strict';
    
    angular.module("chroma.utils", ["ngMaterial", "pascalprecht.translate", "tmh.dynamicLocale", "LocalStorageModule"]);
    
    angular.module("chroma.components").config(function($windowProvider, $translateProvider, tmhDynamicLocaleProvider, localStorageServiceProvider) {
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
    	
    	localStorageServiceProvider.setPrefix('itaca-ai');
    });
})();