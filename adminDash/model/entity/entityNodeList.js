/*!
 File: AssetManager Node / Branch List
 Edited : Nikhil Bharambe
 Dated : 14-05-2019
 */

var config = require('../config/config');
var machinHash = require('../config/machinHash');
var request = require('request');
module.exports = {
    getAllNodeData: function (data, callback)    // Get All Node List
    {
        try {
            request.post({
                "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
                "url": config.url + "/157",
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
    getAllCity: function (data, callback)    // Get All Node List
    {
        try {
            request.post({
                "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
                "url": config.url + "/166",
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
    getAllconsumerData: function (data, callback)    // Get All Node List
    {
        try {
            request.post({
                "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
                "url": config.url + "/174",
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
        }
    },
    getEntityList: function (json, callback) {
        //                                 // Simple Call transaction History
        try {
            request.post({
                "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
                "url": config.url + "/178",
                "body": json
            }, (error, res, body) => {
                try {
                    if (error) {
                        callback(error, null);
                        return false;
                    }
                    //   // console.log("getSummary Status",JSON.parse(body));     
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
}