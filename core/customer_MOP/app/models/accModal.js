const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var s = { type: String };
var bankAccounts = new Schema({
  accountId: { type: String, required: true, unique: true },
  reference_id: s,
  bank_name: s,
  utr: s, 
  name: s,
  city: s,
  branch: s,
  accountNo: { type: String, required: true },
  IFSC: { type: String, required: true },
  last4: { type: String, required: true },
  status: { type: String, required: true, enum: ["active", "inactive", "unlinked"], default: "active" }
});
bankAccounts.set("timestamps", true); // do not remove 
var accounts = new Schema({
  id: { type: String, required: true, unique: true },
  truID: { type: String, unique: true, required: true },
  isDefault: { type: String, required: true },
  bankAccounts: [bankAccounts]
});
accounts.set("timestamps", true); // do not remove 
module.exports = mongoose.model('accounts', accounts);
