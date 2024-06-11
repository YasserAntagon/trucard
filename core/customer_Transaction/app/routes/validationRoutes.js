'use strict';
module.exports = function (app) {
    const { validatelimitsaddmoney, validatelimits, validateSellToBanklimits } = require('../validations/validations');
    app.route('/v1/api/addmoneyValidation').post(validatelimitsaddmoney, function (req, res) {
        res.status(200).json({ status: "200", message: "You can Proceed" })
    });
    app.route('/v1/api/walletToBankValidation').post(validatelimits, function (req, res) {
        res.status(200).json({ status: "200", message: "You can Proceed" })
    });
    app.route('/v1/api/validateSellToBanklimits').post(validateSellToBanklimits, function (req, res) {
        res.status(200).json({ status: "200", message: "You can Proceed" })
    });
}; 