
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
const myDB       = require("../dbCon/truRemmitCon");

var sru = {type :String, required : true, unique : true};
var d = {type :Schema.Types.Decimal128, required : true};

var remmitwalletschema   = new Schema({
   truID : sru, opBal :d, Dr :d, Cr :d, clBal :d,
   balOnHold: { type: Schema.Types.Decimal128, default: 0 },
   onHoldDate: { type: Date, default: Date.now },
   onHoldType: { type: String }
});

// var walletSchema = mongoose.model('wallet', remmitwalletschema);
// module.exports = walletSchema;
var walletSchema;
try{
    // const myDB = mongoose.connection.useDb('truRemmit');
    walletSchema = myDB.model('wallet', remmitwalletschema);
}
catch(ex)
{
    console.log("ddd",ex)
}

module.exports = walletSchema;