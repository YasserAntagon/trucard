var express = require('express');
var accessDB = require('../../model/entity/entityNodeList');
var errLog = require('../../model/config/db/errLogDb');
var iterator = require('../entityIterator');
var linkages = iterator();
var router = express.Router();
var saveDB = require('../../model/entity/saveEntity'); 
var loadTrans = require('../../model/entity/db/entityData');
router.post('/getAllconsumerData', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            accessDB.getAllconsumerData(json, function (err, res) {
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
        errLog.insertErrorLog(ex, req.session.aTruID, "getAllconsumerData", "routes/entity/eConsumer");
    }
})
router.post('/getEntityList', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            accessDB.getEntityList(json, function (err, res) {
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
        errLog.insertErrorLog(ex, req.session.aTruID, "getEntityList", "routes/entity/eConsumer");
    }
})

router.post('/getAllNodeData', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            accessDB.getAllNodeData(json, function (err, res) {
                if (res) {
                    response.send({
                        body: res,
                        page: linkages
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
        errLog.insertErrorLog(ex, req.session.aTruID, "getAllNodeData", "routes/entity/eConsumer");
    }
})

router.post('/saveEntityAddr', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            saveDB.saveEntityAddr(json, function (err, res) {
                if (res.status == "200") {
                    var inputJson = {
                        houseNumber: req.body.houseNumber,
                        streetNumber: req.body.streetNumber,
                        landmark: req.body.landmark,
                        pin: req.body.pin,
                        city: req.body.city,
                        state: req.body.state,
                        country: req.body.country,
                    }
                    loadTrans.updateEnAddres(req.body.rTruID, inputJson);
                }
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
        errLog.insertErrorLog(ex, req.session.aTruID, "saveEntityAddr", "routes/entity/eConsumer");
    }
})
router.post('/savaEntitydetails', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            saveDB.savaEntitydetails(json, function (err, res) {
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
        errLog.insertErrorLog(ex, req.session.aTruID, "savaEntitydetails", "routes/entity/eConsumer");
    }
})

router.post('/updateEntityDocument', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            saveDB.updateEntityDocument(json, function (err, res) {
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
        errLog.insertErrorLog(ex, req.session.aTruID, "savaEntitydetails", "routes/entity/eConsumer");
    }
})
router.post('/getEntityCount', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            loadTrans.getEntityCount(function (resp)   // company data got from Lokijs
            {
                response.send({ status: "200", body: resp, page: linkages.home })
            })
        } else {
            res.render('index', {
                title: 'Sign In'
            });
        }

    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.aTruID, "getenCount", "routes/entity/eConsumer");
    }
}) 
module.exports = router