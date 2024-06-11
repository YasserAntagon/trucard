
'use strict'

var mongoose = require('mongoose'),
  KycAll = require('../models/entityModel/remmitKYCAllModel'),
  PartnerFloat = require('../models/entityModel/partnerFloat'),
  Wallet = require('../models/entityModel/remmitWalletModel'),
  Stock = require('../models/entityModel/remmitStockModel');

exports.client_list_profile = function (req, res) {
  var badd = new KycAll(req.user);
  var crnno = req.body.crnno;
  KycAll.aggregate([
    { $match: { __t: "KycAll", CRNNo: crnno } },
    {
      $project: {
        name: { $concat: ["$contactFName", " ", "$contactLName"] }, contactFName: 1, contactLName: 1,
        address: 1, companyName: 1,
        gender: 1, DOB: 1, CRNNo: 1, parentTruID: 1,
        _id: 0, truID: 1, mobile: 1, KYCFlag: 1, email: 1, image: 1, CINNo: 1
      }
    }
  ]).exec(function (err, result) {
    if (err) {
      res.status(500).send({ error: err })
    }
    else {
      if (result.length > 0) {
        var fName = result[0].contactFName;
        var lName = result[0].contactLName;
        /*     var city = result[0].city;
            var pin = result[0].pin; */
        var truID = result[0].truID;
        var mobile = result[0].mobile;
        var companyName = result[0].companyName;
        var gender = result[0].gender;
        var CRNNo = result[0].CRNNo;
        /*     var parentTruID = result[0].parentTruID; */
        /*    var docpath = Gen.docs; */
        /* var KYCDetails = new Array();
        var isKYCDocExist = false;
        if (result[0].KYCDetails.length) {
          for (var j = 0; j < result[0].KYCDetails.length; j++) {
            var kycelements = result[0].KYCDetails[j];
            var kycaray = {};
            kycaray["docNumber"] = kycelements.docNumber;
            kycaray["docTitle"] = kycelements.docTitle;
            var doc = kycelements.docFile;
            kycaray["docFile"] = docpath.concat(doc);
   
            KYCDetails.push(kycaray);
            isKYCDocExist = true
          }
        } */

        /*    var DOB = result[0].DOB; */
        var email = result[0].email;
        var CINNo = result[0].CINNo ? result[0].CINNo : undefined;
        var address = undefined;
        /*  var image = result[0].image; */
        /*   var path = Gen.profile; */
        var KYCFlag = result[0].KYCFlag;
        if (result[0].address) {
          address = result[0].address.houseNumber + " , " + result[0].address.landmark + " , " + result[0].address.streetNumber + " , " + result[0].address.city + " , " + result[0].address.state + " ," + result[0].address.country + "-" + result[0].address.pin
          delete result[0].address.location
        };
        var Final = {
          companyName: companyName, clientID: CRNNo, fName: fName, lName: lName, address: address,
          mobile: mobile, email: email, gender: gender, CINNo: CINNo, isKYC: KYCFlag
        }
        Stock.aggregate([{ "$match": { "truID": truID } },
        { "$project": { _id: 0, stock: 1 } }
        ]).exec(function (err, resultdoc) {
          if (err) {
            res.status(411).json({
              status: "411",
              message: "Something went wrong."
            });
          }
          else {
            var resource = resultdoc[0];
            if (resource) {
              var g24 = resource.stock ? resource.stock.G24K.toJSON().$numberDecimal : 0;
              var s99 = resource.stock ? resource.stock.S99P.toJSON().$numberDecimal : 0;
              Final.trucoin_99Pure = s99;
              Final.trucoin_24kgold = g24;
            }
            else {
              Final.trucoin_99Pure = 0;
              Final.trucoin_24kgold = 0;
            }

            Wallet.aggregate([{
              $match: {
                truID: truID
              }
            },
            {
              $project: {
                _id: 0,
                clBal: 1
              }
            }
            ]).exec(function (err, resultf) {
              if (err) {
                res.status(411).json({ status: "411", message: "Something Went Wrong." });
              }
              else {
                Final.truWalletBAL = resultf[0].clBal.toJSON().$numberDecimal;
                res.status(200).json({
                  status: "1000",
                  resource: Final
                });
              }
            })
          }

        })

      } else {
        res.status(411).json({
          status: "411",
          resource: "Invalid Request"
        });
      }
    }

  }
  )
}
exports.check_Client_ExistOrNOt = function (req, res) {
  var crnno = req.body.crnno;
  KycAll.aggregate([
    { $match: { __t: "KycAll", CRNNo: crnno, KYCFlag: "active" } },
    {
      $project: {
        name: { $concat: ["$contactFName", " ", "$contactLName"] }, contactFName: 1, contactLName: 1,
        companyName: 1, CRNNo: 1, parentTruID: 1,
        _id: 0, truID: 1, mobile: 1, KYCFlag: 1, email: 1, image: 1, parentTruID: 1, isParent: 1, MID: 1
      }
    }
  ]).exec(function (err, result) {
    if (err) {
      res.status(500).send({ error: err })
    }
    else {
      if (result.length > 0) {
        var fName = result[0].contactFName;
        var lName = result[0].contactLName;
        var mobile = result[0].mobile;
        var companyName = result[0].companyName;
        var CRNNo = result[0].CRNNo;
        var email = result[0].email;
        var KYCFlag = result[0].KYCFlag;
        var isParent = result[0].isParent;
        var parentTruID = result[0].parentTruID;
        var truID = result[0].truID;
        var MID = result[0].MID;

        var Final = {
          companyName: companyName, clientID: CRNNo, fName: fName, lName: lName,
          mobile: mobile, email: email, isKYC: KYCFlag, isParent: isParent, parentTruID: parentTruID, truID: truID, MID: MID
        }
        res.status(200).json({ status: "1000", message: "Verified Successfully..!!", resource: Final });
      }
      else {
        res.status(411).json({ status: "411", message: "No record found" });
      }
    }
  })
}
exports.check_Client_charges = function (req, res) {
  var crnno = req.body.crnno;
  KycAll.aggregate([
    { $match: { CRNNo: crnno, KYCFlag: "active" } },
    { $project: { _id: 0, truID: 1, parentTruID: 1, CRNNo: 1, isParent: 1, MID: 1, companyName: 1 } },
    {
      $lookup: {
        localField: "parentTruID",
        foreignField: "truID",
        from: "charges",
        as: "charges"
      }
    },
    { $project: { _id: 0, truID: 1, CRNNo: 1, isParent: 1, charges: "$charges", parentTruID: 1, MID: 1, companyName: 1 } }
  ]).exec(function (err, result) {
    if (err) {
      response.status(500).send({ error: err })
      return next(err);
    }
    else {
      if (result.length > 0) {
        var CRNNo = result[0].CRNNo;
        var isParent = result[0].isParent;
        var parentTruID = result[0].parentTruID;
        var charges = result[0].charges;
        var truID = result[0].truID;
        var MID = result[0].MID;
        var companyName = result[0].companyName;
        var clientCharges = {
          "nodeCharges": 0,
          "partnerCharges": 0,
          "trasactionCharges": 0,
          "isChargesSet": false,
          "promotionQty": 0
        }
        if (charges.length > 0) {
          clientCharges = {
            "nodeCharges": charges[0].nodeCharges ? parseFloat(charges[0].nodeCharges) : 0,
            "partnerCharges": charges[0].partnerCharges ? parseFloat(charges[0].partnerCharges) : 0,
            "trasactionCharges": charges[0].trasactionCharges ? parseFloat(charges[0].trasactionCharges) : 0,
            "isChargesSet": charges[0].isChargesSet ? charges[0].isChargesSet : false,
            "promotionQty": charges[0].promotionQty ? parseFloat(charges[0].promotionQty) : 0
          }
        }


        var Final = {
          clientID: CRNNo, truID: truID, isParent: isParent, parentTruID: parentTruID,
          charges: clientCharges, MID: MID, companyName: companyName
        }
        res.status(200).json({ status: "1000", message: "Verified Successfully..!!", resource: Final });
      }
      else {
        res.status(411).json({ status: "411", message: "No record found" });
      }
    }
  })
}

