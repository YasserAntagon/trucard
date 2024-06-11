function databaseRemove() 
{
  var entries = db.getCollection("companyData"); db.saveDatabase();
  var buyHistory = db.getCollection("buyHistory"); db.saveDatabase();
  var buyCashHistory = db.getCollection("buyCashHistory"); db.saveDatabase();
  var redeemCashHistory = db.getCollection("redeemCashHistory"); db.saveDatabase();
  var transferHistory = db.getCollection("transferHistory");  
  var empData = db.getCollection("empData");  
  var branchData = db.getCollection("branchData");  
  
  // Add our main example collection if this is first run.
  // This collection will save into a partition named quickstart3.db.0 (collection 0)  
  if (entries != null) 
  { 
    // first time run so add and configure collection with some arbitrary options
    //entries = db.removeCollection("companyData"); db.saveDatabase();
    db.removeCollection('companyData');  
    db.saveDatabase(); db.saveDatabase();
  }
 
  if (buyHistory != null) 
  {
     db.removeCollection("buyCashHistory"); 
     db.saveDatabase();
    //messages.insert({ txt: "i will only insert into this collection during database Initialize" }); db.saveDatabase();
  }
  if (buyCashHistory != null) 
  {
    // first time run so add and configure collection with some arbitrary options
     db.removeCollection("buyCashHistory"); 
     db.saveDatabase();
  }
  
  if (redeemCashHistory != null) 
  {
    // first time run so add and configure collection with some arbitrary options
   db.removeCollection("redeemCashHistory"); 
   db.saveDatabase();
  }

  if (transferHistory != null) 
  {
    // first time run so add and configure collection with some arbitrary options
      db.removeCollection("transferHistory"); 
      db.saveDatabase();
  }
  if (empData != null) 
  {
    //  Employee Data configure collection with some arbitrary options
   db.removeCollection("empData"); 
   db.saveDatabase();
  }
  if (branchData != null) 
  {
    // Branch Location Data add and configure collection with some arbitrary options
     db.removeCollection("branchData"); 
     db.saveDatabase();
  }  
}