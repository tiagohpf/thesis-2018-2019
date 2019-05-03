// init componente
(function ($, window, document, undefined) {

    /*
     * merge two objects and remove duplicates 
     * o1
     * o2
     * removeDuplicates
     * key
     */
    function mergeObjects(o1, o2, removeDuplicates, key) {

        var mObj = _.union(o1, o2);
        //console.table(mObj);
        mObj = _.uniq(mObj, key);
        //console.table(mObj);
        return mObj;

    };

    /*
     * remove objects 
     * o1: 
     * o2: objects to remove from o1
     */
    function removeObjectsById(o1, o2) {

        _.forEach(o2, function (it, idx) {
            o1 = _.reject(o1, { 'id': it.id });
        });

        //console.table(o1);
        return o1;
    };

    var SelectBoxTree = {

        init: function (options, elem) {
            var self = this;
            self.elem = elem;
            self.$elem = $(elem);
            self.filterItems = null;
            self.selectBoxDropActive = false;

            self.options = $.extend(true, {}, $.fn.selectBoxTree.options, options);

            //guardar os selecteditems iniciais
            self.originalSelectedItems = self.options.selectedItems;

            self.$selectionContainer = $('.fx-ms-selection-container', self.$elem);
            self.$selectionChoices = $('.fx-ms-choices', self.$selectionContainer);
            self.$expandArrow = $('.fx-ms-expand-arrow', self.$selectionContainer);

            self.$dropdownContainer = $('.fx-ms-dropdown', self.$elem);

            self.$searchContainer = $('.fx-ms-search-container', self.$dropdownContainer);
            self.$selectAllContainer = $('.fx-ms-select-all-container', self.$dropdownContainer);

            self.$dropdownTree = $('.fx-ms-dropdown-tree', self.$dropdownContainer);
            self.$dropdownGrid = $('.fx-ms-dropdown-grid', self.$dropdownContainer);
            self.$searchField = $('.fx-ms-search', self.$dropdownContainer);

            self.selectAllSelector = '.fx-ms-select-all';
            //self.choiceSelector = '.fx-ms-search-choice';
            self.deleteChoiceSelector = '.fx-ms-search-choice-close';
            self.itemMultiSelectSelector = 'li input:checkbox[data-multi-select]';
            self.itemUniSelectSelector = 'li a[data-uni-select]';

            self.inputValues = $('.fx-ms-input-values', self.$elem).eq(0);

            // initialize markup
            self.initMarkup();

            // add listeners
            self.addListeners();

            if (self.options.disabled) {
                self.setDisable();
            } else {
                if (self.options.showMode === 'grid') {
                    // load grid data                        
                    self.loadGrid();
                    self.$dropdownTree.addClass("hidden");
                    self.$dropdownGrid.removeClass("hidden");
                }
                else {
                    // load tree data                        
                    self.$dropdownTree.removeClass("hidden");
                    self.loadTree();
                    self.$dropdownGrid.addClass("hidden");
                }
            }
            // fill input values
            self.fillInputValue();

            //window resize
            self.winResize();

            // scrollHandler
            self.scrollHandler();
        },

        appendDropdownTo: function (to) {
            var self = this;

            self.$dropdownContainer.appendTo(to);
        },
        elementPosition: function (doNotRun) {
            var self = this;
            var $dropdown = self.$dropdownContainer;

            var $container = self.$elem;
            var $window = $(window);

            var isCurrentlyAbove = $dropdown.hasClass('fx-ms-dropdown-above');

            var newDirection = null;

            var position = $container.position();
            var offset = $container.offset();
            var container = {
                height: $container.outerHeight(false),
                width: $container.outerWidth(false),
                top: offset.top
            };
            container.bottom = offset.bottom = offset.top + container.height

            var bb = parseInt($container.css("border-bottom-width")) || 0;

            var dropdown = {
                height: $dropdown.outerHeight(false)
            };

            var viewport = {
                top: $window.scrollTop(),
                bottom: $window.scrollTop() + $window.height()
            };

            var height = container.height;
            var dropTop = offset.top + height;
            var dropHeight = dropdown.height;
            var windowHeight = $window.height();
            var viewportBottom = $window.scrollTop() + windowHeight;

            var enoughRoomBelow = dropTop + dropHeight <= viewportBottom,
                enoughRoomAbove = (offset.top - dropHeight) >= $window.scrollTop();

            var css = {
                left: offset.left,
                top: container.bottom - bb,
                width: container.width
            };

            if (isCurrentlyAbove) {
                if (!enoughRoomAbove && enoughRoomBelow) {
                    newDirection = "below";
                }
            } else {
                if (!enoughRoomBelow && enoughRoomAbove) {
                    newDirection = "above";
                }
            }

            if (!enoughRoomAbove && !enoughRoomBelow) {
                newDirection = "below";
            }

            if (newDirection == 'above' || (isCurrentlyAbove && newDirection !== 'below')) {
                css.top = container.top - dropdown.height;
            }

            if (newDirection != null) {
                $dropdown
                  .removeClass('fx-ms-dropdown-below fx-ms-dropdown-above')
                  .addClass('fx-ms-dropdown-' + newDirection);
                $container
                  .removeClass('fx-ms-container-below fx-ms-container-above')
                  .addClass('fx-ms-container-' + newDirection);
            }

            $dropdown.css(css);
            if (!doNotRun) {
                setTimeout(function () {
                    self.elementPosition(true);
                }, 50);
            }
        },
        winResize: function () {
            var self = this;
            var resizeEvt;
            $(window).on('resize', function () {
                clearTimeout(resizeEvt);
                resizeEvt = setTimeout(function () {
                    if (!self.selectBoxDropActive) return;
                    //code to do after window is resized
                    self.elementPosition();
                }, 100);
            });
        },

        scrollHandler: function () {
            var self = this;
            var scrollEvt;
            self.$elem.closest('.modal').scroll(function () {
                clearTimeout(scrollEvt);
                scrollEvt = setTimeout(function () {
                    if (!self.selectBoxDropActive) return;
                    //code to do after modal scroll
                    self.elementPosition();
                }, 100);
            });

            $(window).on('DOMMouseScroll mousewheel', function (evt) {
                if ($(evt.target).closest('.fx-ms-dropdown').length > 0) {
                    return;
                }
                self.closeDropdown();
            });
        },

        destroy: function () {
            console.log("destroy selectbox tree...");
            var self = this;
            // clear markup
            self.closeDropdown();

            self.$expandArrow.removeClass("hidden");
            self.$selectionContainer.removeClass('fx-ms-selection-container-multi').addClass('fx-ms-selection-container');

            self.$selectionChoices.empty();
            self.$dropdownTree.removeClass("hidden");
            self.$dropdownTree.jstree("destroy");
            self.$dropdownTree.empty();

            self.$dropdownGrid.addClass("hidden");
            self.$dropdownGrid.find("ul").empty();

            self.$selectAllContainer.find(self.selectAllSelector).prop("checked", false);
            self.inputValues.val('');

            self.$elem.removeData("ms");
        },
        addListeners: function () {
            var self = this;
            // remove listeners first
            self.removeListeners();

            // add listeners
            self.$selectionContainer.on('click.ms.dropdown', $.proxy(self.triggerDropdown, self));

            self.$selectionChoices.on('click.ms.deletechoice', self.deleteChoiceSelector, $.proxy(self.unselectItemChoice, self));
            self.$searchField.on('keyup.ms.search', $.proxy(self.handleSearch, self));

            self.$selectAllContainer.find(self.selectAllSelector).on('click.ms.selectall', $.proxy(self.handleSelectAll, self));

            // events for the tree are in loadTree function    
            // events for the grid are in loadGrid function
        },
        removeListeners: function () {
            var self = this;

            self.$selectionContainer.off('click.ms.dropdown');
            self.$selectionChoices.off('click.ms.deletechoice');
            self.$searchField.off('keyup.ms.search');
            self.$selectAllContainer.off('click.ms.selectall');

            if (self.options.showMode === 'grid') {
                self.$elem.off('click.ms.inputclick');
            }

            $(document).off("click.ms.outer");

        },
        initMarkup: function () {
            var self = this;

            self.$elem.addClass('fx-ms-focusser');

            //for focus                    
            var id = self.$elem.prop('id');
            var inpFocusser = $('<input class="sr-only" id="focusser-' + id + '" />');
            self.$elem.append(inpFocusser);
            $("label[for='" + id + "']").prop("for", "focusser-" + id);

            inpFocusser.on("focus", function () {
                self.$elem.addClass("fx-ms-has-focus");
            }).on("blur", function () {
                self.$elem.removeClass("fx-ms-has-focus");
            }).on("keydown", function (e) {
                // ENTER
                if (e.which == 13) {

                    if (e.altKey || e.ctrlKey || e.shiftKey || e.metaKey) return;

                    self.triggerDropdown();
                    //e.preventDefault(); 
                    e.stopPropagation();
                }
            });
            // ---------------------------

            if (self.options.showMode === 'grid') {
                var $template = $("<dummy></dummy>").append($.trim(self.options.gridItemTemplate));
                if (self.options.multiple) {
                    $template.find("label[data-uni-select]").remove();
                }
                else {
                    $template.find("label[data-multi-select]").remove();
                }
                self.options.gridItemTemplate = $template.html();
            }

            if (self.options.multiple) {
                //self.$expandArrow.addClass("hidden");
                self.$selectionContainer.removeClass('fx-ms-selection-container').addClass('fx-ms-selection-container-multi');
            } else {
                //self.$expandArrow.removeClass("hidden");
                self.$selectionContainer.addClass('fx-ms-selection-container').removeClass('fx-ms-selection-container-multi');
            }

            (self.options.fullWidth) ? self.$elem.addClass("full-width") : self.$elem.removeClass("full-width");

            (self.options.showSearch) ? self.$searchContainer.removeClass("hidden") : self.$searchContainer.addClass("hidden");

            (self.options.showSelectAll && self.options.multiple) ? self.$selectAllContainer.removeClass("hidden") : self.$selectAllContainer.addClass("hidden");;

            self.$searchField.attr("placeholder", self.options.searchPlaceholder);

            self.setSelectedPlaceholder();
        },
        loadTree: function () {
            var self = this;

            // get jstree configuration
            var jsConf = self.getJSTreeConfiguration();
            var tree = self.$dropdownTree.jstree(jsConf);
            //on('select_node.jstree', $.proxy(self.selectItemTree, self))
            //.on('deselect_node.jstree', $.proxy(self.unselectItemTree, self))
            //.on('select_node.jstree', function (ev) { /*ev.stopImmediatePropagation();*/ })
            //.on('deselect_node.jstree', function (ev) { /*ev.stopImmediatePropagation();*/ })
            //.on('check_node.jstree', function (ev) { console.log("check_node.jstree", ev, data) })
            tree.on('click.jstree', function (ev) { ev.stopImmediatePropagation(); })
                .on('changed.jstree', function (ev, data) {
                    //console.log("changed.jstree", ev, data);

                    if (data.action === 'select_node') {
                        self.selectItemTree(data.event, data);
                    } else if (data.action === 'deselect_node') {
                        self.unselectItemTree(data.event, data);
                    }

                })
                .on('loaded.jstree', function (ev, data) {
                    self.selectSelectedItems();
                    self.renderSelectedItems(true);
                })
                .on('search.jstree', function (ev, data) {
                    //console.log([ev, data]);
                    self.filterItems = [];
                    $("li.jstree-node:visible", self.$dropdownTree).each(function () {
                        var item = _.find(self.options.items, { 'id': this.id });
                        if (item) self.filterItems.push(item);
                    });

                    //console.table(self.filterItems);
                })
                .on('clear_search.jstree', function (ev, data) {
                    //console.log(["clear search", ev, data]);
                    self.filterItems = null;
                    self.updateSelectAll();
                })
                .on('after_open.jstree', function (ev, data) {
                    //console.log(["after open", ev, data]);
                    self.elementPosition();
                })
                .on('after_close.jstree', function (ev, data) {
                    //console.log(["after close", ev, data]);
                    self.elementPosition();
                });
        },
        loadGrid: function () {
            var self = this;

            // get grid container
            var $container = self.$dropdownGrid.find("ul");

            // render markup   
            var html = [];
            var items = self.filterItems || self.options.items;
            $.each(items, function (idx, it) {
                html.push(self.options.gridItemTemplate.replace(/{{ID}}/gi, it.id).replace(/{{TEXT}}/gi, it.text));
            });
            $container.html(html.join(""));

            // set listeners            
            if (self.options.multiple) {
                $container.find(self.itemMultiSelectSelector).off('click.ms.inputclick').on('click.ms.inputclick', $.proxy(self.handleItemGridClick, self));
            }
            else {
                $container.find(self.itemUniSelectSelector).on('click.ms.inputclick', $.proxy(self.handleItemGridClick, self));
            }

            // select selected items
            self.selectSelectedItems();

            // render selected items
            self.renderSelectedItems(true);
        },
        openDropdown: function () {
            var self = this;
            self.selectBoxDropActive = true;

            self.appendDropdownTo('body');

            self.elementPosition();

            self.$dropdownContainer.removeClass("hidden");

            self.$selectionContainer.addClass("fx-ms-container-active");

            self.$expandArrow.addClass("fx-ms-expanded-arrow");

            self.$elem.addClass("fx-ms-wrapper-opened");

            //self.$elem.focus();
            self.$searchField.focus();

            // attach event
            $(document).on("mousedown.ms.outside", $.proxy(self.outsideClick, self));

            self.$elem.closest(".fx-overflow").on("wheel", function () { return false; });

            //self.elementPosition();
        },
        closeDropdown: function () {
            var self = this;
            self.selectBoxDropActive = false;

            self.appendDropdownTo(self.$elem);

            self.$dropdownContainer.addClass("hidden");
            self.$selectionContainer.removeClass("fx-ms-container-active");

            self.$expandArrow.removeClass("fx-ms-expanded-arrow");

            self.$elem.removeClass("fx-ms-wrapper-opened");

            // dettach event
            $(document).off("mousedown.ms.outside");

            self.$elem.closest(".fx-overflow").off("wheel");
        },
        triggerDropdown: function () {
            //console.log(["triggerDropdown", this]);
            var self = this;
            if (!self.selectBoxDropActive) {
                return self.openDropdown();
            }

            self.closeDropdown();
        },
        outsideClick: function (e) {
            var self = this;

            if (!self.selectBoxDropActive) return;
            var isChild = $.contains(self.$dropdownContainer.get(0), e.target);
            var isOwner = $.contains(self.elem, e.target);;
            if (!isChild && !isOwner) {
                self.closeDropdown();
            }
        },

        emitSelectAll: function () {
            var self = this;
            self.$elem.trigger({ 'type': 'selectall.fx.selectboxtree', 'ms': self });
            console.log("selectall event...");
        },
        emitUnselectAll: function () {
            var self = this;
            self.$elem.trigger({ 'type': 'unselectall.fx.selectboxtree', 'ms': self });
            console.log("unselectall event...");
        },
        handleSelectAll: function (e) {
            var self = this;

            if (!self.options.multiple) return;

            var $target = $(e.currentTarget);

            // check all items
            if ($target.is(":checked")) {
                (self.options.showMode === 'grid') ? self.selectAllGrid() : self.selectAllTree();

                // emit select all
                self.emitSelectAll();
            } else {
                //(self.options.showMode === 'grid') ? self.unselectAllGrid() : self.unselectAllTree();
                self.clearAll();

                // emit unselect all
                self.emitUnselectAll();
            }
        },

        emitDeselectedItem: function () {
            var self = this;
            self.$elem.trigger({ 'type': 'deselecteditem.fx.selectboxtree', 'ms': self });
            console.log("deselected item event...");
        },
        unselectItemTree: function (ev, o) {
            if (!o.event) return;

            var self = this,
                item = o.node.original;

            if (item[self.options.selectableName] && o.changed) {
                $.each(o.changed.deselected, function (idx, nodeID) {
                    item = o.instance.get_node(nodeID).original;
                    if (!item[self.options.selectableName]) {
                        self.unselectItem(item);
                    }
                });
            } else {
                if (o.changed) {
                    $.each(o.changed.deselected, function (idx, nodeID) {
                        item = o.instance.get_node(nodeID).original;
                        if (!item[self.options.selectableName]) {
                            self.unselectItem(item);
                        }
                    });
                } else {
                    if (!item[self.options.selectableName]) {
                        self.unselectItem(item);
                    }
                }
            }
        },
        unselectItemChoice: function (ev) {
            ev.stopPropagation();

            var self = this,
                id = $(ev.currentTarget).data("item-id");

            if (item === "") {
                //(self.options.showMode === 'grid') ? self.unselectAllGrid() : self.unselectAllTree();
                self.clearAll();
                return;
            }
            var item = self.getItemById(id);
            if (self.options.showMode === 'grid') {
                // deselect item grid
                var sctor = (self.options.multiple) ? self.itemMultiSelectSelector + '[value=' + item.id + ']' : self.itemUniSelectSelector + '[value=' + item.id + ']';
                self.$dropdownGrid.find(sctor).prop("checked", false).closest('.fx-ms-grid-element').removeClass('fx-ms-grid-element-selected'); // don't trigger event click
            } else {
                // deselect tree node
                self.$dropdownTree.jstree(true).deselect_node(item.id, false);// do not suppress change event
            }

            // process unselect item
            self.unselectItem(item);
        },
        unselectItem: function (item) {
            var self = this;

            // remove item from object
            self.removeSelectedItem(item);

            // render init selectedItems
            self.renderSelectedItems(true);

            // emit event
            self.emitDeselectedItem();
        },

        unselectAllTree: function () {
            var self = this;

            // unselect the whole jstree control
            self.$dropdownTree.jstree("uncheck_all");
            // remove all from selected
            self.options.selectedItems = [];
            self.renderSelectedItems(true);
        },
        selectAllTree: function () {
            var self = this;

            // select all 
            var selItems = mergeObjects(self.options.selectedItems, self.filterItems || self.options.items, true, 'id');
            // remover items marcados como isgroup
            selItems = $.grep(selItems, function (o) { return !o[self.options.selectableName] });

            self.$dropdownTree.jstree(true).check_node(selItems);
            self.options.selectedItems = selItems;
            self.renderSelectedItems();
        },

        selectItemTree: function (ev, o) {
            if (!o.event) return;

            var self = this,
                item = o.node.original;

            if (item[self.options.selectableName] && o.changed) {
                $.each(o.changed.selected, function (idx, nodeID) {
                    item = o.instance.get_node(nodeID).original;
                    if (!item[self.options.selectableName]) {
                        self.selectItem(item);
                    }
                });
            } else {
                if (o.changed) {
                    $.each(o.changed.selected, function (idx, nodeID) {
                        item = o.instance.get_node(nodeID).original;
                        if (!item[self.options.selectableName]) {
                            self.selectItem(item);
                        }
                    });
                } else {
                    if (!item[self.options.selectableName]) {
                        self.selectItem(item);
                    }
                }
            }
        },
        emitSelectedItem: function (item) {
            var self = this;
            self.$elem.trigger({ 'type': 'selecteditem.fx.selectboxtree', 'item': item, 'ms': self });
            console.log("selected item event...");
        },
        selectItem: function (item) {
            var self = this;

            // add item to object
            self.pushSelectedItem(item);

            // render selectedItems
            self.renderSelectedItems();

            // emit event
            self.emitSelectedItem(item);
        },

        unselectAllGrid: function () {
            var self = this;

            $(self.itemMultiSelectSelector).prop("checked", false);
            // remove all from selected 
            self.options.selectedItems = removeObjectsById(self.options.selectedItems, self.filterItems || self.options.items);
            self.renderSelectedItems(true);
        },
        selectAllGrid: function () {
            var self = this;

            $(self.itemMultiSelectSelector).prop("checked", true);

            $(self.itemMultiSelectSelector, self.$dropdownContainer).closest('.fx-ms-grid-element').addClass('fx-ms-grid-element-selected');

            // select all 
            var selItems = mergeObjects(self.options.selectedItems, self.filterItems || self.options.items, true, 'id');
            self.options.selectedItems = selItems;
            self.renderSelectedItems();
        },

        selectItemGrid: function (item) {
            var self = this;
            self.selectItem(item);
        },
        unselectItemGrid: function (item) {
            var self = this;
            self.unselectItem(item);
        },
        handleItemGridClick: function (e) {
            e.stopPropagation();
                        
            var self = this,
                $target = $(e.currentTarget),
                //item = self.getItemById($target.val());
                item = self.getItemById($target.attr("value"));

            if (self.options.multiple) {
                if ($target.is(":checked")) {
                    $target.closest('.fx-ms-grid-element').addClass('fx-ms-grid-element-selected');
                    self.selectItemGrid(item);
                }
                else {
                    $target.closest('.fx-ms-grid-element').removeClass('fx-ms-grid-element-selected');
                    self.unselectItemGrid(item);
                }
            } else {
                $('.fx-ms-grid-element', self.$dropdownContainer).removeClass('fx-ms-grid-element-selected');
                $target.closest('.fx-ms-grid-element').addClass('fx-ms-grid-element-selected');
                self.selectItemGrid(item);
            }
        },

        pushSelectedItem: function (item) {
            var self = this;

            if (self.options.multiple) {
                var idx = _.findIndex(self.options.selectedItems, { 'id': item.id });
                if (idx === -1) self.options.selectedItems.push(item);
            }
            else {
                self.options.selectedItems = [];
                self.options.selectedItems.push(item);
            }

            //console.log(self.options.selectedItems);
        },
        removeSelectedItem: function (item) {
            var self = this;
            // remove item from object                        
            _.remove(self.options.selectedItems, function (it) { return it.id.toString() === item.id.toString() });
        },

        renderSelectedItems: function (setPlaceholder) {
            var self = this;
            // sort selecteditems                        
            self.sortSelectedItems();

            // render html markup
            self.renderSelectedItemMarkup();

            // set placeholder
            if (setPlaceholder) { self.setSelectedPlaceholder(); }

            // check or uncheck option checkall
            self.updateSelectAll();

            // update position
            self.elementPosition();

            // validate
            self.validate();

            // fill input values
            self.fillInputValue();
        },
        renderSelectedItemMarkup: function () {
            var self = this;

            // clear markup
            self.$selectionChoices.empty();

            // check if numberDisplayed is greather than selected items
            if (self.options.numberDisplayed > 0 && self.options.selectedItems.length > self.options.numberDisplayed) {
                var h = self.options.selectItemTemplate.replace(/{{ID}}/gi, '').replace(/{{TEXT}}/gi, self.options.selectedItems.length + ' ' + self.options.nSelectedText);
                self.$selectionChoices.html(h);
                return;
            }

            // render markup   
            var html = [];
            $.each(self.options.selectedItems, function (idx, it) {
                html.push(self.options.selectItemTemplate.replace(/{{ID}}/gi, it.id).replace(/{{TEXT}}/gi, it.text));
            });
            self.$selectionChoices.html(html.join(""));

        },
        selectSelectedItems: function () {
            var self = this;

            $.each(self.options.selectedItems, function (idx, item) {
                if (self.options.showMode === 'grid') {
                    var sctor = (self.options.multiple) ? self.itemMultiSelectSelector + '[value=' + item.id + ']' : self.itemUniSelectSelector + '[value=' + item.id + ']';
                    self.$dropdownGrid.find(sctor).prop("checked", true).closest('.fx-ms-grid-element').addClass('fx-ms-grid-element-selected');
                }
                else {
                    self.$dropdownTree.jstree(true).select_node(item.id);
                }
            });
        },
        sortSelectedItems: function () {
            var self = this;
            // sort selecteditems                        
            self.options.selectedItems = _.sortBy(self.options.selectedItems, function (i) { var propVal = i['text']; if (typeof propVal !== 'string') { return propVal; } else { return propVal.toLowerCase(); } });
        },

        updateSelectAll: function () {
            console.log('updateSelectAll...');
            var self = this;
            if (self.options.showSelectAll) {

                var checkedBoxesLength = allBoxesLength = 0;
                if (self.options.showMode === 'grid') {
                    var allBoxes = $(self.itemMultiSelectSelector);
                    allBoxesLength = allBoxes.length;
                    checkedBoxesLength = allBoxes.filter(":checked").length;
                }
                else {
                    checkedBoxesLength = self.$dropdownTree.jstree('get_checked', false).length;
                    allBoxesLength = (self.options.items) ? self.options.items.length : 0;
                    if (self.filterItems) {
                        allBoxesLength = $("li.jstree-node:visible", self.$dropdownTree).length;
                    }
                }
                var checked = checkedBoxesLength > 0 && checkedBoxesLength === allBoxesLength;
                self.$selectAllContainer.find(self.selectAllSelector).prop("checked", checked);

                // check if numberDisplayed is greather than selected items
                if (checked && self.options.numberDisplayed > 0 && self.options.selectedItems.length > self.options.numberDisplayed) {
                    // clear markup
                    self.$selectionChoices.empty();
                    var h = self.options.selectItemTemplate.replace(/{{ITEM}}/gi, '').replace(/{{TEXT}}/gi, self.options.allSelectedText);
                    self.$selectionChoices.html(h);
                    return;
                }
            }
        },

        handleSearch: function () {
            var self = this;
            clearTimeout(self.hsTimeout);
            self.hsTimeout = setTimeout(function () {
                var str = self.$searchField.val();
                if (self.options.showMode === "grid") {
                    self.searchGrid(str);
                }
                else {
                    self.searchTree(str);
                }

                self.elementPosition();
            }, 250);

        },
        searchTree: function (str) {
            var self = this;

            self.$dropdownTree.jstree(true).search(str);
        },
        searchGrid: function (str) {
            var self = this;
            if (str == undefined || str == '') {
                self.filterItems = null;
                self.loadGrid();
                return;
            }

            self.filterItems = _.filter(self.options.items,
                        function (k) {
                            var res = false;
                            _.forOwn(k, function (val, key) {
                                res = FUXI.Utils.like(val, str);
                                if (res) return false;
                            });
                            return res;
                        });
            //console.table(filterItems);
            self.loadGrid();
        },

        setSelectedPlaceholder: function () {
            var self = this;

            if (!self.options.selectedItems || self.options.selectedItems.length === 0) {
                self.$selectionChoices.append("<li class='fx-ms-choice-placeholder'>" + self.options.selectedPlaceholder + "</li>");
            }
        },
        setDisable: function () {
            var self = this;
            self.renderSelectedItems(true);
            self.$elem.addClass('fx-ms-wrapper-disabled');
            self.$selectionChoices.find(self.deleteChoiceSelector).remove();
            self.removeListeners();
        },
        getJSTreeConfiguration: function () {
            var self = this,
                data = self.options.items,
                plugins = self.options.jstreePlugins,
                pluginConf = self.options.jstreePluginsConfiguration,
                coreConf = self.options.jstreeCoreConfiguration;

            var defaultConf = {
                core: {
                    data: data
                },
                plugins: []
            };

            if (plugins) {
                defaultConf.plugins = defaultConf.plugins.concat(plugins);

                if (!self.options.multiple) {
                    // remove plugin checkbox
                    _.remove(defaultConf.plugins, function (n) { return n.toString().toLowerCase() === 'checkbox'; });
                }
            }

            if (defaultConf.plugins.length === 0) {
                delete defaultConf.plugins;
            }

            if (pluginConf) {
                pluginConf.forEach(function (elem) {
                    if (self.options.multiple) {
                        defaultConf[elem.key] = elem.value;
                    } else {
                        if (elem.key.toLowerCase() !== 'checkbox') {
                            defaultConf[elem.key] = elem.value;
                        }
                    }
                });
            }

            if (coreConf) {
                coreConf.forEach(function (elem) {
                    defaultConf.core[elem.key] = elem.value;
                });
            }

            return defaultConf;
        },
        getSelectedValues: function () {
            var self = this;
            return self.options.selectedItems;
        },
        getSelectedIDs: function () {
            var self = this, IDs = '';
            var items = self.options.selectedItems;
            var aux = [];
            $.each(items, function (idx, it) {
                aux.push(it.id);
            });

            return aux.join(self.options.selectedIDsSpacer || ",");
        },
        getItemById: function (id) {
            var self = this;
            var item = null;
            if (self.options.showMode === 'grid') {
                if (self.options.items) {
                    var it = $.grep(self.options.items, function (o) { return o.id.toString() === id.toString() });
                    if (it.length > 0) item = it[0];
                }
            } else {
                var jstree = self.$dropdownTree.jstree(true);
                if (jstree) {
                    var node = jstree.get_node(id);
                    item = node.original;
                }
            }
            return item;
        },

        fillInputValue: function () {
            var self = this;

            self.inputValues.val(self.getSelectedIDs());
        },

        validate: function () {
            var self = this;

            // if required 
            if (self.options.required) {
                var l = self.options.selectedItems.length || 0;
                if (l === 0) {
                    self.$elem.addClass("fx-ms-has-error");
                    self.$dropdownContainer.addClass("fx-ms-has-error");
                } else {
                    self.$elem.removeClass("fx-ms-has-error");
                    self.$dropdownContainer.removeClass("fx-ms-has-error");
                }
            }
        },
        resetSelectedItems: function () {
            var self = this;
            // clear all
            self.clearAll();

            // select selected items
            self.options.selectedItems = self.originalSelectedItems;
            self.selectSelectedItems();
            self.renderSelectedItems(true);
        },
        clearAll: function () {
            var self = this;
            // clear all
            (self.options.showMode === 'grid') ? self.unselectAllGrid() : self.unselectAllTree();

            // clear search
            self.$searchField.val('');
            self.handleSearch();

            // validate
            self.validate();

            // fill input values
            self.fillInputValue();
        }

    };

    $.fn.selectBoxTree = function (options) {
        return this.each(function () {
            var ms = Object.create(SelectBoxTree);
            ms.init(options, this);

            $.data(this, 'ms', ms);
        }).data('ms');
    };
    $.fn.selectBoxTree.options = {
        multiple: true,
        disabled: false,
        showMode: 'tree', // grid or tree
        showSelectAll: false,
        showSearch: true,
        numberDisplayed: 0, // number of items displayed on        
        allSelectedText: '', // text to show when select all
        nSelectedText: '', // text to show when selected items is greather than numberDisplayed
        required: false,
        jstreePlugins: ['checkbox', 'search', 'changed'],
        jstreePluginsConfiguration: [
            {
                key: 'search',
                value: {
                    show_only_matches: true
                }
            },
            {
                key: 'checkbox',
                value: {
                    three_state: false
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
        selectedPlaceholder: 'selecione...',
        items: [],
        selectedItems: [],
        selectableName: 'isgroup',
        selectedIDsSpacer: ",",
        selectItemTemplate: '<li class="fx-ms-search-choice">' +
                                '<a class="fx-ms-search-choice-close" data-item-id=\'{{ID}}\'>' +
                                    '<i class="glyphicon glyphicon-remove"></i>' +
                                '</a>' +
                                '<span>' +
                                    '{{TEXT}}' +
                                '</span>' +
                            '</li>',
        gridItemTemplate: '<li class="fx-ms-grid-element checkbox">' +
                            '<label data-multi-select>' +
                                '<input type="checkbox" data-multi-select id="opt-item-{{ID}}" name="chk-item-selected" value="{{ID}}" >' +
                                '{{TEXT}}' +
                            '</label>' +
                            '<label data-uni-select>' +
                                '<a data-uni-select id="opt-item-{{ID}}" value="{{ID}}" title="{{TEXT}}">' +
                                    '{{TEXT}}' +
                                '</a>' +
                            '</label>' +
                        '</li>'

    };

})(jQuery, window, document);
// end componente