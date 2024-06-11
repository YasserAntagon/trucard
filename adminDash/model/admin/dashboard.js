var config = require('../config/config');
var machinHash = require('../config/machinHash');
var request = require('request');

module.exports = {
    getmostActiveTxn: function (req, callbacksign) {
        try 
        {
            request.post({
                "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
                "url": config.url + "/321",
                "body": req
            }, (error, res, body) => {
                try {
                    if (error) {
                        callbacksign(error, null);
                        return false;
                    } 
                    var json = JSON.parse(body);
                    callbacksign(null, json);
                }
                catch (ex) {
                    callbacksign(null, { "status": 902, message: "Something went wrong. Please try after some time!!" });
                }
            }
            );
        }
        catch (ex) {
            callbacksign(null, { "status": 903, message: "Request error" });
        }
    },
    dailystocktxn: function (req, callbacksign) {
        try 
        {
            request.post({
                "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
                "url": config.url + "/330",
                "body": req
            }, (error, res, body) => {
                try {
                    if (error) {
                        callbacksign(error, null);
                        return false;
                    } 
                    var json = JSON.parse(body);
                    callbacksign(null, json);
                }
                catch (ex) {
                    callbacksign(null, { "status": 902, message: "Something went wrong. Please try after some time!!" });
                }
            }
            );
        }
        catch (ex) {
            callbacksign(null, { "status": 903, message: "Request error" });
        }
    },
    getTransaction: function (req, callbacksign) {
        try {
            request.post({
                "headers": { "content-type": "application/json", "Authorization": "Bearer " + "#eNtItY*aPiS$1234@5678!12345*#" },
                "url": config.entityurl + "/89",
                "body": req
            }, (error, res, body) => {
                try {
                    if (error) {
                        callbacksign(error, null);
                        return false;
                    }
                    //   // console.log("main",JSON.parse(body));
                    var json = JSON.parse(body);
                    callbacksign(null, json);
                }
                catch (ex) {
                    callbacksign(null, { "status": 902, message: "Something went wrong. Please try after some time!!" });
                }
            }
            );
        }
        catch (ex) {
            callbacksign(null, { "status": 903, message: "Request error" });
        }
    },
    getTransactionLien: function (req, callbacksign) {
        try {
            request.post({
                "headers": { "content-type": "application/json", "Authorization": "Bearer " + "#eNtItY*aPiS$1234@5678!12345*#" },
                "url": config.entityurl + "/90",
                "body": req
            }, (error, res, body) => {
                try {
                    if (error) {
                        callbacksign(error, null);
                        return false;
                    }
                    //   // console.log("main",JSON.parse(body));
                    var json = JSON.parse(body);
                    callbacksign(null, json);
                }
                catch (ex) {
                    callbacksign(null, { "status": 902, message: "Something went wrong. Please try after some time!!" });
                }
            }
            );
        }
        catch (ex) {
            callbacksign(null, { "status": 903, message: "Request error" });
        }
    },
    getenCount: function (data, callback)    // Get all entity count
    {
        try {
            request.post({
                "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
                "url": config.url + "/207",
                "body": data
            }, (error, res, body) => {
                try {
                    if (error) {
                        callback(error, null);
                    }
                    else if (body) {
                        callback(null, JSON.parse(body));
                    }
                    else {
                        callback(null, null);
                    }
                }
                catch (ex) {
                    let err = {
                        "status": 401,
                        "message": ex.message
                    }
                    callback(null, err);
                }
            });
        }
        catch (ex) {
            let err = {
                "status": 401,
                "message": ex.message
            }
            callback(null, err);
        }
    },
    getCustoCount: function (data, callback)    // Get assetstore count
    {
        try {
            request.post({
                "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
                "url": config.url + "/208",
                "body": data
            }, (error, res, body) => {
                try {
                    if (error) {
                        callback(error, null);
                    }
                    else if (body) {
                        callback(null, JSON.parse(body));
                    }
                    else {
                        callback(null, null);
                    }
                }
                catch (ex) {
                    let err = {
                        "status": 401,
                        "message": ex.message
                    }
                    callback(null, err);
                }
            });
        }
        catch (ex) {
            let err = {
                "status": 401,
                "message": ex.message
            }
            callback(null, err);
        }
    },
    getdlrCount: function (data, callback)    // Get All assetmanager count
    {
        try {
            request.post({
                "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
                "url": config.url + "/209",
                "body": data
            }, (error, res, body) => {
                try {
                    if (error) {
                        callback(error, null);
                    }
                    else if (body) {
                        callback(null, JSON.parse(body));
                    }
                    else {
                        callback(null, null);
                    }
                }
                catch (ex) {
                    let err = {
                        "status": 401,
                        "message": ex.message
                    }
                    callback(null, err);
                }
            });
        }
        catch (ex) {
            let err = {
                "status": 401,
                "message": ex.message
            }
            callback(null, err);
        }
    },
    getCustomerCount: function (data, callback)    // get all customer count
    {
        try {
            request.post({
                "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
                "url": config.url + "/210",
                "body": data
            }, (error, res, body) => {
                try {
                    if (error) {
                        callback(error, null);
                    }
                    else if (body) {
                        callback(null, JSON.parse(body));
                    }
                    else {
                        callback(null, null);
                    }
                }
                catch (ex) {
                    let err = {
                        "status": 401,
                        "message": ex.message
                    }
                    callback(null, err);
                }
            });
        }
        catch (ex) {
            let err = {
                "status": 401,
                "message": ex.message
            }
            callback(null, err);
        }
    },
    getConsumerDetails: function (data, callback)    // Get All consumer details
    {
        try {
            request.post({
                "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
                "url": config.url + "/221",
                "body": data
            }, (error, res, body) => {
                try {
                    if (error) {
                        callback(error, null);
                    }
                    else if (body) {
                        callback(null, JSON.parse(body));
                    }
                    else {
                        callback(null, null);
                    }
                }
                catch (ex) {
                    let err = {
                        "status": 401,
                        "message": ex.message
                    }
                    callback(null, err);
                }
            });
        }
        catch (ex) {
            let err = {
                "status": 401,
                "message": ex.message
            }
            callback(null, err);
        }
    },
    getEntityDetails: function (data, callback)    // Get All entity details
    {
        try {
            request.post({
                "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
                "url": config.url + "/242",
                "body": data
            }, (error, res, body) => {
                try {
                    if (error) {
                        callback(error, null);
                    }
                    else if (body) {
                        callback(null, JSON.parse(body));
                    }
                    else {
                        callback(null, null);
                    }
                }
                catch (ex) {
                    let err = {
                        "status": 401,
                        "message": ex.message
                    }
                    callback(null, err);
                }
            });
        }
        catch (ex) {
            let err = {
                "status": 401,
                "message": ex.message
            }
            callback(null, err);
        }
    },
    getAssetManagerDetails: function (data, callback)    // Get All assetmanager Txn details
    {
        try {
            request.post({
                "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
                "url": config.url + "/243",
                "body": data
            }, (error, res, body) => {
                try {
                    if (error) {
                        callback(error, null);
                    }
                    else if (body) {
                        callback(null, JSON.parse(body));
                    }
                    else {
                        callback(null, null);
                    }
                }
                catch (ex) {
                    let err = {
                        "status": 401,
                        "message": ex.message
                    }
                    callback(null, err);
                }
            });
        }
        catch (ex) {
            let err = {
                "status": 401,
                "message": ex.message
            }
            callback(null, err);
        }
    },
    getRevenueChart: function (data, callback)    // Get All assetmanager Txn details
    {
        try
        {
            request.post({
                "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
                "url": config.url + "/280",
                "body": data
            }, (error, res, body) => {
                try {
                    if (error) {
                        callback(error, null);
                    }
                    else if (body) {
                        callback(null, JSON.parse(body));
                    }
                    else {
                        callback(null, null);
                    }
                }
                catch (ex) {
                    let err = {
                        "status": 401,
                        "message": ex.message
                    }
                    callback(null, err);
                }
            });
        }
        catch (ex) {
            let err = {
                "status": 401,
                "message": ex.message
            }
            callback(null, err);
        }
    },
    getRevenueByPartner: function (data, callback)    // Get All assetmanager Txn details
    {
        try {
            request.post({
                "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
                "url": config.url + "/319",
                "body": data
            }, (error, res, body) => {
                try {
                    if (error) {
                        callback(error, null);
                    }
                    else if (body) {
                        callback(null, JSON.parse(body));
                    }
                    else {
                        callback(null, null);
                    }
                }
                catch (ex) {
                    let err = {
                        "status": 401,
                        "message": ex.message
                    }
                    callback(null, err);
                }
            });
        }
        catch (ex) {
            let err = {
                "status": 401,
                "message": ex.message
            }
            callback(null, err);
        }
    },

    getPayoutValues: function (data, callback)    // Get All assetmanager Txn details
    {
        try {
            request.post({
                "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
                "url": config.url + "/288",
                "body": data
            }, (error, res, body) => {
                try {
                    if (error) {
                        callback(error, null);
                    }
                    else if (body) {
                        callback(null, JSON.parse(body));
                    }
                    else {
                        callback(null, null);
                    }
                }
                catch (ex) {
                    let err = {
                        "status": 401,
                        "message": ex.message
                    }
                    callback(null, err);
                }
            });
        }
        catch (ex) {
            let err = {
                "status": 401,
                "message": ex.message
            }
            callback(null, err);
        }
    },
    getWalletReceipt: function (json, callback)    // Entity latest transaction
    {
        try {
            request.post({
                "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
                "url": config.url + "/317",
                "body": json
            }, (error, res, body) => {
                try {
                    if (error) {
                        callback(error, null);
                    }
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