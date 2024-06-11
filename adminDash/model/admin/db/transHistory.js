exports.getBuyHistory = function(dbs,callback) 
{    
 var cash =  dbs.getCollection("buyCashHistory");
 var cashresults = cash.chain().simplesort("createDate").data();  

 var buy =  dbs.getCollection("buyHistory");
 var buyresults =buy.chain().simplesort("createDate").data(); 
var finalObj = $.merge(cashresults, buyresults);


 callback(finalObj)
};

exports.getRedeemHistory = function(dbs,callback) 
{    
 var redeemCash =  dbs.getCollection("redeemCashHistory");
 var redeemCashresults = redeemCash.chain().simplesort("createDate").data();  

 callback(redeemCashresults);
};

exports.getTransferHistory = function(dbs,callback) 
{    
 var user =  dbs.getCollection("transferHistory");
 var results = user.chain().simplesort("createDate").data();  
 callback(results)
};
