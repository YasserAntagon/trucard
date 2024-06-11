var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var d = {type : Date, default : Date.now};
var s = {type :String};

var benificiary = new Schema({
  fav : {type : Boolean, default : false},
  beneficiarytruID :{type :String,required : true},
  nickName:s
});

var beneficiaryschema   = new Schema({
 customertruID : {type :String,required : true, unique : true},
 beneficiary :[benificiary],
 createDate :d, createUser :s, modifyDate :d, modifyUser :s
});

var BeneficiarySchema = mongoose.model('beneficiary', beneficiaryschema);
module.exports = BeneficiarySchema;
