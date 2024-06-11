var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var str = { type: String, required: true };
var num = { type: Schema.Types.Decimal128, required: true };

var CreditlogSchema = new Schema({
    creditID:str,
    truID: str,
    rTruID: str,
    Dr: num,
    Cr: num,
    remainBal: num,
    txnNote: { type: String },
    txnID: str,
    createDate: { type: Date, default: Date.now },
    tType: { type: String, required: true, enum: ["credit", "billpay", "purchase"] },
    status : { type: String, required: true, enum: ["unbilled", "billed"] },
    sourceFlag : { type: String, required: true, enum: ["remmit", "consumer"] }
})

module.exports = mongoose.model('creditslog', CreditlogSchema)