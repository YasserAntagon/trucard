
function openConsumerInvoice(cinv, custtid, trans_type, status) {
    setTimeout(function () {
        if (trans_type == "buy" || trans_type == "buyCash") {
            viewConsumerInvoice(cinv, trans_type, custtid, status);
        }
        else if (trans_type == "redeemCash") {
            viewConsumerInvoice(cinv, trans_type, custtid, status);
        }
        else if (trans_type == "addMoney") {
            alert("no preview")
        }
        else if (trans_type == "conversion") {
            viewinvoiceConsumerConversion(cinv, trans_type, custtid, status)
        }
        else if (trans_type == "transfer") {
            viewConsumertrans(cinv, trans_type, custtid, status);
        }
    }, 5);

}

var viewConsumerInvoice = function (invoiceno, type, custtid, status) {
    var json = {
        "type": type,
        "reqFlag": "consumer",
        "invoice": invoiceno
    };
    $('#loader').css("display", 'block');
    $.ajax({
        "url": "/consumerDB/getAssetManagerPaymentInvoice", "method": "POST", data: json, success: function (a) {
            let data = a.body;
            let config = a.config;
            $('#loader').fadeOut('slow');
            if (data.status == 200) {
                if (a.reqFlag == "assetmanager") { 
                    assetmanagerJsonBulider(data, config);
                    $(".target-payment").empty();
                    var payFlag = $('#flag').val();
                } else { 
                    bindConsumerinvoice(data.resource, config);
                    $(".target-payment").empty();
                    var payFlag = $('#flag').val();

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
                }
                $(".showstock").removeClass("hidden");
                $(".stockList").addClass("hidden");

            } else {
                alertify.logPosition("bottom left");
                alertify.error(data.messege);
            }
        }
    });

}

function jsonBulider(a, config) {
    var invoicearr = new Array();
    var goldarr = new Array();
    var g24flag = parseFloat(a.resource.particularsG24.qty);
    var transactiontype = a.resource.type;
    var from;
    var golds = {};
    var taxheading;
    if (a.resource.type == "buyCash" || a.resource.type == "buy") {
        taxheading = "GST(" + a.resource.applicableTAX + "%)";
    }
    else if (a.resource.type == "redeemCash") {
        taxheading = "Charges";
    }
    if (g24flag !== 0) {

        if (transactiontype == "buy") {
            from = a.resource.particularsG24.from;
        }
        else {
            from = a.resource.particularsG24.from;
        }

        golds["g24k"] = decimalChopper(a.resource.particularsG24.qty, 4);
        invoicearr.push(createlistConsumer(a.resource.particularsG24, a.resource.type, "24K Gold"));
    } 
    var s99flag = parseFloat(a.resource.particularsS99.qty);
    if (s99flag !== 0) {

        if (transactiontype == "buy") {
            from = a.resource.particularsS99.from;
        }
        else {
            from = a.resource.particularsS99.from;
        }
        golds["s99p"] = decimalChopper(a.resource.particularsS99.qty,  4);
        invoicearr.push(createlistConsumer(a.resource.particularsS99, a.resource.type, "99% Silver"));
    }


    goldarr.push(golds);
    //var date = new Date();
    var date = new Date(a.resource.createDate);
    var fdate = _formatDate(date, "time");
    var assetmanagerName = a.resource.toAssetManagerName; 
    var imagef = a.resource.assetstore.image;
    var lastChar = imagef[imagef.length - 1];
    if (lastChar == "0") {
        imagef = "images/icon/certi.jpg";
    }
    var ins =
    {
        "orderno": a.resource.invoice,
        "to": a.resource.to,
        "orderdate": fdate,

        "taxhead": taxheading,
        "name": assetmanagerName,
        "isStatus": a.status == "success" ? true : false, 
        "address": a.resource.toAddress ? a.resource.toAddress.houseNumber + ',' + a.resource.toAddress.landmark + ',' + a.resource.toAddress.streetNumber : '',
        "address1": a.resource.toAddress ? a.resource.toAddress.city + ", " + a.resource.toAddress.state : '',
        "address2": a.resource.toAddress ? a.resource.toAddress.country + ", " + a.resource.toAddress.pin : '',
        "from": a.resource.fromAssetManagerName,
        "total": decimalChopper(a.resource.totalAmount, 2),
        "productlist": invoicearr, 
        "f_address": a.resource.fromAddress ? a.resource.fromAddress.houseNumber + ',' + a.resource.fromAddress.landmark + ',' + a.resource.fromAddress.streetNumber : '',
        "f_address1": a.resource.fromAddress ? a.resource.fromAddress.city + ", " + a.resource.fromAddress.state : '',
        "f_address2": a.resource.fromAddress ? a.resource.fromAddress.country + ", " + a.resource.fromAddress.pin : '',
        "truID": a.resource.to,
        "fromtruid": from,
        "golds": goldarr,
        "MOP": a.resource.MOP,
        "assetstorename": a.resource.assetstore.companyName,
        "ccity": a.resource.assetstore.companyRegisteredAddress.city,
        "crtruId": a.resource.assetstore.truID,
        "imagef": imagef,
        "caddress": a.resource.assetstore.companyRegisteredAddress.streetNumber + ", " + a.resource.assetstore.companyRegisteredAddress.city + ", " + a.resource.assetstore.companyRegisteredAddress.state + ", " + a.resource.assetstore.companyRegisteredAddress.country,
        "cemail": a.resource.assetstore.email,
        "clandline": a.resource.assetstore.landLine,
        "cmobile": a.resource.assetstore.mobile,
        "cimage": config.custoUrl + imagef,
        "cpin": a.resource.assetstore.companyRegisteredAddress.pin,
    };
    
    amt = a.resource.totalAmount;
    $("#amt").html(decimalChopper(amt, 2));
    var invoice = {
        "invoice": [
            ins
        ]
    };
    var list = $("#invoicetmp").html();
    var html = Mustache.to_html(list, invoice);
    $(".target-output").html(html);
}
function assetmanagerJsonBulider(a, config) { //  console.log(assetstore);

    // var assetstorejson = localStorages.getItem('assetstore');
    var goldarr = new Array();
    var golds = {};
    var assetstore = a.resource.assetstore;
    var imagef = assetstore.image;
    var lastChar = imagef[imagef.length - 1];
    if (lastChar == "0") {
        imagef = "images/icon/certi.jpg";
    }
    var invoicearr = new Array();
    var fromTruid;
    var g24flag = parseFloat(a.resource.particularsG24.qty);
    var kycdata1 = {}; 
    var kycdata4 = {};
    var txntype, subtotal = 0, totalTax = 0, assayingCharge = 0, subTtotal = 0, buy = false, redeem = false, transfer = false;
    if (a.resource.type == "buy") {
        txntype = "Buy By Unit";
        buy = true;
    } else if (a.resource.type == "buyCash") {
        txntype = "Buy By Cash";
        buy = true;
    } else if (a.resource.type == "redeemCash") {
        txntype = "Sell";
        redeem = true;
    } else if (a.resource.type == "transfer") {
        txntype = "Transfer";
        transfer = true;
    }
    if (g24flag !== 0) {
        golds["g24k"] = decimalChopper(a.resource.particularsG24.qty,  4);
        kycdata1["productname"] = "24K Gold";
        fromTruid = a.resource.particularsG24.from;
        kycdata1["fromTruID"] = a.resource.to;
        kycdata1["qty"] = decimalChopper(a.resource.particularsG24.qty,  4);
        kycdata1["amount"] = decimalChopper(a.resource.particularsG24.amount, 2);
        kycdata1["tamount"] = decimalChopper(parseFloat(a.resource.particularsG24.qty) * parseFloat(a.resource.particularsG24.rate), 2);
        kycdata1["tax"] = decimalChopper(a.resource.particularsG24.tax, 2);
        kycdata1["assetmanagersCharges"] = decimalChopper(a.resource.particularsG24.assetmanagersCharges, 2);
        kycdata1["rate"] = decimalChopper(a.resource.particularsG24.rate, 2);
        kycdata1["subtotal"] = decimalChopper(a.resource.particularsG24.total, 2);
        subtotal += parseFloat(a.resource.particularsG24.amount);
        totalTax += parseFloat(a.resource.particularsG24.tax);
        assayingCharge += parseFloat(a.resource.particularsG24.assetmanagersCharges);
        subTtotal += parseFloat(a.resource.particularsG24.qty) * parseFloat(a.resource.particularsG24.rate);
        invoicearr.push(kycdata1);
    }
 
    // console.log("kycdata3",kycdata3);
    var s99flag = parseFloat(a.resource.particularsS99.qty);
    if (s99flag !== 0) {
        golds["s99p"] = decimalChopper(a.resource.particularsS99.qty,  4);
        var tot = (parseFloat(a.resource.particularsS99.rate) * parseFloat(a.resource.particularsS99.qty)) + parseFloat(a.resource.particularsS99.tax) + parseFloat(a.resource.particularsS99.assetmanagersCharges);
        kycdata4["productname"] = "99% Pure Silver";
        fromTruid = a.resource.particularsS99.from;
        kycdata4["fromTruID"] = a.resource.to;
        kycdata4["qty"] = decimalChopper(a.resource.particularsS99.qty, 4);
        kycdata4["amount"] = decimalChopper(a.resource.particularsS99.amount, 2);
        kycdata4["tamount"] = decimalChopper(parseFloat(a.resource.particularsS99.qty) * parseFloat(a.resource.particularsS99.rate), 2);
        kycdata4["tax"] = decimalChopper(a.resource.particularsS99.tax, 2);
        kycdata4["assetmanagersCharges"] = decimalChopper(a.resource.particularsS99.assetmanagersCharges, 2);
        kycdata4["rate"] = decimalChopper(a.resource.particularsS99.rate, 2);
        kycdata4["subtotal"] = decimalChopper(a.resource.particularsS99.total, 2);
        subtotal += parseFloat(a.resource.particularsS99.amount);
        totalTax += parseFloat(a.resource.particularsS99.tax);
        assayingCharge += parseFloat(a.resource.particularsS99.assetmanagersCharges);
        subTtotal += parseFloat(a.resource.particularsS99.qty) * parseFloat(a.resource.particularsS99.rate);
        invoicearr.push(kycdata4);
    }
    goldarr.push(golds); 
    var list =
    {
        "g24kgold": [kycdata1],
        
        
        "s99": [kycdata4]
    }; 
    var date = new Date(Date.parse(a.resource.createDate));
    var month = Date.parse(date);
    var fdate = _formatDate(date, "time");
    var ins = {
        "orderno": a.resource.invoice,
        "name": a.resource.toAssetManagerName,
        "truID": a.resource.to,
        "orderdate": (fdate) ? fdate : "-",
        "assetstore": assetstore,
        "address": a.resource.toAddress ? a.resource.toAddress.houseNumber + ',' + a.resource.toAddress.landmark + ',' + a.resource.toAddress.streetNumber : '',
        "address1": a.resource.toAddress ? a.resource.toAddress.city + ", " + a.resource.toAddress.state : '',
        "address2": a.resource.toAddress ? a.resource.toAddress.country + ", " + a.resource.toAddress.pin : '',
        "total": decimalChopper(a.resource.totalAmount, 2),
        "subtotal": decimalChopper(subtotal, 2),
        "assayingCharge": decimalChopper(assayingCharge, 2),
        "totalTax": decimalChopper(totalTax, 2),
        "bankTXNID": a.resource.bankTXNID ? a.resource.bankTXNID : "0",
        "payBy": a.resource.payBy ? a.resource.payBy : "Others",
        "paymentCharge": a.resource.paymentCharge ? a.resource.paymentCharge : "0",
        "subTtotal": decimalChopper(subTtotal, 2),
        "golds": goldarr,
        "buy": buy,
        "redeem": redeem, 
        "transfer": transfer,
        "productlist": invoicearr,
        "fromtruid": fromTruid,
        "from": a.resource.fromAssetManagerName,
        "f_address": a.resource.fromAddress ? a.resource.fromAddress.houseNumber + ',' + a.resource.fromAddress.landmark + ',' + a.resource.fromAddress.streetNumber : '',
        "f_address1": a.resource.fromAddress ? a.resource.fromAddress.city + ", " + a.resource.fromAddress.state : '',
        "f_address2": a.resource.fromAddress ? a.resource.fromAddress.country + ", " + a.resource.fromAddress.pin : '',
        "truID": a.resource.to,
        "mop": a.resource.MOP,
        "status": a.resource.status == "success" ? true : false,
        "type": txntype,
        "taxper": "3",
        "assetstorename": assetstore.companyName,
        "cimage": config.custoUrl + imagef,
        "ccity": assetstore.companyRegisteredAddress.city,
        "crtruId": assetstore.truID,
        "image": imagef,
        "caddress": assetstore.companyRegisteredAddress.streetNumber + ", " + assetstore.companyRegisteredAddress.city + ", " + assetstore.companyRegisteredAddress.state + ", " + assetstore.companyRegisteredAddress.country,
        "cemail": assetstore.email,
        "clandline": assetstore.landLine,
        "cmobile": assetstore.mobile,
        "cpin": assetstore.companyRegisteredAddress.pin,

    };  
    amt = a.resource.totalAmount; 
    var invoice = {
        "invoice": [
            ins
        ]
    };
    var list = $("#invoicetmp").html();
    var html = Mustache.to_html(list, invoice);
    $(".target-output").html(html);
}
function createlist(particulars, btype) {
    var kycdata = {};
    kycdata["productname"] = btype;
    kycdata["qty"] = decimalChopper(particulars.qty, 4) + " gm"; 
    kycdata["description"] = decimalChopper(particulars.qty, 4) + " gm of " + btype;
    kycdata["charges"] = decimalChopper(particulars.otherCharges, 2);
    kycdata["rate"] = decimalChopper(particulars.rate, 2);
    return kycdata;
}
function createlistConsumer(particulars, btype, productname) {
    var kycdata = {};
    kycdata["productname"] = productname;
    kycdata["qty"] = decimalChopper(particulars.qty, 4); 
    kycdata["rate"] = decimalChopper(particulars.rate, 2); 
    if (btype == "buyCash") {
        kycdata["subtotal"] = decimalChopper(particulars.total, 2);
        kycdata["tax"] = decimalChopper(particulars.tax, 2);
    } else if (btype == "buy") {
        kycdata["subtotal"] = decimalChopper(particulars.total, 2);
        kycdata["tax"] = decimalChopper(particulars.tax, 2);
    } else if (btype == "redeemCash") {
        kycdata["subtotal"] = decimalChopper(particulars.amount, 2);
        var othercharge = parseFloat(particulars.assetmanagersCharges) + parseFloat(particulars.otherCharges);
        kycdata["tax"] = decimalChopper(othercharge, 2);
    }
    return kycdata;
}
function transferBulider(a, config) {
    var imagef = a.resource.assetstore.image;
    var lastChar = imagef[imagef.length - 1];
    if (lastChar == "0") {
        imagef = "images/icon/certi.jpg";
    }
    var goldarr = new Array();
    var golds = {};
    var invoicearr = new Array();
    var g24flag = parseFloat(a.resource.particularsG24.qty);
    var totQty = 0;
    var name = "";
    if (g24flag != 0) { 
        golds["g24k"] = decimalChopper(a.resource.particularsG24.qty, 4);
        invoicearr.push(createlist(a.resource.particularsG24, "24K Gold"));
        totQty = totQty + (a.resource.particularsG24.qty);
        name = a.resource.particularsG24.from;
    } 
    var s99flag = parseFloat(a.resource.particularsS99.qty);
    if (s99flag != 0) {
        // var tot = (parseFloat(b.S99Rate) * parseFloat(a.resource.particularsS99.qty)) + parseFloat(a.resource.particularsS99.tax) + parseFloat(a.resource.particularsS99.assetmanagersCharges);

        golds["s99p"] = decimalChopper(a.resource.particularsS99.qty, 4);
        totQty = totQty + a.resource.particularsS99.qty;
        invoicearr.push(createlist(a.resource.particularsS99, "99% Silver"));
        name = a.resource.particularsS99.from;
    }
    var date = new Date();
    var $status = a.resource.status;
    goldarr.push(golds);
    var amt = decimalChopper(a.resource.totalAmount, 2);
    var ins = {
        "mop": a.resource.MOP,
        "orderno": a.resource.invoice,
        "ftruid": name,
        "orderdate": date.toLocaleString(),
        "name": a.resource.toAssetManagerName,
        "truID": a.resource.to,
        "from": a.resource.fromAssetManagerName,
        "address": a.resource.toAddress ? a.resource.toAddress.houseNumber + ',' + a.resource.toAddress.landmark + ',' + a.resource.toAddress.streetNumber : '',
        "address1": a.resource.toAddress ? a.resource.toAddress.city + ", " + a.resource.toAddress.state : '',
        "address2": a.resource.toAddress ? a.resource.toAddress.country + ", " + a.resource.toAddress.pin : '',
        // "fcity": a.resource.fromAddress.city,
        // "fcountry": a.resource.fromAddress.country,
        // "fstate": a.resource.fromAddress.state,
        // "fpincode": a.resource.fromAddress.pin,
        // "faddress": a.resource.fromAddress.houseNumber + ',' + a.resource.fromAddress.landmark + ',' + a.resource.fromAddress.streetNumber,
        "f_address": a.resource.fromAddress ? a.resource.fromAddress.houseNumber + ',' + a.resource.fromAddress.landmark + ',' + a.resource.fromAddress.streetNumber : '',
        "f_address1": a.resource.fromAddress ? a.resource.fromAddress.city + ", " + a.resource.fromAddress.state : '',
        "f_address2": a.resource.fromAddress ? a.resource.fromAddress.country + ", " + a.resource.fromAddress.pin : '',
        // "pincode": a.resource.fromAddress.pin,
        "totalqty": (totQty),
        "golds": goldarr,
        "productlist": invoicearr,
        "assetstorename": a.resource.assetstore.companyName,
        "ccity": a.resource.assetstore.companyRegisteredAddress.city,
        "crtruId": a.resource.assetstore.truID,
        "image": imagef,
        "caddress": a.resource.assetstore.companyRegisteredAddress.streetNumber + ", " + a.resource.assetstore.companyRegisteredAddress.city + ", " + a.resource.assetstore.companyRegisteredAddress.state + ", " + a.resource.assetstore.companyRegisteredAddress.country,
        "cemail": a.resource.assetstore.email,
        "clandline": a.resource.assetstore.landLine,
        "cmobile": a.resource.assetstore.mobile,
        "cimage": config.custoUrl + imagef,
        "cpin": a.resource.assetstore.companyRegisteredAddress.pin,
        "totalAmount": amt
    };

    var invoice = {
        "invoice": [
            ins
        ]
    };
    var list = $("#transferReceipt").html();
    var html = Mustache.to_html(list, invoice);
    $(".target-output").html(html);
}
var viewinvoiceConsumerConversion = function (invoiceno, type, custtid, status) {
    var json = {
        "invoice": invoiceno,
        "type": type,
        "reqFlag": "consumer",
    };
    $('#consumerSummLoader').css("display", 'block');
    $.ajax({
        "url": "/consumerDB/getinvoice", "method": "POST", data: json, success: function (a) {
            let data = a.body;
            let config = a.config;
            $('#consumerSummLoader').fadeOut('slow');
            if (data.status == 200) {
                bindConversionConsumerInvoice(data.resource, config);
                $(".target-payment").empty();
                var payFlag = $('#flag').val();

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

var viewConsumertrans = function (invoiceno, type, custtid, status) {
    var json = {
        "type": type,
        "reqFlag": "consumer",
        "invoice": invoiceno
    };
    $('#loader').css("display", 'block');
    $.ajax({
        "url": "/consumerDB/getAssetManagerPaymentInvoice", "method": "POST", data: json, success: function (a) {
            let data = a.body;
            let config = a.config;
            $('#loader').fadeOut('slow');
            if (data.status == 200) {
                if (a.reqFlag == "assetmanager") {
                    assetmanagerJsonBulider(data, config);
                    $(".target-payment").empty();
                    var payFlag = $('#flag').val();

                }
                else {
                    bindConsumertransferinvoice(data.resource, config);
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
                }
                $(".showstock").removeClass("hidden");
                $(".stockList").addClass("hidden");

            } else {
                alertify.logPosition("bottom left");
                alertify.error(data.messege);
            }
        }
    });

}

var bindConsumerinvoice = function (invarr, config) {
    if (invarr.type == "buy" || invarr.type == "buyCash") {
        var targetContainer = $(".target-output"),
            template = $("#consumerBuyInvoice").html();
    } else if (invarr.type == "redeemCash") {
        var targetContainer = $(".target-output"),
            template = $("#consumerRedeemInvoice").html();

    } else {
        var targetContainer = $(".target-output"),
            template = $("#mustacheTempalte_a").html();
    }
    var inv = jsonConsumerBulider(invarr, config);

    var invoice = {
        "invoice": [
            inv
        ]
    };


    //// console.log(invoice);
    var html = Mustache.to_html(template, invoice);

    $(targetContainer).html(html);
} 

var bindConsumertransferinvoice = function (invarr, custoUrl) {
    var targetContainer = $(".target-output"),
        // templateDefined = $(".target-output").data("template-chosen"),
        template = $("#consumerTransferInvoice").html();

    var inv = transferConsumerjsonBuilder(invarr, custoUrl);

    var transinvoice = {
        "transinvoice": [
            inv
        ]
    };

    var html = Mustache.to_html(template, transinvoice);

    $(targetContainer).html(html);
}

function transferConsumerjsonBuilder(a, config) {
    var invoicearr = new Array();
    var goldarr = new Array()
    var golds = {};
    var subtotl = 0;
    if (a.particularsG24) {
        if (a.particularsG24.qty != 0) {
            // from = a.particularsG24.from;
            invoicearr.push(perticularArray(a.particularsG24, a.type, "24K Gold"));
            subtotl = subtotl + parseFloat(a.particularsG24.rate) * parseFloat(a.particularsG24.qty)
            golds["g24k"] = decimalChopper(a.particularsG24.qty, 4);
        }
    } 

    //var s99flag = parseFloat(a.particularsS99.qty);
    if (a.particularsS99) {
        if (a.particularsS99.qty != 0) {
            // from = a.particularsS99.from;
            invoicearr.push(perticularArray(a.particularsS99, a.type, "99% Pure Silver"));
            subtotl = subtotl + parseFloat(a.particularsS99.rate) * parseFloat(a.particularsS99.qty)
            golds["s99p"] = decimalChopper(a.particularsS99.qty, 4);
            // invoicearr.push(kycdata4);
        }
    }

    var custimg, custname, custCity;

    var transstatus, transactiontype;
    $status = a.status;
    if (a.status) {
        if (a.status == "success") {
            transstatus = "Transfered Successful";
            goldarr.push(golds);
            if (a.assetstore) {
                custimg = config.custoUrl + a.assetstore.image;
                // custimg="images/custoImg.png"
                custname = a.assetstore.companyName;
                custCity = a.assetstore.companyRegisteredAddress.city;
            }
        }
        else {
            transstatus = "Transfered Failed";
        }
    }
    if (a.type == "buyCash") {
        transactiontype = "Buy by Cash";
    } else if (a.type == "buyCoin") {
        transactiontype = "Buy by Coin";
    }
    else if (a.type == "transfer") {
        transactiontype = "Transfer";
    }


    var date = new Date(a.createDate);
    var fdate = _formatDate(date, 'time')
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
        "productlist": invoicearr,
        "subtotal": decimalChopper(subtotl, 2),
        "golds": goldarr,
        "transactiontype": transactiontype,
        "MOP": (a.MOP == "truWallet") ? true : false,
        "s_name": a.s_fname + " " + a.s_lname,
        "s_truid": a.s_truID,
        "s_address": a.s_address ? a.s_address.houseNumber + ',' + a.s_address.landmark + ',' + a.s_address.streetNumber : '',
        "s_address1": a.s_address ? a.s_address.city + ", " + a.s_address.state : '',
        "s_address2": a.s_address ? a.s_address.country + ", " + a.s_address.pin : '',
        "custimg": custimg,
        "assetstore": custname,
        "custCity": custCity
    }; 
    return ins;


}

function jsonConsumerBulider(a, config) {

    var invoicearr = new Array();
    var goldarr = new Array();
    var golds = {};
    var from
    var subtotl = 0, taxtotl = 0, SubRtotl = 0;


    if (a.particularsG24) {
        for (var i = 0; i < a.particularsG24.length; i++) {
            if (a.particularsG24[i].qty != 0) {
                from = a.particularsG24[i].fromTruID + " (" + a.particularsG24[i].from + ")";;
                invoicearr.push(perticularArray(a.particularsG24[i], a.type, "24K Gold"));
                subtotl = subtotl + parseFloat(decimalChopper(a.particularsG24[i].amount, 2));
                SubRtotl = SubRtotl + parseFloat(decimalChopper(a.particularsG24[i].total, 2));
                taxtotl = taxtotl + parseFloat(decimalChopper(a.particularsG24[i].tax, 2));
                golds["g24k"] = decimalChopper(a.particularsG24[i].qty, 4);
            }
        }
    } 

    //var s99flag = parseFloat(a.particularsS99[i].qty);
    if (a.particularsS99) {
        for (var i = 0; i < a.particularsS99.length; i++) {
            if (a.particularsS99[i].qty != 0) {
                from = a.particularsS99[i].fromTruID + " (" + a.particularsS99[i].from + ")";;
                invoicearr.push(perticularArray(a.particularsS99[i], a.type, "99% Pure Silver"));
                subtotl = subtotl + parseFloat(decimalChopper(a.particularsS99[i].amount, 2));
                SubRtotl = SubRtotl + parseFloat(decimalChopper(a.particularsS99[i].total, 2));
                taxtotl = taxtotl + parseFloat(decimalChopper(a.particularsS99[i].tax, 2));
                golds["s99p"] = decimalChopper(a.particularsS99[i].qty, 4);
            }
        }
    }

    var custimg, custname, custCity;


    var transstatus, transactiontype;
    $status = a.status;
    if (a.status) {
        if (a.status == "success") {
            transstatus = "Transaction Successful";
            goldarr.push(golds);
            if (a.assetstore) {
                // custimg = a.assetstore.image
                custimg = config.custoUrl + a.assetstore.image;
                // custimg="images/custoImg.png"
                custname = a.assetstore.companyName
                custCity = a.assetstore.companyRegisteredAddress.city
            }
        }
        else {
            transstatus = "Transaction Failed";
        }
    }
    var taxheading, storeName, storeAddress, storeCity, storeState, storeCountry, storePin, storeTruID, storehead = "";
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

    // var date = new Date();
    //  var assetmanagerName=localStorages.getItem('assetmanagerName');
    var date = new Date(a.createDate);
    var fdate = _formatDate(date, 'time')
    var ins = {
        "orderno": a.invoice,
        "to": a.to,
        "status": transstatus,
        "orderdate": fdate,
        "name": a.fName + " " + a.lName,
        "subtotal": decimalChopper(subtotl, 2),
        "SubRtotl": decimalChopper(SubRtotl, 2),
        "taxper": a.applicableTAX ? a.applicableTAX + "%" : "3%",
        "totalTax": decimalChopper(taxtotl, 2),
        "paymentCharge": a.paymentCharge ? a.paymentCharge : "0",
        "taxhead": taxheading,
        "behalfof": a.sourceFlag == "remmit" ? "Partner" : a.sourceFlag.charAt(0).toUpperCase() + a.sourceFlag.slice(1),
        "address": a.address ? a.address.houseNumber + ',' + a.address.landmark + ',' + a.address.streetNumber : '',
        "address1": a.address ? a.address.city + ", " + a.address.state : '',
        "address2": a.address ? a.address.country + ", " + a.address.pin : '',

        "total": decimalChopper(a.totalAmount, 2),
        "productlist": invoicearr,
        "golds": goldarr,
        "dfrom": from,
        "transactiontype": transactiontype,
        "isStatus": a.status == "success" ? true : false,
        "MOP": (a.MOP == "truWallet") ? true : false,
        "dname": from.split('(')[0],
        "custimg": custimg,
        "assetstore": custname,
        "custCity": custCity
    };
    console.log(ins);
    return ins;
} 

function perticularArray(perticulars, type, bulType) {
    var perData = {}
    perData["productname"] = bulType;
    perData["qty"] = decimalChopper(perticulars.qty, 4);
    perData["fromTruID"] = perticulars.fromTruID;
    perData["from"] = perticulars.from;
    perData["amount"] = decimalChopper(perticulars.amount, 2);
    // perData["tax"] = decimalChopper(perticulars.tax, 2);
    // perData["assetmanagersCharges"] = decimalChopper(perticulars.assetmanagersCharges, 2);
    perData["rate"] = decimalChopper(perticulars.rate, 2);
    if (type == "buyCash") {
        perData["qty"] = decimalChopper(perticulars.qty, 4)
        perData["subtotal"] = decimalChopper(perticulars.total, 2);
        perData["tax"] = decimalChopper(perticulars.tax, 2);
    } else if (type == "buy") {
        perData["subtotal"] = decimalChopper(perticulars.total, 2);
        perData["tax"] = decimalChopper(perticulars.tax, 2);
    } else if (type == "redeemCash") {
        // var othercharge = parseFloat(perticulars.assetmanagersCharges) + parseFloat(perticulars.otherCharges);
        perData["subtotal"] = decimalChopper(perticulars.total, 2);
        // perData["subtotal"] = decimalChopper(subTotal.toString(), 2);
        // perData["tax"] = decimalChopper(othercharge, 2);
    }
    else if (type == "transfer") {
        perData["amount"] = decimalChopper(parseFloat(perticulars.rate) * parseFloat(perticulars.qty), 2);
        // var othercharge = parseFloat(perticulars.assetmanagersCharges) + parseFloat(perticulars.otherCharges);
        // perData["other"] = decimalChopper(othercharge, 2);
    }
    return perData;
}
function getTransactiondetails() {
    $('#modal-default').modal('toggle');
}


function roundNumber(number, decimals) {
    var newnumber = new Number(number + '').toFixed(parseInt(decimals));
    return parseFloat(newnumber);
}
var paymentAddMoneyStatus = function (event) {

    $orderID = $(event).attr("data-orderID");
    $invoiceAmount = $(event).attr("data-invoiceAmount");
    $status = $(event).attr("data-status");
    $truID = $(event).attr("data-truID");
    $invoice = $(event).attr("data-invoice");
    paymentStatus($orderID, $invoiceAmount, true, $invoice, $truID, $status)
}


function paymentDetails(data) {
    var invoice = {
        "payInvoice": [
            data
        ]
    };
    var list = $("#payStatus").html();
    var html = Mustache.to_html(list, invoice);
    $(".target-payment").html(html);
}  