var express = require('express');
var otpDB = require('../../model/otp');
var errLog = require('../../model/config/db/errLogDb');
var iterator = require('../adminIterator');
var linkages = iterator();
var router = express.Router();
router.post('/verifyOTPs', function (req, response, next) {
    try {
        
        let email = req.session.otpEmail;
        let mobile = req.session.otpmobile;
        if (email && mobile) {
            let json = JSON.stringify({
                "mobile": mobile,
                "email": email,
                "type": "mHash",
                "OTP": req.body.OTP
            }); 
            otpDB.verifyOTP(json, function (err, res) { 
                if (res.status == 200) {
                    req.session.destroy()
                }
                response.send({
                    body: res,
                    page: linkages.verifyHash
                })
            })
        }
        else {
            res.render('index', {
                title: 'Sign In'
            });
        }
    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.aTruID, "bindServerList", "ServerReport");
    }
})

router.post('/sendOTP', function (req, response, next) {
    try {
        let email = req.session.otpEmail;
        let mobile = req.session.otpmobile;
        if (email && mobile) {

            let json = JSON.stringify({
                "mobile": mobile,
                "email": email,
                "type": "mHash"
            });  
            otpDB.sendOTP(json, function (err, res) { 
                response.send({
                    body: res,
                    page: linkages.home
                })
            })
        }
        else {
            res.render('index', {
                title: 'Sign In'
            });
        }
    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.aTruID, "bindServerList", "ServerReport");
    }
})



module.exports = router