var request = require('request');
var config = require('../config/config');
var machinHash = require('../config/machinHash');
module.exports =
{
    mailSend: function (data, callback) {
        try { 
            request.post({
                "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
                "url": config.url + "/247",
                "body": data
            }, (error, res, body) => {
                try {
                    if (error) {
                        callback(error, null);
                        return;
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
    mailEntitySend: function (data, callback) {
        try { 
            request.post({
                "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
                "url": config.url + "/267",
                "body": data
            }, (error, res, body) => {
                try 
                {
                    if (error) {
                        callback(error, null);
                        return;
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
    SMSSend: function (data, callback) {
        try {
            request.post({
                "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
                "url": config.url + "/248",
                "body": data
            }, (error, res, body) => {
                try {
                    if (error) {
                        callback(error, null);
                        return;
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

