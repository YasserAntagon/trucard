'use strict'
var conf = require("../config");
var request = require('request');
exports.consumerSummary = function (req, res) {
    var bearer = req.headers.authorization;
    var array = bearer.split(" ");

    if (array[1] != conf.bearer10) {
        res.json({ status: "1007", message: "Unauthorized Token!" });
    } else {
        var truID = req.body.to;
        var letterNumber = /^[0-9]+$/;
        if (truID && truID.match(letterNumber)) {
            request.post({
                "headers": { "content-type": "application/json" },
                "url": conf.adminCore + ":5114/api/consumergstreport",
                "body": JSON.stringify(req.body)
            }, (error, response, body) => {
                if (error) {
                    res.json({ status: "500", message: error.message })
                }
                else {
                    var newjson = JSON.parse(body);
                    res.json(newjson);
                }
            });
        } else {
            res.json({
                status: "411",
                message: 'Please provide valid fields..!!'
            })
        }
    }
};
exports.bind_WalletLog = function (req, res) {
    var bearer = req.headers.authorization;
    var array = bearer.split(" ");

    if (array[1] != conf.bearer10) {
        res.json({ status: "1007", message: "Unauthorized Token!" });
    } else {
        var truID = req.body.to;
        var letterNumber = /^[0-9]+$/;
        if (truID && truID.match(letterNumber)) {
            request.post({
                "headers": { "content-type": "application/json" },
                "url": conf.adminCore + ":5114/api/bind_WalletLog",
                "body": JSON.stringify(req.body)
            }, (error, response, body) => {
                if (error) {
                    res.json({ status: "500", message: error.message })
                }
                else {
                    var newjson = JSON.parse(body);
                    res.json(newjson);
                }
            });
        } else {
            res.json({
                status: "411",
                message: 'Please provide valid fields..!!'
            })
        }
    }
};

