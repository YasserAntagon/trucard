'use strict';
var controller = require('../controllers/assetmanagerController');
// var request = require('request');
// const conf = require('../config');

module.exports = function (app) {


    app.route('/api/assetmanagersstockloglist')
        .post(controller.assetmanagers_stocklog_list);

    app.route('/api/updateassetmanagerStock')
        .post(controller.update_assetmanager_Stock);

    app.route('/api/allassetmanagerlistadmin')
        .post(controller.all_assetmanager_list_admin);



}
/* 
function getChargesfromDB(req, res, next) {
    request.post({
        "headers": { "content-type": "application/json" },
        "url": conf.adminReqIP + ":5112/api/getAllCharges",
    }, (error, response, body) => {
        if (error) {
            res.json({ status: "500", message: "Internal Server Error" })
        }
        else {
            if (response.statusCode == 200) {
                var resp = JSON.parse(body);
                req.generalCharges = resp.charges;
                next();
            } else {
                res.json({ status: "204", message: "something went wrong" })
            }
        }
    });
} */