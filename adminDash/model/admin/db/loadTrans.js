
exports.insertTransData = function(dbs,callback) 
{    
    
 var buy =  dbs.addCollection("buyHistory"); 
 var jdata=json;
 if(jdata.resource.buy)
 {
    buy.insert(jdata.resource.buy);
    dbs.saveDatabase();
 }

 if(jdata.resource.buyCash)
 {
 var buyCash =  dbs.addCollection("buyCashHistory"); 
 buyCash.insert(jdata.resource.buyCash);
 dbs.saveDatabase();
 }

 if(jdata.resource.redeemCash)
 {
 var redeemCash =  dbs.addCollection("redeemCashHistory"); 
 redeemCash.insert(jdata.resource.redeemCash);
 dbs.saveDatabase();
 }

callback("done")
}; 
