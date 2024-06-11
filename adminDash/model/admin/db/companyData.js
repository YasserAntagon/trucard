const dbs = require('./dbserve');
exports.getCompanyData = function(callback) 
{    
 var user =  dbs.getCollection("companyData");
 var results =user.chain().simplesort("shortName").data({removeMeta: true}); 
 callback(results)
}; 

