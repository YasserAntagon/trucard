 var centgross =  100 ;
 var assetmanagercharges =  0.005;
 var othercharges =  0.006;
 var entitycharges =  0.005;
 
 module.exports.tax =  0.03;
 module.exports.centnet =  centgross + ((assetmanagercharges + othercharges) * 100);
 module.exports.centgross =  centgross;
 module.exports.assetmanagercharges =  assetmanagercharges;
 module.exports.othercharges =  othercharges;
 module.exports.entitycharges =  entitycharges;
 
 var assetmanagercharges_rgcoin =  0.1;
 module.exports.assetmanagercharges_rgcoin =  assetmanagercharges_rgcoin;
 module.exports.centnet_rgcoin =  centgross +(othercharges * 100);
 module.exports.lending_processing =  0.01;
 module.exports.transactionfees = 0.005;
 module.exports.slabAmt = 25000;
 module.exports.serviceTax = 0.18;
 module.exports.NEFTcharges = 1.25;
 module.exports.IMPScharges = 5;
 module.exports.IMPScharges1 = 9;
 module.exports.RTGScharges = 10;