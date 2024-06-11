let custdbs = require("./db")
exports.insertcutodianData = function (res) {
    if (res.resource) {
        var assetstoreDB = custdbs.addCollection("AssetStoreData");
        $custKey = res.resource[0].truID;
        assetstoreDB.chain().find({
            "truID": $custKey
        }).remove();
        assetstoreDB.insert(res.resource);
        custdbs.saveDatabase();
    }
}

exports.getAssetStoreData = function (query, callback) {
    var cust = custdbs.getCollection("AssetStoreList");
    var results = cust.chain().find(query).simplesort('companyName').data({ removeMeta: true });
    callback(results);
}
exports.searchAssetStoreData = function (query, callback) {
    var cust = custdbs.getCollection("AssetStoreList");
    var results = cust.chain().find(query).simplesort('companyName').data({ removeMeta: true });
    callback(results);
}
exports.getAssetStoreCount = function (callback) {
    var cust = custdbs.getCollection("AssetStoreList");
    var parent = cust.chain().find({ "isParent": true }).data({ removeMeta: true });
    var nodes = cust.chain().find({ "type": 'node' }).data({ removeMeta: true });
    var store = cust.chain().find({ "type": 'store' }).data({ removeMeta: true });
    let total = parent.length + nodes.length + store.length;
    let count = {
        "parent": parent.length,
        "nodes": nodes.length,
        "store": store.length,
        "total": total,
    } 
    callback(count);
}
exports.insertcutodianlist = function (res) {
    if (res) {
        var assetstoreDB = custdbs.addCollection("AssetStoreList");
        assetstoreDB.clear();
        assetstoreDB.insert(res);
        custdbs.saveDatabase();
    }
}
exports.getLatestDateOfAssetStore = function (callback) {
    var user = custdbs.getCollection("AssetStoreList");
    var results = user.chain().find().simplesort("createDate", true).limit(1).data({ removeMeta: true });
    callback(results);
};
exports.getAssetStoreList = function (query, callback) {
    var cust = custdbs.getCollection("AssetStoreList");
    var results = cust.chain().find(query).simplesort('createDate').data({ removeMeta: true });
    callback(results);
}