
var express    = require('express');
 
var app        = express();
var morgan     = require('morgan');
var mongoose   = require('mongoose');
var helmet = require('helmet'); 
app.use(morgan('dev'));

app.use(helmet.hidePoweredBy({ setTo: 'TruAPI' }));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

var port     = process.env.PORT || 4125;
let { connection, mongocon, bindIp } = require('../connection');
mongoose.set("strictQuery", false);
mongoose.connect(mongocon + '/truCommon', connection).then(() => {
  console.log(`MongoDB server started`)
}).catch((ex) => {
  console.log(`MongoDB Error`, ex)
});
var router = express.Router();
// console.log = function() {}; // Enable when wanted to remove all console.log
router.use(function(req, res, next) {
    console.log('Route Activates and Activity Logged.');
    next();
});
global.useToFixed = function(value, num) {
  var fto = num ? num : 10;
  return parseFloat(value.toFixed(fto)); 
}
var kycroutes = require('./app/routes/route');
kycroutes(app);
var liverateRoute = require('./app/routes/liverateRoute');
liverateRoute(app);

var server = app.listen(port,bindIp);
console.log('Consumer Port Active at : ' + port);
