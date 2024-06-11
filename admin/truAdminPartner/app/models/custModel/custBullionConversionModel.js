var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
const myDB       = require("../dbCon/truCustCon");

var dm = {type :Schema.Types.Decimal128, required : true};
var sr = {type :String, required : true};

var particulars = new Schema({
     bullionType :sr,
     qty : dm, 
     rate : dm 
});

var bullconversionschema   = new Schema({
   truID :sr,
   invoice : sr,
   conversionFrom: particulars,
   conversionTo: particulars,
   amount : dm,
   otherCharges : dm,
   totalAmount : dm,
   sourceFlag : {type : String, required : true, enum :["customer","remmit"], default : "customer"},
   rTruID : {type :String, default : "customer"},
   nodeID : {type :String, default : "customer"},
   remmitCharges : {type :Schema.Types.Decimal128, default : "0.00"}, 
   status : {type : String, required : true, enum :["success","failure"], default : "failure"},
   createDate :{type : Date},
   modifyDate :{type : Date},
   hash : {type : String},
   MOP : {type : String, enum :["truWallet","wallet","bank","card","others","offline"], default : "others"},
});

// var BullConversionSchema = mongoose.model('bullConversions', bullconversionschema);

var BullConversionSchema;
try{
    // const myDB = mongoose.connection.useDb('truCust');
    BullConversionSchema = myDB.model('bullConversions', bullconversionschema);
}
catch(ex)
{
    console.log("ddd",ex)
}

module.exports = BullConversionSchema;  
