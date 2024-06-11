/*!
 File: Error Log List
 Edited : Nikhil Bharambe
 Dated : 23-07-2020
 Description : Consumer Errror Log List
 */
var reqQueuetable;
var reqBankQueuetable;
var reqAtomQueuetable;
//getAtompayment
function bindsummary(json) {
  var reqQueue = new Array();
  $('#loader').css("display", 'block');
  $('.pList').addClass("hidden");
  $('.wList').removeClass("hidden");
  $('.bankList').addClass("hidden");
  var paylist = $('#paylist').val();
  $.ajax({"url": "/Charges/getWalletpayment", "method": "POST", data: json, success: function (a) {
      $('#loader').fadeOut('slow');
      let res = a.body;
      if (res && res.status == "200") {
        $('#loader').css("display", 'block');
        let buyArr = a.body.resource;
        for (var i = 0; i < buyArr.length; i++) {
          var cdt = _formatDate(buyArr[i].createDate, "time");
          let month = getSortOrder(buyArr[i].createDate, "yyyymmdd");
          let amount = parseFloat(buyArr[i].Dr) == 0 ? parseFloat(buyArr[i].Cr) : parseFloat(buyArr[i].Dr)
          if (buyArr[i].moneyAdded) {
            if (buyArr[i].tType == "redeemCash" || buyArr[i].tType == "addMoney" || buyArr[i].tType == "revenue") {
              amount = parseFloat(buyArr[i].Cr)
            } else {
              amount = parseFloat(buyArr[i].Dr)
            }
          }
          let type = buyArr[i].tType == "redeemCash" ? "Sell" : buyArr[i].tType == "buy" ? "Buy" :buyArr[i].tType == "walletToBank" ? "Wallet To Bank" :buyArr[i].tType == "transfer" ? "Transfer" : buyArr[i].tType == "buyCash" ? "Buy" : buyArr[i].tType == "addMoney" ? "Add Money" : buyArr[i].tType
          var perti = '<td><a style="color:white" class="btn btn-primary edit_btn btn-sm fa fa-file-text-o" data-invoice=' + buyArr[i].invoice + ' data-type=' + buyArr[i].tType + ' data-truid=' + buyArr[i].truID + ' onclick="return OpenInvoice(this);"></a></td>'
          if (buyArr[i].tType == "walletToBank") {
            perti = "-";
          }
          else if (buyArr[i].tType == "addMoney" || buyArr[i].tType == "revenue" ) {
            perti = "-";
          }
          var rqueue =
          {
            "transType": buyArr[i].tType,
            "truID": buyArr[i].truID,
            "name": paylist == "consumer" ? buyArr[i].fName + " " + buyArr[i].lName : paylist == "entity" ? buyArr[i].companyName : paylist == "assetmanager" ? buyArr[i].assetmanagerName : "-",
            "amount": "<i class='fa fa-rupee'></i> " + decimalChopper(amount, 2),
            "invoice": buyArr[i].invoice,
            "tType": type,
            'createDate': '<span style="display:none">' + month + '</span>' + cdt,
            "particulars": perti
          }
          reqQueue.push(rqueue);
        }
        $('#loader').fadeOut('slow');
      }
      if ($.fn.dataTable.isDataTable('#payLogList')) {
        reqQueuetable.clear();
        reqQueuetable.rows.add(reqQueue);
        reqQueuetable.draw();
      } else {
        reqQueuetable = $('#payLogList').DataTable({
          'paging': true,
          'searching': true,
          'ordering': true,
          'info': true,
          "scrollX": true,
          "order": [
            [2, "desc"]
          ],
          buttons: [
            {
              extend: 'excel',
              filename: 'payment_',
              exportOptions: {
                columns: [0, 1, 2, 3, 4]
              }
            },
            {
              extend: 'pdf',
              filename: 'payment_',
              title: 'Error Log',
              exportOptions: {
                columns: [0, 1, 2, 3, 4]
              }
            }],
          "pageLength": 20,
          data: reqQueue, // PASS ARRAY TO HERE
          lengthChange: false,
          "columns": [
            {
              "data": null,
              "render": function (data) {
                return data.name + '<br>\n<small>(' + data.truID + ')</small>'
              }
            },
            {
              "data": "invoice"
            },
            {
              "data": "createDate"
            },
            {
              "data": "tType"
            },
            {
              "data": "amount"
            },
            {
              // "data": "particulars"
              "data": null,
              "render": function (data) {
                  return data.particulars;
              }
            },
          ]
        });
        reqQueuetable.buttons().container()
          .appendTo('#payLogList .col-sm-12:eq(0)');
        $('.dt-buttons').addClass("btn-group-sm")
      }
    }
  });
}
function bindAtomsummary(json) {
  var reqQueue = new Array();
  $('#loader').css("display", 'block');
  $('.wList').addClass("hidden");
  $('.pList').removeClass("hidden");
  $('.bankList').addClass("hidden");
  var paylist = $('#paylist').val();
  $.ajax({
    "url": "/Charges/getAtompayment", "method": "POST", data: json, success: function (a) {
      $('#loader').fadeOut('slow');
      let res = a.body;
      if (res && res.status == "200") {
        $('#loader').css("display", 'block');
        let buyArr = a.body.resource;

        for (var i = 0; i < buyArr.length; i++) {
          let month = getSortOrder(buyArr[i].createDate, "yyyymmdd");
          let type = buyArr[i].tType == "redeemCash" || buyArr[i].tType == "consumerRedeemCash" ? "Sell" :
            buyArr[i].tType == "buy" || buyArr[i].tType == "consumerBuy" ? "Buy by Bullion" :
                buyArr[i].tType == "walletToBank" ? "Wallet To Bank" :
                    buyArr[i].tType == "transfer" || buyArr[i].tType == "consumerTransfer" ? "Transfer" :
                      buyArr[i].tType == "buyCash" || buyArr[i].tType == "consumerBuyCash" ? "Buy by Cash" :
                        buyArr[i].tType == "addMoney" ? "Add Money"  : buyArr[i].tType
          let status = buyArr[i].status == "Ok" ? "<label class='label label-success'>Success</label>" : "<label class='label label-danger'>Failed</label>"
          let failureReason = buyArr[i].status != "Ok" ? buyArr[i].failureReason : ""
          var rqueue =
          {
            "transType": buyArr[i].tType,
            "truID": paylist == "consumer" ? buyArr[i].customerTruID : paylist == "assetmanager" ? buyArr[i].assetmanagerTruID : paylist == "entity" ? buyArr[i].entityTruID : "-",
            "name": paylist == "consumer" ? buyArr[i].fName + " " + buyArr[i].lName : paylist == "entity" ? buyArr[i].companyName : paylist == "assetmanager" ? buyArr[i].assetmanagerName : "-",
            "amount": "<i class='fa fa-rupee'></i> " + decimalChopper(buyArr[i].amount, 2),
            "invoice": buyArr[i].invoice ? buyArr[i].invoice : "-",
            "tType": type,
            "bankName": buyArr[i].bankName,
            "bankTxnID": buyArr[i].bankTxnID,
            "status": status + '<p>' + failureReason + '</p>',
            "MOP": buyArr[i].MOP ? buyArr[i].MOP : "-",
            'atomDate': '<span style="display:none">' + month + '</span>' + buyArr[i].atomDate,
            "particulars": buyArr[i].invoice ? '<td><a style="color:white" class="btn btn-primary edit_btn btn-sm fa fa-file-text-o" data-invoice=' + buyArr[i].invoice + ' data-type=' + buyArr[i].tType + ' data-truid=' + buyArr[i].truID + ' onclick="return OpenInvoice(this);"></a></td>' : "-"
          }
          reqQueue.push(rqueue);
        }

        $('#loader').fadeOut('slow');
      }
      if ($.fn.dataTable.isDataTable('#payAtomList')) {
        reqAtomQueuetable.clear();
        reqAtomQueuetable.rows.add(reqQueue);
        reqAtomQueuetable.draw();
      } else {
        reqAtomQueuetable = $('#payAtomList').DataTable({
          'paging': true,
          'searching': true,
          'ordering': true,
          'info': true,
          "scrollX": true,
          "order": [
            [2, "desc"]
          ],
          buttons: [
            {
              extend: 'excel',
              filename: 'payment_',
              exportOptions: {
                columns: [0, 1, 2, 3, 4]
              }
            },
            {
              extend: 'pdf',
              filename: 'payment_',
              title: 'Error Log',
              exportOptions: {
                columns: [0, 1, 2, 3, 4]
              }
            }],
          "pageLength": 20,
          data: reqQueue, // PASS ARRAY TO HERE
          lengthChange: false,
          "columns": [
            {
              "data": null,
              "render": function (data) {
                return data.name + '<br>\n<small>(' + data.truID + ')</small>'
              }
            },
            // {
            //   "data": "truID"
            // }, 
            {
              "data": "invoice"
            },
            {
              "data": "atomDate"
            },
            {
              "data": "tType"
            },
            {
              "data": "amount"
            },
            {
              "data": "bankName"
            },
            {
              "data": "bankTxnID"
            },
            {
              "data": "status"
            },
            {
              "data": "MOP"
            },
            {
              // "data": "particulars"
              "data": null,
              "render": function (data) {
                if (data.transType == 'addMoney') {

                  return " - ";
                }
                else {
                  return data.particulars;

                }
              }
            }
          ]
        });
        reqAtomQueuetable.buttons().container()
          .appendTo('#payAtomList .col-sm-12:eq(0)');
        $('.dt-buttons').addClass("btn-group-sm")
      }
    }
  });
}
function changeContent(invoice, failureReason) {
  let content = "<label class='label label-info'>Refund</label><p>" + failureReason + "</p>";
  $("#a" + invoice).html(content)
}
function typeOfNaN(x) {
  if (isNaN(x)) {
    return 0;
  }
  else {
    return x;
  }
}

function bindBankSummary(json) {
  var reqQueue = new Array();
  $('#loader').css("display", 'block');
  $('.wList').addClass("hidden");
  $('.pList').addClass("hidden");
  $('.bankList').removeClass("hidden");
  var paylist = $('#paylist').val();
  $.ajax({
    "url": "/Charges/getBankpayment", "method": "POST", data: json, success: function (a) {
      $('#loader').fadeOut('slow');
      let res = a.body;
      if (res && res.status == "200") {
        $('#loader').css("display", 'block');
        let buyArr = a.body.resource;
        for (var i = 0; i < buyArr.length; i++) {
          var cdt = _formatDate(buyArr[i].createDate, "time");
          let month = getSortOrder(buyArr[i].createDate, "yyyymmdd");
          let particulars = '<a style="color:white" class="btn btn-danger edit_btn btn-sm">Failure</a>'
          if (buyArr[i].status == "Success") {
            particulars = '<a style="color:white" class="btn btn-success edit_btn btn-sm">Success</a>'
          }
          else if (buyArr[i].status == "pending") {
            particulars = '<a style="color:white" class="btn btn-info edit_btn btn-sm">Pending</a>'
          }
          else if (buyArr[i].status == "Initiated") {
            particulars = '<a style="color:white" class="btn btn-warning edit_btn btn-sm">Initiated</a>'
          }
          else if (buyArr[i].status == "In Progress") {
            particulars = '<a style="color:white" class="btn btn-warning edit_btn btn-sm">In Progress</a>'
          }
          else if (buyArr[i].status == "ON HOLD") {
            particulars = '<a style="color:white" class="btn btn-warning edit_btn btn-sm">On Hold</a>'
          }
          var type = buyArr[i].tType == "redeemCash" ? "Sell" : buyArr[i].tType == "walletToBank" ? "Wallet To Bank" : buyArr[i].tType;
          var perti = '<a style="color:white" class="btn btn-primary edit_btn btn-sm fa fa-file-text-o" data-invoice=' + buyArr[i].invoice + ' data-type=' + buyArr[i].tType + ' data-truid=' + buyArr[i].truID + ' onclick="return OpenInvoice(this);"></a>';
          if (buyArr[i].tType == "walletToBank") {
            perti = "no preview";
          }
          var bankStatus = "";
          if (buyArr[i].status != "pending" && buyArr[i].RefNo) {
            bankStatus = '<a class="edit_btn fa fa-file-text-o text text-info" data-bankName=' + buyArr[i].bankName + ' data-accno=' + buyArr[i].ben_Acct_No + ' data-mop=' + buyArr[i].mode_of_Pay + ' data-tranID=' + buyArr[i].tranID + ' data-RefNo=' + buyArr[i].RefNo + ' onclick="return OpenBankStatus(this);"> Check Bank Txn</a>';
          }
          var error_Desc = "";
          if (buyArr[i].status == "Failure") {
            error_Desc = "<small style='display: inline-block;color:red;width:150px'>" + buyArr[i].error_Desc + "</small>";
          }
          var acc = '<p>Account No : ' + buyArr[i].ben_Acct_No + ' </br> Bank Name : ' + buyArr[i].bankName + '</br> MOP : ' + buyArr[i].mode_of_Pay + '<br /> ' + bankStatus + '' + error_Desc + '</p>'
          
          var rqueue =
          {
            "transType": type,
            "truID": buyArr[i].truID,
            "mop": buyArr[i].mode_of_Pay,
            "bankName": buyArr[i].bankName,
            "tranID": buyArr[i].tranID,
            "RefNo": buyArr[i].RefNo,
            "charges": buyArr[i].charges,
            "status": particulars,
            "accountno": acc,
            "name": paylist == "consumer" ? buyArr[i].fName + " " + buyArr[i].lName : paylist == "entity" ? buyArr[i].companyName : paylist == "assetmanager" ? buyArr[i].assetmanagerName : "-",
            "amount": "<i class='fa fa-rupee'></i> " + decimalChopper(parseFloat(buyArr[i].amount), 2),
            "invoice": buyArr[i].invoice,
            "tType": type,
            'createDate': '<span style="display:none">' + month + '</span>' + cdt,
            "particulars": perti
          }
          reqQueue.push(rqueue);
        }
        $('#loader').fadeOut('slow');
      }
      if ($.fn.dataTable.isDataTable('#paybankList')) {
        reqBankQueuetable.clear();
        reqBankQueuetable.rows.add(reqQueue);
        reqBankQueuetable.draw();
      } else {
        reqBankQueuetable = $('#paybankList').DataTable({
          'paging': true,
          'searching': true,
          'ordering': true,
          'info': true,
          "scrollX": true,
          "order": [
            [2, "desc"]
          ],
          buttons: [
            {
              extend: 'excel',
              filename: 'payment_',
              exportOptions: {
                columns: [0, 1, 2, 3, 4]
              }
            },
            {
              extend: 'pdf',
              filename: 'payment_',
              title: 'Error Log',
              exportOptions: {
                columns: [0, 1, 2, 3, 4]
              }
            }],
          "pageLength": 20,
          data: reqQueue, // PASS ARRAY TO HERE
          lengthChange: false,
          "columns": [
            {
              "data": null,
              "render": function (data) {
                return data.name + '<br>\n<small>(' + data.truID + ')</small>'
              }
            },
            // {
            //   "data": "truID"
            // },
            {
              "data": "invoice"
            },
            {
              "data": "createDate"
            },
            {
              "data": "tType"
            },
            {
              "data": "amount"
            },
            {
              "data": "accountno"
            },
            {
              "data": "status"
            },
            {
              "data": null,
              "render": function (data) {
                return data.particulars;
              }
            }
          ]
        });
        reqBankQueuetable.buttons().container()
          .appendTo('#paybankList .col-sm-12:eq(0)');
        $('.dt-buttons').addClass("btn-group-sm")
      }
    }
  });
}

function getStatement(start, end, flag, paylist) 
{
  if (flag == "truWallet") {
    let json = {
      "reqFlag": paylist,
      "flag": "datewise",
      "startDate": start,
      "endDate": end
    }
    bindsummary(json);
  }
  else if (flag === "atom") {
    let json = {
      "reqFlag": paylist,
      "flag": "datewise",
      "startDate": start,
      "endDate": end
    }
    bindAtomsummary(json);
  }
  resetTimer()
}

$(function () {
  $('.radio-group label').on('click', function () {
    $(this).removeClass('not-active').siblings().addClass('not-active');
  });
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

  function myCallback(start, end) {
    $('#config-date span').html(start.format('MMM D, YYYY') + ' - ' + end.format('MMM D, YYYY'));
    var start = start.format('MM-DD-YYYY');
    var end = end.format('MM-DD-YYYY');
    var rate_value = $('#flag').val();
    var paylist = $('#paylist').val();
    getStatement(start, end, rate_value, paylist);  // call get account statement 
  }
  // attach daterangepicker plugin
  $('#config-date').daterangepicker(options, myCallback);
  var startDate = moment().subtract(30, 'days');
  var endDate = moment();
  $('#config-date .form-control').html(startDate.format('MMM DD, YYYY') + ' - ' + endDate.format('MMM DD, YYYY'));
})

bindsummary({
  "reqFlag": "consumer"
})
function paymentClick()     /// assetmanager to assetmanager transaction history
{ 
  var flag = $('#flag').val();
  var rate_value = $('#paylist').val();
  $(".entBank").removeClass("hidden")
  if (flag === "truWallet") {
    let json = {
      "reqFlag": rate_value
    }
    bindsummary(json)
  }
  else if (flag === "atom") {
    let json = {
      "reqFlag": rate_value
    }
    bindAtomsummary(json)
  }
  else if (flag === "bankacc") {
    $(".entBank").addClass("hidden")
    if (rate_value == "consumer") {
      let json =
      {
        "skip": "0",
        "reqFlag": rate_value
      }
      bindBankSummary(json)
    }
    else {
      let json =
      {
        "skip": "0",
        "reqFlag": "entity"
      }
      bindBankSummary(json)
    }
  }
  resetTimer()
}
function paymentTimer()     /// assetmanager to assetmanager transaction history
{  
  var flag = $('#flag').val();
  var rate_value = $('#paylist').val();
  $(".entBank").removeClass("hidden")
  if (flag === "truWallet") {
    let json = {
      "reqFlag": rate_value
    }
    bindsummary(json)
  }
  else if (flag === "atom") {
    let json = {
      "reqFlag": rate_value
    }
    bindAtomsummary(json)
  }
  else if (flag === "bankacc") {
    $(".entBank").addClass("hidden")
    if (rate_value == "consumer") {
      let json =
      {
        "skip": "0",
        "reqFlag": rate_value
      }
      bindBankSummary(json)
    }
    else {
      let json =
      {
        "skip": "0",
        "reqFlag": "consumer"
      }
      bindBankSummary(json)
    }
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
        $("#bamount").html("<i class='fa fa-rupee'></i> " + decimalChopper(parseFloat(arr.amount), 2));
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

/* function timer(x) {
  var counter = 160;
  var interval = setInterval(function () {
    counter--;
    // Display 'counter' wherever you want to display it.
    if (counter <= 0) {
      clearInterval(interval);
      paymentTimer();
      return;
    } else {
      $('#time').text(counter);
    }
  }, 1000);
  if(x=="refresh")
  {
    clearInterval(interval); 
    return;
  }
}; */

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
            paymentTimer() 
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
