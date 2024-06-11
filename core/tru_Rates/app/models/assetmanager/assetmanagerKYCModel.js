var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
const DBCon       = require("../dbCon/truassetmanager");
var options = {discriminatorKey: 'KYCS'};

var s = {type :String};

var kycschema   = new Schema({
 createDate : s, createUser : s, modifyDate : s, modifyUser : s
});

var KYCSchema = DBCon.model('KYCS', kycschema);
module.exports = KYCSchema;
