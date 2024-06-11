/*!
 File: account Summary js
 Edited : Nikhil Bharambe
 Dated : 18-04-2018
 recode : 19-07-2022 (Nikhil Bharambe)
 */
var bool = false;
var isDate = false;
function loadDataInTable(json) {
    json.isParent = true
    $("#nodeListloader").css("display", "block");
    $(".spinnerRev").removeClass("hidden");
    $(".spinnerVal").addClass("hidden");
    var tableReq = $('#rQueue').DataTable({
        "bDestroy": true,
        "processing": true,
        "language": { processing: '<i class="fa fa-spinner fa-spin fa-3x fa-fw text text-info"></i><span class="sr-only">Loading...</span> ' },
        "serverSide": true,
        ajax: {
            url: "/summaryExc/partnerList",
            type: "POST",
            "data": function (d) {
                return $.extend({}, d, json);
            },
            "complete": function (data) {
                if (data.responseJSON) {
                    $("#walBal").text(decimalChopper(data.responseJSON.wclBal, 2));
                    $("#totalPartner").text(data.responseJSON.totPartner);
                    $("#totalPartners").text(data.responseJSON.totNodes);
                    $("#cstock24k").text(data.responseJSON.totalStock24 + " gms");
                    $("#cstock99p").text(data.responseJSON.totalStock99 + " gms");
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
                var indata = {
                    token,
                    rowCount,
                    csv
                }
                var pval = $('#byOptions').attr("selectedText")
                if (pval && pval != "all") {
                    indata.KYCFlag = pval;
                }
                var cmbPartner = $('#cmbPartner').val();
                if (cmbPartner != "0") {
                    indata.to = cmbPartner;
                }
                else {
                    var ppartnerval = $("#optionsPartner").attr("selectedText");
                    if (ppartnerval == "partner") {
                        indata.isParent = true;
                    }
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
                nonAjaxPost('/summaryExc/excelPartner', indata);
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
                "data": null, title: "Sr.No",
                render: function (data, type, row, meta) {
                    return meta.row + meta.settings._iDisplayStart + 1;
                }
            },
            {
                "data": null, title: "Partner",
                "render": function (data) {
                    return data.companyName + "\n<br><small>(" + data.truID + ")</small>";
                }
            },
            {
                "data": null, title: "Authorized Person",
                "render": function (data) {
                    return data.partnerName;
                }
            },
            {
                "data": null, title: "Create Date",
                "render": function (data) {
                    var date = new Date(Date.parse(data.createDate));
                    return FormatDateToString(date, "time");
                }
            },
            {
                "data": "mobile", title: "MobileNo"
            },
            {
                "data": "email", title: "Email"
            },
            {
                "data": "address", title: "Address"
            },
            {
                "data": null, title: "Parent",
                "render": function (data) {
                    return "<label class='label label-info'>Partner Account</label>"
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
                "data": "wallet", title: "Wallet Bal."
            },
            {
                "title": "KYC Status",
                "data": null,
                "render": function (data) {
                    let KYCTime = data.KYCTime ? _formatDate(data.KYCTime, "timeshortAMPM") : "";
                    var kycby = data.KYCVerifyBy ? data.KYCVerifyBy : "";
                    let KYCVerifyBy = KYCTime ? "<br>" + KYCTime : "";
                    if (kycby) {
                        KYCVerifyBy += "<br><div style='text-align:center'><i class='fa fa-user' title='Active By' /></div>" + kycby;
                    }
                    var statusActivation = ``;
                    var status = "";
                    if (data.KYCFlag == "active") {
                        status = `<button class="btn btn-sm btn-success">Active</button>`
                        statusActivation = `<li><a tabindex="-1" href="javascript:void(0);" onclick="entityLoking('blocked','` + data.truID + `')">Block account</a></li>
                        <li><a tabindex="-1" tabindex="-1" href="javascript:void(0);" onclick="entityLoking('holder','`+ data.truID + `')">OnHold account</a></li>`;
                    }
                    else if (data.KYCFlag == "pending") {
                        status = `<button class="btn btn-sm btn-warning">Pending</button>`
                    }
                    else if (data.KYCFlag == "holder" || data.KYCFlag == "onhold") {
                        status = `<button class="btn btn-sm btn-warning">OnHold</button>`
                        statusActivation = `<li><a tabindex="-1" href="javascript:void(0);" onclick="entityLoking('active','` + data.truID + `')">Unlock account</a></li>`;
                    }
                    else if (data.KYCFlag == "blocked") {
                        status = `<button class="btn btn-sm btn-danger">Blocked</button>`
                        statusActivation = `<li><a tabindex="-1" href="javascript:void(0);" onclick="entityLoking('active','` + data.truID + `')">Unblock account</a></li>`;
                    }
                    else if (data.KYCFlag == "notactive") {
                        status = `<button class="btn btn-sm btn-success">Not Active</button>`
                        statusActivation = `<li><a tabindex="-1" href="javascript:void(0);" onclick="entityLoking('active','` + data.truID + `')">Activate account</a></li>`;
                    }
                    else {
                        status = `<button class="btn btn-sm btn-success">` + data.KYCFlag + `</button>`
                        statusActivation = `<li><a tabindex="-1" href="javascript:void(0);" onclick="entityLoking('active','` + data.truID + `')">Activate account</a></li>`;
                    }
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
                    var txtActivation = `<div class="btn-group" id="ID` + data.truID + `">` + status + `
                        <button class="btn btn-sm dropdown-toggle" data-toggle="dropdown">
                        <span class="caret"></span>
                        </button>
                        <ul class="dropdown-menu">`+ statusActivation + `</ul></ul></div>`;
                    return txtActivation + aadhaarPanst + '<small>' + KYCVerifyBy + '</small>';
                }
            },
            {
                title: "View",
                "data": null,
                "render": function (data) {
                    return "<a href='/openPartnerDash?id=" + data.truID + "' data-truID=" + data.truID + "  data-enstatus=" + data.KYCFlag + "  title='view " + data.companyName + " details' class='text text-primary fa fa-2x fa-file-text-o'></a>";
                    /*   var viewmenu = "";
                      if (data.KYCFlag == "active") {
                          viewmenu = '<div class="btn-group"><button class="btn btn-info btn-sm dropdown-toggle fa fa-file-text-o" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></button><div class="dropdown-menu dropdown-menu-right"><a class="dropdown-item" href="#" onclick="onactive(this)" data-stat="' + data.KYCFlag + '" data-truID="' + data.truID + '">Deactivate User</a></div></div>'
                      } else if (data.KYCFlag == "pending") {
                          viewmenu = '<div class="btn-group"><button class="btn btn-info btn-sm dropdown-toggle fa fa-file-text-o" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></button><div class="dropdown-menu dropdown-menu-right"><a class="dropdown-item" href="#" onclick="showDlr(this)" data-truID="' + data.truID + '">KYC Verify & Activate</a></div></div>'
                      }
                      else {
                          viewmenu = '<div class="btn-group"><button class="btn btn-info btn-sm dropdown-toggle fa fa-file-text-o" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></button><div class="dropdown-menu dropdown-menu-right"><a class="dropdown-item" href="#" onclick="onactive(this)" data-stat="' + data.KYCFlag + '" data-truID="' + data.truID + '">Activate User</a></div></div>'
                      }
                      return viewmenu; */

                }
            },
            {
                title: "Support ?",
                "data": null,
                "render": function (data) {
                    return "<a href='avascript:;' data-email='" + data.email + "' data-title='" + data.companyName + "' onclick='showCompose(this)' class='text text-primary fa fa-2x fa-envelope'></a>";
                }
            }
        ]
    })
    if (!bool) {
        loaddate();
        bool = true;
    }
    $("#clear-label").addClass("hidden");
    $("#nodeListloader").fadeOut('slow');
}
function showDlr(event) {
    $tid = $(event).attr("data-truID");
    $enstatas = $(event).attr("data-enstatus");
    if ($enstatas == "pending") {
        onSearch($tid)
    }
}
function showCompose(event) {
    let eventemail = $(event).attr("data-email");
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
}
function filterOnSearch(truID) {

    $("#nodeListloader").css("display", "block")
    var inputJson = {};
    if (truID) {
        $("#branchId").val(truID);
        inputJson.to = truID;
    }
    else {
        $("#branchId").val("");
    }
    if (isDate) {
        var start = $('#config-demo').data('daterangepicker').startDate._d;
        var end = $('#config-demo').data('daterangepicker').endDate._d;
        inputJson.startdate = start;
        inputJson.enddate = end;
    }
    txnfilter(inputJson)
}
function checkSuccessF() {
    var receiptno = $('#receiptnosearch').val();
    var inputJson = {};
    if (receiptno) {
        inputJson.salecode = receiptno;
    }
    if (isDate) {
        var start = $('#config-demo').data('daterangepicker').startDate._d;
        var end = $('#config-demo').data('daterangepicker').endDate._d;
        inputJson.startdate = start;
        inputJson.enddate = end;
    }
    txnfilter(inputJson);
}
var getStatement = function (start, end)                 // On Selected Date to bind Account Transaction
{
    isDate = true;
    var inputJson = {};
    inputJson.startdate = start;
    inputJson.enddate = end;
    var pval = $('#byOptions').attr("selectedText")
    if (pval && pval != "all") {
        inputJson.KYCFlag = pval;
    }
    txnfilter(inputJson);
}
function pendingClick() {
    var pval = $('#byOptions').attr("selectedText")
    $("#nodeListloader").css("display", "block")
    var inputJson = {};
    if (pval && pval != "all") {
        inputJson.KYCFlag = pval;
    }

    if (isDate) {
        var start = $('#config-demo').data('daterangepicker').startDate._d;
        var end = $('#config-demo').data('daterangepicker').endDate._d;
        inputJson.startdate = start;
        inputJson.enddate = end;
    }
    txnfilter(inputJson)
}
function PartnerClick() {
    var pval = $('#byOptions').attr("selectedText")
    $("#nodeListloader").css("display", "block")
    var inputJson = {};
    if (pval && pval != "all") {
        inputJson.KYCFlag = pval;
    }
    if (isDate) {
        var start = $('#config-demo').data('daterangepicker').startDate._d;
        var end = $('#config-demo').data('daterangepicker').endDate._d;
        inputJson.startdate = start;
        inputJson.enddate = end;
    }
    txnfilter(inputJson)
}
function SortBy() {
    var pval = $('#byOptions').attr("selectedText")
    var bySort = $('#bySort').attr("selectedText")
    $("#nodeListloader").css("display", "block")
    var inputJson = {};
    if (pval && pval != "all") {
        inputJson.KYCFlag = pval;
    }
    if (bySort && bySort != "all") {
        inputJson.sortBy = bySort;
    }
    if (isDate) {
        var start = $('#config-demo').data('daterangepicker').startDate._d;
        var end = $('#config-demo').data('daterangepicker').endDate._d;
        inputJson.startdate = start;
        inputJson.enddate = end;
    }
    txnfilter(inputJson)
}

var txnfilter = function (inputJson)     /// entity to entity transaction history
{
    loadDataInTable(inputJson);
}

function refreshClick() {
    $("#clear-label").removeClass("hidden");
    isDate = false;
    loaddate();
    $("#branchId").val("");
    $('#byTime').attr("selectedText", "all")
    $("#byTime").text("All Time");
    $("#receiptnosearch").val("");
    $('#filterBy').val("0");
    $("#cmbPartner").select2("val", "0");
    $("#receiptnosearch").addClass("hidden");
    $("#searchOption").attr("disabled", "disabled");
    $('#byOptions').attr("selectedText", "all")
    $('#bySort').attr("selectedText", "desc")
    $("#optionsPartner").attr("selectedText", "all");
    $("#byOptions").text("KYC Status");
    $("#optionsPartner").text("Choose Category");
    $("#bySort").html('Desc <i class="fa fa-calendar" aria-hidden="true"></i>');
    loadDataInTable({});
}
function onclear() {
    $('#byTime').attr("selectedText", "all")
    $("#byTime").text("All Time");
    $('#byOptions').attr("selectedText", "all")
    $('#bySort').attr("selectedText", "desc")
    $("#optionsPartner").attr("selectedText", "all");
    $("#byOptions").text("KYC Status");
    $("#optionsPartner").text("Choose Category");
    $("#bySort").html('Desc <i class="fa fa-calendar" aria-hidden="true"></i>');


    $("#clear-label").removeClass("hidden");
    isDate = false;
    loaddate();
    $("#branchId").val("");
    $("#receiptnosearch").val("");
    $('#filterBy').val("0");
    $("#cmbPartner").select2("val", "0");
    $("#receiptnosearch").addClass("hidden");
    $("#searchOption").attr("disabled", "disabled");
    loadDataInTable({});
}
$(function () {
    $('#filterBy').on('change', function (e) {
        var val = $(this).val();
        $("#searchOption").removeAttr("disabled", "");
        $("#receiptnosearch").val("");
        $(".js-typeahead-country_v1").val("");
        $("#receiptnosearch").removeClass("hidden");
        $(".js-typeahead-country_v1").removeClass("hidden");
        if (val == "0") {
            $("#receiptnosearch").addClass("hidden");
            $("#searchOption").attr("disabled", "disabled");
        }
        else {

            $(".js-typeahead-country_v1").addClass("hidden");
        }
    })
})

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
    $('#filterBy').val("0");
    $("#branchId").val("");
    $("#searchOption").removeAttr("disabled", "disabled");
    $("#receiptnosearch").val("");
    $(".js-typeahead-country_v1").val("");
    $("#receiptnosearch").addClass("hidden");
    $(".js-typeahead-country_v1").removeClass("hidden");
    getStatement(start, end);  // call get account statement
}
function openLimitModal(event) {
    $tid = $(event).attr("data-truID");
    $("#enodeid").val($tid);
    loadAllData($tid);
}
function onactive(event) {
    $tid = $(event).attr("data-truID");
    if ($(event).attr("data-stat") == 'active') {
        Confirm("holder", "Do you want to deactive this Partner ?", $tid);
    }
    else {
        Confirm("active", "Do you want to activate this Partner ?", $tid);
    }
}
$('#cmbPartner').on('change', function (e) {
    var truID = $(this).val();
    filterOnSearch(truID);
})
bindPartners();