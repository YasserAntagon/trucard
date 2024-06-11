var amt;
var paymode = "Atom";

function OnPreviewInvoice(previewData, isPeople)    // on click on view invoice 
{
    $(".invoice").empty();
    $(".target-output").empty();
    $(".target-payment").empty();
    $("#viewinvLoader").css("display", "block");
    if (previewData) {
        const ischeck = ["redeemCash", "sell"];
        if ((previewData.MOP == "others" || previewData.MOP == "other") && !ischeck.includes(previewData.type)) {
            PGStatus(previewData, isPeople);
        }
    }
    jsonBulider(previewData);
    $('#myModalInvoice').appendTo("body").modal('show');
}

function OnAddMoneyViewC(invoice, trastype, isPeople)    // on click on view invoice 
{
    $(".se-pre-con").css("display", "block");
    $(".target-output").empty();
    $(".target-payment").empty();
    var json = {
        "invoice": invoice,
        "type": trastype,
        "cuType": "consumer"
    };
    $.ajax({
        "url": "/dash/getWalletReceipt", "method": "POST", data: json, success: function (data) {
            if (data.status == 200) {
                jsonAddMoneyC(data.resource);
                if (data.resource.tType == "addMoney") {
                    PGStatus(data.resource, isPeople);
                }
            }
        }
    })
}
function OnAddMoneyView(invoice, trastype, isPeople)    // on click on view invoice 
{
    $(".se-pre-con").css("display", "block");
    $(".target-output").empty();
    $(".target-payment").empty();
    var json = {
        "invoice": invoice,
        "type": trastype,
        "cuType": "entity"
    };
    $.ajax({
        "url": "/eEntity/egetWalletReceipt", "method": "POST", data: json, success: function (data) {
            if (data.status == 200) {
                jsonAddMoneyC(data.resource);
                /*    if (data.resource.tType == "addMoney" || data.resource.tType == "addFloat") {
                       PGStatus(data.resource, isPeople);
                   } */
            }
            else {
                alertify.error('No record found..!!');
            }
        }
    })
}

// Add Money Preview
function jsonAddMoneyC(data) {
    var date = new Date(Date.parse(data.createDate));
    var fdate = FormatDateToString(date, "time");
    var temppayby = data.cardType ? "(" + data.cardType + ")" : "";
    var ins = {
        invoice: data.invoice,
        to: data.truID ? replaceWithX(data.truID) : data.to,
        title: data.tType == "addMoney" ? "Add Money in Wallet" : data.tType == "walletToBank" ? "Wallet To Bank" : "",
        type: data.tType == "addMoney" ? "Add Money" : data.tType == "walletToBank" ? "Wallet To Bank" : "",
        status: "success",
        hasAc: data.tType == "walletToBank" ? true : false,
        wallet: data.tType == "addMoney" ? "truWallet" : "",
        amount: data.totalAmount,
        toAssetManagerName: data.name,
        bankTxnID: data.bankTxnID ? "Bank TXN ID : " + data.bankTxnID : data.UTRNumber ? "Bank TXN ID : " + data.UTRNumber : "",
        paidBy: data.mop ? "Mode of pay : " + data.mop + temppayby : "",
        pgType: data.pgType ? data.pgType : "",
        orderdate: fdate,
        bankName: data.bankName ? "Bank : " + data.bankName : "",
        senderName: data.senderName ? "A/C Holder Name : " + data.senderName : "",
        senderAccountNumber: data.senderAccountNumber ? "A/C No : " + data.senderAccountNumber : ""
    }
    var invoice = {
        "invoice": [
            ins
        ]
    };
    var list = $("#WalletTrans").html();
    var html = Mustache.to_html(list, invoice);
    $(".wallet-output").html(html);
}
$('#myModalInvoice').on('shown.bs.modal', function () {
    $(document).off('focusin.modal');
});
$('#myModals').on('shown.bs.modal', function () {
    $(document).off('focusin.modal');
});
function jsonBulider(resource) {
    var myData = {};
    var fdate = FormatDateToString(resource.createDate, "time");
    myData.status = resource.status == "failure" ? "Failed" : resource.status;
    myData.invoice = resource.invoice;
    myData.consumerName = resource.consumerName;
    var mop = resource.MOP;
    if (resource.MOP == "offline") {
        // mop = "Paid on Counter";
        mop = `<strong>Paid by: Paid on Counter </strong><br>`;
    }
    else if ((resource.type == "buy" || resource.type == "transfer")) {
        // mop = "Paid on Counter";
        mop = `<strong>Paid by: Paid on Counter </strong><br>`;
    }
    else if (resource.type == "redeemCash") {
        mop = `<strong>Paid by: Cash </strong><br>`;
    }
    else if (resource.type == "redeemCash" && resource.MOP == "truwallet") {
        mop = `<strong>Credited In : truWallet </strong><br>`;
    }
    else if (resource.type == "redeemCash" && resource.MOP == "others") {
        mop = `<strong>Bank TXN ID : ${String(resource.bankTXNID)}</strong> <br><strong>Paid Via : Bank Transfer (${String(resource.payBy)}) </strong><br></br>`
    }
    else if (resource.MOP == "truWallet") {
        mop = `<strong>Paid by : truWallet </strong><br>`;
    }
    else if (resource.MOP == "others") {
        mop = `<strong>Paid By : ${String(resource.payBy)}</strong> <br><strong>Bank TXN ID : ${String(resource.bankTXNID)} </strong><br><br>`;
    }
    myData.to = replaceWithX(resource.to);
    myData.orderdate = fdate;
    myData.isTransfer = false;
    myData.subTotal = `<td class="no-line text-right font-12">
    <strong>Subtotal&nbsp;:</strong></td>
    <td class="no-line text-right">
    <i class="mdi mdi-currency-inr"></i>`+ resource.amount + `
    </td>`;
    if (resource.type == "redeemCash") {
        myData.totalAmount = resource.totalAmount
        if (resource.status == "success") {
            myData.GSTIN = `<strong>GSTIN: 07AAFCT6383H2ZZ</strong><br>`;
            myData.subMessage = resource.MOP == "others" && resource.MOP == "other" ? "We will be nofity once transaction is completed successfully.Amount will be credited in your linked bank account." : "";
            myData.message = `<strong><i class="mdi mdi-currency-inr"></i>` + resource.totalAmount + ` amount successfully credited </strong>`;
        }
        myData.isRedeem = true;
        if (resource.applicableTAX && resource.applicableTAX != "0") {
            myData.charges = `<tr><td><strong>GST/TAX&nbsp;(` + resource.applicableTAX + "%" + `)&nbsp;: </strong></td><td class="no-line text-right"><i class="mdi mdi-currency-inr"></i>` + resource.tax + `</td></tr>`;
        }
        myData.Paidby = mop;
    }
    else if (resource.type == "conversion") {
        var btype = "";
        myData.isConversion = true;
        var G24KQty = resource.product.filter(item => item.bullionType === "G24K")[0];
        var S99PQty = resource.product.filter(item => item.bullionType === "S99P")[0];
        myData.subTotal = null;
        myData.charges = `<tr><td><strong>Conversion&nbsp;Charges&nbsp;: <br/>(inclusive)</strong></td><td class="no-line text-right"><i class="mdi mdi-currency-inr"></i>` + resource.totalAmount + `</td></tr>`;
        myData.totalAmount = resource.amount;
        if (resource.conversionFrom == "G24K") {
            myData.rate = G24KQty.rate;
            // resource.amount = G24KQty.amount;
            btype = `<div class="row"><div class="col-md-4 text-center" style="padding: 2px;">
            <img  src='images/new/gold.png'  alt='TruGold' title='TruGold' width='30px' height='30px' /><br />
            <label class='label label-g18' title='TruGold'>TruGold</label><br />
            `+ G24KQty.qty + ` gms
            </div>
            <div class="col-md-2">
            <i class='fa fa-arrow-right' style='text-align:center;padding:2px' /></div>
            <div class="col-md-4 text-center" style="padding: 2px;">
            <img  src='images/new/silver.png'  alt='TruSilver' title='TruSilver' width='30px' height='30px' /><br />
            <label class='label label-s99' title='TruSilver'>TruSilver</label><br />
            `+ S99PQty.qty + ` gms 
            </div></div>`;
            if (resource.status == "success") {
                myData.message = `<strong>Converted ` + G24KQty.qty + ` gms of TruGold to ` + S99PQty.qty + ` gms TruSilver</strong>`;
            }
        } else if (resource.conversionFrom == "S99P") {
            myData.rate = S99PQty.rate;
            // resource.amount = S99PQty.amount;
            myData.totalAmount = resource.amount;
            btype = `<div class="row"><div class="col-md-4 text-center" style="padding: 2px;">
            <img  src='images/new/silver.png'  alt='TruSilver' title='TruSilver' width='30px' height='30px' /><br />
            <label class='label label-s99' title='TruSilver'>TruSilver</label><br />
            `+ S99PQty.qty + ` gms
            </div>
            <div class="col-md-2">
            <i class='fa fa-arrow-right' style='text-align:center;padding:2px' /></div>
            <div class="col-md-4 text-center" style="padding: 2px;">
            <img  src='images/new/gold.png'  alt='TruGold' title='TruGold' width='30px' height='30px' /><br />
            <label class='label label-g18' title='TruGold'>TruGold</label><br />
            `+ G24KQty.qty + ` gms
            </div></div>`;
            if (myData.status == "success") {
                myData.message = `<strong>Converted ` + S99PQty.qty + ` gms of TruSilver to ` + G24KQty.qty + ` gms TruGold</strong>`;
            }
        }
        myData.abType = btype;
    }
    else if (resource.type == "transfer" || resource.type == "gift" || resource.type == "payment") {
        myData.isTransfer = true;
        myData.receiverName = resource.receiverName;
        myData.receiverTruID = replaceWithX(resource.receiverTruID);
        if (resource.status == "success") {
            if (resource.type == "transfer" || resource.type == "gift") {
                var status = resource.consumerName + " sent to ";
                myData.message = `<strong> ` + status + " " + resource.exQty + ` gms of ` + resource.productType + " to " + resource.receiverName + `</strong>`;
            }
            if (resource.type == "payment") {
                //myData.charges = resource.charges; 
                myData.message = `₹ ` + resource.amount + ` paid to ` + resource.receiverName;
                if (resource.cashback) {
                    myData.message += `<br /><strong>₹ ` + resource.cashback + ` cashback credited to ` + resource.consumerName + `</strong>`;
                }
            }
        }
        myData.totalAmount = resource.amount;
        myData.subTotal = null;
    }
    else {
        myData.charges = `<tr><td><strong>GST/TAX&nbsp;(` + resource.applicableTAX + "%" + `)&nbsp;: </strong></td><td class="no-line text-right"><i class="mdi mdi-currency-inr"></i>` + resource.tax + `</td></tr>`;
        myData.isRedeem = false;
        myData.totalAmount = resource.totalAmount
        if (myData.status == "success") {
            myData.GSTIN = `<strong>GSTIN: 07AAFCT6383H2ZZ</strong><br>`;
            myData.Paidby = mop;
            myData.message = `<strong><i class="mdi mdi-currency-inr"></i>` + resource.totalAmount + ` amount successfully paid</strong>`;
        }
    }
    myData.type = resource.type == "redeemCash" ? "Sell" : resource.type;
    const product = (productmp) => {
        return productmp.map(item => {
            item.title = item.bullionType === "G24K" ? "TruGold" : "TruSilver";
            item.path = item.bullionType === "G24K" ? "images/new/gold.png" : "images/new/silver.png";
            item.from = replaceWithX(item.from);
            return item
        })
    }
    myData.product = product(resource.product)
    var invoice = {
        "data": [myData]
    };
    var list = $("#invoicetmp").html();
    var html = Mustache.to_html(list, invoice);
    $(".invoice").html(html);
    $("#viewinvLoader").fadeOut("slow");
}
var paymentAddMoneyStatus = function (event) {
    $orderID = $(event).attr("data-orderID");
    $invoiceAmount = $(event).attr("data-invoiceAmount");
    $status = $(event).attr("data-status");
    $truID = $(event).attr("data-truID");
    $invoice = $(event).attr("data-invoice");
    paymentStatus($orderID, $invoiceAmount, true, $invoice, $truID, $status, "atom", "consumer")
}
function roundNumber(number, decimals) {
    var newnumber = new Number(number + '').toFixed(parseInt(decimals));
    return parseFloat(newnumber);
}
function PGStatus(previewData, isPeople) {
    var json = {
        "type": previewData.type ? previewData.type : previewData.tType,
        "invoice": previewData.invoice,
        "isPeople": isPeople
    }
    $('#loader').css("display", 'block');
    $.ajax({
        "url": "/refundStatus/PGStatus", "method": "POST", data: json, success: function (wp) {
            $('#loader').fadeOut('slow');
            if (wp.status == "200") {
                var data = wp.resource;
                if (data.pgType == "atom") {
                    data.CUST_NAME = previewData.consumerName;
                    data.type = previewData.tType ? previewData.tType : previewData.type,
                        data.ctruid = previewData.to ? previewData.to : previewData.truID,
                        data.isPeople = isPeople;
                    data.success = previewData.status == "refund" ? false : data.status == "SUCCESS" ? previewData.status == "failure" ? true : false : false;
                    data.isAtom = true;
                    data.TXN_ID = data.BID ? data.BID : "";
                    data.STATUS = data.status;
                    data.RESPONSE_MESSAGE = data.status;
                    data.MOP_TYPE = data.bankname;
                    data.reconStatus = data.reconstatus;
                    data.ORDER_ID = previewData.invoice;
                    data.AMOUNT = data.amount;
                    data.INVAMOUNT = data.amount;
                    var temppayby = data.discriminator;
                    var cardNumber = data.cardNumber;
                    var payby = (temppayby == "NB") ? "Net Banking" : (temppayby == "CC") ? "Credit Card" : (temppayby == "DC") ? "Debit Card" : temppayby;
                    data.PAYMENT_TYPE = payby;
                    data.CARD_MASK = cardNumber;
                    paymentAtomDetails(data)
                }
            }
        }
    })
}

function paymentDetails(data) {
    var invoice = {
        "payInvoice": [data]
    };
    var list = $("#payStatus").html();
    var html = Mustache.to_html(list, invoice);
    $(".target-payment").html(html);
}
function paymentAtomDetails(data) {
    var invoice = {
        "payInvoice": [data]
    };
    var list = $("#payStatus").html();
    var html = Mustache.to_html(list, invoice);
    $(".target-payment").html(html);
}
function OpenBankStatus(that) {
    let toSixId = $(that).attr("data-toSixId");
    let invoice = $(that).attr("data-invoice");
    let isPeople = $(that).attr("isPeople");
    var json = {
        "ctruid": toSixId,
        "isPeople": isPeople,
        "invoice": invoice
    }
    $("#txnload").removeClass("hidden");
    $("#txnSuccess").addClass("hidden");
    $(".amtcount").addClass("hidden");
    $('#bankmodel').modal('show');
    $.ajax({
        "url": "/Charges/getBankTxnStatus", "method": "POST", data: json, success: function (a) {
            $('#loader').fadeOut('slow');
            let res = a.body;
            if (res && res.status == "200") {
                const arr = res.resource;
                var cdt = _formatDate(Date.parse(arr.txntime), "time");
                var mop = arr.Mode_of_Pay;
                let utr = mop == "IMPS" ? "RRN No" : mop == "NEFT" ? "UTR No" : "";
                let utrno = mop == "FT" ? "" : arr.txnId;
                $("#utr").html(utr);
                $("#btransactionID").html(utrno);
                $("#bamount").html("<i class='fa fa-rupee'></i> " + decimalChopper(parseFloat(arr.amount), 2));
                $("#bbankname").html(arr.BenIFSC);
                $("#baccno").html(arr.Ben_Acct_No);
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
function getTransactiondetails() {
    $('#modal-default').modal('toggle');
}