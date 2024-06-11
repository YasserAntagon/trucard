'use strict'
var KycAll = require('../models/assetstoreModel/assetstoreKYCAllModel.js');

exports.findassetstore = function (req, res) {
    var truid = req.body.truid;

    KycAll.find({ truID: truid }, function (err, docs) {
        if (!docs.length) {
            res.json({
                status: "204",
                message: 'The request was successful but no TruID was returned.'
            });
        }
        else {
            var reqresult;
            if (req.body.entityconsumer == true) {
                reqresult = KycAll.aggregate([
                    { $match: { __t: "KycAll", truID: { $in: [truid, "7000275616253174"] } } },
                    {
                        $project: {
                            _id: 0,
                            "assetstore": {
                                image: "$image",
                                companyName: "$companyName"
                            }
                        }
                    }
                ]);
            }
            else {
                reqresult = KycAll.aggregate([
                    { $match: { __t: "KycAll", truID: { $in: [truid, "7000275616253174"] } } },
                    {
                        $project: {
                            _id: 0,
                            "assetstore": {
                                truID: "$truID", mobile: "$mobile", image: "$image",
                                KYCFlag: "$KYCFlag", email: "$email", landLine: "$landLine", companyName: "$companyName", type: "$type",
                                companyRegisteredAddress: "$companyRegisteredAddress"
                            }
                        }
                    }
                ]);
            }
            reqresult.exec(function (err, result) {
                if (err) {
                    response.status(500).send({ error: err })
                    return next(err);
                }
                else {
                    res.json({ status: "200", resource: result });
                }
            }
            )
        }
    }
    )
}