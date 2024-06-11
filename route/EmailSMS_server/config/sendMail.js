const MailConfig = require('../config/email');
require('dotenv').config();
module.exports = {
    sendEmail: function (resource, body, subject, callback)    // Request for change password to remote router
    {
        const gmailTransport = MailConfig.GmailTransport;
        var mailOptions = {
            from: '"" <' + process.env.truUsename + '>',
            to: resource.mailTo,
            subject: subject,
            html: body
        }
        if (!resource.mailTo.includes("fake.company.com")) {
            gmailTransport.sendMail(mailOptions, (error, info) => {
                if (error) {
                    callback(error)
                }
                callback(info)
            });
        }
        else {
            callback("error")
        }
    },

    sendAlertEmail: function (resource, body, subject, callback)    // Request for change password to remote router
    {

        const bulkMailer = MailConfig.bulkmailTransport;
        var mailOptions = {
            from: '"" <' + process.env.truUsename + '>',
            to: resource.billingEmails,
            subject: subject,
            html: body
        }
        bulkMailer.sendMultiple(mailOptions, true, function (error, result) { // arg1: mailinfo, agr2: parallel mails, arg3: callback
            if (error) {
                callback(false)
            } else {
                callback(true)
            }
        });
    },
    sendAllEmail: function (maillist, body, subject, callback)    // Request for change password to remote router
    {
        const gmailTransport = MailConfig.GmailTransport;
        var mailOptions = {
            from: '"" <' + process.env.truUsename + '>',
            to: maillist,
            subject: subject,
            html: body
        }

        callback(body)

    },
    sendtransferEmail: function (body, mailTo, subject, callback)    // Request for change password to remote router
    {
        const gmailTransport = MailConfig.GmailTransport;
        var mailOptions = {
            from: '"" <' + process.env.truUsename + '>',
            to: mailTo,
            subject: subject,
            html: body
        }
        if (!mailTo.includes("fake.company.com")) {
            gmailTransport.sendMail(mailOptions, (error, info) => {
                if (error) {
                    callback(error)
                }
                callback(info)
            });
        }
        else {
            callback("error")
        }
    }
}