//- Created By: Adnan Shaikh

'use strict';

module.exports = function (app) {
  let b2ccontroller = require('../controllers/b2c.new.updated.controller')
  ////////////////Just Rohjgar APIs

  app.route('/api/registrationNewB2C')
    .post(b2ccontroller.registration_new_B2C);

    app.route('/api/addressUpdateB2C')
      .post(b2ccontroller.address_Update_B2C);
};
