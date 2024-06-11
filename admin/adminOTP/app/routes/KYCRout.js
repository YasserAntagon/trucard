'use strict';

module.exports = function (app) {
  var kyccontroller = require('../controllers/KYCController');


  app.route('/api')
    .get(kyccontroller.test);


  app.route('/api/generateotp')
    .post(kyccontroller.generate_otp)


  app.route('/api/verifyotp')
    .post(kyccontroller.verify_otp);
};
