var fs = require('fs')
var path = require('path')
let server = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../confServers.json')));
module.exports.randomOTP = server.randomOTP;
module.exports.reqip = server.otpServer + ":3118/";
module.exports.bearer140 = "#S%m%S*aPiS$1234@5678!2345*#";