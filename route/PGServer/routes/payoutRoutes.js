'use strict';
var timeout = require('connect-timeout')
var time = "300s";
module.exports = function (app) {
  var payoutcontroller = require('./controller/payoutController');
  app.route('/v1/singlePayment')
  .post(validateBearer, timeout(time), haltOnTimedout, payoutcontroller.singlePayment);

  app.route('/v1/singlePaymentStatus')
    .post(validateBearer, timeout(time), haltOnTimedout, payoutcontroller.singlePaymentStatus);


};

function haltOnTimedout(req, res, next) {
  if (!req.timedout) next()
}

function validateBearer(req, res, next) {
  var bearer = req.headers.authorization;
  if (!bearer) {
    res.json({ status: "400", message: "Bad Request!" });
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
    /* } */
  }
};
