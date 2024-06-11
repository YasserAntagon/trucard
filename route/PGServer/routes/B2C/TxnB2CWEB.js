var express = require('express');
var router = express.Router(); 
let buybulDB = require('../../model/buybulDB');
var sha = require('../../sha');
let atompath = require('../../model/config/atomkey.json');
var password = '~*Su655rya*~';
var cryptos = require('crypto');
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
function decimalChopper(num, fixed) {
    var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?');
    return num.toString().match(re)[0];
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
router.post('/atomSubmitInvoiceWEB', function (req, res, next) {
    var cc = req.body;
    var originURL = req.get('origin');
    try {
        let inputString = '';
        inputString += "AMOUNT";
        inputString += '=';
        inputString += cc.AMOUNT;
        inputString += '~';
        inputString += "CRNNo";
        inputString += '=';
        inputString += cc.CRNNo;
        inputString += '~';
        inputString += "CUST_EMAIL";
        inputString += '=';
        inputString += cc.CUST_EMAIL;
        inputString += '~';
        inputString += "CUST_MOBILE";
        inputString += '=';
        inputString += cc.CUST_MOBILE;
        inputString += '~';
        inputString += "CUST_NAME";
        inputString += '=';
        inputString += cc.CUST_NAME;
        inputString += '~';
        inputString += "ORDER_ID";
        inputString += '=';
        inputString += cc.ORDER_ID;
        inputString += '~';
        inputString += "tType";
        inputString += '=';
        inputString += cc.tType;
        var sha512str = sha.hash(inputString);
        if (sha512str !== cc.HASH) {
            var jsonresp = {
                "RESPONSE_CODE": "411",
                "RESPONSE_MESSAGE": "Invalid hash",
                "STATUS": "FAILED",
                "ORDER_ID": "0",
                "tType": cc.tType,
                "host": cc.responseURL
            }
            res.render('b2cWEBresponse', {
                pgurl: jsonresp
            });
        }
        else {
                var amount = decimalChopper(parseFloat(cc.AMOUNT), 2);
                var udf1 = cc.CUST_NAME;
                var udf2 = cc.CUST_EMAIL;
                var udf3 = cc.CUST_MOBILE;
                var udf4 = cc.type;
                var key = atompath.hashkey;
                var transid = cc.ORDER_ID;  // invoice number
                var custacc = cc.CRNNo;
                var json = JSON.stringify({
                    "customerTruID": custacc,
                    "invoice": transid,
                    "surcharge": "0",
                    "tType": cc.tType,
                    "amount": amount,
                    "custName": cc.CUST_NAME,
                    "invoiceAmount": amount,
                    "responseCode": "401",
                    "aStatus": "Pending",
                    "failureReason": "Transaction Initiated",
                    "email": cc.CUST_EMAIL,
                    "mobile": cc.CUST_MOBILE
                });
                buybulDB.submitaddmoneyTransLog(json, function (err, response) {
                    if (response.status == "200") {
                        var final = (Buffer.from(custacc).toString('base64'));
                        var UserType = cc.UserType ? cc.UserType : "consumer";
                        var encryptText = cc.tType + "~" + cc.CRNNo + "~" + UserType + "~" + "B2CWEB" + "~" + originURL + cc.responseURL;
                        var udf9 = encrypt(encryptText);
                        let returnPath = "/atom/truPaymentResponse";
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
                            "tType": cc.tType,
                            "host": cc.responseURL
                        }
                        res.render('b2cWEBresponse', {
                            pgurl: jsonresp
                        });
                    }
                })

        }
    }
    catch (ex) {
        var jsonresp = {
            "RESPONSE_CODE": "411",
            "RESPONSE_MESSAGE": "Invalid hash",
            "STATUS": "FAILED",
            "ORDER_ID": "0",
            "tType": cc.tType,
            "host": cc.responseURL
        }
        res.render('b2cWEBresponse', {
            pgurl: jsonresp
        });
    }
});

module.exports = router;

function decimalChopper(num, fixed) {
    var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?');
    return num.toString().match(re)[0];
}