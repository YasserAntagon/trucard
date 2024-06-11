const mongoose = require('mongoose');
const Schema = mongoose.Schema,

    sr = { type: String, required: true },
    sru = { type: String, required: true, unique: true },
    s = { type: String },
    d = { type: Schema.Types.Decimal128 },
    date = { type: Date }; //date values

var bankAccLogschema = new Schema({
    truID:sru,
    createDate:date,
    TranID:sr,
    Full_VA_Number:sr,
    Account_Number:sr,
    VA_Number:sr,
    Short_Name:sr,
    CIF:sr,
    VA_BENEFICIARY:sr,
    Status_Reason:sr
});

module.exports = mongoose.model('bankAccLog', bankAccLogschema);
