var MailConfig = require('../config/email');
module.exports =
{
    sendBulkEmail: function (to, body, subject, flag, callback)    // Request for change password to remote router
    {
        let bulkMailer;
        var mailOptions = {
            to: to,
            subject: subject,
            html: body
        }
        if (flag == process.env.infoUser) {
            bulkMailer = MailConfig.infoMailTransport;

            mailOptions.from = '"" <' + process.env.infoUser + '>';
        }
        else if (flag == process.env.truOutletUser) {
            bulkMailer = MailConfig.bulkmailOutletTransport;
            mailOptions.from = '" Business" <' + process.env.truOutletUser + '>';
        }

        bulkMailer.send(mailOptions, true, function (error, result) { // arg1: mailinfo, agr2: parallel mails, arg3: callback
            if (error) {
                callback(error)
            } else {
                callback(result)
            }
        });
    },
    sendEmailAttachment: function (to, body, subject, flag, attach, callback)    // Request for change password to remote router
    {
        let bulkMailer;
        var mailOptions = {
            to: to,
            subject: subject,
            html: body,
            attachments: JSON.parse(attach)
        }
        if (flag == process.env.infoUser) {
            bulkMailer = MailConfig.infoMailTransport; 
            mailOptions.from = '"" <' + process.env.infoUser + '>';
        }
        else if (flag == process.env.truOutletUser) {
            bulkMailer = MailConfig.bulkmailOutletTransport;
            mailOptions.from = '" Business" <' + process.env.truOutletUser + '>';
        }

        bulkMailer.send(mailOptions, true, function (error, result) { // arg1: mailinfo, agr2: parallel mails, arg3: callback
            if (error) {
                console.error(error);
                callback(error)
            } else {
                console.info(result);
                callback(result)
            }
        });
    },
    sendEmailOfficial: function (to, msg, subject, name, msg1, callback)    // Request for change password to remote router
    {
        try {
            var mailOptions = {
                from: '"" <' + process.env.truUsename + '>',
                to: to,
                subject: subject,
                html: msg
            }
            var receiverOptions = {
                from: '"' + name + '" <' + to + '>',
                to: "nikhil.b@company.com",
                replyTo: '"' + name + '" <' + to + '>',
                subject: subject,
                html: msg1
            }
            const gmailTransport = MailConfig.GmailTransport;
            gmailTransport.sendMail(receiverOptions, function (error, result) { // arg1: mailinfo, agr2: parallel mails, arg3: callback
                console.log("company", error, result);
            });

            gmailTransport.sendMail(mailOptions, function (error, result) { // arg1: mailinfo, agr2: parallel mails, arg3: callback
                console.log("consumer", error, result);
            });
        }
        catch (ex) {
            console.log("ex", ex)
        }
    }
}