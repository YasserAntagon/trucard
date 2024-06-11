'use strict'
var randomize = require('randomatic');
var KycAll = require('../models/assetmanagerModel/assetmanagerKYCAllModel');
var Stock = require('../models/assetmanagerModel/assetmanagerStockModel');
var StockLog = require('../models/assetmanagerModel/assetmanagerStockLogModel');
var txnStocklogs = require('../models/assetmanagerModel/txnStockLogModel');
var { encryption } = require('./encrypt');

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

exports.assetmanagers_stocklog_list = function (req, res) {
  var truid = req.body.amTruID;

  KycAll.find({
    "truID": truid
  }, function (err, docs) {
    if (err) {
      res.json({ status: "500", message: "Internal server Error" })
    } else {
      if (!docs.length) {
        res.json({
          status: "201",
          message: 'This truID does not exist.'
        });
      } else {
        let query = { truID: truid, status: "accepted" }
        if (req.body.startDate && req.body.endDate) {
          var startdate = new Date(Date.parse(req.body.startDate));
          var enddate = new Date(Date.parse(req.body.endDate));
          query.inprocessDate = { $gte: startdate, $lt: enddate }
        }
        StockLog.aggregate([
          { $match: query },
          {
            $project: {
              _id: 0, transactionID: 1, qty: { $toString: "$QTY" }, bullionType: 1,
              status: 1, truID: 1, accRejDate: 1
            }
          }]).exec(async function (err, result) {
            if (err) {
              res.status(500).send({ error: err })
            }
            else {
              let dlrStock = (await Stock.aggregate([{ $match: { truID: truid } }, { $project: { _id: 0, G24K: { $toString: "$stock.G24K" }, S99P: { $toString: "$stock.S99P" } } }]))[0];
              res.json({ status: "200", resource: result, availableStock: dlrStock });
            }
          }
          )
      }
    }
  }
  )
}


exports.update_assetmanager_Stock = function (req, res) {
  var amtruid = req.body.amTruID,
    truid = req.body.truID,
    bulliontype = req.body.bullionType,
    qty = req.body.qty;

  if (amtruid && truid && truid.length == 16 && bulliontype && ["G24K", "S99P"].includes(bulliontype) && qty && parseFloat(qty) > 0) {
    var query = { truID: amtruid };
    KycAll.find(query, async function (err, docs) {
      if (!docs.length) {
        res.json({
          status: "204",
          message: 'Something went wrong..!!'
        });
      }
      else {
        var parenttruid = docs[0].parentTruID;
        let incStock = {};
        if (bulliontype === "G24K") {
          incStock = { "stock.G24K": qty }
        }
        if (bulliontype === "S99P") {
          incStock = { "stock.S99P": qty }
        }
        var prevStock = await Stock.findOne(query);
        Stock.findOneAndUpdate(query, {
          $inc: incStock
        }, { upsert: true, new: true }, callback)


        async function callback(err, stockdata) {
          if (err) {
            res.send(err);
          } else {
            res.json({ status: "200", message: "Stock updated Successfully" });
            let txninvoice = createInvoice();
            var stclog = {
              truID: amtruid, 
              parentTruID: parenttruid,
              transactionID: txninvoice,
              bullionType: bulliontype,
              UOM: "GM",
              QTY: qty,
              status: "accepted",
              assetmanagerStatus: "accepted",
              inprocessDate: new Date(),
              accRejDate: new Date(),
              statusParticulars: "your request is accepted by Admin",
              assetmanagerStatusParticulars: "your request is accepted by Admin",
              coinParticulars: [{
                "id": "1",
                "size": "1",
                "qty": qty,
                "total": qty,
              }],
              isRecieved: true,
              barParticulars: [],
              authCode: randomize('0', 6),
              updatedBy: truid
            }
            var insertstocklog = new StockLog(stclog);
            await insertstocklog.save();
            let previousStock = 0;
            if (bulliontype == "G24K") {
              previousStock = parseFloat(prevStock.stock.G24K);
            } else {
              previousStock = parseFloat(prevStock.stock.S99P);
            }
            let currentStock = previousStock + parseFloat(qty);

            const txnstock = {};
            txnstock.stockID = "S" + createInvoice();
            txnstock.truID = amtruid;
            txnstock.createDate = new Date();
            txnstock.invoice = txninvoice;
            txnstock.tType = "addStock";
            txnstock.bullionType = bulliontype;
            txnstock.Cr = qty;
            txnstock.Dr = 0;
            txnstock.currentStock = currentStock;
            txnstock.previousStock = previousStock;
            txnstock.againstTruID = amtruid;
            txnstock.status = "success";
            txnstock.hash = encryption(JSON.stringify(txnstock));
            var insertTXN = new txnStocklogs(txnstock);
            await insertTXN.save()
          }

        }
      }
    }
    )
  } else {
    res.json({ status: "411", message: "Field Validation Error" });
  }




}


exports.all_assetmanager_list_admin = function (req, res) {

  KycAll.aggregate([
    { $match: { __t: "KycAll" } },
    {
      $lookup: {
        from: "stocks",
        localField: "truID",
        foreignField: "truID",
        as: "stock"
      }
    },
    { $unwind: { path: "$stock", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "wallets",
        localField: "truID",
        foreignField: "truID",
        as: "wallet"
      }
    },
    { $unwind: { path: "$wallet", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        dealerName: 1, truID: 1, mobile: 1, KYCFlag: 1, email: 1, gender: 1, aboutMe: 1, _id: 0, bullionType: 1, landLine: 1,
        companyName: 1, contactFName: 1, contactMName: 1, contactLName: 1, currentCustodian: 1, DOB: 1, isParent: 1, parentTruID: 1, image: 1,
        dealerFixedCharges: 1, dealerCoinCharges: 1, KYCDetails: 1, directorsAadhar: 1, partnersAadhar: 1, companyType: 1,
        companyOperationAddress: 1, companyRegisteredAddress: 1, contactAddress: 1, isLiveRate: 1, createDate: 1,
        // g1: { $toString: "$stock.G24K.netAmount" },
        g1: { $toString: "$stock.G24K.netAmount" }, g4: { $toString: "$stock.S99P.netAmount" },

        gs1: { $toString: "$stock.G24KSale.netAmount" }, gs4: { $toString: "$stock.S99PSale.netAmount" },
        sg1: { $toString: "$stock.stock.G24K" }, sg4: { $toString: "$stock.stock.S99P" },
        rg1: { $toString: "$stock.rStock.G24K" }, rg4: { $toString: "$stock.rStock.S99P" },
        wallet: { $ifNull: [{ $toString: "$wallet.clBal" }, 0] },
      }
    }

  ]).exec(function (err, result) {
    if (err) {
      res.json({ status: "204", message: "Something went wrong!" });
    } else {
      if (!result.length) {
        res.json({ status: "204", message: "No data found!" });
      } else {
        var rslt = new Array();
        function finalResult() {
          var resultobj = result[0];
          var respobj = {}; 
            respobj["dealerName"] = resultobj.dealerName;
            respobj["truID"] = resultobj.truID;
            respobj["mobile"] = resultobj.mobile;
            respobj["email"] = resultobj.email;
            respobj["KYCFlag"] = resultobj.KYCFlag;
            respobj["gender"] = resultobj.gender;
            respobj["bullionType"] = resultobj.bullionType;
            respobj["createDate"] = resultobj.createDate;
            var KYCDetails = new Array();
            if (resultobj.KYCDetails && resultobj.KYCDetails.length) {
              for (var i = 0; i < resultobj.KYCDetails.length; i++) {
                var kycelements = resultobj.KYCDetails[i];
                var kycaray = {};
                kycaray["docNumber"] = kycelements.docNumber;
                kycaray["docTitle"] = kycelements.docTitle;
                var doc = kycelements.docFile;
                //  kycaray["docFile"] = serverpath.concat(doc);
                kycaray["docFile"] = kycelements.docFile;
                kycaray["doc"] = doc;

                KYCDetails.push(kycaray);
              }
            }
            respobj["KYCDetails"] = KYCDetails;
            var directorsAadhar = new Array();
            if (resultobj.directorsAadhar && resultobj.directorsAadhar.length) {
              for (var i = 0; i < resultobj.directorsAadhar.length; i++) {
                var daelements = resultobj.directorsAadhar[i];
                var daray = {};
                daray["directorName"] = daelements.directorName;
                daray["aadhar"] = daelements.aadhar;
                var doc = daelements.aadharDoc;
                //  daray["aadharDoc"] = serverpath.concat(doc);
                daray["aadharDoc"] = daelements.aadharDoc;
                daray["doc"] = doc;

                directorsAadhar.push(daray);
              }
            }
            respobj["directorsAadhar"] = directorsAadhar;

            var partnersAadhar = new Array();
            if (resultobj.partnersAadhar && resultobj.partnersAadhar.length) {
              for (var i = 0; i < resultobj.partnersAadhar.length; i++) {
                var paelements = resultobj.partnersAadhar[i];
                var paray = {};
                paray["partnerName"] = paelements.partnerName;
                paray["aadhar"] = paelements.aadhar;
                var doc = paelements.aadharDoc;
                //  paray["aadharDoc"] = serverpath.concat(doc);
                paray["aadharDoc"] = paelements.aadharDoc;
                paray["doc"] = doc;

                partnersAadhar.push(paray);
              }
            }

            respobj["partnersAadhar"] = partnersAadhar;

            respobj["landLine"] = resultobj.landLine;
            respobj["DOB"] = resultobj.DOB;
            respobj["aboutUs"] = resultobj.aboutMe;
            respobj["tradingDate"] = resultobj.tradingDate;
            respobj["companyName"] = resultobj.companyName;
            respobj["contactFName"] = resultobj.contactFName;
            respobj["contactMName"] = resultobj.contactMName;
            respobj["contactLName"] = resultobj.contactLName;
            respobj["currentCustodian"] = resultobj.currentCustodian;
            respobj["isParent"] = resultobj.isParent;
            respobj["parentTruID"] = resultobj.parentTruID;
            respobj["companyOperationAddress"] = resultobj.companyOperationAddress;
            respobj["companyRegisteredAddress"] = resultobj.companyRegisteredAddress;
            respobj["contactAddress"] = resultobj.contactAddress;
            respobj["companyType"] = resultobj.companyType;

            respobj["image"] = resultobj.image;
            respobj["wallet"] = resultobj.wallet;

            respobj["G24K"] = resultobj.g1;
            respobj["S99P"] = resultobj.g4;


            respobj["G24KSale"] = resultobj.gs1;
            respobj["S99PSale"] = resultobj.gs4;


            respobj["sG24K"] = resultobj.sg1;
            respobj["sS99P"] = resultobj.sg4;


            respobj["rG24K"] = resultobj.rg1;
            respobj["rS99P"] = resultobj.rg4;

            rslt.push(respobj); 
        }
        finalResult()

        res.json({ status: "200", resource: rslt, count: rslt.length.toString() });
      }
    }
  })
};