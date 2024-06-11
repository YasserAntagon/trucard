var loki=require("lokijs");
var db = new loki('localdb/txnOptimization.db', {
	autoload: true,
	autoloadCallback : databaseInitialize,
	autosave: true, 
	autosaveInterval: 4000
});

// implement the autoloadback referenced in loki constructor
function databaseInitialize() {
  var txnOptimization = db.getCollection("txnOptimization"); 
  if (txnOptimization === null) {
    txnOptimization = db.addCollection("txnOptimization", {indices:['invoice']});
  }  
}

module.exports=db;
/* process.on('SIGINT', function() {
    // console.log("flushing database");
    db.close();
  }); */
