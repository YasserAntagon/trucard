
function decimalChopper(num, fixed) {
    if (num) {
        var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?');
        return num.toString().match(re)[0];
    }
    else {
        return 0
    }
}
function confirmRate($bullionType, $type)  // save Charges 
{
    var gRate = $bullionType == "G24K" ? "TruCoin Gold" : "TruCoin Silver";
    if ($type == "buy") {
        $txtRate = $bullionType == "G24K" ? $("#txtGoldRate").html() : $("#txtSilverRate").html();
    }
    else if ($type == "sell") {
        $txtRate = $bullionType == "G24K" ? $("#txtSGoldRate").html() : $("#txtSSilverRate").html();
    }
    if ($.trim($txtRate) == '') {
        alertify.logPosition("bottom left");
        alertify.error("Please enter " + gRate + " rate");
        return false;
    }
    var gRateLabelEx = "<b class='fa fa-inr text text-danger' style='font-size:40px'> " + $txtRate + "</b><br/>";
    var gRateLabel = gRateLabelEx + 'Are you sure ?';

    //BUY
    var txtGoldRate = $("#hGoldRate").val();
    var txtSilverRate = $("#hSilverRate").val();
    //SELL
    var txtSGoldRate = $("#hSGoldRate").val();
    var txtSSilverRate = $("#hSSilverRate").val();
    //SELL rate should not be higher than BUY rate.
    if ($type == "buy") {
        if ($bullionType == "G24K" && (parseFloat($txtRate) < parseFloat(txtSGoldRate))) {
            gRateLabel = "BUY rate should not be lower than SELL rate."
        }
        if ($bullionType == "S99P" && parseFloat($txtRate) < parseFloat(txtSSilverRate)) {
            gRateLabel = "BUY rate should not be lower than SELL rate."
        }
    }
    else if ($type == "sell") {
        if ($bullionType == "G24K" && (parseFloat(txtGoldRate) < parseFloat($txtRate))) {
            gRateLabel = "SELL rate should not be higher than BUY rate."
        }
        if ($bullionType == "S99P" && parseFloat(txtSilverRate) < parseFloat($txtRate)) {
            gRateLabel = "SELL rate should not be higher than BUY rate."
        }
    }
    var title = gRateLabel;
    var text = "Do you want to update " + gRate + " rates..!!";


    swal({
        title: title,
        text: text,
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, proceed it !',
        cancelButtonText: 'No, cancel!',
        confirmButtonClass: 'btn btn-sm btn-primary',
        cancelButtonClass: 'btn btn-sm btn-danger m-l-10',
        buttonsStyling: false
    }).then(function () {
        saveRates($txtRate, $bullionType, $type);
    }, function (dismiss) {
        if (dismiss === 'cancel') {
            swal('Cancelled', 'you cancelled your request...', 'error');
            flag = false;
        }
    })
}
function saveRates(txtRate, bullionType, type)  // save Charges 
{
    var json = {
        "amTruID": $("#cmbPartner").val(),
        "rate": parseFloat(txtRate),
        "bullionType": bullionType,
        "type": type
    };
    txnCheck(function (status) {
        if (status == true) {
            $.ajax({
                "url": "/LBMA/setRateByAdmin", "method": "POST", data: json, success: function (a) {
                    let res = a.body;
                    $('.chargesLoader').fadeOut('slow');
                    if (res.status == 200) {
                        alertify.logPosition("bottom left");
                        alertify.success('Rate Updated Successfully..!!');
                        bindDataList({ "amTruID": $("#cmbPartner").val(), dateflag: "all" })
                    }
                    else {
                        alertify.logPosition("bottom left");
                        alertify.error(res.message);
                    }
                }
            });
        }
        else {
            alertify.error("Please Verify TPIN..!!")
        }
    })
}

function alertSubmit()  //Alert Submit
{
    $('.chargesLoader').css('display', 'block');
    $('#alertSubmit').prop("disabled", "disabled")
    $.ajax({
        "url": "/LBMA/alertSubmit", "method": "POST", success: function (res) { // call alert API
            $('.chargesLoader').fadeOut('slow');

            if (res.status == "200") {
                alertify.logPosition("bottom left");
                alertify.success('Rate alert sent Successfully..!!');
            }
            else {
                $('#alertSubmit').prop("disabled", "")
                alertify.logPosition("bottom left");
                alertify.error(res.message);
            }
        }
    });
}

var editable = function () {
    $('#txtGoldRate').editable({
        type: 'text',
        title: 'Enter TruCoin Rate',
        validate: function (value) {
            if ($.trim(value) == '' || $.trim(value) == '0') return 'This field is required';
            if ($.isNumeric(value) == '') {
                return 'Please enter valid rate';
            } 
            $("#txtGoldRate").html($.trim(value));
            $("#rdGoldBuy").attr("checked", "checked");
        },
        success: function (response, newValue) {
            if ($.trim(newValue) == '' || $.isNumeric(newValue) == '') {
                return false;
            }
            else {
                bindTable();
            }
        }
    });
    $('#txtSilverRate').editable({
        type: 'text',
        title: 'Enter TruCoin Rate',
        validate: function (value) {
            if ($.trim(value) == '' || $.trim(value) == '0') return 'This field is required';
            if ($.isNumeric(value) == '') {
                return 'Please enter valid rate';
            }
            $("#txtSilverRate").html($.trim(value));
            $("#rdsilverBuy").attr("checked", "checked");
            

        },
        success: function (response, newValue) {
            if ($.trim(newValue) == '' || $.isNumeric(newValue) == '') {
                alertify.logPosition("bottom left");
                alertify.error('Please enter valid rate');
                return false;
            }
            else {
                bindTable();
            }
        }
    });

    $('#txtSGoldRate').editable({
        type: 'text',
        title: 'Enter TruCoin Rate',
        validate: function (value) {
            if ($.trim(value) == '' || $.trim(value) == '0') return 'This field is required';
            if ($.isNumeric(value) == '') {
                return 'Please enter valid rate';
            }
            $("#txtSGoldRate").html($.trim(value));
             $("#rdGoldSell").attr("checked", "checked");
        },
        success: function (response, newValue) {
            if ($.trim(newValue) == '' || $.isNumeric(newValue) == '') {
                alertify.logPosition("bottom left");
                alertify.error('Please enter valid rate');
                return false;
            }
            else {
                bindTable();
            }
        }
    });
    $('#txtSSilverRate').editable({
        type: 'text',
        title: 'Enter TruCoin Rate',
        validate: function (value) {
            if ($.trim(value) == '' || $.trim(value) == '0') return 'This field is required';
            if ($.isNumeric(value) == '') {
                return 'Please enter valid rate';
            }
            $("#txtSSilverRate").html($.trim(value));
             $("#rdsilverSell").attr("checked", "checked");
        },
        success: function (response, newValue) {
            if ($.trim(newValue) == '' || $.isNumeric(newValue) == '') {
                alertify.logPosition("bottom left");
                alertify.error('Please enter valid rate');
                return false;
            }
            else {
                bindTable();
            }
        }
    });
    $('#txttransactionFees').editable({
        type: 'text',
        title: 'Enter Transaction Fee',
        validate: function (value) {
            if ($.trim(value) == '') return 'This field is required';
            if ($.isNumeric(value) == '') {
                return 'Only number & decimal value are allowed';
            }
            if (parseFloat($.trim(value)) > 99) {
                return 'please enter valid charges';
            }
            $("#txttransactionFees").html($.trim(value));
            bindTable();
        }
    });
    $('#txtassetstoreCharges').editable({
        type: 'text',
        title: 'Enter AssetStore Charges',
        validate: function (value) {
            if ($.trim(value) == '') return 'This field is required';
            if ($.isNumeric(value) == '') {
                return 'Only number & decimal value are allowed';
            }
            if (parseFloat($.trim(value)) > 99) {
                return 'please enter valid charges';
            }
            $("#txtassetstoreCharges").html($.trim(value));
            bindTable();
        }
    });
    $('#txtassetmanagerCharges').editable({
        type: 'text',
        title: 'Enter AssetManager Charges',
        validate: function (value) {
            if ($.trim(value) == '') return 'This field is required';
            if ($.isNumeric(value) == '') {
                return 'Only number & decimal value are allowed';
            }
            if (parseFloat($.trim(value)) > 99) {
                return 'please enter valid charges';
            }
            $("#txtassetmanagerCharges").html($.trim(value))
            bindTable();
        }
    });
    $('#txtCTax').editable({
        type: 'text',
        title: 'Enter Tax',
        validate: function (value) {
            if ($.trim(value) == '') return 'This field is required';
            if ($.isNumeric(value) == '') {
                return 'Only number & decimal value are allowed';
            }
            if (parseFloat($.trim(value)) > 99) {
                return 'please enter valid taxes';
            }
            $("#txtCTax").html($.trim(value))
            bindTable();
        }
    });
    $('#txtSTax').editable({
        type: 'text',
        title: 'Enter Tax',
        validate: function (value) {
            if ($.trim(value) == '') return 'This field is required';
            if ($.isNumeric(value) == '') {
                return 'Only number & decimal value are allowed';
            }
            if (parseFloat($.trim(value)) > 99) {
                return 'please enter valid taxes';
            }
            $("#txtSTax").html($.trim(value))
            bindTable();
        }
    });
    $('#txtNetworkFee').editable({
        type: 'text',
        title: 'Enter Tax',
        validate: function (value) {
            if ($.trim(value) == '') return 'This field is required';
            if ($.isNumeric(value) == '') {
                return 'Only number & decimal value are allowed';
            }
            if (parseFloat($.trim(value)) > 99) {
                return 'please enter valid loading';
            }
            $("#txtNetworkFee").html($.trim(value))
            bindTable();
        }
    });
    /* $('#txtTransferFee').editable({
        type: 'text',
        title: 'Enter Tax',
        validate: function (value) {
            if ($.trim(value) == '') return 'This field is required';
            if ($.isNumeric(value) == '') {
                return 'Only number & decimal value are allowed';
            }
            if (parseFloat($.trim(value)) > 99) {
                return 'please enter valid Transfer Fee';
            }
            $("#txtTransferFee").html($.trim(value))
            bindTable();
        }
    }); */

}
function bindRateData(amTruID) {
    var json = { "amTruID": amTruID };
    $('.chargesLoader').css('display', 'block');
    $.ajax({
        "url": "/LBMA/getLiveRateByAdmin", "method": "POST", data: json, success: function (a) {
            let res = a.body;
            $('.chargesLoader').fadeOut('slow');
            if (res.status == 200) {
                $txtGoldRate = res.resource.G24Kgross ? parseFloat(res.resource.G24Kgross) : 0;  // Transaction Charges
                $txtSilverRate = res.resource.S99Pgross ? parseFloat(res.resource.S99Pgross) : 0; // assetmanager Charges
                $txtSGoldRate = res.resource.G24KSalegross ? parseFloat(res.resource.G24KSalegross) : 0;  // Transaction Charges
                $txtSSilverRate = res.resource.S99PSalegross ? parseFloat(res.resource.S99PSalegross) : 0; // assetmanager Charges

                $("#txtGoldRate").html($txtGoldRate);
                $("#txtSilverRate").html($txtSilverRate);
                $("#txtSGoldRate").html($txtSGoldRate);
                $("#txtSSilverRate").html($txtSSilverRate);

                $("#hGoldRate").val($txtGoldRate);
                $("#hSilverRate").val($txtSilverRate);
                $("#hSGoldRate").val($txtSGoldRate);
                $("#hSSilverRate").val($txtSSilverRate);
              //  bindchargesData()
            }
        }
    });
}
function bindDataList(json) {
    $('.chargesLoader').css('display', 'block');
    $.ajax({
        "url": "/LBMA/liveRateLog", "method": "POST", data: json, success: function (a) {
            let res = a.body;
            $('.chargesLoader').fadeOut('slow');
            if (res.status == 1000) {
                bindChargesList(res.buy)
            }
        }
    });
}


bindAssetManager();
function bindAssetManager() {
    $('.select2').select2();
    let json = {
        "KYCFlag": "active"
    }
    $.ajax({
        "url": "/assetmanagerList/getassetmanagerList", "method": "POST", data: json, success: function (a) {
            var buyArr = a.body;
            if (buyArr) {
                bindRateData(buyArr[0].truID)
                bindDataList({ "amTruID": buyArr[0].truID, dateflag: "all" })
                $('#cmbPartner').empty();
                //   $('#cmbPartner').append('<option value="0">Select AssetManager</option>');
                for (var i = 0; i < buyArr.length; i++) {
                    var companyName = buyArr[i].companyName.replace('null', '');
                    $data = companyName + " - " + buyArr[i].truID + " - " + buyArr[i].mobile;

                    $('#cmbPartner').append('<option value="' + buyArr[i].truID + '">' + $data + '</option>');
                }
            }
        }
    });
}


var bindChargesList = function (buyArr) {
    var reqQueue = new Array();
    var reqQueueSale = new Array();
    for (var i = 0; i < buyArr.length; i++) {
        var date = new Date(buyArr[i].dateChanged);
        var month = Date.parse(date);
        var fdate = FormatDateToString(month, "time");
        var rqueue = {
            'crn': "-",
            "datesort": month,
            'rate': "<i class='fa fa-inr' /> " + parseFloat(buyArr[i].rate),
            'date': fdate,
            "type": buyArr[i].type == "G24K" ? "TruCoin Gold" : buyArr[i].type == "G24KSale" ? "TruCoin Gold" : buyArr[i].type == "G24KSale" ? "TruCoin Silver" : "TruCoin Silver",
        };
        if (buyArr[i].type == "G24KSale" || buyArr[i].type == "S99PSale") {
            reqQueueSale.push(rqueue);
        }
        else {
            reqQueue.push(rqueue);
        }
    }
    bindChargesListSale(reqQueueSale);
    bindChargesListTable(reqQueue);
    loaddate();
}
var reqQueuetable;
var reqSaleQueuetable;
var bindChargesListSale = function (reqQueue) {
    if ($.fn.dataTable.isDataTable('#reqCharges')) {
        reqSaleQueuetable.clear();
        reqSaleQueuetable.rows.add(reqQueue);
        reqSaleQueuetable.draw();
    }
    else {
        reqSaleQueuetable = $('#reqChargesSell').DataTable({
            "processing": true,
            "info": false,
            "bLengthChange": true,
            bAutoWidth: false,
            "pageLength": 10,
            "sScrollX": "100%",
            "order": [[1, "desc"]],
            data: reqQueue,
            lengthChange: false,
            dom: 'Bfrtip',
            buttons: [
                {
                    extend: 'excel',
                    text: '<i class="fa fa-file-excel-o text text-success"> Excel</i>',
                    filename: 'RateLogSell_Report'
                }],
            "columns": [{
                "data": 'crn'
            }, {
                "data": "datesort"
            }, {
                "data": "date"
            }, {
                "data": "type"
            }, {
                "data": "rate"
            }],
            "columnDefs": [
                {
                    "targets": [1],
                    "visible": false

                }
            ]
        });
        $("#toolbar").html('<span class="pdf"></span>');
        reqSaleQueuetable.buttons().container().appendTo('.pdf');
        $('.pdf div').addClass("btn-group-sm");
        $('.toolbar').css("display", "flex");
        // $("#example_wrapper").removeClass('container-fluid');
        reqSaleQueuetable.on('order.dt search.dt', function () {
            reqSaleQueuetable.column(0, { search: 'applied', order: 'applied' }).nodes().each(function (cell, i) {
                cell.innerHTML = i + 1;
            });
        }).draw();
    }
}
var bindChargesListTable = function (reqQueue) {
    if ($.fn.dataTable.isDataTable('#reqCharges')) {
        reqQueuetable.clear();
        reqQueuetable.rows.add(reqQueue);
        reqQueuetable.draw();
    } else {
        reqQueuetable = $('#reqCharges').DataTable({
            "processing": true,
            "info": false,
            "bLengthChange": true,
            bAutoWidth: false,
            "pageLength": 10,
            "sScrollX": "100%",
            "order": [[1, "desc"]],
            dom: 'Bfrtip',
            data: reqQueue,
            lengthChange: true,
            buttons: [
                {
                    extend: 'excel',
                    text: '<i class="fa fa-file-excel-o text text-success"> Excel</i>',
                    filename: 'RateLog_Report'
                }],
            "columns": [{
                "data": 'crn'
            }, {
                "data": "datesort"
            }, {
                "data": "date"
            }, {
                "data": "type"
            }, {
                "data": "rate"
            }],
            "columnDefs": [
                {
                    "targets": [1],
                    "visible": false

                }
            ]
        });
        $("#toolbar").html('<span class="pdf"></span>');
        reqQueuetable.buttons().container().appendTo('.pdf');
        $('.pdf div').addClass("btn-group-sm");
        $('.toolbar').css("display", "flex");
        // $("#example_wrapper").removeClass('container-fluid');
        reqQueuetable.on('order.dt search.dt', function () {
            reqQueuetable.column(0, { search: 'applied', order: 'applied' }).nodes().each(function (cell, i) {
                cell.innerHTML = i + 1;
            });
        }).draw();
    }
}

// bindchargesData("c2d");
$('.radio-group label').on('click', function () {
    $(this).removeClass('not-active').siblings().addClass('not-active');
});
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
var myCallback = function (start, end) {
    $('#config-demo .form-control').html(start.format('MMM DD, YYYY') + '-' + end.format('MMM DD, YYYY'));
    var start = start.format('MM-DD-YYYY');
    var end = end.format('MM-DD-YYYY');
    bindDataList({ "amTruID": $("#cmbPartner").val(), dateflag: "date", startDate: start, endDate: end })
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
(function ($) {
    'use strict';
    jQuery(document).on('ready', function () {

        $('a.page-scroll').on('click', function (e) {
            var anchor = $(this);
            $('html, body').stop().animate({
                scrollTop: $(anchor.attr('href')).offset().top - 50
            }, 1500);
            e.preventDefault();
        });
    });
})(jQuery);