var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var s = { type: String };
var d = { type: Date, default: Date.now };

var hashSchema = new Schema({
   CRNNo: s,
   createDate: d,
   type: { type: String, required: false },
   userToken: s,
   clientID: s
});
hashSchema.index({ "createDate": 1 }, { expireAfterSeconds: (24 * 3600 * 30) });
var UserToken = mongoose.model('userToken', hashSchema);
module.exports = UserToken;