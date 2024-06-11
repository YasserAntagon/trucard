
function decimalChopper(num, fixed) {
    if (num) {
        var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?');
        return num.toString().match(re)[0];
    }
    else {
        return 0
    }
}
function confirmStock($bullionType)  // save Charges 
{
    var gRate = $bullionType == "G24K" ? "TruCoin Gold" : "TruCoin Silver";
    $txtRate = $bullionType == "G24K" ? $("#txtGoldStock").html() : $("#txtSilverStock").html();
    if ($.trim($txtRate) == '') {
        alertify.logPosition("bottom left");
        alertify.error("Please enter " + gRate + " rate");
        return false;
    }
    var gRateLabelEx = "<b class='fa fa-inr text text-danger' style='font-size:40px'> " + $txtRate + "</b><br/>";
    var gRateLabel = gRateLabelEx + 'Are you sure ?';

    var title = gRateLabel;
    var text = "Do you want to update " + gRate + " stock..!!";

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
        saveStock($txtRate, $bullionType);
    }, function (dismiss) {
        if (dismiss === 'cancel') {
            swal('Cancelled', 'you cancelled your request...', 'error');
            flag = false;
        }
    })
}
function saveStock(txtRate, bullionType)  // save Charges 
{
    var amTruID = $("#cmbPartner").val();
    var json = {
        "amTruID": amTruID,
        "qty": parseFloat(txtRate),
        "bullionType": bullionType
    };
    txnCheck(function (status) {
        if (status == true) {
            $.ajax({
                "url": "/LBMA/setStockByAdmin", "method": "POST", data: json, success: function (res) {
                    $('.chargesLoader').fadeOut('slow');
                    if (res.status == "200") {
                        alertify.logPosition("bottom left");
                        alertify.success('Stock Updated Successfully..!!');
                        $('#txtGoldStock').html("0")
                        $('#txtSilverStock').html("0")
                        bindDataList({ "amTruID": amTruID })
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


var editable = function () {
    $('#txtGoldStock').editable({
        type: 'text',
        title: 'Enter TruCoin Rate',
        validate: function (value) {
            if ($.trim(value) == '' || $.trim(value) == '0') return 'This field is required';
            if ($.isNumeric(value) == '') {
                return 'Please enter valid rate';
            }
            $("#txtGoldStock").html($.trim(value));
        },
        success: function (response, newValue) {
            if ($.trim(newValue) == '' || $.isNumeric(newValue) == '') {
                return false;
            }
            else {
                saveStock(newValue, "G24K");
            }
        }
    });
    $('#txtSilverStock').editable({
        type: 'text',
        title: 'Enter TruCoin Rate',
        validate: function (value) {
            if ($.trim(value) == '' || $.trim(value) == '0') return 'This field is required';
            if ($.isNumeric(value) == '') {
                return 'Please enter valid rate';
            }
            $("#txtSilverStock").html($.trim(value));
        },
        success: function (response, newValue) {
            if ($.trim(newValue) == '' || $.isNumeric(newValue) == '') {
                alertify.logPosition("bottom left");
                alertify.error('Please enter valid rate');
                return false;
            }
            else {
                saveStock(newValue, "S99P");
            }
        }
    });
}

function bindDataList(json) {
    editable();
    $('.chargesLoader').css('display', 'block');
    $.ajax({
        "url": "/LBMA/getStockLog", "method": "POST", data: json, success: function (res) {
            $('.chargesLoader').fadeOut('slow');
            if (res.status == "200") {
                $("#stock24k").html(res.availableStock.G24K ? decimalChopper(res.availableStock.G24K, 4) : "0");
                $("#stocks99p").html(res.availableStock.S99P ? decimalChopper(res.availableStock.S99P, 4) : "0");
                bindDealerList(res.resource)
            }

        }
    });
}
$(function () {
    $('.select2').select2();
    let json = {
        "KYCFlag": "active"
    }
    loaddate();
    $.ajax({
        "url": "/assetmanagerList/getassetmanagerList", "method": "POST", data: json, success: function (a) {
            var buyArr = a.body;
            if (buyArr) {
                bindDataList({ "amTruID": buyArr[0].truID })
                $('#cmbPartner').empty();
                for (var i = 0; i < buyArr.length; i++) {
                    var companyName = buyArr[i].companyName.replace('null', '');
                    $data = companyName + " - " + buyArr[i].truID + " - " + buyArr[i].mobile;
                    $('#cmbPartner').append('<option value="' + buyArr[i].truID + '">' + $data + '</option>');
                }
            }
        }
    });
})



var bindDealerList = function (buyArr) {
    var reqQueue = new Array();
    for (var i = 0; i < buyArr.length; i++) {
        var date = new Date(buyArr[i].accRejDate);
        var month = Date.parse(date);
        var fdate = FormatDateToString(month, "time");
        var rqueue = {
            'crn': "-",
            "datesort": month,
            'rate': parseFloat(buyArr[i].qty) + " gms",
            'date': fdate,
            "type": buyArr[i].bullionType == "G24K" ? "TruCoin Gold" : "TruCoin Silver",
        };
        reqQueue.push(rqueue);
    }
    bindDealerListTable(reqQueue);
}
var reqQueuetable;
var bindDealerListTable = function (reqQueue) {
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
    var start = $('#config-demo').data('daterangepicker').startDate._d;
    var end = $('#config-demo').data('daterangepicker').endDate._d;
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


function bindAssetManager()
{
    loaddate();
    bindDataList({ "amTruID": $("#cmbPartner").val()});
}