'use strict';

module.exports = function(app) {  
  const config_controller = require('../controllers/config.controller');
  const pgConfiguration = require('../controllers/pgConfiguration');
  
  //payment gateway config
  app.route('/api/digitalpayment')
  .post(pgConfiguration.digital_payment);

  app.route('/api/insbankslab')
  .post(pgConfiguration.ins_bank_slab);

  app.route('/api/getbankslabbyamt')
  .post(pgConfiguration.get_bank_slab_by_amt);

  app.route('/api/digitalpaymentlist')
  .post(pgConfiguration.digital_payment_list);

  app.route('/api/digitalpaymentpayIn')
  .post(pgConfiguration.digital_payment_payIn);

  app.route('/api/digitalpaymentimpsPayOut')
  .post(pgConfiguration.digital_payment_impsPayOut);

  app.route('/api/digitalpaymentneftPayOut')
  .post(pgConfiguration.digital_payment_neftPayOut);

  app.route('/api/digitalpaymentupiPayOut')
  .post(pgConfiguration.digital_payment_upiPayOut);

  app.route('/api/digitalpaymentsetdefault')
  .post(pgConfiguration.digital_payment_setDefault);

  //Consumer.Config

  app.route('/api/updateconsumeraccess')
    .post(config_controller.update_PG_access);

  app.route('/api/updatebuylimitconsumer')
    .post(config_controller.update_buy_limit_consumer);

  app.route('/api/updateredeemCashlimitconsumer')
    .post(config_controller.update_redeemCash_limit_consumer);

  app.route('/api/updatetransferlimitconsumer')
    .post(config_controller.update_transfer_limit_consumer);

  app.route('/api/updatewalletPGconfigconsumer')
    .post(config_controller.update_wallet_PG_config_consumer);

  app.route('/api/showconsumerconfigurations')
    .post(config_controller.show_consumer_configurations); 

  app.route('/api/showconsumerconfigurationsAll')
    .post(config_controller.show_consumer_configurations_all); 
}
