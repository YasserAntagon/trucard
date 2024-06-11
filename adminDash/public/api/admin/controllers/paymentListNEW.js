// author : Suresh Patil
// date : 03-06-2019
// Description : Entity Transactions 
var tableReq;
var table;
var Globalarry = new Array()
var isDate = false;
var successlb = "";
var PGlb = "";
var genderlb = "";
var goldlb = "";
$(function () {
    $('.radio-group label').on('click', function () {
        $(this).removeClass('not-active').siblings().addClass('not-active');
    });
    var json = { dateflag: false, "isPartner": false }
    bindSummaryALL(json);
    bindPartners();
    $('#cmbPartner').on('change', function (e) {
        var truID = $(this).val();
        var selfentity = $('input[name=self]:checked').val();
        var wallet = $('input[name=wallet]:checked').val();
        if (wallet == "all") {
            if (isDate && truID != "0") {
                var start = $('#config-demo').data('daterangepicker').startDate._d;
                var end = $('#config-demo').data('daterangepicker').endDate._d;
                var json = {
                    "isPartner": selfentity == "consumer" ? false : true,
                    "rTruID": truID,
                    "startDate": start,
                    "endDate": end,
                    "dateflag": true
                };
                bindSummaryALL(json);
            }
            else if (!isDate && truID != "0") {
                var json = {
                    "isPartner": selfentity == "consumer" ? false : true,
                    "rTruID": truID,
                    "dateflag": false
                };
                bindSummaryALL(json);
            }
            else {
                var json = {
                    "isPartner": selfentity == "consumer" ? false : true,
                    "dateflag": false
                };
                bindSummaryALL(json);
            }
        }
        else {
            if (isDate && truID != "0") {
                var start = $('#config-demo').data('daterangepicker').startDate._d;
                var end = $('#config-demo').data('daterangepicker').endDate._d;
                var json = {
                    "isPartner": selfentity == "consumer" ? false : true,
                    "rTruID": truID,
                    "startDate": start,
                    "endDate": end,
                    "dateflag": true,
                    "flag": wallet
                };
                bindwalletsummary(json);
            }
            else if (!isDate && truID != "0") {
                var json = {
                    "isPartner": selfentity == "consumer" ? false : true,
                    "rTruID": truID,
                    "dateflag": false,
                    "flag": wallet
                };
                bindwalletsummary(json);
            }
            else {
                var json = {
                    "isPartner": selfentity == "consumer" ? false : true,
                    "dateflag": false,
                    "flag": wallet
                };
                bindwalletsummary(json);
            }
        }
    })
});
function bindPartners() {
    $('.select2').select2();
    $.ajax({
        "url": "/entityList/getEntityListALLRecords", "method": "POST", success: function (a) {
            var buyArr = a.body;
            if (buyArr) {
                $('#cmbPartner').empty();
                $('#cmbPartner').append('<option value="0">Select Partner / Partners</option>');
                for (var i = 0; i < buyArr.length; i++) {
                    var companyName = buyArr[i].companyName.replace('null', '');
                    $data = companyName + " - " + buyArr[i].truID + " - " + buyArr[i].mobile;

                    $('#cmbPartner').append('<option value="' + buyArr[i].truID + '">' + $data + '</option>');
                }
            }
        }
    });
}
function refreshClick() {
    loaddate();
    $('.successCheck').attr('checked', false)
    $('.successch').addClass("not-active")
    $('.PGCheck').attr('checked', false)
    $('.PGch').addClass("not-active")
    $('.genderCheck').attr('checked', false)
    $('.playing').addClass("not-active")
    $('.goldCheck').attr('checked', false)
    $('.gold').addClass("not-active")
    $(".walletOps").addClass("hidden")
    $(".consumerTrans").removeClass("hidden")
    successlb = "";
    PGlb = "";
    genderlb = "";
    goldlb = "";
    isDate = false;
    $('.status-dropdownBuy').val("")
    $('#cmbPartner').val(null).trigger('change');
}
var bindSummaryALL = function (json) {
    Globalarry = new Array();
    $(".walletOps").addClass("hidden")
    $(".consumerTrans").removeClass("hidden")
    $('#loader').css("display", 'block');
    $.ajax({
        "url": "/eEntity/getGSTAllTrans", "method": "POST", data: json, success: function (res) {
            $('#loader').fadeOut('slow');
            let data = res.body;
            if (data.status == 200) {
               // Globalarry = res.body.resource;
                bindDatatTable(res.body.resource, "all", "consumer");
            }
            else {
                alertify.logPosition("bottom left");
                alertify.error(data.messege);
            }
        }
    });
    /*  $.ajax({
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
     }); */
}

function GoldSuccess() {
    var successSelected = $('input[name=success]:checked').val();
    if (successSelected == successlb) {
        successlb = "";
        $('.successCheck').attr('checked', false)
        setTimeout(() => {
            $('.successch').addClass("not-active")

        }, 200)
    }
    else {
        successlb = successSelected
    }
    if (table) {
        table.column(18).search(successlb).draw();
    }
}

function PGSuccess() {
    var PGSelected = $('input[name=PGsuccess]:checked').val();
    if (PGSelected == PGlb) {
        PGlb = "";
        $('.PGCheck').attr('checked', false)
        setTimeout(() => {
            $('.PGch').addClass("not-active")

        }, 200)
    }
    else {
        PGlb = PGSelected
    }
    if (table) {
        table.column(18).search(PGlb).draw();
    }
}



function gender() {
    var genderSelected = $('input[name=gender]:checked').val();
    if (genderSelected == genderlb) {
        genderlb = "";
        $('.genderCheck').attr('checked', false)
        setTimeout(() => {
            $('.playing').addClass("not-active")
        }, 200)

    }
    else {
        genderlb = genderSelected
    }
    if (table) {
        table.column(31).search(genderlb).draw();
    }
}

function GoldSilver() {
    var goldSelected = $('input[name=gold]:checked').val();
    if (goldSelected == goldlb) {
        $('.goldCheck').attr('checked', false)
        goldlb = "";
        setTimeout(() => {
            $('.gold').addClass("not-active")
        }, 200)

    }
    else {
        goldlb = goldSelected
    }
    if (table) {
        table.column(29).search(goldlb).draw();
    }
}

function self() {
    var selfentity = $('input[name=self]:checked').val();
    var wallet = $('input[name=wallet]:checked').val();
    if (wallet === "wallet" || wallet === "wallet") {
        $(".walletOps").removeClass("hidden")
        $(".consumerTrans").addClass("hidden")
    } else {
        $(".walletOps").addClass("hidden")
        $(".consumerTrans").removeClass("hidden")
    }
    if (selfentity == "self") {
        var json = {
            "isPartner": true,
            "dateflag": false,
            "flag": wallet
        };
        if (wallet == "all") {
            bindSummaryALL(json);
        }
        else {
            bindwalletsummary(json);
        }

    }
    else {
        var json = {
            "isPartner": false,
            "dateflag": false,
            "flag": wallet
        };
        if (wallet == "all") {
            bindSummaryALL(json);
        }
        else {
            bindwalletsummary(json);
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
            "info": false,
            "bLengthChange": true,
            "bAutoWidth": false,
            "pageLength": 10,
            "sScrollX": "100%",
            "order": [[5, "desc"]],
            data: accData,
            lengthChange: false,

            buttons: [
                {
                    extend: 'excel',
                    text: '<i class="fa fa-2x fa-file-excel-o text text-success"> GST Report</i>',
                    filename: 'GST_Report',
                    exportOptions: {
                        columns: [1, 27, 30, 4, 7, 28, 20, 11, 12, 13],
                        modifier: {
                            page: 'all'
                        },
                        format: {
                            header: function (data, columnIdx) {
                                if (columnIdx == 1) {
                                    return 'OrderID';
                                }
                                else {
                                    return data;
                                }
                            },
                            body: function (data, row, column, node) {
                                return row === 0 ? "\0" + data : data;
                            }
                        }
                    }
                }, {
                    extend: 'excel',
                    text: '<i class="fa fa-2x fa-file-excel-o text text-success"> Txn Report</i>',
                    filename: 'Transactions_Report',
                    exportOptions: {
                        columns: [1, 27, 30, 4, 7, 28, 20, 11, 12, 14, 25, 26, 13],
                        modifier: {
                            page: 'all'
                        },
                        format: {
                            header: function (data, columnIdx) {
                                if (columnIdx == 1) {
                                    return 'OrderID';
                                }
                                else {
                                    return data;
                                }
                            }
                        }
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
            /*    "initComplete": function () {
                   // Select the column whose header we need replaced using its index(0 based)
                   this.api().column(7).every(function () {
                       var column = this;
                       // Put the HTML of the <select /> filter along with any default options 
                       var select = $('<select class="form-control input-sm"><option value="">All</option></select>')
                           // remove all content from this column's header and 
                           // append the above <select /> element HTML code into it 
                           .appendTo($(column.header()).empty())
                           // execute callback when an option is selected in our <select /> filter
                           .on('change', function () {
                               // escape special characters for DataTable to perform search
                               var val = $.fn.dataTable.util.escapeRegex(
                                   $(this).val()
                               );
   
                               // Perform the search with the <select /> filter value and re-render the DataTable
                               column
                                   .search(val ? '^' + val + '$' : '', true, false)
                                   .draw();
                           });
                       // fill the <select /> filter with unique values from the column's data
                       column.data().unique().sort().each(function (d, j) {
                           select.append("<option value='" + d + "'>" + d + "</option>")
                       });
                   });
               }, */
            "columns": [
                { "data": "crn" },
                { "data": "invoice" },
                {
                    "data": "rTruID"
                },
                {
                    "data": null,
                    "render": function (data) {
                        var gender = data.gender ? data.gender.toLowerCase() : data.gender;
                        var female = gender == "female" ? "<i title='Female' class='fa fa-2x fa-female'></i>" : gender == "male" ? "<i title='Male' class='fa fa-2x fa-male'></i>" : "<i title='Other' class='fa fa-2x fa-neuter'></i>"
                        return female + " " + data.consumerName + "\n<br><small>(" + data.toSixId + ")</small>";
                    }
                },
                { "data": "cdt" },
                { "data": "dateTime" },
                {
                    "data": "productTypeHTML"
                },
                { "data": "transType" },
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
                    "data": "account"
                },
                {
                    "data": null,
                    "render": function (data) {
                        return '<i class="mdi mdi-currency-inr"></i>' + decimalChopper(data.totalamount, 2);
                    }
                },
                {
                    "data": "companyName"
                },
                {
                    "data": "taxPer"
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
                { "data": "transactionType" },
                { "data": "productType" },
                { "data": "toSixId" },
                {
                    "data": null,
                    "render": function (data) {
                        var gender = data.gender ? data.gender.toLowerCase() : data.gender;
                        return gender == "female" ? "female" : gender == "male" ? "gmale" : "other"
                    }
                }
            ],
            "columnDefs": [
                {
                    "targets": [2, 4, 20, 21, 22, 23, 24,19],
                    "visible": false

                }
            ]
        });

        $("#toolbar").html('<span class="pdf"></span>');
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
        $('.status-dropdownBuy').on('change', function (e) {
            var status = $(this).val();
            $('.status-dropdownBuy').val(status)
            table.column(7).search(status).draw();
        })

    }

}
var getStatement = function (start, end)                 // On Selected Date to bind Account Transaction
{
    $("#summaryloader").css("display", "block");
    var selfentity = $('input[name=self]:checked').val();
    var wallet = $('input[name=wallet]:checked').val();
    var json = "";
    if (wallet == "all") {
        json = {
            "startDate": start,
            "endDate": end,
            "dateflag": true,
            "isPartner": selfentity == "consumer" ? false : true,
        }
        if ($('#cmbPartner').val() != "0") {
            json = {
                "startDate": start,
                "endDate": end,
                "dateflag": true,
                "rTruID": $('#cmbPartner').val()
            };
        }
    }
    else {
        json = {
            "startDate": start,
            "endDate": end,
            "dateflag": true,
            "isPartner": selfentity == "consumer" ? false : true,
            "flag": wallet
        }
        if ($('#cmbPartner').val() != "0") {
            json = {
                "startDate": start,
                "endDate": end,
                "dateflag": true,
                "rTruID": $('#cmbPartner').val(),
                "flag": wallet
            };
        }
    }
    $('.successCheck').attr('checked', false)
    $('.successch').addClass("not-active")
    $('.PGCheck').attr('checked', false)
    $('.PGch').addClass("not-active")
    $('.genderCheck').attr('checked', false)
    $('.playing').addClass("not-active")
    $('.goldCheck').attr('checked', false)
    $('.gold').addClass("not-active")
    successlb = "";
    PGlb = "";
    genderlb = "";
    goldlb = "";
    $('.status-dropdownBuy').val("")
    if (wallet == "all") {
        bindSummaryALL(json);
    }
    else {
        bindwalletsummary(json);
    }
}
var myCallback = function (start, end) {
    $('#config-demo .form-control').html(start.format('MMM DD, YYYY') + '-' + end.format('MMM DD, YYYY'));
    var start = start.format('MM-DD-YYYY');
    var end = end.format('MM-DD-YYYY');
    isDate = true;
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

var bindDatatTable = async function ($data, status, trans_type) {
    accData = new Array();
    var buyArr, buybycash;

    buyArr = new Array();
    buybycash = new Array()
    var l = 0;
    if ($data.length != 0) {
        for (var i = 0; i < $data.length; i++) {
            var accVar = "";
            var type = $data[i].type == "buy" || $data[i].type == "buyCash" ? "Buy" : $data[i].type == "redeemCash" ? "Sell" :  $data[i].type == "transfer" ? "Transfer" : $data[i].type;
            if ($data[i].type == "conversion") {
                 var accVar = await loadConversion($data[i], "Conversion", trans_type);
                accData.push(accVar);
            }
            else {
                if ($data[i].particularsG24) {
                    accVar = await loadArrayTrans($data[i], $data[i].particularsG24, type, trans_type);
                }
                if ($data[i].particularsS99) {
                    accVar = await loadArrayTrans($data[i], $data[i].particularsS99, type, trans_type);
                }
                accData.push(accVar);
            }
        }
    }
    setTimeout(() => {
        displayTable(accData);
    }, 1000)
}
var loadArrayTrans = function (buyArr, particulars, status, product) {
    var btype = "", productType = "", brate = "", taxPer = 0, amount = 0, tax = 0, g24rate = 0, g99prate = 0, earning = 0, clientrevenue = 0, totalRevenue = 0;

    if ((buyArr.particularsG24.qty != "0")) {
        btype += "<label class='label label-g24' title='TruCoin Gold'>" + decimalChopper(buyArr.particularsG24.qty, 4) + " <span class='congms'></span>" + "</label>&nbsp;";
        productType = "Gold";
        amount += parsewallet(buyArr.particularsG24.amount);
        tax += parsewallet(buyArr.particularsG24.tax);        
        earning += parsewallet(buyArr.particularsG24.partnerCharges);
        totalRevenue += (parsewallet(buyArr.particularsG24.transactionCharges) + parsewallet(buyArr.particularsG24.clientTransactionCharges));
        brate += "<label class='label label-g24' title='TruCoin Gold'><i class='mdi mdi-currency-inr'></i>" + decimalChopper(buyArr.particularsG24.rate, 2) + "</label>&nbsp;";

    } 
    if ((buyArr.particularsS99.qty != "0")) {
        btype += " <label class='label label-s99' title='TruCoin Silver'>" + decimalChopper(buyArr.particularsS99.qty, 4) + " <span class='congms'></span>" + "</label>&nbsp;";
        productType += "Silver";
        amount += parsewallet(buyArr.particularsS99.amount);
        tax += parsewallet(buyArr.particularsS99.tax);        
        earning += parsewallet(buyArr.particularsS99.partnerCharges);
        totalRevenue += (parsewallet(buyArr.particularsS99.transactionCharges) + parsewallet(buyArr.particularsS99.clientTransactionCharges));
        brate += "<label class='label label-s99' title='TruCoin Silver'><i class='mdi mdi-currency-inr'></i>" + decimalChopper(buyArr.particularsS99.rate, 2) + "</label>&nbsp;";
    }
    taxPer = buyArr.type == "buy" || buyArr.type == "buyCash" ? decimalChopper(buyArr.taxPer, 2) + "%" : decimalChopper(buyArr.taxPer, 2) + "% on Txn charge";
    var totalamount = 0, revenue = 0;
    if (buyArr.totalAmount) {
        if (buyArr.totalAmount != "NaN") {
            totalamount = buyArr.totalAmount;
        }
    }
    if (totalRevenue) {
        revenue = totalRevenue - earning
    } 
    var txnstat = "";
    if (buyArr.status) {
        var mop = buyArr.MOP == "truWallet" ? "<label class='label label-warning'>" + buyArr.MOP + "</label>" : buyArr.MOP == "wallet" ? "<label class='label label-danger'>" + buyArr.MOP + "</label>" : "<label class='label label-info'>" + buyArr.MOP + "</label>";
        if (buyArr.status == "success") {
            txnstat = mop + "<br/><label class='label label-success'>Success</label>"
        } else {
            txnstat = "<label class='label label-danger'>Failure</label>";
        }
    }
    var productTypeHTML = "";
    if (productType == "Gold") {
        productTypeHTML = "<center><img alt='TruCoin Gold' src='../images/new/gold.png' width='24' height='24'  /></center>";
    } else if (productType == "Silver") {
        productTypeHTML = "<center><img alt='TruCoin Silver' src='../images/new/silver.png' width='30' height='26' /></center>";
    } else if (productType == "SilverGold") {
        productTypeHTML = "<center><center><img alt='TruCoin Silver' src='../images/new/silver.png' width='30' height='26' /></center><br /><center><img alt='TruCoin Gold' src='../images/new/gold.png' width='24' height='24' /></center>";
    } else if (productType == "GoldSilver") {
        productTypeHTML = "<center><center><img alt='TruCoin Gold' src='../images/new/gold.png' width='24' height='24' /></center><br /><img alt='TruCoin Silver' src='../images/new/silver.png' width='30' height='26' /></center>";
    }

    if (buyArr.createDate) {
        var date = new Date(buyArr.createDate);
        month = Date.parse(date);
        fdate = FormatDateToString(date, "adminDate");
    }
    // console.log(buyArr.invoice)
    var selfentity = $('input[name=self]:checked').val();
    var acc = "";
    var sellBankStatus = "";
    if (buyArr.type != "redeemCash") {
        if (buyArr.MOP == "truWallet" || buyArr.MOP == "wallet") {
            var paidBy = buyArr.paidBy ? 'Paid By : ' + buyArr.paidBy + "<br>" : "";
            acc = '<small>' + paidBy + '</small>';
        }
        else {
            if (buyArr.pgType == "truWallet") {
                var paidBy = buyArr.paidBy ? 'Paid By : ' + buyArr.paidBy + "<br>" : "";
                acc = '<small>' + paidBy + '</small>';
            }
            else {
                var bankName = buyArr.bankName ? 'Bank : ' + buyArr.bankName + "<br>" : "";
                var bankTxnID = buyArr.bankTxnID ? 'Txn ID : ' + buyArr.bankTxnID + "<br>" : "";
                var pgType = buyArr.pgType ? 'PG Type : ' + buyArr.pgType + "<br>" : "";
                var paidBy = buyArr.paidBy ? 'Paid By : ' + buyArr.paidBy + "<br>" : "";
                var error_Desc = "";
                if (buyArr.error_Desc) {
                    error_Desc = "<small style='display: inline-block;color:red;width:150px'>" + buyArr.error_Desc + "</small>";
                }
                acc = '<small>' + bankName + bankTxnID + paidBy + pgType + error_Desc + '</small>';
            }

        }
    }
    else {

        var custName = buyArr.accountHolderName ? 'A/c Holder : <b>' + buyArr.accountHolderName + "</b><br />" : "";
        var bankName = buyArr.bankName ? 'Bank : <b>' + buyArr.bankName + "</b><br />" : "";
        var bankTxnID = buyArr.bankTxnID ? 'Txn ID : <b>' + buyArr.bankTxnID + "</b><br />" : "";
        var accountNo = buyArr.accountNo ? 'A/C : <b>' + buyArr.accountNo + "</b><br />" : "";
        if (accountNo == "") {
            accountNo = buyArr.upi ? 'UPI : <b>' + buyArr.upi + "</b><br />" : "";
        }
        var pgType = buyArr.pgType ? 'PG Type : <b>' + buyArr.pgType + "</b><br />" : "";
        var paidBy = buyArr.paidBy ? 'MOP : <b>' + buyArr.paidBy + "</b><br />" : "";
        if (buyArr.pgType == "truWallet" || buyArr.pgType == "wallet") {
            sellBankStatus=""
        }
        else {
            sellBankStatus = '<a class="edit_btn fa fa-file-text-o text text-info" data-accno=' + buyArr.accountNo + ' data-mop=' + buyArr.paidBy + ' data-tranID=' + buyArr.txnID + ' data-RefNo=' + buyArr.refNo + ' onclick="return OpenBankStatus(this);"> Check Bank Txn</a><br />';
        }
        var error_Desc = "";
        if (buyArr.error_Desc) {
            error_Desc = "<small style='display: inline-block;color:red;width:150px'>" + buyArr.error_Desc + "</small>";
        }
        acc = '<small>' + custName + bankName + bankTxnID + paidBy + accountNo + pgType + sellBankStatus + error_Desc + '</small>';
    }


    var rqueue = {
        'crn': "-",
        "account": acc,
        'gender': buyArr.gender,
        'toSixId': buyArr.to,
        'rTruID': buyArr.rTruID ? buyArr.rTruID : "-",
        'fromSixId': (particulars.fromTruID) ? particulars.fromTruID : "-",
        'consumerName': selfentity == "consumer" ? buyArr.fName + " " + buyArr.lName : buyArr.companyName,
        'invoice': buyArr.invoice,
        'cdt': (fdate) ? fdate : "-",
        'dateTime': (fdate) ? '<span style="display:none">' + month + '</span>' + fdate : "-",
        'transactionType': buyArr.MOP ? buyArr.MOP : "-",
        'totalamount': totalamount,
        'quantity': (particulars.qty < 0) ? particulars.qty * -1 + " gms" : decimalChopper(particulars.qty, 4) + " gms",
        'taxPer': taxPer,
        'toAssetManager': buyArr.assetmanagerName ? buyArr.assetmanagerName : "-",
        'fromAssetManager': (particulars.from) ? particulars.from : "-",
        'remmit': decimalChopper(buyArr.remmitCharges, 2),
        "product": product,
        "transType": status,
        "txn_status": txnstat,
        "btype": "<center>" + btype + "</center>",
        "amount": amount,
        "tax": tax,
        "earning": earning,
        "companyName": buyArr.rTruID ? buyArr.companyName ? buyArr.companyName : "not ok" : "T",
        "brate": brate,
        "productType": productTypeHTML,
        "productTypeHTML": productTypeHTML,
        "totalRevenue": totalRevenue,
        "revenue": revenue,
        "view": '<td><a href="#" class="text-info btnstoshow" data-txnStatus='+buyArr.status+' data-cinvno=' + buyArr.invoice + ' data-ttype=' + buyArr.type + ' data-custno=' + buyArr.truID + ' onclick="openinvoice(this);"><i class="fa fa-2x fa-file-text-o"></i> </a></td>'
    };
    return rqueue;
}
var loadConversion = function (buyArr, status, product) {
    var conversionFrom = buyArr.conversionFrom;
    var conversionTo = buyArr.conversionTo;
    var productTypeHTML = "";
    var productType = "";
    var btype = "";
    if (conversionFrom.bullionType == "G24K") {
        productType = "Gold"
        productTypeHTML = "<center><label class='label label-g24' title='TruCoin Gold'>TruCoin Gold</label><br/><i class='fa fa-long-arrow-down' style='text-align:center;padding:2px' /><br/><label class='label label-s99' title='TruCoin Silver'>TruCoin Silver</label></center>";
    } else if (conversionFrom.bullionType == "S99P") {
        productType = "Silver"
        productTypeHTML = "<center><label class='label label-s99' title='TruCoin Silver'>TruCoin Silver</label><br/><i class='fa fa-long-arrow-down' style='text-align:center;padding:2px' /><br/><label class='label label-g24' title='TruCoin Gold'>TruCoin Gold</label></center>";
    }
    if (conversionFrom.bullionType == "G24K") {
        btype = "<center><label style='text-align:center' class='label label-g24' title='TruCoin Gold'>" + decimalChopper(conversionFrom.qty, 4) + " gms</label><br/><i class='fa fa-long-arrow-down' style='text-align:center;padding:2px' /><br/><label class='label label-s99' style='text-align:center' title='TruCoin Silver'>" + decimalChopper(conversionTo.qty, 4) + " gms</label></center>";
    } else if (conversionFrom.bullionType == "S99P") {
        btype = "<center><label style='text-align:center' class='label label-s99' title='TruCoin Silver'>" + decimalChopper(conversionFrom.qty, 4) + " gms</label><br/><i class='fa fa-long-arrow-down' style='text-align:center;padding:2px' /><br/><label class='label label-g24' style='text-align:center' title='TruCoin Gold'>" + decimalChopper(conversionTo.qty, 4) + " gms</label></center>";
    }

    var amount = parsewallet(conversionTo.amount);
    var tax = parsewallet(conversionTo.tax);
    var taxPer = decimalChopper((parsewallet(conversionTo.tax) / parsewallet(conversionTo.amount)) * 100, 2);
    var earning = 0;
    var totalRevenue = parsewallet(conversionTo.transactionCharges);
    var brate = "<label class='label label-g18' title='TruCoin Gold'><i class='mdi mdi-currency-inr'></i>" + decimalChopper(conversionTo.rate, 2) + "</label>&nbsp;";
    var totalamount = 0, revenue = 0;
    if (buyArr.totalAmount) {
        if (buyArr.totalAmount != "NaN") {
            totalamount = buyArr.totalAmount;
        }
    }
    if (totalRevenue) {
        revenue = totalRevenue - earning
    } 
    if (buyArr.MOP == "truWallet" || buyArr.MOP == "wallet") {
        var paidBy = buyArr.paidBy ? 'Paid By : ' + buyArr.paidBy + "<br>" : "";
        acc = '<small>' + paidBy + '</small>';
    }
    else 
    {
        if (buyArr.pgType == "truWallet") {
            var paidBy = buyArr.paidBy ? 'Paid By : ' + buyArr.paidBy + "<br>" : "";
            acc = '<small>' + paidBy + '</small>';
        }
        else {
            var bankName = buyArr.bankName ? 'Bank : ' + buyArr.bankName + "<br>" : "";
            var bankTxnID = buyArr.bankTxnID ? 'Txn ID : ' + buyArr.bankTxnID + "<br>" : "";
            var pgType = buyArr.pgType ? 'PG Type : ' + buyArr.pgType + "<br>" : "";
            var paidBy = buyArr.paidBy ? 'Paid By : ' + buyArr.paidBy + "<br>" : "";
            var error_Desc = "";
            if (buyArr.error_Desc) {
                error_Desc = "<small style='display: inline-block;color:red;width:150px'>" + buyArr.error_Desc + "</small>";
            }
            acc = '<small>' + bankName + bankTxnID + paidBy + pgType + '</small>';
        }

    }
    /*  var fromaddress = "";
     if (buyArr.fromAddress) {
         fromaddress = (buyArr.fromAddress.houseNumber) ? buyArr.fromAddress.houseNumber : "-" + "," + (buyArr.fromAddress.streetNumber) ? buyArr.fromAddress.streetNumber : "-" + "," + (buyArr.fromAddress.city) ? buyArr.fromAddress.city : "-" + "," + (buyArr.fromAddress.state) ? buyArr.fromAddress.state : "-" + "," + (buyArr.fromAddress.country) ? buyArr.fromAddress.country : "-" + "-" + (buyArr.fromAddress.pin) ? buyArr.fromAddress.pin : "-";
     } */
    var txnstat = "-";
    if (buyArr.status) {
        if (buyArr.status == "success") {
            var mop = "<label class='label label-warning'>" + buyArr.MOP + "</label>";
            txnstat = mop + "<br/><label class='label label-success'>Success</label>"
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
    var selfentity = $('input[name=self]:checked').val();
    var rqueue = {
        'crn': "-",
        "account": acc,
        'gender': buyArr.gender,
        'toSixId': buyArr.to,
        'rTruID': buyArr.rTruID ? buyArr.rTruID : "-",
        'fromSixId': (buyArr.fromTruID) ? buyArr.fromTruID : "-",
        'consumerName': selfentity == "consumer" ? buyArr.fName + " " + buyArr.lName : buyArr.companyName,
        'invoice': buyArr.invoice,
        'cdt': (fdate) ? fdate : "-",
        'dateTime': (fdate) ? '<span style="display:none">' + month + '</span>' + fdate : "-",
        'transactionType': buyArr.MOP ? buyArr.MOP : "-",
        'totalamount': totalamount,
        'taxPer': taxPer,
        'toAssetManager': buyArr.assetmanagerName ? buyArr.assetmanagerName : "-",
        'fromAssetManager': (conversionTo.from) ? conversionTo.from : "-",
        'remmit': decimalChopper(buyArr.remmitCharges, 2),
        "product": product,
        "transType": status,
        "txn_status": txnstat,
        "btype": btype,
        "amount": amount,
        "tax": tax,
        "earning": earning,
        "companyName": buyArr.rTruID ? buyArr.companyName ? buyArr.companyName : "not ok" : "T",
        "brate": brate,
        "productType": productType,
        "productTypeHTML": productTypeHTML,
        "totalRevenue": totalRevenue,
        "revenue": revenue,
        "view": '<td><a href="#" class="text-info btnstoshow" data-cinvno=' + buyArr.invoice + ' data-ttype="conversion" data-custno=' + buyArr.to + ' onclick="openinvoice(this);"><i class="fa fa-2x fa-file-text-o"></i> </a></td>'
    };
    return rqueue;
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
    if (format == 'adminDate') {
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

function OpenBankStatus(that, bankName) {
    let mop = $(that).attr("data-mop");
    let tranID = $(that).attr("data-tranID");
    let RefNo = $(that).attr("data-RefNo");
    let accno = $(that).attr("data-accno");
    var json = {
        "tranID": tranID,
        "RefNo": RefNo,
        "mop": mop
    }
    $("#txnload").removeClass("hidden")
    $("#txnSuccess").addClass("hidden")
    $(".amtcount").addClass("hidden");
    $('#bankmodel').modal('show');
    $.ajax({
        "url": "/Charges/getBankTxnStatus", "method": "POST", data: json, success: function (a) {
            $('#loader').fadeOut('slow');
            let res = a.body;
            if (res && res.status == "200") {
                const arr = res.resource;
                var cdt = _formatDate(Date.parse(arr.txntime), "time");
                let utr = mop == "IMPS" ? "RRN No" : mop == "NEFT" ? "UTR No" : "";
                let utrno = mop == "FT" ? "" : arr.txnId;

                $("#utr").html(utr);
                $("#btransactionID").html(utrno);
                $("#bamount").html("<i class='fa fa-rupee'></i> " + decimalChopper(parsewallet(arr.amount), 2));
                $("#bbankname").html(bankName);
                $("#baccno").html(accno);
                $("#bmop").html(mop);
                $("#dtxnDate").html(cdt);
                $("#bstatus").html(arr.status);
                $("#btxnStatus").html(arr.txnstatus);
                $("#breceived").html(arr.ben_conf_received);
                $("#txnload").addClass("hidden");
                if (mop == "NEFT") {
                    $(".amtcount").removeClass("hidden");
                }
                $("#txnSuccess").removeClass("hidden");
                $('#loaderContainer').fadeOut('slow');

            }
            else {
                alertify.logPosition("bottom left");
                $('#loaderContainer').fadeOut('slow');
                $('#bankmodel').modal('hide');
                alertify.error('Something Went Wrong..!!');
            }
        }
    })
}

function openinvoice()
{

}

var timer;
function startTimer(duration, display) {
    timer = duration;
    var seconds;
    setInterval(function () { 
        seconds =timer; 
        seconds = seconds < 10 ? "0" + seconds : seconds;
        $('#time').text(seconds); 

        if (--timer < 0) { 
            timer = duration;
            self() 
        } 
    }, 1000);
}
function resetTimer() {
  timer = 160;
}
function timer() {
  timer = 160;
  startTimer(timer)
}
timer();
