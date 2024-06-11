
var loki = require('lokijs');


// create db 
var custdb = new loki('localDB/TruAssetStoreDB.db',{
    autoload: true,
      autoloadCallback : datadabaseInitialise,
      autosave: true, 
      autosaveInterval: 4000
  }); 


function datadabaseInitialise() {

    var assetmanagert = custdb.getCollection("AssetStoreData");
    var custlist = custdb.getCollection("AssetStoreList");
    if (assetmanagert === null) {
        assetmanagert = custdb.addCollection("AssetStoreData");
    }
    if (custlist === null) {
        custlist = custdb.addCollection("AssetStoreList");
    }
} 
module.exports=custdb;