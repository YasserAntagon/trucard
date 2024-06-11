var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
const myDB       = require("../dbCon/truUserCon");
var options = {discriminatorKey: 'KYCS'};
var KYCSchema = require('./custKYCModel');

var sru = {type :String, required : true, unique : true };

const Auth = KYCSchema.discriminator('Auth', new mongoose.Schema({
    email :{type :String},
    mobile :{type :String}, CRNNo :sru,
    isPwdReset: {type :Boolean, required : true},
    mPINSet: {type :Boolean, required : true,default:false},
    appAccess: {type :Boolean, required : true, default:true},
    mPIN:{type :String, required : true,default:"0"},
    password :{type :String, required : true}
  }),
);

module.exports = mydb.model('Auth');

