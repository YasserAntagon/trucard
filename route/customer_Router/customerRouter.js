// call the packages we need
var express = require('express');
 
var useragent = require('express-useragent');
var app = express();
var morgan = require('morgan');
var helmet = require('helmet');  
app.use(useragent.express());
var ipdenied = require('./app/ipdenied');
// app.use(ipdenied);
app.use(morgan('dev'));

app.use(helmet.hidePoweredBy({ setTo: 'TruAPI' }));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

var port = process.env.PORT || 3113;

var router = express.Router();
// console.log = function() {}; // Enable when wanted to remove all console.log

router.use(function (req, res, next) {
    console.log('Route Activates and Activity Logged.');
    next();
});


function errorHandler(err, req, res, next) { 
    if (res.headersSent) {
        return next(err)
    }
    console.log(err)
    res.status(503).json({ status: "503", message: "Something Went Wrong!!" })
}

var kycroutes = require('./app/routes/routes');
kycroutes(app);

var kycroutesb2c = require('./app/routes/newB2CRoutes');
kycroutesb2c(app);

var dataFromAdmin = require('./app/routes/dataFromAdmin');
dataFromAdmin(app);


app.use(function(req, res, next) {     
    res.status(404).json({status:500, message:'Unable to find the requested resource!'});
});

app.listen(port);
app.use(errorHandler)
console.log('Consumer Port Active at : ' + port);
