'use strict';

var ip = require('ip');
/**
* To test locally add '::1/32' or '127.0.0.1/32' to the list.
*/
var trafficManagerIPs = [];

module.exports = function (req, res, next) {
    var invalidMasheryIP = true;
    let reqIp = req.connection.remoteAddress || req.headers['x-forwarded-for'];
    reqIp = reqIp.toString().replace('::ffff:', '');
    for (var i = 0, len = trafficManagerIPs.length; i < len; i++) {

        if (ip.cidrSubnet(trafficManagerIPs[i]).contains(reqIp)) {
            invalidMasheryIP = false;
            next();
        }
    }
    if (invalidMasheryIP) {
        console.log(`An unauthorized IP address ${reqIp} has tried to access the service`);
        res.status(403).end();
    }
};