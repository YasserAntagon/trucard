
var express = require('express');
var app = express();
var morgan = require('morgan');
var mongoose = require('mongoose');
var helmet = require('helmet');
app.use(morgan('dev'));
app.use(helmet.hidePoweredBy({ setTo: 'TruAPI' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
var port = process.env.PORT || 4112;

let { connection, mongocon, bindIp } = require('../connection');
mongoose.set("strictQuery", false);
mongoose.connect(mongocon + '/truCust', connection).then(() => {
  console.log(`MongoDB server started`)
}).catch((ex) => {
  console.log(`MongoDB Error`, ex)
});

var router = express.Router();
router.use(function (req, res, next) {
  //console.log('Route Activates and Activity Logged.');
  next();
});
// console.log = function() {}; // Enable when wanted to remove all console.log
var kycroutes = require('./app/routes/KYCRout');
kycroutes(app);

var clientRoutes = require('./app/routes/clientRoute');
clientRoutes(app);

var b2cnewroute = require('./app/routes/b2c.new.route');
b2cnewroute(app);

var kycCheck = require('./app/routes/kycCheck');
kycCheck(app);

var server = app.listen(port, bindIp);
