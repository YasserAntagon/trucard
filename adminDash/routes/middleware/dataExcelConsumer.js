const Excel = require('exceljs');
var txnOpt = require('../../model/db/consumerListMD');
/**
 * Convert a dataset to an Excel file
 * @param {Object} req
 * @param {Object} req.body
 * @param {Object} req.body.fileName - Name of file
 * @param {Object} req.body.sheetName - Name of sheet
 * @param {Object[]} req.body.columns - Array of column definitions
 * @param {(String|Number)} [req.body.token] - Optional token to set a cookie when complete
 * @param {Object} res
 * @param {Function} next
 */
async function dataToExcel(req, res, next) {

    if (req.session.etruID) {
        // First we need to get the data from the previous middleware
        var rTruID = req.session.etruID;
        const workbook = new Excel.Workbook();
        await txnOpt.fetchConsumer(rTruID, function (result) {
            const sheetData = result;
            // Create the workbook 
            // Set some metadata
            workbook.creator = '';
            workbook.lastModifiedBy = '';
            workbook.created = new Date();
            workbook.modified = new Date();
            workbook.date1904 = true;
            // (optional) - Freeze the header
            workbook.views = [
                {
                    state: 'frozen',
                    ySplit: 1,
                },
            ];

            // Create the worksheet
            const worksheet = workbook.addWorksheet(req.body.sheetName || 'Sheet 1');

            // Set up the columns
            const columns = JSON.parse(req.body.columns)
                .filter(column =>
                    column.exportable === undefined || column.exportable
                )
                .map(column => ({
                    header: column.title || '',
                    key: column.data || '',
                    formula: column.formula || '',
                    width: 20,
                    style: {
                        numFmt: column.numberFormat || '',
                        font: {
                            name: 'Arial',
                            size: 10,
                        }
                    }
                }));

            worksheet.columns = columns;

            // Add the row data
            worksheet.addRows(
                sheetData.map(row =>
                    columns.reduce((array, column) => {
                        if (column.key === "createDate") {
                            var createDate = row[column.key];
                            var month = Date.parse(createDate);
                            var time = FormatDateToString(month, "time")
                            array.push(time);
                        }
                        else {
                            array.push(row[column.key]);
                        }
                        return array;
                    }, [])
                )
            );

            // Format the header text
            worksheet.getRow(1).font = {
                name: 'Arial Black',
                size: 10,
            };

            // Set headers for download
            const fileName = `${req.body.fileName}.xlsx`;
            res.type('application/octet-stream');
            res.set('Content-Disposition', `attachment;filename="${fileName}"`);

            // Sometimes we need to notify the client when the download is complete.
            // We do that by setting a cookie
            if (req.body.token) {
                res.set({
                    'Access-Control-Allow-Credentials': true,
                    'Set-Cookie': `DownloadComplete=${req.body.token}; Path=/;`,
                });
            }

        });

        // Response
        return workbook.xlsx.writeBuffer()
            .then(buffer => res.send(buffer))
            .then(() => {
                txnOpt.deleteConsumer(rTruID);
            })
            .catch(next);
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
module.exports = dataToExcel;
