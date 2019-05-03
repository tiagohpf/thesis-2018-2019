var utils = function () {
    return {
        templateDesc: function () {
            $('.template-desc-container').draggable({
                handle: 'h3',
                containment: 'body',
            }).resizable({
                minHeight: 300,
                maxHeight: 800,
                minWidth: 300,
                maxWidth: 900,
                handles: "w,s,sw",
                create: function (event, ui) {
                    $(this).parent().on('resize', function (e) {
                        e.stopPropagation();
                    });
                }
            });

            function checkDrag() {
                if (detach) {
                    $('.template-desc-container').draggable('enable').resizable('enable');
                } else {
                    $('.template-desc-container').draggable('disable').resizable('disable').prop('style', '');
                }
            }

            var detach = false;
            checkDrag();
            

            $('#btn-detach').on('click', function () {
                var $this = $(this);
                $this.closest('.template-desc-container').toggleClass('fixed detached');
                detach = true;
                checkDrag();
                $this.addClass('hidden');
                $('#btn-fix').removeClass('hidden');
            });

            $('#btn-fix').on('click', function () {
                var $this = $(this);
                $this.closest('.template-desc-container').toggleClass('fixed detached');
                $('#btn-detach').removeClass('hidden');
                detach = false;
                checkDrag();
                $this.addClass('hidden');
            });

            $('#btn-minimize').on('click', function () {
                var $this = $(this);
                $this.closest('.template-desc-container').toggleClass('maximized minimized').find('.template-desc-body').addClass('hidden');
                $this.addClass('hidden');
                $('#btn-maximize').removeClass('hidden');
            });

            $('#btn-maximize').on('click', function () {
                var $this = $(this);
                $this.closest('.template-desc-container').toggleClass('maximized minimized').find('.template-desc-body').removeClass('hidden');
                $this.addClass('hidden');
                $('#btn-minimize').removeClass('hidden');
            });

            var resizeEvt;
            $(window).on('resize', function () {
                clearTimeout(resizeEvt);
                resizeEvt = setTimeout(function () {
                    //code to do after window is resized
                    detach = false;
                    $('.template-desc-container').removeClass('detached minimized').addClass('fixed maximized').find('.template-desc-body').removeClass('hidden');
                    $('#btn-fix, #btn-maximize').addClass('hidden');
                    $('#btn-detach, #btn-minimize').removeClass('hidden');
                    checkDrag();
                }, 250);
            });
        },
        activeButton: function () {
            $(".template-desc-body").on("click", ".btn", function (e) {
                e.preventDefault();
                $(".template-desc-body .btn").removeClass('active');
                $(this).addClass("active");
            });
        }
    };
}();

