/*!
 File: AssetManager Node / Branch List
 Edited : Nikhil Bharambe
 Dated : 14-05-2019
 */

var config = require('../config/config');
var machinHash = require('../config/machinHash');
var request = require('request');
module.exports = {
    getAccessList: function (data, callback)    // Get All Node List
    {
        try {
            request.post({
                "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
                "url": config.url + "/222",   //old api 203
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
    },
    updateConfig: function (data, callback)    // Get All Node List
    {
        try {
            request.post({
                "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
                "url": config.url + "/202",
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
    },
    walletAccessConfig: function (data, callback)    // Get All Node List
    {
        try {
            request.post({
                "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
                "url": config.url + "/214",
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
    },
    consumerTransConfig: function (data, callback)    // Get All Node List
    {
        try {
            request.post({
                "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
                "url": config.url + "/215",
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
    },
    enSelfTransConfig: function (data, callback)    // Get All Node List
    {
        try {
            request.post({
                "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
                "url": config.url + "/216",
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
    },
    globalPolicyConfig: function (data, callback)    // Get All Node List
    {
        try {
            request.post({
                "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
                "url": config.url + "/217",
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
    },
    transactionLimit: function (data, callback)    // Get All Node List
    {
        try {
            request.post({
                "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
                "url": config.url + "/218",
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
    },
    updaterevenuepercent: function (data, callback)    // Get All Node List
    {
        try {
            request.post({
                "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
                "url": config.url + "/264",
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
    },
    updateConsumerAccess: function (data, callback)    // Get All Node List
    {
        try {
            request.post({
                "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
                "url": config.url + "/299",
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
    },
    updateConsumerLimit: function (data, callback)    // Get All Node List
    {
        try {
            request.post({
                "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
                "url": config.url + "/300",
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
    },
    updateWalletLimits: function (data, callback)    // Get All Node List
    {
        try {
            request.post({
                "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
                "url": config.url + "/301",
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
    },
}