var express = require('express');
var router = express.Router();
var iterator = require('./entityIterator');
var entityLink = iterator();
var loadTrans = require('../model/entity/db/entityData');
let sys_conf = require('../model/config/sys_conf');
let summaryDB = require('../model/entity/summaryDB');
var aiterator = require('./adminIterator');
var aLink = aiterator();
//var entityDb = require('../model/entity/getEntity');
var md5 = require('md5');
router.get('/' + entityLink.ehome, function (req, res, next) {
  if (req.session.aTruID) {
    res.render('entity/dashboard', { title: "Home", config: sys_conf, aData: req.session.aData, linkurl: entityLink });
  }
  else {
    redirecttoindex(req, res)
  }
});
router.get('/' + entityLink.home, function (req, res, next) {
  if (req.session.aTruID) {
    res.render('admin/dashboard', { title: "Home", config: sys_conf, aData: req.session.aData, linkurl: aLink });
  }
  else {
    redirecttoindex(req, res)
  }
});

router.get('/' + entityLink.eBulkEmail, function (req, res, next) {
  if (req.session.aTruID) {
    breadcrumbList = "Partner Details/Partner Bulk Email";
    breadcrumbUrl = entityLink.entityDetails;
    res.render('entity/eBulkEmail', { title: "Bulk Email", config: sys_conf, eData: req.session.eData, aData: req.session.aData, linkurl: entityLink, breadcrumbs: get_breadcrumbs(breadcrumbList, breadcrumbUrl) });
  }
  else {
    redirecttoindex(req, res)
  }
});


router.get('/' + entityLink.ephome, function (req, res, next) {
  if (req.session.aTruID) {
    res.render('entity/entityDetails', { title: "Partner Details", config: sys_conf, aData: req.session.aData, eData: req.session.eData, linkurl: entityLink });
  }
  else {
    redirecttoindex(req, res)
  }
});
router.get('/' + entityLink.entitySearch, function (req, res, next) {
  if (req.session.aTruID) {
    res.render('entity/entitySearch', { title: "Search Partner", config: sys_conf, msg: false, aData: req.session.aData, linkurl: entityLink });
  }
  else {
    redirecttoindex(req, res)
  }
});
router.get('/' + entityLink.entitylist, function (req, res, next) {
  if (req.session.aTruID) {
    res.render('entity/entitylist', { title: "Partner Details", config: sys_conf, aData: req.session.aData, eData: req.session.eData, linkurl: entityLink });
  }
  else {
    redirecttoindex(req, res)
  }
});
router.get('/' + entityLink.createEntity, function (req, res, next) {
  if (req.session.aTruID) {
    res.render('entity/createEntity', { title: "Create Partner", config: sys_conf, aData: req.session.aData, eData: req.session.eData, linkurl: entityLink });
  }
  else {
    redirecttoindex(req, res)
  }
});
router.get('/openPartnerDash', function (req, res, next) {

  if (req.session.aTruID) {
    var { id } = req.query;
    if (id) {
      var query = JSON.stringify({
        rTruID: id,
        truID: req.session.aTruID
      })
      summaryDB.getPartnerDetails(query, function (err,ress)   // company data got from Lokijs
      {
        loadTrans.insertEntityData(ress[0], ress[0].truID);
        ress[0].MD5=md5(ress[0].CRNNo)
        req.session.eData = ress[0];
        /*    if (ress.resource.isParent) { */
        breadcrumbList = "Partner Details/Partner Report";
        /*  } else {
           breadcrumbList = "Partner Details/Stock Details";
         } */
        breadcrumbUrl = entityLink.entityDetails;
        res.render('entity/entityDetails', { title: "Partner Details", config: sys_conf, eData: ress[0], aData: req.session.aData, linkurl: entityLink, breadcrumbs: get_breadcrumbs(breadcrumbList, breadcrumbUrl) });

      })
    }
    else {
      res.render('entity/entitySearch', { title: "Search Partner", config: sys_conf, msg: false, aData: req.session.aData, linkurl: entityLink });
    }
  }
  else {
    redirecttoindex(req, res)
  }
})
router.get('/' + entityLink.enconsumerlist, function (req, res, next) {
  if (req.session.aTruID) {
    breadcrumbList = "Partner Details/Consumer List";
    breadcrumbUrl = entityLink.entityDetails;
    res.render('entity/enconsumerlist', { title: "Consumer List", config: sys_conf, aData: req.session.aData, eData: req.session.eData, linkurl: entityLink, breadcrumbs: get_breadcrumbs(breadcrumbList, breadcrumbUrl) });
  }
  else {
    redirecttoindex(req, res)
  }
});
router.get('/' + entityLink.enONodeList, function (req, res, next) {
  if (req.session.aTruID) {
    var id = req.query.id;
    res.render('entity/entityNodeOuterList', { title: "Partner Node List", config: sys_conf, aData: req.session.aData, truID: id, linkurl: entityLink });
  }
  else {
    redirecttoindex(req, res)
  }
});
router.get('/' + entityLink.enNodeList, function (req, res, next) {
  if (req.session.aTruID) {
    breadcrumbList = "Partner Details/Node List";
    breadcrumbUrl = entityLink.entityDetails;
    res.render('entity/nodelist', { title: "Partner Node List", config: sys_conf, aData: req.session.aData, eData: req.session.eData, linkurl: entityLink, breadcrumbs: get_breadcrumbs(breadcrumbList, breadcrumbUrl) });
  }
  else {
    redirecttoindex(req, res)
  }
});
router.get('/' + entityLink.accessPermission, function (req, res, next) {
  if (req.session.aTruID) {
    breadcrumbList = "Partner Details/Access Permission";
    breadcrumbUrl = entityLink.entityDetails;
    res.render('entity/individualConfiguration', { title: "Access Permission", config: sys_conf, aData: req.session.aData, eData: req.session.eData, linkurl: entityLink, breadcrumbs: get_breadcrumbs(breadcrumbList, breadcrumbUrl), pgPermissionEnable:false });
  }
  else {
    redirecttoindex(req, res)
  }
});
router.get('/' + entityLink.configremmit, function (req, res, next) {
  if (req.session.aTruID) {
    res.render('entity/configremmit', { title: "Configurations", config: sys_conf, aData: req.session.aData, linkurl: entityLink, pgPermissionEnable:true });
  }
  else {
    redirecttoindex(req, res)
  }
});

router.get('/' + entityLink.consumersummary, function (req, res, next) {
  if (req.session.aTruID) {
    res.render('entity/consumersummary', { title: "Consumer Summary", config: sys_conf, aData: req.session.aData, eData: req.session.eData, linkurl: entityLink });
  }
  else {
    redirecttoindex(req, res)
  }
});
router.get('/' + entityLink.entityProfile, function (req, res, next) {
  if (req.session.aTruID) {
    breadcrumbList = "Partner Details/Partner Profile";
    breadcrumbUrl = entityLink.entityDetails;
    res.render('entity/entityProfile', { title: "Partner Profile", config: sys_conf, aData: req.session.aData, eData: req.session.eData, linkurl: entityLink, breadcrumbs: get_breadcrumbs(breadcrumbList, breadcrumbUrl) });
  }
  else {
    redirecttoindex(req, res)
  }
});
router.get('/' + entityLink.entityPermission, function (req, res, next) {
  if (req.session.aTruID) {
    breadcrumbList = "Partner Details/Permissions";
    breadcrumbUrl = entityLink.entityDetails;
    res.render('entity/entityPermission', { title: "Partner Permission", config: sys_conf, aData: req.session.aData, eData: req.session.eData, linkurl: entityLink, breadcrumbs: get_breadcrumbs(breadcrumbList, breadcrumbUrl) });
  }
  else {
    redirecttoindex(req, res)
  }
});
router.get('/' + entityLink.entityReport, function (req, res, next) {
  if (req.session.aTruID) {
    breadcrumbList = "Partner Details/Partner Report";
    breadcrumbUrl = entityLink.entityDetails;
    res.render('entity/entityReport', { title: "Partner Report", config: sys_conf, aData: req.session.aData, eData: req.session.eData, linkurl: entityLink, breadcrumbs: get_breadcrumbs(breadcrumbList, breadcrumbUrl) });
  }
  else {
    redirecttoindex(req, res)
  }
});
router.get('/' + entityLink.entityAddress, function (req, res, next) {
  if (req.session.aTruID) {
    breadcrumbList = "Partner Details/Partner Address";
    breadcrumbUrl = entityLink.entityDetails;
    res.render('entity/entityaddress', { title: "Partner Address", config: sys_conf, aData: req.session.aData, eData: req.session.eData, linkurl: entityLink, breadcrumbs: get_breadcrumbs(breadcrumbList, breadcrumbUrl) });
  }
  else {
    redirecttoindex(req, res)
  }
});

router.get('/' + entityLink.entityWallet, function (req, res, next) {
  if (req.session.aTruID) {
    breadcrumbList = "Partner Details/Stock Details";
    breadcrumbUrl = entityLink.entityDetails;
    res.render('entity/entityWallet', { iswallet: true, title: "Partner Wallet", config: sys_conf, aData: req.session.aData, eData: req.session.eData, linkurl: entityLink, breadcrumbs: get_breadcrumbs(breadcrumbList, breadcrumbUrl) });
  }
  else
  {
    redirecttoindex(req, res)
  }
});

router.get('/' + entityLink.walletManagment, function (req, res, next) {
  if (req.session.aTruID) {
    breadcrumbList = "Partner Details/Wallet Managment";
    breadcrumbUrl = entityLink.entityDetails;
    res.render('entity/entityWallet', { iswallet: false, title: "Wallet Managment", config: sys_conf, aData: req.session.aData, eData: req.session.eData, linkurl: entityLink, breadcrumbs: get_breadcrumbs(breadcrumbList, breadcrumbUrl) });
  }
  else {
    redirecttoindex(req, res)
  }
});
router.get('/' + entityLink.KYCDoc, function (req, res, next) {
  if (req.session.aTruID) {
    breadcrumbList = "Partner Details/KYC Details";
    breadcrumbUrl = entityLink.entityDetails;
    res.render('entity/KYCDoc', { title: "KYCDoc", config: sys_conf, aData: req.session.aData, eData: req.session.eData, linkurl: entityLink, breadcrumbs: get_breadcrumbs(breadcrumbList, breadcrumbUrl) });
  }
  else {
    redirecttoindex(req, res)
  }
});

router.get('/' + entityLink.setTxnLimit, function (req, res, next) {
  if (req.session.aTruID) {
    breadcrumbList = "Partner Details/Partner Transaction Limit";
    breadcrumbUrl = entityLink.entityDetails;
    res.render('entity/setTxnlimit', { title: "Transaction Limit", config: sys_conf, aData: req.session.aData, eData: req.session.eData, linkurl: entityLink, breadcrumbs: get_breadcrumbs(breadcrumbList, breadcrumbUrl) });
  }
  else {
    redirecttoindex(req, res)
  }
});
router.get('/' + entityLink.transactions, function (req, res, next) {
  if (req.session.aTruID) {
    breadcrumbList = "Partner Details/Partner Transactions";
    breadcrumbUrl = entityLink.entityDetails;
    res.render('entity/entitytransaction', { title: "Transaction Report", config: sys_conf, aData: req.session.aData, eData: req.session.eData, linkurl: entityLink, breadcrumbs: get_breadcrumbs(breadcrumbList, breadcrumbUrl) });
  }
  else {
    redirecttoindex(req, res)
  }
});
router.get('/' + entityLink.gstBreakup, function (req, res, next) {
  if (req.session.aTruID) {
    breadcrumbList = "Analysis / GST Report";
    breadcrumbUrl = entityLink.floatManagment;
    res.render('entity/gstBreakup', { title: "GST Report", config: sys_conf, aData: req.session.aData, eData: req.session.eData, linkurl: entityLink, breadcrumbs: get_breadcrumbs(breadcrumbList, breadcrumbUrl) });
  }
  else {
    redirecttoindex(req, res)
  }
});

router.get('/' + entityLink.chargesDeductedFromFloat, function (req, res, next) {
  if (req.session.aTruID) {
    breadcrumbList = "Reversals";
    breadcrumbUrl = entityLink.chargesDeductedFromFloat;
    res.render('entity/chargesDeductedFromFloat', { title: "Reversals", config: sys_conf, aData: req.session.aData, eData: req.session.eData, linkurl: entityLink, breadcrumbs: get_breadcrumbs(breadcrumbList, breadcrumbUrl) });
  }
  else {
    redirecttoindex(req, res)
  }
});

router.get('/' + entityLink.entityAnalysis, function (req, res, next) {
  if (req.session.aTruID) {
    breadcrumbList = "Partner Details/Purchase Chart";
    breadcrumbUrl = entityLink.entityDetails;
    res.render('entity/entityAnalysis', { title: "Transactions", config: sys_conf, aData: req.session.aData, eData: req.session.eData, linkurl: entityLink, breadcrumbs: get_breadcrumbs(breadcrumbList, breadcrumbUrl) });
  }
  else {
    redirecttoindex(req, res)
  }
});



module.exports = router;


get_breadcrumbs = function (acc, url) {
  var rtn = [{ name: "Home", url: entityLink.ehome }],
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
      linkages: entityLink
    });
  } */
}