var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
var options = {discriminatorKey: 'KYCS'};
var KYCSchema = require('./assetstoreKYCModel');
var myDB = require("../dbCon/truassetstoreCon");

var s = {type :String};
var sr = {type :String, required : true};
var sru = {type :String, required : true, unique : true};

var address = new Schema({houseNumber :s, streetNumber :s, landmark :s, pin :s, city :s, state :s, country :s});

var location = ({
  type : {type: String, enum: ['Point'], required: true},
  coordinates : { type: [Number],required: true}
});

var contactaddress = new Schema({houseNumber :s, streetNumber :s, landmark :s, pin :s, city :s, state :s, country :s, location : location});

var kyc = new Schema({ docTitle :s, docNumber :s, docFile :s});

const KycAll = KYCSchema.discriminator('KycAll', new mongoose.Schema({
      CRNNo : sru,  truID : sru,  email :sru,  mobile :sru,  landLine :s,  contactFName : sr,  contactMName : sr,  contactLName : sr,
      countryCode : {type :String, require : true, default : "+91"},

      companyName :sru,
      contactAddress : address,
      companyRegisteredAddress :contactaddress,
      companyOperationAddress :address,

      latitudeLongitude : {type :String, default : "x*y"},

      deposites : {type :Schema.Types.Decimal128, default : "0.00"},
      bullionType : {type : String, enum : ["silver","gold","both"], default : "both"},
      companyType :s, KYCDetails : [kyc],
      agreementStatus : {type : Boolean, default : false},
      assetstoreAgreementStatus : {type : Boolean, default : false},
      KYCFlag : {type : String, enum : ["hold","pending","banned","active"], default: "pending"},
      KYCDesc:s,
      isParent : {type : Boolean,required : true, default : false},
      parentTruID : sr,image : s,
      type : {type : String, enum : ["admin","node","store"], default: "node"},
      referenceTruID: sr
     }),
   );

 module.exports = myDB.model('KycAll');