'use strict';

module.exports = function (app) {
  var kyccontroller = require('../controllers/KYCController');
  var pgcontroller = require('../controllers/pgGateway');


  app.route('/api')
    .get(kyccontroller.test);


  app.route('/api/generateotp')
    .post(kyccontroller.generate_otp_on_registration)


  app.route('/api/generateotpentityconsumerregistration')
    .post(kyccontroller.generate_otp_entity_consumer_registration)

  app.route('/api/verifyOTP')
    .post(kyccontroller.veriFy_otp_on)


  app.route('/api/generateotpforfpassword')
    .post(kyccontroller.generate_otp_for_fpassword)


  app.route('/api/verifyotpsession')
    .post(kyccontroller.verify_otp_session)

  app.route('/api/generateotpdirectconsumer')
    .post(kyccontroller.generate_otp_for_directconsumer)

  app.route('/api/generateotpforremmit')
    .post(kyccontroller.generate_otp_for_remmit)


  app.route('/api/verifyotpremmit')
    .post(kyccontroller.verify_otp_remmit)


  app.route('/api/generateotpmobility')
    .post(kyccontroller.generate_otp_mobility)

  app.route('/api/verifyotpmobility')
    .post(kyccontroller.verify_otp_mobility)

  app.route('/api/generateotpforemail')
    .post(kyccontroller.generate_otp_for_email)


  app.route('/api/otpverifyforemail')
    .post(kyccontroller.otp_verify_for_email)


  app.route('/api/generateotpforpg')
    .post(pgcontroller.generate_otp_for_pgclient)


  app.route('/api/verifyotpforpg')
    .post(pgcontroller.verify_otp_for_pgclient)

  app.route('/api/verifyUserToken')
    .post(pgcontroller.verify_userToken_for_pgclient)


};
