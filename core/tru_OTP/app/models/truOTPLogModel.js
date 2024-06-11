var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var sr = {type :String, required : true};
var s = {type :String};

var customerotplogschema = new Schema({
     mobile :s, OTP :s, email:s,
     createDate : {type : Date, default : Date.now},
     //flag : {type : String, required : true, enum :["used","unused"], default : "unused"},
     type : {type : String, required : true, enum :["device","mobile","registration","transaction","fPassword","MPIN", "accountverify", "email", "cBuy","cSell","cTransfer","walletToBank", "resetPassword", "pg"]},
     detail : sr, hash : s,//removed require on 17102018
     status : sr
   });
var OTPLogSchema = mongoose.model('otplog', customerotplogschema);
module.exports = OTPLogSchema;

//15112018
