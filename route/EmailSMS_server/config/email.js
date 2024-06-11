let nodemailer = require('nodemailer');
let BulkMailer = require("../model/bulkmailer");
require('dotenv').config();
let environment = process.env;
var path = require('path');
module.exports.GmailTransport = nodemailer.createTransport({
    // service: environment.GMAIL_SERVICE_NAME,
    host: environment.GMAIL_SERVICE_HOST,
    // secure: environment.GMAIL_SERVICE_SECURE,
    port: environment.GMAIL_SERVICE_PORT,
    auth: {
        user: "emailapikey",
        pass: environment.zohotoken
    }
}); 
var options = {
    transport: {
        service: environment.GMAIL_SERVICE_NAME,
        host: environment.GMAIL_SERVICE_HOST,
        secure: environment.GMAIL_SERVICE_SECURE,
        port: environment.GMAIL_SERVICE_PORT,
        auth: {
            user: environment.truUsename,
            pass: environment.truPassword
        }
    },
    verbose: true
};
module.exports.bulkmailTransport = new BulkMailer(options)

var infoOptions = {
    transport: {
        service: environment.GMAIL_SERVICE_NAME,
        host: environment.GMAIL_SERVICE_HOST,
        secure: environment.GMAIL_SERVICE_SECURE,
        port: environment.GMAIL_SERVICE_PORT,
        auth: {
            user: environment.infoUser,
            pass: environment.infoPass
        }
    },
    verbose: true
};
module.exports.infoMailTransport = new BulkMailer(infoOptions)

var optionOutlet = {
    transport: {
        service: environment.GMAIL_SERVICE_NAME,
        host: environment.GMAIL_SERVICE_HOST,
        secure: environment.GMAIL_SERVICE_SECURE,
        port: environment.GMAIL_SERVICE_PORT,
        auth: {
            user: environment.truOutletUser,
            pass: environment.truOutletPass
        }
    },
    verbose: true
};
module.exports.bulkmailOutletTransport = new BulkMailer(optionOutlet)

module.exports.ViewOption = (transport, hbs, email) => {
    console.log("file", email)
    transport.use('compile', hbs({
        viewEngine: {
            extName: '.hbs',
            partialsDir: path.resolve(__dirname, '../views'),
            layoutsDir: path.resolve(__dirname, '../views'),
            defaultLayout: email + '.hbs',
            helpers: {
                if_eql: function (a, b, opts) {
                    if (a == b) {
                        return opts.fn(this)
                    } else {
                        return opts.inverse(this)
                    }
                }
            }
        },
        viewPath: path.resolve(__dirname, '../views'),
        extName: '.hbs'
    }));
}
