(function($) {
    $(document).ready(function () {

        FUXI.CheckboxToggler.init();

		var devGuideBulkActionsTable = $('#devguide-bulk-actions-table');

		var tableGeneralVisionConf = $.extend({}, FUXI.Presets.DataTables, {
		    'iDisplayLength': 10,
		    'aLengthMenu': [5, 10, 25, 50],
		    "fnDrawCallback": function (oSettings) {
		        /* Need to redo the counters if filtered or sorted */
		        if (oSettings.bSorted || oSettings.bFiltered) {
		            for (var i = 0, iLen = oSettings.aiDisplay.length ; i < iLen ; i++) {
		                this.fnUpdate(i + 1, oSettings.aiDisplay[i], 1, false, false);
		            }
		        }
		    },
		    "aoColumns": [
                { "bSortable": false },
                { "bSortable": false },
                { "bSortable": true },
                { "bSortable": true },
                { "bSortable": true },
                { "bSortable": true },
                { "bSortable": false }
		    ],
		    'aaSorting': [[2, "desc"]],

		});

		devGuideBulkActionsTable.on('init.dt', FUXI.Utils.SetDTPagination).dataTable(tableGeneralVisionConf);
       
		//custom search on table
		$("#myInputTextField").on('keyup', function () {
		    devGuideBulkActionsTable.dataTable().fnFilter(this.value);
		});

		devGuideBulkActionsTable.on('change', 'th :checkbox, td :checkbox', function () {
		    var $this = $(this),
                CB_path = $this.parent(),
                DT_path = $this.closest(devGuideBulkActionsTable).parent(),
                removeBtn = DT_path.parent().prev().find('#devguide-bulk-actions-row-ops button'),
                TD_checked = DT_path.find('td :checkbox:checked').length;
		    if (CB_path.is('td')) {
		        if (TD_checked === 1) {
		            removeBtn.removeClass('disabled');
		        } else if (TD_checked > 1) {
		            removeBtn.removeClass('disabled');
		        } else {
		            removeBtn.addClass('disabled');
		        }
		    } else {
		        if ($this.is(':checked')) {
		            removeBtn.removeClass('disabled');
		        } else {
		            removeBtn.addClass('disabled');
		        }
		    }

		});


		FUXI.FixedPositions.init();

	});
})(jQuery);
