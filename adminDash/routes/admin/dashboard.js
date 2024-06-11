var express = require('express');
var dashDB = require('../../model/admin/dashboard');
var errLog = require('../../model/config/db/errLogDb');
var iterator = require('../adminIterator');
var linkages = iterator();
var router = express.Router();

router.post('/getmostActiveTxn', function (req, res, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);

            dashDB.getmostActiveTxn(json, function (err, response) {
                res.send(response);
            });
        } else {
            res.render('index', {
                title: 'Sign In'
            });
        }
    } catch (ex) {
        errLog.insertErrorLog(ex, req.session.etruID, "getTransactionLien", "dashboard");
    }
});
router.post('/dailyStock', function (req, res, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            if (req.body.rTruID && req.body.cTruID) {
                res.send({ result: [], message: "Please select partner or consumer. Both are not allowed" });
            }
            else {
                contain.objectArr = objectArr;
                contain.objectArr.push(req.body);
                contain.objectArr[0].truID = req.session.aTruID;
                var json = JSON.stringify(contain.objectArr[0]);

                dashDB.dailystocktxn(json, function (err, response) {
                    res.send(response);
                });
            }
        } else {
            res.render('index', {
                title: 'Sign In'
            });
        }
    } catch (ex) {
        errLog.insertErrorLog(ex, req.session.etruID, "getTransactionLien", "dashboard");
    }
});
router.post('/getInvoiceTrans', function (req, res, next) {
    try {
        if (req.session.etruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].rTruID = req.session.rTruID;
            contain.objectArr[0].truID = req.session.truID;
            var json = JSON.stringify(contain.objectArr[0]);

            dashDB.getTransactionLien(json, function (err, response) {
                if (err) {
                    errLog.insertErrorLog(err, req.session.etruID, "error_getTransactionLien", "dashboard");

                };
                var entityDetails =
                {
                    "etruID": req.session.etruID,
                    "entityName": req.session.assetmanagerName,
                    "address": req.session.address,
                    "address1": req.session.address1,
                    "address2": req.session.address2
                }
                res.send({ "rinvoice": response, "entityDetails": entityDetails });
            });
        } else {
            res.render('index', {
                title: 'Sign In'
            });
        }
    } catch (ex) {
        errLog.insertErrorLog(ex, req.session.etruID, "getTransactionLien", "dashboard");
    }

});
router.post('/getInvoice', function (req, res, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].rTruID = req.session.rTruID;
            contain.objectArr[0].truID = req.session.truID;
            var json = JSON.stringify(contain.objectArr[0]);
            dashDB.getTransaction(json, function (err, response) {
                if (err) {
                    errLog.insertErrorLog(err, req.session.etruID, "error_getTransaction", "dashboard");

                };
                var entityDetails =
                {
                    "etruID": req.session.etruID,
                    "entityName": req.session.assetmanagerName,
                    "address": req.session.address,
                    "address1": req.session.address1,
                    "address2": req.session.address2
                }
                res.send({ "rinvoice": response, "entityDetails": entityDetails });
            });
        } else {
            res.render('index', {
                title: 'Sign In'
            });
        }
    } catch (ex) {
        errLog.insertErrorLog(ex, req.session.etruID, "getTransaction", "dashboard");
    }
});
router.post('/getConsumerDetails', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var json = JSON.stringify({
                "truID": req.session.aTruID
            })
            dashDB.getConsumerDetails(json, function (err, res) {
                if (res) {
                    response.send({
                        body: res,
                        page: linkages.home
                    })
                }
                else {
                    response.send({
                        body: {
                            "status": "204",
                            "messege": "The request was successful but no body was returned."
                        },
                        page: linkages.home
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
        errLog.insertErrorLog(ex, req.session.aTruID, "getConsumerDetails", "routes/admin/dashboard");
    }
})
router.post('/getAssetManagerTxnDetails', function (req, response, next) { // all txn count
    try {
        if (req.session.aTruID) {
            var json = JSON.stringify({
                "truID": req.session.aTruID
            })
            dashDB.getAssetManagerDetails(json, function (err, res) {
                if (res) {
                    response.send({
                        body: res,
                        page: linkages.home
                    })
                }
                else {
                    response.send({
                        body: {
                            "status": "204",
                            "messege": "The request was successful but no body was returned."
                        },
                        page: linkages.home
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
        errLog.insertErrorLog(ex, req.session.aTruID, "getConsumerDetails", "routes/admin/dashboard");
    }
})
router.post('/getEntityTxnDetails', function (req, response, next) { // all txn count
    try {
        if (req.session.aTruID) {
            var json = JSON.stringify({
                "truID": req.session.aTruID
            })
            dashDB.getEntityDetails(json, function (err, res) {
                if (res) {
                    response.send({
                        body: res,
                        page: linkages.home
                    })
                }
                else {
                    response.send({
                        body: {
                            "status": "204",
                            "messege": "The request was successful but no body was returned."
                        },
                        page: linkages.home
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
        errLog.insertErrorLog(ex, req.session.aTruID, "getConsumerDetails", "routes/admin/dashboard");
    }
})
router.post('/getRevenueChart', function (req, response, next) { // all txn count
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            dashDB.getRevenueChart(json, function (err, res) {
                if (res) {
                    response.send({
                        body: res,
                        page: linkages.home
                    })
                }
                else {
                    response.send({
                        body: {
                            "status": "204",
                            "messege": "The request was successful but no body was returned."
                        },
                        page: linkages.home
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
        errLog.insertErrorLog(ex, req.session.aTruID, "getRevenueChart", "routes/admin/dashboard");
    }
})
router.post('/getRevenueByPartner', function (req, response, next) { // all txn count
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            dashDB.getRevenueByPartner(json, function (err, res) {
                if (res) {
                    response.send({
                        body: res,
                        page: linkages.home
                    })
                }
                else {
                    response.send({
                        body: {
                            "status": "204",
                            "messege": "The request was successful but no body was returned."
                        },
                        page: linkages.home
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
        errLog.insertErrorLog(ex, req.session.aTruID, "getRevenueChart", "routes/admin/dashboard");
    }
})
router.post('/getPayoutValues', function (req, response, next) { // all txn count
    try {
        if (req.session.aTruID) {
            var json = JSON.stringify({
                "truID": req.session.aTruID
            })
            dashDB.getPayoutValues(json, function (err, res) {
                if (res) {
                    response.send({
                        body: res,
                        page: linkages.home
                    })
                }
                else {
                    response.send({
                        body: {
                            "status": "204",
                            "messege": "The request was successful but no body was returned."
                        },
                        page: linkages.home
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
        errLog.insertErrorLog(ex, req.session.aTruID, "getPayoutValues", "routes/admin/dashboard");
    }
})
router.post('/getWalletReceipt', function (req, res, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            dashDB.getWalletReceipt(json, function (err, response) {
                res.send(response);
            });
        } else {
            res.render('index', {
                title: 'Sign In'
            });
        }
    } catch (ex) {
        errLog.insertErrorLog(ex, req.session.etruID, "getTransaction", "dashboard");
    }
});
module.exports = router;