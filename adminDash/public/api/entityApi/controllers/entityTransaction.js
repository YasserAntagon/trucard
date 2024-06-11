// author : Suresh Patil
// date : 03-06-2019
// Description : Entity Transactions 
var tableReq;
var table;
$(function () {
    $('.radio-group label').on('click', function () {
        $(this).removeClass('not-active').siblings().addClass('not-active');
    });

    bindSummaryALL();
});
function refreshClick() {
    loaddate();
    bindSummaryALL();
}
var bindSummaryALL = function () {
    var $ctruid = $("#txteTruid").val();
    var json = { "rTruID": $ctruid }
    $('#loader').css("display", 'block');
    
    $.ajax({
        "url": "/eEntity/getWalletTransdetails", "method": "POST", "data": json, success: function (res) {
            $("#loader").fadeOut('slow');
            let data = res.body;
            if (data.status == 200) {
                bindDatatTableFloat(data.resource);
            }
            else if (data.status == 411) {
                $("#loader").fadeOut('slow');
                alertify.error("Something Went Wrong..!!");
                return false;
            }
            else {
                $("#loader").fadeOut('slow');
            }
        }
    });
    $.ajax({
        "url": "/eEntity/getTransdetails", "method": "POST", data: json, success: function (res) {
            $('#loader').fadeOut('slow');
            let data = res.body;
            if (data.status == 200) {
                //  loadbuydata();
            }
            else {
                alertify.logPosition("bottom left");
                alertify.error(data.messege);
            }
        }
    });
    $.ajax({
        "url": "/eEntity/getselfTrans", "method": "POST", data: json, success: function (res) {
            $('#loader').fadeOut('slow');
            let data = res.body;
            if (data.status == 200) {
                //  loadbuydata();
            } else {
                alertify.logPosition("bottom left");
                alertify.error(data.messege);
            }
        }
    });
}

function successClick() {
    var trans_type = $('input[name=gg]:checked').val();
    var trans_stutus = $('input[name=success]:checked').val();
    var selfentity = $('input[name=self]:checked').val();
    loadTransaction(trans_stutus, trans_type, selfentity);
}

function handleClick() {
    var trans_type = $('input[name=gg]:checked').val();
    var trans_stutus = $('input[name=success]:checked').val();
    var selfentity = $('input[name=self]:checked').val();
    loadTransaction(trans_stutus, trans_type, selfentity);
}
function self() {
    var trans_type = $('input[name=gg]:checked').val();
    var trans_stutus = $('input[name=success]:checked').val();
    var selfentity = $('input[name=self]:checked').val();
    $(".consumerTrans").addClass('hidden');
    $(".walletOps").addClass('hidden');
    if (selfentity == "floatOperation") {
        $(".walletOps").removeClass('hidden');
    }
    else {
        $(".consumerTrans").removeClass('hidden');
    }
    loadTransaction(trans_stutus, trans_type, selfentity);
}
function loadbuydata() {
    var trans_type = $('input[name=gg]:checked').val();
    var trans_stutus = $('input[name=success]:checked').val();
    var selfentity = $('input[name=self]:checked').val();
    loadTransaction(trans_stutus, trans_type, selfentity);;
}
var bindDatatTableFloat = function (arr) {
    accData = new Array();
    for (var i = 0; i < arr.length; i++) {
        var buyArr = arr[i];
        var transType;
        var desc;
        switch (buyArr.tType) {
            case "buy":
                transType = "Buy";
                desc = "Buy";
                break;
            case "buyCash":
                transType = "Buy";
                desc = "Buy";
                break;
            case "sell":
                transType = "Sell";
                desc = "Sell";
                break;
            case "redeemCash":
                transType = "Sell";
                desc = "Sell";
                break;
            case "transfer":
                transType = "Transfer";
                desc = "Transfer";
                break;
            default:
                transType = buyArr.tType;
                desc = "";
        }
        if (buyArr.createDate) {
            var date = new Date(Date.parse(buyArr.createDate));
            month = Date.parse(date);
            fdate = FormatDateToString(date, "time");
        }
        var amount = '<strong><span><i class="mdi mdi-currency-inr"></i> 0 </span></strong>';
        var amountval = 0;
        if (buyArr.Cr && buyArr.Cr != "NaN" && buyArr.Cr != "0") {
            amount = '<strong><span class="text-success"> + <i class="mdi mdi-currency-inr"></i>' + decimalChopper(buyArr.Cr, 2) + '</span></strong>';
            amountval = decimalChopper(buyArr.Cr, 2);
        }
        if (buyArr.Dr && buyArr.Dr != "NaN" && buyArr.Dr != "0") {
            amount = '<strong><span class="text-danger"> - <i class="mdi mdi-currency-inr"></i>' + decimalChopper(buyArr.Dr, 2) + '</span></strong>';
            amountval = "-" + decimalChopper(buyArr.Dr, 2);
        }
        var rqueue = {
            'crn': "-",
            'invoice': buyArr.invoice,
            'cdt': (fdate) ? fdate : "-",
            'dateTime': (fdate) ? '<span style="display:none">' + month + '</span>' + fdate : "-",
            "transType": transType,
            'amount': amount,
            'amountval': amountval,
            'desc': desc,
            "view": "-"
        };
        accData.push(rqueue);
    }
    loadDataInTableFloat(accData)
}

function loadDataInTableFloat(accData) {
    // var accData= new Array()
    if ($.fn.dataTable.isDataTable('#wQueue')) {
        tableReq.clear();
        tableReq.rows.add(accData);
        tableReq.draw();

    }
    else {
        tableReq = $('#wQueue').DataTable({
            "processing": true,
            "info": true,
            "bLengthChange": false,
            "pageLength": 10,
            "order": [[3, "desc"]],
            data: accData,
            lengthChange: false,
            "dom": '<"toolbar">frtip',
            buttons: [
                {
                    extend: 'excel',
                    filename: 'Wallet Operations',
                    exportOptions: {
                        columns: [1, 2, 4, 6, 7]
                    }
                },
                {
                    extend: 'pdf',
                    filename: 'Wallet Operations',
                    title: 'Wallet Operations List',
                    exportOptions: {
                        columns: [1, 2, 4, 6, 7]
                    }
                }],

            "columns": [
                { "data": "crn" },
                { "data": "invoice" },
                { "data": "cdt" },
                { "data": "dateTime" },
                { "data": "transType" },
                {
                    "data": null,
                    "render": function (data) {
                        return data.amount;
                    }
                },
                { "data": "amountval" },
                { "data": "desc" },
                { "data": "view" },

            ],
            "columnDefs": [
                {
                    "targets": [2, 6],
                    "visible": false

                }
            ]
        });
        $("div.toolbar").html('<span class="fpdf"></span>');
        $('.toolbar').css("display", "flex");
        loaddate();
        tableReq.buttons().container()          // buttons excel,pdf,visiblility
            .appendTo('.fpdf');
        $('.fpdf div').addClass("btn-group-sm")
        $("#wQueue_wrapper").removeClass('container-fluid')
        tableReq.on('order.dt search.dt', function () {
            tableReq.column(0, { search: 'applied', order: 'applied' }).nodes().each(function (cell, i) {
                cell.innerHTML = i + 1;
            });
        }).draw();
    }

    $("#summaryloader").fadeOut("slow")
}
var loadTransaction = function (status, type, selfentity) {
    accData = new Array();
    var $ctruid = $("#txteTruid").val();
    let json = {
        truID: $ctruid,
        status: status
    }
    $('#loader').css("display", 'block');
    if (selfentity == "floatOperation") {
        let json = { rTruID: $ctruid }
        $.ajax({
            "url": "/eEntity/getWalletTransdetails", "method": "POST", "data": json, success: function (res) {
                $("#loader").fadeOut('slow');
                let data = res.body;
                if (data.status == 200) {
                    bindDatatTableFloat(data.resource);
                }
                else if (data.status == 411) {
                    $("#loader").fadeOut('slow');
                    alertify.error("Something Went Wrong..!!");
                    return false;
                }
                else {
                    $("#loader").fadeOut('slow');
                }
            }
        });
    }
    else if (selfentity == "consumer") {
        if (type == "all") {
            var jsonData = {
                "truID": $ctruid,
                "status": status,
                "stat": type,
                "isSelf": selfentity
            };
            $.ajax({
                "url": "/entityDB/getallTransDatewise", "method": "POST", data: jsonData, success: function (res) {
                    $('#loader').fadeOut('slow');
                    $data = res.body;
                    if ($data.length > 0) {
                        bindDatatTable($data, type, selfentity);
                    } else {
                        var xyz = new Array()
                        bindDatatTable(xyz, type);
                    }
                }
            });
        }
        else if (type == "buy") {
            $.ajax({
                "url": "/entityDB/getBuyHistory", "method": "POST", data: json, success: function (res) {
                    $('#loader').fadeOut('slow');
                    $data = res.body;
                    if ($data.length > 0) {
                        bindDatatTable($data, type, selfentity);
                    } else {
                        var xyz = new Array()
                        bindDatatTable(xyz, type);
                    }
                }
            });
        }
        else if (type == "redeem") {
            $.ajax({
                "url": "/entityDB/getredeemHistory", "method": "POST", data: json, success: function (res) {
                    $('#loader').fadeOut('slow');
                    $data = res.body;
                    if ($data.length > 0) {
                        bindDatatTable($data, type, selfentity);
                    } else {
                        var xyz = new Array()

                        bindDatatTable(xyz, type);
                    }
                }
            });
        }
        else if (type == "transfer") {
            $.ajax({
                "url": "/entityDB/gettransferHistory", "method": "POST", data: json, success: function (res) {
                    $('#loader').fadeOut('slow');
                    $data = res.body;
                    if ($data.length > 0) {
                        bindDatatTable($data, type, selfentity);
                    } else {
                        var xyz = new Array()
                        bindDatatTable(xyz, type);
                    }
                }
            });
        }
    }
    else {
        if (type == "all") {
            var jsonData = {
                "truID": $ctruid,
                "status": status,
                "stat": type,
                "isSelf": selfentity
            };
            $.ajax({
                "url": "/entityDB/getallTransDatewise", "method": "POST", data: jsonData, success: function (res) {
                    $('#loader').fadeOut('slow');
                    $data = res.body;
                    if ($data.length > 0) {
                        bindDatatTable($data, type, selfentity);
                    }
                    else {
                        var xyz = new Array()
                        bindDatatTable(xyz, type);
                    }
                }
            });
        }
        else if (type == "buy") {
            $.ajax({
                "url": "/entityDB/getSelfBuyHistory", "method": "POST", data: json, success: function (res) {
                    $('#loader').fadeOut('slow');
                    $data = res.body;
                    if ($data.length > 0) {
                        bindDatatTable($data, type, selfentity);
                    } else {
                        var xyz = new Array()
                        bindDatatTable(xyz, type);
                    }
                }
            });
        }
        else if (type == "redeem") {
            $.ajax({
                "url": "/entityDB/getselfredeemHistory", "method": "POST", data: json, success: function (res) {
                    $('#loader').fadeOut('slow');
                    $data = res.body;
                    if ($data.length > 0) {
                        bindDatatTable($data, type, selfentity);
                    } else {
                        var xyz = new Array()

                        bindDatatTable(xyz, type);
                    }
                }
            });
        }
        else if (type == "transfer") {
            $('#loader').fadeOut('slow');
            var xyz = new Array()
            bindDatatTable(xyz, type);
        }
    }
}
function displayTable(accData) {
    if ($.fn.dataTable.isDataTable('#example')) {
        table.clear();
        table.rows.add(accData);
        table.draw();
    }
    else {
        table = $('#example').DataTable({
            "processing": true,
            "info": true,
            "bLengthChange": false,
            "pageLength": 10,
            "order": [[5, "desc"]],
            data: accData,
            lengthChange: false,
            "dom": '<"toolbar">frtip',
            buttons: [
                {
                    extend: 'excel',
                    filename: 'Partner Transactions',
                    exportOptions: {
                        columns: [1, 26, 4, 6, 7, 19, 20, 21, 11, 12, 22, 23, 24, 25, 17]
                    }
                }/* ,
                {
                    extend: 'pdf',
                    filename: 'Partner Transactions',
                    title: 'Partner Transactions',
                    exportOptions: {
                        columns: [1, 26, 4, 6, 7, 19, 20, 21, 11, 12, 22, 23, 24, 25, 17]
                    }
                } */],                     // PASS ARRAY TO HERE
            "columns": [
                { "data": "crn" },
                { "data": "invoice" },
                {
                    "data": "rTruID"
                },
                {
                    "data": null,
                    "render": function (data) {
                        return data.consumerName + "\n<br><small>(" + data.toSixId + ")</small>";
                    }
                },
                { "data": "cdt" },
                { "data": "dateTime" },
                {
                    "data": null,
                    "render": function (data) {
                        if (data.productType == "Gold") {
                            return "<label class='label label-g24' title='TruCoin Gold'>TruCoin Gold</label>";
                        } else if (data.productType == "Silver") {
                            return "<label class='label label-s99' title='TruCoin Silver'>TruCoin Silver</label>";
                        } else if (data.productType == "SilverGold") {
                            return "<label class='label label-g24' title='TruCoin Gold'>TruCoin Gold</label><br /><label class='label label-s99' title='TruCoin Silver'>TruCoin Silver</label>";
                        } else if (data.productType == "GoldSilver") {
                            return "<label class='label label-g24' title='TruCoin Gold'>TruCoin Gold</label><br /><label class='label label-s99' title='TruCoin Silver'>TruCoin Silver</label>";
                        }
                    }
                },
                { "data": "transType" },
                {
                    "data": null,
                    "render": function (data) {
                        return "<i class='mdi mdi-currency-inr'></i>" + decimalChopper(data.amount, 2);
                    }
                },
                {
                    "data": null,
                    "render": function (data) {
                        return "<i class='mdi mdi-currency-inr'></i>" + decimalChopper(data.tax, 4);
                    }
                },
                {
                    "data": null,
                    "render": function (data) {
                        return '<i class="mdi mdi-currency-inr"></i>' + decimalChopper(data.totalamount, 2);
                    }
                },
                {
                    "data": null,
                    "render": function (data) {
                        return data.brate;
                    }
                },
                { "data": "btype" },
                {
                    "data": null,
                    "render": function (data) {
                        return "<i class='mdi mdi-currency-inr'></i>" + decimalChopper(data.earning, 2);
                    }
                },
                {
                    "data": null,
                    "render": function (data) {
                        return '<i class="mdi mdi-currency-inr"></i>' + decimalChopper(data.totalamount, 2);
                    }
                },
                {
                    "data": null,
                    "render": function (data) {
                        return "<i class='mdi mdi-currency-inr'></i>" + decimalChopper(data.earning, 2);
                    }
                },
                {
                    "data": null,
                    "render": function (data) {
                        return "<i class='mdi mdi-currency-inr'></i>" + decimalChopper(data.revenue, 2);
                    }
                },
                { "data": "txn_status" },
                { "data": "view" },
                { "data": "amount" },
                { "data": "tax" },
                { "data": "totalamount" },
                { "data": "earning" },
                { "data": "totalamount" },
                { "data": "earning" },
                { "data": "revenue" },
                { "data": "consumerName" },
                { "data": "transactionType" }

            ],
            "columnDefs": [
                {
                    "targets": [2, 4, 19, 20, 21, 22, 23, 24, 25, 26,27],
                    "visible": false

                }
            ]
        });

        $("div.toolbar").html('<span class="pdf"></span>');
        loaddate();
        table.buttons().container().appendTo('.pdf');
        $('.pdf div').addClass("btn-group-sm");
        $('.toolbar').css("display", "flex");
        $("#example_wrapper").removeClass('container-fluid');
        table.on('order.dt search.dt', function () {
            table.column(0, { search: 'applied', order: 'applied' }).nodes().each(function (cell, i) {
                cell.innerHTML = i + 1;
            });
        }).draw();
        $('.status-dropdown').on('change', function (e) {
            var status = $(this).val();
            $('.status-dropdown').val(status)
            table.column(27).search(status).draw();
        })
    }

}
var getStatement = function (start, end)                 // On Selected Date to bind Account Transaction
{
    $("#summaryloader").css("display", "block");
    var stat = $('input[name=gg]:checked').val();
    var trans_stutus = $('input[name=success]:checked').val();
    var selfentity = $('input[name=self]:checked').val();
    var $ctruid = $("#txteTruid").val();
    if (selfentity == "floatOperation") {
        let json = {
            "rTruID": $ctruid,
            "dateFlag": true,
            "startDate": start,
            "endDate": end
        };
        $.ajax({
            "url": "/eEntity/getWalletTransdetails", "method": "POST", "data": json, success: function (res) {
                $("#loader").fadeOut('slow');
                let data = res.body;
                if (data.status == 200) {
                    bindDatatTableFloat(data.resource);
                }
                else if (data.status == 411) {
                    $("#loader").fadeOut('slow');
                    alertify.error("Something Went Wrong..!!");
                    return false;
                }
                else {
                    $("#loader").fadeOut('slow');
                }
            }
        });
    }
    else {
        var json = {
            "truID": $ctruid,
            "status": trans_stutus,
            "start": start,
            "end": end,
            "stat": stat,
            "isSelf": selfentity
        };
        $.ajax({
            "url": "/entityDB/getallTransDatewise", "method": "POST", data: json, success: function (a) {
                bindDatatTable(a.body, stat);
            }
        });
    }
}
var myCallback = function (start, end) {
    $('#config-demo .form-control').html(start.format('MMM DD, YYYY') + '-' + end.format('MMM DD, YYYY'));
    var start = start.format('MM-DD-YYYY');
    var end = end.format('MM-DD-YYYY');
    getStatement(start, end);  // call get account statement
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
    // attach daterangepicker plugin
    $('#config-demo').daterangepicker(options, function (start, end, label) {
        myCallback(start, end);
    });
    var startDate = moment().subtract(30, 'days');
    var endDate = moment();
    $('#config-demo .form-control').html(startDate.format('MMM DD, YYYY') + '-' + endDate.format('MMM DD, YYYY'));
};
var bindDatatTable = function ($data, status, trans_type) {
    accData = new Array();
    var buyArr, redeemCash, buybycash;
    if (status != "all") {
        if (status == "buy") {
            buyArr = new Array();
            buybycash = new Array()
            var l = 0;
            if ($data.length != 0) {
                if ($data[0].buyUnit) {
                    buyArr = $data[0].buyUnit;
                    l = 1;
                    var tstatus = "Buy";

                    if (buyArr) {
                        for (var i = 0; i < buyArr.length; i++) {
                            var accVar = "";
                            if (buyArr[i].particularG24) {
                                accVar = loadArrayTrans(buyArr[i], buyArr[i].particularG24, tstatus, trans_type);
                            }
                            if (buyArr[i].particularS99) {
                                accVar = loadArrayTrans(buyArr[i], buyArr[i].particularS99, tstatus, trans_type);
                            }
                            accData.push(accVar);
                        }

                    }

                }
                if ($data[0].buyCash) {
                    buybycash = $data[0].buyCash;
                    l = 1;
                    var tstatus = "Buy";
                    if (buybycash) {
                        for (var i = 0; i < buybycash.length; i++) {
                            if (buybycash[i].particularG24) {
                                var accVar = loadArrayTrans(buybycash[i], buybycash[i].particularG24, tstatus, trans_type);
                            }
                            if (buybycash[i].particularS99) {
                                var accVar = loadArrayTrans(buybycash[i], buybycash[i].particularS99, tstatus, trans_type);
                            }


                            // console.log("conDetail = " + accVar);
                            accData.push(accVar);

                        }

                    }


                }
            }
            if (l == 0) {
                WarnMsg(" Partner", "No Record Found..!!");
                accData = new Array();
            }
            displayTable(accData);
        }
        else if (status == "redeem") {
            redeemCash = new Array();
            var l = 0;
            if ($data.length != 0) { 
                if ($data[0].redeemCash) {
                    redeemCash = $data[0].redeemCash;
                    l = 1;
                    var tstatus = "Sell";
                    if (redeemCash) {
                        for (var i = 0; i < redeemCash.length; i++) {
                            if (redeemCash[i].particularG24) {
                                var accVar = loadArrayTrans(redeemCash[i], redeemCash[i].particularG24, tstatus, trans_type);
                            }
                            if (redeemCash[i].particularS99) {
                                var accVar = loadArrayTrans(redeemCash[i], redeemCash[i].particularS99, tstatus, trans_type);
                            }
                            accData.push(accVar);

                        }

                    }
                }
            }
            if (l == 0) {
                WarnMsg(" Partner", "No Record Found..!!");
                accData = new Array();
            }
            displayTable(accData);
        }
        else if (status == "transfer") {
            buyArr = new Array();
            var l = 0;
            if ($data.length != 0) {
                if ($data[0]) {
                    buybycash = $data;
                    l = 1;
                    var tstatus = "Transfer";
                    if (buybycash) {
                        for (var i = 0; i < buybycash.length; i++) { 
                            if (buybycash[i].particularG24) {
                                var accVar = loadArrayTrans(buybycash[i], buybycash[i].particularG24, tstatus, trans_type);
                            }
                            if (buybycash[i].particularS99) {
                                var accVar = loadArrayTrans(buybycash[i], buybycash[i].particularS99, tstatus, trans_type);
                            } 
                            accData.push(accVar);

                        }

                    }
                }
            }
            if (l == 0) {
                WarnMsg(" Partner", "No Record Found..!!");
                accData = new Array();
            }
            displayTable(accData);
        }
    }
    else {
        buyArr = new Array();
        buybycash = new Array()
        var l = 0;
        if ($data.length != 0) {
            if ($data[0].buyUnit) {
                buyArr = $data[0].buyUnit;
                l = 1;
                var tstatus = "Buy";

                if (buyArr) {
                    for (var i = 0; i < buyArr.length; i++) {
                        var accVar = ""; 
                        if (buyArr[i].particularG24) {
                            accVar = loadArrayTrans(buyArr[i], buyArr[i].particularG24, tstatus, trans_type);
                        }
                        if (buyArr[i].particularS99) {
                            accVar = loadArrayTrans(buyArr[i], buyArr[i].particularS99, tstatus, trans_type);
                        }
                        accData.push(accVar);
                    }

                }

            }
            if ($data[0].buyCash) {
                buybycash = $data[0].buyCash;
                l = 1;
                var tstatus = "Buy";
                if (buybycash) {
                    for (var i = 0; i < buybycash.length; i++) { 
                        if (buybycash[i].particularG24) {
                            var accVar = loadArrayTrans(buybycash[i], buybycash[i].particularG24, tstatus, trans_type);
                        }
                        if (buybycash[i].particularS99) {
                            var accVar = loadArrayTrans(buybycash[i], buybycash[i].particularS99, tstatus, trans_type);
                        }


                        // console.log("conDetail = " + accVar);
                        accData.push(accVar);

                    }

                }


            }
        }
        if (l == 0) {
            WarnMsg(" Partner", "No Record Found..!!");
            accData = new Array();
        }
        redeemCash = new Array();
        var l = 0;
        if ($data.length != 0) { 
            if ($data[0].redeemCash) {
                redeemCash = $data[0].redeemCash;
                l = 1;
                var tstatus = "Sell";
                if (redeemCash) {
                    for (var i = 0; i < redeemCash.length; i++) {
                        if (redeemCash[i].particularG24) {
                            var accVar = loadArrayTrans(redeemCash[i], redeemCash[i].particularG24, tstatus, trans_type);
                        }
                        if (redeemCash[i].particularS99) {
                            var accVar = loadArrayTrans(redeemCash[i], redeemCash[i].particularS99, tstatus, trans_type);
                        }


                        // console.log("conDetail = " + accVar);
                        accData.push(accVar);

                    }

                }
            }
        }
        if (l == 0) {
            WarnMsg(" Partner", "No Record Found..!!");
            accData = new Array();
        }
        transferArr = new Array();
        var l = 0;
        if ($data.length != 0) {
            if ($data[0]) {
                transferArr = $data;
                l = 1;
                var tstatus = "Transfer";
                if (transferArr) {
                    for (var i = 0; i < transferArr.length; i++) {
                        if (transferArr[i].particularG24) {
                            var accVar = loadArrayTrans(transferArr[i], transferArr[i].particularG24, tstatus, trans_type);
                        }
                        if (transferArr[i].particularS99) {
                            var accVar = loadArrayTrans(transferArr[i], transferArr[i].particularS99, tstatus, trans_type);
                        }
                        // console.log("conDetail = " + accVar);
                        accData.push(accVar);

                    }

                }
            }
        }
        if (l == 0) {
            WarnMsg(" Partner", "No Record Found..!!");
            accData = new Array();
        }
        setTimeout(() => {
            displayTable(accData);
        }, 1000)
    }
}

function openinvoice(e) {
    var cinvno = $(e).attr('data-cinvno');
    var tType = $(e).attr('data-ttype'); 
    setTimeout(function () { 
        var trans_end = $('input[name=self]:checked').val() 
        if (tType == "buy") {
            viewinvoice(cinvno, tType, trans_end); 
        } else if (tType == "redeem") { 
            viewinvoice(cinvno, tType, trans_end);
        }
        else if (tType == "transfer") { 
            viewinvoicetrans(cinvno, tType, trans_end); 
        }
    }, 5);

}
var viewinvoice = function (invoiceno, type, End) {
    var json = {
        "invoice": invoiceno,
        "type": type,
        "reqFlag": End == "self" ? "entity" : End
    };
    $('#loader').css("display", 'block');
    $.ajax({
        "url": "/eEntity/getinvoice", "method": "POST", data: json, success: function (res) {
            let data = res.body;
            let config = res.config;
            let enDetails = res.enDetails;
            $('#loader').fadeOut('slow');
            if (data.status == 200) {
                if (End == "self") {
                    bindSelfinvoice(data.resource, config, enDetails)
                } else {
                    bindinvoice(data.resource, config);
                }
                $(".showstock").removeClass("hidden");
                $(".stockList").addClass("hidden");
                if ($status == "success") {
                    $('#txnstatus').addClass('text-green');
                    $('#txnstatus').removeClass('text-danger');
                    $('#txnamt').addClass('text-green');
                    $('#txnamt').removeClass('text-danger');
                }
                else {
                    $('#txnstatus').addClass('text-danger');
                    $('#txnstatus').removeClass('text-green');
                    $('#txnamt').addClass('text-danger');
                    $('#txnamt').removeClass('text-green');
                }
            } else {
                alertify.logPosition("bottom left");
                alertify.error(data.message);
            }
        }
    });

}

var viewinvoicetrans = function (invoiceno, type, End) {
    var json = {
        // "cTruID": custtid,
        "invoice": invoiceno,
        "type": type,
        "reqFlag": End
    };
    $('#loader').css("display", 'block');
    $.ajax({
        "url": "/eEntity/getinvoicetransfer", "method": "POST", data: json, success: function (res) {

            $('#loader').fadeOut('slow');
            let data = res.body;
            let config = res.config;
            if (data.status == 200) {
                bindtransferinvoice(data.resource, config);
                $(".showstock").removeClass("hidden");
                $(".stockList").addClass("hidden");
                if ($status == "success") {
                    $('#ttxnstatus').addClass('text-green');
                    $('#ttxnstatus').removeClass('text-danger');
                    $('#ttxnamt').addClass('text-green');
                    $('#ttxnamt').removeClass('text-danger');
                }
                else {
                    $('#ttxnstatus').addClass('text-danger');
                    $('#ttxnstatus').removeClass('text-green');
                    $('#ttxnamt').addClass('text-danger');
                    $('#ttxnamt').removeClass('text-green');
                }
            } else {
                alertify.logPosition("bottom left");
                alertify.error(data.message);
            }
        }
    });

}

var bindinvoice = function (invarr, config) {
    // var targetContainer = $(".target-output"),
    // template = $("#entityInvoice").html();
    var inv = jsonBulider(invarr, config);
    if (invarr.type == "buy" || invarr.type == "buyCash") {
        var targetContainer = $(".target-output"),
            template = $("#consumerBuyInvoice").html();
    }  else if (invarr.type == "redeemCash") {
        var targetContainer = $(".target-output"),
            template = $("#consumerRedeemInvoice").html();

    } else {
        var targetContainer = $(".target-output"),
            template = $("#mustacheTempalte_a").html();
    }
    var invoice = {
        "invoice": [
            inv
        ]
    };
    var html = Mustache.to_html(template, invoice);

    $(targetContainer).html(html);
}
var bindinvoiceBuy = function (invarr, config) {
    var targetContainer = $(".target-output"),
        template = $("#entityInvoiceBuy").html();
    var inv = jsonBulider(invarr, config);
    var invoice = {
        "invoice": [
            inv
        ]
    };
    var html = Mustache.to_html(template, invoice);

    $(targetContainer).html(html);
}

var bindSelfinvoice = function (invarr, config, enDetails) {
    if (invarr.type == "buy" || invarr.type == "buyCash") {
        var targetContainer = $(".target-output"),
            template = $("#consumerBuyInvoice").html();
    }  else if (invarr.type == "redeemCash") {
        var targetContainer = $(".target-output"),
            template = $("#consumerRedeemInvoice").html();

    } else {
        var targetContainer = $(".target-output"),
            template = $("#entityInvoice").html();
    }
    var inv = selfJsonBulider(invarr, config, enDetails);
    var invoice = {
        "invoice": [
            inv
        ]
    };
    var html = Mustache.to_html(template, invoice);

    $(targetContainer).html(html);
}

var bindtransferinvoice = function (invarr, config) {
    var targetContainer = $(".target-output"),
        template = $("#consumerTransferInvoice").html();

    var inv = transferjsonBuilder(invarr, config);

    var transinvoice = {
        "transinvoice": [
            inv
        ]
    };

    var html = Mustache.to_html(template, transinvoice);

    $(targetContainer).html(html);
}

function transferjsonBuilder(a, config) {
    var invoicearr = new Array();
    var goldarr = new Array();
    var kycdata1 = {};
    var kycdata2 = {};
    var kycdata3 = {};
    var kycdata4 = {};
    var gold = {};
    var subtotl = 0;
    if (a.particularsG24) {
        if (a.particularsG24.qty != 0) {
            // from = a.particularsG24.from;
            kycdata1["productname"] = "24K Gold";
            kycdata1["qty"] = decimalChopper(a.particularsG24.qty, 2);
            gold["g24k"] = decimalChopper(a.particularsG24.qty, 2);
            kycdata1["rate"] = decimalChopper(a.particularsG24.rate, 2);
            kycdata1["other"] = decimalChopper(a.particularsG24.otherCharges, 2);
            // kycdata1["assetmanagersCharges"] = decimalChopper(a.particularsG24.assetmanagersCharges, 2);
            kycdata1["subtotal"] = decimalChopper(a.particularsG24.total, 2);
            subtotl = subtotl + parseFloat(a.particularsG24.rate) * parseFloat(a.particularsG24.qty)
            kycdata1["amount"] = decimalChopper(parseFloat(a.particularsG24.rate) * parseFloat(a.particularsG24.qty), 2);
            invoicearr.push(kycdata1);
        }
    } 

    //var s99flag = parseFloat(a.particularsS99.qty);
    if (a.particularsS99) {
        if (a.particularsS99.qty != 0) {
            // from = a.particularsS99.from;
            kycdata4["productname"] = "99% Silver";
            kycdata4["qty"] = decimalChopper(a.particularsS99.qty, 2);
            gold["s99p"] = decimalChopper(a.particularsS99.qty, 2);
            kycdata4["rate"] = decimalChopper(a.particularsS99.rate, 2);
            kycdata4["other"] = decimalChopper(a.particularsS99.otherCharges, 2);
            // kycdata1["assetmanagersCharges"] = decimalChopper(a.particularsG24.assetmanagersCharges, 2);
            kycdata4["subtotal"] = decimalChopper(a.particularsS99.total, 2);
            subtotl = subtotl + parseFloat(a.particularsS99.rate) * parseFloat(a.particularsS99.qty)
            kycdata4["amount"] = decimalChopper(parseFloat(a.particularsS99.rate) * parseFloat(a.particularsS99.qty), 2);

            invoicearr.push(kycdata4);
        }
    }

    var custimg, custname, custCity;
    var transstatus, transactiontype;
    $status = a.status;
    if (a.status) {
        if (a.status == "success") {
            transstatus = "Transfered Successful";
            if (a.assetstore) {
                goldarr.push(gold);
                // custimg = a.assetstore.image;
                custimg = config + "/3014?url=" + a.assetstore.image;
                // custimg = "images/custoImg.png"
                custname = a.assetstore.companyName;
                custCity = a.assetstore.companyRegisteredAddress.city;
            }
        }
        else {
            transstatus = "Transfered Failed";
        }
    }
    if (a.type == "buyCash") {
        transactiontype = "Buy";
    } else if (a.type == "buyCoin") {
        transactiontype = "Buy";
    } else if (a.type == "transfer") {
        transactiontype = "Transfer";
    }



    var date = new Date(a.createDate);
    var fdate = _formatDate(date, 'time');
    // console.log("create date ", fdate);
    var ins = {
        "orderno": a.invoice,
        "to": a.to,
        "status": transstatus,
        "isStatus": a.status == "success" ? true : false,
        "orderdate": fdate,
        "name": a.fName + " " + a.lName,
        "address": a.address ? a.address.houseNumber + ',' + a.address.landmark + ',' + a.address.streetNumber : '',
        "address1": a.address ? a.address.city + ", " + a.address.state : '',
        "address2": a.address ? a.address.country + ", " + a.address.pin : '',
        "total": decimalChopper(a.totalAmount, 2),
        "golds": goldarr,
        "productlist": invoicearr,
        // "dname": from.split('(')[0],
        "transactiontype": transactiontype,
        "MOP": (a.MOP == "truWallet") ? true : false,
        "s_name": a.s_fname + " " + a.s_lname,
        "s_truid": a.s_truID,
        "s_address": a.s_address ? a.s_address.houseNumber + ',' + a.s_address.landmark + ',' + a.s_address.streetNumber : '',
        "s_address1": a.s_address ? a.s_address.city + ", " + a.s_address.state : '',
        "s_address2": a.s_address ? a.s_address.country + ", " + a.s_address.pin : '',
        "subtotal": decimalChopper(subtotl, 2),
        "custimg": custimg,
        "assetstore": custname,
        "custCity": custCity
    };
    return ins;

}

function transArray(particulars, transType, btype) {
    var kycdata = {};
    kycdata["from"] = particulars.from + "(" + particulars.fromTruID + ")";
    kycdata["productname"] = btype;
    kycdata["qty"] = decimalChopper(particulars.qty, 2);
    kycdata["rate"] = decimalChopper(particulars.rate, 2);
    kycdata["fromTruID"] = particulars.fromTruID;
    kycdata["from"] = particulars.from;
    kycdata["amount"] = decimalChopper(particulars.amount, 2);
    if (transType == "buyCash") {
        kycdata["qty"] = decimalChopper(particulars.qty, 4);
        kycdata["subtotal"] = decimalChopper(particulars.total, 2);
        kycdata["tax"] = decimalChopper(particulars.tax, 2);
    } else if (transType == "buy") {
        kycdata["subtotal"] = decimalChopper(particulars.total, 2);
        kycdata["tax"] = decimalChopper(particulars.tax, 2);
    } else if (transType == "redeemCash") {
        var othercharge = parseFloat(particulars.assetmanagersCharges) + (particulars.otherCharges ? parseFloat(particulars.otherCharges) : 0);
        var subTotal = parseFloat(particulars.amount) - othercharge;
        kycdata["subtotal"] = decimalChopper(subTotal.toString(), 2);
        kycdata["tax"] = decimalChopper(othercharge, 2);
    }
    return kycdata;
}

function jsonBulider(a, config) {

    var invoicearr = new Array();
    var goldarr = new Array();
    var gold = {};
    var subtotl = 0, SubRtotl = 0;
    var taxtotl = 0;
    if (a.particularsG24) {
        var totlGold24k = 0
        for (var i = 0; i < a.particularsG24.length; i++) {
            if (a.particularsG24[i].qty != 0) {
                totlGold24k = totlGold24k + parseFloat(a.particularsG24[i].qty), 2;
                subtotl = subtotl + parseFloat(decimalChopper(a.particularsG24[i].amount, 2));
                SubRtotl = SubRtotl + parseFloat(decimalChopper(a.particularsG24[i].total, 2));
                taxtotl = taxtotl + parseFloat(decimalChopper(a.particularsG24[i].tax, 2));
                invoicearr.push(transArray(a.particularsG24[i], a.type, "24k Gold"));
            }
        }
        if (totlGold24k !== 0) {
            gold["g24k"] = decimalChopper(totlGold24k, 2)
        }
    }  
    if (a.particularsS99) {
        var totlGold99p = 0
        for (var i = 0; i < a.particularsS99.length; i++) {
            if (a.particularsS99[i].qty != 0) {
                totlGold99p = totlGold99p + parseFloat(a.particularsS99[i].qty), 2;
                subtotl = subtotl + parseFloat(decimalChopper(a.particularsS99[i].amount, 2));
                SubRtotl = SubRtotl + parseFloat(decimalChopper(a.particularsS99[i].total, 2));
                taxtotl = taxtotl + parseFloat(decimalChopper(a.particularsS99[i].tax, 2));
                invoicearr.push(transArray(a.particularsS99[i], a.type, "99% Pure Silver"));
            }
        }
        if (totlGold99p !== 0) {
            gold["s99p"] = decimalChopper(totlGold99p, 2)
        }
    }
    var custimg, custCity, custname;

    var transstatus, transactiontype;
    $status = a.status;
    if (a.status) {
        if (a.status == "success") {
            transstatus = "Transaction Successful";
            goldarr.push(gold);
            if (a.assetstore) {
                // custimg = a.assetstore.image
                // custimg = "images/custoImg.png"
                custimg = config + "/3014?url=" + a.assetstore.image;
                custname = a.assetstore.companyName
                custCity = a.assetstore.companyRegisteredAddress.city
            }
        }
        else {
            transstatus = "Transaction Failed";
        }
    }

    var storeName, storeAddress, storeCity, storeState, storeCountry, storePin, storeTruID, taxheading, storehead = "";
    if (a.type == "buyCash" || a.type == "buy") {
        taxheading = "GST (" + a.applicableTAX + "%)";
    }
    else if (a.type == "redeemCash") {
        taxheading = "Charges";
    }
    var isRedeem = false;
    if (a.type == "buyCash") {
        transactiontype = "Buy";
    } else if (a.type == "buy") {
        transactiontype = "Buy";
    } else if (a.type == "redeemCash") {
        isRedeem = true
        transactiontype = "Sell";
    }

    var date = new Date(a.createDate);
    var fdate = _formatDate(date, 'time');
    var ins = {
        "orderno": a.invoice,
        "to": a.to,
        "status": transstatus,
        "isStatus": a.status == "success" ? true : false,
        "subtotal": decimalChopper(subtotl, 2),
        "SubRtotl": decimalChopper(SubRtotl, 2),
        "taxper": a.applicableTAX ? a.applicableTAX + "%" : "3%",
        "totalTax": decimalChopper(taxtotl, 2),
        "paymentCharge": a.paymentCharge ? a.paymentCharge : "0",
        "orderdate": fdate,
        "taxhead": taxheading,
        "name": a.fName + " " + a.lName,
        "address": a.address ? a.address.houseNumber + ',' + a.address.landmark + ',' + a.address.streetNumber : '',
        "address1": a.address ? a.address.city + ", " + a.address.state : '',
        "address2": a.address ? a.address.country + ", " + a.address.pin : '',
        "total": decimalChopper(a.totalAmount, 2),
        "productlist": invoicearr,
        "golds": goldarr,
        // "dfrom": from,
        "transactiontype": transactiontype,
        "MOP": (a.MOP == "truWallet") ? true : false,
        "store_head": storehead,
        "store_Name": storeName,
        "store_truId": storeTruID,
        "store_Address": storeAddress,
        "store_city": storeCity,
        "store_state": storeState,
        "store_country": storeCountry,
        "store_pin": storePin,
        // "dname": from.split('(')[0],
        "custimg": custimg,
        "assetstore": custname,
        "custCity": custCity
    };
    // console.log(ins);
    return ins;
}
function selfJsonBulider(a, config, enDetails) {

    var invoicearr = new Array();
    var goldarr = new Array();
    var gold = {};
    var subtotl = 0, SubRtotl = 0;
    var taxtotl = 0;
    if (a.particularsG24) {
        var totlGold24k = 0

        if (a.particularsG24.qty != 0) {
            totlGold24k = totlGold24k + parseFloat(a.particularsG24.qty), 2;
            subtotl = subtotl + parseFloat(decimalChopper(a.particularsG24.amount, 2));
            SubRtotl = SubRtotl + parseFloat(decimalChopper(a.particularsG24.total, 2));
            taxtotl = taxtotl + parseFloat(decimalChopper(a.particularsG24.tax, 2));
            invoicearr.push(transArray(a.particularsG24, a.type, "24k Gold"));
        }

        if (totlGold24k !== 0) {
            gold["g24k"] = decimalChopper(totlGold24k, 2)
        }
    } 
    if (a.particularsS99) {
        var totlGold99p = 0
        if (a.particularsS99.qty != 0) {
            totlGold99p = totlGold99p + parseFloat(a.particularsS99.qty), 2;
            subtotl = subtotl + parseFloat(decimalChopper(a.particularsS99.amount, 2));
            SubRtotl = SubRtotl + parseFloat(decimalChopper(a.particularsS99.total, 2));
            taxtotl = taxtotl + parseFloat(decimalChopper(a.particularsS99.tax, 2));
            invoicearr.push(transArray(a.particularsS99, a.type, "99% Pure Silver"));
        }

        if (totlGold99p !== 0) {
            gold["s99p"] = decimalChopper(totlGold99p, 2)
        }
    }
    var custimg, custCity, custname;

    var transstatus, transactiontype;
    $status = a.status;
    if (a.status) {
        if (a.status == "success") {
            transstatus = "Transaction Successful";
            goldarr.push(gold);
            if (a.assetstore) {
                // custimg = a.assetstore.image
                // custimg = "images/custoImg.png"
                custimg = config + "/3014?url=" + a.assetstore.image;
                custname = a.assetstore.companyName
                custCity = a.assetstore.companyRegisteredAddress.city
            }
        }
        else {
            transstatus = "Transaction Failed";
        }
    }

    var storeName, storeAddress, storeCity, storeState, storeCountry, storePin, storeTruID, taxheading, storehead = "";
    if (a.type == "buyCash" || a.type == "buy") {
        taxheading = "GST (" + a.applicableTAX + "%)";
    }
    else if (a.type == "redeemCash") {
        taxheading = "Charges";
    }
    var isRedeem = false;
    if (a.type == "buyCash") {
        transactiontype = "Buy";
    } else if (a.type == "buy") {
        transactiontype = "Buy";
    } else if (a.type == "redeemCash") {
        isRedeem = true
        transactiontype = "Sell";
    }

    var date = new Date(a.createDate);
    var fdate = _formatDate(date, 'time');
    var ins = {
        "orderno": a.invoice,
        "to": a.to,
        "status": transstatus,
        "subtotal": decimalChopper(subtotl, 2),
        "SubRtotl": decimalChopper(SubRtotl, 2),
        "taxper": a.applicableTAX ? a.applicableTAX + "%" : "3%",
        "totalTax": decimalChopper(taxtotl, 2),
        "paymentCharge": a.paymentCharge ? a.paymentCharge : "0",
        "isStatus": a.status == "success" ? true : false,
        "orderdate": fdate,
        "taxhead": taxheading,
        "name": enDetails.companyName,
        "address": enDetails.address ? enDetails.address.houseNumber + ',' + enDetails.address.landmark + ',' + enDetails.address.streetNumber : '',
        "address1": enDetails.address ? enDetails.address.city + ", " + enDetails.address.state : '',
        "address2": enDetails.address ? enDetails.address.country + ", " + enDetails.address.pin : '',
        "total": decimalChopper(a.totalAmount, 2),
        "productlist": invoicearr,
        "golds": goldarr,
        // "dfrom": from,
        "transactiontype": transactiontype,
        "MOP": (a.MOP == "truWallet") ? true : false,
        "store_head": storehead,
        "store_Name": storeName,
        "store_truId": storeTruID,
        "store_Address": storeAddress,
        "store_city": storeCity,
        "store_state": storeState,
        "store_country": storeCountry,
        "store_pin": storePin,
        "custimg": custimg,
        "assetstore": custname,
        "custCity": custCity
    };
    // console.log(ins);
    return ins;
}
var loadArrayTrans = function (buyArr, particular, status, product) {
    var btype = "", productType = "", brate = "", amount = 0, tax = 0, g24rate = 0, g99prate = 0, earning = 0, clientrevenue = 0, totalRevenue = 0;

    if ((buyArr.particularG24)) {
        btype += "<label class='label label-g24' title='TruCoin Gold'>" + decimalChopper(buyArr.particularG24.qty, 4) + " <span class='congms'></span>" + "</label>&nbsp;";
        productType += "Gold";
        amount += parseFloat(buyArr.particularG24.amount);
        tax += parseFloat(buyArr.particularG24.tax);
        earning += parseFloat(buyArr.particularG24.partnerCharges);
        totalRevenue += (parseFloat(buyArr.particularG24.transactionCharges) + parseFloat(buyArr.particularG24.clientTransactionCharges));
        brate += "<label class='label label-g24' title='TruCoin Gold'><i class='mdi mdi-currency-inr'></i>" + decimalChopper(buyArr.particularG24.rate, 2) + "</label>&nbsp;";

    }
    if ((buyArr.particularS99)) {
        btype += " <label class='label label-s99' title='TruCoin Silver'>" + decimalChopper(buyArr.particularS99.qty, 4) + " <span class='congms'></span>" + "</label>&nbsp;";
        productType += "Silver";
        amount += parseFloat(buyArr.particularS99.amount);
        tax += parseFloat(buyArr.particularS99.tax);
        earning += parseFloat(buyArr.particularS99.partnerCharges);
        totalRevenue += (parseFloat(buyArr.particularS99.transactionCharges) + parseFloat(buyArr.particularS99.clientTransactionCharges));
        brate += "<label class='label label-s99' title='TruCoin Silver'><i class='mdi mdi-currency-inr'></i>" + decimalChopper(buyArr.particularS99.rate, 2) + "</label>&nbsp;";
    }

    var totalamount = 0, revenue = 0;
    if (buyArr.totalAmount) {
        if (buyArr.totalAmount != "NaN") {
            totalamount = buyArr.totalAmount;
        }
    }
    if (totalRevenue) {
        revenue = totalRevenue - earning
    }
    /*  var fromaddress = "";
     if (buyArr.fromAddress) {
         fromaddress = (buyArr.fromAddress.houseNumber) ? buyArr.fromAddress.houseNumber : "-" + "," + (buyArr.fromAddress.streetNumber) ? buyArr.fromAddress.streetNumber : "-" + "," + (buyArr.fromAddress.city) ? buyArr.fromAddress.city : "-" + "," + (buyArr.fromAddress.state) ? buyArr.fromAddress.state : "-" + "," + (buyArr.fromAddress.country) ? buyArr.fromAddress.country : "-" + "-" + (buyArr.fromAddress.pin) ? buyArr.fromAddress.pin : "-";
     } */
    var txnstat = "-";
    if (buyArr.status) {
        if (buyArr.status == "success") {
            txnstat = "<label class='label label-info'>" + buyArr.MOP + "</label>&nbsp<label class='label label-success'>Success</label>"
        } else {
            txnstat = "<label class='label label-danger'>Failure</label>";
        }
    }


    if (buyArr.createDate) {
        var date = new Date(buyArr.createDate);
        month = Date.parse(date);
        fdate = FormatDateToString(date, "time");
    }
    // console.log(buyArr.invoice)
    var rqueue = {
        'crn': "-",
        'toSixId': buyArr.to,
        'rTruID': buyArr.rTruID ? buyArr.rTruID : "-",
        'companyName': $("#sideProfile").html(),
        'fromSixId': (particular.fromTruID) ? particular.fromTruID : "-",
        'consumerName': buyArr.fName + " " + buyArr.lName,
        'invoice': buyArr.invoice,
        'cdt': (fdate) ? fdate : "-",
        'dateTime': (fdate) ? '<span style="display:none">' + month + '</span>' + fdate : "-",
        'transactionType': buyArr.MOP,
        'totalamount': totalamount,
        'quantity': (particular.qty < 0) ? particular.qty * -1 + " gm" : decimalChopper(particular.qty, 4) + " gm",
        'toAssetManager': buyArr.fName + " " + buyArr.lName,
        'fromAssetManager': (particular.from) ? particular.from : "-",
        'remmit': decimalChopper(buyArr.remmitCharges, 2),
        "product": product,
        "transType": status,
        "txn_status": txnstat,
        "btype": btype,
        "amount": amount,
        "tax": tax,
        "earning": earning,
        "brate": brate,
        "productType": productType,
        "totalRevenue": totalRevenue,
        "revenue": revenue,
        "view": '<td><a href="#" class="text-info btnstoshow" data-cinvno=' + buyArr.invoice + ' data-ttype='+buyArr.type+' data-custno=' + buyArr.to + ' onclick="openinvoice(this);"><i class="fa fa-2x fa-file-text-o"></i> </a></td>'
    };
    return rqueue;
}

// call array container 
var bindArrayToLoop = function (buyArr, status) {
    for (var i = 0; i < buyArr.length; i++) {

        if ((buyArr[i].particularG24)) {
            createSummaryData(buyArr[i], buyArr[i].particularG24, status, "24K Gold");
        }
        else if ((buyArr[i].particularS99)) {
            createSummaryData(buyArr[i], buyArr[i].particularS99, status, "TruCoin 99 % Silver");
        }
    }
}
function FormatDateToString(datef, format) {
    let date = new Date(datef);
    var day = date.getDate();
    var month = date.getMonth();

    var year = date.getFullYear();
    var monthNames = [
        "Jan", "Feb", "Mar",
        "Apr", "May", "Jun", "Jul",
        "Aug", "Sep", "Oct",
        "Nov", "Dec"
    ];
    if (format == 'mmm dd, yyyy') {
        return monthNames[month] + ' ' + ((day > 9) ? day : '0' + day) + ', ' + year;
    }
    if (format == 'ddmmyyyy') {
        month++;
        return ((day > 9) ? day : '0' + day) + '-' + ((month > 9) ? month : '0' + month) + '-' + year;
    }
    if (format == 'mmddyyyy') {
        month++;
        return ((month > 9) ? month : '0' + month) + '-' + ((day > 9) ? day : '0' + day) + '-' + year;
    }
    if (format == 'yyyy') {
        return year;
    }
    if (format == 'time') {
        var daysIndex = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        var min = date.getMinutes();
        var sec = date.getSeconds();
        var hours = date.getHours();
        var days = date.getDay();
        return (daysIndex[days] + " " + monthNames[month] + ' ' + ((day > 9) ? day : '0' + day) + " " + ((hours > 9) ? hours : '0' + hours) + ":" + ((min > 9) ? min : '0' + min) + ":" + ((sec > 9) ? sec : '0' + sec) + " IST " + year);
    }
    if (format == 'timeshort') {
        var daysIndex = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        var min = date.getMinutes();
        var sec = date.getSeconds();
        var hours = date.getHours();
        var days = date.getDay();
        return (((day > 9) ? day : '0' + day) + ' ' + monthNames[month] + " " + year + " " + hours + ":" + min + ":" + sec);
    }
    if (format == 'syncDate') {
        var daysIndex = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        var min = datef.getMinutes();
        var sec = datef.getSeconds();
        var hours = datef.getHours();
        var days = datef.getDay();
        return (((day > 9) ? day : '0' + day) + ' ' + monthNames[month] + " " + year + " " + hours + ":" + min + ":" + sec);
    }
    if (format == "format") {
        return date;
    }
}
/* function loadArrayTrans(buyArr, particulars, tstutus, trans_type) {
    if (particulars.fromTruID) {
        from = particulars.from + '<br>\n (' + particulars.fromTruID + ")";
    } else {
        from = "";
    }
    var name;
    if (trans_type == "consumer") {
        name = buyArr.fName + " " + buyArr.lName
    } else {
        name = buyArr.companyName;
    } 
    let cdt = _formatDate(buyArr.createDate, "time");
    let month = getSortOrder(buyArr.createDate, "yyyymmdd");
    var rqueue =
    {
        'month': month,
        'createDate': '<span style="display:none">' + month + '</span>' + cdt,
        'to': buyArr.to,
        'name': name,
        'from': from,
        'invoice': buyArr.invoice,
        'mop': buyArr.MOP,
        'transType': tstutus,
        'amount': '<i class="mdi mdi-currency-inr"></i>' + decimalChopper(buyArr.totalAmount, 2),
        'info': '<td><a href="#" class="text-info btnstoshow" data-cinvno=' + buyArr.invoice + ' data-custno=' + buyArr.to + ' onclick="openinvoice(this);"><i class="fa fa-2x fa-file-text-o"></i> </a></td>',
    } 
    return rqueue;
} */

$(document).on("click", ".btnstohide", function (e) {
    e.preventDefault();
    $(".stockList").removeClass("hidden");
    $(".showstock").addClass("hidden fadeOut");
    $(".showtransferinvoice").addClass("hidden");
})

function downloadpdf(divName, event) {
    $orders = $(event).attr("data-invoice");
    var element = document.getElementById(divName);
    var opt = {
        margin: 0.5,
        filename: $orders + '.pdf',
        image: { type: 'png', quality: 1 },
        html2canvas: { allowTaint: true },
        jsPDF: { unit: 'in', format: 'A4', orientation: 'landscape' }
    };
    // New Promise-based usage:
    html2pdf().set(opt).from(element).save();
    // Old monolithic-style usage:
    // html2pdf(element, opt);
}
var bool = true;
function showcert() {
    if (bool == true) {
        $('.showcontent-content').addClass("show")
        $('.showcontent-content').removeClass("slide")
        bool = false;
    }
    else {
        $('.showcontent-content').addClass("slide")
        $('.showcontent-content').removeClass("show")
        bool = true;
    }
}