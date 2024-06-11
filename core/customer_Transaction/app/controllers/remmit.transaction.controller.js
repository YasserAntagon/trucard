'use strict'

var randomize = require('randomatic'),
  request = require('request'),
  fs = require('fs'),
  path = require('path'),
  KycAll = require('../models/custKYCAllModel'),
  enKYC = require('../models/remmitKYCAllModel'),
  Accounts = require('../models/accModel'),
  Mop = require('../models/custMOPModel'),
  TXN = require('../models/custTXNModelClient'),
  md5 = require('md5'),
  conf = require("../conf"),
  MAIL = require("../controllers/email.controller"),
  { initiateEntityRevenueRefund } = require('./partnerRevenue'),
  ConsumerConfig = require('../consumerConfig/validate.limit.controller'),
  bankApi = require('./bank.controller'),
  defaultConf = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../regionConf.json'))),
  calculate = require('./calculation.controller'),
  { encryption } = require('./encrypt');
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

let reqip = conf.reqip,
  liveratepath = conf.liveratepath;
exports.test = function (req, res) {
  res.json({ message: "Welcome to Company Api" });
};
async function validatePaymodes(mop, walletaccess, paymentmodeaccess) {

  let accessarray = ["disable", "hide"];
  if (mop === "truWallet" && walletaccess && paymentmodeaccess && (accessarray.includes(walletaccess) || accessarray.includes(paymentmodeaccess))) {
    return ("Your payment mode and wallet access are disabled. Please contact your Administrator.");
  } else {
    return (200)
  }
}
exports.remmit_buy_bullions = function (req, res) {
  let Gen = req.generalCharges;
  var s24 = parseFloat(req.body.g24qty),
    s99 = parseFloat(req.body.s99qty),

    totruid = req.body.totruid,
    rtruid = req.body.rtruid,

    fromtru24 = req.body.fromtruid24,
    fromtru99 = req.body.fromtruid99;

  if (req.body.transactiontype != "buy") {
    res.json({ status: "204", message: "The transaction type must be 'BUY'" })
  }
  else {
    if (s24 == "0" && s22 == "0" && s18 == "0" && s99 == "0") { res.json({ status: "204", message: "No Quantity Selected" }) }
    else if (s24 != "0" || s22 != "0" || s18 != "0" || s99 != "0") {
      KycAll.find({
        "truID": totruid, KYCFlag: "active"
      }, function (err, docs) {
        if (!docs.length) {
          res.json({ status: "204", message: "The request was successful but no body was returned." });
        } else {
          ///////////////////////////////entity_config////////////////////////////////////////
          request.post({
            "headers": { "content-type": "application/json" },
            "url": reqip + ":4125/api/showconsumerconfigurations",
            "body": JSON.stringify({ "kycflag": "KYC", "appliedOn": "entity", "truid": rtruid })
          }, async (err, response, body) => {
            if (err || !body) {
              res.json({ status: "204", message: "Please reset your configurations." });
            } else {
              if (response.statusCode == 200) {
                var configbody = JSON.parse(body);
                if (configbody.status === "204") {
                  res.json({ status: "204", message: "Please check your configurations." });
                } else {
                  var walletaccess = configbody.resource.moduleSelf.walletAccess;
                  var paymentmodeaccess = configbody.resource.moduleSelf.payByWallet;


                  var respvalpaymodes = await validatePaymodes(req.body.mop, walletaccess, paymentmodeaccess);
                  if (respvalpaymodes === 200) {
                    stockvalidation();
                    function stockvalidation(err, numAffected) {
                      request.post({
                        "headers": {
                          "content-type": "application/json"
                        },
                        "url": reqip + ":4125/api/validatestock",
                        "body": JSON.stringify({
                          "truid24": fromtru24,
                          "truid99": fromtru99,
                          "g24": s24,
                          "s99": s99
                        })
                      }, async function (error, response, body) {
                        if (error) {
                          return console.dir(error);
                        } else {
                          var result = JSON.parse(body);
                          var validationstatus = result.status;

                          if (validationstatus == "200") {
                            var particularsG24 = {}, particularsS99 = {},
                              stockNA = new Array(),
                              qtyNA = new Array(),
                              inputNA = new Array(),
                              status = req.body.status,
                              totaladd = 0, remmitcharges = 0, totaltax = 0;

                            date = new Date(); // today's date and time in ISO format
                            function fromServer(Gen, amtruid, sqty, bulltype, arr) {
                              return new Promise((resolve, reject) => {
                                if (sqty !== 0 && sqty > 0) {
                                  var particulsStockNA = {};
                                  async function generateParticular(Gen, amtruid, bulltype, sqty) {
                                    var fcrgs = await calculate.Buy_calculation_remmit(Gen, amtruid, bulltype, sqty, rtruid);
                                    if (fcrgs.status === "200" || fcrgs.stockstatus === "resolve") {
                                      totaladd += fcrgs.total;
                                      totaltax += fcrgs.tax;
                                      remmitcharges += fcrgs.remmitCharges;
                                      resolve(Object.assign(arr, particularsArr(fcrgs)));
                                    } else {
                                      // particulsStockNA = sqty;
                                      particulsStockNA["bullionType"] = bulltype;
                                      resolve(stockNA.push(particulsStockNA));
                                    }
                                  }
                                  generateParticular(Gen, amtruid, bulltype, sqty);

                                } else {
                                  resolve(Object.assign(arr, particularsArr()));
                                }
                              })
                            }

                            if (s24 !== 0 && s24 > 0) {
                              await fromServer(Gen, fromtru24, s24, "G24K", particularsG24);
                            } else {
                              particularsG24 = particularsArr();
                            }



                            if (s99 !== 0 && s99 > 0) {
                              await fromServer(Gen, fromtru99, s99, "S99P", particularsS99);
                            } else {
                              particularsS99 = particularsArr();
                            }

                            if (inputNA.length) {
                              res.json({ status: "204", message: "Invalid input.", inputNA: inputNA })
                            } else if (qtyNA.length) {
                              res.json({ status: "204", message: "Please select Quantity between 0.1 && 100 each bullion.", qtyNA: qtyNA })
                            } else if (stockNA.length) {
                              res.json({ status: "204", message: "Stock not available.", stockNA: stockNA })
                            } else if (status != "failure" && status != "success") {
                              res.json({
                                status: "204",
                                message: "The Transaction Must Either Be In  'Success'  or 'Failure' Status."
                              });
                            } else if (status == "failure") {
                              var totruid = req.body.totruid;
                              var date = new Date(); // today's date and time in ISO format
                              var invoiceno = Date.parse(date);
                              // var invoice = invoiceno.toString();
                              var randomstr = randomize('0', 3);
                              var randomstr1 = randomize('0', 3);
                              var randomstr2 = randomize('0', 4);
                              var invoice = (invoiceno + parseInt(randomstr)).toString() + randomstr1 + randomstr2;

                              var type = req.body.transactiontype;
                              var status = req.body.status;
                              var mop = "other";

                              var status = "failure";
                              var md5hash = invoice + totruid + rtruid + "success" + req.body.transactiontype;

                              var insertTXN = new TXN({
                                to: totruid,
                                invoice: invoice,
                                type: type,
                                sourceFlag: "remmit",
                                rTruID: rtruid,
                                particularsG24: particularsG24,
                                particularsS99: particularsS99,
                                tdsPercentage: particularsG24.tdsPercentage > 0 ? particularsG24.tdsPercentage : particularsS99.tdsPercentage,
                                loadingPercentage: particularsG24.loadingPercentage > 0 ? particularsG24.loadingPercentage : particularsS99.loadingPercentage,
                                totalAmount: totaladd,
                                createDate: date,
                                status: status,
                                MOP: mop,
                                md5sign: md5(md5hash),
                                remmitCharges: remmitcharges
                              });
                              insertTXN.save(recallback);
                            }
                            if (status == "success") {
                              var totruid = req.body.totruid;
                              var date = new Date(); // today's date and time in ISO format
                              var invoiceno = Date.parse(date);
                              var invoice = req.body.invoice;
                              var type = req.body.transactiontype;
                              var mop = req.body.mop;

                              if (invoice != undefined) {
                                var md5hash = invoice + totruid + req.body.rtruid + req.body.status + req.body.transactiontype;
                                TXN.find({
                                  "invoice": invoice, "to": totruid,
                                  "md5sign": md5(md5hash), "status": "failure"
                                }, async function (err, docs) {
                                  if (!docs.length) {
                                    res.json({
                                      status: "204",
                                      message: "Please Enter Correct invoice number."
                                    });
                                  } else {
                                    var status = "success";


                                    var tocrypt = {
                                      to: totruid, rTruID: rtruid, invoice: invoice, type: type, sourceFlag: "remmit",
                                      particularsG24: particularsG24,
                                      particularsS99: particularsS99,
                                      tdsPercentage: particularsG24.tdsPercentage > 0 ? particularsG24.tdsPercentage : particularsS99.tdsPercentage,
                                      loadingPercentage: particularsG24.loadingPercentage > 0 ? particularsG24.loadingPercentage : particularsS99.loadingPercentage,
                                      remmitCharges: remmitcharges, totalAmount: totaladd, createDate: date, status: status, MOP: mop
                                    };
                                    var rational = JSON.stringify(tocrypt);
                                    encrypt(rational);

                                    function encrypt(rational) {
                                      var crypted = encryption(rational);
                                      if (mop != "truWallet" && mop != "others") {
                                        res.json({ status: "204", message: "Please provide valid method of payment." });
                                      }

                                      else if (mop === "truWallet") {
                                        if (walletaccess != "disable") {
                                          var wallettruid;
                                          var parentid = req.body.parentid;


                                          if (walletaccess === "allow") {
                                            wallettruid = rtruid;
                                          }
                                          else if (walletaccess === "parent") {
                                            wallettruid = parentid;
                                          }
                                          var g24qty = particularsG24.qty,
                                            s99qty = particularsS99.qty;
                                          request.post({
                                            "headers": { "content-type": "application/json" },
                                            "url": reqip + ":4121/api/entitywalletupdatetxn",
                                            "body": JSON.stringify({
                                              "truid": wallettruid,
                                              "totaladd": totaladd,
                                              "invoice": invoice,
                                              "tType": "buy",
                                              "g24qty": g24qty,
                                              "s99qty": s99qty
                                            })
                                          }, (error, response, body) => {
                                            if (error) {
                                              return console.log(error);
                                            } else {
                                              var otpresultstatus = JSON.parse(body).status;
                                              if (otpresultstatus != "200") {
                                                res.json({ status: "204", message: "Insufficient wallet balance." });

                                              } else {

                                                TXN.updateOne({
                                                  "invoice": invoice
                                                }, {
                                                  $set: {
                                                    to: totruid, invoice: invoice, type: type, sourceFlag: "remmit", hash: crypted,
                                                    rTruID: rtruid,
                                                    particularsG24: particularsG24,
                                                    particularsS99: particularsS99, tdsPercentage: particularsG24.tdsPercentage > 0 ? particularsG24.tdsPercentage : particularsS99.tdsPercentage,
                                                    loadingPercentage: particularsG24.loadingPercentage > 0 ? particularsG24.loadingPercentage : particularsS99.loadingPercentage,
                                                    remmitCharges: remmitcharges,
                                                    totalAmount: totaladd,
                                                    createDate: date,
                                                    status: status,
                                                    MOP: mop
                                                  }
                                                }, recallback)
                                              }
                                            }
                                          });
                                        }
                                        else {
                                          res.json({
                                            status: "204",
                                            message: "Your Wallet is disabled. Please contact your Administrator."
                                          });
                                        }
                                      }

                                      else if (mop === "others") {
                                        if (req.body.astatus === "Ok") {
                                          TXN.updateOne({
                                            "invoice": invoice
                                          }, {
                                            $set: {
                                              to: totruid,
                                              rTruID: rtruid,
                                              invoice: invoice,
                                              type: type,
                                              sourceFlag: "remmit", hash: crypted,
                                              particularsG24: particularsG24,
                                              particularsS99: particularsS99,
                                              tdsPercentage: particularsG24.tdsPercentage > 0 ? particularsG24.tdsPercentage : particularsS99.tdsPercentage,
                                              loadingPercentage: particularsG24.loadingPercentage > 0 ? particularsG24.loadingPercentage : particularsS99.loadingPercentage,
                                              remmitCharges: remmitcharges,
                                              totalAmount: totaladd,
                                              createDate: date,
                                              status: status,
                                              MOP: mop
                                            }
                                          }, recallback);

                                        } else {
                                          res.json({ status: "204", message: "Online Transaction has not yet succeeded" });
                                        }
                                      }
                                    }
                                  }
                                })
                              } else {
                                res.json({ status: "204", message: "Please Enter invoice number." })
                              }
                            };


                            function recallback(err, numAffected) {
                              if (err) {
                                res.send(err);
                                console.log(err);
                              }
                              var respresult = TXN.aggregate([{
                                $match: { "invoice": invoice }
                              },
                              {
                                $project: {
                                  _id: 0, invoice: 1, to: 1, from: 1, rTruID: 1, _id: 0,
                                  particularsG24: 1, particularsS99: 1,
                                  remmitCharges: 1, totalAmount: 1, status: 1, type: 1, createDate: 1
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
                              {
                                $unwind: "$cust"
                              },
                              {
                                $project: {
                                  _id: 0,
                                  invoice: 1, to: 1, from: 1, rTruID: 1, particularsG24: 1, particularsS99: 1,
                                  remmitCharges: 1, totalAmount: 1, status: 1, createDate: 1, gender: "$cust.genderc", address: "$cust.permanentAddress",
                                  fName: "$cust.fName", lName: "$cust.lName", mobile: "$cust.mobile", email: "$cust.email", emailVerified: "$cust.emailVerified",
                                  type: 1, CRNNo: "$cust.CRNNo"
                                }
                              }
                              ]);
                              respresult.exec(function (err, result) {
                                if (err) {
                                  response.status(500).send({
                                    error: err
                                  })
                                  return next(err);
                                } else {
                                  var resource = result[0];

                                  var invoice = resource.invoice;
                                  var to = resource.to;
                                  var rtruid = resource.rTruID;
                                  var status = resource.status;
                                  var address = resource.address;
                                  var fname = resource.fName;
                                  var lname = resource.lName;
                                  var type = resource.type;
                                  var crnno = resource.CRNNo;
                                  var amtruid;
                                  var pgtype = req.body.pgtype;

                                  if (resource.particularsG24.from != "0" && resource.particularsG24.from != undefined) {
                                    amtruid = resource.particularsG24.from;
                                  }
                                  else if (resource.particularsS99.from != "0" && resource.particularsS99.from != undefined) {
                                    amtruid = resource.particularsS99.from;
                                  }
                                  //remmitcharges
                                  var remit = resource.remmitCharges.toJSON().$numberDecimal;

                                  //totalAmount
                                  var tav = resource.totalAmount.toJSON().$numberDecimal;
                                  var createDate = resource.createDate;

                                  var emailVerified = resource.emailVerified;
                                  var Final = ({
                                    "invoice": invoice,
                                    "to": to,
                                    "rTruID": rtruid,
                                    "status": status,
                                    address: address,
                                    fName: fname,
                                    lName: lname,
                                    remmitCharges: remit,
                                    totalAmount: tav,
                                    type: type,
                                    MOP: mop,
                                    createDate: createDate,
                                    applicableTAX: (Gen.tax * 100).toString(),
                                    particularsG24: particularsArr(resource.particularsG24),
                                    particularsS99: particularsArr(resource.particularsS99)
                                  });
                                  if (status === "success") {
                                    if (mop === "others") {
                                      request.post({
                                        "headers": { "content-type": "application/json" },
                                        "url": reqip + ":4121/api/pgdetailsconsumertxn",
                                        "body": JSON.stringify({
                                          "invoice": invoice,
                                          "pgtype": pgtype
                                        })
                                      }, (error, response, pgdetails) => {
                                        var pgdetails = JSON.parse(pgdetails);
                                        var temppayby = pgdetails.payBy;

                                        Final.bankTXNID = pgdetails.bankTXNID;
                                        Final.payBy = (temppayby == "NB") ? "Net Banking" : (temppayby == "CC") ? "Credit Card" : (temppayby == "DC") ? "Debit Card" : (temppayby == "UP") ? "UPI" : temppayby;;
                                        Final.paymentCharge = pgdetails.paymentCharge;
                                        updatestocksendmail()
                                      })
                                    } else {
                                      updatestocksendmail()
                                    }
                                  }
                                  async function updatestocksendmail() {
                                    var mailtype = emailVerified == true ? "both" : "sms";
                                    var q24v = Final.particularsG24.qty,
                                      q99v = Final.particularsS99.qty;

                                    if (!isNaN(q24v) && parseFloat(q24v) > 0) {
                                      calculate.update_assetmanager_stock(Final.particularsG24.from, to, "G24K", q24v, "buy", invoice);
                                    }
                                    if (!isNaN(q99v) && parseFloat(q99v) > 0) {
                                      calculate.update_assetmanager_stock(Final.particularsS99.from, to, "S99P", q99v, "buy", invoice);
                                    }

                                    initiateEntityRevenueRefund(rtruid, invoice);
                                    calculate.update_stock(to, q24v, q99v, "buy", invoice);
                                    notification(to, Final.particularsG24.from, Final.particularsS99.from, crnno, invoice, q24v, q99v, "buy", tav);
                                    MAIL.consumer_emailtxnNew(to, invoice, Final.bankTXNID);

                                  }

                                  res.json({ status: "200", resource: Final });

                                }
                              });
                            };
                          } else if (validationstatus == "24") {
                            res.json({
                              status: "24",
                              message: "transaction terminated please select lesser quantity of G24K"
                            })
                          } else if (validationstatus == "99") {
                            res.json({
                              status: "99",
                              message: "transaction terminated please select lesser quantity of S99P"
                            })
                          } else {
                            res.json({
                              status: "401",
                              message: "you have choosen wrong assetmanager"
                            })
                          }
                        }
                      })
                    }
                  } else {
                    res.json({ status: "204", message: respvalpaymodes })
                  }
                }
              } else {
                res.json({ status: "500", message: "Internal server error..!!" })
              }

            }
          })
        }
      })

    }
  }
}

exports.remmit_buy_cashbullions = function (req, res) {
  let Gen = req.generalCharges;
  calculate.getratebuyCash(req.body).then((calQty) => {
    var s24 = parseFloat(calQty.s24),
      s22 = parseFloat(calQty.s22),
      s18 = parseFloat(calQty.s18),
      s99 = parseFloat(calQty.s99),

      totruid = req.body.totruid,
      rtruid = req.body.rtruid,

      fromtru24 = req.body.fromtruid24,
      fromtru22 = req.body.fromtruid22,
      fromtru18 = req.body.fromtruid18,
      fromtru99 = req.body.fromtruid99;

    if (req.body.transactiontype != "buyCash") {
      res.json({ status: "204", message: "The transaction type must be 'BUYCASH'" })
    }
    else {
      if (s24 == "0" && s22 == "0" && s18 == "0" && s99 == "0") { res.json({ status: "204", message: "No Quantity Selected" }) }
      else if (s24 != "0" || s22 != "0" || s18 != "0" || s99 != "0") {
        KycAll.find({
          "truID": totruid, KYCFlag: "active"
        }, function (err, docs) {
          if (!docs.length) {
            res.json({ status: "204", message: "The request was successful but no body was returned." });
          } else {
            ///////////////////////////////entity_config////////////////////////////////////////
            request.post({
              "headers": { "content-type": "application/json" },
              "url": reqip + ":4125/api/showconsumerconfigurations",
              "body": JSON.stringify({ "kycflag": "KYC", "appliedOn": "entity", "truid": rtruid })
            }, async (err, response, body) => {
              if (err || !body) {
                res.json({ status: "204", message: "Please reset your configurations." });
              } else {
                if (response.statusCode == 200) {
                  var configbody = JSON.parse(body);
                  if (configbody.status === "204") {
                    res.json({ status: "204", message: "Please check your configurations." });
                  } else {

                    var walletaccess = configbody.resource.moduleSelf.walletAccess;
                    // var walletaccess = "parent";
                    var paymentmodeaccess = configbody.resource.moduleSelf.payByWallet;
                    var respvalpaymodes = await validatePaymodes(req.body.mop, walletaccess, paymentmodeaccess);
                    if (respvalpaymodes === 200) {
                      stockvalidation();
                      function stockvalidation(err, numAffected) {
                        request.post({
                          "headers": {
                            "content-type": "application/json"
                          },
                          "url": reqip + ":4125/api/validatestock",
                          "body": JSON.stringify({
                            "truid24": fromtru24,
                            "truid22": fromtru22,
                            "truid18": fromtru18,
                            "truid99": fromtru99,
                            "g24": s24,
                            "s99": s99
                          })
                        }, async function (error, response, body) {
                          if (error) {
                            return console.dir(error);
                          } else {
                            var result = JSON.parse(body);
                            var validationstatus = result.status;

                            if (validationstatus == "200") {
                              var particularsG24 = {}, particularsS99 = {},
                                stockNA = new Array(),
                                qtyNA = new Array(),
                                inputNA = new Array(),
                                status = req.body.status,
                                totaladd = 0, remmitcharges = 0, totaltax = 0;

                              date = new Date(); // today's date and time in ISO format
                              function fromServer(Gen, amtruid, sqty, bulltype, arr) {
                                return new Promise((resolve, reject) => {
                                  if (sqty !== 0 && sqty > 0) {
                                    var particulsStockNA = {};
                                    async function generateParticular(Gen, amtruid, bulltype, sqty) {
                                      var fcrgs = await calculate.BuyCash_calculation_remmit(Gen, amtruid, bulltype, sqty, rtruid);
                                      if (fcrgs.status === "200" || fcrgs.stockstatus === "resolve") {
                                        totaladd += fcrgs.total;
                                        totaltax += fcrgs.tax;
                                        remmitcharges += fcrgs.remmitCharges;
                                        resolve(Object.assign(arr, particularsArr(fcrgs)));
                                      } else {
                                        // particulsStockNA = sqty;
                                        particulsStockNA["bullionType"] = bulltype;
                                        resolve(stockNA.push(particulsStockNA));
                                      }
                                    }
                                    generateParticular(Gen, amtruid, bulltype, sqty);

                                  } else {
                                    resolve(Object.assign(arr, particularsArr()));
                                  }
                                })
                              }

                              if (s24 !== 0 && s24 > 0) {
                                await fromServer(Gen, fromtru24, s24, "G24K", particularsG24);
                              } else {
                                particularsG24 = particularsArr();
                              }


                              if (s99 !== 0 && s99 > 0) {
                                await fromServer(Gen, fromtru99, s99, "S99P", particularsS99);
                              } else {
                                particularsS99 = particularsArr();
                              }

                              if (inputNA.length) {
                                res.json({ status: "204", message: "Invalid input.", inputNA: inputNA })
                              } else if (qtyNA.length) {
                                res.json({ status: "204", message: "Please select Quantity between 0.1 && 100 each bullion.", qtyNA: qtyNA })
                              } else if (stockNA.length) {
                                res.json({ status: "204", message: "Stock not available.", stockNA: stockNA })
                              } else if (status != "failure" && status != "success") {
                                res.json({
                                  status: "204",
                                  message: "The Transaction Must Either Be In  'Success'  or 'Failure' Status."
                                });
                              } else if (status == "failure") {
                                var totruid = req.body.totruid;
                                var date = new Date(); // today's date and time in ISO format
                                var invoiceno = Date.parse(date);
                                // var invoice = invoiceno.toString();
                                var randomstr = randomize('0', 3);
                                var randomstr1 = randomize('0', 3);
                                var randomstr2 = randomize('0', 4);
                                var invoice = (invoiceno + parseInt(randomstr)).toString() + randomstr1 + randomstr2;
                                var type = req.body.transactiontype;
                                var status = req.body.status;
                                var mop = "other";

                                var status = "failure";
                                var md5hash = invoice + totruid + rtruid + "success" + req.body.transactiontype;
                                var clientTXN = new TXN({
                                  to: totruid, invoice: invoice, type: type, sourceFlag: "remmit",
                                  rTruID: rtruid,
                                  particularsG24: particularsG24,
                                  particularsS99: particularsS99,
                                  tdsPercentage: particularsG24.tdsPercentage > 0 ? particularsG24.tdsPercentage : particularsS99.tdsPercentage,
                                  loadingPercentage: particularsG24.loadingPercentage > 0 ? particularsG24.loadingPercentage : particularsS99.loadingPercentage,
                                  totalAmount: totaladd,
                                  createDate: date,
                                  status: status,
                                  MOP: mop,
                                  md5sign: md5(md5hash),
                                  remmitCharges: remmitcharges
                                });
                                clientTXN.save(recallback);
                              }
                              if (status == "success") {
                                var totruid = req.body.totruid;
                                var date = new Date(); // today's date and time in ISO format
                                var invoiceno = Date.parse(date);
                                var invoice = req.body.invoice;
                                var type = req.body.transactiontype;
                                var mop = req.body.mop;

                                if (invoice != undefined) {
                                  var md5hash = invoice + totruid + req.body.rtruid + req.body.status + req.body.transactiontype;

                                  TXN.find({
                                    "invoice": invoice, "to": totruid,
                                    "md5sign": md5(md5hash), "status": "failure"
                                  }, async function (err, docs) {
                                    if (!docs.length) {
                                      res.json({
                                        status: "204",
                                        message: "Please Enter Correct invoice number."
                                      });
                                    } else {
                                      var status = "success";
                                      var tocrypt = {
                                        to: totruid, rTruID: rtruid, invoice: invoice, type: type, sourceFlag: "remmit",
                                        particularsG24: particularsG24,
                                        particularsS99: particularsS99,
                                        tdsPercentage: particularsG24.tdsPercentage > 0 ? particularsG24.tdsPercentage : particularsS99.tdsPercentage,
                                        loadingPercentage: particularsG24.loadingPercentage > 0 ? particularsG24.loadingPercentage : particularsS99.loadingPercentage,
                                        remmitCharges: remmitcharges, totalAmount: totaladd, createDate: date, status: status, MOP: mop
                                      };

                                      var rational = JSON.stringify(tocrypt);
                                      encrypt(rational);

                                      function encrypt(rational) {
                                        var crypted = encryption(rational);


                                        if (mop != "truWallet" && mop != "others") {
                                          res.json({ status: "204", message: "Please provide valid method of payment." });
                                        }

                                        else if (mop === "truWallet") {
                                          if (walletaccess != "disable") {
                                            var wallettruid;
                                            var parentid = req.body.parentid;


                                            if (walletaccess === "allow") {
                                              wallettruid = rtruid;
                                            }
                                            else if (walletaccess === "parent") {
                                              wallettruid = parentid;
                                            }

                                            var g24qty = particularsG24.qty,
                                              s99qty = particularsS99.qty;
                                            request.post({
                                              "headers": { "content-type": "application/json" },
                                              "url": reqip + ":4121/api/entitywalletupdatetxn",
                                              "body": JSON.stringify({
                                                "truid": wallettruid,
                                                "totaladd": totaladd,
                                                "invoice": invoice,
                                                "tType": "buy",
                                                "g24qty": g24qty,
                                                "s99qty": s99qty
                                              })
                                            }, (error, response, body) => {
                                              if (error) {
                                                return console.log(error);
                                              } else {
                                                var otpresultstatus = JSON.parse(body).status;
                                                if (otpresultstatus != "200") {
                                                  res.json({ status: "204", message: "Insufficient wallet balance." });

                                                } else {

                                                  TXN.updateOne({
                                                    "invoice": invoice
                                                  }, {
                                                    $set: {
                                                      to: totruid, invoice: invoice, type: type, sourceFlag: "remmit", hash: crypted,
                                                      rTruID: rtruid,
                                                      particularsG24: particularsG24,
                                                      particularsS99: particularsS99,
                                                      remmitCharges: remmitcharges,
                                                      tdsPercentage: particularsG24.tdsPercentage > 0 ? particularsG24.tdsPercentage : particularsS99.tdsPercentage,
                                                      loadingPercentage: particularsG24.loadingPercentage > 0 ? particularsG24.loadingPercentage : particularsS99.loadingPercentage,
                                                      totalAmount: totaladd,
                                                      createDate: date,
                                                      status: status,
                                                      MOP: mop
                                                    }
                                                  }, recallback)
                                                }
                                              }
                                            });
                                          }
                                          else {
                                            res.json({
                                              status: "204",
                                              message: "Your Wallet is disabled. Please contact your Administrator."
                                            });
                                          }
                                        }

                                        else if (mop === "others") {
                                          if (req.body.astatus === "Ok") {
                                            TXN.updateOne({
                                              "invoice": invoice
                                            }, {
                                              $set: {
                                                to: totruid,
                                                rTruID: rtruid,
                                                invoice: invoice,
                                                type: type,
                                                sourceFlag: "remmit", hash: crypted,
                                                particularsG24: particularsG24,
                                                particularsS99: particularsS99,
                                                remmitCharges: remmitcharges,
                                                totalAmount: totaladd,
                                                createDate: date,
                                                status: status,
                                                MOP: mop
                                              }
                                            }, recallback);

                                          } else {
                                            res.json({ status: "204", message: "Online Transaction has not yet succeeded" });
                                          }
                                        }
                                      }
                                    }
                                  })
                                } else {
                                  res.json({ status: "204", message: "Please Enter invoice number." })
                                }
                              };


                              function recallback(err, numAffected) {
                                if (err) {
                                  res.send(err);
                                  console.log(err);
                                }
                                var respresult = TXN.aggregate([{
                                  $match: { "invoice": invoice }
                                },
                                {
                                  $project: {
                                    _id: 0, invoice: 1, to: 1, from: 1, rTruID: 1, _id: 0,
                                    particularsG24: 1, particularsS99: 1,
                                    remmitCharges: 1, totalAmount: 1, status: 1, type: 1, createDate: 1
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
                                {
                                  $unwind: "$cust"
                                },
                                {
                                  $project: {
                                    _id: 0,
                                    invoice: 1, to: 1, from: 1, rTruID: 1, particularsG24: 1, particularsS99: 1,
                                    remmitCharges: 1, totalAmount: 1, status: 1, createDate: 1, gender: "$cust.genderc", address: "$cust.permanentAddress",
                                    fName: "$cust.fName", lName: "$cust.lName", mobile: "$cust.mobile", email: "$cust.email", emailVerified: "$cust.emailVerified",
                                    type: 1, CRNNo: "$cust.CRNNo"
                                  }
                                }
                                ]);
                                respresult.exec(function (err, result) {
                                  if (err) {
                                    response.status(500).send({
                                      error: err
                                    })
                                    return next(err);
                                  } else {
                                    var resource = result[0];

                                    var invoice = resource.invoice;
                                    var to = resource.to;
                                    var rtruid = resource.rTruID;
                                    var status = resource.status;
                                    var address = resource.address;
                                    var fname = resource.fName;
                                    var lname = resource.lName;
                                    var type = resource.type;
                                    var crnno = resource.CRNNo;
                                    var amtruid;

                                    if (resource.particularsG24.from != "0" && resource.particularsG24.from != undefined) {
                                      amtruid = resource.particularsG24.from;
                                    }
                                    else if (resource.particularsS99.from != "0" && resource.particularsS99.from != undefined) {
                                      amtruid = resource.particularsS99.from;
                                    }
                                    //remmitcharges
                                    var remit = resource.remmitCharges.toJSON().$numberDecimal;

                                    //totalAmount
                                    var tav = resource.totalAmount.toJSON().$numberDecimal;
                                    var createDate = resource.createDate;

                                    var emailVerified = resource.emailVerified;

                                    var Final = ({
                                      "invoice": invoice,
                                      "to": to,
                                      "rTruID": rtruid,
                                      "status": status,
                                      address: address,
                                      fName: fname,
                                      lName: lname,
                                      remmitCharges: remit,
                                      totalAmount: tav,
                                      type: type,
                                      MOP: mop,
                                      createDate: createDate,
                                      applicableTAX: (Gen.tax * 100).toString(),
                                      particularsG24: particularsArr(resource.particularsG24),
                                      particularsS99: particularsArr(resource.particularsS99)
                                    });
                                    if (status === "success") {
                                      if (mop === "others") {
                                        request.post({
                                          "headers": { "content-type": "application/json" },
                                          "url": reqip + ":4121/api/pgdetailsconsumertxn",
                                          "body": JSON.stringify({
                                            "invoice": invoice,
                                            "pgtype": pgtype
                                          })
                                        }, (error, response, pgdetails) => {
                                          var pgdetails = JSON.parse(pgdetails);
                                          var temppayby = pgdetails.payBy;

                                          Final.bankTXNID = pgdetails.bankTXNID;
                                          Final.payBy = (temppayby == "NB") ? "Net Banking" : (temppayby == "CC") ? "Credit Card" : (temppayby == "DC") ? "Debit Card" : (temppayby == "UP") ? "UPI" : temppayby;;
                                          Final.paymentCharge = pgdetails.paymentCharge;
                                          updatestocksendmail()
                                        })
                                      } else {
                                        updatestocksendmail()
                                      }
                                    }
                                    function updatestocksendmail() {
                                      var mailtype = emailVerified == true ? "both" : "sms";
                                      // MAIL.entityConsumerMailTXN(Final, email, mobile, mailtype);
                                      var q24v = Final.particularsG24.qty,
                                        q99v = Final.particularsS99.qty;

                                      if (!isNaN(q24v) && parseFloat(q24v) > 0) {
                                        calculate.update_assetmanager_stock(Final.particularsG24.from, to, "G24K", q24v, "buy", invoice);
                                      }
                                      if (!isNaN(q99v) && parseFloat(q99v) > 0) {
                                        calculate.update_assetmanager_stock(Final.particularsS99.from, to, "S99P", q99v, "buy", invoice);
                                      }

                                      initiateEntityRevenueRefund(rtruid, invoice);
                                      calculate.update_stock(to, q24v, q22v, q18v, q99v, "buy", invoice);
                                      notification(to, Final.particularsG24.from, Final.particularsS99.from, crnno, invoice, q24v, q22v, q18v, q99v, "buy", tav);

                                    }

                                    res.json({ status: "200", resource: Final });

                                  }
                                });
                              };
                            } else if (validationstatus == "24") {
                              res.json({
                                status: "24",
                                message: "transaction terminated please select lesser quantity of G24K"
                              })
                            } else if (validationstatus == "99") {
                              res.json({
                                status: "99",
                                message: "transaction terminated please select lesser quantity of S99P"
                              });
                            } else if (validationstatus == "2499") {
                              res.json({
                                status: "2499",
                                message: "transaction terminated please select lesser quantity of G24K & S99P"
                              });
                            } else {
                              res.json({
                                status: "401",
                                message: "you have choosen wrong assetmanager"
                              })
                            }
                          }
                        })
                      }
                    } else {
                      res.json({ status: "204", message: respvalpaymodes })
                    }
                  }
                } else {
                  res.json({ status: "500", message: "Internal server error..!!" })
                }
              }
            })
          }
        })
      }
    }
  })
}

exports.remmit_redeem_bullions_cash = function (req, res) {
  let Gen = req.generalCharges;
  var s24 = parseFloat(req.body.g24qty);
  var s99 = parseFloat(req.body.s99qty);

  var fromtru24 = req.body.fromtruid24;
  var fromtru99 = req.body.fromtruid99;

  var totruid = req.body.totruid;
  var rtruid = req.body.rtruid;
  var benTrnremark = "Entity Redeem Cash Transaction";
  var ctruid;

  if (req.body.transactiontype != "redeemCash") {
    res.json({ status: "204", message: "The transaction type must be 'REDEEM BY CASH'" })
  }
  else {
    if (s24 == "0" && s99 == "0") { res.json({ status: "204", message: "No Quantity Selected" }) }

    else if (s24 != "0" || s22 != "0" || s18 != "0" || s99 != "0") {
      KycAll.find({
        "truID": totruid, KYCFlag: "active"
      }, function (err, docs) {
        if (!docs.length) {
          res.json({
            status: "204",
            message: "The request was successful but no body was returned."
          });
        } else {

          ///////////////////////////////assetstoreDetails////////////////////////////////////////
          if (fromtru24 != "0" || fromtru24 === undefined) {
            ctruid = fromtru24;
          }
          else if (fromtru99 != "0" || fromtru99 === undefined) {
            ctruid = fromtru99;
          }
          request.post({
            "headers": { "content-type": "application/json" },
            "url": reqip + ":4125/api/showconsumerconfigurations",
            "body": JSON.stringify({ "kycflag": "KYC", "appliedOn": "entity", "truid": rtruid })
          }, async (err, response, body) => {
            if (err || !body) {
              res.json({ status: "204", message: "Please reset your configurations." });
            } else {
              var configbody = JSON.parse(body);
              if (configbody.status === "204") {
                res.json({ status: "204", message: "Please check your configurations." });
              } else {
                let accessarray = ["disable", "hide"];

                var walletaccess = req.ConsumerConf.resource.module.walletAccess;
                var redeemToBank = req.ConsumerConf.resource.module.redeemToBank;
                // var walletaccess = "parent";
                var paymentmodeaccess = req.ConsumerConf.resource.module.payByWallet;
                if (redeemToBank && accessarray.includes(redeemToBank) && req.body.mop === "others") {
                  res.json({
                    status: "204",
                    message: "Your payment mode are disabled. Please contact your Administrator."
                  });
                } else {
                  var respvalpaymodes = await validatePaymodes(req.body.mop, walletaccess, paymentmodeaccess);
                  if (respvalpaymodes === 200) {
                    stockvalidation();
                  } else {
                    res.json({ status: "204", message: respvalpaymodes })
                  }
                  function stockvalidation(err, numAffected) {
                    request.post({
                      "headers": {
                        "content-type": "application/json"
                      },
                      "url": reqip + ":4114/api/validatestock",
                      "body": JSON.stringify({
                        "totruid": totruid,
                        "g24": s24,
                        "s99": s99
                      })
                    }, async (error, response, body) => {
                      if (error) {
                        return console.dir(error);
                      } else {
                        var result = JSON.parse(body);
                        var validationstatus = result.status;
                        if (validationstatus == "200") {

                          var particularsG24 = {}, particularsS99 = {},
                            stockNA = new Array(),
                            qtyNA = new Array(),
                            inputNA = new Array(),
                            status = req.body.status,
                            totaladd = 0, remmitcharges = 0, totaltax = 0;

                          date = new Date(); // today's date and time in ISO format
                          function fromServer(Gen, amtruid, sqty, bulltype, arr) {
                            return new Promise((resolve, reject) => {
                              if (sqty !== 0 && sqty > 0) {
                                var particulsStockNA = {};
                                async function generateParticular(Gen, amtruid, bulltype, sqty) {
                                  var fcrgs = await calculate.redeemCash_calculation_remmit(Gen, amtruid, bulltype, sqty, req.body.totruid, rtruid);
                                  if (fcrgs.status === "200" || fcrgs.stockstatus === "resolve") {
                                    totaladd += fcrgs.total;
                                    totaltax += fcrgs.tax;
                                    remmitcharges += fcrgs.remmitCharges;
                                    resolve(Object.assign(arr, particularsArr(fcrgs)));
                                  } else {
                                    // particulsStockNA = sqty;
                                    particulsStockNA["bullionType"] = bulltype;
                                    resolve(stockNA.push(particulsStockNA));
                                  }
                                }
                                generateParticular(Gen, amtruid, bulltype, sqty);

                              } else {
                                resolve(Object.assign(arr, particularsArr()));
                              }
                            })
                          }

                          if (s24 !== 0 && s24 > 0) {
                            await fromServer(Gen, fromtru24, s24, "G24K", particularsG24);
                          } else {
                            particularsG24 = particularsArr();
                          }


                          if (s99 !== 0 && s99 > 0) {
                            await fromServer(Gen, fromtru99, s99, "S99P", particularsS99);
                          } else {
                            particularsS99 = particularsArr();
                          }

                          if (inputNA.length) {
                            res.json({ status: "204", message: "Invalid input.", inputNA: inputNA })
                          } else if (qtyNA.length) {
                            res.json({ status: "204", message: "Please select Quantity between 0.1 && 100 each bullion.", qtyNA: qtyNA })
                          } else if (stockNA.length) {
                            res.json({ status: "204", message: "Stock not available.", stockNA: stockNA })
                          } else if (status != "failure" && status != "success") {
                            res.json({ status: "204", message: "The Transaction Must Either Be In  'Success'  or 'Failure' Status." });
                          } else if (status == "failure") {
                            var totruid = req.body.totruid;
                            var date = new Date(); // today's date and time in ISO format
                            var invoiceno = Date.parse(date);
                            // var invoice = invoiceno.toString();
                            var randomstr = randomize('0', 3);
                            var randomstr1 = randomize('0', 3);
                            var randomstr2 = randomize('0', 4);
                            var invoice = (invoiceno + parseInt(randomstr)).toString() + randomstr1 + randomstr2;
                            var type = req.body.transactiontype;
                            var mop = "other";

                            ConsumerConfig.checkWalletLimit(totruid, totaladd, function (limitcb) {
                              if (limitcb === "200") {

                                var md5hash = invoice + totruid + rtruid + "success" + req.body.transactiontype;
                                var clientTXN = new TXN({
                                  to: totruid, invoice: invoice, type: type, sourceFlag: "remmit", rTruID: rtruid,
                                  totalTax: totaltax,
                                  particularsG24: particularsG24,
                                  particularsS99: particularsS99,
                                  tdsPercentage: particularsG24.tdsPercentage > 0 ? particularsG24.tdsPercentage : particularsS99.tdsPercentage,
                                  loadingPercentage: particularsG24.loadingPercentage > 0 ? particularsG24.loadingPercentage : particularsS99.loadingPercentage,
                                  remmitCharges: remmitcharges,
                                  totalAmount: totaladd,
                                  createDate: date,
                                  status: status,
                                  MOP: mop,
                                  md5sign: md5(md5hash),
                                  remmitCharges: remmitcharges
                                });
                                clientTXN.save(function (err) {
                                  if (err) {
                                    res.json({ status: "500", message: "Internal server error" });
                                  } else {
                                    rescallback(invoice);
                                  }
                                })
                              } else if (limitcb === "500") {
                                res.json({ status: "204", message: "You have exceeded your wallet limit! Please verify your KYC for unlimited access." });
                              } else {
                                res.json({ status: "204", message: "Something went wrong, Please try again!" });
                              }
                            })
                          }
                          if (status == "success") {
                            var totruid = req.body.totruid;
                            var mop = req.body.mop;
                            var modeofpay = req.body.ModeOfPay;
                            var transID;

                            var date = new Date(); // today's date and time in ISO format
                            var invoiceno = Date.parse(date);
                            var invoice = req.body.invoice;
                            var type = req.body.transactiontype;

                            if (invoice != undefined) {
                              var md5hash = invoice + totruid + req.body.rtruid + req.body.status + req.body.transactiontype;
                              TXN.find({
                                "invoice": invoice, "to": totruid,
                                "md5sign": md5(md5hash), "status": "failure"
                              }, function (err, docs) {
                                if (!docs.length) {
                                  res.json({
                                    status: "204",
                                    message: "Please Enter Correct invoice number."
                                  });
                                } else {
                                  var totaladd = parseFloat(docs[0].totalAmount.toJSON().$numberDecimal);
                                  ConsumerConfig.checkWalletLimit(totruid, totaladd, async function (limitcb) {
                                    if (limitcb === "200") {
                                      var status = "success";
                                      var tocrypt = {
                                        to: totruid,
                                        invoice: invoice,
                                        type: type,
                                        rTruID: rtruid,
                                        sourceFlag: "remmit",
                                        totalTax: totaltax,
                                        particularsG24: particularsG24,


                                        particularsS99: particularsS99,
                                        tdsPercentage: particularsG24.tdsPercentage > 0 ? particularsG24.tdsPercentage : particularsS99.tdsPercentage,
                                        loadingPercentage: particularsG24.loadingPercentage > 0 ? particularsG24.loadingPercentage : particularsS99.loadingPercentage,
                                        remmitCharges: remmitcharges,
                                        totalAmount: totaladd,
                                        createDate: date,
                                        status: status,
                                        MOP: mop
                                      };
                                      var rational = JSON.stringify(tocrypt);
                                      encrypt(rational);

                                      function encrypt(rational) {
                                        var crypted = encryption(rational);
                                        //decrypt(crypted);
                                        //return crypted;
                                        //    }

                                        // function decrypt(crypted){
                                        //   var decipher = crypto.createDecipher(algorithm,password)
                                        //   var dec = decipher.update(crypted,'hex','utf8')
                                        //   dec += decipher.final('utf8');
                                        //   return dec;
                                        // }


                                        if (mop != "truWallet" && mop != "others") {
                                          res.json({
                                            status: "204",
                                            message: "Please provide valid method of payment."
                                          });
                                        }

                                        else if (mop === "truWallet") {

                                          TXN.updateOne({
                                            "invoice": invoice
                                          }, {
                                            $set: {
                                              to: totruid,
                                              invoice: invoice,
                                              type: type,
                                              rTruID: rtruid,
                                              sourceFlag: "remmit", hash: crypted,
                                              particularsG24,


                                              particularsS99: particularsS99,
                                              tdsPercentage: particularsG24.tdsPercentage > 0 ? particularsG24.tdsPercentage : particularsS99.tdsPercentage,
                                              loadingPercentage: particularsG24.loadingPercentage > 0 ? particularsG24.loadingPercentage : particularsS99.loadingPercentage,
                                              remmitCharges: remmitcharges,
                                              totalAmount: totaladd,
                                              createDate: date,
                                              status: status,
                                              MOP: mop
                                            }
                                          }, function (err) {
                                            if (err) {
                                              res.json({ status: "500", message: "Internal server error" });
                                            } else {
                                              rescallback(invoice);
                                            }
                                          });
                                        }
                                        else if (mop === "others") {
                                          var accountno = req.body.accountno;
                                          transID = uniqueNumber().toString();
                                          var mopbankupiquery;
                                          if (modeofpay == "NEFT" || modeofpay == "IMPS") {
                                            mopbankupiquery = Accounts.aggregate([{ $match: { truID: totruid } },
                                            { $project: { _id: 0, accountdetails: "$bankAccounts", truID: 1 } },
                                            { $unwind: { path: "$accountdetails", preserveNullAndEmptyArrays: true } },
                                            { $match: { "accountdetails.accountId": accountno, "accountdetails.status": "active" } },
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
                                            ])
                                          } else if (modeofpay == "UPI") {
                                            mopbankupiquery = Mop.aggregate([{ $match: { truID: totruid } },
                                            { $project: { _id: 0, upiDetails: "$MOP.upiDetails", truID: 1 } },
                                            { $unwind: { path: "$upiDetails", preserveNullAndEmptyArrays: true } },
                                            { $match: { "upiDetails.upiaddress": accountno, "upiDetails.status": "active" } },
                                            { $project: { "accountdetails": "$upiDetails", truID: 1 } },
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
                                            ])
                                          }
                                          mopbankupiquery.exec(function (err, accdocs) {
                                            if (!accdocs.length) {
                                              res.json({ status: 204, message: "Please Link your Account or UPI..!!" })
                                            } else {
                                              if (accdocs[0].accountdetails) {
                                                var qty24 = particularsG24.qty,
                                                  qty99 = particularsS99.qty;
                                                // console.log("stock ", qty24, qty22, qty18, qty99)
                                                var totaladd = parseFloat(docs[0].totalAmount.toJSON().$numberDecimal);
                                                if (modeofpay == "NEFT" || modeofpay == "IMPS") {
                                                  calculate.update_stock(totruid, qty24, qty22, qty18, qty99, "redeemCash", invoice);
                                                  bankApi.bank_single_payment_api(transID, totaladd, totruid, benTrnremark, modeofpay, invoice, "redeemCash", accdocs[0].accountdetails, accdocs[0].mobile, accdocs[0].crnno, docs[0], function (err, resback) {
                                                  });
                                                  TXN.updateOne({
                                                    "invoice": invoice
                                                  }, {
                                                    $set: {
                                                      to: totruid,
                                                      invoice: invoice,
                                                      type: type,
                                                      rTruID: rtruid,
                                                      sourceFlag: "remmit", hash: crypted,
                                                      particularsG24: particularsG24,


                                                      particularsS99: particularsS99,
                                                      tdsPercentage: particularsG24.tdsPercentage > 0 ? particularsG24.tdsPercentage : particularsS99.tdsPercentage,
                                                      loadingPercentage: particularsG24.loadingPercentage > 0 ? particularsG24.loadingPercentage : particularsS99.loadingPercentage,
                                                      remmitCharges: remmitcharges,
                                                      totalAmount: totaladd,
                                                      createDate: date,
                                                      status: "inprocess",
                                                      ModeOfPay: modeofpay,
                                                      MOP: mop
                                                    }
                                                  }, function (err) {
                                                    if (err) {
                                                      res.json({ status: "500", message: "Internal server error" });
                                                    } else {
                                                      rescallback(invoice);
                                                    }
                                                  })
                                                }
                                              }
                                              else {
                                                res.json({ status: 204, message: "Please Set your default account..!!" })
                                              }
                                            }
                                          });
                                        }
                                      }
                                    } else if (limitcb === "500") {
                                      res.json({ status: "204", message: "You have exceeded your wallet limit! Please verify your KYC for unlimited access." });
                                    } else {
                                      res.json({ status: "204", message: "Something went wrong, Please try again!" });
                                    }

                                  })
                                }
                              })
                            }
                            else {
                              res.json({
                                status: "204",
                                message: "Please Enter invoice number."
                              });
                            }
                          }

                          function rescallback(invoice) {
                            if (err) {
                              res.send(err);
                              console.log(err);
                            }
                            var respresult = TXN.aggregate([{
                              $match: {
                                "invoice": invoice
                              }
                            },
                            {
                              $project: {
                                invoice: 1, to: 1, from: 1, rTruID: 1, _id: 0, particularsG24: 1,
                                particularsS99: 1, otherCharges: 1, remmitCharges: 1, totalAmount: 1,
                                status: 1, type: 1, MOP: 1, ModeOfPay: 1, createDate: 1
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
                            {
                              $unwind: "$cust"
                            },
                            {
                              $project: {
                                invoice: 1, to: 1, from: 1, rTruID: 1, _id: 0, particularsG24: 1,
                                particularsS99: 1, otherCharges: 1, remmitCharges: 1, totalAmount: 1,
                                status: 1, type: 1, MOP: 1, ModeOfPay: 1, createDate: 1, gender: "$cust.genderc",
                                address: "$cust.permanentAddress", fName: "$cust.fName", lName: "$cust.lName", CRNNo: "$cust.CRNNo",
                                mobile: "$cust.mobile", email: "$cust.email", emailVerified: "$cust.emailVerified",
                              }
                            }
                            ]);
                            respresult.exec(function (err, result) {
                              if (err) {
                                response.status(500).send({
                                  error: err
                                })
                                return next(err);
                              } else {
                                var resource = result[0];

                                var invoice = resource.invoice;
                                var to = resource.to;
                                var rtruid = resource.rTruID;
                                var status = resource.status;
                                var address = resource.address;
                                var fname = resource.fName;
                                var lname = resource.lName;
                                var type = resource.type;
                                var mop = resource.MOP;
                                var createDate = resource.createDate;
                                var crnno = resource.CRNNo;
                                var amtruid;

                                var q24v = resource.particularsG24.qty.toJSON().$numberDecimal;
                                var q99v = resource.particularsS99.qty.toJSON().$numberDecimal;
                                if (resource.particularsG24.from != "0" && resource.particularsG24.from != undefined) {
                                  amtruid = resource.particularsG24.from;
                                }
                                else if (resource.particularsS99.from != "0" && resource.particularsS99.from != undefined) {
                                  amtruid = resource.particularsS99.from;
                                }
                                //remmitcharges
                                var remit = resource.remmitCharges.toJSON().$numberDecimal;

                                //totalAmount
                                var tav = resource.totalAmount.toJSON().$numberDecimal;

                                var mobile = resource.mobile;

                                var Final = ({
                                  "invoice": invoice,
                                  "to": to,
                                  "rTruID": rtruid,
                                  "status": status,
                                  address: address,
                                  fName: fname,
                                  lName: lname,
                                  remmitCharges: remit,
                                  totalAmount: tav,
                                  type: type,
                                  MOP: mop,
                                  transID: transID,
                                  "custMobile": mobile,
                                  "ModeOfPay": modeofpay,
                                  createDate: createDate,
                                  applicableTAX: (Gen.sellTax * 100).toString(),
                                  "particularsG24": particularsArr(resource.particularsG24),
                                  "particularsS99": particularsArr(resource.particularsS99)
                                });
                                if (status === "success") {
                                  if (mop == "truWallet") {
                                    if (!isNaN(q24v) && parseFloat(q24v) > 0) {
                                      calculate.update_assetmanager_stock(resource.particularsG24.from, to, "G24K", q24v, "redeemCash", invoice);
                                    }
                                    if (!isNaN(q99v) && parseFloat(q99v) > 0) {
                                      calculate.update_assetmanager_stock(resource.particularsS99.from, to, "S99P", q99v, "redeemCash", invoice);
                                    }
                                    calculate.update_wallet(totruid, invoice, tav, "redeemCash");
                                    MAIL.consumer_emailtxnNew(totruid, invoice);
                                    initiateEntityRevenueRefund(rtruid, invoice);
                                  }
                                  calculate.update_stock(to, q24v, q22v, q18v, q99v, "redeemCash", invoice);
                                }
                                res.json({ status: "200", resource: Final });




                              }
                            });
                          };
                        } else if (validationstatus == "24") {
                          res.json({
                            status: "24",
                            message: "transaction terminated please select lesser quantity of G24K"
                          });
                        } else if (validationstatus == "99") {
                          res.json({
                            status: "99",
                            message: "transaction terminated please select lesser quantity of S99P"
                          });
                        } else if (validationstatus == "2499") {
                          res.json({
                            status: "2499",
                            message: "transaction terminated please select lesser quantity of G24K & S99P"
                          });
                        } else {
                          res.json({
                            status: "401",
                            message: "you have choosen wrong assetmanager"
                          });
                        }
                      }
                    })
                  }
                }
              }
            }
          })
        }
      })

    }
  }
}

exports.remmit_transfer_bullions = function (req, res) {
  let Gen = req.generalCharges;
  var s24 = parseFloat(req.body.g24qty),
    s99 = parseFloat(req.body.s99qty),
    fromtruid = req.body.fromtruid,
    // revenuePer = req.body.revenueper == 0 ? Gen.entityRevCharges : req.body.revenueper,
    totruid = req.body.totruid,
    rtruid = req.body.rtruid;

  if (req.body.transactiontype != "transfer") {
    res.json({ status: "204", message: "The transaction type must be 'TRANSFER'" })
  }
  else {
    if (s24 == "0" && s22 == "0" && s18 == "0" && s99 == "0") { res.json({ status: "204", message: "No Quantity Selected" }) }

    else if (s24 != "0" || s22 != "0" || s18 != "0" || s99 != "0") {
      KycAll.find({ truID: totruid, KYCFlag: "active" },
        function (err, docs) {
          if (!docs || docs.length != 1) {
            res.json({
              status: "204",
              message: 'The request was successful but no TruID was returned.'
            });
          }
          else {
            var crnNo = docs[0].CRNNo;
            var countrycode = docs[0].countryCode;
            request.post({
              "headers": { "content-type": "application/json" },
              "url": reqip + ":4125/api/showconsumerconfigurations",
              "body": JSON.stringify({ "kycflag": "KYC", "appliedOn": "entity", "truid": rtruid })
            }, async (err, response, body) => {
              if (err || !body) {
                res.json({ status: "204", message: "Please reset your configurations." });
              } else {
                var configbody = JSON.parse(body);
                if (configbody.status === "204") {
                  res.json({ status: "204", message: "Please check your configurations." });
                } else {


                  var walletaccess = configbody.resource.moduleSelf.walletAccess;
                  // var walletaccess = "parent";
                  var paymentmodeaccess = configbody.resource.moduleSelf.payByWallet;


                  var respvalpaymodes = await validatePaymodes(req.body.mop, walletaccess, paymentmodeaccess);
                  if (respvalpaymodes === 200) {
                    ///////////////////////////////assetstoreDetails////////////////////////////////////////
                    if (fromtruid != "0" || fromtruid === undefined) {
                      KycAll.find({
                        "truID": fromtruid
                      }, function (err, docs) {
                        if (!docs.length) {
                          res.json({
                            status: "204",
                            message: "The request was successful but no body was returned."
                          });
                        } else {
                          var crnNo = docs[0].CRNNo;
                          var countrycode = docs[0].countryCode;
                          var ctruid = docs[0].currentassetstore;
                          var referenceTruID = docs[0].refernceTruID;

                          stockvalidation();
                          function stockvalidation() {
                            request.post({
                              "headers": {
                                "content-type": "application/json"
                              },
                              "url": reqip + ":4114/api/validatestock",
                              "body": JSON.stringify({
                                "totruid": fromtruid,
                                "g24": s24,
                                "s99": s99
                              })
                            }, async (error, response, body) => {
                              if (error) {
                                return console.dir(error);
                              } else {
                                var result = JSON.parse(body);
                                var validationstatus = result.status;
                                if (validationstatus == "200") {
                                  let particularsG24 = {},
                                    particularsS99 = {},
                                    stockNA = new Array(),
                                    qtyNA = new Array(),
                                    inputNA = new Array(),
                                    totaladd = 0, remmitcharges = 0, totaltax = 0,
                                    date = new Date(); // today's date and time in ISO format
                                  function fromServer(fromtruid, fromname, countrycode, sqty, bulltype, arr, etruid) {
                                    return new Promise((resolve, reject) => {
                                      if (sqty !== 0 && sqty > 0) {
                                        var particulsStockNA = {};
                                        async function generateParticular() {
                                          if (etruid !== "Company" && etruid.substring(0, 4) === "8000") {
                                            var fcrgs = await calculate.transfer_calculation_remmit(Gen, countrycode, bulltype, sqty, etruid);
                                          } else {
                                            // var fcrgs = await calculate.Buy_calculation_consumer(Gen, amtruid, bulltype, sqty);
                                            var fcrgs = await calculate.transfer_calculation_consumer(Gen, countrycode, bulltype, sqty);
                                          }
                                          if (fcrgs.status === "200" && fcrgs.stockstatus === "resolve") {
                                            totaladd += fcrgs.total;
                                            totaltax += fcrgs.tax;
                                            resolve(Object.assign(arr, particularsArr(fcrgs)));
                                          } else {
                                            particulsStockNA = sqty;
                                            particulsStockNA["bullionType"] = bulltype;
                                            resolve(stockNA.push(particulsStockNA));
                                          }
                                        }
                                        generateParticular();

                                      } else {
                                        resolve(Object.assign(arr, particularsArr()));
                                      }
                                    })
                                  }

                                  if (s24 !== 0 && s24 > 0) {
                                    await fromServer(req.body.fromtruid, req.body.fromname, countrycode, s24, "G24K", particularsG24, referenceTruID);
                                  } else {
                                    particularsG24 = particularsArr({ from: req.body.fromtruid, assetmanagerName: req.body.fromname });
                                  }

                                  if (s99 !== 0 && s99 > 0) {
                                    await fromServer(req.body.fromtruid, req.body.fromname, countrycode, s99, "S99P", particularsS99, referenceTruID);
                                  } else {
                                    particularsS99 = particularsArr({ from: req.body.fromtruid, assetmanagerName: req.body.fromname });
                                  }


                                  var status = req.body.status;
                                  if (status != "failure" && status != "success") {
                                    res.json({
                                      status: "204",
                                      message: "The Transaction Must Either Be In  'Success'  or 'Failure' Status."
                                    });
                                  }

                                  if (status == "failure") {
                                    var invoiceno = Date.parse(date);
                                    var type = req.body.transactiontype;
                                    invoice = createInvoice();
                                    mop = "other";


                                    var md5hash = invoice + req.body.fromtruid + "success" + req.body.transactiontype;
                                    var insTxn = {
                                      to: req.body.fromtruid,
                                      receiverTruID: req.body.totruid,
                                      rTruID: rtruid,
                                      invoice: invoice, type: type, sourceFlag: "remmit",
                                      particularsG24: particularsG24,


                                      particularsS99: particularsS99,
                                      tdsPercentage: particularsG24.tdsPercentage > 0 ? particularsG24.tdsPercentage : particularsS99.tdsPercentage,
                                      loadingPercentage: particularsG24.loadingPercentage > 0 ? particularsG24.loadingPercentage : particularsS99.loadingPercentage,
                                      remmitCharges: remmitcharges,
                                      totalAmount: totaladd,
                                      createDate: date,
                                      status: status,
                                      MOP: mop,
                                      md5sign: md5(md5hash)
                                    }
                                    var insertTXN = new TXN(insTxn);
                                    insertTXN.save(function (err) {
                                      if (err) {
                                        res.json({ status: "500", message: "Internal server error" });
                                      } else {
                                        rescallback(invoice);
                                      }
                                    })
                                  }

                                  if (status == "success") {
                                    var totruid = req.body.totruid;
                                    var fromtruid = req.body.fromtruid;
                                    var fromname = req.body.fromname;
                                    var invoice = req.body.invoice;
                                    var type = req.body.transactiontype;
                                    var mop = req.body.mop;

                                    if (invoice != undefined) {
                                      var md5hash = invoice + fromtruid + req.body.status + req.body.transactiontype;
                                      console.log(md5hash)
                                      console.log(md5(md5hash))
                                      TXN.find({
                                        "invoice": invoice, "to": fromtruid,
                                        "md5sign": md5(md5hash), "status": "failure"

                                      }, async function (err, docs) {
                                        if (!docs.length) {
                                          res.json({
                                            status: "204",
                                            message: "Please Enter Correct invoice number."
                                          });
                                        } else {
                                          var tocrypt = {
                                            to: req.body.fromtruid,
                                            receiverTruID: req.body.totruid,
                                            rTruID: rtruid,
                                            invoice: invoice, type: type, sourceFlag: "remmit",
                                            particularsG24: particularsG24,


                                            particularsS99: particularsS99,
                                            tdsPercentage: particularsG24.tdsPercentage > 0 ? particularsG24.tdsPercentage : particularsS99.tdsPercentage,
                                            loadingPercentage: particularsG24.loadingPercentage > 0 ? particularsG24.loadingPercentage : particularsS99.loadingPercentage,
                                            remmitCharges: remmitcharges,
                                            totalAmount: totaladd,
                                            createDate: date,
                                            status: status,
                                            MOP: mop,
                                            md5sign: md5(md5hash)
                                          }
                                          var totalTfvl = 0;
                                          if (particularsG24.qty > 0) {
                                            totalTfvl += particularsG24.amount;
                                          } else if (particularsS99.qty > 0) {
                                            totalTfvl += particularsS99.amount;
                                          }
                                          encrypt(tocrypt);
                                          function encrypt(txnObj) {
                                            var crypted = encryption(rational);
                                            txnObj.hash = crypted;
                                            if (mop != "truWallet" && mop != "others" && mop != "offline" && mop != "stock") {
                                              res.json({
                                                status: "204",
                                                message: "Please provide valid method of payment."
                                              });
                                            } else if (mop === "truWallet") {
                                              if (walletaccess != "disable") {
                                                var wallettruid;
                                                var parentid = req.body.parentid;
                                                if (walletaccess === "allow") {
                                                  wallettruid = rtruid;
                                                }
                                                else if (walletaccess === "parent") {
                                                  wallettruid = parentid;
                                                }

                                                request.post({
                                                  "headers": {
                                                    "content-type": "application/json"
                                                  },
                                                  "url": reqip + ":4121/api/entitywalletupdatetxn",
                                                  "body": JSON.stringify({
                                                    "truid": wallettruid,
                                                    "totaladd": totaladd,
                                                    "invoice": invoice,
                                                    "tType": "transfer",
                                                    "g24qty": particularsG24.qty,
                                                    "s99qty": particularsS99.qty
                                                  })
                                                }, (error, response, body) => {
                                                  if (error) {
                                                    return console.log(error);
                                                  } else {
                                                    var otpresultstatus = JSON.parse(body).status;
                                                    if (otpresultstatus != "200") {
                                                      res.json({
                                                        status: "204",
                                                        message: "Insufficient wallet balance."
                                                      });

                                                    } else {
                                                      TXN.updateOne({
                                                        "invoice": invoice
                                                      }, {
                                                        $set: txnObj
                                                      }, function (err) {
                                                        if (err) {
                                                          res.send(err);
                                                        } else {
                                                          rescallback(invoice)
                                                        }
                                                      })
                                                    }
                                                  }
                                                })
                                              } else {
                                                res.json({
                                                  status: "204",
                                                  message: "Your Wallet is disabled. Please contact your Administrator."
                                                });
                                              }
                                            } else if (mop === "others") {
                                              if (req.body.astatus === "Ok" || req.body.astatus === "success_00") {
                                                TXN.findOneAndUpdate({
                                                  "invoice": invoice
                                                }, {
                                                  $set: txnObj
                                                }, { new: true }, function (err, txnresult) {
                                                  if (err) {
                                                    res.send(err);
                                                  } else {
                                                    rescallback(invoice)
                                                  }
                                                })
                                              } else {
                                                res.json({ status: "401", message: "Payment Failed" })
                                              }
                                            }
                                          }
                                        }
                                      })
                                    }
                                    else {
                                      res.json({ status: "204", message: "Please Enter invoice number." })
                                    }
                                  }

                                  async function rescallback(invoice) {
                                    let resource = await TXN.findOne({ invoice: invoice });
                                    let to = resource.to;
                                    let status = resource.status;
                                    let mop = resource.MOP;
                                    let type = resource.type;
                                    let createDate = resource.createDate;
                                    let referencetruid = resource.rTruID;
                                    var receiverDetails = await KycAll.findOne({ truID: resource.receiverTruID });
                                    let senderName = docs[0].fName + " " + docs[0].lName;
                                    let receiverName = receiverDetails.fName + " " + receiverDetails.lName;
                                    let receiverTruID = resource.receiverTruID;

                                    //totalAmount
                                    var tav = resource.totalAmount.toJSON().$numberDecimal;
                                    var pgtype = req.body.pgtype;
                                    var payby = "0", banktxnid = "0", paymentcharge = "0";
                                    if (mop === "others" && pgtype === "atom") {
                                      let pgdetail = await Atom.findOne({ invoice: invoice });
                                      var temppayby = pgdetail.MOP;
                                      payby = (temppayby == "NB") ? "Net Banking" : (temppayby == "CC") ? "Credit Card" : (temppayby == "DC") ? "Debit Card" : (temppayby == "UP") ? "UPI" : temppayby;
                                      banktxnid = pgdetail.bankTxnID;
                                      paymentcharge = pgdetail.surcharge.toJSON().$numberDecimal;
                                    }

                                    var Final = ({
                                      "invoice": invoice, "to": to, "status": status, MOP: mop,
                                      totalAmount: tav, "createDate": createDate, type: type,
                                      applicableTAX: (Gen.gstOnTransferFee * 100).toString(), totalTax: totaltax.toString(),
                                      "particularsG24": particularsArr(resource.particularsG24),
                                      "particularsS99": particularsArr(resource.particularsS99),
                                      "name": senderName,
                                      "receiverName": receiverName,
                                      "receiverTruID": receiverTruID,
                                      "PGType": pgtype,
                                      "payBy": payby,
                                      "bankTXNID": banktxnid,
                                      "paymentCharge": paymentcharge
                                    });
                                    res.json({ status: "200", resource: Final });

                                    if (resource.status == "success") {
                                      var q24v = resource.particularsG24.qty.toJSON().$numberDecimal;
                                      var q99v = resource.particularsS99.qty.toJSON().$numberDecimal;
                                      if (mop === "truWallet") {
                                        calculate.update_wallet(to, invoice, parseFloat(tav), "transfer");
                                      }
                                      if (mop === "stock") {
                                        var q24vaschrg = resource.particularsG24.qtyAgainstTxnChgs.toJSON().$numberDecimal;
                                        var q99vaschrg = resource.particularsS99.qtyAgainstTxnChgs.toJSON().$numberDecimal;
                                        calculate.update_stock(to, (q24v + q24vaschrg), (q99v + q99vaschrg), "transferer", req.body.invoice);
                                      }
                                      if (mop !== "stock") {
                                        calculate.update_stock(to, q24v, q99v, "transferer", req.body.invoice);
                                      }
                                      calculate.update_stock(receiverTruID, q24v, q99v, "receiver", req.body.invoice);
                                      // calculate.update_stock(fromtru24, parseFloat(q24v) * -1, parseFloat(q22v) * -1, parseFloat(q18v) * -1, parseFloat(q99v) * -1);
                                      // calculate.update_stock(to, parseFloat(q24v), parseFloat(q22v), parseFloat(q18v), parseFloat(q99v));
                                      notification(receiverTruID, to, senderName, invoice, crnNo, decimalChopper(q24v, 2), decimalChopper(q99v, 2))

                                      MAIL.consumer_emailtxnNew(to, invoice, banktxnid);

                                      if (referencetruid && ((referencetruid !== "customer" && referencetruid !== "Company") || (referencetruid !== "customer" && referencetruid.substring(0, 4) === "8000"))) {
                                        initiateEntityRevenueRefund(referencetruid, invoice);
                                      }
                                    }

                                  };
                                } else if (validationstatus == "24") {
                                  res.json({
                                    status: "403",
                                    message: "Stock not available for TruGold."
                                  });
                                } else if (validationstatus == "99") {
                                  res.json({
                                    status: "403",
                                    message: "Stock not available for TruSilver."
                                  });
                                } else {
                                  res.json({
                                    status: "403",
                                    message: "Stock not available."
                                  })
                                }
                              }
                            })
                          }
                        }
                      })
                    }
                  } else {
                    res.json({ status: "204", message: respvalpaymodes })
                  }
                }
              }
            })
          }
        }
      )
    }
  }
}

function uniqueNumber() {
  var date = Date.now();

  if (date <= uniqueNumber.previous) {
    date = ++uniqueNumber.previous;
  } else {
    uniqueNumber.previous = date;
  }
  return date;
}

function particularsArr(particulars) {
  var resparticuls = {};
  resparticuls["TID"] = particulars ? particulars.TID ? particulars.TID : "0" : "0";
  resparticuls["from"] = particulars ? particulars.from ? particulars.from : "0" : "0";
  resparticuls["assetmanagerName"] = particulars ? particulars.assetmanagerName ? particulars.assetmanagerName : "0" : "0";
  resparticuls["qty"] = particulars ? particulars.qty ? particulars.qty.toJSON ? particulars.qty.toJSON().$numberDecimal : particulars.qty : "0" : "0";
  resparticuls["rate"] = particulars ? particulars.rate ? particulars.rate.toJSON ? particulars.rate.toJSON().$numberDecimal : particulars.rate : "0" : "0";

  resparticuls["grossRate"] = particulars ? particulars.grossRate ? particulars.grossRate.toJSON ? particulars.grossRate.toJSON().$numberDecimal : particulars.grossRate : "0" : "0";
  resparticuls["baseRate"] = particulars ? particulars.baseRate ? particulars.baseRate.toJSON ? particulars.baseRate.toJSON().$numberDecimal : particulars.baseRate : "0" : "0";
  resparticuls["grossamount"] = particulars ? particulars.grossamount ? particulars.grossamount.toJSON ? particulars.grossamount.toJSON().$numberDecimal : particulars.grossamount : "0" : "0";
  resparticuls["baseamount"] = particulars ? particulars.baseamount ? particulars.baseamount.toJSON ? particulars.baseamount.toJSON().$numberDecimal : particulars.baseamount : "0" : "0";
  resparticuls["grosspartnerCharges"] = particulars ? particulars.grosspartnerCharges ? particulars.grosspartnerCharges.toJSON ? particulars.grosspartnerCharges.toJSON().$numberDecimal : particulars.grosspartnerCharges : "0" : "0";
  resparticuls["tdsonpartnerCharges"] = particulars ? particulars.tdsonpartnerCharges ? particulars.tdsonpartnerCharges.toJSON ? particulars.tdsonpartnerCharges.toJSON().$numberDecimal : particulars.tdsonpartnerCharges : "0" : "0";
  resparticuls["grossnodeCharges"] = particulars ? particulars.grossnodeCharges ? particulars.grossnodeCharges.toJSON ? particulars.grossnodeCharges.toJSON().$numberDecimal : particulars.grossnodeCharges : "0" : "0";
  resparticuls["tdsonnodeCharges"] = particulars ? particulars.tdsonnodeCharges ? particulars.tdsonnodeCharges.toJSON ? particulars.tdsonnodeCharges.toJSON().$numberDecimal : particulars.tdsonnodeCharges : "0" : "0";

  resparticuls["amount"] = particulars ? particulars.amount ? particulars.amount.toJSON ? particulars.amount.toJSON().$numberDecimal : particulars.amount : "0" : "0";
  resparticuls["assetmanagersCharges"] = particulars ? particulars.assetmanagersCharges ? particulars.assetmanagersCharges.toJSON ? particulars.assetmanagersCharges.toJSON().$numberDecimal : particulars.assetmanagersCharges : "0" : "0";
  resparticuls["otherCharges"] = particulars ? particulars.otherCharges ? particulars.otherCharges.toJSON ? particulars.otherCharges.toJSON().$numberDecimal : particulars.otherCharges : "0" : "0";
  resparticuls["assetstoreCharges"] = particulars ? particulars.assetstoreCharges ? particulars.assetstoreCharges.toJSON ? particulars.assetstoreCharges.toJSON().$numberDecimal : particulars.assetstoreCharges : "0" : "0";
  resparticuls["transactionCharges"] = particulars ? particulars.transactionCharges ? particulars.transactionCharges.toJSON ? particulars.transactionCharges.toJSON().$numberDecimal : particulars.transactionCharges : "0" : "0";
  resparticuls["partnerCharges"] = particulars ? particulars.partnerCharges ? particulars.partnerCharges.toJSON ? particulars.partnerCharges.toJSON().$numberDecimal : particulars.partnerCharges : "0" : "0";
  resparticuls["nodeCharges"] = particulars ? particulars.nodeCharges ? particulars.nodeCharges.toJSON ? particulars.nodeCharges.toJSON().$numberDecimal : particulars.nodeCharges : "0" : "0";
  resparticuls["clientTransactionCharges"] = particulars ? particulars.clientTransactionCharges ? particulars.clientTransactionCharges.toJSON ? particulars.clientTransactionCharges.toJSON().$numberDecimal : particulars.clientTransactionCharges : "0" : "0";
  resparticuls["txnLoading"] = particulars ? particulars.txnLoading ? particulars.txnLoading.toJSON ? particulars.txnLoading.toJSON().$numberDecimal : particulars.txnLoading : "0" : "0";
  resparticuls["remmitCharges"] = particulars ? particulars.remmitCharges ? particulars.remmitCharges.toJSON ? particulars.remmitCharges.toJSON().$numberDecimal : particulars.remmitCharges : "0" : "0";
  resparticuls["transferFee"] = particulars ? particulars.transferFee ? particulars.transferFee.toJSON ? particulars.transferFee.toJSON().$numberDecimal : particulars.transferFee : undefined : "0";
  resparticuls["tax"] = particulars ? particulars.tax ? particulars.tax.toJSON ? particulars.tax.toJSON().$numberDecimal : particulars.tax : "0" : "0";
  resparticuls["total"] = particulars ? particulars.total ? particulars.total.toJSON ? particulars.total.toJSON().$numberDecimal : particulars.total : "0" : "0";
  return resparticuls;
}

function notification(totruid, fromtruid24, fromtruid99, crnNo, invoice, q24v, q99v, type, amount) {
  var dates = new Date().toLocaleString();
  if (q24v != 0) {
    var fromtruid = fromtruid24;
    var message = "transaction of receipt " + invoice + " is successful.";
    sendnotification(message, totruid, fromtruid, type, invoice, crnNo, amount);
  }

  else if (q99v != 0) {
    var fromtruid = fromtruid99;
    var message = "transaction of receipt " + invoice + " is successful.";
    sendnotification(message, totruid, fromtruid, type, invoice, crnNo, amount);
  }

  function sendnotification(text, to, from, bultype, inv, crnno, amt) {
    var title, msg;
    if (bultype === "buy") {
      msg = "Buy " + text;
      title = "Bullions Purchased";
    } else if (bultype === "redeemCash") {
      msg = "Sell " + text + "Amount of " + defaultConf.defaultCurrency + " " + decimalChopper(amt, 2) + " is credited in truWallet";
      title = "Sell Successful";
    }
    request.post({
      "headers": { "content-type": "application/json" },
      "url": reqip + ":4116/api/insnotification",
      "body": JSON.stringify({
        "notifyto": to,
        "triggeredbytruid": from,
        "notification": msg,
        "type": "customerTransaction",
        "subtype": bultype,
        "title": title,
        "referenceid": inv,
        "isflag": "consumer",
        "crnNo": crnno,
      })
    }, (error, response, body) => {

      if (error) {
        return console.dir(error);
      }
    })
  }
}

function notificationtransfer(totruid, fromtruid, fromname, invoice, crnNo, g24qty, s99qty) {
  var m24 = "", m22 = "", m18 = "", m99 = "", count = 0;
  if (g24qty > 0) {
    m24 = g24qty.toString() + " gm of 24K gold";
    count++;
  }
  if (s99qty > 0) {
    if (count > 0) {
      m99 = ", " + s99qty.toString() + " gm of 99% silver";

    } else {
      m99 = s99qty.toString() + " gm of 99% silver";
    }
  }

  request.post({
    "headers": { "content-type": "application/json" },
    "url": reqip + ":4116/api/insnotification",
    "body": JSON.stringify({
      "notifyto": totruid,
      "triggeredbytruid": fromtruid,
      "notification": fromname + " has transferred " + m24 + m99 + " in your Company account.",
      "type": "customerTransaction",
      "subtype": "transfer",
      "title": "Bullions Received.",
      "referenceid": invoice,
      "isflag": "consumer",
      "crnNo": crnNo
    })
  }, (error, response, body) => {

    if (error) {
      return console.dir(error);
    }
    var newjson = JSON.parse(body);
  }
  )
}

function decimalChopper(num, fixed) {
  var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?');
  return num.toString().match(re)[0];
}

