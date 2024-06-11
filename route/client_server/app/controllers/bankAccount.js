
'use strict'
var request = require('request');
var conf = require("../config");
var tokenUpdate = require("../config/tokenUpdate");
exports.fourHundredTwelve = function (req, res) {
    var truid = req.truID;
    var ifsc = req.body.IFSC;
    var accHolderName = req.body.accountHolderName;
    var accountno = req.body.accountNo;
    var acctype = "beneficiary";
    var relationship = req.body.relationship.toLowerCase();
    if ((ifsc && ifsc.length == 11) &&
        (accHolderName && accHolderName.length >= 0 && accHolderName.length <= 50) &&
        (relationship && (relationship === "self"
            || relationship === "father"
            || relationship === "mother"
            || relationship === "brother"
            || relationship === "sister"
            || relationship === "wife"
            || relationship === "son"
            || relationship === "daughter"
            || relationship === "other"
        )) && (accountno && accountno.length >= 0 && accountno.length <= 18)) {
        request.post({
            "headers": { "content-type": "application/json", "Authorization": "Bearer " + conf.bearer8 },
            "url": conf.ifscurl + "/ifsc",
            "body": JSON.stringify({ "truID": truid, "IFSC": ifsc })
        }, (error, response, body) => {
            if (error) {
                return console.dir(error);
            }
            var ifscStatus = JSON.parse(body);
            if (ifscStatus.status == "200") {
                var ifscresp = ifscStatus.resource; 
                request.post({
                    "headers": { "content-type": "application/json" },
                    "url": conf.reqip + ":4113/api/mopaccount",
                    "body": JSON.stringify({
                        "truid": truid,
                        "bname": ifscresp.BANK,
                        "ifsc": ifscresp.IFSC,
                        "custname": accHolderName,
                        "accountno": accountno,
                        "acctype": acctype,
                        "relationship": relationship
                    })
                }, (error, response, body) => {
                    if (error) {
                        return console.dir(error);
                    }
                    var newjson = JSON.parse(body);
                    if (newjson.status == "200") {
                        var account = newjson.resource.accountDetails;
                    
                        const result = account.map(({ userAdded, status, _id, accType, custName,dateAdded, ...rest }) => ({ ...rest, accountHolderName: custName,createDate: new Date(parseInt(dateAdded)) }));
                        res.status(200).json({ status: "200", resource: result });
                    }
                    else {
                        res.status(411).json(newjson);
                    }
                });
            } else {
                res.status(411).json({ status: "411", message: ifscresp.message })
            }
        })
    }
    else {
        res.status(411).json({ status: "411", message: "Please provide valid fields..!!" })
    }
};
exports.fourHundredThirteen = function (req, res) {
    var truid = req.truID;
    var acctype = "both"; 
        request.post({
            "headers": { "content-type": "application/json" },
            "url": conf.reqip + ":4113/api/listaccount",
            "body": JSON.stringify({
                "truid": truid,
                "acctype": acctype
            })
        }, (error, response, body) => {
            if (error) {
                return console.dir(error);
            }
            var newjson = JSON.parse(body);
            if (newjson.status == "1000") {
                var account = newjson.resource.accountDetails;            
                const result = account.map(({ userAdded, status, _id, accType, custName,dateAdded, ...rest }) => ({ ...rest, accountHolderName: custName,createDate: new Date(parseInt(dateAdded)) }));
               
                    tokenUpdate(req); 
                res.status(200).json({ status: "200", resource: result });
            }
            else {
                res.status(411).json(newjson);
            }
        });
     
};

