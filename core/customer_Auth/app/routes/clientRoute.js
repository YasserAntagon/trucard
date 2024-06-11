'use strict';

module.exports = function (app) {
  let clientcontroller = require('../controllers/client.controller')

  app.route('/api/clientconsumerregistration')
    .post(clientcontroller.client_ConsumerRegistration);

  app.route('/api/clientprofile')
    .post(clientcontroller.clientProfile);

  app.route('/api/clientconusumerList')
    .post(clientcontroller.client_consumerList);

  app.route('/api/checkconsumer')
    .post(clientcontroller.check_consumer);

  app.route('/api/consumerdigitalkyc')
    .post(clientcontroller.digital_kyc);

  app.route('/api/clientAddressUpdate')
    .post(clientcontroller.clientAddressUpdate);

  app.route('/api/consumerkycActivate')
    .post(clientcontroller.client_kycUpdate);
};