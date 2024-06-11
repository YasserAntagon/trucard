'use strict';

var controller = require('../controllers/consumerController');
var request = require('request');
var conf = require('../config');
module.exports = function (app) { 
    
    app.route('/api/entityalltxnreportOpti')
    .post(controller.entity_all_txn_reportOpti);

    app.route('/api/fetchConsumerByNameMobile')
    .post(controller.fetchConsumerByName_Mobile);

    app.route('/api/entityalltxnreportRevenue')
    .post(revenuemiddleware, controller.entity_all_txn_reportRevenue); 

    app.route('/api/partnerConsumerList')
    .post(controller.partner_ConsumerList); 

     app.route('/api/fetchConsumerSelect')
    .post(controller.fetchConsumerSelect); 
    
}
function revenuemiddleware(req, res, next) {
  if (req.body.isPartner) {
    request.post({
      "headers": { "content-type": "application/json" },
      "url": conf.adminReqIP + ":5115/api/selfalltxnreportRevenue",
      "body": JSON.stringify(req.body)
    }, (error, response, body) => {
      if (error) {
        console.log(error)
      }
      else {
        res.send(body);        
      }
    });
  } else {
    next();
  }
}
function getChargesfromDB(req, res, next) {
  request.post({
    "headers": { "content-type": "application/json" },
    "url": conf.adminReqIP + ":5112/api/getAllCharges",
  }, (error, response, body) => {
    if (error) {
      console.log(error)
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
}; 