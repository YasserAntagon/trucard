
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const myDB = require("../dbCon/truRemmitCon");
var sr = { type: String, required: true };
var dr = { type: Schema.Types.Decimal128, required: true };
var remmitwalletlogschema = new Schema({
    truID: sr,
    Cr: dr,
    Dr: dr,
    particulars: sr,
    moneyAdded: { type: Boolean, default: false },
    invoice: { type: String, required: true, unique: true },
    createDate: { type: Date, default: Date.now },
    referenceID: { type: String },
    againstInvoice: { type: String },
    desc: { type: String },
    tType: { type: String, required: true, enum: ["buy", "buyCash", "redeemCash", "transfer", "addMoney", "reversal", "refund"] },
    UTRNo: { type: String },
    bankName: { type: String },
    acOrigin: { type: String },
    destinationAC: { type: String },
    mode: { type: String },
    status: { type: String },
    charges: { type: Schema.Types.Decimal128 },
    cashback: { type: Schema.Types.Decimal128 },
    actionDate: { type: Date, default: Date.now },
    actionBy: { type: String }
});

// var walletLogSchema = mongoose.model('walletlog', remmitwalletlogschema);
// module.exports = walletLogSchema;
var walletLogSchema;
try {
    // const myDB = mongoose.connection.useDb('truRemmit');
    walletLogSchema = myDB.model('walletlog', remmitwalletlogschema);
}
catch (ex) {
    console.log("ddd", ex)
}

module.exports = walletLogSchema;