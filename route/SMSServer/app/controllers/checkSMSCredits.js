'use strict'

var request = require('request');
var conf = require("../config");
exports.twoFactor_CheckCreditBalance = function (req, res) {
  var smsdetails = { txnSMS: 0, promoSMS: 0, otpSMS: 0, status: "200" };
  request(conf.txnbaluri + "TRANSACTIONAL_SMS", function (error, response, body) {
    if (error) {
      res.status(500).json({ status: "500", message: error.toString() });
    }
    else if (response && response.statusCode == 200) {
      var txndetail = JSON.parse(body);
      smsdetails.txnSMS = txndetail.Details;
      request(conf.txnbaluri + "PROMOTIONAL_SMS", function (error, response, body) {
        if (error) {
          res.status(500).json({ status: "500", message: error.toString() });
        }
        else if (response && response.statusCode == 200) {
          var promodetail = JSON.parse(body);
          smsdetails.promoSMS = promodetail.Details;

          request(conf.otpbaluri + "SMS", function (error, response, body) {
            if (error) {
              res.status(500).json({ status: "500", message: error.toString() });
            }
            else if (response && response.statusCode == 200) {
              var bodydetail = JSON.parse(body)
              smsdetails.otpSMS = bodydetail.Details;
              res.status(200).json(smsdetails);
            }
            else {
              res.status(200).json(smsdetails);
            }
          }); 
        }
        else {
          res.status(200).json(smsdetails);
        }
      }); 
    }
    else {
      res.status(200).json(smsdetails);
    }
  });
}