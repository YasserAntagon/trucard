'use strict'

var promotion = require('../models/truRateModel/promotion');

//Test API
exports.create_Promotion = function (req, res) {
    var dtime = new Date();
    let date = Date.parse(dtime);
    let srno = (date + Math.random()).toString().replace('.', '');

    var adsid = srno,
        adstitle = req.body.adstitle,
        images = req.body.images,
        description = req.body.description,
        createdate = date,
        expirydate = Date.parse(req.body.expirydate),
        accessflag = req.body.accessflag,
        type = req.body.type,
        subtype = req.body.subtype,
        bannertype = req.body.bannertype,
        truid = req.body.truid;


    var insertPromotion = new promotion();

    insertPromotion["adsId"] = adsid;
    insertPromotion["adsTitle"] = adstitle;
    insertPromotion["images"] = images;
    insertPromotion["description"] = description;
    insertPromotion["createDate"] = createdate;
    insertPromotion["expiryDate"] = expirydate;
    insertPromotion["accessFlag"] = accessflag;
    insertPromotion["type"] = type;
    insertPromotion["subType"] = subtype;
    insertPromotion["bannerType"] = bannertype;
    insertPromotion["truID"] = truid;

    promotion.find({ adsId: adsid }, function (err, docs) {
        if (!docs.length) {
            insertPromotion.save(function (err) {
                if (err) {
                    console.log(err)
                    res.json({ status: "204", message: 'Fields with * required' });
                } else {
                    res.json({ status: "200", message: 'Promotion Added Successfully' });

                }
            })

        }
        else {
            res.json({ status: 204, message: 'promotiion already exist.' })
        }
    })
}

exports.List_Promotions = function (req, res) {
    var dtime = new Date();
    var type = req.body.type,
        bannerType = req.body.bannerType,
        subType = req.body.subType;
    let date = Date.parse(dtime).toString();
    let query = {
        '$and': [{
            'expiryDate': {
                '$gt': date
            }
        }, {
            'isDelete': false
        }, {
            'type': type
        }, {
            'bannerType': bannerType
        }, {
            'subType': subType
        }]
    };
    if (type == "entity" || type == "assetstore") {
        query = {
            '$and': [{
                'expiryDate': {
                    '$gt': date
                }
            }, {
                'isDelete': false
            }, {
                'type': type
            }, {
                'bannerType': bannerType
            }, {
                'subType': subType
            }]
        };
    }
    promotion.find(query).exec(function (err, docs) {
        if (!docs.length) {
            res.json({ "result": "Promotion not found", "status": "204" });
        }
        else {
            var listPromotion = [];
            for (var i = 0; i < docs.length; i++) {
                var promoArr = {};
                promoArr["accessFlag"] = docs[i].accessFlag;
                promoArr["isDelete"] = docs[i].isDelete;
                promoArr["adsId"] = docs[i].adsId;
                promoArr["adsTitle"] = docs[i].adsTitle;
                promoArr["images"] = docs[i].images;
                promoArr["description"] = docs[i].description;
                promoArr["createDate"] = docs[i].createDate;
                promoArr["expiryDate"] = docs[i].expiryDate;
                promoArr["type"] = docs[i].type;
                promoArr["subType"] = docs[i].subType;
                promoArr["bannerType"] = docs[i].bannerType;
                promoArr["truID"] = docs[i].truID;
                listPromotion.push(promoArr);
            }

            res.json({ "status": "200", "result": listPromotion });
        }
    })
}

exports.List_Promotions_All = function (req, res) {
    promotion.find().exec(function (err, docs) {
        if (!docs.length) {
            res.json({ "result": "Promotion not found", "status": "204" });
        }
        else {
            var listPromotion = [];
            for (var i = 0; i < docs.length; i++) {
                var promoArr = {};
                promoArr["accessFlag"] = docs[i].accessFlag;
                promoArr["isDelete"] = docs[i].isDelete;
                promoArr["adsId"] = docs[i].adsId;
                promoArr["adsTitle"] = docs[i].adsTitle;
                promoArr["images"] = docs[i].images;
                promoArr["description"] = docs[i].description;
                promoArr["createDate"] = docs[i].createDate;
                promoArr["expiryDate"] = docs[i].expiryDate;
                promoArr["type"] = docs[i].type;
                promoArr["subType"] = docs[i].subType;
                promoArr["bannerType"] = docs[i].bannerType;
                promoArr["truID"] = docs[i].truID;
                listPromotion.push(promoArr);
            }

            res.json({ "status": "200", "result": listPromotion });
        }
    })
}

exports.update_Promotion = function (req, res) {
    var dtime = new Date();
    let date = Date.parse(dtime);

    var adsid = req.body.adsid,
        adstitle = req.body.adstitle,
        images = req.body.images,
        description = req.body.description,
        createdate = date,
        expirydate = Date.parse(req.body.expirydate),
        accessflag = req.body.accessflag,
        type = req.body.type,
        subtype = req.body.subtype,
        bannertype = req.body.bannertype,
        truid = req.body.truid;

    var updatePromotion = {};

    updatePromotion["adsId"] = adsid;
    updatePromotion["adsTitle"] = adstitle;
    updatePromotion["images"] = images;
    updatePromotion["description"] = description;
    updatePromotion["createDate"] = createdate;
    updatePromotion["expiryDate"] = expirydate;
    updatePromotion["accessFlag"] = accessflag;
    updatePromotion["type"] = type;
    updatePromotion["subType"] = subtype;
    updatePromotion["bannerType"] = bannertype;
    updatePromotion["truID"] = truid;

    promotion.find({ adsId: adsid }).exec(function (err, docs) {
        if (!docs.length) {
            res.json({ status: "204", message: "Promotion does not exist..!!" })
        }
        else {
            promotion.findOneAndUpdate({ adsId: adsid }, { $set: updatePromotion }, { upsert: true }).exec(function (err, docs) {
                if (err) {
                    res.json({ status: 204, message: "Somethind weng wrong" })
                }
                else {
                    res.json({ status: "200", message: 'Promotion Updated Successfully' });
                }
            })
        }
    })

}

exports.update_Promotion = function (req, res) {
    var dtime = new Date();
    let date = Date.parse(dtime);

    var adsid = req.body.adsid,
        adstitle = req.body.adstitle,
        images = req.body.images,
        description = req.body.description,
        createdate = date,
        expirydate = Date.parse(req.body.expirydate),
        accessflag = req.body.accessflag,
        type = req.body.type,
        subtype = req.body.subtype,
        bannertype = req.body.bannertype,
        truid = req.body.truid;


    var updatePromotion = {};

    updatePromotion["adsId"] = adsid;
    updatePromotion["adsTitle"] = adstitle;
    updatePromotion["images"] = images;
    updatePromotion["description"] = description;
    updatePromotion["createDate"] = createdate;
    updatePromotion["expiryDate"] = expirydate;
    updatePromotion["accessFlag"] = accessflag;
    updatePromotion["type"] = type;
    updatePromotion["subType"] = subtype;
    updatePromotion["bannerType"] = bannertype;
    updatePromotion["truID"] = truid;

    promotion.find({ adsId: adsid }).exec(function (err, docs) {
        if (!docs.length) {
            res.json({ status: "204", message: "Promotion does not exist..!!" })
        }
        else {
            promotion.findOneAndUpdate({ adsId: adsid }, { $set: updatePromotion }, { upsert: true }).exec(function (err, docs) {
                if (err) {
                    res.json({ status: 204, message: "Somethind weng wrong" })
                }
                else {
                    res.json({ status: "200", message: 'Promotion Updated Successfully' });
                }
            })
        }
    })

}

exports.delete_Promotion = function (req, res) {

    var adsid = req.body.adsid,
        truid = req.body.truID;


    promotion.find({ adsId: adsid }).exec(function (err, docs) {
        if (!docs.length) {
            res.json({ status: "204", message: "Promotion does not exist..!!" })
        }
        else {
            promotion.findOneAndUpdate({ adsId: adsid }, { $set: { isDelete: true } }, { upsert: true }).exec(function (err, docs) {
                if (err) {
                    res.json({ status: 204, message: "Somethind weng wrong" })
                }
                else {
                    res.json({ status: "200", message: 'Promotion Deleted Successfully' });
                }
            })
        }
    })

}
