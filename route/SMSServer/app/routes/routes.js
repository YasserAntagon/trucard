'use strict';

module.exports = function(app) {
  var controller = require('../controllers/controller');
  var checkSMSCredits = require('../controllers/checkSMSCredits');

  app.route('/api').get(controller.test);
  app.route('/api1').get(controller.test1);
  app.route('/130').post(controller.hundredthirty);
  app.route('/140').post(controller.hundredforty);
  app.route('/150').post(controller.hundredfifty);
  app.route('/160').post(controller.hundredsixty);
  app.route('/170').post(controller.hundredseventy);
  app.route('/api/twoFactorCheckCreditBalance').post(checkSMSCredits.twoFactor_CheckCreditBalance);

};
