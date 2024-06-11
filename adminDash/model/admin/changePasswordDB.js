/*!
 File: Change Password Model
 Edited : Nikhil Bharambe
 Dated : 04-05-2019
 Description : Password change by employee / Admin 
 */ 
var config = require('../config/config');
var machinHash = require('../config/machinHash');
var request = require('request');
module.exports = {
   changeEmpPassword: function (data, callback)    // Request for change password to remote router
   {
      try {
         request.post({
            "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
            "url": config.url + "/104",
            "body": data
         }, (error, res, body) => {
            try 
            {
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
   changeEmpTPIN: function (data, callback)    // Request for change password to remote router
   {
      try {
         request.post({
            "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
            "url": config.url + "/234",
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
   verifyEmpTPIN: function (data, callback)    // Request for change password to remote router
   {
      try {
         request.post({
            "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
            "url": config.url + "/235",
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