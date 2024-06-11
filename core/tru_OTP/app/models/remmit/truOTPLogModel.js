var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
const myDB = require("./truRemmitCon");

var sr = {type :String, required : true};

var remmitotplogschema = new Schema({
     mobile :sr, OTP :{type :String},
     createDate : {type : Date, default : Date.now},
     type : {type : String, required : true, enum :["registration","transaction", "fPassword","MPIN","accountverify", "email"]},
     detail : sr, status : sr
   });

var OTPLogSchema = myDB.model('otplog', remmitotplogschema);

module.exports = OTPLogSchema;
