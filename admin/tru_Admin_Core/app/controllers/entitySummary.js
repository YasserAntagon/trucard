'use strict'
var enKycAll = require('../models/entityModel/remmitKYCAllModel');
var custKYCAllModel = require('../models/custModel/custKYCAllModel');
var WalletLog = require("../models/entityModel/remmitWalletLogModel");
var enWallet = require("../models/entityModel/remmitWalletModel");
var custTXN = require('../models/custModel/custTXNModel');
var custStock = require('../models/custModel/custStockModel');
var remmitStock = require('../models/entityModel/remmitStockModel');
var chargesLogs = require('../models/entityModel/chargesModelLogs')
var walDesc = require('./Description');
var chooseColor = require('./chooseColor');
var request = require("request");
var conf = require("../config");
function capitalizeFirstLetter(s) {
  return s[0].toUpperCase() + s.slice(1);
}

exports.walletBreakupSummary = async function (req, res) {
  var truid = req.body.rTruID;
  var startdate = new Date(Date.parse(req.body.startdate));
  var enddate = new Date(Date.parse(req.body.enddate));
  var clBal = 0;
  var walletBal = await enWallet.aggregate([{ $match: { truID: req.body.rTruID } }, {
    $project: {
      _id: 0, clBal: { "$toString": "$clBal" }
    }
  }
  ]);
  if (walletBal.length) {
    clBal = walletBal[0].clBal;
  }
  var Q1 = { "truID": truid, "status": "success", "tType": "addMoney", createDate: { $lte: enddate } },
    Q2 = { "truID": truid, "status": "success", createDate: { $lte: startdate } },
    Q3 = { "truID": truid, "status": "success", "tType": "addMoney", createDate: { $gte: startdate, $lte: enddate } },
    Q4 = { "truID": truid, "status": "success", createDate: { $lte: enddate } },
    Q5 = { "truID": truid, "status": "success", "tType": "buy", createDate: { $gte: startdate, $lte: enddate } },
    Q6 = { "truID": truid, "status": "success", "tType": "redeemCash", createDate: { $gte: startdate, $lte: enddate } },
    Q7 = { "truID": truid, "status": "success", "tType": "transfer", createDate: { $gte: startdate, $lte: enddate } },
    Q8 = { "truID": truid, "status": "success", "tType": "revenue", createDate: { $gte: startdate, $lte: enddate } };

  const result = await WalletLog.aggregate([
    {
      $facet: {
        walletAdded: [{ $match: Q1 },
        {
          $group: {
            _id: null,
            TotalwalletAdded: { $sum: { $add: ["$Dr", "$Cr"] } }
          }
        }],
        walletOpening: [{ $match: Q2 },
        {
          $group: {
            _id: null,
            balance: { $sum: { $add: ["$Dr", "$Cr"] } }
          }
        }],
        walletAddedOn: [{ $match: Q3 },
        {
          $group: {
            _id: null,
            TotalwalletAdded: { $sum: { $add: ["$Dr", "$Cr"] } }
          }
        }],
        walletClosing: [{ $match: Q4 },
        {
          $group: {
            _id: null,
            balance: { $sum: { $add: ["$Dr", "$Cr"] } }
          }
        }],

        Buy: [{ $match: Q5 },
        {
          $group: {
            _id: null,
            transactionAmt: { $sum: { $add: ["$Dr", "$Cr"] } }
          }
        }],
        sell: [{ $match: Q6 },
        {
          $group: {
            _id: null,
            transactionAmt: { $sum: { $add: ["$Dr", "$Cr"] } }
          }
        }],
        transfer: [{ $match: Q7 },
        {
          $group: {
            _id: null,
            transactionAmt: { $sum: { $add: ["$Dr", "$Cr"] } }
          }
        }],
        revenue: [{ $match: Q8 },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: { $add: ["$Dr", "$Cr"] } }
          }
        }]
      }
    },
    { $unwind: { path: "$walletAdded", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$walletAddedOn", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$walletOpening", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$walletClosing", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$Buy", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$sell", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$transfer", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$revenue", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        walletAdded: { $ifNull: [{ $toString: "$walletAdded.TotalwalletAdded" }, "0"] },
        walletAddedOn: { $ifNull: [{ $toString: "$walletAddedOn.TotalwalletAdded" }, "0"] },
        walletOpening: { $ifNull: [{ $toString: "$walletOpening.balance" }, "0"] },
        walletClosing: { $ifNull: [{ $toString: "$walletClosing.balance" }, "0"] },
        Buy: { $ifNull: [{ $toString: "$Buy.transactionAmt" }, "0"] },
        sell: { $ifNull: [{ $toString: "$sell.transactionAmt" }, "0"] },
        transfer: { $ifNull: [{ $toString: "$transfer.transactionAmt" }, "0"] },
        revenue: { $ifNull: [{ $toString: "$revenue.totalRevenue" }, "0"] },        
        status: {
          $cond: {
            if: {
              $eq: [{
                $sum: [{ $ifNull: ["$walletOpening.balance", 0] },
                { $ifNull: ["$walletAddedOn.TotalwalletAdded", 0] },
                { $ifNull: ["$walletReversal.totalwalletReversal", 0] },
                { $ifNull: ["$Buy.transactionAmt", 0] },
                { $ifNull: ["$sell.transactionAmt", 0] },
                { $ifNull: ["$transfer.transactionAmt", 0] },
                { $ifNull: ["$revenue.totalRevenue", 0] }
                ]
              }, { $ifNull: ["$walletClosing.balance", 0] }]
            },
            then: "OK",
            else: "Err",
          }
        }
      }
    }
  ]);
  console.log("result",result)
  if (result.length > 0) {
    result[0].walletBal = clBal;
    res.send({ status: "200", "resource": result[0] });
  }
  else {
    res.send({ status: "411", "resource": [] });
  }
};
exports.bind_EntityAllSummaryOLD = async function (req, res) {
  var start = req.body.start ? parseInt(req.body.start) : 0;
  var end = req.body.length ? parseInt(req.body.length) : 100;

  var query = { type: { $in: ["buy", "buyCash", "redeemCash"] } };
  if (req.body.type) {
    query.type = req.body.type;
  }
  if (req.body.rTruID) {
    query.to = req.body.rTruID;
  }
  if (req.body.invoice) {
    query.invoice = req.body.invoice;
  }
  if (req.body.MOP) {
    if (req.body.MOP == "others") {
      query.MOP = { $in: ["other", "others"] }
    }
    else {
      query.MOP = req.body.MOP;
    }
  }

  var sortQuery = { 'createDate': -1 };
  var bulQuery = {};
  var sortQueryWF = { createDate: -1 };
  if (req.body.sortBy) {
    if (req.body.sortBy == "asc") {
      sortQueryWF = { 'createDate': 1 }
    }
    else if (req.body.sortBy == "txnD") {
      sortQueryWF = { 'totalAmount': -1 }
    }
    else if (req.body.sortBy == "txnA") {
      sortQueryWF = { 'totalAmount': 1 }
    }
    else if (req.body.sortBy == "golda") {
      sortQueryWF = { "particularsG24.qty": 1 }
      bulQuery = { "particularsG24.qty": { $gt: 0 } }
    }
    else if (req.body.sortBy == "goldd") {
      sortQueryWF = { "particularsG24.qty": -1 }
      bulQuery = { "particularsG24.qty": { $gt: 0 } }
    }
    else if (req.body.sortBy == "silvera") {
      sortQueryWF = { "particularsS99.qty": 1 }
      bulQuery = { "particularsS99.qty": { $gt: 0 } }
    }
    else if (req.body.sortBy == "silverd") {
      sortQueryWF = { "particularsS99.qty": -1 }
      bulQuery = { "particularsS99.qty": { $gt: 0 } }
    }
  }
  var kycQuery = {};
  if (req.body.kycStatus && req.body.kycStatus == "active") {
    kycQuery.docVerified = true;
    kycQuery.KYCFlag = "active";
  }
  else if (req.body.kycStatus && req.body.kycStatus == "pending") {
    kycQuery.docVerified = false;
    kycQuery.KYCFlag = "active";
  }
  else if (req.body.kycStatus && req.body.kycStatus != "all") {
    kycQuery.KYCFlag = req.body.kycStatus;
  }

  if (req.body.status) {
    query.status = req.body.status;
  }
  if (req.body.startdate && req.body.enddate) {
    var startdate = new Date(Date.parse(req.body.startdate));
    var enddate = new Date(Date.parse(req.body.enddate));
    query.createDate = { $gte: startdate, $lte: enddate }
  }
  var oman = await enTXN.find(query).count();
  if (end < 0) {
    end = oman;
  }
  const cursor = enTXN.aggregate([
    { $unwind: { path: "$particularsG24", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$particularsS99", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        invoice: 1, MOP: 1, otherCharges: 1, _id: 0,
        particularsG24: { $cond: { if: { $eq: ["$particularsG24.qty", 0] }, then: "$$REMOVE", else: "$particularsG24" } },
        particularsS99: { $cond: { if: { $eq: ["$particularsS99.qty", 0] }, then: "$$REMOVE", else: "$particularsS99" } },
        status: 1,
        remmitCharges: 1, sourceFlag: 1, to: 1, totalAmount: 1, type: 1, createDate: 1
      }
    },
    { $match: bulQuery },
    { $sort: sortQueryWF },
    { $match: query },
    { $skip: start },
    { $limit: end },
    {
      $lookup:
      {
        from: "kycs",
        localField: "to",
        foreignField: "truID",
        as: "entity"
      }
    },
    { $unwind: { path: "$entity", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        invoice: 1, MOP: 1, otherCharges: 1, _id: 0,
        particularsG24: 1, particularsS99: 1, status: 1,
        totalAmount: { $ifNull: [{ $toString: "$totalAmount" }, "0"] },
        remmitCharges: 1, sourceFlag: 1, to: 1, type: 1, createDate: 1, companyName: "$entity.companyName", mobile: "$entity.mobile", KYCFlag: "$entity.KYCFlag"
      }
    },
    { $match: kycQuery }
  ]).allowDiskUse(true).cursor();
  var txn = new Array();
  var createSummaryData = function (buyArr) {

    var btype = "", productType = "", brate = "", amount = 0, tax = 0, g24rate = 0, g99prate = 0, earning = 0, clientrevenue = 0, totalRevenue = 0;
    var exRate, exQty;

    function returndata(particulars, bultype) {
      btype += particulars.qty;
      exQty = particulars.qty;
      if (bultype == "Gold") {
        productType = "TruGold";
      } else if (bultype == "Silver") {
        productType = "TruSilver";
      } else if (bultype == "SilverGold") {
        productType = "TruGold & TruSilver";
      } else if (bultype == "GoldSilver") {
        productType = "TruGold & TruSilver";
      }
      amount += parseFloat(particulars.amount);
      tax += parseFloat(particulars.tax);
      if (particulars.txnLoading) {

        totalRevenue += (parseFloat(particulars.transactionCharges) + parseFloat(particulars.txnLoading));
      }
      else {
        totalRevenue += parseFloat(particulars.transactionCharges)
      }
      brate = parseFloat(particulars.rate);
    }
    var product = [];
    if ((buyArr.particularsG24 && parseFloat(buyArr.particularsG24.qty) > 0)) {
      returndata(buyArr.particularsG24, "Gold");
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
      returndata(buyArr.particularsS99, "Silver");
      product.push({
        "bullionType": "S99P",
        "qty": decimalChopperFloat(parseFloat(buyArr.particularsS99.qty), 4),
        "assetmanager": buyArr.particularsS99.assetmanagerName,
        "from": buyArr.particularsS99.from,
        "rate": decimalChopperFloat(parseFloat(buyArr.particularsS99.rate), 4),
        "amount": decimalChopperFloat(parseFloat(buyArr.particularsS99.amount), 4)
      })
    }

    var totalamount = 0, revenue = 0;
    var rqueue = {
      "brate": brate,
      "productType": productType,
      "product": product,
      "amount": amount.toString(),
      "grossearning": totalRevenue,
      "revenue": totalRevenue,
      "tax": tax.toString(),
      "exQty": exQty,
      "exStatus": buyArr.status == "success" ? "Success" : "Failure"
    };
    return rqueue;
  }

  for await (const txndetail of cursor) {
    var arraytxn = {};
    arraytxn["invoice"] = txndetail.invoice;
    arraytxn["to"] = txndetail.to;
    arraytxn["KYCFlag"] = txndetail.KYCFlag;
    //arraytxn["applicableTAX"] = (taxper * 100)
    arraytxn["consumerName"] = txndetail.companyName;
    arraytxn["companyName"] = "COMPANY";
    // arraytxn["consumerName"] = txndetail.fName + " " + txndetail.lName;
    arraytxn["MOP"] = txndetail.MOP;
    arraytxn["createDate"] = txndetail.createDate;
    arraytxn["mobile"] = txndetail.mobile;
    arraytxn["totalAmount"] = decimalChopperFloat(txndetail.totalAmount, 4);
    //  arraytxn["partnerCharges"] = decimalChopperFloat(txndetail.partnerCharges, 4);
    //  arraytxn["nodeCharges"] = decimalChopperFloat(txndetail.nodeCharges, 4);
    //  arraytxn["entityRevenue"] = decimalChopperFloat(txndetail.entityRevenue, 4);
    arraytxn["status"] = txndetail.status;
    arraytxn["type"] = txndetail.type;
    var alldata = await createSummaryData(txndetail);
    arraytxn["brate"] = decimalChopperFloat(alldata.brate, 4);
    arraytxn["productType"] = alldata.productType;
    arraytxn["product"] = alldata.product;
    arraytxn["amount"] = decimalChopperFloat(alldata.amount, 4);
    arraytxn["tax"] = decimalChopperFloat(alldata.tax, 4);
    arraytxn["earning"] = 0;
    arraytxn["grossearning"] = decimalChopperFloat(alldata.grossearning, 4);
    arraytxn["exQty"] = decimalChopperFloat(alldata.exQty, 4);
    arraytxn["exStatus"] = alldata.exStatus;
    arraytxn["revenue"] = decimalChopperFloat(alldata.revenue, 4);
    txn.push(arraytxn);
  }
  var data = {
    "draw": req.body.draw,
    "recordsFiltered": oman,
    "recordsTotal": oman,
    "data": txn
  };
  res.send(JSON.stringify(data));
};
exports.bind_EntityAllSummary = async function (req, res, next) {
  var start = req.body.start ? parseInt(req.body.start) : 0;
  var end = req.body.length ? parseInt(req.body.length) : 100;
  var query = {};
  if (req.body.type) {
    query.type = req.body.type;
  }
  if (req.body.MOP) {
    if (req.body.MOP == "others") {
      query.MOP = { $in: ["other", "others"] }
    }
    else {
      query.MOP = req.body.MOP;
    }
  }
  if (req.body.rTruID || req.body.to) {
    query["$or"] = [{ to: req.body.rTruID }, { to: req.body.to }, { "particularsG24.from": req.body.to }]
  }
  if (req.body.invoice) {
    query.invoice = req.body.invoice;
    var invU = req.body.invoice.split(",");
    query.invoice = { $in: invU };
  }
  var sortQuery = { 'createDate': -1 };
  var bulQuery = {};
  var sortQueryWF = { createDate: -1 };
  if (req.body.sortBy) {
    if (req.body.sortBy == "asc") {
      sortQueryWF = { 'createDate': 1 }
    }
    else if (req.body.sortBy == "txnD") {
      sortQueryWF = { 'totalAmount': -1 }
    }
    else if (req.body.sortBy == "txnA") {
      sortQueryWF = { 'totalAmount': 1 }
    }
    else if (req.body.sortBy == "golda") {
      sortQueryWF = { "particularsG24.qty": 1 }
      query["particularsG24.qty"] = { $gt: 0 };
    }
    else if (req.body.sortBy == "goldd") {
      sortQueryWF = { "particularsG24.qty": -1 }
      query["particularsG24.qty"] = { $gt: 0 };
    }
    else if (req.body.sortBy == "silvera") {
      sortQueryWF = { "particularsS99.qty": 1 }
      query["particularsS99.qty"] = { $gt: 0 };
    }
    else if (req.body.sortBy == "silverd") {
      sortQueryWF = { "particularsS99.qty": -1 }
      query["particularsS99.qty"] = { $gt: 0 };
    }
  }

  if (req.body.status) {
    query.status = req.body.status;
  }
  var kycQuery = {};
  if (req.body.kycStatus && req.body.kycStatus == "active") {
    kycQuery.docVerified = true;
    kycQuery.KYCFlag = "active";
  }
  else if (req.body.kycStatus && req.body.kycStatus == "pending") {
    kycQuery.docVerified = false;
    kycQuery.KYCFlag = "active";
  }
  else if (req.body.kycStatus && req.body.kycStatus != "all") {
    kycQuery.KYCFlag = req.body.kycStatus;
  }
  if (req.body.startdate && req.body.enddate) {
    var startdate = new Date(Date.parse(req.body.startdate));
    var enddate = new Date(Date.parse(req.body.enddate));
    query.createDate = { $gte: startdate, $lte: enddate };
  }
  var oman = await enTXN.find(query).count();
  if (end < 0) {
    end = oman;
  };
  var cursor = [];
  if (req.body.isexport) {
    cursor = await enTXN.find(query, { _id: 0, hash: 0, __v: 0, md5sign: 0, nodeID: 0, remmitCharges: 0, sourceFlag: 0 }).skip(start).limit(end);
  }
  else {
    cursor = await enTXN.find(query, { _id: 0, hash: 0, __v: 0, md5sign: 0, nodeID: 0, remmitCharges: 0, sourceFlag: 0 }).sort(sortQueryWF).skip(start).limit(end);
  }
  var txn = new Array();
  function entityArray(numbers) {
    var filteredNumbers = numbers.map((num, index) => {
      return num.to;
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

  function consumerArray(numbers) {
    var filteredNumbers = numbers.map((num, index) => {
      return num.to;
    });
    return filteredNumbers.filter(function (item, pos) {
      return filteredNumbers.indexOf(item) == pos;
    })
  }

  const KycAllCursor = await custKYCAllModel.find({ truID: { $in: consumerArray(cursor) } }, { fName: 1, truID: 1, mobile: 1, lName: 1, docVerified: 1, KYCFlag: 1, email: 1, channel: 1, emailVerified: 1 });
  const enKycAllCursor = await enKycAll.find({ truID: { $in: entityArray(cursor) } }, { companyName: 1, brandLogo: 1, emailVerified: 1, truID: 1, channel: 1, parentTruID: 1, isParent: 1, mobile: 1, KYCFlag: 1 });
  const chargesLogsCursor = await chargesLogs.find({ truID: { $in: entityParentArray(enKycAllCursor) } }, { trasactionCharges: 1, truID: 1, createDate: 1, type: 1 });

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
    var btype = "", productType = "", brate = "",
      amount = 0, tax = 0, earning = 0, totalRevenue = 0, exQty = 0, nodeearning = 0,
      grosspartnerCharges = 0, grossnodeCharges = 0, tdsonpartnerCharges = 0, tdsonnodeCharges = 0;
    async function returndata(particulars, bultype, isTrans) {
      btype += particulars.qty;
      exQty = particulars.qty;
      if (bultype == "Gold") {
        productType = "TruGold";
      } else if (bultype == "Silver") {
        productType = "TruSilver";
      } else if (bultype == "SilverGold") {
        productType = "TruGold & TruSilver";
      } else if (bultype == "GoldSilver") {
        productType = "TruGold & TruSilver";
      }
      if (buyArr.type == "conversion") {
        amount += parseFloat(particulars.amount) + parseFloat(particulars.txnLoading);
      } else {
        amount += parseFloat(particulars.amount);
      }
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
    var ispay = (buyArr.type == "transfer") ? true : false;
    if (Array.isArray(buyArr.particularsG24) == true || Array.isArray(buyArr.particularsS99) == true) {

      if ((buyArr.particularsG24[0] && parseFloat(buyArr.particularsG24[0].qty) > 0)) {
        await returndata(buyArr.particularsG24[0], "Gold", ispay);
        if (!req.body.isexport) {
          product.push({
            "bullionType": "G24K",
            "qty": decimalChopperFloat(parseFloat(buyArr.particularsG24[0].qty), 4),
            "assetmanager": buyArr.particularsG24[0].assetmanagerName,
            "from": buyArr.particularsG24[0].from,
            "rate": decimalChopperFloat(parseFloat(buyArr.particularsG24[0].rate), 4),
            "amount": decimalChopperFloat(parseFloat(buyArr.particularsG24[0].amount), 4)
          })
        }
      }
      if ((buyArr.particularsS99[0] && parseFloat(buyArr.particularsS99[0].qty) > 0)) {
        await returndata(buyArr.particularsS99[0], "Silver", ispay);
        if (!req.body.isexport) {
          product.push({
            "bullionType": "S99P",
            "qty": decimalChopperFloat(parseFloat(buyArr.particularsS99[0].qty), 4),
            "assetmanager": buyArr.particularsS99[0].assetmanagerName,
            "from": buyArr.particularsS99[0].from,
            "rate": decimalChopperFloat(parseFloat(buyArr.particularsS99[0].rate), 4),
            "amount": decimalChopperFloat(parseFloat(buyArr.particularsS99[0].amount), 4)
          })
        }
      }
    }
    else {
      if ((buyArr.particularsG24 && parseFloat(buyArr.particularsG24.qty) > 0)) {
        await returndata(buyArr.particularsG24, "Gold", ispay);
        if (!req.body.isexport) {
          product.push({
            "bullionType": "G24K",
            "qty": decimalChopperFloat(parseFloat(buyArr.particularsG24.qty), 4),
            "assetmanager": buyArr.particularsG24.assetmanagerName,
            "from": buyArr.particularsG24.from,
            "rate": decimalChopperFloat(parseFloat(buyArr.particularsG24.rate), 4),
            "amount": decimalChopperFloat(parseFloat(buyArr.particularsG24.amount), 4)
          })
        }
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
    }
    var totalamount = 0, revenue = 0;
    if (buyArr.totalAmount) {
      if (buyArr.totalAmount != "NaN") {
        totalamount = buyArr.totalAmount;
      }
    }
    if (totalRevenue) {
      revenue = totalRevenue - earning - nodeearning - tdsonpartnerCharges - tdsonnodeCharges;
    }
    var rqueue = {
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
  for await (const txndetail of cursor) {
    var enkycdata;
    enkycdata = enKycAllCursor.filter(word => word.truID == txndetail.to)[0];
    var clientLoading = [];
    if (enkycdata) {
      clientLoading = chargesLogsCursor.filter((d, index) => {
        try {
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
        }
        catch (Ex) {
          console.log("enkycdata.parentTruID", enkycdata)
        }

      }).reverse();
    }

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
    arraytxn["companyName"] = "COMPANY";
    arraytxn["rTruID"] = "Partner";
    if (req.body.getStock && txndetail.type == "transfer") {
      var cStocks = await custStock.aggregate([{ $match: { truID: txndetail.to } }, { $project: { _id: 0, truID: 1, G24K: { "$toString": { $cond: [{ $lt: ["$stock.G24K", 0.000001] }, 0.00, "$stock.G24K"] } }, S99P: { "$toString": { $cond: [{ $lt: ["$stock.S99P", 0.000001] }, 0.00, "$stock.S99P"] } } } },]);
      arraytxn["consumerStock"] = cStocks[0];
      var rStocks = await custStock.aggregate([{ $match: { truID: txndetail.receiverTruID } }, { $project: { _id: 0, truID: 1, G24K: { "$toString": { $cond: [{ $lt: ["$stock.G24K", 0.000001] }, 0.00, "$stock.G24K"] } }, S99P: { "$toString": { $cond: [{ $lt: ["$stock.S99P", 0.000001] }, 0.00, "$stock.S99P"] } } } },]);
      arraytxn["receiverStock"] = rStocks[0];
    }

    if (txndetail.type == "transfer") {
      var consumerdata = KycAllCursor.filter(word => word.truID == txndetail.to)[0];
      arraytxn["consumerName"] = consumerdata ? consumerdata.fName + " " + consumerdata.lName : "";
      arraytxn["mobile"] = consumerdata ? consumerdata.mobile : "";
      arraytxn["channel"] = consumerdata ? consumerdata.channel : "";
      var retobj;
      if (txndetail.receiverTruID.substring(0, 4) === "8000") {
        var retobj = enKycAllCursor.filter(word => word.truID == txndetail.receiverTruID)[0];
        arraytxn["receiverName"] = retobj.companyName ? retobj.companyName.replace('null', '') : "";
        arraytxn["brandLogo"] = retobj.brandLogo;
        arraytxn["receiverMobile"] = retobj.mobile;
      } else {
        var retobj = KycAllCursor.filter(word => word.truID == txndetail.receiverTruID)[0];
        arraytxn["receiverName"] = retobj ? consumerdata.fName + " " + consumerdata.lName : "";
        arraytxn["receiverMobile"] = retobj.mobile;

      }

      arraytxn["receiverTruID"] = txndetail.receiverTruID;
      arraytxn["KYCFlag"] = retobj.KYCFlag;
      arraytxn["emailVerified"] = retobj.emailVerified ? retobj.emailVerified : "";

    } else {
      arraytxn["KYCFlag"] = enkycdata.KYCFlag;
      arraytxn["consumerName"] = enkycdata.companyName ? enkycdata.companyName.replace('null', '') : "";
      arraytxn["mobile"] = enkycdata.mobile ? enkycdata.mobile : "";
      arraytxn["channel"] = enkycdata.channel ? enkycdata.channel : "";
      arraytxn["brandLogo"] = enkycdata.channel ? enkycdata.brandLogo : "";
      arraytxn["emailVerified"] = enkycdata.emailVerified ? enkycdata.emailVerified : "";
    }



    arraytxn["MOP"] = txndetail.MOP;
    arraytxn["applicableTAX"] = (taxper * 100)
    arraytxn["createDate"] = txndetail.createDate;
    arraytxn["totalAmount"] = decimalChopperFloat(parseFloat(txndetail.totalAmount), 4);
    arraytxn["entityRevenue"] = decimalChopperFloat(parseFloat(txndetail.entityRevenue), 4);
    arraytxn["status"] = txndetail.status;
    arraytxn["type"] = txndetail.type;
    var alldata = await createSummaryData(txndetail);
    arraytxn["nodeCommission"] = decimalChopperFloat(parseFloat(alldata.grossnodeCharges), 4);
    arraytxn["tdsonnodeCommission"] = decimalChopperFloat(parseFloat(alldata.tdsonnodeCharges), 4);
    arraytxn["tdsonpartnerCommission"] = decimalChopperFloat(parseFloat(alldata.tdsonpartnerCharges), 4);
    arraytxn["partnerCommission"] = decimalChopperFloat(parseFloat(alldata.grosspartnerCharges), 4);
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
    "recordsFiltered": req.body.length ? req.body.length > 9 ? oman : req.body.length : oman,
    "recordsTotal": req.body.length ? req.body.length > 9 ? oman : req.body.length : oman,
    "data": txn
  };
  res.send(JSON.stringify(data));

};
exports.fetchNode = async function (req, res) {
  var text = req.body.searchTerm;
  var matchqry = { "__t": "KycAll" };
  if (text) {
    matchqry = { "__t": "KycAll", $or: [{ companyName: { $regex: ".*^" + text + ".*", $options: 'i' } }, { contactFName: { $regex: ".*^" + text + ".*", $options: 'i' } }, { contactLName: { $regex: ".*^" + text + ".*", $options: 'i' } }, { CRNNo: text }, { truID: text }, { mobile: text }], __t: "KycAll" };
  }
  var rTruID = req.body.rTruID;
  if (rTruID) {
    matchqry.parentTruID = rTruID;
  }
  var isParent = req.body.isParent;
  if (isParent == "parent") {
    matchqry.isParent = true;
  }
  const DataQueryNode = await enKycAll.aggregate([{ $match: matchqry },
  {
    $project: {
      _id: 0, email: 1,  //DB query to fetch all consumer
      mobile: 1, truID: 1, "companyName": 1, isParent: 1
    }
  },
  { $sort: { createDate: 1 } },
  { $limit: 5 }
  ]).allowDiskUse(true)
  var result = new Array();
  for (const txndetail of DataQueryNode) {
    var companyName = txndetail.companyName.replace('null', '');
    var data = companyName + " - " + txndetail.truID + " - " + txndetail.mobile;
    txndetail.id = txndetail.truID;
    txndetail.text = data;
    txndetail.color = chooseColor(txndetail.isParent);
    result.push(txndetail)
    // }
  }
  var dt = {
    id: 0,
    text: "- Search Partner -"
  }
  result.unshift(dt)

  res.send(result)
};
exports.node_List = async function (req, res) {
  var start = req.body.start ? parseInt(req.body.start) : 0;
  var end = req.body.length ? parseInt(req.body.length) : 100;
  var query = { "__t": "KycAll" };
  var isNodeQ = { "__t": "KycAll" };
  var isParentQ = { "__t": "KycAll" };
  if (req.body.to) {
    query.truID = req.body.to;
  }
  else if (req.body.startdate && req.body.enddate) {
    var startdate = new Date(Date.parse(req.body.startdate));
    var enddate = new Date(Date.parse(req.body.enddate));
    query.createDate = { $gte: startdate, $lte: enddate };
    isNodeQ.createDate = { $gte: startdate, $lte: enddate };
    isParentQ.createDate = { $gte: startdate, $lte: enddate };
  }
  if (req.body.rTruID) {
    query.parentTruID = req.body.rTruID;
    isNodeQ.parentTruID = req.body.rTruID;
    isParentQ.parentTruID = req.body.rTruID;
  }
  if (req.body.isParent == "true") {
    query.isParent = true;
  }
  else if (req.body.isParent == "false") {
    query.isParent = false;
  }
  if (req.body.KYCFlag) {
    query.KYCFlag = req.body.KYCFlag;
  }


  isNodeQ.isParent = false;
  isParentQ.isParent = true;
  var kycNodes = await enKycAll.aggregate([
    {
      $facet: {
        total: [{ $match: query },
        {
          $group: {
            "_id": null,
            "nodeTruID": {
              "$addToSet": "$truID"
            }
          }
        }],
        nodes: [{ $match: isNodeQ },
        {
          $group: {
            "_id": null,
            count: { $sum: 1 }
          }
        }],
        parent: [{ $match: isParentQ },
        {
          $group: {
            "_id": null,
            count: { $sum: 1 }
          }
        }]
      }
    },
    { $unwind: { path: "$total", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$nodes", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$parent", preserveNullAndEmptyArrays: true } },
    { $project: { _id: 0, nodeTruID: "$total.nodeTruID", totPartner: "$parent.count", totNodes: "$nodes.count" } }]);
  var oman = 0;

  if (kycNodes.length > 0) {
    oman = kycNodes[0].nodeTruID ? kycNodes[0].nodeTruID.length : 0;
  }
  if (kycNodes.length < 0) {
    end = oman;
  }
  var sortQuery = { 'createDate': -1 };
  var sortByWF = { 'createDate': -1 };
  if (req.body.sortBy) {
    if (req.body.sortBy == "desc") {
      sortByWF = { 'createDate': -1 };
    }
    else if (req.body.sortBy == "asc") {
      sortByWF = { 'createDate': 1 };
    }
    else if (req.body.sortBy == "walleta") {
      sortByWF = { 'wallet': 1 };
    }
    else if (req.body.sortBy == "walletd") {
      sortByWF = { 'wallet': -1 };
    }
    else if (req.body.sortBy == "golda") {
      sortByWF = { 'stock24': 1 };
    }
    else if (req.body.sortBy == "goldd") {
      sortByWF = { 'stock24': -1 };
    }
    else if (req.body.sortBy == "silvera") {
      sortByWF = { 'stock99': 1 };
    }
    else if (req.body.sortBy == "silverd") {
      sortByWF = { 'stock99': -1 };
    }
  }
  var wclBal = 0, fclBal = 0, totPartner = 0, totNodes = 0;
  var totalStock24 = 0, totalStock99 = 0;
  if (req.body.isexport) { } else {

    if (kycNodes[0].nodeTruID && kycNodes[0].nodeTruID.length > 0) {
      totPartner = kycNodes[0].totPartner;
      totNodes = kycNodes[0].totNodes;
      var walletBal = await enWallet.aggregate([{ $match: { truID: { $in: kycNodes[0].nodeTruID } } },
      {
        $group: {
          _id: "_id",
          clBal: { $sum: "$clBal" }
        }
      }]);
      var enStockBal = await remmitStock.aggregate([{ $match: { truID: { $in: kycNodes[0].nodeTruID } } },
      {
        $group: {
          _id: "_id",
          stock24sum: { $sum: "$stock.G24K" },
          stock99sum: { $sum: "$stock.S99P" }
        }
      },
      {
        $project: {
          _id: 0, truID: 1, stock24sum: { "$toString": "$stock24sum" },
          stock99sum: { "$toString": "$stock99sum" },
        }
      }]);
      if (enStockBal.length) {
        totalStock24 = enStockBal[0].stock24sum;
        totalStock99 = enStockBal[0].stock99sum;
      }
      if (walletBal.length) {
        wclBal = parseFloat(walletBal[0].clBal);
      }
    }
  }
  const consumerL = enKycAll.aggregate([
    { $match: query },
    { $sort: sortQuery },
    {
      $lookup:
      {
        from: "wallets",
        localField: "truID",
        foreignField: "truID",
        as: "wallets"
      }
    },
    { $unwind: { path: "$wallets", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0, createDate: 1, KYCFlag: 1, DOB: 1, email: 1,
        ptruID: "$parentTruID",
        mobile: 1, truID: 1, parentTruID: 1,
        docVerified: 1, KYCDetails: 1, KYCTime: 1,
        KYCVerifyBy: 1, aadharStatus: 1, panStatus: 1,
        address: 1, companyName: 1, contactFName: 1, contactLName: 1, salesCode: 1, isParent: 1, wallet: { $ifNull: ["$wallets.clBal", 0] }
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
    { $unwind: { path: "$stocks", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0, createDate: 1, KYCFlag: 1, DOB: 1, email: 1,
        ptruID: 1,
        mobile: 1, truID: 1, parentTruID: 1,
        docVerified: 1, KYCDetails: 1, KYCTime: 1,
        KYCVerifyBy: 1, aadharStatus: 1, panStatus: 1,
        address: 1, companyName: 1, contactFName: 1, contactLName: 1, salesCode: 1, isParent: 1, wallet: { "$toString": { $cond: [{ $lt: ["$wallet", 0.000001] }, 0.00, "$wallet"] } },
        stock24: { "$toString": { $cond: [{ $lt: ["$stocks.stock.G24K", 0.000001] }, 0.00, "$stocks.stock.G24K"] } }, stock99: { "$toString": { $cond: [{ $lt: ["$stocks.stock.S99P", 0.000001] }, 0.00, "$stocks.stock.S99P"] } }
      }
    },
    { $sort: sortByWF },
    { $skip: start },
    { $limit: end },

    {
      $project: {
        _id: 0, createDate: 1, KYCFlag: 1, DOB: 1, email: 1,
        ptruID: 1,
        mobile: 1, truID: 1, parentTruID: 1,
        docVerified: 1, KYCDetails: 1, KYCTime: 1,
        KYCVerifyBy: 1, aadharStatus: 1, panStatus: 1,
        address: 1, companyName: 1, contactFName: 1, contactLName: 1, salesCode: 1,
        isParent: 1, wallet: 1,
        stock24: 1, stock99: 1
      }
    }]).allowDiskUse(true).cursor({ batchSize: 1000 })
  var result = new Array();
  function fetchCompanyName(parentID) {
    var query = { truID: parentID, "__t": "KycAll", isParent: true };
    return new Promise(async (resolve, reject) => {
      var docsData = await enKycAll.aggregate([{ $match: query }, { $project: { companyName: 1 } }])
      if (!docsData.length) {                     //user not found
        reject("");
      } else {
        resolve(docsData[0].companyName.replace('null', ''))
      }
    })
  }
  for await (const txndetail of consumerL) {
    txndetail.pcompanyName = await fetchCompanyName(txndetail.parentTruID);
    txndetail.companyName = txndetail.companyName ? txndetail.companyName.replace('null', '') : txndetail.companyName;
    txndetail.KYCFlag = txndetail.KYCFlag == "holder" ? "onhold" : txndetail.KYCFlag;
    txndetail.partnerName = txndetail.contactFName == "0" ? "-" : txndetail.contactFName + " " + txndetail.contactLName;
    txndetail.wallet = txndetail.wallet ? decimalChopperFloat(txndetail.wallet, 4) : 0;
    txndetail.stock24 = decimalChopperFloat(txndetail.stock24, 4);
    txndetail.stock99 = decimalChopperFloat(txndetail.stock99, 4);
    txndetail.rTruID = txndetail.parentTruID;
    txndetail.salesCode = txndetail.salesCode ? txndetail.salesCode : "-";
    txndetail.address = txndetail.address ? txndetail.address.city + ", " + txndetail.address.state + ", " + txndetail.address.country + "-" + txndetail.address.pin : "";
    if (req.body.rTruID != txndetail.truID) {
      result.push(txndetail);
    }
  }
  var data = {
    "totalStock24": decimalChopperFloat(totalStock24, 4),
    "totalStock99": decimalChopperFloat(totalStock99, 4),
    "totPartner": totPartner,
    "totNodes": totNodes,
    "wclBal": wclBal,
    "draw": req.body.draw,
    "recordsFiltered": oman,
    "recordsTotal": oman,
    "data": result
  };
  res.send(JSON.stringify(data));
};
exports.bind_WalletLog = async function (req, res) {
  var truid = req.body.rTruID;
  var start = req.body.start ? parseInt(req.body.start) : 0;
  var end = req.body.length ? parseInt(req.body.length) : 100;

  var query = { truID: truid };
  if (req.body.type) {
    query.tType = req.body.type;
  }
  if (req.body.receiptno) {
    query.invoice = req.body.receiptno;
  }
  if (req.body.MOP) {
    query.MOP = req.body.MOP;
  }
  var sortQuery = { 'createDate': -1 }
  if (req.body.sortBy) {
    if (req.body.sortBy == "datetimeasc") {
      sortQuery = { 'createDate': 1 }
    }
    else if (req.body.sortBy == "high") {
      sortQuery = { 'Cr': -1 }
    }
    else if (req.body.sortBy == "low") {
      sortQuery = { 'Dr': 1 }
    }
  }
  if (req.body.startdate && req.body.enddate) {
    var startdate = new Date(Date.parse(req.body.startdate));
    var enddate = new Date(Date.parse(req.body.enddate));
    query.createDate = { $gte: startdate, $lte: enddate }
  }
  var oman = await WalletLog.find(query).count();
  if (end < 0) {
    end = oman;
  }


  
  var checkConsumer = {
    "$switch": {
      "branches": [
        { "case": { "$eq": ["$tType", "addMoney"] }, "then": "entity" },
        { "case": { "$eq": ["$tType", "walletToBank"] }, "then": "entity" },
        { "case": { "$eq": ["$tType", "revenue"] }, "then": "entity" }
      ],
      "default": { $ifNull: ["$txninvoice.invoice", "consumer"] }
    }
  }

  var walletBal = await enWallet.aggregate([{ $match: { truID: req.body.rTruID } },
  {
    $project: {
      _id: 0, clBal: 1
    }
  },
  {
    $project: {
      _id: 0, clBal: { "$toString": "$clBal" }
    }
  },
  ]);

  const cursor = WalletLog.aggregate([{ $sort: sortQuery },
  { $match: query },
  { $skip: start },
  { $limit: end },
  {
    $project: {
      _id: 0, tType: 1, createDate: 1, truID: 1, Cr: { $toString: { $abs: '$Cr' } }, Dr: { $toString: { $abs: '$Dr' } },
      invoice: 1, particulars: 1, status: 1,
      againstInvoice: { $ifNull: ["$againstInvoice", "0"] }, subType: { $ifNull: ["$subType", "NA"] }
    }
  },
  {
    $lookup: {
      from: "txns",
      localField: "invoice",
      foreignField: "invoice",
      as: "txninvoice"
    }
  },
  { $unwind: { path: "$txninvoice", preserveNullAndEmptyArrays: true } },
  {
    $lookup: {
      from: "atomlogs",
      localField: "invoice",
      foreignField: "invoice",
      as: "atominvoice"
    },
  },
  { $unwind: { path: "$atominvoice", preserveNullAndEmptyArrays: true } },
  {
    $lookup:
    {
      from: "partnervatxnlogs",
      localField: "againstInvoice",
      foreignField: "vaID",
      as: "va"
    }
  },
  { $unwind: { path: "$va", preserveNullAndEmptyArrays: true } },
  {
    $lookup: {
      from: "banklogs",
      localField: "invoice",
      foreignField: "invoice",
      as: "bankinvoice"
    }
  },
  { $unwind: { path: "$bankinvoice", preserveNullAndEmptyArrays: true } },
  {
    $lookup: {
      from: "accounts",
      let: { truid: "$truID", accountno: "$bankinvoice.Ben_Acct_No"},
      pipeline: [
        {
          $match: {
            $expr: {
              $and:
                [{ $eq: ["$truID", "$$truid"] }]
            }
          }
        },
        { $project: { truID: 1, accountDetails: "$bankAccounts" } },
        { $unwind: "$accountDetails" },
        {
          $match: {
            $expr: {
              $and:
                [{ $eq: ["$accountDetails.accountNo", "$$accountno"] }]
            }
          }
        }
      ],
      as: "bankDetails"
    }
  },
  { $unwind: { path: "$bankDetails", preserveNullAndEmptyArrays: true } },
  {
    $project: {
      isConsumer: checkConsumer,
      mop: { $cond: { if: { $eq: ["$tType", "walletToBank"] }, then: "$bankinvoice.Mode_of_Pay",  else: { $cond: { if: { $eq: ["$subType", "VA"] }, then: "Virtual Account", else: "$atominvoice.MOP" } } } },
      pgType: { $cond: { if: { $eq: ["$tType", "walletToBank"] }, then: "bank", else: { $cond: { if: { $eq: ["$tType", "addMoney"] }, then: { $cond: { if: { $eq: ["$subType", "VA"] }, then: "VA", else: "atom" } }, else: "" } } } },
      bankTxnID: { $cond: { if: { $eq: ["$tType", "walletToBank"] }, then: "$bankinvoice.TranID", else: "$atominvoice.bankTxnID" } },      
      bankName: { $cond: { if: { $eq: ["$tType", "walletToBank"] }, then: "$bankDetails.accountDetails.bank_name", else: { $ifNull: ["$atominvoice.bankName", "$va.senderIFSC"] } } },
      _id: 0, tType: 1, createDate: 1, truID: 1, Cr: 1, Dr: 1, invoice: 1, particulars: 1, status: 1,
      againstInvoice: { $ifNull: ["$againstInvoice", "$invoice"] },
      beneficiaryAccountNumber: "$va.beneficiaryAccountNumber",
      creditDate: "$va.creditDate",
      senderName: { $cond: { if: { $eq: ["$tType", "walletToBank"] }, then: "$bankDetails.accountDetails.name", else: "$va.senderName" } },
      senderAccountNumber: { $cond: { if: { $eq: ["$tType", "walletToBank"] }, then: "$bankDetails.accountDetails.last4", else: "$va.senderAccountNumber" } },
      senderIFSC: { $cond: { if: { $eq: ["$tType", "walletToBank"] }, then: "$bankDetails.accountDetails.IFSC", else: "$va.senderIFSC" } },
      messageType: "$va.messageType",
      UTRNumber: "$va.UTRNumber"
    }
  }, {
    $project: {
      isConsumer: { $cond: { if: { $eq: ["$isConsumer", "consumer"] }, then: true, else: false } },
      mop: 1,
      pgType: 1,
      bankTxnID: 1,
      error_Desc: 1,
      bankName: 1,
      _id: 0, tType: 1, createDate: 1, truID: 1, Cr: 1, Dr: 1, invoice: 1, particulars: 1, status: 1,
      againstInvoice: 1,
      beneficiaryAccountNumber: {
        $concat: ["XXXXXXXXX",
          {
            $substr: [
              { $ifNull: ["$beneficiaryAccountNumber", "XXXXXX"] }, {
                $subtract: [{
                  $strLenCP: { $ifNull: ["$beneficiaryAccountNumber", "XXXXXX"] }
                }, 4]
              }, -1]
          }]
      },
      creditDate: 1,
      senderName: 1,
      senderIFSC: 1,
      messageType: 1,
      UTRNumber: 1,
      upi: 1,
      senderAccountNumber: {
        $concat: ["XXXXXXXXX",
          {
            $substr: [
              { $ifNull: ["$senderAccountNumber", "XXXXXX"] }, {
                $subtract: [{
                  $strLenCP: { $ifNull: ["$senderAccountNumber", "XXXXXX"] }
                }, 4]
              }, -1]
          }]
      }
    }
  },
  ]).allowDiskUse(true).cursor();
  var txn = new Array();
  for await (const txndetail of cursor) {
    var totAmt = txndetail.Cr != "0" ? txndetail.Cr : txndetail.Dr != "0" ? txndetail.Dr : "0"
    txndetail.totalAmount = decimalChopperFloat(totAmt, 4);
    txndetail.desc = txndetail.tType;
    txndetail.againstInvoice = txndetail.againstInvoice ? txndetail.againstInvoice : "-";
    txndetail.rTruID = txndetail.truID;
    txn.push(txndetail);
  }
  var clBal = 0;
  if (walletBal.length) {
    clBal = walletBal[0].clBal;
  }
  var data = {
    "walletBal": decimalChopperFloat(clBal, 4),
    "draw": req.body.draw,
    "recordsFiltered": oman,
    "recordsTotal": oman,
    "data": txn
  };
  res.send(JSON.stringify(data));
};
exports.entity_wallet_log_reportNew = async function (req, res) {
  var truid = req.body.rTruID;
  var start = req.body.start ? parseInt(req.body.start) : 0;
  var end = req.body.length ? parseInt(req.body.length) : 100;

  var query = { truID: truid };
  if (req.body.type) {
    query.tType = req.body.type;
  }

  if (req.body.receiptno) {
    query.invoice = req.body.receiptno;
  }
  if (req.body.MOP) {
    query.MOP = req.body.MOP;
  }
  var sortQuery = { 'createDate': -1 };
  if (req.body.sortBy) {
    if (req.body.sortBy == "datetimeasc") {
      sortQuery = { 'createDate': 1 }
    }
    else if (req.body.sortBy == "high") {
      sortQuery = { 'Cr': -1 }
    }
    else if (req.body.sortBy == "low") {
      sortQuery = { 'Dr': 1 }
    }
  }
  if (req.body.startdate && req.body.enddate) {
    var startdate = new Date(Date.parse(req.body.startdate));
    var enddate = new Date(Date.parse(req.body.enddate));
    query.createDate = { $gte: startdate, $lte: enddate }
  }
  var oman = await WalletLog.find(query).count();

  if (end < 0) {
    end = oman;
  }
  var clBal = 0;
  var walletBal = await enWallet.aggregate([{ $match: { truID: req.body.rTruID } },
  {
    $project: {
      _id: 0, clBal: 1
    }
  },
  {
    $project: {
      _id: 0, clBal: { "$toString": "$clBal" }
    }
  },
  ]);
  if (walletBal.length) {
    clBal = walletBal[0].clBal;
  }

  var cursorSell = WalletLog.aggregate([
    { $sort: sortQuery },
    { $match: query },
    { $skip: start },
    { $limit: end }
  ]).allowDiskUse(true).cursor({ batchSize: 1000 })
  var result = new Array();
  for await (const txndetail of cursorSell) {
    txndetail.rTruID = txndetail.truID;
    if (txndetail.desc) {
      txndetail.desc = txndetail.desc;
      txndetail.title = txndetail.tType ? capitalizeFirstLetter(txndetail.tType) : txndetail.tType;
    }
    else {
      var desc = walDesc.walletDescription(txndetail.tType, "wallet");
      txndetail.desc = desc.desc;
      txndetail.title = desc.transType;
    }

    result.push(txndetail)
  }
  async function CheckTxn() {
    await Promise.all(result.map(async (data, index) => {
      data.Cr = data.Cr.toJSON().$numberDecimal;
      data.Dr = data.Dr.toJSON().$numberDecimal;
      if (data.againstInvoice && (data.tType == "revenue" || data.tType == "reversal" || data.tType == "refund")) {
        try {
          var resulult = await custTXN.aggregate([{ $match: { "invoice": data.againstInvoice } }]);
          if (resulult.length > 0) {
            var resul = resulult[0]
            if (resul && resul.to) {
              data.to = resul.to;
            }
            data.totalAmount = resul.totalAmount ? resul.totalAmount.toJSON().$numberDecimal : resul.totalAmount;
            data.txnType = resul.type;
            data.againstInvoice = data.againstInvoice;
          }
          else {
            data.txnType = "";
          }
        } catch (ex) {
          console.log(ex, resul)
        }
      }
      else {
        data.txnType = "";
      }
    }))
    var data = {
      "balance": clBal,
      "draw": req.body.draw,
      "recordsFiltered": oman,
      "recordsTotal": oman,
      "data": result
    };
    res.send(JSON.stringify(data));
  }
  CheckTxn();


};
exports.getPartnerDetails = async function (req, res) {
  var matchqry = { "__t": "KycAll" }
  var rTruID = req.body.rTruID;
  if (rTruID) {
    matchqry.truID = rTruID;
  }
  const DataQueryNode = enKycAll.aggregate([{ $match: matchqry },
  {
    $project: {
      _id: 0, email: 1,  //DB query to fetch all consumer
      mobile: 1, truID: 1, "companyName": 1, KYCFlag: 1, isParent: 1, image: 1, isLending: 1, address: 1, MID: 1,
      contactFName: 1, contactLName: 1, DOB: 1, CRNNo: 1, brandLogo: 1, docVerified: 1, panStatus: 1, aadharStatus: 1
    }
  },
  { $sort: { createDate: 1 } },
  { $limit: 1 }
  ]).allowDiskUse(true).cursor({ batchSize: 1000 });
  var result = new Array();
  for await (const txndetail of DataQueryNode) {
    var companyName = txndetail.companyName ? txndetail.companyName.replace('null', '') : "";
    txndetail.companyName = companyName
    result.push(txndetail)
  }
  res.send(result)
};
exports.egetGSTReport = function (req, res) {
  var truid = req.body.rTruID;
  enKycAll.find({ truID: req.body.rTruID }, async function (err, docs) {
    if (!docs.length) {
      res.json({
        status: "204",
        message: "The request was successful but no body was returned."
      });
    }
    else {
      var companyName = docs[0].companyName;
      var globalQuery = { "rTruID": truid, status: "success" };
      var inArray = ["buy", "redeemCash", "transfer"];
      var GSTTotalQuery = { "rTruID": truid, status: "success", type: { $in: inArray } };
      if (req.body.startdate && req.body.enddate) {
        var startdate = new Date(Date.parse(req.body.startdate));
        var enddate = new Date(Date.parse(req.body.enddate));
        globalQuery.createDate = { $gte: startdate, $lte: enddate }
      }
      function returnlimit(typeArr, typeS) {
        var limitobj = {};
        typeArr.forEach(ele => {
          var fieldKey = ele;
          var FlQuery = typeS == "total" ? fieldKey : { "type": fieldKey };
          var GSTQuery = [{ $match: FlQuery },
          { $unwind: { path: "$particularsG24", preserveNullAndEmptyArrays: true } },
          { $unwind: { path: "$particularsS99", preserveNullAndEmptyArrays: true } },
          {
            $group: {
              _id: null,
              totalamount: { $sum: "$totalAmount" },
              GSTTotal: { $sum: { $add: ["$particularsG24.tax", "$particularsS99.tax"] } },
              start: { $first: "$createDate" },
              end: { $last: "$createDate" }
            }
          }];
          if (typeS == "total") {
            limitobj[`total_GST`] = GSTQuery;
          }
          else {
            limitobj[`${String(fieldKey)}_GST`] = GSTQuery
          }

        });
        return limitobj;
      }

      function returnProject(typeArr, typeS) {
        var limitobj = {};
        if (typeS == "total") {
          var limitobjStr = {};
          limitobjStr[`Total_Amount`] = { $ifNull: [{ $toString: `$total_GST.totalamount` }, "0"] };
          limitobjStr[`Total_GST`] = { $ifNull: [{ $toString: `$total_GST.GSTTotal` }, "0"] };
          limitobjStr[`start`] = { $ifNull: [{ $toString: `$total_GST.start` }, "0"] };
          limitobjStr[`end`] = { $ifNull: [{ $toString: `$total_GST.end` }, "0"] };
          limitobj = { "total": limitobjStr }
        }
        else {
          typeArr.forEach(ele => {
            var limitobjStr = {};
            var fieldKey = ele;
            var proQuery = `$${String(fieldKey)}_GST.totalamount`;
            limitobjStr[`${String(fieldKey)}_Total`] = { $ifNull: [{ $toString: proQuery }, "0"] };
            var proQueryGST = `$${String(fieldKey)}_GST.GSTTotal`;
            limitobjStr[`${String(fieldKey)}_TotalGST`] = { $ifNull: [{ $toString: proQueryGST }, "0"] };

            limitobj[`${String(fieldKey)}`] = limitobjStr
          });
        }
        return limitobj;
      }
      var GSTQ = [];
      GSTQ.push({ $match: globalQuery },
        {
          $facet: returnlimit(inArray)
        });
      inArray.forEach(ele => {
        var fieldKey = ele;
        GSTQ.push({ $unwind: { path: `$` + fieldKey + `_GST`, preserveNullAndEmptyArrays: true } });
      });
      GSTQ.push({
        $project: returnProject(inArray)
      });

      var GSTTotalQ = [];
      GSTTotalQ.push({ $match: GSTTotalQuery },
        {
          $facet: returnlimit([GSTTotalQuery], "total")
        });
      GSTTotalQ.push({ $unwind: { path: `$total_GST`, preserveNullAndEmptyArrays: true } });
      GSTTotalQ.push({
        $project: returnProject(inArray, "total")
      });
      //aggregate
      const result = await custTXN.aggregate(GSTQ);
      const resultTotal = await custTXN.aggregate(GSTTotalQ);
      var publicStr = {
        particular: result[0],
        total: resultTotal[0]
      }
      publicStr.particular.to = req.body.rTruID;
      publicStr.particular.companyName = companyName;
      if (result.length > 0) {
        res.send({
          status: "200", "resource": publicStr
        });
      }
      else {
        res.send({ status: "411", "resource": [] });
      }
    }
  })
};
exports.uploadBrandLogo = async function (req, res) {
  if (req.body.brandLogo) {
    enKycAll.findOneAndUpdate({ truID: req.body.rTruID }, { $set: { brandLogo: req.body.brandLogo } }).exec();
    res.send({
      status: "200", "resource": {
        brandLogo: req.body.brandLogo
      }
    });
  }
  else {
    res.send({ status: "411", "message": "brand logo required" });
  }
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
};



