var express = require('express'); 
var getEDB = require('../../model/entity/getEntity');
var entityDataDB = require('../../model/entity/db/entityData');
var errLog = require('../../model/config/db/errLogDb');
var iterator = require('../entityIterator');
var linkages = iterator();
var router = express.Router();
router.post('/getEntityData', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var json = {
                "truID": req.body.truID
            }
            entityDataDB.getEntityDataNew(json, function (res) {
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
        errLog.insertErrorLog(ex, req.session.aTruID, "getEntityData", "routes/entity/entityDB");
    }
}) 
router.post('/deactivatrAccount', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var json = {
                "truID": req.body.truID
            }
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
        errLog.insertErrorLog(ex, req.session.aTruID, "deactivatrAccount", "routes/entity/entityDB");
    }
})
module.exports = router;