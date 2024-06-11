
'use strict'

var mongoose = require('mongoose'),
  request = require('request'),
  https = require('https'),
  bcrypt = require('bcrypt'),
  salt = bcrypt.genSaltSync(10),


  ROTP = require('../models/truOTPModel'),
  LOTP = require('../models/truOTPLogModel'),
  KycAll = require('../models/custKYCAllModel'),
  AuthKYC = require('../models/custKYCAuthModel'),
  Gen = require('../Generics'),
  randomize = require('randomatic');
function genOTP() {
  return Gen.randomOTP ? randomize('0', 6) : "123456";
}

var reqip = Gen.reqip;
//Test API
exports.test = function (req, res) {
  res.json({ message: "Welcome to Company Api" });
};

//Generate OTP
/*
 OTP FROM 2FACTOR
exports.generate_otp_on_registration = function(req, res) {

      var badd = new ROTP(req.user);
      var mobile = req.body.mobile;
      var email = req.body.email;
      var otp =  randomize('0', 6);

  AuthKYC.find({ $or : [{"email" : email},{mobile : mobile}]}, function (err, docs) {
   if (!docs.length){
    var options = {

             "method": "GET",
             "hostname": "2factor.in",
             "port": null,
             //"path": "/API/V1/2537a610-dc1e-11e7-a328-0200cd936042/SMS/"+mobile+"/"+otp+"",
             "path": "/API/V1/2537a610-dc1e-11e7-a328-0200cd936042/SMS/"+mobile+"/"+otp+"/"+"truone"+"",
             "headers": {}

            };
             var req = https.request(options, function(res) {
             res.setEncoding('utf8');
             res.on('data', function (chunk) {
               var body = JSON.parse(chunk);
               var details = body.Details;
               var status = body.Status;

               insertotp(details,status);
            }
          )
        }
      )

        req.on('error', function(e) {
         console.log('problem with request: ' + e.message);
        }
      )

            req.write('data\n');
            req.write('data\n');
            req.end();
    function insertotp (details,status) {
          //   if (err)
          //   {
          //   res.send(err);
          // }

       var lotp = new LOTP(req.user);

       var query = {mobile : mobile};
       var date = new Date();

       lotp.type = "registration";
       lotp.status = "failure";
       lotp.mobile = mobile;
       lotp.OTP = otp;
       lotp.createDate = date;
       lotp.detail = details;
       lotp.detail = "Details";

      lotp.save(function(err) {
         if (err)
         {
           res.send(err);
           console.log(err)
         }
           else {
          console.log("log dump")
            }
          }
        )

        var respresult = ROTP.findOneAndUpdate(query,{$set:{ "mobile" : mobile, "OTP" : otp, "status" : "failure",
        "timeStamp" : date,"type" : "registration","detail" : details}},{upsert : true})
        respresult.exec(function (err, result) {
          if (err)
          {
            response.status(500).send({error : err})
            return next(err);
          }
           else{
             res.json({ "status" : "201", "message" : 'OTP sent to mobile number' });
            }
          }
        )
      }
    }
  else{
    res.json({ status:"409",message: 'User Already Exists!' });
      }
    }
  )
}

exports.generate_otp_for_fpassword = function(req, res) {

      var badd = new ROTP(req.user);
      var mobile = req.body.mobile;
      var email = req.body.mobile;
      var otp =  randomize('0', 6);

      AuthKYC.find({ $or : [{"email" : email},{"mobile" : mobile}]}, function (err, docs) {
       if (docs.length){
         KycAll.find({ $or : [{"email" : email},{"mobile" : mobile}]},{_id: 0, email : 1, mobile : 1,truID : 1})
         .exec(function(err, result) {
         if (err) {
           response.status(500).send({
             error: err
           })
           return next(err);
         } else {
           var resource = result;
           var email = result[0].email;
           var mobile = result[0].mobile;
           var truid = result[0].truID;

         var options = {
             "method": "GET",
             "hostname": "2factor.in",
             "port": null,
             "path": "/API/V1/2537a610-dc1e-11e7-a328-0200cd936042/SMS/"+mobile+"/"+otp+"/"+"truone"+"",
             "headers": {}
            };
             var req = https.request(options, function(res) {
             res.setEncoding('utf8');
             res.on('data', function (chunk) {
               var body = JSON.parse(chunk);
               var details = body.Details;
               var status = body.Status;

               insertotp(details,status,truid);
            }
          )
        }
      )
            req.on('error', function(e) {
             console.log('problem with request: ' + e.message);
            });
            req.write('data\n');
            req.end();

    ///////////////Email route call
        request.post({

         "url": "http://www.company.com/tsec/resetemail.php",
         form:    { email: email,otp: otp }
          },(error, response, body) => {
        if(error) {
          return console.dir(error);
            }
          }
        )
      }
    }
  )

    ////////////////////////
    function insertotp (details,status,truid) {

       var lotp = new LOTP(req.user);
       var query = {mobile : mobile};
       var date = new Date();

       lotp.type = "registration";
       lotp.status = "failure";
       lotp.mobile = mobile;
       lotp.OTP = otp;
       lotp.createDate = date;
       lotp.detail = details;
       var hash1 = details+truid;
       var hash = bcrypt.hashSync(hash1, salt);
       lotp.hash = hash;


      lotp.save(function(err) {
         if (err)
         {
           res.send(err);
           console.log(err)
         }
           else {
          console.log("log dump")
              }
            }
          )

        var respresult = ROTP.findOneAndUpdate(query,{$set:{ "mobile" : mobile, "OTP" : otp, "status" : "failure","hash" : hash,
        "timeStamp" : date,"type" : "registration","detail" : details}},{upsert : true})
        respresult.exec(function (err, result) {
          if (err)
          {
            response.status(500).send({error : err})
            return next(err);
          }
           else{
             res.json({ "status" : "201", "message" : 'OTP sent to mobile number',"mobile" : mobile });
                }
              }
            )
          }
        }
     else{
       res.json({ "status" : "400", "message" : 'this mobile doesnt Exists'});
      }
    }
  )
}

exports.generate_otp_entity_consumer_registration = function(req, res) {

      var badd = new ROTP(req.user);
      var mobile = req.body.mobile;
      var otp =  randomize('0', 6);

  AuthKYC.find({mobile : mobile}, function (err, docs) {
   if (!docs.length){
    var options = {

             "method": "GET",
             "hostname": "2factor.in",
             "port": null,
             //"path": "/API/V1/2537a610-dc1e-11e7-a328-0200cd936042/SMS/"+mobile+"/"+otp+"",
             "path": "/API/V1/2537a610-dc1e-11e7-a328-0200cd936042/SMS/"+mobile+"/"+otp+"/"+"truone"+"",
             "headers": {}

            };
             var req = https.request(options, function(res) {
             res.setEncoding('utf8');
             res.on('data', function (chunk) {
               var body = JSON.parse(chunk);
               var details = body.Details;
               var status = body.Status;

               insertotp(details,status);
            }
          )
        }
      )

        req.on('error', function(e) {
         console.log('problem with request: ' + e.message);
        }
      )

            req.write('data\n');
            req.write('data\n');
            req.end();

    function insertotp (details,status) {
          //   if (err)
          //   {
          //   res.send(err);
          // }

       var lotp = new LOTP(req.user);

       var query = {mobile : mobile};
       var date = new Date();

       lotp.type = "registration";
       lotp.status = "failure";
       lotp.mobile = mobile;
       lotp.OTP = otp;
       lotp.createDate = date;
       lotp.detail = details;

      lotp.save(function(err) {
         if (err)
         {
           res.send(err);
           console.log(err)
         }
           else {
          console.log("log dump")
            }
          }
        )

        var respresult = ROTP.findOneAndUpdate(query,{$set:{ "mobile" : mobile, "OTP" : otp, "status" : "failure",
        "timeStamp" : date,"type" : "registration","detail" : details}},{upsert : true})
        respresult.exec(function (err, result) {
          if (err)
          {
            response.status(500).send({error : err})
            return next(err);
          }
           else{
             res.json({ "status" : "201", "message" : 'OTP sent to mobile number' });
            }
          }
        )
      }
    }
  else{
    res.json({ status:"409",message: 'User Already Exists!' });
      }
    }
  )
}
*/


//OTP 123456
exports.generate_otp_on_registration = function (req, res) {

  var badd = new ROTP(req.user);
  var mobile = req.body.mobile;
  var email = req.body.email;
  // var otp =  randomize('0', 6);
  var otp = genOTP();

  AuthKYC.find({ $or: [{ "email": email }, { mobile: mobile }] }, function (err, docs) {
    if (!docs.length) {
      // var options = {
      //
      //          "method": "GET",
      //          "hostname": "2factor.in",
      //          "port": null,
      //          //"path": "/API/V1/2537a610-dc1e-11e7-a328-0200cd936042/SMS/"+mobile+"/"+otp+"",
      //          "path": "/API/V1/2537a610-dc1e-11e7-a328-0200cd936042/SMS/"+mobile+"/"+otp+"/"+"truone"+"",
      //          "headers": {}
      //
      //         };
      //          var req = https.request(options, function(res) {
      //          res.setEncoding('utf8');
      //          res.on('data', function (chunk) {
      //            var body = JSON.parse(chunk);
      //            var details = body.Details;
      //            var status = body.Status;
      //
      //            insertotp(details,status);
      //         }
      //       )
      //     }
      //   )
      //
      //     req.on('error', function(e) {
      //      console.log('problem with request: ' + e.message);
      //     }
      //   )
      //
      //         req.write('data\n');
      //         req.write('data\n');
      //         req.end();

      function insertotp(details, status) {
        //   if (err)
        //   {
        //   res.send(err);
        // }

        var lotp = new LOTP(req.user);

        var query = { mobile: mobile };
        var date = new Date();

        lotp.type = "registration";
        lotp.status = "failure";
        lotp.mobile = mobile;
        lotp.OTP = otp;
        lotp.createDate = date;
        lotp.detail = details;
        lotp.detail = "Details";

        lotp.save(function (err) {
          if (err) {
            res.send(err);
            console.log(err)
          }
          else {
            console.log("log dump")
          }
        }
        )

        var respresult = ROTP.findOneAndUpdate(query, {
          $set: {
            "mobile": mobile, "OTP": otp, "status": "failure",
            "timeStamp": date, "type": "registration", "detail": details
          }
        }, { upsert: true })
        respresult.exec(function (err, result) {
          if (err) {
            response.status(500).send({ error: err })
            return next(err);
          }
          else {
            res.json({ "status": "201", "message": 'OTP sent to mobile number' });
          }
        }
        )
      }
      insertotp();
    }
    else {
      res.json({ status: "409", message: 'User Already Exists!' });
    }
  }
  )
}

//OTP 123456
exports.generate_otp_for_fpassword = function (req, res) {

  var badd = new ROTP(req.user);
  var mobile = req.body.mobile;
  var email = req.body.mobile;
  // var otp =  randomize('0', 6);
  var otp = genOTP();

  AuthKYC.find({ $or: [{ "email": email }, { "mobile": mobile }] }, function (err, docs) {
    if (docs.length) {
      KycAll.find({ $or: [{ "email": email }, { "mobile": mobile }] }, { _id: 0, email: 1, mobile: 1, truID: 1 })
        .exec(function (err, result) {
          if (err) {
            response.status(500).send({
              error: err
            })
            return next(err);
          } else {
            var resource = result;
            var email = result[0].email;
            var mobile = result[0].mobile;
            var truid = result[0].truID;

            insertotp("Details", "failure", truid);


            request.post({
              "url": "http://www.company.com/tsec/resetemail.php",
              form: { email: email, otp: otp }
            }, (error, response, body) => {
              if (error) {
                return console.dir(error);
              }
            })
          }
        })


      function insertotp(details, status, truid) {

        var lotp = new LOTP(req.user);
        var query = { mobile: mobile };
        var date = new Date();

        lotp.type = "registration";
        lotp.status = "failure";
        lotp.mobile = mobile;
        lotp.OTP = otp;
        lotp.createDate = date;
        lotp.detail = details;
        var hash1 = details + truid;
        var hash = bcrypt.hashSync(hash1, salt);
        lotp.hash = hash;


        lotp.save(function (err) {
          if (err) {
            res.send(err);
            console.log(err)
          }
          else {
            console.log("log dump")
          }
        }
        )

        var respresult = ROTP.findOneAndUpdate(query, {
          $set: {
            "mobile": mobile, "OTP": otp, "status": "failure", "hash": hash,
            "timeStamp": date, "type": "registration", "detail": details
          }
        }, { upsert: true })
        respresult.exec(function (err, result) {
          if (err) {
            response.status(500).send({ error: err })
            return next(err);
          }
          else {
            res.json({ "status": "201", "message": 'OTP sent to mobile number', "mobile": mobile });
          }
        }
        )
      }
    }
    else {
      res.json({ "status": "400", "message": 'this mobile doesnt Exists' });
    }
  }
  )
}

//OTP 123456
exports.generate_otp_entity_consumer_registration = function (req, res) {

  var badd = new ROTP(req.user);
  var mobile = req.body.mobile;
  // var otp =  randomize('0', 6);
  var otp = genOTP();

  AuthKYC.find({ mobile: mobile }, function (err, docs) {
    if (!docs.length) {

      insertotp("Details", status);

      function insertotp(details, status) {
        var lotp = new LOTP(req.user);

        var query = { mobile: mobile };
        var date = new Date();

        lotp.type = "registration";
        lotp.status = "failure";
        lotp.mobile = mobile;
        lotp.OTP = otp;
        lotp.createDate = date;
        lotp.detail = details;

        lotp.save(function (err) {
          if (err) {
            res.send(err);
            console.log(err)
          }
          else {
            console.log("log dump")
          }
        }
        )

        var respresult = ROTP.findOneAndUpdate(query, {
          $set: {
            "mobile": mobile, "OTP": otp, "status": "failure",
            "timeStamp": date, "type": "registration", "detail": details
          }
        }, { upsert: true })
        respresult.exec(function (err, result) {
          if (err) {
            response.status(500).send({ error: err })
            return next(err);
          }
          else {
            res.json({ "status": "201", "message": 'OTP sent to mobile number' });
          }
        }
        )
      }
    }
    else {
      res.json({ status: "409", message: 'User Already Exists!' });
    }
  }
  )
}



exports.generate_otp_for_directconsumer = function (req, res) {

  let mobile = req.body.mobile,
    type = req.body.type;

  request.post({
    "headers": { "content-type": "application/json", "Authorization": "Bearer " + Gen.bearer130 },
    "url": reqip + "130",
    "body": JSON.stringify({
      "mobile": mobile,
      "type": type
    })
  }, (error, body) => {
    // console.log(body);
    var body = JSON.parse(body.body);
    if (error) {
      return console.dir(error);
    }
    if (body.status === "200") {
      var otp = body.OTP;
      var details = body.details;

      let lotp = new LOTP();
      var date = new Date();
      lotp.type = type;
      lotp.status = "failure";
      lotp.mobile = mobile;
      lotp.OTP = otp;
      lotp.createDate = date;
      lotp.detail = details;
      lotp.save(function (err) {
        if (err) {
          res.json({
            status: "204",
            message: "Something went wrong!"
          });
        }
        else {

          var respresult = ROTP.findOneAndUpdate({ mobile: mobile }, {
            $set: {
              "mobile": mobile, "OTP": otp, "status": "failure",
              "timeStamp": date, "type": type, "detail": details
            }
          }, { upsert: true })
          respresult.exec(function (err, result) {
            if (err) {
              res.json({
                status: "204",
                message: "Something went wrong!"
              });
            }
            else {
              var respresult = ROTP.find({ "mobile": mobile, "OTP": otp, status: "failure", "type": type }, function (err, doc) {
                if (err) {
                  response.status(500).send({ error: err })
                  return next(err);
                }
                else {
                  res.json({ "status": "201", "message": 'OTP sent to mobile number', mobile: doc[0].mobile });
                }
              }
              )
            }
          }
          )
        }
      }
      )
    } else {
      res.json({
        status: "204",
        message: "Something went wrong!"
      });
    }
  }
  )
}

exports.generate_otp_for_remmit = function (req, res) {

  let mobile = req.body.mobile,
    otp = genOTP(),
    email = req.body.email,
    type = req.body.type,
    isemailverification = req.body.isemailverification,
    appflag = req.body.appflag;

  if (isemailverification) {
    LOTP.aggregate([
      { $match: { email: email, type: type } },
      { $project: { _id: 0, email: 1, createDate: 1, successDate: 1, type: 1, dateDifference: { $subtract: [new Date(), "$createDate"] } } },
      { $project: { status: { $cond: { if: { $lte: ["$dateDifference", 900000] }, then: "200", else: "400" } } } },
      { $match: { status: "200" } },
      { $group: { _id: null, myCount: { $sum: 1 } } },
      { $project: { _id: 0, status: { $cond: { if: { $lt: ["$myCount", 100] }, then: "200", else: "400" } } } }
    ]).exec(function (err, otpcounts) {
      if (err) {
        res.json({ status: 500, message: "Internal Server Error" });
      }
      else if (!otpcounts.length || otpcounts[0].status === "200") {


        request.post({
          "headers": { "content-type": "application/json", "Authorization": "Bearer " + Gen.beareremailotp },
          "url": Gen.reqemailip + "sendOTPEmail",
          "body": JSON.stringify({
            "mailTo": email,
            "name": req.body.name,
            "otp": otp
          })
        }, (error, body) => {
          // console.log(body);
          var body = JSON.parse(body.body);
          if (error) {
            return console.dir(error);
          }
        })

        var details = "mail send to email id " + email;

        let lotp = new LOTP();
        var date = new Date();
        lotp.type = type;
        lotp.status = "failure";
        lotp.email = email;
        lotp.mobile = mobile;
        lotp.OTP = otp;
        lotp.createDate = date;
        lotp.detail = details;
        lotp.save(function (err) {
          if (err) {
            console.log(err)
            res.json({
              status: "204",
              message: "Something went wrong!"
            });
          }
          else {
            var respresult = ROTP.findOneAndUpdate({ email: email }, {
              $set: {
                "email": email, "OTP": otp, "status": "failure",
                "timeStamp": date, "type": type, "detail": details

              }
            }, { upsert: true })
            respresult.exec(function (err, result) {
              if (err) {
                res.json({
                  status: "204",
                  message: "Something went wrong!"
                });
              }
              else {
                var respresult = ROTP.find({ "email": email, "OTP": otp, status: "failure", "type": type }, function (err, doc) {
                  if (err) {
                    response.status(500).send({ error: err })
                    return next(err);
                  }
                  else {
                    res.json({ "status": "200", "message": 'OTP sent to your email..!!', email: doc[0].email });
                  }
                })
              }
            })
          }
        })
      }
      else {
        res.json({ status: 204, message: "You have exceeds your OTP Limit..!" });
      }
    })
  } else {
    LOTP.aggregate([
      { $match: { mobile: mobile, type: type } },
      { $project: { _id: 0, mobile: 1, createDate: 1, successDate: 1, type: 1, dateDifference: { $subtract: [new Date(), "$createDate"] } } },
      { $project: { status: { $cond: { if: { $lte: ["$dateDifference", 900000] }, then: "200", else: "400" } } } },
      { $match: { status: "200" } },
      { $group: { _id: null, myCount: { $sum: 1 } } },
      { $project: { _id: 0, status: { $cond: { if: { $lt: ["$myCount", 100] }, then: "200", else: "400" } } } }
    ]).exec(function (err, otpcounts) {
      if (err) {
        res.json({ status: 500, message: "Internal Server Error" });
      }
      else if (!otpcounts.length || otpcounts[0].status === "200") {
        request.post({
          "headers": { "content-type": "application/json", "Authorization": "Bearer " + Gen.bearer130 },
          "url": reqip + "130",
          "body": JSON.stringify({
            "mobile": mobile,
            "appflag": appflag,
            "type": type
          })
        }, (error, body) => {
          // console.log(body);
          var body = JSON.parse(body.body);
          if (error) {
            return console.dir(error);
          }
          if (body.status === "200") {
            var otp = body.OTP;
            var details = body.details;

            let lotp = new LOTP();
            var date = new Date();
            lotp.type = type;
            lotp.status = "failure";
            lotp.mobile = mobile;
            lotp.OTP = otp;
            lotp.createDate = date;
            lotp.detail = details;
            lotp.save(function (err) {
              if (err) {
                res.json({
                  status: "204",
                  message: "Something went wrong!"
                });
              }
              else {

                var respresult = ROTP.findOneAndUpdate({ mobile: mobile }, {
                  $set: {
                    "mobile": mobile, "OTP": otp, "status": "failure",
                    "timeStamp": date, "type": type, "detail": details

                  }
                }, { upsert: true })
                respresult.exec(function (err, result) {
                  if (err) {
                    res.json({
                      status: "204",
                      message: "Something went wrong!"
                    });
                  }
                  else {
                    var respresult = ROTP.find({ "mobile": mobile, "OTP": otp, status: "failure", "type": type }, function (err, doc) {
                      if (err) {
                        response.status(500).send({ error: err })
                        return next(err);
                      }
                      else {
                        res.json({ "status": "201", "message": 'OTP sent to mobile number', mobile: doc[0].mobile });
                      }
                    })
                  }
                })
              }
            })
          } else {
            res.json({
              status: "204",
              message: "Something went wrong!"
            });
          }
        }
        )
      }
      else {
        res.json({ status: 204, message: "You have exceeds your OTP Limit..!" });
      }
    })
  }
}

exports.verify_otp_remmit = function (req, res) {

  var badd = new ROTP(req.user);
  var mobile = req.body.mobile;
  var email = req.body.email;
  var otp = req.body.otp;
  var date = new Date();
  var query = {};
  if (mobile) {
    query["mobile"] = mobile
  } else if (email) {
    query["email"] = email
  }
  console.log(query)
  ROTP.find({
    $or: [query], OTP: otp, status: "failure"
  }, function (err, docs) {
    if (docs.length) {
      var respresult = ROTP.findOneAndUpdate({ $or: [query] }, { $set: { "successDate": date, status: "success" } }, { upsert: true })
      respresult.exec(function (err, result) {
        if (err) {
          response.status(500).send({ error: err })
          return next(err);
        }
        else {
          ROTP.aggregate([
            { $match: { $or: [query], OTP: otp, status: "success" } },
            { $project: { mobile: 1, email: 1, hash: 1, OTP: 1, successDate: 1, dateDifference: { $subtract: [new Date(), "$timeStamp"] } } },
            {
              $project: {
                mobile: 1, email: 1, OTP: 1, hash: 1, successDate: 1, timeout: { $add: ["$successDate", 5 * 60 * 1000] }, dateDifference: 1,
                status: { $cond: { if: { $lte: ["$dateDifference", 300000] }, then: "200", else: "400" } }
              }
            }
          ]).exec(function (err, result) {
            if (err) {
              response.status(500).send({ error: err })
              return next(err);
            }
            else {
              var resource = result[0];
              res.json({ resource: resource });
            }
          }
          )
        }
      }
      )
    }
    else {
      res.json({ resource: { status: "400", message: 'wrong mobile number or OTP' } });
    }
  }
  )
}


//Verify OTP
exports.veriFy_otp_on = function (req, res) {
  var badd = new ROTP(req.user);
  var mobile = req.body.mobile;
  var otp = req.body.otp;
  var date = new Date();

  ROTP.find({ "mobile": mobile, OTP: otp, type: "registration", status: "failure" }, function (err, docs) {
    if (docs.length) {
      var query = { mobile: mobile };
      var respresult = ROTP.findOneAndUpdate(query, { $set: { "successDate": date, status: "success" } }, { upsert: true })
      respresult.exec(function (err, result) {
        if (err) {
          response.status(500).send({ error: err })
          return next(err);
        }

        else {
          ROTP.aggregate([
            { $match: { mobile: mobile, OTP: otp, type: "registration", status: "success" } },
            { $project: { mobile: 1, hash: 1, OTP: 1, successDate: 1, dateDifference: { $subtract: [new Date(), "$timeStamp"] } } },
            {
              $project: {
                userName: "$mobile", OTP: 1, successDate: 1, timeout: { $add: ["$successDate", 5 * 60 * 1000] }, dateDifference: 1,
                status: { $cond: { if: { $lte: ["$dateDifference", 300000] }, then: { status: 200, hash: "$hash" }, else: { status: 400 } } }
              }
            }
          ]).exec(function (err, result) {
            if (err) {
              response.status(500).send({ error: err })
              return next(err);
            }
            else {
              var resource = result[0];
              res.json({ resource: resource });
            }
          }
          )
        }
      }
      )
    }
    else {
      res.json({ status: "400", message: 'wrong mobile number or OTP' });
    }
  }
  )
}


exports.verify_otp_session = function (req, res) {
  var badd = new ROTP(req.user);
  var hash = req.body.hash;

  ROTP.find({ "hash": hash, status: "success" }, function (err, docs) {
    if (docs.length) {

      ROTP.aggregate([
        { $match: { hash: hash, status: "success" } },
        { $project: { successDate: 1, _id: 0, dateDifference: { $subtract: [new Date(), "$successDate"] } } },
        {
          $project: {
            timeout: { $add: ["$successDate", 5 * 60 * 1000] },
            status: { $cond: { if: { $lte: ["$dateDifference", 300000] }, then: 200, else: 400 } }
          }
        },
        { $project: { status: 1 } }
      ]).exec(function (err, result) {
        if (err) {
          response.status(500).send({ error: err })
          return next(err);
        }
        else {
          res.json(result[0]);
        }
      }
      )
    }
    else {
      res.json({ status: "400", message: 'wrong mobile number or OTP' });
    }
  }
  )
}




exports.generate_otp_mobility = function (req, res) {
  var badd = new ROTP(req.user);
  var mobile = req.body.mobile;
  var type = req.body.type;
  // var otp =  randomize('0', 6);
  var otp = genOTP();

  AuthKYC.find({ "mobile": mobile }, function (err, docs) {
    if (type === "registration") {
      if (!docs.length) {
        sendOTP(0);
      } else {
        res.json({ "status": "201", "message": 'OTP sent to mobile number', "mobile": mobile });
      }
    } else {
      if (docs.length) {
        KycAll.find({ "mobile": mobile }, { _id: 0, email: 1, mobile: 1, truID: 1 })
          .exec(function (err, result) {
            if (err) {
              res.json({ "status": "204", "message": 'Something went wrong!' });
            } else {
              var resource = result;
              var email = result[0].email;
              var mobile = result[0].mobile;
              var truid = result[0].truID;
              sendOTP(truid);
            }
          }
          )
      }
      else {
        res.json({ status: "400", message: 'This user does not exists!' });
      }
    }


    function sendOTP(truid) {
      //    var options = {
      //        "method": "GET",
      //        "hostname": "2factor.in",
      //        "port": null,
      //        "path": "/API/V1/2537a610-dc1e-11e7-a328-0200cd936042/SMS/"+mobile+"/"+otp+"/"+"truone"+"",
      //        "headers": {}
      //       };
      //        var req = https.request(options, function(res) {
      //        res.setEncoding('utf8');
      //        res.on('data', function (chunk) {
      //          var body = JSON.parse(chunk);
      //          var details = body.Details;
      //          var status = body.Status;
      //
      //          insertotp(details,status,truid);
      //       }
      //     )
      //   }
      // )
      //       req.on('error', function(e) {
      //        console.log('problem with request: ' + e.message);
      //       });
      //       req.write('data\n');
      //       req.end();
      insertotp("Details", "failure", truid);

      ///////////////Email route call
      // request.post({

      //  "url": "http://www.company.com/tsec/resetemail.php",
      //  form:    { email: email,otp: otp }
      //   },(error, response, body) => {
      // if(error) {
      //   return console.dir(error);
      //     }
      //   }
      // )
    }
    function insertotp(details, status, truid) {

      var lotp = new LOTP(req.user);
      var query = { mobile: mobile };
      var date = new Date();

      lotp.type = type;
      lotp.status = "failure";
      lotp.mobile = mobile;
      lotp.OTP = otp;
      lotp.createDate = date;
      lotp.detail = details;
      var hash1 = details + truid;
      var hash = bcrypt.hashSync(hash1, salt);
      lotp.hash = hash;


      lotp.save(function (err) {
        if (err) {
          res.send(err);
          console.log(err)
        }
        else {
          console.log("log dump")
        }
      }
      )
      console.log("query", query)
      var respresult = ROTP.findOneAndUpdate(query, {
        $set: {
          "mobile": mobile, "OTP": otp, "status": "failure", "hash": hash,
          "timeStamp": date, "type": type, "detail": details
        }
      }, { upsert: true })
      respresult.exec(function (err, result) {
        if (err) {
          response.status(500).send({ error: err })
          return next(err);
        }
        else {
          res.json({ "status": "201", "message": 'OTP sent to mobile number', "mobile": mobile });
        }
      }
      )
    }
  }
  )
}



exports.verify_otp_mobility = function (req, res) {
  var mobile = req.body.mobile,
    otp = req.body.otp,
    type = req.body.type,
    date = new Date();

  ROTP.find({ "mobile": mobile, OTP: otp, type: type, status: "failure" }, function (err, docs) {
    if (docs.length) {
      var query = { mobile: mobile };
      var respresult = ROTP.findOneAndUpdate(query, { $set: { "successDate": date, status: "success" } }, { upsert: true })
      respresult.exec(function (err, result) {
        if (err) {
          response.status(500).send({ error: err })
          return next(err);
        }

        else {
          ROTP.aggregate([
            { $match: { mobile: mobile, OTP: otp, type: type, status: "success" } },
            { $project: { mobile: 1, hash: 1, OTP: 1, successDate: 1, dateDifference: { $subtract: [new Date(), "$timeStamp"] } } },
            {
              $project: {
                userName: "$mobile", OTP: 1, successDate: 1, timeout: { $add: ["$successDate", 5 * 60 * 1000] }, dateDifference: 1,
                status: { $cond: { if: { $lte: ["$dateDifference", 300000] }, then: { status: 200, hash: "$hash" }, else: { status: 400 } } }
              }
            }
          ]).exec(function (err, result) {
            if (err) {
              response.status(500).send({ error: err })
              return next(err);
            }
            else {

              if (result[0].status.status === 200) {
                res.json({ status: "200", message: "OTP verfied successfully." });
              } else {
                res.json({ status: "400", message: 'wrong mobile number or OTP' });
              }
            }
          }
          )
        }
      }
      )
    }
    else {
      res.json({ status: "400", message: 'wrong mobile number or OTP' });
    }
  }
  )
}


exports.generate_otp_for_email = function (req, res) {
  let email = req.body.email,
    mobile = req.body.mobile,
    type = req.body.type,
    name = req.body.name,
    // otp = 123456
    otp = genOTP();

  var reqJson = {
    "mailTo": email,
    "name": name,
    "otp": otp
  }
  console.log(reqJson);

  request.post({
    "headers": { "content-type": "application/json", "Authorization": "Bearer " + Gen.beareremailotp },
    "url": Gen.reqemailip + "sendOTPEmail",
    "body": JSON.stringify(reqJson)
  }, (error, body) => {
    var body = JSON.parse(body.body);
    console.log(body);
    if (error) {
      return console.dir(error);
    }
  });

  var details = "mail send to email id " + email;

  let lotp = new LOTP();
  var date = new Date();
  lotp.type = type;
  lotp.status = "failure";
  lotp.email = email;
  lotp.mobile = mobile;
  lotp.OTP = otp;
  lotp.createDate = date;
  lotp.detail = details;
  lotp.save(function (err) {
    if (err) {
      console.log(err)
      res.json({
        status: "204",
        message: "Something went wrong!"
      });
    }
    else {

      var respresult = ROTP.findOneAndUpdate({ mobile: mobile }, {
        $set: {
          "mobile": mobile, "OTP": otp, "status": "failure",
          "timeStamp": date, "type": type, "detail": details

        }
      }, { upsert: true })
      respresult.exec(function (err, result) {
        if (err) {
          res.json({
            status: "204",
            message: "Something went wrong!"
          });
        }
        else {
          var respresult = ROTP.find({ "mobile": mobile, "OTP": otp, status: "failure", "type": type }, function (err, doc) {
            if (err) {
              response.status(500).send({ error: err })
              return next(err);
            }
            else {
              res.json({ "status": "200", "message": 'Verification code send to your email..!!', email: doc[0].email });
            }
          }
          )
        }
      }
      )
    }
  }
  )
}

exports.otp_verify_for_email = function (req, res) {

  var mobile = req.body.mobile;
  var otp = req.body.otp;
  var date = new Date();

  ROTP.find({ mobile: mobile, OTP: otp, $or: [{ type: "email" }], status: "failure" }, function (err, docs) {
    if (docs.length) {
      var query = { mobile: mobile };
      var respresult = ROTP.findOneAndUpdate(query, { $set: { "successDate": date, status: "success" } }, { upsert: true })
      respresult.exec(function (err, result) {
        if (err) {
          response.status(500).send({ error: err })
          return next(err);
        }
        else {
          ROTP.aggregate([
            { $match: { mobile: mobile, OTP: otp, $or: [{ type: "email" }], status: "success" } },
            { $project: { mobile: 1, hash: 1, OTP: 1, successDate: 1, dateDifference: { $subtract: [new Date(), "$timeStamp"] } } },
            {
              $project: {
                mobile: 1, OTP: 1, hash: 1, successDate: 1, timeout: { $add: ["$successDate", 5 * 60 * 1000] }, dateDifference: 1,
                status: { $cond: { if: { $lte: ["$dateDifference", 300000] }, then: "200", else: "400" } }
              }
            }
          ]).exec(function (err, result) {
            if (err) {
              response.status(500).send({ error: err })
              return next(err);
            }
            else {
              var resource = result[0];
              if (resource.status == "200") {
                res.json({ status: "200", message: "Email verified successfully" });
              } else {
                res.json({ status: resource.status, message: "Invalid OTP" });
              }
            }
          }
          )
        }
      }
      )
    }
    else {
      res.json({ status: "400", message: 'wrong mobile number or OTP' });
    }
  }
  )
}
