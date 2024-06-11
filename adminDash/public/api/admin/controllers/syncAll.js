function assetmanagerListSync(sync, flag, page) {
    $('#loader').css("display", 'block');
    $.ajax({
        "url": "/assetmanagerList/syncassetmanagerList", "method": "POST", success: function (a) {
            $('#loader').fadeOut('slow');
            callProgress("3")
            let status = a.status;
            if (status == "200") {
                if (sync == "all") {
                    assetstoreListSync(sync, flag, page)
                }
            }
        }
    });
}
function singleConsumerListSync(astatus) {
    $("#dbLoader").modal({ show: true })
    $('#loader').css("display", 'block');
    $.ajax({
        "url": "/consumerList/syncConsumerList", "method": "POST", success: function (a) {
            $('#loader').fadeOut('slow');

            if (astatus == "entity") {
                singleEntityListSync()
            }
            else {
                alertify.success("Database synchronization successfully done..!!");
                $("#dbLoader").modal('hide')
            }
        }
    });
}
function singleEntityListSync() {
    $('#loader').css("display", 'block');
    $.ajax({
        "url": "/entityList/syncEntityList", "method": "POST", success: function (a) {
            $('#loader').fadeOut('slow');
            $("#dbLoader").modal('hide')
            alertify.success("Database synchronization successfully done..!!");
        }
    });
}
function clientRate(enID) {
    var json = { "rTruID": enID };
    $(".spinnerstock").addClass("hidden")
    $.ajax({
        "url": "/LBMA/clientRate", "method": "POST", data: json, success: function (a) {
            let $Data = a.body.resource;
            let $status = a.body.status;
            if ($status == "200") {
                $(".rateg24kclient").html(decimalChopper(parseFloat($Data.G24KBuyClient), 4));
                $(".rates99pclient").html(decimalChopper(parseFloat($Data.S99PBuyClient), 4));

                $(".srateg24kclient").html(decimalChopper(parseFloat($Data.G24KSaleRateClient), 4));
                $(".srates99pclient").html(decimalChopper(parseFloat($Data.S99PSaleRateClient), 4));
 
                $("#g24krate").text(decimalChopper(parseFloat($Data.G24KSaleRateClient), 4));
                $("#s99prate").text(decimalChopper(parseFloat($Data.S99PSaleRateClient), 4));
                $("#g24krate").attr("data-dlrRate",parseFloat($Data.G24KSaleRateClient));
                $("#s99prate").attr("data-dlrRate",parseFloat($Data.S99PSaleRateClient));
                $('#newsTicker6').breakingNews({ themeColor: '#f9a828' });
                $('#newsTicker5').breakingNews({ themeColor: '#f9a828' });

                $(".spinnerstock").removeClass("hidden")
                $(".spinnerStockDash").addClass("hidden")
            }
            else {
                $(".spinnerstock").removeClass("hidden")
                $(".spinnerStockDash").addClass("hidden")
            }
        }
    });
}


function assetmanagerListSync() {
    $('#loader').css("display", 'block');
    $.ajax({
        "url": "/assetmanagerList/syncassetmanagerList", "method": "POST", success: function (a) {
            $('#loader').fadeOut('slow');
        }
    });
}
$(function () {
    assetmanagerListSync()
})