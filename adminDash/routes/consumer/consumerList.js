var express = require('express');
var consumerAddrDb = require('../../model/consumer/consumerAddr');
var loadTrans = require('../../model/consumer/db/consumerData');
var consumerDb = require('../../model/consumer/getconsumer');
var errLog = require('../../model/config/db/errLogDb');
var iterator = require('../consumerIterator');
var xlinkages = iterator();
var router = express.Router();
router.post('/getconsumerList', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            let kycFlag = req.body.KYCFlag;
            let query = { "KYCFlag": kycFlag }
            if (kycFlag == "all") {
                query = {}
            }
            else if (kycFlag == "active") {
                query = { "docVerified": true }
            }
            else if (kycFlag == "pending") {
                query = { 'KYCFlag': { '$nin': ['holder', 'banned'] } }
            }
            if (req.body.startDate) {
                query.$and = [{ createDate: { $gte: Date.parse(req.body.startDate) } }, { createDate: { $lte: Date.parse(req.body.endDate) } }]
            }
            loadTrans.getConsumerList(query, function (res) {
                response.send({ body: res, status: "200", page: xlinkages })
            })
        } else {
            res.render('index', { title: 'Sign In' });
        }
    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.aTruID, "getconsumerList", "route/consumer/ConsumerList");
    }
})

router.post('/getConsumerNodeList', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            let kycFlag = req.body.KYCFlag;
            let rTruID = req.body.rTruID;
            let isParent = req.body.isParent;
            let query = { 'referenceTruID': rTruID, "KYCFlag": kycFlag }

            if (req.body.KYCFlag == "active" && isParent == "true") {
                let channel = req.body.channel;
                query = { 'MT_Type': channel, "KYCFlag": "active", "docVerified": true }
            }
            else if (req.body.KYCFlag == "pending" && isParent == "true") {
                let channel = req.body.channel;
                query = { 'MT_Type': channel, "KYCFlag": "active", "docVerified": false }
            }
            else if (req.body.KYCFlag != "active" && req.body.KYCFlag != "pending" && isParent == "true") {
                let channel = req.body.channel;
                query = { 'MT_Type': channel, "KYCFlag": kycFlag }
            }
            else if (req.body.KYCFlag == "active" && isParent == "false") {
                query = { "docVerified": true, 'referenceTruID': rTruID }
            }


            // if (kycFlag == "active") {
            //     query = {
            //         '$and': [{ "docVerified": true }, {
            //             'referenceTruID': rTruID
            //         }]
            //     }
            // }
            // else if (kycFlag == "pending") {
            //     query = {
            //         '$and': [{ 'kycFlag': { '$nin': ['holder', 'banned'] } }, {
            //             'referenceTruID': rTruID
            //         }]
            //     } 
            // }
            loadTrans.getConsumerList(query, function (res) {
                response.send({
                    body: res,
                    status: "200",
                    page: xlinkages
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



router.post('/updateConsumerAddress', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            consumerAddrDb.updateConsumerAddress(json, function (err, res) {
                response.send({
                    body: res,
                    page: xlinkages
                });
                if (res.status == 1000) {
                    loadTrans.updateConAddress(req.body.cTruID, req.body);
                }
            })
        } else {
            res.render('index', {
                title: 'Sign In'
            });
        }

    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.aTruID, "updateConsumerAddress", "route/consumer/ConsumerList");
    }
})

router.post('/getCustomerCounts', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            /* dashboardDb.getCustomerCount(json, function (err, res) {
                response.send({
                    body: res,
                    page: xlinkages
                })
            }) */
            loadTrans.getConsumerCount(function (resp)   // company data got from Lokijs
            {
                response.send({ status: "200", body: resp, page: xlinkages.home })
            })

        } else {
            res.render('index', {
                title: 'Sign In'
            });
        }

    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.aTruID, "getCustomerCount", "route/consumer/ConsumerList");
    }
})
router.post('/searchConsumerdetails', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            consumerDb.searchConsumerdetails(json, function (err, res)   // company data got from Lokijs
            {
                if (res.status == "200") {
                    req.session.consumer = res.resource;
                }
                response.send({
                    body: res,
                    page: xlinkages
                })
            })
        } else {
            res.render('index', {
                title: 'Sign In'
            });
        }
    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.aTruID, "searchConsumerdetails", "route/consumer/ConsumerList");
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
            consumerDb.updateProfileData(json, function (err, res)   // company data got from Lokijs
            {

                response.send({
                    body: res,
                    page: xlinkages
                })
                if (res.status == 200) {
                    var json = JSON.stringify({
                        "truID": req.session.aTruID,
                        "cTruID": req.body.cTruID
                    });
                    consumerDb.getConsumerdetails(json, function (err, ress) {

                        loadTrans.updateConProf(req.body.cTruID, ress.resource);
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
        errLog.insertErrorLog(ex, req.session.aTruID, "updateProfileData", "route/consumer/ConsumerList");
    }
})
router.post('/updateConsumerAddress', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            consumerDb.updateConsumerAddress(json, function (err, res)   // company data got from Lokijs
            {
                response.send({
                    body: res,
                    page: xlinkages
                })
                if (res.status == 200) {
                    loadTrans.updateConAddress(req.body.rTruID, req.body);
                }
            })
        } else {
            res.render('index', {
                title: 'Sign In'
            });
        }
    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.aTruID, "updateConsumerAddress", "route/consumer/ConsumerList");
    }
})
router.post('/savaConsumerdetails', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            contain.objectArr[0].refernceTruID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            consumerDb.savaConsumerdetails(json, function (err, res)   // company data got from Lokijs
            {
                response.send({
                    body: res,
                    page: xlinkages
                })
            })
        } else {
            res.render('index', {
                title: 'Sign In'
            });
        }
    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.aTruID, "savaConsumerdetails", "route/consumer/ConsumerList");
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
            consumerDb.updateTPA(json, function (err, res)   // company data got from Lokijs
            {
                response.send({
                    body: res,
                    page: xlinkages
                })
            })
        } else {
            res.render('index', {
                title: 'Sign In'
            });
        }
    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.aTruID, "updateTPA", "route/consumer/ConsumerList");
    }
})

module.exports = router;