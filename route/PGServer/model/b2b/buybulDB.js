var config = require('../../model/config/config');
var token = require('../../model/config/bearerToken');
var request = require('request');
module.exports = {  
    submitAtomLog: function (truid,callback) 
    {
        try {
            request.post({
               "headers": { "content-type": "application/json", "Authorization": "Bearer " + token.ApIsTokEn38 },     // Submit Bullion
               "url": config.enurl + "/77",
               "body": truid
            }, (error, res, body) => {
               try {
                  if (error) {
                     callback(error, null);
                     return false;
                  }
                  // // console.log("final array", JSON.parse(body));
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
    },
}