
'use strict'

var request = require('request'),
    KycAll = require('../models/custKYCAllModel'),
    TXN = require('../models/custTXNModel'),
    WalletModel = require('../models/custWalletModel'),
    StockModel = require('../models/custStockModel'),
    conf = require("../conf");


exports.profitlossbuysell = function (req, res) {
    var truid = req.body.truid;
    KycAll.find({ truID: truid }, function (err, docs) {
        if (!docs.length) {
            res.json({
                status: "204",
                message: "The request was successful but no body was returned."
            });
        } else {
            var countryCode = docs[0].countryCode;
            var respresult = TXN.aggregate([{ $match: { to: truid, $or: [{ type: "buy" }, { type: "buyCash" }], status: "success" } },
            { $sort: { createDate: -1 } },
            {
                $facet: {
                    G24K: [{ $match: { "particularsG24.qty": { $gt: 0 } } },
                    { $project: { assetmanagerRate: "$particularsG24", _id: 0, to: 1 } },
                    { $unwind: "$assetmanagerRate" },
                    {
                        $group: {
                            _id: null, avgBuyRate: { $avg: "$assetmanagerRate.rate" }, to: { $first: "$to" }
                        }
                    },
                    { $project: { avgBuyRate: 1, _id: 0, to: 1 } },
                    {
                        $lookup: {
                            from: "stocks",
                            localField: "to",
                            foreignField: "truID",
                            as: "custstock"
                        }
                    },
                    { $unwind: "$custstock" },
                    {
                        $lookup: {
                            from: "wallets",
                            localField: "to",
                            foreignField: "truID",
                            as: "wallet"
                        }
                    },
                    { $unwind: "$wallet" },
                    { $project: { avgBuyRate: 1, _id: 0, to: 1, stock: "$custstock.stock.G24K", walletBal: "$wallet.clBal" } },
                    ],

                    S99P: [{ $match: { "particularsS99.qty": { $gt: 0 } } },
                    { $project: { assetmanagerRate: "$particularsS99", _id: 0, to: 1 } },
                    { $unwind: "$assetmanagerRate" },
                    { $group: { _id: null, avgBuyRate: { $avg: "$assetmanagerRate.rate" }, to: { $first: "$to" } } },
                    { $project: { avgBuyRate: 1, _id: 0, to: 1 } },
                    {
                        $lookup: {
                            from: "stocks",
                            localField: "to",
                            foreignField: "truID",
                            as: "custstock"
                        }
                    },
                    { $unwind: "$custstock" },
                    {
                        $lookup: {
                            from: "wallets",
                            localField: "to",
                            foreignField: "truID",
                            as: "wallet"
                        }
                    },
                    { $unwind: "$wallet" },
                    { $project: { avgBuyRate: 1, _id: 0, to: 1, stock: "$custstock.stock.S99P", walletBal: "$wallet.clBal" } },
                    ],
                }
            }]);
            respresult.exec(function (err, result) {
                if (err) {
                    res.json({ status: "204", message: "Something went wrong!" });
                } else {
                    var avgbuyG24K = 0,
                        avgbuyS99P = 0,
                        stock24k = 0,
                        stock99p = 0,
                        balance = 0;

                    if (result[0].G24K.length > 0 && result[0].S99P.length > 0) {
                        avgbuyG24K = result[0].G24K[0].avgBuyRate;
                        avgbuyS99P = result[0].S99P[0].avgBuyRate;
                        stock24k = result[0].G24K[0].stock;
                        stock99p = result[0].S99P[0].stock;
                        balance = result[0].S99P[0].walletBal ? result[0].S99P[0].walletBal : 0;
                        callPercentage();
                    }
                    else {
                        WalletModel.find({ truID: req.body.truid }, function (err, walldocs) {
                            if (!walldocs.length) {
                                StockModel.aggregate([
                                    { $match: { truID: req.body.truid } },
                                    {
                                        $project: {
                                            _id: 0, truID: 1,
                                            G24K: "$stock.G24K",
                                            S99P: "$stock.S99P"
                                        }
                                    }
                                ]).exec(function (err, stockdocs) {
                                    if (!stockdocs.length) {
                                    } else {
                                        stock24k = stockdocs[0].G24K
                                        stock99p = stockdocs[0].S99P
                                    }
                                    callPercentage()
                                })
                            } else {
                                balance = walldocs[0].clBal;
                                StockModel.aggregate([
                                    { $match: { truID: req.body.truid } },
                                    {
                                        $project: {
                                            _id: 0, truID: 1,
                                            G24K: "$stock.G24K",
                                            S99P: "$stock.S99P"
                                        }
                                    }
                                ]).exec(function (err, stockdocs) {
                                    if (!stockdocs.length) {
                                    } else {
                                        stock24k = stockdocs[0].G24K
                                        stock99p = stockdocs[0].S99P
                                    }
                                    callPercentage()
                                })
                            }
                        })
                    }

                    function callPercentage() {
                        request.post({
                            "headers": { "content-type": "application/json" },
                            "url": conf.reqip + ":4125/api/readliveratefromassetmanager",
                            "body": JSON.stringify({
                                "countrycode": countryCode
                            })
                        }, (error, response, body) => {
                            if (error) {
                                res.json({
                                    status: "411", message: "No rate found..!!"
                                });
                            }
                            else {

                                if (JSON.parse(body).status == "200") {
                                    var rate = JSON.parse(body).resource;
                                    var g24krate = parseFloat(rate.G24K),
                                        s99prate = parseFloat(rate.S99P);
                                    if (parseFloat(avgbuyG24K) > 0 && parseFloat(avgbuyS99P) > 0) {


                                        var diff24KTotal = parseFloat(avgbuyG24K) - g24krate;
                                        var diff99Total = parseFloat(avgbuyS99P) - s99prate;
                                        var g24kPer = (diff24KTotal / parseFloat(avgbuyG24K)) * 100;
                                        var s99Per = (diff99Total / parseFloat(avgbuyS99P)) * 100;
                                        var goldValuation = g24krate * parseFloat(stock24k);
                                        var silverValuation = s99prate * parseFloat(stock99p);
                                        var g24kPerValue = diff24KTotal * parseFloat(stock24k);
                                        var s99PerValue = diff99Total * parseFloat(stock99p);

                                        res.json({
                                            status: "200", resource: {
                                                g24kPerValue: g24kPerValue.toString(),
                                                s99PerValue: s99PerValue.toString(),
                                                g24kPer: g24kPer.toString(),
                                                s99Per: s99Per.toString(),
                                                stock24k: stock24k.toString(),
                                                stock99p: stock99p.toString(),
                                                balance: balance.toString(),
                                                goldValuation: goldValuation.toString(),
                                                silverValuation: silverValuation.toString(),
                                                G24K: g24krate.toString(),
                                                S99P: s99prate.toString()
                                            }
                                        });
                                    }
                                    else {
                                        var goldValuation = g24krate * parseFloat(stock24k);
                                        var silverValuation = s99prate * parseFloat(stock99p);
                                        res.json({
                                            status: "200", resource: {
                                                g24kPerValue: "0",
                                                s99PerValue: "0",
                                                g24kPer: "0",
                                                s99Per: "0",
                                                stock24k: stock24k.toString(),
                                                stock99p: stock99p.toString(),
                                                balance: balance.toString(),
                                                goldValuation: goldValuation.toString(),
                                                silverValuation: silverValuation.toString(),
                                                G24K: g24krate.toString(),
                                                S99P: s99prate.toString()
                                            }
                                        });
                                    }
                                }
                                else {
                                    res.json({
                                        status: "411", message: "No rate found..!!"
                                    });
                                }
                            }
                        })
                    }

                }
            }
            )
        }
    })
}