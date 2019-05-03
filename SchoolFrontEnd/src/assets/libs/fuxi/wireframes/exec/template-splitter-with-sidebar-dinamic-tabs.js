$(document).ready(function() {
    
    function getTabNameRnd() {

        var arr = ['', 'MUITO TEXTO NA TAB ABCDEFGHTJLAM SFSDFABCDEFGHTJLAM', 'POUCO ?', 'SFSDFABCDEFGHTJLAM SFSDF', 'TAB !'];

        var x = Math.floor(Math.random() * 4) + 1;
        return arr[x];
    }
        
    // add tab button behaviour
	$('#btnAddTab').click(function () {
	    var tabNum = $("#pageTab").children().length + 1;
	    var tabName = getTabNameRnd();

	    $('#pageTab').append($('<li class="fx-dynamic-tab"><a id="a' + tabNum + '" href="#tab' + tabNum + '">' + tabName + '<button class="close" title="Remove this tab" type="button">&times;</button>' + '</a></li>'));
	    $('#pageTabContent').append($('<div class="tab-pane" id="tab' + tabNum + '">Content tab ' + tabName + '</div>'));
		$("#a" + tabNum).click();
				
		var fxSliderTab = $('#pageTab').closest("[data-fx-slider-tab]").data("fxslidertab");
		fxSliderTab.handleResize();		
		fxSliderTab.right();
	});

	$('#btnAddTab2').click(function () {
	    var tabNum = $("#pageTab2").children().length + 1;

	    $('#pageTab2').append($('<li class="fx-dynamic-tab"><a id="a2' + tabNum + '" href="#tab2' + tabNum + '">' + 'Tab ' + tabNum + '<button class="close" title="Remove this tab" type="button">&times;</button>' + '</a></li>'));
	    $('#pageTabContent2').append($('<div class="tab-pane" id="tab2' + tabNum + '">Content tab ' + tabNum + '</div>'));
	    $("#a2" + tabNum).click();

	    var fxSliderTab = $('#pageTab2').closest("[data-fx-slider-tab]").data("fxslidertab");
	    fxSliderTab.handleResize();
	    fxSliderTab.right();
	});
    
	// remove a tab on 'x' click
	$('#pageTab').on('click', ' li a .close', function () {
		var tabId = $(this).parents('li').children('a').attr('href');
		
		// if your going to remove the active tab, goto first
		if ($(tabId).hasClass('active')) {
			$('#pageTab a:first').tab('show');	
		}
		
		$(this).parents('li').remove('li');		
		$(tabId).remove();
		
		reNumberPages();
		
		var fxSliderTab = $('#pageTab').closest("[data-fx-slider-tab]").data("fxslidertab");
		fxSliderTab.handleResize();		
	});
	$('#pageTab2').on('click', ' li a .close', function () {
	    var tabId = $(this).parents('li').children('a').attr('href');

	    // if your going to remove the active tab, goto first
	    if ($(tabId).hasClass('active')) {
	        $('#pageTab2 a:first').tab('show');
	    }

	    $(this).parents('li').remove('li');
	    $(tabId).remove();

	    reNumberPages();

	    var fxSliderTab = $('#pageTab2').closest("[data-fx-slider-tab]").data("fxslidertab");
	    fxSliderTab.handleResize();
	});
    
	// click tab to show its contents
	$("#pageTab,#pageTab2").on("click", "a", function (e) {
	    e.preventDefault();
		$(this).tab('show');
	});

	// reset numbering on tab buttons
	function reNumberPages() {
	    var tabNum = $("#pageTab").children().not(".fx-dynamic-tab").length;
		var tabCount = $('#pageTab > li.fx-dynamic-tab').length;
		$('#pageTab > li.fx-dynamic-tab').each(function() {
			var pageId = $(this).children('a').attr('href');
			if (pageId == "#tab"+tabNum) {
				return true;
			}

			tabNum++;
			$(this).children('a').html('Tab ' + tabNum + '<button class="close" title="Remove this tab" type="button">&times;</button>');
		});
	};
    
	$('#fx-splitter-bar').on('click', function() {
		var delay = 400; // 0,5 seconds delay to allow window do add scroll

		setTimeout(function () {
		    $("[data-fx-slider-tab]").each(function () {
		        var fxSliderTab = $(this).data("fxslidertab");
		        fxSliderTab.handleResize();
		    });
		}, delay);
	});
});