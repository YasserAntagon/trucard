
var mongoose = require('mongoose'),
  Schema = mongoose.Schema,

  sr = { type: String, required: true },
  // sru = {type :String, required : true, unique : true},
  // str = {type :String},
  // strenumreq = {type :String,required : true, enum :["disable","allow"]},
  // strenum = {type :String, enum :["disable","allow"]},
  bool = { type: Boolean, required: true },
  deci = { type: Schema.Types.Decimal128, default: 0 }, 
  date = { type: Date, default: Date.now }; 
  const myDB       = require("../dbCon/truRemmitCon");

var configschema = new Schema({
  truID: sr,         //Entity truid
  fromTruID: sr,         //admin truid
  createDate: date,
  wallet: { type: Object },
  consumer: { type: Object },
  self: { type: Object },
  global: { type: Object },
  TXN: { type: Object }
});

// var configurationsSchema = mongoose.model('configurationlogs', configschema);
// module.exports = configurationsSchema;
var configurationslogSchema;
try{
    // const myDB = mongoose.connection.useDb('truRemmit');
    configurationslogSchema = myDB.model('configurationlogs', configschema);
}
catch(ex)
{
    console.log("ddd",ex)
}

module.exports = configurationslogSchema; 
