const KycAll = require('../models/custKYCAllModel'),
    request = require('request'),
    fs = require('fs'),
    path = require('path'),
    defaultConf = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../regionConf.json'))),
    conf = require("../conf");
let reqip = conf.reqip,
    txnTimeLimit = 3600000;

function decimalChopper(num, fixed) {
    var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?');
    return num.toString().match(re)[0];
}

module.exports = {
    checkTXNLimit: function (truid, amt, callback) {
        let monthvar = (new Date()).getMonth() + 1;
        let yearvar = (new Date()).getFullYear();
        KycAll.aggregate([
            { $match: { truID: truid } },
            { $project: { _id: 0, truID: 1, docVerified: 1 } },
            {
                $lookup: {
                    from: "txns",
                    localField: "truID",
                    foreignField: "to",
                    as: "txns"
                }
            },
            {
                $project: {
                    truID: 1, docVerified: 1,
                    txns: {
                        $filter: {
                            input: "$txns",
                            as: "item",
                            cond: { $and: [{ $in: ["$$item.type", ["buy", "buyCash"]] }, { $eq: ["$$item.status", "success"] }] }

                        }
                    }
                }
            },
            { $unwind: { path: "$txns", preserveNullAndEmptyArrays: true } },
            { "$sort": { "txns.createDate": -1 } },

            {
                $project: {
                    truID: 1, docVerified: 1,
                    _id: 0, createDate: "$txns.createDate", status: "$txns.status", type: "$txns.type",
                    totalAmount: { $toDouble: "$txns.totalAmount" },
                    month: { "$month": "$txns.createDate" }, year: { "$year": "$txns.createDate" }
                }
            },
            {
                $group: {
                    _id: null,
                    txndata: {
                        $push: {
                            truID: "$truID", docVerified: "$docVerified", createDate: "$createDate", status: "$status", totalAmount: "$totalAmount", month: "$month", year: "$year"
                        }
                    },
                    truID: { $last: "$truID" }, docVerified: { $last: "$docVerified" }
                }
            },
            {
                $project: {
                    truID: 1, docVerified: 1,
                    txns: {
                        $filter: {
                            input: "$txndata",
                            as: "item",
                            cond: { $and: [{ $eq: ["$$item.year", yearvar] }, { $eq: ["$$item.month", monthvar] }] }

                        }
                    }
                }
            },
            { $unwind: { path: "$txns", preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: null,
                    lastSalesDate: { $last: "$txns.createDate" }, totalAmount: { $sum: "$txns.totalAmount" },
                    truID: { $last: "$truID" }, docVerified: { $last: "$docVerified" }
                }
            },
            {
                $project: {
                    _id: 0, truID: 1, docVerified: 1, txndata: 1, lastSalesDate: 1, totalAmount: 1
                }
            }
        ]).exec(function (err, docs) {
            //   console.log(parseFloat(do n  cs[0].txndata[0].totalAmount));
            if (!docs.length) {
                // res.json({status:"204",message:"User does not exists!!"})
                callback("204");
            } else {
                var docverify = docs[0].docVerified,
                    totalamt = amt;
                if (docs[0].totalAmount) {
                    totalamt = parseFloat(docs[0].totalAmount) + amt;
                }
                var kycflag = "nonKYC";
                if (docverify === true) {
                    kycflag = "KYC";
                }

                readFromDB(docverify, totalamt, kycflag);

                function readFromDB(docverify, totalamt, kycflag) {
                    try {
                        request.post({
                            "headers": {
                                "content-type": "application/json"
                            },
                            "url": reqip + ":4125/api/showconsumerconfigurations",
                            "body": JSON.stringify({
                                "kycflag": kycflag,
                                "appliedOn": "consumer"
                            })
                        }, (error, response, body) => {
                            if (error) {
                                // callback({status:"204",messege : "Something went wrong!"})
                                callback("205")
                            }
                            else {
                                if (response.statusCode == 200) {
                                    var result = JSON.parse(body);
                                    if (result.status == 200) {
                                        if (result.resource) {
                                            var txnAmountLimit = 0;
                                            if (result[0] && result[0].txnAmountLimit) {
                                                txnAmountLimit = result.resource.limit.txnamountlimit;
                                                // remnantAmount = result[0].TXN.remnantAmount.toJSON().$numberDecimal;
                                                // checklimit = consumerconfig[0].TXN.checklimit;
                                            }
                                            if (docverify === "false") {
                                                if (txnAmountLimit >= totalamt) {
                                                    callback("200");
                                                } else {
                                                    callback("500")
                                                }
                                            } else {
                                                callback("200");
                                            }


                                        } else {

                                        }
                                    } else {
                                        callback("206");
                                    }
                                } else {
                                    callback("206");
                                }

                            }
                        })
                    }
                    catch (ex) {
                        // callback({status:"204",messege : "Something went wrong!"})
                        callback("204");
                    }
                }
            }
        }
        )
    },

    checktransferLimit: function (truid, amt, callback) {
        let monthvar = (new Date()).getMonth() + 1;
        let yearvar = (new Date()).getFullYear();
        KycAll.aggregate([
            { $match: { truID: truid } },
            { $project: { _id: 0, truID: 1, docVerified: 1 } },
            {
                $lookup: {
                    from: "txns",
                    let: { truid: "$truID" },
                    pipeline: [
                        {
                            $match:
                            {
                                $expr:
                                {
                                    $and:
                                        [{ $eq: ["$to", "$$truid"] },
                                        { $eq: ["$status", "success"] },
                                        { $or: [{ $eq: ["$type", "redeemCash"] }, { $eq: ["$type", "transfer"] }] }
                                        ]
                                }
                            }
                        },
                        { $project: { totalAmount: 1, type: 1, _id: 0, month: { "$month": "$createDate" }, year: { "$year": "$createDate" } } },
                        { $match: { year: yearvar, month: monthvar } },
                        {
                            $group: {
                                _id: null,
                                totalAmount: { $sum: "$totalAmount" }
                            }
                        }
                    ],
                    as: "txndata"
                }
            }
        ]).exec(function (err, docs) {
            //   console.log(parseFloat(do n  cs[0].txndata[0].totalAmount));
            if (!docs.length) {
                // res.json({status:"204",message:"User does not exists!!"})
                callback("204");
            } else {
                var docverify = docs[0].docVerified,
                    totalamt = amt;
                if (docs[0].txndata && docs[0].txndata.length) {
                    totalamt = parseFloat(docs[0].txndata[0].totalAmount) + amt;
                }
                var kycflag = "nonKYC";
                if (docverify === true) {
                    kycflag = "KYC";
                }
                readFromDB(docverify, totalamt, kycflag);
                function readFromDB(docverify, totalamt, kycflag) {
                    try {
                        request.post({
                            "headers": {
                                "content-type": "application/json"
                            },
                            "url": reqip + ":4125/api/showconsumerconfigurations",
                            "body": JSON.stringify({
                                "kycflag": kycflag,
                                "appliedOn": "consumer"
                            })
                        }, (error, response, body) => {
                            if (error) {
                                // callback({status:"204",messege : "Something went wrong!"})
                                callback("205")
                            }
                            else {
                                if (response.statusCode == 200) {
                                    var result = JSON.parse(body);
                                    if (result.status == 200) {
                                        if (result.resource) {
                                            var txnAmountLimit = 0;
                                            if (result[0] && result[0].txnAmountLimit) {
                                                txnAmountLimit = result.resource.limit.txnamountlimit;
                                                // remnantAmount = result[0].TXN.remnantAmount.toJSON().$numberDecimal;
                                                // checklimit = consumerconfig[0].TXN.checklimit;
                                            }
                                            if (docverify === "false") {
                                                if (txnAmountLimit >= totalamt) {
                                                    callback("200");
                                                } else {
                                                    callback("500")
                                                }
                                            } else {
                                                callback("200");
                                            }


                                        } else {

                                        }
                                    } else {
                                        callback("206");
                                    }
                                } else {
                                    callback("206");
                                }

                            }
                        })
                    }
                    catch (ex) {
                        // callback({status:"204",messege : "Something went wrong!"})
                        callback("204");
                    }
                }
            }
        })
    },

    checkWalletLimit: function (truid, amt, callback) {
        let monthvar = (new Date()).getMonth() + 1;
        let yearvar = (new Date()).getFullYear();
        KycAll.aggregate([
            { $match: { truID: truid } },
            { $project: { _id: 0, truID: 1, docVerified: 1 } },
            {
                $lookup: {
                    from: "walletlogs",
                    let: { truid: "$truID" },
                    pipeline: [
                        {
                            $match:
                            {
                                $expr:
                                {
                                    $and:
                                        [{ $eq: ["$truID", "$$truid"] },
                                        // { $eq: [ "$tType", "addMoney" ] },
                                        { $or: [{ $eq: ["$tType", "addMoney"] }, { $eq: ["$tType", "redeemCash"] }, { $eq: ["$tType", "buyCash"] }, { $eq: ["$tType", "transfer"] }, { $eq: ["$tType", "walletToBank"] }] }
                                        ]
                                }
                            }
                        },
                        { $project: { amt: { '$add': ['$Cr', '$Dr'] }, _id: 0, month: { "$month": "$createDate" }, year: { "$year": "$createDate" } } },
                        { $match: { year: yearvar, month: monthvar } },
                        {
                            $group: {
                                _id: null,
                                totalAmount: { $sum: "$amt" }
                            }
                        }
                    ],
                    as: "walletdata"
                }
            }
        ]).exec(function (err, docs) {
            if (!docs.length) {
                // res.json({status:"204",message:"User does not exists!!"})
                callback("204");
            } else {
                var docverify = docs[0].docVerified,
                    totalamt = amt;
                if (docs[0].walletdata && docs[0].walletdata.length) {
                    totalamt = parseFloat(docs[0].walletdata[0].totalAmount) + amt;
                }
                var kycflag = "nonKYC";
                if (docverify === true) {
                    kycflag = "KYC";
                }

                readFromDB(docverify, totalamt, kycflag);

                function readFromDB(docverify, totalamt, kycflag) {
                    try {
                        request.post({
                            "headers": {
                                "content-type": "application/json"
                            },
                            "url": reqip + ":4125/api/showconsumerconfigurations",
                            "body": JSON.stringify({
                                "kycflag": kycflag,
                                "appliedOn": "consumer",
                                "truid":truid
                            })
                        }, (error, response, body) => {
                            if (error) {
                                // callback({status:"204",messege : "Something went wrong!"})
                                callback("205")
                            }
                            else {
                                if (response.statusCode == 200) {
                                    var result = JSON.parse(body);
                                    if (result.status == 200) {
                                        if (result.resource) {
                                            var txnAmountLimit = 0;
                                            if (result[0] && result[0].txnAmountLimit) {
                                                txnAmountLimit = result.resource.limit.txnamountlimit;
                                                // remnantAmount = result[0].TXN.remnantAmount.toJSON().$numberDecimal;
                                                // checklimit = consumerconfig[0].TXN.checklimit;
                                            }
                                            if (docverify === "false") {
                                                if (txnAmountLimit >= totalamt) {
                                                    callback("200");
                                                } else {
                                                    callback("500")
                                                }
                                            } else {
                                                callback("200");
                                            }


                                        } else {

                                        }
                                    } else {
                                        callback("206");
                                    }
                                } else {
                                    callback("206");
                                }

                            }
                        })
                    }
                    catch (ex) {
                        // callback({status:"204",messege : "Something went wrong!"})
                        callback("204");
                    }
                }
            }
        }
        )
    },

    /* checkWallettobankLimit: function (truid, amt, callback) {
        let monthvar = (new Date()).getMonth() + 1;
        let yearvar = (new Date()).getFullYear();
        KycAll.aggregate([
            { $match: { truID: truid } },
            { $project: { _id: 0, truID: 1, docVerified: 1 } },
            {
                $lookup: {
                    from: "walletlogs",
                    let: { truid: "$truID" },
                    pipeline: [
                        {
                            $match:
                            {
                                $expr:
                                {
                                    $and:
                                        [{ $eq: ["$truID", "$$truid"] },
                                        { $or: [{ $eq: ["$type", "walletToBank"] }, { $eq: ["$status", "success"] }] }
                                        ]
                                }
                            }
                        },
                        { "$sort": { "date": -1 } },
                        {
                            $project: {
                                amt: { '$add': [{ $abs: "$Cr" }, { $abs: "$Dr" }] }, _id: 0, month: { "$month": "$createDate" },
                                year: { "$year": "$createDate" }, createDate: "$createDate", status: 1
                            }
                        },
                        { $match: { year: yearvar, month: monthvar, status: "success" } },
                        {
                            $group: {
                                _id: null,
                                lastSalesDate: { $last: "$createDate" },
                                totalAmount: { $sum: "$amt" },

                            }
                        }
                    ],
                    as: "walletdata"
                }
            },
            { $unwind: { path: "$walletdata", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    truID: 1, docVerified: 1, totalAmount: { $ifNull: ["$walletdata.totalAmount", 0] },
                    datediff: { $ifNull: [{ $subtract: [new Date(), "$walletdata.lastSalesDate"] }, txnTimeLimit] }
                }
            },
            {
                $project: {
                    truID: 1, docVerified: 1, totalAmount: 1,
                    resStatus: { $cond: { if: { $gte: ["$datediff", txnTimeLimit] }, then: "200", else: "400" } },
                    remainingTime: {
                        $cond: {
                            if: { $lte: [{ $subtract: [txnTimeLimit, "$datediff"] }, 0] }, then: "OK",
                            else: { $floor: { $divide: [{ $subtract: [txnTimeLimit, "$datediff"] }, 60000] } }
                        }
                    }
                }
            }
        ]).exec(function (err, docs) {
            if (!docs.length) {
                // res.json({status:"204",message:"User does not exists!!"})
                callback("204");
            } else {
                if (docs[0].resStatus === "200" && docs[0].remainingTime === "OK") {
                    var docverify = docs[0].docVerified,
                        totalamt = amt;
                    if (docs[0].totalAmount > 0) {
                        totalamt = parseFloat(docs[0].totalAmount) + amt;
                    }
                    var kycflag = "nonKYC";
                    if (docverify === true) {
                        kycflag = "KYC";
                    }
                    readFromDB(docverify, totalamt, kycflag);

                    function readFromDB(docverify, totalamt, kycflag) {
                        try {
                            request.post({
                                "headers": {
                                    "content-type": "application/json"
                                },
                                "url": reqip + ":4125/api/showconsumerconfigurations",
                                "body": JSON.stringify({
                                    "kycflag": kycflag,
                                    "appliedOn": "consumer"
                                })
                            }, (error, response, body) => {
                                if (error) {
                                    // callback({status:"204",messege : "Something went wrong!"})
                                    callback("205")
                                }
                                else {
                                    if (response.statusCode == 200) {
                                        var result = JSON.parse(body);
                                        if (result.status == 200) {
                                            if (result.resource) {
                                                var txnAmountLimit = 0;
                                                if (result[0] && result[0].txnAmountLimit) {
                                                    txnAmountLimit = result.resource.limit.txnamountlimit;
                                                    // remnantAmount = result[0].TXN.remnantAmount.toJSON().$numberDecimal;
                                                    // checklimit = consumerconfig[0].TXN.checklimit;
                                                }
                                                if (docverify === "false") {
                                                    if (txnAmountLimit >= totalamt) {
                                                        callback("200");
                                                    } else {
                                                        callback("500")
                                                    }
                                                } else {
                                                    callback("200");
                                                }


                                            } else {

                                            }
                                        } else {
                                            callback("206");
                                        }
                                    } else {
                                        callback("206");
                                    }

                                }
                            })
                        }
                        catch (ex) {
                            // callback({status:"204",messege : "Something went wrong!"})
                            callback("204");
                        }
                    }
                } else {
                    callback("400", docs[0].remainingTime);
                }

            }
        }
        )
    }, */

    checkWallettobankLimit: function (truid, amt, limit, callback) {
        var maxAmtOfTxnInDay = limit.walletToBankmaxAmtOfTxnInDay,
            maxAmtOfTxnInMonth = limit.walletToBankmaxAmtOfTxnInMonth,
            maxAmtOfTxnInHour = limit.walletToBankmaxAmtOfTxnInHour,
            txnInterval = limit.walletToBanktxnInterval,
            noOfTxnInInterval = limit.walletToBanknoOfTxnInInterval;

        let monthvar = new Date().getMonth() + 1;
        let yearvar = new Date().getFullYear();
        let dayvar = new Date().getDate();
        // let lastInterval = new Date(ISODate().getTime() - 1000 * (txnInterval / 1000));
        let lastInterval = new Date(Date.now() - (1000 * parseFloat(txnInterval)));
        var maxAmtOfTxnInDayNew = parseFloat(maxAmtOfTxnInDay);
        var maxAmtOfTxnInMonthNew = parseFloat(maxAmtOfTxnInMonth);
        var maxAmtOfTxnInHourNew = parseFloat(maxAmtOfTxnInHour);
        txnInterval = txnInterval * 1000;
        noOfTxnInInterval = parseFloat(noOfTxnInInterval);

        KycAll.aggregate([
            { $match: { truID: truid } },
            { $project: { _id: 0, truID: 1, docVerified: 1 } },
            {
                $lookup: {
                    from: "wallets",
                    localField: "truID",
                    foreignField: "truID",
                    as: "wallets"
                }
            },
            { $unwind: { path: "$wallets", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "walletlogs",
                    localField: "truID",
                    foreignField: "truID",
                    as: "walletdata"
                }
            },
            { $unwind: { path: "$walletdata", preserveNullAndEmptyArrays: true } },
            { $sort: { "walletdata.createDate": -1 } },
            {
                $project: {
                    _id: 0, truID: 1, docVerified: 1, clBal: "$wallets.clBal",
                    "walletdata.moneyAdded": "$walletdata.moneyAdded",
                    "walletdata.createDate": "$walletdata.createDate",
                    "walletdata.truID": "$walletdata.truID",
                    "walletdata.status": "$walletdata.status",
                    "walletdata.Cr": "$walletdata.Cr",
                    "walletdata.Dr": "$walletdata.Dr",
                    "walletdata.invoice": "$walletdata.invoice",
                    "walletdata.tType": "$walletdata.tType",
                    "walletdata.particulars": "$walletdata.particulars",
                    "walletdata.month": { "$month": "$walletdata.createDate" },
                    "walletdata.year": { "$year": "$walletdata.createDate" },
                    "walletdata.day": { "$dayOfMonth": "$walletdata.createDate" },

                }
            },
            {
                $group: {
                    _id: "$truID",
                    walletdata: {
                        $push: {
                            moneyAdded: "$walletdata.moneyAdded",
                            createDate: "$walletdata.createDate",
                            truID: "$walletdata.truID",
                            status: "$walletdata.status",
                            Cr: "$walletdata.Cr",
                            Dr: "$walletdata.Dr",
                            invoice: "$walletdata.invoice",
                            tType: "$walletdata.tType",
                            particulars: "$walletdata.particulars",
                            month: "$walletdata.month",
                            year: "$walletdata.year",
                            day: "$walletdata.day",

                        }
                    },
                    truID: { $first: "$truID" },
                    clBal: { $first: "$clBal" },
                    docVerified: { $last: "$docVerified" }
                },
            },
            {
                $project: {
                    _id: 0, truID: 1, docVerified: 1, clBal: 1,
                    walletdata: {
                        $filter: {
                            input: "$walletdata",
                            as: "item",
                            cond: {
                                $and:
                                    [
                                        { $eq: ["$$item.tType", "walletToBank"] }, { $eq: ["$$item.status", "success"] },
                                    ]
                            }

                        }
                    },
                    singleTxn: {
                        $filter: {
                            input: "$walletdata",
                            as: "item",
                            cond: { $and: [{ $eq: ["$$item.tType", "walletToBank"] }, { $eq: ["$$item.status", "success"] }, { $gt: ["$$item.createDate", lastInterval] }] }

                        }
                    },
                    inMonth: {
                        $filter: {
                            input: "$walletdata",
                            as: "item",
                            cond: { $and: [{ $eq: ["$$item.tType", "walletToBank"] }, { $eq: ["$$item.status", "success"] }, { $eq: ["$$item.year", yearvar] }, { $eq: ["$$item.month", monthvar] }] }
                        }
                    },
                    inDay: {
                        $filter: {
                            input: "$walletdata",
                            as: "item",
                            cond: { $and: [{ $eq: ["$$item.tType", "walletToBank"] }, { $eq: ["$$item.status", "success"] }, { $eq: ["$$item.year", yearvar] }, { $eq: ["$$item.month", monthvar] }, { $eq: ["$$item.day", dayvar] }] }

                        }
                    },
                    inAddDay: {
                        $filter: {
                            input: "$walletdata",
                            as: "item",
                            cond: { $and: [{ $eq: ["$$item.tType", "walletToBank"] }, { $eq: ["$$item.status", "success"] }, { $gt: ["$$item.createDate", new Date(new Date().getTime() - 1000 * 60 * 60 * 24)] }] }
                        }
                    },
                    inHour: {
                        $filter: {
                            input: "$walletdata",
                            as: "item",
                            cond: { $and: [{ $eq: ["$$item.tType", "walletToBank"] }, { $eq: ["$$item.status", "success"] }, { $gt: ["$$item.createDate", new Date(new Date().getTime() - 1000 * 60 * 60)] }] }

                        }
                    }

                }
            },
            {
                "$group": {
                    "_id": "$Id",
                    "walletdata": {
                        $push: {
                            "totalAmount": {
                                $abs: {
                                    $add: [{
                                        $sum: {
                                            $sum: "$walletdata.Cr"
                                        }
                                    }, {
                                        $sum: {
                                            $sum: "$walletdata.Dr"
                                        }
                                    }]
                                }
                            },
                        }
                    },
                    "singleTxn": {
                        $push: {
                            totalAmount: {
                                $abs: {
                                    $add: [{
                                        $sum: {
                                            $sum: "$singleTxn.Cr"
                                        }
                                    }, {
                                        $sum: {
                                            $sum: "$singleTxn.Dr"
                                        }
                                    }]
                                }
                            }, lastSalesDate: { "$arrayElemAt": ["$singleTxn.createDate", 0] },
                            datediff: { $ifNull: [{ $subtract: [new Date(), { "$arrayElemAt": ["$singleTxn.createDate", 0] }] }, txnInterval] },
                            txns: {
                                $ifNull: [{ $size: "$singleTxn" }, 0]
                            },
                            type: { "$arrayElemAt": ["$singleTxn.type", 0] }
                        }
                    },
                    "inMonth": {
                        $push: {
                            totalAmount: {
                                $abs: {
                                    $add: [{
                                        $sum: {
                                            $sum: "$inMonth.Cr"
                                        }
                                    }, {
                                        $sum: {
                                            $sum: "$inMonth.Dr"
                                        }
                                    }]
                                }
                            }, lastSalesDate: { "$arrayElemAt": ["$inMonth.createDate", 0] },
                            type: { "$arrayElemAt": ["$inMonth.type", 0] }
                        }
                    },
                    "inDay": {
                        $push: {
                            totalAmount: {
                                $abs: {
                                    $add: [{
                                        $sum: {
                                            $sum: "$inDay.Cr"
                                        }
                                    }, {
                                        $sum: {
                                            $sum: "$inDay.Dr"
                                        }
                                    }]
                                }
                            }, lastSalesDate: { "$arrayElemAt": ["$inDay.createDate", 0] },
                            type: { "$arrayElemAt": ["$inDay.type", 0] }
                        }
                    },
                    "inAddDay": {
                        $push: {
                            totalAmount: {
                                $abs: {
                                    $add: [{
                                        $sum: {
                                            $sum: "$inAddDay.Cr"
                                        }
                                    }, {
                                        $sum: {
                                            $sum: "$inAddDay.Dr"
                                        }
                                    }]
                                }
                            }, lastSalesDate: { "$arrayElemAt": ["$inAddDay.createDate", 0] },
                            datediff: { $floor: { $divide: [{ $subtract: [new Date(), { "$arrayElemAt": ["$inAddDay.createDate", 0] }] }, 60000] } },
                            type: { "$arrayElemAt": ["$inAddDay.type", 0] }
                        }
                    },
                    "inHour": {
                        $push: {
                            totalAmount: {
                                $abs: {
                                    $add: [{
                                        $sum: {
                                            $sum: "$inHour.Cr"
                                        }
                                    }, {
                                        $sum: {
                                            $sum: "$inHour.Dr"
                                        }
                                    }]
                                }
                            }, lastSalesDate: { "$arrayElemAt": ["$inHour.createDate", 0] },
                            type: { "$arrayElemAt": ["$inHour.type", 0] }
                        }
                    },
                    "truID": { $first: "$truID" },
                    "clBal": { $first: "$clBal" },
                    "docVerified": { $first: "$docVerified" }
                }
            },
            { $unwind: { path: "$walletdata", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$singleTxn", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$inMonth", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$inDay", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$inAddDay", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$inHour", preserveNullAndEmptyArrays: true } },
            {
                $project: {

                    _id: 0,

                    "walletdata.truID": "$truID",
                    "walletdata.docVerified": "$docVerified",
                    "walletdata.totalAmount": { $ifNull: ["$walletdata.totalAmount", 0] },


                    "singleTxn.truID": "$truID",
                    "singleTxn.docVerified": "$docVerified",
                    "singleTxn.totalAmount": { $ifNull: ["$singleTxn.totalAmount", 0] },
                    "singleTxn.resStatus": {
                        $switch: {
                            branches: [{
                                case: { $gte: ["$singleTxn.datediff", txnInterval] },
                                "then": 200
                            }, {
                                case: { $lt: ["$singleTxn.txns", noOfTxnInInterval] },
                                "then": 200
                            }],
                            default: 400
                        }

                    },
                    "singleTxn.remainingTime": {
                        $cond: {
                            if: {
                                $and: [{
                                    $lte: [{
                                        $subtract: [txnInterval, "$singleTxn.datediff"]
                                    }, 0]
                                }, { $lte: ["$singleTxn.txns", noOfTxnInInterval] }]
                            }
                            , then: "OK", else: { $floor: { $divide: [{ $subtract: [txnInterval, "$singleTxn.datediff"] }, 60000] } }
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
                    "inAddDay.truID": "$truID",
                    "inAddDay.docVerified": "$docVerified",
                    "inAddDay.totalAmount": { $ifNull: ["$inAddDay.totalAmount", 0] },
                    "inAddDay.withdrawableAmount": { $subtract: ["$clBal", "$inAddDay.totalAmount"] },
                    "inAddDay.remainingTime": {
                        $cond: {
                            if: {
                                $and: [{
                                    $lte: [{
                                        $subtract: [1440, "$inAddDay.datediff"]
                                    }, 0]
                                }]
                            }, then: "OK", else: { $subtract: [1440, "$inAddDay.datediff"] }
                        }
                    },
                    "inAddDay.resStatus": {
                        $cond: {
                            if: {
                                $gte: [{
                                    $subtract: ["$clBal", "$inAddDay.totalAmount"]
                                }, amt]
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
                    },
                }
            }
        ]).exec(function (err, txnValResult) {
            if (err) {
                callback("Something went wrong..!!");
            } else {
                var msg, boolstatus;
                if (txnValResult) {
                    if (txnValResult[0].singleTxn.resStatus == "200"
                        && txnValResult[0].inHour.resStatus == "200"
                        && txnValResult[0].inDay.resStatus == "200"
                        && txnValResult[0].inMonth.resStatus == "200"
                        && txnValResult[0].inAddDay.resStatus == "200"
                        // && txnValResult[0].sellagaistbuyValue.resStatus == "200"
                    ) { boolstatus = true } else {
                        Object.keys(txnValResult[0]).forEach(function (key) {
                            if (txnValResult[0][key].resStatus != "200") {
                                boolstatus = false;
                                switch (key) {
                                    case "singleTxn":
                                        var time = txnValResult[0].singleTxn.remainingTime + 1;
                                        msg = "Please do the next transaction after " + time + " min. This is for your transaction safety."; break;
                                    case "inHour":
                                        msg = "You have exceeds your hourly transaction limit.";
                                        break;
                                    case "inDay":
                                        msg = "You have exceeds your daily transaction limit.";
                                        break;
                                    case "inMonth":
                                        msg = "You have exceeds your monthly transaction limit.";
                                        break;
                                    case "inAddDay":
                                        let rmTime = parseInt(txnValResult[0].inAddDay.remainingTime);
                                        let tm;
                                        if (rmTime < 60) {
                                            tm = rmTime + " minutes";
                                        } else if (rmTime == 60) {
                                            tm = "1 hour";
                                        } else {
                                            let hr = decimalChopper(rmTime / 60);
                                            let min = rmTime % 60;
                                            tm = hr + " hours ";
                                            tm += min + " minutes";
                                        }
                                        msg = "You can withdraw only " + defaultConf.defaultCurrency + " " + decimalChopper(txnValResult[0].inAddDay.withdrawableAmount, 2) + ". After " + tm + " you can withdraw full amount";
                                        break;
                                }
                            }
                        });

                    };
                    if (boolstatus) {
                        var totalamt = amt;
                        var txnAmountLimit;
                        if (txnValResult[0].walletdata) {
                            totalamt = parseFloat(txnValResult[0].walletdata.totalAmount) + amt;
                        }
                        if (limit && limit.walletLimit) {
                            txnAmountLimit = parseFloat(limit.walletLimit);
                        }
                        if (txnAmountLimit >= totalamt) {
                            callback("200");
                        } else {
                            callback("500")
                        }
                    } else {
                        callback(msg);
                    }
                } else {
                    callback("Something went wrong..!!");
                }
            }
        })
    },

    checkaddtoWalletLimit: function (truid, amt, limit, maxAmtOfTxnInDay, maxAmtOfTxnInMonth, maxAmtOfTxnInHour, txnInterval, noOfTxnInInterval, callback) {
        let monthvar = new Date().getMonth() + 1;
        let yearvar = new Date().getFullYear();
        let dayvar = new Date().getDate();
        // let lastInterval = new Date(ISODate().getTime() - 1000 * (txnInterval / 1000));
        let lastInterval = new Date(Date.now() - (1000 * parseFloat(txnInterval)));
        var maxAmtOfTxnInDayNew = useToFixed(parseFloat(maxAmtOfTxnInDay) - parseFloat(amt));
        var maxAmtOfTxnInMonthNew = useToFixed(parseFloat(maxAmtOfTxnInMonth) - parseFloat(amt));
        var maxAmtOfTxnInHourNew = useToFixed(parseFloat(maxAmtOfTxnInHour) - parseFloat(amt));
        txnInterval = txnInterval * 1000;
        noOfTxnInInterval = parseFloat(noOfTxnInInterval);

        KycAll.aggregate([
            { $match: { truID: truid } },
            { $project: { _id: 0, truID: 1, docVerified: 1 } },
            {
                $lookup: {
                    from: "walletlogs",
                    localField: "truID",
                    foreignField: "truID",
                    as: "walletdata"
                }
            },
            { $unwind: { path: "$walletdata", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 0, truID: 1, docVerified: 1,
                    "walletdata.moneyAdded": "$walletdata.moneyAdded",
                    "walletdata.createDate": "$walletdata.createDate",
                    "walletdata.truID": "$walletdata.truID",
                    "walletdata.Cr": "$walletdata.Cr",
                    "walletdata.Dr": "$walletdata.Dr",
                    "walletdata.invoice": "$walletdata.invoice",
                    "walletdata.tType": "$walletdata.tType",                    
                    "walletdata.status": "$walletdata.status",
                    "walletdata.particulars": "$walletdata.particulars",
                    "walletdata.month": { "$month": "$walletdata.createDate" },
                    "walletdata.year": { "$year": "$walletdata.createDate" },
                    "walletdata.day": { "$dayOfMonth": "$walletdata.createDate" },

                }
            },
            {
                $group: {
                    _id: "$truID",
                    walletdata: {
                        $push: {
                            moneyAdded: "$walletdata.moneyAdded",
                            createDate: "$walletdata.createDate",
                            truID: "$walletdata.truID",
                            Cr: "$walletdata.Cr",
                            Dr: "$walletdata.Dr",
                            invoice: "$walletdata.invoice",
                            tType: "$walletdata.tType",
                            status: "$walletdata.status",
                            particulars: "$walletdata.particulars",
                            month: "$walletdata.month",
                            year: "$walletdata.year",
                            day: "$walletdata.day",

                        }
                    },
                    truID: { $first: "$truID" },
                    docVerified: { $last: "$docVerified" }
                },
            },
            {
                $project: {
                    _id: 0, truID: 1, docVerified: 1,
                    walletdata: {
                        $filter: {
                            input: "$walletdata",
                            as: "item",
                            cond: {
                                $and:
                                    [
                                        { $in: ["$$item.tType", ["addMoney", "redeemCash", "buyCash", "transfer", "walletToBank"]] },
                                    ]
                            }

                        }
                    },
                    singleTxn: {
                        $filter: {
                            input: "$walletdata",
                            as: "item",
                            cond: {
                                $and: [{ $eq: ["$$item.tType", "addMoney"] }, { $eq: ["$$item.status", "success"] }, { $gt: ["$$item.createDate", lastInterval] }]
                            }

                        }
                    },
                    inMonth: {
                        $filter: {
                            input: "$walletdata",
                            as: "item",
                            cond: {
                                $and: [{ $eq: ["$$item.tType", "addMoney"] }, { $eq: ["$$item.year", yearvar] }, { $eq: ["$$item.status", "success"] }, { $eq: ["$$item.month", monthvar] }]
                            }
                        }
                    },
                    inDay: {
                        $filter: {
                            input: "$walletdata",
                            as: "item",
                            cond: {
                                $and: [{ $eq: ["$$item.tType", "addMoney"] }, { $eq: ["$$item.year", yearvar] }, { $eq: ["$$item.status", "success"] }, { $eq: ["$$item.month", monthvar] }, { $eq: ["$$item.day", dayvar] }]
                            }

                        }
                    },
                    inHour: {
                        $filter: {
                            input: "$walletdata",
                            as: "item",
                            cond: {
                                $and: [{ $eq: ["$$item.tType", "addMoney"] }, { $eq: ["$$item.status", "success"] }, { $gt: ["$$item.createDate", new Date(new Date().getTime() - 1000 * 60 * 60)] }]
                            }

                        }
                    }

                }
            },
            {
                "$group": {
                    "_id": "$Id",
                    "walletdata": {
                        $push: {
                            "totalAmount": {
                                $add: [{
                                    $sum: {
                                        $sum: "$walletdata.Cr"
                                    }
                                }, {
                                    $sum: {
                                        $sum: "$walletdata.Dr"
                                    }
                                }]
                            },
                        }
                    },

                    "singleTxn": {
                        $push: {
                            totalAmount: {
                                $add: [{
                                    $sum: {
                                        $sum: "$singleTxn.Cr"
                                    }
                                }, {
                                    $sum: {
                                        $sum: "$singleTxn.Dr"
                                    }
                                }]
                            }, lastSalesDate: { "$arrayElemAt": ["$singleTxn.createDate", 0] },
                            datediff: { $ifNull: [{ $subtract: [new Date(), { "$arrayElemAt": ["$singleTxn.createDate", 0] }] }, txnInterval] },
                            txns: {
                                $ifNull: [{ $size: "$singleTxn" }, 0]
                            },
                            type: { "$arrayElemAt": ["$singleTxn.type", 0] }
                        }
                    },


                    "inMonth": {
                        $push: {
                            totalAmount: {
                                $add: [{
                                    $sum: {
                                        $sum: "$inMonth.Cr"
                                    }
                                }, {
                                    $sum: {
                                        $sum: "$inMonth.Dr"
                                    }
                                }]
                            }, lastSalesDate: { "$arrayElemAt": ["$inMonth.createDate", 0] },
                            type: { "$arrayElemAt": ["$inMonth.type", 0] }
                        }
                    },
                    "inDay": {
                        $push: {
                            totalAmount: {
                                $add: [{
                                    $sum: {
                                        $sum: "$inDay.Cr"
                                    }
                                }, {
                                    $sum: {
                                        $sum: "$inDay.Dr"
                                    }
                                }]
                            }, lastSalesDate: { "$arrayElemAt": ["$inDay.createDate", 0] },
                            type: { "$arrayElemAt": ["$inDay.type", 0] }
                        }
                    },
                    "inHour": {
                        $push: {
                            totalAmount: {
                                $add: [{
                                    $sum: {
                                        $sum: "$inHour.Cr"
                                    }
                                }, {
                                    $sum: {
                                        $sum: "$inHour.Dr"
                                    }
                                }]
                            }, lastSalesDate: { "$arrayElemAt": ["$inHour.createDate", 0] },
                            type: { "$arrayElemAt": ["$inHour.type", 0] }
                        }
                    },
                    "truID": { $first: "$truID" },
                    "docVerified": { $first: "$docVerified" },


                }
            },
            { $unwind: { path: "$walletdata", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$singleTxn", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$inMonth", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$inDay", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$inHour", preserveNullAndEmptyArrays: true } },

            {
                $project: {

                    _id: 0,

                    "walletdata.truID": "$truID",
                    "walletdata.docVerified": "$docVerified",
                    "walletdata.totalAmount": { $ifNull: ["$walletdata.totalAmount", 0] },


                    "singleTxn.truID": "$truID",
                    "singleTxn.docVerified": "$docVerified",
                    "singleTxn.totalAmount": { $ifNull: ["$singleTxn.totalAmount", 0] },
                    "singleTxn.resStatus": {
                        $switch: {
                            branches: [{
                                case: { $gte: ["$singleTxn.datediff", txnInterval] },
                                "then": 200
                            }, {
                                case: { $lt: ["$singleTxn.txns", noOfTxnInInterval] },
                                "then": 200
                            }],
                            default: 400
                        }

                    },
                    "singleTxn.remainingTime": {
                        $cond: {
                            if: {
                                $and: [{
                                    $lte: [{
                                        $subtract: [txnInterval, "$singleTxn.datediff"]
                                    }, 0]
                                }, { $lte: ["$singleTxn.txns", noOfTxnInInterval] }]
                            }
                            , then: "OK", else: { $floor: { $divide: [{ $subtract: [txnInterval, "$singleTxn.datediff"] }, 60000] } }
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
                    },
                }
            }]).exec(function (err, txnValResult) {
                if (err) {
                    callback("Something went wrong..!!");
                } else {
                    var msg, boolstatus;
                    if (txnValResult) {
                        if (txnValResult[0].singleTxn.resStatus == "200"
                            && txnValResult[0].inHour.resStatus == "200"
                            && txnValResult[0].inDay.resStatus == "200"
                            && txnValResult[0].inMonth.resStatus == "200"
                            && txnValResult[0].inDay.resStatus == "200"
                            // && txnValResult[0].sellagaistbuyValue.resStatus == "200"
                        ) { boolstatus = true } else {
                            Object.keys(txnValResult[0]).forEach(function (key) {
                                if (txnValResult[0][key].resStatus != "200") {
                                    boolstatus = false;
                                    switch (key) {
                                        case "singleTxn":
                                            var time = txnValResult[0].singleTxn.remainingTime + 1;
                                            msg = "Please do the next transaction after " + time + " min. This is for your transaction safety."; break;
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
                            var totalamt = amt;
                            
                            var txnAmountLimit = 0;
                            if (txnValResult[0].walletdata) {
                                totalamt = parseFloat(txnValResult[0].walletdata.totalAmount) + amt;
                            }
                            if (limit && limit.walletLimit) {
                                txnAmountLimit = parseFloat(limit.walletLimit);
                            }
                            if (txnAmountLimit >= totalamt) {
                                callback("200");
                            } else {
                                callback("500")
                            }
                        } else {
                            callback(msg);
                        }
                    } else {
                        callback("Something went wrong..!!");
                    }
                }
            })        
    },

    checkredeemtobankLimit: function (truid, amt, limit, callback) {
        var dbTxnLimit = limit * 1000
        let monthvar = (new Date()).getMonth() + 1;
        let yearvar = (new Date()).getFullYear();
        KycAll.aggregate([
            { $match: { truID: truid } },
            { $project: { _id: 0, truID: 1, docVerified: 1 } },
            {
                $lookup: {
                    from: "banklogs",
                    let: { truid: "$truID" },
                    pipeline: [
                        {
                            $match:
                            {
                                $expr:
                                {
                                    $and:
                                        [{ $eq: ["$truID", "$$truid"] },
                                        { $eq: ["$tType", "redeemCash"] },
                                        { $or: [{ $eq: ["$Status", "Initiated"] }, { $eq: ["$Status", "Success"] }, { $eq: ["$Status", "ON HOLD"] }] }
                                        ]
                                }
                            }
                        },
                        { "$sort": { "date": -1 } },
                        { $project: { _id: 0, createDate: 1, amt: { $toDouble: "$Amount" }, month: { "$month": "$createDate" }, year: { "$year": "$createDate" } } },
                        { $match: { year: yearvar, month: monthvar } },
                        {
                            $group: {
                                _id: null,
                                lastSalesDate: { $last: "$createDate" },
                                totalAmount: { $sum: "$amt" }
                            }
                        }
                    ],
                    as: "walletdata"
                }
            },
            { $unwind: { path: "$walletdata", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    truID: 1, docVerified: 1, totalAmount: { $ifNull: ["$walletdata.totalAmount", 0] },
                    datediff: { $ifNull: [{ $subtract: [new Date(), "$walletdata.lastSalesDate"] }, dbTxnLimit] }
                }
            },
            {
                $project: {
                    truID: 1, docVerified: 1, totalAmount: 1,
                    resStatus: { $cond: { if: { $gte: ["$datediff", dbTxnLimit] }, then: "200", else: "400" } },
                    remainingTime: {
                        $cond: {
                            if: { $lte: [{ $subtract: [dbTxnLimit, "$datediff"] }, 0] }, then: "OK",
                            else: { $floor: { $divide: [{ $subtract: [dbTxnLimit, "$datediff"] }, 60000] } }
                        }
                    }
                }
            }
        ]).exec(function (err, docs) {
            if (!docs.length) {
                // res.json({status:"204",message:"User does not exists!!"})
                callback("204");
            } else {
                if (docs[0].resStatus === "200" && docs[0].remainingTime === "OK") {
                    var docverify = docs[0].docVerified,
                        totalamt = amt;
                    if (docs[0].totalAmount > 0) {
                        totalamt = parseFloat(docs[0].totalAmount) + amt;
                    }
                    var kycflag = "nonKYC";
                    if (docverify === true) {
                        kycflag = "KYC";
                    }

                    readFromDB(docverify, totalamt, kycflag);

                    function readFromDB(docverify, totalamt, kycflag) {
                        try {
                            request.post({
                                "headers": {
                                    "content-type": "application/json"
                                },
                                "url": reqip + ":4125/api/showconsumerconfigurations",
                                "body": JSON.stringify({
                                    "kycflag": kycflag,
                                    "appliedOn": "consumer"
                                })
                            }, (error, response, body) => {
                                if (error) {
                                    // callback({status:"204",messege : "Something went wrong!"})
                                    callback("205")
                                }
                                else {
                                    if (response.statusCode == 200) {
                                        var result = JSON.parse(body);
                                        if (result.status == 200) {
                                            if (result.resource) {
                                                var txnAmountLimit = 0;
                                                if (result[0] && result[0].txnAmountLimit) {
                                                    txnAmountLimit = result.resource.limit.txnamountlimit;
                                                    // remnantAmount = result[0].TXN.remnantAmount.toJSON().$numberDecimal;
                                                    // checklimit = consumerconfig[0].TXN.checklimit;
                                                }
                                                if (docverify === "false") {
                                                    if (txnAmountLimit >= totalamt) {
                                                        callback("200");
                                                    } else {
                                                        callback("500")
                                                    }
                                                } else {
                                                    callback("200");
                                                }


                                            } else {

                                            }
                                        } else {
                                            callback("206");
                                        }
                                    } else {
                                        callback("206");
                                    }

                                }
                            })
                        }
                        catch (ex) {
                            // callback({status:"204",messege : "Something went wrong!"})
                            callback("204");
                        }
                    }
                } else {
                    callback("400", docs[0].remainingTime);
                }
            }
        }
        )
    },
}