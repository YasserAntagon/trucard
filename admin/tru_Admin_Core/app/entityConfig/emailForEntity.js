const request = require('request'),
    conf = require("../config");
var emailServer = conf.emailServer;
var bearer1006="#eMaIlSeRvEr*aPiS$1234@5678!2349*#"
module.exports.addMoneyFloatEmail = function (final, type, banktxnid, mailtype, amount, invoice) {
    request.post({
        "headers": { "content-type": "application/json", "Authorization": "Bearer " + bearer1006 },
        "url": emailServer + ":3114/2011",
        "body": JSON.stringify({
            "mailTo": final.email,
            "name": final.name,
            "amount": amount.toString(),
            "balance": parseFloat(final.balance).toFixed(2).toString(),
            "invoice": invoice,
            "invoiceDate": retDateObj(Date.now()),
            "bankTXNID": banktxnid,
            "type": type == "addMoney" ? "addMoney" : "addFloat",
            "mobile": final.mobile,
            "mailtype": mailtype
        })
    }, (error, body) => {
        if (error) {
            return console.dir(error);
        }
    })
}
function retDateObj(dateobj) {
    var d = new Date(dateobj);
    var daysIndex = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (daysIndex[d.getDay()] + " " + d.toLocaleString('default', { month: 'short' }) + ' ' +
        d.getDate() + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + " IST " +
        d.getFullYear());

}
function decimalChopper(num, fixed) {
    var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?');
    return num.toString().match(re)[0];
}
