
'use strict'

const fs = require('fs'),
  path = require('path'),
  sha = require('../sha'),
  conf = require("../config"),
  request = require('request'),
  { encryption } = require("../encryption"),
  kycEnKey = "~*MyINSPL@66Devi*~";


var token = conf.bearer,
  token1 = conf.bearer1,
  token2 = conf.bearer2,
  token3 = conf.bearer3,
  token4 = conf.bearer4,
  token7 = conf.bearer7,
  token8 = conf.bearer8,
  token9 = conf.bearer9,
  token10 = conf.bearer10,
  token11 = conf.bearer11,
  token12 = conf.bearer12,
  token13 = conf.bearer13,
  token14 = conf.bearer14,
  token20 = conf.bearer20,
  token21 = conf.bearer21,
  token22 = conf.bearer22,
  token23 = conf.bearer23,
  token24 = conf.bearer24,
  token25 = conf.bearer25,
  token26 = conf.bearer26,
  token27 = conf.bearer27,
  token28 = conf.bearer28,
  token29 = conf.bearer29,
  token30 = conf.bearer30,
  token31 = conf.bearer31,
  token32 = conf.bearer32,
  token33 = conf.bearer33,
  token34 = conf.bearer34,
  token35 = conf.bearer35,
  token57 = conf.bearer57,
  token58 = conf.bearer58,
  token59 = conf.bearer59,
  reqip = conf.reqip,
  pgServer = conf.pgServer;



function generateHash(data) {
  var valArray = new Array(),
    nameArray = new Array();
  Object.keys(data).forEach(key => {
    valArray.push(data[key]);
    nameArray.push(key);
  });
  nameArray.sort();
  let inputString = "";
  for (let j = 0; j < nameArray.length; j++) {
    var element = nameArray[j];
    inputString += '~';
    inputString += element;
    inputString += '=';
    inputString += data[element];
  }

  inputString = inputString.substr(1);
  console.log("inputString", inputString)
  var signHash = sha.hash(inputString);
  return signHash;
}


exports.test = function (req, res) {
  var ua = req.headers['user-agent'].toLowerCase();
  res.json({ message: "Welcome to Company Customer Api.", "res": ua });
};

const letterNumber = /^[0-9]+$/,
  dateval = /^((0?[1-9]|1[012])[-](0?[1-9]|[12][0-9]|3[01])[-](19|20|21)?[0-9]{2})*$/,
  decimalNumber = /^\d+\.?\d{0,10}$/;
function isemail(email) {
  var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  return regex.test(email);
}
exports.eleven = function (req, res) {
  var bearer = req.headers.authorization;
  var array = bearer.split(" ");
  if (array[1] != token) {
    res.json({ status: "401", message: "Unauthorized user!" });
  } else {

    var username = req.body.userName;
    var password = req.body.password;

    if ((username && conf.eleven.userName === "mandatory" && username.length >= 5 && username.length <= 48) &&
      (password && conf.eleven.password === "mandatory")) {
      if (isemail(username)) {
        var maildoc = (username).split("@");
        if (maildoc[1] != "fake.company.com") {
          login()
        }
        else {
          res.json({
            status: "204", message: "Please Enter valid Email Address..!!"
          });
        }
      }
      else {
        login()
      }

      function login() {
        request.post({
          "headers": { "content-type": "application/json" },
          "url": reqip + ":4112/api/login",
          "body": JSON.stringify({
            "username": username,
            "password": password
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          res.json(newjson);
        });
      }

    } else {
      res.json({
        status: "411",
        message: 'Please Follow Fields Validation Documentation, your JSON structure is incorrect.',
      }
      )
    }
  }
};


exports.forteen = function (req, res) {
  var bearer = req.headers.authorization;
  var array = bearer.split(" ");
  if (array[1] != token1) {
    res.json({ status: "401", message: "Unauthorized user!" });
  } else {


    var truid = req.body.truID;
    var searchflag = req.body.searchFlag;
    var letterNumber = /^[0-9]+$/;

    if (truid && conf.fourteen.truID === "mandatory" && truid.length >= 10 && truid.length <= 16 && truid.match(letterNumber)) {

      request.post({
        "headers": { "content-type": "application/json" },
        "url": reqip + ":4112/api/listProfile",
        "body": JSON.stringify({
          "truid": truid,
          "searchflag": searchflag
        })
      }, (error, response, body) => {
        if (error) {
          return console.dir(error);
        }
        var newjson = JSON.parse(body);
        res.json(newjson);
      }
      )
    } else {
      res.json({
        status: "411",
        message: 'Please Follow Fields Validation Documentation, your JSON structure is incorrect.'
      }
      )
    }
  }
};



exports.twentyseven = function (req, res) {

  var bearer = req.headers.authorization;
  var array = bearer.split(" ");

  if (array[1] != token3) {
    res.json({ status: "401", message: "Unauthorized user!" });
  } else {

    var truid = req.body.truID;
    var letterNumber = /^[0-9]+$/;

    if ((truid && conf.twentyseven.truID === "mandatory" && truid.length == 16 && truid.match(letterNumber))) {
      request.post({
        "headers": { "content-type": "application/json" },
        "url": reqip + ":4113/fetchAccount",
        "body": JSON.stringify({
          "truID": truid
          // "acctype": acctype
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
        message: 'Please Follow Fields Validation Documentation, your JSON structure is incorrect.'
      }
      )
    }
  }
};



exports.thirty = function (req, res) {

  var bearer = req.headers.authorization;
  var array = bearer.split(" ");

  if (array[1] != token4) {
    res.json({ status: "401", message: "Unauthorized user!" });
  } else {

    var truid = req.body.truID;
    var flag = req.body.flag;
    var flagArr = ["redeem"];
    if ((truid && conf.thirty.truID === "mandatory" && truid.length == 16 && truid.match(letterNumber)) &&
      (flag && conf.thirty.flag === "mandatory" && flagArr.includes(flag))) {
      request.post({
        "headers": { "content-type": "application/json" },
        "url": reqip + ":4114/v1/api/topassetmanagers",
        "body": JSON.stringify({
          "truid": truid,
          "assetmanagersearch": flag
        })
      }, (error, response, body) => {
        if (error) {
          return console.dir(error);
        }
        var newjson = JSON.parse(body);
        if(newjson.status=="200")
        {
          
          if(newjson.resource.topG24K && newjson.resource.topG24K.length>0)
          {
            newjson.resource.topG24K[0].G24Kgross ? delete newjson.resource.topG24K[0].G24Kgross : undefined;
            newjson.resource.topG24K[0].stockG24K ? delete newjson.resource.topG24K[0].stockG24K : undefined;
          }
          if(newjson.resource.topS99P && newjson.resource.topS99P.length>0)
          {
            newjson.resource.topS99P[0].S99Pgross ? delete newjson.resource.topS99P[0].S99Pgross : undefined;
            newjson.resource.topS99P[0].stockS99P ? delete newjson.resource.topS99P[0].stockS99P : undefined;
          } 
        }
        res.json(newjson);
      });
    } else {
      res.json({
        status: "411",
        message: 'Please Follow Fields Validation Documentation, your JSON structure is incorrect.'
      }
      )
    }
  }



};


exports.thirtyone = function (req, res) {
  var bearer = req.headers.authorization;
  var array = bearer.split(" ");

  if (array[1] != token4) {
    res.json({ status: "401", message: "Unauthorized user!" });
  } else {
    var truid = req.body.truID;
    if (truid && conf.thirtyone.truID === "mandatory" && truid.length == 16 && truid.match(letterNumber)) {
      request.post({
        "headers": { "content-type": "application/json" },
        "url": reqip + ":4114/v1/api/topassetmanagers",
        "body": JSON.stringify({
          "truid": truid,
          "assetmanagersearch": "purchase"
        })
      }, (error, response, body) => {
        if (error) {
          return console.dir(error);
        }
        var newjson = JSON.parse(body);
        if(newjson.status=="200")
        {
          
          if(newjson.resource.topG24K && newjson.resource.topG24K.length>0)
          {
            newjson.resource.topG24K[0].G24Kgross ? delete newjson.resource.topG24K[0].G24Kgross : undefined;
            newjson.resource.topG24K[0].stockG24K ? delete newjson.resource.topG24K[0].stockG24K : undefined;
          }
          if(newjson.resource.topS99P && newjson.resource.topS99P.length>0)
          {
            newjson.resource.topS99P[0].S99Pgross ? delete newjson.resource.topS99P[0].S99Pgross : undefined;
            newjson.resource.topS99P[0].stockS99P ? delete newjson.resource.topS99P[0].stockS99P : undefined;
          } 
        }
        res.json(newjson);
      });
    } else {
      res.json({
        status: "411",
        message: 'Please Follow Fields Validation Documentation, your JSON structure is incorrect.'
      }
      )
    }
  }
};

exports.thirtysix = function (req, res) {

  var bearer = req.headers.authorization;
  var array = bearer.split(" ");

  if (array[1] != token7) {
    res.json({ status: "401", message: "Unauthorized user!" });
  } else {


    var totruid = req.body.toTruID,
      fromtruid = req.body.fromTruID,
      g24qty = req.body.G24qty,
      s99qty = req.body.S99qty,
      transactiontype = req.body.transactionType,
      mop = req.body.MOP,
      status = req.body.status,
      astatus = req.body.aStatus,
      invoice = req.body.invoice,
      pgtype = req.body.PGType,
      letterNumber = /^[0-9]+$/;

    if ((totruid && conf.thirtysix.toTruID === "mandatory" && totruid.length == 16 && totruid.match(letterNumber)) &&
      (fromtruid && conf.thirtysix.fromTruID === "mandatory" && (fromtruid === "0" || fromtruid.length == 16) && fromtruid.match(letterNumber)) &&
      (g24qty && conf.thirtysix.G24qty === "mandatory" && parseFloat(g24qty) >= 0) &&
      (s99qty && conf.thirtysix.S99qty === "mandatory" && parseFloat(s99qty) >= 0) &&
      (transactiontype && conf.thirtysix.transactionType === "mandatory" && (transactiontype === "transfer" || transactiontype === "gift")) &&
      (mop && conf.thirtysix.MOP === "mandatory" && mop.length >= 0 && mop.length <= 10) &&
      (status && conf.thirtysix.status === "mandatory" && status.length >= 0 && status.length <= 7) &&
      (invoice && conf.thirtysix.invoice === "mandatory" && invoice.length >= 0 && invoice.length <= 20)) {
      if (status === "success" && mop == "others") {
        if (pgtype) {
          sednreq()
        } else {
          res.json({
            status: "411",
            message: 'Please Follow Fields Validation Documentation'
          })
        }
      } else {
        sednreq();
      }

      function sednreq() {
        request.post({
          "headers": { "content-type": "application/json" },
          "url": reqip + ":4114/v1/api/transferbullion",
          "body": JSON.stringify({
            "totruid": totruid,
            "fromtruid": fromtruid,
            "g24qty": g24qty,
            "s99qty": s99qty,
            "transactiontype": transactiontype,
            "mop": mop,
            "status": status,
            "astatus": astatus,
            "invoice": invoice,
            "pgtype": pgtype
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          //console.dir(JSON.parse(body));
          res.json(newjson);
        });
      }
    } else {
      res.json({
        status: "411",
        message: 'Please Follow Fields Validation Documentation'
      }
      )
    }
  }
};


exports.fourtytwo = function (req, res) {
  var bearer = req.headers.authorization;
  var array = bearer.split(" ");
  if (array[1] != token11) {
    res.json({ status: "401", message: "Unauthorized user!" });                         //token validations
  } else {


    let mobile = req.body.mobile,
      email = req.body.email,
      isemailverification = req.body.isEmailVerification ? true : false,
      type = req.body.type,
      appflag = req.body.appFlag;
    var letterNumber = /^[0-9]+$/;
    var typeArray = ["MPIN", "device", "mobile", "transaction", "fPassword", "registration", "accountverify", "cBuy", "cSell", "walletToBank", "resetPassword", "emailRegistration"];

    if (((mobile && conf.fourtytwo.mobile === "mandatory" && mobile.length === 10 && mobile.match(letterNumber)) || (email && isemail(email))) &&
      (type && typeArray.includes(type) && conf.fourtytwo.type === "mandatory") &&
      (conf.fourtytwo.appFlag === "notmandatory")) {
      if (type == "registration") {
        sendOTP();
      }
      else if (type == "mobile") {
        request.post({
          "headers": { "content-type": "application/json" },
          "url": reqip + ":4112/api/consumervalidation",
          "body": JSON.stringify({
            "mobile": mobile,
            "email": email
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          if (newjson.status == "400") {
            request.post({
              "headers": { "content-type": "application/json" },
              "url": reqip + ":4123/api/generateotpforremmit",
              "body": JSON.stringify({
                "isemailverification": req.body.isEmailVerification ? true : false,
                "email": email,
                "mobile": mobile,
                "type": type
              })
            }, (error, response, body) => {
              if (error) {
                return console.dir(error);
              }
              var newjson = JSON.parse(body);
              res.json(newjson);
            });
          }
          else {
            res.json({
              "status": "400",
              "message": "Consumer already exists!"
            })
          }
        });
      }
      else if (type == "cSell" || type == "walletToBank") {
        var inpuuri = "/v1/api/walletToBankValidation"
        if (type == "cSell") { inpuuri = "/v1/api/validateSellToBanklimits" }
        request.post({
          "headers": { "content-type": "application/json" },
          "url": reqip + ":4114" + inpuuri,
          "body": JSON.stringify({
            "mobile": req.body.mobile,
            "amt": req.body.amt
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          } else {
            if (response.statusCode == 200) {
              var newjson = JSON.parse(body);
              if (newjson.status === "200") {
                sendOTP()
              } else {
                res.json(newjson)
              }
            } else {
              res.json({
                status: "500",
                message: 'Internal Server Error'
              })
            }
          }


        });
      } else {
        var json = { email: email, mobile: mobile };
        if (req.body.type == "device" || req.body.type == "fPassword") {
          json.ftype = req.body.type;
        }
        request.post({
          "headers": { "content-type": "application/json" },
          "url": reqip + ":4112/api/consumervalidation",
          "body": JSON.stringify(json)
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          if (newjson.status == 200) {
            request.post({
              "headers": { "content-type": "application/json" },
              "url": reqip + ":4123/api/generateotpforremmit",
              "body": JSON.stringify({
                "isemailverification": req.body.isEmailVerification ? true : false,
                "email": email,
                "mobile": mobile,
                "name": newjson.name,
                "type": type
              })
            }, (error, response, body) => {
              if (error) {
                return console.dir(error);
              }
              var newjson = JSON.parse(body);
              res.json(newjson);
            });
          }
          else {
            var newjson = JSON.parse(body);
            res.json(newjson);
          }
        });
      }

      function sendOTP() {
        request.post({
          "headers": { "content-type": "application/json" },
          "url": reqip + ":4123/api/generateotpforremmit",
          "body": JSON.stringify({
            "mobile": req.body.mobile,
            "email": req.body.email,
            "detail": "detail",
            "type": req.body.type,
            "isemailverification": isemailverification,
            "appflag": req.body.appflag
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          //console.dir(JSON.parse(body));
          res.json(newjson);
        }
        )
      }
    }
    else {
      res.json({
        status: "411",
        message: 'Please Follow Fields Validation Documentation'
      }
      )
    }
  }
}

exports.fourtythree = function (req, res) {

  var bearer = req.headers.authorization;
  var array = bearer.split(" ");

  if (array[1] != token11) {
    res.json({ status: "401", message: "Unauthorized user!" });
  } else {


    var mobile = req.body.mobile,
      email = req.body.email,
      otp = req.body.OTP;
    var letterNumber = /^[0-9]+$/;

    if (((mobile && conf.fourtythree.mobile === "mandatory" && mobile.length === 10 && mobile.match(letterNumber) || (email && isemail(email)))) &&
      (otp && conf.fourtythree.OTP === "mandatory" && otp.length === 6 && otp.match(letterNumber))) {
      request.post({
        "headers": { "content-type": "application/json" },
        "url": reqip + ":4123/api/verifyotpremmit",
        "body": JSON.stringify({
          "mobile": mobile,
          "email": email,
          "otp": otp
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
        message: 'Please Follow Fields Validation Documentation, your JSON structure is incorrect.'
      }
      )
    }
  }
};

exports.fourtynine = function (req, res) {
  var bearer = req.headers.authorization;
  var array = bearer.split(" ");

  if (array[1] != token12) {
    res.json({ status: "401", message: "Unauthorized user!" });
  } else {


    var truid = req.body.truID,
      invoice = req.body.invoice,
      amtval = req.body.amount,
      pgflag = req.body.PGFlag;
    var amt = parseFloat(req.body.amount);
    var letterNumber = /^[0-9]+$/;
    if ((truid && conf.fourtynine.truID === "mandatory" && truid.length == 16 && truid.match(letterNumber)) &&
      (invoice && conf.fourtynine.invoice === "mandatory" && invoice.length >= 0 && invoice.length <= 20) &&
      (pgflag && conf.fourtynine.PGFlag === "mandatory" && (pgflag === "atom")) &&
      (amt && conf.fourtynine.amount === "mandatory" && amtval.length <= 9)) {
      request.post({
        "headers": { "content-type": "application/json" },
        "url": reqip + ":4114/api/addmoney",
        "body": JSON.stringify({
          "truid": truid,
          "amt": amt,
          "invoice": invoice,
          "pgflag": pgflag
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
        message: 'Please Follow Fields Validation Documentation, your JSON structure is incorrect.'
      }
      )
    }
  }
};


exports.fifty = function (req, res) {
  var bearer = req.headers.authorization;
  var array = bearer.split(" ");

  if (array[1] != token) {
    res.json({ status: "401", message: "Unauthorized user!" });
  } else {


    var truid = req.body.truID;
    var oldpassword = req.body.oldPassword;
    var newpassword = req.body.newPassword;
    var letterNumber = /^[0-9]+$/;

    if ((truid && conf.fifty.truID === "mandatory" && truid.length == 16 && truid.match(letterNumber)) &&
      (oldpassword && conf.fifty.oldPassword === "mandatory" && oldpassword.length >= 6 && oldpassword.length <= 16) &&
      (newpassword && conf.fifty.newPassword === "mandatory" && newpassword.length >= 6 && newpassword.length <= 16)) {
      request.post({
        "headers": { "content-type": "application/json" },
        "url": reqip + ":4112/api/updatepassword",
        "body": JSON.stringify({
          "truid": truid,
          "oldpassword": oldpassword,
          "newpassword": newpassword
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
        message: 'Please Follow Fields Validation Documentation, your JSON structure is incorrect.'
      }
      )
    }
  }
};


exports.fiftyone = function (req, res) {
  var bearer = req.headers.authorization;
  var array = bearer.split(" ");
  if (array[1] != token) {
    res.json({ status: "401", message: "Unauthorized user!" });
  } else {


    var mobile = req.body.mobile;
    var newpassword = req.body.newPassword;
    var letterNumber = /^[0-9]+$/;

    if ((mobile && conf.fiftyone.mobile === "mandatory") &&
      (newpassword && conf.fiftyone.newPassword === "mandatory" && newpassword.length >= 6 && newpassword.length <= 16)) {
      request.post({
        "headers": { "content-type": "application/json" },
        "url": reqip + ":4112/api/changepassword",
        "body": JSON.stringify({
          "mobile": mobile,
          "newpassword": newpassword
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
        message: 'Please Follow Fields Validation Documentation, your JSON structure is incorrect.'
      }
      )
    }
  }
};


exports.sixtyeight = function (req, res) {
  var bearer = req.headers.authorization;
  var array = bearer.split(" ");

  if (array[1] != token9) {
    res.json({ status: "401", message: "Unauthorized user!" });
  } else {

    var receiver = req.body.receiver,
      truid = req.body.truID;

    if ((receiver && conf.sixtyeight.receiver === "mandatory" && receiver.length >= 0 && receiver.length <= 50) &&
      (truid && conf.sixtyeight.truID === "mandatory" && truid.length == 16 && truid.match(letterNumber))) {
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
        message: 'Please Follow Fields Validation Documentation, your JSON structure is incorrect.'
      }
      )
    }
  }
};




exports.seventy = function (req, res) {
  var bearer = req.headers.authorization;
  var array = bearer.split(" ");

  if (array[1] != token14) {
    res.json({ status: "401", message: "Unauthorized user!" });
  } else {

    var invoice = req.body.invoice;
    var atomid = req.body.atomID;
    var banktxnid = req.body.bankTxnID;
    var amount = req.body.amount;
    var invoiceamount = req.body.invoiceAmount;
    var surcharge = req.body.surcharge;
    var prodid = req.body.prodID;
    var astatus = req.body.aStatus;
    var customertruid = req.body.customerTruID;
    var bankname = req.body.bankName;
    var atommop = req.body.atomMOP;
    var cardnumber = req.body.cardNumber;
    var failurereason = req.body.failureReason;
    var username = req.body.userName;
    var email = req.body.email;
    var mobile = req.body.mobile;
    var address = req.body.address;
    var ttype = req.body.tType;
    var date = req.body.date;
    var letterNumber = /^[0-9]+$/;

    if ((customertruid && conf.seventy.customerTruID === "mandatory") &&
      (ttype && conf.seventy.tType === "mandatory" && ttype.length >= 0 && ttype.length <= 11) &&
      (amount && conf.seventy.amount === "mandatory" && amount.length >= 0 && amount.length <= 9) &&
      (astatus && conf.seventy.aStatus === "mandatory" && astatus.length >= 0 && astatus.length <= 10) &&
      (invoiceamount && conf.seventy.invoiceAmount === "mandatory" && invoiceamount.length >= 0 && invoiceamount.length <= 9) &&
      (surcharge && conf.seventy.surcharge === "mandatory" && surcharge.length >= 0 && surcharge.length <= 20) &&
      (conf.seventy.failureReason === "notmandatory") &&
      (conf.seventy.email === "notmandatory") &&
      (conf.seventy.mobile === "notmandatory")) {
      request.post({
        "headers": { "content-type": "application/json" },
        "url": reqip + ":4114/api/insatomlog",
        "body": JSON.stringify({
          "invoice": invoice,
          "atomid": atomid,
          "banktxnid": banktxnid,
          "amount": amount,
          "invoiceamount": invoiceamount,
          "surcharge": surcharge,
          "prodid": prodid,
          "astatus": astatus,
          "customertruid": customertruid,
          "bankname": bankname,
          "atommop": atommop,
          "cardnumber": cardnumber,
          "failurereason": failurereason,
          "username": username,
          "email": email,
          "mobile": mobile,
          "address": address,
          "ttype": ttype,
          "date": date

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
        message: 'Please Follow Fields Validation Documentation, your JSON structure is incorrect.'
      }
      )
    }
  }
};


exports.eightynine = function (req, res) {

  var bearer = req.headers.authorization;
  var array = bearer.split(" ");

  if (array[1] != token20) {
    res.json({ status: "401", message: "Unauthorized user!" });
  } else {


    var totruid = req.body.toTruID;
    var g24k = req.body.G24K;
    var s99p = req.body.S99P;
    var transactiontype = req.body.transactionType;
    var mop = req.body.MOP;
    var status = req.body.status;
    var invoice = req.body.invoice;
    var astatus = req.body.aStatus;
    var pgtype = req.body.PGType;
    var letterNumber = /^[0-9]+$/;

    if ((totruid && conf.eightynine.toTruID === "mandatory" && totruid.length == 16 && totruid.match(letterNumber)) &&
      (g24k && conf.eightynine.G24K === "mandatory" && Array.isArray(g24k) == true) &&
      (s99p && conf.eightynine.S99P === "mandatory" && Array.isArray(s99p) == true) &&
      (transactiontype && conf.eightynine.transactionType === "mandatory" && transactiontype === "buy") &&
      (mop && conf.eightynine.MOP === "mandatory" && mop.length >= 0 && mop.length <= 10) &&
      (status && conf.eightynine.status === "mandatory" && status.length >= 0 && status.length <= 7) &&
      (invoice && conf.eightynine.invoice === "mandatory" && invoice.length >= 0 && invoice.length <= 20) &&
      (astatus && conf.eightynine.aStatus === "mandatory" && astatus.length >= 0 && astatus.length <= 10) &&
      (pgtype && conf.eightynine.PGType === "notmandatory")) {

      request.post({
        "headers": { "content-type": "application/json" },
        "url": reqip + ":4114/v1/api/buybullionsmultipleassetmanagers",
        "body": JSON.stringify({
          "totruid": totruid,
          "G24K": g24k,
          "S99P": s99p,
          "transactiontype": transactiontype,
          "mop": mop,
          "status": status,
          "invoice": invoice,
          "astatus": astatus,
          "pgtype": pgtype
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
        message: 'Please Follow Fields Validation Documentation, your JSON structure is incorrect.'
      }
      )
    }
  }
}



exports.ninety = function (req, res) {

  var bearer = req.headers.authorization;
  var array = bearer.split(" ");

  if (array[1] != token20) {
    res.json({ status: "401", message: "Unauthorized user!" });
  } else {


    var totruid = req.body.toTruID;
    var g24k = req.body.G24K;
    var s99p = req.body.S99P;
    var transactiontype = req.body.transactionType;
    var mop = req.body.MOP;
    var status = req.body.status;
    var invoice = req.body.invoice;
    var modeofpay = req.body.ModeOFPay;
    var accountno = req.body.accountNo;
    var BlockedUsers = [];
    var letterNumber = /^[0-9]+$/; 
    if ((totruid && conf.ninety.toTruID === "mandatory" && totruid.length == 16 && totruid.match(letterNumber)) &&
      (g24k && conf.ninety.G24K === "mandatory" && Array.isArray(g24k) == true) &&
      (s99p && conf.ninety.S99P === "mandatory" && Array.isArray(s99p) == true) &&
      (transactiontype && conf.ninety.transactionType === "mandatory" && transactiontype === "redeemCash") &&
      (mop && conf.ninety.MOP === "mandatory" && mop.length >= 0 && mop.length <= 10) &&
      (status && conf.ninety.status === "mandatory" && status.length >= 0 && status.length <= 7) &&
      (invoice && conf.ninety.invoice === "mandatory" && invoice.length >= 0 && invoice.length <= 20)) {
      if (status === "success" && req.body.MOP == "others") {
        if (modeofpay && accountno) {
          if (modeofpay === "IMPS") {
            res.json({
              status: "411",
              message: 'IMPS Temporary Disabled.'
            });
          } else if (BlockedUsers.includes(accountno)) {
            res.json({
              status: "411",
              message: 'This account block because of previous negative balance.'
            });
          } else if (modeofpay === "NEFT" || modeofpay === "UPI") {
            requestapi();
          } else {
            res.json({
              status: "411",
              message: 'Please Follow Fields Validation Documentation, your JSON structure is incorrect.'
            }
            )
          }
        }
        else
        {
          res.json({
            status: "411",
            message: 'Invalid Request.'
          }
          )
        }
      }
      else {
        requestapi();
      }
      function requestapi() {
        request.post({
          "headers": { "content-type": "application/json" },
          "url": reqip + ":4114/v1/api/redeemcashmultipleassetmanagers",
          "body": JSON.stringify({
            "totruid": totruid,
            "G24K": g24k,
            "S99P": s99p,
            "transactiontype": transactiontype,
            "mop": mop,
            "status": status,
            "invoice": invoice,
            "modeofpay": modeofpay,
            "accountno": accountno
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          res.json(newjson);
        });
      }
    } else {
      res.json({
        status: "411",
        message: 'Please Follow Fields Validation Documentation, your JSON structure is incorrect.'
      }
      )
    }
  }
}


exports.hundredeight = function (req, res) {
  var bearer = req.headers.authorization;
  var array = bearer.split(" ");

  if (array[1] != token25) {
    res.json({ status: "401", message: "Unauthorized user!" });
  } else {
    // 

    let email = req.body.email,
      mobile = req.body.mobile,
      letterNumber = /^[0-9]+$/;
    if (email || (mobile && mobile.match(letterNumber))) {
      request.post({
        "headers": { "content-type": "application/json" },
        "url": reqip + ":4112/api/consumervalidation",
        "body": JSON.stringify(req.body)
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
        message: 'Please Follow Fields Validation Documentation, your JSON structure is incorrect.'
      }
      )
    }
  }
}




exports.hundredthirteen = function (req, res) {
  var bearer = req.headers.authorization;
  var array = bearer.split(" ");
  if (array[1] != token) {
    res.json({ status: "401", message: "Unauthorized user!" });
  } else {


    var mobile = req.body.mobile;
    var email = req.body.email;
    var mpin = req.body.mPIN;
    var letterNumber = /^[0-9]+$/;

    if (((mobile && conf.hundredthirteen.mobile === "mandatory" && mobile.length == 10 && mobile.match(letterNumber)) || (email && isemail(email))) &&
      (mpin && conf.hundredthirteen.mPIN === "mandatory" && mpin.length == 6)) {
      request.post({
        "headers": { "content-type": "application/json" },
        "url": reqip + ":4112/api/changeMPIN",
        "body": JSON.stringify(req.body)
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
        message: 'Please Follow Fields Validation Documentation, your JSON structure is incorrect.'
      }
      )
    }
  }
};

exports.hundredfourteen = function (req, res) {
  var bearer = req.headers.authorization;
  var array = bearer.split(" ");
  if (array[1] != token) {
    res.json({ status: "401", message: "Unauthorized user!" });
  } else {

    var username = req.body.userName;
    var password = req.body.password;
    var deviceHash = req.headers.devicehash;
    var mpin = req.body.mPIN;
    if ((username && conf.hundredfourteen.userName === "mandatory" && username.length >= 5 && username.length <= 48)) {
      if (password && conf.hundredfourteen.password === "notmandatory" && password.length >= 6 && password.length <= 16) {
        reqLogin("pass");
      }
      else if (mpin && conf.hundredfourteen.mPIN === "notmandatory" && mpin.length == 6) {
        reqLogin("mpin")
      }
      else {
        res.json({ status: "411", message: 'Please follow fields validation documentation, your JSON structure is incorrect.' });
      }
      function reqLogin(flag) {
        var pwd = mpin;
        if (flag === "pass") {
          pwd = password;
        }
        request.post({
          "headers": { "content-type": "application/json" },
          "url": reqip + ":4112/api/loginmobility",
          "body": JSON.stringify({
            "username": username,
            "pwd": pwd,
            "flag": flag,
            "deviceID": deviceHash
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          res.json(newjson);
        });
      }
    } else {
      res.json({ status: "411", message: 'Please Follow Fields Validation Documentation, your JSON structure is incorrect.' });
    }
  }
};



exports.hundredfifteen = function (req, res) {
  var bearer = req.headers.authorization;
  var array = bearer.split(" ");

  if (array[1] != token28) {
    res.json({ status: "401", message: "Unauthorized user!" });
  } else {
    let truid = req.body.truID,
      skip = req.body.skip,
      letterNumber = /^[0-9]+$/;
    if ((truid && conf.hundredfifteen.truID === "mandatory" && truid.length == 16 && truid.match(letterNumber)) &&
      (skip && conf.hundredfifteen.skip === "mandatory" && skip.match(letterNumber))) {

      request.post({
        "headers": { "content-type": "application/json" },
        "url": reqip + ":4114/api/recenttransfers",
        "body": JSON.stringify(req.body)
      }, (error, response, body) => {
        if (error) {
          return console.dir(error);
        }
        var newjson = JSON.parse(body);
        //console.dir(JSON.parse(body));
        res.json(newjson);
      }
      )
    } else {
      res.json({
        status: "411",
        message: 'Please Follow Fields Validation Documentation'
      }
      )
    }
  }
}


exports.hundredsixteen = function (req, res) {
  var bearer = req.headers.authorization;
  var array = bearer.split(" ");

  if (array[1] != token11) {
    res.json({ status: "401", message: "Unauthorized user!" });
  } else {

    var mobile = req.body.mobile,
      type = req.body.type;
    var letterNumber = /^[0-9]+$/;

    if ((mobile && conf.hundredsixteen.mobile === "mandatory" && mobile.length === 10 && mobile.match(letterNumber)) &&
      (type && conf.hundredsixteen.type === "mandatory" && (type === "registration" || type === "MPIN" || type === "fPassword"))) {
      if (type === "registration") {
        request.post({
          "headers": { "content-type": "application/json" },
          "url": reqip + ":4123/api/generateotpmobility",
          "body": JSON.stringify({
            "mobile": mobile,
            "type": type
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          res.json(newjson);
        });
      }
      else {
        request.post({
          "headers": { "content-type": "application/json" },
          "url": reqip + ":4112/api/consumervalidation",
          "body": JSON.stringify({
            "mobile": mobile
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          if (newjson.status == 200) {
            request.post({
              "headers": { "content-type": "application/json" },
              "url": reqip + ":4123/api/generateotpmobility",
              "body": JSON.stringify({
                "mobile": mobile,
                "type": type
              })
            }, (error, response, body) => {
              if (error) {
                return console.dir(error);
              }
              var newjson = JSON.parse(body);
              res.json(newjson);
            });
          }
          else {
            res.json({
              "status": "400",
              "message": "Consumer not exists!"
            })
          }
        });
      }

    } else {
      res.json({
        status: "411",
        message: 'Please Follow Fields Validation Documentation, your JSON structure is incorrect.'
      }
      )
    }
  }
};



exports.hundredseventeen = function (req, res) {

  var bearer = req.headers.authorization;
  var array = bearer.split(" ");

  if (array[1] != token11) {
    res.json({ status: "401", message: "Unauthorized user!" });
  } else {


    var mobile = req.body.mobile,
      otp = req.body.OTP,
      type = req.body.type,
      letterNumber = /^[0-9]+$/;

    if ((mobile && conf.hundredseventeen.mobile === "mandatory" && mobile.length === 10 && mobile.match(letterNumber)) &&
      (otp && conf.hundredseventeen.OTP === "mandatory" && otp.length === 6 && otp.match(letterNumber)) &&
      (type && conf.hundredseventeen.type === "mandatory" && (type === "registration" || type === "MPIN" || type === "fPassword" || type === "accountverify"))) {
      request.post({
        "headers": { "content-type": "application/json" },
        "url": reqip + ":4123/api/verifyotpmobility",
        "body": JSON.stringify({
          "mobile": mobile,
          "otp": otp,
          "type": type
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
        message: 'Please Follow Fields Validation Documentation, your JSON structure is incorrect.'
      }
      )
    }
  }
};




exports.hundrednineteen = function (req, res) {
  var bearer = req.headers.authorization;
  var array = bearer.split(" ");

  if (array[1] != token21) {
    res.json({ status: "401", message: "Unauthorized user!" });
  } else {
    let truid = req.body.truID,
      startdate = req.body.startDate,
      dateflag = req.body.dateFlag,
      letterNumber = /^[0-9]+$/;
    if ((truid && conf.hundrednineteen.truID === "mandatory" && truid.length == 16 && truid.match(letterNumber)) &&
      (conf.hundrednineteen.startDate === "notmandatory") &&
      (conf.hundrednineteen.dateFlag === "notmandatory")) {
      request.post({
        "headers": { "content-type": "application/json" },
        "url": reqip + ":4116/api/shownotificationstimestamp",
        "body": JSON.stringify({
          "notifyto": truid,
          "startdate": startdate,
          "dateflag": dateflag
        })
      }, (error, response, body) => {
        if (error) {
          return console.dir(error);
        }
        var newjson = JSON.parse(body);
        res.json(newjson);
      })
    } else {
      res.json({
        status: "411",
        message: 'Please Follow Fields Validation Documentation'
      }
      )
    }
  }
}




exports.hundredtwentynine = function (req, res) {
  var bearer = req.headers.authorization;
  var array = bearer.split(" ");

  if (array[1] != token33) {
    res.json({ status: "401", message: "Unauthorized user!" });
  } else {
    let truid = req.body.truID,
      letterNumber = /^[0-9]+$/;
    if (truid && conf.hundredtwentynine.truID === "mandatory" && truid.length == 16 && truid.match(letterNumber)) {

      request.post({
        "headers": { "content-type": "application/json" },
        "url": reqip + ":4112/api/checkIsValidConsumer",
        "body": JSON.stringify({
          "truid": truid
        })
      }, (error, response, body) => {

        var newjsonresp = JSON.parse(body);
        if (newjsonresp.status == "200") {
          let newresp = newjsonresp.resource;
          let kycFlag = newresp.docVerified == true ? "KYC" : "nonKYC"
          let referencetruid = newresp.refernceTruID;
          request.post({
            "headers": { "content-type": "application/json" },
            "url": reqip + ":4125/api/showconsumerconfigurations",
            "body": JSON.stringify({
              "kycflag": kycFlag,
              "appliedOn": "consumer",
              "truid": truid,
              "referencetruid": referencetruid
            })
          }, (error, response, body) => {
            if (error) {
              return console.dir(error);
            }
            var newjson = JSON.parse(body);
            res.json(newjson);
          })
        }
        else {
          res.json({ status: "204", message: 'User not found' })
        }
      })
    } else {
      res.json({ status: "411", message: 'Please Follow Fields Validation Documentation' })
    }
  }
}





exports.hundredthirtytwo = function (req, res) {

  var bearer = req.headers.authorization;
  var array = bearer.split(" ");

  if (array[1] != token35) {
    res.json({ status: "401", message: "Unauthorized user!" });
  } else {

    // 
    var countrycode = req.body.countryCode,
      truid = req.body.truID;

    if ((truid && conf.thirty.truID === "mandatory" && truid.length == 16 && truid.match(letterNumber)) &&
      (countrycode && conf.hundredthirtytwo.countryCode === "mandatory" && countrycode.length <= 5)) {
      console.log({
        "truid": truid,
        "countrycode": countrycode,
        "assetmanagersearch": "liveRate"
      })
      request.post({
        "headers": { "content-type": "application/json" },
        "url": reqip + ":4114/v1/api/topassetmanagers",
        "body": JSON.stringify({
          "truid": truid,
          "countrycode": countrycode,
          "assetmanagersearch": "liveRate"
        })
      }, (error, response, body) => {
        if (error) {
          return console.dir(error);
        }
        var newjson = JSON.parse(body);
        if(newjson.status=="200")
        {
          newjson.resource.G24Kgross ? delete newjson.resource.G24Kgross : undefined;
          newjson.resource.S99Pgross ? delete newjson.resource.S99Pgross : undefined;
        }
        
        res.json(newjson);
      });
    } else {
      res.json({
        status: "411",
        message: 'Please Follow Fields Validation Documentation, your JSON structure is incorrect.'
      }
      )
    }
  }
};



exports.hundredthirtyeight = function (req, res) {

  var bearer = req.headers.authorization;
  var array = bearer.split(" ");

  if (array[1] != token58) {
    res.json({ status: "401", message: "Unauthorized user!" });
  } else {

    let truid = req.body.truID,
      invoice = req.body.invoice,
      modeofpay = req.body.ModeOfPay,
      accno = req.body.accountNo,
      ifsc = req.body.IFSC,
      amount = req.body.amount,
      otp = req.body.OTP,
      letterNumber = /^[0-9]+$/;
    var BlockedUsers = ["56158100003727"];

    if ((truid && conf.hundredthirty_eight.truID === "mandatory" && truid.length == 16 && truid.match(letterNumber)) &&
      // (invoice && conf.hundredthirty_eight.invoice === "mandatory" && (invoice.length >= 8 && invoice.length <= 30) && invoice.match(letterNumber)) &&
      (modeofpay && conf.hundredthirty_eight.ModeOfPay === "mandatory" && (modeofpay === "NEFT" || modeofpay === "IMPS")) &&
      (accno && conf.hundredthirty_eight.accountNo === "mandatory") &&
      (otp && otp.length == 6) &&
      (amount && conf.hundredthirty_eight.amount === "mandatory" && parseFloat(amount) > 0)
    ) {
      if (modeofpay === "IMPS") {
        res.json({
          status: "411",
          message: 'IMPS Temporary Disabled.'
        });
      } else if (BlockedUsers.includes(accno)) {
        res.json({
          status: "411",
          message: 'This account block because of previous negative balance.'
        });
      } else {
        request.post({
          "headers": { "content-type": "application/json" },
          "url": reqip + ":4114/api/addmoneytobankwithAcc",
          "body": JSON.stringify({
            "truid": truid,
            "amt": amount,
            "invoice": invoice,
            "accno": accno,
            "modeofpay": modeofpay,
            "otp": otp
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          res.json(newjson);
        });
      }

    } else {
      res.json({ status: "411", message: 'Please Follow Fields Validation Documentation, your JSON structure is incorrect.' })
    }
  }
};


exports.hundredfourtytwo = function (req, res) {

  var bearer = req.headers.authorization;
  var array = bearer.split(" ");

  if (array[1] != token11) {
    res.json({ status: "401", message: "Unauthorized user!" });
  } else {


    let truid = req.body.truID,
      letterNumber = /^[0-9]+$/;
    if (truid && conf.hundredtwentynine.truID === "mandatory" && truid.length == 16 && truid.match(letterNumber)) {
      request.post({
        "headers": { "content-type": "application/json" },
        "url": reqip + ":4112/api/emailverificationOTP",
        "body": JSON.stringify({
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
      res.json({ status: "411", message: 'Please Follow Fields Validation Documentation' })
    }
  }
}
exports.hundredfourtythree = function (req, res) {
  var bearer = req.headers.authorization;
  var array = bearer.split(" ");

  if (array[1] != token11) {
    res.json({ status: "401", message: "Unauthorized user!" });
  } else {


    let truid = req.body.truID,
      otp = req.body.OTP,
      letterNumber = /^[0-9]+$/;
    if ((truid && conf.hundredfourtythree.truID === "mandatory" && truid.length == 16 && truid.match(letterNumber)) &&
      (otp && conf.hundredfourtythree.OTP === "mandatory" && otp.length == 6 && otp.match(letterNumber))) {
      request.post({
        "headers": { "content-type": "application/json" },
        "url": reqip + ":4112/api/emailverificationverify",
        "body": JSON.stringify({
          "truid": truid,
          "otp": otp
        })
      }, (error, response, body) => {
        if (error) {
          return console.dir(error);
        }
        var newjson = JSON.parse(body);
        res.json(newjson);
      });
    } else {
      res.json({ status: "411", message: 'Please Follow Fields Validation Documentation' })
    }
  }
}

exports.hundredfourtyfour = function (req, res) {

  var bearer = req.headers.authorization;
  var array = bearer.split(" ");

  if (array[1] != token9) {
    res.json({ status: "401", message: "Unauthorized user!" });
  } else {

    let truid = req.body.truID,
      email = req.body.email,
      letterNumber = /^[0-9]+$/;

    if ((truid && conf.hundredthirtythree.truID === "mandatory" && truid.length == 16 && truid.match(letterNumber)) &&
      (email && conf.hundredthirtythree.email === "mandatory" && email.length >= 5 && email.length <= 48)) {
      request.post({
        "headers": { "content-type": "application/json" },
        "url": reqip + ":4112/api/updateemailandsendOTP",
        "body": JSON.stringify({
          "truid": truid,
          "email": email
        })
      }, (error, response, body) => {
        if (error) {
          return console.dir(error);
        }
        var newjson = JSON.parse(body);
        res.json(newjson);
      });
    } else {
      res.json({ status: "411", message: 'Please Follow Fields Validation Documentation, your JSON structure is incorrect.' })
    }
  }
};


exports.hundredfourtyeight = function (req, res) {

  var bearer = req.headers.authorization;
  var array = bearer.split(" ");

  if (array[1] != token10) {
    res.json({ status: "401", message: "Unauthorized user!" });
  } else {


    var crnno = req.body.CRNNo;
    var invoice = req.body.invoice;
    var type = req.body.type;
    var letterNumber = /^[0-9]+$/;

    if ((crnno && conf.hundredfourtyeight.CRNNo === "mandatory" && crnno.length == 8) &&
      (invoice && conf.hundredfourtyeight.invoice === "mandatory" && (invoice.length >= 8 && invoice.length <= 30) && invoice.match(letterNumber)) &&
      (type && conf.hundredfourtyeight.type === "mandatory" && (type == "buy" || type == "redeemCash"  || type == "transfer" ))) {
      request.post({
        "headers": { "content-type": "application/json" },
        "url": reqip + ":4114/api/printinvoiceviacrnno",
        "body": JSON.stringify({
          "crnno": crnno,
          "invoice": invoice,
          "type": type
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
        message: 'Please Follow Fields Validation Documentation, your JSON structure is incorrect.'
      }
      )
    }
  }
};


exports.hundredfiftyeight = function (req, res) {
  // consumerDetailsUpdateBeforKYC
  var bearer = req.headers.authorization;
  var array = bearer.split(" ");

  if (array[1] != token1) {
    res.json({ status: "401", message: "Unauthorized user!" });
  } else {
    var truID = req.body.truID;
    var email = req.body.email;
    var fname = req.body.fname;
    var mname = req.body.mname;
    var lname = req.body.lname;
    var DOB = req.body.DOB;
    var mobile = req.body.mobile;
    var gender = req.body.gender;
    var countryCode = req.body.countryCode;
    var billingAddress = req.body.billingAddress;
    var permanentAddress = req.body.permanentAddress;
    console.log("req.body", req.body)
    var isnum = /(?<=^| )\d+(\.\d+)?(?=$| )/;
    var json = {};
    function isemail(email) {
      var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
      return regex.test(email);
    }
    if (truID.length === 16 && truID.substring(0, 4) === "5000" && isnum.test(truID)) {
      var confail = false;
      if (billingAddress && permanentAddress) {
        json["billingAddress"] = billingAddress;
        json["permanentAddress"] = permanentAddress;
      }
      if (fname) {
        if (fname.length <= 30) {
          json["fName"] = fname;
        } else {
          confail = true;
        }
      }
      if (mname) {
        if (mname.length <= 30) {
          json["mName"] = mname;
        } else {
          confail = true;
        }
      }
      if (lname) {
        if (lname.length <= 30) {
          json["lName"] = lname;
        } else {
          confail = true;
        }
      }
      if (mobile) {
        if (mobile.length <= 10) {
          json["mobile"] = mobile;
          json["countrycode"] = countryCode;
        } else {
          confail = true;
        }
      }
      if (gender) {
        if (gender.length <= 6 && (gender === "male" || gender === "female" || gender === "other")) {
          json["gender"] = gender;
        } else {
          confail = true;
        }
      }
      if (DOB) {
        json["DOB"] = DOB;
      }
      if (email) {
        if (confail) {
          res.json({ status: "205", Message: "field validation error" });
        } else {
          if (isemail(email)) {
            json["email"] = email;
            callback(json);
          } else {
            res.json({ status: "205", Message: "Please Enter valid Email..!!" });
          }

        }
      } else {
        callback(json);
      }

    } else {
      res.json({ status: "204", message: "Filed validation error 1" });
    }
    function callback() {
      console.log("req.body.json", json)
      request.post({
        "headers": { "content-type": "application/json" },
        "url": conf.reqip + ":4112/api/consumerDetailsUpdateBeforKYC",
        "body": JSON.stringify({
          "truid": truID,
          "json": json,
        })
      }, (error, response, body) => {
        if (error) {
          return console.dir(error);
        }
        var newjson = JSON.parse(body);
        res.json(newjson);
      });
    }
  }
}



exports.hundredfiftynine = function (req, res) {
  var bearer = req.headers.authorization;
  var array = bearer.split(" ");

  if (array[1] != token3) {
    res.json({ status: "401", message: "Unauthorized user!" });
  } else {

    console.log(req.body)
    var truid = req.body.truID;
    var ifsc = encryption(req.body.IFSC, kycEnKey);
    var custname = req.body.custName;
    var accountno = encryption(req.body.accountNo, kycEnKey);
    var consent = req.body.consent;
    // var bname = req.body.bName;
    // var acctype = "self";
    // var relationship = req.body.relationship.toLowerCase();
    var letterNumber = /^[0-9]+$/;
    console.log((typeof req.body.isOwn === "boolean"))

    if ((truid && conf.twentyone.truID === "mandatory" && truid.length == 16 && truid.match(letterNumber)) &&
      // (bname && conf.twentyone.bName === "mandatory" && bname.length >= 0 && bname.length <= 50) &&
      (ifsc && conf.twentyone.IFSC === "mandatory") && (consent) &&
      // (branchname && conf.twentyone.branchName === "mandatory" && branchname.length >= 0 && branchname.length <= 30) &&
      // (address && conf.twentyone.address === "mandatory" && address.length >= 0 && address.length <= 100) &&
      // (city && conf.twentyone.city === "mandatory" && city.length >= 0 && city.length <= 20) &&
      (custname && conf.twentyone.custName === "mandatory" && custname.length >= 0 && custname.length <= 50) &&
      // (acctype && conf.twentyone.accType === "mandatory" && (acctype === "self")) && // || acctype === "beneficiary")) &&      
      (accountno && conf.twentyone.accountNo === "mandatory")) {
      var inputjson = {
        "truID": truid,
        "ifsc": ifsc,
        "accountno": accountno,
      }
      request.post({
        "headers": { "content-type": "application/json" },
        "url": reqip + ":4113/fetchAccount",
        "body": JSON.stringify(inputjson)
      }, (error, response, body) => {
        if (error) {
          return console.dir(error);
        } else {
          if (response.statusCode == 200) {
            var newjson = JSON.parse(body);
            if (newjson.status == "200" && newjson.resource.bankAccounts.length > 0) {
              request.post({
                "headers": { "content-type": "application/json" },
                "url": reqip + ":4113/updateStatus",
                "body": JSON.stringify({
                  "truID": truid,
                  "accountId": newjson.resource.bankAccounts[0].accountId,
                  "status": "active"
                })
              }, (err, respons, result) => {
                if (err) {
                  return console.dir(err);
                }
                if (respons.statusCode === 200) {
                  var newjson = JSON.parse(result);
                  res.json(newjson);
                } else {
                  res.json({ status: "500", message: 'Internal Server Error' });
                }
              })
            } else {
              inputjson.CONSENT = consent === true ? "Y" : "N";
              inputjson.ifsc = ifsc;
              inputjson.accountno = accountno;
              inputjson.USERTYPE = "B2BConsumer";
              let hash = generateHash(inputjson)
              request.post({
                "headers": { "content-type": "application/json", hash: hash },
                "url": pgServer + "/api/verifyBankAccount",
                "body": JSON.stringify(inputjson)
              }, (err, respons, result) => {
                if (err) {
                  res.json({ status: "500", message: 'Internal Server Error' });
                } else {
                  let newresult = JSON.parse(result);
                  if (newresult.status === "1000") {
                    let finInput = newresult.resource
                    finInput.name = finInput.name.replace(".", "");
                    finInput.IFSC = ifsc;
                    finInput.accountNo = accountno;
                    finInput.last4 = newresult.last4;
                    finInput.truID = truid;
                    console.log("newresult.resource", finInput)
                    request.post({
                      "headers": { "content-type": "application/json" },
                      "url": reqip + ":4113/linkAccount",
                      "body": JSON.stringify(finInput)
                    }, (error, response, body) => {
                      if (error) {
                        return console.dir(error);
                      }
                      var newjson = JSON.parse(body);
                      res.json(newjson);
                    });
                  } else {
                    res.json(newresult)
                  }
                }
              })
            }

          } else {
            res.json({
              status: "500",
              message: 'Internal Server Error'
            })
          }
        }
      });





    } else {
      res.json({
        status: "411",
        message: 'Please Follow Fields Validation Documentation, your JSON structure is incorrect.'
      }
      )
    }
  }
};

exports.hundredsixty = function (req, res) {
  var bearer = req.headers.authorization;
  var array = bearer.split(" ");
  if (array[1] != token23) {
    res.json({ status: "401", message: "Unauthorized user!" });
  } else {

    var truid = req.body.truID;
    var kycdetails = req.body.kycDetails;
    var flag = "consumer";
    var letterNumber = /^[0-9]+$/;
    if ((truid && conf.hundredfive.truID === "mandatory" && truid.length == 16 && truid.match(letterNumber)) &&
      (kycdetails && conf.hundredfive.kycDetails === "mandatory" && Array.isArray(kycdetails) == true) &&
      (flag === "consumer" && conf.hundredfive.flag === "mandatory")) {
      request.post({
        "headers": { "content-type": "application/json" },
        "url": reqip + ":4112/api/updatekycdocsforindividual",
        "body": JSON.stringify({
          "truid": truid,
          "kycdetails": kycdetails,
          "validationViaAPI": req.body.validationViaAPI,
          "flag": "consumer"
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
        message: 'Please Follow Fields Validation Documentation, your JSON structure is incorrect.'
      });
    }
  }
}

exports.hundredseventyOne = function (req, res) {
  var bearer = req.headers.authorization;
  if (!bearer) {
    res.json({ status: "400", message: "Bad Request!" });
  }
  else {
    var array = bearer.split(" ");
    if (array[1] != token59) {
      res.json({ status: "401", message: "Unauthorized user!" });
    } else {

      request.post({
        "headers": { "content-type": "application/json" },
        "url": reqip + ":4114/api/profitlossbuysellOld",
        "body": JSON.stringify({
          "truid": req.body.truID
        })
      }, (error, response, body) => {
        if (error) {
          return console.dir(error);
        }
        var newjson = JSON.parse(body);
        res.json(newjson);
      });
    }
  }
};