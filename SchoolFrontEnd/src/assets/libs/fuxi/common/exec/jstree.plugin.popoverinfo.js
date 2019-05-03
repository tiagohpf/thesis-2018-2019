(function ($, undefined) {
    "use strict";
    var iEl = document.createElement('i');
    
    // default settings
    $.jstree.defaults.popoverinfo = {
        className: "caret fx-open-quickview",
        attributes: [{ name: "rel", value: "popover" }],
        popinfoID: "popinfo"
    };

    $.jstree.plugins.popoverinfo = function (options, parent) {
        this.bind = function () {
            parent.bind.call(this);
            this.element
                .on("click.jstree", ".fx-jstree-popoverinfo", $.proxy(function (e) {
                    e.stopImmediatePropagation();
                    var node = this.get_node(e.target);
                    var elemID = this.settings.popoverinfo.popinfoID + "_" + node.id;
                    this.settings.popoverinfo.click.call(this, node, elemID);
                }, this));
        };
        this.teardown = function () {
            if (this.settings.popoverinfo) {
                this.element.find(".fx-jstree-popoverinfo").remove();
            }
            parent.teardown.call(this);
        };
        this.redraw_node = function (obj, deep, callback) {
            obj = parent.redraw_node.call(this, obj, deep, callback);
            if (obj && $(obj).attr("data-showinfo") === "true") {
                iEl.className = "fx-jstree-popoverinfo " + this.settings.popoverinfo.className;
                $.each(this.settings.popoverinfo.attributes, function (idx, att) {
                    iEl.setAttribute(att.name, att.value);
                });
                var tmp = iEl.cloneNode(true);
                tmp.id = this.settings.popoverinfo.popinfoID + "_" + obj.id;
                obj.insertBefore(tmp, obj.childNodes[2]);
            }

            return obj;
        };
    };
})(jQuery);

/*
 * 
 * (function ($, undefined) {
    "use strict";
    var iEl = document.createElement('i');
    iEl.className = "caret fx-open-quickview fx-jstree-caretmark";
    iEl.setAttribute("rel", "popover");

    $.jstree.defaults.caretmark = $.noop;
    $.jstree.plugins.caretmark = function (options, parent) {
        this.bind = function () {
            parent.bind.call(this);
            this.element
                .on("click.jstree", ".fx-jstree-caretmark", $.proxy(function (e) {
                    e.stopImmediatePropagation();
                    this.settings.caretmark.call(this, this.get_node(e.target));
                }, this));
        };
        this.teardown = function () {
            if (this.settings.caretmark) {
                this.element.find(".fx-jstree-caretmark").remove();
            }
            parent.teardown.call(this);
        };
        this.redraw_node = function (obj, deep, callback) {
            obj = parent.redraw_node.call(this, obj, deep, callback);
            if (obj && $(obj).attr("showinfo") === "true") {
                var tmp = iEl.cloneNode(true);
                tmp.id = "caretinfo_" + obj.id;
                obj.insertBefore(tmp, obj.childNodes[2]);
            }

            return obj;
        };
    };
})(jQuery);
 * 
 */