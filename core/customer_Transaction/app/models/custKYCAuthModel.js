var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
var options = {discriminatorKey: 'KYCS'};
var KYCSchema = require('./custKYCModel');

var sru = {type :String, required : true, unique : true };

const Auth = KYCSchema.discriminator('Auth', new mongoose.Schema({
    email :sru, mobile :sru, CRNNo :sru,
    isPwdReset: {type :Boolean, required : true},
    password :{type :String, required : true}
  }),
);

module.exports = mongoose.model('Auth');
