const request = require('request'),
  Gen = require("../../config");
var reqip = Gen.reqip;

module.exports.notification_registartion = function (truid, fname,password) {
  var dates = new Date().toLocaleString();
  request.post({
    "headers": { "content-type": "application/json" },
    "url": reqip + ":4116/api/insnotification",
    "body": JSON.stringify({
      "notifyto": truid,
      "triggeredbytruid": truid,
      "notification": "Hi " + fname + "! Welcome to Company.",
      "type": "registration",
      "subtype": "newaccount",
      "title": "registration",
      "referenceid": truid
    })
  }, (error, body) => {
    if (error) {
      return console.dir(error);
    }
  }
  )
}
module.exports.notification_registartion_From_Admin = function (truid, fname) { 
  request.post({
    "headers": { "content-type": "application/json" },
    "url": reqip + ":4116/api/insnotification",
    "body": JSON.stringify({
      "notifyto": truid,
      "triggeredbytruid": truid,
      "notification": "Hi " + fname + "! Welcome to Company.",
      "type": "registration",
      "subtype": "newaccount",
      "title": "registration",
      "referenceid": truid
    })
  }, (error, body) => {
    if (error) {
      return console.dir(error);
    }
    // var newjson =  JSON.parse(body);
  }
  )
}
module.exports.notification_migration = function (truid, fname) {
  var dates = new Date().toLocaleString();
  request.post({
    "headers": { "content-type": "application/json" },
    "url": reqip + ":4116/api/insnotification",
    "body": JSON.stringify({
      "notifyto": truid,
      "triggeredbytruid": truid,
      "notification": "Hi " + fname + "! Welcome to Company. We have received your request for migration, Please wait your details are under verification.",
      "type": "registration",
      "subtype": "newaccount",
      "title": "registration",
      "referenceid": truid
    })
  }, (error, body) => {
    if (error) {
      return console.dir(error);
    }
    // var newjson =  JSON.parse(body);
  }
  )
}
module.exports.notify_refree = function (truid, refenceid, fname, lname, refcode, crnNo) { 
  request.post({
    "headers": { "content-type": "application/json" },
    "url": reqip + ":4116/api/insnotification",
    "body": JSON.stringify({
      "notifyto": refenceid,
      "triggeredbytruid": truid,
      "notification": "Hooray! Earned 0.2 gms of 99% pure silver for referring " + fname + " " + lname + " with code " + refcode,
      "type": "registration",
      "subtype": "referal",
      "title": "Greetings",
      "referenceid": refenceid,
      "isflag": "consumer",
      "crnNo": crnNo
    })
  }, (error, body) => {
    if (error) {
      return console.dir(error);
    }
    // var newjson =  JSON.parse(body);
  }
  )
}