
var loki = require('lokijs'); 
// create db 
var edb = new loki('localDB/TruEntityDB.db',{
  autoload: true,
    autoloadCallback : datadabaseInitialise,
    autosave: true, 
    autosaveInterval: 4000
}); 
function datadabaseInitialise() {

    var edata = edb.getCollection("EntityData");

    if (edata === null) {
        edata = edb.addCollection("EntityData");
    }
    var EntityList = edb.getCollection("EntityList");
    
    var ebuyunit = edb.getCollection("buyUnit");
    var ebuycash = edb.getCollection("buyCash");
    var eredeemcash = edb.getCollection("redeemCash");
    var etrans = edb.getCollection("transafer");
    var eselfbuyunit = edb.getCollection("selfbuyUnit");
    var eselfbuycash = edb.getCollection("selfbuyCash");
    var eselfredeemcash = edb.getCollection("selfredeemCash");
    var eselfTransDr = edb.getCollection("selftransferDR");
    var eselfTransCr = edb.getCollection("selftransferCR");
    var eselfAllTrans = edb.getCollection("selfallTrans");
    var etransReport = edb.getCollection("entitytransReport")
    var eReqSum = edb.getCollection("entityReqCreditSummary")

    
    if (EntityList === null) {
      // first time run so add and configure collection with some arbitrary options
      EntityList = edb.addCollection("EntityList", { indices: ['truID']});
      EntityList.ensureUniqueIndex('truID');
    }
    if (ebuyunit === null) {
      // first time run so add and configure collection with some arbitrary options
      ebuyunit = edb.addCollection("buyUnit");
    }
    if (ebuycash === null) {
      // first time run so add and configure collection with some arbitrary options
      ebuycash = edb.addCollection("buyCash");
    }
    if (eredeemcash === null) {
      // first time run so add and configure collection with some arbitrary options
      eredeemcash = edb.addCollection("redeemCash");
    }
    if (etrans === null) {
      // first time run so add and configure collection with some arbitrary options
      etrans = edb.addCollection("transfer");
    }
    
    if (eselfbuyunit === null) {
      // first time run so add and configure collection with some arbitrary options
      eselfbuyunit = edb.addCollection("selfbuyUnit");
    }
    if (eselfbuycash === null) {
      // first time run so add and configure collection with some arbitrary options
      eselfbuycash = edb.addCollection("selfbuyCash");
    }
    if (eselfredeemcash === null) {
      // first time run so add and configure collection with some arbitrary options
      eselfredeemcash = edb.addCollection("selfredeemCash");
    }
    if (eselfTransDr === null) {
      // first time run so add and configure collection with some arbitrary options
      eselfTransDr = edb.addCollection("selftransferDR");
    }
    if (eselfTransCr === null) {
      // first time run so add and configure collection with some arbitrary options
      eselfTransCr = edb.addCollection("selftransferCR");
    }
    if (eselfAllTrans === null) {
      // first time run so add and configure collection with some arbitrary options
      eselfAllTrans = edb.addCollection("selfallTrans");
    }
    if (etransReport === null) {
      // first time run so add and configure collection with some arbitrary options
      etransReport = edb.addCollection("entitytransReport");
    }
    if (eReqSum === null) {
      // first time run so add and configure collection with some arbitrary options
      eReqSum = edb.addCollection("entityReqCreditSummary");
    }
}
/* 
edb.loadDatabase({}, function (err) {
    datadabaseInitialise();
    console.log("database initialise");
    // console.log(edb);
})
 */
module.exports=edb;