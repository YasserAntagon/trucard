var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
var myDB = require("../dbCon/truRateCon");
var s = {type : String, required : true};
var d = {type : Date, required : true};
var bool = {type : Boolean, required : true, default:false};

var promotionschema   = new Schema({
    adsId: s,
    adsTitle: s,
    images: s,
    description: s,
    createDate: d,
    expiryDate: d,
    accessFlag: bool,
    type: s,
    subType: s,
    bannerType: s,
    isDelete: bool,
    truID: s
});

// module.exports =  mongoose.model('promotion', promotionschema);
var PromotionSchema;
try{
    // const myDB = mongoose.connection.useDb('truCommon');
    PromotionSchema = myDB.model('promotion', promotionschema);
}
catch(ex)
{
    console.log("ddd",ex)
}

module.exports = PromotionSchema;


