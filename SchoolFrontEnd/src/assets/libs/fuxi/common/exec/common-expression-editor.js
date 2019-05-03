(function ($, window, document, undefined) {

    (function ($) {
        $.fn.eeFilterByData = function (prop, val) {
            var $self = this;
            if (typeof val === 'undefined') {
                return $self.filter(
                    function () { return typeof $(this).data(prop) !== 'undefined'; }
                );
            }
            return $self.filter(
                function () {                    
                    //return $(this).data(prop).match(new RegExp("^" + val + ".*$", "i"));                    
                    return $(this).data(prop).toLowerCase().indexOf(val.toLowerCase()) >= 0;
                }
            );
        };

    })(window.jQuery);

    var ExpressionEditor = {

        init: function (options, elem) {
            var self = this;
            self.elem = elem;
            self.$elem = $(elem);
            self.tree = null;

            self.options = $.extend(true, {}, $.fn.eEditor.options, options);

            self.$eaRule = $('.fx-ee-editable-area', self.$elem);

            self.$btnConfirm = $('.fx-ee-confirm', self.$elem);
            self.$btnCancel = $('.fx-ee-cancel', self.$elem);

            self.$feedback = $('.fx-ee-feedback', self.$elem);
            self.$feedbackMsg = $('.fx-validation-feedback-messsage', self.$elem);
            self.$feedbackIcon = $('.fx-validation-feedback-icon', self.$elem);
            self.$ruleEditor = $('.fx-ee-form-group-type-rule', self.$elem);
            self.$eeContainer = $('.fx-ee-wrapper', self.$elem);            
            self.$eeBody = $('.fx-ee-body', self.$elem);

            self.$btnCheckSintax = $('.fx-check-syntax', self.$elem);
            self.$btnClearRule = $('.fx-clear-rule', self.$elem);

            self.$btsActions = null; // setted when load actions
            self.btsActionsSelector = '.fx-ee-btn-action';
            self.$moreActionsContainer = $('.fx-ee-more-actions-wrapper', self.$elem);
            self.$btsAllActions = $('.fx-ee-toogle-all-actions', self.$elem);
            self.$allActionsWrapper = $('.fx-ee-all-actions-wrapper', self.$elem);
            self.$allActionsContainer = $('.fx-ee-all-actions', self.$elem);
            self.$commonActionsContainer = $('.fx-ee-common-actions', self.$elem);

            self.$txtSearchExpression = $('.fx-ee-search-expression-value', self.$elem);
            self.$btnSearchExpression = $('.fx-ee-search-expression', self.$elem);
            self.$txtSearchAction = $('.fx-ee-search-action-value', self.$elem);
            self.$btnSearchAction = $('.fx-ee-search-action', self.$elem);

            self.$returnType = $('.fx-ee-return-type', self.$elem);

            self.$eeOptionsContainer = $(".fx-ee-options", self.$elem);

            self.$treeContainer = $(".fx-ee-tree-container", self.$elem);

            self.nodePopInfoSelector = 'i.fx-jstree-popoverinfo';
            self.nodeDraggableSelector = 'li[data-drag] a';
            self.nodeRuleSelector = 'li[data-expression]';

            self.layout = self.$eeContainer.layout(self.options.layoutOptions);

            // load
            self.load();

            // add listeners
            self.addListeners();
        },
        addListeners: function () {
            var self = this;

            self.$btnConfirm.off('click.ee').on('click.ee', $.proxy(self.emitConfirmClick, self));
            self.$btnCancel.off('click.ee').on('click.ee', $.proxy(self.emitCancelClick, self));

            self.$btnSearchExpression.off('click.ee').on('click.ee', $.proxy(self.emitSearchExpressionClick, self));
            self.$btnSearchAction.off('click.ee').on('click.ee', $.proxy(self.emitSearchActionClick, self));

            // operators click
            self.$btsActions.off('click.ee').on('click.ee', $.proxy(self.operatorClick, null, self));
            self.$btsAllActions.off('click.ee').on('click.ee', $.proxy(self.toggleAllActions, null, self));
            //self.$elem.on('click.ee', function (e) {
            //    if (!$.contains(self.$moreActionsContainer[0], e.target) && self.$commonActionsContainer.hasClass('opened')) {
            //        self.toggleAllActions(self, e);
            //    }
            //});

            // prevent drop elements
            if (self.$eaRule[0].addEventListener) {
                self.$eaRule[0].addEventListener("drop", function (event) {
                    // prevent default action (open as link for some elements)
                    event.preventDefault();
                }, false);
            };

            self.$btnCheckSintax.off('click.ee').on('click.ee', $.proxy(self.checkSyntax, null, self));

            self.$btnClearRule.off('click.ee').on('click.ee', $.proxy(self.clearRule, self));

            self.$txtSearchAction.off('keypress.ee').on('keypress.ee', $.proxy(self.handlerSearchAction, null, self));
            self.$txtSearchExpression.off('keypress.ee').on('keypress.ee', $.proxy(self.handlerSearchExpression, null, self));
        },

        load: function () {
            var self = this;

            //hides feedback initially
            self.$feedback.hide();

            // clear searchs
            self.$txtSearchExpression.val('');
            self.$txtSearchAction.val('');

            // load actions
            self.loadActionsGroup.call(self);
            self.$btsActions = $(self.btsActionsSelector, self.$elem);

            if (self.options.hideEastPanel) {
                self.layout.hide("east");
            }
            if (self.options.hideWestPanel) {
                self.layout.hide("west");
            }

            //set focus
			//debugger;
			if (self.$elem.hasClass('modal')) {
				
				self.$eaRule.focus();
			};
            

            // resize ui layout
            self.layout.resizeAll();

            // init jstree with expressions
            self.$treeContainer.on('ready.jstree', function () {
                self.setNodePopover(self);
                self.setNodeDraggable(self);
                self.setNodeDblClick(self);
            }).jstree({
                "core": {
                    'animation': 0,
                    'check_callback': true,
                    'themes': {
                        'name': "fuxi",
                        'responsive': false,
                        'stripes': false,
                        'dots': true,
                        'icons': true
                    },
                    'data': self.options.expressionItems,
                },
                'popoverinfo': {
                    'popinfoID': 'popinfo',
                    'className': 'fx-ee-tree-more-info glyphicon glyphicon-info-sign',
                    'click': function (node, elemID) {
                        //console.log(node);
                        // node info content (popover)
                        var $elem = $("#" + elemID);
                        // remove info
                        $elem.next(".popover-node-info").remove();
                        // attach new info
                        $elem.after(self.formatInfoTemplate(node.original));
                        // toggle popover
                        $elem.popover('toggle');
                    }
                },
                "plugins": ['popoverinfo', 'search', 'fxsearchmatch'],
                "search": {
                    "case_insensitive": true,
                    "show_only_matches": false
                }
            }).bind('open_node.jstree', function (e, data) {
                self.setNodePopover(self);
                self.setNodeDraggable(self);
                self.setNodeDblClick(self);
            }).bind('hover_node.jstree', function (e, data) {
                if (data.node.original.info) {
                    $(this).trigger(FUXI.Utils.eventsName.hideElements);
                }
            });

            // emit event
            self.emitLoaded();
        },
        destroy: function () {
            var self = this;

            // remove all events setted by the component
            self.$btnConfirm.off('click.ee');
            self.$btnCancel.off('click.ee');

            self.$btnSearchExpression.off('click.ee');
            self.$btnSearchAction.off('click.ee');

            // operators click
            self.$btsActions.off('click.ee');
            self.$btsAllActions.off('click.ee');

            self.$txtSearchAction.off('keypress.ee');
            self.$txtSearchExpression.off('keypress.ee');

            // prevent drop elements
            if (self.$eaRule[0].removeEventListener) {
                self.$eaRule[0].removeEventListener("drop", function (event) {
                    // prevent default action (open as link for some elements)
                    event.preventDefault();
                }, false);
            };

            self.$btnCheckSintax.off('click.ee');
            self.$btnClearRule.off('click.ee');

            self.$treeContainer.jstree("destroy");
            $(self.nodeRuleSelector, self.$elem).off('dblclick.ee')
            $(self.nodeDraggableSelector, self.$elem).draggable().draggable('destroy');
            $(self.nodeDraggableSelector, self.$elem).droppable().droppable('destroy');

            $(self.nodePopInfoSelector, self.$elem).popover('destroy');
            $(self.nodeRuleSelector, self.$elem).off('dblclick.ee')

            // common actions
            self.$commonActionsContainer.html(self.options.languageStrings.noActins);
            // all actions
            self.$allActionsContainer.html(self.options.languageStrings.noActins);

            // clear rule
            self.clearRule();

            // remove data object
            self.$elem.removeData("ee");
        },

        setNodePopover: function (ee) {
            var self = this;
            // node popover
            $(ee.nodePopInfoSelector, self.$elem).popover({
                html: true,
                container: self.$eeBody,
                placement: 'right',
                trigger: 'manual',
                template: '<div class="popover"><div class="arrow"></div><div class="popover-content"></div></div>',
                content: function () {
                    if (this.cache) return this.cache;
                    return this.cache = $(this).next('.popover-node-info').html();
                }
            });
        },
        setNodeDblClick: function (ee) {
            var self = this;
            $(ee.nodeRuleSelector, self.$elem).off('dblclick.ee').on('dblclick.ee', $.proxy(ee.nodeDoubleClick, null, ee));
        },
        setNodeDraggable: function (ee) {
            var self = this;
            $(ee.nodeDraggableSelector, self.$elem).draggable({
                cursor: "move",
                helper: "clone",
                containment: self.$eeBody,
                appendTo: self.$eeBody,
            });
            ee.$eaRule.droppable({
                accept: $(ee.nodeDraggableSelector, self.$elem),
                drop: function (event, ui) {
                    var rule = $(ui.draggable).closest("li").attr("data-expression");
                    ee.addExpression(rule);
                }
            });
        },

        handlerSearchAction: function (ee, ev) {
            if (ev.keyCode === 13) {
                ev.preventDefault();
                ev.stopImmediatePropagation();
                ee.$btnSearchAction.trigger('click.ee');
            }
        },
        handlerSearchExpression: function (ee, ev) {
            if (ev.keyCode === 13) {
                ev.preventDefault();
                ev.stopImmediatePropagation();
                ee.$btnSearchExpression.trigger('click.ee');
            }
        },

        operatorClick: function (ee) {
            var self = this;
            var action = $(this).data("action");
            ee.addExpression(action);

            ee.emitOperatorClick(action);
        },
        toggleAllActions: function (ee, ev) {
            var self = this;

            ee.$allActionsWrapper.toggleClass('hidden');
            ee.$commonActionsContainer.toggleClass('opened');
            ee.layout.resizeAll();

            //set focus
            if (ee.$allActionsWrapper.hasClass('hidden')) {                
                ee.$eaRule.focus();
            } else {
                ee.$txtSearchAction.focus();
            }

            ev.stopPropagation();
        },
        nodeDoubleClick: function (ee) {
            var $node = $(this);
            ee.addExpression($node.attr("data-expression"));

            arguments[1].originalEvent.preventDefault();
            arguments[1].originalEvent.stopPropagation();
        },
        checkSyntax: function (ee) {
            var t = 3000;

            var errorIconCssClass = 'fx-validation-feedback-icon fuxicons fuxicons-error',
                warningIconCssClass = 'fx-validation-feedback-icon fuxicons fuxicons-warning',
                successIconCssClass = 'fx-validation-feedback-icon fuxicons fuxicons-success'

            //debugger;

            ee.$eaRule.focus();
            ee.$feedback.stop(true, true);

            // check if is empty
            if (ee.$eaRule.val() == "") {
                ee.$feedbackIcon.removeClass().addClass(warningIconCssClass);
                ee.$feedback.removeClass('alert-danger alert-success').addClass('alert-warning').fadeIn();
                ee.$feedbackMsg.html(ee.options.languageStrings.feedbackEmptyRule);
                ee.$ruleEditor.removeClass('hidden has-error has-success').addClass('has-warning');
            }
            else {
                // call validator
                var isValid = ee.checkRuleSyntax();

                if (isValid) {
                    ee.$feedbackIcon.removeClass().addClass(successIconCssClass);
                    ee.$feedback.removeClass('alert-danger alert-warning').addClass('alert-success').fadeIn();
                    ee.$feedbackMsg.html(ee.options.languageStrings.feedbackSucceed);
                    ee.$ruleEditor.removeClass('hidden has-error has-warning').addClass('has-success');
                }
                else {
                    ee.$feedbackIcon.removeClass().addClass(errorIconCssClass);
                    ee.$feedback.removeClass('alert-success alert-warning').addClass('alert-danger').fadeIn();
                    ee.$feedbackMsg.html(ee.options.languageStrings.feedbackError);
                    ee.$ruleEditor.removeClass('hidden has-success').addClass('has-error');
                    t = 5000;
                }
            }

            setTimeout(function () {
                ee.$feedback.fadeOut(t, ee.layout.resizeAll);
                ee.$ruleEditor.removeClass('has-error has-success has-warning');
            }, t);

            //this line of code is needed
            ee.layout.resizeAll();

            // emit event
            ee.emitCheckSyntax(ee.$eaRule.val());
        },
        clearRule: function () {
            var self = this;
            self.$eaRule.val('').focus();

            // emit clear rule
            self.emitClearRule();
        },
        addExpression: function (exp) {
            var self = this;

            self.insertAtCaret(exp);

            // emit event
            self.emitAddExpression(exp);
        },
        
        emitSearchExpressionClick: function () {
            var self = this;

            var search = self.$txtSearchExpression.val();
            self.$treeContainer.jstree(true).search(search);

            self.$elem.trigger({ 'type': 'searchexpressionclick.ee', 'search': search, 'ee': self });
            console.log("emitSearchExpressionClick...");
        },
        emitSearchActionClick: function () {
            var self = this;

            var search = self.$txtSearchAction.val();

            self.$allActionsContainer.find('.fx-ee-btn-action').eeFilterByData('action', search).addClass("fx-ee-action-highlight").removeClass("fx-ee-action-highlight", 5000);
                        
            self.$elem.trigger({ 'type': 'searchactionclick.ee', 'search': search, 'ee': self });
            console.log("emitSearchActionClick...");
        },

        emitConfirmClick: function () {
            var self = this;
            var rule = self.$eaRule.val();
            self.$elem.trigger({ 'type': 'confirmclick.ee', 'rule': rule, 'returntype': self.$returnType.val(), 'ee': self });
            console.log("emitConfirmClick...");
        },
        emitCancelClick: function () {
            var self = this;
            self.$elem.trigger({ 'type': 'cancelclick.ee', 'ee': self });
            console.log("emitCancelClick...");
        },
        emitOperatorClick: function (action) {
            var self = this;
            self.$elem.trigger({ 'type': 'operatorclick.ee', 'action': action, 'ee': self });
            console.log("emitOperatorClick...");
        },
        emitCheckSyntax: function (rule) {
            var self = this;
            self.$elem.trigger({ 'type': 'checksyntax.ee', 'rule': rule, 'ee': self });
            console.log("emitCheckSyntax...");
        },
        emitClearRule: function () {
            var self = this;
            self.$elem.trigger({ 'type': 'clearrule.ee', 'ee': self });
            console.log("emitClearRule...");
        },
        emitAddExpression: function (exp) {
            var self = this;
            self.$elem.trigger({ 'type': 'addexpression.ee', 'expression': exp, 'ee': self });
            console.log("emitAddExpression...");
        },
        emitLoaded: function () {
            var self = this;
            self.$elem.trigger({ 'type': 'loaded.ee', 'ee': self });
        },

        insertAtCaret: function (valueToInsertAtCaret) {
            var self = this;
            // Ignorar se for nulo ou vazio
            if (!valueToInsertAtCaret) return;
            var _this = self.$eaRule[0];
            _this.focus();
            if (document.selection) {
                selection = document.selection.createRange();
                selection.text = valueToInsertAtCaret;
                _this.focus();
            } else if (_this.selectionStart || _this.selectionStart == "0") {
                var startPosition = _this.selectionStart;
                var endPosition = _this.selectionEnd;
                var scrollTop = _this.scrollTop;
                _this.value = _this.value.substring(0, startPosition) + valueToInsertAtCaret + _this.value.substring(endPosition, _this.value.length);

                _this.selectionStart = startPosition + valueToInsertAtCaret.length;
                _this.selectionEnd = startPosition + valueToInsertAtCaret.length;
                _this.scrollTop = scrollTop;
            } else {
                _this.value += valueToInsertAtCaret;
                _this.focus();
            }

            // Forçar o evento change no input
            self.$eaRule.trigger("change");
        },
        formatInfoTemplate: function (data) {
            var html = "<div class='popover-node-info hide'>" + FUXI.Resources.Common.EmptyInfo + "</div>";
            if (data && data.info) {
                var info = data.info;
                html = "<div class='popover-node-info hide'>" + info + "</div>";
            }
            return html;
        },
        loadActionsGroup: function () {
            var self = this;

            var rulesGroup = {};
            var HTML = []; //object that contains generated html
            var HTMLAll = [] //object that contains all generated html

            var tlGroup = self.options.templateGroup; //template group
            var tlItem = self.options.templateGroupItem; //template bts inside each group
            var tlAllActions = self.options.templateAllActions; //template all actions

            var auxG,
                auxGAll,
                auxBt,
                auxBtAll = "";
            $.each(self.options.operatorItems, function (idx, group) {
                if (!rulesGroup[group.name]) {
                    rulesGroup[group.name] = [];
                }
                auxG = tlGroup.replace(new RegExp("{{NAME}}", "ig"), group.name)
                              .replace(new RegExp("{{CSSNAME}}", "ig"), group.cssname);

                auxGAll = tlAllActions.replace(new RegExp("{{NAME}}", "ig"), group.name)
                              .replace(new RegExp("{{CSSNAME}}", "ig"), group.cssname);

                auxBt = "";
                auxBtAll = "";
                $.each(group.items, function (idx, item) {
                    rulesGroup[group.name].push(item.action);

                    if (idx < group.maxitems) {
                        auxBt += tlItem.replace(new RegExp("{{ACTION}}", "ig"), item.action)
                                      .replace(new RegExp("{{TEXT}}", "ig"), item.text)
                                      .replace(new RegExp("{{WEIGHT}}", "ig"), item.weight);
                    }
                    auxBtAll += tlItem.replace(new RegExp("{{ACTION}}", "ig"), item.action)
                                      .replace(new RegExp("{{TEXT}}", "ig"), item.text)
                                      .replace(new RegExp("{{WEIGHT}}", "ig"), item.weight);

                });
                auxG = auxG.replace(new RegExp("{{ITEMS}}", "ig"), auxBt);
                var $aux = $('<div />').html(auxG);
                HTML.push($aux.html());

                // all
                auxGAll = auxGAll.replace(new RegExp("{{ITEMS}}", "ig"), auxBtAll);
                $aux = $('<div />').html(auxGAll);
                HTMLAll.push($aux.html());
            });

            // common actions
            self.$commonActionsContainer.html((HTML.length > 0) ? HTML.join('') : self.options.languageStrings.noActins);

            // all actions
            self.$allActionsContainer.html((HTMLAll.length > 0) ? HTMLAll.join('') : self.options.languageStrings.noActins);
        },
        getCheckRuleSyntaxClientValidator: function () {
            var self = this;
            return self.options.clientCheckRuleSyntaxValidator;
        },
        checkRuleSyntax: function () {
            var self = this;
            var result = true;
            try {
                var clValidator = self.getCheckRuleSyntaxClientValidator();
                if (typeof clValidator === 'string') {
                    if (clValidator) {
                        result = FUXI.Utils.executeFunctionByName(clValidator, window, self.$eaRule.val());
                    }
                }
                else if (typeof clValidator === 'function') {
                    result = clValidator(self.$eaRule.val());
                }
            }
            catch (e) {
                console.log(e);
                //throw e;
            }

            return result;
        }
    };

    $.fn.eEditor = function (options) {
        return this.each(function () {
            var ee = Object.create(ExpressionEditor);
            ee.init(options, this);

            $.data(this, 'ee', ee);
        }).data('ee');
    };
    $.fn.eEditor.options = {
        layoutOptions: {
            defaults: {
                resizable: true,
                livePaneResizing: true,
                resizerTip: "Resize",
                spacing_closed: 10,
                spacing_open: 10
            },
            west: {
                size:250,
                contentSelector: '.fx-ee-options'
            },
            center: {
                size: 450,
                minSize: 100,
                maxSize: 450,
                contentSelector: '.fx-ee-constructors'
            },
            east: {
                size: 100,
                contentSelector: '.fx-ee-options'
            }

        },

        hideWestPanel: false,
        hideEastPanel: true,

        clientCheckRuleSyntaxValidator: undefined,
        expressionItems: [],
        operatorItems: [],
        templateGroup: '<div class="fx-ee-actions-group {{CSSNAME}}" data-name="{{NAME}}">'+
            '{{ITEMS}}'+
        '</div>',
        templateGroupItem: '<button type="button" class="btn btn-default btn-xs fx-ee-btn-action" data-action="{{ACTION}}">'+
            '{{TEXT}}'+
        '</button>',
        templateAllActions: '<div class="col-sm-6 fx-ee-all-actions-block {{CSSNAME}}" data-name="{{NAME}}">'+
            '<p class="fx-ee-all-actions-block-title">{{NAME}}</p>' +
            '<div>'+
                '{{ITEMS}}'+
            '</div>'+
        '</div>',
        
        languageStrings: {
            feedbackSucceed: "A regra definida não apresenta nenhum problema.",
            feedbackError: "A regra definida não está corretamente formatada.",
            feedbackEmptyRule: "Não foi definida nenhuma regra. Por favor escreva a regra pretendida.",
            noActins: "<p>Não foi definido nenhum operador.</p>"
        }

    };

})(jQuery, window, document);