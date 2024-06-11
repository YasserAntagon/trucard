var config = require('../model/config/config');
var token = require('../model/config/bearerToken');
var request = require('request');
module.exports = {
    getConfig: function (json, callreg) {
        try {
            request.post({
                "headers": { "content-type": "application/json", "Authorization": "Bearer " + token.ApIsTokEn43 },
                "url": config.custurl + "/129",
                "body": json,
            }, (error, res, body) => {
                try {
                    if (error) {
                        callreg(error, null)
                        return false;
                    }
                    callreg(null, JSON.parse(body));
                }
                catch (ex) {
                    callreg(null, { "status": 902, message: "Something went wrong. Please try after some time!!" });
                }
            });
        }
        catch (ex) {
            callreg(null, { "status": 903, message: "Request error" });
        }
    },
    getCharges: function (json, callreg) {
        try {
            request.post({
                "headers": { "content-type": "application/json", "Authorization": "Bearer " + token.ApIsTokEn50 },
                "url": config.custurl + "/124",
                "body": json,
            }, (error, res, body) => {
                try {
                    if (error) {
                        callreg(error, null)
                        return false;
                    }
                    callreg(null, JSON.parse(body));
                }
                catch (ex) {
                    callreg(null, { "status": 902, message: "Something went wrong. Please try after some time!!" });
                }
            });
        }
        catch (ex) {
            callreg(null, { "status": 903, message: "Request error" });
        }
    },
}
