var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;


var customerotpschema   = new Schema({
   mobile :{type :String, required : true},
   OTP : {type :String},
   status : {type : String, required : true, enum :["scuccess","failure"], default : "failure"},
   timeStamp : {type : Date, default : Date.now},
   type : {type : String, required : true, enum :["registration","transaction"]},
   detail : {type :String, required : true}
});

var OTPSchema = mongoose.model('rotp', customerotpschema);

module.exports = OTPSchema; 
