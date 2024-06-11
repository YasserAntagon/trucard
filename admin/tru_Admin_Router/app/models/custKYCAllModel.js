
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
var options = {discriminatorKey: 'KYCS'};
var KYCSchema = require('./custKYCModel');
const myDB = require('./dbCon/truCustCon');

var s = {type :String}
var sru = {type :String, required : true, unique : true};
var sr = {type :String, required : true};

var billingaddress = new Schema({
 houseNumber :s,streetNumber :s,landmark :s,pin :s,city :s,state :s,country :s
});
var kyc = new Schema({ docTitle :s, docNumber :s, docFile :s, docBackUrl:s, nameOnDoc :s});

const KycAll = KYCSchema.discriminator('KycAll', new mongoose.Schema({
       CRNNo : sru, truID : sru, 
       nodeID:s,
       custID:s,
       fName : s,
       mName : s,
       lName : s,
       gardian : s,
       isMinor : {type:String, default:false, required : true},
       mobile :s, email :sru,
       countryCode : {type :String, require : true, default : "+91"},
       gender : {type : String, enum :["male","female","other"], default : "male"},
       DOB : {type : Date, default : Date.now},
       aboutMe : s,
       mHash :{type :Array, required : true},
       mFlag :{type :String, enum : [0,1]},
       channel : s, billingAddress : billingaddress, permanentAddress : billingaddress,
       KYCDetails : [kyc],
       KYCDesc:s,      
       KYCFlag : {type : String, enum : ["hold","pending","banned","active","blocked"], default: "pending"},
       countryOfOrigin:{type : String},
       migrantCountry:{type : String},
       immigrantCountry:{type : String},
       isMigrated: {type :Boolean, default: false, required : false},
       refernceTruID: sr,
       currentassetstore : sr,
       image : s,
       RqrToken : s,
       language:s,
       nationality:s,
       residence:s,
       emailVerified: {type :Boolean,default: false, required : true},
       emailVerificationCode: {type:String}, 
       docVerified: {type :Boolean,default: false, required : true}, //KYC documents verification flag
       referenceVerified: {type :Boolean,default: false, required : true}, //reference Verification flag
       selfReferenceID:{type:String}, //refernce ID which can be shown to other users publically
       referalCount :{type:String,default:"0", required : true},
       aadharStatus: { type: String, enum: ["pending", "rejected", "active"], default: "pending" },
       panStatus: { type: String, enum: ["pending", "rejected", "active"], default: "pending" },
       isVACreated :{type:String, default:false, required : true},
       partnerHandle :{type:String},
       KYCTime:{ type: Date, default: Date.now },
       KYCVerifyBy:{type : String}
     })
   );

module.exports = myDB.model('KycAll');

// var kycAll;
// try{
//     const myDB = mongoose.connection.useDb('truCust');
//     kycAll = myDB.model('KycAll', KycAll);
// }
// catch(ex)
// {
//     console.log("ddd",ex)
// }

// module.exports = kycAll;  
