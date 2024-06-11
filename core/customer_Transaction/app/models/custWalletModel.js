
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var sru = {type :String, required : true, unique : true};
var d = {type :Schema.Types.Decimal128, required : true};

var custwalletschema   = new Schema({
   truID : sru, opBal :d, Dr :d, Cr :d, clBal :d
});

var walletSchema = mongoose.model('wallet', custwalletschema);
module.exports = walletSchema;
