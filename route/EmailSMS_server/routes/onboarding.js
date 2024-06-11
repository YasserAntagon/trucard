var express = require('express');
var router = express.Router();
var hbs = require('nodemailer-express-handlebars');
require('dotenv').config();
var request = require('request');
var emailRoute = require('../db/emailRoute');
const sendMail = require("../config/sendMail");
const sendsms = require("../model/sendsms");
router.post('/onboardingConsumerFromAdmin', (req, res, next) => {
    try { 
        var bearer = req.headers.authorization;
        var array = bearer.split(" ");
        if (array[1] != process.env.token1) {
            res.json({ status: "401", message: "Unauthorized user!" });                         //token validations
        } else {
            let resource = req.body;
            if (resource.mailtype === "both" || resource.mailtype === "email") {
                var sendmailId;
                emailRoute.insertEmailLog({ resource: resource, status: "failure", txnby: "regFromAdmin" }, function (data) {
                    sendmailId = data.id
                })
                let templateFile = "onReg"
                var options = {
                    uri: process.env.ip + `/template/email/${templateFile}`,
                    method: 'POST',
                    json: {
                        "resource": resource,
                    } // All the information that needs to be sent
                };
                request(options, function (error, response, body) {
                    let subject = ' account has been created successfully'; 
                    sendMail.sendEmail(resource, body, subject, function (info) {
                        emailRoute.updateEmailLog(sendmailId, "success");
                        res.send(info)
                    })
                })
            }
            // else {
            //     res.json({ status: 200 })
            // }
            if (resource.mailtype === "both" || resource.mailtype === "sms") {
                var jsons = {
                    "VAR1": resource.name,
                    "From": "TruCrd",
                    "To": resource.mobile,
                    "TemplateName": "truWelcome",
                    "VAR2": "0.2 gms of 99% pure silver"
                }
                sendsms.sendsms(JSON.stringify(jsons), function (err, response) {
                    // res.json({ status: 200 })
                })
                // var sms = 'Hi ' + resource.name + '! Please click the link below to complete' + 
                // ' your account verification. \n ' + resource.verifyLink;
                // res.json({status:200, sms:sms, mobile:resource.mobile})
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
