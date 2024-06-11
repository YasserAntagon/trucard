var request = require('request');
var sha = require('../../sha');
let atompath = require('../../model/config/atomkey.json'); 
var xml2js = require('xml2js');
var parser = new xml2js.Parser(); 
function formatPGDate(date) {
    var today = new Date();
    if (date) {
        today = new Date(date);
    }
    var dd = today.getDate();
    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();
    if (dd < 10) {
        dd = '0' + dd;
    }
    if (mm < 10) {
        mm = '0' + mm;
    }
    if (date) {
        return yyyy + '-' + mm + '-' + dd;
    }
    else {
        return dd + '/' + mm + '/' + yyyy;
    }
}
function decimalChopper(num, fixed) {
    var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?');
    return num.toString().match(re)[0];
}
module.exports = { 
    refundAtomStatus: function (req, response)    // save  lbma Rate
    {
        try {
            var amount = parseFloat(req.body.AMOUNT);
            var date = formatPGDate(req.body.txnDate);
            var statusCheckURL = atompath.url + "/paynetz/vfts?merchantid=" + atompath.loginID + "&merchanttxnid=" + req.body.ORDER_ID + "&amt=" + amount + "&tdate=" + date
            request(statusCheckURL, (error, res, body) => {
                try 
                {
                    if (error) {
                        return false;
                    }
                    parser.parseString(body, function (err, result) {
                        var books = result['VerifyOutput'];
                        var bookJson = {
                            "invoice": books.$.MerchantTxnID,
                            "txnDate": books.$.TxnDate,
                            "bankname": books.$.bankname,
                            "BID":books.$.BID,
                            "cardNumber": books.$.CardNumber == "null" ? "" : books.$.CardNumber,
                            "discriminator": books.$.discriminator,
                            "amount": books.$.AMT,
                            "status": books.$.VERIFIED,
                            "ctruid": req.body.ctruid,
                            "atruid": req.body.truID,
                            "atomtxnid": books.$.atomtxnId,
                            "pgType": "atom",
                            "ttype": req.body.ttype,
                            "isPeople": req.body.isPeople,
                            "reconstatus": books.$.reconstatus
                        }
                        response.send({ status: 200, resource: bookJson })
                    });
                }
                catch (ex) {
                    let err = {
                        "status": 401,
                        "message": ex.message
                    }
                    response.send(err)

                }
            });
        }
        catch (ex) {
            let err = {
                "status": 401,
                "message": ex.message
            }
            response.send(err)
        }
    },
    initiateAtomRefund: function (req, response)    // save  lbma Rate
    {
        var date = formatPGDate(req.body.txnDate);
        var final = (Buffer.from(atompath.pass).toString('base64'));
        var statusCheckURL = atompath.url + "/paynetz/rfts?merchantid=" + atompath.loginID + "&pwd=" + encodeURIComponent(final) + "&atomtxnid=" + req.body.atomtxnid + "&refundamt=" + req.body.amount + "&txndate=" + date

        request(statusCheckURL, (error, res, body) => {
            try {
                if (error) {
                    return false
                }
                parser.parseString(body, function (err, result) {
                    var books = result.REFUND;
                    if (books.STATUSCODE[0].toString() == "00" || books.STATUSCODE[0].toString() == "01") {
                        let doc = {
                            "truid": req.body.ctruid,
                            "atruid": req.body.truID,
                            "ttype": req.body.ttype,
                            "invoice": req.body.invoice,
                            "isPeople": req.body.isPeople,
                            "amount": books.AMOUNT[0].toString(),
                            "txnid": books.TXNID[0].toString(),
                            "responsecode": books.STATUSCODE[0],
                            "responsemessage": books.STATUSMESSAGE[0],
                            "particulas": req.body.particulas,
                            "pgType": "atom"
                        }
                        response.send({ status: "8000", resource: doc })
                    }
                    else {
                        response.send({ status: "411", resource: [], message: books.STATUSMESSAGE[0] })
                    }
                });

            }
            catch (ex) {
                let err = {
                    "status": 401,
                    "message": ex.message
                }
                response.send(err)

            }
        });
    }
}