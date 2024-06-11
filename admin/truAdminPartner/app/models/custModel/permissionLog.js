var mongoose = require('mongoose'),
    Schema = mongoose.Schema,

    sru = { type: String, unique: true },
    str = { type: String },
    sr = { type: String, required: true },
    // strenumreq = {type :String,required : true, enum :["disable","allow"]},
    strenum = { type: String, enum: ["deny", "allow", "comingsoon", "maintenance", "closed", "disabled", "hide"] }, //on web / mobility 
    //pgstrenum = { type: String, required: true, enum: ["deny", "allow", "comingsoon", "maintenance",  "atom", "closed", "disabled"], default: "allow" }, //pg flags // on web / mobility 
    // bool = {type :Boolean,required : true },
    deci = { type: Schema.Types.Decimal128 }, 
    date = { type: Date },
    digistrm = { type: String, enum: ["deny", "allow", "disabled"] };
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
var storelimitobj = {
    //set txn limit for kyc/nonkyc users
    goldMax: deci,
    goldMin: deci,
    silverMax: deci,
    silverMin: deci,
    maxCredit: deci,
    minCredit: deci

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
var permisssionlogschema = new Schema({
    permissionID: sr, //admin truID
    truID: sr, //admin truID
    aTruID: sr, //customer truID
    KYCFlag: { type: String, require: true, enum: ["KYC", "nonKYC"] },      //customer flag
    appliedOn: { type: String, require: true, enum: ["entity", "assetmanager", "consumer"] },
    createDate: date,
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
var permlog = truRateDB.model('permissionlog', permisssionlogschema);
module.exports = permlog;