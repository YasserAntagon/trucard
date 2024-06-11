var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var app = express();
const dotenv = require('dotenv');
dotenv.config(); 

// b2c web 
var addMoneyB2CWEB = require('./routes/B2C/AddMoneyB2CWEB');
var txnB2CWEB = require('./routes/B2C/TxnB2CWEB');

//b2b web
var addMoneyB2BWEB = require('./routes/B2B/AddMoneyB2BWEB'); 
 
//Atom
var atomresponse = require('./routes/atomresponse');

//Refund Payment
var refundPayment = require('./routes/refundPayment');

//KYC verification API
var verifyUser = require('./routes/KYC/verifyUser');



app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public/')));
 
//b2c Web 
app.use('/addMoneyB2CWEB', addMoneyB2CWEB);
app.use('/txnB2CWEB', txnB2CWEB);

//b2b Web
app.use('/addMoneyB2BWEB', addMoneyB2BWEB); 

//Atom Payment
app.use('/atom', atomresponse);

//Refund Payment
app.use('/api', refundPayment);
app.use('/api', verifyUser);

//Payout API
var payout = require('./routes/payoutRoutes');
payout(app);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'dev' ? err : {};
  res.render('error', { errMsg: err.message, error: err.NotFoundError, errcode: "404" });
});

module.exports = app;