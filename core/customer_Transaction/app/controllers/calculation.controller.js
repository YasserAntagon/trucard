'use strict';

var request = require('request'),
    randomize = require('randomatic'),
    conf = require("../conf"),
    Wallet = require('../models/custWalletModel'),
    WalletLog = require("../models/custWalletLogModel"),
    Stock = require('../models/custStockModel'),
    txnStockLog = require('./stock.controller'),
    calculate = require('./calculation.controller'),
    // { trumultiplication } = require('../calculations/mathCalculation.js'),
    reqip = conf.reqip;

var fs = require('fs'),
    path = require('path'),
    defaultConf = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../regionConf.json')));

function createInvoice() {
    var date = new Date(); // today's date and time in ISO format
    var invno = Date.parse(date);
    // var inv = invno.toString();
    var randomstr = randomize('0', 3);
    var randomstr1 = randomize('0', 3);
    var randomstr2 = randomize('0', 4);
    var inv = (invno + parseInt(randomstr)).toString() + randomstr1 + randomstr2;
    return inv;
}


module.exports.Buy_calculation_consumer = function (Gen, amtruid, bulltype, qty) {
    try {
        return new Promise((resolve, reject) => {
            stockvalidationtrans(amtruid, qty, bulltype).then((stockvalbody) => {
                if (stockvalbody.status === "200" && stockvalbody.stockstatus === "resolve") {
                    getrate(amtruid, bulltype, 0).then((body) => {
                        var rate = parseFloat(body.resource);    //included othercharges and assetmanager charges.
                        var grossRate = parseFloat(body.grossRate);
                        var baseRate = parseFloat(body.baseRate);
                        var netrate = rate //+ (grossRate * (clientTxnCharges * 100)) / 100; /// Net Rate with client transaction charges
                        var grossamount = useToFixed(grossRate * qty);  // amount calculated on base rate(gross rate).
                        var grossamountBase = useToFixed(baseRate * qty);  // amount calculated on base rate(gross rate).
                        var amount = useToFixed(netrate * qty);       // amount calculated on net rate which include assetmanager charges and other charges.
                        var dcharges = useToFixed((grossamount * (Gen.assetmanagercharges * 100)) / 100);      //assetmanagersCharges applied on base rate amount.
                        var assetstoreCharges = useToFixed((grossamount * (Gen.assetstoreCharges * 100)) / 100);       //assetstore charges applied on base rate amount.
                        var transactionCharges = useToFixed((grossamountBase * (Gen.transactionCharges * 100)) / 100);       //transaction charges applied on base rate amount.
                        var CLoading = useToFixed((grossamountBase * (Gen.txnLoading * 100)) / 100);       //otherCharges applied on base rate amount.
                        var othercharges = useToFixed(assetstoreCharges + transactionCharges);
                        var tax = useToFixed((amount * (Gen.tax * 100)) / 100);
                        var total = useToFixed(amount + tax);

                        resolve({
                            status: stockvalbody.status,
                            stockstatus: "resolve",
                            TID: randomize('0', 16),
                            from: amtruid,
                            assetmanagerName: body.assetmanagerName,
                            qty: qty,
                            rate: netrate,
                            grossRate: grossRate,
                            grossamount: grossamount,
                            amount: amount,
                            assetmanagersCharges: dcharges,
                            otherCharges: othercharges,
                            assetstoreCharges: assetstoreCharges,
                            transactionCharges: transactionCharges,
                            txnLoading: CLoading,
                            tax: tax,
                            total: total,
                        });
                    })

                } else {
                    resolve({
                        status: stockvalbody.status,
                        stockstatus: stockvalbody.stockstatus
                    });
                }
            });
        });
    }
    catch (ex) {
        console.log(ex)
        return ex;
    }
}

module.exports.transfer_calculation_consumer = function (Gen, countryCode, bulltype, qty, isdeductCharges) {
    try {
        return new Promise((resolve, reject) => {
            getliverate(countryCode).then((body) => {
                if (body.status == "200") {
                    var grossRate, netrate, assetmanagertruid, assetmanagername;
                    if (bulltype === "G24K") {
                        grossRate = parseFloat(body.resource.G24K);
                        netrate = parseFloat(body.resource.netRateG24K);
                        assetmanagertruid = body.resource.amTruID24;
                        assetmanagername = body.resource.amTruID24Name;
                    }
                    else if (bulltype === "S99P") {
                        grossRate = parseFloat(body.resource.S99P);
                        netrate = parseFloat(body.resource.netRateS99P);
                        assetmanagertruid = body.resource.amTruID99;
                        assetmanagername = body.resource.amTruID99Name;
                    }
                    // var grossRate = parseFloat(rate);
                    // var netrate = (grossRate + (((grossRate * (Gen.assetmanagercharges * 100)) / 100) + ((grossRate * (Gen.transactionCharges * 100)) / 100) + ((grossRate * (Gen.assetstoreCharges * 100)) / 100)));//included othercharges and assetmanager charges.
                    var grossamount = useToFixed(grossRate * qty);     // amount calculated on base rate(gross rate).
                    var amount = useToFixed(netrate * qty);       // amount calculated on net rate which include assetmanager charges and other charges.
                    var dcharges = useToFixed((grossamount * (Gen.assetmanagercharges * 100)) / 100);      //assetmanagersCharges applied on base rate amount.
                    var assetstoreCharges = useToFixed((grossamount * (Gen.assetstoreCharges * 100)) / 100);       //otherCharges applied on base rate amount.
                    var transactionCharges = useToFixed((grossamount * (Gen.transactionCharges * 100)) / 100);       //otherCharges applied on base rate amount.
                    var CLoading = useToFixed((grossamount * (Gen.txnLoading * 100)) / 100);       //otherCharges applied on base rate amount.
                    var othercharges = useToFixed(assetstoreCharges + transactionCharges);
                    var transferCharges = useToFixed((amount * (Gen.transferFee * 100)) / 100);       // tax applied on amount included assetmanagercharges and other charges.
                    var tax = useToFixed((transferCharges * (Gen.gstOnTransferFee * 100)) / 100);       // tax applied on amount included assetmanagercharges and other charges.
                    var total = useToFixed(transferCharges + tax);         //subtotal included with all charges & taxes.
                    var stockAgaistTransferCharges = 0
                    if (isdeductCharges) {
                        stockAgaistTransferCharges = ((transferCharges + tax) / netrate);
                    }

                    var arrResolve = {
                        status: "200",
                        stockstatus: "resolve",
                        TID: randomize('0', 16),
                        from: assetmanagertruid,
                        assetmanagerName: assetmanagername,
                        qty: qty,
                        rate: netrate,
                        grossRate: grossRate,
                        grossamount: grossamount,
                        amount: amount,
                        assetmanagersCharges: dcharges,
                        otherCharges: othercharges,
                        assetstoreCharges: assetstoreCharges,
                        transactionCharges: transactionCharges,
                        txnLoading: CLoading,
                        transferFee: transferCharges,
                        qtyAgainstTxnChgs: stockAgaistTransferCharges,
                        tax: tax,
                        total: total
                    }
                    resolve(arrResolve);

                } else {
                    resolve({
                        status: "204",
                        stockstatus: "reject"
                    });
                }

            })
        });
    }
    catch (ex) {
        console.log(ex)
        return ex;
    }
}

module.exports.Redeem_calculation_consumer = function (Gen, amtruid, bulltype, qty, totruid) {
    try {
        return new Promise((resolve, reject) => {
            stockvalidationtransConsumer(totruid, qty, bulltype).then((stockvalbody) => {
                if (stockvalbody.status === "200" && stockvalbody.stockstatus === "resolve") {
                    getsellrate(amtruid, bulltype, 0).then((body) => {
                        var rate = body.resource;
                        var grossRate = parseFloat(rate);     //included othercharges and assetmanager charges.
                        var netrate = parseFloat(rate);
                        var baseRate = parseFloat(body.baseRate);           //this rate includes assetmanager and assetstore charges
                        var grossamount = useToFixed(grossRate * qty);     // amount calculated on base rate(gross rate).     
                        var grossamountBase = useToFixed(baseRate * qty);               //this rate includes assetmanager and assetstore charges             
                        var dcharges = useToFixed((grossamount * (Gen.assetmanagercharges * 100)) / 100);      //assetmanagersCharges applied on base rate amount.
                        var assetstoreCharges = useToFixed((grossamount * (Gen.assetstoreCharges * 100)) / 100);       //otherCharges applied on base rate amount.
                        var transactionCharges = useToFixed((grossamountBase * (Gen.transactionCharges * 100)) / 100);       //otherCharges applied on base rate amount.
                        var CLoading = useToFixed((grossamountBase * (Gen.txnLoading * 100)) / 100);         //otherCharges applied on base rate amount.
                        var othercharges = useToFixed(assetstoreCharges + transactionCharges);
                        var amount = useToFixed(netrate * qty);       // amount calculated on net rate which include assetmanager charges and other charges.    // amount calculated on net rate which include assetmanager charges and other charges.
                        var tax = useToFixed(((transactionCharges + CLoading) * (Gen.sellTax * 100)) / 100);       // tax applied on amount included assetmanagercharges and other charges.
                        var total = useToFixed(grossamountBase - useToFixed(transactionCharges + CLoading + tax), 8);   //subtotal included with all charges & taxes. 

                        resolve({
                            status: stockvalbody.status,
                            stockstatus: "resolve",
                            TID: randomize('0', 16),
                            from: amtruid,
                            assetmanagerName: body.assetmanagerName,
                            qty: qty,
                            rate: netrate,
                            grossRate: grossRate,
                            grossamount: grossamount,
                            amount: amount,
                            assetmanagersCharges: dcharges,
                            otherCharges: othercharges,
                            assetstoreCharges: assetstoreCharges,
                            transactionCharges: transactionCharges,
                            txnLoading: CLoading,
                            tax: tax,
                            total: total,
                        });
                    });

                } else {
                    resolve({
                        status: stockvalbody.status,
                        stockstatus: stockvalbody.stockstatus
                    });
                }
            });
        });
    }
    catch (ex) {
        console.log(ex)
        return ex;
    }
}

module.exports.Buy_calculation_remmit = function (Gen, amtruid, bulltype, qty, etruid) {
    try {
        return new Promise((resolve, reject) => {
            getentityCharges(etruid, "buy").then((charges) => {
                if (charges) {
                    var acharge = charges.isChargesSet ? parseFloat(charges.nodeCharges) : Gen.nodeCharges,
                        pcharge = charges.isChargesSet ? parseFloat(charges.partnerCharges) : Gen.partnerCharges,
                        clientTxnCharges = charges.trasactionCharges ? parseFloat(charges.trasactionCharges) : parseFloat(Gen.txnLoading),
                        tdsCharges = charges.tdsPercentage ? parseFloat(charges.tdsPercentage) : 0,
                        partnercharges, nodecharges;

                    if (charges.isParent) {
                        partnercharges = useToFixed(pcharge + acharge);
                        nodecharges = 0;
                    } else {
                        partnercharges = pcharge;
                        nodecharges = acharge;
                    }

                    stockvalidationtrans(amtruid, qty, bulltype).then((stockvalbody) => {
                        if (stockvalbody.status === "200" && stockvalbody.stockstatus === "resolve") {
                            getrate(amtruid, bulltype, clientTxnCharges).then((body) => {
                                var rate = parseFloat(body.resource);    //included othercharges and assetmanager charges.
                                var grossRate = parseFloat(body.grossRate);
                                var baseRate = parseFloat(body.baseRate);
                                var netrate = rate //+ (grossRate * (clientTxnCharges * 100)) / 100; /// Net Rate with client transaction charges
                                var grossamount = useToFixed(grossRate * qty);  // amount calculated on base rate(gross rate).
                                var grossamountBase = useToFixed(baseRate * qty);  // amount calculated on base rate(gross rate).
                                var amount = useToFixed(netrate * qty);       // amount calculated on net rate which include assetmanager charges and other charges.
                                var dcharges = useToFixed((grossamount * (Gen.assetmanagercharges * 100)) / 100);      //assetmanagersCharges applied on base rate amount.
                                var assetstoreCharges = useToFixed((grossamount * (Gen.assetstoreCharges * 100)) / 100);       //assetstore charges applied on base rate amount.
                                var transactionCharges = useToFixed((grossamountBase * (Gen.transactionCharges * 100)) / 100);       //transaction charges applied on base rate amount.
                                var clientTransactionCharges = useToFixed((grossamountBase * (clientTxnCharges * 100)) / 100);       //clientcharges applied on base rate amount.
                                // var CLoading = 0;       //otherCharges applied on base rate amount.
                                var CLoading = clientTxnCharges === 0 ? useToFixed((grossamountBase * (Gen.txnLoading * 100)) / 100) : 0;
                                var othercharges = useToFixed(assetstoreCharges + transactionCharges);
                                var remmitcharges = useToFixed((amount * (Gen.entitycharges * 100)) / 100);
                                var tax = useToFixed((amount * (Gen.tax * 100)) / 100);

                                var partnercrg = useToFixed((useToFixed(transactionCharges + clientTransactionCharges + CLoading) * (partnercharges * 100)) / 100);   // ******grossCommission
                                var tdspartnercrg = useToFixed((partnercrg * (tdsCharges * 100)) / 100);   //**************Tds charges on commission
                                var netpartnercrg = useToFixed(partnercrg - tdspartnercrg);   //**************netCommssion

                                var nodecrg = useToFixed((useToFixed(transactionCharges + clientTransactionCharges + CLoading) * (nodecharges * 100)) / 100);   //**************otherCharges
                                var tdsnodecrg = useToFixed((nodecrg * (tdsCharges * 100)) / 100);   //**************otherCharges
                                var netnodecrg = useToFixed(nodecrg - tdsnodecrg);   //**************otherCharges

                                // tax applied on amount included assetmanagercharges and other charges.
                                var total = useToFixed(amount + tax + remmitcharges);         //subtotal included with all charges & taxes. 



                                resolve({
                                    status: stockvalbody.status,
                                    stockstatus: "resolve",
                                    TID: randomize('0', 16),
                                    from: amtruid,
                                    assetmanagerName: body.assetmanagerName,
                                    qty: qty,
                                    grossRate: grossRate,
                                    baseRate: baseRate,
                                    rate: netrate,
                                    grossamount: grossamount,
                                    baseamount: grossamountBase,
                                    amount: amount,
                                    assetmanagersCharges: dcharges,
                                    otherCharges: othercharges,
                                    assetstoreCharges: assetstoreCharges,
                                    transactionCharges: transactionCharges,
                                    clientTransactionCharges: clientTransactionCharges,
                                    txnLoading: CLoading,
                                    tdsPercentage: tdsCharges,
                                    loadingPercentage: clientTxnCharges + Gen.transactionCharges,
                                    grosspartnerCharges: partnercrg,
                                    tdsonpartnerCharges: tdspartnercrg,
                                    partnerCharges: netpartnercrg,
                                    grossnodeCharges: nodecrg,
                                    tdsonnodeCharges: tdsnodecrg,
                                    nodeCharges: netnodecrg,
                                    remmitCharges: remmitcharges,
                                    tax: tax,
                                    total: total,
                                });

                            })
                        } else {
                            resolve({
                                status: stockvalbody.status,
                                stockstatus: stockvalbody.stockstatus
                            });
                        }
                    });
                }
            });
        })
    }
    catch (ex) {
        console.log(ex)
        return ex;
    }
}

module.exports.BuyCash_calculation_remmit = function (Gen, amtruid, bulltype, qty, etruid) {
    try {
        return new Promise((resolve, reject) => {
            getentityCharges(etruid, "buy").then((charges) => {
                if (charges) {
                    var acharge = charges.isChargesSet ? parseFloat(charges.nodeCharges) : Gen.nodeCharges,
                        pcharge = charges.isChargesSet ? parseFloat(charges.partnerCharges) : Gen.partnerCharges,
                        clientTxnCharges = charges.trasactionCharges ? parseFloat(charges.trasactionCharges) : parseFloat(Gen.txnLoading),
                        tdsCharges = charges.tdsPercentage ? parseFloat(charges.tdsPercentage) : 0,
                        partnercharges, nodecharges;

                    if (charges.isParent) {
                        partnercharges = useToFixed(pcharge + acharge);
                        nodecharges = 0;
                    } else {
                        partnercharges = pcharge;
                        nodecharges = acharge;
                    }

                    stockvalidationtrans(amtruid, qty, bulltype).then((stockvalbody) => {
                        if (stockvalbody.status === "200" && stockvalbody.stockstatus === "resolve") {
                            getrate(amtruid, bulltype, clientTxnCharges).then((body) => {
                                var rate = parseFloat(body.resource);    //included othercharges and assetmanager charges.                              

                                var grossRate = parseFloat(body.grossRate);
                                var baseRate = parseFloat(body.baseRate);
                                var netrate = rate //+ (grossRate * (clientTxnCharges * 100)) / 100; /// Net Rate with client transaction charges
                                var grossamount = useToFixed(grossRate * qty);  // amount calculated on base rate(gross rate).
                                var grossamountBase = useToFixed(baseRate * qty);  // amount calculated on base rate(gross rate).
                                var amount = useToFixed(netrate * qty);       // amount calculated on net rate which include assetmanager charges and other charges.
                                var dcharges = useToFixed((grossamount * (Gen.assetmanagercharges * 100)) / 100);      //assetmanagersCharges applied on base rate amount.
                                var assetstoreCharges = useToFixed((grossamount * (Gen.assetstoreCharges * 100)) / 100);       //assetstore charges applied on base rate amount.
                                var transactionCharges = useToFixed((grossamountBase * (Gen.transactionCharges * 100)) / 100);       //transaction charges applied on base rate amount.
                                var clientTransactionCharges = useToFixed((grossamountBase * (clientTxnCharges * 100)) / 100);       //clientcharges applied on base rate amount.
                                // var CLoading = 0;                                                                             //otherCharges applied on base rate amount.
                                var CLoading = clientTxnCharges === 0 ? useToFixed((grossamountBase * (Gen.txnLoading * 100)) / 100) : 0;
                                var othercharges = useToFixed(assetstoreCharges + transactionCharges);
                                var remmitcharges = useToFixed((amount * (Gen.entitycharges * 100)) / 100);
                                var tax = useToFixed((amount * (Gen.tax * 100)) / 100);

                                var partnercrg = useToFixed((useToFixed(transactionCharges + clientTransactionCharges + CLoading) * (partnercharges * 100)) / 100);   // ******grossCommission
                                var tdspartnercrg = useToFixed((partnercrg * (tdsCharges * 100)) / 100);   //**************Tds charges on commission
                                var netpartnercrg = useToFixed(partnercrg - tdspartnercrg);   //**************netCommssion

                                var nodecrg = useToFixed((useToFixed(transactionCharges + clientTransactionCharges + CLoading) * (nodecharges * 100)) / 100);   //**************otherCharges
                                var tdsnodecrg = useToFixed((nodecrg * (tdsCharges * 100)) / 100);   //**************otherCharges
                                var netnodecrg = useToFixed(nodecrg - tdsnodecrg);   //**************otherCharges

                                // tax applied on amount included assetmanagercharges and other charges.
                                var total = useToFixed(amount + tax + remmitcharges);         //subtotal included with all charges & taxes. 



                                resolve({
                                    status: stockvalbody.status,
                                    stockstatus: "resolve",
                                    TID: randomize('0', 16),
                                    from: amtruid,
                                    assetmanagerName: body.assetmanagerName,
                                    qty: qty,
                                    grossRate: grossRate,
                                    baseRate: baseRate,
                                    rate: netrate,
                                    grossamount: grossamount,
                                    baseamount: grossamountBase,
                                    amount: amount,
                                    assetmanagersCharges: dcharges,
                                    otherCharges: othercharges,
                                    assetstoreCharges: assetstoreCharges,
                                    transactionCharges: transactionCharges,
                                    clientTransactionCharges: clientTransactionCharges,
                                    txnLoading: CLoading,
                                    tdsPercentage: tdsCharges,
                                    loadingPercentage: clientTxnCharges + Gen.transactionCharges,
                                    grosspartnerCharges: partnercrg,
                                    tdsonpartnerCharges: tdspartnercrg,
                                    partnerCharges: netpartnercrg,
                                    grossnodeCharges: nodecrg,
                                    tdsonnodeCharges: tdsnodecrg,
                                    nodeCharges: netnodecrg,
                                    remmitCharges: remmitcharges,
                                    tax: tax,
                                    total: total,
                                });

                            })
                        } else {
                            resolve({
                                status: stockvalbody.status,
                                stockstatus: stockvalbody.stockstatus
                            });
                        }
                    });
                }
            });
        });
    }
    catch (ex) {
        console.log(ex)
        return ex;
    }
}

module.exports.redeemCash_calculation_remmit = function (Gen, amtruid, bulltype, qty, totruid, etruid) {
    try {
        return new Promise((resolve, reject) => {
            getentityCharges(etruid, "redeemCash").then((charges) => {
                if (charges) {
                    var acharge = charges.isChargesSet ? parseFloat(charges.nodeCharges) : Gen.nodeCharges,
                        pcharge = charges.isChargesSet ? parseFloat(charges.partnerCharges) : Gen.partnerCharges,
                        clientTxnCharges = charges.trasactionCharges ? parseFloat(charges.trasactionCharges) : parseFloat(Gen.txnLoading),
                        tdsCharges = charges.tdsPercentage ? parseFloat(charges.tdsPercentage) : 0,
                        partnercharges, nodecharges;

                    if (charges.isParent) {
                        partnercharges = useToFixed(pcharge + acharge);
                        nodecharges = 0;
                    } else {
                        partnercharges = pcharge;
                        nodecharges = acharge;
                    }

                    stockvalidationtransConsumer(totruid, qty, bulltype).then((stockvalbody) => {
                        if (stockvalbody.status === "200" && stockvalbody.stockstatus === "resolve") {
                            getsellrate(amtruid, bulltype, clientTxnCharges).then((body) => {
                                var rate = body.resource;
                                var assetmanagerBaseRate = parseFloat(body.grossRate);     //included othercharges and assetmanager charges.
                                var grossRate = parseFloat(rate);     //included othercharges and assetmanager charges.
                                var netrate = parseFloat(rate);
                                var baseRate = parseFloat(body.baseRate);           //this rate includes assetmanager and assetstore charges
                                var grossamount = useToFixed(grossRate * qty);     // amount calculated on base rate(gross rate).     
                                var grossamountBase = useToFixed(baseRate * qty);               //this rate includes assetmanager and assetstore charges             
                                var dcharges = useToFixed((grossamount * (Gen.assetmanagercharges * 100)) / 100);      //assetmanagersCharges applied on base rate amount.
                                var assetstoreCharges = useToFixed((grossamount * (Gen.assetstoreCharges * 100)) / 100);       //otherCharges applied on base rate amount.
                                var transactionCharges = useToFixed((grossamountBase * (Gen.transactionCharges * 100)) / 100);       //otherCharges applied on base rate amount.
                                var othercharges = useToFixed(assetstoreCharges + transactionCharges);
                                var amount = useToFixed(netrate * qty);       // amount calculated on net rate which include assetmanager charges and other charges.    // amount calculated on net rate which include assetmanager charges and other charges.
                                var remmitcharges = useToFixed((amount * (Gen.entitycharges * 100)) / 100);
                                var clientTransactionCharges = useToFixed((grossamountBase * (clientTxnCharges * 100)) / 100);       //clientcharges applied on base rate amount.
                                var CLoading = clientTxnCharges === 0 ? useToFixed((grossamountBase * (Gen.txnLoading * 100)) / 100) : 0;//otherCharges applied on base rate amount.
                                var tax = useToFixed(((transactionCharges + clientTransactionCharges + CLoading) * (Gen.sellTax * 100)) / 100);       // tax applied on amount included assetmanagercharges and other charges.

                                // var partnercrg = useToFixed((useToFixed(transactionCharges + clientTransactionCharges + CLoading) * (partnercharges * 100)) / 100);       //**************otherCharges
                                // var nodecrg = useToFixed((useToFixed(transactionCharges + clientTransactionCharges + CLoading) * (nodecharges * 100)) / 100);       //**************otherCharges

                                var partnercrg = useToFixed((useToFixed(transactionCharges + clientTransactionCharges + CLoading) * (partnercharges * 100)) / 100);   // ******grossCommission
                                var tdspartnercrg = useToFixed((partnercrg * (tdsCharges * 100)) / 100);   //**************Tds charges on commission
                                var netpartnercrg = useToFixed(partnercrg - tdspartnercrg);   //**************netCommssion

                                var nodecrg = useToFixed((useToFixed(transactionCharges + clientTransactionCharges + CLoading) * (nodecharges * 100)) / 100);   //**************otherCharges
                                var tdsnodecrg = useToFixed((nodecrg * (tdsCharges * 100)) / 100);   //**************otherCharges
                                var netnodecrg = useToFixed(nodecrg - tdsnodecrg);   //**************otherCharges

                                var total = useToFixed(grossamountBase - useToFixed(transactionCharges + clientTransactionCharges + CLoading + tax + remmitcharges), 8);   //subtotal included with all charges & taxes. 

                                resolve({
                                    status: stockvalbody.status,
                                    stockstatus: "resolve",
                                    TID: randomize('0', 16),
                                    from: amtruid,
                                    assetmanagerName: body.assetmanagerName,
                                    qty: qty,
                                    grossRate: assetmanagerBaseRate,
                                    baseRate: baseRate,
                                    rate: netrate,
                                    grossamount: grossamount,
                                    baseamount: grossamountBase,
                                    amount: amount,
                                    assetmanagersCharges: dcharges,
                                    otherCharges: othercharges,
                                    assetstoreCharges: assetstoreCharges,
                                    transactionCharges: transactionCharges,
                                    clientTransactionCharges: clientTransactionCharges,
                                    txnLoading: CLoading,
                                    tdsPercentage: tdsCharges,
                                    loadingPercentage: clientTxnCharges + Gen.transactionCharges,
                                    grosspartnerCharges: partnercrg,
                                    tdsonpartnerCharges: tdspartnercrg,
                                    partnerCharges: netpartnercrg,
                                    grossnodeCharges: nodecrg,
                                    tdsonnodeCharges: tdsnodecrg,
                                    nodeCharges: netnodecrg,
                                    remmitCharges: remmitcharges,
                                    tax: tax,
                                    total: total,
                                });

                            })
                        } else {
                            resolve({
                                status: stockvalbody.status,
                                stockstatus: stockvalbody.stockstatus
                            });
                        }
                    });
                }
            });
        })

    }
    catch (ex) {
        console.log(ex)
        return ex;
    }
}

module.exports.transfer_calculation_remmit = function (Gen, countryCode, bulltype, qty, etruid) {
    try {
        return new Promise((resolve, reject) => {
            getentityCharges(etruid, "transfer").then((charges) => {
                if (charges) {
                    var acharge = charges.isChargesSet ? parseFloat(charges.nodeCharges) : Gen.nodeCharges,
                        pcharge = charges.isChargesSet ? parseFloat(charges.partnerCharges) : Gen.partnerCharges,
                        clientTxnCharges = charges.trasactionCharges ? parseFloat(charges.trasactionCharges) : 0,
                        tdsCharges = charges.tdsPercentage ? parseFloat(charges.tdsPercentage) : 0,
                        partnercharges, nodecharges;

                    if (charges.isParent) {
                        partnercharges = useToFixed(pcharge + acharge);
                        nodecharges = 0;
                    } else {
                        partnercharges = pcharge;
                        nodecharges = acharge;
                    }
                    getliverate(countryCode, clientTxnCharges).then((body) => {
                        if (body.status == "200") {
                            var grossRate;
                            var baseRate;
                            var netrate, assetmanagertruid, assetmanagername;
                            if (bulltype === "G24K") {
                                grossRate = parseFloat(body.resource.G24K);
                                netrate = parseFloat(body.resource.netRateG24K);
                                baseRate = parseFloat(body.resource.baseRateG24K);
                                assetmanagertruid = body.resource.amTruID24;
                                assetmanagername = body.resource.amTruID24Name;
                            }
                            if (bulltype === "S99P") {
                                grossRate = parseFloat(body.resource.netRateS99P);
                                netrate = parseFloat(body.resource.netRateS99P);
                                baseRate = parseFloat(body.resource.baseRateS99P);
                                assetmanagertruid = body.resource.amTruID99;
                                assetmanagername = body.resource.amTruID99Name;
                            }
                            var grossamount = useToFixed(grossRate * qty);
                            var grossamountBase = useToFixed(baseRate * qty);
                            var amount = useToFixed(netrate * qty);
                            var dcharges = useToFixed(grossamount * Gen.assetmanagercharges);      //assetmanagersCharges applied on base rate amount.
                            var assetstoreCharges = useToFixed(grossamount * Gen.assetstoreCharges);       //otherCharges applied on base rate amount.
                            var transactionCharges = useToFixed(grossamount * Gen.transactionCharges);       //otherCharges applied on base rate amount.
                            var remmitcharges = useToFixed(amount * Gen.entitycharges);
                            var clientTransactionCharges = useToFixed(grossamount * clientTxnCharges);       //clientcharges applied on base rate amount.
                            var CLoading = clientTxnCharges === 0 ? useToFixed((grossamount * (Gen.txnLoading * 100)) / 100) : 0;

                            // var partnercrg = useToFixed(useToFixed(transactionCharges + clientTransactionCharges + CLoading) * partnercharges)//**************otherCharges
                            // var nodecrg = useToFixed(useToFixed(transactionCharges + clientTransactionCharges + CLoading) * nodecharges)//**************otherCharges
                            var transferCharges = useToFixed(amount * Gen.transferFee);

                            var partnercrg = useToFixed((transferCharges * (partnercharges * 100)) / 100);   // ******grossCommission
                            var tdspartnercrg = useToFixed((partnercrg * (tdsCharges * 100)) / 100);   //**************Tds charges on commission
                            var netpartnercrg = useToFixed(partnercrg - tdspartnercrg);   //**************netCommssion

                            var nodecrg = useToFixed((transferCharges * (nodecharges * 100)) / 100);   //**************otherCharges
                            var tdsnodecrg = useToFixed((nodecrg * (tdsCharges * 100)) / 100);   //**************otherCharges
                            var netnodecrg = useToFixed(nodecrg - tdsnodecrg);   //**************otherCharges


                            var othercharges = useToFixed(assetstoreCharges + transactionCharges);
                            // tax applied on amount included assetmanagercharges and other charges.
                            var tax = useToFixed(transferCharges * Gen.gstOnTransferFee);       // tax applied on amount included assetmanagercharges and other charges.
                            var total = useToFixed(transferCharges + tax + remmitcharges);        //subtotal included with all charges & taxes.
                            

                            var arrResolve = {
                                status: "200",
                                stockstatus: "resolve",
                                TID: randomize('0', 16),
                                from: assetmanagertruid,
                                assetmanagerName: assetmanagername,
                                qty: qty,
                                grossRate: grossRate,
                                baseRate: baseRate,
                                rate: netrate,
                                grossamount: grossamount,
                                baseamount: grossamountBase,
                                amount: amount,
                                assetmanagersCharges: dcharges,
                                otherCharges: othercharges,
                                assetstoreCharges: assetstoreCharges,
                                transactionCharges: transactionCharges,
                                clientTransactionCharges: clientTransactionCharges,
                                txnLoading: CLoading,
                                tdsPercentage: tdsCharges,
                                loadingPercentage: clientTxnCharges + Gen.transactionCharges,
                                grosspartnerCharges: partnercrg,
                                tdsonpartnerCharges: tdspartnercrg,
                                partnerCharges: netpartnercrg,
                                grossnodeCharges: nodecrg,
                                tdsonnodeCharges: tdsnodecrg,
                                nodeCharges: netnodecrg,
                                remmitCharges: remmitcharges,
                                transferFee: transferCharges,
                                tax: tax,
                                total: total,
                            }
                            resolve(arrResolve);

                        } else {
                            resolve({
                                status: "204",
                                stockstatus: "reject"
                            });
                        }

                    })
                }
            })
        });
    }
    catch (ex) {
        console.log(ex)
        return ex;
    }
}

module.exports.update_wallet_log = function (totruid, invoice, tav, type) {
    var total, ballog, txntype;
    switch (type) {
        case "buy":
            txntype = "purchase";
            total = useToFixed(parseFloat(tav) * -1)
            ballog = { Dr: total };
            break;
        case "buyCash":
            txntype = "purchase";
            total = useToFixed(parseFloat(tav) * -1)
            ballog = { Dr: total };
            break;
        case "redeemCash":
            txntype = "sell";
            total = parseFloat(tav)
            ballog = { Cr: total };
            break;
        case "transfer":
            txntype = "transfer";
            total = useToFixed(parseFloat(tav) * -1)
            ballog = { Dr: total };
            break;
        default:
    }

    var date = new Date();
    var walletlog = new WalletLog();

    var parmsg = "Amount of " + defaultConf.defaultCurrency + " " + Math.abs((ballog.Cr !== 0 && ballog.Cr) ? ballog.Cr : ballog.Dr) + " paid from wallet for bullion " + txntype;    
    walletlog.truID = totruid;
    walletlog.Cr = ballog.Cr ? ballog.Cr : "0";
    walletlog.Dr = ballog.Dr ? ballog.Dr : "0";
    if (type == "cashback") {
        walletlog.invoice = createInvoice();
        walletlog.againstInvoice = invoice;
    } else {
        walletlog.invoice = invoice;
    }
    walletlog.tType = type;
    walletlog.createDate = date;
    walletlog.particulars = parmsg;
    walletlog.status = "success"


    WalletLog.find({ invoice: invoice }, function (err, docs) {
        if (!docs.length) {
            walletlog.save(function (err) {
                if (err) {
                    console.log(err)
                    res.json({ status: "204", message: 'Fields with * required' });

                }
            });
        }
        else {
            res.json({ status: "204", message: 'This Invoice Already Exists' });
        }
    }
    )
}


module.exports.update_stock = async function (totruid, tqty24, tqty99, type, invoice, subtype) {
    var qty24, qty99 ;
    // console.log(tqty24, tqty22, tqty18, tqty99, subtype)
    var txntype = type
    if (type == "transferer" || type == "receiver") {
        txntype = "transfer";
    }
    if (tqty24.toString() != "0") {
        await getstocklogArr(totruid, type, tqty24, invoice, "G24K", txntype);
    }
    if (tqty99.toString() != "0") {
        await getstocklogArr(totruid, type, tqty99, invoice, "S99P", txntype);
    }

    function getstocklogArr(truid, tType, Qty, invoice, bullionType, txnType) {
        return new Promise(async (resolve, reject) => {
            var stocklog = {
                "truid": truid,
                "tType": txnType,
                "Qty": Qty,
                "invoice": invoice,
                "bullionType": bullionType,
                "isReceived": (txnType == "transfer") ? tType == "transferer" ? false : true : undefined,
                "status": "success"
            }
            await txnStockLog.txn_stocklogs(stocklog);
            resolve();
        })
    }

    switch (type) {
        case "buy":
            qty24 = parseFloat(tqty24);
            qty99 = parseFloat(tqty99);
            break;
        case "buyCash":
            qty24 = parseFloat(tqty24);
            qty99 = parseFloat(tqty99);
            break;
        case "redeemCash":
            qty24 = parseFloat(tqty24) * -1;
            qty99 = parseFloat(tqty99) * -1;
            break;
      
        case "transferer":
            qty24 = parseFloat(tqty24) * -1;
            qty99 = parseFloat(tqty99) * -1;
            break;
        case "receiver":
            qty24 = parseFloat(tqty24);
            qty99 = parseFloat(tqty99);
            break;
        case "reversal":
            qty24 = parseFloat(tqty24);
            qty99 = parseFloat(tqty99);
       
            break;
        default:
    }

   
    var incquery = {};
    if (!isNaN(qty24) && qty24 !== -0) {
        incquery["stock.G24K"] = qty24;
    }
    if (!isNaN(qty99) && qty99 !== -0) {
        incquery["stock.S99P"] = qty99;
    }
    Stock.findOneAndUpdate({ truID: totruid }, {
        $inc: incquery,
    }).exec(function (err, result) {
        if (err) {
            console.log(err)
        }
    })

}


module.exports.update_assetmanager_stock = function (truid, totruid, bulliontype, tqty, txnType, invoice) {
    request.post({
        "headers": { "content-type": "application/json" },
        "url": reqip + ":4125/api/updatestockqtybuy",
        "body": JSON.stringify({
            "truid": truid,
            "totruid": totruid,
            "qty": parseFloat(tqty),
            "bulliontype": bulliontype,
            "txnType": txnType,
            "invoice": invoice
        })
    }, (error, response, body) => {
        if (error) {
            return console.dir(error);
        }
    })
}


module.exports.update_wallet = function (totruid, invoice, tav, type) {
    var total, ballog;
    switch (type) {
        case "buy":
            total = useToFixed(parseFloat(tav) * -1);
            ballog = { Dr: total };
            break;
        case "buyCash":
            total = useToFixed(parseFloat(tav) * -1);
            ballog = { Dr: total };
            break;
        case "redeemCash":
            total = parseFloat(tav)
            ballog = { Cr: total };
            break;
        case "transfer":
            total = useToFixed(parseFloat(tav) * -1);
            ballog = { Dr: total };
            break;
        case "gift":
            total = useToFixed(parseFloat(tav) * -1);
            ballog = { Dr: total };
            break;
        
    }
    Wallet.findOneAndUpdate({
        truID: totruid
    }, {
        $inc: {
            "clBal": total
        },
        $set: ballog
    }, {
        upsert: true
    }).exec(function (err, result) {
        if (err) {
            console.log(err)
        }
        else {
            calculate.update_wallet_log(totruid, invoice, tav, type);
        }
    }
    )
}

module.exports.getratebuyCash = function (arr) {
    return new Promise((resolve, reject) => {
        request.post({
            "headers": { "content-type": "application/json" },
            "url": reqip + ":4125/api/listrateforcustbuycash",
            "body": JSON.stringify({
                "truid24": arr.fromtruid24 !== undefined ? arr.fromtruid24 : "0",
                "truid99": arr.fromtruid99 !== undefined ? arr.fromtruid99 : "0",
                "truid22": "0", "truid18": "0"
            })
        }, (error, response, body) => {
            if (error) {
                return console.dir(error);
            }
            else {
                var result = JSON.parse(body);
                if (result.status == "200") {
                    var g24rate = !isNaN(parseFloat(result.resource.G24K)) ? parseFloat(result.resource.G24K) : 0;
                    var s99rate = !isNaN(parseFloat(result.resource.S99P)) ? parseFloat(result.resource.S99P) : 0;

                    var a24 = (arr.g24amt !== undefined || !isNaN(parseFloat(arr.g24amt))) ? parseFloat(arr.g24amt) : 0,
                        a99 = (arr.s99amt !== undefined || !isNaN(parseFloat(arr.s99amt))) ? parseFloat(arr.s99amt) : 0;

                    var finala24 = (a24 != 0) ? ((a24 * 100) / (100 + (parseFloat(arr.gst) * 100))) : 0,
                        finala99 = (a99 != 0) ? ((a99 * 100) / (100 + (parseFloat(arr.gst) * 100))) : 0;

                    var s24 = (finala24 != 0 && g24rate != 0) ? finala24 / g24rate : 0,
                        s99 = (finala99 != 0 && s99rate != 0) ? finala99 / s99rate : 0;

                    resolve({ s24: s24, s22: 0, s18: 0, s99: s99 });
                } else {
                    resolve({ s24: 0, s22: 0, s18: 0, s99: 0, })
                }
            }
        });
    });
}

function stockvalidationtransConsumer(totruid, qty, bulltype) {
    return new Promise((resolve, reject) => {
        request.post({
            "headers": {
                "content-type": "application/json"
            },
            "url": reqip + ":4114/api/validatestocktrans",
            "body": JSON.stringify({
                "truid": totruid,
                "qty": qty,
                "bulltype": bulltype
            })
        }, (error, response, stockvalbody) => {
            if (error) {
                return console.dir(error);
            } else {
                resolve(JSON.parse(stockvalbody));
            }
        })
    })
}


function stockvalidationtrans(fromtruid, qty, bulltype) {
    return new Promise((resolve, reject) => {
        request.post({
            "headers": {
                "content-type": "application/json"
            },
            "url": reqip + ":4125/api/validatestocktrans",
            "body": JSON.stringify({
                "truid": fromtruid,
                "qty": qty,
                "bulltype": bulltype
            })
        }, (error, response, stockvalbody) => {
            if (error) {
                return console.dir(error);
            } else {
                resolve(JSON.parse(stockvalbody));
            }
        }
        )
    }
    )
}

function getrate(fromtruid, bulltype, clientCharges) {
    return new Promise((resolve, reject) => {
        request.post({
            "headers": { "content-type": "application/json" },
            "url": reqip + ":4125/api/listratecustbuybullions",
            "body": JSON.stringify({
                "truid": fromtruid,
                "bulltype": bulltype,
                "clientcharges": clientCharges ? clientCharges : "0"
            })
        }, (error, response, body) => {
            if (error) {
                return console.dir(error);
            }
            else {
                resolve(JSON.parse(body));
            }
        })
    })
}



function getliverate(countrycode, clientCharges) {
    return new Promise((resolve, reject) => {
        request.post({
            "headers": { "content-type": "application/json" },
            "url": reqip + ":4125/api/liveratefortxn",
            "body": JSON.stringify({
                "countrycode": countrycode,
                "clientcharges": clientCharges ? clientCharges : "0"
            })
        }, (error, response, body) => {
            if (error) {
                return console.dir(error);
            } else {
                var newjson = JSON.parse(body);
                resolve(newjson);
            }
        });
    })
}

function getsellrate(fromtruid, bulltype, clientCharges) {
    return new Promise((resolve, reject) => {
        request.post({
            "headers": { "content-type": "application/json" },
            "url": reqip + ":4125/api/listratecustredeemcashbullions",
            "body": JSON.stringify({
                "truid": fromtruid,
                "bulltype": bulltype,
                "clientcharges": clientCharges
            })
        }, (error, response, body) => {
            if (error) {
                return console.dir(error);
            }
            else {

                resolve(JSON.parse(body));
            }
        })
    })
}

function getentityCharges(etruid, type) {
    return new Promise((resolve, reject) => {
        request.post({
            "headers": { "content-type": "application/json" },
            "url": reqip + ":4121/api/entityRevenuechargesHistory",
            "body": JSON.stringify({
                "truid": etruid,
                "type": type
            })
        }, (error, response, body) => {
            if (error) {
                return console.dir(error);
            }
            else {
                var charges = JSON.parse(body).resource.length !== 0 ? JSON.parse(body).resource : [{ isParent: JSON.parse(body).isParent }];
                JSON.parse(body).resource.length !== 0 ? charges[0].isParent = JSON.parse(body).isParent : "";
                resolve(charges[0]);
            }
        })
    })
}


