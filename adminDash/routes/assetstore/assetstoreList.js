var express = require('express');
var loadTrans = require('../../model/assetstore/db/assetstoreData')
var errLog = require('../../model/config/db/errLogDb');
var assetstoreListDb = require('../../model/assetstore/custoList');
var router = express.Router();
router.post('/getAssetStoreList', function (req, response, next) {

    try {
        if (req.session.aTruID) {
            let kycFlag = req.body.KYCFlag;
            let query = { "KYCFlag": kycFlag }
            if (kycFlag == "all") {
                query = {}
            }
            loadTrans.getAssetStoreList(query, function (res) {
                response.send({
                    body: res,
                    status: "200"
                })
            })
        } else {
            res.render('index', {
                title: 'Sign In'
            });
        }

    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.aTruID, "getassetstoreList", "route/assetstore/assetstoreList");
    }
}) 

router.post('/syncAssetStoreList', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            let json = JSON.stringify({
                "truID": req.session.aTruID
            })
            loadTrans.getLatestDateOfAssetStore(function (date) {  // sync date
                /* if (date.length > 0) {
                    json = JSON.stringify({
                        "truID": req.session.aTruID,
                        "dateFlag": true,
                        "startDate": date[0].createDate,
                    })
                }  */
                assetstoreListDb.getSyncAssetStoreList(json, function (err, res) {
                    if (res.status == "200") {
                        loadTrans.insertcutodianlist(res.resource);
                    }
                    response.send({
                        status: "200"
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
        errLog.insertErrorLog(ex, req.session.aTruID, "getassetstoreList", "route/assetstore/assetstoreList");
    }
})
module.exports = router;

