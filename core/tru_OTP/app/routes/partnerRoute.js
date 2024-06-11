'use strict';

module.exports = function (app) {

    const partnerOTP = require("../controllers/partnerController")

    app.route('/api/generateotponregistration').post(partnerOTP.generate_otp_on_registration);

    app.route('/api/pverifyOTP').post(partnerOTP.verify_otp);

}