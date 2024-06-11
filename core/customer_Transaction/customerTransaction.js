
var express = require('express'); 
var app = express();
var morgan = require('morgan');
var mongoose = require('mongoose'); 
var helmet = require('helmet');
app.use(morgan('dev'));
app.use(helmet.hidePoweredBy({ setTo: 'TruAPI' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

var port = process.env.PORT || 4114;
const dotenv = require('dotenv');
dotenv.config();

global.useToFixed = function(value, num) {
  var fto = num ? num : 10;
  return parseFloat(value.toFixed(fto)); 
}
let { connection, mongocon, bindIp } = require('../connection');
mongoose.set("strictQuery", false);
mongoose.connect(mongocon + '/truCust', connection).then(() => {
  console.log(`MongoDB server started`)
}).catch((ex) => {
  console.log(`MongoDB Error`, ex)
});
var router = express.Router(); 
router.use(function (req, res, next) {
  console.log('Route Activates and Activity Logged.');
  next();
});


var kycroutes = require('./app/routes/KYCRout');
kycroutes(app);

var clientRoute = require('./app/routes/clientRoute');
clientRoute(app);

var transactionRoutes = require('./app/routes/transactionRoutes');
transactionRoutes(app);

var validationRoutes = require('./app/routes/validationRoutes');
validationRoutes(app);

var server = app.listen(port, bindIp);
console.log('Consumer Port Active at : ' + port);
