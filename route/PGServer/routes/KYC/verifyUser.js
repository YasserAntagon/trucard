var express = require('express');
var router = express.Router();
var sha = require('../../sha');
let Kyc = require('../../model/kyc')
let gridenpoint = require('../../model/config/gridenpoint');
let gridLineReq = require('../../model/config/gridLine.json');
var password = '~*Su655rya*~';
var cryptos = require('crypto');
var faker = require('random-indian-name');
var kycEnKey = process.env.kycEnKey;
var request = require('request');
const NODE_ENV = process.env.NODE_ENV
var responseObj = {
    "1003": "Session Expired. Please start the process again.",
    "1004": "Pan does not exist.",
    "1005": "OTP attempts exceeded. Please start the process again.",
    "INVALID_OTP": "Invalid OTP.",
    "INVALID_PAN": "Invalid PAN number.",
    "NO_SHARE_CODE": "No share code provided",
    "WRONG_SHARE_CODE": "Wrong share code.",
    "INVALID_SHARE_CODE": "Invalid share code. Length should be 4 and should only contain numbers."
}
function encrypt(text) {
    try {
        var cipher = cryptos.createCipher('aes-256-ctr', password)
        var crypted = cipher.update(text, 'utf8', 'hex')
        crypted += cipher.final('hex');
        return crypted;
    }
    catch (ex) {
        return ""
    }
}
function formatPGDate() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();
    if (dd < 10) {
        dd = '0' + dd;
    }
    if (mm < 10) {
        mm = '0' + mm;
    }
    return dd + '/' + mm + '/' + yyyy;
}
function decryption(data) {
    try {
        let enKey = cryptos.createHash('sha256').update(String(kycEnKey)).digest('hex').substr(0, 32).toUpperCase();
        let iv = cryptos.createHash('sha256').update(String(kycEnKey)).digest('hex').substr(0, 16).toUpperCase();
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

function decimalChopper(num, fixed) {
    var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?');
    return num.toString().match(re)[0];
}
function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function matchNamesPercentage(name1, name2, utype) {
    if (utype === "B2BPartner") {
        // Convert both names to lowercase
        name1 = name1.toLowerCase();
        name2 = name2.toLowerCase();

        // Remove any spaces from both names
        name1 = name1.replace(/\s/g, '');
        name2 = name2.replace(/\s/g, '');

        // Count the number of matching characters
        let matches = 0;
        for (let i = 0; i < name1.length; i++) {
            if (name2.includes(name1[i])) {
                matches++;
            }
        }

        // Calculate the percentage of similarity
        let percentage = (matches / Math.max(name1.length, name2.length)) * 100;

        // Round the percentage to two decimal places
        percentage = Math.round(percentage * 100) / 100;

        return percentage;
    } else {
        return 100
    }

}
function generateHash(data) {
    var valArray = new Array(),
        nameArray = new Array();
    Object.keys(data).forEach(key => {
        valArray.push(data[key]);
        nameArray.push(key);
    });
    nameArray.sort();
    let inputString = "";
    for (let j = 0; j < nameArray.length; j++) {
        var element = nameArray[j];
        inputString += '~';
        inputString += element;
        inputString += '=';
        inputString += data[element];
    }

    inputString = inputString.substr(1);
    console.log("inputString", inputString)
    var signHash = sha.hash(inputString);
    return signHash;
}
router.post('/GenerateCaptcha', function (req, res, next) {
    try {
        const options = {
            method: 'get',
            url: gridLineReq.gridreqip + gridenpoint.aadhaarCaptcha,
            headers: { 'Content-Type': 'application/json', 'X-Auth-Type': 'API-Key', 'X-API-Key': gridLineReq.API_KEY },
            json: true
        };
        if (NODE_ENV === "production") {
            request(options, function (error, response, body) {
                if (error) {
                    res.json({ status: "500", message: "Internal server Error" })
                } else {
                    console.log("error, body", error, body)
                    if (response.statusCode === 200) {
                        res.send({ status: body.status, message: body.data.message, transactionid: body.data.transaction_id, captcha_base64: body.data.captcha_base64 })
                    } else {
                        res.json({ status: response.statusCode, message: body.error.message });
                    }
                }
            });
        } else {
            res.send({
                "status": 200,
                "message": "Captcha generated.",
                "transactionid": "0f4f1bdf-6cee-4e4c-be89-a6fdf1ba02bf",
                "captcha_base64": "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"
            })
        }
        console.log(options)

    }
    catch (ex) {
        res.status(500).json({
            status: "500",
            message: ex.message
        });
    }
});
router.post('/sendOTPAadhar', function (req, res, next) {
    var cc = req.body;
    try {

        var sha512str = generateHash(cc)
        console.log("sha512str", sha512str)
        if (sha512str !== req.headers.hash) {
            res.status(401).json({
                status: "401",
                message: "Invalid hash"
            });
        }
        else {
            Kyc.validateUserExistORnot({ truID: cc.truID }, cc.USERTYPE, function (error, valresp) {
                console.log("err", error)
                console.log("valresp", valresp)
                if (error) {
                    res.json({ status: "500", message: "Internal server Error" })
                } else {
                    if (valresp.status == "200") {
                        if (valresp.resource.docVerified === true && valresp.resource.aadharStatus === "active") {
                            res.json({ status: "204", message: "User KYC already done" })
                        } else {
                            const options = {
                                method: 'POST',
                                url: gridLineReq.gridreqip + gridenpoint.aadhaarsendOTP,
                                headers: {
                                    'Content-Type': 'application/json',
                                    'X-Auth-Type': 'API-Key',
                                    'X-Transaction-ID': req.headers.transactionid,
                                    'X-API-Key': gridLineReq.API_KEY
                                },
                                body: { aadhaar_number: cc.AADHAARNo, consent: cc.CONSENT, captcha: cc.captcha },
                                json: true
                            };
                            // res.json(options)
                            if (NODE_ENV === "production") {
                                console.log(options)
                                request(options, function (error, response, body) {
                                    console.log("error, body", error, body)
                                    if (error) {
                                        res.json({ status: "500", message: "Internal server Error" })
                                    } else {
                                        if (response.statusCode === 200) {
                                            if (body.data.code == 1001) {
                                                res.json({ status: response.statusCode, message: body.data.message, transactionid: body.data.transaction_id })
                                            } else {
                                                res.json({ status: body.data.code, message: body.data.message })
                                            }
                                        } else {
                                            res.json({ status: response.statusCode, message: body.error.message });
                                        }
                                    }
                                });
                            }
                            else {
                                res.json({
                                    "status": 200,
                                    "message": "OTP sent to your Registered Mobile number. Check your mobile.",
                                    "transactionid": "0f4f1bdf-6cee-4e4c-be89-a6fdf1ba02bf"
                                })
                            }

                        }
                    } else {
                        res.json(valresp);
                    }
                }
            })
        }
    }
    catch (ex) {
        res.status(500).json({
            status: "500",
            message: ex.message
        });
    }
});
router.post('/verifyAadhar', function (req, res, next) {
    var cc = req.body;
    try {
        var sha512str = generateHash(cc)
        console.log("sha512str", sha512str)
        if (sha512str !== req.headers.hash) {
            res.status(401).json({
                status: "401",
                message: "Invalid hash"
            });
        }
        else {
            Kyc.validateUserExistORnot({ truID: cc.truID }, cc.USERTYPE, function (error, valresp) {
                if (error) {
                    res.json({ status: "500", message: "Internal server Error" })
                } else {
                    if (valresp.status === "200") {
                        if (valresp.resource.docVerified === true && valresp.resource.aadharStatus === "active") {
                            res.json({ status: "204", message: "User KYC already done" })
                        } else {
                            const options = {
                                method: 'POST',
                                url: gridLineReq.gridreqip + gridenpoint.aadhaarverifyOTP,
                                headers: {
                                    'Content-Type': 'application/json',
                                    'X-Auth-Type': 'API-Key',
                                    'X-Transaction-ID': req.headers.transactionid,
                                    'X-API-Key': gridLineReq.API_KEY
                                },
                                body: { otp: cc.OTP, include_xml: true, share_code: '0751' },
                                json: true
                            };
                            if (NODE_ENV === "production") {
                                request(options, function (error, response, jsonBody) {
                                    if (error) {
                                        res.json({ status: "500", message: "Internal server Error" })
                                    } else {
                                        if (response.statusCode === 200) {
                                            if (jsonBody.data.code == "1002") {
                                                var validationdata = jsonBody.data.aadhaar_data
                                                validationdata.request_id = jsonBody.request_id
                                                validationdata.transaction_id = jsonBody.data.transaction_id
                                                validationdata.timestamp = jsonBody.timestamp

                                                var name = validationdata.name;
                                                var name_array = name.split(" "),
                                                    fname, lname, mname;
                                                if (name_array.length > 2) {
                                                    fname = name_array[0]
                                                    mname = name_array[1]
                                                    lname = name_array[name_array.length - 1]
                                                } else {
                                                    fname = name_array[0]
                                                    lname = name_array[1]
                                                }
                                                var address = {
                                                    "houseNumber": validationdata.house,
                                                    "streetNumber": validationdata.street,
                                                    "landmark": validationdata.vtc_name,
                                                    "pin": validationdata.pincode,
                                                    "city": validationdata.district,
                                                    "state": validationdata.state,
                                                    "country": validationdata.country
                                                }
                                                var inputJsonUserDetails = {
                                                    truID: cc.truID,
                                                    fname: fname,
                                                    mname: mname,
                                                    lname: lname,
                                                    gender: validationdata.gender ? validationdata.gender.toLowerCase() : null,
                                                    DOB: validationdata.date_of_birth,
                                                    billingAddress: address,
                                                    permanentAddress: address

                                                }
                                                Kyc.updateUserDetails(inputJsonUserDetails, "B2BConsumer", function (error, upresp) {
                                                    // res.json(upresp)
                                                    var inputJson = {
                                                        truID: cc.truID,
                                                        validationViaAPI: true,
                                                        kycDetails: [{
                                                            "docTitle": "Aadhaar",
                                                            "validationdata": validationdata
                                                        }]
                                                    }
                                                    Kyc.updateKYCDetails(inputJson, "B2BConsumer", function (error, upresp) {
                                                        res.json(upresp);
                                                    });
                                                })


                                            } else {
                                                res.json({ status: jsonBody.data.code, message: responseObj[jsonBody.data.code] })
                                            }
                                        } else {
                                            res.json({ status: response.statusCode, message: jsonBody.error.message });
                                        }
                                    }
                                });
                            } else {
                                var genderArr = ["male", "female","male", "female","male", "female","male", "female","male", "female","male", "female"]
                                var gnrannum = randomIntFromInterval(1, 2)
                                var gender = genderArr[gnrannum];
                                var randomnm = faker({ first: true, gender: gender }) + " " + faker({ first: true, gender: "male" }) + " " + faker({ last: true })
                                var jsonBody = {
                                    "request_id": "b4766083-9d47-4d66-867a-5a7d5180555c",
                                    "status": 200,
                                    "data": {
                                        "code": "1002",
                                        "message": "XML validated and parsed.",
                                        "transaction_id": "0f4f1bdf-6cee-4e4c-be89-a6fdf1ba02bf",
                                        "share_code": "0751",
                                        "aadhaar_data": {
                                            "document_type": "AADHAAR",
                                            "reference_id": "532320230329112458088",
                                            "name": randomnm.toUpperCase(),
                                            "date_of_birth": "1992-11-19",
                                            "gender": gender,
                                            "mobile": "4fe2d96405d30x4a3356d32b062f1425ed833cc30050e4fc1594",
                                            "email": "d8498fsdfdfc97abdf16a7b538496b8bf92b8af957b5cc7bc743",
                                            "house": "96",
                                            "street": "Sharma Karpet Wali Galli",
                                            "district": "Dhule",
                                            "post_office_name": "Sakri",
                                            "state": "Maharashtra",
                                            "pincode": "424305",
                                            "country": "India",
                                            "vtc_name": "Hodadane",
                                            "photo_base64": "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",
                                            "xml_base64": "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"
                                        }
                                    },
                                    "timestamp": 1680069298216,
                                    "path": "/meson/submit-otp"
                                }

                                if (jsonBody.data.code == "1002") {
                                    var validationdata = jsonBody.data.aadhaar_data
                                    validationdata.request_id = jsonBody.request_id
                                    validationdata.transaction_id = jsonBody.data.transaction_id
                                    validationdata.timestamp = jsonBody.timestamp
                                    if (cc.USERTYPE == "B2BConsumer") {
                                        var name = validationdata.name;
                                        var name_array = name.split(" "),
                                            fname, lname, mname;
                                        if (name_array.length > 2) {
                                            fname = name_array[0]
                                            mname = name_array[1]
                                            lname = name_array[name_array.length - 1]
                                        } else {
                                            fname = name_array[0]
                                            lname = name_array[1]
                                        }
                                        var address = {
                                            "houseNumber": validationdata.house,
                                            "streetNumber": validationdata.street,
                                            "landmark": validationdata.vtc_name,
                                            "pin": validationdata.pincode,
                                            "city": validationdata.district,
                                            "state": validationdata.state,
                                            "country": validationdata.country
                                        }
                                        var inputJsonUserDetails = {
                                            truID: cc.truID,
                                            fname: fname,
                                            mname: mname,
                                            lname: lname,
                                            gender: validationdata.gender ? validationdata.gender.toLowerCase() : null,
                                            DOB: validationdata.date_of_birth,
                                            billingAddress: address,
                                            permanentAddress: address

                                        }
                                        Kyc.updateUserDetails(inputJsonUserDetails, "B2BConsumer", function (error, upresp) {
                                            // res.json(upresp)
                                        })
                                    }
                                    var inputJson = {
                                        truID: cc.truID,
                                        validationViaAPI: true,
                                        kycDetails: [{
                                            "docTitle": "Aadhaar",
                                            // "docNumber": cc.AADHAARNo,
                                            "validationdata": validationdata
                                        }]
                                    }
                                    Kyc.updateKYCDetails(inputJson, cc.USERTYPE, function (error, upresp) {
                                        upresp.nameOnAadhaar = validationdata.name;
                                        upresp.truID = cc.truID
                                        res.json(upresp);
                                    });

                                } else {
                                    res.json({ status: jsonBody.data.code, message: responseObj[jsonBody.data.code] })
                                }
                            }
                        }
                    } else {
                        res.json(valresp)
                    }
                }

            })
        }
    }
    catch (ex) {
        res.status(500).json({
            status: "500",
            message: ex.message
        });
    }
});
router.post('/verifyPAN', function (req, res, next) {
    var cc = req.body;
    try {
        var sha512str = generateHash(cc);
        console.log("sha512str", sha512str)
        if (sha512str !== req.headers.hash) {
            res.status(401).json({
                status: "401",
                message: "Invalid hash"
            });
        }
        else {
            Kyc.validateUserExistORnot({ truID: cc.truID }, cc.USERTYPE, function (error, valresp) {
                if (error) {
                    res.json({ status: "500", message: "Internal server Error" })
                } else {
                    if (valresp.status === "200") {
                        if (valresp.resource.panStatus === "active") {
                            res.json({ status: "204", message: "User Pan already Link" })
                        } else {


                            const options = {
                                method: 'POST',
                                url: gridLineReq.gridreqip + gridenpoint.panverify,
                                headers: { 'Content-Type': 'application/json', 'X-Auth-Type': 'API-Key', 'X-API-Key': gridLineReq.API_KEY },
                                body: {
                                    "pan_id": cc.PANNo,
                                    "consent": cc.CONSENT
                                },
                                json: true
                            };
                            // res.json(options)
                            if (NODE_ENV === "production") {
                                request(options, function (error, response, jsonBody) {
                                    if (error) {
                                        res.json({ status: "500", message: "Internal server Error" })
                                    } else {
                                        if (response.statusCode === 200) {
                                            if (jsonBody.data.code === "1000") {
                                                var validationdata = jsonBody.data;
                                                validationdata.request_id = jsonBody.request_id;
                                                validationdata.timestamp = jsonBody.timestamp;
                                                if (matchNamesPercentage(valresp.resource.nameOnAadhaar, validationdata.pan_data.name, cc.USERTYPE) === 100) {
                                                    var inputJson = {
                                                        truID: cc.truID,
                                                        kycDetails: [{
                                                            "docTitle": "Pan",
                                                            "docNumber": encrypt(cc.PANNo, cc.truID),
                                                            "validationdata": validationdata
                                                        }],
                                                        panVerified: true
                                                    }
                                                    Kyc.updateKYCDetails(inputJson, "B2BConsumer", function (error, upresp) {
                                                        res.json(upresp)
                                                    })
                                                } else {
                                                    res.json({ status: "204", message: "Your Aadhaar and pan name mistached..!!" })
                                                }

                                            } else {
                                                res.json({ status: jsonBody.data.code, message: responseObj[jsonBody.data.code] })
                                            }
                                        } else {
                                            res.json({ status: response.statusCode, message: jsonBody.error.message });
                                        }
                                    }
                                });
                            } else {
                                var randomnm = faker({ last: true })
                                var jsonBody = {
                                    "request_id": "584c0125-9c67-4adb-a0e2-03ca899a18ba",
                                    "status": 200,
                                    "data": {
                                        "code": "1000",
                                        "message": "Valid PAN.",
                                        "pan_data": {
                                            "document_type": "PAN",
                                            "name": randomnm
                                        }
                                    },
                                    "timestamp": 1686824230781,
                                    "path": "/fetch"
                                }
                                if (jsonBody.data.code === "1000") {
                                    var validationdata = jsonBody.data;
                                    validationdata.request_id = jsonBody.request_id;
                                    validationdata.timestamp = jsonBody.timestamp;
                                    if (cc.USERTYPE == "B2BConsumer") {
                                        if (matchNamesPercentage(valresp.resource.nameOnAadhaar, validationdata.pan_data.name, cc.USERTYPE) === 100) {
                                            updatePanData();
                                        } else {
                                            res.json({ status: "204", message: "Your Aadhaar and pan name mistached..!!" })
                                        }
                                    } else {
                                        updatePanData();
                                    }
                                    function updatePanData() {
                                        var inputJson = {
                                            truID: cc.truID,
                                            kycDetails: [{
                                                "docTitle": "Pan",
                                                "docNumber": encrypt(cc.PANNo, cc.truID),
                                                "validationdata": validationdata
                                            }],
                                            panVerified: true
                                        }
                                        Kyc.updateKYCDetails(inputJson, cc.USERTYPE, function (error, upresp) {
                                            upresp.nameOnPan = validationdata.pan_data.name;
                                            upresp.truID = cc.truID
                                            res.json(upresp)
                                        })
                                    }

                                } else {
                                    res.json({ status: jsonBody.data.code, message: responseObj[jsonBody.data.code] })
                                }
                            }
                        }

                    } else {
                        res.json(valresp)
                    }
                }

            })
        }
    }
    catch (ex) {
        res.status(500).json({
            status: "500",
            message: ex.message
        });
    }
});
router.post('/verifyBankAccount', function (req, res, next) {
    var cc = req.body;
    try {
        var sha512str = generateHash(cc);
        console.log("sha512str", sha512str)
        if (sha512str !== req.headers.hash) {
            res.status(401).json({
                status: "401",
                message: "Invalid hash"
            });
        }
        else {
            Kyc.validateUserExistORnot({ truID: cc.truID }, cc.USERTYPE, function (error, valresp) {
                if (error) {
                    res.json({ status: "500", message: "Internal server Error" })
                } else {
                    if (valresp.status === "200") {
                        console.log("account_number", decryption(cc.accountno), "ifsc", decryption(cc.ifsc),)
                        const options = {
                            method: 'POST',
                            url: gridLineReq.gridreqip + gridenpoint.bankverify,
                            headers: { 'Content-Type': 'application/json', 'X-Auth-Type': 'API-Key', 'X-API-Key': gridLineReq.API_KEY },
                            body: {
                                "account_number": decryption(cc.accountno),
                                "ifsc": decryption(cc.ifsc),
                                "consent": cc.CONSENT
                            },
                            json: true
                        };
                        // res.json(options)
                        if (NODE_ENV === "production") {
                            request(options, function (error, response, jsonBody) {
                                if (error) {
                                    res.json({ status: "500", message: "Internal server Error" })
                                } else {
                                    if (response.statusCode === 200) {
                                        if (jsonBody.data.code === "1000") {
                                            res.json({ status: jsonBody.data.code, message: jsonBody.data.message, resource: jsonBody.data.bank_account_data });
                                        } else {
                                            res.json({ status: response.statusCode, message: responseObj[jsonBody.data.code] });
                                        }
                                    } else {
                                        res.json({ status: response.statusCode, message: jsonBody.error.message });
                                    }
                                }
                            });
                        } else {
                            var jsonBody = {
                                data: {
                                    "code": "1000",
                                    "message": "Bank Account details verified successfully.",
                                    "bank_account_data": {
                                        "reference_id": "568671516",
                                        "name": "SURESH ASHOK PATIL",
                                        "bank_name": "KOTAK MAHINDRA BANK LIMITED",
                                        "utr": "312215873463",
                                        "city": "WAGHOLI",
                                        "branch": "PUNE WAGHOLI BRANCH",
                                        "micr": "0"
                                    }
                                },


                            }
                            if (jsonBody.data.code === "1000") {
                                res.json({ status: jsonBody.data.code, message: jsonBody.data.message, resource: jsonBody.data.bank_account_data, last4: decryption(cc.accountno).substr(decryption(cc.accountno).length - 4, 4) });
                            } else {
                                res.json({ status: response.statusCode, message: responseObj[jsonBody.data.code] });
                            }
                        }

                    } else {
                        res.json(valresp)
                    }
                }

            })
        }
    }
    catch (ex) {
        res.status(500).json({
            status: "500",
            message: ex.message
        });
    }
});


module.exports = router;