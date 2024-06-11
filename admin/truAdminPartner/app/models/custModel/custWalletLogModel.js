
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
const myDB       = require("../dbCon/truCustCon");

var sr = {type :String, required : true};
var dr = {type :Schema.Types.Decimal128, required : true};


var custwalletlogschema   = new Schema({
   truID : sr,
   Cr :dr,
   Dr :dr,
   merchantID :{type :String},
   merchant :{type :String},
   status :{type :String},
   particulars : sr,
   moneyAdded : {type : Boolean, default : false},
   invoice : {type :String, required : true, unique : true},
   createDate : {type : Date, default : Date.now},
   tType : {type :String, required : true,enum :["buy","buyCash","redeemCash","transfer","addMoney","walletToBank","purchase"]}
});

// var walletLogSchema = mongoose.model('walletlog', custwalletlogschema);
// module.exports = walletLogSchema;
var walletLogSchema;
try{
    // const myDB = mongoose.connection.useDb('truCust');
    walletLogSchema = myDB.model('walletlog', custwalletlogschema);
}
catch(ex)
{
    console.log("ddd",ex)
}

module.exports = walletLogSchema;  