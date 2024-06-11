var fs = require('fs')
var path = require('path')
let server = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../confServers.json')));

module.exports = { 
    reqippincode: server.notifyServer,
    consumerProfPath : '../../uploads/consumer/profile/',   
    bearer1 : "#CoNsUmEr~aPiS^K%Y@C$1234@5678!1234*#",
   
}
