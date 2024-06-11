/*
  # @description This file contains all Admin functionallity for assetstore, Entity, assetmanager, Customer Modules which will Routes to core apis.
  # Request from UI will send here and then send to internal api with input params.
*/
'use strict'
var conf = require("../config");
var request = require("request");
var KycAll = require('../models/custModel/custKYCAllModel');
var AuthKYC = require('../models/custModel/custKYCAuthModel');
var AccStatusSchema = require('../models/custModel/custAccountStatus');
var Wallet = require('../models/custModel/custWalletModel');
var enWalletLog = require("../models/entityModel/remmitWalletLogModel");
var WalletLog = require("../models/custModel/custWalletLogModel");
var Stock = require('../models/custModel/custStockModel');
var Beneficiary = require('../models/custModel/custBeneficiaryModel');
var TXN = require('../models/custModel/custTXNModel');
var txnStocklogs = require('../models/custModel/custTxnStockLogModel');
var Atom = require("../models/custModel/custAtomModel");
var enKycAll = require('../models/entityModel/remmitKYCAllModel');
var log = require("../models/custModel/custLogsModel");
var enlog = require("../models/entityModel/remmitLogsModel");
var notification_controller = require("./extra/notification.controlller");
var email_controller = require("./extra/email.controller");
var enlog = require("../models/entityModel/remmitLogsModel");
var assetmanagerStock = require("../models/assetmanagerModel/assetmanagerStockModel");

var permission = require('../models/custModel/permission');
var permissionlog = require('../models/custModel/permissionLog');


var cryptos = require('crypto'); //for md5 hash 
var bcrypt = require('bcrypt');
var algorithm = 'aes-256-ctr',
  password = '~*InSpL*~@2808***';
var salt = bcrypt.genSaltSync(10);
var randomize = require('randomatic'),
  fs = require('fs'),
  path = require('path');
let defaultConf = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../regionConf.json')));

function encryption(data) {
  try {
    const key = "~*MyINSPL@66Devi*~";
    var clearEncoding = 'utf8';
    var cipherEncoding = 'base64';
    var cipherChunks = [];
    let enKey = cryptos.createHash('sha256').update(String(key)).digest('hex').substr(0, 32).toUpperCase();
    let iv = cryptos.createHash('sha256').update(String(key)).digest('hex').substr(0, 16).toUpperCase();
    var cipher = cryptos.createCipheriv('aes-256-cbc', enKey, iv);
    cipher.setAutoPadding(true);
    cipherChunks.push(cipher.update(data, clearEncoding, cipherEncoding));
    cipherChunks.push(cipher.final(cipherEncoding));
    return cipherChunks.join('');
  }
  catch (ex) {
    return "0";
  }
}
exports.test = function (req, res) {
  res.json({ message: "Welcome to Company Admin Api" });
};
exports.cust_up_kyc_flag_admin = function (req, res) {
  var truid = req.body.truid;
  var atruid = req.body.atruid;
  var kycflag = req.body.kycflag;
  var kycdesc = req.body.kycdesc;
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
      var docverified = docs[0].docVerified;
      var updated = {
        KYCFlag: kycflag,
        KYCDesc: kycdesc,
        docVerified: true,
        KYCVerifyBy: atruid,
        KYCTime: new Date()
      }
      if (docverified) {
        updated = {
          KYCFlag: kycflag,
          KYCDesc: kycdesc
        }
      }
      if (req.body.panStatus == "active") {
        updated.panStatus = "active"
      }
      if (req.body.aadharStatus == "active") {
        updated.aadharStatus = "active"
      }
      KycAll.findOneAndUpdate({ "truID": truid }, {
        $set: updated
      }, { new: true }, callback);
    }
    function callback(err, doc) {
      if (err) {
        res.send(err);
      } else {
        var updateddata = {
          truID: doc.truID,
          KYCFlag: doc.KYCFlag,
          KYCDesc: doc.KYCDesc,
          docVerified: doc.docVerified,
          KYCTime: doc.KYCTime,
          KYCVerifyBy: doc.KYCVerifyBy,
          panStatus: doc.panStatus,
          aadharStatus: doc.aadharStatus
        }
        res.send({
          "status": 200, resource: updateddata
        })
      }
    }
  })
}
exports.consumer_list_admin = async function (req, res) {
  // var Gen = req.generalCharges;
  var matchqry = {},
    startdate = new Date(req.body.startdate);

  if (req.body.dateflag == true) {
    matchqry = { createDate: { $gt: startdate } };
  }

  const DataQueryBuy = KycAll.aggregate([{ $match: matchqry },
  {
    $project: {
      _id: 0, KYCFlag: 1, createDate: 1, email: 1, fName: 1, mName: 1, lName: 1,  //DB query to fetch all consumer
      mobile: 1, truID: 1, billingAddress: 1, permanentAddress: 1, image: 1, channel: 1, createDate: 1, refernceTruID: 1,
      docVerified: 1, CRNNo: 1, DOB: 1, countryCode: 1, gender: 1, currentassetstore: 1, KYCDetails: 1, KYCTime: 1, KYCVerifyBy: 1, aadharStatus: 1, panStatus: 1
    }
  },
  { $sort: { createDate: -1 } }
  ]).allowDiskUse(true).cursor({ batchSize: 1000 })
  var result = new Array();
  for await (const txndetail of DataQueryBuy) {
    result.push(txndetail)
  }
  var rslt = new Array();
  function fromServer(resltdetail) {
    return new Promise((resolve, reject) => {
      var arrayreslt = {};
      if (resltdetail.truID != "5000") {
        var reftruid = resltdetail.refernceTruID ? resltdetail.refernceTruID : "0";
        arrayreslt["CRNNo"] = resltdetail.CRNNo;
        arrayreslt["DOB"] = resltdetail.DOB;
        arrayreslt["countryCode"] = resltdetail.countryCode;
        arrayreslt["gender"] = resltdetail.gender;
        arrayreslt["currentassetstore"] = resltdetail.currentassetstore;
        arrayreslt["KYCFlag"] = resltdetail.KYCFlag;
        arrayreslt["createDate"] = resltdetail.createDate ? Date.parse(resltdetail.createDate) : resltdetail.createDate;
        arrayreslt["email"] = resltdetail.email;
        arrayreslt["fName"] = resltdetail.fName;
        arrayreslt["mName"] = resltdetail.mName;
        arrayreslt["lName"] = resltdetail.lName;
        arrayreslt["mobile"] = resltdetail.mobile;
        arrayreslt["truID"] = resltdetail.truID;
        arrayreslt["billingAddress"] = resltdetail.billingAddress;
        arrayreslt["permanentAddress"] = resltdetail.permanentAddress;
        arrayreslt["image"] = resltdetail.image;
        arrayreslt["MT_Type"] = resltdetail.channel;
        arrayreslt["docVerified"] = resltdetail.docVerified;
        arrayreslt["aadharStatus"] = resltdetail.aadharStatus;
        arrayreslt["panStatus"] = resltdetail.panStatus;
        arrayreslt["KYCTime"] = resltdetail.KYCTime;
        arrayreslt["KYCVerifyBy"] = resltdetail.KYCVerifyBy;
        arrayreslt["KYCDetails"] = resltdetail.KYCDetails;
        arrayreslt["channel"] = resltdetail.KYCDetails;
        /*    var KYCDetails = new Array();
           if (resltdetail.KYCDetails && resltdetail.KYCDetails.length) {
             for (var i = 0; i < resltdetail.KYCDetails.length; i++) {
               var kycelements = resltdetail.KYCDetails[i];
               var kycaray = {};
               kycaray["docNumber"] = kycelements.docNumber;
               kycaray["docTitle"] = kycelements.docTitle; 
               kycaray["docFile"] = kycelements.docFile; 
               KYCDetails.push(kycaray);
             }
             arrayreslt["KYCDetails"] = KYCDetails;
           } */

        var refFlag = "direct";
        if (reftruid) {
          var rid = reftruid.substring(0, 4);
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

          arrayreslt["refFlag"] = refFlag;

          if (refFlag != "direct") {
            arrayreslt["referenceTruID"] = reftruid;
          }
        }
        rslt.push(arrayreslt);
      }
      resolve(true);
    }
    )
  }
  async function forLoopGood() {
    for (var i = 0; i < result.length; i++) {
      await fromServer(result[i]);
    }

    if (result.length == i) {
      var resparr = new Array();
      for (var j = 0; j < rslt.length; j++) {
        var rsltobj = rslt[j];
        if (rsltobj.refFlag != "direct") {
          await getDetails(rsltobj.refFlag, rsltobj.referenceTruID).then((retobj) => {
            if (rsltobj.refFlag === "consumer" || rsltobj.refFlag === "admin") {

              rsltobj.refFName = retobj.fName;
              rsltobj.refLName = retobj.lName;
            }
            if (rsltobj.refFlag === "entity" || rsltobj.refFlag === "assetstore") {
              rsltobj.companyName = retobj.companyName;
            }
            if (rsltobj.refFlag === "assetmanager") {
              rsltobj.assetmanagerName = retobj.assetmanagerName;
            }
          })
        }
        resparr.push(rsltobj);
      }
      res.json({ status: "200", resource: resparr });
    } else {
      res.json({ status: "204", message: "No Data Found!" })
    }
  }
  forLoopGood();
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
    } else if (refFlag === "assetstore") {
      return new Promise((resolve, reject) => {
        assetstoreKycAll.find({ "truID": req.body.truid }, function (err, docs) {
          if (!docs.length) {
            resolve({ status: "400", message: "Consumer not exists!" });
          }
          else {
            resolve({ status: "200", fName: docs[0].contactFName, lName: docs[0].contactLName, companyName: docs[0].companyName });
          }
        })
      })
    } else if (refFlag === "admin") {
      return new Promise((resolve, reject) => {
        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":5112/api/adminvalidation",
          "body": JSON.stringify({
            "truid": truid,
            "flag": "admin"
          })
        }, (error, response, body) => {
          if (error) {
            console.log(error);
          }
          else {
            var detail = JSON.parse(body);
            resolve(detail);
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
};

exports.list_address = function (req, res) {
  var badd = new KycAll(req.user);
  var truid = req.body.truid;

  KycAll.aggregate([{ "$match": { truID: truid } }, {
    "$project": {
      _id: 0, billingAddress: 1, permanentAddress: 1,
      name: { "$concat": ["$fName", "  ", "$lName"] }
    }
  }]).exec(function (err, result) {
    if (err) {
      response.status(500).send({ error: err })
      return next(err);
    }
    else {
      var resource = result;
      res.json({ status: "1000", resource: resource });
    }
  });
};
exports.list_customer_profile_for_admin = function (req, res) {
  var truid = req.body.truid;
  KycAll.find({
    $or: [{ email: truid }, { mobile: truid }, { truID: truid }]
  }, function (err, docs) {
    if (!docs.length) {
      res.json({
        status: "204",
        message: "The request was successful but no body was returned."
      });
    } else {
      KycAll.aggregate([
        { $match: { $or: [{ email: truid }, { mobile: truid }, { truID: truid }] } },
        {
          $project: {
            fName: 1, lName: 1, countryCode: 1, KYCDetails: 1, DOB: 1, mName: 1, gender: 1,
            billingAddress: 1, permanentAddress: 1, image: { $concat: ["$image"] }, CRNNo: 1, docVerified: 1,
            _id: 0, truID: 1, mobile: 1, KYCFlag: 1, email: 1, currentassetstore: 1, aadharStatus: 1, panStatus: 1, KYCTime: 1
          }
        },
        {
          $lookup: {
            from: "stocks",
            localField: "truID",
            foreignField: "truID",
            as: "stock"
          }
        },
        { $unwind: "$stock" },
        {
          $project:
          {
            name: 1, fName: 1, lName: 1, gender: 1, KYCDetails: 1, gender: 1, currentassetstore: 1, CRNNo: 1,
            city: 1, pin: 1, image: 1, countryCode: 1, DOB: 1, mName: 1, docVerified: 1,
            truID: 1, mobile: 1, KYCFlag: 1, email: 1, billingAddress: 1, permanentAddress: 1, aadharStatus: 1, panStatus: 1, KYCTime: 1,
            g1: "$stock.stock.G24K",
            g4: "$stock.stock.S99P"
          }
        },
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
            name: 1, fName: 1, lName: 1, truID: 1, mobile: 1, KYCFlag: 1, mName: 1, image: 1, gender: 1, currentassetstore: 1, CRNNo: 1,
            email: 1, image: 1, countryCode: 1, KYCDetails: 1, DOB: 1, billingAddress: 1, permanentAddress: 1, docVerified: 1,
            g1: 1, g4: 1, balance: "$wallet.clBal", aadharStatus: 1, panStatus: 1, KYCTime: 1
          }
        },
      ]).exec(function (err, result) {
        if (err) {
          response.status(500).send({ error: err })
          return next(err);
        }
        else {
          var resource = result[0];
          var currentassetstore = resource.currentassetstore;
          request.post({
            "headers": { "content-type": "application/json" },
            "url": conf.reqip + ":5114/api/findassetstore",
            "body": JSON.stringify({
              "truid": currentassetstore
            })
          }, (error, response, body) => {
            if (error) {
              return console.dir(error);
            }
            var newjson = JSON.parse(body);
            if (newjson.resource[0].assetstore.type === "admin") {
              var assetstore = newjson.resource[0].assetstore;
            } else {
              var assetstore = newjson.resource[1].assetstore;
            }

            var name = resource.name;
            var countryCode = resource.countryCode;
            var fName = resource.fName;
            var lName = resource.lName;
            var mName = resource.mName;
            var DOB = resource.DOB;
            var docVerified = resource.docVerified;
            var aadharStatus = resource.aadharStatus;
            var panStatus = resource.panStatus;
            var KYCTime = resource.KYCTime;

            var KYCDetails = resource.KYCDetails;
            var billingAddress = resource.billingAddress;
            var permanentAddress = resource.permanentAddress;

            var truID = resource.truID;
            var mobile = resource.mobile;
            var email = resource.email;
            var KYCFlag = resource.KYCFlag;
            var image = resource.image;
            var gender = resource.gender;

            var g1v = resource.g1.toJSON().$numberDecimal;
            var g4v = resource.g4.toJSON().$numberDecimal;
            var walletBal = resource.balance.toJSON().$numberDecimal;
            var crnno = resource.CRNNo;
            var Final = ({
              'name': name, "fName": fName, "lName": lName, 'truID': truID, "CRNNo": crnno, "mobile": mobile,
              "email": email, "KYCFlag": KYCFlag, 'mName': mName, "DOB": DOB, "G24K": g1v,
              "S99P": g4v, "countryCode": countryCode,
              "balance": walletBal, "KYCDetails": KYCDetails, "billingAddress": billingAddress, "image": image,
              "docVerified": docVerified, "permanentAddress": permanentAddress, "gender": gender, assetstore: assetstore,
              "aadharStatus": aadharStatus, "panStatus": panStatus, "KYCTime": KYCTime
            });
            res.json({ status: "200", resource: Final });
          }
          )
        }
      });
    }
  })
};
exports.ins_reference_registration_admin = function (req, res) {
  var auth = new AuthKYC(req.user);
  var kycall = new KycAll();
  var subs = req.body.fname.substr(0, 4);
  var dob = new Date(Date.parse(req.body.DOB));
  var year = dob.getFullYear();
  var password = subs + year;
  var userpass = password;
  var hashtwo = bcrypt.hashSync(password, salt);
  var crnno = randomize('A0', 7);
  let crnNo = 'c'.concat(crnno);

  var truid = randomize('0', 12);
  let truId = '5000'.concat(truid);
  var mobile = req.body.mobile;
  var email = req.body.email;
  var kycflag = req.body.kycflag;
  var refernceid = req.body.refernceid;



  auth.email = email;
  auth.mobile = req.body.mobile;
  auth.CRNNo = crnNo;
  auth.password = hashtwo;
  auth.isPwdReset = false;

  kycall.email = email;
  kycall.KYCFlag = "active";
  kycall.currentassetstore = defaultConf.currentassetstore;
  if (req.body.countrycode != undefined) { kycall.countryCode = req.body.countrycode }
  kycall.fName = req.body.fname;
  kycall.mName = req.body.mname;
  kycall.lName = req.body.lname;
  kycall.mobile = req.body.mobile;
  kycall.DOB = dob;
  kycall.gender = req.body.gender;
  kycall.CRNNo = crnNo;
  kycall.truID = truId;
  kycall.refernceID = refernceid;
  kycall.channel = 'Admin';
  kycall.createDate = new Date();
  kycall.createUser = 'User';
  kycall.refernceTruID = refernceid;
  kycall.image = "0";
  kycall.referalCount = "0";
  kycall.referenceVerified = true;

  AuthKYC.find({ $or: [{ "email": email }, { mobile: req.body.mobile }] }, function (err, docs) {
    if (!docs.length) {
      auth.save(function (err) {
        if (err) {
          console.log(err);
        }
        res.json({ status: "201", message: 'Consumer Created!', truID: truId, CRNNo: crnNo });
      });
    }

    else {
      res.json({ status: "409", message: 'User Already Exists!' });
    }

    KycAll.find({ $or: [{ "email": email }, { mobile: req.body.mobile }] }, function (err, docs) {
      if (!docs.length) {
        kycall.save(function (err) {
          if (err) {
            console.log(err)
          }
          else {
            ins_beneficiary();
          }
        });
        function ins_beneficiary(err, numAffected) {
          if (err) {
            console.log(err);
          }
          var query = { customertruID: truId };
          var respresult = Beneficiary.findOneAndUpdate(query, { $set: { customertruID: truId } }, { upsert: true })
          respresult.exec(function (err, result) {
            if (err) {
              console.log(err);
            }
            else {
              ins_stock();
            }
          });
        }

        function ins_stock(err, numAffected) {
          if (err) {
            res.send(err);
          }
          var query1 = { truID: truId };
          var respresult = Stock.findOneAndUpdate(query1, {
            $set: {
              truID: '5000'.concat(truid),
              "stock.G24K": "0.00", "stock.S99P": "0.00",
              "lStock.G24K": "0.00", "lStock.S99P": "0.00"
            }
          }, { upsert: true });
          respresult.exec(function (err, result) {
            if (err) {
              response.status(500).send({ error: err })
              return next(err);
            }
            else {
              add_wallet();
            }
          });
        }

        function add_wallet(err, numAffected) {
          if (err) {
            console.log(err);
          }
          var query1 = { truID: truId };
          var respresult = Wallet.findOneAndUpdate(query1, {
            $set: {
              truID: truId,
              opBal: "0.00", Dr: "0.00", Cr: "0.00", clBal: "0.00"
            }
          }, { upsert: true })
          respresult.exec(function (err, result) {
            if (err) {
              response.status(500).send({ error: err })
              return next(err);
            }
            else {
              var fname = req.body.fname;
              notification_controller.notification_registartion_From_Admin(truId, fname);
              email_controller.email_registartion_admin(req.body.email, fname, req.body.lname, userpass);
            }
          });
        }
      }
      else {
      }
    }
    )
  }
  )
};
exports.Update_address = function (req, res) {
  var badd = new KycAll(req.user);
  var truid = req.body.truid;
  var query = { truID: truid };

  KycAll.findOneAndUpdate(query, {
    $set:
    {
      billingAddress: {
        houseNumber: req.body.housenumber, streetNumber: req.body.streetnumber, landmark: req.body.landmark,
        pin: req.body.pin, city: req.body.city, state: req.body.state, country: req.body.country
      },
      permanentAddress: {
        houseNumber: req.body.phousenumber, streetNumber: req.body.pstreetnumber, landmark: req.body.plandmark,
        pin: req.body.ppin, city: req.body.pcity, state: req.body.pstate, country: req.body.pcountry
      }
    }
  }, callback)

  function callback(err, numAffected) {
    if (err)
      res.send(err);
    KycAll.aggregate([{ "$match": { truID: truid } }, {
      "$project": {
        _id: 0, billingAddress: 1, permanentAddress: 1,//upadated addresses
        name: { "$concat": ["$fName", "  ", "$lName"] }
      }
    }]).exec(function (err, result) {
      if (err) {
        res.status(500).send({ status: "500", error: err })
      }
      else {
        var resource = result;
        res.json({ status: "1000", resource: resource });
      }
    });
  };
};
exports.update_cust_reg_admin = function (req, res) {

  KycAll.find({
    truID: req.body.truid
  }, function (err, docs) {
    if (!docs.length) {
      res.json({
        status: "204",
        message: "The request was successful but no body was returned."
      });
    }
    else {
      AuthKYC.findOneAndUpdate({ CRNNo: docs[0].CRNNo }, { $set: { email: req.body.email, mobile: req.body.mobile } }).exec();

      var emailVerified = req.body.email == docs[0].email ? true : false; // check email verified or not



      var address = KycAll.findOneAndUpdate({ truID: req.body.truid },
        {
          $set: {
            email: req.body.email, mobile: req.body.mobile, fName: req.body.fname, countryCode: req.body.countrycode,
            mName: req.body.mname, lName: req.body.lname, DOB: req.body.DOB, gender: req.body.gender, emailVerified: emailVerified
          }
        })
      address.exec(function (err, result) {
        if (!docs.length) {
          res.send(err);
        } else {
          res.json({
            status: "200", message: "Details Updated."
          });
        }
      }
      )
    }
  }
  )
};
exports.add_kyc_docs = function (req, res) {

  KycAll.findOneAndUpdate({ truID: req.body.truid }, { $set: { KYCDetails: req.body.kycdetails } }, callback)

  function callback(err, numAffected) {
    if (err)
      res.send(err);
    var respresult = KycAll.find({ truID: req.body.truid }, { KYCDetails: 1, _id: 0 });
    respresult.exec(function (err, result) {
      if (err) {
        response.status(500).send({ error: err })
        return next(err);
      }
      else { res.json({ status: "200", KYCDetails: result[0].KYCDetails }); }
    });
  };
};
exports.Update_KYCDocs_from_entity = function (req, res) {
  var badd = new KycAll(req.user);
  var truid = req.body.truid;
  var query = { truID: truid };
  KycAll.find(
    query, function (err, docs) {
      if (!docs.length) {
        res.json({ status: "204", message: "The request was successful but no body was returned." });
      } else {
        var kycflag = "active";
        // if (req.body.flag === "consumer"){
        //   kycflag = "pending";
        // }else{
        // kycflag = "active";
        // }
        KycAll.findOneAndUpdate(query, { $set: { KYCDetails: req.body.kycdetails, KYCFlag: kycflag } }, callback)
        function callback(err, numAffected) {
          if (err) {
            res.json({ status: "204", message: "Something went wrong." });
          }
          else {
            res.json({ status: "200", message: "Files Uploaded Successfully." });
          }
        }
      }
    }
  )
};
exports.count_all_consumer = function (req, res) {

  KycAll.aggregate([{ $match: { "__t": "KycAll" } },
  {
    $facet: {
      direct: [{ $match: { "channel": "Direct" } }, { "$count": "count" }],
      entity: [{ $match: { channel: { "$ne": "Direct" }, refernceTruID: { $regex: /8000/ } } }, { "$count": "count" }],
      admin: [{ $match: { channel: "Company Admin", refernceTruID: { $regex: /1000/ } } }, { "$count": "count" }],
      assetmanager: [{ $match: { channel: { "$ne": "Direct" }, refernceTruID: { $regex: /6000/ } } }, { "$count": "count" }],
      assetstore: [{ $match: { channel: { "$ne": "Direct" }, refernceTruID: { $regex: /4124/ } } }, { "$count": "count" }],
      total: [{ "$count": "count" }]
    }
  }]).exec(function (err, result) {
    if (!result.length) {
      res.json({ status: "204", message: "No assetstore found!" });
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
      var totalmatch = parseInt(direct) + parseInt(assetmanager) + parseInt(admin) + parseInt(entity);
      if (total != totalmatch) {
        res.json({ status: "204", message: "Something went wrong!" });
      } else {
        var finalresp = ({
          "direct": direct.toString(),
          "entity": entity.toString(),
          "admin": admin.toString(),
          "assetmanager": assetmanager.toString(),
          "total": total.toString()
        });
        res.json({ status: "200", resource: finalresp });
      }
    }
  }
  )
};
exports.all_consumer_report_admin = function (req, res) {

  var matchqry = { "__t": "KycAll" };

  var startdate = new Date(Date.parse(req.body.startdate));
  var enddate = new Date(Date.parse(req.body.enddate) + (1000 * 3600 * 24));

  if (req.body.dateflag === true) {
    matchqry = { "__t": "KycAll", createDate: { $gte: startdate, $lte: enddate } };
  }
  KycAll.aggregate([
    { $match: matchqry },
    { $project: { truID: 1, _id: 0 } },
    {
      $group: {
        _id: null,
        truID: { $addToSet: "$truID" }
      }
    },
    { $project: { _id: 0, truID: 1 } }
  ]).exec(function (err, custid) {
    if (!custid || !custid.length || !custid[0].truID.length) {
      custid = "0";
    }
    else {
      custid = custid[0].truID.length.toString();
    }

    var txnmatchqry = { status: "success" };

    if (req.body.dateflag === true) {
      txnmatchqry = { status: "success", createDate: { $gte: startdate, $lte: enddate } };
    }

    var projectqry = {
      $project: {
        "sum24": { "$sum": "$particularsG24.qty" }, "sum99": { "$sum": "$particularsS99.qty" }, totalAmount: 1
      }
    };

    var grpqry = {
      $group: {
        _id: null,
        count: { $sum: 1 },
        //   qty:{ $sum :{$add:["$sum24","$sum22","$sum18","$sum99"]}},
        totalamount: { $sum: "$totalAmount" },
        g24k: { $sum: "$sum24" },
        s99p: { $sum: "$sum99" },
      }
    };

    TXN.aggregate([{ $match: txnmatchqry },
    {
      $facet: {
        allTXNDetail: [
          projectqry,
          grpqry
        ],

        consumerBuy: [{ $match: { type: "buy", sourceFlag: "customer" } },
          projectqry,
          grpqry
        ],

        consumerRedeemCash: [{ $match: { type: "redeemCash", sourceFlag: "customer" } },
          projectqry,
          grpqry
        ],
        consumerTransfer: [{ $match: { type: "transfer", sourceFlag: "customer" } },
          projectqry,
          grpqry
        ],
        entityBuy: [{ $match: { type: "buy", sourceFlag: "remmit" } },
          projectqry,
          grpqry
        ],
        entityBuyCash: [{ $match: { type: "buyCash", sourceFlag: "remmit" } },
          projectqry,
          grpqry
        ],

        entityRedeemCash: [{ $match: { type: "redeemCash", sourceFlag: "remmit" } },
          projectqry,
          grpqry
        ],
        entityTransfer: [{ $match: { type: "transfer", sourceFlag: "remmit" } },
          projectqry,
          grpqry
        ],
        assetmanagerBuy: [{ $match: { type: "buy", sourceFlag: "assetmanager" } },
          projectqry,
          grpqry
        ],
        assetmanagerBuyCash: [{ $match: { type: "buyCash", sourceFlag: "assetmanager" } },
          projectqry,
          grpqry
        ]
      }
    }
    ]).exec(function (err, result) {
      if (err) {
        res.json({ "status": "204", message: "Something went wrong!" })
      }
      else {
        var resource = result[0], alltxncount = 0, alltxnamt = 0, alltxng24k = 0,
          alltxns99p = 0, consumerbuycount = 0, consumerbuyamt = 0,
          consumerbuyg24k = 0, consumerbuys99p = 0,
          consumerredeemcashcount = 0, consumerredeemcashamt = 0, consumerredeemcashg24k = 0,
          consumerredeemcashs99p = 0,
          consumertransfercount = 0, consumertransferamt = 0, consumertransferg24k = 0,
          consumertransfers99p = 0,
          entitybuycount = 0, entitybuyamt = 0, entitybuyg24k = 0,
          entitybuys99p = 0, entityredeemcashcount = 0, entityredeemcashamt = 0, entityredeemcashg24k = 0,
          entityredeemcashs99p = 0,
          entitytransfercount = 0, entitytransferamt = 0, entitytransferg24k = 0, entitytransfers99p = 0,
          entitybuycashcount = 0, entitybuycashamt = 0, entitybuycashg24k = 0, entitybuycashs99p = 0,
          assetmanagerbuycount = 0, assetmanagerbuyamt = 0, assetmanagerbuyg24k = 0, assetmanagerbuys99p = 0,
          assetmanagerbuycashcount = 0, assetmanagerbuycashamt = 0, assetmanagerbuycashg24k = 0, assetmanagerbuycashs99p = 0;
        if (resource.allTXNDetail.length) {
          alltxncount = resource.allTXNDetail[0].count;
          alltxnamt = resource.allTXNDetail[0].totalamount.toJSON().$numberDecimal;
          alltxng24k = resource.allTXNDetail[0].g24k.toJSON().$numberDecimal;
          alltxns99p = resource.allTXNDetail[0].s99p.toJSON().$numberDecimal;
        }
        if (resource.consumerBuy.length) {
          consumerbuycount = resource.consumerBuy[0].count;
          consumerbuyamt = resource.consumerBuy[0].totalamount.toJSON().$numberDecimal;
          consumerbuyg24k = resource.consumerBuy[0].g24k.toJSON().$numberDecimal;
          consumerbuys99p = resource.consumerBuy[0].s99p.toJSON().$numberDecimal;
        }
        if (resource.consumerRedeemCash.length) {
          consumerredeemcashcount = resource.consumerRedeemCash[0].count;
          consumerredeemcashamt = resource.consumerRedeemCash[0].totalamount.toJSON().$numberDecimal;
          consumerredeemcashg24k = resource.consumerRedeemCash[0].g24k.toJSON().$numberDecimal;
          consumerredeemcashs99p = resource.consumerRedeemCash[0].s99p.toJSON().$numberDecimal;
        }
        if (resource.consumerTransfer.length) {
          consumertransfercount = resource.consumerTransfer[0].count;
          consumertransferamt = resource.consumerTransfer[0].totalamount.toJSON().$numberDecimal;
          consumertransferg24k = resource.consumerTransfer[0].g24k.toJSON().$numberDecimal;
          consumertransfers99p = resource.consumerTransfer[0].s99p.toJSON().$numberDecimal;
        }


        if (resource.entityBuy.length) {
          entitybuycount = resource.entityBuy[0].count;
          entitybuyamt = resource.entityBuy[0].totalamount.toJSON().$numberDecimal;
          entitybuyg24k = resource.entityBuy[0].g24k.toJSON().$numberDecimal;
          entitybuys99p = resource.entityBuy[0].s99p.toJSON().$numberDecimal;
        }
        if (resource.entityBuyCash.length) {
          entitybuycashcount = resource.entityBuyCash[0].count;
          entitybuycashamt = resource.entityBuyCash[0].totalamount.toJSON().$numberDecimal;
          entitybuycashg24k = resource.entityBuyCash[0].g24k.toJSON().$numberDecimal;
          entitybuycashs99p = resource.entityBuyCash[0].s99p.toJSON().$numberDecimal;
        }
        if (resource.entityRedeemCash.length) {
          entityredeemcashcount = resource.entityRedeemCash[0].count;
          entityredeemcashamt = resource.entityRedeemCash[0].totalamount.toJSON().$numberDecimal;
          entityredeemcashg24k = resource.entityRedeemCash[0].g24k.toJSON().$numberDecimal;
          entityredeemcashs99p = resource.entityRedeemCash[0].s99p.toJSON().$numberDecimal;
        }

        if (resource.entityTransfer.length) {
          entitytransfercount = resource.entityTransfer[0].count;
          entitytransferamt = resource.entityTransfer[0].totalamount.toJSON().$numberDecimal;
          entitytransferg24k = resource.entityTransfer[0].g24k.toJSON().$numberDecimal;
          entitytransfers99p = resource.entityTransfer[0].s99p.toJSON().$numberDecimal;
        }

        if (resource.assetmanagerBuy.length) {
          assetmanagerbuycount = resource.assetmanagerBuy[0].count;
          assetmanagerbuyamt = resource.assetmanagerBuy[0].totalamount.toJSON().$numberDecimal;
          assetmanagerbuyg24k = resource.assetmanagerBuy[0].g24k.toJSON().$numberDecimal;
          assetmanagerbuys99p = resource.assetmanagerBuy[0].s99p.toJSON().$numberDecimal;
        }
        if (resource.assetmanagerBuyCash.length) {
          assetmanagerbuycashcount = resource.assetmanagerBuyCash[0].count;
          assetmanagerbuycashamt = resource.assetmanagerBuyCash[0].totalamount.toJSON().$numberDecimal;
          assetmanagerbuycashg24k = resource.assetmanagerBuyCash[0].g24k.toJSON().$numberDecimal;
          assetmanagerbuycashs99p = resource.assetmanagerBuyCash[0].s99p.toJSON().$numberDecimal;
        }



        var finalresp = ({
          "consumerCount": custid.toString(),
          "allTXNDetail": {
            "count": alltxncount.toString(),
            "totalAmount": alltxnamt.toString(),
            "g24kQTY": alltxng24k.toString(),
            "s99pQTY": alltxns99p.toString()
          },
          "consumer": {
            "Buy": {
              "count": consumerbuycount.toString(),
              "totalAmount": consumerbuyamt.toString(),
              "g24kQTY": consumerbuyg24k.toString(),
              "s99pQTY": consumerbuys99p.toString()
            },
            "redeemCash": {
              "count": consumerredeemcashcount.toString(),
              "totalAmount": consumerredeemcashamt.toString(),
              "g24kQTY": consumerredeemcashg24k.toString(),
              "s99pQTY": consumerredeemcashs99p.toString()
            },
            "transfer": {
              "count": consumertransfercount.toString(),
              "totalAmount": consumertransferamt.toString(),
              "g24kQTY": consumertransferg24k.toString(),
              "s99pQTY": consumertransfers99p.toString()
            }
          },
          "entity": {
            "Buy": {
              "count": entitybuycount.toString(),
              "totalAmount": entitybuyamt.toString(),
              "g24kQTY": entitybuyg24k.toString(),
              "s99pQTY": entitybuys99p.toString()
            },
            "BuyCash": {
              "count": entitybuycashcount.toString(),
              "totalAmount": entitybuycashamt.toString(),
              "g24kQTY": entitybuycashg24k.toString(),
              "s99pQTY": entitybuycashs99p.toString()
            },
            "redeemCash": {
              "count": entityredeemcashcount.toString(),
              "totalAmount": entityredeemcashamt.toString(),
              "g24kQTY": entityredeemcashg24k.toString(),
              "s99pQTY": entityredeemcashs99p.toString()
            },
            "transfer": {
              "count": entitytransfercount.toString(),
              "totalAmount": entitytransferamt.toString(),
              "g24kQTY": entitytransferg24k.toString(),
              "s99pQTY": entitytransfers99p.toString()
            }
          },
          "assetmanager": {
            "Buy": {
              "count": assetmanagerbuycount.toString(),
              "totalAmount": assetmanagerbuyamt.toString(),
              "g24kQTY": assetmanagerbuyg24k.toString(),
              "s99pQTY": assetmanagerbuys99p.toString()
            },
            "BuyCash": {
              "count": assetmanagerbuycashcount.toString(),
              "totalAmount": assetmanagerbuycashamt.toString(),
              "g24kQTY": assetmanagerbuycashg24k.toString(),
              "s99pQTY": assetmanagerbuycashs99p.toString()
            }
          }
        });
        res.json({ status: "200", resource: finalresp });
      }
    }
    )
  }
  )
};
exports.consumer_update_kyc_flag_admin = function (req, res) {
  KycAll.find({
    "truID": req.body.cTruID
  }, function (err, docs) {
    if (!docs.length) {
      res.json({
        status: "411",
        message: "This truID Doesnt exists"
      });
    } else {
      var accSt = new AccStatusSchema();
      accSt["modifiedBy"] = req.body.truID;
      accSt["createDate"] = new Date();
      accSt["truID"] = req.body.cTruID;
      accSt["KYCFlag"] = req.body.KYCFlag;
      accSt["reason"] = req.body.reason;
      accSt["source"] = "admin";
      accSt.save(function (err) {
        if (err) {
          res.json({ status: "204", message: 'Something went wrong!' });

        } else {
          KycAll.findOneAndUpdate({ truID: req.body.cTruID }, {
            $set: {
              KYCFlag: req.body.KYCFlag
            }
          }, callback)
        }
        function callback(err) {
          if (err) {
            res.send(err);
          } else {
            res.json({
              status: "200", resource: { KYCFlag: req.body.KYCFlag }
            });
          }
        }
      })
    }
  }
  )
};
exports.assetmanager_txn_report_admin = function (req, res) {
  var truid = req.body.truid;

  request.post({
    "headers": { "content-type": "application/json" },
    "url": conf.reqip + ":4115/api/checkassetmanagerreport",
    "body": JSON.stringify({
      "truid": truid,
      "flag": "admin"
    })
  }, (error, response, body) => {
    if (error) {
      return console.dir(error);
    }
    var newjson = JSON.parse(body);
    var status = newjson.status;

    if (status === "400") {
      res.json({
        status: "204",
        message: 'The request was successful but assetmanager not found!'
      });
    }
    else {

      var projectqry = {
        _id: 1, to: 1, invoice: 1, otherChsrges: 1, totalAmount: 1, MOP: 1, createDate: 1, status: 1,
        particularsG24: 1, particularsS99: 1
      },
        sortqry = { _id: -1 },
        limitqry = { $limit: 30 },
        lookupqry = { from: "kycs", localField: "to", foreignField: "truID", as: "user" },
        unwindqry = { $unwind: "$user" },
        finalprojectqry = {
          _id: 1, to: 1, invoice: 1, otherChsrges: 1, totalAmount: 1, MOP: 1, createDate: 1,
          particularsG24: 1, particularsS99: 1, status: 1,
          billingAddress: "$user.billingAddress", fName: "$user.fName", mName: "$user.mName", lName: "$user.lName"
        };

      TXN.aggregate([
        {
          $match: {
            $or: [
              { $and: [{ "particularsG24.from": truid }, { "particularsG24.qty": { "$gt": 0 } }] },
              { $and: [{ "particularsS99.from": truid }, { "particularsS99.qty": { "$gt": 0 } }] }
            ]
          }
        },
        {
          $facet: {
            BuyUnit: [{ $match: { type: "buy" } },
            { $project: projectqry }, { $sort: sortqry }, limitqry, { $lookup: lookupqry }, unwindqry, { $project: finalprojectqry }
            ],
            buyCash: [{ $match: { type: "buyCash" } },
            { $project: projectqry }, { $sort: sortqry }, limitqry, { $lookup: lookupqry }, unwindqry, { $project: finalprojectqry }
            ],
            redeemCash: [{ $match: { type: "redeemCash" } },
            { $project: projectqry }, { $sort: sortqry }, limitqry, { $lookup: lookupqry }, unwindqry, { $project: finalprojectqry }
            ]
          }
        }]).exec(function (err, result) {
          if (err) {
            console.log(err);
            res.json({ status: "204", message: 'Something went wrong!' });
          } else {

            var resource = result[0];
            var arr24 = new Array();
            var arr99 = new Array();

            function finalResp(resulltobj) {
              // var buy = new Array();
              // for (var i = 0; i < resource.BuyUnit.length; i++) {
              arr24 = [];
              arr99 = [];

              // var buydetail = resource.BuyUnit[i];
              var arraybuy = {};

              arraybuy["invoice"] = resulltobj.invoice;
              arraybuy["to"] = resulltobj.to;
              arraybuy["MOP"] = resulltobj.MOP;
              var dt = ((resulltobj.createDate).toString()).split(" ");
              var createDate = dt[2].concat("-", dt[1], "-", dt[3], " ", dt[4]);
              arraybuy["createDate"] = createDate;
              arraybuy["status"] = resulltobj.status;
              arraybuy["totalAmount"] = resulltobj.totalAmount.toJSON().$numberDecimal;
              arraybuy["fName"] = resulltobj.fName;
              arraybuy["lName"] = resulltobj.lName;

              //24K particular

              if (Array.isArray(resulltobj.particularsG24) == true && resulltobj.particularsG24[0].qty.toJSON().$numberDecimal != "0") {
                for (var z = 0; z < resulltobj.particularsG24.length; z++) {
                  var arraybuy24 = {};
                  var from24 = resulltobj.particularsG24[z].from;
                  if (from24 === truid) {
                    arraybuy24["from"] = resulltobj.particularsG24[z].assetmanagerName;
                    arraybuy24["fromTruID"] = resulltobj.particularsG24[z].from;
                    arraybuy24["TID"] = resulltobj.particularsG24[z].TID;
                    arraybuy24["qty"] = resulltobj.particularsG24[z].qty.toJSON().$numberDecimal;
                    arraybuy24["rate"] = resulltobj.particularsG24[z].rate.toJSON().$numberDecimal
                    arraybuy24["tax"] = resulltobj.particularsG24[z].tax.toJSON().$numberDecimal
                    arraybuy24["assetmanagersCharges"] = resulltobj.particularsG24[z].assetmanagersCharges.toJSON().$numberDecimal
                    arraybuy24["total"] = resulltobj.particularsG24[z].total.toJSON().$numberDecimal;
                    arraybuy24["amount"] = resulltobj.particularsG24[z].amount.toJSON().$numberDecimal
                    arr24.push(arraybuy24);
                    arraybuy["particularG24"] = arr24;
                  }
                }
              }
              else if (Array.isArray(resulltobj.particularsG24) == false && resulltobj.particularsG24.qty.toJSON().$numberDecimal != "0"
                && resulltobj.particularsG24.from === truid) {

                var arraybuy24 = {};
                arraybuy24["from"] = resulltobj.particularsG24.assetmanagerName;
                arraybuy24["fromTruID"] = resulltobj.particularsG24.from;
                arraybuy24["TID"] = resulltobj.particularsG24.TID;
                arraybuy24["qty"] = resulltobj.particularsG24.qty.toJSON().$numberDecimal;
                arraybuy24["rate"] = resulltobj.particularsG24.rate.toJSON().$numberDecimal
                arraybuy24["tax"] = resulltobj.particularsG24.tax.toJSON().$numberDecimal
                arraybuy24["assetmanagersCharges"] = resulltobj.particularsG24.assetmanagersCharges.toJSON().$numberDecimal
                arraybuy24["total"] = resulltobj.particularsG24.total.toJSON().$numberDecimal;
                arraybuy24["amount"] = resulltobj.particularsG24.amount.toJSON().$numberDecimal
                arr24.push(arraybuy24);

                arraybuy["particularG24"] = arr24;
              }

              //99P particular
              if (Array.isArray(resulltobj.particularsS99) == true && resulltobj.particularsS99[0].qty.toJSON().$numberDecimal != "0") {
                for (var z = 0; z < resulltobj.particularsS99.length; z++) {
                  var arraybuy99 = {};
                  var from99 = resulltobj.particularsS99[z].from;
                  if (from99 === truid) {
                    arraybuy99["from"] = resulltobj.particularsS99[z].assetmanagerName;
                    arraybuy99["fromTruID"] = resulltobj.particularsS99[z].from;
                    arraybuy99["TID"] = resulltobj.particularsS99[z].TID;
                    arraybuy99["qty"] = resulltobj.particularsS99[z].qty.toJSON().$numberDecimal;
                    arraybuy99["rate"] = resulltobj.particularsS99[z].rate.toJSON().$numberDecimal;
                    arraybuy99["tax"] = resulltobj.particularsS99[z].tax.toJSON().$numberDecimal;
                    arraybuy99["assetmanagersCharges"] = resulltobj.particularsS99[z].assetmanagersCharges.toJSON().$numberDecimal;
                    arraybuy99["total"] = resulltobj.particularsS99[z].total.toJSON().$numberDecimal;
                    arraybuy99["amount"] = resulltobj.particularsS99[z].amount.toJSON().$numberDecimal;
                    arr99.push(arraybuy99);
                    arraybuy["particularS99"] = arr99;
                  }
                }
              }

              else if (Array.isArray(resulltobj.particularsS99) == false && resulltobj.particularsS99.qty.toJSON().$numberDecimal != "0"
                && resulltobj.particularsS99.from === truid) {
                var arraybuy99 = {};
                arraybuy99["from"] = resulltobj.particularsS99.assetmanagerName;
                arraybuy99["fromTruID"] = resulltobj.particularsS99.from;
                arraybuy99["TID"] = resulltobj.particularsS99.TID;
                arraybuy99["qty"] = resulltobj.particularsS99.qty.toJSON().$numberDecimal;
                arraybuy99["rate"] = resulltobj.particularsS99.rate.toJSON().$numberDecimal;
                arraybuy99["tax"] = resulltobj.particularsS99.tax.toJSON().$numberDecimal;
                arraybuy99["assetmanagersCharges"] = resulltobj.particularsS99.assetmanagersCharges.toJSON().$numberDecimal;
                arraybuy99["total"] = resulltobj.particularsS99.total.toJSON().$numberDecimal;
                arraybuy99["amount"] = resulltobj.particularsS99.amount.toJSON().$numberDecimal;
                arr99.push(arraybuy99);

                arraybuy["particularS99"] = arr99;
              }
              return arraybuy;
              // buy.push(arraybuy);
            }

            var Final = {
              "buy": resource.BuyUnit.map(finalResp),
              "buyCash": resource.buyCash.map(finalResp),
              "redeemCash": resource.redeemCash.map(finalResp)
            };
            res.json({ status: "200", resource: Final });
          }
        });
    }
  });
};
exports.customer_to_assetmanager_all_txn_profit_report_datewise = function (req, res) {
  var truid = req.body.truid;
  var startdate = new Date(Date.parse(req.body.startdate));
  var enddate = new Date(Date.parse(req.body.enddate) + (1000 * 3600 * 24));

  request.post({
    "headers": { "content-type": "application/json" },
    "url": conf.reqip + ":4115/api/checkassetmanagerreport",
    "body": JSON.stringify({ "truid": truid })
  }, (error, response, body) => {
    if (error) {
      return console.dir(error);
    }
    var newjson = JSON.parse(body);
    var status = newjson.status;

    if (status === "400") {
      res.json({
        status: "204",
        message: 'The request was successful but no TruID was returned.'
      });
    }
    else {
      TXN.aggregate([
        {
          $match: {
            status: "success", $or: [
              { "particularsG24.from": truid },
              { "particularsS99.from": truid }
            ],
            createDate: { $gte: startdate, $lte: enddate }
          }
        },
        {
          $project: {
            _id: 0, dc24: { $sum: "$particularsG24.assetmanagersCharges" }, dc99: { $sum: "$particularsS99.assetmanagersCharges" }
          }
        },
        {
          $group: {
            _id: "1",
            G24K: { $sum: '$dc24' },
            S99P: { $sum: '$dc99' },
            total: {
              $sum: { $add: ['$dc24', '$dc22', '$dc18', '$dc99'] }

            }
          }
        }]).exec(function (err, result) {
          if (err) {
            res.status(500).send({
              error: err
            })
          } else {
            var profit = new Array();
            if (result.length > 0) {
              var profitDetail = result[0];
              var arrayprofit = {};
              arrayprofit["ID"] = profitDetail._id;
              arrayprofit["G24K"] = profitDetail.G24K.toJSON().$numberDecimal;
              arrayprofit["S99P"] = profitDetail.S99P.toJSON().$numberDecimal;
              arrayprofit["total"] = profitDetail.total.toJSON().$numberDecimal;
              profit.push(arrayprofit)
            }
          }

          res.json({
            status: "200",
            resource: profit
          }
          )
        }
        )
    }
  }
  )
};
exports.print_invoice_admin = function (req, res) {
  let Gen = req.generalCharges;
  var invoice = req.body.invoice;

  if (invoice) {
    var respresult = TXN.aggregate([
      { $match: { "invoice": invoice } },
      {
        $project: {
          invoice: 1, to: 1, from: 1, _id: 0, particularsG24: 1, createDate: 1, sourceFlag: 1,
          particularsS99: 1, totalAmount: 1, status: 1, MOP: 1, type: 1
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
          invoice: 1, to: 1, from: 1, _id: 0, particularsG24: 1, sourceFlag: 1,
          particularsS99: 1, totalAmount: 1, status: 1, MOP: 1, type: 1, createDate: 1,
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
        if (!result || !result.length) {
          res.json({
            status: "204",
            message: 'The request was successful but you enterd wrong invoice number.'
          });
        }
        else {
          var resource = result[0];
          var invoice = resource.invoice;
          var to = resource.to;
          var status = resource.status;
          var address = resource.address;
          var fname = resource.fName;
          var lname = resource.lName;
          var mop = resource.MOP;
          var type = resource.type;
          var dt = ((resource.createDate).toString()).split(" ");
          var createDate = dt[2].concat("-", dt[1], "-", dt[3], " ", dt[4])
          var sourceflag = resource.sourceFlag;

          var particularsG24 = new Array();
          var particularsS99 = new Array();

          function particulars(particulars) {
            var parArr = {};
            parArr["fromTruID"] = particulars.from ? particulars.from : "0";
            parArr["from"] = particulars.assetmanagerName ? particulars.assetmanagerName : "0";
            parArr["qty"] = particulars.qty ? particulars.qty.toJSON().$numberDecimal : "0";
            parArr["rate"] = particulars.rate ? particulars.rate.toJSON().$numberDecimal : "0";
            parArr["amount"] = particulars.amount ? particulars.amount.toJSON().$numberDecimal : "0";
            parArr["assetstoreCharges"] = particulars.assetstoreCharges ? particulars.assetstoreCharges.toJSON().$numberDecimal : "0";
            parArr["transactionCharges"] = particulars.transactionCharges ? particulars.transactionCharges.toJSON().$numberDecimal : "0";
            parArr["clientTransactionCharges"] = particulars.clientTransactionCharges ? particulars.clientTransactionCharges.toJSON().$numberDecimal : "0";
            parArr["assetmanagersCharges"] = particulars.assetmanagersCharges ? particulars.assetmanagersCharges.toJSON().$numberDecimal : "0";
            parArr["otherCharges"] = particulars.otherCharges ? particulars.otherCharges.toJSON().$numberDecimal : "0";
            parArr["partnerCharges"] = particulars.partnerCharges ? particulars.partnerCharges.toJSON().$numberDecimal : "0";
            parArr["nodeCharges"] = particulars.nodeCharges ? particulars.nodeCharges.toJSON().$numberDecimal : "0";
            parArr["remmitCharges"] = particulars.remmitCharges ? particulars.remmitCharges.toJSON().$numberDecimal : "0";
            parArr["transferFee"] = particulars.transferFee ? particulars.transferFee.toJSON().$numberDecimal : "0";
            parArr["tax"] = particulars.tax ? particulars.tax.toJSON().$numberDecimal : "0";
            parArr["total"] = particulars.total ? particulars.total.toJSON().$numberDecimal : "0";
            parArr["bullionType"] = particulars.bullionType ? particulars.bullionType.toJSON().$numberDecimal : "0";
            return parArr;
          }

          if (Array.isArray(resource.particularsG24) == true) {
            for (var z = 0; z < resource.particularsG24.length; z++) {
              particularsG24.push(particulars(resource.particularsG24[z]));
            }
          }
          else if (Array.isArray(resource.particularsG24) == false) {
            particularsG24.push(particulars(resource.particularsG24));
          }



          if (Array.isArray(resource.particularsS99) == true) {
            for (var z = 0; z < resource.particularsS99.length; z++) {
              particularsS99.push(particulars(resource.particularsS99[z]));
            }
          }
          else if (Array.isArray(resource.particularsS99) == false) {
            particularsS99.push(particulars(resource.particularsS99));
          }

          var ta = resource.totalAmount.toJSON().$numberDecimal;


          var ctruid;
          for (var i = 0; i < particularsG24.length; i++) {
            if (particularsG24[i].fromTruID != "0") {
              ctruid = particularsG24[i].fromTruID;
            }
          }

          for (var i = 0; i < particularsS99.length; i++) {
            if (particularsS99[i].fromTruID != "0") {
              ctruid = particularsS99[i].fromTruID;
            }
          }


          var Final = ({
            invoice: invoice, to: to, status: status, address: address, fName: fname, MOP: mop,
            lName: lname, totalAmount: ta, type: type, createDate: createDate,
            particularsG24: particularsG24, particularsS99: particularsS99, sourceFlag: sourceflag
          });

          if (type === "buy" || type === "buyCash") {
            Final.applicableTAX = (Gen.tax * 100).toString();
            Final.applicableOtherCharges = (Gen.othercharges * 100).toString();
            Final.applicableassetmanagerCharges = (Gen.assetmanagercharges * 100).toString();
          } else if (type === "redeemCash") {
            // Final.applicableTAX = (Gen.tax * 100).toString();
            Final.applicableOtherCharges = (Gen.othercharges * 100).toString();
            Final.applicableassetmanagerCharges = (Gen.assetmanagercharges * 100).toString();
          }

          if (status === "success" && mop === "others" && sourceflag === "customer" && (type === "buy" || type === "buyCash")) {
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
          } else if (status === "success" && mop === "others" && sourceflag === "remmit" && (type === "buy" || type === "buyCash")) {
            request.post({
              "headers": { "content-type": "application/json" },
              "url": conf.reqip + ":4121/api/pgdetailsconsumertxnprintinvoice",
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
        }
      }
    }
    )
  }
};
exports.print_invoice_c2c_admin = function (req, res) {
  var invoice = req.body.invoice;
  if (invoice) {
    var respresult = TXN.aggregate([
      { $match: { invoice: invoice } },
      {
        $project:
        {
          invoice: 1, to: 1, from: 1, _id: 0, particularsG24: 1, createDate: 1, sourceFlag: 1,
          particularsS99: 1, totalAmount: 1, status: 1, MOP: 1, type: 1
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
        $lookup: {
          from: "kycs",
          localField: "particularsG24.from",
          foreignField: "truID",
          as: "sender"
        }
      },
      { $unwind: "$sender" },
      {
        $project: {
          invoice: 1, to: 1, from: 1, _id: 0, particularsG24: 1, sourceFlag: 1,
          particularsS99: 1, totalAmount: 1, status: 1, MOP: 1, type: 1, createDate: 1,
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
        if (!result || !result.length) {
          res.json({
            status: "204",
            message: 'The request was successful but you enterd wrong invoice number.'
          });
        }
        else {
          var resource = result[0];

          var invoice = resource.invoice;
          var to = resource.to;
          var status = resource.status;
          var address = resource.address;
          var fname = resource.fName;
          var lname = resource.lName;
          var mop = resource.MOP;
          var type = resource.type;
          var dt = ((resource.createDate).toString()).split(" ");
          var createDate = dt[2].concat("-", dt[1], "-", dt[3], " ", dt[4])
          var assetstoreID = resource.assetstoreID;

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

          request.post({
            "headers": { "content-type": "application/json" },
            "url": conf.reqip + ":4111/api/listprofilefortransaction",

            "body": JSON.stringify({
              "truid": assetstoreID
            })
          }, (error, response, body) => {
            if (error) {
              return console.dir(error);
            }
            var newjson = JSON.parse(body);


            var Final = ({
              "invoice": invoice, "to": to, "status": status, address: address, fName: fname, MOP: mop,
              lName: lname, totalAmount: ta, type: type, "createDate": createDate,
              s_address: s_address, s_fname: s_fname, s_lname: s_lname, s_truID: fromtruid24,
              s_assetstoreID: s_assetstoreID,
              "particularsG24": {
                "TID": tid24, "from": from24, "qty": q24v, "rate": r24v, "amount": a24v, "fromTruID": fromtruid24,
                "assetmanagersCharges": d24v, "otherCharges": o24v, "tax": tx24v, "total": t24v,
              },
              "particularsS99": {
                "TID": tid99, "from": from99, "qty": q99v, "rate": r99v, "amount": a99v, "fromTruID": fromtruid99,
                "assetmanagersCharges": d99v, "otherCharges": o99v, "tax": tx99v, "total": t99v,
              }
            });

            Final.applicableOtherCharges = (Gen.othercharges * 100).toString();


            res.json({ status: "200", resource: Final });
          }
          )
        }
      }
    }
    )
  } else {
    res.json({ status: "204", message: 'Please enter invoice number.' });
  }
};
//     }
//   )
// }
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
};

exports.entity_profit_report = function (req, res) {

  var truid = req.body.truid;
  var startdate = new Date(Date.parse(req.body.startdate));
  var enddate = new Date(Date.parse(req.body.enddate) + (1000 * 3600 * 24));

  TXN.aggregate([
    {
      $facet: {
        remmitReport: [
          { $match: { status: "success", rTruID: truid, createDate: { $gte: startdate, $lte: enddate } } },
          {
            $project: {
              invoice: 1, rTruID: 1, remmitCharges: 1, sourceFlag: 1, status: 1, totalAmount: 1,
              createDate: 1, date: { $dateToString: { format: "%d-%m-%Y", date: "$createDate" } }
            }
          },
          {
            $group: {
              _id: "$date",
              averageSales: { $sum: "$totalAmount" },
              averageCommission: { $sum: "$remmitCharges" }
            }
          },
          { $project: { averageSales: 1, averageCommission: 1, _id: 0, date: { $dateFromString: { dateString: '$_id' } } } },
          { $sort: { date: 1 } }
        ]
      }
    }
  ]).exec(function (err, result) {
    if (err) {
      res.status(500).send({ error: err })
    }
    else {
      if (!result[0].remmitReport.length) {
        res.json({ status: "204", resource: "No data Found!" });
      }
      else {
        var resource = result[0];
        var remmit = new Array();
        for (var i = 0; i < resource.remmitReport.length; i++) {
          var rReport = resource.remmitReport[i];
          var arrayr = {};
          arrayr["date"] = rReport.date;
          arrayr["averageSales"] = rReport.averageSales.toJSON().$numberDecimal;
          arrayr["averageCommission"] = rReport.averageCommission.toJSON().$numberDecimal;
          remmit.push(arrayr);
        }

        var Final = ({ remmitReport: remmit })
        res.json({ status: "200", resource: Final });
      }
    }
  });
};

exports.entity_txn_report_admin = function (req, res) {
  var badd = new Stock(req.user);
  var truid = req.body.truid;

  request.post({
    "headers": { "content-type": "application/json" },
    "url": conf.reqip + ":4121/api/entityvalidation",
    "body": JSON.stringify({ "truid": truid })
  }, (error, response, body) => {
    if (error) {
      return console.dir(error);
    }
    var newjson = JSON.parse(body);
    var status = newjson.status;

    if (status === "400") {
      res.json({
        status: "204",
        message: 'The request was successful but no TruID was returned.'
      });
    }
    else {

      TXN.aggregate([
        {
          $facet: {
            buy: [
              { $match: { rTruID: truid, type: "buy" } },
              {
                $project: {
                  invoice: 1, MOP: 1, otherCharges: 1, _id: 0,
                  particularsG24: 1, particularsS99: 1, rTruID: 1,
                  partnerCharges: { $toDouble: { $sum: ["$particularsG24.partnerCharges", "$particularsS99.partnerCharges"] } },
                  nodeCharges: { $toDouble: { $sum: ["$particularsG24.nodeCharges", "$particularsS99.nodeCharges"] } },
                  remmitCharges: 1, sourceFlag: 1, status: 1, to: 1, totalAmount: 1, type: 1, createDate: 1
                }
              },
              { $sort: { createDate: -1 } },
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
              {
                $project: {
                  invoice: 1, MOP: 1, _id: 0, rTruID: 1,
                  particularsG24: particularjson("particularsG24"), particularsS99: particularjson("particularsS99"),
                  remmitCharges: { $ifNull: [{ $toString: "$remmitCharges" }, "0"] }, sourceFlag: 1, status: 1, to: 1,
                  otherCharges: { $ifNull: [{ $toString: "$otherCharges" }, "0"] }, entityRevenue: { $ifNull: [{ $toString: "$entityRevenue" }, "0"] },
                  totalAmount: { $ifNull: [{ $toString: "$totalAmount" }, "0"] },
                  partnerCharges: { $ifNull: [{ $toString: "$partnerCharges" }, "0"] },
                  nodeCharges: { $ifNull: [{ $toString: "$nodeCharges" }, "0"] }, type: 1, fName: "$cust.fName", lName: "$cust.lName", createDate: 1
                }
              },
            ],
            buyCash: [
              { $match: { rTruID: truid, type: "buyCash" } },
              {
                $project: {
                  invoice: 1, MOP: 1, otherCharges: 1, _id: 0,
                  particularsG24: 1, particularsS99: 1, rTruID: 1,
                  partnerCharges: { $toDouble: { $sum: ["$particularsG24.partnerCharges", "$particularsS99.partnerCharges"] } },
                  nodeCharges: { $toDouble: { $sum: ["$particularsG24.nodeCharges", "$particularsS99.nodeCharges"] } },
                  remmitCharges: 1, sourceFlag: 1, status: 1, to: 1, totalAmount: 1, type: 1, createDate: 1
                }
              },
              { $sort: { createDate: -1 } },
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
              {
                $project: {
                  invoice: 1, MOP: 1, _id: 0, rTruID: 1,
                  particularsG24: particularjson("particularsG24"), particularsS99: particularjson("particularsS99"),
                  remmitCharges: { $ifNull: [{ $toString: "$remmitCharges" }, "0"] }, sourceFlag: 1, status: 1, to: 1,
                  otherCharges: { $ifNull: [{ $toString: "$otherCharges" }, "0"] }, entityRevenue: { $ifNull: [{ $toString: "$entityRevenue" }, "0"] },
                  totalAmount: { $ifNull: [{ $toString: "$totalAmount" }, "0"] },
                  partnerCharges: { $ifNull: [{ $toString: "$partnerCharges" }, "0"] },
                  type: 1, fName: "$cust.fName", lName: "$cust.lName", createDate: 1
                }
              },
            ],
            redeemCash: [
              { $match: { rTruID: truid, type: "redeemCash" } },
              {
                $project: {
                  invoice: 1, MOP: 1, otherCharges: 1, _id: 0, rTruID: 1,
                  particularsG24: 1, particularsS99: 1,
                  partnerCharges: { $toDouble: { $sum: ["$particularsG24.partnerCharges", "$particularsS99.partnerCharges"] } },
                  nodeCharges: { $toDouble: { $sum: ["$particularsG24.nodeCharges", "$particularsS99.nodeCharges"] } },
                  remmitCharges: 1, sourceFlag: 1, status: 1, to: 1, totalAmount: 1, type: 1, createDate: 1
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
              {
                $project: {
                  invoice: 1, MOP: 1, _id: 0, rTruID: 1,
                  particularsG24: particularjson("particularsG24"), particularsS99: particularjson("particularsS99"),
                  otherCharges: { $ifNull: [{ $toString: "$otherCharges" }, "0"] }, entityRevenue: { $ifNull: [{ $toString: "$entityRevenue" }, "0"] },
                  totalAmount: { $ifNull: [{ $toString: "$totalAmount" }, "0"] },
                  partnerCharges: { $ifNull: [{ $toString: "$partnerCharges" }, "0"] },
                  remmitCharges: { $ifNull: [{ $toString: "$remmitCharges" }, "0"] }, sourceFlag: 1, status: 1, to: 1, type: 1, fName: "$cust.fName", lName: "$cust.lName", createDate: 1
                }
              },
            ],
            transfer: [{ $match: { rTruID: truid, type: "transfer" } },
            {
              $project: {
                invoice: 1, MOP: 1, otherCharges: 1, _id: 0, particularsG24: 1, particularsS99: 1, rTruID: 1,
                partnerCharges: { $toDouble: { $sum: ["$particularsG24.partnerCharges", "$particularsS99.partnerCharges"] } },
                nodeCharges: { $toDouble: { $sum: ["$particularsG24.nodeCharges", "$particularsS99.nodeCharges"] } },
                remmitCharges: 1, sourceFlag: 1, status: 1, to: 1, totalAmount: 1, type: 1, createDate: 1
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
            {
              $project: {
                _id: 0, invoice: 1, MOP: 1, rTruID: 1, status: 1, entityRevenue: 1,
                particularsG24: particularjson("particularsG24"), particularsS99: particularjson("particularsS99"),
                otherCharges: { $ifNull: [{ $toString: "$otherCharges" }, "0"] }, entityRevenue: { $ifNull: [{ $toString: "$entityRevenue" }, "0"] },
                totalAmount: { $ifNull: [{ $toString: "$totalAmount" }, "0"] },
                partnerCharges: { $ifNull: [{ $toString: "$partnerCharges" }, "0"] },
                nodeCharges: { $ifNull: [{ $toString: "$nodeCharges" }, "0"] },
                remmitCharges: { $ifNull: [{ $toString: "$remmitCharges" }, "0"] }, sourceFlag: 1, to: 1, type: 1, fName: "$cust.fName", lName: "$cust.lName", createDate: 1
              }
            },
            ],
          }
        }
      ]).exec(function (err, result) {
        if (err) {
          res.status(500).send({
            error: err
          })
        } else {
          var resource = result[0];

          ///////////--------------------------buy Unit-------------------
          var buy = new Array();
          for (var i = 0; i < resource.buy.length; i++) {
            var buydetail = resource.buy[i];
            var arraybuy = {};

            arraybuy["invoice"] = buydetail.invoice;
            arraybuy["rTruID"] = buydetail.rTruID;
            arraybuy["to"] = buydetail.to;
            arraybuy["fName"] = buydetail.fName;
            arraybuy["lName"] = buydetail.lName;
            arraybuy["MOP"] = buydetail.MOP;
            arraybuy["createDate"] = Date.parse(buydetail.createDate);
            arraybuy["totalAmount"] = buydetail.totalAmount;
            arraybuy["remmitCharges"] = buydetail.remmitCharges;
            arraybuy["partnerCharges"] = buydetail.partnerCharges;
            arraybuy["nodeCharges"] = buydetail.nodeCharges;
            arraybuy["entityRevenue"] = buydetail.entityRevenue;
            arraybuy["status"] = buydetail.status;
            arraybuy["type"] = buydetail.type;

            //24K particular
            var g24K = buydetail.particularsG24.qty;
            if (g24K != 0) {
              arraybuy["particularG24"] = buydetail.particularsG24;
            }
            //99P particular
            var g99K = buydetail.particularsS99.qty;
            if (g99K != 0) {
              arraybuy["particularS99"] = buydetail.particularsS99
            }
            buy.push(arraybuy);
          }


          //////////------------------------buy Cash -----------------------------------

          var buyc = new Array();
          for (var i = 0; i < resource.buyCash.length; i++) {
            var buycdetail = resource.buyCash[i];
            var arraybuyc = {};

            arraybuyc["invoice"] = buycdetail.invoice;
            arraybuyc["rTruID"] = buycdetail.rTruID;
            arraybuyc["to"] = buycdetail.to;
            arraybuyc["fName"] = buycdetail.fName;
            arraybuyc["lName"] = buycdetail.lName;
            arraybuyc["MOP"] = buycdetail.MOP;
            arraybuyc["createDate"] = Date.parse(buycdetail.createDate);
            arraybuyc["totalAmount"] = buycdetail.totalAmount;
            arraybuyc["remmitCharges"] = buycdetail.remmitCharges;
            arraybuyc["partnerCharges"] = buycdetail.partnerCharges;
            arraybuyc["nodeCharges"] = buycdetail.nodeCharges;
            arraybuyc["entityRevenue"] = buycdetail.entityRevenue;
            arraybuyc["status"] = buycdetail.status;
            arraybuyc["type"] = buycdetail.type;
            //24K particular
            var g24K = buycdetail.particularsG24.qty;
            if (g24K != 0) {
              arraybuyc["particularG24"] = buycdetail.particularsG24;
            }

            //99P particular
            var g99K = buycdetail.particularsS99.qty;
            if (g99K != 0) {
              arraybuyc["particularS99"] = buycdetail.particularsS99;
            }
            buyc.push(arraybuyc);
          }


          ///------------------------redeemCash-----------------------------
          var redeemCash = new Array();
          for (var i = 0; i < resource.redeemCash.length; i++) {
            var redeemCashdetail = resource.redeemCash[i];
            var arrayredeemCash = {};

            arrayredeemCash["invoice"] = redeemCashdetail.invoice;
            arrayredeemCash["rTruID"] = redeemCashdetail.rTruID;
            arrayredeemCash["to"] = redeemCashdetail.to;
            arrayredeemCash["fName"] = redeemCashdetail.fName;
            arrayredeemCash["lName"] = redeemCashdetail.lName;
            arrayredeemCash["MOP"] = redeemCashdetail.MOP;
            arrayredeemCash["createDate"] = Date.parse(redeemCashdetail.createDate);
            arrayredeemCash["totalAmount"] = redeemCashdetail.totalAmount;
            arrayredeemCash["remmitCharges"] = redeemCashdetail.remmitCharges;
            arrayredeemCash["partnerCharges"] = redeemCashdetail.partnerCharges;
            arrayredeemCash["nodeCharges"] = redeemCashdetail.nodeCharges;
            arrayredeemCash["entityRevenue"] = redeemCashdetail.entityRevenue;
            arrayredeemCash["status"] = redeemCashdetail.status;
            arrayredeemCash["type"] = redeemCashdetail.type;
            //24K particular
            var g24K = redeemCashdetail.particularsG24.qty;
            if (g24K != 0) {
              arrayredeemCash["particularG24"] = redeemCashdetail.particularsG24;
            }

            //99P particular
            var g99K = redeemCashdetail.particularsS99.qty;
            if (g99K != 0) {
              arrayredeemCash["particularS99"] = redeemCashdetail.particularsS99;
            }
            redeemCash.push(arrayredeemCash);
          }



          //////////___________________________Transfer______________________________
          var transfer = new Array();
          for (var i = 0; i < resource.transfer.length; i++) {
            var transferdetail = resource.transfer[i];
            var arraytransfer = {};

            arraytransfer["invoice"] = transferdetail.invoice;
            arraytransfer["rTruID"] = transferdetail.rTruID;
            arraytransfer["to"] = transferdetail.to;
            arraytransfer["fName"] = transferdetail.fName;
            arraytransfer["lName"] = transferdetail.lName;
            arraytransfer["transferer"] = transferdetail.transferer;
            arraytransfer["mobile"] = transferdetail.mobile;
            arraytransfer["MOP"] = transferdetail.MOP;
            arraytransfer["createDate"] = Date.parse(transferdetail.createDate);
            arraytransfer["totalAmount"] = transferdetail.totalAmount;
            arraytransfer["remmitCharges"] = transferdetail.remmitCharges;
            arraytransfer["entityRevenue"] = transferdetail.entityRevenue;
            arraytransfer["partnerCharges"] = transferdetail.partnerCharges;
            arraytransfer["nodeCharges"] = transferdetail.nodeCharges;
            arraytransfer["status"] = transferdetail.status;
            arraytransfer["type"] = transferdetail.type;
            //24K particular
            var g24K = transferdetail.particularsG24.qty;
            if (g24K != 0) {
              arraytransfer["particularG24"] = transferdetail.particularsG24;
            }

            //99P particular
            var g24K = transferdetail.particularsS99.qty;
            if (g24K != 0) {
              arraytransfer["particularS99"] = transferdetail.particularsS99;
            }
            transfer.push(arraytransfer);
          }
          var Final = ({
            "buyUnit": buy,
            "buyCash": buyc,
            "redeemCash": redeemCash,
            "transfer": transfer
          })
          res.json({ status: "200", resource: Final });
        }
      })
    }
  }
  )
};

exports.buy_stock_trend = function (req, res) {


  var truid = req.body.truid;
  var flag = req.body.flag;
  // var date=new Date(Date.parse(req.body.date));
  var resource;
  // var year = date.getFullYear().toString();
  // var month = (date.getMonth() + 1).toString();
  var startdate = new Date(Date.parse(req.body.startdate));
  var enddate = new Date(Date.parse(req.body.enddate) + (1000 * 3600 * 24));

  KycAll.find({ truID: truid }, function (err, docs) {

    if (!docs.length) {
      res.json({
        status: "204",
        message: "The request was successful but no body was returned."
      });
    }
    else {

      if (flag === "default") {
        TXN.aggregate([
          {
            $facet: {
              buyTrends: [
                {
                  $match: {
                    type: { $in: ["buy", "buyCash"] }, status: "success", to: truid,
                    createDate: { $gte: new Date((new Date().getTime() - (30 * 24 * 60 * 60 * 1000))) },
                  }
                },
                {
                  $project: {
                    invoice: 1, createDate: 1, qtyG24: { $sum: "$particularsG24.qty" }, _id: 0,
                    qtyS99: { $sum: "$particularsS99.qty" },
                    date: { $dateToString: { format: "%d-%m-%Y", date: "$createDate" } }
                  }
                },
                {
                  $group: {
                    _id: "$date",
                    qtyG24: { $sum: "$qtyG24" },
                    qtyS99: { $sum: "$qtyS99" }
                  }
                },
                { $project: { qtyG24: 1, qtyS99: 1, _id: 1, date: { $dateFromString: { dateString: "$_id" } } } },
                { $sort: { date: 1 } }
              ]
            }
          }
        ]).exec(function (err, result) {
          if (err) {
            res.status(500).send({ error: err })
          }

          if (!result.length) {
            res.json({ status: "204", resource: "The request was successful but no body was returned." });
          }
          else {
            resource = result[0];
            var buy = new Array();
            for (var i = 0; i < resource.buyTrends.length; i++) {
              var bReport = resource.buyTrends[i];
              var arraybt = {};
              arraybt["date"] = bReport.date;
              arraybt["qtyG24"] = bReport.qtyG24.toJSON().$numberDecimal;

              arraybt["qtyS99"] = bReport.qtyS99.toJSON().$numberDecimal;
              buy.push(arraybt);
            }

            var Final = ({ buyReport: buy })
            res.json({ status: "200", resource: Final });
          }
        });
      }

      else if (flag === "datewise") {
        TXN.aggregate([
          {
            $facet: {
              buyTrends: [
                {
                  $match: {
                    type: { $in: ["buy", "buyCash"] }, status: "success", to: truid,
                    createDate: { $gte: startdate, $lte: enddate }
                  }
                },
                {
                  $project: {
                    invoice: 1, createDate: 1, qtyG24: { $sum: "$particularsG24.qty" }, _id: 0,
                    qtyS99: { $sum: "$particularsS99.qty" },
                    date: { $dateToString: { format: "%d-%m-%Y", date: "$createDate" } }
                    // year : {$dateToString : {format: "%Y", date: "$createDate"}},
                    // month : {$dateToString : {format: "%m", date: "$createDate"}}
                  }
                },
                {
                  $group: {
                    _id: "$date",
                    qtyG24: { $sum: "$qtyG24" },


                    qtyS99: { $sum: "$qtyS99" }
                  }
                },
                { $project: { qtyG24: 1, qtyS99: 1, _id: 1, date: { $dateFromString: { dateString: "$_id" } } } },
                { $sort: { date: 1 } }
              ]
            }
          }
        ]).exec(function (err, result) {
          if (err) {
            res.status(500).send({ error: err })
          }

          if (!result.length) {
            res.json({ status: "204", resource: "The request was successful but no body was returned." });
          }
          else {
            resource = result[0];
            var buy = new Array();
            for (var i = 0; i < resource.buyTrends.length; i++) {
              var bReport = resource.buyTrends[i];
              var arraybt = {};
              arraybt["date"] = bReport.date;
              arraybt["qtyG24"] = bReport.qtyG24.toJSON().$numberDecimal;

              arraybt["qtyS99"] = bReport.qtyS99.toJSON().$numberDecimal;
              buy.push(arraybt);
            }

            var Final = ({ buyReport: buy })
            res.json({ status: "200", resource: Final });
          }
        }
        )
      }

      else {
        res.json({ status: "204", messgae: "something went wrong" });
      }
    }
  }
  )
};

exports.redeem_stock_trend = function (req, res) {

  var truid = req.body.truid;
  var flag = req.body.flag;
  var resource;
  var startdate = new Date(Date.parse(req.body.startdate));
  var enddate = new Date(Date.parse(req.body.enddate) + (1000 * 3600 * 24));

  // KycAll.find({truID : truid,KYCFlag : "active"}, function(err, docs) {
  KycAll.find({ truID: truid }, function (err, docs) {
    if (!docs.length) {
      res.json({
        status: "204",
        message: "The request was successful but no body was returned."
      });
    }
    else {

      if (flag === "default") {
        TXN.aggregate([
          {
            $facet: {
              buyTrends: [
                {
                  $match: {
                    type: "redeemCash", status: "success", to: truid,
                    createDate: { $gte: new Date((new Date().getTime() - (30 * 24 * 60 * 60 * 1000))) },
                    to: truid
                  }
                },
                {
                  $project: {
                    invoice: 1, createDate: 1, qtyG24: { $sum: "$particularsG24.qty" }, _id: 0,
                    qtyS99: { $sum: "$particularsS99.qty" },
                    date: { $dateToString: { format: "%d-%m-%Y", date: "$createDate" } }
                  }
                },
                {
                  $group: {
                    _id: "$date",
                    qtyG24: { $sum: "$qtyG24" },


                    qtyS99: { $sum: "$qtyS99" }
                  }
                },
                { $project: { qtyG24: 1, qtyS99: 1, _id: 1, date: { $dateFromString: { dateString: "$_id" } } } },
                { $sort: { date: 1 } }
              ]
            }
          }
        ]).exec(function (err, result) {
          if (err) {
            res.status(500).send({ error: err })
          }

          if (!result.length) {
            res.json({ status: "204", resource: "The request was successful but no body was returned." });
          }
          else {
            resource = result[0];
            var buy = new Array();
            for (var i = 0; i < resource.buyTrends.length; i++) {
              var bReport = resource.buyTrends[i];
              var arraybt = {};
              arraybt["date"] = bReport.date;
              arraybt["qtyG24"] = bReport.qtyG24.toJSON().$numberDecimal;

              arraybt["qtyS99"] = bReport.qtyS99.toJSON().$numberDecimal;
              buy.push(arraybt);
            }

            var Final = ({ redeemReport: buy })
            res.json({ status: "200", resource: Final });
          }
        }
        )
      }

      else if (flag === "datewise") {
        TXN.aggregate([
          {
            $facet: {
              buyTrends: [

                {
                  $match: {
                    type: "redeemCash", status: "success", to: truid,
                    createDate: { $gte: startdate, $lte: enddate }
                  }
                },
                {
                  $project: {
                    invoice: 1, createDate: 1, qtyG24: { $sum: "$particularsG24.qty" }, _id: 0,
                    qtyS99: { $sum: "$particularsS99.qty" },
                    date: { $dateToString: { format: "%d-%m-%Y", date: "$createDate" } },
                  }
                },
                {
                  $group: {
                    _id: "$date",
                    qtyG24: { $sum: "$qtyG24" },


                    qtyS99: { $sum: "$qtyS99" }
                  }
                },
                { $project: { qtyG24: 1, qtyS99: 1, _id: 1, date: { $dateFromString: { dateString: "$_id" } } } },
                { $sort: { date: 1 } }
              ]
            }
          }
        ]).exec(function (err, result) {
          if (err) {
            res.status(500).send({ error: err })
          }

          if (!result.length) {
            res.json({ status: "204", resource: "The request was successful but no body was returned." });
          }
          else {
            resource = result[0];
            var buy = new Array();
            for (var i = 0; i < resource.buyTrends.length; i++) {
              var bReport = resource.buyTrends[i];
              var arraybt = {};
              arraybt["date"] = bReport.date;
              arraybt["qtyG24"] = bReport.qtyG24.toJSON().$numberDecimal;

              arraybt["qtyS99"] = bReport.qtyS99.toJSON().$numberDecimal;
              buy.push(arraybt);
            }

            var Final = ({ redeemReport: buy })
            res.json({ status: "200", resource: Final });
          }
        });
      }

      else {
        res.json({ status: "204", messgae: "something went wrong" });
      }
    }
  }
  )
};

exports.entity_network_txn_report_admin = function (req, res) {
  var truid = req.body.truid,
    flag = req.body.flag,
    skipvar = parseFloat(req.body.skip);


  request.post({
    "headers": { "content-type": "application/json" },
    "url": conf.reqip + ":4121/api/nodelistinternal",
    "body": JSON.stringify({
      "truid": truid,
      "flag": flag
    })
  }, (error, response, nodelist) => {
    if (error) {
      return console.dir(error);
    }
    var newjson = JSON.parse(nodelist);
    if (newjson.status === "200") {
      var nodelist = newjson.nodelist;
      TXN.aggregate([
        { $match: { rTruID: { $in: nodelist }, sourceFlag: "remmit", status: "success" } },
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
            _id: 0, fName: "$cust.fName", lName: "$cust.lName", invoice: 1, to: 1, MOP: 1, status: 1, type: 1,
            rTruID: 1, createDate: 1, totalAmount: 1, remmitCharges: 1
          }
        }
      ]).exec(function (err, result) {
        if (err) {
          res.status(500).send({
            error: err
          })
        } else {
          getComanyDetails();

          async function getComanyDetails() {
            var buy = new Array();
            var final = {};
            if (result.length) {
              var i = 0;
              for (i; i < result.length; i++) {
                var respobj = result[i];

                respobj.totalAmount = respobj.totalAmount.toJSON().$numberDecimal;
                respobj.remmitCharges = await respobj.remmitCharges.toJSON().$numberDecimal;
                respobj.companyName = await getCompanyName(respobj.rTruID);
                buy.push(respobj);
              }
              if (result.length == i) {
                final = buy;
              }
            }
            res.json({ status: "200", resource: final });
          }
        }


        function getCompanyName(truid) {
          return new Promise((resolve, reject) => {
            request.post({
              "headers": { "content-type": "application/json" },
              "url": conf.reqip + ":4121/api/showaddressinvoice",
              "body": JSON.stringify({
                "truid": truid
              })
            }, (error, response, body) => {
              if (error) {
                reject(error);
              } else {
                var cname = JSON.parse(body).companyName;
                resolve(cname);
              }
            }
            )
          }
          )
        }
      }
      )
    } else {
      res.json(newjson);
    }
  }
  )
};

exports.insatomlog_Refund = async function (req, res) {
  var truid = req.body.truid;
  var docs = [];
  var txnDocs = [];
  if (req.body.isPeople == "consumer" || req.body.isPeople == "remmit") {
    docs = await KycAll.find({ "truID": truid });
    txnDocs = await TXN.aggregate([{ $match: { "invoice": req.body.invoice, "to": truid, "MOP": "others" } }]);
  }
  else {
    docs = await enKycAll.find({ "truID": truid, });
  }
  if (!docs.length) {
    res.json({ status: "204", message: "No record Found" });
  }
  else {
    var atomobj = {};
    atomobj["createDate"] = new Date();
    atomobj["responseCode"] = req.body.responsecode;
    atomobj["refundedAmount"] = req.body.amount;
    atomobj["txnID"] = req.body.txnid;
    atomobj["responseMessage"] = req.body.responsemessage;
    atomobj["particulas"] = req.body.particulas;
    if (req.body.isPeople == "consumer") {
      Atom.findOneAndUpdate({ invoice: req.body.invoice, customerTruID: req.body.truid }, { $set: atomobj }, function (err) {
        if (err) {
          res.json({ status: "204", message: 'Something went wrong!' });
        } else {
          if (req.body.ttype == "addMoney") {
            WalletLog.findOneAndUpdate({ invoice: req.body.invoice, "tType": req.body.ttype }, {
              $set: {
                moneyAdded: false,
                desc: req.body.particulas,
                actionDate: new Date(),
                status: "refund",
                actionBy: req.body.atruid
              }
            }, function (err) {
              res.json({ status: "200", response: req.body.resource });
            })
          }
          else {
            updateINV()
          }
        }
      });


      function updateINV() {
        TXN.findOneAndUpdate({ invoice: req.body.invoice, type: req.body.ttype }, {
          $set: {
            desc: req.body.particulas,
            actionDate: new Date(),
            status: "refund",
            actionBy: req.body.atruid
          }
        }, function (err) {
          res.json({ status: "200", response: req.body });
        })
      }
    }
    else {
      enAtom.findOneAndUpdate({ invoice: req.body.invoice, customerTruID: req.body.truid }, { $set: atomobj }, function (err) {
        if (err) {
          res.json({ status: "204", message: 'Something went wrong!' });
        } else {
          if (req.body.ttype == "addMoney") {
            enWalletLog.findOneAndUpdate({ invoice: req.body.invoice, tType: req.body.ttype }, {
              $set: {
                moneyAdded: false,
                desc: req.body.particulas,
                actionDate: new Date(),
                status: "refund",
                actionBy: req.body.atruid
              }
            }, function (err) {
              res.json({ status: "200", response: req.body.resource });
            })
          }
          else {
            res.json({ status: "200", response: req.body });
          }
        }
      })
    }
  }
};

exports.bankLog_log_report_admin = function (req, res) {
  var matchqry = {};
  var limit = { $limit: 30 }
  if (req.body.flag === "datewise") {
    var startdate = new Date(Date.parse(req.body.startdate));
    var enddate = new Date(Date.parse(req.body.enddate) + (1000 * 3600 * 24));
    matchqry = { createDate: { $gte: startdate, $lte: enddate } };
    limit = {}
  }
  log.aggregate([
    { $match: matchqry },
    { $sort: { createDate: -1 } },
    limit,
    {
      $project: {
        _id: 0, truID: 1, createDate: 1, invoice: 1, TranID: 1, Status: 1, tType: 1, Amount: 1, charges: 1, Mode_of_Pay: 1,
        BenIFSC: 1, Ben_Acct_No: 1, Error_Cde: 1, Error_Desc: 1, PONum: 1, RRN: 1, RefNo: 1, Resp_cde: 1, Txn_Time: 1,
        UTRNo: 1, channelpartnerrefno: 1,
      }
    },
    {
      $lookup: {
        from: "kycs",
        localField: "truID",
        foreignField: "truID",
        as: "cust"
      }
    },
    { $unwind: "$cust" },
    {
      $project: {
        fName: "$cust.fName", lName: "$cust.lName", truID: 1, createDate: 1, invoice: 1, TranID: 1, Status: 1, tType: 1,
        Amount: 1, charges: 1, Mode_of_Pay: 1, BenIFSC: 1, Ben_Acct_No: 1, Error_Cde: 1, Error_Desc: 1, PONum: 1,
        RRN: 1, RefNo: 1, Resp_cde: 1, Txn_Time: 1, UTRNo: 1, channelpartnerrefno: 1,
      }
    },
    {
      $lookup: {
        from: "accounts",
        let: { truid: "$truID", accountno: "$Ben_Acct_No" },
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
    { $unwind: "$bankDetails" },
    {
      $project: {
        fName: 1, lName: 1, truID: 1, createDate: 1, invoice: 1, TranID: 1, Status: 1, tType: 1,
        Amount: 1, charges: 1, Mode_of_Pay: 1, BenIFSC: 1, Ben_Acct_No: 1, Error_Cde: 1, Error_Desc: 1, PONum: 1,
        RRN: 1, RefNo: 1, Resp_cde: 1, Txn_Time: 1, UTRNo: 1, channelpartnerrefno: 1, "bankName": '$bankDetails.accountDetails.bank_name'
      }
    },
  ]).exec(function (err, result) {
    if (err) {
      res.json({ status: "204", message: "Something went wrong!" });
    } else {
      var rslt = new Array();
      function fromServer(i) {
        return new Promise((resolve, reject) => {
          let resltdetail = result[i],
            arrayreslt = {};
          arrayreslt["truID"] = resltdetail.truID ? resltdetail.truID : undefined;
          arrayreslt["createDate"] = resltdetail.createDate ? resltdetail.createDate : undefined;
          arrayreslt["invoice"] = resltdetail.invoice ? resltdetail.invoice : undefined;
          arrayreslt["tranID"] = resltdetail.TranID ? resltdetail.TranID : undefined;
          arrayreslt["status"] = resltdetail.Status ? resltdetail.Status : undefined;
          arrayreslt["tType"] = resltdetail.tType ? resltdetail.tType : undefined;
          arrayreslt["amount"] = resltdetail.Amount ? resltdetail.Amount : undefined;
          arrayreslt["charges"] = resltdetail.charges ? resltdetail.charges : undefined;
          arrayreslt["mode_of_Pay"] = resltdetail.Mode_of_Pay ? resltdetail.Mode_of_Pay : undefined;
          arrayreslt["benIFSC"] = resltdetail.BenIFSC ? resltdetail.BenIFSC : undefined;
          arrayreslt["ben_Acct_No"] = resltdetail.Ben_Acct_No ? resltdetail.Ben_Acct_No : undefined;
          arrayreslt["error_Cde"] = resltdetail.Error_Cde ? resltdetail.Error_Cde : undefined;
          arrayreslt["error_Desc"] = resltdetail.Error_Desc ? resltdetail.Error_Desc : undefined;
          arrayreslt["PONum"] = resltdetail.PONum ? resltdetail.PONum : undefined;
          arrayreslt["RRN"] = resltdetail.RRN ? resltdetail.RRN : undefined;
          arrayreslt["RefNo"] = resltdetail.RefNo ? resltdetail.RefNo : undefined;
          arrayreslt["resp_cde"] = resltdetail.Resp_cde ? resltdetail.Resp_cde : undefined;
          arrayreslt["txn_Time"] = resltdetail.Txn_Time ? resltdetail.Txn_Time : undefined;
          arrayreslt["UTRNo"] = resltdetail.UTRNo ? resltdetail.UTRNo : undefined;
          arrayreslt["channelpartnerrefno"] = resltdetail.channelpartnerrefno ? resltdetail.channelpartnerrefno : undefined;
          arrayreslt["fName"] = resltdetail.fName ? resltdetail.fName : undefined;
          arrayreslt["lName"] = resltdetail.lName ? resltdetail.lName : undefined;
          arrayreslt["bankName"] = resltdetail.bankName ? resltdetail.bankName : undefined;

          rslt.push(arrayreslt);
          resolve(true);

        }
        )
      }

      async function forLoopGood() {
        for (var i = 0; i < result.length; i++) {
          await fromServer(i);
        }

        if (result.length == i) {
          res.json({ status: "200", resource: rslt });
        } else {
          res.json({ status: "204", message: "No records found!" })
        }
      }
      forLoopGood();
    }
  }
  )
};


exports.consumer_gst_report_admin = function (req, res) {
  var query1 = { type: 'buy' };
  var query2 = { type: 'buyCash' };
  var query3 = { type: 'redeemCash' };
  var query4 = { type: 'transfer' };
  var dateFlag = req.body.dateFlag;
  if (req.body.ctruid) {
    if (req.body.dateFlag && req.body.ctruid) {
      var ctruid = req.body.ctruid;
      var startdate = new Date(Date.parse(req.body.startdate));
      var enddate = new Date(Date.parse(req.body.enddate) + (1000 * 3600 * 24));
      query1 = { type: 'buy', to: ctruid, createDate: { $gte: startdate, $lte: enddate } }
      query2 = { type: 'buyCash', to: ctruid, createDate: { $gte: startdate, $lte: enddate } }
      query3 = { type: 'redeemCash', to: ctruid, createDate: { $gte: startdate, $lte: enddate } }
      query4 = { type: 'transfer', to: ctruid, createDate: { $gte: startdate, $lte: enddate } }
    }
    else if (!req.body.dateFlag && req.body.ctruid) {
      var ctruid = req.body.ctruid;
      dateFlag = true;
      query1 = { type: 'buy', to: ctruid }
      query2 = { type: 'buyCash', to: ctruid }
      query3 = { type: 'redeemCash', to: ctruid }
      query4 = { type: 'transfer', to: ctruid }
    }
    else if (req.body.dateFlag) {
      var startdate = new Date(Date.parse(req.body.startdate));
      var enddate = new Date(Date.parse(req.body.enddate) + (1000 * 3600 * 24));
      query1 = { type: 'buy', createDate: { $gte: startdate, $lte: enddate } }
      query2 = { type: 'buyCash', createDate: { $gte: startdate, $lte: enddate } }
      query3 = { type: 'redeemCash', createDate: { $gte: startdate, $lte: enddate } }
      query4 = { type: 'transfer', createDate: { $gte: startdate, $lte: enddate } }
    }
  }
  else {
    if (req.body.dateFlag && req.body.rtruid) {
      var rtruid = req.body.rtruid;
      var startdate = new Date(Date.parse(req.body.startdate));
      var enddate = new Date(Date.parse(req.body.enddate) + (1000 * 3600 * 24));
      query1 = { type: 'buy', rTruID: rtruid, createDate: { $gte: startdate, $lte: enddate } }
      query2 = { type: 'buyCash', rTruID: rtruid, createDate: { $gte: startdate, $lte: enddate } }
      query3 = { type: 'redeemCash', rTruID: rtruid, createDate: { $gte: startdate, $lte: enddate } }
      query4 = { type: 'transfer', rTruID: rtruid, createDate: { $gte: startdate, $lte: enddate } }
    }
    else if (!req.body.dateFlag && req.body.rtruid) {
      var rtruid = req.body.rtruid;
      dateFlag = true;
      query1 = { type: 'buy', rTruID: rtruid }
      query2 = { type: 'buyCash', rTruID: rtruid }
      query3 = { type: 'redeemCash', rTruID: rtruid }
      query4 = { type: 'transfer', rTruID: rtruid }
    }
    else if (req.body.dateFlag) {
      var startdate = new Date(Date.parse(req.body.startdate));
      var enddate = new Date(Date.parse(req.body.enddate) + (1000 * 3600 * 24));
      query1 = { type: 'buy', createDate: { $gte: startdate, $lte: enddate } }
      query2 = { type: 'buyCash', createDate: { $gte: startdate, $lte: enddate } }
      query3 = { type: 'redeemCash', createDate: { $gte: startdate, $lte: enddate } }
      query4 = { type: 'transfer', createDate: { $gte: startdate, $lte: enddate } }
    }
  }

  var ObjectQuery = [
    {
      $project: {
        invoice: 1, MOP: 1, otherCharges: 1, _id: 0,
        particularsG24: 1, particularsS99: 1, rTruID: 1,
        partnerCharges: { $toDouble: { $sum: ["$particularsG24.partnerCharges", "$particularsS99.partnerCharges"] } },
        nodeCharges: { $toDouble: { $sum: ["$particularsG24.nodeCharges", "$particularsS99.nodeCharges"] } },
        remmitCharges: 1, sourceFlag: 1, status: 1, to: 1, totalAmount: 1, type: 1, createDate: 1
      }
    },
    { $sort: { createDate: -1 } },
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
    { $unwind: { path: "$particularsS99", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$particularsG24", preserveNullAndEmptyArrays: true } },
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
      $project:
      {
        invoice: 1, MOP: 1, _id: 0, rTruID: 1,
        particularsG24: particularjson("particularsG24"),
        particularsS99: particularjson("particularsS99"),
        pgType: { $cond: { if: { $eq: ["$MOP", "others"] }, then: "atom", else: "truWallet" } },
        paidBy: { $cond: { if: { $eq: ["$MOP", "others"] }, then: "$atominvoice.MOP", else: "truWallet" } },
        bankTxnID: "$atominvoice.bankTxnID",
        bankName: "$atominvoice.bankName",
        remmitCharges: { $ifNull: [{ $toString: "$remmitCharges" }, "0"] }, sourceFlag: 1, status: 1, to: 1,
        otherCharges: { $ifNull: [{ $toString: "$otherCharges" }, "0"] }, entityRevenue: { $ifNull: [{ $toString: "$entityRevenue" }, "0"] },
        totalAmount: { $ifNull: [{ $toString: "$totalAmount" }, "0"] },
        partnerCharges: { $ifNull: [{ $toString: "$partnerCharges" }, "0"] },
        nodeCharges: { $ifNull: [{ $toString: "$nodeCharges" }, "0"] }, type: 1, fName: "$cust.fName", lName: "$cust.lName", gender: "$cust.gender", createDate: 1
      }
    }

  ];
  var ObjectRedeemCash = [
    { $match: query3 },
    {
      $project: {
        invoice: 1, MOP: 1, otherCharges: 1, _id: 0, rTruID: 1,
        particularsG24: 1, particularsS99: 1,
        partnerCharges: { $toDouble: { $sum: ["$particularsG24.partnerCharges", "$particularsS99.partnerCharges"] } },
        nodeCharges: { $toDouble: { $sum: ["$particularsG24.nodeCharges", "$particularsS99.nodeCharges"] } },
        remmitCharges: 1, sourceFlag: 1, status: 1, to: 1, totalAmount: 1, type: 1, createDate: 1, truID: "$to"
      }
    },
    { $sort: { createDate: -1 } },
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
    { $unwind: { path: "$particularsS99", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$particularsG24", preserveNullAndEmptyArrays: true } },
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
        invoice: 1, MOP: 1, _id: 0, rTruID: 1, type: 1,
        particularsG24: particularjson("particularsG24"),
        particularsS99: particularjson("particularsS99"),
        otherCharges: { $ifNull: [{ $toString: "$otherCharges" }, "0"] },
        entityRevenue: { $ifNull: [{ $toString: "$entityRevenue" }, "0"] },
        totalAmount: { $ifNull: [{ $toString: "$totalAmount" }, "0"] },
        bankName: "$bankDetails.accountDetails.bank_name",
        error_Desc: { $cond: { if: { $eq: ["$MOP", "others"] }, then: "$bankinvoice.error_Desc", else: "" } },
        txnID: { $cond: { if: { $eq: ["$MOP", "others"] }, then: "$bankinvoice.TranID", else: "" } },
        paidBy: { $cond: { if: { $eq: ["$MOP", "others"] }, then: "$bankinvoice.Mode_of_Pay", else: "" } },
        refNo: "$bankinvoice.RefNo",
        pgType: { $cond: { if: { $eq: ["$MOP", "others"] }, then: "bank", else: "truWallet" } },
        accountHolderName: { $cond: { if: { $eq: ["$MOP", "others"] }, then: "$bankDetails.accountDetails.name", else: "" } },
        IFSC: "$bankDetails.accountDetails.IFSC",
        accountNo: "$bankDetails.accountDetails.accountNo",
        partnerCharges: { $ifNull: [{ $toString: "$partnerCharges" }, "0"] },
        remmitCharges: { $ifNull: [{ $toString: "$remmitCharges" }, "0"] },
        sourceFlag: 1, status: 1, to: 1, fName: "$cust.fName", lName: "$cust.lName", gender: "$cust.gender", createDate: 1
      }
    }
  ];
  if (!dateFlag) {
    ObjectQuery.push({ $limit: 30 });
    ObjectRedeemCash.push({ $limit: 30 })
  }
  let api_data = [{ $match: query1 }];
  var buyObject = api_data.concat(ObjectQuery)

  let api_dataCash = [{ $match: query2 }];
  var buyCashObject = api_dataCash.concat(ObjectQuery);

  let api_dataTransfer = [{ $match: query4 }];
  var transferObject = api_dataTransfer.concat(ObjectQuery);

  var DataQuery = TXN.aggregate([
    {
      $facet: {
        buy: buyObject,
        buyCash: buyCashObject,
        redeemCash: ObjectRedeemCash,
        transfer: transferObject,
      }
    }]);
  DataQuery.exec(async function (err, result) {
    if (err) {
      res.status(500).send({ error: err })
    } else {
      if (query1.type) {
        delete query1.type;
      }
      if (query1.to) {
        query1.truID = query1.to;
        delete query1.to;
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

      await Promise.all(result[0].buyCash.map(async (data, index) => {
        var txnglobalRate = txnCharges.filter(d => {
          var timetxn = new Date(d.modifyDate);
          timetxn.setHours(0, 0, 0, 0);
          return data.createDate.getTime() >= timetxn.getTime();
        }).reverse();
        data.taxPer = txnglobalRate.length ? txnglobalRate[0].tax ? (parseFloat(txnglobalRate[0].tax) * 100).toString() : "0" : "0";
        if (data.rTruID) {
          var resul = await enKycAll.findOne({ "truID": data.rTruID });
          data.companyName = resul.companyName;
        }
      }))
      await Promise.all(result[0].buy.map(async (data, index) => {
        var txnglobalRate = txnCharges.filter(d => {
          var timetxn = new Date(d.modifyDate);
          timetxn.setHours(0, 0, 0, 0);
          return data.createDate.getTime() >= timetxn.getTime();
        }).reverse();
        data.taxPer = txnglobalRate.length ? txnglobalRate[0].tax ? (parseFloat(txnglobalRate[0].tax) * 100).toString() : "0" : "0";
        if (data.rTruID) {
          try {
            var resul = await enKycAll.findOne({ "truID": data.rTruID });
            if (resul && resul.companyName) {
              data.companyName = resul.companyName;
            }
          } catch (ex) {
            console.log(ex, resul)
          }

        }
      }))
      await Promise.all(result[0].redeemCash.map(async (data, index) => {
        var txnglobalRate = txnCharges.filter(d => {
          var timetxn = new Date(d.modifyDate);
          timetxn.setHours(0, 0, 0, 0);
          return data.createDate.getTime() >= timetxn.getTime();
        }).reverse();
        data.taxPer = txnglobalRate.length ? txnglobalRate[0].sellTax ? (parseFloat(txnglobalRate[0].sellTax) * 100).toString() : "0" : "0";
        if (data.rTruID) {
          try {
            var resul = await enKycAll.findOne({ "truID": data.rTruID });
            if (resul && resul.companyName) {
              data.companyName = resul.companyName;
            }
          } catch (ex) {
            console.log(ex, resul)
          }
        }
      }))
      await Promise.all(result[0].transfer.map(async (data, index) => {
        var txnglobalRate = txnCharges.filter(d => {
          var timetxn = new Date(d.modifyDate);
          timetxn.setHours(0, 0, 0, 0);
          return data.createDate.getTime() >= timetxn.getTime();
        }).reverse();
        data.taxPer = txnglobalRate.length ? txnglobalRate[0].gstOnTransferFee ? (parseFloat(txnglobalRate[0].gstOnTransferFee) * 100).toString() : "0" : "0";
        if (data.rTruID) {
          try {
            var resul = await enKycAll.findOne({ "truID": data.rTruID });
            if (resul && resul.companyName) {
              data.companyName = resul.companyName;
            }
          } catch (ex) {
            console.log(ex, resul)
          }
        }
      }))
      var respresult = [
        { $match: query1 }, {
          $project: {
            _id: 0, invoice: 1, truID: 1, conversionFrom: 1, conversionTo: 1, amount: 1,
            otherCharges: 1, totalAmount: 1, status: 1, createDate: 1, sourceFlag: 1, MOP: 1
          }
        }, { $sort: { createDate: -1 } }, {
          $lookup: {
            from: "kycs",
            localField: "truID",
            foreignField: "truID",
            as: "cust"
          }
        }, { $unwind: "$cust" }, {
          $lookup: {
            from: "atomlogs",
            localField: "invoice",
            foreignField: "invoice",
            as: "atominvoice"
          }
        }, { $unwind: { path: "$atominvoice", preserveNullAndEmptyArrays: true } }, {
          $project: {
            _id: 0, invoice: 1, truID: 1, conversionFrom: particularjson("conversionFrom"), conversionTo: particularjson("conversionTo"), amount: 1,
            otherCharges: { $ifNull: [{ $toString: "$otherCharges" }, "0"] }, totalAmount: { $ifNull: [{ $toString: "$totalAmount" }, "0"] }, status: 1, createDate: 1, sourceFlag: 1, MOP: 1,
            pgType: { $cond: { if: { $eq: ["$MOP", "others"] }, then: "atom", else: "truWallet" } },
            paidBy: { $cond: { if: { $eq: ["$MOP", "others"] }, then: "$atominvoice.MOP", else: "truWallet" } },
            bankTxnID: "$atominvoice.bankTxnID",
            bankName: "$atominvoice.bankName",
            address: "$cust.permanentAddress", to: "$truID", fName: "$cust.fName", lName: "$cust.lName", gender: "$cust.gender",
            assetstoreID: "$cust.currentassetstore"
          }
        }
      ];

      if (!dateFlag) {
        respresult.push({ $limit: 30 });
      } else {
        res.json({ status: "200", resource: resource });
      }
    }
  })
};

exports.all_wallet_log_report = function (req, res) {
  var matchqry = {};
  if (req.body.flag === "datewise") {
    var startdate = new Date(Date.parse(req.body.startdate));
    var enddate = new Date(Date.parse(req.body.enddate) + (1000 * 3600 * 24));
    matchqry = { createDate: { $gte: startdate, $lte: enddate } };
  }
  WalletLog.aggregate([
    { $match: matchqry },
    { $sort: { _id: -1 } },
    { $limit: 30 },
    { $project: { _id: 0 } },
    {
      $lookup: {
        from: "kycs",
        localField: "truID",
        foreignField: "truID",
        as: "cust"
      }
    },
    { $unwind: "$cust" },
    {
      $project: {
        fName: "$cust.fName", lName: "$cust.lName", truID: 1, Dr: 1, Cr: 1, invoice: 1,
        tType: 1, createDate: 1, particulars: 1, moneyAdded: 1
      }
    }
  ]).exec(function (err, result) {
    if (err) {
      res.json({ status: "204", message: "Something went wrong." });
    } else {
      var responsearr = new Array();
      for (var i = 0; i < result.length; i++) {
        var resultobj = result[i];
        var respobj = {};
        if (resultobj.tType !== "walletToBank") {
          respobj["truID"] = resultobj.truID;
          respobj["fName"] = resultobj.fName;
          respobj["lName"] = resultobj.lName;
          respobj["Cr"] = resultobj.Cr.toJSON().$numberDecimal;
          let dr = resultobj.Dr.toJSON().$numberDecimal ? resultobj.Dr.toJSON().$numberDecimal : 0;

          if (dr != 0 && resultobj.Dr.toJSON().$numberDecimal < 0) {
            respobj["Dr"] = resultobj.Dr.toJSON().$numberDecimal * -1;
          }
          else {
            respobj["Dr"] = resultobj.Dr.toJSON().$numberDecimal;
          }
          respobj["invoice"] = resultobj.invoice;
          respobj["tType"] = resultobj.tType;
          respobj["createDate"] = resultobj.createDate;
          respobj["particulars"] = resultobj.particulars;
          respobj["moneyAdded"] = resultobj.moneyAdded;
          responsearr.push(respobj);
        }


      }
    }
    if (responsearr.length) {
      res.json({ status: "200", resource: responsearr });
    } else {
      res.json({ status: "204", message: "No data found!" });
    }
  }
  )
};


exports.atom_log_report_admin = function (req, res) {
  var matchqry = {};
  if (req.body.flag === "datewise") {
    var startdate = new Date(Date.parse(req.body.startdate));
    var enddate = new Date(Date.parse(req.body.enddate) + (1000 * 3600 * 24));
    matchqry = { createDate: { $gte: startdate, $lte: enddate } };
  }
  Atom.aggregate([
    { $match: matchqry },
    { $sort: { createDate: -1 } },
    // {$limit:30},
    {
      $project: {
        _id: 0, atomID: 1, amount: 1, surcharge: 1, prodid: 1, bankTxnID: 1, status: 1, invoice: 1,
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
        fName: "$cust.fName", lName: "$cust.lName", atomID: 1, amount: 1, surcharge: 1, prodid: 1,
        bankTxnID: 1, status: 1, createDate: 1, customerTruID: 1, bankName: 1, MOP: 1, cardNumber: 1, invoice: 1,
        failureReason: 1, userName: 1, email: 1, mobile: 1, address: 1, tType: 1, atomDate: 1, tStatus: 1
      }
    },
  ]).exec(function (err, result) {
    if (err) {
      res.json({ status: "204", message: "Something went wrong!" });
    } else {
      var rslt = new Array();
      function fromServer(i) {
        return new Promise((resolve, reject) => {
          let resltdetail = result[i],
            arrayreslt = {},
            truid = resltdetail.customerTruID;

          arrayreslt["atomID"] = resltdetail.atomID;
          arrayreslt["invoice"] = resltdetail.invoice;
          arrayreslt["amount"] = resltdetail.amount.toJSON().$numberDecimal;
          arrayreslt["surcharge"] = resltdetail.surcharge.toJSON().$numberDecimal;
          arrayreslt["prodid"] = resltdetail.prodid;
          arrayreslt["bankTxnID"] = resltdetail.bankTxnID;
          arrayreslt["status"] = resltdetail.status;
          arrayreslt["createDate"] = resltdetail.createDate;
          arrayreslt["customerTruID"] = truid;
          arrayreslt["bankName"] = resltdetail.bankName;
          arrayreslt["MOP"] = resltdetail.MOP;
          arrayreslt["cardNumber"] = resltdetail.cardNumber;
          arrayreslt["failureReason"] = resltdetail.failureReason;
          arrayreslt["userName"] = resltdetail.userName;
          arrayreslt["email"] = resltdetail.email;
          arrayreslt["mobile"] = resltdetail.mobile;
          arrayreslt["address"] = resltdetail.address;
          arrayreslt["tType"] = resltdetail.tType;
          arrayreslt["atomDate"] = resltdetail.atomDate;
          arrayreslt["tStatus"] = resltdetail.tStatus;
          arrayreslt["fName"] = resltdetail.fName;
          arrayreslt["lName"] = resltdetail.lName;

          //   var refFlag = "consumer";
          //     if(truid){
          //     var rid = truid.substring(0, 4);
          //     if(rid === '5000'){
          //       refFlag = "consumer";
          //     }else if(rid === '6000'){
          //       refFlag = "assetmanager";
          //     }else if(rid === '8000'){
          //     refFlag = "entity";
          //   }

          // }
          rslt.push(arrayreslt);
          resolve(true);

        }
        )
      }

      async function forLoopGood() {
        for (var i = 0; i < result.length; i++) {
          await fromServer(i);
        }

        if (result.length == i) {
          //  var resparr = new Array();
          //  for(var j=0;j<rslt.length;j++){
          //   var rsltobj = rslt[j];
          //       if(rsltobj.refFlag != "direct"){
          //         await getDetails(rsltobj.refFlag,rsltobj.referenceTruID).then((retobj)=>{
          //           if(rsltobj.refFlag === "consumer" ){

          //           rsltobj.refFName = retobj.fName;
          //           rsltobj.refLName = retobj.lName;
          //           }
          //           if(rsltobj.refFlag === "entity" ){
          //           rsltobj.companyName = retobj.companyName;
          //           }
          //           if(rsltobj.refFlag === "assetmanager"){     
          //             rsltobj.assetmanagerName = retobj.assetmanagerName;
          //           }
          //         })
          //       }
          //       resparr.push(rsltobj);
          //  }
          res.json({ status: "200", resource: rslt });
        } else {
          res.json({ status: "204", message: "No records found!" })
        }
      }
      forLoopGood();

      // function getDetails(refFlag, truid) {
      //   var requri = conf.reqip + ":4112/api/consumervalidation";
      //    if(refFlag === "consumer"){
      //     requri = conf.reqip + ":4112/api/consumervalidation";
      //    }else if(refFlag === "assetmanager"){
      //     requri = conf.reqip + ":4115/api/assetmanagervalidation";
      //    }else if(refFlag === "entity"){
      //     requri = conf.reqip + ":4121/api/entityvalidation";
      //    }else if(refFlag === "assetstore"){
      //     requri = conf.reqip + ":4111/api/assetstorevalidation";
      //    }else if(refFlag === "admin"){
      //     requri = conf.reqip + ":5112/api/adminvalidation";
      //    }else{
      //     requri = conf.reqip + ":4112/api/consumervalidation";
      //    } 
      //   return new Promise((resolve, reject) => {
      //              request.post({
      //              "headers": { "content-type": "application/json" },
      //              "url": requri,
      //              "body": JSON.stringify({
      //                  "truid" : truid,
      //                  "flag":"admin"
      //                })
      //              }, (error, response, body) => {
      //                if(error) {
      //                 console.log(error);
      //                }
      //                else{
      //                  var detail = JSON.parse(body);
      //                  resolve(detail);
      //                }
      //              }
      //            )
      //          }
      //        )
      //      }
    }
  })
};

exports.consumer_partner_revenue = function (req, res) {
  // console.log("req.body",req.body)
  function getDates(n) {
    let today = new Date();
    let priorDate = new Date().setDate(today.getDate() - n);
    let ndats = new Date(priorDate).setHours(0, 0, 0, 0);
    return new Date(ndats);
  }
  var todaydt = getDates(0);
  var yesterdaydt = getDates(1);
  var weekdt = getDates(7);
  var monthdt = getDates(30);
  //console.log(todaydt, yesterdaydt, weekdt, monthdt)


  function particularQuery(particulars) {
    return {
      "transactionCharges": { $ifNull: [{ $toDouble: "$" + particulars + ".transactionCharges" }, { $toDouble: "$" + particulars + ".assetmanagersCharges" }] },
      "otherCharges": { $ifNull: [{ $toDouble: "$" + particulars + ".otherCharges" }, 0] },
      "partnerCharges": { $ifNull: [{ $toDouble: "$" + particulars + ".partnerCharges" }, 0] },
      "clientTransactionCharges": { $ifNull: [{ $toDouble: "$" + particulars + ".clientTransactionCharges" }, 0] }
    }
  }

  function transferparticularQuery(particulars) {
    return {
      "transactionCharges": { $ifNull: [{ $toDouble: "$" + particulars + ".transactionCharges" }, { $toDouble: "$" + particulars + ".otherCharges" }] },
      "otherCharges": { $ifNull: [{ $toDouble: "$" + particulars + ".otherCharges" }, 0] },
      "partnerCharges": { $ifNull: [{ $toDouble: "$" + particulars + ".partnerCharges" }, 0] },
      "clientTransactionCharges": { $ifNull: [{ $toDouble: "$" + particulars + ".clientTransactionCharges" }, 0] }
    }
  }

  var revenueQuery = [
    { $unwind: { path: "$particularsS99", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$particularsG24", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        invoice: 1, MOP: 1, otherCharges: 1, _id: 0, rTruID: 1,
        "particularsS99": { $cond: { if: { $eq: ["$type", "transfer"] }, then: transferparticularQuery("particularsS99"), else: particularQuery("particularsS99") } },
        "particularsG24": { $cond: { if: { $eq: ["$type", "transfer"] }, then: transferparticularQuery("particularsG24"), else: particularQuery("particularsG24") } },
        remmitCharges: 1, sourceFlag: 1, status: 1, to: 1, totalAmount: 1, type: 1, createDate: 1
      },
    },
    {
      $project: {
        invoice: 1, MOP: 1, otherCharges: 1, _id: 0, rTruID: 1, type: 1,

        revenue: {
          $cond: {
            if: {
              $eq: ["$type", "transfer"]
            }, then: {
              $toDouble: {
                $subtract: [{
                  $toDouble: {
                    $sum: [
                      { $ifNull: ["$particularsG24.transactionCharges", 0] },
                      { $ifNull: ["$particularsS99.transactionCharges", 0] },
                      { $ifNull: ["$particularsG24.clientTransactionCharges", 0] },
                      { $ifNull: ["$particularsS99.clientTransactionCharges", 0] },
                      { $ifNull: ["$particularsG24.txnLoading", 0] },
                      { $ifNull: ["$particularsS99.txnLoading", 0] }
                    ]
                  }
                },
                {
                  $toDouble: {
                    $sum: [
                      { $ifNull: ["$particularsG24.partnerCharges", 0] },
                      { $ifNull: ["$particularsS99.partnerCharges", 0] },
                      { $ifNull: ["$particularsG24.nodeCharges", 0] },
                      { $ifNull: ["$particularsS99.nodeCharges", 0] }
                    ]
                  }
                }]
              }
            }, else: {
              $toDouble: {
                $subtract: [{
                  $toDouble: {
                    $sum: [
                      { $ifNull: ["$particularsG24.transactionCharges", 0] },
                      { $ifNull: ["$particularsS99.transactionCharges", 0] },
                      { $ifNull: ["$particularsG24.clientTransactionCharges", 0] },
                      { $ifNull: ["$particularsS99.clientTransactionCharges", 0] },
                      { $ifNull: ["$particularsG24.txnLoading", 0] },
                      { $ifNull: ["$particularsS99.txnLoading", 0] }
                    ]
                  }
                },
                {
                  $toDouble: {
                    $sum: [
                      { $ifNull: ["$particularsG24.partnerCharges", 0] },
                      { $ifNull: ["$particularsS99.partnerCharges", 0] },
                      { $ifNull: ["$particularsG24.nodeCharges", 0] },
                      { $ifNull: ["$particularsS99.nodeCharges", 0] }
                    ]
                  }
                }]
              }
            }
          }
        },
        remmitCharges: 1, sourceFlag: 1, status: 1, to: 1, totalAmount: 1, createDate: 1
      }
    }]

  var partnerRevenuegroup = [{
    $group: {
      _id: "$rTruID",
      totalAmount: { $sum: "$totalAmount" },
      revenue: { $sum: "$revenue" }
    }
  },
  { $sort: { "totalAmount": -1 } },
  { $limit: 5 },
  {
    $project: { rTruID: "$_id", totalAmount: { $toString: "$totalAmount" }, revenue: { $toString: "$revenue" } }
  }];
  var totalrevenueGroup = [{
    $group:
    {
      _id: null,
      totalAmount: { $sum: "$totalAmount" },
      otherCharges: { $sum: "$otherCharges" },
      partnerCharges: { $sum: "$partnerCharges" },
      revenue: { $sum: "$revenue" }
    }
  },
  {
    $project: {
      _id: 0, revenue: { $toString: "$revenue" }, partnerCharges: { $toString: "$partnerCharges" }
    }
  }];
  var startdate = new Date(Date.parse(req.body.startDate));
  var enddate = new Date(Date.parse(req.body.endDate));
  var topfiveconsumerquerydatewide = req.body.dateFlag ? { $match: { status: "success", createDate: { $gte: startdate, $lte: enddate } } } : { $match: { status: "success" } };
  var partnerRevenueQuery = req.body.dateFlag ? [{ $match: { rTruID: { $ne: null }, status: "success", createDate: { $gte: startdate, $lte: enddate } } }] : [{ $match: { rTruID: { $ne: null }, status: "success" } }];
  var isPartner = req.body.flag;
  var totalrevenueQuery = [{ $match: { status: "success" } }];
  var todayrevenueQuery = [{ $match: { status: "success", createDate: { $gte: todaydt } } }];
  var yesterdayrevenueQuery = [{ $match: { status: "success", createDate: { $gte: yesterdaydt, $lte: todaydt } } }];
  var weeklyrevenueQuery = [{ $match: { status: "success", createDate: { $gte: weekdt } } }];
  var monthlyrevenueQuery = [{ $match: { status: "success", createDate: { $gte: monthdt } } }];

  if (isPartner == "company") {
    totalrevenueQuery[0].$match.sourceFlag = "customer";
    totalrevenueQuery[0].$match.rTruID = { $eq: "customer" };
    todayrevenueQuery[0].$match.rTruID = { $eq: "customer" };
    yesterdayrevenueQuery[0].$match.rTruID = { $eq: "customer" };
    weeklyrevenueQuery[0].$match.rTruID = { $eq: "customer" };
    monthlyrevenueQuery[0].$match.rTruID = { $eq: "customer" };
    todayrevenueQuery[0].$match.sourceFlag = "customer";
    yesterdayrevenueQuery[0].$match.sourceFlag = "customer";
    weeklyrevenueQuery[0].$match.sourceFlag = "customer";
    monthlyrevenueQuery[0].$match.sourceFlag = "customer";
  }
  else if (req.body.rTruID) {
    totalrevenueQuery[0].$match.rTruID = req.body.rTruID;
    todayrevenueQuery[0].$match.rTruID = req.body.rTruID;
    yesterdayrevenueQuery[0].$match.rTruID = req.body.rTruID;
    weeklyrevenueQuery[0].$match.rTruID = req.body.rTruID;
    monthlyrevenueQuery[0].$match.rTruID = req.body.rTruID;
  }
  var partnerRevenueQueryFinal = (partnerRevenueQuery.concat(revenueQuery)).concat(partnerRevenuegroup);
  var totalrevenueQueryFinal = (totalrevenueQuery.concat(revenueQuery)).concat(totalrevenueGroup);
  var todayrevenueQueryFinal = (todayrevenueQuery.concat(revenueQuery)).concat(totalrevenueGroup);
  var yesterdayrevenueQueryFinal = (yesterdayrevenueQuery.concat(revenueQuery)).concat(totalrevenueGroup);
  var weeklyrevenueQueryFinal = (weeklyrevenueQuery.concat(revenueQuery)).concat(totalrevenueGroup);
  var monthlyrevenueQueryFinal = (monthlyrevenueQuery.concat(revenueQuery)).concat(totalrevenueGroup);
  TXN.aggregate([{
    $facet: {
      partnerRevenue: partnerRevenueQueryFinal,
      topfiveConsumers: [
        topfiveconsumerquerydatewide,
        { $unwind: { path: "$particularsG24", preserveNullAndEmptyArrays: true } },
        { $unwind: { path: "$particularsS99", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 0, to: 1, totalAmount: 1, s99qty: "$particularsS99.qty", g24qty: "$particularsG24.qty", invoice: 1, type: 1
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
            _id: 0, consumerName: { $concat: ["$cust.fName", " ", "$cust.lName"] }, truID: "$to",
            totalAmount: 1, invoice: 1, s99qty: 1, g24qty: 1, type: 1
          }
        },
        {
          $sort: { "totalAmount": -1 }
        },
        {
          $limit: 5
        },
        {
          $project: {
            _id: 0, consumerName: 1, truID: 1,
            totalAmount: { $toString: "$totalAmount" }, invoice: 1, s99qty: { $toString: "$s99qty" }, g24qty: { $toString: "$g24qty" }, type: 1
          }
        }
      ],
      totalRevenue: totalrevenueQueryFinal,
      todayRevenue: todayrevenueQueryFinal,
      yesterdayRevenue: yesterdayrevenueQueryFinal,
      weekRevenue: weeklyrevenueQueryFinal,
      monthRevenue: monthlyrevenueQueryFinal,
    }
  }]).exec(async function (err, result) {
    if (err) {
      res.status(500).send({
        error: err
      })
    } else {
      await Promise.all(result[0].partnerRevenue.map(async (data, index) => {
        if (data.rTruID && data.rTruID !== "customer") {
          var resul = await enKycAll.findOne({ "truID": data.rTruID });
          data.companyName = resul && resul.companyName ? resul.companyName : "";
        }
      }))
      var resource = result[0];
      res.json({ status: "200", resource: resource });

    }
  })
}

exports.consumer_partner_payouts = function (req, res) {
  function getDates(n) {
    let today = new Date();
    let priorDate = new Date().setDate(today.getDate() - n);
    let ndats = new Date(priorDate).setHours(0, 0, 0, 0);
    return new Date(ndats);
  }

  var todaydt = getDates(0);
  var yesterdaydt = getDates(1);
  var weekdt = getDates(7);
  var monthdt = getDates(30);
  var totalPayout = 0,
    todayPayout = 0,
    yesterdayPayout = 0,
    weekPayout = 0,
    monthPayout = 0;
  var query = {
    $facet: {
      totalPayout: [{ $match: { Status: { $in: ["Success", "Initiated", "ON HOLD"] } } },
      { $project: { Amount: { $toDouble: "$Amount" } } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$Amount" }
        }
      },
      { $project: { _id: 0, totalAmount: { $toDouble: "$totalAmount" } } }
      ],
      todayPayout: [{ $match: { Status: { $in: ["Success", "Initiated", "ON HOLD"] }, createDate: { $gte: todaydt } } },
      { $project: { Amount: { $toDouble: "$Amount" } } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$Amount" }
        }
      },
      { $project: { _id: 0, totalAmount: { $toDouble: "$totalAmount" } } }
      ],
      yesterdayPayout: [{ $match: { Status: { $in: ["Success", "Initiated", "ON HOLD"] }, createDate: { $gte: yesterdaydt } } },
      { $project: { Amount: { $toDouble: "$Amount" } } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$Amount" }
        }
      },
      { $project: { _id: 0, totalAmount: { $toDouble: "$totalAmount" } } }
      ],
      weekPayout: [{ $match: { Status: { $in: ["Success", "Initiated", "ON HOLD"] }, createDate: { $gte: weekdt } } },
      { $project: { Amount: { $toDouble: "$Amount" } } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$Amount" }
        }
      },
      { $project: { _id: 0, totalAmount: { $toDouble: "$totalAmount" } } }
      ],
      monthPayout: [{ $match: { Status: { $in: ["Success", "Initiated", "ON HOLD"] }, createDate: { $gte: monthdt } } },
      { $project: { Amount: { $toDouble: "$Amount" } } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$Amount" }
        }
      },
      { $project: { _id: 0, totalAmount: { $toDouble: "$totalAmount" } } }
      ]
    }
  };
  log.aggregate([
    query
  ]).exec(function (err, result) {
    if (err) {
      res.json({ status: "500", message: "Internal server error" });
    } else {
      totalPayout += result[0].totalPayout.length ? result[0].totalPayout[0].totalAmount : 0;
      todayPayout += result[0].todayPayout.length ? result[0].todayPayout[0].totalAmount : 0;
      yesterdayPayout += result[0].yesterdayPayout.length ? result[0].yesterdayPayout[0].totalAmount : 0;
      weekPayout += result[0].weekPayout.length ? result[0].weekPayout[0].totalAmount : 0;
      monthPayout += result[0].monthPayout.length ? result[0].monthPayout[0].totalAmount : 0;
      enlog.aggregate([
        query
      ]).exec(function (err, resultnew) {
        if (err) {
          res.json({ status: "500", message: "Internal server error" });
        } else {
          totalPayout += result[0].totalPayout.length ? result[0].totalPayout[0].totalAmount : 0;
          todayPayout += result[0].todayPayout.length ? result[0].todayPayout[0].totalAmount : 0;
          yesterdayPayout += result[0].yesterdayPayout.length ? result[0].yesterdayPayout[0].totalAmount : 0;
          weekPayout += result[0].weekPayout.length ? result[0].weekPayout[0].totalAmount : 0;
          monthPayout += result[0].monthPayout.length ? result[0].monthPayout[0].totalAmount : 0;
          res.json({
            status: "200", resource: {
              totalPayout: totalPayout,
              todayPayout: todayPayout,
              yesterdayPayout: yesterdayPayout,
              weekPayout: weekPayout,
              monthPayout: monthPayout,
            }
          });
        }
      })
    }
  })
}
exports.Update_KYCDocs_from_admin = function (req, res) {
  var truidcsr = req.body.truid;
  var query = { $or: [{ truID: truidcsr }, { CRNNo: truidcsr }] };
  var uploaded = new Array();
  var notuploaded = new Array();
  KycAll.find(
    query, function (err, docs) {
      if (!docs.length) {
        res.json({
          status: "204",
          message: "The request was successful but no body was returned."
        });
      }
      else {
        var truid = docs[0].truID;
        if (!docs[0].KYCDetails.length) {
          KycAll.findOneAndUpdate({ "truID": truid }, { $set: { KYCDetails: req.body.kycdetails, KYCFlag: "active", aadharStatus: "pending", panStatus: "pending" } }, callback)
        }
        else {
          uploadDocs();
          async function uploadDocs() {
            for (var i = 0; i < req.body.kycdetails.length; i++) {
              await updateDocsDetails(req.body.kycdetails[i])
            }
            if (uploaded.length) {
              if (notuploaded.length) {
                res.json({ status: "200", message: "Files Uploaded Successfully.", reason: notuploaded });
              } else {
                res.json({ status: "200", message: "Files Uploaded Successfully." });
              }

            }
            else if (notuploaded.length) {
              res.json({ status: "204", message: "Files Not Uploaded.", reason: notuploaded });
            } else {
              res.json({ status: "204", message: "Files Not Uploaded." });
            }

          }
          function updateDocsDetails(kycdetail) {
            return new Promise((resolve, reject) => {
              KycAll.aggregate([
                { $match: { "truID": truid } },
                { $project: { truID: 1, KYCFlag: 1, docVerified: 1, aadharStatus: 1, panStatus: 1, KYCDetails: 1 } },
                { $unwind: "$KYCDetails" },
                { $match: { "KYCDetails.docTitle": kycdetail.docTitle } }
              ]).exec(function (err, resp) {
                if (err) {
                  res.json({ status: "500", message: "Internal server Error." });
                }
                else {
                  if (!resp.length) {
                    KycAll.findOneAndUpdate({ "truID": truid }, {
                      $addToSet: {
                        KYCDetails: kycdetail
                      }
                    }, { upsert: true }, callback)
                  }
                  else {
                    function upld() {
                      KycAll.findOneAndUpdate({ "truID": truid, "KYCDetails.docTitle": kycdetail.docTitle }, {
                        $set: {
                          "KYCDetails.$": kycdetail
                        }
                      }, { upsert: true }, function (err, response) {
                        if (err) {
                          resolve(notuploaded.push(kycdetail));
                        }
                        else {
                          resolve(uploaded.push(kycdetail.docTitle));
                        }

                      })
                    }
                    if (kycdetail.docTitle === "Aadhaar") {
                      if (resp[0].aadharStatus && resp[0].aadharStatus === "active") {
                        resolve(notuploaded.push("Aadhaar Already Verified"));
                      } else {
                        upld()
                      }
                    }
                    else {
                      if (resp[0].panStatus && resp[0].panStatus === "active") {
                        resolve(notuploaded.push("PAN Already Verified"));
                      } else {
                        upld()
                      }
                    }
                  }
                }

              })
            })
          }
        }
        function callback(err, numAffected) {
          if (err) {
            res.json({ status: "204", message: "Something went wrong." });
          }
          else {
            res.json({ status: "200", message: "Files Uploaded Successfully.", resource: req.body.kycdetails });
          }
        }
      }
    }
  )
}

exports.cust_Invoice_Preview = function (req, res) {


  var query3 = { "invoice": req.body.invoice, "type": req.body.type, "truID": req.body.truID };
  var ObjectQuery = [
    { $match: query3 },
    {
      $project: {
        invoice: 1, MOP: 1, otherCharges: 1, _id: 0,
        particularsG24: 1, particularsS99: 1, rTruID: 1,
        partnerCharges: { $toDouble: { $sum: ["$particularsG24.partnerCharges", "$particularsS99.partnerCharges"] } },
        nodeCharges: { $toDouble: { $sum: ["$particularsG24.nodeCharges", "$particularsS99.nodeCharges"] } },
        remmitCharges: 1, sourceFlag: 1, status: 1, to: 1, totalAmount: 1, type: 1, createDate: 1
      }
    },
    { $sort: { createDate: -1 } },
    { $limit: 1 },
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
    { $unwind: { path: "$particularsS99", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$particularsG24", preserveNullAndEmptyArrays: true } },
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
      $project:
      {
        invoice: 1, MOP: 1, _id: 0, rTruID: 1,
        particularsG24: particularjson("particularsG24"),
        particularsS99: particularjson("particularsS99"),
        pgType: { $cond: { if: { $eq: ["$MOP", "others"] }, then: "atom", else: "truWallet" } },
        paidBy: { $cond: { if: { $eq: ["$MOP", "others"] }, then: "$atominvoice.MOP", else: "truWallet" } },
        bankTxnID: "$atominvoice.bankTxnID",
        bankName: "$atominvoice.bankName",
        remmitCharges: { $ifNull: [{ $toString: "$remmitCharges" }, "0"] }, sourceFlag: 1, status: 1, to: 1,
        otherCharges: { $ifNull: [{ $toString: "$otherCharges" }, "0"] }, entityRevenue: { $ifNull: [{ $toString: "$entityRevenue" }, "0"] },
        totalAmount: { $ifNull: [{ $toString: "$totalAmount" }, "0"] },
        partnerCharges: { $ifNull: [{ $toString: "$partnerCharges" }, "0"] },
        nodeCharges: { $ifNull: [{ $toString: "$nodeCharges" }, "0"] }, type: 1, fName: "$cust.fName", lName: "$cust.lName", gender: "$cust.gender", createDate: 1
      }
    }

  ];
  if (req.body.type == "redeemCash") {
    ObjectQuery = [
      { $match: query3 },
      { $limit: 1 },
      {
        $project: {
          invoice: 1, MOP: 1, otherCharges: 1, _id: 0, rTruID: 1,
          particularsG24: 1, particularsS99: 1,
          partnerCharges: { $toDouble: { $sum: ["$particularsG24.partnerCharges", "$particularsS99.partnerCharges"] } },
          nodeCharges: { $toDouble: { $sum: ["$particularsG24.nodeCharges", "$particularsS99.nodeCharges"] } },
          remmitCharges: 1, sourceFlag: 1, status: 1, to: 1, totalAmount: 1, type: 1, createDate: 1, truID: "$to"
        }
      },
      { $sort: { createDate: -1 } },
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
      { $unwind: { path: "$particularsS99", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$particularsG24", preserveNullAndEmptyArrays: true } },
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
          invoice: 1, MOP: 1, _id: 0, rTruID: 1, type: 1,
          particularsG24: particularjson("particularsG24"),
          particularsS99: particularjson("particularsS99"),
          otherCharges: { $ifNull: [{ $toString: "$otherCharges" }, "0"] },
          entityRevenue: { $ifNull: [{ $toString: "$entityRevenue" }, "0"] },
          totalAmount: { $ifNull: [{ $toString: "$totalAmount" }, "0"] },
          bankName: "$bankDetails.accountDetails.bank_name",
          txnID: { $cond: { if: { $eq: ["$MOP", "others"] }, then: "$bankinvoice.TranID", else: "" } },
          paidBy: { $cond: { if: { $eq: ["$MOP", "others"] }, then: "$bankinvoice.Mode_of_Pay", else: "" } },
          refNo: "$bankinvoice.RefNo",
          pgType: { $cond: { if: { $eq: ["$MOP", "others"] }, then: "bank", else: "truWallet" } },
          accountHolderName: { $cond: { if: { $eq: ["$MOP", "others"] }, then: "$bankDetails.accountDetails.name", else: "" } },
          IFSC: "$bankDetails.accountDetails.IFSC",
          accountNo: "$bankDetails.accountDetails.accountNo",
          partnerCharges: { $ifNull: [{ $toString: "$partnerCharges" }, "0"] },
          remmitCharges: { $ifNull: [{ $toString: "$remmitCharges" }, "0"] },
          sourceFlag: 1, status: 1, to: 1, fName: "$cust.fName", lName: "$cust.lName", gender: "$cust.gender", createDate: 1
        }
      }
    ];
    var DataQuery = TXN.aggregate([
      {
        $facet: {
          invoice: ObjectQuery
        }
      }]);
  }
  DataQuery.exec(async function (err, result) {
    if (err) {
      res.status(500).send({ error: err })
    } else {
      var date = result[0].createDate;
      var txnCharges = await CallCharges(date);
      function CallCharges(date) {
        return new Promise((resolve, reject) => {
          request.post({
            "headers": { "content-type": "application/json" },
            "url": conf.adminReqIP + ":5112/api/getAllChargesDateWise",
            "body": JSON.stringify({ date: date })
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
      //buy
      result[0].taxPer = txnCharges.tax ? (parseFloat(txnCharges.tax) * 100).toString() : "0";
      var resource = result[0];
      res.json({ status: "200", resource: resource });
    }
  })
};

exports.consumer_Permission = function (req, res) {
  var truID = req.body.truID;
  var ctruid = req.body.cTruID;

  var permissonobj = {};
  req.body.buy ? permissonobj["buy"] = req.body.buy : undefined;
  req.body.redeemCash ? permissonobj["redeemCash"] = req.body.redeemCash : undefined;
  req.body.transfer ? permissonobj["transfer"] = req.body.transfer : undefined;
  req.body.redeemToBank ? permissonobj["redeemToBank"] = req.body.redeemToBank : undefined;
  req.body.redeemToWallet ? permissonobj["redeemToWallet"] = req.body.redeemToWallet : undefined;
  req.body.walletToBank ? permissonobj["walletToBank"] = req.body.walletToBank : undefined;
  req.body.walletAccess ? permissonobj["walletAccess"] = req.body.walletAccess : undefined;
  req.body.payByWallet ? permissonobj["payByWallet"] = req.body.payByWallet : undefined;
  req.body.login ? permissonobj["login"] = req.body.login : undefined;
  req.body.linkbank ? permissonobj["linkbank"] = req.body.linkbank : undefined;
  req.body.paymentModeAccess ? permissonobj["paymentModeAccess"] = req.body.paymentModeAccess : undefined;

  permission.find({ truID: ctruid }).exec(function (err, result) {
    if (err) {
      console.log("eer2", err);
      res.json({ status: "500", message: "Internal Server Error" });
    } else {
      if (!result.length) {
        const per = permission();
        per.truID = ctruid;
        per.aTruID = truID;
        per.createDate = Date();
        per.modifyDate = Date();
        per.module = permissonobj;
        per.save(function (err) {
          if (err) {
            console.log("eer2", err);
            res.json({ status: "500", message: "Internal Server Error" });
          } else {
            res.json({ status: "200", resources: "Premission as been  Successfully" });
            var permissonobjupdate = {};
            for (const [key, value] of Object.entries(permissonobj)) {
              if (value != undefined) {
                permissonobjupdate[`module.${key}`] = value;
              }
            }
            logpermission(ctruid, truID, permissonobjupdate);
          }
        });
      } else {
        var permissonobjupdate = {};
        for (const [key, value] of Object.entries(permissonobj)) {
          if (value != undefined) {
            permissonobjupdate[`module.${key}`] = value;
          }
        }
        permissonobjupdate.modifyDate = new Date();
        permissonobjupdate.aTruID = truID;
        permission.findOneAndUpdate({ truID: ctruid },
          {
            $set: permissonobjupdate
          }, { new: true }).exec(function (err, result) {
            if (err) {
              console.log("eer1", err);
              res.json({ status: "500", message: "Internal Server Error" });
            } else {

              res.json({ status: "200", resources: "Premission as been  Successfully" });
              logpermissionCons(ctruid, truID, permissonobjupdate);

            }
          })
      }
    }
  })
}

exports.consumer_updatelimit = function (req, res) {
  var truID = req.body.ctruID;
  var atruid = req.body.truID;
  var tType = req.body.tType;
  var tTypelimit = {};
  req.body.goldMax ? tTypelimit["goldMax"] = req.body.goldMax : undefined;
  req.body.goldMin ? tTypelimit["goldMin"] = req.body.goldMin : undefined;
  req.body.minBuyToSell ? tTypelimit["minBuyToSell"] = req.body.minBuyToSell : undefined;

  req.body.silverMax ? tTypelimit["silverMax"] = req.body.silverMax : undefined;
  req.body.silverMin ? tTypelimit["silverMin"] = req.body.silverMin : undefined;
  req.body.txnInterval ? tTypelimit["txnInterval"] = req.body.txnInterval : undefined;
  req.body.noOfTxnInInterval ? tTypelimit["noOfTxnInInterval"] = req.body.noOfTxnInInterval : undefined;
  req.body.maxAmtOfTxnInHour ? tTypelimit["maxAmtOfTxnInHour"] = req.body.maxAmtOfTxnInHour : undefined;
  req.body.maxAmtOfTxnInDay ? tTypelimit["maxAmtOfTxnInDay"] = req.body.maxAmtOfTxnInDay : undefined;
  req.body.maxAmtOfTxnInMonth ? tTypelimit["maxAmtOfTxnInMonth"] = req.body.maxAmtOfTxnInMonth : undefined;
  req.body.txnFreeLimit ? tTypelimit["txnFreeLimit"] = req.body.txnFreeLimit : undefined;
  req.body.minStockRequired ? tTypelimit["minStockRequired"] = req.body.minStockRequired : undefined;
  req.body.sellAfterBuyInterval ? tTypelimit["sellAfterBuyInterval"] = req.body.sellAfterBuyInterval : undefined;
  req.body.sellToBankInterval ? tTypelimit["sellToBankInterval"] = req.body.sellToBankInterval : undefined;
  req.body.redeemInBankMin ? tTypelimit["redeemInBankMin"] = req.body.redeemInBankMin : undefined;
  req.body.redeemInBankMax ? tTypelimit["redeemInBankMax"] = req.body.redeemInBankMax : undefined;


  var objkeylimit = "limit";
  if (tType === "buy") {
    var buy = tTypelimit;
    var setValue = {};
    for (const [key, value] of Object.entries(buy)) {
      if (value != undefined) {
        setValue[`${objkeylimit}.buy.${key}`] = value;
      }
    }
    setValue['modifyDate'] = Date.now();
    setValue['aTruID'] = atruid;
    UpdateLimit(truID, atruid, setValue);

  }
  if (tType === "transfer") {
    var transfer = tTypelimit;
    var setValue = {};
    for (const [key, value] of Object.entries(transfer)) {
      if (value != undefined) {
        setValue[`${objkeylimit}.transfer.${key}`] = value;
      }
    }
    setValue['modifyDate'] = Date.now();
    setValue['aTruID'] = atruid;

    UpdateLimit(truID, atruid, setValue);
  }
  if (tType === "redeemCash") {
    var redeemCash = tTypelimit;
    var setValue = {};
    for (const [key, value] of Object.entries(redeemCash)) {
      if (value != undefined) {
        setValue[`${objkeylimit}.redeemCash.${key}`] = value;
      }
    }
    setValue['modifyDate'] = Date.now();
    setValue['aTruID'] = atruid;

    UpdateLimit(truID, atruid, setValue);
  }



  function UpdateLimit(truID, atruid, setValue) {

    permission.findOneAndUpdate({ "truID": truID },
      { $set: setValue }, { upsert: true, new: true }).exec(function (err, result) {
        if (err) {
          res.json({ status: "500", message: "Internal Server Error" });
        } else {
          if (!result) {
            res.json({ status: "401", message: "No Permission given to this ID " + truID });
          } else {
            res.json({ status: "200", message: "Limit has been Updated for the request " + tType });
            logpermissionCons(truID, atruid, setValue);
          }
        }
      })
  }
}

exports.home_updatelimit = function (req, res) {

  var truID = req.body.ctruID;
  var atruid = req.body.truID;
  var tType = req.body.tType;
  var tTypelimit = {};
  req.body.message ? tTypelimit["message"] = req.body.message : undefined;
  req.body.startDate ? tTypelimit["startDate"] = new Date(req.body.startDate) : undefined;
  req.body.endDate ? tTypelimit["endDate"] = new Date(req.body.endDate) : undefined;
  req.body.status ? tTypelimit["status"] = req.body.status : undefined;

  var home = tTypelimit;
  var setValue = {};
  for (const [key, value] of Object.entries(home)) {
    if (value != undefined) {
      setValue[`home.${key}`] = value;
    }
  }
  setValue['modifyDate'] = Date.now();
  setValue['aTruID'] = atruid;

  permission.findOneAndUpdate({ "truID": truID },
    { $set: setValue }, { upsert: true, new: true }).exec(function (err, result) {
      if (err) {
        res.json({ status: "500", message: "Internal Server Error" });
      } else {
        if (!result) {
          res.json({ status: "401", message: "No Permission given to this ID " + truID });
        } else {
          res.json({ status: "200", message: "Limit has been Updated for the request " + tType });
          logpermission(truID, atruid, setValue);
        }
      }
    })
}

exports.consumer_updateWalletLimit = function (req, res) {
  var truID = req.body.ctruID;
  var atruid = req.body.truID;
  var tType = req.body.tType;
  var walletlimitobj = {};
  req.body.max ? walletlimitobj["max"] = req.body.max : undefined;
  req.body.min ? walletlimitobj["min"] = req.body.min : undefined;
  req.body.walletLimit ? walletlimitobj["walletLimit"] = req.body.walletLimit : undefined;
  req.body.txnInterval ? walletlimitobj["txnInterval"] = req.body.txnInterval : undefined;
  req.body.noOfTxnInSeconds ? walletlimitobj["noOfTxnInInterval"] = req.body.noOfTxnInSeconds : undefined;
  req.body.maxAmtOfTxnInSeconds ? walletlimitobj["maxAmtOfTxnInHour"] = req.body.maxAmtOfTxnInSeconds : undefined;
  req.body.maxAmtOfTxnInDay ? walletlimitobj["maxAmtOfTxnInDay"] = req.body.maxAmtOfTxnInDay : undefined;
  req.body.maxAmtOfTxnInMonth ? walletlimitobj["maxAmtOfTxnInMonth"] = req.body.maxAmtOfTxnInMonth : undefined
  req.body.goldExposure ? walletlimitobj["goldExposure"] = req.body.goldExposure : undefined;
  req.body.silverExposure ? walletlimitobj["silverExposure"] = req.body.silverExposure : undefined;




  var objkeylimit = "limit";
  if (tType === "walletToBank") {
    var walletToBank = walletlimitobj;
    var setValue = {};
    for (const [key, value] of Object.entries(walletToBank)) {
      if (value != undefined) {
        if (key === "min") {
          setValue[`${objkeylimit}.walletToBank.wtbmin`] = value;
        } else if (key === "max") {
          setValue[`${objkeylimit}.walletToBank.wtbmax`] = value;
        } else {
          setValue[`${objkeylimit}.walletToBank.${key}`] = value;
        }
      }
    }
    setValue['modifyDate'] = Date.now();
    setValue['aTruID'] = atruid;
    UpdateLimit(truID, atruid, setValue);

  }
  if (tType === "redeemToBank") {
    var walletToBank = walletlimitobj;
    var setValue = {};
    for (const [key, value] of Object.entries(walletToBank)) {
      if (value != undefined) {
        if (key === "min") {
          setValue[`${objkeylimit}.redeemToBank.min`] = value;
        } else if (key === "max") {
          setValue[`${objkeylimit}.redeemToBank.max`] = value;
        } else {
          setValue[`${objkeylimit}.redeemToBank.${key}`] = value;
        }
      }
    }
    setValue['modifyDate'] = Date.now();
    setValue['aTruID'] = atruid;
    UpdateLimit(truID, appliedOn, KYCFlag, setValue);

  }
  if (tType === "wallet") {
    var wallet = walletlimitobj;

    var setValue = {};
    for (const [key, value] of Object.entries(wallet)) {
      if (value != undefined) {
        setValue[`${objkeylimit}.wallet.${key}`] = value;
      }
    }

    setValue['modifyDate'] = Date.now();
    setValue['aTruID'] = atruid;
    UpdateLimit(truID, atruid, setValue);
  }
  if (tType === "secureCredit") {
    var secureCredit = walletlimitobj;
    var setValue = {};
    for (const [key, value] of Object.entries(secureCredit)) {
      if (value != undefined) {
        if (key === "min") {
          setValue[`${objkeylimit}.secureCredit.minCredit`] = value;
        } else if (key === "max") {
          setValue[`${objkeylimit}.secureCredit.maxCredit`] = value;
        }
        else {
          setValue[`${objkeylimit}.secureCredit.${key}`] = value;
        }
      }
    }
    setValue['modifyDate'] = Date.now();
    setValue['aTruID'] = atruid;

    UpdateLimit(truID, atruid, setValue);
  }

  function UpdateLimit(truID, atruid, setValue) {
    permission.findOneAndUpdate({ "truID": truID },
      { $set: setValue }, { upsert: true, new: true }).exec(function (err, result) {
        if (err) {
          res.json({ status: "500", message: "Internal Server Error" });
        } else {
          if (!result) {
            res.json({ status: "401", message: "No Permission given to this ID " + truID });
          } else {
            res.json({ status: "200", message: "Limit has been Updated for the request " + tType });
            logpermissionCons(truID, atruid, setValue);
          }
        }
      })
  }
}

function logpermissionCons(truID, atruid, permissonobj) {
  var pNo = Date.parse(new Date());
  var permissionID = pNo.toString();
  permissionlog.findOneAndUpdate({ "permissionID": permissionID, "truID": truID, "aTruID": atruid },
    { $set: permissonobj }, { upsert: true }).exec(function (err, result) {
      if (err) {
        console.log("err", err);
      }
    });
}

function particularjson(particular) {
  try {
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
      bullionType: { $ifNull: [{ $toString: "$" + particular + ".bullionType" }, "0"] }
    };
    return returnarr;
  }


  catch (ex) {
    console.log("data ex", ex)
    return null;
  }
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


exports.entity_all_txn_report = function (req, res) {
  var truid = req.body.truid;
  var status = req.body.status;
  var ctruid = req.body.ctruid;
  var searchfield = req.body.searchfield;
  var query = { rTruID: truid, type: { $in: ["buy", "buyCash", "redeemCash", "transfer"] } };
  if (status) {
    if (status == "failure") {
      query.status = { $in: ["failure", "reversal"] };
    } else {
      query.status = status;
    }
  }
  if (ctruid) {
    query.to = ctruid
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
  TXN.aggregate([{ $sort: { createDate: -1 } },
  { $match: query },
  { $limit: 30 },
  {
    $project: {
      invoice: 1, MOP: 1, otherCharges: 1, _id: 0,
      particularsG24: 1, particularsS99: 1, rTruID: 1, status: 1,
      partnerCharges: { $toDouble: { $sum: ["$particularsG24.partnerCharges", "$particularsS99.partnerCharges"] } },
      nodeCharges: { $toDouble: { $sum: ["$particularsG24.nodeCharges", "$particularsS99.nodeCharges"] } },
      remmitCharges: 1, sourceFlag: 1, to: 1, totalAmount: 1, type: 1, createDate: 1
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
  {
    $project: {
      _id: 0, invoice: 1, MOP: 1, rTruID: 1, status: 1, entityRevenue: 1,

      particularsG24: particularjson("particularsG24"), particularsS99: particularjson("particularsS99"),
      otherCharges: { $ifNull: [{ $toString: "$otherCharges" }, "0"] }, entityRevenue: { $ifNull: [{ $toString: "$entityRevenue" }, "0"] },
      totalAmount: { $ifNull: [{ $toString: "$totalAmount" }, "0"] },
      partnerCharges: { $ifNull: [{ $toString: "$partnerCharges" }, "0"] },
      nodeCharges: { $ifNull: [{ $toString: "$nodeCharges" }, "0"] },
      remmitCharges: { $ifNull: [{ $toString: "$remmitCharges" }, "0"] }, sourceFlag: 1, to: 1, type: 1, fName: "$cust.fName", lName: "$cust.lName", createDate: 1
    }
  }
  ]).exec(async function (err, result) {
    if (err) {
      res.status(500).send({
        error: err
      })
    } else {
      var resource = result[0];
      var enddate = result.length > 0 ? result[0].buy[0].createDate : ""
      var startdate = result.length > 0 ? result[0].buy[result[0].buy.length - 1].createDate : ""
      enddate = new Date(Date.parse(enddate) + (1000 * 3600 * 24))

      var txnCharges = await CallCharges(startdate, enddate);
      var clientCharges = await CallEntityCharges(startdate, enddate, req.body.truid);

      function CallCharges(startDate, endDate) {
        return new Promise((resolve, reject) => {
          request.post({
            "headers": { "content-type": "application/json" },
            "url": conf.adminReqIP + ":5112/api/getAllChargesBetweenDate",
            // "body": JSON.stringify({ startDate: startDate, endDate: endDate })
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

      function CallEntityCharges(startDate, endDate, clientID) {
        return new Promise((resolve, reject) => {
          request.post({
            "headers": { "content-type": "application/json" },
            "url": conf.reqip + ":4121/api/clientChargesBetweenDate",
            "body": JSON.stringify({ startDate: startDate, endDate: endDate, rtruID: clientID })
          }, (error, response, body) => {
            if (error) {
              resolve(null)
            }
            else {
              if (response.statusCode == 200) {
                var resp = JSON.parse(body);
                resolve(resp.resource)
              }
            }
          })
        })
      }

      ///////////--------------------------buy Unit-------------------
      var txn = new Array();
      for (var i = 0; i < resource.buy.length; i++) {


        var txndetail = resource.buy[i];
        var arraytxn = {};
        var txnglobalRate = txnCharges.filter(d => {
          var timetxn = new Date(d.modifyDate);
          timetxn.setHours(0, 0, 0, 0);
          return txndetail.createDate.getTime() >= timetxn.getTime();
        }).reverse();


        var clientglobalRate = clientCharges.filter(d => {
          var timeclient = new Date(d.createDate);
          timeclient.setHours(0, 0, 0, 0);
          return txndetail.createDate.getTime() >= timeclient.getTime();
        }).reverse();

        arraytxn["invoice"] = txndetail.invoice;
        arraytxn["to"] = txndetail.to;
        arraytxn["consumerName"] = txndetail.fName + " " + txndetail.lName;
        arraytxn["MOP"] = txndetail.MOP;
        arraytxn["createDate"] = txndetail.createDate;
        arraytxn["totalAmount"] = txndetail.totalAmount;
        arraytxn["remmitCharges"] = txndetail.remmitCharges;
        arraytxn["partnerCharges"] = txndetail.partnerCharges;
        arraytxn["partnerCharges"] = txndetail.partnerCharges;
        arraytxn["nodeCharges"] = txndetail.nodeCharges;
        arraytxn["status"] = txndetail.status;
        arraytxn["type"] = txndetail.type;
        arraytxn["txnChargePer"] = txnglobalRate.length ? txnglobalRate[0].transactionCharges ? txnglobalRate[0].transactionCharges.toString() : "0" : "0";
        arraytxn["clienttxnChargePer"] = clientglobalRate.length ? clientglobalRate[0].trasactionCharges ? clientglobalRate[0].trasactionCharges.toString() : "0" : "0";
        //24K particular 
        console.log(txndetail.invoice);
        console.log("qty:", txndetail.particularsG24.qty);

        var g24K = parseFloat(txndetail.particularsG24.qty);
        if (g24K != 0) {
          arraytxn["particularG24"] = txndetail.particularsG24;
        }

        //99P particular 
        var g99K = parseFloat(txndetail.particularsS99.qty);
        if (g99K != 0) {
          arraytxn["particularS99"] = txndetail.particularsS99;
        }
        txn.push(arraytxn);
      }
      res.json({ status: "200", resource: txn });
    }
  }
  )
};


exports.entity_all_txn_report_datewise = async function (req, res) {
  var truid = req.body.rTruID;
  var start = req.body.start ? parseInt(req.body.start) : 1;
  var end = req.body.length ? parseInt(req.body.length) : 100;


  var query = { rTruID: truid, type: { $in: ["buy", "buyCash", "redeemCash", "transfer"] } };
  if (req.body.type) {
    query.type = req.body.type;
  }
  if (req.body.status) {
    if (req.body.status == "failure") {
      query.status = { $in: ["failure", "reversal"] };
    } else {
      query.status = req.body.status;
    }
  }
  if (req.body.startdate && req.body.enddate) {
    var startdate = new Date(Date.parse(req.body.startdate));
    var enddate = new Date(Date.parse(req.body.enddate) + (1000 * 3600 * 24));
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
  var oman = await TXN.find(query).count();
  const cursor = TXN.aggregate([{ $sort: { createDate: -1 } },
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
  {
    $project: {
      _id: 0, invoice: 1, MOP: 1, rTruID: 1, status: 1, entityRevenue: 1,
      particularsG24: particularjson("particularsG24"), particularsS99: particularjson("particularsS99"),
      otherCharges: { $ifNull: [{ $toString: "$otherCharges" }, "0"] }, entityRevenue: { $ifNull: [{ $toString: "$entityRevenue" }, "0"] },
      totalAmount: { $ifNull: [{ $toString: "$totalAmount" }, "0"] },
      partnerCharges: { $ifNull: [{ $toString: "$partnerCharges" }, "0"] },
      nodeCharges: { $ifNull: [{ $toString: "$nodeCharges" }, "0"] }, sourceFlag: 1, to: 1, type: 1, fName: "$cust.fName", lName: "$cust.lName", createDate: 1
    }
  }
  ]).allowDiskUse(true).cursor({ batchSize: 1000 });
  var txn = new Array();

  for await (const txndetail of cursor) {
    var arraytxn = {};
    arraytxn["invoice"] = txndetail.invoice;
    arraytxn["to"] = txndetail.to;
    arraytxn["fName"] = txndetail.fName;
    arraytxn["lName"] = txndetail.lName;
    arraytxn["MOP"] = txndetail.MOP;
    arraytxn["createDate"] = txndetail.createDate;
    arraytxn["totalAmount"] = txndetail.totalAmount;
    arraytxn["partnerCharges"] = txndetail.partnerCharges;
    arraytxn["nodeCharges"] = txndetail.nodeCharges;
    arraytxn["entityRevenue"] = txndetail.entityRevenue.toString();
    arraytxn["status"] = txndetail.status;
    arraytxn["type"] = txndetail.type;

    //24K particular
    var arraytxn24 = {};
    var g24K = txndetail.particularsG24.qty;
    if (g24K != 0) {
      arraytxn["particularG24"] = txndetail.particularsG24;
    }

    //99P particular
    var arraytxn99 = {};
    var g99K = txndetail.particularsS99.qty;
    if (g99K != 0) {
      arraytxn["particularS99"] = txndetail.particularsS99;
    }
    txn.push(arraytxn);
  }
  var data = JSON.stringify({
    "draw": req.body.draw,
    "recordsFiltered": oman,
    "recordsTotal": oman,
    "data": txn
  });
  res.send(data);
  // res.json({ status: "200", resource: txn });
};


var txn_stocklogs = function (obj, dlrTruID) {
  return new Promise((resolve, reject) => {
    Stock.aggregate([
      { $match: { truID: obj.truid } },
      {
        $project: {
          _id: 0, truID: 1,
          strockG24K: "$stock.G24K",
          strockS99P: "$stock.S99P"
        }
      }
    ]).exec(function (err, result) {
      if (err) {
        console.log("err", err);
      } else {
        if (result.length) {
          var stkID = "S" + (Date.parse(new Date()) + randomize('0', 4)).toString();
          var Cr = 0, Dr = 0;
          switch (obj.status) {
            case "expired":
              Dr = parseFloat(obj.Qty) * -1;
              break;
            case "reversal":
              Dr = parseFloat(obj.Qty) * -1;
              break;
            case "refund":
              Cr = parseFloat(obj.Qty);
              break;
            default:
            // code block
          }
          var previousStock = 0, currentStock = 0;

          if (obj.status === "expired") {
            reverseStockCust()
          } else {
            switch (obj.bullionType) {
              case "G24K":
                previousStock = result[0].strockG24K.toJSON().$numberDecimal;
                currentStock = parseFloat(result[0].strockG24K.toJSON().$numberDecimal) + Cr + Dr;
                break;
              case "S99P":
                previousStock = result[0].strockS99P.toJSON().$numberDecimal;
                currentStock = parseFloat(result[0].strockS99P.toJSON().$numberDecimal) + Cr + Dr;
                break;
              default:
            }
            const txnstock = txnStocklogs();
            txnstock.stockID = stkID;
            txnstock.truID = obj.truid;
            txnstock.rTruID = obj.rTruID;
            txnstock.invoice = "R" + obj.invoice;
            txnstock.tType = obj.status;
            txnstock.bullionType = obj.bullionType;
            txnstock.Cr = Cr;
            txnstock.Dr = Dr;
            txnstock.status = "success";
            txnstock.currentStock = currentStock;
            txnstock.previousStock = previousStock;
            txnstock.status = obj.status;
            txnstock.hash = encryption(txnstock);
            txnstock.save(function (err) {
              if (!err) {
                reverseStockCust()
              }
              // else {
              //   resolve("500")
              // }
            })
          }
          function reverseStockCust() {
            var stockupdate;
            if (obj.bullionType == "G24K") {
              stockupdate = { "stock.G24K": parseFloat(obj.Qty) };
            } else if (obj.bullionType == "S99P") {
              stockupdate = { "stock.S99P": parseFloat(obj.Qty) };
            }
            Stock.findOneAndUpdate({ truID: obj.truid }, { $inc: stockupdate }).exec(function (err, result) {
              if (err) {
                console.log(err)
              }
              var stockupdatedlr;
              if (obj.bullionType == "G24K") {
                if (obj.status === "reversal" || obj.status === "expired") {
                  stockupdatedlr = { "stock.G24K": parseFloat(obj.Qty) };
                } else {
                  stockupdatedlr = { "stock.G24K": parseFloat(obj.Qty) * -1 };
                }
              } else if (obj.bullionType == "S99P") {
                if (obj.status === "reversal" || obj.status === "expired") {
                  stockupdatedlr = { "stock.S99P": parseFloat(obj.Qty) };
                } else {
                  stockupdatedlr = { "stock.S99P": parseFloat(obj.Qty) * -1 };
                }
              }
              assetmanagerStock.findOneAndUpdate({ truID: dlrTruID }, { $inc: stockupdatedlr }).exec(function (err, result) {
                if (err) {
                  console.log(err)
                }
              })
              resolve("200")
            })
          }

        }
      }
    })
  })
}
exports.reverse_Cust_Txn = function (req, res) {
  var invoice = req.body.invoice;
  TXN.aggregate([{
    $match: {
      "invoice": invoice,
      "status": "success"
    }
  }]).exec(async function (err, docs) {
    if (!docs.length) {
      res.status(411).json({
        status: "411",
        message: "Please enter correct invoice number."
      });
    } else {
      var s99pstock = "0", g24kstock = "0", truid = docs[0].to, txnType = docs[0].type, mop = docs[0].MOP, transType = "reversal";
      var totalAmt = docs[0].totalAmount.toJSON().$numberDecimal;
      var amtruID;
      if (docs[0].particularsG24.qty && parseFloat(docs[0].particularsG24.qty.toJSON().$numberDecimal) > 0) {
        g24kstock = docs[0].particularsG24.qty.toJSON().$numberDecimal;
        amtruID = docs[0].particularsG24.from;
      }
      if (docs[0].particularsS99.qty && parseFloat(docs[0].particularsS99.qty.toJSON().$numberDecimal) > 0) {
        s99pstock = docs[0].particularsS99.qty.toJSON().$numberDecimal;
        amtruID = docs[0].particularsS99.from;
      }
      var l = 0;
      if (parseFloat(g24kstock) > 0) {
        await reverseStock(truid, invoice, g24kstock, "G24K", docs[0].type);
        l++;
        if (l === 1) {
          res.json({ status: "200", message: "Stock Reversed", resource: docs[0], totalAmt: totalAmt })
        }
      } else if (parseFloat(s99pstock) > 0) {
        await reverseStock(truid, invoice, s99pstock, "S99P", docs[0].type);
        l++;
        if (l === 1) {
          res.json({ status: "200", message: "Stock Reversed", resource: docs[0], totalAmt: totalAmt })
        }
      }
      await TXN.findOneAndUpdate({ "invoice": invoice }, { $set: { status: transType } }, { new: true });
      async function reverseStock(truid, invoice, qty, bullionType, tType) {
        var stocklog = {
          "truid": truid,
          "tType": tType,
          "Qty": qty,
          "invoice": invoice,
          "bullionType": bullionType,
          "status": "reversal"
        }
        await txn_stocklogs(stocklog, amtruID)
      };
    }
  })
}

exports.entity_revenue_TXN_Wise_report = function (req, res) {
  //var badd = new TXN(req.user);
  var truid = req.body.truid;
  //var revenuePer = req.body.revenueper == 0 ? Gen.entityRevCharges : req.body.revenueper;
  // var companyName = req.body.companyName;
  var isparent = req.body.isparent;
  var query = { status: "success", rTruID: truid, type: { $in: ["buy", "buyCash", "redeemCash", "transfer"] } };
  if (req.body.dateFlag) {
    var startdate = new Date(Date.parse(req.body.startdate));
    var enddate = new Date(Date.parse(req.body.enddate) + (1000 * 3600 * 24));
    query = { status: "success", rTruID: truid, type: { $in: ["buy", "buyCash", "redeemCash", "transfer"] }, createDate: { $gte: startdate, $lte: enddate } }
  }
  var txnQuery;
  if (!req.body.dateFlag) {
    txnQuery = TXN.aggregate([
      {
        $facet: {
          customerTxn: [
            { $sort: { createDate: -1 } },
            { $match: query },
            { $limit: 30 },
            {
              $project: {
                _id: 0, invoice: 1, createDate: 1, rTruID: 1, remmitCharges: { $toString: "$remmitCharges" },
                partnerCharges: { $toString: { $sum: ["$particularsG24.partnerCharges", "$particularsS99.partnerCharges"] } },
                nodeCharges: { $toString: { $sum: ["$particularsG24.nodeCharges", "$particularsS99.nodeCharges"] } },
                to: 1, totalAmount: { $toString: "$totalAmount" }, type: 1
              }
            },
            {
              $lookup: {
                localField: "to",
                foreignField: "truID",
                from: "kycs",
                as: "kycdetails"
              }
            },
            { $unwind: "$kycdetails" },
            {
              $project: {
                invoice: 1, createDate: 1, rTruID: 1, remmitCharges: 1, partnerCharges: 1, nodeCharges: 1, to: 1, totalAmount: 1, type: 1, revenue: 1,
                consumerName: { $concat: ["$kycdetails.fName", " ", "$kycdetails.lName"] }
              }
            }
          ],
          totalRevenue: [
            { $match: { rTruID: truid, status: "success" } },
            {
              $project: {
                invoice: 1, rTruID: 1, remmitCharges: 1, sourceFlag: 1, status: 1, totalAmount: 1,
                partnerCharges: { $toDouble: { $sum: ["$particularsG24.partnerCharges", "$particularsS99.partnerCharges"] } },
                nodeCharges: { $toDouble: { $sum: ["$particularsG24.nodeCharges", "$particularsS99.nodeCharges"] } },
                createDate: 1, date: { $dateToString: { format: "%d-%m-%Y", date: "$createDate" } }
              }
            },
            {
              $group:
              {
                _id: "$rTruID",
                totalpartnerCharges: { $sum: "$partnerCharges" },
                totalnodeCharges: { $sum: "$nodeCharges" },
                transactionCount: { $sum: 1 }
              }
            },
            {
              $project: {
                _id: 0, totalpartnerRevenue: { $convert: { input: "$totalpartnerCharges", to: "string" } },
                totalnodeRevenue: { $convert: { input: "$totalnodeCharges", to: "string" } },
                transactionCount: { $convert: { input: "$transactionCount", to: "string" } }
              }
            }
          ],
        }
      }
    ])

  } else {
    txnQuery = TXN.aggregate([
      {
        $facet: {
          customerTxn: [
            { $match: query },
            { $sort: { createDate: -1 } },
            {
              $project: {
                _id: 0, invoice: 1, createDate: 1, rTruID: 1, remmitCharges: { $toString: "$remmitCharges" },
                partnerCharges: { $toString: { $sum: ["$particularsG24.partnerCharges", "$particularsS99.partnerCharges"] } },
                nodeCharges: { $toString: { $sum: ["$particularsG24.nodeCharges", "$particularsS99.nodeCharges"] } },
                to: 1, totalAmount: { $toString: "$totalAmount" }, type: 1
              }
            },
            {
              $lookup: {
                localField: "to",
                foreignField: "truID",
                from: "kycs",
                as: "kycdetails"
              }
            },
            { $unwind: "$kycdetails" },
            {
              $project: {
                invoice: 1, createDate: 1, rTruID: 1, remmitCharges: 1, partnerCharges: 1, nodeCharges: 1, to: 1, totalAmount: 1, type: 1, revenue: 1,
                consumerName: { $concat: ["$kycdetails.fName", " ", "$kycdetails.lName"] }
              }
            }
          ],
          totalRevenue: [
            { $match: { rTruID: truid, status: "success" } },
            {
              $project: {
                invoice: 1, rTruID: 1, remmitCharges: 1, sourceFlag: 1, status: 1, totalAmount: 1,
                partnerCharges: { $toDouble: { $sum: ["$particularsG24.partnerCharges", "$particularsS99.partnerCharges"] } },
                nodeCharges: { $toDouble: { $sum: ["$particularsG24.nodeCharges", "$particularsS99.nodeCharges"] } },
                createDate: 1, date: { $dateToString: { format: "%d-%m-%Y", date: "$createDate" } }
              }
            },
            {
              $group:
              {
                _id: "$rTruID",
                totalpartnerCharges: { $sum: "$partnerCharges" },
                totalnodeCharges: { $sum: "$nodeCharges" },
                transactionCount: { $sum: 1 }
              }
            },
            {
              $project: {
                _id: 0, totalpartnerRevenue: { $convert: { input: "$totalpartnerCharges", to: "string" } },
                totalnodeRevenue: { $convert: { input: "$totalnodeCharges", to: "string" } },
                transactionCount: { $convert: { input: "$transactionCount", to: "string" } }
              }
            }
          ],
        }
      }
    ])
  }
  txnQuery.exec(function (err, result) {
    if (err) {
      res.status(500).send({ error: err })
    }
    else {
      if (!result[0].customerTxn.length) {
        res.json({ status: "204", resource: "No data Found!" });
      }
      else {
        var resource = result[0];
        var Final = ({ consumerTXNS: resource.customerTxn, totalRemmitRevenue: resource.totalRevenue[0], isParent: isparent })
        res.json({ status: "200", resource: Final });
      }
    }
  });
}

exports.consumer_gst_report_adminNEWRename = async function (req, res) {
  var start = req.body.start ? parseInt(req.body.start) : 0;
  var end = req.body.length ? parseInt(req.body.length) : 100;

  var query1 = { type: { $in: ['buy', "buyCash", "transfer"] } }
  var query2 = { type: { $in: ["redeemCash"] } }
  var dateFlag = req.body.dateFlag;
  if (req.body.ctruid) {
    if (req.body.dateFlag && req.body.ctruid) {
      var ctruid = req.body.ctruid;
      var startdate = new Date(Date.parse(req.body.startdate));
      var enddate = new Date(Date.parse(req.body.enddate) + (1000 * 3600 * 24));
      query1.to = ctruid;
      query1.createDate = { $gte: startdate, $lte: enddate };
      query2.to = ctruid;
      query2.createDate = { $gte: startdate, $lte: enddate };
    }
    else if (!req.body.dateFlag && req.body.ctruid) {
      var ctruid = req.body.ctruid;
      //  dateFlag = true;
      query1.to = ctruid;
      query2.to = ctruid;
    }
    else if (req.body.dateFlag) {
      var startdate = new Date(Date.parse(req.body.startdate));
      var enddate = new Date(Date.parse(req.body.enddate) + (1000 * 3600 * 24));
      query1.createDate = { $gte: startdate, $lte: enddate };
      query2.createDate = { $gte: startdate, $lte: enddate };
    }
  }
  else {
    if (req.body.dateFlag && req.body.rtruid) {
      var rtruid = req.body.rtruid;
      var startdate = new Date(Date.parse(req.body.startdate));
      var enddate = new Date(Date.parse(req.body.enddate) + (1000 * 3600 * 24));
      query1.rTruID = rtruid;
      query1.createDate = { $gte: startdate, $lte: enddate };
      query2.rTruID = rtruid;
      query2.createDate = { $gte: startdate, $lte: enddate };
    }
    else if (!req.body.dateFlag && req.body.rtruid) {
      var rtruid = req.body.rtruid;
      // dateFlag = true;
      query1.rTruID = rtruid;
      query2.rTruID = rtruid;
    }
    else if (req.body.dateFlag) {
      var startdate = new Date(Date.parse(req.body.startdate));
      var enddate = new Date(Date.parse(req.body.enddate) + (1000 * 3600 * 24));
      query1.createDate = { $gte: startdate, $lte: enddate };
      query2.createDate = { $gte: startdate, $lte: enddate };
    }
  }

  var ObjectQuery = [
    {
      $project: {
        invoice: 1, MOP: 1, otherCharges: 1, _id: 0,
        particularsG24: 1, particularsS99: 1, rTruID: 1,
        partnerCharges: { $toDouble: { $sum: ["$particularsG24.partnerCharges", "$particularsS99.partnerCharges"] } },
        nodeCharges: { $toDouble: { $sum: ["$particularsG24.nodeCharges", "$particularsS99.nodeCharges"] } },
        remmitCharges: 1, sourceFlag: 1, status: 1, to: 1, totalAmount: 1, type: 1, createDate: 1
      }
    },
    { $sort: { createDate: -1 } },
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
    { $unwind: { path: "$particularsS99", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$particularsG24", preserveNullAndEmptyArrays: true } },
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
      $project:
      {
        invoice: 1, MOP: 1, _id: 0, rTruID: 1,
        particularsG24: particularjson("particularsG24"),
        particularsS99: particularjson("particularsS99"),
        pgType: { $cond: { if: { $eq: ["$MOP", "others"] }, then: "atom", else: "truWallet" } },
        paidBy: { $cond: { if: { $eq: ["$MOP", "others"] }, then: "$atominvoice.MOP", else: "truWallet" } },
        bankTxnID: "$atominvoice.bankTxnID",
        bankName: "$atominvoice.bankName",
        remmitCharges: { $ifNull: [{ $toString: "$remmitCharges" }, "0"] }, sourceFlag: 1, status: 1, to: 1,
        otherCharges: { $ifNull: [{ $toString: "$otherCharges" }, "0"] }, entityRevenue: { $ifNull: [{ $toString: "$entityRevenue" }, "0"] },
        totalAmount: { $ifNull: [{ $toString: "$totalAmount" }, "0"] },
        partnerCharges: { $ifNull: [{ $toString: "$partnerCharges" }, "0"] },
        nodeCharges: { $ifNull: [{ $toString: "$nodeCharges" }, "0"] }, type: 1, fName: "$cust.fName", lName: "$cust.lName", gender: "$cust.gender", createDate: 1
      }
    }
  ];
  var ObjectRedeemCash = [
    { $match: query2 },
    {
      $project: {
        invoice: 1, MOP: 1, otherCharges: 1, _id: 0, rTruID: 1,
        particularsG24: 1, particularsS99: 1,
        partnerCharges: { $toDouble: { $sum: ["$particularsG24.partnerCharges", "$particularsS99.partnerCharges"] } },
        nodeCharges: { $toDouble: { $sum: ["$particularsG24.nodeCharges", "$particularsS99.nodeCharges"] } },
        remmitCharges: 1, sourceFlag: 1, status: 1, to: 1, totalAmount: 1, type: 1, createDate: 1, truID: "$to"
      }
    },
    { $sort: { createDate: -1 } },
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
    { $unwind: { path: "$particularsS99", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$particularsG24", preserveNullAndEmptyArrays: true } },
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
        invoice: 1, MOP: 1, _id: 0, rTruID: 1, type: 1,
        particularsG24: particularjson("particularsG24"),
        particularsS99: particularjson("particularsS99"),
        otherCharges: { $ifNull: [{ $toString: "$otherCharges" }, "0"] },
        entityRevenue: { $ifNull: [{ $toString: "$entityRevenue" }, "0"] },
        totalAmount: { $ifNull: [{ $toString: "$totalAmount" }, "0"] },
        bankName: "$bankDetails.accountDetails.bank_name",
        txnID: { $cond: { if: { $eq: ["$MOP", "others"] }, then: "$bankinvoice.TranID", else: "" } },
        paidBy: { $cond: { if: { $eq: ["$MOP", "others"] }, then: "$bankinvoice.Mode_of_Pay", else: "" } },
        refNo: "$bankinvoice.RefNo",
        pgType: { $cond: { if: { $eq: ["$MOP", "others"] }, then: "bank", else: "truWallet" } },
        accountHolderName: { $cond: { if: { $eq: ["$MOP", "others"] }, then: "$bankDetails.accountDetails.name", else: "" } },
        IFSC: "$bankDetails.accountDetails.IFSC",
        accountNo: "$bankDetails.accountDetails.accountNo",
        partnerCharges: { $ifNull: [{ $toString: "$partnerCharges" }, "0"] },
        remmitCharges: { $ifNull: [{ $toString: "$remmitCharges" }, "0"] },
        sourceFlag: 1, status: 1, to: 1, fName: "$cust.fName", lName: "$cust.lName", gender: "$cust.gender", createDate: 1
      }
    }
  ];
  if (!dateFlag) {
    ObjectQuery.push({ $limit: 30 });
    ObjectRedeemCash.push({ $limit: 30 });
  }
  if (req.body.stype) {
    query1.status = req.body.stype;
    query2.status = req.body.stype;
  }
  let api_data = [{ $match: query1 }];
  var buyObject = api_data.concat(ObjectQuery);

  let api_dataCash = [{ $match: query2 }];
  //var sellObject = api_dataCash.concat(ObjectRedeemCash);

  var oman = await TXN.find(query1).count();
  if (end < 0) {
    end = oman;
  }
  var cursor = TXN.aggregate(buyObject).allowDiskUse(true).cursor({ batchSize: 1000 });
  var txn = new Array();
  var createSummaryData = function (buyArr, particular, status, product) {


    var btype = "", productType = "", brate = "", amount = 0, tax = 0, g24rate = 0, g99prate = 0, earning = 0, clientrevenue = 0, totalRevenue = 0;
    var exRate, exQty;

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
      tax += parseFloat(particulars.tax);
      earning += parseFloat(particulars.partnerCharges);
      totalRevenue += (parseFloat(particulars.transactionCharges) + parseFloat(particulars.clientTransactionCharges));
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
    if (totalRevenue) {
      revenue = totalRevenue - earning
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
      "exQty": exQty,
      "exStatus": buyArr.status == "success" ? "Success" : "Failure",
      "revenue": revenue.toString()
    };
    return rqueue;
  }
  for await (const txndetail of cursor) {
    var arraytxn = {};
    arraytxn["invoice"] = txndetail.invoice;
    arraytxn["to"] = txndetail.to;
    arraytxn["companyName"] = "companyName";
    arraytxn["consumerName"] = txndetail.fName + " " + txndetail.lName;
    arraytxn["MOP"] = txndetail.MOP;
    arraytxn["createDate"] = txndetail.createDate;
    arraytxn["rTruID"] = txndetail.rTruID;
    arraytxn["totalAmount"] = decimalChopperFloat(txndetail.totalAmount, 4);
    arraytxn["partnerCharges"] = decimalChopperFloat(txndetail.partnerCharges, 4);
    arraytxn["nodeCharges"] = decimalChopperFloat(txndetail.nodeCharges, 4);
    arraytxn["entityRevenue"] = decimalChopperFloat(txndetail.entityRevenue, 4);
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
exports.parent_entity_detailed_report_admin = function (req, res) {
  var matchqry = { "__t": "KycAll", refernceTruID: { $in: req.body.truid } };

  var startdate = new Date(Date.parse(req.body.startdate));
  var enddate = new Date(Date.parse(req.body.enddate));

  if (req.body.dateflag === true) {
    matchqry = { "__t": "KycAll", refernceTruID: { $in: req.body.truid }, createDate: { $gte: startdate, $lte: enddate } };
  }
  KycAll.aggregate([{ $match: matchqry },
  { $project: { truID: 1, _id: 0 } },
  {
    $group: {
      _id: null,
      truID: { $addToSet: "$truID" }
    }
  },
  { $project: { _id: 0, truID: 1 } }
  ]).exec(function (err, custid) {
    if (!custid || !custid.length || !custid[0].truID.length) {
      custid = "0";
    }
    else {
      custid = custid[0].truID.length.toString();
    }

    var txnmatchqry = { sourceFlag: "remmit", status: "success", rTruID: { $in: req.body.truid } };

    if (req.body.dateflag === true) {
      txnmatchqry = { sourceFlag: "remmit", status: "success", createDate: { $gte: startdate, $lte: enddate }, rTruID: { $in: req.body.truid } };
    }

    TXN.aggregate([{ $match: txnmatchqry },
    {
      $facet: {
        alltxncount: [{ $count: "count" }],
        alltxndetail: [
          {
            $group: {
              _id: null,
              //   myCount: { $sum: 1 }, 
              totalamount: { $sum: "$totalAmount" },
              totalqty: { $sum: { $add: ["$particularsG24.qty", "$particularsS99.qty"] } },
              totalassetmanagercharges: {
                $sum: {
                  $add: ["$particularsG24.assetmanagersCharges", "$particularsS99.assetmanagersCharges"]
                }
              },
              totaltax: { $sum: { $add: ["$particularsG24.tax", "$particularsS99.tax"] } }
            }
          },
        ],
        buy: [{ $match: { type: { $in: ["buy", "buyCash"] } } },
        {
          $project: {
            amt24: "$particularsG24.total",
            amt99: "$particularsS99.total",
            qty24: "$particularsG24.qty", qty99: "$particularsS99.qty"
          }
        },
        {
          $group: {
            _id: null,
            //   myCount: { $sum: 1 }, 
            amount24: { $sum: "$amt24" },
            amount99: { $sum: "$amt99" },
            qty24: { $sum: "$qty24" },
            qty99: { $sum: "$qty99" }
          }
        },
        ],

        redeemCash: [{ $match: { type: "redeemCash", } },
        {
          $project: {
            amt24: "$particularsG24.total", amt99: "$particularsS99.total",
            qty24: "$particularsG24.qty", qty99: "$particularsS99.qty"
          }
        },
        {
          $group: {
            _id: null,
            //   myCount: { $sum: 1 }, 
            amount24: { $sum: "$amt24" },
            amount99: { $sum: "$amt99" },
            qty24: { $sum: "$qty24" },
            qty99: { $sum: "$qty99" }
          }
        }
        ],

        transfer: [{ $match: { type: "transfer", } },
        {
          $project: {
            amt24: "$particularsG24.total", amt99: "$particularsS99.total",
            qty24: "$particularsG24.qty", qty99: "$particularsS99.qty"
          }
        },
        {
          $group: {
            _id: null,
            //   myCount: { $sum: 1 }, 
            amount24: { $sum: "$amt24" },
            amount99: { $sum: "$amt99" },
            qty24: { $sum: "$qty24" },
            qty99: { $sum: "$qty99" }
          }
        },
        ],

      }
    }
    ]).exec(function (err, result) {
      if (err) {
        res.json({ "status": "204", message: "Something went wrong!" })
      }
      else {
        var resource = result[0];
        var finalresp = ({
          "consumerCount": custid,
          "txnCount": resource.alltxncount.length ? resource.alltxncount[0].count.toString() : "0",
          "totalAmount": resource.alltxndetail.length ? resource.alltxndetail[0].totalamount.toJSON().$numberDecimal : "0",
          "totalQTY": resource.alltxndetail.length ? resource.alltxndetail[0].totalqty.toJSON().$numberDecimal : "0",
          "totalassetmanagerCharges": resource.alltxndetail.length ? resource.alltxndetail[0].totalassetmanagercharges.toJSON().$numberDecimal : "0",
          "totalTAX": resource.alltxndetail.length ? resource.alltxndetail[0].totaltax.toJSON().$numberDecimal : "0",
          "buy": {
            "g24kTotalAmount": resource.buy.length ? resource.buy[0].amount24.toJSON().$numberDecimal : "0",
            "s99pTotalAmount": resource.buy.length ? resource.buy[0].amount99.toJSON().$numberDecimal : "0",
            "g24kTotalQTY": resource.buy.length ? resource.buy[0].qty24.toJSON().$numberDecimal : "0",
            "s99pTotalQTY": resource.buy.length ? resource.buy[0].qty99.toJSON().$numberDecimal : "0"
          },
          "redeemCash": {
            "g24kTotalAmount": resource.redeemCash.length ? resource.redeemCash[0].amount24.toJSON().$numberDecimal : "0",
            "s99pTotalAmount": resource.redeemCash.length ? resource.redeemCash[0].amount99.toJSON().$numberDecimal : "0",
            "g24kTotalQTY": resource.redeemCash.length ? resource.redeemCash[0].qty24.toJSON().$numberDecimal : "0",
            "s99pTotalQTY": resource.redeemCash.length ? resource.redeemCash[0].qty99.toJSON().$numberDecimal : "0"
          },
          "transfer": {
            "g24kTotalAmount": resource.transfer.length ? resource.transfer[0].amount24.toJSON().$numberDecimal : "0",
            "s99pTotalAmount": resource.transfer.length ? resource.transfer[0].amount99.toJSON().$numberDecimal : "0",
            "g24kTotalQTY": resource.transfer.length ? resource.transfer[0].qty24.toJSON().$numberDecimal : "0",
            "s99pTotalQTY": resource.transfer.length ? resource.transfer[0].qty99.toJSON().$numberDecimal : "0"
          }
        });
        res.json({ status: "200", resource: finalresp });
      }
    })
  })
}
exports.getConsumer_Node_Stock = function (req, res) {
  var truid = req.body.rTruID
  KycAll.aggregate([
    { $match: { refernceTruID: truid } },
    { $project: { _id: 0, truID: 1, refernceTruID: 1 } },
    {
      $lookup: {
        from: "stocks",
        localField: "truID",
        foreignField: "truID",
        as: "stocks"
      }
    },
    { $unwind: "$stocks" },
    {
      $project: {
        _id: 0, truID: 1, refernceTruID: 1, stockG24K: "$stocks.stock.G24K", stockS99P: "$stocks.stock.S99P",
      }
    },
    {
      $group: {
        _id: "$refernceTruID",
        truID: { $first: "$refernceTruID" },
        qtyG24K: { $sum: "$stockG24K" },
        qtyS99P: { $sum: "$stockS99P" }
      }
    },
    {
      $project: {
        _id: 0, truID: 1, qtyG24K: { $toString: "$qtyG24K" }, qtyS99P: { $toString: "$qtyS99P" },
      }
    },
  ]).exec(function (err, result) {
    if (err) {
      res.json({ "status": "204", message: "Something went wrong!" })
    }
    else {
      if (result.length > 0) {
        var resource = result[0];
        res.json({ status: "200", resource: resource });
      }
      else {
        var resource = result[0];
        res.json({ status: "200", resource: [] });
      }
    }
  })
}
exports.entity_all_txn_reportOpti = function (req, res) {
  var truid = req.body.rTruID;
  enKycAll.find({ truID: truid }, async function (err, docs) {

    if (!docs.length) {
      res.json({ status: "204", message: "Invalid Partner" });
    } else {
      var companyName = docs[0].companyName ? docs[0].companyName : [];
      var start = req.body.start ? parseInt(req.body.start) : 0;
      var end = req.body.length ? parseInt(req.body.length) : 100;

      var query = { rTruID: truid, type: { $in: ["buy", "buyCash", "redeemCash", "transfer"] } };
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
      if (req.body.status) {
        query.status = req.body.status;
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
      var oman = await TXN.find(query).count();
      if (end < 0) {
        end = oman;
      }
      const cursor = TXN.aggregate([{ $sort: sortQuery },
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
      {
        $project: {
          _id: 0, invoice: 1, MOP: 1, rTruID: 1, status: 1, entityRevenue: 1,
          particularsG24: particularjson("particularsG24"), particularsS99: particularjson("particularsS99"),
          otherCharges: { $ifNull: [{ $toString: "$otherCharges" }, "0"] }, entityRevenue: { $ifNull: [{ $toString: "$entityRevenue" }, "0"] },
          totalAmount: { $ifNull: [{ $toString: "$totalAmount" }, "0"] },
          partnerCharges: { $ifNull: [{ $toString: "$partnerCharges" }, "0"] },
          nodeCharges: { $ifNull: [{ $toString: "$nodeCharges" }, "0"] }, sourceFlag: 1, to: 1, type: 1, fName: "$cust.fName", lName: "$cust.lName", createDate: 1
        }
      }
      ]).allowDiskUse(true).cursor();
      var txn = new Array();
      var createSummaryData = function (buyArr, particular, status, product) {


        var btype = "", productType = "", brate = "", amount = 0, tax = 0, g24rate = 0, g99prate = 0, earning = 0, clientrevenue = 0, totalRevenue = 0;
        var exRate, exQty;

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
          tax += parseFloat(particulars.tax);
          earning += parseFloat(particulars.partnerCharges);
          totalRevenue += (parseFloat(particulars.transactionCharges) + parseFloat(particulars.clientTransactionCharges));
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
        if (totalRevenue) {
          revenue = totalRevenue - earning
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
          "exQty": exQty,
          "exStatus": buyArr.status == "success" ? "Success" : "Failure",
          "revenue": revenue.toString(),

        };
        return rqueue;
      }

      for await (const txndetail of cursor) {
        var arraytxn = {};
        arraytxn["invoice"] = txndetail.invoice;
        arraytxn["to"] = txndetail.to;
        arraytxn["companyName"] = companyName;
        arraytxn["consumerName"] = txndetail.fName + " " + txndetail.lName;
        arraytxn["MOP"] = txndetail.MOP;
        arraytxn["createDate"] = txndetail.createDate;
        arraytxn["rTruID"] = txndetail.rTruID;
        arraytxn["totalAmount"] = decimalChopperFloat(txndetail.totalAmount, 4);
        arraytxn["partnerCharges"] = decimalChopperFloat(txndetail.partnerCharges, 4);
        arraytxn["nodeCharges"] = decimalChopperFloat(txndetail.nodeCharges, 4);
        arraytxn["entityRevenue"] = decimalChopperFloat(txndetail.entityRevenue, 4);
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
  }
  )
  // res.json({ status: "200", resource: txn });
};
exports.wallet_consumerPreview = async function (req, res) {
  var query = { invoice: req.body.invoice, tType: req.body.type };
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

  const cursor = WalletLog.aggregate([
    { $match: query },
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
        mop: { $cond: { if: { $eq: ["$tType", "walletToBank"] }, then: "$bankinvoice.Mode_of_Pay", else: { $cond: { if: { $eq: ["$subType", "VA"] }, then: "Virtual Account", else: "$atominvoice.MOP" } } } },
        cardType: { $cond: { if: { $eq: ["$tType", "walletToBank"] }, then: "$bankinvoice.Mode_of_Pay", else: { $cond: { if: { $eq: ["$subType", "VA"] }, then: "Virtual Account", else: cardType } } } },

        pgType: { $cond: { if: { $eq: ["$tType", "walletToBank"] }, then: "bank", else: { $cond: { if: { $in: ["$tType", ["addMoney", "addFloat"]] }, then: { $cond: { if: { $eq: ["$subType", "VA"] }, then: "VA", else: "atom" } }, else: "" } } } },
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
        UTRNumber: "$va.UTRNumber",
      }
    }, {
      $project: {
        isConsumer: { $cond: { if: { $eq: ["$isConsumer", "consumer"] }, then: true, else: false } },
        mop: 1,
        pgType: 1,
        bankTxnID: 1,
        error_Desc: 1,
        bankName: 1,
        _id: 0, tType: 1, createDate: 1, truID: 1, Cr: 1, Dr: 1, invoice: 1, particulars: 1, status: 1, cardType: 1,
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
  function txnMadeBy(ctruID) {
    var query = { truID: ctruID, "__t": "KycAll" };
    return new Promise((resolve, reject) => {
      KycAll.find(query, function (err, docs) {  //consumer DB validations
        if (!docs.length) {                     //user not found
          reject("");
        } else {
          resolve(docs[0].fName + " " + docs[0].lName)
        }
      })
    })
  }

  for await (const txndetail of cursor) {
    var totAmt = txndetail.Cr != "0" ? txndetail.Cr : txndetail.Dr != "0" ? txndetail.Dr : "0"
    txndetail.mop = txndetail.mop;
    txndetail.totalAmount = decimalChopper(totAmt, 4);
    txndetail.name = await txnMadeBy(txndetail.truID)
    txndetail.tType = txndetail.tType;
    txndetail.againstInvoice = txndetail.againstInvoice ? txndetail.againstInvoice : "-";
    txn.push(txndetail);
  }
  if (txn.length > 0) {
    res.send({ status: "200", resource: txn[0] });
  }
  else {
    res.send({ status: "411", message: "No record Found" });
  }

};
function logpermission(truID, atruid, permissonobj) {
  var pNo = Date.parse(new Date());
  var permissionID = pNo.toString();
  permissionlog.findOneAndUpdate({ "permissionID": permissionID, "truID": truID, "aTruID": atruid },
    { $set: permissonobj }, { upsert: true }).exec(function (err, result) {
      if (err) {
        console.log("err", err);
      }
    });
}
function decimalChopper(num, fixed) {
  var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?');
  return num.toString().match(re)[0];
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
}
