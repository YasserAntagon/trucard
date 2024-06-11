var isDate = false;
$(document).ready(function () {
    var truid = $("#txteTruid").val();
    $('.entityname').html($('#txtname').html());
    var json = { "rTruID": truid, flag: "all" };
    $('#loader').css('display', 'block');
    partnerTxnFor(json);
    BindWallData();
    
})

$('.radio-group label').on('click', function () {
    $(this).removeClass('not-active').siblings().addClass('not-active');
});
function isFilter() {
    var truid = $("#txteTruid").val();
    var successSelected = $('input[name=partnerTxnFor]:checked').val();
    var json = { "rTruID": truid, flag: successSelected };
    if (isDate) {
        var start = $('#config-date').data('daterangepicker').startDate._d;
        var end = $('#config-date').data('daterangepicker').endDate._d;
        json.startdate = start;
        json.enddate = end;
    }
    partnerTxnFor(json, start, end)
}
function partnerTxnFor(json, startD, endD) {
    $.ajax({
        "url": "/eEntity/getEntityReport", "method": "POST", data: json, success: function (res) {
            let data = res.body;
            $('#loader').fadeOut('slow');
            if (data.status == 200) {
                bindRecord(data, json, startD, endD);
            }
            else {
                alertify.logPosition("bottom left");
                alertify.error(data.message)
            }
        }
    });
    /*  $.ajax({
         "url": "/eEntity/getConsumerPartnerStock", "method": "POST", data: json, success: function (res) {
             let data = res.body;
             $('#loader').fadeOut('slow');
             if (data.status == 200) {
                 $("#goldStock").html(decimalChopper(data.resource.qtyG24K, 4) + " gms")
                 $("#silverStock").html(decimalChopper(data.resource.qtyS99P, 4) + " gms")
             }
             else {
                 alertify.logPosition("bottom left");
                 alertify.error(data.message)
             }
         }
     }); */
}
function loadCounter(json) {

    $.ajax({
        "url": "/eEntity/fetchCounter", "method": "POST", data: json, success: function (res) {
            let data = res.body;
            $('#loader').fadeOut('slow');
            if (data.status == 200) {
                $("#nodeCount").html(data.resource.partner)
                $("#consCount").html(data.resource.consumer)
            }
            else {
                alertify.logPosition("bottom left");
                alertify.error(data.message)
            }
        }
    });
}

function loadDate(startDate, endDate) {
    $('#config-date span').html(startDate.format('MMMM D, YYYY') + ' - ' + endDate.format('MMMM D, YYYY'));
    startDate = moment().subtract(30, 'days').format('MM-DD-YYYY');
    endDate = moment().format('MM-DD-YYYY');

    var options = {
        startDate: moment().subtract(30, 'days'),
        opens: 'left'
    };
    options.ranges =
    {
        /* 'Last 1hr': [moment().subtract(1, 'h'),moment()],
        'Last 6hrs': [moment().subtract(6, 'h'),moment()], */
        'Today': [moment(), moment()],
        'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
        'Last 7 Days': [moment().subtract(6, 'days'), moment()],
        'Last 30 Days': [moment().subtract(29, 'days'), moment()],
        'This Month': [moment().startOf('month'), moment().endOf('month')],
        'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
    };

    // console.log("h")
    // attach daterangepicker plugin
    $('#config-date').daterangepicker(options, function (start, end, label) {
        isDate = true;
        $('#config-date span').html(start.format('MMM DD, YYYY') + '-' + end.format('MMM DD, YYYY'));
        getReportDateWise(start, end);
    });
    $('#config-date').on('cancel.daterangepicker', function (ev, picker) {
        var truid = $("#txteTruid").val();
        isDate = false;
        var json = { "rTruID": truid, flag: "all" };
        $('#loader').css('display', 'block');

        var startDate = moment().subtract(30, 'days');
        var endDate = moment();
        loadDate(startDate, endDate);
        partnerTxnFor(json)
    });
}
function callHR(istime) {
    var start, end;
    if (istime == "1") {
        start = moment().subtract(1, 'h').format('MMM DD, YYYY HH:mm:ss');
        end = moment().format('MMM DD, YYYY HH:mm:ss');
    }
    else if (istime == "6") {
        start = moment().subtract(6, 'h').format('MMM DD, YYYY HH:mm:ss');
        end = moment().format('MMM DD, YYYY HH:mm:ss');
    }
    var myDateStart = new Date(start);
    var myDateEnd = new Date(end);
    getReportDateWise(myDateStart, myDateEnd);
}

function getReportDateWise(startD, endD) {
    var start = $('#config-date').data('daterangepicker').startDate._d;
    var end = $('#config-date').data('daterangepicker').endDate._d;
    var truid = $("#txteTruid").val();
    var successSelected = $('input[name=partnerTxnFor]:checked').val();
    var json = {
        "rTruID": truid,
        "flag": successSelected,
        "startdate": start,
        "enddate": end
    }
    partnerTxnFor(json, startD, endD)
}

function bindRecord(res, json, startD, endD) {
    var buyg24kTotalAmount = parseFloat(res.resource.buy.g24kTotalAmount)
    var buys99pTotalAmount = parseFloat(res.resource.buy.s99pTotalAmount) 
    var transferg24kTotalAmount = parseFloat(res.resource.transfer.g24kTotalAmount)
    var transfers99pTotalAmount = parseFloat(res.resource.transfer.s99pTotalAmount)
    var buy = {
        g24kTotalAmount: decimalChopper(res.resource.buy.g24kTotalAmount, 4),
        s99pTotalAmount: decimalChopper(res.resource.buy.s99pTotalAmount, 4),
        g24kTotalQTY: decimalChopper(res.resource.buy.g24kTotalQTY, 4),
        s99pTotalQTY: decimalChopper(res.resource.buy.s99pTotalQTY, 4)
    }
    var redeemCash = {
        g24kTotalAmount: decimalChopper(res.resource.redeemCash.g24kTotalAmount, 4),
        s99pTotalAmount: decimalChopper(res.resource.redeemCash.s99pTotalAmount, 4),
        g24kTotalQTY: decimalChopper(res.resource.redeemCash.g24kTotalQTY, 4),
        s99pTotalQTY: decimalChopper(res.resource.redeemCash.s99pTotalQTY, 4),
    }
    var transfer = {
        g24kTotalAmount: decimalChopper(res.resource.transfer.g24kTotalAmount, 4),
        s99pTotalAmount: decimalChopper(res.resource.transfer.s99pTotalAmount, 4),
        g24kTotalQTY: decimalChopper(res.resource.transfer.g24kTotalQTY, 4),
        s99pTotalQTY: decimalChopper(res.resource.transfer.s99pTotalQTY, 4)
    }

    var rpt = {
        "buyTotalAmt": decimalChopper(parseFloat(buyg24kTotalAmount) + parseFloat(buys99pTotalAmount), 4),
        "transferTotalAmt": decimalChopper(parseFloat(transferg24kTotalAmount) + parseFloat(transfers99pTotalAmount), 4),
        "entityName": $('#txtname').html(),
        "txnCount": res.resource.allTxn.txnCount ? decimalChopper(res.resource.allTxn.txnCount, 4) : '0',
        "totalAmount": res.resource.allTxn.totalAmount ? decimalChopper(res.resource.allTxn.totalAmount, 4) : '0',
        "totalQTY": res.resource.allTxn.totalQTY ? decimalChopper(res.resource.allTxn.totalQTY, 4) : '0',
        "totalTAX": res.resource.allTxn.totalTAX ? decimalChopper(res.resource.allTxn.totalTAX, 4) : '0',
        "buy": buy,
        "redeemCash": redeemCash,
        "transfer": transfer
    }
    var report = {
        "report": [
            rpt
        ]
    };
    $("#reportmustache").empty();
    var list = $("#report").html();
    var html = Mustache.to_html(list, report);
    $("#reportmustache").html(html);
    loadCounter(json)
    BindDWalletdata();
    if (isDate) {
        loadDate(startD, endD);
    }
    else {
        var startDate = moment().subtract(30, 'days');
        var endDate = moment();
        loadDate(startDate, endDate);
    }


}

function BindDWalletdata() {
    $ctruid = $("#txteTruid").val()
    var successSelected = $('input[name=partnerTxnFor]:checked').val();
    var json = { "rTruID": $ctruid, flag: successSelected };
    $('#loader').css('display', 'block');
    $.ajax({
        "url": "/eEntity/partnerPartnerDashStock", "method": "POST", data: json, success: function (a) {
            $('#loader').fadeOut('slow');
            let data = a.body;
            if (data.status == 200) {
                if (data.resource) {
                    $stock = data.resource.consumerStock?data.resource.consumerStock[0]:null;
                    $enStock = data.resource.enStock?data.resource.enStock[0]:null;
                    if($enStock)
                    {
                        var sG24K = ($enStock.G24K) ? decimalChopper(parseFloat($enStock.G24K), 4) : "0";
                        var sS99P = ($enStock.S99P) ? decimalChopper(parseFloat($enStock.S99P), 4) : "0";
                        $("#selfgoldStock").text(sG24K);
                        $("#selfsilverStock").text(sS99P);
                    }
                    if($stock)
                    {
                        var cG24K = ($stock && $stock.G24K) ? decimalChopper(parseFloat($stock.G24K), 4) : "0";
                        var cS99P = ($stock && $stock.S99P) ? decimalChopper(parseFloat($stock.S99P), 4) : "0";
                        $("#goldStock").html(cG24K);
                        $("#silverStock").html(cS99P);
                    }
                   
                 
                }
                else {
                    $("#selfgoldStock").text("0")
                    $("#selfsilverStock").text("0")
                }
            }
            else {
                alertify.error("Something went wrong..!!")
            }
        }
    });
}

function BindWallData() {
    $etruid = $("#txteTruid").val().trim()
    var json = {
        "rTruID": $etruid
    };
    $('#loader').css("display", 'block');
    $.ajax({
        "url": "/entityWallet/getWalletBal", "method": "POST", data: json, success: function (a) {
            $('#loader').fadeOut('slow');
            let data = a.body;
            if (data.status == 200) {
                 var WalletBal = data.WalletBal !== 'NA' ? '<i class="mdi mdi-currency-inr"></i>' + decimalChopper(data.WalletBal, 4) : '<i class="mdi mdi-currency-inr"></i>' + "0";
                 $("#fWalletBalance").html(WalletBal);
            }
            else {
                totalBal = 0;
                alertify.error("Something went wrong..!!")
            }
        }
    });
}