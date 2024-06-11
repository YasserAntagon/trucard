'use strict'

var mongoose = require('mongoose'),
    request = require('request'),
    KycAll = require('../models/custKYCAllModel'),
    AuthKYC = require('../models/custKYCAuthModel'),
    Beneficiary = require('../models/custBeneficiaryModel'),
    Stock = require('../models/custStockModel'),
    Wallet = require('../models/custWalletModel'),
    KYC = mongoose.model('KycAll'),
    Gen = require("../Generics"),
    notification_controller = require("./notification.controlller"),
    consumerLog = require("./userLogs"),
    fs = require('fs'),
    path = require('path');
let defaultConf = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../regionConf.json')));

var bcrypt = require('bcrypt');
var salt = bcrypt.genSaltSync(10);
var randomize = require('randomatic');
var reqip = Gen.reqip;


exports.client_ConsumerRegistration = function (req, res) {

    var dob = new Date();
    if (req.body.dob) {
        const d = new Date(req.body.dob);
        dob = d == "Invalid Date" ? dob : d;
    }
    var auth = new AuthKYC(req.user);
    var kycall = new KycAll();
    var password = req.body.password;
    var clientID = req.body.clientid;
    var hashtwo = bcrypt.hashSync(password, salt);
    var crnnoauto = randomize('A0', 7);
    var crnNo = 'c'.concat(crnnoauto);
    var truid = randomize('0', 12);
    var truIds = '5000'.concat(truid);
    var email = req.body.email ? req.body.email.toLowerCase() : undefined;
    var mobile = req.body.mobile;
    var refernceid = req.body.refernceid;

    var lname = req.body.lname ? req.body.lname : "";
    auth.email = email;
    auth.mobile = req.body.mobile;
    auth.CRNNo = crnNo;
    auth.password = hashtwo;
    auth.isPwdReset = false;
    auth.appAccess = false;
    kycall.email = email;
    kycall.KYCFlag = "active";
    kycall.CRNNo = crnNo;
    kycall.currentassetstore = defaultConf.currentassetstore;
    if (req.body.countrycode != undefined) { kycall.countryCode = req.body.countrycode }
    kycall.fName = req.body.fname;
    kycall.mName = "";
    kycall.lName = lname;
    kycall.mobile = req.body.mobile;
    kycall.truID = truIds;
    kycall.refernceID = refernceid; //Enter remmit or another refferance truID truid here
    kycall.channel = req.body.channel;
    kycall.createDate = new Date();
    kycall.DOB = dob;
    kycall.gender = req.body.gender ? (req.body.gender == "male" || req.body.gender == "female" || req.body.gender == "other") ? req.body.gender : "male" : "male";
    kycall.createUser = 'User';
    kycall.refernceTruID = refernceid;
    kycall.image = "0";
    kycall.referalCount = "0";
    kycall.referenceVerified = true;
    var code = randomize('Aa0', 6);
    let referalCode = code.toString();
    kycall.selfReferenceID = referalCode;
    KycAll.find({ $and: [{ "email": email }, { mobile: mobile }, { fName: req.body.fname }, { lName: lname }] }, function (err, docs) {

        if (!docs.length) {
            AuthKYC.find({ $or: [{ "email": email }, { mobile: mobile }] }, function (err, resultDoc) {
                if (resultDoc.length <= 0) {
                    auth.save(function (err) {
                        if (err) {
                            res.status(500).json({ status: "500", message: "Internal server error" });
                        }
                        else {
                            KycAll.find({ $or: [{ "email": email }, { mobile: mobile }] }, function (err, docs) {
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
                                        var query = { customertruID: truIds };
                                        var respresult = Beneficiary.findOneAndUpdate(query, { $set: { customertruID: truIds } }, { upsert: true })
                                        respresult.exec(function (err, result) {
                                            if (err) {
                                                res.status(500).send({ status: "500", "message": "Internal Server error" })
                                            }
                                            else {
                                                ins_stock();
                                                res.status(200).json({ status: "1000", message: 'Consumer created successfully!', CRNNo: crnNo, truID: truIds });
                                            }
                                        });
                                    }
                                    function ins_stock(err, numAffected) {
                                        if (err) {
                                            res.send(err);
                                        }
                                        var query1 = { truID: truIds };
                                        var respresult = Stock.findOneAndUpdate(query1, {
                                            $set: {
                                                truID: '5000'.concat(truid),
                                                "stock.G24K": "0.00", "stock.S99P": "0",
                                                "lStock.G24K": "0.00", "lStock.S99P": "0.00"
                                            }
                                        }, { upsert: true });
                                        respresult.exec(function (err, result) {
                                            if (err) {
                                                res.status(500).send({ status: "500", "message": "Internal Server error" })
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
                                        var query1 = { truID: truIds };
                                        var respresult = Wallet.findOneAndUpdate(query1, {
                                            $set: {
                                                truID: truIds,
                                                opBal: "0.00", Dr: "0.00", Cr: "0.00", clBal: "0.00"
                                            }
                                        }, { upsert: true })
                                        respresult.exec(function (err, result) {
                                            if (err) {
                                                res.status(500).send({ status: "500", "message": "Internal Server error" })
                                            }
                                            else {
                                                var fname = req.body.fname;
                                                notification_controller.notification_registartion(truIds, fname);
                                            }
                                        });
                                    }
                                }
                            })
                        }
                    });
                }
                else {
                    res.status(200).json({ status: "411", message: 'Consumer mobile no or email already exists..!!' });
                }
            })
        }
        else {
            res.status(200).json({ status: "800", message: 'login successfully!', CRNNo: docs[0].CRNNo, truID: docs[0].truID });
        }
    })
}

exports.clientProfile = function (req, res) {
    var badd = new KycAll(req.user);
    var crnno = req.body.crnno;
    KycAll.find({ $or: [{ CRNNo: crnno }, { mobile: crnno }] }, function (err, docs) {
        if (!docs.length) {
            res.status(411).json({ status: "411", message: "Invalid CRNNo..!!" });
        }
        else {
            KycAll.aggregate([
                { $match: { __t: "KycAll", $or: [{ CRNNo: crnno }, { mobile: crnno }] } },
                {
                    $project: {
                        name: { $concat: ["$fName", " ", "$lName"] }, fName: 1, lName: 1, createDate: 1, billingAddress: 1, permanentAddress: 1,
                        city: "$permanentAddress.city", pin: "$permanentAddress.pin", image: 1,
                        _id: 0, truID: 1, CRNNo: 1, mobile: 1, KYCFlag: 1, email: 1, KYCDetails: 1, countryCode: 1, docVerified: 1
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
                        name: 1, fName: 1, lName: 1, countryCode: 1, createDate: 1, billingAddress: 1, permanentAddress: 1,
                        city: 1, pin: 1, image: 1, KYCDetails: 1,
                        truID: 1, CRNNo: 1, mobile: 1, KYCFlag: 1, email: 1, docVerified: 1,
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
                        name: 1, fName: 1, lName: 1, city: 1, pin: 1, truID: 1, CRNNo: 1, mobile: 1, KYCFlag: 1, email: 1, image: 1,
                        createDate: 1, countryCode: 1, KYCDetails: 1,
                        g1: { $toString: { $cond: [{ $lt: ["$g1", 0.000001] }, 0.00, "$g1"] } },
                        g4: { $toString: { $cond: [{ $lt: ["$g4", 0.000001] }, 0.00, "$g4"] } },
                        balance: "$wallet.clBal",
                        billingAddress: 1, permanentAddress: 1, docVerified: 1
                    }
                }
            ]).exec(function (err, result) {
                if (err) {
                    response.status(500).send({ error: err })
                }
                else {
                    if (result.length > 0) {
                        var resource = result[0];
                        var fName = resource.fName;
                        var lName = resource.lName;
                        var CRNNo = resource.CRNNo;
                        var mobile = resource.mobile;
                        var email = resource.email;
                        var createdate = resource.createDate;
                        var docverified = resource.docVerified ? "active" : resource.KYCFlag == "active" ? "pending" : resource.KYCFlag;
                        var billingAddress = resource.billingAddress ? resource.billingAddress : undefined;
                        var permanentAddress = resource.permanentAddress ? resource.permanentAddress : undefined;
                        var g1v = resource.g1;
                        //  var g2v = resource.g2;
                        //  var g3v = resource.g3;
                        var g4v = resource.g4;
                        var walletBal = resource.balance.toJSON().$numberDecimal;

                        var currentdate = new Date();
                        var diff = (currentdate.getTime() - createdate.getTime()) / 1000;
                        diff /= (60 * 60);
                        var Final = ({
                            "fName": fName, "lName": lName, 'CRNNo': CRNNo, "mobile": mobile, "email": email,
                            "trucoin_24kgold": g1v, "trucoin_99Pure": g4v, "isKYC": docverified,
                            "billingAddress": billingAddress, "permanentAddress": permanentAddress
                        });
                        res.json({ status: "1000", resource: Final });
                    }
                    else {
                        res.status(200).json({ status: "401", message: "No Consumer Found !" });
                    }
                }
            });
        }
    })
};
exports.check_consumer = function (req, res) {
    var crnno = req.body.crnno;
    var xjson = { CRNNo: crnno };
    if (req.body.fName && req.body.mobile && req.body.lName) {
        xjson = { "mobile": req.body.mobile, "fName": req.body.fName, "lName": req.body.lName }
    } else if (req.body.mobileNo) {
        xjson = { "mobile": req.body.mobileNo }
    }
    KycAll.find(xjson, function (err, docs) {
        if (!docs.length) {
            res.status(411).json({ status: "411", message: "Invalid CRNNo..!!" });
        }
        else {
            var resource = docs[0];
            if (resource.KYCFlag == "active") {
                var truID = resource.truID;
                var fName = resource.fName;
                var lName = resource.lName;
                var CRNNo = resource.CRNNo;
                var mobile = resource.mobile;
                var email = resource.email;
                var createdate = resource.createDate;
                var docverified = resource.docVerified ? "active" : "pending";

                var Final = ({
                    "truID": truID,
                    "fName": fName, "lName": lName, 'CRNNo': CRNNo, "mobile": mobile, "email": email, "isKYC": docverified,
                    "createdate": createdate, "panStatus": resource.panStatus
                });
                res.json({ status: "1000", resource: Final });
            }
            else {
                res.status(411).json({ status: "411", message: "Your account is blocked.Please contact your admistrator..!!" });
            }

        }
    })
};

exports.client_consumerList = function (req, res) {
    let truid = req.body.truid,
        dateflag = req.body.dateflag,
        startdate = new Date(req.body.startdate),
        matchqry = { refernceTruID: truid };

    if (dateflag) {
        matchqry = { refernceTruID: truid, createDate: { $gt: startdate } };
    }

    KycAll.aggregate([
        { $match: matchqry },
        {
            $project: {
                _id: 0, createDate: 1, gender: 1, KYCFlag: 1, DOB: 1, email: 1, fName: 1, mName: 1, CRNNo: 1, docVerified: 1,
                lName: 1, mobile: 1, truID: 1, refernceTruID: 1, image: 1, permanentAddress: 1
            }
        },
        { $sort: { createDate: -1 } }
    ]).exec(async function (err, result) {
        if (err) {
            res.status(500).send({ error: err })
        }
        else {
            var aray = new Array();
            // var path = Gen.profile;
            for (var i = 0; i < result.length; i++) {
                var resorce = result[i];
                var arrayassetmanager = {};
                arrayassetmanager["createDate"] = resorce.createDate;
                arrayassetmanager["email"] = resorce.email;
                arrayassetmanager["fName"] = resorce.fName;
                arrayassetmanager["lName"] = resorce.lName;
                arrayassetmanager["mobile"] = resorce.mobile;
                arrayassetmanager["CRNNo"] = resorce.CRNNo;
                arrayassetmanager["isKYC"] = resorce.docVerified ? "active" : resorce.KYCFlag == "active" ? "pending" : resorce.KYCFlag;
                aray.push(arrayassetmanager);
            }
            res.json({ status: "200", resource: aray });
        }
    }
    )
}
exports.client_validate_consumer = function (req, res) {
    var mobile = req.body.mobile;
    var fname = req.body.fname;
    var lname = req.body.lname;
    var query = AuthKYC.find({ __t: "Auth", mobile: mobile }).select({ 'isPwdReset': 1, '_id': 0 });
    KycAll.find({ $or: [{ mobile: mobile }] }, function (err, chkresult) {
        if (!chkresult.length) {
            res.json({ status: "4004", message: "Consumer not found!" });
        }
        else {
            KYC.find({ mobile: mobile, fName: fname, lName: lname }, function (err, user) {
                // console.lo g(user);
                query.exec(function (err, result) {

                    if (err == null && user == '') {
                        res.json({ status: "4001", message: "Invalid User." });
                    }
                    else {
                        KycAll.aggregate([
                            { $match: { __t: "KycAll", $and: [{ mobile: mobile }, { fName: fname }, { lName: lname }] } },
                            {
                                $project: {
                                    fName: 1, lName: 1, refernceTruID: 1, CRNNo: 1,
                                    city: "$permanentAddress.city", pin: "$permanentAddress.pin", image: 1, address: "$permanentAddress", countryCode: 1,
                                    _id: 0, truID: 1, mobile: 1, KYCFlag: 1, email: 1, emailVerified: 1, docVerified: 1, isVACreated: 1, DOB: 1, gender: 1
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
                                    truID: 1, mobile: 1, KYCFlag: 1, email: 1, isVACreated: 1,
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
                                    fName: 1, lName: 1, city: 1, pin: 1, truID: 1, mobile: 1, KYCFlag: 1, email: 1, refernceTruID: 1, DOB: 1, gender: 1,
                                    image: 1, address: 1, countryCode: 1, emailVerified: 1, CRNNo: 1, docVerified: 1,
                                    g1: 1, g4: 1, l1: 1, l2: 1, l3: 1, l4: 1, balance: "$wallet.clBal", isVACreated: 1
                                }
                            },
                        ]).exec(function (err, docs) {
                            if (err) {
                                res.status(500).json({ status: "500", message: 'Internal server error..!!' });
                            } else {
                                if (!docs.length) {
                                    res.status(200).json({ status: "204", message: 'User not Exist..!!' });
                                }
                                else {
                                    AuthKYC.aggregate([
                                        { $match: { __t: "Auth", $and: [{ mobile: mobile }] } },
                                        { $project: { _id: 0, isPwdReset: 1 } }
                                    ]).exec(function (err, result) {
                                        if (err) {
                                            res.status(500).json({ status: "500", message: 'Internal server error..!!' });
                                        } else {
                                            if (!result.length) {
                                                res.status(200).json({ status: "204", message: 'User not Exist..!!' });
                                            }
                                            else {
                                                var resource = docs[0];
                                                var countryCode = resource.countryCode;
                                                var fName = resource.fName;
                                                var lName = resource.lName;
                                                var name = resource.fName + " " + resource.lName;
                                                var address = resource.address;
                                                var city = resource.city;
                                                var pin = resource.pin;
                                                var truID = resource.truID;
                                                var mobile = resource.mobile;
                                                var email = resource.email;
                                                var DOB = resource.DOB;
                                                var gender = resource.gender;
                                                var KYCFlag = resource.KYCFlag;
                                                var image = resource.image;
                                                var path = Gen.profile
                                                var fimage = path.concat(image)
                                                var refernceID = resource.refernceTruID;
                                                var emailverified = resource.emailVerified;
                                                var docverified = resource.docVerified;
                                                var isVACreated = resource.isVACreated ? resource.isVACreated : false;

                                                var g1v = resource.g1.toJSON().$numberDecimal;
                                                var g4v = resource.g4.toJSON().$numberDecimal;
                                                var walletBal = resource.balance.toJSON().$numberDecimal;
                                                var crnno = resource.CRNNo;

                                                var Final = ({
                                                    'name': name, "fName": fName, "lName": lName, 'truID': truID, "mobile": mobile, "email": email, "DOB": DOB, "gender": gender,
                                                    "KYCFlag": KYCFlag, emailVerified: emailverified, CRNNo: crnno, docVerified: docverified, isVACreated: isVACreated,
                                                    'city': city, "pin": pin, "image": image, address: address, countryCode: countryCode, referenceID: refernceID, isPwdReset: result[0].isPwdReset,
                                                    "G24K": g1v, "S99P": g4v, "balance": walletBal
                                                });
                                                res.json({ status: "200", resource: Final });
                                                consumerLog.userloginLog(truID, "web", "consumer", "deviceID", refernceID ? refernceID : undefined, "login");
                                            }
                                        }
                                    })
                                }
                            }
                        })
                    }
                })
            })
        }
    })
}

exports.digital_kyc = function (req, res) {
    var truid = req.body.truID;
    var digitalKYC = req.body.digitalKYC;
    var docType = req.body.docType;
    var query;
    var checkdoctitle = req.body.digitalKYC[0].docTitle
    if (docType) {
        query = { truID: truid, "digitalKYC.docTitle": docType }
        updateKYC(query);
    } else {
        query = { truID: truid }
        KycAll.aggregate([
            { $match: query },
            { $project: { _id: 0, digitalKYC: 1 } },
            { $unwind: "$digitalKYC" },
            { $match: { "digitalKYC.docTitle": checkdoctitle } }
        ]).exec(function (err, result) {
            if (err) {
                res.json({ status: "500", message: "Internal Server Error" });
            } else {
                if (!result.length) {
                    AddtosetUpdateKYC(query);
                } else {
                    res.json({ messsage: "Record already exsist" });
                }
            }
        })
    }
    function AddtosetUpdateKYC(query) {
        KycAll.findOneAndUpdate(query,
            {
                $addToSet: {
                    digitalKYC: digitalKYC,
                }
            }).exec(function (err, result) {
                if (err) {
                    res.json({ status: "500", message: "Internal Server Error" });
                } else {
                    res.json({ status: "200", message: "KYC updated successfully..!!" });
                }
            })
    }
    function updateKYC(query) {
        KycAll.findOneAndUpdate(query,
            {
                $set: {
                    "digitalKYC.$": digitalKYC,
                }
            }, { upsert: true }).exec(function (err, result) {
                if (err) {
                    res.json({ status: "500", message: "Internal Server Error" });
                } else {
                    res.json({ status: "200", message: "KYC updated successfully..!!" });
                }
            })
    }
}

exports.clientAddressUpdate = function (req, res) {
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
        if (err) { res.json({ "status": "500", "message": "Internal server error", "error": err.message }); }
        else {
            KycAll.aggregate([{ "$match": { truID: truid } }, {
                "$project": { _id: 0, billingAddress: 1, permanentAddress: 1 }
            }]).exec(function (err, result) {
                if (err) {
                    res.json({ "status": "500", "message": "Internal server error", "error": err.message });
                }
                else {
                    var resource = result;
                    if (resource.length > 0) {
                        resource = result[0]

                        delete resource.billingAddress._id;
                        delete resource.permanentAddress._id;
                        res.json({ status: "1000", resource: resource });
                    }
                    else {
                        res.json({ "status": "411", "message": "No record found..!!" });
                    }
                }
            });
        }

    };
}
exports.client_kycUpdate = function (req, res) {
    KycAll.find({ "truID": req.body.truid, "refernceTruID": req.body.rtruid }).exec(function (err, result) {
        if (err) {
            res.status(500).json({ status: "500", message: "Internal Server Error" });
        } else {
            if (!result.length) {
                res.status(401).json({ status: "401", message: "Consumer not found" });
            }
            else {
                KycAll.findOneAndUpdate({ "truID": req.body.truid, "refernceTruID": req.body.rtruid },
                    { $set: { docVerified: true, panStatus: "active" } }, { returnNewDocument: true }).exec(function (err, result) {
                        if (err) {
                            res.status(401).json({ status: "401", message: "consumer not found" });
                        } else {
                            res.status(200).json({ status: "1000", message: "KYC activated successfully..!!" });
                        }
                    })
            }
        }
    })
}