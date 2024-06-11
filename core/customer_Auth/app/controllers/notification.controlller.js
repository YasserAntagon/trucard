const request = require('request'),
  Gen = require("../Generics");

var reqip = Gen.reqip;
function decimalChopper(num, fixed) {
  var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?');
  return num.toString().match(re)[0];
}

module.exports.notification_registartion = function (truid, fname) {
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
module.exports.notify_refree = function (truid, refenceid, fname, lname, refcode, crnNo, qty, bullionType) {
  var msg = "Hooray! Earned " + decimalChopper(qty, 4) + " gms of " + (bullionType === "S99P" ? "TruSilver" : "TruGold") + " for referring " + fname + " " + lname;
  request.post({
    "headers": { "content-type": "application/json" },
    "url": reqip + ":4116/api/insnotification",
    "body": JSON.stringify({
      "notifyto": refenceid,
      "triggeredbytruid": truid,
      "notification": msg,
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