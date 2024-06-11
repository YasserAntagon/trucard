
'use strict'

var Kyc = require('../models/custKYCModel'),
  KycAll = require('../models/custKYCAllModel'),
  Beneficiary = require('../models/custBeneficiaryModel'),
  Mop = require('../models/custMOPModel');
  const descr = require('./decryptAllResponse');
exports.test = function (req, res) {
  res.json({ message: "Welcome to Company Api" });
};

exports.add_mop_account = function (req, res) {
  var mop = new Mop(req.user);
  var truid = req.body.truid;
  var bname = req.body.bname;
  var ifsc = req.body.ifsc.toUpperCase();
  var custname = req.body.custname;
  var accountno = req.body.accountno;
  var acctype = req.body.acctype;
  var relationship = req.body.relationship;
  var query = { truID: truid };
  KycAll.find(query, function (err, docs) {
    if (!docs.length) {
      res.json({
        status: "204",
        message: 'The request was successful but no TruID was returned.'
      });
    }
    else {
      if (bname != undefined && ifsc != undefined && custname != undefined &&
        accountno != undefined && acctype != undefined) {
        if (acctype === "self") {
          Mop.aggregate([
            { $match: query },
            { $project: { _id: 0, accountdetails: "$MOP.accountDetails" } },
            { $unwind: { path: "$accountdetails", preserveNullAndEmptyArrays: true } },
            { $match: { "accountdetails.accType": "self", "accountdetails.accountNo": accountno } },
            { $project: { "accountstatus": "$accountdetails.status" } },
            { $project: { "status": { $cond: { if: { $eq: ["$accountstatus", "active"] }, then: 200, else: 400 } } } }
          ]).exec(function (err, result) {
            if (result[0] === undefined) {
              Mop.findOneAndUpdate({ truID: truid, "MOP.accountDetails.accType": "self", "MOP.accountDetails.status": "active" },
                { $set: { "MOP.accountDetails.$.status": "inactive" } }, function (err, resp) {
                  if (err) {
                    res.send(err);
                  } else {
                    Mop.findOneAndUpdate(query, {
                      $addToSet: {
                        "MOP.accountDetails": {
                          bankName: bname,
                          IFSC: ifsc,
                          custName: custname,
                          accountNo: accountno,
                          accType: acctype,
                          relationship: relationship
                        }
                      }
                    }, { upsert: true }, callback)

                    function callback(err, numAffected) {
                      if (err)
                        res.send(err);
                      var respresult = Mop.aggregate([{ "$match": { truID: truid } },
                      { "$project": { _id: 0, "accountDetails": "$MOP.accountDetails", truID: 1 } },
                      { $unwind: "$accountDetails" },
                      { $match: { "accountDetails.status": "active" } },
                      { $group: { _id: "$truID", accountDetails: { $addToSet: "$accountDetails" } } }
                      ]);
                      respresult.exec(function (err, result) {
                        if (err) {
                          response.status(500).send({ error: err })
                          return next(err);
                        }
                        else {
                          var resource = result[0]
                          res.json({ status: "200", resource: resource });
                        }
                      });
                    };
                  }
                })
            }
            else {
              var status = result[0].status;
              if (status === 200) {
                res.json({
                  status: "204",
                  message: 'The Account is already added.'
                });
              }
              else if (status === 400) {
                Mop.findOneAndUpdate({ truID: truid, "MOP.accountDetails.accType": "self", "MOP.accountDetails.status": "active" },
                  { $set: { "MOP.accountDetails.$.status": "inactive" } }, function (err, resp) {
                    if (err) {
                      res.send(err);
                    } else {
                      Mop.findOneAndUpdate({ truID: truid, "MOP.accountDetails.accountNo": accountno },
                        { $set: { "MOP.accountDetails.$.status": "active" } }, callback1)
                      function callback1(err, numAffected) {
                        if (err) {
                          res.send(err);
                        }
                        else {
                          var respresult = Mop.aggregate([{ "$match": { truID: truid } },
                          { "$project": { _id: 0, "accountDetails": "$MOP.accountDetails", truID: 1 } },
                          { $unwind: "$accountDetails" },
                          { $match: { "accountDetails.status": "active" } },
                          { $group: { _id: "$truID", accountDetails: { $addToSet: "$accountDetails" } } }
                          ]);
                          respresult.exec(function (err, result) {
                            if (err) {
                              response.status(500).send({ error: err })
                              return next(err);
                            }
                            else {
                              var resource = result[0]
                              res.json({ status: "200", resource: resource });
                            }
                          });
                        }
                      }
                    }
                  })
              }
            }
          });
        } else {
          var respresult = Mop.aggregate([
            { $match: query },
            { $project: { _id: 0, accountdetails: "$MOP.accountDetails" } },
            { $unwind: { path: "$accountdetails", preserveNullAndEmptyArrays: true } },
            { $match: { "accountdetails.accountNo": accountno } },
            { $project: { "accountstatus": "$accountdetails.status" } },
            { $project: { "status": { $cond: { if: { $eq: ["$accountstatus", "active"] }, then: 200, else: 400 } } } }
          ]).exec(function (err, result) {
            if (result[0] === undefined) {
              Mop.findOneAndUpdate(query, {
                $addToSet: {
                  "MOP.accountDetails":
                  {
                    bankName: bname,
                    IFSC: ifsc,
                    custName: custname,
                    accountNo: accountno,
                    accType: acctype,
                    relationship: relationship

                  }
                }
              }, { upsert: true }, callback)

              function callback(err, numAffected) {
                if (err)
                  res.send(err);
                var respresult = Mop.aggregate([{ "$match": { truID: truid } },
                { "$project": { _id: 0, "accountDetails": "$MOP.accountDetails", truID: 1 } },
                { $unwind: "$accountDetails" },
                { $match: { "accountDetails.status": "active" } },
                { $group: { _id: "$truID", accountDetails: { $addToSet: "$accountDetails" } } }
                ]);
                respresult.exec(function (err, result) {
                  if (err) {
                    response.status(500).send({ error: err })
                    return next(err);
                  }
                  else {
                    var resource = result[0]
                    res.json({ status: "200", resource: resource });
                  }
                });
              };
            }
            else {
              var status = result[0].status;
              if (status === 200) {
                res.json({
                  status: "204",
                  message: 'The Account is already added.'
                });
              }
              else if (status === 400) {
                Mop.findOneAndUpdate({ truID: truid, "MOP.accountDetails.accountNo": accountno },
                  { $set: { "MOP.accountDetails.$.status": "active" } }, callback1)
                function callback1(err, numAffected) {
                  if (err) {
                    res.send(err);
                  }
                  else {
                    var respresult = Mop.aggregate([{ "$match": { truID: truid } },
                    { "$project": { _id: 0, "accountDetails": "$MOP.accountDetails", truID: 1 } },
                    { $unwind: "$accountDetails" },
                    { $match: { "accountDetails.status": "active" } },
                    { $group: { _id: "$truID", accountDetails: { $addToSet: "$accountDetails" } } }
                    ]);
                    respresult.exec(function (err, result) {
                      if (err) {
                        response.status(500).send({ error: err })
                        return next(err);
                      }
                      else {
                        var resource = result[0]
                        res.json({ status: "200", resource: resource });
                      }
                    });
                  }
                }
              }
            }
          }
          )
        }
      }
      else {
        res.json({ status: 204, message: "* Field Required!!" })
      }
    }
  }
  )
}

exports.add_mop_upiAccount = function (req, res) {
  var truid = req.body.truid;
  var ifsc = req.body.ifsc.toUpperCase();
  var custname = req.body.custname;
  var upiaddress = req.body.upiaddress;
  var acctype = req.body.acctype;
  var relationship = req.body.relationship;
  var RESPONSE_CODE = req.body.RESPONSE_CODE;
  var ACCOUNT_TYPE = req.body.ACCOUNT_TYPE;
  var TXN_ID = req.body.TXN_ID;
  var BANK_REF_NUM = req.body.BANK_REF_NUM;
  var PHONE_NO = req.body.PHONE_NO;
  var HASH = req.body.HASH;
  var PAY_ID = req.body.PAY_ID;
  var ORDER_ID = req.body.ORDER_ID;
  var RESPONSE_MESSAGE = req.body.RESPONSE_MESSAGE;
  var USER_TYPE = req.body.USER_TYPE;
  var query = { truID: truid };
  KycAll.find(query, function (err, docs) {
    if (!docs.length) {
      res.json({
        status: "204",
        message: 'The request was successful but no TruID was returned.'
      });
    }
    else {
      if (upiaddress != undefined && ifsc != undefined && custname != undefined && acctype != undefined) {
        if (acctype === "self") {
          var respresult = Mop.aggregate([
            { $match: query },
            { $project: { _id: 0, upiDetails: "$MOP.upiDetails" } },
            { $unwind: { path: "$upiDetails", preserveNullAndEmptyArrays: true } },
            { $match: { "upiDetails.accType": "self", "upiDetails.upiaddress": upiaddress } },
            { $project: { "accountstatus": "$upiDetails.status" } },
            { $project: { "status": { $cond: { if: { $eq: ["$accountstatus", "active"] }, then: 200, else: 400 } } } }
          ]).exec(function (err, result) {
            if (result[0] === undefined) {
              Mop.findOneAndUpdate({ truID: truid, "MOP.upiDetails.accType": "self", "MOP.upiDetails.status": "active" },
                { $set: { "MOP.upiDetails.$.status": "inactive" } }, function (err, resp) {
                  if (err) {
                    res.send(err);
                  } else {
                    Mop.findOneAndUpdate(query, {
                      $addToSet: {
                        "MOP.upiDetails":
                        {
                          truID: req.body.truid,
                          IFSC: req.body.ifsc.toUpperCase(),
                          custName: req.body.custname,
                          status: status,
                          accType: acctype,
                          RESPONSE_CODE: RESPONSE_CODE,
                          ACCOUNT_TYPE: ACCOUNT_TYPE,
                          TXN_ID: TXN_ID,
                          BANK_REF_NUM: BANK_REF_NUM,
                          PHONE_NO: PHONE_NO,
                          HASH: HASH,
                          PAY_ID: PAY_ID,
                          upiaddress: upiaddress,
                          ORDER_ID: ORDER_ID,
                          RESPONSE_MESSAGE: RESPONSE_MESSAGE,
                          USER_TYPE: USER_TYPE,
                          relationship: relationship
                        }
                      }
                    }, { upsert: true }, callback)

                    function callback(err, numAffected) {
                      if (err) {
                        res.json({ status: "500", message: err.message });
                      }
                      else {
                        var respresult = Mop.aggregate([{ "$match": { truID: truid } },
                        { "$project": { _id: 0, "upiDetails": "$MOP.upiDetails", truID: 1 } },
                        { $unwind: "$upiDetails" },
                        { $match: { "upiDetails.status": "active" } },
                        { $group: { _id: "$truID", upiDetails: { $addToSet: "$upiDetails" } } }
                        ]);
                        respresult.exec(function (err, result) {
                          if (err) {
                            response.status(500).send({ error: err })
                            return next(err);
                          }
                          else {
                            var resource = result[0]
                            res.json({ status: "200", resource: resource });
                          }
                        });
                      }
                    };
                  }
                })
            }
            else {
              var status = result[0].status;
              if (status === 200) {
                res.json({
                  status: "204",
                  message: 'The Account is already added.'
                });
              }
              else if (status === 400) {
                Mop.findOneAndUpdate({ truID: truid, "MOP.upiDetails.accType": "self", "MOP.upiDetails.status": "active" },
                  { $set: { "MOP.upiDetails.$.status": "inactive" } }, function (err, resp) {
                    if (err) {
                      res.send(err);
                    } else {
                      Mop.findOneAndUpdate({ truID: truid, "MOP.upiDetails.upiaddress": upiaddress },
                        { $set: { "MOP.upiDetails.$.status": "active" } }, callback1)
                      function callback1(err, numAffected) {
                        if (err) {
                          res.send(err);
                        }
                        else {
                          var respresult = Mop.aggregate([{ "$match": { truID: truid } },
                          { "$project": { _id: 0, "upiDetails": "$MOP.upiDetails", truID: 1 } },
                          { $unwind: "$upiDetails" },
                          { $match: { "upiDetails.status": "active" } },
                          { $group: { _id: "$truID", upiDetails: { $addToSet: "$upiDetails" } } }
                          ]);
                          respresult.exec(function (err, result) {
                            if (err) {
                              response.status(500).send({ error: err })
                              return next(err);
                            }
                            else {
                              var resource = result[0]
                              res.json({ status: "200", resource: resource });
                            }
                          });
                        }
                      }
                    }
                  })
              }
            }
          }
          )
        } else {
          var respresult = Mop.aggregate([
            { $match: query },
            { $project: { _id: 0, upiDetails: "$MOP.upiDetails" } },
            { $unwind: { path: "$upiDetails", preserveNullAndEmptyArrays: true } },
            { $match: { "upiDetails.upiaddress": upiaddress } },
            { $project: { "accountstatus": "$upiDetails.status" } },
            { $project: { "status": { $cond: { if: { $eq: ["$accountstatus", "active"] }, then: 200, else: 400 } } } }
          ]).exec(function (err, result) {
            if (result[0] === undefined) {
              Mop.findOneAndUpdate(query, {
                $addToSet: {
                  "MOP.upiDetails":
                  {
                    truID: truid,
                    IFSC: ifsc,
                    custName: custname,
                    status: status,
                    accType: acctype,
                    RESPONSE_CODE: RESPONSE_CODE,
                    ACCOUNT_TYPE: ACCOUNT_TYPE,
                    TXN_ID: TXN_ID,
                    BANK_REF_NUM: BANK_REF_NUM,
                    PHONE_NO: PHONE_NO,
                    HASH: HASH,
                    PAY_ID: PAY_ID,
                    upiaddress: upiaddress,
                    ORDER_ID: ORDER_ID,
                    RESPONSE_MESSAGE: RESPONSE_MESSAGE,
                    USER_TYPE: USER_TYPE,
                    relationship: relationship
                  }
                }
              }, { upsert: true }, callback)
              function callback(err, numAffected) {
                if (err)
                  res.send(err);
                var respresult = Mop.aggregate([{ "$match": { truID: truid } },
                { "$project": { _id: 0, "upiDetails": "$MOP.upiDetails", truID: 1 } },
                { $unwind: "$upiDetails" },
                { $match: { "upiDetails.status": "active" } },
                { $group: { _id: "$truID", upiDetails: { $addToSet: "$upiDetails" } } }
                ]);
                respresult.exec(function (err, result) {
                  if (err) {
                    response.status(500).send({ error: err })
                    return next(err);
                  }
                  else {
                    var resource = result[0]
                    res.json({ status: "200", resource: resource });
                  }
                });
              };
            }
            else {
              var status = result[0].status;
              if (status === 200) {
                res.json({ status: "204", message: 'This UPI already exists..!!' });
              }
              else if (status === 400) {
                Mop.findOneAndUpdate({ truID: truid, "MOP.upiDetails.upiaddress": upiaddress },
                  { $set: { "MOP.upiDetails.$.status": "active" } }, callback1)
                function callback1(err, numAffected) {
                  if (err) {
                    res.send(err);
                  }
                  else {
                    var respresult = Mop.aggregate([{ "$match": { truID: truid } },
                    { "$project": { _id: 0, "upiDetails": "$MOP.upiDetails", truID: 1 } },
                    { $unwind: "$upiDetails" },
                    { $match: { "upiDetails.status": "active" } },
                    { $group: { _id: "$truID", upiDetails: { $addToSet: "$upiDetails" } } }
                    ]);
                    respresult.exec(function (err, result) {
                      if (err) {
                        response.status(500).send({ error: err })
                        return next(err);
                      }
                      else {
                        var resource = result[0]
                        res.json({ status: "200", resource: resource });
                      }
                    });
                  }
                }
              }
            }
          }
          )
        }
      }
      else {
        res.json({ status: 204, message: "* Field Required!!" })
      }
    }
  }
  )
}

exports.add_mop_card = function (req, res) {
  var mop = new Mop(req.user);
  var truid = req.body.truid;
  var query = { truID: truid };
  var nameoncard = req.body.nameoncard;;
  var cardno = req.body.cardno;;
  var exp = req.body.exp;;
  var cvv = req.body.cvv;;

  KycAll.find(query, function (err, docs) {
    if (!docs.length) {
      res.json({
        status: "204",
        message: 'The request was successful but no TruID was returned.'
      });
    } else {
      if (nameoncard != undefined && cardno != undefined && exp != undefined && cvv != undefined) {
        var respresult = Mop.aggregate([
          { $match: query },
          { $project: { _id: 0, carddetails: "$MOP.cardDetails" } },
          { $unwind: { path: "$carddetails", preserveNullAndEmptyArrays: true } },
          { $match: { "carddetails.cardNo": cardno } },
          { $project: { "cardstatus": "$carddetails.status" } },
          { $project: { "status": { $cond: { if: { $eq: ["$cardstatus", "active"] }, then: 200, else: 400 } } } }
        ]).exec(function (err, result) {
          if (result[0] === undefined) {
            Mop.findOneAndUpdate(query, {
              $addToSet: {
                "MOP.cardDetails":
                {
                  nameOnCard: nameoncard,
                  cardNo: cardno,
                  exp: exp,
                  CVV: cvv,
                }
              }
            }, { upsert: true }, callback)
            function callback(err, numAffected) {
              if (err)
                res.send(err);
              var respresult = Mop.aggregate([{ "$match": { truID: truid } },
              { "$project": { _id: 0, "cardDetails": "$MOP.cardDetails", truID: 1 } },
              { $unwind: "$cardDetails" },
              { $match: { "cardDetails.status": "active" } },
              { $group: { _id: "$truID", cardDetails: { $addToSet: "$cardDetails" } } }
              ]);
              respresult.exec(function (err, result) {
                if (err) {
                  response.status(500).send({ error: err })
                  return next(err);
                }
                else {
                  var resource = result[0]
                  res.json({ status: "200", resource: resource });
                }
              });
            };
          }
          else {
            var status = result[0].status;
            if (status === 200) {
              res.json({
                status: "204",
                message: 'The request was successful but the Card is already added.'
              });
            }
            else if (status === 400) {
              Mop.findOneAndUpdate({ truID: truid, "MOP.cardDetails.cardNo": cardno },
                { $set: { "MOP.cardDetails.$.status": "active" } }, callback1)
              function callback1(err, numAffected) {
                if (err) {
                  res.send(err);
                }
                else {
                  var respresult = Mop.aggregate([{ "$match": { truID: truid } },
                  { "$project": { _id: 0, "cardDetails": "$MOP.cardDetails", truID: 1 } },
                  { $unwind: "$cardDetails" },
                  { $match: { "cardDetails.status": "active" } },
                  { $group: { _id: "$truID", cardDetails: { $addToSet: "$cardDetails" } } }
                  ]);
                  respresult.exec(function (err, result) {
                    if (err) {
                      response.status(500).send({ error: err })
                      return next(err);
                    }
                    else {
                      var resource = result[0]
                      res.json({ status: "200", resource: resource });
                    }
                  });
                }
              }
            }
          }
        }
        )
      }
      else {
      }
    }
  }
  )
}

exports.add_mop_wallet = function (req, res) {
  var mop = new Mop(req.user);
  var truid = req.body.truid;
  var walletname = req.body.walletname;
  var mobile = req.body.mobile;
  var walletid = walletname.concat('-', mobile)
  var query = { truID: truid };

  KycAll.find(query, function (err, docs) {
    if (!docs.length) {
      res.json({
        status: "204",
        message: "The request was successful but no TruID was returned."
      });
    } else {
      if (walletname != undefined && mobile != undefined) {
        var respresult = Mop.aggregate([
          { $match: query },
          { $project: { _id: 0, walletdetails: "$MOP.walletDetails" } },
          { $unwind: { path: "$walletdetails", preserveNullAndEmptyArrays: true } },
          { $match: { "walletdetails.walletID": walletid } },
          { $project: { "walletstatus": "$walletdetails.status" } },
          { $project: { "status": { $cond: { if: { $eq: ["$walletstatus", "active"] }, then: 200, else: 400 } } } }
        ]).exec(function (err, result) {

          if (result[0] === undefined) {
            Mop.findOneAndUpdate(query, {
              $addToSet: {
                "MOP.walletDetails":
                {
                  walletID: walletid,
                  email: req.body.email,
                },
              }
            }, { upsert: true }, callback)
            function callback(err, numAffected) {
              if (err)
                res.send(err);
              var respresult = Mop.aggregate([{ "$match": { truID: truid } },
              { "$project": { _id: 0, "walletDetails": "$MOP.walletDetails", truID: 1 } },
              { $unwind: "$walletDetails" },
              { $match: { "walletDetails.status": "active" } },
              { $group: { _id: "$truID", walletDetails: { $addToSet: "$walletDetails" } } }
              ]);
              respresult.exec(function (err, result) {
                if (err) {
                  response.status(500).send({ error: err })
                  return next(err);
                }
                else {
                  var resource = result[0]
                  res.json({ status: "200", resource: resource });
                }
              });
            };
          }
          else {
            var status = result[0].status;
            if (status === 200) {
              res.json({
                status: "204",
                message: 'The request was successful but the Wallet is already added.'
              });
            }
            else if (status === 400) {
              Mop.findOneAndUpdate({ truID: truid, "MOP.walletDetails.walletID": walletid },
                { $set: { "MOP.walletDetails.$.status": "active" } }, callback1)
              function callback1(err, numAffected) {
                if (err) {
                  res.send(err);
                }
                else {
                  var respresult = Mop.aggregate([{ "$match": query },
                  { "$project": { _id: 0, "walletDetails": "$MOP.walletDetails", truID: 1 } },
                  { $unwind: "$walletDetails" },
                  { $match: { "walletDetails.status": "active" } },
                  { $group: { _id: "$truID", walletDetails: { $addToSet: "$walletDetails" } } }
                  ]);

                  respresult.exec(function (err, result) {
                    if (err) {
                      response.status(500).send({ error: err })
                      return next(err);
                    }
                    else {
                      var resource = result[0]
                      res.json({ status: "200", resource: resource });
                    }
                  });
                }
              }
            }
          }
        }
        )
      }
      else {

      }
    }
  }
  )
}

exports.remove_mop_account = function (req, res) {
  var mop = new Mop(req.user);
  var accountno = req.body.accountno;
  var truid = req.body.truid;
  var query = { truID: truid, "MOP.accountDetails.accountNo": accountno };
  KycAll.find({ truID: truid }, function (err, docs) {
    if (!docs.length) {
      res.json({
        status: "204",
        message: "The request was successful but no TruID was returned."
      });
    } else {
      if (accountno != undefined) {
        Mop.update(query, { $set: { "MOP.accountDetails.$.status": "inactive" } }, callback) 
        function callback(err, numAffected) {
          if (err)
            res.send(err);
          var respresult = Mop.aggregate([{ "$match": { truID: truid } },
          { "$project": { _id: 0, "accountDetails": "$MOP.accountDetails", truID: 1 } },
          { $unwind: "$accountDetails" },
          { $match: { "accountDetails.status": "active" } },
          { $group: { _id: "$truID", accountDetails: { $addToSet: "$accountDetails" } } }
          ]);
          respresult.exec(function (err, result) {
            if (err) {
              response.status(500).send({ error: err })
              return next(err);
            }
            else {
              var resource = result[0]
              res.json({ status: "200", resource: resource });
            }
          });
        };
      }
      else {
      }
    }
  })
}

exports.remove_upi_account = function (req, res) {
  var mop = new Mop(req.user);
  var upiaddress = req.body.upiaddress;
  var truid = req.body.truid;
  var query = { truID: truid, "MOP.upiDetails.upiaddress": upiaddress };
  KycAll.find({ truID: truid }, function (err, docs) {
    if (!docs.length) {
      res.json({
        status: "204",
        message: "The request was successful but no TruID was returned."
      });
    } else {
      if (upiaddress != undefined) {
        Mop.update(query, { $set: { "MOP.upiDetails.$.status": "inactive" } }, callback)
        function callback(err, numAffected) {
          if (err)
            res.send(err);
          var respresult = Mop.aggregate([{ "$match": { truID: truid } },
          { "$project": { _id: 0, "upiDetails": "$MOP.upiDetails", truID: 1 } },
          { $unwind: "$upiDetails" },
          { $match: { "upiDetails.status": "active" } },
          { $group: { _id: "$truID", upiDetails: { $addToSet: "$upiDetails" } } }
          ]);
          respresult.exec(function (err, result) {
            if (err) {
              response.status(500).send({ error: err })
              return next(err);
            }
            else {

              if (result.length > 0) {
                var resource = result[0]
                res.json({ status: "200", resource: resource });
              }
              else {
                res.json({ status: "200", resource: [{ upiDetails: [] }] });
              }
            }
          });
        };
      }
      else {
      }
    }
  })
}

exports.remove_mop_card = function (req, res) {
  var mop = new Mop(req.user);
  var cardno = req.body.cardno;
  var truid = req.body.truid;

  var query = { "MOP.cardDetails.cardNo": cardno, truID: truid };
  KycAll.find({ truID: truid }, function (err, docs) {
    if (!docs.length) {
      res.json({
        status: "204",
        message: "The request was successful but no TruID was returned."
      });
    } else {
      if (cardno != undefined) {
        Mop.findOneAndUpdate(query, { $set: { "MOP.cardDetails.$.status": "inactive" } }, callback)
        function callback(err, numAffected) {
          if (err)
            res.send(err);
          var respresult = Mop.aggregate([{ "$match": { truID: truid } },
          { "$project": { _id: 0, "cardDetails": "$MOP.cardDetails", truID: 1 } },
          { $unwind: "$cardDetails" },
          { $match: { "cardDetails.status": "active" } },
          { $group: { _id: "$truID", cardDetails: { $addToSet: "$cardDetails" } } }
          ]);
          respresult.exec(function (err, result) {
            if (err) {
              response.status(500).send({ error: err })
              return next(err);
            }
            else {
              var resource = result[0]
              res.json({ status: "200", resource: resource });
            }
          });
        };
      }
      else {
      }
    }
  })
}

exports.remove_mop_wallet = function (req, res) {
  var mop = new Mop(req.user);
  var truid = req.body.truid;
  var walletname = req.body.walletname;
  var mobile = req.body.mobile;
  var walletid = walletname.concat('-', mobile);
  var query = { truID: truid, "MOP.walletDetails.walletID": walletid, "MOP.walletDetails.status": "active" };

  KycAll.find({ truID: truid }, function (err, docs) {
    if (!docs.length) {
      res.json({
        status: "204",
        message: "The request was successful but no TruID was returned."
      });
    } else {
      if (walletname != undefined && mobile != undefined) {
        Mop.findOneAndUpdate(query, { $set: { "MOP.walletDetails.$.status": "inactive" } }, callback)
        function callback(err, numAffected) {
          if (err)
            res.send(err);
          var respresult = Mop.aggregate([{ "$match": { truID: truid } },
          { "$project": { _id: 0, "walletDetails": "$MOP.walletDetails", truID: 1 } },
          { $unwind: "$walletDetails" },
          { $match: { "walletDetails.status": "active" } },
          { $group: { _id: "$truID", walletDetails: { $addToSet: "$walletDetails" } } }
          ]);
          respresult.exec(function (err, result) {
            if (err) {
              response.status(500).send({ error: err })
              return next(err);
            }
            else {
              var resource = result[0]
              res.json({ status: "200", resource: resource });
            }
          });
        };
      }
      else {

      }
    }
  })
}



exports.list_accounts = function (req, res) {
  var badd = new KycAll(req.user);
  var truid = req.body.truid;
  var acctype = req.body.acctype;

  KycAll.find({ truID: truid }, function (err, docs) {
    if (!docs.length) {
      res.json({
        status: "204",
        message: "The request was successful but no TruID was returned."
      });
    } else {
      var listquery;
      if (acctype == "both") {
        listquery = Mop.aggregate([{ "$match": { truID: truid } },
        { "$project": { _id: 0, "accountDetails": "$MOP.accountDetails", truID: 1 } },
        { $unwind: "$accountDetails" },
        { $match: { "accountDetails.status": "active" } },
        { $group: { _id: "$truID", accountDetails: { $addToSet: "$accountDetails" } } }
        ]);
      }
      else {
        listquery = Mop.aggregate([{ "$match": { truID: truid } },
        { "$project": { _id: 0, "accountDetails": "$MOP.accountDetails", truID: 1 } },
        { $unwind: "$accountDetails" },
        { $match: { "accountDetails.status": "active", "accountDetails.accType": acctype, } },
        { $group: { _id: "$truID", accountDetails: { $addToSet: "$accountDetails" } } }
        ]);
      }


      listquery.exec(function (err, result) {
        if (err) {
          response.status(500).send({ error: err })
          return next(err);
        }
        else if (result.length === 0) {
          res.json({
            status: "204",
            message: "No Recoud Found."
          })
        }
        else {
          var resource = result[0];
          res.json({ status: "1000", resource: resource });
        }
      }
      )
    }
  }
  )
}

exports.list_upiaccount = function (req, res) { 
  var truid = req.body.truid;
  var acctype = req.body.acctype;
  KycAll.find({ truID: truid }, function (err, docs) {
    if (!docs.length) {
      res.json({
        status: "204",
        message: "The request was successful but no TruID was returned."
      });
    } else {
      var listquery;
      if (acctype == "both") {
        listquery = Mop.aggregate([{ "$match": { truID: truid } },
        { "$project": { _id: 0, "upiDetails": "$MOP.upiDetails", truID: 1 } },
        { $unwind: "$upiDetails" },
        { $match: { "upiDetails.status": "active" } },
        { $group: { _id: "$truID", upiDetails: { $addToSet: "$upiDetails" } } }
        ]);
      }
      else {
        listquery = Mop.aggregate([{ "$match": { truID: truid } },
        { "$project": { _id: 0, "upiDetails": "$MOP.upiDetails", truID: 1 } },
        { $unwind: "$upiDetails" },
        { $match: { "upiDetails.status": "active", "upiDetails.accType": acctype } },
        { $group: { _id: "$truID", upiDetails: { $addToSet: "$upiDetails" } } }
        ]);
      }


      listquery.exec(async function (err, result) {
        if (err) {
          response.status(500).send({ error: err })
          return next(err);
        }
        else if (result.length === 0) {
          res.json({
            status: "204",
            message: "No Recoud Found."
          })
        }
        else {
          var resource = result[0];
          var mydata= await descr.respDecrypt(resource) 
          // res.json({ status: "1000", resource: mydata });
          res.json({ status: "1000", resource: resource });
        }
      }
      )
    }
  }
  )
}

exports.list_card = function (req, res) {
  var mop = new Mop(req.user);
  var truid = req.body.truid;
  KycAll.find({ truID: truid }, function (err, docs) {
    if (!docs.length) {
      res.json({
        status: "204",
        message: "The request was successful but no TruID was returned."
      });
    } else {
      Mop.aggregate([{ "$match": { truID: truid } },
      { "$project": { _id: 0, "cardDetails": "$MOP.cardDetails", truID: 1 } },
      { $unwind: "$cardDetails" },
      { $match: { "cardDetails.status": "active" } },
      { $group: { _id: "$truID", cardDetails: { $addToSet: "$cardDetails" } } }
      ]).exec(function (err, result) {
        if (err) {
          response.status(500).send({ error: err })
          return next(err);
        }
        else if (result.length === 0) {
          res.json({
            status: "204",
            message: "The request was successful but no card is added."
          })
        }
        else {
          var resource = result[0];
          res.json({ status: "1000", resource: resource });
        }
      }
      )
    }
  }
  )
}


exports.list_wallet = function (req, res) { 
  var truid = req.body.truid;
  KycAll.find({ truID: truid }, function (err, docs) {
    if (!docs.length) {
      res.json({
        status: "204",
        message: "The request was successful but no TruID was returned."
      });
    } else {
      Mop.aggregate([{ "$match": { truID: truid } },
      { "$project": { _id: 0, "walletDetails": "$MOP.walletDetails", truID: 1 } },
      { $unwind: "$walletDetails" },
      { $match: { "walletDetails.status": "active" } },
      { $group: { _id: "$truID", walletDetails: { $addToSet: "$walletDetails" } } }
      ]).exec(function (err, result) {
        if (err) {
          response.status(500).send({ error: err })
          return next(err);
        }
        else if (result.length === 0) {
          res.json({
            status: "204",
            message: "The request was successful but no wallet is added."
          })
        }
        else {
          var resource = result[0];
          res.json({ status: "1000", resource: resource });
        }
      }
      )
    }
  }
  )
}
exports.list_accounts_all = function (req, res) {
  var truid = req.body.truid;
  KycAll.find({ truID: truid }, function (err, docs) {
    if (!docs.length) {
      res.json({
        status: "204",
        message: "The request was successful but no TruID was returned."
      });
    } else {
      Mop.aggregate([{
        $facet: {
          "accountDetails": [{ "$match": { truID: truid } },
          { "$project": { _id: 0, "accountDetails": "$MOP.accountDetails", truID: 1 } },
          { $unwind: "$accountDetails" },
          {
            $addFields: { "accountDetails.type": "bankAccount" }
          },
          { $match: { "accountDetails.status": "active" } },
          { $group: { _id: "$truID", accountDetails: { $addToSet: "$accountDetails" } } },
          { $unwind: "$accountDetails" }
          ],
          "upiDetails": [{ "$match": { truID: truid } },
          { "$project": { _id: 0, "UPIDetails": "$MOP.upiDetails", truID: 1 } },
          { $unwind: "$UPIDetails" },
          {
            $addFields: {
              "UPIDetails.type": "UPI"
            }
          },
          { $match: { "UPIDetails.status": "active" } },
          { $group: { _id: "$truID", UPIDetails: { $addToSet: "$UPIDetails" } } },
          { $unwind: "$UPIDetails" },
          ]
        }
      },
      { $project: { accountDetails: { $setUnion: ['$accountDetails.accountDetails', '$upiDetails.UPIDetails'] } } },
      ]).exec(async function (err, result) {
        if (err) {
          response.status(500).send({ error: err })
          return next(err);
        }
        else if (result.length === 0) {
          res.json({
            status: "204",
            message: "No Recoud Found."
          })
        }
        else {
          if(result[0].accountDetails.length>0)
          {
            var resource = result[0].accountDetails;
            // var mydata= await descr.respDecrypt(resource)
            res.json({ status: "1000", resource: resource });
          } 
          else
          {
            res.json({
              status: "204",
              message: "No Recoud Found."
            })
          }
        }
      }
      )
    }
  }
  )
}