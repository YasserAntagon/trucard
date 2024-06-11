'use strict'
/*****************************
Author : Nikhil Bharambe
Date : 25 Aug 2021
Modify By : 
Modify Date : 
*****************************/
var request = require('request');
var conf = require("../config");
var request = require('request');
var tokenUpdate = require("../config/tokenUpdate");
var fs = require('fs');
var path = require('path');
var randomize = require('randomatic');
var _otp = require("../config/otpSendPaul");
let defaultConf = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../regionConf.json')));
// onboarding
var redisClient = require('../../redisClient');
var reqip = conf.reqip;
exports.fourHundred = function (req, res) {
  var mobile = req.body.mobile;
  var email = req.body.email ? req.body.email.toLowerCase() : req.body.email;
  var fname = req.body.fName ? req.body.fName.trim() : req.body.fName;
  var lname = req.body.lName ? req.body.lName.trim() : req.body.lName;
  var dob = req.body.dob;
  var gender = req.body.gender ? req.body.gender.toLowerCase() : "";
  var clientID = req.body.clientID;
  var rtruid = req.rtruid;
  var channel = req.MID, companyname = req.companyName;
  var letterNumber = /^[0-9]+$/;
  var enChar = /^[a-zA-Z0-9 ]+$/;
  if ((mobile && conf.fourHundredOne.mobile === "mandatory" && mobile.length === 10 && mobile.match(letterNumber)) &&
    (fname && conf.fourHundredOne.fName === "mandatory" && fname.length >= 0 && fname.match(enChar)) &&
    (lname && conf.fourHundredOne.lName === "mandatory" && lname.length >= 0 && lname.match(enChar))) {
    var password = "";
    if (req.body.dob) {
      let d = new Date(req.body.dob);
      if (d == "Invalid Date") {
        res.status(411).json({ status: "411", message: "Please provide valid DOB..!!" })
      }
      else if (gender && (gender == "male" || gender == "female" || gender == "other")) {
        if (email) {
          if (email.length >= 5 && email.length <= 50 && isemail(email)) {
            register();
          } else {
            res.status(411).json({ status: "411", message: "Please provide valid email..!!" })
          }
        } else {
          let r = Math.random().toString(36).substring(7); // create random string
          email = r + "_" + mobile + "@fake.company.com";
          register();
        }
      }
      else {
        res.status(411).json({ status: "411", message: "Please provide gender..!!" })
      }
    } else {
      res.status(411).json({ status: "411", message: "Please provide valid DOB..!!" })
    }

    function register() {
      if (fname.length > 4) {
        password = fname.toLowerCase().substring(0, 4);
      }
      else {
        password = fname.toLowerCase();
      }
      password += mobile.substring(6, 10);
      var jsonResponse = JSON.stringify({
        "email": email,
        "mobile": mobile,
        "password": password,
        "fname": fname,
        "mname": "",
        "lname": lname,
        "refernceid": rtruid,
        "channel": channel,
        "companyname": companyname,
        "dob": dob,
        "gender": gender,
        "clientid": clientID
      })
      request.post({
        "headers": { "content-type": "application/json" },
        "url": reqip + ":4112/api/clientconsumerregistration",
        "body": jsonResponse
      }, (error, response, body) => {
        if (error) {
          console.dir(error);
          res.status(500).json({ status: 500, message: "Internal server error" });
        }
        else if (response.statusCode === 200) {
          var newjson = JSON.parse(body);
          if (newjson.status == "1000") {
            res.json({ status: "1000", message: 'Consumer created successfully!', CRNNo: newjson.CRNNo, truID: newjson.truID });
          }
          else {
            if (newjson.status == "800") {
              res.json({ status: "1000", message: 'login successfully!', CRNNo: newjson.CRNNo, truID: newjson.truID });
            }
            else {
              res.json(newjson);
            }
          }
        } else {
          var newjson = JSON.parse(body);
          res.status(response.statusCode || 204).json(newjson)

        }
      }
      )
    }


  }
  else {
    res.status(411).json({ status: "411", message: "Please provide valid fields" })
  }
}
// generate HAsh
exports.fourHundredOne = function (req, res) {
  var CRNNo = req.CRNNo;
  var truID = req.truID;
  var token = randomize('Aa0!', 20);
  var queueId = Date.now().toString();
  redisClient.client.get(CRNNo, (err, result) => {
    if (result) {
      res.status(200).json({ status: "1000", token: result, queueId: queueId, CRNNo: CRNNo, truID: truID });
    }
    else {
      redisClient.client.set(CRNNo, token);
      res.status(200).json({ status: "1000", token: token, queueId: queueId, CRNNo: CRNNo, truID: truID });
    }
  })
}
// consumer profile
exports.fourHundredTwo = function (req, res) {
  var request = require('request');
  var crnNo = req.body.CRNNo;
  if (crnNo && crnNo.length >= 8 && crnNo.length <= 10) {
    request.post({
      "headers": { "content-type": "application/json" },
      "url": reqip + ":4112/api/clientprofile",
      "body": JSON.stringify({ "crnno": crnNo })
    }, (error, response, body) => {
      if (error) {
        res.status(500).json({ status: "500", message: "Internal server error" });
      }
      else {
        var newjson = JSON.parse(body);
        if (response.statusCode === 200) {
          if (newjson.status == "1000") {
            tokenUpdate(req);
          }
          res.status(200).json(newjson);
        }
        else {
          res.status(response.statusCode || 204).json(newjson);
        }
      }
    }
    )
  }
  else {
    res.status(411).json({ status: "411", message: 'Please provide valid fields..!!' })
  }
};
// Live Rate
exports.fourHundredThree = function (req, res) {
  var transactionType = req.body.transactionType,
    trasactionCharges = req.trasactionCharges,
    parentTruID = req.parentTruID;
  if (transactionType == "buy" || transactionType == "sell" || transactionType == "transfer") {
    request.post({
      "headers": { "content-type": "application/json" },
      "url": reqip + ":4125/api/assetmanagerForClient",
      "body": JSON.stringify({ "countryCode": defaultConf.defaultContryCode, "transactiontype": transactionType, "trasactionCharges": trasactionCharges, "rTruId": parentTruID })
    }, (error, response, body) => {
      if (error) {
        res.status(500).json({ status: "500", message: "Internal server error" });
      }
      else {
        if (response.statusCode == 200) {
          var jsonp = JSON.parse(body)
          if (jsonp.status == "1000") {
            tokenUpdate(req);
          }
          res.status(200).json(jsonp)
        }
        else {
          res.status(response.statusCode || 204).json(newjson)
        }
      }
    })
  }
  else {
    res.status(411).json({ status: "411", message: "Please provide valid fields" });
  }
}
//Buy
exports.fourHundredFour = function (req, res) {
  var CRNNo = req.body.CRNNo,
    transactiontype = req.body.transactionType,
    mop = req.body.MOP,
    status = req.body.status,
    clientID = req.body.clientID,
    invoice = req.body.invoice,
    bullionType = req.body.bullionType,
    value = req.body.value,
    partnerCharges = req.partnerCharges,
    nodeCharges = req.nodeCharges,
    trasactionCharges = req.trasactionCharges,
    isParent = req.isParent,
    parentTruID = req.parentTruID,
    rtruid = req.parentTruID,
    MID = req.MID;

  if ((CRNNo && conf.fourtyfive.CRNNo === "mandatory") &&
    (value && conf.fourtyfive.quantity === "mandatory" && parseFloat(value) > 0) &&
    (bullionType && conf.fourtyfive.bullionType === "mandatory" && (bullionType == "G24K" || bullionType == "S99P")) &&
    (status && conf.fourtyfive.status === "mandatory") &&
    (transactiontype && conf.fourtyfive.transactionType === "mandatory" && (transactiontype === "buy" || transactiontype === "buyCash")) &&
    (mop && conf.fourtyfive.MOP === "mandatory" && mop == "truWallet") &&
    (status && conf.fourtyfive.status === "mandatory" && (status == "failure" || status == "success"))) {
    request.post({
      "headers": { "content-type": "application/json" },
      "url": reqip + ":4114/api/clientbuybullions",
      "body": JSON.stringify({
        "crnno": CRNNo,
        "clientid": clientID,
        "rtruid": rtruid,
        "bulliontype": bullionType,
        "value": value,
        "transactiontype": transactiontype,
        "mop": mop,
        "status": status,
        "invoice": invoice ? invoice : "0",
        "astatus": "",
        "pgtype": "",
        "partnercharges": partnerCharges,
        "nodecharges": nodeCharges,
        "trasactionCharges": trasactionCharges,
        "isParent": isParent,
        "parentid": parentTruID,
        "MID": MID
      })
    }, (error, response, body) => {
      if (error) {
        res.status(500).json({ status: "500", message: "Internal server error" });
      }
      else {
        var newjson = JSON.parse(body);
        if (response.statusCode == 200) {
          if (newjson.resource) {
            if (newjson.resource.status == "success") {
              tokenUpdate(req);
            }
          }
          res.status(200).json(newjson);
        }
        else {
          res.status(response.statusCode || 204).json(newjson)
        }
      }
    })
  }
  else {
    res.status(411).json({ status: "411", message: "Please provide valid fields..!!" })
  }
}
//OTP
exports.fourHundredFive = function (req, res) {
  var CRNNo = req.body.CRNNo;
  var tType = req.body.type;
  if (CRNNo && (tType == "cBuy" || tType == "cSell" || tType == "cTransfer")) {
    request.post({
      "headers": { "content-type": "application/json" },
      "url": reqip + ":4123/api/generateotpforclient",
      "body": JSON.stringify({
        "crnno": CRNNo,
        "type": tType
      })
    }, (error, response, body) => {
      if (error) {
        res.status(500).json({ status: "500", message: "Internal server error" });
      }
      else {
        var newjson = JSON.parse(body);
        if (response.statusCode == 200) {
          if (newjson.status == "1000") {
            // call client OTP Server
            _otp.otpSendPaul(req, newjson, res)
          }
          else {
            res.status(200).json(newjson);
          }

        }
        else {
          res.status(response.statusCode || 204).json(newjson)
        }
      }
    })

  }
  else {
    res.status(411).json({ status: "411", message: "Please provide valid fields..!!" })
  }
}

//Sell
exports.fourHundredSix = function (req, res) {
  var clientID = req.body.clientID,
    bullionType = req.body.bullionType,
    CRNNo = req.body.CRNNo,
    value = req.body.value,
    accountno = req.body.accountno,
    modeofpay = req.body.modeofpay,
    accountdetails = req.accountdetails,
    mobile = req.mobile;
  var transactiontype = req.body.transactionType;
  var mop = req.body.MOP;
  var status = req.body.status;
  var invoice = req.body.invoice;
  var otp = req.body.otp;
  var partnerCharges = req.partnerCharges,
    nodeCharges = req.nodeCharges,
    trasactionCharges = req.trasactionCharges,
    isParent = req.isParent,
    parentTruID = req.parentTruID,
    rtruid = req.parentTruID,
    MID = req.MID;
  var UserArray = ["cQNSYFN5", "cG7FQHL6", "cDQLW2PQ", "c6AOBOWT", "c6VDLNQ7", "cAXJWODZ", "cY8PKIBY", "c3LC2MSP"];
  if (UserArray.includes(CRNNo)) {
    res.status(411).json({ status: "411", message: "Unable to perform transaction at this time." })
  } else {
    if ((CRNNo && conf.fourtyfive.CRNNo === "mandatory") &&
      (clientID && conf.fourtyfive.clientID === "mandatory") &&
      (value && conf.fourtyfive.quantity === "mandatory" && parseFloat(value) > 0) &&
      (bullionType && conf.fourtyfive.bullionType === "mandatory" && (bullionType == "G24K" || bullionType == "S99P")) &&
      (status && conf.fourtyfive.status === "mandatory") &&
      (transactiontype && conf.fourtyfive.transactionType === "mandatory" && (transactiontype === "sell" || transactiontype === "sellCash")) &&
      (mop && conf.fourtyfive.MOP === "mandatory" && mop === "truWallet") &&
      (status && conf.fourtyfive.status === "mandatory" && (status == "failure" || status == "success"))) {
      if (status == "success") {
        if (modeofpay) {
          if (modeofpay == "NEFT" || modeofpay == "IMPS") {
            if (mop == "payout" && accountno != "") {
              if (otp && otp.length == 6) {
                requestapi(otp);
              }
              else {
                res.status(411).json({ status: "411", message: "Invalid OTP" })
              }
            }
            else {
              res.status(411).json({ status: "411", message: "Please enter valid account number" })
            }
          }
          else {
            res.status(411).json({ status: "411", message: "Invalid mode of payment" })
          }
        }
        else if (mop == "payout") {
          if (mop == "payout" && accountno && accountno != "") {
            if (otp && otp.length == 6) {
              requestapi(otp);
            }
            else {
              res.status(411).json({ status: "411", message: "Invalid OTP" })
            }
          }
          else {
            res.status(411).json({ status: "411", message: "Please enter valid account number" })
          }
        }
        else {
          if (otp && otp.length == 6) {
            requestapi(otp);
          }
          else {
            res.status(411).json({ status: "411", message: "Invalid OTP" })
          }
        }
      }
      else {
        requestapi(otp);
      }
      function requestapi(otp) {

        request.post({
          "headers": { "content-type": "application/json" },
          "url": reqip + ":4114/api/clientredeembullionscash",
          "body": JSON.stringify({
            "crnno": CRNNo,
            "clientid": clientID,
            "rtruid": rtruid,
            "bulliontype": bullionType,
            "value": value,
            "transactiontype": transactiontype,
            "mop": mop,
            "status": status,
            "invoice": invoice ? invoice : "0",
            "astatus": "",
            "pgtype": "",
            "partnercharges": partnerCharges,
            "nodecharges": nodeCharges,
            "trasactionCharges": trasactionCharges,
            "isParent": isParent,
            "parentid": parentTruID,
            "accountdetails": accountdetails,
            "modeofpay": modeofpay,
            "otp": otp,
            "mobile": mobile,
            "MID": MID
          })
        }, (error, response, body) => {
          if (error) {
            res.status(500).json({ status: "500", message: "Internal server error" });
          }
          else {
            var newjson = JSON.parse(body);
            if (response.statusCode === 200) {
              if (newjson.resource) {
                if (newjson.resource.status == "success") {
                  tokenUpdate(req);
                }
              }
              res.status(200).json(newjson);
            }
            else {
              res.status(response.statusCode || 204).json(newjson);
            }
          }
        }
        )
      }
    } else {
      res.status(411).json({ status: "411", message: "Please provide valid fields..!!" })
    }
  }

}

//Transfer
exports.fourHundredSeven = function (req, res) {
  var clientID = req.body.clientID,
    bullionType = req.body.bullionType,
    CRNNo = req.body.CRNNo,
    toCRNNo = req.body.receiverCRNNo,
    quantity = req.body.quantity;

  var transactiontype = req.body.transactionType;
  var mop = req.body.MOP;
  var status = req.body.status;
  var invoice = req.body.invoice;

  var partnerCharges = req.partnerCharges,
    nodeCharges = req.nodeCharges,
    trasactionCharges = req.trasactionCharges,
    isParent = req.isParent,
    parentTruID = req.parentTruID,
    rtruid = req.parentTruID,
    MID = req.MID;

  if ((CRNNo && conf.fourtyfive.CRNNo === "mandatory") &&
    (toCRNNo && toCRNNo != "0") &&
    (clientID && conf.fourtyfive.clientID === "mandatory") &&
    (quantity && conf.fourtyfive.quantity === "mandatory" && parseFloat(quantity) > 0) &&
    (bullionType && conf.fourtyfive.bullionType === "mandatory" && (bullionType == "G24K" || bullionType == "S99P")) &&
    (status && conf.fourtyfive.status === "mandatory") &&
    (transactiontype && conf.fourtyfive.transactionType === "mandatory" && (transactiontype === "transfer" || transactiontype === "transferUnitByCash")) &&
    (mop && conf.fourtyfive.MOP === "mandatory") &&
    (status && conf.fourtyfive.status === "mandatory" && (status == "failure" || status == "success"))) {
    if (status == "success") {
      if (req.body.otp && req.body.otp.length == 6) {
        RequesTransfer()
      }
      else {
        res.status(411).json({ status: "411", message: "Please Enter Valid OTP" });
      }
    }
    else if (status == "failure") {
      RequesTransfer()
    }
    function RequesTransfer() {
      request.post({
        "headers": { "content-type": "application/json" },
        "url": reqip + ":4114/api/clienttransferbullion",
        "body": JSON.stringify({
          "crnno": CRNNo,
          "tocrnno": toCRNNo,
          "clientid": clientID,
          "rtruid": rtruid,
          "bulliontype": bullionType,
          "value": quantity,
          "transactiontype": transactiontype,
          "mop": mop,
          "status": status,
          "invoice": invoice ? invoice : "0",
          "astatus": "",
          "pgtype": "",
          "partnercharges": partnerCharges,
          "nodecharges": nodeCharges,
          "trasactionCharges": trasactionCharges,
          "isParent": isParent,
          "parentid": parentTruID,
          "otp": req.body.otp,
          "MID": MID
        })
      }, (error, response, body) => {
        if (error) {
          res.status(500).json({ status: "500", message: "Internal server error" });
        }
        else {
          var newjson = JSON.parse(body);
          if (response.statusCode === 200) {
            if (newjson.resource) {
              if (newjson.resource.status == "success") {
                tokenUpdate(req);
              }
            }
            res.status(200).json(newjson);
          } else {
            res.status(response.statusCode || 204).json(newjson);
          }
        }
      }
      )
    }


  }
  else {
    res.status(411).json({ status: "411", message: "Please provide valid fields..!!" })
  }
}

//Rate Log
exports.fourHundredEight = function (req, res) {
  var flag = req.body.flag;
  var clientID = req.body.clientID;
  var clientID = req.rtruid;
  var startDate = req.body.startDate;
  var endDate = req.body.endDate;
  if (flag == "date" || flag == "all") {
    if ((flag == "date" && (startDate || endDate)) || flag == "all") {
      if (flag == "all") {
        Date.prototype.addDays = function (days) {
          var dat = new Date(this.valueOf())
          dat.setDate(dat.getDate() + days);
          return dat;
        }
        endDate = new Date();
        startDate = new Date().addDays(-31);
        callLiveRateLog(startDate, endDate)
      }
      else if (flag == "date") {
        var startDate = Date.parse(req.body.endDate);
        var todaysDate = Date.parse(new Date());
        if (startDate > todaysDate) {
          res.status(411).json({ status: "411", message: "Please provide valid dates..!!" })
        }
        else {
          startDate = new Date(Date.parse(req.body.startDate));
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(Date.parse(req.body.endDate));
          endDate.setHours(0, 0, 0, 0);

          var Difference_In_Time = endDate.getTime() - startDate.getTime();
          var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
          if (Difference_In_Days > 31) {
            res.status(411).json({ status: "411", message: "Date different not more than 31 days" })
          }
          else {
            callLiveRateLog(startDate, endDate)
          }
        }
      }
      function callLiveRateLog() {
        request.post({
          "headers": { "content-type": "application/json" },
          "url": reqip + ":4125/api/assetmanagerratedailylogsdatewise",
          "body": JSON.stringify({ "truid": defaultConf.currentassetmanager, "clientID": clientID, "startdate": startDate, "enddate": endDate, "flag": flag })
        }, (error, response, body) => {
          if (error) {
            res.status(500).json({ status: "500", message: "Internal server error" });
          }
          else {
            var newjson = JSON.parse(body);
            if (response.statusCode === 200) {
              res.status(200).json(newjson);
            } else {
              res.status(response.statusCode || 204).json(newjson);
            }
          }
        })
      }
    }
    else {
      res.status(411).json({ status: "411", message: "Please provide valid dates..!!" })

    }
  }
  else {
    res.status(411).json({ status: "411", message: "Please provide valid flag..!!" })
  }
}
// transaction summary - consumer
exports.fourHundredNine = function (req, res) {
  var request = require('request');
  let clientID = req.body.clientID,
    CRNNo = req.body.CRNNo,
    startdate = req.body.startDate,
    enddate = req.body.endDate,
    top = req.body.top,
    rtruid = req.rtruid,
    dateflag = req.body.flag ? req.body.flag : "all";
  if (clientID && (dateflag == "all" || dateflag == "date")) {
    if (dateflag === "date") {
      if (startdate && enddate) {
        txnHistory();
      }
      else {
        res.status(411).json({
          status: "411",
          message: "Please provide valid dates..!!"
        });
      }
    }
    else {
      txnHistory();
    }
    function txnHistory() {

      request.post({
        "headers": { "content-type": "application/json" },
        "url": reqip + ":4114/api/clientConsumerSummary",
        "body": JSON.stringify({
          "rtruid": rtruid,
          "crnno": CRNNo,
          "clientid": clientID,
          "startdate": startdate,
          "enddate": enddate,
          "dateflag": dateflag,
          "top": top
        })
      }, (error, response, body) => {
        if (error) {
          res.status(500).json({ status: "500", message: "Internal server error" });
        }
        else {
          var newjson = JSON.parse(body);
          if (newjson.status == "1000") {
            tokenUpdate(req);
          }
          res.json(newjson);
        }
      });

    }
  }
  else {
    res.status(411).json({ status: "411", message: "Invalid Client Id" });
  }
}



// client Profile
exports.fourHundredFifteen = function (req, res) {
  var clientID = req.body.clientID;
  if (clientID) {
    request.post({
      "headers": { "content-type": "application/json" },
      "url": reqip + ":4121/api/clientlistprofile",
      "body": JSON.stringify({ "crnno": clientID })
    }, (error, response, body) => {
      if (error) {
        res.status(500).json({ status: "500", message: "Internal server error" });
      }
      else {
        var newjson = JSON.parse(body);
        if (response.statusCode == 200) {
          res.status(200).json(newjson);
        }
        else {
          res.status(response.statusCode || 204).json(newjson)
        }
      }
    })
  } else {
    res.status(411).json({
      status: "411",
      message: "Invalid Request..!!"
    });
  }
}

//Consumer list for mobility
exports.fourHundredSixteen = function (req, res) {
  let startdate = req.body.startDate,
    rtruid = req.rtruid,
    dateflag = req.body.dateFlag;

  request.post({
    "headers": { "content-type": "application/json" },
    "url": reqip + ":4112/api/clientconusumerList",
    "body": JSON.stringify({
      "truid": rtruid,
      "startdate": startdate,
      "dateflag": dateflag
    })
  }, (error, response, body) => {
    if (error) {
      res.status(500).json({ status: "500", message: "Internal server error" });
    }
    else {
      if (response.statusCode === 200) {
        var newjson = JSON.parse(body);
        res.status(200).json(newjson);
      } else {
        res.status(response.statusCode || 204).json({ newjson });
      }
    }
  }
  );

};

//Client Txn Summary
exports.fourHundredSeventeen = function (req, res) {
  var request = require('request');
  let CRNNo = req.body.CRNNo,
    rtruid = req.rtruid,
    startdate = req.body.startDate,
    enddate = req.body.endDate,
    dateflag = req.body.flag ? req.body.flag : "all";

  if ((dateflag == "all" || dateflag == "date" || dateflag == "consumer")) {
    if (dateflag === "date") {
      if (startdate && enddate) {
        walletHistory();
      }
      else {
        res.status(411).json({
          status: "411",
          message: "Please provide valid dates..!!"
        });
      }
    }
    else {
      walletHistory();
    }
    function walletHistory() {
      request.post({
        "headers": { "content-type": "application/json" },
        "url": reqip + ":4121/api/clientWalletHistory",
        "body": JSON.stringify({
          "truid": rtruid,
          "CRNNo": CRNNo,
          "startdate": startdate,
          "enddate": enddate,
          "dateflag": dateflag
        })
      }, (error, response, body) => {
        if (error) {
          res.status(500).json({ status: "500", message: "Internal server error" });
        }
        else {
          var newjson = JSON.parse(body);
          res.json(newjson);
        }
      });
    }
  }
  else {
    res.status(411).json({ status: "411", message: "Invalid Client Id" });
  }
}


exports.fourHundredEighteen = function (req, res) {
  var invoice = req.body.invoice;
  var tType = req.body.tType;
  var rtruid = req.rtruid;
  var clientID = req.body.clientID;
  var letterNumber = /^[0-9]+$/;
  if (tType == "revenue") {
    res.status(411).json({ "status": "411", "message": "No preview available" });
  }
  else if ((invoice && (invoice.length >= 8 && invoice.length <= 30) && invoice.match(letterNumber)) &&
    (tType == "transfer" || tType == "buy" || tType == "buyCash" || tType == "sell" )) {
    request.post({
      "headers": { "content-type": "application/json" },
      "url": reqip + ":4114/api/clientconsumerReceipt",
      "body": JSON.stringify({
        "truid": rtruid,
        "clientId": clientID,
        "invoice": invoice,
        "ttype": tType
      })
    }, (error, response, body) => {
      if (error) {
        res.status(500).json({ status: "500", message: "Internal server error" });
      }
      else {
        var newjson = JSON.parse(body);
        res.json(newjson);
      }
    }
    )

  } else {
    res.status(411).json({ status: "411", message: "Please provide valid fields..!!" })
  }
}

exports.fourHundredTwentyfour = function (req, res) { 
    var receiver = req.body.receiver;
    var truid = req.truID;

    if (receiver && receiver.length == 10 && truid && truid.length == 16) {
      request.post({
        "headers": { "content-type": "application/json" },
        "url": reqip + ":4112/api/finduser",
        "body": JSON.stringify({
          "mobile": receiver,
          "truid": truid
        })
      }, (error, response, body) => {
        if (error) {
          return console.dir(error);
        }
        var newjson = JSON.parse(body);
        res.json(newjson);
      });
    } else {
      res.json({
        status: "411",
        message: 'Invalid request..!!'
      }
      )}
};
function isemail(email) {
  var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  return regex.test(email);
}