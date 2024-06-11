var loki = require("lokijs");
var countdb = new loki('localdb/count.db', {
    autoload: true,
    autoloadCallback: databaseInitialize,
    autosave: true,
    autosaveInterval: 4000
});

// implement the autoloadback referenced in loki constructor
function databaseInitialize() {
    var consumerCount = countdb.getCollection("consumerCount");
    var dlrCount = countdb.getCollection("dlrCount");
    var entityCount = countdb.getCollection("entityCount");
    var assetstoreCount = countdb.getCollection("assetstoreCount");
    if (consumerCount === null) {
        consumerCount = countdb.addCollection("consumerCount");
    }
    if (dlrCount === null) {
        dlrCount = countdb.addCollection("dlrCount");
    }
    if (entityCount === null) {
        entityCount = countdb.addCollection("entityCount");
    }
    if (assetstoreCount === null) {
        assetstoreCount = countdb.addCollection("assetstoreCount");
    }
    // kick off any program logic or start listening to external events
    // runProgramLogic();
}


/* process.on('SIGINT', function() {
    // console.log("flushing database");
    db.close();
  }); */
