var config = require('../model/config/config');
var token = require('../model/config/bearerToken');
var request = require('request');
module.exports = { 
   submitDirectBullionDb: function (truid,userType, callback) {
      try { 
         var source = userType == "B2BConsumer" ? config.enurl +"/501" : config.custurl +"/89"; 
         let tokens = userType == "B2BConsumer" ? token.clientConsumer : token.ApIsTokEn17; 
         request.post({
            "headers": { "content-type": "application/json", "Authorization": "Bearer " + tokens },     // Submit Bullion
            "url":  source,
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
         });
      }
      catch (ex) {
         callback(null, { "status": 903, message: "Request error" });
      }
   },
   submitBullionDb: function (truid, callback) {
      try {
         request.post({
            "headers": { "content-type": "application/json", "Authorization": "Bearer " + token.ApIsTokEn17 },     // Submit Bullion
            "url": config.custurl + "/93",
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
   loadDlr: function (truid, callback) {
      try {
         request.post({
            "headers": { "content-type": "application/json", "Authorization": "Bearer " + token.ApIsTokEn7 },  // Load assetmanager
            "url": config.custurl + "/31",
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
            "headers": { "content-type": "application/json", "Authorization": "Bearer " + token.ApIsTokEn9 },     // Submit Bullion
            "url": config.custurl + "/70",
            "body": truid
         }, (error, res, body) => {
            try {
               if (error) {
                  callback(error, null);
                  return false;
               }
               // //console.log("final array", JSON.parse(body));
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
   submitaddmoneyTransLog: function (truid, callback) {
      try {
         request.post({
            "headers": { "content-type": "application/json", "Authorization": "Bearer " + token.ApIsTokEn9 },     // Submit Bullion
            "url": config.custurl + "/70",
            "body": truid
         }, (error, res, body) => {
            try {
               if (error) {
                  callback(error, null);
                  return false;
               }
               // //console.log("final array1", JSON.parse(body));
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
   getwalletBal: function (truid, callback) {
      try {
         //   alert(truid)
         request.post({
            "headers": { "content-type": "application/json", "Authorization": "Bearer " + token.ApIsTokEn20 },     // Submit Bullion
            "url": config.entityurl + "/79",
            "body": truid
         }, (error, res, body) => {
            try {
               if (error) {
                  callback(error, null);
                  return false;
               }
               // //console.log("final array3", JSON.parse(body));
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
   getInvoiceByCRNNo: function (jsons, callback) {
      try { 
         request.post({
            "headers": { "content-type": "application/json", "Authorization": "Bearer " + token.ApIsTokEn2 },     // Submit Bullion
            "url": config.custurl + "/148",
            "body": jsons
         }, (error, res, body) => {
            try {
               if (error) {
                  callback(error, null);
                  return false;
               }
               else
               {
                  callback(null, JSON.parse(body));
               } 
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