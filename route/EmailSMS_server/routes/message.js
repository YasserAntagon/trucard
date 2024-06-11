var express = require('express');
var router = express.Router();
require('dotenv').config();
var hbs = require('nodemailer-express-handlebars');
var request = require('request');
const sendMail = require("../config/sendMail");
var emailRoute = require('../db/emailRoute');
const sendsms = require("../model/sendsms");
const sendSMS = require("../model/sendsms"); 
router.post('/1002', (req, res, next) => {
  try {
    // var bearer = req.rawHeaders[3];
    console.log("resource", JSON.stringify(req.body))
    console.log("bearer", JSON.stringify(req.headers.authorization))
    console.log("bearer", process.env.token4)
    var bearer = req.headers.authorization;
    var array = bearer.split(" ");
    if (array[1] != process.env.token4) {
      res.json({ status: "401", message: "Unauthorized user!" });                         //token validations
    } else {
      let resource = req.body;
      if (resource.mailtype === "both" || resource.mailtype === "email") {
        var sendmailId;
        emailRoute.insertEmailLog({ resource: resource, status: "failure", txnby: "consumer" }, function (data) {
          sendmailId = data.id
        })
        let templateFile = "allmail"
        var options = {
          uri: process.env.ip + `/template/allemails/${templateFile}`,
          method: 'POST',
          json: {
            welcomeName: resource.senderName,
            message: resource.message,
            msgHeading: resource.msgHeading
          } // All the information that needs to be sent
        };
        request(options, function (error, response, body) {
          let subject = resource.emailSubject;
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
        if (resource.type == "resetPassword") {
          var jsons = {
            "From": "TruCrd",
            "To": resource.mobile,
            "TemplateName": "resetPassword",
            "VAR1": "Hi "+resource.senderName
          }
          sendSMS.sendsms(JSON.stringify(jsons), function (err, response) {
            // res.json({ status: 200 })
          })
        }
        
        // var sms = 'Hi ' + resource.senderName + "! " + resource.message;
        // res.json({ status: 200, sms: sms, mobile:resource.mobile})
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

router.post('/4002', (req, res, next) => {
  try {
    // var bearer = req.rawHeaders[3];
    console.log("resource", JSON.stringify(req.body))
    console.log("bearer", JSON.stringify(req.headers.authorization))
    console.log("bearer", process.env.token9)
    var bearer = req.headers.authorization;
    var array = bearer.split(" ");
    if (array[1] != process.env.token9) {
      res.json({ status: "401", message: "Unauthorized user!" });                         //token validations
    } else {
      let resource = req.body;
      if (resource.mailtype === "both" || resource.mailtype === "email") {
        var sendmailId;
        emailRoute.insertEmailLog({ resource: resource, status: "failure", txnby: "entity" }, function (data) {
          sendmailId = data.id
        })
        let templateFile = "enallmail"
        var options = {
          uri: process.env.ip + `/template/allemails/${templateFile}`,
          method: 'POST',
          json: {
            welcomeName: resource.senderName,
            message: resource.message,
            msgHeading: resource.msgHeading
          } // All the information that needs to be sent
        };
        request(options, function (error, response, body) {
          let subject = resource.emailSubject;
          // res.send(body)
          sendMail.sendEmail(resource, body, subject, function (info) {
            emailRoute.updateEmailLog(sendmailId, "success");
            res.send(info)
          })
        })
      }
      else {
        res.json({ status: 200 })
      }
      // if (resource.mailtype === "both" || resource.mailtype === "sms") {
      //   var sms = 'Hi ' + resource.senderName + "! " + resource.message;
      //   res.json({ status: 200, sms: sms, mobile:resource.mobile })
      // }
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

router.post('/4008', (req, res, next) => {
  try {
    // var bearer = req.rawHeaders[3];
    console.log("resource", JSON.stringify(req.body))
    console.log("bearer", JSON.stringify(req.headers.authorization))
    console.log("bearer", process.env.token13)
    var bearer = req.headers.authorization;
    var array = bearer.split(" ");
    if (array[1] != process.env.token13) {
      res.json({ status: "401", message: "Unauthorized user!" });                         //token validations
    } else {
      let resource = req.body;
      if (resource.mailtype === "both" || resource.mailtype === "email") {
        var sendmailId;
        emailRoute.insertEmailLog({ resource: resource, status: "failure", txnby: "entity" }, function (data) {
          sendmailId = data.id
        })
        let templateFile = "enUserReg"
        var options = {
          uri: process.env.ip + `/template/allemails/${templateFile}`,
          method: 'POST',
          json: {
            welcomeName: resource.Name,
            message: resource.message,
            msgHeading: resource.msgHeading,
            refName: resource.refName,
            type: resource.type
          } // All the information that needs to be sent
        };
        request(options, function (error, response, body) {
          let subject = resource.emailSubject;
          // res.send(body)
          sendMail.sendEmail(resource, body, subject, function (info) {
            emailRoute.updateEmailLog(sendmailId, "success");
            res.send(info)
          })
        })
      } 
      if (resource.mailtype === "both" || resource.mailtype === "sms") {
        var jsons = {
          "From": "TruCrd",
          "To": resource.mobile,
          "TemplateName": "truWelcome",
          "VAR1": resource.name,
          "VAR2": "0.2 gms of 99% pure Silver"
        }
        sendsms.sendsms(JSON.stringify(jsons), function (err, response) {
          // res.json({ status: 200 })
        })
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

module.exports = router;




