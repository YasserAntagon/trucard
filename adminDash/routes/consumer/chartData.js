var express = require('express');
var chartDb = require('../../model/consumer/getchartdata');
var errLog = require('../../model/config/db/errLogDb');
var iterator = require('../consumerIterator');
var linkages = iterator();
var router = express.Router();
router.post('/getpurchasedata', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            chartDb.getpurchasedata(json, function (err, res) {
                if (res) {

                    response.send({
                        body: res,
                        page: linkages
                    })
                }
                else {
                    response.send({
                        body: {
                            "status": "204",
                            "messege": "The request was successful but no body was returned."
                        },
                        page: linkages
                    })
                }

            })
        } else {
            res.render('index', {
                title: 'Sign In'
            });
        }

    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.aTruID, "getpurchasedata", "route/consumer/chartData");
    }
})
router.post('/getsaledata', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            chartDb.getsaledata(json, function (err, res) {
if (res) {
                response.send({
                    body: res,
                    page: linkages
                })
                 }
                else {
                    response.send({
                        body: {
                            "status": "204",
                            "messege": "The request was successful but no body was returned."
                        },
                        page: linkages
                    })
                }
            })
        } else {
            res.render('index', {
                title: 'Sign In'
            });
        }

    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.aTruID, "getsaledata", "route/consumer/chartData");
    }
})
module.exports = router;