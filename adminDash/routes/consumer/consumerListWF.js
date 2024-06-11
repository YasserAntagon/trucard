var express = require('express');
var router = express.Router();
var smf = require("../../model/consumer/consumerListDB") 
const dataToCSV = require('../middleware/dataConsumercsv'); 
var dbConsumer = require('../../model/db/consumerListMD'); 
router.post('/bindConsumerList', function (req, res, next) {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].truID = req.session.aTruID;
            var json = JSON.stringify(contain.objectArr[0]);
            smf.consumerListExc(json, function (err, response) {
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

router.route('/excel-download').post((req, res, next) => {
    try {
        if (req.session.aTruID) {
            var contain = {};
            var objectArr = []
            contain.objectArr = objectArr;
            contain.objectArr.push(req.body);
            contain.objectArr[0].isexport =true
            contain.objectArr[0].truID = req.session.aTruID;
            var rowCount = parseInt(req.body.rowCount);
            var batchCount = rowCount > 1000 ? rowCount / 1000 : 1;
            if (parseInt(batchCount) <= batchCount && rowCount>1000) {
                batchCount = parseInt(batchCount) + 1;
            } 
            contain.objectArr[0].length = 1000;
            contain.objectArr[0].start = 0;
            const bindAllConsumer = async () => {
               for (var i = 0; i < parseInt(batchCount); i++) {
                    contain.objectArr[0].length = 1000;
                    contain.objectArr[0].start = i == 0 ? 0 : (1000 * i);
                    var json = JSON.stringify(contain.objectArr[0]);
                    var x = await consumerList(json)
               } 
                next();
            };
            bindAllConsumer();
            function consumerList(json) {
                return new Promise(resolve => {
                    smf.consumerListExc(json, async function (err, body) {
                        if (err) {
                        }
                        else {
                            var newjson = JSON.parse(body);
                            if (newjson) {
                                await dbConsumer.insertConsumer(newjson.data);
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

module.exports = router;