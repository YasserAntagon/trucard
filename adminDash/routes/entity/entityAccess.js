var express = require('express');
var accessDB = require('../../model/entity/accessEntity'); 
var errLog = require('../../model/config/db/errLogDb');
var iterator = require('../entityIterator');

var linkages = iterator();
var router = express.Router();
router.post('/getAccessList', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);  
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            accessDB.getAccessList(json, function (err, res) { 
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
        errLog.insertErrorLog(ex, req.session.aTruID, "getAccessList", "routes/entity/entityAccess");
    }
});
router.post('/walletAccessConfig', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body); 
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            accessDB.walletAccessConfig(json, function (err, res) { 
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
        errLog.insertErrorLog(ex, req.session.aTruID, "walletAccessConfig", "routes/entity/entityAccess");
    }
});
router.post('/consumerTransConfig', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body); 
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            accessDB.consumerTransConfig(json, function (err, res) { 
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
        errLog.insertErrorLog(ex, req.session.aTruID, "consumerTransConfig", "routes/entity/entityAccess");
    }
});
router.post('/enSelfTransConfig', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body); 
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            accessDB.enSelfTransConfig(json, function (err, res) { 
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
        errLog.insertErrorLog(ex, req.session.aTruID, "enSelfTransConfig", "routes/entity/entityAccess");
    }
});
router.post('/globalPolicyConfig', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body); 
            contain.objectArr[0].truID = req.session.aTruID;
            contain.objectArr[0].allConsumerAccess = req.body.allConsumerAccess == "true" ? true : false;
            var json = JSON.stringify(contain.objectArr[0]);
            accessDB.globalPolicyConfig(json, function (err, res) { 
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
        errLog.insertErrorLog(ex, req.session.aTruID, "globalPolicyConfig", "routes/entity/entityAccess");
    }
});
router.post('/updaterevenuepercent', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body); 
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            console.log(json)
            accessDB.updaterevenuepercent(json, function (err, res) { 
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
        errLog.insertErrorLog(ex, req.session.aTruID, "globalPolicyConfig", "routes/entity/entityAccess");
    }
});
router.post('/transactionLimit', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body); 
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            accessDB.transactionLimit(json, function (err, res) { 
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
        errLog.insertErrorLog(ex, req.session.aTruID, "transactionLimit", "routes/entity/entityAccess");
    }
});
router.post('/updateConsumerAccess', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            accessDB.updateConsumerAccess(json, function (err, res) {
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
});
router.post('/updateConsumerLimit', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            accessDB.updateConsumerLimit(json, function (err, res) {
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
});
router.post('/updateWalletLimits', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            accessDB.updateWalletLimits(json, function (err, res) {
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
});
module.exports = router;