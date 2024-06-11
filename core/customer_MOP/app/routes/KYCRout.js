'use strict';

module.exports = function (app) {
  var kyccontroller = require('../controllers/KYCController');

  app.route('/api')
    .get(kyccontroller.test);


  app.route('/api/mopaccount')
    .post(kyccontroller.add_mop_account);

  app.route('/api/addupiaccount')
    .post(kyccontroller.add_mop_upiAccount);


  app.route('/api/mopcard')
    .post(kyccontroller.add_mop_card);


  app.route('/api/mopwallet')
    .post(kyccontroller.add_mop_wallet);


  app.route('/api/remmopaccount')
    .post(kyccontroller.remove_mop_account);

  app.route('/api/removeupi')
    .post(kyccontroller.remove_upi_account);

  app.route('/api/remmopcard')
    .post(kyccontroller.remove_mop_card);

  app.route('/api/remmopwallet')
    .post(kyccontroller.remove_mop_wallet);

  app.route('/api/listaccount')
    .post(kyccontroller.list_accounts);

  app.route('/api/listupiaccount')
    .post(kyccontroller.list_upiaccount);

  app.route('/api/listcard')
    .post(kyccontroller.list_card);


  app.route('/api/listwallet')
    .post(kyccontroller.list_wallet);

    app.route('/api/listaccountsall')
    .post(kyccontroller.list_accounts_all);
};
