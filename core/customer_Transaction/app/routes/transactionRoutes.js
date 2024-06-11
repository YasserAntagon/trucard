'use strict';
module.exports = function (app) {
    const {
        getChargesfromDB,
        commonValidationforreceiver,
        enstockAmtValidation,
        validatelimitsaddmoney,
        commonValidation,
    } = require('../validations/validations');
    const { validateStockTxn } = require('../validations/validateStockFloatWalletTxns');
    const buyTransactions = require('../controllers/buy.transaction.controller');
    const partnerTransactions = require('../controllers/remmit.transaction.controller');

    app.route('/v1/api/topassetmanagers').post(buyTransactions.top_assetmanagers);
    app.route('/v1/api/buybullionsmultipleassetmanagers').post(getChargesfromDB, commonValidation, buyTransactions.buy_bullions_multiple_assetmanagers);
    app.route('/v1/api/redeemcashmultipleassetmanagers').post(getChargesfromDB, commonValidation, validateStockTxn, buyTransactions.redeem_cash_multiple_assetmanagers);
    app.route('/v1/api/transferbullion').post(getChargesfromDB, commonValidation, validateStockTxn, buyTransactions.transfer_bullions);

    app.route('/v1/api/walletlogInPartnerreport').post(buyTransactions.wallet_logInPartner_report);
    app.route('/v1/api/consumerReceiptmobile').post(getChargesfromDB, buyTransactions.consumerReceipt_mobile);
    app.route('/v1/api/isOrderExist').post(buyTransactions.isOrderExist);
    app.route('/v1/api/statusenquiry').post(buyTransactions.statusEnquiry);

    //Partner Transaction APIs.
    app.route('/v1/api/rbuybullion').post(enstockAmtValidation, getChargesfromDB, partnerTransactions.remmit_buy_bullions);
    app.route('/v1/api/rbuycashbullion').post(enstockAmtValidation, getChargesfromDB, validateStockTxn, partnerTransactions.remmit_buy_cashbullions);
    app.route('/v1/api/rredeembullioncash').post(enstockAmtValidation, getChargesfromDB, validateStockTxn, partnerTransactions.remmit_redeem_bullions_cash);
    app.route('/v1/api/rtransferbullion').post(enstockAmtValidation, getChargesfromDB, validateStockTxn, partnerTransactions.remmit_transfer_bullions);

}; 