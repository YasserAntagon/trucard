var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var d = { type: Schema.Types.Decimal128, default: "0.00" };

var stock = new Schema({
  G24K: d,  S99P: d 
});

var customerstockschema = new Schema({
  truID: { type: String, required: true },
  stock: [stock]
});

var StockSchema = mongoose.model('stock', customerstockschema);
module.exports = StockSchema;
