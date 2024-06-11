const request = require('request'),
  Gen = require("../Generics"),
  conf = require("../conf");

var reqip = conf.reqip;

module.exports.notification_registartion = function (truid, fname) {
  request.post({
    "headers": { "content-type": "application/json" },
    "url": reqip + ":4116/api/insnotification",
    "body": JSON.stringify({
      "notifyto": truid,
      "triggeredbytruid": truid,
      "notification": "Hi " + fname + "! Welcome to Trucard.",
      "type": "registration",
      "subtype": "login",
      "title": "registration",
      "referenceid": truid
    })
  }, (error, body) => {
    if (error) {
      console.log(error);
    }
  })
}


