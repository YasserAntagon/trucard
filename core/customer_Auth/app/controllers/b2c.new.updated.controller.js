//- Created By: Adnan Shaikh

'use strict'

var fs = require('fs'),
    path = require('path'),
    Addresslog = require('../models/custAddressLog'),
    KycAll = require('../models/custKYCAllModel'),
    AuthKYC = require('../models/custKYCAuthModel'),
    enKYC = require('../models/remmit/remmitKYCAllModel'),
    Stock = require('../models/custStockModel'),
    ROTP = require('../models/custOTPModel'),
    devicelog = require("./deviceLog"),
    Wallet = require('../models/custWalletModel'),
    Gen = require("../Generics");
let defaultConf = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../regionConf.json')));
var bcrypt = require('bcrypt');
var salt = bcrypt.genSaltSync(10);
var randomize = require('randomatic');
var reqip = Gen.reqip;
exports.registration_new_B2C = async function (req, res) {
    try {
        var auth = new AuthKYC();
        var kycall = new KycAll();
        var hashtwo = bcrypt.hashSync(req.body.password, salt);
        var crnunique = randomize('A0', 7);
        let crnNo = 'c'.concat(crnunique);

        var truidgen = randomize('0', 12);
        let truId = '5000'.concat(truidgen);
        var mobile = req.body.mobile;
        var email = req.body.email;
        if (!email || email == "") {
            let r = Math.random().toString(36).substring(7); // create random string
            email = r + "_" + mobile + "@fake.company.com";
        }
        var kycflag = "pending";
        var referenceID = req.body.referenceid, kmerchantid, kmid,
            merchantid = req.body.merchantid ? req.body.merchantid : req.body.referenceid,
            deviceid = req.body.deviceid ? req.body.deviceid : "",
            createdBy;
        if (!deviceid) {
            deviceid == "0";
        }
        var referrelcheck = false;
        if (merchantid && merchantid != "0") {
            if (merchantid.startsWith("r")) {
                var endocs = await enKYC.find({ CRNNo: merchantid });
                if (endocs[0].userType === "user") {
                    kmerchantid = endocs.length ? endocs[0].parentTruID : "";
                    createdBy = endocs.length ? endocs[0].truID : "";
                } else {
                    kmerchantid = endocs.length ? endocs[0].truID : ""
                }
                kmid = endocs.length ? endocs[0].MID : ""
            } else {
                if (merchantid.substring(0, 4) === '8000') {
                    var endocs = await enKYC.find({ truID: merchantid });
                    if (endocs[0].userType === "user") {
                        kmerchantid = endocs.length ? endocs[0].parentTruID : "";
                        createdBy = endocs.length ? endocs[0].truID : "";
                    } else {
                        kmerchantid = endocs.length ? endocs[0].truID : ""
                    }
                    kmid = endocs.length ? endocs[0].MID : ""
                }
            }
        }
        if (referenceID && referenceID != "0") {
            var url;
            if (referenceID.startsWith("c")) {
                var cdocs = await KycAll.find({ CRNNo: referenceID });
                if (!cdocs.length) {
                    // res.send({ status: "204", message: 'Referral code is wrong!' });
                    referenceID = "Company";
                    register(referenceID, kmerchantid, kmid);
                }
                else {
                    register(cdocs[0].truID, kmerchantid, kmid);
                }
            } else {
                register(referenceID, kmerchantid, kmid, createdBy);
            }
        } else {
            referenceID = "Company";
            register(referenceID, kmerchantid, kmid);
        }
        function register(referenceID, merchantID, mid, createdBy) {
            var Qquery;
            if (mobile) {
                Qquery = { "mobile": mobile, "type": "registration", "status": "success" }
            } else {
                Qquery = { "email": email, "type": "registration", "status": "success" }
            }

            ROTP.aggregate([{ $match: Qquery }]).exec(function (err, docs) {
                if (err) {
                    res.status(500).json({ status: "500", message: "Internal Server Error" });
                } else {
                    if (!docs.length) {
                        res.json({ status: "204", message: 'Please verify OTP before registartion.' });
                    }
                    else {
                        var emailverifiedflag = false;
                        if (docs[0].email == email) {
                            emailverifiedflag = true
                        }
                        auth.email = email;
                        auth.mobile = mobile;
                        auth.CRNNo = crnNo;
                        auth.password = hashtwo;
                        auth.isPwdReset = true;

                        kycall.email = email;
                        if (mobile) {
                            kycall.mobile = mobile;
                        }
                        kycall.language = req.body.language;
                        kycall.password = req.body.password;
                        kycall.KYCFlag = "pending";
                        kycall.currentassetstore = defaultConf.currentassetstore;
                        if (req.body.countrycode != undefined) { kycall.countryCode = req.body.countrycode }
                        kycall.fName = req.body.fname ? req.body.fname : "";
                        kycall.mName = req.body.mname ? req.body.mname : "";
                        kycall.lName = req.body.lname ? req.body.lname : "";
                        kycall.CRNNo = crnNo;
                        kycall.emailVerified = emailverifiedflag;
                        kycall.truID = truId;
                        kycall.channel = mid ? mid : 'Direct';
                        createdBy ? kycall.createdBy = createdBy : undefined;
                        kycall.createDate = new Date();
                        kycall.createUser = 'User';
                        kycall.refernceTruID = merchantID ? merchantID : referenceID;
                        kycall.referralID = referenceID;
                        kycall.image = "0";
                        kycall.referalCount = "0";
                        kycall.referenceVerified = false;
                        kycall.countryOfOrigin = req.body.countrycode;
                        var queryAuth = [];
                        if (req.body.mobile) {
                            var reqAuth = {};
                            reqAuth["mobile"] = req.body.mobile;
                            queryAuth.push(reqAuth);
                        } else if (email) {
                            var reqAuth = {};
                            reqAuth["email"] = email;
                            queryAuth.push(reqAuth);
                        }

                        AuthKYC.find({ $or: queryAuth }, function (err, docs) {
                            if (!docs.length) {
                                auth.save(function (err) {
                                    if (err) {
                                        // console.log("err3", err);
                                        res.status(500).json({ status: "500", message: "Internal Server Error" });
                                    }
                                    else {
                                        KycAll.find({ $or: queryAuth }, function (err, docs) {
                                            if (!docs.length) {
                                                kycall.save(function (err) {
                                                    if (err) {
                                                        // console.log("err4", err);
                                                        res.status(500).json({ status: "500", message: "Internal Server Error" });
                                                    }
                                                    else {
                                                        devicelog.update_Consumer_Device_Hash_Login(truId, req.body.mhash, req.body.devicename);
                                                        res.json({ status: "201", message: 'User Account Created!', truID: truId, CRNNo: crnNo });
                                                        ins_stock();
                                                        add_wallet();

                                                    }
                                                });

                                                /*  function ins_beneficiary(err, numAffected) {
                                                     if (err) {
                                                         console.log("err5", err);
                                                         res.status(500).json({ status: "500", message: "Internal Server Error" });
                                                     }
                                                     var query = { customertruID: truId };
                                                     var respresult = Beneficiary.findOneAndUpdate(query, { $set: { customertruID: truId } }, { upsert: true })
                                                     respresult.exec(function (err, result) {
                                                         if (err) {
                                                             console.log("err2", err);
                                                             res.status(500).json({ status: "500", message: "Internal Server Error" });
                                                         }
                                                         else {
                                                             
                                                         }
                                                     });
                                                 } */
                                                function ins_stock(err, numAffected) {
                                                    if (err) {
                                                        // console.log("err6", error);
                                                        res.status(500).json({ status: "500", message: "Internal Server Error" });
                                                    }
                                                    var query1 = { truID: truId };
                                                    var respresult = Stock.findOneAndUpdate(query1, {
                                                        $set: {
                                                            truID: truId,
                                                            "stock.G24K": "0.00",  "stock.S99P": "0.00",
                                                            "lStock.G24K": "0.00",  "lStock.S99P": "0.00"
                                                        }
                                                    }, { upsert: true });

                                                    respresult.exec(function (err, result) {
                                                        if (err) {
                                                            // console.log("err7", err);
                                                            response.status(500).send({ error: err })
                                                            return next(err);
                                                        }
                                                        else {
                                                        }
                                                    });
                                                }

                                                function add_wallet(err, numAffected) {
                                                    if (err) {
                                                        // console.log("err8", err);
                                                        res.status(500).json({ status: "500", message: "Internal Server Error" });
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
                                                            // console.log("err9", err);
                                                            response.status(500).send({ error: err })
                                                            return next(err);
                                                        }
                                                        else {
                                                            // var fname = req.body.fname;
                                                            // var lname = req.body.lname;
                                                            // notification_controller.notification_registartion(truId, fname);

                                                            // var date = Date.parse(new Date());
                                                            //  var hashstr = crnNo + date.toString();
                                                            // var url2 = crypto.createHash('md5').update(hashstr).digest('hex');
                                                            // KycAll.findOneAndUpdate({ truID: truId }, { $set: { emailVerificationCode: url2 } }).exec();
                                                            // email_controller.email_registartion(req.body.email, fname, req.body.lname, url2);

                                                        }
                                                    }
                                                    )
                                                }
                                            }
                                            else {
                                                res.json({ status: "204", message: 'User Already Exists!' });
                                            }
                                        }
                                        )
                                    }
                                });
                            }
                            else {
                                res.json({ status: "409", message: 'User Already Exists!' });
                            }
                        }
                        )
                    }

                }
            }
            )
        }
    }
    catch (ex) {
        res.json({ status: "500", message: 'Internal server error!' });
    }
}
exports.address_Update_B2C = function (req, res) {
    var truid = req.body.truid;
    // console.log("sssss")
    KycAll.find({ truID: truid }, function (err, docs) {
        if (!docs.length) {
            res.json({
                status: "204",
                message: "Invalid Consumer"
            });
        } else {
            var query = { truID: truid };
            var billAd = {
                "houseNumber": req.body.housenumber, "streetNumber": req.body.streetnumber, "landmark": req.body.landmark,
                "pin": req.body.pin, "city": req.body.city, "state": req.body.state, "country": req.body.country
            };
            var perAd = {
                "houseNumber": req.body.phousenumber, "streetNumber": req.body.pstreetnumber, "landmark": req.body.plandmark,
                "pin": req.body.ppin, "city": req.body.pcity, "state": req.body.pstate, "country": req.body.pcountry
            };
            const Adres = Addresslog();
            Adres.truID = truid,
                Adres.addressID = Date.parse(new Date()),
                Adres.billingAddress = billAd,
                Adres.permanentAddress = perAd,
                Adres.createDate = Date(),
                Adres.save(function (err) {
                    if (err) {
                        res.status(500).json({ status: "500", message: "Internal Server Error" });
                    } else {
                        KycAll.findOneAndUpdate(query, {
                            $set:
                            {
                                billingAddress: billAd,
                                permanentAddress: perAd
                            }
                        }, { returnNewDocument: true }, callback)

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
                })
            // }
            //     })
        }
    })
}