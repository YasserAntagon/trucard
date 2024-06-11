'use strict';
var KYCAll = require('../models/custKYCAllModel');
module.exports = function (app) {
    app.route('/api/kycCheck').post(validateClient);
}
async function validateClient(req, res, next) {
    var truID = req.body.truID;
    var letterNumber = /^[0-9]+$/;
    if (truID && truID.length === 16 && letterNumber.test(truID)) {
        var docNumber = "";
        if (req.body.AADHAARNo) {
            docNumber = req.body.AADHAARNo;
        }
        else if (req.body.PANNo) {
            docNumber = req.body.PANNo;
        }
        const count = await KYCAll.countDocuments({ "KYCDetails.docNumber": docNumber });
        if (count > 0) {
            res.status(401).json({ status: "401", message: "Document number already exist..!!" });
        }
        else {
            res.status(200).json({ status: "200" });
        }
    } else {
        res.status(401).json({ status: "401", message: "Invalid Consumer" });
    }
};