/*!
 File: Company Master Database call
 Edited : Nikhil Bharambe
 Dated : 03-05-2019
 Description : Company master rest api call from server
 */

var config = require('../config/config');
var machinHash = require('../config/machinHash');
var request = require('request');
module.exports = {
   saveCompanyData: function (data, callback)    // save Company Details
   {
      try {
         request.post({
            "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
            "url": config.url + "/109",
            "body": data
         }, (error, res, body) => {
            try {
               if (error) {
                  callback(error, null);
                  return false
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
   updateCompanyData: function (data, callback)    // update Company Details
   {
      try {
         request.post({
            "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
            "url": config.url + "/115",
            "body": data
         }, (error, res, body) => {
            try {
               if (error) {
                  callback(error, null);
                  return false
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
   companyBankDetails: function (data, callback)    // save company Bank Details
   {
      try {
         request.post({
            "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
            "url": config.url + "/111",
            "body": data
         }, (error, res, body) => {
            try {
               if (error) {
                  callback(error, null);
                  return false
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
   companyAddress: function (data, callback)    // save Company Addreess Details
   {
      try {
         request.post({
            "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
            "url": config.url + "/110",
            "body": data
         }, (error, res, body) => {
            try {
               if (error) {
                  callback(error, null);
                  return false
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
   getCompanyDetails: function (data, callback)    // save Company Addreess Details
   {
      try {
         request.post({
            "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
            "url": config.url + "/114",
            "body": data
         }, (error, res, body) => {
            try {
               if (error) {
                  callback(error, null);
                  return false
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