/*!
 File: OTP Verification
 Edited : Nikhil Bharambe
 Dated : 15/10/2020
 Description : OTP With HAsh
 */

var config = require('./config/config');
var machinHash = require('./config/machinHash');
var request = require('request');
module.exports = {
   sendOTP: function (body,callback)    //  Verify Hash
   {
      try { 
         request.post({
            "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
            "url": config.url + "/244",
            "body":body
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
   verifyOTP: function (json, callback)    //  Verify OTP
   {
      try {
         request.post({
            "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
            "url": config.url + "/245",
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