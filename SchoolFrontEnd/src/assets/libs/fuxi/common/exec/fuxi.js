/*! fuxi - v1.21.0 - 2016-11-28 */// Single global object, acting as a namespace. All components should be added to this namespace and explicitly called, when needed.
var FUXI = {};

FUXI.Utils = {};

FUXI.Utils.SetDTPagination = function (e, s) {
    var nItems = s._iRecordsDisplay || s.aoData.length;

    if (nItems <= s._iDisplayLength) {
        $(s.nTableWrapper).find('.dataTable-pagination-wrapper, .dataTables_length').hide();
    }
};

FUXI.Utils.DTSortOnHeaderLabel = function (e, s) {

    var $t = $(e.target);
    var oTable = $t.DataTable();

    for (var i = 0; i < oTable.fnSettings().aoColumns.length; i++) {
        var $th = $("th:eq('" + i + "')", $t);
        // check for buttons container .fx-th-btns
        var grpBtns = $th.find(".fx-th-btns");
        if (grpBtns.length === 0) continue;

        //remove sort click over the th
        $th.off('click.DT');
        $th.css('cursor', 'default');

        // check for label .fx-th-label
        var $label = $th.find(".fx-th-label");
        if ($label.length === 0) continue;

        // set sort listener to element label
        $label.css('cursor', 'pointer');
        oTable.fnSortListener($label, i);
    }
}

FUXI.Utils.eventsName = {};
FUXI.Utils.eventsName.fuxiUtils = "click.fuxi.utils";
FUXI.Utils.eventsName.hideElements = "click.fuxi.hideelements";
FUXI.Utils.eventsName.toggleElements = "click.fuxi.toggleelements";

FUXI.Utils.eventsName.hideElementsOnBack = "fuxi.hideelementsOnBack"

FUXI.Utils.init = function () {
    // init bootstrap tooltip
    $("[data-toggle='tooltip']").tooltip();

    // init bootstrap popover
    $("[data-toggle=popover]").popover();

    // dropdown open to left
    $('.btn-group.fx-pos-static > .fx-dropdown-toggle').off(FUXI.Utils.eventsName.fuxiUtils).on(FUXI.Utils.eventsName.fuxiUtils, function () {
        var $triggerBtn = $(this),
            $dropdown = $triggerBtn.next('.fx-dropdown'),
            triggerBtnPos = $triggerBtn.position(),
            isRightToLeft = $dropdown.hasClass('fx-dropdown-open-to-left');

        $dropdown.css({
            top: triggerBtnPos.top + $triggerBtn.outerHeight(),
            left: (isRightToLeft ? triggerBtnPos.left - ($dropdown.outerWidth() - $triggerBtn.outerWidth()) : triggerBtnPos.left)
        });
    });
};

FUXI.Utils.onReady = function () {
    // initialize all polyfills
    FUXI.Utils.Polyfills.init();
    
    var $lastPopover = null;
    var $lastFxDropdown = null;
    var $lastDropdown = null;
    var $lastDatetimePicker = null;

    // initialize hideelements
    $(document).off(FUXI.Utils.eventsName.hideElements).on(FUXI.Utils.eventsName.hideElements, function (e) {
        console.log('document on ' + FUXI.Utils.eventsName.hideElements);

        if ($lastDropdown != null) {
            $lastDropdown.removeClass("open");
        }

        if ($lastFxDropdown != null) {
            var $this = $lastFxDropdown;
            if (!$this.is(e.target) && $this.has(e.target).length === 0 && $('.fx-dropdown').has(e.target).length === 0) {
                var toHide = $this.next(e);
                if ($(toHide).hasClass('is-open')) {
                    $(toHide).removeClass('is-open').hide();
                }
            }
        }

        if ($lastPopover != null) {
            if (!$lastPopover.is(e.target) && $lastPopover.has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
                $lastPopover.popover("hide");
                $('.popover').remove();
                $lastPopover = null;
            }
        }
    });

    
    $(document).on(FUXI.Utils.eventsName.hideElementsOnBack, function (e) {
        console.log('document on ' + FUXI.Utils.eventsName.hideElementsOnBack);

        //fecha select2 que estejam abertos
        var $openSelect2 = $('.select2-drop:visible');
        // close last opened!
        if ($openSelect2 != null && $openSelect2 !== undefined) {
            $openSelect2.each(function () { $(this).select2('close'); });
        }

        //fecha DateTimePicker que estejam abertos
        /*var $openDateTimePickers = $('.datepicker:visible');
        if ($openDateTimePickers != null && $openDateTimePickers !== undefined) {
            $openDateTimePickers.each(function () { $(this).parent().hide(); });
        }*/
        $(document).trigger('dp.show');


        //Procura selectboxtree abertas no documento e executa o metodo de close do componente
        var $selectboxtree = $(".fx-ms-wrapper.fx-ms-wrapper-opened");
        if ($selectboxtree != null && $selectboxtree !== undefined) {
            $selectboxtree.each(function () {
                var $dt = $(this).data('ms');
                if ($dt != null && $dt !== undefined) {
                    $dt.closeDropdown();
                } else {
                    //para componentes em angular
                    angular.element($selectboxtree).scope().selectBoxTreeCtrl.hideDropdown();
                    angular.element($selectboxtree).scope().$apply();
                }
            });
        }

        //fecha dropdown que estejam abertos
        var isAttachToBody = $(e.target).attr('fx-dropdown-attachToBody');
        if (typeof isAttachToBody !== typeof undefined && isAttachToBody !== false) {
            $(e.target).append(dropdownMenu.detach());
            dropdownMenu.hide();
        }

        //Envia um evento de click para fazer dispose de modal que estejam abertas
        /*$("[data-dismiss=modal]").each(function(){
            $(this).trigger({ type: "click" });
        });*/

        //e necessario remover a classe modal-open e a div .modal-backdrop porque o hide n�o o faz correctamente
        $('.modal.fade.in').modal('hide');
        $('body').removeClass('modal-open');
        $('.modal-backdrop').remove();
    });



    /*
    * M�todo que detecta que houve navega��o na p�gina
    * Precisa de ser melhorado para detectar apenas o back do browser.
    * Esta detec��o foi passada para o lado dos clientes. Neste ficheiro apenas se trata o evento: fuxi.hideelementsOnBack
    */
    /*window.onload = function () {
        if (typeof history.pushState === "function") {
            //history.pushState("jibberish", null, null);
            window.onpopstate = function () {
                //history.pushState('newjibberish', null, null);
                $(document).trigger('fuxi.hideelementsOnBack');
                // Handle the back (or forward) buttons here
                // Will NOT handle refresh, use onbeforeunload for this.
            };
        }
        else {
            var ignoreHashChange = true;
            window.onhashchange = function () {
                if (!ignoreHashChange) {
                    ignoreHashChange = true;
                    window.location.hash = Math.random();
                    // Detect and redirect change here
                    // Works in older FF and IE9
                    // * it does mess with your hash symbol (anchor?) pound sign
                    // delimiter on the end of the URL
                }
                else {
                    ignoreHashChange = false;
                }
            };
        }
    }*/




    $(document).on('show.bs.popover', function (e) {
        console.log('document on show.bs.popover');
        var $target = $(e.target);

        $(this).trigger(FUXI.Utils.eventsName.hideElements);

        $lastPopover = $target;
    }).on('show.bs.dropdown', function (e) {
        console.log('document on show.bs.dropdown');

        $(this).trigger(FUXI.Utils.eventsName.hideElements);

        $lastDropdown = $(e.target);

        var isAttachToBody = $lastDropdown.attr('fx-dropdown-attachToBody');
        if (typeof isAttachToBody !== typeof undefined && isAttachToBody !== false) {
            // grab the menu        
            dropdownMenu = $lastDropdown.find('.dropdown-menu');

            // detach it and append it to the body
            $('body').append(dropdownMenu.detach());

            // grab the new offset position
            var eOffset = $lastDropdown.offset();

            // make sure to place it where it would normally go
            dropdownMenu.css({
                'display': 'block',
                'top': eOffset.top + $lastDropdown.outerHeight(),
                'left': eOffset.left
            });
        }
    }).on('hide.bs.dropdown', function (e) {
        var isAttachToBody = $(e.target).attr('fx-dropdown-attachToBody');
        if (typeof isAttachToBody !== typeof undefined && isAttachToBody !== false) {
            $(e.target).append(dropdownMenu.detach());
            dropdownMenu.hide();
        }
    }).off(FUXI.Utils.eventsName.toggleElements).on(FUXI.Utils.eventsName.toggleElements, '.fx-dropdown-toggle', function (e) {
        console.log(FUXI.Utils.eventsName.toggleElements);

        $(this).trigger(FUXI.Utils.eventsName.hideElements);

        $(this).next('.fx-dropdown').toggleClass('is-open').toggle();

        $lastFxDropdown = $(this);
    }).off('dp.show').on('dp.show', function (e) {
        console.log('document on dp.show');

        var $target = $(e.target);
        // close last opened!
        if ($lastDatetimePicker != null && !$lastDatetimePicker.is($target)) {
            if ($lastDatetimePicker.data("DateTimePicker")) {
                $lastDatetimePicker.data("DateTimePicker").hide();    
            }
        }

        var len = $target.closest(".fx-dropdown, .popover").length;
        // do not hide elements if the parent element has class fx-dropdown or popover
        // the datetimepicker may be within the elements fx-dropdown or popover
        if (len === 0)
        {
            $(this).trigger(FUXI.Utils.eventsName.hideElements);
        }
        $lastDatetimePicker = $target;

    }).on('shown.bs.tab', function (e) {
        console.log('document on shown.bs.tab');
        var checkTarget = $(e.target).data('target'),
            tabTargetSelector = checkTarget === undefined ? $(e.target)[0].getAttribute('href') : checkTarget;
 
        if ($(tabTargetSelector).has('[data-fix-to="top"]').length > 0) {
            if (FUXI.FixedPositions.reload) {
                FUXI.FixedPositions.reload($('[data-fix-to="top"]', tabTargetSelector));
            }
        }

    });

    // close modal panel on outside click
    $(".fx-modal-panel").on('click', function(e) {
        var $this = $(this),
            strClass = e.target.className;

        if (strClass.search) {
            if (strClass.search('modal-dialog') != -1) {
                $this.modal('hide');
            }
        }
    });

    // disable click on links inside li elements with class "disabled"
    // mainly for use in tabs
    $("li.disabled>a").on("click", false);

}

// UTILITY
if (typeof Object.create !== 'function') {
    Object.create = function (obj) {
        function F() { };
        F.prototype = obj;
        return new F();
    };
}
// execute function by name
/* examples:
 function soma (a,b){
    return a + b;
 }
 var result = FUXI.Utils.executeFunctionByName("soma", window, 10,10);
 ***
 function soma (p){
    return p.a + p.b;
 }
 var result = FUXI.Utils.executeFunctionByName("soma", window, {"a":12, "b":10});
 ***
 var ns = {
    soma: function (a, b) {
        return a + b;
    },
    calcula: function () {
        var result = FUXI.Utils.executeFunctionByName("soma", this, 10, 10);
        alert(result);
    }
 }
 ns.calcula();
*/
FUXI.Utils.executeFunctionByName = function (functionName, context /*, args */) {
    var args = Array.prototype.slice.call(arguments, 2);
    var namespaces = functionName.split(".");
    var func = namespaces.pop();
    for (var i = 0; i < namespaces.length; i++) {
        context = context[namespaces[i]];
    }
    return context[func].apply(context, args);
}

// like comparisson
/*
 * example
 * var res = FUXI.Utils.like("este � o item 10 do grupo!", "%item 10%");
 * console.log(res);
 */
FUXI.Utils.like = function (str, search) {
    if (typeof search !== 'string' || str === null) { return false; }
    // Remove special chars
    search = search.replace(new RegExp("([\\.\\\\\\+\\*\\?\\[\\^\\]\\$\\(\\)\\{\\}\\=\\!\\<\\>\\|\\:\\-])", "g"), "\\$1");
    // Replace % and _ with equivalent regex
    search = search.replace(/%/g, '.*').replace(/_/g, '.');
    // Check matches
    return RegExp('^' + search + '$', 'gi').test(str);
}

// format
/*
 * example
 * FUXI.Utils.format("Hoje � dia {0} do m�s de {1}", 24, "Julho"); 
 */
FUXI.Utils.format = function (fmtstr) {
    var args = Array.prototype.slice.call(arguments, 1);
    return fmtstr.replace(/\{(\d+)\}/g, function (match, index) {
        return args[index];
    });
}

// install key up change event
/*
 * example
 * FUXI.Utils.installKeyUpChangeEvent($("#myID"), 'my.namespace');
 * $("#myID").on('keyup-change.my.namespace', function(){ console.log(arguments); });
 */
FUXI.Utils.installKeyUpChangeEvent = function(element, ns) {
    var key = "keyup-change-value";
    var evtName = (typeof (ns) != 'undefined') ? "keyup-change." + ns : "keyup-change";

    element.on("keydown", function () {
        if ($.data(element, key) === undefined) {
            $.data(element, key, element.val());
        }
    });
    element.on("keyup", function () {
        var val = $.data(element, key);
        if (val !== undefined && element.val() !== val) {
            $.removeData(element, key);            
            element.trigger(evtName);
        }
    });
};

FUXI.Utils.hasVerticalScroll = function (el) {
    return FUXI.Utils.hasScroll(el, "y")
};
FUXI.Utils.hasHorizontalScroll = function (el) {
    return FUXI.Utils.hasScroll(el, "y")
};

FUXI.Utils.hasScroll = function (el, match) {
    //http://codereview.stackexchange.com/questions/13338/hasscroll-function-checking-if-a-scrollbar-is-visible-in-an-element

    var $el = $(el),
        sX = $el.css('overflow-x'),
        sY = $el.css('overflow-y'),
        hidden = 'hidden',
        visible = 'visible',
        scroll = 'scroll',
        axis = match[3]; // regex for filter -> 3 == args to selector

    if (!axis) {
        if (sX === sY && (sY === hidden || sY === visible)) {
            return false;
        }
        if (sX === scroll || sY === scroll) { return true; }
    } else if (axis === 'x') {
        if (sX === hidden || sX === visible) { return false; }
        if (sX === scroll) { return true; }
    } else if (axis === 'y') {
        if (sY === hidden || sY === visible) { return false; }
        if (sY === scroll) { return true };
    }

    //Compare client and scroll dimensions to see if a scrollbar is needed
    return $el.innerHeight() < el.scrollHeight
        || $el.innerWidth() < el.scrollWidth;
}

FUXI.Utils.measureScrollbar = function () { // thx walsh    
    var $body = $(document.body);
    var scrollDiv = document.createElement('div');
    scrollDiv.className = 'fx-scrollbar-measure';
    $body.append(scrollDiv);
    var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
    $body[0].removeChild(scrollDiv);
    return scrollbarWidth;
}
FUXI.Utils.Polyfills = {};

FUXI.Utils.Polyfills.init = function () {

    // Production steps of ECMA-262, Edition 5, 15.4.4.14
    // Reference: http://es5.github.io/#x15.4.4.14
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function (searchElement, fromIndex) {

            var k;

            // 1. Let O be the result of calling ToObject passing
            //    the this value as the argument.
            if (this == null) {
                throw new TypeError('"this" is null or not defined');
            }

            var O = Object(this);

            // 2. Let lenValue be the result of calling the Get
            //    internal method of O with the argument "length".
            // 3. Let len be ToUint32(lenValue).
            var len = O.length >>> 0;

            // 4. If len is 0, return -1.
            if (len === 0) {
                return -1;
            }

            // 5. If argument fromIndex was passed let n be
            //    ToInteger(fromIndex); else let n be 0.
            var n = +fromIndex || 0;

            if (Math.abs(n) === Infinity) {
                n = 0;
            }

            // 6. If n >= len, return -1.
            if (n >= len) {
                return -1;
            }

            // 7. If n >= 0, then Let k be n.
            // 8. Else, n<0, Let k be len - abs(n).
            //    If k is less than 0, then let k be 0.
            k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

            // 9. Repeat, while k < len
            while (k < len) {
                var kValue;
                // a. Let Pk be ToString(k).
                //   This is implicit for LHS operands of the in operator
                // b. Let kPresent be the result of calling the
                //    HasProperty internal method of O with argument Pk.
                //   This step can be combined with c
                // c. If kPresent is true, then
                //    i.  Let elementK be the result of calling the Get
                //        internal method of O with the argument ToString(k).
                //   ii.  Let same be the result of applying the
                //        Strict Equality Comparison Algorithm to
                //        searchElement and elementK.
                //  iii.  If same is true, return k.
                if (k in O && O[k] === searchElement) {
                    return k;
                }
                k++;
            }
            return -1;
        };
    }

    // placeholder
    if (!Modernizr.input.placeholder) {
        $('[placeholder]').focus(function () {
            var input = $(this);
            if (input.val() == input.attr('placeholder')) {
                input.val('');
                input.removeClass('placeholder');
            }
        }).blur(function () {
            var input = $(this);
            if (input.val() == '' || input.val() == input.attr('placeholder')) {
                input.addClass('placeholder');
                input.val(input.attr('placeholder'));
            }
        }).blur();
        $('[placeholder]').parents('form').submit(function () {
            $(this).find('[placeholder]').each(function () {
                var input = $(this);
                if (input.val() == input.attr('placeholder')) {
                    input.val('');
                }
            })
        });
    }

    // From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
    if (!Object.keys) {
        Object.keys = (function () {
            'use strict';
            var hasOwnProperty = Object.prototype.hasOwnProperty,
                hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
                dontEnums = [
                  'toString',
                  'toLocaleString',
                  'valueOf',
                  'hasOwnProperty',
                  'isPrototypeOf',
                  'propertyIsEnumerable',
                  'constructor'
                ],
                dontEnumsLength = dontEnums.length;

            return function (obj) {
                if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
                    throw new TypeError('Object.keys called on non-object');
                }

                var result = [], prop, i;

                for (prop in obj) {
                    if (hasOwnProperty.call(obj, prop)) {
                        result.push(prop);
                    }
                }

                if (hasDontEnumBug) {
                    for (i = 0; i < dontEnumsLength; i++) {
                        if (hasOwnProperty.call(obj, dontEnums[i])) {
                            result.push(dontEnums[i]);
                        }
                    }
                }
                return result;
            };
        }());
    }
    
}

// Adds the Header to the global FUXI namespace.
FUXI.Header = {};

FUXI.Header.init = function () {
	'use strict';

	var $header					= $('#fx-header'),
		$menus					= $('.fx-menu'),
		$menuTriggers			= $('[data-toggle=collapse]'),
		$systemPopoverTrigger	= $('#fx-system-trigger'),
		hideVisibleMenus		= function () {
		    $menus.filter('.in').collapse('hide').parent().find('a[data-toggle]').addClass('collapsed');
		};

	$(document).on('click', function (e) {
	    if (!$header.find('nav').find(e.target).length) {
		    hideVisibleMenus();
		}
	});

	$menuTriggers.on('click', function () {
		if ($menus.filter('.collapsing').length) {
		    return false;
		}
	});

	$menus.on('show.bs.collapse', function () {
		hideVisibleMenus();
	});

	$systemPopoverTrigger.popover({
		html: true,
		content: $('#fx-system-popover').html()
	});

	$systemPopoverTrigger.on('show.bs.popover', function () {
	    hideVisibleMenus();
	});
};
// Adds the Footer to the global FUXI namespace.
FUXI.Footer = {};

FUXI.Footer.init = function () {
	'use strict';
	
	var $footer        = $('.fx-main-footer'),
		$about         = $('.fx-about'),
		$version       = $('.fx-version').html(''),
		currentVersion = "VERSÃO TRIAL";
	
	// read FXResource
	if (typeof FUXI.Resources !== "undefined") {
		currentVersion = FUXI.Resources.Version;		 
	}
	
	// existe version	
	if ($version.length === 1) { 
		$version.append(currentVersion);	
	}	
	else { // não existe version, mas pode já existir about com modal sobre
		if ($about.length === 1) {
			$about.prepend('<span class="fx-version">'+currentVersion+'</span>');
		}
		// não existe nada
		else {
			$footer.append('<div class="fx-about"><span class="fx-version">'+currentVersion+'</span></div>');
		}
	}
};
// Adds the Splitter to the global FUXI namespace.
FUXI.Splitter = {};

FUXI.Splitter.init = function (isAsync) {
    'use strict';

    // default PT tooltip
    var minimizeSidebar = 'minimizar\nsidebar';
    var maximizeSidebar = 'maximizar\nsidebar';

    var SplitterView = function (splitterEl, parentEl, sidebarEl, contentEl, position, collapsed, offset) {
        var self = this;

        this.$splitterEl = $(splitterEl);
        this.$parentEl = $(parentEl);
        this.$sidebarEl = $(sidebarEl);
        this.$contentEl = $(contentEl);
        this.position = position || 'left';
        this.collapsed = collapsed || false;
        this.offset = +offset || 40;
        this.delta = undefined;
        this.basePos = 0;
        this.CSSDefsExpanded = {};
        this.CSSDefsCollapsed = {};
        this.CSSDefsHidden = {};
        this.aux = 8;

        // initialize resize options
        InitResizeOptions(this);
        
        // read FUXI.Resources to use internationalized title in splitter sidebar
        if (typeof FUXI.Resources !== "undefined") {
            minimizeSidebar = FUXI.Resources.Splitter.MinimizeSidebar;
            maximizeSidebar = FUXI.Resources.Splitter.MaximizeSidebar;
        };

        this.$splitterEl.attr('data-original-title', (this.collapsed ? maximizeSidebar : minimizeSidebar));

        // init css defs
        InitCSSDefs(self);

        switch (this.position) {
            case 'top':
                // TODO
                break;
            case 'left':
                this.$contentEl.css('left', (this.collapsed ? this.basePos : this.basePos + this.delta + this.aux));
                this.$splitterEl.tooltip({ 'placement': 'right' });

                if (this.isResizable) {
                    this.resizableHandles = "e";
                    this.resizableResize = function (ev, ui) {
                        self.$contentEl.css('left', ui.size.width + self.aux + self.basePos);

                        self.$splitterEl.removeClass('fx-sidebar-resizer-limit');
                        if (ui.size.width === self.resizeMaxWidth || ui.size.width === self.resizeMinWidth) {
                            self.$splitterEl.addClass('fx-sidebar-resizer-limit');
                        };

                        self.emitResized.call(self);
                    };
                }
                break;
            case 'bottom':
                this.$parentEl.css('overflow', 'hidden');
                this.$contentEl.css({ 'top': this.contentBasePos, 'bottom': this.delta + this.aux });
                this.$splitterEl.tooltip({ 'placement': 'top' });

                if (this.isResizable) {
                    this.resizableHandles = "n";
                    this.resizableResize = function (ev, ui) {
                        $(this).css("top", "auto");

                        self.$splitterEl.removeClass('fx-sidebar-resizer-limit');
                        if (ui.size.height === self.resizeMaxHeight || ui.size.height === self.resizeMinHeight) {
                            self.$splitterEl.addClass('fx-sidebar-resizer-limit');
                        }

                        self.emitResized.call(self);
                    };
                }
                break;
            case 'right':
                this.$contentEl.css('right', (this.collapsed ? this.basePos : this.basePos + this.delta + this.aux));
                this.$splitterEl.tooltip({ 'placement': 'left' });

                if (this.isResizable) {
                    this.resizableHandles = "w";
                    this.resizableResize = function (ev, ui) {
                        $(this).css("left", "auto");
                        self.$contentEl.css('right', ui.size.width + self.aux + self.basePos);

                        self.$splitterEl.removeClass('fx-sidebar-resizer-limit');
                        if (ui.size.width === self.resizeMaxWidth || ui.size.width === self.resizeMinWidth) {
                            self.$splitterEl.addClass('fx-sidebar-resizer-limit');
                        }

                        self.emitResized.call(self);
                    };
                }
                break;
        }

        if (this.isResizable) {            
            this.$sidebarEl.resizable({
                handles: this.resizableHandles,
                resize: this.resizableResize,
                maxWidth: this.resizeMaxWidth,
                minWidth: this.resizeMinWidth,
                maxHeight: this.resizeMaxHeight,
                minHeight: this.resizeMinHeight,
                stop: this.resizableStop,
                start: this.resizableStart,
                create: this.resizableCreate,
            });

            this.$sidebarEl.find(".ui-resizable-handle").on('mouseover', function () {
                self.$splitterEl.addClass('fx-sidebar-over');
            }).on('mouseout', function () {
                self.$splitterEl.removeClass('fx-sidebar-over');
            })

        }

        // Auto-collapse, if defined
        if (this.collapsed) {
            this.collapse();
        }

        // Add event listeners
        this.$splitterEl.off('click.fuxi.splitter').on('click.fuxi.splitter', $.proxy(this.toggle, this));

    };
    SplitterView.prototype.toggle = function () {
        if (this.collapsed) {
            this.expand();
        } else {
            this.collapse();
        }
    };
    SplitterView.prototype.expand = function () {
        this.$sidebarEl.animate(this.CSSDefsExpanded.sidebarEl, 180);
        this.$contentEl.animate(this.CSSDefsExpanded.contentEl, 180, $.proxy(this.emitToggled, this));

        this.$splitterEl.tooltip('hide');
        this.$splitterEl.attr('data-original-title', minimizeSidebar);

        this.$sidebarEl.removeClass('fx-splitter-collapsed');
        this.collapsed = false;

        if (this.isResizable) {
            this.$sidebarEl.resizable("enable");
        }
    };
    SplitterView.prototype.collapse = function () {
        this.$sidebarEl.animate(this.CSSDefsCollapsed.sidebarEl, 180);
        this.$contentEl.animate(this.CSSDefsCollapsed.contentEl, 180, $.proxy(this.emitToggled, this));

        this.$splitterEl.tooltip('hide');
        this.$splitterEl.attr('data-original-title', maximizeSidebar);

        this.$sidebarEl.addClass('fx-splitter-collapsed');
        this.collapsed = true;
        if (this.isResizable) {
            this.$sidebarEl.resizable("disable");
        }
    };
    SplitterView.prototype.hide = function () {

        this.$sidebarEl.animate(this.CSSDefsHidden.sidebarEl, 180).hide();
        this.$contentEl.animate(this.CSSDefsHidden.contentEl, 180);

    };
    SplitterView.prototype.show = function () {

        this.$sidebarEl.show().animate(this.CSSDefsExpanded.sidebarEl, 180);
        this.$contentEl.animate(this.CSSDefsExpanded.contentEl, 180);

        this.$splitterEl.tooltip('hide');
        this.$splitterEl.attr('data-original-title', minimizeSidebar);

        this.$sidebarEl.removeClass('fx-splitter-collapsed');
        this.collapsed = false;
    };
    SplitterView.prototype.emitToggled = function () {
        this.$splitterEl.trigger({
            'type': 'toggled.splitter.fuxi',
            'state': (this.collapsed ? 'collapsed' : 'expanded')
        });
    };
    SplitterView.prototype.emitResized = function () {
        this.$splitterEl.trigger({
            'type': 'resized.splitter.fuxi'
        });
    };

    function InitResizeOptions(splitter) {
        splitter.isResizable = !!$.fn.resizable;

        //console.log("oW: ", splitter.$sidebarEl.outerWidth());
        //console.log("oH: ", splitter.$sidebarEl.outerHeight());

        if (splitter.position === 'left' || splitter.position === 'right') {
            splitter.resizeMaxWidth = splitter.$splitterEl.data('splitter-resize-max-width') || splitter.$sidebarEl.outerWidth() || '250';
            splitter.resizeMinWidth = splitter.$splitterEl.data('splitter-resize-min-width') || splitter.$sidebarEl.outerWidth() || '250';
        } else if (splitter.position === 'top' || splitter.position === 'bottom') {
            splitter.resizeMaxHeight = splitter.$splitterEl.data('splitter-resize-max-height') || splitter.$sidebarEl.outerHeight() || '250';
            splitter.resizeMinHeight = splitter.$splitterEl.data('splitter-resize-min-height') || splitter.$sidebarEl.outerHeight() || '250';
        }
                
        splitter.resizableHandles = "";
        splitter.resizableResize = null;

        splitter.resizableStart = function (ev, ui) {
            splitter.$splitterEl.addClass('fx-sidebar-resizing');
        };
        splitter.resizableStop = function (ev, ui) {
            InitCSSDefs(splitter);
            splitter.$splitterEl.removeClass('fx-sidebar-resizer-limit fx-sidebar-resizing');
        };
        splitter.resizableCreate = function (ev, ui) {
            $(this).parent().on('resize', function (e) {
                e.stopPropagation();
            });
        };        
    }

    function InitCSSDefs(splitter) {
        switch (splitter.position) {
            case 'top':
                // TODO
                break;
            case 'left':
                splitter.delta = splitter.$sidebarEl.outerWidth();
                splitter.basePos = (splitter.$sidebarEl.css('left') === 'auto' ? 0 : parseInt(splitter.$sidebarEl.css('left'), 10));

                splitter.CSSDefsExpanded.sidebarEl = { 'left': splitter.basePos };
                splitter.CSSDefsExpanded.contentEl = { 'left': splitter.basePos + splitter.delta + splitter.aux };
                splitter.CSSDefsCollapsed.sidebarEl = { 'left': splitter.basePos + splitter.offset - splitter.delta };
                splitter.CSSDefsCollapsed.contentEl = { 'left': splitter.basePos + splitter.offset + splitter.aux };

                splitter.CSSDefsHidden.sidebarEl = { 'left': splitter.basePos };
                splitter.CSSDefsHidden.contentEl = { 'left': splitter.basePos };

                break;
            case 'bottom':
                splitter.delta = splitter.$sidebarEl.outerHeight();
                splitter.contentBasePos = (splitter.$contentEl.css('top') === 'auto' ? 0 : parseInt(splitter.$contentEl.css('top'), 10));

                splitter.CSSDefsExpanded.sidebarEl = { 'bottom': 0 };
                splitter.CSSDefsExpanded.contentEl = { 'top': splitter.contentBasePos, 'bottom': splitter.delta + splitter.aux };
                splitter.CSSDefsCollapsed.sidebarEl = { 'bottom': splitter.offset - splitter.delta };
                splitter.CSSDefsCollapsed.contentEl = { 'top': splitter.contentBasePos, 'bottom': splitter.offset + splitter.aux };

                splitter.CSSDefsHidden.sidebarEl = { 'bottom': 0 };
                splitter.CSSDefsHidden.contentEl = { 'bottom': 0 };

                break;
            case 'right':
                splitter.delta = splitter.$sidebarEl.outerWidth();
                splitter.basePos = (splitter.$sidebarEl.css('right') === 'auto' ? 0 : parseInt(splitter.$sidebarEl.css('right'), 10));

                splitter.CSSDefsExpanded.sidebarEl = { 'right': splitter.basePos };
                splitter.CSSDefsExpanded.contentEl = { 'right': splitter.basePos + splitter.delta + splitter.aux };
                splitter.CSSDefsCollapsed.sidebarEl = { 'right': splitter.basePos + splitter.offset - splitter.delta };
                splitter.CSSDefsCollapsed.contentEl = { 'right': splitter.basePos + splitter.offset + splitter.aux };

                splitter.CSSDefsHidden.sidebarEl = { 'right': splitter.basePos };
                splitter.CSSDefsHidden.contentEl = { 'right': splitter.basePos };

                break;
        }
    }

    var loadSplitter = function () {
        $('[data-toggle="splitter"]').each(function () {
            var $this = $(this);
            var splitter = new SplitterView('#' + this.id, 											// splitterEl
											$this.attr('data-splitter-parent'),						// parentEl
											$this.attr('data-splitter-sidebar'),					// sidebarEl
											$this.attr('data-splitter-content'),					// contentEl
											$this.attr('data-splitter-position'),					// position
											$this.attr('data-splitter-collapsed') !== undefined,	// collapsed
											$this.attr('data-splitter-offset'));					// offset

            $this.data("splitter", splitter);
        });
    };

    if (typeof (isAsync) === 'undefined') isAsync = false;
    if (isAsync) {
        //console.log("splitter init async!");
        loadSplitter();
    }
    else {
        $(window).on('load', function () {
            //console.log("splitter init sync!");
            loadSplitter();
        });
    }

};
// Centralized 'store' for predefined plug-in values. Should be used with jquery.extend() method.
FUXI.Presets = {};

FUXI.Presets.DataTables = {
	'iDisplayLength' : 10,
	'sDom' : 'rt<"dataTable-table-info"li><"dataTable-pagination-wrapper"p>',
	'sPaginationType' : 'input',
	'bAutoWidth': false,
	'bRetrieve': true,
	'aaSorting': [],
	'bSortCellsTop': false,
	'oLanguage' : {		
		'sUrl' : '/fuxi/lib/datatables-pt/1.9/resources/datatables_pt-PT.json'
	}
};
FUXI.Presets.DataTablesColFilter = {
	'sPlaceHolder': 'head:after'
};
FUXI.Presets.DataTablesRowGrouping = {
	'bHideGroupingColumn': false,
	'bHideGroupingOrderByColumn': false,
	'bExpandableGrouping': true
};
FUXI.Presets.jsTree = {
	'plugins' : ['themes', 'html_data', 'checkbox', 'dnd'],
	'themes' : {
		'theme' : 'fuxi',
		'icons' : false
	}
};
// Adds the Expandable Form to the global FUXI namespace.
FUXI.ExpandableForm = {};

var $formBlockCollapsed, $formBlockControls;
FUXI.ExpandableForm.init = function () {
    'use strict';
    $formBlockCollapsed = $('.fx-form-block.collapsed');
    $formBlockControls = $('.fx-form-block-controls');
    var $formBlockTitle = $('.fx-form-block h6');
    var $expandableFormBlockTitle = $('.fx-expandable-form-blocks h6');

    $formBlockCollapsed.find($formBlockTitle).nextAll('p').hide();
    $formBlockCollapsed.find($formBlockTitle).children('.caret').addClass('collapse');
    //$formBlockCollapsed.find($formBlockTitle).parent().next($formBlockControls).toggleClass('hidden');
    $formBlockCollapsed.find($formBlockTitle).parent().next($formBlockControls).addClass('fx-toggle-form-block-controls');

    $expandableFormBlockTitle.off('click.fuxi.utils').on('click.fuxi.utils', function (e) {        
        //$expandableFormBlockTitle.click(function(e) {
        $(this).nextAll('p').slideToggle('fast');
        //$(this).parent().next($formBlockControls).children().slideToggle('fast'); 
        // replaced slideToggle('fast') by toggleClass('hidden') because the inner fx-expand blocks got element display none messed up    
        $(this).parent().next($formBlockControls).children().toggleClass('hidden');
        $(this).parent().next($formBlockControls).toggleClass('fx-toggle-form-block-controls');
        $(this).parent().parent().toggleClass('collapsed');
        $(this).children('.caret').toggleClass('collapse');
    });
};

FUXI.ExpandableForm.openGroup = function (title) {    
    $(title).nextAll('p').slideToggle('fast');
    $(title).parent().next($formBlockControls).children().toggleClass('hidden');
    $(title).parent().next($formBlockControls).toggleClass('fx-toggle-form-block-controls');
    $(title).parent().parent().toggleClass('collapsed');
    $(title).children('.caret').toggleClass('collapse');
};

// Adds the FixedPositions to the global FUXI namespace.
FUXI.FixedPositions = {};

/*
 * variavel to know if fixed positions was initialized
 */
FUXI.FixedPositions._initCalled = false;

/*
 * initialize fixed positions
 */
FUXI.FixedPositions.init = function (isAsync, calcSizesCallback, forceReload) {
    'use strict';

    /*
     * if fixed position already initialized, check if the call is async and call reload 
     */
    //if (FUXI.FixedPositions._initCalled) {
    //    console.warn("fixed position already initialized...");
    //    if (isAsync) {
    //        FUXI.FixedPositions.reload(null, calcSizesCallback);
    //    }
    //    return;
    //}
    /*
     * set fixed position initialized
     */
    FUXI.FixedPositions._initCalled = true;

    /*
     * get closest element with data attr data-fix-to=top;
     */
    var getClosestDataFixToTop = function (elem) {
        return $(elem).closest('[data-fix-to="top"]');
    };

    $('[data-fix-to="top"]').not('[data-fix-to-top="true"]').each(function (idx) {
        //$('[data-fix-to="top"]').each(function (idx) {
        var $fixedItem = $(this),
                //$parent = $fixedItem.parent(),
                $sibling = $fixedItem.next(),
                withShadow = $fixedItem.data('render-shadow') !== undefined ? $fixedItem.data('render-shadow') : true;

        $fixedItem.data("data-fix-to-top", "true");

        if ($fixedItem.is(':hidden')) {
            $('a[data-toggle="tab"]').off('shown.bs.tab.fx.fp').on('shown.bs.tab.fx.fp', function (e) { FUXI.FixedPositions.reload(getClosestDataFixToTop(e.target), calcSizesCallback); });
            $('.modal').off('shown.bs.modal.fx.fp').on('shown.bs.modal.fx.fp', function (e) { FUXI.FixedPositions.setContext(e.target); FUXI.FixedPositions.reload(null, calcSizesCallback); });
        }

        if (withShadow) {
            var timer = null;
            $sibling.off('scroll.fx.fp').on('scroll.fx.fp', function (e) {
                if (timer !== null) {
                    clearTimeout(timer);
                }
                timer = setTimeout(function () {
                    if ($sibling.scrollTop() > 7 && !$fixedItem.hasClass("fx-sticky-shadow")) {
                        $fixedItem.addClass('fx-sticky-shadow');
                    } else if ($sibling.scrollTop() <= 7 && $fixedItem.hasClass("fx-sticky-shadow")) {
                        $fixedItem.removeClass('fx-sticky-shadow');
                    }
                }, 250);
            });
        }
    });

    $('[data-toggle="splitter"]').off('toggled.splitter.fuxi.fp').on('toggled.splitter.fuxi.fp', function (e) { FUXI.FixedPositions.setContext($(e.target).data("splitter-sidebar")); FUXI.FixedPositions.reload(null, calcSizesCallback); });
    $('.fx-advanced-search').off('shown.bs.collapse.fx.fp').off('hidden.bs.collapse.fx.fp').on('shown.bs.collapse.fx.fp hidden.bs.collapse.fx.fp', function (e) { FUXI.FixedPositions.reload(getClosestDataFixToTop(e.target), calcSizesCallback); });
    $('.fx-form-search').off('shown.bs.collapse.fx.fp').off('hidden.bs.collapse.fx.fp').on('shown.bs.collapse hidden.bs.collapse', function (e) {
        setTimeout(function () { FUXI.FixedPositions.reload(getClosestDataFixToTop(e.target), calcSizesCallback); }, 100);
    });

    if (typeof (isAsync) === 'undefined') isAsync = false;
    if (typeof (forceReload) === 'undefined') forceReload = true;
    if (isAsync) {
        //console.log("fixed position init async!");
        if (forceReload) {
            FUXI.FixedPositions.reload(null, calcSizesCallback);
        }
    }
    else {
        //console.log("fixed position init sync!");
        FUXI.FixedPositions.onWindowLoad(function () { FUXI.FixedPositions.reload.call(this, null, calcSizesCallback); });
    }

    FUXI.FixedPositions.onWindowResize(function () { FUXI.FixedPositions.reload.call(this, null, calcSizesCallback); });
};

/*
 * set context
 */
FUXI.FixedPositions._context = '';
FUXI.FixedPositions.setContext = function (ctx) {
    //console.log(['ctx: ', ctx]);
    FUXI.FixedPositions._context = ctx;
}
/*
 * get context
 */
FUXI.FixedPositions.getContext = function () {
    return FUXI.FixedPositions._context;
}

/*
 * calculate sizes for the $fixedItem 
 */
FUXI.FixedPositions._calcSizes = function ($fixedItem, calcSizesCallback) {
    var $fixParent = $fixedItem.closest('[data-fix-to-top-parent]'),
        $parent = ($fixParent.length > 0) ? $fixParent.first() : $fixedItem.parent(),
        $sibling = $fixedItem.next(),
        withHeight = $fixedItem.data('calc-height') !== undefined ? $fixedItem.data('calc-height') : true,
        $siblingPanelBottom = $fixedItem.siblings(".fx-splitter-sidebar.bottom"),
        panelBottomH = 0;

    if ($siblingPanelBottom.length > 0) {
        var pos = $siblingPanelBottom.position();        
        var splitter = $siblingPanelBottom.find('[data-toggle="splitter"]').data("splitter");
        var offset = splitter.offset;
        var aux = 10;
        if (splitter.collapsed) {
            panelBottomH = offset + aux;
        }
        else {
            panelBottomH = $siblingPanelBottom.outerHeight(true) + aux;
        }
    }

    //console.log("calcSizes run...")
    //console.log($fixedItem);
    $sibling.css('margin-top', $fixedItem.outerHeight());
    if (withHeight) {
        $sibling.css({
            'height': $parent.height() - $fixedItem.outerHeight() - panelBottomH,
            'overflow-y': 'auto'
        });
    }

    if (calcSizesCallback) {
        calcSizesCallback();
    }
};
/*
 * call calcSizes 
 * $fixedItem: null or jQuery element to apply the calcSizes, when pass null the calcSizes is called for all elements with [data-fix-to="top"]
 * calcSizesCallback: callback function fired after calcSizes run
 */
FUXI.FixedPositions.reload = function ($fixedItem, calcSizesCallback) {

    if (!FUXI.FixedPositions._initCalled) {
        console.warn("Please call FUXI.FixedPositions.init(isAsync, calcSizesCallback) first!");
        return false;
    }
    //console.log(["reload...", $fixedItem]);
    if ($fixedItem && $fixedItem.length > 0) {
        FUXI.FixedPositions._calcSizes($fixedItem, calcSizesCallback);
    }
    else {
        $('[data-fix-to="top"]', FUXI.FixedPositions.getContext()).each(function (idx) {
            //console.log("idx: " + idx);
            FUXI.FixedPositions._calcSizes($(this), calcSizesCallback);
        });
    }
    // clear context
    FUXI.FixedPositions.setContext('');
};

/*
 * functions setted to window load event
 */
FUXI.FixedPositions._winLoadFuncs = [];
/*
 * set function to window load event
 * if the callback function exist on _winLoadFuncs don't set again
 */
FUXI.FixedPositions.onWindowLoad = function (callback) {
    // check if function is already setted
    var arr = $.grep(FUXI.FixedPositions._winLoadFuncs, function (o) { return '' + o == '' + callback });
    var exist = arr.length > 0;
    if (!exist) {
        //console.log("onWindowLoad setted");
        FUXI.FixedPositions._winLoadFuncs.push('' + callback);
        $(window).on('load', callback);
    }

}
/*
 * functions setted to window resize event
 */
FUXI.FixedPositions._winResizeFuncs = [];
/*
 * set function to window resize event
 * if the callback function exist on _winResizeFuncs don't set again
 */
FUXI.FixedPositions.onWindowResize = function (callback) {
    // check if function is already setted    
    var arr = $.grep(FUXI.FixedPositions._winResizeFuncs, function (o) { return '' + o == '' + callback });
    var exist = arr.length > 0;
    if (!exist) {
        //console.log("onWindowResize setted");
        //console.log(callback);
        FUXI.FixedPositions._winResizeFuncs.push('' + callback);

        var resizeEvt;
        $(window).on('resize', function () {
            clearTimeout(resizeEvt);
            resizeEvt = setTimeout(function () {
                //code to do after window is resized
                callback();
            }, 250);
        });
    }
}
// Adds the Offscreen Menu to the global FUXI namespace.
FUXI.OffscreenMenu = {};

FUXI.OffscreenMenu.init = function () {
    'use strict';

    var OffscreenMenuView = function (menu) {
        this.$menu = $(menu),
        this.$togglersAreaDrag = this.$menu.find('.fx-offscreen-menu-drag'),
		this.$togglersArea = this.$togglersAreaDrag.find('.fx-offscreen-menu'),
		this.$togglers = this.$togglersArea.find('a'),
		this.$detach = this.$menu.find('[data-menu="detach"]'),
		this.$reattach = this.$menu.find('[data-menu="reattach"]'),
        //this.$dock = this.$menu.find('[data-menu="dock"]'),
        //this.$close 		= this.$menu.find('[data-menu="close"]'),

        //this.docked = false,
        this.collapsed = true,
		this.detached = false,
		this.dragging = false;

        this.$togglers.on('click', $.proxy(this.toggle, this));
        this.$detach.on('click', $.proxy(this.detach, this));
        this.$reattach.on('click', $.proxy(this.reattach, this));
        //this.$dock.on('click', $.proxy(this.dock, this));
        //this.$close.on(		'click', 	$.proxy(this.close, 	this));

        // get measure scroll
        this.scrollbarWidth = 0;

        // check if parent has vertical scroll
        if (FUXI.Utils.hasVerticalScroll(this.$menu.parent().get(0))) {
            this.scrollbarWidth = FUXI.Utils.measureScrollbar();
            // get measure scroll
            this.$menu.css({
                right: this.scrollbarWidth + 'px'
            })
        }

        this.$menu.draggable({ 	/*'containment': 'document',*/
            'disabled': true,
            'delay': 150,
            'handle': ".fx-offscreen-dock-title",
            'containment': 'document'
        });

        var self = this;
        this.$togglersAreaDrag.draggable({
            'axis': 'y',
            'containment': 'parent',
            'delay': 150,
            'start': function () {
                self.dragging = true;
            },
            'stop': function (event, ui) {
                setTimeout(function () { self.dragging = false; }, 150);                
            }
        });

        $(document).on('click', $.proxy(function (e) {
            var $target = $(e.target);

            if ($target.prop("tagName") == "BODY") return;

            if (!this.$menu.is(e.target) && this.$menu.has(e.target).length === 0) {
                this.collapse();
            }
        }, this));

        this.$togglers.on('shown.bs.tab', $.proxy(function (e) {
            //e.target // newly activated tab
            //e.relatedTarget // previous active tab
            //console.log(["shown.bs.tab...",e.target, e.relatedTarget]);
            var $ctx = this.getActiveOffScreenTab();
            FUXI.FixedPositions.setContext($ctx);
            FUXI.FixedPositions.reload();
        }, this));
    };

    OffscreenMenuView.prototype.allowResize = function (allow) {
        console.log("allowResize fired!");
        if (allow) {
            var self = this;
            var dragPos = null;
            this.$menu.resizable({
                minHeight: 400,
                minWidth: 280,
                maxHeight: 900,
                maxWidth: 1080,
                create: function (event, ui) {
                    $(this).parent().on('resize', function (e) {
                        // stopPropagation() because we don't need window.resize get fired
                        e.stopPropagation();
                    });
                },
                start: function (event, ui) {
                    var bottom = ui.size.height - Math.floor(self.$togglersAreaDrag.position().top) - self.$togglersAreaDrag.outerHeight(true);
                    var perc = (bottom * 100) / ui.size.height;
                    //console.log([perc, ui.size.height]);
                    self.$togglersAreaDrag.css({
                        bottom: perc + '%',
                        top: 'auto'
                    });
                },
                resize: function (event, ui) {
                    //console.log(["ui log: ", ui]);
                    // on resize reload fixed position
                    var $ctx = self.getActiveOffScreenTab();
                    FUXI.FixedPositions.setContext($ctx);
                    FUXI.FixedPositions.reload();
                },
                stop: function (event, ui) {
                    var top = self.$togglersAreaDrag.position().top;
                    self.$togglersAreaDrag.css({
                        bottom: 'auto',
                        top: top
                    });
                }
            });
        } else {
            console.log("not allow");
            this.$menu.resizable("destroy");
        }
    };
    OffscreenMenuView.prototype.detach = function () {
        console.log("detach fired!");
        if (!this.detached) {
            this.$menu.addClass('detached').removeAttr('style').draggable('option', 'disabled', false);
            this.$togglersAreaDrag.removeAttr('style');
            this.$detach.addClass('hidden');
            this.$reattach.removeClass('hidden');

            // emit attach event
            this.emitAttachEvent();

            // allow resize
            this.allowResize(true);

            this.detached = true;
        }
    };
    OffscreenMenuView.prototype.reattach = function () {
        console.log("reattach fired!");
        if (this.detached) {
            this.$menu.removeClass('detached').removeAttr('style').css({ 'right': this.scrollbarWidth + 'px' }).addClass('in fx-offscreen-collapsed').draggable('option', 'disabled', true);
            this.$togglersAreaDrag.removeAttr('style');
            this.$detach.removeClass('hidden');
            this.$reattach.addClass('hidden');

            // emit attach event
            this.emitAttachEvent();

            // not allow resize
            this.allowResize(false);

            this.collapsed = true;
            this.detached = false;
        }
    };
    OffscreenMenuView.prototype.toggle = function (e) {
        //console.log("toggle is dragging?" + this.dragging);
        console.log("toggle fired!");
        if (!this.dragging) {
            $(e.delegateTarget).tab('show');            
            if (this.collapsed && !this.detached) {
                //this.$menu.animate({ 'right': this.scrollbarWidth + 'px' }, 200, $.proxy(this.emitToggleEvent, this)).addClass('in');
                this.$menu.animate({ 'width': 350 }, 200, $.proxy(this.emitToggleEvent, this)).addClass('in').removeClass('fx-offscreen-collapsed');
                this.collapsed = false;
            }
        } else {
            this.dragging = false;
        }
    };
    OffscreenMenuView.prototype.collapse = function () {
        console.log("collapse fired!");
        if (!this.collapsed && !this.detached) {
            //this.$menu.animate({ 'right': -345 }, 200, $.proxy(this.emitToggleEvent, this)).removeClass('in');
            this.$menu.animate({ 'width': 0 }, 200, $.proxy(this.emitToggleEvent, this)).removeClass('in').addClass('fx-offscreen-collapsed');
            this.$togglersArea.find('li.active').removeClass('active');

            this.collapsed = true;
        }
    };

    OffscreenMenuView.prototype.emitToggleEvent = function () {
        console.log("emitToggleEvent fired!");
        this.$menu.trigger({
            'type': 'toggled.offscreenmenu.fuxi',
            'state': (this.collapsed ? 'collapsed' : 'expanded')
        });
        console.log("emitToggleEvent");
        //FUXI.FixedPositions.init(true);
        //FUXI.FixedPositions.setContext(this.$menu);
        var ctx = this.getActiveOffScreenTab();
        FUXI.FixedPositions.setContext(ctx);
        FUXI.FixedPositions.reload();
    };
    OffscreenMenuView.prototype.emitAttachEvent = function () {
        console.log("emitAttachEvent fired!");
        this.$menu.trigger({
            'type': 'attach.offscreenmenu.fuxi',
            'state': (this.detached ? 'reattach' : 'detach')
        });
        console.log("emitAttachEvent");
        //FUXI.FixedPositions.init(true);
        var ctx = this.getActiveOffScreenTab();
        FUXI.FixedPositions.setContext(ctx);
        FUXI.FixedPositions.reload();
    };

    OffscreenMenuView.prototype.getActiveOffScreenTab = function () {
        return this.$togglersArea.find("li.active a").data("target");
    };

    $('[data-menu="offscreen-menu"]').each(function () {
        new OffscreenMenuView(this);
    });

};
// Adds block ui defaults to the global FUXI namespace.
FUXI.BlockUiDefaults = {};

FUXI.BlockUiDefaults.init = function() {
	'use strict';
	// override these in your code to change the default behavior and style
	$.blockUI.defaults = {
		// message displayed when blocking (use null for no message)
	    message: '<div class="fx-block-wrapper">' +
                    '<div class="fx-ico-loading fx-ico-loading-m">'+
                        '<span class="sr-only">A carregar...</span>' +
                    '</div>' +
                    '<div class="fx-ico-loading-message"' +
                        '<p>a carregar conte&uacutedo...</p>' +
                    '</div>' +
                 '</div>',

		title : null, // title string; only used when theme == true
		draggable : true, // only used when theme == true (requires jquery-ui.js to be loaded)

		theme : false, // set to true to use with jQuery UI themes

		// styles for the message when blocking; if you wish to disable
		// these and use an external stylesheet then do this in your code:
		// $.blockUI.defaults.css = {};
		css : {
			opacity : 0.6,
			padding : '10px',
			margin : 0,
			width : '20%',
			top : '40%',
			left : '45%',
			textAlign : 'center',
			color : '#666',
			border : 'none',
			backgroundColor : 'transparent',
			cursor : 'wait',
			'-webkit-border-radius' : '0',
			'border-radius' : '0'
		},

		// minimal style set used when themes are used
		themedCSS : {
			width : '30%',
			top : '40%',
			left : '35%'
		},

		// styles for the overlay
		overlayCSS : {
			backgroundColor : '#fff',
			opacity : 0.8,
			cursor : 'wait'
		},

		// style to replace wait cursor before unblocking to correct issue
		// of lingering wait cursor
		cursorReset : 'default',

		// styles applied when using $.growlUI
		growlCSS : {
			width : '350px',
			top : '10px',
			left : '',
			right : '10px',
			border : 'none',
			padding : '5px',
			opacity : 0.6,
			cursor : null,
			color : '#fff',
			backgroundColor : '#000',
			'-webkit-border-radius' : '10px',
			'border-radius' : '10px'
		},

		// IE issues: 'about:blank' fails on HTTPS and javascript:false is s-l-o-w
		// (hat tip to Jorge H. N. de Vasconcelos)
		iframeSrc : /^https/i.test(window.location.href || '') ? 'javascript:false' : 'about:blank',

		// force usage of iframe in non-IE browsers (handy for blocking applets)
		forceIframe : false,

		// z-index for the blocking overlay
		baseZ : 1000,

		// set these to true to have the message automatically centered
		centerX : true, // <-- only effects element blocking (page block controlled via css above)
		centerY : true,

		// allow body element to be stetched in ie6; this makes blocking look better
		// on "short" pages.  disable if you wish to prevent changes to the body height
		allowBodyStretch : true,

		// enable if you want key and mouse events to be disabled for content that is blocked
		bindEvents : true,

		// be default blockUI will supress tab navigation from leaving blocking content
		// (if bindEvents is true)
		constrainTabKey : true,

		// fadeIn time in millis; set to 0 to disable fadeIn on block
		fadeIn : 200,

		// fadeOut time in millis; set to 0 to disable fadeOut on unblock
		fadeOut : 400,

		// time in millis to wait before auto-unblocking; set to 0 to disable auto-unblock
		timeout : 0,

		// disable if you don't want to show the overlay
		showOverlay : true,

		// if true, focus will be placed in the first available input field when
		// page blocking
		focusInput : true,

		// suppresses the use of overlay styles on FF/Linux (due to performance issues with opacity)
		// no longer needed in 2012
		// applyPlatformOpacityRules: true,

		// callback method invoked when fadeIn has completed and blocking message is visible
		onBlock : null,

		// callback method invoked when unblocking has completed; the callback is
		// passed the element that has been unblocked (which is the window object for page
		// blocks) and the options that were passed to the unblock call:
		//   onUnblock(element, options)
		onUnblock : null,

		// don't ask; if you really must know: http://groups.google.com/group/jquery-en/browse_thread/thread/36640a8730503595/2f6a79a77a78e493#2f6a79a77a78e493
		quirksmodeOffsetHack : 4,

		// class name of the message block
		blockMsgClass : 'blockMsg',

		// if it is already blocked, then ignore it (don't unblock and reblock)
		ignoreIfBlocked : false
	};
};

FUXI.IconToggler = {};

FUXI.IconToggler.OnOffIcons = [
	// On, 								Off
	[ 'fa fa-star',						'fa fa-star-o'],
	[ 'fuxicons fuxicons-thumb-tack', 	'fuxicons fuxicons-thumb-tack-o'],
	[ 'fa fa-lock', 					'fa fa-unlock']
];
FUXI.IconToggler.getIconSetByClasses = function (classes) {
	for (var i = 0, n = FUXI.IconToggler.OnOffIcons.length; i < n; i++) {
		if (FUXI.IconToggler.OnOffIcons[i][0] === classes || FUXI.IconToggler.OnOffIcons[i][1] === classes) {
			return FUXI.IconToggler.OnOffIcons[i];
		}
	}
};
FUXI.IconToggler.turnOn = function ($els, iconClassVal) {
	$els.removeClass('fx-icon-toggle-off')
		.addClass('fx-icon-toggle-on')
		.find('i').attr('class', iconClassVal);
};
FUXI.IconToggler.turnOff = function ($els, iconClassVal) {
	$els.removeClass('fx-icon-toggle-on')
		.addClass('fx-icon-toggle-off')
		.find('i').attr('class', iconClassVal);
};
FUXI.IconToggler.init = function () {
	$(document).on('click', '[data-fx-icon]', function () {
		var $toggler		= $(this),
			$icon			= $toggler.find('i'),
			iconClasses 	= $icon.attr('class'),
			iconOnClasses	= $icon.attr('data-fx-icon-on'),	// A data-attribute (which acts as a cache) will contain the value for the class attribute when the toggler is "on".
			iconOffClasses	= $icon.attr('data-fx-icon-off'),	// Same as above, when "off".
			set 			= $toggler.attr('data-fx-set'),
			isSetMaster		= ($toggler.attr('data-fx-icon') === 'all'),
			isOn			= $toggler.hasClass('fx-icon-toggle-on'),
			iconSet,
			$setEls;

		// If the data-attributes which indicate the on/off icons are undefined, it means this is the first click on the element.
		// We will query our list (OnOffIcons) and then set the data-attributes accordingly, in order to avoid future look-ups.
		if (!iconOnClasses || !iconOffClasses) {
			iconSet			= FUXI.IconToggler.getIconSetByClasses(iconClasses);
			iconOnClasses	= iconSet[0];
			iconOffClasses	= iconSet[1];

			$icon.attr('data-fx-icon-on', iconOnClasses)
				.attr('data-fx-icon-off', iconOffClasses);
		}

		if (set) {
			$setEls = $('[data-fx-icon][data-fx-set=' + set + ']').not('[data-fx-icon=all]');
		}

		if (isOn) {
			FUXI.IconToggler.turnOff($toggler, iconOffClasses);
			if (set) {
				if (isSetMaster) {
					FUXI.IconToggler.turnOff($setEls, iconOffClasses);
				} else {
					FUXI.IconToggler.turnOff($('[data-fx-icon=all][data-fx-set=' + set + ']'), iconOffClasses);
				}
			}
		} else {
			FUXI.IconToggler.turnOn($toggler, iconOnClasses);

			if (set) {
				if (isSetMaster) {
					FUXI.IconToggler.turnOn($setEls, iconOnClasses);
				} else {
					if (!$setEls.not('.fx-icon-toggle-on').length) {
						FUXI.IconToggler.turnOn($('[data-fx-icon=all][data-fx-set=' + set + ']'), iconOnClasses);
					}
				}
			}
		}
	});
};

FUXI.CheckboxToggler = {};

FUXI.CheckboxToggler.init = function () {
	$(document).on('change', '[type=checkbox][data-fx-check]', function () {
		var $toggler		= $(this),
			set 			= $toggler.attr('data-fx-set'),
			isSetMaster		= ($toggler.attr('data-fx-check') === 'all'),
			switchedOn		= $toggler.prop('checked'),
			isInTable		= $toggler.parent().is('td, th'),
			$setEls;

		if (set) {
			$setEls = $('[data-fx-check][data-fx-set=' + set + ']').not('[data-fx-check=all]');
		}

		if (switchedOn) {
			if (isSetMaster) {
				$setEls.prop('checked', true);
				if (isInTable) {
					$setEls.each(function () {
						$(this).parent().parent().addClass('selected');
					});
				}
			} else {
				if ($setEls.not(':checked').length === 0) {
					$('[data-fx-check=all][data-fx-set=' + set + ']').prop('checked', true);
				}
				if (isInTable) {
					$toggler.parent().parent().addClass('selected');
				}
			}
		} else {
			if (isSetMaster) {
				$setEls.prop('checked', false);
				if (isInTable) {
					$setEls.each(function () {
						$(this).parent().parent().removeClass('selected');
					});
				}
			} else {
				$('[data-fx-check=all][data-fx-set=' + set + ']').prop('checked', false);
				if (isInTable) {
					$toggler.parent().parent().removeClass('selected');
				}
			}
		}
	});
};
FUXI.Wizard = {};
FUXI.Wizard.modeEnum = {
    EDIT: 'EDIT',
    INSERT: "INSERT",
    VIEW: 'VIEW'
};

FUXI.Wizard.steps = { 'blockedClassName': 'blocked', 'decisionClassName': 'step-decision' };

FUXI.Wizard.toggleDynamicSteps = function ($elem) {

    var $wizElm = $elem.closest("[data-wizard]")
    var $wiz = $wizElm.data("wizard");

    var decider = $elem.data('dynamic-decider');
    var deciderBlock = ($elem.data().hasOwnProperty("blockStep")) ? $elem.data("block-step") : true;
    var show = $elem.is(":checked");

    var $stepsLink = $("nav li[data-dynamic-parent-decider=" + decider + "]", $wizElm);
    var $stepsContent = $(".fx-wizardsteps-content[data-dynamic-parent-decider=" + decider + "]", $wizElm);

    $stepsLink.removeClass(FUXI.Wizard.steps.blockedClassName);
    if (deciderBlock) {
        $stepsLink.addClass(FUXI.Wizard.steps.blockedClassName);
    }

    if (show) {
        $stepsLink.removeClass("hidden").removeAttr("data-dynamic-step");
        $stepsContent.removeAttr("data-dynamic-step");
    }
    else {

        $stepsLink.addClass("hidden").attr("data-dynamic-step", '');
        $stepsContent.attr("data-dynamic-step", '');

        // check steps link
        var ind = 0;
        $.each($stepsLink, function (idx, el) {
            var $el = $(el);

            var $sectionAllDeciders = $("section[data-dynamic-parent-decider=" + decider + "]").find('input[data-dynamic-decider]');
            $.each($sectionAllDeciders, function (i, e) {
                var $elD = $(e);
                if ($(e).is(":checked")) $elD.trigger("click");
            });
        });

    }

    $wiz.handleBehaviors();
}

// rearrange  numeration
FUXI.Wizard.rearrangeNumeration = function ($wiz) {
    // get elements used in the wizard 
    var $wizardNavItems = $(".fx-nav-link", $wiz);
    var $wizStepsContent = $(".fx-wizardsteps-content", $wiz);

    var $elems = $wizardNavItems.not("[data-dynamic-step]").find(".fx-wizardstep-number");
    var n = 1;
    var these = this;
    $elems.each(function (idx) {
        n = idx + 1;
        $(this).text(n);
        $wizStepsContent.not("[data-dynamic-step]").eq(idx).find(".fx-wizardstep-number").text(n);
    });
};

FUXI.Wizard.init = function (options) {

    var defaults = { 'isAsync': false, 'mode': FUXI.Wizard.modeEnum.INSERT, 'validateOnPrevious': false, 'gotoStopOnError': false };
    var defaultErrorResult = { isValid: true, message: '' };

    // wizard
    var Wizard = function ($wiz) {
        this.$wizardEl = $wiz;
        this.options = $.extend({}, defaults, options);

        var mode = $(this.$wizardEl).data("wiz-mode");
        this.options.mode = mode || this.options.mode;
        var valOnPrev = $(this.$wizardEl).data("validate-on-previous");
        this.options.validateOnPrevious = valOnPrev || this.options.validateOnPrevious;

        this.step = (this.options.mode !== FUXI.Wizard.modeEnum.INSERT) ? parseInt($(this.$wizardEl).data("step-opened")) || 1 : 1;
        this.currentStep = this.step;

        this.clientValidator = this.$wizardEl.data("client-validator");

        // get elements used in the wizard 
        this.$wizardNavItems = $(".fx-nav-link", this.$wizardEl);
        this.$wizStepsContent = $(".fx-wizardsteps-content", this.$wizardEl);
        this.$wizStepInfo = $(".fx-wizardstep-info", this.$wizardEl);

        this.$btPrev = $($(this.$wizardEl).data("wiz-prev"));
        this.$btNext = $($(this.$wizardEl).data("wiz-next"));
        this.$btComplete = $($(this.$wizardEl).data("wiz-complete"));

        // Add event listeners
        this.$btNext.off('click.fuxi.wizard.next').on('click.fuxi.wizard.next', $.proxy(this.next, this));
        this.$btPrev.off('click.fuxi.wizard.prev').on('click.fuxi.wizard.prev', $.proxy(this.prev, this));
        this.$btComplete.off('click.fuxi.wizard.complete').on('click.fuxi.wizard.complete', $.proxy(this.complete, this));
        $(".fx-nav-items", this.$wizardEl).off('click.fuxi.wizard.goto').on('click.fuxi.wizard.goto', ".fx-nav-link", $.proxy(this.goto, this));

        this.handleBehaviors();

        // cancel click propagation on error icon click
        $('.fx-wizardstep-error').off('click.fuxi.wizard.error').on("click.fuxi.wizard.error", function (e) { e.stopPropagation(); })
    };

    Wizard.prototype.reload = function () {
        // get elements used in the wizard
        this.$wizardNavItems = $(".fx-nav-link", this.$wizardEl);

        this.handleButtonsBehavior(this.currentStep);
    };

    Wizard.prototype.stepIsValid = function (st) {
        var result = defaultErrorResult;
        result.isValid = false;
        try {
            st = st || this.currentStep;
            var clValidator = this.getStepClientValidator(st);
            if (clValidator) {
                result = FUXI.Utils.executeFunctionByName(clValidator, window, { 'step': st, 'Wizard': this });
                //console.log(["stepIsValid: ",result]);
            }
        }
        catch (e) {
            console.log(e);
            //throw e;
        }
        return result;
    };

    // get index of the element nav
    Wizard.prototype.getIndex = function (st) {
        var $elem = this.$wizardNavItems.not('[data-dynamic-step]').eq(st - 1);
        var idx = this.$wizardNavItems.not('[data-dynamic-step]').index($elem);
        return idx;
    };
    // function to handle the behavior of buttons
    Wizard.prototype.handleButtonsBehavior = function (st) {
        var navLen = this.$wizardNavItems.not('[data-dynamic-step]').length;
        //console.log("navLen: " + navLen);
        // in this case switch have poor performance... is better use if statement
        if (st === 1) {
            this.$btPrev.addClass("disabled");
            this.$btNext.removeClass("disabled");

            if (this.options.mode !== FUXI.Wizard.modeEnum.EDIT) {
                this.$btComplete.addClass("btn-default disabled").removeClass("btn-primary");
                this.$btNext.removeClass("btn-default").addClass("btn-primary");
            }
        }
        if (st > 1) {
            this.$btPrev.removeClass("disabled");
        }
        if (st > 1 && st <= navLen) {
            this.$btNext.removeClass("disabled");
            if (this.options.mode !== FUXI.Wizard.modeEnum.EDIT) {
                this.$btComplete.addClass("btn-default disabled").removeClass("btn-primary");
                this.$btNext.removeClass("btn-default").addClass("btn-primary");
            }
        }
        if (st === navLen) {
            this.$btComplete.removeClass("btn-default disabled");
            this.$btComplete.addClass("btn-primary");

            this.$btNext.removeClass("btn-primary");
            this.$btNext.addClass("btn-default disabled");
        }
    };
    // function to handle the behavior of steps
    Wizard.prototype.handleStepsBehavior = function (st) {
        // get de index step. used in objects arrays
        var idx = this.getIndex(st);

        // get the nav step selected
        var $navFrom = this.$wizardNavItems.not('[data-dynamic-step]').eq(this.currentStep - 1),
            $navTo = this.$wizardNavItems.not('[data-dynamic-step]').eq(this.step - 1);

        // show step defined
        var $content = this.$wizStepsContent.addClass('hidden').not('[data-dynamic-step]');
        $content.eq(idx).removeClass('hidden');

        // check if step is substep
        if ($navFrom.closest('ul').hasClass('fx-wizard-substeps') || $navTo.closest('ul').hasClass('fx-wizard-substeps')) {
            this.handleSubStep($navFrom, $navTo);
        } else {
            // active and show selected step
            $navFrom.removeClass(FUXI.Wizard.steps.blockedClassName).removeClass('active');
            $navTo.removeClass(FUXI.Wizard.steps.blockedClassName).addClass('active');
        }

    };
    Wizard.prototype.handleSubStep = function (from, to) {

        from.removeClass('active').closest('.fx-nav-link-with-substeps').removeClass('active');

        to.removeClass(FUXI.Wizard.steps.blockedClassName).addClass('active').closest('.fx-nav-link-with-substeps').removeClass(FUXI.Wizard.steps.blockedClassName).addClass('active');

        if (to.closest('ul').hasClass('fx-wizard-substeps')) {
            to.closest('.fx-nav-link-with-substeps').removeClass(FUXI.Wizard.steps.blockedClassName).addClass('active');
        } else {
            from.closest('.fx-nav-link-with-substeps').removeClass('active');
            to.removeClass(FUXI.Wizard.steps.blockedClassName).addClass('active');
        }

    };
    // get step client validator
    Wizard.prototype.getStepClientValidator = function (st) {
        var idx = this.getIndex(st || this.currentStep);
        return this.$wizardNavItems.not('[data-dynamic-step]').eq(idx).data("client-validator") || this.clientValidator || false;
    };
    // event next
    Wizard.prototype.next = function () {
        this.currentStep = this.step;

        // validate step
        var result = (this.options.mode !== FUXI.Wizard.modeEnum.VIEW) ? this.stepIsValid() : defaultErrorResult;
        if (result.isValid) {
            this.markStepAsValid();
            this.step++;
            this.handleBehaviors();

            
            var idx = this.getIndex(this.step);
            // scroll to step
            this.scrollToStep(this.$wizardNavItems.not('[data-dynamic-step]').eq(idx));

            idx = this.getIndex(this.currentStep);
            // show nav step info of the current step        
            this.$wizardNavItems.not('[data-dynamic-step]').eq(idx).find(this.$wizStepInfo).removeClass('hidden');
        }
        else {
            this.markStepAsInvalid(null, result.message);
        }
        
        // emit next event
        this.emitNextEvent(result.isValid);
    };
    // event previous
    Wizard.prototype.prev = function () {
        this.currentStep = this.step;        
        var result = defaultErrorResult;
        if (this.options.validateOnPrevious && this.options.mode !== FUXI.Wizard.modeEnum.VIEW) {
            // validate step
            var result = this.stepIsValid();
            if (result.isValid) {
                this.markStepAsValid();
                this.step--;
                this.handleBehaviors();                
            }
            else {
                this.markStepAsInvalid(null, result.message);
            }
        }
        else {
            this.step--;
            this.handleBehaviors();
        }

        var idx = this.getIndex(this.step);
        // scroll to step
        this.scrollToStep(this.$wizardNavItems.not('[data-dynamic-step]').eq(idx));
        
        // emit prev event
        this.emitPrevEvent(result.isValid);
    };
    // event complete
    Wizard.prototype.complete = function () {
        this.currentStep = this.step;

        // validate step
        var result = (this.options.mode !== FUXI.Wizard.modeEnum.VIEW) ? this.stepIsValid() : defaultErrorResult;
        if (result.isValid) {
            this.markStepAsValid();
        }
        else {
            this.markStepAsInvalid(null, result.message);
        }

        //emit complete event
        this.emitCompleteEvent(result.isValid);
    };
    // event goto
    Wizard.prototype.goto = function (e) {
        // if li has class blocked exit...
        if (options.mode !== FUXI.Wizard.modeEnum.EDIT && $(e.currentTarget).hasClass(FUXI.Wizard.steps.blockedClassName)) return false;

        this.currentStep = this.step;
        var idx = this.$wizardNavItems.not('[data-dynamic-step]').index($(e.currentTarget));
        this.step = idx + 1; //index start at zero

        // if current and step are the same exit..
        if (this.currentStep === this.step) return false;

        // if VIEW handle behaviors and exit
        if (options.mode === FUXI.Wizard.modeEnum.VIEW) {
            this.handleBehaviors();
            // emit goto event
            this.emitGoToEvent(isValid);
            return;
        }

        // for INSERT and EDIT        
        // validate all steps from current to target
        if (this.step < this.currentStep && this.options.validateOnPrevious) {
            for (var i = this.currentStep; i > this.step; i--) {
                var result = this.validateStep(i);
                if (!result.isValid && this.options.gotoStopOnError) {
                    break;
                }
            }
        }
        else if (this.step > this.currentStep) {
            for (var i = this.currentStep; i < this.step; i++) {
                var result = this.validateStep(i);
                if (!result.isValid && this.options.gotoStopOnError) {
                    break;
                }
            }
        }

        this.handleBehaviors();
        
        // emit goto event
        this.emitGoToEvent();
    };
    Wizard.prototype.validateStep = function (st) {
        var result = this.stepIsValid(st);
        if (!result.isValid) {
            this.markStepAsInvalid(st, result.message);
            if (this.options.gotoStopOnError) {
                this.step = st;
            }
        }
        else {
            this.markStepAsValid(st);
        }

        return result;
    };
    
    // handle behaviors
    Wizard.prototype.handleBehaviors = function () {
        // activate/ show step 
        this.handleStepsBehavior(this.step);
        // activate buttons and steps
        this.handleButtonsBehavior(this.step);
    }
    // emit events
    // next
    Wizard.prototype.emitNextEvent = function (isValid) {
        this.$btNext.trigger({ 'type': 'next.wizard.fuxi', 'stepIsValid': isValid, 'currentStep': this.currentStep, 'targetStep': this.step, 'Wizard': this.$wizardEl.data("wizard") });
    };
    //previous
    Wizard.prototype.emitPrevEvent = function (isValid) {
        this.$btPrev.trigger({ 'type': 'prev.wizard.fuxi', 'stepIsValid': isValid, 'currentStep': this.currentStep, 'targetStep': this.step, 'Wizard': this.$wizardEl.data("wizard") });
    };
    //complete
    Wizard.prototype.emitCompleteEvent = function (isValid) {
        this.$btComplete.trigger({ 'type': 'complete.wizard.fuxi', 'stepIsValid': isValid, 'currentStep': this.currentStep, 'targetStep': this.step, 'Wizard': this.$wizardEl.data("wizard") });
    };
    // goto
    Wizard.prototype.emitGoToEvent = function () {
        var idx = this.getIndex(this.step);
        this.$wizardNavItems.eq(idx).trigger({ 'type': 'goto.wizard.fuxi', 'currentStep': this.currentStep, 'targetStep': this.step, 'Wizard': this.$wizardEl.data("wizard") });
    };
    // mark step as invalid
    Wizard.prototype.markStepAsInvalid = function (st, errorMsg) {
        // get de index step. used in objects arrays
        var stepIdx = this.getIndex(st || this.currentStep);
        // get the nav step 
        var $navSel = this.$wizardNavItems.not('[data-dynamic-step]').eq(stepIdx);

        $navSel.attr("data-invalid", true).find(".fx-wizardstep-error").attr("data-content", errorMsg).removeClass("hidden");
        
    }
    // mark step as valid
    Wizard.prototype.markStepAsValid = function (st) {
        // get de index step. used in objects arrays
        var stepIdx = this.getIndex(st || this.currentStep);
        // get the nav step 
        var $navSel = this.$wizardNavItems.not('[data-dynamic-step]').eq(stepIdx);

        $navSel.removeAttr("data-invalid").find(".fx-wizardstep-error").attr("data-content", '').addClass("hidden");
    }

    /*  set summary info of step    
        var summary = [
            { stepDecision: false, title: 'Tipo de servi�o', value: 'qq coisa aqui escolhida?' },
            { stepDecision: true, title: 'Tipo de servi�o 2', value: 'internet!' },
        ]
    */
    Wizard.prototype.setSummary = function (st, summary) {
        var idx = this.getIndex(st);
        var $info = this.$wizardNavItems.eq(idx).find(this.$wizStepInfo);
        if ($info) {
            // clear summary info
            $info.html('');
            if (typeof summary === 'object') {
                $info.append($('<ul />').addClass('fx-wizardstep-info-items'));
                var $container = $info.find('.fx-wizardstep-info-items');

                $.each(summary, function (index, value) {
                    $container.append(prepareSumaryItem(value));
                });

            } else if (summary !== '') {
                $info.html(summary);
            }
        }
    }

    Wizard.prototype.getCurrentStepContainer = function (st) {
        var idx = this.getIndex(st);
        var $stepContainer = this.$wizStepsContent.not('[data-dynamic-step]').eq(idx);

        return $stepContainer
    }

    Wizard.prototype.scrollToStep = function (elem, offset) {
        var container = $(".fx-nav-items", this.$wizardEl).parent("nav");
        //console.log("elem.offset().top ",elem, elem.offset().top);
        container.animate({
            scrollTop: parseInt(elem.offset().top)
        }, 750);
    }

    /*         
     * ***********
     * PRIVATE 
     * ***********
    */
    var prepareSumaryItem = function (item) {
        var $elem;
        if (item.stepDecision) {
            $elem = $('<li />').addClass(FUXI.Wizard.steps.decisionClassName).append(item.title + ": ").append("<span>" + item.value + "</span>");
        }
        else {
            $elem = $('<li />').append(item.title + ": ").append("<span>" + item.value + "</span>");
        }

        return $elem;
    }

    // load wizard for each element in the document
    var loadWizard = function () {
        $("[data-wizard]").each(function () {
            var $this = $(this);
            var wizard = new Wizard($this);
            $this.data("wizard", wizard);
        });
    };
    
    if (options.isAsync) {
        //console.log("wizard init async!");
        loadWizard();
    }
    else {
        $(window).on('load', function () {
            //console.log("wizard init sync!");
            loadWizard();
        });
    }

};
FUXI.SliderTabs = {};

FUXI.SliderTabs.init = function (options) {

    var tabTmpl = '<li class="fx-status fx-dismissible fx-sortable" id="{{id}}" title="{{name}}">' +
            '<a href="#tab{{id}}" data-toggle="tab" id="fx-a-{{id}}" data-tab-id="{{id}}">' +
                '<i class="fx-ico-loading"></i>' +
                '<span class="fx-tab-title">{{name}}</span>' +
            '</a>' + '</li>';
            //'<button class="fx-del-tab" id="fx-btn-del-{{id}}" title="' + FUXI.Resources.SliderTabs.RemoveTab + '">' +
                //'<i class="glyphicon glyphicon-remove"></i>' +
            //'</button>' +
        //'</li>';

    var tabDismissibleTmpl = '<button class="fx-del-tab" id="fx-btn-del-{{id}}" title="' + FUXI.Resources.SliderTabs.RemoveTab + '">' +
                                '<i class="glyphicon glyphicon-remove"></i>' +
                            '</button>';

    var tabActionsTmpl = '<div style="position:absolute;" class="fx-actions-tab-hldr" >' +
                            '<div class="btn-group dropdown" fx-dropdown-attachToBody>' +
                                '<button id="fx-btn-action-{{id}}" type="button" class="fx-actions-tab dropdown-toggle" data-toggle="dropdown" aria-expanded="false">' +
                                    '<i class="fa fa-cog"></i>' + '&nbsp;' +
                                    '<i class="caret"></i>' +
                                '</button>' +
                                '<ul class="dropdown-menu" role="menu" aria-labelledby="single-button">' +
                                    '{{actionsList}}' +
                                '</ul>' +
                            '</div>' +
                         '</div>';

    var tabStatusTmpl = '<span class="fx-status-tab" id="fx-s-{{id}}" title="{{title}}">' +
                        '<i class="fuxicons fuxicons-{{status}} fx-status-{{status}}"></i>' +
                    '</span>';

    var tabDropdownTmpl = '<li data-tab-target-id="{{id}}">' +
            '<a data-toggle="tab" id="fx-dd-a-{{id}}" data-tab-id="{{id}}">' +
                '{{name}}' +
            '</a>' +
        '</li>';

    var defaults = {
        isAsync: false,
        animateDuration: 400,
        fixedIncrement: 80,
        tabTemplate: tabTmpl,
        tabDismissibleTemplate: tabDismissibleTmpl,
        tabActionsTemplate: tabActionsTmpl,
        tabStatusTemplate: tabStatusTmpl,
        tabDropdownTemplate: tabDropdownTmpl
    }
    //$.extend(null, options, defaults);
    options = $.extend(true, {}, defaults, options);

    $.fn.hasHorizontalScrollBar = function () {
        var elm = this.get(0);
        var iScrollWidth = elm.scrollWidth;
        var iOffsetWidth = elm.offsetWidth;
        var iDif = iScrollWidth - iOffsetWidth

        //return iScrollWidth > iOffsetWidth;
        return (iDif < 2) ? false : true;
    }

    /*
         * Returns if an element is in view, with regard to a given configuration.
         *
         * @param {HTMLElement}        elem
         * @param {Object}             config
         * 
         * @param {HTMLElement|Window} config.container
         * @param {number}             config.tolerance
         *
         * @returns {boolean}
        */
    var isInView = function (elem, config) {

        var containerWidth, rect, hTolerance, containerRect,
            container = config.container,
            $container = $(container),
            $elem = $(elem),
            elemInView = true;

        if (elem === container) throw new Error("Invalid container: is the same as the element");

        containerWidth = $container.width();

        hTolerance = containerWidth * (config.tolerance || 0);

        rect = $elem.position();
        containerRect = $container.position();
        rect = {
            left: rect.left - containerRect.left,
            right: ((rect.left - containerRect.left) + $elem.width()) - containerRect.left
        };

        elemInView = elemInView &&
            rect.left >= -hTolerance &&
            rect.left < containerWidth + hTolerance &&
            rect.right > -hTolerance &&
            rect.right <= containerWidth + hTolerance;

        return elemInView;
    }

    var getNextSelectableTab = function (sliderTab, tab) {
        
        //efectua a pesquisa para a direita
        var selectableTab = searchSelectableTab(sliderTab, tab, 0);

        //efectua a pesquisa para a esquerda
        if (selectableTab == null) {
            selectableTab = searchSelectableTab(sliderTab, tab, 1);
        }

        return (selectableTab);
    }
    var searchSelectableTab = function (sliderTab, tab, direction) {
        
        var tabs = sliderTab.$overview.find('li');
        var index = tabs.index(tab);
        var selectableTab = null;
        if (direction == 0) {
            if (index < (tabs.length - 1)) { //efectua a pesquisa para direita
                selectableTab = $(tabs[index + 1]);
                if (!tabIsSelectable($(selectableTab))) {
                    return (searchSelectableTab(sliderTab, selectableTab, direction));
                }
            }
        } else { //efectua a pesquisa para esquerda
            var newActiveIndex = index - 1;
            if (newActiveIndex >= 0) {
                selectableTab = $(tabs[newActiveIndex]);
                if (!tabIsSelectable(selectableTab)) {
                    return (searchSelectableTab(sliderTab, selectableTab, direction));
                }
            }
        }
        return (selectableTab);
    }
    var tabIsSelectable = function ($tab) {
        var isSelectable = $tab.hasClass('disabled') || $tab.is(":hidden"); 

        return !isSelectable;
    }

    // slider tab
    var SliderTabs = function ($tab) {
        var self = this;
        self.$sliderTabEl = $tab;

        var dtX = self.$sliderTabEl.data("fx-slider-tab-target-content");

        self.$viewport = self.$sliderTabEl.find('[data-fx-slider-tab-viewport]');
        self.$overview = self.$sliderTabEl.find('[data-fx-slider-tab-overview]');
        self.$contentContainer = (dtX != undefined && dtX.length > 0) ? $(dtX) : self.$sliderTabEl.find('[data-fx-slider-tab-content-wrapper]');

        self.$rightContainer = self.$sliderTabEl.find('[data-fx-slider-tab-right]');
        self.$right = self.$rightContainer.children('button');
        self.$leftContainer = self.$sliderTabEl.find('[data-fx-slider-tab-left]');
        self.$left = self.$leftContainer.children('button');

        self.$addActionContainer = self.$sliderTabEl.find('[data-fx-add-action-wrapper]');
        self.$add = self.$sliderTabEl.find('[data-fx-slider-tab-add-action]');
        self.showAdd = self.$addActionContainer.length > 0;
        if (self.showAdd) self.$sliderTabEl.addClass("fx-tabs-with-add-action");

        self.$leftContainer.addClass("hidden");
        self.$rightContainer.addClass("hidden");

        self.$dropdownContainer = self.$sliderTabEl.find('[data-fx-slider-tab-dropdown]');
        self.$dropdownTabOverview = self.$sliderTabEl.find('[data-fx-slider-tab-dropdown-overview]');

        self.$hintLeft = self.$sliderTabEl.find('[data-fx-slider-tab-hint-left]');
        self.$hintRight = self.$sliderTabEl.find('[data-fx-slider-tab-hint-right]');

        self.$left.off("mousedown.fuxi.slider.left").on("mousedown.fuxi.slider.left", $.proxy(self.left, self));
        self.$left.off("mouseup.fuxi.slider.left").on("mouseup.fuxi.slider.left", $.proxy(self.stopTabsScrolling, null, self, 'left'));

        self.$right.off("mousedown.fuxi.slider.right").on("mousedown.fuxi.slider.right", $.proxy(self.right, self));
        self.$right.off("mouseup.fuxi.slider.right").on("mouseup.fuxi.slider.right", $.proxy(self.stopTabsScrolling, null, self, 'right'));

        self.$overview.off("click.fuxi.tab.select").on("click.fuxi.tab.select", "li > a", $.proxy(self.selectTab, null, self));
        self.$dropdownTabOverview.off("click.fuxi.tab.select").on("click.fuxi.tab.select", "li > a", $.proxy(self.selectTab, null, self));

        self.$overview.off("click.fuxi.tab.remove").on("click.fuxi.tab.remove", "li > .fx-del-tab", $.proxy(self.removeTab, null, self));

        self.$inputFilter = self.$dropdownContainer.find('.fx-dropdown-search')
        FUXI.Utils.installKeyUpChangeEvent(self.$inputFilter, 'fuxi.tab.search');
        self.$inputFilter.on("keyup-change.fuxi.tab.search input.fuxi.tab.search paste.fuxi.tab.search", $.proxy(self.filterDropdownTabs, null, self));

        self.$dropdownContainer.on('shown.bs.dropdown', function () {
            setTimeout(function () {
                self.$inputFilter.focus();
            }, 10);
        });

        $(window).on('resize', $.proxy(self.handleResize, self));

        // handle sortable
        self.handleSortable();

        // call resize
        self.handleResize();
    };

    // event left
    SliderTabs.prototype.emitSlideToLeft = function () {
        var self = this;
        //console.log("emitTabSelected");
        self.$sliderTabEl.trigger({ 'type': 'left.fx.slider.tab', 'fxslidertabs': self });
    },
    SliderTabs.prototype.left = function () {
        var slider = this;
        try {
            var scrollLeft = slider.getScrollIncrement();
            slider.$viewport.stop().animate({ scrollLeft: '-=' + scrollLeft }, options.animateDuration, 'linear',
                function () {
                    if ($(this).get(0).scrollLeft === 0) {
                        slider.stopTabsScrolling(slider, 'left');
                    } else {
                        slider.left();
                    }
                });
        }
        catch (e) {
            console.log(e);
        }
    };
    // event right
    SliderTabs.prototype.emitSlideToRight = function () {
        var self = this;
        //console.log("emitTabSelected");
        self.$sliderTabEl.trigger({ 'type': 'right.fx.slider.tab', 'fxslidertabs': self });
    },
    SliderTabs.prototype.right = function () {
        var slider = this;
        try {
            var scrollLeft = slider.getScrollIncrement();

            slider.$viewport.stop().animate({ scrollLeft: '+=' + scrollLeft }, options.animateDuration, 'linear',
                    function () {
                        var x1 = (($(this).get(0).scrollWidth - $(this).width()) === $(this).get(0).scrollLeft);
                        if (x1) {
                            slider.stopTabsScrolling(slider, 'right');
                        } else {
                            slider.right();
                        }
                    }
                );
        }
        catch (e) {
            console.log(e);
        }
    };
    // event stopTabsScrolling
    SliderTabs.prototype.stopTabsScrolling = function (sliderTab, slideTo) {

        var self = this;
        try {
            // stop increasing scroll position
            sliderTab.$viewport.stop();

            sliderTab.handleButtonsVisibility();

            switch (slideTo) {
                case 'left':
                    sliderTab.emitSlideToLeft();
                    break;
                case 'right':
                    sliderTab.emitSlideToRight();
                    break;
            }

        }
        catch (e) {
            console.log(e);
        }
    };

    SliderTabs.prototype.slideToTab = function (tab) {
        var self = this;
        console.log("slideToTab: ", tab);

        var domElm = tab.get(0);
        var ofL = domElm.offsetLeft;

        // check element is visible            
        var isVis = isInView(domElm, { "container": self.$viewport.get(0) });
        if (isVis) { return; }

        // slide
        var sL = (self.$overview.children('li').index(tab) === 0) ? 0 : ofL - 10;
        self.$viewport.animate({ scrollLeft: sL }, 'fast', 'linear', function () {
            self.handleButtonsVisibility();
        });

    };

    SliderTabs.prototype.emitTabSelected = function (tab) {
        var self = this;
        //console.log("emitTabSelected");
        self.$sliderTabEl.trigger({ 'type': 'selected.fx.slider.tab', 'tab': tab, 'fxslidertabs': self });
    },
    SliderTabs.prototype.selectTab = function (sliderTab, event) {
        var self = this;

        // FUXI-752 2016-11-24        
        if (event.ctrlKey) {
            event.stopImmediatePropagation();
            return true;
        }

        /// unselect all li's in tabs
        sliderTab.$overview.children("li").removeClass("active");
        /// /// unselect all li's in tabs dropdown
        sliderTab.$dropdownTabOverview.children("li").removeClass("active");
        /// unselect container
        sliderTab.$contentContainer.children().removeClass("active");

        var tId = $(self).data("tab-id");
        var tab = $("#" + tId);
        //select tab
        tab.addClass("active");

        //Activa o bot�o de acc�es na tab seleccionada e remove das outras tabs
        var obj = $('.fx-actions-tab-hldr.show').parent().not('.active');
        obj.find('.fx-actions-tab-hldr.show').removeClass('show');
        if (tab.find(".fx-actions-tab-hldr").length) {
            tab.find(".fx-actions-tab-hldr").addClass('show');
        }
        

        // select dropdown tab
        var dTab = sliderTab.$dropdownTabOverview.children("li[data-tab-target-id=" + tId + "]");
        dTab.addClass("active");

        var tabContainer = sliderTab.$contentContainer.children("[data-tab-target-id=" + tId + "]");
        // select tab container
        tabContainer.addClass("active");

        sliderTab.slideToTab(tab);

        // emit tab selected
        sliderTab.emitTabSelected(tab);
    };

    SliderTabs.prototype.selectTabById = function (tabId) {
        //var tab = $('a[data-tab-id=' + tabId + ']', this.$sliderTabEl);
        var tab = $('a[data-tab-id=' + tabId + ']', this.$overview);
        tab.click();
    }

    SliderTabs.prototype.getScrollIncrement = function () {
        if (options.fixedIncrement > 0) return options.fixedIncrement;

        return this.$viewport.outerWidth(true);
    }
    SliderTabs.prototype.handleResize = function () {
        //console.log("resize...");

        var hasScroll = this.$viewport.hasHorizontalScrollBar();
        if (hasScroll) {
            this.$add.removeClass("hidden");
            this.$addActionContainer.addClass("hidden");

            this.$leftContainer.removeClass("hidden");
            this.$rightContainer.removeClass("hidden");

            this.$dropdownContainer.removeClass("hidden");
            this.$hintLeft.removeClass("hidden");
            this.$hintRight.removeClass("hidden");

            this.$sliderTabEl.addClass("fx-tabs-with-nav");

            this.$overview.attr("style", "padding-right:0;padding-left:0;");

        }
        else {
            this.$add.addClass("hidden");
            this.$addActionContainer.removeClass("hidden");

            this.$leftContainer.addClass("hidden");
            this.$rightContainer.addClass("hidden");

            this.$dropdownContainer.addClass("hidden");
            this.$hintLeft.addClass("hidden");
            this.$hintRight.addClass("hidden");

            this.$sliderTabEl.removeClass("fx-tabs-with-nav");

            this.$overview.removeAttr("style");

        }
        
        if (this.showAdd) {
            // add class no tabs        
            if (this.$overview.find('li').length == 0) {
                this.$viewport.addClass("fx-scrollable-no-tabs");
            }
            else { // remove class no tabs
                this.$viewport.removeClass("fx-scrollable-no-tabs");
            }
        }

        this.buttonsWidth = this.$leftContainer.outerWidth(true) + this.$rightContainer.outerWidth(true);

        this.handleButtonsVisibility();
    };
    SliderTabs.prototype.handleButtonsVisibility = function () {

        var sL = this.$viewport.get(0).scrollLeft;

        // left                    
        if (sL === 0) {
            this.$left.addClass("disabled");
        } else {
            this.$left.removeClass("disabled");
        }

        // right        
        var x1 = ((this.$viewport.get(0).scrollWidth - this.$viewport.width()) <= sL);
        if (x1) {
            this.$right.addClass("disabled");
        } else {
            this.$right.removeClass("disabled");
        }

    };

    SliderTabs.prototype.emitTabMoved = function (tab, fromIdx, toIdx) {
        var self = this;
        console.log('emitTabMoved');
        self.$sliderTabEl.trigger({ 'type': 'moved.fx.slider.tab', 'tab': tab, 'fromIndex': fromIdx, 'toIndex': toIdx, 'fxslidertab': self });
    },
    SliderTabs.prototype.handleSortable = function () {

        var fromIdx = 0,
            toIdx = 0,
            self = this,
            tab = null;

        this.$overview.sortable({
            //helper: "clone",
            //containment: "parent",
            axis: "x",
            items: "li",
            cancel: '.fx-not-sortable',
            revert: 100,
            distance: 0,
            delay: 200,
            forceHelperSize: true,
            forcePlaceholderSize: true,
            scrollSensitivity: 0,
            placeholder: 'fx-tab-sortable-hint',

            tolerance: "pointer",

            start: function (event, ui) {
                fromIdx = ui.item.index();
                ui.item.addClass('fx-tab-dragging');

                try {
                    // trigger hide elements
                    $(document).trigger(FUXI.Utils.eventsName.hideElements)
                } catch (e) {
                    //
                }
            },
            stop: function (event, ui) {
                ui.item.removeClass('fx-tab-dragging');
            },
            update: function (event, ui) {
                console.log("update fired", event, ui);

                toIdx = ui.item.index();
                console.log("From --> To:", fromIdx, toIdx);

                // fire event
                tab = ui.item;
                self.emitTabMoved(tab, fromIdx, toIdx);
            }

        }).disableSelection();

    };

    SliderTabs.prototype.emitTabAdded = function (tab) {
        var self = this;
        console.log('emitTabAdded');
        self.$sliderTabEl.trigger({ 'type': 'added.fx.slider.tab', 'tab': tab, 'fxslidertab': self });
    },
    SliderTabs.prototype.addTab = function (name, id, dismissible, sortable, selected, customParams, actions, actionsList) {
        var self = this;

       
        var html = options.tabTemplate;
        html = html.replace(new RegExp("{{name}}", "ig"), name)
            .replace(new RegExp("{{id}}", "ig"), id);

        // #ISSUE 691
        if (customParams && customParams.itemTemplParams) {
            for (var key in customParams.itemTemplParams) {
                html = html.replace(new RegExp("{{" + key + "}}", "ig"), customParams.itemTemplParams[key]);
            }            
        }

        var $tab = $(html);

        if (!dismissible || actions) {
            $tab.find('.fx-del-tab').remove();
        }
        if (!actions) {
            //$tab.find('.fx-actions-tab').remove();
            $tab.find('.fx-actions-tab-hldr').remove();
        }
        if (status === 'undefined') {
            $tab.find('.fx-status-tab').remove();
        }
        if (!sortable) {
            $tab.removeClass('fx-sortable').addClass("fx-not-sortable");
        }

        // custom params
        var ddLabel = "";
        if (customParams) {
            // pass through custom-params
            $tab.data("custom-params", JSON.stringify(customParams));

            // get dropdown label
            ddLabel = customParams.dropDownLabel;
        }

        //append dismisse button if exists
        if (dismissible && !actions) {
            var htmlDismissBtn = options.tabDismissibleTemplate.replace(new RegExp("{{id}}", "ig"), id);
            $tab.append(htmlDismissBtn);
        }

        //append actions menu
        if (actions === true) {
            var htmlActionsBtn = options.tabActionsTemplate.replace(new RegExp("{{id}}", "ig"), id);

            var dropdownMenuActions = '';
            if (typeof actionsList !== 'undefined' && actionsList !== null && typeof actionsList === 'object') {
                $.each(actionsList, function (index, item) {
                    htmlMenuItem = '<li>' + '<a href="{{action.action}}">{{action.label}}</a>' + '</li>';
                    htmlMenuItem = htmlMenuItem.replace(new RegExp("{{action.action}}", "ig"), item.action).replace(new RegExp("{{action.label}}", "ig"), item.label);
                    dropdownMenuActions+= htmlMenuItem;
                });
            }
            

            htmlActionsBtn = htmlActionsBtn.replace(new RegExp("{{actionsList}}", "ig"), dropdownMenuActions);
            $tab.append(htmlActionsBtn);

            $tab.find(".fx-actions-tab-hldr").on('click', function (event) {
                var state = $(event.currentTarget).hasClass('show');
                var tabActiva = $(event.currentTarget).parent().hasClass('active');
                var obj = $('.fx-actions-tab-hldr.show').parent().not('.active');
                obj.find('.fx-actions-tab-hldr.show').removeClass('show');
                if (!state)
                    $(event.currentTarget).toggleClass('show');
                
            });

            $tab.find(".fx-actions-tab-hldr").on('hide.bs.dropdown', function (event) {
                //var obj = $('.fx-actions-tab-hldr.show').parent().not('.active');
                //obj.find('.fx-actions-tab-hldr.show').removeClass('show');
                var obj = $(event.currentTarget).parent().not('.active');
                obj.find('.fx-actions-tab-hldr.show').removeClass('show');
            });
        }



        // append tab title
        self.$overview.append($tab);


        

        var htmlDd = options.tabDropdownTemplate;
        htmlDd = htmlDd.replace(new RegExp("{{name}}", "ig"), (ddLabel) ? ddLabel : name).replace(new RegExp("{{id}}", "ig"), id);

        // append tab to dropdown
        self.$dropdownTabOverview.append(htmlDd);

        self.handleResize();

        // select tab
        if (selected) {
            $("#fx-a-" + id).click();
            self.right();
        }

        self.emitTabAdded($tab);
    };
    SliderTabs.prototype.emitTabRemoved = function (tab) {
        var self = this;
        console.log('emitTabRemoved');
        self.$sliderTabEl.trigger({ 'type': 'removed.fx.slider.tab', 'tab': tab, 'fxslidertab': self });
    },
    SliderTabs.prototype.removeTab = function (sliderTab) {
        var self = this;

        var $tab = $(this).parents('li');
        var tabId = $tab.children('a[data-toggle="tab"]').attr('href');

        var isActive = $tab.hasClass('active');
                        
        // if your going to remove the active tab, get next selectable tab
        if (isActive) {
            //sliderTab.$overview.find('li:first a:first').tab('show');
            var sTab = getNextSelectableTab(sliderTab, $tab);
            if (sTab != null) {
                sliderTab.selectTabById(sTab.attr("id"));
            }
        }
        
        var tId = $tab.attr("id");

        // remove tab
        $tab.remove();

        // remove on dropdown
        sliderTab.$dropdownTabOverview.find('li[data-tab-target-id="' + tId + '"]').remove();

        //remove on content
        var tabContainer = sliderTab.$contentContainer.children("[data-tab-target-id=" + tId + "]").remove();

        // resize
        sliderTab.handleResize();

        //emit event
        sliderTab.emitTabRemoved($tab);

    };

    SliderTabs.prototype.emitAllTabsRemoved = function () {
        var self = this;
        console.log('emitAllTabsRemoved');
        self.$sliderTabEl.trigger({ 'type': 'removedAll.fx.slider.tab', 'fxslidertab': self });
    },
    SliderTabs.prototype.removeAllTabs = function () {
        var self = this;

        // remove tabs
        self.$overview.find('li').remove();

        // remove on dropdown
        self.$dropdownTabOverview.find('li[data-tab-target-id]').remove();

        //remove on content
        var tabContainer = self.$contentContainer.find("[data-tab-target-id]").remove();

        // resize
        self.handleResize();

        //emit event
        self.emitAllTabsRemoved();
    };

    SliderTabs.prototype.filterDropdownTabs = function (sliderTab) {
        var self = this;
        var str = self.value;

        sliderTab.$dropdownTabOverview.children('li').removeClass("hidden");
        sliderTab.$dropdownTabOverview.children('li').filter(function () {
            return !FUXI.Utils.like($(this).children("a").text(), str + "%");
        }).addClass("hidden");

    };

    SliderTabs.prototype.tabContentLoaded = function (tab, status, title) {
        if (tab) {
            //tab.children('a').find('.fx-ico-loading').hide();
            this.hideLoading(tab);
            if (status) {
                tab.addClass('fx-status');
                // append status 
                var staTmpl = options.tabStatusTemplate.replace(new RegExp("{{status}}", "ig"), status)
                                                       .replace(new RegExp("{{title}}", "ig"), title || '')
                                                       .replace(new RegExp("{{id}}", "ig"), tab.attr("id"));

                tab.append(staTmpl);
            }
        }
    };

    SliderTabs.prototype.hideLoading = function (tab) {
        if (tab) {
            tab.children('a').find('.fx-ico-loading').hide();
        }
    };
    SliderTabs.prototype.showLoading = function (tab) {
        if (tab) {
            tab.children('a').find('.fx-ico-loading').show();
        }
    };

    // load dynamic tabs 
    var loadSliderTab = function () {
        $("[data-fx-slider-tab]").each(function () {
            var $this = $(this);
            var sliderTab = new SliderTabs($this);
            $this.data("fxslidertab", sliderTab);
        });
    };

    if (options.isAsync) {
        //console.log("slider tabs init async!");
        loadSliderTab();
    }
    else {
        $(window).on('load', function () {
            //console.log("slider tabs init sync!");
            loadSliderTab();
        });
    }
};

FUXI.WidgetSelect = {};

(function ($, window, document, undefined) {

    var WidgetSelect = {
        init: function (options, elem) {
            console.log("init:");

            var self = this;
            self.elem = elem;
            self.$elem = $(elem);

            self.options = $.extend(true, {}, $.fn.widgetSelect.options, options);
            self.currentPage = 1;
            self.layout;
            self.pageSelectedAll = [];

            self.defaultErrorResult = { isValid: false, message: '' };

            // get elements used in the widget select
            var aux = "modal";
            if (self.options.openMode === 'inline') aux = 'fx-ws-inline';
            self.$widgetHeader = $('.' + aux + '-header', self.$elem);
            self.$widgetTitle = $('.' + aux + '-title', self.$elem);
            self.$widgetBody = $('.' + aux + '-body', self.$elem);
            self.$widgetContent = $('.' + aux + '-content', self.$elem);
            self.$widgetFooter = $('.' + aux + '-footer', self.$elem);
            self.widgetBodyWidth = 0; // value setted on shown event

            self.$widgetSelectedItemsContainer = $('.fx-widget-selected-items-container', self.$elem);
            self.$widgetSelectItemsRemoveAll = $("[data-remove-all]", self.$elem);
            self.$widgetSelectTotalItemsSelected = $("[data-num-items-selected]", self.$elem);
            self.$widgetSelectItemsMsg = $("[data-msg-items]", self.$elem);
            self.$widgetSelectTotalItems = $('[data-total-items]', self.$elem);

            self.$widgetSelectItemsContainer = $('.fx-widget-select-items-container', self.$elem);
            self.$widgetSelectItemsWraper = $('.fx-widget-select-choices-wrapper', self.$widgetSelectItemsContainer);
            self.$widgetSelectTableItemsChoices = $(".fx-table-widget-select-choices", self.$widgetSelectItemsWraper);
            self.$widgetSelectTableItemsChoicesContainer = $("tbody", self.$widgetSelectTableItemsChoices);
            self.$wsTree = $(".fx-widget-select-tree-container", self.$widgetSelectItemsWraper);

            self.$widgetSelectItem = $('.fx-widget-select-item', self.$elem);
            self.$wrapperWidgetSelectContent = $(".fx-widget-select-content", self.$elem);

            self.$wrapperWidgetPreviewHeader = $(".fx-widget-select-preview-header", self.$elem);
            self.$wrapperWidgetPreviewBody = $(".fx-widget-select-preview-body", self.$elem);
            self.$wrapperWidgetPreviewInfo = $(".fx-widget-select-preview-aux-info", self.$elem);

            self.$widgetSelectTableItemsChoicesOptions = $('.fx-widget-select-choices-options', self.$widgetSelectItem);
            self.$widgetSelectTableItemsChoicesOptions.hide();
            self.$choiceSelectItems = $(".fx-widget-select-choices-options-select", self.$widgetSelectTableItemsChoicesOptions);

            //self.$choicesOptionSelectAll = $('.fx-widget-select-choices-options-selectall', self.$widgetSelectTableItemsChoicesOptions);

            // paging
            self.$widgetSelectPagingContainer = $('.fx-widget-select-paging', self.$widgetSelectItem);
            self.$pagingPrevious = $('[data-paging-previous]', self.$widgetSelectPagingContainer);
            self.$pagingNext = $('[data-paging-next]', self.$widgetSelectPagingContainer);
            self.$pagingNumCurrentPage = $('[data-paging-num-current-page]', self.$widgetSelectPagingContainer);
            self.$pagingNumTotalPages = $('[data-paging-total-pages]', self.$widgetSelectPagingContainer);

            if (self.options.multiSelection && self.options.showPageOptionSelectAll && self.options.showMode === 'grid') {
                self.$widgetSelectPagingContainer.removeClass("hidden");
            } else {
                self.$widgetSelectPagingContainer.addClass("hidden");
            }

            // sorting
            self.$sortElements = $(".fx-widget-select-sort-column", self.$elem);

            // search
            self.$searchButton = $(".fx-widget-select-search-button", self.$elem);
            self.$searchText = $(".fx-widget-select-search-text", self.$elem);

            // selected items
            self.selectedItems = [];
            // selected items temp
            self.selectedItemsTemp = [];
            // items
            self.items = [];
            self.itemKeys = [];
            self.totalItems = 0;

            self.selectItemMandatory = self.options.selectItemMandatory || false;
            self.selectItemMandatoryMessage = self.options.selectItemMandatoryMessage || '';
            self.clientAddValidator = self.options.clientAddValidator || function () { return { isValid: true, message: '' }; };
            self.notificationCallback = self.options.notificationCallback;
            self.lazyLoadCallback = self.options.lazyLoadCallback;

            self.$btShowAdd = $(self.$elem).find('[data-ws-show-add]');
            self.$btShowSelect = $(self.$elem).find('[data-ws-show-select]');

            self.$btAddSave = $(self.$elem).find('[data-ws-add-save]');
            self.$btAddCancel = $(self.$elem).find('[data-ws-add-cancel]');

            self.$btSelect = $(self.$elem).find('[data-ws-select]');
            self.$btCancel = $(self.$elem).find('[data-ws-cancel]');

            // show or hide add view
            if (!self.options.showAddView || self.options.showMode === 'tree') self.$btShowAdd.hide();

            if (!self.options.showPreviewView) {
                self.$widgetSelectTableItemsChoices.find(".fx-preview-action").hide();
            }
            else {
                self.$widgetSelectTableItemsChoices.find(".fx-preview-action").show();
            }

            var $template = $("<dummy></dummy>").append($.trim(self.options.itemsTemplate));
            if (self.options.multiSelection) {
                $template.find("[data-uni-select]").remove();
                self.options.itemsTemplate = $template.html();

                if (self.options.showPageOptionSelectAll && self.options.showMode === 'grid') {
                    self.$widgetSelectTableItemsChoicesOptions.show();
                }

            } else {
                $template.find("[data-multi-select]").remove();
                self.options.itemsTemplate = $template.html();

                //self.$widgetSelectTableItemsChoicesOptions.hide();
            }

            if (self.options.allowDrag) {
                if (self.$widgetTitle.find("i.fx-drag").length === 0) {
                    var dragOpt = '<i class="fx-drag"></i>';
                    self.$widgetTitle.prepend(dragOpt).css("cursor", "move");
                }
                self.$widgetContent.draggable({ containment: "document", delay: 200, handle: self.$widgetTitle });
            } else {
                self.$widgetTitle.css("cursor", "default").find("i.fx-drag").remove();
                self.$widgetContent.draggable().draggable("destroy");
            }

            // add listeners
            self.addListeners();
        },

        selectedItem: function (id, text, temp, showPreview) {
            this.id = (id) ? id.toString() : '',
            this.text = (text) ? text.toString() : '';
            this.temp = temp;
            this.showPreview = (showPreview === undefined) ? true : showPreview;
        },

        emitShowWidgetSelected: function () {
            var self = this;
            console.log("emitShowWidgetSelected");
            self.$elem.trigger({ 'type': 'shown.fx.widgetselect', 'widgetselect': self });
        },
        shownWidgetSelect: function () {
            var self = this;

            console.log("shownWidgetSelect: ");

            self.$widgetSelectItem.removeClass('hidden');

            //SETS FOCUS ON INPUT SEARCH
            if (self.options.openMode === 'modal') {
                $(".fx-search-input input[type=text]", self.$widgetBody).focus();
            }
            //$(".fx-search-input input[type=text]", self.$widgetBody).focus();

            //RETRIEVES MODAL BODY WIDTH AND SETS THE SAME WIDTH TO THE ELEMENTS
            this.widgetBodyWidth = self.$widgetBody.width();
            this.$wrapperWidgetSelectContent.width(self.widgetBodyWidth);
            self.$widgetSelectItem.width(self.widgetBodyWidth);

            self.selectedItemsTemp = self.selectedItems.slice(0);

            self.layout = $(".select-model-layout", self.$elem).layout(self.options.layoutOptions);
            if (!self.options.showPreviewView) {
                self.layout.hide("east");
            }

            self.hidePreviewContent();

            if (self.options.showPreviewView) self.layout.open("east");
            self.layout.open("south");

            self.emitShowWidgetSelected();
        },
        hiddenWidgetSelect: function () {
            console.log("hiddenWidgetSelect...");
            var self = this;

            self.$widgetSelectItemsContainer.animate({
                left: 0
            });

            self.$btShowSelect.addClass('hidden');
            self.$btShowAdd.removeClass('hidden');

            self.$btSelect.removeClass('disabled');
            self.$btCancel.removeClass('disabled');

            //self.resetSelectedItems();
        },
        destroy: function () {
            console.log("destroy widget select...");
            var self = this;
            self.$elem.removeData("widgetselect");
            self.reset();

            // remove events
            self.removeAllEvents();
        },
        removeAllEvents: function () {
            var self = this;
            self.$sortElements.off('click.fx.widgetselect.sortby');
            self.$searchButton.off('click.fx.widgetselect.search');
            self.$btShowAdd.off('click.fx.widgetselect.showadd');
            self.$btShowSelect.off('click.fx.widgetselect.showselect');
            self.$btAddSave.off('click.fx.widgetselect.addsave');
            self.$btAddCancel.off('click.fx.widgetselect.addcancel');
            self.$btSelect.off('click.fx.widgetselect.selectconfirm');
            self.$btCancel.off('click.fx.widgetselect.selectcancel');
            self.$widgetSelectItemsRemoveAll.off('click.fx.widgetselect.removeall');
            self.$elem.off('click').off('click.fx.widgetselect.itemremove');
            self.$elem.off('shown.bs.modal.fx').off('hidden.bs.modal.fx');
            self.$elem.off('click.fx.widgetselect.itempreview');
            self.$elem.off('click.fx.widgetselect.rowclick').off('click.fx.widgetselect.inputclick');
            self.$choiceSelectItems.off('click.fx.widgetselect.selectallpage');
            self.$pagingPrevious.off('click.fx.widgetselect.previous');
            self.$pagingNext.off('click.fx.widgetselect.next');
            self.$elem.off('click.fx.widgetselect.rowclick').off('click.fx.widgetselect.inputclick');
        },

        handleLazyLoad: function () {
            var self = this;

            if (self.lazyLoadCallback !== undefined && self.totalItems > 0 && !self.options.showPageOptionSelectAll) {
                self.$widgetSelectItemsWraper.scroll(function () {
                    var $this = $(this);
                    if (Math.round($this.scrollTop() + $this[0].clientHeight) >= $this[0].scrollHeight) {
                        var numberOfPages = Math.ceil(self.totalItems / self.options.itemsPerPage);
                        if (self.currentPage <= numberOfPages) {
                            self.currentPage++;
                            if (typeof self.lazyLoadCallback === 'function') {
                                self.lazyLoadCallback(self.currentPage);
                            }
                            else if (typeof self.lazyLoadCallback === 'string') {
                                FUXI.Utils.executeFunctionByName(self.lazyLoadCallback, window, self.currentPage);
                            }
                        }
                    }
                });
            }
        },

        loadPage: function () {
            var self = this;
            console.log("load page: " + self.currentPage);

            // clear table
            self.$widgetSelectTableItemsChoicesContainer.empty().scrollTop();

            // call function to get new items
            if (typeof self.lazyLoadCallback === 'function') {
                self.lazyLoadCallback(self.currentPage);
            }
            else if (typeof self.lazyLoadCallback === 'string') {
                FUXI.Utils.executeFunctionByName(self.lazyLoadCallback, window, self.currentPage);
            }

            self.handlePaging();
        },

        //notification
        showNotification: function (type, message) {
            var self = this;

            if (typeof self.notificationCallback === 'function') {
                self.notificationCallback(type, message);
            }
            else if (typeof self.notificationCallback === 'string') {
                FUXI.Utils.executeFunctionByName(self.notificationCallback, window, type, message);
            }
            else {
                //toastr[type](message);
                console.log(type + ": " + message);
            }
        },

        addListeners: function () {
            var self = this;

            //remove all events
            self.removeAllEvents();
            // Add event listeners        
            self.$sortElements.on('click.fx.widgetselect.sortby', $.proxy(self.sortBy, null, self));
            self.$searchButton.on('click.fx.widgetselect.search', $.proxy(self.search, null, self));

            self.$btShowAdd.on('click.fx.widgetselect.showadd', $.proxy(self.showAdd, self));
            self.$btShowSelect.on('click.fx.widgetselect.showselect', $.proxy(self.showSelect, self));

            self.$btAddSave.on('click.fx.widgetselect.addsave', $.proxy(self.addSave, self));
            self.$btAddCancel.on('click.fx.widgetselect.addcancel', $.proxy(self.addCancel, self));

            self.$btSelect.on('click.fx.widgetselect.selectconfirm', $.proxy(self.selectConfirm, self));
            self.$btCancel.on('click.fx.widgetselect.selectcancel', $.proxy(self.selectCancel, self));

            self.$widgetSelectItemsRemoveAll.on('click.fx.widgetselect.removeall', $.proxy(self.removeAll, self));

            self.$elem.on('click.fx.widgetselect.itemremove', '[data-ws-remove]', $.proxy(self.itemRemove, null, self));;

            if (self.options.openMode === 'modal') {
                self.$elem.on('shown.bs.modal.fx', $.proxy(self.shownWidgetSelect, self))
                          .on('hidden.bs.modal.fx', $.proxy(self.hiddenWidgetSelect, self));
            }

            if (self.options.showPreviewView) {
                self.$elem.on('click.fx.widgetselect.itempreview', '[data-ws-preview]', $.proxy(self.itemPreview, null, self));
            }

            if (self.options.showMode === "grid") {
                if (self.options.multiSelection) {
                    self.$elem.on('click.fx.widgetselect.rowclick', '.fx-table-widget-select-choices tbody>tr td:not(:last-child)', function () { $(this).parent().find("input:checkbox").trigger('click.fx.widgetselect.inputclick'); })
                              .on('click.fx.widgetselect.inputclick', '.fx-table-widget-select-choices input:checkbox[data-multi-select]', $.proxy(self.itemClicked, null, self));

                    if (self.options.showPageOptionSelectAll) {

                        self.$choiceSelectItems.on('click.fx.widgetselect.selectallpage', function () {
                            //console.log("select all items of page...");
                            var checked = this.checked;

                            // save if current page have option select all checked
                            self.pageSelectedAll[self.currentPage] = checked;
                            //console.log(self.pageSelectedAll);

                            $.each(self.items, function (idx, item) {
                                if (!self.itemShowCheckbox(item)) return;

                                if (checked) {
                                    self.selectItem(item);
                                }
                                else {
                                    self.unselectItem(item);
                                }
                            });
                        });

                        self.$pagingPrevious.on('click.fx.widgetselect.previous', function () {
                            console.log("previous fired...");

                            self.currentPage--;
                            self.$choiceSelectItems.prop("checked", self.pageSelectedAll[self.currentPage] || false);
                            self.loadPage();
                        });
                        self.$pagingNext.on('click.fx.widgetselect.next', function () {
                            console.log("next fired...");

                            self.currentPage++;
                            self.$choiceSelectItems.prop("checked", self.pageSelectedAll[self.currentPage] || false);
                            self.loadPage();
                        });
                    }
                }
                else {
                    self.$elem.on('click.fx.widgetselect.rowclick', '.fx-table-widget-select-choices tbody>tr td:not(:last-child)',
                        function () {
                            if ($(this).parent().find("input:radio").data('show-checkbox') == false) return;

                            $(this).parent().find("input:radio").prop("checked", true);
                            $(this).parent().find("input:radio").trigger('click.fx.widgetselect.inputclick');
                        })
                        .on('click.fx.widgetselect.inputclick', '.fx-table-widget-select-choices input:radio[data-uni-select]', $.proxy(self.itemClicked, null, self));
                }
            }
            else if (self.options.showMode === "tree") {
                console.log("tree!");
            }

            //if (self.options.multiSelection) {
            //    self.$choicesOptionSelectAll.on('click', $.proxy(self.optionSelectAll, null, self));
            //}

        },
        emitItemPreview: function (id) {
            var self = this;
            var item = self.getItemById(id);
            self.$elem.trigger({ 'type': 'itempreview.fx.widgetselect', 'id': id, 'item': item, 'widgetselect': self });
        },
        itemPreview: function (ws) {
            console.log("itemPreview...");
            var self = this;

            //remove class active on previous clicked!
            // TODO
            // add class active
            //$(self).addClass("active");

            // get parent element
            var $p = $(self).parent();

            // get id
            var id = $p.data('id');

            // check if allow preview
            if ($p.data("show-preview") == false) {
                return;
            }

            // open preview (maybe is closed?)
            ws.layout.open("east");

            // trigger event item preview
            ws.emitItemPreview(id);
        },
        itemTreePreview: function (node) {
            console.log("itemTreePreview...");
            var self = this;

            // get id
            var id = node.id;

            // open preview (maybe is closed?)
            self.layout.open("east");

            // trigger event item preview
            self.emitItemPreview(id);
        },
        emitItemRemove: function (item) {
            var self = this;
            self.$elem.trigger({ 'type': 'itemremove.fx.widgetselect', 'id': item.id, 'item': item, 'widgetselect': self });
        },
        itemRemove: function (ws) {
            console.log("itemRemove...");
            var self = this;

            // get parent element
            var $p = $(self).parent();
            // get id & text
            var id = $p.data('id');
            var text = $p.data('text');

            var item = ws.getItemById(id);

            // call item unselect
            ws.unselectItem(new ws.selectedItem(id, text));

            // emit event 
            ws.emitItemRemove(item);
        },

        emitRemoveAll: function () {
            var self = this;
            self.$elem.trigger({ 'type': 'removeall.fx.widgetselect', 'widgetselect': self });
        },
        removeAll: function () {
            console.log("removeAll...");
            var self = this;

            $.each(self.selectedItemsTemp, function (idx, it) {
                // call item unselect
                self.unselectItem(it);
            });

            self.pageSelectedAll = [];
            self.$choiceSelectItems.prop("checked", false);

            // emit event 
            self.emitRemoveAll();
        },

        // add
        handleShowAddView: function (animCallback) {
            var self = this;
            self.$btShowAdd.addClass('hidden');
            self.$btShowSelect.removeClass('hidden');

            self.$btSelect.addClass('disabled');
            self.$btCancel.addClass('disabled');

            self.$widgetSelectItemsContainer.animate({
                left: "-=" + self.widgetBodyWidth
            }, 300, function () {
                if (typeof animCallback === 'function') {
                    animCallback.apply(self);
                }
            });
        },
        emitShowAdd: function () {
            var self = this;
            self.$elem.trigger({ 'type': 'showadd.fx.widgetselect', 'widgetselect': self });
        },
        showAdd: function () {
            var self = this;
            self.handleShowAddView.call(self, self.emitShowAdd);
        },

        handleShowSelectView: function (animCallback) {
            var self = this;
            self.$btShowSelect.addClass('hidden');
            self.$btShowAdd.removeClass('hidden');

            self.$btSelect.removeClass('disabled');
            self.$btCancel.removeClass('disabled');

            self.$widgetSelectItemsContainer.animate({
                left: "+=" + self.widgetBodyWidth
            }, 300, function () {
                if (typeof animCallback === 'function') {
                    animCallback.apply(self);
                }
            });
        },
        emitShowSelect: function () {
            var self = this;
            self.$elem.trigger({ 'type': 'showselect.fx.widgetselect', 'widgetselect': self });
        },
        showSelect: function () {
            var self = this;
            self.handleShowSelectView.call(self, self.emitShowSelect);
        },

        getAddClientValidator: function () {
            var self = this;
            return self.clientAddValidator;
        },
        saveFormIsValid: function () {
            var self = this;
            var result = self.defaultErrorResult;
            try {
                var clValidator = self.getAddClientValidator();
                if (typeof clValidator === 'string') {
                    if (clValidator) {
                        result = FUXI.Utils.executeFunctionByName(clValidator, window, { 'widgetselect': self });
                    }
                }
                else if (typeof clValidator === 'function') {
                    result = clValidator(self);
                }
            }
            catch (e) {
                console.log(e);
                result.message = e;
                //throw e;
            }
            return result;
        },

        //optionSelectAll: function (ws, e) {
        //    var $self = $(this);

        //},

        // add save
        emitAddSave: function () {
            var self = this;
            self.$elem.trigger({ 'type': 'addsave.fx.widgetselect', 'widgetselect': self });
        },
        // event addSave
        addSave: function () {
            var self = this;
            // call validate
            var result = self.saveFormIsValid();
            if (!result.isValid) {
                self.showNotification('error', result.message);
                return;
            }

            // emit add save event
            self.emitAddSave();
        },
        // add cancel
        emitAddCancel: function () {
            var self = this;
            self.$elem.trigger({ 'type': 'addcancel.fx.widgetselect', 'widgetselect': self });
        },
        // event addCancel
        addCancel: function () {
            var self = this;
            self.handleShowSelectView.call(self, self.emitAddCancel);
        },

        // show preview content
        showPreviewContent: function () {
            var self = this;
            // show div with info
            self.$wrapperWidgetPreviewInfo.addClass('hidden');
            self.$wrapperWidgetPreviewHeader.removeClass('hidden');
            self.$wrapperWidgetPreviewBody.show().removeClass('hidden');

            self.layout.resizeAll();
        },
        // hide preview content
        hidePreviewContent: function () {
            var self = this;

            // hide div with info
            self.$wrapperWidgetPreviewInfo.removeClass('hidden');
            self.$wrapperWidgetPreviewHeader.addClass('hidden');
            self.$wrapperWidgetPreviewHeader.addClass('hidden');

            self.layout.resizeAll();
        },

        //allow show preview
        itemShowPreview: function (item) {

            if (item.showPreview === undefined || item.showPreview === null) {
                return true;
            }

            return item.showPreview;
        },
        //allow show checkbox
        itemShowCheckbox: function (item) {

            if (item.showCheckbox === undefined || item.showCheckbox === null) {
                return true;
            }

            return item.showCheckbox;
        },

        // draw item
        drawItem: function (item, select) {
            var self = this;

            var template = $.trim(self.options.itemsTemplate);
            if (template !== undefined) {

                var arr = $.grep(self.selectedItemsTemp, function (o) { return o.id.toString() === item.id.toString() });
                var exist = arr.length > 0;

                var html = template;
                $.each(self.itemKeys, function (idx, k) {
                    html = html.replace(new RegExp("{{" + k + "}}", "ig"), (item[k] || ''));
                });

                html = html.replace(/{{checked}}/ig, (exist) ? "checked='checked'" : "")
                            .replace(/{{active}}/ig, (exist) ? "fx-active" : "");

                if (!self.itemShowPreview(item)) {
                    var $aux = $("<div/>").html(html);
                    $aux.find('[data-ws-preview]').addClass("fx-widget-select-tag-nopreview").attr('title', '');
                    $aux.find('[data-show-preview]').attr("data-show-preview", false);
                    $aux.find('.fx-widget-select-tag-preview-icon').hide();
                    html = $aux.html();
                }
                if (!self.itemShowCheckbox(item)) {
                    var $aux = $("<div/>").html(html);
                    if (self.options.multiSelection) {
                        $aux.find('[data-multi-select]').attr("data-show-checkbox", false).hide();
                    }
                    else {
                        $aux.find('[data-uni-select]').attr("data-show-checkbox", false).hide();
                    }
                    html = $aux.html();
                }

                self.$widgetSelectTableItemsChoicesContainer.append(html);
                if (!self.options.showPreviewView) {
                    self.$widgetSelectTableItemsChoicesContainer.find("[data-ws-preview]").hide();
                }
            }

            if (select) {
                self.selectItem(item);
            }
        },
        // draw selected item
        drawSelectedItem: function (item) {
            var self = this;

            if (self.options.multiSelection) {
                // remove, just in case
                self.$widgetSelectedItemsContainer.find("[data-id=" + item.id + "]").remove();
            } else {
                // remove all
                self.$widgetSelectedItemsContainer.find("[data-id]").remove();
            }

            var template = $.trim(self.options.selectedItemTemplate);
            if (template !== undefined) {
                var html = template;

                // templating
                var html = template.replace(/{{id}}/ig, item.id)
					    .replace(/{{text}}/ig, item.text);

                if (!self.itemShowPreview(item)) {
                    var $aux = $("<div/>").html(html);
                    $aux.find('[data-ws-preview]').addClass("fx-widget-select-tag-nopreview").attr('title', '');
                    $aux.find('.fx-widget-select-tag').attr("data-show-preview", false);
                    $aux.find('.fx-widget-select-tag-preview-icon').hide();
                    html = $aux.html();
                }

                self.$widgetSelectedItemsContainer.append(html);
                if (!self.options.showPreviewView) {
                    self.$widgetSelectedItemsContainer.find(".fx-widget-select-tag-preview-icon").hide();
                }
            }

        },

        // item select
        selectItem: function (item) {
            var self = this;
            console.log("selectItem:");

            // if item exit on selectedItemsTemp --> return
            var selItem = $.grep(self.selectedItemsTemp, function (o) { return o.id.toString() === item.id.toString() });
            if (selItem.length > 0) {
                return;
            }

            // add to array
            self.pushItem(item);
            // update total items selected
            self.updateTotalItemsSelected();

            // add to DOM
            self.drawSelectedItem(item);

            if (self.options.showMode === "grid") {
                if (self.options.multiSelection) {
                    var $elem = $('input:checkbox[value="' + item.id + '"]', self.$widgetSelectTableItemsChoicesContainer);
                }
                else {
                    // remove active
                    $('input:radio', self.$widgetSelectTableItemsChoicesContainer).parent().parent().removeClass("fx-active");
                    var $elem = $('input:radio[value="' + item.id + '"]', self.$widgetSelectTableItemsChoicesContainer);
                }
                $elem.prop('checked', true).parent().parent().addClass("fx-active");
            }
            else if (self.options.showMode === "tree") {
                console.log("tree...");
                self.$wsTree.jstree().select_node(item.id);
            }

            // show/ hide message no items
            self.toggleMessageNoItemsSelected();
        },
        // item unselect
        unselectItem: function (item) {
            console.log('unselectItem:');
            var self = this;
            // remove from object
            self.removeItem(item);
            // update total items selected
            self.updateTotalItemsSelected();

            // remove from DOM
            self.$widgetSelectedItemsContainer.find('[data-id=' + item.id + ']').remove();
            //uncheck option
            if (self.options.showMode === "grid") {


                if (self.options.multiSelection) {
                    var $elem = $('input:checkbox[value="' + item.id + '"]', self.$widgetSelectTableItemsChoicesContainer);
                }
                else {
                    var $elem = $('input:radio[value="' + item.id + '"]', self.$widgetSelectTableItemsChoicesContainer);
                }
                $elem.prop('checked', false).parent().parent().removeClass("fx-active");
            }
            else if (self.options.showMode === "tree") {
                console.log("tree...");
                self.$wsTree.jstree().deselect_node(item.id);
            }

            // show/ hide message no items
            self.toggleMessageNoItemsSelected();
        },
        //
        handleCheckItemsOption: function () {
            var self = this;
            if (!self.options.showPageOptionSelectAll) return;

            // get number options
            var nOpts = self.$widgetSelectTableItemsChoicesContainer.find('[data-multi-select]').length;

            // get number options checked
            var nOptsCk = self.$widgetSelectTableItemsChoicesContainer.find('[data-multi-select]:checked').length;

            var allCk = (nOpts > 0 && nOpts === nOptsCk);

            self.$choiceSelectItems.prop("checked", allCk);

            self.pageSelectedAll[self.currentPage] = allCk;

        },
        // event item clicked
        itemClicked: function (ws, e) {
            var self = this;

            // check if is allowed checkbox/ radio
            if ($(self).data("show-checkbox") === false) {
                return;
            }

            var checked, value;
            var item = new ws.selectedItem(0, '', true);

            var $container = $(self).closest('tr');
            //if ($(self).is('input'))
            {
                checked = self.checked;
                item.id = self.value;
                item.text = $container.data("text");
                item.showPreview = $container.data("show-preview");
            }
            //else {
            //    item.id = $(self).data("id");
            //    item.text = $(self).data("text");
            //    //var elem = $(self).find("input[value=" + item.id + "]").prop('checked', true).get(0);
            //    checked = true;
            //}

            ws.handleCheckItemsOption();

            if (checked) {
                ws.selectItem(item);
            }
            else {
                ws.unselectItem(item);
            }

            e.stopPropagation();
        },

        //show/ hide message when no items selected
        toggleMessageNoItemsSelected: function () {
            var self = this;
            var $eMsg = self.$elem.find('[data-msg-no-items]');
            if (self.$widgetSelectedItemsContainer.find('[data-id]').length > 0) {
                $eMsg.hide();
                self.$widgetSelectItemsMsg.show();
            }
            else {
                $eMsg.show();
                self.$widgetSelectItemsMsg.hide();
            }
        },

        // select
        emitSelectConfirm: function () {
            var self = this,
                selectedItemsHtml = '';

            if (self.options.returnSelectedItemsSorted) {
                self.sortSelectedItems();
            }
            if (self.options.returnSelectedItemsHtml) {
                selectedItemsHtml = self.getSelectedItemsHTML();
            }

            self.$elem.trigger({ 'type': 'selectconfirm.fx.widgetselect', 'widgetselect': self, 'selectedItems': self.selectedItems, 'selectedItemsHtml': selectedItemsHtml });
        },
        // event select
        selectConfirm: function () {
            var self = this;

            // get selected items
            self.selectedItems = self.getSelectedItems();

            //is mandatory?
            if (self.selectItemMandatory) {
                // check if exist elements on the selected list
                //var l = self.$widgetSelectedItemsContainer.find("[data-id]").length;
                var l = self.selectedItems.length;
                if (l === 0) {
                    self.showNotification('error', self.selectItemMandatoryMessage);
                    return;
                }
            }

            //clear temp
            //self.selectedItemsTemp = [];
            self.selectedItemsTemp = self.selectedItems.slice(0);

            // hide modal
            if (self.options.openMode === 'modal') self.$elem.modal('hide');

            // emit select event
            self.emitSelectConfirm();
        },

        // cancel
        emitSelectCancel: function () {
            var self = this;
            self.$elem.trigger({ 'type': 'selectcancel.fx.widgetselect', 'widgetselect': self });
        },
        // event cancel
        selectCancel: function () {
            var self = this;

            // is callend on hide
            //self.resetSelectedItems();

            // emit cancel event
            this.emitSelectCancel();
        },

        resetSelectedItems: function () {
            var self = this;

            // unselect temp
            var temps = $.grep(self.selectedItemsTemp, function (o) { return o.temp });
            $.each(temps, function (idx, it) {
                self.unselectItem(it);
            })

            if (self.options.multiSelection) {
                $.each(self.selectedItems, function (idx, it) {
                    self.selectItem(it);
                });
            } else {
                if (self.selectedItems.length > 0) {
                    self.selectItem(self.selectedItems[0]);
                }
            }

            //clear temp
            self.selectedItemsTemp = self.selectedItems.slice(0);
        },

        // add selected item to the list
        pushSelectedItem: function (item) {
            var self = this;

            if (self.options.multiSelection) {
                var exist = $.grep(self.selectedItems, function (o) { return o.id.toString() === item.id.toString() });
                if (exist.length === 0) {
                    //self.selectedItems.push(new self.selectedItem(item.id, item.text));
                    var selItem = new self.selectedItem(item.id, item.text,false, item.showPreview);
                    if (item.data) selItem.data = item.data;
                    self.selectedItems.push(selItem);
                }
            } else {
                //self.selectedItems = new Array(new self.selectedItem(item.id, item.text,false, item.showPreview));                  
                var selItem = new self.selectedItem(item.id, item.text,false, item.showPreview);
                if (item.data) selItem.data = item.data;
                self.selectedItems = new Array(selItem);
            }
        },
        // remove selected item from the list
        removeSelectedItem: function (item) {
            var self = this;

            var items = $.grep(self.selectedItems, function (o) { return o.id.toString() !== item.id.toString() });
            self.selectedItems = items;
        },

        itemsList: function (items, totalItems) {
            var self = this;
            self.totalItems = totalItems || 0;
            //console.log("totIt: " + self.totalItems);
            // load items
            if (items.length > 0) {
                self.items = items;
                // get all keys of first item
                self.itemKeys = (self.itemKeys.length === 0) ? Object.keys(items[0]) : self.itemKeys;
                wsLoadItems.call(self);

                // lazy loading
                self.handleLazyLoad();
            }

            //if (self.options.multiSelection)
            {
                //var n = self.currentPage * self.options.itemsPerPage;
                //self.$choicesOptionsItemsShow.html((n > totalItems) ? totalItems : n);
                self.$widgetSelectTotalItems.html(totalItems);
            }
        },
        selectedItemsList: function (items) {
            var self = this;
            self.selectedItems = (self.options.multiSelection) ? items || [] : (items && items.length > 0) ? new Array(items[0]) : [];

            self.selectedItemsTemp = self.selectedItems.slice(0);

            // update total items selected
            self.updateTotalItemsSelected();

            // load items
            wsLoadSelectedItems.call(self);

        },
        updateTotalItemsSelected: function () {
            this.$widgetSelectTotalItemsSelected.html(this.selectedItemsTemp.length);
        },

        removeItem: function (item) {
            var self = this;
            console.log('removeItem:');

            self.selectedItemsTemp = $.grep(self.selectedItemsTemp, function (o) { return o.id.toString() !== item.id.toString() });

        },
        pushItem: function (item) {
            var self = this;
            // get data and extend item
            var oIt = self.getItemById(item.id);
            if (oIt && oIt.data) {
                item.data = oIt.data;
            }
            if (self.options.multiSelection) {
                var selItem = $.grep(self.selectedItemsTemp, function (o) { return o.id.toString() === item.id.toString() });
                if (selItem.length === 0) {
                    self.selectedItemsTemp.push(item);
                }
            } else {
                self.selectedItemsTemp = new Array(item);
            }

            console.log(self.selectedItemsTemp);
        },

        reset: function () {
            var self = this;

            self.selectedItemsTemp = [];
            self.selectedItems = [];
            self.itemKeys = [];

            self.resetList();

            self.$widgetSelectedItemsContainer.empty().scrollTop();

            self.resetSortIcons();

        },

        resetList: function () {
            var self = this;

            self.pageSelectedAll = [];
            self.items = [];
            self.totalItems = 0;
            self.currentPage = 1;

            if (self.options.showPageOptionSelectAll) {
                self.$choiceSelectItems.prop("checked", false);
            };

            if (self.options.showMode === 'grid') {
                self.$widgetSelectTableItemsChoicesContainer.empty().scrollTop();
            }
            else if (self.options.showMode === 'tree') {
                self.$wsTree.jstree("destroy").empty().scrollTop();
            }

            self.toggleMessageNoItemsSelected();
        },

        handlePaging: function () {
            console.log("manage paging...");
            var self = this;
            var numPages = Math.ceil(self.totalItems / self.options.itemsPerPage);
            self.$pagingNumTotalPages.html(numPages);
            self.$pagingNumCurrentPage.html(self.currentPage);

            // handle buttons
            self.$pagingPrevious.removeClass("disabled");
            if (self.currentPage === 1) {
                self.$pagingPrevious.addClass("disabled");
            }
            self.$pagingNext.removeClass("disabled");
            if (self.currentPage === numPages) {
                self.$pagingNext.addClass("disabled");
            }
        },

        emitSortBy: function (column, desc) {
            var self = this;
            self.$elem.trigger({ 'type': 'sortby.fx.widgetselect', 'column': column, 'desc': desc, 'widgetselect': self });
        },
        sortBy: function (ws) {
            var $elem = $(this);
            var sort = $elem.data("sort");
            var desc = (sort == 1);
            var column = $elem.data("column");

            //handle sort icons
            ws.handleSortIcons($elem, desc);

            // emit event sortby
            ws.emitSortBy(column, desc);
        },
        handleSortIcons: function ($elem, desc) {

            this.$sortElements.addClass("hide");
            $(".fx-widget-select-sort-column[data-sort=0]").removeClass("hide");
            $elem.siblings("[data-sort=0]").addClass("hide");
            $elem.addClass("hide");
            if (desc) {
                $elem.siblings("[data-sort=-1]").removeClass("hide");
            }
            else {
                $elem.siblings("[data-sort=1]").removeClass("hide");
            }

        },
        resetSortIcons: function () {
            this.$sortElements.addClass("hide");
            $(".fx-widget-select-sort-column[data-sort=0]").removeClass("hide");
        },

        emitSearch: function (search) {
            var self = this;
            self.$elem.trigger({ 'type': 'search.fx.widgetselect', 'search': search, 'widgetselect': self });
        },
        search: function (ws, e) {
            e.preventDefault();

            var $elem = $(this);
            ws.resetSortIcons();

            // emit event search
            ws.emitSearch(ws.$searchText.val());
        },
        getJSTreeConfiguration: function () {
            var self = this,
                data = self.items
            plugins = self.options.jstreePlugins
            pluginConf = self.options.jstreePluginsConfiguration
            coreConf = self.options.jstreeCoreConfiguration;

            var defaultConf = {
                core: {
                    animation: 0,
                    themes: {
                        name: "fuxi",
                        responsive: false,
                        stripes: true,
                        dots: false,
                        icons: false
                    },
                    data: data,
                    multiple: self.options.multiSelection
                },
                plugins: ["themes", "html_data", "checkbox", "preview"],
                checkbox: { 'three_state': false },
                preview: {
                    showPreview: self.options.showPreviewView,
                    loadPreview: function (args) {
                        console.log(args);
                        switch (args.action) {
                            case 'preview':
                                //preview                                
                                self.itemTreePreview(args.node);
                                break;
                        }
                    }
                }
            };

            if (plugins) {
                defaultConf.plugins = defaultConf.plugins.concat(plugins);
            }

            if (pluginConf) {
                pluginConf.forEach(function (elem) {
                    defaultConf[elem.key] = elem.value;
                });
            }

            if (coreConf) {
                coreConf.forEach(function (elem) {
                    defaultConf.core[elem.key] = elem.value;
                });
            }

            return defaultConf;
        },
        getItemById: function (id) {
            var self = this;
            var item = null;
            if (self.options.showMode === 'tree') {
                var jstree = self.$wsTree.jstree();
                if (jstree) {
                    var node = jstree.get_node(id);
                    item = node.original;
                    item.data = node.data;
                }
            } else {
                if (self.items) {
                    item = $.grep(self.items, function (o) { return o.id.toString() === id.toString() });
                    if (item.length > 0) item = item[0];
                }
            }
            return item;
        },
        getSelectedItems: function () {
            var self = this;
            self.selectedItems = [];
            $.each(self.selectedItemsTemp, function (idx, it) {
                self.pushSelectedItem(it);
            });

            return self.selectedItems;
        },
        getSelectedItemsHTML: function () {
            var self = this,
                selectedItems = self.selectedItems,
                arrHtml = [];

            var template = $.trim(self.options.selectedItemReturnTemplate) || $.trim(self.options.selectedItemTemplate);
            if (template !== undefined) {
                var html = template;

                $.each(selectedItems, function (idx, item) {

                    // templating
                    var html = template.replace(/{{id}}/ig, item.id)
                            .replace(/{{text}}/ig, item.text);

                    if (!self.itemShowPreview(item)) {
                        var $aux = $("<div/>").html(html);
                        $aux.find('[data-ws-preview]').addClass("fx-widget-select-tag-nopreview").attr('title', '');
                        $aux.find('.fx-widget-select-tag').attr("data-show-preview", false);
                        $aux.find('.fx-widget-select-tag-preview-icon').hide();
                        html = $aux.html();
                    }
                    arrHtml.push(html);
                })
            };

            return arrHtml.join("");
        },

        sortSelectedItems: function () {
            var self = this;
            // sort selecteditems 

            if (!window._) {
                console.log("Lodash is not loaded!");

                self.selectedItems.sort(function (a, b) {
                    var aTxt = (typeof a.text !== 'string') ? a.text : a.text.toLowerCase();
                    var bTxt = (typeof b.text !== 'string') ? b.text : b.text.toLowerCase();;
                    return (aTxt == bTxt) ? 0 : (aTxt > bTxt) ? 1 : -1;
                });
            } else {
                self.selectedItems = _.sortByAll(self.selectedItems, ["text"]);
            }
        },
    };


    $.fn.widgetSelect = function (options) {
        return this.each(function () {
            var ws = Object.create(WidgetSelect);
            ws.init(options, this);

            $.data(this, 'widgetselect', ws);
        }).data('widgetselect');
    };

    $.fn.widgetSelect.options = {
        showAddView: true, // option to show or not the add view
        showPreviewView: true,
        allowDrag: true,
        showPageOptionSelectAll: false,
        selectItemMandatory: false, // select item is mandatory
        selectItemMandatoryMessage: '', // message to show when user do not select any item from the list
        clientAddValidator: undefined, // validator function for add view                
        notificationCallback: undefined, // notification function used with validators        
        lazyLoadCallback: undefined,

        layoutOptions: {
            defaults: {
                resizable: true,
                livePaneResizing: true,
                resizerTip: "Resize",
                spacing_closed: 10,
                spacing_open: 10
            },
            center: {
                //minSize: 100,
                contentSelector: '.fx-widget-select-choices-wrapper'
            },
            east: {
                size: 300,
                minSize: 100,
                maxSize: 450,
                contentSelector: '.fx-widget-select-preview-body'
            },
            south: {
                size: 100,
                minSize: 50,
                maxSize: 300,
                contentSelector: '.fx-widget-selected-items-container'
            },
            west: {
                size: 300,
                minSize: 100,
                maxSize: 450,
                contentSelector: '.fx-widget-select-preview-body'
            }
        },
        multiSelection: true,
        itemsPerPage: 20,
        // html template for draw item
        itemsTemplate: '<tr class="{{active}}" data-id="{{id}}" data-text="{{text}}" data-show-preview="true">' +
            '<td class="fx-option-select">' +
                '<input type="checkbox" data-multi-select name="chk-item-selected" value="{{id}}" {{checked}}>' +
               '<input type="radio" data-uni-select name="rd-item-selected" value="{{id}}" {{checked}}>' +
            '</td>' +
            '<td>' +
                '<span class="fx-truncate-table-cell">{{name}}</span>' +
            '</td>' +
            '<td>' +
                '<span class="fx-truncate-table-cell">{{description}}</span>' +
            '</td>' +
            '<td class="fx-widget-select-action-wrapper" title="pr�-visualizar" data-ws-preview>' +
                '<i class="fuxicons fuxicons-eye fx-widget-select-tag-preview-icon"></i>' +
            '</td>' +
        '</tr>',
        // html template for draw item selected
        selectedItemTemplate: '<div class="fx-widget-select-tag" data-id="{{id}}" data-text="{{text}}" data-show-preview="true">' +
            '<div class="fx-widget-select-tag-remove" title="remover" data-ws-remove>' +
            '<i class="glyphicon glyphicon-remove"></i>' +
            '</div>' +
            '<div class="fx-widget-select-tag-preview" title="pr�-visualizar" data-ws-preview>' +
            '<span class="fx-widget-select-tag-name">{{text}}</span>' +
            '<i class="fuxicons fuxicons-eye fx-widget-select-tag-preview-icon"></i>' +
            '</div>' +
            '</div>',
        // html template for selected item returned
        selectedItemReturnTemplate: '',
        showMode: "grid", // tree
        openMode: 'modal', // modal or inline

        jstreePlugins: [],
        jstreePluginsConfiguration: [],
        jstreeCoreConfiguration: [],

        returnSelectedItemsSorted: false,
        returnSelectedItemsHtml: false
    };

    wsLoadItems = function () {

        var self = this;
        if (self.options.showMode === 'grid') {
            self.$widgetSelectTableItemsChoices.show();
            self.$wsTree.hide();

            $.each(self.items, function (idx, item) {
                // draw item
                self.drawItem(item, self.pageSelectedAll[self.currentPage] || false);
            });

            // handle check
            self.handleCheckItemsOption();

            // handle pagging
            self.handlePaging();
        }
        else if (self.options.showMode === 'tree') {
            self.$wsTree.show();
            self.$widgetSelectTableItemsChoices.hide();

            // get jstree configuration
            var jsConf = self.getJSTreeConfiguration();
            self.$wsTree.jstree(jsConf)
                .on('select_node.jstree', function (event, data) {
                    self.selectItem(new self.selectedItem(data.node.id, data.node.text, (data.event) ? true : false, data.node.li_attr.showpreview));
                })
                .on('deselect_node.jstree', function (event, data) {
                    self.unselectItem(new self.selectedItem(data.node.id, data.node.text));
                })
                .on('loaded.jstree', function (event, data) {
                    $.each(self.selectedItems, function (idx, item) {
                        data.instance.select_node(item.id);
                    });
                })
                .on('ready.jstree', function (event, data) {
                    // remove checkbox
                    $("li[showcheckbox=false] > a > .jstree-checkbox", this).hide();
                })
                .on('open_node.jstree', function (event, data) {
                    // remove checkbox
                    $("li[showcheckbox=false] > a > .jstree-checkbox", this).hide();
                });
        }

        self.layout.resizeAll();
    };
    wsLoadSelectedItems = function () {
        var self = this;
        var htmlSel = "";
        $.each(self.selectedItems, function (idx, item) {
            // draw selected item
            self.drawSelectedItem(item)

            // push to the list
            self.pushSelectedItem(item);
        });

        // show/ hide message no items
        self.toggleMessageNoItemsSelected();
    };

})(jQuery, window, document);
(function ($, undefined) {
    "use strict";
    if (!$.jstree || $.jstree.plugins === undefined) return;

    var iElPreview = $("<div class='fx-jstree-preview'><i class='fuxicons fuxicons-eye' data-action='preview'></i></div>").get(0);
    
    $.jstree.defaults.preview = {
        loadPreview : $.noop,
        showPreview: true
    };
    $.jstree.plugins.preview = function (options, parent) {
        this.bind = function () {
            parent.bind.call(this);
            this.element
                .on("click.jstree", ".fx-jstree-preview", $.proxy(function (e) {
                    e.stopImmediatePropagation();
                    this.settings.preview.loadPreview.call(this, { "node": this.get_node(e.target), "action": e.target.getAttribute("data-action") });
                }, this));
        };
        this.teardown = function () {
            if (this.settings.preview) {
                this.element.find(".fx-jstree-actionbuttons").remove();
            }
            parent.teardown.call(this);
        };
        this.redraw_node = function (obj, deep, callback) {
            obj = parent.redraw_node.call(this, obj, deep, callback);            
            var showPreview = (($(obj).attr("showpreview") === undefined) ? "true" : $(obj).attr("showpreview"));
            if (obj && showPreview === "true" && this.settings.preview.showPreview) {
                var tmpP = iElPreview.cloneNode(true);
                tmpP.id = "previewNode_" + obj.id;
                obj.insertBefore(tmpP, obj.childNodes[2]);
            }

            return obj;
        };
    };
})(jQuery);
// Adds the DetachableDropdowns to the global FUXI namespace.
FUXI.DetachableDropdowns = {};

FUXI.DetachableDropdowns.init = function () {
    'use strict';
    var $body = $('body');

    $('[data-rel-dropdown-detach]').on('click', function () {
        var $relPanel = $('#' + this.getAttribute('data-rel-dropdown-detach')),
            $relButton = $('button[data-rel-dropdown="' + this.getAttribute('data-rel-dropdown-detach') + '"]'),
            isDetached = $relPanel.hasClass('is-detached'),
            $actionIcon = $relPanel.find('[data-rel-dropdown-detach] i');

        $relPanel.detach();

        if (isDetached) {
            $relButton.after($relPanel);
            $relPanel.attr('style', 'display: block;').removeClass('is-detached').draggable('destroy');
            $actionIcon.removeClass('fuxicons-restore-from-window').addClass('fuxicons-open-in-window').attr('title', 'destacar painel (cf)');
        } else {
            $body.append($relPanel);
            $actionIcon.removeClass('fuxicons-open-in-window').addClass('fuxicons-restore-from-window').attr('title', 'restaurar painel');
            $relPanel.addClass('is-detached').draggable();
        }
    });
};
$(function () {
    // initialize onready
    FUXI.Utils.onReady();

    //initialize utils
    FUXI.Utils.init();
});