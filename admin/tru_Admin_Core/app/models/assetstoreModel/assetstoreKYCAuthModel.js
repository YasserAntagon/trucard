var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
var options = {discriminatorKey: 'KYCS'};
var KYCSchema = require('./assetstoreKYCModel');
var myDB = require("../dbCon/truassetstoreCon");

var sru = {type :String, required : true, unique : true };

const Auth = KYCSchema.discriminator('Auth', new mongoose.Schema({
  email :sru, CRNNo :sru,
  isPwdReset: {type :Boolean, required : true}, 
  password :{type :String, required : true}
  }),
);

module.exports = myDB.model('Auth');

// var authSchema;
// try{
//     const myDB = mongoose.connection.useDb('truassetstore');
//     authSchema = myDB.model('Auth', Auth);
// }
// catch(ex)
// {
//     console.log("ddd",ex)
// }

// module.exports = authSchema; 
