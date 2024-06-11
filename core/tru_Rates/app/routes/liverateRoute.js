'use strict';
const conf = require('../conf'),
  request = require('request');
module.exports = function (app) {
  const liveratcontroller = require("../controllers/liverateController")
  app.route('/api/readliveratefromassetmanager')
    .post(getChargesfromDB, liveratcontroller.read_live_rate_from_assetmanager);


  app.route('/api/topbuyerassetmanager')
    .post(getChargesfromDB, liveratcontroller.top_assetmanager_for_purchase);


  app.route('/api/topsaleassetmanager')
    .post(getChargesfromDB, liveratcontroller.top_assetmanager_for_sale);


  app.route('/api/readliveBuySellrate')
    .post(getChargesfromDB, liveratcontroller.read_liveBuySell_rate);



  app.route('/api/listrateforcustbuycash')
    .post(getChargesfromDB, liveratcontroller.list_rate_for_cust_buyCash);


  app.route('/api/updatestockqtybuy')
    .post(liveratcontroller.update_stock_qty_buy);

  app.route('/api/validatestock')
    .post(liveratcontroller.validate_stock);

  app.route('/api/validatestocktrans')
    .post(liveratcontroller.validate_stock_trans);


  app.route('/api/listratecustbuybullions')
    .post(getChargesfromDB, liveratcontroller.list_rate_cust_buy_bullions);

  app.route('/api/liveratefortxn')
    .post(getChargesfromDB, liveratcontroller.live_rate_for_txn);

  app.route('/api/listratecustredeemcashbullions')
    .post(getChargesfromDB, liveratcontroller.list_rate_cust_redeem_cash_bullions);

  app.route('/api/validateclientstock')
    .post(getChargesfromDB, liveratcontroller.validate_stock_client);

  app.route('/api/assetmanagerForClient')
    .post(getChargesfromDB, liveratcontroller.top_assetmanager_for_Client);

  app.route('/api/listrateforcustredeem')
    .post(liveratcontroller.list_rate_for_cust_redeem);

  app.route('/api/listadminwiseassetmanagerarray')
    .post(liveratcontroller.list_admin_wise_assetmanager_array);

  app.route('/api/assetmanagerratedailylogsdatewise')
    .post(liveratcontroller.assetmanager_ratedailylogs_datewise);

}


function getChargesfromDB(req, res, next) {
  request.post({
    "headers": { "content-type": "application/json" },
    "url": conf.adminreqip + ":5112/api/getAllCharges",
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