const dbs = require('./dbserve');
const empdb = require('../../../model/admin/companyMasterDB');
exports.insertCCompanyData = function (truID, callback) {
    var user = dbs.getCollection("companyData");
    var results = user.chain().simplesort("shortName").data();
    if (results.length > 0) {
        callback()
    }
    else {
        var json = JSON.stringify({
            "truID": truID
        });
        empdb.getCompanyDetails(json, function (err, res)  // insert Company Data
        {
           // console.log("cjson", res)
            if (res) {
                if (res.resource) {
                    var user = dbs.addCollection("companyData");
                    for (var i = 0; i < res.resource.length; i++) {
                        $dKey = res.resource[i].truID;
                        user.chain().find({ "truID": $dKey }).remove()
                    }
                    user.insert(res.resource);
                    dbs.saveDatabase();
                }
            }
            callback()
        });
    }
}; 
