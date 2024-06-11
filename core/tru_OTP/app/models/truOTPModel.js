var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var sr = {type :String, required : true};
var s = {type :String};
var d = {type : Date, default : Date.now};

var customerotpschema   = new Schema({
   mobile :s, OTP : s,email:s,
   status : {type : String, required : true, enum :["success","failure"], default : "failure"},
   successDate : d, timeStamp : d,
   type : {type : String, required : true, enum :["device","mobile","registration","transaction","fPassword","MPIN", "accountverify", "email", "cBuy","cSell","cTransfer","walletToBank", "resetPassword", "pg"]},
   hash : s, 
   detail : sr    //this column will be recieved from 2 factor which is kind a unique ID from them
});

var OTPSchema = mongoose.model('rotp', customerotpschema);
module.exports = OTPSchema;

//15112018
