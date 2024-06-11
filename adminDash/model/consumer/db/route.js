const dbs=require('../db/db');  
exports.getBuyHistory = function (tID, trans_stutus,callback) {
    var cash = dbs.getCollection("buyCash");
    var cashresults = cash.chain().find({
        to:{'$eq':tID},
        status:trans_stutus
    }).data() 
    var buy = dbs.getCollection("buyUnit");
    var buyresults = buy.chain().find({
        to:{'$eq':tID},
        status: trans_stutus
    }).data()
    callback(
        [
            {
            "buyCash":cashresults,
            "buyUnit":buyresults
            }
        ]
    )
};
exports.getredeemHistory = function (tID, trans_stutus, callback) {
    //console.log("here")
    var cash = dbs.getCollection("redeemCash");
    var cashresults = cash.chain().find({
        to:{'$eq':tID},
        status:trans_stutus
    }).data()
    
    // console.log("And query ",cashresults,buyresults)
    callback(
        [
            {
            "redeemCash":cashresults
            }
        ]
    )
    
};

exports.gettransferHistory = function (tID,trans_stutus,callback) {
    //console.log("here")
    // var accdata = new Array();
    var cash = dbs.getCollection("transferCR");
 
    var cashresults = cash.chain().find({
        to:{'$eq':tID},
        status:trans_stutus
    }).data()
  
    callback(cashresults)
};

exports.gettransferHistorydr = function (tID,trans_stutus,callback) {
    //console.log("here")
    // var accdata = new Array();
    var cash = dbs.getCollection("transferDR");
 
    var cashresults = cash.chain().find({
        fromTruID:{'$eq':tID},
        status:trans_stutus
    }).data()
  
    callback(cashresults)
};

exports.getConversionHistory = function (tID,trans_stutus,callback) {
    //console.log("here")
    // var accdata = new Array();
    var cash = dbs.getCollection("conversion");
 
    var cashresults = cash.chain().find({
        truID:{'$eq':tID},
        status:trans_stutus
    }).data()
  
    callback(cashresults)
};


exports.getinvoice = function (invoiceno, callback){
    var invoice = dbs.getCollection("invoice");
    var objinvoice = invoice.find({ 'invoice': { '$eq': invoiceno } }); 
    callback(objinvoice);
}

exports.getConsumerList = function(callback){
    var custlist = dbs.getCollection("consumerData");
    var objcustlist = custlist.chain().data();

    callback(objcustlist)
}


exports.getConsumerdetails = function(truid, callback){
    
    var custlist = dbs.getCollection("ConsumerList");
    var objcustlist = custlist.find({ 'truID': { '$eq': truid } });
    

    callback(objcustlist)
}
exports.getConsumerWalletLog = function(truid, callback){
    
    var custlist = dbs.getCollection("WalletTrans");
    var objcustlist = custlist.chain().find({ 'truID': { '$eq': truid } }).data({ removeMeta: true});
    

    callback(objcustlist[0])
}
exports.getconsumerRefListDB = function(query, callback){
    
    var custlist = dbs.getCollection("consumerRefList");
    var objcustlist =  custlist.chain().find(query).data({removeMeta: true })
    

    callback(objcustlist)
}