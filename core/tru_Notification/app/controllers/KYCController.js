
'use strict'

var mongoose = require('mongoose'),
  Notification = require('../models/notificationModel'),
  randomize = require('randomatic'),
  request = require('request'),
  config = require('../config');

var reqip
exports.test = function (req, res) {
  res.json({ message: "Welcome to Notification Api." });
};


exports.ins_notification = function (req, res) {

  var notification = new Notification();
  var date = new Date(),
    dt = Date.parse(date),
    num = randomize('0', 4),
    notificationid = dt.toString().concat(req.body.notifyto, num);
  notification.triggeredByCRNNo = req.body.triggeredbycrnno;
  notification.notifyTo = req.body.notifyto;
  notification.triggeredByTruID = req.body.triggeredbytruid;
  notification.notification = req.body.notification;
  notification.type = req.body.type;
  notification.subType = req.body.subtype;
  notification.dateAdded = date;
  notification.notificationID = notificationid;
  notification.title = req.body.title;
  notification.referenceID = req.body.referenceid;
  notification.isRead = false;
  notification.toCRNNo = req.body.crnNo;
  Notification.find({ $and: [{ notificationID: notificationid }, { triggeredByTruID: req.body.triggeredbytruid }] }, function (err, docs) {
    if (!docs.length) {

      notification.save(function (err) {
        if (err) {
          res.json({ status: "204", message: 'Fields with * required' + err });
        }
        else if (req.body.isflag == "consumer" && (req.body.subtype == "transfer" || req.body.subtype == "referal" || req.body.subtype == "redeemCash" || req.body.subtype == "walletToBank")) {
          request.post({
            "headers": { "content-type": "application/json" },
            "url": config.requrl + ":3116/602",
            "body": JSON.stringify({
              "crnno": req.body.crnNo,
              "message": req.body.notification,
              "title": req.body.title
            })
          }, (error, response, body) => {
            // console.log(body)
            if (error) {
              return console.dir(error);
            }
            var newjson = JSON.parse(body);
            res.json(newjson);
          });
        }
        else {
          res.json({ status: "200", message: 'Notification generated successfully.', notificationID: notificationid });
        }

      }
      )
    }
    else {
      res.json({ status: "204", message: 'This notification Already Exists!' });
    }
  }
  )
}
exports.change_read_notification = function (req, res) {
  var notificationid = req.body.notificationid;
  var notifyto = req.body.notifyto;
  var isread = req.body.isread;
  var date = new Date();

  Notification.find({ notificationID: notificationid, notifyTo: notifyto, isRead: false }, function (err, docs) {
    if (!docs.length) {
      res.json({
        status: "204",
        message: "The request was successful but no body was returned."
      }
      )
    }
    else {
      Notification.findOneAndUpdate({ notificationID: notificationid, notifyTo: notifyto }, { $set: { isRead: isread, dateRead: date } }, callback)

      function callback(err, numAffected) {
        if (err)
          res.send(err);
        Notification.aggregate([{ "$match": { notificationID: notificationid } }, { "$project": { _id: 0, notificationID: 1, isRead: 1, dateRead: 1 } }]).exec(function (err, result) {
          if (err) {
            response.status(500).send({ error: err })
            return next(err);
          }
          else {
            res.json({ status: "200", resource: result[0] });
          }
        }
        )
      }
    }
  }
  )
}



exports.show_notifications = function (req, res) {
  var notifyto = req.body.notifyto;
  var skip = parseFloat(req.body.skip);
  if (isNaN(skip)) {
    res.json({
      status: "204",
      message: "Skip value not found."
    })
  }
  else {
    Notification.find({ notifyTo: notifyto }, { _id: 1 }, { limit: 1 }, function (err, docs) {
      if (!docs.length) {
        res.json({
          status: "204",
          message: 'The request was successful but no TruID was returned.'
        });
      }
      else {
        Notification.aggregate([
          {
            $facet: {
              "notification": [
                { $match: { notifyTo: notifyto } },
                {
                  $project: {
                    triggeredByTruID: 1, notificationID: 1, dateAdded: 1, subType: 1, notification: 1, notifyTo: 1, type: 1, isRead: 1, dateRead: 1,
                    title: 1, referenceID: 1
                  }
                },
                { $sort: { isRead: 1, _id: -1 } },
                { $skip: skip },
                { $limit: 5 }
              ],
              "count": [
                { $match: { notifyTo: notifyto } },
                { $project: { array: "$notificationID", _id: 1 } },
                {
                  $group: {
                    _id: 1,
                    count: { $addToSet: "$array" }
                  }
                },
                { $project: { _id: 0, count: { $size: "$count" } } }
              ],
              "countUnread": [
                { $match: { notifyTo: notifyto, "isRead": false } },
                { $project: { array: "$notificationID", _id: 1 } },
                {
                  $group: {
                    _id: 1,
                    count: { $addToSet: "$array" }
                  }
                },
                { $project: { _id: 0, count: { $size: "$count" } } }
              ],
            }
          },
          { $project: { notification: 1, count: "$count.count", countUnread: "$countUnread.count" } },
          { $unwind: { path: "$count", preserveNullAndEmptyArrays: true } },
          { $unwind: { path: "$countUnread", preserveNullAndEmptyArrays: true } }
        ]).exec(function (err, result) {
          if (err) {
            console.log(err);
            response.status(500).send({ error: err })
            return next(err);
          }
          else {
            var resource = result[0];
            var notification = new Array();
            for (var i = 0; i < resource.notification.length; i++) {
              var reslt = resource.notification[i];
              var array = {};
              array["triggeredByTruID"] = reslt.triggeredByTruID;
              array["notificationID"] = reslt.notificationID;
              array["dateAdded"] = reslt.dateAdded;
              array["notification"] = reslt.notification;
              array["notifyTo"] = reslt.notifyTo;
              array["type"] = reslt.type;
              array["subType"] = reslt.subType;
              array["isRead"] = reslt.isRead;
              array["dateRead"] = reslt.dateRead;
              notification.push(array)
            }

            var count = resource.count
            if (count === undefined) {
              count = 0;
            }
            var countUnread = resource.countUnread
            if (countUnread === undefined) {
              countUnread = 0;
            }
          }
          var Final = ({
            "notification": notification,
            "count": count,
            "countUnread": countUnread
          }
          )
          res.json({ status: "200", resource: Final })
        }
        )
      }
    }
    )
  }
}



exports.show_notifications_timestamp = function (req, res) {
  var notifyto = req.body.notifyto,
    dateflag = req.body.dateflag,
    startdate = new Date(req.body.startdate);
  Notification.find({ notifyTo: notifyto }, { _id: 1 }, { limit: 1 }, function (err, docs) {
    if (!docs.length) {
      res.json({
        status: "409",
        message: 'You do not have any notifications yet.'
      });
    }
    else {
      var matchquery = { notifyTo: notifyto };
      if (dateflag === true) {
        matchquery = { notifyTo: notifyto, dateAdded: { $gt: startdate } };
      }
      console.log(startdate);
      console.log(matchquery);


      Notification.aggregate([
        { $match: matchquery },
        {
          $facet: {
            "notification": [
              {
                $project: {
                  triggeredByTruID: 1, notificationID: 1, dateAdded: 1, subType: 1, notification: 1, notifyTo: 1, type: 1, isRead: 1, dateRead: 1,
                  title: 1, referenceID: 1
                }
              },
              { $sort: { isRead: 1, _id: -1 } }
            ],
            "count": [
              // {$match :{notifyTo : notifyto}},
              { $project: { array: "$notificationID", _id: 1 } },
              {
                $group: {
                  _id: 1,
                  count: { $addToSet: "$array" }
                }
              },
              { $project: { _id: 0, count: { $size: "$count" } } }
            ],
            "countUnread": [
              // {$match :{notifyTo : notifyto,"isRead" : false}},
              { $match: { "isRead": false } },
              { $project: { array: "$notificationID", _id: 1 } },
              {
                $group: {
                  _id: 1,
                  count: { $addToSet: "$array" }
                }
              },
              { $project: { _id: 0, count: { $size: "$count" } } }
            ],
          }
        },
        { $project: { notification: 1, count: "$count.count", countUnread: "$countUnread.count" } },
        { $unwind: { path: "$count", preserveNullAndEmptyArrays: true } },
        { $unwind: { path: "$countUnread", preserveNullAndEmptyArrays: true } }
      ]).exec(function (err, result) {
        if (err) {
          response.status(500).send({ error: err })
          return next(err);
        }
        else {
          var resource = result[0];
          var notification = new Array();
          for (var i = 0; i < resource.notification.length; i++) {
            var reslt = resource.notification[i];
            var array = {};
            array["triggeredByTruID"] = reslt.triggeredByTruID;
            array["notificationID"] = reslt.notificationID;
            array["dateAdded"] = reslt.dateAdded;
            array["notification"] = reslt.notification;
            array["notifyTo"] = reslt.notifyTo;
            array["type"] = reslt.type;
            array["subType"] = reslt.subType;
            array["isRead"] = reslt.isRead;
            array["dateRead"] = reslt.dateRead;
            notification.push(array)
          }

          var count = resource.count
          if (count === undefined) {
            count = 0;
          }
          var countUnread = resource.countUnread
          if (countUnread === undefined) {
            countUnread = 0;
          }
        }
        var Final = ({
          "notification": notification,
          "count": count,
          "countUnread": countUnread
        }
        )
        res.json({ status: "200", resource: Final })
      }
      )
    }
  }
  )
}
exports.entity_read_notification = function (req, res) {
  var truid = req.body.truid;
  var notificationid = req.body.notificationid;

  if (notificationid) {
    var query = { notifyTo: truid, notificationID: notificationid, isRead: false };
  } else {
    var query = { notifyTo: truid, isRead: false };
  }

  Notification.updateMany(query,
    { $set: { isRead: true } }, { returnNewDocument: true }).exec(function (err, result) {
      if (err) {
        res.json({ status: "500", message: "Internal Server Error" });
      } else {
        res.json({ status: "200", message: "Notification read successfully" });
      }
    })
}