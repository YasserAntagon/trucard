var db = require('./db');
module.exports = {
    InsertAll: function (json) {
        var user = db.getCollection("zipCode");
        user.insert(json)
    },
    findR: function (string, callback) {
        let user = db.getCollection("zipCode");
        let query = string;
        var results = user.chain().find(query).data({ removeMeta: true });
        if (results.length > 0) {
            callback(results);
        }
        else {
            callback([])
        }
    },
    distinctCountry: function (callback) {
        var user = db.getCollection("zipCode");
        var results = user.chain().simplesort("COUNTRY", true).data({ removeMeta: true });
        if (results.length > 0) {
            let dist = [];
            results.forEach((elem) => {
                if (dist.indexOf(elem.COUNTRY) === -1) {
                    dist.push(elem.COUNTRY);
                }
            });
            callback(dist);
        }
        else {
            callback([])
        }
           
            // return dist;
            
    },
    findAll: function (callback) {
        var user = db.getCollection("zipCode");
        var results = user.chain().simplesort("createDate", true).data({ removeMeta: true });
        if (results.length > 0) {
            callback(results);
        }
        else {
            callback([])
        }
    },

    findUsingType: function (data, callback) {
        var user = db.getCollection("zipCode");
        var dtime = new Date();
        let date = Date.parse(dtime).toString();
        let query = {
            '$and': [{
                'expiryDate': {
                    '$gt': date
                }
            }, {
                'type': data.type
            }, {
                'bannerType': data.bannerType
            }, {
                'subType': data.subType
            }]
        };
        if (data.type == "entity" || data.type == "assetstore") {
            query = {
                '$and': [{
                    'expiryDate': {
                        '$gt': date
                    }
                }, {
                    'type': data.type
                }, {
                    'bannerType': data.bannerType
                }, {
                    'subType': data.subType
                }]
            };
        }
        var results = user.chain().find(query).data({ removeMeta: true });
        if (results.length > 0) {
            callback(results);
        }
        else {
            callback([])
        }
    },
    updateServer: function (objData, callback) {
        var user = db.getCollection("dbPromotion");
        var results = user.chain().find({ 'adsId': objData.adsId }).data()
        var dtime = new Date();
        let date = Date.parse(dtime);
        let expdate = Date.parse(objData.expiryDate);
        if (results.length > 0) {
            user.chain().find({ 'adsId': objData.adsId }).update(function (obj) {
                obj.adsTitle = objData.adsTitle,
                    obj.images = objData.images,
                    obj.description = objData.description,
                    obj.createDate = date.toString(),
                    obj.expiryDate = expdate.toString(),
                    obj.accessFlag = objData.accessFlag,
                    obj.type = objData.type,
                    obj.subType = objData.subType,
                    obj.bannerType = objData.bannerType
            });
            callback(true)
        }
        else {
            callback(false)
        }
    }
}