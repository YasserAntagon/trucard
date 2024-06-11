/*!
File: Stock History
Edited : Nikhil Bharambe
Dated : 13-05-2019
*/
$(function () {
    $(".sidebarback").css('display', 'none');
})
var dealerID = "";
function BindStock() {
    var json = { "truID": dealerID };
    $.ajax({
        "url": "/assetmanagerDB/getAssetManagerData", "method": "POST", data: json, success: function (a) {
            let $Data = a.body;
            if ($Data) {
                var lG24K = decimalChopper($Data.sG24K, 4);
                var lS99P = decimalChopper($Data.sS99P, 4);
                $("#g24k").html(lG24K + " gms");
                $("#s99p").html(lS99P + " gms");
            }
            BindAvailStock();
        }
    });
}

$(function () {
    let json = {
        "KYCFlag": "active"
    }
    $.ajax({
        "url": "/assetmanagerList/getassetmanagerList", "method": "POST", data: json, success: function (a) {
            var buyArr = a.body;
            if (buyArr) {
                dealerID = buyArr[0].truID;
                BindStock(buyArr[0].truID)
            }
        }
    });
})

function BindAvailStock() {
    var json = { "amTruID": dealerID };
    $(".spinnerstock").addClass("hidden")
    $.ajax({
        "url": "/LBMA/totalStockLog", "method": "POST", data: json, success: function (a) {
            let $Data = a.body.resource;
            let $status = a.body.status;
            if ($status == "200") {
                var estockgold = decimalChopper(parseFloat($Data.G24K) + parseFloat($Data.eG24K), 4);
                var estocksilver = decimalChopper(parseFloat($Data.S99P) + parseFloat($Data.eS99P), 4);

                var buyrateG24K = decimalChopper($Data.G24KBuy, 4);
                var buyrateS99P = decimalChopper($Data.S99PBuy, 4);
                var srateG24K = decimalChopper($Data.G24KSaleRate, 4);
                var srateS99P = decimalChopper($Data.S99PSaleRate, 4);

                $(".rateg24kclient").html(decimalChopper(parseFloat($Data.G24KBuyClient), 4));
                $(".rates99pclient").html(decimalChopper(parseFloat($Data.S99PBuyClient), 4));
                $(".srateg24kclient").html(decimalChopper(parseFloat($Data.G24KSaleRateClient), 4));
                $(".srates99pclient").html(decimalChopper(parseFloat($Data.S99PSaleRateClient), 4));

                $(".rateg24k").html(buyrateG24K);
                $(".rates99p").html(buyrateS99P);
                $(".srateg24k").html(srateG24K);
                $(".srates99p").html(srateS99P);

                $("#evalue").html("<i class='fa fa-inr'></i> " + decimalChopper($Data.eValue, 2));
                $("#eWallet").html("<i class='fa fa-inr'></i> " + decimalChopper($Data.eWallet, 2));
                $("#evalueTotal").html("<i class='fa fa-inr'></i> " + decimalChopper($Data.eValueTotal, 2));

                var smallvalue24 = parseFloat($Data.G24K) + parseFloat($Data.eG24K);
                var smallvalueTot24 = smallvalue24 * parseFloat($Data.G24KSaleRateClient);
                var small24 = "<br /><small style='color: #808080;font-size:10px'><i class='fa fa-inr'></i> " + decimalChopper(smallvalueTot24, 2) + "</small>"

                var smallvalue99 = parseFloat($Data.S99P) + parseFloat($Data.eS99P);
                var smallvalueTot99 = smallvalue99 * parseFloat($Data.S99PSaleRateClient);
                var small99 = small24 + " <small style='color: #808080;font-size:10px'>/</small> <small style='color: #808080;font-size:10px'><i class='fa fa-inr'></i> " + decimalChopper(smallvalueTot99, 2) + "</small>"
                small99 += "<br /><small style='color: #808080;font-size:10px'> (Calculation on highest transaction sell rate.)</small>"
                $("#estockgold").html(estockgold + " gms");
                $("#estocksilver").html(estocksilver + " gms" + small99);
                $('#newsTicker6').breakingNews({ themeColor: '#f9a828' });
                $('#newsTicker5').breakingNews({ themeColor: '#f9a828' });

                $(".spinnerstock").removeClass("hidden")
                $(".spinnerStockDash").addClass("hidden")
                ratePiechart(buyrateG24K, buyrateS99P);
            }
            else {
                $(".spinnerstock").removeClass("hidden")
                $(".spinnerStockDash").addClass("hidden")
            }
        }
    });
}
$('input[type=radio][name="stockc_type"]').change(function () {
    var chart_type = $(this).val();
    if (chart_type == "avail") {
        $(".availstock").removeClass("hidden")
        $(".soldstock").addClass("hidden")
    }
    else {
        $(".soldstock").removeClass("hidden")
        $(".availstock").addClass("hidden")
    }
});
$('#cmbConsumer').change(function () {
    var truID = $(this).val();
    window.location.href = "/openConsumerDash?id=" + truID;
    $('#cmbConsumer').val(0)
});
$('#cmbPartner').change(function () {
    var truID = $(this).val();
    window.location.href = "/openPartnerDash?id=" + truID;
    $('#cmbPartner').val(0)
});
$(function () {
    bindPartners();
    bindConsumers("all");
    bindModalConsumerstohighertxnlist("all");
})
