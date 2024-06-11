'use strict'

const KycAll = require('../models/remmitKYCAllModel'),
    Wallet = require('../models/remmitWalletModel'),
    WalletLog = require("../models/remmitWalletLogModel"),
    conf = require("../conf"),
    request = require('request');

var fs = require('fs'),
    path = require('path'),
    defaultConf = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../regionConf.json')));

function decimalChopper(num, fixed) {
    var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?');
    return num.toString().match(re)[0];
}
exports.entity_wallet_update_txn = function (req, res) {
    var minAverageBal = 0;
    var truid = req.body.truid;
    var totaladd = parseFloat(req.body.totaladd);
    KycAll.find({
        "truID": truid
    }, function (err, docs) {
        if (!docs.length) {
            res.json({
                status: "204",
                message: "The request was successful but no body was returned."
            });
        } else {
            if (req.body.tType === "redeemCash") {
                deductwalBal()
            } else {
                var condition = { $cond: [{ $lt: [{ $subtract: ["$clBal", "$balOnHold"] }, 0.000001] }, 0.00, { $subtract: ["$clBal", "$balOnHold"] }] };
                Wallet.aggregate([{
                    $match: {
                        truID: truid
                    }
                },
                {
                    $project: {
                        _id: 0,
                        clBal: {
                            $switch: {
                                branches: [{
                                    case: { $gte: ["$onHoldType", "date"] },
                                    "then":
                                    {
                                        $cond: {
                                            if: {
                                                $and: [{
                                                    $gte: ["$onHoldDate", new Date(Date.now())]
                                                }]
                                            },
                                            then: condition,
                                            else: "$clBal",
                                        }
                                    }
                                }, {
                                    case: { $gte: ["$onHoldType", "onhold"] },
                                    "then": condition
                                }],
                                default: "$clBal"
                            }

                        },

                    }
                },
                {
                    $project: {
                        _id: 0,
                        wstatus: {
                            $cond: {
                                if: {
                                    $and: [{
                                        $gte: [{ $toDecimal: "$clBal" }, { $toDecimal: totaladd }]
                                    }, {
                                        $gte: [{ $toDecimal: "$clBal" }, minAverageBal]
                                    }]
                                },
                                then: "200",
                                else: "400",
                            }
                        }
                    }
                }
                ]).exec(function (err, result) {
                    if (result[0].wstatus == 200) {
                        deductwalBal()
                    }
                    else {
                        res.json({ status: "204", message: "Transaction Failed because of insufficient Wallet Balance" });
                    }
                })
            }
            function deductwalBal() {
                var total = totaladd * (-1), ballog;
                switch (req.body.tType) {
                    case "buy":
                        total = useToFixed(parseFloat(totaladd) * -1);
                        ballog = { Dr: total };
                        break;
                    case "buyCash":
                        total = useToFixed(parseFloat(totaladd) * -1);
                        ballog = { Dr: total };
                        break;
                    case "redeemCash":
                        total = parseFloat(totaladd)
                        ballog = { Cr: total };
                        break;
                    case "transfer":
                        total = useToFixed(parseFloat(totaladd) * -1);
                        ballog = { Dr: total };
                        break;
                    case "gift":
                        total = useToFixed(parseFloat(totaladd) * -1);
                        ballog = { Dr: total };
                        break;

                }
                WalletLog.find({ invoice: req.body.invoice }, function (err, docs) {
                    if (!docs.length) {
                        Wallet.findOneAndUpdate({
                            truID: truid
                        }, {
                            $inc: {
                                "clBal": total
                            },
                            $set: ballog
                        }, {
                            upsert: true
                        }).exec(function (err, result) {
                            if (err) {
                                console.log(err)
                            } else {
                                update_wallet_log(truid, req.body.invoice, totaladd, req.body.tType)
                                res.json({ status: "200", message: "Wallet log generated Successfully.", amount: totaladd });


                            };
                        }
                        )
                    }
                    else {
                        res.json({ status: "204", message: 'This Invoice Already Exists' });
                    }
                });
            }
        }
    }
    )
}
function update_wallet_log(totruid, invoice, tav, type) {
    var total, ballog, txntype;
    switch (type) {
        case "buy":
            txntype = "purchase";
            total = useToFixed(parseFloat(tav) * -1)
            ballog = { Dr: total };
            break;
        case "buyCash":
            txntype = "purchase";
            total = useToFixed(parseFloat(tav) * -1)
            ballog = { Dr: total };
            break;
        case "redeemCash":
            txntype = "sell";
            total = parseFloat(tav)
            ballog = { Cr: total };
            break;
        case "transfer":
            txntype = "transfer";
            total = useToFixed(parseFloat(tav) * -1)
            ballog = { Dr: total };
            break;
        default:
    }

    var date = new Date();
    var walletlog = new WalletLog();
    var parmsg = "Amount of " + defaultConf.defaultCurrency + " " + Math.abs((ballog.Cr !== 0 && ballog.Cr) ? ballog.Cr : ballog.Dr) + " paid from wallet for bullion " + txntype;
    walletlog.truID = totruid;
    walletlog.Cr = ballog.Cr ? ballog.Cr : "0";
    walletlog.Dr = ballog.Dr ? ballog.Dr : "0";
    walletlog.invoice = invoice;
    walletlog.tType = type;
    walletlog.createDate = date;
    walletlog.particulars = parmsg;
    walletlog.status = "success"


    WalletLog.find({ invoice: invoice }, function (err, docs) {
        if (!docs.length) {
            walletlog.save(function (err) {
                if (err) {
                    console.log(err)
                    console.log({ status: "204", message: 'Fields with * required' });
                }
            });
        }
        else {
            console.log({ status: "204", message: 'This Invoice Already Exists' });
        }
    }
    )
}
exports.entity_Revenue_refund = function (req, res) {
    var truid = req.body.rtruid,
        agInvoice = req.body.invoice,
        partnercharges = req.body.partnercharges ? parseFloat(req.body.partnercharges) : 0,
        nodecharges = req.body.nodecharges ? parseFloat(req.body.nodecharges) : 0,
        tdsonpartnerCharges = req.body.tdsonpartnerCharges ? parseFloat(req.body.tdsonpartnerCharges) : 0,
        tdsonnodeCharges = req.body.tdsonnodeCharges ? parseFloat(req.body.tdsonnodeCharges) : 0;


    KycAll.aggregate([{ $match: { truID: truid } }, {
        $project: { _id: 0, isParent: 1, truID: 1, parentTruID: 1 }
    }]).exec(function (err, result) {
        if (err) {
            console.log("err", err);
            res.json({ status: "500", message: "Internal Server Error" });
        } else {
            if (result.length > 0) {
                var isparent = result[0].isParent;
                var parenttruid = result[0].parentTruID;

                async function data() {
                    if (isparent) {
                        if (partnercharges > 0) {
                            await transac(truid, partnercharges, tdsonpartnerCharges);
                            notification(truid, truid, agInvoice, partnercharges);
                        }
                    } else {
                        if (partnercharges > 0) {
                            await transac(parenttruid, partnercharges, tdsonpartnerCharges);
                            notification(parenttruid, truid, agInvoice, partnercharges);
                        }
                        if (nodecharges > 0) {
                            await transac(truid, nodecharges, tdsonnodeCharges);
                            notification(truid, truid, agInvoice, nodecharges);
                        }
                    }
                    res.json({ status: "200", message: "Commssion Credited..!!" });
                }
                data();

                function transac(truid, finalval, tdsAmt) {
                    return new Promise(resolve => {
                        Wallet.findOneAndUpdate({ truID: truid }, { $inc: { "clBal": finalval }, $set: { "Cr": finalval } },
                            { returnNewDocument: true }).exec(async function (err, dox) {
                                if (err) {
                                    console.log("e", err);
                                    resolve(false)
                                } else {
                                    var revinv = await walletLogforrev(finalval, "revenue", "You earned the rupees " + decimalChopper(finalval.toString(), 2) + " against the eReceipt of " + agInvoice, agInvoice);
                                    if (tdsAmt > 0) {
                                        walletLogforrev(tdsAmt, "tds", "TDS of ruppes " + decimalChopper(tdsAmt, 2) + " deducted against the eReceipt of " + revinv, revinv);
                                    }
                                    if (!revinv) {
                                        resolve(true)
                                    } else {
                                        resolve(false)
                                    }
                                    function walletLogforrev(val, type, msg, invs) {
                                        return new Promise(resolve => {
                                            let TDS_amt = val * -1;
                                            let date = Date.parse(new Date());
                                            let invoice = (date + Math.random()).toString().replace('.', '');
                                            const Wall = WalletLog();
                                            Wall.moneyAdded = true;
                                            Wall.truID = truid;
                                            Wall.Cr = (type === "revenue") ? val : 0;
                                            Wall.Dr = (type === "tds") ? TDS_amt : 0;
                                            Wall.invoice = invoice;
                                            Wall.againstInvoice = invs;
                                            Wall.tType = type;
                                            Wall.status = "success";
                                            Wall.particulars = msg;
                                            Wall.save(async function (err) {
                                                if (err) {
                                                    console.log("er", err);
                                                    resolve(false)
                                                } else {
                                                    if (type == "tds") {
                                                        await Wallet.updateOne({ truID: truid }, { $inc: { "clBal": TDS_amt }, $set: { "Dr": TDS_amt } })
                                                    }
                                                    resolve(invoice)
                                                }
                                            })
                                        })
                                    }
                                }
                            })
                    })

                }

                function notification(truid, triggeredtruid, agInvoice, amount) {
                    try {

                        KycAll.aggregate([{ $match: { truID: truid } }, {
                            $project: { _id: 0, isParent: 1, truID: 1, parentTruID: 1, CRNNo: 1 }
                        }]).exec(function (err, result) {
                            if (err) {
                                console.log("error in Entity notification", err);
                            }
                            else {
                                if (!result.length) {
                                    console.log("Entity not found in notification");
                                } else {
                                    var crnno = result[0].CRNNo;
                                    request.post({
                                        "headers": { "content-type": "application/json" },
                                        "url": conf.reqip + ":4116/api/insnotification",
                                        "body": JSON.stringify({
                                            "notifyto": truid,
                                            "isflag": "remmit",
                                            "crnNo": crnno,
                                            "triggeredbytruid": triggeredtruid,
                                            "notification": "You earned the rupees " + decimalChopper(amount, 2) + " against the eReceipt of " + agInvoice,
                                            "type": "revenue",
                                            "subtype": "revenueEarning",
                                            "title": "Earnings",
                                            "referenceid": truid
                                        })
                                    }, (error, response, body) => {

                                        if (error) {
                                            console.log(error)
                                            return console.dir(error);
                                        }
                                        var newjson = JSON.parse(body);
                                    }
                                    )
                                }
                            }

                        })
                    }
                    catch (ex) {

                    }
                }
            } else {
                res.json({ status: "204", message: "Partner not found..!!" });
            }


        }
    })

}

exports.checkpartner_Wallet_Txn = function (req, res) {
    var minAverageBal = 0;
    var truid = req.body.truid;
    var totaladd = parseFloat(req.body.totaladd);
    KycAll.find({
        "truID": truid
    }, function (err, docs) {
        if (!docs.length) {
            res.json({
                status: "204",
                message: "The request was successful but no body was returned."
            });
        }
        else {
            var condition = { $cond: [{ $lt: [{ $subtract: ["$clBal", "$balOnHold"] }, 0.000001] }, 0.00, { $subtract: ["$clBal", "$balOnHold"] }] };
            Wallet.aggregate([{
                $match: {
                    truID: truid
                }
            },
            {
                $project: {
                    _id: 0,
                    clBal: {
                        $switch: {
                            branches: [{
                                case: { $gte: ["$onHoldType", "date"] },
                                "then":
                                {
                                    $cond: {
                                        if: {
                                            $and: [{
                                                $gte: ["$onHoldDate", new Date(Date.now())]
                                            }]
                                        },
                                        then: condition,
                                        else: "$clBal",
                                    }
                                }
                            }, {
                                case: { $gte: ["$onHoldType", "onhold"] },
                                "then": condition
                            }],
                            default: "$clBal"
                        }

                    },

                }
            },
            {
                $project: {
                    _id: 0,
                    wstatus: {
                        $cond: {
                            if: {
                                $and: [{
                                    $gte: [{ $toDecimal: "$clBal" }, { $toDecimal: totaladd }]
                                }, {
                                    $gte: [{ $toDecimal: "$clBal" }, minAverageBal]
                                }]
                            },
                            then: "200",
                            else: "400",
                        }
                    }
                }
            }
            ]).exec(function (err, result) {
                if (result[0].wstatus == "200") {
                    res.status(200).json({ status: "200", message: "proceed" })
                }
                else {
                    res.status(200).json({ status: "411", message: "Please contact your administrator..!!" });
                }
            }
            )
        }
    }
    )
}
exports.client_Wallet_History = function (req, res) {
    let query,
      truid = req.body.truid,
      dateflag = req.body.flag;
  
    KycAll.find({ truID: truid }, function (err, docs) {
      if (!docs.length) {
        res.json({ status: "204", message: 'Invalid Client ID' });
      }
      else {
        if (dateflag == "date") {
          var startdate = new Date(Date.parse(req.body.startdate));
          var enddate = new Date(Date.parse(req.body.enddate) + (1000 * 3600 * 24));
          query = { $match: { truID: truid, createDate: { $gt: startdate, $lte: enddate } } };
        } else {
          query = { $match: { truID: truid } };
        }
        WalletLog.aggregate([query,
          { $project: { _id: 0, tType: 1, createDate: 1, Dr: 1, Cr: 1, invoice: 1, particulars: 1, status: 1, againstInvoice: { $ifNull: ["$againstInvoice", "$invoice"] } } },
          { $sort: { createDate: -1 } },
          {
            $lookup: {
              from: "atomlogs",
              localField: "againstInvoice",
              foreignField: "invoice",
              as: "atomlogs"
            }
          },
          {
            "$unwind": {
              "path": "$atomlogs",
              "preserveNullAndEmptyArrays": true
            }
          },
          { $project: { _id: 0, tType: 1, createDate: 1, Dr: 1, Cr: 1, invoice: 1, particulars: 1, status: 1, againstInvoice: 1, atomlogs: "$atomlogs" } },
  
        ]).exec(function (err, result) {
          if (!result.length || err) {
            res.json({ status: "411", message: 'No records found!' });
          } else {
            var resresult = new Array();
            async function txnSummary() {
              for (var i = 0; i < result.length; i++) {
                var resultdetail = result[i],
                  arrayresult = {}, ttype;
                ttype = resultdetail.tType;
                if (ttype == "addMoney" || ttype == "addFloat") {
                  arrayresult["createDate"] = resultdetail.createDate;
                  arrayresult["Dr"] = resultdetail.Dr.toJSON().$numberDecimal;
                  arrayresult["Cr"] = resultdetail.Cr.toJSON().$numberDecimal;
                  arrayresult["invoice"] = resultdetail.invoice;
                  arrayresult["tType"] = ttype;
                  arrayresult["status"] = resultdetail.status ? resultdetail.status : "success";
                  //arrayresult["particulars"] = "amount ";
                  resresult.push(arrayresult);
                }
                else if (ttype == "walletToBank") {
                  arrayresult["createDate"] = resultdetail.createDate;
                  arrayresult["Dr"] = resultdetail.Dr.toJSON().$numberDecimal;
                  arrayresult["Cr"] = resultdetail.Cr.toJSON().$numberDecimal;
                  arrayresult["invoice"] = resultdetail.invoice;
                  arrayresult["tType"] = ttype;
                  arrayresult["status"] = resultdetail.status ? resultdetail.status : "success";
                  // arrayresult["particulars"] = resultdetail.particulars;
                  resresult.push(arrayresult);
                }
                else {
                  arrayresult["createDate"] = resultdetail.createDate;
                  arrayresult["Dr"] = resultdetail.Dr.toJSON().$numberDecimal;
                  arrayresult["Cr"] = resultdetail.Cr.toJSON().$numberDecimal;
                  arrayresult["tType"] = ttype == "redeemCash" ? "sell" : ttype;
                  arrayresult["status"] = resultdetail.status ? resultdetail.status : "success";
                  // arrayresult["particulars"] = resultdetail.particulars;
                  arrayresult["invoice"] = resultdetail.againstInvoice ? resultdetail.againstInvoice : undefined;
  
                  resresult.push(arrayresult);
                }
              }
              res.json({ status: "1000", resource: resresult });
            }
            txnSummary();
  
          }
        }
        )
      }
    }
    )
  }