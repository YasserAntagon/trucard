var express = require('express');
var fs = require('fs');
var path = require('path')
var router = express.Router();
/* var kycdb = require("../../model/updatekycdb") */
/* var errLog = require('../../model/db/errLogDb'); */
/* var iterator = require('../insideIterator');
var linkagesurl = iterator(); */
var multer = require('multer');
var request = require('request');
var config = require('../../model/config/config');
var token = require('../../model/config/bearerToken');
var machinHash = require('../../model/config/machinHash');
var glob = require('glob');
/* 
let uploaddocumets = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, path.resolve(__dirname, '../../uploads/dataDoc') + "/")
        },
        filename: (req, file, cb) => {
            let customFileName = req.session.cutruID,
                fileExtension = file.originalname.split('.')[1], // get file extension from original file name
                orgfile = file.originalname.split('.')[0];
            cb(null, customFileName + orgfile + '.' + fileExtension)
        }
    }),
    fileFilter: function (req, file, callback) {
        var ext = file.originalname.split('.')[1];
        if (ext !== 'pdf' && ext !== 'jpg' && ext !== 'png' && ext !== 'jpeg') {
            return callback('Please upload valid files.');
        }
        callback(null, true)
    },
    limits: {
        fileSize: 1024 * 1024 * 1
    }
}).array('files');

router.post('/eUploadDoc', (req, res) => {
    try {
        if (req.session.aTruID) {
            uploaddocumets(req, res, function (err) {
                if (err) {
                    res.json({
                        status: "400",
                        message: err
                    });
                } else {
                    uploadFiles(req)
                }
            })
            var result = new Array();
            function uploadFilesToServer(formData, req) {
                request.post({
                    "headers": { "Authorization": "Bearer " + token.ApIsTokEn26 },
                    url: config.fileServer + '/1041', // call cloud file server url
                    formData: formData     // pass form data with files & Text data
                }, function (err, httpResponse, body) {
                    var respresult = JSON.parse(body);
                    if (err) {
                        res.json({ "status": "204", message: "Something went wrong!" })
                    } else {
                        if (respresult.status === "200") {
                            var arraysuccess = {};
                            arraysuccess["docNumber"] = respresult.resource[0].docNumber;
                            arraysuccess["docFile"] = respresult.resource[0].docFile;
                            arraysuccess["docTitle"] = respresult.resource[0].docTitle;
                            result.push(arraysuccess);

                            // remove files

                            if (result.length == 2) {
                                var json = JSON.stringify({
                                    "truID": req.session.cutruID,
                                    "kycDetails": result
                                });
                                kycdb.updateEntityDocument(json, function (err, response) {
                                    if (err) { errLog.insertErrorLog(err, req.session.etruID, "kyc.uploadDoc", "kycupdate"); };
                                    var bpath = path.resolve(__dirname, '../../uploads/dataDoc') + "/" + req.session.cutruID + "*";
                                    glob(bpath, function (er, files) {
                                        for (const file of files) {
                                            // remove file
                                            fs.unlinkSync(file);
                                        }
                                    })
                                    var sender = { "response": response, "linkages": linkagesurl.logout }
                                    res.send(sender);
                                });
                            }
                        }
                        else {
                            res.json({ "status": "204", message: "Invalid Data!" })
                        }
                    }

                })
            }
            async function uploadFiles(req) {
                for (var i = 0; i < req.files.length; i++) {
                    var formData = {
                        truID: req.session.cutruID,
                        CRNNo: req.session.ccrno,
                        "kycDocNums[]": req.body.kycDocNums[i],
                        "fileName[]": req.body.fileName[i],
                        lfilename: req.files[i].filename,
                        files: fs.createReadStream(path.resolve(__dirname, '../../uploads/dataDoc') + "/" + req.files[i].filename),
                        count: i,
                    };
                    await uploadFilesToServer(formData, req)
                }
            }
        } else {
            res.send({ status: 901, messege: "Your Document Verified, Your KYC status is Active!!" })
        }
    }
    catch (ex) {
        errLog.insertErrorLog(ex, req.session.aTruID, "eFileUpload", "routes/entity/eFileUpload");
    }
})
 */

let brandLogoUpload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, path.resolve(__dirname, '../../dataDoc') + "/")
        },
        filename: (req, file, cb) => {
            let customFileName = req.body.truID,
                fileExtension = file.originalname.split('.')[1], // get file extension from original file name
                orgfile = file.originalname.split('.')[0];
            cb(null, customFileName + orgfile + '.' + fileExtension)
        }
    }),
    fileFilter: function (req, file, callback) {
        var ext = file.originalname.split('.')[1];
        if (ext) {
            ext = ext.toLowerCase();
        }
        if (ext !== 'jpg' && ext !== 'png' && ext !== 'jpeg') {
            return callback('Please upload valid files.');
        }
        callback(null, true)
    },
    limits: {
        fileSize: 1024 * 1024 * 1
    }
}).array('photo');

router.post('/uploadBrandLogo', (req, res) => {
    try {
        if (req.session.aTruID) {
            brandLogoUpload(req, res, function (err) {
                if (err) {
                    res.json({
                        status: "400",
                        message: err
                    });
                } else {
                    uploadFiles(req)
                }
            })
            function uploadFilesToServer(formData, req) {
                request.post({
                    "headers": { "Authorization": "Bearer " + token.AdMiNfIlEuPlOaD3 },
                    url: config.cdn + '/4007', // call cloud file server url
                    formData: formData     // pass form data with files & Text data
                }, function (err, httpResponse, body) {
                    var respresult = JSON.parse(body);
                    if (err) {
                        res.json({ "status": "204", message: "Something went wrong!" })
                    } else {
                        if (respresult.status === "200") {
                            var arraysuccess = {
                                truID: req.session.aTruID,
                                rTruID: respresult.resource.truidup,
                                brandLogo: respresult.resource.image
                            };
                            var bpath = path.resolve(__dirname, '../../dataDoc' + "/" + req.body.truID + "*");
                            glob(bpath, function (er, files) {
                                for (const file of files) {
                                    // remove file
                                    fs.unlinkSync(file);
                                }
                            })
                            request.post({
                                "headers": { "content-type": "application/json", "mhash": machinHash.mHash },
                                "url": config.url + "/uploadBrandLogo",   //old api 203
                                "body": JSON.stringify(arraysuccess)
                            }, function (err, httpResponse, bodyF) {
                                if (err) {
                                    res.json({ "status": "204", message: "Something went wrong!" })
                                } else {
                                    req.session.eData ? (req.session.eData.brandLogo = arraysuccess.brandLogo) : null;
                                    res.json(JSON.parse(bodyF))
                                }
                            })
                        }
                        else {
                            res.json({ "status": "204", message: "Invalid Data!" })
                        }
                    }

                })
            }
            async function uploadFiles(req) {
                for (var i = 0; i < req.files.length; i++) {
                    var formData = {
                        truID: req.body.truID,
                        CRNNo: req.body.CRNNo,
                        photo: fs.createReadStream(path.resolve(__dirname, '../../dataDoc' + "/" + req.files[i].filename)),
                    };
                    await uploadFilesToServer(formData, req)
                }
            }
        } else {
            res.send({ status: 901, messege: "Your Document Verified, Your KYC status is Active!!" })
        }
    }
    catch (ex) {
        // errLog.insertErrorLog(ex, req.session.aTruID, "eFileUpload", "routes/entity/eFileUpload");
    }
})
module.exports = router;