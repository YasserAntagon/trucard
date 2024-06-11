var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const myDB = require("../dbCon/truRemmitCon");
var options = { discriminatorKey: 'KYCS' };
var KYCSchema = require('./remmitKYCModel');

var s = { type: String };
var sru = { type: String, required: true, unique: true };
var sr = { type: String, required: true };

var location = ({
  type: { type: String, enum: ['Point'], required: true },
  coordinates: { type: [Number], required: true }
});

var address = new Schema({ houseNumber: s, streetNumber: s, landmark: s, pin: s, city: s, state: s, country: s, location: location });

var kyc = new Schema({ docTitle: s, docNumber: s, docFile: s, docBackUrl: s });
var billingEmail = new Schema({
  email: s,
  type: {
    threshold: { type: Boolean, default: false },
    liveRate: { type: Boolean, default: false }
  }
});
const KycAll = KYCSchema.discriminator('KycAll', new mongoose.Schema({
  CRNNo: sru, truID: sru, email: sru, mobile: sru, landLine: s,
  countryCode: { type: String, require: true, default: "+91" },
  contactFName: sr,
  contactMName: s,
  contactLName: sr,
  DOB: { type: Date, default: Date.now },
  createDate: { type: Date, default: Date.now },
  gender: { type: String, required: true, enum: ["male", "female"], default: "male" },
  aboutMe: { type: String, required: true, default: "Finacial Advisor" },
  companyName: sr,
  address: address,
  latitudeLongitude: { type: String, default: "x*y" },
  companyType: s,
  KYCDetails: [kyc],
  KYCFlag: { type: String, enum: ["hold", "pending", "banned", "active", "blocked", "notactive"], default: "pending" },
  KYCDesc: s,
  isParent: { type: Boolean, default: true },
  isLending: { type: Boolean, required: true, default: false },
  parentTruID: sr, image: s,
  referenceTruID: sr,
  category: s,
  channel: s,
  MID: s,
  aadharStatus: { type: String, enum: ["pending", "rejected", "active"], default: "pending" },
  panStatus: { type: String, enum: ["pending", "rejected", "active"], default: "pending" },
  MID: s,
  emailVerified: { type: Boolean, default: false, required: true },
  docVerified: { type: Boolean, default: false, required: true },
  emailVerificationCode: { type: String },
  companyType: s,
  CINNo: s,
  userType: { type: String, enum: ["user", "partner"], default: "partner" },
  KYCTime: { type: Date, default: Date.now },
  KYCVerifyBy: s,
  billingEmails: [billingEmail],
  salesCode: { type: String, default: "" },
}
)
)

module.exports = myDB.model('KycAll');

// var kycAll;
// try{
//     // const myDB = mongoose.connection.useDb('truRemmit');
//     kycAll = myDB.model('KycAll', KycAll);
// }
// catch(ex)
// {
//     console.log("ddd",ex)
// }

// module.exports = kycAll;
