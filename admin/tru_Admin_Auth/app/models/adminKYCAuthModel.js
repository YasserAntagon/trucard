var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
var options = {discriminatorKey: 'KYCS'};

var KYCSchema = require('./adminKYCModel');

var su = {type :String, required : true, unique : true };
var sr = {type :String, required : true};

const Auth = KYCSchema.discriminator('Auth', new mongoose.Schema({
  email :su, mobile :su, CRNNo :su, password :sr,
  tPIN:{type :String},
  isPwdReset: {type :Boolean, required : true},
  isTPinReset: {type :Boolean, required : true}
    }),
);

module.exports = mongoose.model('Auth');
