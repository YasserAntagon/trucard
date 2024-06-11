var db = require('./partnerListDB');
module.exports = {
    insertPartner: function (data) {
        var txnUser = db.getCollection("partnerListDB");
        return new Promise((resolve) => {
            data.map((txn, key) => {
                try {
                    txnUser.insert(txn) 
                }
                catch (ex) { 
                    console.log(ex)
                }
            }) 
            resolve(true)
        })
    },
    fetchPartner: function (rTruID, callback) {
        var users = db.getCollection("partnerListDB");
        var results = users.chain().find({ 'rTruID': rTruID }).data({ removeMeta: true });
        callback(results);
    },
    fetchPartnerAll: function (callback) {
        var users = db.getCollection("partnerListDB");
        var results = users.chain().find({}).data({ removeMeta: true });
        callback(results);
    },
    deletePartner: function (rTruID) {
        var users = db.getCollection("partnerListDB");
        users.chain().find({ 'rTruID': rTruID }).remove().data();
    }
}

