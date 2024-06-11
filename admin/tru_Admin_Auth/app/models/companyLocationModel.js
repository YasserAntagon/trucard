var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var s = {type :String}
var sru = {type :String, required : true, unique : true};
var sr = {type :String, required : true};
var d = {type :Date,default:Date.now};


var location = ({
   type : {type: String, enum: ['Point']},
   coordinates : { type: [Number]}
});

var contactaddress = new Schema({houseNumber :s ,streetNumber :s ,landmark :s ,pin :s ,city :s ,state :s ,country :s , location : location});
// var owneradress = new Schema({ houseNumber :s ,streetNumber :s ,landmark :s ,pin :s ,city :s ,state :s ,country :s , display:b});

var owneddetails = new Schema({ area :s,maintainance :s});
var renteddetails = new Schema({ ownerName:s,ownerAddress:s,area :s,maintainance :s,rent:s,deposit:s,ownerMobileNo:s,rentAggrementDoc:s});

var branchschema   = new Schema({
       truID : sru,
       referenceTruID : sr,
       companyTruID: sr,
       modifyDate : d,
       createDate : d,
       branchName : sr,
       mobile :sr,
       FAX :s,
       email :sr,
       purpose : sr,
       countryCode : {type :String, require : true, default : "+91"},
       description : sr,
       regDate : sr,
       propertyDetails : {type : String ,required : true, enum :["rented","owned"], default : "owned"},
       telephone : s,
       description : s,
       contactAddress : contactaddress,
       rented:renteddetails,
       owned : owneddetails
     });


var CompanyLocationSchema = mongoose.model('companylocation', branchschema)
     module.exports = CompanyLocationSchema;

//07052019  18.18
