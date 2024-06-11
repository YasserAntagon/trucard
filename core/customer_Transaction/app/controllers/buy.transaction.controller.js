
'use strict'

var randomize = require('randomatic'),
    request = require('request'),
    fs = require('fs'),
    path = require('path'),
    md5 = require('md5'),
    KycAll = require('../models/custKYCAllModel'),
    enKycAll = require('../models/remmitKYCAllModel'),
    Mop = require('../models/custMOPModel'),
    Accounts = require('../models/accModel'),
    Wallet = require('../models/custWalletModel'),
    TXN = require('../models/custTXNModel'),
    Atom = require("../models/custAtomModel"),
    WalletLog = require("../models/custWalletLogModel"),
    conf = require("../conf"),
    MAIL = require("../controllers/email.controller"),
    ConsumerConfig = require('../consumerConfig/validate.limit.controller'),
    defaultConf = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../regionConf.json'))),
    bankApi = require('./bank.controller'),
    calculate = require('./calculation.controller'),
    { encryption } = require('./encrypt'),
    { initiateEntityRevenueRefund } = require('./partnerRevenue'),
    reqip = conf.reqip;

const accessarray = ["disable", "hide"];


function decimalChopper(num, fixed) {
    var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?');
    return num.toString().match(re)[0];
}

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

function validatePaymodes(mop, walletaccess, paymentmodeaccess) {
    let accessarray = ["disable", "hide"];
    if (mop === "truWallet" && walletaccess && paymentmodeaccess && (accessarray.includes(walletaccess) || accessarray.includes(paymentmodeaccess))) {
        return ("Your payment mode and wallet access are disabled. Please contact your Administrator.");
    } else {
        return (200)
    }
}

exports.top_assetmanagers = function (req, res) {
    var truid = req.body.truid;
    var assetmanagersearch = req.body.assetmanagersearch;
    var type = (assetmanagersearch == "purchase" || assetmanagersearch == "liveRate") ? ["buy"] : (assetmanagersearch == "redeem") ? ["redeemCash"] : (assetmanagersearch == "liveRateBoth") ? ["buy", "redeemCash"] : assetmanagersearch;
    KycAll.find({
        "truID": truid
    }, function (err, docs) {
        if (!docs.length) {
            res.json({ status: "204", message: "The request was successful but no body was returned." });
        } else {
            var city = docs[0].city;
            var state = docs[0].state;
            var country = docs[0].country;
            var countrycode = docs[0].countryCode;
            var clientTxnCharges = 0;

            if (docs[0].refernceTruID !== "Company" && docs[0].refernceTruID.substring(0, 4) === "8000") {
                enKycAll.aggregate([
                    { $match: { truID: docs[0].refernceTruID, KYCFlag: "active" } },
                    { $project: { _id: 0, truID: 1, CRNNo: 1, isParent: 1, parentTruID: 1, MID: 1, companyName: 1, address: 1, countryCode: 1 } },
                    { $unwind: { path: "$address", preserveNullAndEmptyArrays: true } },
                    {
                        $project: {
                            truID: 1, CRNNo: 1, isParent: 1, parentTruID: 1, MID: 1, companyName: 1,
                            city: "$address.city", state: "$address.state",
                            country: "$address.country", countryCode: 1
                        }
                    },
                    {
                        $lookup: {
                            from: "charges",
                            localField: "parentTruID",
                            foreignField: "truID",
                            as: "partnerCharges"
                        }
                    },
                    {
                        $lookup: {
                            from: "charges",
                            localField: "truID",
                            foreignField: "truID",
                            as: "nodeCharges"
                        }
                    },
                    {
                        $project: {
                            _id: 0, truID: 1, CRNNo: 1, isParent: 1, parentTruID: 1, MID: 1, companyName: 1, city: 1, state: 1, country: 1, countryCode: 1,
                            "charges": {
                                $cond: {
                                    if: {
                                        $eq: [{
                                            $anyElementTrue: [{
                                                $filter: {
                                                    input: "$nodeCharges",
                                                    as: "trArr",
                                                    cond: { $and: [{ $eq: ["$$trArr.isChargesSet", true] }, { $in: ["$$trArr.type", type] }, { $eq: ["$$trArr.appliedOn", "consumer"] }] }
                                                }
                                            },]
                                        }, true]
                                    }, then: "$nodeCharges", else: "$partnerCharges"
                                }
                            }
                        }
                    },
                    {
                        $project: {
                            _id: 0, truID: 1, CRNNo: 1, isParent: 1, parentTruID: 1, MID: 1, companyName: 1, city: 1, state: 1, country: 1, countryCode: 1,
                            "charges": {
                                $filter: {
                                    input: "$charges",
                                    as: "chrg",
                                    cond: { $and: [{ $eq: ["$$chrg.isChargesSet", true] }, { $eq: ["$$chrg.type", "common"] }, { $eq: ["$$chrg.appliedOn", "consumer"] }] }
                                }
                            },
                            "targetArrold": {
                                $filter: {
                                    input: "$charges",
                                    as: "chrg",
                                    cond: { $and: [{ $eq: ["$$chrg.isChargesSet", true] }, { $in: ["$$chrg.type", type] }, { $eq: ["$$chrg.appliedOn", "consumer"] }] }
                                }
                            }
                        }
                    },
                    {
                        $project: {
                            _id: 0, truID: 1, CRNNo: 1, isParent: 1, parentTruID: 1, MID: 1, companyName: 1, city: 1, state: 1, country: 1, countryCode: 1,
                            "charges": {
                                $cond: {
                                    if: {
                                        $eq: [{
                                            "$size": { "$ifNull": ["$targetArrold", []] }
                                        }, 0]
                                    }, then: "$charges", else: "$targetArrold"
                                }
                            }
                        }
                    },
                    { $unwind: { path: "$charges", preserveNullAndEmptyArrays: true } },
                ]).exec(function (err, result) {
                    if (err) {
                        response.status(500).send({ error: err })
                        return next(err);
                    }
                    else {
                        if (assetmanagersearch === "liveRateBoth") {
                            if (result.length) {
                                clientTxnCharges = {};
                                result.forEach(element => {
                                    if (element.charges && element.charges.type === "buy") {
                                        clientTxnCharges.buyCharges = parseFloat(element.charges.trasactionCharges);
                                    } else if (element.charges && element.charges.type === "redeemCash") {
                                        clientTxnCharges.sellCharges = parseFloat(element.charges.trasactionCharges);
                                    }
                                });
                            }

                        } else {
                            clientTxnCharges = result.length ? result[0].charges ? result[0].charges.trasactionCharges ? parseFloat(result[0].charges.trasactionCharges) : 0 : 0 : 0;
                        }
                        getRates(assetmanagersearch, city, country, countrycode, clientTxnCharges);
                    }
                });
            } else {
                clientTxnCharges = 0;
                getRates(assetmanagersearch, city, country, countrycode, clientTxnCharges);
            }
            function getRates(assetmanagersearch, city, country, countrycode, clientTxnCharges) {
                // console.log(assetmanagersearch, city, country, countrycode, clientTxnCharges)
                if (assetmanagersearch == "purchase") {
                    request.post({
                        "headers": { "content-type": "application/json" },
                        "url": reqip + ":4125/api/topbuyerassetmanager",
                        "body": JSON.stringify({
                            "city": city,
                            "country": country,
                            "countrycode": countrycode,
                            "clientTxnLoading": clientTxnCharges

                        })
                    }, (error, response, body) => {
                        if (error) {
                            return console.dir(error);
                        }
                        var newjson = JSON.parse(body);
                        res.json(newjson);
                    });
                } else if (assetmanagersearch == "liveRate") {
                    // console.log("readliveratefromassetmanager ", clientTxnCharges)
                    request.post({
                        "headers": { "content-type": "application/json" },
                        "url": reqip + ":4125/api/readliveratefromassetmanager",
                        "body": JSON.stringify({
                            "city": city,
                            "country": country,
                            "countrycode": countrycode,
                            "clientTxnLoading": clientTxnCharges

                        })
                    }, (error, response, body) => {
                        if (error) {
                            return console.dir(error);
                        }
                        var newjson = JSON.parse(body);
                        res.json(newjson);
                    });
                } else if (assetmanagersearch == "liveRateBoth") {
                    request.post({
                        "headers": { "content-type": "application/json" },
                        "url": reqip + ":4125/api/readliveBuySellrate",
                        "body": JSON.stringify({
                            "truID": defaultConf.currentassetmanager,
                            "allCharges": clientTxnCharges
                        })
                    }, (error, response, body) => {
                        if (error) {
                            return console.dir(error);
                        }
                        var newjson = JSON.parse(body);
                        res.json(newjson);
                    });
                }
                else if (assetmanagersearch == "redeem") {
                    request.post({
                        "headers": { "content-type": "application/json" },
                        "url": reqip + ":4125/api/topsaleassetmanager",
                        "body": JSON.stringify({
                            "city": city,
                            "country": country,
                            "countrycode": countrycode,
                            "clientTxnLoading": clientTxnCharges,
                            "flag": req.body.assetmanagersearch
                        })
                    }, (error, response, body) => {
                        if (error) {
                            return console.dir(error);
                        }
                        var newjson = JSON.parse(body);
                        res.json(newjson);
                    });
                }
                else {
                    res.json({ status: "204", messgae: "you are searching for wrong transaction" });
                }
            }
        }
    })
};


exports.buy_bullions_multiple_assetmanagers = function (req, res) {
    let Gen = req.generalCharges,
        s24 = req.body.G24K,
        s99 = req.body.S99P,

        totruid = req.body.totruid,
        status = req.body.status,
        ctruid;

    KycAll.find({
        "truID": totruid, KYCFlag: "active"
    }, function (err, docs) {
        if (!docs.length) {
            res.json({
                status: "204",
                message: "The request was successful but no body was returned."
            });
        } else {
            let particularsG24 = new Array(),
                particularsS99 = new Array(),
                stockNA = new Array(),
                qtyNA = new Array(),
                inputNA = new Array(),
                totaladd = 0,
                referenceTruID = docs[0].refernceTruID,
                date = new Date(); // today's date and time in ISO format

            var walletaccess = req.ConsumerConf.resource.module.walletAccess;
            var paymentmodeaccess = req.ConsumerConf.resource.module.payByWallet


            if (req.body.transactiontype != "buy") {
                res.json({ status: "204", message: "The transaction type must be 'BUY'" })
            } else {
                var respvalpaymodes = validatePaymodes(req.body.mop, walletaccess, paymentmodeaccess);
                if (respvalpaymodes === 200) {
                    if (s24.length == 0 && s99.length == 0) { res.json({ status: "204", message: "No bullions selected." }) }
                    else if (s24.length != 0 || s99.length != 0) {
                        let bull, bulltype, arr = new Array();
                        function fromServer(i, bull, bulltype, arr, etruid) {
                            return new Promise((resolve, reject) => {
                                if (bull.length != 0) {
                                    if (bull[i].assetmanagerName && bull[i].qty && bull[i].amTruID) {
                                        // console.log(bulltype);
                                        let amtruid = bull[i].amTruID,
                                            sqty = bull[i].qty,
                                            id = bull[i].id,
                                            particulsStockNA = {};

                                        async function generateParticular(Gen, amtruid, bulltype, sqty) {
                                            if (etruid !== "Company" && etruid.substring(0, 4) === "8000") {
                                                var fcrgs = await calculate.Buy_calculation_remmit(Gen, amtruid, bulltype, sqty, etruid);
                                            } else {
                                                var fcrgs = await calculate.Buy_calculation_consumer(Gen, amtruid, bulltype, sqty);
                                            }
                                            if (fcrgs.status === "200" && fcrgs.stockstatus === "resolve") {
                                                totaladd += fcrgs.total;
                                                resolve(arr.push(particularsArr(fcrgs)));
                                            } else {
                                                particulsStockNA = bull[i];
                                                particulsStockNA["bullionType"] = bulltype;
                                                resolve(stockNA.push(particulsStockNA));
                                            }
                                        }
                                        generateParticular(Gen, amtruid, bulltype, sqty);

                                    } else {
                                        var particuls = {};
                                        particuls = bull[i];
                                        particuls["bullionType"] = bulltype;
                                        resolve(inputNA.push(particuls));
                                    }

                                    // }
                                }
                                else {
                                    resolve(arr.push(particularsArr()));
                                }
                            }
                            )
                        }

                        async function forLoopBuy() {
                            if (s24.length) {
                                for (var i = 0; i < s24.length; i++) {
                                    await fromServer(i, s24, "G24K", particularsG24, referenceTruID);
                                }
                            }
                            else {
                                await fromServer(i, s24, "G24K", particularsG24, referenceTruID);
                            }
                            if (s99.length) {
                                for (var i = 0; i < s99.length; i++) {
                                    await fromServer(i, s99, "S99P", particularsS99, referenceTruID);
                                }
                            } else {
                                await fromServer(i, s99, "S99P", particularsS99, referenceTruID);
                            }

                            let invoice;
                            let mop;
                            // var type = req.body.transactiontype;

                            if (inputNA.length) {
                                res.json({ status: "204", message: "Invalid input.", inputNA: inputNA })
                            } else if (qtyNA.length) {
                                res.json({ status: "204", message: "Please select Quantity between 0.1 && 100 each bullion.", qtyNA: qtyNA })
                            } else if (stockNA.length) {
                                res.json({ status: "204", message: "Stock not available.", stockNA: stockNA })
                            } else if (status === "failure") {
                                // var invoiceno = Date.parse(date);
                                invoice = createInvoice();
                                mop = "other";
                                //limit callback
                                /* ConsumerConfig.checkTXNLimit(totruid, totaladd, function (limitcb) {
                                    if (limitcb === "200") {
                                        
                                    }
                                    else if (limitcb === "500") {
                                        res.json({ status: "204", message: "You have exceeded your transaction limit! Please verify your KYC for unlimited access." });
                                    } else {
                                        res.json({ status: "204", message: "Something went wrong, Please try again!" });
                                    }
                                }) */
                                var md5hash = invoice + totruid + "success" + req.body.transactiontype;
                                var insTxn = {
                                    to: totruid, invoice: invoice, type: "buy", sourceFlag: "customer",
                                    particularsG24: particularsG24[0],
                                    particularsS99: particularsS99[0],
                                    tdsPercentage: particularsG24[0].tdsPercentage > 0 ? particularsG24[0].tdsPercentage : particularsS99[0].tdsPercentage,
                                    loadingPercentage: particularsG24[0].loadingPercentage > 0 ? particularsG24[0].loadingPercentage : particularsS99[0].loadingPercentage,
                                    totalAmount: totaladd, createDate: date, status: status, md5sign: md5(md5hash), MOP: mop
                                }
                                if (referenceTruID !== "Company" || referenceTruID.substring(0, 4) === "8000") {
                                    insTxn.rTruID = referenceTruID
                                }
                                var insertTXN = new TXN(insTxn);
                                insertTXN.save(function (err) {
                                    if (err) {
                                        res.json({ status: "500", message: "Internal server error" });
                                    } else {
                                        rescallback(invoice);
                                    }
                                })
                            }

                            else if (status === "success") {
                                invoice = req.body.invoice;
                                mop = req.body.mop;
                                var md5hash = invoice + totruid + req.body.status + req.body.transactiontype;
                                TXN.find({
                                    "invoice": invoice, "to": totruid,
                                    "md5sign": md5(md5hash), "status": "failure"
                                }, function (err, docs) {
                                    if (!docs.length) {
                                        res.json({
                                            status: "204",
                                            message: "Please Enter Correct invoice number."
                                        });
                                    } else {
                                        var totaladd = parseFloat(docs[0].totalAmount.toJSON().$numberDecimal);
                                        var qty24 = parseFloat(0),
                                            qty99 = parseFloat(0);

                                        for (var i = 0; i < particularsG24.length; i++) {
                                            qty24 += (qty24 + parseFloat(particularsG24[i].qty));
                                        }

                                        for (var i = 0; i < particularsS99.length; i++) {
                                            qty99 += (qty99 + parseFloat(particularsS99[i].qty));
                                        }
                                        var tocrypt = {
                                            to: totruid, invoice: invoice, type: "buy", sourceFlag: "customer",
                                            particularsG24: particularsG24, particularsS99: particularsS99,
                                            totalAmount: totaladd, createDate: date, status: status, MOP: mop
                                        };
                                        var rational = JSON.stringify(tocrypt);
                                        var crypted = encryption(rational);

                                        if (mop != "truWallet" && mop != "others" && mop != "offline") {
                                            res.json({
                                                status: "204",
                                                message: "Please provide valid method of payment."
                                            });
                                        }
                                        else if (mop === "truWallet") {
                                            var totaladd = parseFloat(docs[0].totalAmount.toJSON().$numberDecimal);
                                            Wallet.aggregate([{
                                                $match: { truID: totruid }
                                            }, {
                                                $project: {
                                                    _id: 0, wstatus: {
                                                        $cond: {
                                                            if: {
                                                                $and: [{
                                                                    $gte: ["$clBal", totaladd]
                                                                }, {
                                                                    $gte: ["$clBal", 0]
                                                                }]
                                                            },
                                                            then: "200",
                                                            else: "401"
                                                        }
                                                    }
                                                }
                                            }
                                            ]).exec(function (err, result) {
                                                if (err) {
                                                    response.status(500).send({
                                                        error: err
                                                    })
                                                    return next(err);
                                                } else {
                                                    var resource = result[0];
                                                    var wstatus = resource.wstatus;
                                                    if (wstatus == "401") {
                                                        res.json({
                                                            status: "401",
                                                            message: "Insufficient wallet balance"
                                                        })
                                                    } else {
                                                        calculate.update_wallet(totruid, req.body.invoice, totaladd, "buy");
                                                        calculate.update_stock(totruid, qty24, qty99, "buy", req.body.invoice);

                                                        for (var i = 0; i < particularsG24.length; i++) {
                                                            var truid = particularsG24[i].from;
                                                            var bulliontype = "G24K";
                                                            var qty = parseFloat(particularsG24[i].qty)
                                                            if (qty != 0 && qty > 0) {
                                                                calculate.update_assetmanager_stock(truid, totruid, bulliontype, qty, "buy", req.body.invoice);
                                                            }
                                                        }



                                                        for (var i = 0; i < particularsS99.length; i++) {
                                                            var truid = particularsS99[i].from;
                                                            var bulliontype = "S99P";
                                                            var qty = parseFloat(particularsS99[i].qty)
                                                            if (qty != 0 && qty > 0) {
                                                                calculate.update_assetmanager_stock(truid, totruid, bulliontype, qty, "buy", req.body.invoice);
                                                            }
                                                        }

                                                        TXN.updateOne({
                                                            "invoice": invoice
                                                        }, {
                                                            $set: {
                                                                to: totruid, invoice: invoice, type: "buy", sourceFlag: "customer",
                                                                particularsG24: particularsG24[0],
                                                                particularsS99: particularsS99[0],
                                                                totalAmount: totaladd,
                                                                createDate: date,
                                                                status: status,
                                                                MOP: mop,
                                                                hash: crypted
                                                            }
                                                        }, function (err) {
                                                            if (err) {
                                                                res.json({ status: "500", message: "Internal server error" });
                                                            } else {
                                                                rescallback(invoice);
                                                            }
                                                        });
                                                    }
                                                }
                                            })
                                        }

                                        else if (mop === "others") {
                                            if (req.body.astatus === "Ok" || req.body.astatus === "success_00") {
                                                var totaladd = parseFloat(docs[0].totalAmount.toJSON().$numberDecimal);
                                                calculate.update_stock(totruid, qty24, qty99, "buy", invoice);
                                                for (var i = 0; i < particularsG24.length; i++) {
                                                    var truid = particularsG24[i].from;
                                                    var bulliontype = "G24K";
                                                    var qty = parseFloat(particularsG24[i].qty)
                                                    if (qty != 0 && qty > 0) {
                                                        calculate.update_assetmanager_stock(truid, totruid, bulliontype, qty, "buy", invoice);
                                                    }
                                                }

                                                for (var i = 0; i < particularsS99.length; i++) {
                                                    var truid = particularsS99[i].from;
                                                    var bulliontype = "S99P";
                                                    var qty = parseFloat(particularsS99[i].qty)
                                                    if (qty != 0 && qty > 0) {
                                                        calculate.update_assetmanager_stock(truid, totruid, bulliontype, qty, "buy", invoice);
                                                    }
                                                }

                                                TXN.updateOne({
                                                    "invoice": invoice
                                                }, {
                                                    $set: {
                                                        to: totruid, invoice: invoice, type: "buy", sourceFlag: "customer",
                                                        particularsG24: particularsG24[0],
                                                        particularsS99: particularsS99[0],
                                                        totalAmount: totaladd, createDate: date, status: status, MOP: mop, hash: crypted
                                                    }
                                                }, function (err) {
                                                    if (err) {
                                                        res.json({ status: "500", message: "Internal server error" });
                                                    } else {
                                                        rescallback(invoice);
                                                    }
                                                });
                                            }
                                            else {
                                                res.json({ status: "204", message: "Payment Failed! Please try again." });
                                            }
                                        }
                                    }
                                })
                            }

                            function rescallback(invoice) {
                                var respresult = TXN.aggregate([
                                    { $match: { "invoice": invoice } },
                                    {
                                        $lookup: {
                                            from: "kycs",
                                            localField: "to",
                                            foreignField: "truID",
                                            as: "cust"
                                        }
                                    },
                                    { $unwind: "$cust" },
                                    {
                                        $project: {
                                            invoice: 1, to: 1, from: 1, _id: 0, particularsG24: 1, rTruID: 1,
                                            particularsS99: 1, otherCharges: 1, totalAmount: 1, status: 1, MOP: 1, type: 1, gender: "$cust.genderc",
                                            address: "$cust.permanentAddress", fName: "$cust.fName", lName: "$cust.lName",
                                            email: "$cust.email", emailVerified: "$cust.emailVerified", createDate: 1, mobile: "$cust.mobile"
                                        }
                                    }
                                ]);
                                if (status === "success" && mop === "others") {
                                    var pgtype = req.body.pgtype,
                                        dbpgtype = "atomlogs";

                                    respresult = TXN.aggregate([
                                        { $match: { "invoice": invoice } },
                                        {
                                            $project: {
                                                invoice: 1, to: 1, from: 1, _id: 0, particularsG24: 1, particularsS99: 1, otherCharges: 1,
                                                totalAmount: 1, status: 1, MOP: 1, type: 1, createDate: 1, rTruID: 1
                                            }
                                        },
                                        {
                                            $lookup: {
                                                from: "kycs",
                                                localField: "to",
                                                foreignField: "truID",
                                                as: "cust"
                                            }
                                        },
                                        { $unwind: "$cust" },
                                        {
                                            $project: {
                                                invoice: 1, to: 1, from: 1, _id: 0, particularsG24: 1, rTruID: 1,
                                                particularsS99: 1, otherCharges: 1, totalAmount: 1, status: 1, MOP: 1, type: 1, gender: "$cust.genderc",
                                                address: "$cust.permanentAddress", fName: "$cust.fName", lName: "$cust.lName", mobile: "$cust.mobile",
                                                email: "$cust.email", emailVerified: "$cust.emailVerified", createDate: 1, refernceTruID: "$cust.refernceTruID",
                                            }
                                        },
                                        {
                                            $lookup: {
                                                from: dbpgtype,
                                                localField: "invoice",
                                                foreignField: "invoice",
                                                as: "pgdetail"
                                            }
                                        },
                                        { $unwind: "$pgdetail" },
                                        {
                                            $project: {
                                                invoice: 1, to: 1, from: 1, _id: 0, particularsG24: 1, particularsS99: 1, otherCharges: 1, totalAmount: 1,
                                                status: 1, MOP: 1, type: 1, gender: 1, rTruID: 1, address: 1, fName: 1, lName: 1, mobile: 1, email: 1,
                                                emailVerified: 1, createDate: 1, pgdetail: 1, refernceTruID: 1
                                            }
                                        },
                                    ]);
                                }

                                respresult.exec(async function (err, result) {
                                    if (err) {
                                        response.status(500).send({
                                            error: err
                                        })
                                        return next(err);
                                    } else {
                                        var resparticuls = {};
                                        particularsG24.length = 0;  //to clear prevoius calculated values.
                                        particularsS99.length = 0;  //to clear prevoius calculated values.

                                        var resource = result[0];

                                        var invoice = resource.invoice;
                                        var to = resource.to;
                                        var status = resource.status;
                                        var address = resource.address;
                                        var fname = resource.fName;
                                        var lname = resource.lName;
                                        var mop = resource.MOP;
                                        var type = resource.type;
                                        var createDate = resource.createDate;
                                        var referencetruid = resource.rTruID;

                                        ///Rate for 24
                                        particularsG24.push(particularsArr(resource.particularsG24));

                                        // //Rate S99P
                                        particularsS99.push(particularsArr(resource.particularsS99));

                                        //totalAmount
                                        var tav = resource.totalAmount.toJSON().$numberDecimal,
                                            ctruid;
                                        var emailVerified = resource.emailVerified;
                                        var Final = {
                                            "invoice": invoice, "to": to, "status": status, address: address, fName: fname, MOP: mop, lName: lname,
                                            totalAmount: tav, type: type, "createDate": createDate, applicableTAX: (Gen.tax * 100).toString(),
                                            "particularsG24": particularsG24,
                                            "particularsS99": particularsS99
                                        };

                                        if (status === "success") {

                                            if (mop === "others") {
                                                Final.PGType = pgtype;
                                                var payby = "0", banktxnid = "0", paymentcharge = "0";
                                                if (pgtype === "atom") {
                                                    var temppayby = resource.pgdetail.MOP;
                                                    payby = (temppayby == "NB") ? "Net Banking" : (temppayby == "CC") ? "Credit Card" : (temppayby == "DC") ? "Debit Card" : (temppayby == "UP") ? "UPI" : temppayby;
                                                    banktxnid = resource.pgdetail.bankTxnID;
                                                    paymentcharge = resource.pgdetail.surcharge.toJSON().$numberDecimal;
                                                }
                                                Final.bankTXNID = banktxnid;
                                                Final.payBy = payby;
                                                Final.paymentCharge = paymentcharge;

                                                if (emailVerified == true) {
                                                    var mailtype = emailVerified == true ? "both" : "sms";
                                                }
                                            }
                                            if (referencetruid && (referencetruid !== "Company" || referencetruid.substring(0, 4) === "8000")) {
                                                initiateEntityRevenueRefund(referencetruid, invoice);
                                            }
                                            MAIL.consumer_emailtxnNew(Final.to, Final.invoice, Final.bankTXNID);
                                        }
                                        res.json({ status: "200", resource: Final });
                                    }
                                })
                            }
                        }
                        forLoopBuy();
                    }
                    else {
                        res.json({ status: "204", message: "Something went wrong!" })
                    }
                } else {
                    res.json({ status: "204", message: respvalpaymodes })
                }

            }
        }
    })
}

exports.redeem_cash_multiple_assetmanagers = function (req, res) {
    let Gen = req.generalCharges;
    var s24 = req.body.G24K;
    var s99 = req.body.S99P;

    var totruid = req.body.totruid;
    var status = req.body.status;
    var benTrnremark = "Redeem Cash Transaction";
    var modeofpay = req.body.modeofpay;
    var ctruid, transID;

    KycAll.find({
        "truID": totruid, KYCFlag: "active"
    }, function (err, docs) {
        if (!docs.length) {
            res.json({
                status: "204",
                message: "The request was successful but no body was returned."
            });
        } else {
            var particularsG24 = new Array(),
                particularsS99 = new Array(),

                stockNA = new Array(),
                qtyNA = new Array(),
                inputNA = new Array(),

                referenceTruID = docs[0].refernceTruID,
                totaladd = 0,
                totaltax = 0;

            var date = new Date();    // today's date and time in ISO format
            var walletaccess = req.ConsumerConf.resource.module.walletAccess;
            var redeemToBank = req.ConsumerConf.resource.module.redeemToBank;
            var paymentmodeaccess = req.ConsumerConf.resource.module.payByWallet


            if (req.body.transactiontype != "redeemCash") {
                res.json({ status: "204", message: "The transaction type must be 'redeemCash'" })
            } else if (redeemToBank && accessarray.includes(redeemToBank) && req.body.mop === "others") {
                res.json({
                    status: "204",
                    message: "Your payment mode are disabled. Please contact your Administrator."
                });
            } else {
                var respvalpaymodes = validatePaymodes(req.body.mop, walletaccess, paymentmodeaccess);
                if (respvalpaymodes === 200) {
                    if (s24.length == 0 && s99.length == 0) { res.json({ status: "204", message: "No bullions selected." }) }
                    else if (s24.length != 0 || s99.length != 0) {
                        var bull, bulltype;
                        var arr = new Array();
                        function fromServer(i, bull, bulltype, arr, etruid) {
                            return new Promise((resolve, reject) => {
                                if (bull.length != 0) {
                                    // for(var i=0;i<bull.length;i++){
                                    var qtyval = parseFloat(bull[i].qty);

                                    if (bull[i].assetmanagerName && bull[i].qty && bull[i].amTruID) {
                                        // console.log(bulltype);
                                        var amtruid = bull[i].amTruID;
                                        var sqty = bull[i].qty;
                                        var id = bull[i].id;
                                        var particuls = {};
                                        var particulsStockNA = {};
                                        var particulsQTYNA = {};

                                        async function generateParticular() {
                                            if (etruid !== "Company" && etruid.substring(0, 4) === "8000") {
                                                var fcrgs = await calculate.redeemCash_calculation_remmit(Gen, amtruid, bulltype, sqty, totruid, etruid);
                                            } else {
                                                var fcrgs = await calculate.Redeem_calculation_consumer(Gen, amtruid, bulltype, sqty, totruid);
                                            }
                                            if (fcrgs.status === "200" && fcrgs.stockstatus === "resolve") {
                                                totaladd += fcrgs.total;
                                                totaltax += fcrgs.tax;
                                                resolve(arr.push(particularsArr(fcrgs)));
                                            } else {
                                                particulsStockNA = bull[i];
                                                particulsStockNA["bullionType"] = bulltype;
                                                resolve(stockNA.push(particulsStockNA));
                                            }
                                        }
                                        generateParticular();
                                    } else {
                                        var particuls = {};
                                        particuls = bull[i];
                                        particuls["bullionType"] = bulltype;
                                        resolve(inputNA.push(particuls));
                                    }


                                }
                                else {
                                    resolve(arr.push(particularsArr()));
                                }
                            }
                            )
                        }
                        async function forLoopBuy() {
                            if (s24.length) {
                                for (var i = 0; i < s24.length; i++) {
                                    await fromServer(i, s24, "G24K", particularsG24, referenceTruID);
                                }
                            }
                            else {
                                await fromServer(i, s24, "G24K", particularsG24, referenceTruID);
                            }
                            if (s99.length) {
                                for (var i = 0; i < s99.length; i++) {
                                    await fromServer(i, s99, "S99P", particularsS99, referenceTruID);
                                }
                            } else {
                                await fromServer(i, s99, "S99P", particularsS99, referenceTruID);
                            }
                            let invoice;
                            let mop;
                            var type = req.body.transactiontype;

                            if (inputNA.length) {
                                res.json({ status: "204", message: "Invalid input.", inputNA: inputNA })
                            } else if (qtyNA.length) {
                                res.json({ status: "204", message: "Please select Quantity between 0.1 && 100 each bullion.", qtyNA: qtyNA })
                            } else if (stockNA.length) {
                                res.json({ status: "204", message: "Stock not available.", stockNA: stockNA })
                            } else if (status === "failure") {

                                // var invoiceno = Date.parse(date);
                                invoice = createInvoice();
                                mop = "other";
                                var md5hash = invoice + totruid + "success" + req.body.transactiontype;
                                var insTxn = {
                                    to: totruid, invoice: invoice, type: "redeemCash", sourceFlag: "customer",
                                    particularsG24: particularsG24[0],
                                    particularsS99: particularsS99[0],
                                    totalAmount: totaladd,
                                    createDate: date,
                                    status: status,
                                    md5sign: md5(md5hash),
                                    MOP: mop
                                }
                                if (referenceTruID !== "Company" || referenceTruID.substring(0, 4) === "8000") {
                                    insTxn.rTruID = referenceTruID
                                }
                                var insertTXN = new TXN(insTxn);
                                insertTXN.save(function (err) {
                                    if (err) {
                                        res.json({ status: "500", message: "Internal server error" });
                                    } else {
                                        rescallback(invoice);
                                    }
                                })
                            }
                            else if (status === "success") {
                                invoice = req.body.invoice;
                                mop = req.body.mop;
                                var md5hash = invoice + totruid + req.body.status + req.body.transactiontype;
                                TXN.find({
                                    "invoice": invoice, "to": totruid,
                                    "md5sign": md5(md5hash), "status": "failure"
                                }, function (err, docs) {
                                    if (!docs.length) {
                                        res.json({
                                            status: "204",
                                            message: "Please Enter Correct invoice number."
                                        });
                                    } else {
                                        var totaladd = parseFloat(docs[0].totalAmount.toJSON().$numberDecimal);
                                        var qty24 = parseFloat(0);
                                        var qty99 = parseFloat(0);

                                        for (var i = 0; i < particularsG24.length; i++) {
                                            qty24 += (qty24 + parseFloat(particularsG24[i].qty));
                                        }

                                        for (var i = 0; i < particularsS99.length; i++) {
                                            qty99 += (qty99 + parseFloat(particularsS99[i].qty));
                                        }

                                        var tocrypt = {
                                            to: totruid, invoice: invoice, type: "redeemCash", sourceFlag: "customer",
                                            particularsG24: particularsG24[0],
                                            particularsS99: particularsS99[0],
                                            totalAmount: totaladd,
                                            createDate: date,
                                            status: status,
                                            MOP: mop,
                                            hash: crypted
                                        };
                                        var rational = JSON.stringify(tocrypt);
                                        var crypted = encryption(rational);

                                        if (mop != "truWallet" && mop != "others") {
                                            res.json({
                                                status: "204",
                                                message: "Please provide valid method of payment."
                                            });
                                        }

                                        else if (mop === "truWallet") {
                                            ConsumerConfig.checkWalletLimit(totruid, totaladd, function (limitcb) {
                                                if (limitcb === "200") {
                                                    var totaladd = parseFloat(docs[0].totalAmount.toJSON().$numberDecimal);

                                                    calculate.update_wallet(totruid, req.body.invoice, totaladd, "redeemCash");

                                                    calculate.update_stock(totruid, qty24, qty99, "redeemCash", invoice);

                                                    for (var i = 0; i < particularsG24.length; i++) {
                                                        var truid = particularsG24[i].from;
                                                        var bulliontype = "G24K";
                                                        var qty = parseFloat(particularsG24[i].qty)
                                                        if (qty != 0 && qty > 0) {
                                                            calculate.update_assetmanager_stock(truid, totruid, bulliontype, qty, "redeemCash", invoice);
                                                        }
                                                    }


                                                    for (var i = 0; i < particularsS99.length; i++) {
                                                        var truid = particularsS99[i].from;
                                                        var bulliontype = "S99P";
                                                        var qty = parseFloat(particularsS99[i].qty)
                                                        if (qty != 0 && qty > 0) {
                                                            calculate.update_assetmanager_stock(truid, totruid, bulliontype, qty, "redeemCash", invoice);
                                                        }
                                                    }

                                                    TXN.updateOne({
                                                        "invoice": invoice
                                                    }, {
                                                        $set: {
                                                            to: totruid, invoice: invoice, type: "redeemCash", sourceFlag: "customer",
                                                            particularsG24: particularsG24[0],
                                                            particularsS99: particularsS99[0],
                                                            totalAmount: totaladd,
                                                            createDate: date,
                                                            status: status,
                                                            MOP: mop,
                                                            hash: crypted
                                                        }
                                                    }, function (err) {
                                                        if (err) {
                                                            res.json({ status: "500", message: "Internal server error" });
                                                        } else {
                                                            rescallback(invoice);
                                                        }
                                                    })
                                                }
                                                else if (limitcb === "500") {
                                                    res.json({ status: "204", message: "You have exceeded your wallet limit! Please verify your KYC for unlimited access." });
                                                } else {
                                                    res.json({ status: "204", message: "Something went wrong, Please try again!" });
                                                }
                                            })
                                        }
                                        else if (mop === "others") {
                                            /* ConsumerConfig.checkredeemtobankLimit(totruid, totaladd, function (limitcb, remainingtime) {
                                                if (limitcb === "200") { */
                                            var accountno = req.body.accountno;
                                            transID = uniqueNumber().toString();
                                            var mopbankupiquery;
                                            if (modeofpay == "NEFT" || modeofpay == "IMPS") {
                                                mopbankupiquery = Accounts.aggregate([{ $match: { truID: totruid } },
                                                { $project: { _id: 0, accountdetails: "$bankAccounts", truID: 1 } },
                                                { $unwind: { path: "$accountdetails", preserveNullAndEmptyArrays: true } },
                                                { $match: { "accountdetails.accountId": accountno, "accountdetails.status": "active" } },
                                                { $project: { "accountdetails": "$accountdetails", truID: 1 } },
                                                {
                                                    $lookup: {
                                                        from: "kycs",
                                                        localField: "truID",
                                                        foreignField: "truID",
                                                        as: "kycall"
                                                    }
                                                },
                                                { $unwind: "$kycall" },
                                                { $project: { accountdetails: 1, truID: 1, mobile: "$kycall.mobile", crnno: "$kycall.CRNNo" } },
                                                ])
                                            } else if (modeofpay == "UPI") {
                                                mopbankupiquery = Mop.aggregate([{ $match: { truID: totruid } },
                                                { $project: { _id: 0, upiDetails: "$MOP.upiDetails", truID: 1 } },
                                                { $unwind: { path: "$upiDetails", preserveNullAndEmptyArrays: true } },
                                                { $match: { "upiDetails.upiaddress": accountno, "upiDetails.status": "active" } },
                                                { $project: { "accountdetails": "$upiDetails", truID: 1 } },
                                                {
                                                    $lookup: {
                                                        from: "kycs",
                                                        localField: "truID",
                                                        foreignField: "truID",
                                                        as: "kycall"
                                                    }
                                                },
                                                { $unwind: "$kycall" },
                                                { $project: { accountdetails: 1, truID: 1, mobile: "$kycall.mobile", crnno: "$kycall.CRNNo" } },
                                                ])
                                            }
                                            mopbankupiquery.exec(function (err, accdocs) {
                                                if (!accdocs.length) {
                                                    res.json({ status: 204, message: "Please Link your Account or UPI..!!" })
                                                } else {
                                                    if (accdocs[0].accountdetails) {
                                                        // console.log("stock ", qty24, qty22, qty18, qty99)
                                                        var totaladd = parseFloat(docs[0].totalAmount.toJSON().$numberDecimal);
                                                        if (modeofpay == "NEFT" || modeofpay == "IMPS") {
                                                            calculate.update_stock(totruid, qty24, qty99, "redeemCash", invoice);
                                                            bankApi.bank_single_payment_api(transID, totaladd, totruid, benTrnremark, modeofpay, invoice, "redeemCash", accdocs[0].accountdetails, accdocs[0].mobile, accdocs[0].crnno, docs[0], function (err, resback) {
                                                            })
                                                            TXN.updateOne({
                                                                "invoice": invoice
                                                            }, {
                                                                $set: {
                                                                    to: totruid, invoice: invoice, type: "redeemCash", sourceFlag: "customer",
                                                                    particularsG24: particularsG24[0],
                                                                    particularsS99: particularsS99[0],
                                                                    totalAmount: totaladd,
                                                                    createDate: date,
                                                                    status: "inprocess",
                                                                    MOP: mop,
                                                                    ModeOfPay: modeofpay,
                                                                    hash: crypted
                                                                }
                                                            }, function (err) {
                                                                if (err) {
                                                                    res.json({ status: "500", message: "Internal server error" });
                                                                } else {
                                                                    rescallback(invoice);
                                                                }
                                                            })
                                                        }
                                                    }
                                                    else {
                                                        res.json({ status: 204, message: "Please Set your default account..!!" })
                                                    }
                                                }
                                            })
                                            /* }
                                            else if (limitcb === "500") {
                                                res.json({ status: "204", message: "You have exceeded your wallet limit! Please verify your KYC for unlimited access." });
                                            } else if (limitcb === "400") {
                                                var time = remainingtime + 1;
                                                res.json({ status: "204", message: "Please do the next transaction after " + time + " min. This is for your transaction safety." });
                                            } else {
                                                res.json({ status: "204", message: "Something went wrong, Please try again!" });
                                            } 
                                        })*/
                                        }
                                    }
                                })
                            }
                            function rescallback(invoice) {
                                if (err) {
                                    res.send(err);
                                    console.log(err);
                                }
                                var respresult = TXN.aggregate([
                                    { $match: { "invoice": invoice } },
                                    {
                                        $project: {
                                            invoice: 1, to: 1, from: 1, _id: 0, particularsG24: 1, rTruID: 1,
                                            particularsS99: 1, otherCharges: 1, totalAmount: 1, status: 1, MOP: 1, type: 1, createDate: 1, ModeOfPay: 1
                                        }
                                    },
                                    {
                                        $lookup: {
                                            from: "kycs",
                                            localField: "to",
                                            foreignField: "truID",
                                            as: "cust"
                                        }
                                    },
                                    { $unwind: "$cust" },
                                    {
                                        $project: {
                                            invoice: 1, to: 1, from: 1, _id: 0, particularsG24: 1, rTruID: 1,
                                            particularsS99: 1, otherCharges: 1, totalAmount: 1, status: 1, MOP: 1, type: 1, gender: "$cust.genderc",
                                            address: "$cust.permanentAddress", fName: "$cust.fName", lName: "$cust.lName", createDate: 1, ModeOfPay: 1,
                                            email: "$cust.email", emailVerified: "$cust.emailVerified", mobile: "$cust.mobile"
                                        }
                                    },
                                    {
                                        $lookup: {
                                            from: "stocks",
                                            localField: "to",
                                            foreignField: "truID",
                                            as: "stock"
                                        }
                                    },
                                    { $unwind: "$stock" },
                                    {
                                        $lookup: {
                                            from: "wallets",
                                            localField: "to",
                                            foreignField: "truID",
                                            as: "wallet"
                                        }
                                    },
                                    { $unwind: "$wallet" },
                                    {
                                        $project: {
                                            invoice: 1, to: 1, from: 1, _id: 0, particularsG24: 1,
                                            particularsS99: 1, otherCharges: 1, totalAmount: 1, status: 1, MOP: 1, type: 1, gender: 1, rTruID: 1,
                                            address: 1, fName: 1, lName: 1, createDate: 1, email: 1, emailVerified: 1, mobile: 1, ModeOfPay: 1,
                                            stock: "$stock.stock", clBal: "$wallet.clBal"
                                        }
                                    },
                                ]);
                                respresult.exec(function (err, result) {
                                    if (err) {
                                        response.status(500).send({
                                            error: err
                                        })
                                        return next(err);
                                    } else {
                                        var resparticuls = {};
                                        particularsG24.length = 0;  //to clear prevoius calculated values.

                                        particularsS99.length = 0;  //to clear prevoius calculated values.

                                        var resource = result[0];
                                        var invoice = resource.invoice;
                                        var to = resource.to;
                                        var status = resource.status;
                                        var address = resource.address;
                                        var fname = resource.fName;
                                        var lname = resource.lName;
                                        var mop = resource.MOP;
                                        var modeofpay = resource.ModeOfPay;
                                        var type = resource.type;
                                        var createDate = resource.createDate;
                                        var referencetruid = resource.rTruID;

                                        ///Rate for 24
                                        particularsG24.push(particularsArr(resource.particularsG24));
                                        // Rate for 22 K

                                        // //Rate S99P
                                        particularsS99.push(particularsArr(resource.particularsS99));

                                        //totalAmount
                                        var tav = resource.totalAmount.toJSON().$numberDecimal;



                                        var Final = ({
                                            "invoice": invoice, "tranID": transID, "to": to, "status": status, address: address, fName: fname, MOP: mop, lName: lname,
                                            totalAmount: tav, type: type, "createDate": createDate, "ModeOfPay": modeofpay, applicableTAX: (Gen.sellTax * 100).toString(), totalTax: totaltax.toString(),
                                            "particularsG24": particularsG24,
                                            "particularsS99": particularsS99

                                        })

                                        if (status === "success") {
                                            if (referencetruid && (referencetruid !== "Company" || referencetruid.substring(0, 4) === "8000")) {
                                                initiateEntityRevenueRefund(referencetruid, invoice);
                                            }
                                        }
                                        if (mop === "truWallet") {
                                            MAIL.consumer_emailtxnNew(to, invoice);
                                        }
                                        res.json({ status: "200", resource: Final })

                                    }
                                })
                            }
                        }

                        forLoopBuy();
                    }
                    else {
                        res.json({ status: "204", message: "Something went wrong!" })
                    }
                } else {
                    res.json({ status: "204", message: respvalpaymodes })
                }

            }
        }
    })
}
exports.transfer_bullions = function (req, res) {
    let Gen = req.generalCharges;
    var s24 = parseFloat(req.body.g24qty),
        s99 = parseFloat(req.body.s99qty),
        fromtruid = req.body.fromtruid,
        totruid = req.body.totruid,
        totaltax = 0;

    if (s24 == "0" && s99 == "0") { res.json({ status: "204", message: "No Quantity Selected" }) }
    else if (s24 != "0" || s99 != "0") {
        KycAll.find({
            "truID": totruid, KYCFlag: "active"
        }, function (err, docs) {
            if (!docs.length) {
                res.json({
                    status: "204",
                    message: "The request was successful but no body was returned."
                });
            } else {
                var walletaccess = req.ConsumerConf.resource.module.walletAccess;
                var paymentmodeaccess = req.ConsumerConf.resource.module.payByWallet
                var respvalpaymodes = validatePaymodes(req.body.mop, walletaccess, paymentmodeaccess);
                if (respvalpaymodes === 200) {
                    ///////////////////////////////assetstoreDetails////////////////////////////////////////
                    if (fromtruid != "0" || fromtruid === undefined) {
                        KycAll.find({
                            "truID": fromtruid
                        }, function (err, docs) {
                            if (!docs.length) {
                                res.json({
                                    status: "204",
                                    message: "The request was successful but no body was returned."
                                });
                            } else {
                                var crnNo = docs[0].CRNNo;
                                var countrycode = docs[0].countryCode;
                                var referenceTruID = docs[0].refernceTruID;

                                stockvalidation();
                                function stockvalidation() {
                                    request.post({
                                        "headers": { "content-type": "application/json" },
                                        "url": reqip + ":4114/api/validatestock",
                                        "body": JSON.stringify({
                                            "totruid": fromtruid, "g24": s24, "s99": s99
                                        })
                                    }, async (error, response, body) => {
                                        if (error) {
                                            return console.dir(error);
                                        } else {
                                            var result = JSON.parse(body);
                                            var validationstatus = result.status;
                                            if (validationstatus == "200") {
                                                let particularsG24 = {},
                                                    particularsS99 = {},
                                                    stockNA = new Array(),
                                                    totaladd = 0,
                                                    date = new Date(); // today's date and time in ISO format
                                                function fromServer(fromtruid, fromname, countrycode, sqty, bulltype, arr, etruid) {
                                                    return new Promise((resolve, reject) => {
                                                        if (sqty !== 0 && sqty > 0) {
                                                            var particulsStockNA = {};
                                                            async function generateParticular() {
                                                                if (etruid !== "Company" && etruid.substring(0, 4) === "8000") {
                                                                    var fcrgs = await calculate.transfer_calculation_remmit(Gen, countrycode, bulltype, sqty, etruid);
                                                                } else {
                                                                    // var fcrgs = await calculate.Buy_calculation_consumer(Gen, amtruid, bulltype, sqty);
                                                                    var fcrgs = await calculate.transfer_calculation_consumer(Gen, countrycode, bulltype, sqty);
                                                                }
                                                                if (fcrgs.status === "200" && fcrgs.stockstatus === "resolve") {
                                                                    totaladd += fcrgs.total;
                                                                    totaltax += fcrgs.tax;
                                                                    resolve(Object.assign(arr, particularsArr(fcrgs)));
                                                                } else {
                                                                    particulsStockNA = sqty;
                                                                    particulsStockNA["bullionType"] = bulltype;
                                                                    resolve(stockNA.push(particulsStockNA));
                                                                }
                                                            }
                                                            generateParticular();

                                                        } else {
                                                            resolve(Object.assign(arr, particularsArr()));
                                                        }
                                                    })
                                                }

                                                if (s24 !== 0 && s24 > 0) {
                                                    await fromServer(req.body.fromtruid, req.body.fromname, countrycode, s24, "G24K", particularsG24, referenceTruID);
                                                } else {
                                                    particularsG24 = particularsArr({ from: req.body.fromtruid, assetmanagerName: req.body.fromname });
                                                }

                                                if (s99 !== 0 && s99 > 0) {
                                                    await fromServer(req.body.fromtruid, req.body.fromname, countrycode, s99, "S99P", particularsS99, referenceTruID);
                                                } else {
                                                    particularsS99 = particularsArr({ from: req.body.fromtruid, assetmanagerName: req.body.fromname });
                                                }


                                                var status = req.body.status;
                                                if (status != "failure" && status != "success") {
                                                    res.json({
                                                        status: "204",
                                                        message: "The Transaction Must Either Be In  'Success'  or 'Failure' Status."
                                                    });
                                                }

                                                if (status == "failure") {
                                                    var invoiceno = Date.parse(date);
                                                    var type = req.body.transactiontype;
                                                    invoice = createInvoice();
                                                    mop = "other";


                                                    var md5hash = invoice + req.body.totruid + "success" + req.body.transactiontype;
                                                    var insTxn = {
                                                        to: req.body.fromtruid,
                                                        receiverTruID: req.body.totruid,
                                                        invoice: invoice, type: type, sourceFlag: "customer",
                                                        particularsG24: particularsG24,
                                                        particularsS99: particularsS99,
                                                        totalAmount: totaladd,
                                                        createDate: date,
                                                        md5sign: md5(md5hash),
                                                        status: status,
                                                        MOP: mop
                                                    }
                                                    if (referenceTruID && ((referenceTruID !== "customer" && referenceTruID !== "Company") || (referenceTruID !== "customer" && referenceTruID.substring(0, 4) === "8000"))) {
                                                        insTxn.rTruID = referenceTruID
                                                    }
                                                    var insertTXN = new TXN(insTxn);
                                                    insertTXN.save(function (err) {
                                                        if (err) {
                                                            res.json({ status: "500", message: "Internal server error" });
                                                        } else {
                                                            rescallback(invoice);
                                                        }
                                                    })
                                                }

                                                if (status == "success") {
                                                    var totruid = req.body.totruid;
                                                    var fromtruid = req.body.fromtruid;
                                                    var invoice = req.body.invoice;
                                                    var type = req.body.transactiontype;
                                                    var mop = req.body.mop;

                                                    if (invoice != undefined) {
                                                        var md5hash = invoice + totruid + req.body.status + req.body.transactiontype;
                                                        console.log(md5hash)
                                                        console.log(md5(md5hash))
                                                        TXN.find({
                                                            "invoice": invoice, "to": fromtruid,
                                                            "md5sign": md5(md5hash), "status": "failure"

                                                        }, function (err, docs) {
                                                            if (!docs.length) {
                                                                res.json({
                                                                    status: "204",
                                                                    message: "Please Enter Correct invoice number."
                                                                });
                                                            } else {
                                                                var tocrypt = {
                                                                    to: req.body.fromtruid,
                                                                    receiverTruID: req.body.totruid,
                                                                    invoice: invoice, type: type, sourceFlag: "customer",
                                                                    particularsG24: particularsG24,
                                                                    particularsS99: particularsS99,
                                                                    totalAmount: totaladd,
                                                                    createDate: date,
                                                                    status: status,
                                                                    MOP: mop
                                                                };
                                                                encrypt(tocrypt);
                                                                function encrypt(txnObj) {
                                                                    var crypted = encryption(JSON.stringify(txnObj));
                                                                    txnObj.hash = crypted;
                                                                    var walletaccess = req.ConsumerConf.resource.module.walletAccess;
                                                                    var paymentmodeaccess = req.ConsumerConf.resource.module.payByWallet;

                                                                    if (mop != "truWallet" && mop != "others" && mop != "offline" && mop != "stock") {
                                                                        res.json({
                                                                            status: "204",
                                                                            message: "Please provide valid method of payment."
                                                                        });
                                                                    } else {
                                                                        var respvalpaymodes = validatePaymodes(req.body.mop, walletaccess, paymentmodeaccess);
                                                                        if (respvalpaymodes === 200) {
                                                                            if (mop === "truWallet") {
                                                                                Wallet.aggregate([{
                                                                                    $match: {
                                                                                        truID: fromtruid
                                                                                    }
                                                                                },
                                                                                {
                                                                                    $project: {
                                                                                        _id: 0, wstatus: {
                                                                                            $cond: {
                                                                                                if: {
                                                                                                    $and: [{ $gte: ["$clBal", totaladd] }, { $gte: ["$clBal", 0] }]
                                                                                                },
                                                                                                then: "200",
                                                                                                else: "401"
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                }
                                                                                ]).exec(function (err, result) {
                                                                                    if (err) {
                                                                                        response.status(500).send({
                                                                                            error: err
                                                                                        })
                                                                                        return next(err);
                                                                                    } else {
                                                                                        var resource = result[0];

                                                                                        var wstatus = resource.wstatus;
                                                                                        if (wstatus == "401") {
                                                                                            res.json({
                                                                                                status: "401",
                                                                                                message: "Insufficient wallet balance"
                                                                                            })
                                                                                        } else {
                                                                                            TXN.findOneAndUpdate({
                                                                                                "invoice": invoice
                                                                                            }, {
                                                                                                $set: txnObj
                                                                                            }, { new: true }, function (err, txnresult) {
                                                                                                if (err) {
                                                                                                    res.send(err);
                                                                                                } else {
                                                                                                    rescallback(invoice)
                                                                                                }
                                                                                            })


                                                                                        }
                                                                                    }
                                                                                })
                                                                            }
                                                                            else if (mop === "stock") {
                                                                                var q24v = parseFloat(particularsG24.qty) + parseFloat(particularsG24.qtyAgainstTxnChgs);
                                                                                var q99v = parseFloat(particularsS99.qty) + parseFloat(particularsS99.qtyAgainstTxnChgs);
                                                                                request.post({
                                                                                    "headers": {
                                                                                        "content-type": "application/json"
                                                                                    },
                                                                                    "url": reqip + ":4114/api/validatestock",
                                                                                    "body": JSON.stringify({
                                                                                        "totruid": fromtruid,
                                                                                        "g24": q24v,
                                                                                        "s99": q99v
                                                                                    })
                                                                                }, async (error, response, body) => {
                                                                                    if (error) {
                                                                                        return console.dir(error);
                                                                                    } else {
                                                                                        var result = JSON.parse(body);
                                                                                        var validationstatus = result.status;
                                                                                        if (validationstatus == "200") {
                                                                                            TXN.findOneAndUpdate({
                                                                                                "invoice": invoice
                                                                                            }, {
                                                                                                $set: txnObj
                                                                                            }, { new: true }, function (err, txnresult) {
                                                                                                if (err) {
                                                                                                    res.send(err);
                                                                                                } else {
                                                                                                    rescallback(invoice)
                                                                                                }
                                                                                            })

                                                                                        } else if (validationstatus == "24") {
                                                                                            res.json({
                                                                                                status: "403",
                                                                                                message: "Stock not available for TruGold."
                                                                                            });
                                                                                        } else if (validationstatus == "99") {
                                                                                            res.json({
                                                                                                status: "403",
                                                                                                message: "Stock not available for TruSilver."
                                                                                            });
                                                                                        } else {
                                                                                            res.json({
                                                                                                status: "403",
                                                                                                message: "Stock not available."
                                                                                            })
                                                                                        }
                                                                                    }
                                                                                })

                                                                            }

                                                                            else if (mop === "others") {
                                                                                if (req.body.astatus === "Ok" || req.body.astatus === "success_00") {
                                                                                    TXN.findOneAndUpdate({
                                                                                        "invoice": invoice
                                                                                    }, {
                                                                                        $set: txnObj
                                                                                    }, { new: true }, function (err, txnresult) {
                                                                                        if (err) {
                                                                                            res.send(err);
                                                                                        } else {
                                                                                            rescallback(invoice)
                                                                                        }
                                                                                    })

                                                                                } else {
                                                                                    res.json({ status: "401", message: "Payment Failed" })
                                                                                }
                                                                            }
                                                                        } else {
                                                                            res.json({ status: "204", message: respvalpaymodes })
                                                                        }
                                                                    }

                                                                }
                                                            }
                                                        })
                                                    }
                                                    else {
                                                        res.json({
                                                            status: "204",
                                                            message: "Please Enter invoice number."
                                                        })
                                                    }
                                                }


                                                function notification(totruid, fromtruid, fromname, invoice, crnNo, g24qty, s99qty) {
                                                    var message = "";
                                                    if (g24qty > 0) {
                                                        message += g24qty.toString() + " gm of TruGold";
                                                    }
                                                    if (s99qty > 0) {
                                                        message = s99qty.toString() + " gm of TruSilver";
                                                    }

                                                    var dates = date.toLocaleString();
                                                    request.post({
                                                        "headers": { "content-type": "application/json" },
                                                        "url": reqip + ":4116/api/insnotification",
                                                        "body": JSON.stringify({
                                                            "notifyto": totruid,
                                                            "triggeredbytruid": fromtruid,
                                                            "notification": fromname + " has transferred " + message + " in your Company account.",
                                                            "type": "customerTransaction",
                                                            "subtype": "transfer",
                                                            "title": "Bullions Received.",
                                                            "referenceid": invoice,
                                                            "isflag": "consumer",
                                                            "crnNo": crnNo
                                                        })
                                                    }, (error, response, body) => {
                                                        if (error) {
                                                            return console.dir(error);
                                                        }
                                                    })
                                                }

                                                async function rescallback(invoice) {
                                                    let resource = await TXN.findOne({ invoice: invoice });
                                                    let to = resource.to;
                                                    let status = resource.status;
                                                    let mop = resource.MOP;
                                                    let type = resource.type;
                                                    let createDate = resource.createDate;
                                                    let referencetruid = resource.rTruID;
                                                    var receiverDetails = await KycAll.findOne({ truID: resource.receiverTruID });
                                                    let senderName = docs[0].fName + " " + docs[0].lName;
                                                    let receiverName = receiverDetails.fName + " " + receiverDetails.lName;
                                                    let receiverTruID = resource.receiverTruID;

                                                    //totalAmount
                                                    var tav = resource.totalAmount.toJSON().$numberDecimal;
                                                    var pgtype = req.body.pgtype;
                                                    var payby = "0", banktxnid = "0", paymentcharge = "0";
                                                    if (mop === "others" && pgtype === "atom") {
                                                        let pgdetail = await Atom.findOne({ invoice: invoice });
                                                        var temppayby = pgdetail.MOP;
                                                        payby = (temppayby == "NB") ? "Net Banking" : (temppayby == "CC") ? "Credit Card" : (temppayby == "DC") ? "Debit Card" : (temppayby == "UP") ? "UPI" : temppayby;
                                                        banktxnid = pgdetail.bankTxnID;
                                                        paymentcharge = pgdetail.surcharge.toJSON().$numberDecimal;
                                                    }
                                                    var Final = ({
                                                        "invoice": invoice, "to": to, "status": status, MOP: mop,
                                                        totalAmount: tav, "createDate": createDate, type: type,
                                                        applicableTAX: (Gen.gstOnTransferFee * 100).toString(), totalTax: totaltax.toString(),
                                                        "particularsG24": particularsArr(resource.particularsG24),
                                                        "particularsS99": particularsArr(resource.particularsS99),
                                                        "name": senderName,
                                                        "receiverName": receiverName,
                                                        "receiverTruID": receiverTruID,
                                                        "PGType": pgtype,
                                                        "payBy": payby,
                                                        "bankTXNID": banktxnid,
                                                        "paymentCharge": paymentcharge
                                                    });
                                                    res.json({ status: "200", resource: Final });

                                                    if (resource.status == "success") {
                                                        var q24v = resource.particularsG24.qty.toJSON().$numberDecimal;
                                                        var q99v = resource.particularsS99.qty.toJSON().$numberDecimal;
                                                        if (mop === "truWallet") {
                                                            calculate.update_wallet(to, invoice, parseFloat(tav), "transfer");
                                                        }
                                                        if (mop === "stock") {
                                                            var q24vaschrg = resource.particularsG24.qtyAgainstTxnChgs.toJSON().$numberDecimal;
                                                            var q99vaschrg = resource.particularsS99.qtyAgainstTxnChgs.toJSON().$numberDecimal;
                                                            calculate.update_stock(to, (q24v + q24vaschrg), (q99v + q99vaschrg), "transferer", req.body.invoice);
                                                        }
                                                        if (mop !== "stock") {
                                                            calculate.update_stock(to, q24v, q99v, "transferer", req.body.invoice);
                                                        }
                                                        calculate.update_stock(receiverTruID, q24v, q99v, "receiver", req.body.invoice);
                                                        // calculate.update_stock(fromtru24, parseFloat(q24v) * -1, parseFloat(q22v) * -1, parseFloat(q18v) * -1, parseFloat(q99v) * -1);
                                                        // calculate.update_stock(to, parseFloat(q24v), parseFloat(q22v), parseFloat(q18v), parseFloat(q99v));
                                                        notification(receiverTruID, to, senderName, invoice, crnNo, decimalChopper(q24v, 2), decimalChopper(q99v, 2))

                                                        MAIL.consumer_emailtxnNew(to, invoice, banktxnid);

                                                        if (referencetruid && ((referencetruid !== "customer" && referencetruid !== "Company") || (referencetruid !== "customer" && referencetruid.substring(0, 4) === "8000"))) {
                                                            initiateEntityRevenueRefund(referencetruid, invoice);
                                                        }
                                                    }

                                                };
                                            } else if (validationstatus == "24") {
                                                res.json({
                                                    status: "403",
                                                    message: "Stock not available for TruGold."
                                                });
                                            } else if (validationstatus == "99") {
                                                res.json({
                                                    status: "403",
                                                    message: "Stock not available for TruSilver."
                                                });
                                            } else {
                                                res.json({
                                                    status: "403",
                                                    message: "Stock not available."
                                                })
                                            }
                                        }
                                    })
                                }
                            }
                        })
                    }
                } else {
                    res.json({ status: "204", message: respvalpaymodes })
                }
            }
        })
    }
}

exports.consumerReceipt_mobile = function (req, res) {  // call for transfer , request and gift
    let Gen = req.generalCharges;
    var invoice = req.body.invoice;
    var truid = req.body.truid;

    KycAll.find({
        "truID": truid, KYCFlag: "active"
    }, function (err, docs) {
        if (!docs.length) {
            res.json({
                status: "204",
                message: "Consumer not exist..!!"
            });
        } else {
            var ttype = req.body.ttype;
            if (ttype === "buy" || ttype === "buyCash" || ttype === "redeemCash") {
                var respresult = TXN.aggregate([
                    { $match: { "invoice": invoice, type: ttype } },
                    {
                        $project: {
                            invoice: 1, to: 1, from: 1, _id: 0, particularsG24: 1, createDate: 1, sourceFlag: 1,
                            particularsS99: 1, totalAmount: 1, status: 1, MOP: 1, type: 1, CRNNo: 1
                        }
                    },
                    {
                        $lookup: {
                            from: "kycs",
                            localField: "to",
                            foreignField: "truID",
                            as: "cust"
                        }
                    },
                    { $unwind: "$cust" },
                    {
                        $lookup: {
                            from: "atomlogs",
                            localField: "invoice",
                            foreignField: "invoice",
                            as: "atomlogs"
                        }
                    },
                    { "$unwind": { "path": "$atomlogs", "preserveNullAndEmptyArrays": true } },
                    {
                        $lookup: {
                            from: "banklogs",
                            localField: "invoice",
                            foreignField: "invoice",
                            as: "banklogs"
                        }
                    },
                    {
                        "$unwind": {
                            "path": "$banklogs",
                            "preserveNullAndEmptyArrays": true
                        }
                    },
                    {
                        $project: {
                            invoice: 1, to: 1, from: 1, _id: 0, particularsG24: 1,
                            particularsS99: 1, totalAmount: 1, status: 1, MOP: 1, type: 1, createDate: 1, sourceFlag: 1,
                            CRNNo: "$cust.CRNNo", address: "$cust.permanentAddress", fName: "$cust.fName", lName: "$cust.lName",
                            refernceID: "$cust.refernceTruID", atomlogs: "$atomlogs", banklogs: "$banklogs"
                        }
                    }

                ]);

                respresult.exec(function (err, result) {
                    if (err) {
                        res.json({ status: "204", message: 'Something went wrong!' })
                    } else {
                        var resource = result[0];
                        if (resource === undefined || resource.type == "transfer") {
                            res.json({
                                status: "204",
                                message: 'No Record Found'
                            });
                        }
                        else {
                            var invoice = resource.invoice;
                            var status = resource.status;
                            var fname = resource.fName;
                            var lname = resource.lName;
                            var mop = resource.MOP;
                            var CRNNo = resource.CRNNo;
                            var type = resource.type;
                            var ta = resource.totalAmount.toJSON().$numberDecimal;
                            var createDate = resource.createDate;
                            var atomlogs = resource.atomlogs;
                            var banklogs = resource.banklogs;
                            var pgtype = undefined, banktxnid = undefined, payby = undefined, paymentcharge = undefined;
                            if (status === "success" && mop === "others" && (type === "buy" || type === "buyCash")) {
                                if (atomlogs) {
                                    var temppayby = atomlogs.MOP;
                                    pgtype = "atom";
                                    payby = (temppayby == "NB") ? "Net Banking" : (temppayby == "CC") ? "Credit Card" : (temppayby == "DC") ? "Debit Card" : (temppayby == "UP") ? "UPI" : temppayby;
                                    banktxnid = atomlogs.bankTxnID;
                                    paymentcharge = atomlogs.surcharge.toJSON().$numberDecimal;
                                }
                            } else if (status === "success" && mop === "others" && (type === "redeemCash")) {
                                if (banklogs) {
                                    var pgdetail = banklogs, temppayby = pgdetail.Mode_of_Pay;
                                    pgtype = temppayby;
                                    payby = pgdetail.RefNo ? pgdetail.RefNo : pgdetail.TranID ? pgdetail.TranID : "0";
                                    banktxnid = "0";
                                    paymentcharge = pgdetail.charges !== null ? pgdetail.charges : "0";
                                }
                            }

                            function createParticular(particulars, bullionType) {
                                var respartl = {}
                                respartl["TID"] = particulars.TID;
                                respartl["bullionType"] = bullionType;
                                respartl["rate"] = particulars.rate.toJSON().$numberDecimal;
                                respartl["quantity"] = particulars.qty.toJSON().$numberDecimal;
                                respartl["tax"] = particulars.tax.toJSON().$numberDecimal;
                                respartl["valuation"] = particulars.amount.toJSON().$numberDecimal;
                                respartl["total"] = particulars.total.toJSON().$numberDecimal;
                                return respartl
                            }
                            var truCoin;
                            var ctruid;
                            if (resource.particularsG24.qty.toJSON().$numberDecimal != 0) {
                                truCoin = createParticular(resource.particularsG24, "G24K");
                                ctruid = resource.particularsG24.from
                            }
                            else {
                                truCoin = createParticular(resource.particularsS99, "S99P");
                                ctruid = resource.particularsS99.from
                            }
                            request.post({
                                "headers": { "content-type": "application/json" },
                                "url": conf.adminreqip + ":5112/api/getAllChargesDateWise",
                                "body": JSON.stringify({ date: createDate })
                            }, (error, response, body) => {
                                if (error) {
                                    res.json({ status: "500", message: "Internal Server Error" })
                                }
                                else {
                                    if (response.statusCode == 200) {
                                        var resp = JSON.parse(body);
                                        var GenCal = resp.charges;
                                        var Final = {
                                            "invoice": invoice, "CRNNo": CRNNo, "status": status, fName: fname,
                                            lName: lname,
                                            totalAmount: ta,
                                            type: type == "redeemCash" ? "sell" : type,
                                            "createDate": createDate,
                                            MOP: mop,
                                            applicableTAX: type == "buy" ? (GenCal.tax * 100).toString() : type == "transfer" ? (GenCal.gstOnTransferFee * 100).toString() : type == "redeemCash" ? (GenCal.sellTax * 100).toString() : (GenCal.tax * 100).toString(),
                                            PGType: pgtype, bankTXNID: banktxnid, payBy: payby, paymentCharge: paymentcharge,
                                            truCoin: truCoin
                                            /* "assetstore": assetstoreDoc */
                                        };
                                        res.json({ status: "1000", resource: Final });
                                    }
                                }
                            })
                        }
                    }
                })
            }
            else if (ttype === "transfer") {
                var match = { invoice: invoice, type: ttype }
                var respresult = TXN.aggregate([
                    { $match: match },
                    {
                        $project: {
                            invoice: 1, to: 1, from: 1, _id: 0, particularsG24: 1, createDate: 1, sourceFlag: 1,
                            particularsS99: 1, totalAmount: 1, status: 1, MOP: 1, type: 1
                        }
                    },
                    {
                        $lookup: {
                            from: "kycs",
                            localField: "to",
                            foreignField: "truID",
                            as: "cust"
                        }
                    },
                    { $unwind: "$cust" },
                    {
                        $lookup: {
                            from: "kycs",
                            localField: "particularsG24.from",
                            foreignField: "truID",
                            as: "sender"
                        }
                    },
                    { $unwind: "$sender" },
                    {
                        $lookup: {
                            from: "atomlogs",
                            localField: "invoice",
                            foreignField: "invoice",
                            as: "atomlogs"
                        }
                    },
                    { "$unwind": { "path": "$atomlogs", "preserveNullAndEmptyArrays": true } },
                    {
                        $project: {
                            invoice: 1, to: 1, from: 1, _id: 0, particularsG24: 1, sourceFlag: 1, particularsS99: 1,
                            totalAmount: 1, status: 1, MOP: 1, type: 1, createDate: 1, atomlogs: "$atomlogs",
                            CRNNo: '$sender.CRNNo', receiverCRNNo: '$cust.CRNNo',
                            gender: "$cust.gender", address: "$cust.permanentAddress", fName: "$cust.fName",
                            lName: "$cust.lName", assetstoreID: "$cust.currentassetstore", s_lName: "$sender.lName", s_assetstoreID: "$sender.currentassetstore",
                            s_gender: "$sender.gender", s_address: "$sender.permanentAddress", s_fName: "$sender.fName"
                        }
                    }
                ]);

                respresult.exec(function (err, result) {
                    if (err) {
                        response.status(500).send({ error: err })
                        return next(err);
                    }
                    else {
                        var resource = result[0];
                        if (resource === undefined) {
                            res.json({
                                status: "204",
                                message: 'The request was successful but you enterd wrong invoice number.'
                            });
                        }
                        else {
                            var invoice = resource.invoice;
                            var to = resource.to;
                            var status = resource.status;
                            var address = resource.address;
                            var fname = resource.fName;
                            var lname = resource.lName;
                            var mop = resource.MOP;
                            var CRNNo = resource.CRNNo;
                            var receiverCRNNo = resource.receiverCRNNo;
                            var type = resource.type;
                            var createDate = resource.createDate;
                            var assetstoreID = resource.assetstoreID;
                            // var s_address = resource.s_address;
                            var s_fname = resource.s_fName;
                            var s_lname = resource.s_lName;
                            // var s_tpa = resource.s_TPA;
                            //  var s_assetstoreID = resource.s_assetstoreID;
                            var truCoin;
                            var fromtruid24;
                            var ta = resource.totalAmount.toJSON().$numberDecimal;
                            function createParticular(particulars, bullionType) {
                                fromtruid24 = particulars.from;
                                var respartl = {}
                                respartl["TID"] = particulars.TID;
                                respartl["bullionType"] = bullionType;
                                respartl["quantity"] = particulars.qty.toJSON().$numberDecimal;
                                respartl["transferCharges"] = ta;
                                respartl["tax"] = particulars.tax.toJSON().$numberDecimal;
                                return respartl
                            }
                            if (resource.particularsG24.qty.toJSON().$numberDecimal != 0) {
                                truCoin = createParticular(resource.particularsG24, "G24K");
                            }
                            else {
                                truCoin = createParticular(resource.particularsS99, "S99P");
                            }
                            var atomlogs = resource.atomlogs;
                            var pgtype = undefined, banktxnid = undefined, payby = undefined, paymentcharge = undefined;
                            if (status === "success" && mop === "others" && (type === "transfer")) {
                                if (atomlogs) {
                                    var temppayby = atomlogs.MOP;
                                    pgtype = "atom";
                                    payby = (temppayby == "NB") ? "Net Banking" : (temppayby == "CC") ? "Credit Card" : (temppayby == "DC") ? "Debit Card" : (temppayby == "UP") ? "UPI" : temppayby;
                                    banktxnid = atomlogs.bankTxnID;
                                    paymentcharge = atomlogs.surcharge.toJSON().$numberDecimal;
                                }
                            }
                            request.post({
                                "headers": { "content-type": "application/json" },
                                "url": conf.adminreqip + ":5112/api/getAllChargesDateWise",
                                "body": JSON.stringify({ date: createDate })
                            }, (error, response, body) => {
                                if (error) {
                                    res.json({ status: "500", message: "Internal Server Error" })
                                }
                                else {
                                    if (response.statusCode == 200) {
                                        var resp = JSON.parse(body);
                                        var GenCal = resp.charges;
                                        var Final =
                                            ({
                                                "invoice": invoice,
                                                "CRNNo": CRNNo,
                                                "clientID": clientID,
                                                "status": status,
                                                "senderFName": s_lname,
                                                "senderLName": s_fname,
                                                "type": type,
                                                "createDate": createDate,
                                                "receiverFName": lname,
                                                "receiverLName": fname,
                                                "receiverCRNNo": receiverCRNNo,
                                                "MOP": mop,
                                                "PGType": pgtype,
                                                "bankTXNID": banktxnid,
                                                "applicableTAX": (GenCal.gstOnTransferFee * 100).toString(),
                                                "payBy": payby,
                                                "paymentCharge": paymentcharge,
                                                "truCoin": truCoin
                                                /* 
                                                "assetstore": assetstoreDoc, */
                                            });
                                        res.json({ status: "1000", resource: Final });
                                    }
                                }
                            })
                        }
                    }
                });
            }
        }
    })

}
exports.isOrderExist = function (req, res) {
    TXN.find({ "orderID": req.body.orderID }, function (err, docs) {
        if (docs.length) {
            res.status(200).json({ respCode: "403", message: "Order ID Already Exists..!!" });
        }
        else {
            res.status(200).json({ respCode: "200", message: "Order ID Not Exists..!!" });
        }
    })
}



function uniqueNumber() {
    var date = Date.now();

    if (date <= uniqueNumber.previous) {
        date = ++uniqueNumber.previous;
    } else {
        uniqueNumber.previous = date;
    }
    return date;
}

function particularsArr(particulars) {
    var resparticuls = {};
    resparticuls["TID"] = particulars ? particulars.TID ? particulars.TID : "0" : "0";
    resparticuls["from"] = particulars ? particulars.from ? particulars.from : "0" : "0";
    resparticuls["assetmanagerName"] = particulars ? particulars.assetmanagerName ? particulars.assetmanagerName : "0" : "0";
    resparticuls["qty"] = particulars ? particulars.qty ? particulars.qty.toJSON ? particulars.qty.toJSON().$numberDecimal : particulars.qty : "0" : "0";
    resparticuls["rate"] = particulars ? particulars.rate ? particulars.rate.toJSON ? particulars.rate.toJSON().$numberDecimal : particulars.rate : "0" : "0";

    resparticuls["qtyAgainstTxnChgs"] = particulars ? particulars.qtyAgainstTxnChgs ? particulars.qtyAgainstTxnChgs.toJSON ? particulars.qtyAgainstTxnChgs.toJSON().$numberDecimal : particulars.qtyAgainstTxnChgs : "0" : "0";
    resparticuls["grossRate"] = particulars ? particulars.grossRate ? particulars.grossRate.toJSON ? particulars.grossRate.toJSON().$numberDecimal : particulars.grossRate : "0" : "0";
    resparticuls["baseRate"] = particulars ? particulars.baseRate ? particulars.baseRate.toJSON ? particulars.baseRate.toJSON().$numberDecimal : particulars.baseRate : "0" : "0";
    resparticuls["grossamount"] = particulars ? particulars.grossamount ? particulars.grossamount.toJSON ? particulars.grossamount.toJSON().$numberDecimal : particulars.grossamount : "0" : "0";
    resparticuls["baseamount"] = particulars ? particulars.baseamount ? particulars.baseamount.toJSON ? particulars.baseamount.toJSON().$numberDecimal : particulars.baseamount : "0" : "0";
    resparticuls["grosspartnerCharges"] = particulars ? particulars.grosspartnerCharges ? particulars.grosspartnerCharges.toJSON ? particulars.grosspartnerCharges.toJSON().$numberDecimal : particulars.grosspartnerCharges : "0" : "0";
    resparticuls["tdsonpartnerCharges"] = particulars ? particulars.tdsonpartnerCharges ? particulars.tdsonpartnerCharges.toJSON ? particulars.tdsonpartnerCharges.toJSON().$numberDecimal : particulars.tdsonpartnerCharges : "0" : "0";
    resparticuls["grossnodeCharges"] = particulars ? particulars.grossnodeCharges ? particulars.grossnodeCharges.toJSON ? particulars.grossnodeCharges.toJSON().$numberDecimal : particulars.grossnodeCharges : "0" : "0";
    resparticuls["tdsonnodeCharges"] = particulars ? particulars.tdsonnodeCharges ? particulars.tdsonnodeCharges.toJSON ? particulars.tdsonnodeCharges.toJSON().$numberDecimal : particulars.tdsonnodeCharges : "0" : "0";

    resparticuls["amount"] = particulars ? particulars.amount ? particulars.amount.toJSON ? particulars.amount.toJSON().$numberDecimal : particulars.amount : "0" : "0";
    resparticuls["assetmanagersCharges"] = particulars ? particulars.assetmanagersCharges ? particulars.assetmanagersCharges.toJSON ? particulars.assetmanagersCharges.toJSON().$numberDecimal : particulars.assetmanagersCharges : "0" : "0";
    resparticuls["otherCharges"] = particulars ? particulars.otherCharges ? particulars.otherCharges.toJSON ? particulars.otherCharges.toJSON().$numberDecimal : particulars.otherCharges : "0" : "0";
    resparticuls["assetstoreCharges"] = particulars ? particulars.assetstoreCharges ? particulars.assetstoreCharges.toJSON ? particulars.assetstoreCharges.toJSON().$numberDecimal : particulars.assetstoreCharges : "0" : "0";
    resparticuls["transactionCharges"] = particulars ? particulars.transactionCharges ? particulars.transactionCharges.toJSON ? particulars.transactionCharges.toJSON().$numberDecimal : particulars.transactionCharges : "0" : "0";
    resparticuls["partnerCharges"] = particulars ? particulars.partnerCharges ? particulars.partnerCharges.toJSON ? particulars.partnerCharges.toJSON().$numberDecimal : particulars.partnerCharges : "0" : "0";
    resparticuls["nodeCharges"] = particulars ? particulars.nodeCharges ? particulars.nodeCharges.toJSON ? particulars.nodeCharges.toJSON().$numberDecimal : particulars.nodeCharges : "0" : "0";
    resparticuls["clientTransactionCharges"] = particulars ? particulars.clientTransactionCharges ? particulars.clientTransactionCharges.toJSON ? particulars.clientTransactionCharges.toJSON().$numberDecimal : particulars.clientTransactionCharges : "0" : "0";
    resparticuls["txnLoading"] = particulars ? particulars.txnLoading ? particulars.txnLoading.toJSON ? particulars.txnLoading.toJSON().$numberDecimal : particulars.txnLoading : "0" : "0";
    resparticuls["remmitCharges"] = particulars ? particulars.remmitCharges ? particulars.remmitCharges.toJSON ? particulars.remmitCharges.toJSON().$numberDecimal : particulars.remmitCharges : "0" : "0";
    resparticuls["transferFee"] = particulars ? particulars.transferFee ? particulars.transferFee.toJSON ? particulars.transferFee.toJSON().$numberDecimal : particulars.transferFee : undefined : "0";
    resparticuls["tax"] = particulars ? particulars.tax ? particulars.tax.toJSON ? particulars.tax.toJSON().$numberDecimal : particulars.tax : "0" : "0";
    resparticuls["total"] = particulars ? particulars.total ? particulars.total.toJSON ? particulars.total.toJSON().$numberDecimal : particulars.total : "0" : "0";
    return resparticuls;
}



exports.wallet_logInPartner_report = function (req, res) {
    var query;
    var truid = req.body.truid;
    var ttype = req.body.flag;
    var quryPara = {};
    if (ttype) {
        quryPara = { "tType": ttype }
    }
    if (req.body.dateFlag && req.body.truid) {
        var startdate = new Date(Date.parse(req.body.startdate));
        var enddate = new Date(Date.parse(req.body.enddate) + (1000 * 3600 * 24));
        quryPara.createDate = { $gte: startdate, $lte: enddate };
        quryPara.truID = truid;
    }
    else if (!req.body.dateFlag && req.body.truid) {
        quryPara.truID = truid;
    } else {
        quryPara.truID = truid;
    }

    query = [{ $match: quryPara },
    { $sort: { createDate: -1 } },
    {
        $project: {
            _id: 0, tType: 1, createDate: 1, truID: 1, Cr: { $toString: { $abs: '$Cr' } }, Dr: { $toString: { $abs: '$Dr' } },
            invoice: 1, particulars: 1, status: 1,
            againstInvoice: { $ifNull: ["$againstInvoice", "0"] }, subType: { $ifNull: ["$subType", "NA"] }
        }
    },
    {
        $lookup: {
            from: "txns",
            localField: "invoice",
            foreignField: "invoice",
            as: "txninvoice"
        }
    },
    { $unwind: { path: "$txninvoice", preserveNullAndEmptyArrays: true } },
    {
        $lookup: {
            from: "atomlogs",
            localField: "invoice",
            foreignField: "invoice",
            as: "atominvoice"
        },
    },
    { $unwind: { path: "$atominvoice", preserveNullAndEmptyArrays: true } },

    {
        $lookup: {
            from: "banklogs",
            localField: "invoice",
            foreignField: "invoice",
            as: "bankinvoice"
        }
    },
    { $unwind: { path: "$bankinvoice", preserveNullAndEmptyArrays: true } },
    {
        $lookup: {
            from: "mops",
            let: { truid: "$truID", accountno: "$bankinvoice.Ben_Acct_No" },
            pipeline: [
                {
                    $match: {
                        $expr: {
                            $and:
                                [{ $eq: ["$truID", "$$truid"] }]
                        }
                    }
                },
                { $project: { truID: 1, accountDetails: "$MOP.accountDetails" } },
                { $unwind: "$accountDetails" },
                {
                    $match: {
                        $expr: {
                            $and:
                                [{ $eq: ["$accountDetails.accountNo", "$$accountno"] }]
                        }
                    }

                },
            ],
            as: "bankDetails"
        }
    },
    { $unwind: { path: "$bankDetails", preserveNullAndEmptyArrays: true } },
    {
        $project: {
            mop: { $cond: { if: { $eq: ["$tType", "walletToBank"] }, then: "$bankinvoice.Mode_of_Pay", else: { $cond: { if: { $eq: ["$subType", "VA"] }, then: "Virtual Account", else: "$atominvoice.MOP" } } } },
            pgType: { $cond: { if: { $eq: ["$tType", "walletToBank"] }, then: pgRedeemTypeSwitch, else: { $cond: { if: { $eq: ["$tType", "addMoney"] }, then: { $cond: { if: { $eq: ["$subType", "VA"] }, then: "VA", else: "atom", } }, else: "" } } } },
            bankTxnID: { $cond: { if: { $eq: ["$tType", "walletToBank"] }, then: "$bankinvoice.TranID", else: "$atominvoice.bankTxnID" } },
            bankName: { $cond: { if: { $eq: ["$tType", "walletToBank"] }, then: "$bankDetails.accountDetails.bankName", else: { $ifNull: ["$atominvoice.bankName", "-"] } } },
            _id: 0, tType: 1, createDate: 1, truID: 1, Cr: 1, Dr: 1, invoice: 1, particulars: 1, status: 1,
            againstInvoice: { $ifNull: ["$againstInvoice", "$invoice"] },
            creditDate: "$va.creditDate",
            senderName: { $cond: { if: { $eq: ["$tType", "walletToBank"] }, then: "$bankDetails.accountDetails.companyName", else: "-" } },
            senderAccountNumber: { $cond: { if: { $eq: ["$tType", "walletToBank"] }, then: "$bankDetails.accountDetails.accountNo", else: "$va.senderAccountNumber" } },
            senderIFSC: { $cond: { if: { $eq: ["$tType", "walletToBank"] }, then: "$bankDetails.accountDetails.IFSC", else: "-" } }
        }
    }, {
        $project: {
            mop: 1,
            pgType: 1,
            bankTxnID: 1,
            error_Desc: 1,
            bankName: 1,
            _id: 0, tType: 1, createDate: 1, truID: 1, Cr: 1, Dr: 1, invoice: 1, particulars: 1, status: 1,
            againstInvoice: 1,
            beneficiaryAccountNumber: {
                $concat: ["XXXXXXXXX",
                    {
                        $substr: [
                            { $ifNull: ["$beneficiaryAccountNumber", "XXXXXX"] }, {
                                $subtract: [{
                                    $strLenCP: { $ifNull: ["$beneficiaryAccountNumber", "XXXXXX"] }
                                }, 4]
                            }, -1]
                    }]
            },
            creditDate: 1,
            senderName: 1,
            senderIFSC: 1,
            messageType: 1,
            UTRNumber: 1,
            upi: 1,
            senderAccountNumber: {
                $concat: ["XXXXXXXXX",
                    {
                        $substr: [
                            { $ifNull: ["$senderAccountNumber", "XXXXXX"] }, {
                                $subtract: [{
                                    $strLenCP: { $ifNull: ["$senderAccountNumber", "XXXXXX"] }
                                }, 4]
                            }, -1]
                    }]
            }
        }
    }
    ];
    if (!req.body.dateFlag) {
        query.push({ $limit: 30 });
    }
    WalletLog.aggregate(query).exec(function (err, result) {
        if (err) {
            res.status(500).send({ error: err })
        } else {
            res.json({ status: "200", resource: result })
        }
    })
};


exports.statusEnquiry = async function (req, res) {
    var query = { to: req.body.rTruID, "type": "payment" };
    if (req.body.orderID) {
        query.orderID = req.body.orderID;
    }
    if (req.body.truID) {
        var xquryquery = {
            ...query,
            "particularsG24.from": req.body.truID
        };
        query = xquryquery;
    }
    if (req.body.startDate && req.body.endDate) {
        var startdate = new Date(Date.parse(req.body.startDate));
        var enddate = new Date(Date.parse(req.body.endDate));
        enddate.setHours(24, 0, 0, 0);
        query.createDate = { $gt: startdate, $lte: enddate };
    }
    var resultArr = TXN.aggregate([{
        $match: query
    },
    { $sort: { createDate: -1 } },
    {
        $project: {
            orderID: 1,
            invoice: 1, to: 1, from: 1, rTruID: 1, _id: 0, particularsG24: 1, particularsS99: 1, otherCharges: 1, remmitCharges: 1, totalAmount: 1,
            status: 1, type: 1, MOP: 1, ModeOfPay: 1, createDate: 1, paymentFor: 1, refundedDate: 1, merchantID: 1
        }
    }]);
    var result = new Array();
    var enDetails = await enKycAll.findOne({ truID: req.body.rTruID }).select({ companyName: 1 });
    var receiver = enDetails.companyName;
    for await (const resource of resultArr) {
        var invoice = resource.invoice;
        var orderID = resource.orderID;
        var status = resource.status;
        var refundedDate = resource.refundedDate;
        var paymentFor = resource.paymentFor;
        var createDate = resource.createDate;
        var q24v = resource.particularsG24.qty ? resource.particularsG24.qty.toJSON().$numberDecimal : "0";
        var q99v = resource.particularsS99.qty ? resource.particularsS99.qty.toJSON().$numberDecimal : "0";
        //totalAmount
        var tav = resource.totalAmount.toJSON().$numberDecimal;
        var Final = {
            "sender": q24v == "0" ? resource.particularsS99.assetmanagerName : resource.particularsG24.assetmanagerName,
            "orderID": orderID,
            "txnID": invoice,
            "CRNNo": req.body.CRNNo,
            "clientID": req.body.clientID,
            "status": status,
            "totalAmount": tav,
            "payByValue": q24v == "0" ? "G99P" : "G24K",
            "remark": paymentFor,
            "paymentDate": createDate,
            "value": q24v == "0" ? decimalChopper(q99v, 4) : decimalChopper(q24v, 4),
            "receiver": receiver
        };
        if (status == "pgRefund") {
            Final.refundDate = refundedDate;
        }
        result.push(Final)
    }
    res.status(200).json({ respCode: "1000", resource: result });
}