
'use strict';
var AccModal = require('../models/accModal');
const { v4: uuidv4 } = require('uuid');
exports.linkAccount = async function (req, res) {
  try {
    var accountId = uuidv4();
    var Que = { "truID": req.body.truID, "bankAccounts.last4": req.body.last4 };
    var count = await AccModal.countDocuments(Que);
    if (count > 0) {
      res.status(411).json({ status: '411', message: "Duplicate account not allowed..!!" })
    }
    else {
      req.body.accountNo = req.body.accountNo;
      req.body.IFSC = req.body.IFSC;
      linkedBankAccount(req.body.truID, accountId); // insert
    }
    async function linkedBankAccount(truID, accountId) {
      try {
        req.body.accountId = accountId;
        if (req.body.truID) {
          delete req.body.truID;
        }
        var bank = {
          "truID": truID,
          "id": uuidv4(),
          "bankAccounts": req.body
        }
        var Que = { "truID": truID };
        var isAvail = await AccModal.countDocuments(Que);
        if (isAvail > 0) {
          AccModal.findOneAndUpdate({ truID: truID },
            { $addToSet: { bankAccounts: req.body } }, { new: true }, function (err, result) {
              if (err) {
                res.status(500).json({ status: '500', message: 'Internal Server Error' });
              }
              else {
                AccModal.findOneAndUpdate({ truID: truID },
                  { $set: { isDefault: accountId } }, { new: true }, function (err, result) {
                    if (err) {
                      res.status(500).json({ status: '500', message: 'Internal Server Error' });
                    }
                    else {
                      var filtered = result.bankAccounts.filter(function (obj) {
                        return obj.accountId == accountId;
                      });
                      var data = {
                        bankAccounts: filtered,
                        truID: truID,
                        isDefault: accountId
                      }
                      res.status(200).json({
                        status: '200', resource: data
                      });
                    }
                  })
              }
            })
        }
        else {
          bank.isDefault = accountId;
          var accModal = new AccModal(bank);
          accModal.save(function (err, result) {
            if (err) {
              res.status(500).json({ status: '500', message: 'Internal Server Error' });
            }
            else {
              if (result._id) {
                delete result._id
              }
              if (result.bankAccounts._id) {
                delete result.bankAccounts._id
              }
              res.status(200).json({ status: '200', resource: result });
            }
          })
        }
      }
      catch (error) {
        res.status(400).json({ status: '400', message: error.message })
      }
    }
  }
  catch (error) {
    res.status(400).json({ status: '400', message: error.message })
  }
};

exports.fetchAccount = async function (req, res) {
  try {
    var query = {};
    if (req.body.truID) {
      query.truID = req.body.truID;
    }

    var banks = {
      $filter: {
        input: '$bankAccounts',
        as: 'item',
        cond: { $eq: ['$$item.accountId', req.body.accountId ? req.body.accountId : "$isDefault"] }
      }
    }

    var ifscSearch = {
      $filter: {
        input: '$bankAccounts',
        as: 'item',
        cond: { $and: [{ $eq: ['$$item.accountNo', req.body.accountno] }, { $eq: ['$$item.IFSC', req.body.ifsc] }] }
      }
    }

    var project = {
      _id: 0, id: 1, truID: 1,
      bankAccounts: req.body.accountno ? ifscSearch : req.body.type ? 1 : banks
    }
    var sortQuery = { 'createdAt': -1 };
    const result = await AccModal.aggregate([
      { $match: query },
      { $sort: sortQuery },
      {
        $project: project
      }
    ]);
    if (result.length > 0) {
      res.send({ status: "200", resource: result[0] });
    }
    else {
      res.status(200).send({ status: "204", message: "account not found" })
    }

  }
  catch (error) {
    res.status(400).send({ status: "400", message: error.message })
  }
};
exports.unlinkAccount = async function (req, res) {
  try {
    var isAvail = await AccModal.find({ truID: req.body.truID, bankAccounts: { $elemMatch: { accountId: req.body.accountId } } });
    if (isAvail.length > 0) {
      AccModal.findOneAndUpdate({ truID: req.body.truID, "bankAccounts.accountId": req.body.accountId },
        { $set: { "bankAccounts.$.status": req.body.status } }, { new: true }, function (err, result) {
          if (err) {
            res.status(500).json({ status: '500', message: 'Internal Server Error' });
          }
          else {
            if (req.body.status == "active") {
              AccModal.findOneAndUpdate({ truID: req.body.truID, "bankAccounts.accountId": req.body.accountId },
                { $set: { isDefault: req.body.accountId } }, { new: true }, async function (err, result) {
                  var filtered = result.bankAccounts.filter(function (obj) {
                    return obj.accountId == req.body.accountId;
                  });

                  var data = {
                    bankAccounts: filtered,
                    truID: req.body.truID,
                    isDefault: req.body.accountId
                  }
                  res.status(200).json({
                    status: '200', resource: data
                  });
                })
            }
            else {
              res.status(200).json({ status: '200', resource: result });
            }

          }
        })
    }
    else {
      res.status(411).json({ status: '411', message: "Your account is already unlinked or invalid account Id..!!" });
    }
  }
  catch (error) {
    res.status(400).json({ status: '400', message: error.message })
  }
};
exports.setDefaultAccount = async function (req, res) {
  try {
    var isAvail = await AccModal.countDocuments({ truID: req.body.truID });
    if (isAvail > 0) {
      AccModal.findOneAndUpdate({ truID: req.body.truID, bankAccounts: { $elemMatch: { status: "active", accountId: req.body.accountId } } },
        { $set: { isDefault: req.body.accountId } }, { new: true }, function (err, result) {
          if (err) {
            res.status(500).json({ status: '500', message: 'Internal Server Error' });
          }
          else if (result) {
            var filtered = result.bankAccounts.filter(function (obj) {
              return obj.accountId == req.body.accountId;
            });
            var data = {
              bankAccounts: filtered,
              truID: req.body.truID,
              isDefault: req.body.accountId
            }
            res.status(200).json({
              status: '200', resource: data
            });
          }
          else {
            res.status(411).json({ status: '411', message: "Account id is not active or valid..!!" });
          }
        })
    }
    else {
      res.status(411).json({ status: '411', message: "Invalid Request" });
    }
  }
  catch (error) {
    res.status(400).json({ status: '400', message: error.message })
  }
};