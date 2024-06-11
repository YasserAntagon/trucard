$(document).ready(function () {
    $(".trudropdown-menu li a").click(function () { //KYC
        $("#byOptions").text($(this).text());
        var select = $(this).attr("data")
        $("#byOptions").attr("selectedText", select);
        pendingClick();
    }); 
    $(".truasc-menu li a").click(function () { // partner
        $("#bySort").html($(this).html());
        var select = $(this).attr("data")
        $("#bySort").attr("selectedText", select); 
        pendingClick();
    });
    $(".byTime-menu li a").click(function () { //KYC
        $("#byTime").text($(this).text());
        var select = $(this).attr("data")
        $("#byTime").attr("selectedText", select);
        callTop5Txn(select);
    });
    function callTop5Txn(istime) {
        var json = {};
        var start, end;
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
            json = {}
        }
    
        loadDataInTable(json);
    }
});