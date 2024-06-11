
'use strict'

const KycAll = require('../models/remmitKYCAllModel'), //having all the require fields for kyc discrimination
    Stock = require('../models/remmitStockModel'),
    txnStocklogs = require('../models/txnStockLogModel'),
    { encryption } = require("./encrypt"),
    randomize = require('randomatic');
exports.entity_Revenue_charges_History = function (req, res) {
    var truid = req.body.truid;
    var type = req.body.type;
    var appliedOn = req.body.appliedOn ? req.body.appliedOn : "consumer";

    KycAll.find({ truID: truid }).exec(function (err, doc) {
        if (err) {
            res.status(500).json({ status: "500", message: "ïnternal server error" });
        } else {
            if (!doc.length) {
                res.json({ status: "204", message: "The request was successful but no body was returned." });
            } else {
                KycAll.aggregate([
                    { $match: { truID: truid } },
                    { $project: { _id: 0, truID: 1, parentTruID: 1, CRNNo: 1, isParent: 1, MID: 1, companyName: 1 } },
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
                                                    cond: { $and: [{ $eq: ["$$trArr.isChargesSet", true] }, { $eq: ["$$trArr.type", type] }, { $eq: ["$$trArr.appliedOn", appliedOn] }] }
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
                            _id: 0, truID: 1, CRNNo: 1, isParent: 1, parentTruID: 1, MID: 1, companyName: 1,
                            "charges": {
                                $filter: {
                                    input: "$charges",
                                    as: "chrg",
                                    cond: { $and: [{ $eq: ["$$chrg.isChargesSet", true] }, { $eq: ["$$chrg.type", "common"] }, { $eq: ["$$chrg.appliedOn", appliedOn] }] }
                                }
                            },
                            "targetArrold": {
                                $filter: {
                                    input: "$charges",
                                    as: "chrg",
                                    cond: { $and: [{ $eq: ["$$chrg.isChargesSet", true] }, { $eq: ["$$chrg.type", type] }, { $eq: ["$$chrg.appliedOn", appliedOn] }] }
                                }
                            }
                        }
                    },
                    {
                        $project: {
                            _id: 0, truID: 1, CRNNo: 1, isParent: 1, parentTruID: 1, MID: 1, companyName: 1,
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
                    }
                ]).exec(function (err, result) {
                    if (err) {
                        res.send({ status: 500, message: "Internal server error" })
                    } else {
                        if (!result.length) {
                            res.json({ status: "200", resource: [], isParent: doc[0].isParent })
                        }
                        else {
                            var resp = result;
                            var confArr = [];

                            if (resp.length > 0) {
                                for (var i = 0; i < resp.length; i++) {
                                    var respobj = {};
                                    var respData = resp[i];
                                    respobj["fromTruID"] = respData.fromTruID;
                                    respobj["truID"] = respData.truID;
                                    respobj["createDate"] = respData.createDate;
                                    // respobj["revenuePercent"] = respData.revenuePercent.toJSON().$numberDecimal;

                                    if (respData.charges.length > 0) {
                                        var chCharges = respData.charges[0];
                                        respobj["promotionQty"] = chCharges.promotionQty ? chCharges.promotionQty.toJSON().$numberDecimal : 0;
                                        respobj["nodeCharges"] = chCharges.nodeCharges ? chCharges.nodeCharges.toJSON().$numberDecimal : 0;
                                        respobj["partnerCharges"] = chCharges.partnerCharges ? chCharges.partnerCharges.toJSON().$numberDecimal : 0;
                                        respobj["trasactionCharges"] = chCharges.trasactionCharges ? chCharges.trasactionCharges.toJSON().$numberDecimal : 0;
                                        respobj["tdsPercentage"] = chCharges.tdsPercentage ? chCharges.tdsPercentage.toJSON().$numberDecimal : 0;
                                        respobj["isChargesSet"] = chCharges.isChargesSet ? chCharges.isChargesSet : false;
                                    }
                                    else {
                                        respobj["isChargesSet"] = false;
                                    }

                                    confArr.push(respobj);
                                }
                            }
                            else {
                                confArr.push({ isChargesSet: false });
                            }

                            res.json({ status: "200", resource: confArr, isParent: doc[0].isParent })
                        }
                    }
                })
            }
        }
    })
}

exports.update_Client_Stock = function (req, res) {
    var truid = req.body.truid;
    var qty = parseFloat(req.body.qty);
    var query = { truID: truid };
    Stock.aggregate([{
        $match: query
    },
    {
        $lookup: {
            from: "kycs",
            localField: "truID",
            foreignField: "truID",
            as: "entity"
        }
    },
    { "$unwind": { "path": "$entity", "preserveNullAndEmptyArrays": true } },
    {
        $project: {
            _id: 0, companyName: "$entity.companyName", g24kstock: { $toDecimal: "$stock.G24K" }, s99pstock: { $toDecimal: "$stock.S99P" }, status24: {
                $cond: {
                    if: { $and: [{ $gte: ["$stock.G24K", { $toDecimal: qty }] }, { $gte: ["$stock.G24K", 0] }] },
                    then: "resolve", else: "$stock.G24K"
                }
            },
            status99: {
                $cond: {
                    if: { $and: [{ $gte: ["$stock.S99P", { $toDecimal: qty }] }, { $gte: ["$stock.S99P", 0] }] },
                    then: "resolve", else: "$stock.S99P"
                }
            }
        }
    }
    ]).exec(function (err, result) {
        if (err) {
            response.status(500).send({ error: err })
        }
        else {
            var resource = result[0];
            var s24 = resource.status24;
            var s99 = resource.status99;
            var previousStock = req.body.bulliontype == "G24K" ? resource.g24kstock : resource.s99pstock;

            if (req.body.bulliontype == "G24K" && s24 == "resolve") {
                Stock.findOneAndUpdate(query, { $inc: { "stock.G24K": qty } }, { new: true }).exec(function (err, result) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        UpdateLog(truid, req.body.type, qty, req.body.invoice, "G24K", previousStock);
                        res.json({ status: "200", message: "Stock updated successfully." });
                    }
                }
                )
            }
            else if (req.body.bulliontype == "S99P" && s99 == "resolve") {
                Stock.findOneAndUpdate(query, { $inc: { "stock.S99P": qty } }, { new: true }).exec(function (err, result) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        UpdateLog(truid, req.body.type, qty, req.body.invoice, "S99P", previousStock);
                        res.json({ status: "200", message: "Stock updated successfully." });
                    }
                }
                )
            }
            function UpdateLog(totruid, type, tqty24, invoice, bullionType, previousStock) {
                var obj = {
                    "truid": totruid,
                    "tType": type,
                    "Qty": tqty24,
                    "invoice": invoice,
                    "bullionType": bullionType,
                    "status": "success",
                    "isReceived": false,
                    "isConverted": false
                }
                var Cr = 0, Dr = 0;
                if (tqty24 < 0) {
                    Dr = tqty24;
                } else {
                    Cr = tqty24;
                }
                var stkID = "S" + (Date.parse(new Date()) + randomize('0', 4)).toString();
                const txnstock = {};
                txnstock.stockID = stkID;
                txnstock.truID = obj.truid;
                txnstock.createDate = new Date();
                txnstock.invoice = obj.invoice;
                txnstock.tType = obj.tType;
                txnstock.bullionType = obj.bullionType;
                txnstock.Cr = Cr;
                txnstock.Dr = Dr;
                txnstock.currentStock = parseFloat(previousStock) + tqty24;
                txnstock.previousStock = previousStock;
                txnstock.status = obj.status;
                txnstock.hash = encryption(JSON.stringify(txnstock));
                var insertTXN = new txnStocklogs(txnstock);
                insertTXN.save(function (err) { if (err) console.error(err); });
            }
        }
    })
}