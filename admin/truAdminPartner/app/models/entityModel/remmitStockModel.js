var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
const myDB       = require("../dbCon/truRemmitCon");

var d = {type :Schema.Types.Decimal128, default : "0.00"}

var stock = new Schema({G24K :d, S99P :d});
var stockData = new Schema({
    G24K: d,  S99P: d,
    balOnHoldG24K: d, balOnHoldS99P: d,
    onHoldDateG24K: { type: Date }, onHoldDateS99P: { type: Date },
    onHoldTypeG24K: { type: String }, onHoldTypeS99P: { type: String }
});
var roi = new Schema({expRate :d,       
                      joiningFee :d,    
                      ROI :d,           
                      otherCharges :d,  
                      penalty:d,        
                      minLoanAmount:d,    
                      maxLoanAmount:d  
                    });

var remmitstockschema   = new Schema({
 truID :{type :String, required : true},
 lendingRate:roi,
 stock :stockData,
 lStock : stock
});

// var StockSchema = mongoose.model('stock', remmitstockschema);

// module.exports = StockSchema;
var StockSchema;
try{
    // const myDB = mongoose.connection.useDb('truRemmit');
    StockSchema = myDB.model('stock', remmitstockschema);
}
catch(ex)
{
    console.log("ddd",ex)
}

module.exports = StockSchema;