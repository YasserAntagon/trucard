var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
var options = {discriminatorKey: 'KYCS'};
var myDB = require("../dbCon/truassetmanagerCon");
var s = {type :String};

var kycschema   = new Schema({
 createDate : s, createUser : s, modifyDate : s, modifyUser : s
});

// var KYCSchema = mongoose.model('KYCS', kycschema);

// module.exports = KYCSchema;

var KYCSchema;
try{
    //const myDB = mongoose.connection.useDb('truDealer');
    KYCSchema = myDB.model('KYCS', kycschema);
}
catch(ex)
{
    console.log("ddd",ex)
}

module.exports = KYCSchema; 
