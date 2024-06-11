var express = require('express');
var router = express.Router();
router.post('/template/email/:template', (req, res, next) => {
  res.render(`${req.params.template}`, {
    "resource": req.body.resource,
    "data": req.body.resource.particulars,
    "enquiryMail": process.env.infoUser
  })
})
router.post('/template/emailInv/:template', (req, res, next) => {
  res.render(`${req.params.template}`, {
    "resource": req.body.resource,
    "enquiryMail": process.env.infoUser
  })
})
router.post('/template/transfer/:template', (req, res, next) => {
  res.render(`${req.params.template}`, {
    "resource": req.body.resource,
    "data": req.body.resource.particulars,
    "sender": req.body.sender,
    "enquiryMail": process.env.infoUser
  })
})
router.post('/template/semail/:template', (req, res, next) => {
  res.render(`${req.params.template}`, {
    "resource": req.body.resource,
    "enquiryMail": process.env.infoUser
  })
})
router.post('/template/allemails/:template', (req, res, next) => {
  res.render(`${req.params.template}`, {
    welcomeName: req.body.welcomeName,
    message: req.body.message,
    msgHeading: req.body.msgHeading,
    refName: req.body.refName,
    type: req.body.type,
    "enquiryMail": process.env.infoUser
  })
})
router.post('/template/schedule/:template', (req, res, next) => {
  res.render(`${req.params.template}`, {
    "data": req.body.resource,
    "enquiryMail": process.env.infoUser
  })
})
router.post('/template/verifye/:template', (req, res, next) => {
  res.render(`${req.params.template}`, {
    "welcomeName": req.body.resource.name,
    "link": req.body.resource.verifyLink,
    "otp": req.body.resource.otp,
    "enquiryMail": process.env.infoUser
  })
})
router.post('/template/addMoney/:template', (req, res, next) => {
  res.render(`${req.params.template}`, {
    "data": req.body.resource,
    "enquiryMail": process.env.infoUser
  })
})
router.post('/template/kycActivation/:template', (req, res, next) => {
  res.render(`${req.params.template}`, {
    "data": req.body.resource,
    "enquiryMail": process.env.infoUser
  })
})
module.exports = router;
