var request = require('request');
var config = require('../config/config');
var machinHash = require('../config/machinHash');
// // console.log("i am here")
module.exports = {
   getpurchasedata: function (json, callback) {                     // Simple Call transaction History
      try {
         request.post({
            "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
            "url": config.url + "/180",
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
   getsaledata: function (json, callback) {                     // Simple Call transaction History
      try {
         request.post({
            "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
            "url": config.url + "/194",                           // Consumer redeem chart API 
            "body": json
         }, (error, res, body) => {
            if (error) {
               callback(error, null);
            }
            callback(null, JSON.parse(body));
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