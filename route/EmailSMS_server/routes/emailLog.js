var express = require('express');
var router = express.Router();
const request = require("request");
var emailRoute = require('../db/emailRoute');
router.post('/9001', (req, res, next) => {
    try {
        var bearer = req.headers.authorization;
        if (!bearer) {
            res.json({ status: "400", message: "Bad Request!" });
        } else {
            var array = bearer.split(" ");
            if (array[1] != process.env.token12) {
                res.json({ status: "401", message: "Unauthorized user!" });                         //token validations
            } else {
                var resource = req.body;
                emailRoute.getEmailLog(resource, function (data) {
                    res.json({ status: 200, resource: data })
                })
            }
        }
    }
    catch (ex) {

    }
});
module.exports = router;