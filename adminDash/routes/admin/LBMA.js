var express = require('express');
var lbmaDB = require('../../model/admin/lbmaDB');
var errLog = require('../../model/config/db/errLogDb');
var iterator = require('../adminIterator');
var linkages = iterator();
var router = express.Router();

 

router.post('/bindPayoutLevel', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            lbmaDB.bindPayoutLevel(json, function (err, res) {
                response.send({ body: res, page: linkages.home })
            })
        } else {
            res.render('index', {
                title: 'Sign In'
            });
        }

    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.aTruID, "setLBMARate", "LBMA");
    }
})
router.post('/getChartRateData', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            lbmaDB.getChartRateData(json, function (err, res) {
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
        errLog.insertErrorLog(ex, req.session.aTruID, "setLBMARate", "LBMA");
    }
})
router.post('/setLBMARate', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            lbmaDB.setLBMARate(json, function (err, res) {
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
        errLog.insertErrorLog(ex, req.session.aTruID, "setLBMARate", "LBMA");
    }
})
router.post('/getLiveRates', function (req, response, next) {
    try {
        if (req.session.aTruID) { 
            lbmaDB.getLiveRates(function (err, res) {
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
        errLog.insertErrorLog(ex, req.session.aTruID, "saveLBMA", "LBMA");
    }
})
router.post('/getLBMARate', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            lbmaDB.getLBMARate(json, function (err, res) {
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
        errLog.insertErrorLog(ex, req.session.aTruID, "saveLBMA", "LBMA");
    }
})
router.post('/getLBMAAnalysisRate', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var json = JSON.stringify({
                truID: req.session.aTruID
            });
            lbmaDB.getLBMAAnalysisRate(json, function (err, res)   // company data got from Lokijs
            {
                if (err) throw err;
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
        errLog.insertErrorLog(ex, req.session.aTruID, "saveLBMA", "LBMA");
    }
})

router.post('/setRateByAdmin', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            lbmaDB.setLiveRateByAdmin(json, function (err, res) {
                if (err) { errLog.insertErrorLog(err, req.session.dlrTruID, "error_setRate24K", "setredeemRate") }
                response.send({
                    body: res,
                    page: linkages.home
                })
            });
        }
    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.dlrTruID, "error_setRate24K", "setRate");
    }
}) 
router.post('/getLiveRateByAdmin', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            lbmaDB.getLiveRateByAdmin(json, function (err, res) {
                if (err) { errLog.insertErrorLog(err, req.session.dlrTruID, "error_setRate24K", "setredeemRate") }
                response.send({
                    body: res,
                    page: linkages.home
                })
            });
        }
    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.dlrTruID, "error_setRate24K", "setRate");
    }
})
router.post('/liveRateLog', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            lbmaDB.liveRateLog(json, function (err, res) {
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
        errLog.insertErrorLog(ex, req.session.aTruID, "saveLBMA", "LBMA");
    }
})
router.post('/totalStockLog', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            lbmaDB.totalStock(json, function (err, res) {
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
        errLog.insertErrorLog(ex, req.session.aTruID, "saveLBMA", "LBMA");
    }
})
router.post('/clientRate', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            lbmaDB.clientRate(json, function (err, res) {
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
        errLog.insertErrorLog(ex, req.session.aTruID, "saveLBMA", "LBMA");
    }
})
router.post('/alertSubmit', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            lbmaDB.alertSubmit(json, function (err, res) {
                response.send(res)
            })
        } else {
            res.render('index', {
                title: 'Sign In'
            });
        }

    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.aTruID, "saveLBMA", "LBMA");
    }
})
router.post('/setStockByAdmin', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            lbmaDB.setStockByAdmin(json, function (err, res) {
                response.send(res)
            })
        } else {
            res.render('index', {
                title: 'Sign In'
            });
        }

    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.aTruID, "saveLBMA", "LBMA");
    }
})
router.post('/getStockLog', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            lbmaDB.getStockLog(json, function (err, res) {
                response.send(res)
            })
        } else {
            res.render('index', {
                title: 'Sign In'
            });
        }

    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.aTruID, "saveLBMA", "LBMA");
    }
})


module.exports = router;