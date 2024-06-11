const mongoose = require('mongoose');
/* const mongooseLeanGetter = require('mongoose-lean-getters'); */
const Schema = mongoose.Schema;
/* const { decryption, encryption } = require('./cipher'); */
var s = { type: String };
/* var es = { type: String, get: decryption, set: encryption }; */
var d = { type: String, default: Date.now };

var account = new Schema({
  bankName: s, IFSC: s, custName: s, accountNo: s, dateAdded: d, relationship: s,
  userAdded: { type: String, default: "sysAdmin" },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  accType: { type: String, enum: ["self", "beneficiary"] }
});

var upi = new Schema({
  IFSC: s,
  custName: s,
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  accType: { type: String, enum: ["self", "beneficiary"] },
  RESPONSE_CODE: s,
  ACCOUNT_TYPE: s,
  TXN_ID: s,
  BANK_REF_NUM: s,
  PHONE_NO: s,
  HASH: s,
  PAY_ID: s,
  upiaddress: s,
  ORDER_ID: s,
  RESPONSE_MESSAGE: s,
  USER_TYPE: s,
  dateAdded: d,
  relationship: s
});

var card = new Schema({
  nameOnCard: s, cardNo: s, exp: { type: Date },
  type: { type: String, enum: ["debit", "credit"], default: "debit" },
  dateAdded: d, userAdded: s,
  status: { type: String, enum: ["active", "inactive"], default: "active" }
});

var wallet = new Schema({
  walletName: s, mobile: s, email: s, dateAdded: d, userAdded: s,
  status: { type: String, enum: ["active", "inactive"], default: "active" }
});

var mop = new Schema({
  accountDetails: [account],
  cardDetails: [card],
  walletDetails: [wallet],
  upiDetails: [upi]
});

var modeofpayment = new Schema({
  truID: { type: String, required: true, unique: true },
  MOP: mop
});
/* modeofpayment.plugin(mongooseLeanGetter); */
var ModeOfPayments = mongoose.model('mops', modeofpayment);
module.exports = ModeOfPayments;
