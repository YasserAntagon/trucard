
'use strict'

var mongoose = require('mongoose'),
    request = require('request'),
    https = require('https'),
   ROTP = require('../models/truOTPModel'),
    LOTP = require('../models/truOTPLogModel'),
    KycAll = require('../models/adminKYCAllModel'),
    AuthKYC = require('../models/adminKYCAuthModel'),
    Gen = require('../Generics'),
    randomize = require('randomatic');

    var reqip = Gen.reqip;
//Test API
exports.test = function(req, res) {
  res.json({message : "Welcome to Company Api"});
};




exports.generate_otp = function(req, res) {

  let mobile = req.body.mobile,
  type =  req.body.type;

  request.post({
    "headers": { "content-type": "application/json" ,"Authorization" : "Bearer " + Gen.bearer140},
    "url": reqip + "140",
    "body": JSON.stringify({
      "mobile" : mobile,
    })
  }, (error,body) => {
    var body = JSON.parse(body.body);
    if(error) {
        return console.dir(error);
    }
if(body.status === "200"){
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

lotp.save(function(err) {
  if (err){
     res.json({
    status: "204",
    messege: "Something went wrong!"
  });
  }
    else {
     
 var respresult = ROTP.findOneAndUpdate({mobile : mobile},{$set:{ "mobile" : mobile, "OTP" : otp, "status" : "failure",
 "timeStamp" : date,"type" : type,"detail" : details}},{upsert : true})
 respresult.exec(function (err, result) {
   if (err){
     res.json({
    status: "204",
    messege: "Something went wrong!"
  });
   }
    else{
      var respresult = ROTP.find({"mobile" : mobile, "OTP" : otp, status : "failure","type" : type},function (err, doc) {
        if (err)
        {
          response.status(500).send({error : err})
          return next(err);
        }
         else{
           if(type === "mHash"){
            KycAll.findOneAndUpdate({$or:[{mobile:mobile},{email:mobile}]},{$set:{ machineHash : req.body.mhash,mHashVerified:false}}).exec();
           }
      res.json({ "status" : "201", "message" : 'OTP sent to mobile number',mobile :doc[0].mobile});
                   }
                 }
               )
             }
           }
         )
       }
     }
   )
    // }
 }else{
  res.json({
    status: "204",
    messege: "Something went wrong!"
  });
 }
}
)
}

/*
On PROD
exports.generate_otp_with_id = function(req, res) {
  let truid = req.body.truID,

  type =  req.body.type;


  KycAll.find({ truID:truid},{_id: 0, email : 1, mobile : 1}).exec(function(err, docs) {
  if (!docs.length) {
    res.json({ status: "204", messege: "User does not exist!"});
  } else {
  let mobile = docs[0].mobile;
  // otp =  req.body.otp,
  // details =  req.body.detail,

  request.post({
    "headers": { "content-type": "application/json" ,"Authorization" : "Bearer " + Gen.bearer130},
    "url": reqip + "140",
    "body": JSON.stringify({
      "mobile" : mobile,
    })
  }, (error,body) => {
    var body = JSON.parse(body.body);
    if(error) {
        return console.dir(error);
    }
if(body.status === "200"){
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
lotp.save(function(err) {
  if (err)
  {
    res.json({
      status: "204",
      messege: "Something went wrong!"
    });
  }
    else {
     
 var respresult = ROTP.findOneAndUpdate({mobile : mobile},{$set:{ "mobile" : mobile, "OTP" : otp, "status" : "failure",
 "timeStamp" : date,"type" : type,"detail" : details}},{upsert : true})
 respresult.exec(function (err, result) {
   if (err)
   {
    res.json({
      status: "204",
      messege: "Something went wrong!"
    });
   }
    else{
      var respresult = ROTP.find({"mobile" : mobile, "OTP" : otp, status : "failure","type" : type},function (err, doc) {
        if (err)
        {
          response.status(500).send({error : err})
          return next(err);
        }
         else{
      res.json({ "status" : "201", "message" : 'OTP sent to mobile number',mobile :doc[0].mobile});
                   }
                 }
               )
             }
           }
         )
       }
     }
   )
 }else{
  res.json({
    status: "204",
    messege: "Something went wrong!"
  });
 }
}
)
  }
}
  )
}
*/
//Prod api is above here
//On Demo




//Verify OTP for customer Transaction via Remmit
/*
exports.verify_otp_remmit = function(req, res) {

    var badd = new ROTP(req.user);
    var truid = req.body.truid;
    var otp = req.body.otp;
    var date = new Date();

    KycAll.find({truID : truid}, function (err, docs, result) {
     if (docs.length){
       var email = docs[0].email;
       var mobile = docs[0].mobile;

    ROTP.find({"mobile" : mobile,OTP : otp, type : "transaction",status : "failure"},function (err, docs){
    if (docs.length){
       var query = {mobile : mobile};
      var respresult = ROTP.findOneAndUpdate(query,{$set:{ "successDate" : date, status : "success"}},{upsert : true})
      respresult.exec(function (err, result) {
       if (err)
       {
         response.status(500).send({error : err})
         return next(err);
       }
    else{
      ROTP.aggregate([
        {$match : {mobile : mobile, OTP : otp, type : "transaction",status : "success"}},
        {$project : {mobile : 1,hash : 1, OTP : 1,successDate : 1,dateDifference: { $subtract: [ new Date(), "$timeStamp" ]}}},
        {$project : {mobile : 1, OTP : 1,hash : 1,successDate : 1,timeout : { $add: [ "$successDate", 5 * 60 * 1000 ] },dateDifference: 1,
        status:{$cond: { if: { $lte: [ "$dateDifference", 300000 ] }, then: "200", else: "400"}}}}
        ]).exec(function (err,result) {
          if (err)
          {
            response.status(500).send({error : err})
            return next(err);
          }
           else{
             var resource = result[0];
             res.json({resource:resource});
                }
              }
            )
          }
        }
      )
    }
    else{
      res.json({ resource : {status:"400",message: 'wrong mobile number or OTP' }});
        }
      }
    )
  }
      else{
        res.json({ resource : {status:"400",message: "TruID Doesn't Exists" }});
      }
    }
  )
}
*/


exports.verify_otp = function(req, res) {
  var mobile = req.body.mobile;
  var otp = req.body.otp;
  var type = req.body.type;
  var date = new Date();

  ROTP.find({mobile : mobile,OTP : otp, type : type,status : "failure"},function (err, docs){
  if (docs.length){
    var respresult = ROTP.findOneAndUpdate({mobile : mobile},{$set:{ "successDate" : date, status : "success"}},{upsert : true})
    respresult.exec(function (err, result) {
     if (err)
     {
       console.log(err);
       res.json({
          status: "204",
          messege: "Something went wrong!"
        });
     }
  else{
    ROTP.aggregate([
      {$match : {mobile : mobile, OTP : otp, type : type,status : "success"}},
      {$project : {mobile : 1,hash : 1, OTP : 1,successDate : 1,dateDifference: { $subtract: [ new Date(), "$timeStamp" ]}}},
      {$project : {mobile : 1, OTP : 1,hash : 1,successDate : 1,timeout : { $add: [ "$successDate", 5 * 60 * 1000 ] },dateDifference: 1,
      status:{$cond: { if: { $lte: [ "$dateDifference", 300000 ] }, then: "200", else: "400"}}}}
      ]).exec(function (err,result) {
        if (err){
           res.json({
            status: "204",
            messege: "Something went wrong!"
          });
        }
         else{
         
          KycAll.findOneAndUpdate({$or:[{mobile : mobile},{email : mobile}],machineHash : req.body.mhash},{$set:{ mHashVerified:true}}).exec();
           var resource = result[0];
           res.json({resource:resource});
              }
            }
          )
        }
      }
    )
  }
  else{
    res.json({ resource : {status:"400",message: 'wrong mobile number or OTP' }});
      }
    }
  )
}



exports.generate_otp_with_id = function(req, res) {
  let truid = req.body.truid,
  otp =  req.body.otp,
  details =  req.body.detail,
  type =  req.body.type;


  KycAll.find({ truID:truid},{_id: 0, email : 1, mobile : 1}).exec(function(err, docs) {
  if (!docs.length) {
    res.json({ status: "204", messege: "User does not exist!"});
  } else {
  let mobile = docs[0].mobile;

let lotp = new LOTP();
var date = new Date();
lotp.type = type;
lotp.status = "failure";
lotp.mobile = mobile;
lotp.OTP = otp;
lotp.createDate = date;
lotp.detail = details;
lotp.save(function(err) {
  if (err)
  {
    res.json({
      status: "204",
      messege: "Something went wrong!"
    });
  }
    else {
     
 var respresult = ROTP.findOneAndUpdate({mobile : mobile},{$set:{ "mobile" : mobile, "OTP" : otp, "status" : "failure",
 "timeStamp" : date,"type" : type,"detail" : details}},{upsert : true})
 respresult.exec(function (err, result) {
   if (err)
   {
    res.json({
      status: "204",
      messege: "Something went wrong!"
    });
   }
    else{
      var respresult = ROTP.find({"mobile" : mobile, "OTP" : otp, status : "failure","type" : type},function (err, doc) {
        if (err)
        {
          response.status(500).send({error : err})
          return next(err);
        }
         else{
      res.json({ "status" : "201", "message" : 'OTP sent to mobile number',mobile :doc[0].mobile});
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
}
)
  }

  exports.verify_otp_with_id = function(req, res) {

    var truid = req.body.truid;
    var otp = req.body.otp;
    var date = new Date();

    KycAll.find({ truID:truid},{_id: 0, email : 1, mobile : 1}).exec(function(err, docs) {
    if (!docs.length) {
      res.json({ status: "204", messege: "User does not exist!"});
    } else {
    let mobile = docs[0].mobile;

    ROTP.find({mobile : mobile,OTP : otp, $or:[{type : "transaction"},{type : "registration"},{type : "fPassword"}],status : "failure"},function (err, docs){
    if (docs.length){
       var query = {mobile : mobile};
      var respresult = ROTP.findOneAndUpdate(query,{$set:{ "successDate" : date, status : "success"}},{upsert : true})
      respresult.exec(function (err, result) {
       if (err){
         res.json({
    status: "204",
    messege: "Something went wrong!"
  });
       }
    else{
      ROTP.aggregate([
        {$match : {mobile : mobile, OTP : otp, $or:[{type : "transaction"},{type : "registration"},{type : "fPassword"}],status : "success"}},
        {$project : {mobile : 1,hash : 1, OTP : 1,successDate : 1,dateDifference: { $subtract: [ new Date(), "$timeStamp" ]}}},
        {$project : {mobile : 1, OTP : 1,hash : 1,successDate : 1,timeout : { $add: [ "$successDate", 5 * 60 * 1000 ] },dateDifference: 1,
        status:{$cond: { if: { $lte: [ "$dateDifference", 300000 ] }, then: "200", else: "400"}}}}
        ]).exec(function (err,result) {
          if (err){
             res.json({
    status: "204",
    messege: "Something went wrong!"
  });
          }
           else{
             var resource = result[0];
             res.json({resource:resource});
                }
              }
            )
          }
        }
      )
    }
    else{
      res.json({ resource : {status:"400",message: 'wrong mobile number or OTP' }});
        }
      }
    )
    }
  }
    )
  }

/* otp from 2 factor
exports.generate_otp_for_remmit = function(req, res) {

   var badd = new ROTP(req.user);
   var truid = req.body.truid;
   var otp =  randomize('0', 6);

   KycAll.find({truID : truid}, function (err, docs, result) {
    if (docs.length){
      var email = docs[0].email;
      var mobile = docs[0].mobile;

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
            console.log(details);
            var status = body.Status;

            insertotp(details,status);
            });
            });

            req.on('error', function(e) {
              console.log('problem with request: ' + e.message);
              });

             req.write('data\n');
             req.write('data\n');
             req.end();

     function insertotp (details,status) {

        var lotp = new LOTP(req.user);

        var query = {mobile : mobile};
        var date = new Date();

        lotp.type = "transaction";
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
        });

         var respresult = ROTP.findOneAndUpdate(query,{$set:{ "mobile" : mobile, "OTP" : otp, "status" : "failure",
         "timeStamp" : date,"type" : "transaction","detail" : details}},{upsert : true})
         respresult.exec(function (err, result) {
           if (err)
           {
             response.status(500).send({error : err})
             return next(err);
           }

            else{
              res.json({ "status" : "201", "message" : 'OTP sent to mobile number' });

             }
          });
        };
       }
   else{
     res.json({ status:"409",message: 'TruID Doesent Exists' });
     }
   })
} */



