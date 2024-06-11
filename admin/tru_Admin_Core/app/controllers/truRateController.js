'use strict'
const liveRateLog = require('../models/truRateModel/liveRateLogModel');
    

exports.test = function (req, res) {
    res.json({ message: "Welcome to Company Admin Api" });
}; 

exports.LBMA_rate_log = function(req, res) {

    // var limit0 = req.body.limit;
    var limit = parseInt(req.body.limit, 10);
  
     liveRateLog.aggregate([
     {$project : {_id:0,truID :1,date1:1,date2:1,entryTimeStamp:1,g24k_rate : 1,s99_rate : 1,
             countryCode :1, currencyRate :1, importDuty :1, discount :1,	tax :1
  }},
     {$sort:{entryTimeStamp:-1}},
     {$limit:limit}
   ]).exec(function (err, result) {
         if (err)
         {
           res.status(500).send({error : err})
           return next(err);
         }
         else{
           res.json({status:"200",resource:result});
        }
      });
};