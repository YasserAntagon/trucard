const request = require('request'),
conf = require("../conf");

var reqip = conf.reqip;

module.exports.notification_refund =   function (truid,orderid,triggeredbytruid) {
    // var dates = new Date().toLocaleString();
       request.post({
        "headers": { "content-type": "application/json" },
        "url": reqip + ":4116/api/insnotification",
        "body": JSON.stringify({
          "notifyto" : truid,
          "triggeredbytruid":triggeredbytruid, //admin truid
          "notification" :"Your refund against order " + orderid +" has been initiated sucessfully.Amount will credited in your account in next 1 or 2 working days",
          "type" : "refund",
          "subtype" :"Initiated",
          "title":"Refund Initiated",
          "referenceid" : truid
        })
      }, (error,body) => {
        if(error) {
          console.log(error);
        }
        // var newjson =  JSON.parse(body);
           }
         )
}


