'use strict';
const ensummaryRt = require('../controllers/entitySummary');
module.exports = function (app) {


    app.route('/api/walletBreakupSummary')
        .post(ensummaryRt.walletBreakupSummary);
    app.route('/api/entitygstreportadminNEW')
        .post(ensummaryRt.bind_EntityAllSummary);

    app.route('/api/fetchNode')
        .post(ensummaryRt.fetchNode);

    app.route('/api/partnerNodeList')
        .post(ensummaryRt.node_List);

    app.route('/api/getPartnerDetails')
        .post(ensummaryRt.getPartnerDetails);

    app.route('/api/bindWalletLog')
        .post(ensummaryRt.entity_wallet_log_reportNew);

    app.route('/api/egetGSTReport')
        .post(ensummaryRt.egetGSTReport);
    app.route('/api/uploadBrandLogo')
        .post(ensummaryRt.uploadBrandLogo);


} 