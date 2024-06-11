var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var str = { type: String, required: true };
var num = { type: Schema.Types.Decimal128, required: true };

var creditbillinglog = new Schema({
    creditID: str,
    billDate: { type: Date, default: Date.now },
    billID: str,
    billAmount: num,
    interest: num,
    gst: num,
    minDue: num,
    minDueCharge: num,
    totalBillAmount: num,
    lateFee: num,
    lateFeesPeriod: str,
    billPayStatus: { type: String, required: true, enum: ["paid", "unpaid", "partialpaid"], default: "unpaid" },
    billPayBy: { type: String },
    bankTXNID: { type: String },
    dueDate: { type: Date },
    billPayDate: { type: Date },
    lastBillAmount: num,
    lastBillPaidAmount: num,
    lastBillRemainingAmount: num,
    lastBillDate: { type: Date },
    lastBillPayDate: { type: Date },
    note: { type: String }
})

module.exports = mongoose.model('creditbillinglog', creditbillinglog)