var mongoose = require('mongoose');
var Schema = mongoose.Schema;
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

var kyc = new Schema({ docTitle: s, docNumber: s, docFile: s, docBackUrl: s, validationdata: { type: Object } });

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
  contactFName: s,
  contactMName: s,
  contactLName: s,
  DOB: { type: Date, default: Date.now },
  gender: { type: String, enum: ["male", "female"], default: "male" },
  aboutMe: { type: String, default: "Finacial Advisor" },
  companyName: s,
  address: address,
  latitudeLongitude: { type: String, default: "x*y" },
  companyType: s,
  KYCDetails: [kyc],
  KYCFlag: { type: String, enum: ["hold", "pending", "banned", "active", "blocked", "notactive"], default: "pending" },
  KYCDesc: s,
  isParent: { type: Boolean, default: true },
  parentTruID: sr, image: s,
  referenceTruID: sr,
  category: s,
  channel: s,
  MID: s,
  aadharStatus: { type: String, enum: ["pending", "rejected", "active"], default: "pending" },
  panStatus: { type: String, enum: ["pending", "rejected", "active"], default: "pending" },
  emailVerified: { type: Boolean, default: false, required: true },
  kycTerms: { type: Boolean, default: false },
  docVerified: { type: Boolean, default: false, required: true },
  emailVerificationCode: { type: String },
  companyType: s,
  CINNo: s,
  userType: { type: String, enum: ["user", "partner"], default: "partner" },
  KYCTime: { type: Date, default: Date.now },
  createDate: { type: Date, default: Date.now },
  billingEmails: [billingEmail],
  salesCode: { type: String, default: "" },
  brandLogo: { type: String },
}))

module.exports = mongoose.model('KycAll');
