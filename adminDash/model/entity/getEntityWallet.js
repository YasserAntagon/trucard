var request = require('request');
var config = require('../config/config');
var machinHash = require('../config/machinHash');
var token = require('../config/bearerToken');
// // console.log("i am here")
module.exports = { 
   getWalletBalance: function (json, callback) 
   { 
      try {
         request.post({
            "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
            "url": config.url + "/273",
            "body": json
         }, (error, res, body) => {
            try {
               if (error) {
                  callback(error, null);
               }  
               else
               {
                  callback(null, JSON.parse(body));
               }   
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
   addWalletBalance: function (json, callback) 
   { 
      try {
         request.post({
            "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
            "url": config.url + "/266",
            "body": json
         }, (error, res, body) => {
            try {
               if (error) {
                  callback(error, null);
               } 
               else{
                  callback(null, JSON.parse(body));
               }    
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
   getWalletBreakup: function (json, callback) 
   { 
      try {
         request.post({
            "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
            "url": config.url + "/311",
            "body": json
         }, (error, res, body) => {
            try {
               if (error) {
                  callback(error, null);
               }     
               else
               {
                  callback(null, JSON.parse(body));
               }
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
