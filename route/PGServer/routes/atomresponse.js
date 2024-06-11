var resAtom = require("./controller/b2catomlog");
var resLetpayB2B = require("./controller/b2batomlog");
var express = require('express');
var router = express.Router();
router.post('/truPaymentResponse', function (req, res, next) {
    resAtom.submitAtomLog(res, req.body);
});
router.post('/truPaymentB2BResponse', function (req, res, next) {
    resLetpayB2B.submitAtomLogB2B(res, req.body);
});
module.exports = router;