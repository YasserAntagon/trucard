
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;


var customerreferralstocklogschema   = new Schema({
 referenceTruID :{type :String, required : true},
 truID :{type :String, required : true},
 stockAmt :{type :String, required : true},
 bullionType :{type :String, required : true},
 earnFlag :{type :String, required : true,enum:["both","single"],default:"single"},
 createDate :{type : Date,required : true}
});

var referralStockSchema = mongoose.model('referralStockLog', customerreferralstocklogschema);

module.exports = referralStockSchema; 
