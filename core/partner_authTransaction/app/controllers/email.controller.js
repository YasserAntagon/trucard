const request = require('request'),
  Gen = require("../Generics"),
  conf = require("../conf");

var reqip = conf.EmaiReqIP;
var mailURL1 = Gen.mailURL;

module.exports.email_registartion = function (email, fname, lname, mailURL2) {
  var date = Date.parse(new Date());
  var expiry = (date + Gen.emailExpiryTime).toString();
  let emailexpiry = Buffer.from(expiry, "utf8").toString("base64");
  var mailurl = mailURL1 + mailURL2 + "&exp=" + emailexpiry;
  request.post({
    "headers": { "content-type": "application/json", "Authorization": "Bearer " + Gen.bearer4001 },
    "url": reqip + ":39541/4001",
    "body": JSON.stringify({
      "mailTo": email,
      "name": fname + " " + lname,
      "verifyLink": mailurl,
      "mailtype": "email"
    })
  }, (error, body) => {
    if (error) {
      return console.dir(error);
    }
    // var newjson =  JSON.parse(body);
  }
  )
}
module.exports.resetPasswordon_registartion = function (email, fname, lname, tempPwd, webPanel) {
  request.post({
    "headers": { "content-type": "application/json", "Authorization": "Bearer " + Gen.bearer4001 },
    "url": reqip + ":39541/4011",
    "body": JSON.stringify({
      "mailTo": email,
      "name": fname + " " + lname,
      "tempPwd": tempPwd,
      "mailtype": "email",
      "webPanel": webPanel
    })
  }, (error, body) => {
    if (error) {
      return console.dir(error);
    }
  })
}
module.exports.changePasswordMPIN = function (flag, email, mobile, entityname, mailtype) {
  var msgheading = "",
    emailsubject = "",
    message = "";
  if (flag === "passwordReset") {
    emailsubject = entityname + ",  your password was successfully reset.";
    message = " Greetings , As Per your request, we have successfully changed your password.\n you can contact us for any reason, Thank you for being with us.";
  } else if (flag === "MPINReset") {
    emailsubject = entityname + ",  your Mobile PIN was successfully reset.";
    message = " Greetings , As Per your request, we have successfully changed your mobile PIN.\n you can contact us for any reason, Thank you for being with us.";;
  }
  request.post({
    "headers": { "content-type": "application/json", "Authorization": "Bearer " + Gen.bearer4002 },
    "url": reqip + ":39541/4002",
    "body": JSON.stringify({
      // {
      "mailTo": email,
      "senderName": entityname,
      "msgHeading": msgheading,
      "emailSubject": emailsubject,
      "message": message,
      "mobile": mobile,
      "mailtype": mailtype
      // }

    })
  }, (error, body) => {
    if (error) {
      return console.dir(error);
    }
    // var newjson =  JSON.parse(body);
  }
  )
}
