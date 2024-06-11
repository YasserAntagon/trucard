var url = require('./config.js');
module.exports = {
    "pgateway": "atom", // atom,disable
    "global": { 
        "login": "allow",  
        "wallet": "allow",
        "transfer": "allow",
        "redeem": "allow", 
        "self": "allow"
    },
    "validation":
    {
        "emailrequired": "disable",  // In system consumer email id required or not , on client requirment. 
    },
    "aUrl": url.adocurl + "/5013?url=",
    "custDocUpload": url.adocurl + "",
    "docUrl": url.adocurl + "/1015?url=",
    "entityUrl": url.adocurl + "/1044?url=",
    "entityDoc": url.adocurl + "/1046?url=",
    "assetmanagerUrl": url.adocurl + "",
    "custoUrl": url.adocurl + "/3014?url=",
    "custoDocUrl": url.adocurl + "/3015?url=",
    "custUrl": url.adocurl + "/1014?url=",
    "brandLogo": url.adocurl + "/4099?url=",
}

