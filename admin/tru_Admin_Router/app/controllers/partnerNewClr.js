/*
  # @description This file contains all Admin functionallity for assetstore, Entity, assetmanager, Customer Modules which will Routes to core apis.
  # Request from UI will send here and then send to internal api with input params.
*/
'use strict'
var conf = require("../config");
var request = require('request');
var enKycAll = require('../models/remmitKYCAllModel');  
exports.threehundredtwo = function (req, res) {
  var rtruID = req.body.rTruID;
  var isnum = /(?<=^| )\d+(\.\d+)?(?=$| )/;
  if ((rtruID && rtruID.length === 16 && isnum.test(rtruID))) {
    request.post({
      "headers": { "content-type": "application/json" },
      "url": conf.reqip + ":" + conf.custTxn + "/api/partnerloadingrevenue",
      "body": JSON.stringify({
        "rTruID": rtruID,
        "type": req.body.type
      })
    }, (error, response, body) => {
      if (error) {
        console.log("err", error);
        res.status(500).json({ status: "500", message: "Internal Server Error" });
      } else {
        var newjson = JSON.parse(body);
        res.json(newjson);
      }
    })
  } else {
    res.json({ status: "411", message: "Please Follow Fields Validation Documentation" })
  }

}

exports.threehundredthree = function (req, res) {
  let truid = req.body.truID, letterNumber = /^[0-9]+$/;
  if ((truid && truid.length == 16 && truid.match(letterNumber))) {
    request.post({
      "headers": { "content-type": "application/json" },
      "url": conf.reqip + ":" + conf.custTxn + "/api/getPartnerDetails",
      "body": JSON.stringify(req.body)
    }, (error, response, body) => {
      if (error) {
        return console.dir(error);
      }
      var newjson = JSON.parse(body);
      res.json(newjson);
    })
  } else {
    res.json({ status: "411", message: 'Invalid Request..!!' })
  }
}
exports.threehundredFour = function (req, res) {
  let truid = req.body.truID, letterNumber = /^[0-9]+$/;
  if ((truid && truid.length == 16 && truid.match(letterNumber))) {
    request.post({
      "headers": { "content-type": "application/json" },
      "url": conf.reqip + ":" + conf.custTxn + "/api/countallPeople",
      "body": JSON.stringify(req.body)
    }, (error, response, body) => {
      if (error) {
        return console.dir(error);
      }
      var newjson = JSON.parse(body);
      res.json(newjson);
    })

  } else {
    res.json({ status: "411", message: 'Invalid Request..!!' })
  }
}
exports.threehundredFive = function (req, res) {
  let truid = req.body.truID, letterNumber = /^[0-9]+$/;
  if ((truid && truid.length == 16 && truid.match(letterNumber))) {
    request.post({
      "headers": { "content-type": "application/json" },
      "url": conf.reqip + ":" + conf.custTxn + "/api/bindWalletLog",
      "body": JSON.stringify(req.body)
    }, (error, response, body) => {
      if (error) {
        return console.dir(error);
      }
      var newjson = JSON.parse(body);
      res.json(newjson);
    })

  } else {
    res.json({ status: "411", message: 'Invalid Request..!!' })
  }
}



exports.threehundredSix = function (req, res) {
  let truid = req.body.truID, letterNumber = /^[0-9]+$/;
  if ((truid && truid.length == 16 && truid.match(letterNumber))) {
    request.post({
      "headers": { "content-type": "application/json" },
      "url": conf.reqip + ":" + conf.custTxn + "/api/fetchConsumer",
      "body": JSON.stringify(req.body)
    }, (error, response, body) => {
      if (error) {
        return console.dir(error);
      }
      var newjson = JSON.parse(body);
      res.json(newjson);
    })

  } else {
    res.json({ status: "411", message: 'Invalid Request..!!' })
  }
}


exports.threehundredSeven = function (req, res) {
  let truid = req.body.truID, letterNumber = /^[0-9]+$/;
  if ((truid && truid.length == 16 && truid.match(letterNumber))) {
    request.post({
      "headers": { "content-type": "application/json" },
      "url": conf.reqip + ":" + conf.custTxn + "/api/fetchNode",
      "body": JSON.stringify(req.body)
    }, (error, response, body) => {
      if (error) {
        return console.dir(error);
      }
      var newjson = JSON.parse(body);
      res.json(newjson);
    })

  } else {
    res.json({ status: "411", message: 'Invalid Request..!!' })
  }
}

exports.threehundredEight = function (req, res) {
  let truid = req.body.truID, letterNumber = /^[0-9]+$/;
  if ((truid && truid.length == 16 && truid.match(letterNumber))) {
    request.post({
      "headers": { "content-type": "application/json" },
      "url": conf.reqip + ":" + conf.custTxn + "/api/partnerNodeList",
      "body": JSON.stringify(req.body)
    }, (error, response, body) => {
      if (error) {
        return console.dir(error);
      }
      var newjson = JSON.parse(body);
      res.json(newjson);
    })

  } else {
    res.json({ status: "411", message: 'Invalid Request..!!' })
  }
}

exports.threehundredNine = function (req, res) {
  let truid = req.body.truID, letterNumber = /^[0-9]+$/;
  if ((truid && truid.length == 16 && truid.match(letterNumber))) {
    request.post({
      "headers": { "content-type": "application/json" },
      "url": conf.reqip + ":" + conf.custTxn + "/api/consumerListPartner",
      "body": JSON.stringify(req.body)
    }, (error, response, body) => {
      if (error) {
        return console.dir(error);
      }
      var newjson = JSON.parse(body);
      res.json(newjson);
    })
  } else {
    res.json({ status: "411", message: 'Invalid Request..!!' })
  }
}
exports.threehundredeleven = function (req, res) {
  let truid = req.body.truID, letterNumber = /^[0-9]+$/;
  if ((truid && truid.length == 16 && truid.match(letterNumber))) {
    request.post({
      "headers": { "content-type": "application/json" },
      "url": conf.reqip + ":" + conf.entityTxn + "/api/walletBreakupSummary",
      "body": JSON.stringify(req.body)
    }, (error, response, body) => {
      if (error) {
        return console.dir(error);
      }
      var newjson = JSON.parse(body);
      res.json(newjson);
    })
  } else {
    res.json({ status: "411", message: 'Invalid Request' })
  }
},
  exports.threehundredTwelve = function (req, res) {
    let truid = req.body.rTruID, letterNumber = /^[0-9]+$/;
    if ((truid && truid.length == 16 && truid.match(letterNumber))) {
      request.post({
        "headers": { "content-type": "application/json" },
        "url": conf.reqip + ":" + conf.entityTxn + "/api/fetchentityStock",
        "body": JSON.stringify(req.body)
      }, (error, response, body) => {
        if (error) {
          return console.dir(error);
        }
        var newjson = JSON.parse(body);
        res.json(newjson);
      })
    } else {
      res.json({ status: "411", message: 'Invalid Request' })
    }
  }
exports.threehundredThirteen = function (req, res) {
  let truid = req.body.truID, letterNumber = /^[0-9]+$/;
  if ((truid && truid.length == 16 && truid.match(letterNumber))) {
    request.post({
      "headers": { "content-type": "application/json" },
      "url": conf.reqip + ":" + conf.entityTxn + "/api/refundtransaction",
      "body": JSON.stringify(req.body)
    }, (error, response, newjson) => {
      if (response.statusCode === 200) {
        res.status(200).json(JSON.parse(newjson));
      }
      else {
        res.status(response.statusCode || 204).json(JSON.parse(newjson));
      }
    })

  } else {
    res.json({ status: "411", message: 'Invalid Request..!!' })
  }
}
exports.threehundredFourteen = function (req, res) {
  let truid = req.body.truID, letterNumber = /^[0-9]+$/;
  if ((truid && truid.length == 16 && truid.match(letterNumber))) {
    request.post({
      "headers": { "content-type": "application/json" },
      "url": conf.reqip + ":" + conf.entityTxn + "/api/fetchCounter",
      "body": JSON.stringify(req.body)
    }, (error, response, body) => {
      if (error) {
        return console.dir(error);
      }
      var newjson = JSON.parse(body);
      res.json(newjson);
    })

  } else {
    res.json({ status: "411", message: 'Invalid Request..!!' })
  }
}
exports.threehundredFifteen = function (req, res) {
  let truid = req.body.truID, letterNumber = /^[0-9]+$/;
  if ((truid && truid.length == 16 && truid.match(letterNumber))) {
    request.post({
      "headers": { "content-type": "application/json" },
      "url": conf.reqip + ":" + conf.entityTxn + "/api/fetchentityDashStock",
      "body": JSON.stringify(req.body)
    }, (error, response, body) => {
      if (error) {
        return console.dir(error);
      }
      var newjson = JSON.parse(body);
      res.json(newjson);
    })

  } else {
    res.json({ status: "411", message: 'Invalid Request..!!' })
  }
}
exports.threehundredSixteen = function (req, res) {
  let truid = req.body.truID, letterNumber = /^[0-9]+$/;
  if ((truid && truid.length == 16 && truid.match(letterNumber))) {
    request.post({
      "headers": { "content-type": "application/json" },
      "url": conf.reqip + ":" + conf.entityTxn + "/api/blockActivatePartnerAccount",
      "body": JSON.stringify(req.body)
    }, (error, response, body) => {
      if (error) {
        return console.dir(error);
      }
      var newjson = JSON.parse(body);
      res.json(newjson);
    })

  } else {
    res.json({ status: "411", message: 'Invalid Request..!!' })
  }
}

exports.threehundredSeveneen = function (req, res) {
  let truid = req.body.truID, letterNumber = /^[0-9]+$/;
  if ((truid && truid.length == 16 && truid.match(letterNumber))) {
    let api = conf.reqip + ":" + conf.entityTxn + "/api/walletPreview";
    if (req.body.cuType && req.body.cuType == "consumer") {
      api = conf.reqip + ":" + conf.entityTxn + "/api/wallet_consumerPreview";
    }
    request.post({
      "headers": { "content-type": "application/json" },
      "url": api,
      "body": JSON.stringify(req.body)
    }, (error, response, body) => {
      if (error) {
        res.json({status:"500", message:"Internal Server Error"});
      }else{
        var newjson = JSON.parse(body);
        res.json(newjson);

      }
    })

  } else {
    res.json({ status: "411", message: 'Invalid Request..!!' })
  }
}

exports.threehundredEighteen = function (req, res) {
  let truid = req.body.truID, letterNumber = /^[0-9]+$/;
  if ((truid && truid.length == 16 && truid.match(letterNumber))) {
    var api = conf.reqip + ":" + conf.entityTxn + "/api/deductChargesFromFloat";
    request.post({
      "headers": { "content-type": "application/json" },
      "url": api,
      "body": JSON.stringify(req.body)
    }, (error, response, body) => {
      if (error) {
        return console.dir(error);
      }
      var newjson = JSON.parse(body);
      res.json(newjson);
    })

  } else {
    res.json({ status: "411", message: 'Invalid Request..!!' })
  }
}
exports.threehundredNineteen = function (req, res) {
  let truid = req.body.truID, letterNumber = /^[0-9]+$/;
  if ((truid && truid.length == 16 && truid.match(letterNumber))) {
    var api = conf.reqip + ":" + conf.entityTxn + "/api/partnerEarnedRevenueFromCompany";
    request.post({
      "headers": { "content-type": "application/json" },
      "url": api,
      "body": JSON.stringify(req.body)
    }, (error, response, body) => {
      if (error) {
        return console.dir(error);
      }
      var newjson = JSON.parse(body);
      res.json(newjson);
    })

  } else {
    res.json({ status: "411", message: 'Invalid Request..!!' })
  }
}
exports.threehundredTwenty = function (req, res) {
  let truid = req.body.truID, letterNumber = /^[0-9]+$/;
  if ((truid && truid.length == 16 && truid.match(letterNumber))) {
    var api = conf.reqip + ":" + conf.entityTxn + "/api/egetGSTReport";
    if (req.body.to) {
      api = conf.reqip + ":" + conf.entityTxn + "/api/cgetGSTReport";
    }
    request.post({
      "headers": { "content-type": "application/json" },
      "url": api,
      "body": JSON.stringify(req.body)
    }, (error, response, body) => {
      if (error) {
        return console.dir(error);
      }
      var newjson = JSON.parse(body);
      res.json(newjson);
    })

  } else {
    res.json({ status: "411", message: 'Invalid Request..!!' })
  }
}
exports.threehundredTwentyOne = function (req, res) {
  let truid = req.body.truID, letterNumber = /^[0-9]+$/;
  if ((truid && truid.length == 16 && truid.match(letterNumber))) {
    request.post({
      "headers": { "content-type": "application/json" },
      "url": conf.reqip + ":" + conf.entityTxn + "/api/getmostActiveTxn",
      "body": JSON.stringify(req.body)
    }, (error, response, body) => {
      if (error) {
        return console.dir(error);
      }
      var newjson = JSON.parse(body);
      res.json(newjson);
    })

  } else {
    res.json({ status: "411", message: 'Invalid Request..!!' })
  }
}
//atom
exports.threehundredTwentyThree = function (req, res) {
  let truid = req.body.truID, letterNumber = /^[0-9]+$/;
  if ((truid && truid.length == 16 && truid.match(letterNumber))) {

    var confURl = conf.pgSeverURL + "/api/refundAtomStatus";
    if (req.body.pgType == "atom" && req.body.pgstatus == "refund") {
      confURl = conf.pgSeverURL + "/api/initiateAtomRefund";
    }
    request.post({
      "headers": { "content-type": "application/json" },
      "url": confURl,
      "body": JSON.stringify(req.body)
    }, (error, response, body) => {
      if (error) {
        return console.dir(error);
      }
      var newjson = JSON.parse(body);
      if (newjson.status == "8000") {
        var reqbody = newjson.resource;
        var confURl = conf.reqip + ":" + conf.custTxn + "/api/insatomlogRefund";
        // update atom log
        request.post({
          "headers": { "content-type": "application/json" },
          "url": confURl,
          "body": JSON.stringify(reqbody)
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          res.json(newjson);
        })
      }
      else {
        res.json(newjson);
      }

    })

  } else {
    res.json({ status: "411", message: 'Invalid Request..!!' })
  }
}

exports.threehundredTwentyFour = function (req, res) {
  let truid = req.body.truID, letterNumber = /^[0-9]+$/;
  if ((truid && truid.length == 16 && truid.match(letterNumber))) {
    request.post({
      "headers": { "content-type": "application/json" },
      "url": conf.reqip + ":" + conf.custTxn + "/api/clientRate",
      "body": JSON.stringify(req.body)
    }, (error, response, body) => {
      if (error) {
        return console.dir(error);
      }
      var newjson = JSON.parse(body);
      res.json(newjson);
    })

  } else {
    res.json({ status: "411", message: 'Invalid Request..!!' })
  }
}


exports.threehundredTwentySix = function (req, res) {
  let truid = req.body.truID, letterNumber = /^[0-9]+$/;
  if ((truid && truid.length == 16 && truid.match(letterNumber))) {
    request.post({
      "headers": { "content-type": "application/json" },
      "url": conf.reqip + ":" + conf.custTxn + "/api/setOnHoldBalance",
      "body": JSON.stringify(req.body)
    }, (error, response, body) => {
      if (error) {
        return console.dir(error);
      } else {
        var newjson = JSON.parse(body);
        res.json(newjson);
      }
    })

  } else {
    res.json({ status: "411", message: 'Invalid Request..!!' })
  }
}


exports.threehundredTwentySeven = function (req, res) {
  let truid = req.body.truID, letterNumber = /^[0-9]+$/;
  if ((truid && truid.length == 16 && truid.match(letterNumber))) {
    request.post({
      "headers": { "content-type": "application/json" },
      "url": conf.reqip + ":" + conf.custTxn + "/api/getOnHoldBalance",
      "body": JSON.stringify(req.body)
    }, (error, response, body) => {
      if (error) {
        return console.dir(error);
      }
      var newjson = JSON.parse(body);
      res.json(newjson);
    })

  } else {
    res.json({ status: "411", message: 'Invalid Request..!!' })
  }
}
exports.threehundredTwentyEight = function (req, res) {
  let truid = req.body.truID, letterNumber = /^[0-9]+$/;
  if ((truid && truid.length == 16 && truid.match(letterNumber))) {
    request.post({
      "headers": { "content-type": "application/json" },
      "url": conf.reqip + ":" + conf.custTxn + "/api/getSecureCredit",
      "body": JSON.stringify(req.body)
    }, (error, response, body) => {
      if (error) {
        return console.dir(error);
      }
      var newjson = JSON.parse(body);
      res.json(newjson);
    })
  } else {
    res.json({ status: "411", message: 'Invalid Request..!!' })
  }
}
exports.getPGInvoice = function (req, res) {
  let truid = req.body.truID, letterNumber = /^[0-9]+$/;
  if ((truid && truid.length == 16 && truid.match(letterNumber))) {
    request.post({
      "headers": { "content-type": "application/json" },
      "url": conf.reqip + ":" + conf.custTxn + "/api/getPGInvoice",
      "body": JSON.stringify(req.body)
    }, (error, response, body) => {
      var newjson = JSON.parse(body);
      if (newjson.status == "200") {
        var confURl = conf.pgSeverURL + "/api/refundStatus";
        if (newjson.resource.PGType == "atom") {
          confURl = conf.pgSeverURL + "/api/refundAtomStatus";
        }

        var myjson = {
          AMOUNT: newjson.resource.amount,
          ORDER_ID: newjson.resource.invoice,
          txnDate: newjson.resource.txnDate
        }

        request.post({
          "headers": { "content-type": "application/json" },
          "url": confURl,
          "body": JSON.stringify(myjson)
        }, (error, response, body) => {
          var newjsonpg = JSON.parse(body);
          if (newjsonpg.status == "200") {
            res.json(newjsonpg);
          }
          else {
            res.json(newjsonpg);
          }
        })
      }
      else {
        res.json(newjson);
      }
    })

  } else {
    res.json({ status: "411", message: 'Invalid Request..!!' })
  }
}
exports.uploadBrandLogo = function (req, res) {
  let truid = req.body.truID, letterNumber = /^[0-9]+$/;
  if ((truid && truid.length == 16 && truid.match(letterNumber))) {
    request.post({
      "headers": { "content-type": "application/json" },
      "url": conf.reqip + ":" + conf.custTxn + "/api/uploadBrandLogo",
      "body": JSON.stringify(req.body)
    }, (error, response, body) => {
      var newjson = JSON.parse(body);
      res.json(newjson);
    })

  } else {
    res.json({ status: "411", message: 'Invalid Request..!!' })
  }
}
