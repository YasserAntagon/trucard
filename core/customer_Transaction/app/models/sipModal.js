var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var str = { type: String };
var strReq = { type: String, required: true };
var num = { type: Schema.Types.Decimal128, required: true, default: 0 };
var sip = new Schema({
  sipID: strReq,
  truID: strReq,
  investedInAC: {
    "accNumber": str,
    "routingNumber": str,
    "accType": str
  },
  budget: num,
  initialInv: num,
  frequency: { type: String, required: true, enum: ["weekly", "semimonthly", "monthly"] },
  recurDay: { type: Number, required: true, default: 5 },
  recInstallment: num,
  type: { type: String, required: true, enum: ["cash"] },
  bullionType: { type: String, enum: ["G24K", "S99P", "both"] },
  s99P: num,
  g24k: num,
  tenure: { type: Number, required: true, default: 0 },// in days 
  status: { type: String, required: true, enum: ["active", "suspended", "closed", "seize", "hold", "inprocess"] },
  createDate: { type: Date },
  modifyDate: { type: Date },
  timespan: { type: Date }
});

module.exports = mongoose.model('sip', sip);