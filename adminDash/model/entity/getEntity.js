var request = require('request');
var config = require('../config/config');
var machinHash = require('../config/machinHash');
var token = require('../config/bearerToken'); 
module.exports = {
   searchEntity: function (json, callback) {
      try {
         request.post({
            "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
            "url": config.url + "/153",
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
   updateProfileData: function (json, callback) {

      try {
         request.post({
            "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
            "url": config.url + "/156",
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
   getenProfile: function (truid, callback) {                        // Simple Call transaction History
      try {
         request.post({
            "headers": { "content-type": "application/json", "Authorization": "Bearer " + token.AdMiNApIsTokEn1 },
            "url": config.endocurl + "/1042",
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
   getenDoc: function (truid, callback) {                        // Simple Call transaction History
      try {
         request.post({
            "headers": { "content-type": "application/json", "Authorization": "Bearer " + token.AdMiNApIsTokEn4 },
            "url": config.endocurl + "/1043",
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
   deactivatRemmitAccount: function (json, callback) { 
      try {
         request.post({
            "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
            "url": config.url + "/316",
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
   deactivatrAccount: function (json, callback) { 
      try {
         request.post({
            "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
            "url": config.url + "/165",
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
   getTransdetails: function (json, callback) {

      try {
         request.post({
            "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
            "url": config.url + "/175",
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
   getTransdetails: function (json, callback) {

      try {
         request.post({
            "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
            "url": config.url + "/175",
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
   getGSTAllTrans: function (json, callback) {
      try {
         request.post({
            "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
            "url": config.url + "/297",
            "body": json
         }, (error, res, body) => {
            try {
               if (error) {
                  callback(error, null);
               }
               else {
                  callback(null, body);
               }
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
   getselfTrans: function (json, callback) {

      try {
         request.post({
            "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
            "url": config.url + "/192",
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
   getinvoice: function (json, callback) {
      // 
      try {
         request.post({
            "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
            "url": config.url + "/227",   // old api 142
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
      //          
      try {
         request.post({
            "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
            "url": config.url + "/227",         //old Api 143
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
   
   getConsumerWalletLog: function (json, callback) {
      try
      {
         request.post({
            "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
            "url": config.url + "/272",
            "body": json
         }, (error, res, body) => {
            try 
            {
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
   getWalletTransdetails: function (json, callback) {
      try
      {
         request.post({
            "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
            "url": config.url + "/191",
            "body": json
         }, (error, res, body) => {
            try 
            {
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
   saveEnKYCDoc: function (json, callback) {
      //                
      try {
         request.post({
            "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
            "url": config.url + "/205",
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
   getEntityReport: function (json, callback) {
      //      
      request.post({
         "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
         "url": config.url + "/219",
         "body": json
      }, (error, res, body) => {
         if (error) {
            callback(error, null);

         }
         callback(null, JSON.parse(body));
      }
      );
   },
   getnodeEntityReport: function (json, callback) {
      //      
      request.post({
         "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
         "url": config.url + "/249",
         "body": json
      }, (error, res, body) => {
         if (error) {
            callback(error, null);

         }
         callback(null, JSON.parse(body));
      }
      );
   },
   getTransReportdetails: function (json, callback) {
      try {
         request.post({
            "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
            "url": config.url + "/220",
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
   getConsumerPartnerStock: function (json, callback) {
      try {
         request.post({
            "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
            "url": config.url + "/298",
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
   partnerPartnerStock: function (json, callback) {
      try {
         request.post({
            "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
            "url": config.url + "/312",
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
   partnerPartnerDashStock: function (json, callback) {
      try {
         request.post({
            "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
            "url": config.url + "/315",
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
   fetchCounter: function (json, callback) {
      try {
         request.post({
            "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
            "url": config.url + "/314",
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
   getWalletReceipt: function (json, callback)    // Entity latest transaction
   {
       try {
           request.post({
               "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
               "url": config.url + "/317",
               "body": json
           }, (error, res, body) => {
               try {
                   if (error) {
                       callback(error, null);
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
   egetGSTReport: function (json, callback)    // Entity latest transaction
   {
       try {
           request.post({
               "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
               "url": config.url + "/320",
               "body": json
           }, (error, res, body) => {
               try {
                   if (error) {
                       callback(error, null);
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
   }

   

   

}