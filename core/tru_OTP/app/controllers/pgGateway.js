
'use strict'

var AuthKYC = require('../models/custKYCAuthModel'),
    KYCAll = require('../models/custKYCAllModel'),
    ROTP = require('../models/truOTPModel'),
    randomize = require('randomatic'),
    UserToken = require('../models/userToken'),
    { defaultNONPanLimit, defaultCurrency } = require('../Generics'),
    LOTP = require('../models/truOTPLogModel');

//Generate OTP for pg client
exports.generate_otp_for_pgclient = function (req, res) {
    var mobile = req.body.mobile;
    var type = req.body.type;
    var otp = req.body.otp;
    var details = "Otp for our client consumers"
    var date = new Date();
    KYCAll.find({ mobile: mobile }, function (err, result) {
        if (result && result.length > 0) {
            var mobile = result[0].mobile;
            var CRNNo = result[0].CRNNo;
            var panStatus = result[0].panStatus;
            if (result[0].docVerified) {
                if (parseFloat(req.body.amount) > defaultNONPanLimit) {
                    if (panStatus === "active") {
                        setOTP()
                    } else {
                        res.status(403).send({ respCode: "1101", message: "PAN required for above transaction " + defaultCurrency + defaultNONPanLimit + "." });
                    }
                } else {
                    setOTP();
                }
            } else {
                res.status(403).send({ respCode: "403", message: "KYC not active..!!" });
            }

            function setOTP() {
                var lotp = new LOTP(req.user);

                
                lotp.type = type;
                lotp.status = "failure";
                lotp.mobile = mobile;
                lotp.OTP = otp;
                lotp.createDate = date;
                lotp.detail = details;
                lotp.save(function (err) {
                    if (err) {
                        res.status(500).send({ respCode: "500", error: err })
                    }
                    else {
                        UpdateOTP();
                    }
                })
            }
            function UpdateOTP() {                
                var respresult = ROTP.findOneAndUpdate({ mobile: mobile }, {
                    $set: {
                        "mobile": mobile, "OTP": otp, "status": "failure",
                        "timeStamp": date, "type": type, "detail": details
                    }
                }, { upsert: true })
                respresult.exec(function (err, result) {
                    if (err) {
                        res.status(500).send({ respCode: "500", error: err })
                    }
                    else {
                        var mask = mobile.replace(/.(?=.{4})/g, 'x');
                        res.status(200).json({ "respCode": "1000", "message": 'OTP sent successfully on ' + mask + '..!!', "otp": otp, "mobile": mobile, "CRNNo": CRNNo });
                    }
                })
            }
        } else {
            res.status(403).json({ respCode: "403", message: "Please provide valid mobile no..!!" })
        }
    })
}
//verify OTP for pg client
exports.verify_otp_for_pgclient = function (req, res) {
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
                    respresult.exec(function (err, rest) {
                        if (err) {
                            res.status(500).send({ respCode: "500", error: err })
                        }
                        else {
                            ROTP.aggregate([
                                { $match: { mobile: mobile, OTP: otp, type: type, status: "success" } },
                                { $project: { mobile: 1, hash: 1, OTP: 1, successDate: 1, dateDifference: { $subtract: [new Date(), "$timeStamp"] } } },
                                {
                                    $project: {
                                        mobile: 1, OTP: 1, hash: 1, successDate: 1, timeout: { $add: ["$successDate", 5 * 60 * 1000] }, dateDifference: 1,
                                        status: { $cond: { if: { $lte: ["$dateDifference", 300000] }, then: "1000", else: "300" } }
                                    }
                                }
                            ]).exec(function (err, result) {
                                if (err) {
                                    res.status(500).send({ respCode: "500", error: err })
                                }
                                else {
                                    if (req.body.type == "pg") {
                                        var userQuery = {
                                            "CRNNo": req.body.crnno,
                                            "clientID": req.body.clientID
                                        }
                                        var userToken = randomize('Aa0!', 20);
                                        var respresult = UserToken.findOneAndUpdate(userQuery, { $set: { type: req.body.type, userToken: userToken, clientID: req.body.clientID } }, { upsert: true })
                                        respresult.exec(function (err, rest) {
                                            if (err) {
                                                res.status(500).send({ respCode: "500", error: err })
                                            }
                                            else {
                                                res.status(200).json({ respCode: "1000", userToken: userToken, message: 'Verified Successfully..!!' });
                                            }
                                        })
                                    }

                                }
                            })
                        }
                    })
                }
                else {
                    res.status(200).json({ respCode: "300", message: 'Invalid OTP' });
                }
            })
        }
        else {
            res.status(200).json({ respCode: "300", message: 'Invalid Consumer CRNNo..!!' });
        }
    })
}
//verify OTP for pg client
exports.verify_userToken_for_pgclient = function (req, res) {
    var userToken = req.body.userToken;
    var type = req.body.type;
    var clientID = req.body.clientID;
    UserToken.find({ userToken: userToken, type: type, clientID: clientID }, async function (err, docs) {
        if (docs && docs.length > 0) {
            var userDetails = await KYCAll.findOne({CRNNo : docs[0].CRNNo});
            res.status(200).json({ respCode: "1000", userToken: req.body.userToken, message: 'Account Verified Successfully..!!', truID: userDetails.truID, CRNNo: userDetails.CRNNo });
        }
        else {
            res.status(200).json({ respCode: "900", message: 'Invalid Token..!!' });
        }
    })
}
