var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var myDB = require("../dbCon/truassetmanagerCon");

var dm = { type: Schema.Types.Decimal128, default: "0.00" }

var stock = new Schema({ G24K: dm, S99P: dm });

var G24K = new Schema({ grossAmount: dm, assetmanagersCharges: dm, transactionFees: dm, netAmount: dm });

var G24K_Sale = new Schema({ grossAmount: dm, assetmanagersCharges: dm, coinCharges: dm, transactionFees: dm, netAmount: dm, netAmountCoin: dm });

var assetmanagerstockschema = new Schema({
    truID: { type: String, required: true },
    stock: stock,
    rStock: stock,
    reedemStock: stock,

    G24K: G24K,
    S99P: G24K,

    G24KSale: G24K_Sale,
    S99PSale: G24K_Sale,
});

// var StockSchema = mongoose.model('stock', assetmanagerstockschema);

// module.exports = StockSchema;


var StockSchema;
try {
    //const myDB = mongoose.connection.useDb('truassetmanager');
    StockSchema = myDB.model('stock', assetmanagerstockschema);
}
catch (ex) {
    console.log("ddd", ex)
}

module.exports = StockSchema;

