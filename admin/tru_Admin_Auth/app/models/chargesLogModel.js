
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var sru = { type: String, required: true, unique: true };
var sr = { type: String, required: true };
var s = { type: String };
var chargeslogschema = new Schema({
   ID: sru,
   modifyDate: { type: Date, default: Date.now },
   modifyBy: sr,
   otherCharges: sr,
   txnLoading: sr,
   assetstoreCharges: sr,
   assetmanagerCharges: sr,
   tax: sr,
   sellTax: sr,
   entitycharges: sr,
   partnerCharges: sr,
   nodeCharges: s,
   transactionfees: sr,
   slabamt: s,
   servicetax: s,
   neftcharge: s,
   impscharge: s,
   impscharge1: s,
   rtgscharge: s,
   type: sr,
   transferFee: sr,
   gstOnTransferFee: sr
});

var ChargesLogSchema = mongoose.model('chargeslog', chargeslogschema);
module.exports = ChargesLogSchema;
