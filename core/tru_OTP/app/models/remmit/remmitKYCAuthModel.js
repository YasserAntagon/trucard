var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
var options = {discriminatorKey: 'KYCS'};
var KYCSchema = require('./remmitKYCModel');
const myDB = require("./truRemmitCon");

var sru = {type :String, required : true, unique : true };

const Auth = KYCSchema.discriminator('Auth', new mongoose.Schema({
  email :sru, CRNNo :sru, mobile :sru,
  isPwdReset: {type :Boolean, required : true},
  password :{type :String, required : true},
  tPIN:{type :String},
  isTPinReset: {type :Boolean, required : true},
  appAccess: {type :Boolean, required : true, default:false},
  mPINSet: {type :Boolean, required : true,default:false},
  mPIN:{type :String, required : true,default:"0"}
  })
);

module.exports = myDB.model('Auth');
