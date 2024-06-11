'use strict'
var request = require('request');
var conf = require("../config");
module.exports = (req, res, next) => {
    var clientID = req.body.clientID;
    var ttype = (req.body.transactionType === "sell" || req.body.transactionType === "sellCash") ? "redeemCash" : req.body.transactionType;
    if (clientID && clientID.length == 8) {
        request.post({
            "headers": { "content-type": "application/json" },
            "url": conf.reqip + ":4121/api/checkClientcharges",
            "body": JSON.stringify({
                "crnno": clientID,
                "ttype" : ttype
            })
        }, (error, response, body) => {
            var newclient = JSON.parse(body);
            if (newclient.status == "1000") {
                req.isParent = newclient.resource.isParent;
                req.parentTruID = newclient.resource.parentTruID;
                req.rtruid = newclient.resource.truID;
                req.MID = newclient.resource.MID;
                if (newclient.resource.charges) { 
                    req.partnerCharges = newclient.resource.charges.partnerCharges ? parseFloat(newclient.resource.charges.partnerCharges) : 0;
                    req.nodeCharges = newclient.resource.charges.nodeCharges ? parseFloat(newclient.resource.charges.nodeCharges) : 0;
                    req.trasactionCharges = newclient.resource.charges.trasactionCharges ? parseFloat(newclient.resource.charges.trasactionCharges) : 0;
                    next()
                } else {
                    req.partnerCharges=0;
                    req.nodeCharges=0;
                    req.trasactionCharges=0;
                    next()
                }
            } else {
                res.status(411).json({ status: "411", message: "Invalid Client Id" });
            }
        })
    } else {
        res.status(411).json({ status: "411", message: "Please provide valid fields..!!" })
    }
}