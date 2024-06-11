const { Parser } = require("json2csv");
var txnOpt = require('../../model/db/walletLogMD');

async function dataToCSV(req, res, next) {
    if (req.body.csv == "csv") {
        if (req.body.rTruID) {
            // First we need to get the data from the previous middleware
            var rTruID = req.body.rTruID;
            var isFloat = req.body.flag;
            await txnOpt.fetchWalletLog(rTruID, function (result) {
                if (result.length > 0) {
                    const updatedArray = result.map((item, index) => {

                        var month = Date.parse(item.createDate);
                        var time = FormatDateToString(month, "time")
                        var amountval = 0;
                        if (item.Cr && item.Cr != "NaN" && item.Cr != "0") {
                            amountval = decimalChopperFloat(item.Cr, 4);
                        }
                        else if (item.Dr && item.Dr != "NaN" && item.Dr != "0") {
                            amountval = decimalChopperFloat(item.Dr, 2);
                        }
                        return {
                            "Txn_ID": item.invoice,
                            "Ref.ID(Receipt No)": item.againstInvoice ? item.againstInvoice : "-",
                            "Txn_Date": time,
                            "Type": item.title,
                            "Txn_Details": item.desc,
                            "Amount": amountval
                        }
                    });
                    const csvParser = new Parser();
                    const csvData = csvParser.parse(updatedArray);
                    res.setHeader("Content-Type", "text/csv");
                        res.setHeader("Content-Disposition", "attachment; filename=WalletLog.csv");
                    if (req.body.token) {
                        res.set({
                            'Access-Control-Allow-Credentials': true,
                            'Set-Cookie': `DownloadComplete=${req.body.token}; Path=/;`,
                        });
                    }
                    res.status(200).end(csvData);
                    txnOpt.deleteWalletLog(rTruID);
                }
                else {
                    if (req.body.token) {
                        res.set({
                            'Access-Control-Allow-Credentials': true,
                            'Set-Cookie': `DownloadComplete=${req.body.token}; Path=/;`,
                        });
                    }
                    res.status(200).end();
                }
            })
        }
    }
    else { next() }
}
 
function decimalChopperFloat(num, fixed) {
    if (num) {
        try {
            var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?');
            var number = num.toString().match(re)[0]
            return parseFloat(number);
        }
        catch (ex) {
            console.log(ex)
            return 0;
        }
    }
    else {
        return 0;
    }

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
