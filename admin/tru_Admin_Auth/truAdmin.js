
var express    = require('express');
 
var app        = express();
var morgan     = require('morgan');
var mongoose   = require('mongoose'); 
var helmet = require('helmet'); 


var ipdenied = require('./app/ipdenied');
// app.use(ipdenied); 
app.use(morgan('dev')); 


app.use(helmet.hidePoweredBy({ setTo: 'TruAPI' }));

// configure body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

var port     = process.env.PORT || 5112; 
let { connection, mongocon, bindIp } = require('../connection');
mongoose.set("strictQuery", false);
mongoose.connect(mongocon + '/truAdmin', connection).then(() => {
  console.log(`MongoDB server started`)
}).catch((ex) => {
  console.log(`MongoDB Error`, ex)
});
// create our router
var router = express.Router();
// console.log = function() {}; // Enable when wanted to remove all console.log


router.use(function(req, res, next) {
    
    console.log('Route Activates and Activity Logged.');
    next();
});

var kycroutes = require('./app/routes/rout');
kycroutes(app);


app.listen(port, bindIp);
console.log('Consumer Port Active at : ' + port);
