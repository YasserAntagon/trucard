
var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  sru = { type: String, required: true },
  str = { type: String },
  bool = { type: Boolean },
  strenum = { type: String, enum: ["deny", "allow", "comingsoon", "maintenance", "closed", "disabled"] }, //on web / mobility 
  pgstrenum = { type: String, enum: ["disabled", "allow", "comingsoon", "maintenance", "atom"] }, //pg flags // on web / mobility  
  deci = { type: Schema.Types.Decimal128 }, 
  date = { type: Date }, 
  digistrm = { type: String, enum: ["deny", "allow", "disabled"] };
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
  slabID: str,
  PGType: { type: String, require: true },
  slabAmt: deci,
  NEFTcharges: deci,
  IMPScharges: deci,
  RTGScharges: deci,
  UPICharges: deci,
  serviceTax: deci,
  condition: { type: String, require: true, enum: ["gt", "lt"] }
});
var digitalpay = new Schema({
  isDefault: bool,
  pgID: sru,
  PGType: sru,
  status: digistrm,
  min: deci,
  max: deci,
  desc: str
})
var configschema = new Schema({
  truID: str,         //admin truid
  KYCFlag: str,         //consumer flag
  modifyDate: date,
  appliedOn: { type: String, require: true, enum: ["entity", "assetmanager", "consumer"] },
  module: {
    buy: strenum,
    redeemCash: strenum,
    transfer: strenum
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
    neftLimitMax: deci
  },
  payIn: [digitalpay],
  impsPayOut: [digitalpay],
  neftPayOut: [digitalpay],
  upiPayOut: [digitalpay],
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

var configurationsSchema = mongoose.model('configurationlogs', configschema);
module.exports = configurationsSchema;
