var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var sr = {type :String, required : true};
var dt = {type : Date, default : Date.now};
var s = {type :String};

var custstocklogschema   = new Schema({
   truID :sr,
   fromTruID : sr,
   transactionID :sr,
   invoice :sr,
   bullionType :{type :String, enum : ["G24K","S99P"], default : null},
   UOM :{type :String, enum : ["GM","KG"], default : "GM"},
   QTY : {type :Schema.Types.Decimal128, default : "0.00"},
   status : {type :String, enum : ["inprocess","accepted","rejected"], default : "inprocess"},
   inprocessDate : dt,
   accRejDate : dt,
   type:sr,
   rejectInvoice :s,
   rejectTransactionID :s,
   isCollected:{type:Boolean, required : true,default : false},
   statusParticulars : {type :String, required : true, default : "your request is inProcess"}
});

var StockLogSchema = mongoose.model('stocklog', custstocklogschema);

module.exports = StockLogSchema;
