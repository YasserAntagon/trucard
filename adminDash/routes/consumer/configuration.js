var express = require('express');
var configDb = require('../../model/consumer/configurationDB'); 
var errLog = require('../../model/config/db/errLogDb');
var iterator = require('../consumerIterator');
var linkages = iterator();
var router = express.Router();
router.post('/getconsumerConfig', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            contain.objectArr[0].KYCFlag = req.body.flag == "check"? (req.session.consumer.docVerified ? "KYC" : "nonKYC") : req.body.flag;
            var json = JSON.stringify(contain.objectArr[0]);
            delete json["flag"];
            configDb.getconsumerConfig(json, function (err, res) {
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
        errLog.insertErrorLog(ex, req.session.aTruID, "getconsumerConfig", "route/consumer/configuration");
    }
})
router.post('/updateConsumerConfig', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            contain.objectArr[0].KYCFlag = req.body.KYCFlag == "check"? (req.session.consumer.docVerified ? "KYC" : "nonKYC") : req.body.KYCFlag;
            var json = JSON.stringify(contain.objectArr[0]);
            configDb.updateConsumerConfig(json, function (err, res) {
                response.send({
                    body: res,
                    page: linkages
                })
            })
        }
        else 
        {
            res.render('index', {
                title: 'Sign In'
            });
        }
    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.aTruID, "updateConsumerConfig", "route/consumer/configuration");
    }
})
router.post('/updateConsumerPG', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            configDb.updateConsumerPG(json, function (err, res) {
                response.send({
                    body: res,
                    page: linkages
                })
            })
        }
        else 
        {
            res.render('index', {
                title: 'Sign In'
            });
        }
    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.aTruID, "updateConsumerConfig", "route/consumer/configuration");
    }
})
router.post('/updateConsumerLimit', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            contain.objectArr[0].KYCFlag = req.body.KYCFlag == "check"? (req.session.consumer.docVerified ? "KYC" : "nonKYC") : req.body.KYCFlag;
            var json = JSON.stringify(contain.objectArr[0]);
            configDb.updateConsumerLimit(json, function (err, res) {
                response.send({
                    body: res,
                    page: linkages
                })
            })
        }
        else 
        {
            res.render('index', {
                title: 'Sign In'
            });
        }
    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.aTruID, "updateConsumerConfig", "route/consumer/configuration");
    }
})
router.post('/updateConsumerAccess', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            contain.objectArr[0].KYCFlag = req.body.KYCFlag == "check"? (req.session.consumer.docVerified ? "KYC" : "nonKYC") : req.body.KYCFlag;
            var json = JSON.stringify(contain.objectArr[0]);
            configDb.updateConsumerAccess(json, function (err, res) {
                response.send({
                    body: res,
                    page: linkages
                })
            })
        }
        else 
        {
            res.render('index', {
                title: 'Sign In'
            });
        }
    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.aTruID, "updateConsumerConfig", "route/consumer/configuration");
    }
})
router.post('/updateWalLimit', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            contain.objectArr[0].KYCFlag = req.body.KYCFlag == "check"? (req.session.consumer.docVerified ? "KYC" : "nonKYC") : req.body.KYCFlag;
            var json = JSON.stringify(contain.objectArr[0]);
            configDb.updateWalLimit(json, function (err, res) {
                response.send({
                    body: res,
                    page: linkages
                })
            })
        }
        else 
        {
            res.render('index', {
                title: 'Sign In'
            });
        }
    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.aTruID, "updateConsumerConfig", "route/consumer/configuration");
    }
})
router.post('/updateWalletLimits', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            contain.objectArr[0].KYCFlag = req.body.KYCFlag == "check"? (req.session.consumer.docVerified ? "KYC" : "nonKYC") : req.body.KYCFlag;
            var json = JSON.stringify(contain.objectArr[0]);
            configDb.updateWalletLimits(json, function (err, res) {
                response.send({
                    body: res,
                    page: linkages
                })
            })
        }
        else 
        {
            res.render('index', {
                title: 'Sign In'
            });
        }
    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.aTruID, "updateConsumerConfig", "route/consumer/configuration");
    }
})
router.post('/getSecureCredit', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            configDb.getSecureCredit(json, function (err, res) {
                response.send({
                    body: res,
                    page: linkages
                })
            })
        }
        else 
        {
            res.render('index', {
                title: 'Sign In'
            });
        }
    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.aTruID, "updateConsumerConfig", "route/consumer/configuration");
    }
})
router.post('/digitalPayments', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            contain.objectArr[0].KYCFlag = req.body.KYCFlag == "check"? (req.session.consumer.docVerified ? "KYC" : "nonKYC") : req.body.KYCFlag;
            var json = JSON.stringify(contain.objectArr[0]);
            configDb.digitalPayments(json, function (err, res) {
                response.send({
                    body: res,
                    page: linkages
                })
            })
        }
        else 
        {
            res.render('index', {
                title: 'Sign In'
            });
        }
    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.aTruID, "updateConsumerConfig", "route/consumer/configuration");
    }
})
module.exports = router;