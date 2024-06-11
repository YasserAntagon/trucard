'use strict'
var request = require('request');
var conf = require("../config");
module.exports = (req, res, next) => {
    var json = {};
    if (req.body.CRNNo) {
        json = { "crnno": req.body.CRNNo };
        checkConsumer();
    }
    else if (req.body.fName && req.body.lName && req.body.mobile) {
        json = {
            "fName": req.body.fName,
            "lName": req.body.lName,
            "mobile": req.body.mobile
        };
        checkConsumer();
    }
    else{
        res.status(411).json({ status: "411", message: "Invalid Request" });
    }
    function checkConsumer() {
        if ((req.body.CRNNo && req.body.CRNNo.length >= 8) || req.body.mobile && req.body.mobile.length == 10) {
            request.post({
                "headers": { "content-type": "application/json" },
                "url": conf.reqip + ":4112/api/checkconsumer",
                "body": JSON.stringify(json)
            }, (error, response, body) => {
                if (error) {
                    res.status(500).json({ status: "500", message: "Internal server error" });
                }
                else {
                    var consumernewjson = JSON.parse(body);
                    if (response.statusCode === 200) {
                        if (consumernewjson.status == "1000") {
                            req.truID = consumernewjson.resource.truID;
                            req.mobile = consumernewjson.resource.mobile;
                            req.CRNNo = consumernewjson.resource.CRNNo;
                            next();
                        }
                        else {
                            res.status(411).json({ status: "411", message: response.message });
                        }
                    }
                    else {
                        res.status(411).json({ status: "411", message: "Invalid Consumer CRNNo" });
                    }
                }
            })
        }
        else {
            res.status(411).json({ status: "411", message: "Invalid Request" });
        }
    }
}