/*
  # @description This file contains all Admin functionallity for assetstore, Entity, assetmanager, Customer Modules which will Routes to core apis.
  # Request from UI will send here and then send to internal api with input params.
*/
'use strict'
var conf = require("../config");
var request = require('request');
  exports.truCoinRates = function (req, res) {
    var amount = req.body.amount;
    var date = req.body.date;
    var exchangeCharge = 0.01; // 1 %
    var from = req.body.from; 
    var to = req.body.to;
    var value = req.body.value;
    var dval = /^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/;
    var isnum = /(?<=^| )\d+(\.\d+)?(?=$| )/;
    var arrft = ["USD", "INR","GBP","AED","EURO"];
    if ((from != to && to != from) && arrft.includes(from) && arrft.includes(to)) {
      if (date.match(dval) && isnum.test(amount) && isnum.test(value)) {
        request.post({
          "headers": { "content-type": "application/json" },       
          "url": conf.reqip + ":" + conf.truRates+ "/api/currencyExchange",
          "body": JSON.stringify({
            "amount": amount,
            "date": date,
            "from": from,
            "to": to,
            "value": value,
            "exchangecharge":exchangeCharge
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          res.json(newjson);
        });
      } else {
        res.status(500).json({ status: "500", message: "Please check entered field values ...!" });
      }
    }
    else {
      res.status(500).json({ status: "500", message: "Please check entered field values ...!" });
    }
  }
  exports.getCurrencyRate = function (req, res) { 
        request.post({
          "headers": { "content-type": "application/json" },       
          "url": conf.reqip + ":" + conf.truRates+ "/api/getCurrencyRate",
          "body": JSON.stringify({
            "currency": "INR"
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          res.json(newjson);
        }); 
  }