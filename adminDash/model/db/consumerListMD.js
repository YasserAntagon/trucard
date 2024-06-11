var db = require('./consumerListDB');
module.exports = {
    insertConsumer: function (data) {
        var txnUser = db.getCollection("consumerListDB");
        return new Promise((resolve) => {
            data.map((txn, key) => {
                try {
                    txnUser.insert(txn)
                }
                catch (ex) {
                    console.log(ex)
                }
            })
            console.log("inserted", data.length)
            resolve(true)
        })
    },
    fetchConsumer: function (rTruID, callback) {
        var users = db.getCollection("consumerListDB");
        var rQuery = {}
        if (rTruID) {
            rQuery = { 'rTruID': rTruID };
        }
        var results = users.chain().find().data({ removeMeta: true });
        callback(results);
    },
    deleteConsumer: function (rTruID) {
        var rQuery = {}
        if (rTruID) {
            rQuery = { 'rTruID': rTruID };
        }
        var users = db.getCollection("consumerListDB");
        users.chain().find(rQuery).remove().data();
    }
}

