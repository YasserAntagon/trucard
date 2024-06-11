var createError = require('http-errors');
var express = require('express');
var path = require('path');

var logger = require('morgan');
const hbs = require('hbs'); 
var onboarding=require('./routes/onboarding');
var verifyEmail = require('./routes/verifyEmail'); 
var invoice = require('./routes/invoice');
var message=require('./routes/message');
var pageServer=require('./routes/pageServer');
var sendEmail=require('./routes/sendEmail'); 
var emailLog=require('./routes/emailLog'); 
var addMoney=require('./routes/addMoney'); 
var withdrawMoney=require('./routes/withdrawMoney'); 
var kycActivation=require('./routes/kycActivation'); 
var Handlebars =  require('handlebars');
var ipdenied = require('./config/ipdenied');
var app = express();
// app.use(ipdenied);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');
app.set("view engine", "hbs");
hbs.registerHelper("if_eql", function (a, b, opts) {
  if (a == b) {
    return opts.fn(this)
  } else {
    return opts.inverse(this)
  }
});
hbs.registerHelper("if_noteql", function (a, b, opts) {
  if (a != b) {
    return opts.fn(this)
  } else {
    return opts.inverse(this)
  }
});
hbs.registerHelper('breaklines', function(text) {
  text = Handlebars.Utils.escapeExpression(text);
  text = text.replace(/(\r\n|\n|\r)/gm, '<br>');
  return new Handlebars.SafeString(text);
});
app.use(logger('dev'));

global.inr = function(value) {
  return "₹ "
}

/* app.use(express.json());
app.use(express.urlencoded({
  limit: '5mb',
  extended: false
})); */
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use(express.json({limit: '5mb'}));
app.use(express.urlencoded({extended: false,limit: '5mb'}));
//app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', onboarding) 
app.use('/', verifyEmail);  
app.use('/', invoice)
app.use('/', message)
app.use('/', pageServer)   
app.use('/', sendEmail) 
app.use('/', emailLog) 
app.use('/', addMoney) 
app.use('/', withdrawMoney) 
app.use('/', kycActivation) 
app.use('/', withdrawMoney)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
