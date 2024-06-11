
'use strict'

const randomize = require('randomatic'),
    request = require('request'),
    fs = require('fs'),
    path = require('path'),
    KycAll = require('../models/custKYCAllModel'),
    WalletLog = require('../models/custWalletLogModel'), 
    bankAccLog = require('../models/custModel'),
    bankLogs = require('../models/custLogsModel'),
    { update_assetmanager_stock } = require('./calculation.controller'), 
    TXN = require('../models/custTXNModel'),
    { encryption } = require('./encrypt'),
    MAIL = require("./email.controller"),
    { initiateEntityRevenueRefund } = require('./partnerRevenue'),
    notification_controller = require("./notification.controlller"),
    defaultConf = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../regionConf.json')));
const conf = require('../conf');
const cryptos = require('crypto');
exports.ins_Virtual_Account_log = function (req, res) {
    var truid = req.body.truid;
    KycAll.find({
        "truID": truid, KYCFlag: "active"
    }, function (err, docs) {
        if (!docs.length) {
            res.json({ status: "204", message: "The request was successful but no body was returned." });
        } else {
            var date = new Date();
            var VA_Acc_details = new bankAccLog();
            VA_Acc_details["truID"] = truid
            VA_Acc_details["createDate"] = date
            VA_Acc_details["TranID"] = req.body.transid
            VA_Acc_details["Full_VA_Number"] = req.body.fvanumber
            VA_Acc_details["Account_Number"] = req.body.accnumber
            VA_Acc_details["VA_Number"] = req.body.vanumber
            VA_Acc_details["Short_Name"] = req.body.shortname
            VA_Acc_details["CIF"] = req.body.cif
            VA_Acc_details["VA_BENEFICIARY"] = req.body.vabeneficiary
            VA_Acc_details["Status_Reason"] = req.body.statusreason

            bankAccLog.find({ truID: truid }, function (err, docs) {
                if (!docs.length) {
                    VA_Acc_details.save(function (err) {
                        if (err) {
                            res.json({ status: "204", message: 'Something went wrong!' });

                        } else {
                            res.json({ status: "200", message: 'BANKPAYOUT Virtual Account created for consumer..!!', Account_Number: req.body.fvanumber });
                            KycAll.findOneAndUpdate({ truID: truid }, { $set: { isVACreated: true } }).exec();
                        }
                    })
                }
                else {
                    res.json({ status: "201", message: 'Account already exist..!!' });
                }
            })
        }
    }
    )
}

exports.find_consumer_bankacc = function (req, res) {
    var truid = req.body.truid;
    KycAll.find({
        "truID": truid, KYCFlag: "active"
    }, function (err, docs) {
        if (!docs.length) {
            res.json({ status: "204", message: "The request was successful but no body was returned." });
        } else {
            bankAccLog.find({ truID: truid }, function (err, docs) {
                if (!docs.length) {
                    res.json({ status: "204", message: 'Something went wrong!' });

                } else {
                    var final = {
                        Full_VA_Number: docs[0].Full_VA_Number,
                        Account_Number: docs[0].Account_Number,
                        VA_BENEFICIARY: docs[0].VA_BENEFICIARY
                    }
                    res.json({
                        status: "200", resource: final
                    });
                }
            })
        }
    }
    )
}

exports.ins_bank_trans_log = function (req, res) {
    var truid = req.body.truid;
    KycAll.find({
        "truID": truid, KYCFlag: "active"
    }, function (err, docs) {
        if (!docs.length) {
            res.json({ status: "204", message: "The request was successful but no body was returned." });
        } else {
            var date = new Date();
            var ins_banklog = new bankLogs();
            ins_banklog["truID"] = truid
            ins_banklog["invoice"] = req.body.invoice
            ins_banklog["TranID"] = req.body.tranid
            ins_banklog["Corp_ID"] = req.body.corp_ic
            ins_banklog["Maker_ID"] = req.body.maker_id
            ins_banklog["Checker_ID"] = req.body.checker_id
            ins_banklog["Approver_ID"] = req.body.approver_id
            ins_banklog["Status"] = req.body.status
            ins_banklog["Error_Cde"] = req.body.error_cde
            ins_banklog["Error_Desc"] = req.body.error_desc
            ins_banklog["RefNo"] = req.body.refno
            ins_banklog["Ben_Acct_No"] = req.body.ben_acct_no
            ins_banklog["Amount"] = req.body.amount
            ins_banklog["BenIFSC"] = req.body.benifsc
            ins_banklog["Txn_Time"] = req.body.txn_time
            ins_banklog["tType"] = req.body.tType

            bankLogs.find({ $and: [{ invoice: req.body.invoice }, { TranID: req.body.tranid }] }, function (err, docs) {
                if (!docs.length) {
                    ins_banklog.save(function (err) {
                        if (err) {
                            res.json({ status: "204", message: 'Something went wrong!' });

                        } else {
                            res.json({ status: "200", message: 'BANKPAYOUT Transaction Log generated successfully..!!' });
                        }
                    })
                }
                else {
                    res.json({ status: "201", message: 'Transaction log already exist..!!' });
                }
            })
        }
    }
    )
}

module.exports.bank_single_payment_api = function (transID, amount, truid, BenPartTrnRmks, mop, invoice, ttype, accountdetails, mobile, crnno, payout, callback) {
    try {
        calculateCharges(mop, amount, function (charges) {
            // var charges = (amount * Gen.serviceTax);
            var amt = amount - charges;
            var modeofpay = mop
            if (accountdetails.bank_name.toLowerCase() === "bank bank" || accountdetails.IFSC.substring(0, 4) === "RATN") {
                modeofpay = "FT";
                amt = amount;
                charges = 0;

            }
            let inputString = '';
            inputString += "tranID";
            inputString += '=';
            inputString += transID;
            inputString += '~';
            inputString += "Ben_IFSC";
            inputString += '=';
            inputString += accountdetails.IFSC;
            inputString += '~';
            inputString += "Ben_Acct_No";
            inputString += '=';
            inputString += accountdetails.accountNo;
            inputString += '~';
            inputString += "amount";
            inputString += '=';
            inputString += decimalChopper(amt, 2);
            inputString += '~';
            inputString += "Mode_of_Pay";
            inputString += '=';
            inputString += modeofpay;
            var sha512str = sha512(inputString, "~*Rocking6565Star*~");

            var myWords = accountdetails.name.split(" ");
            var name;
            if (myWords.length > 1) {
                var finalName = myWords[myWords.length - 1][0];
                name = myWords[0] + finalName;
            } else {
                name = myWords[0];
            }
            var trans_Remark = "SELL" + modeofpay.substring(0, 2) + name;

            var bankreqjson = JSON.stringify({
                "tranID": transID,
                "truID": truid,
                "Ben_IFSC": accountdetails.IFSC,
                "Ben_Acct_No": accountdetails.accountNo,
                "Ben_Name": accountdetails.name,
                "Ben_BankName": accountdetails.bank_name,
                "Ben_PartTrnRmks": BenPartTrnRmks,
                "Mode_of_Pay": modeofpay,
                "trans_Remark": trans_Remark,
                // "Ben_Address": accountdetails.city,
                "Ben_mobile": mobile,
                "Ben_TrnParticulars": "RedeemCash",
                "amount": decimalChopper(amt, 2),
                // "amount": "1.12",
                "signature": sha512str

            })

            var ins_banklogpending = new bankLogs();
            var date = new Date();
            ins_banklogpending["truID"] = truid;
            ins_banklogpending["createDate"] = date;
            ins_banklogpending["CRNNo"] = crnno;
            ins_banklogpending["invoice"] = invoice;
            ins_banklogpending["TranID"] = transID;
            ins_banklogpending["Status"] = "pending";
            ins_banklogpending["tType"] = ttype;
            ins_banklogpending["Amount"] = decimalChopper(amt, 2);
            ins_banklogpending["charges"] = decimalChopper(charges, 2);
            ins_banklogpending["Mode_of_Pay"] = modeofpay;
            ins_banklogpending["Ben_Acct_No"] = accountdetails.accountNo;
            ins_banklogpending["BenIFSC"] = accountdetails.IFSC;
            bankLogs.find({ $and: [{ TranID: transID }] }, function (err, docs) {
                if (!docs.length) {
                    ins_banklogpending.save(function (err) {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            bankCall();
                        }
                    })
                }
                else {
                    bankCall()
                }
            })
            function bankCall() {
                request.post({
                    "headers": { "content-type": "application/json", "authorization": "Bearer " + conf.bankbearer },
                    "url": conf.bankurl + "/v1/singlePayment",
                    // "agentOptions": { ca: fs.readFileSync(path.resolve(__dirname, "../cert/trubanker-in-chain.pem")) },
                    "body": bankreqjson
                }, (error, response, body) => {
                    if (error) {
                        updateredeemtxndetails(invoice, crnno, truid)
                    }
                    else {
                        if (response.statusCode == 200) {
                            var newjson = JSON.parse(body);
                            var date = new Date();
                            var ins_banklog = {};
                            if (newjson.status == 200) {
                                var bankresp = newjson.resource.Single_Payment_Corp_Resp;
                                if (bankresp.Header.Status == "Success" || bankresp.Header.Status == "Initiated" || bankresp.Header.Status == "ON HOLD") {
                                    bankLogs.find({ $and: [{ TranID: bankresp.Header.TranID }] }, function (err, docs) {
                                        if (docs.length) {
                                            ins_banklog = responsefrombank(bankresp);
                                            ins_banklog["createDate"] = date;
                                            bankLogs.findOneAndUpdate({ TranID: bankresp.Header.TranID }, { $set: ins_banklog }, function (err) {
                                            })
                                            TXN.findOneAndUpdate({ "invoice": docs[0].invoice, "status": "inprocess", MOP: "others" }, { $set: { status: "success" } }, { new: true }).exec(function (err, resource) {
                                                if (err) { } else {
                                                    if (!resource.length) {
                                                        if (resource.rTruID) {
                                                            initiateEntityRevenueRefund(resource.rTruID, invoice)
                                                        }
                                                    }
                                                }

                                            });
                                            TXN.find({ "invoice": docs[0].invoice }).exec(function (err, particulars) {
                                                if (err) {
                                                    console.log(err)
                                                } else {
                                                    if (!particulars.length) {
                                                    }
                                                    else {
                                                        var resource = particulars[0];
                                                        var invoice = resource.invoice;
                                                        var to = resource.to;
                                                        var rtruid = resource.rTruID;
                                                        var tav = resource.totalAmount.toJSON().$numberDecimal;
                                                        if (Array.isArray(resource.particularsG24) == true) {
                                                            for (var i = 0; i < resource.particularsG24.length; i++) {
                                                                var amtruid = resource.particularsG24[i].from;
                                                                var bulliontype = "G24K";
                                                                var qty = parseFloat(resource.particularsG24[i].qty.toJSON().$numberDecimal)
                                                                if (qty > 0) {
                                                                    update_assetmanager_stock(amtruid, to, bulliontype, qty, "redeemCash", docs[0].invoice);
                                                                }
                                                            }
                                                        }
                                                        else {
                                                            var amtruid = resource.particularsG24.from;
                                                            var bulliontype = "G24K";
                                                            var qty = parseFloat(resource.particularsG24.qty.toJSON().$numberDecimal)
                                                            if (qty > 0) {
                                                                update_assetmanager_stock(amtruid, to, bulliontype, qty, "redeemCash", docs[0].invoice);
                                                            }
                                                        }
                                                        if (Array.isArray(resource.particularsS99) == true) {
                                                            for (var i = 0; i < resource.particularsS99.length; i++) {
                                                                var amtruid = resource.particularsS99[i].from;
                                                                var bulliontype = "S99P";
                                                                var qty = parseFloat(resource.particularsS99[i].qty.toJSON().$numberDecimal)
                                                                if (qty > 0) {
                                                                    update_assetmanager_stock(amtruid, to, bulliontype, qty, "redeemCash", docs[0].invoice);
                                                                }
                                                            }
                                                        }
                                                        else {
                                                            var amtruid = resource.particularsS99.from;
                                                            var bulliontype = "S99P";
                                                            var qty = parseFloat(resource.particularsS99.qty.toJSON().$numberDecimal)
                                                            if (qty > 0) {
                                                                update_assetmanager_stock(amtruid, to, bulliontype, qty, "redeemCash", docs[0].invoice);
                                                            }
                                                        }

                                                        MAIL.consumer_emailtxnNew(to, invoice, bankresp.Body.UTRNo);

                                                    }
                                                }
                                            })
                                            notification(docs[0].truID, bankresp.Body.Amount, docs[0].invoice, "success", docs[0].CRNNo)
                                        } else {
                                            console.error("err", docs)
                                        }
                                    });
                                }
                                else {
                                    bankLogs.find({ $and: [{ TranID: bankresp.Header.TranID }] }, function (err, docs) {
                                        if (!docs.length) {
                                        }
                                        else {
                                            ins_banklog["createDate"] = date;
                                            bankresp.Header.Corp_ID ? ins_banklog["Corp_ID"] = bankresp.Header.Corp_ID : bankresp.Header.Corp_ID;
                                            bankresp.Header.Maker_ID ? ins_banklog["Maker_ID"] = bankresp.Header.Maker_ID : bankresp.Header.Maker_ID;
                                            bankresp.Header.Checker_ID ? ins_banklog["Checker_ID"] = bankresp.Header.Checker_ID : bankresp.Header.Checker_ID;
                                            bankresp.Header.Approver_ID ? ins_banklog["Approver_ID"] = bankresp.Header.Approver_ID : bankresp.Header.Approver_ID;
                                            bankresp.Header.Status ? ins_banklog["Status"] = bankresp.Header.Status : bankresp.Header.Status;
                                            bankresp.Header.Resp_cde ? ins_banklog["Resp_cde"] = bankresp.Header.Resp_cde : bankresp.Header.Resp_cde;
                                            bankresp.Header.Error_Cde ? ins_banklog["Error_Cde"] = bankresp.Header.Error_Cde ? Object.keys(bankresp.Header.Error_Cde).length === 0 ? "" : bankresp.Header.Error_Cde : "" : bankresp.Header.Error_Cde;
                                            bankresp.Header.Error_Desc ? ins_banklog["Error_Desc"] = bankresp.Header.Error_Desc ? Object.keys(bankresp.Header.Error_Desc).length === 0 ? "" : bankresp.Header.Error_Desc : "" : bankresp.Header.Error_Desc;
                                            bankLogs.findOneAndUpdate({ TranID: bankresp.Header.TranID }, { $set: ins_banklog }, function (err) {
                                            })
                                            updateredeemtxndetails(docs[0].invoice, docs[0].CRNNo, docs[0].truID)
                                        }
                                    })
                                }
                            }
                            else {
                                bankLogs.find({ $and: [{ TranID: transID }] }, function (err, docs) {
                                    if (!docs.length) {
                                        console.log("not Found");
                                    }
                                    else {
                                        updateredeemtxndetails(invoice, crnno, truid)
                                    }
                                })


                            }
                        }
                        else {
                            updateredeemtxndetails(invoice, crnno, truid)
                        }
                    }

                });
            }
        });


    }
    catch (ex) {
        updateredeemtxndetails(invoice, crnno, truid)
    }
    // function update_assetmanager_stock(truid, bulliontype, qty) {
    //     request.post({
    //         "headers": {
    //             "content-type": "application/json"
    //         },
    //         "url": conf.reqip + ":/api/updatestockqtybuy",
    //         "body": JSON.stringify({
    //             "truid": truid,
    //             "qty": qty,
    //             "bulliontype": bulliontype
    //         })
    //     }, (error, response, body) => {
    //         if (error) {
    //             return console.dir(error);
    //         }
    //     }
    //     )
    // }

    /* function initiateEntityRevenueRefund(rtruid, invoice) {
        TXN.aggregate([
            { $match: { rTruID: rtruid, invoice: invoice, status: "success" } },
            {
                $project: {
                    _id: 0, invoice: 1, rTruID: 1, invoice: 1, remmitCharges: 1, sourceFlag: 1, status: 1, totalAmount: 1,
                    partnerCharges: {
                        $toString: { $sum: ["$particularsG24.partnerCharges",  "$particularsS99.partnerCharges"] }

                    },
                    nodeCharges: {
                        $toString: { $sum: ["$particularsG24.nodeCharges",  "$particularsS99.nodeCharges"] }

                    },
                }
            }
        ]).exec(function (err, txnresult) {
            if (err) {
                console.log("Entity Revenue refund error", err)
            }
            if (!txnresult.length) {
                console.log("Entity Revenue refund Transaction not found", err)
            } else {
                var revenueJson = {
                    "rtruid": txnresult[0].rTruID,
                    "invoice": txnresult[0].invoice,
                    "partnercharges": txnresult[0].partnerCharges,
                    "nodecharges": txnresult[0].nodeCharges
                }
                request.post({
                    "headers": { "content-type": "application/json" },
                    "url": conf.reqip + ":4121/api/entityrevenuerefund",
                    "body": JSON.stringify(revenueJson)
                }, (error, response, body) => {
                })
            }
        })
    } */

    function updateredeemtxndetails(invoice, crnno, truid) {
        try {
            request.post({
                "headers": {
                    "content-type": "application/json"
                },
                "url": conf.reqip + ":4114/api/redeemStockReverse",
                "body": JSON.stringify({
                    "invoice": invoice,
                    "truid": truid
                })
            }, (error, response, body) => {
                if (error) {
                    return console.dir(error);
                }
                else {
                    notification(truid, amount, invoice, "failed", crnno);
                }
            }
            )
        }
        catch (ex) {

        }

    }

    function notification(truid, amount, invoiceNo, status, crnno) {
        try {
            var msg, title;
            if (status == "success") {
                msg = "Sell Transaction of Receipt " + invoiceNo + " Successful. Amount of " + defaultConf.defaultCurrency + " " + decimalChopper(amount, 2) + " to be credited in your Bank Account."
                title = "Sell Successful"
            }
            else {
                title = "Sell Failed"
                msg = "Sell Transaction of Receipt " + invoiceNo + " Failed. Your Stock has been reversed in your Account."
            }
            request.post({
                "headers": { "content-type": "application/json" },
                "url": conf.reqip + ":4116/api/insnotification",
                "body": JSON.stringify({
                    "notifyto": truid,
                    "isflag": "consumer",
                    "crnNo": crnno,
                    "triggeredbytruid": truid,
                    "notification": msg,
                    "type": "customerTransaction",
                    "subtype": "redeemCash",
                    "title": title,
                    "referenceid": invoice
                })
            }, (error, response, body) => {

                if (error) {
                    return console.dir(error);
                }
                var newjson = JSON.parse(body);
            }
            )

        }
        catch (ex) {

        }
    }
}




module.exports.bank_single_payment_api_wtobank = function (amount, truid, BenPartTrnRmks, mop, invoice, ttype, accountdetails, mobile, crnno, callback) {
    try {
        calculateCharges(mop, amount, async function (charges) {
            var transID = uniqueNumber().toString();
            var amt = amount - charges;
            var modeofpay = mop
            if (accountdetails.bank_name.toLowerCase() === "bank bank" || accountdetails.IFSC.substring(0, 4) === "RATN") {
                modeofpay = "FT"
            }
            let inputString = '';
            inputString += "tranID";
            inputString += '=';
            inputString += transID;
            inputString += '~';
            inputString += "Ben_IFSC";
            inputString += '=';
            inputString += accountdetails.IFSC;
            inputString += '~';
            inputString += "Ben_Acct_No";
            inputString += '=';
            inputString += accountdetails.accountNo;
            inputString += '~';
            inputString += "amount";
            inputString += '=';
            inputString += decimalChopper(amt, 2);
            inputString += '~';
            inputString += "Mode_of_Pay";
            inputString += '=';
            inputString += modeofpay;
            var sha512str = sha512(inputString, "~*Rocking6565Star*~");

            var myWords = accountdetails.name.split(" ");
            var name;
            if (myWords.length > 1) {
                var finalName = myWords[myWords.length - 1][0];
                name = myWords[0] + finalName;
            } else {
                name = myWords[0];
            }
            var trans_Remark = "WB" + modeofpay.substring(0, 2) + name;

            var bankreqjson = JSON.stringify({
                "tranID": transID,
                "truID": truid,
                "Ben_IFSC": accountdetails.IFSC,
                "Ben_Acct_No": accountdetails.accountNo,
                "Ben_Name": accountdetails.name,
                "Ben_BankName": accountdetails.bank_name,
                "Ben_PartTrnRmks": BenPartTrnRmks,
                "Mode_of_Pay": modeofpay,
                "trans_Remark": trans_Remark,
                "Ben_mobile": mobile,
                "Ben_TrnParticulars": "wallet to bank transfer",
                "amount": decimalChopper(amt, 2),
                "signature": sha512str
            })

            var ins_banklogpending = new bankLogs();
            var date = new Date();
            ins_banklogpending["truID"] = truid;
            ins_banklogpending["createDate"] = date;
            ins_banklogpending["CRNNo"] = crnno;
            ins_banklogpending["invoice"] = invoice;
            ins_banklogpending["TranID"] = transID;
            ins_banklogpending["Status"] = "pending";
            ins_banklogpending["tType"] = ttype;
            ins_banklogpending["Amount"] = decimalChopper(amt, 2);
            ins_banklogpending["charges"] = decimalChopper(charges, 2);
            ins_banklogpending["Mode_of_Pay"] = modeofpay;
            ins_banklogpending["Ben_Acct_No"] = accountdetails.accountNo;
            ins_banklogpending["BenIFSC"] = accountdetails.IFSC;
            var docs = await bankLogs.find({ TranID: transID })
            if (!docs.length) {
                await ins_banklogpending.save()
            }

            request.post({
                "headers": { "content-type": "application/json", "authorization": "Bearer " + conf.bankbearer },
                "url": conf.bankurl + "/v1/singlePayment",
                "body": bankreqjson
            }, (error, response, body) => {
                if (error) {
                    updatewalletBalance(invoice, crnno, truid);
                    return console.dir(error);
                }
                else {
                    if (response.statusCode == 200) {
                        var newjson = JSON.parse(body);
                        var date = new Date();
                        var ins_banklog = {};
                        if (newjson.status == 200) {
                            var bankresp = newjson.resource.Single_Payment_Corp_Resp;
                            if (bankresp.Header.Status == "Success" || bankresp.Header.Status == "Initiated" || bankresp.Header.Status == "ON HOLD") {
                                bankLogs.find({ $and: [{ TranID: bankresp.Header.TranID }] }, function (err, docs) {
                                    if (!docs.length) {
                                        console.log("not Found");
                                    }
                                    else {
                                        ins_banklog = responsefrombank(bankresp);
                                        ins_banklog["createDate"] = date;

                                        bankLogs.findOneAndUpdate({ TranID: bankresp.Header.TranID }, { $set: ins_banklog }, function (err) {
                                        })
                                        WalletLog.findOneAndUpdate({ "invoice": docs[0].invoice, "status": "inprocess", tType: "walletToBank" }, { $set: { status: "success", createDate: Date.now() } }).exec();
                                        KycAll.aggregate([
                                            { $match: { __t: "KycAll", truID: docs[0].truID } },
                                            { $project: { name: { $concat: ["$fName", " ", "$lName"] }, _id: 0, truID: 1, mobile: 1, email: 1, emailVerified: 1, CRNNo: 1 } },
                                            {
                                                $lookup: {
                                                    from: "wallets",
                                                    localField: "truID",
                                                    foreignField: "truID",
                                                    as: "wallet"
                                                }
                                            },
                                            { $unwind: "$wallet" },
                                            {
                                                $project: {
                                                    name: 1, truID: 1, mobile: 1, email: 1, emailVerified: 1, CRNNo: 1,
                                                    balance: { $toString: "$wallet.clBal" }
                                                }
                                            }
                                        ]).exec(function (err, result) {
                                            var frommailtype = result[0].emailVerified == true ? "both" : "sms";
                                            notification(result[0].truID, amt, invoice, "success", result[0].CRNNo, bankresp.Body.Ben_Acct_No, bankresp.Body.Txn_Time, result[0].balance)
                                            var inputsendwemail = {
                                                "mailTo": result[0].email,
                                                "name": result[0].name,
                                                "amount": amount,
                                                "paymentCharge": decimalChopper(charges, 2),
                                                "creditedAmount": decimalChopper(amt, 2),
                                                "balance": decimalChopper(result[0].balance, 2),
                                                "invoice": invoice,
                                                "invoiceDate": bankresp.Body.Txn_Time,
                                                "bankTXNID": bankresp.Body.UTRNo,
                                                "mobile": result[0].mobile,
                                                "mailtype": frommailtype
                                            }
                                            MAIL.withdranMailEmail(inputsendwemail);
                                        })

                                    }
                                })
                            }
                            else {
                                bankLogs.find({ $and: [{ TranID: bankresp.Header.TranID }] }, function (err, docs) {
                                    if (!docs.length) {
                                        console.log("not Found");
                                    }
                                    else {
                                        ins_banklog["createDate"] = date;
                                        ins_banklog["Corp_ID"] = bankresp.Header.Corp_ID;
                                        ins_banklog["Maker_ID"] = bankresp.Header.Maker_ID;
                                        ins_banklog["Checker_ID"] = bankresp.Header.Checker_ID;
                                        ins_banklog["Approver_ID"] = bankresp.Header.Approver_ID;
                                        ins_banklog["Status"] = bankresp.Header.Status;
                                        ins_banklog["Resp_cde"] = bankresp.Header.Resp_cde;
                                        ins_banklog["Error_Cde"] = bankresp.Header.Error_Cde ? Object.keys(bankresp.Header.Error_Cde).length === 0 ? "" : bankresp.Header.Error_Cde : "";
                                        ins_banklog["Error_Desc"] = bankresp.Header.Error_Desc ? Object.keys(bankresp.Header.Error_Desc).length === 0 ? "" : bankresp.Header.Error_Desc : "";
                                        ins_banklog["tType"] = ttype;
                                        bankLogs.findOneAndUpdate({ TranID: bankresp.Header.TranID }, { $set: ins_banklog }, function (err) {
                                        })
                                        updatewalletBalance(docs[0].invoice, docs[0].CRNNo, docs[0].truID)
                                    }
                                })


                            }
                        }
                        else {
                            bankLogs.find({ $and: [{ TranID: transID }] }, function (err, docs) {
                                if (!docs.length) {
                                    console.log("not Found");
                                }
                                else {
                                    updatewalletBalance(docs[0].invoice, docs[0].CRNNo, docs[0].truID)
                                }
                            })
                        }
                    }
                    else {
                        updatewalletBalance(invoice, crnno, truid)
                    }
                }

            });
        });
    }
    catch (ex) {
        updatewalletBalance(invoice, crnno, truid)
    }

    function updatewalletBalance(invoice, crnno, truid) {
        try {
            request.post({
                "headers": {
                    "content-type": "application/json"
                },
                "url": conf.reqip + ":4114/api/reverseWalletBal",
                "body": JSON.stringify({
                    "invoice": invoice,
                    "truid": truid
                })
            }, (error, response, body) => {
                if (error) {
                    return console.dir(error);
                }
                else {
                    notification(truid, amount, invoice, "failed", crnno);
                }
            }
            )
        }
        catch (ex) {

        }

    }

    function notification(truid, amount, invoiceNo, status, crnno, accno, txnTime, walBal) {
        try {
            var msg, title;
            if (status == "success") {
                msg = defaultConf.defaultCurrency + " " + decimalChopper(amount, 2) + " successfully transferred to " + replaceWithX(accno) + " from truWallet to your bank account on " + retDateObj(txnTime) + ". Updated Wallet Bal. " + defaultConf.defaultCurrency + " " + decimalChopper(walBal, 2);
                title = "Amount Sent to Bank"
            }
            else {
                title = "Amount Sent to Bank Failed"
                // msg = "Dear Customer, Bank Transfer of " + defaultConf.defaultCurrency + " " + amount + " from your wallet has been reversed on " + retDateObj(new Date);
                msg = "Wallet to Bank Receipt " + invoiceNo + " Failed. Your Amount has been reversed in your wallet account."
            }
            request.post({
                "headers": { "content-type": "application/json" },
                "url": conf.reqip + ":4116/api/insnotification",
                "body": JSON.stringify({
                    "notifyto": truid,
                    "isflag": "consumer",
                    "crnNo": crnno,
                    "triggeredbytruid": truid,
                    "notification": msg,
                    "type": "walletTransaction",
                    "subtype": "walletToBank",
                    "title": title,
                    "referenceid": invoice
                })
            }, (error, response, body) => {

                if (error) {
                    return console.dir(error);
                }
                var newjson = JSON.parse(body);
            }
            )
        }
        catch (ex) {

        }
    }


}

function uniqueNumber() {
    var date = Date.now();

    if (date <= uniqueNumber.previous) {
        date = ++uniqueNumber.previous;
    } else {
        uniqueNumber.previous = date;
    }
    return date;
}
function decimalChopper(num, fixed) {
    var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?');
    return num.toString().match(re)[0];
}



function retDateObj(dateobj) {
    var d = new Date(dateobj);

    var daysIndex = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (daysIndex[d.getDay()] + " " + d.toLocaleString('default', { month: 'short' }) + ' ' +
        d.getDate() + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + " IST " + d.getFullYear());

}
function replaceWithX(str) {
    return str.replace(/.(?=.{4})/g, 'x');
}
function sha512(salt, password) {
    var hash = cryptos.createHmac('sha512', salt); /** Hashing algorithm sha512 */
    hash.update(password);
    var value = hash.digest('hex');
    return value
};
function calculateCharges(type, amount, callback) {
    // let Gen = JSON.parse(fs.readFileSync(path.resolve(__dirname, genFileName))); 

    request.post({
        "headers": { "content-type": "application/json" },
        "url": conf.reqip + ":4125/api/getbankslabbyamt",
        "body": JSON.stringify({
            "amount": amount,
            "appliedOn": "consumer",
            "pgtype": "BANKPAYOUT"
        })
    }, (error, response, body) => {
        if (error) {
            callback(0);
        }
        else {
            if (response.statusCode == 200) {
                var resp = JSON.parse(body);
                let Gen = resp.charges;
                if (type == "IMPS") {
                    if (amount < Gen.slabAmt) {
                        callback(Gen.IMPScharges + parseFloat((Gen.IMPScharges * Gen.serviceTax).toFixed(2)));
                    } else {
                        callback(Gen.IMPScharges1 + parseFloat((Gen.IMPScharges1 * Gen.serviceTax).toFixed(2)));
                    }
                } else if (type == "NEFT") {
                    callback(Gen.NEFTcharges + parseFloat((Gen.NEFTcharges * Gen.serviceTax).toFixed(2)));
                } else if (type == "RTGS") {
                    callback(Gen.RTGScharges + parseFloat((Gen.RTGScharges * Gen.serviceTax).toFixed(2)))
                } else if (type == "UPI") {
                    callback(Gen.UPICharges + parseFloat((Gen.UPICharges * Gen.serviceTax).toFixed(2)))
                }
                else {
                    callback(0);
                }
            } else {
                callback(0);
            }
        }
    });
}


function responsefrombank(bankresp) {
    var ins_banklogret = {};
    bankresp.Header.Corp_ID ? ins_banklogret["Corp_ID"] = bankresp.Header.Corp_ID : undefined;
    bankresp.Header.Maker_ID ? ins_banklogret["Maker_ID"] = bankresp.Header.Maker_ID : undefined;
    bankresp.Header.Checker_ID ? ins_banklogret["Checker_ID"] = bankresp.Header.Checker_ID : undefined;
    bankresp.Header.Approver_ID ? ins_banklogret["Approver_ID"] = bankresp.Header.Approver_ID : undefined;
    bankresp.Header.Status ? ins_banklogret["Status"] = bankresp.Header.Status : undefined;
    bankresp.Header.Resp_cde ? ins_banklogret["Resp_cde"] = bankresp.Header.Resp_cde : undefined;
    bankresp.Header.Error_Cde ? ins_banklogret["Error_Cde"] = bankresp.Header.Error_Cde ? Object.keys(bankresp.Header.Error_Cde).length === 0 ? "" : bankresp.Header.Error_Cde : "" : undefined;
    bankresp.Header.Error_Desc ? ins_banklogret["Error_Desc"] = bankresp.Header.Error_Desc ? Object.keys(bankresp.Header.Error_Desc).length === 0 ? "" : bankresp.Header.Error_Desc : "" : undefined;
    bankresp.Body.RefNo ? ins_banklogret["RefNo"] = bankresp.Body.RefNo : undefined;
    bankresp.Body.channelpartnerrefno ? ins_banklogret["channelpartnerrefno"] = bankresp.Body.channelpartnerrefno : undefined;
    bankresp.Body.RRN ? ins_banklogret["RRN"] = bankresp.Body.RRN : undefined;
    bankresp.Body.UTRNo ? ins_banklogret["UTRNo"] = bankresp.Body.UTRNo : undefined;
    bankresp.Body.PONum ? ins_banklogret["PONum"] = bankresp.Body.PONum : undefined;
    bankresp.Body.Ben_Acct_No ? ins_banklogret["Ben_Acct_No"] = encryption(bankresp.Body.Ben_Acct_No) : undefined;
    bankresp.Body.Ben_Acct_No ? ins_banklogret["Ben_Last4"] = bankresp.Body.Ben_Acct_No.substr(bankresp.Body.Ben_Acct_No.length - 4) : undefined;
    bankresp.Body.Amount ? ins_banklogret["Amount"] = bankresp.Body.Amount : undefined;
    bankresp.Body.BenIFSC ? ins_banklogret["BenIFSC"] = encryption(bankresp.Body.BenIFSC) : undefined;
    bankresp.Body.Txn_Time ? ins_banklogret["Txn_Time"] = bankresp.Body.Txn_Time : undefined;
    return ins_banklogret;
}