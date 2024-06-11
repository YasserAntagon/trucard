var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
const myDB       = require("./dbCon/truRemmitCon");
var options = {discriminatorKey: 'KYCS'};

var s = {type :String};

var kycschema   = new Schema({
 createDate :s, createUser :s, modifyDate :s, modifyUser :s
});

// var KYCSchema = mongoose.model('KYCS', kycschema);

// module.exports = KYCSchema;

var kycsSchema;
try{
    // const myDB = mongoose.connection.useDb('truRemmit');
    kycsSchema = myDB.model('KYCS', kycschema);
}
catch(ex)
{
    console.log("ddd",ex)
}

module.exports = kycsSchema;