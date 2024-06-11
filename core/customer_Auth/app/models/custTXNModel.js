var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var dm = { type: Schema.Types.Decimal128, required: true };
var sr = { type: String, required: true };

var particulars = new Schema({
   from: sr,
   assetmanagerName: sr,
   qty: dm, rate: dm, amount: dm, assetmanagersCharges: dm,
   otherCharges: dm, tax: dm, total: dm,
   isRedeem: { type: Boolean, default: false },
   TID: { type: String }
});

var customertxnschema = new Schema({

   to: sr,
   invoice: sr,
   type: { type: String, required: true, enum: ["buy", "buyCash", "redeemCash", "transfer", "gift"] },
   sourceFlag: { type: String, required: true, enum: ["customer", "remmit"], default: "customer" },
   rTruID: { type: String, required: true, default: "customer" },
   nodeID: { type: String, required: true, default: "customer" },
   particularsG24: [particulars],


   particularsS99: [particulars],
   remmitCharges: { type: Schema.Types.Decimal128, required: true, default: "0.00" },
   totalAmount: dm,
   status: { type: String, required: true, enum: ["scuccess", "failure"], default: "failure" },
   MOP: { type: String, required: true, enum: ["truWallet", "wallet", "bank", "card", "others", "offline"], default: "others" },
   createDate: { type: Date },
   hash: { type: String }

});

var TXNSchema = mongoose.model('txn', customertxnschema);

module.exports = TXNSchema;
