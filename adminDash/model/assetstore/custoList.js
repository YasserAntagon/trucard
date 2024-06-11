var request = require('request');
var config = require('../config/config');
var machinHash = require('../config/machinHash');
// // console.log("i am here")
module.exports = {
    getAssetStoreList: function (json, callback) {
        //                                 // Simple Call transaction History
        try {
            request.post({
                "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
                "url": config.url + "/148",
                "body": json
            }, (error, res, body) => {
                try {
                    if (error) {
                        callback(error, null);
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
    getSyncAssetStoreList: function (json, callback) 
    {
        try {
            request.post({
                "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
                "url": config.url + "/239",
                "body": json
            }, (error, res, body) => {
                try {
                    if (error) {
                        callback(error, null);
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

    getAllNodeData: function (json, callback)    // Get All Node List
    {
        // console.log("Node Json ", json);
        try {
            request.post({
                "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
                "url": config.url + "/170",
                "body": json
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
    },
    getAllStore: function (json, callback)    // Get All Node List
    {
        // request.post({
        //     "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
        //     "url": config.url + "/",
        //     "body": json
        // }, (error, res, body) => {
        //     if (error) {
        //         callback(error, null);
        //     }
        //     
        //     callback(null, JSON.parse(body));
        // }
        // );
    },
    getRequestlist: function (json, callback)    // Get All Node List
    {
        try {
            request.post({
                "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
                "url": config.url + "/185",
                "body": json
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