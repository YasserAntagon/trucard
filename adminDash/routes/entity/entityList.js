var express = require('express');
var entityList = require('../../model/entity/entityList');
var errLog = require('../../model/config/db/errLogDb');
var entityDataDB = require('../../model/entity/db/entityData');
var iterator = require('../entityIterator');
var linkages = iterator();
var router = express.Router();
router.post('/getentityList', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            let kycFlag = req.body.KYCFlag;
            let query = { "KYCFlag": kycFlag }
            if (kycFlag == "all") {
                query = {}
            } 
            entityDataDB.getEntityList(query, function (res) {
                response.send({
                    body: res,
                    status: "200",
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
        errLog.insertErrorLog(ex, req.session.aTruID, "getconsumerList", "route/consumer/ConsumerList");
    }
})
router.post('/getEntityNodeList', function (req, response, next) {
    try {
        if (req.session.aTruID) { 
            let etruID = req.body.rTruID;
            let query = {
                'parentTruID': etruID,
                "isParent":false
            }
            entityDataDB.getEntityList(query, function (res) {
                response.send({
                    body: res,
                    status: "200",
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
        errLog.insertErrorLog(ex, req.session.aTruID, "getconsumerList", "route/consumer/ConsumerList");
    }
})

router.post('/getEntityListALLRecords', function (req, response, next) {
    try {
        if (req.session.aTruID) { 
            let query = {KYCFlag:"active"};
            entityDataDB.getEntityListALLRecords(query, function (res) {
                response.send({
                    body: res,
                    status: "200",
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
        errLog.insertErrorLog(ex, req.session.aTruID, "getconsumerList", "route/consumer/ConsumerList");
    }
})
router.post('/getEntityAllList', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            let kycFlag = req.body.KYCFlag;
            let query = {
                'KYCFlag': kycFlag
            };
            entityDataDB.getEntityList(query, function (res) {
                response.send({
                    body: res,
                    status: "200",
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
        errLog.insertErrorLog(ex, req.session.aTruID, "getconsumerList", "route/consumer/ConsumerList");
    }
})
router.post('/syncEntityList', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            let json = JSON.stringify({
                "truID": req.session.aTruID
            })

            entityDataDB.getLatestDateOfEntity(function (date) {  // sync date 
                /* if (date.length > 0) {
                    json = JSON.stringify({
                        "truID": req.session.aTruID,
                        "dateFlag": true,
                        "startDate": date[0].createDate,
                    })
                }  */
                entityList.getEntityListDB(json, function (err, res) {
                    if (res.status == "200") {
                        entityDataDB.insertEntityList(res.resource);
                    }
                    response.send({
                        status: "200",
                        page: linkages
                    })
                })
            })
        } else {
            res.render('index', {
                title: 'Sign In'
            });
        }

    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.aTruID, "getconsumerList", "route/consumer/ConsumerList");
    }
})

module.exports = router;