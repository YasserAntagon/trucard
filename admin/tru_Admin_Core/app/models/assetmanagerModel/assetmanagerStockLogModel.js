var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
var myDB = require("../dbCon/truassetmanagerCon");

var sr = {type :String, required : true};
var d = {type : Date, default : Date.now};
var dc = {type :Schema.Types.Decimal128,required : true, default : "0.00"};

var denominations = new Schema({ id : dc,size :dc, qty : dc,  total : dc});

var assetmanagerstocklogschema   = new Schema({
   truID :sr, 
   assetstoreTruID : {type :String},
   parentTruID : sr,
   transactionID :sr,
   bullionType :{type :String, enum : ["G24K","S99P"], default : null},
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
   authCode:sr,
   updatedBy :sr, 
});

// var StockLogSchema = mongoose.model('stocklog', assetmanagerstocklogschema);
// module.exports = StockLogSchema;


var StockLogSchema;
try{
    //const myDB = mongoose.connection.useDb('truassetmanager');
    StockLogSchema = myDB.model('stocklog', assetmanagerstocklogschema);
}
catch(ex)
{
    console.log("ddd",ex)
}

module.exports = StockLogSchema; 


