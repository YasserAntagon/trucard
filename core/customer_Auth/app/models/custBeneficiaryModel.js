
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var beneficiaryschema   = new Schema({
 customertruID : {type :String,required : true, unique : true},
 beneficiarytruID :{type : Array},
 createDate :{type : Date, default : Date.now},
 createUser :{type :String},
 modifyDate :{type : Date, default : Date.now},
 modifyUser :{type :String}
});

var BeneficiarySchema = mongoose.model('beneficiary', beneficiaryschema);

module.exports = BeneficiarySchema; 
