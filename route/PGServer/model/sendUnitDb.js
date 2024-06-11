var config = require('../model/config/config');
var token = require('../model/config/bearerToken');
var request = require('request');
module.exports = {
    sendUnit: function (truid,userType, callback) {
        try {
            var source = userType == "B2BConsumer" ? config.enurl+"/503" : config.custurl+"/36";
            let tokens = userType == "B2BConsumer" ? token.clientConsumer : token.ApIsTokEn11;
            request.post({
                "headers": { "content-type": "application/json", "Authorization": "Bearer " + tokens },    // Transfer Unit
                "url": source,
                "body": truid
            }, (error, res, body) => {
                try {
                    if (error) {
                        // //console.log(error);
                        callback(error, null);
                        return false;
                    }
                    // //console.log(JSON.parse(body));
                    callback(null, JSON.parse(body));
                }
                catch (ex) {
                    callback(null, { "status": 902, message: "Something went wrong. Please try after some time!!" });
                }
            }
            );
        }
        catch (ex) {
            callback(null, { "status": 903, message: "Request error" });
        }
    }
}