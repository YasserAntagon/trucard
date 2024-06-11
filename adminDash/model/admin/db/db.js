var loki = require('lokijs'); 
var db = new loki('localDB/truAdminDB.db',{
  autoload: true,
	autoloadCallback : databaseInitialize,
	autosave: true, 
	autosaveInterval: 4000
}); 

process.on('SIGINT', function() {
    db.close();
  });

// set up an initialize function for first load (when db hasn't been created yet)
function databaseInitialize() 
{
  var entries = db.getCollection("companyData");
  var buyHistory = db.getCollection("buyHistory");
  var buyCashHistory = db.getCollection("buyCashHistory");
  var redeemCashHistory = db.getCollection("redeemCashHistory");   
  var transferHistory = db.getCollection("transferHistory");
  var empData = db.getCollection("empData");
  var branchData = db.getCollection("branchData");
  
  // Add our main example collection if this is first run.
  // This collection will save into a partition named quickstart3.db.0 (collection 0)  
  if (entries === null) 
  {
    // first time run so add and configure collection with some arbitrary options
    entries = db.addCollection("companyData");
  }

  if (buyHistory === null) 
  {
    buyHistory = db.addCollection("buyCashHistory");
    //messages.insert({ txt: "i will only insert into this collection during database Initialize" });
  }
  if (buyCashHistory === null) 
  {
    // first time run so add and configure collection with some arbitrary options
    buyCashHistory = db.addCollection("buyCashHistory");
  }
  
  if (redeemCashHistory === null) 
  {
    // first time run so add and configure collection with some arbitrary options
    redeemCashHistory = db.addCollection("redeemCashHistory");
  }
 
  if (transferHistory === null) 
  {
    // first time run so add and configure collection with some arbitrary options
    transferHistory = db.addCollection("transferHistory");
  } 
  if (empData === null) 
  {
    //  Employee Data configure collection with some arbitrary options
    empData = db.addCollection("empData");
  }
  if (branchData === null) 
  {
    // Branch Location Data add and configure collection with some arbitrary options
    branchData = db.addCollection("branchData");
  } 
} 
module.exports=db;
