var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const myDB = require("../dbCon/truRemmitCon");

var dm = { type: Schema.Types.Decimal128, required: true }; //mandatory in number
var deci = { type: Schema.Types.Decimal128 };
var sr = { type: String, required: true };

var particulars = new Schema({
    from: sr,
    assetmanagerName: sr,
    qty: dm, rate: dm, amount: dm, assetmanagersCharges: dm,
    qtyAgainstTxnChgs: dm,
    otherCharges: dm, tax: dm, total: dm, entityRevenue: deci,
    partnerCharges: dm, nodeCharges: dm,
    assetstoreCharges: dm, transactionCharges: dm,
    grossRate: dm, baseRate: dm, grossamount: dm, baseamount: dm,
    grosspartnerCharges: deci, tdsonpartnerCharges: deci, grossnodeCharges: deci, tdsonnodeCharges: deci,
    txnLoading: { type: Schema.Types.Decimal128 }, clientTransactionCharges: { type: Schema.Types.Decimal128 },
    remmitCharges: { type: Schema.Types.Decimal128 }, transferFee: { type: Schema.Types.Decimal128 },
    isRedeem: { type: Boolean, default: false },
    TID: { type: String },
    conversionFee: deci,
    dCRNNo: { type: String },
    fromCRNNo: { type: String }
});

var entitytxnschema = new Schema({
    to: sr,
    invoice: sr,
    receiverTruID: { type: String },
    type: { type: String, required: true, enum: ["buy", "buyCash", "redeemCash", "transfer"] },
    sourceFlag: { type: String, required: true, enum: ["customer", "entity"], default: "entity" },
    rTruID: { type: String, required: true, default: "customer" },
    particularsG24: particulars,


    particularsS99: particulars,
    remmitCharges: { type: Schema.Types.Decimal128, required: true, default: "0.00" },
    totalAmount: dm,
    status: { type: String, required: true, enum: ["success", "failure"], default: "failure" },
    MOP: { type: String, required: true, enum: ["truWallet", "wallet", "others", "offline", "stock", "other"], default: "others" },
    createDate: { type: Date },
    hash: { type: String },
    subType: { type: String },
    md5sign: { type: String }
});

// var TXNSchema = mongoose.model('txn', entitytxnschema);

// module.exports = TXNSchema;
var TXNSchema;
try {
    // const myDB = mongoose.connection.useDb('truRemmit');
    TXNSchema = myDB.model('txn', entitytxnschema);
}
catch (ex) {
    console.log("ddd", ex)
}

module.exports = TXNSchema;
