/*
  # @description This file contains all Admin functionallity for assetstore, Entity, assetmanager, Customer Modules which will Routes to core apis.
  # Request from UI will send here and then send to internal api with input params.
*/
'use strict'
const walletLogSchema = require("../../../tru_Admin_Core/app/models/entityModel/remmitWalletLogModel");
var conf = require("../config");
var mongoose = require('mongoose'),
  request = require('request'),
  fs = require("fs"),
  path = require("path"),
  KycAll = require('../models/adminKYCAllModel'),
  remmitLogs = require('../models/remmitLogsModel'),
  custLogs = require('../models/custLogsModel'),
  cryptos = require('crypto');

exports.test = function (req, res) {
  res.json({ message: "Welcome to Company Admin Api" });
};
exports.hundred = function (req, res) {
  request.post({
    "headers": { "content-type": "application/json" },
    "url": conf.adminReqIP + ":" + conf.adminAuth + "/api/registration",
    "body": JSON.stringify(req.body)
  }, (error, response, body) => {
    if (error) {
      return console.dir(error);
    }
    var newjson = JSON.parse(body);
    //console.dir(JSON.parse(body));
    res.json(newjson);
  }
  )
}


// exports.hundredone = function(req, res) {
//   //   var email = req.body.email;
//   var password = req.body.password;

//   request.post({
//    "headers": { "content-type": "application/json" },
//    "url": conf.adminReqIP + ":" + conf.adminAuth+ "/api/login",
//    "body": JSON.stringify({
//      "email" : email,
//      "password" : password
//    })
//  }, (error, response, body) => {
//    if(error) {
//        return console.dir(error);
//    }
//    var newjson =  JSON.parse(body);
//    res.json(newjson);
//   });
// };



exports.hundredone = function (req, res) {
  var email = req.body.email;
  var password = req.body.password;
  var mhash = !req.headers.mhash ? "0" : req.headers.mhash;
  request.post({
    "headers": { "content-type": "application/json" },
    "url": conf.adminReqIP + ":" + conf.adminAuth + "/api/login",
    "body": JSON.stringify({
      "email": email,
      "password": password,
      "mhash": mhash
    })
  }, (error, response, body) => {
    if (error) {
      return console.dir(error);
    }
    var newjson = JSON.parse(body);
    res.json(newjson);
  });
};

exports.hundredtwo = function (req, res) {
  var etruid = req.body.eTruID;
  var image = req.body.image;

  request.post({
    "headers": { "content-type": "application/json" },
    "url": conf.adminReqIP + ":" + conf.adminAuth + "/api/updateimage",
    "body": JSON.stringify({
      "truid": etruid,
      "image": image
    })
  }, (error, response, body) => {
    if (error) {
      return console.dir(error);
    }
    var newjson = JSON.parse(body);
    res.json(newjson);
  });
};



exports.hundredthree = function (req, res) {

  var truid = req.body.truID;
  var date = req.body.date;

  request.post({
    "headers": { "content-type": "application/json" },
    "url": conf.adminReqIP + ":" + conf.adminAuth + "/api/profile",
    "body": JSON.stringify({
      "truid": truid,
      "date": date
    })
  }, (error, response, body) => {
    if (error) {
      return console.dir(error);
    }
    var newjson = JSON.parse(body);
    res.json(newjson);
  });
};


exports.hundredfour = function (req, res) {

  var email = req.body.email;
  var newpassword = req.body.newPassword;

  request.post({
    "headers": { "content-type": "application/json" },
    "url": conf.adminReqIP + ":" + conf.adminAuth + "/api/changepassword",
    "body": JSON.stringify({
      "email": email,
      "newpassword": newpassword
    })
  }, (error, response, body) => {
    if (error) {
      return console.dir(error);
    }
    var newjson = JSON.parse(body);
    res.json(newjson);
  }
  )
}



exports.hundredfive = function (req, res) {
  var etruid = req.body.eTruID;

  var housenumber = req.body.houseNumber;
  var streetnumber = req.body.streetNumber;
  var landmark = req.body.landmark;
  var pin = req.body.pin;
  var city = req.body.city;
  var state = req.body.state;
  var country = req.body.country;
  var longitude = req.body.longitude;
  var latitude = req.body.latitude;

  var phousenumber = req.body.pHouseNumber;
  var pstreetnumber = req.body.pStreetNumber;
  var plandmark = req.body.pLandmark;
  var ppin = req.body.pPin;
  var pcity = req.body.pCity;
  var pstate = req.body.pState;
  var pcountry = req.body.pCountry;

  request.post({
    "headers": { "content-type": "application/json" },
    "url": conf.adminReqIP + ":" + conf.adminAuth + "/api/updateaddress",
    "body": JSON.stringify({
      "truid": etruid,

      "housenumber": housenumber,
      "streetnumber": streetnumber,
      "landmark": landmark,
      "pin": pin,
      "city": city,
      "state": state,
      "country": country,
      "longitude": longitude,
      "latitude": latitude,

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
    //console.dir(JSON.parse(body));
    res.json(newjson);
  });
};


exports.hundredsix = function (req, res) {

  var truid = req.body.truID;

  request.post({
    "headers": { "content-type": "application/json" },
    "url": conf.adminReqIP + ":" + conf.adminAuth + "/api/listprofiletruid",
    "body": JSON.stringify({
      "truid": truid
    })
  }, (error, response, body) => {
    if (error) {
      return console.dir(error);
    }
    var newjson = JSON.parse(body);
    //console.dir(JSON.parse(body));
    res.json(newjson);
  }
  )
}


exports.hundredseven = function (req, res) {
  var truid = req.body.truID;
  KycAll.find(
    { truID: truid }, function (err, docs) {                                   //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      }
      else {
        var ctruid = req.body.cTruID;
        var kycflag = req.body.kycFlag;
        var kycdesc = req.body.kycDesc;
        var panStatus = req.body.panStatus;
        var aadharStatus = req.body.aadharStatus;
        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.custAuth + "/api/custupkycflagadmin",
          "body": JSON.stringify({
            "atruid": req.body.truID,
            "truid": ctruid,
            "kycflag": kycflag,
            "kycdesc": kycdesc,
            "panStatus": panStatus,
            "aadharStatus": aadharStatus
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          res.json(newjson);
        }
        )
      }
    }
  )
}


exports.hundredeight = function (req, res) {

  var truid = req.body.truID,
    dateflag = req.body.dateFlag,
    startdate = req.body.startDate;

  KycAll.find(
    { truID: truid }, function (err, docs) {                                   //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {

        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.custAuth + "/api/consumerlistadmin",
          "body": JSON.stringify({
            "dateflag": dateflag,
            "startdate": startdate
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          res.json(newjson);
        }
        )
      }
    }
  )
}

exports.hundrednine = function (req, res) {

  var email = req.body.email;
  var mobile = req.body.mobile;
  var countrycode = req.body.countryCode;
  var companyname = req.body.companyName;
  var shortname = req.body.shortName;
  var fax = req.body.FAX;
  var pan = req.body.PAN;
  var gstinno = req.body.GSTINNo;
  var companydesc = req.body.companyDesc;
  var landline = req.body.landLine;
  var companyregno = req.body.companyRegNo;
  var regdate = req.body.regDate;

  request.post({
    "headers": { "content-type": "application/json" },
    "url": conf.adminReqIP + ":" + conf.adminAuth + "/api/companyregistration",
    "body": JSON.stringify({
      "email": email,
      "mobile": mobile,
      "countrycode": countrycode,
      "companyname": companyname,
      "shortname": shortname,
      "fax": fax,
      "pan": pan,
      "gstinno": gstinno,
      "companydesc": companydesc,
      "landline": landline,
      "companyregno": companyregno,
      "regdate": regdate
    })
  }, (error, response, body) => {
    if (error) {
      return console.dir(error);
    }
    var newjson = JSON.parse(body);
    //console.dir(JSON.parse(body));
    res.json(newjson);
  }
  )
}



exports.hundredten = function (req, res) {
  var truid = req.body.cTruID;

  var housenumber = req.body.houseNumber;
  var streetnumber = req.body.streetNumber;
  var landmark = req.body.landmark;
  var pin = req.body.pin;
  var city = req.body.city;
  var state = req.body.state;
  var country = req.body.country;
  var longitude = req.body.longitude;
  var latitude = req.body.latitude;
  var display = req.body.display;

  var phousenumber = req.body.pHouseNumber;
  var pstreetnumber = req.body.pStreetNumber;
  var plandmark = req.body.pLandmark;
  var ppin = req.body.pPin;
  var pcity = req.body.pCity;
  var pstate = req.body.pState;
  var pcountry = req.body.pCountry;
  var pdisplay = req.body.pDisplay;

  request.post({
    "headers": { "content-type": "application/json" },
    "url": conf.adminReqIP + ":" + conf.adminAuth + "/api/updatecompanyaddress",
    "body": JSON.stringify({
      "truid": truid,
      "housenumber": housenumber,
      "streetnumber": streetnumber,
      "landmark": landmark,
      "pin": pin,
      "city": city,
      "state": state,
      "country": country,
      "longitude": longitude,
      "latitude": latitude,
      "display": display,

      "phousenumber": phousenumber,
      "pstreetnumber": pstreetnumber,
      "plandmark": plandmark,
      "ppin": ppin,
      "pcity": pcity,
      "pstate": pstate,
      "pcountry": pcountry,
      "pdisplay": pdisplay
    })
  }, (error, response, body) => {
    if (error) {
      return console.dir(error);
    }
    var newjson = JSON.parse(body);
    //console.dir(JSON.parse(body));
    res.json(newjson);
  });
};


exports.hundredeleven = function (req, res) {
  var ctruid = req.body.cTruID;
  var bankname = req.body.bankName;
  var IFSC = req.body.IFSC;
  var accountno = req.body.accountNo;

  request.post({
    "headers": { "content-type": "application/json" },
    "url": conf.adminReqIP + ":" + conf.adminAuth + "/api/updatecompanybankdetails",
    "body": JSON.stringify({
      "truid": ctruid,
      "bankname": bankname,
      "IFSC": IFSC,
      "accountno": accountno
    })
  }, (error, response, body) => {
    if (error) {
      return console.dir(error);
    }
    var newjson = JSON.parse(body);
    //console.dir(JSON.parse(body));
    res.json(newjson);
  });
};


exports.hundretwelve = function (req, res) {
  var truid = req.body.truID;

  request.post({
    "headers": { "content-type": "application/json" },
    "url": conf.reqip + ":" + conf.custAuth + "/api/listAddress",
    "body": JSON.stringify({
      "truid": truid
    })
  }, (error, response, body) => {
    if (error) {
      return console.dir(error);
    }
    var newjson = JSON.parse(body);
    //console.dir(JSON.parse(body));
    res.json(newjson);
  });
};


exports.hundredthirteen = function (req, res) {

  var truid = req.body.truID;

  KycAll.find(
    { truID: truid }, function (err, docs) {                                   //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {

        var ctruid = req.body.cTruID;
        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.custAuth + "/api/consumerlistprofileadmin",
          "body": JSON.stringify({
            "truid": ctruid
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          res.json(newjson);
        }
        );
      }
    }
  )
}



exports.hundredfourteen = function (req, res) {

  request.post({
    "headers": { "content-type": "application/json" },
    "url": conf.adminReqIP + ":" + conf.adminAuth + "/api/companyprofile",
    "body": JSON.stringify({

    })
  }, (error, response, body) => {
    if (error) {
      return console.dir(error);
    }
    var newjson = JSON.parse(body);
    res.json(newjson);
  }
  );
}


exports.hundredfifteen = function (req, res) {

  var email = req.body.email;
  var ctruid = req.body.cTruID;
  var mobile = req.body.mobile;
  var countrycode = req.body.countryCode;
  var companyname = req.body.companyName;
  var shortname = req.body.shortName;
  var fax = req.body.FAX;
  var pan = req.body.PAN;
  var gstinno = req.body.GSTINNo;
  var companydesc = req.body.companyDesc;
  var companyregno = req.body.companyRegNo;
  var regdate = req.body.regDate;
  var landline = req.body.landLine;

  request.post({
    "headers": { "content-type": "application/json" },
    "url": conf.adminReqIP + ":" + conf.adminAuth + "/api/updatecompanyregdetails",
    "body": JSON.stringify({
      "truid": ctruid,
      "email": email,
      "mobile": mobile,
      "countrycode": countrycode,
      "companyname": companyname,
      "shortname": shortname,
      "fax": fax,
      "pan": pan,
      "gstinno": gstinno,
      "companydesc": companydesc,
      "companyregno": companyregno,
      "regdate": regdate,
      "landline": landline
    })
  }, (error, response, body) => {
    if (error) {
      return console.dir(error);
    }
    var newjson = JSON.parse(body);
    //console.dir(JSON.parse(body));
    res.json(newjson);
  }
  )
}


exports.hundredsixteen = function (req, res) {

  var email = req.body.email;
  var mobile = req.body.mobile;
  var countrycode = req.body.countryCode;
  var branchname = req.body.branchName;
  var fax = req.body.FAX;
  var regdate = req.body.regDate;
  var purpose = req.body.purpose;
  var description = req.body.description;
  var referencetruid = req.body.referenceTruID;
  var propertydetails = req.body.propertyDetails;
  var landline = req.body.landLine;
  var companytruid = req.body.companyTruID;

  request.post({
    "headers": { "content-type": "application/json" },
    "url": conf.adminReqIP + ":" + conf.adminAuth + "/api/companybranchregistration",
    "body": JSON.stringify({
      "email": email,
      "mobile": mobile,
      "countrycode": countrycode,
      "branchname": branchname,
      "regdate": regdate,
      "fax": fax,
      "purpose": purpose,
      "landline": landline,
      "description": description,
      "referencetruid": referencetruid,
      "propertydetails": propertydetails,
      "companytruid": companytruid
    })
  }, (error, response, body) => {
    if (error) {
      return console.dir(error);
    }
    var newjson = JSON.parse(body);
    //console.dir(JSON.parse(body));
    res.json(newjson);
  }
  )
}



exports.hundredseventeen = function (req, res) {
  var etruid = req.body.eTruID;
  var bankname = req.body.bankName;
  var IFSC = req.body.IFSC;
  var accountno = req.body.accountNo;

  request.post({
    "headers": { "content-type": "application/json" },
    "url": conf.adminReqIP + ":" + conf.adminAuth + "/api/updatebankdetails",
    "body": JSON.stringify({
      "truid": etruid,
      "bankname": bankname,
      "IFSC": IFSC,
      "accountno": accountno
    })
  }, (error, response, body) => {
    if (error) {
      return console.dir(error);
    }
    var newjson = JSON.parse(body);
    //console.dir(JSON.parse(body));
    res.json(newjson);
  });
};




exports.hundredeighteen = function (req, res) {
  console.log("req", req.body)
  var btruid = req.body.bTruID;


  var housenumber = req.body.houseNumber;
  var streetnumber = req.body.streetNumber;
  var landmark = req.body.landmark;
  var pin = req.body.pin;
  var city = req.body.city;
  var state = req.body.state;
  var country = req.body.country;
  var longitude = req.body.longitude;
  var latitude = req.body.latitude;

  request.post({
    "headers": { "content-type": "application/json" },
    "url": conf.adminReqIP + ":" + conf.adminAuth + "/api/updatecompanybranchaddress",
    "body": JSON.stringify({
      "truid": btruid,

      "housenumber": housenumber,
      "streetnumber": streetnumber,
      "landmark": landmark,
      "pin": pin,
      "city": city,
      "state": state,
      "country": country,
      "longitude": longitude,
      "latitude": latitude
    })
  }, (error, response, body) => {
    if (error) {
      return console.dir(error);
    }
    var newjson = JSON.parse(body);
    //console.dir(JSON.parse(body));
    res.json(newjson);
  });
};




exports.hundrednineteen = function (req, res) {

  var btruid = req.body.bTruID;
  var ownername = req.body.ownerName;
  var owneraddress = req.body.ownerAddress;
  var area = req.body.area;
  var maintainance = req.body.maintainance;
  var rent = req.body.rent;
  var deposit = req.body.deposit;
  var ownermobileno = req.body.ownerMobileNo;
  var rentaggrementdoc = req.body.rentAggrementDoc;
  var oarea = req.body.oArea;
  var omaintainance = req.body.oMaintainance;

  request.post({
    "headers": { "content-type": "application/json" },
    "url": conf.adminReqIP + ":" + conf.adminAuth + "/api/updatecompanybranchpropertydetails",
    "body": JSON.stringify({
      "truid": btruid,
      "ownername": ownername,
      "owneraddress": owneraddress,
      "area": area,
      "maintainance": maintainance,
      "rent": rent,
      "deposit": deposit,
      "ownermobileno": ownermobileno,
      "rentaggrementdoc": rentaggrementdoc,
      "oarea": oarea,
      "omaintainance": omaintainance
    })
  }, (error, response, body) => {
    if (error) {
      return console.dir(error);
    }
    var newjson = JSON.parse(body);
    //console.dir(JSON.parse(body));
    res.json(newjson);
  }
  )
}


exports.hundredtwenty = function (req, res) {

  var truid = req.body.truID;
  var ctruid = req.body.cTruID;;
  var date = req.body.date;

  request.post({
    "headers": { "content-type": "application/json" },
    "url": conf.adminReqIP + ":" + conf.adminAuth + "/api/companybranchprofile",
    "body": JSON.stringify({
      "truid": ctruid,
      "date": date
    })
  }, (error, response, body) => {
    if (error) {
      return console.dir(error);
    }
    var newjson = JSON.parse(body);
    //console.dir(JSON.parse(body));
    res.json(newjson);
  }
  )
}



exports.hundredtwentyone = function (req, res) {

  var truid = req.body.truID;
  var empdoc = req.body.empDoc;

  request.post({
    "headers": { "content-type": "application/json" },
    "url": conf.adminReqIP + ":" + conf.adminAuth + "/api/updateempdoc",
    "body": JSON.stringify({
      "truid": truid,
      "empdoc": empdoc
    })
  }, (error, response, body) => {
    if (error) {
      return console.dir(error);
    }
    var newjson = JSON.parse(body);
    res.json(newjson);
  }
  )
}

exports.hundredtwentytwo = function (req, res) {

  var truid = req.body.truID;
  var groupname = req.body.groupName;
  var groupdesc = req.body.groupDesc;
  var groupid = req.body.groupID;
  var view = req.body.view;
  var create = req.body.create;
  var modify = req.body.modify;
  var del = req.body.del;

  request.post({
    "headers": { "content-type": "application/json" },
    "url": conf.adminReqIP + ":" + conf.adminAuth + "/api/insertgroup",
    "body": JSON.stringify({
      "truid": truid,
      "groupname": groupname,
      "groupdesc": groupdesc,
      "groupid": groupid,
      "view": view,
      "create": create,
      "modify": modify,
      "del": del
    })
  }, (error, response, body) => {
    if (error) {
      return console.dir(error);
    }
    var newjson = JSON.parse(body);
    //console.dir(JSON.parse(body));
    res.json(newjson);
  }
  )
}




exports.hundredtwentythree = function (req, res) {

  var truid = req.body.truID;
  var permissions = req.body.permissions;
  var updatereason = req.body.updateReason;
  var groupid = req.body.groupID;
  var view = req.body.view;
  var create = req.body.create;
  var modify = req.body.modify;
  var del = req.body.del;

  request.post({
    "headers": { "content-type": "application/json" },
    "url": conf.adminReqIP + ":" + conf.adminAuth + "/api/updatepermission",
    "body": JSON.stringify({
      "truid": truid,
      "permissions": permissions,
      "updatereason": updatereason,
      "groupid": groupid,
      "view": view,
      "create": create,
      "modify": modify,
      "del": del
    })
  }, (error, response, body) => {
    if (error) {
      return console.dir(error);
    }
    var newjson = JSON.parse(body);
    //console.dir(JSON.parse(body));
    res.json(newjson);
  }
  )
}




exports.hundredtwentyfour = function (req, res) {

  var truid = req.body.truID;

  request.post({
    "headers": { "content-type": "application/json" },
    "url": conf.adminReqIP + ":" + conf.adminAuth + "/api/listgroup",
    "body": JSON.stringify({
      "truid": truid
    })
  }, (error, response, body) => {
    if (error) {
      return console.dir(error);
    }
    var newjson = JSON.parse(body);
    //console.dir(JSON.parse(body));
    res.json(newjson);
  }
  )
}


////////////////////////assetmanager admin apis from here////////////////////////////

exports.hundredtwentyfive = function (req, res) {                                //assetmanager all details profile, stock, rate, wallet, kyc.

  var truid = req.body.truID;
  var amtruid = req.body.amTruID;

  KycAll.find(
    { truID: truid }, function (err, docs) {                                   //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {
        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.assetmanagerAuth + "/api/showassetmanagerforadmin",
          "body": JSON.stringify({
            "amtruid": amtruid
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          //console.dir(JSON.parse(body));
          res.json(newjson);
        }
        )
      }
    }
  )
}



exports.hundredtwentysix = function (req, res) {                                  //assetmanagers to assetmanager transactions

  var truid = req.body.truID;
  var amtruid = req.body.amTruID;

  KycAll.find(
    { truID: truid }, function (err, docs) {                                       //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {

        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.assetmanagerTxn + "/api/assetmanagertxnreport",
          "body": JSON.stringify({
            "truid": amtruid

          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          //console.dir(JSON.parse(body));
          res.json(newjson);
        }
        )
      }
    }
  )
}


exports.hundredtwentyseven = function (req, res) {                                //customers to assetmanager transactions

  var truid = req.body.truID;
  var amtruid = req.body.amTruID;

  KycAll.find(
    { truID: truid }, function (err, docs) {                                       //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {


        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.custTxn + "/api/assetmanagertxnreportadmin",
          "body": JSON.stringify({
            "truid": amtruid,
            "flag": "admin"
          })
          // ,

        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          //console.dir(JSON.parse(body));
          res.json(newjson);
        }
        )
      }
    }
  )
}



exports.hundredtwentyeight = function (req, res) {                                //customers to assetmanager transactions

  var truid = req.body.truID;
  var invoice = req.body.invoice;

  KycAll.find(
    { truID: truid }, function (err, docs) {                                       //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {


        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.assetmanagerTxn + "/api/printinvoiceadmin",
          "body": JSON.stringify({
            "invoice": invoice
          })
          // ,

        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          //console.dir(JSON.parse(body));
          res.json(newjson);
        }
        )
      }
    }
  )
}



exports.hundredtwentynine = function (req, res) {                                //customers to assetmanager transactions

  var truid = req.body.truID;
  var amtruid = req.body.amTruID;

  KycAll.find(
    { truID: truid }, function (err, docs) {                                    //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {


        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.assetmanagerStock + "/api/assetmanagersstockloglistall",
          "body": JSON.stringify({
            "truid": amtruid
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          //console.dir(JSON.parse(body));
          res.json(newjson);
        }
        )
      }
    }
  )
}




exports.hundredthirty = function (req, res) {

  var truid = req.body.truID;
  var amtruid = req.body.amTruID;

  KycAll.find(
    { truID: truid }, function (err, docs) {                                       //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {

        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.assetmanagerAuth + "/api/listadminassetmanagercity",
          "body": JSON.stringify({
            "truid": amtruid
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          //console.dir(JSON.parse(body));
          res.json(newjson);
        });
      }
    }
  )
};



exports.hundredthirtyone = function (req, res) {
  var truid = req.body.truID;
  var city = req.body.city;
  var amtruid = req.body.amTruID;

  KycAll.find(
    { truID: truid }, function (err, docs) {                                       //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {

        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.assetmanagerStock + "/api/listassetmanagerforparent",
          "body": JSON.stringify({
            "truid": amtruid,
            "city": city
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          //console.dir(JSON.parse(body));
          res.json(newjson);
        });
      }
    }
  )
};


exports.hundredthirtytwo = function (req, res) {
  var truid = req.body.truID;

  KycAll.find(
    { truID: truid }, function (err, docs) {                                       //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {

        var amtruid = req.body.amTruID;
        var isparent = req.body.isParent;

        var housenumber = req.body.houseNumber;
        var streetnumber = req.body.streetNumber;
        var landmark = req.body.landmark;
        var pin = req.body.pin;
        var city = req.body.city;
        var state = req.body.state;
        var country = req.body.country;

        var longitude = req.body.longitude;
        var latitude = req.body.latitude;

        var rhousenumber = req.body.rHouseNumber;
        var rstreetnumber = req.body.rStreetNumber;
        var rlandmark = req.body.rLandmark;
        var rpin = req.body.rPin;
        var rcity = req.body.rCity;
        var rstate = req.body.rState;
        var rcountry = req.body.rCountry;

        var ohousenumber = req.body.oHouseNumber;
        var ostreetnumber = req.body.oStreetNumber;
        var olandmark = req.body.oLandmark;
        var opin = req.body.oPin;
        var ocity = req.body.oCity;
        var ostate = req.body.oState;
        var ocountry = req.body.oCountry;

        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.clusterreqip + ":4115/api/addressdetails",
          "body": JSON.stringify({
            "truid": amtruid,
            "isparent": isparent,

            "housenumber": housenumber,
            "streetnumber": streetnumber,
            "landmark": landmark,
            "pin": pin,
            "city": city,
            "state": state,
            "country": country,
            "longitude": longitude,
            "latitude": latitude,

            "rhousenumber": rhousenumber,
            "rstreetnumber": rstreetnumber,
            "rlandmark": rlandmark,
            "rpin": rpin,
            "rcity": rcity,
            "rstate": rstate,
            "rcountry": rcountry,

            "ohousenumber": ohousenumber,
            "ostreetnumber": ostreetnumber,
            "olandmark": olandmark,
            "opin": opin,
            "ocity": ocity,
            "ostate": ostate,
            "ocountry": ocountry,
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);

          res.json(newjson);
        }
        )
      }
    }
  )
}



exports.hundredthirtythree = function (req, res) {                              //customers to assetmanager transactions
  var truid = req.body.truID;

  KycAll.find(
    { truID: truid }, function (err, docs) {                                       //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {

        var amtruid = req.body.amTruID;
        var email = req.body.email;
        var assetmanagername = req.body.assetmanagerName;
        var mobile = req.body.mobile;
        var fname = req.body.fName;
        var mname = req.body.mName;
        var lname = req.body.lName;
        var cname = req.body.cName;
        var DOB = req.body.DOB;
        var gender = req.body.gender;
        var landline = req.body.landLine;

        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.assetmanagerAuth + "/api/assetmanagerupdateregadmin",
          "body": JSON.stringify({
            "truid": amtruid,
            "email": email,
            "assetmanagername": assetmanagername,
            "mobile": mobile,
            "fname": fname,
            "mname": mname,
            "lname": lname,
            "cname": cname,
            "DOB": DOB,
            "gender": gender,
            "landline": landline
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          } else {
            var newjson = JSON.parse(body);

            res.json(newjson);
          }
        }
        )
      }
    }
  )
}



exports.hundredthirtyfour = function (req, res) {                             //assetmanagertoassetmanageralltxnprofitreport
  //  var truid = req.body.truID;

  KycAll.find(
    { truID: truid }, function (err, docs) {                                       //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {
        var amtruid = req.body.amTruID;
        var startdate = req.body.startDate;
        var enddate = req.body.endDate;

        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.assetmanagerTxn + "/api/assetmanagertoassetmanageralltxnprofitreportdatewise",
          "body": JSON.stringify({
            "truid": amtruid,
            "startdate": startdate,
            "enddate": enddate

          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          //console.dir(JSON.parse(body));
          res.json(newjson);
        }
        )
      }
    }
  )
}





exports.hundredthirtyfive = function (req, res) {
  //  var truid = req.body.truID;

  KycAll.find(
    { truID: truid }, function (err, docs) {                                       //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {
        var amtruid = req.body.amTruID;
        var startdate = req.body.startDate;
        var enddate = req.body.endDate;

        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.custTxn + "/api/customertoassetmanageralltxnprofitreportdatewise",
          "body": JSON.stringify({
            "truid": amtruid,
            "startdate": startdate,
            "enddate": enddate

          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          //console.dir(JSON.parse(body));
          res.json(newjson);
        }
        )
      }
    }
  )
}




exports.hundredthirtysix = function (req, res) {                              //customers to assetmanager transactions
  var truid = req.body.truID;

  KycAll.find(
    { truID: truid }, function (err, docs) {                                       //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {

        var amtruid = req.body.amTruID;
        var kycflag = req.body.kycFlag;
        var node = req.body.node;

        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.assetmanagerAuth + "/api/assetmanagerupdatekycflagadmin",
          "body": JSON.stringify({
            "truid": amtruid,
            "kycflag": kycflag,
            "node": node
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          } else {
            var newjson = JSON.parse(body);

            res.json(newjson);
          }
        }
        )
      }
    }
  )
}


exports.hundredthirtyseven = function (req, res) {
  var truid = req.body.truID;

  KycAll.find(
    { truID: truid }, function (err, docs) {                                       //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {


        var email = req.body.email;
        var mobile = req.body.mobile;
        var countrycode = req.body.countryCode;
        var fname = req.body.fName;
        var mname = req.body.mName;
        var lname = req.body.lName;
        var kycflag = req.body.KYCFlag;
        var DOB = req.body.DOB;
        var gender = req.body.gender;
        var refernceid = req.body.refernceTruID;


        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.custAuth + "/api/referenceregistrationadmin",

          "body": JSON.stringify({
            "email": email,
            "mobile": mobile,
            "countrycode": countrycode,
            "fname": fname,
            "mname": mname,
            "lname": lname,
            "kycflag": kycflag,
            "gender": gender,
            "DOB": DOB,
            "refernceid": refernceid
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          console.log(body);
          var newjson = JSON.parse(body);
          //console.dir(JSON.parse(body));
          res.json(newjson);
        });
      }
    }
  )
};



exports.hundredthirtyeight = function (req, res) {
  var truid = req.body.truID;

  KycAll.find(
    { truID: truid }, function (err, docs) {                                       //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {


        var ctruid = req.body.cTruID;

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

        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.custAuth + "/api/addressdetails",
          "body": JSON.stringify({
            "truid": ctruid,

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
          //console.dir(JSON.parse(body));
          res.json(newjson);
        });
      }
    }
  )
};





exports.hundredthirtynine = function (req, res) {
  var truid = req.body.truID;

  KycAll.find(
    { truID: truid }, function (err, docs) {                                       //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {


        var ctruid = req.body.cTruID;

        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.custTxn + "/api/customeralltxnadmin",
          "body": JSON.stringify({

            "truid": ctruid
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          //console.dir(JSON.parse(body));
          res.json(newjson);
        }
        )
      }
    }
  )
}



exports.hundredforty = function (req, res) {
  var truid = req.body.truID;

  KycAll.find(
    { truID: truid }, function (err, docs) {                                       //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {


        var ctruid = req.body.cTruID;
        var email = req.body.email;
        var mobile = req.body.mobile;
        var fname = req.body.fName;
        var countrycode = req.body.countryCode;
        var mname = req.body.mName;
        var lname = req.body.lName;
        var DOB = req.body.DOB;
        var gender = req.body.gender;


        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.custAuth + "/api/updatecustregadmin",
          "body": JSON.stringify({

            "truid": ctruid,
            "email": email,
            "mobile": mobile,
            "fname": fname,
            "countrycode": countrycode,
            "mname": mname,
            "lname": lname,
            "DOB": DOB,
            "gender": gender

          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          //console.dir(JSON.parse(body));
          res.json(newjson);
        });
      }
    }
  )
}



exports.hundredfortyone = function (req, res) {

  var truid = req.body.truID;
  KycAll.find(
    { truID: truid }, function (err, docs) {                                       //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {

        var ctruid = req.body.cTruID;
        var title = req.body.title;
        var number = req.body.number;
        var file = req.body.file;

        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.custAuth + "/api/addkycdocs",
          "body": JSON.stringify({
            "truid": ctruid,
            "title": title,
            "number": number,
            "file": file
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          //console.dir(JSON.parse(body));
          res.json(newjson);
        });
      }
    }
  )
};





exports.hundredfortytwo = function (req, res) {

  var truid = req.body.truID;
  KycAll.find(
    { truID: truid }, function (err, docs) {                                       //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {
        // var ctruid = req.body.cTruID;
        var invoice = req.body.invoice;

        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.custTxn + "/api/printinvoiceadmin",
          "body": JSON.stringify({

            // "truid" : ctruid,
            "invoice": invoice
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          //console.dir(JSON.parse(body));
          res.json(newjson);
        });
      }
    }
  )
};




exports.hundredfortythree = function (req, res) {

  var truid = req.body.truID;
  KycAll.find(
    { truID: truid }, function (err, docs) {                                       //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {
        // var ctruid = req.body.cTruID;
        var invoice = req.body.invoice;

        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.custTxn + "/api/printinvoicec2cadmin",
          "body": JSON.stringify({
            // "truid" : ctruid,
            "invoice": invoice
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          //console.dir(JSON.parse(body));
          res.json(newjson);
        }
        )
      }
    }
  )
}




exports.hundredfortyfour = function (req, res) {

  var truid = req.body.truID;
  KycAll.find(
    { truID: truid }, function (err, docs) {                                       //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {
        var ctruid = req.body.cTruID;
        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.custTxn + "/api/consumeraddmoneylogreport",
          "body": JSON.stringify({
            "truid": ctruid
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          //console.dir(JSON.parse(body));
          res.json(newjson);
        });
      }
    }
  )
};



////////////////////////////////////assetstore admin API////////////////////////////////////
exports.hundredfortyfive = function (req, res) {
  var truid = req.body.truID;
  KycAll.find(
    { truID: truid }, function (err, docs) {                                       //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {
        var email = req.body.email;
        var mobile = req.body.mobile;
        var countrycode = req.body.countryCode;
        var fname = req.body.fName;
        var mname = req.body.mName;
        var lname = req.body.lName;
        var cname = req.body.cName;
        var isparent = req.body.isParent;
        var parentid = req.body.parentID;
        var type = req.body.type;

        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.assetstoreAuth + "/api/registrationfromadmin",
          "body": JSON.stringify({
            "email": email,
            "type": type,
            "fname": fname,
            "mname": mname,
            "cname": cname,
            "lname": lname,
            "mobile": mobile,
            "countrycode": countrycode,
            "isparent": isparent,
            "parentid": parentid,
            "referencetruid": truid

          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          //console.dir(JSON.parse(body));
          res.json(newjson);
        }
        )
      }
    }
  )
}


exports.hundredfortysix = function (req, res) {

  var truid = req.body.truID;
  KycAll.find(
    { truID: truid }, function (err, docs) {                                       //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {
        var ctruid = req.body.cTruID;
        //var address = req.body.address;
        var housenumber = req.body.houseNumber;
        var streetnumber = req.body.streetNumber;
        var landmark = req.body.landmark;
        var pin = req.body.pin;
        var city = req.body.city;
        var state = req.body.state;
        var country = req.body.country;

        var latitude = req.body.latitude;
        var longitude = req.body.longitude;

        //var raddress = req.body.rAddress;
        var rhousenumber = req.body.rHouseNumber;
        var rstreetnumber = req.body.rStreetNumber;
        var rlandmark = req.body.rLandmark;
        var rpin = req.body.rPin;
        var rcity = req.body.rCity;
        var rstate = req.body.rState;
        var rcountry = req.body.rCountry;

        //var oaddress = req.body.oAddress;
        var ohousenumber = req.body.oHouseNumber;
        var ostreetnumber = req.body.oStreetNumber;
        var olandmark = req.body.oLandmark;
        var opin = req.body.oPin;
        var ocity = req.body.oCity;
        var ostate = req.body.oState;
        var ocountry = req.body.oCountry;

        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.clusterreqip + ":4111/api/addressdetails",
          "body": JSON.stringify({
            "truid": ctruid,

            "housenumber": housenumber,
            "streetnumber": streetnumber,
            "landmark": landmark,
            "pin": pin,
            "city": city,
            "state": state,
            "country": country,
            "latitude": latitude,
            "longitude": longitude,

            //"raddress" : raddress,
            "rhousenumber": rhousenumber,
            "rstreetnumber": rstreetnumber,
            "rlandmark": rlandmark,
            "rpin": rpin,
            "rcity": rcity,
            "rstate": rstate,
            "rcountry": rcountry,

            //"oaddress" : oaddress,
            "ohousenumber": ohousenumber,
            "ostreetnumber": ostreetnumber,
            "olandmark": olandmark,
            "opin": opin,
            "ocity": ocity,
            "ostate": ostate,
            "ocountry": ocountry,
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);

          res.json(newjson);
        }
        )
      }
    }
  )
}


exports.hundredfortyseven = function (req, res) {

  var truid = req.body.truID;
  KycAll.find(
    { truID: truid }, function (err, docs) {                                       //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {

        var title = req.body.title;
        var number = req.body.number;
        var file = req.body.file;
        var ctruid = req.body.cTruID;

        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.assetstoreAuth + "/api/addkycdocs",
          "body": JSON.stringify({
            "truid": ctruid,
            "title": title,
            "number": number,
            "file": file,
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
  )
};



exports.hundredfortyeight = function (req, res) {
  var truid = req.body.truID;
  KycAll.find(
    { truID: truid }, function (err, docs) {                                       //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {

        var ctruid = req.body.cTruID;

        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.assetstoreAuth + "/api/assetstorelistprofileadmin",
          "body": JSON.stringify({
            "truid": ctruid
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
  )
};




exports.hundredfortynine = function (req, res) {
  var truid = req.body.truID;
  KycAll.find(
    { truID: truid }, function (err, docs) {                                       //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {

        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.assetmanagerAuth + "/api/assetmanagerlistadmin",
          "body": JSON.stringify({
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
  )
};


exports.hundredfifty = function (req, res) {                                     //assetmanager Stock graph 109 in assetmanager
  var truid = req.body.truID;
  KycAll.find(
    { truID: truid }, function (err, docs) {                                       //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {
        var amtruid = req.body.amTruID;  ////////this truID will be of assetmanager Node
        var startdate = req.body.startDate;
        var enddate = req.body.endDate;

        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.assetmanagerTxn + "/api/assetmanagerstockgraphforassetstore",
          "body": JSON.stringify({
            "truid": amtruid,
            "startdate": startdate,
            "enddate": enddate
          }
          )
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          res.json(newjson)
        }
        )
      }
    }
  )
}






//////////////////////////////////////////////Entity Apis///////////////////////////////////////////////
exports.hundredfiftytwo = function (req, res) {

  var truid = req.body.truID;
  KycAll.find(
    { truID: truid }, function (err, docs) {                                       //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {
        var email = req.body.email;
        var countrycode = req.body.countryCode;
        var mobile = req.body.mobile;
        var fname = req.body.fName;
        var mname = req.body.mName;
        var lname = req.body.lName;
        var cname = req.body.cName;
        var isparent = req.body.isParent;
        var dob = req.body.DOB;
        var gender = req.body.gender;
        var category = req.body.category;
        var mid = req.body.MID;
        var channel = req.body.channel;

        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.remmitAuth + "/api/entityregistrationfromadmin",
          "body": JSON.stringify({
            "email": email,
            "countrycode": countrycode,
            "fname": fname,
            "mname": mname,
            "cname": cname,
            "lname": lname,
            "mobile": mobile,
            "isparent": isparent,
            "dob": dob,
            "gender": gender,
            "referencetruid": truid,
            "category": category,
            "mid": mid
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          //console.dir(JSON.parse(body));
          res.json(newjson);
        }
        )
      }
    }
  )
}

exports.hundredfiftythree = function (req, res) {
  var truid = req.body.truID;
  KycAll.find(
    { truID: truid }, function (err, docs) {                                       //admin user validation from db.
      if (!docs.length) {
        res.json({ status: "204", messege: "The request was successful but no body was returned." });
      } else {
        var rtruid = req.body.rTruID;

        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.remmitAuth + "/api/listprofileforadmin",
          "body": JSON.stringify({
            "truid": rtruid
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          res.json(newjson);
        }
        )
      }
    }
  )
}


exports.hundredfiftyfour = function (req, res) {

  var truid = req.body.truID;
  KycAll.find(
    { truID: truid }, function (err, docs) {                                       //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {
        var rtruid = req.body.rTruID;

        var housenumber = req.body.houseNumber;
        var streetnumber = req.body.streetNumber;
        var landmark = req.body.landmark;
        var pin = req.body.pin;
        var city = req.body.city;
        var state = req.body.state;
        var country = req.body.country;
        var kycflag = req.body.KYCFlag;
        var longitude = req.body.longitude;
        var latitude = req.body.latitude;
        var lendingflag = req.body.isLending;

        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.remmitAuth + "/api/updateaddressforadmin",
          "body": JSON.stringify({
            "truid": rtruid,
            "housenumber": housenumber,
            "streetnumber": streetnumber,
            "landmark": landmark,
            "pin": pin,
            "city": city,
            "state": state,
            "country": country,
            "longitude": longitude,
            "latitude": latitude,
            "kycflag": kycflag,
            "lendingflag": lendingflag
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          res.json(newjson);
        }
        )
      }
    }
  )
}



exports.hundredfiftyfive = function (req, res) {

  var truid = req.body.truID;
  KycAll.find(
    { truID: truid }, function (err, docs) {                                       //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {
        var email = req.body.email;
        var password = req.body.password;
        var countrycode = req.body.countryCode;
        var mobile = req.body.mobile;
        var fname = req.body.fName;
        var mname = req.body.mName;
        var lname = req.body.lName;
        var cname = req.body.cName;
        var isparent = req.body.isParent;
        var parentid = req.body.parentID;

        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.remmitAuth + "/api/addnode",
          "body": JSON.stringify({
            "email": email,
            "password": password,
            "countrycode": countrycode,
            "fname": fname,
            "mname": mname,
            "cname": cname,
            "lname": lname,
            "mobile": mobile,
            "isparent": isparent,
            "parentid": parentid

          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          //console.dir(JSON.parse(body));
          res.json(newjson);
        }
        )
      }
    }
  )
}



exports.hundredfiftysix = function (req, res) {

  var truid = req.body.truID;
  KycAll.find(
    { truID: truid }, function (err, docs) {                                       //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {
        var rtruid = req.body.rTruID;
        var email = req.body.email;
        var mobile = req.body.mobile;
        var fname = req.body.fName;
        var mname = req.body.mName;
        var lname = req.body.lName;
        var cname = req.body.cName;
        var DOB = req.body.DOB;
        var gender = req.body.gender;

        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.remmitAuth + "/api/entityupdateregadmin",
          "body": JSON.stringify({
            "truid": rtruid,
            "email": email,
            "fname": fname,
            "mname": mname,
            "cname": cname,
            "lname": lname,
            "mobile": mobile,
            "DOB": DOB,
            "gender": gender

          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          //console.dir(JSON.parse(body));
          res.json(newjson);
        }
        )
      }
    }
  )
}



exports.hundredfiftyseven = function (req, res) {
  var truid = req.body.truID;
  KycAll.find(
    { truID: truid }, function (err, docs) {                                       //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {
        var rtruid = req.body.rTruID;

        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.remmitAuth + "/api/listentitywithconsumercount",
          "body": JSON.stringify({
            "truid": rtruid
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          res.json(newjson);
        }
        )
      }
    }
  )
}


exports.hundredfiftyeight = function (req, res) {
  var truid = req.body.truID;
  KycAll.find(
    { truID: truid }, function (err, docs) {                                       //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {
        var rtruid = req.body.rTruID;
        var ptruid = req.body.pTruID;

        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.remmitAuth + "/api/findentity",
          "body": JSON.stringify({
            "truid": rtruid,
            "ptruid": ptruid
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          res.json(newjson);
        }
        )
      }
    }
  )
}



exports.hundredsixty = function (req, res) {
  var truid = req.body.truID;
  KycAll.find(
    { truID: truid }, function (err, docs) {                                       //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {
        var rtruid = req.body.rTruID;
        var kycdetails = req.body.kycDetails;
        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.remmitAuth + "/api/updatekycdocsfromentity",
          "body": JSON.stringify({
            "truid": rtruid,
            "kycdetails": kycdetails
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          res.json(newjson);
        }
        )
      }
    }
  )
}





exports.hundredsixtyone = function (req, res) {                                     //cahnge charghes for assetmanager
  var truid = req.body.truID;
  KycAll.find(
    { truID: truid }, function (err, docs) {                                       //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {
        var assetmanagercharges = req.body.assetmanagerCharges;
        var othercharges = req.body.otherCharges;
        var tax = req.body.tax;
        var assetmanagerchargesrgcoin = req.body.assetmanagerChargesRGCoin;
        var transactionfees = req.body.transactionFees;

        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.adminReqIP + ":" + conf.adminAuth + "/apichangechargesassetmanager",
          "body": JSON.stringify({
            "truid": truid,
            "assetmanagercharges": assetmanagercharges,
            "othercharges": othercharges,
            "tax": tax,
            "assetmanagerchargesrgcoin": assetmanagerchargesrgcoin,
            "transactionfees": transactionfees
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          res.json(newjson);
        }
        )
      }
    }
  )
}





exports.hundredsixtytwo = function (req, res) {                                    //cahnge charghes for customers
  var truid = req.body.truID;
  KycAll.find(
    { truID: truid }, function (err, docs) {                                       //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {
        var assetmanagercharges = req.body.assetmanagerCharges;
        var othercharges = req.body.otherCharges;
        var txnLoading = req.body.txnLoading;
        var assetstorecharges = req.body.assetstoreCharges;
        var tax = req.body.tax;
        var sellTax = req.body.sellTax;
        var assetmanagerchargesrgcoin = req.body.assetmanagerChargesRGCoin;
        var entitycharges = req.body.entityCharges;
        var partnercharges = req.body.partnerCharges;
        var nodecharges = req.body.nodeCharges;
        var transactionfees = req.body.transactionFees;
        var slabamt = req.body.slabAmt;
        var servicetax = req.body.serviceTax;
        var neftcharge = req.body.NEFTCharge;
        var impscharge = req.body.IMPSCharge;
        var impscharge1 = req.body.IMPSCharge1;
        var rtgscharge = req.body.RTGScharge;
        var transferfee = req.body.transferFee;
        var gstOnTransferfee = req.body.gstOnTransferFee;

        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.adminReqIP + ":" + conf.adminAuth + "/api/changechargescustomer",
          "body": JSON.stringify({
            "truid": truid,
            "assetmanagercharges": assetmanagercharges,
            "othercharges": othercharges,
            "txnLoading": txnLoading,
            "assetstorecharges": assetstorecharges,
            "tax": tax,
            "selltax": sellTax,
            "assetmanagercharges_rgcoin": assetmanagerchargesrgcoin,
            "entitycharges": entitycharges,
            "partnercharges": partnercharges,
            "nodecharges": nodecharges,
            "transactionfees": transactionfees,
            "slabamt": slabamt,
            "servicetax": servicetax,
            "neftcharge": neftcharge,
            "impscharge": impscharge,
            "transferfee": transferfee,
            "gstontransferfee": gstOnTransferfee,
            "impscharge1": impscharge1,
            "rtgscharge": rtgscharge
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          res.json(newjson);
        }
        )
      }
    }
  )
}

exports.hundredsixtythree = function (req, res) {                                    //employee registration update
  var etruid = req.body.eTruID;
  var mobile = req.body.mobile;
  var fname = req.body.fName;
  var mname = req.body.mName;
  var lname = req.body.lName;
  var DOB = req.body.DOB;
  var gender = req.body.gender;
  var type = req.body.type;
  var title = req.body.title;
  var empcode = req.body.empCode;
  var landline = req.body.landLine;
  var branchid = req.body.branchID;
  var joiningdate = req.body.joiningDate;
  var skillset = req.body.skillset;

  request.post({
    "headers": { "content-type": "application/json" },
    "url": conf.adminReqIP + ":" + conf.adminAuth + "/api/updatereg",
    "body": JSON.stringify({
      "truid": etruid,
      "mobile": mobile,
      "fname": fname,
      "mname": mname,
      "lname": lname,
      "DOB": DOB,
      "gender": gender,
      "title": title,
      "type": type,
      "empcode": empcode,
      "landline": landline,
      "branchid": branchid,
      "joiningdate": joiningdate,
      "skillset": skillset
    })
  }, (error, response, body) => {
    if (error) {
      return console.dir(error);
    }
    var newjson = JSON.parse(body);
    res.json(newjson);
  }
  )
}




exports.hundredsixtyfour = function (req, res) {                                    //employee email update
  var etruid = req.body.eTruID;
  var email = req.body.email;

  request.post({
    "headers": { "content-type": "application/json" },
    "url": conf.adminReqIP + ":" + conf.adminAuth + "/api/updateempemail",
    "body": JSON.stringify({
      "truid": etruid,
      "email": email
    })
  }, (error, response, body) => {
    if (error) {
      return console.dir(error);
    }
    var newjson = JSON.parse(body);
    res.json(newjson);
  }
  )
}


exports.hundredsixtyfive = function (req, res) {                                    //entyity kycflag

  var truid = req.body.truID;
  KycAll.find(
    { truID: truid }, function (err, docs) {                                       //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {
        var rtruid = req.body.rTruID;
        var kycflag = req.body.kycFlag;
        var kycdesc = req.body.kycDesc;
        var node = req.body.node;
        var panStatus = req.body.panStatus;
        var aadharStatus = req.body.aadharStatus;

        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.remmitAuth + "/api/entityupkycflagadmin",
          "body": JSON.stringify({
            "atruid": req.body.truID,
            "truid": rtruid,
            "kycflag": kycflag,
            "kycdesc": kycdesc,
            "node": node,
            "panStatus": panStatus,
            "aadharStatus": aadharStatus
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          res.json(newjson);
        }
        )
      }
    }
  )
}



exports.hundredsixtysix = function (req, res) {                                    //entyity kycflag

  var truid = req.body.truID;
  KycAll.find(
    { truID: truid }, function (err, docs) {                                       //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {
        var rtruid = req.body.rTruID;

        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.remmitAuth + "/api/listadminenititycity",
          "body": JSON.stringify({
            "truid": rtruid
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          res.json(newjson);
        }
        )
      }
    }
  )
}



exports.hundredsixtyseven = function (req, res) {                                    //entyity kycflag

  var truid = req.body.truID;
  KycAll.find(
    { truID: truid }, function (err, docs) {                                       //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {
        var amtruid = req.body.amTruID;

        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.assetmanagerStock + "/api/assetmanagerratelogs",
          "body": JSON.stringify({
            "truid": amtruid
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          res.json(newjson);
        }
        )
      }
    }
  )
}



exports.hundredsixtyeight = function (req, res) {                                    //assetstore kycflag

  var truid = req.body.truID;
  KycAll.find(
    { truID: truid }, function (err, docs) {                                       //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {
        var ctruid = req.body.cTruID;
        var kycflag = req.body.kycFlag;
        var kycdesc = req.body.kycDesc;
        var node = req.body.node;

        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.assetstoreAuth + "/api/assetstoreupkycflagadmin",
          "body": JSON.stringify({
            "atruid": req.body.truID,
            "truid": ctruid,
            "kycflag": kycflag,
            "kycdesc": kycdesc,
            "node": node
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          res.json(newjson);
        }
        )
      }
    }
  )
}



exports.hundredsixtynine = function (req, res) {                                    //enter assetstore truid

  var truid = req.body.truID;
  KycAll.find(
    { truID: truid }, function (err, docs) {                                       //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {
        var ctruid = req.body.cTruID                                             //assetstore truid

        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.assetmanagerTxn + "/api/assetmanagerstocksummission",
          "body": JSON.stringify({
            "truid": ctruid
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          res.json(newjson);
        }
        )
      }
    }
  )
}



exports.hundredseventy = function (req, res) {                                    //enter assetstore truid

  var truid = req.body.truID;
  KycAll.find(
    { truID: truid }, function (err, docs) {                                       //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {
        var ctruid = req.body.cTruID                                             //assetstore truid

        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.assetstoreAuth + "/api/listassetstoreforparent",
          "body": JSON.stringify({
            "truid": ctruid
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          res.json(newjson);
        }
        )
      }
    }
  )
}



exports.hundredseventyone = function (req, res) {                                    //enter assetstore truid

  var truid = req.body.truID;
  KycAll.find(
    { truID: truid }, function (err, docs) {                                       //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {
        var date1 = req.body.date1
        var g24k_rate = req.body.G24KRate
        var date2 = req.body.date2
        var s99_rate = req.body.S99PRate
        var countrycode = req.body.countryCode
        var currencyrate = req.body.currencyRate
        var importduty = req.body.importDuty
        var discount = req.body.discount
        var tax = req.body.tax

        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.truRates + "/apiliverateswrite",
          "body": JSON.stringify({
            "date1": date1,
            "g24k_rate": g24k_rate,
            "date2": date2,
            "s99_rate": s99_rate,
            "truid": truid,
            "countrycode": countrycode,
            "currencyrate": currencyrate,
            "importduty": importduty,
            "discount": discount,
            "tax": tax
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          res.json(newjson);
        }
        )
      }
    }
  )
}



exports.hundredseventytwo = function (req, res) {                                    //enter Admin

  var truid = req.body.truID;
  KycAll.find(
    { truID: truid }, function (err, docs) {                                       //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {
        var rtruid = req.body.rTruID;                                              //entity truid
        var startdate = req.body.startDate;
        var enddate = req.body.endDate;

        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.custTxn + "/api/entityprofitreport",
          "body": JSON.stringify({
            "truid": rtruid,
            "startdate": startdate,
            "enddate": enddate
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          res.json(newjson);
        }
        )
      }
    }
  )
}


exports.hundredseventythree = function (req, res) {                                    //enter Admin

  var truid = req.body.truID;
  KycAll.find(
    { truID: truid }, function (err, docs) {                                       //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {
        var limit = req.body.limit

        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.truRates + "/api/LBMAratelog",
          "body": JSON.stringify({
            "limit": limit
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          res.json(newjson);
        }
        )
      }
    }
  )
}



exports.hundredseventyfour = function (req, res) {
  var truid = req.body.truID;                                                     //enter Admin truid
  KycAll.find(
    { truID: truid }, function (err, docs) {                                       //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {
        var rtruid = req.body.rTruID                                                //enter entity truid

        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.custAuth + "/api/refferanceregistrationlist",
          "body": JSON.stringify({
            "truid": rtruid
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          res.json(newjson);
        }
        )
      }
    }
  )
}

exports.hundredseventyfive = function (req, res) {
  var truid = req.body.truID;                                                     //enter Admin truid
  KycAll.find({ truID: truid }, function (err, docs) {                                       //admin user validation from db.
    if (!docs.length) {
      res.json({
        status: "204",
        messege: "The request was successful but no body was returned."
      });
    } else {
      var rtruid = req.body.rTruID                                                //enter entity truid
      request.post({
        "headers": { "content-type": "application/json" },
        "url": conf.reqip + ":" + conf.custTxn + "/api/entitytxnreportadmin",
        "body": JSON.stringify({
          "truid": rtruid
        })
      }, (error, response, body) => {
        if (error) {
          return console.dir(error);
        }
        var newjson = JSON.parse(body);
        res.json(newjson);
      })
    }
  })
}





exports.hundredseventysix = function (req, res) {
  var truid = req.body.truID;                                                     //enter Admin truid
  var type = req.body.type                                                    //flag for customer or assetmanager
  var limit = req.body.limit                                                //limit of records

  request.post({
    "headers": { "content-type": "application/json" },
    "url": conf.adminReqIP + ":" + conf.adminAuth + "/api/listallcharges",
    "body": JSON.stringify({
      "truid": truid,
      "type": type,
      "limit": limit
    })
  }, (error, response, body) => {
    if (error) {
      return console.dir(error);
    }
    var newjson = JSON.parse(body);
    res.json(newjson);
  }
  )
}



exports.hundredseventyseven = function (req, res) {

  var truid = req.body.truID;
  KycAll.find(
    { truID: truid }, function (err, docs) {                                       //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {
        var ctruid = req.body.cTruID;
        var email = req.body.email;
        var mobile = req.body.mobile;
        var fname = req.body.fName;
        var lname = req.body.lName;
        var cname = req.body.cName;

        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.assetstoreAuth + "/api/updateassetstoreregadmin",
          "body": JSON.stringify({
            "email": email,
            "truid": ctruid,
            "fname": fname,
            "cname": cname,
            "lname": lname,
            "mobile": mobile
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          //console.dir(JSON.parse(body));
          res.json(newjson);
        }
        )
      }
    }
  )
}



exports.hundredseventyeight = function (req, res) {
  var truid = req.body.truID;                                                     //enter Admin truid
  KycAll.find(
    { truID: truid }, function (err, docs) {                                       //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {

        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.remmitAuth + "/api/listallparentadmin",
          "body": JSON.stringify({

          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          res.json(newjson);
        }
        )
      }
    }
  )
}


exports.hundredseventynine = function (req, res) {
  var truid = req.body.truID;                                                     //enter Admin truid
  KycAll.find(
    { truID: truid }, function (err, docs) {                                       //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {

        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.adminReqIP + ":" + conf.adminAuth + "/api/LBMArates",
          "body": JSON.stringify({

          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          res.json(newjson);
        }
        )
      }
    }
  )
}


exports.hundredeighty = function (req, res) {

  var truid = req.body.truID;                                                     //enter Admin truid
  KycAll.find(
    { truID: truid }, function (err, docs) {                                       //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {
        var ctruid = req.body.cTruID;
        var flag = req.body.flag;
        var startdate = req.body.startDate;
        var enddate = req.body.endDate;
        var letterNumber = /^[0-9]+$/;
        var dateval = /^((0?[1-9]|1[012])[-](0?[1-9]|[12][0-9]|3[01])[-](19|20|21)?[0-9]{2})*$/;

        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.custTxn + "/api/buystocktrend",                       //Consumer analysis chart for admin
          "body": JSON.stringify({
            "truid": ctruid,
            "flag": flag,
            "startdate": startdate,
            "enddate": enddate
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          //console.dir(JSON.parse(body));
          res.json(newjson);
        }
        )
      }
    }
  )
};




exports.hundredeightyone = function (req, res) {
  var truid = req.body.truID;                                                     //enter Admin truid
  KycAll.find(
    { truID: truid }, function (err, docs) {                                       //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {
        var ctruid = req.body.cTruID;                                              //assetstore TruID
        var city = req.body.city;

        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.assetstoreAuth + "/api/listassetstoreforparent",
          "body": JSON.stringify({
            "truid": ctruid,
            "city": city
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          res.json(newjson);
        }
        )
      }
    }
  )
}



exports.hundredeightytwo = function (req, res) {

  var truid = req.body.truID;                                                     //enter Admin truid
  KycAll.find(
    { truID: truid }, function (err, docs) {                                       //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {
        var ctruid = req.body.cTruID;                                              //assetstore TruID
        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.assetmanagerStock + "/api/listassetmanagerforassetstore",
          "body": JSON.stringify({
            "truid": ctruid,
            "aflag": "admin"                                                   //flag for request from admin
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          res.json(newjson);
        }
        )
      }
    }
  )
}




exports.hundredeightythree = function (req, res) {

  var truid = req.body.truID;
  KycAll.find(
    { truID: truid }, function (err, docs) {                                       //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {
        var amtruid = req.body.amTruID;
        var companyname = req.body.companyName;
        var companytype = req.body.companyType;
        var directorsaadhar = req.body.directorsAadhar;
        var partnersaadhar = req.body.partnersAadhar;

        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.assetmanagerAuth + "/api/setdirectors",
          "body": JSON.stringify({
            "truid": amtruid,
            "companyname": companyname,
            "companytype": companytype,
            "directorsaadhar": directorsaadhar,
            "partnersaadhar": partnersaadhar
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          res.json(newjson);
        }
        )
      }
    }
  )
}


exports.hundredeightyfour = function (req, res) {

  var truid = req.body.truID;
  KycAll.find(
    { truID: truid }, function (err, docs) {                                       //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {
        var amtruid = req.body.amTruID;
        var startdate = req.body.startDate;
        var enddate = req.body.endDate;

        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.assetmanagerTxn + "/api/assetmanagertoassetmanageralltxnprofitreportdatewise",
          "body": JSON.stringify({
            "truid": amtruid,
            "startdate": startdate,
            "enddate": enddate
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          res.json(newjson);
        }
        )
      }
    }
  )
}



exports.hundredeightyfive = function (req, res) {

  var truid = req.body.truID;
  KycAll.find(
    { truID: truid }, function (err, docs) {                                       //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {
        var ctruid = req.body.cTruID;                                            //Enter assetstore truid

        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.assetmanagerStock + "/api/assetstoreallstockdeatailsadmin",
          "body": JSON.stringify({
            "truid": ctruid
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          res.json(newjson);
        }
        )
      }
    }
  )
}


exports.hundredeightysix = function (req, res) {                                     //assetmanager rate logs in assetmanager
  var truid = req.body.truID;
  KycAll.find(
    { truID: truid }, function (err, docs) {                                       //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {
        var amtruid = req.body.amTruID;  ////////this truID will be of assetmanager Node
        var startdate = req.body.startDate;
        var enddate = req.body.endDate;

        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.assetmanagerStock + "/api/assetmanagerratelogsdatewise",
          "body": JSON.stringify({
            "truid": amtruid,
            "startdate": startdate,
            "enddate": enddate
          }
          )
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          res.json(newjson)
        }
        )
      }
    }
  )
}


exports.hundredeightyseven = function (req, res) {

  var referencetruid = req.body.referenceTruID;
  KycAll.find(
    { truID: referencetruid }, function (err, docs) {                                       //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {

        var email = req.body.email;
        var mobile = req.body.mobile;
        var countrycode = req.body.countryCode;
        var assetmanagername = req.body.assetmanagerName;
        var fname = req.body.fName;
        var mname = req.body.mName;
        var lname = req.body.lName;
        var cname = req.body.cName;
        var dob = req.body.DOB;
        var landline = req.body.landLine;
        var gender = req.body.gender;
        var letterNumber = /^[0-9]+$/;


        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.assetmanagerAuth + "/api/registrationfromadmin",
          "body": JSON.stringify({
            "email": email,
            "mobile": mobile,
            "countrycode": countrycode,
            "assetmanagername": assetmanagername,
            "fname": fname,
            "mname": mname,
            "lname": lname,
            "cname": cname,
            "referencetruid": referencetruid,
            "dob": dob,
            "landline": landline,
            "gender": gender
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          res.json(newjson);
        }
        )
      }
    }
  )
}



exports.hundredeightyeight = function (req, res) {

  var truid = req.body.truID;
  KycAll.find(
    { truID: truid }, function (err, docs) {                                       //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {
        var amtruid = req.body.amTruID;
        var letterNumber = /^[0-9]+$/;

        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.assetmanagerAuth + "/api/listkyc",
          "body": JSON.stringify({
            "truid": amtruid
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          //console.dir(JSON.parse(body));
          res.json(newjson);
        });
      }
    }
  )
}




exports.hundredeightynine = function (req, res) {

  var btruid = req.body.bTruID;
  var email = req.body.email;
  var mobile = req.body.mobile;
  var branchname = req.body.branchName;
  var fax = req.body.FAX;
  var regdate = req.body.regDate;
  var purpose = req.body.purpose;
  var description = req.body.description;
  var telephone = req.body.landLine;
  var companytruid = req.body.companyTruID;

  request.post({
    "headers": { "content-type": "application/json" },
    "url": conf.adminReqIP + ":" + conf.adminAuth + "/api/updatecompanybranchdetails",
    "body": JSON.stringify({
      "truid": btruid,
      "email": email,
      "mobile": mobile,
      "branchname": branchname,
      "regdate": regdate,
      "fax": fax,
      "purpose": purpose,
      "telephone": telephone,
      "description": description,
      "companytruid": companytruid
    })
  }, (error, response, body) => {
    if (error) {
      return console.dir(error);
    }
    var newjson = JSON.parse(body);
    //console.dir(JSON.parse(body));
    res.json(newjson);
  }
  )
}


exports.hundredninetyone = function (req, res) {
  var truid = req.body.truID;
  KycAll.find(
    { truID: truid }, function (err, docs) {                                       //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {
        var rtruid = req.body.rTruID;
        var skip = req.body.skip;
        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.entityTxn + "/api/entitywalletlogreport",
          "body": JSON.stringify({
            "truid": rtruid,
            "skip": skip
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          //console.dir(JSON.parse(body));
          res.json(newjson);
        }
        )
      }
    }
  )
}



exports.hundredninetytwo = function (req, res) {

  var truid = req.body.truID;
  KycAll.find(
    { truID: truid }, function (err, docs) {                                       //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {
        var rtruid = req.body.rTruID;
        var letterNumber = /^[0-9]+$/;

        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.entityTxn + "/api/entitytoentitytxnreport",
          "body": JSON.stringify({
            "truid": rtruid
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          res.json(newjson);
        }
        )
      }
    }
  )
}


exports.hundredninetythree = function (req, res) {

  var truid = req.body.truID;
  KycAll.find(
    { truID: truid }, function (err, docs) {                                       //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {
        var rtruid = req.body.rTruID;
        var letterNumber = /^[0-9]+$/;

        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.entityTxn + "/api/entityalltxnreport",
          "body": JSON.stringify({
            "truid": rtruid
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          res.json(newjson);
        }
        )
      }
    }
  )
}


exports.hundredninetyfour = function (req, res) {
  //  var truid = req.body.truID;
  KycAll.find(
    { truID: truid }, function (err, docs) {                                       //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {
        var ctruid = req.body.cTruID;
        var flag = req.body.flag;
        var startdate = req.body.startDate;
        var enddate = req.body.endDate;
        var letterNumber = /^[0-9]+$/;
        var dateval = /^((0?[1-9]|1[012])[-](0?[1-9]|[12][0-9]|3[01])[-](19|20|21)?[0-9]{2})*$/;

        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.custTxn + "/api/redeemstocktrend",
          "body": JSON.stringify({
            "truid": ctruid,
            "flag": flag,
            "startdate": startdate,
            "enddate": enddate
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          //console.dir(JSON.parse(body));
          res.json(newjson);
        }
        );
      }
    }
  )
};




exports.hundredninetyfive = function (req, res) {

  var truid = req.body.truID;
  KycAll.find(
    { truID: truid }, function (err, docs) {                                       //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {
        var rtruid = req.body.rTruID;
        var letterNumber = /^[0-9]+$/;

        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.entityTxn + "/api/entityaddmoneylogreport",
          "body": JSON.stringify({
            "truid": rtruid
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          //console.dir(JSON.parse(body));
          res.json(newjson);
        }
        );
      }
    }
  )
}


exports.hundredninetysix = function (req, res) {

  var truid = req.body.truID;
  KycAll.find(
    { truID: truid }, function (err, docs) {
      console.log(docs.length);                                      //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {
        var ctruid = req.body.cTruID;
        var invoice = req.body.invoice;
        var letterNumber = /^[0-9]+$/;

        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.custTxn + "/api/paymentgatewayreport",
          "body": JSON.stringify({
            "truid": ctruid,
            "invoice": invoice
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          //console.dir(JSON.parse(body));
          res.json(newjson);
        });
      }
    }
  )
}



exports.hundredninetyseven = function (req, res) {

  var truid = req.body.truID;                 //admin truid
  KycAll.find(
    { truID: truid }, function (err, docs) {
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {
        var rtruid = req.body.rTruID;              //entity truid
        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.entityStock + "/api/showlendingrateslogdetails",
          "body": JSON.stringify({
            "truid": rtruid
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          //console.dir(JSON.parse(body));
          res.json(newjson);
        })
      }
    }
  )
}


exports.hundredninetyeight = function (req, res) {

  var truid = req.body.truID;               //admin truid
  KycAll.find(
    { truID: truid }, function (err, docs) {
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {
        var rtruid = req.body.rTruID;       //entity truid
        var letterNumber = /^[0-9]+$/;

        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.custTxn + "/api/requestlienentitylist",
          "body": JSON.stringify({
            "rtruid": rtruid
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          //console.dir(JSON.parse(body));
          res.json(newjson);
        }
        )
      }
    }
  )
}




exports.hundredninetynine = function (req, res) {

  var truid = req.body.truID;               //admin truid
  KycAll.find(
    { truID: truid }, function (err, docs) {
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {
        var rtruid = req.body.rTruID;       //entity truid
        var invoice = req.body.invoice;
        var letterNumber = /^[0-9]+$/;

        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.custTxn + "/api/printinvoicelienadmin",
          "body": JSON.stringify({
            "invoice": invoice,
            "truid": rtruid
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          //console.dir(JSON.parse(body));
          res.json(newjson);
        }
        )
      }
    }
  )
}



exports.twohundredthree = function (req, res) {
  var truid = req.body.truID;               //admin truid
  var rtruid = req.body.rTruID;             //entity truid

  KycAll.find(
    { truID: truid }, function (err, docs) {
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no Admin user was returned."
        });
      } else {
        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.entityStock + "/api/listsettings",
          "body": JSON.stringify({
            "truid": rtruid
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          //console.dir(JSON.parse(body));
          res.json(newjson);
        }
        )
      }
    }
  )
}


exports.twohundredfour = function (req, res) {
  //to update consumer kycdocs from admin in DB.
  // var bearer = req.headers.authorization;
  // var array = bearer.split(" ");

  // if (array[1] != token23){
  //   res.json({status : "401",message: "Unauthorized user!"});
  // }else{
  KycAll.find(
    { truID: req.body.truID }, function (err, docs) {
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no Admin user was returned."
        });
      } else {
        var ctruid = req.body.cTruID;
        var kycdetails = req.body.kycDetails;
        var flag = "consumer";
        var letterNumber = /^[0-9]+$/;
        // if((truid && conf.twohundredfour.truID === "mandatory" && truid.length == 16 && truid.match(letterNumber)) &&
        //    (kycdetails && conf.twohundredfour.kycDetails === "mandatory" && Array.isArray(kycdetails)  == true ) &&
        //    (flag === "consumer" && conf.twohundredfour.flag === "mandatory" )){
        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.custAuth + "/api/UpdateKYCDocsfromadmin",
          "body": JSON.stringify({
            "atruid": req.body.truID,
            "truid": ctruid,
            "kycdetails": kycdetails,
            "flag": "admin"
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          res.json(newjson);
        });
        // }else{
        //   res.json({
        //     status:"411",
        //     message: 'Please Follow Fields Validation Documentation, your JSON structure is incorrect.'
        //         }
      }
    }
  )
}




exports.twohundredfive = function (req, res) {
  //to update consumer kycdocs from admin in DB.
  // var bearer = req.headers.authorization;
  // var array = bearer.split(" ");

  // if (array[1] != token23){
  //   res.json({status : "401",message: "Unauthorized user!"});
  // }else{
  KycAll.find(
    { truID: req.body.truID }, function (err, docs) {
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no Admin user was returned."
        });
      } else {
        var amtruid = req.body.amTruID;
        var trackingid = req.body.trackingID;
        var letterNumber = /^[0-9]+$/;
        // if((truid && conf.hundredseventy.truID === "mandatory"  && truid.length == 16 && truid.match(letterNumber)) &&
        //     (trackingid && conf.hundredseventy.trackingID === "mandatory"  && trackingid.length == 13 && trackingid.match(letterNumber))){

        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.assetmanagerStock + "/api/assetmanagerstockindetails",
          "body": JSON.stringify({
            "truid": amtruid,
            "trackingid": trackingid
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          res.json(newjson);
        }
        )
        // }else{
        //   res.json({
        //     status:"411",
        //     message: 'Please Follow Fields Validation Documentation, your JSON structure is incorrect.'
        //         }
      }
    }
  )
}



exports.twohundredseven = function (req, res) {
  //to update consumer kycdocs from admin in DB.
  // var bearer = req.headers.authorization;
  // var array = bearer.split(" ");

  // if (array[1] != token23){
  //   res.json({status : "401",message: "Unauthorized user!"});
  // }else{
  KycAll.find(
    { truID: req.body.truID }, function (err, docs) {
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no Admin user was returned."
        });
      } else {

        // if((truid && conf.hundredseventy.truID === "mandatory"  && truid.length == 16 && truid.match(letterNumber)) &&
        //     (trackingid && conf.hundredseventy.trackingID === "mandatory"  && trackingid.length == 13 && trackingid.match(letterNumber))){

        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.remmitAuth + "/api/countallentity",
          "body": JSON.stringify({
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          res.json(newjson);
        }
        )
        // }else{
        //   res.json({
        //     status:"411",
        //     message: 'Please Follow Fields Validation Documentation, your JSON structure is incorrect.'
        //         }
      }
    }
  )
}


exports.twohundredeight = function (req, res) {
  //to update consumer kycdocs from admin in DB.
  // var bearer = req.headers.authorization;
  // var array = bearer.split(" ");

  // if (array[1] != token23){
  //   res.json({status : "401",message: "Unauthorized user!"});
  // }else{
  KycAll.find(
    { truID: req.body.truID }, function (err, docs) {
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no Admin user was returned."
        });
      } else {

        // if((truid && conf.hundredseventy.truID === "mandatory"  && truid.length == 16 && truid.match(letterNumber)) &&
        //     (trackingid && conf.hundredseventy.trackingID === "mandatory"  && trackingid.length == 13 && trackingid.match(letterNumber))){

        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.assetstoreAuth + "/api/countallassetstore",
          "body": JSON.stringify({
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          res.json(newjson);
        }
        )
        // }else{
        //   res.json({
        //     status:"411",
        //     message: 'Please Follow Fields Validation Documentation, your JSON structure is incorrect.'
        //         }
      }
    }
  )
}

exports.twohundrednine = function (req, res) {
  //to update consumer kycdocs from admin in DB.
  // var bearer = req.headers.authorization;
  // var array = bearer.split(" ");

  // if (array[1] != token23){
  //   res.json({status : "401",message: "Unauthorized user!"});
  // }else{
  KycAll.find(
    { truID: req.body.truID }, function (err, docs) {
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no Admin user was returned."
        });
      } else {

        // if((truid && conf.hundredseventy.truID === "mandatory"  && truid.length == 16 && truid.match(letterNumber)) &&
        //     (trackingid && conf.hundredseventy.trackingID === "mandatory"  && trackingid.length == 13 && trackingid.match(letterNumber))){

        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.assetmanagerAuth + "/api/countallassetmanager",
          "body": JSON.stringify({
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          res.json(newjson);
        }
        )
        // }else{
        //   res.json({
        //     status:"411",
        //     message: 'Please Follow Fields Validation Documentation, your JSON structure is incorrect.'
        //         }
      }
    }
  )
}


exports.twohundreten = function (req, res) {
  //to update consumer kycdocs from admin in DB.
  // var bearer = req.headers.authorization;
  // var array = bearer.split(" ");

  // if (array[1] != token23){
  //   res.json({status : "401",message: "Unauthorized user!"});
  // }else{
  KycAll.find(
    { truID: req.body.truID }, function (err, docs) {
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no Admin user was returned."
        });
      } else {

        // if((truid && conf.hundredseventy.truID === "mandatory"  && truid.length == 16 && truid.match(letterNumber)) &&
        //     (trackingid && conf.hundredseventy.trackingID === "mandatory"  && trackingid.length == 13 && trackingid.match(letterNumber))){

        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.custAuth + "/api/countallconsumer",
          "body": JSON.stringify({
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          res.json(newjson);
        }
        )
        // }else{
        //   res.json({
        //     status:"411",
        //     message: 'Please Follow Fields Validation Documentation, your JSON structure is incorrect.'
        //         }
      }
    }
  )
}





exports.twohundreleven = function (req, res) {
  //to update assetmanager kycdocs from admin in DB.

  KycAll.find(
    { truID: req.body.truID }, function (err, docs) {
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no Admin user was returned."
        });
      } else {
        let kycdetails = req.body.KYCDetails,
          truid = req.body.amTruID,
          kycflag = req.body.KYCFlag;

        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.assetmanagerAuth + "/api/addkycdocs",
          "body": JSON.stringify({
            "truid": truid,
            "kycdetails": kycdetails,
            "kycflag": kycflag
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          res.json(newjson);
        }
        )
      }
    }
  )
}




exports.twohundredtwelve = function (req, res) {
  //to update assetmanager kycdocs from admin in DB.

  KycAll.find(
    { truID: req.body.truID }, function (err, docs) {
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no Admin user was returned."
        });
      } else {
        let companytype = req.body.companyType,
          companyname = req.body.companyName,
          directorsaadhar = req.body.directorsAadhar,
          truid = req.body.amTruID;

        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.assetmanagerAuth + "/api/addkycdocsdirectors",
          "body": JSON.stringify({
            "truid": truid,
            "companytype": companytype,
            "companyname": companyname,
            "directorsaadhar": directorsaadhar
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
  )
}


exports.twohundredthirteen = function (req, res) {
  //to update assetmanager kycdocs from admin in DB.

  KycAll.find(
    { truID: req.body.truID }, function (err, docs) {
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no Admin user was returned."
        });
      } else {
        let companytype = req.body.companyType,
          companyname = req.body.companyName,
          partnersaadhar = req.body.partnersAadhar,
          truid = req.body.amTruID;

        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.assetmanagerAuth + "/api/addkycdocsforpartners",
          "body": JSON.stringify({
            "truid": truid,
            "companytype": companytype,
            "companyname": companyname,
            "partnersaadhar": partnersaadhar
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
  )
}




exports.twohundredfourteen = function (req, res) {
  //to update entity wallet configuration from admin in loki and DB.

  KycAll.find(
    { truID: req.body.truID }, function (err, docs) {
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no Admin user was returned."
        });
      } else {
        let rtruid = req.body.rTruID,
          walletaccess = req.body.walletAccess,
          paymentmodeaccess = req.body.paymentModeAccess,
          paymentgateway = req.body.paymentGateway,
          redeemtowallet = req.body.redeemToWallet;

        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.entityStock + "/api/updatewalletaccessadmin",
          "body": JSON.stringify({
            "fromtruid": req.body.truID,
            "truid": rtruid,
            "walletaccess": walletaccess,
            "paymentmodeaccess": paymentmodeaccess,
            "paymentgateway": paymentgateway,
            "redeemtowallet": redeemtowallet
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
  )
}

exports.twohundredfifteen = function (req, res) {
  //to update entity consumers txn acccess configuration from admin in loki and DB.

  KycAll.find(
    { truID: req.body.truID }, function (err, docs) {
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no Admin user was returned."
        });
      } else {
        let rtruid = req.body.rTruID,
          buy = req.body.buy,
          redeemcash = req.body.redeemCash,
          transfer = req.body.transfer;

        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.entityStock + "/api/updateconsumeraccessadmin",
          "body": JSON.stringify({
            "fromtruid": req.body.truID,
            "truid": rtruid,
            "buy": buy,
            "redeemcash": redeemcash,
            "transfer": transfer
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
  )
}


exports.twohundredsixteen = function (req, res) {
  //to update entity self txn acccess configuration from admin in loki and DB.

  KycAll.find(
    { truID: req.body.truID }, function (err, docs) {
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no Admin user was returned."
        });
      } else {
        let rtruid = req.body.rTruID,
          buy = req.body.buy,
          redeemcash = req.body.redeemCash,
          transfer = req.body.transfer;

        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.entityStock + "/api/updateentityselfaccessadmin",
          "body": JSON.stringify({
            "fromtruid": req.body.truID,
            "truid": rtruid,
            "buy": buy,
            "redeemcash": redeemcash,
            "transfer": transfer,
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
  )
}

exports.twohundredeighteen = function (req, res) {
  //to update entity transaction limit acccess configuration from admin in loki and DB.
  var truid = req.body.truID;
  KycAll.find(
    { truID: truid }, function (err, docs) {
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no Admin user was returned."
        });
      } else {
        let rtruid = req.body.rTruID,
          txnamountlimit = req.body.txnAmountLimit,
          checklimit = req.body.checkLimit;

        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.entityStock + "/api/updatetransactionslimitadmin",
          "body": JSON.stringify({
            "truid": rtruid,
            "fromtruid": truid,
            "txnamountlimit": txnamountlimit,
            "checklimit": checklimit
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
  )
}


exports.twohundredninteen = function (req, res) {
  request.post({
    "headers": { "content-type": "application/json" },
    "url": conf.reqip + ":" + conf.remmitAuth + "/api/parententityreport",
    "body": JSON.stringify(req.body)
  }, (error, response, body) => {
    if (error) {
      return console.dir(error);
    }
    var newjson = JSON.parse(body);
    res.json(newjson);
  });
}
exports.twohundredtwenty = function (req, res) {
  request.post({
    "headers": { "content-type": "application/json" },
    "url": conf.reqip + ":" + conf.custTxn + "/api/entitynetworktxnreportadmin",
    "body": JSON.stringify(req.body)
  }, (error, response, body) => {
    if (error) {
      return console.dir(error);
    }
    var newjson = JSON.parse(body);
    res.json(newjson);
  }
  )
}



exports.twohundredtwentyone = function (req, res) {
  request.post({
    "headers": { "content-type": "application/json" },
    "url": conf.reqip + ":" + conf.custAuth + "/api/allconsumerreportadmin",
    "body": JSON.stringify({})
  }, (error, response, body) => {
    if (error) {
      return console.dir(error);
    }
    var newjson = JSON.parse(body);
    res.json(newjson);
  }
  )
}



exports.twohundredtwentytwo = function (req, res) {
  var truid = req.body.truID;                                                     //enter Admin truid
  KycAll.find(
    { truID: truid }, function (err, docs) {                                       //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {
        var rtruid = req.body.rTruID;
        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.entityStock + "/api/showconfigurations",
          "body": JSON.stringify({
            "truid": rtruid
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          res.json(newjson);
        }
        )
      }
    }
  )
}


exports.twohundredtwentythree = function (req, res) {
  var truid = req.body.truID;                                                     //enter Admin truid
  KycAll.find(
    { truID: truid }, function (err, docs) {                                       //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {
        var rtruid = req.body.rTruID;
        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.entityStock + "/api/readtxnconfigurationlogs",
          "body": JSON.stringify({
            "truid": rtruid
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          res.json(newjson);
        }
        )
      }
    }
  )
}




exports.twohundredtwentyfour = function (req, res) {
  var truid = req.body.truID,
    flag = req.body.flag,
    startdate = req.body.startDate,
    enddate = req.body.endDate,                                                   //enter Admin truid
    reqflag = req.body.reqFlag,
    reqport = "0";

  if (reqflag === "consumer") {
    reqport = conf.custTxn + "/api/allwalletlogreport";
  } else if (reqflag === "assetmanager") {
    reqport = conf.assetmanagerTxn + "/api/dlrallwalletlogreport";
  } else if (reqflag === "entity") {
    reqport = conf.entityTxn + "/api/enallwalletlogreport";
  }
  KycAll.find(
    { truID: truid }, function (err, docs) {                                       //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {
        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + reqport,
          "body": JSON.stringify({
            "flag": flag,
            "startdate": startdate,
            "enddate": enddate
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          res.json(newjson);
        }
        )
      }
    }
  )
}




exports.twohundredtwentyfive = function (req, res) {
  KycAll.find(
    { truID: req.body.truID }, function (err, docs) {
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no Admin user was returned."
        });
      } else {
        let truid = req.body.rTruID,
          flag = req.body.flag,
          startdate = req.body.startDate,
          enddate = req.body.endDate;

        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.custAuth + "/api/referencelistforadmin",
          "body": JSON.stringify({
            "truid": truid,
            "flag": flag,
            "startdate": startdate,
            "enddate": enddate
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
  )
}




exports.twohundredtwentysix = function (req, res) {
  var truid = req.body.truID,
    flag = req.body.flag,
    startdate = req.body.startDate,
    enddate = req.body.endDate,                                                   //enter Admin truid
    reqflag = req.body.reqFlag,
    reqport = "0";

  if (reqflag === "consumer") {
    reqport = conf.custTxn + "/api/atomlogreportadmin";
  } else if (reqflag === "assetmanager") {
    reqport = conf.assetmanagerTxn + "/api/dlratomlogreportadmin";
  } else if (reqflag === "entity") {
    reqport = conf.entityTxn + "/api/enatomlogreportadmin";
  }
  KycAll.find(
    { truID: truid }, function (err, docs) {                                       //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {
        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + reqport,
          "body": JSON.stringify({
            "flag": flag,
            "startdate": startdate,
            "enddate": enddate
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          res.json(newjson);
        }
        )
      }
    }
  )
}


exports.twohundredtwentyseven = function (req, res) {
  var truid = req.body.truID,
    type = req.body.type,
    invoice = req.body.invoice,                                                   //enter Admin truid
    reqflag = req.body.reqFlag,
    reqport = "0",
    reqroute = "printinvoiceadmin";

  if (reqflag === "consumer") {
    reqport = conf.custTxn;
    if (type === "buy" || type === "redeem" || type === "redeemCash") {
      reqroute = "/api/printinvoiceadmin";
    } else if (type === "transfer") {
      reqroute = "/api/printinvoicec2cadmin";
    }
  } else if (reqflag === "assetmanager") {
    reqport = conf.assetmanagerTxn;
    reqroute = "/api/dlrprintinvoiceadmin";
  } else if (reqflag === "entity") {
    reqport = conf.entityTxn;
    if (type === "buy" || type === "redeem" || type === "redeem") {
      reqroute = "/api/enprintinvoiceadmin";
    }
  }


  KycAll.find(
    { truID: truid }, function (err, docs) {                                       //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {
        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + reqport + reqroute,
          "body": JSON.stringify({
            "invoice": invoice
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          res.json(newjson);
        }
        )
      }
    }
  )
}



exports.twohundredtwentyeight = function (req, res) {
  // var bearer = req.headers.authorization;
  // var array = bearer.split(" ");
  // if (array[1] != token2){
  //   res.json({status : "401",message: "Unauthorized user!"});
  // }else{
  KycAll.find(
    { truID: req.body.truID }, function (err, docs) {                                       //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {

        var kycdetails = req.body.KYCDetails,
          truid = req.body.cTruID;
        // var number = req.body.number;
        // var file = req.body.file;
        // var letterNumber = /^[0-9]+$/;

        // if((title && conf.thirtythree.title === "mandatory"  && title.length >= 0 && title.length <= 30) &&
        //   (number && conf.thirtythree.number === "mandatory"  && number.length >= 0 && number.length <= 16) &&
        //   (file && conf.thirtythree.file === "mandatory"  && file.length >= 0 && file.length <= 21) &&
        //   (truid && conf.thirtythree.truID === "mandatory" &&  truid.length == 16 && truid.match(letterNumber))){
        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.assetstoreAuth + "/api/addkycdocs",
          "body": JSON.stringify({
            "truid": truid,
            "kycdetails": kycdetails,
            //  "title" : title,
            //  "number" : number,
            //  "file" : file,
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          res.json(newjson);
        });
        // }else{
        //   res.json({
        //     status:"411",
        //     message: 'Please Follow Fields Validation Documentation, your JSON structure is incorrect.'
        //         }
        // )
      }
    }
  )
}


exports.twohundredtwentynine = function (req, res) {
  var truid = req.body.truID,               //admin truid
    kycflag = req.body.KYCFlag,
    buy = req.body.buy,
    redeemcash = req.body.redeemCash,
    transfer = req.body.transfer,
    redeemtobank = req.body.redeemToBank,
    appliedOn = req.body.appliedOn;

  KycAll.find(
    { truID: truid }, function (err, docs) {
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no Admin user was returned."
        });
      }
      else {
        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.truRates + "/api/updateconsumeraccess",
          "body": JSON.stringify({
            "truid": truid,
            "appliedOn": appliedOn,
            "kycflag": kycflag,
            "buy": buy,
            "redeemcash": redeemcash,
            "transfer": transfer,
            "redeemtobank": redeemtobank
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          //console.dir(JSON.parse(body));
          res.json(newjson);
        }
        )
      }
    }
  )
}


exports.twohundredthirty = function (req, res) {
  // update min max trasaction limit for buy for consumers
  var truid = req.body.truID,               //admin truid
    kycflag = req.body.KYCFlag,
    goldmax = parseFloat(req.body.goldMax),
    goldmin = parseFloat(req.body.goldMin),
    silvermax = parseFloat(req.body.silverMax),
    silvermin = parseFloat(req.body.silverMin);
  //var redeemInBankMax = parseFloat(req.body.redeemCashToBankMax),
  // redeemInBankMin = parseFloat(req.body.redeemCashToBankMin);

  KycAll.find(
    { truID: truid }, function (err, docs) {
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no Admin user was returned."
        });
      } else {
        var reqflag = req.body.reqFlag,
          reqroute;
        if (reqflag === "buy") {
          reqroute = "updatebuylimitconsumer";
        } else if (reqflag === "redeemCash") {
          reqroute = "updateredeemCashlimitconsumer";
        } else if (reqflag === "transfer") {
          reqroute = "updatetransferlimitconsumer";
        } else if (reqflag === "conversion") {
          reqroute = "updateconversionlimitconsumer";
        }
        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.truRates + "/api/" + reqroute,
          "body": JSON.stringify({
            "truid": truid,
            "appliedOn": req.body.appliedOn,
            "kycflag": kycflag,
            "goldmax": goldmax,
            "goldmin": goldmin,
            "silvermax": silvermax,
            "silvermin": silvermin,
            // "redeeminbankmax": redeemInBankMax,
            // "redeeminbankmin": redeemInBankMin
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          //console.dir(JSON.parse(body));
          res.json(newjson);
        }
        )
      }
    }
  )
}

exports.twohundredthirtyone = function (req, res) {
  var truid = req.body.truID, //
    kycflag = req.body.KYCFlag,
    addmoneymin = parseFloat(req.body.addMoneyMin),
    addmoneymax = parseFloat(req.body.addMoneyMax),
    wtobankmin = parseFloat(req.body.walletToBankMin),
    wtobankmax = parseFloat(req.body.walletToBankMax),
    walletlimit = parseFloat(req.body.walletLimit),
    txnamountlimit = parseFloat(req.body.txnAmountLimit),
    paymentmodeaccess = req.body.paymentModeAccess,
    walletaccess = req.body.walletAccess,
    redeemtowallet = req.body.redeemToWallet,
    wallettobank = req.body.walletToBank;

  KycAll.find(
    { truID: truid }, function (err, docs) {
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no Admin user was returned."
        });
      } else {
        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.truRates + "/api/updatewalletPGconfigconsumer",
          "body": JSON.stringify({
            "truid": truid,
            "appliedOn": req.body.appliedOn,
            "kycflag": kycflag,
            "addmoneymin": addmoneymin,
            "addmoneymax": addmoneymax,
            "wtobankmin": wtobankmin,
            "wtobankmax": wtobankmax,
            "walletlimit": walletlimit,
            "txnamountlimit": txnamountlimit,
            "paymentmodeaccess": paymentmodeaccess,
            "walletaccess": walletaccess,
            "redeemtowallet": redeemtowallet,
            "wallettobank": wallettobank
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          res.json(newjson);
        }
        )
      }
    }
  )
}
exports.twohundredthirtytwo = function (req, res) {
  var truid = req.body.truID;
  var ctruid = req.body.cTruID;
  var appliedon = req.body.appliedOn;
  KycAll.find(
    { truID: truid }, function (err, docs) {
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no Admin user was returned."
        });
      } else {
        let kycFlags = req.body.KYCFlag;
        let jsonin = {
          "kycflag": kycFlags,
          "appliedOn": appliedon
        }
        ctruid ? jsonin.truid = ctruid : undefined;
        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.truRates + "/api/showconsumerconfigurations",
          "body": JSON.stringify(jsonin)
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          res.json(newjson);
        }
        )
      }
    }
  )
}




exports.twohundredthirtythree = function (req, res) {

  request.post({
    "headers": { "content-type": "application/json" },
    "url": conf.reqip + ":" + conf.custAuth + "/api/consumerupdatekycflagadmin",
    "body": JSON.stringify(req.body)
  }, (error, response, body) => {
    if (error) {
      return console.dir(error);
    }
    var newjson = JSON.parse(body);
    res.json(newjson);
  }
  )
}




exports.twohundredthirtyfour = function (req, res) {

  // var bearer = req.headers.authorization;
  // var array = bearer.split(" ");

  // if (array[1] != token10){
  //   res.json({status : "401",message: "Unauthorized user!"});
  // }else{
  var tpin = req.body.tPIN;
  var truid = req.body.truID;
  var letterNumber = /^[0-9]+$/;

  // if((tpin && conf.ninetyone.tPIN === "mandatory" && tpin.length == 6 && tpin.match(letterNumber)) &&
  //    (rtruid && conf.ninetyone.rTruID === "mandatory" && rtruid.length == 16 && rtruid.match(letterNumber))){

  request.post({
    "headers": { "content-type": "application/json" },
    "url": conf.adminReqIP + ":" + conf.adminAuth + "/api/updatetransactionpin",
    "body": JSON.stringify({
      "truid": truid,
      "tpin": tpin
    })
  }, (error, response, body) => {
    if (error) {
      return console.dir(error);
    }
    var newjson = JSON.parse(body);
    //console.dir(JSON.parse(body));
    res.json(newjson);
  }
  )
}
//  else{
//   res.json(gen.respFieldValidation);
//     }
//   }
// }


exports.twohundredthirtyfive = function (req, res) {

  // var bearer = req.headers.authorization;
  // var array = bearer.split(" ");

  // if (array[1] != token10){
  //   res.json({status : "401",message: "Unauthorized user!"});
  // }else{
  var tpin = req.body.tPIN;
  var truid = req.body.truID;
  var letterNumber = /^[0-9]+$/;

  // if((tpin && conf.ninetytwo.tPIN === "mandatory" && tpin.length == 6 && tpin.match(letterNumber)) &&
  //    (rtruid && conf.ninetytwo.rTruID === "mandatory" && rtruid.length == 16 && rtruid.match(letterNumber))){

  request.post({
    "headers": { "content-type": "application/json" },
    "url": conf.adminReqIP + ":" + conf.adminAuth + "/api/verifytransactionpin",
    "body": JSON.stringify({
      "truid": truid,
      "tpin": tpin
    })
  }, (error, response, body) => {
    if (error) {
      return console.dir(error);
    }
    var newjson = JSON.parse(body);
    //console.dir(JSON.parse(body));
    res.json(newjson);
  }
  )
}
//  else{
//   res.json(gen.respFieldValidation);
//     }
//   }
// }






exports.twohundredthirtyseven = function (req, res) {
  var truid = req.body.truID,
    startdate = req.body.startDate,
    dateflag = req.body.dateFlag;

  KycAll.find(
    { truID: truid }, function (err, docs) {                                       //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {
        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.remmitAuth + "/api/showallentityadmin",
          "body": JSON.stringify({
            "startdate": startdate,
            "dateflag": dateflag
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          res.json(newjson);
        }
        )
      }
    }
  )
}





exports.twohundredthirtynine = function (req, res) {
  var truid = req.body.truID,
    startdate = req.body.startDate,
    dateflag = req.body.dateFlag;

  KycAll.find(
    { truID: truid }, function (err, docs) {                                       //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {
        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.assetstoreAuth + "/api/listassetstoreadmin",
          "body": JSON.stringify({
            "startdate": startdate,
            "dateflag": dateflag
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          res.json(newjson);
        }
        )
      }
    }
  )
}



exports.twohundredforty = function (req, res) {
  var truid = req.body.truID,
    startdate = req.body.startDate,
    dateflag = req.body.dateFlag;

  KycAll.find(
    { truID: truid }, function (err, docs) {                                       //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {
        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.assetmanagerAuth + "/api/allassetmanagerlistadmin",
          "body": JSON.stringify({
            "startdate": startdate,
            "dateflag": dateflag
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          res.json(newjson);
        }
        )
      }
    }
  )
}




exports.twohundredfortyone = function (req, res) {
  var truid = req.body.truID;                                                     //enter Admin truid
  KycAll.find(
    { truID: truid }, function (err, docs) {                                       //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {
        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.custAuth + "/api/allbullionconversionreportadmin",
          "body": JSON.stringify({})
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          res.json(newjson);
        }
        )
      }
    }
  )
}



exports.twohundredfortytwo = function (req, res) {
  var truid = req.body.truID;                                                     //enter Admin truid
  KycAll.find(
    { truID: truid }, function (err, docs) {                                       //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {
        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.entityTxn + "/api/allentitytoassetmanagertxnreportadmin",
          "body": JSON.stringify({})
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          res.json(newjson);
        }
        )
      }
    }
  )
}



exports.twohundredfortythree = function (req, res) {
  var truid = req.body.truID;                                                     //enter Admin truid
  KycAll.find(
    { truID: truid }, function (err, docs) {                                       //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {
        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.assetmanagerTxn + "/api/allassetmanagertoassetmanagertxnreportadmin",
          "body": JSON.stringify({})
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          res.json(newjson);
        }
        )
      }
    }
  )
}



exports.thousandone = function (req, res) {
  var truid = req.body.truID;

  request.post({
    "headers": { "content-type": "application/json" },
    "url": conf.adminReqIP + ":" + conf.adminAuth + "/api/profile",
    "body": JSON.stringify({
      "truid": truid
    })
  }, (error, response, body) => {
    if (error) {
      return console.dir(error);
    }
    var newjson = JSON.parse(body);
    res.json(newjson);
  });
};





exports.twohundredfortyfour = function (req, res) {
  var type = req.body.type;

  var bodyobj = {
    "mobile": req.body.mobile,
    "type": type
  }
  if (type === "mHash") {
    bodyobj.mhash = req.headers.mhash;
  }
  request.post({
    "headers": { "content-type": "application/json" },
    "url": conf.adminReqIP + ":5111/api/generateotp",
    "body": JSON.stringify(bodyobj)
  }, (error, response, body) => {
    if (error) {
      return console.dir(error);
    }
    var newjson = JSON.parse(body);
    res.json(newjson);
  }
  )
}


exports.twohundredfortyfive = function (req, res) {
  var type = req.body.type;

  var bodyobj = {
    "mobile": req.body.mobile,
    "otp": req.body.OTP,
    "type": type
  }
  if (type === "mHash") {
    bodyobj.mhash = req.headers.mhash;
  }
  request.post({
    "headers": { "content-type": "application/json" },
    "url": conf.adminReqIP + ":5111/api/verifyotp",
    "body": JSON.stringify(bodyobj)
  }, (error, response, body) => {
    if (error) {
      return console.dir(error);
    }
    var newjson = JSON.parse(body);
    res.json(newjson);
  }
  )
}





exports.twohundredfortysix = function (req, res) {
  var truid = req.body.truID;

  KycAll.find(
    { truID: truid }, function (err, docs) {                                       //admin user validation from db.
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no body was returned."
        });
      } else {
        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.assetmanagerAuth + "/api/updateliverateassetmanager",
          "body": JSON.stringify({
            truid: req.body.amTruID
          })
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          res.json(newjson);
        }
        )
      }
    }
  )
}
exports.twohundredfortyseven = function (req, res) {
  var body = req.body;
  request.post({
    "headers": { "content-type": "application/json" },
    "url": conf.emailreqip + ":3114/sendBulkEmail",
    "body": JSON.stringify({ body })
  }, (error, response, body) => {
    console.log("error", error)
    console.log("body", body)
    if (error) {
      return console.dir(error);
    }
    var newjson = JSON.parse(body);
    res.json(newjson);
  });
};

exports.twohundredfortyeight = function (req, res) {
  var body = req.body;
  request.post({
    "headers": { "content-type": "application/json" },
    "url": conf.emailreqip + ":3114/sendBulkSMS",
    "body": JSON.stringify({ body })
  }, (error, response, body) => {
    if (error) {
      return console.dir(error);
    }
    var newjson = JSON.parse(body);
    res.json(newjson);
  });
};

exports.twohundredfortynine = function (req, res) {
  // Entire node entity network report

  KycAll.find(
    { truID: req.body.truID }, function (err, docs) {
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no Admin user was returned."
        });
      } else {
        let truid = req.body.rTruID,
          dateflag = req.body.dateFlag,
          startdate = req.body.startDate,
          enddate = req.body.endDate;

        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.remmitAuth + "/api/nodeentityreport",
          "body": JSON.stringify({
            "truid": truid,
            "dateflag": dateflag,
            "startdate": startdate,
            "enddate": enddate
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
  )
}

exports.twohundredfifty = function (req, res) {

  if (req.body.reqFlag === "consumer") {
    KycAll.find(
      { truID: req.body.truID }, function (err, docs) {
        if (!docs.length) {
          res.json({
            status: "204",
            messege: "The request was successful but no Admin user was returned."
          });
        } else {
          let dateflag = req.body.dateFlag,
            startdate = req.body.startDate,
            enddate = req.body.endDate;

          request.post({
            "headers": { "content-type": "application/json" },
            "url": conf.reqip + ":" + conf.custTxn + "/api/bankLoglogreportadmin",
            "body": JSON.stringify({
              "dateflag": dateflag,
              "startdate": startdate,
              "enddate": enddate
            })
          }, (error, response, body) => {
            if (error) {
              return console.dir(error);
            }
            var newjson = JSON.parse(body);
            res.json(newjson);
          });
        }
      })
  } else if (req.body.reqFlag === "assetmanager") {
    res.json({ status: "200", resource: [] });
  } else if (req.body.reqFlag === "entity") {
    let dateflag = req.body.dateFlag,
      startdate = req.body.startDate,
      enddate = req.body.endDate;
    request.post({
      "headers": { "content-type": "application/json" },
      "url": conf.reqip + ":" + conf.entityTxn + "/api/bankpartnerreportlog",
      "body": JSON.stringify({
        "dateflag": dateflag,
        "startdate": startdate,
        "enddate": enddate
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

exports.twohundredfiftyone = async function (req, res) {
  var docTxn = [];
  if (req.body.isPeople == "consumer") {
    docTxn = await custLogs.aggregate([{ $match: { "truID": req.body.ctruid, invoice: req.body.invoice } },
    {
      $project: {
        TranID: 1, RefNo: 1, Ben_Acct_No: { $concat: ["XXXXXXXXX", "$Ben_Last4"] }, Mode_of_Pay: 1, charges: 1, BenIFSC: 1
      }
    },
    { $limit: 1 }
    ]);
  }
  else {
    docTxn = await remmitLogs.aggregate([{ $match: { "truID": req.body.ctruid, invoice: req.body.invoice } },
    {
      $project: {
        TranID: 1, RefNo: 1, Ben_Acct_No: { $concat: ["XXXXXXXXX", "$Ben_Last4"] }, Mode_of_Pay: 1, charges: 1, BenIFSC: 1
      }
    },
    { $limit: 1 }
    ]);
  }
  if (docTxn.length > 0) {
    var transid = docTxn[0].TranID, refno = docTxn[0].RefNo;
    let inputString = '';
    inputString += "tranID";
    inputString += '=';
    inputString += transid;
    inputString += '~';
    inputString += "RefNo";
    inputString += '=';
    inputString += refno;
    var sha512str = sha512(inputString, "~*Dadda6565*Yadav*~");
    request.post({
      "headers": { "content-type": "application/json", "Authorization": "Bearer " + conf.bankreqBearer },
      "url": conf.bankrequrl + "/v1/singlePaymentStatus",
      "body": JSON.stringify({
        "tranID": transid,
        "RefNo": refno,
        "BenIFSC": docTxn[0].BenIFSC,
        "Ben_Acct_No": docTxn[0].Ben_Acct_No,
        "Mode_of_Pay": docTxn[0].Mode_of_Pay,
        "charges": docTxn[0].charges,
        "signature": sha512str
      })
    }, (error, response, body) => {
      if (error) {
        return console.dir(error);
      }
      var newjson = JSON.parse(body);
      if(newjson.status == "200"){
        newjson.resource.Ben_Acct_No = docTxn[0].Ben_Acct_No;
        newjson.resource.Mode_of_Pay = docTxn[0].Mode_of_Pay;
        res.json(newjson);
      }else{
        res.json(newjson);
      }
    });
  }
  else {
    res.send({ "status": "411", message: "no record found" })
  }
}


exports.twohundredsixty = function (req, res) {
  try {
    var truid = req.body.truID,
      adstitle = req.body.adsTitle,
      images = req.body.images,
      description = req.body.description,
      expirydate = req.body.expiryDate,
      accessflag = req.body.accessFlag,
      type = req.body.type,
      subtype = req.body.subType,
      bannertype = req.body.bannerType,
      letterNumber = /^[0-9]+$/;

    if ((truid && truid.length === 16 && truid.match(letterNumber)) &&
      (adstitle) &&
      (images) &&
      (description) &&
      (expirydate) &&
      (accessflag) &&
      (type) &&
      (subtype) &&
      (bannertype)
    ) {
      KycAll.find(
        { truID: truid }, function (err, docs) {
          if (!docs.length) {
            res.status(204).json({
              status: "204",
              messege: "The request was successful but no Admin user was returned."
            });
          } else {
            try {
              request.post({
                "headers": { "content-type": "application/json" },
                "url": conf.reqip + ":" + conf.truRates + "/apicreatePromotion",
                "body": JSON.stringify({
                  "truid": truid,
                  "adstitle": adstitle,
                  "images": images,
                  "description": description,
                  "expirydate": expirydate,
                  "accessflag": accessflag,
                  "type": type,
                  "subtype": subtype,
                  "bannertype": bannertype,
                })
              }, (error, response, body) => {
                if (error) {
                  console.dir(error);
                  res.status(500).json({ status: 500, message: "Internal server error" });
                }
                else {
                  if (response.statusCode == 200) {
                    var newjson = JSON.parse(body);
                    res.json(newjson);
                  } else {
                    res.status(response.statusCode || 204).json({ status: response.statusCode || 204, message: "something went wrong" })
                  }
                }
              });
            }
            catch (ex) {
              console.log(ex)
              res.status(500).json({ status: 500, message: "Invalid Request" });
            }

          }
        })
    } else {
      res.status(411).json({ status: 411, message: "Invalid Request" });
    }
  }
  catch (ex) {
    console.log(ex)
    res.status(500).json({ status: 500, message: "Invalid Request" });
  }

}

exports.twohundredsixtyone = function (req, res) {
  try {
    var truid = req.body.truID,
      adsid = req.body.adsId,
      adstitle = req.body.adsTitle,
      images = req.body.images,
      description = req.body.description,
      expirydate = req.body.expiryDate,
      accessflag = req.body.accessFlag,
      type = req.body.type,
      subtype = req.body.subType,
      bannertype = req.body.bannerType,
      letterNumber = /^[0-9]+$/;

    if ((truid && truid.length === 16 && truid.match(letterNumber)) &&
      (adsid) &&
      (adstitle) &&
      (images) &&
      (description) &&
      (expirydate) &&
      (accessflag) &&
      (type) &&
      (subtype) &&
      (bannertype)
    ) {
      KycAll.find(
        { truID: truid }, function (err, docs) {
          if (!docs.length) {
            res.status(204).json({
              status: "204",
              messege: "The request was successful but no Admin user was returned."
            });
          } else {
            try {
              request.post({
                "headers": { "content-type": "application/json" },
                "url": conf.reqip + ":" + conf.truRates + "/apiupdatePromotion",
                "body": JSON.stringify({
                  "truid": truid,
                  "adsid": adsid,
                  "adstitle": adstitle,
                  "images": images,
                  "description": description,
                  "expirydate": expirydate,
                  "accessflag": accessflag,
                  "type": type,
                  "subtype": subtype,
                  "bannertype": bannertype,
                })
              }, (error, response, body) => {
                if (error) {
                  console.dir(error);
                  res.status(500).json({ status: 500, message: "Internal server error" });
                }
                else {
                  if (response.statusCode == 200) {
                    var newjson = JSON.parse(body);
                    res.json(newjson);
                  } else {
                    res.status(response.statusCode || 204).json({ status: response.statusCode || 204, message: "something went wrong" })
                  }
                }
              });
            }
            catch (ex) {
              console.log(ex)
              res.status(500).json({ status: 500, message: "Invalid Request" });
            }

          }
        })
    } else {
      res.status(411).json({ status: 411, message: "Invalid Request" });
    }
  }
  catch (ex) {
    console.log(ex)
    res.status(500).json({ status: 500, message: "Invalid Request" });
  }

}
exports.twohundredsixtytwo = function (req, res) {
  try {
    var truid = req.body.truID,
      letterNumber = /^[0-9]+$/;

    if (truid && truid.length === 16 && truid.match(letterNumber)) {
      KycAll.find(
        { truID: truid }, function (err, docs) {
          if (!docs.length) {
            res.status(204).json({
              status: "204",
              messege: "The request was successful but no Admin user was returned."
            });
          } else {
            try {
              request.post({
                "headers": { "content-type": "application/json" },
                "url": conf.reqip + ":" + conf.truRates + "/apilistpromotionsall",
                "body": JSON.stringify({
                  "truid": truid
                })
              }, (error, response, body) => {
                if (error) {
                  console.dir(error);
                  res.status(500).json({ status: 500, message: "Internal server error" });
                }
                else {
                  if (response.statusCode == 200) {
                    var newjson = JSON.parse(body);
                    res.json(newjson);
                  } else {
                    res.status(response.statusCode || 204).json({ status: response.statusCode || 204, message: "something went wrong" })
                  }
                }
              });
            }
            catch (ex) {
              console.log(ex)
              res.status(500).json({ status: 500, message: "Invalid Request" });
            }

          }
        })
    } else {
      res.status(411).json({ status: 411, message: "Invalid Request" });
    }
  }
  catch (ex) {
    console.log(ex)
    res.status(500).json({ status: 500, message: "Invalid Request" });
  }

}
exports.twohundredsixtythree = function (req, res) {
  try {
    var truid = req.body.truID,
      adsid = req.body.adsId,
      letterNumber = /^[0-9]+$/;

    if ((truid && truid.length === 16 && truid.match(letterNumber)) && (adsid)) {
      KycAll.find(
        { truID: truid }, function (err, docs) {
          if (!docs.length) {
            res.status(204).json({
              status: "204",
              messege: "The request was successful but no Admin user was returned."
            });
          } else {
            try {
              request.post({
                "headers": { "content-type": "application/json" },
                "url": conf.reqip + ":" + conf.truRates + "/apideletePromotion",
                "body": JSON.stringify({
                  "truid": truid,
                  "adsid": adsid
                })
              }, (error, response, body) => {
                if (error) {
                  console.dir(error);
                  res.status(500).json({ status: 500, message: "Internal server error" });
                }
                else {
                  if (response.statusCode == 200) {
                    var newjson = JSON.parse(body);
                    res.json(newjson);
                  } else {
                    res.status(response.statusCode || 204).json({ status: response.statusCode || 204, message: "something went wrong" })
                  }
                }
              });
            }
            catch (ex) {
              console.log(ex)
              res.status(500).json({ status: 500, message: "Invalid Request" });
            }

          }
        })
    } else {
      res.status(411).json({ status: 411, message: "Invalid Request" });
    }
  }
  catch (ex) {
    console.log(ex)
    res.status(500).json({ status: 500, message: "Invalid Request" });
  }

}
exports.twohundredsixtyfour = function (req, res) {
  try {
    var truid = req.body.truID,
      etruid = req.body.eTruID,
      // revenuePercent = req.body.revenuePercent,
      appliedOn = req.body.appliedOn,
      isChargesSet = req.body.isChargesSet,
      partnercharges = req.body.partnerCharges,
      nodecharges = req.body.nodeCharges,
      trasactioncharges = req.body.trasactionCharges,
      tdsPercentage = req.body.tdsPercentage,
      type = req.body.type,
      qty = req.body.promotionQTY,
      letterNumber = /^[0-9]+$/;

    if ((truid && truid.length === 16 && truid.match(letterNumber)) &&
      (etruid && etruid.match(letterNumber)) &&
      (qty)) {
      KycAll.find(
        { truID: truid }, function (err, docs) {
          if (!docs.length) {
            res.status(204).json({
              status: "204",
              messege: "The request was successful but no Admin user was returned."
            });
          } else {
            try {
              request.post({
                "headers": { "content-type": "application/json" },
                "url": conf.reqip + ":" + conf.entityStock + "/api/updateentityRevenuePercent",
                "body": JSON.stringify({
                  "truid": etruid,
                  "fromtruid": truid,
                  "partnercharges": partnercharges,
                  "nodecharges": nodecharges,
                  "trasactioncharges": trasactioncharges,
                  "tdsPercentage": tdsPercentage,
                  "appliedOn": appliedOn,
                  "isChargesSet": isChargesSet,
                  "type": type,
                  "qty": qty
                })
              }, (error, response, body) => {
                if (error) {
                  console.dir(error);
                  res.status(500).json({ status: 500, message: "Internal server error" });
                }
                else {
                  if (response.statusCode == 200) {
                    var newjson = JSON.parse(body);
                    res.json(newjson);
                  } else {
                    res.status(response.statusCode || 204).json({ status: response.statusCode || 204, message: "something went wrong" })
                  }
                }
              });
            }
            catch (ex) {
              console.log(ex)
              res.status(500).json({ status: 500, message: "Invalid Request" });
            }

          }
        })
    } else {
      res.status(411).json({ status: 411, message: "Invalid Request" });
    }
  }
  catch (ex) {
    console.log(ex)
    res.status(500).json({ status: 500, message: "Invalid Request" });
  }

}
exports.twohundredsixtyfive = function (req, res) {
  try {
    var truid = req.body.truID,
      etruid = req.body.eTruID,
      letterNumber = /^[0-9]+$/;

    if ((truid && truid.length === 16 && truid.match(letterNumber)) &&
      (etruid && etruid.match(letterNumber))) {
      KycAll.find(
        { truID: truid }, function (err, docs) {
          if (!docs.length) {
            res.status(204).json({
              status: "204",
              messege: "The request was successful but no Admin user was returned."
            });
          } else {
            try {
              request.post({
                "headers": { "content-type": "application/json" },
                "url": conf.reqip + ":" + conf.entityStock + "/api/entityRevenuechargesHistory",
                "body": JSON.stringify({
                  "truid": etruid
                })
              }, (error, response, body) => {
                if (error) {
                  console.dir(error);
                  res.status(500).json({ status: 500, message: "Internal server error" });
                }
                else {
                  if (response.statusCode == 200) {
                    var newjson = JSON.parse(body);
                    res.json(newjson);
                  } else {
                    res.status(response.statusCode || 204).json({ status: response.statusCode || 204, message: "something went wrong" })
                  }
                }
              });
            }
            catch (ex) {
              console.log(ex)
              res.status(500).json({ status: 500, message: "Invalid Request" });
            }
          }
        })
    } else {
      res.status(411).json({ status: 411, message: "Invalid Request" });
    }
  }
  catch (ex) {
    console.log(ex)
    res.status(500).json({ status: 500, message: "Invalid Request" });
  }

}
exports.twohundredsixtyseven = function (req, res) {
  var body = req.body;
  request.post({
    "headers": { "content-type": "application/json" },
    "url": conf.emailreqip + ":3114/sendEntityEmail",
    "body": JSON.stringify({ body })
  }, (error, response, body) => {
    if (error) {
      return console.dir(error);
    }
    var newjson = JSON.parse(body);
    res.json(newjson);
  });
};

exports.twohundredsixtyeight = function (req, res) {
  var kycflag = req.body.KYCFlag;
  var digitalPayment = req.body.digitalPayment;
  var appliedOn = req.body.appliedOn;
  var truID = req.body.truID;
  var isnum = /(?<=^| )\d+(\.\d+)?(?=$| )/;
  var strnum = ["deny", "allow", "comingsoon", "maintenance", "closed", "disable"];
  var digistrm = ["deny", "allow", "disable"];
  try {
    if ((kycflag && kycflag === "nonKYC" || kycflag === "KYC") && digitalPayment && (isnum.test(digitalPayment.atomLimitMin))
      && (isnum.test(digitalPayment.atomLimitMax)) && (isnum.test(digitalPayment.upiLimitMin)) && (isnum.test(digitalPayment.upiLimitMax)) && (isnum.test(digitalPayment.impsLimitMin))
      && (isnum.test(digitalPayment.impsLimitMax)) && (isnum.test(digitalPayment.neftLimitMin)) && (isnum.test(digitalPayment.neftLimitMax))
      && (strnum.includes(digitalPayment.atom)) && (digistrm.includes(digitalPayment.isIMPS))
      && (digistrm.includes(digitalPayment.isNEFT)) && (digistrm.includes(digitalPayment.isUPICollect)) && (digistrm.includes(digitalPayment.isUPIPayout))) {
      request.post({
        "headers": { "content-type": "application/json" },
        "url": conf.reqip + ":" + conf.truRates + "/api/digitalpayment",
        "body": JSON.stringify({
          "truid": truID,
          "appliedOn": appliedOn,
          "kycflag": kycflag,
          "digitalPayment": digitalPayment
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
      res.json({ status: "401", message: "Field Validation Error...!!!" });
    }
  } catch (ex) {
    res.json({ status: "500", message: "Internal Server Error ...!!!" });
  }
}

exports.twohundredsixtynine = function (req, res) {
  var KYCFlag = req.body.KYCFlag;
  var appliedOn = req.body.appliedOn;
  var check = ["entity", "consumer", "assetmanager"];
  try {
    if (KYCFlag && KYCFlag === "KYC" || KYCFlag === "nonKYC" && check.includes(appliedOn)) {
      request.post({
        "headers": { "content-type": "application/json" },
        "url": conf.reqip + ":" + conf.truRates + "/api/digitalpaymentlist",
        "body": JSON.stringify({
          "KYCFlag": KYCFlag,
          "appliedOn": appliedOn
        })
      }, (error, response, body) => {
        if (error) {
          console.log("err", error);
          res.status(500).json({ status: "500", message: "Internal Server Error" });
        } else {
          console.log("err4", body);
          var newjson = JSON.parse(body);
          res.json(newjson);
        }
      });
    } else {
      res.json({ status: "401", message: "Field Validation Error...!!!" });
    }
  } catch (ex) {
    res.json({ status: "500", message: "Ops! something went wrong..!!!" });
  }
}
exports.twohundredseventy = function (req, res) {
  var kycflag = req.body.KYCFlag;
  var bankslab = req.body.bankSlab;
  var appliedOn = req.body.appliedOn;
  var truID = req.body.truID;

  var isnum = /(?<=^| )\d+(\.\d+)?(?=$| )/;
  var strnum = ["deny", "allow", "comingsoon", "maintenance", "closed", "disabled"];
  var digistrm = ["deny", "allow", "disabled"];
  try {
    if ((kycflag && kycflag === "nonKYC" || kycflag === "KYC") && bankslab && (isnum.test(bankslab.slabAmt)) && (isnum.test(bankslab.NEFTcharges))
      && (isnum.test(bankslab.IMPScharges)) && (isnum.test(bankslab.RTGScharges)) && (isnum.test(bankslab.serviceTax))) {
      request.post({
        "headers": { "content-type": "application/json" },
        "url": conf.reqip + ":" + conf.truRates + "/api/insbankslab",
        "body": JSON.stringify({
          "truid": truID,
          "appliedOn": appliedOn,
          "kycflag": kycflag,
          "bankslab": bankslab
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
      res.json({ status: "401", message: "Field Validation Error...!!!" });
    }
  } catch (ex) {
    res.json({ status: "500", message: "Internal Server Error ...!!!" });
  }
}
exports.twohundredseventyone = function (req, res) {
  try {
    var letterNumber = /^[0-9]+$/;
    var isnum = /(?<=^| )\d+(\.\d+)?(?=$| )/;
    if ((req.body.truID && req.body.truID.length === 16 && letterNumber.test(req.body.truID)) &&
      (req.body.rTruID && req.body.rTruID.length === 16 && letterNumber.test(req.body.rTruID)) &&
      (isnum.test(req.body.normal)) &&
      (isnum.test(req.body.critical)) &&
      (isnum.test(req.body.veryCritical))) {
      KycAll.find({ truID: req.body.truID }).exec(function (err, result) {
        if (err) {
          res.json({ status: "500", message: "Internal Server Error" });
        } else {
          if (!result.length) {
            res.json({ status: "401", message: "Please check entered TruID" });
          } else {
            request.post({
              "headers": { "content-type": "application/json" },
              "url": conf.reqip + ":" + conf.entityStock + "/api/addthreshold",
              "body": JSON.stringify({
                "truid": req.body.rTruID,
                "fromtruid": req.body.truID,
                "normal": req.body.normal,
                "critical": req.body.critical,
                "verycritical": req.body.veryCritical
              })
            }, (error, response, body) => {
              if (error) {
                res.status(500).json({ status: "500", message: "Internal Server Error" });
              } else {
                var newjson = JSON.parse(body);
                res.json(newjson);
              }
            });
          }
        }
      })
    } else {
      res.json({ status: "401", message: "Field Validation Error...!!!" });
    }
  } catch (ex) {
    res.json({ status: "500", message: "Ops! something went wrong..!!!" });
  }
}
exports.twohundredseventytwo = function (req, res) {
  try 
  {
    request.post({
      "headers": { "content-type": "application/json" },
      "url": conf.reqip + ":" + conf.entityTxn + "/api/bind_WalletLog",
      "body": JSON.stringify(req.body)
    }, (error, response, body) => {
      if (error) {
        res.status(500).json({ status: "500", message: "Internal Server Error" });
      } else {
        var newjson = JSON.parse(body);
        res.json(newjson);
      }
    });
  }
  catch (ex) {

  }
}
exports.twohundredseventyThree = function (req, res) {

  let truid = req.body.rTruID, letterNumber = /^[0-9]+$/;
  if ((truid && truid.length == 16 && truid.match(letterNumber))) {
    request.post({
      "headers": { "content-type": "application/json" },
      "url": conf.reqip + ":" + conf.entityTxn + "/api/showwalletbalanceforAdmin",
      "body": JSON.stringify({
        "truid": truid
      })
    }, (error, response, body) => {
      if (error) {
        return console.dir(error);
      }
      var newjson = JSON.parse(body);
      res.json(newjson);
    }
    )
  } else {
    res.json({ status: "411", message: 'Please Follow Fields Validation Documentation' })
  }
}
exports.twohundredseventyFour = function (req, res) {
  let truid = req.body.rTruID, letterNumber = /^[0-9]+$/;
  if ((truid && truid.length == 16 && truid.match(letterNumber))) {
    var dateflag = req.body.dateflag;
    var jsonin = { "truid": truid }
    if (dateflag) {
      jsonin = {
        "truid": truid,
        "startdate": req.body.startdate,
        "enddate": req.body.enddate,
        "dateflag": dateflag
      }
    }
    request.post({
      "headers": { "content-type": "application/json" },
      "url": conf.reqip + ":" + conf.custAuth + "/api/refferanceregistrationlist",
      "body": JSON.stringify(jsonin)
    }, (error, response, body) => {
      if (error) {
        return console.dir(error);
      }
      var newjson = JSON.parse(body);
      res.json(newjson);
    }
    )
  } else {
    res.json({ status: "411", message: 'Please Follow Fields Validation Documentation' })
  }
}
exports.twohundredseventySix = function (req, res) {
  let truid = req.body.truID, letterNumber = /^[0-9]+$/;
  if ((truid && truid.length == 16 && truid.match(letterNumber))) {
    var dateflag = req.body.dateflag;
    var isPartner = req.body.isPartner;
    var jsonin = { "truid": truid, "dateFlag": false }
    if (dateflag && dateflag == "true" && req.body.rTruID) {
      jsonin = {
        "dateFlag": true,
        "startdate": req.body.startDate,
        "enddate": req.body.endDate,
        "rtruid": req.body.rTruID
      }
    }
    else if (dateflag == "false" && req.body.rTruID) {
      jsonin = {
        "dateFlag": false,
        "rtruid": req.body.rTruID
      }
    }
    else if (dateflag && dateflag == "true") {
      jsonin = {
        "dateFlag": true,
        "startdate": req.body.startDate,
        "enddate": req.body.endDate
      }
    }
    if (req.body.stype) {
      jsonin.stype = req.body.stype
    }
    if (isPartner && isPartner == "true") { // partner Transactions
      request.post({
        "headers": { "content-type": "application/json" },
        "url": conf.reqip + ":" + conf.entityTxn + "/api/entitygstreportadmin",
        "body": JSON.stringify(jsonin)
      }, (error, response, body) => {
        if (error) {
          return console.dir(error);
        }
        var newjson = JSON.parse(body);
        res.json(newjson);
      })
    }
    else {
      if (req.body.cTruID) { jsonin.ctruid = req.body.cTruID }


      request.post({
        "headers": { "content-type": "application/json" },
        "url": conf.reqip + ":" + conf.custTxn + "/api/consumergstreportadmin",
        "body": JSON.stringify(jsonin)
      }, (error, response, body) => {
        if (error) {
          return console.dir(error);
        }
        var newjson = JSON.parse(body);
        res.json(newjson);
      })
    }
  } else {
    res.json({ status: "411", message: 'Please Follow Fields Validation Documentation' })
  }
}
exports.twohundredseventySeven = function (req, res) {
  let truid = req.body.truID, letterNumber = /^[0-9]+$/;
  if ((truid && truid.length == 16 && truid.match(letterNumber))) {
    var api, jsonin;
    if (req.body.type == "buy") {
      if (req.body.bullionType == "G24K") {
        jsonin = {
          "g24": req.body.rate,
          "truid": req.body.amTruID
        }
        api = "/api/updateg24rateallnode";
      }
      else if (req.body.bullionType == "S99P") {
        jsonin = {
          "s99": req.body.rate,
          "truid": req.body.amTruID
        }
        api = "/api/updates99rateallnode";
      }
    }
    else if (req.body.type == "sell") {
      if (req.body.bullionType == "G24K") {
        jsonin = {
          "g24": req.body.rate,
          "truid": req.body.amTruID
        }
        api = "/api/updateg24salerateallnode";
      }
      else if (req.body.bullionType == "S99P") {
        jsonin = {
          "s99": req.body.rate,
          "truid": req.body.amTruID
        }
        api = "/api/updates99salerateallnode";
      }
    }
    request.post({
      "headers": { "content-type": "application/json" },
      "url": conf.reqip + ":" + conf.assetmanagerStock + api,
      "body": JSON.stringify(jsonin)
    }, (error, response, body) => {
      if (error) {
        return console.dir(error);
      }
      var newjson = JSON.parse(body);
      res.json(newjson);
    })
  } else {
    res.json({ status: "411", message: 'Please Follow Fields Validation Documentation' })
  }
}
exports.twohundredseventyEight = function (req, res) {
  let truid = req.body.truID, letterNumber = /^[0-9]+$/;
  if ((truid && truid.length == 16 && truid.match(letterNumber))) {
    var jsonin = {
      "truid": req.body.amTruID
    }
    request.post({
      "headers": { "content-type": "application/json" },
      "url": conf.reqip + ":" + conf.assetmanagerStock + "/api/readassetmanagerRateByAdmin",
      "body": JSON.stringify(jsonin)
    }, (error, response, body) => {
      if (error) {
        return console.dir(error);
      }
      var newjson = JSON.parse(body);
      res.json(newjson);
    })
  } else {
    res.json({ status: "411", message: 'Please Follow Fields Validation Documentation' })
  }
}
exports.twohundredseventyNine = function (req, res) {
  let truid = req.body.truID, letterNumber = /^[0-9]+$/;
  if ((truid && truid.length == 16 && truid.match(letterNumber))) {
    var jsonin = {
      "dateFlag": req.body.dateflag,
      "startdate": req.body.startDate,
      "enddate": req.body.endDate,
      "truid": req.body.amTruID
    }
    request.post({
      "headers": { "content-type": "application/json" },
      "url": conf.reqip + ":" + conf.assetmanagerStock + "/api/ratedailylogsadmindatewise",
      "body": JSON.stringify(jsonin)
    }, (error, response, body) => {
      if (error) {
        return console.dir(error);
      }
      var newjson = JSON.parse(body);
      res.json(newjson);
    })
  } else {
    res.json({ status: "411", message: 'Please Follow Fields Validation Documentation' })
  }
}



exports.twohundredeighty = function (req, res) {
  let truid = req.body.truID, letterNumber = /^[0-9]+$/;
  if ((truid && truid.length == 16 && truid.match(letterNumber))) {
    request.post({
      "headers": { "content-type": "application/json" },
      "url": conf.reqip + ":" + conf.custTxn + "/api/consumerpartnerrevenue",
      "body": JSON.stringify(req.body)
    }, (error, response, body) => {
      if (error) {
        return console.dir(error);
      } else if (response.statusCode == "200") {
        var newjson = JSON.parse(body);
        res.json(newjson);
      } else {
        res.json({ status: "500", message: "Internal Server Error" });
      }
    })
  } else {
    res.json({ status: "411", message: 'Please Follow Fields Validation Documentation' })
  }
}


exports.twohundredeightyOne = function (req, res) {
  KycAll.find(
    { truID: req.body.truID }, function (err, docs) {
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no Admin user was returned."
        });
      } else {
        var etruid = req.body.eTruID;
        var kycdetails = req.body.kycDetails;
        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.remmitAuth + "/api/UpdateKYCDocsEntity",
          "body": JSON.stringify({
            "atruid": req.body.truID,
            "truid": etruid,
            "kycdetails": kycdetails,
            "flag": "admin"
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
  )
}
exports.twohundredeightyTwo = function (req, res) {
  KycAll.find(
    { truID: req.body.truID }, function (err, docs) {
      if (!docs.length) {
        res.json({
          status: "204",
          messege: "The request was successful but no Admin user was returned."
        });
      } else {
        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.custAuth + "/api/readstockCustPartner",
          "body": JSON.stringify({
            "truid": req.body.amTruID
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
  )
}

exports.twohundredeightythree = function (req, res) {
  let truid = req.body.truID,
    ctruid = req.body.cTruID,
    kycflag = req.body.KYCFlag,
    appliedon = req.body.appliedOn,
    letterNumber = /^[0-9]+$/,
    isnum = /(?<=^| )\d+(\.\d+)?(?=$| )/,
    error = [];
  var limitapplied = req.body.limitapplied;
  var limitappliedobj = ["consumer", "common"];
  function validateobject(obj, objkey) {
    var bool = false;
    var statusArray = ["allow", "disable", "comingsoon", "maintenance", "hide"];
    if (statusArray.includes(obj.status)) {
      bool = true;
    } else {
      bool = false;
      error.push("Please Enter valid " + objkey + " status");
    }
    if (obj.status !== "allow" && bool !== false) {
      if (obj.message !== "") {
        bool = true;
      } else {
        bool = false;
        error.push("Please Enter valid " + objkey + " message");
      }
    }
    return bool;

  }
  var kycflagArray = ["KYC", "nonKYC"];
  var appliedonArray = ["entity", "consumer"];
  if (limitapplied === "consumer") {
    if ((truid && truid.length == 16 && truid.match(letterNumber)) &&
      (ctruid && ctruid.length === 16 && isnum.test(ctruid))) {
      apicall()
    } else {
      res.json({ status: "411", message: "Please Follow Fields Validation Documentation" })
    }
  } else {
    if ((truid && truid.length == 16 && truid.match(letterNumber))
      && (appliedon && appliedonArray.includes(appliedon))) {
      apicall()
    } else {
      res.json({ status: "411", message: "Please Follow Fields Validation Documentation" })
    }
  }

  function apicall() {
    if ((limitapplied && limitappliedobj.includes(limitapplied))
      && (kycflag && kycflagArray.includes(kycflag))
      && ((req.body.buy && validateobject(req.body.buy, "buy")) ||
        (req.body.redeemCash && validateobject(req.body.redeemCash, "redeemCash")) ||
        (req.body.transfer && validateobject(req.body.transfer, "transfer")) ||
        (req.body.redeemToBank && validateobject(req.body.redeemToBank, "redeemToBank")) ||
        (req.body.redeemToWallet && validateobject(req.body.redeemToWallet, "redeemToWallet")) ||
        (req.body.walletToBank && validateobject(req.body.walletToBank, "walletToBank")) ||
        (req.body.walletAccess && validateobject(req.body.walletAccess, "walletAccess")) ||
        (req.body.payByWallet && validateobject(req.body.payByWallet, "payByWallet")) ||
        (req.body.login && validateobject(req.body.login, "login")) ||
        (req.body.linkbank && validateobject(req.body.linkbank, "linkbank")) ||
        (req.body.linkUPI && validateobject(req.body.linkUPI, "linkUPI")) ||
        (req.body.paymentModeAccess && validateobject(req.body.paymentModeAccess, "paymentModeAccess")))) {
      var json = req.body;
      //admin user validation from db.
      var reqUrl = "/api/consumerPermission";
      if (limitapplied === "common") {
        reqUrl = "/api/consumerCommonPermission";
      }

      request.post({
        "headers": { "content-type": "application/json" },
        "url": conf.reqip + ":" + conf.custTxn + reqUrl,
        "body": JSON.stringify(json)
      }, (error, response, body) => {
        if (error) {
          return console.dir(error);
        } else if (response.statusCode == "200") {
          console.log(body)
          var newjson = JSON.parse(body);
          res.json(newjson);
          // res.json({ status: "200", resource: json });
        } else {
          res.json({ status: "500", message: "Internal Server Error" });
        }
      })
    } else {
      // res.json({ status: "411", message: (validationMsg && validationMsg !== "") ? validationMsg : "Please Follow Fields Validation Documentation" })
      res.json({ status: "411", message: (error.length) ? error[0] : "Please Follow Fields Validation Documentation" })
    }
  }

}

exports.twohundredeightyfour = function (req, res) {
  var ctruID = req.body.cTruID;
  var atruID = req.body.truID;
  var KYCFlag = req.body.KYCFlag;
  var tType = req.body.tType;
  var appliedOn = req.body.appliedOn;
  var goldMax = req.body.goldMax;
  var goldMin = req.body.goldMin;
  var silverMax = req.body.silverMax;
  var silverMin = req.body.silverMin;
  var limitapplied = req.body.limitapplied;
  var txnLimitInSeconds = req.body.txnLimitInSeconds ? checktest(req.body.txnLimitInSeconds) : undefined;
  var noOfTxnInSeconds = req.body.noOfTxnInSeconds ? checktest(req.body.noOfTxnInSeconds) : undefined;
  var maxAmtOfTxnInSeconds = req.body.maxAmtOfTxnInSeconds ? checktest(req.body.maxAmtOfTxnInSeconds) : undefined;
  var minBuyToSell = req.body.minBuyToSell ? checktest(req.body.minBuyToSell) : undefined;
  var maxAmtOfTxnInDay = req.body.maxAmtOfTxnInDay ? checktest(req.body.maxAmtOfTxnInDay) : undefined;
  var maxAmtOfTxnInMonth = req.body.maxAmtOfTxnInMonth ? checktest(req.body.maxAmtOfTxnInMonth) : undefined;
  var txnFreeLimit = req.body.txnFreeLimit ? checktest(req.body.txnFreeLimit) : undefined;
  var minStockRequired = req.body.minStockRequired ? checktest(req.body.minStockRequired) : undefined;
  var sellAfterBuyInterval = req.body.sellAfterBuyInterval ? checktest(req.body.sellAfterBuyInterval) : undefined;
  var sellToBankInterval = req.body.sellToBankInterval ? checktest(req.body.sellToBankInterval) : undefined;
  var redeemInBankMin = req.body.redeemInBankMin ? checktest(req.body.redeemInBankMin) : undefined;
  var redeemInBankMax = req.body.redeemInBankMax ? checktest(req.body.redeemInBankMax) : undefined;
  var maxCredit = req.body.maxCredit ? checktest(req.body.maxCredit) : undefined;
  var minCredit = req.body.minCredit ? checktest(req.body.minCredit) : undefined;
  var isnum = /(?<=^| )\d+(\.\d+)?(?=$| )/;
  var letterNumber = /^[0-9]+$/;
  var limitappliedobj = ["consumer", "common"];
  var flag = ["KYC", "nonKYC"];
  var tTypes = ["buy", "redeemCash", "transfer",];
  if (limitapplied === "consumer") {
    if ((atruID && atruID.length == 16 && atruID.match(letterNumber)) &&
      (ctruID && ctruID.length === 16 && isnum.test(ctruID))) {
      apicall()
    } else {
      res.json({ status: "411", message: "Please Follow Fields Validation Documentation" })
    }
  } else {
    if ((atruID && atruID.length == 16 && atruID.match(letterNumber))
      && (appliedOn && (appliedOn === "consumer" || appliedOn === "entity"))) {
      apicall()
    } else {
      res.json({ status: "411", message: "Please Follow Fields Validation Documentation" })
    }
  }

  function apicall() {
    if ((KYCFlag && flag.includes(KYCFlag))
      && (tType && tTypes.includes(tType)) && (limitapplied && limitappliedobj.includes(limitapplied)) &&
      (goldMax && isnum.test(goldMax)) && (goldMin && isnum.test(goldMin)) && (silverMax && isnum.test(silverMax)) && (silverMin && isnum.test(silverMin))) {
      if (tType === "redeemCash") {
        if ((txnLimitInSeconds !== "false") && (noOfTxnInSeconds !== "false") && (maxAmtOfTxnInSeconds !== "false") &&
          (maxAmtOfTxnInDay !== "false") && (maxAmtOfTxnInMonth !== "false") && (redeemInBankMin !== "false") &&
          (redeemInBankMax !== "false") && (sellAfterBuyInterval !== "false") && (sellToBankInterval !== "false") && (minBuyToSell != "false")) {
          updatetxnlimits();
        } else {
          res.json({ status: "411", message: "Please Follow Fields Validation Documentation" })
        }
      }
      else if (tType === "transfer") {
        if ((txnLimitInSeconds !== "false") && (noOfTxnInSeconds !== "false") && (maxAmtOfTxnInSeconds !== "false") &&
          (maxAmtOfTxnInDay !== "false") && (maxAmtOfTxnInMonth !== "false")) {
          updatetxnlimits();
        } else {
          res.json({ status: "411", message: "Please Follow Fields Validation Documentation" })
        }
      }
      else {
        if ((txnLimitInSeconds !== "false") && (noOfTxnInSeconds !== "false") && (maxAmtOfTxnInSeconds !== "false") &&
          (maxAmtOfTxnInDay !== "false") && (maxAmtOfTxnInMonth !== "false")) {
          updatetxnlimits();
        } else {
          res.json({ status: "411", message: "Please Follow Fields Validation Documentation" })
        }
      }
      function updatetxnlimits() {
        var reqUrl = "/api/consumertxnupdatelimit";
        if (limitapplied === "common") {
          reqUrl = "/api/consumerCommontxnupdatelimit";
        }

        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.custTxn + reqUrl,
          "body": JSON.stringify({
            "ctruID": ctruID,
            "truID": atruID,
            "KYCFlag": KYCFlag,
            "appliedOn": appliedOn,
            "tType": tType,
            "goldMax": goldMax,
            "goldMin": goldMin,
            "minBuyToSell": minBuyToSell,
            "silverMax": silverMax,
            "silverMin": silverMin,
            "txnInterval": txnLimitInSeconds,
            "noOfTxnInInterval": noOfTxnInSeconds,
            "maxAmtOfTxnInMonth": maxAmtOfTxnInMonth,
            "maxAmtOfTxnInHour": maxAmtOfTxnInSeconds,
            "maxAmtOfTxnInDay": maxAmtOfTxnInDay,
            "txnFreeLimit": txnFreeLimit,
            "minStockRequired": minStockRequired,
            "sellAfterBuyInterval": sellAfterBuyInterval,
            "sellToBankInterval": sellToBankInterval,
            "redeemInBankMin": redeemInBankMin,
            "redeemInBankMax": redeemInBankMax,
            "maxCredit": maxCredit,
            "minCredit": minCredit
          })
        }, (error, response, body) => {
          if (error) {
            console.log("err", error);
            res.status(500).json({ status: "500", message: "Internal Server Error" });
          } else {
            var newjson = JSON.parse(body);
            res.json(newjson);
          }
        });
      }
    } else {
      res.json({ status: "401", message: "Field Validation Error...!!!" });
    }
  }

}

exports.twohundredeightyfive = function (req, res) {
  var ctruID = req.body.cTruID;
  var atruID = req.body.truID;
  var KYCFlag = req.body.KYCFlag;
  var tType = req.body.tType;
  var appliedOn = req.body.appliedOn;
  var max = req.body.max ? checktest(req.body.max) : undefined;
  var min = req.body.min ? checktest(req.body.min) : undefined;
  var walletLimit = req.body.walletLimit ? checktest(req.body.walletLimit) : undefined;
  var bulContainLimit = req.body.bulContainLimit ? checktest(req.body.bulContainLimit) : undefined;
  var wtbmin = req.body.wtbmin ? checktest(req.body.wtbmin) : undefined;
  var wtbmax = req.body.wtbmax ? checktest(req.body.wtbmax) : undefined;
  var txnLimitInSeconds = req.body.txnLimitInSeconds ? checktest(req.body.txnLimitInSeconds) : undefined;
  var noOfTxnInSeconds = req.body.noOfTxnInSeconds ? checktest(req.body.noOfTxnInSeconds) : undefined;
  var maxAmtOfTxnInSeconds = req.body.maxAmtOfTxnInSeconds ? checktest(req.body.maxAmtOfTxnInSeconds) : undefined;
  var maxAmtOfTxnInDay = req.body.maxAmtOfTxnInDay ? checktest(req.body.maxAmtOfTxnInDay) : undefined;
  var maxAmtOfTxnInMonth = req.body.maxAmtOfTxnInMonth ? checktest(req.body.maxAmtOfTxnInMonth) : undefined;
  var limitapplied = req.body.limitapplied;
  var limitappliedobj = ["consumer", "common"];
  var isnum = /(?<=^| )\d+(\.\d+)?(?=$| )/;
  var letterNumber = /^[0-9]+$/;
  var flag = ["hold", "pending", "banned", "active", "nonKYC", "KYC"];
  var tTypes = ["wallet", "walletToBank", "redeemToBank", "secureCredit"];
  if (limitapplied === "consumer") {
    if ((atruID && atruID.length == 16 && atruID.match(letterNumber)) &&
      (ctruID && ctruID.length === 16 && isnum.test(ctruID))) {
      apicall()
    } else {
      res.json({ status: "411", message: "Please Follow Fields Validation Documentation" })
    }
  } else {
    if ((atruID && atruID.length == 16 && atruID.match(letterNumber))
      && (appliedOn && appliedOn === "consumer" || appliedOn === "entity")) {
      apicall()
    } else {
      res.json({ status: "411", message: "Please Follow Fields Validation Documentation" })
    }
  }

  function apicall() {
    if ((KYCFlag && flag.includes(KYCFlag)) && (tType && tTypes.includes(tType)) && (limitapplied && limitappliedobj.includes(limitapplied))
      && ((max && isnum.test(max)) && (min && isnum.test(min))
        && walletLimit !== "false" && bulContainLimit != "false" && wtbmin !== "false" && maxAmtOfTxnInMonth !== "false" && wtbmax !== "false"
        && txnLimitInSeconds !== "false" && noOfTxnInSeconds !== "false" && maxAmtOfTxnInSeconds !== "false" && maxAmtOfTxnInDay !== "false"
      )) {
      var reqUrl = "/api/consumerWalletupdateLimit";
      if (limitapplied === "common") {
        reqUrl = "/api/consumerCommonWalletupdateLimit";
      }
      request.post({
        "headers": { "content-type": "application/json" },
        "url": conf.reqip + ":" + conf.custTxn + reqUrl,
        "body": JSON.stringify({
          "truID": atruID,
          "ctruID": ctruID,
          "KYCFlag": KYCFlag,
          "appliedOn": appliedOn,
          "tType": tType,
          "max": max,
          "min": min,
          "walletLimit": walletLimit,
          "bulContainLimit": bulContainLimit,
          "wtbmin": wtbmin,
          "wtbmax": wtbmax,
          "txnInterval": txnLimitInSeconds,
          "noOfTxnInSeconds": noOfTxnInSeconds,
          "maxAmtOfTxnInSeconds": maxAmtOfTxnInSeconds,
          "maxAmtOfTxnInDay": maxAmtOfTxnInDay,
          "maxAmtOfTxnInMonth": maxAmtOfTxnInMonth,
          "goldExposure": req.body.goldExposure,
          "silverExposure": req.body.silverExposure
        })
      }, (error, response, body) => {
        if (error) {
          console.log("err", error);
          res.status(500).json({ status: "500", message: "Internal Server Error" });
        } else {
          var newjson = JSON.parse(body);
          res.json(newjson);
        }
      })
    } else {
      res.json({ status: "401", message: "Field Validation Error...!!!" });
    }
  }
}

function checktest(limit) {
  var letterNumber = /^\d+\.?\d{0,10}$/;
  // var letterNumber = /(?<=^| )\d+(\.\d+)?(?=$| )/;
  if (letterNumber.test(limit)) {
    // console.log("reqbody", limit)
    return limit
  }
  else {
    return "false"
  }
}
exports.twohundredeightysix = function (req, res) {
  var ctruID = req.body.ctruID;
  var atruID = req.body.truID;
  var KYCFlag = req.body.KYCFlag;
  var tType = req.body.tType;
  var appliedOn = req.body.appliedOn;
  var limitapplied = req.body.limitapplied;
  var message = req.body.message;
  var startDate = req.body.startDate;
  var endDate = req.body.endDate;
  var status = req.body.status;
  var isnum = /(?<=^| )\d+(\.\d+)?(?=$| )/;
  var vddate = /^\d{4}\/(0?[1-9]|1[012])\/(0?[1-9]|[12][0-9]|3[01])$/;
  var limitappliedobj = ["consumer", "common"];
  var flag = ["hold", "pending", "banned", "active", "nonKYC"];
  var letterNumber = /^[0-9]+$/;
  if (limitapplied === "consumer") {
    if ((atruID && atruID.length == 16 && atruID.match(letterNumber)) &&
      (ctruID && ctruID.length === 16 && isnum.test(ctruID))) {
      apicall()
    } else {
      res.json({ status: "411", message: "Please Follow Fields Validation Documentation" })
    }
  } else {
    if ((atruID && atruID.length == 16 && atruID.match(letterNumber))
      && (appliedOn && appliedOn === "consumer" || appliedOn === "entity")) {
      apicall()
    } else {
      res.json({ status: "411", message: "Please Follow Fields Validation Documentation" })
    }
  }

  function apicall() {
    if ((KYCFlag && flag.includes(KYCFlag)) && (limitapplied && limitappliedobj.includes(limitapplied))
      && (startDate && vddate.test(startDate) && endDate && vddate.test(endDate) && tType === "home")) {

      var reqUrl = "/api/consumerhomeupdatelimit";
      if (limitapplied === "common") {
        reqUrl = "/api/consumerCommonhomeupdatelimit";
      }
      request.post({
        "headers": { "content-type": "application/json" },
        "url": conf.reqip + ":" + conf.custTxn + reqUrl,
        "body": JSON.stringify({
          "truID": atruID,
          "ctruID": ctruID,
          "KYCFlag": KYCFlag,
          "appliedOn": appliedOn,
          "tType": tType,
          "message": message,
          "startDate": startDate,
          "endDate": endDate,
          "status": status
        })
      }, (error, response, body) => {
        if (error) {
          console.log("err", error);
          res.status(500).json({ status: "500", message: "Internal Server Error" });
        } else {
          var newjson = JSON.parse(body);
          res.json(newjson);
        }
      });
    } else {
      res.json({ status: "401", message: "Field Validation Error...!!!" });
    }
  }

}
exports.twohundredeightySeven = function (req, res) {
  let truid = req.body.truID, letterNumber = /^[0-9]+$/;
  if ((truid && truid.length == 16 && truid.match(letterNumber))) {
    var isPartner = req.body.isPartner;
    var jsonin = {
      "invoice": req.body.invoice,
      "type": req.body.type
    }
    if (isPartner && isPartner == "true") { // parner Transactions
      if (req.body.rTruID) { jsonin.rTruID = req.body.rTruID }
      request.post({
        "headers": { "content-type": "application/json" },
        "url": conf.reqip + ":" + conf.entityTxn + "/api/entitygstreportadmin",
        "body": JSON.stringify(jsonin)
      }, (error, response, body) => {
        if (error) {
          return console.dir(error);
        }
        var newjson = JSON.parse(body);
        res.json(newjson);
      })
    }
    else {
      if (req.body.cTruID) { jsonin.ctruid = req.body.cTruID }
      request.post({
        "headers": { "content-type": "application/json" },
        "url": conf.reqip + ":" + conf.custTxn + "/api/consumergstreportadmin",
        "body": JSON.stringify(jsonin)
      }, (error, response, body) => {
        if (error) {
          return console.dir(error);
        }
        var newjson = JSON.parse(body);
        res.json(newjson);
      })
    }
  } else {
    res.json({ status: "411", message: 'Please Follow Fields Validation Documentation' })
  }
}

exports.twohundredeightyEight = function (req, res) {
  let truid = req.body.truID, letterNumber = /^[0-9]+$/;
  if ((truid && truid.length == 16 && truid.match(letterNumber))) {
    request.post({
      "headers": { "content-type": "application/json" },
      "url": conf.reqip + ":" + conf.custTxn + "/api/consumerpartnerpayouts",
      "body": JSON.stringify(req.body)
    }, (error, response, body) => {
      if (error) {
        return console.dir(error);
      } else if (response.statusCode == "200") {
        var newjson = JSON.parse(body);
        res.json(newjson);
      } else {
        res.json({ status: "500", message: "Internal Server Error" });
      }
    })
  } else {
    res.json({ status: "411", message: 'Please Follow Fields Validation Documentation' })
  }
}
exports.twohundredeightyNine = function (req, res) {
  let truid = req.body.truID, letterNumber = /^[0-9]+$/;
  if ((truid && truid.length == 16 && truid.match(letterNumber))) {
    request.post({
      "headers": { "content-type": "application/json" },
      "url": conf.smsreqip + ":3118" + "/api/twoFactorCheckCreditBalance"
    }, (error, response, body) => {
      if (error) {
        res.json({ status: "500", message: error.toString() });
      } else if (response.statusCode == 200) {
        var newjson = JSON.parse(body);
        res.json(newjson);
      } else {
        res.json({ status: "500", message: "Internal Server Error" });
      }
    })
  } else {
    res.json({ status: "411", message: 'Please Follow Fields Validation Documentation' })
  }
}
exports.twohundredNinty = async function (req, res) {
  let truID = req.body.truID,
    appliedon = req.body.appliedOn,
    kycflag = req.body.KYCFlag,
    letterNumber = /^[0-9]+$/,
    error = [];

  function validateobject(obj, objkey) {
    var bool = false;
    var statusArray = ["allow", "disable", "hide"];
    if (statusArray.includes(obj.status)) {
      bool = true;
    } else {
      bool = false;
      error.push("Please Enter valid " + objkey + " status");
    }
    return bool;
  }


  if ((truID && truID.length == 16 && truID.match(letterNumber))
    && (appliedon === "consumer" || appliedon === "entity")
    && (kycflag === "KYC" || kycflag === "nonKYC")
    && ((req.body.upiPayOut && validateobject(req.body.upiPayOut, "upiPayOut")) ||
      (req.body.upiCollect && validateobject(req.body.upiCollect, "upiCollect")) ||
      (req.body.neftPayOut && validateobject(req.body.neftPayOut, "neftPayOut")) ||
      (req.body.impsPayOut && validateobject(req.body.impsPayOut, "impsPayOut")) ||
      (req.body.payIn && validateobject(req.body.payIn, "payIn")))) {
    var resolvestatus;
    var resolvestatusbool;
    var err = []
    if (req.body.upiPayOut) {
      var jsonupiPayOut = {};
      jsonupiPayOut["upiPayOut"] = req.body.upiPayOut
      jsonupiPayOut["truID"] = req.body.truID
      jsonupiPayOut["appliedOn"] = req.body.appliedOn
      jsonupiPayOut["kycflag"] = req.body.KYCFlag
      /// send request to this api called digitalpaymentupiPayOut
      resolvestatus = await sendRequest("/api/digitalpaymentupiPayOut", jsonupiPayOut)
      if (resolvestatus.status == "200") {
        resolvestatusbool = true;
      } else {
        resolvestatus["paymentType"] = "upiPayOut"
        err.push(resolvestatus)
      }
    }
    if (req.body.upiCollect) {
      var jsonupiCollect = {};
      jsonupiCollect["upiCollect"] = req.body.upiCollect
      jsonupiCollect["truID"] = req.body.truID
      jsonupiCollect["appliedOn"] = req.body.appliedOn
      jsonupiCollect["kycflag"] = req.body.KYCFlag
      /// send request to this api called digitalpaymentupiCollect
      resolvestatus = await sendRequest("/api/digitalpaymentupiCollect", jsonupiCollect)
      if (resolvestatus.status == "200") {
        resolvestatusbool = true;
      } else {
        resolvestatus["paymentType"] = "upiCollect"
        err.push(resolvestatus)
      }
    }
    if (req.body.neftPayOut) {
      var jsonneftPayOut = {};
      jsonneftPayOut["neftPayOut"] = req.body.neftPayOut
      jsonneftPayOut["truID"] = req.body.truID
      jsonneftPayOut["appliedOn"] = req.body.appliedOn
      jsonneftPayOut["kycflag"] = req.body.KYCFlag
      /// send request to this api called digitalpaymentneftPayOut
      resolvestatus = await sendRequest("/api/digitalpaymentneftPayOut", jsonneftPayOut)
      if (resolvestatus.status == "200") {
        resolvestatusbool = true;
      } else {
        resolvestatus["paymentType"] = "neftPayOut"
        err.push(resolvestatus)
      }
    }
    if (req.body.impsPayOut) {
      var jsonimpsPayOut = {};
      jsonimpsPayOut["impsPayOut"] = req.body.impsPayOut
      jsonimpsPayOut["truID"] = req.body.truID
      jsonimpsPayOut["appliedOn"] = req.body.appliedOn
      jsonimpsPayOut["kycflag"] = req.body.KYCFlag
      /// send request to this api called digitalpaymentimpsPayOut
      resolvestatus = await sendRequest("/api/digitalpaymentimpsPayOut", jsonimpsPayOut)
      if (resolvestatus.status == "200") {
        resolvestatusbool = true;
      } else {
        resolvestatus["paymentType"] = "impsPayOut"
        err.push(resolvestatus)
      }
    }
    if (req.body.payIn) {
      var jsonpayIn = {};
      jsonpayIn["payIn"] = req.body.payIn
      jsonpayIn["truID"] = req.body.truID
      jsonpayIn["appliedOn"] = req.body.appliedOn
      jsonpayIn["kycflag"] = req.body.KYCFlag
      /// send request to this api called digitalpaymentpayIn
      resolvestatus = await sendRequest("/api/digitalpaymentpayIn", jsonpayIn)
      if (resolvestatus.status == "200") {
        resolvestatusbool = true;
      } else {
        resolvestatus["paymentType"] = "payIn"
        err.push(resolvestatus)
      }
    }

    if (resolvestatusbool) {
      res.json({ status: "200", message: "configuration uploaded successfully.." })
    } else {
      res.json({ status: "204", err: err })
    }

    function sendRequest(confAPI, json) {
      return new Promise(resolve => {
        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.truRates + confAPI,
          "body": JSON.stringify(json)
        }, (error, response, body) => {
          if (error) {
            return console.dir(error);
          }
          var newjson = JSON.parse(body);
          resolve(newjson)
        });
      });
    }
  } else {
    res.json({ status: "411", message: (error.length) ? error[0] : "Please Follow Fields Validation Documentation" })
  }

}


exports.twohundredNintyOne = function (req, res) {

  var truid = req.body.truID;
  var pgID = req.body.pgID;
  var pgMode = req.body.pgMode;
  var letterNumber = /^[0-9]+$/;

  var pgmodeArr = ["neftPayOut", "impsPayOut", "payIn", "upiPayOut"];

  if (((truid && truid.length == 16 && truid.match(letterNumber)) &&
    (pgID.length === 16 && pgMode === pgmodeArr.includes(pgMode)))) {

    request.post({
      "headers": { "content-type": "application/json" },
      "url": conf.reqip + ":" + conf.truRates + "/api/digitalpaymentsetdefault",
      "body": JSON.stringify({
        "truid": req.body.amTruID
      })
    }, (error, response, body) => {
      if (error) {
        return console.dir(error);
      }
      var newjson = JSON.parse(body);
      res.json(newjson);
    });
  } else {
    res.json({ status: "411", message: "Please Follow Fields Validation Documentation" });
  }
}
exports.twohundredNintyTwo = function (req, res) {

  var truid = req.body.truID;
  var letterNumber = /^[0-9]+$/;

  if (truid && truid.length == 16 && truid.match(letterNumber)) {

    request.post({
      "headers": { "content-type": "application/json" },
      "url": conf.reqip + ":" + conf.truRates + "/api/readassetmanagerRateByAdminChart",
      "body": JSON.stringify({
        "truid": req.body.amTruID
      })
    }, (error, response, body) => {
      if (error) {
        return console.dir(error);
      }
      var newjson = JSON.parse(body);
      res.json(newjson);
    });
  } else {
    res.json({ status: "411", message: "Please Follow Fields Validation Documentation" });
  }
}
exports.twohundredNintyFour = function (req, res) {
  var truID = req.body.rTruID;
  var letterNumber = /^[0-9]+$/;
  if (truID && truID.length === 16 && truID.substring(0, 4) === "8000" && letterNumber.test(truID)) {
    if (req.body.emailArr.length > 3) {
      res.status(401).json({ status: "401", message: "Only 3 emails allowed..!!" });
    }
    else {
      request.post({
        "headers": { "content-type": "application/json" },
        "url": conf.reqip + ":" + conf.remmitAuth + "/api/addBillingEmail",
        "body": JSON.stringify({
          "truid": truID,
          "emailarr": req.body.emailArr
        })
      }, (error, response, body) => {
        if (error) {
          return console.dir(error);
        } else {
          if (response.statusCode == 200) {
            var newjson = JSON.parse(body);
            res.json(newjson);
          } else {
            res.json({ status: "204", message: "Something went Wrong..!!" });
          }
        }
      });
    }
  } else {
    res.status(401).json({ status: "401", message: "Please check field Validation" });
  }
}
exports.twohundredNintyFive = function (req, res) {

  var truID = req.body.rTruID;
  var letterNumber = /^[0-9]+$/;
  if (truID && truID.length === 16 && truID.substring(0, 4) === "8000" && letterNumber.test(truID)) {

    request.post({
      "headers": { "content-type": "application/json" },
      "url": conf.reqip + ":" + conf.remmitAuth + "/api/emailSubscriberList",
      "body": JSON.stringify({
        "truid": truID
      })
    }, (error, response, body) => {
      if (error) {
        return console.dir(error);
      } else {
        if (response.statusCode == 200) {
          var newjson = JSON.parse(body);
          res.json(newjson);
        } else {
          res.json({ status: "204", message: "Something went Wrong..!!" });
        }
      }
    });
  } else {
    res.status(401).json({ status: "401", message: "Please check field Validation" });
  }
}

exports.twohundredNintySeven = function (req, res) {
  let truid = req.body.truID, letterNumber = /^[0-9]+$/;
  if ((truid && truid.length == 16 && truid.match(letterNumber))) {
    var isPartner = req.body.isPartner;
    if (isPartner && isPartner == "true") { // partner Transactions
      request.post({
        "headers": { "content-type": "application/json" },
        "url": conf.reqip + ":" + conf.entityTxn + "/api/entitygstreportadminNEW",
        "body": JSON.stringify(req.body)
      }, (error, response, body) => {
        res.send(body);
      })
    }
    else {
      if (req.body.cTruID) { jsonin.ctruid = req.body.cTruID }
      request.post({
        "headers": { "content-type": "application/json" },
        "url": conf.reqip + ":" + conf.custTxn + "/api/consumergstreportadminNEW",
        "body": JSON.stringify(req.body)
      }, (error, response, body) => {
        res.send(body);
      })
    }
  } else {
    res.json({ status: "411", message: 'Please Follow Fields Validation Documentation' })
  }
}
exports.twohundredNintyEight = function (req, res) {
  let truid = req.body.truID, letterNumber = /^[0-9]+$/;
  if ((truid && truid.length == 16 && truid.match(letterNumber))) {
    request.post({
      "headers": { "content-type": "application/json" },
      "url": conf.reqip + ":" + conf.custTxn + "/api/getConsumerNodeStock",
      "body": JSON.stringify(req.body)
    }, (error, response, body) => {
      if (error) {
        return console.dir(error);
      }
      else {
        var newjson = JSON.parse(body);
        res.json(newjson);
      }

    })

  } else {
    res.json({ status: "411", message: 'Invalid Request..!!' })
  }
}

exports.emailAlert_RateUpdated = function (req, res) {
  request.post({
    "headers": { "content-type": "application/json" },
    "url": conf.reqip + ":" + conf.remmitAuth + "/api/emailAlertRateUpdatedAdmin",
  }, (error, response, body) => {
    if (error) {
      res.json({ status: "500", message: "Internal Server Error" });
    } else {
      var newjson = JSON.parse(body);
      if (newjson.status == "200" && newjson.emailList.length > 0) {
        res.json({ status: "200", email: "Rate alert email sent successfully" });
        request.post({
          "headers": { "content-type": "application/json", "Authorization": "Bearer #eMaIlSeRvEr*aPiS$1234@5678!78901*#" },
          "url": conf.smsreqip + ":3114" + "/rateAlertInBULK",
          "body": JSON.stringify({
            "flag": "rateAlert",
            "emailList": newjson.emailList
          })
        }, (error, response, body) => {
          if (error) {
            console.log("emailAlert_RateUpdated", error)
          }
          else {
            console.log("emailAlert_RateUpdated")
          }
        })
      }
      else {
        res.json(newjson);
      }

    }
  });
}


function sha512(salt, password) {
  var hash = cryptos.createHmac('sha512', salt); /** Hashing algorithm sha512 */
  hash.update(password);
  var value = hash.digest('hex');
  return value
};
exports.twohundredninetynine = function (req, res) {
  let truid = req.body.truID,
    rtruid = req.body.rTruID,
    kycflag = req.body.KYCFlag,
    appliedon = req.body.appliedOn,
    letterNumber = /^[0-9]+$/,
    isnum = /(?<=^| )\d+(\.\d+)?(?=$| )/,
    error = [];
  var limitapplied = req.body.limitapplied;
  var limitappliedobj = ["common", "entity", "commonEntity"];
  function validateobject(obj, objkey) {
    var bool = false;
    var statusArray = ["allow", "disable", "comingsoon", "maintenance", "hide", "truwallet"];
    if (statusArray.includes(obj.status)) {
      bool = true;
    } else {
      bool = false;
      error.push("Please Enter valid " + objkey + " status");
    }
    if (obj.status !== "allow" && obj.status !== "truwallet" && bool !== false) {
      if (obj.message !== "") {
        bool = true;
      } else {
        bool = false;
        error.push("Please Enter valid " + objkey + " message");
      }
    }
    return bool;

  }
  var kycflagArray = ["KYC"];
  var appliedonArray = ["entity", "consumer"];
  if (limitapplied === "entity") {
    if ((truid && truid.length == 16 && truid.match(letterNumber)) &&
      (rtruid && rtruid.length === 16 && isnum.test(rtruid))) {
      apicall()
    } else {
      res.json({ status: "411", message: "Please Follow Fields Validation Documentation" })
    }
  } else {
    if ((truid && truid.length == 16 && truid.match(letterNumber))
      && (appliedon && appliedonArray.includes(appliedon))) {
      apicall()
    } else {
      res.json({ status: "411", message: "Please Follow Fields Validation Documentation" })
    }
  }

  function apicall() {
    if ((limitapplied && limitappliedobj.includes(limitapplied))
      && (kycflag && kycflagArray.includes(kycflag))
      && ((req.body.buy && validateobject(req.body.buy, "buy")) ||
        (req.body.redeemCash && validateobject(req.body.redeemCash, "redeemCash")) ||
        (req.body.transfer && validateobject(req.body.transfer, "transfer")) ||
        (req.body.redeemToBank && validateobject(req.body.redeemToBank, "redeemToBank")) ||
        (req.body.redeemToWallet && validateobject(req.body.redeemToWallet, "redeemToWallet")) ||
        (req.body.walletToBank && validateobject(req.body.walletToBank, "walletToBank")) ||
        (req.body.walletAccess && validateobject(req.body.walletAccess, "walletAccess")) ||
        (req.body.nodeAccess && validateobject(req.body.nodeAccess, "nodeAccess")) ||
        (req.body.lendingAccess && validateobject(req.body.lendingAccess, "nodeAccess")) ||
        (req.body.consumerAccess && validateobject(req.body.consumerAccess, "consumerAccess")) ||
        (req.body.payByWallet && validateobject(req.body.payByWallet, "payByWallet")) ||
        (req.body.login && validateobject(req.body.login, "login")) ||
        (req.body.linkbank && validateobject(req.body.linkbank, "linkbank")) ||
        (req.body.allConsumerAccess) ||
        (req.body.paymentModeAccess && validateobject(req.body.paymentModeAccess, "paymentModeAccess")))) {
      var json = req.body;
      console.log("json", json)
      // json['aTruID'] = json['truID'];
      // delete json['truID'];
      // json['truID'] = json['cTruID'];
      // delete json['cTruID'];

      //admin user validation from db.

      var reqUrl;
      if (limitapplied === "common" || limitapplied === "commonEntity") {
        reqUrl = "/api/consumerCommonPermission";
      } else {
        if (appliedon == "entity") {
          json.limitapplied = "commonEntity"
        } else {
          json.limitapplied = "common"
        }
        var reqUrl = "/api/partnerpermissionconsumer";
        // if (appliedon === "self") {
        //   reqUrl = "/api/partnerpermissionconsumerself";
        // }
      }


      request.post({
        "headers": { "content-type": "application/json" },
        "url": conf.reqip + ":" + conf.custTxn + reqUrl,
        "body": JSON.stringify(json)
      }, (error, response, body) => {
        if (error) {
          return console.dir(error);
        } else if (response.statusCode == "200") {
          console.log(body)
          var newjson = JSON.parse(body);
          res.json(newjson);
          // res.json({ status: "200", resource: json });
        } else {
          res.json({ status: "500", message: "Internal Server Error" });
        }
      })
    } else {
      // res.json({ status: "411", message: (validationMsg && validationMsg !== "") ? validationMsg : "Please Follow Fields Validation Documentation" })
      res.json({ status: "411", message: (error.length) ? error[0] : "Please Follow Fields Validation Documentation" })
    }
  }

}

exports.threehundred = function (req, res) {
  var rtruID = req.body.rTruID;
  var atruID = req.body.truID;
  var KYCFlag = req.body.KYCFlag;
  var tType = req.body.tType;
  var appliedOn = req.body.appliedOn;
  var goldMax = req.body.goldMax;
  var goldMin = req.body.goldMin;
  var silverMax = req.body.silverMax;
  var silverMin = req.body.silverMin;
  var limitapplied = req.body.limitapplied;
  var txnLimitInSeconds = req.body.txnLimitInSeconds ? checktest(req.body.txnLimitInSeconds) : undefined;
  var noOfTxnInSeconds = req.body.noOfTxnInSeconds ? checktest(req.body.noOfTxnInSeconds) : undefined;
  var maxAmtOfTxnInSeconds = req.body.maxAmtOfTxnInSeconds ? checktest(req.body.maxAmtOfTxnInSeconds) : undefined;
  var maxAmtOfTxnInDay = req.body.maxAmtOfTxnInDay ? checktest(req.body.maxAmtOfTxnInDay) : undefined;
  var maxAmtOfTxnInMonth = req.body.maxAmtOfTxnInMonth ? checktest(req.body.maxAmtOfTxnInMonth) : undefined;
  var redeemInBankMin = req.body.redeemInBankMin ? checktest(req.body.redeemInBankMin) : undefined;
  var redeemInBankMax = req.body.redeemInBankMax ? checktest(req.body.redeemInBankMax) : undefined;
  var maxCredit = req.body.maxCredit ? checktest(req.body.maxCredit) : undefined;
  var minCredit = req.body.minCredit ? checktest(req.body.minCredit) : undefined;
  var isnum = /(?<=^| )\d+(\.\d+)?(?=$| )/;
  var letterNumber = /^[0-9]+$/;
  var limitappliedobj = ["common", "entity", "commonEntity"];
  var flag = ["KYC", "nonKYC"];
  var tTypes = ["buy", "redeemCash", "transfer"];
  if (limitapplied === "entity") {
    if ((atruID && atruID.length == 16 && atruID.match(letterNumber)) &&
      (rtruID && rtruID.length === 16 && isnum.test(rtruID))) {
      apicall()
    } else {
      res.json({ status: "411", message: "Please Follow Fields Validation Documentation" })
    }
  } else {
    if ((atruID && atruID.length == 16 && atruID.match(letterNumber))
      && (appliedOn && (appliedOn === "consumer" || appliedOn === "entity"))) {
      apicall()
    } else {
      res.json({ status: "411", message: "Please Follow Fields Validation Documentation" })
    }
  }

  function apicall() {
    if ((KYCFlag && flag.includes(KYCFlag))
      && (tType && tTypes.includes(tType)) && (limitapplied && limitappliedobj.includes(limitapplied)) &&
      (goldMax && isnum.test(goldMax)) && (goldMin && isnum.test(goldMin)) && (silverMax && isnum.test(silverMax)) && (silverMin && isnum.test(silverMin))) {
      if (tType === "redeemCash") {
        if ((txnLimitInSeconds !== "false") && (noOfTxnInSeconds !== "false") && (maxAmtOfTxnInSeconds !== "false") &&
          (maxAmtOfTxnInDay !== "false") && (maxAmtOfTxnInMonth !== "false") && (redeemInBankMin !== "false") &&
          (redeemInBankMax !== "false")) {
          updatetxnlimits();
        } else {
          res.json({ status: "411", message: "Please Follow Fields Validation Documentation" })
        }
      }
      else {
        if ((txnLimitInSeconds !== "false") && (noOfTxnInSeconds !== "false") && (maxAmtOfTxnInSeconds !== "false") &&
          (maxAmtOfTxnInDay !== "false") && (maxAmtOfTxnInMonth !== "false")) {
          updatetxnlimits();
        } else {
          res.json({ status: "411", message: "Please Follow Fields Validation Documentation" })
        }
      }
      function updatetxnlimits() {
        /* var reqUrl = "/api/partnerpermissionupdatelimit";
        if (limitapplied === "self") {
          reqUrl = "/api/partnerpermissionupdatelimitself";
        } */
        var reqUrl;
        var json = {
          "rTruID": req.body.rTruID,
          "truID": atruID,
          "KYCFlag": KYCFlag,
          "appliedOn": appliedOn,
          "limitapplied": limitapplied,
          "tType": tType,
          "goldMax": goldMax,
          "goldMin": goldMin,
          "silverMax": silverMax,
          "silverMin": silverMin,
          "txnInterval": txnLimitInSeconds,
          "noOfTxnInInterval": noOfTxnInSeconds,
          "maxAmtOfTxnInHour": maxAmtOfTxnInSeconds,
          "maxAmtOfTxnInDay": maxAmtOfTxnInDay,
          "maxAmtOfTxnInMonth": maxAmtOfTxnInMonth,
          "redeemInBankMin": redeemInBankMin,
          "redeemInBankMax": redeemInBankMax,
          "maxCredit": maxCredit,
          "minCredit": minCredit
        }
        if (limitapplied === "common" || limitapplied === "commonEntity") {
          reqUrl = "/api/consumerCommontxnupdatelimit";
        } else {
          if (appliedOn == "entity") {
            json.limitapplied = "commonEntity"
          } else {
            json.limitapplied = "common"
          }
          var reqUrl = "/api/partnerpermissionupdatelimit";
          // if (appliedon === "self") {
          //   reqUrl = "/api/partnerpermissionupdatelimitself";
          // }

        }
        console.log("resqurl", reqUrl)
        request.post({
          "headers": { "content-type": "application/json" },
          "url": conf.reqip + ":" + conf.custTxn + reqUrl,
          "body": JSON.stringify(json)
        }, (error, response, body) => {
          if (error) {
            console.log("err", error);
            res.status(500).json({ status: "500", message: "Internal Server Error" });
          } else {
            console.log("body", body)
            var newjson = JSON.parse(body);
            res.json(newjson);
          }
        });
      }
    } else {
      res.json({ status: "401", message: "Field Validation Error...!!!" });
    }
  }

}

exports.threehundredone = function (req, res) {
  var rtruID = req.body.rTruID;
  var atruID = req.body.truID;
  var KYCFlag = req.body.KYCFlag;
  var tType = req.body.tType;
  var appliedOn = req.body.appliedOn;
  var max = req.body.max ? checktest(req.body.max) : undefined;
  var min = req.body.min ? checktest(req.body.min) : undefined;
  var walletLimit = req.body.walletLimit ? checktest(req.body.walletLimit) : undefined;
  var bulContainLimit = req.body.bulContainLimit ? checktest(req.body.bulContainLimit) : undefined;
  var wtbmin = req.body.wtbmin ? checktest(req.body.wtbmin) : undefined;
  var wtbmax = req.body.wtbmax ? checktest(req.body.wtbmax) : undefined;
  var txnLimitInSeconds = req.body.txnLimitInSeconds ? checktest(req.body.txnLimitInSeconds) : undefined;
  var noOfTxnInSeconds = req.body.noOfTxnInSeconds ? checktest(req.body.noOfTxnInSeconds) : undefined;
  var maxAmtOfTxnInSeconds = req.body.maxAmtOfTxnInSeconds ? checktest(req.body.maxAmtOfTxnInSeconds) : undefined;
  var maxAmtOfTxnInDay = req.body.maxAmtOfTxnInDay ? checktest(req.body.maxAmtOfTxnInDay) : undefined;
  var maxAmtOfTxnInMonth = req.body.maxAmtOfTxnInMonth ? checktest(req.body.maxAmtOfTxnInMonth) : undefined;
  var limitapplied = req.body.limitapplied;
  var limitappliedobj = ["entity", "common", "commonEntity"];
  var isnum = /(?<=^| )\d+(\.\d+)?(?=$| )/;
  var letterNumber = /^[0-9]+$/;
  var flag = ["hold", "pending", "banned", "active", "nonKYC", "KYC"];
  var tTypes = ["wallet", "walletToBank", "redeemToBank"];
  if (limitapplied === "entity") {
    if ((atruID && atruID.length == 16 && atruID.match(letterNumber)) &&
      (rtruID && rtruID.length === 16 && isnum.test(rtruID))) {
      apicall()
    } else {
      res.json({ status: "411", message: "Please Follow Fields Validation Documentation" })
    }
  } else {
    if ((atruID && atruID.length == 16 && atruID.match(letterNumber))
      && (appliedOn && appliedOn === "consumer" || appliedOn === "entity")) {
      apicall()
    } else {
      res.json({ status: "411", message: "Please Follow Fields Validation Documentation" })
    }
  }

  function apicall() {
    if ((KYCFlag && flag.includes(KYCFlag)) && (tType && tTypes.includes(tType)) //&& (limitapplied && limitappliedobj.includes(limitapplied))
      && ((max && isnum.test(max)) && (min && isnum.test(min))
        && walletLimit !== "false" && bulContainLimit != "false" && wtbmin !== "false" && maxAmtOfTxnInMonth !== "false" && wtbmax !== "false"
        && txnLimitInSeconds !== "false" && noOfTxnInSeconds !== "false" && maxAmtOfTxnInSeconds !== "false" && maxAmtOfTxnInDay !== "false"
      )) {
      var reqUrl = "/api/partnerpermissionupdateWalletLimit";
      if (limitapplied === "common" || limitapplied === "commonEntity") {
        reqUrl = "/api/consumerCommonWalletupdateLimit";
      }
      request.post({
        "headers": { "content-type": "application/json" },
        "url": conf.reqip + ":" + conf.custTxn + reqUrl,
        "body": JSON.stringify({
          "truID": atruID,
          "rTruID": rtruID,
          "KYCFlag": KYCFlag,
          "appliedOn": appliedOn,
          "limitapplied": "commonEntity",
          "tType": tType,
          "max": max,
          "min": min,
          "walletLimit": walletLimit,
          "bulContainLimit": bulContainLimit,
          "wtbmin": wtbmin,
          "wtbmax": wtbmax,
          "txnInterval": txnLimitInSeconds,
          "noOfTxnInSeconds": noOfTxnInSeconds,
          "maxAmtOfTxnInSeconds": maxAmtOfTxnInSeconds,
          "maxAmtOfTxnInDay": maxAmtOfTxnInDay,
          "maxAmtOfTxnInMonth": maxAmtOfTxnInMonth
        })
      }, (error, response, body) => {
        if (error) {
          console.log("err", error);
          res.status(500).json({ status: "500", message: "Internal Server Error" });
        } else {
          var newjson = JSON.parse(body);
          res.json(newjson);
        }
      })
    } else {
      res.json({ status: "401", message: "Field Validation Error...!!!" });
    }
  }
}

exports.threehundredtwo = function (req, res) {
  var rtruID = req.body.rTruID;
  var isnum = /(?<=^| )\d+(\.\d+)?(?=$| )/;
  if ((rtruID && rtruID.length === 16 && isnum.test(rtruID))) {
    request.post({
      "headers": { "content-type": "application/json" },
      "url": conf.reqip + ":" + conf.custTxn + "/api/partnerloadingrevenue",
      "body": JSON.stringify({
        "rTruID": rtruID,
        "type": req.body.type,
        "appliedOn": req.body.appliedOn
      })
    }, (error, response, body) => {
      if (error) {
        console.log("err", error);
        res.status(500).json({ status: "500", message: "Internal Server Error" });
      } else {
        var newjson = JSON.parse(body);
        res.json(newjson);
      }
    })
  } else {
    res.json({ status: "411", message: "Please Follow Fields Validation Documentation" })
  }

}
exports.threehundredthirty = function (req, res) {
  request.post({
    "headers": { "content-type": "application/json" },
    "url": conf.reqip + ":" + conf.truRates + "/api/stockDailyUpdate",
    "body": JSON.stringify(req.body)
  }, (error, response, body) => {
    if (error) {
      console.log("err", error);
      res.status(500).json({ status: "500", message: "Internal Server Error" });
    } else {
      var newjson = JSON.parse(body);
      res.json(newjson);
    }
  })
}
exports.threehundredthirtyone = function (req, res) {
  request.post({
    "headers": { "content-type": "application/json" },
    "url": conf.reqip + ":" + conf.assetmanagerStock + "/api/updateassetmanagerStock",
    "body": JSON.stringify(req.body)
  }, (error, response, body) => {
    if (error) {
      console.log("err", error);
      res.status(500).json({ status: "500", message: "Internal Server Error" });
    } else {
      var newjson = JSON.parse(body);
      res.json(newjson);
    }
  })
}
exports.threehundredthirtytwo = function (req, res) {
  request.post({
    "headers": { "content-type": "application/json" },
    "url": conf.reqip + ":" + conf.assetmanagerStock + "/api/assetmanagersstockloglist",
    "body": JSON.stringify(req.body)
  }, (error, response, body) => {
    if (error) {
      console.log("err", error);
      res.status(500).json({ status: "500", message: "Internal Server Error" });
    } else {
      var newjson = JSON.parse(body);
      res.json(newjson);
    }
  })
}

exports.threehundredthree = function (req, res) {
  let truid = req.body.truID, letterNumber = /^[0-9]+$/;
  if ((truid && truid.length == 16 && truid.match(letterNumber))) {
    request.post({
      "headers": { "content-type": "application/json" },
      "url": conf.reqip + ":" + conf.custTxn + "/api/getPartnerDetails",
      "body": JSON.stringify(req.body)
    }, (error, response, body) => {
      if (error) {
        return console.dir(error);
      }
      var newjson = JSON.parse(body);
      res.json(newjson);
    })
  } else {
    res.json({ status: "411", message: 'Invalid Request..!!' })
  }
}
exports.threehundredFour = function (req, res) {
  let truid = req.body.truID, letterNumber = /^[0-9]+$/;
  if ((truid && truid.length == 16 && truid.match(letterNumber))) {
    request.post({
      "headers": { "content-type": "application/json" },
      "url": conf.reqip + ":" + conf.custTxn + "/api/countallPeople",
      "body": JSON.stringify(req.body)
    }, (error, response, body) => {
      if (error) {
        return console.dir(error);
      }
      var newjson = JSON.parse(body);
      res.json(newjson);
    })

  } else {
    res.json({ status: "411", message: 'Invalid Request..!!' })
  }
}
exports.threehundredFive = function (req, res) {
  let truid = req.body.truID, letterNumber = /^[0-9]+$/;
  if ((truid && truid.length == 16 && truid.match(letterNumber))) {
    request.post({
      "headers": { "content-type": "application/json" },
      "url": conf.reqip + ":" + conf.custTxn + "/api/bindWalletLog",
      "body": JSON.stringify(req.body)
    }, (error, response, body) => {
      if (error) {
        return console.dir(error);
      }
      var newjson = JSON.parse(body);
      res.json(newjson);
    })

  } else {
    res.json({ status: "411", message: 'Invalid Request..!!' })
  }
}



exports.threehundredSix = function (req, res) {
  let truid = req.body.truID, letterNumber = /^[0-9]+$/;
  if ((truid && truid.length == 16 && truid.match(letterNumber))) {
    request.post({
      "headers": { "content-type": "application/json" },
      "url": conf.reqip + ":" + conf.custTxn + "/api/fetchConsumer",
      "body": JSON.stringify(req.body)
    }, (error, response, body) => {
      if (error) {
        return console.dir(error);
      }
      var newjson = JSON.parse(body);
      res.json(newjson);
    })

  } else {
    res.json({ status: "411", message: 'Invalid Request..!!' })
  }
}


exports.threehundredSeven = function (req, res) {
  let truid = req.body.truID, letterNumber = /^[0-9]+$/;
  if ((truid && truid.length == 16 && truid.match(letterNumber))) {
    request.post({
      "headers": { "content-type": "application/json" },
      "url": conf.reqip + ":" + conf.custTxn + "/api/fetchNode",
      "body": JSON.stringify(req.body)
    }, (error, response, body) => {
      if (error) {
        return console.dir(error);
      }
      var newjson = JSON.parse(body);
      res.json(newjson);
    })

  } else {
    res.json({ status: "411", message: 'Invalid Request..!!' })
  }
}

exports.threehundredEight = function (req, res) {
  let truid = req.body.truID, letterNumber = /^[0-9]+$/;
  if ((truid && truid.length == 16 && truid.match(letterNumber))) {
    request.post({
      "headers": { "content-type": "application/json" },
      "url": conf.reqip + ":" + conf.custTxn + "/api/partnerNodeList",
      "body": JSON.stringify(req.body)
    }, (error, response, body) => {
      if (error) {
        return console.dir(error);
      }
      var newjson = JSON.parse(body);
      res.json(newjson);
    })

  } else {
    res.json({ status: "411", message: 'Invalid Request..!!' })
  }
}

exports.threehundredNine = function (req, res) {
  let truid = req.body.truID, letterNumber = /^[0-9]+$/;
  if ((truid && truid.length == 16 && truid.match(letterNumber))) {
    request.post({
      "headers": { "content-type": "application/json" },
      "url": conf.reqip + ":" + conf.custTxn + "/api/consumerListPartner",
      "body": JSON.stringify(req.body)
    }, (error, response, body) => {
      if (error) {
        return console.dir(error);
      }
      else {
        var newjson = JSON.parse(body);
        res.json(newjson);
      }
    })
  } else {
    res.json({ status: "411", message: 'Invalid Request..!!' })
  }
}

exports.twohundredsixtysix = function (req, res) {
  var rtruID = req.body.rTruID;
  var truID = req.body.truID;
  var fundStatus = req.body.fundStatus;
  var amount = req.body.amount;
  var letterNumber = /^[0-9]+$/;
  var isnum = /(?<=^| )\d+(\.\d+)?(?=$| )/;
  if ((truID && truID.length === 16 && letterNumber.test(truID))
    && (rtruID && rtruID.length === 16 && letterNumber.test(rtruID))
    && (fundStatus)
    && (amount && isnum.test(amount) && parseFloat(amount) > 0)) {
    KycAll.find({ truID: truID }).exec(function (err, result) {
      if (err) {
        res.json({ status: "500", message: "Internal Server Error" });
      } else {
        if (!result.length) {
          res.json({ status: "401", message: "Please check entered TruID" });
        } else {
          request.post({
            "headers": { "content-type": "application/json" },
            "url": conf.reqip + ":" + conf.entityTxn + "/api/addentitywalletfromadmin",
            "body": JSON.stringify({
              "rtruid": rtruID,
              "truID": truID,
              "amount": req.body.amount,
              "UTRNo": req.body.UTRNo,
              "bankName": req.body.bankName,
              "acOrigin": req.body.acOrigin,
              "destinationAC": req.body.destinationAC,
              "mode": req.body.mode,
              "fundStatus": req.body.fundStatus
            })
          }, (error, response, body) => {
            if (error) {
              console.dir(error);
              res.status(500).json({ status: 500, message: "Internal server error" });
            }
            var newjson = JSON.parse(body);
            res.json(newjson);
          })
        }
      }
    })
  } else {
    res.json({ status: "402", message: "Please enter valid fields" });
  }

}