function OpenInvoice(item) {
    let custtid = $(item).attr("data-truid");
    let cinv = $(item).attr("data-invoice");
    var isPeople = $('#paylist').val();
    let trans_type = $(item).attr("data-type");
    $status = $(item).attr("data-txnStatus");
    if (isPeople == "entity") {
        setTimeout(function () {
            if (trans_type == "buy" || trans_type == "buyCash" || trans_type == "consumerBuy" || trans_type == "consumerBuyCash") {
                viewinvoice(cinv, isPeople, trans_type, custtid, $status);
            }
            else if (trans_type == "redeemCash" || trans_type == "consumerBuyCash") {
                viewinvoice(cinv, isPeople, trans_type, custtid, $status);
            }
            else if (trans_type == "addMoney") {
                alert("no preview")
            } 
            else if (trans_type == "transfer" || trans_type == "consumerTransfer") {
                viewinvoicetrans(cinv, isPeople, trans_type, custtid, $status);
            }
        }, 5);
    }
    else if (isPeople == "consumer") {

        openConsumerInvoice(cinv, custtid, trans_type, $status)
    }
    else if (isPeople == "assetmanager") {
        openConsumerInvoice(cinv, isPeople, trans_type, $status)
    }
}

var viewinvoice = function (invoiceno, isPeople, type, custtid, status) {
    var json = {
        "type": type,
        // "reqFlag": isPeople,
        "invoice": invoiceno
    };
    $('#loader').css('display', 'block');
    $.ajax({
        "url": "/eEntity/getEnPaymentInvoice", "method": "POST", data: json, success: function (a) {
            $('#loader').fadeOut('slow');
            let data = a.body;
            let config = a.config;
            if (data.status == 200) {
                if (a.reqFlag == "entity") {
                    bindEntityinvoice(data.resource, config);
                    $(".target-payment").empty();
                    
                }
                else 
                {
                    bindConsumerinvoice(data.resource, config);
                    $(".target-payment").empty();
                    
                }
                // // console.log("Invoice data ", data.resource)
                $(".showstock").removeClass("hidden");
                $(".stockList").addClass("hidden");
                if ($status == "success") { 
                    $('#txnstatus').addClass('text-green');
                    $('#txnstatus').removeClass('text-danger');
                    $('#txnamt').addClass('text-green');
                    $('#txnamt').removeClass('text-danger');
                }
                else {
                    $('#txnstatus').addClass('text-danger');
                    $('#txnstatus').removeClass('text-green');
                    $('#txnamt').addClass('text-danger');
                    $('#txnamt').removeClass('text-green');
                }
            } else 
            {
                alertify.logPosition("bottom left");
                alertify.error(data.messege);
            }
        }
    });

}

var viewinvoicetrans = function (invoiceno, ispeople, type, custtid, status) {
    var json = {
        "type": "transfer",
        "invoice": invoiceno
    };
    $('#loader').css('display', 'block');
    $.ajax({
        "url": "/eEntity/getEnPaymentInvoice", "method": "POST", data: json, success: function (a) {
            $('#loader').fadeOut('slow');
            let data = a.body;
            let config = a.config;
            if (data.status == 200) {
                bindtransferinvoice(data.resource, config);
                
                $(".showstock").removeClass("hidden");
                $(".stockList").addClass("hidden");
                if ($status == "success") {
                    $('#ttxnstatus').addClass('text-green');
                    $('#ttxnstatus').removeClass('text-danger');
                    $('#ttxnamt').addClass('text-green');
                    $('#ttxnamt').removeClass('text-danger');
                }
                else {
                    $('#ttxnstatus').addClass('text-danger');
                    $('#ttxnstatus').removeClass('text-green');
                    $('#ttxnamt').addClass('text-danger');
                    $('#ttxnamt').removeClass('text-green');
                }
            } else {
                alertify.logPosition("bottom left");
                alertify.error(data.messege);
            }
        }
    });

}

var bindinvoice = function (invarr, config) {
    var targetContainer = $(".target-output"),
        template = $("#entityInvoice").html();
    var inv = jsonBulider(invarr, config);
    var invoice = {
        "invoice": [
            inv
        ]
    };
    var html = Mustache.to_html(template, invoice);
    $(targetContainer).html(html);
}

var bindEntityinvoice = function (invarr, config, enDetails) {
    // var targetContainer = $(".target-output"),
    //     template = $("#entityInvoice").html();
    if (invarr.type == "buy" || invarr.type == "buyCash") {
        var targetContainer = $(".target-output"),
            template = $("#EntitySelfBuyInvoice").html();
    } else if (invarr.type == "redeemCash") {
        var targetContainer = $(".target-output"),
            template = $("#EntitySelfRedeemInvoice").html();
    } else {
        var targetContainer = $(".target-output"),
            template = $("#entityInvoice").html();
    }
    var inv = selfJsonBulider(invarr, config, enDetails);
    var invoice = {
        "invoice": [
            inv
        ]
    }; 
    var html = Mustache.to_html(template, invoice);

    $(targetContainer).html(html);
}


var bindtransferinvoice = function (invarr, config) {
    var targetContainer = $(".target-output"),
        template = $("#consumerTransferInvoice").html();
    var inv = transferjsonBuilder(invarr, config);
    var transinvoice = {
        "transinvoice": [
            inv
        ]
    };

    var html = Mustache.to_html(template, transinvoice);

    $(targetContainer).html(html);
}

function selfJsonBulider(a, config, enDetails) {

    var invoicearr = new Array();
    var goldarr = new Array();
    var gold = {};
    var subtotl = 0, SubRtotl = 0, taxtotl = 0;
    if (a.particularsG24) {
        var totlGold24k = 0

        if (a.particularsG24.qty != 0) {
            totlGold24k = totlGold24k + parseFloat(a.particularsG24.qty), 2;
            subtotl += parseFloat(a.particularsG24.amount);
            SubRtotl = SubRtotl + parseFloat(decimalChopper(a.particularsG24.total, 2));
            taxtotl = taxtotl + parseFloat(decimalChopper(a.particularsG24.tax, 2));
            invoicearr.push(transArray(a.particularsG24, a.type, "24k Gold"));
        }

        if (totlGold24k !== 0) {
            gold["g24k"] = decimalChopper(totlGold24k, 2)
        }
    } 
    if (a.particularsS99) {
        var totlGold99p = 0
        if (a.particularsS99.qty != 0) {
            totlGold99p = totlGold99p + parseFloat(a.particularsS99.qty), 2;
            subtotl += parseFloat(a.particularsS99.amount);
            SubRtotl = SubRtotl + parseFloat(decimalChopper(a.particularsS99.total, 2));
            taxtotl = taxtotl + parseFloat(decimalChopper(a.particularsS99.tax, 2));
            invoicearr.push(transArray(a.particularsS99, a.type, "99% Pure Silver"));
        }
        if (totlGold99p !== 0) {
            gold["s99p"] = decimalChopper(totlGold99p, 2)
        }
    }
    var custimg, custCity, custname;
    var transstatus, transactiontype;
    $status = a.status;
    if (a.status) {
        if (a.status == "success") {
            transstatus = "Transaction Successful";
            goldarr.push(gold);
            if (a.assetstore) {
                // custimg = a.assetstore.image
                // custimg = "images/custoImg.png"
                custimg = config + "/3014?url=" + a.assetstore.image;
                custname = a.assetstore.companyName
                custCity = a.assetstore.companyRegisteredAddress.city
            }
        }
        else {
            transstatus = "Transaction Failed";
        }
    }

    var storeName, storeAddress, storeCity, storeState, storeCountry, storePin, storeTruID, taxheading, storehead = "";
    if (a.type == "buyCash" || a.type == "buy") {
        taxheading = "GST (" + a.applicableTAX + "%)";
    } 
    else if (a.type == "redeemCash") {
        taxheading = "Charges";
    }
    var isRedeem = false;
    if (a.type == "buyCash") {
        transactiontype = "Buy";
    } else if (a.type == "buy") {
        transactiontype = "Buy";
    } else if (a.type == "redeemCash") {
        isRedeem = true
        transactiontype = "Sell";
    }

    var date = new Date(a.createDate);
    var fdate = _formatDate(date, 'time');
    var ins = {
        "orderno": a.invoice,
        "to": a.to,
        "status": transstatus,
        "isStatus": a.status == "success" ? true : false,
        "orderdate": fdate,
        "taxhead": taxheading,
        "subtotal": decimalChopper(subtotl, 2),
        "SubRtotl": decimalChopper(SubRtotl, 2),
        "taxper": a.applicableTAX ? a.applicableTAX + "%" : "3%",
        "totalTax": decimalChopper(taxtotl, 2),
        "paymentCharge": a.paymentCharge ? a.paymentCharge : "0",
        "name": a.companyName,
        "address": a.address ? a.address.houseNumber + ',' + a.address.landmark + ',' + a.address.streetNumber : '',
        "address1": a.address ? a.address.city + ", " + a.address.state : '',
        "address2": a.address ? a.address.country + ", " + a.address.pin : '',
        "total": decimalChopper(a.totalAmount, 2),
        "productlist": invoicearr,
        "golds": goldarr,
        // "dfrom": from,
        "transactiontype": transactiontype,
        "MOP": (a.MOP == "truWallet") ? true : false,
        "store_head": storehead,
        "store_Name": storeName,
        "store_truId": storeTruID,
        "store_Address": storeAddress,
        "store_city": storeCity,
        "store_state": storeState,
        "store_country": storeCountry,
        "store_pin": storePin,
        // "dname": from.split('(')[0],
        "custimg": custimg,
        "assetstore": custname,
        "custCity": custCity
    };
    // console.log(ins);
    return ins;
}

function transferjsonBuilder(a, config) {
    var invoicearr = new Array();
    var goldarr = new Array();
    var kycdata1 = {};
    var kycdata2 = {};
    var kycdata3 = {};
    var kycdata4 = {};
    var gold = {};
    var subtotl = 0;
    if (a.particularsG24) {
        if (a.particularsG24.qty != 0) {
            // from = a.particularsG24.from;
            kycdata1["productname"] = "24K Gold";
            kycdata1["qty"] = decimalChopper(a.particularsG24.qty, 2);
            kycdata1["amount"] = decimalChopper(parseFloat(a.particularsG24.qty) * parseFloat(a.particularsG24.rate), 2);
            gold["g24k"] = decimalChopper(a.particularsG24.qty, 2);
            kycdata1["rate"] = decimalChopper(a.particularsG24.rate, 2);
            kycdata1["other"] = decimalChopper(a.particularsG24.otherCharges, 2);
            // kycdata1["assetmanagersCharges"] = decimalChopper(a.particularsG24.assetmanagersCharges, 2);
            kycdata1["subtotal"] = decimalChopper(a.particularsG24.total, 2);
            subtotl += parseFloat(a.particularsG24.qty) * parseFloat(a.particularsG24.rate);
            invoicearr.push(kycdata1);
        }
    } 

    //var s99flag = parseFloat(a.particularsS99.qty);
    if (a.particularsS99) {
        if (a.particularsS99.qty != 0) {
            // from = a.particularsS99.from;
            kycdata4["productname"] = "99% Silver";
            kycdata4["qty"] = decimalChopper(a.particularsS99.qty, 2);
            kycdata4["amount"] = decimalChopper(parseFloat(a.particularsS99.qty) * parseFloat(a.particularsS99.rate), 2);
            gold["s99p"] = decimalChopper(a.particularsS99.qty, 2);
            kycdata4["rate"] = decimalChopper(a.particularsS99.rate, 2);
            kycdata4["other"] = decimalChopper(a.particularsS99.otherCharges, 2);
            // kycdata1["assetmanagersCharges"] = decimalChopper(a.particularsG24.assetmanagersCharges, 2);
            kycdata4["subtotal"] = decimalChopper(a.particularsG24.total, 2);
            subtotl += parseFloat(a.particularsS99.qty) * parseFloat(a.particularsS99.rate);
            invoicearr.push(kycdata4);
        }
    }

    var custimg, custname, custCity

    var transstatus, transactiontype;
    $status = a.status;
    if (a.status) {
        if (a.status == "success") {
            transstatus = "Transfered Successful";
            if (a.assetstore) {
                goldarr.push(gold);
                // custimg = a.assetstore.image;
                custimg = config.custoUrl + a.assetstore.image;
                // custimg = "images/custoImg.png"
                custname = a.assetstore.companyName;
                custCity = a.assetstore.companyRegisteredAddress.city;
            }
        }
        else {
            transstatus = "Transfered Failed";
        }
    }
    if (a.type == "buyCash") {
        transactiontype = "Buy";
    } else if (a.type == "buyCoin") {
        transactiontype = "Buy";
    } else if (a.type == "transfer") {
        transactiontype = "Transfer";
    }



    var date = new Date(a.createDate);
    var fdate = _formatDate(date, 'time');
    // console.log("create date ", fdate);
    var ins = {
        "orderno": a.invoice,
        "to": a.to,
        "status": transstatus,
        "isStatus": a.status == "success" ? true : false,
        "orderdate": fdate,
        "name": a.fName + " " + a.lName,
        "address": a.address ? a.address.houseNumber + ',' + a.address.landmark + ',' + a.address.streetNumber : '',
        "address1": a.address ? a.address.city + ", " + a.address.state : '',
        "address2": a.address ? a.address.country + ", " + a.address.pin : '',
        "total": decimalChopper(a.totalAmount, 2),
        "subtotal": decimalChopper(subtotl, 2),
        "golds": goldarr,
        "productlist": invoicearr,
        // "dname": from.split('(')[0],
        "transactiontype": transactiontype,
        "MOP": (a.MOP == "truWallet") ? true : false,
        "s_name": a.s_fname + " " + a.s_lname,
        "s_truid": a.s_truID,
        "s_address": a.s_address ? a.s_address.houseNumber + ',' + a.s_address.landmark + ',' + a.s_address.streetNumber : '',
        "s_address1": a.s_address ? a.s_address.city + ", " + a.s_address.state : '',
        "s_address2": a.s_address ? a.s_address.country + ", " + a.s_address.pin : '',
        // "subtotal": subtotl,
        "custimg": custimg,
        "assetstore": custname,
        "custCity": custCity
    };
    return ins;

}

function transArray(particulars, transType, btype) {
    var kycdata = {};

    kycdata["fromTruID"] = particulars.fromTruID;
    kycdata["from"] = particulars.from;
    kycdata["productname"] = btype;
    kycdata["qty"] = decimalChopper(particulars.qty, 2);
    kycdata["rate"] = decimalChopper(particulars.rate, 2);
    kycdata["amount"] = decimalChopper(particulars.amount, 2);
    if (transType == "buyCash") {
        kycdata["subtotal"] = decimalChopper(particulars.total, 2);
        kycdata["tax"] = decimalChopper(particulars.tax, 2);
    } else if (transType == "buy") {
        kycdata["subtotal"] = decimalChopper(particulars.total, 2);
        kycdata["tax"] = decimalChopper(particulars.tax, 2);
    } else if (transType == "redeemCash") {
        var othercharge = parseFloat(particulars.assetmanagersCharges) + (particulars.otherCharges ? parseFloat(particulars.otherCharges) : 0);
        var subTotal = parseFloat(particulars.amount) - othercharge;
        kycdata["subtotal"] = decimalChopper(subTotal.toString(), 2);
        kycdata["tax"] = decimalChopper(othercharge, 2);
    }
    return kycdata;
}
  
$(document).on("click", ".btnstohide", function (e) {
    e.preventDefault();
    $(".showstock").addClass("hidden");
    $(".stockList").removeClass("hidden");
})
function downloadpdf(divName, event) {
    $orders = $(event).attr("data-invoice");

    var element = document.getElementById(divName);
    var opt = {
        margin: 0.5,
        filename: $orders + '.pdf',
        image: { type: 'png', quality: 1 },
        html2canvas: { allowTaint: true },
        jsPDF: { unit: 'in', format: 'A4', orientation: 'landscape' }
    };

    // New Promise-based usage:
    html2pdf().set(opt).from(element).save();
}
var bool = true;
function showcert() {
    if (bool == true) {
        $('.showcontent-content').addClass("show")
        $('.showcontent-content').removeClass("slide")
        bool = false;
    }
    else {
        $('.showcontent-content').addClass("slide")
        $('.showcontent-content').removeClass("show")
        bool = true;
    }
}