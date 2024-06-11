
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
var options = {discriminatorKey: 'KYCS'};
var KYCSchema = require('./custKYCModel');

var s = {type :String}
var sru = {type :String, required : true, unique : true};
var sr = {type :String, required : true};

var billingaddress = new Schema({
 houseNumber :s,streetNumber :s,landmark :s,pin :s,city :s,state :s,country :s
});


var kyc = new Schema({ docTitle :s, docNumber :s, docFile :s});

const KycAll = KYCSchema.discriminator('KycAll', new mongoose.Schema({
       CRNNo : sru, truID : sru, 
       fName : sr, mName : s, lName : sr, mobile :sru, email :sru,
       countryCode : {type :String, require : true, default : "+91"},
       gender : {type : String, required : true, enum :["male","female"], default : "male"},
       DOB : {type : Date, default : Date.now},
       aboutMe : s,
       mHash :{type :Array, required : true},
       mFlag :{type :String, enum : [0,1]},
       channel : s, billingAddress : billingaddress, permanentAddress : billingaddress,
       KYCDetails : [kyc],
       KYCFlag : {type : String, enum : ["hold","pending","banned","active"], default: "active"},
       refernceTruID: sr,
       currentassetstore : sr,
       image : s,
       RqrToken : s,
     }),
   );

module.exports = mongoose.model('KycAll');
