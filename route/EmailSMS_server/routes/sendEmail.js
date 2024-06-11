var express = require('express');
var router = express.Router();
const mail = require("../model/mail")
router.post('/sendBulkEmail', function (req, response, next) {

    let data = req.body;
    let to = data.body.to;
    mail.sendBulkEmail(JSON.parse(to), data.body.body, data.body.subject, data.body.flag, function (res) { 
    })
    response.send({ "status": 200, "message": "Mail sent successfully" })
})
router.post('/sendEntityEmail', function (req, response, next) { 
    let data = req.body.body;
    let to = data.to; 
    mail.sendEmailAttachment(JSON.parse(to), data.bodyData, data.subject, data.flag,data.attach, function (res) { })
    response.send({
        "status": "200",
        "message": "Mail sent successfully"
    })
})
router.post('/sentContactUSfromWeb', function (req, response, next) {

    
    let data = req.body
    let to = data.to;
    let name = data.name;
    let msg = "<p><b>Hi " + name + "</b><br>" +
        "We received your email. Thanks for writing to us.<br>" +
        "You have probably realized by now that this is an automated message. <br><br>" +
        "We need some time to process each email that we receive, but we will write back to you personally as soon as we can. Thank you for your understanding!<br>" +
        "<br><b>Your Querie : " + data.body + "</b><br>" +
        "<br><br><b>Kind regards</b><br>" +
        "Your Company Team<br>" +
        "Company Name</p>"

    var Contact = data.phone ? "Contact No : " + data.phone : ""
    let msg1 = "<p><b>Hi </b><br>" +
        "You received mail from official website.<br><br>" +
        "<b>Queris : " + data.body + "</b><br>" +
        "<br> <b>Regards</b><br>" +
        name + "<br>" +
        Contact + "</p>"

    mail.sendEmailOfficial(to, msg, data.subject, data.name, msg1, function (res) {

        
    })
    response.send({
        "status": 200,
        "message": "Mail sent successfully"
    })
})
router.post('/sendBulkSMS', function (req, response, next) {

    let data = req.body
    let to = data.to;
    /*mail.sendEmail(to, data.body, data.subject, function (res) { 
        response.send({
            "status": 200,
            "message": res
        })
    })*/
    response.send({
        "status": 200,
        "message": "SMS sent successfully"
    })
}); 
module.exports = router;
