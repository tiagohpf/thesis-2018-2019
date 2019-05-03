(function($) {
	var calcSizes = function() {
		var sectionHeaderHeight = $('.fx-entity-header').outerHeight();
		var sectionTabsHeight = $('.fx-main-tabs').height();
		var mainContentHeight = $('.fx-main-content-wrapper').height();
		$(".fx-main-tab-content").css("height", mainContentHeight - (sectionHeaderHeight + sectionTabsHeight));
	}

	$(document).ready(function() {
		//adjusts sizes on window resize
		$(window).on('resize', function() {
			calcSizes();
		});
		
	
	});

	$(window).ready(function() {
		calcSizes();
	});

	//when tab is changed we must call for calcSizes() function to reset sizes
	$('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
		calcSizes();
	})
})(jQuery);
