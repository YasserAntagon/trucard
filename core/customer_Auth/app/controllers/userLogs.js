const loginlogs = require('../models/userLogModel');
module.exports.userloginLog = function (truID, appType, loginFrom, device, referenceId, activity) {
    let login = loginlogs();
    login.truID = truID;
    login.createDate = Date();
    login.loginFrom = loginFrom ? loginFrom : undefined;
    login.device = device ? device : undefined;
    login.appType = appType ? appType : undefined;
    login.referenceId = referenceId ? referenceId : undefined;
    login.activity = activity;
    login.save(function (err) {
        if (err) {
            console.log(err)

        } else {
            console.log("Login logs Generated");
        }
    })
}