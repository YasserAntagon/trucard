var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var sr = {type :String, required : true};
var s = {type :String};
var d = {type :Schema.Types.Decimal128, required : true};

var atomschema   = new Schema({
  atomID : s,
  invoice : sr,

  amount : d,
  invoiceAmount : d,
  diffAmount : d,

  surcharge : d,
  prodid : s,
  atomDate :s,
  createDate :{type : Date, default : Date.now},
  bankTxnID : s,
  status : {type : String, required : true},
  customerTruID : sr, 
  bankName : s,
  MOP : s,
  cardNumber : s, failureReason : s,
  userName : s, email : sr, mobile : sr, address : s,
  tType : {type :String, required : true}
 });

var AtomSchema = mongoose.model('atomlog', atomschema);

module.exports = AtomSchema;
