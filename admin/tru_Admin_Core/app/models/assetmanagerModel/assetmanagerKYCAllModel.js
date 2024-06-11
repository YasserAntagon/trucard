var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
var myDB = require("../dbCon/truassetmanagerCon");

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
       CRNNo : su, truID : su, email : su, mobile :su, landLine :s,
       countryCode : sr,contactFName : sr,contactMName : sr,contactLName : sr,
       DOB : {type : Date, default : Date.now},
       gender : {type : String, required : true, enum :["male","female"], default : "male"},
       aboutMe :{type :String, required :true,default : "Finacial Advisor"},
       companyName :su, dealerName :su,
       contactAddress : contactaddress,
       companyRegisteredAddress :registeredAddress,
       companyOperationAddress :registeredAddress,
       latitudeLongitude : {type :String, default : "x*y"},
       currentCustodian : s,
       custodionDeposites : d,
       isInsolventbyC : b,
       tucardDeposites : d,
       isInsolventbyI : b,
       bullionType : {type : String, enum : ["silver","gold","both"], default : "both"},
       companyType :s,
       KYCDetails : [kyc],
       agreementStatus : b,
       custodianAgreement : b,
       custodianAgreementStatus : b,
       directorsAadhar :[directorsaadhar],
       partnersAadhar : [partnersaadhar],
       dealerFixedCharges : {type :Schema.Types.Decimal128, default : "0.005"},
       dealerCoinCharges : {type :Schema.Types.Decimal128, default : "0.0135"},
       KYCFlag : {type : String, enum : ["holder","pending","banned","active","stopTrading"], default: "pending"},
       image : s,
       emailNotification:{type : Boolean, default : true},
       isParent : b,
       parentTruID : {type :String, required : true},
       currency : {type : String, enum : ["INR","USD"], default: "INR"}
     }),
   );

module.exports = myDB.model('KycAll');

// var kycSchema;
// try{
//     // const myDB = mongoose.connection.useDb('truDealer');
//     kycSchema = myDB.model('KycAll', KycAll);
// }
// catch(ex)
// {
//     console.log("ddd",ex)
// }

// module.exports = kycSchema; 

