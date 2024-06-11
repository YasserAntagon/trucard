'use strict'
var request = require('request');
var conf = require("../config");
exports.SixhundredAndOne = function (req, res) { // all people
  if (req.body.title && req.body.message) {
    request({
      method: 'POST',
      uri: conf.oneURL,
      headers: {
        "authorization": "Basic " + conf.restKey,
        "content-type": "application/json"
      },
      json: true,
      body: {
        'app_id': conf.appID,
        "app_url":"app://notification",
        'contents': { en: req.body.message },
        'headings': { en: req.body.title },
        //'largeIcon': 'https://cdn4.iconfinder.com/data/icons/iconsimple-logotypes/512/github-512.png',
        included_segments: ["Subscribed Users"]
      }
    },
      function (error, response, body) {
        res.json({ "status": "200", "message": "Successfully Sent", resource: data });
      }
    );
  }
  else {
    res.json({ "status": "400", "message": "Invalid field" });
  }
}

exports.SixhundredAndTwo = function (req, res) {
  if (req.body.title && req.body.message && req.body.crnno) {
    var crnno = req.body.crnno;
    //'largeIcon': 'https://cdn4.iconfinder.com/data/icons/iconsimple-logotypes/512/github-512.png'
    request({
      method: 'POST',
      uri: conf.oneURL,
      headers: {
        "authorization": "Basic " + conf.restKey,
        "content-type": "application/json"
      },
      json: true,
      body: {
        'app_id': conf.appID,
        'contents': { en: req.body.message },
        'headings': { en: req.body.title },
      //  'largeIcon': 'https://cdn4.iconfinder.com/data/icons/iconsimple-logotypes/512/github-512.png',
        "app_url":"app://notification",
        "channel_for_external_user_ids": "push",
        'include_external_user_ids': Array.isArray(crnno) ? crnno : [crnno]
      }
    },
      function (error, response, body) {
        res.json({ "status": "200", "message": "Successfully Sent", resource: body });
      }
    );
  }
  else {
    res.json({ "status": "400", "message": "Invalid field" });
  }
}