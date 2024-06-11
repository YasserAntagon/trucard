var express = require('express');
var router = express.Router();
var MailConfig = require('../config/email');
var hbs = require('nodemailer-express-handlebars');
const gmailTransport = MailConfig.GmailTransport;
require('dotenv').config();
const request = require("request")
const sendMail = require("../config/sendMail");
const sendSMS = require("../model/sendsms");
var emailRoute = require('../db/emailRoute');
router.post('/1009', (req, res, next) => {
  try {
    // var bearer = req.rawHeaders[3];
    console.log("resource", JSON.stringify(req.body))
    console.log("bearer", JSON.stringify(req.headers.authorization))
    console.log("bearer", process.env.token6)
    var bearer = req.headers.authorization;
    var array = bearer.split(" ");
    if (array[1] != process.env.token6) {
      res.json({ status: "401", message: "Unauthorized user!" });                         //token validations
    } else {
      let resource = req.body;
      if (resource.mailtype === "both" || resource.mailtype === "email") {
        var sendmailId;
        emailRoute.insertEmailLog({ resource: resource, status: "failure", txnby: "consumer" }, function (data) {
          sendmailId = data.id
        })
        let templateFile = "kycActivation"
        var options = {
          uri: process.env.ip + `/template/email/${templateFile}`,
          method: 'POST',
          json: {
            "resource": resource
          } // All the information that needs to be sent
        };
        request(options, function (error, response, body) {
          let subject = 'Truwallet Balance';
          sendMail.sendEmail(resource, body, subject, function (info) {
            emailRoute.updateEmailLog(sendmailId, "success");
            res.send(info)
          })
        })
      }
      // else {
      //   res.json({ status: 200 })
      // }
      if (resource.mailtype === "both" || resource.mailtype === "sms") {
        var jsons = {
          "From": "TruCrd",
          "To": "8275340751",
          "TemplateName": "kycDetails",
          "VAR1": "your kyc of Company verified"
        }
      /*   sendSMS.sendsms(JSON.stringify(jsons), function (err, response) {
          
        }) */ 
      }
    }
  }
  catch (err) {
    console.log(err);
    return res.status(200).send({
      "error": {
        "message": "Something went wrong"
      }
    });
  }
});
router.get('*', (req, res, next) => {
  next();
});
module.exports = router;
