let server = require('../confServers.json');
module.exports.reqip = server.clusterServer;
module.exports.adminreqip = server.adminAuth; 
module.exports.ifscurl = server.ifscurl;
module.exports.cdn = server.cdn;
module.exports.logstashurl = server.logstashurl;
module.exports.randomOTP = server.randomOTP;
module.exports.bearer = "#eNtItY*aPiS$1234@5678!0123*#";
module.exports.bearer1 = "#eNtItY*aPiS$1234@5678!1234*#";
module.exports.bearer5 = "#eNtItY*aPiS$1234@5678!5678*#";
module.exports.bearer6 = "#eNtItY*aPiS$1234@5678!6789*#";
module.exports.bearer7 = "#eNtItY*aPiS$1234@5678!7891*#";
module.exports.bearer8 = "#tRuPiNcOdEn$I1K2H3I4L@6525!KLSDG456901#";
module.exports.bearer9 = "#CoNsUmEr~aPiS^K%Y@C$1234@5678!1234*#";

module.exports.fourtyfive = {
  CRNNo: "mandatory",
  clientID: "mandatory",
  bullionType: "mandatory",
  quantity: "mandatory", 
  transactionType: "mandatory",
  MOP: "mandatory",
  status: "mandatory",
  invoice: "mandatory"
};


module.exports.fourtysix = {
  toTruID: "mandatory",
  rTruID: "mandatory",
  fromTruID24: "mandatory",
  fromTruID99: "mandatory",
  G24Name: "mandatory", 
  S99Name: "mandatory",
  G24qty: "mandatory",
  G24Rate: "mandatory",
  S99qty: "mandatory",
  S99Rate: "mandatory",
  transactionType: "mandatory",
  MOP: "mandatory",
  status: "mandatory",
  invoice: "mandatory",
  aStatus: "mandatory"
};


module.exports.fourtynine = {
  toTruID: "mandatory",
  rTruID: "mandatory",
  fromTruID: "mandatory",
  fromName: "mandatory",
  G24qty: "mandatory",
  G24Rate: "notmandatory",
  S99qty: "mandatory",
  S99Rate: "notmandatory",
  transactionType: "mandatory",
  MOP: "mandatory",
  status: "mandatory",
  invoice: "mandatory",
  aStatus: "notmandatory",
  PGType: "notmandatory"
};


module.exports.fiftyseven = {
  truID: "mandatory"
};

module.exports.fourHundredOne = {
  truID: "mandatory",
  email: "mandatory",
  mobile: "mandatory",
  fName: "mandatory",
  lName: "mandatory",
  refernceTruID: "mandatory"
};

module.exports.sixtysix = {
  toTruID: "mandatory",
  rTruID: "mandatory",
  fromTruID24: "mandatory", 
  fromTruID99: "mandatory",
  G24Name: "mandatory", 
  S99Name: "mandatory",
  G24qty: "mandatory",
  G24Rate: "mandatory",
  S99qty: "mandatory",
  S99Rate: "mandatory",
  transactionType: "mandatory",
  MOP: "mandatory",
  status: "mandatory",
  invoice: "mandatory",
  aStatus: "mandatory",
  PGType: "notmandatory"
};
