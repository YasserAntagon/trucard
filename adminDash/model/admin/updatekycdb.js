
var request = require('request');
var config = require('../config/config');
var machinHash = require('../config/machinHash');
module.exports = {
   updateKycStep1: function (req, callbacksign) {
      try {
         request.post({
            "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
            "url": config.url + "/39",
            "body": req
         }, (error, res, body) => {
            try {
               if (error) {
                  callbacksign(error, null);
               }

               var json = JSON.parse(body)
               callbacksign(null, JSON.parse(body));
            }
            catch (ex) {
               let err = {
                  "status": 401,
                  "message": ex.message
               }
               callbacksign(null, err);
            }
         }
         );
      }
      catch (ex) {
         let err = {
            "status": 401,
            "message": ex.message
         }
         callbacksign(null, err);
      }
   },
   updateKycStep2: function (req, callbacksign) {
      try {
         request.post({
            "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
            "url": config.url + "/35",
            "body": req
         }, (error, res, body) => {
            try {
               if (error) {
                  callbacksign(error, null);
               }

               var json = JSON.parse(body)

               callbacksign(null, JSON.parse(body));
            }
            catch (ex) {
               let err = {
                  "status": 401,
                  "message": ex.message
               }
               callbacksign(null, err);
            }
         }
         );
      }
      catch (ex) {
         let err = {
            "status": 401,
            "message": ex.message
         }
         callbacksign(null, err);
      }
   },
   updateKycStep3: function (req, callbacksign)     // Addresses
   {
      try {
         request.post({
            "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
            "url": config.url + "/32",
            "body": req
         }, (error, res, body) => {
            try {
               if (error) {
                  callbacksign(error, null);
               }

               var json = JSON.parse(body)

               callbacksign(null, JSON.parse(body));
            }
            catch (ex) {
               let err = {
                  "status": 401,
                  "message": ex.message
               }
               callbacksign(null, err);
            }
         }
         );
      }
      catch (ex) {
         let err = {
            "status": 401,
            "message": ex.message
         }
         callbacksign(null, err);
      }
   },
   updateKycStep4: function (req, callbacksign)      // kyc documents
   {
      try {
         request.post({
            "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
            "url": config.url + "/33",
            "body": req
         }, (error, res, body) => {
            try {
               if (error) {
                  callbacksign(error, null);
               }

               var json = JSON.parse(body)

               callbacksign(null, JSON.parse(body));
            }
            catch (ex) {
               let err = {
                  "status": 401,
                  "message": ex.message
               }
               callbacksign(null, err);
            }
         }
         );
      }
      catch (ex) {
         let err = {
            "status": 401,
            "message": ex.message
         }
         callbacksign(null, err);
      }
   },
   getKYCData: function (req, callbacksign)      // kyc documents
   {
      try {
         request.post({
            "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
            "url": config.url + "/48",
            "body": req
         }, (error, res, body) => {
            try {
               if (error) {
                  callbacksign(error, null);
               }

               var json = JSON.parse(body)

               callbacksign(null, JSON.parse(body));
            }
            catch (ex) {
               let err = {
                  "status": 401,
                  "message": ex.message
               }
               callbacksign(null, err);
            }
         }
         );
      }
      catch (ex) {
         let err = {
            "status": 401,
            "message": ex.message
         }
         callbacksign(null, err);
      }
   },
   updateProfile: function (req, callbacksign)      // update profile image
   {
      try {
         request.post({
            "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
            "url": config.url + "/140",
            "body": req
         }, (error, res, body) => {
            try {
               if (error) {
                  callbacksign(error, null);
               }

               var json = JSON.parse(body)

               callbacksign(null, JSON.parse(body));
            }
            catch (ex) {
               let err = {
                  "status": 401,
                  "message": ex.message
               }
               callbacksign(null, err);
            }
         }
         );
      }
      catch (ex) {
         let err = {
            "status": 401,
            "message": ex.message
         }
         callbacksign(null, err);
      }
   }
}
