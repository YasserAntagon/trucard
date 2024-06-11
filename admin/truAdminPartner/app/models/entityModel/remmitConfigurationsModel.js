
var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  sru = { type: String, required: true, unique: true },
  str = { type: String },
  // strenumreq = {type :String,required : true, enum :["disable","allow"]},
  strenum = { type: String, enum: ["disable", "allow", "comingsoon", "maintenance"] },
  pgstrenum = { type: String, enum: ["disable", "allow", "comingsoon", "maintenance", "atom"] }, //pg flags // on web / mobility 
  bool = { type: Boolean, required: true, default: false },
  deci = { type: Schema.Types.Decimal128, default: 0 }, 
  date = { type: Date }; 
  const myDB       = require("../dbCon/truRemmitCon");
var threshold = new Schema({
  limit: deci,
  type:str,
  isemailsent: bool,
  issmssent: bool,
  isnotify: bool
})
var configschema = new Schema({
  truID: sru,         //Entity truid
  createDate: { type: Date, default: Date.now },
  wallet: {
    walletAccess: strenum,
    paymentModeAccess: strenum,
    paymentGateway: pgstrenum,
    redeemToWallet: strenum,
    modifyDate: date
  },
  consumer: {
    buy: strenum,
    redeemCash: strenum,
    
    transfer: strenum,
    
    modifyDate: date
  },
  self: {
    buy: strenum,
    redeemCash: strenum,
    
    transfer: strenum,
    
    modifyDate: date
  },
  global: {
    MID: str,
    
    category: str,
    allConsumerAccess: bool,
    modifyDate: date
  },
  TXN: {
    revenuePercent: deci, //transaction amount limit
    txnAmountLimit: deci, //transaction amount limit
    remnantAmount: deci,   //Transaction remaining amount
    checkLimit: bool,
    modifyDate: date
  },
});

// var configurationsSchema = mongoose.model('configurations', configschema);
// module.exports = configurationsSchema;
var configurationsSchema;
try{
    // const myDB = mongoose.connection.useDb('truRemmit');
    configurationsSchema = myDB.model('configurations', configschema);
}
catch(ex)
{
    console.log("ddd",ex)
}

module.exports = configurationsSchema; 
