var loki=require("lokijs");
var db = new loki('localdb/consumerListDB.db', {
	autoload: true,
	autoloadCallback : databaseInitialize,
	autosave: true, 
	autosaveInterval: 4000
});

// implement the autoloadback referenced in loki constructor
function databaseInitialize() {
  var txnOptimization = db.getCollection("consumerListDB"); 
  if (txnOptimization === null) {
    txnOptimization = db.addCollection("consumerListDB", {indices:['truID']});
  }  
}

module.exports=db;
/* process.on('SIGINT', function() {
    // console.log("flushing database");
    db.close();
  }); */
