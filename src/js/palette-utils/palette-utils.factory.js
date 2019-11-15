/**
 * Utility per le palette
 * 
 */
(function() {
	'use strict';
	
	angular.module("itaca.utils").factory('PaletteUtils', PaletteUtilsFactory);
	
	/* @ngInject */
	function PaletteUtilsFactory($mdTheming){
		var $$service = {};
		
		
		$$service.getPalette = function(palette, color){
			palette = palette || 'ch-primary';
			color = color || '600';
			
			return $mdTheming.PALETTES[palette][color];
		};
		
		$$service.getCurrentPalette = function(color){
			return $$service.getPalette('ch-primary', color);
		};
		
		$$service.getCurrentPaletteHEX = function(color){
			return $$service.getCurrentPalette(color).hex;
		};
		
		$$service.getCurrentPaletteRGB = function(color){
			return $$service.getCurrentPalette(color).value;
		};
		
		return $$service;
	}
})();