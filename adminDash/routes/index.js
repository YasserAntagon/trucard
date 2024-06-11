var express = require('express');
var errLog = require('../model/config/db/errLogDb');
let sys_conf = require('../model/config/sys_conf');
var router = express.Router();
var iterator = require('./iterators');
var linkages = iterator();
/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'Sign in',
    hash: "",
    linkages: linkages
  });
});



router.get('/' + linkages.logout, function (req, res, next) {
  redirecttoindex(req, res) 
});
router.get('/' + linkages.signup + '', function (req, res, next) {
  req.session.destroy();
  res.render('signup', {
    title: 'Registration',
    linkages: linkages
  });
});

router.get('/' + linkages.forgot + '', function (req, res, next) {
  res.render('forgot', {
    title: 'Forgot Password',
    linkages: linkages
  });
});

router.get('/' + linkages.resetPass + '', function (req, res, next) {
  if (req.session.resetemail) {
    res.render('resetPassword', {
      title: 'reset Password',
      linkages: linkages,
      resetemail: req.session.resetemail
    });
  } else {
    redirecttoindex(req, res)
  }
});

router.get('/' + linkages.updateKyc + '', function (req, res, next) {
  if (req.session.ukTruid) {
    res.render('updateKyc', {
      title: 'Update KYC',
      linkages: linkages
    });
  } else {
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
    res.redirect("/" + linkages.errorLog);
  }
  else {
    req.session.destroy();
    res.render('index', {
      title: 'Sign in',
      linkages: linkages
    });
  }
}