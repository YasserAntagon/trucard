'use strict'
var tokenUpdate = require("./tokenUpdate");
let { randomOTP } = require('../config');
module.exports = {
    otpSendPaul: function (req, newjson, res) {
        var mobile = newjson.mobile;
        if (mobile && mobile.length == 10) {
            if (randomOTP) {
                // use Your OTP Server URL
                request('https://', function (error, response, body) {

                    if (error) {
                        res.status(500).json({ status: "500", message: "OTP server error" });
                    }
                    else if (response && response.statusCode == 200) {
                        delete newjson.otp;
                        delete newjson.mobile;
                        tokenUpdate(req);
                        res.status(200).json(newjson);
                    }
                    else {
                        delete newjson.otp;
                        delete newjson.mobile;
                        res.status(200).json(newjson);
                    }
                });
            }
            else {
                delete newjson.otp;
                delete newjson.mobile;
                tokenUpdate(req);
                res.status(200).json(newjson);
            }
        }
        else {
            res.status(411).json({ status: "411", message: "Invalid Consumer mobile" });
        }
    }
}