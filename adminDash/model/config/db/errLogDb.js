var db = require('./db'); 
module.exports = {
    
    insertErrorLog : function (errMsg,user,errLocation,errFile) {
        var items = db.addCollection('errorlog');
        var dtime = new Date();
        var data = {
            errorMessage: errMsg,
            datetime:dtime,
            user:user,
            errLocation:errLocation,
            errFile:errFile
        };
        items.insert(data); 
    }
}