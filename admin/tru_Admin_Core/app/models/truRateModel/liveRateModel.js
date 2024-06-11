var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
var myDB = require("../dbCon/truRateCon");

var s = {type : String, required : true};
var d = {type : Date, required : true};

var liverateschema   = new Schema({
 id :s, date1 :d, g24k_rate : s, date2 :d, s99_rate :s,  g24k_india : s, g24k_Nepal :s, g24k_UAE : s,
 g24k_bangladesh :s,
 countryCode:s,
 currencyRate : s,
 importDuty : s,
 discount : s,
 tax :s
});

// var LiveRateSchema = mongoose.model('liveRate', liverateschema);

// module.exports = LiveRateSchema;

var LiveRateSchema;
try{
    // const myDB = mongoose.connection.useDb('truCommon');
    LiveRateSchema = myDB.model('liveRate', liverateschema);
}
catch(ex)
{
    console.log("ddd",ex)
}

module.exports = LiveRateSchema;
