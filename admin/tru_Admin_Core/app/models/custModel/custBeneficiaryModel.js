
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
const myDB       = require("../dbCon/truCustCon");

var beneficiaryschema   = new Schema({
 customertruID : {type :String,required : true, unique : true},
 beneficiarytruID :{type : Array},
 createDate :{type : Date, default : Date.now},
 createUser :{type :String},
 modifyDate :{type : Date, default : Date.now},
 modifyUser :{type :String}
});

// var BeneficiarySchema = mongoose.model('beneficiary', beneficiaryschema);


var BeneficiarySchema;
try{
    // const myDB = mongoose.connection.useDb('truCust');
    BeneficiarySchema = myDB.model('beneficiary', beneficiaryschema);
}
catch(ex)
{
    console.log("ddd",ex)
}

module.exports = BeneficiarySchema;  
