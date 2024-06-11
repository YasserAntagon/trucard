'use strict';


//var KycAll = require('../models/adminKYCAllModel');

module.exports = function (app) {
    var controller = require('../controllers/assetstoreController.js');



    app.route('/api/findassetstore')
        .post(controller.findassetstore);



}