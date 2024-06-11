/*
  # @description This file contains all Admin functionallity for assetstore, Entity, assetmanager, Customer Modules which will Routes to core apis.
  # Request from UI will send here and then send to internal api with input params.
*/
'use strict'
var KycAll = require('../models/custModel/custKYCAllModel');
var TXN = require('../models/custModel/custTXNModel');
var enKycAll = require('../models/entityModel/remmitKYCAllModel');
var WalletLog = require('../models/entityModel/remmitWalletLogModel');
var chargesLogs = require('../models/entityModel/chargesModelLogs'); 
var logs = require('../models/custModel/custLogsModel');
var Atom = require('../models/custModel/custAtomModel');
var eAtom = require("../models/entityModel/remmitAtomModel");
var request = require("request");
var conf = require("../config");
var chooseColor = require('./chooseColor');
exports.entity_all_txn_reportOpti = function (req, res) {
  var truid = req.body.rTruID ? req.body.rTruID : req.body.truID;
  enKycAll.find({ $or: [{ truID: truid }, { parentTruID: truid }] }, async function (err, docs) {

    if (!docs.length) {
      res.json({ status: "204", message: "Invalid Partner" });
    } else {
      var companyName = docs[0].companyName ? docs[0].companyName : [];
      var start = req.body.start ? parseInt(req.body.start) : 0;
      var end = req.body.length ? parseInt(req.body.length) : 100;

      var query = { type: { $in: ["buy", "buyCash", "redeemCash", "transfer"] } };
      if (req.body.type) {
        query.type = req.body.type;
      }
      if (req.body.MOP) {
        query.MOP = req.body.MOP;
      }
      if (req.body.to) {
        query["$or"] = [{ to: req.body.to }, { receiverTruID: req.body.to }]
        // query.to = req.body.to;
      }
      if (req.body.invoice) {
        query.invoice = req.body.invoice;
        var invU = req.body.invoice.split(",");
        query.invoice = { $in: invU };
      }
      var sortQuery = { 'createDate': -1 }
      if (req.body.sortBy) {
        if (req.body.sortBy == "datetimeasc") {
          sortQuery = { 'createDate': 1 }
        }
        else if (req.body.sortBy == "high") {
          sortQuery = { 'totalAmount': -1 }
        }
        else if (req.body.sortBy == "low") {
          sortQuery = { 'totalAmount': 1 }
        }
      }
      if (req.body.status) {
        query.status = req.body.status;
      }
      var channel = req.body.channel;
      if (req.body.rTruID) {
        query.$or = [{ rTruID: req.body.rTruID }, { receiverTruID: req.body.rTruID }];
      }


      if (req.body.startdate && req.body.enddate) {
        var startdate = new Date(Date.parse(req.body.startdate));
        var enddate = new Date(Date.parse(req.body.enddate));
        query.createDate = { $gte: startdate, $lte: enddate };
      }
      var kycNodes = [];
      if (channel) {
        kycNodes = await enKycAll.aggregate([{ $match: { MID: channel } },
        {
          $project: {
            _id: 0, mobile: 1, truID: 1,
          }
        },
        {
          $group: {
            "_id": "$_id",
            "nodeTruID": {
              "$push": "$truID"
            },
          }
        },
        { $project: { _id: 0, nodeTruID: 1 } }]);
      }
      if (channel) {
        if (query.$or) {
          delete query.$or
        }
        query.$or = [{ rTruID: { $in: kycNodes[0].nodeTruID } }, { receiverTruID: req.body.rTruID }];
      }
      var oman = await TXN.find(query).count();
      if (end < 0) {
        end = oman;
      }
    };
    var cursor = [];
    if (req.body.isexport) {
      cursor = await TXN.find(query, { _id: 0, hash: 0, __v: 0, md5sign: 0, nodeID: 0, remmitCharges: 0, sourceFlag: 0 }).skip(start).limit(end);
    }
    else {
      cursor = await TXN.find(query, { _id: 0, hash: 0, __v: 0, md5sign: 0, nodeID: 0, remmitCharges: 0, }).sort(sortQuery).skip(start).limit(end);
    }

    var txn = new Array();

    function consumerArray(numbers) {
      var filteredNumbers = numbers.map((num, index) => {
        return num.to;
      });
      var filteredNumbersR = numbers.map((num, index) => {
        return num.receiverTruID;
      });

      var arrr3 = filteredNumbers.concat(filteredNumbersR);
      return arrr3.filter(function (item, pos) {
        return arrr3.indexOf(item) == pos;
      })
    }
    function entityArray(numbers) {
      var filteredNumbers = numbers.map((num, index) => {
        return num.rTruID;
      });
      var x = numbers.map((num, index) => {
        return num.receiverTruID;
      })
      var arrr3 = filteredNumbers.concat(x);
      return arrr3.filter(function (item, pos) {
        return arrr3.indexOf(item) == pos;
      })
    }
    function entityParentArray(numbers) {
      const filteredNumbers = numbers.map((num, index) => {
        return num.parentTruID;
      });
      return filteredNumbers.filter(function (item, pos) {
        return filteredNumbers.indexOf(item) == pos;
      })
    }
    function consumerPGArray(numbers, typeArray) {
      const filteredNumbers = numbers.map((num, index) => {
        if (num.MOP == "others" && typeArray.includes(num.type)) {
          return num.invoice;
        }
      });
      return filteredNumbers.filter(function (item, pos) {
        return filteredNumbers.indexOf(item) == pos;
      })
    }
    const KycAllCursor = await KycAll.find({ truID: { $in: consumerArray(cursor) } }, { fName: 1, truID: 1, mobile: 1, lName: 1, docVerified: 1, KYCFlag: 1 });
    const enKycAllCursor = await enKycAll.find({ truID: { $in: entityArray(cursor) } }, { companyName: 1, truID: 1, parentTruID: 1 });
    const chargesLogsCursor = await chargesLogs.find({ truID: { $in: entityParentArray(enKycAllCursor) } }, { trasactionCharges: 1, truID: 1, createDate: 1, type: 1 });
    let TxnLogs, AtomTxnLogs, enAtomTxnLogs;
    if (!req.body.isexport) {
      TxnLogs = await logs.find({ invoice: { $in: consumerPGArray(cursor, ["redeemCash"]) } });
      AtomTxnLogs = await Atom.find({ invoice: { $in: consumerPGArray(cursor, ["buy", "buyCash"]) } });
      enAtomTxnLogs = await eAtom.find({ invoice: { $in: consumerPGArray(cursor, ["buy", "buyCash"]) } });
    }
    var txnCharges = await CallCharges();
    function CallCharges() {
      return new Promise((resolve, reject) => {
        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.adminReqIP + ":5112/api/getAllChargesBetweenDate",
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

    var createSummaryData = async function (buyArr) {
      var btype = "", productType = "", brate = "", amount = 0, tax = 0, earning = 0, totalRevenue = 0, exQty = 0, nodeearning = 0, grosspartnerCharges = 0, grossnodeCharges = 0, tdsonpartnerCharges = 0, tdsonnodeCharges = 0;
      var stype = "", senderName = "", senderTruID = "", senderMobile = "";
      async function returndata(particulars, bultype, isTrans) {
        btype += particulars.qty;
        exQty = particulars.qty;
        stype += bultype;
        if (stype == "Gold") {
          productType = "TruGold";
        } else if (stype == "Silver") {
          productType = "TruSilver";
        } else if (stype == "SilverGold") {
          productType = "TruGold & TruSilver";
        } else if (stype == "GoldSilver") {
          productType = "TruGold & TruSilver";
        }
        amount += parseFloat(particulars.amount);
        tax += particulars.tax ? parseFloat(particulars.tax) : 0;

        earning += particulars.partnerCharges ? parseFloat(particulars.partnerCharges) : 0;
        grossnodeCharges += particulars.grossnodeCharges ? parseFloat(particulars.grossnodeCharges) : 0;
        tdsonpartnerCharges += particulars.tdsonpartnerCharges ? parseFloat(particulars.tdsonpartnerCharges) : 0;

        nodeearning += particulars.nodeCharges ? parseFloat(particulars.nodeCharges) : 0;
        grosspartnerCharges += particulars.grosspartnerCharges ? parseFloat(particulars.grosspartnerCharges) : 0;
        tdsonnodeCharges += particulars.tdsonnodeCharges ? parseFloat(particulars.tdsonnodeCharges) : 0;

        var transactionCharges = particulars.transactionCharges ? parseFloat(particulars.transactionCharges) : 0;
        var clientTransactionCharges = particulars.clientTransactionCharges ? parseFloat(particulars.clientTransactionCharges) : 0;
        if (isTrans) {
          totalRevenue += parseFloat(particulars.transferFee);
        } else {
          totalRevenue += (parseFloat(transactionCharges) + parseFloat(clientTransactionCharges));
        }
        brate = particulars.rate;
      }
      var product = [];
      if (buyArr.type == "conversion") {
        product.push({
          "bullionType": "S99P",
          "qty": decimalChopperFloat(parseFloat(buyArr.particularsS99.qty), 4),
          "assetmanager": buyArr.particularsS99.assetmanagerName,
          "from": buyArr.particularsS99.from,
          "rate": decimalChopperFloat(parseFloat(buyArr.particularsS99.rate), 4),
          "amount": decimalChopperFloat(parseFloat(buyArr.particularsS99.amount), 4)
        })
        product.push({
          "bullionType": "G24K",
          "qty": decimalChopperFloat(parseFloat(buyArr.particularsG24.qty), 4),
          "assetmanager": buyArr.particularsG24.assetmanagerName,
          "from": buyArr.particularsG24.from,
          "rate": decimalChopperFloat(parseFloat(buyArr.particularsG24.rate), 4),
          "amount": decimalChopperFloat(parseFloat(buyArr.particularsG24.amount), 4)
        })
        if (buyArr.conversionFrom == "G24K") {
          if ((buyArr.particularsG24 && parseFloat(buyArr.particularsG24.qty) > 0)) {
            returndata(buyArr.particularsG24, "Gold");
          }
        }
        else if (buyArr.conversionFrom == "S99P") {
          if ((buyArr.particularsS99 && parseFloat(buyArr.particularsS99.qty) > 0)) {
            returndata(buyArr.particularsS99, "Silver");
          }
        }
      }
      else {
        var ispay = (buyArr.type == "transfer") ? true : false;
        if ((buyArr.particularsG24 && parseFloat(buyArr.particularsG24.qty) > 0)) {
          await returndata(buyArr.particularsG24, "Gold", ispay);
          product.push({
            "bullionType": "G24K",
            "qty": decimalChopperFloat(parseFloat(buyArr.particularsG24.qty), 4),
            "assetmanager": buyArr.particularsG24.assetmanagerName,
            "from": buyArr.particularsG24.from,
            "rate": decimalChopperFloat(parseFloat(buyArr.particularsG24.rate), 4),
            "amount": decimalChopperFloat(parseFloat(buyArr.particularsG24.amount), 4)
          })
        }
        if ((buyArr.particularsS99 && parseFloat(buyArr.particularsS99.qty) > 0)) {
          await returndata(buyArr.particularsS99, "Silver", ispay);
          if (!req.body.isexport) {
            product.push({
              "bullionType": "S99P",
              "qty": decimalChopperFloat(parseFloat(buyArr.particularsS99.qty), 4),
              "assetmanager": buyArr.particularsS99.assetmanagerName,
              "from": buyArr.particularsS99.from,
              "rate": decimalChopperFloat(parseFloat(buyArr.particularsS99.rate), 4),
              "amount": decimalChopperFloat(parseFloat(buyArr.particularsS99.amount), 4)
            })
          }
        }

        if (ispay) {
          var senderdata = await KycAll.findOne({ truID: buyArr.to }, { fName: 1, truID: 1, mobile: 1, lName: 1, docVerified: 1, KYCFlag: 1 });
          senderName = senderdata.fName + " " + senderdata.lName;
          senderTruID = senderdata.truID;
          senderMobile = senderdata.mobile;
        }

      }
      var totalamount = 0, revenue = 0;
      if (buyArr.totalAmount) {
        if (buyArr.totalAmount != "NaN") {
          totalamount = buyArr.totalAmount;
        }
      }
      if (totalRevenue) {
        revenue = totalRevenue - earning - nodeearning - tdsonpartnerCharges - tdsonnodeCharges
      }

      var rqueue = {
        "senderName": senderName,
        "senderTruID": senderTruID,
        "senderMobile": senderMobile,
        "btype": btype,
        "brate": brate,
        "productType": productType,
        "product": product,
        "amount": amount,
        "tax": tax,
        "earning": earning,
        "grossearning": totalRevenue,
        "nodeearning": nodeearning,
        "grossnodeCharges": grossnodeCharges,
        "tdsonpartnerCharges": tdsonpartnerCharges,
        "grosspartnerCharges": grosspartnerCharges,
        "tdsonnodeCharges": tdsonnodeCharges,
        "exQty": exQty,
        "exStatus": buyArr.status == "success" ? "Success" : buyArr.status == "failure" ? "Failure" : buyArr.status,
        "revenue": revenue
      };
      return rqueue;
    }
    for await (const txndetail of cursor) {
      var enkycdata = enKycAllCursor.filter(word => word.truID == txndetail.rTruID)[0];
      var clientLoading = chargesLogsCursor.filter(d => {
        if (d.type) {
          if (enkycdata.parentTruID === d.truID && (txndetail.type === d.type)) {
            var timeclient = new Date(d.createDate);
            timeclient.setHours(0, 0, 0, 0);
            return txndetail.createDate.getTime() >= timeclient.getTime();
          }
        } else {
          var timeclient = new Date(d.createDate);
          timeclient.setHours(0, 0, 0, 0);
          return txndetail.createDate.getTime() >= timeclient.getTime();
        }

      }).reverse();

      var clientglobalRate = txnCharges.filter(d => {
        var timeclient = new Date(d.modifyDate);
        timeclient.setHours(0, 0, 0, 0);
        return txndetail.createDate.getTime() >= timeclient.getTime();
      }).reverse();

      var defaultLoading = parseFloat(clientglobalRate[0].transactionfees) + parseFloat(clientglobalRate[0].txnLoading);
      var clientLoading = clientLoading.length > 0 ? clientLoading[0].trasactionCharges ? parseFloat(clientLoading[0].trasactionCharges) + parseFloat(clientglobalRate[0].transactionfees) : defaultLoading : defaultLoading;
      var clientsellTax = parseFloat(clientglobalRate[0].sellTax);
      var taxper = txndetail.type == "redeemCash" ? parseFloat(clientglobalRate[0].sellTax) : txndetail.type == "buy" ? parseFloat(clientglobalRate[0].tax) : 0;

      function calculateBaseRate(type, sellTax, loading, amt) {
        var nloading = parseFloat(loading) * 100;
        if (type === "redeemCash") {
          var nactPer = parseFloat((nloading * sellTax).toFixed(2));
          var finPer = parseFloat((nloading + nactPer).toFixed(2));
          var newPer = ((finPer) / (100 - finPer)) * 100;
          return parseFloat((amt + ((amt * newPer) / 100)).toFixed(8));
        } else {

          nloading = 100 + nloading;
          return parseFloat(((amt * 100) / nloading).toFixed(8))
        }
      }
      var arraytxn = {};
      if (req.body.isexport) {
        arraytxn["sid"] = req.body.sid;
        arraytxn["sltype"] = req.body.sltype;
      }
      arraytxn["invoice"] = txndetail.invoice;
      arraytxn["to"] = txndetail.to;
      arraytxn["companyName"] = enkycdata ? enkycdata.companyName : txndetail.rTruID;

      function getDetails(truid) {
        return new Promise((resolve, reject) => {
          enKycAll.find({
            "truID": truid
          }, function (err, docs) {
            if (!docs.length) {
              resolve({ status: "400" });
            }
            else {
              resolve({ status: "200", fName: docs[0].contactFName, lName: docs[0].contactLName, companyName: docs[0].companyName, KYCFlag: docs[0].KYCFlag, mobile: docs[0].mobile });
            }
          })
        })
      }

      if (txndetail.to.substring(0, 4) === "8000") {
        await getDetails(txndetail.to).then((retobj) => {
          arraytxn.consumerName = retobj.companyName ? retobj.companyName.replace('null', '') : "";
          arraytxn["KYCFlag"] = retobj.KYCFlag;
          arraytxn["mobile"] = retobj.mobile;
        })
      } else {
        var consumer = KycAllCursor.filter(word => word.truID == txndetail.to)[0];
        arraytxn["consumerName"] = consumer.fName + " " + consumer.lName;
        arraytxn["KYCFlag"] = consumer.KYCFlag;
        arraytxn["mobile"] = consumer.mobile;
        // arraytxn["consumerName"] = consumer.fName + " " + consumer.lName;
      }

      var pgtxnarr = ["buy", "buyCash", "transfer"];
      if (txndetail.type == "transfer") {

        if (txndetail.receiverTruID && txndetail.receiverTruID.substring(0, 4) === "8000") {
          var retobjv = enKycAllCursor.filter(word => word.truID == txndetail.receiverTruID);
          if (retobjv) {
            var retobj = retobjv[0];
            arraytxn["receiverName"] = retobj.companyName ? retobj.companyName.replace('null', '') : "";
            arraytxn["brandLogo"] = retobj.brandLogo;
            arraytxn["receiverMobile"] = retobj.mobile;
            arraytxn["receiverTruID"] = txndetail.receiverTruID;
          }
          var trupaymentDetails = await WalletLog.findOne({ invoice: txndetail.invoice }).select({ charges: 1, cashback: 1, Cr: 1 });
          if (trupaymentDetails) {
            arraytxn["charges"] = parseFloat(trupaymentDetails.charges);
            arraytxn["cashback"] = parseFloat(trupaymentDetails.cashback);
            arraytxn["totalCredited"] = parseFloat(trupaymentDetails.Cr);
          }

        } else {
          arraytxn["flag"] = txndetail.to == req.body.to ? "sender" : "receiver";
          //if (txndetail.to == req.body.to && txndetail.receiverTruID.substring(0, 4) === "5000") {
          var csmrdata = KycAllCursor.filter(word => word.truID == txndetail.receiverTruID)[0];
          arraytxn["receiverName"] = csmrdata.fName + " " + csmrdata.lName;
          arraytxn["receiverTruID"] = txndetail.receiverTruID;
          // }
        }
      }
      if (!req.body.isexport) {
        if (txndetail.MOP === "others" && txndetail.type === "redeemCash") {
          let txnbankLogs = await TxnLogs.filter(word => word.invoice == txndetail.invoice)[0];
          if (txnbankLogs) {
            arraytxn.PGType = "Bank Transfer";
            arraytxn.payBy = txnbankLogs.Mode_of_Pay;
            arraytxn.bankTXNID = txnbankLogs.UTRNo ? txnbankLogs.UTRNo : txnbankLogs.RefNo;
            arraytxn.paymentCharge = txnbankLogs.charges;
          }
        }
        else if (txndetail.MOP === "others" && pgtxnarr.includes(txndetail.type)) {
          let atomdocs = await AtomTxnLogs.filter(word => word.invoice == txndetail.invoice)[0];
          let enatomdocs = await enAtomTxnLogs.filter(word => word.invoice == txndetail.invoice)[0];
          if (atomdocs) {
            var temppayby = atomdocs.MOP;
            arraytxn.PGType = "atom";
            arraytxn.payBy = (temppayby == "NB") ? "Net Banking" : (temppayby == "CC") ? "Credit Card" : (temppayby == "DC") ? "Debit Card" : (temppayby === "UP") ? "UPI" : temppayby;
            arraytxn.bankTXNID = atomdocs.bankTxnID;
            arraytxn.paymentCharge = atomdocs.surcharge.toJSON().$numberDecimal;
          } else if (enatomdocs) {
            var temppayby = enatomdocs.MOP;
            arraytxn.PGType = "atom";
            arraytxn.payBy = (temppayby == "NB") ? "Net Banking" : (temppayby == "CC") ? "Credit Card" : (temppayby == "DC") ? "Debit Card" : (temppayby === "UP") ? "UPI" : temppayby;
            arraytxn.bankTXNID = enatomdocs.bankTxnID;
            arraytxn.paymentCharge = enatomdocs.surcharge.toJSON().$numberDecimal;
          }

        }

      }
      arraytxn["MOP"] = txndetail.MOP;
      arraytxn["createDate"] = txndetail.createDate;
      arraytxn["rTruID"] = txndetail.rTruID;
      arraytxn["tdsPercentage"] = (parseFloat(txndetail.tdsPercentage) * 100).toString() + "%";
      arraytxn["totalAmount"] = decimalChopperFloat(parseFloat(txndetail.totalAmount), 4);
      arraytxn["applicableTAX"] = (taxper * 100)
      arraytxn["entityRevenue"] = decimalChopperFloat(parseFloat(txndetail.entityRevenue), 4);
      arraytxn["conversionFrom"] = txndetail.conversionFrom;
      arraytxn["conversionTo"] = txndetail.conversionTo;
      arraytxn["status"] = txndetail.status;
      arraytxn["type"] = txndetail.type;
      arraytxn["subType"] = txndetail.subType ? txndetail.subType : "";
      var alldata = await createSummaryData(txndetail);


      arraytxn["nodeCommission"] = decimalChopperFloat(parseFloat(alldata.grossnodeCharges), 4);
      arraytxn["tdsonnodeCommission"] = decimalChopperFloat(parseFloat(alldata.tdsonnodeCharges), 4);
      arraytxn["tdsonpartnerCommission"] = decimalChopperFloat(parseFloat(alldata.tdsonpartnerCharges), 4);
      arraytxn["partnerCommission"] = decimalChopperFloat(parseFloat(alldata.grosspartnerCharges), 4);


      arraytxn["senderName"] = alldata.senderName;
      arraytxn["senderTruID"] = alldata.senderTruID;
      arraytxn["senderMobile"] = alldata.senderMobile;
      arraytxn["btype"] = alldata.btype;
      arraytxn["brate"] = decimalChopperFloat(alldata.brate, 4);
      arraytxn["grate"] = calculateBaseRate(txndetail.type, clientsellTax, clientLoading, parseFloat(alldata.brate));
      arraytxn["productType"] = alldata.productType;
      arraytxn["product"] = alldata.product;
      arraytxn["amount"] = decimalChopperFloat(alldata.amount, 4);
      arraytxn["baseamount"] = calculateBaseRate(txndetail.type, clientsellTax, clientLoading, parseFloat(alldata.amount));
      arraytxn["tax"] = decimalChopperFloat(alldata.tax, 4);
      arraytxn["earning"] = decimalChopperFloat(alldata.earning, 4);
      arraytxn["grossearning"] = decimalChopperFloat(alldata.grossearning, 4);
      arraytxn["exQty"] = decimalChopperFloat(alldata.exQty, 4);
      arraytxn["exStatus"] = alldata.exStatus;
      arraytxn["revenue"] = decimalChopperFloat(alldata.revenue, 4);
      arraytxn["nodeEarning"] = decimalChopperFloat(alldata.nodeearning, 4);
      txn.push(arraytxn);
    }
    var data = {
      "draw": req.body.draw,
      "recordsFiltered": oman,
      "recordsTotal": oman,
      "data": txn
    };
    res.send(JSON.stringify(data));
  })
};
exports.entity_all_txn_reportRevenue = async function (req, res) {
  var start = req.body.start ? parseInt(req.body.start) : 0;
  var end = req.body.length ? parseInt(req.body.length) : 100;
  var earningQuery = { tType: "revenue" };
  if (req.body.startdate && req.body.enddate) {
    var startdate = new Date(Date.parse(req.body.startdate));
    var enddate = new Date(Date.parse(req.body.enddate));
    earningQuery.createDate = { $gte: startdate, $lte: enddate }
  }

  var companyName = req.body.companyName ? req.body.companyName : "";
  var partnerearning = 0;

  var query = { status: "success", type: { $in: ["buy", "buyCash", "redeemCash", "transfer"] } };
  var channel = req.body.channel;
  if (req.body.rTruID) {
    query.rTruID = req.body.rTruID;
    earningQuery.truID = req.body.rTruID;
  }
  var kycNodes = [];
  if (channel) {

    kycNodes = await enKycAll.aggregate([{ $match: { MID: channel } },
    {
      $project: {
        _id: 0, mobile: 1, truID: 1,
      }
    },
    {
      $group: {
        "_id": "$_id",
        "nodeTruID": {
          "$push": "$truID"
        },
      }
    },
    { $project: { _id: 0, nodeTruID: 1 } }]);
  }

  if (channel) {
    if (query.rTruID) {
      delete query.rTruID
    }
    query.rTruID = { $in: kycNodes[0].nodeTruID };
  }



  if (!req.body.isexport) {

    var earnQeury = WalletLog.aggregate([{ $match: earningQuery },
    {
      $project: {
        _id: 0, truID: 1, Cr: 1
      }
    },
    {
      $group:
      {
        _id: null,
        revenue: { $sum: "$Cr" }
      }
    },
    {
      $project: {
        _id: 0, revenue: { "$toString": "$revenue" }
      }
    }
    ]);
    earnQeury.exec(function (err, docs) {
      if (!docs.length) {
        partnerearning = 0;
      } else {
        partnerearning = docs[0].revenue;
      }
    })

  }


  if (req.body.type) {
    query.type = req.body.type;
  }
  if (req.body.to) {
    query.to = req.body.to;
  }
  if (req.body.receiptno) {
    query.invoice = req.body.receiptno;
  }
  var sortQuery = { 'createDate': -1 }
  if (req.body.sortBy) {
    if (req.body.sortBy == "datetimeasc") {
      sortQuery = { 'createDate': 1 }
    }
    else if (req.body.sortBy == "high") {
      sortQuery = { 'totalAmount': -1 }
    }
    else if (req.body.sortBy == "low") {
      sortQuery = { 'totalAmount': 1 }
    }
  }
  if (req.body.startdate && req.body.enddate) {
    var startdate = new Date(Date.parse(req.body.startdate));
    var enddate = new Date(Date.parse(req.body.enddate));
    query.createDate = { $gte: startdate, $lte: enddate }
  }
  function particularjson(particular) {
    var returnarr = {
      from: { $ifNull: [{ $toString: "$" + particular + ".from" }, "0"] },
      assetmanagerName: { $ifNull: [{ $toString: "$" + particular + ".assetmanagerName" }, "0"] },
      qty: { $ifNull: [{ $toString: "$" + particular + ".qty" }, "0"] },
      rate: { $ifNull: [{ $toString: "$" + particular + ".rate" }, "0"] },
      amount: { $ifNull: [{ $toString: "$" + particular + ".amount" }, "0"] },
      assetstoreCharges: { $ifNull: [{ $toString: "$" + particular + ".assetstoreCharges" }, "0"] },
      transactionCharges: { $ifNull: [{ $toString: "$" + particular + ".transactionCharges" }, "0"] },
      clientTransactionCharges: { $ifNull: [{ $toString: "$" + particular + ".clientTransactionCharges" }, "0"] },
      assetmanagersCharges: { $ifNull: [{ $toString: "$" + particular + ".assetmanagersCharges" }, "0"] },
      otherCharges: { $ifNull: [{ $toString: "$" + particular + ".otherCharges" }, "0"] },
      partnerCharges: { $ifNull: [{ $toString: "$" + particular + ".partnerCharges" }, "0"] },
      nodeCharges: { $ifNull: [{ $toString: "$" + particular + ".nodeCharges" }, "0"] },
      remmitCharges: { $ifNull: [{ $toString: "$" + particular + ".remmitCharges" }, "0"] },
      transferFee: { $ifNull: [{ $toString: "$" + particular + ".transferFee" }, "0"] },
      tax: { $ifNull: [{ $toString: "$" + particular + ".tax" }, "0"] },
      total: { $ifNull: [{ $toString: "$" + particular + ".total" }, "0"] },
      TID: { $ifNull: [{ $toString: "$" + particular + ".TID" }, "0"] },
    };
    return returnarr;
  }
  var oman = await TXN.find(query).count();
  if (end < 0) {
    end = oman;
  }
  const cursor = TXN.aggregate([{ $sort: sortQuery },
  { $match: query },
  { $skip: start },
  { $limit: end },
  {
    $project: {
      invoice: 1, MOP: 1, otherCharges: 1, _id: 0,
      particularsG24: 1, particularsS99: 1, rTruID: 1, status: 1,
      partnerCharges: { $toDouble: { $sum: ["$particularsG24.partnerCharges", "$particularsS99.partnerCharges"] } },
      nodeCharges: { $toDouble: { $sum: ["$particularsG24.nodeCharges", "$particularsS99.nodeCharges"] } }, sourceFlag: 1, to: 1, totalAmount: 1, type: 1, createDate: 1
    }
  },
  {
    $lookup:
    {
      from: "kycs",
      localField: "to",
      foreignField: "truID",
      as: "cust"
    }
  },
  { $unwind: { path: "$cust", preserveNullAndEmptyArrays: true } },
  { $unwind: { path: "$particularsG24", preserveNullAndEmptyArrays: true } },
  { $unwind: { path: "$particularsS99", preserveNullAndEmptyArrays: true } },
  {
    $project: {
      _id: 0, invoice: 1, MOP: 1, rTruID: 1, status: 1, entityRevenue: 1,
      particularsG24: particularjson("particularsG24"), particularsS99: particularjson("particularsS99"),
      otherCharges: { $ifNull: [{ $toString: "$otherCharges" }, "0"] }, entityRevenue: { $ifNull: [{ $toString: "$entityRevenue" }, "0"] },
      totalAmount: { $ifNull: [{ $toString: "$totalAmount" }, "0"] },
      partnerCharges: { $ifNull: [{ $toString: "$partnerCharges" }, "0"] },
      nodeCharges: { $ifNull: [{ $toString: "$nodeCharges" }, "0"] }, sourceFlag: 1, to: 1, type: 1, fName: "$cust.fName", lName: "$cust.lName", createDate: 1
    }
  }]).allowDiskUse(true).cursor();
  var txn = new Array();
  var createSummaryData = function (buyArr, particular, status, product) {


    var btype = "", productType = "", brate = "", amount = 0, tax = 0, g24rate = 0, nodeearning = 0, earning = 0, clientrevenue = 0, totalRevenue = 0;
    var stype = "", exQty;

    function returndata(particulars, bultype) {
      btype += particulars.qty;
      exQty = particulars.qty;
      stype += bultype;
      if (stype == "Gold") {
        productType = "TruGold";
      } else if (stype == "Silver") {
        productType = "TruSilver";
      } else if (stype == "SilverGold") {
        productType = "TruGold & TruSilver";
      } else if (stype == "GoldSilver") {
        productType = "TruGold & TruSilver";
      }
      amount += parseFloat(particulars.amount);
      tax += parseFloat(particulars.tax);
      nodeearning += parseFloat(particulars.nodeCharges);
      earning += parseFloat(particulars.partnerCharges);
      //totalRevenue += (parseFloat(particulars.transactionCharges) + parseFloat(particulars.clientTransactionCharges));
      brate = particulars.rate;
    }

    if ((buyArr.particularsG24 && parseFloat(buyArr.particularsG24.qty) > 0)) {
      returndata(buyArr.particularsG24, "Gold");
    }
    if ((buyArr.particularsS99 && parseFloat(buyArr.particularsS99.qty) > 0)) {
      returndata(buyArr.particularsS99, "Silver");
    }

    var totalamount = 0, revenue = 0;
    if (buyArr.totalAmount) {
      if (buyArr.totalAmount != "NaN") {
        totalamount = buyArr.totalAmount;
      }
    }
    var rqueue = {
      "earning": earning.toString(),
      "exStatus": buyArr.status == "success" ? "Success" : "Failure",
      "productType": productType,
      "nodeEarning": nodeearning.toString(),
      "tax": tax.toString()
    };
    return rqueue;
  }
  function getDetails(truid) {
    return new Promise((resolve, reject) => {
      enKycAll.find({
        "truID": truid
      }, function (err, docs) {
        if (!docs.length) {
          resolve({ status: "400" });
        }
        else {
          resolve({ status: "200", fName: docs[0].contactFName, lName: docs[0].contactLName, companyName: docs[0].companyName });
        }
      })
    })
  }
  for await (const txndetail of cursor) {
    var arraytxn = {};
    arraytxn["invoice"] = txndetail.invoice;
    arraytxn["to"] = txndetail.to;
    if (channel) {
      await getDetails(txndetail.rTruID).then((retobj) => {
        arraytxn.companyName = retobj.companyName ? retobj.companyName.replace('null', '') : "";
      })
    } else {
      arraytxn["companyName"] = companyName ? companyName.replace('null', '') : "";
    }
    if (txndetail.to.substring(0, 4) === "8000") {
      await getDetails(txndetail.to).then((retobj) => {
        arraytxn.consumerName = retobj.companyName ? retobj.companyName.replace('null', '') : "";
      })
    } else {
      arraytxn["consumerName"] = txndetail.fName + " " + txndetail.lName;
    }
    arraytxn["MOP"] = txndetail.MOP;
    arraytxn["createDate"] = txndetail.createDate;
    arraytxn["rTruID"] = txndetail.rTruID;
    arraytxn["totalAmount"] = decimalChopperFloat(txndetail.totalAmount, 4);
    arraytxn["status"] = txndetail.status;
    arraytxn["type"] = txndetail.type;
    var alldata = await createSummaryData(txndetail);
    arraytxn["earning"] = decimalChopperFloat(alldata.earning, 4);
    arraytxn["nodeEarning"] = decimalChopperFloat(alldata.nodeEarning, 4);
    arraytxn["exStatus"] = alldata.exStatus;
    arraytxn["productType"] = alldata.productType;
    arraytxn["tax"] = alldata.tax;
    txn.push(arraytxn);
  }

  var data = {
    "earning": decimalChopperFloat(partnerearning, 4),
    "draw": req.body.draw,
    "recordsFiltered": oman,
    "recordsTotal": oman,
    "data": txn
  };
  res.send(JSON.stringify(data));
};
exports.fetchConsumerByName_Mobile = async function (req, res) {
  var truid = req.body.rTruID;
  var text = req.body.q;
  var matchqry = { refernceTruID: truid, $or: [{ fName: { $regex: ".*^" + text + ".*", $options: 'i' } }, { lName: { $regex: ".*^" + text + ".*", $options: 'i' } }, { mobile: text }, { truID: text }], __t: "KycAll" };
  const DataQueryBuy = KycAll.aggregate([{ $match: matchqry },
  {
    $project: {
      _id: 0, email: 1, fName: 1, lName: 1, channel: 1,  //DB query to fetch all consumer
      mobile: 1, truID: 1, "consumerName": { $concat: ["$fName", " ", "$lName"] }
    }
  },
  { $sort: { createDate: -1 } }
  ]).allowDiskUse(true).cursor({ batchSize: 1000 })
  var result = new Array();
  for await (const txndetail of DataQueryBuy) {
    txndetail.color = chooseColor(txndetail.channel);
    result.push(txndetail)
  }
  res.send(result)
}
exports.partner_ConsumerList = async function (req, res) {
  var truid = req.body.rTruID;
  var start = req.body.start ? parseInt(req.body.start) : 0;
  var end = req.body.length ? parseInt(req.body.length) : 100;
  var query = { "refernceTruID": truid };
  if (req.body.to) {
    query.truID = req.body.to;
  }
  else if (req.body.startdate && req.body.enddate) {
    var startdate = new Date(Date.parse(req.body.startdate));
    var enddate = new Date(Date.parse(req.body.enddate));
    query = { "refernceTruID": truid, createDate: { $gte: startdate, $lte: enddate } }
  }
  var channel = req.body.channel;
  if (channel) {
    if (query.refernceTruID) {
      delete query.refernceTruID
    }
    query.channel = channel;
  }
  if (req.body.KYCFlag) {
    if (req.body.KYCFlag == "active") {
      query.docVerified = true;
    }
    else if (req.body.KYCFlag == "pending") {
      query.docVerified = false;
    }
    else if (req.body.KYCFlag != "active") {
      query.KYCFlag = req.body.KYCFlag;
    }
  }
  var totalStock24 = 0;
  var totalStock99 = 0;
  if (!req.body.isexport) {
    var earnQeury = await KycAll.aggregate([{ $match: query },
    {
      $group: {
        _id: null,
        userIds: {
          $addToSet: '$truID',
        },
      },
    },
    {
      $lookup: {
        from: "stocks",
        let: { truid: "$userIds" },
        pipeline: [
          {
            $match:
            {
              $expr:
              {
                $and:
                  [{ $in: ["$truID", "$$truid"] },
                  ]
              }
            }
          },
        ],
        as: "stocks"
      }
    },
    { $unwind: { path: "$stocks", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0, truID: 1, refernceTruID: 1,
        stock24: "$stocks.stock.G24K",
        stock99: "$stocks.stock.S99P"
      }
    },
    {
      $group:
      {
        _id: "$refernceTruID",
        stock24sum: { $sum: "$stock24" },
        stock99sum: { $sum: "$stock99" }
      }
    },
    {
      $project: {

        _id: 0, truID: 1,
        stock24sum: { "$toString": { $cond: [{ $lt: ["$stock24sum", 0.000001] }, 0.00, "$stock24sum"] } },
        stock99sum: { "$toString": { $cond: [{ $lt: ["$stock99sum", 0.000001] }, 0.00, "$stock99sum"] } }

      }
    }
    ]);
    if (!earnQeury.length) {
      totalStock24 = 0;
      totalStock99 = 0;
    } else {
      totalStock24 = earnQeury[0].stock24sum;
      totalStock99 = earnQeury[0].stock99sum;
    }
  }
  var oman = await KycAll.find(query).count();
  if (end < 0) {
    end = oman;
  }
  var sortQuery = { 'createDate': -1 };
  const consumerL = KycAll.aggregate([
    { $sort: sortQuery },
    { $match: query },
    { $skip: start },
    { $limit: end },
    {
      $project: {
        _id: 0, createDate: 1, gender: 1, KYCFlag: 1, DOB: 1, email: 1, fName: 1, mName: 1,
        lName: 1, mobile: 1, truID: 1, refernceTruID: 1, docVerified: 1, KYCDetails: 1, channel: 1
      }
    },
    {
      $lookup:
      {
        from: "stocks",
        localField: "truID",
        foreignField: "truID",
        as: "stocks"
      }
    },
    { $unwind: { path: "$stocks" } },
    {
      $lookup: {
        from: "accstatuses",
        let: { truid: "$truID" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and:
                  [{ $eq: ["$truID", "$$truid"] }]
              }
            }
          },
          { "$sort": { "createDate": -1 } },
          { "$limit": 1 }
        ],
        as: "accstatuses"
      }
    },
    { $unwind: { path: "$accstatuses", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0, createDate: 1, gender: 1, KYCFlag: 1, DOB: 1, email: 1, fName: 1, mName: 1,
        kycDesc: "$accstatuses.reason", kycSource: "$accstatuses.source",
        kycDate: "$accstatuses.createDate", kycmodifiedBy: "$accstatuses.modifiedBy",
        lName: 1, mobile: 1, truID: 1, refernceTruID: 1, docVerified: 1, KYCDetails: 1, channel: 1,
        stock24: { "$toString": { $cond: [{ $lt: ["$stocks.stock.G24K", 0.000001] }, 0.00, "$stocks.stock.G24K"] } }, stock99: { "$toString": { $cond: [{ $lt: ["$stocks.stock.S99P", 0.000001] }, 0.00, "$stocks.stock.S99P"] } }
      }
    }
  ]).allowDiskUse(true).cursor({ batchSize: 1000 })
  var result = new Array();
  var counter = 0;


  function getDetails(truid) {
    return new Promise((resolve, reject) => {
      enKycAll.find({
        "truID": truid
      }, function (err, docs) {
        if (!docs.length) {
          resolve({ status: "400" });
        }
        else {
          resolve({ status: "200", fName: docs[0].contactFName, truID: docs[0].truID, lName: docs[0].contactLName, companyName: docs[0].companyName });
        }
      })

    })
  }
  for await (const txndetail of consumerL) {
    txndetail.consumerName = txndetail.fName + " " + txndetail.lName;
    txndetail.KYCFlag = txndetail.docVerified == true && txndetail.KYCFlag == "active" ? "active" : txndetail.docVerified == false && txndetail.KYCFlag == "active" ? "Pending" : txndetail.KYCFlag;
    txndetail.stock24 = decimalChopperFloat(txndetail.stock24, 4);
    txndetail.stock99 = decimalChopperFloat(txndetail.stock99, 4);
    txndetail.rTruID = txndetail.refernceTruID; 
    await getDetails(txndetail.refernceTruID).then((retobj) => {
      txndetail.companyName = retobj.companyName ? retobj.companyName.replace('null', '') : "";
      txndetail.refID = retobj.truID;
    })
    result.push(txndetail)
  }

  var data = {
    "totalStock24": decimalChopperFloat(totalStock24, 4),
    "totalStock99": decimalChopperFloat(totalStock99, 4),
    "draw": req.body.draw,
    "recordsFiltered": oman,
    "recordsTotal": oman,
    "data": result
  };
  res.send(JSON.stringify(data));
}
exports.fetchConsumerSelect = async function (req, res) {
  var text = req.body.searchTerm;
  var matchqry = { "__t": "KycAll" }
  if (text) {
    matchqry = { "__t": "KycAll", $or: [{ fName: { $regex: ".*^" + text + ".*", $options: 'i' } }, { lName: { $regex: ".*^" + text + ".*", $options: 'i' } }, { mobile: text }], __t: "KycAll" };
  }
  var rTruID = req.body.rTruID;
  var DataQueryBuy = [];
  if (rTruID) {
    matchqry.refernceTruID = rTruID;
  }
  var channel = req.body.channel;
  if (channel) {
    if (matchqry.refernceTruID) {
      delete matchqry.refernceTruID
    }
    matchqry.channel = channel;
  }
  var kycFlag = req.body.kycFlag;
  if (kycFlag && kycFlag != "all") {
    matchqry.kycFlag = kycFlag;
  }
  DataQueryBuy = await KycAll.aggregate([{ $match: matchqry },
  { $sort: { createDate: -1 } },
  { $limit: 10 },
  {
    $project: {
      _id: 0, email: 1, fName: 1, lName: 1, channel: 1,  //DB query to fetch all consumer
      mobile: 1, truID: 1, "consumerName": { $concat: ["$fName", " ", "$lName"] }
    }
  },
  { $sort: { createDate: -1 } }
  ])

  var result = new Array();
  for (const txndetail of DataQueryBuy) {
    var data = txndetail.consumerName + " - " + replaceWithX(txndetail.truID) + " - " + txndetail.mobile;
    txndetail.id = txndetail.truID;
    txndetail.text = data;
    txndetail.color = chooseColor(txndetail.channel);
    result.push(txndetail)
  }

  var dt = {
    id: 0,
    text: "- Search Consumer -"
  }
  result.unshift(dt)
  res.send(result)
}
function decimalChopperFloat(num, fixed) {

  if (num) {
    try {
      var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?');
      var number = num.toString().match(re)[0]
      return parseFloat(number);
    }
    catch (ex) {
      console.log(ex)
      return 0;
    }
  }
  else {
    return 0;
  }

}
function replaceWithX(str) {
  return str.replace(/.(?=.{4})/g, 'x');
}