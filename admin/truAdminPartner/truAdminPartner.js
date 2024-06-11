
// call the packages we need
var express = require('express');
var app = express();
var morgan = require('morgan');
var helmet = require('helmet');
var mongoose = require('mongoose');
var app = express();
app.use(morgan('dev'));
app.use(express.json());
app.use(helmet.hidePoweredBy({ setTo: 'TruAPI' }));
var port = process.env.PORT || 5115;
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

var salesRoute = require('./app/routes/salesRoute');
salesRoute(app);


app.listen(port, bindIp);
console.log('Admin Port Active at : ' + port);
