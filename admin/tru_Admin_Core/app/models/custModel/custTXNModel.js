var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const myDB = require("../dbCon/truCustCon");
var dm = { type: Schema.Types.Decimal128 };
var deci = { type: Schema.Types.Decimal128 };
var sr = { type: String, required: true };

var particulars = new Schema({
    from: sr,
    assetmanagerName: sr,
    qty: dm, rate: dm, amount: dm, assetmanagersCharges: dm,
    qtyAgainstTxnChgs: deci,
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

var customertxnschema = new Schema({
    to: sr,
    receiverTruID: { type: String },
    CRNNo: { type: String },
    invoice: { type: String, required: true, unique: true },
    type: { type: String, required: true, enum: ["buy", "buyCash", "redeemCash", "transfer", "request"] },
    subType: { type: String },
    sourceFlag: { type: String, required: true, enum: ["customer", "remmit", "entity", "assetmanager"], default: "customer" },
    rTruID: { type: String, required: true, default: "customer" },
    nodeID: { type: String, required: true, default: "customer" },
    particularsG24: particulars,
    particularsS99: particulars,
    remmitCharges: { type: Schema.Types.Decimal128, required: true, default: "0.00" },
    totalAmount: dm,
    status: { type: String, required: true, enum: ["success", "failure", "inprocess", "reversal", "refund", "expired"], default: "failure" },
    MOP: { type: String, required: true, enum: ["truWallet", "wallet", "bank", "card", "others", "offline", "other", "stock"], default: "other" },
    ModeOfPay: { type: String },
    createDate: { type: Date },
    hash: { type: String },
    md5sign: { type: String },
    tdsPercentage: { type: Schema.Types.Decimal128 },
    loadingPercentage: { type: Schema.Types.Decimal128 }, 
    desc: { type: String },
    actionDate: { type: Date, default: Date.now }
});

// var TXNSchema = mongoose.model('txn', customertxnschema);

// module.exports = TXNSchema;
var TXNSchema;
try {
    // const myDB = mongoose.connection.useDb('truCust');
    TXNSchema = myDB.model('txn', customertxnschema);
}
catch (ex) {
    console.log("ddd", ex)
}

module.exports = TXNSchema;  