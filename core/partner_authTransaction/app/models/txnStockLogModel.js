const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var sru = { type: String, required: true, unique: true };
var sr = { type: String, required: true };
var s = { type: String };
var d = { type: Schema.Types.Decimal128, required: true };
var dt = { type: Date, default: Date.now() };
var txnstocklogschema = new Schema({
    stockID: sru,
    truID: sr,
    rTruID: s,
    invoice: sr,
    tType: { type: String, enum: ["buy", "buyCash", "transfer", "redeemCash", "refund"] },
    bullionType: sr,
    Cr: d,
    Dr: d,
    currentStock: d,
    previousStock: d,
    hash: sr,
    status: { type: String, enum: ["success", "failure", "pending", "hold", "inprocess", "refund"] },
    createDate: dt,
});

var txnstocklogschema = mongoose.model('newstocklogs', txnstocklogschema);
module.exports = txnstocklogschema;