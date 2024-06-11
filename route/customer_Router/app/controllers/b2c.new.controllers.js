// Created by : Adnan Shaikh

'use strict'
var request = require('request');
var conf = require("../config");
var fs = require("fs");
var path = require("path");
var cryptos = require("crypto");

var token = conf.bearer,
    token1 = conf.bearer1,
    bearer59 = conf.bearer59,
    token52 = conf.bearer52,
    token56 = conf.bearer56,
    token60 = conf.bearer60,
    reqip = conf.reqip;
let defaultConf = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../regionConf.json')));


const letterNumber = /^[0-9]+$/;
function isemail(email) {
    var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return regex.test(email);
};
exports.eighthundredone = function (req, res) {
    try {
        var bearer = req.headers.authorization;
        var array = bearer.split(" ");
        if (array[1] != token) {
            res.json({ status: "401", message: "Unauthorized user!" });
        }
        else if (req.headers.devicehash && req.headers.devicehash == "") {
            res.json({ status: "401", message: "Invalid Device Hash!" });
        }
        else {
            var email = req.body.email,
                mobile = req.body.mobile,
                password = req.body.password,
                fname = req.body.fName ? req.body.fName : "",
                mname = req.body.mName ? req.body.mName : "",
                lname = req.body.lName ? req.body.lName : "",
                countryCode = req.body.countryCode ? req.body.countryCode : "",
                language = req.body.language,
                referenceid = req.body.referenceID,
                merchantid = req.body.merchantID;

            if (password && (password.length < 6 || password.length >= 16)) {
                res.json({
                    status: "411",
                    message: 'Password length must be between 6 to 16 charecters..!!',
                })
            }
            else if ((((mobile && mobile.length === 10 && mobile.match(letterNumber)) && countryCode) || (email && email.length >= 5 && isemail(email) && email.length <= 48)) &&
                (password && conf.ten.password === "mandatory" && password.length >= 6 && password.length <= 16)) {
                request.post({
                    "headers": { "content-type": "application/json" },
                    "url": reqip + ":4112/api/registrationNewB2C",
                    "body": JSON.stringify({
                        "email": email,
                        "mobile": mobile,
                        "password": password,
                        "fname": fname,
                        "mname": mname,
                        "lname": lname,
                        "language": "English",
                        "countrycode": countryCode,
                        "mhash": req.headers.devicehash,
                        "devicename": req.headers.devicename,
                        "referenceid": referenceid,
                        "merchantid": merchantid,
                    })
                }, (error, response, body) => {
                    if (error) {
                        res.status(500).json({ status: "500", message: "Internal Server Error" });
                    } else {
                        var newjson = JSON.parse(body);
                        res.json(newjson);
                    }
                });
            } else {
                res.json({
                    status: "411",
                    message: 'Please provide valid fields..!!',
                })
            }
        }
    } catch (ex) {
        console.log(ex)
        res.status(500).json({ status: "500", message: "Internal Server Error" });
    }

}
exports.eighthundredthree = function (req, res) {
    var bearer = req.headers.authorization;
    if (!bearer) {
        res.json({ status: "400", message: "Bad Request!" });
    }
    else {
        var array = bearer.split(" ");
        if (array[1] != bearer59) {
            res.json({ status: "1007", message: "Unauthorized user!" });
        } else {
            var request = require('request');
            var crnno = req.body.CRNNo,
                invoice = req.body.invoice,
                amtval = req.body.amount;
            var amt = parseFloat(req.body.amount);
            if ((crnno && crnno.length == 8) &&
                (invoice && invoice.length >= 0 && invoice.length <= 30) &&
                (amt && amtval.length <= 9)) {
                request.post({
                    "headers": { "content-type": "application/json" },
                    "url": reqip + ":4114/api/atomaddmoney",
                    "body": JSON.stringify({
                        "crnno": crnno,
                        "amt": amt,
                        "invoice": invoice
                    })
                }, (error, response, body) => {
                    if (error) {
                        return console.dir(error);
                    }
                    var newjson = JSON.parse(body);
                    res.json(newjson);
                });
            } else {
                res.json({
                    status: "1005",
                    message: 'Please Follow Fields Validation Documentation, your JSON structure is incorrect.'
                }
                )
            }
        }
    }
};
exports.eighthundredfour = function (req, res) {
    var bearer = req.headers.authorization;
    if (!bearer) {
        res.json({ status: "400", message: "Bad Request!" });
    }
    else {
        var array = bearer.split(" ");
        if (array[1] != bearer59) {
            res.json({ status: "1007", message: "Unauthorized user!" });
        } else {
            if (req.body.startDate) {
                request.post({
                    "headers": { "content-type": "application/json" },
                    "url": reqip + ":4117/api/assetmanagerb2bnewRateLog",
                    "body": JSON.stringify({
                        "truid": defaultConf.currentassetmanager,
                        "startdate": req.body.startDate
                    })
                }, (error, response, body) => {
                    if (error) {
                        return console.dir(error);
                    }
                    var newjson = JSON.parse(body);
                    res.json(newjson);
                });
            } else {
                res.json({ status: "400", message: "Bad Request!" });
            }

        }
    }
};
exports.eighthundredfive = function (req, res) {
    var bearer = req.headers.authorization;
    var array = bearer.split(" ");
    if (array[1] != token1) {
        res.json({ status: "401", message: "Unauthorized user!" });
    } else {
        var request = require('request');
        var truid = req.body.truID;
        var countrycode = req.body.countryCode;
        var housenumber = req.body.houseNumber;
        var streetnumber = req.body.streetNumber;
        var landmark = req.body.landmark;
        var pin = req.body.pin;
        var city = req.body.city;
        var state = req.body.state;
        var country = req.body.country;
        var phousenumber = req.body.pHouseNumber;
        var pstreetnumber = req.body.pStreetNumber;
        var plandmark = req.body.pLandmark;
        var ppin = req.body.pPin;
        var pcity = req.body.pCity;
        var pstate = req.body.pState;
        var pcountry = req.body.pCountry;

        var letterNumber = /^[0-9]+$/;

        if ((truid && conf.twelve.truID === "mandatory" && truid.length == 16 && truid.match(letterNumber)) &&
            (housenumber && conf.twelve.houseNumber === "mandatory" && housenumber.length >= 0 && housenumber.length <= 50) &&
            (pin && conf.twelve.pin === "mandatory") &&
            (city && conf.twelve.city === "mandatory" && city.length >= 0 && city.length <= 50) &&
            (state && conf.twelve.state === "mandatory" && state.length >= 0 && state.length <= 50) &&
            (country && conf.twelve.country === "mandatory" && country.length >= 0 && country.length <= 50) &&
            (phousenumber && conf.twelve.pHouseNumber === "mandatory" && phousenumber.length >= 0 && phousenumber.length <= 50) &&
            (ppin && conf.twelve.pPin === "mandatory") &&
            (pcity && conf.twelve.pCity === "mandatory" && pcity.length >= 0 && pcity.length <= 50) &&
            (pstate && conf.twelve.pState === "mandatory" && pstate.length >= 0 && pstate.length <= 50) &&
            (countrycode) &&
            (pcountry && conf.twelve.pCountry === "mandatory" && pcountry.length >= 0 && pcountry.length <= 50)) {
            var reqRoutIp = reqip; 
            request.post({
                "headers": { "content-type": "application/json" },
                "url": reqRoutIp + ":4112/api/addressUpdateB2C",
                "body": JSON.stringify({
                    "truid": truid,
                    "housenumber": housenumber,
                    "streetnumber": streetnumber,
                    "landmark": landmark,
                    "pin": pin,
                    "city": city,
                    "state": state,
                    "country": country,
                    "phousenumber": phousenumber,
                    "pstreetnumber": pstreetnumber,
                    "plandmark": plandmark,
                    "ppin": ppin,
                    "pcity": pcity,
                    "pstate": pstate,
                    "pcountry": pcountry
                })
            }, (error, response, body) => {
                if (error) {
                    return console.dir(error);
                }
                var newjson = JSON.parse(body);
                res.json(newjson);
            });
        } else {
            res.json({
                status: "411",
                message: 'Please Follow Fields Validation Documentation'
            }
            )
        }
    }
};

exports.eighthundredsix = function (req, res) {
    var bearer = req.headers.authorization;
    if (!bearer) {
        res.json({ status: "400", message: "Bad Request!" });
    }
    else {
        var array = bearer.split(" ");
        if (array[1] != bearer59) {
            res.json({ status: "1007", message: "Unauthorized user!" });
        } else {
            var request = require('request');
            request.post({
                "headers": { "content-type": "application/json" },
                "url": reqip + ":4114/api/profitlossbuysell",
                "body": JSON.stringify({
                    "truid": req.body.truID
                })
            }, (error, response, body) => {
                if (error) {
                    return console.dir(error);
                }
                var newjson = JSON.parse(body);
                res.json(newjson);
            });
        }
    }
};
exports.eighthundredseven = function (req, res) {
    try {
        var bearer = req.headers.authorization;
        var array = bearer.split(" ");
        if (array[1] != token) {
            res.json({ status: "401", message: "Unauthorized user!" });
        }
        else {
            var email = req.body.email,
                mobile = req.body.mobile,
                password = req.body.password,
                fname = req.body.fName ? req.body.fName : "",
                mname = req.body.mName ? req.body.mName : "",
                lname = req.body.lName ? req.body.lName : "",
                language = req.body.language,
                countryCode = req.body.countryCode ? req.body.countryCode : "",
                truid = req.body.truID,
                crnno = req.body.CRNNo,
                countryoforigin = req.body.countryOfOrigin,
                migrantcountry = req.body.migrantCountry,
                gender = req.body.gender,
                dob = req.body.dob;
            console.log("req.body", req.body)

            if (password && (password.length < 6 || password.length >= 16)) {
                res.json({
                    status: "411",
                    message: 'Password length must be between 6 to 16 charecters..!!',
                })
            }
            else if ((
                ((mobile && mobile.length === 10 && mobile.match(letterNumber)) && countryCode) || (email && email.length >= 5 && isemail(email) && email.length <= 48)) &&
                (password && conf.ten.password === "mandatory" && password.length >= 6 && password.length <= 16) &&
                (fname && conf.ten.fName === "mandatory") &&
                (lname && conf.ten.lName === "mandatory") &&
                (truid && conf.ten.truID === "mandatory") &&
                (crnno && conf.ten.CRNNo === "mandatory") &&
                (gender && conf.ten.gender === "mandatory") &&
                (dob && conf.ten.DOB === "mandatory") &&
                (language && conf.ten.language === "mandatory" && language.length >= 0 && language.length <= 20) &&
                (countryoforigin) &&
                (migrantcountry)) {
                var reqRoutIp = reqip; 
                request.post({
                    "headers": { "content-type": "application/json" },
                    "url": reqRoutIp + ":4112/api/migrateConsumerNewB2C",
                    "body": JSON.stringify({
                        "email": email,
                        "mobile": mobile,
                        "password": password,
                        "fname": fname,
                        "mname": mname,
                        "lname": lname,
                        "language": language,
                        "truid": truid,
                        "crnno": crnno,
                        "countrycode": countryCode,
                        "countryoforigin": countryoforigin,
                        "gender": gender,
                        "dob": dob,
                        "migrantcountry": migrantcountry
                    })
                }, (error, response, body) => {
                    if (error) {
                        res.status(500).json({ status: "500", message: "Internal Server Error" });
                    } else {
                        var newjson = JSON.parse(body);
                        res.json(newjson);
                    }
                });
            } else {
                res.json({
                    status: "411",
                    message: 'Please provide valid fields..!!',
                })
            }
        }


    } catch (ex) {
        console.log(ex)
        res.status(500).json({ status: "500", message: "Internal Server Error" });
    }
} 

exports.eighthundrednine = function (req, res) {
    console.log(req.body)
    var bearer = req.headers.authorization;
    if (!bearer) {
        res.json({ status: "400", message: "Bad Request!" });
    } else {
        var array = bearer.split(" ");
        if (array[1] != token56) {
            res.json({ status: "1007", message: "Unauthorized user!" });
        } else {
            var crnno = req.body.CRNNo,
                invoice = req.body.invoice,
                amtval = req.body.amount;
            var amt = parseFloat(req.body.amount);
            if ((crnno && conf.threehundredthirtytwo.CRNNo === "mandatory" && crnno.length == 8) &&
                (invoice && conf.threehundredthirtytwo.invoice === "mandatory" && invoice.length >= 0 && invoice.length <= 30) &&
                (amt && conf.threehundredthirtytwo.amount === "mandatory" && amtval.length <= 9)) {
                request.post({
                    "headers": { "content-type": "application/json" },
                    "url": reqip + ":4114/v1/api/addMoney",
                    "body": JSON.stringify({
                        "crnno": crnno,
                        "amt": amt,
                        "invoice": invoice
                    })
                }, (error, response, body) => {
                    if (error) {
                        return console.dir(error);
                    }
                    var newjson = JSON.parse(body);
                    res.json(newjson);
                });
            } else {
                res.json({
                    status: "1005",
                    message: 'Please Follow Fields Validation Documentation, your JSON structure is incorrect.'
                }
                )
            }
        }
    }
};

exports.eighthundredten = function (req, res) {
    var bearer = req.headers.authorization;
    if (!bearer) {
        res.json({ status: "400", message: "Bad Request!" });
    } else {
        var array = bearer.split(" ");
        if (array[1] != token60) {
            res.json({ status: "1007", message: "Unauthorized user!" });
        } else {
            var crnno = req.body.CRNNo,
                amtval = req.body.amount;
            var amt = parseFloat(req.body.amount);
            if ((crnno && conf.threehundredthirtytwo.CRNNo === "mandatory" && crnno.length == 8) &&
                (amt && conf.threehundredthirtytwo.amount === "mandatory" && amtval.length <= 9)) {
                request.post({
                    "headers": { "content-type": "application/json" },
                    "url": reqip + ":4114/v1/api/addmoneyValidation",
                    "body": JSON.stringify({
                        "crnno": crnno,
                        "totalamount": amt,
                        "ttype": "addMoney"
                    })
                }, (error, response, body) => {
                    if (error) {
                        return console.dir(error);
                    }
                    var newjson = JSON.parse(body);
                    res.json(newjson);
                });
            } else {
                res.json({
                    status: "1005",
                    message: 'Please Follow Fields Validation Documentation, your JSON structure is incorrect.'
                }
                )
            }
        }
    }
};

exports.eighthundredeleven = function (req, res) {
    var bearer = req.headers.authorization;
    if (!bearer) {
        res.json({ status: "400", message: "Bad Request!" });
    } else {
        var array = bearer.split(" ");
        if (array[1] != token60) {
            res.json({ status: "1007", message: "Unauthorized user!" });
        } else {
            var crnno = req.body.CRNNo,
                amtval = req.body.amount;
            var amt = parseFloat(req.body.amount);
            if ((crnno && conf.threehundredthirtytwo.CRNNo === "mandatory" && crnno.length == 8) &&
                (amt && conf.threehundredthirtytwo.amount === "mandatory" && amtval.length <= 9)) {
                request.post({
                    "headers": { "content-type": "application/json" },
                    "url": reqip + ":4114/v1/api/walletToBankValidation",
                    "body": JSON.stringify({
                        "crnno": crnno,
                        "amt": amt
                    })
                }, (error, response, body) => {
                    if (error) {
                        return console.dir(error);
                    }
                    var newjson = JSON.parse(body);
                    res.json(newjson);
                });
            } else {
                res.json({
                    status: "1005",
                    message: 'Please Follow Fields Validation Documentation, your JSON structure is incorrect.'
                }
                )
            }
        }
    }
};

exports.eighthundredtwelve = function (req, res) {
    var bearer = req.headers.authorization;
    if (!bearer) {
        res.json({ status: "400", message: "Bad Request!" });
    } else {
        var array = bearer.split(" ");
        if (array[1] != token1) {
            res.json({ status: "1007", message: "Unauthorized user!" });
        } else {
            var truID = req.body.truID;
            if (truID) {
                request.post({
                    "headers": { "content-type": "application/json" },
                    "url": reqip + ":4112/api/kycCheck",
                    "body": JSON.stringify(req.body)
                }, (error, response, body) => {
                    if (error) {
                        return console.dir(error);
                    }
                    var newjson = JSON.parse(body);
                    res.json(newjson);
                });
            } else {
                res.json({
                    status: "1005",
                    message: 'Please Follow Fields Validation Documentation, your JSON structure is incorrect.'
                }
                )
            }
        }
    }
};

exports.scan_cuqr = async function (req, res) {
    var bearer = req.headers.authorization;
    var array = bearer.split(" ");

    if (array[1] != conf.bearer8) {
        res.json({ status: "401", message: "Unauthorized user!" });
    } else {
        var qrcode = req.body.qrcode,
            truid = req.body.truID;
        if (qrcode && (truid && truid.length == 16 && truid.match(letterNumber))) {
            const hash = await qrdecrypted(qrcode, conf.enkey);
            if (hash.length > 1) {
                var getparam;
                if (hash[1] === "moent") {
                    getparam = getHash(hash[0]);
                }
                var qrbody = {
                    "mobile": getparam ? getparam.clientID : hash[0],
                    "truid": truid,
                    "type": hash[1]
                }
                request.post({
                    "headers": { "content-type": "application/json", "Authorization": bearer },
                    "url": reqip + ":4112/api/findconsumerQR",
                    "body": JSON.stringify(qrbody)
                }, (error, response, body) => {
                    if (error) {
                        res.json({ status: "400", message: "Internal Server Error" });
                    }
                    else {
                        var newjson = JSON.parse(body);
                        if (newjson.status == "200") {
                            if (newjson.type == "cu") {
                                const item = newjson.resource;
                                let items = {
                                    name: item.name,
                                    truID: item.truID ? item.truID : item.beneficiarytruID,
                                    image: item.image,
                                    ispayee: false,
                                    isfav: false,
                                    type: item.type,
                                    accType: "conusumer"
                                };
                                res.json({ status: "200", resource: items });
                            }
                            else if (newjson.type == "scanent") {
                                const item = newjson.resource;
                                let items = {
                                    name: item.name,
                                    truID: item.truID,
                                    image: item.image,
                                    ispayee: false,
                                    isfav: false,
                                    type: item.type,
                                    accType: "entity"
                                };
                                if (item.brandLogo) {
                                    items.image = item.brandLogo
                                }
                                res.json({ status: "200", resource: items });
                            }
                            else if (newjson.type == "moent") {
                                const item = newjson.resource;
                                let items = {
                                    name: item.name,
                                    truID: item.truID,
                                    image: item.image,
                                    ispayee: false,
                                    isfav: false,
                                    type: item.type,
                                    accType: "entity"
                                };
                                if (item.brandLogo) {
                                    items.image = item.brandLogo
                                }
                                if(getparam){
                                    items.params = getparam;
                                }
                                res.json({ status: "200", resource: items });
                            }
                        }
                        else {
                            res.json({ status: "411", message: 'Invalid QR Code' })
                        }
                    }
                });

            } else {
                res.json({ status: "411", message: 'Invalid QR Code' })
            }

        } else {
            res.json({
                status: "411",
                message: 'Invalid Request'
            }
            )
        }
    }
    function getHash(decryp) {
        try {
            var textSplit = decryp.split("~");
            var mepayElement = {};
            for (let j = 0; j < textSplit.length; j++) {
                var resultSplit = textSplit[j].split("=");
                mepayElement[resultSplit[0].toString()] = resultSplit[1].toString();
            }
            return mepayElement;
        }
        catch (ex) {
            return null;
        }
    }
    function qrdecrypted(data, key) {

        try {
            let enKey = cryptos.createHash('sha256').update(String(key)).digest('hex').substr(0, 32).toUpperCase();
            let iv = cryptos.createHash('sha256').update(String(key)).digest('hex').substr(0, 16).toUpperCase();
            var decipher = cryptos.createDecipheriv("aes-256-cbc", enKey, iv);
            var decrypted = decipher.update(data, "base64", "utf8");
            decrypted += decipher.final("utf8");
            return decrypted.split("#");
        }
        catch (ex) {
            return "";
        }
    }

};

exports.generateQR = async function (req, res) {
    var bearer = req.headers.authorization;
    var array = bearer.split(" ");

    if (array[1] != conf.bearer8) {
        res.json({ status: "401", message: "Unauthorized user!" });
    } else {
        var truid = req.body.truID,
            type = req.body.type,
            qrcode;

        if (type === "entity") {
            qrcode = req.body.truID + "#moent";
        } else if (type === "consumer") {
            qrcode = req.body.truID + "#cu";
        } else {
            qrcode = req.body.truID + "#scanent";
        }
        if (qrcode && (truid && truid.length == 16 && truid.match(letterNumber))) {
            const qrcodeGen = await encryption(qrcode, conf.enkey);
            function encryption(data, key) {
                try {
                    var clearEncoding = 'utf8';
                    var cipherEncoding = 'base64';
                    var cipherChunks = [];
                    let enKey = cryptos.createHash('sha256').update(String(key)).digest('hex').substr(0, 32).toUpperCase();
                    let iv = cryptos.createHash('sha256').update(String(key)).digest('hex').substr(0, 16).toUpperCase();
                    var cipher = cryptos.createCipheriv('aes-256-cbc', enKey, iv);
                    cipher.setAutoPadding(true);
                    cipherChunks.push(cipher.update(data, clearEncoding, cipherEncoding));
                    cipherChunks.push(cipher.final(cipherEncoding));
                    return cipherChunks.join('');
                }
                catch (ex) {
                    return "0";
                }
            }
            if (qrcodeGen == "0") {
                res.json({
                    status: "411",
                    message: 'Invalid Request'
                })
            }
            else {
                res.json({ status: "200", qrcode: qrcodeGen })
            }
        }
        else {
            res.json({
                status: "411",
                message: 'Invalid Request'
            })
        }
    }

};