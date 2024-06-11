var request = require('request');
var config = require('../config/config');
var machinHash = require('../config/machinHash');
module.exports = {
    updateConsumerConfig: function (data, callback)    // update consumer Config
    {  
        try {
            request.post({
                "headers": { "content-type": "application/json", "Authorization": "Bearer " + "#CoNsUmEr~aPiS^K%Y@C$1234@5678!234567*#", "mhash": machinHash.mHash },
                "url": config.custUrl + "/configuration/updateConfig",
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
    updateConsumerLimit: function (data, callback)    // update consumer Config
    {
        try {
            request.post({
                "headers": { "content-type": "application/json", "Authorization": "Bearer " + "#CoNsUmEr~aPiS^K%Y@C$1234@5678!234567*#", "mhash": machinHash.mHash },
                "url": config.url + "/284",
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
    updateConsumerAccess: function (data, callback)    // update consumer Config
    {
        try {
            request.post({
                "headers": { "content-type": "application/json", "Authorization": "Bearer " + "#CoNsUmEr~aPiS^K%Y@C$1234@5678!234567*#", "mhash": machinHash.mHash },
                "url": config.url + "/283",             //old 229
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
    updateWalLimit: function (data, callback)    // update consumer Config
    {
        try {
            request.post({
                "headers": { "content-type": "application/json", "Authorization": "Bearer " + "#CoNsUmEr~aPiS^K%Y@C$1234@5678!234567*#", "mhash": machinHash.mHash },
                "url": config.url + "/231",
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
    updateWalletLimits: function (data, callback)    // update consumer Config
    {
        try {
            request.post({
                "headers": { "content-type": "application/json", "Authorization": "Bearer " + "#CoNsUmEr~aPiS^K%Y@C$1234@5678!234567*#", "mhash": machinHash.mHash },
                "url": config.url + "/285",
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
    getSecureCredit: function (data, callback)    // update consumer Config
    {
        try {
            request.post({
                "headers": { "content-type": "application/json", "Authorization": "Bearer " + "#CoNsUmEr~aPiS^K%Y@C$1234@5678!234567*#", "mhash": machinHash.mHash },
                "url": config.url + "/328",
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
    digitalPayments: function (data, callback)    // update consumer Config
    {
        try {
            request.post({
                "headers": { "content-type": "application/json", "Authorization": "Bearer " + "#CoNsUmEr~aPiS^K%Y@C$1234@5678!234567*#", "mhash": machinHash.mHash },
                "url": config.url + "/268",
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
    getconsumerConfig: function (data, callback)    // bind All Consumer Configuration
    {
        try {
            request.post({
                "headers": { "content-type": "application/json", "Authorization": "Bearer " + "#CoNsUmEr~aPiS^K%Y@C$1234@5678!123456*#", "mhash": machinHash.mHash },
                "url": config.url + "/232",
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
    updateConsumerPG: function (data, callback)    // bind All Consumer Configuration
    {
        try {
            request.post({
                "headers": { "content-type": "application/json", "Authorization": "Bearer " + "#CoNsUmEr~aPiS^K%Y@C$1234@5678!123456*#", "mhash": machinHash.mHash },
                "url": config.url + "/290",
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