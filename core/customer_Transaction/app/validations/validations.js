'use strict';

const request = require('request'), fs = require('fs'), path = require('path'), conf = require("../conf");
const KycAll = require('../models/custKYCAllModel'),
    ConsumerConfig = require('../consumerConfig/validate.limit.controller'),
    { validatetxnlimit, validatePANTXN } = require('../validations/limitValidations'),
    defaultConf = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../regionConf.json')));
exports.getChargesfromDB = function (req, res, next) {
    request.post({
        "headers": { "content-type": "application/json" },
        "url": conf.adminreqip + ":5112/api/getAllCharges",
    }, (error, response, body) => {
        if (error) {
            res.json({ status: "500", message: "Internal Server Error" })
        }
        else {
            if (response.statusCode == 200) {
                var resp = JSON.parse(body);
                req.generalCharges = resp.charges;
                next();
            } else {
                res.json({ status: "204", message: "something went wrong" })
            }
        }
    });
};
exports.stockAmtValidation = function (req, res, next) {
    var truID = req.body.totruid ? req.body.totruid : req.body.truid;
    KycAll.find({ $or: [{ truID: truID }, { CRNNo: req.body.crnno }] }, function (err, docs) {
        if (docs && docs.length > 0) {
            var kycFlag = docs[0].docVerified == true ? "KYC" : "nonKYC";
            var countrycode = docs[0].countryCode;
            request.post({
                "headers": { "content-type": "application/json" },
                "url": conf.reqip + ":4125/api/showconsumerconfigurations",
                "body": JSON.stringify({ "kycflag": kycFlag, "appliedOn": "consumer", "truid": truID })
            }, (error, response, body) => {
                if (error) {
                    res.json({ status: "500", message: "Internal Server Error" });
                }
                else {
                    if (response.statusCode == 200) {
                        if (JSON.parse(body).status == "200") {
                            var limit = JSON.parse(body).resource.limit;
                            switch (req.body.transactiontype) {
                                case "buy":
                                    validateAmt(limit.buyMin, limit.buyMax, limit.buySilverMin, limit.buySilverMax, "buy").then((bool) => {
                                        if (bool) {
                                            next();
                                        }
                                    });
                                    break;
                                case "redeemCash":
                                    validateAmt(limit.redeemCashMin, limit.redeemCashMax, limit.redeemCashSilverMin, limit.redeemCashSilverMax, "redeemCash").then((bool) => {
                                        if (bool) {
                                            next();
                                        }
                                    })
                                    break;

                                case "transfer":
                                    var g24kqty = "0";
                                    var s99pqty = "0";
                                    if (req.body.g24qty) {
                                        g24kqty = req.body.g24qty;
                                    }
                                    if (req.body.s99qty) {
                                        s99pqty = req.body.s99qty;
                                    }
                                    // call Live rate api
                                    validateTransferAmt(limit.transferMin, limit.transferMax, limit.transferSilverMin, limit.transferSilverMax, g24kqty, s99pqty).then((bool) => {
                                        if (bool) {
                                            next();
                                        }
                                    })
                                    break;
                                case "gift":
                                    var g24kqty = "0";
                                    var s99pqty = "0";
                                    if (req.body.g24qty) {
                                        g24kqty = req.body.g24qty;
                                    }
                                    if (req.body.s99qty) {
                                        s99pqty = req.body.s99qty;
                                    }
                                    // call Live rate api
                                    validateTransferAmt(limit.transferMin, limit.transferMax, limit.transferSilverMin, limit.transferSilverMax, g24kqty, s99pqty).then((bool) => {
                                        if (bool) {
                                            next();
                                        }
                                    })
                                    break;

                                default:
                                    res.json({ status: "204", message: "something went wrong" })
                            }
                            async function validateTransferAmt(min, max, silvermin, silvermax, g24kqty, s99pqty) {
                                // console.log("min, max, silvermin, silvermax", min, max, silvermin, silvermax)
                                var g24kvalid = true;
                                var s99pvalid = true;
                                var bullions = "";
                                var rate = await liveRateAPI(countrycode);
                                // console.log("rate", rate)
                                var g24krate = parseFloat(rate.G24K),
                                    s99prate = parseFloat(rate.S99P);

                                if (g24kqty != "0" && parseFloat(g24kqty) > 0) {
                                    var g24kamt = parseFloat(g24kqty) * g24krate
                                    // console.log("g24kamt", parseFloat(g24kqty), g24kamt)
                                    if (parseFloat(min) <= g24kamt && g24kamt <= parseFloat(max)) {
                                        g24kvalid = true;
                                    } else {
                                        bullions += min + " to " + max + " for TruCoin Gold";
                                        g24kvalid = false;
                                    }
                                }
                                if (s99pqty != "0" && parseFloat(s99pqty) > 0) {
                                    var s99pamt = parseFloat(s99pqty) * parseFloat(s99prate)
                                    if (parseFloat(silvermin) <= s99pamt && s99pamt <= parseFloat(silvermax)) {
                                        s99pvalid = true;
                                    } else {
                                        bullions += silvermin + " to " + silvermax + " for TruCoin Silver";
                                        s99pvalid = false;
                                    }
                                }
                                if (g24kvalid && s99pvalid) {
                                    return true;
                                } else {
                                    res.json({ status: "411", message: "You can transfer of " + defaultConf.defaultCurrency + " " + bullions });
                                    return false;
                                }
                            }
                            async function validateAmt(min, max, silvermin, silvermax, type) {
                                var g24kvalid = true;
                                var s99pvalid = true;
                                var bullions = "";
                                if (req.body.G24K.length) {
                                    var g24kqty = req.body.G24K[0].qty;
                                    var g24kfromtruid = req.body.G24K[0].amTruID;
                                    var g24krate = await reqassetmanagerRate(g24kfromtruid, "G24K", type);
                                    var g24kamt = parseFloat(g24kqty) * parseFloat(g24krate)
                                    if (parseFloat(min) <= g24kamt && g24kamt <= parseFloat(max)) {
                                        g24kvalid = true;
                                    } else {
                                        bullions += min + " to " + max + " for TruCoin Gold";
                                        g24kvalid = false;
                                    }
                                }
                                if (req.body.S99P.length) {
                                    var s99pqty = req.body.S99P[0].qty;
                                    var s99pfromtruid = req.body.S99P[0].amTruID;
                                    var s99prate = await reqassetmanagerRate(s99pfromtruid, "S99P", type);
                                    var s99pamt = parseFloat(s99pqty) * parseFloat(s99prate)
                                    if (parseFloat(silvermin) <= s99pamt && s99pamt <= parseFloat(silvermax)) {
                                        s99pvalid = true;
                                    } else {
                                        bullions += silvermin + " to " + silvermax + " for TruCoin Silver";
                                        s99pvalid = false;
                                    }
                                }
                                if (g24kvalid && s99pvalid) {
                                    return true;
                                } else {
                                    var tntType = (type === "redeem" || type === "redeemCash") ? "Sell" : "purchase";
                                    res.json({ status: "411", message: "You can " + tntType + " of " + defaultConf.defaultCurrency + " " + bullions });
                                    return false;
                                }
                            }
                        } else {
                            res.json(JSON.parse(body))
                        }
                    } else {
                        res.json({ status: "204", message: "something went wrong" })
                    }

                    function reqassetmanagerRate(fromtruid, bulltype, type) {
                        return new Promise((resolve, reject) => {
                            var reqIP;
                            if (type == "redeemCash") {
                                reqIP = ":4125/api/listratecustredeemcashbullions"
                            } else {
                                reqIP = ":4125/api/listratecustbuybullions"
                            }


                            request.post({
                                "headers": { "content-type": "application/json" },
                                "url": conf.reqip + reqIP,
                                "body": JSON.stringify({
                                    "truid": fromtruid,
                                    "bulltype": bulltype
                                })
                            }, (error, response, body) => {
                                if (error) {
                                    resolve("0");
                                }
                                else {
                                    if (JSON.parse(body).status == "200") {
                                        var rate = JSON.parse(body).resource;
                                        resolve(rate);
                                    }
                                    else {
                                        res.json(JSON.parse(body));
                                    }
                                }
                            })
                        })
                    }
                }
                function liveRateAPI(ccode) {
                    return new Promise((resolve, reject) => {
                        request.post({
                            "headers": { "content-type": "application/json" },
                            "url": conf.reqip + ":4125/api/readliveratefromassetmanager",
                            "body": JSON.stringify({
                                "countrycode": ccode
                            })
                        }, (error, response, body) => {
                            if (error) {
                                resolve("0");
                            }
                            else {
                                if (JSON.parse(body).status == "200") {
                                    var rate = JSON.parse(body).resource;
                                    resolve(rate);
                                }
                                else {
                                    res.json(JSON.parse(body));
                                }
                            }
                        })
                    })
                }

            })
        }
        else {
            res.json({ status: "204", message: "User not found!" })
        }
    })
}

exports.enstockAmtValidation = function (req, res, next) {
    var truID = req.body.totruid ? req.body.totruid : req.body.truid;
    var rTruID = req.body.rtruid,
        trasactionCharges = req.body.trasactioncharges;
    KycAll.aggregate([{ $match: { $or: [{ truID: truID }, { CRNNo: req.body.crnno }] } }]).exec(function (err, docs) {
        if (docs && docs.length > 0) {
            // console.log(docs[0].docVerified);
            var kycFlag = docs[0].docVerified == true ? "KYC" : "nonKYC";
            var countrycode = docs[0].countryCode;
            var panStatus = docs[0].panStatus;
            var truID = docs[0].truID;
            request.post({
                "headers": { "content-type": "application/json" },
                "url": conf.reqip + ":4125/api/showconsumerconfigurationsall",
                "body": JSON.stringify({ "kycflag": kycFlag, "appliedOn": "consumer", referencetruid: docs[0].refernceTruID, "truid": truID })
            }, (error, response, body) => {
                if (error) {
                    res.json({ status: "500", message: "Internal Server Error" })
                }
                else {
                    if (response.statusCode == 200) {
                        var resultpermission = JSON.parse(body);
                        req.ConsumerConf = JSON.parse(body);
                        var transType = req.body.transactiontype === "buyCash" ? "buy" : req.body.transactiontype;
                        if (resultpermission.status == "200") {
                            var permissionModule = resultpermission.resource.module;
                            var limit = resultpermission.resource.limit;
                            funpermissionModule(permissionModule, transType, function (moduleres) {
                                if (moduleres === "success") {
                                    switch (req.body.transactiontype) {
                                        case "buy":
                                            validateAmt(limit.buyMin, limit.buyMax, limit.buySilverMin, limit.buySilverMax, "purchase", truID, rTruID, (bool) => {
                                                if (bool.status) {
                                                    validatetxnlimit(truID, limit.buymaxAmtOfTxnInDay, limit.buymaxAmtOfTxnInMonth, limit.buymaxAmtOfTxnInHour,
                                                        limit.buytxnInterval, limit.buynoOfTxnInInterval, "buy", bool.txnAmt, req.body.status, null, null, function (translimitres) {
                                                            if (translimitres === "200") {
                                                                var valpanstat = validatePANTXN(bool.txnAmt, panStatus);
                                                                if (valpanstat === true) {
                                                                    next();
                                                                } else {
                                                                    res.json(valpanstat);
                                                                }

                                                            } else {
                                                                res.json({ status: "401", message: translimitresv });
                                                            }
                                                        })
                                                }
                                                else {
                                                    res.json({ status: "411", message: bool.message });
                                                }
                                            });
                                            break;
                                        case "buyCash":
                                            validateAmt(limit.buyMin, limit.buyMax, limit.buySilverMin, limit.buySilverMax, "purchase", truID, rTruID, (bool) => {
                                                if (bool.status) {
                                                    validatetxnlimit(truID, limit.buymaxAmtOfTxnInDay, limit.buymaxAmtOfTxnInMonth, limit.buymaxAmtOfTxnInHour,
                                                        limit.buytxnInterval, limit.buynoOfTxnInInterval, "buyCash", bool.txnAmt, req.body.status, null, null, function (translimitres) {
                                                            if (translimitres === "200") {
                                                                var valpanstat = validatePANTXN(bool.txnAmt, panStatus);
                                                                if (valpanstat === true) {
                                                                    next();
                                                                } else {
                                                                    res.json(valpanstat);
                                                                }
                                                            } else {
                                                                res.json({ status: "204", message: translimitres });
                                                            }
                                                        });

                                                }
                                                else {
                                                    res.json({ status: "204", message: bool.message });
                                                }
                                            });
                                            break;
                                        case "redeemCash":
                                            validateAmt(limit.redeemCashMin, limit.redeemCashMax, limit.redeemCashSilverMin, limit.redeemCashSilverMax, "redeem", truID, rTruID, (bool) => {
                                                if (bool.status) {
                                                    validatetxnlimit(truID, limit.redeemCashmaxAmtOfTxnInDay, limit.redeemCashmaxAmtOfTxnInMonth, limit.redeemCashmaxAmtOfTxnInHour,
                                                        limit.redeemCashtxnInterval, limit.redeemCashnoOfTxnInInterval, "redeemCash", bool.txnAmt, req.body.status, bool.txnqty, limit.redeemCashsellAfterBuyInterval, function (translimitres) {
                                                            if (translimitres === "200") {
                                                                var valpanstat = validatePANTXN(bool.txnAmt, panStatus);
                                                                if (valpanstat === true) {
                                                                    next();
                                                                } else {
                                                                    res.json(valpanstat);
                                                                }
                                                            } else {
                                                                res.json({ status: "204", message: translimitres });
                                                            }
                                                        });
                                                }
                                                else {
                                                    res.json({ status: "204", message: bool.message });
                                                }
                                            })

                                            break;

                                        case "transfer":
                                            var g24kqty = "0";
                                            var s99pqty = "0";
                                            if (req.body.g24qty) {
                                                g24kqty = req.body.g24qty;
                                            }
                                            if (req.body.s99qty) {
                                                s99pqty = req.body.s99qty;
                                            }
                                            // call Live rate api
                                            validateTransferAmt(limit.transferMin, limit.transferMax, limit.transferSilverMin, limit.transferSilverMax, g24kqty, s99pqty, (bool) => {
                                                if (bool.status) {
                                                    validatetxnlimit(truID, limit.transfermaxAmtOfTxnInDay, limit.transfermaxAmtOfTxnInMonth, limit.transfermaxAmtOfTxnInHour,
                                                        limit.transfertxnInterval, limit.transfernoOfTxnInInterval, "transfer", bool.txnAmt, req.body.status, null, null, function (translimitres) {
                                                            if (translimitres === "200") {
                                                                var valpanstat = validatePANTXN(bool.txnAmt, panStatus);
                                                                if (valpanstat === true) {
                                                                    next();
                                                                } else {
                                                                    res.json(valpanstat);
                                                                }
                                                            } else {
                                                                res.json({ status: "204", message: translimitres });
                                                            }
                                                        });
                                                }
                                                else {
                                                    res.json({ status: "204", message: bool.message });
                                                }
                                            })

                                            break;
                                        default:
                                            res.json({ status: "204", message: "something went wrong" })
                                    }

                                    async function validateTransferAmt(min, max, silvermin, silvermax, g24kqty, s99pqty, callback) {
                                        var g24kvalid = true;
                                        var s99pvalid = true;
                                        var g24kamt = 0;
                                        var s99pamt = 0;
                                        var bullions = "";
                                        var rate = await liveRateAPI(countrycode);
                                        var g24krate = parseFloat(rate.G24K),
                                            s99prate = parseFloat(rate.S99P);

                                        if (g24kqty != "0" && parseFloat(g24kqty) > 0) {
                                            g24kamt = parseFloat(g24kqty) * g24krate;
                                            // console.log("g24kamt", parseFloat(g24kqty), g24kamt)
                                            if (parseFloat(min) <= g24kamt && g24kamt <= parseFloat(max)) {
                                                g24kvalid = true;
                                            } else {
                                                bullions += min + " to " + max + " for TruCoin Gold";
                                                g24kvalid = false;
                                            }
                                        }
                                        if (s99pqty != "0" && parseFloat(s99pqty) > 0) {
                                            s99pamt = parseFloat(s99pqty) * parseFloat(s99prate);
                                            if (parseFloat(silvermin) <= s99pamt && s99pamt <= parseFloat(silvermax)) {
                                                s99pvalid = true;
                                            } else {
                                                bullions += silvermin + " to " + silvermax + " for TruCoin Silver";
                                                s99pvalid = false;

                                            }
                                        }
                                        if (g24kvalid && s99pvalid) {
                                            callback({
                                                status: true,
                                                txnAmt: g24kamt + s99pamt
                                            });
                                        } else {
                                            res.json({ status: "411", message: "You can Transfer of " + defaultConf.defaultCurrency + " " + bullions });
                                            callback({
                                                status: false
                                            });
                                        }
                                    }

                                    async function validateAmt(min, max, silvermin, silvermax, type, truID, rTruID, callback) {
                                        var g24kvalid = true;
                                        var s99pvalid = true;
                                        var bullions = "";
                                        var g24kamt = 0, s99pamt = 0;
                                        var g24kqty = 0, s99pqty = 0;
                                        function validateAmtinternal(vmin, vmax, gsamt, vbultype) {
                                            switch (vbultype) {
                                                case "G24K":
                                                    if (parseFloat(vmin) <= gsamt && gsamt <= parseFloat(vmax)) {
                                                        g24kvalid = true;
                                                    } else {
                                                        bullions += min + " to " + max + " for TruCoin Gold";
                                                        g24kvalid = false;
                                                    }
                                                    break;
                                                case "S99P":
                                                    if (parseFloat(vmin) <= gsamt && gsamt <= parseFloat(vmax)) {
                                                        s99pvalid = true;
                                                    } else {
                                                        bullions += silvermin + " to " + silvermax + " for TruCoin Silver";;
                                                        s99pvalid = false;
                                                    }
                                                    break;
                                            }
                                        }
                                        if (req.body.transactiontype === "buyCash") {
                                            g24kamt = req.body.g24amt;
                                            if (g24kamt !== "0" && parseFloat(g24kamt) >= 0) {
                                                validateAmtinternal(min, max, g24kamt, "G24K");
                                            }
                                        } else {
                                            if (req.body.g24qty != "0") {
                                                g24kqty = req.body.g24qty;
                                                var g24kfromtruid = req.body.fromtruid24;
                                                var g24krate = await reqassetmanagerRate(truID, rTruID, g24kfromtruid, type, "G24K");
                                                g24kamt = useToFixed(parseFloat(g24kqty) * parseFloat(g24krate));
                                                validateAmtinternal(min, max, g24kamt, "G24K");

                                            }
                                        }
                                        if (req.body.transactiontype === "buyCash") {
                                            s99pamt = req.body.s99amt;
                                            if (s99pamt !== "0" && parseFloat(s99pamt) >= 0) {
                                                validateAmtinternal(silvermin, silvermax, s99pamt, "S99P");
                                            }
                                        } else {
                                            if (req.body.s99qty != "0") {
                                                s99pqty = req.body.s99qty;
                                                var s99pfromtruid = req.body.fromtruid99;
                                                var s99prate = await reqassetmanagerRate(truID, rTruID, s99pfromtruid, type, "S99P");
                                                s99pamt = useToFixed(parseFloat(s99pqty) * parseFloat(s99prate));
                                                validateAmtinternal(silvermin, silvermax, s99pamt, "S99P");
                                            }
                                        }
                                        if (g24kvalid && s99pvalid) {
                                            callback({
                                                status: true, txnAmt: parseFloat(g24kamt) + parseFloat(s99pamt),
                                                txnqty: {
                                                    G24K: parseFloat(g24kqty),
                                                    S99P: parseFloat(s99pqty)
                                                },
                                            })
                                        } else {
                                            var tntType = (type === "redeem" || type === "redeemCash") ? "Sell" : "purchase";
                                            callback({ status: false, message: "You can " + tntType + " of " + defaultConf.defaultCurrency + " " + bullions })
                                        }
                                    }

                                    function reqassetmanagerRate(to, rtruid, fromtruid, type, bulltype) {
                                        return new Promise((resolve, reject) => {
                                            request.post({
                                                "headers": { "content-type": "application/json" },
                                                "url": conf.reqip + ":4121/api/topassetmanager",
                                                "body": JSON.stringify({
                                                    "truid": to,
                                                    "rtruid": rtruid,
                                                    "assetmanagersearch": type,
                                                })
                                            }, (error, response, body) => {
                                                if (error) {
                                                    resolve("0");
                                                }
                                                else {
                                                    var resJson = JSON.parse(body);
                                                    if (resJson.status == "200") {
                                                        var rate
                                                        switch (bulltype) {
                                                            case "G24K":
                                                                var tG24K = resJson.resource.topG24K
                                                                for (var i = 0; i < tG24K.length; i++) {
                                                                    if (tG24K[i].truID == fromtruid) {
                                                                        rate = tG24K[i].G24K
                                                                    }
                                                                }
                                                                break;
                                                            case "S99P":
                                                                var tS99P = resJson.resource.topS99P
                                                                for (var i = 0; i < tS99P.length; i++) {
                                                                    if (tS99P[i].truID == fromtruid) {
                                                                        rate = tS99P[i].S99P
                                                                    }
                                                                }
                                                                break;
                                                        }
                                                        resolve(rate);
                                                    } else {
                                                        resolve("0");
                                                    }

                                                }
                                            })
                                        })
                                    }

                                    function liveRateAPI(ccode) {
                                        return new Promise((resolve, reject) => {
                                            request.post({
                                                "headers": { "content-type": "application/json" },
                                                "url": conf.reqip + ":4125/api/readliveratefromassetmanager",
                                                "body": JSON.stringify({
                                                    "countrycode": ccode
                                                })
                                            }, (error, response, body) => {
                                                if (error) {
                                                    resolve("0");
                                                }
                                                else {
                                                    if (JSON.parse(body).status == "200") {
                                                        var rate = JSON.parse(body).resource;
                                                        var clientChargePer = trasactionCharges ? parseFloat(trasactionCharges) : 0;
                                                        var clientCharge24 = rate.G24Kgross ? parseFloat(rate.G24Kgross) * clientChargePer : 0;
                                                        var client24K = clientCharge24 + (rate.G24K ? parseFloat(rate.G24K) : 0);

                                                        var clientCharge99 = rate.S99Pgross ? parseFloat(rate.S99Pgross) * clientChargePer : 0;
                                                        var clientS99P = clientCharge99 + (rate.S99P ? parseFloat(rate.S99P) : 0);

                                                        var result = {
                                                            "G24K": client24K.toString(),
                                                            "S99P": clientS99P.toString()
                                                        };
                                                        req.topassetmanager = result;
                                                        resolve(result);

                                                    }
                                                    else {
                                                        res.json(JSON.parse(body));
                                                    }
                                                }
                                            })
                                        })
                                    }
                                } else {
                                    res.json({ status: "204", message: moduleres })
                                }
                            });
                        } else {
                            res.json(JSON.parse(body))
                        }
                    } else {
                        res.json({ status: "204", message: "something went wrong" })
                    }

                }

            })
        } else {
            res.json({ status: "204", message: "something went wrong" })
        }
    })
}

exports.validatelimits = function (req, res, next) {
    var truID = req.body.totruid ? req.body.totruid : req.body.truid;
    var amt = parseFloat(req.body.amt);
    KycAll.aggregate([{ $match: { $or: [{ truID: truID }, { CRNNo: req.body.crnno }, { CRNNo: req.body.customertruid }, { mobile: req.body.mobile }] } }]).exec(function (err, docs) {
        if (docs && docs.length > 0) {
            var kycFlag = docs[0].docVerified == true ? "KYC" : "nonKYC";
            var truID = docs[0].truID;
            var panStatus = docs[0].panStatus;
            request.post({
                "headers": { "content-type": "application/json" },
                "url": conf.reqip + ":4125/api/showconsumerconfigurationsall",
                "body": JSON.stringify({ "kycflag": kycFlag, "appliedOn": "consumer", "truid": truID })
            }, (error, response, body) => {
                if (error) {
                    res.json({ status: "500", message: "Internal Server Error" })
                }
                else {
                    if (response.statusCode == 200) {
                        if (JSON.parse(body).status == "200") {
                            var resultpermission = JSON.parse(body);
                            var permissionModule = resultpermission.resource.module;
                            var limit = resultpermission.resource.limit;
                            funpermissionModule(permissionModule, "walletToBank", function (moduleres) {
                                if (moduleres === "success") {
                                    if (parseFloat(limit.walletToBankMax) >= amt && amt >= parseFloat(limit.walletToBankMin)) {
                                        ConsumerConfig.checkWallettobankLimit(truID, amt, limit, function (limitcb, remainingtime) {
                                            if (limitcb === "200") {
                                                var valpanstat = validatePANTXN(amt, panStatus);
                                                if (valpanstat === true) {
                                                    next();
                                                } else {
                                                    res.json(valpanstat);
                                                }
                                            }
                                            else if (limitcb === "500") {
                                                if (kycFlag == "KYC") {
                                                    res.json({ status: "204", message: "You have exceeded your transaction limit!" });
                                                } else {
                                                    res.json({ status: "204", message: "You have exceeded your transaction limit! Please verify your KYC for unlimited access." });
                                                }
                                                // res.json({ status: "204", message: "You have exceeded your transaction limit! Please verify your KYC for unlimited access." });
                                            } else if (limitcb === "400") {
                                                var time = remainingtime + 1;
                                                res.json({ status: "204", message: "Please do the next transaction after " + time + " min. This is for your transaction safety." });
                                            } else {
                                                res.json({ status: "204", message: limitcb });
                                            }
                                        })
                                    } else {
                                        if (parseFloat(limit.walletToBankMax) < amt) {
                                            res.json({ status: "204", message: "Please enter amount below " + defaultConf.defaultCurrency + limit.walletToBankMax })
                                        } else {
                                            res.json({ status: "204", message: "Please enter amount above " + defaultConf.defaultCurrency + limit.walletToBankMin })
                                        }
                                    }
                                } else {
                                    res.json({ status: "204", message: moduleres })
                                }
                            })
                        } else {
                            res.json(JSON.parse(body))
                        }
                    } else {
                        res.json({ status: "204", message: "something went wrong" })
                    }
                }
            })
        } else {
            res.json({ status: "204", message: "something went wrong" })
        }
    })
}

exports.validateSellToBanklimits = function (req, res, next) {
    var truID = req.body.totruid ? req.body.totruid : req.body.truid;
    var amt = parseFloat(req.body.amt);
    KycAll.aggregate([{ $match: { $or: [{ truID: truID }, { CRNNo: req.body.crnno }, { CRNNo: req.body.customertruid }, { mobile: req.body.mobile }] } }]).exec(function (err, docs) {
        if (docs && docs.length > 0) {
            var kycFlag = docs[0].docVerified == true ? "KYC" : "nonKYC";
            var truID = docs[0].truID;
            var panStatus = docs[0].panStatus;
            request.post({
                "headers": { "content-type": "application/json" },
                "url": conf.reqip + ":4125/api/showconsumerconfigurationsall",
                "body": JSON.stringify({ "kycflag": kycFlag, "appliedOn": "consumer", "truid": truID })
            }, (error, response, body) => {
                if (error) {
                    res.json({ status: "500", message: "Internal Server Error" })
                }
                else {
                    if (response.statusCode == 200) {
                        if (JSON.parse(body).status == "200") {
                            var resultpermission = JSON.parse(body);
                            var permissionModule = resultpermission.resource.module;
                            var limit = resultpermission.resource.limit;
                            funpermissionModule(permissionModule, "redeemToBank", function (moduleres) {
                                if (moduleres === "success") {
                                    ConsumerConfig.checkredeemtobankLimit(truID, amt, limit.redeemCashsellToBankInterval, function (limitcb, remainingtime) {
                                        if (limitcb === "200") {
                                            var valpanstat = validatePANTXN(amt, panStatus);
                                            if (valpanstat === true) {
                                                next();
                                            } else {
                                                res.json(valpanstat);
                                            }
                                        }
                                        else if (limitcb === "500") {
                                            if (kycFlag == "KYC") {
                                                res.json({ status: "204", message: "You have exceeded your transaction limit!" });
                                            } else {
                                                res.json({ status: "204", message: "You have exceeded your transaction limit! Please verify your KYC for unlimited access." });
                                            }
                                            // res.json({ status: "204", message: "You have exceeded your transaction limit! Please verify your KYC for unlimited access." });
                                        } else if (limitcb === "400") {
                                            var time = remainingtime + 1;
                                            res.json({ status: "204", message: "Please do the next transaction after " + time + " min. This is for your transaction safety." });
                                        } else {
                                            res.json({ status: "204", message: limitcb });
                                        }
                                    })

                                } else {
                                    res.json({ status: "204", message: moduleres })
                                }
                            })
                        } else {
                            res.json(JSON.parse(body))
                        }
                    } else {
                        res.json({ status: "204", message: "something went wrong" })
                    }
                }
            })
        } else {
            res.json({ status: "204", message: "something went wrong" })
        }
    })
}

exports.validatelimitsaddmoney = function (req, res, next) {
    if (req.body.ttype === "addMoney") {
        var truID = req.body.totruid ? req.body.totruid : req.body.truid;
        var amt = req.body.totalamount ? parseFloat(req.body.totalamount) : parseFloat(req.body.invoiceamount);
        KycAll.aggregate([{ $match: { $or: [{ truID: truID }, { CRNNo: req.body.crnno }, { CRNNo: req.body.customertruid }] } }]).exec(function (err, docs) {
            if (docs && docs.length > 0) {
                var kycFlag = docs[0].docVerified == true ? "KYC" : "nonKYC";
                var truID = docs[0].truID;
                var panStatus = docs[0].panStatus;
                request.post({
                    "headers": { "content-type": "application/json" },
                    "url": conf.reqip + ":4125/api/showconsumerconfigurationsall",
                    "body": JSON.stringify({ "kycflag": kycFlag, "appliedOn": "consumer", "truid": truID })
                }, (error, response, body) => {
                    if (error) {
                        res.json({ status: "500", message: "Internal Server Error" })
                    }
                    else {
                        if (response.statusCode == 200) {
                            if (JSON.parse(body).status == "200") {
                                var resultpermission = JSON.parse(body);
                                var permissionModule = resultpermission.resource.module;
                                var limit = resultpermission.resource.limit;
                                funpermissionModule(permissionModule, "walletAccess", function (moduleres) {
                                    if (moduleres === "success") {
                                        if (parseFloat(limit.addMoneyMax) >= amt && amt >= parseFloat(limit.addMoneyMin)) {
                                            ConsumerConfig.checkaddtoWalletLimit(truID, amt, limit, limit.addMoneymaxAmtOfTxnInDay, limit.addMoneymaxAmtOfTxnInMonth, limit.addMoneymaxAmtOfTxnInHour,
                                                limit.addMoneytxnInterval, limit.addMoneynoOfTxnInInterval, function (limitcb) {
                                                    if (limitcb === "200") {
                                                        var valpanstat = validatePANTXN(amt, panStatus);
                                                        if (valpanstat === true) {
                                                            next();
                                                        } else {
                                                            res.json(valpanstat);
                                                        }
                                                    }
                                                    else if (limitcb === "500") {
                                                        if (kycFlag == "KYC") {
                                                            res.json({ status: "204", message: "You have exceeded your transaction limit!" });
                                                        } else {
                                                            res.json({ status: "204", message: "You have exceeded your transaction limit! Please verify your KYC for unlimited access." });
                                                        }
                                                    } else {
                                                        res.json({ status: "204", message: limitcb });
                                                    }
                                                })
                                        } else {
                                            if (parseFloat(limit.addMoneyMax) < amt) {
                                                res.json({ status: "204", message: "Please enter amount below " + defaultConf.defaultCurrency + limit.addMoneyMax })
                                            } else {
                                                res.json({ status: "204", message: "Please enter amount above " + defaultConf.defaultCurrency + limit.addMoneyMin })
                                            }
                                        }
                                    } else {
                                        res.json({ status: "204", message: moduleres })
                                    }
                                })

                            } else {
                                res.json(JSON.parse(body))
                            }
                        } else {
                            res.json({ status: "204", message: "something went wrong" })
                        }
                    }
                })
            } else {
                res.json({ status: "204", message: "something went wrong" })
            }
        })
    } else {
        next();
    }
}

exports.KYCValidation = function (req, res, next) {
    var truID = req.body.totruid ? req.body.totruid : req.body.truid;
    KycAll.find({ $or: [{ truID: truID }, { CRNNo: req.body.crnno }] }, function (err, docs) {
        if (docs && docs.length > 0) {
            if (docs[0].kycFlag === "active") {
                next();
            } else {
                switch (docs[0].kycFlag) {
                    case "active":
                        next();
                        break;
                    case "holder":
                        res.json({ status: "204", message: "Consumer account on hold" });
                        break;
                    case "pending":
                        res.json({ status: "204", message: "Consumer e-kyc is pending." });
                        break;
                    default:
                        res.json({ status: "204", message: "Consumer account is not active. Please contact to Administrator." });
                }
            }
        }
        else {
            res.json({ status: "204", message: "User not found!" })
        }
    })
}

exports.kycOrPermission = function (req, res, next) {
    var truID = req.body.totruid ? req.body.totruid : req.body.truid;
    var transType = req.body.transactiontype;
    KycAll.find({ $or: [{ truID: truID }, { CRNNo: req.body.crnno }] }, function (err, docs) {
        if (docs && docs.length > 0) {
            if (docs[0].KYCFlag == "active") {
                var KYCFlag = docs[0].docVerified == true ? "KYC" : "nonKYC";
                request.post({
                    "headers": { "content-type": "application/json" },
                    "url": conf.reqip + ":4125/api/showconsumerconfigurations",
                    "body": JSON.stringify({ "kycflag": KYCFlag, "appliedOn": "consumer", "truid": truID })
                }, (error, response, body) => {
                    if (error) {
                        res.json({ status: "500", message: "Internal Server Error" })
                    } else {
                        if (response.statusCode == 200) {
                            var resultpermission = JSON.parse(body);
                            if (resultpermission.status == "200") {
                                var permissionModule = resultpermission.resource.module;
                                funpermissionModule(permissionModule, transType, function (moduleres) {
                                    if (moduleres === "success") {
                                        next();
                                    } else {
                                        res.json({ status: "204", message: moduleres })
                                    }
                                });
                            } else {
                                res.json(JSON.parse(body))
                            }
                        } else {
                            res.json({ status: "204", message: "something went wrong" })
                        }
                    }
                });
            } else {
                switch (docs[0].KYCFlag) {
                    case "holder":
                        res.json({ status: "204", message: "Consumer account on hold" });
                        break;
                    case "pending":
                        res.json({ status: "204", message: "Consumer e-kyc is pending." });
                        break;
                    default:
                        res.json({ status: "204", message: "Consumer account is not active. Please contact to Administrator." });
                }
            }
        }
        else {
            res.json({ status: "204", message: "User not found!" })
        }
    })
}

exports.commonValidation = function (req, res, next) {
    var Gen = req.generalCharges;
    var truID = (req.body.transactiontype == 'transfer') ? req.body.fromtruid : req.body.totruid ? req.body.totruid : req.body.truid;
    var transType = req.body.transactiontype;
    KycAll.aggregate([{ $match: { $or: [{ truID: truID }, { CRNNo: req.body.crnno }] } }]).exec(function (err, docs) {
        if (docs && docs.length > 0) {
            if (docs[0].KYCFlag == "active") {
                var KYCFlag = docs[0].docVerified == true ? "KYC" : "nonKYC";
                var countrycode = docs[0].countryCode;
                var etruid = docs[0].refernceTruID;
                var panStatus = docs[0].panStatus;
                var clientTxnCharges = 0;
                if (etruid !== "Company" && etruid.substring(0, 4) === "8000") {
                    getentityCharges(etruid, "buy").then((charges) => {
                        clientTxnCharges = charges.trasactionCharges ? parseFloat(charges.trasactionCharges) : parseFloat(Gen.txnLoading);
                        nowValdt(clientTxnCharges)
                    })
                } else {
                    nowValdt(clientTxnCharges)
                }
                function nowValdt(clientTxnCharges) {
                    request.post({
                        "headers": { "content-type": "application/json" },
                        "url": conf.reqip + ":4125/api/showconsumerconfigurationsAll",
                        "body": JSON.stringify({ "kycflag": KYCFlag, "appliedOn": "consumer", referencetruid: docs[0].refernceTruID, "truid": truID })
                    }, (error, response, body) => {
                        if (error) {
                            res.json({ status: "500", message: "Internal Server Error" })
                        } else {
                            if (response.statusCode == 200) {
                                var resultpermission = JSON.parse(body);
                                if (resultpermission.status == "200") {
                                    var permissionModule = resultpermission.resource.module;
                                    funpermissionModule(permissionModule, transType, function (moduleres) {
                                        if (moduleres === "success") {
                                            var limit = JSON.parse(body).resource.limit;
                                            req.ConsumerConf = JSON.parse(body);
                                            switch (req.body.transactiontype) {
                                                case "buy":
                                                    validateAmt(limit.buyMin, limit.buyMax, limit.buySilverMin, limit.buySilverMax, "buy", clientTxnCharges, (bool) => {
                                                        if (bool.status) {
                                                            validatetxnlimit(truID, limit.buymaxAmtOfTxnInDay, limit.buymaxAmtOfTxnInMonth, limit.buymaxAmtOfTxnInHour,
                                                                limit.buytxnInterval, limit.buynoOfTxnInInterval, "buy", bool.txnAmt, req.body.status, null, null, function (translimitres) {
                                                                    if (translimitres === "200") {
                                                                        var valpanstat = validatePANTXN(bool.txnAmt, panStatus);
                                                                        if (valpanstat === true) {
                                                                            next();
                                                                        } else {
                                                                            res.json(valpanstat);
                                                                        }
                                                                    } else {
                                                                        res.json({ status: "4000", message: translimitres });
                                                                    }
                                                                });

                                                        }
                                                        else {
                                                            res.json({ status: "204", message: bool.message });
                                                        }

                                                    });

                                                    break;
                                                case "redeemCash":
                                                    validateAmt(limit.redeemCashMin, limit.redeemCashMax, limit.redeemCashSilverMin, limit.redeemCashSilverMax, "redeemCash", clientTxnCharges, (bool) => {
                                                        if (bool.status) {
                                                            validatetxnlimit(truID, limit.redeemCashmaxAmtOfTxnInDay, limit.redeemCashmaxAmtOfTxnInMonth, limit.redeemCashmaxAmtOfTxnInHour,
                                                                limit.redeemCashtxnInterval, limit.redeemCashnoOfTxnInInterval, "redeemCash", bool.txnAmt, req.body.status, bool.txnqty, limit.redeemCashsellAfterBuyInterval, function (translimitres) {
                                                                    if (translimitres === "200") {
                                                                        var valpanstat = validatePANTXN(bool.txnAmt, panStatus);
                                                                        if (valpanstat === true) {
                                                                            next();
                                                                        } else {
                                                                            res.json(valpanstat);
                                                                        }
                                                                    } else {
                                                                        res.json({ status: "4000", message: translimitres });
                                                                    }
                                                                });
                                                        }
                                                        else {
                                                            res.json({ status: "204", message: bool.message });
                                                        }
                                                    })
                                                    break;

                                                case "transfer":
                                                    var g24kqty = "0";
                                                    var s99pqty = "0";
                                                    if (req.body.g24qty) {
                                                        g24kqty = req.body.g24qty;
                                                    }
                                                    if (req.body.s99qty) {
                                                        s99pqty = req.body.s99qty;
                                                    }
                                                    // call Live rate api
                                                    req.txnfreeLimit = limit.transfertxnFreeLimit;
                                                    validateTransferAmt(limit.transferMin, limit.transferMax, limit.transferSilverMin, limit.transferSilverMax, g24kqty, s99pqty, clientTxnCharges, (bool) => {
                                                        if (bool.status) {
                                                            validatetxnlimit(truID, limit.transfermaxAmtOfTxnInDay, limit.transfermaxAmtOfTxnInMonth, limit.transfermaxAmtOfTxnInHour,
                                                                limit.transfertxnInterval, limit.transfernoOfTxnInInterval, "transfer", bool.txnAmt, req.body.status, null, null, function (translimitres) {
                                                                    if (translimitres === "200") {
                                                                        var valpanstat = validatePANTXN(bool.txnAmt, panStatus);
                                                                        if (valpanstat === true) {
                                                                            next();
                                                                        } else {
                                                                            res.json(valpanstat);
                                                                        }
                                                                    } else {
                                                                        res.json({ status: "4000", message: translimitres });
                                                                    }
                                                                });
                                                        }
                                                        else {
                                                            res.json({ status: "204", message: bool.message });
                                                        }
                                                    })

                                                    break;
                                                case "gift":
                                                    var g24kqty = "0";
                                                    var s99pqty = "0";
                                                    if (req.body.g24qty) {
                                                        g24kqty = req.body.g24qty;
                                                    }
                                                    if (req.body.s99qty) {
                                                        s99pqty = req.body.s99qty;
                                                    }
                                                    // call Live rate api
                                                    validateTransferAmt(limit.transferMin, limit.transferMax, limit.transferSilverMin, limit.transferSilverMax, g24kqty, s99pqty, clientTxnCharges, (bool) => {
                                                        if (bool.status) {
                                                            validatetxnlimit(truID, limit.transfermaxAmtOfTxnInDay, limit.transfermaxAmtOfTxnInMonth, limit.transfermaxAmtOfTxnInHour,
                                                                limit.transfertxnInterval, limit.transfernoOfTxnInInterval, "gift", bool.txnAmt, req.body.status, null, null, function (translimitres) {
                                                                    if (translimitres === "200") {
                                                                        req.txnfreeLimit = limit.transfertxnFreeLimit;
                                                                        var valpanstat = validatePANTXN(bool.txnAmt, panStatus);
                                                                        if (valpanstat === true) {
                                                                            next();
                                                                        } else {
                                                                            res.json(valpanstat);
                                                                        }
                                                                    } else {
                                                                        res.json({ status: "4000", message: translimitres });
                                                                    }
                                                                });
                                                        }
                                                        else {
                                                            res.json({ status: "204", message: bool.message });
                                                        }
                                                    });

                                                    break;

                                                default:
                                                    res.json({ status: "204", message: "something went wrong" })
                                            }
                                            async function validateTransferAmt(min, max, silvermin, silvermax, g24kqty, s99pqty, clientTxnCharges, callback) {
                                                // console.log("min, max, silvermin, silvermax", min, max, silvermin, silvermax)
                                                var g24kvalid = true;

                                                var s99pvalid = true;
                                                var g24kamt = 0;

                                                var s99pamt = 0;
                                                var bullions = "";
                                                var rate = await liveRateAPI(countrycode, clientTxnCharges);
                                                // console.log("rate", rate)
                                                var g24krate = parseFloat(rate.G24K),
                                                    s99prate = parseFloat(rate.S99P);

                                                if (g24kqty != "0" && parseFloat(g24kqty) > 0) {
                                                    g24kamt = useToFixed(parseFloat(g24kqty) * parseFloat(g24krate));
                                                    // console.log("g24kamt", parseFloat(g24kqty), g24kamt)
                                                    if (parseFloat(min) <= g24kamt && g24kamt <= parseFloat(max)) {
                                                        g24kvalid = true;
                                                    } else {
                                                        bullions += min + " to " + max + " for TruCoin Gold";
                                                        g24kvalid = false;
                                                    }
                                                }
                                                if (s99pqty != "0" && parseFloat(s99pqty) > 0) {
                                                    s99pamt = useToFixed(parseFloat(s99pqty) * parseFloat(s99prate))
                                                    if (parseFloat(silvermin) <= s99pamt && s99pamt <= parseFloat(silvermax)) {
                                                        s99pvalid = true;
                                                    } else {
                                                        bullions += silvermin + " to " + silvermax + " for TruCoin Silver";
                                                        s99pvalid = false;
                                                    }
                                                }
                                                if (g24kvalid && s99pvalid) {
                                                    // return true;
                                                    callback({
                                                        status: true,
                                                        txnAmt: useToFixed(g24kamt + s99pamt)
                                                    });
                                                } else {
                                                    res.json({ status: "411", message: "You can transfer of " + defaultConf.defaultCurrency + " " + bullions });
                                                    callback({ status: false });
                                                }
                                            }
                                            async function validatePaymentAmt(min, max, silvermin, silvermax, amount, bulliontype, callback) {
                                                // console.log("min, max, silvermin, silvermax", min, max, silvermin, silvermax)
                                                req.liverate = await liveRateAPI(countrycode, clientTxnCharges);
                                                var bullions = "Transaction amount must be in between ";
                                                if (bulliontype === "G24K") {
                                                    if (parseFloat(min) <= amount && amount <= parseFloat(max)) {
                                                        callback({
                                                            status: true,
                                                            txnAmt: amount
                                                        });
                                                    } else {
                                                        bullions += "₹" + min + " to ₹" + max + " for TruGold";
                                                        callback({ status: false, message: bullions });
                                                    }
                                                } else {
                                                    if (parseFloat(silvermin) <= amount && amount <= parseFloat(silvermax)) {
                                                        callback({
                                                            status: true,
                                                            txnAmt: amount
                                                        });
                                                    } else {
                                                        bullions += "₹" + silvermin + " to ₹" + silvermax + " for TruSilver";
                                                        callback({ status: false, message: bullions });
                                                    };
                                                }


                                            }
                                            async function validateAmt(min, max, silvermin, silvermax, type, clientcharges, callback) {
                                                var g24kvalid = true;
                                                var s99pvalid = true;
                                                var g24kamt = 0, s99pamt = 0;
                                                var g24kqty = 0, s99pqty = 0;
                                                var bullions = "";
                                                if (req.body.G24K.length) {
                                                    g24kqty = req.body.G24K[0].qty;
                                                    var g24kfromtruid = req.body.G24K[0].amTruID;
                                                    var g24krate = await reqassetmanagerRate(g24kfromtruid, "G24K", type, clientcharges);
                                                    g24kamt = useToFixed(parseFloat(g24kqty) * parseFloat(g24krate));
                                                    if (parseFloat(min) <= g24kamt && g24kamt <= parseFloat(max)) {
                                                        g24kvalid = true;
                                                    } else {
                                                        bullions += min + " to " + max + " for TruCoin Gold";
                                                        g24kvalid = false;
                                                    }
                                                }

                                                if (req.body.S99P.length) {
                                                    s99pqty = req.body.S99P[0].qty;
                                                    var s99pfromtruid = req.body.S99P[0].amTruID;
                                                    var s99prate = await reqassetmanagerRate(s99pfromtruid, "S99P", type, clientcharges);
                                                    s99pamt = useToFixed(parseFloat(s99pqty) * parseFloat(s99prate));
                                                    if (parseFloat(silvermin) <= s99pamt && s99pamt <= parseFloat(silvermax)) {
                                                        s99pvalid = true;
                                                    } else {
                                                        bullions += silvermin + " to " + silvermax + " for TruCoin Silver";
                                                        s99pvalid = false;
                                                    }
                                                }
                                                if (g24kvalid && s99pvalid) {
                                                    callback({
                                                        status: true,
                                                        txnAmt: useToFixed(g24kamt + s99pamt),
                                                        txnqty: {
                                                            G24K: parseFloat(g24kqty),
                                                            S99P: parseFloat(s99pqty)
                                                        },
                                                    });
                                                } else {
                                                    var tntType = (type === "redeem" || type === "redeemCash") ? "Sell" : "purchase";
                                                    res.json({ status: "411", message: "You can " + tntType + " of " + defaultConf.defaultCurrency + " " + bullions });
                                                    // return false;
                                                    callback({
                                                        status: false
                                                    });
                                                }
                                            }


                                            async function validateQTY(min, max, silvermin, silvermax, g24qty, s99qty, callback) {
                                                var g24kvalid = true;
                                                var s99pvalid = true;
                                                var g24kamt = 0, s99pamt = 0;
                                                var bullions = "";
                                                var rate = await liveRateAPI(countrycode);
                                                // console.log("rate", rate)
                                                var g24krate = parseFloat(rate.G24K),
                                                    s99prate = parseFloat(rate.S99P);
                                                if (g24qty != "0") {
                                                    var g24kqty = parseFloat(g24qty);
                                                    g24kamt = useToFixed(parseFloat(g24kqty) * parseFloat(g24krate));
                                                    if (parseFloat(min) <= g24kqty && g24kqty <= parseFloat(max)) {
                                                        g24kvalid = true;
                                                    } else {
                                                        bullions += min + " gms to " + max + " gms of TruCoin Gold";
                                                        g24kvalid = false;
                                                    }
                                                }
                                                if (s99qty != "0") {
                                                    var s99pqty = parseFloat(s99qty);
                                                    s99pamt = useToFixed(parseFloat(s99pqty) * parseFloat(s99prate));
                                                    if (parseFloat(silvermin) <= s99pqty && s99pqty <= parseFloat(silvermax)) {
                                                        s99pvalid = true;
                                                    } else {
                                                        bullions += silvermin + " gms to " + silvermax + " gms of TruCoin Silver";
                                                        s99pvalid = false;
                                                    }
                                                }
                                                if (g24kvalid && s99pvalid) {
                                                    // return true;
                                                    callback({
                                                        status: true,
                                                        txnAmt: useToFixed(g24kamt + s99pamt)
                                                    });
                                                } else {
                                                    res.json({ status: "411", message: "You can Convert of " + bullions });
                                                    // return false;
                                                    callback({ status: false });
                                                }
                                            }

                                            async function getAmountByQty(bultype, countryCode, transactiontype, val, clttxncharges, callback) {
                                                var rate = await reqassetmanagerRate(bultype, countryCode, transactiontype, clttxncharges);
                                                var amt = parseFloat(val);
                                                if (transactiontype == "sell") {
                                                    amt = parseFloat(val) * parseFloat(rate);
                                                }
                                                if (transactiontype == "buy") {
                                                    amt = parseFloat(val) * parseFloat(rate);
                                                }
                                                if (transactiontype == "transfer") {
                                                    amt = parseFloat(val) * parseFloat(rate);
                                                }
                                                callback(amt);
                                            }

                                            function reqassetmanagerRate(fromtruid, bulltype, type, clientcharges) {
                                                return new Promise((resolve, reject) => {
                                                    var reqIP;
                                                    if (type == "redeemCash") {
                                                        reqIP = ":4125/api/listratecustredeemcashbullions"
                                                    } else {
                                                        reqIP = ":4125/api/listratecustbuybullions"
                                                    }


                                                    request.post({
                                                        "headers": { "content-type": "application/json" },
                                                        "url": conf.reqip + reqIP,
                                                        "body": JSON.stringify({
                                                            "truid": fromtruid,
                                                            "bulltype": bulltype,
                                                            "clientcharges": clientcharges ? clientcharges : 0
                                                        })
                                                    }, (error, response, body) => {
                                                        if (error) {
                                                            resolve("0");
                                                        }
                                                        else {
                                                            if (JSON.parse(body).status == "200") {
                                                                var rate = JSON.parse(body).resource;
                                                                resolve(rate);
                                                            }
                                                            else {
                                                                res.json(JSON.parse(body));
                                                            }
                                                        }
                                                    })
                                                })
                                            }


                                        } else {
                                            res.json({ status: "204", message: moduleres })
                                        }
                                    });
                                } else {
                                    res.json(JSON.parse(body))
                                }
                            } else {
                                res.json({ status: "204", message: "something went wrong" })
                            }
                        }

                    });
                }

            } else {
                switch (docs[0].KYCFlag) {
                    case "holder":
                        res.json({ status: "204", message: "Consumer account on hold" });
                        break;
                    case "pending":
                        res.json({ status: "204", message: "Consumer e-kyc is pending." });
                        break;
                    default:
                        res.json({ status: "204", message: "Consumer account is not active. Please contact to Administrator." });
                }
            }
        }
        else {
            res.json({ status: "204", message: "User not found!" })
        }
    })
}

exports.commonValidationforreceiver = function (req, res, next) {
    var truID = req.body.receiver;
    if (truID.substring(0, 4) !== "8000" && truID.substring(0, 4) !== "8111") {
        var Gen = req.generalCharges;
        var transType = req.body.transactiontype;
        KycAll.aggregate([{ $match: { truID: truID } }]).exec(function (err, docs) {
            if (docs && docs.length > 0) {
                if (docs[0].KYCFlag == "active") {
                    var KYCFlag = docs[0].docVerified == true ? "KYC" : "nonKYC";
                    var etruid = docs[0].refernceTruID;
                    var panStatus = docs[0].panStatus;
                    var clientTxnCharges = 0;
                    if (etruid !== "Company" && etruid.substring(0, 4) === "8000") {
                        getentityCharges(etruid, "buy").then((charges) => {
                            clientTxnCharges = charges.trasactionCharges ? parseFloat(charges.trasactionCharges) : parseFloat(Gen.txnLoading);
                            nowValdt(clientTxnCharges)
                        })
                    } else {
                        nowValdt(clientTxnCharges)
                    }
                    function nowValdt(clientTxnCharges) {
                        var jsonconf = { "kycflag": KYCFlag, "appliedOn": "consumer", "truid": truID };
                        if (etruid !== "Company" && etruid.substring(0, 4) === "8000") {
                            jsonconf.referencetruid = docs[0].refernceTruID;
                        }
                        request.post({
                            "headers": { "content-type": "application/json" },
                            "url": conf.reqip + ":4125/api/showconsumerconfigurationsAll",
                            "body": JSON.stringify(jsonconf)
                        }, (error, response, body) => {
                            if (error) {
                                res.json({ status: "500", message: "Internal Server Error" })
                            } else {
                                if (response.statusCode == 200) {
                                    var resultpermission = JSON.parse(body);
                                    if (resultpermission.status == "200") {
                                        var permissionModule = resultpermission.resource.module;
                                        funpermissionModule(permissionModule, transType, function (moduleres) {
                                            if (moduleres === "success") {
                                                var limit = JSON.parse(body).resource.limit;
                                                req.ConsumerConf = JSON.parse(body);
                                                var txnsType = req.body.receiver.includes("8000") ? "payment" : "transfer";
                                                validatePaymentAmt(limit[txnsType + "Min"], limit[txnsType + "Max"], limit[txnsType + "SilverMin"], limit[txnsType + "SilverMax"], req.body.amount, req.body.bulliontype, (bool) => {
                                                    if (bool.status) {
                                                        validatetxnlimit(truID, limit[txnsType + "maxAmtOfTxnInDay"], limit[txnsType + "maxAmtOfTxnInMonth"], limit[txnsType + "maxAmtOfTxnInHour"],
                                                            limit[txnsType + "txnInterval"], limit[txnsType + "noOfTxnInInterval"], txnsType, req.body.amount, req.body.status, null, null, function (translimitres) {
                                                                if (translimitres === "200") {
                                                                    var valpanstat = validatePANTXN(bool.txnAmt, panStatus);
                                                                    if (valpanstat === true) {
                                                                        next();
                                                                    } else {
                                                                        res.json({ status: "204", message: "Pan verification failed at receiver end" });
                                                                    }
                                                                } else {
                                                                    res.json({ status: "204", message: translimitres });
                                                                }
                                                            });
                                                    } else {
                                                        res.json({ status: "204", message: bool.message });
                                                    }
                                                })
                                                async function validatePaymentAmt(min, max, silvermin, silvermax, amount, bulliontype, callback) {
                                                    // console.log("min, max, silvermin, silvermax", min, max, silvermin, silvermax)
                                                    // req.liverate = await liveRateAPI(countrycode, clientTxnCharges);
                                                    var bullions = "";
                                                    if (bulliontype === "G24K") {
                                                        if (parseFloat(min) <= amount && amount <= parseFloat(max)) {
                                                            callback({
                                                                status: true,
                                                                txnAmt: amount
                                                            });
                                                        } else {
                                                            bullions += min + " to " + max + " for TruCoin Gold";
                                                            callback({ status: false, message: bullions });
                                                        }
                                                    } else {
                                                        if (parseFloat(silvermin) <= amount && amount <= parseFloat(silvermax)) {
                                                            callback({
                                                                status: true,
                                                                txnAmt: amount
                                                            });
                                                        } else {
                                                            bullions += silvermin + " to " + silvermax + " for TruCoin Silver";
                                                            callback({ status: false, message: bullions });
                                                        };
                                                    }
                                                }
                                            } else {
                                                res.json({ status: "204", message: moduleres })
                                            }
                                        });
                                    } else {
                                        res.json(JSON.parse(body))
                                    }
                                } else {
                                    res.json({ status: "204", message: "something went wrong" })
                                }
                            }

                        });
                    }

                } else {
                    switch (docs[0].KYCFlag) {
                        case "holder":
                            res.json({ status: "204", message: "Consumer account on hold" });
                            break;
                        case "pending":
                            res.json({ status: "204", message: "Consumer e-kyc is pending." });
                            break;
                        default:
                            res.json({ status: "204", message: "Consumer account is not active. Please contact to Administrator." });
                    }
                }
            }
            else {
                res.json({ status: "204", message: "User not found!" })
            }
        })
    } else {
        next();
    }
}


function funpermissionModule(moduleper, tType, callback) {
    var permissionVal = moduleper[tType];
    switch (permissionVal) {
        case "hide":
            callback("You don't have permission. Please contact to Administrator!");
            break;
        case "allow":
            callback("success");
            break;
        case "comingsoon":
            callback("Stay tuned. We are launching soon!");
            break;
        case "maintenance":
            callback("This process is under Maintaince now. Please try after some time!");
            break;
        case "closed":
            callback("You don't have permission. Please contact to Administrator!");
            break;
        case "disabled":
            callback("Consumer has been blocked by the admin.Please Contact Administrative");
            break;
        default:
            callback("You don't have permission. Please contact to Administrator!");

    }
}

function liveRateAPI(ccode, clientcharges) {
    return new Promise((resolve, reject) => {
        request.post({
            "headers": { "content-type": "application/json" },
            "url": conf.reqip + ":4125/api/readliveratefromassetmanager",
            "body": JSON.stringify({
                "countrycode": ccode,
                clientTxnLoading: clientcharges ? clientcharges : 0
            })
        }, (error, response, body) => {
            if (error) {
                resolve("0");
            }
            else {
                if (JSON.parse(body).status == "200") {
                    var rate = JSON.parse(body).resource;
                    resolve(rate);
                }
                else {
                    res.json(JSON.parse(body));
                }
            }
        })
    })
}

function getliverate(countrycode, clientCharges) {
    return new Promise((resolve, reject) => {
        request.post({
            "headers": { "content-type": "application/json" },
            "url": conf.reqip + ":4125/api/liveratefortxn",
            "body": JSON.stringify({
                "countrycode": countrycode,
                "clientcharges": clientCharges ? clientCharges : "0"
            })
        }, (error, response, body) => {
            if (error) {
                return console.dir(error);
            } else {
                var newjson = JSON.parse(body);
                resolve(newjson);
            }
        });
    })
}

function getentityCharges(etruid, type) {
    return new Promise((resolve, reject) => {
        request.post({
            "headers": { "content-type": "application/json" },
            "url": conf.reqip + ":4121/api/entityRevenuechargesHistory",
            "body": JSON.stringify({
                "truid": etruid,
                "type": type
            })
        }, (error, response, body) => {
            if (error) {
                return console.dir(error);
            }
            else {
                var respJs = JSON.parse(body);
                if (respJs.status == "200") {
                    var charges = JSON.parse(body).resource.length !== 0 ? JSON.parse(body).resource : [{ isParent: JSON.parse(body).isParent }];
                    JSON.parse(body).resource.length !== 0 ? charges[0].isParent = JSON.parse(body).isParent : "";
                    resolve(charges[0]);
                } else {
                    resolve({});
                }

            }
        })
    })
}
