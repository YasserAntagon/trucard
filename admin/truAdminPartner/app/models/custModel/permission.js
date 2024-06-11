var mongoose = require('mongoose'),
    Schema = mongoose.Schema,

    sru = { type: String, unique: true },
    str = { type: String },
    sr = { type: String, required: true },
    // strenumreq = {type :String,required : true, enum :["disable","allow"]},
    strenum = { type: String, required: true, enum: ["deny", "allow", "comingsoon", "maintenance", "closed", "disabled"], default: "allow" }, //on web / mobility 
    //pgstrenum = { type: String, required: true, enum: ["deny", "allow", "comingsoon", "maintenance",  "atom", "closed", "disabled"], default: "allow" }, //pg flags // on web / mobility 
    // bool = {type :Boolean,required : true },
    deci = { type: Schema.Types.Decimal128 }, 
    date = { type: Date },
    digistrm = { type: String, required: true, enum: ["deny", "allow", "disabled"], default: "allow" };
var truRateDB = require("../dbCon/truCustCon");

var limitobj = {
    //set txn limit for kyc/nonkyc users
    goldMax: deci,
    goldMin: deci,
    silverMax: deci,
    silverMin: deci,
    txnInterval: deci,
    noOfTxnInInterval: deci,
    maxAmtOfTxnInHour: deci,
    maxAmtOfTxnInDay: deci,
    maxAmtOfTxnInMonth: deci

};

var redeemobj = {
    //set txn limit for kyc/nonkyc users
    goldMax: deci,
    goldMin: deci,
    silverMax: deci,
    silverMin: deci,
    redeemInBankMin: deci,
    redeemInBankMax: deci,
    txnInterval: deci,
    noOfTxnInInterval: deci,
    maxAmtOfTxnInHour: deci,
    maxAmtOfTxnInDay: deci,
    maxAmtOfTxnInMonth: deci
};
var walletobj = {
    //addmoney to wallet limit
    max: deci,
    min: deci,
    walletLimit: deci,
    txnInterval: deci,
    noOfTxnInInterval: deci,
    maxAmtOfTxnInHour: deci,
    maxAmtOfTxnInDay: deci,
    maxAmtOfTxnInMonth: deci
};
var walletToBankObj = {
    wtbmin: deci,
    wtbmax: deci,
    txnInterval: deci,
    noOfTxnInInterval: deci,
    maxAmtOfTxnInHour: deci,
    maxAmtOfTxnInDay: deci,
    maxAmtOfTxnInMonth: deci

};
var permobj = {
    status: str,
    message: str
};

var slab = {
    slabID: str,
    PGType: { type: String, require: true },
    slabAmt: deci,
    NEFTcharges: deci,
    IMPScharges: deci,
    RTGScharges: deci,
    UPICharges: deci,
    serviceTax: deci,
    condition: { type: String, require: true, enum: ["gt", "lt"] }
};
var permissonschema = new Schema({
    truID: sru, //admin truID
    aTruID: sr, //admin truID
    KYCFlag: { type: String, require: true, enum: ["KYC", "nonKYC"] },             //consumer flag
    appliedOn: { type: String, require: true, enum: ["entity", "assetmanager", "consumer"] },
    createDate: date,
    modifyDate: date,
    module: {
        buy: permobj,
        redeemCash: permobj,
        
        transfer: permobj,
      
        
        
        
        
        redeemToBank: permobj,
        redeemToWallet: permobj,
        walletToBank: permobj,
        walletAccess: permobj,
        
        login: permobj,
        linkbank: permobj,
        
        paymentModeAccess: permobj
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
    // digitalPayment:[paymentop],
    bankSlab: [slab],
    buy: limitobj,
    redeemCash: redeemobj,
    transfer: limitobj,
    walletToBank: walletToBankObj,
    home: homeobj,
    wallet: walletobj
});

var perm = truRateDB.model('permission', permissonschema);
module.exports = perm;
