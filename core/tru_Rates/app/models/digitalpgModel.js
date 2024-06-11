var mongoose = require('mongoose'),
    Schema = mongoose.Schema,

    sru = { type: String, unique: true },
    str = { type: String },
    bool = { type: Boolean },
    sr = { type: String, required: true },
    deci = { type: Schema.Types.Decimal128 }, 
    date = { type: Date },
    digistrm = { type: String, required: true, enum: ["deny", "allow", "disabled"], default: "allow" };

var digitalpay = new Schema({
    isDefault: bool,
    pgID: sr,
    PGType: sr,
    status: digistrm,
    min: deci,
    max: deci,
    desc: str
});
var digitalPaymentconfigschema = new Schema({
    appliedOn: { type: String, require: true, enum: ["entity", "assetmanager", "consumer"] },
    createDate: date,
    modifyDate: date,
    payIn: [digitalpay],
    impsPayOut: [digitalpay],
    neftPayOut: [digitalpay],

});

var digitalPaymentconfig = mongoose.model('digitalPayment', digitalPaymentconfigschema);
module.exports = digitalPaymentconfig;