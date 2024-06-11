// author : Nikhil Bharambe
// date : 15-April-2022
// Description : Wallet History 
var bool = false;
var isDate = false;
const rtruid = $("#txteTruid").val()
function onclear() {
  $("#sortBy").val("0");
  isDate = false;
  loaddate();
  $("#xDropStatus").val("0");
  loadDataInTable({});
}
function loadDataInTable(json) {
  json.rTruID = rtruid;
  var tableReq = $('#rQueue').DataTable({
    "serverSide": true,
    ajax: {
      url: "/walletSummaryWF/bindWalletSummaryWF",
      type: "POST",
      /*   contentType: "application/json",
        dataType: "json", */
      "data": function (d) {
        return $.extend({}, d, json);
      },
      "complete": function (data) {
        if (data.responseJSON) {
          $("#walletbalance").text(decimalChopper(parseFloat(data.responseJSON.balance), 4));
        }
      }
    },
    "bDestroy": true,
    "processing": true,
    "language": { processing: '<i class="fa fa-spinner fa-spin fa-3x fa-fw text text-info"></i><span class="sr-only">Loading...</span> ' },

    "ordering": false,
    "searching": false,
    "serverMethod": 'POST',
    "info": true,
    "bLengthChange": true,
    "dom": 'Blfrtip',
    lengthMenu: [
      [10, 25, 50, 100, 500],
      ['10 rows', '25 rows', '50 rows', '100 rows', '500 rows']
    ],
    buttons: [{
      text: 'Download CSV <i class="fa fa-spinner fa-spin hidden" />',
      action: (e, dt) => {
        var rowCount = tableReq.page.info().recordsTotal;
        // This is used to send to the backend, where a
        // cookie will be created. We will later check that
        // cookie against this. When it exists, that means
        // our download is complete (pretty hacky)
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
        var inputval = $('#xDropStatus').val();
        var sortBy = $('#sortBy').val();
        if (inputval && inputval != "0") {
          indata.type = inputval;
        }
        if (sortBy != "0") {
          indata.sortBy = sortBy;
        }
        indata.rTruID = rtruid;
        if (isDate) {
          var start = $('#config-demo').data('daterangepicker').startDate._d;
          var end = $('#config-demo').data('daterangepicker').endDate._d;
          indata.startdate = start;
          indata.enddate = end;
        }
        nonAjaxPost('/walletSummaryWF/excel-download', indata);
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
      },
    }

    ],
    "columns": [
      {
        title: "Sr.No",
        "data": null,
        render: function (data, type, row, meta) {
          return meta.row + meta.settings._iDisplayStart + 1;
        }
      },
      { "data": "invoice" },
      {
        "data": null,
        "render": function (data) {
          var date = new Date(Date.parse(data.createDate));
          return FormatDateToString(date, "time");
        }
      },

      {
        "data": null,
        "render": function (data) {
          var txnType = "-";
          if (data.txnType == "buy" || data.txnType == "buyCash") {
            txnType = "Buy";
          }
          else if (data.txnType == "revenue") {
            txnType = "Revenue";
          }
          else if (data.txnType == "redeemCash") {
            txnType = "Sell";
          }
          else if (data.txnType == "transfer") {
            txnType = "Transfer";
          }
          else {
            txnType = data.txnType
          }
          var invInvoice = data.againstInvoice ? data.againstInvoice : data.invoice;
          return txnType += "<br>" + "Against Invoice : " + invInvoice;
        }
      },
      {
        "data": null,
        "render": function (buyArr) {
          /*  var amount = 0;
           if (buyArr.totalAmount && buyArr.totalAmount != 0) {
             amount = decimalChopper(buyArr.totalAmount, 4);
             
             return  '<strong><span class="text-success">+<i class="mdi mdi-currency-inr"></i>' + amount + '</span></strong>';
           }
           else { */
          var amount = 0;
          if (buyArr.Cr && buyArr.Cr != "NaN" && buyArr.Cr != "0") {
            if (buyArr.status == "failure") {
              amount = '<strong><span class="text-danger"> + <i class="mdi mdi-currency-inr"></i>' + decimalChopper(buyArr.Cr, 4) + '</span></strong>';
            }
            else {
              amount = '<strong><span class="text-success"> + <i class="mdi mdi-currency-inr"></i>' + decimalChopper(buyArr.Cr, 4) + '</span></strong>';
            }

            // amountval = decimalChopper(buyArr.Cr, 2);
          }
          else if (buyArr.Dr && buyArr.Dr != "NaN" && buyArr.Dr != "0") {
            var amt = parseFloat(buyArr.Dr);
            if (amt < 0) {
              amt = parseFloat(buyArr.Dr) * -1;
            }
            amount = '<strong><span class="text-danger">-<i class="mdi mdi-currency-inr"></i>' + decimalChopper(amt, 4) + '</span></strong>';
            //  amountval = "-" + decimalChopper(buyArr.Dr, 2);
          }
          return amount
        }

        /* } */
      },
      {
        "data": 'title'
      },
      {
        "data": null,
        "render": function (buyArr) {
          var amount = 0;
          if (buyArr.Cr && buyArr.Cr != "NaN" && buyArr.Cr != "0") {
            amount = '<strong><span class="text-success"> + <i class="mdi mdi-currency-inr"></i>' + decimalChopper(buyArr.Cr, 4) + '</span></strong>';
          }
          else if (buyArr.Dr && buyArr.Dr != "NaN" && buyArr.Dr != "0") {
            var amt = parseFloat(buyArr.Dr);
            if (amt < 0) {
              amt = parseFloat(buyArr.Dr) * -1;
            }
            amount = '<strong><span class="text-danger">-<i class="mdi mdi-currency-inr"></i>' + decimalChopper(amt, 4) + '</span></strong>';
          }
          else {
            var amt = buyArr.Dr && parseFloat(buyArr.Dr) > 0 ? decimalChopper(buyArr.Dr, 4) : decimalChopper(buyArr.Cr, 4);
            amount = '<strong><span class="text-danger">-<i class="mdi mdi-currency-inr"></i>' + decimalChopper(amt, 4) + '</span></strong>';
          }
          return amount;
        }
      },
      {
        "data": null,
        "render": function (buyArr) {
          var status = "";
          var dec = buyArr.desc ? buyArr.desc : "-";
          if (buyArr.tType == "tds" || buyArr.tType == "revenue" ) {
            status = "<label class='label label-success'>Success</label>"
          }
          else {
            if (buyArr.status) {
              if (buyArr.status == "success") {
                status = "<label class='label label-success'>Success</label>"
              }
              else if (buyArr.status == "reversal") {
                status = "<label class='label label-warning'>Reversal</label>"
              }
              else if (buyArr.status == "refund") {
                status = "<label class='label label-warning'>Refund</label>"
              }
              else if (buyArr.tType == "addMoney" && buyArr.moneyAdded) {
                status = "<label class='label label-success'>Success</label>"
              }
              else {
                status = "<label class='label label-danger'>Failure</label>";
              }
            } else {
              if (buyArr.tType == "addMoney" && !buyArr.moneyAdded) {
                status = "<label class='label label-danger'>Failure</label>";
              }
              else {
                status = "<label class='label label-success'>Success</label>";
              }

            }
          }

          if (buyArr.tType == "addMoney" || buyArr.tType == "walletToBank") {
            var custName = buyArr.senderName ? '<b>' + buyArr.senderName + "</b><br />" : "";
            var accountNo = buyArr.accountNo ? 'A/C No : <b>' + buyArr.accountNo + "</b><br />" : "";
            if (buyArr.senderAccountNumber) {
              accountNo = buyArr.senderAccountNumber ? 'A/C No : <b>' + buyArr.senderAccountNumber + "</b><br />" : "";
            }
            var bankName = buyArr.bankName ? 'Bank Details : <b>' + buyArr.bankName + "</b><br>" : "";
            var bankTxnID = buyArr.bankTxnID ? 'Txn ID : <b>' + buyArr.bankTxnID + "</b><br>" : "";
            var temppayby = buyArr.cardType ? " (" + buyArr.cardType + ")" : "";
            /*  var pgType = buyArr.pgType ? 'PG Type : <b>' + buyArr.pgType + "</b>" : ""; */
            // var payby = (buyArr.mop == "NB") ? "Net Banking" : (buyArr.mop == "CC") ? "Credit Card" : (buyArr.mop == "DC") ? "Debit Card" :""
            var paidBy = buyArr.mop ? 'Paid By : <b>' + buyArr.mop + temppayby + "</b>" : "";
            var error_Desc = "";
            if (buyArr.error_Desc && buyArr.error_Desc != "null" && buyArr.error_Desc != "SUCCESS") {
              error_Desc = " <small style='display: inline-block;color:red;width:150px'>" + buyArr.error_Desc + "</small>";
            }
            if (buyArr.messageType) {
              paidBy += " ( " + buyArr.messageType + " )<br>"
            }
            else {
              paidBy += ""
            }
            var fdesc = (buyArr.tType == "walletToBank" && buyArr.status !== "success") ? "" : dec.desc ? dec.desc : (buyArr.tType == "addMoney" && buyArr.status == "failure") ? "" : dec;
            return status + "<br>" + '<small>' + custName + accountNo + bankName + bankTxnID + paidBy + error_Desc + '</small><br>' + '<span><strong>' + fdesc + '</strong></span>';
          }
          else {
            return status + "<br>" + dec;
          }
        }
      },
      {
        "data": null,
        "render": function (buyArr) {
          var invInvoice = buyArr.againstInvoice ? buyArr.againstInvoice : buyArr.invoice
          var agn = buyArr.againstInvoice ? "1" : "0";
          var dataLBL = '<a class="edit_btn text text-info fa fa-file-text-o fa-2x" data-invFor="entity" data-agn="' + agn + '" data-invoice="' + invInvoice + '" data-trastype="' + buyArr.tType + '" data-toSixId="' + buyArr.truID + '" title="view details" onclick="onInvoiceSelf(this);"></a>';
          var bankStatus = '';
       if ((buyArr.tType == "addMoney" || buyArr.tType == "walletToBank")) {
            dataLBL = '<a class="edit_btn text text-info fa fa-file-text-o fa-2x" data-invFor="entity" data-invoice="' + buyArr.invoice + '" data-trastype="' + buyArr.tType + '" data-toSixId="' + buyArr.truID + '" title="view details" onclick="onInvoiceWalletSelf(this);"></a>';
          /*   if (buyArr.tType == "addMoney") {
              bankStatus = '&nbsp;<a isPeople="entity" title="payout status" class="edit_btn fa fa-bank text text-info" data-toSixId="' + buyArr.truID + '" data-invoice=' + buyArr.invoice + ' onclick="return OpenBankStatus(this);"></a>';
            } */
          }
          else if ((buyArr.tType == "revenue" || buyArr.tType == "tds")) {
            dataLBL = '-';
          }
          return dataLBL + bankStatus;
        }
      }
    ]
  });
  if (!bool) {
    loaddate();
    bool = true;
  }
  $("#walletloader").fadeOut("slow");
}

$(document).ready(function () {
  $("#txtinp").focus();
  loadDataInTable({});
  
});
$('#config-demo').on('cancel.daterangepicker', function (ev, picker) {
  isDate = false;
  loaddate();
  loadDataInTable({});
});
const days = (date_1, date_2) => {
  let difference = date_1.getTime() - date_2.getTime();
  let TotalDays = Math.ceil(difference / (1000 * 3600 * 24));
  return TotalDays;
}
var myCallback = function (start, end) {

  $('#config-demo .form-control').html(start.format('MMM DD, YYYY') + '-' + end.format('MMM DD, YYYY'));
  var inputval = $('#xDropStatus').val();
  var inputJson = {};
  var sortBy = $('#sortBy').val();
  if (inputval && inputval != "0") {
    inputJson.type = inputval;
  }
  if (sortBy != "0") {
    inputJson.sortBy = sortBy;
  }
  var start = $('#config-demo').data('daterangepicker').startDate._d;
  var end = $('#config-demo').data('daterangepicker').endDate._d;
  if (days(end, start) > 31) {
    alertify.error("Date range can not be more than 31 days..!!");
    return false;
  }
  isDate = true;
  inputJson.startdate = start;
  inputJson.enddate = end;
  loadDataInTable(inputJson);
}

function onInvoiceWallet(item) {
  $invoice = $(item).attr("data-invoice");
  isPeople = $(item).attr("data-invFor");
  $trastype = $(item).attr("data-trastype");
  $('.target-payment').empty();
  OnAddMoneyViewC($invoice, $trastype, isPeople);
  $('#myModals').appendTo("body").modal('show');
}
function onInvoiceWalletSelf(item) {
  $invoice = $(item).attr("data-invoice");
  isPeople = $(item).attr("data-invFor");
  $trastype = $(item).attr("data-trastype");
  $('.target-payment').empty();
  OnAddMoneyView($invoice, $trastype, isPeople);
  $('#myModals').appendTo("body").modal('show');
}

function onInvoiceSelf(item) {
  var invoice = $(item).attr("data-invoice");
  var agn = $(item).attr("data-agn");

  var json = {
    "invoice": invoice,
    "isPartner": agn == "1" ? true : false
  }
  $.ajax({
    "url": "/summaryExc/getGSTAllTrans", "method": "POST", data: json, success: function (datares) {
      var json = JSON.parse(datares)
      console.log(json)
      if (json && json.data.length > 0) {
        OnPreviewInvoice(json.data[0], "entity");
      } else {
        alertify.error('No record found..!!');
      }
    }
  })
}

$(function () {
  $('#xDropStatus').on('change', function (e) {
    var inputval = $(this).val();
    var inputJson = {};
    var sortBy = $('#sortBy').val();
    if (inputval && inputval != "0") {
      inputJson.type = inputval;
    }
    if (sortBy != "0") {
      inputJson.sortBy = sortBy;
    }
    if (isDate) {
      var start = $('#config-demo').data('daterangepicker').startDate._d;
      var end = $('#config-demo').data('daterangepicker').endDate._d;
      inputJson.startdate = start;
      inputJson.enddate = end;
    }
    loadDataInTable(inputJson);
  })
  $('#sortBy').on('change', function (e) {
    var val = $(this).val();
    var inputval = $('#xDropStatus').val();
    var inputJson = {};
    if (inputval && inputval != "0") {
      inputJson.type = inputval;
    }
    if (val) {
      inputJson.sortBy = val;
    }
    if (isDate) {
      var start = $('#config-demo').data('daterangepicker').startDate._d;
      var end = $('#config-demo').data('daterangepicker').endDate._d;
      inputJson.startdate = start;
      inputJson.enddate = end;
    }
    loadDataInTable(inputJson);
  })
})
setTimeout(function () {
  BindDWalletdata();
}, 500)


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
  $('#config-demo').daterangepicker(options, function (start, end, label) { 
    myCallback(start1, start1);
  });
  
  $('#config-demo1').daterangepicker(options, function (start, end, label) {
    var start1 = $('#config-demo1').data('daterangepicker').startDate._d;
    var end1 = $('#config-demo1').data('daterangepicker').endDate._d;
    callWalletTxn(start1, end1)
  });

  var startDate = moment().subtract(30, 'days');
  var endDate = moment();
  $('#config-demo .form-control').html(startDate.format('MMM DD, YYYY') + '-' + endDate.format('MMM DD, YYYY'));
  $('#config-demo1 .form-control').html(endDate.format('MMM DD, YYYY') + '-' + endDate.format('MMM DD, YYYY'));

  var start = $('#config-demo1').data('daterangepicker').startDate._d;
  var end = $('#config-demo1').data('daterangepicker').endDate._d;
  callWalletTxn(start, end)

};
function callWalletTxn(start, end) {
  var jsondata = { 
    rTruID: rtruid,
    startdate: start,
    enddate: end
  }
  $(".spinnerRev").removeClass("hidden")
  $(".spinnerVal").addClass("hidden")
  $.ajax({
    "url": "/entityWallet/getWalletBreakup", "method": "POST", "data": jsondata, success: function (res) {
      $("#loader").fadeOut('slow');
      let data = res.body;
      if (data.status == 200) {
        var resource = data.resource;
        $("#fBuy").html(decimalChopper(resource.Buy, 4));       
        $(".txnBalance").html(decimalChopper(resource.walletBal, 4));
        $("#fsell").html(decimalChopper(resource.sell, 4));
        $("#fwalletAddedOn").html(decimalChopper(resource.walletAddedOn, 4));
        $("#fwalletClosing").html(decimalChopper(resource.walletClosing, 4));
        $("#fwalletOpening").html(decimalChopper(resource.walletOpening, 4));
        $("#fwalletAdded").html(decimalChopper(resource.walletAdded, 4));
        $("#fstatus").html(resource.status); 
        $("#ftransfer").html(decimalChopper(resource.transfer, 4));
        $("#totalRevenue").html(decimalChopper(resource.revenue, 4));
        
        $(".spinnerRev").addClass("hidden")
        $(".spinnerVal").removeClass("hidden")
      }
      else if (data.status == 411) {
        $("#fBuy").html("0");
        $("#fwalletAdded").html("0");
        $("#fwalletAddedOn").html("0");
        $("#fwalletClosing").html("0");
        $("#totalRevenue").html("0");
        $("#fwalletOpening").html("0");
        $("#fsell").html("0");
        $("#fstatus").html("-");
        $("#ftransfer").html("0");
        alertify.error("Something Went Wrong..!!");
        return false;
      }
      else {
        $("#loader").fadeOut('slow');
      }
    }
  });
}