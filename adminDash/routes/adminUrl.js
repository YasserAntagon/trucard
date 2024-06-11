var express = require('express');
var router = express.Router();
var iterator = require('./adminIterator');
var linkagesurl = iterator();
let sys_conf = require('../model/config/sys_conf');
let verifyOTP = require('../model/otp');
var consumerIterator = require('./consumerIterator');
var clinkagesurl = consumerIterator();

var dlinkagesurl = "";

var eiterator = require('./entityIterator');
var elinkagesurl = eiterator();
var culinkagesurl ="";

var Iiterator = require('./iterators');
var Ilinkagesurl = Iiterator();
router.get('/' + linkagesurl.home, function (req, res, next) {
  if (req.session.aTruID) {
    res.render('admin/dashboard', { title: "Home", config: sys_conf, aData: req.session.aData, linkurl: linkagesurl, dlinkurl: dlinkagesurl, clinkurl: clinkagesurl, elinkurl: elinkagesurl , culinkurl: culinkagesurl  });
  }
  else {
    redirecttoindex(req, res)
  }
});
router.get('/' + linkagesurl.verifyHash, function (req, res, next) {
  res.render('index', {
    title: 'Sign in',
    hash: "Your device has been successfully verified. Now you can login and continue..",
    linkages: Ilinkagesurl
  });
});


router.get('/' + linkagesurl.BulkEmail, function (req, res, next) {
  if (req.session.aTruID) {
    res.render('admin/BulkEmail', { title: "Bulk Email", config: sys_conf, aData: req.session.aData, linkurl: linkagesurl, dlinkurl: dlinkagesurl, clinkurl: clinkagesurl, elinkurl: elinkagesurl , culinkurl: culinkagesurl  });
  }
  else {
    redirecttoindex(req, res)
  }
});

router.get('/' + linkagesurl.BulkSMS, function (req, res, next) {
  if (req.session.aTruID) {
    res.render('admin/BulkSMS', { title: "Bulk SMS", config: sys_conf, aData: req.session.aData, linkurl: linkagesurl, dlinkurl: dlinkagesurl, clinkurl: clinkagesurl, elinkurl: elinkagesurl , culinkurl: culinkagesurl  });
  }
  else {
    redirecttoindex(req, res)
  }
});
router.get('/' + linkagesurl.lienRequest, function (req, res, next) {
  if (req.session.aTruID) {
    res.render('admin/lienRequest', { title: "Lien Request",isPartner:true, config: sys_conf, aData: req.session.aData, linkurl: linkagesurl, dlinkurl: dlinkagesurl, clinkurl: clinkagesurl, elinkurl: elinkagesurl , culinkurl: culinkagesurl  });
  }
  else {
    redirecttoindex(req, res)
  }
});
router.get('/' + linkagesurl.gsttransaction, function (req, res, next) {
  if (req.session.aTruID) {
    res.render('admin/gsttransaction', { title: "Txn-GST Report", config: sys_conf, aData: req.session.aData, linkurl: linkagesurl, dlinkurl: dlinkagesurl, clinkurl: clinkagesurl, elinkurl: elinkagesurl , culinkurl: culinkagesurl  });
  }
  else {
    redirecttoindex(req, res)
  }
});
router.get('/' + linkagesurl.stockReport, function (req, res, next) {
  if (req.session.aTruID) {
    res.render('admin/stockReport', { title: "Daily Stock Report", config: sys_conf, aData: req.session.aData, linkurl: linkagesurl, dlinkurl: dlinkagesurl, clinkurl: clinkagesurl, elinkurl: elinkagesurl , culinkurl: culinkagesurl  });
  }
  else {
    redirecttoindex(req, res)
  }
});


router.get('/' + linkagesurl.resetpass, function (req, res, next) {
  res.render('resetPassword', { title: "Reset Password", email: req.session.resetemail, config: sys_conf, linkurl: linkagesurl, dlinkurl: dlinkagesurl, clinkurl: clinkagesurl, elinkurl: elinkagesurl , culinkurl: culinkagesurl  });
}); 
router.get('/' + linkagesurl.verifyOTP, function (req, res, next) {
  let email = req.session.otpEmail;
  let mobile = req.session.otpmobile;
  if (email && mobile) {
    let json = JSON.stringify({
      "mobile": mobile,
      "email": email,
      "type": "mHash"
    });
    verifyOTP.sendOTP(json, function (error, body) {

      res.render('verifyOTP', { title: "Verify OTP", mobile: mobile, email: email, linkurl: linkagesurl, dlinkurl: dlinkagesurl, clinkurl: clinkagesurl, elinkurl: elinkagesurl , culinkurl: culinkagesurl  });
    });
  }
  else {
    redirecttoindex(req, res)
  }
});
router.get('/' + linkagesurl.cmpMaster, function (req, res, next) {
  if (req.session.aTruID) {
    res.render('admin/companyMaster', { title: "Company Master", config: sys_conf, aData: req.session.aData, linkurl: linkagesurl, dlinkurl: dlinkagesurl, clinkurl: clinkagesurl, elinkurl: elinkagesurl , culinkurl: culinkagesurl  });
  }
  else {
    redirecttoindex(req, res)
  }
});


router.get('/' + linkagesurl.branchList, function (req, res, next) {
  if (req.session.aTruID) {
    res.render('admin/branchList', { title: "Branch List", config: sys_conf, aData: req.session.aData, linkurl: linkagesurl, dlinkurl: dlinkagesurl, clinkurl: clinkagesurl, elinkurl: elinkagesurl , culinkurl: culinkagesurl  });
  }
  else {
    redirecttoindex(req, res)
  }
});
router.get('/' + linkagesurl.branchLocation, function (req, res, next) {
  if (req.session.aTruID) {
    res.render('admin/companyLocation', { title: "Branch Location", config: sys_conf, branchId: req.query.url, aData: req.session.aData, linkurl: linkagesurl, dlinkurl: dlinkagesurl, clinkurl: clinkagesurl, elinkurl: elinkagesurl , culinkurl: culinkagesurl  });
  }
  else {
    redirecttoindex(req, res)
  }
});



router.get('/' + linkagesurl.empReg, function (req, res, next) {
  if (req.session.aTruID) {
    res.render('admin/empReg', { title: "Employee Registration", config: sys_conf, aData: req.session.aData, linkurl: linkagesurl, dlinkurl: dlinkagesurl, clinkurl: clinkagesurl, elinkurl: elinkagesurl , culinkurl: culinkagesurl  });
  }
  else {
    redirecttoindex(req, res)
  }
});
router.get('/' + linkagesurl.creditCard, function (req, res, next) {
  if (req.session.aTruID) {
    res.render('admin/secureCredit', { title: "Secure Credit", config: sys_conf, aData: req.session.aData, linkurl: linkagesurl, dlinkurl: dlinkagesurl, clinkurl: clinkagesurl, elinkurl: elinkagesurl , culinkurl: culinkagesurl  });
  }
  else {
    redirecttoindex(req, res)
  }
});
router.get('/' + linkagesurl.empMaster, function (req, res, next) {
  if (req.session.aTruID) {
    let { params } = req.query;
    res.render('admin/empMaster', { title: "Employee Master", config: sys_conf, empid: params, aData: req.session.aData, linkurl: linkagesurl, dlinkurl: dlinkagesurl, clinkurl: clinkagesurl, elinkurl: elinkagesurl , culinkurl: culinkagesurl  });
  }
  else 
  {
    redirecttoindex(req, res)
  }
});
router.get('/' + linkagesurl.empList, function (req, res, next) {
  if (req.session.aTruID) {
    res.render('admin/employeeList', { title: "Employee List", config: sys_conf, aData: req.session.aData, linkurl: linkagesurl, dlinkurl: dlinkagesurl, clinkurl: clinkagesurl, elinkurl: elinkagesurl , culinkurl: culinkagesurl  });
  }
  else {
    redirecttoindex(req, res)
  }
});
router.get('/' + linkagesurl.setLBMA, function (req, res, next) {
  if (req.session.aTruID) {
    res.render('admin/setLBMARate', { title: "LBMA Rate", config: sys_conf, aData: req.session.aData, linkurl: linkagesurl, dlinkurl: dlinkagesurl, clinkurl: clinkagesurl, elinkurl: elinkagesurl , culinkurl: culinkagesurl  });
  }
  else {
    redirecttoindex(req, res)
  }
});
router.get('/' + linkagesurl.charges, function (req, res, next) {
  if (req.session.aTruID) {
    res.render('admin/charges', { title: "Charges", config: sys_conf, aData: req.session.aData, linkurl: linkagesurl, dlinkurl: dlinkagesurl, clinkurl: clinkagesurl, elinkurl: elinkagesurl , culinkurl: culinkagesurl  });
  }
  else {
    redirecttoindex(req, res)
  }
});
router.get('/' + linkagesurl.LBMAAnalysis, function (req, res, next) {
  if (req.session.aTruID) {
    res.render('admin/lbmaChart', { title: "LBMA Analysis", config: sys_conf, aData: req.session.aData, linkurl: linkagesurl, dlinkurl: dlinkagesurl, clinkurl: clinkagesurl, elinkurl: elinkagesurl , culinkurl: culinkagesurl  });
  }
  else {
    redirecttoindex(req, res)
  }
});
router.get('/' + linkagesurl.profile, function (req, res, next) {
  if (req.session.aTruID) {
    res.render('admin/profile', { title: "Profile", config: sys_conf, aData: req.session.aData, linkurl: linkagesurl, dlinkurl: dlinkagesurl, clinkurl: clinkagesurl, elinkurl: elinkagesurl , culinkurl: culinkagesurl  });
  }
  else {
    redirecttoindex(req, res)
  }
});

router.get('/' + linkagesurl.changepassword, function (req, res, next) {
  if (req.session.aTruID) {
    res.render('admin/changePassword', { title: "Change Password", config: sys_conf, aData: req.session.aData, linkurl: linkagesurl, dlinkurl: dlinkagesurl, clinkurl: clinkagesurl, elinkurl: elinkagesurl , culinkurl: culinkagesurl  });
  }
  else {
    redirecttoindex(req, res)
  }
});
router.get('/' + linkagesurl.changePIN, function (req, res, next) {
  if (req.session.aTruID) {
    res.render('admin/changePIN', { title: "Change Password", config: sys_conf, aData: req.session.aData, linkurl: linkagesurl, dlinkurl: dlinkagesurl, clinkurl: clinkagesurl, elinkurl: elinkagesurl , culinkurl: culinkagesurl  });
  }
  else {
    redirecttoindex(req, res)
  }
});
router.get('/' + linkagesurl.errorLogList, function (req, res, next) {
  if (req.session.aTruID) {
    res.render('admin/errorList', { title: "Error Log", config: sys_conf, aData: req.session.aData, linkurl: linkagesurl, dlinkurl: dlinkagesurl, clinkurl: clinkagesurl, elinkurl: elinkagesurl , culinkurl: culinkagesurl  });
  }
  else {
    redirecttoindex(req, res)
  }
});
router.get('/' + linkagesurl.serverReport, function (req, res, next) {
  if (req.session.aTruID) {
    res.render('admin/serverReport', { title: "Server Report", config: sys_conf, aData: req.session.aData, linkurl: linkagesurl, dlinkurl: dlinkagesurl, clinkurl: clinkagesurl, elinkurl: elinkagesurl , culinkurl: culinkagesurl  });
  }
  else {
    redirecttoindex(req, res)
  }
});
router.get('/' + linkagesurl.walletPayLog, function (req, res, next) {
  if (req.session.aTruID) {
    res.render('admin/paymentList', { title: "Payment List", config: sys_conf, aData: req.session.aData, linkurl: linkagesurl, dlinkurl: dlinkagesurl, clinkurl: clinkagesurl, elinkurl: elinkagesurl , culinkurl: culinkagesurl  });
  }
  else {
    redirecttoindex(req, res)
  }
});
router.get('/' + linkagesurl.VAaccountPending, function (req, res, next) {
  if (req.session.aTruID) {
    res.render('admin/VAaccountPending', { title: "Pending Virtual Account Transactions", config: sys_conf, aData: req.session.aData, linkurl: linkagesurl, dlinkurl: dlinkagesurl, clinkurl: clinkagesurl, elinkurl: elinkagesurl , culinkurl: culinkagesurl  });
  }
  else {
    redirecttoindex(req, res)
  }
});
router.get('/' + linkagesurl.paymentListNEW, function (req, res, next) {
  if (req.session.aTruID) {
    res.render('admin/paymentListNEW', { title: "Payment List", config: sys_conf, aData: req.session.aData, linkurl: linkagesurl, dlinkurl: dlinkagesurl, clinkurl: clinkagesurl, elinkurl: elinkagesurl , culinkurl: culinkagesurl  });
  }
  else {
    redirecttoindex(req, res)
  }
});

router.get('/' + linkagesurl.txnQueueList, function (req, res, next) {
  if (req.session.aTruID) {
    res.render('admin/txnQueueIntervention', { title: "Transaction Queue", config: sys_conf, aData: req.session.aData, linkurl: linkagesurl, dlinkurl: dlinkagesurl, clinkurl: clinkagesurl, elinkurl: elinkagesurl , culinkurl: culinkagesurl  });
  }
  else 
  {
    redirecttoindex(req, res)
  }
});
router.get('/' + linkagesurl.promotions, function (req, res, next) {
  if (req.session.aTruID) {
    res.render('admin/promotions', { title: "promotions", config: sys_conf, aData: req.session.aData, linkurl: linkagesurl, dlinkurl: dlinkagesurl, clinkurl: clinkagesurl, elinkurl: elinkagesurl , culinkurl: culinkagesurl  });
  }
  else {
    redirecttoindex(req, res)
  }
});
router.get('/' + linkagesurl.setRateFromAdmin, function (req, res, next) {
  if (req.session.aTruID) 
  {
    res.render('admin/setRateFromAdmin', { title: "Set Rate", config: sys_conf, aData: req.session.aData, linkurl: linkagesurl, dlinkurl: dlinkagesurl, clinkurl: clinkagesurl, elinkurl: elinkagesurl , culinkurl: culinkagesurl  });
  }
  else 
  {
    redirecttoindex(req, res)
  }
});
router.get('/' + linkagesurl.setStockFromAdmin, function (req, res, next) {
  if (req.session.aTruID) 
  {
    res.render('admin/setStockFromAdmin', { title: "Add Stock", config: sys_conf, aData: req.session.aData, linkurl: linkagesurl, dlinkurl: dlinkagesurl, clinkurl: clinkagesurl, elinkurl: elinkagesurl , culinkurl: culinkagesurl  });
  }
  else 
  {
    redirecttoindex(req, res)
  }
});




router.get('/' + linkagesurl.errorLog, function (req, res, next) {
  if (req.session.aTruID) {
    res.render('error', { title: "error", config: sys_conf, aData: req.session.aData, linkurl: linkagesurl, dlinkurl: dlinkagesurl, clinkurl: clinkagesurl, elinkurl: elinkagesurl , culinkurl: culinkagesurl  });
  }
  else {
    redirecttoindex(req, res)
  }
});
router.get('/' + linkagesurl.assetmanagerPortal, function (req, res, next) {
  if (req.session.aTruID) {
    res.render('assetmanager/dashboard', { title: "Home", config: sys_conf, aData: req.session.aData, linkurl: dlinkagesurl });
  }
  else {
    redirecttoindex(req, res)
  }
});




router.get('/' + linkagesurl.consumerPortal, function (req, res, next) {
  if (req.session.aTruID) {
    res.render('consumer/dashboard', { title: "Home", config: sys_conf, aData: req.session.aData, linkurl: clinkagesurl });
  }
  else {
    redirecttoindex(req, res)
  }
});
router.get('/' + linkagesurl.entityPortal, function (req, res, next) {
  if (req.session.aTruID) {
    res.render('entity/dashboard', { title: "Home", config: sys_conf, aData: req.session.aData, linkurl: elinkagesurl });
  }
  else {
    redirecttoindex(req, res)
  }
});
router.get('/' + linkagesurl.assetstorePortal, function (req, res, next) {
  if (req.session.aTruID) {
    res.render('assetstore/dashboard', { title: "Home", config: sys_conf, aData: req.session.aData, linkurl: culinkagesurl });
  }
  else {
    redirecttoindex(req, res)
  }
});







module.exports = router;
function redirecttoindex(req, res) {
  if (sys_conf.global.login == "disable") {
    var errors = {
      "statuscode": "Oops! 404",
      "errHead": "Something's not right!",
      "errMsg": "Authentication Required, Please contact to your administrator..!!"
    }
    req.session.errorMsg = JSON.stringify(errors);
    res.redirect("/" + linkagesurl.errorLog);
  }
  else {
    req.session.destroy();
    res.render('index', {
      title: 'Sign in',
      linkages: linkagesurl
    });
  }
}