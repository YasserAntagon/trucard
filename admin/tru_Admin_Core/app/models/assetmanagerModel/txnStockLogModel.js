const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const myDB       = require("../dbCon/truassetmanagerCon");
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
    tType: { type: String, enum: ["buy", "buyCash", "transfer",  "redeemCash", "refund","addStock"] },
    bullionType: sr,
    Cr: d,
    Dr: d,
    currentStock: d,
    previousStock: d,
    hash: sr,
    status: { type: String, enum: ["success", "failure", "pending", "hold", "inprocess","reversal","refund"] },
    createDate: dt,
})

// module.exports = TXNSchema;
var txnschema;
try {
    // const myDB = mongoose.connection.useDb('truCust');
    txnschema = myDB.model('newstocklogs', txnstocklogschema);
}
catch (ex) {
    console.log("ddd", ex)
} 
module.exports = txnschema;