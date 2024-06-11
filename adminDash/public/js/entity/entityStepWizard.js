// author : Suresh Patil
// date : 24-04-2019
// Description : update KYC

$(document).ready(function () {
    //Initialize tooltips
    $('.nav-tabs > li a[title]').tooltip();

    //Wizard
    $('a[data-toggle="tab"]').on('show.bs.tab', function (e) {

        var $target = $(e.target);

        if ($target.parent().hasClass('disabled')) {
            return false;
        }
    });

    $(".next-step").click(function (e) {

        var $active = $('.wizard .nav-tabs li.active');
        //    $active.next().removeClass('disabled');

        nextTab($active, $(this).attr('id'));


    });
    $(".prev-step").click(function (e) {

        var $active = $('.wizard .nav-tabs li.active');
        prevTab($active);

    });
});

async function nextTab(elem, curstep) { 
    if (curstep == "submit_step1") {
        if (consumerstep1() === true) { 
            var stat = await saveEntity();
            if (stat == true) {
                $(elem).next().removeClass('disabled'); 
                $(elem).next().find('a[data-toggle="tab"]').click();
            }
        }
    }
    if (curstep == "submit_step2") {
        if (consumerstep2() === true) {
            var stat = await updateAddr();
            var stats = await updateConfig();
            if (stat == true) {
                $(elem).next().removeClass('disabled')
                //initMap(); 
                $(elem).next().find('a[data-toggle="tab"]').click();
            }
        } 
    } 
}
function prevTab(elem) {
    $(elem).prev().find('a[data-toggle="tab"]').click();
}
