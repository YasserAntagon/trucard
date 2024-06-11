var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var d = { type: Schema.Types.Decimal128, default: "0.00" };

var stock = new Schema({
    G24K: d,  S99P: d
});
var stockData = new Schema({
    G24K: d,  S99P: d,
    balOnHoldG24K: d, balOnHoldS99P: d,
    onHoldDateG24K: { type: Date }, onHoldDateS99P: { type: Date},
    onHoldTypeG24K: { type: String }, onHoldTypeS99P: { type: String }
});

var customerstockschema = new Schema({
    truID: { type: String, required: true, unique: true },
    stock: stockData,
    lStock: stock,
    rLStock: stock,
    rStock: stock

});

var StockSchema = mongoose.model('stock', customerstockschema);
module.exports = StockSchema;
