
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;


var custwalletschema   = new Schema({

   truID : {type :String, required : true, unique : true},
   opBal :{type :Schema.Types.Decimal128, required : true},                
   Dr :{type :Schema.Types.Decimal128, required : true},                   
   Cr :{type :Schema.Types.Decimal128, required : true},                   
   clBal :{type :Schema.Types.Decimal128, required : true},              
   balOnHold: { type: Schema.Types.Decimal128, default: 0 },
   onHoldDate: { type: Date, default: Date.now },
   onHoldType: { type: String }            
});

var walletSchema = mongoose.model('wallet', custwalletschema);

module.exports = walletSchema;
