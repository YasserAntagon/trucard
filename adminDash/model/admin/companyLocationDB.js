/*!
 File: CompanyLocation Master Database call
 Edited : Nikhil Bharambe
 Dated : 03-05-2019
 Description : CompanyLocation master rest api call from server
 */

var config = require('../config/config');
var machinHash = require('../config/machinHash');
var request = require('request');
module.exports = {
   saveCompanyLocationData: function (data, callback)    // save Branch Location Details
   {
      try {
         request.post({
            "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
            "url": config.url + "/116",
            "body": data
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
   updateCompanyLocationData: function (data, callback)    // update Branch Location Details
   {
      try {
         request.post({
            "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
            "url": config.url + "/189",
            "body": data
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
   saveOwnerData: function (data, callback)    // save branch owner data if Rented
   {
      try {
         request.post({
            "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
            "url": config.url + "/119",
            "body": data
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
   companyLocationAddress: function (data, callback)    // save Branch Location Addreess Details
   {
      try {
         request.post({
            "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
            "url": config.url + "/118",
            "body": data
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
   getCompanyLocationDetails: function (data, callback)    // get All Branch Location Details
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
   getBranchDetails: function (data, callback)    // get All Branch Location Details
   {
      try {
         request.post({
            "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
            "url": config.url + "/120",
            "body": data
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