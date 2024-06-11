
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,

sru = {type :String, required : true, unique : true},
str = {type :String},
// strenumreq = {type :String,required : true, enum :["disable","allow"]},
strenum = {type :String, enum :["disable","allow","comingsoon","maintenance"]},
pgstrenum = {type :String, enum :["disable","allow","comingsoon","maintenance","atom"]}, //pg flags // on web / mobility 
bool = {type :Boolean,required : true, default:false },
deci = {type :Schema.Types.Decimal128, default:0}, 
date = {type : Date}; 
const myDB       = require("../dbCon/truRemmitCon");

var configschemaRW   = new Schema({
truID : sru,         //Entity truid
createDate :{type : Date, default:Date.now},   
modifyDate :{type : Date, default:Date.now},   
revenueCharges : deci,
nodeCharges : deci,
partnerCharges : deci,
trasactionCharges : deci,
promotionQty : deci,
isChargesSet : bool
});

// var configurationsSchema = mongoose.model('charges', configschema);
// module.exports = configurationsSchema;


var configschemaSW;
try{
    // const myDB = mongoose.connection.useDb('truRemmit');
    configschemaSW = myDB.model('charges', configschemaRW);
}
catch(ex)
{
    console.log("ddd",ex)
}

module.exports = configschemaSW; 
