'use strict';
/*****************************
Author : Nikhil Bharambe
Date : 25 Aug 2021
Modify By : 
Modify Date : 
*****************************/
var md5 = require('md5');
var timeout = require('connect-timeout')
var time = "300s";
var conf = require("../config");
var redisClient = require('../../redisClient');
module.exports = function (app) {
  var controller = require('../controllers/controller');
  var bankAccount = require('../controllers/bankAccount');
  var kycAuthentication = require('../controllers/kycAuthentication');
  var tokenChecker = require('../config/tokenChecker');
  var clientValidation = require('../config/clientValidation');// validate client only
  var clientTxnValidate = require('../config/clientTxnValidate'); // validate client with get charges
  var consumerValidation = require('../config/consumerValidation'); // validate consumer only
  var verifySignature = require('../config/signature');
  var accountValidation = require('../config/accountValidation');
  var consumerPermission = require('../config/consumerPermission');
  app.route('/400').post(timeout(time), haltOnTimedout, clientValidation, controller.fourHundred);
  app.route('/401').post(timeout(time), haltOnTimedout, clientValidation, consumerValidation, controller.fourHundredOne);
  app.route('/402').post(timeout(time), haltOnTimedout, validatePlatform, clientValidation, consumerValidation, tokenChecker, controller.fourHundredTwo);
  app.route('/403').post(timeout(time), haltOnTimedout, validatePlatform, validateBearer, clientTxnValidate, controller.fourHundredThree);
  app.route('/404').post(timeout(time), haltOnTimedout, validatePlatform, getTxnCache, clientTxnValidate, consumerValidation, tokenChecker, verifySignature, controller.fourHundredFour);
  app.route('/405').post(timeout(time), haltOnTimedout, validatePlatform, clientValidation, consumerValidation, controller.fourHundredFive);
  app.route('/406').post(timeout(time), haltOnTimedout, validatePlatform, getTxnCache, clientTxnValidate, consumerValidation, tokenChecker, verifySignature, accountValidation, controller.fourHundredSix);
  app.route('/407').post(timeout(time), haltOnTimedout, validatePlatform, getTxnCache, clientTxnValidate, consumerValidation, tokenChecker, verifySignature, controller.fourHundredSeven);
 // app.route('/408').post(timeout(time), haltOnTimedout, clientValidation, controller.fourHundredEight);
  app.route('/409').post(timeout(time), haltOnTimedout, validatePlatform, clientValidation, consumerValidation, tokenChecker, controller.fourHundredNine);
  //app.route('/412').post(timeout(time), haltOnTimedout, validatePlatform, clientValidation, consumerValidation, tokenChecker, bankAccount.fourHundredTwelve);
  //app.route('/413').post(timeout(time), haltOnTimedout, validatePlatform, clientValidation, consumerValidation, tokenChecker, bankAccount.fourHundredThirteen);
  app.route('/415').post(timeout(time), haltOnTimedout, controller.fourHundredFifteen);
  app.route('/416').post(timeout(time), haltOnTimedout, clientValidation, controller.fourHundredSixteen);
  app.route('/417').post(timeout(time), haltOnTimedout, clientValidation, controller.fourHundredSeventeen);
  app.route('/418').post(timeout(time), haltOnTimedout, clientValidation, controller.fourHundredEighteen);
 // app.route('/419').post(timeout(time), haltOnTimedout, validatePlatform, clientValidation, consumerValidation, tokenChecker, kycAuthentication.fourHundredNineteen);
 // app.route('/420').post(timeout(time), haltOnTimedout, kycAuthentication.fourHundredTwenty);
//  app.route('/421').post(timeout(time), haltOnTimedout, validatePlatform, clientValidation, consumerValidation, tokenChecker, kycAuthentication.fourHundredTwentyOne);
  app.route('/423').post(timeout(time), haltOnTimedout, validatePlatform, clientValidation, consumerValidation, tokenChecker, kycAuthentication.fourHundredTwentyThree);
  app.route('/424').post(timeout(time), haltOnTimedout, validatePlatform, clientValidation, consumerValidation, tokenChecker, controller.fourHundredTwentyfour);
  app.route('/getSignature').post(getSignature);
};
function getTxnCache(req, res, next) {
  let CRNNo = req.body.CRNNo;
  let clientID = req.body.clientID;
  var idrequest = CRNNo + "_" + clientID;
  if (req.body.transactionType && req.body.status == "success") {
    let txnType = req.body.transactionType == "buy" || req.body.transactionType == "buyCash" ? "buy" : req.body.transactionType == "sell" || req.body.transactionType == "sellCash" ? "sell" : req.body.transactionType == "transfer" || req.body.transactionType == "transferCash" ? "transfer" : req.body.transactionType;
    idrequest = CRNNo + "_" + clientID + "_" + txnType + "_" + req.body.status;
  }
  let rdKey = md5(idrequest).toString();
  //Check the cache data from the server redis
  redisClient.client.get(rdKey, (err, result) => { 
    if (result) {
      res.status(400).json({ status: "400", message: "Same request found from another source..!!" });
    } else {
      redisClient.client.setex(rdKey, 10, rdKey);
      next();
    }
  });
}
function haltOnTimedout(req, res, next) {
  if (!req.timedout) next()
}
function validatePlatform(req, res, next) { // only https connection allowed
  var bearer = req.headers.authorization;
  if (!bearer) {
    res.status(400).json({ status: "400", message: "Bad Request!" });
  } else {
    /* var ua = req.headers['user-agent'];  // mobile request allowed
    if (ua) {
      if (ua.includes("okhttp")) {
        next();
      }
      else {
        res.json({ status: "400", message: "Bad Request!" });
      }
    }
    else { */
    next();
    /*  } */
  }
};
function getSignature(req, res) {
  var signKey = req.headers.signkey;
  if (signKey && signKey === "MTz7wihPVZSGKZf9") {
    var cryptos = require("crypto")
    var sha = require("../../sha");
    let data = req.body,
      valArray = new Array(),
      nameArray = new Array();
    var hashid = req.body.clientID;
    let hashKey = md5(hashid);
    if (hashid === "rKGC8N48") {
      hashKey = "3462DE14A68E99AB3F1BFFF53763BF";
    }

    Object.keys(data).forEach(key => {
      valArray.push(data[key]);
      nameArray.push(key);
    });
    nameArray.sort();
    let inputString = "";
    for (let j = 0; j < nameArray.length; j++) {
      var element = nameArray[j];
      inputString += '~';
      inputString += element;
      inputString += '=';
      inputString += data[element];
    }
    inputString = inputString.substr(1);
    inputString += hashKey;
    function signature(sign, key) {
      return cryptos.createHmac('sha256', key)
        .update(Buffer.from(sign, 'utf-8'))
        .digest('hex');
    }
    var signHash = signature(inputString, hashKey);
    var signHash = sha.hash(inputString);
    res.status(200).json({ status: "200", signature: signHash });
  } else {
    res.status(400).json({ status: "400", message: "Bad Request..!!" });
  }
}

function validateBearer(req, res, next) { // validate Bearer Token
  var bearer = req.headers.authorization;
  if (!bearer) {
    res.status(400).json({ status: "400", message: "Bad Request!" });
  }
  else {
    var enbearer = bearer.split(" ");
    if (process.env.NODE_ENV.toLowerCase() == "staging") {
      if (enbearer.length > 0 && enbearer[1] === "U27N0FYBA137GJGN05G8XEK9BA5S86GW" && req.body.clientID) {
        next();
      }
      else {
        if (enbearer.length > 0 && enbearer[1] === md5(req.body.clientID + "API").toUpperCase()) {
          next();
        }
        else {
          res.status(401).json({ status: "401", message: "Unauthorized Request..!!" });
        }
      }
    }
    else {
      if (enbearer.length > 0 && enbearer[1] === md5(req.body.clientID + "API").toUpperCase()) {
        next();
      }
      else {
        next();
        //res.status(401).json({ status: "401", message: "Unauthorized Request..!!" });
      }
    }
  }
};