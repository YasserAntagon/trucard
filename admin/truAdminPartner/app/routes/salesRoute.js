'use strict';

var scontroller = require('../controllers/salesController');
module.exports = function (app) { 

    app.route('/api/fetchSalesPerson')
        .post(scontroller.fetchSalesPerson); 
}