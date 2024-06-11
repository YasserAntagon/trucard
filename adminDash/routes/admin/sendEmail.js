var express = require('express');
var router = express.Router();
var mail = require('../../model/admin/mail');
var consumerTrans = require('../../model/consumer/db/consumerData');
var assetmanagerTrans = require('../../model/assetmanager/db/assetmanagerData');
var entityTrans = require('../../model/entity/db/entityData');
var errLog = require('../../model/config/db/errLogDb');
const dotenv = require('dotenv').config();
router.post('/sendBulkEmail', function (req, response, next) {
  try {
    if (req.session.aTruID) {
      let data = req.body;
      let jdata = JSON.stringify({
        "truID": req.session.aTruID,
        "to": data.to,
        "flag": data.flag,
        "subject": data.subject,
        "body": data.body
      });
      mail.mailSend(jdata, function (err, res) {
        response.send({
          "status": 200,
          "message": res
        })
      })
    } else {
      res.render('index', {
        title: 'Sign In'
      });
    }
  }
  catch (ex) {
  }
})
router.post('/sendEmailToPerticular', function (req, response, next) {
  try {
    if (req.session.aTruID) {
      let data = req.body;
      let jdata = JSON.stringify({
        "truID": req.session.aTruID,
        "to": data.to,
        "flag": data.flag,
        "subject": data.subject,
        "bodyData": data.body,
        "attach": data.attach
      });
      mail.mailEntitySend(jdata, function (err, res) {
        response.send({ "status": 200, "message": res })
      })
    } else {
      res.render('index', {
        title: 'Sign In'
      });
    }
  }
  catch (ex) {
  }
})
router.post('/sendBulkSMS', function (req, response, next) {
  try {
    if (req.session.aTruID) {

      let data = req.body;
      let jdata = JSON.stringify({
        "truID": req.session.aTruID,
        "to": data.to,
        "body": data.body
      });
      mail.SMSSend(jdata, function (err, res) {
        response.send({
          "status": 200,
          "message": res
        })
      })
    } else if (process.env.NODE_ENV == "dev") {
      response.send({
        "status": 200,
        "message": "Sent"
      })
    }
  }
  catch (ex) {
  }
})
router.post('/getConsumerSMSEmail', function (req, response, next) {
  try {
    if (req.session.aTruID) {
      let query = { '$and': [{ 'KYCFlag': { '$in': ['pending', 'active'] } }, { channel: "Direct" }] }
      if (req.body.flag == "all") {
        query = { 'KYCFlag': { '$in': ['pending', 'active'] } }
      }
      consumerTrans.getConsumerList(query, function (res) {
        response.send({
          body: res,
          status: "200"
        })
      })
    } else {
      res.render('index', {
        title: 'Sign In'
      });
    }

  }
  catch (ex) {
    errLog.insertErrorLog(ex, req.session.aTruID, "getConsumerSMSEmail", "route/sendEmail/getConsumerSMSEmail");
  }
})

router.post('/getAssetManagerSMSEmail', function (req, response, next) {
  try {
    if (req.session.aTruID) {


      let query = { 'KYCFlag': 'active' }
      assetmanagerTrans.getAssetManagerList(query, function (res) {
        response.send({
          body: res,
          status: "200"
        })
      })
    } else {
      res.render('index', {
        title: 'Sign In'
      });
    }

  }
  catch (ex) {
    errLog.insertErrorLog(ex, req.session.aTruID, "getAssetManagerSMSEmail", "route/sendEmail/getAssetManagerSMSEmail");
  }
})
router.post('/getEntitySMSEmail', function (req, response, next) {
  try {
    if (req.session.aTruID) {
      let query = { 'isParent': true }
      if (req.body.flag == "all") {
        query = {}
      }
      entityTrans.getEntityList(query, function (res) {
        response.send({
          body: res,
          status: "200"
        })
      })
    } else {
      res.render('index', {
        title: 'Sign In'
      });
    }

  }
  catch (ex) {
    errLog.insertErrorLog(ex, req.session.aTruID, "getEntitySMSEmail", "route/sendEmail/getEntitySMSEmail");
  }
})
router.post('/getAllConsumerSMSEmail', function (req, response, next) {
  try {
    if (req.session.aTruID) {
      if (req.session.eData) {
        let eData = req.session.eData;
        let MT_TYPE = eData.MID;
        let action = req.body.action;
        let query = { '$and': [{ 'KYCFlag': { '$in': ['pending', 'active'] }, 'referenceTruID': req.body.parentID }] }
        if (req.body.isParent === "true" || req.body.isParent === true) { // change here using MT_TYPE 
          query = { '$and': [{ 'KYCFlag': { '$in': ['pending', 'active'] }, 'MT_Type': MT_TYPE }] }
        }
        consumerTrans.getConsumerList(query, function (res) {
          response.send({
            body: res,
            status: "200"
          })
        })
      } else {
        res.render('index', {
          title: 'Sign In'
        });
      }
    } else {
      res.render('index', {
        title: 'Sign In'
      });
    }

  }
  catch (ex) {
    errLog.insertErrorLog(ex, req.session.aTruID, "getAllConsumerSMSEmail", "route/sendEmail/getAllConsumerSMSEmail");
  }
})
router.post('/getAllEntitySMSEmail', function (req, response, next) {
  try {
    if (req.session.aTruID) {
      let query = { '$and': [{ 'KYCFlag': "active", 'parentTruID': req.body.parentID, 'isParent': false }] }
      
      entityTrans.getEntityList(query, function (res) {
        response.send({
          body: res,
          status: "200"
        })
      })
    } else {
      res.render('index', {
        title: 'Sign In'
      });
    }
  }
  catch (ex) {
    errLog.insertErrorLog(ex, req.session.aTruID, "getAllEntitySMSEmail", "route/sendEmail/getAllEntitySMSEmail");
  }
})
module.exports = router;