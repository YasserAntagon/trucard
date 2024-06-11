'use strict'
var request = require('request'),
  https = require('https');
var token = conf.bearer;
var conf = require("../config");
exports.payment = function (req, res) {
  var bearer = req.headers.authorization;
  var array = bearer.split(" ");
  if (array[1] != token) {
    res.json({ status: "401", message: "Unauthorized user!" });
  } else {
    request.get({
      "headers": { "content-type": "application/json" },
      "url": conf.otpuri + ":4111/api1",
      "body": JSON.stringify({
       "":""
      })
    }, (error, response, body) => {
      if (error) {
        return console.dir(error);
      }
      var newjson = JSON.parse(body);

      res.json(newjson);
    }
    )
  }
}