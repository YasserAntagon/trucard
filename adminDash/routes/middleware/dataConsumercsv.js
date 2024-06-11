const { Parser } = require("json2csv");
var txnOpt = require('../../model/db/consumerListMD');

async function dataToCSV(req, res, next) {
    if (req.body.csv == "csv") {
        if (req.session.aTruID) {
            // First we need to get the data from the previous middleware
            var rTruID = req.body.rTruID?req.body.rTruID:"";
            await txnOpt.fetchConsumer(rTruID, function (result) {
                const updatedArray = result.map((item, index) => {
                    var month = Date.parse(item.createDate);
                    var time = FormatDateToString(month, "time") 
                    return {
                        "Consumer_Name": item.consumerName,
                        "CreateDate": time,
                        "Mobile": item.mobile,
                        "Email": item.email,
                        "WalletBal": item.wallet,                       
                        "KYC_Status": item.KYCFlag,
                        "24K_Gold_Stock_Ingms": item.stock24,
                        "99%_Silver_Stock_Ingms": item.stock99,
                        "Ref.Channel": item.refFlag,
                        "Ref.By": item.referBy,
                    }
                });
                const csvParser = new Parser();
                const csvData = csvParser.parse(updatedArray);
                res.setHeader("Content-Type", "text/csv");
                res.setHeader("Content-Disposition", "attachment; filename=consumerList.csv");
                if (req.body.token) {
                    res.set({
                        'Access-Control-Allow-Credentials': true,
                        'Set-Cookie': `DownloadComplete=${req.body.token}; Path=/;`,
                    });
                }
                res.status(200).end(csvData);
                txnOpt.deleteConsumer(rTruID);
            })
        }
    }
    else { next() }
}

function FormatDateToString(datef, format) {
    let date = new Date(datef);
    var day = date.getDate();
    var month = date.getMonth();

    var year = date.getFullYear();
    var monthNames = [
        "Jan", "Feb", "Mar",
        "Apr", "May", "Jun", "Jul",
        "Aug", "Sep", "Oct",
        "Nov", "Dec"
    ];
    if (format == 'mmm dd, yyyy') {
        return monthNames[month] + ' ' + ((day > 9) ? day : '0' + day) + ', ' + year;
    }
    if (format == 'ddmmyyyy') {
        month++;
        return ((day > 9) ? day : '0' + day) + '-' + ((month > 9) ? month : '0' + month) + '-' + year;
    }
    if (format == 'mmddyyyy') {
        month++;
        return ((month > 9) ? month : '0' + month) + '-' + ((day > 9) ? day : '0' + day) + '-' + year;
    }
    if (format == 'yyyy') {
        return year;
    }
    if (format == 'time') {
        var daysIndex = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        var min = date.getMinutes();
        var sec = date.getSeconds();
        var hours = date.getHours();
        var days = date.getDay();
        return (daysIndex[days] + " " + monthNames[month] + ' ' + ((day > 9) ? day : '0' + day) + " " + ((hours > 9) ? hours : '0' + hours) + ":" + ((min > 9) ? min : '0' + min) + ":" + ((sec > 9) ? sec : '0' + sec) + " IST " + year);
    }
}

module.exports = dataToCSV;

