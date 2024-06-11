
'use strict'

const request = require('request'),
    KycAll = require('../models/remmitKYCAllModel'),
    AuthKYC = require('../models/remmitKYCAuthModel'),
    conf = require("../conf"),
    reqip = conf.reqip,
    randomize = require("randomatic"),
    CHARGESLOG = require('../models/chargesModelLogs'),
    Wallet = require('../models/remmitWalletModel'),
    Stock = require('../models/remmitStockModel'),
    ROTP = require('../models/truOTPModel'),

    notification_controller = require("./notification.controller"),
    email_controller = require("./email.controller"),
    { calculateRate } = require('./calculateRate'),
    crypto = require('crypto'),
    bcrypt = require('bcrypt'),
    salt = bcrypt.genSaltSync(10);



exports.min_registration = function (req, res) {
    var email = req.body.email;
    var mobile = req.body.mobile;
    var companytype = req.body.companyType;
    var cinno = req.body.cinno;
    if (companytype !== "soleProprietor" && companytype !== "partnership") {
        KycAll.find({ CINNo: cinno }, function (err, result) {
            if (err) {
                res.status(500).json({ status: '500', message: 'Internal Server Error' });
            } else if (!result.length) {
                regPartner();
            }
            else {
                res.json({ status: '204', message: 'Partner Already Exists!' });
            }
        })
    } else {
        regPartner();
    }
    async function regPartner() {
        ROTP.aggregate([{ $match: { "mobile": mobile, "type": "registration", "status": "success" } }]).exec(function (err, docs) {
            if (err) {
                res.status(500).json({ status: "500", message: "Internal Server Error" });
            } else {
                if (!docs.length) {
                    res.json({ status: "204", message: 'Please verify OTP before registartion.' });
                } else {
                    var isparent = true
                    var auth = new AuthKYC();
                    var kycall = new KycAll();
                    var crnno = randomize('A0', 7);
                    var crnNo = 'r'.concat(crnno);
                    var truid = randomize('0', 12);
                    var truId = '8000'.concat(truid);
                    var hashtwo = bcrypt.hashSync(req.body.password, salt);
                    auth.email = email;
                    auth.mobile = mobile;
                    auth.CRNNo = crnNo;
                    auth.password = hashtwo;
                    auth.isPwdReset = true;
                    auth.isTPinReset = false;
                    auth.mPINSet = false;
                    auth.appAccess = true;
                    auth.createDate = new Date();
                    auth.modifyDate = new Date();

                    kycall.email = req.body.email;
                    kycall.mobile = req.body.mobile;
                    if (req.body.countrycode != undefined) { kycall.countryCode = req.body.countrycode }
                    kycall.contactFName = req.body.fname ? req.body.fname : "";
                    kycall.contactMName = req.body.mname ? req.body.mname : "";
                    kycall.contactLName = req.body.lname ? req.body.lname : "";
                    kycall.companyName = req.body.cname ? req.body.cname : "";
                    kycall.CRNNo = crnNo;
                    kycall.companyType = companytype;
                    kycall.CINNo = cinno;
                    kycall.isParent = isparent;
                    kycall.KYCFlag = "notactive"
                    kycall.category = "franchise";
                    kycall.truID = truId;
                    kycall.parentTruID = (isparent === false) ? parentDet.truID : truId;
                    kycall.referenceTruID = (isparent === false) ? parentDet.truID : "Company";
                    kycall.MID = (isparent === false) ? parentDet.MID : "MT_" + crnNo;
                    kycall.channel = (isparent === false) ? parentDet.channel : "MT_" + crnNo;
                    kycall.createDate = new Date();
                    kycall.modifyDate = new Date();
                    kycall.createUser = 'User';
                    kycall.image = '0';

                    AuthKYC.find({ $or: [{ "email": email }, { mobile: req.body.mobile }] }, function (err, docs) {
                        if (err) {
                            res.status(500).json({ status: '500', message: 'Internal Server Error' });
                        }
                        else if (!docs.length) {
                            auth.save(function (err) {
                                if (err) {

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
                                                    res.json({ status: '200', message: 'Partner Created Successfully!', truID: truId });
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
                                                            "stock.G24K": "0.00", "stock.G22K": "0.00", "stock.G18K": "0.00", "stock.S99P": "0.00",
                                                            "lStock.G24K": "0.00", "lStock.G22K": "0.00", "lStock.G18K": "0.00", "lStock.S99P": "0.00"
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
                            res.json({ status: '204', message: 'Partner Already Exists!' });
                        }
                    })
                }
            }
        })
    }
}

exports.Update_KYCDocs_from_entity_Individual = function (req, res) {
    var truidcsr = req.body.truid;
    var query = { $or: [{ truID: truidcsr }, { CRNNo: truidcsr }] };
    var uploaded = new Array();
    var notuploaded = new Array();
    var fullKYCDone;
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
                    var companynm = "";
                    var fname, gender, DOB;
                    for (var i = 0; i < req.body.kycdetails.length; i++) {
                        if (req.body.kycdetails[i].docTitle === "Aadhaar") {
                            msgdoc = "Aadhaar";
                            aadharStat = "active";
                            fname = req.body.kycdetails[i].validationdata.name;
                            gender = req.body.kycdetails[i].validationdata.gender ? req.body.kycdetails[i].validationdata.gender.toLowerCase() : "male";
                            DOB = req.body.kycdetails[i].validationdata.date_of_birth;
                        }
                        if (req.body.kycdetails[i].docTitle === "Pan") {
                            msgdoc = "Pan";
                            panStat = "active";
                            companynm = req.body.kycdetails[i].validationdata.pan_data.name;
                        }
                    }
                    let setval = { KYCDetails: req.body.kycdetails, KYCFlag: "notactive", aadharStatus: aadharStat, panStatus: panStat };
                    // if (req.body.validationViaAPI === true) {
                    //   setval.docVerified = true;
                    // }
                    if (docs[0].CINNo && companynm) {
                        setval.companyName = companynm;
                    }
                    if (fname) {
                        setval.contactFName = fname;
                        setval.gender = gender;
                        setval.DOB = DOB;
                    }
                    KycAll.findOneAndUpdate({ "truID": truid }, { $set: setval }, function (err, numAffected) {
                        if (err) {
                            res.json({ status: "204", message: "Something went wrong." });
                        }
                        else {
                            KycAll.findOneAndUpdate({ "truID": truid }, { $set: setval }, { upsert: true }).exec();
                            res.json({ status: "200", message: msgdoc + " verified Successfully." });
                        }
                    })
                }
                else {
                    function checkdocexist(KycDocs, inputdoc, isNode) {
                        var docbool = false
                        if (isNode) {
                            KycDocs.forEach(KycDocEle => {
                                console.log(KycDocEle.docTitle)
                                if (KycDocEle.docTitle != inputdoc) {
                                    docbool = true
                                }
                            });
                        }
                        return docbool;
                    }
                    uploadDocs();
                    async function uploadDocs() {
                        for (var i = 0; i < req.body.kycdetails.length; i++) {
                            await updateDocsDetails(req.body.kycdetails[i])
                        }
                        if (uploaded.length) {
                            if (notuploaded.length) {
                                res.json({ status: "200", message: "Document verified Successfully.", reason: notuploaded });
                            } else {
                                res.json({ status: "200", message: "Document verified Successfully.", docVerified: fullKYCDone });
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
                                        let setval = {};
                                        if (kycdetail.docTitle === "Aadhaar") {
                                            setval.aadharStatus = "active";
                                            // setval.docVerified = checkdocexist(docs[0].KYCDetails, "Aadhaar", true);
                                            setval.contactFName = kycdetail.validationdata.name;
                                            setval.gender = kycdetail.validationdata.gender ? kycdetail.validationdata.gender.toLowerCase() : "male";
                                            setval.DOB = kycdetail.validationdata.date_of_birth;
                                        }
                                        if (kycdetail.docTitle === "Pan") {
                                            setval.panStatus = "active";
                                            if (docs[0].CINNo) {
                                                setval.companyName = kycdetail.validationdata.pan_data.name;
                                            }
                                        }
                                        setval.docVerified = checkdocexist(docs[0].KYCDetails, kycdetail.docTitle, !docs[0].isParent);
                                        if (setval.docVerified) {
                                            setval.KYCFlag = "active"
                                            fullKYCDone = true;
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
                                                res.json({ status: "200", message: kycdetail.docTitle + " verified Successfully.", docVerified: fullKYCDone });
                                            }
                                        })

                                    }
                                    else {
                                        function upld() {
                                            let setval = {
                                                "KYCDetails.$": kycdetail
                                            }
                                            if (kycdetail.docTitle === "Aadhaar") {
                                                setval.aadharStatus = "active";
                                                setval.contactFName = kycdetail.validationdata.name;
                                                setval.gender = kycdetail.validationdata.gender ? kycdetail.validationdata.gender.toLowerCase() : "male";
                                                setval.DOB = kycdetail.validationdata.date_of_birth;
                                            }
                                            if (kycdetail.docTitle === "Pan") {
                                                setval.panStatus = "active";
                                                if (docs[0].CINNo) {
                                                    setval.companyName = kycdetail.validationdata.pan_data.name;
                                                }
                                            }
                                            setval.docVerified = checkdocexist(docs[0].KYCDetails, kycdetail.docTitle, !docs[0].isParent);
                                            if (setval.docVerified) {
                                                setval.KYCFlag = "active"
                                                fullKYCDone = true;
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

exports.Update_KYC_from_entity = function (req, res) {
    var truid = req.body.truid;
    var query = { truID: truid };

    KycAll.find(query, function (err, docs) {
        if (err) {
            res.json({
                status: "500",
                message: "Internal Server Error."
            });
        } else {
            if (!docs.length) {
                res.json({
                    status: "204",
                    message: "The request was successful but no body was returned."
                });
            } else {
                var setVal = {};
                req.body.housenumber ? setVal["address.houseNumber"] = req.body.housenumber : null;
                req.body.streetnumber ? setVal["address.streetNumber"] = req.body.streetnumber : null;
                req.body.landmark ? setVal["address.landmark"] = req.body.landmark : null;
                req.body.pin ? setVal["address.pin"] = req.body.pin : null;
                req.body.city ? setVal["address.city"] = req.body.city : null;
                req.body.state ? setVal["address.state"] = req.body.state : null;
                req.body.country ? setVal["address.country"] = req.body.country : null;
                req.body.longitude ? setVal["address.location"] = { type: "Point", coordinates: [req.body.longitude, req.body.latitude] } : null;
                req.body.gender ? setVal["gender"] = req.body.gender : null;
                req.body.dob ? setVal["DOB"] = req.body.dob : null;
                req.body.contactfname ? setVal["contactFName"] = req.body.contactfname : null;
                req.body.contactmname ? setVal["contactMName"] = req.body.contactmname : null;
                req.body.contactlname ? setVal["contactLName"] = req.body.contactlname : null;

                if (!docs[0].companyType) {
                    req.body.companytype ? setVal["companyType"] = req.body.companytype : null;
                    req.body.companyname ? setVal["companyName"] = req.body.companyname : null;
                }
                if (docs[0].docVerified === false && docs[0].KYCFlag === "active") {
                    setVal["KYCFlag"] = "notactive";
                }
                if (docs[0].companyType && (docs[0].companyType == "soleProprietor" || docs[0].companyType == "partnership")) {
                    req.body.companyname ? setVal["companyName"] = req.body.companyname : null;
                }
                if (!docs[0].CINNo && req.body.cinno) {
                    KycAll.find({ CINNo: req.body.cinno }, function (err, result) {
                        if (err) {
                            res.status(500).json({ status: '500', message: 'Internal Server Error' });
                        } else if (!result.length) {
                            sendreq();
                        }
                        else {
                            res.json({ status: '204', message: 'Partner CINNo Already Exists!' });
                        }
                    })
                    setVal["CINNo"] = req.body.cinno;
                } else {
                    sendreq();
                }
                function sendreq() {
                    KycAll.findOneAndUpdate(query, {
                        $set: setVal
                    }, callback)

                    function callback(err, numAffected) {
                        if (err)
                            res.send(err);
                        KycAll.aggregate([{ "$match": { truID: truid } }, {
                            "$project": {
                                _id: 0, truID: 1,
                                name: { "$concat": ["$contactFName", "  ", "$contactLName"] }
                            }
                        }]).exec(function (err, result) {
                            if (err) {
                                res.json({ status: "204", message: "Something went wrong." });
                            }
                            else {
                                res.json({ status: "200", message: "Details Updated Successfully", resource: result });
                            }
                        })
                    }
                }

            }
        }
    })
}

exports.update_transaction_pin = function (req, res) {
    var truid = req.body.truid;
    KycAll.find({
        "truID": truid
    }, function (err, docs) {
        if (!docs.length) {
            res.json({
                status: "204",
                message: "No parent entity found"
            });
        } else {

            var crnno = docs[0].CRNNo;
            var pinhash = bcrypt.hashSync(req.body.tpin, salt);

            AuthKYC.findOneAndUpdate({ CRNNo: crnno }, { $set: { tPIN: pinhash, isTPinReset: true } }, function (err, docs) {
                if (err) {
                    res.json({
                        status: "204",
                        message: "Something went wrong."
                    });
                } else {
                    res.json({
                        status: "200",
                        message: "Transaction PIN Updated Successfully."
                    });
                }
            }
            )
        }
    }
    )
}

exports.verify_transaction_pin = function (req, res) {

    var truid = req.body.truid;

    KycAll.find({
        "truID": truid
    }, function (err, docs) {
        if (!docs.length) {
            res.json({
                status: "204",
                message: "No entity found."
            });
        } else {
            var crnno = docs[0].CRNNo;

            AuthKYC.find({ CRNNo: crnno, __t: "Auth" }, { tPIN: 1, _id: 0 }, function (err, result) {
                if (err) {
                    res.json({
                        status: "204",
                        message: "Something went wrong."
                    });
                } else {
                    var parray = result.pop();
                    var finalhash = parray.tPIN;

                    if (bcrypt.compareSync(req.body.tpin, finalhash)) {
                        res.json({
                            status: "200",
                            message: "Transaction PIN Verified Successfully."
                        });
                    } else {
                        res.json({
                            status: "204",
                            message: "Wrong Transaction PIN. Please Try Again."
                        });
                    }
                }
            }
            )
        }
    }
    )
}

exports.change_password = function (req, res) {
    var mobile = req.body.mobile;
    var query = KycAll.findOne({ mobile: mobile }, {
        _id: 0, __t: 0, CRNNo: 1, companyName: 1, email: 1, mobile: 1,
        emailVerified: 1
    });

    query.exec(function (err, result) {
        if (result == null) {
            res.json({ status: "204", resource: "User Does Not Exist." });
        }
        else {
            var crnno = result.CRNNo;
            var entityname = result.companyName;
            var email = result.email;
            var mobile = result.mobile;
            var emailVerified = result.emailVerified;
            var query_auth = AuthKYC.findOne({ CRNNo: crnno }, { _id: 0, password: 1 });
            query_auth.exec(function (err, result) {
                if (result == null) {
                    res.json({ status: "401", resource: "User Does Not Exist." });
                }
                else {
                    var pwd = result.password;
                    var query_up = { "CRNNo": crnno }
                    var hashtwo = bcrypt.hashSync(req.body.newpassword, salt);
                    var updatepwd = AuthKYC.findOneAndUpdate(query_up, { "$set": { "password": hashtwo, "isPwdReset": true, "appAccess": true } });
                    updatepwd.exec(function (err, result) {
                        if (err) {
                            response.status(500).send({ error: err })
                            return next(err);
                        }
                        else {
                            res.json({ status: "200", resource: "Password updated." });

                            var mailtype = emailVerified === true ? "both" : "sms";
                            email_controller.changePasswordMPIN("passwordReset", email, mobile, entityname, mailtype);
                        }
                    }
                    )
                }
            }
            )
        }
    }
    )
}


exports.list_profile = function (req, res) {
    var truid = req.body.truid;
    KycAll.find({ "truID": truid }, function (err, docs) {
        if (!docs.length) {
            res.json({
                status: "204",
                message: "The request was successful but no body was returned."
            });
        } else {
            KycAll.aggregate([
                { $match: { __t: "KycAll", truID: truid } },
                {
                    $project: {
                        _id: 0, truID: 1, mobile: 1, KYCFlag: 1, email: 1, TPA: 1, image: 1, aadharStatus: 1, panStatus: 1, docVerified: 1, companyType: 1, CINNo: 1,
                        name: { $concat: ["$contactFName", " ", "$contactLName"] }, contactFName: 1, contactLName: 1,
                        city: "$address.city", pin: "$address.pin", address: 1, contactMName: 1, companyName: 1, countryCode: 1,
                        gender: 1, KYCDetails: 1, DOB: 1, isParent: 1, emailVerified: 1, CRNNo: 1, parentTruID: 1,
                        isSuperAdmin: 1
                    }
                }
            ]).exec(function (err, result) {
                if (err) {
                    res.status(500).send({ error: err })
                }
                else {
                    var name = result[0].name;
                    var fName = result[0].contactFName;
                    var lName = result[0].contactLName;
                    var mName = result[0].contactMName;
                    var city = result[0].city;
                    var pin = result[0].pin;
                    var truID = result[0].truID;
                    var mobile = result[0].mobile;
                    var KYCFlag;
                    if (result[0].docVerified && result[0].KYCFlag == "active") {
                        KYCFlag = "active";
                    } else {
                        KYCFlag = result[0].KYCFlag == "active" ? "pending" : result[0].KYCFlag;
                    }
                    var companyName = result[0].companyName;
                    var countryCode = result[0].countryCode;
                    var gender = result[0].gender;
                    var aadharStatus = result[0].aadharStatus;
                    var panStatus = result[0].panStatus;
                    var isParent = result[0].isParent;
                    var emailVerified = result[0].emailVerified;
                    var CRNNo = result[0].CRNNo;
                    var parentTruID = result[0].parentTruID;
                    var companyType = result[0].companyType;
                    var CINNo = result[0].CINNo;
                    var docpath = Gen.docs;
                    var KYCDetails = new Array();
                    var isKYCDocExist = false;
                    if (result[0].KYCDetails.length) {
                        for (var j = 0; j < result[0].KYCDetails.length; j++) {
                            var kycelements = result[0].KYCDetails[j];
                            var kycaray = {};
                            kycaray["docNumber"] = kycelements.docNumber;
                            kycaray["docTitle"] = kycelements.docTitle;
                            var doc = kycelements.docFile;
                            kycaray["docFile"] = docpath.concat(doc);

                            KYCDetails.push(kycaray);
                            isKYCDocExist = true
                        }
                    }

                    var DOB = result[0].DOB;
                    var email = result[0].email;
                    var address = result[0].address;
                    var image = result[0].image;
                    var path = Gen.profile
                    var fimage = path.concat(image)
                    res.json({
                        status: "200", resource:
                        {
                            name: name, fName: fName, lName: lName, city: city, pin: pin, truID: truID, address: address,
                            mName: mName, mobile: mobile, KYCFlag: KYCFlag, email: email, image: fimage,
                            companyName: companyName, countryCode: countryCode, gender: gender,
                            isParent: isParent, emailVerified: emailVerified, CRNNo: CRNNo, parentTruID: parentTruID, companyType: companyType, CINNo: CINNo,
                            KYCDetails: KYCDetails, DOB: DOB, aadharStatus: aadharStatus, panStatus: panStatus, isKYCDocExist: isKYCDocExist
                        }
                    }
                    )
                }
            }
            )
        }
    }
    )
}


exports.entity_validation = function (req, res) {
    var truid = req.body.truid;

    KycAll.find({
        $or: [{ "truID": truid, }, { CRNNo: req.body.crnno }]
    }, function (err, docs) {
        if (!docs.length) {
            res.json({ status: "400" });
        }
        else {
            if (req.body.flag === "admin") {
                res.json({ status: "200", fName: docs[0].contactFName, lName: docs[0].contactLName, companyName: docs[0].companyName });
            } else {
                res.json({ status: "200" });
            }
        }
    })
};

exports.entity_Details_From_Mobile = function (req, res) {
    var mobile = req.body.mobile;
    KycAll.aggregate([{ $match: { "$or": [{ "mobile": mobile }, { "truID": mobile }] } },
    { $project: { _id: 0, truID: 1, companyName: 1, address: 1, image: 1, brandLogo: 1 } }]).exec(function (err, result) {
        if (err) {
            res.status(500).json({ status: "500", message: "Internal Server Error" });
        } else {
            if (!result.length) {
                res.json({ status: "204", message: "request Successful but no body was return" });
            } else {
                var resp = { status: "200", resource: result };
                if (req.body.type) {
                    resp.type = req.body.type
                }
                res.json(resp);
            }
        }
    })
}

exports.show_address_for_invoice = function (req, res) {
    var truid = req.body.truid;

    KycAll.find({
        truID: truid
    }, { address: 1, _id: 0, companyName: 1 }, function (err, docs) {
        if (!docs.length) {
            res.json({
                status: "204",
                message: "The request was successful but no body was returned."
            });
        } else {
            res.json({ status: "200", "address": docs[0].address, "companyName": docs[0].companyName })
        }
    }
    )
}

exports.top_assetmanager = function (req, res) {
    var Gen = req.generalCharges;
    var truid = req.body.truid;
    var rtruid = req.body.rtruid;
    var assetmanagersearch = req.body.assetmanagersearch;
    var type = (req.body.assetmanagersearch === "purchase") ? "buy" : (req.body.assetmanagersearch === "redeem") ? "redeemCash" : "buy"


    KycAll.aggregate([
        { $match: { truID: rtruid, KYCFlag: "active" } },
        { $project: { _id: 0, truID: 1, parentTruID: 1, CRNNo: 1, isParent: 1, MID: 1, companyName: 1 } },
        {
            $lookup: {
                from: "charges",
                localField: "parentTruID",
                foreignField: "truID",
                as: "partnerCharges"
            }
        },
        {
            $lookup: {
                from: "charges",
                localField: "truID",
                foreignField: "truID",
                as: "nodeCharges"
            }
        },
        {
            $project: {
                _id: 0, truID: 1, CRNNo: 1, isParent: 1, parentTruID: 1, MID: 1, companyName: 1, city: 1, state: 1, country: 1, countryCode: 1,
                "charges": {
                    $cond: {
                        if: {
                            $eq: [{
                                $anyElementTrue: [{
                                    $filter: {
                                        input: "$nodeCharges",
                                        as: "trArr",
                                        cond: { $and: [{ $eq: ["$$trArr.isChargesSet", true] }, { $eq: ["$$trArr.type", type] }, { $eq: ["$$trArr.appliedOn", "consumer"] }] }
                                    }
                                },]
                            }, true]
                        }, then: "$nodeCharges", else: "$partnerCharges"
                    }
                }
            }
        },
        {
            $project: {
                _id: 0, truID: 1, CRNNo: 1, isParent: 1, parentTruID: 1, MID: 1, companyName: 1,
                "charges": {
                    $filter: {
                        input: "$charges",
                        as: "chrg",
                        cond: { $and: [{ $eq: ["$$chrg.isChargesSet", true] }, { $eq: ["$$chrg.type", "common"] }, { $eq: ["$$chrg.appliedOn", "consumer"] }] }
                    }
                },
                "targetArrold": {
                    $filter: {
                        input: "$charges",
                        as: "chrg",
                        cond: { $and: [{ $eq: ["$$chrg.isChargesSet", true] }, { $eq: ["$$chrg.type", type] }, { $eq: ["$$chrg.appliedOn", "consumer"] }] }
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
            request.post({
                "headers": { "content-type": "application/json" },
                "url": reqip + ":4114/api/findcity",
                "body": JSON.stringify({
                    "truid": truid,
                    "assetmanagersearch": assetmanagersearch,
                    "flag": req.body.flag
                })
            }, (error, response, resbody) => {
                if (error) {
                    return console.dir(error);
                }
                var newjson = JSON.parse(resbody);
                if (newjson.status == "200") {
                    var ratereso = newjson.resource;
                    var clientTxnCharges = docs.length ? docs[0].charges.length ? docs[0].charges[0].trasactionCharges ? parseFloat(docs[0].charges[0].trasactionCharges) : 0 : 0 : 0;
                    for (var i = 0; i < newjson.resource.topG24K.length; i++) {
                        var grrate = parseFloat(newjson.resource.topG24K[i].G24Kgross);
                        ratereso.topG24K[i].G24K = calculateRate(Gen, grrate, assetmanagersearch, clientTxnCharges);

                    }
                    for (var i = 0; i < newjson.resource.topS99P.length; i++) {
                        var grrate = parseFloat(newjson.resource.topS99P[i].S99Pgross);
                        ratereso.topS99P[i].S99P = calculateRate(Gen, grrate, assetmanagersearch, clientTxnCharges);
                    }
                    res.json({ status: "200", resource: ratereso });
                } else {
                    res.json(newjson);

                }
            });
        }
    });
}

exports.client_list_profile = function (req, res) {
    var badd = new KycAll(req.user);
    var crnno = req.body.crnno;
    KycAll.aggregate([
        { $match: { __t: "KycAll", CRNNo: crnno } },
        {
            $project: {
                name: { $concat: ["$contactFName", " ", "$contactLName"] }, contactFName: 1, contactLName: 1,
                address: 1, companyName: 1,
                gender: 1, DOB: 1, CRNNo: 1, parentTruID: 1,
                _id: 0, truID: 1, mobile: 1, KYCFlag: 1, email: 1, image: 1, CINNo: 1
            }
        }
    ]).exec(function (err, result) {
        if (err) {
            res.status(500).send({ error: err })
        }
        else {
            if (result.length > 0) {
                var fName = result[0].contactFName;
                var lName = result[0].contactLName;
                /*     var city = result[0].city;
                    var pin = result[0].pin; */
                var truID = result[0].truID;
                var mobile = result[0].mobile;
                var companyName = result[0].companyName;
                var gender = result[0].gender;
                var CRNNo = result[0].CRNNo;
                /*     var parentTruID = result[0].parentTruID; */
                /*    var docpath = Gen.docs; */
                /* var KYCDetails = new Array();
                var isKYCDocExist = false;
                if (result[0].KYCDetails.length) {
                  for (var j = 0; j < result[0].KYCDetails.length; j++) {
                    var kycelements = result[0].KYCDetails[j];
                    var kycaray = {};
                    kycaray["docNumber"] = kycelements.docNumber;
                    kycaray["docTitle"] = kycelements.docTitle;
                    var doc = kycelements.docFile;
                    kycaray["docFile"] = docpath.concat(doc);
           
                    KYCDetails.push(kycaray);
                    isKYCDocExist = true
                  }
                } */

                /*    var DOB = result[0].DOB; */
                var email = result[0].email;
                var CINNo = result[0].CINNo ? result[0].CINNo : undefined;

                var address = undefined;
                /*  var image = result[0].image; */
                /*   var path = Gen.profile; */
                var KYCFlag = result[0].KYCFlag;
                if (result[0].address) {
                    address = result[0].address.houseNumber + " , " + result[0].address.landmark + " , " + result[0].address.streetNumber + " , " + result[0].address.city + " , " + result[0].address.state + " ," + result[0].address.country + "-" + result[0].address.pin
                    delete result[0].address.location
                };
                var Final = {
                    companyName: companyName, clientID: CRNNo, fName: fName, lName: lName, address: address,
                    mobile: mobile, email: email, gender: gender, CINNo: CINNo, isKYC: KYCFlag
                }
                Stock.aggregate([{ "$match": { "truID": truID } },
                { "$project": { _id: 0, stock: 1 } }
                ]).exec(function (err, resultdoc) {
                    if (err) {
                        res.status(411).json({
                            status: "411",
                            message: "Something went wrong."
                        });
                    }
                    else {
                        var resource = resultdoc[0];
                        if (resource) {
                            var g24 = resource.stock ? resource.stock.G24K.toJSON().$numberDecimal : 0;
                            var s99 = resource.stock ? resource.stock.S99P.toJSON().$numberDecimal : 0;
                            Final.trucoin_99Pure = s99;
                            Final.trucoin_24kgold = g24;
                        }
                        else {
                            Final.trucoin_99Pure = 0;
                            Final.trucoin_24kgold = 0;
                        }

                        Wallet.aggregate([{
                            $match: {
                                truID: truID
                            }
                        },
                        {
                            $project: {
                                _id: 0,
                                clBal: 1
                            }
                        }
                        ]).exec(function (err, resultf) {
                            if (err) {
                                res.status(411).json({ status: "411", message: "Something Went Wrong." });
                            }
                            else {
                                Final.truWalletBAL = resultf[0].clBal.toJSON().$numberDecimal;
                                res.status(200).json({
                                    status: "1000",
                                    resource: Final
                                });
                            }
                        })
                    }

                })

            } else {
                res.status(411).json({
                    status: "411",
                    resource: "Invalid Request"
                });
            }
        }

    }
    )
}

exports.check_Client_ExistOrNOt = function (req, res) {
    var crnno = req.body.crnno;
    KycAll.aggregate([
        { $match: { CRNNo: crnno, KYCFlag: "active" } },
        {
            $project: {
                name: { $concat: ["$contactFName", " ", "$contactLName"] }, contactFName: 1, contactLName: 1,
                companyName: 1, CRNNo: 1, parentTruID: 1,
                _id: 0, truID: 1, mobile: 1, KYCFlag: 1, email: 1, image: 1, parentTruID: 1, isParent: 1, MID: 1
            }
        }
    ]).exec(function (err, result) {
        if (err) {
            res.status(500).send({ error: err })
        }
        else {
            if (result.length > 0) {
                var fName = result[0].contactFName;
                var lName = result[0].contactLName;
                var mobile = result[0].mobile;
                var companyName = result[0].companyName;
                var CRNNo = result[0].CRNNo;
                var email = result[0].email;
                var KYCFlag = result[0].KYCFlag;
                var isParent = result[0].isParent;
                var parentTruID = result[0].parentTruID;
                var truID = result[0].truID;
                var MID = result[0].MID;

                var Final = {
                    companyName: companyName, clientID: CRNNo, fName: fName, lName: lName,
                    mobile: mobile, email: email, isKYC: KYCFlag, isParent: isParent, parentTruID: parentTruID, truID: truID, MID: MID
                }
                res.status(200).json({ status: "1000", message: "Verified Successfully..!!", resource: Final });
            }
            else {
                res.status(411).json({ status: "411", message: "No record found" });
            }
        }
    })
}

exports.check_Client_charges = function (req, res) {
    var crnno = req.body.crnno;
    var type = req.body.ttype;
    KycAll.aggregate([
        { $match: { CRNNo: crnno, KYCFlag: "active" } },
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
                        cond: { $and: [{ $eq: ["$$chrg.type", type] }] }
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
    ]).exec(function (err, result) {
        console.log(err)
        if (err) {
            // response.status(500).send({ error: err })
            return next(err);
        }
        else {
            if (result.length > 0) {
                var CRNNo = result[0].CRNNo;
                var isParent = result[0].isParent;
                var parentTruID = result[0].parentTruID;
                var charges = result[0].charges;
                var truID = result[0].truID;
                var MID = result[0].MID;
                var companyName = result[0].companyName;
                var clientCharges = {
                    "nodeCharges": 0,
                    "partnerCharges": 0,
                    "trasactionCharges": 0,
                    "isChargesSet": false,
                    "promotionQty": 0
                }
                if (charges.length > 0) {
                    clientCharges = {
                        "nodeCharges": charges[0].nodeCharges ? parseFloat(charges[0].nodeCharges) : 0,
                        "partnerCharges": charges[0].partnerCharges ? parseFloat(charges[0].partnerCharges) : 0,
                        "trasactionCharges": charges[0].trasactionCharges ? parseFloat(charges[0].trasactionCharges) : 0,
                        "isChargesSet": charges[0].isChargesSet ? charges[0].isChargesSet : false,
                        "promotionQty": charges[0].promotionQty ? parseFloat(charges[0].promotionQty) : 0
                    }
                }


                var Final = {
                    clientID: CRNNo, truID: truID, isParent: isParent, parentTruID: parentTruID,
                    charges: clientCharges, MID: MID, companyName: companyName
                }
                res.status(200).json({ status: "1000", message: "Verified Successfully..!!", resource: Final });
            }
            else {
                res.status(411).json({ status: "411", message: "No record found" });
            }
        }
    })
}

exports.client_Charges_BetweenDate = function (req, res) {
    var truID = req.body.rtruID;
    if (req.body.startDate && req.body.endDate) {
        var startdate = new Date(Date.parse(req.body.startDate));
        var enddate = new Date(Date.parse(req.body.endDate));
        var flag1 = { truID: truID, "createDate": { $gte: startdate, $lte: enddate } }
        CHARGESLOG.aggregate([
            { $match: flag1 },
            {
                $project: {
                    _id: 0,
                    createDate: 1,
                    revenuePercent: { $ifNull: [{ $toDouble: "$revenuePercent" }, 0] },
                    nodeCharges: { $ifNull: [{ $toDouble: "$nodeCharges" }, 0] },
                    partnerCharges: { $ifNull: [{ $toDouble: "$partnerCharges" }, 0] },
                    trasactionCharges: { $ifNull: [{ $toDouble: "$trasactionCharges" }, 0] },
                    promotionQty: { $ifNull: [{ $toDouble: "$promotionQty" }, 0] },
                    isChargesSet: 1
                }
            },
            { $sort: { "createDate": 1 } }
        ]).exec(function (err, result) {
            if (err) {
                response.status(500).send({ error: err })
                return next(err);
            }
            else {
                if (result.length > 0) {
                    var lastflag = { truID: truID, "createDate": { $lt: result[0].createDate } }
                    calculateClientLastRate(lastflag, result)
                }
                else {
                    var lastflag = { truID: truID, "createDate": { $lt: startdate } }
                    calculateClientLastRate(lastflag)
                }
            }
        })
        function calculateClientLastRate(lastflag, docs) {
            CHARGESLOG.aggregate([
                { $match: lastflag },
                {
                    $project: {
                        _id: 0,
                        createDate: 1,
                        revenuePercent: { $ifNull: [{ $toDouble: "$revenuePercent" }, 0] },
                        nodeCharges: { $ifNull: [{ $toDouble: "$nodeCharges" }, 0] },
                        partnerCharges: { $ifNull: [{ $toDouble: "$partnerCharges" }, 0] },
                        trasactionCharges: { $ifNull: [{ $toDouble: "$trasactionCharges" }, 0] },
                        promotionQty: { $ifNull: [{ $toDouble: "$promotionQty" }, 0] },
                        isChargesSet: 1
                    }
                },
                { $sort: { "createDate": -1 } },
                { $limit: 1 }
            ]).exec(function (err, result) {
                if (!result.length) {
                    var last = [{
                        "createDate": new Date("01/01/2001"),
                        "revenuePercent": 0,
                        "nodeCharges": 0,
                        "partnerCharges": 0,
                        "trasactionCharges": 0,
                        "promotionQty": 0,
                        "isChargesSet": false
                    }]

                    if (docs) {
                        getCharges(last.concat(docs))
                    }
                    else {
                        getCharges(last)
                    }
                }
                else {
                    if (docs) {
                        getCharges(result.concat(docs))
                    }
                    else {
                        getCharges(result)
                    }
                }
            })
        }
        function getCharges(result) {
            res.status(200).json({ status: "1000", resource: result });
        }
    }
    else {
        res.status(411).json({ status: "411", message: "No record found" });
    }
}