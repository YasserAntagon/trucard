'use strict';
var timeout = require('connect-timeout')
var request = require('request');
var conf = require("../config");
var time = "300s";
module.exports = function (app) {
  var controller = require('../controllers/controller');


  app.route('/11')
    .post(validateBearer, timeout(time), haltOnTimedout, controller.eleven);


  app.route('/14')
    .post(validateBearer, timeout(time), haltOnTimedout, controller.forteen);


  app.route('/27')
    .post(validateBearer, timeout(time), haltOnTimedout, controller.twentyseven);

  app.route('/30')
    .post(validateBearer, timeout(time), haltOnTimedout, controller.thirty);


  app.route('/31')
    .post(validateBearer, timeout(time), haltOnTimedout, controller.thirtyone);


  app.route('/36')
    .post(validateBearer, timeout(time), haltOnTimedout, controller.thirtysix);


  app.route('/42')
    .post(validateBearer, timeout(time), haltOnTimedout, controller.fourtytwo);


  app.route('/43')
    .post(validateBearer, timeout(time), haltOnTimedout, controller.fourtythree);

  app.route('/49')
    .post(validateBearer, timeout(time), haltOnTimedout, controller.fourtynine);


  app.route('/50')
    .post(validateBearer, timeout(time), haltOnTimedout, controller.fifty);


  app.route('/51')
    .post(validateBearer, timeout(time), haltOnTimedout, controller.fiftyone);

  app.route('/68')
    .post(validateBearer, timeout(time), haltOnTimedout, controller.sixtyeight);

  app.route('/70')
    .post(validateBearer, timeout(time), haltOnTimedout, controller.seventy);

  app.route('/89')
    .post(validateBearer, timeout(time), haltOnTimedout, controller.eightynine);

  app.route('/90')
    .post(validateBearer, timeout(time), haltOnTimedout, controller.ninety);

  app.route('/108')
    .post(validateBearer, timeout(time), haltOnTimedout, controller.hundredeight);

  app.route('/113')
    .post(validateBearer, timeout(time), haltOnTimedout, controller.hundredthirteen);

  app.route('/114')
    .post(validateBearer, timeout(time), haltOnTimedout, controller.hundredfourteen);

  app.route('/115')
    .post(validateBearer, timeout(time), haltOnTimedout, controller.hundredfifteen);

  app.route('/116')
    .post(validateBearer, timeout(time), haltOnTimedout, controller.hundredsixteen);

  app.route('/117')
    .post(validateBearer, timeout(time), haltOnTimedout, controller.hundredseventeen);


  app.route('/129')
    .post(validateBearer, timeout(time), haltOnTimedout, controller.hundredtwentynine);


  app.route('/132')
    .post(validateBearer, timeout(time), haltOnTimedout, controller.hundredthirtytwo);


  app.route('/138')
    .post(validateBearer, timeout(time), haltOnTimedout, controller.hundredthirtyeight);

  app.route('/142')
    .post(validateBearer, timeout(time), haltOnTimedout, controller.hundredfourtytwo);

  app.route('/143')
    .post(validateBearer, timeout(time), haltOnTimedout, controller.hundredfourtythree);

  app.route('/144')
    .post(validateBearer, timeout(time), haltOnTimedout, controller.hundredfourtyfour);


  app.route('/148')
    .post(validateBearer, timeout(time), haltOnTimedout, controller.hundredfourtyeight);


  app.route('/158')
    .post(validateBearer, timeout(time), haltOnTimedout, controller.hundredfiftyeight);

    app.route('/159')
    .post(validateBearer, timeout(time), haltOnTimedout, controller.hundredfiftynine);

  app.route('/160')
    .post(validateBearer, timeout(time), haltOnTimedout, controller.hundredsixty);

  app.route('/171')
    .post(validateBearer, timeout(time), haltOnTimedout, controller.hundredseventyOne);       // Created by : Nikhil Bharambe

};

function haltOnTimedout(req, res, next) {
  if (!req.timedout) next()
}
function validateAPPHash(req, res, next) {
  /*  next(); */
  const mhash = req.headers.devicehash;
  if (mhash) {
    if (req.body.truID) {
      machinCheck(req.body.truID)
    }
    else {
      request.post({
        "headers": { "content-type": "application/json" },
        "url": conf.reqip + ":4112/api/searchIsValidConsumerLogin",
        "body": JSON.stringify(req.body)
      }, (error, response, body) => {
        var newjsonresp = JSON.parse(body);
        if (newjsonresp.status == "200") {
          let newresp = newjsonresp.resource;
          machinCheck(newresp.truID);
        } else {
          res.json(newjsonresp);
        }
      })
    }
  } else {
    res.json({ status: "400", message: "Invalid Request" });
  }
  function machinCheck(truIDs) {
    request.post({
      "headers": { "content-type": "application/json" },
      "url": conf.reqip + ":4112/api/verifyConsumerDeviceHash",
      "body": JSON.stringify({ "deviceid": mhash, "truid": truIDs })
    }, (error, response, body) => {
      if (response.statusCode == 200) {
        var resbody = JSON.parse(body);
        if (resbody.status == "200") {
          next();
        }
        else {
          res.json(resbody);
        }
      }
      else {
        res.json(resbody);
      }
    });
  }
};
function validateBearer(req, res, next) {
  var bearer = req.headers.authorization;
  if (!bearer) {
    res.json({ status: "400", message: "Bad Request!" });
  }
  else {
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
    /* } */
  }
};