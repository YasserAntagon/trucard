var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
const DBCon       = require("../dbCon/truassetmanager");
var options = {discriminatorKey: 'KYCS'};

var KYCSchema = require('./assetmanagerKYCModel');

var s = {type : String};
var su = {type :String, required : true, unique : true};
var sr = {type :String, require : true};
var d = {type :Schema.Types.Decimal128, default : "0.00"};
var b = {type : Boolean, default : false};

var location = ({
   type : {type: String, enum: ['Point'], required: true},
   coordinates : { type: [Number],required: true}
});

var contactaddress = new Schema({houseNumber :s,streetNumber :s,landmark :s,pin :s,city :s,state :s,country :s, location : location});
var registeredAddress = new Schema({houseNumber :s,streetNumber :s,landmark :s,pin :s,city :s,state :s,country :s});
var directorsaadhar = new Schema({directorName : s,aadhar :s,aadharDoc :s});
var partnersaadhar = new Schema({partnerName : s,aadhar :s,aadharDoc :s});
var kyc = new Schema({docTitle :s,docNumber :s,docFile :s,});

const KycAll = KYCSchema.discriminator('KycAll', new mongoose.Schema({
       CRNNo : su, truID : su, TPA : su, email : su, mobile :su, landLine :s,
       countryCode : {type :String, require : true, default : "+91"},
       contactFName : sr,contactMName : sr,contactLName : sr,
       DOB : {type : Date, default : Date.now},
       gender : {type : String, required : true, enum :["male","female"], default : "male"},
       aboutMe :{type :String, required :true,default : "Finacial Advisor"},
       referenceTruID: sr,
       companyName :sr, assetmanagerName :sr,
       contactAddress : contactaddress,
       companyRegisteredAddress :registeredAddress,
       companyOperationAddress :registeredAddress,
       latitudeLongitude : {type :String, default : "x*y"},
       currentassetstore : s,
       custodionDeposites : d,
       isInsolventbyC : b,
       tucardDeposites : d,
       isInsolventbyI : b,
       bullionType : {type : String, enum : ["silver","gold","both"], default : "both"},
       companyType :s,
       KYCDetails : [kyc],
       KYCDesc:s,      
       agreementStatus : b,
       assetstoreAgreement : b,
       assetstoreAgreementStatus : b,
       directorsAadhar :[directorsaadhar],
       partnersAadhar : [partnersaadhar],

       assetmanagerFixedCharges : {type :Schema.Types.Decimal128, default : "0.00"},
       assetmanagerCoinCharges : {type :Schema.Types.Decimal128, default : "0.1"},

       KYCFlag : {type : String, enum : ["holder","pending","banned","active","stopTrading"], default: "pending"},
       image : s,

       isParent : b,
       parentTruID : {type :String, required : true}, 
       emailNotification:{type : Boolean, default : true},
       currency : {type : String, enum : ["INR","USD"], default: "INR"},
       isLiveRate : b  //to show assetmanager's buy rate in live rate
     }),
   );

module.exports = DBCon.model('KycAll');
