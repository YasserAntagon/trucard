const cdb = require('../db/db');
exports.insertconsumerData = function (res) {
    if (res.resource) {
        var consumerDB = cdb.addCollection("consumerData");
        $dKey = res.resource.truID;
        consumerDB.chain().find({
            "truID": $dKey
        }).remove();
        consumerDB.insert(res.resource);
        cdb.saveDatabase();
    }
};
// exports.insertConsumerList = function (res) {
//     if (res) {
//         var consumerDB = cdb.addCollection("consumerDataList"); 
//         consumerDB.clear();
//         consumerDB.insert(res);
//         cdb.saveDatabase(); 
//     }
// };
exports.insertConsumerList = function (res) {
    if (res) {
        var consumerDB = cdb.addCollection("consumerDataList");
        // consumerDB.clear();
        // consumerDB.insert(res);
        try {
            res.find(element => {
                upsert(consumerDB, "truID", element)
            });
            // consumerDB.insert(res);
            cdb.saveDatabase();
        } catch (error) {
            console.log(error);
        }
    }
};

function upsert(collection, idField, record) {
    var query = {};
    query[idField] = record[idField];
    var existingRecord = collection.findOne(query);
    if (existingRecord) {
        // The record exists. Do an update.
        var updatedRecord = existingRecord;
        // Only update the fields contained in `record`. All fields not contained
        // in `record` remain unchanged.
        for (const [key, value] of Object.entries(record)) {
            updatedRecord[key] = value;
        }
        collection.update(updatedRecord);
    } else {
        // The record doesn't exist. Do an insert.
        collection.insert(record);
    }
}
exports.insertTransData = function (res, $dKey) {
    if (res) {
        if (res.resource) {
            var consumerbuyunit = cdb.getCollection("buyUnit");
            var consumerbuycash = cdb.getCollection("buyCash");
            var consumerredeemcash = cdb.getCollection("redeemCash");
            var consumertransdr = cdb.getCollection("transferDR");
            var consumertranscr = cdb.getCollection("transferCR");

            // $dKey = res.resource.buyUnit[0].to;
            // console.log("key",$dKey);
            consumerbuyunit.chain().find({
                "to": $dKey
            }).remove();
            consumerbuycash.chain().find({
                "to": $dKey
            }).remove();
            consumerredeemcash.chain().find({
                "to": $dKey
            }).remove();
            consumertransdr.chain().find({
                "fromTruID": $dKey
            }).remove();
            consumertranscr.chain().find({
                "to": $dKey
            }).remove();

            consumerbuyunit.insert(res.resource.buyUnit);
            consumerbuycash.insert(res.resource.buyCash);

            consumerredeemcash.insert(res.resource.redeemCash);
            consumertransdr.insert(res.resource.transferDR);
            consumertranscr.insert(res.resource.transferCR);
            cdb.saveDatabase();
        }

    }
};

exports.insertWalletTransdetails = function (res, $dKey) {
    // console.log("here db");
    if (res.status == 200) {
        var consumerDB = cdb.addCollection("WalletTrans");

        // $dKey = res.resource.truID;
        consumerDB.chain().find({
            "truID": $dKey
        }).remove();

        consumerDB.insert({
            truID: $dKey,
            "atom": res.atom
        });
        cdb.saveDatabase();

    }
};
exports.getConsumerData = function (query, callback) {
    var user = cdb.getCollection("consumerDataList");
    var results = user.chain().find(query).data({ removeMeta: true });
    callback(results)
};
exports.getConsumerList = function (query, callback) { 
    var user = cdb.getCollection("consumerDataList"); 
    var results1 = user.chain().find(query).simplesort("createDate", true).data({ removeMeta: true });  
    callback(results1)
};

exports.getConsumerCount = function (callback) {
    var dlr = cdb.getCollection("consumerDataList");
    var direct = dlr.chain().find({ "refFlag": 'direct' }).data({ removeMeta: true });
    var admin = dlr.chain().find({ "refFlag": 'admin' }).data({ removeMeta: true });
    var entity = dlr.chain().find({ "refFlag": 'entity' }).data({ removeMeta: true });
    var assetmanager = dlr.chain().find({ "refFlag": 'assetmanager' }).data({ removeMeta: true }); 
    let count = {
        "direct": direct.length,
        "admin": admin.length,
        "entity": entity.length,
        "assetmanager": assetmanager.length,
        "total": parseInt(direct.length)+parseInt(admin.length)+parseInt(entity.length)+parseInt(assetmanager.length)
    }
    callback(count);
}

exports.getSearchConsumer = function (query, callback) {
    var user = cdb.getCollection("consumerDataList");
    var results = user.chain().find(query).simplesort("createDate", true).limit(1).data({ removeMeta: true });
    if (results.length > 0) {
        callback({ status: 200, resource: results[0] })
    } else {
        callback({ status: 204, message: "Consumer not Found" })
    }
};
exports.getLatestDateOfConsumer = function (callback) {
    var user = cdb.getCollection("consumerDataList");
    var results = user.chain().find().simplesort("createDate", true).limit(1).data({ removeMeta: true });
    callback(results);
};
exports.insertConsumerRefList = function (res, callback) {
    var consumerDB = cdb.addCollection("consumerRefList");
    consumerDB.clear();
    if (res.referenceList) {
        consumerDB.insert(res.referenceList);
    }
    cdb.saveDatabase();
}
exports.updateConAddress = function (truID, query) {
    var cust = cdb.getCollection("consumerDataList");
    cust.chain().find({
        'truID': truID
    }).update(function (obj) {
        obj.billingAddress.houseNumber = query.houseNumber;
        obj.billingAddress.streetNumber = query.streetNumber;
        obj.billingAddress.landmark = query.landmark;
        obj.billingAddress.pin = query.pin;
        obj.billingAddress.city = query.city;
        obj.billingAddress.state = query.state;
        obj.billingAddress.country = query.country;

        obj.permanentAddress.houseNumber = query.pHouseNumber;
        obj.permanentAddress.streetNumber = query.pStreetNumber;
        obj.permanentAddress.landmark = query.pLandmark;
        obj.permanentAddress.pin = query.pPin;
        obj.permanentAddress.city = query.pCity;
        obj.permanentAddress.state = query.pState;
        obj.permanentAddress.country = query.pCountry;
    });
}
exports.updateConProf = function (truID, query) {
    var cust = cdb.getCollection("consumerDataList");
    cust.chain().find({
        'truID': truID
    }).update(function (obj) {
        obj.fName = query.fName;
        obj.mName = query.mName;
        obj.lName = query.lName;
        obj.mobile = query.mobile;
        obj.email = query.email;
        obj.DOB = query.DOB;
        obj.gender = query.gender;
    });
}
exports.updateFlag = function (truID, query) {
    var cust = cdb.getCollection("consumerDataList");
    cust.chain().find({
        'truID': truID
    }).update(function (obj) {
        obj.docVerified = query.docVerified;
        obj.KYCFlag = query.KYCFlag;
        obj.panStatus = query.panStatus;
        obj.KYCTime = query.KYCTime; 
        obj.KYCVerifyBy = query.KYCVerifyBy; 
        obj.aadharStatus = query.aadharStatus; 
    });
} 