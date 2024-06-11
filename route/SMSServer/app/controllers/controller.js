'use strict'

var request = require('request'),
  https = require('https'),
  randomize = require('randomatic');

var conf = require("../config");
var Gen = require("../Generics");
var token = conf.bearer;
var token1 = conf.bearer1;
var token2 = conf.bearer2;
var token3 = conf.bearer3;
var token4 = conf.bearer4;

var otpuri = conf.otpuri;
function genOTP() {
  return Gen.randomOTP ? randomize('0', 6) : "123456";
}
exports.test = function (req, res) {
  var bearer = req.headers.authorization;
  var array = bearer.split(" ");
  if (array[1] != token) {
    res.json({ status: "401", message: "Unauthorized user!" });
  } else {
    res.json({ message: "Welcome to Company assetstore Api." });
  }
};


exports.test1 = function (req, res) {
  var request = require('request');
  var bearer = req.headers.authorization;
  var array = bearer.split(" ");
  if (array[1] != token) {
    res.json({ status: "401", message: "Unauthorized user!" });
  } else {
    request.get({
      "headers": { "content-type": "application/json" },
      "url": reqip + ":4111/api1",
      "body": JSON.stringify({

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

exports.hundredthirty = function (req, res) {
  //consumer otp send 
  var bearer = req.headers.authorization;
  var array = bearer.split(" ");
  if (array[1] != token1) {
    res.json({ status: "401", message: "Unauthorized user!" });
  } else {
    var mobile = req.body.mobile;
    var appflag = req.body.appflag;
    var templatename = "entiyConsumers";//allLogUsers

    if (req.body.type == "transaction") {
      //templatename = "consumerInEntityVerify";
    }
    else if (req.body.type == "registration") {
      templatename = "entiyConsumers";

    }
    else if (req.body.type == "fPassword" || req.body.type == "MPIN") {
      templatename = "entiyConsumers";
    }
    var otp = genOTP();
    if (Gen.randomOTP) {
      request.get({
        "headers": { "content-type": "application/json" },
        "url": otpuri + mobile + "/" + otp + "/" + templatename + "",
        "body": JSON.stringify({
        })
      }, (error, response, body) => {
        if (error) {
          return console.dir(error);
        }
        var newjson = JSON.parse(body);

        if (newjson.Status === "Success") {
          res.json({ "status": "200", "OTP": otp, "details": newjson.Details });

        } else {
          res.json({ status: "204", message: "Something went wrong!" });

        }
      }
      )
    }
    else {
      res.json({ "status": "200", "OTP": otp, "details": "newjson.Details" });
    }
  }
}



exports.hundredforty = function (req, res) {
  //consumer otp send 
  var bearer = req.headers.authorization;
  var array = bearer.split(" ");
  if (array[1] != token2) {
    res.json({ status: "401", message: "Unauthorized user!" });
  } else {

    var mobile = req.body.mobile;
    var letterNumber = /^[0-9]+$/;


    // if(mobile && conf.hundredthirty.mobile === "mandatory" && mobile.length === 10 && mobile.match(letterNumber)){
    var otp = genOTP();
    if (Gen.randomOTP) {
      var templatename = "entiyConsumers"; //allLogUsers
      request.get({
        "headers": { "content-type": "application/json" },
        "url": otpuri + mobile + "/" + otp + "/" + templatename + "",
        "body": JSON.stringify({
        })
      }, (error, response, body) => {
        if (error) {
          return console.dir(error);
        }
        var newjson = JSON.parse(body);

        if (newjson.Status === "Success") {
          res.json({ status: "200", OTP: otp, details: newjson.Details });

        } else {
          res.json({ status: "204", message: "Something went wrong!" });

        }
      })
    }
    else {
      res.json({ "status": "200", "OTP": otp, "details": "newjson.Details" });
    }
  }
}

exports.hundredfifty = function (req, res) {
  //consumer otp send 
  var bearer = req.headers.authorization;
  var array = bearer.split(" ");
  if (array[1] != token3) {
    res.json({ status: "401", message: "Unauthorized user!" });
  } else {

    var mobile = req.body.mobile;
    var letterNumber = /^[0-9]+$/;
    var templatename = "entiyConsumers"; //allLogUsers
    //  var templatename = "allLogUsers";
    if (req.body.type == "transaction") {
      //templatename = "consumerInassetmanagerVerify";
    }

    var otp = genOTP();
    if (Gen.randomOTP) {
      request.get({
        "headers": { "content-type": "application/json" },
        "url": otpuri + mobile + "/" + otp + "/" + templatename + "",
        "body": JSON.stringify({
        })
      }, (error, response, body) => {
        if (error) {
          return console.dir(error);
        }
        var newjson = JSON.parse(body);

        if (newjson.Status === "Success") {
          res.json({ status: "200", OTP: otp, details: newjson.Details });

        } else {
          res.json({ status: "204", message: "Something went wrong!" });

        }
      }
      )
    }
    else {
      res.json({ "status": "200", "OTP": otp, "details": "newjson.Details" });
    }
  }
}



exports.hundredsixty = function (req, res) {
  //consumer otp send 
  var bearer = req.headers.authorization;
  var array = bearer.split(" ");
  if (array[1] != token4) {
    res.json({ status: "401", message: "Unauthorized user!" });
  } else {

    var mobile = req.body.mobile;
    var letterNumber = /^[0-9]+$/;
    // var templatename = "allLogUsers";
    var templatename = "entiyConsumers"; //allLogUsers
    if (req.body.type == "transaction") {
      //templatename = "consumerInassetmanagerVerify";
    }
    var otp = genOTP();
    if (Gen.randomOTP) {
      request.get({
        "headers": { "content-type": "application/json" },
        "url": otpuri + mobile + "/" + otp + "/" + templatename + "",
        "body": JSON.stringify({
        })
      }, (error, response, body) => {
        if (error) {
          return console.dir(error);
        }
        var newjson = JSON.parse(body);

        if (newjson.Status === "Success") {
          res.json({ status: "200", OTP: otp, details: newjson.Details });

        } else {
          res.json({ status: "204", message: "Something went wrong!" });

        }
      }
      )
    }
    else {
      res.json({ "status": "200", "OTP": otp, "details": "newjson.Details" });
    }
  }
}


exports.hundredseventy = function (req, res) {
  //consumer otp send 
  var bearer = req.headers.authorization;
  var array = bearer.split(" ");
  if (array[1] != token5) {
    res.json({ status: "401", message: "Unauthorized user!" });
  } else {

    var mobile = req.body.mobile;
    var letterNumber = /^[0-9]+$/;
    //var templatename = "allLogUsers";
    var templatename = "entiyConsumers"; //allLogUsers
    if (req.body.type == "transaction") {
      //templatename = "consumerInassetmanagerVerify";
    }
    var otp = genOTP();
    if (Gen.randomOTP) {
      request.get({
        "headers": { "content-type": "application/json" },
        "url": otpuri + mobile + "/" + otp + "/" + templatename + "",
        "body": JSON.stringify({
        })
      }, (error, response, body) => {
        if (error) {
          return console.dir(error);
        }
        var newjson = JSON.parse(body);

        if (newjson.Status === "Success") {
          res.json({ status: "200", OTP: otp, details: newjson.Details });

        } else {
          res.json({ status: "204", message: "Something went wrong!" });

        }
      })
    }
    else {
      res.json({ "status": "200", "OTP": otp, "details": "newjson.Details" });
    }
  }
}