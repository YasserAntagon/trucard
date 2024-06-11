
// call the packages we need
var express = require('express');

var app = express();
var morgan = require('morgan');
var helmet = require('helmet');
var ifsc = require('ifsc');
const fs = require('fs');
const path = require('path');
const dbCon = require('./db/query');

app.use(morgan('dev')); // log requests to the console

app.use(helmet.hidePoweredBy({ setTo: 'TruAPI' }));
var ipdenied = require('./ipdenied');
//app.use(ipdenied);

// configure body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

var port = process.env.PORT || 3119; // set our port

app.post("/getCity", function (req, res, next) {
    var pincode = req.body.pincode;
    if (pincode && pincode.length == 6) {
        dbCon.findR({
            "COUNTRY": "IN",
            "POSTAL_CODE": pincode
        }, function (body) {
            if (body.length > 1) {
                let dist = [];
                dist.push(Array.from(new Set(body.map(elem => elem.COMMUNITY)))
                    .map(community => {
                        return {
                            "Tahsil": community,
                            "Country": "India",
                            "District": body.find(s => s.COMMUNITY === community).COUNTY,             //elem.COUNTY,
                            "LATITUDE": body.find(s => s.COMMUNITY === community).LATITUDE,
                            "LONGITUDE": body.find(s => s.COMMUNITY === community).LONGITUDE,
                            "State": body.find(s => s.COMMUNITY === community).STATE,
                            "Pincode": body.find(s => s.COMMUNITY === community).POSTAL_CODE
                        }
                    }))
                res.json({
                    status: 200,
                    resource: dist[0]
                })
            }
            else {
                res.json({
                    status: 204,
                    message: "No data"
                })
            }
        })
    }
    else {
        res.json({
            status: 205,
            message: "Please follow field validation."
        })
    }
    // res.send("hello World")
    //     
})
app.post("/getifsc", function (req, res, next) {
    if (ifsc.validate(req.body.ifsc)) {
        ifsc.fetchDetails(req.body.ifsc).then(function (resw) {
            res.json({
                status: "200", 
                resource: resw
            })
        });
    }
    else {
        res.json({
            status: "401",
            message: "Invalid Request"
        })
    }
});
//app.listen(port);
var server = app.listen(port, "0.0.0.0");
console.log('server running at: ' + port);
