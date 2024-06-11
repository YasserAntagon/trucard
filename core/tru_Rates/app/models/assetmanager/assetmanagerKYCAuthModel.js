var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
const DBCon       = require("../dbCon/truassetmanager");
var options = {discriminatorKey: 'KYCS'};

var KYCSchema = require('./assetmanagerKYCModel');

var su = {type :String, required : true, unique : true };
var sr = {type :String, required : true};

const Auth = KYCSchema.discriminator('Auth', new mongoose.Schema({
  email :su, mobile :su, CRNNo :su, password :sr
    }),
);

module.exports = DBCon.model('Auth');
