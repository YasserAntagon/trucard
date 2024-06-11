'use strict';
var multer = require('multer');
var fs = require('fs');
var conf = require("../config");
const crypto = require('crypto'),
  path = require('path'),
  request = require('request');
var consumerProfPath = conf.consumerProfPath,
  token1 = conf.bearer1,
  reqippincode = conf.reqippincode;




function validateBearer(req, res, next) {
  var bearer = req.headers.authorization;
  if (!bearer) {
    res.json({ status: "400", message: "Bad Request!" });
  } else {
    next();
  }
};


module.exports = function (app) {
  let uploadprofile = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        var foldname = crypto.createHash('md5').update(req.body.CRNNo).digest("hex");
        let vpath = path.resolve(__dirname, consumerProfPath + foldname + "/");
        if (!fs.existsSync(vpath)) {
          fs.mkdirSync(vpath);
        }
        cb(null, vpath)
      },
      filename: (req, file, cb) => {
        let customFileName = Date.now().toString(),
          // fileExtension = file.originalname.split('.')[1];
          filename = file.originalname,
          lastDot = filename.lastIndexOf('.'),
          // orgfile = filename.substring(0, lastDot),
          fileExtension = filename.substring(lastDot + 1);
        cb(null, customFileName + '.' + fileExtension)
      }
    }),
    fileFilter: function (req, file, callback) {
      // var ext = file.originalname.split('.')[1];
      const filename = file.originalname;
      const lastDot = filename.lastIndexOf('.');
      const ext = filename.substring(lastDot + 1);
      if (ext !== 'jpg' && ext !== 'png' && ext !== 'jpeg' && ext !== 'gif') {
        return callback('Please upload valid files.');
      }
      callback(null, true)
    },
    limits: {
      fileSize: 1024 * 1024 * 1
    }
  }).array('photo');

  app.post('/1001', validateBearer, function (req, res, next) {
    var bearer = req.headers.authorization;
    if (!bearer) {
      res.json({ status: "400", message: "Bad Request!" });
    } else {
      var array = bearer.split(" ")

      if (array[1] != token1) {
        res.json({ status: "401", message: "Unauthorized user!" });
      } else {
        uploadprofile(req, res, function (err) {
          if (err) {
            res.json({
              status: "400",
              message: err
            });
          } else {
            uploadFiles(req)
          }
        })

        async function uploadFiles(req) {
          for (var i = 0; i < req.files.length; i++) {
            var fpath = crypto.createHash('md5').update(req.body.CRNNo).digest("hex") + "/";
            var formData = {
              truidup: req.body.truID,
              image: fpath + req.files[i].filename
            };
          }
          res.json({ status: "200", resource: formData });
        }
      }
    }

  });

  app.get('/1014', (req, res) => {
    var reqimage = path.resolve(__dirname, consumerProfPath + req.query.url),
      bitmap;
    if (fs.existsSync(reqimage)) {
      res.sendFile(reqimage)
    }
    else {
      res.sendFile(path.resolve(__dirname, consumerProfPath + "user.png"))
    }

  });

  app.post('/ifsc', function (req, res, next) {
    var bearer = req.headers.authorization;
    if (!bearer) {
      res.json({ status: "400", message: "Bad Request!" });
    } else {
      var array = bearer.split(" ")

      if (array[1] != token1) {
        res.json({ status: "401", message: "Unauthorized user!" });
      } else {
        var ifsc = req.body.IFSC;
        if (ifsc && ifsc.length == 11) {
          request.post({
            "headers": { "content-type": "application/json" },
            "url": reqippincode + ":3119/getifsc",
            "body": JSON.stringify({
              "ifsc": ifsc
            })
          }, (error, response, body) => {
            if (error) {
              return console.dir(error);
            }
            var newjson = JSON.parse(body);
            res.json(newjson);
          });
        }
        else {
          res.json({
            status: 205,
            message: "Please follow field validation."
          })
        }



      }

    }
  });
}