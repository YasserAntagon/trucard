
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
const myDB       = require("../dbCon/truUserCon");
var options = {discriminatorKey: 'KYCS'
};


var kycschema   = new Schema({
 createDate :{type : Date, default : Date.now},
 createUser :{type :String},
 modifyDate :{type : Date, default : Date.now},
 modifyUser :{type :String}
});

var KYCSchema = myDB.model('KYCS', kycschema);

module.exports = KYCSchema; 
