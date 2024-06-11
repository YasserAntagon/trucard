var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var str = { type: String };
var strReq = { type: String, required: true };
var num = { type: Schema.Types.Decimal128, required: true };
var credit = new Schema({
    creditID: strReq,
    rtruID: strReq,
    amount: num,
    bal: num,
    type: { type: String, required: true, enum: ["bullion", "cash"] },
    bullionType: { type: String, enum: ["G24K","S99P"] },
    bullionQty: { type: Schema.Types.Decimal128 },
    accessType: { type: String, required: true, enum: ["insecure", "secure"] },
    tenure: { type: String, required: true, enum: ["day", "week", "fortnight", "month", "quarter", "biannual", "annual", "custom"] },
    tenureDate: { type: Date },
    billingCycle: { type: String, required: true, enum: ["daily", "weekly", "fortnightly", "monthly", "quarterly", "biannually", "annually"] },
    billingDate: { type: Date },
    interestRate: num,
    lateFees: num,
    lateFeesPeriod: { type: String, required: true, enum: ["daily", "weekly", "fortnightly", "monthly", "quarterly", "biannually", "annually", "lumpsum"] },
    minDue:num,
    minDuecharges:num,
    dueDays:num,
    gst: num,
    status: { type: String, required: true, enum: ["active", "suspended", "closed", "seize", "hold", "inprocess"] },
    createDate: { type: Date},
    modifyDate: { type: Date },
});

var CreditsSchema = new Schema({
    truID: str,
    credits: [credit]
})

module.exports = mongoose.model('credits', CreditsSchema);