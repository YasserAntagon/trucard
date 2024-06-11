
var fs = require('fs')
var path = require('path')
let server = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../confServers.json')));

module.exports.reqip = server.clusterServer;
module.exports.adminReqIP = server.adminAuth;