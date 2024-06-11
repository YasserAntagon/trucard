var refund = require("./Refund/refund");
var express = require('express');
var router = express.Router();
router.post('/refundAtomStatus', function (req, res, next) { 
    refund.refundAtomStatus(req,res);
});
router.post('/initiateAtomRefund', function (req, res, next) {
    refund.initiateAtomRefund(req,res);
});
module.exports = router;