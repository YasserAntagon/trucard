
var request = require('request');
module.exports =
{
    sendsms: function (json, callback)    // Request for change password to remote router
    {
        try {
            request.post({
                "headers": { "content-type": "application/json"},
                "url": process.env.smsLink,
                "body": json
            }, (error, res, body) => {
                try {
                    if (error) {
                        callback(error, null)
                        return false;
                    }
                    callback(null, JSON.parse(body));
                }
                catch {
                    callback(null, { "status": 902, message: "Something went wrong. Please try after some time!!" });
                }
            })
        }
        catch {
            callback(null, { "status": 902, message: "Something went wrong. Please try after some time!!" });
        }


    }

}