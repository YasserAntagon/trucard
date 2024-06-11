var db = require('./txndb');
module.exports = {
    insertTxn: function (ctruID, txnInvoice, paytype, cname) {
        var txn = db.addCollection('transactions');
        var results = txn.chain().find({ 'truID': ctruID, 'invoiceNo': txnInvoice.resource.invoice }).data();
        if (results.length > 0) {
            txn.chain().find({ 'truID': ctruID, 'invoiceNo': txnInvoice.resource.invoice }).update(function (obj) {
                obj.Invoice = txnInvoice
            })
        } else {
            var data = {
                truID: ctruID,
                invoiceNo: txnInvoice.resource.invoice,
                Invoice: txnInvoice,
                ttype: txnInvoice.resource.type,
                paytype: paytype,
                cName: cname
            };
            txn.insert(data);
        }

    },
    findTxn: function (ordid, callback) {
        var txn = db.getCollection("transactions");
        var results = txn.chain().find({ 'invoiceNo': ordid }).data();
        callback(results[0]);

    },
    findTxnSuccess: function (truid, ordid, callback) {
        var txn = db.getCollection("transactions");
        var results = txn.chain().find({"truID": truid, 'invoiceNo': ordid, 'Invoice.resource.status':"success" }).data();
        callback(results[0].Invoice);

    },
    delTxn: function (ordid) {
        var txn = db.getCollection("transactions");
        var results = txn.chain().find({ 'invoiceNo': ordid }).remove();

    }
}