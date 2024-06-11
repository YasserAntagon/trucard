
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
var options = {discriminatorKey: 'KYCS'
};


var kycschema   = new Schema({
 createDate :{type : Date, default : Date.now},
 createUser :{type :String},
 modifyDate :{type : Date, default : Date.now},
 modifyUser :{type :String}
});

var KYCSchema = mongoose.model('KYCS', kycschema);

module.exports = KYCSchema; 
