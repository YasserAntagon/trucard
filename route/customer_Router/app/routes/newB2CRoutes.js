
'use strict';
var timeout = require('connect-timeout')
var time = "300s";
module.exports = function (app) {
    var b2cnewcontroller = require('../controllers/b2c.new.controllers');
    // B2C New and Updated API
    app.route('/801')
        .post(validateBearer, timeout(time), haltOnTimedout, b2cnewcontroller.eighthundredone);       // Created by : Adnan Shaikh

    app.route('/803')
        .post(validateBearer, timeout(time), haltOnTimedout, b2cnewcontroller.eighthundredthree);       // Created by : Nikhil Bharambe

    app.route('/804')
        .post(validateBearer, timeout(time), haltOnTimedout, b2cnewcontroller.eighthundredfour);       // Created by : Nikhil Bharambe

    app.route('/805')
        .post(validateBearer, timeout(time), haltOnTimedout, b2cnewcontroller.eighthundredfive);       // Created by : Adnan Shaikh

    app.route('/806')
        .post(validateBearer, timeout(time), haltOnTimedout, b2cnewcontroller.eighthundredsix);       // Created by : Nikhil Bharambe

    app.route('/807')
        .post(validateBearer, timeout(time), haltOnTimedout, b2cnewcontroller.eighthundredseven);       // Created by : Suresh Patil
 
    app.route('/809')
        .post(validateBearer, timeout(time), haltOnTimedout, b2cnewcontroller.eighthundrednine);       // Created by : Suresh Patil

    app.route('/810')
        .post(validateBearer, timeout(time), haltOnTimedout, b2cnewcontroller.eighthundredten);       // Created by : Suresh Patil

    app.route('/811')
        .post(validateBearer, timeout(time), haltOnTimedout, b2cnewcontroller.eighthundredeleven);       // Created by : Suresh Patil

    app.route('/812')
        .post(validateBearer, timeout(time), haltOnTimedout, b2cnewcontroller.eighthundredtwelve);       // Created by : Suresh Patil

    app.route('/scancuqr')
        .post(validateBearer, timeout(time), haltOnTimedout, b2cnewcontroller.scan_cuqr);
        
    app.route('/genQR')
        .post(validateBearer, timeout(time), haltOnTimedout, b2cnewcontroller.generateQR);
}


function haltOnTimedout(req, res, next) {
    if (!req.timedout) next()
}

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