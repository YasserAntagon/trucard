const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const myDB       = require("../dbCon/truCustCon");

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
    tType: { type: String, enum: ["buy", "buyCash", "transfer", "redeemCash", "reversal", "onhold", "release", "expired"] },
    bullionType: sr,
    Cr: d,
    Dr: d,
    currentStock: d,
    previousStock: d,
    hash: sr,
    status: { type: String, enum: ["success", "failure", "pending", "hold", "inprocess", "reversal", "expired", "refund"] },
    createDate: dt,
})

var TXNStockLogSchema;
try{
    // const myDB = mongoose.connection.useDb('truCust');
    TXNStockLogSchema = myDB.model('newstocklogs', txnstocklogschema);
}
catch(ex)
{
    console.log("ddd",ex)
}
// var txnstocklogschema = mongoose.model('txnstocklogs', txnstocklogschema);
module.exports = TXNStockLogSchema;