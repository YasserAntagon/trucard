
'use strict'

var randomize = require('randomatic'),
  request = require('request'),
  fs = require('fs'),
  path = require('path'),


  KycAll = require('../models/custKYCAllModel'),
  enKycAll = require('../models/remmitKYCAllModel'),
  enWalletlog = require('../models/remmitWalletLog'),
  Mop = require('../models/custMOPModel'),
  Accounts = require('../models/accModel'),
  Stock = require('../models/custStockModel'),
  Wallet = require('../models/custWalletModel'),

  TXN = require('../models/custTXNModel'),
  Atom = require("../models/custAtomModel"),
  WalletLog = require("../models/custWalletLogModel"),
  conf = require("../conf"),
  MAIL = require("../controllers/email.controller"),
  log = require('../models/custLogsModel'),
  ConsumerConfig = require('../consumerConfig/validate.limit.controller'),
  txnStockLog = require('./stock.controller'),
  bankApi = require('./bank.controller');
var bcrypt = require('bcrypt');
var cryptos = require('crypto');
var fs = require('fs'),
  path = require('path'),
  defaultConf = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../regionConf.json')));

let reqip = conf.reqip;


function createInvoice() {
  var date = new Date(); // today's date and time in ISO format
  var invno = Date.parse(date);
  // var inv = invno.toString();
  var randomstr = randomize('0', 3);
  var randomstr1 = randomize('0', 3);
  var randomstr2 = randomize('0', 4);
  var inv = (invno + parseInt(randomstr)).toString() + randomstr1 + randomstr2;
  return inv;
};
exports.test = function (req, res) {
  res.json({ message: "Welcome to Company Api" });
};


exports.qr_status_update = function (req, res) {
  var hash = req.body.hash;
  const decipher = cryptos.createDecipher('aes-192-cbc', "~*Tq#r8c$o@d2e*~");
  var decrypted = decipher.update(hash, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  var array = decrypted.split("#*");

  var fromtruid = array[0];
  var tid = array[1];
  var invoice = array[2];
  var totruid = array[3];
  var btype = array[4];
  var ttype = array[5];

  if (btype === "G24K") {
    TXN.find({
      status: "success", "type": ttype, "invoice": invoice, "particularsG24.TID": tid, "particularsG24.isRedeem": false,
      "particularsG24.from": fromtruid, "to": totruid
    }, function (err, docs) {
      if (docs.length) {
        TXN.findOneAndUpdate({ "invoice": invoice }, { $set: { "particularsG24.isRedeem": true } })
          .exec(function (err, result) {

            if (err) {
              console.log(err)
              res.json({ status: "204", message: 'Something Went Wrong' });

            } else {
              res.json({ status: "200", message: 'Physical Redeem Coin Success' });
            }
          })
      } else {
        res.json({ status: "204", message: 'Query was success but No body was Return' });
      }
    })
  }
  else if (btype === "S99P") {
    TXN.find({
      status: "success", "type": ttype, "invoice": invoice, "particularsS99.TID": tid, "particularsS99.isRedeem": false,
      "particularsS99.from": fromtruid, "to": totruid
    }, function (err, docs) {
      if (docs.length) {

        TXN.findOneAndUpdate({ "invoice": invoice }, { $set: { "particularsS99.isRedeem": true } })
          .exec(function (err, result) {

            if (err) {
              console.log(err)
              res.json({ status: "204", message: 'Something Went Wrong' });

            } else {
              res.json({ status: "200", message: 'Physical Redeem Coin S"~*Tq#r8c$o@d2e*~");ccess' });
            }
          })
      } else {
        res.json({ status: "204", message: 'Query was success but No body was Return' });
      }
    })
  }

  else {
    res.json({ status: "204", message: 'please Enter valid data' });
  }
};


exports.qr_read_status = function (req, res) {
  var hash = req.body.hash;
  const decipher = cryptos.createDecipher('aes-192-cbc', "~*Tq#r8c$o@d2e*~");
  var decrypted = decipher.update(hash, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  var array = decrypted.split("#*");

  var fromtruid = array[0];
  var tid = array[1];
  var invoice = array[2];
  var totruid = array[3];
  var btype = array[4];
  var ttype = array[5];


  if (btype === "G24K") {
    TXN.find({
      status: "success", "type": ttype, "invoice": invoice, "particularsG24.TID": tid, "particularsG24.isRedeem": true,
      "particularsG24.from": fromtruid, "to": totruid
    }, function (err, docs) {
      if (docs.length) {
        res.json({ status: "200", message: 'Physical Redeem Coin Success' });
      } else {
        res.json({ status: "204", message: 'Redeem Not yet done' });
      }
    })
  }

  else if (btype === "S99P") {
    TXN.find({
      status: "success", "type": ttype, "invoice": invoice, "particularsS99.TID": tid, "particularsS99.isRedeem": true,
      "particularsS99.from": fromtruid, "to": totruid
    }, function (err, docs) {
      if (docs.length) {
        res.json({ status: "200", message: 'Physical Redeem Coin Success' });
      } else {
        res.json({ status: "204", message: 'Redeem Not yet done' });
      }
    })
  }

  else {
    res.json({ status: "204", message: 'please Enter valid data' });
  }

};


exports.qr_read_remmit_update = function (req, res) {
  var hash = req.body.hash;
  var truid = req.body.truid;
  const decipher = cryptos.createDecipher('aes-192-cbc', "~*Tq#r8c$o@d2e*~");
  var decrypted = decipher.update(hash, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  var array = decrypted.split("#*");

  var htruid = array[0];
  var qrtoken = array[1];

  if (truid === htruid && qrtoken != "" && qrtoken != undefined && qrtoken != 0) {

    KycAll.find({ truID: truid, "KYCFlag": "active" }, function (err, docs) {
      if (docs.length) {
        KycAll.findOneAndUpdate({ "truID": truid }, { $set: { "RqrToken": qrtoken } })
          .exec(function (err, result) {

            if (err) {
              console.log(err)
              res.json({ status: "204", message: 'Something Went Wrong' });

            } else {
              res.json({ status: "200", message: 'You can proceed' });
            }
          })
      } else {
        res.json({ status: "204", message: 'No user Found' });
      }
    })
  }
  else {
    res.json({ status: "204", message: 'Not A valid User' });
  }
};


exports.qr_read_remmit = function (req, res) {
  var hash = req.body.hash;
  var truid = req.body.truid;
  const decipher = cryptos.createDecipher('aes-192-cbc', "~*Tq#r8c$o@d2e*~");
  var decrypted = decipher.update(hash, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  var array = decrypted.split("#*");

  var htruid = array[0];
  var qrtoken = array[1];

  if (truid === htruid && qrtoken != "" && qrtoken != undefined && qrtoken != 0) {

    KycAll.find({ truID: truid, "KYCFlag": "active", "RqrToken": qrtoken }, function (err, docs) {
      if (docs.length) {
        KycAll.findOneAndUpdate({ "truID": truid }, { $set: { "RqrToken": "0" } })
          .exec(function (err, result) {

            if (err) {
              console.log(err)
              res.json({ status: "204", message: 'Something Went Wrong' });

            } else {
              res.json({ status: "200", message: 'You can proceed' });
            }
          })
      } else {
        res.json({ status: "204", message: 'No user Found' });
      }
    }
    )
  }
  else {
    res.json({ status: "204", message: 'Not A valid User' });
  }
};


exports.ins_atom_log = function (req, res) {

  KycAll.find({ "$or": [{ truID: req.body.customertruid }, { CRNNo: req.body.customertruid }] }, function (err, docs) {
    if (!docs.length) {
      res.json({ status: "204", message: 'Not A valid User' });
    }
    else {
      var invoice = req.body.invoice
      if ((req.body.ttype === "addMoney") && req.body.astatus === "Pending") {
        invoice = createInvoice();
      }
      var query = { invoice: invoice };
      var date = new Date();
      var atom = {};
      atom.atomID = req.body.atomid;
      atom.tType = req.body.ttype;
      atom.amount = req.body.amount;
      atom.invoiceAmount = req.body.invoiceamount;
      atom.diffAmount = (req.body.invoiceamount - req.body.amount);
      atom.surcharge = req.body.surcharge;
      atom.prodid = req.body.prodid;
      atom.bankTxnID = req.body.banktxnid ? req.body.banktxnid : "0";
      atom.status = req.body.astatus;
      atom.customerTruID = docs[0].truID;
      atom.bankName = req.body.bankname;
      atom.MOP = req.body.atommop;
      atom.cardNumber = req.body.cardnumber;
      atom.failureReason = req.body.failurereason;
      atom.userName = req.body.username;
      atom.email = req.body.email;
      atom.mobile = req.body.mobile;
      atom.address = req.body.address;
      atom.createDate = date;
      atom.atomDate = req.body.date;
      atom.invoice = invoice;
      if ((req.body.ttype) === "addMoney") {
        update_wallet_log(invoice, docs[0].truID, req.body.astatus)
      }
      Atom.find(query, function (err, docs) {
        if (!docs.length) {
          var atomsv = new Atom(atom);
          atomsv.save(function (err) {
            if (err) {
              res.json({ status: "204", message: 'Fields with * required' });

            } else {
              res.json({ status: "200", message: 'log for Atom has been generated for invoice', invoice: invoice });
              // update_wallet_log(invoice, docs[0].truID, req.body.astatus)
            }
          })
        }
        else {
          Atom.findOneAndUpdate({ invoice: invoice }, { $set: atom }, { returnNewDocument: true }).exec(function (err, result) {
            if (err) {
              res.json({ status: "204", message: 'Something went wrong!' });
            } else {
              res.json({ status: "200", message: 'log for Atom updated for invoice', invoice: invoice });
            }
          })
          // res.json({ status: "204", message: 'This Invoice Already Exists' });
        }
      })

      function update_wallet_log(invoice, truID, astatus) {
        var date = new Date();
        var walletobj = {};
        walletobj.truID = truID;
        walletobj.Cr = req.body.amount;
        walletobj.moneyAdded = false;
        walletobj.Dr = "0";
        walletobj.invoice = invoice;
        walletobj.tType = "addMoney";
        walletobj.createDate = date;
        walletobj.particulars = (astatus == "Ok") ? "Amount added to Wallet" : "Transaction Failed";
        walletobj.status = (astatus == "Ok") ? "success" : "failure";
        WalletLog.findOneAndUpdate({ invoice: invoice }, { $set: walletobj }, { upsert: true }).exec()
      }
    }
  })
}

exports.Add_money = function (req, res) {

  var truid = req.body.truid,
    invoice = req.body.invoice,
    pgflag = req.body.pgflag,
    amt = parseFloat(req.body.amt);
  var query = { truID: truid };

  if (isNaN(amt)) {
    res.json({
      status: "204",
      message: "please Enter Valid Amount"
    });
  }

  else {
    var reqresult;
    if (pgflag === "atom") {
      reqresult = Atom.aggregate([
        { $match: { "customerTruID": truid, "invoice": invoice, status: { $in: ["Ok", "success_00"] }, tType: "addMoney" } },
        { $project: { _id: 0, amount: 1, invoice: 1, bankTxnID: 1, surcharge: 1, MOP: 1 } },
        {
          $lookup: {
            localField: "invoice",
            foreignField: "invoice",
            from: "walletlogs",
            as: "wl"

          }
        },
        { $unwind: "$wl" },
        { $match: { "wl.moneyAdded": false } },
        { $project: { amount: 1, moneyAdded: "$wl.moneyAdded", bankTxnID: 1, surcharge: 1, MOP: 1 } }
      ]);
    }
    reqresult.exec(function (err, docs) {

      if (!docs.length) {
        res.json({
          status: "204",
          message: "The request was successful but no body was returned."
        });
      } else {
        var respresult = Wallet.findOneAndUpdate(query, { $set: { Cr: amt }, $inc: { clBal: amt } })
        respresult.exec(function (err, result) {
          if (err) {
            console.log(err)
          }
          else {
            res.json({ status: "200", message: 'amount added to Wallet from Bank Account' });
            WalletLog.findOneAndUpdate({ invoice: invoice }, { $set: { moneyAdded: true } }).exec();
            KycAll.aggregate([
              { $match: { __t: "KycAll", $or: [query] } },
              { $project: { name: { $concat: ["$fName", " ", "$lName"] }, _id: 0, truID: 1, mobile: 1, email: 1, emailVerified: 1 } },
              {
                $lookup: {
                  from: "wallets",
                  localField: "truID",
                  foreignField: "truID",
                  as: "wallet"
                }
              },
              { $unwind: "$wallet" },
              {
                $project: {
                  name: 1, truID: 1, mobile: 1, email: 1, emailVerified: 1,
                  balance: "$wallet.clBal"
                }
              }
            ]).exec(function (err, result) {
              var frommailtype = result[0].emailVerified == true ? "both" : "sms";
              var pgdetail = docs[0];
              var payby = "0", banktxnid = "0", paymentcharge = "0";
              if (pgflag === "atom") {
                var temppayby = pgdetail.MOP;
                payby = (temppayby == "NB") ? "Net Banking" : (temppayby == "CC") ? "Credit Card" : (temppayby == "DC") ? "Debit Card" : (temppayby == "UP") ? "UPI" : temppayby;
                banktxnid = pgdetail.bankTxnID;
                paymentcharge = pgdetail.surcharge.toJSON().$numberDecimal;
              }
              MAIL.addMoneyEmail(result[0], payby, banktxnid, paymentcharge, frommailtype, amt, invoice);
            })

            //  MAIL.consumer_transfer_sender(fromEmail,fromtru24,fromFName,fromLName,fromMobile,frommailtype,resource.fromStock,resource.fromClBal);  
            notification();
            function notification(err, numAffected) {
              var dates = new Date().toLocaleString();
              request.post({
                "headers": { "content-type": "application/json" },
                "url": reqip + ":4116/api/insnotification",
                "body": JSON.stringify({
                  "notifyto": truid,
                  "triggeredbytruid": truid,
                  "notification": "Amount of " + defaultConf.defaultCurrency + " " + amt + " added successfully on your account wallet.",
                  "type": "walletTransaction",
                  "subtype": "addMoney",
                  "title": "Money Added.",
                  "referenceid": invoice
                })
              }, (error, response, body) => {
                if (error) {
                  return console.dir(error);
                }
                var newjson = JSON.parse(body);
              })
            }
          }
        })
      }
    })
  }
}

exports.addmoney_to_bank_withAccno = function (req, res) {
  var truid = req.body.truid,
    invoice = req.body.invoice,
    amt = parseFloat(req.body.amt),
    accno = req.body.accno,
    ifsc = req.body.ifsc,
    modeofpay = req.body.modeofpay;
  var query = { truID: truid };

  KycAll.find({
    "truID": truid, KYCFlag: "active"
  }, function (err, docs) {
    if (!docs.length) {
      res.json({
        status: "204",
        message: "The request was successful but no body was returned."
      });
    } else {
      // res.json({
      //   status: "204",
      //   message: "You can withdraw amount after 24 Hours."
      // });
      if (isNaN(amt)) {
        res.json({
          status: "204",
          message: "please Enter Valid Amount"
        });
      }
      else {
        validatebalance(amt, query, (err, resource) => {
          if (err) {
            res.status(500).send({
              error: err
            })
            return next(err);
          }
          else {
            if (resource.status == 200) {
              request.post({
                "headers": { "content-type": "application/json" },
                "url": reqip + ":4123/api/verifyotpforclient",
                "body": JSON.stringify({ "crnno": docs[0].CRNNo, "otp": req.body.otp, type: "accountverify" })
              }, (error, response, body) => {
                if (error) {
                  return console.dir(error);
                }
                var newjson = JSON.parse(body);
                if (newjson.resource.status == "1000") {
                  Accounts.aggregate([{ $match: { truID: truid } },
                  { $project: { _id: 0, accountdetails: "$bankAccounts", truID: 1 } },
                  { $unwind: { path: "$accountdetails", preserveNullAndEmptyArrays: true } },
                  { $match: { "accountdetails.accountId": accno, "accountdetails.status": "active" } },
                  { $project: { "accountdetails": "$accountdetails", truID: 1 } },
                  {
                    $lookup: {
                      from: "kycs",
                      localField: "truID",
                      foreignField: "truID",
                      as: "kycall"
                    }
                  },
                  { $unwind: "$kycall" },
                  { $project: { accountdetails: 1, truID: 1, mobile: "$kycall.mobile", crnno: "$kycall.CRNNo" } },
                  ]).exec(function (err, accDocs) {
                    if (!accDocs.length) {
                      res.json({ status: 204, message: "Please Link your Account..!!" })
                    } else {
                      if (accDocs[0].accountdetails) {
                        var invoice = createInvoice();
                        if (modeofpay == "NEFT" || modeofpay == "IMPS") {
                          update_wallet(amt, truid, invoice, accDocs[0].accountdetails.name);
                          bankApi.bank_single_payment_api_wtobank(amt, truid, "Wallet to Bank Transfer", modeofpay, invoice, "walletToBank", accDocs[0].accountdetails, accDocs[0].mobile, accDocs[0].crnno, function (err, resback) {
                            console.log(err, resback)
                          })
                          res.json({ status: 200, message: "Wallet to Bank request has been submitted successfully..!!", accountDetails: accDocs[0].accountdetails, invoice: invoice, amount: amt })
                        } else {
                          res.json({ status: 204, message: "Please select valid mode of payment..!!" })
                        }
                      }
                      else {
                        res.json({ status: 204, message: "Please Set your default account..!!" })
                      }
                    }
                  })

                }
                else {
                  res.status(411).json({ status: "411", message: newjson.resource.message });
                }
              })
            } else {
              res.json({ status: 204, message: "Insufficient wallet balance." })
            }
          }
        })
      }
      function validatebalance(amount, cond, callback) {
        KycAll.aggregate([
          { $match: cond },
          { $project: { _id: 0, CRNNo: 1, KYCFlag: 1, truID: 1 } },
          {
            $lookup: {
              from: "wallets",
              localField: "truID",
              foreignField: "truID",
              as: "wal"

            }
          },
          { $unwind: "$wal" },
          { $project: { _id: 0, CRNNo: 1, KYCFlag: 1, truID: 1, balance: "$wal.clBal" } },
        ]).exec(function (err, result) {
          if (err) {
            callback(err, null)
          } else {
            var avlbal = parseFloat(result[0].balance.toJSON().$numberDecimal);
            if (avlbal >= amount) {
              callback(null, { status: 200, CRNNo: result[0].CRNNo, KYCFlag: result[0].KYCFlag })
            }
            else {
              callback(null, { status: 204 })
            }
          }
        })
      }

      function update_wallet(tav, truid, invoice, benName) {
        var total = tav;
        Wallet.findOneAndUpdate({
          truID: truid
        }, {
          $inc: {
            "clBal": total * -1
          },
          $set: {
            Dr: total
          }
        }, {
          upsert: true
        }).exec(function (err, result) {
          if (err) {
            console.log(err)
          }
          else {
            update_wallet_log(tav, truid, invoice, benName);
          }
        }
        )
      }

      function update_wallet_log(tav, truid, invoice, benName) {
        var total = tav * -1;
        var date = new Date();
        var walletlog = new WalletLog();

        walletlog.truID = truid;
        walletlog.Cr = "0";
        walletlog.Dr = total;
        walletlog.invoice = invoice;
        walletlog.tType = "walletToBank";
        walletlog.createDate = date;
        walletlog.moneyAdded = false;
        walletlog.status = "inprocess";
        walletlog.particulars = "Amount Paid To " + benName;

        WalletLog.find({ invoice: invoice }, function (err, docs) {
          if (!docs.length) {
            walletlog.save(function (err) {
              if (err) {
                console.log(err)
                res.json({ status: "204", message: 'Fields with * required' });

              }
              console.log("log for Wallet log has been generated for invoice ");
            });
          }
          else {
            res.json({ status: "204", message: 'This Invoice Already Exists' });
          }
        }
        )
      }
    }
  })
}

exports.addmoney_to_bank = function (req, res) {
  var truid = req.body.truid,
    invoice = req.body.invoice,
    amt = parseFloat(req.body.amt),
    modeofpay = req.body.modeofpay;
  var query = { truID: truid };

  KycAll.find({
    "truID": truid, KYCFlag: "active"
  }, function (err, docs) {
    if (!docs.length) {
      res.json({
        status: "204",
        message: "The request was successful but no body was returned."
      });
    } else {
      res.json({
        status: "204",
        message: "You can withdraw amount after 24 Hours."
      });
      /* if (isNaN(amt)) {
        res.json({
          status: "204",
          message: "please Enter Valid Amount"
        });
      }
      else {
        validatebalance(amt, query, (err, resource) => {
          if (err) {
            res.status(500).send({
              error: err
            })
            return next(err);
          }
          else {
            if (resource.status == 200) {
              Mop.aggregate([{ $match: { truID: truid } },
              { $project: { _id: 0, accountdetails: "$MOP.accountDetails", truID: 1 } },
              { $unwind: { path: "$accountdetails", preserveNullAndEmptyArrays: true } },
              { $match: { "accountdetails.accType": "self", "accountdetails.status": "active" } },
              // { $match: { "accountdetails.IFSC": ifsc, "accountdetails.accountNo": accno, "accountdetails.status": "active",   } },
              { $project: { "accountdetails": "$accountdetails", truID: 1 } },
              {
                $lookup: {
                  from: "kycs",
                  localField: "truID",
                  foreignField: "truID",
                  as: "kycall"
                }
              },
              { $unwind: "$kycall" },
              { $project: { accountdetails: 1, truID: 1, mobile: "$kycall.mobile", crnno: "$kycall.CRNNo" } },
              ], function (err, accDocs) {
                if (!accDocs.length) {
                  res.json({ status: "204", message: "Please Link your Account..!!" })
                } else {
                  if (accDocs[0].accountdetails) {
                    var invoice = Date.now();
                    update_wallet(amt, truid, invoice, accDocs[0].accountdetails.name);
                    bankApi.bank_single_payment_api_wtobank(amt, truid, "Wallet to Bank Transfer", modeofpay, invoice, "walletToBank", accDocs[0].accountdetails, accDocs[0].mobile, accDocs[0].crnno, function (err, resback) {
                    })
                    res.json({ status: "200", message: "Wallet to Bank request has been submitted successfully..!!" })
                  }
                  else {
                    res.json({ status: "204", message: "Please Set your default account..!!" })
                  }
                }
              })
            } else {
              res.json({ status: "204", message: "Insufficient wallet balance." })
            }
          }
        })
      }
      function validatebalance(amount, cond, callback) {
        KycAll.aggregate([
          { $match: cond },
          { $project: { _id: 0, CRNNo: 1, KYCFlag: 1, truID: 1 } },
          {
            $lookup: {
              from: "wallets",
              localField: "truID",
              foreignField: "truID",
              as: "wal"

            }
          },
          { $unwind: "$wal" },
          { $project: { _id: 0, CRNNo: 1, KYCFlag: 1, truID: 1, balance: "$wal.clBal" } },
        ]).exec(function (err, result) {
          if (err) {
            callback(err, null)
          } else {
            var avlbal = parseFloat(result[0].balance.toJSON().$numberDecimal);
            if (avlbal >= amount) {
              callback(null, { status: 200, CRNNo: result[0].CRNNo, KYCFlag: result[0].KYCFlag })
            }
            else {
              callback(null, { status: 204 })
            }
          }
        })
      }

      function update_wallet(tav, truid, invoice, benName) {
        var total = tav;
        Wallet.findOneAndUpdate({
          truID: truid
        }, {
          $inc: {
            "clBal": total * -1
          },
          $set: {
            Dr: total
          }
        }, {
          upsert: true
        }).exec(function (err, result) {
          if (err) {
            console.log(err)
          }
          else {
            update_wallet_log(tav, truid, invoice, benName);
          }
        }
        )
      }

      function update_wallet_log(tav, truid, invoice, benName) {
        var total = tav * -1;
        var date = new Date();
        var walletlog = new WalletLog();

        walletlog.truID = truid;
        walletlog.Cr = "0";
        walletlog.Dr = total;
        walletlog.invoice = invoice;
        walletlog.tType = "walletToBank";
        walletlog.createDate = date;
        walletlog.moneyAdded = false;
        walletlog.status = "inprocess";
        walletlog.particulars = "Amount Paid To " + benName;

        WalletLog.find({ invoice: invoice }, function (err, docs) {
          if (!docs.length) {
            walletlog.save(function (err) {
              if (err) {
                console.log(err)
                res.json({ status: "204", message: 'Fields with * required' });

              }
              console.log("log for Wallet log has been generated for invoice ");
            });
          }
          else {
            res.json({ status: "204", message: 'This Invoice Already Exists' });
          }
        }
        )
      } */
    }
  })
}

exports.add_money_log_report = function (req, res) {
  var truid = req.body.truid,
    skipvar = (req.body.skip * 30);

  KycAll.find({ truID: truid }, function (err, docs) {
    if (!docs.length) {
      res.json({
        status: "204",
        message: 'The request was successful but no TruID was returned.'
      });
    }
    else {
      Atom.find({ customerTruID: truid }, { __v: 0, _id: 0 }).sort({ createDate: -1 }).limit(30)
        .skip(skipvar).exec(function (err, atomresult) {
          if (err) {
            res.json({ status: "204", message: 'Something went wrong!' });
          } else {
            var atomrespresult = atomresult.map(atomRespResult);
            log.find({ truID: truid }, { __v: 0, _id: 0 }).sort({ createDate: -1 }).limit(30)
              .skip(skipvar).exec(function (err, bankresult) {
                if (err) {
                  res.json({ status: "204", message: 'Something went wrong!' });
                } else {
                  var bankrespresult = bankresult.map(results);
                  res.json({ status: "200", atom: atomrespresult, bank: bankrespresult })
                }
              })
          }
        }
        )
    }
  }
  )
}

exports.print_invoice_by_crrno = function (req, res) {  //call for buy, buyCash, RedeemCash, 
  let Gen = req.generalCharges;
  var crnno = req.body.crnno;
  var invoice = req.body.invoice;
  var type = req.body.type;

  KycAll.find({ CRNNo: crnno }, function (err, docs) {
    if (!docs.length) {
      res.json({
        status: "204",
        message: 'The request was successful but no TruID was returned.'
      })
    } else {
      if (invoice != undefined) {
        var respresult;
        let ctruid = docs[0].currentassetstore;
        if (type == "transfer") {
          var respresult = TXN.aggregate([
            { $match: { invoice: invoice, $or: [{ "receiverTruID": docs[0].truID }, { "to": docs[0].truID }] } },
            {
              $project:
              {
                invoice: 1, to: 1, from: 1, _id: 0, particularsG24: 1, createDate: 1, sourceFlag: 1, rTruID: 1,
                particularsS99: 1, totalAmount: 1, status: 1, MOP: 1, type: 1, receiverTruID: 1
              }
            },
            {
              $lookup: {
                from: "kycs",
                localField: "receiverTruID",
                foreignField: "truID",
                as: "cust"
              }
            },
            { $unwind: "$cust" },
            {
              $lookup: {
                from: "kycs",
                localField: "to",
                foreignField: "truID",
                as: "sender"
              }
            },
            { $unwind: "$sender" },
            {
              $project: {
                invoice: 1, to: 1, from: 1, _id: 0, particularsG24: 1, sourceFlag: 1, rTruID: 1, particularsS99: 1, totalAmount: 1, status: 1, MOP: 1, type: 1, createDate: 1,
                gender: "$cust.gender", address: "$cust.permanentAddress", fName: "$cust.fName",
                lName: "$cust.lName", assetstoreID: "$cust.currentassetstore",
                s_gender: "$sender.gender", s_address: "$sender.permanentAddress", s_fName: "$sender.fName",
                s_lName: "$sender.lName", s_assetstoreID: "$sender.currentassetstore"
              }
            }
          ]);

          respresult.exec(function (err, result) {
            if (err) {
              response.status(500).send({ error: err })
              return next(err);
            }
            else {
              var resource = result[0];
              if (resource === undefined) {
                res.json({
                  status: "204",
                  message: 'The request was successful but you enterd wrong invoice number.'
                });
              }
              else if (resource.status == "success") {
                res.json({
                  status: "204",
                  message: 'This Transaction Already successful..!!'
                });
              }
              else {

                var invoice = resource.invoice;
                var to = resource.to;
                var rtruid = resource.rTruID;
                var status = resource.status;
                var address = resource.address;
                var fname = resource.fName;
                var lname = resource.lName;
                var mop = resource.MOP;
                var type = resource.type;
                var createDate = resource.createDate;

                var s_address = resource.s_address;
                var s_fname = resource.s_fName;
                var s_lname = resource.s_lName;
                var s_tpa = resource.s_TPA;
                var s_assetstoreID = resource.s_assetstoreID;

                ///Rate for 24
                var tid24 = resource.particularsG24.TID;
                var from24 = resource.particularsG24.assetmanagerName;
                var fromtruid24 = resource.particularsG24.from;
                var q24v = resource.particularsG24.qty.toJSON().$numberDecimal;
                var r24v = resource.particularsG24.rate.toJSON().$numberDecimal;
                var a24v = resource.particularsG24.amount.toJSON().$numberDecimal;
                var d24v = resource.particularsG24.assetmanagersCharges.toJSON().$numberDecimal;
                var o24v = resource.particularsG24.otherCharges.toJSON().$numberDecimal;
                var tx24v = resource.particularsG24.tax.toJSON().$numberDecimal;
                var t24v = resource.particularsG24.total.toJSON().$numberDecimal;

                //Rate S99P
                var tid99 = resource.particularsS99.TID;
                var from99 = resource.particularsS99.assetmanagerName;
                var fromtruid99 = resource.particularsS99.from;
                var q99v = resource.particularsS99.qty.toJSON().$numberDecimal;
                var r99v = resource.particularsS99.rate.toJSON().$numberDecimal;
                var a99v = resource.particularsS99.amount.toJSON().$numberDecimal;
                var d99v = resource.particularsS99.assetmanagersCharges.toJSON().$numberDecimal;
                var o99v = resource.particularsS99.otherCharges.toJSON().$numberDecimal;
                var tx99v = resource.particularsS99.tax.toJSON().$numberDecimal;
                var t99v = resource.particularsS99.total.toJSON().$numberDecimal;

                var ta = resource.totalAmount.toJSON().$numberDecimal;
                var sourceflag = resource.sourceFlag;



                var Final =
                  ({
                    "invoice": invoice, "to": to, "rTruID": rtruid, "status": status, address: address, fName: fname, MOP: mop,
                    lName: lname, totalAmount: ta, type: type, "createDate": createDate,
                    s_address: s_address, s_fname: s_fname, s_lname: s_lname, s_tpa: s_tpa, s_truID: fromtruid24,
                    s_assetstoreID: s_assetstoreID,
                    "particularsG24": {
                      "TID": tid24, "from": from24, "qty": q24v, "rate": r24v, "amount": a24v, "fromTruID": fromtruid24,
                      "assetmanagersCharges": d24v, "otherCharges": o24v, "tax": tx24v, "total": t24v,
                    },
                    "particularsS99": {
                      "TID": tid99, "from": from99, "qty": q99v, "rate": r99v, "amount": a99v, "fromTruID": fromtruid99,
                      "assetmanagersCharges": d99v, "otherCharges": o99v, "tax": tx99v, "total": t99v,
                    },
                  });

                if (status === "success" && mop === "others" && sourceflag === "customer") {
                  var pgtype = "0", banktxnid = "0", payby = "0", paymentcharge = "0";
                  Atom.find({ invoice: invoice }, function (err, atomdocs) {
                    if (atomdocs.length) {
                      var temppayby = atomdocs[0].MOP;
                      Final.PGType = "atom";
                      Final.payBy = (temppayby == "NB") ? "Net Banking" : (temppayby == "CC") ? "Credit Card" : (temppayby == "DC") ? "Debit Card" : (temppayby == "UP") ? "UPI" : temppayby;
                      Final.bankTXNID = atomdocs[0].bankTxnID;
                      Final.paymentCharge = atomdocs[0].surcharge.toJSON().$numberDecimal;
                      res.json({ status: "200", resource: Final });
                    } else {
                      var temppayby = mop;
                      Final.PGType = pgtype;
                      Final.payBy = payby;
                      Final.bankTXNID = banktxnid;
                      Final.paymentCharge = paymentcharge;
                      res.json({ status: "200", resource: Final });
                    }
                  });
                } else {
                  res.json({ status: "200", resource: Final });
                }
              }
            }
          })
        }
        else {
          respresult = TXN.aggregate([
            { $match: { "to": docs[0].truID, "invoice": invoice } },
            {
              $project: {
                invoice: 1, to: 1, from: 1, _id: 0, particularsG24: 1, createDate: 1, rTruID: 1, particularsS99: 1, totalAmount: 1, status: 1, MOP: 1, type: 1
              }
            },
            {
              $lookup: {
                from: "kycs",
                localField: "to",
                foreignField: "truID",
                as: "cust"
              }
            },
            { $unwind: "$cust" },
            {
              $project: {
                invoice: 1, to: 1, from: 1, _id: 0, particularsG24: 1, rTruID: 1, particularsS99: 1, totalAmount: 1, status: 1, MOP: 1, type: 1, createDate: 1,
                gender: "$cust.genderc", address: "$cust.permanentAddress", fName: "$cust.fName", lName: "$cust.lName"
              }
            }
          ]);
          respresult.exec(function (err, result) {
            if (err) {
              response.status(500).send({ error: err })
              return next(err);
            }
            else {
              var resource = result[0];
              if (resource === undefined) {
                res.json({
                  status: "204",
                  message: 'The request was successful but you enterd wrong invoice number.'
                });
              }
              else if (resource.status == "success") {
                res.json({
                  status: "204",
                  message: 'This Transaction Already successful..!!'
                });
              }
              else {
                var invoice = resource.invoice;
                var to = resource.to;
                var rtruid = resource.rTruID;
                var status = resource.status;
                var address = resource.address;
                var fname = resource.fName;
                var lname = resource.lName;
                var referenceID = resource.refernceID;
                var mop = resource.MOP;
                var type = resource.type;
                var sourceflag = resource.sourceFlag;
                var ta = resource.totalAmount.toJSON().$numberDecimal;
                var createDate = resource.createDate;

                var particularsG24 = new Array();
                var particularsS99 = new Array();

                if (Array.isArray(resource.particularsG24) == true || Array.isArray(resource.particularsS99) == true) {
                  for (var z = 0; z < resource.particularsG24.length; z++) {
                    var resparticuls = {};
                    resparticuls["TID"] = resource.particularsG24[z].TID;
                    resparticuls["from"] = resource.particularsG24[z].from;
                    resparticuls["assetmanagerName"] = resource.particularsG24[z].assetmanagerName;
                    resparticuls["qty"] = resource.particularsG24[z].qty.toJSON().$numberDecimal;
                    resparticuls["rate"] = resource.particularsG24[z].rate.toJSON().$numberDecimal;
                    resparticuls["amount"] = resource.particularsG24[z].amount.toJSON().$numberDecimal;
                    resparticuls["assetmanagersCharges"] = resource.particularsG24[z].assetmanagersCharges.toJSON().$numberDecimal;
                    resparticuls["otherCharges"] = resource.particularsG24[z].otherCharges.toJSON().$numberDecimal;
                    resparticuls["tax"] = resource.particularsG24[z].tax.toJSON().$numberDecimal;
                    resparticuls["total"] = resource.particularsG24[z].total.toJSON().$numberDecimal;
                    particularsG24.push(resparticuls);
                  }

                  for (var z = 0; z < resource.particularsS99.length; z++) {
                    var resparticuls = {};
                    resparticuls["TID"] = resource.particularsS99[z].TID;
                    resparticuls["from"] = resource.particularsS99[z].from;
                    resparticuls["assetmanagerName"] = resource.particularsS99[z].assetmanagerName;
                    resparticuls["qty"] = resource.particularsS99[z].qty.toJSON().$numberDecimal;
                    resparticuls["rate"] = resource.particularsS99[z].rate.toJSON().$numberDecimal;
                    resparticuls["amount"] = resource.particularsS99[z].amount.toJSON().$numberDecimal;
                    resparticuls["assetmanagersCharges"] = resource.particularsS99[z].assetmanagersCharges.toJSON().$numberDecimal;
                    resparticuls["otherCharges"] = resource.particularsS99[z].otherCharges.toJSON().$numberDecimal;
                    resparticuls["tax"] = resource.particularsS99[z].tax.toJSON().$numberDecimal;
                    resparticuls["total"] = resource.particularsS99[z].total.toJSON().$numberDecimal;
                    particularsS99.push(resparticuls);
                  }

                } else {
                  var resparticuls24 = {};
                  resparticuls24["TID"] = resource.particularsG24.TID;
                  resparticuls24["from"] = resource.particularsG24.from;
                  resparticuls24["assetmanagerName"] = resource.particularsG24.assetmanagerName;
                  resparticuls24["qty"] = resource.particularsG24.qty.toJSON().$numberDecimal;
                  resparticuls24["rate"] = resource.particularsG24.rate.toJSON().$numberDecimal;
                  resparticuls24["amount"] = resource.particularsG24.amount.toJSON().$numberDecimal;
                  resparticuls24["assetmanagersCharges"] = resource.particularsG24.assetmanagersCharges.toJSON().$numberDecimal;
                  resparticuls24["otherCharges"] = resource.particularsG24.otherCharges.toJSON().$numberDecimal;
                  resparticuls24["tax"] = resource.particularsG24.tax.toJSON().$numberDecimal;
                  resparticuls24["total"] = resource.particularsG24.total.toJSON().$numberDecimal;
                  particularsG24.push(resparticuls24);



                  var resparticuls99 = {};
                  resparticuls99["TID"] = resource.particularsS99.TID;
                  resparticuls99["from"] = resource.particularsS99.from;
                  resparticuls99["assetmanagerName"] = resource.particularsS99.assetmanagerName;
                  resparticuls99["qty"] = resource.particularsS99.qty.toJSON().$numberDecimal;
                  resparticuls99["rate"] = resource.particularsS99.rate.toJSON().$numberDecimal;
                  resparticuls99["amount"] = resource.particularsS99.amount.toJSON().$numberDecimal;
                  resparticuls99["assetmanagersCharges"] = resource.particularsS99.assetmanagersCharges.toJSON().$numberDecimal;
                  resparticuls99["otherCharges"] = resource.particularsS99.otherCharges.toJSON().$numberDecimal;
                  resparticuls99["tax"] = resource.particularsS99.tax.toJSON().$numberDecimal;
                  resparticuls99["total"] = resource.particularsS99.total.toJSON().$numberDecimal;
                  particularsS99.push(resparticuls99);
                }

                var Final = {
                  "invoice": invoice, "to": to, "rTruID": rtruid, "status": status, address: address, fName: fname, MOP: mop,
                  lName: lname, totalAmount: ta, type: type, "createDate": createDate, referenceID: referenceID,
                  applicableTAX: (Gen.tax * 100).toString(),
                  "particularsG24": particularsG24, "particularsS99": particularsS99
                };
                if (status === "success" && mop === "others" && sourceflag === "customer" && (type === "buy" || type === "buyCash")) {
                  var pgtype = "0", banktxnid = "0", payby = "0", paymentcharge = "0";
                  Atom.find({ invoice: invoice }, function (err, atomdocs) {
                    if (atomdocs.length) {
                      var temppayby = atomdocs[0].MOP;
                      Final.PGType = "atom";
                      Final.payBy = (temppayby == "NB") ? "Net Banking" : (temppayby == "CC") ? "Credit Card" : (temppayby == "DC") ? "Debit Card" : (temppayby == "UP") ? "UPI" : temppayby;
                      Final.bankTXNID = atomdocs[0].bankTxnID;
                      Final.paymentCharge = atomdocs[0].surcharge.toJSON().$numberDecimal;
                      res.json({ status: "200", resource: Final });
                    }
                    else {
                      var temppayby = mop;
                      Final.PGType = pgtype;
                      Final.payBy = payby;
                      Final.bankTXNID = banktxnid;
                      Final.paymentCharge = paymentcharge;
                      res.json({ status: "200", resource: Final });
                    }
                  })
                } else {
                  res.json({ status: "200", resource: Final });
                }
              }
            }
          })
        }
      }
    }
  })
}



function results(resltobj) {
  var amount = "0", charges = "0";
  if (resltobj.Amount) {
    amount = resltobj.Amount ? resltobj.Amount : "0";
  }
  if (resltobj.charges) {
    charges = resltobj.charges ? resltobj.charges : "0";
  }
  amount = parseFloat(amount) + parseFloat(charges)


  var respobj = {};
  respobj["invoice"] = resltobj.invoice ? resltobj.invoice : undefined;
  respobj["TranID"] = resltobj.TranID ? resltobj.TranID : undefined;
  respobj["tType"] = resltobj.tType ? resltobj.tType : undefined;
  respobj["Mode_of_Pay"] = resltobj.Mode_of_Pay ? resltobj.Mode_of_Pay : undefined;
  respobj["createDate"] = resltobj.createDate ? resltobj.createDate : undefined;
  respobj["Corp_ID"] = resltobj.Corp_ID ? resltobj.Corp_ID : undefined;
  respobj["Maker_ID"] = resltobj.Maker_ID ? resltobj.Maker_ID : undefined;
  respobj["Checker_ID"] = resltobj.Checker_ID ? resltobj.Checker_ID : undefined;
  respobj["Approver_ID"] = resltobj.Approver_ID ? resltobj.Approver_ID : undefined;
  respobj["Status"] = resltobj.Status ? resltobj.Status : undefined;
  respobj["Resp_cde"] = resltobj.Resp_cde ? resltobj.Resp_cde : undefined;
  respobj["Error_Cde"] = resltobj.Error_Cde ? resltobj.Error_Cde : undefined;
  respobj["Error_Desc"] = resltobj.Error_Desc ? resltobj.Error_Desc : undefined;
  respobj["RefNo"] = resltobj.RefNo ? resltobj.RefNo : undefined;
  respobj["channelpartnerrefno"] = resltobj.channelpartnerrefno ? resltobj.channelpartnerrefno : undefined;
  respobj["RRN"] = resltobj.RRN ? resltobj.RRN : undefined;
  respobj["UTRNo"] = resltobj.UTRNo ? resltobj.UTRNo : undefined;
  respobj["PONum"] = resltobj.PONum ? resltobj.PONum : undefined;
  respobj["Ben_Acct_No"] = resltobj.Ben_Acct_No ? resltobj.Ben_Acct_No : undefined;
  respobj["Amount"] = amount.toString();
  respobj["BenIFSC"] = resltobj.BenIFSC ? resltobj.BenIFSC : undefined;
  respobj["Txn_Time"] = resltobj.Txn_Time ? resltobj.Txn_Time : undefined;


  return respobj;
}


function atomRespResult(resltobj) {
  var respobj = {};
  respobj["atomID"] = resltobj.atomID;
  respobj["amount"] = resltobj.amount.toJSON().$numberDecimal;
  respobj["surcharge"] = resltobj.surcharge.toJSON().$numberDecimal;
  respobj["prodid"] = resltobj.prodid;
  respobj["bankTxnID"] = resltobj.bankTxnID;
  respobj["status"] = resltobj.status;
  respobj["createDate"] = resltobj.createDate;
  respobj["assetmanagerTruID"] = resltobj.assetmanagerTruID;
  respobj["bankName"] = resltobj.bankName;
  respobj["MOP"] = resltobj.MOP;
  respobj["cardNumber"] = resltobj.cardNumber;
  respobj["failureReason"] = resltobj.failureReason;
  respobj["userName"] = resltobj.userName;
  respobj["email"] = resltobj.email;
  respobj["mobile"] = resltobj.mobile;
  respobj["address"] = resltobj.address;
  respobj["tType"] = resltobj.tType;
  respobj["atomDate"] = resltobj.atomDate;
  respobj["tStatus"] = resltobj.tStatus;

  return respobj;
}


exports.redeemcash_stock_Reverse = function (req, res) {
  var invoice = req.body.invoice;
  var truid = req.body.truid;
  TXN.aggregate([{
    $match: {
      "invoice": invoice, "status": "inprocess", MOP: "others"
    }
  }, {
    $project: {
      qtyG24: { $toString: "$particularsG24.qty" },
      qtyS99: { $toString: "$particularsS99.qty" }
    }
  }
  ]).exec(function (err, invResult) {
    if (err) {
      console.log(err)
    }
    else {
      if (invResult.length > 0) {
        let qty24 = invResult[0].qtyG24;
        let qty99 = invResult[0].qtyS99;
        reverse_updated_stock(qty24, qty99, truid, invoice);

        TXN.findOneAndUpdate({ "invoice": invoice, "status": "inprocess", MOP: "others" }, { $set: { status: "failure" } }).exec(function (err, docs) {
          if (err) {
            res.status(500).send({ error: err })
            return next(err);
          }
          else {
            res.send({ status: 200, message: "Stock reversed to consumer account against " + invoice })
          }
        });
      } else {
        res.send({ status: 204, message: "invoice not found" })
      }

    }
  })

  function reverse_updated_stock(qty24, qty99, truID, invoice) {
    //G24
    var g24 = parseFloat(qty24);
    if (isNaN(g24)) {
      var g24 = parseFloat("0")
    } else {
      var g24 = parseFloat(qty24) * 1;
    }

    //S99P
    var s99 = parseFloat(qty99);
    if (isNaN(s99)) {
      var s99 = parseFloat("0")
    } else {
      var s99 = parseFloat(qty99) * 1;
    }

    Stock.findOneAndUpdate({
      truID: truID
    }, {
      $inc: {
        "stock.G24K": g24,
        "stock.S99P": s99
      }
    }).exec(async function (err, result) {
      if (err) {
        console.log(err)
      } else {
        if (g24.toString() != "0") {
          await getstocklogArr(truid, g24, invoice, "G24K", "reversal");
        }
        if (s99.toString() != "0") {
          await getstocklogArr(truid, s99, invoice, "S99P", "reversal");
        }

        function getstocklogArr(truid, Qty, invoice, bullionType) {
          // console.log(Qty, bullionType);
          return new Promise(async (resolve, reject) => {
            var stocklog = {
              "truid": truid,
              "tType": "reversal",
              "Qty": Qty,
              "invoice": invoice,
              "bullionType": bullionType,
              "status": "success"
            }
            await txnStockLog.txn_stocklogs(stocklog);
            resolve();
          })

        }
      }
    }
    )
  }


}

exports.reverse_Wallet_Bal = function (req, res) {
  var invoice = req.body.invoice;
  var truid = req.body.truid;
  WalletLog.find({
    "invoice": invoice, "status": "inprocess", tType: "walletToBank"
  }, function (err, docs) {
    if (err) {
      console.log(err)
    }
    else {
      WalletLog.findOneAndUpdate({ "invoice": invoice, "status": "inprocess", tType: "walletToBank" },
        { $set: { status: "failure", createDate: Date.now() } }).exec(function (err, docs) {
          if (err) {
            res.status(500).send({ error: err })
            return next(err);
          }
          else {
            updatewalletBal(docs.Dr, truid, invoice)
            res.send({ status: 200, message: "Stock reversed to consumer account against " + invoice })
          }
        })
    }
  })

  function updatewalletBal(tav, truid) {
    var total = parseFloat(tav.toJSON().$numberDecimal) * -1;
    Wallet.findOneAndUpdate({
      truID: truid
    }, {
      $inc: {
        "clBal": total
      },
      $set: {
        Cr: total
      }
    }, {
      upsert: true
    }).exec(function (err, result) {

    }
    )
  }
}


exports.list_all_charges_consumer = function (req, res) {
  let Gen = req.generalCharges;
  var Final =
    ({
      "assetmanagercharges": Gen.assetmanagercharges,
      "transactionCharges": Gen.transactionCharges,
      "assetstoreCharges": Gen.assetstoreCharges,
      "othercharges": Gen.othercharges,
      "entitycharges": Gen.entitycharges,
      "assetmanagercharges_rgcoin": Gen.assetmanagercharges_rgcoin,
      "tax": Gen.tax
    });
  res.json({
    resource: Final
  }
  )
}


exports.profitlossbuysellOld = function (req, res) {
  var Gen = req.generalCharges;
  var truid = req.body.truid;
  KycAll.find({ truID: truid }, function (err, docs) {
    if (!docs.length) {
      res.json({
        status: "204",
        message: "The request was successful but no body was returned."
      });
    } else {
      var countryCode = docs[0].countryCode;
      var respresult = TXN.aggregate([{ $match: { to: truid, type: { $in: ["buy", "buyCash"] }, status: "success" } },
      { $sort: { createDate: -1 } },
      {
        $facet: {
          G24K: [{ $match: { "particularsG24.qty": { $gt: 0 } } },
          { $project: { assetmanagerRate: "$particularsG24", _id: 0, to: 1 } },
          { $unwind: "$assetmanagerRate" },
          {
            $group: {
              _id: null, avgBuyRate: { $avg: "$assetmanagerRate.rate" }, to: { $first: "$to" }
            }
          },
          { $project: { avgBuyRate: 1, _id: 0, to: 1 } },
          {
            $lookup: {
              from: "stocks",
              localField: "to",
              foreignField: "truID",
              as: "custstock"
            }
          },
          { $unwind: "$custstock" },
          {
            $lookup: {
              from: "wallets",
              localField: "to",
              foreignField: "truID",
              as: "wallet"
            }
          },
          { $unwind: "$wallet" },
          {
            $project: {
              avgBuyRate: { $toString: "$avgBuyRate" }, _id: 0, to: 1,
              stock: { "$toString": { $cond: [{ $lt: ["$custstock.stock.G24K", 0.000001] }, 0.00, "$custstock.stock.G24K"] } },
              walletBal: { $toString: "$wallet.clBal" }
            }
          },
          ],
          S99P: [{ $match: { "particularsS99.qty": { $gt: 0 } } },
          { $project: { assetmanagerRate: "$particularsS99", _id: 0, to: 1 } },
          { $unwind: "$assetmanagerRate" },
          { $group: { _id: null, avgBuyRate: { $avg: "$assetmanagerRate.rate" }, to: { $first: "$to" } } },
          { $project: { avgBuyRate: 1, _id: 0, to: 1 } },
          {
            $lookup: {
              from: "stocks",
              localField: "to",
              foreignField: "truID",
              as: "custstock"
            }
          },
          { $unwind: "$custstock" },
          {
            $lookup: {
              from: "wallets",
              localField: "to",
              foreignField: "truID",
              as: "wallet"
            }
          },
          { $unwind: "$wallet" },
          {
            $project: {
              avgBuyRate: { $toString: "$avgBuyRate" }, _id: 0, to: 1,
              stock: { "$toString": { $cond: [{ $lt: ["$custstock.stock.S99P", 0.000001] }, 0.00, "$custstock.stock.S99P"] } },
              walletBal: { $toString: "$wallet.clBal" }
            }
          },
          ],
          totalPurchase: [{ $match: { type: "buy", status: "success" } },
          { $group: { _id: "$to", sum: { $sum: "$totalAmount" } } },
          { $project: { _id: 0, amount: { $ifNull: [{ $divide: [{ $multiply: ["$sum", 100] }, 100 + (Gen.tax * 100)] }, 0] } } }
          ]
        }
      }]);
      respresult.exec(async function (err, result) {
        if (err) {
          res.json({ status: "204", message: "Something went wrong!" });
        } else {

          var avgbuyG24K = result[0].G24K.length > 0 ? result[0].G24K[0].avgBuyRate : 0;
          var avgbuyS99P = result[0].S99P.length > 0 ? result[0].S99P[0].avgBuyRate : 0;
          var stock24k = result[0].G24K.length > 0 ? result[0].G24K[0].stock : 0;
          var stock99p = result[0].S99P.length > 0 ? result[0].S99P[0].stock : 0;
          var totalPurchaseAmount = (result[0].totalPurchase.length > 0) ? result[0].totalPurchase[0].amount : 0;
          var balance = 0;
          if (result[0].S99P.length > 0) {
            balance = result[0].S99P[0].walletBal ? result[0].S99P[0].walletBal : 0
          }
          // callPercentage(); 
          Wallet.find({ truID: req.body.truid }, function (err, walldocs) {
            if (!walldocs.length) {
              Stock.aggregate([
                { $match: { truID: req.body.truid } },
                {
                  $project: {
                    _id: 0, truID: 1,
                    G24K: "$stock.G24K",
                    S99P: "$stock.S99P"
                  }
                }
              ]).exec(function (err, stockdocs) {
                if (!stockdocs.length) {
                } else {
                  stock24k = stockdocs[0].G24K
                  stock99p = stockdocs[0].S99P
                }
                callPercentage()
              })
            } else {
              balance = walldocs[0].clBal;
              Stock.aggregate([
                { $match: { truID: req.body.truid } },
                {
                  $project: {
                    _id: 0, truID: 1,
                    G24K: "$stock.G24K",
                    S99P: "$stock.S99P"
                  }
                }
              ]).exec(function (err, stockdocs) {
                if (!stockdocs.length) {
                } else {
                  stock24k = stockdocs[0].G24K
                  stock99p = stockdocs[0].S99P
                }
                callPercentage()
              })
            }
          })
          function callPercentage() {
            request.post({
              "headers": { "content-type": "application/json" },
              "url": conf.reqip + ":4114/v1/api/topassetmanagers",
              "body": JSON.stringify({
                "truid": req.body.truid,
                "assetmanagersearch": "liveRateBoth"
              })
            }, (error, response, body) => {
              if (error) {
                res.json({
                  status: "411", message: "No rate found..!!"
                });
              }
              else {
                var resJson = JSON.parse(body);
                if (resJson.status == "200") {
                  var rate = resJson.resource;
                  // console.log("rate", rate);
                  var g24krate = parseFloat(rate.G24KSaleRate),
                    s99prate = parseFloat(rate.S99PSaleRate),
                    g24kbuy = parseFloat(rate.G24K),
                    s99pbuy = parseFloat(rate.S99P);

                  var diff24KTotal = 0;
                  var g24kPer = 0;
                  var g24kPerValue = 0;
                  if (parseFloat(avgbuyG24K) > 0) {
                    diff24KTotal = g24kbuy - parseFloat(avgbuyG24K);
                    g24kPer = (diff24KTotal / parseFloat(avgbuyG24K)) * 100;
                    g24kPerValue = diff24KTotal * parseFloat(stock24k);
                  }
                  else {
                    g24kPer = 0;
                    g24kPerValue = 0;

                  }
                  var diff99Total = 0;
                  var s99Per = 0;
                  var s99PerValue = 0
                  if (parseFloat(avgbuyS99P) > 0) {
                    diff99Total = s99pbuy - parseFloat(avgbuyS99P);
                    s99Per = (diff99Total / parseFloat(avgbuyS99P)) * 100;
                    s99PerValue = diff99Total * parseFloat(stock99p);
                  }

                  var goldValuation = g24kbuy * parseFloat(stock24k);
                  var silverValuation = s99pbuy * parseFloat(stock99p);
                  let resultobj = {
                    g24kPerValue: g24kPerValue.toString(),
                    s99PerValue: s99PerValue.toString(),
                    g24kPer: g24kPer.toString(),
                    s99Per: s99Per.toString(),
                    stock24k: stock24k.toString(),
                    stock99p: stock99p.toString(),
                    balance: balance.toString(),
                    goldValuation: goldValuation.toString(),
                    silverValuation: silverValuation.toString(),
                    G24KSaleRate: g24krate.toString(),
                    S99PSaleRate: s99prate.toString(),
                    G24K: g24kbuy.toString(),
                    S99P: s99pbuy.toString()
                  }
                  res.json({
                    status: "200", resource: resultobj,
                    panStatus: docs[0].panStatus ? docs[0].panStatus : "pending"
                  });
                }
                else {
                  res.json({
                    status: "411", message: "No rate found..!!"
                  });
                }
              }
            })
          }

        }
      }
      )
    }
  })
}




exports.validate_stock_trans = function (req, res) {
  var stock = new Stock(req.user);

  var truid = req.body.truid;
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
                    if: { $and: [{ $gte: ["$stock.G24K", { $toDecimal: qty }] }, { $gt: ["$stock.G24K", 0] }] },
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
  else if (bulltype === "S99P") {

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
                    if: { $and: [{ $gte: ["$stock.S99P", { $toDecimal: qty }] }, { $gt: ["$stock.S99P", 0] }] },
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





exports.remmit_print_invoice_c2c = function (req, res) {  // call for transfer , request and gift
  let Gen = req.generalCharges;
  var truid = req.body.truid;
  var invoice = req.body.invoice;

  // KycAll.find({ truID: truid }, function (err, docs) {
  //   if (!docs.length) {
  //     res.json({
  //       status: "204",
  //       message: 'The request was successful but no TruID was returned.'
  //     });
  //   } else {
  var respresult = TXN.aggregate([
    { $match: { invoice: invoice, $or: [{ "receiverTruID": truid }, { "to": truid }] } },
    {
      $project:
      {
        invoice: 1, to: 1, from: 1, _id: 0, particularsG24: 1, createDate: 1, rTruID: 1, sourceFlag: 1, remmitCharges: 1,
        particularsS99: 1, totalAmount: 1, status: 1, MOP: 1, type: 1, receiverTruID: 1
      }
    },
    {
      $lookup: {
        from: "kycs",
        localField: "to",
        foreignField: "truID",
        as: "sender"
      }
    },
    { $unwind: { path: "$sender", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "kycs",
        localField: "receiverTruID",
        foreignField: "truID",
        as: "receiver"
      }
    },
    { $unwind: { path: "$receiver", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        invoice: 1, to: 1, from: 1, _id: 0, particularsG24: 1, rTruID: 1, sourceFlag: 1, remmitCharges: 1,
        particularsS99: 1, totalAmount: 1, status: 1, MOP: 1, type: 1, createDate: 1,

        address: "$receiver.permanentAddress", fName: "$receiver.fName",
        lName: "$receiver.lName", assetstoreID: "$receiver.currentassetstore",
        receiverTruID: 1,

        s_address: "$sender.permanentAddress", s_fName: "$sender.fName",
        s_lName: "$sender.lName", s_assetstoreID: "$sender.currentassetstore"
      }
    }
  ]);

  respresult.exec(async function (err, result) {
    if (err) {
      response.status(500).send({ error: err })
      return next(err);
    }
    else {
      var resource = result[0];
      if (resource === undefined) {
        res.json({
          status: "204",
          message: 'The request was successful but you enterd wrong invoice number.'
        });
      }
      else {

        var invoice = resource.invoice;
        var to = resource.to;
        var rtruid = resource.rTruID;
        var status = resource.status;
        var address = resource.address;
        var fname = resource.fName;
        var lname = resource.lName;
        var assetstoreID = resource.assetstoreID;
        if (to.substring(0, 4) === "8000") {
          var docs = await enKycAll.find({ "truID": to });
          address = docs[0].address?.address;
          fname = docs[0].companyName ? docs[0].companyName.replace('null', '') : "";
          lname = "";
          assetstoreID = docs[0].assetstoreID ? docs[0].assetstoreID : defaultConf.currentassetstore;
        }
        var mop = resource.MOP;
        var type = resource.type;
        var createDate = resource.createDate;

        var s_address = resource.s_address;
        var s_fname = resource.s_fName;
        var s_lname = resource.s_lName;
        var s_tpa = resource.s_TPA;
        var s_assetstoreID = resource.s_assetstoreID;
        var remmitCharges = resource.remmitCharges.toJSON().$numberDecimal;

        ///Rate for 24
        var tid24 = resource.particularsG24.TID;
        var from24 = resource.particularsG24.assetmanagerName;
        var fromtruid24 = resource.particularsG24.from;
        var q24v = resource.particularsG24.qty.toJSON().$numberDecimal;
        var r24v = resource.particularsG24.rate.toJSON().$numberDecimal;
        var a24v = resource.particularsG24.amount.toJSON().$numberDecimal;
        var d24v = resource.particularsG24.assetmanagersCharges.toJSON().$numberDecimal;
        var o24v = resource.particularsG24.otherCharges.toJSON().$numberDecimal;
        var tx24v = resource.particularsG24.tax.toJSON().$numberDecimal;
        var t24v = resource.particularsG24.total.toJSON().$numberDecimal;

        //Rate S99P
        var tid99 = resource.particularsS99.TID;
        var from99 = resource.particularsS99.assetmanagerName;
        var fromtruid99 = resource.particularsS99.from;
        var q99v = resource.particularsS99.qty.toJSON().$numberDecimal;
        var r99v = resource.particularsS99.rate.toJSON().$numberDecimal;
        var a99v = resource.particularsS99.amount.toJSON().$numberDecimal;
        var d99v = resource.particularsS99.assetmanagersCharges.toJSON().$numberDecimal;
        var o99v = resource.particularsS99.otherCharges.toJSON().$numberDecimal;
        var tx99v = resource.particularsS99.tax.toJSON().$numberDecimal;
        var t99v = resource.particularsS99.total.toJSON().$numberDecimal;

        var ta = resource.totalAmount.toJSON().$numberDecimal;
        var sourceflag = resource.sourceFlag;


        request.post({
          "headers": { "content-type": "application/json" },
          "url": reqip + ":4121/api/showaddressinvoice",
          "body": JSON.stringify({
            "truid": rtruid
          })
        }, async (error, response, body) => {
          if (error) {
            return console.dir(error);
          } else {
            var raddress = JSON.parse(body).address;
            if (!raddress) {
              raddress = {};
            }
            var companyname = JSON.parse(body).companyName;
            var Final =
              ({
                "invoice": invoice, "to": resource.receiverTruID, "status": status, address: address, fName: fname, MOP: mop, remmitCharges: remmitCharges,
                lName: lname, totalAmount: ta, type: type, "createDate": createDate, rTruID: rtruid,
                s_address: s_address, s_fname: s_fname, s_lname: s_lname, s_truID: to,
                s_assetstoreID: s_assetstoreID,
                "particularsG24": {
                  "TID": tid24, "from": from24, "qty": q24v, "rate": r24v, "amount": a24v, "fromTruID": fromtruid24,
                  "assetmanagersCharges": d24v, "otherCharges": o24v, "tax": tx24v, "total": t24v,
                },
                "particularsS99": {
                  "TID": tid99, "from": from99, "qty": q99v, "rate": r99v, "amount": a99v, "fromTruID": fromtruid99,
                  "assetmanagersCharges": d99v, "otherCharges": o99v, "tax": tx99v, "total": t99v,
                },
                rCity: raddress.city, rCountry: raddress.country, rHouseNumber: raddress.houseNumber, rLandmark: raddress.landmark,
                rLocation: raddress.location, rPIN: raddress.pin, rState: raddress.state, rStreetNumber: raddress.streetNumber,
                rCompanyName: companyname
              });
            if (type === "payment") {
              if (to.substring(0, 4) === "8000") {
                var trupaymentDetails = await enWalletlog.findOne({ invoice: invoice }).select({ charges: 1, cashback: 1, Cr: 1 });
                Final["charges"] = parseFloat(trupaymentDetails.charges);
                Final["cashback"] = parseFloat(trupaymentDetails.cashback);
                Final["totalCredited"] = parseFloat(trupaymentDetails.Cr);
              }
            }
            if (status === "success" && mop === "others" && sourceflag === "customer") {
              Atom.find({ invoice: invoice }, function (err, atomdocs) {
                if (atomdocs.length) {
                  var temppayby = atomdocs[0].MOP;
                  Final.PGType = "atom";
                  Final.payBy = (temppayby == "NB") ? "Net Banking" : (temppayby == "CC") ? "Credit Card" : (temppayby == "DC") ? "Debit Card" : (temppayby == "UP") ? "UPI" : temppayby;
                  Final.bankTXNID = atomdocs[0].bankTxnID;
                  Final.paymentCharge = atomdocs[0].surcharge.toJSON().$numberDecimal;
                  res.json({ status: "200", resource: Final });
                }
              }
              )
            } else if (status === "success" && mop === "others" && sourceflag === "remmit") {
              request.post({
                "headers": { "content-type": "application/json" },
                "url": reqip + ":4121/api/",
                "body": JSON.stringify({
                  "invoice": invoice
                })
              }, (error, response, pgdetails) => {
                var pgdetails = JSON.parse(pgdetails);

                Final.bankTXNID = pgdetails.bankTXNID;
                Final.PGType = pgdetails.PGType;
                Final.payBy = pgdetails.payBy;
                Final.paymentCharge = pgdetails.paymentCharge;
                res.json({ status: "200", resource: Final });

              }
              )
            } else {
              res.json({ status: "200", resource: Final });
            }

            // res.json({status : "200", resource : Final});
          }
        }
        )
      }
    }
  }
  )
  //   }
  // }
  // )
}






exports.print_invoice_add_money = function (req, res) {  //call for add money receipt
  var txn = new TXN(req.user);
  var truid = req.body.truid;
  var invoice = req.body.invoice;

  KycAll.find({ truID: truid }, function (err, docs) {
    if (!docs.length) {
      res.json({
        status: "204",
        message: 'The request was successful but no TruID was returned.'
      })
    } else {
      if (invoice != undefined) {
        var respresult = Atom.aggregate([
          { $match: { "customerTruID": truid, "invoice": invoice } },
          {
            $project: {
              _id: 0, atomID: 1, amount: 1, surcharge: 1, prodid: 1, bankTxnID: 1, status: 1,
              createDate: 1, customerTruID: 1, bankName: 1, MOP: 1, cardNumber: 1, failureReason: 1,
              userName: 1, email: 1, mobile: 1, address: 1, tType: 1, atomDate: 1, tStatus: 1
            }
          },
          {
            $lookup: {
              from: "kycs",
              localField: "customerTruID",
              foreignField: "truID",
              as: "cust"
            }
          },
          { $unwind: "$cust" },
          {
            $project: {
              _id: 0, atomID: 1, amount: 1, surcharge: 1, prodid: 1, bankTxnID: 1, status: 1,
              createDate: 1, customerTruID: 1, bankName: 1, MOP: 1, cardNumber: 1, failureReason: 1,
              userName: 1, email: 1, mobile: 1, tType: 1, atomDate: 1, tStatus: 1,
              gender: "$cust.genderc", address: "$cust.permanentAddress", fName: "$cust.fName", lName: "$cust.lName"
            }
          }
        ]);
        respresult.exec(function (err, result) {
          if (err) {
            response.status(500).send({ error: err })
            return next(err);
          }
          else {
            var resource = result[0];
            if (resource === undefined) {
              res.json({
                status: "204",
                message: 'The request was successful but you enterd wrong invoice number.'
              });
            }
            else {
              var atomid = resource.atomID;
              var amount = resource.amount.toJSON().$numberDecimal;
              var surcharge = resource.surcharge.toJSON().$numberDecimal;
              var prodid = resource.prodid;
              var banktxnid = resource.bankTxnID;
              var status = resource.status;
              var mop = resource.MOP;
              var truid = resource.customerTruID;

              var dt = ((resource.createDate).toString()).split(" ");
              var createDate = dt[2].concat("-", dt[1], "-", dt[3], " ", dt[4])

              var bankname = resource.bankName;
              var cardnumber = resource.cardNumber;
              var failurereason = resource.failureReason;
              var username = resource.userName;
              var email = resource.email;
              var mobile = resource.mobile;
              var ttype = resource.tType;
              var atomdate = resource.atomDate;
              var tstatus = resource.tStatus;
              var gender = resource.gender;
              var address = resource.address;
              var fname = resource.fName;
              var lname = resource.lName;


              var Final =
                ({
                  "atomID": atomid, "amount": amount, "surcharge": surcharge, "prodid": prodid, "bankTxnID": banktxnid,
                  "status": status, "MOP": mop, "truID": truid, "createDate": createDate,
                  "bankName": bankname, "cardNumber": cardnumber, "failureReason": failurereason, "userName": username,
                  "email": email, "mobile": mobile, "tType": ttype, "atomDate": atomdate,
                  "tStatus": tstatus, "gender": gender, "address": address, "fName": fname, "lName": lname
                });
              res.json({ status: "200", resource: Final });
            }
          }
        }
        )
      }
    }
  }
  )
}


exports.recent_transfers = function (req, res) {
  let truid = req.body.truID;
  KycAll.find({ truID: truid }, function (err, docs) {
    if (!docs.length) {
      res.json({
        status: "204",
        message: 'The request was successful but no TruID was returned.'
      });
    }
    else {
      TXN.aggregate([{
        $match: {
          $or: [{ "to": truid }, { "receiverTruID": truid }], "status": "success", "type": { $in: ["transfer", "gift"] }
        }
      }, {
        $project: {
          _id: 0, createDate: 1,
          to: {
            $cond: {
              if: { $and: [{ $eq: ["$to", truid] }] }, then:
                "$receiverTruID", else: "$to"
            }
          }
        }
      },
      { $group: { _id: "$to", lasttxn: { $last: "$$ROOT" } } },
      {
        $lookup: {
          from: "kycs",
          localField: "_id",
          foreignField: "truID",
          as: "cust"
        }
      }, { $unwind: { path: "$cust", preserveNullAndEmptyArrays: true } }, {
        $project: {
          _id: 0, truID: "$_id", createDate: "$lasttxn.createDate", fName: "$cust.fName", lName: "$cust.lName", mobile: "$cust.mobile", image: "$cust.image",
          city: "$cust.permanentAddress.city", country: "$cust.permanentAddress.country"
        }
      }
      ]).exec(async function (err, result) {
        if (err) {
          res.json({ status: "204", message: "Something went wrong!" });
        } else {
          if (!result.length) {
            res.json({ status: "204", message: "No records found!" });
          }
          else {
            var finalArray = [];
            for await (const element of result) {
              var obj = {}
              var consumerTruID = element.truID;
              if (element.truID === truid) {
                consumerTruID = element.receiverTruID;
              }
              if (consumerTruID.substring(0, 4) === "8000") {
                var endetls = await enKycAll.findOne({ truID: consumerTruID })
                obj["truID"] = endetls.truID;
                obj["name"] = endetls.companyName;
                obj["mobile"] = endetls.mobile;
                obj["image"] = endetls.image;
                obj["city"] = endetls.address?.city;
                obj["country"] = endetls.address?.country;
                obj["createDate"] = new Date(element.createDate);
                obj["type"] = "merchant";
                finalArray.push(obj);
              } else {
                obj["truID"] = element.truID;
                obj["name"] = element.fName + " " + element.lName;
                obj["mobile"] = element.mobile;
                obj["image"] = element.image;
                obj["city"] = element.city;
                obj["country"] = element.country;
                obj["createDate"] = new Date(element.createDate);
                obj["type"] = "consumer";
                finalArray.push(obj);
              }
            }
            res.json({ status: "200", resource: finalArray.sort((a, b) => (a.createDate > b.createDate ? -1 : 1)) });
          }
        }
      }
      )
    }
  }
  )
}

exports.atom_Add_money = function (req, res) {
  var crnno = req.body.crnno,
    invoice = req.body.invoice,
    amt = parseFloat(req.body.amt);
  if (isNaN(amt) && parseFloat(amt) > 0) {
    res.json({ status: "401", message: "please Enter Valid Amount" });
  }
  else {
    KycAll.find({
      "CRNNo": crnno
    }, function (err, docs) {
      if (err) {
        res.json({ status: "500", message: "Internal Server Error" });
      } else {

        if (!docs.length) {
          res.json({ status: "204", message: "Consumer not exist" });
        } else {
          var truid = docs[0].truID;
          var frommailtype = docs[0].emailVerified == true ? "both" : "sms";
          Atom.aggregate([
            { $match: { "customerTruID": truid, "invoice": invoice, status: "Ok", tType: "addMoney" } },
            { $project: { _id: 0, amount: "$invoiceAmount", invoice: 1, bankTxnID: 1, MOP: 1, bankName: 1 } },
            {
              $lookup: {
                localField: "invoice",
                foreignField: "invoice",
                from: "walletlogs",
                as: "wl"

              }
            },
            { $unwind: "$wl" },
            { $match: { "wl.moneyAdded": false } },
            { $project: { amount: 1, moneyAdded: "$wl.moneyAdded", bankTxnID: 1, MOP: 1, bankName: 1 } }
          ]).exec(function (err, resp) {

            if (err) {
              res.json({ status: "500", message: "Internal Server Error" });
            } else {
              if (!resp.length) {
                res.json({
                  status: "204",
                  message: "Payment history not exists."
                });
              } else {
                var pgdetail = resp[0];
                var temppayby = pgdetail.MOP,
                  payby = (temppayby == "NB") ? "Net Banking" : (temppayby == "CC") ? "Credit Card" : (temppayby == "DC") ? "Debit Card" : (temppayby == "UP") ? "UPI" : temppayby,
                  banktxnid = pgdetail.bankTxnID,
                  paymentcharge = 0;

                var query = { truID: truid };
                Wallet.findOneAndUpdate(query, { $set: { Cr: amt }, $inc: { clBal: amt } }).exec(function (err, result) {
                  if (err) {
                    console.log(err)
                  }
                  else {
                    WalletLog.findOneAndUpdate({ invoice: invoice }, { $set: { moneyAdded: true } }).exec();
                    res.json({ status: "1000", message: 'amount added to Wallet from Bank Account' });
                    KycAll.aggregate([
                      { $match: { __t: "KycAll", $or: [query] } },
                      { $project: { name: { $concat: ["$fName", " ", "$lName"] }, _id: 0, truID: 1, mobile: 1, email: 1, emailVerified: 1 } },
                      {
                        $lookup: {
                          from: "wallets",
                          localField: "truID",
                          foreignField: "truID",
                          as: "wallet"
                        }
                      },
                      { $unwind: "$wallet" },
                      {
                        $project: {
                          name: 1, truID: 1, mobile: 1, email: 1, emailVerified: 1,
                          balance: "$wallet.clBal"
                        }
                      }
                    ]).exec(function (err, resss) {
                      MAIL.addMoneyEmail(resss[0], payby, banktxnid, paymentcharge, frommailtype, amt, invoice);
                    })
                    request.post({
                      "headers": { "content-type": "application/json" },
                      "url": reqip + ":4116/api/insnotification",
                      "body": JSON.stringify({
                        "notifyto": truid,
                        "CRNNo": crnno,
                        "triggeredByCRNNo": crnno,
                        "triggeredbytruid": truid,
                        "notification": "Amount of " + defaultConf.defaultCurrency + " " + amt + " added successfully on your account wallet.",
                        "type": "walletTransaction",
                        "subtype": "addMoney",
                        "title": "Add Money",
                        "referenceid": truid
                      })
                    }, (error, response, body) => {
                    })
                  }
                }
                )
              }
            }
          });
        }
      }
    })
  }
}


exports.validate_stock = function (req, res) {
  var stock = new Stock(req.user);
  var totruid = req.body.totruid;
  var stotruid = "5000"; // we should have to create one dummy stock entry for the purspose of exception handling

  if (totruid == null || totruid == "0") {
    totruid = stotruid
  } else {
    var totruid = totruid
  }
  var g24 = parseFloat(req.body.g24);
  var s99 = parseFloat(req.body.s99);
  var isnan = parseFloat("0");

  if (isNaN(g24)) {
    var g24 = isnan;
  } else {
    var g24 = g24
  };


  if (isNaN(s99)) {
    var s99 = isnan;
  } else {
    var s99 = s99
  };
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
              message: "transaction terminated please select lesser quantity of G24K."
            })
          }
          else if (s24 == "resolve" && s99 != "resolve") {
            res.json({
              status: "99",
              message: "transaction terminated please select lesser quantity except S99P."
            })
          } else {
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


exports.get__Slag_Charges = function (req, res) {
  let Gen = req.generalCharges;
  res.json({ status: 200, resource: Gen })
}


exports.validatelimitsOnOTP = function (req, res) {
  var type = req.body.type;
  var mobile = req.body.mobile;
  var amt = parseFloat(req.body.amt);
  KycAll.find({ mobile: mobile, "KYCFlag": "active" }, function (err, docs) {
    if (err) {
      res.status(500).json({ status: "500", "message": "internal Server error" })
    } else {
      if (docs.length) {
        var kycFlag = docs[0].docVerified == true ? "KYC" : "nonKYC";
        var truID = docs[0].truID;
        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":4125/api/showconsumerconfigurations",
          "body": JSON.stringify({ "kycflag": kycFlag, appliedOn: "consumer", "truid": truID })
        }, (error, response, body) => {
          if (error) {
            res.json({ status: "500", message: "Internal Server Error" })
          }
          else {
            if (response.statusCode == 200) {
              if (JSON.parse(body).status == "200") {
                var limit = JSON.parse(body).resource.limit.walletLimit;
                if (type == "walletToBank") {
                  ConsumerConfig.checkWallettobankLimit(truID, amt, limit, function (limitcb, remainingtime) {
                    if (limitcb === "200") {
                      res.json({ status: "200", message: "You can proceed" });
                    }
                    else if (limitcb === "500") {
                      res.json({ status: "204", message: "You have exceeded your transaction limit! Please verify your KYC for unlimited access." });
                    } else if (limitcb === "400") {
                      var time = remainingtime + 1;
                      res.json({ status: "204", message: "Please do the next transaction after " + time + " min. This is for your transaction safety." });
                    } else {
                      res.json({ status: "204", message: "Something went wrong, Please try again!" });
                    }
                  })
                }
                else if (type == "cSell") {
                  ConsumerConfig.checkredeemtobankLimit(truID, amt, function (limitcb, remainingtime) {
                    if (limitcb === "200") {
                      res.json({ status: "200", message: "You can proceed" });
                    }
                    else if (limitcb === "500") {
                      res.json({ status: "204", message: "You have exceeded your transaction limit! Please verify your KYC for unlimited access." });
                    } else if (limitcb === "400") {
                      var time = remainingtime + 1;
                      res.json({ status: "204", message: "Please do the next transaction after " + time + " min. This is for your transaction safety." });
                    } else {
                      res.json({ status: "204", message: "Something went wrong, Please try again!" });
                    }
                  })
                } else {
                  res.json({ status: "204", message: "Please Send valid transaction type!" });
                }

              } else {
                res.json(JSON.parse(body))
              }
            } else {
              res.json({ status: "204", message: "something went wrong" })
            }
          }
        })
      } else {
        res.json({ status: "200", message: "consumer not found..!!" })
      }
    }
  })

}

