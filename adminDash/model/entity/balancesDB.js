/*!
 File: AssetManager Node / Branch List
 Edited : Nikhil Bharambe
 Dated : 14-05-2019
 */

var config = require('../config/config');
var machinHash = require('../config/machinHash');
var request = require('request');
module.exports = {
    setOnHoldBalance: function (data, callback)    //Set OnHold Balance
    {
        try {
            request.post({
                "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
                "url": config.url + "/326",
                "body": data
            }, (error, res, body) => {
                try {
                    if (error) {
                        callback(error, null);
                        return false;
                    }
                    callback(null, JSON.parse(body));
                }
                catch (ex) {
                    let err = {
                        "status": 401,
                        "message": ex.message
                    }
                    callback(null, err);
                    return false;
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
            return false;
        }
    },
    getOnHoldBalance: function (data, callback)    //Get OnHold Balance
    {
        try {
            request.post({
                "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
                "url": config.url + "/327",
                "body": data
            }, (error, res, body) => {
                try {
                    if (error) {
                        callback(error, null);
                        return false;
                    }

                    callback(null, JSON.parse(body));
                }
                catch (ex) {
                    let err = {
                        "status": 401,
                        "message": ex.message
                    }
                    callback(null, err);
                    return false;
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
            return false;
        }
    } 
}