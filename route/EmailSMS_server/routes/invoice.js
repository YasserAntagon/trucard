var express = require('express');
var router = express.Router();
var hbs = require('nodemailer-express-handlebars');
require('dotenv').config();
const request = require("request")
const sendMail = require("../config/sendMail")
var emailRoute = require('../db/emailRoute');
const sendSMS = require("../model/sendsms");
var enprof = process.env.cdn + '/1044?url=';

// class AmountCalc extends Array {
//   sum(key) {
//     return this.reduce((a, b) => parseFloat(a) + parseFloat(b[key] || 0), 0);
//   }
// }
function decimalChopper(num, fixed) {
  var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?');
  return num.toString().match(re)[0];
}

function formateDate(datef) {
  let date = new Date(datef);
  var day = date.getDate();
  var month = date.getMonth();

  var year = date.getFullYear();
  var monthNames = [
    "Jan", "Feb", "Mar",
    "Apr", "May", "Jun", "Jul",
    "Aug", "Sep", "Oct",
    "Nov", "Dec"
  ];
  return monthNames[month] + ' ' + ((day > 9) ? day : '0' + day) + ', ' + year;
}
const channelArr = process.env.channelArr;
router.post('/SendTransactionMailSMS', (req, res, next) => {
  try {
    console.log("resource", JSON.stringify(req.body))
    console.log("bearer", JSON.stringify(req.headers.authorization))
    console.log("bearer", process.env.token3)
    var bearer = req.headers.authorization;
    var array = bearer.split(" ");
    if (array[1] != process.env.token3) {
      res.json({ status: "401", message: "Unauthorized user!" });                         //token validations
    } else {
      var requrl = process.env.adminip + "/api/consumergstreport";
      if (req.body.isPartner) {
        requrl = process.env.adminip + "/api/entitygstreportadminNEW";
      }
      var options = {
        uri: requrl,
        method: 'POST',
        json: {
          to: req.body.truID,
          invoice: req.body.invoice,
          getStock: true,
          status: "success"

        } // All the information that needs to be sent
      };
      request(options, async function (error, response, apirespbody) {
        if (error) {
          res.send({ status: "500", message: "Internal Server Error" });
        } else {
          if (apirespbody.recordsFiltered > 0) {
            if (channelArr.includes(apirespbody.data[0].channel)) {
              var resource = await jsonBulider(apirespbody.data[0], req.body.bankTXNID)
              if (apirespbody.data[0].emailVerified) {
                var sendmailId;
                emailRoute.insertEmailLog({ resource: resource, status: "failure", txnby: "consumer" }, function (data) {
                  sendmailId = data.id
                })
                let templateFile = "sendInvoice"
                var options = {
                  uri: process.env.ip + `/template/emailInv/${templateFile}`,
                  method: 'POST',
                  json: {
                    "resource": resource
                  }
                };
                request(options, function (error, response, body) {
                  let subject = 'Transaction Successful - ' + resource.invoice;
                  var emailsobj = {
                    mailTo: resource.email
                  }
                  res.send(body);
                  // sendMail.sendEmail(emailsobj, body, subject, function (info) {
                  //   emailRoute.updateEmailLog(sendmailId, "success");
                  //   res.send(info);
                  // })
                })
              } else {
                res.json({ status: 200 })
              }
              var msg = sendsms(resource);
              var jsons;
              switch (resource.type) {
                case "buy":
                  jsons = {
                    "From": "TruCrd",
                    "To": resource.mobile,
                    "TemplateName": "truFBuyBullion",
                    "VAR1": msg,
                    "VAR2": resource.orderdate,
                    "VAR3": resource.invoice,
                    "VAR4": "enquiry : " + process.env.infoUser
                  }
                  break;
                case "Sell":
                  jsons = {
                    "From": "TruCrd",
                    "To": resource.mobile,
                    "TemplateName": "SendUnitT",
                    "VAR1": msg,
                    "VAR2": resource.orderdate,
                    "VAR3": resource.invoice,
                    "VAR4": avaibaleQtyMsg(resource, resource.consumerStock),
                    "VAR5": "enquiry : " + process.env.infoUser
                  }
                  break;
                case "transfer":
                  var jsonArr = [];
                  jsonArr.push({
                    "From": "TruCrd",
                    "To": resource.receiverMobile,
                    "TemplateName": "receiveUnit",
                    "VAR1": msg,
                    "VAR2": resource.createDate,
                    "VAR3": resource.consumerName,
                    "VAR4": resource.invoice,
                    "VAR5": avaibaleQtyMsg(resource, resource.receiverStock),
                    "VAR6": "enquiry : " + process.env.infoUser
                  })
                  jsonArr.push({
                    "From": "TruCrd",
                    "To": resource.mobile,
                    "TemplateName": "SendUnitT",
                    "VAR1": msg,
                    "VAR2": resource.createDate,
                    "VAR3": resource.invoice,
                    "VAR4": avaibaleQtyMsg(resource, resource.consumerStock),
                    "VAR5": "enquiry : " + process.env.infoUser
                  })
                  jsons = jsonArr;
                  break;

                default:
                  break;
              }
              // res.send(jsons);
              console.log(jsons);
              if (Array.isArray(jsons)) {
                jsons.forEach(element => {
                  sendsmses(element)
                })
              } else {
                sendsmses(jsons)
              }
              function sendsmses(injson) {
                sendSMS.sendsms(JSON.stringify(injson), function (err, response) {
                  // res.json({ status: 200 })
                })
              }
            } else {
              res.send({ status: "204", message: "Email and SMS not Sent" });
            }

          } else {
            res.send({ status: "204", message: "Something Went wrong" });
          }
        }
      })
    }
  } catch (err) {
    return res.status(500).send({
      "error": {
        "message": "Something went wrong"
      }
    });
  }
})

function jsonBulider(resource, txnId) {
  var fdate = FormatDateToString(resource.createDate, "time");
  resource.status = resource.status == "failure" ? "Failed" : resource.status;
  var mop = resource.MOP;
  if (resource.MOP == "offline") {
    // mop = "Paid on Counter";
    mop = `<strong>Paid by: Paid on Counter </strong><br>`;
  }
  else if ((resource.type == "buy" || resource.type == "transfer") ) {
    // mop = "Paid on Counter";
    mop = `<strong>Paid by: Paid on Counter </strong><br>`;
  }
  else if (resource.type == "redeemCash" ) {
    mop = `<strong>Paid by: Cash </strong><br>`;
  }
  else if (resource.type == "redeemCash" && resource.MOP == "truwallet") {
    mop = `<strong>Credited In : truWallet </strong><br>`;
  }
  else if (resource.type == "redeemCash" && resource.MOP == "others") {
    mop = `<strong><strong>Paid by : Bank Transfer (${String(resource.payBy)}) </strong><br>Bank TXN ID : ${String(resource.bankTXNID)}</strong> </br>`
  }
  else if (resource.MOP == "truWallet") {
    mop = `<strong>Paid by : truWallet </strong><br>`;
  }
  else if (resource.MOP == "others") {
    mop = `<strong>Paid By : ${String(resource.payBy)}</strong> <br><strong>Bank TXN ID : ${String(resource.bankTXNID)} </strong><br><br>`;
  }
  else {
    mop = `<strong>Paid by: ${(String(mop))} </strong><br>`;
  }
  resource.to = replaceWithX(resource.to);
  resource.orderdate = fdate.date + fdate.time;
  resource.isTransfer = false;
  resource.subTotal = `<td style="padding:10px;border: 1px solid #eceeef;" >
  <strong style="float:right">Subtotal&nbsp;:</strong></td>
  <td style="padding:10px;border: 1px solid #eceeef;" ><span style="float: right;">
  ₹&nbsp;`+ resource.amount + `</span>
  </td>`;
  if (resource.applicableTAX && resource.applicableTAX != "0") {
    resource.charges = `<tr><td style="padding:10px;border: 1px solid #eceeef;"><strong style="float:right;">GST/TAX&nbsp;(` + resource.applicableTAX + "%" + `)&nbsp;: </strong></td><td style="padding:10px;border: 1px solid #eceeef;" ><span style="float: right;">₹&nbsp;` + resource.tax + `</span></td></tr>`;
  }
  if (resource.type == "redeemCash") {
    if (resource.status == "success") {
      resource.GSTIN = `<strong>GSTIN: 07AAFCT6383H2ZZ</strong><br>`;
      resource.subMessage = resource.MOP == "others" && resource.MOP == "other" ? "We will be nofity once transaction is completed successfully.Amount will be credited in your linked bank account." : "";
      resource.message = `<strong>₹&nbsp;` + resource.totalAmount + ` amount successfully credited </strong>`;
      if (resource.MOP === "others") {
        resource.bankTXNID = `<strong>Bank TXN ID :  <span>` + txnId + `</span></strong><br> `;
      };
    };
    resource.isRedeem = true;
    resource.Paidby = mop;
  }
  else if (resource.type == "conversion") {
    var btype = "";
    resource.isConversion = true;
    var G24KQty = resource.product.filter(item => item.bullionType === "G24K")[0];
    var S99PQty = resource.product.filter(item => item.bullionType === "S99P")[0];
    resource.subTotal = null;
    resource.totalAmount = resource.amount;
    if (resource.conversionFrom == "G24K") {
      resource.rate = G24KQty.rate;
      // resource.amount = G24KQty.amount;
      btype = `<div class="row"><div class="col-md-4 text-center" style="padding: 2px;">
          <img  src='images/gold.png'  alt='TruGold' title='TruGold' width='30px' height='30px' /><br />
          <label class='label label-g18' title='TruGold'>TruGold</label><br />
          `+ G24KQty.qty + ` gms
          </div>
          <div class="col-md-2">
          <i class='fa fa-arrow-right' style='text-align:center;padding:2px' /></div>
          <div class="col-md-4 text-center" style="padding: 2px;">
          <img  src='images/silver.png'  alt='TruSilver' title='TruSilver' width='30px' height='30px' /><br />
          <label class='label label-s99' title='TruSilver'>TruSilver</label><br />
          `+ S99PQty.qty + ` gms 
          </div></div>`;
      if (resource.status == "success") {
        resource.message = `<strong>Converted ` + G24KQty.qty + ` gms of TruGold to ` + S99PQty.qty + ` gms TruSilver</strong>`;
      }
    } else if (resource.conversionFrom == "S99P") {
      resource.rate = S99PQty.rate;
      // resource.amount = S99PQty.amount;
      resource.totalAmount = resource.amount;
      btype = `<div class="row"><div class="col-md-4 text-center" style="padding: 2px;">
          <img  src='images/silver.png'  alt='TruSilver' title='TruSilver' width='30px' height='30px' /><br />
          <label class='label label-s99' title='TruSilver'>TruSilver</label><br />
          `+ S99PQty.qty + ` gms
          </div>
          <div class="col-md-2">
          <i class='fa fa-arrow-right' style='text-align:center;padding:2px' /></div>
          <div class="col-md-4 text-center" style="padding: 2px;">
          <img  src='images/gold.png'  alt='TruGold' title='TruGold' width='30px' height='30px' /><br />
          <label class='label label-g18' title='TruGold'>TruGold</label><br />
          `+ G24KQty.qty + ` gms
          </div></div>`;
      if (resource.status == "success") {
        resource.message = `<strong>Converted ` + S99PQty.qty + ` gms of TruSilver to ` + G24KQty.qty + ` gms TruGold</strong>`;
      }
    }
    resource.Paidby = mop;
    resource.abType = btype;
  }
  else if (resource.type == "transfer") {
    resource.isTransfer = true;
    resource.receiverName = resource.receiverName;
    var ereceiverTruID = resource.receiverTruID;
    resource.Paidby = mop;
    resource.receiverTruID = replaceWithX(resource.receiverTruID);
    var status = (resource.flag == "sender") ? " sent to " + resource.receiverName : " received from " + resource.consumerName
    resource.message = `<strong> ${String(resource.exQty)} gms of ${String(resource.productType)} ${String(status)} </strong>`;
    resource.totalAmount = resource.amount;
    resource.subTotal = null;
  }
  else {
    resource.isRedeem = false;
    if (resource.status == "success") {
      resource.GSTIN = `<strong>GSTIN: 07AAFCT6383H2ZZ</strong><br>`;
      resource.Paidby = mop;
      resource.message = `<strong>₹&nbsp;` + resource.totalAmount + ` amount successfully paid</strong>`;
    }
  }
  resource.type = resource.type == "redeemCash" ? "Sell" : resource.type;
  resource.isbrandLogo = resource.brandLogo ? true : false;
  resource.isbrandpath = resource.brandLogo ? process.env.logoUrl + "/4099?url=" + resource.brandLogo : "";
  resource.infavour = (resource.sourceFlag === "remmit") ?
    `<tr><td colspan="6"><p class="ralignpad pull-right" style="float: right;">
    <b style="float: right;"> eReceipt is prepared by the ${(String(resource.companyName))}</b>
    <br />
    <span class="text text-info pull-right" style="float: right;color: #47b8c6 ">By Company Name
    </p></td></tr>` :
    `<tr><td colspan="6"><p class="ralignpad pull-right" style="float: right;">
    <b style="float: right;"> eReceipt is prepared by,</b>
    <br />
    <span class="text text-info pull-right" style="float: right;color: #47b8c6 "> Company Name
    </p></td></tr>`;

  const product = (productmp) => {
    return productmp.map(item => {
      item.title = (item.bullionType === "G24K") ? "TruGold" : "TruSilver";
      item.path = (item.bullionType === "G24K") ? "/images/gold.png" : "/silver.png";
      item.from = replaceWithX(item.from);
      return item
    })
  }
  resource.product = product(resource.product)
  // console.log(resource)
  return resource
  /*   var invoice = {
        "data": [resource]
    };
    var list = $("#invoicetmp").html();
    var html = Mustache.to_html(list, invoice);
    $(".invoice").html(html);
    $("#viewinvLoader").fadeOut("slow"); */
}
function FormatDateToString(datef, format) {
  let date = new Date(datef);
  var day = date.getDate();
  var month = date.getMonth();
  var year = date.getFullYear();
  var monthNames = [
    "Jan", "Feb", "Mar",
    "Apr", "May", "Jun", "Jul",
    "Aug", "Sep", "Oct",
    "Nov", "Dec"
  ];
  if (format == 'time') {
    var min = date.getMinutes();
    var hours = date.getHours();
    var hours12 = hours % 12;
    var hours = hours ? hours : 12; // the hour '0' should be '12'
    var ampm = hours >= 12 ? 'PM' : 'AM';
    var dateFormat = {
      time: ((hours12 > 9) ? hours12 : '0' + hours12) + ":" + ((min > 9) ? min : '0' + min) + "" + ampm,
      date: ((day > 9) ? day : '0' + day) + monthNames[month] + ' ' + year
    }
    return dateFormat;
  }
}
function replaceWithX(str) {
  if (str) {
    return str.replace(/.(?=.{4})/g, 'x');
  } else {
    return str;
  }
}
module.exports = router;

function sendsms(resource) {
  var ttype = resource.txnType, quantity = "";
  if (resource.txnType === "Buy" || resource.txnType === "buyCash") {
    ttype = "Buy";
  } else if (resource.txnType === "Redeem Cash" || resource.txnType === "redeemCash") {
    ttype = "Sell";
  }
  resource.product.forEach(element => {
    quantity += element.qty + " gms of " + element.title + ", ";
  });
  quantity = quantity.substring(0, quantity.length - 2);
  // var sms = 'Hi ' + resource.name + '! ' + 'Your Transaction of ' + ttype +
  //   ' has been successful with ' + quantity + '.'
  return quantity
}
function avaibaleQtyMsg(resource, stocks) {
  var quantity = "";
  resource.product.forEach(element => {
    quantity += decimalChopper(stocks[element.bullionType], 4) + " gms of " + element.title + ", ";
  });
  quantity = quantity.substring(0, quantity.length - 2);
  // var sms = 'Hi ' + resource.name + '! ' + 'Your Transaction of ' + ttype +
  //   ' has been successful with ' + quantity + '.'
  return quantity
}