const { Parser } = require("json2csv");
var txnOpt = require('../../model/db/txnOptiomizationMD');
var path = require('path');

const Excel = require('exceljs');
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
async function dataToCSV(req, res, next) {
    await txnOpt.fetchAllSummary(function (result) {
        const updatedArray = result.map((item, index) => {
            var type = item.type;
            var keyType = type == "buy" ? "Buy" : type == "buyCash" ? "Buy" : type == "redeemCash" ? "Sell"  : type == "transfer" ? "Transfer" :  type;
            var month = Date.parse(item.createDate);
            var time = FormatDateToString(month, "time")
            return {
                "Receipt_No": item.invoice,
                "Partner_Name": item.companyName,
                "Customer": item.consumerName,
                "Mobile": item.mobile,
                "DateTime": time,
                "Product": item.productType,
                "Transaction_Type": keyType,
                "Amount": item.amount,
                "GST_Charged_from_Customer": item.tax,
                "Amount_Charged_from_Customer_(including_GST)": item.totalAmount,
                "Rate": item.brate,
                "QTY": item.exQty,
                "Gross_Earning": item.grossearning,
                "Amount_Charged_by_Company_from_Client": item.totalAmount,
                "Amount_Transferred_by_Company to_Client": item.earning,
                "Company_Charges": item.revenue,
                "Transaction_Status": item.exStatus
            }
        });
        if (req.body.csv == "excel") {

            const workbook = new Excel.Workbook();
            const sheetData = result;
            // Create the workbook 
            // Set some metadata
            workbook.creator = '';
            workbook.lastModifiedBy = '';
            workbook.created = new Date();
            workbook.modified = new Date();
            workbook.lastPrinted = new Date();
            workbook.date1904 = true;
            // (optional) - Freeze the header
            workbook.views = [
                {
                    state: 'frozen',
                    ySplit: 1,
                },
            ];

            const worksheet = workbook.addWorksheet(req.body.sheetName || 'Sheet 1');
            // Set up the columns
            let keys = Object.keys(updatedArray[0]);
            const columns = keys.map(column => ({
                header: column || '',
                key: column || '',
                width: 20,
                style: {
                    font: {
                        name: 'Arial',
                        size: 10,
                    }
                }
            }));
            // Insert an empty row at beginning
            worksheet.spliceRows(4, 0, [])
            var imageID = workbook.addImage({
                filename: path.resolve(__dirname, "../../assetstoreProf/logo.png"),
                extension: 'png'
            });
            worksheet.addImage(imageID,{
                ext: { width: 220, height: 45 }
            });
            worksheet.mergeCells('A1:B4')
            worksheet.getCell('C1').value = 'Company Name';

            //  worksheet.columns = columns;
            // Optional merge and styles
            worksheet.mergeCells('C1:Q1')
            //worksheet.getCell('A1').alignment = { horizontal: 'center' }
            worksheet.getCell('C1').font = { color: { argb: "#000000" }, size: 18 };
            // Set title
            worksheet.getCell('C2').value = 'GST Report';
            // Optional merge and styles
            worksheet.mergeCells('C2:Q2');
            // worksheet.getCell('C2').alignment = { horizontal: 'center' };
            worksheet.getCell('C2').font = { color: { argb: "#004e47cc" }, size: 16 };

            worksheet.mergeCells('C3:D3');
            worksheet.getCell('C3').value = 'GSTIN';
            worksheet.getCell('C3:D3').font = { color: { argb: "#004e47cc" }, size: 12 };

            worksheet.mergeCells('E3:Q3');
            worksheet.getCell('E3').value = '07AAFCT6383H2ZZ';
            worksheet.getCell('E3:Q3').font = { color: { argb: "#004e47cc" }, size: 12 };

            worksheet.getCell('C1:Q1').fill = {
                type: 'pattern',
                pattern: 'darkVertical',
                fgColor: {
                    argb: 'FFFF0000'
                }
            } 
            worksheet.getCell('C2:Q2').fill = {
                type: 'pattern',
                pattern: 'darkVertical',
                fgColor: {
                    argb: 'FFFF0000'
                }
            } 
            worksheet.getCell('C3:Q3').fill = {
                type: 'pattern',
                pattern: 'darkVertical',
                fgColor: {
                    argb: 'FFFF0000'
                }
            } 
            worksheet.getCell('E3:Q3').fill = {
                type: 'pattern',
                pattern: 'darkVertical',
                fgColor: {
                    argb: 'FFFF0000'
                }
            } 
          

            if (req.body.startdate) {
                worksheet.mergeCells('C4:D4');
                worksheet.getCell('C4').value = 'Report By';
                worksheet.getCell('C4:D4').font = { color: { argb: "#004e47cc" }, size: 12 };

                var month = Date.parse(req.body.startdate);
                var startdate = FormatDateToString(month, "timefo")

                var endmonth = Date.parse(req.body.enddate);
                var enddate = FormatDateToString(endmonth, "timefo")

                worksheet.mergeCells('E4:Q4');
                worksheet.getCell('E4').value = startdate + " To " + enddate;
                worksheet.getCell('E4:Q4').font = { color: { argb: "#004e47cc" }, size: 12 };
                worksheet.mergeCells('A5:Q5');
                worksheet.getCell('A5:Q5').font = { color: { argb: "#004e47cc" }, size: 12 };
                worksheet.getCell('A6:Q6').border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
                worksheet.getRow(6).values = keys;
                worksheet.getRow(6).font = {
                    name: 'Arial Black',
                    size: 10,
                };
                worksheet.getRow(6).eachCell({ includeEmpty: true }, function (cell) {
                    worksheet.getCell(cell.address).fill = {
                        type: 'pattern',
                        pattern: 'gray125',
                    }
                })
                worksheet.getCell('E4:Q4').fill = {
                    type: 'pattern',
                    pattern: 'darkVertical',
                    fgColor: {
                        argb: 'FFFF0000'
                    }
                } 
                worksheet.getCell('C4:Q4').fill = {
                    type: 'pattern',
                    pattern: 'darkVertical',
                    fgColor: {
                        argb: 'FFFF0000'
                    }
                } 
            }
            else {
                //  worksheet.mergeCells('A4:Q4');
                //  worksheet.getCell('A4:Q4').font = { color: { argb: "#004e47cc" }, size: 12 };
                worksheet.getCell('A5:Q5').border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };

                worksheet.getRow(5).values = keys;
                worksheet.getRow(5).font = {
                    name: 'Arial Black',
                    size: 10,
                };
                worksheet.getRow(5).eachCell({ includeEmpty: true }, function (cell) {
                    worksheet.getCell(cell.address).fill = {
                        type: 'pattern',
                        pattern: 'gray125',
                    }
                })
            }

            // Add the row data
            worksheet.addRows(
                updatedArray.map(row =>
                    columns.reduce((array, column) => {
                        if (column.key === "type") {
                            var type = row[column.key]
                            var keyType = type == "buy" ? "Buy" : type == "buyCash" ? "Buy" : type == "redeemCash" ? "Sell"  : type == "transfer" ? "Transfer" :  type;
                            array.push(keyType);
                        }
                        else if (column.key === "createDate") {
                            var createDate = row[column.key]
                            //var date = new Date(Date.parse(data.createDate));
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
            //we iterate through all the columns of the worksheet (i.e. name, surname, etc. whatever your worksheet might contain)
            worksheet.columns.forEach((column) => {
                column.width = 18;
            });
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
            return workbook.xlsx.writeBuffer()
                .then(buffer => res.send(buffer))
                .then(() => {
                    txnOpt.deleteTxnSummary();
                })
                .catch(next);
        }
        else {
            const csvParser = new Parser();
            const csvData = csvParser.parse(updatedArray);

            res.setHeader("Content-Type", "text/csv");
            res.setHeader("Content-Disposition", "attachment; filename=txnSummary.csv");
            if (req.body.token) {
                res.set({
                    'Access-Control-Allow-Credentials': true,
                    'Set-Cookie': `DownloadComplete=${req.body.token}; Path=/;`,
                });
            }
            res.status(200).end(csvData);
            txnOpt.deleteTxnSummary();
        }
    })
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
    if (format == 'timefo') {
        var min = date.getMinutes();
        var sec = date.getSeconds();
        var hours = date.getHours();
        var days = date.getDay();
        return ((day > 9) ? day : '0' + day) + ' ' + monthNames[month] + ' ' + year;
    }
}
module.exports = dataToCSV;
