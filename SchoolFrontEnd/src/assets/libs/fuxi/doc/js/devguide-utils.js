var mixedMode = {
    name: "htmlmixed",
    scriptTypes: [{

        matches: /(text|application)\/(x-)?vb(a|script)/i,
        mode: "javascript"
    }]
};

var devGuideUtils = function () {
    // Retrieve a CodeMirror Instance via jQuery.
    var getCodeMirrorJQuery = function (target) {
        var $target = target instanceof jQuery ? target : $(target);
        if ($target.length === 0) {
            throw new Error('Element does not reference a CodeMirror instance.');
        }

        if (!$target.hasClass('CodeMirror')) {
            if ($target.is('textarea')) {
                $target = $target.next('.CodeMirror');
            }
        }

        return $target.get(0).CodeMirror;
    };

    var getSnippetHTMLCopyCode = function () {

        var s = [];
        s.push('<button class="btn fx-btn-copy-code fx-btn-negative" type="button">copy</button>')

        return $(s.join(""));
    };
    var getSnippetCopiedMsg = function () {
        var s = []
        s.push('<div class="fx-copied-msg">');
        s.push('Snippet copiado');
        s.push('</div>');

        return s.join("");
    };
    var showCopiedMsg = function (elem, msg) {
        elem.append(msg);
        $(elem).find('.fx-copied-msg').fadeIn(300, function () {
            $(elem).find('.fx-copied-msg').fadeOut(500, function () {
                $(this).remove();
            });
        });
    };
    var fallbackMessage = function (action) {
        var actionMsg = '';
        var actionKey = (action === 'cut' ? 'X' : 'C');
        if (/iPhone|iPad/i.test(navigator.userAgent)) {
            actionMsg = 'No support :(';
        }
        else if (/Mac/i.test(navigator.userAgent)) {
            actionMsg = 'Press ⌘-' + actionKey + ' to ' + action;
        }
        else {
            actionMsg = 'Press Ctrl-' + actionKey + ' to ' + action;
        }

        return actionMsg;
    };
    var refreshScrollSpy = function () {
        $('[data-spy="scroll"]').each(function () {
            $(this).scrollspy('refresh');
        });
    };

    return {
        pageMenuScrollSpy: function () {
            var target = '#fx-docs-nav';
            $('body').scrollspy({
                target: target,
                //offset: 1000
            }).on('activate.bs.scrollspy', function () {

                if (location.href.indexOf("angularcomponents") > -1) { return; }
                var hash = $(target).find('li.active > a').last().prop('href');
                history.replaceState({}, "", hash);
            });
        },
        setCodeMirror: function () {
            
            var c = $('.fx-codemirror-textarea').length;
            var x = 0;

            function checkCMFullyLoaded() {
                x++;
                if (c === x) {
                    setTimeout(devGuideUtils.pageMenuScrollSpy, 2000);
                }
            }

            $('.fx-codemirror-textarea').each(function () {
                
                CodeMirror.fromTextArea(this, {
                    mode: mixedMode,
                    lineNumbers: false,
                    readOnly: true,
                    onLoad: checkCMFullyLoaded()
                });
            });

           

        },
        setActiveNavItem: function () {
            var pgurl = window.location.href.substr(window.location.href.lastIndexOf("/") + 1);
            $("#fx-devguide-nav > .nav a").each(function () {
                if ($(this).attr("href") == pgurl || $(this).attr("href") == '')
                    $(this).closest("li").addClass("active");
            })
        },
        toggleCode: function () {
            $('.fx-devguide-toggle-code-vis').on('click', function (e) {
                e.preventDefault();
                $(this).next('.fx-devguide-toggled-code-vis').toggleClass('hidden');

                if ($(this).next('.fx-devguide-toggled-code-vis').find('.CodeMirror').length > 0) {
                    return;
                }

                $(this).next('.fx-devguide-toggled-code-vis').find('.fx-codemirror-textarea-hidden').each(function () {
                    CodeMirror.fromTextArea(this, {
                        mode: mixedMode,
                        lineNumbers: true,
                        readOnly: true
                    });
                });

            })
        },

        setCopyCode: function () {

            $('.fx-codemirror').hover(function () {
                $(this).append(getSnippetHTMLCopyCode());
            }, function () {
                $(this).find(".fx-btn-copy-code:last").remove();
            });


            $('.fx-codemirror').on('click', '.fx-btn-copy-code', function () {
                var editorSelector = $(this).siblings('textarea[class^="fx-codemirror-textarea"] + .CodeMirror');
                var clipboard = new Clipboard('.fx-btn-copy-code', {
                    text: function (trigger) {
                        var t = getCodeMirrorJQuery(editorSelector).getDoc().getValue();

                        return t;
                    }
                });

                clipboard.on('success', function (e) {
                    /*console.info('Action:', e.action);
                    console.info('Text:', e.text);
                    console.info('Trigger:', e.trigger);*/

                    e.clearSelection();
                    showCopiedMsg($(e.trigger).parent(".fx-codemirror"), getSnippetCopiedMsg());

                }).on('error', function (e) {
                    /*console.error('Action:', e.action);
                    console.error('Trigger:', e.trigger);*/
                    showCopiedMsg(e.trigger, fallbackMessage(e.action));
                });
                //clipboard.destroy();
            });
        },

        onResizeWindow: function () {

            var doit;
            window.onresize = function () {
                clearTimeout(doit);
                doit = setTimeout(refreshScrollSpy, 100);
            };

        },


    };
}();

