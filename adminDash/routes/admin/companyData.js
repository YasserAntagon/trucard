var express = require('express');
var companyDB = require('../../model/admin/companyMasterDB');
var companyLocationDB = require('../../model/admin/companyLocationDB');
var companyLoki = require('../../model/admin/db/companyData');
var errLog = require('../../model/config/db/errLogDb');
var cmpData = require('../../model/admin/db/cmpData');
var brData = require('../../model/admin/db/branchList');
var iterator = require('../adminIterator');
var linkages = iterator();
var router = express.Router();
router.post('/saveCompanyData', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].cTruID = req.session.CoTruID;
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            if (req.session.CoTruID) {
                companyDB.updateCompanyData(json, function (err, res) {
                    response.send({
                        body: res,
                        page: linkages.home
                    })
                })
            } else {
                companyDB.saveCompanyData(json, function (err, res) {
                    req.session.CoTruID = res.truID
                    response.send({
                        body: res,
                        page: linkages.home
                    })
                })
            }

        } else {
            res.render('index', {
                title: 'Sign In'
            });
        }

    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.aTruID, "saveCompanyData", "CompanyData");
    }
})
router.post('/saveCompanyLocationData', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            contain.objectArr[0].cTruID = req.session.CoTruID;
            contain.objectArr[0].referenceTruID = req.session.aTruID;
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            companyLocationDB.saveCompanyLocationData(json, function (err, res) {
                response.send({
                    body: res,
                    page: linkages.home
                })
            })
        } else {
            res.render('index', {
                title: 'Sign In'
            });
        }

    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.aTruID, "saveCompanyData", "CompanyData");
    }
})
router.post('/updateCompanyLocationData', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            companyLocationDB.updateCompanyLocationData(json, function (err, res) {
                response.send({
                    body: res,
                    page: linkages.home
                })
            })
        } else {
            res.render('index', {
                title: 'Sign In'
            });
        }

    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.aTruID, "saveCompanyData", "CompanyData");
    }
})
router.post('/saveOwnerData', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            companyLocationDB.saveOwnerData(json, function (err, res) {
                response.send({
                    body: res,
                    page: linkages.home
                })
            })
        } else {
            res.render('index', {
                title: 'Sign In'
            });
        }

    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.aTruID, "saveCompanyData", "CompanyData");
    }
})
router.post('/companyLocationAddress', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            companyLocationDB.companyLocationAddress(json, function (err, res) {
                response.send({
                    body: res,
                    page: linkages.branchList
                })
            })
        } else {
            res.render('index', {
                title: 'Sign In'
            });
        }

    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.aTruID, "saveCompanyData", "CompanyData");
    }
})
router.post('/saveBankData', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].cTruID = req.session.CoTruID;
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            companyDB.companyBankDetails(json, function (err, res) {
                response.send({
                    body: res,
                    page: linkages.home
                })
            })
        } else {
            res.render('index', {
                title: 'Sign In'
            });
        }

    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.aTruID, "saveCompanyData", "CompanyData");
    }
})
router.post('/saveAddressCompanyData', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].cTruID = req.session.CoTruID;
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            companyDB.companyAddress(json, function (err, res) {
                response.send({
                    body: res,
                    page: linkages.home
                })
            })
        } else {
            res.render('index', {
                title: 'Sign In'
            });
        }

    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.aTruID, "saveCompanyData", "CompanyData");
    }
})
router.post('/getCompanyData', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            companyLoki.getCompanyData(function (res)   // company data got from Lokijs
            {
                if (res.length > 0) {
                    req.session.CoTruID = res[0].truID;
                    response.send({
                        body: res,
                        page: linkages.home
                    })
                }
                else {
                    cmpData.insertCCompanyData(req.session.aTruID, function () {
                        companyLoki.getCompanyData(function (res)   // company data got from Lokijs
                        {
                            if (res.length > 0) {
                                req.session.CoTruID = res[0].truID;
                            }
                            response.send({
                                body: res,
                                page: linkages.home
                            })
                        })
                    });
                }

            })
        } else {
            res.render('index', {
                title: 'Sign In'
            });
        }

    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.aTruID, "saveCompanyData", "CompanyData");
    }
})
module.exports = router;