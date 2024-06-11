'use strict'
var randomize = require('randomatic'),
    request = require('request'),
    KycAll = require('../models/custKYCAllModel'),
    Stock = require('../models/custStockModel'),
    TXN = require('../models/custTXNModelClient'),
    conf = require("../conf"),
    ConsumerConfig = require('../consumerConfig/validate.limit.controller'),
    txnStockLog = require("./stock.controller"),
    Account = require("../models/custMOPModel"),
    calculate = require('./calculation.controller'),
    md5 = require('md5'),
    { encryption } = require('./encrypt');
var fs = require('fs'),
    path = require('path'),

    defaultConf = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../regionConf.json')));

let reqip = conf.reqip;
function validatePaymodes(mop, walletaccess, paymentmodeaccess) {
    let accessarray = ["disable", "hide"];
    if (mop === "truWallet" && walletaccess && paymentmodeaccess && (accessarray.includes(walletaccess) || accessarray.includes(paymentmodeaccess))) {
        return ("Your payment mode and wallet access are disabled. Please contact your Administrator.");
    } else {
        return (200)
    }
}
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
exports.client_buy_bullions = function (req, res) {
    let Gen = req.generalCharges;
    let topassetmanager = req.topassetmanager;
    // let channel = req.body.MID;
    var date = new Date(); // today's date and time in ISO 
    var value = parseFloat(req.body.value),
        crnno = req.body.crnno,
        rtruid = req.body.rtruid,
        invoice = req.body.invoice,
        clientid = req.body.clientid,
        partnercharges = 0,
        nodecharges = 0,
        bulliontype = req.body.bulliontype;
    if (req.body.status == "failure") {
        invoice = createInvoice();
    }
    if (req.body.isParent) {
        var pcharge = req.body.partnercharges == 0 ? Gen.partnerCharges : req.body.partnercharges,
            acharge = req.body.nodecharges == 0 ? Gen.nodeCharges : req.body.nodecharges;
        partnercharges = pcharge + acharge;
        nodecharges = 0;
    } else {
        partnercharges = req.body.partnercharges == 0 ? Gen.partnerCharges : req.body.partnercharges;
        nodecharges = req.body.nodecharges == 0 ? Gen.nodeCharges : req.body.nodecharges;
    }
    if (req.body.transactiontype == "buy" || req.body.transactiontype == "buyCash") {
        if (value == "0" && req.body.transactiontype == "buy") { res.status(411).json({ status: "411", message: "No Quantity Selected" }) }
        else if (value != "0") {
            KycAll.find({
                "CRNNo": crnno, KYCFlag: "active"
            }, function (err, docs) {
                if (!docs.length) {
                    res.status(411).json({ status: "411", message: "Consumer don't have permission to trasact" });
                } else {
                    var totruid = docs[0].truID;
                    request.post({
                        "headers": { "content-type": "application/json" },
                        "url": reqip + ":4125/api/showconsumerconfigurations",
                        "body": JSON.stringify({ "kycflag": "KYC", "appliedOn": "entity", "truid": rtruid })
                    }, (err, response, body) => {
                        if (err || !body) {
                            res.status(411).json({ status: "411", message: "Please reset your configurations." });
                        } else {
                            var configbody = JSON.parse(body);
                            if (configbody.status === "204") {
                                res.status(411).json({ status: "411", message: "Please check your configurations." });
                            }
                            else {
                                var walletaccess = configbody.resource.moduleSelf.walletAccess;
                                var paymentmodeaccess = configbody.resource.moduleSelf.payByWallet;

                                var respvalpaymodes = validatePaymodes(req.body.mop, walletaccess, paymentmodeaccess);
                                if (respvalpaymodes === 200) {
                                    var amtruid = bulliontype == "G24K" ? topassetmanager.trucoin_24kgold.truID : topassetmanager.trucoin_99Pure.truID;

                                    if (req.body.status == "success") {
                                        var md5hash = invoice + totruid + rtruid + req.body.status + req.body.transactiontype + req.body.mop + req.body.bulliontype + parseFloat(req.body.value);
                                        TXN.find({
                                            "invoice": invoice,
                                            "to": totruid,
                                            "md5sign": md5(md5hash),
                                            "status": "failure"
                                        }, function (err, docs) {
                                            if (!docs.length) {
                                                res.status(411).json({ status: "411", message: "Please enter correct invoice number." });
                                            } else {
                                                stockvalidation();
                                            }
                                        })
                                    }
                                    else {
                                        stockvalidation();
                                    }
                                    function stockvalidation() {
                                        var type = req.body.transactiontype;
                                        var result = topassetmanager;
                                        var g24rate = result.trucoin_24kgold.rate;
                                        var s99rate = result.trucoin_99Pure.rate;
                                        var is24kIs = bulliontype == "G24K";
                                        var g24qty = !is24kIs ? parseFloat("0") : parseFloat(req.body.value);
                                        var g24netrate = !is24kIs ? parseFloat("0") : parseFloat(g24rate);  //base rate set from assetmanager
                                        if (is24kIs && type == "buyCash") {
                                            g24qty = g24qty / g24netrate;
                                        }
                                        var is99sIs = bulliontype == "S99P";
                                        var s99qty = !is99sIs ? parseFloat("0") : parseFloat(req.body.value);
                                        var s99netrate = !is99sIs ? parseFloat("0") : parseFloat(s99rate);  //base rate set from assetmanager
                                        if (is99sIs && type == "buyCash") {
                                            s99qty = s99qty / s99netrate;
                                        }
                                        request.post({
                                            "headers": {
                                                "content-type": "application/json"
                                            },
                                            "url": reqip + ":4125/api/validateclientstock",
                                            "body": JSON.stringify({
                                                "amtruid": amtruid,
                                                "bulliontype": bulliontype,
                                                "quantity": bulliontype == "G24K" ? g24qty : s99qty
                                            })
                                        }, async (error, response, body) => {
                                            if (error) {
                                                return console.dir(error);
                                            } else {
                                                var results = JSON.parse(body);
                                                var validationstatus = results.status;
                                                if (validationstatus == "200") {
                                                    var particularsG24 = {}, particularsS99 = {},
                                                        stockNA = new Array(),
                                                        qtyNA = new Array(),
                                                        inputNA = new Array(),
                                                        status = req.body.status,
                                                        totaladd = 0, remmitcharges = 0, totaltax = 0;
                                                    date = new Date(); // today's date and time in ISO format

                                                    function fromServer(Gen, amtruid, sqty, bulltype, arr) {
                                                        return new Promise((resolve, reject) => {
                                                            if (sqty !== 0 && sqty > 0) {
                                                                var particulsStockNA = {};
                                                                async function generateParticular(Gen, amtruid, bulltype, sqty) {
                                                                    var fcrgs = await calculate.Buy_calculation_remmit(Gen, amtruid, bulltype, sqty, rtruid);
                                                                    if (fcrgs.status === "200" || fcrgs.stockstatus === "resolve") {
                                                                        totaladd += fcrgs.total;
                                                                        totaltax += fcrgs.tax;
                                                                        remmitcharges += fcrgs.remmitCharges;
                                                                        resolve(Object.assign(arr, particularsArr(fcrgs)));
                                                                    } else {
                                                                        // particulsStockNA = sqty;
                                                                        particulsStockNA["bullionType"] = bulltype;
                                                                        resolve(stockNA.push(particulsStockNA));
                                                                    }
                                                                }
                                                                generateParticular(Gen, amtruid, bulltype, sqty);

                                                            } else {
                                                                resolve(Object.assign(arr, particularsArr()));
                                                            }
                                                        })
                                                    }

                                                    if (bulliontype == "G24K" && g24qty !== 0 && g24qty > 0) {
                                                        await fromServer(Gen, amtruid, g24qty, "G24K", particularsG24);
                                                    } else {
                                                        particularsG24 = particularsArr();
                                                    }

                                                    if (bulliontype == "S99P" && s99qty !== 0 && s99qty > 0) {
                                                        await fromServer(Gen, amtruid, s99qty, "S99P", particularsS99);
                                                    } else {
                                                        particularsS99 = particularsArr();
                                                    }
                                                    var mop = req.body.mop;
                                                    var md5hash = invoice + totruid + rtruid + "success" + req.body.transactiontype + mop + req.body.bulliontype + parseFloat(req.body.value);
                                                    var tocrypt = {
                                                        to: totruid,
                                                        rTruID: rtruid,
                                                        invoice: invoice,
                                                        type: "buy",
                                                        sourceFlag: "remmit",
                                                        particularsG24: particularsG24,
                                                        particularsS99: particularsS99,
                                                        tdsPercentage: particularsG24.tdsPercentage > 0 ? particularsG24.tdsPercentage : particularsS99.tdsPercentage,
                                                        loadingPercentage: particularsG24.loadingPercentage > 0 ? particularsG24.loadingPercentage : particularsS99.loadingPercentage,
                                                        remmitCharges: remmitcharges,
                                                        totalAmount: totaladd,
                                                        createDate: date,
                                                        status: status,
                                                        md5sign: md5(md5hash),
                                                        MOP: mop
                                                    };

                                                    var rational = JSON.stringify(tocrypt);
                                                    encrypt(rational);
                                                    function encrypt(rational) {
                                                        var crypted = encryption(rational);
                                                        if (mop != "truWallet" && mop != "others") {
                                                            res.status(411).json({ status: "411", message: "Please provide valid method of payment." });
                                                        }
                                                        else if (mop === "truWallet") {
                                                            if (walletaccess != "disable") {
                                                                tocrypt.hash = crypted;
                                                                if (req.body.status == "failure") {
                                                                    request.post({
                                                                        "headers": { "content-type": "application/json" },
                                                                        "url": reqip + ":4121/api/checkpartnerWalletTxn",
                                                                        "body": JSON.stringify({
                                                                            "truid": rtruid,
                                                                            "totaladd": totaladd
                                                                        })
                                                                    }, (error, response, body) => {
                                                                        if (error) {
                                                                            res.status(500).json({ status: "500", message: "Internal Server Error" });
                                                                        } else {
                                                                            if (response.statusCode === 200) {
                                                                                var newclient = JSON.parse(body)
                                                                                if (newclient.status == "200") {
                                                                                    var clientTXN = new TXN(tocrypt);
                                                                                    clientTXN.save(function (err, result) {
                                                                                        if (err) {
                                                                                            res.status(411).json({ status: "411", message: "InValid Request" });
                                                                                        }
                                                                                        else {
                                                                                            callback(null)
                                                                                        }
                                                                                    })
                                                                                } else {
                                                                                    res.status(411).json(newclient);
                                                                                }
                                                                            }
                                                                            else {
                                                                                res.status(411).json({ status: "411", message: "Something Went Wrong" });
                                                                            }
                                                                        }
                                                                    })
                                                                }
                                                                else if (req.body.status == "success") {
                                                                    request.post({
                                                                        "headers": { "content-type": "application/json" },
                                                                        "url": reqip + ":4121/api/entitywalletupdatetxn",
                                                                        "body": JSON.stringify({
                                                                            "truid": rtruid,
                                                                            "totaladd": totaladd,
                                                                            "invoice": invoice,
                                                                            "tType": "buy",
                                                                            "g24qty": bulliontype == "G24K" ? g24qty : 0,
                                                                            "s99qty": bulliontype == "S99P" ? s99qty : 0
                                                                        })
                                                                    }, (error, response, body) => {
                                                                        if (error) {
                                                                            return console.log(error);
                                                                        } else {
                                                                            var otpresultstatus = JSON.parse(body).status;
                                                                            if (otpresultstatus != "200") {
                                                                                res.status(411).json({ status: "411", message: "Insufficient balance." });

                                                                            } else {
                                                                                if (req.body.status == "success") {
                                                                                    TXN.updateOne({
                                                                                        "invoice": invoice
                                                                                    }, {
                                                                                        $set: tocrypt
                                                                                    }, callback)
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                    )
                                                                }
                                                                function callback(err, numAffected) {
                                                                    if (err) {
                                                                        res.send(err);
                                                                    }

                                                                    var respresult = TXN.aggregate([{
                                                                        $match: { "invoice": invoice }
                                                                    },
                                                                    {
                                                                        $project: {
                                                                            invoice: 1, to: 1, from: 1, rTruID: 1, _id: 0, particularsG24: 1, particularsS99: 1, remmitCharges: 1,
                                                                            totalAmount: 1, status: 1, type: 1, createDate: 1
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
                                                                    {
                                                                        $unwind: "$cust"
                                                                    },
                                                                    {
                                                                        $project: {
                                                                            invoice: 1, to: 1, from: 1, rTruID: 1, _id: 0, particularsG24: 1, particularsS99: 1, remmitCharges: 1,
                                                                            totalAmount: 1, status: 1, createDate: 1, gender: "$cust.genderc", address: "$cust.permanentAddress",
                                                                            fName: "$cust.fName", lName: "$cust.lName", mobile: "$cust.mobile", email: "$cust.email",
                                                                            emailVerified: "$cust.emailVerified", type: 1
                                                                        }
                                                                    }
                                                                    ]);
                                                                    respresult.exec(async function (err, result) {
                                                                        if (err) {
                                                                            response.status(500).send({
                                                                                error: err
                                                                            })
                                                                            return next(err);
                                                                        }
                                                                        else {
                                                                            var resource = result[0];
                                                                            var invoice = resource.invoice;
                                                                            var to = resource.to;
                                                                            var rtruid = resource.rTruID;
                                                                            var status = resource.status;
                                                                            var address = resource.address;
                                                                            var fname = resource.fName;
                                                                            var lname = resource.lName;
                                                                            var tid24 = resource.particularsG24.TID;
                                                                            var from24 = resource.particularsG24.assetmanagerName;
                                                                            var q24v = resource.particularsG24.qty.toJSON().$numberDecimal;
                                                                            var r24v = resource.particularsG24.rate.toJSON().$numberDecimal;
                                                                            var a24v = resource.particularsG24.amount.toJSON().$numberDecimal;
                                                                            var tx24v = resource.particularsG24.tax.toJSON().$numberDecimal;
                                                                            var t24v = resource.particularsG24.total.toJSON().$numberDecimal;

                                                                            //Rate S99P
                                                                            var tid99 = resource.particularsS99.TID;
                                                                            var from99 = resource.particularsS99.assetmanagerName;
                                                                            var q99v = resource.particularsS99.qty.toJSON().$numberDecimal;
                                                                            var r99v = resource.particularsS99.rate.toJSON().$numberDecimal;
                                                                            var a99v = resource.particularsS99.amount.toJSON().$numberDecimal;
                                                                            var tx99v = resource.particularsS99.tax.toJSON().$numberDecimal;
                                                                            var t99v = resource.particularsS99.total.toJSON().$numberDecimal;

                                                                            //totalAmount
                                                                            var tav = resource.totalAmount.toJSON().$numberDecimal;
                                                                            var createDate = resource.createDate;
                                                                            var truCoin = undefined;
                                                                            if (bulliontype == "G24K") {
                                                                                truCoin = {
                                                                                    "TID": tid24, "rateFrom": from24, "quantity": q24v,
                                                                                    "rate": r24v, "tax": tx24v, "valuation": a24v,
                                                                                    "total": t24v,
                                                                                    "bullionType": "G24K"
                                                                                }
                                                                            }
                                                                            else if (bulliontype == "S99P") {
                                                                                truCoin = {
                                                                                    "TID": tid99,
                                                                                    "rateFrom": from99,
                                                                                    "quantity": q99v,
                                                                                    "rate": r99v,
                                                                                    "tax": tx99v,
                                                                                    "valuation": a99v,
                                                                                    "total": t99v,
                                                                                    "bullionType": "S99P"
                                                                                }
                                                                            }

                                                                            var Final = ({
                                                                                "invoice": invoice,
                                                                                "CRNNo": crnno,
                                                                                "clientID": clientid,
                                                                                "status": status,
                                                                                "address": address,
                                                                                "fName": fname,
                                                                                "lName": lname,
                                                                                "totalAmount": tav,
                                                                                "transactionType": "buy",
                                                                                "GSTIN": "07AAFCT6383H2ZZ",
                                                                                "MOP": mop,
                                                                                "truCoin": truCoin,
                                                                                "createDate": createDate,
                                                                                "applicableTAX": (Gen.tax * 100).toString()
                                                                            });
                                                                            if (status === "success") {
                                                                                if (!isNaN(q24v) && parseFloat(q24v) > 0) {
                                                                                    calculate.update_assetmanager_stock(resource.particularsG24.from, resource.to, "G24K", q24v, "buy", invoice);
                                                                                }
                                                                                if (!isNaN(q99v) && parseFloat(q99v) > 0) {
                                                                                    calculate.update_assetmanager_stock(resource.particularsS99.from, resource.to, "S99P", q99v, "buy", invoice);
                                                                                }
                                                                                initiateEntityRevenueRefundFloat(rtruid, invoice);
                                                                                calculate.update_stock(to, q24v, q99v, "buy", invoice);
                                                                                notification(to, resource.particularsG24.from, resource.particularsS99.from, crnno, invoice, q24v, q99v, "buy", tav, mop);
                                                                            }
                                                                            res.status(200).json({ status: "1000", resource: Final });
                                                                        }
                                                                    });
                                                                };
                                                            } else {
                                                                res.status(411).json({
                                                                    status: "411",
                                                                    message: "Your Wallet is disabled. Please contact your Administrator."
                                                                });
                                                            }
                                                        }
                                                    }




                                                } else if (validationstatus == "24") {
                                                    res.status(411).json({
                                                        status: "411",
                                                        message: "transaction terminated please select lesser quantity of G24K"
                                                    })
                                                }
                                                else if (validationstatus == "99") {
                                                    res.status(411).json({
                                                        status: "411",
                                                        message: "transaction terminated please select lesser quantity of S99P"
                                                    });
                                                } else {
                                                    res.status(411).json({
                                                        status: "411",
                                                        message: "you have choosen wrong assetmanager"
                                                    }
                                                    )
                                                }
                                            }
                                        }
                                        )
                                    }
                                    /*  }
                                 }
                                 ) */
                                } else {
                                    res.json({ status: "204", message: respvalpaymodes })
                                }
                            }
                        }
                    }
                    )
                }
            }
            )

        }
    }
    else {
        res.status(411).json({ status: "411", message: "The transaction type must be 'buy' or 'buyCash'" })
    }
}
exports.client_redeem_bullions_cash = function (req, res) {
    let Gen = req.generalCharges;
    let topassetmanager = req.topassetmanager;
    var value = parseFloat(req.body.value),
        crnno = req.body.crnno,
        rtruid = req.body.rtruid,
        invoice = req.body.invoice,
        amtruid,
        clientid = req.body.clientid,
        mop = req.body.mop,
        bulliontype = req.body.bulliontype;
    var otp = req.body.otp;
    if (req.body.status == "failure") {
        invoice = createInvoice()
    }
    if (req.body.transactiontype == "sell" || req.body.transactiontype == "sellCash") {

        if (value == "0") {
            res.status(411).json({ status: "411", message: "invalid Value" })
        }
        else if (value != "0") {
            KycAll.find({
                "CRNNo": crnno, KYCFlag: "active"
            }, function (err, docs) {
                if (!docs.length) {
                    res.status(411).json({ status: "411", message: "Invalid CRNNo..!!" });
                } else {
                    var totruid = docs[0].truID;
                    //var mobile=docs[0].mobile;
                    if (bulliontype == "G24K") {
                        amtruid = bulliontype == "G24K" ? topassetmanager.trucoin_24kgold.truID : "0";
                    }
                    else if (bulliontype == "S99P") {
                        amtruid = bulliontype == "S99P" ? topassetmanager.trucoin_99Pure.truID : "0";
                    }

                    request.post({
                        "headers": { "content-type": "application/json" },
                        "url": reqip + ":4125/api/showconsumerconfigurations",
                        "body": JSON.stringify({ "kycflag": "KYC", "appliedOn": "entity", "truid": rtruid })
                    }, (err, response, body) => {
                        if (err || !body) {
                            res.status(411).json({ status: "411", message: "Please reset your configurations." });
                        }
                        else {
                            var configbody = JSON.parse(body);
                            if (configbody.status === "204") {
                                res.status(411).json({ status: "411", message: "Please check your configurations." });
                            }
                            else {
                                var walletaccess = configbody.resource.moduleSelf.walletAccess;
                                var paymentmodeaccess = configbody.resource.moduleSelf.payByWallet;
                                var respvalpaymodes = validatePaymodes(req.body.mop, walletaccess, paymentmodeaccess);
                                if (respvalpaymodes === 200) {
                                    if (req.body.status == "success") {
                                        var md5hash = invoice + totruid + rtruid + req.body.status + req.body.transactiontype + req.body.mop + req.body.bulliontype + parseFloat(req.body.value);

                                        TXN.find({
                                            "invoice": invoice,
                                            "to": totruid,
                                            "md5sign": md5(md5hash),
                                            "status": "failure"
                                        }, function (err, docs) {
                                            if (!docs.length) {
                                                res.status(411).json({
                                                    status: "411",
                                                    message: "Please enter correct invoice number."
                                                });
                                            } else {
                                                stockvalidation();
                                            }
                                        })
                                    }
                                    else {
                                        stockvalidation();
                                    }
                                    function stockvalidation(err, numAffected) {

                                        if (walletaccess != "disable") {
                                            var result = topassetmanager;
                                            var g24rate = result.trucoin_24kgold.rate;
                                            var s99rate = result.trucoin_99Pure.rate;
                                            var is24kIs = bulliontype == "G24K";
                                            var is99sIs = bulliontype == "S99P";

                                            var g24qty = !is24kIs ? parseFloat("0") : parseFloat(req.body.value);
                                            var s99qty = !is99sIs ? parseFloat("0") : parseFloat(req.body.value);

                                            if (is24kIs && req.body.transactiontype == "sellCash") {
                                                g24qty = parseFloat(req.body.value) / g24rate;
                                            }
                                            if (is99sIs && req.body.transactiontype == "sellCash") {
                                                s99qty = parseFloat(req.body.value) / s99rate;
                                            }
                                            request.post({
                                                "headers": {
                                                    "content-type": "application/json"
                                                },
                                                "url": reqip + ":4114/api/inclientvalidatestock",
                                                "body": JSON.stringify({
                                                    "totruid": totruid,
                                                    "bulliontype": bulliontype,
                                                    "quantity": bulliontype == "G24K" ? g24qty : s99qty
                                                })
                                            }, (error, response, body) => {
                                                if (error) {
                                                    return console.dir(error);
                                                }
                                                else {
                                                    var results = JSON.parse(body);
                                                    var validationstatus = results.status;
                                                    if (validationstatus == "200") {
                                                        CalcualteSell(results)

                                                    } else if (validationstatus == "24") {
                                                        res.status(411).json({
                                                            status: "24",
                                                            message: "24K Gold TruCoin stock is not available"
                                                        });
                                                    } else if (validationstatus == "99") {
                                                        res.status(411).json({
                                                            status: "99",
                                                            message: "99.9% Silver TruCoin stock is not available"
                                                        });
                                                    }
                                                    else {
                                                        res.status(411).json({
                                                            status: "411",
                                                            message: "TruCoin stock not available"
                                                        });
                                                    }
                                                }
                                            })
                                            async function CalcualteSell(results) {

                                                var status = req.body.status;
                                                var particularsG24 = {}, particularsS99 = {},
                                                    stockNA = new Array(),
                                                    totaladd = 0, remmitcharges = 0, totaltax = 0;

                                                function fromServer(Gen, amtruid, sqty, bulltype, arr) {
                                                    return new Promise((resolve, reject) => {
                                                        if (sqty !== 0 && sqty > 0) {
                                                            var particulsStockNA = {};
                                                            async function generateParticular(Gen, amtruid, bulltype, sqty) {
                                                                var fcrgs = await calculate.redeemCash_calculation_remmit(Gen, amtruid, bulltype, sqty, totruid, rtruid);
                                                                if (fcrgs.status === "200" || fcrgs.stockstatus === "resolve") {
                                                                    totaladd += fcrgs.total;
                                                                    totaltax += fcrgs.tax;
                                                                    remmitcharges += fcrgs.remmitCharges;
                                                                    resolve(Object.assign(arr, particularsArr(fcrgs)));
                                                                } else {
                                                                    // particulsStockNA = sqty;
                                                                    particulsStockNA["bullionType"] = bulltype;
                                                                    resolve(stockNA.push(particulsStockNA));
                                                                }
                                                            }
                                                            generateParticular(Gen, amtruid, bulltype, sqty);

                                                        } else {
                                                            resolve(Object.assign(arr, particularsArr()));
                                                        }
                                                    })
                                                }

                                                if (bulliontype == "G24K" && g24qty !== 0 && g24qty > 0) {
                                                    await fromServer(Gen, amtruid, g24qty, "G24K", particularsG24);
                                                } else {
                                                    particularsG24 = particularsArr();
                                                }
                                                if (bulliontype == "S99P" && s99qty !== 0 && s99qty > 0) {
                                                    await fromServer(Gen, amtruid, s99qty, "S99P", particularsS99);
                                                } else {
                                                    particularsS99 = particularsArr();
                                                }
                                                var date = new Date();

                                                ConsumerConfig.checkWalletLimit(totruid, totaladd, function (limitcb) {
                                                    if (limitcb === "200") {
                                                        var md5hash = invoice + totruid + rtruid + "success" + req.body.transactiontype + mop + req.body.bulliontype + parseFloat(req.body.value);

                                                        var tocrypt = {
                                                            to: totruid,
                                                            invoice: invoice,
                                                            type: "redeemCash",
                                                            rTruID: rtruid,
                                                            sourceFlag: "remmit",
                                                            totalTax: totaltax,
                                                            particularsG24: particularsG24,
                                                            particularsS99: particularsS99,
                                                            tdsPercentage: particularsG24.tdsPercentage > 0 ? particularsG24.tdsPercentage : particularsS99.tdsPercentage,
                                                            loadingPercentage: particularsG24.loadingPercentage > 0 ? particularsG24.loadingPercentage : particularsS99.loadingPercentage,
                                                            remmitCharges: remmitcharges,
                                                            totalAmount: totaladd,
                                                            createDate: date,
                                                            status: status,
                                                            md5sign: md5(md5hash),
                                                            MOP: mop
                                                        };
                                                        if (status == "success") {
                                                            request.post({
                                                                "headers": { "content-type": "application/json" },
                                                                "url": reqip + ":4123/api/verifyotpforclient",
                                                                "body": JSON.stringify({ "crnno": crnno, "otp": otp, type: "cSell" })
                                                            }, (error, response, body) => {
                                                                if (error) {
                                                                    return console.dir(error);
                                                                }
                                                                var newjson = JSON.parse(body);
                                                                if (newjson.resource.status == "1000") {
                                                                    var rational = JSON.stringify(tocrypt);
                                                                    encrypt(rational);
                                                                }
                                                                else {
                                                                    res.status(411).json(newjson);
                                                                }
                                                            })
                                                        }
                                                        else {
                                                            var rational = JSON.stringify(tocrypt);
                                                            encrypt(rational);
                                                        }

                                                        function encrypt(rational) {
                                                            var crypted = encryption(rational);
                                                            if (mop != "truWallet") {
                                                                res.status(411).json({ status: "411", message: "Please provide valid method of payment." });
                                                            }
                                                            else if (mop === "truWallet") {
                                                                tocrypt.hash = crypted;
                                                                if (req.body.status == "failure") {
                                                                    var clientTXN = new TXN(tocrypt);
                                                                    clientTXN.save(function (err, result) {
                                                                        if (err) {
                                                                            res.status(411).json({ status: "411", message: "InValid Request" });
                                                                        }
                                                                        else {
                                                                            callback(null)
                                                                        }
                                                                    })
                                                                }
                                                                else if (req.body.status == "success") {
                                                                    TXN.updateOne({
                                                                        "invoice": invoice
                                                                    }, {
                                                                        $set: tocrypt
                                                                    }, callback)
                                                                }
                                                            }
                                                            function callback(err, numAffected) {
                                                                if (err) {
                                                                    res.send(err);
                                                                    console.log(err);
                                                                }
                                                                var respresult = TXN.aggregate([{
                                                                    $match: { "invoice": invoice }
                                                                }, {
                                                                    $project: {
                                                                        invoice: 1, to: 1, from: 1, rTruID: 1, _id: 0, particularsG24: 1, particularsS99: 1, otherCharges: 1, remmitCharges: 1, totalAmount: 1, status: 1, type: 1, MOP: 1, ModeOfPay: 1, createDate: 1
                                                                    }
                                                                }, {
                                                                    $lookup: {
                                                                        from: "kycs", localField: "to", foreignField: "truID", as: "cust"
                                                                    }
                                                                }, { $unwind: "$cust" }, {
                                                                    $project: {
                                                                        invoice: 1, to: 1, from: 1, rTruID: 1, _id: 0, particularsG24: 1,
                                                                        particularsS99: 1, otherCharges: 1, remmitCharges: 1, totalAmount: 1,
                                                                        status: 1, type: 1, MOP: 1, ModeOfPay: 1, createDate: 1, gender: "$cust.genderc",
                                                                        address: "$cust.permanentAddress", fName: "$cust.fName", lName: "$cust.lName",
                                                                        mobile: "$cust.mobile", email: "$cust.email", emailVerified: "$cust.emailVerified",
                                                                    }
                                                                }
                                                                ]);
                                                                respresult.exec(function (err, result) {
                                                                    if (err) {
                                                                        response.status(500).send({
                                                                            error: err
                                                                        })
                                                                        return next(err);
                                                                    } else {
                                                                        var resource = result[0];
                                                                        var invoice = resource.invoice;
                                                                        var to = resource.to;
                                                                        var rtruid = resource.rTruID;
                                                                        var status = resource.status;
                                                                        var address = resource.address;
                                                                        var fname = resource.fName;
                                                                        var lname = resource.lName;
                                                                        var mop = resource.MOP;
                                                                        var createDate = resource.createDate;

                                                                        ///Rate for 24
                                                                        var tid24 = resource.particularsG24.TID;
                                                                        var from24 = resource.particularsG24.assetmanagerName;

                                                                        var q24v = resource.particularsG24.qty.toJSON().$numberDecimal;
                                                                        var r24v = resource.particularsG24.rate.toJSON().$numberDecimal;
                                                                        var a24v = resource.particularsG24.amount.toJSON().$numberDecimal;
                                                                        var tx24v = resource.particularsG24.tax.toJSON().$numberDecimal;
                                                                        var t24v = resource.particularsG24.total.toJSON().$numberDecimal;

                                                                        //Rate S99P
                                                                        var tid99 = resource.particularsS99.TID;
                                                                        var from99 = resource.particularsS99.assetmanagerName;

                                                                        var q99v = resource.particularsS99.qty.toJSON().$numberDecimal;
                                                                        var r99v = resource.particularsS99.rate.toJSON().$numberDecimal;
                                                                        var a99v = resource.particularsS99.amount.toJSON().$numberDecimal;
                                                                        var tx99v = resource.particularsS99.tax.toJSON().$numberDecimal;
                                                                        var t99v = resource.particularsS99.total.toJSON().$numberDecimal;

                                                                        //totalAmount
                                                                        var tav = resource.totalAmount.toJSON().$numberDecimal;
                                                                        var truCoin = undefined;
                                                                        if (bulliontype == "G24K") {
                                                                            truCoin = {
                                                                                "TID": tid24,
                                                                                "rateFrom": from24,
                                                                                "quantity": q24v,
                                                                                "rate": r24v,
                                                                                "valuation": a24v,
                                                                                "tax": tx24v,
                                                                                "total": t24v,
                                                                                "bullionType": "G24K"
                                                                            }
                                                                        }
                                                                        else if (bulliontype == "S99P") {
                                                                            truCoin = {
                                                                                "TID": tid99,
                                                                                "rateFrom": from99,
                                                                                "quantity": q99v,
                                                                                "rate": r99v,
                                                                                "valuation": a99v,
                                                                                "tax": tx99v,
                                                                                "total": t99v,
                                                                                "bullionType": "S99P"
                                                                            }
                                                                        }
                                                                        var Final = {
                                                                            "invoice": invoice,
                                                                            "CRNNo": crnno,
                                                                            "clientID": clientid,
                                                                            "GSTIN": "07AAFCT6383H2ZZ",
                                                                            "status": status,
                                                                            address: address,
                                                                            fName: fname,
                                                                            lName: lname,
                                                                            totalAmount: tav,
                                                                            transactionType: "sell",
                                                                            MOP: req.body.mop,
                                                                            createDate: createDate,
                                                                            applicableTAX: (Gen.sellTax * 100).toString(),
                                                                            "truCoin": truCoin
                                                                        };
                                                                        if (status === "success" || status === "inprocess") {
                                                                            if (status === "success") {
                                                                                update_Float_log(rtruid, tav, invoice);
                                                                                if (!isNaN(q24v) && parseFloat(q24v) > 0) {
                                                                                    calculate.update_assetmanager_stock(resource.particularsG24.from, resource.to, "G24K", q24v, "redeemCash", invoice);
                                                                                }
                                                                                if (!isNaN(q99v) && parseFloat(q99v) > 0) {
                                                                                    calculate.update_assetmanager_stock(resource.particularsS99.from, resource.to, "S99P", q99v, "redeemCash", invoice);
                                                                                }
                                                                                initiateEntityRevenueRefundFloat(rtruid, invoice);  // add Revenue to entity
                                                                                calculate.update_stock(to, q24v, q99v, "redeemCash", invoice); // consumer
                                                                            }
                                                                            if (status === "success") {
                                                                                notification(to, resource.particularsG24.from, resource.particularsS99.from, crnno, invoice, q24v, q99v, "redeemCash", tav, mop);
                                                                            }
                                                                        }
                                                                        res.status(200).json({ status: "1000", resource: Final });
                                                                    }
                                                                });
                                                            };

                                                            function update_Float_log(rtruid, cash, invoice) {
                                                                request.post({
                                                                    "headers": { "content-type": "application/json" },
                                                                    "url": reqip + ":4121/api/entitywalletupdatetxn",
                                                                    "body": JSON.stringify({
                                                                        "truid": rtruid,
                                                                        "totaladd": cash,
                                                                        "invoice": invoice,
                                                                        "tType": "redeemCash"
                                                                    })
                                                                }, (error, response, body) => {
                                                                    if (error) {
                                                                        return console.log(error);
                                                                    } else {

                                                                    }
                                                                })
                                                            };
                                                        }
                                                    } else if (limitcb === "500") {
                                                        res.status(411).json({ status: "411", message: "You have exceeded your wallet limit! Please verify your KYC for unlimited access." });
                                                    } else {
                                                        res.status(411).json({ status: "411", message: "Something went wrong, Please try again!" });
                                                    }
                                                })
                                            }
                                        }
                                        else {
                                            res.status(411).json({ status: "411", message: "You do not have a access to do transactions..!!" })
                                        }
                                    }
                                }
                                else {
                                    res.json({ status: "204", message: respvalpaymodes })
                                }
                            }

                        }
                    })
                }
            })
        }
    }
    else {
        res.status(411).json({ status: "411", message: "The transaction type must be sell" })
    }
}
exports.inclientvalidate_stock = function (req, res) {

    var totruid = req.body.totruid;
    var g24 = req.body.bulliontype == "G24K" ? parseFloat(req.body.quantity) : 0;
    var s99 = req.body.bulliontype == "S99P" ? parseFloat(req.body.quantity) : 0;
    var isnan = parseFloat("0");

    if (isNaN(g24)) {
        var g24 = isnan;
    } else {
        var g24 = g24
    };
    if (isNaN(s99)) {
        var s99 = isnan;
    } else {
        var s99 = s99
    };
    KycAll.find({ truID: totruid }, function (err, docs) {
        if (!docs.length) {
            res.status(411).json({
                status: "411",
                message: 'The request was successful but no TruID was returned.'
            });
        } else {
            Stock.aggregate([{
                $match: { truID: totruid }
            },
            {
                $project: {
                    _id: 0, status24: {
                        $cond: {
                            if: { $and: [{ $gte: ["$stock.G24K", { $toDecimal: g24 }] }, { $gte: ["$stock.G24K", 0] }] },
                            then: "resolve", else: "$stock.G24K"
                        }
                    },
                    status99: {
                        $cond: {
                            if: { $and: [{ $gte: ["$stock.S99P", { $toDecimal: s99 }] }, { $gte: ["$stock.S99P", 0] }] },
                            then: "resolve", else: "$stock.S99P"
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
                    var s24 = resource.status24;
                    var s99 = resource.status99;

                    if (s24 == "resolve" && s99 == "resolve") {
                        res.status(200).json({
                            status: "200",
                            message: "you can proceed."
                        })
                    } else {
                        res.status(411).json({
                            status: "411",
                            message: "You have choosen wrong Consumer"
                        });
                    }
                }
            });
        }
    })
}
exports.client_transfer_bullions = function (req, res) {
    let Gen = req.generalCharges;
    let topassetmanager = req.topassetmanager;
    var date = new Date(); // today's date and time in ISO format
    var quantity = parseFloat(req.body.value),
        crnno = req.body.crnno,
        receiverCRNNo = req.body.tocrnno,
        rtruid = req.body.rtruid,
        invoice = req.body.invoice,
        sendertruid,
        sendername,
        clientid = req.body.clientid,
        mop = req.body.mop,
        receivertruid = "",
        bulliontype = req.body.bulliontype;
    if (req.body.status == "failure") {
        invoice = createInvoice();
    }
    if (req.body.transactiontype == "transfer" || req.body.transactiontype == "transferUnitByCash") {
        if (quantity == "0") {
            res.status(411).json({ status: "411", message: "No Quantity Selected" })
        }
        else if (quantity > 0) {
            KycAll.find({ CRNNo: crnno, KYCFlag: "active" },
                function (err, docs) {
                    if (docs.length == 0) {
                        res.status(411).json({
                            status: "411",
                            message: 'Invalid Request'
                        });
                    }
                    else {
                        sendertruid = docs[0].truID;  // receiver
                        sendername = docs[0].fName + " " + docs[0].lName;
                        request.post({
                            "headers": { "content-type": "application/json" },
                            "url": reqip + ":4125/api/showconsumerconfigurations",
                            "body": JSON.stringify({ "kycflag": "KYC", "appliedOn": "entity", "truid": rtruid })
                        }, (err, response, body) => {
                            if (err || !body) {
                                res.status(411).json({ status: "411", message: "Please reset your configurations." });
                            }
                            else {
                                var configbody = JSON.parse(body);
                                if (configbody.status === "204") {
                                    res.status(411).json({ status: "411", message: "Please check your configurations." });
                                }
                                else {
                                    var walletaccess = configbody.resource.moduleSelf.walletAccess;
                                    var paymentmodeaccess = configbody.resource.moduleSelf.payByWallet;
                                    var respvalpaymodes = validatePaymodes(req.body.mop, walletaccess, paymentmodeaccess);
                                    var receivername;
                                    if (respvalpaymodes === 200) {
                                        if (crnno != "0") {
                                            if (walletaccess != "disable") {
                                                KycAll.find({
                                                    "CRNNo": receiverCRNNo, KYCFlag: "active"
                                                }, function (err, docs) {
                                                    if (!docs.length) {
                                                        res.status(411).json({ status: "411", message: "The request was successful but no body was returned." });
                                                    }
                                                    else {
                                                        receivertruid = docs[0].truID;
                                                        receivername = docs[0].fName + " " + docs[0].lName;
                                                        var countrycode = docs[0].countryCode;

                                                        if (req.body.status == "success") {
                                                            var md5hash = invoice + sendertruid + rtruid + req.body.status + req.body.transactiontype + req.body.mop + req.body.bulliontype + parseFloat(req.body.value);
                                                            TXN.find({
                                                                "invoice": invoice,
                                                                "to": sendertruid,
                                                                "md5sign": md5(md5hash),
                                                                "status": "failure"
                                                            }, function (err, docs) {
                                                                if (!docs.length) {
                                                                    res.status(411).json({
                                                                        status: "411",
                                                                        message: "Please enter correct invoice number."
                                                                    });
                                                                } else {
                                                                    stockvalidation();
                                                                }
                                                            })
                                                        }
                                                        else {
                                                            stockvalidation();
                                                        }
                                                        function stockvalidation() {
                                                            var result = topassetmanager;
                                                            var g24knetrate = parseFloat(result.G24K); // live Rate
                                                            var s99netrate = parseFloat(result.S99P); // live Rate
                                                            var is24kIs = bulliontype == "G24K";
                                                            var is99sIs = bulliontype == "S99P";
                                                            var g24qty = !is24kIs ? parseFloat("0") : parseFloat(req.body.value);
                                                            var s99qty = !is99sIs ? parseFloat("0") : parseFloat(req.body.value);
                                                            if (is24kIs && req.body.transactiontype == "transferUnitByCash") {
                                                                g24qty = parseFloat(req.body.value) / g24knetrate;
                                                            }
                                                            if (is99sIs && req.body.transactiontype == "transferUnitByCash") {
                                                                s99qty = parseFloat(req.body.value) / s99netrate;
                                                            }
                                                            request.post({
                                                                "headers": {
                                                                    "content-type": "application/json"
                                                                },
                                                                "url": reqip + ":4114/api/inclientvalidatestock",
                                                                "body": JSON.stringify({
                                                                    "totruid": sendertruid,
                                                                    "bulliontype": bulliontype,
                                                                    "quantity": bulliontype == "G24K" ? g24qty : s99qty
                                                                })
                                                            }, async (error, response, body) => {
                                                                if (error) {
                                                                    return console.dir(error);
                                                                } else {
                                                                    var resultd = JSON.parse(body);
                                                                    var validationstatus = resultd.status;
                                                                    let particularsG24 = {},
                                                                        particularsS99 = {},
                                                                        stockNA = new Array(),
                                                                        qtyNA = new Array(),
                                                                        inputNA = new Array(),
                                                                        totaladd = 0, remmitcharges = 0, totaltax = 0; // today's date and time in ISO format
                                                                    if (validationstatus == "200") {

                                                                        if (g24knetrate == 0 && g24knetrate != 0) {
                                                                            res.status(411).json({
                                                                                status: "411",
                                                                                message: "You are not able to transfer 24K gold."
                                                                            });
                                                                        } else if (s99netrate == 0 && s99netrate != 0) {
                                                                            res.status(411).json({
                                                                                status: "411",
                                                                                message: "You are not able to transfer 99P silver."
                                                                            });
                                                                        }
                                                                        else {
                                                                            function fromServer(sendertruid, sendername, countrycode, sqty, bulltype, arr) {
                                                                                return new Promise((resolve, reject) => {
                                                                                    if (sqty !== 0 && sqty > 0) {
                                                                                        var particulsStockNA = {};
                                                                                        async function generateParticular() {
                                                                                            var fcrgs = await calculate.transfer_calculation_remmit(Gen, countrycode, bulltype, sqty, rtruid);
                                                                                            if (fcrgs.status === "200" || fcrgs.stockstatus === "resolve") {
                                                                                                totaladd += fcrgs.total;
                                                                                                totaltax += fcrgs.tax;
                                                                                                remmitcharges += fcrgs.remmitCharges;
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

                                                                            if (g24qty !== 0 && g24qty > 0) {
                                                                                await fromServer(sendertruid, sendername, countrycode, g24qty, "G24K", particularsG24);
                                                                            } else {
                                                                                particularsG24 = particularsArr({ from: sendertruid, assetmanagerName: sendername });
                                                                            }
                                                                            if (s99qty !== 0 && s99qty > 0) {
                                                                                await fromServer(sendertruid, sendername, countrycode, s99qty, "S99P", particularsS99);
                                                                            } else {
                                                                                particularsS99 = particularsArr({ from: sendertruid, assetmanagerName: sendername });
                                                                            }


                                                                            var flag = req.body.status == "success" ? "update" : "check";

                                                                            var md5hash = invoice + sendertruid + rtruid + "success" + req.body.transactiontype + mop + req.body.bulliontype + parseFloat(req.body.value);
                                                                            var tocrypt = {
                                                                                to: sendertruid,
                                                                                receiverTruID: receivertruid,
                                                                                rTruID: rtruid,
                                                                                invoice: invoice,
                                                                                type: "transfer",
                                                                                sourceFlag: "remmit",
                                                                                particularsG24: particularsG24,
                                                                                particularsS99: particularsS99,
                                                                                tdsPercentage: particularsG24.tdsPercentage > 0 ? particularsG24.tdsPercentage : particularsS99.tdsPercentage,
                                                                                loadingPercentage: particularsG24.loadingPercentage > 0 ? particularsG24.loadingPercentage : particularsS99.loadingPercentage,
                                                                                remmitCharges: remmitcharges,
                                                                                totalAmount: totaladd,
                                                                                createDate: date,
                                                                                status: req.body.status,
                                                                                md5sign: md5(md5hash),
                                                                                MOP: mop
                                                                            };
                                                                            if (req.body.status == "success") {
                                                                                request.post({
                                                                                    "headers": { "content-type": "application/json" },
                                                                                    "url": reqip + ":4123/api/verifyotpforclient",
                                                                                    "body": JSON.stringify({ "crnno": crnno, "otp": req.body.otp, type: "cTransfer" })
                                                                                }, (error, response, body) => {
                                                                                    if (error) {
                                                                                        return console.dir(error);
                                                                                    }
                                                                                    var newjson = JSON.parse(body);
                                                                                    if (newjson.resource.status == "1000") {
                                                                                        var rational = JSON.stringify(tocrypt);
                                                                                        encrypt(rational);
                                                                                    }
                                                                                    else {
                                                                                        res.status(411).json(newjson);
                                                                                    }
                                                                                })
                                                                            }
                                                                            else {
                                                                                var rational = JSON.stringify(tocrypt);
                                                                                encrypt(rational);
                                                                            }

                                                                            function encrypt(rational) {
                                                                                var crypted = encryption(rational);
                                                                                tocrypt.hash = crypted;
                                                                                if (req.body.status == "failure") {
                                                                                    var clientTXN = new TXN(tocrypt);
                                                                                    clientTXN.save(function (err, result) {
                                                                                        if (err) {
                                                                                            res.status(411).json({ status: "411", message: "InValid Request" });
                                                                                        }
                                                                                        else {
                                                                                            callback(null)
                                                                                        }
                                                                                    })
                                                                                }
                                                                                else if (req.body.status == "success") {
                                                                                    request.post({
                                                                                        "headers": { "content-type": "application/json" },
                                                                                        "url": reqip + ":4121/api/entitywalletupdatetxn",
                                                                                        "body": JSON.stringify({
                                                                                            "truid": rtruid,
                                                                                            "totaladd": totaladd,
                                                                                            "invoice": invoice,
                                                                                            "tType": "transfer",
                                                                                            "g24qty": g24qty,
                                                                                            "s99qty": s99qty
                                                                                        })
                                                                                    }, (error, response, body) => {
                                                                                        if (error) {
                                                                                            return console.log(error);
                                                                                        }
                                                                                        else {
                                                                                            var otpresultstatus = JSON.parse(body);
                                                                                            if (otpresultstatus.status != "200") {
                                                                                                res.status(411).json({ status: "411", message: "Insufficient balance." });
                                                                                            }
                                                                                            else {
                                                                                                TXN.updateOne({ "invoice": invoice }, { $set: tocrypt }, callback)
                                                                                            }
                                                                                        }
                                                                                    })
                                                                                }
                                                                                else {
                                                                                    res.status(411).json({ status: "411", message: "Invalid Status." });
                                                                                }
                                                                            }
                                                                            function callback(err, numAffected) {
                                                                                if (err) {
                                                                                    res.send(err);
                                                                                    console.log(err);
                                                                                }
                                                                                var respresult = TXN.aggregate([
                                                                                    { $match: { "invoice": invoice } }, {
                                                                                        $lookup: {
                                                                                            from: "kycs",
                                                                                            localField: "receiverTruID",
                                                                                            foreignField: "truID",
                                                                                            as: "cust"
                                                                                        }
                                                                                    }, { $unwind: "$cust" }, {
                                                                                        $project: {
                                                                                            invoice: 1, to: 1, from: 1, rTruID: 1, _id: 0, particularsG24: 1, particularsS99: 1,
                                                                                            remmitCharges: 1, totalAmount: 1, status: 1,
                                                                                            MOP: 1, type: 1, gender: "$cust.genderc", address: "$cust.permanentAddress",
                                                                                            fName: "$cust.fName", lName: "$cust.lName"

                                                                                        }
                                                                                    }, {
                                                                                        $lookup: {
                                                                                            from: "kycs",
                                                                                            localField: "to",
                                                                                            foreignField: "truID",
                                                                                            as: "tocust"
                                                                                        }
                                                                                    },
                                                                                    { $unwind: "$tocust" },
                                                                                    {
                                                                                        $project: {
                                                                                            invoice: 1, to: 1, from: 1, rTruID: 1, _id: 0, particularsG24: 1, particularsS99: 1,
                                                                                            remmitCharges: 1, totalAmount: 1, status: 1,
                                                                                            MOP: 1, type: 1, gender: 1, address: 1,
                                                                                            fName: 1, lName: 1, senderAddress: "$tocust.billingAddress",
                                                                                            senderFName: "$tocust.fName", senderLName: "$tocust.lName"
                                                                                        }
                                                                                    }
                                                                                ]);
                                                                                respresult.exec(function (err, result) {
                                                                                    if (err) {
                                                                                        response.status(500).send({
                                                                                            error: err
                                                                                        })
                                                                                        return next(err);
                                                                                    }
                                                                                    else {
                                                                                        var resource = result[0];
                                                                                        var invoice = resource.invoice;
                                                                                        var to = resource.to;
                                                                                        var rtruid = resource.rTruID;
                                                                                        var status = resource.status;
                                                                                        var receiveraddress = resource.address;
                                                                                        var receiverfname = resource.fName;
                                                                                        var receiverlname = resource.lName;
                                                                                        var mop = resource.MOP;
                                                                                        var type = resource.type;
                                                                                        var senderAddress = resource.senderAddress;
                                                                                        var senderFName = resource.senderFName;
                                                                                        var senderLName = resource.senderLName;

                                                                                        ///Rate for 24
                                                                                        var tid24 = resource.particularsG24.TID;
                                                                                        var q24v = resource.particularsG24.qty.toJSON().$numberDecimal;
                                                                                        var r24v = resource.particularsG24.rate.toJSON().$numberDecimal;
                                                                                        var tax24 = resource.particularsG24.tax.toJSON().$numberDecimal;
                                                                                        //Rate S99P
                                                                                        var tid99 = resource.particularsS99.TID;
                                                                                        var q99v = resource.particularsS99.qty.toJSON().$numberDecimal;
                                                                                        var r99v = resource.particularsS99.rate.toJSON().$numberDecimal;
                                                                                        var tax99 = resource.particularsS99.tax.toJSON().$numberDecimal;

                                                                                        var tav = resource.totalAmount.toJSON().$numberDecimal;

                                                                                        var truCoin = undefined;
                                                                                        if (bulliontype == "G24K") {
                                                                                            truCoin = {
                                                                                                "TID": tid24,
                                                                                                "quantity": q24v,
                                                                                                "tax": tax24,
                                                                                                "rate": r24v,
                                                                                                "bullionType": "G24K"
                                                                                            }
                                                                                        }
                                                                                        else if (bulliontype == "S99P") {
                                                                                            truCoin = {
                                                                                                "TID": tid99,
                                                                                                "quantity": q99v,
                                                                                                "rate": r99v,
                                                                                                "tax": tax99,
                                                                                                "bullionType": "S99P"
                                                                                            }
                                                                                        }
                                                                                        var Final = {
                                                                                            "invoice": invoice,
                                                                                            "CRNNo": receiverCRNNo,
                                                                                            "clientID": clientid,
                                                                                            "status": req.body.status,
                                                                                            "senderAddress": senderAddress,
                                                                                            "transferCharges": tav,
                                                                                            "senderFName": senderFName,
                                                                                            "MOP": mop,
                                                                                            "senderLName": senderLName,
                                                                                            "type": type,
                                                                                            "applicableTAX": (Gen.gstOnTransferFee * 100).toString(),
                                                                                            "GSTIN": "07AAFCT6383H2ZZ",
                                                                                            "receiverAddress": receiveraddress,
                                                                                            "receiverFName": receiverfname,
                                                                                            "receiverLName": receiverlname,
                                                                                            "truCoin": truCoin
                                                                                        };
                                                                                        if (req.body.status == "success") {

                                                                                            calculate.update_stock(sendertruid, q24v, q99v, "transferer", invoice);
                                                                                            calculate.update_stock(receivertruid, q24v, q99v, "receiver", invoice);
                                                                                            initiateEntityRevenueRefundFloat(rtruid, invoice);

                                                                                            notificationtransfer(receivertruid, sendertruid, sendername, invoice, receiverCRNNo, q24v, q99v);

                                                                                        }
                                                                                        res.status(200).json({ status: "1000", resource: Final });
                                                                                    }
                                                                                })
                                                                            }

                                                                        }

                                                                    } else if (validationstatus == "24") {
                                                                        res.status(411).json({
                                                                            status: "411",
                                                                            message: "Stock not available"
                                                                        });
                                                                    } else {
                                                                        res.status(411).json({
                                                                            status: "411",
                                                                            message: "Stock not available"
                                                                        });
                                                                    }
                                                                }
                                                            }
                                                            )
                                                        }
                                                    }
                                                }
                                                )
                                            } else {
                                                res.status(411).json({
                                                    status: "411",
                                                    message: "Your Wallet is disabled. Please contact your Administrator."
                                                });
                                            }


                                        }

                                    }
                                    else {
                                        res.json({ status: "204", message: respvalpaymodes })
                                    }
                                }
                            }
                        })
                    }
                }
            )
        }
        else {
            res.status(411).json({ status: "411", message: "Wrong value passed" })
        }
    }
    else {
        res.status(411).json({ status: "411", message: "The transaction type must be 'TRANSFER'" })

    }
}
function initiateEntityRevenueRefundFloat(rtruid, invoice) {
    TXN.aggregate([
        { $match: { rTruID: rtruid, invoice: invoice, status: "success" } },
        {
            $project: {
                _id: 0, invoice: 1, rTruID: 1, invoice: 1, remmitCharges: 1, sourceFlag: 1, status: 1, totalAmount: 1,
                partnerCharges: {
                    $toString: { $sum: ["$particularsG24.partnerCharges", "$particularsS99.partnerCharges"] }
                },
                tdsonpartnerCharges: {
                    $toString: { $sum: ["$particularsG24.tdsonpartnerCharges", "$particularsS99.tdsonpartnerCharges"] }
                },
                nodeCharges: {
                    $toString: { $sum: ["$particularsG24.nodeCharges", "$particularsS99.nodeCharges"] }
                },
                tdsonnodeCharges: {
                    $toString: { $sum: ["$particularsG24.tdsonnodeCharges", "$particularsS99.tdsonnodeCharges"] }
                },
            }
        }
    ]).exec(function (err, txnresult) {
        if (err) {
            console.log("Partner Revenue refund error", err)
        }
        if (!txnresult.length) {
            console.log("no txn found for refund", err)
        }
        else {
            var revenueJson = {
                "rtruid": txnresult[0].rTruID,
                "invoice": txnresult[0].invoice,
                "partnercharges": txnresult[0].partnerCharges,
                "nodecharges": txnresult[0].nodeCharges,
                "tdsonpartnerCharges": txnresult[0].tdsonpartnerCharges,
                "tdsonnodeCharges": txnresult[0].tdsonnodeCharges,
            }
            request.post({
                "headers": { "content-type": "application/json" },
                "url": reqip + ":4121/api/entityrevenuerefund",
                "body": JSON.stringify(revenueJson)
            }, (error, response, body) => {
            })
        }
    })
}
exports.client_consumerReceipt = function (req, res) {  // call for transfer , request and gift
    let Gen = req.generalCharges;
    var invoice = req.body.invoice;
    var clientID = req.body.clientId;
    var truid = req.body.truid;

    var ttype = req.body.ttype == "sell" ? "redeemCash" : req.body.ttype;
    if (ttype === "buy" || ttype === "buyCash" || ttype === "redeemCash") {
        var respresult = TXN.aggregate([
            { $match: { "invoice": invoice, rTruID: truid, type: ttype } },
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
            {
                "$unwind": {
                    "path": "$atomlogs",
                    "preserveNullAndEmptyArrays": true
                }
            },
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
                    refernceID: "$cust.refernceTruID",  atomlogs: "$atomlogs", banklogs: "$banklogs"
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
                                    clientID: clientID,
                                    MOP: mop,
                                    applicableTAX: type == "buy" ? (GenCal.tax * 100).toString() : type == "transfer" ? (GenCal.gstOnTransferFee * 100).toString() : type == "redeemCash" ? (GenCal.sellTax * 100).toString() :(GenCal.tax * 100).toString(),
                                    PGType: pgtype, bankTXNID: banktxnid, payBy: payby, paymentCharge: paymentcharge,
                                    truCoin: truCoin
                                };
                                res.json({ status: "1000", resource: Final });
                            }
                        }
                    })
                    /*  }) */
                }
            }
        })
    }
    else if (ttype === "transfer" || ttype === "gift") {
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
            {
                "$unwind": {
                    "path": "$atomlogs",
                    "preserveNullAndEmptyArrays": true
                }
            },
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
                                var Final = ({
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
exports.client_consumer_summary = function (req, res) {
    var crnno = req.body.crnno;
    var rtruid = req.body.rtruid;
    var clientID = req.body.clientid;
    var top;
    if (req.body.top) {
        if (isNaN(req.body.top)) {
            res.status(411).json({
                status: "411",
                message: "Please provide number in top fields"
            });
        }
        else {
            top = parseInt(req.body.top);
            callTxnSum();
        }
    }
    else {
        callTxnSum();
    }
    function callTxnSum() {
        var matchqry = {};
        KycAll.find({
            "CRNNo": crnno
        }, function (err, docs) {
            if (!docs.length) {
                res.status(411).json({
                    status: "411",
                    message: "Consumer CRNNo is invalid..!!"
                });
            } else {
                var truid = docs[0].truID;
                if (req.body.dateflag === "date") {
                    var startdate = new Date(Date.parse(req.body.startdate));
                    var enddate = new Date(Date.parse(req.body.enddate) + (1000 * 3600 * 24));
                    matchqry = {
                        $and: [{
                            $or: [{ to: truid }, { "particularsG24.from": truid },
                            { "particularsS99.from": truid }]
                        }, { rTruID: rtruid }, { createDate: { $gte: startdate, $lte: enddate } }]
                    }
                }
                else {
                    matchqry = {
                        $and: [{
                            $or: [{ to: truid }, { "particularsG24.from": truid },
                            { "particularsS99.from": truid }]
                        }, { rTruID: rtruid }]
                    }
                }
                if (top) {
                    TXN.aggregate([{
                        $match: matchqry
                    },
                    {
                        $lookup: {
                            from: "kycs",
                            localField: "to",
                            foreignField: "truID",
                            as: "receiver"
                        }
                    },
                    { $unwind: { path: "$receiver", "preserveNullAndEmptyArrays": true } },
                    {
                        $lookup: {
                            from: "kycs",
                            localField: "particularsG24.from",
                            foreignField: "truID",
                            as: "sender"
                        }
                    },
                    { $unwind: { path: "$sender", "preserveNullAndEmptyArrays": true } },
                    {
                        $project: {
                            _id: 1, to: 1, invoice: 1, particularsG24: 1, status: 1,
                            particularsS99: 1, otherCharges: 1, totalAmount: 1, MOP: 1, createDate: 1, type: 1,
                            "receiverFName": "$receiver.fName", "receiverLName": "$receiver.lName",
                            "senderFName": "$sender.fName", "senderLName": "$sender.lName", "CRNNo": "$sender.CRNNo", "sCRNNo": "$receiver.CRNNo"
                        }
                    },
                    { $sort: { _id: -1 } },
                    { $limit: top }]).exec(function (err, result) {

                        if (err) {
                            res.status(500).send({ error: err })
                        }
                        else {
                            var arraybuy = new Array();
                            for (var i = 0; i < result.length; i++) {
                                var buydetail = result[i];
                                var truCoin = undefined;
                                var bulliontype = buydetail.particularsG24.qty.toJSON().$numberDecimal != "0" ? "G24K" : "S99P";
                                if (bulliontype == "G24K") {
                                    truCoin = {
                                        "TID": buydetail.particularsG24.TID,
                                        "quantity": buydetail.particularsG24.qty.toJSON().$numberDecimal,
                                        "rate": buydetail.particularsG24.rate.toJSON().$numberDecimal,
                                        "tax": buydetail.particularsG24.tax.toJSON().$numberDecimal,
                                        "valuation": buydetail.particularsG24.amount.toJSON().$numberDecimal,
                                        "total": buydetail.particularsG24.total.toJSON().$numberDecimal,
                                        "bullionType": "G24K"
                                    }
                                }
                                else if (bulliontype == "S99P") {
                                    truCoin = {
                                        "TID": buydetail.particularsS99.TID,
                                        "quantity": buydetail.particularsS99.qty.toJSON().$numberDecimal,
                                        "rate": buydetail.particularsS99.rate.toJSON().$numberDecimal,
                                        "tax": buydetail.particularsS99.tax.toJSON().$numberDecimal,
                                        "valuation": buydetail.particularsS99.amount.toJSON().$numberDecimal,
                                        "total": buydetail.particularsS99.total.toJSON().$numberDecimal,
                                        "bullionType": "S99P"
                                    }
                                }
                                var details = {
                                    "invoice": buydetail.invoice,
                                    "CRNNo": buydetail.CRNNo,
                                    "receiverCRNNo": buydetail.sCRNNo,
                                    "receiverFName": buydetail.receiverFName,
                                    "receiverLName": buydetail.receiverLName,
                                    "fName": buydetail.senderFName,
                                    "lName": buydetail.senderLName,
                                    "clientID": clientID,
                                    "MOP": buydetail.MOP == "others" && buydetail.type == "redeemCash" ? "payout" : buydetail.MOP,
                                    "createDate": buydetail.createDate,
                                    "status": buydetail.status,
                                    "totalAmount": buydetail.totalAmount.toJSON().$numberDecimal,
                                    "type": buydetail.type == "redeemCash" ? "sell" : buydetail.type == "buyCash" ? "buy" : buydetail.type,
                                    "truCoin": truCoin
                                }
                                if (buydetail.type == "transfer") {
                                    details.transferCharges = details.totalAmount // on object create new key name. Assign old value to this
                                    delete details.totalAmount
                                }
                                arraybuy.push(details)
                            }
                            res.status(200).json({ status: "1000", resource: arraybuy });
                        }
                    })
                }
                else {
                    TXN.aggregate([{
                        $match: matchqry
                    },
                    {
                        $lookup: {
                            from: "kycs",
                            localField: "to",
                            foreignField: "truID",
                            as: "sender"
                        }
                    },
                    { $unwind: { path: "$sender", "preserveNullAndEmptyArrays": true } },
                    {
                        $lookup: {
                            from: "kycs",
                            localField: "particularsG24.from",
                            foreignField: "truID",
                            as: "receiver"
                        }
                    },
                    { $unwind: { path: "$receiver", "preserveNullAndEmptyArrays": true } },
                    {
                        $project: {
                            _id: 1, to: 1, invoice: 1, particularsG24: 1, status: 1,
                            particularsS99: 1, otherCharges: 1, totalAmount: 1, MOP: 1, createDate: 1, type: 1,
                            "receiverFName": "$receiver.fName", "receiverLName": "$receiver.lName",
                            "senderFName": "$sender.fName", "senderLName": "$sender.lName", "CRNNo": "$sender.CRNNo", "sCRNNo": "$receiver.CRNNo"
                        }
                    },
                    { $sort: { _id: -1 } }]).exec(function (err, result) {

                        if (err) {
                            res.status(500).send({ error: err })
                        }
                        else {
                            var arraybuy = new Array();
                            for (var i = 0; i < result.length; i++) {
                                var buydetail = result[i];
                                var truCoin = undefined;
                                var bulliontype = buydetail.particularsG24.qty.toJSON().$numberDecimal != "0" ? "G24K" : "S99P";
                                if (bulliontype == "G24K") {
                                    truCoin = {
                                        "TID": buydetail.particularsG24.TID,
                                        "quantity": buydetail.particularsG24.qty.toJSON().$numberDecimal,
                                        "rate": buydetail.particularsG24.rate.toJSON().$numberDecimal,
                                        "tax": buydetail.particularsG24.tax.toJSON().$numberDecimal,
                                        "valuation": buydetail.particularsG24.amount.toJSON().$numberDecimal,
                                        "total": buydetail.particularsG24.total.toJSON().$numberDecimal,
                                        "bullionType": "G24K"
                                    }
                                }
                                else if (bulliontype == "S99P") {
                                    truCoin = {
                                        "TID": buydetail.particularsS99.TID,
                                        "quantity": buydetail.particularsS99.qty.toJSON().$numberDecimal,
                                        "rate": buydetail.particularsS99.rate.toJSON().$numberDecimal,
                                        "tax": buydetail.particularsS99.tax.toJSON().$numberDecimal,
                                        "valuation": buydetail.particularsS99.amount.toJSON().$numberDecimal,
                                        "total": buydetail.particularsS99.total.toJSON().$numberDecimal,
                                        "bullionType": "S99P"
                                    }
                                }
                                var details = {
                                    "invoice": buydetail.invoice,
                                    "CRNNo": buydetail.CRNNo,
                                    "receiverCRNNo": buydetail.sCRNNo,
                                    "receiverFName": buydetail.receiverFName,
                                    "receiverLName": buydetail.receiverLName,
                                    "fName": buydetail.senderFName,
                                    "lName": buydetail.senderLName,
                                    "clientID": clientID,
                                    "MOP": buydetail.MOP == "others" && buydetail.type == "redeemCash" ? "payout" : buydetail.MOP,
                                    "createDate": buydetail.createDate,
                                    "status": buydetail.status,
                                    "totalAmount": buydetail.totalAmount.toJSON().$numberDecimal,
                                    "type": buydetail.type == "redeemCash" ? "sell" : buydetail.type == "buyCash" ? "buy" : buydetail.type,
                                    "truCoin": truCoin
                                }
                                if (buydetail.type == "transfer") {
                                    details.transferCharges = details.totalAmount // on object create new key name. Assign old value to this
                                    delete details.totalAmount
                                }
                                arraybuy.push(details)
                            }
                            res.status(200).json({ status: "1000", resource: arraybuy });
                        }
                    })
                }
                /*  request.post({
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
                         }
                     }
                 }) */
            }
        }
        )
    }
};



function getstocklogArr(truid, tType, Qty, invoice, bullionType) {
    return new Promise((resolve, reject) => {
        var txnType = tType;
        var stocklog = {
            "truid": truid,
            "tType": txnType,
            "Qty": parseFloat(Qty),
            "invoice": invoice,
            "bullionType": bullionType,
            "status": "success"
        }

        txnStockLog.txn_stocklogs(stocklog)
        resolve();
    })
}
function particularsArr(particulars) {
    var resparticuls = {};
    resparticuls["TID"] = particulars ? particulars.TID ? particulars.TID : "0" : "0";
    resparticuls["from"] = particulars ? particulars.from ? particulars.from : "0" : "0";
    resparticuls["assetmanagerName"] = particulars ? particulars.assetmanagerName ? particulars.assetmanagerName : "0" : "0";
    resparticuls["qty"] = particulars ? particulars.qty ? particulars.qty.toJSON ? particulars.qty.toJSON().$numberDecimal : particulars.qty : "0" : "0";
    resparticuls["rate"] = particulars ? particulars.rate ? particulars.rate.toJSON ? particulars.rate.toJSON().$numberDecimal : particulars.rate : "0" : "0";

    resparticuls["tdsPercentage"] = particulars ? particulars.tdsPercentage ? particulars.tdsPercentage.toJSON ? particulars.tdsPercentage.toJSON().$numberDecimal : particulars.tdsPercentage : "0" : "0";
    resparticuls["loadingPercentage"] = particulars ? particulars.loadingPercentage ? particulars.loadingPercentage.toJSON ? particulars.loadingPercentage.toJSON().$numberDecimal : particulars.loadingPercentage : "0" : "0";

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
function notification(totruid, fromtruid24, fromtruid99, crnNo, invoice, q24v, q99v, type, amount, mop) {
    if (q24v != 0) {
        var fromtruid = fromtruid24;
        var message = "transaction of receipt " + invoice + " is successful.";
        sendnotification(message, totruid, fromtruid, type, invoice, crnNo, amount, mop, "G24K");
    }
    else if (q99v != 0) {
        var fromtruid = fromtruid99;
        var message = "transaction of receipt " + invoice + " is successful.";
        sendnotification(message, totruid, fromtruid, type, invoice, crnNo, amount, mop, "S99P");
    }

    function sendnotification(text, to, from, txnType, inv, crnno, amt, mop, bullionType) {
        var title, msg;

        if (txnType === "buy") {
            msg = "Buy " + text;
            title = "Bullions Purchased";
        }
        else if (txnType === "redeemCash") {
            var dates = new Date().toLocaleString();
            if (mop == "truWallet") {
                msg = "Sell " + text + "Amount of " + defaultConf.defaultCurrency + " " + decimalChopper(amt, 2) + " is credited in truWallet";
                title = "Sell Successful";
            }
        }
        request.post({
            "headers": { "content-type": "application/json" },
            "url": reqip + ":4116/api/insnotification",
            "body": JSON.stringify({
                "notifyto": to,
                "triggeredbytruid": from,
                "notification": msg,
                "type": "customerTransaction",
                "subtype": txnType,
                "title": title,
                "referenceid": inv,
                "isflag": "consumer",
                "crnNo": crnno,
            })
        }, (error, response, body) => {

            if (error) {
                return console.dir(error);
            }
        })
    }
}

function notificationtransfer(totruid, fromtruid, fromname, invoice, crnNo, g24qty, s99qty) {
    var m24 = "", m99 = "", count = 0;
    if (g24qty > 0) {
        m24 = g24qty.toString() + " gms of TruCoin Gold";
        count++;
    }
    if (s99qty > 0) {
        if (count > 0) {
            m99 = ", " + s99qty.toString() + " gms of TruCoin Silver";

        } else {
            m99 = s99qty.toString() + " gms of TruCoin Silver";
        }
    }

    request.post({
        "headers": { "content-type": "application/json" },
        "url": reqip + ":4116/api/insnotification",
        "body": JSON.stringify({
            "notifyto": totruid,
            "triggeredbytruid": fromtruid,
            "notification": fromname + " has transferred " + m24 + m99 + " in your Company account.",
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
        var newjson = JSON.parse(body);
    }
    )
}
exports.client_checkaccountDetails = function (req, res) {
    var totruid = req.body.totruid;
    var accountno = req.body.accountno;
    Account.aggregate([{ $match: { truID: totruid } },
    { $project: { _id: 0, accountdetails: "$MOP.accountDetails", truID: 1 } },
    { $unwind: { path: "$accountdetails", preserveNullAndEmptyArrays: true } },
    { $match: { "accountdetails.accountNo": accountno, "accountdetails.status": "active" } },
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
    ], function (err, accdocs) {
        if (!accdocs.length) {
            res.json({ status: "411", message: "Please link your account no..!!" })
        } else {
            if (accdocs[0].accountdetails) {
                res.json({ status: "1000", resource: accdocs[0].accountdetails })
            }
            else {
                res.json({ status: "411", message: "Please link your account no..!!" })
            }
        }
    })
}