'use strict'

const KycAll = require('../models/custKYCAllModel');


exports.list_charges = function (req, res) {
  let Gen = req.generalCharges;
  var truid = req.body.truid;

  KycAll.find({ truID: truid }, function (err, docs) {
    if (!docs.length) {
      res.json({
        status: "204",
        message: 'The request was successful but no TruID was returned.'
      });
    } else {
      var final = ({
        othercharges: (Gen.othercharges * 100).toString(),
        assetmanagercharges: (Gen.assetmanagercharges * 100).toString(),
        entitycharges: (Gen.entitycharges * 100).toString(),
        lending_processing: (Gen.lending_processing * 100).toString(),
        transactionFees: (Gen.transactionfees * 100).toString(),
        tax: (Gen.tax * 100).toString()
      });

      res.json({ status: "200", resource: final })
    }
  }
  )
}

exports.list_charges_internal_use = function (req, res) {
  let Gen = req.generalCharges;

  var final = ({
    othercharges: (Gen.othercharges * 100).toString(),
    assetmanagercharges: (Gen.assetmanagercharges * 100).toString(),
    entitycharges: (Gen.entitycharges * 100).toString(),
    lending_processing: (Gen.lending_processing * 100).toString(),
    transactionFees: (Gen.transactionfees * 100).toString(),
    tax: (Gen.tax * 100).toString()
  });

  res.json({ status: "200", resource: final })
}