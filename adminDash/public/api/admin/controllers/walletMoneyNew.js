// author : Nikhil Bharambe
// date : 15-April-2022
// Description : Wallet History 
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

  var selfentity = $('#byOptions').val();
  var table = $('#wQueue').DataTable({
    "serverSide": true,
    ajax: {
      url: "/eEntity/getConsumerWalletLog",
      type: "POST",
      /*   contentType: "application/json",
        dataType: "json", */
      "data": function (d) {
        return $.extend({}, d, json);
      },
      "complete": function (d) {

        if (selfentity != "self") {
          table.columns([4, 5]).visible(false);
        }
        else {
          table.columns([4, 5]).visible(false);
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
    buttons: [],
    lengthMenu: [
      [10, 25, 50, 100, 500],
      ['10 rows', '25 rows', '50 rows', '100 rows', '500 rows']
    ],
    "columns": [
      {
        title: "Sr.No",
        "data": null,
        render: function (data, type, row, meta) {
          return meta.row + meta.settings._iDisplayStart + 1;
        }
      },
      { "data": "invoice", title: "Txn.ID", },
      {
        title: "Txn By",
        "data": null,
        "render": function (data) {
          return data.name + "\n<br><small>(" + data.truID + ")</small>";
        }
      },
      {
        title: "DateTime",
        "data": null,
        "render": function (data) {
          var date = new Date(Date.parse(data.createDate));
          return FormatDateToString(date, "time");
        }
      },
      {
        "data": null,
        title: "Txn Type",
        "render": function (data) {
          var txnType = "";
          if (data.txnType) {
            if (data.txnType == "buy" || data.txnType == "buyCash") {
              txnType = "Buy";
            } else if (data.txnType == "revenue") {
              txnType = "Revenue";
            }
            else if (data.txnType == "redeemCash") {
              txnType = "Sell";
            }
            else if (data.txnType == "transfer") {
              txnType = "Transfer";
            } else {
              txnType = data.txnType
            }
          }
          var invInvoice = data.againstInvoice ? data.againstInvoice : data.invoice;
          return txnType += "<br>" + "Against Invoice : " + invInvoice;
        }
      },
      {
        title: "Txn Amount",
        "data": null,
        "render": function (buyArr) {
          if (buyArr.totalAmount) {
            var amount = decimalChopper(buyArr.totalAmount, 4);
            return amount
          }
          else {
            return 0
          }

        }
      },
      {
        title: "Type",
        "data": null,
        "render": function (buyArr) {
          if (buyArr.tType) {
            var dec = descType(buyArr.tType);
            return dec.transType;
          }
          else {
            return "-";
          }

        }
      },
      {
        title: "Debit / Credit",
        "data": null,
        "render": function (buyArr) {
          var amount = 0;
          if (buyArr.Cr && buyArr.Cr != "NaN" && buyArr.Cr != "0") {
            amount = '<strong><span class="text-success"><i class="mdi mdi-currency-inr"></i>' + decimalChopper(buyArr.Cr, 4) + '</span></strong>';
            // amountval = decimalChopper(buyArr.Cr, 2);
          }
          else if (buyArr.Dr && buyArr.Dr != "NaN" && buyArr.Dr != "0") {
            var amt = parseFloat(buyArr.Dr);
            if (amt < 0) {
              amt = parseFloat(buyArr.Dr) * -1;
            }
            amount = '<strong><span class="text-danger">- <i class="mdi mdi-currency-inr"></i>' + decimalChopper(amt, 4) + '</span></strong>';
            //  amountval = "-" + decimalChopper(buyArr.Dr, 2);
          }
          return amount
        }
      },
      {
        title: "Txn Status",
        "data": null,
        "render": function (buyArr) {

          var status = ""
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
              else {
                status = "<label class='label label-danger'>Failure</label>";
              }
            } else {
              status = "<label class='label label-danger'>Failure</label>";
            }
          }
          if (buyArr.tType == "addMoney" || buyArr.tType == "addFloat" || buyArr.tType == "walletToBank") {
            var dec = buyArr.desc ? buyArr.desc : descType(buyArr.tType).desc;
            var custName = buyArr.senderName ? '<b>' + buyArr.senderName + "</b><br />" : "";
            var accountNo = buyArr.accountNo ? 'A/C No : <b>' + buyArr.accountNo + "</b><br />" : "";
            if (buyArr.senderAccountNumber) {
              accountNo = buyArr.senderAccountNumber ? 'A/C No : <b>' + buyArr.senderAccountNumber + "</b><br />" : "";
            }
            var bankName = buyArr.bankName ? 'Bank Details : <b>' + buyArr.bankName + "</b><br>" : "";
            var bankTxnID = buyArr.bankTxnID ? 'Txn ID : <b>' + buyArr.bankTxnID + "</b><br>" : "";
            var pgType = buyArr.pgType ? 'PG Type : <b>' + buyArr.pgType + "</b>" : "";
            var paidBy = buyArr.mop ? 'Paid By : <b>' + buyArr.mop + "</b>" : "";
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
            return status + "" + '<small>' + custName + accountNo + bankName + bankTxnID + paidBy + pgType + error_Desc + '</small>' + '<small>' + dec + '</small>';
          }
          else {
            var dec = descType(buyArr.tType);
            return status + "<br />" + dec.desc;
          }
        }
      },
      {
        "data": null,
        "render": function (buyArr) {
          var invInvoice = buyArr.againstInvoice ? buyArr.againstInvoice : buyArr.invoice
          var agn = buyArr.againstInvoice ? "1" : "0";
          var dataLBL = '<a class="edit_btn text text-info fa fa-file-text-o fa-2x" data-invFor="consumer" data-agn="' + agn + '" data-invoice="' + invInvoice + '" data-trastype="' + buyArr.tType + '" data-toSixId="' + buyArr.truID + '" title="view details" onclick="onInvoiceWallet(this);"></a>';
         if ((buyArr.tType == "addMoney" || buyArr.tType == "walletToBank") && selfentity == "self") {
            dataLBL = '<a class="edit_btn text text-info fa fa-file-text-o fa-2x" data-invFor="entity" data-invoice="' + buyArr.invoice + '" data-trastype="' + buyArr.tType + '" data-toSixId="' + buyArr.truID + '" title="view details" onclick="onInvoiceWalletSelf(this);"></a>';
          }
          else if ((buyArr.tType == "addMoney" || buyArr.tType == "walletToBank") && selfentity == "consumer") {
            dataLBL = '<a class="edit_btn text text-info fa fa-file-text-o fa-2x" data-invFor="consumer" data-invoice="' + buyArr.invoice + '" data-trastype="' + buyArr.tType + '" data-toSixId="' + buyArr.truID + '" title="view details" onclick="onInvoiceWallet(this);"></a>';
          }
          else if ((buyArr.tType == "revenue" || buyArr.tType == "tds") && selfentity == "consumer") {
            dataLBL = '-';
          }
          else if ((buyArr.tType == "revenue" || buyArr.tType == "tds") && selfentity == "self") {
            dataLBL = '-';
          }
          else if (buyArr.isConsumer) {
            dataLBL = '<a class="edit_btn text text-info fa fa-file-text-o fa-2x" data-invFor="consumer" data-trastype="' + buyArr.tType + '" data-toSixId="' + buyArr.truID + '" data-invoice="' + buyArr.invoice + '" title="view details" onclick="onInvoiceWallet(this);"></a>';
          }
          if(buyArr.tType=="buy" || buyArr.tType=="redeemCash" || buyArr.tType=="transfer")
          {
            dataLBL = '<a isPeople="consumer" class="edit_btn text text-info fa fa-file-text-o fa-2x" data-toSixId="' + buyArr.truID + '" data-status="' + buyArr.status + '" data-trastype="' + buyArr.tType+ '" data-invoice="' + buyArr.invoice + '" title="view invoice" onclick="onInvoice(this);"></a>'
          }
          var bankStatus = "";
          if (selfentity === "self" && buyArr.tType == "walletToBank") {
            bankStatus = '&nbsp;<a isPeople="entity" title="payout status" class="edit_btn fa fa-bank text text-info" data-toSixId="' + buyArr.truID + '" data-invoice=' + buyArr.invoice + ' onclick="return OpenBankStatus(this);"></a>';
          }
          else if (buyArr.tType == "walletToBank") {
            bankStatus = '&nbsp;<a isPeople="consumer" title="payout status" class="edit_btn fa fa-bank text text-info" data-toSixId="' + buyArr.truID + '" data-invoice=' + buyArr.invoice + ' onclick="return OpenBankStatus(this);"></a>';
          }
          return dataLBL + bankStatus;
        }
      }
    ]
  });
  if (!wbool) {
    loaddate();
    wbool = true;
  }
  $("#loader").css("display", "none");
}
function onInvoiceWallet(item) {
  $invoice = $(item).attr("data-invoice");
  isPeople = $(item).attr("data-invFor");
  $trastype = $(item).attr("data-trastype");
  OnAddMoneyViewC($invoice, $trastype, isPeople);
  $('#myModals').modal();
}
function onInvoiceWalletSelf(item) {
  $invoice = $(item).attr("data-invoice");
  isPeople = $(item).attr("data-invFor");
  $trastype = $(item).attr("data-trastype");
  OnAddMoneyView($invoice, $trastype, isPeople);
  $('#myModals').modal();
}
function descType(tType) {
  var transType = "";
  var desc = "";
  switch (tType) {
    case "addMoney":
      transType = "Add Money";
      desc = "Add money to wallet account";
      break;
    case "reversal":
      transType = "Reversal";
      desc = "Amount reversed from wallet account";
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