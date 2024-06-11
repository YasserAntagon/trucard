var request = require('request');
var config = require('../config/config');
var machinHash = require('../config/machinHash');
// // console.log("i am here")
module.exports = {
   savaEntitydetails: function (json, callback) {
      try {
         // Simple Call transaction History
         request.post({
            "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
            "url": config.url + "/152",
            "body": json
         }, (error, res, body) => {
            try {
               if (error) {
                  callback(error, null);
               }
               //   // console.log("getSummary Status",JSON.parse(body));     
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
   //save or Update Entity Address
   saveEntityAddr: function (json, callback) {
      // Simple Call transaction History
      try {
         request.post({
            "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
            "url": config.url + "/154",
            "body": json
         }, (error, res, body) => {
            try {
               if (error) {
                  callback(error, null);
               }
               //   // console.log("getSummary Status",JSON.parse(body));     
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
   // profile update 
   savaConfig: function (json, callback) {

      try {
         request.post({
            "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
            "url": config.url + "/202",
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
   updateEntityDocument: function (json, callback) {
      // Simple Call transaction History
      try {
         request.post({
            "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
            "url": config.url + "/160",
            "body": json
         }, (error, res, body) => {
            try {
               if (error) {
                  callback(error, null);
               }
               //   // console.log("getSummary Status",JSON.parse(body));     
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