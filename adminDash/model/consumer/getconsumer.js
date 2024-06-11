
var request = require('request');
var config = require('../config/config');
var machinHash = require('../config/machinHash');
var token = require('../config/bearerToken');
module.exports = {
   getSummary: function (callback) {                     // Simple Call transaction History
      try {
         request.post({
            "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
            "url": config.url + "/108",
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
   
   getConsumerdetails: function (truid, callback) {                   // Simple Call transaction History
      try {
         request.post({
            "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
            "url": config.url + "/113",
            "body": truid
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
   getConsumeradd: function (truid, callback) {                   // Simple Call transaction History
      try {
         request.post({
            "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
            "url": config.url + "/112",
            "body": truid
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
   getConsumerWallet: function (truid, callback) {
      // console.log("Json", truid);                                // Simple Call transaction History
      try {
         request.post({
            "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
            "url": config.url + "/113",
            "body": truid
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
   searchConsumerdetails: function (truid, callback) {
      // console.log("Json", truid);                                // Simple Call transaction History
      try {
         request.post({
            "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
            "url": config.url + "/113",
            "body": truid
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
   getProfile: function (truid, callback) {                        // Simple Call transaction History
      try {
         request.post({
            "headers": { "content-type": "application/json", "Authorization": "Bearer " + token.AdMiNApIsTokEn1 },
            "url": config.docurl + "/1012",
            "body": truid
         }, (error, res, body) => {
            try {
               if (error) {
                  callback(error, null);
               }
               callback(null, body);
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
   getDoc: function (truid, callback) {                        // Simple Call transaction History
      try {
         request.post({
            "headers": { "content-type": "application/json", "Authorization": "Bearer " + token.AdMiNfIlEuPlOaD2 },
            "url": config.docurl + "/1013",
            "body": truid
         }, (error, res, body) => {
            try {
               if (error) {
                  callback(error, null);
               }
               callback(null, body);
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
   savaConsumerdetails: function (truid, callback) {                 // Simple Call transaction History
      try {
         request.post({
            "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
            "url": config.url + "/137",
            "body": truid
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
   updateProfileData: function (json, callback) {
      try {
         request.post({
            "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
            "url": config.url + "/140",
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
   activateAccount: function (truid, callback) {
      // console.log("Json", truid);                                // Simple Call transaction History
      try {
         request.post({
            "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
            "url": config.url + "/107",
            "body": truid
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
   deactivatrAccount: function (truid, callback) {
      // console.log("Json", truid);                                // Simple Call transaction History
      try {
         request.post({
            "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
            "url": config.url + "/233",
            "body": truid
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
   getinvoice: function (json, callback) {
      try {  
         request.post({
            "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
            "url": config.url + "/227",         //old api 142
            "body": json
         }, (error, res, body) => {
            try {
               if (error) {
                  callback(error, null);
                  return false;
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
   getLieninvoice: function (json, callback) {
      try {  
         request.post({
            "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
            "url": config.url + "/199",         //old api 142
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
   getinvoicetransfer: function (json, callback) {
      try {  //                      
         request.post({
            "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
            "url": config.url + "/227",        // old api 143
            "body": json
         }, (error, res, body) => {
            try {
               if (error) {
                  callback(error, null);

               }
               // console.log("body ",body);
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
   getkycdoc: function (path, callback) {
      try {
         request.post({
            "url": path
         }, (error, res, body) => {
            try {
               if (error) {
                  callback(error, null);
               }
               callback(null, body);
            }
            catch (ex) {
               let err = {
                  "status": 401,
                  "message": ex.message
               }
               callback(null, err);
            }
         })
      }
      catch (ex) {
         let err = {
            "status": 401,
            "message": ex.message
         }
         callback(null, err);
      }
   },
   saveKYCDoc: function (json, callback) {
      //                      
      try {
         request.post({
            "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
            "url": config.url + "/204",
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
}
