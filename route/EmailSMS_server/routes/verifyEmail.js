var express = require('express');
var router = express.Router();
var hbs = require('nodemailer-express-handlebars');
require('dotenv').config();
var request = require('request');
var emailRoute = require('../db/emailRoute');
const sendMail = require("../config/sendMail");
const sendsms = require("../model/sendsms");
router.post('/1001', (req, res, next) => {
    try {
        // var bearer = req.rawHeaders[3];
        console.log("resource", JSON.stringify(req.body))
        console.log("bearer", JSON.stringify(req.headers.authorization))
        console.log("bearer", process.env.token1)
        var bearer = req.headers.authorization;
        var array = bearer.split(" ");
        if (array[1] != process.env.token1) {
            res.json({ status: "401", message: "Unauthorized user!" });                         //token validations
        } else {
            let resource = req.body;
            if (resource.mailtype === "both" || resource.mailtype === "email") {
                var sendmailId;
                emailRoute.insertEmailLog({ resource: resource, status: "failure", txnby: "consumer" }, function (data) {
                    sendmailId = data.id
                })                
            }
            else {
                res.json({ status: 200 })
            }
            /* if (resource.mailtype === "both" || resource.mailtype === "sms") {
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
            } */
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
router.post('/4001', (req, res, next) => {
    try {
        // var bearer = req.rawHeaders[3];
        console.log("resource", JSON.stringify(req.body))
        console.log("bearer", JSON.stringify(req.headers.authorization))
        console.log("bearer", process.env.token10)
        var bearer = req.headers.authorization;
        var array = bearer.split(" ");
        if (array[1] != process.env.token10) {
            res.json({ status: "401", message: "Unauthorized user!" });                         //token validations
        } else {
            let resource = req.body;
            if (resource.mailtype === "both" || resource.mailtype === "email") {
                var sendmailId;
                emailRoute.insertEmailLog({ resource: resource, status: "failure", txnby: "entity" }, function (data) {
                    sendmailId = data.id
                })               
            }
            else {
                res.json({ status: 200 })
            }
            /* if (resource.mailtype === "both" || resource.mailtype === "sms") {
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
            } */
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
router.post('/sendOTPEmail', (req, res, next) => {
    try {
        // var bearer = req.rawHeaders[3];
        console.log("resource", JSON.stringify(req.body))
        console.log("bearer", JSON.stringify(req.headers.authorization))
        console.log("bearer", process.env.token1)
        var bearer = req.headers.authorization;
        var array = bearer.split(" ");
        if (array[1] != process.env.token1) {
            res.json({ status: "401", message: "Unauthorized user!" });                         //token validations
        } else {
            let resource = req.body;
            var sendmailId;
            emailRoute.insertEmailLog({ resource: resource, status: "failure", txnby: "consumer" }, function (data) {
                sendmailId = data.id
            })
            let templateFile = "verifyEmailOtp"
            var options = {
                uri: process.env.ip + `/template/verifye/${templateFile}`,
                method: 'POST',
                json: {
                    "resource": resource,
                } // All the information that needs to be sent
            };
            request(options, function (error, response, body) {
                let subject = 'Account Verification';
                // res.send(body)
                sendMail.sendtransferEmail(body, resource.mailTo, subject, function (info) {
                    emailRoute.updateEmailLog(sendmailId, "success");
                    res.send({status:200, resource:info})
                })
            })


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
router.post('/ensendOTPEmail', (req, res, next) => {
    try {
        // var bearer = req.rawHeaders[3];
        console.log("resource", JSON.stringify(req.body))
        console.log("bearer", JSON.stringify(req.headers.authorization))
        console.log("bearer", process.env.token1)
        var bearer = req.headers.authorization;
        var array = bearer.split(" ");
        if (array[1] != process.env.token1) {
            res.json({ status: "401", message: "Unauthorized user!" });                         //token validations
        } else {
            let resource = req.body;
            var sendmailId;
            emailRoute.insertEmailLog({ resource: resource, status: "failure", txnby: "consumer" }, function (data) {
                sendmailId = data.id
            })
            let templateFile = "verifyEmailOtp"
            var options = {
                uri: process.env.ip + `/template/verifye/${templateFile}`,
                method: 'POST',
                json: {
                    "resource": resource,
                } // All the information that needs to be sent
            };
            request(options, function (error, response, body) {
                let subject = 'Account Verification';
                // res.send(body)
                sendMail.sendtransferEmail(body, resource.mailTo, subject, function (info) {
                    emailRoute.updateEmailLog(sendmailId, "success");
                    res.send({status:200, resource:info})
                })
            })


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
