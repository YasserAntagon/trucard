var mongoose = require('mongoose');
var Schema = mongoose.Schema;//
var str = { type: String };
var deviceSchema = new Schema({
    truID: str,
    createDate: { type: Date },
    lastLogin: { type: Date },
    deviceID: str,
    device: str,
    appType: { type: String, enum: ["api", "web", "app"] }
});
deviceSchema.index({ "createDate": 1 }, { expireAfterSeconds: 2592000 });
var loginlogSchema = mongoose.model('deviceLogs', deviceSchema);
module.exports = loginlogSchema;