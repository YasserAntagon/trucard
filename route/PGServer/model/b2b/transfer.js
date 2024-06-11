var config = require('../../model/config/config');
var token = require('../../model/config/bearerToken');
var request = require('request');
module.exports = { 
    submitTransferDb: function (truid,scr, callback) 
    {
        try 
        { 
            request.post({
                "headers": { "content-type": "application/json", "Authorization": "Bearer " + token.sendUnitToken },     // Submit Bullion
                "url": config.enurl + "/49",
                "body": truid
            }, (error, res, body) => {
                try {
                    if (error) {
                        callback(error, null);
                        return false;
                    }
                    callback(null, JSON.parse(body));
                }
                catch (ex) {
                    callback(null, { "status": 902, message: "Something went wrong. Please try after some time!!" });
                }
            });
        }
        catch (ex) {
            callback(null, { "status": 903, message: "Request error" });
        }
    },
}