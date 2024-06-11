const conf = require("../../config/payoutConfig/config");
const hbody = require("../../config/payoutConfig/headerbody");
const endpointURL = require("../../config/payoutConfig/endPointUrl");
const fs = require("fs");
const path = require("path");
const request = require("request");
const cryptos = require('crypto');
const key = "~*Rocking6565Star*~";
const enc_key = "~*MyINSPL@66Devi*~";
const NODE_ENV = process.env.NODE_ENV
const reqip = conf.reqip,
    token1 = conf.bearer1,
    token2 = conf.bearer2;
function decryption(data) {
    try {
        let enKey = cryptos.createHash('sha256').update(String(enc_key)).digest('hex').substr(0, 32).toUpperCase();
        let iv = cryptos.createHash('sha256').update(String(enc_key)).digest('hex').substr(0, 16).toUpperCase();
        var decipher = cryptos.createDecipheriv("aes-256-cbc", enKey, iv);
        var decrypted = decipher.update(data, "base64", "utf8");
        decrypted += decipher.final("utf8");
        console.log("decrypted", decrypted)
        return decrypted;
    }
    catch (ex) {
        return "";
    }
}



exports.singlePayment = function (req, res) {
    try {
        var bearer = req.headers.authorization;
        var array = bearer.split(" ");
        if (array[1] != token2) {
            res.status(401).json({ status: "401", message: "Unauthorized user!" });
        } else {

            let trasid = req.body.tranID,
                Ben_IFSC = decryption(req.body.Ben_IFSC),
                Ben_Acct_No = decryption(req.body.Ben_Acct_No),
                Ben_Name = req.body.Ben_Name,
                Ben_BankName = req.body.Ben_BankName.length > 20 ? req.body.Ben_BankName.substring(0, 19) : req.body.Ben_BankName,
                Ben_PartTrnRmks = req.body.Ben_PartTrnRmks,
                Mode_of_Pay = req.body.Mode_of_Pay,
                trans_Remark = req.body.trans_Remark,
                Ben_Address = req.body.Ben_Address,
                Ben_mobile = req.body.Ben_mobile,
                Ben_TrnParticulars = req.body.Ben_TrnParticulars,
                amount = req.body.amount,
                signature = req.body.signature;

            let inputString = '';
            inputString += "tranID";
            inputString += '=';
            inputString += trasid;
            inputString += '~';
            inputString += "Ben_IFSC";
            inputString += '=';
            inputString += req.body.Ben_IFSC;
            inputString += '~';
            inputString += "Ben_Acct_No";
            inputString += '=';
            inputString += req.body.Ben_Acct_No;
            inputString += '~';
            inputString += "amount";
            inputString += '=';
            inputString += amount;
            inputString += '~';
            inputString += "Mode_of_Pay";
            inputString += '=';
            inputString += Mode_of_Pay;
            var sha512str = sha512(inputString, key);

            if ((trasid && trasid.length <= 15) &&
                (Ben_IFSC && Ben_IFSC.length == 11) &&
                (Ben_Acct_No && Ben_Acct_No.length <= 16) &&
                (Ben_Name && Ben_Name.length <= 100) &&
                (trans_Remark && trans_Remark.length <= 50) &&
                (Mode_of_Pay && Mode_of_Pay.length <= 10) &&
                (Ben_BankName && Ben_BankName.length <= 50) &&
                (amount) &&
                (signature && signature === sha512str)
            ) {
                var rbody;
                // if( Ben_BankName.toLowerCase() === "bank bank" || Ben_IFSC.substring(0, 4) === "RATN"){
                //     Mode_of_Pay = "FT"
                // }
                if (Mode_of_Pay == "IMPS") {
                    rbody = {
                        "Amount": amount,
                        "Debit_Acct_No": hbody.Account_No,
                        "Debit_Acct_Name": hbody.Debit_Acct_Name,
                        "Debit_IFSC": hbody.Debit_IFSC,
                        "Debit_Mobile": hbody.Debit_Mobile,
                        "Ben_IFSC": Ben_IFSC,
                        "Ben_Acct_No": Ben_Acct_No,
                        "Ben_Name": Ben_Name,
                        "Ben_Address": Ben_Address,
                        "Ben_BankName": Ben_BankName,
                        "Ben_PartTrnRmks": Ben_PartTrnRmks,
                        "Mode_of_Pay": Mode_of_Pay,
                        "Remarks": trans_Remark
                    }
                    bankTransInitiate(rbody);
                }
                else if (Mode_of_Pay == "NEFT") {
                    rbody = {
                        "Amount": amount,
                        "Debit_Acct_No": hbody.Account_No,
                        "Ben_IFSC": Ben_IFSC,
                        "Ben_Acct_No": Ben_Acct_No,
                        "Ben_Name": Ben_Name,
                        "Ben_Address": Ben_Address,
                        "Ben_BankName": Ben_BankName,
                        "Ben_PartTrnRmks": Ben_PartTrnRmks,
                        "Mode_of_Pay": Mode_of_Pay,
                        "Remarks": trans_Remark
                    }
                    bankTransInitiate(rbody);
                }
                else if (Mode_of_Pay == "RTGS") {
                    rbody = {
                        "Amount": amount,
                        "Debit_Acct_No": hbody.Account_No,
                        "Ben_IFSC": Ben_IFSC,
                        "Ben_Acct_No": Ben_Acct_No,
                        "Ben_Name": Ben_Name,
                        "Ben_Address": Ben_Address,
                        "Ben_BankName": Ben_BankName,
                        "Ben_PartTrnRmks": Ben_PartTrnRmks,
                        "Mode_of_Pay": Mode_of_Pay,
                        "Remarks": trans_Remark
                    }
                    bankTransInitiate(rbody);
                }
                else if (Mode_of_Pay == "FT") {
                    if (Ben_TrnParticulars && Ben_TrnParticulars.length < 50) {
                        rbody = {
                            "Amount": amount,
                            "Debit_Acct_No": hbody.Account_No,
                            "Debit_Acct_Name": hbody.Debit_Acct_Name,
                            "Debit_IFSC": hbody.Debit_IFSC,
                            "Debit_Mobile": hbody.Debit_Mobile,
                            "Debit_TrnParticulars": hbody.Debit_TrnParticulars,
                            "Ben_IFSC": Ben_IFSC,
                            "Ben_Acct_No": Ben_Acct_No,
                            "Ben_Name": Ben_Name,
                            "Ben_BankName": Ben_BankName,
                            "Ben_Mobile": Ben_mobile,
                            "Ben_TrnParticulars": Ben_TrnParticulars,
                            "Ben_PartTrnRmks": Ben_PartTrnRmks,
                            "Mode_of_Pay": "FT",
                            "Remarks": trans_Remark
                        }
                        bankTransInitiate(rbody);
                    }
                    else {
                        res.status(411).send({ status: 411, message: "Please Follow field validations" });
                    }
                }
                else {
                    res.status(411).send({ status: 204, message: "Something Went Wrong..!!" });
                }

            } else {
                res.status(411).json({ status: 411, message: "Please Follow field validations" })
            }
            function bankTransInitiate(reqbody) {
                let requestJson = JSON.stringify({
                    "Single_Payment_Corp_Req": {
                        "Header": {
                            "TranID": trasid,
                            "Corp_ID": hbody.Corp_ID,
                            "Maker_ID": hbody.Maker_ID,
                            "Checker_ID": hbody.Checker_ID,
                            "Approver_ID": hbody.Approver_ID
                        },
                        "Body": reqbody,
                        "Signature": {
                            "Signature": "Signature"
                        }
                    }
                });
                if (NODE_ENV === "production") {
                    let client_ID = conf.client_ID;
                    let client_Secret = conf.client_Secret;
                    var auth = 'Basic ' + Buffer.from(conf.uid + ':' + conf.pass).toString('base64');
                    console.log("input", requestJson);
                    request.post({
                        "headers": { "content-type": "application/json", "authorization": auth },
                        agentOptions: {
                            cert: fs.readFileSync(path.resolve(__dirname, conf.crt)),
                            key: fs.readFileSync(path.resolve(__dirname, conf.key)),
                        },
                        "url": reqip + endpointURL.payment + "?client_id=" + client_ID + "&client_secret=" + client_Secret,
                        "body": requestJson
                    }, (error, response, body) => {
                        console.log("error", error);
                        console.log("body", body);
                        if (error) {
                            console.dir(error);
                            res.json({ status: response.statusCode, Header: JSON.parse(response.request.body).Single_Payment_Corp_Req.Header, });

                        } else {
                            if (response.statusCode == 200) {
                                var newjson = JSON.parse(body);
                                res.json({ status: response.statusCode, resource: newjson });
                            }
                            else {
                                res.json({ status: response.statusCode, Header: JSON.parse(response.request.body).Single_Payment_Corp_Req.Header, });
                            }
                        }
                    })
                } else {
                    if (Mode_of_Pay === "IMPS") {
                        res.json({
                            status: "200", resource: {
                                "Single_Payment_Corp_Resp": {
                                    "Header": {
                                        "TranID": trasid,
                                        "Corp_ID": "COMPANYINF",
                                        "Maker_ID": "",
                                        "Checker_ID": "",
                                        "Approver_ID": "",
                                        "Status": "Success",
                                        "Resp_cde": "00",
                                        "Error_Desc": " "
                                    },
                                    "Body": {
                                        "RefNo": "SPCOMPANYINF" + trasid,
                                        "channelpartnerrefno": "IMPSCOMPANYINF" + trasid,
                                        "RRN": trasid,
                                        "Ben_Acct_No": Ben_Acct_No,
                                        "Amount": amount,
                                        "BenIFSC": Ben_IFSC,
                                        "Txn_Time": Date.now()
                                    },
                                    "Signature": {
                                        "Signature": "Signature"
                                    }
                                }
                            }
                        });
                    } else if (Mode_of_Pay == "NEFT") {
                        res.json({
                            status: "200", resource: {
                                "Single_Payment_Corp_Resp": {
                                    "Header": {
                                        "TranID": trasid,
                                        "Corp_ID": "COMPANYINF",
                                        "Maker_ID": "",
                                        "Checker_ID": "",
                                        "Approver_ID": "",
                                        "Status": "Initiated",
                                        "Error_Cde": {

                                        },
                                        "Error_Desc": {

                                        }
                                    },
                                    "Body": {
                                        "RefNo": "SPCOMPANYINF" + trasid,
                                        "UTRNo": "RATNN" + trasid,
                                        "PONum": "000198670461",
                                        "Ben_Acct_No": Ben_Acct_No,
                                        "Amount": amount,
                                        "BenIFSC": Ben_IFSC,
                                        "Txn_Time": Date.now()
                                    },
                                    "Signature": {
                                        "Signature": "Signature"
                                    }
                                }
                            }
                        });
                    }
                }
            }
        }
    }
    catch (ex) {
        console.dir(ex);
        res.status(500).json({ status: 500, message: "Internal Server Error" })
    }
};

exports.singlePaymentStatus = function (req, res) {
    try {
        var bearer = req.headers.authorization;
        var array = bearer.split(" ");
        if (array[1] != token1) {
            res.status(401).json({ status: "401", message: "Unauthorized user!" });
        } else {
            let refno = req.body.RefNo,
                tranid = req.body.tranID,
                signature = req.body.signature,
                letterNumber = /^[0-9]+$/;

            let inputString = '';
            inputString += "tranID";
            inputString += '=';
            inputString += tranid;
            inputString += '~';
            inputString += "RefNo";
            inputString += '=';
            inputString += refno;
            var sha512str = sha512(inputString, key);


            if ((tranid && tranid.length <= 15) && (refno && refno.length < 50) &&
                (signature && signature === sha512str)
            ) {
                let client_ID = conf.client_ID;
                let client_Secret = conf.client_Secret;
                var auth = 'Basic ' + Buffer.from(conf.uid + ':' + conf.pass).toString('base64');
                let requestJson = {
                    "get_Single_Payment_Status_Corp_Req": {
                        "Header": {
                            "TranID": tranid,
                            "Corp_ID": hbody.Corp_ID,
                            "Maker_ID": hbody.Maker_ID,
                            "Checker_ID": hbody.Checker_ID,
                            "Approver_ID": hbody.Approver_ID
                        },
                        "Body": {
                            "RefNo": refno,
                        },
                        "Signature": {
                            "Signature": "12345"
                        }
                    }
                }
                request.post({
                    "headers": { "content-type": "application/json", "authorization": auth },
                    agentOptions: {
                        cert: fs.readFileSync(path.resolve(__dirname, conf.crt)),
                        key: fs.readFileSync(path.resolve(__dirname, conf.key)),
                    },
                    "url": reqip + endpointURL.query + "query?client_id=" + client_ID + "&client_secret=" + client_Secret,
                    "body": JSON.stringify(requestJson)
                }, (error, response, body) => {
                    if (error) {
                        console.dir(error);
                        res.json({ status: response.statusCode, Header: JSON.parse(response.request.body).get_Single_Payment_Status_Corp_Req.Header, });

                    } else {
                        if (response.statusCode == 200) {
                            var newjson = JSON.parse(body);
                            var resheader = newjson.get_Single_Payment_Status_Corp_Res.Header;
                            if (resheader.Status == "SUCCESS") {
                                var resbody = newjson.get_Single_Payment_Status_Corp_Res.Body;
                                console.log(newjson)
                                var txnid = resbody.UTRNO ? resbody.UTRNO : resbody.RRN ? resbody.RRN : undefined;
                                var txnstatus;
                                if (resbody.TXNSTATUS) {
                                    txnstatus = resbody.TXNSTATUS;
                                } else if (resbody.PAYMENTSTATUS) {
                                    if (resbody.PAYMENTSTATUS == "7") {
                                        txnstatus = "Success";
                                    } else if (resbody.PAYMENTSTATUS == "8") {
                                        txnstatus = "Failure";
                                    } else if (resbody.PAYMENTSTATUS == "9") {
                                        txnstatus = "Awaiting Confirmation";
                                    } else {
                                        txnstatus = "Failure";
                                    }
                                } else {
                                    txnstatus = "Nil";
                                }

                                var resjson = {
                                    "status": resheader.Status,
                                    "txnId": txnid,
                                    "txnstatus": txnstatus,
                                    "ben_conf_received": resbody.BEN_CONF_RECEIVED ? resbody.BEN_CONF_RECEIVED : undefined,
                                    "statusdesc": resbody.STATUSDESC ? resbody.STATUSDESC : undefined,
                                    "amount": resbody.AMOUNT ? resbody.AMOUNT : undefined,
                                    "txntime": resbody.TXNTIME ? resbody.TXNTIME : undefined,
                                    "BenIFSC": req.body.BenIFSC,
                                    "Ben_Acct_No": req.body.Ben_Acct_No,
                                    "Mode_of_Pay": req.body.Mode_of_Pay,
                                    "charges": req.body.charges
                                }
                                res.json({ status: response.statusCode, resource: resjson });
                            }
                            else {
                                res.json({
                                    status: 204, "Error_Cde": resheader.Error_Cde,
                                    "Error_Desc": resheader.Error_Desc
                                });
                            }

                        }
                        else {
                            res.json({ status: response.statusCode, Header: JSON.parse(response.request.body).get_Single_Payment_Status_Corp_Req.Header, });
                        }
                    }
                })
            }
            else {
                res.status(411).json({ status: 411, message: "Please Follow field validations" })
            }
        }

    }
    catch (ex) {
        console.dir(ex);
        res.status(500).json({ status: 500, message: "Internal Server Error" })
    }
};

function sha512(salt, password) {
    var hash = cryptos.createHmac('sha512', salt); /** Hashing algorithm sha512 */
    hash.update(password);
    var value = hash.digest('hex');
    return value
};