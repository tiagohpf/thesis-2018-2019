$(document).ready(function () {
    // Hide Header on on scroll down
    var didScroll;
    var lastScrollTop = 0;
    var delta = 5;
    var navbarHeight = $('.fx-main-nav').outerHeight();
    var scrollUpTimeout = 0;
    var mouseLeaveTimeout = 0;
    var st = 0;

    $(window).scroll(function (event) {
        didScroll = true;
    });

    setInterval(function () {
        if (didScroll) {
            hasScrolled();
            didScroll = false;
        }
    }, 250);

    function stopTimeout() {
        clearTimeout(scrollUpTimeout);
        clearTimeout(mouseLeaveTimeout);
    }

    function handleHeaderVisibility() {
        //st
        //navbarHeight
        if (st > navbarHeight) {
            $('.fx-main-nav').addClass('fx-main-nav-up').removeClass('fx-main-nav-down');
        }
    }

    //will clear timeout when mouseover and hide when mouseleave
    function handleHeaderMouseEvents() {
        $('.fx-main-nav').on('mouseenter', stopTimeout).on('mouseleave', function () { mouseLeaveTimeout = setTimeout(handleHeaderVisibility, 1500); });
    };

    handleHeaderMouseEvents();

    function hasScrolled() {
        st = $(this).scrollTop();


        stopTimeout();


        // Make sure they scroll more than delta
        if (Math.abs(lastScrollTop - st) <= delta)
            return;

        // If they scrolled down and are past the navbar, add class .nav-up.
        // This is necessary so you never see what is "behind" the navbar.
        if (st > lastScrollTop && st > navbarHeight) {
            // Scroll Down
            $('.fx-main-nav').removeClass('fx-main-nav-down').addClass('fx-main-nav-up');
        } else {
            // Scroll Up
            if (st + $(window).height() < $(document).height()) {
                $('.fx-main-nav').removeClass('fx-main-nav-up').addClass('fx-main-nav-down');
                //we give 5 seconds to allow navigatiorn. after that we assume the user wants to read
                scrollUpTimeout = setTimeout(handleHeaderVisibility, 5000);
                //console.log(scrollUpTimeout);
            }
        }

        lastScrollTop = st;
    }
});