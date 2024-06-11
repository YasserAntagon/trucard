var mongoose = require('mongoose');
var Schema = mongoose.Schema; 
var KYCSchema = require('./adminKYCModel');
var s = { type: String };
var su = { type: String, required: true, unique: true };
var sr = { type: String, require: true }; 
var b = { type: Boolean, default: false };
var contactaddress = new Schema({ houseNumber: s, streetNumber: s, landmark: s, pin: s, city: s, state: s, country: s });
var paddress = new Schema({ houseNumber: s, streetNumber: s, landmark: s, pin: s, city: s, state: s, country: s });

const KycAll = KYCSchema.discriminator('KycAll', new mongoose.Schema({
   CRNNo: su, truID: su, email: su, mobile: su, landLine: s,
   countryCode: { type: String, require: true, default: "+91" },
   title: { type: String, required: true, enum: ["Mr", "Mrs", "Miss"], default: "Mr" },
   fName: sr, mName: s, lName: sr,
   DOB: { type: Date },
   gender: { type: String, enum: ["male", "female", ""], default: "" },
   empCode: su,
   type: sr,
   isSuperAdmin: b,
   department: sr,
   contactAddress: contactaddress,//address
   permanentAddress: paddress,
   image: s,//Kyc All
   status: { type: String, required: true, enum: ["active", "inactive"], default: "inactive" }, 
   joiningDate: { type: Date },
   leavingDate: { type: Date },
   skillset: s,
   emergencyNo: s,
   branchID: s,
   machineHash: s,
   mHashVerified: b
}),
);

module.exports = mongoose.model('KycAll');
