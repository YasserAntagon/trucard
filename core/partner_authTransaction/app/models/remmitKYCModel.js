var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
var options = {discriminatorKey: 'KYCS'};

var s = {type :String};

var kycschema   = new Schema({
 createDate :s, createUser :s, modifyDate :s, modifyUser :s
});

var KYCSchema = mongoose.model('KYCS', kycschema);

module.exports = KYCSchema;
