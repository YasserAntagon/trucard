
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;


var account = new Schema({
  bankName :{type :String},
  IFSC :{type :String},
  branchName :{type :String},
  address :{type :String},
  city :{type :String},
  custName :{type :String},
  accountNo :{type :String},
  dateAdded :{type :String, default : Date.now},
  userAdded :{type :String, default : "sysAdmin"},
  status :{type :String, enum : ["active","inactive"], default : "active"}
});



var card = new Schema({
  nameOnCard :{type :String},
  cardNo :{type :String},
  exp :{type :String},
  CVV :{type :String},
  type : {type :String, enum : ["debit","credit"], default : "debit"},
  dateAdded :{type :String, default : Date.now},
  userAdded :{type :String},
  status :{type :String, enum : ["active","inactive"], default : "active"}
});


var wallet = new Schema({
  walletName :{type :String},
  mobile :{type :String},
  email :{type :String},
  dateAdded :{type :String, default : Date.now},
  userAdded :{type :String},
  status :{type :String, enum : ["active","inactive"], default : "active"}
});


var mop = new Schema({
     accountDetails : [account],
     cardDetails : [card],
     walletDetails : [wallet]
   });


var modeofpayment = new Schema({
       truID : {type :String, required : true, unique : true},
       MOP : [mop],
     });


var ModeOfPayments = mongoose.model('mop', modeofpayment);

module.exports = ModeOfPayments;
