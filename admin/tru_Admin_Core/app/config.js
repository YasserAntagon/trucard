
var fs = require('fs')
var path = require('path')
let server = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../confServers.json')));

module.exports.reqip = server.clusterServer;
module.exports.adminCoreip = server.adminCore;
module.exports.emailreqip = server.emailServer;
module.exports.adminReqIP = server.adminAuth;
module.exports.bankrequrl = server.bankServer;

module.exports.bankreqBearer = "#aPiS$aSdF@6512!012345#";
module.exports.bearer1001 = "#eMaIlSeRvEr*aPiS$1234@5678!2345*#";

