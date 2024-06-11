'use strict';


//var KycAll = require('../models/adminKYCAllModel');

module.exports = function (app) {
    var controller = require('../controllers/truRateController');
    var config_controller = require('../controllers/config.controller');
    var promotioncontroller = require('../controllers/promotion.controller');
    var pgConfiguration = require('../controllers/pgConfiguration');
    app.route('/api/getSecureCredit')
        .post(pgConfiguration.getSecureCredit);

    app.route('/api/LBMAratelog')
        .post(controller.LBMA_rate_log);

    app.route('/api/updateconsumeraccess')
        .post(config_controller.update_PG_access);

    app.route('/api/updatewalletPGconfigconsumer')
        .post(config_controller.update_wallet_PG_config_consumer);

    app.route('/api/showconsumerconfigurations')
        .post(config_controller.show_consumer_configurations);

    app.route('/apicreatePromotion')
        .post(promotioncontroller.create_Promotion);

    app.route('/apiupdatePromotion')
        .post(promotioncontroller.update_Promotion);

    app.route('/apilistpromotionsall')
        .post(promotioncontroller.List_Promotions_All);

    app.route('/apideletePromotion')
        .post(promotioncontroller.delete_Promotion);

    app.route('/api/digitalpayment')
        .post(pgConfiguration.digital_payment);

    app.route('/api/digitalpaymentlist')
        .post(pgConfiguration.digital_payment_list);

    app.route('/api/insbankslab')
        .post(pgConfiguration.ins_bank_slab);

    app.route('/api/consumerCommonPermission')
        .post(pgConfiguration.consumer_Permission);

    app.route('/api/consumerCommontxnupdatelimit')
        .post(pgConfiguration.consumer_updatelimit);

    app.route('/api/consumerCommonhomeupdatelimit')
        .post(pgConfiguration.home_updatelimit);

    app.route('/api/consumerCommonWalletupdateLimit')
        .post(pgConfiguration.consumer_updateWalletLimit);

    app.route('/api/digitalpaymentpayIn')
        .post(pgConfiguration.digital_payment_payIn);

    app.route('/api/digitalpaymentimpsPayOut')
        .post(pgConfiguration.digital_payment_impsPayOut);

    app.route('/api/digitalpaymentneftPayOut')
        .post(pgConfiguration.digital_payment_neftPayOut);

    app.route('/api/digitalpaymentsetdefault')
        .post(pgConfiguration.digital_payment_setDefault);


}