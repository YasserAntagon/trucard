var loki=require("lokijs");
var db = new loki('localdb/txnOptimizationSelf.db', {
	autoload: true,
	autoloadCallback : databaseInitialize,
	autosave: true, 
	autosaveInterval: 4000
});

// implement the autoloadback referenced in loki constructor
function databaseInitialize() {
  var txnOptimization = db.getCollection("txnOptimizationSelf"); 
  if (txnOptimization === null) {
    txnOptimization = db.addCollection("txnOptimizationSelf", {indices:['invoice']});
  }  
}

module.exports=db;
/* process.on('SIGINT', function() {
    // console.log("flushing database");
    db.close();
  }); */
