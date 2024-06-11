var empdb = require('../empMasterDB');
const dbs = require('./dbserve');
exports.insertEmpData = function ($adId) {
    var user = dbs.getCollection("empData");
    var empresults = user.chain().simplesort("empCode").data();
    var json = "";
    if (empresults.length > 0) {
        var jdate = user.chain().simplesort("modifyDate", true).limit(1).data();  // date wise search

        json = JSON.stringify({
            "truID": $adId,
            "date": jdate[0].modifyDate
        });
    }
    else {
        json = JSON.stringify({
            "truID": $adId,
            "date": "all"
        });
    }
    empdb.getEmployeeData(json, function (err, res)  // insert employee Data
    { 
        var empdata = dbs.addCollection("empData");
        if (res) {
            if (res.resource) {
                if (res.resource.length != 0) {
                    for (var i = 0; i < res.resource.length; i++) {
                        $dKey = res.resource[i].truID;
                        empdata.chain().find({ "truID": $dKey }).remove()
                    }
                    empdata.insert(res.resource);
                    dbs.saveDatabase();
                }
            }
        }
    });
}
exports.getEmpData = function (query, callback) {
    var user = dbs.getCollection("empData");
    var results = user.chain().find(query).simplesort("empCode").data();
    callback(results)
};
exports.getEmpBranchWiseData = function (query, callback) {
    var user = dbs.getCollection("empData");
    var results = user.chain().find(query).simplesort("empCode").data();
    callback(results)
};
exports.updateProfile = function (json, callback) {
    empdb.updateEmpProfile(json, function (err, res) {
        callback(res)
    });
}; 