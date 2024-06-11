var express = require('express');
var errorListDB = require('../../model/admin/errorListDB');
var errLog = require('../../model/config/db/errLogDb');
var iterator = require('../adminIterator');
var linkages = iterator();
var router = express.Router();
router.post('/bindAllErrorLog', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            errorListDB.bindAllErrorLog(function (err, res) {
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
        errLog.insertErrorLog(ex, req.session.aTruID, "saveErrorData", "errorLogList");
    }
})
router.post('/deleteAllErrorLog', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            errorListDB.deleteAllErrorLog(function (err, res) {
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
        errLog.insertErrorLog(ex, req.session.aTruID, "saveErrorData", "errorLogList");
    }
})
module.exports = router;