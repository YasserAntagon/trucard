var express = require('express');
var getEDB = require('../../model/entity/getEntity');
var getEdash = require('../../model/entity/dashboard');
var loadTrans = require('../../model/entity/db/entityData');
var errLog = require('../../model/config/db/errLogDb');
var config = require('../../model/config/config');
let sys_conf = require('../../model/config/sys_conf');
var iterator = require('../entityIterator');
var linkages = iterator();
var router = express.Router();
router.post('/getEntityReport', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            /*  if (req.session.eData.isParent) { */
            getEDB.getEntityReport(json, function (err, res) {
                loadTrans.insertEntityData(res, req.body.rTruID);
                response.send({
                    body: res,
                    page: linkages.home
                })
            })
            /* }
            else {
                getEDB.getnodeEntityReport(json, function (err, res) {
                    //   loadTrans.insertEntityData(res, req.body.rTruID);
                    response.send({
                        body: res,
                        page: linkages.home
                    })
                })
            } */
        } else {
            res.render('index', {
                title: 'Sign In'
            });
        }

    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.aTruID, "getEntityReport", "routes/entity/eEntity");
    }
})

router.post('/getGSTAllTrans', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            getEDB.getGSTAllTrans(json, function (err, res) {
                response.send(res)
            })
        } else {
            res.render('index', {
                title: 'Sign In'
            });
        }
    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.aTruID, "getTransdetails", "routes/entity/eEntity");
    }
})

router.post('/getTransdetails', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            getEDB.getTransdetails(json, function (err, res) {
                loadTrans.insertTransData(res, req.body.rTruID);
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
        errLog.insertErrorLog(ex, req.session.aTruID, "getTransdetails", "routes/entity/eEntity");
    }
})


router.post('/getselfTrans', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            getEDB.getselfTrans(json, function (err, res) {
                loadTrans.insertSelfTransData(res, req.body.rTruID);
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
        errLog.insertErrorLog(ex, req.session.aTruID, "getselfTrans", "routes/entity/eEntity");
    }
})
router.post('/getselfAllTrans', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            getEDB.getselfAllTrans(json, function (err, res) {
                loadTrans.insertSelfAllTransData(res, req.body.rTruID);
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
        errLog.insertErrorLog(ex, req.session.aTruID, "getselfAllTrans", "routes/entity/eEntity");
    }
})

router.post('/searchEntity', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            getEDB.searchEntity(json, function (err, res) {
                loadTrans.insertEntityData(res, req.body.rTruID);
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
        errLog.insertErrorLog(ex, req.session.aTruID, "searchEntity", "routes/entity/eEntity");
    }
})

router.post('/getinvoice', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            getEDB.getinvoice(json, function (err, res) {
                response.send({
                    body: res,
                    page: linkages.home,
                    config: config.custodocurl,
                    enDetails: req.session.eData
                })
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
router.post('/getEnPaymentInvoice', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            contain.objectArr[0].reqFlag = "consumer";
            var json = JSON.stringify(contain.objectArr[0]);
            getEDB.getinvoice(json, function (err, res) {
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
                    contain.objectArr[0].reqFlag = "entity";
                    var json1 = JSON.stringify(contain.objectArr[0]);
                    getEDB.getinvoice(json1, function (err, res) {
                        response.send({
                            body: res,
                            page: linkages.home,
                            reqFlag: "entity",
                            config: config.custodocurl,
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
            getEDB.getinvoicetransfer(json, function (err, res) {
                response.send({
                    body: res,
                    page: linkages.home,
                    config: config.custodocurl
                })
            })
        } else {
            res.render('index', {
                title: 'Sign In'
            });
        }

    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.aTruID, "getinvoicetransfer", "routes/entity/eEntity");
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
            getEDB.deactivatrAccount(json, function (err, res) { 
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
        errLog.insertErrorLog(ex, req.session.aTruID, "deactivatrAccount", "routes/entity/eEntity");
    }
})
router.post('/deactivatRemmitAccount', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            getEDB.deactivatRemmitAccount(json, function (err, res) { 
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
        errLog.insertErrorLog(ex, req.session.aTruID, "deactivatrAccount", "routes/entity/eEntity");
    }
})


router.post('/getenDoc', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            getEDB.getenDoc(json, function (err, res) {
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
        errLog.insertErrorLog(ex, req.session.aTruID, "getenDoc", "routes/entity/eEntity");
    }
})
router.post('/updateProfileData', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            getEDB.updateProfileData(json, function (err, res) {
                response.send({
                    body: res,
                    page: linkages.home
                })
                if (res.status == 200) {
                    var json = JSON.stringify({
                        "truID": req.session.aTruID,
                        "rTruID": req.body.rTruID
                    });
                    getEDB.searchEntity(json, function (err, ress) {
                        req.session.eData.companyName = ress.resource.companyName
                        loadTrans.updateEnProf(req.body.rTruID, ress.resource);
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
        errLog.insertErrorLog(ex, req.session.aTruID, "updateProfileData", "routes/entity/eEntity");
    }
})
router.post('/updateTPA', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            getEDB.updateTPA(json, function (err, res) {
                response.send({
                    body: res,
                    page: linkages.home
                })
                if (res.status == 200) {
                    var json = JSON.stringify({
                        "truID": req.session.aTruID,
                        "rTruID": req.body.rTruID
                    });
                    getEDB.searchEntity(json, function (err, ress) {
                        loadTrans.updateEnProf(req.body.rTruID, ress.resource);
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
        errLog.insertErrorLog(ex, req.session.aTruID, "updateTPA", "routes/entity/eEntity");
    }
})
router.post('/getTransReportdetails', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            getEDB.getTransReportdetails(json, function (err, res) {
                loadTrans.insertTransReportData(res, req.body.rTruID);
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
        errLog.insertErrorLog(ex, req.session.aTruID, "getTransReportdetails", "routes/entity/eEntity");
    }
}) 
  
router.post('/getConsumerWalletLog', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            getEDB.getConsumerWalletLog(json, function (err, res) {
                response.send(res);
            })
        } else {
            res.render('index', {
                title: 'Sign In'
            });
        }

    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.aTruID, "getTransReportdetails", "routes/entity/eEntity");
    }
})
router.post('/getWalletTransdetails', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            getEDB.getWalletTransdetails(json, function (err, res) {
                response.send({ body: res, page: linkages.home });
            })
        } else {
            res.render('index', {
                title: 'Sign In'
            });
        }

    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.aTruID, "getTransReportdetails", "routes/entity/eEntity");
    }
})
router.post('/getConsumerPartnerStock', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            getEDB.getConsumerPartnerStock(json, function (err, res) {
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
        errLog.insertErrorLog(ex, req.session.aTruID, "getTransReportdetails", "routes/entity/eEntity");
    }
})
router.post('/partnerPartnerStock', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            getEDB.partnerPartnerStock(json, function (err, res) {
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
        errLog.insertErrorLog(ex, req.session.aTruID, "getTransReportdetails", "routes/entity/eEntity");
    }
})
router.post('/partnerPartnerDashStock', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            getEDB.partnerPartnerDashStock(json, function (err, res) {
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
        errLog.insertErrorLog(ex, req.session.aTruID, "getTransReportdetails", "routes/entity/eEntity");
    }
})

router.post('/fetchCounter', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            getEDB.fetchCounter(json, function (err, res) {
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
        errLog.insertErrorLog(ex, req.session.aTruID, "getTransReportdetails", "routes/entity/eEntity");
    }
})
router.post('/egetWalletReceipt', function (req, res, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            getEDB.getWalletReceipt(json, function (err, response) { 
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

router.post('/egetGSTReport', function (req, res, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            getEDB.egetGSTReport(json, function (err, response) { 
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