
function revenueSync(partnerFlag, truID) {
    $(".spinnerVal").addClass("hidden");
    $(".spinnerRev").removeClass("hidden");
    var truID = $("#txteTruid").val().trim();
    var json = { flag: partnerFlag, rTruID: truID };
    var URL = ""
    if (partnerFlag == "partner") {
        URL = "/dash/getRevenueChart";
        $.ajax({
            "url": URL, "method": "POST", data: json,
            success: function (a) {
                let res = a.body;
                $('.loaderContainer').fadeOut('slow');
                if (res.status == 200) {
                    var resource = res.resource;
                    var todayRevenue = resource.todayRevenue.length > 0 ? parseFloat(resource.todayRevenue[0].revenue) : 0;
                    var yesterdayRevenue = resource.yesterdayRevenue.length > 0 ? parseFloat(resource.yesterdayRevenue[0].revenue) : 0;
                    var weekRevenue = resource.weekRevenue.length > 0 ? parseFloat(resource.weekRevenue[0].revenue) : 0;
                    var monthRevenue = resource.monthRevenue.length > 0 ? parseFloat(resource.monthRevenue[0].revenue) : 0;
                    var totalRevenue = resource.totalRevenue.length > 0 ? parseFloat(resource.totalRevenue[0].revenue) : 0;
                    $(".todayRevenue").html(" ₹ " + decimalChopper(todayRevenue, 2));
                    $(".yesterdayRevenue").html(" ₹ " + decimalChopper(yesterdayRevenue, 2));
                    $(".weekRevenue").html(" ₹ " + decimalChopper(weekRevenue, 2));
                    $(".monthRevenue").html(" ₹ " + decimalChopper(monthRevenue, 2));
                    $(".totalRevenue").html(" ₹ " + decimalChopper(totalRevenue, 2));
                }
                $(".spinnerVal").removeClass("hidden");
                $(".spinnerRev").addClass("hidden");
            }
        });
    }
    else {
        URL = "/dash/getRevenueByPartner";
        $.ajax({
            "url": URL, "method": "POST", data: json,
            success: function (a) {
                let res = a.body;
                $('.loaderContainer').fadeOut('slow');
                if (res.status == 200) {
                    var resource = res.resource;
                    $(".todayRevenue").html(" ₹ " + decimalChopper(resource.todayRevenue, 2));
                    $(".yesterdayRevenue").html(" ₹ " + decimalChopper(resource.yesterdayRevenue, 2));
                    $(".weekRevenue").html(" ₹ " + decimalChopper(resource.weekRevenue, 2));
                    $(".monthRevenue").html(" ₹ " + decimalChopper(resource.monthRevenue, 2));
                    $(".totalRevenue").html(" ₹ " + decimalChopper(resource.totalRevenue, 2));                  
                }
                $(".spinnerVal").removeClass("hidden");
                $(".spinnerRev").addClass("hidden");
            }
        });
    }

}
function revenueTxnFor(e) {
    var txnsof = $(e).val();
    revenueSync(txnsof);
}


$(function () { 
    setTimeout(function () {
        $('.radio-group label').on('click', function () {
            $(this).removeClass('not-active').siblings().addClass('not-active');
        });
        revenueSync("partner");
    }, 1000)

})