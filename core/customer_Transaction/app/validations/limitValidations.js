'use strict';

const KycAll = require('../models/custKYCAllModel'),
    fs = require('fs'),
    path = require('path'),
    defaultConf = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../regionConf.json')));
let minBuyforSell = 100;
exports.validatetxnlimit = async function (truID, maxAmtOfTxnInDay, maxAmtOfTxnInMonth, maxAmtOfTxnInHour, txnInterval, noOfTxnInInterval, trType, txnamt, status, bulQty, sellInterval, callback) {
    let monthvar = new Date().getMonth() + 1;
    let yearvar = new Date().getFullYear();
    let dayvar = new Date().getDate();
    // let lastInterval = new Date(ISODate().getTime() - 1000 * (txnInterval / 1000));
    let lastInterval = new Date(Date.now() - (1000 * parseFloat(txnInterval)));
    let sellTxnInterval = new Date(Date.now() - (1000 * parseFloat(sellInterval)));
    let maxAmtOfTxnInDayNew = useToFixed(parseFloat(maxAmtOfTxnInDay) - parseFloat(txnamt));
    let maxAmtOfTxnInMonthNew = useToFixed(parseFloat(maxAmtOfTxnInMonth) - parseFloat(txnamt));
    let maxAmtOfTxnInHourNew = useToFixed(parseFloat(maxAmtOfTxnInHour) - parseFloat(txnamt));
    txnInterval = txnInterval * 1000;
    sellInterval = sellInterval * 1000;
    noOfTxnInInterval = parseFloat(noOfTxnInInterval);
    var query = { $match: { $or: [{ truID: truID }, { CRNNo: truID }] } };
    var project = {
        truID: 1, docVerified: 1, currentStock: 1,
        singleTxn: {
            $filter: {
                input: "$txns",
                as: "item",
                cond: { $and: [{ $eq: ["$$item.type", trType] }, { $gt: ["$$item.createDate", lastInterval] }] }

            }
        },
        singleTxnSuccess: {
            $filter: {
                input: "$txns",
                as: "item",
                cond: { $and: [{ $eq: ["$$item.type", trType] }, { $eq: ["$$item.status", "success"] }, { $gt: ["$$item.createDate", lastInterval] }] }

            }
        },
        singleTxnFailure: {
            $filter: {
                input: "$txns",
                as: "item",
                cond: { $and: [{ $eq: ["$$item.type", trType] }, { $eq: ["$$item.status", "failure"] }, { $gt: ["$$item.createDate", lastInterval] }] }

            }
        },
        inMonth: {
            $filter: {
                input: "$txns",
                as: "item",
                cond: { $and: [{ $eq: ["$$item.type", trType] }, { $eq: ["$$item.year", yearvar] }, { $eq: ["$$item.month", monthvar] }, { $eq: ["$$item.status", "success"] }] }
            }
        },
        inDay: {
            $filter: {
                input: "$txns",
                as: "item",
                cond: { $and: [{ $eq: ["$$item.type", trType] }, { $eq: ["$$item.year", yearvar] }, { $eq: ["$$item.month", monthvar] }, { $eq: ["$$item.day", dayvar] }, { $eq: ["$$item.status", "success"] }] }

            }
        },
        inHour: {
            $filter: {
                input: "$txns",
                as: "item",
                cond: { $and: [{ $eq: ["$$item.type", trType] }, { $gt: ["$$item.createDate", new Date(new Date().getTime() - 1000 * 60 * 60)] }, { $eq: ["$$item.status", "success"] }] }

            }
        }

    }
    var groupTXNObj = {
        "_id": null,
        "singleTxn": {
            $push: {
                totalAmount: { "$sum": { "$sum": "$singleTxn.consumerAmt" } },
                singleTxnFailure: { "$arrayElemAt": ["$singleTxnFailure.createDate", 0] },
                singleTxnSuccess: { "$arrayElemAt": ["$singleTxnSuccess.createDate", 0] },
                datediffFailure: { $ifNull: [{ $subtract: [new Date(), { "$arrayElemAt": ["$singleTxnFailure.createDate", 0] }] }, txnInterval] },
                datediffSuccess: { $ifNull: [{ $subtract: [new Date(), { "$arrayElemAt": ["$singleTxnSuccess.createDate", 0] }] }, txnInterval] },
                type: { "$arrayElemAt": ["$singleTxn.type", 0] },
                failureTxns: {
                    $ifNull: [{
                        $size: {
                            $filter: {
                                input: "$singleTxn",
                                as: "item",
                                cond: { $eq: ["$$item.status", "failure"] }
                            }
                        }
                    }, 0]
                },
                successTxns: {
                    $ifNull: [{
                        $size: {
                            $filter: {
                                input: "$singleTxn",
                                as: "item",
                                cond: { $eq: ["$$item.status", "success"] }
                            }
                        }
                    }, 0]
                }
            }
        },
        "inMonth": {
            $push: {
                totalAmount: { "$sum": { "$sum": "$inMonth.consumerAmt" } }, lastSalesDate: { "$arrayElemAt": ["$inMonth.createDate", 0] },
                type: { "$arrayElemAt": ["$inMonth.type", 0] }
            }
        },
        "inDay": {
            $push: {
                totalAmount: { "$sum": { "$sum": "$inDay.consumerAmt" } }, lastSalesDate: { "$arrayElemAt": ["$inDay.createDate", 0] },
                type: { "$arrayElemAt": ["$inDay.type", 0] }
            }
        },
        "inHour": {
            $push: {
                totalAmount: { "$sum": { "$sum": "$inHour.consumerAmt" } }, lastSalesDate: { "$arrayElemAt": ["$inHour.createDate", 0] },
                type: { "$arrayElemAt": ["$inHour.type", 0] }
            }
        },
        truID: { $last: "$truID" }, docVerified: { $last: "$docVerified" },
        currentStock: { $last: "$currentStock" }
    }
    var finalproject = {
        _id: 0,
        "singleTxn.truID": "$truID",
        "singleTxn.docVerified": "$docVerified",
        "singleTxn.totalAmount": { $ifNull: ["$singleTxn.totalAmount", 0] },
        "singleTxn.resStatusSuccess": {
            $switch: {
                branches: [{
                    case: { $gte: ["$singleTxn.datediffSuccess", txnInterval] },
                    "then": 200
                }, {
                    case: { $lt: ["$singleTxn.successTxns", noOfTxnInInterval] },
                    "then": 200
                }],
                default: 400
            }

        },
        "singleTxn.resStatusFailure": {
            $switch: {
                branches: [{
                    case: { $gte: ["$singleTxn.datediffFailure", txnInterval] },
                    "then": 200
                }, {
                    case: { $lte: ["$singleTxn.failureTxns", noOfTxnInInterval] },
                    "then": 200
                }],
                default: 400
            }

        },
        "singleTxn.remainingTimeSuccess": {
            $cond: {
                if: {
                    $and: [{
                        $lte: [{
                            $subtract: [txnInterval, "$singleTxn.datediffSuccess"]
                        }, 0]
                    }, { $lte: ["$successTxns", noOfTxnInInterval] }]
                }
                , then: "OK", else: { $floor: { $divide: [{ $subtract: [txnInterval, "$singleTxn.datediffSuccess"] }, 60000] } }
            }
        },
        "singleTxn.remainingTimeFailure": {
            $cond: {
                if: {
                    $and: [{
                        $lte: [{
                            $subtract: [txnInterval, "$singleTxn.datediffFailure"]
                        }, 0]
                    }, { $lte: ["failureTxns", noOfTxnInInterval] }]
                }
                , then: "OK", else: { $floor: { $divide: [{ $subtract: [txnInterval, "$singleTxn.datediffFailure"] }, 60000] } }
            }
        },

        "inMonth.truID": "$truID",
        "inMonth.docVerified": "$docVerified",
        "inMonth.totalAmount": { $ifNull: ["$inMonth.totalAmount", 0] },
        "inMonth.resStatus": {
            $cond: {
                if: {
                    $lte: [{
                        $subtract: ["$inMonth.totalAmount", parseFloat(maxAmtOfTxnInMonthNew)]
                    }, 0]
                }, then: "200", else: "400"
            }
        },
        "inDay.truID": "$truID",
        "inDay.docVerified": "$docVerified",
        "inDay.totalAmount": { $ifNull: ["$inDay.totalAmount", 0] },
        "inDay.resStatus": {
            $cond: {
                if: {
                    $lte: [{
                        $subtract: ["$inDay.totalAmount", parseFloat(maxAmtOfTxnInDayNew)]
                    }, 0]
                }, then: "200", else: "400"
            }
        },
        "inHour.truID": "$truID",
        "inHour.docVerified": "$docVerified",
        "inHour.totalAmount": { $ifNull: ["$inHour.totalAmount", 0] },
        "inHour.resStatus": {
            $cond: {
                if: {
                    $lte: [{
                        $subtract: ["$inHour.totalAmount", parseFloat(maxAmtOfTxnInHourNew)]
                    }, 0]
                }, then: "200", else: "400"
            }
        }
    }
    if (trType === "sell" || trType === "redeemCash") {
        let bulQtyG24K = bulQty.G24K;
        let bulQtyS99P = bulQty.S99P;
        project.totalQty = {
            $filter: {
                input: "$txns",
                as: "item",
                cond: { $and: [{ $in: ["$$item.type", ["buy"]] }, { $eq: ["$$item.status", "success"] }, { $gt: ["$$item.createDate", sellTxnInterval] }] }

            }
        };
        groupTXNObj.totalQty = {
            $push: {
                G24KQty: { "$sum": { "$sum": "$totalQty.G24KQty" } },
                S99PQty: { "$sum": { "$sum": "$totalQty.S99PQty" } },
                datediffSuccess: { $ifNull: [{ $subtract: [new Date(), { "$arrayElemAt": ["$totalQty.createDate", 0] }] }, sellTxnInterval] },
                type: { "$arrayElemAt": ["$totalQty.type", 0] }
            }
        };
        finalproject["totalQty.truID"] = "$truID";
        finalproject["totalQty.docVerified"] = "$docVerified";
        finalproject["totalQty.G24KQty"] = { $ifNull: ["$totalQty.G24KQty", 0] };
        finalproject["totalQty.S99PQty"] = { $ifNull: ["$totalQty.S99PQty", 0] };
        finalproject["totalQty.sellableG24KQty"] = { $ifNull: [{ $cond: [{ $lt: [{ $subtract: ["$currentStock.G24K", "$totalQty.G24KQty"] }, 0.000001] }, 0.00, { $subtract: ["$currentStock.G24K", "$totalQty.G24KQty"] }] }, 0] };
        finalproject["totalQty.sellableS99PQty"] = { $ifNull: [{ $cond: [{ $lt: [{ $subtract: ["$currentStock.S99P", "$totalQty.S99PQty"] }, 0.000001] }, 0.00, { $subtract: ["$currentStock.S99P", "$totalQty.S99PQty"] }] }, 0] };
        finalproject["totalQty.currentStockG24K"] = { $ifNull: ["$currentStock.G24K", 0] };
        finalproject["totalQty.currentStockS99P"] = { $ifNull: ["$currentStock.S99P", 0] };
        finalproject["totalQty.resStatusG24K"] = {
            $cond: {
                if: {
                    $lte: [bulQtyG24K, {
                        $toDouble: {
                            $subtract: ["$currentStock.G24K", "$totalQty.G24KQty"]
                        }
                    }]
                }, then: "200", else: "400"
            }
        };
        finalproject["totalQty.resStatusS99P"] = {
            $cond: {
                if: {
                    $lte: [bulQtyS99P, {
                        $toDouble: {
                            $subtract: ["$currentStock.S99P", "$totalQty.S99PQty"]
                        }
                    }]
                }, then: "200", else: "400"
            }
        };
        finalproject["totalQty.remainingTimeG24K"] = {
            $cond: {
                if: {
                    $lte: [bulQtyG24K, {
                        $toDouble: {
                            $subtract: ["$currentStock.G24K", "$totalQty.G24KQty"]
                        }
                    }]
                }, then: "OK", else: { $abs: { $floor: { $divide: [{ $subtract: [sellTxnInterval, { $subtract: [new Date(), { $ifNull: ["$totalQty.datediffSuccess", new Date()] }] }] }, 60000] } } }
            }
        }
        finalproject["totalQty.remainingTimeS99P"] = {
            $cond: {
                if: {
                    $lte: [bulQtyS99P, {
                        $toDouble: {
                            $subtract: ["$currentStock.S99P", "$totalQty.S99PQty"]
                        }
                    }]
                }, then: "OK", else: { $abs: { $floor: { $divide: [{ $subtract: [sellTxnInterval, { $subtract: [new Date(), { $ifNull: ["$totalQty.datediffSuccess", new Date()] }] }] }, 60000] } } }
            }
        }
    }
    KycAll.aggregate([
        query,
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
            $project: project
        },
        {
            "$group": groupTXNObj
        },
        { $unwind: { path: "$singleTxn", preserveNullAndEmptyArrays: true } },
        { $unwind: { path: "$inMonth", preserveNullAndEmptyArrays: true } },
        { $unwind: { path: "$inDay", preserveNullAndEmptyArrays: true } },
        { $unwind: { path: "$inHour", preserveNullAndEmptyArrays: true } },
        { $unwind: { path: "$totalQty", preserveNullAndEmptyArrays: true } },
        {
            $project: finalproject
        }
    ]).exec(function (err, txnValResult) {
        if (err) {
            callback("Something went wrong..!!");
        } else {
            var msg, boolstatus;
            if (txnValResult) {
                if ((txnValResult[0].singleTxn.resStatusSuccess == "200" || txnValResult[0].singleTxn.resStatusFailure == "200")
                    && txnValResult[0].inHour.resStatus == "200"
                    && txnValResult[0].inDay.resStatus == "200"
                    && txnValResult[0].inMonth.resStatus == "200"
                    && txnValResult[0].inDay.resStatus == "200"
                    // && txnValResult[0].sellagaistbuyValue.resStatus == "200"
                ) { boolstatus = true } else {
                    Object.keys(txnValResult[0]).forEach(function (key) {
                        if (key == "singleTxn") {
                            if ((txnValResult[0].singleTxn.resStatusSuccess !== "200" && txnValResult[0].singleTxn.resStatusFailure !== "200")) {
                                /* if (status === "failure") {
                                    var time = txnValResult[0].singleTxn.remainingTimeFailure + 1;
                                } else {
                                } */
                                var time = txnValResult[0].singleTxn.remainingTimeSuccess + 1;
                                if (time <= 0) {
                                    msg = "Please do the next transaction after sometime. This is for your transaction safety.";
                                } else {
                                    msg = "Please do the next transaction after " + retuntimeinstring(time) + ". This is for your transaction safety.";
                                }
                                // msgbool = true;
                                // break;
                            }
                        } else if (txnValResult[0][key].resStatus != "200") {
                            switch (key) {
                                // case "singleTxn":
                                //     if (status === "failure") {
                                //         var time = txnValResult[0].singleTxn.remainingTimeFailure + 1;
                                //     } else {
                                //         var time = txnValResult[0].singleTxn.remainingTimeSuccess + 1;
                                //     }
                                //     msg = "Please do the next transaction after " + time + " min. This is for your transaction safety."; 
                                //     break;
                                case "inHour":
                                    msg = "You have exceeds your hourly transaction limit.";
                                    break;
                                case "inDay":
                                    msg = "You have exceeds your daily transaction limit.";
                                    break;
                                case "inMonth":
                                    msg = "You have exceeds your monthly transaction limit.";
                                    break;
                            }
                        }
                    });

                };
                if (boolstatus) {
                    if (trType === "sell" || trType === "redeemCash") {
                        if (txnValResult[0].totalQty.resStatusG24K == "200" && txnValResult[0].totalQty.resStatusS99P == "200") {
                            callback("200");
                        } else {
                            if (txnValResult[0].totalQty.resStatusG24K !== "200" && txnValResult[0].totalQty.resStatusS99P !== "200") {
                                var sellableStockG24K = txnValResult[0].totalQty.sellableG24KQty;
                                var sellableStockS99P = txnValResult[0].totalQty.sellableS99PQty;
                                msg = "You can only sell Upto " + decimalChopper(sellableStockG24K, 4) + " gms of TruCoin Gold or " + decimalChopper(sellableStockS99P, 4) + " gms of TruCoin Silver.";
                            } else if (txnValResult[0].totalQty.resStatusS99P !== "200") {
                                var time = txnValResult[0].totalQty.remainingTimeS99P;
                                var sellableStock = txnValResult[0].totalQty.sellableS99PQty;
                                if (parseFloat(sellableStock) > 0) {
                                    msg = "You can only sell Upto " + decimalChopper(sellableStock, 4) + " gms of TruCoin Silver. To Sell full stock wait " + retuntimeinstring(time);
                                } else {
                                    msg = "You can not Sell just yet Please try after " + retuntimeinstring(time);
                                }
                            } else if (txnValResult[0].totalQty.resStatusG24K !== "200") {
                                var time = txnValResult[0].totalQty.remainingTimeG24K;
                                var sellableStock = txnValResult[0].totalQty.sellableG24KQty;
                                if (parseFloat(sellableStock) > 0) {
                                    msg = "You can only sell Upto " + decimalChopper(sellableStock, 4) + " gms of TruCoin Gold. To Sell full stock wait " + retuntimeinstring(time);
                                } else {
                                    msg = "You can not Sell just yet Please try after " + retuntimeinstring(time);
                                }
                            }
                            callback(msg);
                        }
                    } else {
                        callback("200");
                    }
                } else {
                    callback(msg);
                }
            } else {
                callback("Something went wrong..!!");
            }
        }
    })
}

function retuntimeinstring(val) {
    if (val > 60) {
        if ((val % 60) == 0) {
            return parseInt(val / 60) + " hr"
        } else {
            return parseInt(val / 60) + " hr " + parseInt(val % 60) + " min"
        }
    } else {
        return val + " min";
    }
}

exports.validatePANTXN = function (txnAmt, panStatus) {
    if (txnAmt > defaultConf.defaultNONPanLimit) {
        if (panStatus === "active") {
            return true;
        } else {
            return ({ status: "1101", message: "PAN verification is required for transaction values more than " + defaultConf.defaultCurrency + " " + defaultConf.defaultNONPanLimit + "." });
        }
    } else {
        return true;
    }
}
function decimalChopper(num, fixed) {
    var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?');
    return num.toString().match(re)[0];
}