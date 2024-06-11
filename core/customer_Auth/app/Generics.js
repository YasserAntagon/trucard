var fs = require('fs')
var path = require('path')
let server = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../confServers.json')));

var tokenstr = "#eMaIlSeRvEr*aPiS$1234@5678!";
module.exports  = {

profile : "", //assetstore kyc document path	for stagging server.
// profile : "https://www.company.com/secProf/consumer/",		//assetstore profile image path	for Production server.

docs : "",
// profile : "https://www.company.com/secDoc/consumer/",		//assetstore profile image path	for Production server.

redeemLock : 48,

emailExpiryTime : (48 * 60 * 60 * 1000),

reqip : server.clusterServer,
EmaiReqIP : server.emailServer,

mailURL : "https://YOUR_DOMAIN_NAME/c3b74f27304cd8d55a8064?v=",

bearer1001 : tokenstr + "2345*#",
bearer1002 : tokenstr + "12345*#",
bearer4008 : tokenstr + "89012*#"

}