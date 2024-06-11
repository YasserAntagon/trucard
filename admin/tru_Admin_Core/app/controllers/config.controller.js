const CONFIG = require('../models/truRateModel/pgConfiguration'),
  CONFIGLOG = require('../models/truRateModel/custConfigurationsLogModel'),
  PERMISSION = require('../models/truRateModel/permission'),
  CUSTPERMISSION = require('../models/custModel/permission'),
  enKYC = require('../models/entityModel/remmitKYCAllModel'),
  ENPERMISSION = require('../models/entityModel/remmitpermission');
module.exports = {
  update_PG_access: function (req, res) {
    try {
      var kycflag = req.body.kycflag;
      var appliedOn = req.body.appliedOn;
      var pgobj = {
        "buy": req.body.buy,
        "redeemCash": req.body.redeemcash,
        
        "transfer": req.body.transfer,  
        "redeemToBank": req.body.redeemtobank
      };
      try {
        CONFIG.findOneAndUpdate({ KYCFlag: kycflag, appliedOn: appliedOn }, {
          $set: {
            appliedOn: appliedOn,
            KYCFlag: kycflag,
            module: pgobj,
            createDate: new Date()
          }
        }, { upsert: true },
          function (err) {
            if (err) {
              res.json({ status: "204", message: "Something went wrong!" })
            } else {
              var configlog = new CONFIGLOG();
              configlog.truID = req.body.truid;
              configlog.KYCFlag = req.body.kycflag;
              configlog.appliedOn = req.body.appliedOn;
              configlog.module.modifyDate = new Date();
              configlog.module = pgobj;
              configlog.save(function (err) {
                if (err) {
                  res.json({ status: "204", message: "Something went wrong!" })
                } else {
                  CONFIG.find({ KYCFlag: kycflag, appliedOn: req.body.appliedOn }).exec(function (err, result) {
                    if (err) {
                      res.json({ status: "204", message: "Something went wrong!" })
                    }
                    else {
                      res.json({ status: "200", module: result[0].module, KYCFlag: result[0].KYCFlag })
                    }
                  })
                }
              }
              )

            }
          })
      }
      catch (ex) {
        res.json({ status: "204", message: "Something went wrong!" })
      }
    }
    catch (ex) {
      res.json({ status: "204", message: "Something went wrong!" })
    }
  },

  update_buy_limit_consumer: function (req, res) {
    try {
      var kycflag = req.body.kycflag;
      var appliedOn = req.body.appliedOn;

      var buyobj = {
        "goldMax": req.body.goldmax,
        "goldMin": req.body.goldmin,
        "silverMax": req.body.silvermax,
        "silverMin": req.body.silvermin
      };
      try {
        CONFIG.findOneAndUpdate({ KYCFlag: kycflag, appliedOn: appliedOn }, { $set: { KYCFlag: kycflag, appliedOn: appliedOn, buy: buyobj } }, { upsert: true },
          function (err) {
            if (err) {
              res.json({ status: "204", message: "Something went wrong!" })
              // callback(ex, null);
            } else {
              var configlog = new CONFIGLOG();
              configlog.truID = req.body.truid;
              configlog.KYCFlag = req.body.kycflag;
              configlog.appliedOn = req.body.appliedOn;
              configlog.modifyDate = new Date();
              configlog.buy = buyobj;
              configlog.save(function (err) {
                if (err) {
                  // console.log(err);
                  res.json({ status: "204", message: "Something went wrong!" })
                } else {
                  CONFIG.find({ KYCFlag: kycflag }).exec(function (err, result) {
                    if (err) {
                      res.json({ status: "204", message: "Something went wrong!" })
                    }
                    else {
                      var Final = ({
                        "goldMax": result[0].buy.goldMax.toJSON().$numberDecimal,
                        "goldMin": result[0].buy.goldMin.toJSON().$numberDecimal,
                        "silverMax": result[0].buy.silverMax.toJSON().$numberDecimal,
                        "silverMin": result[0].buy.silverMin.toJSON().$numberDecimal
                      })
                      res.json({ status: "200", buy: Final, KYCFlag: result[0].KYCFlag })
                    }
                  })
                }
              }
              )
              // res.json({status:"204",messege : "Something went wrong!"})
            }
          })
      }
      catch (ex) {
        res.json({ status: "204", message: "Something went wrong!" })
      }

    }
    catch (ex) {
      res.json({ status: "204", message: "Something went wrong!" })
    }
  },

  update_redeemCash_limit_consumer: function (req, res) {
    try {
      var kycflag = req.body.kycflag;
      var appliedOn = req.body.appliedOn;
      var redeemcashobj = {
        "goldMax": req.body.goldmax,
        "goldMin": req.body.goldmin,
        "silverMax": req.body.silvermax,
        "silverMin": req.body.silvermin
      };

      try {
        CONFIG.findOneAndUpdate({ KYCFlag: kycflag, appliedOn: appliedOn }, { $set: { appliedOn: appliedOn, KYCFlag: kycflag, redeemCash: redeemcashobj } }, { upsert: true },
          function (err) {
            if (err) {
              res.json({ status: "204", message: "Something went wrong!" })
              // callback(ex, null);
            } else {
              var configlog = new CONFIGLOG();
              configlog.truID = req.body.truid;
              configlog.KYCFlag = req.body.kycflag;
              configlog.appliedOn = req.body.appliedOn;
              configlog.modifyDate = new Date();
              configlog.redeemCash = redeemcashobj;
              configlog.save(function (err) {
                if (err) {
                  // console.log(err);
                  res.json({ status: "204", message: "Something went wrong!" })
                } else {
                  CONFIG.find({ KYCFlag: kycflag }).exec(function (err, result) {
                    if (err) {
                      res.json({ status: "204", message: "Something went wrong!" })
                    }
                    else {
                      var Final = ({
                        "goldMax": result[0].redeemCash.goldMax.toJSON().$numberDecimal,
                        "goldMin": result[0].redeemCash.goldMin.toJSON().$numberDecimal,
                        "silverMax": result[0].redeemCash.silverMax.toJSON().$numberDecimal,
                        "silverMin": result[0].redeemCash.silverMin.toJSON().$numberDecimal
                      })
                      res.json({ status: "200", redeemCash: Final, KYCFlag: result[0].KYCFlag })
                    }
                  })
                  // res.json({status:"204",messege : "Something went wrong!"})
                }
              }
              )
            }
          })
      }
      catch (ex) {
        res.json({ status: "204", message: "Something went wrong!" })
      }
    }
    catch (ex) {
      res.json({ status: "204", message: "Something went wrong!" })
    }
  },

  update_transfer_limit_consumer: function (req, res) {
    try {
      var kycflag = req.body.kycflag;
      var appliedOn = req.body.appliedOn;
      var transferobj = {
        "goldMax": req.body.goldmax,
        "goldMin": req.body.goldmin,
        "silverMax": req.body.silvermax,
        "silverMin": req.body.silvermin
      };

      try {
        CONFIG.findOneAndUpdate({ KYCFlag: kycflag, appliedOn: appliedOn }, { $set: { KYCFlag: kycflag, appliedOn: appliedOn, transfer: transferobj } }, { upsert: true },
          function (err) {
            if (err) {
              res.json({ status: "204", message: "Something went wrong!" })
              // callback(ex, null);
            } else {
              var configlog = new CONFIGLOG();
              configlog.truID = req.body.truid;
              configlog.KYCFlag = req.body.kycflag;
              configlog.appliedOn = req.body.appliedOn;
              configlog.modifyDate = new Date();
              configlog.transfer = transferobj;
              configlog.save(function (err) {
                if (err) {
                  // console.log(err);
                  res.json({ status: "204", message: "Something went wrong!" })
                } else {
                  CONFIG.find({ KYCFlag: kycflag }).exec(function (err, result) {
                    if (err) {
                      res.json({ status: "204", message: "Something went wrong!" })
                    }
                    else {
                      var Final = ({
                        "goldMax": result[0].transfer.goldMax.toJSON().$numberDecimal,
                        "goldMin": result[0].transfer.goldMin.toJSON().$numberDecimal,
                        "silverMax": result[0].transfer.silverMax.toJSON().$numberDecimal,
                        "silverMin": result[0].transfer.silverMin.toJSON().$numberDecimal
                      })
                      res.json({ status: "200", transfer: Final, KYCFlag: result[0].KYCFlag })
                    }
                  })
                  // res.json({status:"204",messege : "Something went wrong!"})
                }
              }
              )
            }
          })
      }
      catch (ex) {
        res.json({ status: "204", message: "Something went wrong!" })
      }
    }
    catch (ex) {
      res.json({ status: "204", message: "Something went wrong!" })
    }
  },


  update_conversion_limit_consumer: function (req, res) {
    try {
      var kycflag = req.body.kycflag;
      var appliedOn = req.body.appliedOn;
      var conversionobj = {
        "goldMax": req.body.goldmax,
        "goldMin": req.body.goldmin,
        "silverMax": req.body.silvermax,
        "silverMin": req.body.silvermin
      };
      try {
        CONFIG.findOneAndUpdate({ KYCFlag: kycflag, appliedOn: appliedOn }, { $set: { KYCFlag: kycflag, appliedOn: appliedOn, conversion: conversionobj } }, { upsert: true },
          function (err) {
            if (err) {
              res.json({ status: "204", message: "Something went wrong!" })
            } else {
              var configlog = new CONFIGLOG();
              configlog.truID = req.body.truid;
              configlog.KYCFlag = req.body.kycflag;
              configlog.appliedOn = req.body.appliedOn;
              configlog.modifyDate = new Date();
              configlog.conversion = conversionobj;
              configlog.save(function (err) {
                if (err) {
                  // console.log(err);
                  res.json({ status: "204", message: "Something went wrong!" })
                } else {
                  CONFIG.find({ KYCFlag: kycflag }).exec(function (err, result) {
                    if (err) {
                      res.json({ status: "204", message: "Something went wrong!" })
                    }
                    else {
                      var Final = ({
                        "goldMax": result[0].conversion.goldMax.toJSON().$numberDecimal,
                        "goldMin": result[0].conversion.goldMin.toJSON().$numberDecimal,
                        "silverMax": result[0].conversion.silverMax.toJSON().$numberDecimal,
                        "silverMin": result[0].conversion.silverMin.toJSON().$numberDecimal
                      })
                      res.json({ status: "200", conversion: Final, KYCFlag: result[0].KYCFlag })
                    }
                  })
                  // res.json({status:"204",messege : "Something went wrong!"})
                }
              }
              )
            }
          })
      }
      catch (ex) {
        res.json({ status: "204", message: "Something went wrong!" })
      }
    }
    catch (ex) {
      res.json({ status: "204", message: "Something went wrong!" })
    }
  },

  update_wallet_PG_config_consumer: function (req, res) {
    try {
      var kycflag = req.body.kycflag,
        paymentmodeaccess = req.body.paymentmodeaccess,
        walletaccess = req.body.walletaccess,
        walletlimit = req.body.walletlimit,
        txnamountlimit = req.body.txnamountlimit,
        redeemtowallet = req.body.redeemtowallet,
        appliedOn = req.body.appliedOn,
        walletToBank = req.body.wallettobank;
      addmoneyobj = {
        "max": req.body.addmoneymax,
        "min": req.body.addmoneymin,
        "wtbmin": req.body.wtobankmin,
        "wtbmax": req.body.wtobankmax
      };
      try {
        CONFIG.findOneAndUpdate({ KYCFlag: kycflag, appliedOn: appliedOn }, {
          $set: {
            appliedOn: appliedOn,
            walletToBank: walletToBank,
            KYCFlag: kycflag, addMoney: addmoneyobj,
            walletLimit: walletlimit, walletAccess: walletaccess, paymentModeAccess: paymentmodeaccess,
            redeemToWallet: redeemtowallet, txnAmountLimit: txnamountlimit
          }
        }, { upsert: true },
          function (err) {
            if (err) {
              res.json({ status: "204", message: "Something went wrong!" })
            } else {
              var configlog = new CONFIGLOG();
              configlog.truID = req.body.truid;
              configlog.KYCFlag = req.body.kycflag;
              configlog.appliedOn = req.body.appliedOn;
              configlog.modifyDate = new Date();
              configlog.addMoney = addmoneyobj;
              configlog.walletLimit = walletlimit;
              configlog.txnAmountLimit = txnamountlimit;
              configlog.walletAccess = walletaccess;
              configlog.paymentModeAccess = paymentmodeaccess;
              configlog.redeemToWallet = redeemtowallet;
              configlog.save(function (err) {
                if (err) {
                  res.json({ status: "204", message: "Something went wrong!" })
                } else {
                  CONFIG.find({ KYCFlag: kycflag, appliedOn: appliedOn }).exec(function (err, result) {
                    if (err) {
                      res.json({ status: "204", message: "Something went wrong!" })
                    }
                    else {
                      var Final = ({
                        "addMoneyMax": result[0].addMoney.max.toJSON().$numberDecimal,
                        "addMoneyMin": result[0].addMoney.min.toJSON().$numberDecimal,
                        "walletLimit": result[0].walletLimit.toJSON().$numberDecimal,
                        "txnAmountLimit": result[0].txnAmountLimit.toJSON().$numberDecimal,
                        "walletAccess": result[0].walletAccess,
                        "paymentModeAccess": result[0].paymentModeAccess,
                        "redeemToWallet": result[0].redeemToWallet,
                        "walletToBank": result[0].walletToBank,
                        "walletToBankMin": result[0].addMoney.wtbmin.toJSON().$numberDecimal,
                        "walletToBankMax": result[0].addMoney.wtbmax.toJSON().$numberDecimal
                      })
                      res.json({ status: "200", resource: Final, KYCFlag: result[0].KYCFlag, "appliedOn": result[0].appliedOn })
                    }
                  })
                  // res.json({status:"204",messege : "Something went wrong!"})
                }
              })
            }
          })
      }
      catch (ex) {
        res.json({ status: "204", message: "Something went wrong!" })
      }
    }
    catch (ex) {
      res.json({ status: "204", message: "Something went wrong!" })
    }
  },

  show_consumer_configurations: function (req, res) {
    var kycflag = req.body.kycflag;
    var truid = req.body.truid;
    var parenttruid = req.body.parentTruID;
    var appliedOn = req.body.appliedOn;

    function readFromDB() {
      try {
        function perm(obj) {
          return {
            _id: 0, appliedOn: 1,
            "status": { $toString: { $ifNull: [`${String(obj)}.status`, "0"] } },
            "PGType": { $toString: { $ifNull: [`${String(obj)}.PGType`, "0"] } },
            "min": { $toString: { $ifNull: [`${String(obj)}.min`, "0"] } },
            "max": { $toString: { $ifNull: [`${String(obj)}.max`, "0"] } },
            "desc": { $toString: { $ifNull: [`${String(obj)}.desc`, "0"] } },
            "pgID": { $toString: { $ifNull: [`${String(obj)}.pgID`, "0"] } },
            "isDefault": { $ifNull: [`${String(obj)}.isDefault`, false] }
          }
        }
        function returnModule(obj, val) {
          var retobj = {
            "buy": `${String(obj)}.buy.${String(val)}`,
            "redeemCash": `${String(obj)}.redeemCash.${String(val)}`,
            "transfer": `${String(obj)}.transfer.${String(val)}`,
            "redeemToBank": `${String(obj)}.redeemToBank.${String(val)}`,
            "redeemToWallet": `${String(obj)}.redeemToWallet.${String(val)}`,
            "walletToBank": `${String(obj)}.walletToBank.${String(val)}`,
            "walletAccess": `${String(obj)}.walletAccess.${String(val)}`,
            "payByWallet": `${String(obj)}.payByWallet.${String(val)}`,
            "consumerAccess": `${String(obj)}.consumerAccess.${String(val)}`,
            "login": `${String(obj)}.login.${String(val)}`,
            "linkbank": `${String(obj)}.linkbank.${String(val)}`,
            "paymentModeAccess": `${String(obj)}.paymentModeAccess.${String(val)}`,

          }
          if (obj === "$moduleSelf") {
            retobj["allConsumerAccess"] = `${String(obj)}.allConsumerAccess`
          }
          return retobj

        }

        function returnlimit(obj, typeArr) {

          var querygenarray = ["buy", "redeemCash", "transfer"];
          var querygenarray1 = ["buy", "redeemCash", "transfer", "addMoney", "walletToBank"];
          var querygenarray3 = ["addMoney"];
          var querygenarray5 = ["walletToBank"];
          var querygenarray8 = ["redeemCash"];

          var limitobj = {};
          typeArr.forEach(ele => {
            var fieldKey = ele
            var type = querygenarray3.includes(fieldKey) ? "wallet" : fieldKey;
            querygenarray.includes(fieldKey) ? limitobj[`${String(fieldKey)}Max`] = { $toString: `${String(obj)}.${String(type)}.goldMax` } : undefined;
            querygenarray.includes(fieldKey) ? limitobj[`${String(fieldKey)}Min`] = { $toString: `${String(obj)}.${String(type)}.goldMin` } : undefined;
            querygenarray.includes(fieldKey) ? limitobj[`${String(fieldKey)}SilverMax`] = { $toString: `${String(obj)}.${String(type)}.silverMax` } : undefined;
            querygenarray.includes(fieldKey) ? limitobj[`${String(fieldKey)}SilverMin`] = { $toString: `${String(obj)}.${String(type)}.silverMin` } : undefined;
            querygenarray3.includes(fieldKey) ? limitobj[`${String(fieldKey)}Max`] = { $toString: `${String(obj)}.${String(type)}.max` } : undefined;
            querygenarray3.includes(fieldKey) ? limitobj[`${String(fieldKey)}Min`] = { $toString: `${String(obj)}.${String(type)}.min` } : undefined;
            querygenarray5.includes(fieldKey) ? limitobj[`${String(fieldKey)}Max`] = { $toString: `${String(obj)}.${String(type)}.wtbmax` } : undefined;
            querygenarray5.includes(fieldKey) ? limitobj[`${String(fieldKey)}Min`] = { $toString: `${String(obj)}.${String(type)}.wtbmin` } : undefined;
            querygenarray1.includes(fieldKey) ? limitobj[`${String(fieldKey)}maxAmtOfTxnInDay`] = { $toString: `${String(obj)}.${String(type)}.maxAmtOfTxnInDay` } : undefined;
            querygenarray1.includes(fieldKey) ? limitobj[`${String(fieldKey)}maxAmtOfTxnInMonth`] = { $toString: `${String(obj)}.${String(type)}.maxAmtOfTxnInMonth` } : undefined;
            querygenarray1.includes(fieldKey) ? limitobj[`${String(fieldKey)}maxAmtOfTxnInHour`] = { $toString: `${String(obj)}.${String(type)}.maxAmtOfTxnInHour` } : undefined;
            querygenarray1.includes(fieldKey) ? limitobj[`${String(fieldKey)}txnInterval`] = { $toString: `${String(obj)}.${String(type)}.txnInterval` } : undefined;
            querygenarray1.includes(fieldKey) ? limitobj[`${String(fieldKey)}noOfTxnInInterval`] = { $toString: `${String(obj)}.${String(type)}.noOfTxnInInterval` } : undefined;


            querygenarray8.includes(fieldKey) ? limitobj[`${String(fieldKey)}sellAfterBuyInterval`] = { $toString: `${String(obj)}.${String(type)}.sellAfterBuyInterval` } : undefined;
            querygenarray8.includes(fieldKey) ? limitobj[`${String(fieldKey)}sellToBankInterval`] = { $toString: `${String(obj)}.${String(type)}.sellToBankInterval` } : undefined;
            querygenarray8.includes(fieldKey) ? limitobj[`${String(fieldKey)}minBuyToSell`] = { $toString: `${String(obj)}.${String(type)}.minBuyToSell` } : undefined;



            querygenarray3.includes(fieldKey) ? limitobj[`walletLimit`] = { $toString: `${String(obj)}.${String(type)}.walletLimit` } : undefined;
            (querygenarray.includes(fieldKey) && fieldKey === "redeemCash" && obj === "$limitSelf") ? limitobj[`redeemCashsellAfterBuyInterval`] = { $toString: `${String(obj)}.${String(type)}.sellAfterBuyInterval` } : undefined;

          });
          return limitobj;
        }
        PERMISSION.aggregate([
          { $match: { "KYCFlag": kycflag, "appliedOn": appliedOn } },
          {
            $project: {
              _id: 0,
              appliedOn: 1, KYCFlag: 1,
              module: returnModule("$module", "status"),
              moduleSelf: returnModule("$moduleSelf", "status"),
              moduleReasons: returnModule("$module", "message"),
              moduleSelfReasons: returnModule("$moduleSelf", "message"),
              limit: returnlimit("$limit", ["buy", "redeemCash", "transfer", "addMoney", "walletToBank"]),
              limitSelf: returnlimit("$limitSelf", ["buy", "redeemCash", "transfer", "addMoney", "walletToBank"]),
            }
          }, {
            $lookup: {
              from: "digitalpayments",
              let: { appliedon: "$appliedOn" },
              pipeline: [
                { $match: { "appliedOn": appliedOn, "KYCFlag": kycflag } },
                {
                  $project: {
                    _id: 0, appliedOn: 1, payIn: 1, impsPayOut: 1, neftPayOut: 1, upiPayOut: 1, upiCollect: 1
                  }
                },
                {
                  $facet: {
                    payIn: [{ $unwind: { path: "$payIn", preserveNullAndEmptyArrays: true } },
                    { $project: perm("$payIn") }],
                    impsPayOut: [{ $unwind: { path: "$impsPayOut", preserveNullAndEmptyArrays: true } },
                    { $project: perm("$impsPayOut") }],
                    neftPayOut: [{ $unwind: { path: "$neftPayOut", preserveNullAndEmptyArrays: true } },
                    { $project: perm("$neftPayOut") }],
                    upiPayOut: [{ $unwind: { path: "$upiPayOut", preserveNullAndEmptyArrays: true } },
                    { $project: perm("$upiPayOut") },],
                    upiCollect: [{ $unwind: { path: "$upiCollect", preserveNullAndEmptyArrays: true } },
                    { $project: perm("$upiCollect") }]
                  }
                },
                { $project: { _id: 0, appliedOn: { $arrayElemAt: ["$payIn.appliedOn", 0] }, payIn: 1, impsPayOut: 1, neftPayOut: 1, upiPayOut: 1, upiCollect: 1 } },
              ],
              as: "digitalpayments"
            }
          }, { $unwind: "$digitalpayments" }, {
            $project: {
              _id: 0, "module": 1, "moduleReasons": 1, "moduleSelf": 1, "moduleSelfReasons": 1, "KYCFlag": 1, "appliedOn": 1, "limit": 1, "limitSelf": 1,
              digitalPayment: {
                payIn: "$digitalpayments.payIn",
                impsPayOut: "$digitalpayments.impsPayOut", neftPayOut: "$digitalpayments.neftPayOut", upiPayOut: "$digitalpayments.upiPayOut", upiCollect: "$digitalpayments.upiCollect"
              },
            },
          }, {
            "$group": {
              "_id": "$KYCFlag",
              "module": { "$first": "$module" },
              "moduleReasons": { "$first": "$moduleReasons" },
              "moduleSelf": { "$first": "$moduleSelf" },
              "moduleSelfReasons": { "$first": "$moduleSelfReasons" },
              "paymentModeAccess": { "$first": "$paymentModeAccess" },
              "walletAccess": { "$first": "$walletAccess" },
              "KYCFlag": { "$first": "$KYCFlag" },
              "appliedOn": { "$first": "$appliedOn" },
              "limit": { "$first": "$limit" },
              "limitSelf": { "$first": "$limitSelf" },
              "digitalPayment": { "$first": "$digitalPayment" },
              "bankSlab": { "$push": "$bankSlab" }
            }
          },
          {
            $project: {
              _id: 0, module: 1, moduleReasons: 1, moduleSelf: 1, moduleSelfReasons: 1, KYCFlag: 1, appliedOn: 1, limit: 1, limitSelf: 1, digitalPayment: 1, bankSlab: 1,
            }
          }
        ]).exec(async function (err, result) {

          if (appliedOn === "consumer") {
            CUSTPERMISSION.aggregate([
              { $match: { truID: truid } },
              {
                $project: {
                  _id: 0,
                  module: returnModule("$module", "status"),
                  moduleReasons: returnModule("$module", "message"),
                  limit: returnlimit("$limit", ["buy", "redeemCash", "transfer", "addMoney", "walletToBank"]),
                }
              },
            ]).exec(function (err, results) {
              if (err) {
                res.json({ status: "200", resource: result[0] });
              } else {
                if (!results.length) {
                  res.json({ status: "200", resource: result[0] });
                } else {
                  mergeConfigs(result, results)
                }
              }
            })

          } else {
            if (truid) {
              if (!parenttruid) {
                var endocs = await enKYC.find({ truID: truid })
                parenttruid = endocs[0].parentTruID;
              }
              ENPERMISSION.aggregate([
                { $match: { truID: parenttruid } },
                {
                  $project: {
                    _id: 0,
                    module: returnModule("$module", "status"),
                    moduleSelf: returnModule("$moduleSelf", "status"),
                    moduleReasons: returnModule("$module", "message"),
                    moduleSelfReasons: returnModule("$moduleSelf", "message"),
                    limit: returnlimit("$limit", ["buy", "redeemCash", "transfer", "addMoney", "walletToBank",]),
                    limitSelf: returnlimit("$limitSelf", ["buy", "redeemCash", "transfer", "addMoney", "walletToBank"]),
                  }
                },
              ]).exec(function (err, results) {
                if (err) {
                  res.json({ status: "200", resource: result[0] });
                } else {
                  if (!results.length) {
                    res.json({ status: "200", resource: result[0] });
                  } else {
                    ENPERMISSION.aggregate([
                      { $match: { truID: truid } },
                      {
                        $project: {
                          _id: 0,
                          module: returnModule("$module", "status"),
                          moduleSelf: returnModule("$moduleSelf", "status"),
                          moduleReasons: returnModule("$module", "message"),
                          moduleSelfReasons: returnModule("$moduleSelf", "message"),
                          limit: returnlimit("$limit", ["buy", "redeemCash", "transfer", "addMoney", "walletToBank"]),
                          limitSelf: returnlimit("$limitSelf", ["buy", "redeemCash", "transfer", "addMoney", "walletToBank"]),
                        }
                      },
                    ]).exec(function (err, aresults) {
                      if (err) {
                        mergeConfigs(result, results)
                      } else {
                        if (!aresults.length) {
                          mergeConfigs(result, results)
                        } else {
                          var finalObj = mergeConfigsindv(results, aresults)
                          mergeConfigs(result, [finalObj])
                        }
                      }
                    })
                  }
                }
              })
            } else {
              res.json({ status: "200", resource: result[0] });
            }

          }

          function mergeConfigsindv(indvresult, cmnresult) {
            const isObject = (item) => {
              return (item && typeof item === 'object' && !Array.isArray(item));
            }
            const mergeDeep = (target, ...sources) => {
              if (!sources.length) return target;
              const source = sources.shift();

              if (isObject(target) && isObject(source)) {
                for (const key in source) {
                  if (isObject(source[key])) {
                    if (!target[key]) Object.assign(target, {
                      [key]: {}
                    });
                    mergeDeep(target[key], source[key]);
                  } else {
                    if (source[key] !== null) {
                      Object.assign(target, {
                        [key]: source[key]
                      });
                    }

                  }
                }
              }
              return mergeDeep(target, ...sources);
            }
            return mergeDeep(indvresult[0], cmnresult[0]);
          }
          function mergeConfigs(indvresult, cmnresult) {
            const isObject = (item) => {
              return (item && typeof item === 'object' && !Array.isArray(item));
            }
            const mergeDeep = (target, ...sources) => {
              if (!sources.length) return target;
              const source = sources.shift();

              if (isObject(target) && isObject(source)) {
                for (const key in source) {
                  if (isObject(source[key])) {
                    if (!target[key]) Object.assign(target, {
                      [key]: {}
                    });
                    mergeDeep(target[key], source[key]);
                  } else {
                    if (source[key] !== null) {
                      Object.assign(target, {
                        [key]: source[key]
                      });
                    }

                  }
                }
              }
              return mergeDeep(target, ...sources);
            }
            var mergedObjects = mergeDeep(indvresult[0], cmnresult[0]);
            res.json({ status: "200", resource: mergedObjects });
          }
        })
      }
      catch (ex) {
        console.log(ex)
        res.json({ status: "204", message: "Something went wrong!" })
      }
      
    }
    readFromDB();
  }

}


