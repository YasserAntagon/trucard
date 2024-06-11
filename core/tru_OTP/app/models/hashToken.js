var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var sr = {type :String, required : true};
var s = {type :String};
var d = {type : Date, default : Date.now};

var hashSchema   = new Schema({
   queueId:sr,
   CRNNo :s, 
   truID : s, 
   status : {type : String, required : true, enum :["success","failure","closed"], default : "failure"},
   statusDate : d, 
   createDate : d,
   tType : {type : String, required : false},
   hash : s,  
   rTruId :s
});
hashSchema.index({ "createDate": 1 }, { expireAfterSeconds: 10, partialFilterExpression: { status: 'success' } });
var OTPSchema = mongoose.model('rHash', hashSchema);
module.exports = OTPSchema;

//15112018
