var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
var options = {discriminatorKey: 'KYCS'};
const myDB = require("./truRemmitCon");

var s = {type :String};

var kycschema   = new Schema({
 createDate :s, createUser :s, modifyDate :s, modifyUser :s
});

var KYCSchema = myDB.model('KYCS', kycschema);

module.exports = KYCSchema;
