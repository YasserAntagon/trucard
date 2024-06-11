'use strict'
var request = require('request');
var conf = require("../config");
module.exports = (req, res, next) => {
    var clientID = req.body.clientID;
    if (clientID && clientID.length == 8) {
        request.post({
            "headers": { "content-type": "application/json" },
            "url": conf.reqip + ":4121/api/checkClientExistOrNot",
            "body": JSON.stringify({ "crnno": clientID })
        }, (error, response, body) => {
            if (error) { 
                res.status(500).json({ status: 500, message: "Internal server error" });
            }
            else if (response.statusCode === 200) {
                var newclient = JSON.parse(body);
                if (newclient.status == "1000") {
                    req.rtruid = newclient.resource.truID;
                    req.MID= newclient.resource.MID;
                    req.companyName= newclient.resource.truID;
                    next()
                }
                else {
                    res.status(411).json({ status: "411", message: "Invalid Client Id" });
                }
            }
            else {
                res.status(411).json({ status: "411", message: "Invalid Client Id" });
            }
        })
    } else {
        res.status(411).json({ status: "411", message: "Please provide valid fields..!!" })
    }
}