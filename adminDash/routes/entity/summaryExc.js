var express = require('express');
var router = express.Router();
var getEDB = require('../../model/entity/summaryDB');
const assToCSV = require('../middleware/dataPartnercsv');
const dataToCSV = require('../middleware/data-to-csv');
var txnMD = require('../../model/db/txnOptiomizationMD');
var assMD = require('../../model/db/partnerListMD');
router.post('/getGSTAllTrans', function (req, res, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            getEDB.getGSTAllTrans(json, function (err, response) {
                res.send(response);
            });
        }
        else {
            res.render('index', { title: 'Sign In' });
        }
    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.etruID, "getD.getwallet", "wallet");
    }
});
router.post('/getVATrans', function (req, res, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            getEDB.getVATrans(json, function (err, response) {
                console.log("response", response)
                res.send(response);
            });
        }
        else {
            res.render('index', { title: 'Sign In' });
        }
    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.etruID, "getD.getwallet", "wallet");
    }
});
router.post('/partnerSearch', function (req, res, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            getEDB.searchEntity(json, function (err, response) {
                res.send(response);
            });
        }
        else {
            res.render('index', { title: 'Sign In' });
        }
    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.etruID, "getD.getwallet", "wallet");
    }
});
router.post('/consumerSearch', function (req, res, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            getEDB.searchConsumer(json, function (err, response) {
                res.send(response);
            });
        }
        else {
            res.render('index', { title: 'Sign In' });
        }
    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.etruID, "getD.getwallet", "wallet");
    }
});
router.post('/partnerList', function (req, res, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            getEDB.partnerList(json, function (err, response) {
                res.send(response);
            });
        }
        else {
            res.render('index', { title: 'Sign In' });
        }
    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.etruID, "getD.getwallet", "wallet");
    }
});
router.post('/consumerList', function (req, res, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            getEDB.consumerList(json, function (err, response) {
                res.send(response);
            });
        }
        else {
            res.render('index', { title: 'Sign In' });
        }
    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.etruID, "getD.getwallet", "wallet");
    }
});
router.route('/excel-download').post(async (req, res, next) => {
    try {
        if (req.session.aTruID) { 
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].isexport = true
            contain.objectArr[0].truID = req.session.aTruID;
            var rowCount = parseInt(req.body.rowCount);
            var batchCount = rowCount > 1000 ? rowCount / 1000 : 1;
            if (parseInt(batchCount) <= batchCount && rowCount > 1000) {
                batchCount = parseInt(batchCount) + 1;
            }
            contain.objectArr[0].length = 1000;
            contain.objectArr[0].start = 0;
            const bindAllTxn = async () => {
                for (var i = 0; i < parseInt(batchCount); i++) {
                    contain.objectArr[0].length = 1000;
                    contain.objectArr[0].start = i == 0 ? 0 : (1000 * i);
                    var json = JSON.stringify(contain.objectArr[0]);
                    await bindAllTxnList(json)
                }
                next();
            };
            bindAllTxn();
            function bindAllTxnList(json) {
                return new Promise(resolve => {
                    getEDB.getGSTAllTrans(json, async function (err, body) {
                        if (err) {
                        }
                        else {
                            var newjson = JSON.parse(body);
                            if (newjson) {
                                await txnMD.insertTxnSummary(newjson.data);
                            }
                        }
                        resolve(true)
                    })
                })
            }
        }
    }
    catch (ex) {
    }
}, dataToCSV); // Call our middleware here
router.route('/excelPartner').post((req, res, next) => {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].isexport = true
            contain.objectArr[0].truID = req.session.aTruID;
            var rowCount = parseInt(req.body.rowCount);
            var batchCount = rowCount > 1000 ? rowCount / 1000 : 1;
            if (parseInt(batchCount) <= batchCount && rowCount > 1000) {
                batchCount = parseInt(batchCount) + 1;
            }
            contain.objectArr[0].length = 1000;
            contain.objectArr[0].start = 0;
            const bindAllTxn = async () => {
                for (var i = 0; i < parseInt(batchCount); i++) {
                    contain.objectArr[0].length = 1000;
                    contain.objectArr[0].start = i == 0 ? 0 : (1000 * i);
                    var json = JSON.stringify(contain.objectArr[0]);
                    await bindAllTxnList(json)
                }
                next();
            };
            bindAllTxn();
            function bindAllTxnList(json) {
                return new Promise(resolve => {
                    getEDB.partnerList(json, async function (err, body) {
                        if (err) {
                        }
                        else {
                            var newjson = JSON.parse(body);
                            if (newjson) {
                                await assMD.insertPartner(newjson.data);
                            }
                        }
                        resolve(true)
                    })
                })
            }
        }
    }
    catch (ex) {
    }
}, assToCSV); // Call our middleware here
router.post('/getPartnerDetails', function (req, res, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            getEDB.getPartnerDetails(json, function (err, response) {
                res.send(response);
            });
        }
        else {
            res.render('index', { title: 'Sign In' });
        }
    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.etruID, "getD.getwallet", "wallet");
    }
});
router.post('/countAllPeople', function (req, res, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            getEDB.countAllPeople(json, function (err, response) {
                res.send(response);
            });
        }
        else {
            res.render('index', { title: 'Sign In' });
        }
    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.etruID, "getD.getwallet", "wallet");
    }
});

module.exports = router;