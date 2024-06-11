var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var s = {type :String};
var d = {type :String, default : Date.now};

var account = new Schema({
  bankName :s, IFSC :s, branchName :s, address :s, city :s, custName :s, accountNo :s, dateAdded :d,
  userAdded :{type :String, default : "sysAdmin"},
  status :{type :String, enum : ["active","inactive"], default : "active"}
});



var card = new Schema({
  nameOnCard :s, cardNo :s, exp :{type : Date}, CVV :s,
  type : {type :String, enum : ["debit","credit"], default : "debit"},
  dateAdded :d, userAdded :s,
  status :{type :String, enum : ["active","inactive"], default : "active"}
});


var wallet = new Schema({
  walletName :s, mobile :s, email :s, dateAdded :d, userAdded :s,
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
