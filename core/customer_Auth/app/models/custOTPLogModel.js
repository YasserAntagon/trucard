var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;


var customerotplogschema = new Schema({
     mobile :{type :String, required : true},
     otp :{type :String},
     createDate : {type : Date, default : Date.now},
     type : {type : String, required : true, enum :["registration","transaction"]},               
     detail : {type :String, required : true},
     status : {type :String, required : true}
   });


var OTPLogSchema = mongoose.model('otplog', customerotplogschema);

module.exports = OTPLogSchema; 
