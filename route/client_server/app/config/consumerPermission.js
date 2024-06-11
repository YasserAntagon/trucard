/**
 * Author:    Nikhil Bharambe
 * Created:   27-Oct-2021
 * 
 * (c) Copyright by Company Name.
 **/
'use strict'
var request = require('request');
var conf = require("../config");

module.exports = (req, res, next) => {
    var truID = req.body.truID;
    var tType = req.body.tType ? req.body.tType : req.body.transactionType ? req.body.transactionType : undefined;
    request.post({
        "headers": { "content-type": "application/json" },
        "url": conf.reqip + ":4125/api/checkPermission",
        "body": JSON.stringify({
            "truID": truID
        })
    }, (error, response, body) => {
        if (error) {
            return console.dir(error);
        }
        var newjson = JSON.parse(body);
        if (response.statusCode === 200) {
            switch (tType) {
                case "buy":
                    if (newjson.buy === undefined) {
                        next();
                    }
                    else if (newjson.buy === true) {
                        next();
                    } else {
                        res.json({ status: "402", Message: "You dont have access for buy" })
                    }
                    break;
                case "sell":
                    if (newjson.sell === undefined) {
                        next();
                    }
                    else if (newjson.sell === true) {
                        next();
                    } else {
                        res.json({ status: "402", Message: "You dont have access for sell" })
                    }
                    break;
                case "transfer":
                    if (newjson.transfer === undefined) {
                        next();
                    }
                    else if (newjson.transfer === true) {
                        next()
                    } else {
                        res.json({ status: "402", Message: "You dont have access for transfer" })
                    }
                    break;
                case "addMoney":
                    if (newjson.addMoney === undefined) {
                        next();
                    }
                    else if (newjson.addMoney === true) {
                        next();
                    } else {
                        res.json({ status: "402", Message: "You dont have access for addMoney" })
                    }
                    break;
                case "purchase":
                    if (newjson.purchase === undefined) {
                        next();
                    }
                    else if (newjson.purchase === true) {
                        next();
                    } else {
                        res.json({ status: "402", Message: "You dont have access for purchase" })
                    }
                    break;
                case "walletToBank":
                    if (newjson.walletToBank === undefined) {
                        next();
                    }
                    else if (newjson.walletToBank === true) {
                        next();
                    } else {
                        res.json({ status: "402", Message: "You dont have access for walletToBank" })
                    }
                    break;
                case "other":
                    if (newjson.other === undefined) {
                        next();
                    }
                    else if (newjson.other === true) {
                        next();
                    } else {
                        res.json({ status: "402", Message: "You dont have access for other" })
                    }
                    break;
                case "TPIN":
                    if (newjson.TPIN === undefined) {
                        next();
                    }
                    else if (newjson.TPIN === true) {
                        next();
                    } else {
                        res.json({ status: "402", Message: "You dont have access for TPIN" })
                    }
                    break;
                case "other":
                    if (newjson.other === undefined) {
                        next();
                    }
                    else if (newjson.other === true) {
                        next();
                    } else {
                        res.json({ status: "402", Message: "You dont have access for other" })
                    }
                    break;
                case "fpassword":
                    if (newjson.fpassword === undefined) {
                        next();
                    }
                    else if (newjson.fpassword === true) {
                        next();
                    } else {
                        res.json({ status: "402", Message: "You dont have access for fpassword" })
                    }
                    break;
                case "linkbank":
                    if (newjson.linkbank === undefined) {
                        next();
                    }
                    else if (newjson.linkbank === true) {
                        next();
                    } else {
                        res.json({ status: "402", Message: "You dont have access for linkbank" })
                    }
                    break;
                case "addpayee":
                    if (newjson.addpayee === undefined) {
                        next();
                    }
                    else if (newjson.addpayee === true) {
                        next();
                    } else {
                        res.json({ status: "402", Message: "You dont have access for addpayee" })
                    }
                    break;
                case "wallet":
                    if (newjson.wallet === undefined) {
                        next();
                    }
                    else if (newjson.wallet === true) {
                        next();
                    } else {
                        res.json({ status: "402", Message: "You dont have access for wallet" })
                    }
                    break;
                case "KYC":
                    if (newjson.KYC === undefined) {
                        next();
                    }
                    else if (newjson.KYC === true) {
                        next();
                    } else {
                        res.json({ status: "402", Message: "You dont have access for KYC" })
                    }
                    break;
                case "profile":
                    if (newjson.profile === undefined) {
                        next();
                    }
                    else if (newjson.profile === true) {
                        next();
                    } else {
                        res.json({ status: "402", Message: "You dont have access for profile" })
                    }
                    break;
                default:
                    res.json({ status: "402", Message: "Please check AccessType.." });
            }
        }
    })
}