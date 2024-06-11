
var fs = require('fs')
var path = require('path')
let server = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../confServers.json')));

module.exports.reqip = server.adminCore;

module.exports.clusterreqip = server.clusterServer;

module.exports.emailreqip = server.emailServer;

module.exports.adminReqIP = server.adminAuth;

module.exports.smsreqip = server.otpServer;

module.exports.bankrequrl = server.bankServer;
module.exports.pgSeverURL = server.pgSeverURL;

module.exports.assetstoreAuth = "5114";   //"4111" 
module.exports.custAuth = "5114";   //"4112" 
module.exports.custTxn ="5114";   //"4114" 
module.exports.assetmanagerTxn = "5114";   //"4118" 
module.exports.assetmanagerAuth = "5114";   //"4115" 
module.exports.assetmanagerStock = "5114";   //"4117" 
module.exports.entityStock = "5114";   //"4120" 
module.exports.adminAuth = "5112";   //"5112" 
module.exports.entityTxn = "5114";   //"4121" 
module.exports.remmitAuth = "5114";   //"4122" 
module.exports.truRates = "5114";  // "8000" 

module.exports.bankreqBearer = "#aPiS$aSdF@6512!012345#";

