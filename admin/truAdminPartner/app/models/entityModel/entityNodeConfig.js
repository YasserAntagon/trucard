var loki = require("lokijs");
var configdb = new loki('./app/configdb/configuration.db', {
  autoload: true,
  autoloadCallback: databaseInitialize,
  autosave: true,
  autosaveInterval: 4000
});


// implement the autoloadback referenced in loki constructor
function databaseInitialize() {
  try {
    var configEntries = configdb.getCollection("config");
    // var parentEntries = configdb.getCollection("parentConfig");
    if (configEntries === null) {
      configEntries = configdb.addCollection("config");
    }
    // }
    // if (parentEntries === null) {
    //   parentEntries = configdb.addCollection("parentConfig");
    // }
  }
  catch (ex) {
    
  }

  // kick off any program logic or start listening to external events
  //runProgramLogic();
}
// function databaseInitialize() {
//   try {
//     var nodeEntries = configdb.getCollection("nodeConfig");
//     var parentEntries = configdb.getCollection("parentConfig");
//     if (nodeEntries === null) {
//       nodeEntries = configdb.addCollection("nodeConfig");
//     }
//     if (parentEntries === null) {
//       parentEntries = configdb.addCollection("parentConfig");
//     }
//   }
//   catch (ex) {
    
//   }

//   // kick off any program logic or start listening to external events
//   //runProgramLogic();
// }

module.exports = configdb;
/* process.on('SIGINT', function() {
    // console.log("flushing database");
    db.close();
  }); */
