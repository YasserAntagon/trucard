var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
const DBCon       = require("../dbCon/truassetmanager");
var sr = {type :String, required : true};
var d = {type : Date, default : Date.now};
var dc = {type :Schema.Types.Decimal128,required : true, default : "0.00"};

var denominations = new Schema({ id : dc,size :dc, qty : dc,  total : dc});

var assetmanagerstocklogschema   = new Schema({
   truID :sr, 
   assetstoreTruID : sr,
   parentTruID : sr,
   transactionID :sr,
   bullionType :{type :String, enum : ["G24K","G22K","G18K","S99P"], default : null},
   UOM :{type :String, enum : ["GM","KG"], default : "GM"},
   QTY : dc,
   status : {type :String, enum : ["inprocess","accepted","rejected"], default : "inprocess"},
   assetmanagerStatus : {type :String, enum : ["inprocess","accepted","rejected"], default : "inprocess"},
   isRecieved : {type : Boolean,required : true, default : false},
   inprocessDate : d,
   accRejDate : d,
   assetmanagerAccRejDate : d,
   statusParticulars : {type :String, required : true, default : "your request is inProcess"},
   assetmanagerStatusParticulars : {type :String, required : true, default : "your request is inProcess"},
   barParticulars:[denominations],
   coinParticulars:[denominations],
   authCode:sr
});

var StockLogSchema = DBCon.model('stocklog', assetmanagerstocklogschema);
module.exports = StockLogSchema;
