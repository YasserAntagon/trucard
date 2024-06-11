var config = require('./config/config');
var token = require('./config/bearerToken');
var request = require('request');
module.exports = {
    validateUserExistORnot: function (inputjson, scr, callback) {
        try {
            var source = scr == "B2BConsumer" ? "/14" : "/48";
            let tokens = scr == "B2BConsumer" ? token.ApIsTokEn15 : token.enKYCData;
            let endurl = scr == "B2BConsumer" ? config.custurl : config.enurl;
            request.post({
                "headers": { "content-type": "application/json", "Authorization": "Bearer " + tokens },     // Submit Bullion
                "url": endurl + source,
                "body": JSON.stringify(inputjson)
            }, (error, res, body) => {
                try {
                    if (error) {
                        callback(error, null);
                    }else{
                        callback(null, JSON.parse(body));
                    }
                }
                catch (ex) {
                    callback(null, { "status": 902, message: "Something went wrong. Please try after some time!!" });
                }
            });
        }
        catch (ex) {
            callback(null, { "status": 903, message: "Request error" });
        }
    },
    updateKYCDetails: function (inputjson, scr, callback) {
        try {
            var source = scr == "B2BConsumer" ? "/160" : "/198";
            let tokens = scr == "B2BConsumer" ? token.ApIsTokEn23 : token.enKYC198;
            let endurl = scr == "B2BConsumer" ? config.custurl : config.enurl;
            request.post({
                "headers": { "content-type": "application/json", "Authorization": "Bearer " + tokens },     // Submit Bullion
                "url": endurl + source,
                "body": JSON.stringify(inputjson)
            }, (error, res, body) => {
                try {
                    if (error) {
                        callback(error, null);
                        return false;
                    }
                    callback(null, JSON.parse(body));
                }
                catch (ex) {
                    callback(null, { "status": 902, message: "Something went wrong. Please try after some time!!" });
                }
            });
        }
        catch (ex) {
            callback(null, { "status": 903, message: "Request error" });
        }
    },
    updateUserDetails: function (inputjson, scr, callback) {
        try {
            var source = scr == "B2BConsumer" ? "/158" : "/48";
            let tokens = scr == "B2BConsumer" ? token.ApIsTokEn15 : token.enKYCData;
            let endurl = scr == "B2BConsumer" ? config.custurl : config.enurl;
            request.post({
                "headers": { "content-type": "application/json", "Authorization": "Bearer " + tokens },     // Submit Bullion
                "url": endurl + source,
                "body": JSON.stringify(inputjson)
            }, (error, res, body) => {
                try {
                    if (error) {
                        callback(error, null);
                        return false;
                    }
                    callback(null, JSON.parse(body));
                }
                catch (ex) {
                    callback(null, { "status": 902, message: "Something went wrong. Please try after some time!!" });
                }
            });
        }
        catch (ex) {
            callback(null, { "status": 903, message: "Request error" });
        }
    },
}