/*!
 File: Save LBMA Rate
 Edited : Nikhil Bharambe
 Dated : 03-06-2019
 Description : LBMA Rate rest api call from server
 */
 var config = require('../config/config');
 var machinHash = require('../config/machinHash');
 var request = require('request');
 
 module.exports = {
     atomRefund: function (data, callback)    // save  lbma Rate
     {
         try 
         {
             request.post({
                 "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
                 "url": config.url + "/323",
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
     PGStatus: function (data, callback)    // save  lbma Rate
     {
         try 
         {
             request.post({
                 "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
                 "url": config.url + "/329",
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