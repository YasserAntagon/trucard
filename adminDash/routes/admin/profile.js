var express = require('express');
var chngPwdDB = require('../../model/admin/changePasswordDB');
var empreq = require('../../model/admin/empprofile');
var errLog = require('../../model/config/db/errLogDb');
var iterator = require('../adminIterator');
var linkages = iterator();
var router = express.Router();
router.post('/bindServerList', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            chngPwdDB.bindServerList(function (err, res) {
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
        errLog.insertErrorLog(ex, req.session.aTruID, "bindServerList", "route/admin/profile");
    }
})
router.post('/getEmpProfile', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            empreq.getEmpProfile(json, function (err, res) {
                // console.log(res);
                if (err) throw err;
                response.send({
                    body: res,
                    page: linkages.empMaster
                })
            })
        } else {
            res.render('index', {
                title: 'Sign In'
            });
        }

    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.aTruID, "bindServerList", "route/admin/profile");
    }
})
router.post('/changeEmpPassword', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body); 
            var json = JSON.stringify(contain.objectArr[0]);
            serverListDB.changeEmpPassword(json,function (err, res) {
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
        errLog.insertErrorLog(ex, req.session.aTruID, "deleteServers", "route/admin/profile");
    }
})

router.post('/updateServer', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body); 
            var json = JSON.stringify(contain.objectArr[0]);
            serverListDB.updateServer(json,function (err, res) {
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
        errLog.insertErrorLog(ex, req.session.aTruID, "updateServer", "route/admin/profile");
    }
})

router.post('/resolvedServer', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body); 
            var json = JSON.stringify(contain.objectArr[0]);
            serverListDB.resolvedServer(json,function (err, res) {
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
        errLog.insertErrorLog(ex, req.session.aTruID, "resolvedServer", "route/admin/profile");
    }
})


module.exports = router;