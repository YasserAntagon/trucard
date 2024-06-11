
'use strict'
const randomize = require('randomatic');
var KycAll = require('../models/custModel/custKYCAllModel');
var TXN = require('../models/custModel/custTXNModel');
var logs = require('../models/custModel/custLogsModel');
var Atom = require('../models/custModel/custAtomModel');
var enKycAll = require('../models/entityModel/remmitKYCAllModel');
var cuWallet = require('../models/custModel/custWalletModel');
var WalletLog = require('../models/custModel/custWalletLogModel');
var eWalletLog = require('../models/entityModel/remmitWalletLogModel');
var cuStock = require('../models/custModel/custStockModel');
var enWallet = require('../models/entityModel/remmitWalletModel');
var enStock = require('../models/entityModel/remmitStockModel');
var walDesc = require('./Description');
var request = require("request");
var chargesLogs = require('../models/entityModel/chargesModelLogs')
var conf = require("../config");
var chooseColor = require('./chooseColor');
var crypto = require('crypto'),
  algorithm = 'aes-256-ctr',
  password = '~*InSpL*~@2808***';
function capitalizeFirstLetter(s) {
  return s[0].toUpperCase() + s.slice(1);
}
exports.fetchConsumerByName_Mobile = async function (req, res) {
  var text = req.body.searchTerm;
  var matchqry = { "__t": "KycAll" }
  if (text) {
    matchqry = { "__t": "KycAll", $or: [{ fName: { $regex: ".*^" + text + ".*", $options: 'i' } }, { lName: { $regex: ".*^" + text + ".*", $options: 'i' } }, { truID: text }, { mobile: text }, { CRNNo: text }], __t: "KycAll" };
  }
  var rTruID = req.body.rTruID;
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
  const DataQueryBuy = KycAll.aggregate([{ $match: matchqry },
  { $sort: { createDate: -1 } },
  { $limit: 10 },
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
    var data = txndetail.consumerName + " - " + txndetail.truID + " - " + txndetail.mobile;
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
};
exports.consumer_gst_report_adminNEWOLD = async function (req, res) {
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
  if (req.body.to) {
    query.to = req.body.to;
  }
  if (req.body.rTruID) {
    query.rTruID = req.body.rTruID;
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

  const cursor = TXN.aggregate([
    { $unwind: { path: "$particularsG24", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$particularsS99", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        invoice: 1, MOP: 1, otherCharges: 1, _id: 0,
        particularsG24: { $cond: { if: { $eq: ["$particularsG24.qty", 0] }, then: "$$REMOVE", else: "$particularsG24" } },
        particularsS99: { $cond: { if: { $eq: ["$particularsS99.qty", 0] }, then: "$$REMOVE", else: "$particularsS99" } },
        rTruID: 1, status: 1,
        partnerCharges: { $toDouble: { $sum: ["$particularsG24.partnerCharges", "$particularsS99.partnerCharges"] } }, conversionFrom: 1, conversionTo: 1,
        nodeCharges: { $toDouble: { $sum: ["$particularsG24.nodeCharges", "$particularsS99.nodeCharges"] } }, sourceFlag: 1, to: 1, totalAmount: 1, type: 1, createDate: 1
      }
    },
    { $match: bulQuery },
    { $sort: sortQueryWF },
    { $match: query },
    { $skip: start },
    { $limit: end },
    {
      $project: {
        invoice: 1, MOP: 1, otherCharges: 1, _id: 0,
        particularsG24: 1, particularsS99: 1, rTruID: 1, status: 1,

        partnerCharges: { $toDouble: { $sum: ["$particularsG24.partnerCharges", "$particularsS99.partnerCharges"] } }, conversionFrom: 1, conversionTo: 1,
        nodeCharges: { $toDouble: { $sum: ["$particularsG24.nodeCharges", "$particularsS99.nodeCharges"] } }, sourceFlag: 1, to: 1, totalAmount: 1, type: 1, createDate: 1
      }
    },
    {
      $lookup:
      {
        from: "kycs",
        let: { truid: "$to" },
        pipeline: [
          {
            $match:
            {
              $expr:
              {
                $and: [{ $eq: ["$truID", "$$truid"] }, { $eq: ["$__t", "KycAll"] }]
              }
            }
          },
        ],
        as: "cust"
      }
    },
    { $unwind: { path: "$cust", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0, invoice: 1, MOP: 1, rTruID: 1, status: 1,
        particularsG24: particularjson("particularsG24"), particularsS99: particularjson("particularsS99"), conversionFrom: 1, conversionTo: 1,
        s99Qty: { $ifNull: ["$particularsS99.qty", 0] },
        g24kQty: { $ifNull: ["$particularsG24.qty", 0] },
        otherCharges: { $ifNull: [{ $toString: "$otherCharges" }, "0"] },
        totalAmount: { $ifNull: [{ $toString: "$totalAmount" }, "0"] },
        partnerCharges: { $ifNull: [{ $toString: "$partnerCharges" }, "0"] },
        nodeCharges: { $ifNull: [{ $toString: "$nodeCharges" }, "0"] }, sourceFlag: 1, to: 1, type: 1,
        fName: "$cust.fName", lName: "$cust.lName", createDate: 1, mobile: "$cust.mobile", docVerified: "$cust.docVerified", KYCFlag: "$cust.KYCFlag"
      }
    },
    { $match: kycQuery }
  ]).allowDiskUse(true).cursor();
  var txn = new Array();
  var createSummaryData = function (buyArr) {
    var btype = "", productType = "", brate = "", amount = 0, tax = 0, earning = 0, totalRevenue = 0, exQty = 0, nodeearning = 0;
    function returndata(particulars, bultype) {
      btype += particulars.qty;
      exQty = particulars.qty;
      if (bultype == "Gold") {
        productType = "TruCoin Gold";
      } else if (bultype == "Silver") {
        productType = "TruCoin Silver";
      } else if (bultype == "SilverGold") {
        productType = "TruCoin Gold & TruCoin Silver";
      } else if (bultype == "GoldSilver") {
        productType = "TruCoin Gold & TruCoin Silver";
      }
      amount += parseFloat(particulars.amount);
      tax += particulars.tax ? parseFloat(particulars.tax) : 0;
      earning += particulars.partnerCharges ? parseFloat(particulars.partnerCharges) : 0;
      nodeearning += parseFloat(particulars.nodeCharges);

      var transactionCharges = particulars.transactionCharges ? parseFloat(particulars.transactionCharges) : 0;
      var clientTransactionCharges = particulars.clientTransactionCharges ? parseFloat(particulars.clientTransactionCharges) : 0;
      totalRevenue += (parseFloat(transactionCharges) + parseFloat(clientTransactionCharges));
      brate = particulars.rate;
    }
    if (buyArr.type == "conversion") {
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
      if ((buyArr.particularsG24 && parseFloat(buyArr.particularsG24.qty) > 0)) {
        returndata(buyArr.particularsG24, "Gold");
      }
      if ((buyArr.particularsS99 && parseFloat(buyArr.particularsS99.qty) > 0)) {
        returndata(buyArr.particularsS99, "Silver");
      }
    }


    var totalamount = 0, revenue = 0;
    if (buyArr.totalAmount) {
      if (buyArr.totalAmount != "NaN") {
        totalamount = buyArr.totalAmount;
      }
    }
    if (totalRevenue) {
      revenue = totalRevenue - earning - nodeearning;
    }
    /*  var fromaddress = "";
     if (buyArr.fromAddress) {
         fromaddress = (buyArr.fromAddress.houseNumber) ? buyArr.fromAddress.houseNumber : "-" + "," + (buyArr.fromAddress.streetNumber) ? buyArr.fromAddress.streetNumber : "-" + "," + (buyArr.fromAddress.city) ? buyArr.fromAddress.city : "-" + "," + (buyArr.fromAddress.state) ? buyArr.fromAddress.state : "-" + "," + (buyArr.fromAddress.country) ? buyArr.fromAddress.country : "-" + "-" + (buyArr.fromAddress.pin) ? buyArr.fromAddress.pin : "-";
     } */
    // console.log(buyArr.invoice)
    var rqueue = {
      "btype": btype,
      "brate": brate,
      "productType": productType,
      "amount": amount.toString(),
      "tax": tax.toString(),
      "earning": earning.toString(),
      "grossearning": totalRevenue.toString(),
      "nodeearning": nodeearning.toString(),
      "exQty": exQty,
      "exStatus": buyArr.status == "success" ? "Success" : "Failure",
      "revenue": revenue.toString()
    };
    return rqueue;
  }
  async function getCompanyName(rTruID) {
    if (rTruID) {
      var resul = await enKycAll.findOne({ "truID": rTruID });
      if (resul && resul.companyName) {
        return resul.companyName;
      }
      else {
        return "COMPANY";
      }
    }
    else {
      return "COMPANY";
    }
  }
  for await (const txndetail of cursor) {
    var arraytxn = {};
    arraytxn["invoice"] = txndetail.invoice;
    arraytxn["to"] = txndetail.to;
    arraytxn["mobile"] = txndetail.mobile;
    var companyName = await getCompanyName(txndetail.rTruID);
    arraytxn["companyName"] = companyName;
    arraytxn["KYCFlag"] = txndetail.docVerified == true && txndetail.KYCFlag == "active" ? "active" : txndetail.docVerified == false && txndetail.KYCFlag == "active" ? "pending" : txndetail.KYCFlag;
    arraytxn["consumerName"] = txndetail.fName + " " + txndetail.lName;
    arraytxn["MOP"] = txndetail.MOP;
    arraytxn["createDate"] = txndetail.createDate;
    arraytxn["rTruID"] = txndetail.rTruID;
    arraytxn["totalAmount"] = decimalChopperFloat(txndetail.totalAmount, 4);
    arraytxn["partnerCharges"] = decimalChopperFloat(txndetail.partnerCharges, 4);
    arraytxn["nodeCharges"] = decimalChopperFloat(txndetail.nodeCharges, 4);
    arraytxn["entityRevenue"] = decimalChopperFloat(txndetail.entityRevenue, 4);
    arraytxn["conversionFrom"] = txndetail.conversionFrom;
    arraytxn["conversionTo"] = txndetail.conversionTo;
    arraytxn["status"] = txndetail.status;
    arraytxn["type"] = txndetail.type;
    var alldata = await createSummaryData(txndetail);
    arraytxn["btype"] = alldata.btype;
    arraytxn["brate"] = decimalChopperFloat(alldata.brate, 4);
    arraytxn["productType"] = alldata.productType;
    arraytxn["amount"] = decimalChopperFloat(alldata.amount, 4);
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
};
exports.consumer_gst_report_adminNEW = async function (req, res, next) {
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
  if (req.body.to) {
    query.to = req.body.to;
  }
  if (req.body.rTruID) {
    query.rTruID = req.body.rTruID;
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
  var oman = await TXN.find(query).count();
  if (end < 0) {
    end = oman;
  };
  var cursor = [];
  if (req.body.isexport) {
    cursor = await TXN.find(query, { _id: 0, hash: 0, __v: 0, md5sign: 0, nodeID: 0, remmitCharges: 0, sourceFlag: 0 }).skip(start).limit(end);
  }
  else {
    cursor = await TXN.find(query, { _id: 0, hash: 0, __v: 0, md5sign: 0, nodeID: 0, remmitCharges: 0, sourceFlag: 0 }).sort(sortQueryWF).skip(start).limit(end);
  }

  var txn = new Array();

  function consumerArray(numbers) {
    const filteredNumbers = numbers.map((num, index) => {
      return num.to;
    });
    return filteredNumbers.filter(function (item, pos) {
      return filteredNumbers.indexOf(item) == pos;
    })
  }
  function entityArray(numbers) {
    const filteredNumbers = numbers.map((num, index) => {
      return num.rTruID;
    });
    return filteredNumbers.filter(function (item, pos) {
      return filteredNumbers.indexOf(item) == pos;
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
  const KycAllCursor = await KycAll.find({ truID: { $in: consumerArray(cursor) } }, { fName: 1, truID: 1, mobile: 1, lName: 1, docVerified: 1, KYCFlag: 1 });
  const enKycAllCursor = await enKycAll.find({ truID: { $in: entityArray(cursor) } }, { companyName: 1, truID: 1, parentTruID: 1 });
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
    function returndata(particulars, bultype, istrans) {
      btype += particulars.qty;
      exQty = particulars.qty;
      if (bultype == "Gold") {
        productType = "TruCoin Gold";
      } else if (bultype == "Silver") {
        productType = "TruCoin Silver";
      } else if (bultype == "SilverGold") {
        productType = "TruCoin Gold & TruCoin Silver";
      } else if (bultype == "GoldSilver") {
        productType = "TruCoin Gold & TruCoin Silver";
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
      if (istrans) {
        totalRevenue += parseFloat(particulars.transferFee);
      } else {
        totalRevenue += (parseFloat(transactionCharges) + parseFloat(clientTransactionCharges));
      }
      brate = particulars.rate;
    }
    if (buyArr.type == "conversion") {
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
    } else {
      var ispay = (buyArr.type == "transfer") ? true : false;
      if (Array.isArray(buyArr.particularsG24) == true || Array.isArray(buyArr.particularsS99) == true) {

        if ((buyArr.particularsG24[0] && parseFloat(buyArr.particularsG24[0].qty) > 0)) {
          await returndata(buyArr.particularsG24[0], "Gold", ispay);
        }
        if ((buyArr.particularsS99[0] && parseFloat(buyArr.particularsS99[0].qty) > 0)) {
          await returndata(buyArr.particularsS99[0], "Silver", ispay);
        }
      }
      else {
        if ((buyArr.particularsG24 && parseFloat(buyArr.particularsG24.qty) > 0)) {
          await returndata(buyArr.particularsG24, "Gold", ispay);
        }
        if ((buyArr.particularsS99 && parseFloat(buyArr.particularsS99.qty) > 0)) {
          await returndata(buyArr.particularsS99, "Silver", ispay);
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
    var clientLoading = [];
    if (enkycdata) {
      clientLoading = chargesLogsCursor.filter((d, index) => {
        try {
          if (d.type) {
            /*  if(!enkycdata.parentTruID){
               console.log("enkycdata.parentTruID",enkycdata)
             } */
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
    // console.log(calculateBaseRate("buy", clientsellTax, clientLoading, "5361.98"));
    var arraytxn = {};
    if (req.body.isexport) {
      arraytxn["sid"] = req.body.sid;
      arraytxn["sltype"] = req.body.sltype;
    }
    arraytxn["invoice"] = txndetail.invoice;
    arraytxn["to"] = txndetail.to;

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
      console.log(txndetail.invoice)
      arraytxn["consumerName"] = consumer.fName + " " + consumer.lName;
      arraytxn["KYCFlag"] = consumer.KYCFlag;
      arraytxn["mobile"] = consumer.mobile;
    }


    var consumer = KycAllCursor.filter(word => word.truID == txndetail.rTruID);
    arraytxn["companyName"] = enkycdata ? enkycdata.companyName : consumer.length > 0 ? consumer[0].fName + " " + consumer[0].lName : txndetail.rTruID;
    arraytxn["MOP"] = txndetail.MOP;
    arraytxn["createDate"] = txndetail.createDate;
    arraytxn["rTruID"] = txndetail.rTruID;
    arraytxn["totalAmount"] = decimalChopperFloat(parseFloat(txndetail.totalAmount), 4);
    arraytxn["entityRevenue"] = decimalChopperFloat(parseFloat(txndetail.entityRevenue), 4);
    arraytxn["conversionFrom"] = txndetail.conversionFrom;
    arraytxn["conversionTo"] = txndetail.conversionTo;
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
  /* if (req.body.isexport) {
    req.result = txn;
    next();
  }
  else {  */
  var data = {
    "draw": req.body.draw,
    "recordsFiltered": oman,
    "recordsTotal": oman,
    "data": txn
  };
  res.send(JSON.stringify(data));
  /* } */

};
// Consumer Panel 
exports.consumerSite_gst_report = async function (req, res, next) {
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
  if (req.body.to) {
    query["$or"] = [{ to: req.body.to }, { "receiverTruID": req.body.to }]
  }
  if (req.body.rTruID) {
    query.rTruID = req.body.rTruID;
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

  if (req.body.isfilterByQty) {
    if (req.body.filterBulType == "G24K") {
      query["particularsG24.qty"] = { $gt: parseFloat(req.body.QtyRangeMin), $lte: parseFloat(req.body.QtyRangeMax) };
    } else {
      query["particularsS99.qty"] = { $gt: parseFloat(req.body.QtyRangeMin), $lte: parseFloat(req.body.QtyRangeMax) };
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
  var oman = await TXN.find(query).count();
  if (end < 0) {
    end = oman;
  };
  var cursor = [];
  if (req.body.isexport) {
    cursor = await TXN.find(query, { _id: 0, hash: 0, __v: 0, md5sign: 0, nodeID: 0, remmitCharges: 0, sourceFlag: 0 }).skip(start).limit(end);
  }
  else {
    cursor = await TXN.find(query, { _id: 0, hash: 0, __v: 0, md5sign: 0, nodeID: 0, remmitCharges: 0, }).sort(sortQueryWF).skip(start).limit(end);
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


  const KycAllCursor = await KycAll.find({ truID: { $in: consumerArray(cursor) } }, { fName: 1, truID: 1, mobile: 1, lName: 1, docVerified: 1, KYCFlag: 1, email: 1, channel: 1, emailVerified: 1 });
  const enKycAllCursor = await enKycAll.find({ truID: { $in: entityArray(cursor) } }, { companyName: 1, truID: 1, parentTruID: 1, brandLogo: 1, channel: 1 });
  const chargesLogsCursor = await chargesLogs.find({ truID: { $in: entityParentArray(enKycAllCursor) } }, { trasactionCharges: 1, truID: 1, createDate: 1, type: 1 });
  let TxnLogs, AtomTxnLogs;
  if (!req.body.isexport) {
    TxnLogs = await logs.find({ invoice: { $in: consumerPGArray(cursor, ["redeemCash"]) } });
    AtomTxnLogs = await Atom.find({ invoice: { $in: consumerPGArray(cursor, ["buy", "buyCash"]) } });
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
    var btype = "", productType = "", brate = "",
      amount = 0, tax = 0, earning = 0, totalRevenue = 0, exQty = 0, nodeearning = 0,
      grosspartnerCharges = 0, grossnodeCharges = 0, tdsonpartnerCharges = 0, tdsonnodeCharges = 0;
    function returndata(particulars, bultype, isTrans) {
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
        totalRevenue += useToFixed(parseFloat(transactionCharges) + parseFloat(clientTransactionCharges));
      }
      brate = particulars.rate;
    }
    var product = [];
    var ispay = (buyArr.type == "transfer") ? true : false;

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
    var totalamount = 0, revenue = 0;
    if (buyArr.totalAmount) {
      if (buyArr.totalAmount != "NaN") {
        totalamount = buyArr.totalAmount;
      }
    }
    if (totalRevenue) {
      revenue = useToFixed(totalRevenue - earning - nodeearning - tdsonpartnerCharges - tdsonnodeCharges);
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
  for await (const txndetail of cursor) {
    var enkycdata = enKycAllCursor.filter(word => word.truID == txndetail.rTruID)[0];
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

    var consumer = KycAllCursor.filter(word => word.truID == txndetail.to)[0];
    arraytxn["consumerName"] = consumer.fName + " " + consumer.lName;
    arraytxn["KYCFlag"] = consumer.KYCFlag;
    arraytxn["mobile"] = consumer.mobile;
    arraytxn["email"] = consumer.email;
    arraytxn["channel"] = consumer.channel;
    arraytxn["emailVerified"] = consumer.emailVerified;
    if (req.body.getStock) {
      var cStocks = await cuStock.aggregate([{ $match: { truID: consumer.truID } }, { $project: { _id: 0, truID: 1, G24K: { "$toString": { $cond: [{ $lt: ["$stock.G24K", 0.000001] }, 0.00, "$stock.G24K"] } }, S99P: { "$toString": { $cond: [{ $lt: ["$stock.S99P", 0.000001] }, 0.00, "$stock.S99P"] } } } },]);
      arraytxn["consumerStock"] = cStocks[0];
    }

    var pgtxnarr = ["buy", "buyCash", "transfer"];
    if (txndetail.type == "transfer") {

      if (req.body.getStock) {
        var cRStocks = await cuStock.aggregate([{ $match: { truID: txndetail.receiverTruID } }, { $project: { _id: 0, truID: 1, G24K: { "$toString": { $cond: [{ $lt: ["$stock.G24K", 0.000001] }, 0.00, "$stock.G24K"] } }, S99P: { "$toString": { $cond: [{ $lt: ["$stock.S99P", 0.000001] }, 0.00, "$stock.S99P"] } } } },]);
        arraytxn["receiverStock"] = cRStocks[0];
      } 
      var csmrdata = KycAllCursor.filter(word => word.truID == txndetail.receiverTruID)[0]; 
      arraytxn["receiverName"] = csmrdata.fName + " " + csmrdata.lName;
      arraytxn["receiverTruID"] = txndetail.receiverTruID;
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
        var temppayby = atomdocs.MOP;
        arraytxn.PGType = "atom";
        arraytxn.payBy = (temppayby == "NB") ? "Net Banking" : (temppayby == "CC") ? "Credit Card" : (temppayby == "DC") ? "Debit Card" : (temppayby === "UP") ? "UPI" : temppayby;
        arraytxn.bankTXNID = atomdocs.bankTxnID;
        arraytxn.paymentCharge = atomdocs.surcharge.toJSON().$numberDecimal;


      }

    }
    if (consumer && consumer.channel) {
      var endata = enKycAllCursor.filter(word => word.channel == consumer.channel)[0];
      if (endata && endata.brandLogo) { arraytxn["brandLogo"] = endata.brandLogo };
    }
    var consumer = KycAllCursor.filter(word => word.truID == txndetail.rTruID);
    arraytxn["companyName"] = txndetail.rTruID == "customer" ? "COMPANY" : enkycdata ? enkycdata.companyName : consumer.length > 0 ? consumer[0].fName + " " + consumer[0].lName : txndetail.rTruID;
    arraytxn["MOP"] = txndetail.MOP;
    arraytxn["applicableTAX"] = (taxper * 100)
    arraytxn["createDate"] = txndetail.createDate;
    arraytxn["rTruID"] = txndetail.rTruID == "customer" ? "Direct Consumer" : txndetail.rTruID;
    arraytxn["sourceFlag"] = txndetail.sourceFlag;
    arraytxn["totalAmount"] = decimalChopperFloat(parseFloat(txndetail.totalAmount), 4);
    arraytxn["entityRevenue"] = decimalChopperFloat(parseFloat(txndetail.entityRevenue), 4);
    arraytxn["conversionFrom"] = txndetail.conversionFrom;
    arraytxn["conversionTo"] = txndetail.conversionTo;
    arraytxn["status"] = txndetail.status;
    arraytxn["type"] = txndetail.type;
    arraytxn["sourceFlag"] = txndetail.sourceFlag;
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
exports.partner_ConsumerList = async function (req, res) {
  var start = req.body.start ? parseInt(req.body.start) : 0;
  var end = req.body.length ? parseInt(req.body.length) : 100;
  var query = {};
  if (req.body.to) {
    query.truID = req.body.to;
  }
  else if (req.body.startdate && req.body.enddate) {
    var startdate = new Date(Date.parse(req.body.startdate));
    var enddate = new Date(Date.parse(req.body.enddate));
    query = { createDate: { $gte: startdate, $lte: enddate } }
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
  if (req.body.rTruID) {
    query.refernceTruID = req.body.rTruID;
  }
  var channel = req.body.channel;
  if (channel) {
    if (query.refernceTruID) {
      delete query.refernceTruID
    }
    query.channel = channel;
  }
  var totalStock24 = 0;
  var totalStock99 = 0;
  var wclBal = 0;
  var conCount = 0;
  if (req.body.isexport) { } else {
    var walletBal = await cuWallet.aggregate([{ $match: query },
    {
      $group: {
        _id: null,
        clBal: { $sum: "$clBal" },
        conCount: { $sum: 1 }
      },
    },
    {
      $project: {
        _id: 0,
        clBal: { "$toString": "$clBal" },
        conCount: 1
      }
    }]);
    if (walletBal.length) {
      wclBal = parseFloat(walletBal[0].clBal);
      conCount = parseFloat(walletBal[0].conCount);
    }
  }
  //if (req.body.rTruID) {
  var earnQeury = await cuStock.aggregate([{ $match: query },
  {
    $group:
    {
      _id: null,
      stock24sum: { $sum: "$stock.G24K" },
      stock99sum: { $sum: "$stock.S99P" }
    }
  }]);
  if (!earnQeury.length) {
    totalStock24 = 0;
    totalStock99 = 0;
  } else {
    totalStock24 = earnQeury[0].stock24sum;
    totalStock99 = earnQeury[0].stock99sum;
  }
  //}
  query._t == "KycAll"
  var oman = await KycAll.find(query).count();
  if (end < 0) {
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
    else if (req.body.sortBy == "walleta") {
      sortByWF = { 'wallet': 1 };
    }
    else if (req.body.sortBy == "walletd") {
      sortByWF = { 'wallet': -1 };
    }
  }

  const consumerL = KycAll.aggregate([
    { $match: query },
    { $sort: sortQuery },
    {
      $project: {
        _id: 0, createDate: 1, gender: 1, KYCFlag: 1, DOB: 1, email: 1, fName: 1, mName: 1,
        lName: 1, mobile: 1, truID: 1, refernceTruID: 1, docVerified: 1, KYCDetails: 1,
        KYCTime: 1, KYCVerifyBy: 1, aadharStatus: 1, panStatus: 1
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
        _id: 0, createDate: 1, gender: 1, KYCFlag: 1, DOB: 1, email: 1, fName: 1, mName: 1,
        lName: 1, mobile: 1, truID: 1, refernceTruID: 1, docVerified: 1, KYCDetails: 1, KYCTime: 1, KYCVerifyBy: 1,
        stock24: { $ifNull: ["$stocks.stock.G24K", 0] }, stock99: { $ifNull: ["$stocks.stock.S99P", 0] },
        wallet: { $ifNull: ["$wallets.clBal", 0] }, aadharStatus: 1, panStatus: 1
      }
    },
    { $sort: sortByWF },
    { $skip: start },
    { $limit: end },
    {
      $project: {
        _id: 0, createDate: 1, gender: 1, KYCFlag: 1, DOB: 1, email: 1, fName: 1, mName: 1,
        lName: 1, mobile: 1, truID: 1, refernceTruID: 1, docVerified: 1, KYCDetails: 1, KYCTime: 1, KYCVerifyBy: 1,
        stock24: { "$toString": { $cond: [{ $lt: ["$stock24", 0.000001] }, 0.00, "$stock24"] } }, stock99: { "$toString": { $cond: [{ $lt: ["$stock99", 0.000001] }, 0.00, "$stock99"] } },
        wallet: 1, aadharStatus: 1, panStatus: 1
      }
    }
  ]).allowDiskUse(true).cursor({ batchSize: 1000 })
  var result = new Array();
  var counter = 0;
  function RefBy(reftruid) {
    if (reftruid) {
      var rid = reftruid.substring(0, 4);
      var refFlag = "direct";
      if (rid === '5000') {
        refFlag = "consumer";
      } else if (rid === '1000') {
        refFlag = "admin";
      } else if (rid === '6000') {
        refFlag = "assetmanager";
      } else if (rid === '7000') {
        refFlag = "assetstore";
      } else if (rid === '8000') {
        refFlag = "entity";
      } else {
        refFlag = "direct";
      }
      return refFlag;
    }
  }
  function getDetails(refFlag, truid) {
    if (refFlag === "assetmanager") {
      return new Promise((resolve, reject) => {
        dlrKycAll.find({ "truID": truid }, function (err, docs) {
          if (!docs.length) {
            resolve({ status: "400", message: "Consumer not exists!" });
          }
          else {
            resolve({ status: "200", fName: docs[0].contactFName, lName: docs[0].contactLName, assetmanagerName: docs[0].assetmanagerName });
          }
        })
      })
    } else if (refFlag === "entity") {
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
    } else {
      return new Promise((resolve, reject) => {
        KycAll.find({
          "truID": truid
        }, function (err, docs) {
          if (!docs.length) {
            resolve({ status: "400" });
          }
          else {
            resolve({ status: "200", CRNNo: docs[0].CRNNo, fName: docs[0].fName, lName: docs[0].lName });
          }
        })
      })
    }
  }
  for await (const txndetail of consumerL) {
    var reftruid = txndetail.refernceTruID ? txndetail.refernceTruID : "0";
    txndetail.consumerName = txndetail.fName + " " + txndetail.lName;
    txndetail.KYCFlag = txndetail.docVerified == true && txndetail.KYCFlag == "active" ? "active" : txndetail.docVerified == false && txndetail.KYCFlag == "active" ? "pending" : txndetail.KYCFlag;
    txndetail.stock24 = decimalChopperFloat(txndetail.stock24, 4);
    txndetail.stock99 = decimalChopperFloat(txndetail.stock99, 4);
    txndetail.wallet = decimalChopperFloat(txndetail.wallet, 4);
    txndetail.rTruID = reftruid;
    var RefByName = RefBy(reftruid);
    txndetail.refFlag = RefByName;
    if (RefBy != "direct") {
      await getDetails(RefByName, reftruid).then((retobj) => {
        if (RefByName === "consumer" || RefByName === "admin") {
          txndetail.referBy = retobj.fName + " " + retobj.lName;
        }
        else if (RefByName === "entity") {
          txndetail.referBy = retobj.companyName ? retobj.companyName.replace("null", "") : retobj.companyName;
        }
        else if (RefByName === "assetmanager") {
          txndetail.referBy = retobj.assetmanagerName;
        }
        else {
          txndetail.referBy = ""
        }
      })
    }
    else {
      txndetail.referBy = ""
    }
    result.push(txndetail)
  }
  var data = {
    "totConsumer": conCount,
    "wclBal": wclBal,
    "totalStock24": decimalChopperFloat(totalStock24, 4),
    "totalStock99": decimalChopperFloat(totalStock99, 4),
    "draw": req.body.draw,
    "recordsFiltered": oman,
    "recordsTotal": oman,
    "data": result
  };
  res.send(JSON.stringify(data));
};
exports.countall_People = async function (req, res) {
  var result = await KycAll.aggregate([{ $match: { "__t": "KycAll" } },
  {
    $facet: {
      direct: [{ $match: { "channel": "Direct" } }, { "$count": "count" }],
      entity: [{ $match: { channel: { "$ne": "Direct" }, refernceTruID: { $regex: /8000/ } } }, { "$count": "count" }],
      admin: [{ $match: { channel: "Company Admin", refernceTruID: { $regex: /1000/ } } }, { "$count": "count" }],
      assetmanager: [{ $match: { channel: { "$ne": "Direct" }, refernceTruID: { $regex: /6000/ } } }, { "$count": "count" }],
      total: [{ "$count": "count" }]
    }
  }]);
  var enresult = await enKycAll.aggregate([
    { $match: { "__t": "KycAll" } },
    {
      $facet: {
        parent: [
          { $match: { isParent: true } },
          { $count: "count" }
        ],
        nodes: [
          { $match: { isParent: false } },
          { $count: "count" }
        ],
        lender: [
          { $match: { isLending: true } },
          { $count: "count" }
        ],
        total: [{ $count: "count" }
        ]
      }
    }
  ])
  var finalresp = {};
  var enfinalresp = {};
  if (!result.length) {
    finalresp = {
      direct: 0,
      entity: 0,
      admin: 0,
      assetmanager: 0,
      total: 0
    };
  }
  else {
    var direct = "0", entity = "0", admin = "0", assetmanager = "0", total = "0";
    if (result[0].direct.length) {
      direct = result[0].direct[0].count;
    }
    if (result[0].entity.length) {
      entity = result[0].entity[0].count;
    }
    if (result[0].admin.length) {
      admin = result[0].admin[0].count;
    }
    if (result[0].assetmanager.length) {
      assetmanager = result[0].assetmanager[0].count;
    }
    if (result[0].total.length) {
      total = result[0].total[0].count;
    }
    finalresp = {
      direct: direct.toString(),
      entity: entity.toString(),
      admin: admin.toString(),
      assetmanager: assetmanager.toString(),
      total: total.toString()
    };
  }
  var parent = "0", nodes = "0", lender = "0", total = "0", adminParent = "0", adminLender = "0";
  if (!enresult.length) {
    enfinalresp = {
      parent: 0,
      nodes: 0,
      lender: 0,
      total: 0
    };
  }
  else {

    if (enresult[0].parent.length) {
      parent = enresult[0].parent[0].count.toString();
    }
    if (enresult[0].nodes.length) {
      nodes = enresult[0].nodes[0].count.toString();
    }
    if (enresult[0].lender.length) {
      lender = enresult[0].lender[0].count.toString();
    }
    if (enresult[0].total.length) {
      total = enresult[0].total[0].count.toString();
    }
    var enfinalresp = {
      parent: parent,
      nodes: nodes,
      lender: lender,
      total: total
    };
    res.json({
      status: "200", resource: {
        consumer: finalresp, entity: enfinalresp
      }
    });
  }
};
exports.cgetGSTReport = function (req, res) {
  var truid = req.body.to;
  KycAll.find({ truID: req.body.to }, async function (err, docs) {
    if (!docs.length) {
      res.json({
        status: "204",
        message: "The request was successful but no body was returned."
      });
    }
    else {
      var companyName = docs[0].fName + " " + docs[0].lName;
      var globalQuery = { "to": truid, status: "success" };
      var inArray = ["buy", "redeemCash", "transfer"];
      var GSTTotalQuery = { "to": truid, status: "success", type: { $in: inArray } };
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
      const result = await TXN.aggregate(GSTQ);
      const resultTotal = await TXN.aggregate(GSTTotalQ);
      var publicStr = {
        particular: result[0],
        total: resultTotal[0]
      }
      publicStr.particular.to = req.body.to;
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
exports.setOnHold_Balance = function (req, res) {
  var value = req.body.value;
  var type = req.body.type
  var onHoldType = req.body.onHoldType;
  var accType = req.body.accType;
  function partnerOnHold() {
    if (req.body.onHoldType == "release") {
      if (type == "wallet") {
        enWallet.findOneAndUpdate({ truID: req.body.to }, {
          $set: { "balOnHold": "0.00", "onHoldType": "release" }
        }, callback)
      }
      else if (type == "G24K" && req.body.onHoldType == "release") {
        enStock.findOneAndUpdate({ truID: req.body.to }, {
          $set: {
            "stock.balOnHoldG24K": "0.00",
            "stock.onHoldDateG24K": new Date(),
            "stock.onHoldTypeG24K": "release"
          }
        }, callback);
      }
      else if (type == "S99P" && req.body.onHoldType == "release") {
        enStock.findOneAndUpdate({ truID: req.body.to }, {
          $set: {
            "stock.balOnHoldS99P": "0.00",
            "stock.onHoldDateS99P": new Date(),
            "stock.onHoldTypeS99P": "release"
          }
        }, callback);
      }

    }
    else {
      var setData = {
      }
      if (type == "wallet") {
        setData.onHoldType = onHoldType;
        setData.balOnHold = parseFloat(value);
        if (req.body.date) {
          var date = new Date(Date.parse(req.body.date));
          setData.onHoldDate = date;
        }
        enWallet.findOneAndUpdate({ truID: req.body.to, clBal: { $gte: parseFloat(value) } }, {
          $set: setData
        }, callback)
      }
      else if (type == "G24K") {
        setData["stock.balOnHoldG24K"] = parseFloat(value);
        setData["stock.onHoldTypeG24K"] = onHoldType;
        if (req.body.date) {
          var date = new Date(Date.parse(req.body.date));
          setData["stock.onHoldDateG24K"] = date;
        }
        enStock.findOneAndUpdate({ truID: req.body.to, "stock.G24K": { $gte: parseFloat(value) } }, {
          $set: setData
        }, callback);
      }
      else if (type == "S99P") {
        setData["stock.balOnHoldS99P"] = parseFloat(value);
        setData["stock.onHoldTypeS99P"] = onHoldType;
        if (req.body.date) {
          var date = new Date(Date.parse(req.body.date));
          setData["stock.onHoldDateS99P"] = date;
        }
        enStock.findOneAndUpdate({ truID: req.body.to, "stock.S99P": { $gte: parseFloat(value) } }, {
          $set: setData
        }, callback);
      }
    }
  }
  function consumerOnHold() {
    if (req.body.onHoldType == "release") {
      if (type == "wallet") {
        cuWallet.findOneAndUpdate({ truID: req.body.to }, {
          $set: { "balOnHold": "0.00", "onHoldType": "release" }
        }, callback)
      }
      else if (type == "G24K" && req.body.onHoldType == "release") {
        cuStock.findOneAndUpdate({ truID: req.body.to }, {
          $set: {
            "stock.balOnHoldG24K": "0.00",
            "stock.onHoldDateG24K": new Date(),
            "stock.onHoldTypeG24K": "release"
          }
        }, callback);
      }
      else if (type == "S99P" && req.body.onHoldType == "release") {
        cuStock.findOneAndUpdate({ truID: req.body.to }, {
          $set: {
            "stock.balOnHoldS99P": "0.00",
            "stock.onHoldDateS99P": new Date(),
            "stock.onHoldTypeS99P": "release"
          }
        }, callback);
      }

    }
    else {
      var setData = {
      }
      if (type == "wallet") {
        setData.onHoldType = onHoldType;
        setData.balOnHold = parseFloat(value);
        if (req.body.date) {
          var date = new Date(Date.parse(req.body.date));
          setData.onHoldDate = date;
        }
        cuWallet.findOneAndUpdate({ truID: req.body.to, clBal: { $gte: parseFloat(value) } }, {
          $set: setData
        }, callback)
      }
      else if (type == "G24K") {
        setData["stock.balOnHoldG24K"] = parseFloat(value);
        setData["stock.onHoldTypeG24K"] = onHoldType;
        if (req.body.date) {
          var date = new Date(Date.parse(req.body.date));
          setData["stock.onHoldDateG24K"] = date;
        }
        cuStock.findOneAndUpdate({ truID: req.body.to, "stock.G24K": { $gte: parseFloat(value) } }, {
          $set: setData
        }, callback);
      }
      else if (type == "S99P") {
        setData["stock.balOnHoldS99P"] = parseFloat(value);
        setData["stock.onHoldTypeS99P"] = onHoldType;
        if (req.body.date) {
          var date = new Date(Date.parse(req.body.date));
          setData["stock.onHoldDateS99P"] = date;
        }
        cuStock.findOneAndUpdate({ truID: req.body.to, "stock.S99P": { $gte: parseFloat(value) } }, {
          $set: setData
        }, callback);
      }
    }
  }
  if (accType == "partner") {
    partnerOnHold();
  }
  else if (accType == "consumer") {
    consumerOnHold();
  }

  function callback(err, result) {
    if (err) {
      res.send({ status: "400", message: "Something went wrong..!!" });
    }
    else if (result) {
      res.json({
        status: "200", message: "Successfully Updated"
      });
    }
    else {
      res.send({ status: "401", message: "Balance not available..!!" });
    }
  }
};
exports.getOnHold_Balance = async function (req, res) {
  var query = {};
  query.truID = req.body.to;
  var consumerL = []
  var accType = req.body.accType;
  if (accType == "partner") {
    consumerL = await enKycAll.aggregate([
      { $match: query },
      {
        $project: {
          _id: 0, truID: 1
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
          _id: 0,
          wallet: { "$toString": { $cond: [{ $lt: [{ $ifNull: ["$wallets.clBal", 0] }, 0.000001] }, 0.00, { $ifNull: ["$wallets.clBal", 0] }] } },
          stock24: { "$toString": { $cond: [{ $lt: [{ $ifNull: ["$stocks.stock.G24K", 0] }, 0.000001] }, 0.00, { $ifNull: ["$stocks.stock.G24K", 0] }] } },
          stock99: { "$toString": { $cond: [{ $lt: [{ $ifNull: ["$stocks.stock.S99P", 0] }, 0.000001] }, 0.00, { $ifNull: ["$stocks.stock.S99P", 0] }] } },
          stock24OnHold: { "$toString": { $cond: [{ $lt: [{ $ifNull: ["$stocks.stock.balOnHoldG24K", 0] }, 0.000001] }, 0.00, { $ifNull: ["$stocks.stock.balOnHoldG24K", 0] }] } },
          stock99OnHold: { "$toString": { $cond: [{ $lt: [{ $ifNull: ["$stocks.stock.balOnHoldS99P", 0] }, 0.000001] }, 0.00, { $ifNull: ["$stocks.stock.balOnHoldS99P", 0] }] } },
          walletOnHold: { "$toString": { $cond: [{ $lt: [{ $ifNull: ["$wallets.balOnHold", 0] }, 0.000001] }, 0.00, { $ifNull: ["$wallets.balOnHold", 0] }] } },
          onHoldDateG24K: { $ifNull: ["$stocks.stock.onHoldDateG24K", ""] },
          onHoldDateS99P: { $ifNull: ["$stocks.stock.onHoldDateS99P", ""] },
          onHoldTypeG24K: { $ifNull: ["$stocks.stock.onHoldTypeG24K", ""] },
          onHoldTypeS99P: { $ifNull: ["$stocks.stock.onHoldTypeS99P", ""] },
          onHoldDate: { $ifNull: ["$wallets.onHoldDate", ""] },
          onHoldType: { $ifNull: ["$wallets.onHoldType", ""] },
        }
      }
    ]);
  }
  else if (accType == "consumer") {
    consumerL = await KycAll.aggregate([
      { $match: query },
      {
        $project: {
          _id: 0, truID: 1
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
          _id: 0,
          wallet: { "$toString": { $cond: [{ $lt: [{ $ifNull: ["$wallets.clBal", 0] }, 0.000001] }, 0.00, { $ifNull: ["$wallets.clBal", 0] }] } },
          stock24: { "$toString": { $cond: [{ $lt: [{ $ifNull: ["$stocks.stock.G24K", 0] }, 0.000001] }, 0.00, { $ifNull: ["$stocks.stock.G24K", 0] }] } },
          stock99: { "$toString": { $cond: [{ $lt: [{ $ifNull: ["$stocks.stock.S99P", 0] }, 0.000001] }, 0.00, { $ifNull: ["$stocks.stock.S99P", 0] }] } },
          stock24OnHold: { "$toString": { $cond: [{ $lt: [{ $ifNull: ["$stocks.stock.balOnHoldG24K", 0] }, 0.000001] }, 0.00, { $ifNull: ["$stocks.stock.balOnHoldG24K", 0] }] } },
          stock99OnHold: { "$toString": { $cond: [{ $lt: [{ $ifNull: ["$stocks.stock.balOnHoldS99P", 0] }, 0.000001] }, 0.00, { $ifNull: ["$stocks.stock.balOnHoldS99P", 0] }] } },
          walletOnHold: { "$toString": { $cond: [{ $lt: [{ $ifNull: ["$wallets.balOnHold", 0] }, 0.000001] }, 0.00, { $ifNull: ["$wallets.balOnHold", 0] }] } },
          onHoldDateG24K: { $ifNull: ["$stocks.stock.onHoldDateG24K", ""] },
          onHoldDateS99P: { $ifNull: ["$stocks.stock.onHoldDateS99P", ""] },
          onHoldTypeG24K: { $ifNull: ["$stocks.stock.onHoldTypeG24K", ""] },
          onHoldTypeS99P: { $ifNull: ["$stocks.stock.onHoldTypeS99P", ""] },
          onHoldDate: { $ifNull: ["$wallets.onHoldDate", ""] },
          onHoldType: { $ifNull: ["$wallets.onHoldType", ""] }
        }
      }
    ]);
  }
  if (consumerL.length > 0) {
    res.send({ status: "200", resource: consumerL[0] });
  }
  else {
    res.send({ status: "200", resource: [] });
  }
};
exports.bind_WalletLog = async function (req, res) {
  var start = req.body.start ? parseInt(req.body.start) : 0;
  var end = req.body.length ? parseInt(req.body.length) : 100;
  var query = {};
  if (req.body.to) {
    query.truID = req.body.to;
  }
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
    query.createDate = { $gte: startdate, $lte: enddate }//16629812723851928013
  }
  if (req.body.invoice) {
    query = { truID: truid, "$or": [{ invoice: req.body.invoice }, { againstInvoice: req.body.invoice }] };
  }
  var oman = await WalletLog.find(query).count();
  if (end < 0) {
    end = oman;
  }
  var cardType = {
    "$switch": {
      "branches": [
        { "case": { "$eq": ["$atominvoice.mopType", "MC"] }, "then": "MasterCard" },
        { "case": { "$eq": ["$atominvoice.mopType", "VI"] }, "then": "VISA Card" },
        { "case": { "$eq": ["$atominvoice.mopType", "MS"] }, "then": "Maestro Card" },
        { "case": { "$eq": ["$atominvoice.mopType", "AX"] }, "then": "American Express" },
        { "case": { "$eq": ["$atominvoice.mopType", "DN"] }, "then": "Diners" }
      ],
      "default": "$atominvoice.mopType",
    }
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
  const cursor = await WalletLog.aggregate([{ $sort: sortQuery },
  { $match: query },
  { $skip: start },
  { $limit: end },
  {
    $project: {
      _id: 0, tType: 1, createDate: 1, truID: 1, Cr: { $toString: { $abs: '$Cr' } }, Dr: { $toString: { $abs: '$Dr' } },
      invoice: 1, particulars: 1, status: 1, desc: 1,
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
      let: { truid: "$truID", "accountno": "$bankinvoice.Ben_Acct_No" },
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

        },
      ],
      as: "bankDetails"
    }
  },
  { $unwind: { path: "$bankDetails", preserveNullAndEmptyArrays: true } },
  {
    $project: {
      isConsumer: checkConsumer,
      mop: { $cond: { if: { $eq: ["$tType", "walletToBank"] }, then: "$bankinvoice.Mode_of_Pay", else: { $cond: { if: { $eq: ["$subType", "VA"] }, then: "Virtual Account", else: "$atominvoice.MOP" } } } },
      cardType: { $cond: { if: { $eq: ["$tType", "walletToBank"] }, then: "$bankinvoice.Mode_of_Pay", else: { $cond: { if: { $eq: ["$subType", "VA"] }, then: "Virtual Account", else: cardType } } } },
      pgType: { $cond: { if: { $eq: ["$tType", "walletToBank"] }, then: "bank", else: { $cond: { if: { $eq: ["$tType", "addMoney"] }, then: { $cond: { if: { $eq: ["$subType", "VA"] }, then: "VA", else: "atom" } }, else: "" } } } },
      bankTxnID: { $cond: { if: { $eq: ["$tType", "walletToBank"] }, then: "$bankinvoice.TranID", else: "$atominvoice.bankTxnID" } },
      bankName: { $cond: { if: { $eq: ["$tType", "walletToBank"] }, then: "$bankDetails.accountDetails.bank_name", else: { $ifNull: ["$atominvoice.bankName", "$va.senderIFSC"] } } },
      _id: 0, tType: 1, createDate: 1, truID: 1, Cr: 1, Dr: 1, invoice: 1, particulars: 1, status: 1,
      againstInvoice: { $ifNull: ["$againstInvoice", "$invoice"] },
      beneficiaryAccountNumber: "$va.beneficiaryAccountNumber",
      creditDate: "$va.creditDate",
      senderName: { $cond: { if: { $eq: ["$tType", "walletToBank"] }, then: "$bankDetails.accountDetails.companyName", else: "$va.senderName" } },
      senderAccountNumber: { $cond: { if: { $eq: ["$tType", "walletToBank"] }, then: "$bankDetails.accountDetails.last4", else: "$va.senderAccountNumber" } },
      senderIFSC: { $cond: { if: { $eq: ["$tType", "walletToBank"] }, then: "$bankDetails.accountDetails.IFSC", else: "$va.senderIFSC" } },
      messageType: "$va.messageType",
      UTRNumber: "$va.UTRNumber",
      desc: 1
    }
  }, {
    $project: {
      isConsumer: { $cond: { if: { $eq: ["$isConsumer", "consumer"] }, then: true, else: false } },
      mop: 1,
      pgType: 1,
      bankTxnID: 1,
      error_Desc: 1,
      bankName: 1,
      _id: 0, tType: 1, createDate: 1, truID: 1, Cr: 1, Dr: 1, invoice: 1, particulars: 1, status: 1, desc: 1,
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
  }
  ])
  var txn = new Array();

  function consumerArray(numbers) {
    const filteredNumbers = numbers.map((num, index) => {
      return num.truID;
    });
    return filteredNumbers.filter(function (item, pos) {
      return filteredNumbers.indexOf(item) == pos;
    })
  }

  const KycAllCursor = await KycAll.find({ truID: { $in: consumerArray(cursor) } }, { fName: 1, truID: 1, mobile: 1, lName: 1, docVerified: 1, KYCFlag: 1 });
  for await (const txndetail of cursor) {
    var totAmt = txndetail.Cr != "0" ? txndetail.Cr : txndetail.Dr != "0" ? txndetail.Dr : "0"
    txndetail.totalAmount = decimalChopperFloat(totAmt, 4);
    var consumer = KycAllCursor.filter(word => word.truID == txndetail.truID)[0];
    txndetail.name = consumer.fName + " " + consumer.lName;
    if (txndetail.desc) {
      txndetail.desc = txndetail.desc;
      txndetail.title = txndetail.tType ? capitalizeFirstLetter(txndetail.tType) : txndetail.tType;
    }
    else {
      var desc = walDesc.walletDescription(txndetail.tType, "wallet");
      txndetail.desc = desc.desc;
      txndetail.title = desc.transType;
    }
    txndetail.againstInvoice = txndetail.againstInvoice ? txndetail.againstInvoice : "-";
    txn.push(txndetail);
  }
  var data = {
    "draw": req.body.draw,
    "recordsFiltered": oman,
    "recordsTotal": oman,
    "data": txn
  };
  res.send(JSON.stringify(data));
};
function decimalChopperFloat(num, fixed) {
  if (num) {
    try {
      var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?');
      var number = num.toString().match(re)[0]
      return parseFloat(number);
    }
    catch (ex) {
      return 0;
    }
  }
  else {
    return 0;
  }
};

exports.getPGInvoice = async function (req, res) {
  try {
    var result;
    if (req.body.type == "addMoney") {
      if (req.body.isPeople == "consumer") {
        result = await WalletLog.aggregate([
          { $match: { "invoice": req.body.invoice, "tType": "addMoney" } },
          {
            $project: {
              _id: 0, invoice: 1, truID: 1, type: 1, createDate: 1
            }
          },
          {
            $project: {
              invoice: 1, truID: 1, type: 1, createDate: 1
            }
          },
          {
            $lookup: {
              from: "atomlogs",
              localField: "invoice",
              foreignField: "invoice",
              as: "pgdetailatom"
            }
          },
          { $unwind: { path: "$pgdetailatom", preserveNullAndEmptyArrays: true } },
          {
            $project: {
              invoice: 1, truID: 1, type: 1, CRNNo: 1, createDate: 1,
              pgdetail: "$pgdetailatom",
              PGType: "atom"
            }
          },
          {
            $project: {
              invoice: 1, truID: 1, CRNNo: 1, type: 1, createDate: 1, PGType: 1,
              txnDate: { $ifNull: ["$pgdetail.createDate", "$createDate"] },
              amount: { $toString: { $ifNull: ["$pgdetail.amount", "$pgdetail.totalAmount"] } },
              txnID: { $ifNull: ["$pgdetail.txnID", "$pgdetail.atomID"] }
            }
          }
        ]);
      }
      else {
        result = await eWalletLog.aggregate([
          { $match: { "invoice": req.body.invoice, $or: [{ "tType": "addMoney" }] } },
          {
            $project: {
              _id: 0, invoice: 1, truID: 1, type: 1, createDate: 1
            }
          },
          {
            $project: {
              invoice: 1, truID: 1, type: 1, createDate: 1
            }
          },
          {
            $lookup: {
              from: "atomlogs",
              localField: "invoice",
              foreignField: "invoice",
              as: "pgdetailatom"
            }
          },
          { $unwind: { path: "$pgdetailatom", preserveNullAndEmptyArrays: true } },
          {
            $project: {
              invoice: 1, truID: 1, type: 1, CRNNo: 1, createDate: 1,
              pgdetail: "$pgdetailatom",
              PGType: "atom"
            }
          },
          {
            $project: {
              invoice: 1, truID: 1, CRNNo: 1, type: 1, createDate: 1, PGType: 1,
              txnDate: { $ifNull: ["$pgdetail.createDate", "$createDate"] },
              amount: { $toString: { $ifNull: ["$pgdetail.amount", "$pgdetail.totalAmount"] } },
              txnID: { $ifNull: ["$pgdetail.txnID", "$pgdetail.atomID"] }
            }
          }
        ]);
      }
    }
    else {
      if (req.body.isPeople == "consumer") {
        result = await TXN.aggregate([
          { $match: { "invoice": req.body.invoice } },
          {
            $project: {
              _id: 0, invoice: 1, to: 1, type: 1, createDate: 1, rTruID: 1
            }
          },
          {
            $project: {
              invoice: 1, truID: "$to", type: 1, createDate: 1
            }
          },
          {
            $lookup: {
              from: "atomlogs",
              localField: "invoice",
              foreignField: "invoice",
              as: "pgdetailatom"
            }
          },
          { $unwind: { path: "$pgdetailatom", preserveNullAndEmptyArrays: true } },
          {
            $project: {
              invoice: 1, truID: 1, type: 1, CRNNo: 1, createDate: 1,
              pgdetail: "$pgdetailatom",
              PGType: "atom"
            }
          },
          {
            $project: {
              invoice: 1, truID: 1, CRNNo: 1, type: 1, createDate: 1, PGType: 1,
              txnDate: { $ifNull: ["$pgdetail.createDate", "$createDate"] },
              amount: { $toString: { $ifNull: ["$pgdetail.amount", "$pgdetail.totalAmount"] } },
              txnID: { $ifNull: ["$pgdetail.txnID", "$pgdetail.atomID"] }
            }
          }
        ]);
      }
      else if (req.body.isPeople == "remmit") {
        result = await TXN.aggregate([
          { $match: { "invoice": req.body.invoice } },
          {
            $project: {
              _id: 0, invoice: 1, truID: "$to", type: 1, createDate: 1, rTruID: 1
            }
          }]);
        if (result && result.length > 0) {
          var atomres = await eAtom.aggregate([{ $match: { "invoice": req.body.invoice } },
          {
            $project: {
              atomDate: 1,
              amount: { $toString: { $ifNull: ["$amount", "0"] } },
              atomID: 1
            }
          }
          ]);
          result[0].txnDate = result[0].createDate;
          result[0].amount = parseFloat(atomres[0].amount);
          result[0].txnID = atomres[0].atomID;
          result[0].PGType = "atom";

        }
      }
    }
    if (result && result.length > 0) {
      res.json({
        status: "200", resource: result[0]
      });
    }
    else {
      res.json({ status: "401", resource: [], message: "no record found" });
    }

  }
  catch (ex) { }
} 