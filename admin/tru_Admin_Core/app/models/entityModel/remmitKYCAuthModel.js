var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
const myDB       = require("../dbCon/truRemmitCon");
var options = {discriminatorKey: 'KYCS'};
var KYCSchema = require('./remmitKYCModel');


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

// var auth;
// try{
//     // const myDB = mongoose.connection.useDb('truRemmit');
//     auth = myDB.model('Auth', Auth);
// }
// catch(ex)
// {
//     console.log("ddd",ex)
// }

// module.exports = auth;
