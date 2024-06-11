var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
const myDB       = require("../dbCon/truCustCon");

var sr = {type :String, required : true};
var s = {type :String};
var d = {type :Schema.Types.Decimal128, required : true};

var atomschema   = new Schema({
  atomID : sr,
  invoice : sr,

  amount : d,
  invoiceAmount : d,
  diffAmount : d,

  surcharge : d,
  prodid : s,
  atomDate :sr,
  createDate :{type : Date, default : Date.now},
  bankTxnID : sr,
  status : {type : String, required : true},
  customerTruID : sr, bankName : sr,
  MOP : sr,
  cardNumber : s, failureReason : s,
  userName : sr, email : sr, mobile : sr, address : sr,
  tType : {type :String, required : true}
 });

// var AtomSchema = mongoose.model('atomlog', atomschema);


var AtomSchema;
try{
    // const myDB = mongoose.connection.useDb('truCust');
    AtomSchema = myDB.model('atomlog', atomschema);
}
catch(ex)
{
    console.log("ddd",ex)
}

module.exports = AtomSchema; 