var db = require('./db');
module.exports = {

    insertErrorLog: function (errMsg, user, errLocation, errFile) {
        // //console.log(errMsg,user,errLocation,errFile);
        var items = db.addCollection('errorlog');
        var dtime = new Date();
        var errordata = {
            errorMessage: errMsg.toString(),
            datetime: dtime,
            user: user,
            errLocation: errLocation,
            errFile: errFile
        };
        var results = items.chain().find({ 'errorMessage': errordata.errorMessage, 'errLocation': errordata.errLocation }).data();
        if (results.length > 0) {
            items.chain().find({ 'errorMessage': errordata.errorMessage, 'errLocation': errordata.errLocation }).update(function (obj) {
                obj.datetime = errordata.datetime
                // if (obj.user) {
                //     var str = obj.user.split(',')
                //     var index = str.findIndex((user) => user === errordata.user)
                //     if(index == -1){
                //         obj.user = obj.user + "," +errordata.user
                //     }
                // }
            });
        }
        else {
            // //console.log("errordata", errordata);
            items.insert(errordata);
            // db.saveDatabase();
        }
    },
    getErrorLog: function (callback) {
        var errordata = db.addCollection('errorlog');
        var results = errordata.chain().data({ removeMeta: true });
        callback(results);
    },
    removeLog: function (callback) {
        var errordata = db.addCollection('errorlog');
        var results = errordata.chain().remove();
        callback(results);
    }
}