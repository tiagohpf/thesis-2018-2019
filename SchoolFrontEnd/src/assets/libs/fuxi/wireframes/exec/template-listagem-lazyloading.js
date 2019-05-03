(function ($) {
    var DTSettings,
		colFilterSettings;

    $(document).ready(function () {
        //select 2 inputs - The ids used are just for demo purposes. The development team may change ids if they want
        $('#input-save-filters').select2({
            placeholder: "selecione filtro pessoal"
        });

        $('#deleteFilterName, #editFilterName').select2();

        $('#input-service-type').select2({
            data: [{
                id: 0,
                text: "serviço 1"
            }, {
                id: 1,
                text: "serviço 2"
            }, {
                id: 2,
                text: "serviço 3"
            }, {
                id: 3,
                text: "serviço 4"
            }],
            placeholder: "Todos os serviços",
            multiple: true
        });

        $('#input-operator').select2({
            data: [{
                id: 0,
                text: "operador 1"
            }, {
                id: 1,
                text: "operador 2"
            }, {
                id: 2,
                text: "operador 3"
            }, {
                id: 3,
                text: "operador 4"
            }],
            placeholder: "Todos os operadores",
            multiple: true
        });

        $('#input-states, #input-admin-states').select2({
            data: [{
                id: 0,
                text: "estado 1"
            }, {
                id: 1,
                text: "estado 2"
            }, {
                id: 2,
                text: "estado 3"
            }, {
                id: 3,
                text: "estado 4"
            }],
            placeholder: "Todos os estados",
            multiple: true
        });

        $('#saveFilterServiceType, #editSaveFilterServiceType').select2({
            multiple: true,
            placeholder: "pesquisar...",
            data: [{
                id: 0,
                text: "serviço 1"
            }, {
                id: 1,
                text: "serviço 2"
            }, {
                id: 2,
                text: "serviço 3"
            }, {
                id: 3,
                text: "serviço 4"
            }]
        });

        $('#saveFilterServiceType, #editSaveFilterServiceType').select2("val", [0, 3]);

        $('#saveFilterOperator, #editSaveFilterOperator').select2({
            multiple: true,
            placeholder: "pesquisar...",
            data: [{
                id: 0,
                text: "operador 1"
            }, {
                id: 1,
                text: "operador 2"
            }, {
                id: 2,
                text: "oprador 3"
            }, {
                id: 3,
                text: "operador 4"
            }]
        });

        $('#saveFilterOperator, #editSaveFilterOperator').select2("val", [0, 3]);

        $('#saveFilterStatus, #editSaveFilterStatus').select2({
            multiple: true,
            placeholder: "pesquisar...",
            data: [{
                id: 0,
                text: "estado 1"
            }, {
                id: 1,
                text: "estado 2"
            }, {
                id: 2,
                text: "estado 3"
            }, {
                id: 3,
                text: "estado 4"
            }]
        });

        $('#saveFilterStatus, #editSaveFilterStatus').select2("val", [0, 3]);

        //Tabela
        //Just for demo purpose
        DTSettings = $.extend({}, FUXI.Presets.DataTables, {
            'iDisplayLength': 20,
            'aLengthMenu': [20, 50, 100],
            'bProcessing': true,
            'bServerSide': true,
            'oLanguage': {
                'sUrl': '/fuxi/lib/datatables-pt/1.9/resources/datatables_pt-PT.json'
            },
            'sAjaxSource': 'http://legacy.datatables.net/release-datatables/examples/server_side/scripts/jsonp.php',
            'fnServerData': function (sUrl, aoData, fnCallback, oSettings) {
                oSettings.jqXHR = $.ajax({
                    "url": sUrl,
                    "data": aoData,
                    "success": fnCallback,
                    "dataType": "jsonp",
                    "cache": false
                });
            }
        });
        colFilterSettings = {
            'sPlaceHolder': 'head:after',
            'aoColumns': [
                { 'type': 'text' },
                { 'type': 'text' },
                { 'type': 'text' },
                { 'type': 'text' },
                { 'type': 'text' }, ]
        };
        var oTable = $('#provisioning-table').on('init.dt', FUXI.Utils.SetDTPagination).dataTable(DTSettings).columnFilter(colFilterSettings);

        //Table selected row styles just for demo purpose
        $('#provisioning-table').find('td :checkbox').on('click', function (e) {
            var $checkedEls = $('#provisioning-table').find('td :checked');
            $(this).parent().parent().toggleClass('selected');
            if ($checkedEls.length >= 1) {
                $('#bulk-operation-buttons > button').removeClass('disabled');
                $('#bulk-operation-buttons > a').removeClass('disabled');
            } else {
                $('#bulk-operation-buttons > button').addClass('disabled');
                $('#bulk-operation-buttons > a').addClass('disabled');
            }

            if ($checkedEls.length === 0) {
                $('#provisioning-table').find('th :checkbox').prop('checked', false);
            }
        });

        $('#provisioning-table').find('th :checkbox').on('click', function (e) {
            if ($(this).prop('checked')) {
                $('#provisioning-table').find('td :checkbox').prop('checked', true).parent().parent().not('[class*="selected"]').addClass('selected');
                $('#bulk-operation-buttons > button').removeClass('disabled');
                $('#bulk-operation-buttons > a').removeClass('disabled');
            } else {
                $('#provisioning-table').find('td :checkbox').prop('checked', false).parent().parent().removeClass('selected');
                $('#bulk-operation-buttons > button').addClass('disabled');
                $('#bulk-operation-buttons > a').addClass('disabled');
            }
        });

        //jstree to manage sidebar filters
        $("#jsTreeManageTableColumns, #jsTreeManageFilterOptions, #jsTreeManageFilterOptions1, #jsTreeManageFilterOptions2").jstree({
            "plugins": ["themes", "html_data", "checkbox", "dnd"],
            "core": {
                "initially_open": ["jsTreeManageOptionsGroup1", "jsTreeManageOptionsGroup2", "jsTreeGroup1", "jsTreeGroup2"]
            },
            "themes": {
                "theme": "fuxi",
                "icons": false
            }
        });
    });

    // Movido para o common-fuxi.js
    // places the dropdown menu in the correct place
    /*$('.btn-group.fx-pos-static > .fx-dropdown-toggle').on('click', function(e) {
		var posDropdown = $(this).position();
		$('.btn-group.fx-pos-static > .fx-dropdown').css({
			top : posDropdown.top + $('.fx-dropdown-toggle').outerHeight(),
			left : posDropdown.left - ($('.fx-dropdown').outerWidth() - $('.fx-dropdown-toggle').outerWidth() - 25)
		})

	});*/
})(jQuery);
