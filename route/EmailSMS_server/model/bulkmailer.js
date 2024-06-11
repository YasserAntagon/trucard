var nodemailer = require("nodemailer");
var async = require("async");
function BulkMailer(config) {
    "use strict";
    if (!config.transport) {
        throw "transport not found!";
    }
    this.nodemailer = nodemailer.createTransport(config.transport);
    this.isVerbose = config.verbose || false;
}
BulkMailer.prototype.send = function (info, single, callback) {
    "use strict";
    var that = this;
    var receivers = [];
    if (single) {
        receivers = info.to.toString().split(",");
    } else {
        receivers = [info.to];
    } 
    var tasks = [];
    async.each(receivers, function (user, eachCB) {
        if (!user.includes("fake.company.com")) {
            tasks.push(function (callback) {
                info.to = user;
                that.nodemailer.sendMail(info, callback);
            });
            eachCB();
        }
        else{
            eachCB();
        }
    }, function (error) {
        if (!error) {
            async.parallel(tasks, function (error, results) {
                if (error) {
                    throw error;
                }
                else {
                    if (that.isVerbose) {
                        console.info('Mail sent to respective users!');
                    }
                    return callback(null, results);
                }
            });
        }
        else {
            if (that.isVerbose) {
                console.error(error);
            }
            return callback(error);
        }
    });
};
BulkMailer.prototype.sendMultiple = function (info, single, callback) {
    "use strict";
    var that = this;
    var receivers = [];
    if (single) {
        receivers = info.to.toString().split(",");
    } else {
        receivers = [info.to];
    } 
    var tasks = [];
    async.each(receivers, function (user, eachCB) {
        if (!user.includes("fake.company.com")) {
            tasks.push(function (callback) {
                info.to = user;
                that.nodemailer.sendMail(info, callback);
            });
            eachCB();
        }
        else{
            eachCB();
        }
    }, function (error) {
        if (!error) {
            async.parallel(tasks, function (error, results) {
                if (error) {
                    return callback(error);
                }
                else {
                    if (that.isVerbose) {
                        console.info('Mail sent to respective users!');
                    }
                    return callback(null, results);
                }
            });
        }
        else {
            if (that.isVerbose) {
                console.error(error);
            }
            return callback(error);
        }
    });
};
module.exports = BulkMailer;