var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var s = { type: String};
var str = { type: String, require:true};
var address = new Schema({
    houseNumber: s, streetNumber: s, landmark: s, pin: s, city: s, state: s, country: s
  });
  
var addresslogschema   = new Schema({
    truID:str,
    addressID:str,
	billingAddress : address,
    permanentAddress : address,
    createDate :{type : Date, default : Date.now},
    
 
});

var Addresslogschema = mongoose.model('addresslog', addresslogschema);

module.exports = Addresslogschema;