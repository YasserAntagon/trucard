
var request = require('request');
var config = require('../config/config');
var machinHash = require('../config/machinHash'); 
module.exports =
{
    SignMIn: function (req, callbacksign) {
        try {
            request.post({
                "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
                "url": config.url + "/101",
                "body": req,
            }, (error, res, body) => { 

                if (error) {
                    callbacksign(error, { status: 404 });
                }
                else {
                    if (res.statusCode == 200) {
                        var json = JSON.parse(body);
                        callbacksign(null, json);
                    }
                    else {
                        callbacksign(null, { status: 404 });
                    }
                }
            }
            );
        }
        catch (ex) {
            let err = {
                "status": 401,
                "message": ex.message
            }
            callbacksign(null, err);
        }
    }
}

