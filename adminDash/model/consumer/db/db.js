
var loki = require('lokijs');


// create db
var cdb = new loki('localDB/TruConsumerDB.db',{
  autoload: true,
	autoloadCallback : databaseInitialize,
	autosave: true, 
	autosaveInterval: 4000
}); 

function databaseInitialize() {

  var assetmanagert = cdb.getCollection("consumerData");
  var consumerDataList = cdb.getCollection("consumerDataList");
  var cbuyunit = cdb.getCollection("buyUnit");
  var cbuycash = cdb.getCollection("buyCash");
  var credeemcash = cdb.getCollection("redeemCash");
  var ctransdr = cdb.getCollection("transaferDR");
  var ctrandcr = cdb.getCollection("transferCR");
  var cWaltrans = cdb.getCollection("WalletTrans");
  var cRefList = cdb.getCollection("consumerRefList");
  

  if (assetmanagert === null) {
    // first time run so add and configure collection with some arbitrary options
    assetmanagert = cdb.addCollection("consumerData");
  }
  
  if (consumerDataList === null) {
    // first time run so add and configure collection with some arbitrary options
    consumerDataList = cdb.addCollection("consumerDataList", { indices: ['truID']});
    consumerDataList.ensureUniqueIndex('truID');
  } 
  if (cbuyunit === null) {
    // first time run so add and configure collection with some arbitrary options
    cbuyunit = cdb.addCollection("buyUnit");
  }
  if (cbuycash === null) {
    // first time run so add and configure collection with some arbitrary options
    cbuycash = cdb.addCollection("buyCash");
  }
  if (credeemcash === null) {
    // first time run so add and configure collection with some arbitrary options
    credeemcash = cdb.addCollection("redeemCash");
  }
  if (ctransdr === null) {
    // first time run so add and configure collection with some arbitrary options
    ctransdr = cdb.addCollection("transferDR");
  }
  if (ctrandcr === null) {
    // first time run so add and configure collection with some arbitrary options
    ctrandcr = cdb.addCollection("transferCR");
  }
  if (cWaltrans === null) {
    // first time run so add and configure collection with some arbitrary options
    cWaltrans = cdb.addCollection("WalletTrans");
  }
  if (cRefList === null) {
    // first time run so add and configure collection with some arbitrary options
    cRefList = cdb.addCollection("consumerRefList");
  }
} 
module.exports=cdb;