
// call the packages we need
var express = require('express');
var app = express();
var morgan = require('morgan');
var mongoose = require('mongoose');
var helmet = require('helmet'); 
var ipdenied = require('./app/ipdenied');
var app = express();
app.use(morgan('dev'));
app.use(express.json());

app.use(helmet.hidePoweredBy({ setTo: 'TruAPI' }));
var port = process.env.PORT || 5114;
//var clearCache = require('./app/services/cache')
global.useToFixed = function (value) {
  return parseFloat(value.toFixed(12));
}
 
let { connection, mongocon, bindIp } = require('../connection');
mongoose.set("strictQuery", false);
mongoose.connect(mongocon + '/truAdmin', connection).then(() => {
  console.log(`MongoDB server started`)
}).catch((ex) => {
  console.log(`MongoDB Error`, ex)
});
var router = express.Router();
router.use(function (req, res, next) {
  console.log('Route Activates and Activity Logged.');
  next();
});

var consumerroute = require('./app/routes/consumerRoute');
consumerroute(app);
var entityroute = require('./app/routes/entityRoute');
entityroute(app);
var trurateroute = require('./app/routes/truRateRoute');
trurateroute(app);
var assetmanagerroute = require('./app/routes/assetmanagerRoute');
assetmanagerroute(app);

var assetstoreroute = require('./app/routes/assetstoreRoute');
assetstoreroute(app);
var rateRoute = require('./app/routes/rateRoute');
rateRoute(app);

var ptSummaryRoute = require('./app/routes/ptSummaryRoute');
ptSummaryRoute(app);

var coSummaryRoute = require('./app/routes/coSummaryRoute');
coSummaryRoute(app);
 
app.listen(port,bindIp);
console.log('Admin Port Active at : ' + port);
