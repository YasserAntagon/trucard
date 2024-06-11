
var config = require('../config/config');
var machinHash = require('../config/machinHash');
var request = require('request');
module.exports = {
    emailSubscribeDB: function (json, callreg) {
        try {
            request.post({
                "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
                "url": config.url + "/294",
                "body": json,
            }, (error, res, body) => {
                try {
                    if (error) {
                        callreg(error, null)
                    }
                    else {
                        callreg(null, JSON.parse(body));
                    }
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
    getEmailSubscriber: function (json, callreg) {
        try {
            request.post({
                "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
                "url": config.url + "/295",
                "body": json,
            }, (error, res, body) => {
                try {
                    if (error) {
                        callreg(error, null)
                    }
                    else {
                        callreg(null, JSON.parse(body));
                    }

                }
                catch (ex) {
                    callreg(null, { "status": 903, message: "Something went wrong. Please try after some time!!" });
                }
            });
        }
        catch (ex) {
            callreg(null, { "status": 904, message: "Request error" });
        }
    }

}
