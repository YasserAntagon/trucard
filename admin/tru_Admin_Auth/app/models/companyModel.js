var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var s = {type :String}
var sru = {type :String, required : true, unique : true};
var sr = {type :String, required : true};
var b = {type :Boolean};


var location = ({
   type : {type: String, enum: ['Point']},
   coordinates : { type: [Number]}
});

var contactaddress = new Schema({houseNumber :s ,streetNumber :s ,landmark :s ,pin :s ,city :s ,state :s ,country :s , location : location, display:b});
var companyoperationaddress = new Schema({ houseNumber :s ,streetNumber :s ,landmark :s ,pin :s ,city :s ,state :s ,country :s , display:b});
var bank = new Schema({ bankName :s,IFSC :s,accountNo :s});

// var kyc = new Schema({ docTitle :s, docNumber :s, docFile :s});

var companyschema   = new Schema({
       truID : sru,
       companyName : sr,
       shortName : s,
       mobile :sru,
       FAX :sru,
       email :sru,
       telephone : s,
       countryCode : {type :String, require : true, default : "+91"},
       PAN : sr,
       GSTINNo : sru,
       companyDesc : sr,
       companyRegNo : sru,
       regDate : sr,
       contactAddress : contactaddress,
       companyOperationAddress : companyoperationaddress,
       bankDetails:bank
     });


var CompanySchema = mongoose.model('company', companyschema)
     module.exports = CompanySchema;

//20022019  13.59
