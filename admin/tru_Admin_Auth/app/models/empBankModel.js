
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var sru = {type :String, required : true, unique : true};
var sr = {type :String, required : true};
var d = {type :Schema.Types.Decimal128, required : true};

var empbankschema   = new Schema({
   truID : sru,
   bankName :sr,
   IFSC : sr,
   accountNo : d
});

var EmpBankSchema = mongoose.model('empbank', empbankschema);
module.exports = EmpBankSchema;
