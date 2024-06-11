const request = require("request"),
    TXN = require('../models/custTXNModel'),
    conf = require("../conf");
let reqip = conf.reqip;
exports.initiateEntityRevenueRefund = function (rtruid, invoice) {
    TXN.aggregate([
        { $match: { rTruID: rtruid, invoice: invoice, status: "success" } },
        { $unwind: "$particularsG24" },
        { $unwind: "$particularsS99" },
        {
            $project: {
                _id: 0, invoice: 1, rTruID: 1, invoice: 1, remmitCharges: 1, sourceFlag: 1, status: 1, totalAmount: 1,
                partnerCharges: {
                    $toString: { $sum: ["$particularsG24.grosspartnerCharges", "$particularsS99.grosspartnerCharges"] }

                },
                tdsonpartnerCharges: {
                    $toString: { $sum: ["$particularsG24.tdsonpartnerCharges", "$particularsS99.tdsonpartnerCharges"] }
                },
                nodeCharges: {
                    $toString: { $sum: ["$particularsG24.grossnodeCharges", "$particularsS99.grossnodeCharges"] }

                },
                tdsonnodeCharges: {
                    $toString: { $sum: ["$particularsG24.tdsonnodeCharges","$particularsS99.tdsonnodeCharges"] }
                },
            }
        }
    ]).exec(function (err, txnresult) {
        if (err) {
            console.log("Entity Revenue refund error", err)
        }
        if (!txnresult.length) {
            console.log("Entity Revenue refund Transaction not found", err)
        } else {
            var revenueJson = {
                "rtruid": txnresult[0].rTruID,
                "invoice": txnresult[0].invoice,
                "partnercharges": txnresult[0].partnerCharges,
                "nodecharges": txnresult[0].nodeCharges,
                "tdsonpartnerCharges": txnresult[0].tdsonpartnerCharges,
                "tdsonnodeCharges": txnresult[0].tdsonnodeCharges
            }
            request.post({
                "headers": { "content-type": "application/json" },
                "url": reqip + ":4121/api/entityrevenuerefund",
                "body": JSON.stringify(revenueJson)
            }, (error, response, body) => {
            })
        }
    })
}