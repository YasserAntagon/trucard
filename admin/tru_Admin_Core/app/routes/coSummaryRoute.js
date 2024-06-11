'use strict';
const summaryRoute = require('../controllers/consumerSummary');
module.exports = function (app) {


  // summarry Route - Admin
  app.route('/api/consumergstreportadminNEW')
    .post(summaryRoute.consumerSite_gst_report);

  // Consumer Panel
  app.route('/api/consumergstreport')
    .post(summaryRoute.consumerSite_gst_report);

  // Consumer Panel
  app.route('/api/bind_WalletLog')
    .post(summaryRoute.bind_WalletLog);


  app.route('/api/fetchConsumer')
    .post(summaryRoute.fetchConsumerByName_Mobile);

  app.route('/api/consumerListPartner')
    .post(summaryRoute.partner_ConsumerList);

  app.route('/api/countallPeople')
    .post(summaryRoute.countall_People);

  app.route('/api/cgetGSTReport')
    .post(summaryRoute.cgetGSTReport);

  app.route('/api/setOnHoldBalance')
    .post(summaryRoute.setOnHold_Balance);

  app.route('/api/getOnHoldBalance')
    .post(summaryRoute.getOnHold_Balance);

    app.route('/api/getPGInvoice')
    .post(summaryRoute.getPGInvoice);

    


} 