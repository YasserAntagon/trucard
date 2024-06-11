
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
const myDB       = require("../dbCon/truCustCon");
var options = {discriminatorKey: 'KYCS'
};


var kycschema   = new Schema({
 createDate :{type : Date, default : Date.now},
 createUser :{type :String},
 modifyDate :{type : Date, default : Date.now},
 modifyUser :{type :String}
});

// var KYCSchema = mongoose.model('KYCS', kycschema);

// module.exports = KYCSchema; 
var KYCSchema;
try{
    // const myDB = mongoose.connection.useDb('truCust');
    KYCSchema = myDB.model('KYCS', kycschema);
}
catch(ex)
{
    console.log("ddd",ex)
}

module.exports = KYCSchema;  

