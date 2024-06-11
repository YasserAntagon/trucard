
var mongoose     = require('mongoose'),
Schema       = mongoose.Schema,

sr = {type :String, required : true},
bool = {type :Boolean,required : true, default:false  },
deci = {type :Schema.Types.Decimal128, default:0}, 
date = {type : Date, default:Date.now}; 

var configschema   = new Schema({
truID : sr,         //Entity truid
fromTruID : {type :String},         //admin truid
createDate : date,   
revenuePercent : deci, //transaction amount limit
nodeCharges : deci,
partnerCharges : deci,
trasactionCharges : deci,
tdsPercentage : deci,
promotionQty : deci,
isChargesSet : bool
});

var configurationsSchema = mongoose.model('chargeslogs', configschema);
module.exports = configurationsSchema;
