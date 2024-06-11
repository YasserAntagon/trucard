'use strict'
const CONFIG = require('../models/pgConfiguration'),
    PERMISSION = require('../models/permission'),
    DIGITALPG = require('../models/digitalpgModel'),
    CONFIGLOG = require('../models/custConfigurationsLogModel');
exports.digital_payment = function (req, res) {
    var digitalPayment = req.body.digitalPayment;
    let appliedOn = req.body.appliedOn;
    try {
        var configlog = new CONFIGLOG();
        configlog.truID = req.body.truid;
        configlog.KYCFlag = req.body.kycflag;
        configlog.appliedOn = appliedOn;
        configlog.modifyDate = new Date();
        configlog.digitalPayment = digitalPayment;
        configlog.save(function (err) {
            if (err) {
                res.json({ status: "500", message: "Internal Server Error" });
            } else {
                CONFIG.aggregate([{ $match: { "KYCFlag": req.body.kycflag, appliedOn: appliedOn } },
                { $project: { _id: 0, digitalPayment: 1 } }]).exec(function (err, result) {
                    if (err) {
                        res.json({ status: "500", message: "Internal Server Error" });
                    }
                    else {
                        if (result.length > 0 && result[0].digitalPayment) {
                            //update
                            CONFIG.findOneAndUpdate({ "KYCFlag": req.body.kycflag, appliedOn: req.body.appliedOn }, { $set: { digitalPayment: digitalPayment } }, { new: true }).exec(function (err, result) {
                                if (err) {
                                    res.json({ status: "500", message: "Internal Server Error" });
                                } else {
                                    res.json({ status: "200", message: "Configiration has been updated ...." });
                                }
                            })
                        } else {
                            CONFIG.findOneAndUpdate({ "KYCFlag": req.body.kycflag, appliedOn: req.body.appliedOn }, { $set: { appliedOn: req.body.appliedOn, KYCFlag: req.body.kycflag, digitalPayment: digitalPayment } }, { upsert: true }).exec(function (err, result) {
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
            appliedOn = req.body.appliedOn;
        var pgID = "PG" + Date.parse(new Date()).toString();
        payIn["pgID"] = pgID;
        DIGITALPG.aggregate([
            { $match: { "appliedOn": appliedOn } },
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
                        configlog.modifyDate = new Date();
                        configlog.payIn = payIn;
                        configlog.save(function (err) {
                            if (err) {
                                res.json({ status: "500", message: "Internal Server Error" });
                            } else {
                                DIGITALPG.updateMany({}, {
                                    $set: {
                                        truID: req.body.truid,
                                        appliedOn: appliedOn
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
            appliedOn = req.body.appliedOn;
        var pgID = "PG" + Date.parse(new Date()).toString();
        impsPayOut["pgID"] = pgID;
        DIGITALPG.aggregate([
            { $match: { "appliedOn": appliedOn } },
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
                            { $match: { "appliedOn": "consumer" } },
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
                                configlog.modifyDate = new Date();
                                configlog.impsPayOut = impsPayOut;
                                configlog.save(function (err) {
                                    if (err) {
                                        res.json({ status: "500", message: "Internal Server Error" });
                                    } else {
                                        DIGITALPG.updateMany({}, {
                                            $set: {
                                                truID: req.body.truid,
                                                appliedOn: appliedOn
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
            appliedOn = req.body.appliedOn;
        var pgID = "PG" + Date.parse(new Date()).toString();
        neftPayOut["pgID"] = pgID;
        DIGITALPG.aggregate([
            { $match: { "appliedOn": appliedOn } },
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
                            { $match: { "appliedOn": "consumer" } },
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
                                configlog.modifyDate = new Date();
                                configlog.neftPayOut = neftPayOut;
                                configlog.save(function (err) {
                                    if (err) {
                                        res.json({ status: "500", message: "Internal Server Error" });
                                    } else {
                                        DIGITALPG.updateMany({}, {
                                            $set: {
                                                truID: req.body.truid,
                                                appliedOn: appliedOn
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
exports.digital_payment_upiPayOut = function (req, res) {
    try {
        let upiPayOut = req.body.upiPayOut,
            appliedOn = req.body.appliedOn;
        var pgID = "PG" + Date.parse(new Date()).toString();
        upiPayOut["pgID"] = pgID;
        DIGITALPG.aggregate([
            { $match: { "appliedOn": appliedOn } },
            { $project: { _id: 0, upiPayOut: 1 } },
            { $unwind: "$upiPayOut" },
            { $match: { "upiPayOut.PGType": upiPayOut.PGType } }
        ]).exec(function (err, findres) {
            if (err) {
                res.json({ status: "500", message: "Internal Server Error" });
            } else {
                if (err) {
                    res.json({ status: "500", message: "Internal Server Error" });
                } else {
                    if (!findres.length) {
                        DIGITALPG.aggregate([
                            { $match: { "appliedOn": "consumer" } },
                            { $project: { _id: 0, upiPayOut: 1 } },
                            { $unwind: "$upiPayOut" }
                        ]).exec(function (err, rescount) {
                            if (err) {
                                res.json({ status: "500", message: "Internal Server Error" });
                            } else {
                                rescount.length == 0 ? upiPayOut["isDefault"] = true : upiPayOut["isDefault"] = false;

                                var configlog = new CONFIGLOG();
                                configlog.truID = req.body.truid;
                                configlog.appliedOn = appliedOn;
                                configlog.modifyDate = new Date();
                                configlog.upiPayOut = upiPayOut;
                                configlog.save(function (err) {
                                    if (err) {
                                        res.json({ status: "500", message: "Internal Server Error" });
                                    } else {
                                        DIGITALPG.updateMany({}, {
                                            $set: {
                                                truID: req.body.truid,
                                                appliedOn: appliedOn
                                            },
                                            $addToSet: {
                                                "upiPayOut": upiPayOut
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
                        upiPayOut.isDefault ? setpayout["upiPayOut.$.isDefault"] = upiPayOut.isDefault : undefined;
                        upiPayOut.status ? setpayout["upiPayOut.$.status"] = upiPayOut.status : undefined;
                        upiPayOut.min ? setpayout["upiPayOut.$.min"] = upiPayOut.min : undefined;
                        upiPayOut.max ? setpayout["upiPayOut.$.max"] = upiPayOut.max : undefined;
                        upiPayOut.desc ? setpayout["upiPayOut.$.desc"] = upiPayOut.desc : undefined;

                        DIGITALPG.updateMany({ "upiPayOut.pgID": findres[0].upiPayOut.pgID }, {
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
                                                // console.log(Object.keys(result[0])[1])
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
        CONFIG.aggregate([
            { $match: { "appliedOn": "consumer", "KYCFlag": "KYC" } },
            { $project: { _id: 0, bankSlab: 1 } },
            { $unwind: "$bankSlab" },
            { $match: { "bankSlab.PGType": req.body.bankslab.PGType, "bankSlab.slabAmt": parseFloat(req.body.bankslab.slabAmt) } }
        ]).exec(function (err, findres) {
            if (err) {
                res.json({ status: "500", message: "Internal Server Error" });
            } else {
                if (!findres.length) {
                    var configlog = new CONFIGLOG();
                    configlog.truID = req.body.truid;
                    configlog.KYCFlag = req.body.kycflag;
                    configlog.appliedOn = appliedOn;
                    configlog.modifyDate = new Date();
                    configlog.bankSlab = bankslab;
                    configlog.save(function (err) {
                        if (err) {
                            res.json({ status: "500", message: "Internal Server Error" });
                        } else {
                            CONFIG.updateMany({}, {
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
                    CONFIG.updateMany({ "bankSlab.slabID": findres[0].bankSlab.slabID }, {
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
        CONFIG.aggregate([
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
        PERMISSION.aggregate([
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
                    PERMISSION.aggregate([
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

        function bankslab(obj) {
            return {

                "SlabAmt": { $toString: { $ifNull: [`${String(obj)}.slabAmt`, "0"] } },
                "NEFTcharges": { $toString: { $ifNull: [`${String(obj)}.NEFTcharges`, "0"] } },
                "IMPScharges": { $toString: { $ifNull: [`${String(obj)}.IMPScharges`, "0"] } },
                "RTGScharges": { $toString: { $ifNull: [`${String(obj)}.RTGScharges`, "0"] } },
                "UPICharges": { $toString: { $ifNull: [`${String(obj)}.UPICharges`, "0"] } },
                "serviceTax": { $toString: { $ifNull: [`${String(obj)}.serviceTax`, "0"] } },
                "PGType": `${String(obj)}.PGType`,
                "slabID": `${String(obj)}.slabID`
            }

        }
        function perm(obj) {
            return {
                _id: 0, appliedOn: 1,
                "status": { $toString: { $ifNull: [`${String(obj)}.status`, "0"] } },
                "PGType": { $toString: { $ifNull: [`${String(obj)}.PGType`, "0"] } },
                "min": { $toString: { $ifNull: [`${String(obj)}.min`, "0"] } },
                "max": { $toString: { $ifNull: [`${String(obj)}.max`, "0"] } },
                "desc": { $toString: { $ifNull: [`${String(obj)}.desc`, "0"] } },
                "pgID": { $toString: { $ifNull: [`${String(obj)}.pgID`, "0"] } },
                "isDefault": { $ifNull: [`${String(obj)}.isDefault`, false] }
            }
        }
        DIGITALPG.aggregate([
            { $match: { "appliedOn": appliedon, KYCFlag: kycflag } },
            {
                $project: {
                    _id: 0, appliedOn: 1, payIn: 1, impsPayOut: 1, neftPayOut: 1, upiPayOut: 1, upiCollect: 1
                }
            },
            {
                $facet: {
                    payIn: [{ $unwind: { path: "$payIn", preserveNullAndEmptyArrays: true } },
                    { $project: perm("$payIn") }],
                    impsPayOut: [{ $unwind: { path: "$impsPayOut", preserveNullAndEmptyArrays: true } },
                    { $match: { "impsPayOut.isDefault": true } },
                    { $project: perm("$impsPayOut") }],
                    neftPayOut: [{ $unwind: { path: "$neftPayOut", preserveNullAndEmptyArrays: true } },
                    { $match: { "neftPayOut.isDefault": true } },
                    { $project: perm("$neftPayOut") }],
                    upiPayOut: [{ $unwind: { path: "$upiPayOut", preserveNullAndEmptyArrays: true } },
                    { $match: { "upiPayOut.isDefault": true } },
                    { $project: perm("$upiPayOut") },],
                    upiCollect: [{ $unwind: { path: "$upiCollect", preserveNullAndEmptyArrays: true } },
                    { $match: { "upiCollect.isDefault": true } },
                    { $project: perm("$upiCollect") }]
                }
            },
            { $project: { _id: 0, appliedOn: { $arrayElemAt: ["$payIn.appliedOn", 0] }, payIn: 1, impsPayOut: 1, neftPayOut: 1, upiPayOut: 1, upiCollect: 1 } },
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
                    appliedOn: 1, payIn: 1, impsPayOut: 1, neftPayOut: 1, upiPayOut: 1, upiCollect: 1, bankSlab: "$pgconfigurations.bankSlab", bankSlabArr: "$pgconfigurations.bankSlab"
                }
            },
            { $unwind: { path: "$bankSlab", preserveNullAndEmptyArrays: true } },
            { $match: { "bankSlab.slabAmt": { $gte: amount }, "bankSlab.PGType": "BANKPAYOUT" } },
            { $sort: { "bankSlab.slabAmt": 1 } },
            { $limit: 1 },
            {
                $project: {
                    appliedOn: 1,
                    digitalPayment: {
                        payIn: "$payIn",
                        impsPayOut: "$impsPayOut", neftPayOut: "$neftPayOut", upiPayOut: "$upiPayOut", upiCollect: "$upiCollect"
                    },
                    "bankSlabArr": {
                        "$map": {
                            "input": "$bankSlabArr",
                            "as": "bankSl",
                            "in": {
                                $cond: [
                                    {
                                        $in: [
                                            "$$bankSl.PGType",
                                            ["BANKPAYOUT", "bank"]
                                        ]
                                    },
                                    bankslab("$$bankSl"),
                                    "$$bankSl"
                                ]
                            }
                        }
                    },
                    "bankSlab": bankslab("$bankSlab")
                }
            }
        ]).exec(function (err, result) {
            if (err) {
                console.log(err);
                res.json({ status: "500", message: "Internal Server Error" });
            } else {
                res.json({ status: "200", resource: result[0] });
            }
        });
    } catch (ex) {
        res.json({ status: "500", message: "Ops!..something went wrong" });
    }

}