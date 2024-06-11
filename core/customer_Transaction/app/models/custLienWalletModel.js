
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var sru = {type :String, required : true, unique : true};
var d = {type :Schema.Types.Decimal128, required : true};

var custlienwalletschema   = new Schema({
   truID : sru, opBal :d, Dr :d, Cr :d, clBal :d
});

var walletLienSchema = mongoose.model('lienwallet', custlienwalletschema);

module.exports = walletLienSchema; 
