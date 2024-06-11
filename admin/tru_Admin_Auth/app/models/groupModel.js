
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var sru = {type :String, required : true, unique : true};
var sr = {type :String, required : true};
var d = {type :Schema.Types.Decimal128, required : true};
var b = {type :Boolean, default : false};

var permission = new Schema({ create :b,view :b,modify :b,delete:b});




var groupschema   = new Schema({
   groupID : sru,
   modifyDate :{type:Date, default:Date.now},
   modifyBy :sr,
   groupName :sru,
   permissions : permission,
   groupDesc:{type: String},
   updateReason:{type: String}
});

var GroupSchema = mongoose.model('group', groupschema);
module.exports = GroupSchema;
