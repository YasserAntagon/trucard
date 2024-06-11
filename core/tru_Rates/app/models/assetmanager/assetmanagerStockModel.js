var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
const DBCon       = require("../dbCon/truassetmanager");

var dm = {type :Schema.Types.Decimal128, default : "0.00"}

var stock = new Schema({G24K :dm,G22K :dm,G18K :dm,S99P :dm});

var G24K = new Schema({grossAmount :dm,assetmanagersCharges :dm,transactionFees :dm,netAmount :dm});

var G24K_Sale = new Schema({grossAmount :dm, assetmanagersCharges :dm, coinCharges : dm, transactionFees :dm,netAmount :dm, netAmountCoin :dm});


var assetmanagerstockschema   = new Schema({
 truID :{type :String, required : true},
 stock :[stock],
 holdStock :[stock],
 lStock : [stock],
 rStock : [stock],
 reedemStock : [stock],

 G24K :[G24K],
 G22K :[G24K],
 G18K :[G24K],
 S99P :[G24K],

 G24KSale :[G24K_Sale],
 G22KSale :[G24K_Sale],
 G18KSale :[G24K_Sale],
 S99PSale :[G24K_Sale],


 assetmanagerG24KRate :[G24K],
 assetmanagerG22KRate :[G24K],
 assetmanagerG18KRate :[G24K],
 assetmanagerS99PRate :[G24K],

 assetmanagerG24KRateSale :[G24K_Sale],
 assetmanagerG22KRateSale :[G24K_Sale],
 assetmanagerG18KRateSale :[G24K_Sale],
 assetmanagerS99PRateSale :[G24K_Sale]
});

var StockSchema = DBCon.model('stock', assetmanagerstockschema);

module.exports = StockSchema; 
