var express = require('express');
var getEDB = require('../../model/entity/getEntityWallet'); 
var errLog = require('../../model/config/db/errLogDb');
var bankStrList = require('../bankDB/bankStrList.json');
var iterator = require('../entityIterator');
var linkages = iterator();
var router = express.Router();
router.post('/getWalletBal', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            getEDB.getWalletBalance(json, function (err, res) {
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
        errLog.insertErrorLog(ex, req.session.aTruID, "getTransdetails", "routes/entity/eEntity");
    }
})
router.post('/addWalletBal', function (req, response, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            getEDB.addWalletBalance(json, function (err, res) {
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
        errLog.insertErrorLog(ex, req.session.aTruID, "getTransdetails", "routes/entity/eEntity");
    }
}) 
  
router.post('/getWalletBreakup', function (req, response, next) {
    try {

        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            getEDB.getWalletBreakup(json, function (err, res) { 
                response.send({ body: res, page: linkages.home })
            })
        } else {
            res.render('index', {
                title: 'Sign In'
            });
        }
    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.aTruID, "getTransdetails", "routes/entity/eEntity");
    }
})
 
router.post('/fetchBanks', function (req, res, next) {
    try {

        if (req.session.aTruID) { 
            function search(source, name) {
                var results;
            
                name = name.toUpperCase();
                results = source.filter(function(entry) {
                    return entry.text.toUpperCase().indexOf(name) !== -1;
                });
                return results;
            }
            var sts=bankStrList.results.sort(function(a, b) { return a.id > b.id ? 1 : -1; }).slice(0, 5);
            if(req.body.searchTerm){
                sts=search(bankStrList.results,req.body.searchTerm)
            }
            
            var dt = {
                id: -1,
                text: "- Search Bank by Name -"
              }
              sts.unshift(dt)
              res.send(sts)
        }
    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.aTruID, "EmailSubscriber.getEmailSubscriber", "getEmailSubscriber");
    }

});
module.exports = router