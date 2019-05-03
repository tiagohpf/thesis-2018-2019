(function($) {
	var $splitterBar = $("#fx-splitter-bar");
	var $splitterSideBar = $("#fx-splitter-sidebar");
	var $splitterSideBarContent = $("#fx-splitter-sidebar-content");
	var $splitterSidebarButtons = $(".fx-splitter-sidebar-buttons");
	var $splitterSidebarIconFeature = $(".fx-icon-represent-feature");
	
	var calcSizes = function() {
		var docHeight = $(window).height();
		var docWidth = $(window).width();
		var pageMainNavWidth = $('#fx-page-main-nav').width();
		var splitterSidebarWidth = $splitterSideBar.width();
		var splitterBarWidth = $splitterBar.width();

		$splitterSideBar.css("left", pageMainNavWidth);
		$splitterBar.css("left", pageMainNavWidth + splitterSidebarWidth);

		$("#fx-splitter-content").css({
			"width" : docWidth - (pageMainNavWidth + splitterSidebarWidth + splitterBarWidth) - 1,
			"left" : (pageMainNavWidth + splitterSidebarWidth + splitterBarWidth) - 1
		});
		//-1 because sidebar has 1px border right

		var splitterSideBarHeight = $('#fx-splitter-sidebar').height();
		var splitterSidebarButtonsWrapperHeight = $('.fx-splitter-sidebar-buttons').height();

		$('#fx-splitter-sidebar-content').css('height', splitterSideBarHeight - splitterSidebarButtonsWrapperHeight);

		var sidebarHeaderHeight = $('.fx-sidebar-header').height();
		$('.fx-sidebar-content-wrapper').css('padding-top', sidebarHeaderHeight);
	}

	$(document).ready(function() {
		$("[data-toggle='tooltip']").tooltip();
		
		//Toggles sidebar
		$splitterBar.tooltip({
			placement : 'right'
		});

		var TriggerClick = 0;
		$splitterBar.click(function() {
			if (TriggerClick == 0) {
				TriggerClick = 1;
				$splitterSideBar.animate({
					width : '40px'
				}, 200, 'linear', calcSizes);
				$splitterSideBarContent.fadeOut(200);
				$splitterSidebarButtons.fadeOut(200);
				$splitterSidebarIconFeature.fadeIn(200);
				$splitterBar.attr('data-original-title', 'maximizar sidebar');
			} else {
				TriggerClick = 0;
				$splitterSideBar.animate({
					width : '250px'
				}, 200, 'linear', calcSizes);
				$splitterSideBarContent.fadeIn(200);
				$splitterSidebarButtons.fadeIn(200);
				$(".fx-icon-represent-feature").fadeOut(200);
				$splitterBar.attr('data-original-title', 'minimizar sidebar');
			};
		});

		//Affix sidebar header
		var stickySidebarHeader = function() {
			var scrollTop = $splitterSideBarContent.scrollTop();
			if (scrollTop > 5) {
				$('.fx-sidebar-header').addClass('fx-sticky-shadow');
			} else {
				$('.fx-sidebar-header').removeClass('fx-sticky-shadow');
			}
		};

		$splitterSideBarContent.scroll(function() {
			stickySidebarHeader();
		});

		//Affix entity header
		var stickyEntityHeader = function() {
			var scrollTop = $('#fx-splitter-content').scrollTop();
			if (scrollTop > 10) {
				$('.fx-entity-header').addClass('fx-sticky-shadow');
			} else {
				$('.fx-entity-header').removeClass('fx-sticky-shadow');
			}
		};

		$('#fx-splitter-content').scroll(function() {
			stickyEntityHeader();
		});

		$(window).on('resize', function() {
			calcSizes();
		});

	});

	//recalculates elements sizes when resize window
	$(window).ready(function() {
		calcSizes();
	});
})(jQuery);
