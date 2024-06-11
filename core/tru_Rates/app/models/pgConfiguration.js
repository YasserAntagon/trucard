var mongoose = require('mongoose'),
    Schema = mongoose.Schema,

    sru = { type: String, unique: true },
    str = { type: String },
    sr = { type: String, required: true },
    // strenumreq = {type :String,required : true, enum :["disable","allow"]},
    strenum = { type: String, required: true, enum: ["deny", "allow", "comingsoon", "maintenance", "closed", "disabled"], default: "allow" }, //on web / mobility 
    pgstrenum = { type: String, required: true, enum: ["deny", "allow", "comingsoon", "maintenance", "atom", "closed", "disabled"], default: "allow" }, //pg flags // on web / mobility 
    // bool = {type :Boolean,required : true },
    deci = { type: Schema.Types.Decimal128 }, 
    date = { type: Date },
    digistrm = { type: String, required: true, enum: ["deny", "allow", "disabled"], default: "allow" };

var limitobj = new Schema({
    //set txn limit for kyc/nonkyc users
    goldMax: deci,
    goldMin: deci,
    silverMax: deci,
    silverMin: deci
});
var addmoneyobj = new Schema({
    //addmoney to wallet limit
    max: deci,
    min: deci,
    wtbmin: deci,
    wtbmax: deci
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
var configschema = new Schema({
    KYCFlag: str,         //consumer flag
    appliedOn: { type: String, require: true, enum: ["entity", "assetmanager", "consumer"] },
    createDate: date,
    modifyDate: date,
    module: {
        buy: strenum,
        redeemCash: strenum,
        
        transfer: strenum, 
        redeemToBank: strenum
    },
    digitalPayment: {
        
        atom: strenum,
        
        isIMPS: digistrm,
        isNEFT: digistrm,
       
        
        pgReason: str,
        isIMPSReason: str,
        isNEFTReason: str,
        isUPIReason: str,
        atomLimitMin: deci,
        atomLimitMax: deci,
        
        
        impsLimitMin: deci,
        impsLimitMax: deci,
        neftLimitMin: deci,
        neftLimitMax: deci,
    },
    bankSlab: [slab],
    buy: limitobj,
    redeemCash: limitobj,
    
    transfer: limitobj,
    
    addMoney: addmoneyobj,
    txnAmountLimit: deci,
    walletLimit: deci,
    walletAccess: strenum,
    paymentModeAccess: pgstrenum,
    redeemToWallet: strenum,
    walletToBank: strenum
});

var pgConfiguration = mongoose.model('pgconfigurations', configschema);
module.exports = pgConfiguration;