var express = require('express');
var consumerDataDb = require('../../model/consumer/db/consumerData'); 
var consumerListDB = require('../../model/consumer/consumerListDB');
var routeDb = require('../../model/consumer/db/route');
var errLog = require('../../model/config/db/errLogDb');
var txnDb = require('../../model/consumer/getconsumer');
let sys_conf = require('../../model/config/sys_conf');
var iterator = require('../consumerIterator');
var linkages = iterator();
var router = express.Router();
router.post('/getinvoice', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            txnDb.getinvoice(json, function (err, res) {
                response.send({
                    body: res,
                    page: linkages,
                    config: sys_conf
                })
            })
        } else {
            res.render('index', {
                title: 'Sign In'
            });
        }

    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.aTruID, "getBuyHistory", "route/consumer/consumerDB");
    }
})
router.post('/getAssetManagerPaymentInvoice', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            contain.objectArr[0].reqFlag = "consumer";
            var json = JSON.stringify(contain.objectArr[0]);
            txnDb.getinvoice(json, function (err, res) {
                if (res.status == 200) {
                    response.send({
                        body: res,
                        page: linkages.home,
                        reqFlag: "consumer",
                        config: sys_conf,
                        enDetails: req.session.eData
                    })
                }
                else {
                    var contain = {};
                    var objectArr = []
                    contain.objectArr = objectArr;
                    contain.objectArr.push(req.body);
                    contain.objectArr[0].truID = req.session.aTruID;
                    contain.objectArr[0].reqFlag = "assetmanager";
                    var json1 = JSON.stringify(contain.objectArr[0]);
                    txnDb.getinvoice(json1, function (err, res) {
                        response.send({
                            body: res,
                            page: linkages.home,
                            reqFlag: "assetmanager",
                            config: sys_conf,
                            enDetails: req.session.eData
                        })
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
        errLog.insertErrorLog(ex, req.session.aTruID, "getinvoice", "routes/entity/eEntity");
    }
})
router.post('/getinvoicetransfer', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            txnDb.getinvoicetransfer(json, function (err, res) {
                response.send({
                    body: res,
                    page: linkages,
                    config: sys_conf
                })
            })
        } else {
            res.render('index', {
                title: 'Sign In'
            });
        }

    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.aTruID, "getBuyHistory", "route/consumer/consumerDB");
    }
})
router.post('/getconsumerRefListDB', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            routeDb.getconsumerRefListDB(req.body, function (res) {
                response.send({
                    body: res,
                    page: linkages,
                    config: sys_conf
                })
            })
        } else {
            res.render('index', {
                title: 'Sign In'
            });
        }

    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.aTruID, "getBuyHistory", "route/consumer/consumerDB");
    }
})
router.post('/getConsumerWalletLog', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            routeDb.getConsumerWalletLog(req.body.cTruID, function (res) {
                response.send({
                    body: res,
                    page: linkages,
                    config: sys_conf
                })
            })
        } else {
            res.render('index', {
                title: 'Sign In'
            });
        }

    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.aTruID, "getBuyHistory", "route/consumer/consumerDB");
    }
})
router.post('/getBuyHistory', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var cTruID = req.body.cTruID
            let status = req.body.status;
            routeDb.getBuyHistory(cTruID, status, function (res) {
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
        errLog.insertErrorLog(ex, req.session.aTruID, "getBuyHistory", "route/consumer/consumerDB");
    }
})
router.post('/getredeemHistory', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var cTruID = req.body.cTruID
            let status = req.body.status;
            routeDb.getredeemHistory(cTruID, status, function (res) {
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
        errLog.insertErrorLog(ex, req.session.aTruID, "getredeemHistory", "route/consumer/consumerDB");
    }
})
router.post('/getConversionHistory', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var cTruID = req.body.cTruID
            let status = req.body.status;
            routeDb.getConversionHistory(cTruID, status, function (res) {
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
        errLog.insertErrorLog(ex, req.session.aTruID, "getredeemHistory", "route/consumer/consumerDB");
    }
})
router.post('/gettransferHistory', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var cTruID = req.body.cTruID
            let status = req.body.status;
            routeDb.gettransferHistory(cTruID, status, function (res) {
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
        errLog.insertErrorLog(ex, req.session.aTruID, "gettransferHistory", "route/consumer/consumerDB");
    }
})
router.post('/gettransferHistorydr', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var cTruID = req.body.cTruID
            let status = req.body.status;
            routeDb.gettransferHistorydr(cTruID, status, function (res) {
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
        errLog.insertErrorLog(ex, req.session.aTruID, "gettransferHistorydr", "route/consumer/consumerDB");
    }
})

router.post('/getConsumerData', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var json = { truID: req.session.aTruID,cTruID: req.body.truID };
            txnDb.getConsumerdetails(JSON.stringify(json), function (err,res) {
                response.send({
                    body: res.resource,
                    page: linkages,
                    config: sys_conf
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
        errLog.insertErrorLog(ex, req.session.aTruID, "getConsumerData", "route/consumer/consumerDB");
    }
})
module.exports = router;