'use strict';

const request = require('request'),
    conf = require("../conf"),
    reqip = conf.reqip,
    KycAll = require('../models/custKYCAllModel'),
    TXNSchema = require('../models/custTXNModel');
const { validatetxnlimit } = require('../validations/limitValidations');
let minBuyforSell = 100
module.exports = function (app) {
    var clientController = require("../controllers/clients.controllerNEW");
    app.route('/api/clientbuybullions').post(getChargesfromDB, enstockAmtValidation, clientController.client_buy_bullions);
    app.route('/api/clientredeembullionscash').post(getChargesfromDB, enstockAmtValidation, clientController.client_redeem_bullions_cash);
    app.route('/api/clienttransferbullion').post(getChargesfromDB, enstockAmtValidation, clientController.client_transfer_bullions);
    app.route('/api/inclientvalidatestock').post(clientController.inclientvalidate_stock);
    app.route('/api/clientconsumerReceipt').post(getChargesfromDB, clientController.client_consumerReceipt);
    app.route('/api/clientConsumerSummary').post(clientController.client_consumer_summary);
    app.route('/api/clientcheckaccountDetails').post(clientController.client_checkaccountDetails);

}
function getChargesfromDB(req, res, next) {
    request.post({
        "headers": { "content-type": "application/json" },
        "url": conf.adminreqip + ":5112/api/getAllCharges"
    }, (error, response, body) => {
        if (error) {
            res.status(500).json({ status: "500", message: "Internal Server Error" })
        }
        else {
            if (response.statusCode == 200) {
                var resp = JSON.parse(body);
                req.generalCharges = resp.charges;
                next();
            }
            else {
                res.status(411).json({ status: "411", message: "something went wrong" })
            }
        }
    });
}
function enstockAmtValidation(req, res, next) {
    var truID = req.body.totruid ? req.body.totruid : req.body.truid,
        transType = req.body.transactiontype,
        trasactionCharges = req.body.trasactionCharges;
    KycAll.aggregate([{ $match: { $or: [{ truID: truID }, { CRNNo: req.body.crnno }] } }]).exec(function (err, docs) {
        if (docs && docs.length > 0) {
            if (docs[0].KYCFlag == "active") {
                var KYCFlag = docs[0].docVerified == true ? "KYC" : "nonKYC";
                var truID = docs[0].truID;
                req.truid = docs[0].truID;
                var countrycode = docs[0].countryCode;
                request.post({
                    "headers": { "content-type": "application/json" },
                    "url": conf.reqip + ":4125/api/showconsumerconfigurationsall",
                    "body": JSON.stringify({ "kycflag": KYCFlag, "appliedOn": "consumer", "truid": truID })
                }, (error, response, body) => {
                    if (error) {
                        res.json({ status: "500", message: "Internal Server Error" })
                    } else {
                        if (response.statusCode == 200) {
                            var resultpermission = JSON.parse(body);
                            if (resultpermission.status == "200") {
                                var permissionModule = resultpermission.resource.module;
                                if (transType === "buyCash") {
                                    transType = "buy"
                                }
                                else if (transType === "sell" || transType === "sellCash") {
                                    transType = "redeemCash"
                                }
                                else if (transType === "transfer" || transType === "transferCash") {
                                    transType = "transfer"
                                }
                                funpermissionModule(permissionModule, transType, function (moduleres) {
                                    if (moduleres === "success") {
                                        var limit = JSON.parse(body).resource.limit;
                                        switch (req.body.transactiontype) {
                                            case "buy":
                                                getAmountByQty(req.body.bulliontype, countrycode, req.body.transactiontype, req.body.value, req.body.trasactionCharges, function (a) {
                                                    var txnAmt = a.amt;
                                                    validatetxnlimit(truID, limit.buymaxAmtOfTxnInDay, limit.buymaxAmtOfTxnInMonth, limit.buymaxAmtOfTxnInHour,
                                                        limit.buytxnInterval, limit.buynoOfTxnInInterval, "buy", txnAmt, req.body.status, null, null, function (translimitres) {
                                                            if (translimitres === "200") {
                                                                validateBuy(limit.buyMin, limit.buyMax, limit.buySilverMin, limit.buySilverMax, txnAmt).then((bool) => {
                                                                    if (bool) {
                                                                        next();
                                                                    }
                                                                });
                                                            } else {
                                                                res.json({ status: "200", message: translimitres });
                                                            }
                                                        });
                                                })
                                                break;
                                            case "buyCash":
                                                getAmountByQty(req.body.bulliontype, countrycode, req.body.transactiontype, req.body.value, req.body.trasactionCharges, function (a) {
                                                    var txnAmt = a.amt;
                                                    validatetxnlimit(truID, limit.buymaxAmtOfTxnInDay, limit.buymaxAmtOfTxnInMonth, limit.buymaxAmtOfTxnInHour,
                                                        limit.buytxnInterval, limit.buynoOfTxnInInterval, "buy", txnAmt, req.body.status, null, null, function (translimitres) {
                                                            if (translimitres === "200") {
                                                                validateBuy(limit.buyMin, limit.buyMax, limit.buySilverMin, limit.buySilverMax, txnAmt).then((bool) => {
                                                                    if (bool) {
                                                                        next();
                                                                    }
                                                                });
                                                            } else {
                                                                res.json({ status: "200", message: translimitres });
                                                            }
                                                        });
                                                });
                                                break;
                                            case "sell":
                                                validateBuyAmount(truID, "redeemCash", function (translimitres) {
                                                    if (translimitres === "200") {
                                                        getAmountByQty(req.body.bulliontype, countrycode, req.body.transactiontype, req.body.value, req.body.trasactionCharges, function (a) {
                                                            var txnAmt = a.amt;
                                                            var txnQty = a.qty;
                                                            validatetxnlimit(truID, limit.redeemCashmaxAmtOfTxnInDay, limit.redeemCashmaxAmtOfTxnInMonth, limit.redeemCashmaxAmtOfTxnInHour,
                                                                limit.redeemCashtxnInterval, limit.redeemCashnoOfTxnInInterval, "redeemCash", txnAmt, req.body.status, txnQty, limit.redeemCashsellAfterBuyInterval, function (translimitres) {
                                                                    if (translimitres === "200") {
                                                                        validateAmt(limit.redeemCashMin, limit.redeemCashMax, limit.redeemCashSilverMin, limit.redeemCashSilverMax, txnAmt).then((bool) => {
                                                                            if (bool) {
                                                                                next();
                                                                            }
                                                                        })
                                                                    } else {
                                                                        res.json({ status: "200", message: translimitres });
                                                                    }
                                                                });
                                                        });
                                                    } else {
                                                        res.json({ status: "200", message: translimitres });
                                                    }
                                                });
                                                break;
                                            case "sellCash":
                                                validateBuyAmount(truID, "redeemCash", function (translimitres) {
                                                    if (translimitres === "200") {
                                                        getAmountByQty(req.body.bulliontype, countrycode, req.body.transactiontype, req.body.value, req.body.trasactionCharges, function (a) {
                                                            var txnAmt = a.amt;
                                                            var txnQty = a.qty;
                                                            validatetxnlimit(truID, limit.redeemCashmaxAmtOfTxnInDay, limit.redeemCashmaxAmtOfTxnInMonth, limit.redeemCashmaxAmtOfTxnInHour,
                                                                limit.redeemCashtxnInterval, limit.redeemCashnoOfTxnInInterval, "redeemCash", txnAmt, req.body.status, txnQty, limit.redeemCashsellAfterBuyInterval, function (translimitres) {
                                                                    if (translimitres === "200") {
                                                                        validateAmt(limit.redeemCashMin, limit.redeemCashMax, limit.redeemCashSilverMin, limit.redeemCashSilverMax, txnAmt).then((bool) => {
                                                                            if (bool) {
                                                                                next();
                                                                            }
                                                                        })
                                                                    } else {
                                                                        res.json({ status: "200", message: translimitres });
                                                                    }
                                                                });
                                                        });
                                                    } else {
                                                        res.json({ status: "200", message: translimitres });
                                                    }
                                                });
                                                break;
                                            case "transfer":
                                                var g24kqty = "0";
                                                var s99pqty = "0";
                                                if (req.body.g24qty) {
                                                    g24kqty = req.body.g24qty;
                                                }
                                                if (req.body.s99qty) {
                                                    s99pqty = req.body.s99qty;
                                                }
                                                // call Live rate api
                                                // validatetxnlimit(limit.transfermaxAmtOfTxnInDay, limit.transfermaxAmtOfTxnInMonth, limit.transfermaxAmtOfTxnInHour,
                                                //     limit.transfertxnInterval, limit.transfernoOfTxnInInterval, "transfer", function (translimitres) {
                                                getAmountByQty(req.body.bulliontype, countrycode, req.body.transactiontype, req.body.value, req.body.trasactionCharges, function (a) {
                                                    var txnAmt = a.amt;
                                                    validatetxnlimit(req.body.crnno, limit.transfermaxAmtOfTxnInDay, limit.transfermaxAmtOfTxnInMonth, limit.transfermaxAmtOfTxnInHour,
                                                        limit.transfertxnInterval, limit.transfernoOfTxnInInterval, "transfer", txnAmt, req.body.status, null, null, function (translimitres) {
                                                            if (translimitres === "200") {
                                                                validatetxnlimit(req.body.tocrnno, limit.transfermaxAmtOfTxnInDay, limit.transfermaxAmtOfTxnInMonth, limit.transfermaxAmtOfTxnInHour,
                                                                    limit.transfertxnInterval, limit.transfernoOfTxnInInterval, "transfer", txnAmt, req.body.status, null, null, function (translimitres) {
                                                                        if (translimitres === "200") {
                                                                            validateTransferAmt(limit.transferMin, limit.transferMax, limit.transferSilverMin, limit.transferSilverMax, g24kqty, s99pqty, txnAmt).then((bool) => {
                                                                                if (bool) {
                                                                                    next();
                                                                                }
                                                                            })
                                                                        } else {
                                                                            res.json({ status: "200", message: translimitres });
                                                                        }
                                                                    });
                                                            } else {
                                                                res.json({ status: "200", message: translimitres });
                                                            }
                                                        });
                                                });
                                                break;
                                            case "transferUnitByCash":
                                                // validatetxnlimit(
                                                //     limit.transfermaxAmtOfTxnInDay, limit.transfermaxAmtOfTxnInMonth, limit.transfermaxAmtOfTxnInSeconds,
                                                //     limit.transfernoOfTxnInSeconds, limit.transfertxnLimitInSeconds, "transfer", function (translimitres) {
                                                getAmountByQty(req.body.bulliontype, countrycode, req.body.transactiontype, req.body.value, req.body.trasactionCharges, function (a) {
                                                    var txnAmt = a.amt;
                                                    validatetxnlimit(truID, limit.transfermaxAmtOfTxnInDay, limit.transfermaxAmtOfTxnInMonth, limit.transfermaxAmtOfTxnInHour,
                                                        limit.transfertxnInterval, limit.transfernoOfTxnInInterval, "transfer", txnAmt, req.body.status, null, null, function (translimitres) {
                                                            if (translimitres === "200") {
                                                                validateQTY(limit.transferMin, limit.transferMax, limit.transferSilverMin, limit.transferSilverMax, req.body.bulliontype, txnAmt).then((bool) => {
                                                                    if (bool) {
                                                                        next();
                                                                    }
                                                                })
                                                            } else {
                                                                res.json({ status: "200", message: translimitres });
                                                            }
                                                        });
                                                });
                                                break;
                                            default:
                                                res.status(411).json({ status: "204", message: "something went wrong" })
                                        }
                                        async function validateTransferAmt(min, max, silvermin, silvermax, g24kqty, s99pqty, inputAmt) {
                                            // console.log("min, max, silvermin, silvermax", min, max, silvermin, silvermax)
                                            var g24kvalid = true;
                                            var s99pvalid = true;
                                            var bullions = "";
                                            if (req.body.bulliontype == "G24K") {
                                                var g24kamt = inputAmt;
                                                if (parseFloat(min) <= g24kamt && g24kamt <= parseFloat(max)) {
                                                    g24kvalid = true;
                                                } else {
                                                    bullions += " G24K Gold";
                                                    g24kvalid = false;
                                                }
                                            }
                                            else if (req.body.bulliontype == "S99P") {
                                                var s99pamt = inputAmt;
                                                if (parseFloat(silvermin) <= s99pamt && s99pamt <= parseFloat(silvermax)) {
                                                    s99pvalid = true;
                                                } else {
                                                    bullions += " 99% Silver";
                                                    s99pvalid = false;
                                                }
                                            }
                                            if (g24kvalid && s99pvalid) {
                                                return true;
                                            } else {
                                                res.json({ status: "411", message: "Please Enter valid" + bullions + " Stock" });
                                                return false;
                                            }
                                        }
                                        async function validateAmt(min, max, silvermin, silvermax, inputamt) {
                                            var g24kvalid = true;
                                            var s99pvalid = true;
                                            var bullions = "";
                                            var transactiontype = req.body.transactiontype;
                                            if (req.body.bulliontype == "G24K") {
                                                if (parseFloat(min) <= inputamt && inputamt <= parseFloat(max)) {
                                                    g24kvalid = true;
                                                }
                                                else {
                                                    bullions += " TruCoin Gold";
                                                    g24kvalid = false;
                                                }
                                            }
                                            else if (req.body.bulliontype == "S99P") {
                                                if (parseFloat(silvermin) <= inputamt && inputamt <= parseFloat(silvermax)) {
                                                    s99pvalid = true;
                                                } else {
                                                    bullions += " TruCoin Silver";
                                                    s99pvalid = false;
                                                }
                                            }
                                            if (g24kvalid && s99pvalid) {
                                                return true;
                                            }
                                            else {
                                                if (transactiontype == "sell") {
                                                    res.status(411).json({ status: "411", message: "Please enter valid" + bullions + " quantity" });
                                                }
                                                else {
                                                    res.status(411).json({ status: "411", message: "Please enter valid" + bullions + " amount" });
                                                }
                                                return false;
                                            }
                                        }
                                        async function validateBuy(min, max, silvermin, silvermax, inputamt) {
                                            var g24kvalid = true;
                                            var s99pvalid = true;
                                            var bullions = "";
                                            var minamtfortxn;
                                            if (req.body.bulliontype == "G24K") {
                                                minamtfortxn = min;
                                                if (parseFloat(min) <= inputamt && inputamt <= parseFloat(max)) {
                                                    g24kvalid = true;
                                                } else {
                                                    bullions += " TruCoin Gold";
                                                    g24kvalid = false;
                                                }
                                            }
                                            else if (req.body.bulliontype == "S99P") {
                                                minamtfortxn = silvermin;
                                                if (parseFloat(silvermin) <= inputamt && inputamt <= parseFloat(silvermax)) {
                                                    s99pvalid = true;
                                                } else {
                                                    bullions += " TruCoin Silver";
                                                    s99pvalid = false;
                                                }
                                            }
                                            if (g24kvalid && s99pvalid) {
                                                return true;
                                            } else {
                                                res.status(411).json({ status: "411", message: "Minimum amount of transaction for Buying " + bullions + " is ₹ " + minamtfortxn });
                                                return false;
                                            }
                                        }
                                        async function validateQTY(min, max, silvermin, silvermax, bullionType, inputAmt) {
                                            var g24kvalid = true;
                                            var s99pvalid = true;
                                            var bullions = "";
                                            if (bullionType == "G24K") {
                                                // getAmountByQty(req.body.bulliontype, countrycode, req.body.transactiontype, req.body.value, req.body.trasactionCharges, function (g24kqty) {
                                                var g24kqty = inputAmt;
                                                if (parseFloat(min) <= g24kqty && g24kqty <= parseFloat(max)) {
                                                    g24kvalid = true;
                                                } else {
                                                    bullions += " TruCoin Gold";
                                                    g24kvalid = false;
                                                }
                                                // })
                                            }
                                            if (bullionType == "S99P") {
                                                // getAmountByQty(req.body.bulliontype, countrycode, req.body.transactiontype, req.body.value, req.body.trasactionCharges, function (s99pqty) {
                                                var s99pqty = inputAmt;
                                                if (parseFloat(silvermin) <= s99pqty && s99pqty <= parseFloat(silvermax)) {
                                                    s99pvalid = true;
                                                } else {
                                                    bullions += " TruCoin Silver";
                                                    s99pvalid = false;
                                                }
                                                // })
                                            }
                                            if (g24kvalid && s99pvalid) {
                                                return true;
                                            } else {
                                                if (transactiontype == "transfer") {
                                                    res.status(411).json({ status: "411", message: "Please enter valid" + bullions + " quantity" });
                                                }
                                                else {
                                                    res.status(411).json({ status: "411", message: "Please enter valid" + bullions + " amount" });
                                                }
                                                return false;
                                            }
                                        }
                                        async function validateBuyAmount(truid, trType, callback) {
                                            let noOfSellTxns = 3;
                                            let txnInterval = 60 * 5;
                                            let lastInterval = new Date(Date.now() - (1000 * txnInterval));
                                            KycAll.aggregate([{ $match: { truID: truid } },
                                            { $project: { _id: 0, truID: 1, docVerified: 1 } },
                                            { $lookup: { from: "stocks", localField: "truID", foreignField: "truID", as: "stock" } },
                                            { $lookup: { from: "txns", localField: "truID", foreignField: "to", as: "txns" } },
                                            { $unwind: { path: "$txns", preserveNullAndEmptyArrays: true } },
                                            { $unwind: { path: "$stock", preserveNullAndEmptyArrays: true } },
                                            { "$sort": { "txns.createDate": -1 } },
                                            { $unwind: { path: "$txns.particularsG24", preserveNullAndEmptyArrays: true } },
                                            { $unwind: { path: "$txns.particularsS99", preserveNullAndEmptyArrays: true } },
                                            {
                                                $project: {
                                                    _id: 0, createDate: 1, truID: 1, docVerified: 1, currentStock: "$stock.stock",
                                                    "txns.consumerAmt": { $toDouble: { $sum: ["$txns.particularsG24.amount", "$txns.particularsS99.amount"] } },
                                                    "txns.G24KQty": "$txns.particularsG24.qty", "txns.S99PQty": "$txns.particularsS99.qty",
                                                    "txns.amt": { $toDouble: "$txns.totalAmount" }, "txns.month": { "$month": "$txns.createDate" },
                                                    "txns.year": { "$year": "$txns.createDate" }, "txns.day": { "$dayOfMonth": "$txns.createDate" },
                                                    "txns.createDate": "$txns.createDate", "txns.status": "$txns.status", "txns.type": "$txns.type",
                                                }
                                            },
                                            {
                                                $group: {
                                                    _id: "$truID",
                                                    txns: {
                                                        $push: {
                                                            createDate: "$txns.createDate", status: "$txns.status", consumerAmt: "$txns.consumerAmt", G24KQty: "$txns.G24KQty", S99PQty: "$txns.S99PQty",
                                                            amt: "$txns.amt", year: "$txns.year", month: "$txns.month", day: "$txns.day", type: "$txns.type",
                                                        }
                                                    },
                                                    truID: { $first: "$truID" },
                                                    docVerified: { $last: "$docVerified" },
                                                    currentStock: { $last: "$currentStock" }
                                                },

                                            },
                                            {
                                                $project: {
                                                    truID: 1, docVerified: 1, currentStock: 1,
                                                    lastTxnCount: {
                                                        $filter: {
                                                            input: "$txns",
                                                            as: "item",
                                                            cond: { $and: [{ $eq: ["$$item.type", trType] }, { $eq: ["$$item.status", "success"] }, { $gt: ["$$item.createDate", lastInterval] }] }

                                                        }
                                                    },
                                                    buyTxnCount: {
                                                        $filter: {
                                                            input: "$txns",
                                                            as: "item",
                                                            cond: { $and: [{ $eq: ["$$item.type", "buy"] }, { $eq: ["$$item.status", "success"] }] }
                                                        }
                                                    }
                                                }
                                            },
                                            {
                                                "$group": {
                                                    "_id": null,
                                                    "lastTxnCount": {
                                                        $push: {
                                                            txnCount: { $size: "$lastTxnCount.status" }

                                                        }
                                                    },
                                                    "txndata": {
                                                        $push: {
                                                            totalAmount: { "$sum": { "$sum": "$buyTxnCount.amt" } },
                                                            type: { "$arrayElemAt": ["$buyTxnCount.type", 0] }
                                                        }
                                                    },
                                                    truID: { $last: "$truID" }, docVerified: { $last: "$docVerified" },
                                                    currentStock: { $last: "$currentStock" }
                                                }
                                            },
                                            { $unwind: { path: "$lastTxnCount", preserveNullAndEmptyArrays: true } },
                                            { $unwind: { path: "$txndata", preserveNullAndEmptyArrays: true } },                                            
                                            {
                                                $project: {
                                                    _id: 0, truID: 1, totalAmount: { $ifNull: [{ $toString: "$txndata.totalAmount" }, "0"] },
                                                    txnCountStatus: {
                                                        $switch: {
                                                            branches: [{
                                                                case: { $gte: ["$lastTxnCount.txnCount", noOfSellTxns] },
                                                                "then": "400"
                                                            }],
                                                            default: "200"
                                                        }
                                                    },
                                                    resStatus: {
                                                        $switch: {
                                                            branches: [{
                                                                case: { $or: [{ "$eq": [trType, "sell"] }, { "$eq": [trType, "sellCash"] }, { "$eq": [trType, "redeemCash"] }] }, "then":
                                                                    { $cond: { if: { $gte: [{ $ifNull: ["$txndata.totalAmount", 0] }, minBuyforSell] }, then: "200", else: "400" } }
                                                            }],
                                                            default: "200"
                                                        }
                                                    }
                                                }
                                            }
                                            ]).exec(function (err, buyValResult) {
                                                if (buyValResult[0].txnCountStatus == "400") {
                                                    callback("Oops! Please try after Sometime.");
                                                }
                                                else if (buyValResult[0].resStatus == "200") {
                                                    callback("200");
                                                } else {
                                                    callback("Oops! You can not sell just yet! Buy Gold or Silver worth Rs. " + minBuyforSell + " to proceed.");

                                                }
                                            })
                                        }
                                        async function getAmountByQty(bultype, countryCode, transactiontype, val, clttxncharges, callback) {
                                            var rate = await reqassetmanagerRate(bultype, countryCode, transactiontype, clttxncharges);
                                            var amt = parseFloat(val);
                                            var qty = parseFloat(val);
                                            if (transactiontype == "sell" || transactiontype == "buy" || transactiontype == "transfer") {
                                                amt = parseFloat(val) * parseFloat(rate);
                                            }
                                            if (transactiontype == "buyCash" || transactiontype == "sellCash" || transactiontype == "redeemCash" || transactiontype == "transferUnitByCash") {
                                                qty = parseFloat(val) / parseFloat(rate);
                                            }
                                            var obj = {
                                                amt: amt,
                                                qty: {
                                                    G24K: (bultype == "G24K") ? qty : 0,
                                                    S99P: (bultype == "S99P") ? qty : 0
                                                },
                                            }
                                            callback(obj);
                                        }
                                        function reqassetmanagerRate(bulltype, ccode, txnType, clttxncharges) {
                                            return new Promise((resolve, reject) => {
                                                request.post({
                                                    "headers": { "content-type": "application/json" },
                                                    "url": reqip + ":4125/api/assetmanagerForClient",
                                                    "body": JSON.stringify({
                                                        "countryCode": ccode,
                                                        isTruID: true,
                                                        "transactiontype": txnType,
                                                        "trasactionCharges": clttxncharges
                                                    })
                                                }, (error, response, body) => {
                                                    if (error) {
                                                        resolve("0");
                                                    }
                                                    else {
                                                        var jData = JSON.parse(body);
                                                        req.topassetmanager = jData;
                                                        if (bulltype == "G24K") {
                                                            resolve(jData.trucoin_24kgold.rate)

                                                        } else if (bulltype == "S99P") {
                                                            resolve(jData.trucoin_99Pure.rate)
                                                        } else {
                                                            resolve(0);
                                                        }
                                                    }
                                                })
                                            })
                                        }
                                    } else {
                                        res.json({ status: "204", message: moduleres })
                                    }
                                });
                            } else {
                                res.json(JSON.parse(body))
                            }
                        } else {
                            res.json({ status: "204", message: "something went wrong" })
                        }
                    }

                });

            } else {
                switch (docs[0].KYCFlag) {
                    case "holder":
                        res.json({ status: "204", message: "Consumer account on hold" });
                        break;
                    case "pending":
                        res.json({ status: "204", message: "Consumer e-kyc is pending." });
                        break;
                    default:
                        res.json({ status: "204", message: "Consumer account is not active. Please contact to Administrator." });
                }
            }
        }
        else {
            res.json({ status: "204", message: "User not found!" })
        }
    })
}
function funpermissionModule(moduleper, tType, callback) {
    var permissionVal = moduleper[tType];
    switch (permissionVal) {
        case "deny":
            callback("You don't have permission. Please contact to Administrator!");
            break;
        case "allow":
            callback("success");
            break;
        case "comingsoon":
            callback("Stay tuned. We are launching soon!");
            break;
        case "maintenance":
            callback("This process is under Maintaince now. Please try after some time!");
            break;
        case "closed":
            callback("You don't have permission. Please contact to Administrator!");
            break;
        case "disabled":
            callback("You don't have permission. Please contact to Administrator!");
            break;
        default:
            callback("You don't have permission. Please contact to Administrator!");

    }
}
function decimalChopper(num, fixed) {
    var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?');
    return num.toString().match(re)[0];
}