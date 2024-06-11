'use strict'

var request = require('request'),
  https = require('https'),
  KycAll = require('../models/custKYCAllModel'),
  AuthKYC = require('../models/custKYCAuthModel'),
  Beneficiary = require('../models/custBeneficiaryModel'),
  Stock = require('../models/custStockModel'),
  ROTP = require('../models/custOTPModel'),
  LOTP = require('../models/custOTPLogModel'),
  Wallet = require('../models/custWalletModel'),
  enKYC = require('../models/remmit/remmitKYCAllModel'),
  ReferralStockLog = require('../models/custReferralStockLogModel'),
  TXN = require('../models/custTXNModel'),
  devicelog = require("./deviceLog"),
  Gen = require("../Generics"),
  notification_controller = require("./notification.controlller"),
  email_controller = require("./email.controller"),
  consumerLog = require("./userLogs"),
  fs = require('fs'),
  path = require('path'),
  crypto = require('crypto'); //for md5 hash 
var bcrypt = require('bcrypt');
var salt = bcrypt.genSaltSync(10);
var randomize = require('randomatic');
var reqip = Gen.reqip;
let defaultConf = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../regionConf.json')));
var partnerChannelINArry = ["MT_MTTECH", "Direct"];

exports.test = function (req, res) {
  res.json({ message: "Welcome to Company Api" });
};
exports.ins_registration = function (req, res) {
  var auth = new AuthKYC(req.user);
  var kycall = new KycAll();
  var ben = new Beneficiary(req.user);
  var stock = new Stock(req.user);
  var hashtwo = bcrypt.hashSync(req.body.password, salt);

  var crnno = randomize('A0', 7);
  let crnNo = 'c'.concat(crnno);
  var truid = randomize('0', 12);
  let truId = '5000'.concat(truid);

  var email = req.body.email;
  var mobile = req.body.mobile;
  var kycflag = req.body.kycflag;
  var referenceID = req.body.referenceid,
    deviceid = req.body.deviceid;

  if (!deviceid) {
    deviceid == "0";
  }

  var referrelcheck = false;
  if (referenceID && referenceID != "0") {
    var url;
    var rid = referenceID.substring(0, 4);
    if (rid === '5000') {
      referrelcheck = true;
      url = reqip + ":4112/api/consumervalidation"
    } else if (rid === '8000') {
      url = reqip + ":4121/api/entityvalidation"
    } else {
      url = reqip + ":4121/api/entityvalidation"
    }
    request.post({
      "headers": { "content-type": "application/json" },
      "url": url,
      "body": JSON.stringify({
        "truid": referenceID,
        "referrelcheck": referrelcheck
      })
    }, (error, response, body) => {

      if (error) {
        // console.log(error);
      }
      var newjson = JSON.parse(body);
      if (newjson.status === "400") {
        res.send({ status: "204", message: 'Referral code is wrong!' });
      } else {
        register(newjson.refcount, newjson.selfReferenceID, newjson.CRNNo ? newjson.CRNNo : "0");
      }
    }
    )
  } else {
    referenceID = "Company";
    register(false, 0);
  }
  function register(refcount, refcode, refcrnno) {
    ROTP.find({ "mobile": mobile, "type": "registration", "status": "success" }, function (err, docs) {
      if (!docs.length) {
        res.json({ status: "204", message: 'Please verify OTP before registartion.' });
      }
      else {
        auth.email = email;
        auth.mobile = req.body.mobile;
        auth.CRNNo = crnNo;
        auth.password = hashtwo;
        auth.isPwdReset = true;

        kycall.email = email;
        kycall.KYCFlag = "active";
        kycall.currentassetstore = defaultConf.currentassetstore;
        if (req.body.countrycode != undefined) { kycall.countryCode = req.body.countrycode }
        kycall.fName = req.body.fname;
        kycall.mName = req.body.mname;
        kycall.lName = req.body.lname;
        kycall.mobile = req.body.mobile;
        kycall.gender = req.body.gender;
        kycall.DOB = req.body.dob;
        kycall.language = req.body.language;
        kycall.nationality = req.body.nationality;
        kycall.residence = req.body.residence;
        kycall.CRNNo = crnNo;
        kycall.truID = truId;
        kycall.channel = 'Direct';
        kycall.createDate = new Date();
        kycall.createUser = 'User';
        kycall.refernceTruID = referenceID;
        kycall.referralID = referenceID;
        kycall.image = "0";
        kycall.referalCount = "0";
        kycall.referenceVerified = false;

        AuthKYC.find({ $or: [{ "email": email }, { mobile: req.body.mobile }] }, function (err, docs) {
          if (!docs.length) {
            auth.save(function (err) {
              if (err)
                res.send(err);
              KycAll.find({ $or: [{ "email": email }, { mobile: req.body.mobile }] }, function (err, docs) {
                if (!docs.length) {
                  kycall.save(function (err) {
                    if (err) {
                      console.log(err)
                    }
                    else {
                      res.json({ status: "201", message: 'User KYC Created!', truID: truId, CRNNo: crnno });
                      ins_beneficiary();
                    }
                  }
                  );
                  function ins_beneficiary(err, numAffected) {
                    if (err) {
                      res.send(err);
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
                    }
                    );
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
                  function add_wallet(err) {
                    if (err) {
                      console.log(err);
                    }
                    var query1 = { truID: truId };
                    var respresult = Wallet.findOneAndUpdate(query1, {
                      $set: {
                        truID: truId,
                        opBal: "0.00", Dr: "0.00", Cr: "0.00", clBal: "0.00"
                      }
                    }, { upsert: true });
                    respresult.exec(async function (err, result) {
                      if (err) {
                        response.status(500).send({ error: err })
                        return next(err);
                      }
                      else {
                        var fname = req.body.fname;
                        var lname = req.body.lname;
                        notification_controller.notification_registartion(truId, fname);

                      }
                    }
                    )
                  }
                }
                else {
                  res.json({ status: "409", message: 'User Already Exists!' });
                }
              }
              )
            }
            );
          }
          else {
            res.json({ status: "409", message: 'User Already Exists!' });
          }
        }
        )
      }
    }
    )
  }
}


exports.ins_refferance_registration = async function (req, res) {

  var auth = new AuthKYC(req.user);
  var kycall = new KycAll();
  var password = req.body.password;
  var hashtwo = bcrypt.hashSync(password, salt);
  var crnNo = 'c'.concat(randomize('A0', 7));
  var truId = '5000'.concat(randomize('0', 12));

  var gender = req.body.gender ? req.body.gender : "male";
  var email = req.body.email;
  var mobile = req.body.mobile;
  if (!email || email == "") {
    let r = Math.random().toString(36).substring(7); // create random string
    email = r + "_" + mobile + "@fake.company.com";
  }
  var refernceid = req.body.refernceid;
  auth.email = email;
  auth.mobile = req.body.mobile;
  auth.CRNNo = crnNo;
  auth.password = hashtwo;
  auth.isPwdReset = false;
  kycall.email = email;
  kycall.KYCFlag = "pending";
  kycall.currentassetstore = defaultConf.currentassetstore;
  if (req.body.countrycode != undefined) { kycall.countryCode = req.body.countrycode }
  kycall.fName = req.body.fname;
  kycall.mName = req.body.mname ? req.body.mname : "";
  kycall.lName = req.body.lname;
  kycall.mobile = req.body.mobile;
  if (req.body.dob) {
    kycall.DOB = new Date(Date.parse(req.body.dob));;
  }
  kycall.gender = gender;
  kycall.CRNNo = crnNo;
  kycall.truID = truId;
  kycall.refernceID = refernceid;//Enter remmit or another refferance truID truid here
  kycall.channel = req.body.channel;
  kycall.createDate = new Date();
  // kycall.emailExpiryDate = new Date(new Date().getTime() + Gen.emailExpiryTime);
  kycall.createUser = 'User';
  // kycall.isPwdReset = false;
  kycall.refernceTruID = refernceid;
  kycall.referralID = refernceid;
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
      res.json({ status: "409", message: 'User Already Exists!' }); // means He can either able to login or in case new reg he need to use new email
    }

    KycAll.find({ $or: [{ "email": email }, { mobile: req.body.mobile }] }, function (err, docs) {
      if (!docs.length) {
        kycall.save(function (err) {
          if (err) {
            //res.send(err);
            console.log(err)
          }
          else {
            ins_beneficiary();
          }
        });
        //this Function Will Store truId into Beneficiery Collection
        function ins_beneficiary(err, numAffected) {
          if (err) {
            //res.send(err);
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
              truID: truId,
              "stock.G24K": "0.00", "stock.S99P": req.body.promotionalQty ? req.body.promotionalQty : "0.00",
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
              // var fname = req.body.fname;
              // var lname = req.body.lname;
              // notification_controller.notification_registartion(truId, fname);

              // var date = Date.parse(new Date());
              // var hashstr = crnNo + date.toString();
              // var url2 = crypto.createHash('md5').update(hashstr).digest('hex');

              // KycAll.findOneAndUpdate({ truID: truId }, { $set: { referenceVerified: true, emailVerificationCode: url2 } }).exec()
              // if (req.body.refernceid.substring(0, 4) === "8000") {
              //   email_controller.refRegistartionEntity(req.body.email, req.body.mobile, fname + " " + lname, req.body.companyname, url2);
              // } else {
              //   email_controller.email_registartion(req.body.email, req.body.fname, req.body.lname, url2);
              // }
            }
          });
        }
      }
      else {
      }
    });
  });
}


exports.ins_refferance_registration_import_json = async function (req, res) {
  var auth = new AuthKYC(req.user);
  var kycall = new KycAll();
  var ben = new Beneficiary(req.user);
  var stock = new Stock(req.user);

  var password = req.body.password;
  var hashtwo = bcrypt.hashSync(password, salt);

  var crnno = randomize('A0', 7);
  var crnNo = 'c'.concat(crnno);

  var truid = randomize('0', 12);
  var truId = '5000'.concat(truid);

  var email = req.body.email;
  var mobile = req.body.mobile;
  var kycflag = req.body.kycflag;
  var refernceid = req.body.refernceid;



  auth.email = email;
  auth.mobile = req.body.mobile;
  auth.CRNNo = crnNo;
  auth.password = hashtwo;
  auth.isPwdReset = req.body.ispwd;

  kycall.email = email;
  kycall.KYCFlag = "active";
  kycall.currentassetstore = defaultConf.currentassetstore;
  if (req.body.countrycode != undefined) { kycall.countryCode = req.body.countrycode }
  kycall.fName = req.body.fname;
  kycall.mName = req.body.mname;
  kycall.lName = req.body.lname;
  kycall.mobile = req.body.mobile;
  kycall.CRNNo = crnNo;
  kycall.truID = truId;
  kycall.refernceID = refernceid;//Enter remmit or another refferance truID truid here
  kycall.channel = req.body.channel;
  kycall.createDate = new Date();
  // kycall.emailExpiryDate = new Date(new Date().getTime() + Gen.emailExpiryTime);
  kycall.createUser = 'User';
  // kycall.isPwdReset = false;
  kycall.refernceTruID = refernceid;
  kycall.referralID = refernceid;
  kycall.image = "0";
  kycall.referalCount = "0";
  kycall.referenceVerified = true;


  AuthKYC.find({ $or: [{ "email": email }, { mobile: req.body.mobile }] }, function (err, docs) {
    if (!docs.length) {
      auth.save(function (err) {
        if (err) {
          // res.send(err);
          console.log(err);
        }
        res.json({ status: "201", message: 'Consumer Created!', truID: truId });

      });
    }

    else {
      res.json({ status: "409", message: 'User Already Exists!' }); // means He can either able to login or in case new reg he need to use new email
    }

    KycAll.find({ $or: [{ "email": email }, { mobile: req.body.mobile }] }, function (err, docs) {
      if (!docs.length) {
        kycall.save(function (err) {
          if (err) {
            //res.send(err);
            console.log(err)
          }
          else {
            ins_beneficiary();
          }
        });
        //this Function Will Store truId into Beneficiery Collection
        function ins_beneficiary(err, numAffected) {
          if (err) {
            //res.send(err);
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
          }
          )
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
              notification_controller.notification_registartion(truId, req.body.fname);

              // var date = Date.parse(new Date());
              // var hashstr = crnNo + date.toString();
              // var url2 = crypto.createHash('md5').update(hashstr).digest('hex');

              // KycAll.findOneAndUpdate({ truID: truId }, { $set: { emailVerificationCode: url2 } }).exec()

              // email_controller.email_registartion(req.body.email, req.body.fname, req.body.lname, url2);
            }
          });
        }
      }
    }
    )
  }
  )
}


exports.add_consumer_import_json = function (req, res) {

  var consumers = req.body.consumers;
  var ret = new Array();
  var parentid = req.body.parentid;
  function fromServer(i) {
    return new Promise((resolve, reject) => {
      var input = consumers[i];
      var subs = input.firstName.length > 4 ? input.firstName.substr(0, 4) : input.firstName;
      var dat = new Date(input.DOB);
      var year = dat.getFullYear();
      var ispwd = consumers[i].password ? true : false
      var password = consumers[i].password ? consumers[i].password : subs + year;

      request.post({
        "headers": { "content-type": "application/json" },
        "url": reqip + ":4112/api/referenceregistrationimportjson",
        "body": JSON.stringify({
          "email": input.email,
          "password": password,
          "fname": input.firstName,
          "mname": input.middleName,
          "lname": input.lastName,
          "mobile": input.mobile,
          "kycflag": "active",
          "refernceid": parentid,
          "channel": req.body.channel,
          "ispwd": ispwd
        })
      }, (error, response, body) => {

        if (error) {
          console.log(err);
        }
        var newjson = JSON.parse(body);
        if (newjson.status === "409") {
          ret.push(consumers[i]);
          resolve(true)
        } else if (newjson.status === "201") {
          KycAll.findOneAndUpdate({ truID: newjson.truID }, {
            $set: {
              billingAddress: {
                houseNumber: input.houseName_Number, streetNumber: input.streetName, landmark: input.landmark,
                pin: input.pin, city: input.city, state: input.state, country: input.country
              },
              permanentAddress: {
                houseNumber: input.houseName_Number, streetNumber: input.streetName, landmark: input.landmark,
                pin: input.pin, city: input.city, state: input.state, country: input.country
              },
              countryCode: input.countryCode, gender: input.gender, DOB: input.DOB
            }
          }, callback)
          function callback(err, numAffected) {
            if (err) {
              console.log(err);
            } else {

            }
            resolve(true)
          }
        }
      }
      )
    }
    )
  }
  async function forLoopGood() {
    for (var i = 0; i < consumers.length; i++) {
      await fromServer(i);
    }
    if (ret.length == 0 && i == consumers.length) {
      res.json({ status: "200", message: "Consumer created successfully!" })
    } else {
      res.json({ status: "204", message: "Records already exist!", consumers: ret })
    }
  }
  forLoopGood();
}


exports.consumer_validation = function (req, res) {
  var query = {};
  if (req.body.truid) {
    query = { truID: req.body.truid };
  } else if (req.body.mobile) {
    query = { mobile: req.body.mobile };
  } else if (req.body.email) {
    query = { email: req.body.email };
  } else if (req.body.crnno) {
    query = { CRNNo: req.body.crnno };
  }
  KycAll.find(query, async function (err, docs) {
    if (!docs.length) {
      res.json({ status: "400", message: "Consumer not exists!" });
    }
    else {
      if (req.body.ftype) {
        const Auth = await AuthKYC.find(query);
        if (Auth && Auth.length > 0) {
          if (Auth[0].appAccess) {
            if (req.body.referrelcheck === true) {
              res.json({ status: "200", message: "Consumer Found.", name: docs[0].fName + " " + docs[0].lName, referenceID: docs[0].truID, CRNNo: docs[0].CRNNo, selfReferenceID: docs[0].selfReferenceID, refcount: parseFloat(docs[0].referalCount) });
            } else if (req.body.flag === "admin") {
              res.json({ status: "200", referenceID: docs[0].truID, CRNNo: docs[0].CRNNo, fName: docs[0].fName, lName: docs[0].lName });
            } else {
              res.json({ status: "200", message: "Consumer Found.", name: docs[0].fName + " " + docs[0].lName, referenceID: docs[0].truID, CRNNo: docs[0].CRNNo, mobile: docs[0].mobile });
            }
          }
          else {
            res.json({ status: "400", message: "You don't have permission to access this application." });
          }
        }
        else {
          res.json({ status: "400", message: "You don't have permission to access this application." });
        }
      }
      else {
        if (req.body.referrelcheck === true) {
          res.json({ status: "200", message: "Consumer Found.", name: docs[0].fName + " " + docs[0].lName, referenceID: docs[0].truID, CRNNo: docs[0].CRNNo, selfReferenceID: docs[0].selfReferenceID, refcount: parseFloat(docs[0].referalCount) });

        } else if (req.body.flag === "admin") {
          res.json({ status: "200", referenceID: docs[0].truID, CRNNo: docs[0].CRNNo, fName: docs[0].fName, lName: docs[0].lName });
        } else {
          res.json({ status: "200", message: "Consumer Found.", name: docs[0].fName + " " + docs[0].lName, referenceID: docs[0].truID, CRNNo: docs[0].CRNNo, mobile: docs[0].mobile });
        }
      }

    }
  })
};


exports.login_window = function (req, res) {
  var username = req.body.username;
  var query = AuthKYC.find({ $or: [{ email: username }, { mobile: username }] }).select({ mobile: 1, isPwdReset: 1, password: 1, appAccess: 1, _id: 0 });

  KycAll.findOne({ $or: [{ email: username }, { mobile: username }] }, function (err, user) {
    query.exec(function (err, result) {
      if (err == null && result == '') {
        res.json({ status: "401", message: "The username or password you entered is incorrect." });
      } else {
        var resmobile = result[0].mobile;
        var isPasswordReset = result[0].isPwdReset,
          appaccess = result[0].appAccess;
        if (appaccess === false) {
          res.json({ status: "400", message: "You don't have permission to access this application." });
        }
        else if (result[0].isPwdReset === true) {
          var array = result;
          var parray = array.pop();
          var finalhash = parray.password;
          if (bcrypt.compareSync(req.body.password, finalhash)) {
            callback();
          } else {
            res.json({ status: "401", message: "The username or password you entered is incorrect." });
            KycAll.find({ $or: [{ email: username }, { mobile: username }] }).exec(function (err, ressp) {
              if (err) {
                console.log(err)
              } else {
                if (ressp.length) {
                  consumerLog.userloginLog(ressp[0].truID, "web", "consumer", "deviceID", ressp[0].refernceTruID ? ressp[0].refernceTruID : undefined, "trying to login");
                }
              }
            })
          }
          function callback(err, numAffected) {
            if (err) {
              res.send(err);
            } else {
              KycAll.aggregate([
                { $match: { __t: "KycAll", $or: [{ email: username }, { mobile: username }] } },
                {
                  $project: {
                    fName: 1, lName: 1, refernceTruID: 1, CRNNo: 1,
                    city: "$permanentAddress.city", pin: "$permanentAddress.pin", image: 1, address: "$permanentAddress", countryCode: 1, isMinor: 1,
                    _id: 0, truID: 1, mobile: 1, KYCFlag: 1, email: 1, emailVerified: 1, docVerified: 1, isVACreated: 1, DOB: 1, gender: 1,
                    aadharStatus: 1, panStatus: 1, channel: 1
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
                    fName: 1, lName: 1, address: 1, refernceTruID: 1, CRNNo: 1, DOB: 1, gender: 1,
                    city: 1, pin: 1, image: 1, countryCode: 1, emailVerified: 1, docVerified: 1,
                    truID: 1, mobile: 1, KYCFlag: 1, email: 1, isVACreated: 1, isMinor: 1,
                    name: { $concat: ["$fName", " ", "$lName"] },
                    G24K: { "$toString": { $cond: [{ $lt: ["$stock.stock.G24K", 0.000001] }, 0.00, "$stock.stock.G24K"] } },
                    S99P: { "$toString": { $cond: [{ $lt: ["$stock.stock.S99P", 0.000001] }, 0.00, "$stock.stock.S99P"] } },
                    aadharStatus: 1, panStatus: 1, channel: 1
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
                    fName: 1, lName: 1, city: 1, pin: 1, truID: 1, mobile: 1, KYCFlag: 1, email: 1, referenceID: "$refernceTruID", DOB: 1, gender: 1,
                    image: 1, address: 1, countryCode: 1, emailVerified: 1, CRNNo: 1, docVerified: 1, isMinor: 1,
                    G24K: 1, S99P: 1, balance: { $toString: "$wallet.clBal" }, isVACreated: 1,
                    aadharStatus: 1, panStatus: 1, name: 1, channel: 1
                  }
                },
              ]).exec(async function (err, result) {
                if (err) {
                  response.status(500).send({ error: err })
                  return next(err);
                } else {
                  var Final = result[0];
                  Final.isPwdReset = isPasswordReset;
                  if (Final.referenceID != "Company") {
                    if (Final.channel != "Direct") {
                      // var enquery = await enKYC.find({ truID: Final.refernceTruID }).select({ companyName: 1, brandLogo: 1 });
                      var enquery = await enKYC.aggregate([
                        { $match: { truID: Final.referenceID } },
                        {
                          $lookup: {
                            from: "kycs",
                            localField: "parentTruID",
                            foreignField: "truID",
                            as: "parentDetails"
                          }
                        },
                        { $unwind: "$parentDetails" },
                        { $project: { companyName: 1, brandLogo: "$parentDetails.brandLogo" } }
                      ])

                      if (enquery.length > 0) {
                        Final.brand = enquery[0].companyName;
                        Final.brandLogo = enquery[0].brandLogo;
                        res.json({ status: "200", resource: Final });
                      } else {
                        res.json({ status: "200", resource: Final });
                      }
                    } else {
                      res.json({ status: "200", resource: Final });
                    }
                  } else {
                    res.json({ status: "200", resource: Final });
                  }
                  consumerLog.userloginLog(Final.truID, "web", "consumer", "deviceID", Final.referenceID ? Final.referenceID : undefined, "login");
                }
              }
              );
            }
          }
        } else {
          res.json({ status: "204", message: "Please reset your password", mobile: resmobile });
          // consumerLog.userloginLog(truID, "web", "consumer", "deviceID", refernceID ? refernceID : undefined, "login");
        }
      }
    }
    )
  }
  )
};



exports.reference_registration_profile_entity = function (req, res) {
  var truid = req.body.truid;
  var channel = req.body.channel;

  KycAll.find({
    "channel": channel, truID: truid
  }, function (err, docs) {
    if (!docs.length || truid === undefined) {
      res.json({
        status: "204",
        message: 'No reference found for this User.'
      });
    } else {

      KycAll.aggregate([
        { $match: { truID: truid } },
        {
          $project: {
            _id: 0, createDate: 1, gender: 1, KYCFlag: 1, DOB: 1, email: 1, fName: 1, mName: 1, CRNNo: 1,
            currentassetstore: 1, lName: 1, mobile: 1, truID: 1, refernceTruID: 1, image: 1, billingAddress: 1,
            permanentAddress: 1, countryCode: 1, KYCDetails: 1, image: 1
          }
        }

      ]).exec(function (err, result) {
        if (err) {
          res.status(500).send({ error: err })
        }
        else {
          var imagepath = Gen.profile;
          var docpath = Gen.docs;
          var kyc;
          if (result[0].KYCDetails.length) {
            var KYCDetails = new Array();
            for (var i = 0; i < result[0].KYCDetails.length; i++) {
              var kycelements = result[0].KYCDetails[i];
              var kycaray = {};
              kycaray["docNumber"] = kycelements.docNumber;
              kycaray["docTitle"] = kycelements.docTitle;
              //  var doc = kycelements.docFile;
              //  kycaray["docFile"] = docpath.concat(doc);
              kycaray["docFile"] = kycelements.docFile;

              KYCDetails.push(kycaray);
            }
            kyc = KYCDetails;
          } else {
            kyc = result[0].KYCDetails;
          }
          var Final = ({
            createDate: result[0].createDate,
            gender: result[0].gender,
            KYCFlag: result[0].KYCFlag,
            DOB: result[0].DOB,
            email: result[0].email,
            fName: result[0].fName,
            mName: result[0].mName,
            lName: result[0].lName,
            mobile: result[0].mobile,
            truID: result[0].truID,
            CRNNo: result[0].CRNNo,
            refernceTruID: result[0].refernceTruID,

            KYCDetails: kyc,
            permanentAddress: result[0].permanentAddress,
            billingAddress: result[0].billingAddress,
            image: imagepath.concat(result[0].image)
            // image : imagepath.concat(result[0].image)
          });

          res.json({ status: "200", resource: Final });
        }
      }
      )
    }
  }
  )
}

exports.generate_otp_on_registration = function (req, res) {

  var badd = new ROTP(req.user);
  var mobile = req.body.mobile;
  var email = req.body.email;

  var otp = randomize('0', 6);

  AuthKYC.find({ $or: [{ "email": email }, { mobile: mobile }] }, function (err, docs) {
    if (!docs.length) {

      var options = {
        "method": "GET",
        "hostname": "2factor.in",
        "port": null,
        "path": "/API/V1/2537a610-dc1e-11e7-a328-0200cd936042/SMS/" + mobile + "/" + otp + "",
        "headers": {}
      };
      var req = https.request(options, function (res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
          var body = JSON.parse(chunk);
          var details = body.Details;
          var status = body.Status;

          insertotp(details, status);
        });
      });

      req.on('error', function (e) {
        console.log('problem with request: ' + e.message);
      });

      req.write('data\n');
      req.end();

      function insertotp(details, status) {

        var lotp = new LOTP(req.user);

        var query = { mobile: mobile };
        var date = new Date();

        lotp.type = "registration";
        lotp.status = "failure";
        lotp.mobile = mobile;
        lotp.OTP = otp;
        lotp.createDate = date;
        lotp.detail = details;

        lotp.save(function (err) {
          if (err) {
            res.send(err);
            console.log(err)
          }
          else {
            res.json({ "status": "201", "message": 'User KYC Created!' });
          }
        });

        var respresult = ROTP.findOneAndUpdate(query, {
          $set: {
            "mobile": mobile, "OTP": otp, "status": "failure",
            "timeStamp": date, "type": "registration", "detail": details
          }
        }, { upsert: true })
        respresult.exec(function (err, result) {
          if (err) {
            response.status(500).send({ error: err })
            return next(err);
          }

          else {
            res.json({ "status": "201", "message": 'OTP sent to mobile number' });

          }
        });
      };
    }
    else {
      res.json({ status: "409", message: 'User Already Exists!' });
    }
  })
}



exports.veriFy_otp_on = function (req, res) {

  var badd = new ROTP(req.user);

  var mobile = req.body.mobile;
  var otp = req.body.otp;

  ROTP.find({ "mobile": mobile, OTP: otp, type: "registration", status: "failure" }, function (err, docs) {
    if (docs.length) {
      ROTP.aggregate([
        { $match: { mobile: mobile, OTP: otp, type: "registration", status: "failure" } },
        { $project: { mobile: 1, OTP: 1, dateDifference: { $subtract: [new Date(), "$timeStamp"] } } },
        {
          $project: {
            mobile: 1, OTP: 1, dateDifference: 1,
            status: { $cond: { if: { $lte: ["$dateDifference", 300000] }, then: 200, else: 400 } }
          }
        }
      ]).exec(function (err, result) {
        if (err) {
          response.status(500).send({ error: err })
          return next(err);
        }
        else {
          var resource = result[0];
          res.json({ resource: resource });
        };
      });
    }
    else {
      res.json({ status: "401", message: 'wrong mobile number or OTP' });
    }
  })
}


exports.list_profile = function (req, res) {
  var truid = req.body.truid;

  KycAll.find({
    $or: [{ truID: truid }, { mobile: truid }]
  }, function (err, docs) {
    if (!docs.length) {
      res.json({
        status: "204",
        message: "The request was successful but no body was returned."
      });
    } else {


      KycAll.aggregate([
        { $match: { __t: "KycAll", $or: [{ truID: truid }, { mobile: truid }] } },
        {
          $project: {
            name: { $concat: ["$fName", " ", "$lName"] }, fName: 1, lName: 1, refernceTruID: 1, CRNNo: 1, KYCDetails: 1, DOB: 1, gender: 1, channel: 1,
            city: "$permanentAddress.city", pin: "$permanentAddress.pin", image: 1, billingAddress: 1, permanentAddress: 1, countryCode: 1,
            _id: 0, truID: 1, mobile: 1, KYCFlag: 1, email: 1, emailVerified: 1, docVerified: 1, referenceVerified: 1, aadharStatus: 1, panStatus: 1,
            countryOfOrigin: { $ifNull: ["$countryOfOrigin", "$countryCode"] }
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
            name: 1, fName: 1, lName: 1, billingAddress: 1, permanentAddress: 1, refernceTruID: 1, CRNNo: 1, KYCDetails: 1, referenceVerified: 1, channel: 1,
            city: 1, pin: 1, image: 1, countryCode: 1, emailVerified: 1, docVerified: 1, DOB: 1, gender: 1, aadharStatus: 1, panStatus: 1,
            truID: 1, mobile: 1, KYCFlag: 1, email: 1, countryOfOrigin: 1,
            G24K: { "$toString": { $cond: [{ $lt: ["$stock.stock.G24K", 0.000001] }, 0.00, "$stock.stock.G24K"] } },
            S99P: { "$toString": { $cond: [{ $lt: ["$stock.stock.S99P", 0.000001] }, 0.00, "$stock.stock.S99P"] } },
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
            name: 1, fName: 1, mName: 1, lName: 1, city: 1, pin: 1, truID: 1, mobile: 1, KYCFlag: 1, email: 1, refernceTruID: 1, DOB: 1, gender: 1, countryOfOrigin: 1, channel: 1,
            image: 1, billingAddress: 1, permanentAddress: 1, countryCode: 1, emailVerified: 1, CRNNo: 1, docVerified: 1, KYCDetails: 1, referenceVerified: 1,
            G24K: 1, S99P: 1, balance: { "$toString": "$wallet.clBal" }, aadharStatus: 1, panStatus: 1,
          }
        }
      ]).exec(async function (err, result) {
        if (err) {
          res.json({ status: "204", message: "Something went wrong!" });
        } else {
          if (!result.length) {
            res.json({ status: "401", message: "The username or password you entered is incorrect." });
          } else {
            var Final = result[0];
            if (Final.KYCDetails && Final.KYCDetails.length) {
              Final.isKYCDocExist = true;
            } else {
              Final.isKYCDocExist = false;
            }
            if (Final.address) {
              Final.isaddress = true;
            } else {
              Final.isaddress = false;
            }
            if (Final.KYCDetails && Final.KYCDetails.length > 0) {
              var arrkyc = [];
              Final.KYCDetails.forEach(details => {
                if (details.docTitle === "Aadhaar") {
                  Final.nameOnAadhaar = details.validationdata.name;
                }
                delete details.validationdata;
                arrkyc.push(details);
              });
              Final.KYCDetails = arrkyc
            } else {
              Final.nameOnAadhaar = Final.fName + " " + Final.mName + " " + Final.lName;
            }
            var finalAuth = await AuthKYC.find({ $or: [{ email: Final.email }, { mobile: Final.mobile }] }).select({ mPINSet: 1 });
            Final.mPINSet = finalAuth[0].mPINSet;
            if (Final.refernceTruID != "Company") {
              if (Final.channel != "Direct") {
                // var enquery = await enKYC.find({ truID: Final.refernceTruID }).select({ companyName: 1, brandLogo: 1 });
                var enquery = await enKYC.aggregate([
                  { $match: { truID: Final.refernceTruID } },
                  {
                    $lookup: {
                      from: "kycs",
                      localField: "parentTruID",
                      foreignField: "truID",
                      as: "parentDetails"
                    }
                  },
                  { $unwind: "$parentDetails" },
                  { $project: { companyName: 1, brandLogo: "$parentDetails.brandLogo" } }
                ])

                if (enquery.length > 0) {
                  // console.log("enquery", enquery[0])
                  Final.brand = enquery[0].companyName;
                  Final.brandLogo = enquery[0].brandLogo;
                  res.json({ status: "200", resource: Final });
                } else {
                  res.json({ status: "200", resource: Final });
                }
              } else {
                res.json({ status: "200", resource: Final });
              }
            } else {
              res.json({ status: "200", resource: Final });
            }
          }
        }
      });

    }
  })
};


exports.find_USER = function (req, res) {
  var mobile = req.body.mobile,
    truid = req.body.truid;
  KycAll.find({
    truID: truid
  }, function (err, usrdocs) {

    if (!usrdocs.length || usrdocs.length > 1) {
      res.json({
        status: "204",
        message: "The request was successful but no body was returned."
      });
    }
    // else if(usrdocs[0].KYCFlag === "pending" || usrdocs[0].KYCFlag === "hold" || usrdocs[0].KYCFlag === "banned"){
    else if (usrdocs[0].KYCFlag === "hold" || usrdocs[0].KYCFlag === "banned") {
      res.json({
        status: "204",
        message: "Your KYC is not Completed, Please Complete KYC process."
      });
    }
    else {
      KycAll.find({
        $or: [{ mobile: mobile }]
      }, function (err, docs) {

        if (!docs || !docs.length || docs.length > 1) {
          res.json({
            status: "204",
            message: "This user does not exists!."
          });
        } else if (docs[0].KYCFlag === "hold" || docs[0].KYCFlag === "banned") {
          res.json({
            status: "204",
            message: "User you are trying to search is either banned or he/she did not completed KYC."
          });
        } else if (usrdocs[0].truID === docs[0].truID) {
          res.json({
            status: "204",
            message: "Invalid request! Please search another user."
          });
        } else {
          KycAll.aggregate([
            { $match: { __t: "KycAll", $or: [{ mobile: mobile }] } },
            {
              $project: {
                _id: 0, truID: 1, email: 1, fName: 1, lName: 1, mobile: 1, CRNNo: 1,
                image: 1, city: "$permanentAddress.city"
              }
            }]).exec(function (err, result) {
              if (err) {
                resp.status(500).send({ error: err })
                return next(err);
              }
              else {
                var resource = result[0];
                var resp = { status: "200", resource: resource };
                if (req.body.type) {
                  resp.type = req.body.type
                }
                res.json(resp);
              }
            }
            );
        }
      }
      )
    }
  }
  )
};
exports.findconsumerQR = function (req, res) {
  KycAll.find({
    truID: req.body.truid
  }, function (err, usrdocs) {
    if (!usrdocs.length || usrdocs.length > 1) {
      res.json({
        status: "204",
        message: "The request was successful but no body was returned."
      });
    }
    else if (usrdocs[0].KYCFlag === "hold" || usrdocs[0].KYCFlag === "banned") {
      res.json({
        status: "204",
        message: "Your account is not active..!!"
      });
    }
    else {
      var mobile = req.body.mobile;
      var entityQuery = enKYC.aggregate([
        { $match: { __t: "KycAll", $or: [{ CRNNo: mobile }, { mobile: mobile }, { truID: mobile }] } },
        {
          $project: {
            _id: 0, truID: 1, email: 1, name: "$companyName", mobile: 1, type: "merchant", image: { $ifNull: ["$brandLogo", "$image"] }
          }
        }])
      var consumerQuery = KycAll.aggregate([
        { $match: { __t: "KycAll", $or: [{ CRNNo: mobile }, { mobile: mobile }, { truID: mobile }] } },
        {
          $project: {
            _id: 0, truID: 1, email: 1, name: { $concat: ["$fName", " ", "$lName"] }, lName: 1, mobile: 1, type: "consumer", image: 1
          }
        }])
      if (req.body.type === "both") {
        var count = 0;
        var finalArray = [];
        enKYC.find({
          $or: [{ CRNNo: mobile }, { mobile: mobile }, { truID: mobile }]
        }, function (err, docs) {
          if (!docs || !docs.length || docs.length > 1) {
            count++
            sendresp();
          } else if (docs[0].KYCFlag === "hold" || docs[0].KYCFlag === "banned") {
            count++
            sendresp();
          } else if (usrdocs[0].truID === docs[0].truID) {
            count++
            sendresp();
          } else {
            entityQuery.exec(function (err, result) {
              if (err) {
                resp.status(500).send({ error: err });
              }
              else {
                var resource = result[0];
                var resp = { status: "200", resource: resource };
                finalArray.push(resource);
                count++
                sendresp()
              }
            });
          }
        })
        KycAll.find({
          $or: [{ mobile: mobile }, { truID: mobile }]
        }, function (err, docs) {
          if (!docs || !docs.length || docs.length > 1) {
            count++
            sendresp()
          } else if (docs[0].KYCFlag === "hold" || docs[0].KYCFlag === "banned") {
            count++
            sendresp()
          } else if (usrdocs[0].truID === docs[0].truID) {
            count++
            sendresp()
          } else {
            consumerQuery.exec(function (err, result) {
              if (err) {
                resp.status(500).send({ error: err });
              }
              else {
                var resource = result[0];
                var resp = { status: "200", resource: resource };

                finalArray.push(resource);
                count++
                sendresp()
              }
            });
          }
        })
        function sendresp() {
          if (count === 2) {
            var resp = { status: "200", resource: finalArray };
            res.json(resp);
          }
        }
      } else if (req.body.type === "moent" || req.body.type === "moent") {
        enKYC.find({
          $or: [{ CRNNo: mobile }, { mobile: mobile }, { truID: mobile }]
        }, function (err, docs) {
          if (!docs || !docs.length || docs.length > 1) {
            res.json({
              status: "204",
              message: "Invalid QR Code"
            });
          } else if (docs[0].KYCFlag === "hold" || docs[0].KYCFlag === "banned") {
            res.json({
              status: "204",
              message: "This account is not active..!!"
            });
          } else if (usrdocs[0].truID === docs[0].truID) {
            res.json({
              status: "204",
              message: "Invalid Request."
            });
          } else {
            entityQuery.exec(function (err, result) {
              count++
              if (err) {
                resp.status(500).send({ error: err });
              }
              else {
                var resource = result[0];
                var resp = { status: "200", resource: resource };
                if (req.body.type) {
                  resp.type = req.body.type
                }
                res.json(resp);
              }

            });
          }
        })
      } else if (req.body.type === "cu") {
        var mobile = req.body.mobile;
        KycAll.find({
          $or: [{ CRNNo: mobile }, { mobile: mobile }, { truID: mobile }]
        }, function (err, docs) {
          if (!docs || !docs.length || docs.length > 1) {
            res.json({
              status: "204",
              message: "Invalid QR Code"
            });
          } else if (docs[0].KYCFlag === "hold" || docs[0].KYCFlag === "banned") {
            res.json({
              status: "204",
              message: "This account is not active..!!"
            });
          } else if (usrdocs[0].truID === docs[0].truID) {
            res.json({
              status: "204",
              message: "Invalid Request."
            });
          } else {
            consumerQuery.exec(function (err, result) {
              if (err) {
                resp.status(500).send({ error: err });
              }
              else {
                var resource = result[0];
                var resp = { status: "200", resource: resource };
                if (req.body.type) {
                  resp.type = req.body.type
                }
                res.json(resp);
              }
            });
          }
        })
      };
    }
  })
}
exports.Update_Image = function (req, res) {
  try {
    KycAll.findOneAndUpdate({ truID: req.body.truid }, { $set: { image: req.body.image } }, function (err, result) {
      if (err) {
        res.status(500).send(err);
      } else {
        if (result) {
          res.status(200).json({ status: "200", image: req.body.image });
        } else {
          res.status(404).json({ status: "204", message: "Consumer not found" });
        }
      }
    })
  }
  catch (ex) {
    res.status(500).json({ status: "500", message: "Internal server error" });
  }
}
exports.Update_address = function (req, res) {
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
}


exports.Update_KYC = function (req, res) {


  var truid = req.body.truid;
  var query = { truID: truid, KYCFlag: { $in: ["pending", "hold"] } };

  KycAll.find(
    query, function (err, docs) {
      if (!docs.length) {
        res.json({
          status: "204",
          message: "The request was successful but no body was returned."
        });
      } else {
        KycAll.findOneAndUpdate(query, {
          $set:
          //
          {
            "billingAddress.houseNumber": req.body.housenumber, "billingAddress.streetNumber": req.body.streetnumber, "billingAddress.landmark": req.body.landmark,
            "billingAddress.pin": req.body.pin, "billingAddress.city": req.body.city, "billingAddress.state": req.body.state, "billingAddress.country": req.body.country,
            "permanentAddress.houseNumber": req.body.phousenumber, "permanentAddress.streetNumber": req.body.pstreetnumber,
            "permanentAddress.landmark": req.body.plandmark, "permanentAddress.pin": req.body.ppin, "permanentAddress.city": req.body.pcity,
            "permanentAddress.state": req.body.pstate, "permanentAddress.country": req.body.pcountry, KYCDetails: req.body.kycdetails,
            gender: req.body.gender, DOB: req.body.dob, mName: req.body.mname, KYCFlag: "active"
          }
        }, callback)
        function callback(err, numAffected) {
          if (err)
            res.send(err);
          KycAll.aggregate([{ "$match": { truID: truid } }, {
            "$project": {
              _id: 0,
              name: { "$concat": ["$fName", "  ", "$lName"] }
            }
          }]).exec(function (err, result) {
            if (err) {
              response.status(500).send({ error: err })
              return next(err);
            }
            else {
              res.json({ status: "200", resource: result[0] });
            }
          });
        };
      }
    }
  )
}

exports.list_address = function (req, res) {

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


exports.remove_kyc_docs = function (req, res) {
  var padd = new KycAll(req.user);

  var truid = req.body.truid;
  var query = { truID: truid };
  KycAll.findOneAndUpdate(query, { $pull: { "KYCDetails": { docTitle: req.body.title } } }, callback)

  function callback(err, numAffected) {
    if (err)
      res.send(err);
    var respresult = KycAll.find(query, { KYCDetails: 1, _id: 0 });
    respresult.exec(function (err, result) {
      if (err) {
        response.status(500).send({ error: err })
        return next(err);
      }
      else { res.json(result); }
    });
  };
};



exports.update_password = function (req, res) {
  var auth = new AuthKYC(req.user);
  var truid = req.body.truid;
  var query = KycAll.findOne({ truID: truid, KYCFlag: "active" }, { _id: 0, __t: 0, CRNNo: 1 });

  query.exec(function (err, result) {
    if (result == null) {
      res.json({ status: "401", resource: "unAuthorised User" });
    }
    else {
      var crnno = result.CRNNo;
      var query_auth = AuthKYC.findOne({ CRNNo: crnno }, { _id: 0, password: 1 });
      query_auth.exec(function (err, result) {
        if (result == null) {
          res.json({ status: "401", resource: "unAuthorised User" });
        }
        else {
          var pwd = result.password;
          if (bcrypt.compareSync(req.body.oldpassword, pwd)) {
            var query_up = { "CRNNo": crnno }
            var hashtwo = bcrypt.hashSync(req.body.newpassword, salt);
            var updatepwd = AuthKYC.findOneAndUpdate(query_up, { "$set": { "password": hashtwo } });
            updatepwd.exec(function (err, result) {
              if (err) {
                response.status(500).send({ error: err })
                return next(err);
              }
              else {
                res.json({ status: 200, resource: "password updated" })
              }
            });
          }
          else {
            res.json({ status: 401, resource: "incorrect password" });
          }
        }
      })
    };
  })
}

exports.change_password = function (req, res) {
  var mobile = req.body.mobile;
  var query = KycAll.findOne({ $or: [{ email: mobile }, { mobile: mobile }] }, {
    _id: 0, __t: 0, CRNNo: 1, fName: 1, lName: 1, email: 1,
    mobile: 1, emailVerified: 1
  });

  query.exec(function (err, result) {
    if (result == null) {
      res.json({ status: "401", resource: "unAuthorised User" });
    }
    else {
      var crnno = result.CRNNo;
      var consumername = result.fName + " " + result.lName;
      var email = result.email;
      var mobile = result.mobile;
      var emailVerified = result.emailVerified;
      var query_auth = AuthKYC.findOne({ CRNNo: crnno }, { _id: 0, password: 1 });
      query_auth.exec(function (err, result) {
        if (result == null) {
          res.json({ status: "401", resource: "unAuthorised User" });
        }
        else {
          var pwd = result.password;
          var query_up = { "CRNNo": crnno }
          var hashtwo = bcrypt.hashSync(req.body.newpassword, salt);
          var dateobj = new Date();
          var updatepwd = AuthKYC.findOneAndUpdate(query_up, { "$set": { "password": hashtwo, "isPwdReset": true } });
          updatepwd.exec(function (err, result) {
            if (err) {
              response.status(500).send({ error: err })
              return next(err);
            }
            else {
              res.json({ status: 200, resource: "password updated" });
              var mailtype = emailVerified === true ? "both" : "sms";
              email_controller.changePasswordMPIN("passwordReset", email, mobile, consumername, mailtype, dateobj);
            }
          });
        }
      })
    };
  })
}

exports.change_password_sec = function (req, res) {
  var auth = new AuthKYC(req.user);

  var mobile = req.body.mobile;
  var hash = req.body.hash;
  var query = KycAll.findOne({ mobile: mobile }, { _id: 0, __t: 0, CRNNo: 1 });

  query.exec(function (err, result) {
    if (result == null) {
      res.json({ status: "401", resource: "unAuthorised User" });
    }
    else {
      var crnno = result.CRNNo;
      var query_auth = AuthKYC.findOne({ CRNNo: crnno }, { _id: 0, password: 1 });
      query_auth.exec(function (err, result) {
        if (result == null) {
          res.json({ status: "401", resource: "unAuthorised User" });
        }
        else {
          var pwd = result.password;
          request.post({
            "headers": { "content-type": "application/json" },
            "url": reqip + ":40000/api/verifyotpsession",
            "body": JSON.stringify({
              "hash": hash
            })
          }, (error, response, body) => {
            if (error) {
              return console.dir(error);
            }
            var newjson = JSON.parse(body);
            var status = newjson.status;
            if (status == 400) {
              res.json({ status: 402, resource: "you are out off session" })
            }
            else {

              var query_up = { "CRNNo": crnno }
              var hashtwo = bcrypt.hashSync(req.body.newpassword, salt);
              var updatepwd = AuthKYC.findOneAndUpdate(query_up, { "$set": { "password": hashtwo } });
              KycAll.findOneAndUpdate(query_up, { $set: { isResetPwd: true } }).exec();   //new password hash updated

              updatepwd.exec(function (err, result) {
                if (err) {
                  response.status(500).send({ error: err })
                  return next(err);
                }
                else {
                  res.json({ status: 200, resource: "password updated" })
                }
              });
            }
          });
        }
      })
    };
  })
}

exports.check_user = function (req, res) {
  var email = req.body.email;
  var mobile = req.body.mobile;
  var query;
  if (email) {
    query = { email: email };
    request(query);
  } else if (mobile) {
    query = { mobile: mobile };
    request(query);
  } else {
    res.json({ status: "204", message: 'Enter Valid data.' });
  }
  function request(query) {
    AuthKYC.find({ $or: [query] }, function (err, docs) {
      if (docs.length) {
        res.json({ status: "409", message: 'User Already Exists!' })
      }
      else {
        res.json({ status: "204", message: 'User Not Found!' });
      }
    })
  }
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
            _id: 0, truID: 1, mobile: 1, KYCFlag: 1, email: 1, currentassetstore: 1
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
            truID: 1, mobile: 1, KYCFlag: 1, email: 1, billingAddress: 1, permanentAddress: 1,
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
            g1: 1, g4: 1, balance: "$wallet.clBal"
          }
        },
      ]).exec(function (err, result) {
        if (err) {
          response.status(500).send({ error: err })
          return next(err);
        }
        else {
          var resource = result[0];
          var name = resource.name;
          var countryCode = resource.countryCode;
          var fName = resource.fName;
          var lName = resource.lName;
          var mName = resource.mName;
          var DOB = resource.DOB;
          var docVerified = resource.docVerified;

          var serverpath = Gen.docs;
          var KYCDetails = new Array();
          if (resource.KYCDetails && resource.KYCDetails.length) {
            for (var i = 0; i < resource.KYCDetails.length; i++) {
              var kycelements = resource.KYCDetails[i];
              var kycaray = {};
              kycaray["docNumber"] = kycelements.docNumber;
              kycaray["docTitle"] = kycelements.docTitle;
              //  var doc = kycelements.docFile;
              kycaray["docFile"] = kycelements.docFile;

              KYCDetails.push(kycaray);
            }
          }
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
            "email": email, "KYCFlag": KYCFlag, 'mName': mName, "DOB": DOB, "G24K": g1v, "S99P": g4v, "countryCode": countryCode,
            "balance": walletBal, "KYCDetails": KYCDetails, "billingAddress": billingAddress, "image": image,
            "docVerified": docVerified, "permanentAddress": permanentAddress, "gender": gender
          });

        }
      });
    }
  })
};




exports.ins_reference_registration_admin = function (req, res) {
  var auth = new AuthKYC(req.user);
  var kycall = new KycAll();
  var ben = new Beneficiary(req.user);
  var stock = new Stock(req.user);

  var subs = req.body.fname.substr(0, 4);
  var dob = new Date(Date.parse(req.body.DOB));
  var year = dob.getFullYear();
  var password = subs + year;

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
  kycall.channel = 'Company Admin',
    kycall.createDate = new Date();
  // kycall.emailExpiryDate = new Date(new Date().getTime() + Gen.emailExpiryTime);
  kycall.createUser = 'User';
  kycall.refernceTruID = refernceid;
  kycall.referralID = refernceid;
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
              "stock.G24K": "0.00", "stock.S99P": 0.2,
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
              notification_controller.notification_registartion(truId, req.body.fname);

              var date = Date.parse(new Date());
              var hashstr = crnNo + date.toString();
              var url2 = crypto.createHash('md5').update(hashstr).digest('hex');

              // KycAll.findOneAndUpdate({truID:truId},{$set:{emailVerificationCode: url2}}).exec()
              KycAll.findOneAndUpdate({ truID: truId }, { $set: { referenceVerified: true, emailVerificationCode: url2 } }).exec()

              //email_controller.email_registartion(req.body.email, req.body.fname, req.body.lname, url2);
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
}



exports.Update_KYC_entity_consumer = function (req, res) {

  var mobile = req.body.mobile;
  var query = { mobile: mobile };

  KycAll.find(
    query, function (err, docs) {
      if (!docs.length) {
        res.json({
          status: "204",
          message: "The request was successful but no body was returned."
        });
      } else {
        KycAll.findOneAndUpdate(query, {
          $set:
          {
            "billingAddress.houseNumber": req.body.housenumber, "billingAddress.streetNumber": req.body.streetnumber, "billingAddress.landmark": req.body.landmark,
            "billingAddress.pin": req.body.pin, "billingAddress.city": req.body.city, "billingAddress.state": req.body.state, "billingAddress.country": req.body.country
          },
          "permanentAddress.houseNumber": req.body.phousenumber, "permanentAddress.streetNumber": req.body.pstreetnumber,
          "permanentAddress.landmark": req.body.plandmark, "permanentAddress.pin": req.body.ppin, "permanentAddress.city": req.body.pcity,
          "permanentAddress.state": req.body.pstate, "permanentAddress.country": req.body.pcountry,
          gender: req.body.gender, DOB: req.body.dob
        }, callback)

        function callback(err, numAffected) {
          if (err) {
            res.json({ status: "204", message: "Something went wrong." });
          }

          KycAll.aggregate([{ "$match": query }, {
            "$project": {
              _id: 0,
              name: { "$concat": ["$fName", "  ", "$lName"] }
            }
          }]).exec(function (err, result) {
            if (err) {
              res.json({ status: "204", message: "Something went wrong." });
            }
            else {
              res.json({ status: "200", message: "Details updated successfully for " + result[0].name + "." });
            }
          }
          )
        }
      }
    }
  )
}

exports.ins_reference_registration_entity_consumer = function (req, res) {
  var auth = new AuthKYC(req.user);
  var kycall = new KycAll();
  var ben = new Beneficiary(req.user);
  var stock = new Stock(req.user);

  var mobile = req.body.mobile;

  ROTP.find({ "mobile": mobile, "type": "registration", "status": "success" }, function (err, docs) {
    if (!docs.length) {
      res.json({ status: "204", message: 'Please verify OTP before registartion.' });
    }
    else {
      var password = req.body.password;
      if (password) {
        var hashtwo = bcrypt.hashSync(password, salt);
      } else {
        var subs = req.body.fname.substr(0, 4);
        var year = "2019"
        var pwd = subs + year;
        var hashtwo = bcrypt.hashSync(pwd, salt);
      }

      var crnno = randomize('A0', 7);
      var crnNo = 'c'.concat(crnno);

      var truid = randomize('0', 12);
      var truId = '5000'.concat(truid);


      var kycflag = req.body.kycflag;
      var refernceid = req.body.refernceid;
      auth.mobile = req.body.mobile;
      auth.CRNNo = crnNo;
      auth.password = hashtwo;
      auth.isPwdReset = false;

      kycall.KYCFlag = "active";
      kycall.currentassetstore = defaultConf.currentassetstore;
      if (req.body.countrycode != undefined) { kycall.countryCode = req.body.countrycode }
      kycall.fName = req.body.fname;
      kycall.mName = req.body.mname;
      kycall.lName = req.body.lname;
      kycall.mobile = req.body.mobile;
      kycall.nodeID = req.body.nodeid;
      kycall.CRNNo = crnNo;
      kycall.truID = truId;
      kycall.refernceID = refernceid;
      kycall.channel = 'Direct',
        kycall.createDate = new Date();
      // kycall.emailExpiryDate = new Date(new Date().getTime() + Gen.emailExpiryTime);
      kycall.createUser = 'User';
      kycall.refernceTruID = refernceid;
      kycall.referralID = refernceid;
      kycall.image = "0";
      kycall.referalCount = "0";
      kycall.referenceVerified = true;

      AuthKYC.find({ mobile: req.body.mobile }, function (err, docs) {
        if (!docs.length) {
          auth.save(function (err) {
            if (err) {
              console.log(err);
            } else {
              KycAll.find({ mobile: req.body.mobile }, function (err, docs) {
                if (!docs.length) {
                  kycall.save(function (err) {
                    if (err) {
                      console.log(err)
                    }
                    else {
                      ins_beneficiary();
                      res.json({ status: "201", message: 'Consumer Created!' });
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
                        "stock.G24K": "0.00", "stock.S99P": 0.2,
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
                        notification_controller.notification_registartion(truId, req.body.fname);

                        var date = Date.parse(new Date());
                        var hashstr = crnNo + date.toString();
                        var url2 = crypto.createHash('md5').update(hashstr).digest('hex');

                        // KycAll.findOneAndUpdate({truID:truId},{$set:{emailVerificationCode: url2}}).exec()
                        KycAll.findOneAndUpdate({ truID: truId }, { $set: { referenceVerified: true, emailVerificationCode: url2 } }).exec()

                        //  email_controller.email_registartion(req.body.email, req.body.fname, req.body.lname, url2);
                      }
                    });
                  }
                }
                else {
                }
              }
              )
            }
          }
          )
        }
        else {
          res.json({ status: "409", message: 'User Already Exists!' });
        }
      }
      )
    }
  }
  )
}

exports.show_customer_profile_for_entity_consumer = function (req, res) {

  var truid = req.body.truid;
  var refrenceid = req.body.refrenceid;
  var nodeid = req.body.nodeid;

  KycAll.find({
    refernceTruID: refrenceid, nodeID: nodeid,
    $or: [{ email: truid }, { mobile: truid }, { truID: truid }]
  }, function (err, docs) {
    if (!docs.length) {
      res.json({
        status: "204",
        message: "Customer is not registered under  Gold Bullion. Please register to proceed!"
      });
    } else {
      KycAll.aggregate([
        { $match: { refernceTruID: refrenceid, nodeID: nodeid, $or: [{ email: truid }, { mobile: truid }, { truID: truid }] } },
        {
          $project: {
            fName: 1, lName: 1, countryCode: 1, DOB: 1, mName: 1, gender: 1, refernceTruID: 1, nodeID: 1,
            billingAddress: 1, permanentAddress: 1, image: { $concat: [Gen.profile, "$image"] },
            _id: 0, truID: 1, mobile: 1, KYCFlag: 1, email: 1
          }
        }
      ]).exec(function (err, result) {
        if (err) {
          response.status(500).send({ error: err })
          return next(err);
        }
        else {
          var resource = result[0];

          var name = resource.name;
          var countryCode = resource.countryCode;
          var fName = resource.fName;
          var lName = resource.lName;
          var mName = resource.mName;
          var DOB = resource.DOB;
          var countryCode = resource.countryCode;

          var billingAddress = resource.billingAddress;
          var permanentAddress = resource.permanentAddress;

          var truID = resource.truID;
          var mobile = resource.mobile;
          var email = resource.email;
          var KYCFlag = resource.KYCFlag;
          var image = resource.image;
          var gender = resource.gender;
          var refernceTruID = resource.refernceTruID;
          var nodeID = resource.nodeID;

          var Final = ({
            'name': name, "fName": fName, "lName": lName, 'truID': truID, "mobile": mobile, "email": email, "KYCFlag": KYCFlag,
            'mName': mName, "DOB": DOB, "billingAddress": billingAddress, countryCode: countryCode, nodeID: nodeID,
            "image": image, "permanentAddress": permanentAddress, "gender": gender, refernceTruID: refernceTruID
          });
          res.json(
            { status: "200", resource: Final }
          );
        }
      }
      )
    }
  }
  )
}

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
}



exports.list_stock_entity_consumer = function (req, res) {

  var mobile = req.body.mobile;

  KycAll.find({
    "mobile": mobile
  }, function (err, docs) {
    if (!docs.length) {
      res.json({
        status: "204",
        message: "The request was successful but no body was returned."
      });
    } else {
      KycAll.aggregate([
        { $match: { __t: "KycAll", mobile: mobile } },
        { $project: { name: { $concat: ["$fName", " ", "$lName"] }, truID: 1, _id: 0, mobile: 1 } },
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
            name: 1, mobile: 1,
            g1: "$stock.stock.G24K",
            g4: "$stock.stock.S99P"
          }
        }
      ]).exec(function (err, result) {
        if (err) {
          response.status(500).send({ error: err })
          return next(err);
        }
        else {
          var resource = result[0];
          var name = resource.name;
          var mobile = resource.mobile;

          var g1v = resource.g1.toJSON().$numberDecimal;
          var g4v = resource.g4.toJSON().$numberDecimal;

          var Final = ({ 'name': name, "mobile": mobile, "G24K": g1v, "S99P": g4v });
          res.json(
            { status: "200", resource: Final }
          );
        }
      });
    }
  })
};

exports.cust_up_kyc_flag_admin = function (req, res) {
  //docverify is true when active
  var truid = req.body.truid,
    kycflag = req.body.kycflag,
    kycdesc = req.body.kycdesc;
  KycAll.find({
    "truID": truid
  }, function (err, docs) {
    if (!docs.length) {
      res.json({
        status: "200",
        message: "This truID Doesnt exists"
      });
    } else {
      var docverified = docs[0].docVerified;
      var updated = {
        KYCFlag: kycflag,
        KYCDesc: kycdesc,
        docVerified: true,
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
      }, { new: true }, callback)
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
          panStatus: doc.panStatus,
          aadharStatus: doc.aadharStatus
        }
        res.send({
          "status": 200, resource: updateddata
        })
      }
    }
  }
  )
}




exports.consumer_update_kyc_flag_admin = function (req, res) {
  var truid = req.body.truid,
    kycflag = req.body.kycflag,
    kycdesc = req.body.kycdesc;


  var query = {
    truID: truid
  }
  KycAll.find({
    "truID": truid
  }, function (err, docs) {
    if (!docs.length) {
      res.json({
        status: "200",
        message: "This truID Doesnt exists"
      });
    } else {
      KycAll.findOneAndUpdate(query, {
        $set: {
          KYCFlag: kycflag,
          KYCDesc: kycdesc
        }
      }, callback)
    }

    function callback(err) {
      if (err) {
        res.send(err);
      } else {
        KycAll.aggregate([{
          "$match": {
            truID: truid
          }
        }, {
          "$project": {
            _id: 0,
            KYCFlag: 1,
            docVerified: 1
          }
        }]).exec(function (err, result) {
          if (err) {
            response.status(500).send({
              error: err
            })
            return next(err);
          } else {
            var resource = result;
            res.json({ status: "200", resource: resource });
          }
        }
        )
      }
    }
  }
  )
}


exports.Update_KYC_from_entity = function (req, res) {

  var truid = req.body.truid;
  var query = { truID: truid };

  KycAll.find(
    query, function (err, docs) {
      if (!docs.length) {
        res.json({ status: "204", message: "The request was successful but no body was returned." });
      } else {
        KycAll.findOneAndUpdate(query, {
          $set:
          {
            "billingAddress.houseNumber": req.body.housenumber, "billingAddress.streetNumber": req.body.streetnumber, "billingAddress.landmark": req.body.landmark,
            "billingAddress.pin": req.body.pin, "billingAddress.city": req.body.city, "billingAddress.state": req.body.state, "billingAddress.country": req.body.country,
            "permanentAddress.houseNumber": req.body.phousenumber, "permanentAddress.streetNumber": req.body.pstreetnumber,
            "permanentAddress.landmark": req.body.plandmark, "permanentAddress.pin": req.body.ppin, "permanentAddress.city": req.body.pcity,
            "permanentAddress.state": req.body.pstate, "permanentAddress.country": req.body.pcountry,
            gender: req.body.gender, DOB: req.body.dob
          },
        }, callback)

        function callback(err, numAffected) {
          if (err) {
            res.json({ status: "204", message: "Something went wrong." });
          }

          KycAll.aggregate([{ "$match": { truID: truid } }, {
            "$project": {
              _id: 0,
              name: { "$concat": ["$fName", "  ", "$lName"] }, cTruID: "$truID"
            }
          }]).exec(function (err, result) {
            if (err) {
              res.json({ status: "204", message: "Something went wrong." });
            }
            else {
              res.json({ status: "200", resource: result[0] });
            }
          }
          )
        }
      }
    }
  )
}

exports.Update_KYCDocs_from_entity = function (req, res) {

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
}



exports.Update_KYCDocs_from_entity_consumer = function (req, res) {

  var mobile = req.body.mobile;
  var query = { mobile: mobile };

  KycAll.find(
    query, function (err, docs) {
      if (!docs.length) {
        res.json({
          status: "204",
          message: "The request was successful but no body was returned."
        });
      } else {
        KycAll.findOneAndUpdate(query, {
          $set: {
            KYCDetails: req.body.kycdetails, KYCFlag: "active", custID: req.body.custid,
            "billingAddress.houseNumber": req.body.housenumber, "billingAddress.streetNumber": req.body.streetnumber, "billingAddress.landmark": req.body.landmark,
            "billingAddress.pin": req.body.pin, "billingAddress.city": req.body.city, "billingAddress.state": req.body.state, "billingAddress.country": req.body.country,
            "permanentAddress.houseNumber": req.body.phousenumber, "permanentAddress.streetNumber": req.body.pstreetnumber,
            "permanentAddress.landmark": req.body.plandmark, "permanentAddress.pin": req.body.ppin, "permanentAddress.city": req.body.pcity,
            "permanentAddress.state": req.body.pstate, "permanentAddress.country": req.body.pcountry,
            gender: req.body.gender, DOB: req.body.dob
          }
        }, callback)

        function callback(err, numAffected) {
          if (err) {
            res.json({ status: "204", message: "Something went wrong." });
          }
          else {
            KycAll.aggregate([{ "$match": query }, {
              "$project": {
                _id: 0,
                name: { "$concat": ["$fName", "  ", "$lName"] }, cTruID: "$truID"
              }
            }]).exec(function (err, result) {
              if (err) {
                res.json({ status: "204", message: "Something went wrong." });
              }
              else {
                res.json({ status: "200", message: "KYC Details Updated Successfully for " + result[0].name + "." });
              }
            })
          }
        }
      }
    }
  )
}


exports.add_kyc_docs_with_name = function (req, res) {
  var padd = new KycAll(req.user);
  var truid = req.body.truid;
  var query = { truID: truid };
  KycAll.findOneAndUpdate(query, {
    $set: {
      KYCDetails: { docTitle: req.body.title, docNumber: req.body.number, nameOnDoc: req.body.nameondoc }
    }
  }, callback)
  KycAll.findOneAndUpdate(query, { $set: { KYCFlag: "active" } }).exec();
  function callback(err, numAffected) {
    if (err)
      res.send(err);
    var respresult = KycAll.find(query, { KYCDetails: 1, _id: 0 });
    respresult.exec(function (err, result) {
      if (err) {
        response.status(500).send({ error: err })
        return next(err);
      }
      else {
        res.json({ status: "200", KYCDetails: result[0].KYCDetails });
      }
    }
    );
  };
};




exports.login_window_mobility = function (req, res) {
  var uname = req.body.username;
  var query = AuthKYC.find({ $or: [{ email: uname }, { mobile: uname }] }).select({ mobile: 1, isPwdReset: 1, password: 1, mPIN: 1, mPINSet: 1, appAccess: 1, _id: 0, });
  KycAll.findOne({ $or: [{ email: uname }, { mobile: uname }] }, function (err, user) {
    query.exec(function (err, result) {
      if (err == null && result == '') {
        if (req.body.flag === "mpin") {
          res.json({ status: "401", message: "Please check the mPin you have entered" });
        } else {
          res.json({ status: "401", message: "The username or password you entered is incorrect." });
        }
      }
      else {
        if (result && result.length > 0) {
          var resmobile = result[0].mobile,
            mpinset = result[0].mPINSet,
            appaccess = result[0].appAccess;
          if (appaccess === false) {
            res.json({ status: "400", message: "You don't have permission to access this application." });
          } else if (result[0].isPwdReset === true) {
            var array = result;
            var parray = array.pop();
            var finalhash = parray.password;
            if (req.body.flag != "pass") {
              finalhash = parray.mPIN;
            }
            if (bcrypt.compareSync(req.body.pwd, finalhash)) {
              callback();
            } else {
              res.json({ status: "401", message: "The username or password you entered is incorrect." });
              KycAll.find({ $or: [{ email: uname }, { mobile: uname }] }).exec(function (err, ressp) {
                if (err) {
                  console.log(err)
                } else {
                  if (ressp.length) {
                    devicelog.update_Consumer_Device_Hash_Login(ressp[0].truID, req.body.deviceID);
                    consumerLog.userloginLog(ressp[0].truID, "app", "consumer", "deviceID", ressp[0].refernceTruID ? ressp[0].refernceTruID : undefined, "trying to login");
                  }
                }
              });
            }
            function callback(err, numAffected) {
              if (err) {
                res.send(err);
              } else {
                KycAll.aggregate([
                  { $match: { __t: "KycAll", $or: [{ email: uname }, { mobile: uname }] } },
                  {
                    $project: {
                      name: { $concat: ["$fName", " ", "$lName"] }, fName: 1, lName: 1, refernceTruID: 1, CRNNo: 1, KYCDetails: 1, DOB: 1, gender: 1, channel: 1,
                      city: "$permanentAddress.city", pin: "$permanentAddress.pin", image: 1, billingAddress: 1, permanentAddress: 1, countryCode: 1,
                      _id: 0, truID: 1, mobile: 1, KYCFlag: 1, email: 1, emailVerified: 1, docVerified: 1, referenceVerified: 1, aadharStatus: 1, panStatus: 1,
                      countryOfOrigin: { $ifNull: ["$countryOfOrigin", "$countryCode"] }
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
                      name: 1, fName: 1, lName: 1, billingAddress: 1, permanentAddress: 1, refernceTruID: 1, CRNNo: 1, KYCDetails: 1, referenceVerified: 1, channel: 1,
                      city: 1, pin: 1, image: 1, countryCode: 1, emailVerified: 1, docVerified: 1, DOB: 1, gender: 1, aadharStatus: 1, panStatus: 1,
                      truID: 1, mobile: 1, KYCFlag: 1, email: 1, countryOfOrigin: 1,
                      G24K: { "$toString": { $cond: [{ $lt: ["$stock.stock.G24K", 0.000001] }, 0.00, "$stock.stock.G24K"] } },
                      S99P: { "$toString": { $cond: [{ $lt: ["$stock.stock.S99P", 0.000001] }, 0.00, "$stock.stock.S99P"] } }
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
                      name: 1, fName: 1, lName: 1, city: 1, pin: 1, truID: 1, mobile: 1, KYCFlag: 1, email: 1, refernceTruID: 1, DOB: 1, gender: 1, countryOfOrigin: 1, channel: 1,
                      image: 1, billingAddress: 1, permanentAddress: 1, countryCode: 1, emailVerified: 1, CRNNo: 1, docVerified: 1, KYCDetails: 1, referenceVerified: 1,
                      G24K: 1, S99P: 1, balance: { "$toString": "$wallet.clBal" }, aadharStatus: 1, panStatus: 1,
                    }
                  }
                ]).exec(async function (err, result) {
                  if (err) {
                    res.json({ status: "204", message: "Something went wrong!" });
                  } else {
                    if (!result.length) {
                      res.json({ status: "401", message: "The username or password you entered is incorrect." });
                    } else {
                      var Final = result[0];
                      if (Final.KYCDetails && Final.KYCDetails.length) {
                        Final.isKYCDocExist = true;
                      } else {
                        Final.isKYCDocExist = false;
                      }
                      if (Final.address) {
                        Final.isaddress = true;
                      } else {
                        Final.isaddress = false;
                      }
                      Final.mPINSet = mpinset;
                      if (Final.refernceTruID != "Company") {
                        if (Final.channel != "Direct") {
                          // var enquery = await enKYC.find({ truID: Final.refernceTruID }).select({ companyName: 1, brandLogo: 1 });
                          var enquery = await enKYC.aggregate([
                            { $match: { truID: Final.refernceTruID } },
                            {
                              $lookup: {
                                from: "kycs",
                                localField: "parentTruID",
                                foreignField: "truID",
                                as: "parentDetails"
                              }
                            },
                            { $unwind: "$parentDetails" },
                            { $project: { companyName: 1, brandLogo: "$parentDetails.brandLogo" } }
                          ])

                          if (enquery.length > 0) {
                            // console.log("enquery", enquery[0])
                            Final.brand = enquery[0].companyName;
                            Final.brandLogo = enquery[0].brandLogo;
                            res.json({ status: "200", resource: Final });
                          } else {
                            res.json({ status: "200", resource: Final });
                          }
                        } else {
                          res.json({ status: "200", resource: Final });
                        }
                      } else {
                        res.json({ status: "200", resource: Final });
                      }
                      devicelog.update_Consumer_Device_Hash_Login(Final.truID, req.body.deviceID);
                      consumerLog.userloginLog(Final.truID, "app", "consumer", req.body.deviceID, Final.refernceTruID ? Final.refernceTruID : undefined, "login");
                    }
                  }
                });
              }
            }
          } else {
            res.json({ status: "204", message: "Please reset your password", mobile: resmobile });
          }
        }
        else {
          res.json({ status: "401", message: "The username or password you entered is incorrect." });
        }
      }
    }
    )
  }
  )
};


exports.verify_Mpin_mobility = async function (req, res) {
  var truid = req.body.truid;
  var mpin = req.body.mpin;

  var kycdeatails = await KycAll.find({ truID: truid });
  if (kycdeatails.length) {
    AuthKYC.find({ $or: [{ mobile: kycdeatails[0].mobile }] }).select({ mobile: 1, isPwdReset: 1, password: 1, mPIN: 1, mPINSet: 1, appAccess: 1, _id: 0, }).exec(function (err, result) {
      var array = result;
      var parray = array.pop();
      var finalhash = parray.mPIN;
      if (bcrypt.compareSync(mpin, finalhash)) {
        res.json({ status: "200", resource: "MPin verified Successfully" })
      } else {
        res.json({ status: "203", resource: "incorrect MPin" })
      }
    })
  } else {
    res.json({ status: "204", resource: "consumer not found!!" })
  }

};


exports.change_MPIN = function (req, res) {
  var email = req.body.email;
  var mobile = req.body.mobile;

  if (mobile) {
    var query = KycAll.findOne({ mobile: mobile }, {
      _id: 0, __t: 0, CRNNo: 1, fName: 1, lName: 1, email: 1,
      mobile: 1, emailVerified: 1
    });
  } else if (email) {
    var query = KycAll.findOne({ email: email }, {
      _id: 0, __t: 0, CRNNo: 1, fName: 1, lName: 1, email: 1,
      mobile: 1, emailVerified: 1
    });
  }

  query.exec(function (err, result) {
    if (err) {
      res.json({ status: "500", message: "Internal Server Error" });
    } else {
      if (result == null) {
        res.json({ status: "403", message: "unAuthorised User!" });
      }
      else {
        var crnno = result.CRNNo;
        var consumername = result.fName + " " + result.lName;
        var email = result.email;
        var mobile = result.mobile;
        var emailVerified = result.emailVerified;
        var query_auth = AuthKYC.findOne({ CRNNo: crnno }, { _id: 0, mPIN: 1 });
        query_auth.exec(function (err, result) {
          if (result == null) {
            res.json({ status: "403", message: "unAuthorised User!" });
          }
          else {

            if (bcrypt.compareSync(req.body.mPIN, result.mPIN)) {
              res.json({ status: "204", message: "New mPIN must be different from current mPIN." });
            } else {
              if (req.body.oldpin && bcrypt.compareSync(req.body.oldpin, result.mPIN)) {
                matchMPIN(req.body.mPIN);
              }
              else if (req.body.oldpin) {
                res.json({ status: "204", message: "Please enter valid current MPIN" });
              }
              else {
                matchMPIN(req.body.mPIN);
              }

              function matchMPIN(mPIN) {
                var hashtwo = bcrypt.hashSync(mPIN, salt);
                AuthKYC.findOneAndUpdate({ "CRNNo": crnno }, { "$set": { "mPIN": hashtwo, "mPINSet": true } }).exec(function (err, result) {
                  if (err) {
                    res.json({ status: "204", message: "Something went wrorng!" });
                  }
                  else {
                    res.json({ status: "200", message: "Mobile PIN updated successfully." });
                    var mailtype = emailVerified === true ? "both" : "sms";
                    email_controller.changePasswordMPIN("MPINReset", email, mobile, consumername, mailtype);
                  }
                })
              }
            }
          }
        })
      }

    }

  })
}




exports.count_all_consumer = function (req, res) {

  KycAll.aggregate([{ $match: { "__t": "KycAll" } },
  {
    $facet: {
      direct: [{ $match: { "channel": "Direct" } }, { "$count": "count" }],
      entity: [{ $match: { channel: { "$ne": "Direct" }, refernceTruID: { $regex: /8000/ } } }, { "$count": "count" }],
      admin: [{ $match: { channel: "Company Admin", refernceTruID: { $regex: /1000/ } } }, { "$count": "count" }],
      assetmanager: [{ $match: { channel: { "$ne": "Direct" }, refernceTruID: { $regex: /6000/ } } }, { "$count": "count" }],
      assetstore: [{ $match: { channel: { "$ne": "Direct" }, refernceTruID: { $regex: /7000/ } } }, { "$count": "count" }],
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
}


exports.generate_reference_code = function (req, res) {

  var code = randomize('Aa0', 6);
  let referenceid = code.toString(),
    truid = req.body.truid;

  KycAll.find({ truID: truid }, function (err, docs) {
    if (!docs.length) {
      res.json({ status: "204", message: "The request was successful but no body was returned." });
    }
    else if (docs[0].selfReferenceID) {
      res.json({ status: "200", selfReferenceID: docs[0].selfReferenceID });
    }
    else {
      KycAll.findOneAndUpdate({ truID: truid }, { $set: { selfReferenceID: referenceid } }).exec(function (err) {
        if (err) {
          res.json({ status: "204", message: "Something went wrong!" });
        }
        else {
          KycAll.find({ truID: truid }, { _id: 0, selfReferenceID: 1 }, function (err, finaldocs) {
            if (!finaldocs.length) {
              res.json({ status: "204", message: "Something went wrong!" });
            }
            else {

              res.json({ status: "200", selfReferenceID: finaldocs[0].selfReferenceID });
            }
          }
          )
        }
      }
      )
    }
  }
  );
}


exports.verify_reference_code = function (req, res) {

  KycAll.find({ selfReferenceID: req.body.referenceid }, { _id: 0, truID: 1 }, function (err, finaldocs) {
    if (!finaldocs.length) {
      res.json({ status: "204", message: "This reference does not exists!" });
    }
    else {
      res.json({ status: "200", truID: finaldocs[0].truID });
    }
  }
  )
}




exports.verify_reference_code_external = function (req, res) {
  res.json({ status: "204", message: "Please use referral code on registration of a new user!" });

  //     var truid = req.body.truid;
  //     var referenceid = req.body.referenceid;
  //     KycAll.find({truID : truid}, function (err, docs) {
  //       if (!docs.length){
  //         res.json({ status: "204", message: "The request was successful but no body was returned." });
  //       }
  //       else{
  //         var fname = docs[0].fName,
  //             lname = docs[0].lName;
  // if(docs[0].referenceVerified === false){
  //     KycAll.find({selfReferenceID : referenceid},{_id:0,truID:1,referalCount:1}, function (err, finaldocs) {
  //       if (!finaldocs.length){
  //         res.json({ status: "204", message: "This reference does not exists!" });
  //       }
  //       else{
  //         var reftruid= finaldocs[0].truID,
  //           refcount =parseFloat(docs[0].referalCount);
  //           if(reftruid === truid){
  //             res.json({ status: "204", message: "Please use different referral code!" });
  //           }else{
  //             ReferralStockLog.find({truID : truid, referenceTruID : reftruid},function(err,refdoc){
  //               if(refdoc && refdoc.length){
  //                 res.json({ status: "204", message: "You have already used this reference code!" });
  //               }else{
  //                 var earnflg = "single";
  //             if(refcount <= 15){
  //               // Stock.findOneAndUpdate({truID : truid},{$inc:{"stock.S99P":0.19}}).exec();
  //               Stock.findOneAndUpdate({truID : reftruid},{$inc:{"stock.S99P":0.2}}).exec();
  //               earnflg = "both";
  //             }
  //             KycAll.findOneAndUpdate({truID : reftruid},{$set:{referalCount : (refcount +1).toString()}}).exec();
  //             Stock.findOneAndUpdate({truID : truid},{$inc:{"stock.S99P":0.2}}).exec();
  //             KycAll.findOneAndUpdate({truID : truid},{$set:{refernceTruID:reftruid,referenceVerified:true}}).exec();
  //             notification_controller.notify_refree(truid,reftruid,fname,lname,referenceid);
  //             ReferralStockLog.findOneAndUpdate({truID : truid}, {$set :
  //               {truID : truid,
  //               referenceTruID : reftruid,
  //               createDate : new Date(),
  //               stockAmt :"0.2",
  //               bullioType :"S99P",
  //               earnFlag : earnflg
  //               }},{upsert : true}).exec();
  //             //   }},{upsert : true}).exec(function (err) {
  //             //  if (err)
  //             //  {
  //             //    console.log(err)
  //             //  }
  //             //                  }
  //             //                )
  //           res.json({ status: "200", message: "Reference Verified successfully."});
  //                 } 
  //               }
  //             )
  //           }
  //         }
  //       }
  //     )
  //   }else{
  //     res.json({ status: "204", message: "You can not use verification code more than one time!" });
  //         }
  //       }
  //     }
  //   )
}



exports.verify_email = function (req, res) {
  KycAll.find({ emailVerificationCode: req.body.verificationcode }, function (err, docs) {
    if (!docs.length) {
      res.json({ status: "204", message: "This verification code does not exists!" });
    }
    else {
      var truid = docs[0].truID;
      KycAll.find({ truID: truid }, { _id: 0, emailVerified: 1 }, function (err, result) {
        if (err || !result || !result.length) {
          res.json({ status: "204", message: "Something went wrong!" });
        }
        else {
          if (result[0].emailVerified === true) {
            res.json({ status: "200", message: "Your email already verified..!!" });
          } else {
            KycAll.findOneAndUpdate({ truID: truid }, { $set: { emailVerified: true } }).exec(function (err) {
              if (err) {
                res.json({ status: "204", message: "Something went wrong!" });
              } else {
                KycAll.find({ truID: truid }, { _id: 0, emailVerified: 1 }, function (err, result) {
                  if (err || !result || !result.length) {
                    res.json({ status: "204", message: "Something went wrong!" });
                  }
                  else {
                    if (result[0].emailVerified === true) {
                      res.json({ status: "200", message: "Your email verified successfully" });
                    } else {
                      res.json({ status: "204", message: "Something went wrong!" });
                    }
                  }
                })
              }
            })
          }
        }
      })
    }
  })
}


exports.list_profile_anyone = function (req, res) {
  var truid = req.body.truid;
  KycAll.aggregate([
    { $match: { __t: "KycAll", $or: [{ truID: truid }, { mobile: truid }, { email: truid }] } },
    {
      $project: {
        fName: 1, lName: 1, createDate: 1, billingAddress: 1, permanentAddress: 1, image: 1,
        _id: 0, truID: 1, mobile: 1, KYCFlag: 1, email: 1, KYCDetails: 1, countryCode: 1
      }
    },
  ]).exec(function (err, result) {
    if (err) {
      response.status(500).send({ error: err })
      return next(err);
    }
    else {
      var resource = result[0];
      var Final = {
        "name": resource.name,
        "fName": resource.fName,
        "lName": resource.lName,
        "city": resource.city,
        "pin": resource.pin,
        "truID": resource.truID,
        "mobile": resource.mobile,
        "email": resource.email,
        "KYCFlag": resource.KYCFlag,
        "KYCDetails": resource.KYCDetails,
        "permanentAddress": resource.permanentAddress,
        "billingAddress": resource.billingAddress,
        "countryCode": resource.countryCode,
        "image": resource.image,
        "createdate": resource.createDate
      };
      res.json({ status: "200", resource: Final });
    }
  });
}

exports.update_email = function (req, res) {
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
      var maildoc = (req.body.email).split("@");
      if (docs[0].emailVerified === false) {
        if (maildoc[1] != "fake.company.com") {
          if (docs[0].email != req.body.email) {
            AuthKYC.findOneAndUpdate({ CRNNo: docs[0].CRNNo }, { $set: { email: req.body.email } }).exec();
            var address = KycAll.findOneAndUpdate({ truID: req.body.truid },
              { $set: { email: req.body.email } })
            address.exec(function (err, result) {
              if (!docs.length) {
                res.send(err);
              } else {
                var fname = docs[0].fName;
                var lname = docs[0].lName;

                var date = Date.parse(new Date());
                var hashstr = docs[0].CRNNo + date.toString();
                var url2 = crypto.createHash('md5').update(hashstr).digest('hex');

                //   email_controller.email_registartion(req.body.email, fname, lname, url2);
                res.json({
                  status: "200", message: "Details Updated."
                });
              }
            }
            )
          } else {
            res.json({
              status: "204", message: "Email Already Exist..!!", email: docs[0].email, emailVerified: docs[0].emailVerified
            });
          }
        } else {
          res.json({
            status: "204", message: "You don't have permission to update your Email ID..!!", email: docs[0].email, emailVerified: docs[0].emailVerified
          });
        }
      } else {
        res.json({
          status: "204", message: "Email Already Verified..!!", email: docs[0].email, emailVerified: docs[0].emailVerified
        });
      }
    }
  }
  )
}

exports.update_Cust_Details_from_Entity = function (req, res) {
  var housenumber = req.body.housenumber,
    streetnumber = req.body.streetnumber,
    landmark = req.body.landmark,
    pin = req.body.pin,
    city = req.body.city,
    state = req.body.state,
    country = req.body.country,
    dob = new Date(req.body.DOB),
    gender = req.body.gender;
  KycAll.find({
    truID: req.body.truid
  }, function (err, docs) {
    if (!docs.length) {
      res.json({
        status: "204",
        message: "Consumer Not Exists..!!."
      });
    } else {
      KycAll.findOneAndUpdate({ truID: req.body.truid }, {
        $set: {
          permanentAddress: {
            houseNumber: housenumber, streetNumber: streetnumber, landmark: landmark,
            pin: pin, city: city, state: state, country: country
          },
          gender: gender, DOB: dob
        }
      }).exec(function (err, result) {
        if (err) {
          res.json({ status: "204", message: "* Field Required..!!" })
        }
        else {
          res.json({ status: "200", message: "Consumer Address Update Successfully..!!" });
        }
      })
    }
  }
  )
}

exports.email_verification_OTP = function (req, res) {
  var truid = req.body.truid;
  KycAll.find({ truID: truid }, function (err, docs) {
    if (!docs.length) {
      res.json({ status: "204", message: "The request was successful but no body was returned." });
    } else {
      var email = docs[0].email,
        mobile = docs[0].mobile,
        type = "email",
        name = docs[0].fName + " " + docs[0].lName;
      var maildoc = (email).split("@");
      if (docs[0].emailVerified === false) {
        if (maildoc[1] != "fake.company.com") {
          request.post({
            "headers": { "content-type": "application/json" },
            "url": reqip + ":4123/api/generateotpforemail",
            "body": JSON.stringify({
              "email": email,
              "mobile": mobile,
              "type": type,
              "name": name,
            })
          }, (error, response, body) => {
            if (error) {
              return console.dir(error);
            } else {
              var newjson = JSON.parse(body);
              res.json(newjson);
            }
          })
        } else {
          res.json({
            status: "204", message: "Please Update valid Email ID..!!", email: docs[0].email, emailVerified: docs[0].emailVerified
          });
        }
      } else {
        res.json({
          status: "204", message: "Email Already Verified..!!", email: docs[0].email, emailVerified: docs[0].emailVerified
        });
      }
    }
  }
  )
}

exports.email_verification_verify = function (req, res) {
  var truid = req.body.truid;
  var otp = req.body.otp;
  KycAll.find({ truID: truid }, function (err, docs) {
    if (!docs.length) {
      res.json({ status: "204", message: "The request was successful but no body was returned." });
    }
    else {
      var email = docs[0].email,
        mobile = docs[0].mobile,
        type = "email"
      request.post({
        "headers": { "content-type": "application/json" },
        "url": reqip + ":4123/api/otpverifyforemail",
        "body": JSON.stringify({
          "email": email,
          "mobile": mobile,
          "type": type,
          "otp": otp,
        })
      }, (error, response, body) => {
        if (error) {
          return console.dir(error);
        }
        var newjson = JSON.parse(body);
        //console.dir(JSON.parse(body));
        if (newjson.status == "200") {
          KycAll.findOneAndUpdate({ truID: truid }, { $set: { emailVerified: true } }).exec()
        }
        res.json(newjson);
      });
    }
  });
}

exports.update_email_and_send_OTP = function (req, res) {
  KycAll.find({
    truID: req.body.truid
  }, function (err, docs) {
    if (!docs.length) {
      res.json({
        status: "204",
        message: "The request was successful but no body was returned."
      });
    } else {
      var maildoc = (req.body.email).split("@");
      var email = req.body.email,
        mobile = docs[0].mobile,
        type = "email",
        cname = docs[0].fName + " " + docs[0].lName;
      if (docs[0].emailVerified === false) {
        if (maildoc[1] != "fake.company.com") {
          // if (docs[0].email != req.body.email) {
          KycAll.find({ "email": req.body.email }, function (err, emaildocs) {
            if (err) {
              res.send(err);
            } else {
              if (!emaildocs.length) {
                AuthKYC.findOneAndUpdate({ CRNNo: docs[0].CRNNo }, { $set: { email: req.body.email } }).exec();
                var address = KycAll.findOneAndUpdate({ truID: req.body.truid }, { $set: { email: req.body.email } })
                address.exec(function (err, result) {
                  if (!docs.length) {
                    res.send(err);
                  } else {
                    request.post({
                      "headers": { "content-type": "application/json" },
                      "url": reqip + ":4123/api/generateotpforemail",
                      "body": JSON.stringify({
                        "email": email,
                        "mobile": mobile,
                        "type": type,
                        "name": cname,
                      })
                    }, (error, response, body) => {
                      if (error) {
                        return console.dir(error);
                      }
                    })
                    res.json({
                      status: "200", message: "Details Updated."
                    });
                  }
                });
              } else {
                if (emaildocs[0].truID === req.body.truid) {
                  request.post({
                    "headers": { "content-type": "application/json" },
                    "url": reqip + ":4123/api/generateotpforemail",
                    "body": JSON.stringify({
                      "email": email,
                      "mobile": mobile,
                      "type": type,
                      "name": cname,
                    })
                  }, (error, response, otpbody) => {
                    if (error) {
                      return console.dir(error);
                    } else {
                      res.json(JSON.parse(otpbody))
                    }
                  })
                } else {
                  res.json({
                    status: "204", message: "Email Id Already Exist..!!", email: emaildocs[0].email,
                  });
                }

              }
            }
          });
          // } else {
          //   res.json({
          //     status: "204", message: "Email Already Exist..!!", email: docs[0].email, emailVerified: docs[0].emailVerified
          //   });
          // }
        } else {
          res.json({
            status: "204", message: "You don't have permission to update your Email ID..!!", email: docs[0].email, emailVerified: docs[0].emailVerified
          });
        }
      } else {
        res.json({
          status: "204", message: "Email Already Verified..!!", email: docs[0].email, emailVerified: docs[0].emailVerified
        });
      }
    }
  }
  )
}

exports.check_Consumer_Exist_In_Admin = function (req, res) {
  var truid = req.body.truid;
  KycAll.find({ $or: [{ truID: truid }, { mobile: truid }, { email: truid }] }, function (err, docs) {
    console.log("error", err);
    if (!docs.length) {
      res.json({ status: "204", message: "User not exist..!!" });
    }
    else {
      res.json({ status: "200", truID: docs[0].truID, CRNNo: docs[0].CRNNo })

    }
  })
}

exports.add_consumer_import_minimal_json = function (req, res) {

  var consumers = req.body.consumers;
  var ret = new Array();
  var parentid = req.body.parentid;
  function fromServer(i) {
    return new Promise((resolve, reject) => {
      var input = consumers[i];
      var ispwd = input.password ? true : false
      var subs = input.firstName.length ? input.firstName.substr(0, 4) : input.firstName;
      var mob = input.mobile.substring(input.mobile.length - 4);
      var password = input.password ? input.password : subs + mob;

      request.post({
        "headers": { "content-type": "application/json" },
        "url": reqip + ":4112/api/referenceregistrationimportjson",
        "body": JSON.stringify({
          "email": input.email,
          "password": password,
          "fname": input.firstName,
          "mname": input.middleName ? input.middleName : "",
          "lname": input.lastName,
          "mobile": input.mobile,
          "kycflag": "pending",
          "refernceid": parentid,
          "ispwd": ispwd,
          "countrycode": defaultConf.defaultContryCode
        })
      }, (error, response, body) => {
        if (error) {
          console.log(err);
        }
        var newjson = JSON.parse(body);
        if (newjson.status === "409") {
          ret.push(consumers[i]);
          resolve(true)
        } else if (newjson.status === "201") {
          resolve(true);
        }
      });
    });
  }
  async function forLoopGood() {
    for (var i = 0; i < consumers.length; i++) {
      await fromServer(i);
    }
    if (ret.length == 0 && i == consumers.length) {
      res.json({ status: "200", message: "Consumer created successfully!" })
    } else {
      res.json({ status: "204", message: "Records already exist!", consumers: ret })
    }
  }
  forLoopGood();
}

exports.entity_Details_from_EnMobile = function (req, res) {
  var truID = req.body.truID;
  var mobile = req.body.mobile;
  KycAll.find({ truID: truID }).exec(function (err, dox) {
    if (err) {
      res.json({ status: "200", message: "Internal Server Error" })
    } else {
      if (!dox.length) {
        res.json({ status: "204", message: "consumer not found" })
      } else {
        var bodyjson = { "mobile": mobile };
        if (req.body.type) {
          bodyjson.type = req.body.type
        }
        request.post({
          "headers": { "content-type": "application/json" },
          "url": reqip + ":4121/api/entityDetailsFromMobile",
          "body": JSON.stringify(bodyjson)
        }, function (err, response, body) {
          if (err) {
            res.status(500).json({ status: "500", message: "Ïnternal Server Error" })
          } else {
            if (response.statusCode == 200) {
              var resp = JSON.parse(body);
              res.json(resp);
            } else {
              res.json({ status: "500", message: "Somthing went wrong..!!" });
            }
          }
        });
      }
    }
  });
}

exports.consumer_Details_Update_Befor_KYC = function (req, res) {
  var truid = req.body.truid;
  var query = req.body.json;
  KycAll.find({ truID: truid }).exec(function (err, result) {
    if (err) {
      res.json({ status: "500", message: "Internal Server Error" });
    } else {
      if (!result.length) {
        res.json({ status: "204", message: "TruID not found" });
      } else {
        var referralid = result[0].referralID === "Company" ? result[0].refernceTruID : result[0].referralID;
        if (result[0].docVerified === true && result[0].aadharStatus && result[0].aadharStatus === "active") {
          res.json({ status: "203", message: "Cannot update...!! Documents has been already verified" })
        } else {
          if (query.email) {
            if (result[0].emailVerified === true) {
              var remainigjson = { fName: query.fName, lName: query.lName, gender: query.gender, DOB: query.DOB, mobile: query.mobile, countryCode: query.countrycode };
              var remain = {};
              if (remainigjson.fName) {
                remain["fName"] = remainigjson.fName;
              } if (remainigjson.lName) {
                remain["lName"] = remainigjson.lName;
              } if (remainigjson.gender) {
                remain["gender"] = remainigjson.gender;
              } if (remainigjson.mobile) {
                remain["mobile"] = remainigjson.mobile;
                remain["countryCode"] = remainigjson.countryCode;
              } if (remainigjson.DOB) {
                remain["DOB"] = remainigjson.DOB;
              }
              if (remainigjson.billingAddress && remainigjson.permanentAddress) {
                remain["billingAddress"] = remainigjson.billingAddress;
                remain["permanentAddress"] = remainigjson.permanentAddress;
              }
              if (remain && Object.keys(remain).length === 0) {
                res.json({ status: "204", message: "Email Already Verified..!!" });
              } else {
                updateDetails(referralid, truid, remain, query.email);
              }

            } else {
              KycAll.find({ email: query.email }).exec(function (err, result) {
                if (!result.length) {
                  updateDetails(referralid, truid, query);
                } else {
                  var json = { fName: query.fName, lName: query.lName, gender: query.gender, DOB: query.DOB, mobile: query.mobile, email: query.email, countryCode: query.countrycode }
                  var jsonobj = {};
                  if (json.fName) {
                    jsonobj["fName"] = json.fName;
                  } if (json.lName) {
                    jsonobj["lName"] = json.lName;
                  } if (json.gender) {
                    jsonobj["gender"] = json.gender;
                  } if (json.mobile) {
                    jsonobj["mobile"] = json.mobile;
                    jsonobj["countryCode"] = json.countryCode;
                  } if (json.email) {
                    jsonobj["email"] = json.email;
                  } if (json.DOB) {
                    jsonobj["DOB"] = json.DOB;
                  }
                  if (jsonobj && Object.keys(jsonobj).length === 0) {
                    res.json({ status: "204", message: "Email Already Exist..!!" });
                  } else {
                    updateDetails(referralid, truid, jsonobj);
                  }
                }
              })
            }
          }
          else {
            updateDetails(referralid, truid, query);
          }

        }
      }
    }
  })
  function updateDetails(referral, truID, queries, email) {
    KycAll.findOneAndUpdate({ truID: truID }, { $set: queries }, { new: true }).exec(async function (err, updatedresult) {
      if (err) {
        res.json({ status: "500", message: "Internal Server Error" });
      } else {
        var crrno = updatedresult.CRNNo ? updatedresult.CRNNo : undefined;
        var updatedata = {};

        updatedata["mobile"] = queries.mobile ? queries.mobile : updatedresult.mobile ? updatedresult.mobile : undefined;
        updatedata["email"] = email ? email : queries.email ? queries.email : updatedresult.email ? updatedresult.email : undefined;

        if (queries.email || queries.mobile) {
          AuthKYC.findOneAndUpdate({ CRNNo: crrno }, { $set: updatedata }, { new: true }).exec();
        }
        res.json({ status: "200", message: "Customer Details updated successfully..!!", resource: updatedresult });
        notification_controller.notification_registartion(truID, queries.fName + " " + queries.lName);
      }
    })
  }
}
exports.Update_KYCDocs_for_Individual = function (req, res) {

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
        if (docs[0].KYCDetails && !docs[0].KYCDetails.length) {
          let aadharStat = "pending";
          let panStat = "pending";
          var msgdoc = "";
          for (var i = 0; i < req.body.kycdetails.length; i++) {
            if (req.body.kycdetails[i].docTitle === "Aadhaar") {
              msgdoc = "Aadhaar";
              aadharStat = "active";
            }
            if (req.body.kycdetails[i].docTitle === "Pan") {
              msgdoc = "Pan";
              panStat = "active";
            }
          }
          let setval = { KYCDetails: req.body.kycdetails, KYCFlag: "active", aadharStatus: aadharStat, panStatus: panStat };
          if (req.body.validationViaAPI === true) {
            setval.docVerified = true;
          }
          KycAll.findOneAndUpdate({ "truID": truid }, { $set: setval }, async function (err, numAffected) {
            if (err) {
              res.json({ status: "204", message: "Something went wrong." });
            }
            else {
              await KycAll.findOneAndUpdate({ "truID": truid }, { $set: setval }, { upsert: true });
              res.json({ status: "200", message: msgdoc + " verified Successfully." });
            }
          })
        }
        else {
          uploadDocs();
          async function uploadDocs() {
            for (var i = 0; i < req.body.kycdetails.length; i++) {
              await updateDocsDetails(req.body.kycdetails[i])
            }
            if (uploaded.length) {
              if (notuploaded.length) {
                res.json({ status: "200", message: "Document verified Successfully.", reason: notuploaded });
              } else {
                res.json({ status: "200", message: "Document verified Successfully." });
              }

            }
            else if (notuploaded.length) {
              res.json({ status: "204", message: "Document Not verified.", reason: notuploaded });
            } else {
              res.json({ status: "204", message: "Document Not verified." });
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
                    let setval = { KYCFlag: "active" };
                    if (kycdetail.docTitle === "Aadhaar") {
                      setval.aadharStatus = "active";
                      setval.docVerified = true;
                    }
                    if (kycdetail.docTitle === "Pan") {
                      setval.panStatus = "active";
                    }
                    KycAll.findOneAndUpdate({ "truID": truid }, {
                      $addToSet: {
                        KYCDetails: kycdetail
                      }
                    }, { upsert: true }, function (err, numAffected) {
                      if (err) {
                        res.json({ status: "204", message: "Something went wrong." });
                      }
                      else {
                        KycAll.findOneAndUpdate({ "truID": truid }, { $set: setval }, { upsert: true }).exec();
                        res.json({ status: "200", message: kycdetail.docTitle + " verified Successfully." });
                      }
                    })

                  }
                  else {
                    function upld() {
                      let setval = {
                        KYCFlag: "active",
                        "KYCDetails.$": kycdetail
                      }
                      if (kycdetail.docTitle === "Aadhaar") {
                        setval.aadharStatus = "active";
                        setval.docVerified = true;
                      }
                      if (kycdetail.docTitle === "Pan") {
                        setval.panStatus = "active";
                      }
                      if (req.body.validationViaAPI === true) {
                        setval.docVerified = true
                      }
                      KycAll.findOneAndUpdate({ "truID": truid, "KYCDetails.docTitle": kycdetail.docTitle }, {
                        $set: setval
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

      }
    }
  )
}

exports.checkIsValidConsumer = function (req, res) {
  var truid = req.body.truid;
  KycAll.find({ truID: truid }, function (err, docs) {
    if (!docs.length) {
      res.json({ status: "204", message: "The request was successful but no body was returned." });
    }
    else {
      var resource = docs[0];
      var Final = {
        "truID": resource.truID,
        "KYCFlag": resource.KYCFlag,
        "docVerified": resource.docVerified,
        "emailVerified": resource.emailVerified,
        "aadharStatus": resource.aadharStatus,
        "panStatus": resource.panStatus,
        "isMinor": resource.isMinor,
        "isVACreated": resource.isVACreated,
        "createUser": resource.createUser,
        "refernceTruID": resource.refernceTruID
      };
      res.json({ status: "200", resource: Final });
    }
  })
}

exports.searchIsValidConsumer = function (req, res) {
  var truid = req.body.truid;
  KycAll.find({ $or: [{ truID: truid }, { email: truid }, { mobile: truid }] }, function (err, docs) {
    if (!docs.length) {
      res.json({ status: "204", message: "The request was successful but no body was returned." });
    }
    else {
      var resource = docs[0];
      var Final = {
        "truID": resource.truID,
        "KYCFlag": resource.KYCFlag,
        "docVerified": resource.docVerified,
        "emailVerified": resource.emailVerified,
        "aadharStatus": resource.aadharStatus,
        "panStatus": resource.panStatus,
        "isMinor": resource.isMinor,
        "isVACreated": resource.isVACreated,
        "createUser": resource.createUser
      };
      res.json({ status: "200", resource: Final });
    }
  }
  )
}

exports.searchIsValidConsumerLogin = function (req, res) {
  var username = req.body.userName;
  var password = req.body.password ? req.body.password : req.body.mPIN;
  var query = AuthKYC.find({ $or: [{ email: username }, { mobile: username }] }).select({ mobile: 1, isPwdReset: 1, password: 1, _id: 0, mPIN: 1 });
  KycAll.findOne({ $or: [{ email: username }, { mobile: username }] }, function (err, user) {
    query.exec(function (err, result) {
      if (err == null && result == '') {
        res.json({ status: "401", message: "The username or password you entered is incorrect." });
      } else {
        var resmobile = result[0].mobile;
        var isPasswordReset = result[0].isPwdReset
        if (isPasswordReset === true) {
          var array = result;
          var parray = array.pop();

          var finalhash = parray.password;
          if (req.body.mPIN) {
            finalhash = parray.mPIN;
          }
          if (bcrypt.compareSync(password, finalhash)) {
            callback();
          } else {
            res.json({ status: "401", message: "The username or password you entered is incorrect." });
          }
          function callback() {
            var resource = user;
            var Final = {
              "truID": resource.truID,
              "KYCFlag": resource.KYCFlag,
              "docVerified": resource.docVerified,
              "emailVerified": resource.emailVerified,
              "aadharStatus": resource.aadharStatus,
              "panStatus": resource.panStatus,
              "isMinor": resource.isMinor,
              "isVACreated": resource.isVACreated,
              "createUser": resource.createUser
            };
            //  console.log("Final",Final)
            res.json({ status: "200", resource: Final });
          }
        } else {
          res.json({ status: "204", message: "Please reset your password", mobile: resmobile });
        }
      }
    })
  }
  )
};
