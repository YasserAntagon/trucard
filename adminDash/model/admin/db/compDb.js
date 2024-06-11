var loki=require("lokijs");
var employeeData = require(__dirname+'/api/db/employeeData');
var cmpData = require(__dirname+'/api/db/cmpData');
var branchList = require(__dirname+'/api/db/branchList');
var db = new loki('localdb/truAdminDB.db', {
	autoload: true,
	autoloadCallback : databaseInitialize,
	autosave: true, 
	autosaveInterval: 4000
});

// implement the autoloadback referenced in loki constructor
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
 

function runProgramLogic() // sync all db 
{ 
  $adId=store.get("adId"); // login admin truID

  cmpData.insertCompanyData(db);  // company data store in lokijs
    
  employeeData.insertEmpData(db,$adId);   // Employee data store in lokijs

  $cmpId=store.get("cid");  // company Id
  branchList.insertBranchData(db,$cmpId);    // branch location list store in lokijs

    /* loadTrans.insertTransData(db,function(res) // sync all transaction history here
    {  
     console.log(res);
    }); */
}
// manual bootstrap
// db.loadDatabase({}, function(err) 
// {
//   databaseInitialize();
//   console.log("db initialized");
setTimeout(function(){
    runProgramLogic();
},5000)  
//   console.log("program logic run but it's save database probably not finished yet");
// });

// module.exports=db;
/* process.on('SIGINT', function() {
    // //console.log("flushing database");
    db.close();
  }); */
