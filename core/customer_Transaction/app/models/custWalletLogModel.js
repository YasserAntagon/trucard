
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var sr = { type: String, required: true };
var dr = { type: Schema.Types.Decimal128, required: true };


var custwalletlogschema = new Schema({
   truID: sr,
   Cr: dr,
   Dr: dr,
   merchantID: { type: String },
   merchant: { type: String },
   status: { type: String },
   particulars: sr,
   moneyAdded: { type: Boolean, default: false },
   invoice: { type: String, required: true, unique: true },
   againstInvoice: { type: String },
   createDate: { type: Date, default: Date.now },
   tType: { type: String, required: true, enum: ["buy", "buyCash", "redeemCash", "transfer", "addMoney", "walletToBank", "purchase", "cashback"] }
});

var walletLogSchema = mongoose.model('walletlog', custwalletlogschema);
module.exports = walletLogSchema;
