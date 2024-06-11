var loki = require('lokijs'); 
var dbs = new loki('localDB/truAdminAssetManagerDB.db',{
  autoload: true,
    autoloadCallback : databaseInitialize,
    autosave: true, 
    autosaveInterval: 4000
}); 

process.on('SIGINT', function() { 
    dbs.close();
  });

// set up an initialize function for first load (when db hasn't been created yet)
function databaseInitialize() 
{
  var assetmanagert = dbs.getCollection("assetmanagerData"); 
  var AssetManagerList = dbs.getCollection("AssetManagerList"); 
  // Add our main example collection if this is first run.
  // This collection will save into a partition named quickstart3.dbs.0 (collection 0)  
  if (assetmanagert === null) 
  {
    // first time run so add and configure collection with some arbitrary options
    assetmanagert = dbs.addCollection("assetmanagerData");
  }
  if (AssetManagerList === null) 
  {
    // first time run so add and configure collection with some arbitrary options
    AssetManagerList = dbs.addCollection("AssetManagerList");
  }
  
   
}
module.exports=dbs;
