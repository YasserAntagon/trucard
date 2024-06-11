var express = require('express');
var path = require('path');
var helmet = require('helmet');
var morgan = require('morgan');
var app = express();
var indexRouter = require("./app/routes/index");
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const dotenv = require('dotenv');
dotenv.config();
app.use(morgan('dev'));
app.use(helmet.hidePoweredBy({ setTo: ' API' }));
app.use(express.static(path.join(__dirname, 'public/')));
app.use('/', indexRouter);
var kycroutes = require('./app/routes/routes');
kycroutes(app);
module.exports = app;