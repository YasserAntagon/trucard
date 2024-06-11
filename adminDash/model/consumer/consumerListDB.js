var request = require('request');
var config = require('../config/config'); 
var machinHash = require('../config/machinHash');
module.exports = {
    consumerListExc: function (truid, callback) {
        try {
            request.post({
                "headers": { "content-type": "application/json", "mhash": machinHash.mHash },     // Network Map
                "url": config.url + "/309",
                "body": truid
            }, (error, res, body) => {
                try 
                {
                    if (error) {
                        callback(error, null);
                        return false;
                    }
                    else {
                        callback(null, body);
                    }
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
