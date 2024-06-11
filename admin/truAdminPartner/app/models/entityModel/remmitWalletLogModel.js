
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
const myDB       = require("../dbCon/truRemmitCon");

var sr = {type :String, required : true};
var dr = {type :Schema.Types.Decimal128, required : true};
 
var remmitwalletlogschema = new Schema({
    truID: sr,
    creditID:  { type: String },
    Cr: dr,
    Dr: dr,
    status: { type: String },
    particulars: sr,
    againstInvoice: { type: String },
    moneyAdded: { type: Boolean, default: false },
    invoice: { type: String, required: true, unique: true },
    createDate: { type: Date, default: Date.now },
    tType: { type: String, required: true, enum: ["buy", "buyCash", "redeemCash", "transfer",  "addMoney", "walletToBank", "revenue", "tds"] },
    charges: { type: Schema.Types.Decimal128 },
    cashback: { type: Schema.Types.Decimal128 },
    previousBal: { type: Schema.Types.Decimal128 },
    currentBal: { type: Schema.Types.Decimal128 },
    subType: { type: String },
    referenceID: { type: String }
 });

// var walletLogSchema = mongoose.model('walletlog', remmitwalletlogschema);
// module.exports = walletLogSchema;
var walletLogSchema;
try{
    // const myDB = mongoose.connection.useDb('truRemmit');
    walletLogSchema = myDB.model('walletlog', remmitwalletlogschema);
}
catch(ex)
{
    console.log("ddd",ex)
}

module.exports = walletLogSchema;