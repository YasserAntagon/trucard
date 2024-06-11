var config = require('../model/config/config');
var token = require('../model/config/bearerToken');
var request = require('request');
module.exports = {
   submitRedeemCashDb: function (truid, callback) {

      try {

         request.post({
            "headers": { "content-type": "application/json", "Authorization": "Bearer " + token.ApIsTokEn17 },    // Submit coin Reedem
            "url": config.custurl + "/95",
            "body": truid
         }, (error, res, body) => {
            try {
               if (error) {
                  callback(error, null);
                  return false;
               }
               // //console.log("cash final", JSON.parse(body));
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
   loadDlr: function (truid, callback) {
      try {
         request.post({
            // Submit Bullion
            "headers": { "content-type": "application/json", "Authorization": "Bearer " + token.ApIsTokEn7 },
            "url": config.custurl + "/30",
            "body": truid
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
         }
         );
      }
      catch (ex) {
         callback(null, { "status": 903, message: "Request error" });
      }
   },
   submitTransLog: function (truid, callback) {
      try {
         request.post({
            "headers": { "content-type": "application/json", "Authorization": "Bearer " + token.ApIsTokEn9 },
            "url": config.custurl + "/70",
            "body": truid
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
         }
         );
      }
      catch (ex) {
         callback(null, { "status": 903, message: "Request error" });
      }
   },
   submitBullionDb: function (truid, ttype, userType, callback) {
      try {
         request.post({
            "headers": { "content-type": "application/json", "Authorization": "Bearer " + token.ApIsTokEn17 },  // Submit cash Reedem 
            "url": config.custurl + "/90",
            "body": truid
         }, (error, res, body) => {
            try {
               if (error) {
                  callback(error, null);
                  return false;
               }
               // //console.log("cash final", JSON.parse(body));
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