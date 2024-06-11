'use strict'; 
module.exports = function (app) {
    var truCoincontroller = require('../controllers/truCoinController');
    app.route('/trucoinrates').post(truCoincontroller.truCoinRates);
    app.route('/getCurrencyRate').post(truCoincontroller.getCurrencyRate);
    
}