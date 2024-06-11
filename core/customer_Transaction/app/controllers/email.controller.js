const request = require('request'),
  conf = require("../conf");

var emailreqip = conf.emailreqip;

module.exports.consumer_emailtxnNew = function (truID, invoice, banktxnid) {
  var inputJson = {
    "truID": truID,
    "invoice": invoice
  }
  if (banktxnid) {
    inputJson["bankTXNID"] = banktxnid;
  }
  request.post({
    "headers": { "content-type": "application/json", "Authorization": "Bearer " + conf.bearer1003 },
    "url": emailreqip + ":3114/SendTransactionMailSMS",
    "body": JSON.stringify(inputJson)
  }, (error, resp, body) => {
    if (error) {
      return console.dir(error);
    } else {
      console.log(body)
    }
  })
}

module.exports.addMoneyEmail = function (final, payby, banktxnid, paymentcharge, mailtype, amount, invoice) {

  request.post({
    "headers": { "content-type": "application/json", "Authorization": "Bearer " + conf.bearer1006 },
    "url": emailreqip + ":3114/1008",
    "body": JSON.stringify({
      "mailTo": final.email,
      "name": final.name,
      "addMoney": amount.toString(),
      "balance": parseFloat(final.balance).toFixed(2).toString(),
      "invoice": invoice,
      "invoiceDate": retDateObj(Date.now()),
      "bankTXNID": banktxnid,
      "payBy": payby,
      "paymentCharge": paymentcharge,
      "mobile": final.mobile,
      "mailtype": mailtype
    })
  }, (error, resp, body) => {
    if (error) {
      return console.dir(error);
    }
  }
  )
}
module.exports.withdranMailEmail = function (final) {
  request.post({
    "headers": { "content-type": "application/json", "Authorization": "Bearer " + conf.bearer1006 },
    "url": emailreqip + ":3114/withdrawMoney",
    "body": JSON.stringify(final)
  }, (error, resp, body) => {
    if (error) {
      return console.dir(error);
    } else {
      console.info(body)
    }
  })
}


function retDateObj(dateobj) {
  var d = new Date(dateobj);

  var daysIndex = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (daysIndex[d.getDay()] + " " + d.toLocaleString('default', { month: 'short' }) + ' ' +
    d.getDate() + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + " IST " +
    d.getFullYear());

}