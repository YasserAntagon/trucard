var express = require('express');
var chargesDB = require('../../model/admin/chargesDB'); 
var errLog = require('../../model/config/db/errLogDb');
var iterator = require('../adminIterator');
var linkages = iterator();
var router = express.Router();
router.post('/setChargesRate', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            chargesDB.setC2DChargesRate(json, function (err, res) { 
                    response.send({
                        body: res,
                        page: linkages.home
                    }) 
            })
        } else {
            res.render('index', {
                title: 'Sign In'
            });
        }

    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.aTruID, "saveCharges", "Charges");
    }
})
router.post('/setD2DChargesRate', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            chargesDB.setC2DChargesRate(json, function (err, res) { 
                    response.send({
                        body: res,
                        page: linkages.home
                    }) 
            })
        } else {
            res.render('index', {
                title: 'Sign In'
            });
        }

    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.aTruID, "saveCharges", "Charges");
    }
})
router.post('/getChargesRate', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            chargesDB.getChargesRate(json, function (err, res) { 
                    response.send({
                        body: res,
                        page: linkages.home
                    }) 
            })
        } else {
            res.render('index', {
                title: 'Sign In'
            });
        }

    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.aTruID, "saveCharges", "Charges");
    }
}) 
router.post('/getClientChargesRate', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            chargesDB.getClientChargesRate(json, function (err, res) { 
                    response.send({
                        body: res,
                        page: linkages.home
                    }) 
            })
        } else {
            res.render('index', {
                title: 'Sign In'
            });
        }

    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.aTruID, "saveCharges", "Charges");
    }
}) 
router.post('/getWalletpayment', function (req, response, next) {
    try { 
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            chargesDB.getWalletPaymentLog(json, function (err, res) { 
                    response.send({
                        body: res,
                        page: linkages.home
                    }) 
            })
        } else {
            res.render('index', {
                title: 'Sign In'
            });
        }

    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.aTruID, "saveCharges", "Charges");
    }
}) 
router.post('/getAtompayment', function (req, response, next) {
    try { 
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            chargesDB.getAtomPaymentLog(json, function (err, res) { 
                    response.send({
                        body: res,
                        page: linkages.home
                    }) 
            })
        } else {
            res.render('index', {
                title: 'Sign In'
            });
        }

    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.aTruID, "saveCharges", "Charges");
    }
}) 
router.post('/getBankpayment', function (req, response, next) {
    try { 
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]); 
            chargesDB.getBankLog(json, function (err, res) { 
                    response.send({
                        body: res,
                        page: linkages.home
                    }) 
            })
        } else {
            res.render('index', {
                title: 'Sign In'
            });
        }

    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.aTruID, "saveCharges", "Charges");
    }
}) 
router.post('/getBankTxnStatus', function (req, response, next) {
    try { 
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]); 
            chargesDB.getBankTransactionStatus(json, function (err, res) { 
                    response.send({
                        body: res,
                        page: linkages.home
                    }) 
            })
        } else {
            res.render('index', {
                title: 'Sign In'
            });
        }

    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.aTruID, "saveCharges", "Charges");
    }
}) 

module.exports = router;