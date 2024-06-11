const edbs = require('./db');
const cdbs = require('../../entity/db/db');
exports.insertEntityData = function (res) {
    if (res) { 
            try { 

                var EntityDB = edbs.addCollection("EntityData");
                $custKey = res.truID;
                EntityDB.chain().find({
                    "truID": $custKey
                }).remove();

                EntityDB.insert(res);
                edbs.saveDatabase(); 
            } catch (ex) {
                console.log("Ex", ex)
            } 
    }
}

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
exports.getEntityCount = function (callback) {
    var ent = edbs.getCollection("EntityList");
    var admin = ent.chain().find({
        '$and': [{
            'isParent': true
        }, {
            'isLending': false
        }]
    }).data({ removeMeta: true });
    var nodes = ent.chain().find({ "isParent": false }).data({ removeMeta: true });
    var lender = ent.chain().find({
        '$and': [{
            'isParent': true
        }, {
            'isLending': true
        }]
    }).data({ removeMeta: true });
    let count = {
        "lender": lender.length,
        "admin": admin.length,
        "nodes": nodes.length,
        "total": parseInt(lender.length) + parseInt(admin.length) + parseInt(nodes.length)
    }
    callback(count);
}
exports.insertEntityList = async function (res) {
    if (res) {
        var entityListDB = edbs.addCollection("EntityList");
        // entityListDB.clear();
        // entityListDB.insert(res);
        res.find(element => {
            upsert(entityListDB, "truID", element)
        });
        edbs.saveDatabase();
        var results = res.filter((item) => { return item.isParent == true })
        var user = edbs.getCollection("EntityList");
        var consumer = cdbs.getCollection("consumerDataList"); // list of all consumer 
        let globCount = 0;
        await results.map(async (txn, key) => {
            globCount = 0;
            var consumerAdminCount = consumer.chain().find({
                'referenceTruID': txn.truID
            }).data({ removeMeta: true });
            var count = user.chain().find({
                '$and': [{
                    'parentTruID': txn.truID
                }, {
                    'isParent': false
                }]
            }).data({ removeMeta: true });
            if (count.length > 0) {
                await count.map((entytxn, key) => {
                    var consumerCount = consumer.chain().find({
                        'referenceTruID': entytxn.truID
                    }).data({ removeMeta: true });

                    globCount += consumerCount.length;
                    entityListDB.chain().find({ 'truID': entytxn.truID }).update(function (obj) {
                        obj.consumerCount = consumerCount.length
                    });
                    entityListDB.chain().find({ 'truID': txn.truID }).update(function (obj) {
                        obj.consumerCount = consumerAdminCount.length + globCount,
                            obj.nodecount = count.length
                    });
                });
            }
            else {
                entityListDB.chain().find({ 'truID': txn.truID }).update(function (obj) {
                    obj.consumerCount = consumerAdminCount.length,
                        obj.nodecount = count.length
                });
            }
        })
    }
};
exports.getEntityList = function (query, callback) {
    var user = edbs.getCollection("EntityList");
    var results = user.chain().find(query).simplesort("createDate", true).data({ removeMeta: true });
    callback(results)
};
exports.getEntityListALLRecords = function (query, callback) {
    var user = edbs.getCollection("EntityList");
    var results = user.chain().find(query).simplesort("createDate", true).data({ removeMeta: true });
    callback(results)
};
exports.getLatestDateOfEntity = function (callback) {
    var user = edbs.getCollection("EntityList");
    var results = user.chain().find().simplesort("createDate", true).limit(1).data({ removeMeta: true });
    callback(results);
};
exports.getEntityData = function (query, callback) {
    var cust = edbs.getCollection("EntityList");
    var results = cust.chain().find(query).simplesort('companyName').data({ removeMeta: true });
    callback(results);
}
exports.getEntityDataNew = function (query, callback) {
    var cust = edbs.getCollection("EntityData"); 
    var results = cust.chain().find(query).simplesort('companyName').data({ removeMeta: true }); 
    callback(results);
}

exports.updateenKYCFlag = function (query) {
    var cust = edbs.getCollection("EntityList");
    cust.chain().find({
        'truID': query.truID
    }).update(function (obj) {
        obj.KYCFlag = query.KYCFlag
    });
}
exports.updateenKYCDocFlag = function (truID, query) {
    var cust = edbs.getCollection("EntityList");
    cust.chain().find({
        'truID': truID
    }).update(function (obj) {
        obj.docVerified = query.docVerified;
        obj.KYCFlag = query.KYCFlag;
        obj.panStatus = query.panStatus;
        obj.aadharStatus = query.aadharStatus;
        obj.KYCTime = query.KYCTime;
        obj.KYCVerifyBy = query.KYCVerifyBy;
    });
}
exports.updateEnAddres = function (truID, query) {
    var cust = edbs.getCollection("EntityList");
    cust.chain().find({
        'truID': truID
    }).update(function (obj) {
        if (obj.address) {
            obj.address.city = query.city;
            obj.address.country = query.country;
            obj.address.houseNumber = query.houseNumber;
            obj.address.landmark = query.landmark;
            obj.address.pin = query.pin;
            obj.address.state = query.state;
            obj.address.streetNumber = query.streetNumber;
        }
        else {
            obj.address = query;
        }

    });
}
exports.updateEnProf = function (truID, query) {
    var cust = edbs.getCollection("EntityList");
    cust.chain().find({
        'truID': truID
    }).update(function (obj) {
        obj.contactFName = query.fName;
        obj.contactLName = query.lName;
        obj.mobile = query.mobile;
        obj.email = query.email;
        obj.DOB = query.DOB;
        obj.contactMName = query.mName;
        obj.companyName = query.companyName;
        obj.gender = query.gender;
    });
}
exports.getEntitySearch = function (query, callback) {
    var cust = edbs.getCollection("EntityList");
    var results = cust.chain().find(query).simplesort('companyName').limit(1).data({ removeMeta: true });
    if (results.length > 0) {
        var nodequery = {
            'parentTruID': results[0].parentTruID,
            "isParent": false
        }
        var nodeCount = cust.chain().find(nodequery).data().length;
        var parent = cust.chain().find({ truID: results[0].parentTruID }).simplesort('companyName').limit(1).data({ removeMeta: true });
        results[0].nodes = nodeCount;
        results[0].parentCompanyName = parent[0].companyName;
        results[0].parentImage = parent[0].image;
        results[0].parentCity = parent[0].address ? parent[0].address.city : "";
        results[0].parentCountry = parent[0].address ? parent[0].address.country : "";
        callback({ status: 200, resource: results[0] });
    } else {
        callback({ status: 204, message: "Partner not Found" })
    }
}

exports.insertTransData = function (res, $dKey) {
    if (res.resource) {
        var ebuyunit = edbs.getCollection("buyUnit");
        var ebuycash = edbs.getCollection("buyCash");
        var eredeemcash = edbs.getCollection("redeemCash");
        var etrans = edbs.getCollection("transfer");

        // $dKey = res.resource.buyUnit[0].rTruID;
        // console.log("key",$dKey);
        ebuyunit.chain().find({
            'rTruID': $dKey
        }).remove();
        ebuycash.chain().find({
            'rTruID': $dKey
        }).remove();
        eredeemcash.chain().find({
            'rTruID': $dKey
        }).remove();
        etrans.chain().find({ "rTruID": $dKey }).remove();
        // console.log("removed", $dKey);
        ebuyunit.insert(res.resource.buyUnit);
        ebuycash.insert(res.resource.buyCash);
        eredeemcash.insert(res.resource.redeemCash);
        etrans.insert(res.resource.transfer);
        edbs.saveDatabase();

    }
};

exports.insertSelfTransData = function (res, $dKey) {
    if (res.resource) {
        var eselfbuyunit = edbs.getCollection("selfbuyUnit");
        var eselfbuycash = edbs.getCollection("selfbuyCash");
        var eselfredeemcash = edbs.getCollection("selfredeemCash");

        // $dKey = res.resource.buyUnit[0].rTruID;
        // console.log("key",$dKey);
        eselfbuyunit.chain().find({
            'to': $dKey
        }).remove();
        eselfbuycash.chain().find({
            'to': $dKey
        }).remove();
        eselfredeemcash.chain().find({
            'to': $dKey
        }).remove();
        eselfbuyunit.insert(res.resource.buyUnit);
        eselfbuycash.insert(res.resource.buyCash);
        eselfredeemcash.insert(res.resource.redeemCash);  
        edbs.saveDatabase();
    }
};

exports.insertSelfAllTransData = function (res, $dKey) {
    if (res.resource) {

        var eselfallTrans = edbs.getCollection("selfbuyUnit");


        // $dKey = res.resource.buyUnit[0].rTruID;
        // console.log("key",$dKey);
        eselfallTrans.chain().find({
            'to': $dKey
        }).remove();

        eselfallTrans.insert(res.resource);

        edbs.saveDatabase();

    }
};
exports.insertTransReportData = function (res, $dKey) {
    if (res.resource) {

        var entransreport = edbs.getCollection("entitytransReport");
        // $dKey = res.resource.buyUnit[0].rTruID;
        // console.log("key",$dKey);
        entransreport.chain().find({
            'rTruID': $dKey
        }).remove();
        var data = {
            rTruID: $dKey,
            resource: res.resource
        };
        entransreport.insert(data);

        edbs.saveDatabase();

    }
}
exports.insertReqSummary = function (res) {
    if (res.resource) {

        var enreqsum = edbs.getCollection("entityReqCreditSummary");
        // $dKey = res.resource.buyUnit[0].rTruID;
        // console.log("key",$dKey);
        enreqsum.clear();
        var data = res.resource
        enreqsum.insert(data);

        edbs.saveDatabase();

    }
}
exports.updateTransReportData = function (res, $dKey) {
    if (res.resource) {

        var entransreport = edbs.getCollection("entitytransReport");
        entransreport.chain().find({
            'rTruID': $dKey
        }).update(function (obj) {
            var buyUnit = obj.resource.buyUnit;
            var buyCash = obj.resource.buyCash;
            var redeemCash = obj.resource.redeemCash;
            var transfer = obj.resource.transfer;
            obj.resource.buyUnit = buyUnit.concat(res.resource.buyUnit);
            obj.resource.buyCash = buyCash.concat(res.resource.buyCash);
            obj.resource.redeemCash = redeemCash.concat(res.resource.redeemCash);
            obj.resource.transfer = transfer.concat(res.resource.transfer);
        });
        edbs.saveDatabase();
    }
}

