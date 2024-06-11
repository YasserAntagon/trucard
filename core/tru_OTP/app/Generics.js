

var fs = require('fs')
var path = require('path')
let server = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../confServers.json')));
let defaultVals = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../regionConf.json')));
module.exports.randomOTP = server.randomOTP;
module.exports.reqip = server.otpServer + ":3118/";
module.exports.reqemailip = server.emailServer + ":3114/";
module.exports.bearer130 = "#S%m%S*aPiS$1234@5678!1234*#";
module.exports.beareremailotp = "#eMaIlSeRvEr*aPiS$1234@5678!2345*#";
module.exports.defaultNONPanLimit = defaultVals.defaultNONPanLimit;
module.exports.defaultCurrency = defaultVals.defaultCurrency;