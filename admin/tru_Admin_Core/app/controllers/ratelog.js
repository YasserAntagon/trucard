
'use strict'

var request = require('request'),
    Stock = require('../models/assetmanagerModel/assetmanagerStockModel'),
    conf = require("../config"),
    RateLog = require('../models/assetmanagerModel/assetmanagerRateLogModel'),
    KycAll = require('../models/assetmanagerModel/assetmanagerKYCAllModel'),
    custKycAll = require('../models/custModel/custKYCAllModel'),
    custStock = require('../models/custModel/custStockModel'),
    entityStock = require('../models/entityModel/remmitStockModel'),
    ChargesModel = require('../models/entityModel/chargesModel'),
    remmitKycAll = require('../models/entityModel/remmitKYCAllModel'),
    custTxnStockLog = require('../models/custModel/custTxnStockLogModel'),
    { calculateRate } = require('./extra/calculateRate');
var reqip = conf.reqip,
    fs = require('fs'),
    path = require('path');
let defaultConf = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../regionConf.json')));
exports.test = function (req, res) {
    res.json({ message: "Welcome to Company assetmanager Api" });
};

exports.update_g24_rate_all_node = function (req, res) {
    var truid = req.body.truid;
    var g24 = parseFloat(req.body.g24);
    let Gen = req.generalCharges;
    var assetmanagersCharges = useToFixed(g24 * Gen.assetmanagercharges);
    var assetstoreCharges = useToFixed(g24 * Gen.assetstoreCharges);
    var transactionFees = useToFixed(useToFixed(g24 + assetmanagersCharges + assetstoreCharges) * (Gen.transactionCharges + Gen.txnLoading));
    var othercharges = useToFixed(transactionFees + assetstoreCharges);
    var netAmount = useToFixed(g24 + assetmanagersCharges + othercharges);

    var createdate = new Date();
    var query = { truID: truid };

    KycAll.find({ "truID": truid, parentTruID: truid, __t: "KycAll", isParent: true }, function (err, docs) {
        if (!docs.length) {
            res.json({
                status: "204",
                message: "The request was successful but no body was returned."
            });
        } else {

            if (isNaN(g24) || g24 === undefined || g24 === null) {
                res.json({
                    status: "204",
                    message: 'The request was successful Enter valid g24k Rate'
                });
            }

            else {
                request.post({
                    "headers": { "content-type": "application/json" },
                    "url": reqip + ":4125/api/listadminwiseassetmanagerarray",
                    "body": JSON.stringify({ "truid": truid })
                }, (error, response, body) => {
                    if (error) {
                        return console.dir(error);
                    }
                    var newjson = JSON.parse(body);
                    var assetmanagers = newjson.assetmanager;

                    Stock.updateMany({ truID: { $in: assetmanagers } }, {
                        $set: {
                            "G24K.grossAmount": g24, "G24K.assetmanagersCharges": assetmanagersCharges,
                            "G24K.transactionFees": othercharges, "G24K.netAmount": netAmount
                        }
                    }, { upsert: true, multi: true }, ins_log)

                    function ins_log(err, numAffected) {
                        if (err) {
                            res.send(err);
                        }
                        var respresult = RateLog.findOneAndUpdate({ truID: truid }, {
                            $addToSet: {
                                "G24K_log": {
                                    rate: g24,
                                    dateChanged: createdate,
                                    grossAmount: g24,
                                    assetmanagersCharges: assetmanagersCharges,
                                    transactionFees: transactionFees,
                                    assetmanagersChargesPer: Gen.assetmanagercharges,
                                    transactionFeesPer: Gen.transactionCharges,
                                    assetstoreCharge: assetstoreCharges,
                                    assetstoreChargePer: Gen.assetstoreCharges,
                                    netAmount: netAmount
                                }
                            }
                        }, { upsert: true }, callback);
                    }
                    function callback(err, numAffected) {
                        if (err) {
                            res.status(500).send({ error: err });
                        }
                        else {
                            Stock.aggregate([{ "$match": { truID: truid } },
                            { "$project": { _id: 0, G24K: 1 } }
                            ]).exec(function (err, result) {
                                if (err) {
                                    res.status(500).send({ error: err })
                                    return next(err);
                                }
                                else {
                                    var resource = result[0];
                                    var assetmanagersCharges = resource.G24K.assetmanagersCharges.toJSON().$numberDecimal;
                                    var grossAmount = resource.G24K.grossAmount.toJSON().$numberDecimal;
                                    var netAmount = resource.G24K.netAmount.toJSON().$numberDecimal;
                                    var transactionFees = resource.G24K.transactionFees.toJSON().$numberDecimal;

                                    var final = ({ grossAmount: grossAmount, assetmanagersCharges: assetmanagersCharges, transactionFees: transactionFees, netAmount: netAmount })
                                    res.json({ status: "200", G24K: final });

                                    var dates = new Date().toLocaleString();
                                    for (var i = 0; i < assetmanagers.length; i++) {
                                        if (assetmanagers[i] != truid) {
                                            var childtruid = assetmanagers[i]
                                            notification();

                                            function notification(err, numAffected) {
                                                request.post({
                                                    "headers": { "content-type": "application/json" },
                                                    "url": reqip + ":4116/api/insnotification",
                                                    "body": JSON.stringify({
                                                        "notifyto": childtruid,
                                                        "triggeredbytruid": truid,
                                                        "notification": "assetmanager to Customer Rate for g24k : " + g24 + " is now changed from your admin assetmanager on " + dates + ".",
                                                        "type": "rate",
                                                        "subtype": "customerRate"
                                                    })
                                                }, (error, response, body) => {

                                                    if (error) {
                                                        return console.dir(error);
                                                    }
                                                }
                                                )
                                            }
                                        }
                                    }
                                }
                            }
                            )
                        }
                    }
                }
                )
            }
        }
    }
    )
}



exports.update_s99_rate_all_node = function (req, res) {
    var stock = new Stock(req.user);
    var truid = req.body.truid;
    let Gen = req.generalCharges;
    var s99 = parseFloat(req.body.s99)

    var assetmanagersCharges = useToFixed(s99 * Gen.assetmanagercharges);
    var assetstoreCharges = useToFixed(s99 * Gen.assetstoreCharges);
    var transactionFees = useToFixed((s99 + assetmanagersCharges + assetstoreCharges) * (Gen.transactionCharges + Gen.txnLoading));
    var othercharges = useToFixed(transactionFees + assetstoreCharges);
    var netAmount = useToFixed(s99 + assetmanagersCharges + othercharges);

    var createdate = new Date();

    KycAll.find({ "truID": truid, parentTruID: truid, __t: "KycAll", isParent: true }, function (err, docs) {
        if (!docs.length) {
            res.json({
                status: "204",
                message: "The request was successful but no body was returned."
            });
        } else {

            if (isNaN(s99) || s99 === undefined || s99 === null) {
                res.json({
                    status: "204",
                    message: 'The request was successful Enter valid 99 silver Rate'
                });
            }

            else {
                request.post({
                    "headers": { "content-type": "application/json" },
                    "url": reqip + ":4125/api/listadminwiseassetmanagerarray",
                    "body": JSON.stringify({ "truid": truid })
                }, (error, response, body) => {
                    if (error) {
                        return console.dir(error);
                    }
                    var newjson = JSON.parse(body);
                    var assetmanagers = newjson.assetmanager;


                    Stock.updateMany({ truID: { $in: assetmanagers } }, {
                        $set: {
                            "S99P.grossAmount": s99, "S99P.assetmanagersCharges": assetmanagersCharges,
                            "S99P.transactionFees": othercharges, "S99P.netAmount": netAmount
                        }
                    }, { upsert: true, multi: true }, ins_log)


                    function ins_log(err, numAffected) {
                        if (err) {
                            res.send(err);
                        }
                        RateLog.findOneAndUpdate({ truID: truid }, {
                            $addToSet: {
                                "S99P_log": {
                                    rate: s99,
                                    dateChanged: createdate,
                                    grossAmount: s99,
                                    assetmanagersCharges: assetmanagersCharges,
                                    transactionFees: transactionFees,
                                    assetmanagersChargesPer: Gen.assetmanagercharges,
                                    transactionFeesPer: Gen.transactionCharges,
                                    assetstoreCharge: assetstoreCharges,
                                    assetstoreChargePer: Gen.assetstoreCharges,
                                    netAmount: netAmount
                                }
                            }
                        }, { upsert: true }, callback)
                    }

                    function callback(err, numAffected) {
                        if (err)
                            res.send(err);

                        Stock.aggregate([{ "$match": { truID: truid } },
                        { "$project": { _id: 0, S99P: 1 } }
                        ]).exec(function (err, result) {
                            if (err) {
                                response.status(500).send({ error: err })
                                return next(err);
                            }
                            else {
                                var resource = result[0];
                                var assetmanagersCharges = resource.S99P.assetmanagersCharges.toJSON().$numberDecimal;
                                var grossAmount = resource.S99P.grossAmount.toJSON().$numberDecimal;
                                var netAmount = resource.S99P.netAmount.toJSON().$numberDecimal;
                                var transactionFees = resource.S99P.transactionFees.toJSON().$numberDecimal;

                                var final = ({
                                    grossAmount: grossAmount, assetmanagersCharges: assetmanagersCharges,
                                    transactionFees: transactionFees, netAmount: netAmount
                                })

                                res.json({ status: "200", S99P: final });

                                var dates = new Date().toLocaleString();
                                for (var i = 0; i < assetmanagers.length; i++) {
                                    if (assetmanagers[i] != truid) {
                                        var childtruid = assetmanagers[i]
                                        notification();

                                        function notification(err, numAffected) {
                                            request.post({
                                                "headers": { "content-type": "application/json" },
                                                "url": reqip + ":4116/api/insnotification",
                                                "body": JSON.stringify({
                                                    "notifyto": childtruid,
                                                    "triggeredbytruid": truid,
                                                    "notification": "assetmanager to Customer Rate for S99P : " + s99 + " is now changed from your admin assetmanager on " + dates + ".",
                                                    "type": "rate",
                                                    "subtype": "customerRate"
                                                })
                                            }, (error, response, body) => {

                                                if (error) {
                                                    return console.dir(error);
                                                }
                                            }
                                            )
                                        }
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
    }
    )
}



exports.update_assetmanager_g24_rate_all_node = function (req, res) {
    var truid = req.body.truid;
    let Gen = req.generalCharges;
    var g24 = parseFloat(req.body.g24);
    var assetmanagersCharges = (g24 * Gen.assetmanagercharges);
    var transactionFees = (g24 * Gen.transactionCharges);
    var assetstoreCharges = (g24 * Gen.assetstoreCharges);
    var othercharges = (transactionFees + assetstoreCharges);
    var netAmount = (g24 + assetmanagersCharges + othercharges);
    var createdate = new Date();
    var query = { truID: truid };
    KycAll.find({ "truID": truid, parentTruID: truid, __t: "KycAll", isParent: true }, function (err, docs) {
        if (!docs.length) {
            res.json({
                status: "204",
                message: "The request was successful but no body was returned."
            });
        } else {

            if (isNaN(g24) || g24 === undefined || g24 === null) {
                res.json({
                    status: "204",
                    message: 'The request was successful Enter valid g24k Rate'
                });
            }
            else {
                request.post({
                    "headers": { "content-type": "application/json" },
                    "url": reqip + ":4125/api/listadminwiseassetmanagerarray",
                    "body": JSON.stringify({ "truid": truid })
                }, (error, response, body) => {
                    if (error) {
                        return console.dir(error);
                    }
                    var newjson = JSON.parse(body);
                    var assetmanagers = newjson.assetmanager;

                    Stock.update({ truID: { $in: assetmanagers } }, {
                        $set: {
                            "assetmanagerG24KRate.grossAmount": g24, "assetmanagerG24KRate.assetmanagersCharges": assetmanagersCharges,
                            "assetmanagerG24KRate.transactionFees": othercharges, "assetmanagerG24KRate.netAmount": netAmount
                        }
                    }, { multi: true }, ins_log)

                    function ins_log(err, numAffected) {
                        if (err) {
                            res.send(err);
                        }
                        var query = { truID: truid };
                        RateLog.findOneAndUpdate(query, {
                            $addToSet: {
                                "assetmanager_G24K_log": {
                                    rate: g24,
                                    dateChanged: createdate,
                                    grossAmount: g24,
                                    assetmanagersCharges: assetmanagersCharges,
                                    transactionFees: transactionFees,
                                    assetmanagersChargesPer: Gen.assetmanagercharges,
                                    transactionFeesPer: Gen.transactionCharges,
                                    assetstoreCharge: assetstoreCharges,
                                    assetstoreChargePer: Gen.assetstoreCharges,
                                    netAmount: netAmount
                                }
                            }
                        }, { upsert: true }, callback)
                    }

                    function callback(err, numAffected) {
                        if (err)
                            res.send(err);

                        Stock.aggregate([{ "$match": { truID: truid } }, { "$project": { _id: 0, assetmanagerG24KRate: 1 } }
                        ]).exec(function (err, result) {
                            if (err) {
                                response.status(500).send({ error: err })
                                return next(err);
                            }
                            else {
                                var resource = result[0];
                                var assetmanagersCharges = resource.assetmanagerG24KRate.assetmanagersCharges.toJSON().$numberDecimal;
                                var grossAmount = resource.assetmanagerG24KRate.grossAmount.toJSON().$numberDecimal;
                                var netAmount = resource.assetmanagerG24KRate.netAmount.toJSON().$numberDecimal;
                                var transactionFees = resource.assetmanagerG24KRate.transactionFees.toJSON().$numberDecimal;

                                var final = ({
                                    grossAmount: grossAmount, assetmanagersCharges: assetmanagersCharges,
                                    transactionFees: transactionFees, netAmount: netAmount
                                })

                                res.json({ status: "200", assetmanagerG24KRate: final });

                                var dates = new Date().toLocaleString();
                                for (var i = 0; i < assetmanagers.length; i++) {
                                    if (assetmanagers[i] != truid) {
                                        var childtruid = assetmanagers[i]
                                        notification();

                                        function notification(err, numAffected) {
                                            request.post({
                                                "headers": { "content-type": "application/json" },
                                                "url": reqip + ":4116/api/insnotification",
                                                "body": JSON.stringify({
                                                    "notifyto": childtruid,
                                                    "triggeredbytruid": truid,
                                                    "notification": "assetmanager to assetmanager Rate for G24K : " + g24 + " is now changed from your admin assetmanager on " + dates + ".",
                                                    "type": "rate",
                                                    "subtype": "assetmanagerRate"
                                                })
                                            }, (error, response, body) => {

                                                if (error) {
                                                    return console.dir(error);
                                                }

                                            }
                                            )
                                        }
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
    }
    )
}




exports.update_assetmanager_s99_rate_all_node = function (req, res) {
    var stock = new Stock(req.user);
    var truid = req.body.truid;
    let Gen = req.generalCharges;
    var s99 = parseFloat(req.body.s99);

    var assetmanagersCharges = useToFixed(s99 * Gen.assetmanagercharges);
    var transactionFees = useToFixed(s99 * Gen.transactionCharges);
    var assetstoreCharges = useToFixed(s99 * Gen.assetstoreCharges);
    var othercharges = useToFixed(transactionFees + assetstoreCharges);
    var netAmount = useToFixed(s99 + assetmanagersCharges + othercharges);

    var createdate = new Date();
    var query = { truID: truid };

    KycAll.find({ "truID": truid, parentTruID: truid, __t: "KycAll", isParent: true }, function (err, docs) {
        if (!docs.length) {
            res.json({
                status: "204",
                message: "The request was successful but no body was returned."
            });
        } else {

            if (isNaN(s99) || s99 === undefined || s99 === null) {
                res.json({
                    status: "204",
                    message: 'The request was successful Enter valid s99k Rate'
                });
            }
            else {
                request.post({
                    "headers": { "content-type": "application/json" },
                    "url": reqip + ":4125/api/listadminwiseassetmanagerarray",
                    "body": JSON.stringify({ "truid": truid })
                }, (error, response, body) => {
                    if (error) {
                        return console.dir(error);
                    }
                    var newjson = JSON.parse(body);
                    var assetmanagers = newjson.assetmanager;

                    Stock.update({ truID: { $in: assetmanagers } }, {
                        $set: {
                            "assetmanagerS99PRate.grossAmount": s99, "assetmanagerS99PRate.assetmanagersCharges": assetmanagersCharges,
                            "assetmanagerS99PRate.transactionFees": othercharges, "assetmanagerS99PRate.netAmount": netAmount
                        }
                    }, { multi: true }, ins_log)

                    function ins_log(err, numAffected) {
                        if (err) {
                            res.send(err);
                        }
                        var query = { truID: truid };
                        var respresult = RateLog.findOneAndUpdate(query, {
                            $addToSet: {
                                "assetmanager_S99P_log": {
                                    rate: s99,
                                    dateChanged: createdate,
                                    grossAmount: s99,
                                    assetmanagersCharges: assetmanagersCharges,
                                    transactionFees: transactionFees,
                                    assetmanagersChargesPer: Gen.assetmanagercharges,
                                    transactionFeesPer: Gen.transactionCharges,
                                    assetstoreCharge: assetstoreCharges,
                                    assetstoreChargePer: Gen.assetstoreCharges,
                                    netAmount: netAmount
                                }
                            }
                        }, { upsert: true }, callback)
                    }

                    function callback(err, numAffected) {
                        if (err)
                            res.send(err);

                        Stock.aggregate([{ "$match": { truID: truid } }, { "$project": { _id: 0, assetmanagerS99PRate: 1 } }
                        ]).exec(function (err, result) {
                            if (err) {
                                response.status(500).send({ error: err })
                                return next(err);
                            }
                            else {
                                var resource = result[0];
                                var assetmanagersCharges = resource.assetmanagerS99PRate.assetmanagersCharges.toJSON().$numberDecimal;
                                var grossAmount = resource.assetmanagerS99PRate.grossAmount.toJSON().$numberDecimal;
                                var netAmount = resource.assetmanagerS99PRate.netAmount.toJSON().$numberDecimal;
                                var transactionFees = resource.assetmanagerS99PRate.transactionFees.toJSON().$numberDecimal;

                                var final = ({
                                    grossAmount: grossAmount, assetmanagersCharges: assetmanagersCharges,
                                    transactionFees: transactionFees, netAmount: netAmount
                                })

                                res.json({ status: "200", assetmanagerS99PRate: final });

                                var dates = new Date().toLocaleString();
                                for (var i = 0; i < assetmanagers.length; i++) {
                                    if (assetmanagers[i] != truid) {
                                        var childtruid = assetmanagers[i]
                                        notification();

                                        function notification(err, numAffected) {
                                            request.post({
                                                "headers": { "content-type": "application/json" },
                                                "url": reqip + ":4116/api/insnotification",
                                                "body": JSON.stringify({
                                                    "notifyto": childtruid,
                                                    "triggeredbytruid": truid,
                                                    "notification": "assetmanager to assetmanager Rate for S99P : " + s99 + " is now changed from your admin assetmanager on " + dates + ".",
                                                    "type": "rate",
                                                    "subtype": "assetmanagerRate"
                                                })
                                            }, (error, response, body) => {

                                                if (error) {
                                                    return console.dir(error);
                                                }
                                            }
                                            )
                                        }
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
    }
    )
}



/*====================================================*/
exports.update_g24_sale_rate_all_node = function (req, res) {
    var truid = req.body.truid;
    let Gen = req.generalCharges;
    var g24 = parseFloat(req.body.g24)
    var createdate = new Date();
    var query = { truID: truid };

    KycAll.find({ "truID": truid, parentTruID: truid, __t: "KycAll", isParent: true }, function (err, docs) {
        if (!docs.length) {
            res.json({
                status: "204",
                message: "The request was successful but no body was returned."
            });
        } else {
            if (isNaN(g24) || g24 === undefined || g24 === null) {
                res.json({
                    status: "204",
                    message: 'The request was successful Enter valid g24k Rate'
                }
                )
            }

            else {
                request.post({
                    "headers": { "content-type": "application/json" },
                    "url": reqip + ":4125/api/listadminwiseassetmanagerarray",
                    "body": JSON.stringify({ "truid": truid })
                }, (error, response, body) => {
                    if (error) {
                        return console.dir(error);
                    }
                    var newjson = JSON.parse(body);
                    var assetmanagers = newjson.assetmanager;

                    var assetmanagerCharges = useToFixed(g24 * Gen.assetmanagercharges);
                    var assetstoreCharges = useToFixed(g24 * Gen.assetstoreCharges);
                    var transactionFees = useToFixed((g24 + assetmanagerCharges + assetstoreCharges) * (Gen.transactionCharges + Gen.txnLoading));
                    var othercharges = useToFixed(transactionFees + assetstoreCharges);

                    //sell rate
                    var netAmount = useToFixed((g24 + assetmanagerCharges + assetstoreCharges) - transactionFees);

                    // sp rate
                    var netAmountCoin = useToFixed(g24 - othercharges);

                    // apply sp charges
                    var assetmanagerCoinCharges = useToFixed(netAmountCoin * Gen.assetmanagercharges_rgcoin);

                    Stock.updateMany({ truID: { $in: assetmanagers } },
                        {
                            $set: {
                                "G24KSale.grossAmount": g24, "G24KSale.assetmanagersCharges": assetmanagerCharges, "G24KSale.coinCharges": assetmanagerCoinCharges,
                                "G24KSale.transactionFees": othercharges, "G24KSale.netAmount": netAmount, "G24KSale.netAmountCoin": netAmountCoin
                            }
                        }, { upsert: true, multi: true }, ins_log)

                    function ins_log(err, numAffected) {
                        if (err) {
                            res.send(err);
                        }
                        var respresult = RateLog.findOneAndUpdate({ truID: truid }, {
                            $addToSet: {
                                "G24KSale_log": {
                                    rate: g24,
                                    dateChanged: createdate,
                                    grossAmount: g24,
                                    assetmanagersCharges: assetmanagerCharges,
                                    transactionFees: transactionFees,
                                    assetmanagersChargesPer: Gen.assetmanagercharges,
                                    transactionFeesPer: Gen.transactionCharges,
                                    assetstoreCharge: assetstoreCharges,
                                    assetstoreChargePer: Gen.assetstoreCharges,
                                    netAmount: netAmount,
                                    assetmanagerCoinCharges: assetmanagerCoinCharges,
                                    assetmanagerCoinChargesPer: Gen.assetmanagercharges_rgcoin,
                                    netAmountCoin: netAmountCoin
                                }
                            }
                        }, { upsert: true }, callback)
                    }

                    function callback(err, numAffected) {
                        if (err)
                            res.send(err);

                        Stock.aggregate([{ "$match": { truID: truid } }, { "$project": { _id: 0, G24KSale: 1 } }
                        ]).exec(function (err, result) {
                            if (err) {
                                response.status(500).send({ error: err })
                                return next(err);
                            }
                            else {
                                var resource = result[0];
                                var transactionFees = resource.G24KSale.transactionFees.toJSON().$numberDecimal;
                                var assetmanagersCharges = resource.G24KSale.assetmanagersCharges.toJSON().$numberDecimal;
                                var coinCharges = resource.G24KSale.coinCharges.toJSON().$numberDecimal;
                                var grossAmount = resource.G24KSale.grossAmount.toJSON().$numberDecimal;
                                var netAmount = resource.G24KSale.netAmount.toJSON().$numberDecimal;
                                var netAmountCoin = resource.G24KSale.netAmountCoin.toJSON().$numberDecimal;

                                var final = ({
                                    grossAmount: grossAmount, transactionFees: transactionFees, assetmanagersCharges: assetmanagersCharges, coinCharges: coinCharges,
                                    netAmount: netAmount, netAmountCoin: netAmountCoin
                                })

                                res.json({ status: "200", G24K: final });

                                var dates = new Date().toLocaleString();
                                for (var i = 0; i < assetmanagers.length; i++) {
                                    if (assetmanagers[i] != truid) {
                                        var childtruid = assetmanagers[i]
                                        notification();

                                        function notification(err, numAffected) {
                                            request.post({
                                                "headers": { "content-type": "application/json" },
                                                "url": reqip + ":4116/api/insnotification",
                                                "body": JSON.stringify({
                                                    "notifyto": childtruid,
                                                    "triggeredbytruid": truid,
                                                    "notification": "assetmanager to Customer Sale Rate for G24K : " + g24 + " is now changed from your admin assetmanager on " + dates + ".",
                                                    "type": "rate",
                                                    "subtype": "customerSRate"
                                                })
                                            }, (error, response, body) => {

                                                if (error) {
                                                    return console.dir(error);
                                                }
                                            }
                                            )
                                        }
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
    }
    )
}


exports.update_s99_sale_rate_all_node = function (req, res) {
    var stock = new Stock(req.user);
    let Gen = req.generalCharges;
    var truid = req.body.truid;
    var s99 = parseFloat(req.body.s99)
    var createdate = new Date();
    var query = { truID: truid };


    KycAll.find({ "truID": truid, parentTruID: truid, __t: "KycAll", isParent: true }, function (err, docs) {
        if (!docs.length) {
            res.json({
                status: "204",
                message: "The request was successful but no body was returned."
            });
        } else {
            if (isNaN(s99) || s99 === undefined || s99 === null) {
                res.json({
                    status: "204",
                    message: 'The request was successful Enter valid 99% Silver Rate'
                });
            }
            else {
                request.post({
                    "headers": { "content-type": "application/json" },
                    "url": reqip + ":4125/api/listadminwiseassetmanagerarray",
                    "body": JSON.stringify({ "truid": truid })
                }, (error, response, body) => {
                    if (error) {
                        return console.dir(error);
                    }
                    var newjson = JSON.parse(body);
                    var assetmanagers = newjson.assetmanager;
                    var assetmanagerCharges = useToFixed(s99 * Gen.assetmanagercharges);
                    var assetstoreCharges = useToFixed(s99 * Gen.assetstoreCharges);
                    var transactionFees = useToFixed((s99 + assetmanagerCharges + assetstoreCharges) * (Gen.transactionCharges + Gen.txnLoading));
                    var othercharges = useToFixed(transactionFees + assetstoreCharges);

                    //sell rate
                    var netAmount = useToFixed((s99 + assetmanagerCharges + assetstoreCharges) - transactionFees);

                    var netAmountCoin = useToFixed(s99 - othercharges);

                    var assetmanagerCoinCharges = useToFixed(netAmountCoin * Gen.assetmanagercharges_rgcoin);


                    Stock.updateMany({ truID: { $in: assetmanagers } },
                        {
                            $set: {
                                "S99PSale.grossAmount": s99, "S99PSale.assetmanagersCharges": assetmanagerCharges, "S99PSale.coinCharges": assetmanagerCoinCharges,
                                "S99PSale.transactionFees": othercharges, "S99PSale.netAmount": netAmount, "S99PSale.netAmountCoin": netAmountCoin
                            }
                        }, { upsert: true, multi: true }, ins_log)

                    function ins_log(err, numAffected) {
                        if (err) {
                            res.send(err);
                        }
                        var respresult = RateLog.findOneAndUpdate({ truID: truid }, {
                            $addToSet: {
                                "S99PSale_log": {
                                    rate: s99,
                                    dateChanged: createdate,
                                    grossAmount: s99,
                                    assetmanagersCharges: assetmanagerCharges,
                                    transactionFees: transactionFees,
                                    assetmanagersChargesPer: Gen.assetmanagercharges,
                                    transactionFeesPer: Gen.transactionCharges,
                                    assetstoreCharge: assetstoreCharges,
                                    assetstoreChargePer: Gen.assetstoreCharges,
                                    netAmount: netAmount,
                                    assetmanagerCoinCharges: assetmanagerCoinCharges,
                                    assetmanagerCoinChargesPer: Gen.assetmanagercharges_rgcoin,
                                    netAmountCoin: netAmountCoin
                                }
                            }
                        }, { upsert: true }, callback)
                    }

                    function callback(err, numAffected) {
                        if (err)
                            res.send(err);

                        Stock.aggregate([{ "$match": { truID: truid } },
                        { "$project": { _id: 0, S99PSale: 1 } }
                        ]).exec(function (err, result) {
                            if (err) {
                                response.status(500).send({ error: err })
                                return next(err);
                            }
                            else {
                                var resource = result[0];
                                var transactionFees = resource.S99PSale.transactionFees.toJSON().$numberDecimal;
                                var assetmanagersCharges = resource.S99PSale.assetmanagersCharges.toJSON().$numberDecimal;
                                var coinCharges = resource.S99PSale.coinCharges.toJSON().$numberDecimal;
                                var grossAmount = resource.S99PSale.grossAmount.toJSON().$numberDecimal;
                                var netAmount = resource.S99PSale.netAmount.toJSON().$numberDecimal;
                                var netAmountCoin = resource.S99PSale.netAmountCoin.toJSON().$numberDecimal;

                                var final = ({
                                    grossAmount: grossAmount, transactionFees: transactionFees, assetmanagersCharges: assetmanagersCharges, coinCharges: coinCharges,
                                    netAmount: netAmount, netAmountCoin: netAmountCoin
                                })
                                res.json({ status: "200", S99P: final });

                                var dates = new Date().toLocaleString();
                                for (var i = 0; i < assetmanagers.length; i++) {
                                    if (assetmanagers[i] != truid) {
                                        var childtruid = assetmanagers[i]
                                        notification();

                                        function notification(err, numAffected) {
                                            request.post({
                                                "headers": { "content-type": "application/json" },
                                                "url": reqip + ":4116/api/insnotification",
                                                "body": JSON.stringify({
                                                    "notifyto": childtruid,
                                                    "triggeredbytruid": truid,
                                                    "notification": "Your assetmanager to Customer Sale Rate for S99P : " + s99 + " is now changed from your admin assetmanager on " + dates + ".",
                                                    "type": "rate",
                                                    "subtype": "customerSRate"
                                                })
                                            }, (error, response, body) => {

                                                if (error) {
                                                    return console.dir(error);
                                                }
                                            }
                                            )
                                        }
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
    }
    )
}



exports.update_assetmanager_g24_sale_rate_all_node = function (req, res) {
    var stock = new Stock(req.user);
    var truid = req.body.truid;
    var g24 = parseFloat(req.body.g24);
    var createdate = new Date();
    var query = { truID: truid };
    let Gen = req.generalCharges;

    KycAll.find({ "truID": truid, parentTruID: truid, __t: "KycAll", isParent: true }, function (err, docs) {
        if (!docs.length) {
            res.json({
                status: "204",
                message: "The request was successful but no body was returned."
            });
        } else {

            if (isNaN(g24) || g24 === undefined || g24 === null) {
                res.json({
                    status: "204",
                    message: 'The request was successful Enter valid g24k Rate'
                });
            }
            else {
                request.post({
                    "headers": { "content-type": "application/json" },
                    "url": reqip + ":4125/api/listadminwiseassetmanagerarray",
                    "body": JSON.stringify({ "truid": truid })
                }, (error, response, body) => {
                    if (error) {
                        return console.dir(error);
                    }
                    var newjson = JSON.parse(body);
                    var assetmanagers = newjson.assetmanager;

                    var assetmanagerCharges = useToFixed(g24 * Gen.assetmanagercharges);
                    var transactionFees = useToFixed(g24 * Gen.transactionCharges);
                    var assetstoreCharges = useToFixed(g24 * Gen.assetstoreCharges);
                    var othercharges = useToFixed(transactionFees + assetstoreCharges);

                    //sell rate
                    var netAmount = useToFixed(g24 - (assetmanagerCharges + othercharges));

                    var netAmountCoin = useToFixed(g24 - othercharges);

                    var assetmanagerCoinCharges = useToFixed(netAmountCoin * Gen.assetmanagercharges_rgcoin);



                    Stock.update({ truID: { $in: assetmanagers } },
                        {
                            $set: {
                                "assetmanagerG24KRateSale.grossAmount": g24, "assetmanagerG24KRateSale.assetmanagersCharges": assetmanagerCharges, "assetmanagerG24KRateSale.coinCharges": assetmanagerCoinCharges,
                                "assetmanagerG24KRateSale.transactionFees": othercharges, "assetmanagerG24KRateSale.netAmount": netAmount, "assetmanagerG24KRateSale.netAmountCoin": netAmountCoin
                            }
                        }, { multi: true }, ins_log)

                    function ins_log(err, numAffected) {
                        if (err) {
                            res.send(err);
                        }
                        var query = { truID: truid };
                        var respresult = RateLog.findOneAndUpdate(query, {
                            $addToSet: {
                                "assetmanager_G24KSale_log": {
                                    rate: g24,
                                    dateChanged: createdate,
                                    grossAmount: g24,
                                    assetmanagersCharges: assetmanagerCharges,
                                    transactionFees: transactionFees,
                                    assetmanagersChargesPer: Gen.assetmanagercharges,
                                    transactionFeesPer: Gen.transactionCharges,
                                    assetstoreCharge: assetstoreCharges,
                                    assetstoreChargePer: Gen.assetstoreCharges,
                                    netAmount: netAmount,
                                    assetmanagerCoinCharges: assetmanagerCoinCharges,
                                    assetmanagerCoinChargesPer: Gen.assetmanagercharges_rgcoin,
                                    netAmountCoin: netAmountCoin
                                }
                            }
                        }, { upsert: true }, callback)
                    }

                    function callback(err, numAffected) {
                        if (err)
                            res.send(err);

                        Stock.aggregate([{ "$match": { truID: truid } }, { "$project": { _id: 0, assetmanagerG24KRateSale: 1 } }
                        ]).exec(function (err, result) {
                            if (err) {
                                response.status(500).send({ error: err })
                                return next(err);
                            }
                            else {
                                var resource = result[0];
                                var grossAmount = resource.assetmanagerG24KRateSale.grossAmount.toJSON().$numberDecimal;
                                var transactionFees = resource.assetmanagerG24KRateSale.transactionFees.toJSON().$numberDecimal;
                                var assetmanagersCharges = resource.assetmanagerG24KRateSale.assetmanagersCharges.toJSON().$numberDecimal;
                                var coinCharges = resource.assetmanagerG24KRateSale.coinCharges.toJSON().$numberDecimal;
                                var netAmount = resource.assetmanagerG24KRateSale.netAmount.toJSON().$numberDecimal;
                                var netAmountCoin = resource.assetmanagerG24KRateSale.netAmountCoin.toJSON().$numberDecimal;

                                var final = ({
                                    grossAmount: grossAmount, transactionFees: transactionFees, assetmanagersCharges: assetmanagersCharges, coinCharges: coinCharges,
                                    netAmount: netAmount, netAmountCoin: netAmountCoin, assayingCharges: assetmanagerCoinCharges.toString()
                                })

                                res.json({ status: "200", assetmanagerG24KRate: final });

                                var dates = new Date().toLocaleString();
                                for (var i = 0; i < assetmanagers.length; i++) {
                                    if (assetmanagers[i] != truid) {
                                        var childtruid = assetmanagers[i]
                                        notification();

                                        function notification(err, numAffected) {
                                            request.post({
                                                "headers": { "content-type": "application/json" },
                                                "url": reqip + ":4116/api/insnotification",
                                                "body": JSON.stringify({
                                                    "notifyto": childtruid,
                                                    "triggeredbytruid": truid,
                                                    "notification": "assetmanager to assetmanager Sale Rate for G24K : " + g24 + " is now changed from your admin assetmanager on " + dates + ".",
                                                    "type": "rate",
                                                    "subtype": "assetmanagerSRate"
                                                })
                                            }, (error, response, body) => {

                                                if (error) {
                                                    return console.dir(error);
                                                }
                                            }
                                            )
                                        }
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
    }
    )
}


exports.update_assetmanager_s99_sale_rate_all_node = function (req, res) {
    var stock = new Stock(req.user);
    var truid = req.body.truid;
    var s99 = parseFloat(req.body.s99);
    var createdate = new Date();
    var query = { truID: truid };
    let Gen = req.generalCharges;

    KycAll.find({ "truID": truid, parentTruID: truid, __t: "KycAll", isParent: true }, function (err, docs) {
        if (!docs.length) {
            res.json({
                status: "204",
                message: "The request was successful but no body was returned."
            });
        } else {

            if (isNaN(s99) || s99 === undefined || s99 === null) {
                res.json({
                    status: "204",
                    message: 'The request was successful Enter valid s99k Rate'
                });
            }
            else {
                request.post({
                    "headers": { "content-type": "application/json" },
                    "url": reqip + ":4125/api/listadminwiseassetmanagerarray",
                    "body": JSON.stringify({ "truid": truid })
                }, (error, response, body) => {
                    if (error) {
                        return console.dir(error);
                    }
                    var newjson = JSON.parse(body);
                    var assetmanagers = newjson.assetmanager;
                    var assetmanagerCharges = useToFixed(s99 * Gen.assetmanagercharges);
                    var transactionFees = useToFixed(s99 * Gen.transactionCharges);
                    var assetstoreCharges = useToFixed(s99 * Gen.assetstoreCharges);
                    var othercharges = useToFixed(transactionFees + assetstoreCharges);

                    //sell rate
                    var netAmount = useToFixed(s99 - (assetmanagerCharges + othercharges));

                    var netAmountCoin = useToFixed(s99 - othercharges);

                    var assetmanagerCoinCharges = useToFixed(netAmountCoin * Gen.assetmanagercharges_rgcoin);

                    Stock.update({ truID: { $in: assetmanagers } }, {
                        $set: {
                            "assetmanagerS99PRateSale.grossAmount": s99, "assetmanagerS99PRateSale.assetmanagersCharges": assetmanagerCharges,
                            "assetmanagerS99PRateSale.transactionFees": othercharges, "assetmanagerS99PRateSale.netAmount": netAmount, "assetmanagerS99PRateSale.netAmountCoin": netAmountCoin,
                            "assetmanagerS99PRateSale.coinCharges": assetmanagerCoinCharges,
                        }
                    }, { multi: true }, ins_log)

                    function ins_log(err, numAffected) {
                        if (err) {
                            res.send(err);
                        }
                        var query = { truID: truid };
                        var respresult = RateLog.findOneAndUpdate(query, {
                            $addToSet: {
                                "assetmanager_S99PSale_log": {
                                    rate: s99,
                                    dateChanged: createdate,
                                    grossAmount: s99,
                                    assetmanagersCharges: assetmanagerCharges,
                                    transactionFees: transactionFees,
                                    assetmanagersChargesPer: Gen.assetmanagercharges,
                                    transactionFeesPer: Gen.transactionCharges,
                                    assetstoreCharge: assetstoreCharges,
                                    assetstoreChargePer: Gen.assetstoreCharges,
                                    netAmount: netAmount,
                                    assetmanagerCoinCharges: assetmanagerCoinCharges,
                                    assetmanagerCoinChargesPer: Gen.assetmanagercharges_rgcoin,
                                    netAmountCoin: netAmountCoin
                                }
                            }
                        }, { upsert: true }, callback)
                    }

                    function callback(err, numAffected) {
                        if (err)
                            res.send(err);

                        Stock.aggregate([{ "$match": { truID: truid } }, { "$project": { _id: 0, assetmanagerS99PRateSale: 1 } }
                        ]).exec(function (err, result) {
                            if (err) {
                                response.status(500).send({ error: err })
                                return next(err);
                            }
                            else {
                                var resource = result[0];
                                var grossAmount = resource.assetmanagerS99PRateSale.grossAmount.toJSON().$numberDecimal;
                                var transactionFees = resource.assetmanagerS99PRateSale.transactionFees.toJSON().$numberDecimal;
                                var assetmanagersCharges = resource.assetmanagerS99PRateSale.assetmanagersCharges.toJSON().$numberDecimal;
                                var coinCharges = resource.assetmanagerS99PRateSale.coinCharges.toJSON().$numberDecimal;
                                var netAmount = resource.assetmanagerS99PRateSale.netAmount.toJSON().$numberDecimal;
                                var netAmountCoin = resource.assetmanagerS99PRateSale.netAmountCoin.toJSON().$numberDecimal;

                                var final = ({
                                    grossAmount: grossAmount, transactionFees: transactionFees, assetmanagersCharges: assetmanagersCharges, coinCharges: coinCharges,
                                    netAmount: netAmount, netAmountCoin: netAmountCoin, assayingCharges: assetmanagerCoinCharges.toString()
                                })

                                res.json({ status: "200", assetmanagerS99PRate: final });

                                var dates = new Date().toLocaleString();
                                for (var i = 0; i < assetmanagers.length; i++) {
                                    if (assetmanagers[i] != truid) {
                                        var childtruid = assetmanagers[i]
                                        notification();

                                        function notification(err, numAffected) {
                                            request.post({
                                                "headers": { "content-type": "application/json" },
                                                "url": reqip + ":4116/api/insnotification",
                                                "body": JSON.stringify({
                                                    "notifyto": childtruid,
                                                    "triggeredbytruid": truid,
                                                    "notification": "assetmanager to assetmanager Sale Rate for S99P : " + s99 + " is now changed from your admin assetmanager on " + dates + ".",
                                                    "type": "rate",
                                                    "subtype": "assetmanagerSRate"
                                                })
                                            }, (error, response, body) => {

                                                if (error) {
                                                    return console.dir(error);
                                                }
                                            }
                                            )
                                        }
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
    }
    )
}

exports.ratedailylogsadmin_datewise = async function (req, res) {
    try {
        var flag1 = {};
        var flag2 = {};
        var flag3 = {};
        var flag4 = {};
        if (req.body.dateFlag != "all") {
            var startdate = new Date(Date.parse(req.body.startdate));
            var enddate = new Date(Date.parse(req.body.enddate) + (1000 * 3600 * 24));
            flag1 = { "G24K_log.dateChanged": { $gte: startdate, $lte: enddate } }
            flag2 = { "S99P_log.dateChanged": { $gte: startdate, $lte: enddate } }
            flag3 = { "G24KSale_log.dateChanged": { $gte: startdate, $lte: enddate } }
            flag4 = { "S99PSale_log.dateChanged": { $gte: startdate, $lte: enddate } }
        }
        const rateData = RateLog.aggregate([{ $match: { truID: req.body.truid } },
        {
            $facet: {
                G24K_log: [
                    { $unwind: "$G24K_log" },
                    { $match: flag1 },
                    { $sort: { "G24K_log.dateChanged": -1 } },
                    {
                        $limit: 25,
                    },
                    { $addFields: { "G24K_log.type": "G24K" } },
                    { $replaceRoot: { newRoot: "$G24K_log" } }
                ],
                S99P_log: [
                    { $unwind: "$S99P_log" },
                    { $match: flag2 },
                    { $sort: { "S99P_log.dateChanged": -1 } },
                    {
                        $limit: 25,
                    },
                    { $addFields: { "S99P_log.type": "S99P" } },
                    { $replaceRoot: { newRoot: "$S99P_log" } }
                ],
                G24KSale_log: [
                    { $unwind: "$G24KSale_log" },
                    { $match: flag3 },
                    { $sort: { "G24KSale_log.dateChanged": -1 } },
                    {
                        $limit: 25,
                    },
                    { $addFields: { "G24KSale_log.type": "G24KSale" } },
                    { $replaceRoot: { newRoot: "$G24KSale_log" } }
                ],
                S99PSale_log: [
                    { $unwind: "$S99PSale_log" },
                    { $match: flag4 },
                    { $sort: { "S99PSale_log.dateChanged": -1 } },
                    {
                        $limit: 25,
                    },
                    { $addFields: { "S99PSale_log.type": "S99PSale" } },
                    { $replaceRoot: { newRoot: "$S99PSale_log" } }
                ]
            }
        },
        {
            $project: {
                truID: 1,
                array: { $concatArrays: ['$G24K_log', '$S99P_log', '$G24KSale_log', '$S99PSale_log'] },
            }
        },
        {
            $unwind: "$array"
        },
        {
            $sort: { "array.dateChanged": 1 },
        },
        {
            $group: {
                _id: "$_id",
                array: { "$push": "$array" }
            }
        }, {
            $project: {
                array: 1,
                _id: 0
            }
        }
        ]).allowDiskUse(true).cursor({ batchSize: 1000 });
        var result = new Array();
        for await (const txndetailDF of rateData) {
            for await (const txndetail of txndetailDF.array) {
                txndetail.rate = parseFloat(txndetail.rate)
                result.push(txndetail)
            }
        }
        res.json({
            "status": "1000", "buy": result
        });
    }
    catch (ex) {
        console.log(ex)
        res.send({
            status: "411", "message": "Invalid Date"
        })
    }
}

exports.read_assetmanagerRate_ByAdmin = function (req, res) {
    var truid = req.body.truid;
    KycAll.find({ truID: truid }, function (err, docs) {
        if (!docs.length) {
            res.json({
                status: "204",
                message: 'The request was successful but no TruID was returned.'
            });
        }
        else {
            Stock.aggregate([
                { $match: { truID: truid } },
                {
                    $project: {
                        _id: 0,
                        G24Kgross: { $ifNull: [{ $toString: "$G24K.grossAmount" }, 0] },
                        S99Pgross: { $ifNull: [{ $toString: "$S99P.grossAmount" }, 0] },
                        G24KSalegross: { $ifNull: [{ $toString: "$G24KSale.grossAmount" }, 0] },
                        S99PSalegross: { $ifNull: [{ $toString: "$S99PSale.grossAmount" }, 0] }
                    }
                }
            ]).exec(function (err, result) {
                if (err) {
                    response.status(500).send({ error: err })
                    return next(err);
                }
                else {
                    if (result.length) {
                        var resource = result[0];
                        var grossG24K = resource.G24Kgross;
                        var grossS99P = resource.S99Pgross;
                        var grossG24KSale = resource.G24KSalegross;
                        var grossS99PSale = resource.S99PSalegross;


                        var Final = {
                            "G24Kgross": grossG24K,
                            "S99Pgross": grossS99P,
                            "G24KSalegross": grossG24KSale,
                            "S99PSalegross": grossS99PSale
                        };
                        res.json({ status: "200", resource: Final });
                    } else {
                        var Final = {
                            "G24Kgross": "0",
                            "S99Pgross": "0",
                            "G24KSalegross": "0",
                            "S99PSalegross": "0"
                        };
                        res.json({ status: "200", resource: Final });
                    }

                }
            }
            )
        }
    }
    )
}
exports.read_assetmanagerRate_ByAdminChart = function (req, res) {
    var truid = req.body.truid; // assetmanager truID
    RateLog.aggregate([
        {
            $facet: {
                G24K: [{ $match: { truID: defaultConf.currentassetmanager } },
                { $project: { _id: 0, G24K_log: 1, } },
                { $unwind: "$G24K_log" },
                { $sort: { "G24K_log.dateChanged": 1 } },
                { $addFields: { "G24K_log.type": "G24K" } },
                { $replaceRoot: { newRoot: "$G24K_log" } },
                { $sort: { "dateChanged": - 1 } },
                {
                    "$group": {
                        "_id": { $dateToString: { format: "%Y-%m-%d", date: "$dateChanged" } },
                        "created_at": { "$first": "$dateChanged" },
                        "open": { "$first": { $toDouble: "$rate" } },
                        "close": { "$last": { $toDouble: "$rate" } },
                        "high": { "$max": { $toDouble: "$rate" } },
                        "low": { "$min": { $toDouble: "$rate" } },
                    }
                },
                {
                    $project: {
                        "_id": "$_id",
                        "x": "$created_at",
                        "o": "$open",
                        "c": "$close",
                        "h": "$high",
                        "l": "$low"
                    }
                },
                { $sort: { "x": 1 } }
                ],
                S99P: [{ $match: { truID: defaultConf.currentassetmanager } },
                { $project: { _id: 0, S99P_log: 1, } },
                { $unwind: "$S99P_log" },
                { $sort: { "S99P_log.dateChanged": 1 } },
                { $addFields: { "S99P_log.type": "S99P" } },
                { $replaceRoot: { newRoot: "$S99P_log" } },
                { $sort: { "dateChanged": - 1 } },
                {
                    "$group": {
                        "_id": { $dateToString: { format: "%Y-%m-%d", date: "$dateChanged" } },
                        "created_at": { "$first": "$dateChanged" },
                        "open": { "$first": { $toDouble: "$rate" } },
                        "close": { "$last": { $toDouble: "$rate" } },
                        "high": { "$max": { $toDouble: "$rate" } },
                        "low": { "$min": { $toDouble: "$rate" } },
                    }
                },
                {
                    $project: {
                        "_id": "$_id",
                        "x": "$created_at",
                        "o": "$open",
                        "c": "$close",
                        "h": "$high",
                        "l": "$low"
                    }
                },
                { $sort: { "x": 1 } }
                ]
            }
        }


    ]).exec(async function (err, result) {
        if (err) {
            response.status(500).send({ error: err })
            return next(err);
        }
        else {
            if (result.length > 0) {
                var resource = result[0];
                const newProjectsG24K = await resource.G24K.map(({ x, ...school }) => ({
                    ...school,
                    x: Date.parse(x)
                }));
                const newProjectsS99P = await resource.S99P.map(({ x, ...school }) => ({
                    ...school,
                    x: Date.parse(x)
                }));
                res.json({
                    status: "200", resource: {
                        G24K: newProjectsG24K,
                        S99P: newProjectsS99P
                    }
                });
            } else {
                res.json({
                    status: "200", resource: {
                        G24K: [],
                        S99P: []
                    }
                });
            }

        }
    }
    )
}

exports.total_stock_hold = function (req, res) {
    var Gen = req.generalCharges;
    Stock.aggregate([
        { $match: { truID: req.body.truid } },
        {
            $project: {
                _id: 0,
                G24Kgross: { $toString: "$G24K.grossAmount" },
                S99Pgross: { $toString: "$S99P.grossAmount" },
                G24KSalegross: { $toString: "$G24KSale.grossAmount" },
                S99PSalegross: { $toString: "$S99PSale.grossAmount" },
                G24K: { $toString: "$G24K.netAmount" },
                S99P: { $toString: "$S99P.netAmount" }
            }
        }
    ]).exec(async function (err, result) {
        if (err) {
            response.status(500).send({ error: err })
            return next(err);
        }
        else {
            var resultobj = {};
            if (result.length) {
                var resource = result[0];
                ChargesModel.aggregate([{
                    $project: {
                        _id: 0,
                        trasactionCharges: { $toString: "$trasactionCharges" }
                    }
                },
                { $sort: { trasactionCharges: -1 } },
                { $limit: 1 }]).exec(function (err, docs) {
                    if (!docs.length) {
                        ChargesRev(0)
                    }
                    else {
                        // console.log("docs[0]", docs[0].trasactionCharges)
                        ChargesRev(parseFloat(docs[0].trasactionCharges))
                    }
                })


                function ChargesRev(transactionCharges) {
                    var final24KObjClient = calculateRate(Gen, resource.G24KSalegross, "redeemCash", transactionCharges);
                    var final99PObjClient = calculateRate(Gen, resource.S99PSalegross, "redeemCash", transactionCharges);


                    var final24KObj = calculateRate(Gen, resource.G24KSalegross, "redeemCash", 0);
                    var final99PObj = calculateRate(Gen, resource.S99PSalegross, "redeemCash", 0);


                    var final24KObjBuy = calculateRate(Gen, resource.G24Kgross, "buy", 0);
                    var final99PObjBuy = calculateRate(Gen, resource.S99Pgross, "buy", 0);

                    var final24KObjBuyClient = calculateRate(Gen, resource.G24Kgross, "buy", transactionCharges);
                    var final99PObjBuyClient = calculateRate(Gen, resource.S99Pgross, "buy", transactionCharges);

                    /*   var assetmanagercharges = parseFloat(Gen.assetmanagercharges);
                      var othercharges = parseFloat(Gen.othercharges);
                      
                      //SELL
                      var g24kgrossrate = parseFloat(resource.G24KSalegross);
                      var g24krate = useToFixed(g24kgrossrate - ((g24kgrossrate * othercharges) + (g24kgrossrate * assetmanagercharges)));
          
                      var S99Pgrossrate = parseFloat(resource.S99PSalegross);
                      var s99prate = useToFixed(S99Pgrossrate - ((S99Pgrossrate * othercharges) + (S99Pgrossrate * assetmanagercharges))); */

                    resultobj["G24KSaleRate"] = final24KObj.netrate;
                    resultobj["S99PSaleRate"] = final99PObj.netrate;

                    resultobj["G24KBuy"] = final24KObjBuy.netrate;
                    resultobj["S99PBuy"] = final99PObjBuy.netrate;

                    resultobj["G24KBuyClient"] = final24KObjBuyClient.netrate;
                    resultobj["S99PBuyClient"] = final99PObjBuyClient.netrate;

                    resultobj["G24KSaleRateClient"] = final24KObjClient.netrate;
                    resultobj["S99PSaleRateClient"] = final99PObjClient.netrate;
                    custStock.aggregate([
                        {
                            "$lookup": {
                                "from": "wallets",
                                "localField": "truID",
                                "foreignField": "truID",
                                "as": "wallets"
                            }
                        },
                        { $unwind: "$wallets" },
                        { $project: { wallets: 1, stock: 1 } },
                        { $group: { _id: null, G24K: { $sum: "$stock.G24K" }, S99P: { $sum: "$stock.S99P" }, walletBal: { $sum: { $cond: [{ '$gt': ['$wallets.clBal', 0] }, "$wallets.clBal", 0] } } } },
                        { $project: { _id: 0, G24K: { $toString: "$G24K" }, S99P: { $toString: "$S99P" }, walletBal: { $toString: "$walletBal" } } },
                    ]).exec(function (err, result) {
                        if (err) {
                            res.json({ status: "500", message: "Internal Server Error" });
                        }
                        else {
                            resultobj["G24K"] = parseFloat(result[0].G24K);
                            resultobj["S99P"] = parseFloat(result[0].S99P);
                            resultobj["wallet"] = parseFloat(result[0].walletBal);
                            entityStock.aggregate([
                                {
                                    "$lookup": {
                                        "from": "wallets",
                                        "localField": "truID",
                                        "foreignField": "truID",
                                        "as": "wallets"
                                    }
                                },
                                { $unwind: "$wallets" },
                                { $project: { wallets: 1, stock: 1 } },
                                { $group: { _id: null, G24K: { $sum: "$stock.G24K" }, S99P: { $sum: "$stock.S99P" }, walletBal: { $sum: { $cond: [{ '$gt': ['$wallets.clBal', 0] }, "$wallets.clBal", 0] } } } },
                                { $project: { _id: 0, G24K: { $toString: "$G24K" }, S99P: { $toString: "$S99P" }, walletBal: { $toString: "$walletBal" } } },
                            ]).exec(function (err, result) {
                                if (err) {
                                    res.json({ status: "500", message: "Internal Server Error" });
                                } else {
                                    if (result.length) {
                                        resultobj["eG24K"] = parseFloat(result[0].G24K);
                                        resultobj["eS99P"] = parseFloat(result[0].S99P);
                                        resultobj["eWallet"] = parseFloat(result[0].walletBal)
                                    } else {
                                        resultobj["eG24K"] = 0;
                                        resultobj["eS99P"] = 0;
                                        resultobj["eWallet"] = 0;
                                    }
                                    var g24ktotalStock = resultobj["G24K"] + resultobj["eG24K"];
                                    var s99ptotalStock = resultobj["S99P"] + resultobj["eS99P"];
                                    var valuetot = (s99ptotalStock * final99PObjClient.netrate) + (g24ktotalStock * final24KObjClient.netrate);
                                    var eWallet = resultobj["wallet"] + resultobj["eWallet"];
                                    resultobj["eWallet"] += resultobj["wallet"];
                                    resultobj["eValue"] = valuetot.toString();
                                    resultobj["eValueTotal"] = (valuetot + eWallet).toString();
                                    res.json({ status: "200", resource: resultobj });
                                }
                            })
                        }
                    })
                }
            } else {
                res.json({
                    status: "200", resource: {
                        G24Kgross: "0",
                        S99Pgross: "0",
                        G24KSalegross: "0",
                        S99PSalegross: "0",
                        G24K: "0",
                        S99P: "0",
                    }
                });

            }

        }
    })
}

exports.client_Rate = function (req, res) {
    var Gen = req.generalCharges;
    Stock.aggregate([
        { $match: { truID: defaultConf.currentassetmanager } },
        {
            $project: {
                _id: 0,
                G24Kgross: { $toString: "$G24K.grossAmount" },
                S99Pgross: { $toString: "$S99P.grossAmount" },
                G24KSalegross: { $toString: "$G24KSale.grossAmount" },
                S99PSalegross: { $toString: "$S99PSale.grossAmount" },
                G24K: { $toString: "$G24K.netAmount" },
                S99P: { $toString: "$S99P.netAmount" }
            }
        }
    ]).exec(async function (err, result) {
        if (err) {
            response.status(500).send({ error: err })
            return next(err);
        }
        else {
            var resultobj = {};
            var resource = result[0];
            var Gen = req.generalCharges;
            ChargesModel.aggregate([
                { $match: { truID: req.body.rTruID } },
                {
                    $project: {
                        _id: 0,
                        trasactionCharges: { $toString: "$trasactionCharges" }
                    }
                },
                { $sort: { trasactionCharges: -1 } },
                { $limit: 1 }]).exec(function (err, docs) {
                    if (!docs.length) {
                        ChargesRev(0)
                    }
                    else {
                        ChargesRev(parseFloat(docs[0].trasactionCharges))
                    }
                })
            function ChargesRev(transactionCharges) {
                var final24KObjClient = calculateRate(Gen, resource.G24KSalegross, "redeemCash", transactionCharges);
                var final99PObjClient = calculateRate(Gen, resource.S99PSalegross, "redeemCash", transactionCharges);

                var final24KObjBuyClient = calculateRate(Gen, resource.G24Kgross, "buy", transactionCharges);
                var final99PObjBuyClient = calculateRate(Gen, resource.S99Pgross, "buy", transactionCharges);

                resultobj["G24KBuyClient"] = final24KObjBuyClient.netrate;
                resultobj["S99PBuyClient"] = final99PObjBuyClient.netrate;

                resultobj["G24KSaleRateClient"] = final24KObjClient.netrate;
                resultobj["S99PSaleRateClient"] = final99PObjClient.netrate;
                res.json({ status: "200", resource: resultobj });
            }

        }
    })
}

exports.stockDailyUpdate = async function (req, res) {
    try {
        var globalQuery = {};
        if (req.body.cTruID) {
            globalQuery.truID = req.body.cTruID;
        }
        if (req.body.startDate && req.body.endDate) {
            var startdate = new Date(Date.parse(req.body.startDate));
            var enddate = new Date(Date.parse(req.body.endDate));
            globalQuery.createDate = { $gte: startdate, $lte: enddate }
        }
        if (req.body.rTruID) {
            const encursor = await remmitKycAll.findOne({ truID: req.body.rTruID });
            if (encursor) {
                if (encursor.isParent) {
                    const cursor = await custKycAll.find({ channel: encursor.MID }, { truID: 1 });
                    globalQuery.truID = { $in: consumerArray(cursor) }
                }
                else {
                    const cursor = await custKycAll.find({ refernceTruID: req.body.rTruID }, { truID: 1 });
                    globalQuery.truID = { $in: consumerArray(cursor) }
                }
            }
            else {
                res.send({ status: 401, result: "Invalid Partner" })
            }
        }
        function consumerArray(numbers) {
            const filteredNumbers = numbers.map((num, index) => {
                return num.truID;
            });
            return filteredNumbers.filter(function (item, pos) {
                return filteredNumbers.indexOf(item) == pos;
            })
        }

        function queryBulider(bullionType, type) {
            var query = { bullionType: bullionType, tType: type };
            return query;
        }
        var arr = ["buy", "redeemCash", "reversal"];
        var arrAnt = ["transfer"];
        var arrayFacet = {};
        var projectT = { _id: 0 };
        var projectwind = [];
        var groupby = {};
        function createQuery(element, item, myType) {
            var G24KKey = "G24K" + element;
            var S99PKey = "S99P" + element;
            var proG24KKey = "$" + G24KKey;
            var proKeyS99P = "$" + S99PKey;

            arrayFacet = Object.assign({
                [`${G24KKey}`]: [{ $match: queryBulider("G24K", item) },
                {
                    $group: {
                        _id: null,
                        [`${G24KKey}`]: { $sum: { $add: myType } }
                    }
                }],
                [`${S99PKey}`]: [{ $match: queryBulider("S99P", item) },
                {
                    $group: {
                        _id: null,
                        [`${S99PKey}`]: { $sum: { $add: myType } }
                    }
                }]
            }, arrayFacet);
            projectwind.push("$" + G24KKey)
            projectwind.push("$" + S99PKey)

            groupby = Object.assign({
                [`${G24KKey}`]: { $max: "$" + `${G24KKey}` },
                [`${S99PKey}`]: { $max: "$" + `${S99PKey}` }
            }, groupby)
            projectT = Object.assign({
                [`${G24KKey}`]: { $ifNull: [{ $toString: `${proG24KKey}` }, "0"] },
                [`${S99PKey}`]: { $ifNull: [{ $toString: `${proKeyS99P}` }, "0"] }
            }, projectT);
        }
        function callLoop() {
            arrAnt.forEach((item) => {
                for (var i = 0; i < 2; i++) {
                    var element = item + "_Dr";
                    if (i == 1) {
                        element = item + "_Cr";
                        createQuery(element, item, ["$Cr"])
                    }
                    else {
                        createQuery(element, item, ["$Dr"])
                    }

                }
            })
        }

        function callOnce() {
            arr.forEach((element) => {
                createQuery(element, element, ["$Dr", "$Cr"])
            })
        }
        callOnce();
        callLoop();
        groupby = Object.assign({ _id: null }, groupby);
        const data = await custTxnStockLog.aggregate([
            { $match: globalQuery },
            {
                $facet: arrayFacet
            },
            {
                "$project": {
                    'stock': {
                        '$setUnion': projectwind
                    },
                }
            },
            {
                '$unwind': { path: '$stock', preserveNullAndEmptyArrays: true }
            },
            {
                '$replaceRoot': {
                    'newRoot': '$stock'
                }
            },
            {
                $group: groupby
            },
            {
                $project: projectT
            }
        ]);
        res.send({ status: 200, result: data })
    }
    catch (ex) {
        res.send({ status: 500, result: ex.message })
    }
}