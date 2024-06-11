
'use strict'

var mongoose = require('mongoose'),
  request = require('request'),
  fs = require('fs'),

  KycAll = require('../models/adminKYCAllModel'), //having all the require fields for kyc discrimination
  AuthKYC = require('../models/adminKYCAuthModel'), //having all the require fields for kyc discrimination
  Dept = require('../models/departmentModel'), //having all the require fields for kyc discrimination
  EmpBank = require('../models/empBankModel'), //having all the require fields for kyc discrimination
  Company = require('../models/companyModel'),
  Location = require('../models/companyLocationModel'),
  Group = require('../models/groupModel'),
  ChargeLog = require('../models/chargesLogModel'),
  Gen = require("../Generics"),
  conf = require("../config"),
  KYC = mongoose.model('KycAll');

var bcrypt = require('bcrypt');
var salt = bcrypt.genSaltSync(10);
var randomize = require('randomatic');
exports.test = function (req, res) {
  res.json({ message: "Welcome to Company Admin Api" });
};
exports.ins_registration = function (req, res) {
  var auth = new AuthKYC(req.user);
  var empReg = new KycAll();
  var hashtwo = bcrypt.hashSync(req.body.password, salt);
  var crnno = randomize('A0', 7);
  var crnNo = 'c'.concat(crnno);
  var truid = randomize('0', 12);
  var truId = '1000'.concat(truid);
  var email = req.body.email;
  var mobile = req.body.mobile;
  auth.email = email;
  auth.mobile = mobile;
  auth.CRNNo = crnNo;
  auth.password = hashtwo;
  auth.isPwdReset = false;
  auth.modifyDate = new Date();
  auth.isTPinReset = false;
  empReg.email = email;
  if (req.body.countryCode != undefined) { empReg.countryCode = req.body.countryCode }
  empReg.title = req.body.title;
  empReg.fName = req.body.fName;
  empReg.mName = req.body.mName ? req.body.mName : "";
  empReg.lName = req.body.lName;
  empReg.landLine = req.body.landline;
  empReg.empCode = req.body.empCode;
  empReg.department = req.body.department;
  empReg.mobile = mobile;
  empReg.CRNNo = crnNo;
  empReg.truID = truId;
  empReg.type = req.body.type;
  empReg.branchID = req.body.branchID;
  empReg.modifyDate = new Date();
  empReg.channel = 'Direct';
  empReg.createDate = new Date();
  empReg.createUser = 'User';
  empReg.image = "0";
  empReg.status = "active";
  AuthKYC.find({ $or: [{ "email": email }, { mobile: req.body.mobile }] }, function (err, docs) {
    if (!docs.length) {
      auth.save(function (err) {
        if (err) { res.send(err); }
        else {
          IsAuth();
        }
      });
    }

    else {
      res.json({ status: "409", message: 'User Already Exists!' }); // means He can either able to login or in case new reg he need to use new email
    }

    function IsAuth() {
      KycAll.find({ $or: [{ "email": email }, { mobile: req.body.mobile }] }, function (err, docs) {
        if (!docs.length) {
          empReg.save(function (err) {
            if (err) {
              res.json({ status: "500", message: 'Internal Server Error..!!' });
            }
            else {
              res.json({ status: "200", message: 'Employee Created Successfully!', truID: truId });
            }
          });
        }
        else {
          res.json({ status: "400", message: 'Employee account already exists' });
        }
      })
    }
  })
}

exports.login_window = function (req, res) {
  var email = req.body.email
  var query = AuthKYC.find({ email: email }).select({ isPwdReset: 1, isTPinReset: 1, password: 1, '_id': 0 });
  console.log("login")
  KYC.findOne({ email: req.body.email }, function (err, user) {
    query.exec(function (err, result) {
      if (err == null && result == '') {
        res.json({ status: "204", message: 'Invalid Username' });
      }
      else {
        var array = result;
        var ispwd = result[0].isPwdReset;
        var istpinreset = result[0].isTPinReset;
        var parray = array.pop();
        var finalhash = parray.password;
        if (bcrypt.compareSync(req.body.password, finalhash)) {
          if (ispwd === true) {
            callback(istpinreset);
          } else {
            res.json({ status: "206", messege: "Please reset your password." });
          }
        }
        else {
          res.json({ status: "204", message: 'Invalid Username' });
        }

        async function callback() {
          var query1 = { email: email };
          var result = await KycAll.find(query1);
          if (result.length > 0) {
            res.json({ status: "200", resource: result[0] });
          } else {
            res.json({ status: "400", message: "no record found" });
          }
        }
      }
    }
    )
  }
  )
}



exports.update_transaction_pin = function (req, res) {

  var truid = req.body.truid;

  KycAll.find({ "truID": truid }, function (err, docs) {
    if (!docs.length) {
      res.json({ status: "204", messege: "User not found!!" });
    } else {

      var crnno = docs[0].CRNNo;
      var pinhash = bcrypt.hashSync(req.body.tpin, salt);

      AuthKYC.findOneAndUpdate({ CRNNo: crnno }, { $set: { tPIN: pinhash, isTPinReset: true } }, function (err, docs) {
        if (err) {
          res.json({
            status: "204",
            messege: "Something went wrong."
          });
        } else {
          res.json({
            status: "200",
            messege: "Transaction PIN Updated Successfully."
          });
        }
      }
      )
    }
  }
  )
}


exports.verify_transaction_pin = function (req, res) {

  var truid = req.body.truid;

  KycAll.find({
    "truID": truid
  }, function (err, docs) {
    if (!docs.length) {
      res.json({
        status: "204",
        messege: "No entity found."
      });
    } else {
      var crnno = docs[0].CRNNo;

      AuthKYC.find({ CRNNo: crnno, __t: "Auth" }, { tPIN: 1, _id: 0 }, function (err, result) {
        if (err) {
          res.json({
            status: "204",
            messege: "Something went wrong."
          });
        } else {
          var parray = result.pop();
          var finalhash = parray.tPIN;

          if (bcrypt.compareSync(req.body.tpin, finalhash)) {
            res.json({
              status: "200",
              messege: "Transaction PIN Verified Successfully."
            });
          } else {
            res.json({
              status: "204",
              messege: "Wrong Transaction PIN. Please Try Again."
            });
          }
        }
      }
      )
    }
  }
  )
}




exports.update_image = function (req, res) {
  var badd = new KycAll(req.user);

  var truid = req.body.truid;
  var image = req.body.image;
  // var path = "http://company.com/truAdmin/profile"
  // var fimage = path.concat(image)
  var query = { truID: truid };

  KycAll.find(
    query, function (err, docs) {
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {
        KycAll.update(query, { $set: { image: image, modifyDate: Date.now() } }, callback)
        function callback(err, numAffected) {
          if (err)
            res.send(err);
          KycAll.aggregate([{ "$match": { truID: truid } }, {
            "$project": {
              _id: 0,
              image: 1
            }
          }]).exec(function (err, result) {
            if (err) {
              response.status(500).send({ error: err })
              return next(err);
            }
            else {
              res.json({ status: "200", image: image });
            }
          }
          )
        }
      }
    }
  )
}


exports.update_address = function (req, res) {
  var badd = new KycAll(req.user);
  var truid = req.body.truid;
  var query = { truID: truid };


  KycAll.findOneAndUpdate(query, {
    $set:
    {
      status: "active", modifyDate: Date.now(),
      contactAddress: {
        houseNumber: req.body.housenumber, streetNumber: req.body.streetnumber, landmark: req.body.landmark,
        pin: req.body.pin, city: req.body.city, state: req.body.state, country: req.body.country,
        location: { type: "Point", coordinates: [req.body.longitude, req.body.latitude] }
      },
      permanentAddress: {
        houseNumber: req.body.phousenumber, streetNumber: req.body.pstreetnumber, landmark: req.body.plandmark,
        pin: req.body.ppin, city: req.body.pcity, state: req.body.pstate, country: req.body.pcountry
      }
    }
  }, callback)

  function callback(err, numAffected) {
    if (err) {
      res.send(err);
    }
    else {
      res.json({ status: "200", message: "Address Updated Successfully." });
    }
  };
}


exports.list_profile = function (req, res) {
  var truid = req.body.truid;
  var date = new Date(Date.parse(req.body.date));
  KycAll.find({ truID: truid }, function (err, docs) {
    if (!docs.length) {
      res.json({
        status: "204",
        message: 'The request was successful but no TruID was returned.'
      });
    }
    else {
      var query;
      if (date === "all") {
        query = "";
      } else {
        query = { $match: { modifyDate: { $gte: date } } };
      }
      KycAll.aggregate([query,
        {
          $project: {
            _id: 0, countryCode: 1, title: 1, department: 1, gender: 1, status: 1, DOB: 1, createDate: 1, joiningDate: 1, landLine: 1,
            contactAddress: 1, permanentAddress: 1, modifyDate: 1, email: 1, fName: 1, mName: 1, lName: 1, skillset: 1, branchID: 1,
            empCode: 1, mobile: 1, truID: 1, image: { $concat: [Gen.profile, "$image"] }
          }
        },
        {
          $lookup: {
            from: "empbanks",
            localField: "truID",
            foreignField: "truID",
            as: "bank"
          }
        },
        { $unwind: { path: "$bank", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 0, countryCode: 1, title: 1, department: 1, gender: 1, status: 1, DOB: 1, createDate: 1, joiningDate: 1, landLine: 1,
            contactAddress: 1, permanentAddress: 1, modifyDate: 1, email: 1, fName: 1, mName: 1, lName: 1, skillset: 1, branchID: 1,
            empCode: 1, mobile: 1, truID: 1, image: { $concat: [Gen.profile, "$image"] }, IFSC: "$bank.IFSC",
            accountNo: "$bank.accountNo", bankName: "$bank.bankName"
          }
        }
      ]).exec(function (err, result) {
        if (err) {
          res.json({ status: "204", message: "Something went worng!" });
        }
        else {
          if (result.length > 0) {
            res.json({ status: "200", resource: result });
          } else {
            res.json({ status: "204", message: "No Data Found!" })
          }
        }
      }
      )
    }
  }
  )
}




exports.update_reg = function (req, res) {
  var truid = req.body.truid;

  KycAll.find({
    truID: truid
  }, function (err, docs) {
    if (!docs.length) {
      res.json({
        status: "204",
        messege: "The request was successful but no body was returned."
      });
    }
    else {
      AuthKYC.findOneAndUpdate({ CRNNo: docs[0].CRNNo }, { $set: { mobile: req.body.mobile } }).exec();

      KycAll.findOneAndUpdate({ truID: req.body.truid },
        {
          $set: {
            mobile: req.body.mobile,
            fName: req.body.fname,
            mName: req.body.mname,
            lName: req.body.lname,
            DOB: req.body.DOB,
            gender: req.body.gender,
            type: req.body.type,
            empCode: req.body.empcode,
            title: req.body.title,
            landLine: req.body.landline,
            branchID: req.body.branchid,
            joiningDate: req.body.joiningdate,
            skillset: req.body.skillset,
            modifyDate: Date.now()
          }
        }, callback)

      function callback(err, numAffected) {
        if (err) {
          res.send(err);
        }
        else {
          res.json({ status: "200", message: "Details Updated Successfully." });
        }
      };
    }
  }
  )
}


exports.update_emp_email = function (req, res) {
  var truid = req.body.truid;

  KycAll.find({
    truID: truid
  }, function (err, docs) {
    if (!docs.length) {
      res.json({
        status: "204",
        messege: "The request was successful but no body was returned."
      });
    }
    else {
      AuthKYC.findOneAndUpdate({ CRNNo: docs[0].CRNNo }, { $set: { email: req.body.email } }).exec();

      KycAll.findOneAndUpdate({ truID: req.body.truid },
        { $set: { email: req.body.email, modifyDate: Date.now() } }, callback)

      function callback(err, numAffected) {
        if (err) {
          res.send(err);
        }
        else {
          res.json({ status: "200", message: "Details Updated Successfully." });
        }
      }
    }
  }
  )
}


exports.list_profile_truid = function (req, res) {
  var badd = new KycAll(req.user);
  var truid = req.body.truid;
  KycAll.find({ truID: truid }, function (err, docs) {
    if (!docs.length) {
      res.json({
        status: "204",
        message: 'The request was successful but no TruID was returned.'
      });
    }
    else {
      KycAll.aggregate([{ $match: { truID: truid } },
      {
        $project: {
          _id: 0, countryCode: 1, title: 1, gender: 1, status: 1, DOB: 1, createDate: 1, joiningDate: 1, landLine: 1,
          contactAddress: 1, permanentAddress: 1, modifyDate: 1, email: 1, fName: 1, mName: 1, lName: 1, skillset: 1,
          empCode: 1, mobile: 1, truID: 1, image: { $concat: [Gen.profile, "$image"] }
        }
      }
      ]).exec(function (err, result) {
        if (err) {
          response.status(500).send({ error: err })
          return next(err);
        }
        else {
          var resource = result;
          res.json({ status: "200", resource: resource });
        }
      }
      )
    }
  }
  )
}


exports.change_password = function (req, res) {
  var auth = new AuthKYC(req.user);
  var email = req.body.email;
  var query = KycAll.findOne({ email: email }, { _id: 0, __t: 0, CRNNo: 1 });
  //removed KYCFlag in filter

  query.exec(function (err, result) {
    if (result == null) {
      res.json({ status: "401", resource: "unAuthorised User" });
    }
    else {
      var crnno = result.CRNNo;
      var query_auth = AuthKYC.findOne({ CRNNo: crnno }, { _id: 0, password: 1 });
      query_auth.exec(function (err, result) {
        if (result == null) {
          res.json({ status: "401", resource: "unAuthorised User" });
        }
        else {
          var pwd = result.password;
          var query_up = { "CRNNo": crnno }
          var hashtwo = bcrypt.hashSync(req.body.newpassword, salt);

          var updatepwd = AuthKYC.findOneAndUpdate(query_up, { "$set": { "password": hashtwo, "isPwdReset": true, modifyDate: Date.now() } });
          updatepwd.exec(function (err, result) {
            if (err) {
              response.status(500).send({ error: err })
              return next(err);
            }
            else {
              res.json({ status: 200, resource: "password updated" })
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


exports.ins_department = function (req, res) {

  var truid = req.body.truid;

  var deptname = req.body.deptname;
  var subdeptid = req.body.subdeptid;
  var deptdesc = req.body.deptdesc;

  KycAll.find(
    { truID: truid, status: "active" }, function (err, docs) {
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {
        var deptid = req.body.deptid;
        if (deptid === undefined) {
          var deptId = randomize('0', 4);
          var deptid = '1000'.concat(deptId);
          Dept.findOneAndUpdate({ deptID: deptid, deptName: deptname, deptDesc: deptdesc },
            { $addToSet: { subDeptID: subdeptid } }, { upsert: true }, callback);
        }
        else {
          Dept.findOneAndUpdate({ deptID: deptid },
            { $push: { subDeptID: subdeptid } }, callback);
        }
        function callback(err, numAffected) {
          if (err) {
            res.send(err);
          }
          else {
            Dept.aggregate([{ "$match": { deptID: deptid } }, {
              "$project": {
                _id: 0,
                deptID: 1, deptName: 1, subDeptID: 1, deptDesc: 1
              }
            }]).exec(function (err, result) {
              if (err) {
                response.status(500).send({ error: err })
                return next(err);
              }
              else {
                res.json({ status: "200", resource: result[0] });
              }
            }
            )
          }
        }
      }
    }
  )
}


exports.update_bank_details = function (req, res) {
  var query = { truID: req.body.truid };

  KycAll.find(
    query, function (err, docs) {
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {
        EmpBank.findOneAndUpdate(query, {
          $set:
            { bankName: req.body.bankname, IFSC: req.body.IFSC, accountNo: req.body.accountno, modifyDate: Date.now() }
        }, callback);

        function callback(err, result) {
          if (err) {
            res.send(err);
          }
          else {
            res.json({ status: "200", message: "Company Bank Details Updated Successfully." });
          }
        }
      }
    }
  )
}


exports.update_emp_doc = function (req, res) {
  var truid = req.body.truid;
  console.log(req.body.empdoc);

  KycAll.find(
    { truID: truid }, function (err, docs) {
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {
        KycAll.findOneAndUpdate({ truID: truid }, {
          $addToSet:
            { empDoc: req.body.empdoc }
        }, callback);
        KycAll.findOneAndUpdate({ truID: truid }, {
          $set:
            { modifyDate: Date.now() }
        }).exec();

        function callback(err, result) {
          if (err) {
            res.send(err);
          }
          else {
            res.json({ status: "200", message: "Employee Details Updated Successfully." });
          }
        }
      }
    }
  )
}


/////////////////////Company_Details//////////////////////////////
exports.ins_company_registration = function (req, res) {
  var company = new Company();

  var truid = randomize('0', 12);
  var truId = '1111'.concat(truid);

  var email = req.body.email

  company.email = email;
  company.mobile = req.body.mobile;
  company.truID = truId;
  if (req.body.countrycode != undefined) { company.countryCode = req.body.countrycode }
  company.companyName = req.body.companyname;
  company.shortName = req.body.shortname;
  company.FAX = req.body.fax;
  company.PAN = req.body.pan;
  company.GSTINNo = req.body.gstinno;
  company.companyDesc = req.body.companydesc;
  company.companyRegNo = req.body.companyregno;
  company.regDate = req.body.regdate;
  company.telephone = req.body.landline;
  // company.refernceTruID = req.body.referncetruid;


  Company.find({ $or: [{ "email": email }, { mobile: req.body.mobile }] }, function (err, docs) {
    if (!docs.length) {
      company.save(function (err) {
        if (err)
          res.send(err);
        //res.json({ status:"201",message: 'User KYC Created!' });
        else {
          res.json({ status: "200", message: 'Company Created!', truID: truId });
        }
      });
    }

    else {
      res.json({ status: "409", message: 'Company Already Exists!' }); // means He can either able to login or in case new reg he need to use new email
    }
  }
  )
}


exports.update_company_address = function (req, res) {
  var badd = new Company(req.user);
  var query = { truID: req.body.truid };

  Company.find(
    query, function (err, docs) {
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {
        Company.findOneAndUpdate(query, {
          $set:
          {
            contactAddress: {
              houseNumber: req.body.housenumber, streetNumber: req.body.streetnumber, landmark: req.body.landmark,
              pin: req.body.pin, city: req.body.city, state: req.body.state, country: req.body.country, display: true,
              location: { type: "Point", coordinates: [req.body.longitude, req.body.latitude] }
            },
            companyOperationAddress: {
              houseNumber: req.body.phousenumber, streetNumber: req.body.pstreetnumber, landmark: req.body.plandmark,
              pin: req.body.ppin, city: req.body.pcity, state: req.body.pstate, country: req.body.pcountry, display: false
            }
          }
        }, callback);

        function callback(err, result) {

          if (err) {
            res.send(err);
          }
          else {
            res.json({ status: "200", message: "Address for Company Updated Successfully." });
          }
        }
      }
    }
  )
}



exports.update_company_bank_details = function (req, res) {
  var badd = new Company(req.user);
  var query = { truID: req.body.truid };

  Company.find(
    query, function (err, docs) {
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {
        Company.findOneAndUpdate(query, {
          $set:
            { bankDetails: { bankName: req.body.bankname, IFSC: req.body.IFSC, accountNo: req.body.accountno } }
        }, callback);

        function callback(err, result) {

          if (err) {
            res.send(err);
          }
          else {
            res.json({ status: "200", message: "Company Bank Details Updated Successfully." });
          }
        }
      }
    }
  )
}



exports.list_company_profile = function (req, res) {
  var badd = new KycAll(req.user);
  var truid = req.body.truid;

  Company.aggregate([
    {
      $project: {
        status: 1, truID: 1, mobile: 1, companyName: 1, email: 1, shortName: 1, FAX: 1, _id: 0, PAN: 1,
        GSTINNo: 1, companyDesc: 1, companyRegNo: 1, regDate: 1, companyOperationAddress: 1, contactAddress: 1,
        bankDetails: 1, "landLine": "$telephone"
      }
    }
  ]).exec(function (err, result) {
    if (err) {
      response.status(500).send({ error: err })
      return next(err);
    }
    else {
      var resource = result[0];
      res.json({ status: "200", resource: resource });
    }
  }
  )
}


exports.update_company_registration_details = function (req, res) {
  var badd = new Company(req.user);
  var query = { truID: req.body.truid };

  Company.find(
    query, function (err, docs) {
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {
        Company.findOneAndUpdate(query, {
          $set:
          {
            countryCode: req.body.countrycode, email: req.body.email, mobile: req.body.mobile, companyName: req.body.companyname,
            shortName: req.body.shortname, FAX: req.body.fax, PAN: req.body.pan, GSTINNo: req.body.gstinno, telephone: req.body.landline,
            companyDesc: req.body.companydesc, companyRegNo: req.body.companyregno, regDate: req.body.regdate
          }
        }, callback);

        function callback(err, result) {

          if (err) {
            res.send(err);
          }
          else {
            res.json({ status: "200", message: "Company Details Updated Successfully." });
          }
        }
      }
    }
  )
}


///////////////Company Locations(Branch details)///////////////////////////////



exports.ins_company_branch_registration = function (req, res) {
  var location = new Location();

  var truid = randomize('0', 12);
  var truId = '1112'.concat(truid);

  var email = req.body.email

  location.email = email;
  location.mobile = req.body.mobile;
  location.truID = truId;
  if (req.body.countrycode != undefined) { location.countryCode = req.body.countrycode }
  location.referenceTruID = req.body.referencetruid;
  location.branchName = req.body.branchname;
  location.FAX = req.body.fax;
  location.purpose = req.body.purpose;
  location.description = req.body.description;
  location.regDate = req.body.regdate;
  location.refernceTruID = req.body.referncetruid;
  location.propertyDetails = req.body.propertydetails;
  location.telephone = req.body.landLine;
  location.companyTruID = req.body.companytruid;
  location.modifyDate = Date.now();
  Location.find({ $or: [{ "email": email }, { mobile: req.body.mobile }] }, function (err, docs) {
    if (!docs.length) {
      location.save(function (err) {
        if (err)
          res.send(err);
        //res.json({ status:"201",message: 'User KYC Created!' });
        else {
          res.json({ status: "200", message: 'Branch Created!', truID: truId });
        }
      });
    }

    else {
      res.json({ status: "409", message: 'Mobile or email already exists!' }); // means He can either able to login or in case new reg he need to use new email
    }
  }
  )
}


exports.update_company_branch_address = function (req, res) {
  var query = { truID: req.body.truid };

  Location.find(
    query, function (err, docs) {
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {
        Location.findOneAndUpdate(query, {
          $set:
          {
            modifyDate: Date.now(),
            contactAddress: {
              houseNumber: req.body.housenumber, streetNumber: req.body.streetnumber, landmark: req.body.landmark,
              pin: req.body.pin, city: req.body.city, state: req.body.state, country: req.body.country,
              location: { type: "Point", coordinates: [req.body.longitude, req.body.latitude] }
            }
          }
        }, callback);

        function callback(err, result) {

          if (err) {
            res.send(err);
          }
          else {
            res.json({ status: "200", message: "Address for Company Updated Successfully." });
          }
        }
      }
    }
  )
}


exports.update_company_branch_property_details = function (req, res) {
  var badd = new Company(req.user);
  var query = { truID: req.body.truid };

  Location.find(
    query, function (err, docs) {
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {
        Location.findOneAndUpdate(query, {
          $set:
          {
            modifyDate: Date.now(),
            rented: {
              ownerName: req.body.ownername, ownerAddress: req.body.owneraddress, area: req.body.area,
              maintainance: req.body.maintainance, rent: req.body.rent, deposit: req.body.deposit,
              ownerMobileNo: req.body.ownermobileno, rentAggrementDoc: req.body.rentaggrementdoc
            },
            owned: { area: req.body.oarea, maintainance: req.body.omaintainance }
          }
        }, callback);

        function callback(err, result) {

          if (err) {
            res.send(err);
          }
          else {
            res.json({ status: "200", message: "Property Details Updated Successfully." });
          }
        }
      }
    }
  )
}


exports.list_company_branch_profile = function (req, res) {
  var truid = req.body.truid;
  var date = new Date(Date.parse(req.body.date));

  Company.find({ truID: truid }, function (err, docs) {
    if (!docs.length) {
      res.json({
        status: "204",
        message: 'The request was successful but no TruID was returned.'
      });
    }
    else {

      var query;
      if (date === "all") {
        query = "";
      } else {
        query = { $match: { modifyDate: { $gt: date } } };
      }

      Location.aggregate([query,
        {
          $project: {
            _id: 0, countryCode: 1, propertyDetails: 1, referenceTruID: 1, branchName: 1, FAX: 1, purpose: 1,
            contactAddress: 1, description: 1, modifyDate: 1, companyTruID: 1, owned: 1, rented: 1, lName: 1, email: 1,
            landLine: "$telephone", mobile: 1, truID: 1, regDate: 1
          }
        }
      ]).exec(function (err, result) {
        if (err) {
          response.status(500).send({ error: err })
          return next(err);
        }
        else {
          var resource = result;
          res.json({ status: "200", resource: resource });
        }
      }
      )
    }
  }
  )
}



exports.update_company_branch_details = function (req, res) {
  var badd = new Company(req.user);
  var query = { truID: req.body.truid };

  Location.find(
    query, function (err, docs) {
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {
        Location.findOneAndUpdate(query, {
          $set:
          {
            modifyDate: Date.now(),
            email: req.body.email, mobile: req.body.mobile, branchName: req.body.branchname,
            FAX: req.body.fax, purpose: req.body.purpose, description: req.body.description,
            regDate: req.body.regdate, telephone: req.body.telephone, companyTruID: req.body.companytruid
          }
        }, callback);

        function callback(err, result) {

          if (err) {
            res.send(err);
          }
          else {
            res.json({ status: "200", message: "Branch Details Updated Successfully." });
          }
        }
      }
    }
  )
}


/////////////////////////Group Api starts from here//////////////////////////

exports.update_permission = function (req, res) {

  var modifyby = req.body.truid;

  var groupid = req.body.groupid;
  var updatereason = req.body.updatereason;
  var create = req.body.create;
  var view = req.body.view;
  var modify = req.body.modify;
  var del = req.body.del;

  KycAll.find(
    { truID: modifyby, status: "active" }, function (err, docs) {
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {
        Group.findOneAndUpdate({ groupID: groupid },
          {
            $set: {
              permissions: { create: create, view: view, modify: modify, delete: del },
              updateReason: updatereason, modifyDate: Date.now()
            }
          }, callback);

        function callback(err, numAffected) {
          if (err) {
            res.send(err);
          }
          else {
            res.json({ status: "200", message: "Permissions Updated Successfully." });
          }
        }
      }
    }
  )
}






exports.change_charges_assetmanager = function (req, res) {
  var request = require('request');

  var assetmanagercharges = req.body.assetmanagercharges;
  var othercharges = req.body.othercharges;
  var tax = req.body.tax;
  var assetmanagercharges_rgcoin = req.body.assetmanagerchargesrgcoin;
  var transactionfees = req.body.transactionfees;

  var changefile = " var centgross =  100 ;" +
    "\n var assetmanagercharges =  " + assetmanagercharges + ";" +
    " \n var othercharges =  " + othercharges + ";" +
    "\n \n module.exports.tax =  " + tax + ";" +
    " \n module.exports.centnet =  centgross +((assetmanagercharges + othercharges) * 100);" +
    " \n module.exports.centgross =  centgross;" +
    "\n module.exports.assetmanagercharges =  assetmanagercharges;" +
    "\n module.exports.othercharges =  othercharges;" +
    "\n \n var assetmanagercharges_rgcoin =  " + assetmanagercharges_rgcoin + ";" +
    "\n module.exports.assetmanagercharges_rgcoin =  assetmanagercharges_rgcoin;" +
    "\n module.exports.centnet_rgcoin =  centgross +(othercharges * 100);" +
    "\n module.exports.centnet_rgcoin = " + transactionfees + ";";

  fs.writeFileSync('/nodeProjects/cluster/assetmanager_Transaction/app/Generics0.js', (changefile));

  var date = new Date();
  var id = Date.parse(date).toString();
  var chargelog = new ChargeLog();


  chargelog.ID = id;
  chargelog.modifyBy = req.body.truid;
  chargelog.assetmanagerCharges = assetmanagercharges;
  chargelog.otherCharges = othercharges;
  chargelog.tax = tax;
  chargelog.transactionfees = transactionfees;
  chargelog.modifyDate = date;
  chargelog.entitycharges = "0";
  chargelog.type = "assetmanager";

  ChargeLog.find({ truID: req.body.truid }, function (err, docs) {
    if (!docs.length) {
      chargelog.save(function (err) {
        if (err) {
          console.log(err)
          res.json({ status: "204", message: 'Fields with * required' });

        }
        console.log("log generated for successfully. ");
        res.json({ status: "200", message: "charges changed successfully." });
      });
    }
    else {
      res.json({ status: "204", message: 'Something went wrong.' });
    }
  }
  )
}


exports.change_charges_customer = function (req, res) {

  var assetmanagercharges = req.body.assetmanagercharges;
  var othercharges = req.body.othercharges;
  var assetstorecharges = req.body.assetstorecharges;
  var tax = req.body.tax;
  var selltax = req.body.selltax;
  var entitycharges = req.body.entitycharges;
  var partnercharges = req.body.partnercharges;
  var nodecharges = req.body.nodecharges;
  var transactionfees = req.body.transactionfees;
  var servicetax = req.body.servicetax;
  var slabamt = req.body.slabamt;
  var neftcharge = req.body.neftcharge;
  var impscharge = req.body.impscharge;
  var impscharge1 = req.body.impscharge1;
  var rtgscharge = req.body.rtgscharge;
  var transferfee = req.body.transferfee;
  var gstontransferfee = req.body.gstontransferfee;
  var txnLoading = req.body.txnLoading;

  var date = new Date();
  var id = Date.parse(date).toString();
  var chargelog = new ChargeLog();

  chargelog.ID = id;
  chargelog.modifyBy = req.body.truid;
  chargelog.assetmanagerCharges = assetmanagercharges;
  chargelog.otherCharges = othercharges;
  chargelog.txnLoading = txnLoading;
  chargelog.assetstoreCharges = assetstorecharges;
  chargelog.tax = tax;
  chargelog.entitycharges = entitycharges;
  chargelog.partnerCharges = partnercharges;
  chargelog.transactionfees = transactionfees;
  chargelog.sellTax = selltax;
  chargelog.slabamt = slabamt;
  chargelog.servicetax = servicetax;
  chargelog.neftcharge = neftcharge;
  chargelog.impscharge = impscharge;
  chargelog.impscharge1 = impscharge1;
  chargelog.rtgscharge = rtgscharge;
  chargelog.transferFee = transferfee;
  chargelog.gstOnTransferFee = gstontransferfee;
  chargelog.modifyDate = date;
  chargelog.type = "customer";

  ChargeLog.find({ truID: req.body.truid }, function (err, docs) {
    if (!docs.length) {
      chargelog.save(function (err) {
        if (err) {
          console.log(err)
          res.json({ status: "204", message: 'Fields with * required' });

        } else {
          console.log("log generated for successfully. ");
          res.json({ status: "200", message: "charges changed successfully." });
        }
      });
    }
    else {
      res.json({ status: "204", message: 'Something went wrong.' });
    }
  }
  )

}


exports.list_charges_assetmanager = function (req, res) {

  var truid = req.body.truid;

  KycAll.find(
    { truID: truid }, function (err, docs) {
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {
        var respresult = ChargeLog.aggregate([{
          $project: {
            _id: 0, groupDesc: 1, groupID: 1, groupName: 1,
            modifyby: 1, "permissions.create": 1, "permissions.view": 1, "permissions.modify": 1,
            "permissions.delete": 1, modifyBy: 1, updateReason: 1, modifyDate: 1
          }
        }]);

        respresult.exec(function (err, result) {
          if (err) {
            res.send(err);
          }
          else {
            res.json({ status: "200", resource: result });
          }
        }
        )
      }
    }
  )
}



exports.list_all_charges = function (req, res) {

  var truid = req.body.truid;
  var limit = parseInt(req.body.limit, 10);
  var flag = req.body.type;

  var type;
  if (flag === "c2d") {
    type = "customer";
  }
  if (flag === "d2d") {
    type = "assetmanager";
  }

  KycAll.find(
    { truID: truid }, function (err, docs) {
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {
        var respresult = ChargeLog.aggregate([{ $match: { type: type } },
        {
          $project: {
            _id: 0, "modifyDate": 1, "ID": 1, "modifyBy": 1, "assetmanagerCharges": { $toDouble: "$assetmanagerCharges" }, "txnLoading": { $toDouble: "$txnLoading" },
            "assetstoreCharges": { $toDouble: "$assetstoreCharges" }, "otherCharges": { $toDouble: "$otherCharges" }, "tax": { $toDouble: "$tax" },
            "entitycharges": { $toDouble: "$entitycharges" },
            "entityRevCharges": { $toDouble: { $ifNull: ["$entityRevCharges", "0"] } },
            "partnerCharges": { $toDouble: "$partnerCharges" },
            "nodeCharges": { $toDouble: "$nodeCharges" },
            "transactionfees": { $toDouble: "$transactionfees" }, "slabamt": { $toDouble: "$slabamt" },
            "servicetax": { $toDouble: "$servicetax" }, "neftcharge": { $toDouble: "$neftcharge" },
            "impscharge": { $toDouble: "$impscharge" }, "impscharge1": { $toDouble: "$impscharge1" },
            "sellTax": { $ifNull: [{ $toDouble: "$sellTax" }, 0] },
            "transferTax": { $toDouble: "$gstOnTransferFee" },
            "rtgscharge": { $toDouble: "$rtgscharge" }, "type": 1, "transferFee": { $ifNull: [{ $toDouble: "$transferFee" }, 0] },
            "gstOnTransferFee": { $ifNull: [{ $toDouble: "$gstOnTransferFee" }, 0] }

          }
        },
        { $sort: { modifyDate: -1 } },
        { $limit: limit }])

        respresult.exec(function (err, result) {
          if (err) {
            res.send(err);
          }
          else {
            if (result.length) {
              res.json({ status: "200", resource: result });
            } else {

              res.json({
                status: "200", resource: [{
                  "type": "customer",
                  "assetmanagerCharges": 0.00,
                  "txnLoading": 0.00,
                  "assetstoreCharges": 0.00,
                  "otherCharges": 0.00,
                  "tax": 0.00,
                  "entitycharges": 0.00,
                  "entityRevCharges": 0.00,
                  "partnerCharges": 0.00,
                  "nodeCharges": 0.00,
                  "transactionfees": 0.00,
                  "slabamt": 0.00,
                  "servicetax": 0.00,
                  "neftcharge": 0.00,
                  "impscharge": 0.00,
                  "impscharge1": 0.00,
                  "sellTax": 0.00,
                  "transferTax": 0.00,
                  "rtgscharge": 0.00,
                  "transferFee": 0.00,
                  "gstOnTransferFee": 0.00
                }]
              });
            }
          }
        }
        )
      }
    }
  )
}


exports.Update_empDocs_file_uplod = function (req, res) {
  var badd = new KycAll(req.user);
  var truid = req.body.truid;
  var query = { truID: truid };

  KycAll.find(
    query, function (err, docs) {
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {
        KycAll.findOneAndUpdate(query, { $set: { empDoc: req.body.empdoc, status: "active" } }, callback)

        function callback(err, numAffected) {
          if (err) {
            res.json({ status: "204", message: "Something went wrong." });
          }
          else {
            res.json({ status: "200", message: "Files Uploaded Successfully." });
          }
        }
      }
    }
  )
}


exports.Update_rentedDocs_for_company_locations = function (req, res) {
  var badd = new KycAll(req.user);
  var truid = req.body.truid;
  var query = { truID: truid };
  Location.find(
    query, function (err, docs) {
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {
        Location.findOneAndUpdate(query, {
          $set: {
            rented: {
              ownerName: req.body.ownername, ownerAddress: req.body.owneraddress,
              area: req.body.area, maintainance: req.body.maintainance, rent: req.body.rent, deposit: req.body.deposit,
              ownerMobileNo: req.body.ownermobileno, rentAggrementDoc: req.body.rentaggrementdoc
            }
          }
        }, callback)

        function callback(err, numAffected) {
          if (err) {
            res.json({ status: "204", message: "Something went wrong." });
          }
          else {
            res.json({ status: "200", message: "Files Uploaded Successfully." });
          }
        }
      }
    }
  )
}



exports.admin_validation = function (req, res) {
  KycAll.find({ "truID": req.body.truid }, function (err, docs) {
    if (!docs.length) {
      res.json({ status: "400", message: "Consumer not exists!" });
    }
    else {
      if (req.body.flag === "admin") {
        res.json({ status: "200", fName: docs[0].fName, lName: docs[0].lName });
      } else {
        res.json({ status: "200", message: "Consumer Found.", mobile: docs[0].mobile });
      }
    }
  })
};





exports.login_window_machine_hash = function (req, res) {
  var email = req.body.email
  var query = AuthKYC.find({ email: email }).select({ isPwdReset: 1, isTPinReset: 1, password: 1, '_id': 0 });

  KYC.findOne({ email: req.body.email }, function (err, user) {
    query.exec(function (err, result) {

      if (err == null && result == '') {
        res.json({ status: "204", message: 'Invalid Username' });
      }

      else {
        var array = result;
        var ispwd = result[0].isPwdReset;
        var istpinreset = result[0].isTPinReset;
        var parray = array.pop();
        var finalhash = parray.password;
        // res.json({ message: finalhash });
        //return someValue;
        // if(bcrypt.compareSync(req.body.password, '$2b$10$BOHG3WPaFTStqfFjzzw7kuMTmFE4C4elUkvC41NmW10qZ80BrkB.y'))
        if (bcrypt.compareSync(req.body.password, finalhash)) {
          if (ispwd === true) {
            callback(istpinreset);
          }
          else {
            res.json({ status: "206", messege: "Please reset your password." });
          }
        }
        else {
          res.json({ status: "204", message: 'Invalid Username' });
        }

        function callback(istpinreset) {

          var query1 = { email: email };
          var respresult = KycAll.find(query1, {
            _id: 0, fName: 1, mobile: 1,
            email: 1, lName: 1, truID: 1, image: 1, status: 1
          });
          respresult.exec(function (err, result) {
            if (err) {
              response.status(500).send({ error: err })
              return next(err);
            }
            else {
              var contactFName = result[0].fName;
              var contactLName = result[0].lName;
              var truID = result[0].truID;
              // var isParent = result[0].isParent;
              var status = result[0].status;
              var email = result[0].email;
              var mobile = result[0].mobile;
              var image = result[0].image;
              var path = Gen.profile;
              var fimage = path.concat(image);

              var respresult1 = Company.find({}, { _id: 0, truID: 1 });
              respresult1.exec(function (err, result1) {
                if (err) {
                  response.status(500).send({ error: err })
                  return next(err);
                }
                else {

                  res.json({
                    status: "200",
                    resource: {
                      fName: contactFName, lName: contactLName, mobile: mobile, isTPinReset: istpinreset,
                      email: email, truID: truID, image: fimage, staus: status
                    }
                  });
                }
              }
              )
            }
          }
          )
        }
      }
    }
    )
  }
  )
}

exports.get_All_Charges = function (req, res) {
  ChargeLog.aggregate([
    { $sort: { _id: -1 } },
    { $limit: (1) },
    {
      $project: {
        _id: 0, "modifyDate": 1, "ID": 1, "modifyBy": 1, "assetmanagerCharges": { $toDouble: "$assetmanagerCharges" }, "txnLoading": { $toDouble: "$txnLoading" },
        "assetstoreCharges": { $toDouble: "$assetstoreCharges" }, "otherCharges": { $toDouble: "$otherCharges" }, "tax": { $toDouble: "$tax" },
        "entitycharges": { $toDouble: "$entitycharges" },
        entityRevCharges: { $toDouble: { $ifNull: ["$entityRevCharges", "0"] } }, partnerCharges: { $toDouble: "$partnerCharges" }, nodeCharges: { $toDouble: "$nodeCharges" },
        "transactionfees": { $toDouble: "$transactionfees" }, "slabamt": { $toDouble: "$slabamt" },
        "servicetax": { $toDouble: "$servicetax" }, "neftcharge": { $toDouble: "$neftcharge" },
        "impscharge": { $toDouble: "$impscharge" }, "impscharge1": { $toDouble: "$impscharge1" },
        "sellTax": { $toDouble: "$sellTax" }, "transferTax": { $toDouble: "$transferTax" },
        "rtgscharge": { $toDouble: "$rtgscharge" }, "type": 1, "transferFee": { $ifNull: [{ $toDouble: "$transferFee" }, 0] },
        "gstOnTransferFee": { $ifNull: [{ $toDouble: "$gstOnTransferFee" }, 0] }

      }
    }
  ]).exec(function (err, docs) {
    if (err) {
      res.status(500).json({ status: "400", message: "Charges not set." });
    }
    else if (!docs.length) {
      res.json({
        status: "200", charges: {
          "tax": 0.00,
          "sellTax": 0.00,
          "transferTax": 0.00,
          "centnet": 0.00,
          "centgross": 0.00,
          "assetmanagercharges": 0.00,
          "othercharges": 0.00,
          "txnLoading": 0.00,
          "assetstoreCharges": 0.00,
          "transactionCharges": 0.00,
          "transferFee": 0.00,
          "gstOnTransferFee": 0.00,
          "entitycharges": 0.00,
          "entityRevCharges": 0.00,
          "partnerCharges": 0.00,
          "nodeCharges": 0.00,
          "assetmanagercharges_rgcoin": 0.00,
          "centnet_rgcoin": 0.00,
          "transactionfees": 0.00,
          "slabAmt": 0.00,
          "serviceTax": 0.00,
          "NEFTcharges": 0.00,
          "IMPScharges": 0.00,
          "IMPScharges1": 0.00,
          "RTGScharges": 0.00
        }
      });
    }
    else {
      var resp = docs[0]
      var centgross = 100;
      var json = {
        "tax": resp.tax,
        "sellTax": resp.sellTax ? resp.sellTax : 0,
        "transferTax": resp.transferTax ? resp.transferTax : 0,
        "centnet": centgross + ((resp.assetmanagerCharges + resp.otherCharges + resp.assetstoreCharges) * 100),
        "centgross": centgross,
        "assetmanagercharges": resp.assetmanagerCharges,
        "othercharges": resp.otherCharges + resp.assetstoreCharges,
        "txnLoading": resp.txnLoading,
        "assetstoreCharges": resp.assetstoreCharges,
        "transactionCharges": resp.otherCharges,
        "transferFee": resp.transferFee,
        "gstOnTransferFee": resp.gstOnTransferFee,
        "entitycharges": resp.entitycharges,
        "entityRevCharges": resp.entityRevCharges,
        "partnerCharges": resp.partnerCharges,
        "nodeCharges": resp.nodeCharges,
        "centnet_rgcoin": centgross + (resp.otherCharges * 100),
        "transactionfees": resp.transactionfees,
        "slabAmt": resp.slabamt,
        "serviceTax": resp.servicetax,
        "NEFTcharges": resp.neftcharge,
        "IMPScharges": resp.impscharge,
        "IMPScharges1": resp.impscharge1,
        "RTGScharges": resp.rtgscharge
      }
      res.status(200).json({ status: "200", charges: json });
    }
  })
};
exports.get_All_ChargesDateWise = function (req, res) {
  var dt = new Date(Date.parse(req.body.date));
  ChargeLog.aggregate([
    { $match: { modifyDate: { $lte: dt } } },
    { $sort: { _id: -1 } },
    { $limit: (1) },
    {
      $project: {
        _id: 0, "modifyDate": 1, "ID": 1, "modifyBy": 1, "assetmanagerCharges": { $toDouble: "$assetmanagerCharges" }, "txnLoading": { $toDouble: "$txnLoading" },
        "assetstoreCharges": { $toDouble: "$assetstoreCharges" }, "otherCharges": { $toDouble: "$otherCharges" }, "tax": { $toDouble: "$tax" },
        "entitycharges": { $toDouble: "$entitycharges" },
        entityRevCharges: { $toDouble: "$entityRevCharges" }, partnerCharges: { $toDouble: "$partnerCharges" }, nodeCharges: { $toDouble: "$nodeCharges" },
        "transactionfees": { $toDouble: "$transactionfees" }, "slabamt": { $toDouble: "$slabamt" },
        "servicetax": { $toDouble: "$servicetax" }, "neftcharge": { $toDouble: "$neftcharge" },
        "impscharge": { $toDouble: "$impscharge" }, "impscharge1": { $toDouble: "$impscharge1" },
        "sellTax": { $toDouble: "$sellTax" }, "transferTax": { $toDouble: "$transferTax" },
        "rtgscharge": { $toDouble: "$rtgscharge" }, "type": 1, "transferFee": { $ifNull: [{ $toDouble: "$transferFee" }, 0] },
        "gstOnTransferFee": { $ifNull: [{ $toDouble: "$gstOnTransferFee" }, 0] }
      }
    }
  ]).exec(function (err, docs) {
    if (err) {
      res.status(500).json({ status: "400", message: "Charges not set." });
    }
    else if (!docs.length) {
      var json = {
        "tax": 0.03,
        "sellTax": 0,
        "centnet": 101.1,
        "centgross": 100,
        "assetmanagercharges": 0.005,
        "othercharges": 0.006,
        "txnLoading": 0,
        "assetstoreCharges": 0.006,
        "transactionCharges": 0,
        "transferFee": 0.005,
        "gstOnTransferFee": 0.18,
        "entitycharges": 0,
        "entityRevCharges": 0,
        "partnerCharges": 0,
        "nodeCharges": 0,
        "assetmanagercharges_rgcoin": 0.1,
        "centnet_rgcoin": 100.6,
        "lending_processing": 0.01,
        "transactionfees": 0.005
      }
      res.status(200).json({ status: "400", charges: json });
    }
    else {
      var resp = docs[0];
      var centgross = 100;
      var json = {
        "tax": resp.tax,
        "sellTax": resp.sellTax ? resp.sellTax : 0,
        "transferTax": resp.transferTax ? resp.transferTax : 0,
        "centnet": centgross + ((resp.assetmanagerCharges + resp.otherCharges + resp.assetstoreCharges) * 100),
        "centgross": centgross,
        "assetmanagercharges": resp.assetmanagerCharges,
        "othercharges": resp.otherCharges + resp.assetstoreCharges,
        "assetstoreCharges": resp.assetstoreCharges,
        "transactionCharges": resp.otherCharges,
        "txnLoading": resp.txnLoading,
        "transferFee": resp.transferFee,
        "gstOnTransferFee": resp.gstOnTransferFee,
        "entitycharges": resp.entitycharges,
        "entityRevCharges": resp.entityRevCharges,
        "partnerCharges": resp.partnerCharges,
        "nodeCharges": resp.nodeCharges,
        "centnet_rgcoin": centgross + (resp.otherCharges * 100)
      }
      res.status(200).json({ status: "200", charges: json });
    }
  })
};

exports.get_All_ChargesbetweenDate = function (req, res) {
  var flag1 = {}
  if (req.body.startDate) {
    var startdate = new Date(Date.parse(req.body.startDate));
    var enddate = new Date(Date.parse(req.body.endDate));
    var flag1 = { "modifyDate": { $gte: startdate, $lte: enddate } }
  }

  ChargeLog.aggregate([
    { $match: flag1 },
    {
      $project: {
        _id: 0, "modifyDate": 1, "ID": 1, "modifyBy": 1, "assetmanagerCharges": { $toDouble: "$assetmanagerCharges" }, "txnLoading": { $toDouble: "$txnLoading" },
        "assetstoreCharges": { $toDouble: "$assetstoreCharges" }, "otherCharges": { $toDouble: "$otherCharges" }, "tax": { $toDouble: "$tax" },
        "entitycharges": { $toDouble: "$entitycharges" },
        entityRevCharges: { $toDouble: "$entityRevCharges" }, partnerCharges: { $toDouble: "$partnerCharges" }, nodeCharges: { $toDouble: "$nodeCharges" },
        "transactionfees": { $toDouble: "$transactionfees" }, "slabamt": { $toDouble: "$slabamt" },
        "servicetax": { $toDouble: "$servicetax" }, "neftcharge": { $toDouble: "$neftcharge" },
        "impscharge": { $toDouble: "$impscharge" }, "impscharge1": { $toDouble: "$impscharge1" },
        "sellTax": { $toDouble: "$sellTax" }, "transferTax": { $toDouble: "$transferTax" },
        "rtgscharge": { $toDouble: "$rtgscharge" }, "type": 1, "transferFee": { $ifNull: [{ $toDouble: "$transferFee" }, 0] },
        "gstOnTransferFee": { $ifNull: [{ $toDouble: "$gstOnTransferFee" }, 0] }
      }
    },
    { $sort: { "modifyDate": 1 } }
  ]).exec(function (err, docs) {
    if (err) {
      res.status(500).json({ status: "400", message: "Charges not set." });
    }
    else if (!docs.length) {
      var lastflag = { "modifyDate": { $lt: startdate } }
      calculateLastCharges(lastflag)
    }
    else {
      var lastflag = { "modifyDate": { $lt: docs[0].modifyDate } }
      calculateLastCharges(lastflag, docs)
    }
  })
  function calculateLastCharges(lastflag, docs) {
    ChargeLog.aggregate([
      { $match: lastflag }, {
        $project: {
          _id: 0, "modifyDate": 1, "ID": 1, "modifyBy": 1,
          "assetmanagercharges": { $ifNull: [{ $toDouble: "$assetmanagerCharges" }, 0] },
          "assetstoreCharges": { $ifNull: [{ $toDouble: "$assetstoreCharges" }, 0] },
          "othercharges": { $ifNull: [{ $toDouble: "$otherCharges" }, 0] },
          "txnLoading": { $ifNull: [{ $toDouble: "$txnLoading" }, 0] },
          "tax": { $ifNull: [{ $toDouble: "$tax" }, 0] },
          "entitycharges": { $ifNull: [{ $toDouble: "$entitycharges" }, 0] },
          entityRevCharges: { $ifNull: [{ $toDouble: "$entityRevCharges" }, 0] },
          partnerCharges: { $ifNull: [{ $toDouble: "$partnerCharges" }, 0] },
          nodeCharges: { $ifNull: [{ $toDouble: "$nodeCharges" }, 0] },
          "transactionfees": { $ifNull: [{ $toDouble: "$transactionfees" }, 0] },
          "sellTax": { $ifNull: [{ $toDouble: "$sellTax" }, 0] },
          "transferTax": { $ifNull: [{ $toDouble: "$transferTax" }, 0] },
          "rtgscharge": { $ifNull: [{ $toDouble: "$rtgscharge" }, 0] },
          "type": 1,
          "transferFee": { $ifNull: [{ $toDouble: "$transferFee" }, 0] },
          "gstOnTransferFee": { $ifNull: [{ $toDouble: "$gstOnTransferFee" }, 0] }
        }
      },
      { $sort: { "modifyDate": -1 } },
      { $limit: 1 },
    ]).exec(function (err, docsData) {
      if (!docsData.length) {
        var json = [{
          "modifyDate": new Date("01/01/2001"),
          "tax": 0.03,
          "sellTax": 0.00,
          "centnet": 101.1,
          "centgross": 100,
          "assetmanagercharges": 0.005,
          "othercharges": 0.006,
          "txnLoading": 0.01,
          "assetstoreCharges": 0.001,
          "transactionCharges": 0.005,
          "transferFee": 0.005,
          "gstOnTransferFee": 0.18,
          "entitycharges": 0,
          "entityRevCharges": 0,
          "partnerCharges": 0.4,
          "nodeCharges": 0.3,
          "assetmanagercharges_rgcoin": 0.1,
          "centnet_rgcoin": 100.6,
          "lending_processing": 0.01,
          "transactionfees": 0.005
        }]
        if (docs) {
          txnCharges(json.concat(docs))
        }
        else {
          txnCharges(json)
        }
      }
      else {
        if (docs) {
          txnCharges(docsData.concat(docs))
        }
        else {
          txnCharges(docsData)
        }


      }
    })
  }
  function txnCharges(data) {
    var centgross = 100;
    var lending_processing = 0.01;
    var json;
    var myArray = new Array();
    for (var i = 0; i < data.length; i++) {
      var resp = data[i];
      var json = {
        "tax": resp.tax,
        "sellTax": resp.sellTax ? resp.sellTax : 0,
        "transferTax": resp.gstOnTransferFee ? resp.gstOnTransferFee : 0,
        "txnLoading": resp.txnLoading ? resp.txnLoading : 0,
        "centnet": centgross + ((resp.assetmanagercharges + resp.othercharges + resp.assetstoreCharges) * 100),
        "centgross": centgross,
        "assetmanagercharges": resp.assetmanagercharges,
        "othercharges": resp.othercharges + resp.assetstoreCharges,
        "assetstoreCharges": resp.assetstoreCharges,
        "transactionCharges": resp.othercharges,
        "txnLoading": resp.txnLoading,
        "transferFee": resp.transferFee,
        "gstOnTransferFee": resp.gstOnTransferFee,
        "entitycharges": resp.entitycharges,
        "entityRevCharges": resp.entityRevCharges,
        "partnerCharges": resp.partnerCharges,
        "nodeCharges": resp.nodeCharges,
        "centnet_rgcoin": centgross + (resp.othercharges * 100),
        "transactionfees": resp.transactionfees,
        "modifyDate": resp.modifyDate
      }
      myArray.push(json)
    }
    res.status(200).json({ status: "200", charges: myArray });
  }
};