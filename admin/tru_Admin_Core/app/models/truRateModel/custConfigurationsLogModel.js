
var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  sru = { type: String, required: true },
  str = { type: String },
  strenum = { type: String, enum: ["deny", "allow", "comingsoon", "maintenance", "closed", "disabled"] }, //on web / mobility 
  pgstrenum = { type: String, enum: ["disabled", "allow", "comingsoon", "maintenance", "atom"] }, //pg flags // on web / mobility  
  deci = { type: Schema.Types.Decimal128 }, 
  date = { type: Date }, 
  digistrm = { type: String, enum: ["deny", "allow", "disabled"] };
  var myDB = require("../dbCon/truRateCon");
var limitobj = new Schema({
  goldMax: deci,
  goldMin: deci,
  silverMax: deci,
  silverMin: deci
});
var addmoneyobj = new Schema({
  max: deci,
  min: deci
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
  truID: str,         //admin truid
  KYCFlag: str,         //consumer flag
  modifyDate: date,
  appliedOn: { type: String, require: true, enum: ["entity", "assetmanager", "consumer"] },
  module: {
    buy: strenum,
    redeemCash: strenum,
    
    transfer: strenum,
    
    
    
    
    
  },
  digitalPayment: {
    SlabAmt: deci,
    NEFTcharges: deci,
    IMPScharges: deci,
    IMPScharges1: deci,
    RTGScharges: deci,
    serviceTax: deci,
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
    neftLimitMax: deci
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
  redeemToWallet: strenum
});

// var configurationsSchema = mongoose.model('configurationlogs', configschema);
// module.exports = configurationsSchema;

var configurationsSchema;
try{
    // const myDB = mongoose.connection.useDb('truCommon');
    configurationsSchema = myDB.model('configurationlogs', configschema);
}
catch(ex)
{
    console.log("ddd",ex)
}

module.exports = configurationsSchema;
