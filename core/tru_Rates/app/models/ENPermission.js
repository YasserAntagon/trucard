var mongoose = require('mongoose'),
    Schema = mongoose.Schema,

    sru = { type: String, unique: true },
    str = { type: String },
    sr = { type: String, required: true },
    // strenumreq = {type :String,required : true, enum :["disable","allow"]},
    strenum = { type: String, required: true, enum: ["deny", "allow", "comingsoon", "maintenance", "closed", "disable"], default: "allow" }, //on web / mobility 
    //pgstrenum = { type: String, required: true, enum: ["deny", "allow", "comingsoon", "maintenance",  "atom", "closed", "disabled"], default: "allow" }, //pg flags // on web / mobility 
    // bool = {type :Boolean,required : true },
    deci = { type: Schema.Types.Decimal128 }, 
    date = { type: Date },
    digistrm = { type: String, required: true, enum: ["deny", "allow", "disable"], default: "allow" };
// var truRateDB = require("../dbCon/truRemmitCon");

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
    bulContainLimit: deci,
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
    truID: sr, //admin truID
    aTruID: sr, //admin truID
    KYCFlag: { type: String, require: true, enum: ["KYC", "nonKYC"] },         //consumer flag
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
    moduleSelf: {
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
    limit: {
        buy: limitobj,
        redeemCash: redeemobj,
        
        transfer: limitobj,
        walletToBank: walletToBankObj,
 
        wallet: walletobj,
        redeemToBank: walletobj,
       
    },
    limitSelf: {
        buy: limitobj,
        redeemCash: redeemobj,
        
        transfer: limitobj,
        walletToBank: walletToBankObj,
 
        wallet: walletobj,
        redeemToBank: walletobj,
       
    },
    
    digitalPayment: {
        
        atom: strenum,
        
        bank: strenum,
        isUPICollect: strenum,
        isUPIPayout: strenum,
        isIMPS: digistrm,
        isNEFT: digistrm,

        atomReason: str,
        bankReason: str,
        isIMPSReason: str,
        isNEFTReason: str,
        UPIcollectReason: str,
        UPIpayoutReason: str,

        atomLimitMin: deci,
        atomLimitMax: deci,
        
        
        
       
        impsLimitMin: deci,
        impsLimitMax: deci,
        neftLimitMin: deci,
        neftLimitMax: deci,
    },
    // digitalPayment:[paymentop],
    bankSlab: [slab],
});

var perm = mongoose.connection.useDb('truRemmit').model('permission', permissonschema);
module.exports = perm;
