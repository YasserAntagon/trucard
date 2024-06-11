const Stock = require('../models/custStockModel');
var randomize = require('randomatic');
const txnStocklogs = require('../models/txnStockLogModel');
const { encryption } = require("./encrypt");

function createInvoice() {
  var date = new Date(); // today's date and time in ISO format
  var invno = Date.parse(date);
  // var inv = invno.toString();
  var randomstr = randomize('0', 3);
  var randomstr1 = randomize('0', 3);
  var randomstr2 = randomize('0', 4);
  var inv = (invno + parseInt(randomstr)).toString() + randomstr1 + randomstr2;
  return inv;
}

exports.txn_stocklogs = function (obj) {
  return new Promise(async (resolve, reject) => {
    Stock.aggregate([
      { $match: { truID: obj.truid } },
      {
        $project: {
          _id: 0, truID: 1,
          strockG24K: "$stock.G24K",
          strockS99P: "$stock.S99P"
        }
      }
    ]).exec(function (err, result) {
      if (err) {
        console.log("err", err);
      } else {
        if (!result.length) {
        } else {
          var stkID = "S" + createInvoice();
          var Cr = 0, Dr = 0;
          switch (obj.tType) {
            case "buy":
              Cr = parseFloat(obj.Qty);
              break;
            case "buyCash":
              Cr = parseFloat(obj.Qty);
              break;
            case "redeemCash":
              Dr = parseFloat(obj.Qty) * -1;
              break;
            case "transfer":
              if (obj.isReceived) {
                Cr = parseFloat(obj.Qty);
              } else {
                Dr = parseFloat(obj.Qty) * -1;
              }
              break;          
            case "reversal":
              Cr = parseFloat(obj.Qty);
              break;
            default:
            // code block
          }
          var previousStock = 0, currentStock = 0;
          switch (obj.bullionType) {
            case "G24K":
              previousStock = parseFloat(result[0].strockG24K.toJSON().$numberDecimal);
              currentStock = parseFloat(result[0].strockG24K.toJSON().$numberDecimal) + Cr + Dr;
              break;
            case "S99P":
              previousStock = parseFloat(result[0].strockS99P.toJSON().$numberDecimal);
              currentStock = parseFloat(result[0].strockS99P.toJSON().$numberDecimal) + Cr + Dr;
              break;
            default:
          }
          const txnstock = {};
          txnstock.stockID = stkID;
          txnstock.truID = obj.truid;
          txnstock.createDate = new Date();
          txnstock.rTruID = obj.rTruID;
          txnstock.invoice = obj.invoice;
          txnstock.tType = obj.tType;
          txnstock.bullionType = obj.bullionType;
          txnstock.Cr = Cr;
          txnstock.Dr = Dr;
          txnstock.currentStock = currentStock;
          txnstock.previousStock = previousStock;
          txnstock.status = obj.status;
          txnstock.hash = encryption(JSON.stringify(txnstock));
          var insertTXN = new txnStocklogs(txnstock);
          insertTXN.save(function (err) {
            if (err) {
              resolve()
              // res.json({ status: "500", message: "Internal Server Error" });
            } else {
              resolve()
              // res.json({ status: "200", message: "Stock Log Updated" });
            }
          })
        }
      }
    })
  })
}