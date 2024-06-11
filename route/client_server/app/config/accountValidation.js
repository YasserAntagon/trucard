'use strict'
var request = require('request');
var conf = require("../config");
module.exports = (req, res, next) => {
    var account = req.body.accountno;
    var truID = req.truID;
    var MOP = req.body.MOP;
    var status = req.body.status;
    if (MOP == "payout" && status == "success") {
        if (account && account != "") {
            request.post({
                "headers": { "content-type": "application/json" },
                "url": conf.reqip + ":4114/api/clientcheckaccountDetails",
                "body": JSON.stringify({
                    "accountno": account,
                    "totruid": truID
                })
            }, (error, response, body) => {
                var newclient = JSON.parse(body);
                if (newclient.status == "1000") 
                {
                    req.accountdetails = newclient.resource;
                    next(); 
                } else {
                    res.status(411).json(newclient);
                }
            })
        }
        else {
            res.status(411).json({ status: "411", message: "Please provide valid account number..!!" })
        }
    }
    else {
        next()
    }
}