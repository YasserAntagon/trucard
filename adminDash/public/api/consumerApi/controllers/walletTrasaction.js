// author : Nikhil Bharambe
// date : 04-FEB-2022

function operations() {
  var wType = $('input[name=wallet]:checked').val();
  var $ctruid = $("#txtcTruid").val();
  if (wType === "wallet") {
    $(".walletOps").removeClass("hidden")
    $(".consumerTrans").addClass("hidden")
  } else {
    $(".walletOps").addClass("hidden")
    $(".consumerTrans").removeClass("hidden")
  }

  if (wType == "wallet") {
    var jsondata = {
      "to": $ctruid
    }
    loadWalletInTable(jsondata);
  }
  else {
    var json = {};
    var $ctruid = $("#txtcTruid").val();
    if ($ctruid) {
      json.to = $ctruid;
    }
    displayTable(json);
  }
}
var wbool = false;
var wDate = false;
function onclear() {
  $("#sortBy").val("0");
  wDate = false;
  loaddate();
  $("#xDropStatus").val("0");
  loadWalletInTable({});
}
function loadWalletInTable(json) { 
  var tableReq = $('#wQueue').DataTable({
    "serverSide": true,
    ajax: {
      url: "/eEntity/getConsumerWalletLog",
      type: "POST", 
      "data": function (d) {
        return $.extend({}, d, json);
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
    ], buttons: [],
    "columns": [
      {
        title: "Sr.No",
        "data": null,
        render: function (data, type, row, meta) {
          return meta.row + meta.settings._iDisplayStart + 1;
        }
      },
      { title: "T. ID", "data": "invoice" },
      {
        title: "Type", "data": "title"
      },
      {
        title: "Txn Date",
        "data": null,
        "render": function (data) {
          var date = new Date(Date.parse(data.createDate));
          return FormatDateToString(date, "time");
        }
      },

      {
        title: "Ref.ID(Receipt No)",
        "data": null,
        "render": function (data) {
          return (parseFloat(data.againstInvoice) > 0) ? data.againstInvoice : " - ";
        }
      },
      {
        title: "Amount", 
        "data": null,
        "render": function (buyArr) {
          var amount = 0;
          if (buyArr.status == "failure" && buyArr.tType == "addMoney") {
            amount = '<strong><span class="text-warning">+<i class="mdi mdi-currency-inr"></i>' + decimalChopper(buyArr.Cr, 2) + '</span></strong>';
          }
          else if (buyArr.status == "failure" && buyArr.tType == "walletToBank") {
            amount = '<strong><span class="text-warning">-<i class="mdi mdi-currency-inr"></i>' + decimalChopper(buyArr.Dr, 2) + '</span></strong>';
          }
          else {
            if (buyArr.Cr && buyArr.Cr != "NaN" && buyArr.Cr != "0") {
              amount = '<strong><span class="text-success">+<i class="mdi mdi-currency-inr"></i>' + decimalChopper(buyArr.Cr, 2) + '</span></strong>';
              // amountval = decimalChopper(buyArr.Cr, 2);
            }
            else if (buyArr.Dr && buyArr.Dr != "NaN" && buyArr.Dr != "0") {
              amount = '<strong><span class="text-danger">-<i class="mdi mdi-currency-inr"></i>' + decimalChopper(buyArr.Dr, 2) + '</span></strong>';
              //  amountval = "-" + decimalChopper(buyArr.Dr, 2);
            }
          }
          return amount
        }
      },
      {
        title: "Txn Details", 
        "data": null,
        "render": function (buyArr) {
          var dec = buyArr.desc ? buyArr.desc : "-";
          if (buyArr.tType == "addMoney" || buyArr.tType == "walletToBank") {
            var custName = buyArr.senderName ? '<b>' + buyArr.senderName + "</b><br />" : "";
            var accountNo = buyArr.accountNo ? 'A/C No : <b>' + buyArr.accountNo + "</b><br />" : "";
            if (buyArr.senderAccountNumber) {
              accountNo = buyArr.senderAccountNumber ? 'A/C No : <b>' + buyArr.senderAccountNumber + "</b><br />" : "";
            }
            var bankName = buyArr.bankName ? 'Bank : <b>' + buyArr.bankName + "</b><br>" : "";
            var bankTxnID = buyArr.bankTxnID ? 'Txn ID : <b>' + buyArr.bankTxnID + "</b><br>" : "";
            var temppayby = buyArr.cardType ? " (" + buyArr.cardType + ")" : "";
           var paidBy = buyArr.mop ? 'Paid By : <b>' + buyArr.mop + temppayby + "</b>" : "";
            var error_Desc = "";
            if (buyArr.error_Desc && buyArr.error_Desc != "null" && buyArr.error_Desc != "SUCCESS") {
              error_Desc = " <small style='display: inline-block;color:red;width:150px'>" + buyArr.error_Desc + "</small>";
            }
            if (buyArr.messageType) {
              paidBy += " ( " + buyArr.messageType + " )<br>"
            }
            else {
              paidBy += "<br>"
            }
            var fdesc = (buyArr.tType == "walletToBank" && buyArr.status !== "success") ? "" : dec.desc ? dec.desc : (buyArr.tType == "addMoney" && buyArr.status == "failure") ? "" : dec;
            return '<small>' + custName + accountNo + bankName + bankTxnID + paidBy + error_Desc + '</small><br>' + '<span><strong>' + fdesc + '</strong></span>';
          }
          else {
            return dec;
          }
        }
      },
      {
        title: "Status", 
        "data": null,
        "render": function (buyArr) {
          var dataLBL="";
          if (buyArr.status == "success") {
            dataLBL = '<span class="text-success"><strong>Success</strong></span>';
          }
          else if (buyArr.status == "inprocess") {
            dataLBL = '<span class="text-warning"><strong>Inprocess</strong></span>';
          }
          else if (buyArr.status) {
            dataLBL = '<span class="text-danger"><strong>' + buyArr.status.charAt(0).toUpperCase() + buyArr.status.slice(1) + '</strong></span>';
          }
          else {
            dataLBL = "-";
          }
          return dataLBL;
        }
      }]
  }); 
  if (!wbool) {
    loaddate();
    wbool = true;
  }
  $("#loader").css("display", "none");
}

function descType(tType) {
  var transType = "";
  var desc = "";
  switch (tType) {
    case "addMoney":
      transType = "Add Money";
      desc = "Add money to wallet account";
      break;
    case "buy":
      transType = "Buy";
      desc = "Amount debited from wallet";
      break;
    case "buyCash":
      transType = "Buy";
      desc = "Amount debited from wallet";
      break;
    case "transfer":
      transType = "Transfer";
      desc = "Amount debited from wallet";
      break;
    case "walletToBank":
      transType = "Wallet To Bank";
      desc = "Wallet amount transferred to bank account";
      break;
    case "revenue":
      transType = "Revenue";
      desc = "Revenue credited to wallet";
      break;
    case "redeemCash":
      transType = "Sell";
      desc = "Amount credited to wallet";
      break;
    default:
      transType = tType;
      desc = "";
  }
  return {
    transType,
    desc
  }
} 