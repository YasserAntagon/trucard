'use strict';
module.exports = function (app) {
    var ratelog = require('../controllers/ratelog');
    var conf = require('../config');
    var request = require('request');
    app.route('/api/updateg24rateallnode')
        .post(getChargesfromDB, ratelog.update_g24_rate_all_node);


    app.route('/api/updates99rateallnode')
        .post(getChargesfromDB, ratelog.update_s99_rate_all_node);


    app.route('/api/updateassetmanagerg24rateallnode')
        .post(getChargesfromDB, ratelog.update_assetmanager_g24_rate_all_node);


    app.route('/api/updateassetmanagers99rateallnode')
        .post(getChargesfromDB, ratelog.update_assetmanager_s99_rate_all_node);


    app.route('/api/updateg24salerateallnode')
        .post(getChargesfromDB, ratelog.update_g24_sale_rate_all_node);


    app.route('/api/updates99salerateallnode')
        .post(getChargesfromDB, ratelog.update_s99_sale_rate_all_node);


    app.route('/api/updateassetmanagerg24salerateallnode')
        .post(getChargesfromDB, ratelog.update_assetmanager_g24_sale_rate_all_node);


    app.route('/api/readstockCustPartner')
        .post(getChargesfromDB, ratelog.total_stock_hold);

    app.route('/api/clientRate').post(getChargesfromDB, ratelog.client_Rate);

    app.route('/api/updateassetmanagers99salerateallnode')
        .post(getChargesfromDB, ratelog.update_assetmanager_s99_sale_rate_all_node);

    app.route('/api/ratedailylogsadmindatewise')
        .post(ratelog.ratedailylogsadmin_datewise);

    app.route('/api/readassetmanagerRateByAdmin')
        .post(ratelog.read_assetmanagerRate_ByAdmin);

    app.route('/api/readassetmanagerRateByAdminChart')
        .post(ratelog.read_assetmanagerRate_ByAdminChart);

    app.route('/api/stockDailyUpdate')
        .post(ratelog.stockDailyUpdate);

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
    }
}