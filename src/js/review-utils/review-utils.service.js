/**
 * Reviews Utils
 */
(function() {
	'use strict';
	
	angular.module("chroma.utils").factory("ReviewsUtils", ReviewsUtilsFactory);
	
	/* @ngInject */
	function ReviewsUtilsFactory(){
		var service = {};
		
		// genero il titolo in base allo score
		service.generateScoreLabel = function(score){
			if(!score){
				return;
			}
			
			var label;
			
			switch(score) {
				case 4: label = "review.score.bad"; break;
				case 5: label = "review.score.poor"; break;
				case 6: label = "review.score.sufficient"; break;
				case 7: label = "review.score.good"; break;
				case 8: label = "review.score.very.good"; break;
				case 9: label = "review.score.excellent"; break;
			    case 10: label = 'review.score.fabulous'; break;
			}
				
			return label;
		};
		
		return service;
	}

})();