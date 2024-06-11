/*!
 File: Payment & Charges API
 Edited : Nikhil Bharambe
 Dated : 23-Oct-2021
 Description : Transaction payment list and intervention queue
 */
var config = require('../config/config');
var machinHash = require('../config/machinHash');
var request = require('request');
module.exports = {
   setC2DChargesRate: function (data, callback) // save  lbma Rate
   {
      try {
         request.post({
            "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
            "url": config.url + "/162",
            "body": data
         }, (error, res, body) => {
            try 
            {
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
   setD2DChargesRate: function (data, callback) // save  lbma Rate
   {
      try {
         request.post({
            "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
            "url": config.url + "/161",
            "body": data
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
   getChargesRate: function (data, callback) // get  lbma Rate log
   {
      try {
         request.post({
            "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
            "url": config.url + "/176",
            "body": data
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
   getClientChargesRate: function (data, callback) {
      try {
         request.post({
            "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
            "url": config.url + "/302",
            "body": data
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
   getWalletPaymentLog: function (data, callback) // get lbma Rate log
   {
      try {
         request.post({
            "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
            "url": config.url + "/224",
            "body": data
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
   getAtomPaymentLog: function (data, callback) // get  lbma Rate log
   {
      try {
         request.post({
            "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
            "url": config.url + "/226",
            "body": data
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
   getBankLog: function (data, callback) // get  lbma Rate log
   {
      try {
         request.post({
            "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
            "url": config.url + "/250",
            "body": data
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
   getBankTransactionStatus: function (data, callback) // get  lbma Rate log
   {
      try {
         request.post({
            "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
            "url": config.url + "/251",
            "body": data
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
         });
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