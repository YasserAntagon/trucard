var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var options = {discriminatorKey: 'KYCS'};

var KYCSchema = require('./adminKYCModel');

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
var paddress = new Schema({houseNumber :s,streetNumber :s,landmark :s,pin :s,city :s,state :s,country :s});
var doc = new Schema({docTitle :s,docNumber :s,docFile :s,});

const KycAll = KYCSchema.discriminator('KycAll', new mongoose.Schema({
       CRNNo : su, truID : su,  email : su, mobile :su, landLine :s,
       countryCode : {type :String, require : true, default : "+91"},
       title : {type : String, required : true, enum :["Mr","Mrs","Miss"], default : "Mr"},
       fName : sr,mName : s,lName : sr,
       DOB : {type : Date},
       gender : {type : String, required : true, enum :["male","female"], default : "male"},
       empCode :su,
       type : sr,
       contactAddress : contactaddress,//address
       permanentAddress : paddress,
       image : s,//Kyc All
       status :{type : String, required : true, enum : ["active","inactive"], default: "inactive"},
       empDoc :[doc],
       joiningDate :{type : Date},
       leavingDate :{type : Date},
       skillset :s,
       emergencyNo:s
     }),
   );

module.exports = mongoose.model('KycAll');
