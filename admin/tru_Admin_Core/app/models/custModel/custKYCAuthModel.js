var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
var options = {discriminatorKey: 'KYCS'};
var KYCSchema = require('./custKYCModel');
const myDB = require('../dbCon/truCustCon');

var sru = {type :String, required : true, unique : true };

const Auth = KYCSchema.discriminator('Auth', new mongoose.Schema({
    email :{type :String},
    mobile :{type :String}, CRNNo :sru,
    isPwdReset: {type :Boolean, required : true},
    mPINSet: {type :Boolean, required : true,default:false},
    mPIN:{type :String, required : true,default:"0"},
    password :{type :String, required : true}
  }),
);

module.exports = myDB.model('Auth');

// var auth;
// try{
//     const myDB = mongoose.connection.useDb('truCust');
//     auth = myDB.model('Auth', Auth);
// }
// catch(ex)
// {
//     console.log("ddd",ex)
// }

// module.exports = auth; 
