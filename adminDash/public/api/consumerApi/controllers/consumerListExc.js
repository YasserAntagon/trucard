/*!
 File: account Summary js
 Edited : Nikhil Bharambe
 Dated : 18-04-2018
 recode : 19-07-2022 (Nikhil Bharambe)
 */
var bool = false;
var isDate = false;
function loadDataInTable(json) {
    $("#entityDetailsLoader").css("display", "block");
    var tableReq = $('#rQueue').DataTable({
        "bDestroy": true,
        "processing": true,
        "language": { processing: '<i class="fa fa-spinner fa-spin fa-3x fa-fw text text-info"></i><span class="sr-only">Loading...</span> ' },
        "serverSide": true,
        ajax: {
            url: "/consumerListWF/bindConsumerList",
            type: "POST",
            "data": function (d) {
                return $.extend({}, d, json);
            },
            "complete": function (data) {
                if (data.responseJSON) {
                    $("#cstock24k").text(data.responseJSON.totalStock24 + " gms");
                    $("#cstock99p").text(data.responseJSON.totalStock99 + " gms");
                    $("#walBal").text(decimalChopper(data.responseJSON.wclBal, 2));
                    $("#totalConsumer").text(data.responseJSON.totConsumer);

                }
                $(".spinnerRev").addClass("hidden")
                $(".spinnerVal").removeClass("hidden")
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
            text: 'Download CSV <i class="fa fa-spinner fa-spin hidden" />',
            action: (e, dt) => {
                var rowCount = tableReq.page.info().recordsTotal;
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
                $('#ladda-label').removeClass("hidden")
                // Initialize download
                var csv = "csv"
                var indata = {
                    token,
                    rowCount,
                    csv
                }
                var custId = $("#cmbConsumer").val();
                if (custId != "0") {
                    indata.to = custId;
                }
                var pval = $('#byOptions').attr("selectedText")
                if (pval && pval != "all") {
                    indata.KYCFlag = pval;
                }
                var bySort = $('#bySort').attr("selectedText")
                if (bySort && bySort != "all") {
                    indata.sortBy = bySort;
                }
                if (isDate) {
                    var start = $('#config-demo').data('daterangepicker').startDate._d;
                    var end = $('#config-demo').data('daterangepicker').endDate._d;
                    indata.startdate = start;
                    indata.enddate = end;
                }
                nonAjaxPost('/consumerListWF/excel-download', indata);
                const checkIfDownloadIsComplete = setInterval(() => {
                    if (getCookie('DownloadComplete') === token.toString()) {
                        clearInterval(checkIfDownloadIsComplete);
                        $('#ladda-label').addClass("hidden");
                        deleteCookie('DownloadComplete');
                    }
                }, 500);
            },
        }

        ],
        "columns": [
            {
                "title": "Sr.No",
                "data": null,
                render: function (data, type, row, meta) {
                    return meta.row + meta.settings._iDisplayStart + 1;
                }
            },
            {
                "title": "Consumer",
                "data": null,
                "render": function (data) {
                    return data.consumerName + "\n<br><small>(" + data.truID + ")</small>";
                }
            },
            {
                "title": "Create Date",
                "data": null,
                "render": function (data) {
                    var date = new Date(Date.parse(data.createDate));
                    return FormatDateToString(date, "time");
                }
            },
            {
                "data": "mobile", title: "Mobile"
            },
            {
                "data": "email", title: "Email"
            },
            {
                "data": "wallet", title: "Wallet Bal."
            },
            {
                "title": "KYC Status",
                "data": null,
                "render": function (data) {
                    let KYCTime = data.KYCTime ? _formatDate(data.KYCTime, "timeshortAMPM") : "";
                    var kycby = data.KYCVerifyBy ? data.KYCVerifyBy : "";
                    let KYCVerifyBy = KYCTime;
                    if (kycby) {
                        KYCVerifyBy += "<br><i class='fa fa-user' title='Active By' />" + kycby
                    }
                    var statusActivation = ``;
                    var status = "";
                    if (data.KYCFlag == "active") {
                        status = `<button class="btn btn-sm btn-success">Active</button>`
                        statusActivation = `<li><a tabindex="-1" href="javascript:void(0);" onclick="consumerActivationBC('blocked','` + data.truID + `')">Block account</a></li>
                            <li><a tabindex="-1" tabindex="-1" href="javascript:void(0);" onclick="consumerActivationBC('holder','`+ data.truID + `')">OnHold account</a></li>`;
                    }
                    else if (data.KYCFlag == "pending") {
                        status = `<button class="btn btn-sm btn-warning">Pending</button>`
                    }
                    else if (data.KYCFlag == "holder" || data.KYCFlag == "onhold") {
                        status = `<button class="btn btn-sm btn-warning">OnHold</button>`
                        statusActivation = `<li><a tabindex="-1" href="javascript:void(0);" onclick="consumerActivationBC('active','` + data.truID + `')">Unlock account</a></li>`;
                    }
                    else if (data.KYCFlag == "blocked") {
                        status = `<button class="btn btn-sm btn-danger">Blocked</button>`
                        statusActivation = `<li><a tabindex="-1" href="javascript:void(0);" onclick="consumerActivationBC('active','` + data.truID + `')">Unblock account</a></li>`;
                    }
                    else if (data.KYCFlag == "notactive") {
                        status = `<button class="btn btn-sm btn-warning">Not Activated</button>`
                        statusActivation = `<li><a tabindex="-1" href="javascript:void(0);" onclick="consumerActivationBC('active','` + data.truID + `')">Activate account</a></li>`;
                    }
                    else {
                        status = `<button class="btn btn-sm btn-success">` + data.KYCFlag + `</button>`
                        statusActivation = `<li><a tabindex="-1" href="javascript:void(0);" onclick="consumerActivationBC('active','` + data.truID + `')">Activate account</a></li>`;
                    }
                    var txtActivation = `<div class="btn-group" id="ID` + data.truID + `">` + status + ``;
                    var aadhaarPanst = `<div class="btn-group">`;
                    if (data.aadharStatus == "active") {
                        aadhaarPanst += `<button title='Aadhaar Verified' style='margin-left:2px' class='btn btn-sm'><img src="../images/aadhar.png" width="24" height="18" /> <i class="fa fa-check text text-success"></i></button>`;
                    }
                    else {
                        aadhaarPanst += `<button title='Aadhaar verification pending' style='margin-left:2px' class='btn btn-sm'><img src="../images/aadhar.png" width="24" height="18" /> <i class="fa fa-hourglass-end text text-warning"></i></button>`;
                    }
                    if (data.panStatus == "active") {
                        aadhaarPanst += `<button title='PAN Verified' style='margin-left:2px' class='btn btn-sm'><img src="../images/panlogo.png" width="28" height="18" /> <i class="fa fa-check text text-success"></i></button>`;
                    }
                    else {
                        aadhaarPanst += `<button title='pan verification pending' style='margin-left:2px' class='btn btn-sm'><img src="../images/panlogo.png" width="28" height="18" /> <i class="fa fa-hourglass-end text text-warning"></i></button>`;
                    }
                    aadhaarPanst += "</div>";
                    if (data.KYCFlag != "pending") {
                        txtActivation += `
                            <button class="btn btn-sm dropdown-toggle" data-toggle="dropdown">
                            <span class="caret"></span>
                            </button>
                            <ul class="dropdown-menu">`+ statusActivation + `</ul>`
                    }

                    return txtActivation + "</div><br />"+aadhaarPanst+ '<br /><small>'+KYCVerifyBy+'</small>';;
                }
            },
            {
                title: "Stock In gms",
                "data": null,
                "render": function (data) {
                    var dataDF = "";
                    if (data.stock24) {
                        dataDF = `<label class='label label-warning' title='TruCoin Gold'>TruCoin Gold : ` + data.stock24 + ` <span class='congms'></span>` + `</label>&nbsp;`;
                    }
                    else {
                        dataDF = `<label class='label label-warning' title='TruCoin Gold'>TruCoin Gold : 0 <span class='congms'></span>` + `</label>&nbsp;`;
                    }
                    if (data.stock99) {
                        dataDF += `<br><label class='label label-default' title='TruCoin Silver'>TruCoin Silver : ` + data.stock99 + ` <span class='congms'></span>` + `</label>&nbsp;`;
                    }
                    else {
                        dataDF += `<br><label class='label label-default' title='TruCoin Silver'>TruCoin Silver: 0 <span class='congms'></span>` + `</label>&nbsp;`;

                    }

                    if (dataDF == "") {
                        dataDF = "-";
                    }
                    return dataDF;
                }
            },
            {
                title: "Ref.By",
                "data": null,
                "render": function (data) {
                    if (data.refFlag == "consumer") {
                        return '<label class="label label-success"> Consumer Channel \n </label><p>' + data.referBy + '</p>';
                    }
                    else if (data.refFlag == "admin") {
                        return '<label class="label label-warning"> Admin Channel\n </label><p>' + data.referBy + '</p>';
                    }
                    else if (data.refFlag == "entity") {
                        return '<label class="label label-danger"> Partner \n </label><p>' + data.referBy + '</p>';
                    }
                    else if (data.refFlag == "direct") {
                        return '<label class="label label-warning"> Direct Channel\n </label><p>' + data.referBy + '</p>';
                    }
                    else if (data.refFlag == "assetmanager") {
                        return '<label class="label label-primary"> AssetManager Channel\n </label><p>' + data.referBy + '</p>';
                    }
                    return null;
                }
            },
            {
                title: "In Details",
                "data": null,
                "render": function (data) {
                    return "<a href='/openConsumerDash?id=" + data.truID + "'  title='Go to " + data.consumerName + " panel' class='text text-primary fa fa-2x fa-file-text-o'></a>";
                }
            },
            {
                "title": "Support ?",
                "data": null,
                "render": function (data) {
                    return "<a href='#' data-email='" + data.email + "' data-title='" + data.consumerName + "' onclick='showCompose(this)' class='text text-primary fa fa-2x fa-envelope'></a>";

                }
            }

        ]
    })
    if (!bool) {
        // $("div.toolbar").html('<div class="input-daterange input-group input-group-sm" id="config-demo"><i class="input-group-addon b-0"><i class="fa fa-calendar"></i></i><span class="form-control"></span>&nbsp;&nbsp;</div><span class="pdf"></span>');
        loaddate();
        $("#example_wrapper").removeClass('container-fluid');
        bool = true;
    }
    $("#clear-label").addClass("hidden");
    $("#entityDetailsLoader").fadeOut('slow');
}
function showDlr(event) {
    $tid = $(event).attr("data-truID");
    $enstatas = $(event).attr("data-enstatus");
    //  if ($enstatas == "false") {
    onSearch($tid)
    // }
}
function showCompose(event) {
    let eventemail = $(event).attr("data-email");
    if (!eventemail.includes("@fake.company.com")) {
        let title = $(event).attr("data-title");
        var d = $("#txEmailClient").val();
        $("#txEmailClient").val(eventemail);
        $("#enClientName").val(title);
        $("#compose-textarea").val("");
        $("#toSend").val(eventemail);
        $('#mailModal').modal({ show: 'show' });
        if (eventemail != d) {
            discards();
        }
    } else {
        alertify.logPosition("bottom left");
        alertify.error("Consumer email is not valid..!!");
    }
}
function filterOnSearch(truID) {

    $("#entityDetailsLoader").css("display", "block")
    $("#sortBy").val("0")
    var inputJson = {};
    inputJson.to = truID;
    if (isDate) {
        var start = $('#config-demo').data('daterangepicker').startDate._d;
        var end = $('#config-demo').data('daterangepicker').endDate._d;
        inputJson.startdate = start;
        inputJson.enddate = end;
    }
    var rTruID = $('#cmbPartner').val();
    if (rTruID == "0") {

    }
    else if (rTruID == "Direct") {
        inputJson.channel = "Direct";
    }
    else {
        inputJson.rTruID = rTruID;
    }
    txnfilter(inputJson)
}
function filterOnSearchPartner(rTruID) {

    $("#entityDetailsLoader").css("display", "block")
    $("#sortBy").val("0")
    var inputJson = {};
    if (rTruID == "0") {

    }
    else if (rTruID == "Direct") {
        inputJson.channel = "Direct";
    }
    else {
        inputJson.rTruID = rTruID;
    }

    if (isDate) {
        var start = $('#config-demo').data('daterangepicker').startDate._d;
        var end = $('#config-demo').data('daterangepicker').endDate._d;
        inputJson.startdate = start;
        inputJson.enddate = end;
    }
    txnfilter(inputJson)
}

var getStatement = function (start, end)                 // On Selected Date to bind Account Transaction
{
    isDate = true;
    var val = $('#byOptions').val();
    var inputJson = {};
    if (val != "0") {
        inputJson.KYCFlag = val;
    }
    inputJson.startdate = start;
    inputJson.enddate = end;

    txnfilter(inputJson);
}
var txnfilter = function (inputJson)     /// entity to entity transaction history
{
    loadDataInTable(inputJson);
}
function onclear() {
    $('#byTime').attr("selectedText", "all")
    $("#byTime").text("All Time");
    $("#clear-label").removeClass("hidden");
    isDate = false;
    loaddate();
    $('#byOptions').attr("selectedText", "all")
    $('#bySort').attr("selectedText", "desc")
    $("#byOptions").text("KYC Status");
    $("#bySort").html('Desc <i class="fa fa-calendar" aria-hidden="true"></i>');
    $("#cmbConsumer").select2("val", "0");
    $("#cmbPartner").select2("val", "0");
    loadDataInTable({});
}
function pendingClick() {
    var inputJson = {};
    var pval = $('#byOptions').attr("selectedText")
    if (pval && pval != "all") {
        inputJson.KYCFlag = pval;
    }
    var bySort = $('#bySort').attr("selectedText")
    if (bySort && bySort != "all") {
        inputJson.sortBy = bySort;
    }
    if (isDate) {
        var start = $('#config-demo').data('daterangepicker').startDate._d;
        var end = $('#config-demo').data('daterangepicker').endDate._d;
        inputJson.startdate = start;
        inputJson.enddate = end;
    }
    txnfilter(inputJson);
}
function loaddate() {
    var options = {
        autoUpdateInput: false,
        locale: {
            cancelLabel: 'Clear'
        }
    };
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

$(function () {
    // filterOnSearch(item);
    setTimeout(function () {
        loadDataInTable({});
    }, 500);

});
$('#config-demo').on('cancel.daterangepicker', function (ev, picker) {
    isDate = false;
    loaddate();
    filterOnSearch();
});

$('.radio-group label').on('click', function () {
    $(this).removeClass('not-active').siblings().addClass('not-active');
});
const days = (date_1, date_2) => {
    let difference = date_1.getTime() - date_2.getTime();
    let TotalDays = Math.ceil(difference / (1000 * 3600 * 24));
    return TotalDays;
}
var myCallback = function (start, end) {
    $('#config-demo .form-control').html(start.format('MMM DD, YYYY') + '-' + end.format('MMM DD, YYYY'));
    var start = $('#config-demo').data('daterangepicker').startDate._d;
    var end = $('#config-demo').data('daterangepicker').endDate._d;
    if (days(end, start) > 31) {
        alertify.error("Date range can not be more than 31 days..!!");
        return false;
    }
    $("#cmbConsumer").val("0");
    getStatement(start, end);  // call get account statement
}
$('#cmbConsumer').on('change', function (e) {
    var truID = $(this).val();
    filterOnSearch(truID);
})
$(function () {
    bindConsumers();
    bindPartners("add");
})

$('#cmbPartner').on('change', function (e) {
    var rTruID = $(this).val();
    filterOnSearchPartner(rTruID);
})