var express = require('express');
var router = express.Router();
var iterator = require('./consumerIterator');
var consumerLink = iterator();
var aiterator = require('./adminIterator');
var aLink = aiterator();
let sys_conf = require('../model/config/sys_conf');
var consumerDb = require('../model/consumer/getconsumer');
var loadTrans = require('../model/consumer/db/consumerData');
router.get('/' + consumerLink.chome, function (req, res, next) {
  if (req.session.aTruID) {
    res.render('consumer/dashboard', { title: "Home", config: sys_conf, aData: req.session.aData, linkurl: consumerLink });
  }
  else {
    redirecttoindex(req, res)
  }
});
router.get('/' + consumerLink.home, function (req, res, next) {
  if (req.session.aTruID) {
    res.render('admin/dashboard', { title: "Home", config: sys_conf, aData: req.session.aData, linkurl: aLink });
  }
  else {
    redirecttoindex(req, res)
  }
});
router.get('/' + consumerLink.cphome, function (req, res, next) {
  if (req.session.aTruID) {
    breadcrumbList = "Consumer Details/Stock Details";
    breadcrumbUrl = consumerLink.consumerDetails;
    res.render('consumer/consumerDetails', { title: "Consumer Details", config: sys_conf, cData: req.session.consumer, aData: req.session.aData, linkurl: consumerLink, breadcrumbs: get_breadcrumbs(breadcrumbList, breadcrumbUrl) });
  }
  else {
    redirecttoindex(req, res)
  }
});
router.get('/' + consumerLink.searchConsumer, function (req, res, next) {
  if (req.session.aTruID) {
    res.render('consumer/searchConsumer', { title: "Search Consumer", config: sys_conf, msg:false, aData: req.session.aData, linkurl: consumerLink });
  }
  else {
    redirecttoindex(req, res)
  }
});
router.get('/' + consumerLink.consumerlist, function (req, res, next) {
  if (req.session.aTruID) {
    res.render('consumer/consumerlist', { title: "Consumer Details", config: sys_conf, aData: req.session.aData, linkurl: consumerLink });
  }
  else {
    redirecttoindex(req, res)
  }
}); 
router.get('/' + consumerLink.docVerifyList, function (req, res, next) {
  if (req.session.aTruID) {
    res.render('consumer/docVerifyList', { title: "Consumer Details", config: sys_conf, aData: req.session.aData, linkurl: consumerLink });
  }
  else {
    redirecttoindex(req, res)
  }
});
router.get('/' + consumerLink.consumerForm, function (req, res, next) {
  if (req.session.aTruID) {
    res.render('consumer/consumerForm', { title: "create Consumer", config: sys_conf, cData: req.session.consumer, aData: req.session.aData, linkurl: consumerLink });
  }
  else {
    redirecttoindex(req, res)
  }
});

router.get('/openConsumerDash', function (req, res, next) {

  try {
    if (req.session.aTruID) {
      var id = req.query.id; 
      if (id) {
        var query = JSON.stringify({
          cTruID: id,
          truID: req.session.aTruID
        })
        consumerDb.getConsumerdetails(query, function (err,ress)   // company data got from Lokijs
        {
          if (ress.status == "200") {
            var consumerdetails = {
              "fName": ress.resource.fName,
              "lName": ress.resource.lName,
              "truID": ress.resource.truID,
              "KYCFlag": ress.resource.KYCFlag,
              "docVerified": ress.resource.docVerified,
              "image": ress.resource.image,
              "permanentAddress": ress.resource.permanentAddress,
              "assetstore": ress.resource.assetstore
            }
            loadTrans.insertconsumerData(ress); 
            req.session.consumer = consumerdetails;
            breadcrumbList = "Consumer Details/Stock Details";
            breadcrumbUrl = consumerLink.consumerDetails;
            res.render('consumer/consumerDetails', { title: "Consumer Details", config: sys_conf, cData: req.session.consumer, aData: req.session.aData, linkurl: consumerLink, breadcrumbs: get_breadcrumbs(breadcrumbList, breadcrumbUrl) });
          }
          else {
            res.render('consumer/searchConsumer', { title: "Search Consumer", config: sys_conf, msg: ress, aData: req.session.aData, linkurl: consumerLink })
          }
        })
      }
      else {
        res.render('consumer/searchConsumer', { title: "Search Consumer", config: sys_conf, msg:false, aData: req.session.aData, linkurl: consumerLink });
      }
    } else {
      redirecttoindex(req, res)
    }
  }
  catch (ex) {
    errLog.insertErrorLog(ex, req.session.aTruID, "searchConsumerdetails", "route/consumer/ConsumerList");
  }

});

router.get('/' + consumerLink.configConsumer, function (req, res, next) {
  if (req.session.aTruID) {
    res.render('consumer/configConsumer', { title: "Configurations", config: sys_conf, aData: req.session.aData, linkurl: consumerLink,pgPermissionEnable:true });
  }
  else {
    redirecttoindex(req, res)
  }
});
router.get('/' + consumerLink.individualConfiguration, function (req, res, next) {
  if (req.session.aTruID) {
    breadcrumbList = "Consumer Details/Consumer Configurations";
    breadcrumbUrl = consumerLink.consumerDetails;
    res.render('consumer/individualConfiguration', { title: "Consumer Configurations", config: sys_conf, cData: req.session.consumer, aData: req.session.aData, linkurl: consumerLink, breadcrumbs: get_breadcrumbs(breadcrumbList, breadcrumbUrl) , pgPermissionEnable:false});
  }
  else {
    redirecttoindex(req, res)
  }
});
router.get('/' + consumerLink.cprofile, function (req, res, next) {
  if (req.session.aTruID) {
    breadcrumbList = "Consumer Details/Profile Details";
    breadcrumbUrl = consumerLink.consumerDetails;
    res.render('consumer/consumerProfile', { title: "Profile", config: sys_conf, cData: req.session.consumer, aData: req.session.aData, linkurl: consumerLink, breadcrumbs: get_breadcrumbs(breadcrumbList, breadcrumbUrl) });
  }
  else {
    redirecttoindex(req, res)
  }
});
router.get('/' + consumerLink.consumerKYC, function (req, res, next) {
  if (req.session.aTruID) {
    breadcrumbList = "Consumer Details/KYC Details";
    breadcrumbUrl = consumerLink.consumerDetails;
    res.render('consumer/KYCdoc', { title: "KYC Documents", config: sys_conf, cData: req.session.consumer, aData: req.session.aData, linkurl: consumerLink, breadcrumbs: get_breadcrumbs(breadcrumbList, breadcrumbUrl) });
  }
  else {
    redirecttoindex(req, res)
  }
});
router.get('/' + consumerLink.consumerAddress, function (req, res, next) {
  if (req.session.aTruID) {
    breadcrumbList = "Consumer Details/Consumer Address";
    breadcrumbUrl = consumerLink.consumerDetails;
    res.render('consumer/consumerAddress', { title: "Address", config: sys_conf, cData: req.session.consumer, aData: req.session.aData, linkurl: consumerLink, breadcrumbs: get_breadcrumbs(breadcrumbList, breadcrumbUrl) });
  }
  else {
    redirecttoindex(req, res)
  }
});
router.get('/' + consumerLink.gstcBreakup, function (req, res, next) {
  if (req.session.aTruID) {
    breadcrumbList = "Consumer Details / GST Report";
    breadcrumbUrl = consumerLink.consumerDetails;
    res.render('consumer/gstBreakup', { title: "GSt Report", config: sys_conf, cData: req.session.consumer, aData: req.session.aData, linkurl: consumerLink, breadcrumbs: get_breadcrumbs(breadcrumbList, breadcrumbUrl) });
  }
  else {
    redirecttoindex(req, res)
  }
});

router.get('/' + consumerLink.consumerPermission, function (req, res, next) {
  if (req.session.aTruID) {
    breadcrumbList = "Consumer Details/Permissions";
    breadcrumbUrl = consumerLink.consumerDetails;
    res.render('consumer/consumerpermission', { title: "Permissions", config: sys_conf, cData: req.session.consumer, aData: req.session.aData, linkurl: consumerLink, breadcrumbs: get_breadcrumbs(breadcrumbList, breadcrumbUrl) });
  }
  else {
    redirecttoindex(req, res)
  }
});
router.get('/' + consumerLink.cuBalanceHold, function (req, res, next) {
  if (req.session.aTruID) {
    breadcrumbList = "Consumer Details/Balances onHold";
    breadcrumbUrl = consumerLink.consumerDetails;
    res.render('consumer/cuBalanceHold', { title: "Balances onHold",isFloat:false, config: sys_conf, cData: req.session.consumer, aData: req.session.aData, linkurl: consumerLink, breadcrumbs: get_breadcrumbs(breadcrumbList, breadcrumbUrl) });
  }
  else {
    redirecttoindex(req, res)
  }
}); 
router.get('/' + consumerLink.locking, function (req, res, next) {
  if (req.session.aTruID) {
    breadcrumbList = "Consumer Details/Locking";
    breadcrumbUrl = consumerLink.consumerDetails;
    res.render('consumer/locking', { title: "Permissions", config: sys_conf, cData: req.session.consumer, aData: req.session.aData, linkurl: consumerLink, breadcrumbs: get_breadcrumbs(breadcrumbList, breadcrumbUrl) });
  }
  else {
    redirecttoindex(req, res)
  }
});
router.get('/' + consumerLink.Transactions, function (req, res, next) {
  if (req.session.aTruID) {
    breadcrumbList = "Consumer Details/Consumer Transactions";
    breadcrumbUrl = consumerLink.consumerDetails;
    res.render('consumer/consumerGSTTxn', { title: "Consumer Transactions", config: sys_conf, cData: req.session.consumer, aData: req.session.aData, linkurl: consumerLink, breadcrumbs: get_breadcrumbs(breadcrumbList, breadcrumbUrl) });
  }
  else {
    redirecttoindex(req, res)
  }
});

module.exports = router;

get_breadcrumbs = function (acc, url) {
  var rtn = [{ name: "Home", url: consumerLink.chome }],
    arr = acc.split("/");
  arr1 = url.split("/");

  for (i = 0; i < arr.length; i++) {
    accurl = (i == arr1.length - 1) ? arr1[i] : null;
    rtn[i + 1] = { name: titleCase(arr[i]), url: accurl };
  }
  return rtn;
};
function titleCase(str) {
  var splitStr = str.toLowerCase().split(' ');
  for (var i = 0; i < splitStr.length; i++) {
    // You do not need to check if i is larger than splitStr length, as your for does that for you
    // Assign it back to the array
    splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1).toLowerCase();
  }
  // Directly return the joined string
  return splitStr.join(' ');
}
function redirecttoindex(req, res) {
  /*  if (sys_conf.global.login == "disable") { */
  var errors = {
    "statuscode": "Oops! 404",
    "errHead": "Something's not right!",
    "errMsg": "Authentication Required, Please contact to your consumeristrator..!!"
  }
  req.session.errorMsg = JSON.stringify(errors);
  res.redirect("/" + aLink.errorLog);
  /* }
  else {
    req.session.destroy();
    res.render('index', {
      title: 'Sign in',
      linkages: consumerLink
    });
  } */
}