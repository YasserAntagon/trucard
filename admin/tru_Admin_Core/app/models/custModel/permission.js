var mongoose = require('mongoose'),
    Schema = mongoose.Schema,

    sru = { type: String, unique: true },
    str = { type: String },
    sr = { type: String, required: true },
    // strenumreq = {type :String,required : true, enum :["disable","allow"]},
    strenum = { type: String, required: true, enum: ["hide", "allow", "comingsoon", "maintenance", "closed", "disabled"], default: "allow" }, //on web / mobility  //pg flags // on web / mobility 
    // bool = {type :Boolean,required : true },
    deci = { type: Schema.Types.Decimal128 }, 
    date = { type: Date },
    digistrm = { type: String, required: true, enum: ["hide", "allow", "disabled"], default: "allow" };
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
    maxAmtOfTxnInMonth: deci,
    txnFreeLimit: deci,
    minStockRequired: deci

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
    maxAmtOfTxnInMonth: deci,
    sellAfterBuyInterval: deci,
    sellToBankInterval: deci,
    minBuyToSell: deci
};
var homeobj = {
    message: strenum,
    startDate: date,
    endDate: date,
    status: strenum,
}
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
var paymentop = {
    pgID: str,
    pgType: { type: String, require: true },
    status: digistrm,
    limitMin: deci,
    limitMax: deci,
    reason: str,
};
var permissonschema = new Schema({
    truID: sru, //admin truID
    aTruID: sr, //admin truID
    KYCFlag: { type: String, require: true, enum: ["KYC", "nonKYC"] },             //consumer flag
    appliedOn: { type: String, require: true, enum: ["entity", "assetmanager", "consumer"] },
    createDate: { type: Date, default: Date.now },
    modifyDate: date,
    module: {
        buy: permobj,
        redeemCash: permobj,
        transfer: permobj,
        redeemToBank: permobj,
        redeemToWallet: permobj,
        walletToBank: permobj,
        walletAccess: permobj,
        payByWallet: permobj,
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
    limit: {
        buy: limitobj,
        redeemCash: redeemobj,
        transfer: limitobj,
        walletToBank: walletToBankObj,
        wallet: walletobj,
        redeemToBank: walletobj,
    },
});

var perm = truRateDB.model('permission', permissonschema);
module.exports = perm;
