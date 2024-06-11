
'use strict'
var request = require('request');
var conf = require("../config");
var fs = require('fs');
var path = require('path')
var multer = require('multer');
var glob = require('glob');
var clientCuValidation = require('../config/clientValidationFileUpload');
var tokenUpdate = require("../config/tokenUpdate");
exports.fourHundredNineteen = function (req, res) {
    var truid = req.truID;
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
    if ((truid && truid.length == 16 && truid.match(letterNumber)) &&
        (pin && pin.length == 6) &&
        (city && city.length >= 0 && city.length <= 50) &&
        (state && state.length >= 0 && state.length <= 50) &&
        (country && country.length >= 0 && country.length <= 50)) {
        request.post({
            "headers": { "content-type": "application/json" },
            "url": conf.reqip + ":4112/api/clientAddressUpdate",
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
                res.status(500).json({ status: "500", message: "Internal server error..!!" });
            }
            else {
                if (response.statusCode === 200) {
                    var newjson = JSON.parse(body);
                    res.json(newjson);
                }
                else {
                    var newjson = JSON.parse(body);
                    res.json(newjson);
                }
            }

        });
    } else {
        res.status(411).json({ status: "411", message: "Please provide valid fields..!!" })
    }

};

exports.fourHundredTwenty = function (req, res) {
    let uploaddocumets = multer({
        storage: multer.diskStorage({
            destination: (req, file, cb) => {
                let vpath = path.resolve(__dirname, '../../uploads/dataDoc') + "/";
                if (!fs.existsSync(vpath)) {
                    fs.mkdirSync(vpath);
                }
                cb(null, vpath)
            },
            filename: (req, file, cb) => {
                let customFileName = Date.now().toString(),
                    filename = file.originalname,
                    lastDot = filename.lastIndexOf('.'),
                    fileExtension = filename.substring(lastDot + 1);
                cb(null, customFileName + '.' + fileExtension)
            }
        }),
        fileFilter: function (req, file, callback) {
            clientCuValidation.clientval(req, res, function (cbs) {
                if (cbs == "ok") {
                    if (req.body.fileName === "AADHAAR" || req.body.fileName === "PAN" || req.body.fileName === "PASSPORT" || req.body.fileName === "VOTERID" || req.body.fileName === "DRIVING") {
                        if ((req.body.fileName === "AADHAAR" && req.body.kycDocNums && req.body.kycDocNums.length == 12) ||
                            (req.body.fileName === "PAN" && req.body.kycDocNums && req.body.kycDocNums.length == 10) ||
                            (req.body.fileName === "PASSPORT" && req.body.kycDocNums && req.body.kycDocNums.length == 12) ||
                            (req.body.fileName === "VOTERID" && req.body.kycDocNums && req.body.kycDocNums.length == 10) ||
                            (req.body.fileName === "DRIVING" && req.body.kycDocNums && isdriving(req.body.kycDocNums))) {
                            if (req.body.fileName === "AADHAAR" || req.body.fileName === "VOTERID") {
                                const filename = file.originalname;
                                const lastDot = filename.lastIndexOf('.');
                                const ext = filename.substring(lastDot + 1);
                                if (ext !== 'jpg' && ext !== 'png' && ext !== 'jpeg') {
                                    return callback('Please upload valid files.');
                                }
                                if (req.files.length <= 2) {
                                    callback(null, true)
                                } else {
                                    callback("Please upload both front and back side of document");
                                }
                            }
                            else {
                                if (req.files.length === 1) {
                                    const filename = file.originalname;
                                    const lastDot = filename.lastIndexOf('.');
                                    const ext = filename.substring(lastDot + 1);
                                    if (ext !== 'jpg' && ext !== 'png' && ext !== 'jpeg') {
                                        return callback('Please upload valid files.');
                                    }
                                    callback(null, true)
                                }
                                else {
                                    callback("Only one file allowed..!!");
                                }
                            }
                        }
                        else {
                            return callback('Invalid document number..!!');
                        }
                    } else {
                        callback("Invalid File Name..!!");
                    }
                }
                else {
                    callback(cbs)
                }
            });
        },
        limits: {
            fileSize: 1024 * 1024 * 1 // file size
        }
    }).array('files');

    uploaddocumets(req, res, function (err) {

        if (err) {
            res.status(411).json({
                status: "411",
                message: err
            });
        } else {
            uploadFiles(req)
        }
    })
    var result = new Array();
    function uploadFilesToServer(formData, req) {
        var CRNNo = req.body.CRNNo;
        request.post({
            "headers": { "Authorization": "Bearer " + conf.bearer9 },
            url: conf.cdn + '/8011', // call cloud file server url
            formData: formData     // pass form data with files & Text data
        }, function (err, httpResponse, body) {
            var respresult = JSON.parse(body);
            if (err) {
                res.status(411).json({ "status": "411", message: "Something went wrong!" })
            }
            else {
                if (respresult.status === "1000") {
                    var arraysuccess = {};
                    arraysuccess["docNumber"] = respresult.resource[0].docNumber;
                    arraysuccess["docFile"] = respresult.resource[0].docFile;
                    arraysuccess["docBackUrl"] = respresult.resource[0].docTitle == "AadhaarCard" || respresult.resource[0].docTitle == "VOTERID" || respresult.resource[0].docTitle == "PASSPORT" ? respresult.resource[0].docBackUrl : undefined;
                    arraysuccess["docTitle"] = respresult.resource[0].docTitle;
                    result.push(arraysuccess);
                    request.post({
                        "headers": { "content-type": "application/json" },
                        "url": conf.reqip + ":4112/api/updatekycdocsforindividual",
                        "body": JSON.stringify({
                            "truid": CRNNo,
                            "kycdetails": result,
                            "flag": "consumer"
                        })
                    }, (error, response, body) => {
                        if (error) {
                            return console.dir(error);
                        }
                        var newjson = JSON.parse(body);

                        if (newjson.status === "200") {
                            var bpath = path.resolve(__dirname, '../../uploads/dataDoc') + "/" + CRNNo + "*";
                            glob(bpath, function (er, files) {
                                for (const file of files) {
                                    fs.unlinkSync(file);
                                }
                            })
                            res.send({ status: "1000", message: "document uploaded successfully..!!" });
                        }
                        else {
                            res.status(411).send(newjson);
                        }
                    });
                }
                else {
                    res.status(411).json({ "status": "411", message: "Invalid Data!" })
                }
            }

        })
    }
    function uploadFiles(req) {

        if (req.files.length <= 0) {
            res.status(411).json({ "status": "411", message: "Please upload document file" })
        }
        else if ((req.body.fileName == "AADHAAR" || req.body.fileName == "VOTERID" || req.body.fileName == "PASSPORT")) {
            if (req.files.length != 2) {
                res.status(411).json({ "status": "411", message: "Please upload both front and back side of document" })
            }
            else {
                dataUpload(req)
            }
        }
        else if ((req.body.fileName == "PAN" || req.body.fileName == "DRIVING")) {
            if (req.files.length != 1) {
                res.status(411).json({ "status": "411", message: "Please upload front side of document" })
            }
            else {
                dataUpload(req)
            }
        } else {
            res.status(411).json({ "status": "411", message: "Please upload document file" })
        }
    }
    async function dataUpload(req) {
        var files = new Array()
        files.push(fs.createReadStream(path.resolve(__dirname, '../../uploads/dataDoc') + "/" + req.files[0].filename));
        if (req.body.fileName == "AADHAAR" || req.body.fileName == "VOTERID" || req.body.fileName == "PASSPORT") {
            files.push(fs.createReadStream(path.resolve(__dirname, '../../uploads/dataDoc') + "/" + req.files[1].filename));
        }
        var formData = {
            CRNNo: req.body.CRNNo,
            "kycDocNums": req.body.kycDocNums,
            "fileName": req.body.fileName == "AADHAAR" ? "AadhaarCard" : req.body.fileName,
            "files": files,
            "count": 0,
        };
        await uploadFilesToServer(formData, req)
    }
}

function isdriving(drive) {
    if (drive.length == 15) {
        return true
    }
    else {
        return false
    }
}

exports.fourHundredTwentyOne = function (req, res) {
    var truid = req.truID;
    var letterNumber = /^[0-9]+$/;
    if ((truid && truid.length == 16 && truid.match(letterNumber)) && req.body.docType === "AADHAAR" || req.body.docType === "PAN" || req.body.digitalKYC) {
        /// decrypt digital KYC
        
        
        request.post({
            "headers": { "content-type": "application/json" },
            "url": conf.reqip + ":4112/api/consumerdigitalkyc",
            "body": JSON.stringify({
                "truid": truid,
                "docType": req.body.docType === "AADHAAR" ? "AadhaarCard" : req.body.docType,
                "digitalKYC": req.body.digitalKYC
            })
        }, (error, response, body) => {
            if (error) {
                res.status(500).json({ status: "500", message: "Internal server error..!!" });
            }
            else {
                if (response.statusCode === 200) {
                    var newjson = JSON.parse(body);
                    if (newjson.resource.status == "200") {
                        tokenUpdate(req);
                    }
                    res.status(200).json(newjson);
                } else {
                    res.status(response.statusCode || 204).json(newjson);
                }
            }
        });
    }
    else {
        res.status(411).json({ status: "411", message: "Please provide valid fields..!!" })
    }
}
exports.fourHundredTwentyThree = function (req, res) {
    var truid = req.truID;
    var rtruid = req.rtruid;
    //  console.log("rtruid",rtruid)
    var letterNumber = /^[0-9]+$/;
    if ((truid && truid.length == 16 && truid.match(letterNumber)) && req.body.kycFlag === "active") {
        request.post({
            "headers": { "content-type": "application/json" },
            "url": conf.reqip + ":4112/api/consumerkycActivate",
            "body": JSON.stringify({
                "truid": truid,
                "rtruid": rtruid,
                "kycflag": "active"
            })
        }, (error, response, body) => {
            if (error) {
                res.status(500).json({ status: "500", message: "Internal server error..!!" });
            }
            else {
                if (response.statusCode === 200) {
                    var newjson = JSON.parse(body);
                    if (newjson.status == "1000") {
                        tokenUpdate(req);
                    }
                    res.status(200).json(newjson);
                } else {
                    res.status(response.statusCode || 204).json(newjson);
                }
            }
        });
    }
    else {
        res.status(411).json({ status: "411", message: "Please provide valid fields..!!" })
    }
}