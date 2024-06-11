var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var assetmanagerNotificationschema   = new Schema({

 notificationID : {type :String, required : true, unique : true},
 triggeredByTruID : {type :String, required : true},
 triggeredByCRNNo: {type :String},
 type : {type : String, required : true},
 subType : {type : String, required : true},
 notifyTo : {type :String, required : true},
 toCRNNo: {type :String},
 notification : {type :String, required : true},
 dateAdded : {type : Date, default : Date.now},
 isRead : {type : Boolean, default : false},
 dateRead : {type : Date, default : Date.now},
 title:{type :String, required : true,default:"0"},
 referenceID:{type :String, required : true, default:"0"}
});

var notificationSchema = mongoose.model('notification', assetmanagerNotificationschema);

module.exports = notificationSchema; 
