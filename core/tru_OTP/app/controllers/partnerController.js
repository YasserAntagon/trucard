
'use strict'

const request = require('request'),
    KycAll = require('../models/remmit/remmitKYCAllModel'),
    ROTP = require('../models/remmit/truOTPModel'),
    LOTP = require('../models/remmit/truOTPLogModel'),
    Gen = require('../Generics');

exports.generate_otp_on_registration = function (req, res) {
    let mobile = req.body.mobile,
        type = req.body.type;
    if (type === "registration") {
        var companytype = req.body.companyType;
        var cinno = req.body.cinno;
        if (companytype && companytype !== "soleProprietor" && companytype !== "partnership") {
            KycAll.find({ CINNo: cinno }, function (err, result) {
                if (err) {
                    res.status(500).json({ status: '500', message: 'Internal Server Error' });
                } else if (!result.length) {
                    sendreq();
                }
                else {
                    res.json({ status: '204', message: 'Partner CINNo Already Exists!' });
                }
            })
        } else {
            sendreq();
        }
    } else {
        KycAll.aggregate([
            { $match: { "mobile": mobile } },
            { $limit: 1 }
        ]).exec(function (err, result) {
            if (err) {
                res.json({ status: "500", message: "Internal Server Error" });
            } else {
                if (!result.length) {
                    res.json({ status: "205", message: "User not found...!" })
                }
                else {
                    sendreq();
                }
            }
        });
    }

    function sendreq() {
        LOTP.aggregate([
            { $match: { mobile: mobile, type: type } },
            { $project: { _id: 0, mobile: 1, createDate: 1, successDate: 1, type: 1, dateDifference: { $subtract: [new Date(), "$createDate"] } } },
            { $project: { status: { $cond: { if: { $lte: ["$dateDifference", 900000] }, then: "200", else: "400" } } } },
            { $match: { status: "200" } },
            { $group: { _id: null, myCount: { $sum: 1 } } },
            { $project: { _id: 0, status: { $cond: { if: { $lt: ["$myCount", 100] }, then: "200", else: "400" } } } }
        ]).exec(function (err, otpcounts) {
            if (err) {
                res.json({ status: 500, message: "Internal Server Error" });
            }
            else if (!otpcounts.length || otpcounts[0].status === "200") {
                request.post({
                    "headers": { "content-type": "application/json", "Authorization": "Bearer " + Gen.bearer130 },
                    "url": Gen.reqip + "130",
                    "body": JSON.stringify({
                        "mobile": mobile,
                    })
                }, (error, body) => {
                    var body = JSON.parse(body.body);
                    if (error) {
                        return console.dir(error);
                    }
                    if (body.status === "200") {
                        var otp = body.OTP;
                        var details = body.details;

                        let lotp = new LOTP();
                        var date = new Date();
                        lotp.type = type;
                        lotp.status = "failure";
                        lotp.mobile = mobile;
                        lotp.OTP = otp;
                        lotp.createDate = date;
                        lotp.detail = details;
                        lotp.save(function (err) {
                            if (err) {
                                console.log(err)
                                res.json({
                                    status: "204",
                                    message: "Something went wrong!"
                                });
                                console.log(err)
                            }
                            else {

                                var respresult = ROTP.findOneAndUpdate({ mobile: mobile }, {
                                    $set: {
                                        "mobile": mobile, "OTP": otp, "status": "failure",
                                        "timeStamp": date, "type": type, "detail": details
                                    }
                                }, { upsert: true })
                                respresult.exec(function (err, result) {
                                    if (err) {
                                        res.json({ "status": "204", "message": 'something went wrong!' });
                                    }
                                    else {

                                        ROTP.findOne({ "mobile": mobile, "OTP": otp, "status": "failure", "type": type, "detail": details }, function (err, result) {
                                            if (err) {
                                                res.json({ "status": "204", "message": 'something went wrong!' });
                                            }
                                            else {
                                                res.json({ "status": "201", "message": 'OTP sent to mobile number', mobile: result.mobile });
                                            }
                                        })
                                    }
                                })
                            }
                        })
                    } else {
                        res.json({ status: "204", message: "Something went wrong!" });
                    }
                })
            } else {
                res.json({ status: 204, message: "You have exceeds your OTP Limit..!" });
            }
        })
    }




}



//Verify OTP
exports.verify_otp = function (req, res) {
    var mobile = req.body.mobile;
    var otp = req.body.otp;
    ROTP.find({ "mobile": mobile, OTP: otp, $or: [{ type: "registration" }, { type: "fPassword" }, { type: "MPIN" }, { type: "accountverify" }], status: "failure" }, function (err, docs) {
        if (docs.length) {
            ROTP.aggregate([
                { $match: { mobile: mobile, OTP: otp, $or: [{ type: "registration" }, { type: "fPassword" }, { type: "MPIN" }, { type: "accountverify" }], status: "failure" } },
                { $project: { mobile: 1, OTP: 1, dateDifference: { $subtract: [new Date(), "$timeStamp"] } } },
                {
                    $project: {
                        mobile: 1, OTP: 1, dateDifference: 1,
                        status: { $cond: { if: { $lte: ["$dateDifference", 300000] }, then: 200, else: 400 } }
                    }
                }
            ]).exec(async function (err, result) {
                if (err) {
                    response.status(500).send({ error: err })
                    return next(err);
                }
                else {
                    var resource = result[0];
                    await ROTP.findOneAndUpdate({ mobile: mobile }, { $set: { "successDate": new Date(), status: "success" } }, { upsert: true })                    
                    res.json({ status: "200", resource: resource });
                }
            }
            )
        }
        else {
            res.json({ resource: { status: "400", message: 'wrong mobile number or OTP' } });
        }
    }
    )
}