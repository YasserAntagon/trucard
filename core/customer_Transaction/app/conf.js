
var fs = require('fs')
var path = require('path')
let server = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../confServers.json')));
var tokenstr = "#eMaIlSeRvEr*aPiS$1234@5678!";
module.exports = {
    reqip: server.clusterServer,
    adminreqip: server.adminAuth,
    bankurl: server.bankServer,
    txnQueueServer: server.txnQueueServer,
    emailreqip: server.emailServer, 
    bearer1003: tokenstr + "7891*#",
    bearer1002: tokenstr + "12345*#",
    bearer1004: tokenstr + "12345*#",
    bearer1005: tokenstr + "6789*#",
    bearer1006: tokenstr + "2349*#",
    bearer1007: tokenstr + "6789*#",
    bearer4003: tokenstr + "23456*#",
    bearer4004: tokenstr + "67890*#",
    bearer4005: tokenstr + "34567*#",
    bearer4007: tokenstr + "34567*#",
    bankbearer: "#aPiS$aSdF@6512!123456#",
    txnQueueToken:"#txnQueue*aPiS$3216@5678!1234*#",
    liveratepath: "/NodeProject/Cluster/live_rates/liveRates.json"
}