var config = require('../config/config');
var token = require('../config/bearerToken');
var request = require('request');
module.exports = { 
    addMoney: function (json, callreg) {
        try {
            request.post({
                "headers": { "content-type": "application/json", "Authorization": "Bearer " + token.addmoney },
                "url": config.enurl + "/76",
                "body": json
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

    }
}