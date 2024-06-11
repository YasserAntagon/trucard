var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
var options = {discriminatorKey: 'KYCS'};
var myDB = require("../dbCon/truassetmanagerCon");

var KYCSchema = require('./assetmanagerKYCModel');

var su = {type :String, required : true, unique : true };
var sr = {type :String, required : true};

const Auth = KYCSchema.discriminator('Auth', new mongoose.Schema({
  email :su, mobile :su, CRNNo :su, password :sr
    }),
);

 module.exports = myDB.model('Auth');

// var authSchema;
// try{
//     //const myDB = mongoose.connection.useDb('truDealer');
//     authSchema = myDB.model('Auth', Auth);
// }
// catch(ex)
// {
//     console.log("ddd",ex)
// }

// module.exports = authSchema; 

