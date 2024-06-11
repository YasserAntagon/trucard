'use strict';

module.exports = function (app) {
  var clientcontroller = require('../controllers/client.controller');

  app.route('/api/generateotpforclient')
    .post(clientcontroller.generate_otp_for_client)

  app.route('/api/verifyotpforclient')
    .post(clientcontroller.verify_otp_for_client)

  app.route('/api/generatehash')
    .post(clientcontroller.generate_Hash)

  app.route('/api/generatehashByClientID')
    .post(clientcontroller.generate_HashByClientID)

  app.route('/api/verifycHash')
    .post(clientcontroller.verify_cHash)

  app.route('/api/updateToken')
    .post(clientcontroller.update_Token)
};
