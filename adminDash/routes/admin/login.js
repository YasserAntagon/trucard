var express = require('express');
var signs = require('../../model/admin/loginDB');
var errLog = require('../../model/config/db/errLogDb');
var iterator = require('../adminIterator');
var linkages = iterator();
/* var preiterator = require('../iterators');
var prelinkages = preiterator(); */
var router = express.Router();
var cmpData = require('../../model/admin/db/cmpData');
var empData = require('../../model/admin/db/employeeData');
var getCmpData = require('../../model/admin/db/companyData');
var brData = require('../../model/admin/db/branchList');
var changeDB = require('../../model/admin/changePasswordDB'); 
router.post('/signInM', function (req, response, next) {
    try { 
        var json = JSON.stringify({
            "email": req.body.email,
            "password": req.body.password
        });
        signs.SignMIn(json, function (err, res) {
            if (res.status == 200) {
                var truID = res.resource.truID;
                req.session.aData = res.resource;
                req.session.depatment = res.resource.department;
                req.session.aTruID = truID;
                req.session.name = res.resource.fName+" "+res.resource.lName;
                cmpData.insertCCompanyData(truID, function () {
                    getCmpData.getCompanyData(function (ress) {
                       
                        if(ress.length){
                            req.session.CoTruID = ress[0].truID;
                            if (ress.length > 0) {
                                brData.insertBranchData(truID, ress[0].truID, function () { })
                            }
                        }else{
                            req.session.CoTruID = null;
                        }
                        
                    })
                });
                empData.insertEmpData(truID);
                if (res.resource.isTPinReset) {
                    response.send({
                        body: res,
                        page: linkages.home
                    })
                }
                else if (res.resource.isTPinReset) {
                    response.send({
                        body: res,
                        page: linkages.changePIN
                    })

                }
                else {
                    response.send({
                        body: res,
                        page: linkages.home
                    })

                }

            }
            else if (res.status == 401) {
                req.session.otpEmail = req.body.email;
                req.session.otpmobile = res.mobile;

                response.send({
                    body: res,
                    page: linkages.verifyOTP
                })
            }
            else if (res.status == 206) {

                req.session.resetemail = req.body.email;
                response.send({
                    body: res,
                    page: linkages.resetpass
                })
            }else if (res.status == 404) {
 
                response.send({
                    body: res,
                    page: linkages
                })
            } else {
                response.send({
                    body: res,
                    page: linkages
                })
            }
        })
    }
    catch (ex) {
        errLog.insertErrorLog(ex, "fTIme", "signIn", "signIn");
    }
})
router.post('/changeEmpPassword', function (req, response, next) {
    try 
    {
        changeDB.changeEmpPassword(JSON.stringify(req.body), function (err, res) {
            response.send({
                body: res,
                page: linkages.resetpass
            })
        })
    }
    catch (ex) {
        errLog.insertErrorLog(ex, "fTIme", "signIn", "signIn");
    }
})
router.post('/changeEmpTPIN', function (req, response, next) {
    try 
    {
        var contain = {};
        var objectArr = []
        contain.objectArr = objectArr;
        contain.objectArr.push(req.body);
        contain.objectArr[0].truID = req.session.aTruID;
        var json = JSON.stringify(contain.objectArr[0]);
        changeDB.changeEmpTPIN(json, function (err, res) {
            response.send({ body: res, page: linkages })
        })
    }
    catch (ex) {
        errLog.insertErrorLog(ex, "fTIme", "signIn", "signIn");
    }
})
router.post('/verifyEmpTPIN', function (req, response, next) {
    try {
        var contain = {};
        var objectArr = []
        contain.objectArr = objectArr;
        contain.objectArr.push(req.body);
        contain.objectArr[0].truID = req.session.aTruID;
        var json = JSON.stringify(contain.objectArr[0]);
        changeDB.verifyEmpTPIN(json, function (err, res) {
            response.send({
                body: res,
                page: linkages.paymentFailed
            })
        })
    }
    catch (ex) {
        errLog.insertErrorLog(ex, "fTIme", "signIn", "signIn");
    }
})
module.exports = router;