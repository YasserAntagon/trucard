// author : Suresh Patil
// date : 03-06-2019
// Description : GST Transactions 
var bool = false;
var $ctruid = $("#txteTruid").val();
const txtisParent = $("#txtisParent").val();
const eMID = $("#eMID").val();
var txnGST = [];
$(function () {
    $('.radio-group label').on('click', function () {
        $(this).removeClass('not-active').siblings().addClass('not-active');
    });
    var json = {};
    if ($ctruid) {
        json.rTruID = $ctruid;
    }
    displayTable(json);
    bindModalPartners($ctruid, txtisParent);
    bindModalConsumers(null, $ctruid, eMID);

});
const isObjectEmpty = (objectName) => {
    return Object.keys(objectName).length === 0
}
function displayTable(json, sentity) {
   
    var tableReq = $('#example').DataTable({
        "bDestroy": true,
        "processing": true,
        "language": { processing: '<i class="fa fa-spinner fa-spin fa-3x fa-fw text text-info"></i><span class="sr-only">Loading...</span> ' },
        "serverSide": true,
        ajax: {
            url: "/summaryExc/getGSTAllTrans",
            type: "POST",
            "data": function (d) {
                return $.extend({}, d, json);
            },
            complete: function (data) {
                txnGST = data.responseJSON.data;
            }
        },
        "ordering": false,
        "searching": false,
        "serverMethod": 'POST',
        "info": true,
        "bLengthChange": true,
        "dom": 'Blfrtip',
        "lengthMenu": [
            [10, 25, 50, 100, 500],
            ['10 rows', '25 rows', '50 rows', '100 rows', '500 rows']
        ],
        buttons: [{
            text: 'GST Report <i class="fa fa-spinner fa-spin hidden" />',
            enabled: false,
            action: (e, dt) => {
                var rowCount = tableReq.page.info().recordsTotal;
                // Set the file and sheet names
                const fileName = 'GST_Transactions';
                const sheetName = 'GSTReport';
                // Organize table data 
                const token = Date.now();
                // Dynamically create and submit a form
                function nonAjaxPost(path, params, method = 'POST') {
                    const tempForm = document.createElement('form');
                    tempForm.setAttribute('method', method);
                    tempForm.setAttribute('action', path);
                    for (const key in params) {
                        if (params.hasOwnProperty(key)) {
                            const hiddenField = document.createElement('input');
                            hiddenField.setAttribute('type', 'hidden');
                            hiddenField.setAttribute('name', key);
                            hiddenField.setAttribute('value', params[key]);
                            tempForm.appendChild(hiddenField);
                        }
                    }
                    document.body.appendChild(tempForm);
                    tempForm.submit();
                    tempForm.remove();
                }

                // Get cookie by name
                function getCookie(cname) {
                    const name = cname + '=';
                    const decodedCookie = decodeURIComponent(document.cookie);
                    const ca = decodedCookie.split(';');
                    for (let i = 0; i < ca.length; i++) {
                        let c = ca[i];
                        while (c.charAt(0) === ' ') {
                            c = c.substring(1);
                        }
                        if (c.indexOf(name) === 0) {
                            return c.substring(name.length, c.length);
                        }
                    }
                    return '';
                }

                // Delete cookie by name
                function deleteCookie(name) {
                    document.cookie = `${name}=; Max-Age=-99999999;`;
                }
                // Show a spinner when the download starts
                $('#ladda-label').removeClass("hidden");
                // Initialize download
                var csv = "csv";
                var json = {
                    token,
                    rowCount,
                    csv
                }
                var selfentity = $('#byOptions').val();
                var cmbConsumer = $('#cmbConsumer').val();
                var cmbPartner = $('#cmbPartner').val();
                var wtype = $('#operations').val();
                var filter = $('.status-dropdownBuy').val();
                if (isDate) {
                    var start = $('#config-demo').data('daterangepicker').startDate._d;
                    var end = $('#config-demo').data('daterangepicker').endDate._d;
                    json.startdate = start;
                    json.enddate = end;
                }
                if (filter == "addMoney" || filter == "walletToBank" || wtype == "wallet") {
                    if (cmbConsumer && cmbConsumer != "0") {
                        json.cTruID = cmbConsumer
                    }
                    var flag = filter == "addMoney" || filter == "walletToBank" ? "wallet" : wtype;
                    json.flag = flag;
                    json.stype = "success";
                    json.isPartner = selfentity == "consumer" ? false : true;
                    if (filter && filter != "0") {
                        json.type = filter
                    }
                    if ($ctruid) {
                        json.rTruID = $ctruid;
                    }
                }
                else {
                    if (cmbConsumer && cmbConsumer != "0") {
                        json.to = cmbConsumer
                    }
                    if (cmbPartner && cmbPartner != "0") {
                        json.rTruID = cmbPartner
                    }
                    else {

                        if ($ctruid) {
                            json.rTruID = $ctruid;
                        }
                    }
                    var successSelected = $('input[name=success]:checked').val();
                    var PGSelected = $('input[name=PGsuccess]:checked').val();

                    json.isPartner = selfentity == "consumer" ? false : true;
                    if (PGSelected != "all") {
                        json.MOP = PGSelected
                    }
                    if (successSelected && successSelected != "all") {
                        json.status = successSelected
                    }
                    if (filter && filter != "0") {
                        json.type = filter
                    }
                }
                nonAjaxPost('/summaryExc/excel-download', json);
                // Now we need to check for the existence of a cookie that
                // signals the end of the download. Then we can hide
                // our spinner.
                const checkIfDownloadIsComplete = setInterval(() => {
                    if (getCookie('DownloadComplete') === token.toString()) {
                        clearInterval(checkIfDownloadIsComplete);
                        $('#ladda-label').addClass("hidden");
                        deleteCookie('DownloadComplete');
                    }
                }, 500);
            }
        }],
        "columns": [
            {
                "data": null,
                render: function (data, type, row, meta) {
                    return meta.row + meta.settings._iDisplayStart + 1;
                }
            },
            { "data": "invoice" },
            {
                "data": null,
                "render": function (data) {
                    //  var gender = data.gender ? data.gender.toLowerCase() : data.gender;
                    // var female = gender == "female" ? "<i title='Female' class='fa fa-2x fa-female'></i>" : gender == "male" ? "<i title='Male' class='fa fa-2x fa-male'></i>" : "<i title='Other' class='fa fa-2x fa-neuter'></i>"
                    return data.consumerName + "\n<br><small>(" + data.to + ")</small>";
                }
            },
            {
                "data": null,
                "render": function (data) {
                    var date = new Date(Date.parse(data.createDate));
                    var month = Date.parse(date);
                    var fdate = FormatDateToString(date, "time");
                    return '<span style="display:none">' + month + '</span>' + fdate;
                }
            },
            {
                "data": null,
                "render": function (data) {
                    var btype = ""
                    if (data.type != "conversion") {
                        btype = "<center><img alt='TruCoin Silver' src='../images/new/gold.png' width='24' height='24' /></center>";
                        if (data.productType.includes("Silver")) {
                            btype = "<center><img alt='TruCoin Gold' src='../images/new/silver.png' width='30' height='26' /></center>";
                        }
                    }
                    else {
                        if (data.conversionFrom == "G24K") {
                            btype = "<center><label class='label label-g24' title='TruCoin Gold'>TruCoin Gold</label><br/><i class='fa fa-long-arrow-down' style='text-align:center;padding:2px' /><br/><label class='label label-s99' title='TruCoin Silver'>TruCoin Silver</label></center>";
                        } else if (data.conversionFrom == "S99P") {
                            btype = "<center><label class='label label-s99' title='TruCoin Silver'>TruCoin Silver</label><br/><i class='fa fa-long-arrow-down' style='text-align:center;padding:2px' /><br/><label class='label label-g24' title='TruCoin Gold'>TruCoin Gold</label></center>";
                        }
                    }
                    return btype;
                }
            },
            {
                "data": null,
                "render": function (data) {
                    return data.type == "buy" ? "Buy" : data.type == "buyCash" ? "Buy" : data.type == "redeemCash" ? "Sell" : data.type == "transfer" ? "Transfer" : data.type;
                }
            },
            {
                "data": null,
                "render": function (data) {

                    if (data.productType.includes("Silver")) {

                        return "<label class='label label-s99' title='" + data.productType + "'>" + decimalChopper(data.exQty, 4) + " <span class='congms'></span>" + "</label>&nbsp;";
                    }
                    else {
                        return "<label class='label label-g24' title='" + data.productType + "'>" + decimalChopper(data.exQty, 4) + " <span class='congms'></span>" + "</label>&nbsp;";

                    }
                }
            },
            {
                "data": null,
                "render": function (data) {
                    return "<i class='mdi mdi-currency-inr'></i>" + decimalChopper(data.brate, 4);
                }
            },
            {
                "data": null,
                "render": function (data) {
                    return "<i class='mdi mdi-currency-inr'></i>" + decimalChopper(data.amount, 4);
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
                    return '<i class="mdi mdi-currency-inr"></i>' + decimalChopper(data.totalAmount, 4);
                }
            },
            {
                "data": null,
                "render": function (data) {
                    return "<i class='mdi mdi-currency-inr'></i>" + decimalChopper(data.grossearning, 4);
                }
            },
            {
                "data": null,
                "render": function (data) {
                    return "<i class='mdi mdi-currency-inr'></i>" + decimalChopper(data.partnerCommission, 4);
                }
            },
            {
                "data": null,
                "render": function (data) {
                    return "<i class='mdi mdi-currency-inr'></i>" + decimalChopper(parseFloat(data.tdsonpartnerCommission), 4);
                }
            },
            {
                "data": null,
                "render": function (data) {
                    return "<i class='mdi mdi-currency-inr'></i>" + decimalChopper(data.earning, 4);
                }
            },
            {
                "data": null,
                "render": function (data) {
                    return "<i class='mdi mdi-currency-inr'></i>" + decimalChopper(data.revenue, 4);
                }
            },
            {
                "data": null,
                "render": function (data) {
                    var rTruID = "";
                    if (data.rTruID) {
                        rTruID = "\n<br><small>(" + data.rTruID + ")</small>"
                    }
                    return data.companyName + rTruID;
                }
            },
            {
                "data": null,
                "render": function (data) {
                    if (data.status) {
                        var mop = data.MOP == "other" || data.MOP == "others" ? "By PG" : data.MOP;
                        if (data.status == "success") {
                            return "<label class='label label-success'>Success</label><br><label class='label label-default'>" + mop + "</label>"
                        }
                        else if (data.status == "reversal") {
                            return "<label class='label label-warning'>Reversal</label><br><label class='label label-default'>" + mop + "</label>"
                        }
                        else {
                            return "<label class='label label-danger'>Failure</label><br><label class='label label-default'>" + mop + "</label>";
                        }
                    } else {
                        return "-";
                    }
                }
            },
            {
                "data": null,
                "render": function (data) {
                    var datas = "";
                    if (sentity === "self") {
                        datas = '<a class="edit_btn text text-info fa fa-file-text-o fa-2x" data-toSixId="' + data.to + '" data-status="' + data.status + '" data-trastype="' + data.type + '" data-invFor="entity" data-invoice="' + data.invoice + '" title="view invoice" onclick="onInvoiceSelf(this);"></a>'
                    } else {
                        datas = '<a class="edit_btn text text-info fa fa-file-text-o fa-2x" data-toSixId="' + data.to + '" data-status="' + data.status + '" data-trastype="' + (data.type === "payment" ? "transfer" : data.type) + '" data-invoice="' + data.invoice + '" title="view invoice" onclick="onInvoice(this);"></a>'
                    }

                    var bankStatus = "";
                    if (data.type == "redeemCash" && (data.MOP == "other" || data.MOP == "others")) {
                        if (sentity === "self") {
                            bankStatus = '<a isPeople="entity" title="payout status" class="edit_btn fa fa-bank text text-info" data-toSixId="' + data.to + '" data-invoice=' + data.invoice + ' onclick="return OpenBankStatus(this);"></a>';
                        }
                        else {
                            bankStatus = '<a isPeople="consumer" title="payout status" class="edit_btn fa fa-bank text text-info" data-toSixId="' + data.to + '" data-invoice=' + data.invoice + ' onclick="return OpenBankStatus(this);"></a>';
                        }
                    }
                    return datas + " " + bankStatus;

                }
            }
        ],
        "columnDefs": [
            {
                "visible": false

            }
        ]
    }); 
    if (!bool) {
        tableReq.button(0).enable(false);
    }
    else {
        tableReq.button(0).enable(true);
    }
    $("#loader").css("display", "none");
}
const days = (date_1, date_2) => {
    let difference = date_1.getTime() - date_2.getTime();
    let TotalDays = Math.ceil(difference / (1000 * 3600 * 24));
    return TotalDays;
}
function onInvoice(item) {
    $invoice = $(item).attr("data-invoice");
    $toSixId = $(item).attr("data-toSixId");
    $trastype = $(item).attr("data-trastype");
    $status = $(item).attr("data-status");
    var previewData = txnGST.filter(item => item.invoice === $invoice)[0];
    OnPreviewInvoice(previewData, "consumer"); 
}
function onInvoiceSelf(item) {
    $invoice = $(item).attr("data-invoice");
    $toSixId = $(item).attr("data-toSixId");
    $trastype = $(item).attr("data-trastype");
    $status = $(item).attr("data-status");
    var previewData = txnGST.filter(item => item.invoice === $invoice)[0];
    OnPreviewInvoice(previewData, "entity"); 
}
var myCallback = function (start, end) {
    $('#config-demo .form-control').html(start.format('MMM DD, YYYY') + '-' + end.format('MMM DD, YYYY'));
    isDate = true;
}
function loaddate() {
    var options = {
        "maxSpan": {
            "days": 31
        }
    };
    options.ranges =
    {
        /*  'Last 1hr': [moment().subtract(1, 'h'),moment()],
         'Last 6hrs': [moment().subtract(6, 'h'),moment()], */
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


