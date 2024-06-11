var express = require('express');
var router = express.Router();
var refund = require('../../model/admin/refundDB'); 
router.post('/getAtomStatus', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID; 
            var json = JSON.stringify(contain.objectArr[0]);
            refund.atomRefund(json, function (err, res) {
                response.send(res)
            })
        } else {
            res.render('index', {
                title: 'Sign In'
            });
        }
    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.aTruID, "refundStatus", "initialRefund");
    }
})
router.post('/initialAtomRefund', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].pgstatus = "refund";
            contain.objectArr[0].truID = req.session.aTruID; 
            var json = JSON.stringify(contain.objectArr[0]);
            refund.atomRefund(json, function (err, res) {
                response.send(res)
            })
        } else {
            res.render('index', {
                title: 'Sign In'
            });
        }
    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.aTruID, "refundStatus", "initialRefund");
    }
})
router.post('/PGStatus', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body); 
            contain.objectArr[0].truID = req.session.aTruID; 
            var json = JSON.stringify(contain.objectArr[0]);
            refund.PGStatus(json, function (err, res) {
                response.send(res)
            })
        } else {
            res.render('index', {
                title: 'Sign In'
            });
        }
    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.aTruID, "refundStatus", "initialRefund");
    }
})

module.exports = router;