var express = require('express');
var empMasterDB = require('../../model/admin/empMasterDB');
var branchList = require('../../model/admin/db/branchList');
var employeeData = require('../../model/admin/db/employeeData');
var errLog = require('../../model/config/db/errLogDb');
var brData = require('../../model/admin/db/branchList');
var iterator = require('../adminIterator');
var linkages = iterator();
var router = express.Router();
router.post('/bindBranchList', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            branchList.getBranchList("", function (res) {
                if (res.length > 0) {
                    response.send({
                        body: res,
                        page: linkages.branchLocation
                    })
                } else {
                    brData.insertBranchData(req.session.aTruID, req.session.CoTruID, function () {
                        branchList.getBranchList("", function (ress) {
                            response.send({
                                body: ress,
                                page: linkages.branchLocation
                            })
                        })
                    })
                }

            })
        } else {
            res.render('index', {
                title: 'Sign In'
            });
        }
    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.aTruID, "bindBranchList", "routes/admin/EmployeeReg");
    }
})
router.post('/getBranchList', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            branchList.getBranchList(req.body, function (res) {
                response.send({
                    body: res,
                    page: linkages.branchLocation
                })
            })
        } else {
            res.render('index', {
                title: 'Sign In'
            });
        }
    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.aTruID, "bindBranchList", "routes/admin/EmployeeReg");
    }
})
router.post('/saveEmployeeData', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].refrenceID = req.session.aTruID;
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            empMasterDB.saveEmployeeData(json, function (err, res) {
                employeeData.insertEmpData(req.session.aTruID);
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
        errLog.insertErrorLog(ex, req.session.aTruID, "saveEmployeeData", "routes/admin/EmployeeReg");
    }
})
router.post('/updateEmployeeData', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            empMasterDB.updateEmployeeData(json, function (err, res) {
                if (res.status == 200) {
                    var jsEmail = JSON.stringify({
                        "truID" : req.session.aTruID,
                        "eTruID": req.body.eTruID,
                        "email": req.body.email,
                    });
                    empMasterDB.updateEmailData(jsEmail, function (err, res) {
                        employeeData.insertEmpData(req.session.aTruID);
                        response.send({
                            body: res,
                            page: linkages.home
                        })
                    })
                }
                else if (res.status == "206") {
                    response.send({
                        body: res,
                        page: linkages.resetpass
                    })
                }
            })
        } else {
            res.render('index', {
                title: 'Sign In'
            });
        }

    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.aTruID, "updateEmployeeData", "routes/admin/EmployeeReg");
    }
})

router.post('/employeeBankDetails', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            empMasterDB.employeeBankDetails(json, function (err, res) {
                if (res.status == 200) {
                    employeeData.insertEmpData(req.session.aTruID);
                    response.send({
                        body: res,
                        page: linkages.home
                    })
                }
                else if (res.status == "206") {
                    response.send({
                        body: res,
                        page: linkages.resetpass
                    })
                }
            })
        } else {
            res.render('index', {
                title: 'Sign In'
            });
        }

    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.aTruID, "employeeBankDetails", "routes/admin/EmployeeReg");
    }
})

router.post('/employeeAddress', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            empMasterDB.employeeAddress(json, function (err, res) {
                if (res.status == 200) {
                    employeeData.insertEmpData(req.session.aTruID);
                    response.send({
                        body: res,
                        page: linkages.home

                    })
                }
                else if (res.status == "206") {
                    response.send({
                        body: res,
                        page: linkages.resetpass
                    })
                }
            })
        } else {
            res.render('index', {
                title: 'Sign In'
            });
        }

    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.aTruID, "employeeAddress", "routes/admin/EmployeeReg");
    }
})
router.post('/getEmpBranchWiseData', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            // var jsEmail = {
            //     "truID": req.session.aTruID
            // };
            employeeData.getEmpBranchWiseData("", function (res)   // company data got from Lokijs
            {
                response.send({
                    body: res,
                    page: linkages.empMaster
                })
            })
        } else {
            res.render('index', {
                title: 'Sign In'
            });
        }

    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.aTruID, "getEmpBranchWiseData", "routes/admin/EmployeeReg");
    }
})
router.post('/getEmpData', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var jsEmail = {
                "truID": req.body.truID
            };
            employeeData.getEmpData(jsEmail, function (res)   // company data got from Lokijs
            {
                response.send({
                    body: res,
                    page: linkages.empList
                })
            })
        } else {
            res.render('index', {
                title: 'Sign In'
            });
        }

    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.aTruID, "getEmpBranchWiseData", "routes/admin/EmployeeReg");
    }
})
module.exports = router;