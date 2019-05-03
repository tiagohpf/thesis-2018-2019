/// <reference path="../../../common/exec/common-fuxi.js" />
var auxFuncs = {
    wizard: {
        //WIZARD DEFAULT
        devguideWizDefaultValidateStep: function (args) {
            var step = args.step;
            var w = args.Wizard;

            switch (step) {
                case 1:
                    // função para validar o step 1...
                    return { isValid: true };
                    break;
                case 2:
                    // função para validar o step 2...
                    return { isValid: true };
                    break;
            }
        },

        //WIZARD SUBSTEPS
        devguideWizValidateAllSubsteps: function (args) {
            return {
                isValid: true,
                message: '<p>Mensagem de validação.</p>'
            };
        },

        //WIZARD DYNAMIC
        showDynamic: function (elem) {
            var $this = $(elem);

            FUXI.Wizard.toggleDynamicSteps($this);
            FUXI.Wizard.rearrangeNumeration($this.closest("[data-wizard]"));
        },

        devguideWizValidateDynamic: function (args) {
            return {
                isValid: true,
                message: '<p>Mensagem de validação.</p>'
            };
        },

        summaryDynamicWiz: [
            [],
            [
                { stepDecision: true, title: 'Trigger step dinâmico', value: 'True' },
            ]
        ],

        //WIZARD VALIDATION
        devguideWizValidateAllValidate: function (args) {
            return {
                isValid: false,
                message: '<p>Mensagem de validação.</p>'
            };
        },

        //WIZARD SUMMARY
        summary: [
            [],
            [
                { stepDecision: false, title: 'Nome do campo', value: 'Valor do campo' },
                { stepDecision: true, title: 'Nome do campo', value: 'Valor do campo' }
            ]
        ]
    }
}



var devGuideJsComponents = function () {
    return {
        quickview: function () {
            $('#quickview-xxs').popover({
                content: $('#content-quickview').html(),
                html: true,
                placement: 'bottom auto',
                template: '<div class="popover fx-popover-xxs"><div class="arrow"></div><div class="popover-content no-padding"></div></div>'
            });

            $('#quickview-xs').popover({
                content: $('#content-quickview').html(),
                html: true,
                placement: 'bottom auto',
                template: '<div class="popover fx-popover-xs"><div class="arrow"></div><div class="popover-content no-padding"></div></div>'
            });

            $('#quickview-s').popover({
                content: $('#content-quickview').html(),
                html: true,
                placement: 'bottom auto',
                template: '<div class="popover fx-popover-s"><div class="arrow"></div><div class="popover-content no-padding"></div></div>'
            });

            $('#quickview-m').popover({
                content: $('#content-quickview').html(),
                html: true,
                placement: 'bottom auto',
                template: '<div class="popover fx-popover-m"><div class="arrow"></div><div class="popover-content no-padding"></div></div>'
            });

            $('#quickview-l').popover({
                content: $('#content-quickview').html(),
                html: true,
                placement: 'bottom auto',
                template: '<div class="popover fx-popover-l"><div class="arrow"></div><div class="popover-content no-padding"></div></div>'
            });

            $('#quickview-complex').popover({
                content: $('#content-quickview-complex').html(),
                html: true,
                placement: 'bottom auto',
                template: '<div class="popover fx-popover-m"><div class="arrow"></div><div class="popover-content no-padding"></div></div>'
            });
        },

        modal: function () {
            //used to explain modal sizing
            $('#my-sized-modal').on('show.bs.modal', function (event) {
                var button = $(event.relatedTarget) // Button that triggered the modal
                var recipient = button.data('sizing') // Extract info from data-* attributes

                var modal = $(this);
                modal.find('#demo-info-modal-size').text(recipient.toUpperCase());

                var modalSizingObj = modal.find('.modal-dialog');

                switch (recipient) {
                    case "default":
                        modalSizingObj.prop('class', 'modal-dialog');
                        break;
                    case "s":
                        modalSizingObj.prop('class', 'modal-dialog fx-modal-s');
                        break;
                    case "m":
                        modalSizingObj.prop('class', 'modal-dialog fx-modal-m');
                        break;
                    case "l":
                        modalSizingObj.prop('class', 'modal-dialog fx-modal-l');
                        break;
                    case "xl":
                        modalSizingObj.prop('class', 'modal-dialog fx-modal-xl');
                        break;
                    case "fullscreen":
                        modalSizingObj.prop('class', 'modal-dialog fx-modal-fullscreen');
                        break;
                };
            });

            //used to explain draggable modal
            $("#my-drag-modal-dialog").draggable({
                handle: ".fx-drag"
            });
        },

        alerts: function () {
            //alerts toastr
            var options = {
                "target": 'body',
                "closeButton": true,
                "debug": false,
                "newestOnTop": true,
                "progressBar": false,
                "positionClass": "toast-top-center",
                "preventDuplicates": false,
                "onclick": null,
                "showDuration": "100",
                "hideDuration": "100",
                "timeOut": "5000",
                "extendedTimeOut": "5000",
                "showEasing": "swing",
                "hideEasing": "linear",
                "showMethod": "fadeIn",
                "hideMethod": "fadeOut"
            }

            $(".btn-toastr").on('click', function () {
                var type = $(this).data("type");
                var translateType = "";
                switch (type) {
                    case "success":
                        translateType = "sucesso";
                        break;
                    case "info":
                        translateType = "informativa";
                        break;
                    case "warning":
                        translateType = "aviso";
                        break;
                    case "error":
                        translateType = "erro";
                        break;
                };
                toastr.options = options;
                toastr[type]("Alerta geral com mensagem de " + translateType + ".", "Título do alerta");
            })

            //alerts table
            var tableAlertConf = $.extend({}, FUXI.Presets.DataTables, {
                'iDisplayLength': 10,
                'aLengthMenu': [5, 10, 25, 50],
                "aoColumns": [
                    { "bSortable": false },
                    { "bSortable": false },
                    { "bSortable": false },
                    { "bSortable": false }
                ]
            });

            $('#table-alert').on('init.dt', FUXI.Utils.SetDTPagination).dataTable(tableAlertConf);

            var tableAlertContextualConf = $.extend({}, FUXI.Presets.DataTables, {
                'iDisplayLength': 10,
                'aLengthMenu': [5, 10, 25, 50],
                "aoColumns": [
                    { "bSortable": false },
                    { "bSortable": false },
                    { "bSortable": false },
                    { "bSortable": false }
                ]
            });

            $('#table-alert-contextual').on('init.dt', FUXI.Utils.SetDTPagination).dataTable(tableAlertContextualConf);
        },

        progressBar: function () {
            //progress undetermined
            $('#btn-trigger-progress-undetermined').on('click', function () {
                var $this = $(this);
                $('.fx-progress-undetermined').addClass('active');
                $this.addClass('disabled');
                setTimeout(function () {
                    $('.fx-progress-undetermined').removeClass('active');
                    $this.removeClass('disabled');
                }, 5000);
            });

            //progressbar measurable
            var triggerProgressBar = $('#btn-trigger-progress-measurable'),
                progressBar = $('.devguide-progress-bar'),
                progressBarStatus = $('.devguide-progress-bar-label'),
                width = 0;

            progressBar.width(width);

            function showProgress() {
                var interval = setInterval(function () {
                    width += 5;

                    progressBar.css({
                        'width': width + '%',
                        'display': 'block'
                    });
                    progressBarStatus.text(width + '%');
                    triggerProgressBar.addClass('disabled');

                    if (width >= 100) {
                        clearInterval(interval);
                        triggerProgressBar.removeClass('disabled');
                    }
                }, 100);
            }


            triggerProgressBar.on('click', function () {
                width = 0;
                progressBar.css({
                    'width': '0%',
                    'display': 'none'
                });
                progressBarStatus.text('0%');
                triggerProgressBar.addClass('disabled');
                setTimeout(function () {
                    showProgress()
                }, 600);

            });
        },

        loading: function () {
            //sets BlockUI default values
            FUXI.BlockUiDefaults.init();


            //trigger loader visual elements
            $('#btn-trigger-loading-visual-elements').on('click', function () {
                var $this = $(this);
                $this.siblings($('#devguide-table-visual-loading-elements')).find($('[class *= "fx-ico-loading"]')).removeClass('inactive');
                $this.addClass('disabled');
                setTimeout(function () {
                    $this.siblings($('#devguide-table-visual-loading-elements')).find($('[class *= "fx-ico-loading"]')).addClass('inactive');
                    $this.removeClass('disabled');
                }, 5000);
            });

            //loading to page demo
            $('#devguide-freeze-page').click(function (e) {
                $.blockUI({
                    onOverlayClick: $.unblockUI,
                    message: '<div class="modal">' +
                             '    <div class="modal-header"></div>' +
                             '    <div class="modal-body">' +
                             '        <div class="fx-block-wrapper">' +
                             '            <div class="fx-ico-loading fx-ico-loading-m"><span class="sr-only">A carregar conteúdo...</span></div>' +
                             '            <div class="fx-ico-loading-message">' +
                             '                <p>A carregar página...aguarde, por favor.</p>' +
                             '            </div>' +
                             '        </div>' +
                             '    </div><div class="modal-footer">' +
                             '        <button id="devguide-unfreeze-page" type="button" class="btn btn-default btn-sm">cancelar</button>' +
                             '    </div>' +
                             '</div>',
                    css: {
                        backgroundColor: '#fff',
                        border: '1px solid #999;',
                        'box-shadow': '0 3px 7px rgba(0, 0, 0, 0.3)',
                        'background-clip': 'padding-box'
                    },
                    onBlock: function () {
                        $('#devguide-unfreeze-page').click(function () {
                            $.unblockUI();
                        });
                    }
                });
            });

            //loading to object demo
            $('#devguide-freeze-object').click(function (e) {
                var $this = $(this);

                $('#devguide-freezed-object').block({});
                $this.addClass('disabled');
                setTimeout(function () {
                    $('#devguide-freezed-object').unblock();
                    $this.removeClass('disabled');
                }, 10000);
            });

            //loading button demo
            $("#devguide-loading-button, #devguide-loading-icon-button").click(function () {
                console.log($(this));
                var $btn = $(this);
                $btn.button('loading');
                // simulating a timeout
                setTimeout(function () {
                    $btn.button('reset');
                }, 5000);
            });

            //loading tab demo
            $('a[id="devguide-trigger-loading-tab2"]').on('shown.bs.tab', function (e) {
                var blockedTabContent = $('.devguide-tab-blocked-content');
                blockedTabContent.addClass('hidden');
                $('#devguide-loading-tab2').block({});
                setTimeout(function () {
                    $('#devguide-loading-tab2').unblock({
                        onUnblock: function () {
                            blockedTabContent.removeClass('hidden');
                        }
                    })
                }, 5000);
            });


            //trigger loader tab
            $('#btn-trigger-loading-silent-tab').on('click', function () {
                var $this = $(this);
                $this.siblings($('.fx-main-tabs')).find($('[class *= "fx-ico-loading"]')).removeClass('inactive');
                $this.addClass('disabled');
                setTimeout(function () {
                    $this.siblings($('.fx-main-tabs')).find($('[class *= "fx-ico-loading"]')).addClass('inactive');
                    $this.removeClass('disabled');
                }, 5000);
            });

            //loading table demo
            //alerts table
            var tableLoadingConf = $.extend({}, FUXI.Presets.DataTables, {
                'iDisplayLength': 10,
                'aLengthMenu': [5, 10, 25, 50],
                "aoColumns": [
                    { "bSortable": false, "mData": "col1" },
                    { "bSortable": false, "mData": "col2" },
                    { "bSortable": false, "mData": "col3" },
                    { "bSortable": false, "mData": "col4" },
                ],
                'bRetrieve': true,
                //'sAjaxSource': 'file.json'
            });

            $('#devguide-table-loading').on('init.dt', FUXI.Utils.SetDTPagination).dataTable(tableLoadingConf);

            $('#btn-trigger-loading-table').on('click', function () {
                var $this = $(this);
                var loader = '<div class="fx-ico-loading fx-ico-loading-m"><span class="sr-only">A carregar conteúdo...</span></div> <div class="loader-text">A carregar...</div>';
                var emptyInfo = '<i class="fx-text-disabled">Não existem registos a apresentar</i>';

                $this.addClass('disabled');
                $('#devguide-table-loading').find('td.dataTables_empty').html(loader);
                setTimeout(function () {
                    $('#devguide-table-loading').find('td.dataTables_empty').html(emptyInfo);
                    $this.removeClass('disabled');
                }, 5000);
            });







        },

        table: function () {
            //table overview
            //table export cols
            //table manage cols
            //table paging
            var tableGeneralVisionConf = $.extend({}, FUXI.Presets.DataTables, {
                'iDisplayLength': 10,
                'aLengthMenu': [5, 10, 25, 50],
                "aoColumns": [
                    { "bSortable": false },
                    { "bSortable": false },
                    { "bSortable": false },
                ],
                "aaData": [
                    ["Aveiro", "Aveiro", "Aveiro", ],
                    ["Cantanhede", "Cantanhede", "Coimbra", ],
                    ["Coimbra", "Coimbra", "Coimbra", ],
                    ["Faro", "Faro", "Faro", ],
                    ["Figueira da Foz", "Figueira da Foz", "Coimbra", ],
                    ["Gouveia", "Gouveia", "Guarda", ],
                    ["Guarda", "Guarda", "Guarda", ],
                    ["Ílhavo", "Ílhavo", "Aveiro"],
                    ["Lisboa", "Lisboa", "Lisboa", ],
                    ["Viseu", "Viseu", "Viseu", ],
                    ["Porto", "Porto", "Porto", ],
                ]
            });

            $('.devguide-test-table').on('init.dt', FUXI.Utils.SetDTPagination).dataTable(tableGeneralVisionConf);


            //sorting
            var tableSortingConf = $.extend({}, FUXI.Presets.DataTables, {
                'iDisplayLength': 10,
                'aLengthMenu': [5, 10, 25, 50],
                'aoColumns': [null, null, null],
                'aaSorting': [[2, "desc"]],
                "aaData": [
                    ["Aveiro", "Aveiro", "Aveiro", ],
                    ["Cantanhede", "Cantanhede", "Coimbra", ],
                    ["Coimbra", "Coimbra", "Coimbra", ],
                    ["Faro", "Faro", "Faro", ],
                    ["Figueira da Foz", "Figueira da Foz", "Coimbra", ],
                    ["Gouveia", "Gouveia", "Guarda", ],
                ]
            });

            $('#devguide-sorting-table').on('init.dt', FUXI.Utils.SetDTPagination).dataTable(tableSortingConf);


            //filtering
            var tableFilteringConf = $.extend({}, FUXI.Presets.DataTables, {
                'iDisplayLength': 10,
                'aLengthMenu': [5, 10, 25, 50],
                "aoColumns": [
                    { "bSortable": false },
                    { "bSortable": false },
                    { "bSortable": false },
                ],
                "aaData": [
                    ["Aveiro", "Aveiro", "Aveiro", ],
                    ["Cantanhede", "Cantanhede", "Coimbra", ],
                    ["Coimbra", "Coimbra", "Coimbra", ],
                    ["Faro", "Faro", "Faro", ],
                    ["Figueira da Foz", "Figueira da Foz", "Coimbra", ],
                    ["Gouveia", "Gouveia", "Guarda", ],
                ]
            });

            var tableFilteringColFilter = $.extend({}, FUXI.Presets.DataTablesColFilter, {
                'aoColumns': [
                    { 'type': 'text' },
                    { 'type': 'text' },
                    { 'type': 'text' }]
            });

            $('#devguide-filtering-table').on('init.dt', FUXI.Utils.SetDTPagination).dataTable(tableFilteringConf).columnFilter(tableFilteringColFilter);


            //rowgrouping
            var oTable,
                tableRowgroupConf = $.extend({}, FUXI.Presets.DataTables, {
                    'iDisplayLength': 10,
                    'bPaginate': false,
                    'bInfo': false,
                    'aoColumns': [null, null, null],
                    'aaSorting': [],
                    "aaData": [
                        ["Aveiro", "Aveiro", "Aveiro", ],
                        ["Cantanhede", "Cantanhede", "Coimbra", ],
                        ["Coimbra", "Coimbra", "Coimbra", ],
                        ["Faro", "Faro", "Faro", ],
                        ["Figueira da Foz", "Figueira da Foz", "Coimbra", ],
                        ["Gouveia", "Gouveia", "Guarda", ],
                        ["Guarda", "Guarda", "Guarda", ],
                        ["Ílhavo", "Ílhavo", "Aveiro"],
                        ["Lisboa", "Lisboa", "Lisboa", ],
                        ["Viseu", "Viseu", "Viseu", ],
                        ["Porto", "Porto", "Porto", ],
                    ],
                    'oLanguage': {
                        'sProcessing': 'A processar...',
                        'sLengthMenu': '_MENU_ registos por página',
                        'sZeroRecords': 'Não foram encontrados resultados',
                        'sInfo': 'Total de registos <strong>_TOTAL_</strong>',
                        'sInfoEmpty': 'Apresentando de 0 até 0 de 0 registos',
                        'sInfoFiltered': '(filtrado de _MAX_ registos no total)',
                        'sInfoPostFix': '',
                        'sSearch': 'Procurar:',
                        'sUrl': '',
                        'oPaginate': {
                            'sFirst': '',
                            'sPrevious': 'anterior',
                            'sNext': 'seguinte',
                            'sLast': ''
                        }
                    },
                },
                initTable = function (colGroupingIndex) {
                    return oTable.dataTable(tableRowgroupConf)
                        .rowGrouping({
                            bExpandableGrouping: true,
                            bExpandSingleGroup: false,
                            bHideGroupingColumn: true,
                            iExpandGroupOffset: -1,
                            asExpandedGroups: [""],
                            'iGroupingColumnIndex': colGroupingIndex
                        });
                });

            oTable = $('#devguide-rowgroup-table').on('init.dt', FUXI.Utils.SetDTPagination);

            oTable = initTable(2);


            //colreorder
            var tableColReorderConf = $.extend({}, FUXI.Presets.DataTables, {
                'iDisplayLength': 10,
                'aLengthMenu': [5, 10, 25, 50],
                "aoColumns": [
                    { "bSortable": false },
                    { "bSortable": false },
                    { "bSortable": false },
                ],
                "aaData": [
                    ["Aveiro", "Aveiro", "Aveiro", ],
                    ["Cantanhede", "Cantanhede", "Coimbra", ],
                    ["Coimbra", "Coimbra", "Coimbra", ],
                    ["Faro", "Faro", "Faro", ],
                    ["Figueira da Foz", "Figueira da Foz", "Coimbra", ],
                    ["Gouveia", "Gouveia", "Guarda", ],
                    ["Guarda", "Guarda", "Guarda", ],
                    ["Ílhavo", "Ílhavo", "Aveiro"],
                    ["Lisboa", "Lisboa", "Lisboa", ],
                    ["Viseu", "Viseu", "Viseu", ],
                    ["Porto", "Porto", "Porto", ],
                ],
                'sDom': 'RT<"clear">rt<"dataTable-table-info"li><"dataTable-pagination-wrapper"p>',
            });

            $('#devguide-colreorder-table').on('init.dt', FUXI.Utils.SetDTPagination).dataTable(tableColReorderConf);


            //rowreorder
            var tablerowReorderConf = $.extend({}, FUXI.Presets.DataTables, {
                'iDisplayLength': 10,
                'aLengthMenu': [5, 10, 25, 50],
                "aoColumns": [
                    { "bSortable": false },
                    { "bSortable": false },
                    { "bSortable": false },
                ],
                "aaData": [
                    ["Aveiro", "Aveiro", "Aveiro", ],
                    ["Cantanhede", "Cantanhede", "Coimbra", ],
                    ["Coimbra", "Coimbra", "Coimbra", ],
                    ["Faro", "Faro", "Faro", ],
                    ["Figueira da Foz", "Figueira da Foz", "Coimbra", ],
                    ["Gouveia", "Gouveia", "Guarda", ],
                    ["Guarda", "Guarda", "Guarda", ],
                    ["Ílhavo", "Ílhavo", "Aveiro"],
                    ["Lisboa", "Lisboa", "Lisboa", ],
                    ["Viseu", "Viseu", "Viseu", ],
                    ["Porto", "Porto", "Porto", ],
                ],

            });

            $('#devguide-rowreorder-table').on('init.dt', FUXI.Utils.SetDTPagination).dataTable(tablerowReorderConf);


            //colactions
            var tableColActionsConf = $.extend({}, FUXI.Presets.DataTables, {
                'iDisplayLength': 10,
                'aLengthMenu': [5, 10, 25, 50],
                "aoColumns": [
                    { "bSortable": false },
                    { "bSortable": false },
                    { "bSortable": false },
                    { "bSortable": false },
                ]

            });

            $('#devguide-col-actions-table').on('init.dt', FUXI.Utils.SetDTPagination).dataTable(tableColActionsConf);


            //bulk actions
            FUXI.CheckboxToggler.init();

            var tableBulkActionsConf = $.extend({}, FUXI.Presets.DataTables, {
                'iDisplayLength': 10,
                'aLengthMenu': [5, 10, 25, 50],
                "aoColumns": [
                    { "bSortable": false },
                    { "bSortable": false },
                    { "bSortable": false },
                    { "bSortable": false },
                ]
            });

            var devGuideBulkActionsTable = $('#devguide-bulk-actions-table');

            devGuideBulkActionsTable.on('init.dt', FUXI.Utils.SetDTPagination).dataTable(tableBulkActionsConf);

            devGuideBulkActionsTable.on('change', 'th :checkbox, td :checkbox', function () {
                var $this = $(this),
                    CB_path = $this.parent(),
                    DT_path = $this.closest(devGuideBulkActionsTable).parent(),
                    removeBtn = DT_path.prev().find('#devguide-bulk-actions-row-ops button'),
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


            //no records

            var tableNoRecordsConf = $.extend({}, FUXI.Presets.DataTables, {
                'iDisplayLength': 10,
                'aLengthMenu': [5, 10, 25, 50],
                "aoColumns": [
                    { "bSortable": false },
                    { "bSortable": false },
                    { "bSortable": false },
                    { "bSortable": false },
                ]
            });

            $('#devguide-no-records-table').on('init.dt', FUXI.Utils.SetDTPagination).dataTable(tableNoRecordsConf);


        },

        expressionEditor: function () {
            //the items populating the tree
            var eexpItems = [
                { "id": "demo_root_1", "parent": "#", "text": "Mais usados", "state": { "opened": true }, "li_attr": { "data-showinfo": "false" }, "icon": "fa fa-file" },
                    { "id": "demo_child_1", "parent": "demo_root_1", "text": "criarNovo()", "icon": "glyphicon glyphicon-plus", "li_attr": { "data-showinfo": "true", "data-expression": "createNew()", "data-drag": true }, "info": "Texto de apoio ao utilizador." },
                    { "id": "demo_child_2", "parent": "demo_root_1", "text": "atualizarObjeto()", "icon": "glyphicon glyphicon-refresh", "li_attr": { "data-showinfo": "true", "data-expression": "updateObject()", "data-drag": true }, "info": "Texto de apoio ao utilizador." },
                { "id": "demo_root_3", "parent": "#", "text": "Funções QRE", "li_attr": { "data-showinfo": "false" }, "icon": "fa fa-file" },
            ];

            //the operators
            var eeOperItems = [
                {
                    "name": "operadores lógicos",
                    "cssname": "fx-ee-operations-wrapper",
                    "maxitems": 3,
                    "items": [
                        {
                            "text": "not",
                            "action": "not"
                        },
                        {
                            "text": "or",
                            "action": "or"
                        },
                        {
                            "text": "and",
                            "action": "and"
                        },
                        {
                            "text": "Mod",
                            "action": "Mod"
                        }
                    ]
                },
                {
                    "name": "operadores relacionais",
                    "cssname": "fx-ee-operators-wrapper",
                    "maxitems": 5,
                    "items": [
                        {
                            "text": "+",
                            "action": "sum"
                        },
                        {
                            "text": "-",
                            "action": "subtract"
                        },
                        {
                            "text": "*",
                            "action": "multiply"
                        },
                        {
                            "text": "/",
                            "action": "divide"
                        },
                        {
                            "text": "=",
                            "action": "equals",
                            "weight": "10"
                        },
                    ]
                }
            ];

            //expression editor options
            var options = {
                expressionItems: eexpItems,
                operatorItems: eeOperItems,
                clientCheckRuleSyntaxValidator: "checkRuleSyntax",
            };

            // init editor
            var $ee = $("#expressions-editor");

            $ee.on('confirmclick.ee', function (e) {
                alert('Disparado o evento confirmclick.ee');
            })
            .on('cancelclick.ee', function (e) {
                alert('Disparado o evento cancelclick.ee');
            })
            .on('loaded.ee', function (e) {
                //do stuff
            })
            .on('addexpression.ee', function (e) {
                alert('Disparado o evento addexpression.ee');
            })
            .on('clearrule.ee', function (e) {
                alert('Disparado o evento clearrule.ee');
            })
            .on('checksyntax.ee', function (e) {
                alert('Disparado o evento checksyntax.ee');
            })
            .on('operatorclick.ee', function (e) {
                alert('Disparado o evento operatorclick.ee');
            })
            .on('searchexpressionclick.ee', function (e) {
                alert('Disparado o evento searchexpressionclick.ee');
            })
            .on('searchactionclick.ee', function (e) {
                alert('Disparado o evento searchactionclick.ee');
            })
            .eEditor(options);

            // demo check syntax
            window.checkRuleSyntax = function (rule) {
                console.log("validating rule: " + rule);
                // do something !!!
                return (Math.floor((Math.random() * 100) + 1) % 2 === 0);
            };
        },

        tab: function () {
            //function that will display tab actions menu
            var getRndActions = function () {
                var act = ['', true, false];
                var rnd = Math.floor((Math.random() * 2) + 1);
                return act[rnd] || false;
            }

            //function with the tab actions
            var getRndActionsList = function () {
                var tabactions = [
                    { label: "Ação 1 sobre a tab", action: "#" },
                    { label: "Ação 2 sobre a tab", action: "#" },
                ];
                return tabactions;
            }

            //function that sets a tab as dismissable
            var getRndDismissible = function () {
                var dis = ['', true, false];
                var rnd = Math.floor((Math.random() * 2) + 1);
                return dis[rnd] || false;
            }

            //function that sets tab as sortable
            var getRndSortable = function () {
                var sort = ['', true, false];
                var rnd = Math.floor((Math.random() * 2) + 1);
                return sort[rnd] || false;
            }

            //function that sets validation on tab
            var getRndStatus = function () {
                var status = ['', 'error', 'info', 'warning', 'success', 'undefined'];
                var rnd = Math.floor((Math.random() * 4) + 1);
                return status[rnd] || 'undefined';
            }

            //function that adds a tab
            var addTab = function (name, id, dismissible, sortable, selected, customParams, actions, actionsList) {
                var fxSliderTab = $("#devguide-scroll-tab-example").data("fxslidertab");
                fxSliderTab.addTab(name, id, dismissible, sortable, selected, customParams, actions, actionsList);
            };

            //bt that will trigger addTAb function
            $(".fx-tab-overflow-add-action").on("click", function () {
                var id = Math.floor((Math.random() * new Date()) + 1);
                addTab("tab" + id, id, getRndDismissible(), true, true, { contentUrl: (id % 2) ? 'tabcontent.html?id=' + id : "" }, getRndActions(), getRndActionsList());
            });


            var initializeTab = function () {

                FUXI.SliderTabs.init({});

                $(document).off("fx::tabContentLoaded").on("fx::tabContentLoaded",
                    function (ev, data) {
                        setTimeout(function () {
                            var status = getRndStatus();
                            var translateStatus = "";
                            switch (status) {
                                case "info":
                                    translateStatus = "informações";
                                    break;
                                case "warning":
                                    translateStatus = "avisos";
                                    break;
                                case "error":
                                    translateStatus = "erros";
                                    break;
                                case "success":
                                    translateStatus = "sucesso";
                                    break;
                            };


                            var title = (status) ? 'Tab com ' + translateStatus : '';
                            data.sliderTab.tabContentLoaded(data.tab, status, title);
                        }, 2000);
                    });


                $("#devguide-scroll-tab-example").on("moved.fx.slider.tab", function (ev) {

                }).on("removed.fx.slider.tab", function (ev) {

                }).on("removedAll.fx.slider.tab", function (ev) {

                }).on("added.fx.slider.tab", function (ev) {

                    // append tab content DEMO
                    var id = ev.tab.attr("id");
                    var tabId = "tab" + id;


                    $("#pageTabContent").append($('<div class="tab-pane active" id="' + tabId + '" data-tab-target-id="' + id + '"><div class="fx-tab-pane-inner">' + tabId + '</div></div>'));
                    $(document).trigger('fx::tabContentLoaded', { tab: ev.tab, sliderTab: ev.fxslidertab });

                }).on("left.fx.slider.tab", function (ev) {


                }).on("right.fx.slider.tab", function (ev) {


                }).on("selected.fx.slider.tab", function (ev) {


                });
            }
            initializeTab();
        },

        splitter: function () {
            var outerLayout, middleLayout;
            function createLayouts() {
                var defaults = {
                    resizable: true,
                    livePaneResizing: true,
                    slidable: false,
                    spacing_closed: 40,
                    spacing_open: 10
                };

                outerLayout = $('#devguide-splitter-layout-container').layout({
                    name: "outer"
                    , defaults: defaults
                    , center__paneSelector: ".devguide-splitter-outer-center"
                    , west: {
                        size: 250
                        , maxSize: 500
                        , minSize: 200
                        , paneSelector: ".devguide-splitter-outer-west"
                        , contentSelector: '.fx-sidebar-content'
                        , onopen: function () {
                            outerLayout.resizers.west.find(".fx-info-icon").remove();
                        }
                        , onclose: function () {
                            outerLayout.resizers.west.append('<span class="fx-info-icon"><i class="glyphicon glyphicon-search"></i></span> ');
                        }
                    }
                });
                //add shadow on sidebar content once selector is scrolled
                outerLayout.west.pane.find('.fx-sidebar-content').on('scroll', function () {
                    $this = $(this);
                    $prev = $this.prev();

                    if ($this.scrollTop() > 7 && !$this.hasClass("fx-sticky-shadow")) {
                        $prev.addClass('fx-sticky-shadow');
                    } else if ($this.scrollTop() <= 7 && $prev.hasClass("fx-sticky-shadow")) {
                        $prev.removeClass('fx-sticky-shadow');
                    }
                });

                middleLayout = $('div.devguide-splitter-outer-center').layout({
                    name: "middle"
                    , defaults: defaults
                    , center__paneSelector: ".devguide-splitter-middle-center"
                });
            };

            createLayouts();
        },

        selectboxtree: function () {
            var items = [
                     { "id": "demo_root_1", "parent": "#", "text": "Item 1", "agrupador": true, "a_attr": { "title": "The root node title" } },
                       { "id": "demo_child_1", "parent": "demo_root_1", "text": "Item 1.1", "a_attr": { "title": "The node title" } },
                       { "id": "demo_child_2", "parent": "demo_root_1", "text": "Item 1.2", "a_attr": { "title": "The node title" } },
                       { "id": "demo_child_3", "parent": "demo_root_1", "text": "Item 1.3", "a_attr": { "title": "The node title" } },
                       { "id": "demo_child_4", "parent": "demo_root_1", "text": "Item 1.4", "a_attr": { "title": "The node title" } },
                       { "id": "demo_root_2", "parent": "#", "text": "Item 2", "agrupador": true, "a_attr": { "title": "The root node title" } },
                       { "id": "demo_child_21", "parent": "demo_root_2", "text": "Item 2.1", "a_attr": { "title": "The node title" } },
                       { "id": "demo_child_22", "parent": "demo_root_2", "text": "Item 2.2", "a_attr": { "title": "The node title" } },
                       { "id": "demo_child_23", "parent": "demo_root_2", "text": "Item 2.3", "a_attr": { "title": "The node title" } },
                       { "id": "demo_child_24", "parent": "demo_root_2", "text": "Item 2.4", "a_attr": { "title": "The node title" } }
            ];

            var options = {
                required: true,
                multiple: true,
                showMode: "tree",
                selectableName: "agrupador",
                showSelectAll: true,
                showSearch: true,
                jstreePlugins: ['checkbox', 'search', 'changed', 'selectopens'],
                jstreePluginsConfiguration: [
                {
                    key: 'search',
                    value: {
                        show_only_matches: false
                    }
                },
                {
                    key: 'checkbox',
                    value: {
                        three_state: false,
                        cascade: 'up+down+undetermined'
                    }
                }
                ],
                jstreeCoreConfiguration: [
                {
                    key: 'themes',
                    value: {
                        name: 'fuxi',
                        icons: false
                    }
                }
                ],
                fullWidth: true,
                searchPlaceholder: 'pesquisar...',
                selectedPlaceholder: 'selecionar',
                items: items,
                selectedItems: [{ "id": "demo_child_21", "text": "Item 2.1" }, { "id": "demo_child_24", "text": "Item 2.4" }],
            };

            var selectboxtree = $("#selectboxtree").selectBoxTree(options);
        },

        tree: function () {
            //tree uni selection
            $('#devguide-tree-uni-selection').jstree({
                'core': {
                    'data': [
                       { "id": "root-uni-1", "parent": "#", "text": "Root 1" },
                       { "id": "root-uni-2", "parent": "#", "text": "Root 2", "state": { "opened": true } },
                       { "id": "root-uni-2-child-1", "parent": "root-uni-2", "text": "Child 1", "state": { "selected": true }, },
                       { "id": "root-uni-2-child-2", "parent": "root-uni-2", "text": "Child 2" },
                    ],
                    themes: {
                        name: 'fuxi',
                        icons: false
                    }
                },
            });

            //tree multi selection
            $('#devguide-tree-multi-selection').jstree({
                'core': {
                    'data': [
                       { "id": "root-multi-1", "parent": "#", "text": "Root 1" },
                       { "id": "root-multi-2", "parent": "#", "text": "Root 2", "state": { "opened": true } },
                       { "id": "root-multi-2-child-1", "parent": "root-multi-2", "text": "Child 1", "state": { "selected": true }, },
                       { "id": "root-multi-2-child-2", "parent": "root-multi-2", "text": "Child 2" },
                    ],
                    themes: {
                        name: 'fuxi',
                        icons: false
                    },
                },
                'plugins': ["checkbox"]
            });

            //tree with icons
            $('#devguide-tree-with-icons').jstree({
                'core': {
                    'data': [
                       { "id": "root-icons-1", "parent": "#", "text": "Root 1", "icon": "fa fa-folder" },
                       { "id": "root-icons-2", "parent": "#", "text": "Root 2", "state": { "opened": true }, "icon": "fa fa-folder" },
                       { "id": "root-icons-2-child-1", "parent": "root-icons-2", "text": "Child 1", "state": { "selected": true }, "icon": "fa fa-file" },
                       { "id": "root-icons-2-child-2", "parent": "root-icons-2", "text": "Child 2", "icon": "fa fa-file" },
                    ],
                    themes: {
                        name: 'fuxi',
                        icons: true
                    },
                }
            });

            //tree search
            $("#devguide-tree-search-input").keyup(function () {
                var devguiteTreeSearchString = $(this).val();
                $('#devguide-tree-search').jstree('search', devguiteTreeSearchString);
            });

            $('#devguide-tree-search').jstree({
                'core': {
                    'data': [
                       { "id": "root-search-1", "parent": "#", "text": "Root 1" },
                       { "id": "root-search-2", "parent": "#", "text": "Root 2", "state": { "opened": true } },
                       { "id": "root-search-2-child-1", "parent": "root-search-2", "text": "Child 1", "state": { "selected": true }, },
                       { "id": "root-search-2-child-2", "parent": "root-search-2", "text": "Child 2" },
                    ],
                    themes: {
                        name: 'fuxi',
                        icons: false
                    },
                },
                'plugins': ["search"],
                "search": {
                    "show_only_matches": true
                },
            });

            //tree with quickview plugin
            setNodePopover = function () {
                $("i.fx-jstree-caretmark").popover({
                    html: true,
                    container: 'body',
                    placement: 'right',
                    trigger: 'manual',
                    template: '<div class="popover fx-popover-s"><div class="arrow"></div><div class="popover-content no-padding"></div></div>',
                    content: function () {
                        return $(this).next('.popover-node-info').html();
                    }
                });
            }

            $('#devguide-tree-plugin-quickview').on('ready.jstree', function () {
                setNodePopover();
            }).jstree({
                'core': {
                    'data': [
                       { "id": "root-plugin-quickview-1", "parent": "#", "text": "Root 1", "li_attr": { "showinfo": "true" } },
                       { "id": "root-plugin-quickview-2", "parent": "#", "text": "Root 2", "state": { "opened": true } },
                       { "id": "root-plugin-quickview-2-child-1", "parent": "root-plugin-quickview-2", "text": "Child 1", "state": { "selected": true } },
                       { "id": "root-plugin-quickview-2-child-2", "parent": "root-plugin-quickview-2", "text": "Child 2", },
                    ],
                    themes: {
                        name: 'fuxi',
                        icons: false
                    },
                },
                'plugins': ["caretmark"],
                'caretmark': function (node) {
                    // node info content (popover)   
                    var $elem = $("#caretinfo_" + node.id);
                    // remove info 
                    $elem.next(".popover-node-info").remove();
                    // attach new info
                    $elem.after(formatInfoTemplate(node.original));
                    // toggle popover
                    $elem.popover('toggle');
                },
            }).bind('open_node.jstree', function (node) {
                setNodePopover();
            });

            // format info text on tree-node    
            function formatInfoTemplate(data) {
                var html = "<div class='popover-node-info hide'>" +
                                "<div class='fx-popover-main-content'>" +
                                    "<div class='fx-popover-inner clearfix'>Informação a disponibilizar dentro do quickview.</div>" +
                                "</div>" +
                           "<div>";
                return html;
            }
        },

        widgetSelect: function () {
            //needed for validate purposes
            toastr.options = {
                "closeButton": true,
                "debug": false,
                "positionClass": "toast-top-center",
                "onclick": null,
                "showDuration": "300",
                "hideDuration": "1000",
                "timeOut": "5000",
                "extendedTimeOut": "1000",
                "showEasing": "swing",
                "hideEasing": "linear",
                "showMethod": "fadeIn",
                "hideMethod": "fadeOut",
            };

            var options;

            //self invoking function
            (function setOptions() {
                options = {
                    allowDrag: false,
                    showPageOptionSelectAll: false,
                    openMode: "inline",
                    notificationCallback: notification,
                    selectItemMandatory: true,
                    selectItemMandatoryMessage: "Verifique se selecionou os items pretendidos.",
                    clientAddValidator: validateAdd,
                    lazyLoadCallback: loadItems,
                };
            })();

            loadWS("devguide-widget-select-inline", true);

            // show
            $ws.shownWidgetSelect();

            var $ws;

            function loadWS(wsID, destroy) {
                if (destroy && $ws) $ws.destroy();

                $ws = $("#" + wsID).widgetSelect(options);

                // event fired after widget select is shown;
                $ws.$elem.off('shown.fx.widgetselect').on('shown.fx.widgetselect', widgetSelectShow)

                // event fired after save button clicked on add view
                .off('addsave.fx.widgetselect').on('addsave.fx.widgetselect', saveNewItem)

                // event fired after cancel button clicked on add view
                .off('addcancel.fx.widgetselect').on('addcancel.fx.widgetselect', function (e) {
                    alert('evento do botão cancelar foi disparado');
                })

                // event fired after create model button clicked on select view
                .off('showadd.fx.widgetselect').on('showadd.fx.widgetselect', showAddView)

                // event fired after back to model selection button clicked on add view
                .off('showselect.fx.widgetselect').on('showselect.fx.widgetselect', showSelectView)

                // event fired after preview button clicked on select view
                .off('itempreview.fx.widgetselect').on('itempreview.fx.widgetselect', itemPreview)

                // event fired on sort by
                .off('sortby.fx.widgetselect').on('sortby.fx.widgetselect', function (e) {
                    sortItems(e.column, e.desc);
                })

                // event fired on search
                .off('search.fx.widgetselect').on('search.fx.widgetselect', function (e) {
                    searchItems(e.search);
                });
            }

            var loaded = false,
                items = undefined,
                itemsSelected = undefined,
                itemsPerPage = 20,
                selDefault = undefined;

            //function used for lazyload - demo purpose onlye
            function loadItems(currentPage) {
                var startPage = (currentPage - 1) * itemsPerPage;
                var endPage = startPage + itemsPerPage;
                var itemsToShow = items.slice(startPage, endPage);

                $ws.itemsList(itemsToShow, items.length);
            }

            function widgetSelectShow(e) {
                var value = 'widgetselect.options=' + JSON.stringify(e.widgetselect.options, null, 2);

                getItems(function () {
                    $ws.reset();
                    $ws.selectedItemsList(itemsSelected);
                    loadItems(1);// first page
                });
            }

            // sort items
            function sortItems(column, desc) {

                items = _.sortBy(items, function (i) {
                    var propVal = i[column];
                    if (typeof propVal !== 'string') {
                        return propVal;
                    } else {
                        return propVal.toLowerCase();
                    }
                });

                if (desc) items.reverse();

                $ws.resetList();
                loadItems(1);// first page
            }

            //search items
            function searchItems(str) {
                getItems(function () {
                    if (str !== "") {
                        var result = _.filter(items,
                                    function (k) {
                                        var res = false;
                                        _.forOwn(k, function (val, key) {
                                            res = FUXI.Utils.like(val, str);
                                            if (res) return false;
                                        });
                                        return res;
                                    });
                        items = result;
                    }
                    $ws.resetList();
                    loadItems(1);
                });
            }

            //retrieves the data
            function getItems(callback) {

                $.getJSON("../doc/partials/jscomponents/wid-select/data-demo/widget-select-items.json", function (data) {

                    items = data.items;
                    itemsSelected = selDefault || data.itemsSelected;

                    if (callback) callback();

                }).fail(function () {
                    alert("erro ao carregar dados.");
                });
            }

            //Function to notify user if element was added to collection
            function notification(type, message) {
                toastr[type](message);
            }


            function validateAdd(e) {
                return ({
                    'isValid': ($("#devguide-ws-add-input-item-name", $ws.$elem).val() !== '') ? true : false, 'message': 'Verifique se preencheu corretamente todos os campos.'
                });
            }

            //function called after save button clicked on add view
            function saveNewItem(e) {

                // for demo purpose data of new item
                var item = {
                    "id": Math.floor((Math.random() * 9999999) + 1),
                    "text": $("#devguide-ws-add-input-item-name", $ws.$elem).val(),
                    "name": $("#devguide-ws-add-input-item-name", $ws.$elem).val()
                }

                // insert succeed! show selectView
                e.widgetselect.handleShowSelectView.call(e.widgetselect, function () {
                    e.widgetselect.showNotification('success', "Item criado com sucesso.");
                });

                e.widgetselect.drawItem(item, true);
            }

            //function called after create button clicked on select view
            function showAddView(e) {
                $("#devguide-ws-add-input-item-name").val('').focus();
            }

            //function called after back button clicked on select view
            function showSelectView(e) {
                $("#devguide-ws-add-input-item-name").val('');
                $(".fx-search-input input[type=text]", e.widgetselect.$widgetBody).focus();
            };

            //function that loads item preview
            function loadItemPreview(id) {
                $('.fx-widget-select-preview-title').html('Titulo - ' + id);
            };

            function itemPreview(e) {
                loadItemPreview(e.id);

                // show preview content
                $ws.showPreviewContent();
            };
        },

        wizard: function () {

            FUXI.Wizard.init({
                'isAsync': true,
                'mode': FUXI.Wizard.modeEnum.INSERT
            });

            //Wizard default
            $(document).on('goto.wizard.fuxi', '#devguide-wizard-default', function (e) {
                //
            });

            $(document).on('next.wizard.fuxi', '#devguide-wizard-default', function (e) {
                //
            });

            $(document).on('prev.wizard.fuxi', '#devguide-wizard-default', function (e) {
                //
            });

            $(document).on('complete.wizard.fuxi', '#devguide-wizard-default', function (e) {
                alert('Disparado o evento complete.');
            });


            //Wizard step summary
            $(document).on('next.wizard.fuxi', '#devguide-wizard-summary', function (e) {
                e.Wizard.setSummary(e.currentStep, auxFuncs.wizard.summary[e.currentStep]);
            });


            //Wizard dynamic
            $(document).on('next.wizard.fuxi', '#devguide-wizard-dynamic', function (e) {
                e.Wizard.setSummary(e.currentStep, auxFuncs.wizard.summaryDynamicWiz[e.currentStep]);
            });
        },

        dockbar: function () {
            FUXI.OffscreenMenu.init();
            FUXI.FixedPositions.init();

            $('div[data-menu="offscreen-menu"]').on('toggled.offscreenmenu.fuxi', function (event) {
                //do stuff
            }).on('attach.offscreenmenu.fuxi', function (event) {
                if (event.state === "reattach") {
                    $(this).css({
                        'position': 'absolute',
                        'top': '10px',
                        'bottom': '10px'
                    });
                } else {
                    $(this).css({
                        'position': 'fixed',
                    });
                }
            });
        },

        chart: function () {
            var chart = c3.generate({
                data: {
                    columns: [
                        ['data1', 30, 200, 100, 400, 150, 250, 77],
                        ['data2', 130, 100, 140, 200, 150, 50, 43]
                    ],
                    axes: {
                        sample1: 'data1',
                        sample2: 'data2'
                    },
                    type: 'bar'
                },
                bar: {
                    width: {
                        ratio: 0.5 // this makes bar width 50% of length between ticks
                    }
                },
                color: {
                    pattern: ['#6dbfd7', '#7bc57b']
                },
                axis: {
                    x: {
                        label: {
                            text: 'X Label',
                            position: 'outer-center'
                            // inner-right : default
                            // inner-center
                            // inner-left
                            // outer-right
                            // outer-center
                            // outer-left
                        }
                    },
                    y: {
                        label: {
                            text: 'Y Label',
                            position: 'outer-middle'
                            // inner-top : default
                            // inner-middle
                            // inner-bottom
                            // outer-top
                            // outer-middle
                            // outer-bottom
                        }
                    },
                    y2: {
                        show: true,
                        label: {
                            text: 'Y2 Label',
                            position: 'outer-middle'
                            // inner-top : default
                            // inner-middle
                            // inner-bottom
                            // outer-top
                            // outer-middle
                            // outer-bottom
                        }
                    }
                },
                grid: {
                    x: {
                        show: true
                    },
                    y: {
                        show: true
                    }
                }
            });
        },

        colorpicker: function () {
            $("#colorpicker").spectrum({
                color: "#f00",
                showAlpha: true,
                showPalette: true,
                palette: [
                    ['black', 'white', 'blanchedalmond'],
                    ['rgb(255, 128, 0);', 'hsv 100 70 50', 'lightyellow']
                ]
            });

            var localization = $.spectrum.localization["pt-pt"] = {
                cancelText: "cancelar",
                chooseText: "escolher",
                clearText: "limpar",
                togglePaletteMoreText: 'mais',
                togglePaletteLessText: 'menos'
            };

            $.extend($.fn.spectrum.defaults, localization);
        },

        map: function () {
            // Initialize map
            var map = L.map('map').setView([40.629608, -8.646958], 16);

            // Set a layer/map type for the map
            L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo(map);

            // Define a Icon
            var LeafIcon = L.Icon.extend({
                options: {
                    iconSize: [100, 30],
                    shadowSize: [50, 64],
                    iconAnchor: [21, 10],
                    shadowAnchor: [4, 62],
                    popupAnchor: [-7, -10]
                }
            });

            // Icon definition
            var ptIcon = new LeafIcon({
                iconUrl: 'http://evox-technologies.pt/img/alticelabs_logo.png'
            });

            // Costum marker definition
            L.marker([40.6296, -8.6469], {
                icon: ptIcon
            }).bindPopup("<strong>Altice labs</strong>\
  		                  <p>Rua Eng. José Ferreira Pinto Basto<br>\
  		                  3810-106 Aveiro</p>\
  		                  Site: <a href='http://www.alticelabs.com'>www.alticelabs.com</a><br>\
  		                  Telf: 234 123 456").addTo(map);

            // Event that controls the change of map type 
            map.on('zoomend', function (event) {
                if (map.getZoom() > 17) {
                    console.log("current zoom, ", map.getZoom());
                    L.tileLayer('http://{s}.tile.stamen.com/toner/{z}/{x}/{y}.png').addTo(map);

                    for (var i = 0; i < markers.length; i++) {
                        markers[i].setOpacity(1);
                    }
                } else {
                    console.log("current zoom, ", map.getZoom());
                    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo(map);

                    for (var i = 0; i < markers.length; i++) {
                        markers[i].setOpacity(0);
                    }

                }
            });

            // Marker is an array that will store all added markers
            var markers = [];
            var newMarkerGroup = new L.LayerGroup();
            map.on('click', function (e) {

                if (map.getZoom() > 17) {
                    markers.push(new L.marker(e.latlng, { icon: ptIcon }).addTo(map));
                }
            });

            // Remove added markers
            $('#removeMarkers').on("click", function () {
                console.log("removing");
                for (var i = 0; i < markers.length; i++) {
                    map.removeLayer(markers[i]);
                }
            });
        }
    };
}();

