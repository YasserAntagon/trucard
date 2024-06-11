var config = require('../config/config');
var machinHash = require('../config/machinHash');
var request = require('request');
module.exports = {
    getEmpProfile: function (data, callback)    // save Employee Details
    {
        try {
            request.post({
                "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
                "url": config.url + "/106",
                "body": data
            }, (error, res, body) => {
                try {
                    if (error) {
                        callback(error, null);
                    }

                    callback(null, JSON.parse(body));
                }
                catch (ex) {
                    let err = {
                        "status": 401,
                        "message": ex.message
                    }
                    callback(null, err);
                }
            }
            );
        }
        catch (ex) {
            let err = {
                "status": 401,
                "message": ex.message
            }
            callback(null, err);
        }
    }
}