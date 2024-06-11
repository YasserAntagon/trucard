$(document).ready(function () {
    $(".byKyc-menu li a").click(function () { //KYC
        $("#byKyc").text($(this).text());
        var select = $(this).attr("data")
        $("#byKyc").attr("selectedText", select);
        filterClick();
    });
    $(".truasc-menu li a").click(function () { // partner
        $("#bySort").html($(this).html());
        var select = $(this).attr("data")
        $("#bySort").attr("selectedText", select);
        filterClick();
    });
    $(".byActive-menu li a").click(function () { //KYC
        $("#byActive").text($(this).text());
        var select = $(this).attr("data")
        $("#byActive").attr("selectedText", select);
        onActiveTxnFor(select)
    });
    $(".byTop-menu li a").click(function () { //KYC
        $("#byTop").text($(this).text());
        var select = $(this).attr("data")
        $("#byTop").attr("selectedText", select);
        onActiveTxnFor(select)
    });
    
    $(".byTopTxn-menu li a").click(function () { //KYC
        $("#byTopTxn").text($(this).text());
        var select = $(this).attr("data")
        $("#byTopTxn").attr("selectedText", select);
        onTxnFor(select)
    });


    $(".byTime-menu li a").click(function () { //KYC
        $("#byTime").text($(this).text());
        var select = $(this).attr("data")
        $("#byTime").attr("selectedText", select);
        callTop5Txn(select);
    });
    $(".byTimeHigh-menu li a").click(function () { //KYC
        $("#byTimeHigh").text($(this).text());
        var select = $(this).attr("data")
        $("#byTimeHigh").attr("selectedText", select);
        callHigh5Txn(select);
    });

    function callTop5Txn(istime) {
        var json = {};
        var start, end;
        if (istime == "1") {
            start = moment().subtract(1, 'h').format('MMM DD, YYYY HH:mm:ss');
            end = moment().format('MMM DD, YYYY HH:mm:ss');
            var myDateStart = new Date(start);
            var myDateEnd = new Date(end);
            json.startDate = myDateStart;
            json.endDate = myDateEnd;
            json.dateFlag = true;
        }
        else if (istime == "6") {
            start = moment().subtract(6, 'h').format('MMM DD, YYYY HH:mm:ss');
            end = moment().format('MMM DD, YYYY HH:mm:ss');
            var myDateStart = new Date(start);
            var myDateEnd = new Date(end);
            json.startDate = myDateStart;
            json.endDate = myDateEnd;
            json.dateFlag = true;
        }
        else {
            json = {}
        }
        Top5TransactionsDateWaise(json, "revenue");
    }
    function callHigh5Txn(istime) {
        var json = {};
        var start, end;
        if (istime == "1") {
            start = moment().subtract(1, 'h').format('MMM DD, YYYY HH:mm:ss');
            end = moment().format('MMM DD, YYYY HH:mm:ss');
            var myDateStart = new Date(start);
            var myDateEnd = new Date(end);
            json.startDate = myDateStart;
            json.endDate = myDateEnd;
            json.dateFlag = true;
        }
        else if (istime == "6") {
            start = moment().subtract(6, 'h').format('MMM DD, YYYY HH:mm:ss');
            end = moment().format('MMM DD, YYYY HH:mm:ss');
            var myDateStart = new Date(start);
            var myDateEnd = new Date(end);
            json.startDate = myDateStart;
            json.endDate = myDateEnd;
            json.dateFlag = true;
        }
        else {
            json = {}
        }
        Top5TransactionsDateWaise(json, "payout")
    }
});