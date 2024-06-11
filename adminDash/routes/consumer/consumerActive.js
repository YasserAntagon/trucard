var express = require('express');
var consDb = require('../../model/consumer/getconsumer');
var errLog = require('../../model/config/db/errLogDb');
var loadTrans = require('../../model/consumer/db/consumerData');
var iterator = require('../consumerIterator');
var linkages = iterator();
var router = express.Router();
router.post('/kycDocUpdate', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            consDb.saveKYCDoc(json, function (err, res) {

                var json1 = JSON.stringify({
                    "truID": req.session.aTruID,
                    "cTruID": req.body.cTruID,
                    "kycFlag": "active"
                });
                consDb.deactivatrAccount(json1, function (err, res) {
                    if (res.status == "200") {
                        var resm = res.resource;
                        var inputjSON = { cTruID: resm.cTruID, KYCFlag: resm.KYCFlag };
                        loadTrans.updateFlag(inputjSON)
                    }
                    response.send({
                        body: res,
                        page: linkages
                    })
                })
            })
        } else {
            res.render('index', {
                title: 'Sign In'
            });
        }

    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.aTruID, "deactivatrAccount", "route/consumer/configuration");
    }
})

router.post('/getDoc', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            var json = JSON.stringify(contain.objectArr[0]);
            consDb.getDoc(json, function (err, res) {
                response.send({ body: res, page: linkages })
            })
        } else {
            res.render('index', {
                title: 'Sign In'
            });
        }

    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.aTruID, "deactivatrAccount", "route/consumer/configuration");
    }
})
router.post('/deactivatrAccount', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            consDb.deactivatrAccount(json, function (err, res) {
                if (res.status == "200") {
                    var inputjSON = res.resource;
                    loadTrans.updateFlag(inputjSON)
                }
                response.send({
                    body: res,
                    page: linkages
                })
            })
        } else {
            res.render('index', { title: 'Sign In' });
        }
    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.aTruID, "deactivatrAccount", "route/consumer/configuration");
    }
})
router.post('/activateAccount', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            consDb.activateAccount(json, function (err, res) {

                if (res.status == "200") {
                    var inputjSON = res.resource;
                    loadTrans.updateFlag(inputjSON.truID,inputjSON)
                }
                response.send({
                    body: res,
                    page: linkages
                })
            })
        } else {
            res.render('index', {
                title: 'Sign In'
            });
        }

    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.aTruID, "deactivatrAccount", "route/consumer/configuration");
    }
})
router.post('/searchConsumerdetails', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            consDb.searchConsumerdetails(json, function (err, res) {
                loadTrans.insertconsumerData(res);
                response.send({
                    body: res,
                    page: linkages
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
        errLog.insertErrorLog(ex, req.session.aTruID, "searchConsumerdetails", "route/consumer/configuration");
    }
})
module.exports = router;