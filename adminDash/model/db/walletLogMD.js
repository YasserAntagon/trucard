var db = require('./walletLogDB');
module.exports = {
    insertWalletLog: function (data) {
        var txnUser = db.getCollection("walletLogDB");
        return new Promise((resolve) => {
            data.map((txn, key) => {
                try {
                    txnUser.insert(txn) 
                }
                catch (ex) { 
                    console.log(ex)
                }
            })
            console.log("inserted",data.length)
            resolve(true)
        })
    },
    fetchWalletLog: function (rTruID, callback) {
        var users = db.getCollection("walletLogDB");
        var results = users.chain().find({ 'rTruID': rTruID }).data({ removeMeta: true });
        callback(results);
    },
    deleteWalletLog: function (rTruID) {
        var users = db.getCollection("walletLogDB");
        users.chain().find({ 'rTruID': rTruID }).remove().data();
    }
}

