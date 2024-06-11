var express = require('express');
var loadTrans = require('../../model/assetmanager/db/assetmanagerData')
var errLog = require('../../model/config/db/errLogDb');
var assetmanagerListDb = require('../../model/assetmanager/assetmanagerList') 
var xlinkages = "";
var router = express.Router();
router.post('/getassetmanagerList', function (req, response, next) {

    try {
        if (req.session.aTruID) {
            let kycFlag = req.body.KYCFlag;
            let query = { '$and': [{ "KYCFlag": kycFlag }, { 'isParent': true }] }
            if (kycFlag == "all") {
                query = {}
            }
            loadTrans.getAssetManagerList(query, function (res) {
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
        errLog.insertErrorLog(ex, req.session.aTruID, "getassetmanagerList", "route/assetmanager/assetmanagerList");
    }
})

router.post('/getassetmanagerNodeList', function (req, response, next) {

    try {
        if (req.session.aTruID) {
            let kycFlag = req.body.KYCFlag;
            let amTruID = req.body.amTruID;
            let query = { '$and': [{ "parentTruID": amTruID }, { 'isParent': false }] }
            if (kycFlag == "all") {
                query = {}
            }
            loadTrans.getAssetManagerList(query, function (res) {
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
        errLog.insertErrorLog(ex, req.session.aTruID, "getassetmanagerList", "route/assetmanager/assetmanagerList");
    }
})
router.post('/syncassetmanagerList', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            let json = JSON.stringify({
                "truID": req.session.aTruID
            })
            loadTrans.getLatestDateOfAssetManager(function (date) {  // sync date 
                assetmanagerListDb.getSyncAssetManagerList(json, function (err, res) {
                    if (res.status == "200") {
                        loadTrans.insertAssetManagerList(res.resource);
                    }
                    response.send({
                        status: "200",
                        page: xlinkages
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
        errLog.insertErrorLog(ex, req.session.aTruID, "getassetmanagerList", "route/assetmanager/assetmanagerList");
    }
})

router.post('/getassetmanagerCount', function (req, response, next) {
    try {
        if (req.session.aTruID) {

            loadTrans.getAssetManagerCount(function (resp)   // company data got from Lokijs
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
        errLog.insertErrorLog(ex, req.session.aTruID, "getdlrCount", "routes/assetmanager/getdlrCount");
    }
})
module.exports = router;

