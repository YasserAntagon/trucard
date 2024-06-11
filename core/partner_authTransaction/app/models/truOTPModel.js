var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var sr = {type :String, required : true};

var remmitotpschema   = new Schema({
   mobile :sr, OTP : {type :String},
   status : {type : String, required : true, enum :["scuccess","failure"], default : "failure"},
   timeStamp : {type : Date, default : Date.now},
   type : {type : String, required : true, enum :["registration","fPassword","transaction","MPIN", "accountverify", "email"]},
   detail : sr//this column will be recieved from 2 factor which is kind a unique ID from them
});

var OTPSchema = mongoose.model('rotp', remmitotpschema);

module.exports = OTPSchema;
