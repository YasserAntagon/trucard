
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const myDB = require("../dbCon/truCustCon");


var custwalletschema = new Schema({
    truID: { type: String, required: true, unique: true },
    opBal: { type: Schema.Types.Decimal128, required: true },
    Dr: { type: Schema.Types.Decimal128, required: true },
    Cr: { type: Schema.Types.Decimal128, required: true },
    clBal: { type: Schema.Types.Decimal128, required: true },
    balOnHold: { type: Schema.Types.Decimal128, default: 0 },
    onHoldDate: { type: Date, default: Date.now },
    onHoldType: { type: String }
});

// var walletSchema = mongoose.model('wallet', custwalletschema);

// module.exports = walletSchema;
var walletSchema;
try {
    // const myDB = mongoose.connection.useDb('truCust');
    walletSchema = myDB.model('wallet', custwalletschema);
}
catch (ex) {
    console.log("ddd", ex)
}

module.exports = walletSchema;  
