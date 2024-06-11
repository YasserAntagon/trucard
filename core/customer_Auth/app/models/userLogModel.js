var mongoose = require('mongoose');
var Schema = mongoose.Schema;//
var str = { type: String };

var loginlogsSchema = new Schema({
    truID: str,
    createDate: { type: Date },
    loginFrom: str,
    device: str,
    appType: { type: String, enum: ["api", "web", "app"] },
    referenceId: str,
    activity: str
});

var loginlogSchema = mongoose.model('loginlogs', loginlogsSchema);
module.exports = loginlogSchema;