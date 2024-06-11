'use strict';

module.exports = function (app) {
  var kyccontroller = require('../controllers/KYCController'),
    bankcontroller = require('../controllers/bankalertController'),
    notificationcontroller = require('../controllers/notificationController');


  app.route('/api')
    .get(kyccontroller.test);


  app.route('/api/insnotification')
    .post(kyccontroller.ins_notification);

  app.route('/api/changereadnotification')
    .post(kyccontroller.change_read_notification);

  app.route('/api/changereadnotification')
    .post(kyccontroller.change_read_notification);

  app.route('/api/shownotifications')
    .post(kyccontroller.show_notifications);

  app.route('/api/shownotificationstimestamp')
    .post(kyccontroller.show_notifications_timestamp);

  app.route('/api/ins_bank_Alert')
    .post(bankcontroller.ins_bank_Alert);

  app.route('/api/entityreadnotification')
    .post(kyccontroller.entity_read_notification);
};
