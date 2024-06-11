'use strict'

var mongoose = require('mongoose'),
    Alert = require('../models/bankNotificationModel'),
    randomize = require('randomatic'),
    request = require('request');




exports.ins_bank_Alert = function (req, res) {
    var bankalert = new Alert();
    var date = new Date(),
        dt = Date.parse(date),
        num = randomize('0', 4),
        alertId = dt.toString().concat(req.body.utrnumber, num);

    bankalert["alertId"] = alertId;
    bankalert["truID"] = req.body.truid;
    bankalert["alertDate"] = dt;
    bankalert["messageType"] = req.body.messagetype;
    bankalert["amount"] = req.body.amount;
    bankalert["UTRNumber"] = req.body.utrnumber;
    bankalert["senderIFSC"] = req.body.senderifsc;
    bankalert["senderAccountNumber"] = req.body.senderaccountNumber;
    bankalert["senderAccountType"] = req.body.senderaccounttype;
    bankalert["senderName"] = req.body.sendername;
    bankalert["beneficiaryAccountType"] = req.body.beneficiaryaccounttype;
    bankalert["beneficiaryAccountNumber"] = req.body.beneficiaryaccountnumber;
    bankalert["creditDate"] = req.body.creditdate;
    bankalert["creditAccountNumber"] = req.body.creditaccountnumber;
    bankalert["corporateCode"] = req.body.corporatecode;
    bankalert["clientCodeMaster"] = req.body.clientcodemaster;
    bankalert["senderInformation"] = req.body.senderinformation;

    Alert.find({ $and: [{ alertId: alertId }] }, function (err, docs) {
        if (!docs.length) {
            bankalert.save(function (err) {
                if (err) {
                    res.json({ status: "204", message: 'Fields with * required' });
                }
                else {
                    res.json({ status: "200", message: 'Alert log generated successfully..!!' });
                }
            })
        }
        else {
            res.json({ status: "204", message: 'This notification Already Exists!' });
        }
    }
    )
}