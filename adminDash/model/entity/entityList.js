/*!
 File: AssetManager Node / Branch List
 Edited : Nikhil Bharambe
 Dated : 14-05-2019
 */

var config = require('../config/config');
var machinHash = require('../config/machinHash');
var request = require('request');
module.exports = {
    getEntityListDB: function (data, callback)    // Get All Node List
    {
        try {
            request.post({
                "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
                "url": config.url + "/237",   //old api 203
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