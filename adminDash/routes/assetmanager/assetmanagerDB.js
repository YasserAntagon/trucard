var express = require('express');
var assetmanagerDataDB = require('../../model/assetmanager/db/assetmanagerData');
var errLog = require('../../model/config/db/errLogDb');
var sys_conf = require('../../model/config/sys_conf');
var iterator = require('../entityIterator');
var linkages = iterator();
var router = express.Router();
router.post('/getAssetManagerData', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var json = {
                "truID": req.body.truID
            }
            assetmanagerDataDB.getAssetManagerLokiData(json, function (ress)   // company data got from Lokijs
            { 
                response.send({
                    body: ress,
                    page: linkages.home,
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
        errLog.insertErrorLog(ex, req.session.aTruID, "getAssetManagerData", "routes/assetmanager/assetmanagerDB");
    }
})  
module.exports = router;