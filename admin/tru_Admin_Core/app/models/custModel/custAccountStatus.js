
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
const myDB       = require("../dbCon/truCustCon");

var accStatusSchema   = new Schema({
 createDate :{type : Date, default : Date.now},
 truID :{type :String}, 
 modifiedBy :{type :String}, 
 KYCFlag :{type :String}, 
 reason :{type :String},
 source :{type :String}
});

// var KYCSchema = mongoose.model('KYCS', kycschema);

// module.exports = KYCSchema; 
var accStatus;
try{
    // const myDB = mongoose.connection.useDb('truCust');
    accStatus = myDB.model('accStatus', accStatusSchema);
}
catch(ex)
{
    console.log("ddd",ex)
}

module.exports = accStatus;  

