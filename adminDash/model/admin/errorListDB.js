/*!
 File: Employee Master Database call
 Edited : Nikhil Bharambe
 Dated : 03-05-2019
 Description : Employee master rest api call from server
 */

var config = require('../config/config');
var machinHash = require('../config/machinHash');
var request = require('request');
module.exports = {
   bindAllErrorLog: function (callback)    //  bind All Error Log of consumer
   {
      try {
         request.post({
            "headers": { "content-type": "application/json", "Authorization": "Bearer " + "#CoNsUmEr~aPiS^K%Y@C$1234@5678!123456*#" },
            "url": config.custUrl + "/errorLog/getLog"
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
   deleteAllErrorLog: function (callback)    //  delete All Error Log of consumer
   {
      try {
         request.post({
            "headers": { "content-type": "application/json", "Authorization": "Bearer " + "#CoNsUmEr~aPiS^K%Y@C$1234@5678!234567*#" },
            "url": config.custUrl + "/errorLog/removelog"
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