var devGuideUiElements = function () {
    return {
        header: function () {
            //FUXI.Header.init();
            $('.fx-main-search').on('click', '.fx-main-search-btn', function () {
                var $wrap = $(this).parent(),
                    $sin = $wrap.find('.fx-input-search');

                if ($wrap.hasClass('collapsed')) {
                    $wrap.removeClass('collapsed');
                    $sin.addClass('fx-toggle-search-input');
                    $sin.focus();
                } else {
                    $wrap.addClass('collapsed');

                    $sin.removeClass('fx-toggle-search-input');
                }
            });

            //in order to keep the menu slider open while performing a nav
            $(document).on('click', '.devguide-manage-menu-vis', function (e) {
                $(this).hasClass('devguide-keep-open') && e.stopPropagation(); // This replace if conditional.
            });
        }
    };
}();

