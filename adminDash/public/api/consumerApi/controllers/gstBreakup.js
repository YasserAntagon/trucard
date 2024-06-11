var isDate = false;
function BindWallData() {
    $etruid = $("#txtcTruid").val().trim()
    var json = {
        "cTruID": $etruid
    };
    $(".spinnerRev").removeClass("hidden")
    $(".spinnerVal").addClass("hidden")
    $('#loader').css("display", 'block');
    $.ajax({
        "url": "/consumerActive/searchConsumerdetails", "method": "POST", data: json, success: function (a) {
            $("#consumerDetailsLoader").fadeOut("slow");
            let res = a.body;
            if (res.status == 200) {
                var data = res.resource;
                var WalletBal = data.balance !== 'NA' ? decimalChopper(data.balance, 4) : "0";
                $("#walBal").html(WalletBal);
                $(".spinnerRev").addClass("hidden")
                $(".spinnerVal").removeClass("hidden")
            } else {
                $(".spinnerRev").addClass("hidden")
                $(".spinnerVal").removeClass("hidden")
                alertify.error("Somthing went wrong..!!");
            }
        }
    });
}
$(document).ready(function () {
    BindWallData();
    loaddate();
    $(".byTime-menu li a").click(function () { //KYC
        $("#byTime").text($(this).text());
        var select = $(this).attr("data")
        $("#byTime").attr("selectedText", select);
        callTop5Txn(select);
    });
});
function onclear() {
    isDate = false;
    BindWallData();
    loaddate();
    $etruid = $("#txtcTruid").val().trim();
    var json = {
        "to": $etruid
    };
    OnGSTView(json);
}

function loaddate() {
    var options = {};
    options.ranges =
    {
        'Today': [moment(), moment()],
        'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
        'Last 7 Days': [moment().subtract(6, 'days'), moment()],
        'Last 30 Days': [moment().subtract(29, 'days'), moment()],
        'This Month': [moment().startOf('month'), moment().endOf('month')],
        'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
    };
    // Attach daterangepicker plugin
    $('#config-demo').daterangepicker(options, function (start, end, label) {
        isDate = true;
        $('#config-demo .form-control').html(start.format('MMM DD, YYYY') + '-' + end.format('MMM DD, YYYY'));
        callGSTTxn();
    });
    var startDate = moment();
    var endDate = moment();
    $('#config-demo .form-control').html(startDate.format('MMM DD, YYYY') + '-' + endDate.format('MMM DD, YYYY'));
    callGSTTxn()
};

var callGSTTxn = function () {
    var start = $('#config-demo').data('daterangepicker').startDate._d;
    var end = $('#config-demo').data('daterangepicker').endDate._d;
    $etruid = $("#txtcTruid").val().trim();
    var json = {
        "to": $etruid
    };
    if (isDate) {
        json.startdate = start;
        json.enddate = end;
    }
    OnGSTView(json);
}
function OnGSTView(json)    // on click on view invoice 
{
    $('#loader').css("display", 'block');
    $(".se-pre-con").css("display", "block");
    $(".target-output").empty();
    $.ajax({
        "url": "/eEntity/egetGSTReport", "method": "POST", data: json, success: function (res) {
            $('#loader').fadeOut('slow');
            if (res.status == 200) {
                var dataA = res.resource.total;
                var total_Amount = dataA.total.Total_Amount ? decimalChopper(dataA.total.Total_Amount, 4) : "0";
                var total_GST = dataA.total.Total_GST ? decimalChopper(dataA.total.Total_GST, 4) : "0";
                $("#cTotalTxn").html(total_Amount);
                $("#cTotalGST").html(total_GST);

                var start = $('#config-demo').data('daterangepicker').startDate._d;
                var end = $('#config-demo').data('daterangepicker').endDate._d;
                if (isDate) {
                    var startA = dataA.total.start ? FormatDateToString(start, "ddmmyyyy") : "";
                    var endA = dataA.total.end ? FormatDateToString(end, "ddmmyyyy") : "";
                    jsonGST(res.resource.particular, startA, endA);
                }
                else {
                    var start = dataA.total.start ? FormatDateToString(dataA.total.start, "ddmmyyyy") : "";
                    var end = dataA.total.end ? FormatDateToString(dataA.total.end, "ddmmyyyy") : "";
                     
                    jsonGST(res.resource.particular, start, end);
                }

            }
        }
    })
}
// GST Preview
function jsonGST(fFData,start,end) {
    var data = [];
    var date = new Date();
    var to = fFData.to;
    var companyName = fFData.companyName;
    if (fFData.companyName) {
        delete fFData.companyName
    }
    if (fFData.to) {
        delete fFData.to
    }
    var totalGST = 0;
    var totalAmt = 0;
    Object.entries(fFData).forEach(([key, value]) => {
        var title = key.toUpperCase().replace("_", " ")
        var json = { "title": title.replace("REDEEMCASH", "SELL") };
        var keyTitle = key;
        Object.entries(value).forEach(([key, values]) => {
            if (key.includes(keyTitle + "_TotalGST")) {
                json.gst = decimalChopper(parseFloat(values), 4);
                totalGST = totalGST + parseFloat(values);
            }
            else {
                json.amount = decimalChopper(parseFloat(values), 4);
                totalAmt = totalAmt + parseFloat(values);
            }
        })
        data.push(json)
    });
    fFData.start = start;
    fFData.end = end;
    fFData.date = FormatDateToString(date, "time");
    fFData.to = replaceWithX(to);
    fFData.companyName = companyName;
    fFData.listData = data;
    fFData.myData = [{
        "title": "Total",
        "amount": decimalChopper(parseFloat(totalAmt), 4),
        "gst": decimalChopper(parseFloat(totalGST), 4)

    }];


    var invoice = {
        "invoice": [fFData]
    };
    var list = $("#GSTBreakup").html();
    var html = Mustache.to_html(list, invoice);
    $(".target-output").html(html);
    $(".showstock").removeClass("hidden")
    $(".btnstohide").remove();

}
function callTop5Txn(istime) {
    var start, end;
    $etruid = $("#txtcTruid").val().trim();
    var json = { "to": $etruid };
    if (istime == "1") {
        start = moment().subtract(1, 'h').format('MMM DD, YYYY HH:mm:ss');
        end = moment().format('MMM DD, YYYY HH:mm:ss');
        var myDateStart = new Date(start);
        var myDateEnd = new Date(end);
        json.startdate = myDateStart;
        json.enddate = myDateEnd;
    }
    else if (istime == "6") {
        start = moment().subtract(6, 'h').format('MMM DD, YYYY HH:mm:ss');
        end = moment().format('MMM DD, YYYY HH:mm:ss');
        var myDateStart = new Date(start);
        var myDateEnd = new Date(end);
        json.startdate = myDateStart;
        json.enddate = myDateEnd;
    }
    else {
        json = {
            "to": $etruid
        };
    }

    OnGSTView(json);
}

