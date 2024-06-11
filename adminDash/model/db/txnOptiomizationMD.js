var db = require('./txnOptimizationDB');
module.exports = {
    insertTxnSummary: function (data) {
        var txnUser = db.getCollection("txnOptimization");
        txnUser.chain().find().remove().data();
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
    fetchAllSummary: function (callback) {
        var users = db.getCollection("txnOptimization");
        var results = users.chain().find({}).data({ removeMeta: true });
        callback(results);
    },
    fetchTxnSummary: function (rTruID, callback) {
        var users = db.getCollection("txnOptimization");
        var results = users.chain().find({ 'rTruID': rTruID }).data({ removeMeta: true });
        callback(results);
    },
    deleteTxnSummary: function (rTruID) {
        var users = db.getCollection("txnOptimization");
        var query = {};
        if (rTruID) {
            query = { 'rTruID': rTruID }
        }
        users.chain().find().remove().data();
    }
}

