'use strict'
var CONFIG = require('../models/truRateModel/pgConfiguration'),
    DIGITALPG = require('../models/truRateModel/digitalpgModel'),
    CONFIGLOG = require('../models/truRateModel/custConfigurationsLogModel'),
    permission = require('../models/truRateModel/permission'),
    permissionlog = require('../models/truRateModel/permissionLog');

exports.digital_payment = function (req, res) {
    var digitalPayment = req.body.digitalPayment;
    let appliedOn = req.body.appliedOn;
    try {
        var configlog = new permissionlog();
        configlog.truID = req.body.truid;
        configlog.KYCFlag = req.body.kycflag;
        configlog.appliedOn = appliedOn;
        configlog.modifyDate = new Date();
        configlog.permissionID = Date.parse(new Date());
        configlog.digitalPayment = digitalPayment;
        configlog.save(function (err) {
            if (err) {
                res.json({ status: "500", message: "Internal Server Error" });
            } else {
                permission.aggregate([{ $match: { "KYCFlag": req.body.kycflag, appliedOn: appliedOn } },
                { $project: { _id: 0, digitalPayment: 1 } }]).exec(function (err, result) {
                    if (err) {
                        res.json({ status: "500", message: "Internal Server Error" });
                    }
                    else {
                        if (result.length > 0 && result[0].digitalPayment) {
                            //update
                            permission.findOneAndUpdate({ "KYCFlag": req.body.kycflag, appliedOn: req.body.appliedOn }, { $set: { digitalPayment: digitalPayment } }, { new: true }).exec(function (err, result) {
                                if (err) {
                                    res.json({ status: "500", message: "Internal Server Error" });
                                } else {
                                    res.json({ status: "200", message: "Configiration has been updated ...." });
                                }
                            })
                        } else {
                            permission.findOneAndUpdate({ "KYCFlag": req.body.kycflag, appliedOn: req.body.appliedOn }, { $set: { appliedOn: req.body.appliedOn, KYCFlag: req.body.kycflag, digitalPayment: digitalPayment } }, { upsert: true }).exec(function (err, result) {
                                if (err) {
                                    res.json({ status: "500", message: "Internal Server Error" });
                                } else {
                                    res.json({ status: "200", message: "Configiration has been updated ...." });
                                }
                            })
                        }

                    }
                })
            }
        })
    } catch (ex) {
        res.json({ status: "500", message: "OOps.! Something went Worng" });
    }
}

exports.digital_payment_payIn = function (req, res) {
    try {
        let payIn = req.body.payIn,
            appliedOn = req.body.appliedOn,
            kycflag = req.body.kycflag;
        var pgID = "PG" + Date.parse(new Date()).toString();
        payIn["pgID"] = pgID;
        DIGITALPG.aggregate([
            { $match: { "appliedOn": appliedOn, KYCFlag: kycflag } },
            { $project: { _id: 0, payIn: 1 } },
            { $unwind: "$payIn" },
            { $match: { "payIn.PGType": payIn.PGType } }
        ]).exec(function (err, findres) {
            if (err) {
                res.json({ status: "500", message: "Internal Server Error" });
            } else {
                if (err) {
                    res.json({ status: "500", message: "Internal Server Error" });
                } else {
                    if (!findres.length) {
                        var configlog = new CONFIGLOG();
                        configlog.truID = req.body.truid;
                        configlog.appliedOn = appliedOn;
                        configlog.KYCFlag = kycflag;
                        configlog.modifyDate = new Date();
                        configlog.payIn = payIn;
                        configlog.save(function (err) {
                            if (err) {
                                res.json({ status: "500", message: "Internal Server Error" });
                            } else {
                                DIGITALPG.updateMany({
                                    appliedOn: appliedOn,
                                    KYCFlag: kycflag
                                }, {
                                    $set: {
                                        truID: req.body.truid,
                                        appliedOn: appliedOn,
                                        KYCFlag: kycflag
                                    },
                                    $addToSet: {

                                        "payIn": payIn
                                    }
                                }, { upsert: true }, function (err) {
                                    if (err) {
                                        res.json({ status: "500", message: "Internal Server Error" });
                                    } else {
                                        res.json({ status: "200", message: "Configiration has been Added ...." });
                                    }
                                })
                            }
                        })
                    } else {
                        var setPayin = {
                            "payIn.$.status": payIn.status,
                            "payIn.$.min": payIn.min,
                            "payIn.$.max": payIn.max,
                            "payIn.$.desc": payIn.desc
                        }
                        DIGITALPG.updateMany({ "payIn.pgID": findres[0].payIn.pgID }, {
                            $set: setPayin
                        }, function (err) {
                            if (err) {
                                res.json({ status: "500", message: "Internal Server Error" });
                            } else {
                                res.json({ status: "200", message: "Configiration has been updated ...." });
                            }
                        })

                    }
                }
            }
        })
    } catch (ex) {
        res.json({ status: "500", message: "Oops.! Something went Worng" });
    }
}

exports.digital_payment_impsPayOut = function (req, res) {
    try {
        let impsPayOut = req.body.impsPayOut,
            appliedOn = req.body.appliedOn,
            kycflag = req.body.kycflag;
        var pgID = "PG" + Date.parse(new Date()).toString();
        impsPayOut["pgID"] = pgID;
        DIGITALPG.aggregate([
            { $match: { "appliedOn": appliedOn, KYCFlag: kycflag } },
            { $project: { _id: 0, impsPayOut: 1 } },
            { $unwind: "$impsPayOut" },
            { $match: { "impsPayOut.PGType": impsPayOut.PGType } }
        ]).exec(function (err, findres) {
            if (err) {
                res.json({ status: "500", message: "Internal Server Error" });
            } else {
                if (err) {
                    res.json({ status: "500", message: "Internal Server Error" });
                } else {
                    if (!findres.length) {
                        DIGITALPG.aggregate([
                            { $match: { "appliedOn": appliedOn, KYCFlag: kycflag } },
                            { $project: { _id: 0, impsPayOut: 1 } },
                            { $unwind: "$impsPayOut" }
                        ]).exec(function (err, rescount) {
                            if (err) {
                                res.json({ status: "500", message: "Internal Server Error" });
                            } else {
                                rescount.length == 0 ? impsPayOut["isDefault"] = true : impsPayOut["isDefault"] = false;

                                var configlog = new CONFIGLOG();
                                configlog.truID = req.body.truid;
                                configlog.appliedOn = appliedOn;
                                configlog.KYCFlag = kycflag;
                                configlog.modifyDate = new Date();
                                configlog.impsPayOut = impsPayOut;
                                configlog.save(function (err) {
                                    if (err) {
                                        res.json({ status: "500", message: "Internal Server Error" });
                                    } else {
                                        DIGITALPG.updateMany({
                                            appliedOn: appliedOn,
                                            KYCFlag: kycflag
                                        }, {
                                            $set: {
                                                truID: req.body.truid,
                                                appliedOn: appliedOn,
                                                KYCFlag: kycflag
                                            },
                                            $addToSet: {
                                                "impsPayOut": impsPayOut
                                            }
                                        }, { upsert: true }, function (err) {
                                            if (err) {
                                                res.json({ status: "500", message: "Internal Server Error" });
                                            } else {
                                                res.json({ status: "200", message: "Configiration has been Added ...." });
                                            }
                                        })
                                    }
                                })
                            }
                        });
                    } else {

                        var setpayout = {};
                        impsPayOut.isDefault ? setpayout["impsPayOut.$.isDefault"] = impsPayOut.isDefault : undefined;
                        impsPayOut.status ? setpayout["impsPayOut.$.status"] = impsPayOut.status : undefined;
                        impsPayOut.min ? setpayout["impsPayOut.$.min"] = impsPayOut.min : undefined;
                        impsPayOut.max ? setpayout["impsPayOut.$.max"] = impsPayOut.max : undefined;
                        impsPayOut.desc ? setpayout["impsPayOut.$.desc"] = impsPayOut.desc : undefined;

                        DIGITALPG.updateMany({ "impsPayOut.pgID": findres[0].impsPayOut.pgID }, {
                            $set: setpayout
                        }, function (err) {
                            if (err) {
                                res.json({ status: "500", message: "Internal Server Error" });
                            } else {
                                res.json({ status: "200", message: "Configiration has been updated ...." });
                            }
                        })

                    }
                }
            }
        })
    } catch (ex) {
        res.json({ status: "500", message: "Oops.! Something went Worng" });
    }
}
exports.digital_payment_neftPayOut = function (req, res) {
    try {
        let neftPayOut = req.body.neftPayOut,
            appliedOn = req.body.appliedOn,
            kycflag = req.body.kycflag;
        var pgID = "PG" + Date.parse(new Date()).toString();
        neftPayOut["pgID"] = pgID;
        DIGITALPG.aggregate([
            { $match: { "appliedOn": appliedOn, KYCFlag: kycflag } },
            { $project: { _id: 0, neftPayOut: 1 } },
            { $unwind: "$neftPayOut" },
            { $match: { "neftPayOut.PGType": neftPayOut.PGType } }
        ]).exec(function (err, findres) {
            if (err) {
                res.json({ status: "500", message: "Internal Server Error" });
            } else {
                if (err) {
                    res.json({ status: "500", message: "Internal Server Error" });
                } else {
                    if (!findres.length) {
                        DIGITALPG.aggregate([
                            { $match: { "appliedOn": appliedOn, KYCFlag: kycflag } },
                            { $project: { _id: 0, neftPayOut: 1 } },
                            { $unwind: "$neftPayOut" }
                        ]).exec(function (err, rescount) {
                            if (err) {
                                res.json({ status: "500", message: "Internal Server Error" });
                            } else {
                                rescount.length == 0 ? neftPayOut["isDefault"] = true : neftPayOut["isDefault"] = false;

                                var configlog = new CONFIGLOG();
                                configlog.truID = req.body.truid;
                                configlog.appliedOn = appliedOn;
                                configlog.KYCFlag = kycflag;
                                configlog.modifyDate = new Date();
                                configlog.neftPayOut = neftPayOut;
                                configlog.save(function (err) {
                                    if (err) {
                                        res.json({ status: "500", message: "Internal Server Error" });
                                    } else {
                                        DIGITALPG.updateMany({
                                            appliedOn: appliedOn,
                                            KYCFlag: kycflag
                                        }, {
                                            $set: {
                                                truID: req.body.truid,
                                                appliedOn: appliedOn,
                                                KYCFlag: kycflag
                                            },
                                            $addToSet: {
                                                "neftPayOut": neftPayOut
                                            }
                                        }, { upsert: true }, function (err) {
                                            if (err) {
                                                res.json({ status: "500", message: "Internal Server Error" });
                                            } else {
                                                res.json({ status: "200", message: "Configiration has been Added ...." });
                                            }
                                        })
                                    }
                                })
                            }
                        })
                    } else {

                        var setpayout = {};
                        neftPayOut.isDefault ? setpayout["neftPayOut.$.isDefault"] = neftPayOut.isDefault : undefined;
                        neftPayOut.status ? setpayout["neftPayOut.$.status"] = neftPayOut.status : undefined;
                        neftPayOut.min ? setpayout["neftPayOut.$.min"] = neftPayOut.min : undefined;
                        neftPayOut.max ? setpayout["neftPayOut.$.max"] = neftPayOut.max : undefined;
                        neftPayOut.desc ? setpayout["neftPayOut.$.desc"] = neftPayOut.desc : undefined;


                        DIGITALPG.updateMany({ "neftPayOut.pgID": findres[0].neftPayOut.pgID }, {
                            $set: setpayout
                        }, function (err) {
                            if (err) {
                                res.json({ status: "500", message: "Internal Server Error" });
                            } else {
                                res.json({ status: "200", message: "Configiration has been updated ...." });
                            }
                        })

                    }
                }
            }
        })
    } catch (ex) {
        res.json({ status: "500", message: "Oops.! Something went Worng" });
    }
}
exports.digital_payment_setDefault = function (req, res) {
    try {
        let truid = req.body.truid,
            pgID = req.body.pgID,
            pgmode = req.body.pgMode;

        var searchQuery = {}, setQuery = {};
        var searchforfalseQuery = {}, setforfalseQuery = {}, projection = {}, matching = {};

        searchQuery[pgmode + ".pgID"] = pgID;
        setQuery[pgmode + ".$.isDefault"] = true;
        searchforfalseQuery[pgmode + ".isDefault"] = true;
        setforfalseQuery[pgmode + ".$.isDefault"] = false;
        projection["_id"] = 1;
        projection[pgmode] = 1;
        matching[pgmode + ".pgID"] = pgID;
        matching[pgmode + ".isDefault"] = true;

        /*  switch (pgmode) {
             case "impsPayOut":
                 searchQuery["impsPayOut.pgID"] = pgID;
                 setQuery["impsPayOut.$.isDefault"] = true;
                 searchforfalseQuery["impsPayOut.isDefault"] = true;
                 setforfalseQuery["impsPayOut.$.isDefault"] = false;  
                 projection["_id"]=1;              
                 projection[pgmode]=1;              
                 matching[pgmode + ".pgID"]=1;             
                 matching[pgmode + ".isDefault"]=true;             
                                 
                 break;
             case "neftPayOut":
                 searchQuery["neftPayOut.pgID"] = pgID;
                 setQuery["neftPayOut.$.isDefault"] = true;
                 searchforfalseQuery["neftPayOut.isDefault"] = true;
                 setforfalseQuery["neftPayOut.$.isDefault"] = false;
                 break;
             case "upiPayOut":
                 searchQuery["upiPayOut.pgID"] = pgID;
                 setQuery["upiPayOut.$.isDefault"] = true;
                 searchforfalseQuery["upiPayOut.isDefault"] = true;
                 setforfalseQuery["upiPayOut.$.isDefault"] = false;
                 break;
         } */
        function dff(obj) {
            return (obj && Object.keys(obj).length !== 0);
        }
        if (dff(searchQuery) && dff(setQuery) && dff(searchforfalseQuery) && dff(setforfalseQuery) && dff(projection) && dff(matching)) {
            DIGITALPG.aggregate([
                { $match: { "appliedOn": "consumer" } },
                { $project: projection },
                { $unwind: "$" + pgmode },
                { $match: matching }
            ]).exec(function (err, result) {
                if (err) {
                    res.json({ status: "500", message: "Internal Server Error" });
                } else {
                    if (result.length) {
                        res.json({ status: "200", message: "Configiration has already Updated...." });
                    } else {
                        DIGITALPG.updateMany(searchforfalseQuery, {
                            $set: setforfalseQuery
                        }).exec(function (err) {
                            if (err) {
                                res.json({ status: "500", message: "Internal Server Error" });
                            } else {
                                DIGITALPG.findOneAndUpdate(searchQuery, {
                                    $set: setQuery
                                }, { new: true }, function (err, result) {
                                    if (err) {
                                        res.json({ status: "500", message: "Internal Server Error" });
                                    } else {
                                        res.json({ status: "200", message: "Configiration has been updated ...." });
                                        DIGITALPG.aggregate([
                                            { $match: { "appliedOn": "consumer" } },
                                            { $project: projection },
                                            { $unwind: "$" + pgmode },
                                            { $match: matching }
                                        ]).exec(function (err, result) {
                                            if (err) {

                                            } else {
                                                console.log(Object.keys(result[0])[1])
                                                var configlog = new CONFIGLOG();
                                                configlog.truID = req.body.truid;
                                                configlog.appliedOn = "consumer";
                                                configlog.modifyDate = new Date();
                                                configlog[Object.keys(result[0])[1]] = result[0][Object.keys(result[0])[1]];
                                                configlog.save(function (err) {
                                                })
                                            }
                                        })
                                    }
                                })
                            }
                        })
                    }
                }
            })

        } else {
            res.json({ status: "204", message: "Oops.! Something went Worng" });
        }
    } catch (ex) {
        res.json({ status: "500", message: "Oops.! Something went Worng" });
    }
}

exports.ins_bank_slab = function (req, res) {
    var bankslab = req.body.bankslab;
    let appliedOn = req.body.appliedOn;
    var slabid = "S" + Date.parse(new Date()).toString();
    bankslab["slabID"] = slabid;
    try {
        permission.aggregate([
            { $match: { "appliedOn": "consumer", "KYCFlag": "KYC" } },
            { $project: { _id: 0, bankSlab: 1 } },
            { $unwind: "$bankSlab" },
            { $match: { "bankSlab.PGType": req.body.bankslab.PGType, "bankSlab.slabAmt": parseFloat(req.body.bankslab.slabAmt) } }
        ]).exec(function (err, findres) {
            if (err) {
                res.json({ status: "500", message: "Internal Server Error" });
            } else {
                if (!findres.length) {
                    var configlog = new permissionlog();
                    configlog.truID = req.body.truid;
                    configlog.KYCFlag = req.body.kycflag;
                    configlog.appliedOn = appliedOn;
                    configlog.modifyDate = new Date();
                    configlog.permissionID = Date.parse(new Date());
                    configlog.bankSlab = bankslab;
                    configlog.save(function (err) {
                        if (err) {
                            res.json({ status: "500", message: "Internal Server Error" });
                        } else {
                            permission.updateMany({}, {
                                $addToSet: {
                                    "bankSlab": bankslab
                                }
                            }, { upsert: true }, function (err) {
                                if (err) {
                                    res.json({ status: "500", message: "Internal Server Error" });
                                } else {
                                    res.json({ status: "200", message: "Configiration has been Added ...." });
                                }
                            })
                        }
                    })

                } else {
                    permission.updateMany({ "bankSlab.slabID": findres[0].bankSlab.slabID }, {
                        $set: {
                            "bankSlab.$.NEFTcharges": bankslab.NEFTcharges,
                            "bankSlab.$.IMPScharges": bankslab.IMPScharges,
                            "bankSlab.$.RTGScharges": bankslab.RTGScharges,
                            "bankSlab.$.UPICharges": bankslab.UPICharges,
                            "bankSlab.$.serviceTax": bankslab.serviceTax,
                            "bankSlab.$.PGType": bankslab.PGType,
                        }
                    }, function (err) {
                        if (err) {
                            res.json({ status: "500", message: "Internal Server Error" });
                        } else {
                            res.json({ status: "200", message: "Configiration has been updated ...." });
                        }
                    })


                    // res.json({ status: "204", message: "Slab already Exist", SlabAmt: findres[0].bankSlab.slabAmt.toJSON().$numberDecimal, PGType: findres[0].bankSlab.PGType });
                }
            }

        })

    } catch (ex) {
        res.json({ status: "500", message: "Oops.! Something went Worng" });
    }
}

exports.del_bank_slab = function (req, res) {
    var slabid = req.body.slabID;
    try {
        permission.aggregate([
            { $match: { "appliedOn": "consumer", "KYCFlag": "KYC" } },
            { $project: { _id: 0, bankSlab: 1 } },
            { $unwind: "$bankSlab" },
            { $match: { "bankSlab.slabid": slabid } }
        ]).exec(function (err, findres) {
            if (err) {
                res.json({ status: "500", message: "Internal Server Error" });
            } else {
                if (!findres.length) {
                    res.json({ status: "204", message: "Slab not already Exist" });
                } else {

                }
            }

        })




    } catch (ex) {
        res.json({ status: "500", message: "Oops.! Something went Worng" });
    }
}

exports.get_bank_slab_by_amt = function (req, res) {
    let amt = parseFloat(req.body.amount);
    let appliedOn = req.body.appliedOn;
    let pgtype = req.body.pgtype;
    try {
        permission.aggregate([
            { $match: { "appliedOn": appliedOn, "KYCFlag": "nonKYC", } },
            { $project: { "_id": 0, bankSlab: 1 } },
            { $unwind: "$bankSlab" },
            { $match: { "bankSlab.slabAmt": { $gte: amt }, "bankSlab.PGType": pgtype } },
            { $sort: { "bankSlab.slabAmt": 1 } },
            { $limit: 1 },
            { $unwind: "$bankSlab" }
        ]).exec(function (err, result) {
            if (err) {
                res.json({ status: "500", message: "Internal Server Error" });
            } else {
                if (!result.length) {
                    permission.aggregate([
                        { $match: { "appliedOn": appliedOn, "KYCFlag": "nonKYC" } },
                        { $project: { "_id": 0, bankSlab: 1 } },
                        { $unwind: "$bankSlab" },
                        { $match: { "bankSlab.PGType": pgtype } },
                        { $sort: { "bankSlab.slabAmt": -1 } },
                        { $limit: 1 },
                        { $unwind: "$bankSlab" }
                    ]).exec(function (err, ress) {
                        if (err) {
                            res.json({ status: "500", message: "Internal Server Error" });
                        } else {
                            res.json({
                                status: "200", charges: {

                                    "slabAmt": ress.length ? ress[0].bankSlab.slabAmt ? parseFloat(ress[0].bankSlab.slabAmt.toJSON().$numberDecimal) : 0 : 0,
                                    "NEFTcharges": ress.length ? ress[0].bankSlab.NEFTcharges ? parseFloat(ress[0].bankSlab.NEFTcharges.toJSON().$numberDecimal) : 0 : 0,
                                    "IMPScharges": ress.length ? ress[0].bankSlab.IMPScharges ? parseFloat(ress[0].bankSlab.IMPScharges.toJSON().$numberDecimal) : 0 : 0,
                                    "RTGScharges": ress.length ? ress[0].bankSlab.RTGScharges ? parseFloat(ress[0].bankSlab.RTGScharges.toJSON().$numberDecimal) : 0 : 0,
                                    "UPICharges": ress.length ? ress[0].bankSlab.UPICharges ? parseFloat(ress[0].bankSlab.UPICharges.toJSON().$numberDecimal) : 0 : 0,
                                    "serviceTax": ress.length ? ress[0].bankSlab.serviceTax ? parseFloat(ress[0].bankSlab.serviceTax.toJSON().$numberDecimal) : 0 : 0,
                                    "PGType": ress.length ? ress[0].bankSlab.PGType ? ress[0].bankSlab.PGType : 0 : 0,
                                    "slabID": ress.length ? ress[0].bankSlab.slabID ? ress[0].bankSlab.slabI : 0 : 0
                                }
                            });

                        }
                    })

                } else {
                    res.json({
                        status: "200", charges: {

                            "slabAmt": result[0].bankSlab.slabAmt ? parseFloat(result[0].bankSlab.slabAmt.toJSON().$numberDecimal) : 0,
                            "NEFTcharges": result[0].bankSlab.NEFTcharges ? parseFloat(result[0].bankSlab.NEFTcharges.toJSON().$numberDecimal) : 0,
                            "IMPScharges": result[0].bankSlab.IMPScharges ? parseFloat(result[0].bankSlab.IMPScharges.toJSON().$numberDecimal) : 0,
                            "RTGScharges": result[0].bankSlab.RTGScharges ? parseFloat(result[0].bankSlab.RTGScharges.toJSON().$numberDecimal) : 0,
                            "UPICharges": result[0].bankSlab.UPICharges ? parseFloat(result[0].bankSlab.UPICharges.toJSON().$numberDecimal) : 0,
                            "serviceTax": result[0].bankSlab.serviceTax ? parseFloat(result[0].bankSlab.serviceTax.toJSON().$numberDecimal) : 0,
                            "PGType": result[0].bankSlab.PGType ? result[0].bankSlab.PGType : 0,
                            "slabID": result[0].bankSlab.slabID ? result[0].bankSlab.slabID : 0
                        }
                    });
                }

            }
        })
    } catch (ex) {
        console.log(ex)
        res.json({ status: "500", message: "Oops.! Something went Worng" });
    }
}

exports.digital_payment_list = function (req, res) {
    var kycflag = req.body.KYCFlag;
    var appliedon = req.body.appliedOn;
    var amount = parseFloat(req.body.amount);
    try {
        DIGITALPG.aggregate([
            { $match: { "appliedOn": appliedon } },
            {
                $project: {
                    _id: 0, appliedOn: 1, payIn: 1, impsPayOut: 1, neftPayOut: 1, upiPayOut: 1
                }
            },
            {
                $facet: {
                    payIn: [
                        { $unwind: { path: "$payIn", preserveNullAndEmptyArrays: true } },
                        { $match: { "payIn.status": "allow" } },
                        {
                            $project: {
                                _id: 0, appliedOn: 1,
                                "status": { $toString: { $ifNull: ["$payIn.status", "0"] } },
                                "PGType": { $toString: { $ifNull: ["$payIn.PGType", "0"] } },
                                "min": { $toString: { $ifNull: ["$payIn.min", "0"] } },
                                "max": { $toString: { $ifNull: ["$payIn.max", "0"] } },
                                "desc": { $toString: { $ifNull: ["$payIn.desc", "0"] } },
                                "pgID": { $toString: { $ifNull: ["$payIn.pgID", "0"] } }
                            }
                        }],
                    impsPayOut: [{ $unwind: { path: "$impsPayOut", preserveNullAndEmptyArrays: true } },
                    { $match: { "impsPayOut.isDefault": true, "impsPayOut.status": "allow" } },
                    {
                        $project: {
                            _id: 0, appliedOn: 1,
                            "status": { $toString: { $ifNull: ["$impsPayOut.status", "0"] } },
                            "PGType": { $toString: { $ifNull: ["$impsPayOut.PGType", "0"] } },
                            "min": { $toString: { $ifNull: ["$impsPayOut.min", "0"] } },
                            "max": { $toString: { $ifNull: ["$impsPayOut.max", "0"] } },
                            "desc": { $toString: { $ifNull: ["$impsPayOut.desc", "0"] } },
                            "pgID": { $toString: { $ifNull: ["$impsPayOut.pgID", "0"] } },
                            "isDefault": { $ifNull: ["$impsPayOut.isDefault", false] }
                        }
                    }],
                    neftPayOut: [{ $unwind: { path: "$neftPayOut", preserveNullAndEmptyArrays: true } },
                    { $match: { "neftPayOut.isDefault": true, "neftPayOut.status": "allow" } },
                    {
                        $project: {
                            _id: 0,
                            "status": { $toString: { $ifNull: ["$neftPayOut.status", "0"] } },
                            "PGType": { $toString: { $ifNull: ["$neftPayOut.PGType", "0"] } },
                            "min": { $toString: { $ifNull: ["$neftPayOut.min", "0"] } },
                            "max": { $toString: { $ifNull: ["$neftPayOut.max", "0"] } },
                            "desc": { $toString: { $ifNull: ["$neftPayOut.desc", "0"] } },
                            "pgID": { $toString: { $ifNull: ["$neftPayOut.pgID", "0"] } },
                            "isDefault": { $ifNull: ["$neftPayOut.isDefault", false] }
                        }
                    },],
                    upiPayOut: [{ $unwind: { path: "$upiPayOut", preserveNullAndEmptyArrays: true } },
                    { $match: { "upiPayOut.isDefault": true, "upiPayOut.status": "allow" } },
                    {
                        $project: {
                            _id: 0,
                            "status": { $toString: { $ifNull: ["$upiPayOut.status", "0"] } },
                            "PGType": { $toString: { $ifNull: ["$upiPayOut.PGType", "0"] } },
                            "min": { $toString: { $ifNull: ["$upiPayOut.min", "0"] } },
                            "max": { $toString: { $ifNull: ["$upiPayOut.max", "0"] } },
                            "desc": { $toString: { $ifNull: ["$upiPayOut.desc", "0"] } },
                            "pgID": { $toString: { $ifNull: ["$upiPayOut.pgID", "0"] } },
                            "isDefault": { $ifNull: ["$upiPayOut.isDefault", false] }
                        }
                    },]
                }
            },
            {
                $project: {
                    _id: 0, appliedOn: { $arrayElemAt: ["$payIn.appliedOn", 0] }, payIn: 1, impsPayOut: 1, neftPayOut: 1, upiPayOut: 1,
                }
            },
            {
                $lookup: {
                    from: "permissions",
                    localField: "appliedOn",
                    foreignField: "appliedOn",
                    as: "pgconfigurations"
                }
            },
            { $unwind: "$pgconfigurations" },
            {
                $project: {
                    appliedOn: 1, payIn: 1, impsPayOut: 1, neftPayOut: 1, upiPayOut: 1, bankSlab: "$pgconfigurations.bankSlab"
                }
            },
            { $unwind: "$bankSlab" },
            { $match: { "bankSlab.slabAmt": { $gte: amount }, "bankSlab.PGType": "BANKPAYOUT" } },
            { $sort: { "bankSlab.slabAmt": 1 } },
            { $limit: 1 },
            {
                $project: {
                    appliedOn: 1,
                    digitalPayment: {
                        payIn: "$payIn",
                        impsPayOut: "$impsPayOut", neftPayOut: "$neftPayOut", upiPayOut: "$upiPayOut"
                    },
                    "bankSlab": {
                        "SlabAmt": { $toString: { $ifNull: ["$bankSlab.slabAmt", "0"] } },
                        "NEFTcharges": { $toString: { $ifNull: ["$bankSlab.NEFTcharges", "0"] } },
                        "IMPScharges": { $toString: { $ifNull: ["$bankSlab.IMPScharges", "0"] } },
                        "RTGScharges": { $toString: { $ifNull: ["$bankSlab.RTGScharges", "0"] } },
                        "UPICharges": { $toString: { $ifNull: ["$bankSlab.UPICharges", "0"] } },
                        "serviceTax": { $toString: { $ifNull: ["$bankSlab.serviceTax", "0"] } },
                        "PGType": "$bankSlab.PGType",
                        "slabID": "$bankSlab.slabID"
                    }
                }
            }
        ]).exec(function (err, result) {
            if (err) {
                console.log(err);
                res.json({ status: "500", message: "Internal Server Error" });
            } else {
                res.json({ status: "200", resource: result });
            }
        });
    } catch (ex) {
        res.json({ status: "500", message: "Opps!..something went wrong" });
    }

}

exports.consumer_Permission = function (req, res) {
    var truID = req.body.truID;
    var KYCFlag = req.body.KYCFlag;
    var appliedOn = req.body.appliedOn;
    var limitapplied = req.body.limitapplied;

    var permissonobj = {};
    req.body.buy ? permissonobj["buy"] = req.body.buy : undefined;
    req.body.redeemCash ? permissonobj["redeemCash"] = req.body.redeemCash : undefined;
    req.body.transfer ? permissonobj["transfer"] = req.body.transfer : undefined;
    req.body.redeemToBank ? permissonobj["redeemToBank"] = req.body.redeemToBank : undefined;
    req.body.redeemToWallet ? permissonobj["redeemToWallet"] = req.body.redeemToWallet : undefined;
    req.body.walletAccess ? permissonobj["walletAccess"] = req.body.walletAccess : undefined;
    req.body.payByWallet ? permissonobj["payByWallet"] = req.body.payByWallet : undefined;
    req.body.consumerAccess ? permissonobj["consumerAccess"] = req.body.consumerAccess : undefined;
    req.body.login ? permissonobj["login"] = req.body.login : undefined;
    req.body.linkbank ? permissonobj["linkbank"] = req.body.linkbank : undefined;
    req.body.paymentModeAccess ? permissonobj["paymentModeAccess"] = req.body.paymentModeAccess : undefined;

    permission.find({ KYCFlag: KYCFlag, appliedOn: appliedOn }).exec(function (err, result) {
        if (err) {
            console.log("eer2", err);
            res.json({ status: "500", message: "Internal Server Error" });
        } else {
            if (!result.length) {
                const per = permission();
                per.truID = req.body.truID;
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
                        res.json({ status: "200", message: "Premission as been updated Successfully" });
                        var permissonobjupdate = {};
                        for (const [key, value] of Object.entries(permissonobj)) {
                            if (value != undefined) {
                                permissonobjupdate[`module.${key}`] = value;
                            }
                        }
                        logpermission(truID, KYCFlag, appliedOn, permissonobjupdate);
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
                permissonobjupdate.truID = truID;
                permission.findOneAndUpdate({ KYCFlag: KYCFlag, appliedOn: appliedOn },
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
                                res.json({ status: "200", message: "Premission as been updated Successfully" });
                                logpermission(truID, KYCFlag, appliedOn, permissonobjupdate);
                            }
                        }
                    })
            }

        }
    })

}

exports.consumer_updatelimit = function (req, res) {
    var truID = req.body.truID;
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
    req.body.txnFreeLimit ? tTypelimit["txnFreeLimit"] = req.body.txnFreeLimit : undefined;
    req.body.minStockRequired ? tTypelimit["minStockRequired"] = req.body.minStockRequired : undefined;
    req.body.sellAfterBuyInterval ? tTypelimit["sellAfterBuyInterval"] = req.body.sellAfterBuyInterval : undefined;
    req.body.sellToBankInterval ? tTypelimit["sellToBankInterval"] = req.body.sellToBankInterval : undefined;
    req.body.minBuyToSell ? tTypelimit["minBuyToSell"] = req.body.minBuyToSell : undefined;
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
        UpdateLimit(truID, appliedOn, KYCFlag, setValue);

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

        UpdateLimit(truID, appliedOn, KYCFlag, setValue);
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

        UpdateLimit(truID, appliedOn, KYCFlag, setValue);
    }
    function UpdateLimit(truID, appliedOn, KYCFlag, setValue) {

        setValue['truID'] = truID;

        permission.findOneAndUpdate({ "appliedOn": appliedOn, "KYCFlag": KYCFlag },
            { $set: setValue }, { returnNewDocument: true }).exec(function (err, result) {
                if (err) {
                    res.json({ status: "500", message: "Internal Server Error" });
                } else { 
                    if (!result) {
                        res.json({ status: "401", message: "No Permission given to this ID " + truID });
                    } else {
                        res.json({ status: "200", message: "Limit has been Updated for the request " + tType });
                        logpermission(truID, KYCFlag, appliedOn, setValue);
                    }
                }
            })
    }


}

exports.home_updatelimit = function (req, res) {

    var truID = req.body.truID;
    var KYCFlag = req.body.KYCFlag;
    var tType = req.body.tType;
    var appliedOn = req.body.appliedOn;
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
    setValue['truID'] = truID;

    permission.findOneAndUpdate({ "appliedOn": appliedOn, "KYCFlag": KYCFlag },
        { $set: setValue }, { returnNewDocument: true }).exec(function (err, result) {
            if (err) {
                res.json({ status: "500", message: "Internal Server Error" });
            } else { 
                if (!result) {
                    res.json({ status: "401", message: "No Permission given to this ID " + truID });
                } else {
                    res.json({ status: "200", message: "Limit has been Updated for the request " + tType });
                    logpermission(truID, KYCFlag, appliedOn, setValue);
                }
            }
        })
}

exports.consumer_updateWalletLimit = function (req, res) {
    var truID = req.body.truID;
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
    req.body.goldExposure ? walletlimitobj["goldExposure"] = req.body.goldExposure : undefined;
    req.body.silverExposure ? walletlimitobj["silverExposure"] = req.body.silverExposure : undefined;
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
        UpdateLimit(truID, appliedOn, KYCFlag, setValue);

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
        setValue['truID'] = truID;

        UpdateLimit(truID, appliedOn, KYCFlag, setValue);
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
        setValue['truID'] = truID;

        UpdateLimit(truID, appliedOn, KYCFlag, setValue);
    }
    function UpdateLimit(truID, appliedOn, KYCFlag, setValue) {
        permission.findOneAndUpdate({ "appliedOn": appliedOn, "KYCFlag": KYCFlag },
            { $set: setValue }, { returnNewDocument: true }).exec(function (err, result) {
                if (err) {
                    res.json({ status: "500", message: "Internal Server Error" });
                } else { 
                    if (!result) {
                        res.json({ status: "401", message: "No Permission given to this ID " + truID });
                    } else {
                        res.json({ status: "200", message: "Limit has been Updated for the request " + tType });
                        logpermission(truID, KYCFlag, appliedOn, setValue);
                    }
                }
            })
    }
}

exports.getSecureCredit = async function (req, res) {
    var data = await permission.aggregate([
        { $match: { "KYCFlag": "KYC", "appliedOn": "consumer" } },
        {
            $project: {
                _id: 0,
                appliedOn: 1, KYCFlag: 1,
                limit: "$limit.secureCredit"
            }
        },
        {
            $project: {
                _id: 0,
                appliedOn: 1, KYCFlag: 1,
                goldExposure: { $ifNull: [{ $toString: "$limit.goldExposure" }, 0] },
                silverExposure: { $ifNull: [{ $toString: "$limit.silverExposure" }, 0] },
                maxCredit: { $ifNull: [{ $toString: "$limit.maxCredit" }, 0] },
                minCredit: { $ifNull: [{ $toString: "$limit.minCredit" }, 0] }
            }
        }
    ])
    if(data.length>0)
    {
        res.json({ status: "200", resource: data[0] });
    }
    else{
        res.json({ status: "204", message:"No Found" });
    }
   
}
function logpermission(truID, KYCFlag, appliedOn, permissonobj) {
    var pNo = Date.parse(new Date());
    var permissionID = pNo.toString();
    permissionlog.findOneAndUpdate({ "permissionID": permissionID, "truID": truID, "appliedOn": appliedOn, "KYCFlag": KYCFlag },
        { $set: permissonobj }, { upsert: true }).exec(function (err, result) {
            if (err) {
                console.log("err", err);
            }
        });
}