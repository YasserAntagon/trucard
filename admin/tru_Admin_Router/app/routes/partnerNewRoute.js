'use strict';
 
var KycAll = require('../models/adminKYCAllModel');
module.exports = function (app) {
    var pcontroller = require('../controllers/partnerNewClr');
    app.route('/303')
        .post(verifyMHash, pcontroller.threehundredthree);

    app.route('/304')
        .post(verifyMHash, pcontroller.threehundredFour);

    app.route('/305')
        .post(verifyMHash, pcontroller.threehundredFive);

    app.route('/306')
        .post(verifyMHash, pcontroller.threehundredSix);

    app.route('/307')
        .post(verifyMHash, pcontroller.threehundredSeven);

    app.route('/308')
        .post(verifyMHash, pcontroller.threehundredEight);
    app.route('/309')
        .post(verifyMHash, pcontroller.threehundredNine);
    app.route('/311')
        .post(verifyMHash, pcontroller.threehundredeleven);
    app.route('/312')
        .post(verifyMHash, pcontroller.threehundredTwelve);
    app.route('/313')
        .post(verifyMHash, pcontroller.threehundredThirteen);
    app.route('/314')
        .post(verifyMHash, pcontroller.threehundredFourteen);
    app.route('/315')
        .post(verifyMHash, pcontroller.threehundredFifteen);
    app.route('/316')
        .post(verifyMHash, pcontroller.threehundredSixteen);
    app.route('/317')
        .post(verifyMHash, pcontroller.threehundredSeveneen);

    app.route('/318')
        .post(verifyMHash, pcontroller.threehundredEighteen);

    app.route('/319')
        .post(verifyMHash, pcontroller.threehundredNineteen);

    app.route('/320')
        .post(verifyMHash, pcontroller.threehundredTwenty);

    app.route('/321')
        .post(verifyMHash, pcontroller.threehundredTwentyOne);
 
    app.route('/323')
        .post(verifyMHash, pcontroller.threehundredTwentyThree);
    app.route('/324')
        .post(verifyMHash, pcontroller.threehundredTwentyFour);


    app.route('/326')
        .post(verifyMHash, pcontroller.threehundredTwentySix);

    app.route('/327')
        .post(verifyMHash, pcontroller.threehundredTwentySeven);

    app.route('/328')
        .post(verifyMHash, pcontroller.threehundredTwentyEight);
    app.route('/329')
        .post(verifyMHash, pcontroller.getPGInvoice);

    app.route('/uploadBrandLogo')
        .post(verifyMHash, pcontroller.uploadBrandLogo);


    function verifyMHash(req, res, next) {
        if (req.body.type === "mHash") {
            next();
        } else {
            const mhash = req.headers.mhash;
            let truid = req.body.truID;
            if (req.originalUrl === "/101" || req.originalUrl === "/104") {
                truid = req.body.email;
            } else if (req.originalUrl === "/100") {
                truid = req.body.refrenceID;
            }
            if (truid) {
                KycAll.aggregate([
                    { $match: { $or: [{ truID: truid }, { email: truid }] } },
                    { $project: { _id: 0, machineHash: 1, mobile: 1, mHashVerified: 1 } }]).exec(function (err, resultdocs) {
                        if (resultdocs.length != 0) {
                            if (mhash && resultdocs && resultdocs.length && resultdocs[0].mHashVerified === true && resultdocs[0].machineHash === mhash) {
                                next();
                            } else {
                                // KycAll.findOneAndUpdate({truID:truid, machineHash : mhash},{$set:{mHashVerified:false}}).exec();
                                //res.json({status:"401", message:"Access denied!"});
                                if (!resultdocs.length) {
                                    res.json({ status: "204", message: "Invalid credentials" });
                                } else {
                                    res.json({ status: "401", message: "Access denied!", mobile: resultdocs[0].mobile });
                                }
                            }
                        }
                        else {
                            res.json({ status: "204", message: "User Does not exist..!" });
                        }
                    })
            } else {
                res.json({ status: "401", message: "Access denied!" });
            }
        }
    };
}