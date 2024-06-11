var empdb = require('../companyLocationDB');
var dbs = require('../db/dbserve');
exports.insertBranchData = function (truID, $adId, callback) {
    var branch_list = dbs.getCollection("branchData");
    var empresults = branch_list.chain().simplesort("branchName").data();
    var json = "";

    if (empresults.length > 0) {
        var jdate = branch_list.chain().simplesort("modifyDate", true).limit(1).data();  // date wise search
        json = JSON.stringify({
            "truID": truID,
            "cTruID": $adId,
            "date": jdate[0].modifyDate
        });
    }
    else {
        json = JSON.stringify({
            "truID": truID,
            "cTruID": $adId,
            "date": "all"
        });
    } 
    empdb.getBranchDetails(json, function (err, res)  // insert employee Data
    { 
        var empdata = dbs.addCollection("branchData");
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
            callback()
        }
    });
}

exports.getBranchList = function (query, callback) {

    var branch_list = dbs.getCollection("branchData");
    var results = branch_list.chain().find(query).simplesort("branchName").data();
    callback(results)
};  