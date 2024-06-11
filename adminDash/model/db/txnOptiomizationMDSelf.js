var db = require('./txnOptimizationDBSelf');
module.exports = {
    insertTxnSummary: function (data) {
        var txnUser = db.getCollection("txnOptimizationSelf");
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
    fetchTxnSummary: function (rTruID, callback) {
        var users = db.getCollection("txnOptimizationSelf");
        var results = users.chain().find({ 'to': rTruID }).data({ removeMeta: true });
        callback(results);
    },
    deleteTxnSummary: function (rTruID) {
        var users = db.getCollection("txnOptimizationSelf");
        users.chain().find({ 'to': rTruID }).remove().data();
    }
}

