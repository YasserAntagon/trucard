var loki=require("lokijs");
var db = new loki('localdb/transaction.db', {
	autoload: true,
	autoloadCallback : databaseInitialize,
	autosave: true, 
	autosaveInterval: 4000
});

// implement the autoloadback referenced in loki constructor
function databaseInitialize() {
  var entries = db.getCollection("transactions");
  if (entries === null) {
    entries = db.addCollection("transactions");
  } 
  // kick off any program logic or start listening to external events
  //runProgramLogic();
}

module.exports=db;
/* process.on('SIGINT', function() {
    // console.log("flushing database");
    db.close();
  }); */
