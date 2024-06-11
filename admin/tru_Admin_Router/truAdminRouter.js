
// call the packages we need
var express    = require('express'); 
var app        = express();
var morgan     = require('morgan');
var mongoose   = require('mongoose'); 
var helmet = require('helmet');  
var app = express();
app.use(morgan('dev')); 
app.use(express.json());
app.use(helmet.hidePoweredBy({ setTo: 'TruAPI' }));
var port     = process.env.PORT || 5113; 
let { connection, mongocon, bindIp } = require('../connection');
mongoose.set("strictQuery", false);
mongoose.connect(mongocon + '/truAdmin', connection).then(() => {
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

var kycroutes = require('./app/routes/rout');
kycroutes(app);

var truCoinRoute = require('./app/routes/truCoinRoute');
truCoinRoute(app);

var partnerNewRoute = require('./app/routes/partnerNewRoute');
partnerNewRoute(app);
 

app.listen(port, bindIp); 
console.log('Admin Port Active at : ' + port);
