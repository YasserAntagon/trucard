'use strict'
var enKycAll = require('../models/entityModel/remmitKYCAllModel');
var custKycAll = require('../models/custModel/custKYCAllModel');
var enTXN = require('../models/entityModel/remmitTXNModel');
var custTXN = require('../models/custModel/custTXNModel');
var WalletLog = require("../models/entityModel/remmitWalletLogModel");
var walDesc = require('./Description');
function capitalizeFirstLetter(s) {
  return s[0].toUpperCase() + s.slice(1);
}
exports.fetchBind_Self_Entity = async function (req, res) {
  var truid = req.body.rTruID;
  enKycAll.find({ truID: truid }, async function (err, docs) {
    if (!docs.length) {
      res.json({ status: "204", message: "Invalid Partner" });
    } else {
      var companyName = docs[0].companyName ? docs[0].companyName : [];

      var start = req.body.start ? parseInt(req.body.start) : 0;
      var end = req.body.length ? parseInt(req.body.length) : 100;

      var query = { $or: [{ to: truid }, { receiverTruID: truid }], type: { $in: ["buy", "buyCash", "redeemCash"] } };
      if (req.body.type) {
        query.type = req.body.type;
      }
      if (req.body.invoice) {
        query.invoice = req.body.invoice;
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
          sortQuery = { 'totalAmount': -1 }
        }
        else if (req.body.sortBy == "low") {
          sortQuery = { 'totalAmount': 1 }
        }
      }
      if (req.body.status && req.body.status !== "all") {
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
      const cursor = await enTXN.aggregate([{ $sort: sortQuery },
      { $match: query },
      { $skip: start },
      { $limit: end },
      {
        $project: {
          invoice: 1, MOP: 1, otherCharges: 1, _id: 0, particularsG24: 1, particularsS99: 1, status: 1,
          remmitCharges: 1, sourceFlag: 1, totalAmount: 1, type: 1, createDate: 1, rTruID: 1,
          to: "$to", from: "$to"
        }
      },
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
          particularsG24: 1, particularsS99: 1, status: 1, rTruID: 1,
          totalAmount: { $ifNull: [{ $toString: "$totalAmount" }, "0"] }, mobile: "$entity.mobile",
          remmitCharges: 1, sourceFlag: 1, to: 1, type: 1, createDate: 1, companyName: "$entity.companyName", from: 1,
          name: "$entity.companyName",
        }
      },
      { $sort: { createDate: -1 } }
      ]);


      function consumerArray(numbers) {
        var reversalarr = numbers.map((num, index) => {
          return num.from;

        });
        return reversalarr.filter(function (item, pos) {
          return reversalarr.indexOf(item) == pos;
        })
      }

      const KycAllCursor = await custKycAll.find({ truID: { $in: consumerArray(cursor) } }, { fName: 1, truID: 1, mobile: 1, lName: 1, docVerified: 1, KYCFlag: 1 });
      var txn = new Array();
      var createSummaryData = function (buyArr) {

        var btype = "", productType = "", brate = "", amount = 0, tax = 0, transferFee = 0, g24rate = 0, g99prate = 0, earning = 0, clientrevenue = 0, totalRevenue = 0;
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
          transferFee += parseFloat(particulars.transferFee);
          brate = parseFloat(particulars.rate);
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

        /*   if (totalRevenue) {
            revenue = totalRevenue - earning
          } */
        var rqueue = {
          "brate": brate,
          "productType": productType,
          "amount": amount.toString(),
          "tax": tax.toString(),
          "exQty": exQty,
          "exStatus": (buyArr.status == "success") ? "Success" : buyArr.status == "reversal" ? "Reversal" : "Failure"
        };
        return rqueue;
      }

      for await (const txndetail of cursor) {
        var arraytxn = {};
        arraytxn["invoice"] = txndetail.invoice;
        arraytxn["to"] = txndetail.from;
        arraytxn["companyName"] = txndetail.companyName;
        arraytxn["rTruID"] = txndetail.to;
        arraytxn["companyName"] = txndetail.companyName;
        arraytxn["mobile"] = txndetail.mobile;
        arraytxn["MOP"] = txndetail.MOP;
        arraytxn["createDate"] = txndetail.createDate;
        arraytxn["type"] = txndetail.type;
        arraytxn["isConsumer"] = false;
        arraytxn["name"] = `${String(txndetail.name)}\n<small>(${String(txndetail.to.replace(/.(?=.{4})/g, 'x'))})</small>`;
        var alldata = await createSummaryData(txndetail);
        arraytxn["brate"] = decimalChopperFloat(alldata.brate, 4);
        arraytxn["totalAmount"] = decimalChopperFloat(txndetail.totalAmount, 4);
        arraytxn["tax"] = decimalChopperFloat(alldata.tax, 4);
        arraytxn["productType"] = alldata.productType;
        arraytxn["amount"] = decimalChopperFloat(alldata.amount, 4);
        arraytxn["exQty"] = decimalChopperFloat(alldata.exQty, 4);
        arraytxn["exStatus"] = alldata.exStatus;
        txn.push(arraytxn);
      }

      var data = {
        "draw": req.body.draw,
        "recordsFiltered": oman,
        "recordsTotal": oman,
        "data": txn
      };
      res.send(JSON.stringify(data));
    }
  })

};
exports.fetchNode_ByNameMobile = async function (req, res) {
  var truid = req.body.rTruID;
  var text = req.body.q;
  var matchqry = { parentTruID: truid, $or: [{ companyName: { $regex: ".*^" + text + ".*", $options: 'i' } }, { contactFName: { $regex: ".*^" + text + ".*", $options: 'i' } }, { contactLName: { $regex: ".*^" + text + ".*", $options: 'i' } }, { mobile: text }], __t: "KycAll" };
  const DataQueryNode = enKycAll.aggregate([{ $match: matchqry },
  {
    $project: {
      _id: 0, email: 1, contactFName: 1, contactLName: 1,  //DB query to fetch all consumer
      mobile: 1, truID: 1, "companyName": 1, "partnerName": { $concat: ["$contactFName", " ", "$contactLName"] }
    }
  },
  { $sort: { createDate: -1 } }
  ]).allowDiskUse(true).cursor({ batchSize: 1000 })
  var result = new Array();
  for await (const txndetail of DataQueryNode) {
    if (req.body.rTruID != txndetail.truID) {
      result.push(txndetail)
    }
  }
  res.send(result)
}
exports.fetchNode = async function (req, res) {
  var text = req.body.searchTerm;
  var matchqry = { "__t": "KycAll" }
  if (text) {
    matchqry = { "__t": "KycAll", $or: [{ companyName: { $regex: ".*^" + text + ".*", $options: 'i' } }, { contactFName: { $regex: ".*^" + text + ".*", $options: 'i' } }, { contactLName: { $regex: ".*^" + text + ".*", $options: 'i' } }, { mobile: text }, { truID: text }], __t: "KycAll" };
  }
  var rTruID = req.body.rTruID;
  if (rTruID) {
    matchqry.parentTruID = rTruID;
  }
  var isParent = req.body.isParent;
  if (isParent == "parent") {
    matchqry.isParent = true;
  }
  if (req.body.onlyParent == "parent") {
    matchqry.parentTruID ? delete matchqry.parentTruID : null;
    matchqry.isParent = true;
  }
  const DataQueryNode = enKycAll.aggregate([{ $match: matchqry },
  {
    $project: {
      _id: 0, email: 1,  //DB query to fetch all consumer
      mobile: 1, truID: 1, "companyName": 1
    }
  },
  { $sort: { createDate: 1 } },
  { $limit: 5 }
  ]).allowDiskUse(true).cursor({ batchSize: 1000 })
  var result = new Array();

  for await (const txndetail of DataQueryNode) {
    //if (req.body.rTruID != txndetail.truID) {
    var companyName = txndetail.companyName.replace('null', '');
    var data = companyName + " - " + replaceWithX(txndetail.truID) + " - " + txndetail.mobile;
    txndetail.id = txndetail.truID;
    txndetail.text = data;
    result.push(txndetail)
    // }
  }
  var dt = {
    id: 0,
    text: "- Search Partner -"
  }
  if (req.body.onlyParent == "parent") {
    dt.text = "- Search Partner -"
  }
  if (req.body.multiple == "multiple") {

  }
  else {
    result.unshift(dt)
  }
  res.send(result)
};
exports.node_List = async function (req, res) {
  var truid = req.body.rTruID;
  var start = req.body.start ? parseInt(req.body.start) : 0;
  var end = req.body.length ? parseInt(req.body.length) : 100;
  var query = { "parentTruID": truid };
  if (req.body.to) {
    query.truID = req.body.to;
  }
  else if (req.body.startdate && req.body.enddate) {
    var startdate = new Date(Date.parse(req.body.startdate));
    var enddate = new Date(Date.parse(req.body.enddate));
    query = { "parentTruID": truid, createDate: { $gte: startdate, $lte: enddate } };
  }
  if (req.body.salecode) {
    var regex = new RegExp("^" + req.body.salecode.toLowerCase(), "i");
    query.salesCode = regex;
  }
  if (req.body.KYCFlag) {
    query.KYCFlag = req.body.KYCFlag;
  }
  var oman = await enKycAll.find(query).count();
  if (end < 0) {
    end = oman;
  }
  var sortQuery = { 'createDate': -1 };
  const consumerL = enKycAll.aggregate([
    { $sort: sortQuery },
    { $match: query },
    { $skip: start },
    { $limit: end },
    {
      $project: {
        _id: 0, createDate: 1, KYCFlag: 1, DOB: 1, email: 1,
        mobile: 1, truID: 1, parentTruID: 1,
        docVerified: 1, KYCDetails: 1,
        address: 1, companyName: 1, contactFName: 1, contactLName: 1, salesCode: 1
      }
    },
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
        _id: 0, createDate: 1, KYCFlag: 1, DOB: 1, email: 1, kycDesc: "$accstatuses.reason", kycSource: "$accstatuses.source",
        kycDate: "$accstatuses.createDate", kycmodifiedBy: "$accstatuses.modifiedBy",
        mobile: 1, truID: 1, parentTruID: 1,
        docVerified: 1, KYCDetails: 1,
        address: 1, companyName: 1, contactFName: 1, contactLName: 1, salesCode: 1
      }
    }
  ]).allowDiskUse(true).cursor({ batchSize: 1000 })
  var result = new Array();
  for await (const txndetail of consumerL) {
    txndetail.companyName = txndetail.companyName.replace('null', '');
    txndetail.KYCFlag = txndetail.KYCFlag == "holder" ? "onhold" : txndetail.KYCFlag;
    txndetail.partnerName = txndetail.contactFName == "0" ? "-" : txndetail.contactFName + " " + txndetail.contactLName;
    txndetail.rTruID = txndetail.parentTruID;
    txndetail.salesCode = txndetail.salesCode ? txndetail.salesCode : "-";
    txndetail.address = txndetail.address ? txndetail.address.city + ", " + txndetail.address.state + ", " + txndetail.address.country + "-" + txndetail.address.pin : "";
    if (req.body.rTruID != txndetail.truID) {
      result.push(txndetail);
    }
  }
  var data = {
    "draw": req.body.draw,
    "recordsFiltered": oman,
    "recordsTotal": oman,
    "data": result
  };
  res.send(JSON.stringify(data));
}

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
      invoice: 1, particulars: 1, status: 1, desc: 1, moneyAdded: 1, charges: { $toString: { $abs: '$charges' } }, cashback: { $toString: { $abs: '$cashback' } },
      againstInvoice: { $ifNull: ["$againstInvoice", "0"] }, subType: { $ifNull: ["$subType", "NA"] }
    }
  },
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
      let: { truid: "$truID", accountno: "$bankinvoice.Ben_Acct_No" },
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
      moneyAdded: 1, charges: 1, cashback: 1,
      mop: { $cond: { if: { $eq: ["$tType", "walletToBank"] }, then: "$bankinvoice.Mode_of_Pay", else: { $cond: { if: { $eq: ["$subType", "VA"] }, then: "Virtual Account", else: "$atominvoice.MOP" } } } },
      cardType: { $cond: { if: { $eq: ["$tType", "walletToBank"] }, then: "$bankinvoice.Mode_of_Pay", else: { $cond: { if: { $eq: ["$subType", "VA"] }, then: "Virtual Account", else: cardType } } } },
      pgType: { $cond: { if: { $eq: ["$tType", "walletToBank"] }, then: "bank", else: { $cond: { if: { $eq: ["$tType", "addMoney"] }, then: { $cond: { if: { $eq: ["$subType", "VA"] }, then: "VA", else: "atom" } }, else: "" } } } },
      bankTxnID: { $cond: { if: { $eq: ["$tType", "walletToBank"] }, then: "$bankinvoice.TranID", else: "$atominvoice.bankTxnID" } },
      bankName: { $cond: { if: { $eq: ["$tType", "walletToBank"] }, then: "$bankDetails.accountDetails.bank_name", else: { $ifNull: ["$atominvoice.bankName",  "$va.senderIFSC"] } } },
      _id: 0, tType: 1, createDate: 1, truID: 1, Cr: 1, Dr: 1, invoice: 1, particulars: 1, status: 1,
      againstInvoice: { $ifNull: ["$againstInvoice", "$invoice"] },
      beneficiaryAccountNumber: "$va.beneficiaryAccountNumber",
      creditDate: "$va.creditDate",
      senderName: { $cond: { if: { $eq: ["$tType", "walletToBank"] }, then: "$bankDetails.accountDetails.name", else: "$va.senderName" } },
      senderAccountNumber: { $cond: { if: { $eq: ["$tType", "walletToBank"] }, then: "$bankDetails.accountDetails.accountNo", else: "$va.senderAccountNumber" } },
      senderIFSC: { $cond: { if: { $eq: ["$tType", "walletToBank"] }, then: "$bankDetails.accountDetails.IFSC", else: "$va.senderIFSC" } },
      messageType: "$va.messageType",
      UTRNumber: "$va.UTRNumber",
      desc: 1
    }
  }, {
    $project: {
      isConsumer: { $cond: { if: { $eq: ["$isConsumer", "consumer"] }, then: true, else: false } },
      mop: 1,
      moneyAdded: 1, charges: 1, cashback: 1,
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
      // upi: 1,
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
  ]);


  function invoiceArray(numbers) {
    var reversalarr = numbers.map((num, index) => {
      if (num.status == "reversal") {
        return num.againstInvoice;
      }
    });
    var allsuccessarr = numbers.map((num, index) => {
      if (num.status == "success") {
        return num.invoice;
      }
    });
    var arrr3 = reversalarr.concat(allsuccessarr);
    return arrr3.filter(function (item, pos) {
      return arrr3.indexOf(item) == pos;
    })
  }

  function consumerArray(numbers) {
    var reversalarr = numbers.map((num, index) => {
      return num.to;

    });
    return reversalarr.filter(function (item, pos) {
      return reversalarr.indexOf(item) == pos;
    })
  }

  const allTXNCursor = await custTXN.find({ invoice: { $in: invoiceArray(cursor) } }, { invoice: 1, to: 1, receiverTruID: 1, status: 1, type: 1 });
  const KycAllCursor = await custKycAll.find({ truID: { $in: consumerArray(allTXNCursor) } }, { fName: 1, truID: 1, mobile: 1, lName: 1, docVerified: 1, KYCFlag: 1 });


  var txn = new Array();
  for await (const txndetail of cursor) {
    var totAmt = txndetail.Cr != "0" ? txndetail.Cr : txndetail.Dr != "0" ? txndetail.Dr : "0"
    txndetail.totalAmount = decimalChopperFloat(totAmt, 4);
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
    txndetail.rTruID = txndetail.truID;
    var custnameArrbytxn = ["buy", "buyCash", "redeemCash", "transfer"]
    if (custnameArrbytxn.includes(txndetail.tType)) {
      let findinv = (txndetail.status === "reversal") ? txndetail.againstInvoice : txndetail.invoice;
      TXNobj = allTXNCursor.filter(word => word.invoice == findinv)[0];
      let username = KycAllCursor.filter(word => word.truID == TXNobj.to)[0];
      txndetail.name = `${String(username.fName + " " + username.lName)}\n(${String(username.truID.replace(/.(?=.{4})/g, 'x'))})`;

    }
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
exports.countNode = async function (req, res) {
  var query = { referenceTruID: req.body.rTruID, KYCFlag: "pending", "docVerified": false };
  var oman = await enKycAll.find(query).count();
  res.send({ status: "200", pcount: oman });
};

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
    query.to = req.body.rTruID;
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
    query.to = { $in: kycNodes[0].nodeTruID };
    // earningQuery.truID = { $in: kycNodes[0].nodeTruID };
  }



  if (!req.body.isexport) {

    var earnQeury = await WalletLog.aggregate([{ $match: earningQuery },
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
    if (!earnQeury.length) {
      partnerearning = 0;
    } else {
      partnerearning = earnQeury[0].revenue;
    }


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



  var oman = await enTXN.find(query).count();
  if (end < 0) {
    end = oman;
  }
  const cursor = enTXN.aggregate([{ $sort: sortQuery },
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
      nodeCharges: { $ifNull: [{ $toString: "$nodeCharges" }, "0"] }, sourceFlag: 1, to: 1, type: 1, companyName: "$cust.companyName", fName: "$cust.contactFName", lName: "$cust.contactLName", createDate: 1
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
    arraytxn["companyName"] = txndetail.companyName;
    arraytxn["consumerName"] = txndetail.companyName;
    arraytxn["rTruID"] = txndetail.to;
    arraytxn["MOP"] = txndetail.MOP;
    arraytxn["createDate"] = txndetail.createDate;
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
  // res.json({ status: "200", resource: txn });
};