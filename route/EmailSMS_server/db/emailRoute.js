var db = require('./dbEmailLog');
module.exports = {
    insertEmailLog: function (obj, callback) {
        var user = db.getCollection("emailLog");
        var dtime = new Date();
        let id = (Date.parse(dtime) + Math.random()).toString().replace('.', '');
        let data = {
            id: id,
            resource: obj.resource,
            status: obj.status,
            templateID :"",
            // txnBy: obj.txnby,
            routeNo:"",
            sentDate: Date.parse(dtime),
        }
        user.insert(data);
        callback(data)
    },
    updateEmailLog:function(eID, status){
        var user = db.getCollection("emailLog");
        user.chain().find({ 'id': eID }).update(function (obj) {
            obj.status = status
        })
    },
    getEmailLog:function(query, callback){
        var user = db.getCollection("emailLog");
        callback(user.chain().find(query).data({removeMeta:true}));
    }
}