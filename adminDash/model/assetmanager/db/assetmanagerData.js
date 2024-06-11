let ldbs = require('./db');
exports.insertAssetManagerData = function (res) {
    if (res.resource) {
        var assetmanagerDB = ldbs.addCollection("assetmanagerData");

        $dKey = res.resource.truID;
        assetmanagerDB.chain().find({
            "truID": $dKey
        }).remove();

        assetmanagerDB.insert(res.resource);
        ldbs.saveDatabase();
    }
};
exports.getAssetManagerCount = function (callback) {
    var dlr = ldbs.getCollection("AssetManagerList");
    var parent = dlr.chain().find({ "isParent": true }).data({ removeMeta: true });
    var nodes = dlr.chain().find({ "isParent": false }).data({ removeMeta: true });
    let total = parent.length + nodes.length;
    let count = {
        "parent": parent.length,
        "nodes": nodes.length,
        "total": total,
    }
    callback(count);
}
exports.insertAssetManagerList = async function (res) {
    if (res) {
        var assetmanagerListDB = ldbs.addCollection("AssetManagerList");
        assetmanagerListDB.clear();
        assetmanagerListDB.insert(res);
        ldbs.saveDatabase();
        var results = res.filter((item) => { return item.isParent == true })
        var user = ldbs.getCollection("AssetManagerList");
        await results.map(async (txn, key) => {
            var count = user.chain().find({
                '$and': [{
                    'parentTruID': txn.truID
                }, {
                    'isParent': false
                }]
            }).data({ removeMeta: true });
            assetmanagerListDB.chain().find({ 'truID': txn.truID }).update(function (obj) {
                obj.nodecount = count.length
            });
        })
    }
};
exports.getLatestDateOfAssetManager = function (callback) {
    var user = ldbs.getCollection("AssetManagerList");
    var results = user.chain().find().simplesort("createDate", true).limit(1).data({ removeMeta: true });
    callback(results);
};
exports.getAssetManagerList = function (query, callback) {
    var user = ldbs.getCollection("AssetManagerList");
    var results = user.chain().find(query).simplesort("createDate").data({ removeMeta: true });
    callback(results)
};
exports.getAssetManagerLokiData = function (query, callback) {
    var user = ldbs.getCollection("AssetManagerList");
    var results = user.chain().find(query).simplesort("assetmanagerName").limit(1).data({ removeMeta: true });
    callback(results[0])
};
exports.updateAssetManagerData = async function (query, data, callback) {
    var assetmanagerListDB = ldbs.getCollection("AssetManagerList"); 
    var results2 = await assetmanagerListDB.chain().find(query).update(function (obj) {
        obj.mobile = data.mobile,
            obj.email = data.email,
            obj.gender = data.gender,
            obj.landLine = data.landLine,
            obj.DOB = data.DOB,
            obj.contactFName = data.fName,
            obj.contactMName = data.mName,
            obj.contactLName = data.lName,
            obj.assetmanagerName = data.assetmanagerName
    });
   
    callback(true)
};
exports.updateAssetManagerAddress = async function (query, data, callback) {
    var assetmanagerListDB = ldbs.getCollection("AssetManagerList");
    var results2 = await assetmanagerListDB.chain().find(query).update(function (obj) {
        obj.contactAddress = {
            "city": data.city,
            "country": data.country,
            "houseNumber": data.houseNumber,
            "landmark": data.landmark,
            "pin": data.pin,
            "state": data.state,
            "streetNumber": data.streetNumber
        },
            obj.companyRegisteredAddress = {
                "city": data.rCity,
                "country": data.rCountry,
                "houseNumber": data.rHouseNumber,
                "landmark": data.rLandmark,
                "pin": data.rPin,
                "state": data.rState,
                "streetNumber": data.rStreetNumber
            },
            obj.companyOperationAddress = {
                "city": data.oCity,
                "country": data.oCountry,
                "houseNumber": data.oHouseNumber,
                "landmark": data.oLandmark,
                "location": {
                    "type": "Point",
                    "coordinates": [
                        0,
                        0
                    ]
                },
                "pin": data.oPin,
                "state": data.oState,
                "streetNumber": data.oStreetNumber
            }
    });
    var results = assetmanagerListDB.chain().find(query).simplesort("assetmanagerName").limit(1).data({ removeMeta: true });  
    callback(true)
};
exports.updateAssetManagerKYCDOC = async function (query, data, callback) {
    var assetmanagerListDB = ldbs.getCollection("AssetManagerList");
    var results2 = await assetmanagerListDB.chain().find(query).update(function (obj) {
        obj.KYCDetails = data.KYCDetails
    });
   
    callback(true)
};
exports.updateAssetManagerPartners = async function (query, data, callback) {
    var assetmanagerListDB = ldbs.getCollection("AssetManagerList");
    var results2 = await assetmanagerListDB.chain().find(query).update(function (obj) {
        obj.directorsAadhar = data.directorsAadhar,
            obj.partnersAadhar = data.partnersAadhar,
            obj.companyName = data.companyName
    });
    console.log("updateAssetManagerPartners", results2)
    callback(true)
};
exports.updateActivation = async function (query, kycFlag, callback) {
    var assetmanagerListDB = ldbs.getCollection("AssetManagerList");
    var results2 = await assetmanagerListDB.chain().find(query).update(function (obj) {
        obj.KYCFlag = kycFlag
    });
   /*  var results = assetmanagerListDB.chain().find(query).simplesort("assetmanagerName").limit(1).data({ removeMeta: true }); 
    console.log("kyc", results)  */
    callback(true)
};
exports.getAssetManagerData = function (query, callback) {
    var user = ldbs.getCollection("assetmanagerData");
    var results = user.chain().find(query).simplesort("assetmanagerName").limit(1).data({ removeMeta: true });
    callback(results[0])
};