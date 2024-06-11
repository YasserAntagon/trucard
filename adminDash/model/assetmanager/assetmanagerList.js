/*!
 File: AssetManager Node / Branch List
 Edited : Nikhil Bharambe
 Dated : 14-05-2019
 */

var config = require('../config/config');
var machinHash = require('../config/machinHash');
var request = require('request');
module.exports = {
   getSyncAssetManagerList: function (data, callback)    // Get All Node List
   {
      try {
         request.post({
            "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
            "url": config.url + "/240",
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
   getAllDlrData: function (data, callback)    // Get All Node List
   {
      try {
         request.post({
            "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
            "url": config.url + "/149",
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
   getAllCity: function (data, callback)    // Get All Node List
   {
      request.post({
         "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
         "url": config.url + "/130",
         "body": data
      }, (error, res, body) => {
         if (error) {
            callback(error, null);
         }

         callback(null, JSON.parse(body));
      }
      );
   }
}