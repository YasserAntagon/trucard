var createError = require('http-errors');
var express = require('express');
const helmet = require('helmet');
var path = require('path'); 
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');
const redis = require('redis');
const client = redis.createClient({
  url: "redis://127.0.0.1:6379"
});

client.on('connect', () => console.log('::>  Redis Client Connected'));
client.on('error', (err) => console.log('<::  Redis Client Error', err));
const redisStore = require('connect-redis')(session);
var assetstoreList = require('./routes/assetstore/assetstoreList');
// admin
var indexRouter = require('./routes/index');
var adminUrl = require('./routes/adminUrl');
var login = require('./routes/admin/login');
var companyData = require('./routes/admin/companyData');
var employeeReg = require('./routes/admin/employeeReg');
var dash = require('./routes/admin/dashboard');
var LBMA = require('./routes/admin/LBMA');
var Charges = require('./routes/admin/Charges');
var errorLogList = require('./routes/admin/errorLogList'); 
var adminFileupload = require('./routes/fileupload');
var profile = require('./routes/admin/profile'); 
var sendEmail = require('./routes/admin/sendEmail');
var refundStatus = require('./routes/admin/refundStatus');
var verifyOTP = require('./routes/admin/verifyOTP'); 

// Consumer
var cRouter = require('./routes/consumerUrl');
var chartData = require('./routes/consumer/chartData');
var configuration = require('./routes/consumer/configuration');
var consumerDB = require('./routes/consumer/consumerDB');
var consumerList = require('./routes/consumer/consumerList');
var consumerActive = require('./routes/consumer/consumerActive');
var consumerListWF = require('./routes/consumer/consumerListWF');

// AssetManager  
var assetmanagerList = require('./routes/assetmanager/assetmanagerList');
var assetmanagerDB = require('./routes/assetmanager/assetmanagerDB');


// entity 
var eRouter = require('./routes/entityUrl');
var eConsumer = require('./routes/entity/eConsumer');
var eEntity = require('./routes/entity/eEntity');
var entityAccess = require('./routes/entity/entityAccess');
var entityDB = require('./routes/entity/entityDB');
var entityList = require('./routes/entity/entityList');
var entityWallet = require('./routes/entity/entityWallet');
var summaryExc = require('./routes/entity/summaryExc');
var walletSummaryWF = require('./routes/entity/walletSummaryWF');
var balances = require('./routes/entity/balances');
var eFileUpload = require('./routes/entity/eFileUpload');


var app = express();
app.use(helmet.hidePoweredBy({
  setTo: 'CompanyAdmin'
}));
app.use(helmet.dnsPrefetchControl());
app.use(helmet.expectCt());
app.use(helmet.frameguard());
app.use(helmet.hsts());
app.use(helmet.ieNoOpen());
app.use(helmet.noSniff());
app.use(helmet.permittedCrossDomainPolicies());
app.use(helmet.referrerPolicy());
app.use(helmet.xssFilter());
app.use(helmet({
  dnsPrefetchControl: {
    allow: true
  },
  contentSecurityPolicy: false
}));
// view engine setup
//app.locals.db = db;
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(cookieParser());
const dotenv = require('dotenv');
dotenv.config();
app.use(session({
  store: new redisStore({ client: client }),
  secret: "~*Lallan666TOP*~",
  resave: false,
  saveUninitialized: false,
  cookie: {
    sameSite: false,
    secure: process.env.NODE_ENV === 'dev' ? false : true,
    httpOnly: process.env.NODE_ENV === 'dev' ? false : true,
    maxAge: 1000 * 60 * 60 // 24H
  }
}))
/* app.use(cookieSession({
  key: 'user_sid_admin',
  secret: '~*Lallan666TOP*~',
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: 600000
  }
})) */

/* 
if (process.env.NODE_ENV == "production") {
  app.use(express.static(path.join(__dirname, 'private/')));
} else if (process.env.NODE_ENV == "stagging") {
  app.use(express.static(path.join(__dirname, 'private/')));
} else { */
app.use(express.static(path.join(__dirname, 'public/')));
/* } */

app.get("/a3b74f27304cd8d44a8064", (req, res) => {
  if (req.session.image) {
    res.sendFile(path.resolve(__dirname, "./assetstoreProf/7000172734633128.png"))
  }
});
// admin
app.use('/', indexRouter);
app.use('/', adminUrl);
app.use('/dash', dash);
app.use('/login', login)
app.use('/companyData', companyData)
app.use('/employeeReg', employeeReg)
app.use('/LBMA', LBMA);
app.use('/charges', Charges);
app.use('/errorLogList', errorLogList);  
app.use('/sendEmail', sendEmail);
app.use('/refundStatus', refundStatus);
app.use('/verifyOTP', verifyOTP);
app.use('/adminFileupload', adminFileupload);
app.use('/profile', profile); 

// consumer
app.use('/', cRouter);
app.use('/chartData', chartData)
app.use('/configuration', configuration)
app.use('/consumerDB', consumerDB)
app.use('/consumerList', consumerList)
app.use('/consumerActive', consumerActive)
app.use('/consumerListWF', consumerListWF);
// AssetManager 
app.use('/assetmanagerList', assetmanagerList); 
app.use('/assetmanagerDB', assetmanagerDB);

// Entity
app.use('/', eRouter);
app.use('/eConsumer', eConsumer);
app.use('/eEntity', eEntity);
app.use('/entityAccess', entityAccess);
app.use('/entityDB', entityDB);
app.use('/entityList', entityList);
app.use('/entityWallet', entityWallet);
app.use('/summaryExc', summaryExc);
app.use('/walletSummaryWF', walletSummaryWF);
app.use('/balances', balances);
app.use('/eFileUpload', eFileUpload);

app.use('/assetstoreList', assetstoreList);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  if (process.env.NODE_ENV === 'dev') {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'dev' ? err : {};
    // render the error page
    res.status(err.status || 500);
    res.render('error', {
      errcode: err.status ? err.status : "500",
      errMsg: err.message
    });
  } else {
    res.status(err.status || 500);
    res.render('error', {
      errMsg: "Internal Server error",
      errcode: "500"
    });
  }
});
module.exports = app;