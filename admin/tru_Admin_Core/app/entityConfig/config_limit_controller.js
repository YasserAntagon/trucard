var CHARGES = require('../models/entityModel/chargesModel'),
    CHARGESLOG = require('../models/entityModel/chargesModelLogs'),
    KycAll = require('../models/entityModel/remmitKYCAllModel');
var emailEntity = require("./emailForEntity");
module.exports = {
    wallet_access: function (req, res) {
        var truid = req.body.truid;
        KycAll.find({ truID: truid, isParent: true }, function (err, docs) {
            if (!docs.length) {
                res.json({ status: "204", message: "No parent entity user found!!" })
            } else {
                try {
                    nodeCol = nodedb.addCollection('config');
                    var jsonobj = {
                        "walletAccess": req.body.walletaccess,
                        "paymentModeAccess": req.body.paymentmodeaccess,
                        "paymentGateway": req.body.paymentgateway,
                        "redeemToWallet": req.body.redeemtowallet,
                        "modifyDate": new Date()
                    }
                    if (nodeCol.chain().find({
                        "truID": truid
                    }).data() == '') {
                        try {
                            nodeCol.insert({
                                truID: truid,
                                wallet: jsonobj
                            });
                            CONFIG.find({ truID: truid }).exec(function (err, result) {
                                if (err) {
                                    res.json({ status: "204", message: "Something went wrong!" })
                                }
                                else {
                                    if (result.length == 0) {
                                        var config = new CONFIG();
                                        config.truID = truid;
                                        config.wallet = jsonobj;
                                        config.modifyDate = Date.now();
                                        config.save(function (err) {
                                            if (err) {
                                                res.json({ status: "204", message: "Something went wrong!" })
                                            } else {
                                                UpdateConfigLog(req, res, jsonobj, "wallet")
                                            }
                                        })
                                    }
                                    else {
                                        CONFIG.findOneAndUpdate({ truID: truid }, { $set: { truID: truid, wallet: jsonobj } }, { upsert: true },
                                            function (err) {
                                                if (err) {
                                                    res.json({ status: "204", message: "Something went wrong!" })
                                                    // callback(ex, null);
                                                } else {
                                                    UpdateConfigLog(req, res, jsonobj, "wallet")
                                                    // res.json({status:"204",messege : "Something went wrong!"})
                                                }
                                            })
                                    }
                                }
                            })

                        }
                        catch (ex) {
                            res.json({ status: "204", message: "Something went wrong!" })
                        }

                    } else {
                        try {
                            nodeCol.chain().find({ "truID": truid }).update(function (obj) {
                                obj.wallet = jsonobj;
                            });
                            CONFIG.findOneAndUpdate({ truID: truid }, { $set: { truID: truid, wallet: jsonobj } },
                                function (err) {
                                    if (err) {
                                        res.json({ status: "204", message: "Something went wrong!" })
                                    } else {
                                        UpdateConfigLog(req, res, jsonobj, "wallet")
                                    }
                                })
                        }
                        catch (ex) {
                            res.json({ status: "204", message: "Something went wrong!" })
                        }
                    }

                }
                catch (ex) {
                    res.json({ status: "204", message: "Something went wrong!" })
                }
            }
        })
    },
    consumer_access: function (req, res) {
        var truid = req.body.truid;
        KycAll.find({ truID: truid, isParent: true }, function (err, docs) {
            if (!docs.length) {
                res.json({ status: "204", message: "No parent entity user found!!" })
            } else {

                try {
                    nodeCol = nodedb.addCollection('config');

                    var consumerobj = {
                        "buy": req.body.buy,
                        "redeemCash": req.body.redeemcash,

                        "transfer": req.body.transfer,

                        "modifyDate": new Date()
                    }
                    if (nodeCol.chain().find({
                        "truID": truid
                    }).data() == '') {
                        try {
                            nodeCol.insert({
                                truID: truid,
                                consumer: consumerobj
                            });
                            CONFIG.find({ truID: truid }).exec(function (err, result) {
                                if (err) {
                                    res.json({ status: "204", message: "Something went wrong!" })
                                }
                                else {
                                    if (result.length == 0) {
                                        var config = new CONFIG();
                                        config.truID = truid;
                                        config.consumer = consumerobj;
                                        config.modifyDate = Date.now();
                                        config.save(function (err) {
                                            if (err) {
                                                res.json({ status: "204", message: "Something went wrong!" })
                                            } else {
                                                UpdateConfigLog(req, res, consumerobj, "consumer")
                                            }
                                        })
                                    }
                                    else {
                                        CONFIG.findOneAndUpdate({ truID: truid }, { $set: { truID: truid, consumer: consumerobj } }, { upsert: true },
                                            function (err) {
                                                if (err) {
                                                    res.json({ status: "204", message: "Something went wrong!" })
                                                    // callback(ex, null);
                                                } else {
                                                    UpdateConfigLog(req, res, consumerobj, "consumer")
                                                    // res.json({status:"204",messege : "Something went wrong!"})
                                                }
                                            })
                                    }
                                }
                            })

                        }
                        catch (ex) {
                            res.json({ status: "204", message: "Something went wrong!" })
                        }

                    } else {
                        try {
                            nodeCol.chain().find({ "truID": truid }).update(function (obj) {
                                obj.consumer = consumerobj;
                            });
                            CONFIG.findOneAndUpdate({ truID: truid }, { $set: { truID: truid, consumer: consumerobj } },
                                function (err) {
                                    if (err) {
                                        res.json({ status: "204", message: "Something went wrong!" })
                                    } else {
                                        UpdateConfigLog(req, res, consumerobj, "consumer")
                                    }
                                })
                        }
                        catch (ex) {
                            res.json({ status: "204", message: "Something went wrong!" })
                        }
                    }

                }
                catch (ex) {
                    res.json({ status: "204", message: "Something went wrong!" })
                }
            }
        }
        )
    },
    entity_self_access: function (req, res) {
        var truid = req.body.truid;
        KycAll.find({ truID: truid, isParent: true }, function (err, docs) {
            if (!docs.length) {
                res.json({ status: "204", message: "No parent entity user found!!" })
            } else {

                try {
                    nodeCol = nodedb.addCollection('config');

                    var selfobj = {
                        "buy": req.body.buy,
                        "redeemCash": req.body.redeemcash,

                        "transfer": req.body.transfer,

                        "modifyDate": new Date()
                    }
                    if (nodeCol.chain().find({
                        "truID": truid
                    }).data() == '') {
                        try {
                            nodeCol.insert({
                                truID: truid,
                                self: selfobj
                            });
                            CONFIG.find({ truID: truid }).exec(function (err, result) {
                                if (err) {
                                    res.json({ status: "204", message: "Something went wrong!" })
                                }
                                else {
                                    if (result.length == 0) {
                                        var config = new CONFIG();
                                        config.truID = truid;
                                        config.self = selfobj;
                                        config.modifyDate = Date.now();
                                        config.save(function (err) {
                                            if (err) {
                                                res.json({ status: "204", message: "Something went wrong!" })
                                            } else {
                                                UpdateConfigLog(req, res, selfobj, "self")
                                            }
                                        })
                                    }
                                    else {
                                        CONFIG.findOneAndUpdate({ truID: truid }, { $set: { truID: truid, self: selfobj } }, { upsert: true },
                                            function (err) {
                                                if (err) {
                                                    res.json({ status: "204", message: "Something went wrong!" })
                                                    // callback(ex, null);
                                                } else {
                                                    UpdateConfigLog(req, res, selfobj, "self")
                                                    // res.json({status:"204",messege : "Something went wrong!"})
                                                }
                                            })
                                    }
                                }
                            })

                        }
                        catch (ex) {
                            res.json({ status: "204", message: "Something went wrong!" })
                        }

                    } else {
                        try {
                            nodeCol.chain().find({ "truID": truid }).update(function (obj) {
                                obj.self = selfobj;
                            });
                            CONFIG.findOneAndUpdate({ truID: truid }, { $set: { truID: truid, self: selfobj } },
                                function (err) {
                                    if (err) {
                                        res.json({ status: "204", message: "Something went wrong!" })
                                    } else {
                                        UpdateConfigLog(req, res, selfobj, "self")
                                    }
                                })
                        }
                        catch (ex) {
                            res.json({ status: "204", message: "Something went wrong!" })
                        }
                    }

                }
                catch (ex) {
                    res.json({ status: "204", message: "Something went wrong!" })
                }
            }
        }
        )
    },
    global_access: function (req, res) {
        var truid = req.body.truid;
        KycAll.find({ truID: truid, isParent: true }, function (err, docs) {
            if (!docs.length) {
                res.json({ status: "204", message: "No parent entity user found!!" })
            } else {

                try {
                    nodeCol = nodedb.addCollection('config');

                    var globalobj = {
                        "MID": req.body.mid,
                        "category": req.body.category,
                        "allConsumerAccess": req.body.allconsumeraccess,
                        "modifyDate": new Date()
                    }
                    if (nodeCol.chain().find({
                        "truID": truid
                    }).data() == '') {
                        try {
                            nodeCol.insert({
                                truID: truid,
                                global: globalobj
                            });
                            CONFIG.find({ truID: truid }).exec(function (err, result) {
                                if (err) {
                                    res.json({ status: "204", message: "Something went wrong!" })
                                }
                                else {
                                    if (result.length == 0) {
                                        var config = new CONFIG();
                                        config.truID = truid;
                                        config.global = globalobj;
                                        config.modifyDate = Date.now();
                                        config.save(function (err) {
                                            if (err) {
                                                res.json({ status: "204", message: "Something went wrong!" })
                                            } else {
                                                UpdateConfigLog(req, res, globalobj, "global")
                                            }
                                        })
                                    }
                                    else {
                                        CONFIG.findOneAndUpdate({ truID: truid }, { $set: { truID: truid, global: globalobj } }, { upsert: true },
                                            function (err) {
                                                if (err) {
                                                    res.json({ status: "204", message: "Something went wrong!" })
                                                    // callback(ex, null);
                                                } else {
                                                    UpdateConfigLog(req, res, globalobj, "global")
                                                    // res.json({status:"204",messege : "Something went wrong!"})
                                                }
                                            })
                                    }
                                }
                            })

                        }
                        catch (ex) {
                            res.json({ status: "204", message: "Something went wrong!" })
                        }

                    } else {
                        try {
                            nodeCol.chain().find({ "truID": truid }).update(function (obj) {
                                obj.global = globalobj;
                            });
                            CONFIG.findOneAndUpdate({ truID: truid }, { $set: { truID: truid, global: globalobj } },
                                function (err) {
                                    if (err) {
                                        res.json({ status: "204", message: "Something went wrong!" })
                                    } else {

                                        UpdateConfigLog(req, res, globalobj, "global")
                                    }
                                })
                        }
                        catch (ex) {
                            res.json({ status: "204", message: "Something went wrong!" })
                        }
                    }

                }
                catch (ex) {
                    res.json({ status: "204", message: "Something went wrong!" })
                }
            }
        }
        )
    },
    transactions_limit: function (req, res) {
        var truid = req.body.truid;
        var fromtruid = req.body.fromtruid;
        var checklimit = req.body.checklimit;
        KycAll.find({ truID: truid, isParent: true }, function (err, docs) {
            if (!docs.length) {
                res.json({ status: "204", message: "No parent entity user found!!" })
            } else {

                try {
                    nodeCol = nodedb.addCollection('config');

                    var remaingamt = nodeCol.chain().find({ "truID": truid }).data();

                    if (!remaingamt || !remaingamt.length || !remaingamt[0].TXN) {
                        remaingamt = 0;
                    } else {
                        remaingamt = remaingamt[0].TXN.remnantAmount;
                    }

                    var txnobj = {
                        "txnAmountLimit": parseFloat(req.body.txnamountlimit),
                        "remnantAmount": parseFloat(req.body.txnamountlimit) + remaingamt,
                        "checkLimit": checklimit,
                        "modifyDate": new Date()
                    }
                    if (nodeCol.chain().find({
                        "truID": truid
                    }).data() == '') {
                        try {
                            nodeCol.insert({
                                truID: truid,
                                TXN: txnobj
                            });
                            CONFIG.find({ truID: truid }).exec(function (err, result) {
                                if (err) {
                                    res.json({ status: "204", message: "Something went wrong!" })
                                }
                                else {
                                    if (result.length == 0) {
                                        var config = new CONFIG();
                                        config.truID = truid;
                                        config.TXN = txnobj;
                                        config.modifyDate = Date.now();
                                        config.save(function (err) {
                                            if (err) {
                                                res.json({ status: "204", message: "Something went wrong!" })
                                            } else {
                                                UpdateConfigLog(req, res, txnobj, "TXN")
                                            }
                                        })
                                    }
                                    else {
                                        CONFIG.findOneAndUpdate({ truID: truid }, { $set: { truID: truid, TXN: txnobj } }, { upsert: true },
                                            function (err) {
                                                if (err) {
                                                    res.json({ status: "204", message: "Something went wrong!" })
                                                } else {
                                                    var configlog = new CONFIGLOG();
                                                    configlog.fromTruID = fromtruid;
                                                    configlog.truID = truid;
                                                    configlog.TXN = txnobj;
                                                    configlog.save(function (err) {
                                                        if (err) {
                                                            res.json({ status: "204", message: "Something went wrong!" })
                                                        } else {
                                                            UpdateConfigLog(req, res, txnobj, "TXN")
                                                        }
                                                    }
                                                    )
                                                    // res.json({status:"204",messege : "Something went wrong!"})
                                                }
                                            })
                                    }
                                }
                            })


                        }
                        catch (ex) {
                            res.json({ status: "204", message: "Something went wrong!" })
                        }

                    } else {
                        try {
                            nodeCol.chain().find({ "truID": truid }).update(function (obj) {
                                obj.TXN = txnobj;
                            });
                            CONFIG.findOneAndUpdate({ truID: truid }, { $set: { truID: truid, TXN: txnobj } },
                                function (err) {
                                    if (err) {
                                        res.json({ status: "204", message: "Something went wrong!" })
                                    } else {
                                        UpdateConfigLog(req, res, txnobj, "TXN")
                                    }
                                })
                        }
                        catch (ex) {
                            res.json({ status: "204", message: "Something went wrong!" })
                        }
                    }

                }
                catch (ex) {
                    res.json({ status: "204", message: "Something went wrong!" })
                }
            }
        }
        )
    },

    show_configurations: function (req, res) {
        var truid = req.body.truid;
        try {
            nodeCol = nodedb.addCollection('config');

            var entityconfig = nodeCol.chain().find({ "truID": truid }).data();
            if (entityconfig && entityconfig.length) {

                var txnAmountLimit = "NA", remnantAmount = "NA", MID = "NA",
                    category = "NA", allConsumerAccess = "NA", cbuy = "NA", credeemCash = "NA",
                    ctransfer = "NA", sbuy = "NA", sredeemCash = "NA",
                    stransfer = "NA", walletAccess = "NA", paymentModeAccess = "NA",
                    paymentGateway = "NA", redeemToWallet = "NA", checkLimit = "NA";

                if (entityconfig[0].TXN) {
                    txnAmountLimit = entityconfig[0].TXN.txnAmountLimit;
                    remnantAmount = entityconfig[0].TXN.remnantAmount;
                    checkLimit = entityconfig[0].TXN.checkLimit;
                }
                if (entityconfig[0].wallet) {
                    walletAccess = entityconfig[0].wallet.walletAccess;
                    paymentModeAccess = entityconfig[0].wallet.paymentModeAccess;
                    paymentGateway = entityconfig[0].wallet.paymentGateway;
                    redeemToWallet = entityconfig[0].wallet.redeemToWallet;
                }
                if (entityconfig[0].global) {
                    MID = entityconfig[0].global.MID;
                    category = entityconfig[0].global.category;
                    allConsumerAccess = entityconfig[0].global.allConsumerAccess;
                }
                if (entityconfig[0].consumer) {
                    cbuy = entityconfig[0].consumer.buy;
                    credeemCash = entityconfig[0].consumer.redeemCash;
                    ctransfer = entityconfig[0].consumer.transfer;
                }
                if (entityconfig[0].self) {
                    sbuy = entityconfig[0].self.buy;
                    sredeemCash = entityconfig[0].self.redeemCash;
                    stransfer = entityconfig[0].self.transfer;
                }
                var respobj = ({
                    "global": {
                        "MID": MID,
                        "category": category,
                        "allConsumerAccess": allConsumerAccess
                    },
                    "wallet": {
                        "walletAccess": walletAccess,
                        "paymentModeAccess": paymentModeAccess,
                        "paymentGateway": paymentGateway,
                        "redeemToWallet": redeemToWallet
                    },
                    "consumer": {
                        "buy": cbuy,
                        "redeemCash": credeemCash,
                        "transfer": ctransfer
                    },
                    "self": {
                        "buy": sbuy,
                        "redeemCash": sredeemCash,
                        "transfer": stransfer,
                    },
                    "TXN": {
                        "txnAmountLimit": txnAmountLimit,
                        "remnantAmount": remnantAmount,
                        "checkLimit": checkLimit,
                        "minAverageBal": "99"
                    }
                })

                res.json({ status: "200", resource: respobj });
            }
            else {
                readFromDB();
            }
        }
        catch (ex) {
            console.log(ex)
            readFromDB();
        }
        function readFromDB() {
            try {
                CONFIG.find({ truID: truid }).exec(function (err, result) {
                    if (err) {
                        res.json({ status: "204", message: "Something went wrong!" })
                    }
                    else {
                        if (!result || !result.length) {
                            res.json({ status: "204", message: "Config not found for this entity!" })
                        } else {
                            var txnAmountLimit = "NA", remnantAmount = "NA", MID = "NA", 
                                category = "NA", allConsumerAccess = "NA", cbuy = "NA", credeemCash = "NA",
                                sbuy = "NA", sredeemCash = "NA",
                                walletAccess = "NA", paymentModeAccess = "NA",
                                paymentGateway = "NA", redeemToWallet = "NA", checkLimit = "NA";

                            if (result[0].wallet && result[0].wallet.walletAccess) {
                                walletAccess = result[0].wallet.walletAccess;
                                paymentModeAccess = result[0].wallet.paymentModeAccess;
                                paymentGateway = result[0].wallet.paymentGateway;
                                redeemToWallet = result[0].wallet.redeemToWallet;
                            }
                            if (result[0].global && result[0].global.MID) {
                                MID = result[0].global.MID;
                                category = result[0].global.category;
                                allConsumerAccess = result[0].global.allConsumerAccess;
                            }
                            if (result[0].consumer && result[0].consumer.buy) {
                                cbuy = result[0].consumer.buy;
                                credeemCash = result[0].consumer.redeemCash;
                                ctransfer = result[0].consumer.transfer;
                            }
                            if (result[0].self && result[0].self.buy) {
                                sbuy = result[0].self.buy;
                                sredeemCash = result[0].self.redeemCash;
                                stransfer = result[0].self.transfer;
                            }
                            if (result[0].TXN && result[0].TXN.txnAmountLimit) {
                                txnAmountLimit = result[0].TXN.txnAmountLimit.toJSON().$numberDecimal;
                                remnantAmount = result[0].TXN.remnantAmount.toJSON().$numberDecimal;
                                checkLimit = result[0].TXN.checkLimit;
                            }

                            var respobj = ({
                                "global": {
                                    "MID": MID,
                                    "category": category,
                                    "allConsumerAccess": allConsumerAccess
                                },
                                "wallet": {
                                    "walletAccess": walletAccess,
                                    "paymentModeAccess": paymentModeAccess,
                                    "paymentGateway": paymentGateway,
                                    "redeemToWallet": redeemToWallet
                                },
                                "consumer": {
                                    "buy": cbuy,
                                    "redeemCash": credeemCash,
                                    "transfer": ctransfer,
                                },
                                "self": {
                                    "buy": sbuy,
                                    "redeemCash": sredeemCash,
                                    "transfer": stransfer
                                },
                                "TXN": {
                                    "txnAmountLimit": txnAmountLimit,
                                    "remnantAmount": remnantAmount,
                                    "checkLimit": checkLimit,
                                    "minAverageBal": "99"
                                }
                            })

                            res.json({ status: "200", resource: respobj });
                        }
                    }
                }
                )
            }
            catch (ex) {
                res.json({ status: "204", message: "Something went wrong!" })
            }
        }
    },

    check_txn_limit: function (req, res) {
        var rtruid = req.body.truid;
        var amt = parseFloat(req.body.amt);
        var flag = req.body.flag;
        KycAll.find({ truID: rtruid }, function (err, docs) {
            if (!docs.length) {
                res.json({ status: "204", message: "No entity user found!!" })
            } else {
                var truid = docs[0].parentTruID;
                try {
                    nodeCol = nodedb.addCollection('config');

                    var entityconfig = nodeCol.chain().find({ "truID": truid }).data();
                    if (entityconfig && entityconfig.length) {

                        var txnAmountLimit = 0, remnantAmount = 0, checklimit = false;

                        if (entityconfig[0].TXN) {
                            txnAmountLimit = entityconfig[0].TXN.txnAmountLimit;
                            remnantAmount = entityconfig[0].TXN.remnantAmount;
                            checklimit = entityconfig[0].TXN.checklimit;
                        }
                        if (flag === "update" && checkLimit === true && remnantAmount >= amt) {
                            updateRemanantAmount(remnantAmount, amt);
                        }
                        else if (checkLimit === true && flag === "check") {
                            if (remnantAmount >= amt) {
                                res.json("200");
                            } else {
                                res.json("500")
                            }
                        } else {
                            res.json("200");
                        }
                    }
                    else {
                        readFromDB();
                    }
                }
                catch (ex) {
                    readFromDB();
                }
                function readFromDB() {
                    try {
                        CONFIG.find({ truID: truid }).exec(function (err, result) {
                            if (err) {
                                res.json({ status: "204", message: "Something went wrong!" })
                            }
                            else {
                                if (!result || !result.length) {
                                    res.json({ status: "204", message: "Config not found for this entity!" })
                                } else {
                                    var txnAmountLimit = 0, remnantAmount = 0, checkLimit = 0;

                                    if (result[0].TXN && result[0].TXN.txnAmountLimit) {
                                        txnAmountLimit = result[0].TXN.txnAmountLimit.toJSON().$numberDecimal;
                                        remnantAmount = result[0].TXN.remnantAmount.toJSON().$numberDecimal;
                                        checklimit = result[0].TXN.checklimit;
                                    }
                                    if (flag === "update" && checkLimit === true && remnantAmount >= amt) {
                                        updateRemanantAmount(remnantAmount, amt);
                                    }
                                    else if (checkLimit === true && flag === "check") {
                                        if (remnantAmount >= amt) {
                                            res.json("200");
                                        } else {
                                            res.json("500")
                                        }
                                    } else {
                                        res.json("200");
                                    }
                                }
                            }
                        }
                        )
                    }
                    catch (ex) {
                        res.json({ status: "204", message: "Something went wrong!" })
                    }
                }

                function updateRemanantAmount(remnantAmount, amt) {
                    if (remnantAmount >= amt) {
                        var remainingamt = remnantAmount - amt;
                        nodeCol.chain().find({ "truID": truid }).update(function (obj) {
                            obj.TXN.remnantAmount = remainingamt;
                        });
                        CONFIG.findOneAndUpdate({ truID: truid }, { $set: { truID: truid, "TXN.remnantAmount": remainingamt } }).
                            exec(function (err, result) {
                                if (err) {
                                    res.json("402") //somethingwent wrong
                                } else {
                                    res.json("200")
                                }
                            }
                            )
                    } else {
                        res.json("500")
                    }
                }
            }
        }
        )
    },

    show_wallet_configurations: function (req, res) {
        var rtruid = req.body.truid;
        KycAll.find({ truID: rtruid }, function (err, docs) {
            if (!docs.length) {
                res.json({ status: "204", message: "No parent entity user found!!" })
            } else {
                var truid = docs[0].parentTruID;
                try {
                    nodeCol = nodedb.addCollection('config');

                    var entityconfig = nodeCol.chain().find({ "truID": truid }).data();
                    if (entityconfig && entityconfig.length) {

                        var walletAccess = "NA", paymentModeAccess = "NA", paymentGateway = "NA",
                            redeemToWallet = "NA";

                        if (result[0].wallet) {
                            walletAccess = result[0].wallet.walletAccess;
                            paymentModeAccess = result[0].wallet.paymentModeAccess;
                            paymentGateway = result[0].wallet.paymentGateway;
                            redeemToWallet = result[0].wallet.redeemToWallet;
                        }
                        var respobj = ({
                            "walletAccess": walletAccess,
                            "paymentModeAccess": paymentModeAccess,
                            "paymentGateway": paymentGateway,
                            "redeemToWallet": redeemToWallet
                        })

                        res.json({ status: "200", resource: respobj, parentTruID: truid });
                    }
                    else {
                        readFromDB();
                    }
                }
                catch (ex) {
                    readFromDB();
                }
                function readFromDB() {
                    try {
                        CONFIG.find({ truID: truid }).exec(function (err, result) {
                            if (err) {
                                res.json({ status: "204", message: "Something went wrong!" })
                            }
                            else {
                                if (!result || !result.length) {
                                    res.json({ status: "204", message: "Config not found for this entity!" })
                                } else {
                                    var walletAccess = "NA", paymentModeAccess = "NA", redeemToWallet = "NA", paymentGateway = "NA";

                                    if (result[0].wallet && result[0].wallet.walletAccess) {
                                        walletAccess = result[0].wallet.walletAccess;
                                        paymentModeAccess = result[0].wallet.paymentModeAccess;
                                        paymentGateway = result[0].wallet.paymentGateway;
                                        redeemToWallet = result[0].wallet.redeemToWallet;
                                    }

                                    var respobj = ({
                                        "walletAccess": walletAccess,
                                        "paymentModeAccess": paymentModeAccess,
                                        "paymentGateway": paymentGateway,
                                        "redeemToWallet": redeemToWallet
                                    })

                                    res.json({ status: "200", resource: respobj, parentTruID: truid });
                                }
                            }
                        }
                        )
                    }
                    catch (ex) {
                        res.json({ status: "204", message: "Something went wrong!" })
                    }
                }
            }
        }
        )
    },

    read_txn_configuration_logs: function (req, res) {
        var truid = req.body.truid;
        //   var fromtruid = req.body.fromtruid;
        //  var checklimit = req.body.checklimit;
        KycAll.find({ truID: truid, isParent: true }, function (err, docs) {
            if (!docs.length) {
                res.json({ status: "204", message: "No parent entity user found!!" })
            } else {

                try {
                    CONFIGLOG.find({ truID: truid },
                        function (err, logresult) {
                            if (err) {
                                res.json({ status: "204", message: "Something went wrong!" })
                            } else {
                                if (!logresult || !logresult.length) {
                                    res.json({ status: "204", message: "No Data Found!" })
                                }
                                else {
                                    res.json({ status: "200", resource: logresult })
                                }
                            }
                        })

                }
                catch (ex) {
                    res.json({ status: "204", message: "Something went wrong!" })
                }
            }
        }
        )
    },
    list_settings: function (req, res) {
        var truid = req.body.truid;
        KycAll.find({ truID: truid, isParent: true }, function (err, docs) {
            if (!docs.length) {
                res.json({ status: "4004", message: "No parent entity user found!!" })
            } else {

                var truid = docs[0].parentTruID;
                try {
                    nodeCol = nodedb.addCollection('config');
                    var entityconfig = nodeCol.chain().find({ "truID": truid }).data();
                    if (entityconfig && entityconfig.length) {

                        var allConsumerAccess = "NA";

                        if (entityconfig[0].global) {
                            allConsumerAccess = entityconfig[0].global.allConsumerAccess;
                        }
                        var respobj = ({
                            "allConsumerAccess": allConsumerAccess
                        })

                        res.json({ status: "4000", resource: respobj, parentTruID: truid });
                    }
                    else {
                        readFromDB();
                    }
                }
                catch (ex) {
                    readFromDB();
                }
                function readFromDB() {
                    try {
                        CONFIG.find({ truID: truid }).exec(function (err, result) {
                            if (err) {
                                res.json({ status: "4003", message: "Something went wrong!" })
                            }
                            else {
                                if (!result || !result.length) {
                                    res.json({ status: "4004", message: "Config not found for this entity!" })
                                } else {
                                    var allConsumerAccess = false;

                                    if (result[0].global && result[0].global.allConsumerAccess) {
                                        allConsumerAccess = result[0].global.allConsumerAccess;
                                    }

                                    var respobj = ({
                                        "allConsumerAccess": allConsumerAccess
                                    })

                                    res.json({ status: "4000", resource: respobj, parentTruID: truid });
                                }
                            }
                        }
                        )
                    }
                    catch (ex) {
                        res.json({ status: "4003", message: "Something went wrong!" })
                    }
                }
            }
        })
    },
    update_entity_Revenue_Percent: function (req, res) {
        var truid = req.body.truid,
            fromTruID = req.body.fromtruid,
            // entityRevenuePer = req.body.entityrevenueper,
            partnercharges = req.body.partnercharges,
            nodecharges = req.body.nodecharges,
            trasactioncharges = req.body.trasactioncharges,
            appliedOn = req.body.appliedOn,
            isChargesSet = req.body.isChargesSet,
            tdsPercentage = req.body.tdsPercentage,
            type = req.body.type,
            qty = req.body.qty;

        KycAll.find({ truID: truid }).exec(function (err, doc) {
            if (err) {
                res.status(500).json({ status: "500", message: "ïnternal server error" });
            } else {
                if (!doc.length) {
                    res.json({ status: "204", message: "The request was successful but no body was returned." });
                } else {
                    var chargeArr = new CHARGES();
                    chargeArr.truID = truid;
                    // chargeArr.revenueCharges = entityRevenuePer;
                    chargeArr.nodeCharges = nodecharges;
                    chargeArr.partnerCharges = partnercharges;
                    chargeArr.trasactionCharges = trasactioncharges;
                    chargeArr.tdsPercentage = tdsPercentage;
                    chargeArr.type = type;
                    chargeArr.appliedOn = appliedOn;
                    chargeArr.promotionQty = qty;
                    chargeArr.isChargesSet = isChargesSet ? isChargesSet : true;
                    CHARGES.find({ truID: truid, type: type, appliedOn: appliedOn }, function (err, docs) {
                        if (err) {
                            res.status(500).json({ status: "500", message: "ïnternal server error" });
                        } else {
                            if (!docs.length) {
                                chargeArr.save(function (err) {
                                    if (err) {
                                        res.json({ status: "204", message: "Charges Not saved..!!" });
                                    } else {
                                        logCharges();
                                        res.json({ status: "200", message: "Entity Revenue Charges saved Sucessfully" });
                                    }
                                })
                            } else {
                                CHARGES.findOneAndUpdate({ truID: truid, type: type, appliedOn: appliedOn }, {
                                    $set: {
                                        // "revenueCharges": entityRevenuePer, 
                                        "promotionQty": qty,
                                        "nodeCharges": nodecharges,
                                        "partnerCharges": partnercharges,
                                        "trasactionCharges": trasactioncharges,
                                        "tdsPercentage": tdsPercentage,
                                        "type": type,
                                        "appliedOn": appliedOn,
                                        "isChargesSet": isChargesSet ? isChargesSet : true,
                                        modifyDate: Date.now()
                                    }
                                }, { upsert: true }, function (err, result) {
                                    if (err) {
                                        res.status(500).json({ status: "500", message: "ïnternal server error" })
                                    } else {
                                        logCharges();
                                        res.json({ status: "200", message: "Entity Revenue Charges Updated Sucessfully" })
                                    }
                                })
                            }
                            function logCharges() {
                                const cf = new CHARGESLOG();
                                cf.truID = truid;
                                cf.fromTruID = fromTruID;
                                // cf.revenuePercent = entityRevenuePer;
                                cf.nodeCharges = nodecharges;
                                cf.partnerCharges = partnercharges;
                                cf.trasactionCharges = trasactioncharges;
                                cf.tdsPercentage = tdsPercentage;
                                cf.promotionQty = qty;
                                cf.type = type;
                                cf.appliedOn = appliedOn;
                                cf.isChargesSet = isChargesSet ? isChargesSet : true;
                                cf.save(function (err) {
                                    if (err) {
                                        console.log(err)
                                    }
                                })
                            }
                        }
                    })
                }
            }
        })
    },
    entity_Revenue_charges_History: function (req, res) {
        var truid = req.body.truid;

        KycAll.find({ truID: truid }).exec(function (err, doc) {
            if (err) {
                res.status(500).json({ status: "500", message: "ïnternal server error" });
            } else {
                if (!doc.length) {
                    res.json({ status: "204", message: "The request was successful but no body was returned." });
                } else {

                    CHARGES.find({ truID: truid }).sort({ createDate: -1 }).limit(30).exec(function (err, result) {
                        if (err) {
                            res.send({ status: 500, message: "Internal server error" })
                        } else {
                            if (!result.length) {
                                res.json({ status: "200", resource: [], isParent: doc[0].isParent })
                            }
                            else {
                                var resp = result;
                                var confArr = [];

                                if (resp) {
                                    for (var i = 0; i < resp.length; i++) {
                                        var respobj = {};
                                        respobj["fromTruID"] = resp[i].fromTruID;
                                        respobj["truID"] = resp[i].truID;
                                        respobj["createDate"] = resp[i].createDate;
                                        // respobj["revenuePercent"] = resp[i].revenuePercent.toJSON().$numberDecimal;
                                        respobj["promotionQty"] = resp[i].promotionQty.toJSON().$numberDecimal;
                                        respobj["nodeCharges"] = resp[i].nodeCharges.toJSON().$numberDecimal;
                                        respobj["partnerCharges"] = resp[i].partnerCharges.toJSON().$numberDecimal;
                                        respobj["trasactionCharges"] = resp[i].trasactionCharges.toJSON().$numberDecimal;
                                        respobj["isChargesSet"] = resp[i].isChargesSet;
                                        confArr.push(respobj);
                                    }
                                }
                                res.json({ status: "200", resource: confArr, isParent: doc[0].isParent })
                            }
                        }
                    })
                }
            }
        })
    },
    update_nodePercentage: async function (req, res) {
        var emailarr = [req.body.rTruID];
        var truid = req.body.truID;
        var type = [req.body.type];
        var excelQuery = { parentTruID: truid, "__t": "KycAll", truID: { $in: emailarr } };
        const nodeList = await KycAll.aggregate([{ $match: excelQuery },
        {
            $group: {
                "_id": null,
                "nodeTruID": {
                    "$push": { "truID": "$truID" }
                }
            }
        }]);

        var newQury = {};
        var concatArray = [];
        if (type.includes("buy")) {
            var nodeBuy = req.body.nodeCharges ? (parseFloat(req.body.nodeCharges) / 100).toFixed(2) : 0;
            concatArray.push("$buy");
            newQury.buy = [{
                $match: {
                    truID: truid, type: "buy"
                }
            },
            {
                $project: {
                    _id: 0, revenueCharges: 1, trasactionCharges: 1, promotionQty: 1, isChargesSet: 1,
                    nodeCharges: { $sum: [0, parseFloat(nodeBuy)] },
                    type: "buy",
                    partnerCharges: {
                        $let: {
                            vars: {
                                newnodecharges: { $sum: [{ $subtract: [1, { $sum: ["$nodeCharges", "$partnerCharges"] }] }, parseFloat(nodeBuy)] }
                            },
                            in: { $subtract: [1, "$$newnodecharges"] }
                        }
                    }
                }
            }];
        }
        if (type.includes("redeemCash")) {
            var nodeSell = req.body.nodeCharges ? (parseFloat(req.body.nodeCharges) / 100).toFixed(2) : 0;
            concatArray.push("$sell");
            newQury.sell = [{
                $match: {
                    truID: truid, type: "redeemCash"
                }
            },
            {
                $project: {
                    _id: 0, revenueCharges: 1, trasactionCharges: 1, promotionQty: 1, isChargesSet: 1,
                    nodeCharges: { $sum: [0, parseFloat(nodeSell)] },
                    type: "redeemCash",
                    partnerCharges: {
                        $let: {
                            vars: {
                                charges: { $subtract: [1, { $sum: ["$nodeCharges", "$partnerCharges"] }] },
                                newnodecharges: { $sum: [{ $subtract: [1, { $sum: ["$nodeCharges", "$partnerCharges"] }] }, parseFloat(nodeSell)] }
                            },
                            in: { $subtract: [1, "$$newnodecharges"] }
                        }
                    }
                }
            }];
        }
        if (type.includes("transfer")) {
            var nodeTransfer = req.body.nodeCharges ? (parseFloat(req.body.nodeCharges) / 100).toFixed(2) : 0;
            concatArray.push("$transfer");
            newQury.transfer = [{
                $match: {
                    truID: truid, type: "transfer"
                }
            },
            {
                $project: {
                    _id: 0, revenueCharges: 1, trasactionCharges: 1, promotionQty: 1, isChargesSet: 1,
                    nodeCharges: { $sum: [0, parseFloat(nodeTransfer)] },
                    type: "transfer",
                    partnerCharges: {

                        $let: {
                            vars: {
                                charges: { $subtract: [1, { $sum: ["$nodeCharges", "$partnerCharges"] }] },
                                newnodecharges: { $sum: [{ $subtract: [1, { $sum: ["$nodeCharges", "$partnerCharges"] }] }, parseFloat(nodeTransfer)] }
                            },
                            in: { $subtract: [1, "$$newnodecharges"] }
                        }
                    }
                }
            }]
        }
        const chargeFilter = await CHARGES.aggregate([
            {
                $facet: newQury
            },
            { $project: { activity: { "$concatArrays": concatArray } } },
            { $unwind: '$activity' }, { $replaceRoot: { newRoot: "$activity" } },
        ]);
        chargeFilter.map(async (cf) => {
            var cfLog = cf;
            nodeList[0].nodeTruID.forEach(function (element) {
                element.type = cf.type;
            });
            CHARGES.bulkWrite(
                nodeList[0].nodeTruID.map(c => {
                    return {
                        updateMany:
                        {
                            filter: { truID: c.truID, type: c.type },
                            update: {
                                $set: cfLog
                            },
                            upsert: true, new: true
                        }
                    }
                }), function (err, result) {
                    // console.log("logs", err, result)
                    CHARGESLOG.bulkWrite(
                        nodeList[0].nodeTruID.map(c => {
                            cf.fromTruID = truid;
                            cf.truID = c.truID;
                            return {
                                insertOne: { document: cf }
                            }
                        }), function (err, result) {
                            console.log("logs", err, result)
                        })
                });


        });
        if (chargeFilter && chargeFilter.length > 0) {
            res.send({
                status: "204", message: "Applied Successfully"
            })
        } else {
            res.send({
                status: "204", message: "Invalid Request, contact to your administrator..!!"
            })
        }
    },
    setNode_WisePermission: async function (req, res) {
        var truid = req.body.truID;
        var emailarr = req.body.nodes;
        var type = req.body.type;
        var appliedOn = req.body.appliedOn;
        var nodeBuy = req.body.nodeBuy ? (parseFloat(req.body.nodeBuy) / 100).toFixed(2) : 0;
        var nodeSell = req.body.nodeSell ? (parseFloat(req.body.nodeSell) / 100).toFixed(2) : 0;
        var nodeTransfer = req.body.nodeTransfer ? (parseFloat(req.body.nodeTransfer) / 100).toFixed(2) : 0;
        var excelQuery = {};
        if (req.body.subType == "excel") {
            var mobilearray = emailarr.map(i => {
                return i.mobile
            });
            var emailarray = emailarr.map(i => {
                return i.email
            });
            excelQuery = { parentTruID: truid, "__t": "KycAll", $or: [{ mobile: { $in: mobilearray } }, { email: { $in: emailarray } }] }
        }
        else {
            excelQuery = { parentTruID: truid, "__t": "KycAll", truID: { $in: emailarr } };
        }
        const nodeList = await KycAll.aggregate([{ $match: excelQuery },
        {
            $group: {
                "_id": null,
                "nodeTruID": {
                    "$push": { "truID": "$truID" }
                }
            }
        }]);

        var newQury = {};
        var concatArray = [];
        if (type.includes("buy")) {
            concatArray.push("$buy");
            newQury.buy = [{
                $match: {
                    truID: truid, type: "buy", appliedOn: appliedOn
                }
            },
            {
                $project: {
                    _id: 0, revenueCharges: 1, trasactionCharges: 1, promotionQty: 1, isChargesSet: 1,
                    nodeCharges: { $sum: [0, parseFloat(nodeBuy)] },
                    type: "buy", appliedOn: 1,
                    partnerCharges: {
                        $let: {
                            vars: {
                                newnodecharges: { $sum: [{ $subtract: [1, { $sum: ["$nodeCharges", "$partnerCharges"] }] }, parseFloat(nodeBuy)] }
                            },
                            in: { $subtract: [1, "$$newnodecharges"] }
                        }
                    }
                }
            }];
        }
        if (type.includes("redeemCash")) {
            concatArray.push("$sell");
            newQury.sell = [{
                $match: {
                    truID: truid, type: "redeemCash", appliedOn: appliedOn
                }
            },
            {
                $project: {
                    _id: 0, revenueCharges: 1, trasactionCharges: 1, promotionQty: 1, isChargesSet: 1,
                    nodeCharges: { $sum: [0, parseFloat(nodeSell)] },
                    type: "redeemCash", appliedOn: 1,
                    partnerCharges: {
                        $let: {
                            vars: {
                                charges: { $subtract: [1, { $sum: ["$nodeCharges", "$partnerCharges"] }] },
                                newnodecharges: { $sum: [{ $subtract: [1, { $sum: ["$nodeCharges", "$partnerCharges"] }] }, parseFloat(nodeSell)] }
                            },
                            in: { $subtract: [1, "$$newnodecharges"] }
                        }
                    }
                }
            }];
        }
        if (type.includes("transfer")) {
            concatArray.push("$transfer");
            newQury.transfer = [{
                $match: {
                    truID: truid, type: "transfer", appliedOn: appliedOn
                }
            },
            {
                $project: {
                    _id: 0, revenueCharges: 1, trasactionCharges: 1, promotionQty: 1, isChargesSet: 1,
                    nodeCharges: { $sum: [0, parseFloat(nodeTransfer)] },
                    type: "transfer", appliedOn: 1,
                    partnerCharges: {

                        $let: {
                            vars: {
                                charges: { $subtract: [1, { $sum: ["$nodeCharges", "$partnerCharges"] }] },
                                newnodecharges: { $sum: [{ $subtract: [1, { $sum: ["$nodeCharges", "$partnerCharges"] }] }, parseFloat(nodeTransfer)] }
                            },
                            in: { $subtract: [1, "$$newnodecharges"] }
                        }
                    }
                }
            }]
        }
        console.log(JSON.stringify(newQury))
        const chargeFilter = await CHARGES.aggregate([
            {
                $facet: newQury
            },
            { $project: { activity: { "$concatArrays": concatArray } } },
            { $unwind: '$activity' }, { $replaceRoot: { newRoot: "$activity" } },
        ]);
        chargeFilter.map(async (cf) => {
            var cfLog = cf;
            cfLog.partnerCharges = parseFloat(cf.partnerCharges).toFixed(2);
            nodeList[0].nodeTruID.forEach(function (element) {
                element.type = cf.type;
                element.appliedOn = cf.appliedOn;
            });
            CHARGES.bulkWrite(
                nodeList[0].nodeTruID.map(c => {
                    return {
                        updateMany:
                        {
                            filter: { truID: c.truID, type: c.type, appliedOn: c.appliedOn },
                            update: {
                                $set: cfLog
                            },
                            upsert: true, new: true
                        }
                    }
                }), function (err, result) {
                    // console.log("logs", err, result)
                    CHARGESLOG.bulkWrite(
                        nodeList[0].nodeTruID.map(c => {
                            cf.fromTruID = truid;
                            cf.truID = c.truID;
                            cf.appliedOn = c.appliedOn;
                            return {
                                insertOne: { document: cf }
                            }
                        }), function (err, result) {
                            console.log("logs", err, result)
                        })
                });


        });
        if (chargeFilter && chargeFilter.length > 0) {
            res.send({
                status: "204", message: "Applied Successfully"
            })
        } else {
            res.send({
                status: "204", message: "Invalid Request, contact to your administrator..!!"
            })
        }
    }
}
function UpdateConfigLog(req, res, jsonobj, type) {
    var configlog = new CONFIGLOG();
    var truid = req.body.truid;
    var fromtruid = req.body.fromtruid;
    configlog.fromTruID = fromtruid;
    configlog.truID = truid;
    configlog.createDate = Date.now();
    if (type == "wallet") {
        configlog.wallet = jsonobj;
    }
    else if (type == "consumer") {
        configlog.consumer = jsonobj;
    }
    else if (type == "self") {
        configlog.self = jsonobj;
    }
    else if (type == "TXN") {
        configlog.TXN = jsonobj;
    }
    else if (type == "global") {
        configlog.global = jsonobj;
    }
    configlog.save(function (err) {
        if (err) {
            res.json({ status: "204", message: "Something went wrong!" })
        } else {
            var obj = {};
            if (type == "wallet") {
                obj.wallet = jsonobj;
            }
            else if (type == "consumer") {
                obj.consumer = jsonobj;
            }
            else if (type == "self") {
                obj.self = jsonobj;
            }
            else if (type == "TXN") {
                obj.TXN = jsonobj;
            }
            else if (type == "global") {
                obj.global = jsonobj;
            }
            obj.message = "Successfully added"
            obj.status = "200"
            res.send(obj)
        }
    })
}


Object.size = function (obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};
