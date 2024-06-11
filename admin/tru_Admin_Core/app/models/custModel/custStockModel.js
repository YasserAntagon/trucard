var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const myDB = require("../dbCon/truCustCon");

var d = { type: Schema.Types.Decimal128, default: "0.00" };

var stock = new Schema({
    G24K: d, S99P: d
});
var stockData = new Schema({
    G24K: d, S99P: d,
    balOnHoldG24K: d, balOnHoldS99P: d,
    onHoldDateG24K: { type: Date }, onHoldDateS99P: { type: Date},
    onHoldTypeG24K: { type: String }, onHoldTypeS99P: { type: String },
});
var customerstockschema = new Schema({
    truID: { type: String, required: true },
    stock: stockData,
    rStock: stock
});
var StockSchema;
try {
    // const myDB = mongoose.connection.useDb('truCust');
    StockSchema = myDB.model('stock', customerstockschema);
}
catch (ex) {
    console.log("ddd", ex)
}

module.exports = StockSchema;  
