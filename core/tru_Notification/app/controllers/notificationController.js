
'use strict'

const  Notification = require('../models/notificationModel'),
  randomize = require('randomatic');



exports.ins_notificationnotifications = function (req, res) {
  var notification = new Notification();
  var triggeredbytruid = req.body.triggeredbytruid,
      triggeredbycrnno = req.body.triggeredbycrnno,
      date = new Date(),
      dt = Date.parse(date),
      num = randomize('0', 4),
      notificationid = dt.toString().concat(req.body.notifyto, num);
  notification.notifyTo = req.body.notifyto;
  notification.toCRNNo = req.body.CRNNo;
  notification.triggeredByTruID = triggeredbytruid;
  notification.triggeredByCRNNo = triggeredbycrnno;
  notification.notification = req.body.notification;
  notification.type = req.body.type;
  notification.subType = req.body.subtype;
  notification.dateAdded = date;
  notification.notificationID = notificationid;
  notification.title = req.body.title;
  notification.referenceID = req.body.referenceid;
  notification.isRead = false;
  

  Notification.find({ $and: [{ notificationID: notificationid }, { triggeredByTruID: req.body.triggeredbytruid }] }, function (err, docs) {
    if (!docs.length) {

      notification.save(function (err) {
        if (err) {
          console.log(err)
          res.json({ status: "500", message: 'Fields with * required' });
        }
        else{
          res.json({ status: "1000", message: 'Notification generated successfully.', notificationID: notificationid });
        }
      }
      )
    }
    else {
      res.json({ status: "401", message: 'This notification Already Exists!' });
    }
  }
  )
}