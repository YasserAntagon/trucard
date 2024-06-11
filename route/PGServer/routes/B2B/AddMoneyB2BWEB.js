var express = require('express');
var router = express.Router();
var sha = require('../../sha');
let buybulDB = require('../../model/b2b/buybulDB');
var cryptos = require('crypto');
var password = '~*Su655rya*~';
let atompath = require('../../model/config/atomkey.json');
function encrypt(text) {
  try {
    var cipher = cryptos.createCipher('aes-256-ctr', password)
    var crypted = cipher.update(text, 'utf8', 'hex')
    crypted += cipher.final('hex');
    return crypted;
  }
  catch (ex) {
    return ""
  }
}
function formatPGDate() {
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth() + 1;
  var yyyy = today.getFullYear();
  if (dd < 10) {
    dd = '0' + dd;
  }
  if (mm < 10) {
    mm = '0' + mm;
  }
  return dd + '/' + mm + '/' + yyyy;
}
function decimalChopper(num, fixed) {
  var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?');
  return num.toString().match(re)[0];
}
router.post('/b2bAddMoneyWeb', function (req, res, next) {
  var cc = req.body;
  var originURL = req.get('origin');
  try {
    let inputString = '';
    inputString += "CRNNo";
    inputString += '=';
    inputString += cc.CRNNo;
    inputString += '~';
    inputString += "AMOUNT";
    inputString += '=';
    inputString += cc.AMOUNT;
    inputString += '~';
    inputString += "CUST_NAME";
    inputString += '=';
    inputString += cc.CUST_NAME;
    inputString += '~';
    inputString += "CUST_EMAIL";
    inputString += '=';
    inputString += cc.CUST_EMAIL;
    inputString += '~';
    inputString += "CUST_MOBILE";
    inputString += '=';
    inputString += cc.CUST_MOBILE;
    var sha512str = sha.hash(inputString);
    if (sha512str !== cc.HASH) {
      var jsonresp = {
        "RESPONSE_CODE": "411",
        "RESPONSE_MESSAGE": "Invalid hash",
        "STATUS": "FAILED",
        "ORDER_ID": "0",
        "tType": "addMoney",
        "host": originURL + cc.responseURL
      }
      res.render('b2bWEBresponse', {
        pgurl: jsonresp
      });
    }
    else {
        var amount = decimalChopper(parseFloat(cc.AMOUNT / 100), 2);
        var udf1 = cc.CUST_NAME;
        var udf2 = cc.CUST_EMAIL;
        var udf3 = cc.CUST_MOBILE;
        var udf4 = "addMoney";
        // var transid = invoice;  // invoice number
        var custacc = cc.CRNNo;
        var json = JSON.stringify({
          "customerTruID": custacc,
          "invoice": "0",
          "surcharge": "0",
          "tType": "addMoney",
          "amount": amount,
          "custName": cc.CUST_NAME,
          "invoiceAmount": amount,
          "responseCode": "401",
          "aStatus": "Pending",
          "failureReason": "Transaction Initiated",
          "email": cc.CUST_EMAIL,
          "mobile": cc.CUST_MOBILE
        });
        buybulDB.submitAtomLog(json, function (err, response) {
          if (response.status == "200") {
            var transid = response.invoice;
            var key = atompath.hashkey;
            var final = (Buffer.from(custacc).toString('base64'));
            var encryptText = "addMoney" + "~" + cc.CRNNo + "~" + "B2BSelf" + "~" + "B2BWEB" + "~" + originURL + cc.responseURL;
            var udf9 = encrypt(encryptText);
            let returnPath = "/atom/truPaymentB2BResponse";
            var url = atompath.callbackurl + returnPath;
            var sign = atompath.loginID + atompath.pass + atompath.ttype + atompath.productID + transid + amount + atompath.currency;
            function sig(sign, key) {
              return cryptos.createHmac('sha512', key)
                .update(Buffer.from(sign, 'utf-8'))
                .digest('hex');
            }
            var date = formatPGDate();
            var signature = sig(sign, key);
            var pgurl = {
              host: atompath.url + "/paynetz/epi/fts",
              alogin: atompath.loginID,
              apass: atompath.pass,
              attype: atompath.ttype,
              aprodid: atompath.productID,
              aamt: amount,
              atxncurr: atompath.currency,
              atxnscamt: amount,
              aclientcode: encodeURIComponent(final),
              atxnid: transid,
              adate: date,
              acustacc: custacc,
              audf1: udf1,
              audf2: udf2,
              audf3: udf3,
              audf4: udf4,
              audf9: udf9,
              aru: encodeURI(url),
              asignature: signature
            }
            if (atompath.redirectPath) {
              pgurl.host = atompath.redirectPath + "/atom/redirectToAtom";
              pgurl.ahost = atompath.url + "/paynetz/epi/fts";

            } else {
              pgurl.host = atompath.url + "/paynetz/epi/fts";
            }
            res.render('processpay', {
              pgurl: pgurl
            });
          } else {
            var jsonresp = {
              "RESPONSE_CODE": "411",
              "RESPONSE_MESSAGE": response.message,
              "STATUS": "FAILED",
              "ORDER_ID": "0",
              "tType": "addMoney",
              "host": originURL + cc.responseURL
            }
            res.render('b2cWEBresponse', {
              pgurl: jsonresp
            });
          }
        })
    }
  }
  catch (ex) {
    console.error(ex)
  }
});
function failpay(res) {
  let jsonPays = "RESPONSE_CODE=1";
  jsonPays += "~";
  jsonPays += "RESPONSE_MESSAGE=FAILED";
  jsonPays += "~";
  jsonPays += "STATUS=FAILED";
  let htmlText = `<!DOCTYPE html>
            <html>
               <head>
                  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"> 
                  <title></title> 
               </head>
            <body>
            <input type="hidden" id="sdkResp" value="${jsonPays}" />
            </body></html>`;
  res.send(htmlText);
}
module.exports = router;