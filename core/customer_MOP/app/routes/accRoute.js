'use strict';
var KycAll = require('../models/custKYCAllModel');
module.exports = function (app) {
  var accController = require('../controllers/accController');
  app.route('/linkAccount').post(validateConsumer, accController.linkAccount);
  app.route('/fetchAccount').post(validateConsumer, accController.fetchAccount);
  app.route('/unlinkAccount').post(validateConsumer, accController.unlinkAccount);
  app.route('/updateStatus').post(validateConsumer, accController.unlinkAccount);
  app.route('/setDefaultAccount').post(validateConsumer, accController.setDefaultAccount);
}

async function validateConsumer(req, res, next) {
  var truID = req.body.truID;
  var letterNumber = /^[0-9]+$/;
  if (truID && truID.length === 16 && letterNumber.test(truID)) {
    var count = await KycAll.countDocuments({ "truID": truID });
    if (count > 0) {
      next()
    } else {

      res.status(411).json({
        status: "411",
        message: "Invalid Consumer"
      });
    }
  } else {
    res.status(401).json({ status: "401", message: "Please check field Validation" });
  }
};