//@description Server configuration file for incomig requests from client(server.js).
// call the packages we need
var express = require('express');

var app = express();
var morgan = require('morgan');
var helmet = require('helmet');
var http = require('http');
var https = require('https');
var randomize = require('randomatic');
var ipdenied = require('./app/ipdenied');
// app.use(ipdenied);


app.use(morgan('dev')); // log requests to the console



app.use(helmet.hidePoweredBy({ setTo: 'TruAPI' }));

// configure body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
var port = 3116; // set our port
// create our router
var router = express.Router();
// middleware to use for all requests
router.use(function (req, res, next) {
    console.log('Route Activates and Activity Logged.');
    next();
});

//Importing Routs for the Operation which directs to controller which is having actions
var kycroutes = require('./app/routes/routes');
kycroutes(app);


app.listen(port, '::ffff:127.0.0.1');                         //open to public requests
//https.createServer(options, app).listen(port);
//http.createServer(function (req, res){}).listen(port);
console.log('Consumer Port Active at : ' + port);
