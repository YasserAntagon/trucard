var transLog = require("../../model/buybulDB");
var failpay = require("./b2batomlog");
let for_Logs = require('../../model/for_Logs_details');
module.exports = {
    submitBuyDirectInvoiceMobile: function (res, dataRes, atomPay, response, atomType) {
        try {
            var g24json = new Array();
            var s99json = new Array();
            var g24k = dataRes.particularsG24[0].qty;
            if (g24k != 0) {
                g24arr = {
                    "assetmanagerName": dataRes.particularsG24[0].assetmanagerName,
                    "amTruID": dataRes.particularsG24[0].from,
                    "qty": g24k
                }
                g24json.push(g24arr)
            }

            var g99k = dataRes.particularsS99[0].qty;
            if (g99k != 0) {
                s99arr = {
                    "assetmanagerName": dataRes.particularsS99[0].assetmanagerName,
                    "amTruID": dataRes.particularsS99[0].from,
                    "qty": g99k
                }
                s99json.push(s99arr)
            }

            var buyData =
            {
                "toTruID": dataRes.to,
                "invoice": dataRes.invoice,
                "status": "success",
                "aStatus": "Ok",
                "transactionType": "buy",
                "G24K": g24json,
                "S99P": s99json,
                "MOP": "others"
            }
            if (response && response.userType == "B2BConsumer") {
                buyData.rTruID = dataRes.rTruID
            }
            var that = this;
            transLog.submitDirectBullionDb(JSON.stringify(buyData), response.userType, function (err, reg) {
                if (response && response.device == "B2CWEB") {
                    that.webSuccessResponse(res, atomPay, response, reg, atomType);
                }
                else if (response && response.device == "B2CAPP") {
                    that.successResponse(res, atomPay, atomType);
                }
            })
        } catch (ex) {
            failpay.failpay(res)
        }
    },
    addMoneyUpdate: function (res, atomPay, response, atomType) {
        try {
            var jsonkey = JSON.stringify({
                "CRNNo": atomPay.CUST_ID,
                "amount": (parseFloat(atomPay.AMOUNT) / 100).toString(),
                "invoice": atomPay.ORDER_ID
            });
            var that = this;
            for_Logs.addMoney(jsonkey, atomType, function (err, a) { // Add money to wallet   
                if (response && response.device == "B2CWEB") {
                    var responseURL = response.responseURL;
                    var jsonresp = {
                        "RESPONSE_CODE": atomPay.RESPONSE_CODE,
                        "RESPONSE_MESSAGE": atomPay.RESPONSE_MESSAGE,
                        "STATUS": atomPay.STATUS,
                        "ORDER_ID": atomPay.ORDER_ID,
                        "tType": "addMoney",
                        "host": responseURL,

                    }
                    res.render('b2cWEBresponse', {
                        "pgurl": jsonresp
                    });
                }
                else if (response && response.device == "B2CAPP") {
                    that.successResponse(res, atomPay, atomType);
                }
            })
        } catch (ex) {
            failpay.failpay(res)
        }
    },
    addMoneyUpdateATOM: function (res, data, response, type) {
        try {
            var jsonkey = JSON.stringify({
                "CRNNo": response.CRNNo,
                "amount": data.amt.toString(),
                "invoice": data.mer_txn
            });
            var that = this;
            for_Logs.addMoney(jsonkey, type, function (err, a) { // Add money to wallet   
                if (response && response.device == "B2CWEB") {
                    var responseURL = response.responseURL;
                    var jsonresp = {
                        "RESPONSE_CODE": "000",
                        "RESPONSE_MESSAGE": "SUCCESS",
                        "STATUS": "Captured",
                        "ORDER_ID": data.mer_txn,
                        "tType": "addMoney",
                        "host": responseURL
                    }
                    res.render('b2cWEBresponse', { "pgurl": jsonresp });
                }
                else if (response && response.device == "B2CAPP") {
                    that.successResponse(res, data, type);
                }
            })
        } catch (ex) {
            failpay.failpay(res)
        }
    },
    successResponse: function (res, resatomPay, atomType) {
        var text = "Failed";
        var reason = ""
        var check = "✖"
        var message = "Your payment is failed."
        var color = "red";
        var jsonPays = "RESPONSE_CODE=1";
        jsonPays += "~";
        jsonPays += "RESPONSE_MESSAGE=FAILED";
        jsonPays += "~";
        jsonPays += "STATUS=FAILED";
        var amount = "0";
        amount = resatomPay.amt;
        if (resatomPay.f_code == "Ok") {
            color = "#88B04B";
            text = "Success";
            check = "✓";
            message = "We sucessfully received your payment ;<br/> Thanks for connecting with us !";
            reason = 'SUCCESS';
            jsonPays = "RESPONSE_CODE=000";
            jsonPays += "~";
            jsonPays += "RESPONSE_MESSAGE=SUCCESS";
            jsonPays += "~";
            jsonPays += "STATUS=Captured";
        }
        else {
            reason = "Payment Failure"
        }
        var TXN_ID = atomPay.mer_txn;
        var RESPONSE_DATE_TIME = atomPay.date

        var htmlpage = `<html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link href="https://fonts.googleapis.com/css?family=Nunito+Sans:400,400i,700,900&display=swap" rel="stylesheet">
        </head>
          <style>
            body {
              text-align: center;
              padding: 0px 0;
              background: #EBF0F5;
            }
            td {
        width:50%,
        height: 30px;
        text-align: left;
      }
              h1 {
                color: ${color};
                font-family: "Nunito Sans", "Helvetica Neue", sans-serif;
                font-weight: 900;
                font-size: 40px;
                margin-bottom: 10px;
              }
              p {
                color: #404F5E;
                font-family: "Nunito Sans", "Helvetica Neue", sans-serif;
                font-size:20px;
                margin: 0;
              }
            i {
              color: ${color};
              font-size: 80px;
              line-height: 140px;
              margin-left:-15px;
            }
            .card {
              background: white;
              padding: 20px;
              border-radius: 4px;
              box-shadow: 0 2px 3px #C8D0D8;
              display: inline-block;
              margin: 0 auto;
            }
          </style>
          <body>
            <div class="card">
            <div style="border-radius:150px; height:150px; width:150px; background: #F8FAF5; margin:0 auto;">
              <i class="checkmark">${check}</i>
            </div>
              <h1>${text}</h1>  
              <p>${message}</p> 
              <input type="hidden" id="sdkResp" value="${jsonPays}" />
              <table border="1">
                <tr>
                  <td>Bank Txn ID : </td>
                  <td>${TXN_ID}</td>
                  </tr>
                <tr> 
                  <td>Amount : </td>
                  <td>${amount}</td>
                </tr> 
                <tr>
                <td>Date : </td>
                <td>${RESPONSE_DATE_TIME}</td> 
              </tr>
                <tr>
                <td>Status : </td>
                <td>${reason}</td> 
              </tr> 
              </table>
            </div>
          </body>
      </html>`;
        res.send(htmlpage);
    },
    webSuccessResponse: function (res, atomPay, response, reg) {
        if (response && response.device == "B2CWEB") {
            var jsonresp = {
                "RESPONSE_CODE": atomPay.RESPONSE_CODE ? atomPay.RESPONSE_CODE : (atomPay.f_code === "Ok") ? "000" : "401",
                "RESPONSE_MESSAGE": atomPay.RESPONSE_MESSAGE ? atomPay.RESPONSE_MESSAGE : (atomPay.f_code === "Ok") ? "SUCCESS" : "FAILED",
                "STATUS": atomPay.STATUS ? atomPay.STATUS : (atomPay.f_code === "Ok") ? "Captured" : "Err",
                "ORDER_ID": atomPay.ORDER_ID ? atomPay.ORDER_ID : atomPay.mer_txn,
                "tType": response.tType,
                "host": response.responseURL
            }
            res.render('b2cWEBresponse', { pgurl: jsonresp, output: reg });
        }
        else if (response && response.device == "B2CAPP") {
            this.successResponse(res, atomPay);
        }
    }
}
