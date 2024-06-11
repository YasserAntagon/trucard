var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var s = {type :String, required : true};
var d = {type : Date, required : true};
var myDB = require("../dbCon/truRateCon");

var liveRateLogschema   = new Schema({
   date1 :d, //done in fst call
   g24k_rate : s,//done in fst call
   date2 :d,//done in fst call
   s99_rate :s,//done in fst call
   g24k_india : s, g24k_Nepal :s, g24k_UAE : s, g24k_bangladesh :s,
   entryTimeStamp : {type : Date, default : Date.now},//done in fst call
   id :s,
   truID:s,
   countryCode:s,
   currencyRate : s,
   importDuty : s,
   discount : s,
   tax :s
});

// var LiveRateLogSchema = mongoose.model('liveRatelog', liveRateLogschema);

// module.exports = LiveRateLogSchema;
var LiveRateLogSchema;
try{
    // const myDB = mongoose.connection.useDb('truCommon');
    LiveRateLogSchema = myDB.model('liveRatelog', liveRateLogschema);
}
catch(ex)
{
    console.log("ddd",ex)
}

module.exports = LiveRateLogSchema;
