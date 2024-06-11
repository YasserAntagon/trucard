var request = require('request');
var config = require('../config/config');
var machinHash = require('../config/machinHash'); 
// // console.log("i am here")
module.exports = {
   searchConsumer: function (json, callback) {
      try {
         request.post({
            "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
            "url": config.url + "/306",
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
   searchEntity: function (json, callback) {
      try {
         request.post({
            "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
            "url": config.url + "/307",
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
   getVATrans: function (json, callback) {
      try {
         request.post({
            "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
            "url": config.bank + "/api/listListVATransactions",
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
   partnerList: function (json, callback) {
      try {
         request.post({
            "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
            "url": config.url + "/308",
            "body": json
         }, (error, res, body) => {
            try {
               if (error) {
                  callback(error, null);
               }
               //   // console.log("getSummary Status",JSON.parse(body));     
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
   getPartnerDetails: function (json, callback) {
      try {
         request.post({
            "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
            "url": config.url + "/303",
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
   countAllPeople: function (json, callback) {
      try {
         request.post({
            "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
            "url": config.url + "/304",
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
   }
}
