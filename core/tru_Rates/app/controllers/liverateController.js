


'use strict'

const request = require('request'),
  KycAll = require('../models/assetmanager/assetmanagerKYCAllModel'),
  Stock = require('../models/assetmanager/assetmanagerStockModel'),
  RateLog = require('../models/assetmanager/assetmanagerRateLogModel'),
  { calculateRate } = require('./calculateRate'),
  conf = require("../conf");
const { encryption } = require("./encrypt");
const txnStocklogs = require('../models/assetmanager/txnStockLogModel');
var randomize = require('randomatic');
var reqip = conf.reqip;
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

function decimalChopper(num, fixed) {
  var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?');
  return num.toString().match(re)[0];
}

exports.read_live_rate_from_assetmanager = function (req, res) {
  var countrycode = req.body.countrycode;
  var Gen = req.generalCharges;
  var clienttxncharges = req.body.clientTxnLoading ? parseFloat(req.body.clientTxnLoading) : 0;
  Stock.aggregate([
    {
      $facet: {
        topG24K: [
          { $project: { truID: 1, G24K: "$G24K.grossAmount", G24KgrossAmount: "$G24K.grossAmount", stock: 1, statusA: { $gt: ["$G24K.netAmount", 0.1] }, statusS: { $gt: ["$stock.G24K", 0] } } },
          { $match: { $and: [{ statusA: true }, { statusS: true }] } },
          { $sort: { G24K: 1 } },
          {
            $lookup: {
              from: "kycs",
              localField: "truID",
              foreignField: "truID",
              as: "assetmanager"
            }
          },
          { "$unwind": { "path": "$assetmanager", "preserveNullAndEmptyArrays": true } },
          {
            $project: {
              truID: 1, G24K: 1, stock: 1, KYCFlag: "$assetmanager.KYCFlag", "assetmanagerName": "$assetmanager.assetmanagerName",
              isInsolventbyC: "$assetmanager.isInsolventbyC", Address: "$assetmanager.contactAddress", countryCode: "$assetmanager.countryCode", G24KgrossAmount: 1
            }
          },
          { $match: { KYCFlag: "active" } },
          {
            $project: {
              _id: 0, truID: 1, G24K: 1, "assetmanagerName": 1, countryCode: 1, G24KgrossAmount: 1
            }
          },
          { $match: { countryCode: countrycode } },
          { $limit: 1 }
        ],
        topS99P: [
          {
            $project: {
              truID: 1, S99P: "$S99P.grossAmount", S99PgrossAmount: "$S99P.grossAmount", stock: 1,
              statusA: { $gt: ["$S99P.netAmount", 0.1] }, statusS: { $gt: ["$stock.S99P", 0] }
            }
          },
          { $match: { $and: [{ statusA: true }, { statusS: true }] } },
          { $sort: { S99P: 1 } },
          {
            $lookup: {
              from: "kycs",
              localField: "truID",
              foreignField: "truID",
              as: "assetmanager"
            }
          },
          { "$unwind": { "path": "$assetmanager", "preserveNullAndEmptyArrays": true } },
          {
            $project: {
              truID: 1, S99P: 1, stock: 1, KYCFlag: "$assetmanager.KYCFlag", "assetmanagerName": "$assetmanager.assetmanagerName",
              isInsolventbyC: "$assetmanager.isInsolventbyC", Address: "$assetmanager.contactAddress", countryCode: "$assetmanager.countryCode", S99PgrossAmount: 1
            }
          },
          { $match: { KYCFlag: "active" } },
          {
            $project: {
              _id: 0, truID: 1, S99P: 1, "assetmanagerName": 1, countryCode: 1, S99PgrossAmount: 1
            }
          },
          { $match: { countryCode: countrycode } },
          { $limit: 1 }
        ]
      }
    }]).exec(function (err, result) {
      if (err) {
        res.send({ status: "204", message: "Something went wrong!" });
      }
      else {
        var resource = result[0];
        if (result.length) {
          var netrate24 = resource.topG24K && resource.topG24K.length && resource.topG24K[0].G24K ? calculateRate(Gen, resource.topG24K[0].G24K.toJSON().$numberDecimal, "buy", clienttxncharges) : "0.00",
            netrate99 = resource.topS99P && resource.topS99P.length && resource.topS99P[0].S99P ? calculateRate(Gen, resource.topS99P[0].S99P.toJSON().$numberDecimal, "buy", clienttxncharges) : "0.00";

          var grossrate24 = resource.topG24K && resource.topG24K.length && resource.topG24K[0].G24KgrossAmount ? parseFloat(resource.topG24K[0].G24KgrossAmount.toJSON().$numberDecimal) : "0.00",
            grossrate99 = resource.topS99P && resource.topS99P.length && resource.topS99P[0].S99PgrossAmount ? parseFloat(resource.topS99P[0].S99PgrossAmount.toJSON().$numberDecimal) : "0.00";
          var Final = {
            "G24K": netrate24.netrate.toString(),
            "S99P": netrate99.netrate.toString(),
            "G24Kgross": grossrate24.toString(),
            "S99Pgross": grossrate99.toString()
          };
        } else {
          var Final = {
            "G24K": "0.00",
            "S99P": "0.00",
            "G24Kgross": "0.00",
            "S99Pgross": "0.00"
          };
        }



        res.send({ status: "200", resource: Final });

      }
    }
    )
}


exports.top_assetmanager_for_purchase = function (req, res) {
  var Gen = req.generalCharges;
  var countrycode = req.body.countrycode;
  var clientTxnLoading = req.body.clientTxnLoading ? req.body.clientTxnLoading : 0;

  Stock.aggregate([
    {
      $facet: {
        topG24K: [
          {
            $project: {
              truID: 1, G24Kgross: "$G24K.grossAmount", G24K: "$G24K.netAmount", stock: 1, statusA: { $gt: ["$G24K.netAmount", 0.1] },
              statusG: { $gt: ["$G24K.netAmount", 0.1] }, statusS: { $gt: ["$stock.G24K", 0.1] }
            }
          },
          { $match: { $and: [{ statusA: true }, { statusS: true }, { statusG: true }] } },
          { $sort: { G24K: 1 } },
          {
            $lookup: {
              from: "kycs",
              localField: "truID",
              foreignField: "truID",
              as: "assetmanager"
            }
          },
          { "$unwind": { "path": "$assetmanager", "preserveNullAndEmptyArrays": true } },
          {
            $project: {
              truID: 1, G24K: 1, stock: 1, KYCFlag: "$assetmanager.KYCFlag", "assetmanagerName": "$assetmanager.assetmanagerName", G24Kgross: 1,
              isInsolventbyC: "$assetmanager.isInsolventbyC", Address: "$assetmanager.contactAddress", countryCode: "$assetmanager.countryCode", image: "$assetmanager.image"
            }
          },
          { $match: { KYCFlag: "active" } },
          {
            $project: {
              truID: 1, G24K: 1, stock: 1, "assetmanagerName": 1, houseNumber: "$Address.houseNumber", G24Kgross: 1,
              streetNumber: "$Address.streetNumber", landmark: "$Address.landmark", pin: "$Address.pin",
              city: "$Address.city", KYCFlag: 1, country: "$Address.country", countryCode: 1, image: 1
            }
          },
          { $match: { countryCode: countrycode } },
          { $limit: 3 }
        ],
        topS99P: [
          {
            $project: {
              truID: 1, S99Pgross: "$S99P.grossAmount", S99P: "$S99P.netAmount", stock: 1, statusA: { $gt: ["$S99P.netAmount", 0.1] },
              statusG: { $gt: ["$S99P.grossAmount", 0.1] }, statusS: { $gt: ["$stock.S99P", 0.1] }
            }
          },
          { $match: { $and: [{ statusA: true }, { statusS: true }, { statusG: true }] } },
          { $sort: { S99P: 1 } },
          {
            $lookup: {
              from: "kycs",
              localField: "truID",
              foreignField: "truID",
              as: "assetmanager"
            }
          },
          { "$unwind": { "path": "$assetmanager", "preserveNullAndEmptyArrays": true } },
          {
            $project: {
              truID: 1, S99P: 1, stock: 1, KYCFlag: "$assetmanager.KYCFlag", "assetmanagerName": "$assetmanager.assetmanagerName", S99Pgross: 1,
              isInsolventbyC: "$assetmanager.isInsolventbyC", Address: "$assetmanager.contactAddress", countryCode: "$assetmanager.countryCode", image: "$assetmanager.image"
            }
          },
          { $match: { KYCFlag: "active" } },
          {
            $project: {
              truID: 1, S99P: 1, stock: 1, "assetmanagerName": 1, houseNumber: "$Address.houseNumber", S99Pgross: 1,
              streetNumber: "$Address.streetNumber", landmark: "$Address.landmark", pin: "$Address.pin",
              city: "$Address.city", KYCFlag: 1, country: "$Address.country", countryCode: 1, image: 1
            }
          },
          { $match: { countryCode: countrycode } },
          { $limit: 3 }
        ]
      }
    }]).exec(function (err, result) {
      if (err) {
        res.status(500).send({ error: err })
      }

      else {
        var resource = result[0];
        var arr24 = new Array();
        var assetmanagercharges = parseFloat(Gen.assetmanagercharges);
        var othercharges = parseFloat(Gen.othercharges);
        for (var i = 0; i < resource.topG24K.length; i++) {
          var topG24K = resource.topG24K[i];
          var g24kgrossrate = parseFloat(topG24K.G24Kgross.toJSON().$numberDecimal);
          var ayy24K = {};
          var rateArr = calculateRate(Gen, g24kgrossrate, "buy", clientTxnLoading);
          ayy24K["truID"] = topG24K.truID;
          ayy24K["G24K"] = rateArr.netrate;
          ayy24K["G24Kgross"] = (g24kgrossrate).toString();
          ayy24K["stockG24K"] = topG24K.stock.G24K.toJSON().$numberDecimal;;
          ayy24K["city"] = topG24K.city;
          ayy24K["assetmanagerName"] = topG24K.assetmanagerName;
          ayy24K["houseNumber"] = topG24K.houseNumber;
          ayy24K["streetNumber"] = topG24K.streetNumber;
          ayy24K["landmark"] = topG24K.landmark;
          ayy24K["pin"] = topG24K.pin;
          ayy24K["image"] = topG24K.image;
          arr24.push(ayy24K);

        }
        var arr99 = new Array();
        for (var i = 0; i < resource.topS99P.length; i++) {
          var topS99P = resource.topS99P[i];
          var s99pgrossrate = parseFloat(topS99P.S99Pgross.toJSON().$numberDecimal);
          var ayy99K = {};

          var rateArr = calculateRate(Gen, s99pgrossrate, "buy", clientTxnLoading);
          ayy99K["truID"] = topS99P.truID;
          ayy99K["S99P"] = rateArr.netrate;
          ayy99K["S99Pgross"] = (s99pgrossrate).toString();
          ayy99K["stockS99P"] = topS99P.stock.S99P.toJSON().$numberDecimal;
          ayy99K["city"] = topS99P.city;
          ayy99K["assetmanagerName"] = topS99P.assetmanagerName;
          ayy99K["houseNumber"] = topS99P.houseNumber;
          ayy99K["streetNumber"] = topS99P.streetNumber;
          ayy99K["landmark"] = topS99P.landmark;
          ayy99K["pin"] = topS99P.pin;
          ayy99K["image"] = topS99P.image;
          arr99.push(ayy99K);

        }
        request.post({
          "headers": { "content-type": "application/json" },
          "url": reqip + ":4114/api/listallchargesconsumer",
          "body": JSON.stringify({
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);

          var Final = ({
            "topG24K": arr24, "topS99P": arr99,
            "tax": newjson.resource.tax.toString()
          })
          res.json({ status: "200", resource: Final });
        })
      }
    })
}



exports.top_assetmanager_for_sale = function (req, res) {
  var Gen = req.generalCharges;
  var city = req.body.city;
  var country = req.body.country;
  var countrycode = req.body.countrycode;
  var flag = req.body.flag;
  var clientTxnLoading = req.body.clientTxnLoading ? req.body.clientTxnLoading : 0;

  Stock.aggregate([
    {
      $facet: {
        topG24K: [
          {
            $project: {
              truID: 1, G24K: "$G24KSale.netAmount", stock: 1, statusA: { $gt: ["$G24KSale.netAmount", 0.1] },
              G24KCoin: "$G24KSale.netAmountCoin", statusC: { $gt: ["$G24KSale.netAmountCoin", 0] },
              G24Kgross: "$G24KSale.grossAmount", statusG: { $gt: ["$G24KSale.grossAmount", 0] },
              statusS: { $gt: ["$stock.G24K", 0] }
            }
          },
          { $match: { $and: [{ statusA: true }, { statusC: true }, { statusG: true }, { statusS: true }] } },
          { $sort: { G24K: -1 } },
          {
            $lookup: {
              from: "kycs",
              localField: "truID",
              foreignField: "truID",
              as: "assetmanager"
            }
          },
          { "$unwind": { "path": "$assetmanager", "preserveNullAndEmptyArrays": true } },
          {
            $project: {
              truID: 1, G24K: 1, stock: 1, KYCFlag: "$assetmanager.KYCFlag", "assetmanagerName": "$assetmanager.assetmanagerName", G24KCoin: 1, G24Kgross: 1,
              isInsolventbyC: "$assetmanager.isInsolventbyC", Address: "$assetmanager.contactAddress", countryCode: "$assetmanager.countryCode", image: "$assetmanager.image"
            }
          },
          { $match: { KYCFlag: "active" } },
          {
            $project: {
              truID: 1, G24K: 1, stock: 1, "assetmanagerName": 1, houseNumber: "$Address.houseNumber", G24KCoin: 1, G24Kgross: 1,
              streetNumber: "$Address.streetNumber", landmark: "$Address.landmark", pin: "$Address.pin",
              city: "$Address.city", KYCFlag: 1, country: "$Address.country", countryCode: 1, image: 1
            }
          },
          { $match: { countryCode: countrycode } },
          { $limit: 3 }
        ],
        topS99P: [
          {
            $project: {
              truID: 1, S99P: "$S99PSale.netAmount", stock: 1, statusA: { $gt: ["$S99PSale.netAmount", 0.1] },
              S99PCoin: "$S99PSale.netAmountCoin", statusC: { $gt: ["$S99PSale.netAmountCoin", 0] },
              S99Pgross: "$S99PSale.grossAmount", statusG: { $gt: ["$S99PSale.grossAmount", 0] },
              statusS: { $gt: ["$stock.S99P", 0] }
            }
          },
          { $match: { $and: [{ statusA: true }, { statusS: true }] } },
          { $sort: { S99P: -1 } },
          {
            $lookup: {
              from: "kycs",
              localField: "truID",
              foreignField: "truID",
              as: "assetmanager"
            }
          },
          { "$unwind": { "path": "$assetmanager", "preserveNullAndEmptyArrays": true } },
          {
            $project: {
              truID: 1, S99P: 1, stock: 1, KYCFlag: "$assetmanager.KYCFlag", "assetmanagerName": "$assetmanager.assetmanagerName", S99Pgross: 1, S99PCoin: 1,
              isInsolventbyC: "$assetmanager.isInsolventbyC", Address: "$assetmanager.contactAddress", countryCode: "$assetmanager.countryCode", image: "$assetmanager.image"
            }
          },
          { $match: { KYCFlag: "active" } },
          {
            $project: {
              truID: 1, S99P: 1, stock: 1, "assetmanagerName": 1, houseNumber: "$Address.houseNumber", S99Pgross: 1, S99PCoin: 1,
              streetNumber: "$Address.streetNumber", landmark: "$Address.landmark", pin: "$Address.pin",
              city: "$Address.city", KYCFlag: 1, country: "$Address.country", countryCode: 1, image: 1
            }
          },
          { $match: { countryCode: countrycode } },
          { $limit: 3 }
        ]
      }
    }]).exec(function (err, result) {
      if (err) {
        res.status(500).send({ error: err })
      }

      else {
        var resource = result[0];
        var arr24 = new Array();
        for (var i = 0; i < resource.topG24K.length; i++) {
          var topG24K = resource.topG24K[i];
          var g24kgrossrate = parseFloat(topG24K.G24Kgross.toJSON().$numberDecimal);
          var ayy24K = {};

          ayy24K["truID"] = topG24K.truID;
          var rateArr = calculateRate(Gen, g24kgrossrate, flag, clientTxnLoading);
          var g24krate = rateArr.netrate;
          // }
          ayy24K["G24K"] = g24krate.toString();
          // ayy24K["G24KCoin"] = (g24kgrossrate - (g24kgrossrate * othercharges)).toString();
          ayy24K["G24Kgross"] = (g24kgrossrate).toString();
          ayy24K["stockG24K"] = topG24K.stock.G24K.toJSON().$numberDecimal;
          ayy24K["city"] = topG24K.city;
          ayy24K["assetmanagerName"] = topG24K.assetmanagerName;
          ayy24K["houseNumber"] = topG24K.houseNumber;
          ayy24K["streetNumber"] = topG24K.streetNumber;
          ayy24K["landmark"] = topG24K.landmark;
          ayy24K["pin"] = topG24K.pin;
          ayy24K["image"] = topG24K.image;
          arr24.push(ayy24K);
        }
        var arr99 = new Array();
        for (var i = 0; i < resource.topS99P.length; i++) {
          var topS99P = resource.topS99P[i];
          var s99pgrossrate = parseFloat(topS99P.S99Pgross.toJSON().$numberDecimal);
          var ayy99K = {};
          var rateArr = calculateRate(Gen, s99pgrossrate, flag, clientTxnLoading);
          var s99prate = rateArr.netrate;
          // }
          ayy99K["truID"] = topS99P.truID;
          ayy99K["S99P"] = s99prate.toString();
          ayy99K["S99Pgross"] = (s99pgrossrate).toString();
          ayy99K["stockS99P"] = topS99P.stock.S99P.toJSON().$numberDecimal;
          ayy99K["city"] = topS99P.city;
          ayy99K["assetmanagerName"] = topS99P.assetmanagerName;
          ayy99K["houseNumber"] = topS99P.houseNumber;
          ayy99K["streetNumber"] = topS99P.streetNumber;
          ayy99K["landmark"] = topS99P.landmark;
          ayy99K["pin"] = topS99P.pin;
          ayy99K["image"] = topS99P.image;
          arr99.push(ayy99K);
        }
        var Final = {
          "topG24K": arr24, "topS99P": arr99
        }

        res.json({ status: "200", resource: Final });
      }
    });
}


exports.read_liveBuySell_rate = function (req, res) {
  var Gen = req.generalCharges;
  Stock.aggregate([
    { $match: { truID: req.body.truID } },
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
  ]).exec(function (err, result) {
    if (err) {
      response.status(500).send({ error: err })
      return next(err);
    }
    else {
      var resultobj = {};
      var resource = result[0];
      var buyCharges = 0, sellCharges = 0;
      if (req.body.allCharges) {
        buyCharges = req.body.allCharges.buyCharges;
        sellCharges = req.body.allCharges.sellCharges;
      }
      var clientCharges = req.body.clientTxnLoading ? req.body.clientTxnLoading : 0
      var g24kgrossrate = resource.G24Kgross ? calculateRate(Gen, resource.G24Kgross, "buy", buyCharges) : "0.00",
        S99Pgrossrate = resource.S99Pgross ? calculateRate(Gen, resource.S99Pgross, "buy", buyCharges) : "0.00";

      var g24krate = resource.G24KSalegross ? calculateRate(Gen, resource.G24KSalegross, "redeemCash", sellCharges) : "0.00",
        s99prate = resource.S99PSalegross ? calculateRate(Gen, resource.S99PSalegross, "redeemCash", sellCharges) : "0.00";

      resultobj["G24Kgross"] = resource.G24Kgross;
      resultobj["S99Pgross"] = resource.S99Pgross;

      resultobj["G24KSaleRate"] = g24krate.netrate;
      resultobj["S99PSaleRate"] = s99prate.netrate;

      resultobj["G24K"] = (g24kgrossrate.netrate).toFixed(10);
      resultobj["S99P"] = (S99Pgrossrate.netrate).toFixed(10);
      res.json({ status: "200", resource: resultobj });
    }
  })
}

exports.update_stock_qty_buy = function (req, res) {
  var truid = req.body.truid;
  KycAll.find({ truID: truid }, function (err, docs) {
    if (!docs.length) {
      res.json({
        status: "204",
        message: 'The request was successful but no TruID was returned.'
      });
    }
    else {
      var txnType = req.body.txnType;

      Stock.aggregate([
        { $match: { truID: truid } },
        {
          $project: {
            _id: 0, truID: 1,
            strockG24K: "$stock.G24K",
            strockS99P: "$stock.S99P"
          }
        }
      ]).exec(async function (err, result) {
        if (err) {
          console.log("err", err);
        } else {
          if (!result.length) {
            res.status(500).json({ status: "500", message: "Internal Server Error." });
          } else {
            var Qty = parseFloat(req.body.qty);
            var stkID = "S" + createInvoice();
            var Cr = 0, Dr = 0;
            let isexecuteQuery = true;
            switch (txnType) {
              case "buy":
                Dr = Qty * -1;
                break;
              case "buyCash":
                Dr = Qty * -1;
                break;
              case "redeemCash":
                Cr = Qty;
                break;
                break;
              default:
            }
            if (isexecuteQuery === true) {
              var previousStock = 0, currentStock = 0;
              switch (req.body.bulliontype) {
                case "G24K":
                  previousStock = parseFloat(result[0].strockG24K.toJSON().$numberDecimal);
                  currentStock = parseFloat(result[0].strockG24K.toJSON().$numberDecimal) + Cr + Dr;
                  break;
                case "S99P":
                  previousStock = parseFloat(result[0].strockS99P.toJSON().$numberDecimal);
                  currentStock = parseFloat(result[0].strockS99P.toJSON().$numberDecimal) + Cr + Dr;
                  break;
                default:
              }
              const txnstock = {};
              txnstock.stockID = stkID;
              txnstock.truID = truid;
              txnstock.createDate = new Date();
              txnstock.invoice = req.body.invoice;
              txnstock.tType = txnType;
              txnstock.bullionType = req.body.bulliontype;
              txnstock.Cr = Cr;
              txnstock.Dr = Dr;
              txnstock.currentStock = currentStock;
              txnstock.previousStock = previousStock;
              txnstock.againstTruID = req.body.totruid;
              txnstock.status = "success";
              txnstock.hash = encryption(JSON.stringify(txnstock));
              var insertTXN = new txnStocklogs(txnstock);
              await insertTXN.save(function (err) {
                if (err) {
                  res.json({ status: "500", message: "Internal Server Error" });
                } else {
                  var query;
                  if (Dr < 0) {
                    query = (req.body.bulliontype === "G24K") ? { $inc: { "stock.G24K": Dr } } : { $inc: { "stock.S99P": Dr } };
                  } else {
                    query = (req.body.bulliontype === "G24K") ? { $inc: { "stock.G24K": Cr } } : { $inc: { "stock.S99P": Cr } };
                  }
                  if (query) {
                    Stock.findOneAndUpdate({ truID: truid }, query).exec(function (err, result) {
                      if (err) {
                        console.error(err);
                        res.status(500).json({ status: "500", message: "Internal Server Error." });
                      }
                      else {
                        res.json({ status: "200", message: "Stock updated successfully." });
                      }
                    });
                  }
                }
              })
            } else {
              res.json({ status: "400", message: "Invalid Transaction Type." });
            }

          }
        }
      })
    }
  })
}

exports.list_rate_for_cust_buyCash = function (req, res) {
  var Gen = req.generalCharges;
  var truid24 = req.body.truid24;
  var truid22 = req.body.truid22;
  var truid18 = req.body.truid18;
  var truid99 = req.body.truid99;

  Stock.aggregate([
    {
      $facet: {
        G24: [
          { $match: { truID: truid24 } },
          { $project: { netAmount: "$G24K.grossAmount", _id: 0 } }
        ],
        G22: [
          { $match: { truID: truid22 } },
          { $project: { netAmount: "$G22K.grossAmount", _id: 0 } }
        ],
        G18: [
          { $match: { truID: truid18 } },
          { $project: { netAmount: "$G18K.grossAmount", _id: 0 } }
        ],
        S99: [
          { $match: { truID: truid99 } },
          { $project: { netAmount: "$S99P.grossAmount", _id: 0 } }
        ]
      }
    },
    { $unwind: { path: "$G24", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$G22", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$G18", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$S99", preserveNullAndEmptyArrays: true } },
    { $project: { G24: "$G24.netAmount", G22: "$G22.netAmount", G18: "$G18.netAmount", S99: "$S99.netAmount" } }
  ]).exec(function (err, result) {
    if (err) {
      response.status(500).send({ error: err })
      return next(err);
    }
    else {
      var resource = result[0];
      var g24 = 0
      if (resource.G24) {
        var rateArr = calculateRate(Gen, resource.G24.toJSON().$numberDecimal, "buy", 0);
        g24 = rateArr.netrate;
        // g24 = resource.G24.toJSON().$numberDecimal;
      }

      var g22 = 0
      if (resource.G22) {
        var rateArr = calculateRate(Gen, resource.G22.toJSON().$numberDecimal, "buy", 0);
        g22 = rateArr.netrate;
        // g22 = resource.G22.toJSON().$numberDecimal;
      }

      var g18 = 0
      if (resource.G18) {
        var rateArr = calculateRate(Gen, resource.G18.toJSON().$numberDecimal, "buy", 0);
        g18 = rateArr.netrate;
        // g18 = resource.G18.toJSON().$numberDecimal;
      }

      var s99 = 0
      if (resource.S99) {
        var rateArr = calculateRate(Gen, resource.S99.toJSON().$numberDecimal, "buy", 0);
        s99 = rateArr.netrate;
        // s99 = resource.S99.toJSON().$numberDecimal;
      }

      var Final = ({ "G24K": g24, "G22K": g22, "G18K": g18, "S99P": s99 });
      res.json({ status: "200", resource: Final });
    }
  }
  )
}

exports.validate_stock = function (req, res) {
  var truid24 = req.body.truid24 ? req.body.truid24 : "0";
  var truid99 = req.body.truid99 ? req.body.truid99 : "0";
  var truID = truid24 && truid24 != "0" ? truid24 : truid99;
  var g24 = req.body.g24 ? parseFloat(req.body.g24) : 0;
  var s99 = req.body.s99 ? parseFloat(req.body.s99) : 0;
  Stock.aggregate([{ $match: { truID: truID } },
  {
    $project: {
      _id: 0,
      status24: {
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
      response.status(500).send({ status: "500", message: err })
      return next(err);
    }
    else {
      if (result.length > 0) {
        var resource = result[0];
        if (req.body.g24 && parseFloat(req.body.g24) > 0 && req.body.s99 && parseFloat(req.body.s99) > 0) {
          if (resource.status24 && resource.status99) {
            res.json({ status: "200", message: "You can proceed" });
          }
          else if (!resource.status24) {
            res.json({ status: "401", message: "TruGold stock not available. Please contact administrator" });
          }
          else if (!resource.status99) {
            res.json({ status: "401", message: "TruSilver stock not available. Please contact administrator" });
          }
        }
        else if (req.body.g24 && parseFloat(req.body.g24) > 0) {
          if (resource.status24) {
            res.json({ status: "200", message: "You can proceed" });
          }
          else if (!resource.status24) {
            res.json({ status: "401", message: "TruGold stock not available. Please contact administrator" });
          }
        }
        else if (req.body.s99 && parseFloat(req.body.s99) > 0) {
          if (resource.status99) {
            res.json({ status: "200", message: "You can proceed" });
          }
          else if (!resource.status99) {
            res.json({ status: "401", message: "TruSilver stock not available. Please contact administrator" });
          }
        }
        else {
          res.json({ status: "401", message: "Invalid Request" });
        }
      }
      else {
        res.json({ status: "401", message: "Invalid Request" });
      }
    }
  })
}

exports.validate_stock_trans = function (req, res) {
  var stock = new Stock(req.user);

  var truid = req.body.truid;
  var sfromtruid = "6000";


  KycAll.find({
    "truID": truid
  }, function (err, docs) {
    if (!docs.length) {
      res.json({
        status: "204",
        message: "You have choosen wrong assetmanager."
      });
    } else {
      var qty = parseFloat(req.body.qty);

      if (isNaN(qty)) { var qty = parseFloat("0"); }
      else { var qty = qty };
      var reqresult;
      var bulltype = req.body.bulltype;
      if (bulltype === "G24K") {
        reqresult = Stock.aggregate([
          {
            $facet: {
              G24: [
                { $match: { truID: truid } },
                {
                  $project: {
                    _id: 0,
                    status: {
                      $cond: {
                        if: { $and: [{ $gte: ["$stock.G24K", { $toDecimal: qty }] }, { $gte: ["$stock.G24K", 0] }] },
                        then: "resolve", else: "$stock.G24K"
                      }
                    }
                  }
                }],
            }
          },
          { $unwind: "$G24" },
          { $project: { status: "$G24.status" } }
        ])
      }

      if (bulltype === "G22K") {

        reqresult = Stock.aggregate([
          {
            $facet: {
              G22: [
                { $match: { truID: truid } },
                {
                  $project: {
                    _id: 0,
                    status: {
                      $cond: {
                        if: { $and: [{ $gte: ["$stock.G22K", { $toDecimal: qty }] }, { $gte: ["$stock.G22K", 0] }] },
                        then: "resolve", else: "$stock.G22K"
                      }
                    }
                  }
                }],
            }
          },
          { $unwind: "$G22" },
          { $project: { status: "$G22.status" } }
        ])
      }
      if (bulltype === "G18K") {

        reqresult = Stock.aggregate([
          {
            $facet: {
              G18: [
                { $match: { truID: truid } },
                {
                  $project: {
                    _id: 0,
                    status: {
                      $cond: {
                        if: { $and: [{ $gte: ["$stock.G18K", { $toDecimal: qty }] }, { $gte: ["$stock.G18K", 0] }] },
                        then: "resolve", else: "$stock.G18K"
                      }
                    }
                  }
                }],
            }
          },
          { $unwind: "$G18" },
          { $project: { status: "$G18.status" } }
        ])
      }
      if (bulltype === "S99P") {

        reqresult = Stock.aggregate([
          {
            $facet: {
              S99: [
                { $match: { truID: truid } },
                {
                  $project: {
                    _id: 0,
                    status: {
                      $cond: {
                        if: { $and: [{ $gte: ["$stock.S99P", { $toDecimal: qty }] }, { $gte: ["$stock.S99P", 0] }] },
                        then: "resolve", else: "$stock.S99P"
                      }
                    }
                  }
                }],
            }
          },
          { $unwind: "$S99" },
          { $project: { status: "$S99.status" } }
        ])
      }
      reqresult.exec(function (err, result) {
        if (err) {
          response.status(500).send({ error: err })
          return next(err);
        }
        else {
          res.send({ status: "200", stockstatus: result[0].status })
        }
      }
      )
    }
  }
  )
}


exports.list_rate_cust_buy_bullions = function (req, res) {
  var badd = new Stock(req.user);
  var Gen = req.generalCharges;
  var truid = req.body.truid;
  var clientcharges = req.body.clientcharges;
  var bulltype = req.body.bulltype;
  var reqresult;

  if (bulltype === "G24K") {
    reqresult = Stock.aggregate([
      { $match: { truID: truid } },
      { $project: { truID: 1, rate: "$G24K.grossAmount", _id: 0 } },
      {
        $lookup: {
          from: "kycs",
          localField: "truID",
          foreignField: "truID",
          as: "assetmanager"
        }
      },
      { $unwind: "$assetmanager" },
      { $project: { rate: 1, assetmanagerName: "$assetmanager.companyName", _id: 0 } },
    ]);
  }
  if (bulltype === "G22K") {
    reqresult = Stock.aggregate([
      { $match: { truID: truid } },
      { $project: { truID: 1, rate: "$G22K.grossAmount", _id: 0 } },
      {
        $lookup: {
          from: "kycs",
          localField: "truID",
          foreignField: "truID",
          as: "assetmanager"
        }
      },
      { $unwind: "$assetmanager" },
      { $project: { rate: 1, assetmanagerName: "$assetmanager.companyName", _id: 0 } },
    ]);
  }
  if (bulltype === "G18K") {
    reqresult = Stock.aggregate([
      { $match: { truID: truid } },
      { $project: { truID: 1, rate: "$G18K.grossAmount", _id: 0 } },
      {
        $lookup: {
          from: "kycs",
          localField: "truID",
          foreignField: "truID",
          as: "assetmanager"
        }
      },
      { $unwind: "$assetmanager" },
      { $project: { rate: 1, assetmanagerName: "$assetmanager.companyName", _id: 0 } },
    ]);
  }
  if (bulltype === "S99P") {
    reqresult = Stock.aggregate([
      { $match: { truID: truid } },
      { $project: { truID: 1, rate: "$S99P.grossAmount", _id: 0 } },
      {
        $lookup: {
          from: "kycs",
          localField: "truID",
          foreignField: "truID",
          as: "assetmanager"
        }
      },
      { $unwind: "$assetmanager" },
      { $project: { rate: 1, assetmanagerName: "$assetmanager.companyName", _id: 0 } },
    ]);
  }
  reqresult.exec(function (err, result) {
    if (err) {
      res.json({ status: "500" });
    }
    else {
      if (!result.length) {
        res.json({ status: "204", resource: "assetmanager not exist or rate not Set" });
      } else {
        var resource = result[0];
        var rate = 0;
        if (resource.rate) {
          rate = calculateRate(Gen, resource.rate.toJSON().$numberDecimal, "buy", clientcharges);
        }
        res.json({ status: "200", resource: rate.netrate, grossRate: resource.rate.toJSON().$numberDecimal, baseRate: rate.baseAmount, assetmanagerName: resource.assetmanagerName });
      }
    }
  })
}

exports.live_rate_for_txn = function (req, res) {
  var Gen = req.generalCharges;
  var countrycode = req.body.countrycode;
  var clientcharges = req.body.clientcharges;
  Stock.aggregate([
    {
      $facet: {
        topG24K: [
          { $project: { truID: 1, G24K: "$G24K.grossAmount", stock: 1, statusA: { $gt: ["$G24K.grossAmount", 0.1] }, statusS: { $gt: ["$stock.G24K", 0] } } },
          { $match: { $and: [{ statusA: true }, { statusS: true }] } },
          { $sort: { G24K: 1 } },
          {
            $lookup: {
              from: "kycs",
              localField: "truID",
              foreignField: "truID",
              as: "assetmanager"
            }
          },
          { "$unwind": { "path": "$assetmanager", "preserveNullAndEmptyArrays": true } },
          {
            $project: {
              truID: 1, G24K: 1, stock: 1, KYCFlag: "$assetmanager.KYCFlag", "assetmanagerName": "$assetmanager.assetmanagerName",
              isInsolventbyC: "$assetmanager.isInsolventbyC", Address: "$assetmanager.contactAddress", countryCode: "$assetmanager.countryCode"
            }
          },
          { $match: { KYCFlag: "active" } },
          {
            $project: {
              _id: 0, truID: 1, G24K: 1, "assetmanagerName": 1, countryCode: 1
            }
          },
          { $match: { countryCode: countrycode } },
          { $limit: 1 }
        ],

        topS99P: [
          { $project: { truID: 1, S99P: "$S99P.grossAmount", stock: 1, statusA: { $gt: ["$S99P.grossAmount", 0.1] }, statusS: { $gt: ["$stock.S99P", 0] } } },
          { $match: { $and: [{ statusA: true }, { statusS: true }] } },
          { $sort: { S99P: 1 } },
          {
            $lookup: {
              from: "kycs",
              localField: "truID",
              foreignField: "truID",
              as: "assetmanager"
            }
          },
          { "$unwind": { "path": "$assetmanager", "preserveNullAndEmptyArrays": true } },
          {
            $project: {
              truID: 1, S99P: 1, stock: 1, KYCFlag: "$assetmanager.KYCFlag", "assetmanagerName": "$assetmanager.assetmanagerName",
              isInsolventbyC: "$assetmanager.isInsolventbyC", Address: "$assetmanager.contactAddress", countryCode: "$assetmanager.countryCode"
            }
          },
          { $match: { KYCFlag: "active" } },
          {
            $project: {
              _id: 0, truID: 1, S99P: 1, "assetmanagerName": 1, countryCode: 1
            }
          },
          { $match: { countryCode: countrycode } },
          { $limit: 1 }
        ]
      }
    }]).exec(function (err, result) {
      if (err) {
        res.send({ status: "204", message: "Something went wrong!" });
      }
      else {
        var resource = result[0];
        var netrate24 = resource.topG24K && resource.topG24K.length && resource.topG24K[0].G24K ? calculateRate(Gen, resource.topG24K[0].G24K.toJSON().$numberDecimal, "buy", clientcharges) : "0.00",
          netrate99 = resource.topS99P && resource.topS99P.length && resource.topS99P[0].S99P ? calculateRate(Gen, resource.topS99P[0].S99P.toJSON().$numberDecimal, "buy", clientcharges) : "0.00";

        var grossrate24 = resource.topG24K && resource.topG24K.length && resource.topG24K[0].G24K ? parseFloat(resource.topG24K[0].G24K.toJSON().$numberDecimal) : "0.00",
          grossrate99 = resource.topS99P && resource.topS99P.length && resource.topS99P[0].S99P ? parseFloat(resource.topS99P[0].S99P.toJSON().$numberDecimal) : "0.00";

        var amtruid24 = resource.topG24K && resource.topG24K.length && resource.topG24K[0].truID ? resource.topG24K[0].truID : "0",
          amtruid99 = resource.topS99P && resource.topS99P.length && resource.topS99P[0].truID ? resource.topS99P[0].truID : "0";

        var amtruid24name = resource.topG24K && resource.topG24K.length && resource.topG24K[0].assetmanagerName ? resource.topG24K[0].assetmanagerName : "0",
          amtruid99name = resource.topS99P && resource.topS99P.length && resource.topS99P[0].assetmanagerName ? resource.topS99P[0].assetmanagerName : "0";

        var Final = {
          "G24K": grossrate24, "S99P": grossrate99,
          "netRateG24K": netrate24.netrate, "netRateG22K": "0", "netRateG18K": "0", "netRateS99P": netrate99.netrate,
          "baseRateG24K": netrate24.baseAmount, "baseRateG22K": "0", "baseRateG18K": "0", "baseRateS99P": netrate99.baseAmount,
          "amTruID24": amtruid24, "amTruID22": "0", "amTruID18": "0", "amTruID99": amtruid99,
          "amTruID24Name": amtruid24name, "amTruID22Name": "0", "amTruID18Name": "0", "amTruID99Name": amtruid99name
        };

        res.send({ status: "200", resource: Final });

      }
    }
    )
}
exports.list_rate_cust_redeem_cash_bullions = function (req, res) {
  var badd = new Stock(req.user);
  var truid = req.body.truid;
  var Gen = req.generalCharges;
  var clientcharges = req.body.clientcharges;
  var bulltype = req.body.bulltype;
  var reqresult;

  if (bulltype === "G24K") {
    reqresult = Stock.aggregate([
      { $match: { truID: truid } },
      { $project: { truID: 1, rate: "$G24KSale.grossAmount", _id: 0 } },
      {
        $lookup: {
          from: "kycs",
          localField: "truID",
          foreignField: "truID",
          as: "assetmanager"
        }
      },
      { $unwind: "$assetmanager" },
      { $project: { rate: 1, assetmanagerName: "$assetmanager.companyName", _id: 0 } },
    ]);
  }
  if (bulltype === "G22K") {
    reqresult = Stock.aggregate([
      { $match: { truID: truid } },
      { $project: { truID: 1, rate: "$G22KSale.grossAmount", _id: 0 } },
      {
        $lookup: {
          from: "kycs",
          localField: "truID",
          foreignField: "truID",
          as: "assetmanager"
        }
      },
      { $unwind: "$assetmanager" },
      { $project: { rate: 1, assetmanagerName: "$assetmanager.companyName", _id: 0 } },
    ]);
  }
  if (bulltype === "G18K") {
    reqresult = Stock.aggregate([
      { $match: { truID: truid } },
      { $project: { truID: 1, rate: "$G18KSale.grossAmount", _id: 0 } },
      {
        $lookup: {
          from: "kycs",
          localField: "truID",
          foreignField: "truID",
          as: "assetmanager"
        }
      },
      { $unwind: "$assetmanager" },
      { $project: { rate: 1, assetmanagerName: "$assetmanager.companyName", _id: 0 } },
    ]);
  }
  if (bulltype === "S99P") {
    reqresult = Stock.aggregate([
      { $match: { truID: truid } },
      { $project: { truID: 1, rate: "$S99PSale.grossAmount", _id: 0 } },
      {
        $lookup: {
          from: "kycs",
          localField: "truID",
          foreignField: "truID",
          as: "assetmanager"
        }
      },
      { $unwind: "$assetmanager" },
      { $project: { rate: 1, assetmanagerName: "$assetmanager.companyName", _id: 0 } },
    ]);
  }
  reqresult.exec(function (err, result) {
    if (err) {
      res.json({ status: "500" });
    }
    else {
      var resource = result[0];
      var rate = 0;
      if (resource.rate) {
        rate = calculateRate(Gen, resource.rate.toJSON().$numberDecimal, "redeemCash", clientcharges);
      }
      res.json({ status: "200", resource: rate.netrate, grossRate: resource.rate.toJSON().$numberDecimal, baseRate: rate.baseAmount, assetmanagerName: resource.assetmanagerName });
      // res.json({ status: "200", resource: rate, assetmanagerName: resource.assetmanagerName });
    }
  }
  )
}

exports.list_rate_for_cust_redeem = function (req, res) {
  var badd = new Stock(req.user);
  var truid24 = req.body.truid24;
  var truid22 = req.body.truid22;
  var truid18 = req.body.truid18;
  var truid99 = req.body.truid99;

  Stock.aggregate([
    {
      $facet: {
        G24: [
          { $match: { truID: truid24 } },
          { $project: { grossAmount: "$G24KSale.grossAmount", _id: 0, truID: 1 } },
          {
            $lookup: {
              from: "kycs",
              localField: "truID",
              foreignField: "truID",
              as: "assetmanager"
            }
          },
          { $unwind: "$assetmanager" },
          { $project: { grossAmount: 1, address: "$assetmanager.companyOperationAddress" } },
        ],
        G22: [
          { $match: { truID: truid22 } },
          { $project: { grossAmount: "$G22KSale.grossAmount", _id: 0, truID: 1 } },
          {
            $lookup: {
              from: "kycs",
              localField: "truID",
              foreignField: "truID",
              as: "assetmanager"
            }
          },
          { $unwind: "$assetmanager" },
          { $project: { grossAmount: 1, address: "$assetmanager.companyOperationAddress" } },
        ],
        G18: [
          { $match: { truID: truid18 } },
          { $project: { grossAmount: "$G18KSale.grossAmount", _id: 0, truID: 1 } },
          {
            $lookup: {
              from: "kycs",
              localField: "truID",
              foreignField: "truID",
              as: "assetmanager"
            }
          },
          { $unwind: "$assetmanager" },
          { $project: { grossAmount: 1, address: "$assetmanager.companyOperationAddress" } },
        ],
        S99: [
          { $match: { truID: truid99 } },
          { $project: { grossAmount: "$S99PSale.grossAmount", _id: 0, truID: 1 } },
          {
            $lookup: {
              from: "kycs",
              localField: "truID",
              foreignField: "truID",
              as: "assetmanager"
            }
          },
          { $unwind: "$assetmanager" },
          { $project: { grossAmount: 1, address: "$assetmanager.companyOperationAddress" } },
        ]
      }
    },
    { $unwind: { path: "$G24", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$G22", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$G18", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$S99", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        G24: "$G24.grossAmount", G22: "$G22.grossAmount", G18: "$G18.grossAmount", S99: "$S99.grossAmount",
        addressG24: "$G24.address", addressG22: "$G22.address", addressG18: "$G18.address", addressS99: "$S99.address"
      }
    }
  ]).exec(function (err, result) {
    if (err) {
      response.status(500).send({ error: err })
      return next(err);
    }
    else {
      var resource = result[0];

      var g24 = 0
      var address24 = 0
      if (resource.G24) {
        g24 = resource.G24.toJSON().$numberDecimal;
        address24 = resource.addressG24;
      }

      var g22 = 0
      var address22 = 0
      if (resource.G22) {
        g22 = resource.G22.toJSON().$numberDecimal;
        address22 = resource.addressG22;
      }

      var g18 = 0
      var address18 = 0
      if (resource.G18) {
        g18 = resource.G18.toJSON().$numberDecimal;
        address18 = resource.addressG18;
      }

      var s99 = 0
      var address99 = 0
      if (resource.S99) {
        s99 = resource.S99.toJSON().$numberDecimal;
        address99 = resource.addressS99;
      }

      res.json({
        status: "200",
        resource: {
          "G24K": g24, "G22K": g22, "G18K": g18, "S99P": s99,
          "address24": address24, "address22": address22, "address18": address18, "address99": address99
        }
      });
    }
  }
  )
}

exports.list_admin_wise_assetmanager_array = function (req, res) {
  var truid = req.body.truid;
  KycAll.find({ "truID": truid, parentTruID: truid, __t: "KycAll", isParent: true }, function (err, docs) {
    if (!docs.length) {
      res.json({
        status: "204",
        message: "The request was successful but no body was returned."
      })
    }
    else {

      KycAll.aggregate([
        { $match: { parentTruID: truid, __t: "KycAll" } },
        { $project: { _id: 0, truID: 1, parentTruID: 1 } },
        {
          $group: {
            _id: "$parentTruID",
            assetmanagers: { $addToSet: "$truID" }
          }
        },
        { $project: { assetmanagers: 1, _id: 0 } }
      ]).exec(function (err, result) {
        if (err) {
          response.status(500).send({ error: err })
          return next(err);
        }
        else {
          var resource = result[0].assetmanagers;
          res.json({ status: "200", assetmanager: resource })
        }
      }
      )
    }
  })
}


exports.validate_stock_client = function (req, res) {
  var totruid = req.body.amtruid;
  var g24 = req.body.bulliontype == "G24K" ? parseFloat(req.body.quantity) : 0;
  var s99 = req.body.bulliontype == "S99P" ? parseFloat(req.body.quantity) : 0;

  KycAll.find({ truID: totruid }, function (err, docs) {
    if (!docs.length) {
      res.json({
        status: "204",
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
            res.json({
              status: "200",
              message: "you can proceed."
            })
          } else if (s24 != "resolve" && s99 == "resolve") {
            res.json({
              status: "24",
              message: "Stock not available"
            })
          } else if (s24 == "resolve" && s99 != "resolve") {
            res.json({
              status: "99",
              message: "Stock not available"
            })
          }
          else {
            res.json({
              status: "401",
              message: "You have choosen wrong Consumer"
            });
          }
        }
      });
    }
  })
}

exports.top_assetmanager_for_Client = function (req, res) {
  var countrycode = req.body.countryCode;
  var transactiontype = req.body.transactiontype;
  let Gen = req.generalCharges;
  Stock.aggregate([
    {
      $facet: {
        topG24K: [
          {
            $project: {
              truID: 1, G24Kgross: "$G24K.grossAmount", G24KSalegross: "$G24KSale.grossAmount", G24K: "$G24K.netAmount", stock: 1, statusA: { $gt: ["$G24K.netAmount", 0.1] },
              statusG: { $gt: ["$G24K.netAmount", 0.1] }, statusS: { $gt: ["$stock.G24K", 0.1] }
            }
          },
          { $match: { $and: [{ statusA: true }, { statusS: true }, { statusG: true }] } },
          { $sort: { G24K: 1 } },
          {
            $lookup: {
              from: "kycs",
              localField: "truID",
              foreignField: "truID",
              as: "assetmanager"
            }
          },
          { "$unwind": { "path": "$assetmanager", "preserveNullAndEmptyArrays": true } },
          {
            $project: {
              truID: 1, G24K: 1, G24KSalegross: 1, dCRNNo: "$assetmanager.CRNNo", stock: 1, KYCFlag: "$assetmanager.KYCFlag", "assetmanagerName": "$assetmanager.assetmanagerName", G24Kgross: 1,
              isInsolventbyC: "$assetmanager.isInsolventbyC", Address: "$assetmanager.contactAddress", countryCode: "$assetmanager.countryCode", image: "$assetmanager.image"
            }
          },
          { $match: { KYCFlag: "active", } },
          {
            $project: {
              truID: 1, G24K: 1, stock: 1, G24KSalegross: 1, dCRNNo: 1, "assetmanagerName": 1, houseNumber: "$Address.houseNumber", G24Kgross: 1,
              streetNumber: "$Address.streetNumber", landmark: "$Address.landmark", pin: "$Address.pin",
              city: "$Address.city", KYCFlag: 1, country: "$Address.country", countryCode: 1, image: 1
            }
          },
          { $match: { countryCode: "+91" } },
          { $limit: 3 }
        ],
        topS99P: [
          {
            $project: {
              truID: 1, S99Pgross: "$S99P.grossAmount", S99PSalegross: "$S99PSale.grossAmount", S99P: "$S99P.netAmount", stock: 1, statusA: { $gt: ["$S99P.netAmount", 0.1] },
              statusG: { $gt: ["$S99P.grossAmount", 0.1] }, statusS: { $gt: ["$stock.S99P", 0.1] }
            }
          },
          { $match: { $and: [{ statusA: true }, { statusS: true }, { statusG: true }] } },
          { $sort: { S99P: 1 } },
          {
            $lookup: {
              from: "kycs",
              localField: "truID",
              foreignField: "truID",
              as: "assetmanager"
            }
          },
          { "$unwind": { "path": "$assetmanager", "preserveNullAndEmptyArrays": true } },
          {
            $project: {
              truID: 1, dCRNNo: "$assetmanager.CRNNo", S99P: 1, S99PSalegross: 1, stock: 1, KYCFlag: "$assetmanager.KYCFlag", "assetmanagerName": "$assetmanager.assetmanagerName", S99Pgross: 1,
              isInsolventbyC: "$assetmanager.isInsolventbyC", Address: "$assetmanager.contactAddress", countryCode: "$assetmanager.countryCode", image: "$assetmanager.image"
            }
          },
          { $match: { KYCFlag: "active", } },
          {
            $project: {
              truID: 1, S99P: 1, S99PSalegross: 1, stock: 1, dCRNNo: 1, "assetmanagerName": 1, houseNumber: "$Address.houseNumber", S99Pgross: 1,
              streetNumber: "$Address.streetNumber", landmark: "$Address.landmark", pin: "$Address.pin",
              city: "$Address.city", KYCFlag: 1, country: "$Address.country", countryCode: 1, image: 1
            }
          },
          { $match: { countryCode: countrycode } },
          { $limit: 3 }
        ]
      }
    }
  ]).exec(function (err, result) {
    if (err) {
      res.status(500).send({ error: err })
    }
    else {
      // rate = calculateRate(Gen, resource.rate.toJSON().$numberDecimal, bulltype, clientcharges);
      var resource = result[0];
      var tax = parseFloat(Gen.tax) * 100;
      var gstOnTransferFee = parseFloat(Gen.gstOnTransferFee) * 100;
      var sellTax = parseFloat(Gen.sellTax) * 100;


      var topG24K = resource.topG24K[0];
      var g24kgrossrate = (transactiontype == "sellCash" || transactiontype == "sell") ? parseFloat(topG24K.G24KSalegross.toJSON().$numberDecimal) : parseFloat(topG24K.G24Kgross.toJSON().$numberDecimal);
      var topS99P = resource.topS99P[0];
      var s99pgrossrate = (transactiontype == "sellCash" || transactiontype == "sell") ? parseFloat(topS99P.S99PSalegross.toJSON().$numberDecimal) : parseFloat(topS99P.S99Pgross.toJSON().$numberDecimal);
      var clientChargePer = req.body.trasactionCharges ? parseFloat(req.body.trasactionCharges) : 0;

      var G24KRate = calculateRate(Gen, g24kgrossrate, transactiontype, clientChargePer);
      var S99PRate = calculateRate(Gen, s99pgrossrate, transactiontype, clientChargePer);

      var g24krate = G24KRate.netrate;
      var s99rate = S99PRate.netrate;

      var ayy24K = { "truID": topS99P.truID, "rate": g24krate.toString(), "rateFrom": topG24K.assetmanagerName };

      var ayy99P = {
        "truID": topS99P.truID,
        "rate": s99rate.toString(),
        "rateFrom": topS99P.assetmanagerName
      };
      tax = transactiontype == "sell" ? sellTax : transactiontype == "transfer" ? gstOnTransferFee : tax;
      var Final;
      if (req.body.isTruID) {
        Final = ({ "status": "1000", "trucoin_24kgold": ayy24K, "trucoin_99Pure": ayy99P, "tax": tax.toString() })
      }
      else {
        delete ayy24K.truID;
        delete ayy99P.truID;
        Final = ({ "status": "1000", "trucoin_24kgold": ayy24K, "trucoin_99Pure": ayy99P, "tax": tax.toString() })
      }
      res.status(200).json(Final);
    }
  })
}

exports.assetmanager_ratedailylogs_datewise = async function (req, res) {
  var flag1 = {};
  var flag2 = {};
  var startdate = new Date(Date.parse(req.body.startdate));
  var enddate = new Date(Date.parse(req.body.enddate) + (1000 * 3600 * 24));
  flag1 = { "G24K_log.dateChanged": { $gte: startdate, $lte: enddate } };
  flag2 = { "S99P_log.dateChanged": { $gte: startdate, $lte: enddate } };

  const rateData = await RateLog.aggregate([{ $match: { truID: req.body.truid } },
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
      ]
    }
  },
  {
    $project: {
      truID: 1,
      array: { $concatArrays: ['$G24K_log', '$S99P_log'] },
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
  ]);
  var result = new Array();
  for await (const txndetailDF of rateData) {
    for await (const txndetail of txndetailDF.array) {
      txndetail.rate = parseFloat(txndetail.rate)
      result.push(txndetail)
    }
  }
  var finalresp = {};
  if (result.length > 1) {
    var assetmanagerRates24 = result.filter(d => {
      return d.type == "G24K";
    });
    var assetmanagerRates99 = result.filter(d => {
      return d.type == "S99P";
    });
    var txnCharges24, clientCharges24, txnCharges99, clientCharges99;
    if (assetmanagerRates24.length > 0) {
      flag1 = { "G24K_log.dateChanged": { $lt: assetmanagerRates24[0].dateChanged } };
      var assetmanagerRates24prev = await RateLog.aggregate([{ $match: { truID: req.body.truid } },
      { $unwind: "$G24K_log" },
      { $match: flag1 },
      { $sort: { "G24K_log.dateChanged": -1 } },
      { $limit: 1 },
      { $addFields: { "G24K_log.type": "G24K" } },
      { $replaceRoot: { newRoot: "$G24K_log" } }
      ])
      if (assetmanagerRates24prev.length > 0) {
        assetmanagerRates24.unshift(assetmanagerRates24prev[0]);
      }
      var ratestartdate = assetmanagerRates24[0].dateChanged
      var rateenddate = assetmanagerRates24[assetmanagerRates24.length - 1].dateChanged
      txnCharges24 = await CallCharges(ratestartdate, rateenddate);
      clientCharges24 = await CallEntityCharges(ratestartdate, rateenddate, req.body.clientID);
    }
    if (assetmanagerRates99.length > 0) {
      flag2 = { "S99P_log.dateChanged": { $lt: assetmanagerRates99[0].dateChanged } };
      var assetmanagerRates99prev = await RateLog.aggregate([{ $match: { truID: req.body.truid } },
      { $unwind: "$S99P_log" },
      { $match: flag2 },
      { $sort: { "S99P_log.dateChanged": -1 } },
      { $limit: 1 },
      { $addFields: { "S99P_log.type": "S99P" } },
      { $replaceRoot: { newRoot: "$S99P_log" } }
      ])
      if (assetmanagerRates99prev.length > 0) {
        assetmanagerRates99.unshift(assetmanagerRates99prev[0]);
      }
      var ratestartdate = assetmanagerRates99[0].dateChanged
      var rateenddate = assetmanagerRates99[assetmanagerRates99.length - 1].dateChanged
      txnCharges99 = await CallCharges(ratestartdate, rateenddate);
      clientCharges99 = await CallEntityCharges(ratestartdate, rateenddate, req.body.clientID);
    }
    var finalg24k = new Array();
    assetmanagerRates24.forEach(element => {
      var calculatedDate = new Date(element.dateChanged);
      var clientglobalRate = clientCharges24.filter(d => {
        var timeclient = new Date(d.createDate);
        timeclient.setHours(0, 0, 0, 0);
        return calculatedDate.getTime() >= timeclient.getTime();
      }).reverse();
      var txnglobalRate = txnCharges24.filter(d => {
        var timetxn = new Date(d.modifyDate);
        timetxn.setHours(0, 0, 0, 0);
        return calculatedDate.getTime() >= timetxn.getTime();
      }).reverse();
      var rateg24k = calculateRate(txnglobalRate[0], element.rate, "buy", clientglobalRate[0].trasactionCharges)
      finalg24k.push({
        rate: decimalChopper(rateg24k.netrate, 4),
        date: element.dateChanged
      });
    });
    var final99p = new Array();
    assetmanagerRates99.forEach(element => {
      var calculatedDate = new Date(element.dateChanged);
      var clientglobalRate = clientCharges99.filter(d => {
        var timeclient = new Date(d.createDate);
        timeclient.setHours(0, 0, 0, 0);
        return calculatedDate.getTime() >= timeclient.getTime();
      }).reverse();
      var txnglobalRate = txnCharges99.filter(d => {
        var timetxn = new Date(d.modifyDate);
        timetxn.setHours(0, 0, 0, 0);
        return calculatedDate.getTime() >= timetxn.getTime();
      }).reverse();

      var rates99p = calculateRate(txnglobalRate[0], element.rate, "buy", clientglobalRate[0].trasactionCharges)
      final99p.push({
        rate: decimalChopper(rates99p.netrate, 4),
        date: element.dateChanged
      });

    });
    finalresp.trucoin_24kgold = finalg24k.reverse();
    finalresp.trucoin_99Pure = final99p.reverse();
  }


  res.json({
    "status": "1000", "buy": finalresp
  });

  function CallCharges(startDate, endDate) {
    return new Promise((resolve, reject) => {
      request.post({
        "headers": { "content-type": "application/json" },
        "url": conf.adminreqip + ":5112/api/getAllChargesBetweenDate",
        "body": JSON.stringify({ startDate: startDate, endDate: endDate })
      }, (error, response, body) => {
        if (error) {
          resolve(null)
        }
        else {
          if (response.statusCode == 200) {
            var resp = JSON.parse(body);
            resolve(resp.charges)
          }
        }
      })

    })
  }
  function CallEntityCharges(startDate, endDate, clientID) {
    return new Promise((resolve, reject) => {
      request.post({
        "headers": { "content-type": "application/json" },
        "url": conf.reqip + ":4121/api/clientChargesBetweenDate",
        "body": JSON.stringify({ startDate: startDate, endDate: endDate, rtruID: clientID })
      }, (error, response, body) => {
        if (error) {
          resolve(null)
        }
        else {
          if (response.statusCode == 200) {
            var resp = JSON.parse(body);
            resolve(resp.resource)
          }
        }
      })
    })
  }

}