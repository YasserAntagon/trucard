
const ConsumerDevicelogs = require('../models/consumerDevice'),
    KycAll = require('../models/custKYCAllModel'),
    AuthKYC = require('../models/custKYCAuthModel');
exports.update_Consumer_Device_Hash = function (req, res) {
    var truID = req.body.truid;
    var deviceID = req.body.deviceid;
    var devicename = req.body.devicename;

    KycAll.find({ truID: truID }, function (err, cudocs) {
        if (cudocs && cudocs.length > 0) {
            ConsumerDevicelogs.find({ "deviceID": deviceID, "truID": truID }, function (err, docs) {
                if (docs && docs.length > 0) {
                    var dateInt = Date.parse(new Date);
                    var dateCreate = Date.parse(docs[0].createDate);
                    const diffTime = Math.abs(dateInt - dateCreate);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    if (diffDays > 31) {
                        ConsumerDevicelogs.findOneAndUpdate({ "deviceID": deviceID, "truID": truID }, { $set: { lastLogin: new Date(), createDate: new Date() } }, { new: true }, function (err, udocs) {
                            if (err) {
                                console.log(err)
                            } else {
                                LogUpdated(truID, cudocs[0])
                            }
                        })
                    }
                    else {
                        ConsumerDevicelogs.findOneAndUpdate({ "deviceID": deviceID, "truID": truID }, { $set: { lastLogin: new Date() } }, { new: true }, function (err, udocs) {
                            if (err) {
                                console.log(err)
                            } else {
                                LogUpdated(truID, cudocs[0])
                            }
                        })
                    }
                }
                else {
                    let device = ConsumerDevicelogs();
                    device.truID = truID;
                    device.createDate = new Date();
                    device.lastLogin = new Date();
                    device.deviceID = deviceID;
                    device.device = devicename;
                    device.appType = "app";
                    device.save(function (err) {
                        if (err) {
                            console.log(err)
                        } else {
                            LogUpdated(truID, cudocs[0])
                        }
                    })
                }
            })
        }
        else {
            res.json({ status: "204", message: "Invalid Consumer" })
        }
    })
    function LogUpdated(truID, cudocs) {
        var query = AuthKYC.find({ $or: [{ email: cudocs.email }, { mobile: cudocs.mobile }] }).select({ mobile: 1, isPwdReset: 1, password: 1, mPIN: 1, mPINSet: 1, _id: 0 });
        query.exec(function (err, results) {
            if (err == null && results == '') {
                if (req.body.flag === "mpin") {
                    res.json({ status: "401", message: "Please check the mPin you have entered" });
                } else {
                    res.json({ status: "401", message: "The username or password you entered is incorrect." });
                }
            }
            else {
                if (results && results.length > 0) {
                    var resmobile = results[0].mobile,
                        mpinset = results[0].mPINSet;

                    KycAll.aggregate([
                        { $match: { __t: "KycAll", truID: truID } },
                        {
                            $project: {
                                name: { $concat: ["$fName", " ", "$lName"] }, fName: 1, lName: 1, refernceTruID: 1, CRNNo: 1, KYCDetails: 1, DOB: 1, gender: 1,
                                city: "$permanentAddress.city", pin: "$permanentAddress.pin", image: 1, address: "$permanentAddress", countryCode: 1,
                                _id: 0, truID: 1, mobile: 1, KYCFlag: 1, email: 1, emailVerified: 1, docVerified: 1, referenceVerified: 1, aadharStatus:1, panStatus:1
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
                                name: 1, fName: 1, lName: 1, address: 1, refernceTruID: 1, CRNNo: 1, KYCDetails: 1, referenceVerified: 1,
                                city: 1, pin: 1, image: 1, countryCode: 1, emailVerified: 1, docVerified: 1, DOB: 1, gender: 1, aadharStatus:1, panStatus:1,
                                truID: 1, mobile: 1, KYCFlag: 1, email: 1,
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
                                name: 1, fName: 1, lName: 1, city: 1, pin: 1, truID: 1, mobile: 1, KYCFlag: 1, email: 1, refernceTruID: 1, DOB: 1, gender: 1,
                                image: 1, address: 1, countryCode: 1, emailVerified: 1, CRNNo: 1, docVerified: 1, KYCDetails: 1, referenceVerified: 1,
                                g1: 1, g4: 1, balance: "$wallet.clBal", aadharStatus:1, panStatus:1
                            }
                        }
                    ]).exec(function (err, result) {
                        if (err) {
                            res.json({ status: "204", message: "Something went wrong!" });
                        }
                        else {
                            var resource = result[0];
                            var docexist = false;
                            if (resource.KYCDetails && resource.KYCDetails.length) {
                                docexist = true;
                            }
                            else {
                                docexist = false;
                            }

                            var isaddress = false;
                            if (resource.address) {
                                isaddress = true;
                            }

                            var Final = ({
                                "name": resource.name,
                                "fName": resource.fName,
                                "lName": resource.lName,
                                "truID": resource.truID,
                                "mobile": resource.mobile,
                                "email": resource.email,
                                "KYCFlag": resource.KYCFlag,
                                "DOB": resource.DOB,
                                "gender": resource.gender,
                                "emailVerified": resource.emailVerified,
                                "referenceVerified": resource.referenceVerified,
                                "isKYCDocExist": docexist,
                                "CRNNo": resource.CRNNo,
                                "docVerified": resource.docVerified,
                                "image": resource.image,
                                "referenceID": resource.refernceTruID,
                                "city": resource.city,
                                "pin": resource.pin,
                                "isAddress": resource.isaddress,
                                "address": resource.address,
                                "countryCode": resource.countryCode,
                                "G24K": resource.g1.toJSON().$numberDecimal,
                                "S99P": resource.g4.toJSON().$numberDecimal,
                                "balance": resource.balance.toJSON().$numberDecimal,
                                "mPINSet": mpinset,
                                "aadharStatus": resource.adharStatus,
                                "panStatus": resource.panStatus
                            });
                            res.json({ status: "200", resource: Final });
                        }
                    });
                }
            }
        })
    }
}
exports.update_Consumer_Device_Hash_Login = function (truID, deviceID, devicename) {
    ConsumerDevicelogs.find({ "deviceID": deviceID, "truID": truID }, function (err, docs) {
        if (docs && docs.length > 0) {
            ConsumerDevicelogs.findOneAndUpdate({ "deviceID": deviceID, "truID": truID }, { $set: { lastLogin: new Date() } }, { new: true }, function (err, udocs) {
                if (err) {
                    console.log(err)
                } else {
                    console.log("logUpdated")
                }
            })
        } else {
            let device = ConsumerDevicelogs();
            device.truID = truID;
            device.createDate = new Date();
            device.lastLogin = new Date();
            device.deviceID = deviceID;
            device.device = devicename ? devicename : "web";
            device.appType = "app";
            device.save(function (err) {
                if (err) {
                    console.log(err)
                } else {
                    console.log("logUpdated")
                }
            })
        }
    })
}
exports.verify_Consumer_Device_Hash = function (req, res) {
    var truID = req.body.truid;
    var deviceID = req.body.deviceid;
    KycAll.find({ truID: truID }, function (err, cudocs) {
        if (cudocs && cudocs.length > 0) {
            var mobile = cudocs[0].mobile ? cudocs[0].mobile : undefined;
            var emailVerified = cudocs[0].emailVerified;
            var email = cudocs[0].email ? cudocs[0].email : undefined;
            ConsumerDevicelogs.find({ "deviceID": deviceID, "truID": truID }, function (err, docs) {
                if (docs.length > 0) {
                    res.json({ status: "200", truID: docs[0], message: "Device successfully validate..!!" })
                }
                else {
                    res.json({
                        status: "700", message: "Please update this device", truID: truID,
                        mobile: mobile,
                        emailVerified: emailVerified,
                        email: email
                    })
                }
            })
        }
        else {
            res.json({ status: "204", message: "Invalid Consumer" })
        }
    })
}