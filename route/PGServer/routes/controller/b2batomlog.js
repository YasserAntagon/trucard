let b2cAPP = require('./b2bController');
var transLogB2B = require("../../model/b2b/buybulDB");
var cryptos = require('crypto');
var password = '~*Su655rya*~';
module.exports = {
    decrypt: function (text) {
        var decipher = cryptos.createDecipher('aes-256-ctr', password)
        var dec = decipher.update(text, 'hex', 'utf8')
        dec += decipher.final('utf8');
        return dec;
    },
    submitAtomLogB2B: async function (res, data) {
        var responseURL = "";
        try {
            var desc = data.f_code == "F" ? "Payment Failure" : data.desc;
            if (data.f_code == "Ok") {
                desc = "Payment Success"
            }
            var cardno = "0";
            var email = "0";
            var uname = "0";
            var mobile = "0";
            var udf4 = "0";
            var dataf = [];

            var resource;
            if (data.discriminator == "CC" || data.discriminator == "DC") {
                cardno = data.CardNumber;
            }
            if (data.udf1) {
                uname = data.udf1
            }
            if (data.udf2) {
                email = data.udf2
            }
            if (data.udf3) {
                mobile = data.udf3
            }
            if (data.udf9) {
                dataf = await this.decrypt(data.udf9).split("~");
                udf4 = dataf[0];
                udf9 = dataf[1];
                responseURL = dataf.length > 3 ? dataf[4] : "";
                resource = {
                    "truID": udf9,
                    "userType": dataf[2],
                    "device": dataf[3],
                    "responseURL": dataf.length > 3 ? dataf[4] : ""
                }
            }

            var json = JSON.stringify({
                "atomID": data.mmp_txn,
                "invoice": data.mer_txn,
                "bankTxnID": data.bank_txn,
                "amount": data.amt,
                "surcharge": data.surcharge,
                "prodID": data.prod,
                "aStatus": data.f_code,
                "customerTruID": udf9,
                "bankName": data.bank_name,
                "atomMOP": data.discriminator,
                "cardNumber": cardno,
                "failureReason": desc,
                "date": data.date,
                "userName": uname,
                "email": email,
                "mobile": mobile,
                "address": "0",
                "tType": udf4,
                "invoiceAmount": data.amt
            });
            var that = this;
            transLogB2B.submitAtomLog(json, function (err, resp) {
                var typeofpay = udf4;
                if (data.f_code == "Ok") {
                    try {
                        if (typeofpay == "addMoney") {
                            b2cAPP.addMoneyUpdateATOM(res, data, resource, "atom")
                        } 
                    } catch (ex) {
                        resource.tType = typeofpay
                        that.failpay(res)
                    }
                }
                else {
                    resource.tType = typeofpay
                    that.failpay(res)
                }
            });

        } catch (ex) {
            this.failpay(res)
        }
    },
    failpay: function (res) {
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
}