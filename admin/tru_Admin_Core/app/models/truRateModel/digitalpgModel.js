var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    myDB = require("../dbCon/truRateCon"),

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
var slab = new Schema({  
    slabID : str, 
    PGType: { type: String, require: true },
    slabAmt: deci,
    NEFTcharges: deci,
    IMPScharges: deci,
    RTGScharges: deci,
    UPICharges: deci,
    serviceTax: deci,
    condition: { type: String, require: true, enum: ["gt", "lt"]  }
  });
var digitalPaymentconfigschema = new Schema({
    appliedOn: { type: String, require: true, enum: ["entity", "assetmanager", "consumer"] },
    KYCFlag: { type: String, require: true, enum: ["KYC", "nonKYC"] },
    createDate: date,
    modifyDate: date,
    payIn: [digitalpay],
    impsPayOut: [digitalpay],
    neftPayOut: [digitalpay],

});

var digitalPaymentconfig;
try{
    // const myDB = mongoose.connection.useDb('truCommon');
    digitalPaymentconfig = myDB.model('digitalPayment', digitalPaymentconfigschema);
}
catch(ex)
{
    console.log("ddd",ex)
}
module.exports = digitalPaymentconfig;