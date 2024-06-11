var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
var options = {discriminatorKey: 'KYCS'};
var s = {type :String};
var d = {type :Date,default:Date.now};

var kycschema   = new Schema({
 createDate : d, createUser : s, modifyDate : d, modifyUser : s
});

var KYCSchema = mongoose.model('KYCS', kycschema);

module.exports = KYCSchema;

//13022019
