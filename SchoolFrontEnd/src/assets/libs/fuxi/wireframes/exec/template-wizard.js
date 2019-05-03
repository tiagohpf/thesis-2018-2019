(function ($) {
    var step = 1; //<-- define the opened step (1...n)
    var numStaticSteps = 5; //<-- in this example we have four static steps and other number of dynamic steps

    var $wizardNav = $(".fx-wizard-wrapper > nav > ul > li");
    var $wizStepsContent = $(".fx-wizardsteps-content");
    var $wizStepInfo = $(".fx-wizardstep-info > ul");

    var $btPrev = $("#wiz-prev");
    var $btNext = $("#wiz-next");
    var $btComplete = $("#wiz-complete");
    
    $(document).ready(function () {

        //select2 inputs just for demo purposes
        $('#input7, #input8, #input9, #input10').select2();

        // get index of the element nav
        getIndex = function (st) {
            var $elem = $wizardNav.not('[data-dynamic-step]').eq(st - 1);
            var idx = $wizardNav.not('[data-dynamic-step]').index($elem);;
            return idx;
        };

        // function to handle the behavior of buttons
        handleButtonsBehavior = function (st) {            
            var navLen = $wizardNav.not('[data-dynamic-step]').length;

            // in this case switch have poor performance... is better use if statement
            if (st == 1) { $btNext.removeClass("btn-default disabled").addClass("btn-primary"); $btPrev.addClass("disabled"); $btComplete.removeClass("btn-primary").addClass("btn-default disabled"); }
            if (st > 1) { $btPrev.removeClass("disabled"); }                    
            if (st > 1 && st <= navLen) { $btNext.removeClass("btn-default disabled").addClass("btn-primary"); $btComplete.removeClass("btn-primary").addClass("btn-default disabled"); }
            if (st == navLen) { $btComplete.removeClass("btn-default disabled").addClass("btn-primary"); $btNext.removeClass("btn-primary").addClass("btn-default disabled"); }
        };

        // function to handle the behavior of steps
        handleStepsBehavior = function (st) {
            // get de index step. used in objects arrays
            var stepIdx = getIndex(st);
            // get the nav step selected
            var $navSel = $wizardNav.not('[data-dynamic-step]').eq(stepIdx);
                                
            // show nav step info of the previous step
            $navSel.prevAll().find($wizStepInfo).removeClass('hidden');

            // show step defined
            $wizStepsContent.not('[data-dynamic-step]').addClass('hidden');
            $wizStepsContent.not('[data-dynamic-step]').eq(stepIdx).removeClass('hidden');

            // active and show selected step
            $wizardNav.removeClass('active');
            $navSel.removeClass('blocked').addClass('active');
        };
                        
        // activate/ show step 
        handleStepsBehavior(step);

        // activate buttons and steps
        handleButtonsBehavior(step);
        
        // rearrange  numeration
        rearrangeNumeration = function (sIdx) {
            var $elems = $wizardNav.not("[data-dynamic-step]").find(".fx-wizardstep-number");
            var sNum = 1;
            $elems.each(function (index) {
                sNum = index + 1;
                $(this).text(sNum);
                $wizStepsContent.not("[data-dynamic-step]").eq(index).find("h4 > span").text(sNum);
            }); 
        };
                       
        //go forward on wizard
        $btNext.click(function () {
            step++;
            handleButtonsBehavior(step);
            // activate/ show step 
            handleStepsBehavior(step);
            
        });

        //go back on wizard
        $btPrev.click(function () {
            step--;
            handleButtonsBehavior(step);
            // activate/ show step 
            handleStepsBehavior(step);
        });
        
        //go to on wizard
        //$wizardNav.click(function () {        
        //    step = $(this).index() + 1;
        //    handleButtonsBehavior(step);
        //    // activate/ show step 
        //    handleStepsBehavior(step);
        //});

        /* dynamic step options */
        $("#stepOptionsContainer > [type=checkbox]").on("click", function () {
            
            // get index of the input checkbox
            var sIdx = $('#stepOptionsContainer > input:checkbox').index($(this));
            // sum the number of static steps to the index 
            sIdxA = sIdx + numStaticSteps;

            // check if the input checkbox is checked or not
            if (this.checked) {
                $wizardNav.eq(sIdxA).removeClass('hidden').removeAttr("data-dynamic-step");
                $wizStepsContent.eq(sIdxA).removeAttr("data-dynamic-step");
            }
            else {
                $wizardNav.eq(sIdxA).addClass('hidden blocked').attr("data-dynamic-step", '');
                $wizStepsContent.eq(sIdxA).attr("data-dynamic-step", '');
            }
            
            // rearrange  numeration
            rearrangeNumeration(sIdxA);                                        
        });
    });
})(jQuery);