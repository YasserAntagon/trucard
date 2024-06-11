
'use strict'

var mongoose = require('mongoose'),
  request = require('request'),
  https = require('https'),
  bcrypt = require('bcrypt'),
  salt = bcrypt.genSaltSync(10),
  HASHToken = require('../models/hashToken'),
  KycAll = require('../models/custKYCAllModel'),
  ROTP = require('../models/truOTPModel'),
  AuthKYC = require('../models/custKYCAuthModel'),
  LOTP = require('../models/truOTPLogModel'),
  Gen = require('../Generics'),
  randomize = require('randomatic');
//Generate OTP for
exports.generate_otp_for_client = function (req, res) {
  var crnno = req.body.crnno;
  var type = req.body.type;
  var otp = Gen.randomOTP ? randomize('0', 6) : "123456"; //req.body.otp ? req.body.otp :
 // var otp =  randomize('0', 6); 
  AuthKYC.find({ CRNNo: crnno }, function (err, result) {

    if (result && result.length > 0) {
      var mobile = result[0].mobile;
      var lotp = new LOTP(req.user);
      var query = { mobile: mobile };
      var date = new Date();
      var details = "Otp for our client consumers"
      lotp.type = type;
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
          console.log("log dump")
        }
      })
      var respresult = ROTP.findOneAndUpdate(query, {
        $set: {
          "mobile": mobile, "OTP": otp, "status": "failure",
          "timeStamp": date, "type": type, "detail": details
        }
      }, { upsert: true })
      respresult.exec(function (err, result) {
        if (err) {
          response.status(500).send({ error: err })
          return next(err);
        }
        else {
          var mask = mobile.replace(/.(?=.{4})/g, 'x');
          res.json({ "status": "1000", "message": 'OTP sent successfully on ' + mask + '..!!',"otp":otp,mobile:mobile });
        }
      }
      )
    } else {
      res.json({ status: "411", message: "Please provide valid fields..!!" })
    }
  })
}

//Verify OTP for entity redeem
exports.verify_otp_for_client = function (req, res) {

  var badd = new ROTP(req.user);
  var crnno = req.body.crnno;
  var otp = req.body.otp;
  var type = req.body.type;
  var date = new Date();

  AuthKYC.find({ CRNNo: crnno }, function (err, docs) {
    if (docs.length) {
      var mobile = docs[0].mobile;
      ROTP.find({ "mobile": mobile, OTP: otp, type: type, status: "failure" }, function (err, docs) {
        if (docs.length) {
          var query = { mobile: mobile };
          var respresult = ROTP.findOneAndUpdate(query, { $set: { "successDate": date, status: "success" } }, { upsert: true })
          respresult.exec(function (err, result) {
            if (err) {
              response.status(500).send({ error: err })
              return next(err);
            }
            else {
              ROTP.aggregate([
                { $match: { mobile: mobile, OTP: otp, type: type, status: "success" } },
                { $project: { mobile: 1, hash: 1, OTP: 1, successDate: 1, dateDifference: { $subtract: [new Date(), "$timeStamp"] } } },
                {
                  $project: {
                    mobile: 1, OTP: 1, hash: 1, successDate: 1, timeout: { $add: ["$successDate", 5 * 60 * 1000] }, dateDifference: 1,
                    status: { $cond: { if: { $lte: ["$dateDifference", 300000] }, then: "1000", else: "411" } }
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
                }
              }
              )
            }
          }
          )
        }
        else {
          res.json({ resource: { status: "411", message: 'Invalid OTP' } });
        }
      }
      )
    }
    else {
      res.json({ resource: { status: "411", message: "Invalid OTP" } });
    }
  }
  )
}

exports.generate_Hash = function (req, res) {
  var fname = req.body.fname;
  var lname = req.body.lname;
  var mobile = req.body.mobile;
  var email = req.body.email;
  var rTruId = req.body.rtruid;
  var hlog = new HASHToken();
  KycAll.find({ $and: [{ "email": email }, { mobile: mobile }, { fName: fname }, { lName: lname }] }, function (err, result) {
    if (result && result.length > 0) {
      var CRNNo = result[0].CRNNo;
      var truID = result[0].truID;
      var query = { truID: truID, status: "failure", rTruId: rTruId };
      const d1 = new Date();
      var queueId = Date.parse(d1).toString();
      var rand = randomize('0', 2);
      var hash = randomize('Aa0', 20) + rand;
      var respresult = HASHToken.findOneAndUpdate(query, {
        $set: {
          status: "failure",
          hash: hash,
          rTruId: rTruId
        },
      }, { returnOriginal: false });
      respresult.exec(function (err, result) {
        if (err) {
          response.status(500).send({ error: err })
          return next(err);
        }
        else {
          if (result) {
            res.json({ status: "1000", token: result.hash, queueId: result.queueId, truID: truID, CRNNo: CRNNo, message: 'login successfully!' })
          }
          else {
            hlog.queueId = queueId;
            hlog.CRNNo = CRNNo;
            hlog.truID = truID;
            hlog.status = "failure";
            hlog.statusDate = d1;
            hlog.createDate = d1;
            hlog.hash = hash;
            hlog.rTruId = rTruId;
            hlog.save(function (err) {
              if (err) {
                res.send(err); 
              }
              else {
                res.json({ status: "1000", token: hash, queueId: queueId, truID: truID, CRNNo: CRNNo, message: 'login successfully!' })
              }
            })
          }
        }
      })
    } else {
      res.json({ status: "411", message: "Please provide valid fields..!!" })
    }
  })
}


exports.generate_HashByClientID = function (req, res) {
  var CRNNo = req.body.crnno;
  var rTruId = req.body.rtruid;
  var hlog = new HASHToken();
  KycAll.find({ CRNNo: CRNNo }, function (err, result) {
    if (result && result.length > 0) {
      var CRNNo = result[0].CRNNo;
      var truID = result[0].truID;
      var query = { truID: truID, status: "failure", rTruId: rTruId };
      const d1 = new Date();
      var queueId = Date.parse(d1).toString();
      var rand = randomize('0', 2);
      var hash = randomize('Aa0', 20) + rand;
      var respresult = HASHToken.findOneAndUpdate(query, {
        $set: {
          status: "failure",
          hash: hash,
          rTruId: rTruId
        },
      }, { returnOriginal: false });
      respresult.exec(function (err, result) {
        if (err) {
          response.status(500).send({ error: err })
          return next(err);
        }
        else {
          if (result) {
            res.json({ status: "1000", token: result.hash, queueId: result.queueId, truID: truID, CRNNo: CRNNo, message: 'token generated successfully!' })
          }
          else {
            hlog.queueId = queueId;
            hlog.CRNNo = CRNNo;
            hlog.truID = truID;
            hlog.status = "failure";
            hlog.statusDate = d1;
            hlog.createDate = d1;
            hlog.hash = hash;
            hlog.rTruId = rTruId;
            hlog.save(function (err) {
              if (err) {
                res.send(err);
                console.log(err)
              }
              else {
                res.json({ status: "1000", token: hash, queueId: queueId, truID: truID, CRNNo: CRNNo, message: 'token generated successfully!' })
              }
            })
          }
        }
      })
    } else {
      res.json({ status: "411", message: "Please provide valid fields..!!" })
    }
  })
}

//Verify OTP for entity redeem
exports.verify_cHash = function (req, res) {
  var truid = req.body.crnno;
  var token = req.body.token;
  KycAll.find({ CRNNo: truid }, function (err, result) {
    if (result && result.length > 0) {
      HASHToken.find({ truID: result[0].truID, hash: token, status: "failure" }, function (err, docs) {
        if (docs.length) {
          res.json({ status: "1000", message: "Verified Successfully" });
        }
        else {
          res.json({ status: "411", message: "Invalid Token" });
        }
      })
    }
    else {
      res.json({ status: "411", message: "Invalid Token" });
    }
  })
}

exports.update_Token = function (req, res) {
  var truid = req.body.crnno;
  var token = req.body.token;
  KycAll.find({ CRNNo: truid }, function (err, result) {
    if (result && result.length > 0) {
      var respresult = HASHToken.findOneAndUpdate({ truID: result[0].truID, hash: token, status: "failure" }, {
        $set: {
          status: "success",
          hash: token,
          statusDate: new Date()
        },
      }, { returnOriginal: false });
      respresult.exec(function (err, result) {
        if (result) {
          res.json({ status: "1000", message: "Hash Updated" });
        }
        else {
          res.json({ status: "411", message: "Invalid Token" });
        }
      })
    }
  })
}
