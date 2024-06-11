'use strict';
const TXNStockLog = require('../models/txnStockLogModel');
exports.validateStockTxn = async function (req, res, next) {
    try {
        next();
      
    } catch (ex) {
        res.status(500).json({ status: "500", message: "Internal Server Error" });
    }
}