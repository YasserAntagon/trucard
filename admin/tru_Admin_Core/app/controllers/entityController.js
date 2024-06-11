'use strict'
var KycAll = require('../models/entityModel/remmitKYCAllModel'),
  custKYCAll = require('../models/custModel/custKYCAllModel'),
  AuthKYC = require('../models/entityModel/remmitKYCAuthModel'),
  Stock = require('../models/entityModel/remmitStockModel'),
  Wallet = require('../models/entityModel/remmitWalletModel'),
  WalletLog = require('../models/entityModel/remmitWalletLogModel'),
  custTXN = require('../models/custModel/custTXNModel'),
  permission = require('../models/entityModel/remmitpermission'),
  permissionlog = require('../models/entityModel/remmitpermissionLog'),
  randomize = require('randomatic'),
  dlrStock = require('../models/assetmanagerModel/assetmanagerStockModel'),
  { calculateRate } = require('./extra/calculateRate'),
  request = require('request'),
  conf = require('../config'),
  fs = require('fs'),
  path = require('path');
var crypto = require('crypto'); //for md5 hash 
var bcrypt = require('bcrypt');
var salt = bcrypt.genSaltSync(10);
var randomize = require('randomatic');
const { exec } = require('child_process');
const walletSchema = require('../models/entityModel/remmitWalletModel');
let defaultConf = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../regionConf.json')));
exports.test = function (req, res) {
  res.json({ message: "Welcome to Company Admin Api" });
};

exports.ins_registration_from_admin = function (req, res) {    //only used for parent registration
  var auth = new AuthKYC(req.user);
  var kycall = new KycAll();
  var stock = new Stock();

  var subs = (req.body.fname).substr(0, 4); //to generate password firstname 4 letters
  var dat = new Date(req.body.dob);          //and birth year 4 digit
  var year = dat.getFullYear();
  var password = subs + year;

  var hashtwo = bcrypt.hashSync(password, salt);
  var crnno = randomize('A0', 7);
  let crnNo = 'r'.concat(crnno);
  var truid = randomize('0', 12);
  var truId = '8000'.concat(truid);
  var email = req.body.email;
  var mobile = req.body.mobile;

  auth.email = email;
  auth.mobile = mobile;
  auth.CRNNo = crnNo;
  auth.password = hashtwo;
  auth.appAccess = true;
  auth.isPwdReset = false;
  auth.isTPinReset = false;
  auth.createDate = new Date();
  auth.modifyDate = new Date();

  kycall.email = req.body.email;
  kycall.mobile = req.body.mobile;
  if (req.body.countrycode != undefined) { kycall.countryCode = req.body.countrycode }
  kycall.contactFName = req.body.fname;
  kycall.contactMName = req.body.mname;
  kycall.contactLName = req.body.lname;
  kycall.companyName = req.body.cname;
  kycall.CRNNo = crnNo;
  kycall.truID = truId;
  kycall.parentTruID = truId;
  kycall.referenceTruID = req.body.referencetruid;
  kycall.category = req.body.category;
  kycall.MID = req.body.mid;
  kycall.channel = "MT_company";            //created from admin 
  kycall.isParent = true;
  kycall.createDate = new Date();
  kycall.modifyDate = new Date();
  kycall.DOB = req.body.dob;
  kycall.gender = req.body.gender;
  kycall.createUser = 'Company Admin';
  kycall.image = '0';

  AuthKYC.find({ $or: [{ "email": email }, { mobile: req.body.mobile }] }, function (err, docs) {
    if (!docs.length) {
      auth.save(function (err) {
        if (err) {
          // console.log(err)
          res.json({ status: "400", message: 'Fields with * required' });

        } else {

          KycAll.find({ $or: [{ "email": email }, { mobile: req.body.mobile }] }, function (err, docs) {
            if (!docs.length) {
              kycall.save(function (err) {
                if (err) {
                  console.log(err);
                  res.json({ status: '204', message: 'something went wrong. Please try again.' });
                } else {
                  ins_stock();
                  add_wallet();
                  res.json({ status: '200', message: 'Agent Entity Created Successfully!', truID: truId, CRNNo: crnNo });
                }
              });

              function ins_stock(err, numAffected) {
                if (err)
                  res.send(err);
                var query = { truID: truId };
                var respresult = Stock.findOneAndUpdate({ truID: truId },
                  {
                    $set: {
                      "lendingRate.expRate": "0.00", "lendingRate.joiningFee": "0.00", "lendingRate.ROI": "0.00",
                      "lendingRate.otherCharges": "0.00", "lendingRate.penalty": "0.00",
                      "lendingRate.minLoanAmount": "0.00", "lendingRate.maxLoanAmount": "0.00",
                      "stock.G24K": "0.00", "stock.S99P": "0.00",
                      "lStock.G24K": "0.00", "lStock.S99P": "0.00"
                    }
                  },
                  { upsert: true, multi: true })
                respresult.exec(function (err, result) {
                  if (err) {
                    res.json({ status: '204', message: 'something went wrong. Please try again.' });
                  }
                  else {
                    var resource = result;
                  }
                }
                )
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
                    res.json({ status: '204', message: 'something went wrong. Please try again.' });
                  }
                  else {
                    var fname = req.body.fname;
                    var lname = req.body.lname;
                    notification_controller.notification_registartion(truId, fname);

                    var date = Date.parse(new Date());
                    var hashstr = crnNo + date.toString();
                    var url2 = crypto.createHash('md5').update(hashstr).digest('hex');

                    KycAll.findOneAndUpdate({ truID: truId }, { $set: { emailVerificationCode: url2 } }).exec()
                    email_controller.email_registartion(fname, fname, lname, url2);
                  }
                }
                )
              }
            }
            else { }
          }
          )
        }
      });
    }


    else {
      res.json({ status: '204', message: 'User Already Exists!' }); // means He can either able to login or in case new reg he need to use new email
    }
  }
  )
};

exports.list_profile_for_admin = function (req, res) {
  var truid = req.body.truid;
  KycAll.find({
    $or: [{ email: truid }, { mobile: truid }, { truID: truid }]
  }, function (err, docs) {
    if (!docs.length) {
      res.json({ status: "204", message: "The request was successful but no body was returned." });
    } else {
      KycAll.aggregate([
        { $match: { __t: "KycAll", $or: [{ email: truid }, { mobile: truid }, { truID: truid }] } },
        {
          $project: {
            contactFName: 1, contactLName: 1, _id: 0, truID: 1, mobile: 1, KYCFlag: 1, email: 1, image: 1, countryCode: 1, CRNNo: 1,
            isParent: 1, KYCDetails: 1, DOB: 1, aboutMe: 1, gender: 1, contactMName: 1, companyName: 1, address: 1, parentTruID: 1, aadharStatus: 1, panStatus: 1
          }
        },
        {
          $lookup: {
            localField: "truID",
            foreignField: "truID",
            from: "wallets",
            as: "wl"
          }
        },
        { $unwind: { path: "$wl", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            contactFName: 1, contactLName: 1, _id: 0, truID: 1, mobile: 1, KYCFlag: 1, email: 1, image: 1, countryCode: 1, CRNNo: 1,
            isParent: 1, KYCDetails: 1, DOB: 1, aboutMe: 1, gender: 1, contactMName: 1, companyName: 1, address: 1, parentTruID: 1, "WBal": "$wl.clBal", aadharStatus: 1, panStatus: 1
          }
        },
        {
          $lookup: {
            localField: "truID",
            foreignField: "truID",
            from: "stocks",
            as: "stock"
          }
        },
        { $unwind: { path: "$stock", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            contactFName: 1, contactLName: 1, _id: 0, truID: 1, mobile: 1, KYCFlag: 1, email: 1, image: 1, countryCode: 1, CRNNo: 1,
            isParent: 1, KYCDetails: 1, DOB: 1, aboutMe: 1, gender: 1, contactMName: 1, companyName: 1, address: 1, parentTruID: 1, WBal: 1,
            "stock": "$stock.stock", aadharStatus: 1, panStatus: 1
          }
        },
        {
          $lookup: {
            localField: "parentTruID",
            foreignField: "truID",
            from: "kycs",
            as: "parent"
          }
        },
        { $unwind: { path: "$parent", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            contactFName: 1, contactLName: 1, _id: 0, truID: 1, mobile: 1, KYCFlag: 1, email: 1, image: 1, countryCode: 1, CRNNo: 1,
            isParent: 1, KYCDetails: 1, DOB: 1, aboutMe: 1, gender: 1, contactMName: 1, companyName: 1, address: 1, parentTruID: 1, WBal: { "$toString": "$WBal" },
            stock: 1, parentCity: "$parent.address.city", parentCountry: "$parent.address.country",
            parentCompanyName: "$parent.companyName", parentImage: "$parent.image", aadharStatus: 1, panStatus: 1
          }
        },
      ]).exec(function (err, result) {
        if (err) {
          response.status(500).send({ error: err })
          return next(err);
        }
        else {
          var fName = result[0].contactFName,
            lName = result[0].contactLName,
            truID = result[0].truID,
            mobile = result[0].mobile,
            KYCFlag = result[0].KYCFlag,
            email = result[0].email,
            crnno = result[0].CRNNo;

          // var serverpath = Gen.doc;
          var KYCDetails = result[0].KYCDetails ? result[0].KYCDetails : new Array();
          /*  if (result[0].KYCDetails) {
             for (var i = 0; i < result[0].KYCDetails.length; i++) {
               var kycelements = result[0].KYCDetails[i];
               var kycaray = {};
               kycaray["docNumber"] = kycelements.docNumber;
               kycaray["docTitle"] = kycelements.docTitle;
               var doc = kycelements.docFile;
               kycaray["docFile"] = doc;
               //  kycaray["docFile"] = serverpath.concat(doc);
 
               KYCDetails.push(kycaray);
             }
           } */
          var parentImage = result[0].parentImage,
            parentCompanyName = result[0].parentCompanyName,
            parentCountry = result[0].parentCountry,
            parentCity = result[0].parentCity,
            DOB = result[0].DOB,
            aboutMe = result[0].aboutMe,
            gender = result[0].gender,
            mName = result[0].contactMName,
            companyName = result[0].companyName,
            address = result[0].address,
            aadharStatus = result[0].aadharStatus,
            panStatus = result[0].panStatus,
            isParent = result[0].isParent,
            parentTruID = result[0].parentTruID,
            image = result[0].image,
            countryCode = result[0].countryCode,
            wbal = result[0].WBal,
            stock24 = result[0].stock ? result[0].stock.G24K : "0",
            stock99 = result[0].stock ? result[0].stock.S99P : "0",
            nodes = "0", pcity = "0";
          async function finalResp() {
            if (isParent === true) {
              // nodes = KycAll.find({parentTruID: truID ,truID:{$ne:truid}});
              KycAll.find({ parentTruID: truID, isParent: false }, function (err, data) {
                if (err || !data.length) {
                  nodes = "0"
                }
                else {
                  if (!data.length) {
                    nodes = "0"
                  } else {
                    nodes = data.length.toString();
                  }
                }
                res.json({
                  status: "200", resource:
                  {
                    fName: fName, lName: lName, truID: truID, mobile: mobile, KYCFlag: KYCFlag, email: email,
                    countryCode: countryCode, image: image, KYCDetails: KYCDetails, DOB: DOB, aboutMe: aboutMe,
                    gender: gender, mName: mName, companyName: companyName, address: address,
                    isParent: isParent, parentTruID: parentTruID, CRNNo: crnno, balance: wbal, nodes: nodes, aadharStatus: aadharStatus, panStatus: panStatus,
                    parentCity: pcity,
                    stock: { G24K: stock24, S99P: stock99 }
                  }
                });
              });

            } else {
              KycAll.find({ parentTruID: parentTruID }, function (err, result) {
                if (err || !result.length) {
                  pcity = "0"
                }
                else {
                  pcity = result[0].address ? result[0].address.city : "0";
                }
                res.json({
                  status: "200", resource:
                  {
                    fName: fName, lName: lName, truID: truID, mobile: mobile, KYCFlag: KYCFlag, email: email,
                    countryCode: countryCode, image: image, KYCDetails: KYCDetails, DOB: DOB, aboutMe: aboutMe,
                    gender: gender, mName: mName, companyName: companyName, address: address,
                    isParent: isParent, parentTruID: parentTruID, CRNNo: crnno, balance: wbal, nodes: nodes, aadharStatus: aadharStatus, panStatus: panStatus,
                    parentImage: parentImage, parentCompanyName: parentCompanyName, parentCountry: parentCountry,
                    parentCity: parentCity, stock: { G24K: stock24, S99P: stock99 }
                  }
                });
              });
            }
          }
          finalResp();
        }
      }
      )
    }
  }
  )
};
exports.update_address_for_admin = function (req, res) {
  var query = { truID: req.body.truid };
  KycAll.find(query, function (err, docs) {
    if (!docs.length) {
      res.json({
        status: "204",
        message: "The request was successful but no body was returned."
      });
    } else {
      KycAll.findOneAndUpdate(query, {
        $set: {
          "address.houseNumber": req.body.housenumber, "address.streetNumber": req.body.streetnumber, "address.landmark": req.body.landmark,
          "address.pin": req.body.pin, "address.city": req.body.city, "address.state": req.body.state, "address.country": req.body.country,
          mName: req.body.mname, "address.location": { type: "Point", coordinates: [req.body.longitude, req.body.latitude] },
          KYCFlag: "active"
        }
      }, callback)

      function callback(err, numAffected) {
        if (err)
          res.send(err);
        KycAll.aggregate([{ "$match": query }, {
          "$project": {
            _id: 0,
            name: { "$concat": ["$contactFName", " ", "$contactLName"] }
          }
        }]).exec(function (err, result) {
          if (err) {
            response.status(500).send({ error: err })
            return next(err);
          }
          else {
            res.json({ status: "200", resource: result });
          }
        }
        )
      }
    }
  }
  )
};

exports.add_node = function (req, res) {
  var auth = new AuthKYC(req.user);
  var kycall = new KycAll();
  var stock = new Stock();
  var parentid = req.body.parentid;

  KycAll.find({
    "truID": parentid
  }, function (err, docs) {
    if (!docs.length) {
      res.json({
        status: "204",
        message: "No parent Entity found"
      });
    } else {

      var hashtwo = bcrypt.hashSync(req.body.password, salt);
      var crnno = randomize('A0', 7);
      var crnNo = 'r'.concat(crnno);
      var truid = randomize('0', 12);
      var truId = '8000'.concat(truid);
      var email = req.body.email;
      var mobile = req.body.mobile;

      auth.email = email;
      auth.mobile = mobile;
      auth.CRNNo = crnNo;
      auth.password = hashtwo;
      auth.isPwdReset = false;
      auth.isTPinReset = false;
      auth.mPINSet = false;
      auth.appAccess = true;
      auth.createDate = new Date();
      auth.modifyDate = new Date();
      kycall.email = req.body.email;
      kycall.mobile = req.body.mobile;
      if (req.body.countrycode != undefined) { kycall.countryCode = req.body.countrycode }
      kycall.contactFName = req.body.fname;
      kycall.contactMName = req.body.mname;
      kycall.contactLName = req.body.lname;
      kycall.companyName = req.body.cname;
      kycall.CRNNo = crnNo;
      kycall.CINNo = req.body.cinno;
      kycall.truID = truId;
      kycall.parentTruID = parentid;
      kycall.referenceTruID = parentid;
      kycall.MID = docs[0].MID;
      kycall.channel = docs[0].MID;
      kycall.isParent = false;
      kycall.createDate = new Date();
      kycall.modifyDate = new Date();
      kycall.createUser = 'User';
      kycall.image = '0';

      AuthKYC.find({ $or: [{ "email": email }, { mobile: req.body.mobile }] }, function (err, docs) {
        if (!docs.length) {
          auth.save(function (err) {
            if (err) {
              console.log(err)
              res.json({ status: "4000", message: 'Fields with * required' });

            }
            res.json({ status: '200', message: 'Agent Entity Created Successfully!', truID: truId });
          }
          )
        }

        else {
          res.json({ status: '204', message: 'User Already Exists!' });
        }

        KycAll.find({ $or: [{ "email": email }, { mobile: req.body.mobile }] }, function (err, docs) {
          if (!docs.length) {
            kycall.save(function (err) {
              if (err)
                console.log(err)
              ins_stock();
              add_wallet();
            });

            function ins_stock(err, numAffected) {
              if (err)
                res.send(err);
              var query = { truID: truId };
              var respresult = Stock.findOneAndUpdate(query,
                {
                  $set: {
                    "lendingRate.expRate": "0.00", "lendingRate.joiningFee": "0.00", "lendingRate.ROI": "0.00",
                    "lendingRate.otherCharges": "0.00", "lendingRate.penalty": "0.00",
                    "lendingRate.minLoanAmount": "0.00", "lendingRate.maxLoanAmount": "0.00",
                    "stock.G24K": "0.00", "stock.S99P": "0.00",
                    "lStock.G24K": "0.00", "lStock.S99P": "0.00"
                  }
                },
                { upsert: true, multi: true })
              respresult.exec(function (err, result) {
                if (err) {
                  res.json({ status: '204', message: 'something went wrong. Please try again.' });
                }
                else {
                  var resource = result;
                }
              }
              )
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
                  res.json({ status: '204', message: 'something went wrong. Please try again.' });
                }
                else {
                  var fname = req.body.fname;
                  var lname = req.body.lname;
                  notification_controller.notification_registartion(truId, fname);
                  var date = Date.parse(new Date());
                  var hashstr = crnNo + date.toString();
                  var url2 = crypto.createHash('md5').update(hashstr).digest('hex');
                  KycAll.findOneAndUpdate({ truID: truId }, { $set: { emailVerificationCode: url2 } }).exec()
                  email_controller.email_registartion(fname, fname, lname, url2);
                }
              })
            }
          }
        }
        )
      }
      )
    }
  }
  )
};

exports.update_reg_for_admin = function (req, res) {
  var truid = req.body.truid; KycAll.aggregate([
    { $match: { isParent: false, parentTruID: truid } },
    {
      $project: {
        KYCFlag: 1, DOB: 1, address: 1, KYCDetails: 1, email: 1, mobile: 1, truID: 1, _id: 0,
        contactFName: 1, contactLName: 1, companyName: 1
      }
    },
    {
      $project: {
        KYCFlag: 1, DOB: 1, address: 1, KYCDetails: 1, email: 1, mobile: 1, truID: 1, _id: 0,
        contactFName: 1, contactLName: 1, companyName: 1
      }
    },
  ]).exec(function (err, result) {

    KycAll.find({
      truID: truid
    }, function (err, docs) {
      if (!docs.length) {
        res.json({
          status: "204",
          message: "The request was successful but no body was returned."
        });
      }
      else {
        var Authupdt = {};
        var KYCupdt = {};
        req.body.email ? Authupdt.email = req.body.email : null;
        req.body.mobile ? Authupdt.mobile = req.body.mobile : null;
        req.body.email ? KYCupdt.email = req.body.email : null;
        req.body.mobile ? KYCupdt.mobile = req.body.mobile : null;
        req.body.cname ? KYCupdt.companyName = req.body.cname : null;
        req.body.fname ? KYCupdt.contactFName = req.body.fname : null;
        req.body.mname ? KYCupdt.contactMName = req.body.mname : null;
        req.body.lname ? KYCupdt.contactLName = req.body.lname : null;
        req.body.DOB ? KYCupdt.DOB = req.body.DOB : null;
        req.body.gender ? KYCupdt.gender = req.body.gender : null;
        KycAll.findOneAndUpdate({ truID: truid }, { $set: KYCupdt }).exec();
        if (req.body.email || req.body.mobile) {
          AuthKYC.findOneAndUpdate({ CRNNo: docs[0].CRNNo }, { $set: Authupdt }).exec();
        }
        res.json({
          status: "200", message: "Details Updated Successfully."
        });
      }
    })
  })
};

exports.list_entity_with_consumer_count = function (req, res) {
  //this report shows all node counts, all consumer counts in an entity network, 
  //all successful transactions form consumer ==> count and amount of transactions with bullion types in an entity network.
  var truid = req.body.truid;
  KycAll.find({ "truID": truid, isParent: true }, function (err, docs) {
    if (!docs.length) {
      res.json({ status: "204", message: "Please select Parent entity for this request." });
    } else {
      KycAll.aggregate([{ $match: { parentTruID: truid, isParent: false } },
      {
        $project: {
          KYCFlag: 1, DOB: 1, address: 1, KYCDetails: 1, email: 1, mobile: 1, truID: 1, _id: 0, createDate: 1,
          contactFName: 1, contactLName: 1, companyName: 1
        }
      }
      ]).exec(function (err, noderesult) {
        if (err) {
          res.json({ status: "204", message: "Something went wrong!" });
        }
        else {
          if (!noderesult || !noderesult.length) {
            res.json({ status: "204", message: "No data!" });

          } else {

            async function finalResponse() {
              var resparr = new Array(), i = 0;
              for (i; i < noderesult.length; i++) {
                var noderesultobj = noderesult[i];
                noderesultobj["consumerCount"] = await getConsumerCount(noderesultobj.truID);
                noderesultobj.createDate = new Date(Date.parse(noderesultobj.createDate));

                resparr.push(noderesultobj);
              }
              if (resparr.length == i) {
                res.json({ status: "200", resource: resparr });
              }
              else {
                res.json({ status: "204", message: "Something went wrong!!" });
              }
            }


            function getConsumerCount(truid) {
              return new Promise((resolve, reject) => {
                request.post({
                  "headers": { "content-type": "application/json" },
                  "url": conf.reqip + ":4112/api/consumercountentity",
                  "body": JSON.stringify({
                    "truid": truid
                  })
                }, (error, response, body) => {
                  if (error) {
                    reject(error);
                  } else {
                    var count = JSON.parse(body).count;
                    resolve(count);
                  }
                }
                )
              }
              )
            }

            finalResponse();
          }
        }
      }
      )
    }
  }
  )
};

exports.find_entity = function (req, res) {
  var badd = new KycAll(req.user);
  var truid = req.body.truid;
  var ptruid = req.body.ptruid;

  KycAll.find({
    $or: [{ truID: truid }, { "address.city": truid }], parentTruID: ptruid, isParent: false
  }, function (err, docs) {
    if (!docs.length) {
      res.json({
        status: "204",
        message: "The request was successful but no body was returned."
      });
    } else {
      KycAll.aggregate([
        { $match: { __t: "KycAll", isParent: false, parentTruID: ptruid, $or: [{ truID: truid }, { "address.city": truid }] } },
        {
          $project: {
            KYCFlag: 1, DOB: 1, address: 1, KYCDetails: 1, email: 1, mobile: 1, truID: 1, _id: 0,
            contactFName: 1, contactLName: 1, companyName: 1
          }
        },
        {
          $project: {
            KYCFlag: 1, DOB: 1, address: 1, KYCDetails: 1, email: 1, mobile: 1, truID: 1, _id: 0,
            contactFName: 1, contactLName: 1, companyName: 1
          }
        }
      ]).exec(function (err, result) {
        if (err) {
          response.status(500).send({ error: err })
          return next(err);
        }
        else {
          res.json({ status: "200", resource: result });
        }
      }
      )
    }
  }
  )
};

exports.Update_KYCDocs_from_entity = function (req, res) {
  var badd = new KycAll(req.user);
  var truid = req.body.truid;
  var query = { truID: truid };

  KycAll.find(
    query, function (err, docs) {
      if (!docs.length) {
        res.json({
          status: "204",
          message: "The request was successful but no body was returned."
        });
      } else {
        KycAll.findOneAndUpdate(query, { $set: { KYCDetails: req.body.kycdetails, KYCFlag: "pending" } }, callback)

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

exports.entity_up_kyc_flag_admin = function (req, res) {
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
      if (req.body.node === "all") {
        KycAll.aggregate([
          { $match: { parentTruID: truid, __t: "KycAll" } },
          { $project: { _id: 0, truID: 1, parentTruID: 1 } },
          {
            $group: {
              _id: "$parentTruID",
              assetmanagers: { $addToSet: "$truID" }
            }
          },
          { $project: { assetmanagers: 1, _id: 0 } }
        ]).exec(function (err, result) {
          if (err) {
            response.status(500).send({ error: err })
            return next(err);
          }
          else {
            var resource = result[0].assetmanagers;

            KycAll.update({ "truID": { $in: resource } }, {
              $set: {
                KYCFlag: kycflag,
                KYCDesc: kycdesc
              }
            }, { multi: true }, callback);
          }
        }
        )
      } else {
        var docverified = docs[0].docVerified;
        var updated = {
          KYCFlag: kycflag,
          KYCDesc: kycdesc,
          docVerified: true,
          KYCTime: new Date(),
          KYCVerifyBy: atruid
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
    }
  })
}
exports.list_admin_enitity_city = function (req, res) {
  var badd = new KycAll(req.user);
  var truid = req.body.truid;

  KycAll.find({ truID: truid, parentTruID: truid, isParent: true }, function (err, docs) {
    if (!docs.length) {
      res.json({
        status: "204",
        message: 'The request was successful but no TruID was returned.'
      });
    }
    else {
      KycAll.aggregate([
        { $match: { parentTruID: truid } },
        { $project: { address: 1, parentTruID: 1 } },
        { $skip: 1 },
        { $project: { city: "$address.city", _id: 0, parentTruID: 1 } },
        { $group: { _id: "$parentTruID", city: { $addToSet: "$city" } } },
        { $project: { city: 1, _id: 0 } }
      ]).exec(function (err, result) {
        if (err) {
          response.status(500).send({ error: err })
          return next(err);
        }
        else {
          if (!result[0].city.length) {
            res.json({ status: "204", message: "City not found." });
          } else {
            res.json({ status: "200", city: result[0].city });
          }
        }
      }
      )
    }
  }
  )
};

exports.list_all_parent_for_admin = function (req, res) {
  var badd = new KycAll(req.user);

  KycAll.aggregate([
    { $match: { __t: "KycAll", isParent: true } },
    {
      $project: {
        contactFName: 1, contactLName: 1, _id: 0, truID: 1, mobile: 1, KYCFlag: 1, email: 1,
        // image : {$concat : [Gen.profile,"$image"]},isParent:1,KYCDetails:1,
        image: 1, isParent: 1, KYCDetails: 1, createDate: 1,
        DOB: 1, aboutMe: 1, gender: 1, contactMName: 1, companyName: 1, address: 1, parentTruID: 1
      }
    }
  ]).exec(function (err, result) {
    if (err) {
      response.status(500).send({ error: err })
      return next(err);
    }
    else {

      res.json({ status: "200", resource: result })
    }
  }
  )
};

exports.count_all_entity = function (req, res) {

  KycAll.aggregate([
    { $match: { "__t": "KycAll" } },
    {
      $facet: {
        parent: [
          { $match: { isParent: true, createUser: { $ne: "Company Admin" } } },
          { $count: "count" }
        ],
        nodes: [
          { $match: { isParent: false } },
          { $count: "count" }
        ],
        adminParent: [
          { $match: { isParent: true, createUser: "Company Admin" } },
          { $count: "count" }
        ],

        total: [{ $count: "count" }
        ]
      }
    }
  ]).exec(function (err, result) {
    if (!result.length) {
      res.json({ status: "204", message: "No entity found!" });
    }
    else {
      var parent = "0", nodes = "0", lender = "0", total = "0", adminParent = "0", adminLender = "0";
      if (result[0].parent.length) {
        parent = result[0].parent[0].count.toString();
      }
      if (result[0].nodes.length) {
        nodes = result[0].nodes[0].count.toString();
      }
      if (result[0].lender.length) {
        lender = result[0].lender[0].count.toString();
      }
      if (result[0].adminParent.length) {
        adminParent = result[0].adminParent[0].count.toString();
      }
      if (result[0].adminLender.length) {
        adminLender = result[0].adminLender[0].count.toString();
      }
      if (result[0].total.length) {
        total = result[0].total[0].count.toString();
      }
      var finalresp = ({
        direct: {
          parent: parent,
          nodes: nodes,
          lender: lender
        },
        admin: {
          parent: adminParent,
          lender: adminLender
        },
        total: total
      });
      res.json({ status: "200", resource: finalresp });
    }
  }
  )
};

exports.parent_entity_report_admin = function (req, res) {
  //this report shows all node counts, all consumer counts in an entity network, 
  //all successful transactions form consumer ==> count and amount of transactions with bullion types in an entity network.
  var truid = req.body.rTruID;
  var flag = req.body.flag;
  var query = { "parentTruID": truid };

  KycAll.find({ "truID": truid }, async function (err, docs) {
    if (!docs.length) {
      res.json({ status: "204", message: "The request was successful but no body was returned." });
    } else {
      var matchqry = { sourceFlag: "remmit", status: "success", rTruID: truid };
      var assmatchqry = { status: "success", to: truid };
      if (docs[0].isParent) {
        var kycNodes = await KycAll.aggregate([{ $match: { parentTruID: truid } },
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
        matchqry = { sourceFlag: "remmit", status: "success", rTruID: { $in: kycNodes[0].nodeTruID } };
        assmatchqry = { status: "success", to: { $in: kycNodes[0].nodeTruID } };
      }

      if (req.body.startdate && req.body.enddate) {
        var startdate = new Date(Date.parse(req.body.startdate));
        var enddate = new Date(Date.parse(req.body.enddate));
        matchqry.createDate = { $gte: startdate, $lte: enddate };
        assmatchqry.createDate = { $gte: startdate, $lte: enddate };
      }
      var consumerTxn = await custTXN.aggregate([{ $match: matchqry },
      {
        $facet: {
          alltxncount: [{ $count: "count" }],
          alltxndetail: [
            {
              $group: {
                _id: null,
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
              amount24: { $sum: "$amt24" },
              amount99: { $sum: "$amt99" },
              qty24: { $sum: "$qty24" },
              qty99: { $sum: "$qty99" }
            }
          },
          ]
        }
      }
      ])
      if (consumerTxn.length > 0) {
        var resource = consumerTxn[0];
        var allTxn = {
          "txnCount": resource.alltxncount.length ? resource.alltxncount[0].count.toString() : "0",
          "totalAmount": resource.alltxndetail.length ? resource.alltxndetail[0].totalamount.toJSON().$numberDecimal : "0",
          "totalQTY": resource.alltxndetail.length ? resource.alltxndetail[0].totalqty.toJSON().$numberDecimal : "0",
          "totalTAX": resource.alltxndetail.length ? resource.alltxndetail[0].totaltax.toJSON().$numberDecimal : "0",
        }
        var buy = {
          "g24kTotalAmount": resource.buy.length ? resource.buy[0].amount24.toJSON().$numberDecimal : "0",
          "s99pTotalAmount": resource.buy.length ? resource.buy[0].amount99.toJSON().$numberDecimal : "0",
          "g24kTotalQTY": resource.buy.length ? resource.buy[0].qty24.toJSON().$numberDecimal : "0",
          "s99pTotalQTY": resource.buy.length ? resource.buy[0].qty99.toJSON().$numberDecimal : "0"
        };
        var redeemCash = {
          "g24kTotalAmount": resource.redeemCash.length ? resource.redeemCash[0].amount24.toJSON().$numberDecimal : "0",
          "s99pTotalAmount": resource.redeemCash.length ? resource.redeemCash[0].amount99.toJSON().$numberDecimal : "0",
          "g24kTotalQTY": resource.redeemCash.length ? resource.redeemCash[0].qty24.toJSON().$numberDecimal : "0",
          "s99pTotalQTY": resource.redeemCash.length ? resource.redeemCash[0].qty99.toJSON().$numberDecimal : "0"
        }
        var buyx = buy;
        var redeemCashx = redeemCash;
        var enallTxnx = allTxn;
        var finalresp = {
          "allTxn": enallTxnx,
          "buy": buyx,
          "redeemCash": redeemCashx,
          "transfer": {
            "g24kTotalAmount": resource.transfer.length ? resource.transfer[0].amount24.toJSON().$numberDecimal : "0",
            "s99pTotalAmount": resource.transfer.length ? resource.transfer[0].amount99.toJSON().$numberDecimal : "0",
            "g24kTotalQTY": resource.transfer.length ? resource.transfer[0].qty24.toJSON().$numberDecimal : "0",
            "s99pTotalQTY": resource.transfer.length ? resource.transfer[0].qty99.toJSON().$numberDecimal : "0"
          }
        };
        res.json({ status: "200", resource: finalresp });
      }
      else {
        res.json({ status: "411", resource: [] });
      }
    }
  })
};

exports.show_all_entity_admin = function (req, res) {

  KycAll.aggregate([
    { $match: { __t: "KycAll" } },
    {
      $project: {
        KYCFlag: 1, DOB: 1, address: 1, KYCDetails: 1, email: 1, mobile: 1, truID: 1, _id: 0, image: 1,
        createDate: 1, contactFName: 1, contactLName: 1, companyName: 1, docVerified: 1, parentTruID: 1, isParent: 1, CRNNo: 1, MID: 1,
        referenceTruID: 1, countryCode: 1, contactMName: 1, gender: 1, KYCTime: 1, KYCVerifyBy: 1, aadharStatus: 1, panStatus: 1
      }
    },
    { $sort: { createDate: -1 } }
  ]).exec(function (err, result) {
    if (err) {
      res.json({ status: "204", message: "Something went wrong!" });
    } else {
      if (!result.length) {
        res.json({ status: "204", message: "No entity nodes found!" });
      } else {
        // var resresult = new Array(),
        var startdate = Date.parse(req.body.startdate);
        if (req.body.dateflag === true) {
          var output = result.map(data => {
            if (data.hasOwnProperty("MID")) {
              data.MT_Type = data.MID;
              delete data.MID;
            }
            return data;
          })
          result = output.filter(function (resultobj) {
            return Date.parse(resultobj.createDate) > startdate;
          });
        }
        // for(var i=0 ;i<result.length;i++){
        //   var resultobj = result[i];
        //   resultobj.createDate = new Date(Date.parse(result[i].createDate));;
        //   resresult.push(resultobj)
        // }


        res.json({ status: "200", resource: result, count: result.length.toString() });
        // }
      }
    }
  }
  )
};

exports.node_entity_report_admin = function (req, res) {
  //this report shows all node counts, all consumer counts in an entity network, 
  //all successful transactions form consumer ==> count and amount of transactions with bullion types in an entity network.
  var truid = req.body.truid;

  KycAll.find({ "truID": truid }, function (err, docs) {
    if (!docs.length) {
      res.json({ status: "204", message: "The request was successful but no body was returned." });
    } else {

      request.post({
        "headers": { "content-type": "application/json" },
        "url": conf.reqip + ":4112/api/nodeentitydetailedreportadmin",
        "body": JSON.stringify({
          "truid": truid,
          "dateflag": req.body.dateflag,
          "startdate": req.body.startdate,
          "enddate": req.body.enddate
        })
      }, (error, response, resbody) => {
        if (error) {
          res.json({ status: "204", message: "Something went wrong!" });
        }
        var newjson = JSON.parse(resbody);
        /* newjson.nodeCount = nodecount; */
        res.json(newjson);
      }
      )
    }
  }
  )
};

exports.partnerEarnedRevenueFromCompany = async function (req, res) {
  var startdate = new Date(Date.parse(req.body.startDate));
  var enddate = new Date(Date.parse(req.body.endDate));
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
  var revenueQuery = [{
    $group: {
      _id: "$truID",
      Cr: { $sum: "$Cr" }
    }
  },
  {
    $project: {
      _id: 0,
      revenue: { $toString: "$Cr" }
    }
  }
  ];
  var totalrevenueQuery = [{ $match: { "truID": req.body.rTruID, tType: "revenue" } }];
  var todayrevenueQuery = [{ $match: { "truID": req.body.rTruID, tType: "revenue", createDate: { $gte: todaydt } } }];
  var yesterdayrevenueQuery = [{ $match: { "truID": req.body.rTruID, tType: "revenue", createDate: { $gte: yesterdaydt, $lte: todaydt } } }];
  var weeklyrevenueQuery = [{ $match: { "truID": req.body.rTruID, tType: "revenue", createDate: { $gte: weekdt } } }];
  var monthlyrevenueQuery = [{ $match: { "truID": req.body.rTruID, tType: "revenue", createDate: { $gte: monthdt } } }];
  var cursorSell = await WalletLog.aggregate([{ $match: { "truID": req.body.rTruID, tType: "revenue" } },
  {
    $facet: {
      totalRevenue: totalrevenueQuery.concat(revenueQuery),
      todayRevenue: todayrevenueQuery.concat(revenueQuery),
      yesterdayRevenue: yesterdayrevenueQuery.concat(revenueQuery),
      weekRevenue: weeklyrevenueQuery.concat(revenueQuery),
      monthRevenue: monthlyrevenueQuery.concat(revenueQuery),
    }
  }]);
  if (cursorSell.length > 0) {
    var resource = cursorSell[0];
    var respo = {};
    respo.totalRevenue = resource.totalRevenue.length ? parseFloat(resource.totalRevenue[0].revenue) : 0;
    respo.todayRevenue = resource.todayRevenue.length ? parseFloat(resource.todayRevenue[0].revenue) : 0;
    respo.yesterdayRevenue = resource.yesterdayRevenue.length ? parseFloat(resource.yesterdayRevenue[0].revenue) : 0;
    respo.weekRevenue = resource.weekRevenue.length ? parseFloat(resource.weekRevenue[0].revenue) : 0;
    respo.monthRevenue = resource.monthRevenue.length ? parseFloat(resource.monthRevenue[0].revenue) : 0;
    res.json({ status: "200", resource: respo });
  }
  else {
    var respo = {
      totalRevenue: 0,
      todayRevenue: 0,
      yesterdayRevenue: 0,
      weekRevenue: 0,
      monthRevenue: 0
    }
    res.json({ status: "411", message: "no record found", resource: respo });
  }

}
exports.entity_wallet_log_report = async function (req, res) {
  var truid = req.body.truid;

  var cursorSell = WalletLog.aggregate([{ $match: { "truID": truid } }, { $sort: { _id: -1 } }, { $limit: 100 }]).allowDiskUse(true).cursor({ batchSize: 1000 })
  var result = new Array();
  for await (const txndetail of cursorSell) {
    result.push(txndetail)
  }
  async function CheckTxn() {
    await Promise.all(result.map(async (data, index) => {
      data.Cr = data.Cr.toJSON().$numberDecimal;
      data.Dr = data.Dr.toJSON().$numberDecimal;
      if (data.againstInvoice && data.tType == "revenue") {
        try {
          var resulult = await custTXN.aggregate([{ $match: { "invoice": data.againstInvoice } }]);
          if (resulult.length > 0) {
            var resul = resulult[0]
            if (resul && resul.to) {
              data.to = resul.to;
            }
            data.totalAmount = resul.totalAmount ? resul.totalAmount.toJSON().$numberDecimal : resul.totalAmount;
            data.txnType = resul.type;
            data.againstInvoice = data.againstInvoice;
          }
          else {
            data.txnType = "-";
          }
        } catch (ex) {
          console.log(ex, resul)
        }
      }
      else {
        data.txnType = "-";
      }
    }))
    res.json({ status: "200", resource: result })
  }
  CheckTxn();


};


exports.add_money_log_report = function (req, res) {
  var truid = req.body.truid;
  var flag = req.body.flag;
  KycAll.find({ truID: truid }, function (err, docs) {
    if (!docs.length) {
      res.json({
        status: "204",
        message: 'The request was successful but no TruID was returned.'
      });
    }
    else {
      Atom.aggregate([
        {
          $facet: {
            success: [
              { $match: { status: { $in: ["Ok", "success_00"] }, customerTruID: truid, tType: "addMoney" } },
              {
                $project: {
                  _id: 0, atomID: 1, amount: 1, surcharge: 1, prodid: 1, bankTxnID: 1, status: 1,
                  createDate: 1, assetmanagerTruID: 1, bankName: 1, MOP: 1, cardNumber: 1, failureReason: 1,
                  userName: 1, email: 1, mobile: 1, address: 1, tType: 1, atomDate: 1, tStatus: "success"
                }
              },
              { $sort: { createDate: -1 } },
              { $limit: 30 }
            ],
            failure: [
              { $match: { status: { $in: ["F", "F_05"] }, customerTruID: truid, tType: "addMoney" } },
              {
                $project: {
                  _id: 0, atomID: 1, amount: 1, surcharge: 1, prodid: 1, bankTxnID: 1, status: 1,
                  createDate: 1, assetmanagerTruID: 1, bankName: 1, MOP: 1, cardNumber: 1, failureReason: 1,
                  userName: 1, email: 1, mobile: 1, address: 1, tType: 1, atomDate: 1, tStatus: "failure"
                }
              },
              { $sort: { createDate: -1 } },
              { $limit: 30 }
            ]
          }
        },
        { $project: { all: { $setUnion: ["$success", "$failure"] } } },
        { $sort: { createDate: -1 } }
      ]).exec(function (err, result) {
        if (err) {
          res.status(500).send({
            error: err
          })
        } else {
          var resource = result[0];

          var success = new Array();
          for (var i = 0; i < resource.all.length; i++) {
            var successdetail = resource.all[i];
            var arraysuccess = {};
            arraysuccess["atomID"] = successdetail.atomID;
            arraysuccess["amount"] = successdetail.amount.toJSON().$numberDecimal;
            arraysuccess["surcharge"] = successdetail.surcharge.toJSON().$numberDecimal;
            arraysuccess["prodid"] = successdetail.prodid;
            arraysuccess["bankTxnID"] = successdetail.bankTxnID;
            arraysuccess["status"] = successdetail.status;
            arraysuccess["createDate"] = successdetail.createDate;
            arraysuccess["assetmanagerTruID"] = successdetail.assetmanagerTruID;
            arraysuccess["bankName"] = successdetail.bankName;
            arraysuccess["MOP"] = successdetail.MOP;
            arraysuccess["cardNumber"] = successdetail.cardNumber;
            arraysuccess["failureReason"] = successdetail.failureReason;
            arraysuccess["userName"] = successdetail.userName;
            arraysuccess["email"] = successdetail.email;
            arraysuccess["mobile"] = successdetail.mobile;
            arraysuccess["address"] = successdetail.address;
            arraysuccess["tType"] = successdetail.tType;
            arraysuccess["atomDate"] = successdetail.atomDate;
            arraysuccess["tStatus"] = successdetail.tStatus;

            success.push(arraysuccess);
          }

        }

        // var Final = ({
        //   "atom": success
        // })
        res.json({
          status: "200",
          atom: success
        }
        )
      }
      )

    }
  }
  )
};



exports.bank_partner_report_log = function (req, res) {
  var matchqry = {};
  if (req.body.flag === "datewise") {
    var startdate = new Date(Date.parse(req.body.startdate));
    var enddate = new Date(Date.parse(req.body.enddate) + (1000 * 3600 * 24));
    matchqry = { createDate: { $gte: startdate, $lte: enddate } };
  }
  logs.aggregate([
    { $match: matchqry },
    { $sort: { createDate: -1 } },
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
        as: "remit"
      }
    },
    { $unwind: "$remit" },
    {
      $project: {
        fName: "$remit.contactFName", lName: "$remit.contactLName", truID: 1, createDate: 1, invoice: 1, TranID: 1, Status: 1, tType: 1,
        Amount: 1, charges: 1, Mode_of_Pay: 1, BenIFSC: 1, Ben_Acct_No: 1, Error_Cde: 1, Error_Desc: 1, PONum: 1,
        RRN: 1, RefNo: 1, Resp_cde: 1, Txn_Time: 1, UTRNo: 1, channelpartnerrefno: 1, companyName: "$remit.companyName"
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
        RRN: 1, RefNo: 1, Resp_cde: 1, Txn_Time: 1, UTRNo: 1, channelpartnerrefno: 1, "bankName": '$bankDetails.accountDetails.bank_name',
        companyName: 1
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
          arrayreslt["companyName"] = resltdetail.companyName ? resltdetail.companyName : undefined;
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



exports.show_wallet_balanceadmin = function (req, res) {
  var truid = req.body.truid;
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
      Wallet.aggregate([{
        $match: {
          truID: truid
        }
      },
      {
        $project: {
          _id: 0,
          clBal: 1
        }
      }
      ]).exec(function (err, result) {
        if (err) {
          res.json({ status: "204", message: "Something Went Wrong." });
        }
        else {
          res.json({
            "status": "200",
            "WalletBal": result[0].clBal.toJSON().$numberDecimal
          });
        }
      }
      )
    }
  }
  )
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
        as: "entity"
      }
    },
    { $unwind: "$entity" },
    {
      $project: {
        companyName: "$entity.companyName", truID: 1, Dr: 1, Cr: 1, invoice: 1,
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

        respobj["truID"] = resultobj.truID;
        respobj["companyName"] = resultobj.companyName;
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
    { $limit: 30 },
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
        as: "entity"
      }
    },
    { $unwind: "$entity" },
    {
      $project: {
        companyName: "$entity.companyName", atomID: 1, amount: 1, surcharge: 1, prodid: 1, invoice: 1,
        bankTxnID: 1, status: 1, createDate: 1, customerTruID: 1, bankName: 1, MOP: 1, cardNumber: 1,
        failureReason: 1, userName: 1, email: 1, mobile: 1, address: 1, tType: 1, atomDate: 1, tStatus: 1
      }
    },
  ]).exec(function (err, result) {
    if (err) {
      res.json({ status: "204", message: "Something went wrong!" });
    } else {
      if (result.length) {
        let successarr = new Array();

        for (var i = 0; i < result.length; i++) {
          let successdetail = result[i],
            successobj = {};
          successobj["atomID"] = successdetail.atomID;
          successobj["invoice"] = successdetail.invoice;
          successobj["amount"] = successdetail.amount.toJSON().$numberDecimal;
          successobj["surcharge"] = successdetail.surcharge.toJSON().$numberDecimal;
          successobj["prodid"] = successdetail.prodid;
          successobj["bankTxnID"] = successdetail.bankTxnID;
          successobj["status"] = successdetail.status;
          successobj["createDate"] = successdetail.createDate;
          successobj["entityTruID"] = successdetail.customerTruID;
          successobj["bankName"] = successdetail.bankName;
          successobj["MOP"] = successdetail.MOP;
          successobj["cardNumber"] = successdetail.cardNumber;
          successobj["failureReason"] = successdetail.failureReason;
          successobj["userName"] = successdetail.userName;
          successobj["email"] = successdetail.email;
          successobj["mobile"] = successdetail.mobile;
          successobj["address"] = successdetail.address;
          successobj["tType"] = successdetail.tType;
          successobj["atomDate"] = successdetail.atomDate;
          successobj["tStatus"] = successdetail.tStatus;
          successobj["companyName"] = successdetail.companyName;

          successarr.push(successobj);
        }
        res.json({ status: "200", resource: successarr });
      }
      else {
        res.json({ status: "204", message: "No records found!" });
      }
    }
  }
  )
};


exports.Update_KYCDocsEntity_from_admin = function (req, res) {
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



exports.emailAlertRateUpdatedAdmin = function (req, res) {
  var request = require('request');
  KycAll.aggregate([
    { $match: { 'billingEmails.type.liveRate': true } },
    {
      $project: {
        shapes: {
          $filter: {
            input: '$billingEmails',
            as: 'shape',
            cond: { $eq: ['$$shape.type.liveRate', true] }
          }
        },
        _id: 1, truID: 1, parentTruID: 1, isParent: 1
      }
    },
    {
      $project: {
        _id: 1, truID: 1, parentTruID: 1, isParent: 1,
        email: "$shapes.email"
      }
    },
    { $match: { 'isParent': true } },
    {
      $lookup: {
        localField: "parentTruID",
        foreignField: "truID",
        from: "charges",
        as: "charges"
      }
    },
    { $project: { _id: 0, truID: 1, email: 1, charges: "$charges" } }
  ], function (err, docs) {
    if (!docs.length) {
      res.json({ status: "204", message: "Invalid Partner" });
    } else {
      request.post({
        "headers": { "content-type": "application/json" },
        "url": conf.reqip + ":5114/api/topassetmanagerRateForAlert",
        "body": JSON.stringify({
          "countryCode": "+91"
        })
      }, async (error, response, body) => {
        if (error) {
          return console.dir(error);
        }
        else {
          var data = JSON.parse(body)
          if (data.status == "200") {
            var rateBody = data.resource;
            var Gen = rateBody.Gen;
            var g24kBuyGrossrate = rateBody.g24kBuyGrossrate;
            var g24kgrossrate = rateBody.g24kgrossrate;
            var s99PBuyGrossrate = rateBody.s99PBuyGrossrate;
            var s99pgrossrate = rateBody.s99pgrossrate;

            var RateArray = new Array();
            function ClientLoopRateCalculate(clientChargePer, billingEmails) {

              var final24KObj = calculateRate(Gen, g24kBuyGrossrate, "buy", clientChargePer);
              var final99PObj = calculateRate(Gen, s99PBuyGrossrate, "buy", clientChargePer);

              var final24KSellObj = calculateRate(Gen, g24kgrossrate, "redeemCash", clientChargePer);
              var final99PSellObj = calculateRate(Gen, s99pgrossrate, "redeemCash", clientChargePer);

              var final24KSell = final24KSellObj.netrate;
              var final99PSell = final99PSellObj.netrate;

              var final24KBuy = final24KObj.netrate;
              var final99PBuy = final99PObj.netrate;

              var clientArr = {
                final24KBuy: final24KBuy,
                final99PBuy: final99PBuy,
                final24KSell: final24KSell,
                final99PSell: final99PSell,
                billingEmails: billingEmails
              }
              RateArray.push(clientArr)
            }

            if (docs.length > 0) {
              for (var i = 0; i < docs.length; i++) {
                var billingEmails = docs[i].email.length > 0 ? docs[i].email : [];
                var txnLoading = Gen.txnLoading ? parseFloat(Gen.txnLoading) : 0;
                if (docs[i].charges.length > 0) {
                  var charges = docs[i].charges[0].isChargesSet ? docs[i].charges[0].trasactionCharges : txnLoading;
                  await ClientLoopRateCalculate(parseFloat(charges), billingEmails);
                }
                else {
                  await ClientLoopRateCalculate(txnLoading);
                }
              }
              console.log("RateArray", RateArray)
            }
            res.json({ status: "200", emailList: RateArray });
          }
          else {
            res.json({ status: "411", emailList: "No rate found..!!" });
          }
        }
      })
    }
  })
}
exports.add_Billing_Email = function (req, res) {
  var truid = req.body.truid;
  var query = { truID: truid };
  KycAll.find(query, function (err, docs) {
    if (!docs.length) {
      res.json({ status: "204", message: "Invalid Partner" });
    } else {
      if (req.body.emailarr.length > 0) {
        KycAll.findOneAndUpdate(query, { $set: { billingEmails: req.body.emailarr } }, callback)
        function callback(err, numAffected) {
          if (err) {
            res.json({ status: "204", message: "Something went wrong." });
          }
          else {
            res.json({ status: "200", message: "Email Updated Successfully." });
          }
        }
      }
      else {
        res.json({
          status: "204",
          message: "Please provide valid details..!!"
        });
      }
    }
  })
}
exports.email_Subscriber_List = function (req, res) {
  var truid = req.body.truid;
  var query = { truID: truid };
  KycAll.find(query, function (err, docs) {
    console.log("err", err)
    if (!docs.length) {
      res.json({ status: "204", message: "Invalid Partner" });
    } else {
      var billingEmails = docs[0].billingEmails ? docs[0].billingEmails : [];
      res.json({ status: "200", resource: billingEmails });
    }
  }
  )
}

exports.getCSVFileLargeData = function (req, res) {
  var truid = req.body.truid;
  var query = { truID: truid };
  KycAll.find(query, function (err, docs) {
    console.log("err", err)
    if (!docs.length) {
      res.json({ status: "204", message: "Invalid Partner" });
    } else {
      var billingEmails = docs[0].billingEmails ? docs[0].billingEmails : [];
      res.json({ status: "200", resource: billingEmails });
    }
  }
  )
}


function decimalChopper(num, fixed) {
  var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?');
  return num.toString().match(re)[0];
}


function particularData(particular) {
  try {
    var returnarr = {
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
      bullionType: { $ifNull: [{ $toString: "$" + particular + ".bullionType" }, "0"] }
    };
    return returnarr;
  }


  catch (ex) {
    console.log("data ex", ex)
    return null;
  }
}
exports.partner_Permission = function (req, res) {
  var truID = req.body.truID;
  var rtruid = req.body.rTruID;
  var KYCFlag = req.body.KYCFlag;
  var appliedOn = req.body.appliedOn;
  var limitapplied = req.body.limitapplied;
  var permissonobj = {};
  req.body.buy ? permissonobj["buy"] = req.body.buy : undefined;
  req.body.redeemCash ? permissonobj["redeemCash"] = req.body.redeemCash : undefined;
  req.body.transfer ? permissonobj["transfer"] = req.body.transfer : undefined;
  req.body.redeemToBank ? permissonobj["redeemToBank"] = req.body.redeemToBank : undefined;
  req.body.redeemToWallet ? permissonobj["redeemToWallet"] = req.body.redeemToWallet : undefined;
  req.body.walletToBank ? permissonobj["walletToBank"] = req.body.walletToBank : undefined;
  req.body.walletAccess ? permissonobj["walletAccess"] = req.body.walletAccess : undefined;
  req.body.payByWallet ? permissonobj["payByWallet"] = req.body.payByWallet : undefined;
  req.body.consumerAccess ? permissonobj["consumerAccess"] = req.body.consumerAccess : undefined;
  req.body.login ? permissonobj["login"] = req.body.login : undefined;
  req.body.linkbank ? permissonobj["linkbank"] = req.body.linkbank : undefined;
  req.body.paymentModeAccess ? permissonobj["paymentModeAccess"] = req.body.paymentModeAccess : undefined;
  permissonobj["allConsumerAccess"] = req.body.allConsumerAccess;

  permission.find({ truID: rtruid }).exec(function (err, result) {
    if (err) {
      console.log("eer2", err);
      res.json({ status: "500", message: "Internal Server Error" });
    } else {
      if (!result.length) {
        const per = permission();
        per.truID = rtruid;
        per.aTruID = truID;
        per.KYCFlag = KYCFlag;
        per.appliedOn = appliedOn;
        per.createDate = Date();
        per.modifyDate = Date();
        if (limitapplied === "commonEntity") {
          per.moduleSelf = permissonobj;
        } else {
          per.module = permissonobj;
        }
        per.save(function (err) {
          if (err) {
            console.log("eer2", err);
            res.json({ status: "500", message: "Internal Server Error" });
          } else {
            res.json({ status: "200", message: "Premission as been  Successfully" });
            var permissonobjupdate = {};
            for (const [key, value] of Object.entries(permissonobj)) {
              if (value != undefined) {
                permissonobjupdate[`module.${key}`] = value;
              }
            }
            logpermission(rtruid, truID, permissonobjupdate);
          }
        });
      } else {
        var permissonobjupdate = {};
        for (const [key, value] of Object.entries(permissonobj)) {
          if (value != undefined) {
            if (limitapplied === "commonEntity") {
              permissonobjupdate[`moduleSelf.${key}`] = value;
            } else {
              permissonobjupdate[`module.${key}`] = value;
            }
          }
        }
        permissonobjupdate.modifyDate = new Date();
        permissonobjupdate.aTruID = truID;
        permission.findOneAndUpdate({ truID: rtruid },
          {
            $set: permissonobjupdate
          }, { upsert: true }).exec(function (err, result) {
            if (err) {
              console.log("eer1", err);
              res.json({ status: "500", message: "Internal Server Error" });
            } else {
              if (!result) {
                res.json({ status: "400", message: "Something went wrong...!!" });
              } else {
                res.json({ status: "200", message: "Premission as been  Successfully" });
                logpermission(rtruid, truID, permissonobjupdate);

              }
            }
          })
      }

    }
  })

}

exports.partner_updatelimit = function (req, res) {
  var truID = req.body.truID;
  var rtruid = req.body.rTruID;
  var KYCFlag = req.body.KYCFlag;
  var tType = req.body.tType;
  var appliedOn = req.body.appliedOn;
  var limitapplied = req.body.limitapplied;
  var tTypelimit = {};
  req.body.goldMax ? tTypelimit["goldMax"] = req.body.goldMax : undefined;
  req.body.goldMin ? tTypelimit["goldMin"] = req.body.goldMin : undefined;

  req.body.silverMax ? tTypelimit["silverMax"] = req.body.silverMax : undefined;
  req.body.silverMin ? tTypelimit["silverMin"] = req.body.silverMin : undefined;
  req.body.txnInterval ? tTypelimit["txnInterval"] = req.body.txnInterval : undefined;
  req.body.noOfTxnInInterval ? tTypelimit["noOfTxnInInterval"] = req.body.noOfTxnInInterval : undefined;
  req.body.maxAmtOfTxnInHour ? tTypelimit["maxAmtOfTxnInHour"] = req.body.maxAmtOfTxnInHour : undefined;
  req.body.maxAmtOfTxnInDay ? tTypelimit["maxAmtOfTxnInDay"] = req.body.maxAmtOfTxnInDay : undefined;
  req.body.maxAmtOfTxnInMonth ? tTypelimit["maxAmtOfTxnInMonth"] = req.body.maxAmtOfTxnInMonth : undefined;
  req.body.redeemInBankMin ? tTypelimit["redeemInBankMin"] = req.body.redeemInBankMin : undefined;
  req.body.redeemInBankMax ? tTypelimit["redeemInBankMax"] = req.body.redeemInBankMax : undefined;


  var objkeylimit;
  if (limitapplied === "commonEntity") {
    objkeylimit = "limitSelf";
  } else {
    objkeylimit = "limit";
  }
  if (tType === "buy") {
    var buy = tTypelimit;
    var setValue = {};
    for (const [key, value] of Object.entries(buy)) {
      if (value != undefined) {
        setValue[`${objkeylimit}.buy.${key}`] = value;
      }
    }
    setValue['modifyDate'] = Date.now();
    setValue['aTruID'] = req.body.truID;
    UpdateLimit(rtruid, truID, setValue)

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
    setValue['aTruID'] = req.body.truID;
    UpdateLimit(rtruid, truID, setValue);
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
    setValue['aTruID'] = req.body.truID;
    UpdateLimit(rtruid, truID, setValue);
  }

  function UpdateLimit(rtruid, truID, setValue) {

    setValue['truID'] = rtruid;

    permission.findOneAndUpdate({ truID: rtruid },
      { $set: setValue }, { upsert: true, new: true }).exec(function (err, result) {
        if (err) {
          res.json({ status: "500", message: "Internal Server Error" });
        } else {
          if (!result) {
            res.json({ status: "401", message: "No Permission given to this ID " + truID });
          } else {
            res.json({ status: "200", message: "Limit has been Updated for the request " + tType });
            logpermission(rtruid, truID, setValue);
          }
        }
      })
  }


}
exports.partner_updateWalletLimit = function (req, res) {
  var truID = req.body.truID;
  var rtruid = req.body.rTruID;
  var KYCFlag = req.body.KYCFlag;
  var tType = req.body.tType;
  var appliedOn = req.body.appliedOn;
  var limitapplied = req.body.limitapplied;
  var walletlimitobj = {};
  req.body.max ? walletlimitobj["max"] = req.body.max : undefined;
  req.body.min ? walletlimitobj["min"] = req.body.min : undefined;
  req.body.walletLimit ? walletlimitobj["walletLimit"] = req.body.walletLimit : undefined;
  req.body.bulContainLimit ? walletlimitobj["bulContainLimit"] = req.body.bulContainLimit : undefined;
  req.body.txnInterval ? walletlimitobj["txnInterval"] = req.body.txnInterval : undefined;
  req.body.noOfTxnInSeconds ? walletlimitobj["noOfTxnInInterval"] = req.body.noOfTxnInSeconds : undefined;
  req.body.maxAmtOfTxnInSeconds ? walletlimitobj["maxAmtOfTxnInHour"] = req.body.maxAmtOfTxnInSeconds : undefined;
  req.body.maxAmtOfTxnInDay ? walletlimitobj["maxAmtOfTxnInDay"] = req.body.maxAmtOfTxnInDay : undefined;
  req.body.maxAmtOfTxnInMonth ? walletlimitobj["maxAmtOfTxnInMonth"] = req.body.maxAmtOfTxnInMonth : undefined
  var objkeylimit;
  if (limitapplied === "commonEntity") {
    objkeylimit = "limitSelf";
  } else {
    objkeylimit = "limit";
  }
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
    setValue['truID'] = rtruid;
    UpdateLimit(rtruid, truID, setValue);
    // UpdateLimit(truID, appliedOn, KYCFlag, setValue);

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
    setValue['truID'] = rtruid;
    setValue['aTruID'] = req.body.truID;
    UpdateLimit(rtruid, truID, setValue);
    // UpdateLimit(truID, appliedOn, KYCFlag, setValue);

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
    setValue['truID'] = rtruid;
    setValue['aTruID'] = req.body.truID;
    UpdateLimit(rtruid, truID, setValue);
    // UpdateLimit(truID, appliedOn, KYCFlag, setValue);
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
            logpermission(truID, atruid, setValue);
          }
        }
      })
  }
}
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
exports.partner_loading_Revenue = function (req, res) {
  var rtruid = req.body.rTruID;
  var type = req.body.type;
  var appliedOn = req.body.appliedOn;
  KycAll.aggregate([
    { $match: { truID: rtruid } },
    { $project: { _id: 0, truID: 1, parentTruID: 1, CRNNo: 1, isParent: 1, MID: 1, companyName: 1 } },
    {
      $lookup: {
        localField: "parentTruID",
        foreignField: "truID",
        from: "charges",
        as: "charges"
      }
    },
    {
      $project: {
        _id: 0, truID: 1, CRNNo: 1, isParent: 1, parentTruID: 1, MID: 1, companyName: 1,
        "charges": {
          $filter: {
            input: "$charges",
            as: "chrg",
            cond: { $and: [{ $eq: ["$$chrg.type", "common"] }, { $eq: ["$$chrg.appliedOn", appliedOn] }] }
          }
        },
        "targetArrold": {
          $filter: {
            input: "$charges",
            as: "chrg",
            cond: { $and: [{ $eq: ["$$chrg.type", type] }, { $eq: ["$$chrg.appliedOn", appliedOn] }] }
          }
        }
      }
    },
    {
      $project: {
        _id: 0, truID: 1, CRNNo: 1, isParent: 1, parentTruID: 1, MID: 1, companyName: 1,
        "charges": {
          $cond: {
            if: {
              $eq: [{
                "$size": { "$ifNull": ["$targetArrold", []] }
              }, 0]
            }, then: "$charges", else: "$targetArrold"
          }
        }
      }
    }
  ]).exec(function (err, docs) {
    if (!docs.length) {
      res.json({
        status: "204",
        message: "The request was successful but no body was returned."
      });
    } else {
      var countrycode = "+91"
      dlrStock.aggregate([
        {
          $facet: {
            topG24K: [
              { $project: { truID: 1, G24K: "$G24K.grossAmount", G24KgrossAmount: "$G24K.grossAmount", stock: 1, statusA: { $gt: ["$G24K.grossAmount", 0.1] }, statusS: { $gt: ["$stock.G24K", 0] } } },
              { $match: { $and: [{ statusA: true }, { statusS: true }] } },
              { $sort: { G24K: 1 } },
              {
                $lookup: {
                  from: "kycs",
                  localField: "truID",
                  foreignField: "truID",
                  as: "assetmanager"
                }
              },
              { "$unwind": { "path": "$assetmanager", "preserveNullAndEmptyArrays": true } },
              {
                $project: {
                  truID: 1, G24K: 1, stock: 1, KYCFlag: "$assetmanager.KYCFlag", "assetmanagerName": "$assetmanager.assetmanagerName",
                  isInsolventbyC: "$assetmanager.isInsolventbyC", Address: "$assetmanager.contactAddress", countryCode: "$assetmanager.countryCode", G24KgrossAmount: 1
                }
              },
              { $match: { KYCFlag: "active", isInsolventbyC: false } },
              {
                $project: {
                  _id: 0, truID: 1, G24K: 1, "assetmanagerName": 1, countryCode: 1, G24KgrossAmount: 1
                }
              },
              { $match: { countryCode: countrycode } },
              { $limit: 1 }
            ],
            topS99P: [
              { $project: { truID: 1, S99P: "$S99P.grossAmount", S99PgrossAmount: "$S99P.grossAmount", stock: 1, statusA: { $gt: ["$S99P.grossAmount", 0.1] }, statusS: { $gt: ["$stock.S99P", 0] } } },
              { $match: { $and: [{ statusA: true }, { statusS: true }] } },
              { $sort: { S99P: 1 } },
              {
                $lookup: {
                  from: "kycs",
                  localField: "truID",
                  foreignField: "truID",
                  as: "assetmanager"
                }
              },
              { "$unwind": { "path": "$assetmanager", "preserveNullAndEmptyArrays": true } },
              {
                $project: {
                  truID: 1, S99P: 1, stock: 1, KYCFlag: "$assetmanager.KYCFlag", "assetmanagerName": "$assetmanager.assetmanagerName",
                  isInsolventbyC: "$assetmanager.isInsolventbyC", Address: "$assetmanager.contactAddress", countryCode: "$assetmanager.countryCode", S99PgrossAmount: 1
                }
              },
              { $match: { KYCFlag: "active", isInsolventbyC: false } },
              {
                $project: {
                  _id: 0, truID: 1, S99P: 1, "assetmanagerName": 1, countryCode: 1, S99PgrossAmount: 1
                }
              },
              { $match: { countryCode: countrycode } },
              { $limit: 1 }
            ]
          }
        }]).exec(function (err, result) {
          if (err) {
            res.send({ status: "204", message: "Something went wrong!" });
          }
          else {
            var resource = result[0];

            var resourceconf = req.generalCharges
            var partnerCharges = 0, nodeCharges = 0;
            if (docs[0].charges.length) {
              resourceconf.partnerCharges = docs[0].charges[0].partnerCharges ? parseFloat(docs[0].charges[0].partnerCharges.toJSON().$numberDecimal) : resourceconf.partnerCharges;
              resourceconf.nodeCharges = docs[0].charges[0].nodeCharges ? parseFloat(docs[0].charges[0].nodeCharges.toJSON().$numberDecimal) : resourceconf.nodeCharges;
              resourceconf.clientTrasactionCharges = docs[0].charges[0].trasactionCharges ? parseFloat(docs[0].charges[0].trasactionCharges.toJSON().$numberDecimal) : 0;
              resourceconf.tdsPercentage = docs[0].charges[0].tdsPercentage ? parseFloat(docs[0].charges[0].tdsPercentage.toJSON().$numberDecimal) : 0;
            }

            var clientChargePer = resourceconf.clientTrasactionCharges ? parseFloat(resourceconf.clientTrasactionCharges) : 0;
            var netrate24 = resource.topG24K && resource.topG24K.length && resource.topG24K[0].G24K ? calculateRate(req.generalCharges, resource.topG24K[0].G24K.toJSON().$numberDecimal, "buy", clientChargePer) : "0.00",
              netrate99 = resource.topS99P && resource.topS99P.length && resource.topS99P[0].S99P ? calculateRate(req.generalCharges, resource.topS99P[0].S99P.toJSON().$numberDecimal, "buy", clientChargePer) : "0.00";
            res.json({
              status: "200",
              "G24K": netrate24,
              "S99P": netrate99,
              resource: resourceconf
            });
          }
        })
    }
  })
}
exports.partnerside_Revenue = async function (req, res) {
  var rtruid = req.body.rTruID;
  var generalCharges = req.generalCharges;
  var appliedOn = req.body.appliedOn;
  var PartnerChargesArr = await KycAll.aggregate([
    { $match: { truID: req.body.truID } },
    { $project: { _id: 0, truID: 1, parentTruID: 1, CRNNo: 1, isParent: 1, MID: 1, companyName: 1 } },
    {
      $lookup: {
        localField: "parentTruID",
        foreignField: "truID",
        from: "charges",
        as: "charges"
      }
    },
    {
      $project: {
        _id: 0, truID: 1, CRNNo: 1, isParent: 1, parentTruID: 1, MID: 1, companyName: 1,
        "charges": {
          $filter: {
            input: "$charges",
            as: "chrg",
            cond: { $and: [{ $eq: ["$$chrg.type", "common"] }, { $eq: ["$$chrg.appliedOn", appliedOn] }] }
          }
        },
        "targetArrold": {
          $filter: {
            input: "$charges",
            as: "chrg",
            cond: { $and: [{ $in: ["$$chrg.type", ["buy", "redeemCash", "transfer", "common"]] }, { $eq: ["$$chrg.appliedOn", appliedOn] }] }
          }
        }
      }
    },
    {
      $project: {
        _id: 0, truID: 1, CRNNo: 1, isParent: 1, parentTruID: 1, MID: 1, companyName: 1,
        "charges": {
          $cond: {
            if: {
              $eq: [{
                "$size": { "$ifNull": ["$targetArrold", []] }
              }, 0]
            }, then: "$charges", else: "$targetArrold"
          }
        }
      }
    },
    {
      $project: {
        _id: 0, truID: 1, CRNNo: 1, isParent: 1, parentTruID: 1, MID: 1, companyName: 1, charges: 1,
        "ischarges": {
          $anyElementTrue: [{
            $filter: {
              input: "$charges",
              as: "trArr",
              cond: { $and: [{ $in: ["$$trArr.type", ["common", "buy", "redeemCash", "transfer"]] }] }
            }
          },]
        }
      }
    },
    { $unwind: { path: "$charges", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0, truID: 1, CRNNo: 1, isParent: 1, parentTruID: 1, MID: 1, companyName: 1,

        "charges": {
          $cond: {
            if: { $eq: ["$ischarges", true] }, then: {
              "revenueCharges": { $toString: { $ifNull: ["$charges.revenueCharges", "0"] } },
              nodeCharges: { $toString: { $ifNull: ["$charges.nodeCharges", "0"] } },
              partnerCharges: { $toString: { $ifNull: ["$charges.partnerCharges", "0"] } },
              trasactionCharges: { $toString: { $ifNull: ["$charges.trasactionCharges", "0"] } },
              promotionQty: { $toString: { $ifNull: ["$charges.promotionQty", "0"] } },
              isChargesSet: { $toString: { $ifNull: ["$charges.isChargesSet", "0"] } },
              createDate: { $toString: { $ifNull: ["$charges.createDate", "0"] } },
              modifyDate: { $toString: { $ifNull: ["$charges.modifyDate", "0"] } },
              truID: { $toString: { $ifNull: ["$charges.truID", "0"] } },
              type: { $toString: { $ifNull: ["$charges.type", "0"] } }
            }, else: "$$REMOVE"
          }
        }
      }
    },
    {
      $group: {
        _id: "$truID",
        charges: { $push: "$charges" }
      }
    },
  ])
  var nodechargesArr = await KycAll.aggregate([
    { $match: { truID: rtruid } },
    { $project: { _id: 0, truID: 1, parentTruID: 1, CRNNo: 1, isParent: 1, MID: 1, companyName: 1 } },
    {
      $lookup: {
        localField: "truID",
        foreignField: "truID",
        from: "charges",
        as: "charges"
      }
    },
    {
      $project: {
        _id: 0, truID: 1, CRNNo: 1, isParent: 1, parentTruID: 1, MID: 1, companyName: 1,
        "charges": {
          $filter: {
            input: "$charges",
            as: "chrg",
            cond: { $and: [{ $eq: ["$$chrg.type", "common"] }, { $eq: ["$$chrg.appliedOn", appliedOn] }] }
          }
        },
        "targetArrold": {
          $filter: {
            input: "$charges",
            as: "chrg",
            cond: { $and: [{ $in: ["$$chrg.type", ["buy", "redeemCash", "transfer", "common"]] }, { $eq: ["$$chrg.appliedOn", appliedOn] }] }
          }
        }
      }
    },
    {
      $project: {
        _id: 0, truID: 1, CRNNo: 1, isParent: 1, parentTruID: 1, MID: 1, companyName: 1,
        "charges": {
          $cond: {
            if: {
              $eq: [{
                "$size": { "$ifNull": ["$targetArrold", []] }
              }, 0]
            }, then: "$charges", else: "$targetArrold"
          }
        }
      }
    },
    {
      $project: {
        _id: 0, truID: 1, CRNNo: 1, isParent: 1, parentTruID: 1, MID: 1, companyName: 1, charges: 1,
        "ischarges": {
          $anyElementTrue: [{
            $filter: {
              input: "$charges",
              as: "trArr",
              cond: { $and: [{ $in: ["$$trArr.type", ["common", "buy", "redeemCash", "transfer"]] }] }
            }
          },]
        }
      }
    },
    { $unwind: { path: "$charges", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0, truID: 1, CRNNo: 1, isParent: 1, parentTruID: 1, MID: 1, companyName: 1,

        "charges": {
          $cond: {
            if: { $eq: ["$ischarges", true] }, then: {
              "revenueCharges": { $toString: { $ifNull: ["$charges.revenueCharges", "0"] } },
              nodeCharges: { $toString: { $ifNull: ["$charges.nodeCharges", "0"] } },
              partnerCharges: { $toString: { $ifNull: ["$charges.partnerCharges", "0"] } },
              trasactionCharges: { $toString: { $ifNull: ["$charges.trasactionCharges", "0"] } },
              promotionQty: { $toString: { $ifNull: ["$charges.promotionQty", "0"] } },
              isChargesSet: { $toString: { $ifNull: ["$charges.isChargesSet", "0"] } },
              createDate: { $toString: { $ifNull: ["$charges.createDate", "0"] } },
              modifyDate: { $toString: { $ifNull: ["$charges.modifyDate", "0"] } },
              truID: { $toString: { $ifNull: ["$charges.truID", "0"] } },
              type: { $toString: { $ifNull: ["$charges.type", "0"] } }
            }, else: "$$REMOVE"
          }
        }
      }
    },
    {
      $group: {
        _id: "$truID",
        charges: { $push: "$charges" }
      }
    },
  ])
  function mergeConfigs(indvresult, cmnresult) {
    return cmnresult.map(item1 => {
      return Object.assign(item1, indvresult.find(item2 => {
        return item1.type === item2.type
      }))
    })
  }
  if (nodechargesArr.length > 0 && nodechargesArr[0].charges.length > 0) {
    var charges = await mergeConfigs(nodechargesArr[0].charges, PartnerChargesArr[0].charges);
    pCharges(charges);
  }
  else {
    var charges = PartnerChargesArr[0].charges;
    pCharges(charges);
  }
  function pCharges(charges) {
    var chargesJSON = {};
    const buyresult = charges.filter(word => word.type == "buy");
    const sellresult = charges.filter(word => word.type == "redeemCash");
    const transferresult = charges.filter(word => word.type == "transfer");
    const commanresult = charges.filter(word => word.type == "common");
    var buyOBJ = buyresult.length > 0 ? buyresult[0] : commanresult.length > 0 ? commanresult[0] : generalCharges;
    var diffBuy = (parseFloat(buyOBJ.nodeCharges) + parseFloat(buyOBJ.partnerCharges));
    var buy = {
      "nodeCharges": parseFloat(buyOBJ.nodeCharges),
      "partnerCharges": parseFloat(buyOBJ.partnerCharges),
      "companyCharges": (1 - diffBuy).toFixed(2)
    };
    var sellOBJ = sellresult.length > 0 ? sellresult[0] : commanresult.length > 0 ? commanresult[0] : generalCharges;
    var diffSell = (parseFloat(sellOBJ.nodeCharges) + parseFloat(sellOBJ.partnerCharges));
    var sell = {
      "nodeCharges": parseFloat(sellOBJ.nodeCharges),
      "partnerCharges": parseFloat(sellOBJ.partnerCharges),
      "companyCharges": (1 - diffSell).toFixed(2)
    };
    var transferOBJ = transferresult.length > 0 ? transferresult[0] : commanresult.length > 0 ? commanresult[0] : generalCharges;
    var diffTransfer = (parseFloat(transferOBJ.nodeCharges) + parseFloat(transferOBJ.partnerCharges));
    var transfer = {
      "nodeCharges": parseFloat(transferOBJ.nodeCharges),
      "partnerCharges": parseFloat(transferOBJ.partnerCharges),
      "companyCharges": (1 - diffTransfer).toFixed(2)
    };
    chargesJSON = {
      "buy": buy,
      "sell": sell,
      "transfer": transfer
    }
    res.json({ status: "200", resource: chargesJSON });
  }
}
exports.setNode_WisePermission = function (req, res) {
  var rtruid = req.body.rTruID;
  var generalCharges = req.generalCharges;
  KycAll.aggregate([
    { $match: { truID: rtruid } },
    { $project: { _id: 0, truID: 1, parentTruID: 1, CRNNo: 1, isParent: 1, MID: 1, companyName: 1 } },
    {
      $lookup: {
        localField: "parentTruID",
        foreignField: "truID",
        from: "charges",
        as: "charges"
      }
    },
    {
      $project: {
        _id: 0, truID: 1, CRNNo: 1, isParent: 1, parentTruID: 1, MID: 1, companyName: 1,
        "charges": {
          $filter: {
            input: "$charges",
            as: "chrg",
            cond: { $and: [{ $eq: ["$$chrg.type", "common"] }] }
          }
        },
        "targetArrold": {
          $filter: {
            input: "$charges",
            as: "chrg",
            cond: { $and: [{ $in: ["$$chrg.type", ["buy", "redeemCash", "transfer", "common"]] }] }
          }
        }
      }
    },
    {
      $project: {
        _id: 0, truID: 1, CRNNo: 1, isParent: 1, parentTruID: 1, MID: 1, companyName: 1,
        "charges": {
          $cond: {
            if: {
              $eq: [{
                "$size": { "$ifNull": ["$targetArrold", []] }
              }, 0]
            }, then: "$charges", else: "$targetArrold"
          }
        }
      }
    }
  ]).exec(function (err, docs) {
    if (!docs.length) {
      res.json({
        status: "204",
        message: "The request was successful but no body was returned."
      });
    } else {
      var chargesJSON = {};
      var charges = docs[0].charges;
      const buyresult = charges.filter(word => word.type == "buy");
      const sellresult = charges.filter(word => word.type == "redeemCash");
      const transferresult = charges.filter(word => word.type == "transfer");
      const commanresult = charges.filter(word => word.type == "common");
      var buyOBJ = buyresult.length > 0 ? buyresult[0] : commanresult.length > 0 ? commanresult[0] : generalCharges;
      var diffBuy = (parseFloat(buyOBJ.nodeCharges) + parseFloat(buyOBJ.partnerCharges));
      var buy = {
        "nodeCharges": parseFloat(buyOBJ.nodeCharges),
        "partnerCharges": parseFloat(buyOBJ.partnerCharges),
        "companyCharges": (1 - diffBuy).toFixed(2)
      };
      var sellOBJ = sellresult.length > 0 ? sellresult[0] : commanresult.length > 0 ? commanresult[0] : generalCharges;
      var diffSell = (parseFloat(sellOBJ.nodeCharges) + parseFloat(sellOBJ.partnerCharges));
      var sell = {
        "nodeCharges": parseFloat(sellOBJ.nodeCharges),
        "partnerCharges": parseFloat(sellOBJ.partnerCharges),
        "companyCharges": (1 - diffSell).toFixed(2)
      };
      var transferOBJ = transferresult.length > 0 ? transferresult[0] : commanresult.length > 0 ? commanresult[0] : generalCharges;
      var diffTransfer = (parseFloat(transferOBJ.nodeCharges) + parseFloat(transferOBJ.partnerCharges));
      var transfer = {
        "nodeCharges": parseFloat(transferOBJ.nodeCharges),
        "partnerCharges": parseFloat(transferOBJ.partnerCharges),
        "companyCharges": (1 - diffTransfer).toFixed(2)
      };
      chargesJSON = {
        "buy": buy,
        "sell": sell,
        "transfer": transfer
      }
      res.json({
        status: "200",
        resource: chargesJSON
      });
    }
  })
}
exports.fetchentity_Stock = function (req, res) {
  var truid = req.body.rTruID;
  KycAll.find({ truID: truid }, async function (err, docs) {
    if (!docs.length) {
      res.json({
        status: "204",
        message: "The request was successful but no body was returned."
      });
    } else {
      var query = { truID: truid };
      const enStock = await Stock.aggregate([
        { $match: query },
        {
          $project: {
            stock: 1, lStock: 1
          }
        }, {
          $project: {
            G24K: { $toString: "$stock.G24K" },
            S99P: { $toString: "$stock.S99P" },
            LG24K: { $toString: "$lStock.G24K" },
            LS99P: { $toString: "$lStock.S99P" }
          }
        }
      ]);

      res.json({ status: "200", resource: enStock });

    }

  }
  )
}
exports.fetchCounter = async function (req, res) {
  var rTruID = req.body.rTruID;
  var query = { parentTruID: rTruID };
  var cuquery = { refernceTruID: rTruID };
  var channel = req.body.channel;
  if (channel) {
    if (cuquery.refernceTruID) {
      delete cuquery.refernceTruID
    }
    cuquery.channel = channel;
  }
  if (req.body.startdate && req.body.enddate) {
    var startdate = new Date(Date.parse(req.body.startdate));
    var enddate = new Date(Date.parse(req.body.enddate));
    query = { createDate: { $gte: startdate, $lte: enddate } };
    cuquery = { createDate: { $gte: startdate, $lte: enddate } };
  }
  var partnercount = await KycAll.find(query).count();
  var consumercount = await custKYCAll.find(cuquery).count();
  var result = {
    consumer: consumercount,
    partner: partnercount != 0 ? (partnercount - 1) : 0 // partner minus from all count
  }
  res.send({ status: "200", resource: result });
}
exports.fetchentityDash_Stock = function (req, res) {
  var truid = req.body.rTruID;
  var flag = req.body.flag;
  KycAll.find({ truID: truid }, async function (err, docs) {
    if (!docs.length) {
      res.json({
        status: "204",
        message: "The request was successful but no body was returned."
      });
    } else {
      var query = { truID: truid };
      var cuquery = { referenceID: truid };
      if (docs[0].isParent) {
        query = { parentTruID: truid };
        cuquery = { channel: docs[0].MID };
      }
      const enStock = await KycAll.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            userIds: {
              $addToSet: '$truID',
            },
          },
        },
        {
          $lookup: {
            from: "stocks",
            let: { truid: "$userIds" },
            pipeline: [
              {
                $match:
                {
                  $expr:
                  {
                    $and:
                      [{ $in: ["$truID", "$$truid"] },
                      ]
                  }
                }
              },
            ],
            as: "stocks"
          }
        },
        { $unwind: "$stocks" },
        {
          $project: {
            stock: "$stocks.stock", lStock: "$stocks.lStock"
          }
        },
        { $group: { _id: null, G24K: { $sum: "$stock.G24K" }, S99P: { $sum: "$stock.S99P" }, LG24K: { $sum: "$lStock.G24K" }, LS99P: { $sum: "$lStock.S99P" } } },
        {
          $project: {
            G24K: { $toString: "$G24K" },
            S99P: { $toString: "$S99P" },
            LG24K: { $toString: "$LG24K" },
            LS99P: { $toString: "$LS99P" }
          }
        }
      ]);
      const consumerStock = await custKYCAll.aggregate([
        { $match: cuquery },
        {
          $group: {
            _id: null,
            userIds: {
              $addToSet: '$truID',
            },
          },
        },
        {
          $lookup: {
            from: "stocks",
            let: { truid: "$userIds" },
            pipeline: [
              {
                $match:
                {
                  $expr:
                  {
                    $and:
                      [{ $in: ["$truID", "$$truid"] },
                      ]
                  }
                }
              }
            ],
            as: "stocks"
          }
        },
        { $unwind: "$stocks" },
        {
          $project: {
            stock: "$stocks.stock", lStock: "$stocks.lStock"
          }
        },
        { $group: { _id: null, G24K: { $sum: "$stock.G24K" }, S99P: { $sum: "$stock.S99P" }, LG24K: { $sum: "$lStock.G24K" }, LS99P: { $sum: "$lStock.S99P" } } },
        {
          $project: {
            G24K: { $toString: "$G24K" },
            S99P: { $toString: "$S99P" },
            LG24K: { $toString: "$LG24K" },
            LS99P: { $toString: "$LS99P" }
          }
        }
      ]);
      res.json({ status: "200", resource: { consumerStock: consumerStock, enStock: enStock } });
    }
  })
}
exports.blockActivate_PartnerAccount = function (req, res) {
  KycAll.find({
    "truID": req.body.rTruID
  }, function (err, docs) {
    if (!docs.length) {
      res.json({
        status: "411",
        message: "This truID Doesnt exists"
      });
    } else {
      if (docs[0].KYCFlag == 'notactive') {
        if (docs[0].aadharStatus == "active" && docs[0].panStatus == "active") {
          UpdateDStatus({ KYCFlag: req.body.KYCFlag, KYCTime: new Date(), docVerified: true, KYCVerifyBy: req.body.truID });
        }
        else {
          res.json({
            status: "401",
            message: "PAN & Aadhaar is not verified. Both required for activation."
          });
        }
      }
      else {
        UpdateDStatus({ KYCFlag: req.body.KYCFlag });
      }
      function UpdateDStatus(datasetup) {
        var accSt = new AccStatusSchema();
        accSt["modifiedBy"] = req.body.truID;
        accSt["createDate"] = new Date();
        accSt["truID"] = req.body.rTruID;
        accSt["KYCFlag"] = req.body.KYCFlag;
        accSt["reason"] = req.body.reason;
        accSt["source"] = "admin";
        accSt.save(function (err) {
          if (err) {
            res.json({ status: "204", message: 'Something went wrong!' });
          } else {
            KycAll.findOneAndUpdate({ truID: req.body.rTruID }, {
              $set: datasetup
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
  }
  )
};
exports.wallet_Preview = async function (req, res) {
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
        againstInvoice: { $ifNull: ["$againstInvoice", "0"] }, subType: { $ifNull: ["$subType", "NA"] },
        UTRNo: 1,
        bankFName: "$bankName",
        acOrigin: 1,
        destinationAC: 1,
        mode: 1
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
        pgType: { $cond: { if: { $eq: ["$tType", "walletToBank"] }, then: "bank", else: { $cond: { if: { $in: ["$tType", ["addMoney"]] }, then: { $cond: { if: { $eq: ["$subType", "VA"] }, then: "VA", else: "atom" } }, else: "" } } } },
        bankTxnID: { $cond: { if: { $eq: ["$tType", "walletToBank"] }, then: "$bankinvoice.TranID", else: "$atominvoice.bankTxnID" } },
        bankName: { $cond: { if: { $eq: ["$tType", "walletToBank"] }, then: "$bankDetails.accountDetails.bank_name", else: { $ifNull: ["$atominvoice.bankName", "$va.senderIFSC"] } } },
        _id: 0, tType: 1, createDate: 1, truID: 1, Cr: 1, Dr: 1, invoice: 1, particulars: 1, status: 1,
        againstInvoice: { $ifNull: ["$againstInvoice", "$invoice"] },
        beneficiaryAccountNumber: "$va.beneficiaryAccountNumber",
        creditDate: "$va.creditDate",
        senderName: { $cond: { if: { $eq: ["$tType", "walletToBank"] }, then: "$bankDetails.accountDetails.name", else: "$va.senderName" } },
        senderAccountNumber: { $cond: { if: { $eq: ["$tType", "walletToBank"] }, then: "$bankDetails.accountDetails.accountNo", else: "$va.senderAccountNumber" } },
        senderIFSC: { $cond: { if: { $eq: ["$tType", "walletToBank"] }, then: "$bankDetails.accountDetails.IFSC", else: "$va.senderIFSC" } },
        messageType: "$va.messageType",
        UTRNumber: "$va.UTRNumber",
        UTRNo: 1,
        bankFName: 1,
        acOrigin: 1,
        destinationAC: 1,
        mode: 1
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
        UTRNo: 1,
        bankFName: 1,
        acOrigin: 1,
        destinationAC: 1,
        mode: 1,
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
      custKYCAll.find(query, function (err, docs) {  //consumer DB validations
        if (!docs.length) {                     //user not found
          reject("");
        } else {
          resolve(docs[0].fName + " " + docs[0].lName)
        }
      })
    })
  }

  function txnMadeByEntity(ctruID) {
    var query = { truID: ctruID, "__t": "KycAll" };
    return new Promise((resolve, reject) => {
      KycAll.find(query, function (err, docs) {  //consumer DB validations
        if (!docs.length) {                     //user not found
          reject("");
        } else {
          resolve(docs[0].companyName)
        }
      })
    })
  }
  for await (const txndetail of cursor) {
    var totAmt = txndetail.Cr != "0" ? txndetail.Cr : txndetail.Dr != "0" ? txndetail.Dr : "0"
    txndetail.mop = txndetail.mop;
    txndetail.totalAmount = decimalChopper(totAmt, 4);
    txndetail.tType = txndetail.tType;
    txndetail.againstInvoice = txndetail.againstInvoice ? txndetail.againstInvoice : "-";
    if (req.body.cuType == "consumer") {
      txndetail.name = await txnMadeBy(txndetail.truID)
    }
    else if (req.body.cuType == "entity") {
      txndetail.name = await txnMadeByEntity(txndetail.truID)
    }
    txn.push(txndetail);
  }
  if (txn.length > 0) {
    res.send({ status: "200", resource: txn[0] });
  }
  else {
    res.send({ status: "411", message: "No record Found" });
  }

};
exports.getmostActiveTxn = async function (req, res) {
  var inArray = ["buy", "redeemCash", "transfer"];
  var top = req.body.top ? parseInt(req.body.top) : 5;
  var query = { status: "success", type: { $in: inArray } };
  if (req.body.startDate && req.body.endDate) {
    var startdate = new Date(Date.parse(req.body.startDate));
    var enddate = new Date(Date.parse(req.body.endDate));
    query.createDate = { $gte: startdate, $lte: enddate };
  }
  if (req.body.uTruID) {
    query.to = req.body.uTruID
  }
  function buyjson(particular) {
    return particular
  }

  var partner = [
    { $match: query },
    { $unwind: { path: "$particularsG24", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$particularsS99", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$particularsG24", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$particularsS99", preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: "$to",
        count: { "$sum": 1 },
        totalAmount: { "$sum": "$totalAmount" },
        totalGold: { "$sum": "$particularsG24.qty" },
        totalSilver: { "$sum": "$particularsS99.qty" },
        userIds: {
          $push: {
            "types": '$type',

            totalAmount: {
              "$sum": "$totalAmount"
            },
            g24k: {
              "$sum": "$particularsG24.qty"
            },
            s99p: {
              "$sum": "$particularsS99.qty"
            }
          },
        }
      }
    },
    { $unwind: { path: "$userIds", preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: {
          "type": "$userIds.types",
          "truID": "$_id"
        },
        truID: { "$first": "$_id" },
        count: { "$first": "$count" },
        totalGold: { "$first": "$totalGold" },
        totalSilver: { "$first": "$totalSilver" },
        totalAmount: { "$first": "$totalAmount" },
        total: { "$sum": "$userIds.totalAmount" },
        g24k: {
          "$sum": "$userIds.g24k"
        },
        s99p: {
          "$sum": "$userIds.s99p"
        },
        totalC: { "$sum": 1 },
      }
    },
    {
      $group: {
        _id: "$truID",
        truID: { "$first": "$truID" },
        totalCount: { "$first": "$count" },
        totalAmount: { "$first": "$totalAmount" },
        totalg24k: { "$first": "$totalGold" },
        totals99p: { "$first": "$totalSilver" },
        consumer: {
          "$push": {
            total: { "$toString": "$total" },
            g24k: { "$toString": "$g24k" },
            s99p: { "$toString": "$s99p" },
            count: { "$toString": "$totalC" },
            type: "$_id.type"
          }
        }
      }
    },
    {
      $sort: { "totalCount": -1 }
    },
    {
      $limit: top
    },
    {
      $lookup: {
        from: "kycs",
        localField: "truID",
        foreignField: "truID",
        as: "cust"
      }
    },
    { $unwind: "$cust" }
  ]
  var result = [];

  if (req.body.flag == "partner") {
    partner.push({
      $project: {
        _id: 0, name: "$cust.companyName",
        totalCount: { "$toString": "$totalCount" }, truID: 1, txnArr: "$consumer", totalAmount: { "$toString": "$totalAmount" },
        totalg24k: { "$toString": "$totalg24k" }, totals99p: { "$toString": "$totals99p" }
      }
    });
    result = await TXN.aggregate(partner);
  }
  else {
    partner.push({
      $project: {
        _id: 0, name: { $concat: ["$cust.fName", " ", "$cust.lName"] },
        totalCount: { "$toString": "$totalCount" }, truID: 1, txnArr: "$consumer", totalAmount: { "$toString": "$totalAmount" },
        totalg24k: { "$toString": "$totalg24k" }, totals99p: { "$toString": "$totals99p" }
      }
    });
    result = await custTXN.aggregate(partner);
  }
  if (result.length > 0) {
    res.send({
      "status": "200", resource: result
    })
  }
  else {
    res.send({
      "status": "401", message: "no record found", resource: []
    })
  }
}

exports.add_entity_wallet_from_admin = function (req, res) {
  var rtruid = req.body.rtruid;
  var referenceID = req.body.truID;
  var UTRNo = req.body.UTRNo ? req.body.UTRNo : "";
  var bankName = req.body.bankName ? req.body.bankName : "";
  var acOrigin = req.body.acOrigin ? req.body.acOrigin : "";
  var destinationAC = req.body.destinationAC ? req.body.destinationAC : "";
  var mode = req.body.mode ? req.body.mode : "";
  var amount = parseFloat(req.body.amount);
  var invoice = createInvoice();
  var date = new Date();
  var walletlog = new WalletLog();
  walletlog.truID = rtruid;
  walletlog.Cr = amount;
  walletlog.Dr = "0";
  walletlog.invoice = invoice;
  walletlog.tType = req.body.fundStatus ? req.body.fundStatus : "addMoney";
  walletlog.createDate = date;
  walletlog.particulars = defaultConf.defaultCurrency + " " + amount + " amount was added against receipt of " + invoice
  walletlog.referenceID = referenceID;
  walletlog.UTRNo = UTRNo;
  walletlog.bankName = bankName;
  walletlog.acOrigin = acOrigin;
  walletlog.destinationAC = destinationAC;
  walletlog.mode = mode;
  walletlog.status = "success";
  WalletLog.find({ invoice: invoice }, function (err, docs) {
    if (!docs.length) {
      walletlog.save(function (err) {
        if (err) { 
          res.json({ status: "204", message: 'Fields with * required' });

        } else {
          fllog(rtruid, amount, invoice);
        }
      });
    }
    else {
      res.json({ status: "204", message: 'This Invoice Already Exists' });
    }
  });

  function fllog(rtruid, amount, invoice) {
    Wallet.findOneAndUpdate({ truID: rtruid }, { $set: { Cr: amount }, $inc: { clBal: amount } },
      { new: true }).exec(function (err, result) {
        if (err) {
          res.json({ Status: "500", message: "Internal server error" })
        } else {
          if (!result) {
            const floatnew = Wallet()
            floatnew.truID = rtruid;
            floatnew.Cr = amount;
            floatnew.Dr = 0.00;
            floatnew.clBal = amount;
            floatnew.opBal = 0.00
            floatnew.save(function (err, dox) {
              if (err) {
                res.json({ status: "500", message: "Internal Server Error" });
              } else {  
                res.json({ status: "200", message: "Wallet amount added to your account" });
              }
            })
          }
          else { 
            res.json({ status: "200", message: "Wallet amount added to your account" });
          }
        }
      })
  }
}

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

