var express = require('express');
var router = express.Router();
var smf = require("../../model/entity/walletLogDB") 
const dataToCSV = require('../middleware/data-to-csvWallet');
var txnOpt = require('../../model/db/walletLogMD'); 
router.post('/bindWalletSummaryWF', function (req, res, next) {
    try 
    {
        if (req.session.aTruID)
        {
            var contain = {};
            var objectArr = [];
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            smf.walletLogExc(json, function (err, response) {
                res.send(response);
            });
        }
        else {
            res.render('index', { title: 'Sign In' });
        }
    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.etruID, "WalletSummaryWF", "bindWalletSummaryWF");
    }
});
router.route('/excel-download').post((req, res, next) => {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            contain.objectArr[0].isexport =true
            var rowCount = parseInt(req.body.rowCount);
            var batchCount = rowCount > 10000 ? rowCount / 10000 : 1;
            if (parseInt(batchCount) <= batchCount && rowCount > 10000) {
                batchCount = parseInt(batchCount) + 1;
            }
            contain.objectArr[0].length = 10000;
            contain.objectArr[0].start = 0;
            const walletAllSummary = async () => {
                for (var i = 0; i < parseInt(batchCount); i++) {
                    contain.objectArr[0].length = 10000;
                    contain.objectArr[0].start = i == 0 ? 0 : (10000 * i);
                    var json = JSON.stringify(contain.objectArr[0]);
                    var x = await entitywallet(json);
                }
                next();
            };
            walletAllSummary();
            function entitywallet(json) {
                return new Promise(resolve => {
                    smf.walletLogExc(json, async function (err, body) {
                        if (err) {
                        }
                        else 
                        {
                            var newjson = JSON.parse(body);
                            if (newjson) {
                                await txnOpt.insertWalletLog(newjson.data);
                            }
                        }
                        resolve(true)
                    })
                })
            }
        }
    }
    catch (ex) {
        resolve(false)
    }
}, dataToCSV); // Call our middleware here

module.exports = router;