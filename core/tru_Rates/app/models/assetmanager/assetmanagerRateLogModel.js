var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
const DBCon       = require("../dbCon/truassetmanager");
var dm = {type :Schema.Types.Decimal128, default : "0.00"}
var rates = new Schema({
  dateChanged : {type : Date, default : Date.now},
  rate :{type :Schema.Types.Decimal128},
  grossAmount :dm,
  assetmanagersCharges :dm,
  transactionFees :dm,
  assetmanagersChargesPer :dm,
  transactionFeesPer :dm,
  assetstoreCharge :dm,
  assetstoreChargePer :dm,
  netAmount :dm
});


var salerates = new Schema({
  dateChanged : {type : Date, default : Date.now},
  rate :{type :Schema.Types.Decimal128},
  grossAmount :dm,
  assetmanagersCharges :dm,
  transactionFees :dm,
  assetmanagersChargesPer :dm,
  transactionFeesPer :dm,
  assetstoreCharge :dm,
  assetstoreChargePer :dm,
  netAmount :dm,
  assetmanagerCoinCharges :dm,
  netAmountCoin :dm
});

var assetmanagerratelogschema   = new Schema({
 truID :{type :String, required : true},

 G24K_log :[rates],
 G22K_log :[rates],
 G18K_log :[rates],
 S99P_log :[rates],

 assetmanager_G24K_log :[rates],
 assetmanager_G22K_log :[rates],
 assetmanager_G18K_log :[rates],
 assetmanager_S99P_log :[rates],

 G24KSale_log :[salerates],
 G22KSale_log :[salerates],
 G18KSale_log :[salerates],
 S99PSale_log :[salerates],

 assetmanager_G24KSale_log :[salerates],
 assetmanager_G22KSale_log :[salerates],
 assetmanager_G18KSale_log :[salerates],
 assetmanager_S99PSale_log :[salerates]
});

var RateLogSchema = DBCon.model('ratelogs', assetmanagerratelogschema);
module.exports = RateLogSchema;
