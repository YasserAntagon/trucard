'use strict'
var enKycAll = require('../models/entityModel/remmitKYCAllModel');
exports.fetchSalesPerson = async function (req, res) {
  var text = req.body.searchTerm;
  var matchqry = { "__t": "KycAll" }
  if (text) {
    matchqry = { "__t": "KycAll", salesCode: { $regex: ".*^" + text + ".*", $options: 'i' } };
  }
  var rTruID = req.body.rTruID;
  if (rTruID) {
    matchqry.parentTruID = rTruID;
  }
  const DataQueryNode = enKycAll.aggregate([{ $match: matchqry },
  {
    $project: {
      _id: 0,
      salesCode: 1, truID: 1, "companyName": 1
    }
  },
  { $sort: { createDate: 1 } },
  { $limit: 5 }
  ]).allowDiskUse(true).cursor({ batchSize: 1000 });
  var result = new Array();
  for await (const txndetail of DataQueryNode) {
    txndetail.id = txndetail.salesCode;
    txndetail.text = txndetail.salesCode;
    result.push(txndetail);
  }
  var dt = { id: 0, text: "- Search By Sales Person / Reference Code -" };
  result.unshift(dt)
  res.send(result)
};
